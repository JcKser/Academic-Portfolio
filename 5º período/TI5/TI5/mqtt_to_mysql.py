"""
Bridge MQTT -> MySQL (HiveMQ)
- Subscribes to MQTT topics, parses JSON payloads,
- Buffers rows and inserts in batches into MySQL 8.x
- Resilient: reconnects to DB and MQTT; graceful shutdown

Tunable variables are controlled via .env.

Assumed topic pattern: sensors/<device_id>/telemetry
Payload example: {"temp": 26.4, "hum": 61.2, "rain": false}
"""

import os
import json
import ssl
import time
import queue
import signal
import logging
import threading
from datetime import datetime
from typing import Optional, Tuple
from pathlib import Path

# ------------- .env -------------
from dotenv import load_dotenv, find_dotenv
# Carrega o .env do diretório atual (ou acima) — NÃO use "dot.env"
load_dotenv(find_dotenv(usecwd=True))

import paho.mqtt.client as mqtt
import mysql.connector

load_dotenv(dotenv_path=Path(r"./dot.env")) # ---------------------------- # Load config # ---------------------------- 
print("DEBUG MYSQL_USER:", os.getenv("MYSQL_USER")) 
print("DEBUG MYSQL_PASSWORD:", os.getenv("MYSQL_PASSWORD"))

MQTT_HOST = os.getenv("MQTT_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
MQTT_TOPIC_FILTER = os.getenv("MQTT_TOPIC_FILTER", "sensors/+/telemetry")
MQTT_CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "bridge-mqtt-mysql")
MQTT_TLS_ENABLED = os.getenv("MQTT_TLS_ENABLED", "false").lower() == "true"

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_DB = os.getenv("MYSQL_DB", "iotdb")
MYSQL_USER = os.getenv("MYSQL_USER", "iotuser")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "password")
MYSQL_TLS_ENABLED = os.getenv("MYSQL_TLS_ENABLED", "false").lower() == "true"
MYSQL_SSL_CA = os.getenv("MYSQL_SSL_CA", "") or None
MYSQL_VERIFY_CERT = os.getenv("MYSQL_VERIFY_CERT", "true").lower() == "true"

BATCH_SIZE = int(os.getenv("BATCH_SIZE", "50"))        # tunable
BATCH_SECONDS = float(os.getenv("BATCH_SECONDS", "2")) # tunable
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
DEVICE_ID_FROM_TOPIC = os.getenv("DEVICE_ID_FROM_TOPIC", "true").lower() == "true"

logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("mqtt-bridge")

# ----------------------------
# Globals
# ----------------------------
stop_event = threading.Event()
msg_queue: "queue.Queue[Tuple[str, bytes]]" = queue.Queue(maxsize=10000)

# ----------------------------
# Helpers
# ----------------------------
def extract_device_id(topic: str) -> str:
    """Extract device_id when topic is sensors/<device>/telemetry."""
    if not DEVICE_ID_FROM_TOPIC:
        return "unknown"
    parts = topic.split("/")
    if len(parts) >= 3 and parts[0] == "sensors" and parts[-1] == "telemetry":
        return parts[1]
    return "unknown"

def parse_payload(topic: str, payload_bytes: bytes) -> Optional[dict]:
    """Parse JSON payload and normalize fields. Returns dict or None."""
    try:
        payload = json.loads(payload_bytes.decode("utf-8"))
        record = {
            "device_id": extract_device_id(topic),
            "topic": topic,
            "temperature_c": float(payload.get("temp")) if "temp" in payload else None,
            "humidity_pct": float(payload.get("hum")) if "hum" in payload else None,
            "raining": bool(payload.get("rain")) if "rain" in payload else None,
            "payload_json": payload,
            # MySQL DATETIME é naive; armazenamos UTC (sem tzinfo)
            "received_at": datetime.utcnow(),
        }
        return record
    except Exception as e:
        logger.warning(f"Invalid payload on topic {topic}: {e}")
        return None

def mysql_connect():
    """Open a new MySQL connection with optional TLS."""
    conn_kwargs = dict(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        database=MYSQL_DB,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        autocommit=False,
        connection_timeout=5,
    )
    if MYSQL_TLS_ENABLED:
        ssl_args = {}
        if MYSQL_SSL_CA:
            ssl_args["ssl_ca"] = MYSQL_SSL_CA
        ssl_args["ssl_verify_cert"] = bool(MYSQL_VERIFY_CERT)
        conn_kwargs.update(ssl_args)
    return mysql.connector.connect(**conn_kwargs)

