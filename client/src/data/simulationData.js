// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Rich Mock Simulation Data
// Generates a MASSIVE pool of realistic events for each agent
// ═══════════════════════════════════════════════════════════════

import { ZONES } from './zones';

// ── Zone lookup helper ──
const Z = (id) => ZONES.find(z => z.id === `Z${id}`) || { name: `Zone ${id}`, icon: '📡' };

// ── Random helpers ──
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => +(min + Math.random() * (max - min)).toFixed(2);
const randInt = (min, max) => Math.floor(min + Math.random() * (max - min));
let _eventId = 1000;
const nextId = () => _eventId++;

// ═══════════════════════════════════════════
// INGESTION — Sensor reading events
// ═══════════════════════════════════════════
const INGESTION_SOURCES = [
  'ISRO OceanSat-3 Pass', 'NOAA Sentinel-6 Downlink', 'INCOIS Buoy Network',
  'Argo Float #IN-4823', 'Copernicus Marine Service', 'NIOT Coastal Radar',
  'IMD AWS Station', 'GAGAN SBAS Relay', 'HF Radar Array', 'IoT Buoy Mesh',
  'Drone Survey UAV-07', 'Coastal CCTV Feed', 'AIS Ship Transponder',
];

export function generateIngestionEvent(zoneId) {
  const z = Z(zoneId);
  const base = z.baseline || {};
  return {
    id: nextId(),
    zone_id: zoneId,
    zone_name: z.name,
    zone_icon: z.icon,
    source: pick(INGESTION_SOURCES),
    timestamp: new Date().toISOString(),
    readings: {
      sst: rand((base.sst || 27) - 0.5, (base.sst || 27) + 2.5),
      chlorophyll: rand((base.chlorophyll || 0.3) * 0.5, (base.chlorophyll || 0.3) * 5),
      dissolved_o2: rand((base.dissolved_o2 || 6) - 2, (base.dissolved_o2 || 6) + 1),
      ph: rand((base.ph || 8.1) - 0.2, (base.ph || 8.1) + 0.05),
      turbidity: rand((base.turbidity || 2) * 0.3, (base.turbidity || 2) * 4),
      salinity: rand((base.salinity || 35) - 1, (base.salinity || 35) + 1),
      wind_speed: rand(2, 25),
      wave_height: rand(0.3, 4.5),
    },
    quality: pick(['excellent', 'good', 'good', 'good', 'fair', 'fair']),
    latency_ms: randInt(80, 3200),
  };
}

// ═══════════════════════════════════════════
// DETECTION — Anomaly detection events
// ═══════════════════════════════════════════
const ANOMALY_TYPES = [
  { type: 'thermal_spike', metric: 'sst', label: 'Thermal Spike', icon: '🌡️', severities: ['critical', 'warning'] },
  { type: 'harmful_algal_bloom', metric: 'chlorophyll', label: 'Harmful Algal Bloom', icon: '🦠', severities: ['critical', 'warning'] },
  { type: 'hypoxia_warning', metric: 'dissolved_o2', label: 'Hypoxia Warning', icon: '💀', severities: ['warning', 'critical'] },
  { type: 'coral_bleaching_risk', metric: 'sst', label: 'Coral Bleaching Risk', icon: '🪸', severities: ['warning', 'watch'] },
  { type: 'acidification_event', metric: 'ph', label: 'Acidification Event', icon: '⚗️', severities: ['watch', 'warning'] },
  { type: 'turbidity_surge', metric: 'turbidity', label: 'Turbidity Surge', icon: '💧', severities: ['watch', 'watch'] },
  { type: 'salinity_anomaly', metric: 'salinity', label: 'Salinity Anomaly', icon: '🌊', severities: ['watch', 'normal'] },
  { type: 'upwelling_intensification', metric: 'sst', label: 'Upwelling Intensification', icon: '🔄', severities: ['warning', 'watch'] },
  { type: 'storm_surge_risk', metric: 'wave_height', label: 'Storm Surge Risk', icon: '🌀', severities: ['critical', 'warning'] },
  { type: 'pollution_plume', metric: 'turbidity', label: 'Pollution Plume', icon: '🏭', severities: ['warning', 'watch'] },
];

