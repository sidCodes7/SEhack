// ──────────────────────────────────────────────
// Razorpay Payment Service
// ──────────────────────────────────────────────
// Creates Razorpay orders for finance dues
// Test mode: use prefix "rzp_test_" key

import Razorpay from 'razorpay';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

let razorpay: Razorpay | null = null;

try {
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log('💳 Razorpay initialized (Test Mode)');
  }
} catch (e) {
  console.log('⚠️  Razorpay init skipped — keys not configured');
}

export async function createPaymentOrder(amount: number, dueType: string, studentId: string) {
  if (!razorpay) {
    // Fallback: return mock order for demo
    return {
      id: `order_mock_${Date.now()}`,
      amount: amount * 100,
      currency: 'INR',
      status: 'created',
      key_id: RAZORPAY_KEY_ID || 'rzp_test_demo',
      notes: { dueType, studentId },
    };
  }

  const order = await razorpay.orders.create({
    amount: amount * 100, // Razorpay uses paise
    currency: 'INR',
    receipt: `due_${Date.now()}`,
    notes: { dueType, studentId },
  });

  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    key_id: RAZORPAY_KEY_ID,
    notes: order.notes,
  };
}

export function getKeyId() {
  return RAZORPAY_KEY_ID || 'rzp_test_demo';
}
