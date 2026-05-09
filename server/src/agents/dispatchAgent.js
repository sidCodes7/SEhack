/**
 * AquaSentinel — Dispatch Agent (RULE-BASED)
 * 🚨 Routes alerts to email/dashboard by severity. NO LLM.
 */

import { markAgentProcessing, markAgentDone, markAgentError, createAgentLog } from './agentState.js';

// Severity → dispatch rules
const DISPATCH_RULES = {
  critical: { email: true, dashboard: true, priority: true },
  warning:  { email: true, dashboard: true, priority: false },
  watch:    { email: false, dashboard: true, priority: false },
};

/**
 * Run the Dispatch Agent on triaged escalated alerts.
 * 
 * @param {Object} state - Pipeline state with state.triaged and state.briefs
 * @param {Function} onEvent - Event callback
 * @returns {Object} Updated state with dispatch results
 */
export async function runDispatchAgent(state, onEvent) {
  const startTime = Date.now();
  const { triaged, briefs } = state;
  const escalated = triaged.escalated || [];

  markAgentProcessing('dispatch', `Dispatching ${escalated.length} alerts...`);
  onEvent('agent_status', { agent: 'dispatch', status: 'processing' });

  try {
    const emailsSent = [];
    const dashboardUpdates = [];

    for (const alert of escalated) {
      const rules = DISPATCH_RULES[alert.severity] || DISPATCH_RULES.watch;
      const brief = briefs.find(b => b.zone_id === alert.zone_id) || {};

      // Dashboard update (always)
      if (rules.dashboard) {
        dashboardUpdates.push({
          zone_id: alert.zone_id,
          anomaly_type: alert.anomaly_type,
          severity: alert.severity,
          score: alert.score,
          title: brief.title || `${alert.anomaly_type} in ${alert.zone_id}`,
          priority: rules.priority,
          timestamp: new Date().toISOString(),
        });
      }

      // Email dispatch (critical + warning only)
      if (rules.email) {
        const emailData = {
          zone_id: alert.zone_id,
          anomaly_type: alert.anomaly_type,
          severity: alert.severity,
          score: alert.score,
          subject: `${alert.severity === 'critical' ? '🔴 CRITICAL' : '🟠 WARNING'} | AquaSentinel — ${alert.zone_id}: ${alert.anomaly_type}`,
          situation: brief.situation || alert.reasoning || 'Alert detected',
          evidence: brief.evidence || '',
          actions: brief.recommended_actions || [],
          impact: brief.potential_impact || '',
          recipient: process.env.ALERT_EMAIL_TO || 'ops@aquasentinel.io',
          timestamp: new Date().toISOString(),
        };

        emailsSent.push(emailData);

        // Try to send email via Dev's emailRunner (graceful fail if not available)
        try {
          const { runEmailScript } = await import('../services/emailRunner.js');
          await runEmailScript(emailData);
        } catch {
          // emailRunner not available yet — log but don't fail the pipeline
        }

        onEvent('email_dispatched', {
          to: emailData.recipient,
          subject: emailData.subject,
          severity: alert.severity,
          zone_id: alert.zone_id,
        });
      }
    }

    const durationMs = Date.now() - startTime;
    markAgentDone('dispatch', escalated.length, durationMs);
    onEvent('agent_status', { agent: 'dispatch', status: 'idle', duration: durationMs });

    const log = createAgentLog('dispatch', 'dispatched_alerts',
      `${escalated.length} escalated alerts`,
      `${emailsSent.length} emails, ${dashboardUpdates.length} dashboard updates`,
      durationMs);

    return {
      ...state,
      dispatches: { emailsSent, dashboardUpdates },
      agentLogs: [...state.agentLogs, log],
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    markAgentError('dispatch', error.message);
    onEvent('agent_status', { agent: 'dispatch', status: 'error', error: error.message });
    const log = createAgentLog('dispatch', 'error', `${escalated.length} alerts`, `Error: ${error.message}`, durationMs);
    return { ...state, dispatches: { emailsSent: [], dashboardUpdates: [] }, agentLogs: [...state.agentLogs, log] };
  }
}
