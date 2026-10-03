import React from 'react';
import { Move3D } from 'lucide-react';

const MotionMonitor = ({ accel_x = 0, accel_y = 0, accel_z = 1 }) => {
  const safeX = typeof accel_x === 'number' && !isNaN(accel_x) ? accel_x : 0;
  const safeY = typeof accel_y === 'number' && !isNaN(accel_y) ? accel_y : 0;
  const safeZ = typeof accel_z === 'number' && !isNaN(accel_z) ? accel_z : 1;

  // Determine if motion is unusual based on typical resting state (approx ~1g gravity on Z, ~0g on X, Y)
  const isSuddenMotion = Math.abs(safeX) > 0.5 || Math.abs(safeY) > 0.5 || Math.abs(safeZ - 1) > 0.5;
  const statusLabel = isSuddenMotion ? "SUDDEN MOTION" : "NORMAL";
  const statusColor = isSuddenMotion ? "var(--color-warning)" : "var(--text-secondary)";

  const AxisDisplay = ({ label, value = 0 }) => {
    const numVal = typeof value === 'number' && !isNaN(value) ? value : 0;
    // Visual bar for axis
    const maxVal = 2.0; // Assume 2g scale for visuals
    const valPercent = (Math.abs(numVal) / maxVal) * 100;
    const boundedPercent = valPercent > 100 ? 100 : valPercent;
    
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Axis {label}</span>
          <span className="font-mono">{numVal.toFixed(2)} g</span>
        </div>
        <div className="level-indicator" style={{ height: '4px' }}>
          <div 
            className="level-fill" 
            style={{ 
              width: `${boundedPercent}%`, 
              backgroundColor: 'var(--color-accent)', 
              opacity: 0.8
            }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Motion Monitoring</h3>
        <Move3D size={20} color="var(--text-muted)" />
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Motion Status:</span>
          <span style={{ 
            color: statusColor, 
            fontWeight: 600, 
            fontSize: '0.9rem',
            padding: '2px 8px',
            backgroundColor: isSuddenMotion ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            borderRadius: '4px'
          }}>
            {statusLabel}
          </span>
        </div>
        
        <div>
          <AxisDisplay label="X" value={safeX} />
          <AxisDisplay label="Y" value={safeY} />
          <AxisDisplay label="Z" value={safeZ} />
        </div>
      </div>
    </div>
  );
};

export default MotionMonitor;
