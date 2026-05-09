import { Router } from 'express';
import { db } from '../services/neonDb.js';
import { validateIdParam } from '../middleware/validation.js';

const router = Router();

// ─── GET /api/zones ───────────────────────────────────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await db.getZones();
    // Add default severity for frontend compatibility
    const zones = rows.map(z => ({ ...z, status: 'normal', severity: 'normal' }));
    res.json(zones);
  } catch (err) { next(err); }
});

// ─── GET /api/zones/:id ───────────────────────────────────────────────────────
router.get('/:id', validateIdParam, async (req, res, next) => {
  try {
    const { rows } = await db.getZone(parseInt(req.params.id));
    if (rows.length === 0) return res.status(404).json({ error: 'Zone not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ─── GET /api/zones/:id/readings ─────────────────────────────────────────────
router.get('/:id/readings', validateIdParam, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const { rows } = await db.getReadings(parseInt(req.params.id), limit);
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── GET /api/zones/:id/anomalies ────────────────────────────────────────────
router.get('/:id/anomalies', validateIdParam, async (req, res, next) => {
  try {
    const zoneId = parseInt(req.params.id);
    const { status } = req.query;
    let query = 'SELECT * FROM anomalies WHERE zone_id = $1';
    const params = [zoneId];
    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// ─── PATCH /api/zones/:id/sensitivity ────────────────────────────────────────
router.patch('/:id/sensitivity', validateIdParam, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { sensitivity } = req.body;
    
    if (sensitivity === undefined || sensitivity < 0.3 || sensitivity > 2.0) {
      return res.status(400).json({ error: 'sensitivity must be a number between 0.3 and 2.0' });
    }

    const { rows } = await db.updateZoneSensitivity(id, parseFloat(sensitivity));
    if (rows.length === 0) return res.status(404).json({ error: 'Zone not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;
