from influxdb_client import InfluxDBClient
URL="https://us-east-1-1.aws.cloud2.influxdata.com"
TOKEN="dnInMyd6SGLyfAXWajWig4xpiF2qWD17YrPWZ7mU5bqnYaAT473aVH6jjEVPPyU44T7N2LlVrjz9jjVhpaucZg=="; ORG="3b5ad31755b8749b"; BUCKET="TI-V-Smart-Window"

flux=f'''from(bucket: "{BUCKET}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "telemetry")'''

with InfluxDBClient(url=URL, token=TOKEN, org=ORG) as c:
    for t in c.query_api().query(flux):
        for r in t.records:
            print(r.get_time(), r.get_field(), r.get_value(), r.values.get("device_id"))