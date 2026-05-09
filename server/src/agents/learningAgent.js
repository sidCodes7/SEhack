/**
 * AquaSentinel — Learning Agent (RULE-BASED)
 * 🧠 Adjusts zone sensitivity from feedback. NO LLM — simple math.
 * 
 * Math:
 *   valid feedback   → sensitivity × 1.05 (+5%)
 *   false positive   → sensitivity × 0.90 (-10%)
 *   clamp to [0.3, 2.0]
 */

import { markAgentProcessing, markAgentDone, markAgentError, createAgentLog } from './agentState.js';

const SENSITIVITY_FLOOR = 0.3;
const SENSITIVITY_CEILING = 2.0;
const VALID_MULTIPLIER = 1.05;
const FALSE_POSITIVE_MULTIPLIER = 0.90;

// In-memory sensitivity cache (persisted to DB when available)
const zoneSensitivities = {
  Z1: 1.0, Z2: 1.0, Z3: 1.0, Z4: 1.0,
  Z5: 1.0, Z6: 1.0, Z7: 1.0, Z8: 1.0,
};

/**
 * Get current sensitivity for a zone.
 */
export function getZoneSensitivity(zoneId) {
  return zoneSensitivities[zoneId] ?? 1.0;
}

/**
 * Get all zone sensitivities.
 */
export function getAllSensitivities() {
  return { ...zoneSensitivities };
}

/**
 * Process a single feedback event and adjust sensitivity.
 * 
 * @param {string} zoneId - Zone to adjust
 * @param {boolean} wasValid - true = confirmed alert, false = false positive
 * @returns {{ zoneId, oldSensitivity, newSensitivity, adjustment }}
 */
export function adjustSensitivity(zoneId, wasValid) {
  const oldSensitivity = zoneSensitivities[zoneId] ?? 1.0;
  const multiplier = wasValid ? VALID_MULTIPLIER : FALSE_POSITIVE_MULTIPLIER;
  let newSensitivity = oldSensitivity * multiplier;
  newSensitivity = Math.max(SENSITIVITY_FLOOR, Math.min(SENSITIVITY_CEILING, newSensitivity));
  newSensitivity = Math.round(newSensitivity * 100) / 100; // 2 decimal places

  zoneSensitivities[zoneId] = newSensitivity;

  return {
    zone_id: zoneId,
    old_sensitivity: oldSensitivity,
    new_sensitivity: newSensitivity,
    adjustment: wasValid ? '+5% (valid alert)' : '-10% (false positive)',
    was_valid: wasValid,
  };
}

/**
 * Run the Learning Agent to process pending feedback.
 * Called as part of the pipeline (processes any feedback in state).
 */
export async function runLearningAgent(state, onEvent) {
  const startTime = Date.now();
  const feedback = state.feedback || [];

  markAgentProcessing('learning', `Processing ${feedback.length} feedback items...`);
  onEvent('agent_status', { agent: 'learning', status: 'processing' });

  try {
    const updates = [];

    for (const fb of feedback) {
      const update = adjustSensitivity(fb.zone_id, fb.was_valid);
      updates.push(update);

      // Try to persist to DB (graceful fail if not available)
      try {
        const { db } = await import('../services/neonDb.js');
        await db.updateZoneSensitivity(fb.zone_id, update.new_sensitivity);
      } catch {
        // DB not available yet — in-memory only
      }

      onEvent('sensitivity_updated', {
        zone_id: update.zone_id,
        old: update.old_sensitivity,
        new: update.new_sensitivity,
        reason: update.adjustment,
      });
    }

    const durationMs = Date.now() - startTime;
    markAgentDone('learning', feedback.length, durationMs);
    onEvent('agent_status', { agent: 'learning', status: 'idle', duration: durationMs });

    const log = createAgentLog('learning', 'adjusted_sensitivity',
      `${feedback.length} feedback items`,
      `${updates.length} zones adjusted`,
      durationMs);

    return {
      ...state,
      sensitivityUpdates: updates,
      agentLogs: [...state.agentLogs, log],
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    markAgentError('learning', error.message);
    onEvent('agent_status', { agent: 'learning', status: 'error', error: error.message });
    const log = createAgentLog('learning', 'error', `${feedback.length} items`, `Error: ${error.message}`, durationMs);
    return { ...state, sensitivityUpdates: [], agentLogs: [...state.agentLogs, log] };
  }
}
