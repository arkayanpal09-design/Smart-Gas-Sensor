import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, Radio, Server } from 'lucide-react';
import { getDeviceStatus } from '../../services/api';

const DeviceStatus = ({ timestamp, uptime }) => {
  const [deviceStats, setDeviceStats] = useState({
    arduino: "Loading...",
    esp01: "Loading...",
    wifi: "Loading...",
    backend: "Loading...",
    data_source: "Loading..."
  });

  // Periodically fetch Device telemetry
  useEffect(() => {
    const fetchStatus = async () => {
      const stats = await getDeviceStatus();
      if(stats) {
        setDeviceStats(stats);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Format uptime (seconds to mm:ss)
  const mins = Math.floor(uptime / 60);
  const secs = Math.floor(uptime % 60);
  const formattedUptime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const parseTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString();
    } catch {
      return '--:--:--';
    }
  };

  const InfoRow = ({ icon: Icon, label, value = "" }) => {
    const strVal = String(value || "");
    const lowerVal = strVal.toLowerCase();
    const active = lowerVal === "connected" || lowerVal === "simulation mode" || lowerVal === "hardware api";
    const error = lowerVal === "disconnected" || lowerVal === "api error";
    
    let dotColor = '#10b981'; // safe
    if(error) dotColor = '#ef4444'; // danger
    else if(!active) dotColor = '#f59e0b'; // warning/waiting

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Icon size={16} />
          <span style={{ fontSize: '0.9rem' }}>{label}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          color: active ? '#f8fafc' : (error ? '#ef4444' : 'var(--text-muted)'),
          fontWeight: 500,
          fontSize: '0.9rem'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor }}></div>
          {value}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
        Device Status
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-around' }}>
        <InfoRow icon={Cpu} label="Arduino Interface" value={deviceStats.arduino} />
        <InfoRow icon={Radio} label="ESP-01 Wi-Fi" value={deviceStats.esp01} />
        <InfoRow icon={Wifi} label="Backend Server" value={deviceStats.backend} />
        <InfoRow icon={Server} label="Data Source" value={deviceStats.data_source} />
        
        <div style={{ 
          marginTop: 'auto',
          padding: '16px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Uptime</div>
            <div className="font-mono" style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{formattedUptime}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Data</div>
            <div className="font-mono" style={{ color: 'var(--text-secondary)' }}>{parseTime(timestamp)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatus;