const REASONING_TEMPLATES = {
  thermal_spike: [
    'SST +{delta}°C above {days}-day baseline for {streak} consecutive days. DHW approaching {dhw}. {risk} risk HIGH.',
    'Rapid thermal ramp detected at +{ramp}°C/day. Current SST {sst}°C exceeds seasonal maximum by {delta}°C.',
    'Multi-sensor confirmation: AVHRR, MODIS, and in-situ buoy all register SST anomaly of +{delta}°C.',
  ],
  harmful_algal_bloom: [
    'Chlorophyll-a at {chl}× baseline ({baseline}→{current} mg/m³). Pattern consistent with {species} bloom initiation.',
    'Spectral signature matches {species} bloom. Toxin risk: {toxin}. DO declining at {rate} mg/L/day.',
    'Satellite imagery shows {area} km² bloom extent. Cross-zone nutrient transport from riverine discharge detected.',
  ],
  hypoxia_warning: [
    'Dissolved O₂ at {do} mg/L (threshold: 4.0). {days}-day declining trend at {rate}/day. Seasonal upwelling intensifying.',
    'Subsurface oxygen depletion confirmed by Argo float profile. Dead zone formation risk: {risk}%.',
    'DO gradient steepening: surface {surface} mg/L → bottom {bottom} mg/L. Stratification preventing mixing.',
  ],
  coral_bleaching_risk: [
    'DHW at {dhw} (bleaching threshold: 4.0). SST deviation +{delta}°C sustained for {days} days.',
    'Photosynthetic stress indicators elevated. Coral Reef Watch alert level: {level}. Monitoring trajectory.',
    'Adjacent reef {adj} showed bleaching at similar DHW levels in {year}. Proactive monitoring recommended.',
  ],
  acidification_event: [
    'pH dropped to {ph} (baseline: {base}). Aragonite saturation declining. Shell-forming organisms at risk.',
    'pCO₂ elevated to {pco2} µatm. Ocean carbon sink capacity reduced in this zone.',
  ],
  turbidity_surge: [
    'Turbidity at {turb} NTU ({mult}× baseline). Likely {cause}. Monitoring for downstream biological impact.',
    'Sediment plume detected via satellite. Estimated extent: {area} km². Light attenuation affecting benthic organisms.',
  ],
  salinity_anomaly: [
    'Salinity deviated to {sal} PSU (baseline: {base}). Freshwater intrusion from {source} detected.',
    'Halocline disruption observed. Surface-bottom salinity gradient: {grad} PSU. Mixing event likely.',
  ],
  upwelling_intensification: [
    'Ekman transport intensified by {pct}%. Cold nutrient-rich water upwelling at {rate}m/day.',
    'SST dropped {delta}°C in {hours}h — classic upwelling signature. Chlorophyll bloom expected in 48-72h.',
  ],
  storm_surge_risk: [
    'Wave height {wh}m with {period}s period. Wind speed {ws} km/h from {dir}. Storm surge risk: {risk}.',
    'Cyclonic activity detected {dist}km offshore. Projected surge: {surge}m. Coastal flooding advisory issued.',
  ],
  pollution_plume: [
    'Anomalous turbidity + chlorophyll pattern inconsistent with natural bloom. Industrial discharge suspected.',
    'Oil sheen detection confidence: {conf}%. Spectral analysis shows hydrocarbon signature. Source: {source}.',
  ],
};

