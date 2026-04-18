// ──────────────────────────────────────────────
// Notices Routes — Express Router
// ──────────────────────────────────────────────

import { Router } from 'express';
import { noticesController } from './notices.controller.js';

const router = Router();

// Publish a new notice (professor/admin only — enforced in controller)
router.post('/', noticesController.create);

// List all notices (optional query params: ?department=&targetRole=)
router.get('/', noticesController.list);

// Get a single notice by ID
router.get('/:id', noticesController.getById);

export default router;
