// ──────────────────────────────────────────────
// PYQ Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { pyqController } from './pyq.controller.js';

const router = Router();

// GET /api/pyq/papers — search/list PYQs
router.get('/papers', pyqController.searchPapers);

// GET /api/pyq/papers/:id — paper detail
router.get('/papers/:id', pyqController.getPaper);

// POST /api/pyq/sync — trigger DSpace refresh (admin only)
router.post('/sync', pyqController.sync);

export default router;
