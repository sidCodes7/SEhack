// ──────────────────────────────────────────────
// Finance Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import { financeController } from './finance.controller.js';

const router = Router();

// GET /api/finance/dues — list my dues
router.get('/dues', financeController.getDues);

// POST /api/finance/pay/:dueId — initiate Razorpay order
router.post('/pay/:dueId', financeController.initiatePay);

// POST /api/finance/verify — verify payment signature
router.post('/verify', financeController.verifyPayment);

export default router;
