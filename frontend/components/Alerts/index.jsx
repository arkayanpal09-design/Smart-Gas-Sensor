import React from 'react';
import { Bell, Info, ShieldAlert, AlertTriangle } from 'lucide-react';

const Alerts = ({ alerts }) => {
  const getAlertIcon = (severity) => {
    switch(severity) {
      case 'DANGER': return <ShieldAlert size={16} color="var(--color-danger)" />;
      case 'WARNING': return <AlertTriangle size={16} color="var(--color-warning)" />;
      default: return <Info size={16} color="var(--color-accent)" />;
    }
  };

  const getAlertBg = (severity) => {
    switch(severity) {
      case 'DANGER': return 'rgba(239, 68, 68, 0.1)';
      case 'WARNING': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} color="var(--text-secondary)" />
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>System Alerts</h3>
        </div>
        <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
          {alerts.length} NEW
        </span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', fontSize: '0.9rem' }}>
            No recent alerts
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              backgroundColor: getAlertBg(alert.severity),
              borderRadius: '8px',
              borderLeft: `3px solid var(--color-${alert.severity.toLowerCase()})`
            }}>
              <div style={{ marginTop: '2px' }}>
                {getAlertIcon(alert.severity)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: `var(--color-${alert.severity.toLowerCase()})` }}>
                    {alert.type}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {alert.description}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
