// ──────────────────────────────────────────────
// Plugins Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { pluginsController } from './plugins.controller.js';

const router = Router();

// GET /api/plugins — list active plugins
router.get('/', pluginsController.list);

// GET /api/plugins/:slug — plugin detail by slug
router.get('/:slug', pluginsController.getBySlug);

// POST /api/plugins — submit new plugin (triggers Grok audit)
router.post('/', pluginsController.submit);

// PATCH /api/plugins/:id/approve — admin approve
router.patch('/:id/approve', pluginsController.approve);

// PATCH /api/plugins/:id/reject — admin reject
router.patch('/:id/reject', pluginsController.reject);

export default router;
