// AquaSentinel — API Service Layer
// All calls go through localhost:3001. Uses mock data for Phase 1-3.

const API_BASE = 'http://localhost:3001';

async function fetchJSON(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call failed: ${endpoint}`, err.message);
    return null;
  }
}

// Zone endpoints
export const getZones = () => fetchJSON('/api/zones');
export const getZone = (id) => fetchJSON(`/api/zones/${id}`);
export const getZoneReadings = (id, params) => fetchJSON(`/api/zones/${id}/readings?${new URLSearchParams(params)}`);

// Reading endpoints
export const getLatestReadings = () => fetchJSON('/api/readings/latest');
export const getTimeSeries = (zoneId, metric, days = 30) =>
  fetchJSON(`/api/readings/timeseries?zone_id=${zoneId}&metric=${metric}&days=${days}`);

// Agent endpoints
export const getAgentStatus = () => fetchJSON('/api/agents/status');
export const getAgentLogs = (limit = 50) => fetchJSON(`/api/agents/logs?limit=${limit}`);

// Alert endpoints
export const getAlerts = (params = {}) => fetchJSON(`/api/alerts?${new URLSearchParams(params)}`);
export const getAlertDetail = (id) => fetchJSON(`/api/alerts/${id}`);
export const submitFeedback = (id, data) =>
  fetchJSON(`/api/alerts/${id}/feedback`, { method: 'POST', body: JSON.stringify(data) });
export const getAlertStats = () => fetchJSON('/api/alerts/stats');

// Chat endpoints
export function streamChat(message, zoneId, onToken, onDone) {
  const body = JSON.stringify({ message, zone_id: zoneId });
  const ctrl = new AbortController();
  fetch(`${API_BASE}/api/chat/query`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body, signal: ctrl.signal,
  }).then(async (res) => {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) { onDone?.(); break; }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') { onDone?.(); return; }
          try { onToken?.(JSON.parse(data)); } catch { onToken?.({ token: data }); }
        }
      }
    }
  }).catch(() => {});
  return () => ctrl.abort();
}

// Simulation endpoints
export const startSimulation = (interval = 10000) =>
  fetchJSON('/api/simulation/start', { method: 'POST', body: JSON.stringify({ interval_ms: interval }) });
export const stopSimulation = () =>
  fetchJSON('/api/simulation/stop', { method: 'POST' });

// Graph endpoints
export const getGraphNodes = (type) => fetchJSON(`/api/graph/nodes${type ? `?type=${type}` : ''}`);
export const getGraphEdges = () => fetchJSON('/api/graph/edges');

// Email endpoints
export const sendDispatchEmail = (dispatchData) =>
  fetchJSON('/api/email/dispatch', {
    method: 'POST',
    body: JSON.stringify({
      recipient: dispatchData.recipient,
      subject: dispatchData.subject,
      severity: dispatchData.severity,
      zone_name: dispatchData.zone_name,
      label: dispatchData.label,
      confidence: dispatchData.confidence,
      reasoning: dispatchData.reasoning,
    }),
  });
export const testEmailSMTP = () => fetchJSON('/api/email/test');

// Report endpoints
export async function downloadAlertReport(dispatchData) {
  try {
    const res = await fetch(`${API_BASE}/api/report/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: dispatchData.id,
        zone_name: dispatchData.zone_name,
        severity: dispatchData.severity,
        label: dispatchData.label,
        confidence: dispatchData.confidence,
        subject: dispatchData.subject,
        recipient: dispatchData.recipient,
        reasoning: dispatchData.reasoning,
      }),
    });
    if (!res.ok) throw new Error(`Report generation failed: ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1]
      || `AquaSentinel_Report_${dispatchData.id || Date.now()}.pdf`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (err) {
    console.error('Report download failed:', err);
    return { success: false, error: err.message };
  }
}

// SSE connection for real-time agent pipeline updates
export function connectAgentSSE(onEvent) {
  const source = new EventSource(`${API_BASE}/api/agents/run-pipeline`);
  const events = ['agent_status','anomaly_detected','correlation_found','alert_suppressed',
    'alert_escalated','brief_generated','email_dispatched','sensitivity_updated','cycle_complete','reading_ingested'];
  events.forEach(evt => {
    source.addEventListener(evt, (e) => {
      try { onEvent(evt, JSON.parse(e.data)); } catch { onEvent(evt, e.data); }
    });
  });
  source.onerror = () => console.warn('SSE connection error');
  return source;
}
