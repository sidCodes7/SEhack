// ──────────────────────────────────────────────
// Dashboard Controller — HTTP Handlers
// ──────────────────────────────────────────────

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as dashboardService from './dashboard.service.js';

export const dashboardController = {
  /**
   * GET /api/dashboard/student
   * Returns aggregated student dashboard widget data.
   */
  student: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getStudentDashboard(req.user!.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dashboard/professor
   * Returns aggregated professor dashboard widget data.
   */
  professor: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getProfessorDashboard(req.user!.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dashboard/admin
   * Returns system-wide analytics overview for admin.
   */
  admin: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getAdminDashboard();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
