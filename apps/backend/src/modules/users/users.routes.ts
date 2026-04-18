// ──────────────────────────────────────────────
// Users Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { usersController } from './users.controller.js';

const router = Router();

// GET /api/users — list users (with optional ?role=&department= filters)
router.get('/', usersController.listUsers);

// GET /api/users/:id — get single user profile
router.get('/:id', usersController.getUser);

export default router;
