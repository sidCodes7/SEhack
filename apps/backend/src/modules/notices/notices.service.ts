// ──────────────────────────────────────────────
// Notices Service — Business Logic
// ──────────────────────────────────────────────
// Simple CRUD for notices. NO RAG indexing, NO external calls.
// Just DB inserts and WebSocket emissions.

import { db } from '../../shared/db/neon.client.js';
import { notices } from '../../shared/db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { emitToRole } from '../../shared/websocket/ws.server.js';
import { createError } from '../../shared/middleware/error.middleware.js';

interface NoticeFilters {
  department?: string;
  targetRole?: string;
}

/**
 * Create a new notice and broadcast via WebSocket.
 * No RAG, no Pinecone, no vector indexing — just a DB insert.
 */
export async function createNotice(
  authorId: string,
  title: string,
  content: string,
  targetRole?: string,
  department?: string
) {
  const [notice] = await db
    .insert(notices)
    .values({
      authorId,
      title,
      content,
      targetRole: targetRole || 'student',
      department: department || null,
    })
    .returning();

  // Emit to all users with the target role so they get real-time updates
  emitToRole(targetRole || 'student', 'notice:new', {
    id: notice.id,
    title: notice.title,
    department: notice.department,
    createdAt: notice.createdAt,
  });

  return notice;
}

/**
 * List notices with optional filters for department and target role.
 */
export async function getNotices(filters: NoticeFilters = {}) {
  const conditions = [];

  if (filters.department) {
    conditions.push(eq(notices.department, filters.department));
  }
  if (filters.targetRole) {
    conditions.push(eq(notices.targetRole, filters.targetRole));
  }

  const whereClause = conditions.length > 0
    ? and(...conditions)
    : undefined;

  const result = await db
    .select()
    .from(notices)
    .where(whereClause)
    .orderBy(desc(notices.createdAt));

  return result;
}

/**
 * Get a single notice by ID.
 */
export async function getNoticeById(noticeId: string) {
  const [notice] = await db
    .select()
    .from(notices)
    .where(eq(notices.id, noticeId))
    .limit(1);

  if (!notice) {
    throw createError('Notice not found', 404);
  }

  return notice;
}
