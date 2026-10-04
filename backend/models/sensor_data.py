from pydantic import BaseModel, Field, model_validator
from typing import Optional, Any

class SensorData(BaseModel):
    gas: float = Field(..., description="Raw or relative MQ-2 sensor reading (not calibrated ppm)")
    accel_x: Optional[float] = Field(None, description="X-axis acceleration")
    accel_y: Optional[float] = Field(None, description="Y-axis acceleration")
    accel_z: Optional[float] = Field(None, description="Z-axis acceleration")
    timestamp: Optional[str] = Field(None, description="ISO 8601 timestamp string of the reading")
    error: Optional[str] = Field(None, description="Optional hardware error string (e.g. MPU6050 NOT FOUND)")

    @model_validator(mode='before')
    @classmethod
    def normalize_keys(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalize accel_x key aliases
            if data.get('accel_x') is None:
                for alt in ['accelX', 'x', 'ax', 'accel_X']:
                    if data.get(alt) is not None:
                        data['accel_x'] = data[alt]
                        break

            # Normalize accel_y key aliases
            if data.get('accel_y') is None:
                for alt in ['accelY', 'y', 'ay', 'accel_Y']:
                    if data.get(alt) is not None:
                        data['accel_y'] = data[alt]
                        break

            # Normalize accel_z key aliases
            if data.get('accel_z') is None:
                for alt in ['accelZ', 'z', 'az', 'accel_Z']:
                    if data.get(alt) is not None:
                        data['accel_z'] = data[alt]
                        break

        return data
