# Arduino Nano - Smart Gas Mask

This sketch represents the master telemetry loop that orchestrates the local I2C/Analog pins and aggregates them to the ESP-01 network coprocessor.

## Hardware Wiring
- **MQ-2 Gas Sensor**: Connect to `A0`
- **MPU6050**: 
  - SDA -> `A4`
  - SCL -> `A5`
- **ESP-01**: 
  - ESP-01 TX -> `D10`
  - ESP-01 RX -> `D11` 

## Serial Communication Format
The Arduino outputs JSON strings identically to the following format over `115200` baud:
```json
{
  "gas": 245,
  "accel_x": 0.12,
  "accel_y": -0.04,
  "accel_z": 0.98
}
```
If the MPU6050 cannot be queried, the fallback JSON will omit the acceleration parameters entirely, and insert an error parameter instead:
```json
{
  "gas": 245,
  "error": "MPU6050 NOT FOUND"
}
```

## Testing Procedure
1. Flash `smart_gas_mask.ino` onto your Arduino Nano.
2. Ensure you have the `Adafruit_Sensor` and `Adafruit_MPU6050` installed from the Library Manager.
3. Open your Arduino IDE Serial Monitor at **9600** baud and confirm read values.
4. Move the breadboard to confirm MPU X/Y/Z adjustments.
5. Provide a safe gas stimulus near the MQ-2 to verify `gas` variations.
