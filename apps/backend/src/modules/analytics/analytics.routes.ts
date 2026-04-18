// ──────────────────────────────────────────────
// Analytics Routes — Express Router
// ──────────────────────────────────────────────

import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';

const router = Router();

// Attendance trends (aggregate by class/subject)
router.get('/attendance', analyticsController.getAttendanceTrends);

// Approval bottleneck analysis
router.get('/approvals', analyticsController.getApprovalBottlenecks);

// Issue resolution statistics
router.get('/issues', analyticsController.getIssueStats);

export default router;
