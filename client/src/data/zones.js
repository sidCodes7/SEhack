// AquaSentinel — Static Zone Definitions
// 8 zones along Indian Ocean coast (hardcoded for Phase 1-3)

export const ZONES = [
  {
    id: 'Z1', name: 'Lakshadweep Coral Reef', region: 'Arabian Sea',
    lat: 10.57, lng: 72.63, risk: 'Coral bleaching',
    icon: '🪸', sensitivity: 1.0, severity: 'critical',
    polygon: [[10.8,72.3],[10.8,73.0],[10.3,73.0],[10.3,72.3]],
    baseline: { sst: 28.0, chlorophyll: 0.3, dissolved_o2: 6.5, ph: 8.1, turbidity: 1.5, salinity: 35.0 },
    current: { sst: 29.8, sst_anomaly: 1.8, chlorophyll: 0.45, dissolved_o2: 5.8, ph: 8.05, turbidity: 3.2, salinity: 35.1 }
  },
  {
    id: 'Z2', name: 'Gujarat Mangrove Coast', region: 'Gulf of Khambhat',
    lat: 21.63, lng: 72.18, risk: 'HABs',
    icon: '🦠', sensitivity: 1.0, severity: 'warning',
    polygon: [[22.0,71.8],[22.0,72.6],[21.3,72.6],[21.3,71.8]],
    baseline: { sst: 27.5, chlorophyll: 0.9, dissolved_o2: 6.0, ph: 8.05, turbidity: 4.0, salinity: 34.5 },
    current: { sst: 28.2, sst_anomaly: 0.7, chlorophyll: 4.2, dissolved_o2: 5.5, ph: 7.98, turbidity: 5.1, salinity: 34.8 }
  },
  {
    id: 'Z3', name: 'Kerala Upwelling Zone', region: 'Arabian Sea',
    lat: 9.93, lng: 76.26, risk: 'Hypoxia',
    icon: '💀', sensitivity: 0.9, severity: 'warning',
    polygon: [[10.2,75.9],[10.2,76.6],[9.6,76.6],[9.6,75.9]],
    baseline: { sst: 27.8, chlorophyll: 0.5, dissolved_o2: 5.5, ph: 8.08, turbidity: 2.0, salinity: 34.8 },
    current: { sst: 28.1, sst_anomaly: 0.3, chlorophyll: 0.6, dissolved_o2: 3.2, ph: 8.02, turbidity: 2.4, salinity: 34.9 }
  },
  {
    id: 'Z4', name: 'Mumbai Offshore', region: 'Arabian Sea',
    lat: 19.07, lng: 72.87, risk: 'Water quality',
    icon: '💧', sensitivity: 1.0, severity: 'watch',
    polygon: [[19.4,72.5],[19.4,73.2],[18.7,73.2],[18.7,72.5]],
    baseline: { sst: 27.2, chlorophyll: 0.7, dissolved_o2: 6.2, ph: 8.1, turbidity: 3.1, salinity: 35.2 },
    current: { sst: 27.5, sst_anomaly: 0.3, chlorophyll: 0.9, dissolved_o2: 5.9, ph: 8.08, turbidity: 12.4, salinity: 35.0 }
  },
  {
    id: 'Z5', name: 'Andaman Reef System', region: 'Bay of Bengal',
    lat: 11.74, lng: 92.66, risk: 'Bleaching',
    icon: '🪸', sensitivity: 1.1, severity: 'watch',
    polygon: [[12.1,92.3],[12.1,93.0],[11.4,93.0],[11.4,92.3]],
    baseline: { sst: 28.5, chlorophyll: 0.2, dissolved_o2: 6.8, ph: 8.12, turbidity: 0.8, salinity: 33.5 },
    current: { sst: 29.2, sst_anomaly: 0.7, chlorophyll: 0.25, dissolved_o2: 6.5, ph: 8.10, turbidity: 1.0, salinity: 33.6 }
  },
  {
    id: 'Z6', name: 'Sundarbans Delta', region: 'Bay of Bengal',
    lat: 21.94, lng: 89.18, risk: 'Sea level',
    icon: '🌊', sensitivity: 1.0, severity: 'normal',
    polygon: [[22.2,88.8],[22.2,89.5],[21.6,89.5],[21.6,88.8]],
    baseline: { sst: 27.0, chlorophyll: 1.2, dissolved_o2: 5.8, ph: 7.95, turbidity: 8.0, salinity: 28.0 },
    current: { sst: 27.3, sst_anomaly: 0.3, chlorophyll: 1.3, dissolved_o2: 5.6, ph: 7.93, turbidity: 8.5, salinity: 28.2 }
  },
  {
    id: 'Z7', name: 'Goa Coastal Strip', region: 'Arabian Sea',
    lat: 15.49, lng: 73.82, risk: 'Tourism impact',
    icon: '🏖️', sensitivity: 0.8, severity: 'normal',
    polygon: [[15.8,73.5],[15.8,74.1],[15.2,74.1],[15.2,73.5]],
    baseline: { sst: 27.5, chlorophyll: 0.4, dissolved_o2: 6.3, ph: 8.1, turbidity: 2.5, salinity: 35.0 },
    current: { sst: 27.7, sst_anomaly: 0.2, chlorophyll: 0.45, dissolved_o2: 6.1, ph: 8.09, turbidity: 2.8, salinity: 35.1 }
  },
  {
    id: 'Z8', name: 'Sri Lanka Southern Coast', region: 'Indian Ocean',
    lat: 6.03, lng: 80.22, risk: 'SST anomaly',
    icon: '🌡️', sensitivity: 1.0, severity: 'normal',
    polygon: [[6.3,79.9],[6.3,80.5],[5.7,80.5],[5.7,79.9]],
    baseline: { sst: 28.2, chlorophyll: 0.3, dissolved_o2: 6.4, ph: 8.1, turbidity: 1.2, salinity: 34.5 },
    current: { sst: 28.5, sst_anomaly: 0.3, chlorophyll: 0.35, dissolved_o2: 6.2, ph: 8.08, turbidity: 1.5, salinity: 34.6 }
  }
];

