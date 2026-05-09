// AquaSentinel — Mock Data for Phase 1-3

export const MOCK_ALERTS = [
  {
    id: 1, zone_id: 'Z1', zone_name: 'Lakshadweep Coral Reef',
    type: 'Thermal Anomaly', severity: 'critical', confidence: 87, score: 92,
    timestamp: '2026-05-08T13:42:00Z', status: 'escalated',
    icon: '🌡️',
    reasoning: 'Sustained +1.8°C above May baseline for 8 consecutive days. DHW: 6.2. Coral bleaching risk: HIGH. Multi-metric convergence detected — chlorophyll increase suggests stress response.',
    brief: 'Lakshadweep is experiencing sustained thermal stress. Current trajectory suggests DHW will exceed 8°C-weeks within 4 days, triggering mass bleaching. Similar pattern preceded 2024 bleaching event.'
  },
  {
    id: 2, zone_id: 'Z2', zone_name: 'Gujarat Mangrove Coast',
    type: 'Harmful Algal Bloom', severity: 'warning', confidence: 72, score: 78,
    timestamp: '2026-05-08T13:38:00Z', status: 'escalated',
    icon: '🦠',
    reasoning: 'Chlorophyll-a at 4.2 mg/m³ (baseline: 0.9). Pattern consistent with Noctiluca bloom initiation. Cross-zone correlation with Z4 turbidity spike.',
    brief: 'Gujarat coast showing rapid chlorophyll increase. Pattern matches historical HAB events. Recommend fishing advisory and toxin sampling within 24h.'
  },
  {
    id: 3, zone_id: 'Z3', zone_name: 'Kerala Upwelling Zone',
    type: 'Hypoxia Warning', severity: 'warning', confidence: 68, score: 71,
    timestamp: '2026-05-08T13:35:00Z', status: 'escalated',
    icon: '💀',
    reasoning: 'Dissolved O₂ at 3.2 mg/L (threshold: 4.0). 7-day declining trend at -0.3/day. Seasonal upwelling intensifying.',
    brief: 'Kerala upwelling zone entering hypoxic conditions. DO declining steadily. Fishing fleets should avoid zone. Monitor for fish kill reports.'
  },
  {
    id: 4, zone_id: 'Z4', zone_name: 'Mumbai Offshore',
    type: 'Water Quality Alert', severity: 'watch', confidence: 54, score: 58,
    timestamp: '2026-05-08T13:30:00Z', status: 'watch',
    icon: '💧',
    reasoning: 'Turbidity at 12.4 NTU (baseline: 3.1). Likely sediment discharge from recent rainfall. Monitoring for downstream impact.',
    brief: 'Mumbai offshore water quality degraded. Turbidity spike correlated with recent monsoon precipitation. No immediate biological threat detected.'
  },
  {
    id: 5, zone_id: 'Z5', zone_name: 'Andaman Reef System',
    type: 'Coral Bleaching Risk', severity: 'watch', confidence: 45, score: 48,
    timestamp: '2026-05-08T13:25:00Z', status: 'watch',
    icon: '🪸',
    reasoning: 'SST deviation +0.7°C. DHW at 3.2 — approaching concern threshold (4.0). Monitoring trajectory.',
    brief: 'Andaman reefs showing mild thermal stress. Not yet critical but trajectory warrants increased observation frequency.'
  }
];

export const MOCK_ALERT_STATS = {
  total: 52, suppressed: 47, escalated: 5, noise_pct: 71
};

function generateTimeSeries(baseValue, variance, days, trend) {
  const points = [];
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const t = now - i * 86400000;
    const noise = (Math.random() - 0.5) * variance;
    const trendVal = trend ? (days - i) * trend : 0;
    points.push({ timestamp: new Date(t).toISOString(), value: +(baseValue + noise + trendVal).toFixed(2) });
  }
  return points;
}

export const MOCK_TIMESERIES = {
  Z1: {
    sst: generateTimeSeries(28.0, 0.3, 30, 0.06),
    chlorophyll: generateTimeSeries(0.3, 0.1, 30, 0.005),
    dissolved_o2: generateTimeSeries(6.5, 0.3, 30, -0.02),
  },
  Z2: {
    sst: generateTimeSeries(27.5, 0.4, 30, 0.02),
    chlorophyll: generateTimeSeries(0.9, 0.5, 30, 0.1),
    dissolved_o2: generateTimeSeries(6.0, 0.3, 30, -0.015),
  },
  Z3: {
    sst: generateTimeSeries(27.8, 0.3, 30, 0.01),
    chlorophyll: generateTimeSeries(0.5, 0.15, 30, 0.003),
    dissolved_o2: generateTimeSeries(5.5, 0.4, 30, -0.07),
  }
};

export const MOCK_TIMELINE_EVENTS = [
  { id: 1, time: '10:00', agent: 'ingestion', icon: '📡', text: 'Ingested 8 zone readings', color: '#00d4aa' },
  { id: 2, time: '10:01', agent: 'detection', icon: '🔍', text: '3 anomalies detected', color: '#3b82f6' },
  { id: 3, time: '10:01', agent: 'correlation', icon: '🔗', text: '1 cross-zone correlation found', color: '#cc5de8' },
  { id: 4, time: '10:02', agent: 'triage', icon: '⚖️', text: '2 alerts suppressed as noise', color: '#ff9f43' },
  { id: 5, time: '10:02', agent: 'brief', icon: '📋', text: 'Generated briefings for Z1, Z2', color: '#51cf66' },
  { id: 6, time: '10:02', agent: 'dispatch', icon: '🚨', text: 'Critical email sent for Z1', color: '#ff3b5c' },
  { id: 7, time: '10:03', agent: 'learning', icon: '🧠', text: 'Sensitivity adjusted: Z5 → 1.1', color: '#ffd93d' },
];

export const MOCK_GRAPH_NODES = [
  { id: 'Z1', label: 'Lakshadweep', type: 'zone', color: '#3b82f6' },
  { id: 'Z3', label: 'Kerala', type: 'zone', color: '#3b82f6' },
  { id: 'Z5', label: 'Andaman', type: 'zone', color: '#3b82f6' },
  { id: 'E1', label: 'Thermal Event', type: 'event', color: '#ff3b5c' },
  { id: 'E2', label: 'Hypoxia Event', type: 'event', color: '#ff3b5c' },
  { id: 'E3', label: 'SST Event', type: 'event', color: '#ff3b5c' },
  { id: 'M1', label: 'SST Metric', type: 'metric', color: '#51cf66' },
  { id: 'A1', label: 'Alert Sent', type: 'alert', color: '#ff9f43' },
];

export const MOCK_GRAPH_EDGES = [
  { source: 'E1', target: 'Z1', label: 'OCCURRED_IN' },
  { source: 'E1', target: 'M1', label: 'TRIGGERED_BY' },
  { source: 'E3', target: 'Z5', label: 'OCCURRED_IN' },
  { source: 'E1', target: 'E3', label: 'PRECEDED_BY' },
  { source: 'E2', target: 'Z3', label: 'OCCURRED_IN' },
  { source: 'E1', target: 'A1', label: 'CAUSED' },
];