export function generateDetectionEvent(ingestionEvent) {
  const anomalyType = pick(ANOMALY_TYPES);
  const severity = pick(anomalyType.severities);
  const confidence = severity === 'critical' ? rand(75, 95) : severity === 'warning' ? rand(55, 85) : rand(30, 65);
  const score = +(confidence * (severity === 'critical' ? 1.1 : severity === 'warning' ? 0.95 : 0.7)).toFixed(0);

  const templates = REASONING_TEMPLATES[anomalyType.type] || ['Anomaly detected in metric {metric}.'];
  let reasoning = pick(templates)
    .replace('{delta}', rand(0.5, 2.5))
    .replace('{days}', randInt(5, 30))
    .replace('{streak}', randInt(3, 12))
    .replace('{dhw}', rand(3.5, 8.2))
    .replace('{risk}', pick(['Coral bleaching', 'Marine ecosystem', 'Fishery disruption']))
    .replace('{ramp}', rand(0.1, 0.5))
    .replace('{sst}', rand(28, 32))
    .replace('{chl}', rand(2, 6))
    .replace('{baseline}', rand(0.2, 1.0))
    .replace('{current}', rand(1.5, 5.0))
    .replace('{species}', pick(['Noctiluca scintillans', 'Trichodesmium', 'Karenia brevis', 'Alexandrium']))
    .replace('{toxin}', pick(['Low', 'Moderate', 'High']))
    .replace('{rate}', rand(0.1, 0.5))
    .replace('{do}', rand(2.5, 4.5))
    .replace('{surface}', rand(5, 7))
    .replace('{bottom}', rand(1.5, 3.5))
    .replace('{ph}', rand(7.7, 8.0))
    .replace('{base}', rand(8.05, 8.15))
    .replace('{turb}', rand(8, 25))
    .replace('{mult}', rand(2, 6))
    .replace('{cause}', pick(['sediment discharge', 'dredging activity', 'riverine flood', 'coastal construction']))
    .replace('{area}', randInt(5, 80))
    .replace('{sal}', rand(28, 37))
    .replace('{source}', pick(['monsoon runoff', 'river discharge', 'glacial melt', 'desalination outfall']))
    .replace('{grad}', rand(2, 8))
    .replace('{pct}', randInt(15, 60))
    .replace('{hours}', randInt(6, 48))
    .replace('{wh}', rand(2, 6))
    .replace('{period}', randInt(6, 14))
    .replace('{ws}', randInt(30, 120))
    .replace('{dir}', pick(['NW', 'SW', 'SE', 'W']))
    .replace('{surge}', rand(0.5, 3))
    .replace('{dist}', randInt(50, 400))
    .replace('{level}', pick(['Watch', 'Warning', 'Alert Level 1', 'Alert Level 2']))
    .replace('{adj}', pick(['Lakshadweep', 'Andaman', 'Maldives']))
    .replace('{year}', pick(['2023', '2024', '2025']))
    .replace('{pco2}', randInt(420, 550))
    .replace('{conf}', randInt(45, 90))
    .replace('{metric}', anomalyType.metric);

  return {
    id: nextId(),
    zone_id: ingestionEvent.zone_id,
    zone_name: ingestionEvent.zone_name,
    zone_icon: ingestionEvent.zone_icon,
    anomaly_type: anomalyType.type,
    label: anomalyType.label,
    icon: anomalyType.icon,
    severity,
    confidence: +confidence.toFixed(1),
    score: Math.min(100, score),
    reasoning,
    detected_at: new Date().toISOString(),
    source_reading: ingestionEvent.id,
  };
}

