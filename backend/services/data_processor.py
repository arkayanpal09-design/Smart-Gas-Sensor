import os
import json
import urllib.request
from datetime import datetime
from collections import deque
from models.sensor_data import SensorData

class DataProcessor:
    def __init__(self):
        # In-memory history of latest 60 readings
        self.history = deque(maxlen=60)
        self.last_data_received = None

    def add_reading(self, data: SensorData):
        self.history.append(data)
        self.last_data_received = datetime.utcnow().isoformat()
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
                    
                    timestamp = payload.get('created_at') or datetime.utcnow().isoformat()
                    
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
        return SensorData(gas=0.0, accel_x=0.0, accel_y=0.0, accel_z=1.0, timestamp=datetime.utcnow().isoformat())

# Singleton instance
data_processor = DataProcessor()
