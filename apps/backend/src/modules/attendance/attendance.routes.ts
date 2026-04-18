// ──────────────────────────────────────────────
// Attendance Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { attendanceController } from './attendance.controller.js';

const router = Router();

// POST /api/attendance/mark — mark attendance for a class
router.post('/mark', attendanceController.mark);

// GET /api/attendance/class/:classId — get class attendance records
router.get('/class/:classId', attendanceController.getClassAttendance);

// GET /api/attendance/student/:studentId — get student attendance summary
router.get('/student/:studentId', attendanceController.getStudentSummary);

// GET /api/attendance/trends — get professor's attendance trends
router.get('/trends', attendanceController.getTrends);

export default router;
