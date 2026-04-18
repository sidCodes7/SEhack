// ──────────────────────────────────────────────
// Issues Service — Business Logic
// ──────────────────────────────────────────────
// Handles issue CRUD, image uploads via Cloudinary,
// auto-priority assignment, and WebSocket notifications.

import { db } from '../../shared/db/neon.client.js';
import { issues } from '../../shared/db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { createError } from '../../shared/middleware/error.middleware.js';
import { uploadImage } from '../../shared/storage/cloudinary.service.js';
import { emitToRoom } from '../../shared/websocket/ws.server.js';
import { addKarmaEvent } from '../karma/karma.service.js';

// ── Types ──────────────────────────────────────

interface CreateIssueInput {
  title: string;
  description?: string;
  category?: string;
  building?: string;
  locationX?: number;
  locationY?: number;
}

interface IssueFilters {
  category?: string;
  status?: string;
  building?: string;
}

// ── Auto-priority mapping ──────────────────────

const CATEGORY_PRIORITY: Record<string, string> = {
  facility: 'high',
  it: 'medium',
  academic: 'low',
  other: 'medium',
};

// ── Service Functions ──────────────────────────

/**
 * Create a new campus issue.
 * Optionally uploads an image to Cloudinary.
 * Emits WebSocket events for real-time updates.
 */
export async function createIssue(
  reporterId: string,
  data: CreateIssueInput,
  imageBuffer?: Buffer
) {
  // Upload image if provided
  let imageUrl: string | undefined;
  if (imageBuffer) {
    imageUrl = await uploadImage(imageBuffer, 'aether/issues');
  }

  // Auto-assign priority based on category
  const priority = CATEGORY_PRIORITY[data.category || 'other'] || 'medium';

  // Insert into DB
  const [newIssue] = await db
    .insert(issues)
    .values({
      reporterId,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      priority,
      status: 'open',
      building: data.building || null,
      locationX: data.locationX?.toString() || null,
      locationY: data.locationY?.toString() || null,
      imageUrl: imageUrl || null,
    })
    .returning();

  // Emit WebSocket events for real-time updates
  try {
    emitToRoom('support', 'issue:created', {
      id: newIssue.id,
      title: newIssue.title,
      category: newIssue.category,
      priority: newIssue.priority,
      building: newIssue.building,
    });

    if (newIssue.locationX && newIssue.locationY) {
      emitToRoom('support', 'heatmap:update', {
        x: parseFloat(newIssue.locationX),
        y: parseFloat(newIssue.locationY),
        category: newIssue.category,
      });
    }
  } catch {
    // WebSocket emit is best-effort — don't fail the request
  }

  // Award karma for reporting an issue
  try {
    await addKarmaEvent(reporterId, 'issue_reported', 10);
  } catch {
    // Karma is best-effort — don't fail the request
  }

  return newIssue;
}

/**
 * List issues with optional filters.
 */
export async function getIssues(filters: IssueFilters = {}) {
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(issues.category, filters.category));
  }
  if (filters.status) {
    conditions.push(eq(issues.status, filters.status));
  }
  if (filters.building) {
    conditions.push(eq(issues.building, filters.building));
  }

  const query = db.select().from(issues).orderBy(desc(issues.createdAt));

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  return query;
}

/**
 * Get a single issue by ID.
 */
export async function getIssueById(issueId: string) {
  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, issueId));

  if (!issue) {
    throw createError('Issue not found', 404);
  }

  return issue;
}

/**
 * Update issue status (support staff action).
 */
export async function updateStatus(issueId: string, status: string) {
  const validStatuses = ['open', 'in_progress', 'resolved'];
  if (!validStatuses.includes(status)) {
    throw createError(`Invalid status. Valid: ${validStatuses.join(', ')}`, 400);
  }

  const [updated] = await db
    .update(issues)
    .set({ status, updatedAt: new Date() })
    .where(eq(issues.id, issueId))
    .returning();

  if (!updated) {
    throw createError('Issue not found', 404);
  }

  // Notify support room about status change
  try {
    emitToRoom('support', 'issue:statusChanged', {
      id: updated.id,
      status: updated.status,
      title: updated.title,
    });
  } catch {
    // best-effort
  }

  return updated;
}
