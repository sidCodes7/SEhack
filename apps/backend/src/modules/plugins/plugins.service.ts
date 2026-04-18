// ──────────────────────────────────────────────
// Plugins Service — Business Logic
// ──────────────────────────────────────────────
// Handles plugin submission, Grok security audit,
// admin approval/rejection, and plugin registry queries.

import { db } from '../../shared/db/neon.client.js';
import { plugins } from '../../shared/db/schema.js';
import { eq } from 'drizzle-orm';
import { createError } from '../../shared/middleware/error.middleware.js';
import { emitToRoom } from '../../shared/websocket/ws.server.js';
import { generateSecurityAudit } from './grok-auditor.service.js';

// ── Types ──────────────────────────────────────

interface SubmitPluginInput {
  name: string;
  description: string;
  category: string;
  deploymentUrl: string;
  permissions: string[];
}

// ── Service Functions ──────────────────────────

/**
 * Submit a new plugin for review.
 * Triggers Grok AI security audit automatically.
 */
export async function submitPlugin(submittedBy: string, data: SubmitPluginInput) {
  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Check if slug already exists
  const existing = await db.select().from(plugins).where(eq(plugins.slug, slug));
  if (existing.length > 0) {
    throw createError('A plugin with this name already exists', 409);
  }

  // Insert plugin with pending status
  const [newPlugin] = await db
    .insert(plugins)
    .values({
      name: data.name,
      slug,
      description: data.description,
      deploymentUrl: data.deploymentUrl,
      category: data.category,
      status: 'pending',
      isActive: false,
    })
    .returning();

  // Run Grok security audit
  const auditReport = await generateSecurityAudit({
    name: data.name,
    deploymentUrl: data.deploymentUrl,
    category: data.category,
    permissions: data.permissions,
  });

  // Store the audit report
  const [updated] = await db
    .update(plugins)
    .set({ grokAuditReport: auditReport })
    .where(eq(plugins.id, newPlugin.id))
    .returning();

  return updated;
}

/**
 * Get all active/approved plugins.
 */
export async function getPlugins() {
  return db
    .select()
    .from(plugins)
    .where(eq(plugins.isActive, true));
}

/**
 * Get a single plugin by slug.
 */
export async function getPluginBySlug(slug: string) {
  const [plugin] = await db
    .select()
    .from(plugins)
    .where(eq(plugins.slug, slug));

  if (!plugin) {
    throw createError('Plugin not found', 404);
  }

  return plugin;
}

/**
 * Get a single plugin by ID.
 */
export async function getPlugin(pluginId: string) {
  const [plugin] = await db
    .select()
    .from(plugins)
    .where(eq(plugins.id, pluginId));

  if (!plugin) {
    throw createError('Plugin not found', 404);
  }

  return plugin;
}

/**
 * Approve a plugin — sets status to approved and activates it.
 */
export async function approvePlugin(pluginId: string) {
  const [updated] = await db
    .update(plugins)
    .set({ status: 'approved', isActive: true })
    .where(eq(plugins.id, pluginId))
    .returning();

  if (!updated) {
    throw createError('Plugin not found', 404);
  }

  // Notify all connected Host Shell clients
  try {
    emitToRoom('plugins', 'plugin:approved', {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
    });
  } catch {
    // best-effort
  }

  return updated;
}

/**
 * Reject a plugin.
 */
export async function rejectPlugin(pluginId: string) {
  const [updated] = await db
    .update(plugins)
    .set({ status: 'rejected', isActive: false })
    .where(eq(plugins.id, pluginId))
    .returning();

  if (!updated) {
    throw createError('Plugin not found', 404);
  }

  return updated;
}

/**
 * Get all plugins (including pending) — for admin view.
 */
export async function getAllPlugins() {
  return db.select().from(plugins);
}
