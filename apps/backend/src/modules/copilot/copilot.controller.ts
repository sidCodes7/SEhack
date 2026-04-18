// ──────────────────────────────────────────────
// Copilot Controller — HTTP Layer Only
// ──────────────────────────────────────────────

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as copilotService from './copilot.service.js';

export const copilotController = {
  /** POST /chat — Send a message to the copilot */
  chat: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { message } = req.body as { message: string };

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({ success: false, error: 'message is required and must be a non-empty string' });
        return;
      }

      const result = await copilotService.chat(req.user!.id, message.trim());
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /** GET /session — Get conversation history */
  getSession: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const session = await copilotService.getSession(req.user!.id);
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  },

  /** POST /proactive — Fetch deterministic proactive alerts (no Grok) */
  getProactiveAlerts: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alerts = await copilotService.getProactiveAlerts(req.user!.id);
      res.json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  },

  /** GET /languages — List supported languages */
  getLanguages: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const languages = copilotService.getSupportedLanguages();
      res.json({ success: true, data: languages });
    } catch (error) {
      next(error);
    }
  },
};
