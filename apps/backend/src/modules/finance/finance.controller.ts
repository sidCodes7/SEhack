// ──────────────────────────────────────────────
// Finance Controller — HTTP Handlers
// ──────────────────────────────────────────────
// Controllers ONLY handle HTTP — all logic is in finance.service.ts

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as financeService from './finance.service.js';

export const financeController = {
  /**
   * GET /api/finance/dues
   * Returns the authenticated student's finance dues.
   */
  getDues: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dues = await financeService.getDues(req.user!.id);
      res.json({ success: true, data: dues });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/finance/pay/:dueId
   * Initiates Razorpay payment for a specific due.
   * Returns Razorpay order details for the mobile checkout.
   */
  initiatePay: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { dueId } = req.params;
      const order = await financeService.initiatePay(req.user!.id, dueId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/finance/verify
   * Body: { razorpayPaymentId, razorpayOrderId, razorpaySignature }
   * Verifies Razorpay payment signature and marks due as paid.
   */
  verifyPayment: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: razorpayPaymentId, razorpayOrderId, razorpaySignature',
        });
        return;
      }

      const result = await financeService.confirmPay({
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