// ═══════════════════════════════════════════
// CORRELATION — Cross-zone correlation events
// ═══════════════════════════════════════════
const CORRELATION_PATTERNS = [
  { from: 1, to: 5, desc: 'Indian Ocean Dipole thermal propagation — {lag}-day lag observed', match: [82, 88, 91],
    mechanism: 'Equatorial Kelvin wave propagation', metrics: ['sst', 'chlorophyll'], species: ['staghorn coral', 'reef fish'] },
  { from: 3, to: 4, desc: 'Upwelling-driven nutrient transport via Arabian Sea coastal current', match: [67, 72, 78],
    mechanism: 'Ekman-driven coastal upwelling', metrics: ['dissolved_o2', 'chlorophyll', 'sst'], species: ['sardine', 'mackerel'] },
  { from: 2, to: 4, desc: 'Gulf of Khambhat bloom spreading southward along Gujarat coast', match: [55, 61, 73],
    mechanism: 'Longshore current transport', metrics: ['chlorophyll', 'turbidity'], species: ['shrimp', 'pomfret'] },
  { from: 1, to: 3, desc: 'Monsoon-driven SST anomaly corridor from Lakshadweep to Kerala', match: [60, 65, 70],
    mechanism: 'Southwest monsoon wind forcing', metrics: ['sst', 'salinity', 'wave_height'], species: ['tuna', 'dolphin'] },
  { from: 6, to: 8, desc: 'Bay of Bengal salinity gradient shift affecting both deltas', match: [48, 55, 62],
    mechanism: 'Riverine freshwater discharge mixing', metrics: ['salinity', 'turbidity', 'ph'], species: ['hilsa', 'mudcrab'] },
  { from: 5, to: 8, desc: 'Andaman-Sri Lanka warm pool connection via equatorial current', match: [58, 63, 69],
    mechanism: 'Equatorial Jet current', metrics: ['sst', 'dissolved_o2'], species: ['whale shark', 'manta ray'] },
  { from: 2, to: 3, desc: 'Post-monsoon chlorophyll bloom cascade from Gujarat to Kerala', match: [45, 52, 59],
    mechanism: 'Post-monsoon nutrient flush', metrics: ['chlorophyll', 'dissolved_o2', 'ph'], species: ['Noctiluca', 'anchovy'] },
  { from: 4, to: 7, desc: 'Coastal construction runoff corridor from Mumbai to Goa', match: [40, 47, 53],
    mechanism: 'Anthropogenic sediment transport', metrics: ['turbidity', 'ph'], species: ['oyster', 'mussel'] },
  { from: 1, to: 8, desc: 'Pan-Indian Ocean MJO thermal oscillation signature', match: [35, 42, 50],
    mechanism: 'Madden-Julian Oscillation', metrics: ['sst', 'wave_height', 'wind_speed'], species: ['sea turtle', 'flying fish'] },
  { from: 3, to: 6, desc: 'Cross-peninsular DO depression corridor linking west and east coasts', match: [38, 45, 55],
    mechanism: 'Coastal boundary current exchange', metrics: ['dissolved_o2', 'sst'], species: ['crab larvae', 'prawn'] },
];

const CORRELATION_INSIGHTS = [
  'This pattern has been observed {count} times in the last {years} years with {hit}% accuracy.',
  'Graph database shows {edges} edge connections between these zones in the knowledge graph.',
  'Temporal analysis suggests the effect reaches Zone {to_id} within {lag} days of detection in Zone {from_id}.',
  'Historical precedent: {year} {event} event showed identical cross-zone metric propagation.',
  'Satellite imagery confirms visible {feature} between zones. Ground-truth confidence: {gt}%.',
];

