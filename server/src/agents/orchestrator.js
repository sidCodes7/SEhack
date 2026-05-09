/**
 * AquaSentinel — LangGraph Orchestrator
 * 
 * Proper StateGraph state machine chaining all 7 agents:
 * START → ingest → detect → correlate → triage → brief → dispatch → learn → END
 * 
 * Exports: runPipeline(readings, onEvent) → finalState
 */

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { resetAllAgentStatuses } from './agentState.js';
import { runIngestionAgent } from './ingestionAgent.js';
import { runDetectionAgent } from './detectionAgent.js';
import { runCorrelationAgent } from './correlationAgent.js';
import { runTriageAgent } from './triageAgent.js';
import { runBriefAgent } from './briefAgent.js';
import { runDispatchAgent } from './dispatchAgent.js';
import { runLearningAgent } from './learningAgent.js';

// ─── LangGraph State Annotation ─────────────────────────────────────
// Defines the typed state schema that flows through the graph.

const PipelineAnnotation = Annotation.Root({
  // Input
  readings:           Annotation({ reducer: (_, b) => b, default: () => [] }),
  onEvent:            Annotation({ reducer: (_, b) => b, default: () => (() => {}) }),
  
  // After Ingestion
  normalized:         Annotation({ reducer: (_, b) => b, default: () => [] }),
  qualityFlags:       Annotation({ reducer: (_, b) => b, default: () => [] }),
  
  // After Detection
  anomalies:          Annotation({ reducer: (_, b) => b, default: () => [] }),
  
  // After Correlation
  correlations:       Annotation({ reducer: (_, b) => b, default: () => [] }),
  
  // After Triage
  triaged:            Annotation({ reducer: (_, b) => b, default: () => ({ escalated: [], suppressed: [], watch: [] }) }),
  
  // After Brief
  briefs:             Annotation({ reducer: (_, b) => b, default: () => [] }),
  
  // After Dispatch
  dispatches:         Annotation({ reducer: (_, b) => b, default: () => ({ emailsSent: [], dashboardUpdates: [] }) }),
  
  // After Learning
  sensitivityUpdates: Annotation({ reducer: (_, b) => b, default: () => [] }),
  feedback:           Annotation({ reducer: (_, b) => b, default: () => [] }),
  
  // Logs — append-only via reducer
  agentLogs:          Annotation({ reducer: (a, b) => [...a, ...b], default: () => [] }),
  
  // Metadata
  pipelineStartedAt:  Annotation({ reducer: (_, b) => b, default: () => null }),
  pipelineCompletedAt:Annotation({ reducer: (_, b) => b, default: () => null }),
  cycleId:            Annotation({ reducer: (_, b) => b, default: () => null }),
});

// ─── Graph Node Functions ───────────────────────────────────────────
// Each node receives state, calls the agent, returns partial state update.

async function ingestNode(state) {
  const result = await runIngestionAgent(state, state.onEvent);
  return {
    normalized: result.normalized,
    qualityFlags: result.qualityFlags,
    agentLogs: result.agentLogs.slice(-1), // only the new log entry
  };
}

async function detectNode(state) {
  const result = await runDetectionAgent(state, state.onEvent);
  return {
    anomalies: result.anomalies,
    agentLogs: result.agentLogs.slice(-1),
  };
}

async function correlateNode(state) {
  const result = await runCorrelationAgent(state, state.onEvent);
  return {
    correlations: result.correlations,
    agentLogs: result.agentLogs.slice(-1),
  };
}

async function triageNode(state) {
  const result = await runTriageAgent(state, state.onEvent);
  return {
    triaged: result.triaged,
    agentLogs: result.agentLogs.slice(-1),
  };
}

async function briefNode(state) {
  const result = await runBriefAgent(state, state.onEvent);
  return {
    briefs: result.briefs,
    agentLogs: result.agentLogs.slice(-1),
  };
}

