// ──────────────────────────────────────────────
// Finance & Payment Types — @aether/shared-types
// ──────────────────────────────────────────────

export type DueType = 'library' | 'canteen' | 'lab';

export type DueStatus = 'pending' | 'paid';

export interface FinanceDue {
  id: string;
  studentId: string;
  type: DueType;
  amount: number;
  status: DueStatus;
  razorpayOrderId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  dueId: string;
}

export interface PaymentVerification {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}
