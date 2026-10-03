# Smart Gas Mask IoT - Backend API

This directory contains the FastAPI backend for the Smart Gas Mask. In Phase 3, this backend is configured to accept JSON POST requests from the ESP-01 module or local testing scripts and serve the latest reading to the React frontend dashboard.

## Environment Setup
It is highly recommended to use a virtual environment for isolation.

1. Ensure Python 3.9+ is installed.
2. In this `backend/` directory, create your virtual environment: `python -m venv venv`
3. Activate the environment: 
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install requirements: `pip install -r requirements.txt`

## Running the API
The API needs to be accessible natively on your local network (LAN) because the ESP-01 over Wi-Fi needs to resolve your physical computer's IP address (not localhost).
Start the uvicorn server binding to `0.0.0.0`:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
*Note: If Windows prompts you with a Firewall request for Python, you **must allow** it on Private networks so the ESP-01 can ping it.*

### Finding your Windows LAN IP
1. Open PowerShell or Command Prompt.
2. Run `ipconfig`
3. Locate the `IPv4 Address` under your active Wi-Fi or Ethernet adapter (usually something like `192.168.1.100` or `10.0.0.50`).
4. You will put this physical IP address into `hardware/esp01/esp_test/esp_test.ino`

## API Endpoints

**1. GET `/api/health`**
- Purpose: Check backend connectivity.
- Success Response: `{"status": "healthy", "service": "Smart Gas Mask Backend"}`

**2. POST `/api/sensor-data`**
- Purpose: Submit live data directly from the ESP-01.
- Expected JSON Payload:
  ```json
  {
      "gas": 245,
      "accel_x": 0.12,
      "accel_y": -0.04,
      "accel_z": 0.98,
      "timestamp": "2026-10-02T10:30:00"
  }
  ```

**3. GET `/api/sensor-data/latest`**
- Purpose: Fetch the single most recent data frame. Used by the React Dashboard widget set.

**4. GET `/api/device/status`**
- Purpose: Fetches the inferred connection status of the data layers.

## Testing Procedure
Follow these strict phases:
1. Start the server (see above).
2. Browse to `http://localhost:8000/api/health` and verify health state.
3. Post test data manually (using Postman or cURL) to `/api/sensor-data`
4. Update React app `DATA_SOURCE = "backend"`, ensure dashboard charts update.
5. Setup the actual ESP-01 Arduino code to hit your local network IP!
