/**
 * API Service Configuration for Smart Gas Mask IoT Dashboard
 */

// Configuration Switch: Change this to "backend" to use real hardware data
export const DATA_SOURCE = "backend"; // "simulation" | "backend"

// Dynamic backend endpoint: uses VITE_BACKEND_URL, relative /api on Vercel, or localhost in local dev
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:8001/api" : "/api"); 

// -------------------------------------------------------------
// SIMULATION MODE LOGIC
// -------------------------------------------------------------
let simulationState = {
  gas: 150,
  accel_x: 0.05,
  accel_y: 0.01,
  accel_z: 0.98,
  gasTrend: 0,
  timeInCurrentTrend: 0 
};

function addNoise(value, amount) {
  return value + (Math.random() * amount * 2 - amount);
}

function updateSimulation() {
  simulationState.timeInCurrentTrend++;
  if (simulationState.timeInCurrentTrend > Math.random() * 50 + 10) {
    simulationState.timeInCurrentTrend = 0;
    const rand = Math.random();
    if (rand < 0.70) {
      simulationState.gasTrend = -0.5;
    } else if (rand < 0.90) {
      simulationState.gasTrend = 0.8;
    } else {
      simulationState.gasTrend = 2.5; 
    }
  }

  simulationState.gas += simulationState.gasTrend * (Math.random() * 20 + 5);
  simulationState.gas = addNoise(simulationState.gas, 5);
  
  if (simulationState.gas < 80) simulationState.gas = 80 + Math.random() * 20;
  if (simulationState.gas > 1000) simulationState.gas = 1000 - Math.random() * 50;

  if (Math.random() > 0.95) {
    simulationState.accel_x = addNoise(0, 0.4);
    simulationState.accel_y = addNoise(0, 0.4);
    simulationState.accel_z = addNoise(0.98, 0.6);
  } else {
    simulationState.accel_x = addNoise(0, 0.05);
    simulationState.accel_y = addNoise(0, 0.05);
    simulationState.accel_z = addNoise(0.98, 0.05);
  }
}

async function getSimulatedSensorData() {
  updateSimulation();
  return {
    gas: Math.round(simulationState.gas),
    accel_x: parseFloat(simulationState.accel_x.toFixed(2)),
    accel_y: parseFloat(simulationState.accel_y.toFixed(2)),
    accel_z: parseFloat(simulationState.accel_z.toFixed(2)),
    timestamp: new Date().toISOString()
  };
}

// -------------------------------------------------------------
// BACKEND MODE LOGIC
// -------------------------------------------------------------
async function getBackendSensorData() {
  try {
    const response = await fetch(`${BACKEND_URL}/sensor-data/latest`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Backend fetch error. Returning empty model.", error);
    // Return empty payload to prevent crash if backend goes down
    return {
      gas: 0,
      accel_x: 0,
      accel_y: 0,
      accel_z: 1,
      timestamp: new Date().toISOString()
    };
  }
}

// -------------------------------------------------------------
// EXPORTS
// -------------------------------------------------------------

/**
 * Returns the current mocked sensor reading or Backend HTTP GET.
 */
export async function getSensorData() {
  if (DATA_SOURCE === "backend") {
    return await getBackendSensorData();
  }
  return await getSimulatedSensorData();
}

/**
 * Endpoint to probe backend telemetry
 */
export async function getDeviceStatus() {
  if (DATA_SOURCE === "simulation") {
    return {
      arduino: "Connected",
      esp01: "Connected",
      wifi: "Connected",
      backend: "Offline",
      data_source: "Simulation Mode"
    };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/device/status`);
    if (response.ok) {
      const data = await response.json();
      return {
        arduino: data.arduino === "connected" ? "Connected" : "Waiting for Data",
        esp01: data.esp01 === "connected" ? "Connected" : "Waiting for Data",
        wifi: data.wifi === "connected" ? "Connected" : "Waiting for Data",
        backend: "Connected",
        data_source: "Hardware API"
      };
    } else {
      return {
        arduino: "Disconnected",
        esp01: "Disconnected",
        wifi: "Disconnected",
        backend: "Error",
        data_source: "API Error"
      };
    }
  } catch(error) {
     return {
        arduino: "Disconnected",
        esp01: "Disconnected",
        wifi: "Disconnected",
        backend: "Disconnected",
        data_source: "API Error"
     }
  }
}
