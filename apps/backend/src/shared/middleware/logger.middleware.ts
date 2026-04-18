// ──────────────────────────────────────────────
// Request Logger Middleware
// ──────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`;

    if (res.statusCode >= 500) {
      console.error(`🔴 ${log}`);
    } else if (res.statusCode >= 400) {
      console.warn(`🟡 ${log}`);
    } else {
      console.log(`🟢 ${log}`);
    }
  });

  next();
}
