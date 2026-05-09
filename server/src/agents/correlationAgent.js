/**
 * AquaSentinel — Correlation Agent (RULE-BASED)
 * 🔗 Cross-zone pattern matching. NO LLM.
 */

import { markAgentProcessing, markAgentDone, markAgentError, createAgentLog } from './agentState.js';

const ADJACENCY = {
  Z1: ['Z5', 'Z7'],
  Z2: ['Z4', 'Z7'],
  Z3: ['Z4', 'Z7'],
  Z4: ['Z2', 'Z3', 'Z7'],
  Z5: ['Z1', 'Z8'],
  Z6: ['Z5'],
  Z7: ['Z1', 'Z2', 'Z3'],
  Z8: ['Z5', 'Z1'],
};

const CAUSAL_PATTERNS = {
  thermal_spike:     { related: ['bleaching_risk', 'hypoxia', 'bloom_signature'], rel: 'preceded_by' },
  bloom_signature:   { related: ['hypoxia', 'water_quality'], rel: 'correlated_with' },
  hypoxia:           { related: ['bloom_signature', 'water_quality'], rel: 'correlated_with' },
  bleaching_risk:    { related: ['thermal_spike', 'acidification'], rel: 'preceded_by' },
  acidification:     { related: ['bleaching_risk'], rel: 'correlated_with' },
  weather_extreme:   { related: ['sea_level_anomaly', 'water_quality'], rel: 'correlated_with' },
  sea_level_anomaly: { related: ['weather_extreme'], rel: 'correlated_with' },
  water_quality:     { related: ['bloom_signature', 'hypoxia'], rel: 'correlated_with' },
};

const TEMPORAL_WINDOW_MS = 48 * 60 * 60 * 1000;

function calcConfidence(a, b) {
  let c = 50;
  const causal = CAUSAL_PATTERNS[a.anomaly_type];
  if (causal?.related.includes(b.anomaly_type)) c += 25;
  if (a.severity === 'critical' && b.severity === 'critical') c += 15;
  else if (a.severity === 'critical' || b.severity === 'critical') c += 10;
  if ((a.score + b.score) / 2 > 70) c += 10;
  return Math.min(c, 100);
}

export async function runCorrelationAgent(state, onEvent) {
  const startTime = Date.now();
  const { anomalies } = state;

  markAgentProcessing('correlation', `Cross-referencing ${anomalies.length} anomalies...`);
  onEvent('agent_status', { agent: 'correlation', status: 'processing' });

  try {
    const correlations = [];
    const seen = new Set();

    for (let i = 0; i < anomalies.length; i++) {
      for (let j = i + 1; j < anomalies.length; j++) {
        const a = anomalies[i], b = anomalies[j];
        if (a.zone_id === b.zone_id) continue;
        if (!ADJACENCY[a.zone_id]?.includes(b.zone_id)) continue;

        const timeA = new Date(a.detected_at || Date.now()).getTime();
        const timeB = new Date(b.detected_at || Date.now()).getTime();
        if (Math.abs(timeA - timeB) > TEMPORAL_WINDOW_MS) continue;

        const key = [a.zone_id, b.zone_id].sort().join('-') + `-${a.anomaly_type}-${b.anomaly_type}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const causalA = CAUSAL_PATTERNS[a.anomaly_type];
        const causalB = CAUSAL_PATTERNS[b.anomaly_type];
        let relType = 'correlated_with';
        if (causalA?.related.includes(b.anomaly_type)) relType = causalA.rel;
        else if (causalB?.related.includes(a.anomaly_type)) relType = causalB.rel;

        correlations.push({
          from_zone: a.zone_id, to_zone: b.zone_id,
          from_type: a.anomaly_type, to_type: b.anomaly_type,
          relationship: relType,
          confidence: calcConfidence(a, b),
          reasoning: `${a.anomaly_type} in ${a.zone_id} ${relType} ${b.anomaly_type} in ${b.zone_id}`,
        });
      }
    }

    const durationMs = Date.now() - startTime;
    markAgentDone('correlation', anomalies.length, durationMs);
    onEvent('agent_status', { agent: 'correlation', status: 'idle', duration: durationMs });

    for (const corr of correlations) {
      onEvent('correlation_found', { from: corr.from_zone, to: corr.to_zone, type: corr.relationship, confidence: corr.confidence });
    }

    const log = createAgentLog('correlation', 'cross_zone_correlation',
      `${anomalies.length} anomalies`, `${correlations.length} correlations found`, durationMs);

    return { ...state, correlations, agentLogs: [...state.agentLogs, log] };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    markAgentError('correlation', error.message);
    onEvent('agent_status', { agent: 'correlation', status: 'error', error: error.message });
    const log = createAgentLog('correlation', 'error', `${anomalies.length} anomalies`, `Error: ${error.message}`, durationMs);
    return { ...state, correlations: [], agentLogs: [...state.agentLogs, log] };
  }
}
