import React from 'react';
import { SEVERITY_CONFIG } from '../../data/zones';

export default function MapLegend() {
  return (
    <div className="map-legend glass-card">
      <div className="map-legend-title">Severity</div>
      {Object.entries(SEVERITY_CONFIG).filter(([k]) => k !== 'suppressed').map(([key, cfg]) => (
        <div className="map-legend-item" key={key}>
          <div className="map-legend-dot" style={{ background: cfg.color }} />
          <span>{cfg.label}</span>
        </div>
      ))}
    </div>
  );
}
