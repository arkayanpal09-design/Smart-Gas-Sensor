import React from 'react';
import { Shield, ShieldAlert, Volume2 } from 'lucide-react';
import { GAS_THRESHOLDS } from '../../utils/thresholds';

const SafetyStatus = ({ status }) => {
  const { label } = status;

  const isSafe = label === GAS_THRESHOLDS.SAFE.label;
  const isCritical = status === GAS_THRESHOLDS.DANGER; // 950+
  const isDanger = !isSafe;

  const Icon = isSafe ? Shield : ShieldAlert;
  const colorClass = isSafe ? "status-safe" : "status-danger";
  const bgColor = isSafe ? "var(--color-safe)" : "var(--color-danger)";

  let message = "Gas level within configured threshold.";
  if (isCritical) message = "Critical MQ-2 sensor value! Buzzer activated.";
  else if (isDanger) message = "High MQ-2 sensor value detected! Take action.";

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: 'auto', color: 'var(--text-secondary)' }}>
        Overall Safety Status
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', flex: 1 }}>
        <div className={isDanger ? 'animate-pulse-danger' : ''} style={{
          width: '80px', height: '80px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%', marginBottom: '16px', color: '#fff',
          backgroundColor: bgColor,
          boxShadow: `0 0 20px ${isDanger ? 'var(--color-danger-glow)' : 'var(--color-safe-glow)'}`
        }}>
          <Icon size={40} />
        </div>

        <div className={colorClass} style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>
          {label}
        </div>

        {isCritical && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '8px', padding: '6px 14px',
            color: '#f87171', fontWeight: 600, fontSize: '0.85rem',
            marginBottom: '8px'
          }}>
            <Volume2 size={16} />
            BUZZER ACTIVATED
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', maxWidth: '80%' }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default SafetyStatus;
