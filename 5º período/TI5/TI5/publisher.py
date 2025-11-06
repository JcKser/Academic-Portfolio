"""
MQTT Publisher (HiveMQ Cloud) – robust, with QoS and loop mode.

Tunable variables (can also be passed via CLI):
- --host        MQTT broker host (HiveMQ Cloud)
- --port        8883 for TLS
- --username    MQTT username
- --password    MQTT password
- --topic       Topic to publish to (e.g., sensors/dev01/telemetry)
- --qos         0 or 1 (use 1 for at-least-once)
- --interval    Seconds between messages in loop mode
- --count       How many messages to send (default 1; set 0 for infinite loop)
- --retain      Retain flag (default False)
- --insecure    Skip TLS certificate verification (NOT recommended)

Examples:
  Single message:
    python publisher.py --topic sensors/dev01/telemetry

  Loop (1 msg/5s, 20 mensagens total):
    python publisher.py --topic sensors/dev01/telemetry --count 20 --interval 5

  Infinite loop (Ctrl+C to stop):
    python publisher.py --topic sensors/dev01/telemetry --count 0 --interval 5
"""
import argparse
import json
import random
import ssl
import sys
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt


def build_payload(device_id: str):
    """Generate a realistic telemetry payload. Edit as needed."""
    return {
        "device_id": device_id,
        "temp": round(24.0 + random.random() * 4.0, 2),
        "hum": round(55.0 + random.random() * 10.0, 2),
        "rain": False,
        "ts": datetime.now(timezone.utc).isoformat()
    }


def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        print("[OK] Connected to broker.")
    else:
        print(f"[ERR] Connect failed: rc={reason_code}")


def on_publish(client, userdata, mid):
    # Called when a message that was to be sent using the publish() call has completed transmission to the broker.
    print(f"[OK] Published mid={mid}")


def main():
    parser = argparse.ArgumentParser()
    # --- Defaults based on your message ---
    parser.add_argument("--host", default="becea991993d4ec5be32288c97359f18.s1.eu.hivemq.cloud")
    parser.add_argument("--port", type=int, default=8883)
    parser.add_argument("--username", default="CaioD")
    parser.add_argument("--password", default="12345678Ca")
    parser.add_argument("--topic", default="sensors/dev01/telemetry")
    parser.add_argument("--device", default="dev06")
    parser.add_argument("--qos", type=int, choices=[0, 1], default=1)  # QoS 1 recommended
    parser.add_argument("--retain", action="store_true", default=False)
    parser.add_argument("--interval", type=float, default=0.0)  # seconds; 0 = single message unless --count=0
    parser.add_argument("--count", type=int, default=1)         # 1 = single-shot; 0 = infinite
    parser.add_argument("--insecure", action="store_true", help="Skip TLS certificate verification (NOT recommended)")
    args = parser.parse_args()

    # --- MQTT client setup ---
    client = mqtt.Client(client_id=f"publisher-{args.device}-{int(time.time())}", protocol=mqtt.MQTTv311)
    client.username_pw_set(args.username, args.password)

    # TLS settings
    if args.insecure:
        client.tls_set(tls_version=ssl.PROTOCOL_TLS_CLIENT)
        client.tls_insecure_set(True)
        print("[WARN] TLS certificate verification is DISABLED.")
    else:
        client.tls_set(cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLS_CLIENT)

    client.on_connect = on_connect
    client.on_publish = on_publish

    # Connect
    try:
        client.connect(args.host, args.port, keepalive=60)
    except Exception as e:
        print(f"[ERR] Could not connect: {e}")
        sys.exit(1)

    client.loop_start()

    def publish_once():
        payload = build_payload(args.device)
        # Ensure valid JSON
        data = json.dumps(payload, ensure_ascii=False)
        info = client.publish(args.topic, data, qos=args.qos, retain=args.retain)
        # wait_for_publish blocks until the message has been sent
        info.wait_for_publish(timeout=10.0)
        if not info.is_published():
            print("[ERR] Publish timed out.")
        else:
            print(f"[SEND] topic={args.topic} qos={args.qos} retain={args.retain} payload={data}")

    try:
        if args.count == 0:  # infinite loop
            if args.interval <= 0:
                args.interval = 5.0  # sensible default
            while True:
                publish_once()
                time.sleep(args.interval)
        elif args.count == 1:
            publish_once()
        else:
            if args.interval <= 0:
                args.interval = 1.0
            for _ in range(args.count):
                publish_once()
                time.sleep(args.interval)
    except KeyboardInterrupt:
        pass
    finally:
        client.loop_stop()
        client.disconnect()
        print("[DONE] Disconnected.")


if __name__ == "__main__":
    main()
