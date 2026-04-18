// ──────────────────────────────────────────────
// Dashboard Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';

const router = Router();

// GET /api/dashboard/student — student dashboard widgets
router.get('/student', dashboardController.student);

// GET /api/dashboard/professor — professor dashboard widgets
router.get('/professor', dashboardController.professor);

// GET /api/dashboard/admin — admin analytics overview
router.get('/admin', dashboardController.admin);

export default router;
