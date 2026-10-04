import os
import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Query
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
def get_latest_sensor_data(
    channel_id: Optional[str] = Query(None, description="Optional ThingSpeak Channel ID"),
    read_api_key: Optional[str] = Query(None, description="Optional ThingSpeak Read API Key")
):
    """
    Returns the latest reading for the frontend dashboard.
    Fetches from ThingSpeak channel if configured or provided.
    """
    ts_channel = channel_id or os.environ.get("THINGSPEAK_CHANNEL_ID") or "3520155"
    ts_read_key = read_api_key or os.environ.get("THINGSPEAK_READ_KEY")

    if ts_channel:
        latest_ts = data_processor.fetch_thingspeak_latest(ts_channel, ts_read_key)
        if latest_ts:
            return latest_ts

    latest = data_processor.get_latest()
    return latest
