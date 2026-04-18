// ──────────────────────────────────────────────
// Karma Controller — HTTP Layer Only
// ──────────────────────────────────────────────

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as karmaService from './karma.service.js';

export const karmaController = {
  /** GET /score — Get karma score for the authenticated user */
  getScore: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const score = await karmaService.getScore(req.user!.id);
      const breakdown = await karmaService.getBreakdown(req.user!.id);
      res.json({ success: true, data: { ...score, breakdown } });
    } catch (error) {
      next(error);
    }
  },

  /** GET /leaderboard — Top 10 students by karma */
  getLeaderboard: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const leaderboard = await karmaService.getLeaderboard();
      res.json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  },
};
