import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import WelcomeBanner from './components/WelcomeBanner';
import SafetyStatus from './components/SafetyStatus';
import DeviceStatus from './components/DeviceStatus';
import GasMonitor from './components/GasMonitor';
import GasGraph from './components/GasGraph';
import MotionMonitor from './components/MotionMonitor';
import Alerts from './components/Alerts';
import ErrorBoundary from './components/ErrorBoundary';

import { getSensorData } from './services/api';
import { getStatusFromValue, GAS_THRESHOLDS } from './utils/thresholds';

function App() {
  const [sensorData, setSensorData] = useState({
    gas: 150,
    accel_x: 0,
    accel_y: 0,
    accel_z: 1,
    timestamp: new Date().toISOString()
  });
  
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [uptime, setUptime] = useState(0);

  // Use refs to track previous states to trigger alerts
  const prevStatusRef = useRef(GAS_THRESHOLDS.SAFE);
  const prevMotionRef = useRef(false);

  const addAlert = (type, description, severity) => {
    setAlerts(prev => {
      const newAlert = {
        type,
        description,
        severity,
        timestamp: new Date().toISOString()
      };
      // Keep last 50 alerts
      const newAlerts = [newAlert, ...prev];
      if(newAlerts.length > 50) return newAlerts.slice(0, 50);
      return newAlerts;
    });
  };

  useEffect(() => {
    // Initial startup alert
    addAlert("System Ready", "Simulation mode activated.", "INFO");
    
    const interval = setInterval(async () => {
      try {
        const rawData = await getSensorData();
        const data = {
          gas: typeof rawData?.gas === 'number' && !isNaN(rawData.gas) ? rawData.gas : 0,
          accel_x: typeof rawData?.accel_x === 'number' && !isNaN(rawData.accel_x) ? rawData.accel_x : 0,
          accel_y: typeof rawData?.accel_y === 'number' && !isNaN(rawData.accel_y) ? rawData.accel_y : 0,
          accel_z: typeof rawData?.accel_z === 'number' && !isNaN(rawData.accel_z) ? rawData.accel_z : 1,
          timestamp: rawData?.timestamp || new Date().toISOString()
        };
        
        setSensorData(data);
        
        // Update history
        setHistory(prev => {
          const newHistory = [...prev, data];
          if (newHistory.length > 40) return newHistory.slice(1);
          return newHistory;
        });
        
        // Update uptime
        setUptime(prev => prev + 1.5);
        
        // Evaluate alerts for Gas
        const currentStatus = getStatusFromValue(data.gas);
        if (currentStatus.label !== prevStatusRef.current.label) {
          if (currentStatus.label === GAS_THRESHOLDS.WARNING.label) {
            addAlert("Gas Warning", `Elevated gas level detected: ${Math.round(data.gas)}.`, "WARNING");
          } else if (currentStatus.label === GAS_THRESHOLDS.DANGER.label) {
            addAlert("Gas Danger", `Critical gas level detected: ${Math.round(data.gas)}.`, "DANGER");
          } else if (currentStatus.label === GAS_THRESHOLDS.SAFE.label) {
            addAlert("Gas Levels Normal", `Gas level returned to safe range.`, "INFO");
          }
          prevStatusRef.current = currentStatus;
        }

        // Evaluate alerts for Motion
        const isSuddenMotion = Math.abs(data.accel_x) > 0.5 || Math.abs(data.accel_y) > 0.5 || Math.abs(data.accel_z - 1) > 0.5;
        if (isSuddenMotion && !prevMotionRef.current) {
          addAlert("Sudden Motion", "Unexpected device acceleration detected.", "WARNING");
        }
        prevMotionRef.current = isSuddenMotion;

      } catch (error) {
        console.error("Failed to fetch sensor data:", error);
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  const currentStatus = getStatusFromValue(sensorData.gas);

  return (
    <ErrorBoundary>
      <div className="dashboard-container">
        <div className="area-header">
          <Header />
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <WelcomeBanner />
        </div>
        
        <div className="area-gas-monitor glass-panel">
          <GasMonitor gasValue={sensorData.gas} />
        </div>
        
        <div className="area-gas-graph glass-panel">
          <GasGraph data={history} currentValue={sensorData.gas} />
        </div>
        
        <div className="area-motion glass-panel">
          <MotionMonitor accel_x={sensorData.accel_x} accel_y={sensorData.accel_y} accel_z={sensorData.accel_z} />
        </div>
        
        <div className="area-safety glass-panel" style={{ background: `var(--bg-card)`, border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
          <SafetyStatus status={currentStatus} />
          {currentStatus.label === GAS_THRESHOLDS.DANGER.label && (
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(239, 68, 68, 0.1)', pointerEvents: 'none'}} className="animate-pulse-danger"></div>
          )}
        </div>
        
        <div className="area-alerts glass-panel">
          <Alerts alerts={alerts} />
        </div>
        
        <div className="area-device glass-panel">
          <DeviceStatus timestamp={sensorData.timestamp} uptime={uptime} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