export function generateCorrelationEvent(anomalies) {
  const pattern = pick(CORRELATION_PATTERNS);
  const lag = randInt(1, 7);
  const insight = pick(CORRELATION_INSIGHTS)
    .replace('{count}', randInt(3, 18))
    .replace('{years}', randInt(2, 8))
    .replace('{hit}', randInt(55, 92))
    .replace('{edges}', randInt(4, 15))
    .replace('{to_id}', pattern.to)
    .replace('{from_id}', pattern.from)
    .replace('{lag}', lag)
    .replace('{year}', pick(['2022', '2023', '2024', '2025']))
    .replace('{event}', pick(['El Niño', 'La Niña', 'IOD positive', 'cyclone Biparjoy']))
    .replace('{feature}', pick(['chlorophyll plume', 'thermal gradient', 'sediment trail', 'salinity front']))
    .replace('{gt}', randInt(60, 95));

  return {
    id: nextId(),
    from_zone: pattern.from,
    to_zone: pattern.to,
    from_name: Z(pattern.from).name,
    from_icon: Z(pattern.from).icon,
    to_name: Z(pattern.to).name,
    to_icon: Z(pattern.to).icon,
    match_pct: pick(pattern.match),
    description: pattern.desc.replace('{lag}', lag),
    mechanism: pattern.mechanism,
    shared_metrics: pattern.metrics,
    affected_species: pattern.species,
    temporal_lag_days: lag,
    insight,
    anomaly_count: anomalies.length,
    graph_edges: randInt(3, 12),
    confidence_breakdown: {
      spatial: randInt(50, 95),
      temporal: randInt(40, 90),
      metric: randInt(55, 95),
    },
    timestamp: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════
// TRIAGE — Alert prioritization decisions
// ═══════════════════════════════════════════
// ~70% suppressed, ~20% uncertain (debate), ~10% escalated
export function generateTriageDecision(anomaly) {
  const roll = Math.random();
  let decision, reason;

  // Only auto-escalate if BOTH critical severity AND very high confidence
  if (anomaly.severity === 'critical' && anomaly.confidence > 85) {
    decision = 'escalated';
    reason = `Extreme confidence (${anomaly.confidence}%) + CRITICAL severity → auto-escalated for briefing.`;
  } else if (roll < 0.20) {
    // ~20% uncertain → multi-agent debate
    decision = 'uncertain';
    reason = pick([
      `Borderline confidence (${anomaly.confidence}%). Multi-agent debate required — human input needed.`,
      `Conflicting signals: ${anomaly.label} detected but adjacent zone shows normal readings. Debate required.`,
      `Score ${anomaly.score} falls in gray zone (45-65). AI agents disagree — requesting human adjudication.`,
      `Anomaly type ${anomaly.label} has mixed historical accuracy (52%). Routing to debate.`,
    ]);
  } else if (roll < 0.30) {
    // ~10% escalated
    decision = 'escalated';
    reason = pick([
      `Score ${anomaly.score} exceeds dynamic escalation threshold. Zone sensitivity: ${rand(0.7, 1.2)}.`,
      `Multi-metric convergence detected across ${randInt(2, 4)} indicators. Cross-validated with adjacent zone.`,
      `Rate of change exceeds 2σ of historical norm. Escalating for briefing.`,
    ]);
  } else {
    // ~70% suppressed
    decision = 'suppressed';
    reason = pick([
      `Historical false-positive rate for ${anomaly.label} in this zone: ${randInt(55, 85)}%. Suppressing as noise.`,
      `Similar reading ${randInt(12, 72)}h ago was marked false positive by operator. Applying learned threshold.`,
      `Anomaly score ${anomaly.score} below dynamic threshold (${randInt(60, 75)}). Noise classification.`,
      `Seasonal adjustment: ${anomaly.label} is within expected ${pick(['monsoon', 'pre-monsoon', 'post-monsoon', 'winter'])} variability (±${rand(1.0, 2.5)}σ).`,
      `Single-sensor detection without corroboration. Confidence insufficient for escalation.`,
      `Zone ${anomaly.zone_name}: learned sensitivity ${rand(0.5, 0.8)} suppresses this anomaly class.`,
      `Tidal cycle correlation detected (r²=${rand(0.6, 0.9)}). Natural variation, not anomaly.`,
    ]);
  }

  return {
    id: nextId(),
    anomaly_id: anomaly.id,
    anomaly,
    decision,
    reason,
    timestamp: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════
// DEBATE — Multi-agent debate for uncertain cases
// ═══════════════════════════════════════════
const DEBATE_AGENTS = [
  { name: 'Detection Agent', icon: '🔍', color: '#339af0', bias: 'escalate' },
  { name: 'Historical Analyst', icon: '📊', color: '#cc5de8', bias: 'suppress' },
  { name: 'Risk Assessor', icon: '⚠️', color: '#ff922b', bias: 'escalate' },
  { name: 'Noise Filter', icon: '🔇', color: '#868e96', bias: 'suppress' },
  { name: 'Environmental Expert', icon: '🌍', color: '#20c997', bias: 'escalate' },
];

const DEBATE_ARGUMENTS = {
  escalate: [
    'The {metric} deviation of {delta} exceeds the 95th percentile of historical readings. This is statistically significant.',
    'Similar patterns in {adj_zone} preceded a confirmed {event} event by {days} days. Precautionary escalation recommended.',
    'Even at {conf}% confidence, the potential impact (estimated ₹{cost}Cr damage) justifies escalation.',
    'Cross-zone correlation at {match}% strengthens this signal. Not an isolated noise artifact.',
    'Rate of change ({rate}/day) is accelerating. Waiting could miss the intervention window.',
    'Downstream ecological dependencies at risk: {species} spawning season is active in this zone.',
  ],
  suppress: [
    'Historical false positive rate for this zone+metric combination: {fp_rate}%. Likely noise.',
    'Seasonal adjustment shows this falls within normal monsoon pre-season variability (±{sigma}σ).',
    'Operator feedback on 3 similar alerts in the past month: all marked as false positives.',
    'The {metric} reading reverted to baseline within {hours}h in {count} of last {total} similar events.',
    'Correlation with tide tables shows this is a predictable tidal influence, not an anomaly.',
    'Model uncertainty at {unc}% — insufficient confidence for resource-intensive field response.',
  ],
};

export function generateDebate(triageDecision) {
  const anomaly = triageDecision.anomaly;
  const debaters = DEBATE_AGENTS.slice(0, randInt(3, 5));
  const rounds = debaters.map((agent, i) => {
    const templates = DEBATE_ARGUMENTS[agent.bias];
    let argument = pick(templates)
      .replace('{metric}', anomaly.label)
      .replace('{delta}', rand(0.5, 3.0))
      .replace('{adj_zone}', pick(['Lakshadweep', 'Kerala', 'Andaman', 'Gujarat']))
      .replace('{event}', pick(['coral bleaching', 'fish kill', 'HAB', 'hypoxia']))
      .replace('{days}', randInt(2, 14))
      .replace('{conf}', anomaly.confidence)
      .replace('{cost}', randInt(5, 200))
      .replace('{match}', randInt(55, 85))
      .replace('{rate}', rand(0.1, 0.8))
      .replace('{species}', pick(['sea turtle', 'reef fish', 'mangrove crab', 'whale shark']))
      .replace('{fp_rate}', randInt(40, 80))
      .replace('{sigma}', rand(1.2, 2.5))
      .replace('{hours}', randInt(6, 48))
      .replace('{count}', randInt(4, 8))
      .replace('{total}', randInt(8, 12))
      .replace('{unc}', randInt(35, 60));
    return { ...agent, argument, delay: (i + 1) * randInt(1500, 3000) };
  });

  const escCount = rounds.filter(r => r.bias === 'escalate').length;
  const supCount = rounds.filter(r => r.bias === 'suppress').length;

  return {
    id: nextId(),
    anomaly,
    triage: triageDecision,
    rounds,
    vote: { escalate: escCount, suppress: supCount },
    verdict: escCount > supCount ? 'leaning_escalate' : escCount < supCount ? 'leaning_suppress' : 'deadlocked',
    awaiting_human: true,
    timestamp: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════
// BRIEF — AI briefing summaries
// ═══════════════════════════════════════════
const BRIEF_TEMPLATES = [
  `**{zone} — {type} Alert**\n\nCurrent {metric} readings show {delta} deviation from the {days}-day baseline. {reasoning}\n\n**Recommended Actions:**\n1. Deploy field monitoring team within {hours}h\n2. Issue {advisory} advisory for nearby communities\n3. Increase sensor polling frequency to {freq}-minute intervals\n4. Coordinate with {agency} for satellite confirmation`,
  `**Situational Brief: {zone}**\n\nSeverity: **{severity}** | Confidence: {confidence}%\n\nThe {type} event has been developing over the past {days} days. Key indicators:\n- Primary metric deviation: {delta}\n- Trend: {trend}\n- Cross-zone correlation: {corr}%\n\n**Impact Assessment:** {impact}\n\n**Response Priority:** {priority}`,
];

export function generateBrief(anomaly) {
  let brief = pick(BRIEF_TEMPLATES)
    .replace(/{zone}/g, anomaly.zone_name)
    .replace('{type}', anomaly.label)
    .replace('{metric}', anomaly.anomaly_type?.replace(/_/g, ' '))
    .replace('{delta}', `+${rand(0.5, 3)}`)
    .replace(/{days}/g, randInt(3, 15))
    .replace('{reasoning}', anomaly.reasoning?.split('.')[0] + '.')
    .replace('{hours}', randInt(4, 24))
    .replace('{advisory}', pick(['fishing', 'diving', 'navigation', 'coastal']))
    .replace('{freq}', pick(['5', '10', '15']))
    .replace('{agency}', pick(['ISRO', 'INCOIS', 'NIOT', 'MoES', 'Coast Guard']))
    .replace('{severity}', anomaly.severity?.toUpperCase())
    .replace('{confidence}', anomaly.confidence)
    .replace('{trend}', pick(['Accelerating', 'Stable', 'Decelerating but elevated']))
    .replace('{corr}', randInt(45, 88))
    .replace('{impact}', pick([
      'Potential fish kill affecting 200+ fishermen livelihoods',
      'Coral colony mortality risk — 15,000 hectares vulnerable',
      'Mangrove ecosystem disruption — carbon sink capacity reduced',
      'Tourism revenue impact — estimated ₹12Cr loss if beach closure required',
    ]))
    .replace('{priority}', pick(['IMMEDIATE', 'HIGH', 'ELEVATED']));
  return {
    id: nextId(),
    anomaly_id: anomaly.id,
    zone_name: anomaly.zone_name,
    severity: anomaly.severity,
    content: brief,
    generated_at: new Date().toISOString(),
    tokens: randInt(150, 400),
    model: 'grok-4-1-fast-reasoning',
  };
}

// ═══════════════════════════════════════════
// DISPATCH — Email notification events
// ═══════════════════════════════════════════
const RECIPIENTS = [
  'ops-critical@aquasentinel.org', 'marine-safety@incois.gov.in',
  'field-team-west@aquasentinel.org', 'field-team-east@aquasentinel.org',
  'coastal-guard@icg.gov.in', 'director@niot.res.in',
  'reef-monitoring@moef.gov.in', 'disaster-mgmt@ndma.gov.in',
];

export function generateDispatch(anomaly, brief) {
  return {
    id: nextId(),
    anomaly_id: anomaly.id,
    zone_id: anomaly.zone_id,
    zone_name: anomaly.zone_name,
    severity: anomaly.severity,
    label: anomaly.label,
    confidence: anomaly.confidence,
    reasoning: anomaly.reasoning,
    recipient: 'hetsalot1410@gmail.com',
    subject: `[${anomaly.severity.toUpperCase()}] ${anomaly.zone_name} — ${anomaly.label}`,
    status: 'pending_approval',
    created_at: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════
// LEARNING — Sensitivity update events
// ═══════════════════════════════════════════
export function generateLearningUpdate(triageResults) {
  const zoneId = randInt(1, 8);
  const z = Z(zoneId);
  const oldSens = rand(0.7, 1.3);
  const newSens = +(oldSens + (Math.random() > 0.5 ? -0.1 : 0.1)).toFixed(1);
  return {
    id: nextId(),
    zone_id: zoneId,
    zone_name: z.name,
    old_sensitivity: oldSens,
    new_sensitivity: newSens,
    direction: newSens > oldSens ? 'increased' : 'decreased',
    reason: newSens > oldSens
      ? `${randInt(2, 5)} missed true positives in last 7 days. Increasing sensitivity to catch more.`
      : `${randInt(3, 6)} consecutive false positives. Decreasing sensitivity to reduce noise.`,
    feedback_count: randInt(2, 8),
    timestamp: new Date().toISOString(),
  };
}
