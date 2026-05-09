/**
 * AquaSentinel — Agent State Management
 * 
 * In-memory status tracking for all 7 agents + LangGraph pipeline state shape.
 * Exported functions are consumed by:
 *   - Every agent (updateAgentStatus)
 *   - Siddh's routes via getAgentStatuses()
 *   - Orchestrator for pipeline state initialization
 */

// ─── Agent Status Tracking ──────────────────────────────────────────
// Each agent has a visible status in the UI: 🟢 Active / 🔄 Processing / 💤 Idle / 🔴 Error

const agentStatuses = {
  ingestion:   { status: 'idle', lastRun: null, processed: 0, lastTask: null, lastDurationMs: null },
  detection:   { status: 'idle', lastRun: null, processed: 0, lastTask: null, lastDurationMs: null },
  correlation: { status: 'idle', lastRun: null, processed: 0, lastTask: null, lastDurationMs: null },
  triage:      { status: 'idle', lastRun: null, processed: 0, lastTask: null, lastDurationMs: null },
  brief:       { status: 'idle', lastRun: null, processed: 0, lastTask: null, lastDurationMs: null },
  dispatch:    { status: 'idle', lastRun: null, processed: 0, lastTask: null, lastDurationMs: null },
  learning:    { status: 'idle', lastRun: null, processed: 0, lastTask: null, lastDurationMs: null },
};

/**
 * Get current status of all 7 agents.
 * @returns {Object} Agent statuses keyed by agent name
 */
export function getAgentStatuses() {
  return { ...agentStatuses };
}

/**
 * Update the status of a specific agent.
 * 
 * @param {string} agentName - One of: ingestion, detection, correlation, triage, brief, dispatch, learning
 * @param {Object} updates - Fields to update
 * @param {string} [updates.status] - 'idle' | 'processing' | 'active' | 'error'
 * @param {string} [updates.lastTask] - Current task description (e.g., "Analyzing Zone 3 thermal readings...")
 * @param {number} [updates.lastDurationMs] - Processing time of last run
 * @param {number} [updates.processedDelta] - Number of items processed (added to running total)
 */
export function updateAgentStatus(agentName, updates) {
  if (!agentStatuses[agentName]) {
    console.warn(`[AgentState] Unknown agent: ${agentName}`);
    return;
  }

  const agent = agentStatuses[agentName];

  if (updates.status !== undefined) {
    agent.status = updates.status;
  }

  if (updates.lastTask !== undefined) {
    agent.lastTask = updates.lastTask;
  }

  if (updates.lastDurationMs !== undefined) {
    agent.lastDurationMs = updates.lastDurationMs;
  }

  if (updates.processedDelta !== undefined) {
    agent.processed += updates.processedDelta;
  }

  // Auto-set lastRun timestamp when status changes to 'idle' (finished) or 'active'
  if (updates.status === 'idle' || updates.status === 'active') {
    agent.lastRun = new Date().toISOString();
  }
}

/**
 * Mark an agent as processing with a task description.
 * Convenience wrapper used at the start of every agent run.
 * 
 * @param {string} agentName 
 * @param {string} task - What the agent is doing (shown in UI)
 */
export function markAgentProcessing(agentName, task) {
  updateAgentStatus(agentName, { status: 'processing', lastTask: task });
}

/**
 * Mark an agent as done (idle) with results.
 * Convenience wrapper used at the end of every agent run.
 * 
 * @param {string} agentName
 * @param {number} processedCount - Number of items processed
 * @param {number} durationMs - How long the run took
 */
export function markAgentDone(agentName, processedCount, durationMs) {
  updateAgentStatus(agentName, {
    status: 'idle',
    processedDelta: processedCount,
    lastDurationMs: durationMs,
    lastTask: null,
  });
}

/**
 * Mark an agent as errored.
 * 
 * @param {string} agentName
 * @param {string} errorMessage
 */
export function markAgentError(agentName, errorMessage) {
  updateAgentStatus(agentName, {
    status: 'error',
    lastTask: `Error: ${errorMessage}`,
  });
}

/**
 * Reset all agent statuses to idle. Used when restarting the pipeline.
 */
export function resetAllAgentStatuses() {
  for (const name of Object.keys(agentStatuses)) {
    agentStatuses[name] = {
      status: 'idle',
      lastRun: null,
      processed: 0,
      lastTask: null,
      lastDurationMs: null,
    };
  }
}

// ─── LangGraph Pipeline State Shape ─────────────────────────────────
// This defines the state object that flows through the LangGraph state machine.
// Each agent node reads from and writes to specific fields.

/**
 * Create a fresh initial state for a pipeline run.
 * @param {Array} readings - Raw sensor readings to process
 * @returns {Object} Initial pipeline state
 */
export function createInitialState(readings = []) {
  return {
    // Input
    readings,

    // After Ingestion Agent
    normalized: [],
    qualityFlags: [],

    // After Detection Agent
    anomalies: [],

    // After Correlation Agent
    correlations: [],

    // After Triage Agent
    triaged: {
      escalated: [],
      suppressed: [],
      watch: [],
    },

    // After Brief Agent
    briefs: [],

    // After Dispatch Agent
    dispatches: {
      emailsSent: [],
      dashboardUpdates: [],
    },

    // After Learning Agent
    sensitivityUpdates: [],

    // Activity log (all agents append here)
    agentLogs: [],

    // Metadata
    pipelineStartedAt: new Date().toISOString(),
    pipelineCompletedAt: null,
    cycleId: `cycle_${Date.now()}`,
  };
}

// ─── Agent Log Helper ────────────────────────────────────────────────

/**
 * Create a structured agent log entry.
 * 
 * @param {string} agentName - Agent that performed the action
 * @param {string} action - What was done (e.g., "normalized_readings", "scored_anomalies")
 * @param {string} inputSummary - Brief description of input
 * @param {string} outputSummary - Brief description of output
 * @param {number} processingTimeMs - Duration in milliseconds
 * @returns {Object} Structured log entry
 */
export function createAgentLog(agentName, action, inputSummary, outputSummary, processingTimeMs) {
  return {
    agent_name: agentName,
    action,
    input_summary: inputSummary,
    output_summary: outputSummary,
    processing_time_ms: processingTimeMs,
    timestamp: new Date().toISOString(),
  };
}
