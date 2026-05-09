/**
 * AquaSentinel — Response Cache & Fallback Layer
 * 
 * Caches Grok API responses for demo reliability.
 * When API is slow/down, serves cached responses instantly.
 */

import { callGrok as originalCallGrok, streamGrok as originalStreamGrok } from './grokClient.js';

// In-memory response cache (keyed by hash of system+user prompt)
const responseCache = new Map();
let cacheEnabled = true;
let fallbackEnabled = true;

/**
 * Simple hash for cache keys.
 */
function hashKey(systemPrompt, userMessage) {
  const str = systemPrompt.slice(0, 100) + '|' + userMessage.slice(0, 200);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `grok_${hash}`;
}

/**
 * Cached version of callGrok — stores responses and serves from cache on failure.
 */
export async function cachedCallGrok(systemPrompt, userMessage, options = {}) {
  const key = hashKey(systemPrompt, userMessage);

  // Try cache first if enabled
  if (cacheEnabled && responseCache.has(key)) {
    console.log(`[Cache] HIT — serving cached response`);
    return responseCache.get(key);
  }

  try {
    const response = await originalCallGrok(systemPrompt, userMessage, options);
    
    // Cache the successful response
    if (cacheEnabled) {
      responseCache.set(key, response);
    }
    
    return response;
  } catch (error) {
    // Fallback: serve cached response if available
    if (fallbackEnabled && responseCache.has(key)) {
      console.warn(`[Cache] API failed, serving stale cache: ${error.message}`);
      return responseCache.get(key);
    }

    // Fallback: serve hardcoded demo response
    if (fallbackEnabled) {
      console.warn(`[Cache] API failed, no cache, serving fallback: ${error.message}`);
      return getFallbackResponse(systemPrompt);
    }

    throw error;
  }
}

/**
 * Get a hardcoded fallback response when API is completely unavailable.
 */
function getFallbackResponse(systemPrompt) {
  if (systemPrompt.includes('INGESTION AGENT')) {
    return JSON.stringify({
      normalized: [],
      summary: { total_readings: 0, good_quality: 0, degraded_quality: 0, poor_quality: 0, flags_raised: 0 },
    });
  }

  if (systemPrompt.includes('DETECTION AGENT')) {
    return JSON.stringify({
      anomalies: [
        {
          zone_id: 'Z1', anomaly_type: 'thermal_spike', severity: 'critical',
          score: 87, confidence: 85, metrics_involved: ['sst'],
          reasoning: 'SST at 30.9°C is 2.4°C above May baseline, sustained for 8 days. [FALLBACK RESPONSE]',
          score_breakdown: { magnitude: 27, persistence: 25, convergence: 15, historical: 13, cross_zone: 7 },
        },
        {
          zone_id: 'Z2', anomaly_type: 'bloom_signature', severity: 'critical',
          score: 78, confidence: 90, metrics_involved: ['chlorophyll_a', 'turbidity'],
          reasoning: 'Chlorophyll-a at 4.5 mg/m³ is 5× baseline of 0.9. HAB pattern. [FALLBACK RESPONSE]',
          score_breakdown: { magnitude: 28, persistence: 15, convergence: 18, historical: 12, cross_zone: 5 },
        },
        {
          zone_id: 'Z3', anomaly_type: 'hypoxia', severity: 'warning',
          score: 65, confidence: 80, metrics_involved: ['dissolved_o2'],
          reasoning: 'DO at 3.8 mg/L below 4.0 threshold, declining for 10 days. [FALLBACK RESPONSE]',
          score_breakdown: { magnitude: 22, persistence: 20, convergence: 10, historical: 8, cross_zone: 5 },
        },
      ],
      summary: { zones_analyzed: 6, anomalies_found: 3, discarded_below_30: 3, severity_counts: { critical: 2, warning: 1, watch: 0 } },
    });
  }

  if (systemPrompt.includes('TRIAGE AGENT')) {
    return JSON.stringify({
      escalated: [
        { zone_id: 'Z1', anomaly_type: 'thermal_spike', severity: 'critical', score: 87, confidence: 85, reasoning: 'Sustained 8-day thermal stress', escalation_reason: 'High persistence + magnitude' },
        { zone_id: 'Z2', anomaly_type: 'bloom_signature', severity: 'critical', score: 78, confidence: 90, reasoning: 'HAB confirmed at 5× baseline', escalation_reason: 'Multi-metric convergence' },
      ],
      suppressed: [
        { zone_id: 'Z3', anomaly_type: 'hypoxia', score: 65, suppression_reason: 'Isolated single-metric, below critical threshold [FALLBACK]' },
      ],
      watch: [],
      summary: { total_input: 3, escalated: 2, suppressed: 1, watch: 0, suppression_rate: '33%' },
    });
  }

  if (systemPrompt.includes('BRIEF AGENT') || systemPrompt.includes('policy advisor')) {
    return JSON.stringify({
      briefs: [
        {
          zone_id: 'Z1', zone_name: 'Lakshadweep Coral Reef', alert_type: 'thermal_spike', severity: 'critical',
          title: 'Sustained Thermal Stress — Bleaching Risk',
          situation: 'Sea surface temperature at Lakshadweep has reached 30.9°C, 2.4°C above the May baseline, sustained for 8 consecutive days.',
          evidence: 'SST: 30.9°C (baseline: 28.5°C, deviation: +2.4σ). Degree Heating Weeks approaching bleaching threshold.',
          recommended_actions: ['Deploy monitoring buoys for real-time SST tracking', 'Alert coral reef management teams for potential rescue operations', 'Increase satellite overpass frequency for this zone'],
          potential_impact: 'At current trajectory, 60% coral bleaching probability within 5 days. Mass mortality risk if temperatures remain elevated.',
          confidence: '85% — high confidence [FALLBACK RESPONSE]',
        },
      ],
    });
  }

  // Generic fallback
  return JSON.stringify({ result: 'Service temporarily unavailable — cached response', fallback: true });
}

/**
 * Pre-warm the cache by running the pipeline once.
 */
export function prewarmCache(responses) {
  for (const [key, value] of Object.entries(responses)) {
    responseCache.set(key, value);
  }
  console.log(`[Cache] Pre-warmed with ${Object.keys(responses).length} responses`);
}

/**
 * Enable/disable caching.
 */
export function setCacheEnabled(enabled) { cacheEnabled = enabled; }
export function setFallbackEnabled(enabled) { fallbackEnabled = enabled; }
export function getCacheStats() {
  return { entries: responseCache.size, cacheEnabled, fallbackEnabled };
}
