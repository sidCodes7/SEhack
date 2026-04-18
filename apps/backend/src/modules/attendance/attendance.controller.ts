// ──────────────────────────────────────────────
// Attendance Controller — HTTP Handlers
// ──────────────────────────────────────────────
// Controllers ONLY handle HTTP — all logic is in attendance.service.ts

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as attendanceService from './attendance.service.js';

export const attendanceController = {
  /**
   * POST /api/attendance/mark
   * Body: { classId, subject, date, students: [{ studentId, isPresent }] }
   */
  mark: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { classId, subject, date, students } = req.body;

      if (!classId || !subject || !date || !students) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: classId, subject, date, students',
        });
        return;
      }

      const result = await attendanceService.markAttendance(req.user!.id, {
        classId,
        subject,
        date,
        students,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/class/:classId
   */
  getClassAttendance: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { classId } = req.params;
      const records = await attendanceService.getClassAttendance(classId);
      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/student/:studentId
   */
  getStudentSummary: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const summary = await attendanceService.getStudentSummary(studentId);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/trends
   * Returns attendance trends for the authenticated professor.
   */
  getTrends: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const trends = await attendanceService.getTrends(req.user!.id);
      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  },
};
