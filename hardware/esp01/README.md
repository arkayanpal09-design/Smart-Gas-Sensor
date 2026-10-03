# ESP-01 Configuration (Phase 4 Real Hardware Mode)

## Requirements
To execute this Wi-Fi bridge script (`esp_test.ino`), you must properly provision the network configuration constants in the configuration block.

```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID_HERE";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD_HERE";
const char* BACKEND_IP = "192.168.1.100";  
```

## Internal Workflow
The ESP-01 does **not** decode the JSON explicitly. Instead, it reads directly from the Hardware UART serial line connecting identically to the Arduino's `D11` mapping (Arduino SoftwareSerial TX). Once a `\n` carriage return is detected it passes the string buffer wrapped identically directly forward via a REST Http POST query to the configured Backend API.

## Troubleshooting Serial Sync
If the backend does not detect payloads:
1. Ensure the ESP-01's Serial frequency mirrors the `espSerial.begin(115200);` code inside the Arduino sketch exactly!
2. Confirm the Arduino Software TX (`11`) routes properly through a logical voltage-divider line if the ESP-01 has 3.3v constraints.
