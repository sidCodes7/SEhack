// ──────────────────────────────────────────────
// Users Controller — HTTP Handlers
// ──────────────────────────────────────────────

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as usersService from './users.service.js';

export const usersController = {
  /**
   * GET /api/users/:id
   * Get a single user's public profile.
   */
  getUser: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await usersService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/users
   * List users, optionally filtered by ?role= and/or ?department=
   */
  listUsers: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const role = req.query.role as string | undefined;
      const department = req.query.department as string | undefined;

      const usersList = await usersService.listUsers({ role, department });
      res.json({ success: true, data: usersList });
    } catch (error) {
      next(error);
    }
  },
};
