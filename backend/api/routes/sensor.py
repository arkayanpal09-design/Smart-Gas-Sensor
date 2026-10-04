import datetime
from fastapi import APIRouter, HTTPException, Request
from models.sensor_data import SensorData
from services.data_processor import data_processor

router = APIRouter()

@router.post("/sensor-data")
def receive_sensor_data(data: SensorData):
    """
    Receives incoming JSON from the ESP-01, HTTP Bridge, or simulator
    and adds it to the rolling window memory.
    """
    if data.timestamp is None:
        data.timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    saved_data = data_processor.add_reading(data)
    return {"status": "success", "data": saved_data}

@router.post("/bridge/sensor-data")
def bridge_sensor_data(data: SensorData, request: Request):
    """
    Direct endpoint for plain HTTP bridges or relay services.
    """
    if data.timestamp is None:
        data.timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    saved_data = data_processor.add_reading(data)
    return {
        "status": "success",
        "relayed_by": "FastAPI Built-in Bridge",
        "data": saved_data
    }

@router.get("/sensor-data/latest")
def get_latest_sensor_data():
    """
    Returns the latest reading for the frontend dashboard.
    """
    latest = data_processor.get_latest()
    if not latest:
        raise HTTPException(status_code=404, detail="No sensor data available yet")
    return latest
