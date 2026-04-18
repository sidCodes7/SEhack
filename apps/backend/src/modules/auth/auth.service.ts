// ──────────────────────────────────────────────
// Auth Service — Business Logic
// ──────────────────────────────────────────────
// Handles registration, login, JWT token generation,
// current user retrieval, and language preference updates.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../shared/db/neon.client.js';
import { users } from '../../shared/db/schema.js';
import { eq } from 'drizzle-orm';
import { createError } from '../../shared/middleware/error.middleware.js';
import type { AuthUser } from '../../shared/middleware/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aether-dev-secret';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register a new user.
 * Returns the created user (without password_hash) and a JWT token.
 */
export async function register(input: RegisterInput) {
  const { name, email, password, role, department } = input;

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    throw createError('Email already registered', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role,
      department: department || null,
    })
    .returning();

  // Generate JWT
  const tokenPayload: AuthUser = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department || undefined,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    user: sanitizeUser(newUser),
    token,
  };
}

/**
 * Login with email and password.
 * Returns user (without password_hash) and a JWT token.
 */
export async function login(input: LoginInput) {
  const { email, password } = input;

  // Find user
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw createError('Invalid email or password', 401);
  }

  // Generate JWT
  const tokenPayload: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    department: user.department || undefined,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    user: sanitizeUser(user),
    token,
  };
}

/**
 * Get the current authenticated user's full profile.
 */
export async function getCurrentUser(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    throw createError('User not found', 404);
  }
  return sanitizeUser(user);
}

/**
 * Update the user's preferred language.
 */
export async function updateLanguage(userId: string, language: string) {
  const validLanguages = ['en', 'hi', 'ta', 'mr', 'te'];
  if (!validLanguages.includes(language)) {
    throw createError(`Invalid language. Supported: ${validLanguages.join(', ')}`, 400);
  }

  const [updated] = await db
    .update(users)
    .set({ preferredLanguage: language })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    throw createError('User not found', 404);
  }

  return sanitizeUser(updated);
}

/**
 * Strip password_hash from user object before returning to client.
 */
function sanitizeUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    karmaScore: user.karmaScore,
    preferredLanguage: user.preferredLanguage,
    createdAt: user.createdAt,
  };
}
