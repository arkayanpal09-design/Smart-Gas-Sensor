import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

const Header = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-panel" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '2px solid rgba(59, 130, 246, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          background: 'rgba(59, 130, 246, 0.2)', 
          padding: '12px', 
          borderRadius: '12px',
          color: 'var(--color-accent)'
        }}>
          <ShieldAlert size={32} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.025em' }}>SMART GAS-SENSING MASK</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
            Industrial Toxic Gas Monitoring Prototype
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="badge" style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            color: '#10b981', 
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            LIVE CONNECTION
          </div>
          <div className="badge" style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Activity size={14} />
            SIMULATION MODE
          </div>
        </div>
        <div className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {time.toLocaleDateString()} &nbsp; {time.toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
};

export default Header;
