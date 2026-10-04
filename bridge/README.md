# Plain HTTP-to-HTTPS Bridge for Smart Gas Mask IoT

## Overview

The ESP-01 (ESP8266) Wi-Fi module uses legacy AT firmware (`v1.3.0.0`, SDK `2.0.0`), which supports standard TCP HTTP connections but **cannot reliably establish modern TLS/HTTPS connections** required by Vercel (`.vercel.app` enforces HTTPS HSTS).

This lightweight Python HTTP Bridge acts as a relay between the ESP-01 and the Vercel backend API:

```
[ Arduino Nano ]
       │
       ▼ (UART)
  [ ESP-01 ]
       │
       ▼ (Plain HTTP POST: http://BRIDGE_HOST/sensor-data)
[ HTTP Bridge ]
       │
       ▼ (HTTPS POST: https://smart-gas-sensor.vercel.app/api/sensor-data)
 [ Vercel API ]
       │
       ▼
 [ Dashboard ]
```

---

## ESP-01 HTTP POST Request Format

The ESP-01 sends a plain HTTP `POST` request to `http://<BRIDGE_HOST>:<PORT>/sensor-data` or `/`:

- **Headers**: `Content-Type: application/json`
- **JSON Body**:
```json
{
  "gas": 786,
  "accel_x": -0.12,
  "accel_y": 0.00,
  "accel_z": 0.98
}
```

- **Response from Bridge**:
```json
{
  "status": "success",
  "relayed_to": "https://smart-gas-sensor.vercel.app/api/sensor-data",
  "target_status": 200,
  "data": { ... }
}
```

---

## Deployment Options for Plain HTTP Ingress

Since Vercel enforces HTTPS redirection, the bridge must run on a service or server that permits **plain HTTP ingress**:

### Option 1: Local Network / Raspberry Pi (Recommended for Hardware Testing)
Run the bridge on a local computer or Raspberry Pi connected to the same Wi-Fi network as the ESP-01:
```bash
python bridge/http_bridge.py
```
ESP-01 target endpoint: `http://<YOUR_LOCAL_IP>:8080/sensor-data`

### Option 2: Free Cloud Hosting (Render / Railway)
1. Deploy `bridge/http_bridge.py` to [Render.com](https://render.com) or Railway.
2. Render provides a public port for incoming traffic.
3. Configure `VERCEL_TARGET_URL` environment variable if your Vercel URL changes:
   ```env
   VERCEL_TARGET_URL=https://smart-gas-sensor.vercel.app/api/sensor-data
   ```

### Option 3: ngrok Tunnel
Expose your local bridge instance to the internet via ngrok:
```bash
python bridge/http_bridge.py
ngrok http 8080
```
ESP-01 target endpoint: `http://<NGROK_ID>.ngrok-free.app/sensor-data`

---

## Safety & Loop Prevention
- **Header Guard**: The bridge appends `X-HTTP-Bridge: true` to outgoing requests. If an incoming request already contains this header, it is rejected to prevent infinite forwarding loops.
- **Timeout Protection**: Outgoing HTTPS requests to Vercel have a strict 6-second timeout.
- **Data Validation**: Sanitizes and converts numerical values safely before relaying.
