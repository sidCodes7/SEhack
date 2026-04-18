// ──────────────────────────────────────────────
// Global Error Handler Middleware
// ──────────────────────────────────────────────
// Must be registered LAST in the Express middleware chain.
// Catches all errors thrown or passed via next(error).

import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  // Log full error in development only
  if (process.env.NODE_ENV !== 'production') {
    console.error(`❌ [${statusCode}] ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/**
 * Helper to create operational errors with a status code.
 */
export function createError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}
