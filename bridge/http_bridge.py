#!/usr/bin/env python3
"""
Plain HTTP-to-HTTPS Bridge Relay for Smart Gas Mask IoT
------------------------------------------------------
Accepts plain HTTP POST requests from legacy ESP-01 firmware (which cannot do TLS)
and relays sensor telemetry securely over HTTPS to the Vercel API endpoint.

Target Vercel API: https://smart-gas-sensor.vercel.app/api/sensor-data
"""

import os
import sys
import json
import logging
import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Configuration from environment variables
PORT = int(os.environ.get("PORT", "8080"))
HOST = os.environ.get("HOST", "0.0.0.0")
TARGET_URL = os.environ.get("VERCEL_TARGET_URL", "https://smart-gas-sensor.vercel.app/api/sensor-data")
BRIDGE_SECRET = os.environ.get("BRIDGE_SECRET", None)

def _get_first_present(dictionary, *keys):
    for key in keys:
        val = dictionary.get(key)
        if val is not None:
            return val
    return None

class HTTPBridgeHandler(BaseHTTPRequestHandler):
    
    def _send_json_response(self, status_code: int, payload: dict):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Bridge-Secret')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_OPTIONS(self):
        self._send_json_response(200, {"status": "ok"})

    def do_GET(self):
        if self.path == "/health" or self.path == "/":
            self._send_json_response(200, {
                "status": "healthy",
                "service": "Smart Gas Mask HTTP Bridge",
                "target_url": TARGET_URL,
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
        else:
            self._send_json_response(404, {"status": "error", "message": "Not Found"})

    def do_POST(self):
        # 1. Prevent infinite loops
        if self.headers.get('X-HTTP-Bridge') == 'true':
            logging.warning("Infinite loop detected! Rejecting request with X-HTTP-Bridge header.")
            self._send_json_response(400, {"status": "error", "message": "Loop prevention triggered"})
            return

        # 2. Secret validation (if configured)
        if BRIDGE_SECRET:
            header_secret = self.headers.get('X-Bridge-Secret')
            if header_secret != BRIDGE_SECRET:
                logging.warning("Unauthorized bridge request: invalid secret")
                self._send_json_response(401, {"status": "error", "message": "Unauthorized"})
                return

        # 3. Read content length
        try:
            content_length = int(self.headers.get('Content-Length', 0))
        except (ValueError, TypeError):
            content_length = 0

        if content_length <= 0:
            self._send_json_response(400, {"status": "error", "message": "Empty payload"})
            return

        # 4. Read body
        raw_body = self.rfile.read(content_length)
        try:
            body_json = json.loads(raw_body.decode('utf-8'))
        except Exception as e:
            logging.error(f"Failed to parse incoming JSON: {e}")
            self._send_json_response(400, {"status": "error", "message": "Invalid JSON payload"})
            return

        # 5. Extract & Validate Fields
        try:
            # Gas reading is required
            raw_gas = body_json.get('gas')
            if raw_gas is None:
                self._send_json_response(400, {"status": "error", "message": "Missing 'gas' field"})
                return
            gas_val = float(raw_gas)

            # Acceleration values (with alternative aliases and safe defaults)
            accel_x = _get_first_present(body_json, 'accel_x', 'accelX', 'x', 'ax')
            accel_y = _get_first_present(body_json, 'accel_y', 'accelY', 'y', 'ay')
            accel_z = _get_first_present(body_json, 'accel_z', 'accelZ', 'z', 'az')

            safe_accel_x = float(accel_x) if accel_x is not None else 0.0
            safe_accel_y = float(accel_y) if accel_y is not None else 0.0
            safe_accel_z = float(accel_z) if accel_z is not None else 1.0

        except (ValueError, TypeError) as e:
            logging.error(f"Data validation error: {e}")
            self._send_json_response(400, {"status": "error", "message": f"Validation error: {e}"})
            return

        timestamp = body_json.get('timestamp') or datetime.datetime.utcnow().isoformat()

        forward_payload = {
            "gas": gas_val,
            "accel_x": safe_accel_x,
            "accel_y": safe_accel_y,
            "accel_z": safe_accel_z,
            "timestamp": timestamp
        }

        logging.info(f"Relaying HTTP POST payload from ESP-01 -> {TARGET_URL}: {forward_payload}")

        # 6. Forward request over HTTPS to Vercel API
        req_data = json.dumps(forward_payload).encode('utf-8')
        req = Request(TARGET_URL, data=req_data, headers={
            'Content-Type': 'application/json',
            'User-Agent': 'SmartGasMask-HTTPBridge/1.0',
            'X-HTTP-Bridge': 'true'
        }, method='POST')

        try:
            with urlopen(req, timeout=6.0) as response:
                resp_body = response.read().decode('utf-8')
                try:
                    resp_json = json.loads(resp_body)
                except Exception:
                    resp_json = {"raw_response": resp_body}

                logging.info(f"Vercel API successfully responded: {response.status}")
                self._send_json_response(200, {
                    "status": "success",
                    "relayed_to": TARGET_URL,
                    "target_status": response.status,
                    "data": resp_json
                })

        except HTTPError as e:
            err_body = e.read().decode('utf-8') if e.fp else ""
            logging.error(f"Vercel API HTTP Error {e.code}: {err_body}")
            self._send_json_response(502, {
                "status": "error",
                "message": f"Target API returned HTTP {e.code}",
                "detail": err_body
            })

        except URLError as e:
            logging.error(f"Failed to reach Vercel API target URL: {e.reason}")
            self._send_json_response(504, {
                "status": "error",
                "message": f"Target API unreachable: {e.reason}"
            })

        except Exception as e:
            logging.error(f"Unexpected error during HTTP relay: {e}")
            self._send_json_response(500, {
                "status": "error",
                "message": f"Bridge internal error: {e}"
            })

def run_server():
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, HTTPBridgeHandler)
    logging.info(f"Starting Plain HTTP Bridge server on http://{HOST}:{PORT}")
    logging.info(f"Relaying ESP-01 plain HTTP POST requests -> {TARGET_URL}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logging.info("Shutting down HTTP Bridge server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
