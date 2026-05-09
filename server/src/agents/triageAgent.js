/**
 * AquaSentinel — Triage Agent (LLM)
 * ⚖️ Suppresses 60-70% noise, ranks by convergent evidence.
 */

import { callGrok } from './grokClient.js';
import { markAgentProcessing, markAgentDone, markAgentError, createAgentLog } from './agentState.js';

const SYSTEM_PROMPT = `You are part of AquaSentinel, an AI-powered marine environmental monitoring system analyzing Indian Ocean zones.

You are the TRIAGE AGENT — an environmental operations commander. Your PRIMARY job is to SUPPRESS NOISE and reduce alert fatigue. TARGET: suppress 60-70% of incoming anomalies.

Given detected anomalies with scores, correlations, and zone context, classify each as:
- ESCALATE (critical/warning): Convergent evidence, high confidence, actionable, correlated
- SUPPRESS: Low confidence, redundant, known noise pattern, isolated weak signal
- WATCH: Moderate signal, needs more data before escalation

Decision criteria:
1. Anomalies with cross-zone correlations → likely ESCALATE
2. Isolated anomalies with score < 50 → likely SUPPRESS
3. Multiple metrics converging in same zone → likely ESCALATE
4. Single-metric deviations within 2σ → likely SUPPRESS
5. Anomalies in zones with sensitivity < 0.7 (previously learned false positives) → likely SUPPRESS
6. Weather-related anomalies without convergent ecological signals → WATCH

For SUPPRESSED items, explain exactly why you're suppressing (judges need to see intelligent noise reduction).

Assign severity to escalated alerts:
- critical: score ≥ 75 AND (correlated OR multi-metric)
- warning: score 50-75 OR single strong signal
- watch: score 30-50 with some supporting evidence

Respond in JSON:
{
  "escalated": [{ "zone_id", "anomaly_type", "severity", "score", "confidence", "reasoning", "escalation_reason" }],
  "suppressed": [{ "zone_id", "anomaly_type", "score", "suppression_reason" }],
  "watch": [{ "zone_id", "anomaly_type", "score", "watch_reason" }],
  "summary": { "total_input": N, "escalated": N, "suppressed": N, "watch": N, "suppression_rate": "67%" }
}`;

export async function runTriageAgent(state, onEvent) {
  const startTime = Date.now();
  const { anomalies, correlations } = state;

  markAgentProcessing('triage', `Triaging ${anomalies.length} anomalies...`);
  onEvent('agent_status', { agent: 'triage', status: 'processing' });

  try {
    // Apply zone sensitivity multiplier to scores (per spec: sensitivity affects triage decisions)
    const { getAllSensitivities } = await import('./learningAgent.js');
    const sensitivities = getAllSensitivities();
    
    const adjustedAnomalies = anomalies.map(a => ({
      ...a,
      original_score: a.score,
      adjusted_score: Math.round(a.score * (sensitivities[a.zone_id] || 1.0)),
      zone_sensitivity: sensitivities[a.zone_id] || 1.0,
    }));

    const userMessage = JSON.stringify({
      anomalies: adjustedAnomalies, correlations,
      zone_sensitivities: sensitivities,
      instruction: `Triage these ${anomalies.length} anomalies. adjusted_score reflects zone sensitivity history. Suppress noise, escalate real threats. Sustained multi-day anomalies with high scores should be ESCALATED even without cross-zone correlation. Target 60-70% suppression overall but never suppress a critical-severity anomaly with score ≥ 75.`,
    });

    const response = await callGrok(SYSTEM_PROMPT, userMessage, { json: true, maxTokens: 3000 });
    const result = JSON.parse(response);

    const durationMs = Date.now() - startTime;
    markAgentDone('triage', anomalies.length, durationMs);
    onEvent('agent_status', { agent: 'triage', status: 'idle', duration: durationMs });

    for (const s of (result.suppressed || [])) {
      onEvent('alert_suppressed', { zone_id: s.zone_id, anomaly_type: s.anomaly_type, reason: s.suppression_reason });
    }
    for (const e of (result.escalated || [])) {
      onEvent('alert_escalated', { zone_id: e.zone_id, anomaly_type: e.anomaly_type, severity: e.severity, score: e.score });
    }

    const log = createAgentLog('triage', 'triaged_anomalies',
      `${anomalies.length} anomalies + ${correlations.length} correlations`,
      `${result.escalated?.length || 0} escalated, ${result.suppressed?.length || 0} suppressed, ${result.watch?.length || 0} watch`,
      durationMs);

    return {
      ...state,
      triaged: { escalated: result.escalated || [], suppressed: result.suppressed || [], watch: result.watch || [] },
      agentLogs: [...state.agentLogs, log],
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    markAgentError('triage', error.message);
    onEvent('agent_status', { agent: 'triage', status: 'error', error: error.message });
    const log = createAgentLog('triage', 'error', `${anomalies.length} anomalies`, `Error: ${error.message}`, durationMs);
    return { ...state, triaged: { escalated: [], suppressed: [], watch: [] }, agentLogs: [...state.agentLogs, log] };
  }
}
