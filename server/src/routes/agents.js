import { Router } from 'express';
import { initSSE, sendSSE, sendKeepAlive } from '../middleware/sse.js';
import { db } from '../services/neonDb.js';
import { getAgentStatuses } from '../agents/agentState.js';
import { runPipeline } from '../agents/orchestrator.js';

const router = Router();

// ─── GET /api/agents/status ───────────────────────────────────────────────────
router.get('/status', (_req, res) => {
  const statusesMap = getAgentStatuses();
  // Transform map/object into array format expected by frontend
  const statuses = Object.keys(statusesMap).map(key => ({
    name: key,
    ...statusesMap[key]
  }));
  res.json(statuses);
});

// ─── GET /api/agents/logs ─────────────────────────────────────────────────────
router.get('/logs', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { rows } = await db.getAgentLogs(limit);
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── GET /api/agents/metrics ──────────────────────────────────────────────────
router.get('/metrics', async (_req, res, next) => {
  try {
    const { rows } = await db.getAlertStats();
    const stats = rows[0] || { total: 0, suppressed: 0, escalated: 0 };
    
    // Calculate noise reduction
    const totalProcessed = stats.total;
    const noisePct = totalProcessed > 0 ? (stats.suppressed / totalProcessed * 100).toFixed(1) : 0;
    
    res.json({
      processed: totalProcessed,
      suppressed: stats.suppressed,
      escalated: stats.escalated,
      noise_reduction_pct: parseFloat(noisePct),
      avg_pipeline_ms: 2500, // mock metric, hard to calculate accurately on the fly
      cycles_run: 0, // usually maintained in memory or an orchestration table
    });
  } catch (err) { next(err); }
});

// ─── POST /api/agents/run-pipeline ───────────────────────────────────────────
router.post('/run-pipeline', async (req, res) => {
  initSSE(res);
  sendKeepAlive(res);

  let closed = false;
  req.on('close', () => { closed = true; });

  try {
    // Phase 4: Trigger the real LangGraph pipeline
    // We pass a callback to emit SSE events back to the client
    await runPipeline(null, (event, data) => {
      if (!closed) sendSSE(res, event, data);
    });
    
    if (!closed) {
      sendSSE(res, 'cycle_complete', { timestamp: new Date().toISOString() });
      res.end();
    }
  } catch (err) {
    console.error('[run-pipeline] Error:', err);
    if (!closed) {
      sendSSE(res, 'error', { message: err.message });
      res.end();
    }
  }
});

export default router;
