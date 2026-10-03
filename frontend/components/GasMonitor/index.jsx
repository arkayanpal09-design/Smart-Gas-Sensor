import React from 'react';
import { Wind } from 'lucide-react';
import { getStatusFromValue, GAS_THRESHOLDS } from '../../utils/thresholds';

const GasMonitor = ({ gasValue }) => {
  const status = getStatusFromValue(gasValue);
  
  // Arduino analog range is 0-1023
  const visualMax = 1023;
  let percentage = (gasValue / visualMax) * 100;
  if (percentage > 100) percentage = 100;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Gas Monitoring</h3>
        <div className={`badge badge-${status.color}`}>
          {status.label}
        </div>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <Wind size={18} />
              <span>MQ-2 Sensor Value</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className={`data-value status-${status.color}`}>
                {gasValue}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>units</span>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>0</span>
            <span>{GAS_THRESHOLDS.SAFE.max}</span>
            <span>{GAS_THRESHOLDS.WARNING.max}</span>
            <span>{visualMax}+</span>
          </div>
          <div className="level-indicator">
            <div 
              className={`level-fill bg-${status.color}`} 
              style={{ width: `${percentage}%`, boxShadow: `0 0 10px var(--color-${status.color}-glow)` }}
            ></div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Relative Gas Level (Not True PPM)
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasMonitor;
