/**
 * SSE (Server-Sent Events) helper utilities.
 * Used by /api/agents/run-pipeline, /api/chat/query, and simulation routes.
 *
 * SSE wire format:
 *   event: <type>\n
 *   data: <json>\n\n
 */

/**
 * Initialize SSE connection — sets required headers and flushes.
 * @param {import('express').Response} res
 */
export function initSSE(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // disable nginx buffering
  });
  res.flushHeaders();
}

/**
 * Send a single SSE event.
 * @param {import('express').Response} res
 * @param {string} event  - Event type name (e.g. 'agent_status', 'token', 'done')
 * @param {object} data   - JSON-serializable payload
 */
export function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Send a keepalive comment to prevent proxy timeouts.
 * @param {import('express').Response} res
 */
export function sendKeepAlive(res) {
  res.write(': keepalive\n\n');
}
