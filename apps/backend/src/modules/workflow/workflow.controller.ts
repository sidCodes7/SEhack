// ──────────────────────────────────────────────
// Workflow Controller — HTTP Layer Only
// ──────────────────────────────────────────────
// No business logic here. Delegates everything to workflow.service.

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as workflowService from './workflow.service.js';
// Local type mirror — avoids rootDir cross-package TS resolution issue
type WorkflowType = 'room_booking' | 'certificate' | 'leave';

export const workflowController = {
  /** POST /request — Submit a new workflow request */
  submitRequest: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { type, metadata } = req.body as {
        type: WorkflowType;
        metadata: Record<string, unknown>;
      };

      if (!type || !metadata) {
        res.status(400).json({ success: false, error: 'type and metadata are required' });
        return;
      }

      const validTypes: WorkflowType[] = ['room_booking', 'certificate', 'leave'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
        return;
      }

      const request = await workflowService.createRequest(req.user!.id, type, metadata);
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  },

  /** GET /requests — List all requests for the authenticated user */
  getMyRequests: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const requests = await workflowService.getRequestsByUser(req.user!.id);
      res.json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  },

  /** GET /requests/:id — Get a single request with full approval chain */
  getRequestById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const request = await workflowService.getRequestById(req.params.id);
      res.json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  },

  /** GET /pending — Requests awaiting the current user's approval */
  getPending: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const requests = await workflowService.getPendingForApprover(req.user!.id);
      res.json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  },

  /** POST /requests/:id/approve — Approve the current stage */
  approve: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { note } = req.body as { note?: string };
      const result = await workflowService.approveStage(req.params.id, req.user!.id, note);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /** POST /requests/:id/reject — Reject the current stage */
  reject: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { note } = req.body as { note?: string };

      if (!note) {
        res.status(400).json({ success: false, error: 'A rejection note is required' });
        return;
      }

      const result = await workflowService.rejectStage(req.params.id, req.user!.id, note);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
