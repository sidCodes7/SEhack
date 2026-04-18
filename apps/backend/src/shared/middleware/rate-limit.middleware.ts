// ──────────────────────────────────────────────
// Rate Limiter Middleware
// ──────────────────────────────────────────────

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter.
 * 100 requests per 15 minutes per IP.
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

/**
 * Strict rate limiter for auth endpoints.
 * 10 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many auth attempts, please try again later.' },
});
