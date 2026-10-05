import os
import json
import urllib.request
from datetime import datetime, timezone
from collections import deque
from typing import Optional

from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

class SensorData(BaseModel):
    gas: float
    accel_x: float
    accel_y: float
    accel_z: float
    timestamp: Optional[str] = None

class DataProcessor:
    def __init__(self):
        self.history = deque(maxlen=60)

    def add_reading(self, data: SensorData):
        self.history.append(data)
        return data

    def fetch_thingspeak_latest(self, channel_id: str, read_api_key: str = None) -> SensorData:
        url = f"https://api.thingspeak.com/channels/{channel_id}/feeds/last.json"
        if read_api_key:
            url += f"?api_key={read_api_key}"
            
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'SmartGasMask-Vercel/1.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    payload = json.loads(response.read().decode('utf-8'))
                    
                    raw_gas = payload.get('field1')
                    gas_val = float(raw_gas) if raw_gas is not None else 0.0
                    
                    raw_x = payload.get('field2')
                    raw_y = payload.get('field3')
                    raw_z = payload.get('field4')
                    
                    accel_x = float(raw_x) if raw_x is not None else 0.0
                    accel_y = float(raw_y) if raw_y is not None else 0.0
                    accel_z = float(raw_z) if raw_z is not None else 1.0
                    
                    timestamp = payload.get('created_at') or datetime.now(timezone.utc).isoformat()
                    
                    sensor_obj = SensorData(
                        gas=gas_val,
                        accel_x=accel_x,
                        accel_y=accel_y,
                        accel_z=accel_z,
                        timestamp=timestamp
                    )
                    self.add_reading(sensor_obj)
                    return sensor_obj
        except Exception as e:
            print(f"Error fetching from ThingSpeak: {e}")
            
        return self.get_latest()

    def get_latest(self) -> SensorData:
        if self.history:
            return self.history[-1]
        return SensorData(
            gas=0.0,
            accel_x=0.0,
            accel_y=0.0,
            accel_z=1.0,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

data_processor = DataProcessor()

app = FastAPI(title="Smart Gas Mask IoT - Vercel Serverless Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {"status": "healthy", "architecture": "thingspeak_direct"}

@app.get("/api/sensor-data/latest")
@app.get("/sensor-data/latest")
def get_latest_sensor_data(
    channel_id: Optional[str] = Query(None),
    read_api_key: Optional[str] = Query(None)
):
    ts_channel = channel_id or os.environ.get("THINGSPEAK_CHANNEL_ID") or "3520155"
    ts_read_key = read_api_key or os.environ.get("THINGSPEAK_READ_KEY")

    if ts_channel:
        latest_ts = data_processor.fetch_thingspeak_latest(ts_channel, ts_read_key)
        if latest_ts:
            return latest_ts

    return data_processor.get_latest()

@app.post("/api/sensor-data")
@app.post("/sensor-data")
def receive_sensor_data(data: SensorData):
    if data.timestamp is None:
        data.timestamp = datetime.now(timezone.utc).isoformat()
    return {"status": "success", "data": data_processor.add_reading(data)}

@app.get("/api/device/status")
@app.get("/device/status")
def device_status():
    latest = data_processor.get_latest()
    return {
        "status": "connected" if latest else "waiting",
        "mode": "thingspeak_direct",
        "last_reading": latest
    }
