import React, { useState } from 'react';
import { ShieldCheck, Activity, Wifi, AlertTriangle, ChevronDown, ChevronUp, Cpu, Gauge } from 'lucide-react';

const WelcomeBanner = ({ onExplore }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="glass-panel" style={{
      marginBottom: '20px',
      padding: '24px 28px',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 138, 0.35) 100%)',
      border: '1px solid rgba(59, 130, 246, 0.4)',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.2)',
      transition: 'all 0.3s ease-in-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '12px' }}>
            <Cpu size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              IoT Safety Mask System Online
            </span>
          </div>

          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '2rem', 
            fontWeight: 800, 
            background: 'linear-gradient(90deg, #ffffff 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Welcome to Smart Gas Sensing Mask IoT System
          </h1>

          <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem', lineHeight: '1.5', maxWidth: '800px' }}>
            Next-generation industrial safety platform featuring continuous MQ-2 toxic gas detection, MPU6050 3-axis motion tracking, ESP-01 Wi-Fi telemetry relay, and instant buzzer safety alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => {
              if (onExplore) onExplore();
              setIsExpanded(!isExpanded);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'transform 0.2s, background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Gauge size={18} />
            {isExpanded ? "Hide Details" : "Welcome Details"}
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '20px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#60a5fa' }}>
              <ShieldCheck size={20} />
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>MQ-2 Gas Monitor</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
              Real-time toxic gas concentration detection with Safe (0-849), Danger (850-949), and Critical (950+) safety levels.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#34d399' }}>
              <Activity size={20} />
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>MPU6050 Motion</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
              3-Axis acceleration monitoring (X, Y, Z) detecting worker posture, sudden falls, and impact alerts.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#f59e0b' }}>
              <Wifi size={20} />
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>ESP-01 HTTP Relay</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
              Wireless HTTP bridge forwarding telemetry seamlessly to the Vercel cloud infrastructure.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#ef4444' }}>
              <AlertTriangle size={20} />
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Instant Alarms</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
              Automated hardware buzzer trigger and visual warning system for immediate emergency response.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeBanner;
