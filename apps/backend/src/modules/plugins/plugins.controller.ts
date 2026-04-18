// ──────────────────────────────────────────────
// Plugins Controller — HTTP Handlers
// ──────────────────────────────────────────────
// Controllers ONLY handle HTTP — all logic is in plugins.service.ts

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as pluginsService from './plugins.service.js';

export const pluginsController = {
  /**
   * GET /api/plugins
   * List all active/approved plugins.
   */
  list: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const plugins = await pluginsService.getPlugins();
      res.json({ success: true, data: plugins });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/plugins/:slug
   * Get plugin by slug.
   */
  getBySlug: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const plugin = await pluginsService.getPluginBySlug(slug);
      res.json({ success: true, data: plugin });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/plugins
   * Submit a new plugin (triggers Grok security audit).
   * Body: { name, description, category, deploymentUrl, permissions[] }
   */
  submit: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, description, category, deploymentUrl, permissions } = req.body;

      if (!name || !description || !deploymentUrl) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, description, deploymentUrl',
        });
        return;
      }

      const plugin = await pluginsService.submitPlugin(req.user!.id, {
        name,
        description,
        category: category || 'utility',
        deploymentUrl,
        permissions: permissions || [],
      });

      res.status(201).json({ success: true, data: plugin });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/plugins/:id/approve
   * Admin approve a plugin.
   */
  approve: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user!.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Only admins can approve plugins' });
        return;
      }

      const { id } = req.params;
      const plugin = await pluginsService.approvePlugin(id);
      res.json({ success: true, data: plugin });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/plugins/:id/reject
   * Admin reject a plugin.
   */
  reject: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user!.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Only admins can reject plugins' });
        return;
      }

      const { id } = req.params;
      const plugin = await pluginsService.rejectPlugin(id);
      res.json({ success: true, data: plugin });
    } catch (error) {
      next(error);
    }
  },
};