async function dispatchNode(state) {
  const result = await runDispatchAgent(state, state.onEvent);
  return {
    dispatches: result.dispatches,
    agentLogs: result.agentLogs.slice(-1),
  };
}

async function learnNode(state) {
  const result = await runLearningAgent(state, state.onEvent);
  return {
    sensitivityUpdates: result.sensitivityUpdates,
    pipelineCompletedAt: new Date().toISOString(),
    agentLogs: result.agentLogs.slice(-1),
  };
}

// ─── Build the StateGraph ───────────────────────────────────────────

const graph = new StateGraph(PipelineAnnotation)
  .addNode('ingest', ingestNode)
  .addNode('detect', detectNode)
  .addNode('correlate', correlateNode)
  .addNode('triage', triageNode)
  .addNode('brief', briefNode)
  .addNode('dispatch', dispatchNode)
  .addNode('learn', learnNode)
  .addEdge(START, 'ingest')
  .addEdge('ingest', 'detect')
  .addEdge('detect', 'correlate')
  .addEdge('correlate', 'triage')
  .addEdge('triage', 'brief')
  .addEdge('brief', 'dispatch')
  .addEdge('dispatch', 'learn')
  .addEdge('learn', END);

const compiledGraph = graph.compile();

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Run the full 7-agent pipeline via LangGraph StateGraph.
 * 
 * @param {Array} readings - Raw sensor readings to process
 * @param {Function} onEvent - SSE callback: (eventType: string, data: object) => void
 * @returns {Object} Final pipeline state with all agent results
 */
export async function runPipeline(readings, onEvent = () => {}) {
  const cycleId = `cycle_${Date.now()}`;
  
  // If no readings provided, fetch latest from DB
  if (!readings || readings.length === 0) {
    try {
      const { db } = await import('../services/neonDb.js');
      const { rows } = await db.getLatestReadings();
      readings = rows && rows.length > 0 ? rows : [];
    } catch (err) {
      console.warn(`[Orchestrator] Could not fetch readings from DB: ${err.message}`);
      readings = [];
    }
  }

  if (readings.length === 0) {
    console.log(`[Orchestrator] No readings available — skipping cycle ${cycleId}`);
    onEvent('cycle_skipped', { cycle_id: cycleId, reason: 'no_readings' });
    return { anomalies: [], triaged: { escalated: [], suppressed: [], watch: [] }, briefs: [], dispatches: { emailsSent: [], dashboardUpdates: [] }, agentLogs: [] };
  }

  console.log(`[Orchestrator] Starting LangGraph pipeline — cycle ${cycleId}, ${readings.length} readings`);
  resetAllAgentStatuses();

  onEvent('pipeline_started', { readings_count: readings.length, cycle_id: cycleId });

  try {
    const finalState = await compiledGraph.invoke({
      readings,
      onEvent,
      pipelineStartedAt: new Date().toISOString(),
      cycleId,
    });

    const triaged = finalState.triaged || { escalated: [], suppressed: [], watch: [] };
    const anomalies = finalState.anomalies || [];
    const briefs = finalState.briefs || [];
    const dispatches = finalState.dispatches || { emailsSent: [], dashboardUpdates: [] };

    onEvent('cycle_complete', {
      cycle_id: cycleId,
      anomalies_found: anomalies.length,
      escalated: triaged.escalated.length,
      suppressed: triaged.suppressed.length,
      briefs: briefs.length,
      emails: (dispatches.emailsSent || []).length,
      duration_ms: new Date(finalState.pipelineCompletedAt) - new Date(finalState.pipelineStartedAt),
    });

    console.log(`[Orchestrator] Pipeline complete — ${(finalState.agentLogs || []).length} agent logs`);
    return finalState;

  } catch (error) {
    console.error(`[Orchestrator] Pipeline error:`, error);
    onEvent('pipeline_error', { error: error.message, cycle_id: cycleId });
    throw error;
  }
}
