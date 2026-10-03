from pydantic import BaseModel, Field
from typing import Optional

class SensorData(BaseModel):
    gas: float = Field(..., description="Raw or relative MQ-2 sensor reading (not calibrated ppm)")
    accel_x: Optional[float] = Field(None, description="X-axis acceleration")
    accel_y: Optional[float] = Field(None, description="Y-axis acceleration")
    accel_z: Optional[float] = Field(None, description="Z-axis acceleration")
    timestamp: Optional[str] = Field(None, description="ISO 8601 timestamp string of the reading")
    error: Optional[str] = Field(None, description="Optional hardware error string (e.g. MPU6050 NOT FOUND)")
