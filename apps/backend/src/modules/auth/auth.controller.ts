// ──────────────────────────────────────────────
// Auth Controller — HTTP Handlers
// ──────────────────────────────────────────────
// Controllers ONLY handle HTTP — all business logic is in auth.service.ts

import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as authService from './auth.service.js';

export const authController = {
  /**
   * POST /api/auth/register
   * Body: { name, email, password, role, department? }
   */
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role, department } = req.body;

      if (!name || !email || !password || !role) {
        res.status(400).json({ success: false, error: 'Missing required fields: name, email, password, role' });
        return;
      }

      const result = await authService.register({ name, email, password, role, department });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Body: { email, password }
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Missing required fields: email, password' });
        return;
      }

      const result = await authService.login({ email, password });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   * (Client-side token invalidation — server acknowledges)
   */
  logout: async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    // JWT is stateless — client is responsible for discarding the token.
    // If we add token blacklisting later, it would go here.
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  },

  /**
   * GET /api/auth/me
   * Returns the currently authenticated user's profile.
   */
  me: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/auth/language
   * Body: { language: 'en' | 'hi' | 'ta' | 'mr' | 'te' }
   */
  updateLanguage: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { language } = req.body;

      if (!language) {
        res.status(400).json({ success: false, error: 'Missing required field: language' });
        return;
      }

      const user = await authService.updateLanguage(req.user!.id, language);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },
};
