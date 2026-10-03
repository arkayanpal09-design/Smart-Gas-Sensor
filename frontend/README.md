# Smart Gas Mask IoT Dashboard

This is the frontend portion of the Smart Gas Mask IoT project. It is currently running in a robust simulation mode to demonstrate dashboard functionality without requiring the physical hardware setup.

## Technical Stack
- React
- Vite
- Recharts (for live graphing)
- Lucide React (for UI iconography)

## Features Included
- **Gas Monitoring**: Live relative values mimicking MQ-2 sensor readings, with horizontal fill bars
- **Gas Graph**: Live real-time chart updating every 1-2 seconds with the past 30-60 data points using Recharts
- **Motion Monitoring**: 3-axis accelerometer visualization predicting sudden motion
- **Safety Status**: Core SAFE/WARNING/DANGER states computed dynamically based on thresholds
- **Alert System**: Running log of dynamic alert occurrences when conditions change rapidly or breach thresholds
- **Device Status**: Connection and uptime telemetry simulation

## Running the Application

1. Make sure you have Node.js installed.
2. Open a terminal in the `frontend/` directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Navigate to the local URL (usually `http://localhost:3000` or `http://localhost:5173`).

## Simulation Details
The application employs a simulation service located at `frontend/services/api.js`. 
- **Gas Mode Simulation:** Evaluates noise algorithms and sets occasional random trends (such as spikes into Warning/Danger ranges) which resolves into full functional testing scenarios over time.
- **Motion Simulation:** Occasionally detects spikes in Acceleration.

### Configuration
Gas thresholds for defining Safe, Warning, and Danger states are easily configurable.
Edit the threshold constants inside `frontend/utils/thresholds.js`.

## Future Integration (Backend and Hardware)
To connect the dashboard with the physical ESP-01 module or Arduino, modify the `getSensorData()` function located inside `frontend/services/api.js` to fetch real data from your backend API instead of returning pseudo-random data. All UI components are seamlessly designed and decoupled from the data integration layer.
