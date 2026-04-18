// ──────────────────────────────────────────────
// Payment Service — Razorpay Integration
// ──────────────────────────────────────────────
// Handles Razorpay order creation and signature verification.
// Uses axios + Node crypto (no additional SDK needed).
// ⚠️ NEVER trust mobile for payment confirmation — always verify on backend.

import axios from 'axios';
import crypto from 'crypto';
import { createError } from '../../shared/middleware/error.middleware.js';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_API = 'https://api.razorpay.com/v1';

/**
 * Create a Razorpay order for a given amount.
 * Returns the orderId for the mobile client to open checkout.
 */
export async function createOrder(dueId: string, amount: number) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw createError('Razorpay credentials not configured', 500);
  }

  // Amount in paise (Razorpay expects smallest currency unit)
  const amountInPaise = Math.round(amount * 100);

  try {
    const response = await axios.post(
      `${RAZORPAY_API}/orders`,
      {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `due_${dueId}`,
        notes: { dueId },
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );

    return {
      orderId: response.data.id,
      amount: amount,
      currency: 'INR',
      dueId,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Razorpay order creation failed';
    throw createError(`Payment initiation failed: ${message}`, 502);
  }
}

/**
 * Verify Razorpay payment signature using HMAC-SHA256.
 * ⚠️ This is the ONLY way to confirm a payment is genuine.
 */
export function verifyPayment(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): boolean {
  if (!RAZORPAY_KEY_SECRET) {
    throw createError('Razorpay credentials not configured', 500);
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpaySignature;
}
