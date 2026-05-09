import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { SEVERITY_CONFIG } from '../../data/zones';

export default function ZonePolygons({ zones, onZoneClick }) {
  return (
    <>
      {zones.map(zone => {
        const cfg = SEVERITY_CONFIG[zone.severity] || SEVERITY_CONFIG.normal;
        const positions = zone.polygon.map(([lat, lng]) => [lat, lng]);
        return (
          <Polygon
            key={zone.id}
            positions={positions}
            pathOptions={{
              color: '#00d4aa',
              weight: 1.5,
              opacity: 0.4,
              fillColor: cfg.color,
              fillOpacity: cfg.fillOpacity,
            }}
            eventHandlers={{
              click: () => onZoneClick?.(zone),
              mouseover: (e) => { e.target.setStyle({ weight: 2.5, opacity: 0.7 }); },
              mouseout: (e) => { e.target.setStyle({ weight: 1.5, opacity: 0.4 }); },
            }}
          >
            <Tooltip sticky>
              <div className="zone-tooltip">
                <div className="zone-tooltip-name">{zone.name}</div>
                <div className="zone-tooltip-meta">{zone.id} · {zone.region}</div>
                <div className="zone-tooltip-severity" style={{ color: cfg.color }}>
                  {cfg.icon} {cfg.label} — {zone.risk}
                </div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
