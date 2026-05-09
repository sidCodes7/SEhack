import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import ZonePolygons from './ZonePolygons';
import PulsingMarker from './PulsingMarker';
import HeatmapLayer from './HeatmapLayer';
import MapLegend from './MapLegend';
import { ZONES } from '../../data/zones';
import '../../styles/map.css';

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function AlertMarker({ alert }) {
  // Find zone coordinates from zone_id
  const zone = ZONES.find(z => z.id === `Z${alert.zone_id}`);
  if (!zone) return null;

  // Offset slightly so it doesn't overlap zone marker
  const lat = zone.lat + (Math.random() - 0.5) * 0.3;
  const lng = zone.lng + (Math.random() - 0.5) * 0.3;
  const color = alert.severity === 'critical' ? '#ff3b5c' : '#ff9f43';

  return (
    <CircleMarker
      center={[lat, lng]}
      radius={12}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 2,
        className: 'alert-marker-pulse',
      }}
    >
      <Tooltip>
        <div className="zone-tooltip">
          <div className="zone-tooltip-name">{alert.icon} {alert.label}</div>
          <div className="zone-tooltip-meta">{alert.zone_name}</div>
          <div className="zone-tooltip-severity" style={{ color }}>
            🚨 {alert.severity?.toUpperCase()} — {alert.confidence}% confidence
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
            {new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </Tooltip>
    </CircleMarker>
  );
}

export default function MapView({ zones, criticalAlerts = [], onZoneClick }) {
  return (
    <div className="map-container" id="map-view">
      <MapContainer
        center={[12, 78]}
        zoom={5}
        zoomControl={true}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <TileLayer url={DARK_TILES} />
        <ZonePolygons zones={zones} onZoneClick={onZoneClick} />
        <HeatmapLayer zones={zones} />
        {zones.map(zone => (
          <PulsingMarker key={zone.id} zone={zone} onClick={onZoneClick} />
        ))}
        {/* Critical alerts from simulation */}
        {criticalAlerts.map(alert => (
          <AlertMarker key={`alert-${alert.id}`} alert={alert} />
        ))}
      </MapContainer>
      <MapLegend />

      {/* Alert count overlay */}
      {criticalAlerts.length > 0 && (
        <div className="map-alert-count">
          🚨 {criticalAlerts.length} active alert{criticalAlerts.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
