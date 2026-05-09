/**
 * AquaSentinel — Brief Agent (LLM)
 * 📋 Generates NL briefings + answers chat queries.
 * Exports: runBriefAgent (pipeline) + queryBriefAgent (chat endpoint)
 */

import { callGrok, streamGrok } from './grokClient.js';
import { markAgentProcessing, markAgentDone, markAgentError, createAgentLog } from './agentState.js';

const BRIEFING_PROMPT = `You are part of AquaSentinel, an AI-powered marine environmental monitoring system analyzing Indian Ocean zones.

You are the BRIEF AGENT — an environmental policy advisor generating clear, actionable intelligence briefings for marine operators.

For each escalated alert, generate a structured briefing:

1. SITUATION: What is happening (plain language, include specific numbers and deviations)
2. EVIDENCE: Supporting metrics with exact values and deviations from baseline
3. RECOMMENDED ACTIONS: 2-3 specific, immediate, actionable steps
4. POTENTIAL IMPACT: What happens if this is ignored (ecological, economic, human)
5. CONFIDENCE: Your confidence assessment with reasoning

Keep briefings concise (3-5 sentences per section). Use authoritative tone.

Respond in JSON:
{
  "briefs": [
    {
      "zone_id": "Z1",
      "zone_name": "Lakshadweep Coral Reef",
      "alert_type": "thermal_spike",
      "severity": "critical",
      "title": "Sustained Thermal Stress — Bleaching Risk",
      "situation": "...",
      "evidence": "...",
      "recommended_actions": ["action 1", "action 2", "action 3"],
      "potential_impact": "...",
      "confidence": "87% — high confidence based on..."
    }
  ]
}`;

const CHAT_PROMPT = `You are part of AquaSentinel, an AI-powered marine environmental monitoring system analyzing Indian Ocean zones.

You are an AI environmental advisor. Synthesize the current system state into a clear, ranked response. Be specific with numbers, zones, and severity levels.

Structure responses as:
- For "What needs attention?" → Ranked list with zone, threat, confidence
- For zone-specific queries → Detailed zone status with metrics
- For action queries → Concrete recommendations

Keep responses concise, authoritative, and actionable. Use markdown formatting.`;

export async function runBriefAgent(state, onEvent) {
  const startTime = Date.now();
  const { triaged, correlations } = state;
  const escalated = triaged.escalated || [];

  markAgentProcessing('brief', `Generating briefings for ${escalated.length} escalated alerts...`);
  onEvent('agent_status', { agent: 'brief', status: 'processing' });

  try {
    if (escalated.length === 0) {
      const durationMs = Date.now() - startTime;
      markAgentDone('brief', 0, durationMs);
      onEvent('agent_status', { agent: 'brief', status: 'idle', duration: durationMs });
      const log = createAgentLog('brief', 'no_briefings', '0 escalated alerts', 'No briefings needed', durationMs);
      return { ...state, briefs: [], agentLogs: [...state.agentLogs, log] };
    }

    const userMessage = JSON.stringify({
      escalated_alerts: escalated,
      correlations,
      instruction: `Generate intelligence briefings for these ${escalated.length} escalated alerts.`,
    });

    const response = await callGrok(BRIEFING_PROMPT, userMessage, { json: true, maxTokens: 3000 });
    const result = JSON.parse(response);
    const briefs = result.briefs || [];

    const durationMs = Date.now() - startTime;
    markAgentDone('brief', escalated.length, durationMs);
    onEvent('agent_status', { agent: 'brief', status: 'idle', duration: durationMs });

    for (const brief of briefs) {
      onEvent('brief_generated', { zone_id: brief.zone_id, title: brief.title, severity: brief.severity });
    }

    const log = createAgentLog('brief', 'generated_briefings',
      `${escalated.length} escalated alerts`, `${briefs.length} briefings generated`, durationMs);

    return { ...state, briefs, agentLogs: [...state.agentLogs, log] };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    markAgentError('brief', error.message);
    onEvent('agent_status', { agent: 'brief', status: 'error', error: error.message });
    const log = createAgentLog('brief', 'error', `${escalated.length} alerts`, `Error: ${error.message}`, durationMs);
    return { ...state, briefs: [], agentLogs: [...state.agentLogs, log] };
  }
}

/**
 * Handle a chat query from the operator (called by Siddh's chat route).
 * Returns an async iterable for SSE streaming.
 * 
 * @param {string} message - User's natural language query
 * @param {Object} context - Current system state (active alerts, zone data, etc.)
 * @returns {AsyncIterable} Streaming response chunks
 */
export async function queryBriefAgent(message, context = {}) {
  const contextSummary = JSON.stringify({
    active_alerts: context.alerts || [],
    zone_statuses: context.zones || [],
    recent_correlations: context.correlations || [],
    suppression_stats: context.stats || {},
  });

  const userMessage = `System context:\n${contextSummary}\n\nOperator query: ${message}`;
  return streamGrok(CHAT_PROMPT, userMessage);
}
