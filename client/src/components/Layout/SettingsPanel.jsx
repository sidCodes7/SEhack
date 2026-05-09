import React from 'react';
import { ZONES, AGENTS as AGENT_DEFS } from '../../data/zones';

export default function SettingsPanel({ onClose }) {
  return (
    <>
      <div className="map-dimmer" onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 'var(--settings-width)', height: '100vh',
        background: 'var(--bg-glass-dense)', backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(0,212,170,0.1)',
        zIndex: 'var(--z-overlay)', overflowY: 'auto',
        padding: 'var(--space-xl)',
        animation: 'slide-in-right 350ms ease',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)'
      }} id="settings-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>⚙️ Settings</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Simulation */}
        <Section title="Simulation">
          <Row label="Speed">
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              {['Slow', 'Normal', 'Fast'].map(s => (
                <button key={s} className="btn btn-sm" style={s === 'Normal' ? { background: 'rgba(0,212,170,0.15)', color: 'var(--accent-primary)' } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Auto-start">
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider" />
            </label>
          </Row>
        </Section>

        {/* Zone Sensitivities */}
        <Section title="Zone Sensitivities">
          {ZONES.map(z => (
            <Row key={z.id} label={`${z.id} ${z.name.split(' ')[0]}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 1 }}>
                <input type="range" min="0" max="2" step="0.1" defaultValue={z.sensitivity}
                  style={{ flex: 1, accentColor: 'var(--accent-primary)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--accent-primary)', minWidth: '24px' }}>
                  {z.sensitivity}
                </span>
              </div>
            </Row>
          ))}
        </Section>

        {/* Agents */}
        <Section title="Agents">
          {AGENT_DEFS.map(a => (
            <Row key={a.id} label={`${a.icon} ${a.name}`}>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </Row>
          ))}
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <div style={{
        fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-dim)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        paddingBottom: 'var(--space-sm)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        marginBottom: 'var(--space-md)'
      }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 'var(--space-sm) 0',
      fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'
    }}>
      <span>{label}</span>
      {children}
    </div>
  );
}
