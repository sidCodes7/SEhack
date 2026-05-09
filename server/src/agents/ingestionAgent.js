/**
 * AquaSentinel — Ingestion Agent (LLM)
 * 
 * 📡 Receives raw multi-source sensor data, normalizes into zone-level signals,
 * detects missing/corrupt readings, fills gaps via LLM reasoning.
 * 
 * Input:  state.readings (RawReading[])
 * Output: state.normalized (NormReading[]), state.qualityFlags (Flag[])
 */

import { callGrok } from './grokClient.js';
import { markAgentProcessing, markAgentDone, markAgentError, createAgentLog } from './agentState.js';

const SYSTEM_PROMPT = `You are part of AquaSentinel, an AI-powered marine environmental monitoring system analyzing Indian Ocean zones.

You are the INGESTION AGENT — a marine data scientist specializing in sensor data quality assurance.

Your job:
1. VALIDATE each reading: check for null/missing values, out-of-range values, sensor errors
2. FLAG quality issues: sensor_error, missing_data, interpolated, out_of_range
3. NORMALIZE all readings to a standard schema with consistent units
4. COMPARE readings to seasonal baselines from zone configuration
5. NOTE any readings that deviate significantly from expected seasonal patterns

For each zone reading, assess data quality and normalize values.

Metric expected ranges:
- SST (Sea Surface Temperature): 20-35°C
- Chlorophyll-a: 0.01-50 mg/m³
- Dissolved O₂: 0-15 mg/L
- Turbidity: 0-100 NTU
- pH: 6.5-9.0
- Salinity: 30-40 PSU
- Wind speed: 0-50 m/s
- Wave height: 0-15 m

Respond in JSON format with this structure:
{
  "normalized": [
    {
      "zone_id": "Z1",
      "timestamp": "ISO string",
      "metrics": {
        "sst": number,
        "sst_anomaly": number,
        "chlorophyll_a": number,
        "dissolved_o2": number,
        "ph": number,
        "turbidity": number,
        "salinity": number,
        "wind_speed": number,
        "wave_height": number
      },
      "quality": "good" | "degraded" | "poor",
      "quality_flags": {
        "missing_data": boolean,
        "sensor_error": boolean,
        "interpolated": boolean,
        "out_of_range": []
      },
      "baseline_deviations": {
        "metric_name": { "value": number, "baseline": number, "deviation_sigma": number }
      }
    }
  ],
  "summary": {
    "total_readings": number,
    "good_quality": number,
    "degraded_quality": number,
    "poor_quality": number,
    "flags_raised": number
  }
}`;

/**
 * Run the Ingestion Agent on raw sensor readings.
 * 
 * @param {Object} state - Pipeline state with state.readings
 * @param {Function} onEvent - Event callback: (eventType, data) => void
 * @returns {Object} Updated state with normalized readings and quality flags
 */
export async function runIngestionAgent(state, onEvent) {
  const startTime = Date.now();
  const { readings } = state;

  markAgentProcessing('ingestion', `Processing ${readings.length} zone readings...`);
  onEvent('agent_status', { agent: 'ingestion', status: 'processing', task: `Processing ${readings.length} zone readings` });

  try {
    const userMessage = JSON.stringify({
      readings,
      instruction: `Normalize these ${readings.length} sensor readings. Validate all values, flag quality issues, and compare to seasonal baselines.`,
    });

    const response = await callGrok(SYSTEM_PROMPT, userMessage, { json: true, maxTokens: 3000 });
    const result = JSON.parse(response);

    const durationMs = Date.now() - startTime;
    markAgentDone('ingestion', readings.length, durationMs);

    // Emit events
    onEvent('agent_status', { agent: 'ingestion', status: 'idle', duration: durationMs });
    onEvent('reading_ingested', {
      count: result.normalized?.length || 0,
      quality_summary: result.summary,
    });

    // Create agent log
    const log = createAgentLog(
      'ingestion',
      'normalized_readings',
      `${readings.length} raw readings`,
      `${result.normalized?.length || 0} normalized, ${result.summary?.flags_raised || 0} flags`,
      durationMs
    );

    return {
      ...state,
      normalized: result.normalized || [],
      qualityFlags: result.normalized?.map(r => r.quality_flags) || [],
      agentLogs: [...state.agentLogs, log],
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    markAgentError('ingestion', error.message);
    onEvent('agent_status', { agent: 'ingestion', status: 'error', error: error.message });

    const log = createAgentLog('ingestion', 'error', `${readings.length} raw readings`, `Error: ${error.message}`, durationMs);

    return {
      ...state,
      normalized: [],
      qualityFlags: [],
      agentLogs: [...state.agentLogs, log],
    };
  }
}
