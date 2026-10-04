import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'show' | 'exit'
  const onFinishRef = React.useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    // Phase 1: fade in
    const t1 = setTimeout(() => setPhase('show'), 400);
    // Phase 2: begin fade out after 2.8s
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    // Phase 3: call onFinish after fade-out completes
    const t3 = setTimeout(() => onFinishRef.current && onFinishRef.current(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []); // Run only once on mount

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #0f1c3a 0%, #060d1f 70%, #000000 100%)',
      opacity: phase === 'enter' ? 0 : phase === 'show' ? 1 : 0,
      transition: 'opacity 0.6s ease-in-out',
      padding: '24px',
      textAlign: 'center'
    }}>
      {/* Glowing background orbs */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        animation: 'splashPulse 3s ease-in-out infinite', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '800px', height: '800px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        animation: 'splashPulse 3s ease-in-out 1s infinite', pointerEvents: 'none'
      }} />

      <style>{`
        @keyframes splashPulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%,-50%) scale(1.08); opacity: 1; }
        }
        @keyframes splashIcon {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashTitle {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashSub {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashBar {
          0% { width: 0; }
          100% { width: 100%; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        animation: 'splashIcon 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0.3s both',
        background: 'rgba(59,130,246,0.18)',
        border: '2px solid rgba(59,130,246,0.4)',
        borderRadius: '24px', padding: '22px', marginBottom: '28px',
        boxShadow: '0 0 40px rgba(59,130,246,0.25)',
        color: '#60a5fa', position: 'relative', zIndex: 1
      }}>
        <ShieldAlert size={64} strokeWidth={1.5} />
      </div>

      {/* Welcome text */}
      <div style={{ animation: 'splashTitle 0.7s ease-out 0.7s both', position: 'relative', zIndex: 1 }}>
        <p style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 600, color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Welcome to
        </p>
        <h1 style={{
          margin: 0, fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900,
          background: 'linear-gradient(90deg, #ffffff 0%, #60a5fa 60%, #93c5fd 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em', lineHeight: 1.15
        }}>
          Smart Gas Sensing Mask
        </h1>
        <h2 style={{
          margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: 700,
          background: 'linear-gradient(90deg, #93c5fd 0%, #c7d2fe 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em', lineHeight: 1.3, marginTop: '4px'
        }}>
          IoT System
        </h2>
      </div>

      {/* Subtitle */}
      <p style={{
        animation: 'splashSub 0.6s ease-out 1.1s both', position: 'relative', zIndex: 1,
        margin: '20px 0 36px 0', color: '#94a3b8', fontSize: 'clamp(0.85rem, 2vw, 1rem)',
        maxWidth: '520px', lineHeight: 1.6
      }}>
        Industrial-grade toxic gas detection, 3-axis motion tracking &amp; real-time safety alerts
      </p>

      {/* Progress bar */}
      <div style={{
        width: 'min(300px, 80vw)', height: '3px', borderRadius: '999px',
        background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
        position: 'relative', zIndex: 1, animation: 'splashSub 0.4s ease-out 1.3s both'
      }}>
        <div style={{
          height: '100%', borderRadius: '999px',
          background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
          animation: 'splashBar 2.2s ease-in-out 1.3s both',
          boxShadow: '0 0 8px rgba(59,130,246,0.6)'
        }} />
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', position: 'relative', zIndex: 1, animation: 'splashSub 0.4s ease-out 1.5s both' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6',
            animation: `dotBounce 1.2s ease-in-out ${1.6 + i * 0.18}s infinite`
          }} />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
