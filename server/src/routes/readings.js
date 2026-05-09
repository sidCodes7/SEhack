import { Router } from 'express';
import { db } from '../services/neonDb.js';
import { runPipeline } from '../agents/orchestrator.js';
import { validateZoneIdBody } from '../middleware/validation.js';

const router = Router();

// ─── GET /api/readings/latest ─────────────────────────────────────────────────
router.get('/latest', async (_req, res, next) => {
  try {
    const { rows } = await db.getLatestReadings();
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── GET /api/readings/timeseries ─────────────────────────────────────────────
router.get('/timeseries', async (req, res, next) => {
  try {
    const { zone_id = 1, metric = 'sst', days = 30 } = req.query;
    const { rows } = await db.getTimeSeries(parseInt(zone_id), metric, parseInt(days));
    
    // Transform rows to { zone_id, metric, timestamps[], values[] } format
    const timestamps = rows.map(r => r.timestamp);
    const values = rows.map(r => parseFloat(r.value));
    
    res.json({ zone_id: parseInt(zone_id), metric, timestamps, values });
  } catch (err) { next(err); }
});

// ─── POST /api/readings/ingest ────────────────────────────────────────────────
router.post('/ingest', validateZoneIdBody, async (req, res, next) => {
  try {
    const { zone_id, metrics } = req.body;

    // Insert reading into DB directly, then trigger pipeline asynchronously
    // In a real app we might want to do this, or just let the pipeline do it
    const reading = {
      zone_id,
      timestamp: new Date().toISOString(),
      ...metrics
    };
    
    // For Phase 4, we just trigger runPipeline. Ingestion Agent usually fetches.
    // For manual ingest, we'll run the pipeline (without blocking the HTTP response)
    res.json({
      processed: true,
      zone_id: parseInt(zone_id),
      message: 'Pipeline triggered',
      timestamp: new Date().toISOString(),
    });
    
    // Run pipeline in background
    runPipeline([reading], () => {}).catch(err => console.error('[ingest] Pipeline error:', err));
  } catch (err) { next(err); }
});

export default router;
