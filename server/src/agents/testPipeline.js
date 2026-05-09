/**
 * AquaSentinel — Phase 2 Test: Ingestion + Detection Agents
 * 
 * Tests both LLM agents with realistic Arabian Sea Crisis demo data.
 * Run: node src/agents/testPipeline.js
 */

import 'dotenv/config';
import { runIngestionAgent } from './ingestionAgent.js';
import { runDetectionAgent } from './detectionAgent.js';
import { runCorrelationAgent } from './correlationAgent.js';
import { runTriageAgent } from './triageAgent.js';
import { runBriefAgent } from './briefAgent.js';
import { runDispatchAgent } from './dispatchAgent.js';
import { runLearningAgent } from './learningAgent.js';
import { createInitialState, getAgentStatuses } from './agentState.js';

// ─── Sample Demo Data: "Arabian Sea Crisis" ─────────────────────────
const SAMPLE_READINGS = [
  {
    zone_id: 'Z1', zone_name: 'Lakshadweep Coral Reef',
    timestamp: '2026-05-08T14:00:00Z',
    metrics: {
      sst: 30.9, sst_anomaly: 2.4,       // CRITICAL — 8 days of thermal buildup
      chlorophyll_a: 0.52,
      dissolved_o2: 5.6,
      ph: 8.02, turbidity: 2.1,
      salinity: 35.2, wind_speed: 3.8, wave_height: 1.1,
    },
    baseline: { sst: 28.5, chlorophyll_a: 0.45, dissolved_o2: 6.2, ph: 8.1 },
  },
  {
    zone_id: 'Z2', zone_name: 'Gujarat Mangrove Coast',
    timestamp: '2026-05-08T14:00:00Z',
    metrics: {
      sst: 28.1, sst_anomaly: 0.3,
      chlorophyll_a: 4.5,                // CRITICAL — 5× baseline (HAB)
      dissolved_o2: 5.9,
      ph: 8.05, turbidity: 4.8,
      salinity: 34.8, wind_speed: 5.2, wave_height: 1.4,
    },
    baseline: { sst: 27.8, chlorophyll_a: 0.9, dissolved_o2: 6.0, ph: 8.1 },
  },
  {
    zone_id: 'Z3', zone_name: 'Kerala Upwelling Zone',
    timestamp: '2026-05-08T14:00:00Z',
    metrics: {
      sst: 27.2, sst_anomaly: -0.5,
      chlorophyll_a: 1.1,
      dissolved_o2: 3.8,                 // WARNING — below 4.0 threshold (hypoxia)
      ph: 8.0, turbidity: 3.5,
      salinity: 35.0, wind_speed: 4.1, wave_height: 1.2,
    },
    baseline: { sst: 27.7, chlorophyll_a: 0.8, dissolved_o2: 6.5, ph: 8.1 },
  },
  {
    zone_id: 'Z5', zone_name: 'Andaman Reef System',
    timestamp: '2026-05-08T14:00:00Z',
    metrics: {
      sst: 29.2, sst_anomaly: 1.2,       // Moderate — preceded by Z1 thermal
      chlorophyll_a: 0.38,
      dissolved_o2: 6.0,
      ph: 7.95, turbidity: 1.8,          // pH slightly concerning
      salinity: 34.5, wind_speed: 3.2, wave_height: 0.9,
    },
    baseline: { sst: 28.0, chlorophyll_a: 0.35, dissolved_o2: 6.3, ph: 8.1 },
  },
  {
    zone_id: 'Z7', zone_name: 'Goa Coastal Strip',
    timestamp: '2026-05-08T14:00:00Z',
    metrics: {
      sst: 28.0, sst_anomaly: 0.2,
      chlorophyll_a: 1.1,                 // NOISE — looks like bloom but isn't
      dissolved_o2: 6.3,
      ph: 8.08, turbidity: 2.5,
      salinity: 35.1, wind_speed: 4.5, wave_height: 1.3,
    },
    baseline: { sst: 27.8, chlorophyll_a: 0.8, dissolved_o2: 6.4, ph: 8.1 },
  },
  {
    zone_id: 'Z8', zone_name: 'Sri Lanka Southern Coast',
    timestamp: '2026-05-08T14:00:00Z',
    metrics: {
      sst: 28.3, sst_anomaly: 0.1,
      chlorophyll_a: 0.42,
      dissolved_o2: 6.1,                  // NORMAL — should be suppressed
      ph: 8.07, turbidity: 2.0,
      salinity: 35.3, wind_speed: 5.0, wave_height: 1.5,
    },
    baseline: { sst: 28.2, chlorophyll_a: 0.40, dissolved_o2: 6.2, ph: 8.1 },
  },
];

// ─── Event Logger ────────────────────────────────────────────────────
const events = [];
function onEvent(type, data) {
  events.push({ type, data, time: new Date().toISOString() });
  const icon = {
    agent_status: '⚙️', anomaly_detected: '🔍', correlation_found: '🔗',
    alert_suppressed: '🔇', alert_escalated: '🚨', brief_generated: '📋',
    email_dispatched: '📧', sensitivity_updated: '🧠', pipeline_started: '🚀',
    cycle_complete: '✅', reading_ingested: '📡',
  }[type] || '📌';
  console.log(`  ${icon} [${type}] ${JSON.stringify(data).slice(0, 120)}`);
}

