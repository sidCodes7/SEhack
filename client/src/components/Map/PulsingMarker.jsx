import React from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { SEVERITY_CONFIG } from '../../data/zones';

export default function PulsingMarker({ zone, onClick }) {
  const cfg = SEVERITY_CONFIG[zone.severity] || SEVERITY_CONFIG.normal;
  const topMetric = zone.current?.sst_anomaly
    ? `SST: ${zone.current.sst}°C (${zone.current.sst_anomaly > 0 ? '+' : ''}${zone.current.sst_anomaly}°C)`
    : '';

  return (
    <CircleMarker
      center={[zone.lat, zone.lng]}
      radius={zone.severity === 'critical' ? 10 : zone.severity === 'warning' ? 8 : 6}
      pathOptions={{
        color: cfg.color,
        fillColor: cfg.color,
        fillOpacity: 0.6,
        weight: 2,
        className: `pulsing-marker ${zone.severity}`,
      }}
      eventHandlers={{ click: () => onClick?.(zone) }}
    >
      <Tooltip>
        <div className="zone-tooltip">
          <div className="zone-tooltip-name">{zone.icon} {zone.name}</div>
          <div className="zone-tooltip-meta">{topMetric}</div>
          <div className="zone-tooltip-severity" style={{ color: cfg.color }}>
            {cfg.icon} {cfg.label}
          </div>
        </div>
      </Tooltip>
    </CircleMarker>
  );
}
