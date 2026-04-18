// ──────────────────────────────────────────────
// Notices Controller — HTTP Layer Only
// ──────────────────────────────────────────────

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as noticesService from './notices.service.js';

export const noticesController = {
  /** POST / — Publish a new notice (professor/admin only) */
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user!.role;

      // Only professors, HoDs, admins, and deans can publish notices
      const allowedRoles = ['professor', 'hod', 'admin', 'dean', 'principal'];
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ success: false, error: 'Only faculty and staff can publish notices' });
        return;
      }

      const { title, content, targetRole, department } = req.body as {
        title: string;
        content: string;
        targetRole?: string;
        department?: string;
      };

      if (!title || !content) {
        res.status(400).json({ success: false, error: 'title and content are required' });
        return;
      }

      const notice = await noticesService.createNotice(
        req.user!.id,
        title,
        content,
        targetRole,
        department
      );

      res.status(201).json({ success: true, data: notice });
    } catch (error) {
      next(error);
    }
  },

  /** GET / — List notices with optional filters */
  list: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { department, targetRole } = req.query as {
        department?: string;
        targetRole?: string;
      };

      const noticesList = await noticesService.getNotices({ department, targetRole });
      res.json({ success: true, data: noticesList });
    } catch (error) {
      next(error);
    }
  },

  /** GET /:id — Get a single notice */
  getById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const notice = await noticesService.getNoticeById(req.params.id);
      res.json({ success: true, data: notice });
    } catch (error) {
      next(error);
    }
  },
};