export const SEVERITY_ORDER = ['critical', 'warning', 'watch', 'normal', 'suppressed'];

export const SEVERITY_CONFIG = {
  critical:   { color: '#ff3b5c', label: 'Critical', icon: '🔴', fillOpacity: 0.3 },
  warning:    { color: '#ff9f43', label: 'Warning',  icon: '🟠', fillOpacity: 0.2 },
  watch:      { color: '#ffd93d', label: 'Watch',    icon: '🟡', fillOpacity: 0.1 },
  normal:     { color: '#00d4aa', label: 'Normal',   icon: '🟢', fillOpacity: 0.05 },
  suppressed: { color: '#4a5568', label: 'Suppressed', icon: '⚪', fillOpacity: 0.02 }
};

export const METRIC_CONFIG = {
  sst:          { label: 'SST', unit: '°C', icon: '🌡️', color: '#ff6b6b' },
  chlorophyll:  { label: 'Chlorophyll-a', unit: 'mg/m³', icon: '🦠', color: '#51cf66' },
  dissolved_o2: { label: 'Dissolved O₂', unit: 'mg/L', icon: '💀', color: '#339af0' },
  ph:           { label: 'pH', unit: '', icon: '⚗️', color: '#cc5de8' },
  turbidity:    { label: 'Turbidity', unit: 'NTU', icon: '💧', color: '#ff922b' },
  salinity:     { label: 'Salinity', unit: 'PSU', icon: '🌊', color: '#20c997' }
};

export const AGENTS = [
  { id: 'ingestion',   name: 'Ingestion',   icon: '📡', status: 'idle', processed: 0 },
  { id: 'detection',   name: 'Detection',   icon: '🔍', status: 'idle', processed: 0 },
  { id: 'correlation', name: 'Correlation', icon: '🔗', status: 'idle', processed: 0 },
  { id: 'triage',      name: 'Triage',      icon: '⚖️', status: 'idle', processed: 0 },
  { id: 'brief',       name: 'Brief',       icon: '📋', status: 'idle', processed: 0 },
  { id: 'dispatch',    name: 'Dispatch',    icon: '🚨', status: 'idle', processed: 0 },
  { id: 'learning',    name: 'Learning',    icon: '🧠', status: 'idle', processed: 0 }
];
