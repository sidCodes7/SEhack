import { Router } from 'express';
import { randomUUID } from 'crypto';
import { runPipeline } from '../agents/orchestrator.js';

const router = Router();

// ─── Simulation State (module-level, no DB needed) ────────────────────────────
const state = {
  running:    false,
  sessionId:  null,
  cycle:      0,
  startedAt:  null,
  intervalMs: 10000,
  _timer:     null,   // stores the setInterval handle
};

async function tick() {
  state.cycle += 1;
  const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
  console.log(`[Simulation] Cycle ${state.cycle} | elapsed ${elapsed}s`);
  
  // Phase 4: Trigger pipeline background job
  try {
    await runPipeline(null, (event, data) => {
      // In a full implementation, we could broadcast this to a global SSE hub
      // For now, the pipeline runs and logs to DB silently
    });
  } catch (err) {
    console.error(`[Simulation] Pipeline error in cycle ${state.cycle}:`, err);
  }
}

// ─── POST /api/simulation/start ───────────────────────────────────────────────
router.post('/start', (req, res) => {
  if (state.running) {
    return res.status(409).json({ error: 'Simulation already running', session_id: state.sessionId });
  }

  const { interval_ms = 10000 } = req.body;
  const intervalMs = Math.max(2000, parseInt(interval_ms)); // minimum 2s

  state.running    = true;
  state.sessionId  = randomUUID();
  state.cycle      = 0;
  state.startedAt  = Date.now();
  state.intervalMs = intervalMs;
  state._timer     = setInterval(tick, intervalMs);

  // Run first tick immediately
  tick();

  res.json({
    started:     true,
    session_id:  state.sessionId,
    interval_ms: intervalMs,
    started_at:  new Date(state.startedAt).toISOString(),
  });
});

// ─── POST /api/simulation/stop ────────────────────────────────────────────────
router.post('/stop', (_req, res) => {
  if (!state.running) {
    return res.status(409).json({ error: 'Simulation is not running' });
  }

  clearInterval(state._timer);
  state._timer   = null;
  state.running  = false;

  res.json({
    stopped:    true,
    session_id: state.sessionId,
    cycles_run: state.cycle,
    elapsed_s:  Math.floor((Date.now() - state.startedAt) / 1000),
  });
});

// ─── GET /api/simulation/status ───────────────────────────────────────────────
router.get('/status', (_req, res) => {
  res.json({
    running:     state.running,
    session_id:  state.sessionId,
    cycle:       state.cycle,
    elapsed_s:   state.startedAt ? Math.floor((Date.now() - state.startedAt) / 1000) : 0,
    interval_ms: state.intervalMs,
    started_at:  state.startedAt ? new Date(state.startedAt).toISOString() : null,
  });
});

export default router;
