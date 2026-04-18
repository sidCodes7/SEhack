// ──────────────────────────────────────────────
// Email Service — Resend
// ──────────────────────────────────────────────

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendApiKey || resendApiKey === 're_PLACEHOLDER') {
    console.warn('⚠️ Resend not configured — email sending disabled');
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(resendApiKey);
  }

  return resendClient;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend.
 * Returns the email ID on success, or null if not configured / failed.
 */
export async function sendEmail(payload: EmailPayload): Promise<string | null> {
  const client = getResendClient();
  if (!client) return null;

  try {
    const { data } = await client.emails.send({
      from: 'Aether Campus <noreply@aether.campus>',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    return data?.id ?? null;
  } catch (error) {
    console.error('Email send failed:', error);
    return null;
  }
}

/**
 * Send an approval notification email.
 */
export async function sendApprovalEmail(
  to: string,
  requesterName: string,
  requestType: string,
  status: 'approved' | 'rejected'
): Promise<string | null> {
  const emoji = status === 'approved' ? '✅' : '❌';
  return sendEmail({
    to,
    subject: `${emoji} Your ${requestType} request has been ${status}`,
    html: `
      <h2>Hi ${requesterName},</h2>
      <p>Your <strong>${requestType}</strong> request has been <strong>${status}</strong>.</p>
      <p>Log in to Aether to view details.</p>
      <br/>
      <p style="color: #888;">— Aether Campus OS</p>
    `,
  });
}