def insert_batch(conn, rows):
    """Insert a batch using executemany and log confirmation."""
    if not rows:
        return 0

    sql = """
        INSERT INTO iot_readings
            (device_id, topic, temperature_c, humidity_pct, raining, payload_json, received_at)
        VALUES
            (%s, %s, %s, %s, %s, CAST(%s AS JSON), %s)
    """
    data = [
        (
            r["device_id"],
            r["topic"],
            r["temperature_c"],
            r["humidity_pct"],
            r["raining"],
            json.dumps(r["payload_json"]),
            r["received_at"],
        )
        for r in rows
    ]
    with conn.cursor() as cur:
        cur.executemany(sql, data)
        affected = cur.rowcount
    conn.commit()

    # Confirmação explícita: mostra a última linha inserida
    try:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(
                """
                SELECT id, device_id, topic, temperature_c, humidity_pct, raining, received_at
                FROM iot_readings
                ORDER BY id DESC
                LIMIT 1
                """
            )
            last = cur.fetchone()
        logger.info(f"Inserted {affected} row(s). Last row: {last}")
    except Exception as e:
        logger.debug(f"Post-insert fetch failed (non-fatal): {e}")

    return affected

# ----------------------------
# Worker: consumes queue -> DB
# ----------------------------
def worker_loop():
    logger.info("DB worker started")
    conn = None
    last_flush = time.time()
    buffer = []

    while not stop_event.is_set():
        try:
            # Ensure DB connection
            if conn is None or not conn.is_connected():
                try:
                    conn = mysql_connect()
                    logger.info("Connected to MySQL")
                except mysql.connector.Error as e:
                    logger.error(f"MySQL connect error: {e}")
                    time.sleep(2)
                    continue

            # Pull message (timeout allows periodic flush)
            try:
                topic, payload = msg_queue.get(timeout=0.5)
                # Log de recebimento (útil p/ diagnosticar)
                try:
                    logger.debug(f"Enqueued: topic={topic} payload={payload.decode('utf-8', 'ignore')}")
                except Exception:
                    logger.debug(f"Enqueued: topic={topic} payload=<binary {len(payload)} bytes>")
                rec = parse_payload(topic, payload)
                if rec:
                    buffer.append(rec)
            except queue.Empty:
                pass

            should_flush = (
                len(buffer) >= BATCH_SIZE or
                (buffer and (time.time() - last_flush) >= BATCH_SECONDS)
            )

            if should_flush:
                try:
                    n = insert_batch(conn, buffer)
                    logger.debug(f"Batch flush OK ({n} rows).")
                    buffer.clear()
                    last_flush = time.time()
                except mysql.connector.Error as e:
                    logger.error(f"MySQL insert error: {e}")
                    try:
                        conn.rollback()
                    except Exception:
                        pass
                    try:
                        conn.close()
                    except Exception:
                        pass
                    conn = None
                    time.sleep(1)

        except Exception as e:
            logger.exception(f"Worker loop error: {e}")
            time.sleep(1)

    # Final flush on shutdown
    if buffer:
        try:
            if conn is None or not conn.is_connected():
                conn = mysql_connect()
            n = insert_batch(conn, buffer)
            logger.info(f"Final flush inserted {n} row(s)")
        except Exception as e:
            logger.error(f"Final flush error: {e}")
    if conn:
        try:
            conn.close()
        except Exception:
            pass
    logger.info("DB worker stopped")

# ----------------------------
# MQTT callbacks
# ----------------------------
def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        logger.info("Connected to MQTT broker")
        client.subscribe(MQTT_TOPIC_FILTER, qos=1)
        logger.info(f"Subscribed to: {MQTT_TOPIC_FILTER}")
    else:
        logger.error(f"MQTT connect failed: rc={reason_code}")

def on_disconnect(client, userdata, reason_code, properties=None):
    logger.warning(f"Disconnected from MQTT: rc={reason_code}")

def on_message(client, userdata, msg):
    try:
        msg_queue.put_nowait((msg.topic, msg.payload))
    except queue.Full:
        logger.error("Message queue full; dropping message")

# ----------------------------
# Main
# ----------------------------
def main():
    # Start DB worker
    t = threading.Thread(target=worker_loop, daemon=True)
    t.start()

    # MQTT client (v3.1.1 para manter clean_session)
    client = mqtt.Client(
        client_id=MQTT_CLIENT_ID,
        clean_session=True,
        protocol=mqtt.MQTTv311
    )
    if MQTT_USERNAME and MQTT_PASSWORD:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    if MQTT_TLS_ENABLED:
        context = ssl.create_default_context()
        client.tls_set_context(context)

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    # Connect with basic backoff
    backoff = 1
    while not stop_event.is_set():
        try:
            client.connect(MQTT_HOST, MQTT_PORT, keepalive=30)
            break
        except Exception as e:
            logger.error(f"MQTT connect error: {e}; retrying in {backoff}s")
            time.sleep(backoff)
            backoff = min(backoff * 2, 30)

    client.loop_start()

    # Graceful shutdown
    def handle_sig(*_):
        stop_event.set()
    signal.signal(signal.SIGINT, handle_sig)
    signal.signal(signal.SIGTERM, handle_sig)

    while not stop_event.is_set():
        time.sleep(0.5)

    client.loop_stop()
    client.disconnect()
    logger.info("Shutdown complete")

if __name__ == "__main__":
    main()
