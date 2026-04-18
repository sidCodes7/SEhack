// ──────────────────────────────────────────────
// Auth Middleware — Neon Auth (JWKS) + Fallback
// ──────────────────────────────────────────────
// Validates JWTs against Neon Auth's JWKS endpoint.
// Falls back to local signing key for dev/seed convenience.

import type { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  department?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// ── Neon Auth JWKS Setup ───────────────────────
const JWKS_URL = process.env.NEON_AUTH_JWKS_URL;
const LOCAL_SECRET = new TextEncoder().encode(
  process.env.DATABASE_URL || 'aether-dev-fallback-secret'
);

// Remote JWKS keyset (lazy-initialized)
let remoteJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getRemoteJWKS() {
  if (!remoteJWKS && JWKS_URL) {
    remoteJWKS = createRemoteJWKSet(new URL(JWKS_URL));
  }
  return remoteJWKS;
}

/**
 * Auth middleware: tries Neon Auth JWKS first, then local signing key.
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    let payload: AuthUser;

    // Try Neon Auth JWKS first
    const jwks = getRemoteJWKS();
    if (jwks) {
      try {
        const { payload: decoded } = await jwtVerify(token, jwks);
        payload = decoded as unknown as AuthUser;
        req.user = payload;
        next();
        return;
      } catch {
        // JWKS verification failed — fall through to local
      }
    }

    // Fallback: verify with local signing key (derived from DATABASE_URL)
    const { payload: decoded } = await jwtVerify(token, LOCAL_SECRET);
    payload = decoded as unknown as AuthUser;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

/**
 * Sign a JWT using the local key (for register/login endpoints).
 * In production, Neon Auth issues tokens. This is the dev/demo fallback.
 */
export async function signToken(payload: AuthUser): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(LOCAL_SECRET);
}

/**
 * Role guard factory — restrict endpoint to specific roles.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
