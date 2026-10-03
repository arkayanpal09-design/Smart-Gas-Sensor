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

    def get_latest(self) -> SensorData:
        if self.history:
            return self.history[-1]
        return None

# Singleton instance
data_processor = DataProcessor()
