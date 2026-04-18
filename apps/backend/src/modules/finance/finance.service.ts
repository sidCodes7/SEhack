// ──────────────────────────────────────────────
// Finance Service — Business Logic
// ──────────────────────────────────────────────
// Handles finance dues queries, payment initiation,
// and payment confirmation with Razorpay verification.

import { db } from '../../shared/db/neon.client.js';
import { financeDues } from '../../shared/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { createError } from '../../shared/middleware/error.middleware.js';
import * as paymentService from './payment.service.js';

/**
 * Get all finance dues for a student.
 * Optionally filter by status.
 */
export async function getDues(studentId: string, status?: string) {
  const conditions = [eq(financeDues.studentId, studentId)];

  if (status) {
    conditions.push(eq(financeDues.status, status));
  }

  const dues = await db
    .select()
    .from(financeDues)
    .where(and(...conditions));

  return dues;
}

/**
 * Initiate payment for a specific due.
 * Creates a Razorpay order and returns order details to the client.
 */
export async function initiatePay(studentId: string, dueId: string) {
  // Verify the due exists and belongs to this student
  const [due] = await db
    .select()
    .from(financeDues)
    .where(and(eq(financeDues.id, dueId), eq(financeDues.studentId, studentId)));

  if (!due) {
    throw createError('Due not found or does not belong to this student', 404);
  }

  if (due.status === 'paid') {
    throw createError('This due has already been paid', 400);
  }

  // Create Razorpay order
  const order = await paymentService.createOrder(dueId, parseFloat(due.amount));

  // Store the Razorpay order ID on the due record
  await db
    .update(financeDues)
    .set({ razorpayOrderId: order.orderId })
    .where(eq(financeDues.id, dueId));

  return order;
}

/**
 * Confirm payment after Razorpay checkout completes on mobile.
 * Verifies the signature server-side before marking as paid.
 */
export async function confirmPay(paymentData: {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = paymentData;

  // Verify signature — NEVER trust mobile
  const isValid = paymentService.verifyPayment(
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature
  );

  if (!isValid) {
    throw createError('Payment verification failed — invalid signature', 400);
  }

  // Find the due by Razorpay order ID and mark as paid
  const [due] = await db
    .select()
    .from(financeDues)
    .where(eq(financeDues.razorpayOrderId, razorpayOrderId));

  if (!due) {
    throw createError('No due found for this payment order', 404);
  }

  const [updated] = await db
    .update(financeDues)
    .set({
      status: 'paid',
      paidAt: new Date(),
    })
    .where(eq(financeDues.id, due.id))
    .returning();

  return updated;
}