// ─── Run Tests ───────────────────────────────────────────────────────
async function runPhase2Test() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  AquaSentinel — Full Pipeline Test (6 zones)');
  console.log('═══════════════════════════════════════════════════════════\n');

  let state = createInitialState(SAMPLE_READINGS);

  // ── 1. INGESTION ──
  console.log('━━━ 📡 INGESTION AGENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const t1 = Date.now();
  state = await runIngestionAgent(state, onEvent);
  console.log(`  ⏱️  ${Date.now() - t1}ms | ${state.normalized.length} readings normalized\n`);

  // ── 2. DETECTION ──
  console.log('━━━ 🔍 DETECTION AGENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const t2 = Date.now();
  state = await runDetectionAgent(state, onEvent);
  console.log(`  ⏱️  ${Date.now() - t2}ms | ${state.anomalies.length} anomalies detected`);
  if (state.anomalies.length > 0) {
    console.log('\n  Anomalies found:');
    for (const a of state.anomalies) {
      const sev = { critical: '🔴', warning: '🟠', watch: '🟡' }[a.severity] || '⚪';
      console.log(`    ${sev} ${a.zone_id} — ${a.anomaly_type} (score: ${a.score}, confidence: ${a.confidence})`);
      if (a.reasoning) console.log(`       ${a.reasoning.slice(0, 100)}...`);
    }
  }
  console.log('');

  // ── 3. CORRELATION ──
  console.log('━━━ 🔗 CORRELATION AGENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const t3 = Date.now();
  state = await runCorrelationAgent(state, onEvent);
  console.log(`  ⏱️  ${Date.now() - t3}ms | ${state.correlations.length} correlations found`);
  for (const c of state.correlations) {
    console.log(`    🔗 ${c.from_zone}(${c.from_type}) → ${c.to_zone}(${c.to_type}) [${c.relationship}, confidence: ${c.confidence}]`);
  }
  console.log('');

  // ── 4. TRIAGE ──
  console.log('━━━ ⚖️ TRIAGE AGENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const t4 = Date.now();
  state = await runTriageAgent(state, onEvent);
  const { escalated, suppressed, watch } = state.triaged;
  const total = escalated.length + suppressed.length + watch.length;
  const suppressionRate = total > 0 ? ((suppressed.length / total) * 100).toFixed(0) : 0;
  console.log(`  ⏱️  ${Date.now() - t4}ms | Escalated: ${escalated.length}, Suppressed: ${suppressed.length}, Watch: ${watch.length}`);
  console.log(`  📊 Suppression rate: ${suppressionRate}% (target: 60-70%)`);
  console.log('');

  // ── 5. BRIEF ──
  console.log('━━━ 📋 BRIEF AGENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const t5 = Date.now();
  state = await runBriefAgent(state, onEvent);
  console.log(`  ⏱️  ${Date.now() - t5}ms | ${state.briefs.length} briefings generated`);
  for (const b of state.briefs) {
    console.log(`    📋 ${b.zone_id}: ${b.title || b.alert_type}`);
    if (b.situation) console.log(`       ${b.situation.slice(0, 120)}...`);
  }
  console.log('');

  // ── 6. DISPATCH ──
  console.log('━━━ 🚨 DISPATCH AGENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const t6 = Date.now();
  state = await runDispatchAgent(state, onEvent);
  console.log(`  ⏱️  ${Date.now() - t6}ms | ${state.dispatches.emailsSent.length} emails, ${state.dispatches.dashboardUpdates.length} dashboard updates`);
  console.log('');

  // ── 7. LEARNING ──
  console.log('━━━ 🧠 LEARNING AGENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  // Simulate feedback: Z1 alert was valid, Z7 was false positive
  state.feedback = [
    { zone_id: 'Z1', was_valid: true },
    { zone_id: 'Z7', was_valid: false },
  ];
  const t7 = Date.now();
  state = await runLearningAgent(state, onEvent);
  console.log(`  ⏱️  ${Date.now() - t7}ms | ${state.sensitivityUpdates.length} sensitivity updates`);
  for (const u of state.sensitivityUpdates) {
    console.log(`    🧠 ${u.zone_id}: ${u.old_sensitivity} → ${u.new_sensitivity} (${u.adjustment})`);
  }
  console.log('');

  // ── SUMMARY ──
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PIPELINE SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Readings processed:  ${SAMPLE_READINGS.length}`);
  console.log(`  Anomalies detected:  ${state.anomalies.length}`);
  console.log(`  Correlations found:  ${state.correlations.length}`);
  console.log(`  Escalated:           ${escalated.length}`);
  console.log(`  Suppressed:          ${suppressed.length} (${suppressionRate}%)`);
  console.log(`  Watch:               ${watch.length}`);
  console.log(`  Briefings:           ${state.briefs.length}`);
  console.log(`  Emails dispatched:   ${state.dispatches.emailsSent.length}`);
  console.log(`  Sensitivity updates: ${state.sensitivityUpdates.length}`);
  console.log(`  Agent logs:          ${state.agentLogs.length}`);
  console.log(`  Total events:        ${events.length}`);

  // Agent statuses
  console.log('\n  Agent Statuses:');
  const statuses = getAgentStatuses();
  for (const [name, s] of Object.entries(statuses)) {
    const icon = { idle: '🟢', processing: '🔄', error: '🔴' }[s.status] || '💤';
    console.log(`    ${icon} ${name}: ${s.status} | processed: ${s.processed} | ${s.lastDurationMs}ms`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ Full pipeline test complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

runPhase2Test().catch(err => {
  console.error('Pipeline test failed:', err);
  process.exit(1);
});
