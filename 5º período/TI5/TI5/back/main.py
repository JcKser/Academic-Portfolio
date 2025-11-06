from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from pydantic import BaseModel
import json, os, ssl, threading, queue, time
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient

MQTT_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))
MQTT_USER = os.getenv("MQTT_USERNAME")
MQTT_PASS = os.getenv("MQTT_PASSWORD")
DEFAULT_DEVICE_ID = os.getenv("DEFAULT_DEVICE_ID", "dev06")

INFLUX_URL = os.getenv("INFLUX_URL")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN")
INFLUX_ORG = os.getenv("INFLUX_ORG")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET")

app = FastAPI()
ws_connections = set()
msg_queue = queue.Queue(maxsize=1000)

client = mqtt.Client(client_id=f"ui-gw-{int(time.time())}")
if MQTT_USER: client.username_pw_set(MQTT_USER, MQTT_PASS)
if MQTT_PORT == 8883:
    client.tls_set(tls_version=ssl.PROTOCOL_TLS_CLIENT)

def on_connect(client, userdata, flags, rc):
    print("[MQTT] Connected rc=", rc)
    client.subscribe([("sensors/+/telemetry", 1), ("sensors/+/state", 1)])

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode("utf-8"))
    except Exception:
        payload = {"raw": msg.payload.decode("utf-8", errors="ignore")}
    pkt = {"topic": msg.topic, "payload": payload, "ts": int(time.time())}
    for ws in list(ws_connections):
        try:
            import asyncio
            asyncio.run(ws.send_json(pkt))
        except Exception:
            pass
    if not msg_queue.full():
        msg_queue.put(pkt)

client.on_connect = on_connect
client.on_message = on_message
threading.Thread(target=lambda: (client.connect(MQTT_HOST, MQTT_PORT, 60), client.loop_forever()), daemon=True).start()

class Cmd(BaseModel):
    action: str
    target: str | None = None
    value: int | float | None = None

@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/command")
def send_command(device_id: str = DEFAULT_DEVICE_ID, cmd: Cmd | None = None):
    if cmd is None:
        cmd = Cmd(action="open")
    topic = f"sensors/{device_id}/cmd"
    client.publish(topic, json.dumps(cmd.dict()), qos=1)
    return {"sent": True, "topic": topic, "cmd": cmd.dict()}

@app.get("/api/telemetry")
def telemetry(device_id: str = DEFAULT_DEVICE_ID, last: str = Query("-1h")):
    if not INFLUX_URL or not INFLUX_TOKEN:
        return {"error": "INFLUX env not configured"}
    flux = f'''from(bucket: "{INFLUX_BUCKET}")
  |> range(start: {last})
  |> filter(fn: (r) => r._measurement == "telemetry")
  |> filter(fn: (r) => r.device_id == "{device_id}")
  |> keep(columns: ["_time","_field","_value"])'''
    out = {}
    with InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG) as c:
        for t in c.query_api().query(flux):
            for r in t.records:
                out.setdefault(r._field, []).append({"time": r.get_time().isoformat(), "value": r.get_value()})
    return {"device_id": device_id, "series": out}

@app.get("/api/telemetry/last")
def telemetry_last(device_id: str = DEFAULT_DEVICE_ID):
    if not INFLUX_URL or not INFLUX_TOKEN:
        return {"error": "INFLUX env not configured"}

    # (field_in_influx, field_name_no_json)
    field_map = [("humidity","humidity"), ("hum","humidity"), ("temp","temp"), ("position","position")]
    results, ts = {}, None

    with InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG) as c:
        for influx_field, out_name in field_map:
            flux = f'''from(bucket: "{INFLUX_BUCKET}")
    |> range(start: -7d)
    |> filter(fn: (r) => r._measurement == "telemetry")
    |> filter(fn: (r) => r.device_id == "{device_id}")
    |> filter(fn: (r) => r._field == "{influx_field}")
    |> last()'''
            tables = c.query_api().query(flux)
            if tables and tables[0].records:
                rec = tables[0].records[0]
                results[out_name] = rec.get_value()
                ts = rec.get_time().isoformat()
    results["ts"] = ts
    return results

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    ws_connections.add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ws_connections.discard(ws)

