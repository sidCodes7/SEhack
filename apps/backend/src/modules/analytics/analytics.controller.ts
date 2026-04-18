// ──────────────────────────────────────────────
// Analytics Controller — HTTP Layer Only
// ──────────────────────────────────────────────

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as analyticsService from './analytics.service.js';

export const analyticsController = {
  /** GET /attendance — Attendance trends */
  getAttendanceTrends: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const trends = await analyticsService.getAttendanceTrends();
      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  },

  /** GET /approvals — Approval bottleneck analysis */
  getApprovalBottlenecks: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const bottlenecks = await analyticsService.getApprovalBottlenecks();
      res.json({ success: true, data: bottlenecks });
    } catch (error) {
      next(error);
    }
  },

  /** GET /issues — Issue resolution statistics */
  getIssueStats: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await analyticsService.getIssueStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};
