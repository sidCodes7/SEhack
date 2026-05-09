import React, { useState } from 'react';

export default function EmailPreview({ zone, onClose, onSend }) {
  const [recipient, setRecipient] = useState('ops@aquasentinel.io');

  if (!zone) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(5,10,24,0.85)', backdropFilter: 'blur(8px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade-in 300ms ease'
    }} onClick={onClose}>
      <div className="glass-card" onClick={e => e.stopPropagation()} style={{
        width: '560px', maxHeight: '80vh', overflow: 'auto',
        padding: 'var(--space-xl)', animation: 'fade-in-scale 350ms ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>📧 Email Alert Preview</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>To:</label>
          <input className="input" value={recipient} onChange={e => setRecipient(e.target.value)} />
        </div>

        <div style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          <strong>Subject:</strong> 🔴 CRITICAL | {zone.name}: Thermal Anomaly
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-xl)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
          lineHeight: 1.8, color: 'var(--text-secondary)'
        }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
            AQUASENTINEL CRITICAL ALERT
          </div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-sm)' }}>
            ZONE: {zone.name} ({zone.id})<br/>
            TYPE: Thermal Anomaly<br/>
            SEVERITY: ■■■ CRITICAL<br/>
            CONFIDENCE: 87%
          </div>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>SITUATION</strong><br/>
            Sustained thermal stress: +1.8°C above May baseline for 8 consecutive days. DHW 6.2°C-weeks. Current trajectory suggests mass bleaching within 4 days.
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>RECOMMENDED ACTIONS</strong><br/>
            1. Deploy monitoring buoys<br/>
            2. Alert reef management team<br/>
            3. Increase satellite coverage
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSend?.(recipient); onClose(); }}>📧 Send Email</button>
        </div>
      </div>
    </div>
  );
}
