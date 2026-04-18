// ──────────────────────────────────────────────
// Users Service — Business Logic
// ──────────────────────────────────────────────

import { db } from '../../shared/db/neon.client.js';
import { users } from '../../shared/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { createError } from '../../shared/middleware/error.middleware.js';

/**
 * Get a single user by ID (public profile — no password_hash).
 */
export async function getUserById(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: users.department,
      karmaScore: users.karmaScore,
      preferredLanguage: users.preferredLanguage,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
}

/**
 * List users with optional filters for role and department.
 */
export async function listUsers(filters: { role?: string; department?: string }) {
  const conditions = [];

  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }

  if (filters.department) {
    conditions.push(eq(users.department, filters.department));
  }

  const query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: users.department,
      karmaScore: users.karmaScore,
      preferredLanguage: users.preferredLanguage,
      createdAt: users.createdAt,
    })
    .from(users);

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  return query;
}
