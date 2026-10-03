# Smart Gas Mask IoT

Industrial Toxic Gas Monitoring Prototype featuring real-time MQ-2 gas sensing, MPU6050 accelerometer motion tracking, ESP-01 Wi-Fi telemetry, FastAPI backend server, and a React live monitoring dashboard.

## Project Structure

- `backend/`: FastAPI application server listening on port 8001
- `frontend/`: React + Vite dashboard running on port 3000
- `hardware/`: Arduino Nano and ESP-01 firmware code
- `docs/`: Project documentation and architecture details

## Quick Start

### 1. Run Backend Server
```bash
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 2. Run Frontend Dashboard
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
