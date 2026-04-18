// ──────────────────────────────────────────────
// Auth Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';

const router = Router();

// Public routes (no auth required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require valid JWT)
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);
router.patch('/language', authMiddleware, authController.updateLanguage);

export default router;
