// ──────────────────────────────────────────────
// PYQ Controller — HTTP Handlers
// ──────────────────────────────────────────────
// Controllers ONLY handle HTTP — all logic is in pyq.service.ts

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as pyqService from './pyq.service.js';

export const pyqController = {
  /**
   * GET /api/pyq/papers
   * Query params: q (search), subject, year, semester, department
   */
  searchPapers: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { q, subject, year, semester, department } = req.query;

      const papers = await pyqService.searchPapers(q as string | undefined, {
        subject: subject as string | undefined,
        year: year ? parseInt(year as string, 10) : undefined,
        semester: semester ? parseInt(semester as string, 10) : undefined,
        department: department as string | undefined,
      });

      res.json({ success: true, data: papers });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/pyq/papers/:id
   */
  getPaper: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const paper = await pyqService.getPaperById(id);
      res.json({ success: true, data: paper });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/pyq/sync
   * Admin only — triggers DSpace sync.
   */
  sync: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Only admin can trigger sync
      if (req.user!.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Only admins can trigger PYQ sync' });
        return;
      }

      const result = await pyqService.syncFromDSpace();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
