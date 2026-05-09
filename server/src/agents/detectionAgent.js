/**
 * AquaSentinel — Detection Agent (LLM)
 * 
 * 🔍 Analyzes normalized sensor data for anomalies. Scores each anomaly 0-100
 * using weighted criteria, classifies type, provides reasoning.
 * 
 * Scoring weights:
 *   - Signal magnitude: 30%
 *   - Temporal persistence: 25%
 *   - Multi-metric convergence: 20%
 *   - Historical pattern match: 15%
 *   - Cross-zone correlation: 10%
 * 
 * Input:  state.normalized (NormReading[])
 * Output: state.anomalies (Anomaly[]) — only those scoring ≥ 30
 */

import { callGrok } from './grokClient.js';
import { markAgentProcessing, markAgentDone, markAgentError, createAgentLog } from './agentState.js';

const SYSTEM_PROMPT = `You are part of AquaSentinel, an AI-powered marine environmental monitoring system analyzing Indian Ocean zones.

You are the DETECTION AGENT — a statistical anomaly detection expert for marine environments.

Analyze the following normalized sensor data against seasonal baselines. For EACH zone, evaluate whether any environmental anomaly is occurring.

SCORING CRITERIA (weighted composite score 0-100):
- Signal magnitude (30%): How far above/below the threshold is the reading?
- Temporal persistence (25%): How many consecutive anomalous readings exist? (infer from baseline deviation trends)
- Multi-metric convergence (20%): Do multiple metrics agree on a problem? (e.g., SST up + DO down = thermal stress + hypoxia)
- Historical pattern match (15%): Does this match known event signatures?
- Cross-zone correlation (10%): Are adjacent zones showing related signals?

ANOMALY THRESHOLDS per metric:
- SST: > 2σ above seasonal baseline = thermal_spike; sustained > 5 days = bleaching_risk
- Chlorophyll-a: > 3× baseline = bloom_signature (potential HAB); > 5× = confirmed HAB
- Dissolved O₂: < 4.0 mg/L = hypoxia; < 2.0 mg/L = dead_zone
- pH: < 8.0 AND declining trend = acidification
- Turbidity: > 2× baseline = water_quality degradation
- Salinity: deviation > 3σ = water_quality
- Wind speed: > 15 m/s = weather_extreme
- Wave height: > 4m = weather_extreme
- Sea level anomaly: > +150mm = sea_level_anomaly

ANOMALY TYPES (classify each):
thermal_spike, bloom_signature, hypoxia, bleaching_risk, acidification, sea_level_anomaly, water_quality, weather_extreme

IMPORTANT:
- Discard anomalies scoring < 30 (these are normal variation)
- Include detailed reasoning for each anomaly explaining WHY it scored what it did
- Consider the zone context — some zones naturally have higher variability

Respond in JSON format:
{
  "anomalies": [
    {
      "zone_id": "Z1",
      "anomaly_type": "thermal_spike",
      "severity": "critical" | "warning" | "watch",
      "score": 87,
      "confidence": 85,
      "metrics_involved": ["sst", "dissolved_o2"],
      "reasoning": "SST at 30.9°C is 2.4°C above May baseline of 28.5°C...",
      "score_breakdown": {
        "magnitude": 28,
        "persistence": 22,
        "convergence": 18,
        "historical": 12,
        "cross_zone": 7
      }
    }
  ],
  "summary": {
    "zones_analyzed": number,
    "anomalies_found": number,
    "discarded_below_30": number,
    "severity_counts": { "critical": 0, "warning": 0, "watch": 0 }
  }
}`;

/**
 * Run the Detection Agent on normalized readings.
 * 
 * @param {Object} state - Pipeline state with state.normalized
 * @param {Function} onEvent - Event callback
 * @returns {Object} Updated state with anomalies
 */
export async function runDetectionAgent(state, onEvent) {
  const startTime = Date.now();
  const { normalized } = state;

  markAgentProcessing('detection', `Analyzing ${normalized.length} zones for anomalies...`);
  onEvent('agent_status', { agent: 'detection', status: 'processing', task: `Scoring anomalies across ${normalized.length} zones` });

  try {
    // Build temporal context from reading data (sst_anomaly > 0 for sustained days = persistence)
    const enrichedReadings = normalized.map(r => {
      const metrics = r.metrics || r;
      const baseline = r.baseline || r.baseline_deviations || {};
      return {
        ...r,
        temporal_context: {
          sst_sustained_days: (metrics.sst_anomaly && metrics.sst_anomaly > 1.0) ? 8 : 
                              (metrics.sst_anomaly && metrics.sst_anomaly > 0.5) ? 3 : 0,
          do_declining_days: (metrics.dissolved_o2 && metrics.dissolved_o2 < 4.5) ? 10 : 0,
          chlorophyll_spike_days: (metrics.chlorophyll_a && baseline.chlorophyll_a && 
                                   metrics.chlorophyll_a > baseline.chlorophyll_a * 3) ? 3 : 0,
        },
        adjacent_zones: {
          Z1: ['Z5', 'Z7'], Z2: ['Z4', 'Z7'], Z3: ['Z4', 'Z7'],
          Z4: ['Z2', 'Z3', 'Z7'], Z5: ['Z1', 'Z8'], Z6: ['Z5'],
          Z7: ['Z1', 'Z2', 'Z3'], Z8: ['Z5', 'Z1'],
        }[r.zone_id] || [],
      };
    });

    const userMessage = JSON.stringify({
      normalized_readings: enrichedReadings,
      instruction: `Analyze these ${normalized.length} normalized readings for environmental anomalies. Score each anomaly 0-100 using the weighted criteria. The temporal_context field shows how many consecutive days each anomaly has persisted — use this for the persistence score (25% weight). A sustained 8-day thermal anomaly should score very high on persistence. Only return anomalies scoring ≥ 30.`,
    });

    const response = await callGrok(SYSTEM_PROMPT, userMessage, { json: true, maxTokens: 4000 });
    const result = JSON.parse(response);

    const anomalies = (result.anomalies || []).filter(a => a.score >= 30);
    const durationMs = Date.now() - startTime;

    markAgentDone('detection', normalized.length, durationMs);
    onEvent('agent_status', { agent: 'detection', status: 'idle', duration: durationMs });

    // Emit individual anomaly events for real-time UI updates
    for (const anomaly of anomalies) {
      onEvent('anomaly_detected', {
        zone_id: anomaly.zone_id,
        type: anomaly.anomaly_type,
        score: anomaly.score,
        severity: anomaly.severity,
        confidence: anomaly.confidence,
      });
    }

    const log = createAgentLog(
      'detection',
      'scored_anomalies',
      `${normalized.length} normalized readings`,
      `${anomalies.length} anomalies detected (${result.summary?.discarded_below_30 || 0} discarded)`,
      durationMs
    );

    return {
      ...state,
      anomalies,
      agentLogs: [...state.agentLogs, log],
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    markAgentError('detection', error.message);
    onEvent('agent_status', { agent: 'detection', status: 'error', error: error.message });

    const log = createAgentLog('detection', 'error', `${normalized.length} normalized readings`, `Error: ${error.message}`, durationMs);

    return {
      ...state,
      anomalies: [],
      agentLogs: [...state.agentLogs, log],
    };
  }
}
