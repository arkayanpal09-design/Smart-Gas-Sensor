from datetime import datetime
from fastapi import APIRouter
from services.data_processor import data_processor

router = APIRouter()

@router.get("/device/status")
def get_device_status():
    """
    Returns current active hardware connection statuses.
    """
    has_data = data_processor.last_data_received is not None
    is_connected = False
    
    if has_data:
        try:
            last_dt = datetime.fromisoformat(data_processor.last_data_received)
            # 15 second tolerance window for dropping ESP-01 connection physically
            if (datetime.utcnow() - last_dt).total_seconds() < 15:
                is_connected = True
        except:
            pass

    return {
        "arduino": "connected" if is_connected else ("disconnected" if has_data else "waiting"),
        "esp01": "connected" if is_connected else ("disconnected" if has_data else "waiting"),
        "wifi": "connected", # Local Wi-Fi is generally considered up if server responds
        "last_data_received": data_processor.last_data_received if has_data else "None",
        "data_source": "hardware" if has_data else "offline"
    }
