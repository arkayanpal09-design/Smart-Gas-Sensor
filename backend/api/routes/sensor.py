import datetime
from fastapi import APIRouter, HTTPException
from models.sensor_data import SensorData
from services.data_processor import data_processor

router = APIRouter()

@router.post("/sensor-data")
def receive_sensor_data(data: SensorData):
    """
    Receives incoming JSON from the ESP-01 (or mock script) 
    and adds it to the rolling window memory.
    """
    if data.timestamp is None:
        data.timestamp = datetime.datetime.utcnow().isoformat()

    saved_data = data_processor.add_reading(data)
    return {"status": "success", "data": saved_data}

@router.get("/sensor-data/latest")
def get_latest_sensor_data():
    """
    Returns the latest reading for the frontend dashboard.
    """
    latest = data_processor.get_latest()
    if not latest:
        raise HTTPException(status_code=404, detail="No sensor data available yet")
    return latest
