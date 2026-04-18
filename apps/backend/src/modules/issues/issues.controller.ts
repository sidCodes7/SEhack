// ──────────────────────────────────────────────
// Issues Controller — HTTP Handlers
// ──────────────────────────────────────────────
// Controllers ONLY handle HTTP — all logic is in issues.service.ts

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as issuesService from './issues.service.js';
import * as heatmapService from './heatmap.service.js';

export const issuesController = {
  /**
   * POST /api/issues
   * Body (multipart): image file + JSON fields (title, description, category, building, locationX, locationY)
   */
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, category, building, locationX, locationY } = req.body;

      if (!title) {
        res.status(400).json({ success: false, error: 'Missing required field: title' });
        return;
      }

      // Multer attaches file to req.file
      const imageBuffer = (req as AuthRequest & { file?: Express.Multer.File }).file?.buffer;

      const issue = await issuesService.createIssue(
        req.user!.id,
        {
          title,
          description,
          category,
          building,
          locationX: locationX ? parseFloat(locationX) : undefined,
          locationY: locationY ? parseFloat(locationY) : undefined,
        },
        imageBuffer
      );

      res.status(201).json({ success: true, data: issue });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/issues
   * Query params: category, status, building
   */
  list: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { category, status, building } = req.query;

      const issues = await issuesService.getIssues({
        category: category as string | undefined,
        status: status as string | undefined,
        building: building as string | undefined,
      });

      res.json({ success: true, data: issues });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/issues/heatmap
   * Returns aggregated heatmap data points.
   */
  heatmap: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await heatmapService.getHeatmapData();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/issues/:id/status
   * Body: { status: 'open' | 'in_progress' | 'resolved' }
   */
  updateStatus: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ success: false, error: 'Missing required field: status' });
        return;
      }

      const updated = await issuesService.updateStatus(id, status);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },
};
