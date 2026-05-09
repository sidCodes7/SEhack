import React from 'react';
import { SEVERITY_CONFIG, METRIC_CONFIG } from '../../data/zones';
import { MOCK_ALERTS } from '../../data/mockData';
import '../../styles/zone-detail.css';

export default function ZoneDetail({ zone, onClose, onEmailPreview }) {
  if (!zone) return null;
  const severity = SEVERITY_CONFIG[zone.severity] || SEVERITY_CONFIG.normal;
  const zoneAlerts = MOCK_ALERTS.filter(a => a.zone_id === zone.id);
  const metrics = Object.entries(METRIC_CONFIG);

  const getDelta = (key) => {
    const curr = zone.current?.[key];
    const base = zone.baseline?.[key];
    if (curr == null || base == null) return null;
    const diff = +(curr - base).toFixed(2);
    return { value: diff, dir: diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'stable' };
  };

  return (
    <>
      <div className="map-dimmer" onClick={onClose} />
      <div className="zone-detail-overlay" id="zone-detail">
        <button className="zone-detail-close" onClick={onClose}>✕</button>
        <div className="zone-detail-header">
          <div className="zone-detail-title">{zone.icon} {zone.name}</div>
          <div className="zone-detail-subtitle">Zone {zone.id} | {zone.region}</div>
          <div className="zone-detail-status" style={{ background: `${severity.color}15`, color: severity.color }}>
            {severity.icon} {severity.label.toUpperCase()}
          </div>
        </div>

        <div className="zone-detail-section">
          <div className="zone-detail-section-title">Current Readings</div>
          <div className="zone-readings-grid">
            {metrics.map(([key, cfg]) => {
              const val = zone.current?.[key];
              const delta = getDelta(key);
              return (
                <div className="zone-reading-item" key={key}>
                  <span className="zone-reading-icon">{cfg.icon}</span>
                  <div className="zone-reading-info">
                    <span className="zone-reading-label">{cfg.label}</span>
                    <span className="zone-reading-value">{val ?? '—'} {cfg.unit}</span>
                    {delta && (
                      <span className={`zone-reading-delta ${delta.dir}`}>
                        {delta.dir === 'up' ? '▲' : delta.dir === 'down' ? '▼' : '→'} {delta.value > 0 ? '+' : ''}{delta.value}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {zoneAlerts.length > 0 && (
          <div className="zone-detail-section">
            <div className="zone-detail-section-title">Active Anomalies</div>
            {zoneAlerts.map(alert => (
              <div key={alert.id} style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span className={`severity-dot ${alert.severity}`} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {alert.type} ({alert.confidence}% confidence)
                  </span>
                </div>
                <div className="zone-detail-brief">{alert.reasoning}</div>
              </div>
            ))}
          </div>
        )}

        {zoneAlerts[0]?.brief && (
          <div className="zone-detail-section">
            <div className="zone-detail-section-title">AI Briefing</div>
            <div className="zone-detail-brief">{zoneAlerts[0].brief}</div>
          </div>
        )}

        <div className="zone-detail-actions">
          <button className="btn btn-primary" onClick={() => onEmailPreview?.(zone)}>📧 Send Alert Email</button>
          <button className="btn">💬 Ask AI</button>
        </div>
      </div>
    </>
  );
}
