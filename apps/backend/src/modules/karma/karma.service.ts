// ──────────────────────────────────────────────
// Karma Service — Reputation Scoring System
// ──────────────────────────────────────────────
// Tracks karma events and computes leaderboard rankings.
// Other modules (issues, attendance, etc.) call addKarmaEvent().

import { db } from '../../shared/db/neon.client.js';
import { karmaEvents, users } from '../../shared/db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

type KarmaEventType =
  | 'issue_reported'
  | 'class_attended'
  | 'room_returned_early'
  | 'due_paid_on_time'
  | 'peer_endorsed';

// ── Score & Breakdown ──────────────────────────

/**
 * Get the total karma score for a user (sum of all karma events).
 */
export async function getScore(userId: string) {
  const [result] = await db
    .select({
      totalScore: sql<number>`COALESCE(SUM(${karmaEvents.points}), 0)`,
    })
    .from(karmaEvents)
    .where(eq(karmaEvents.userId, userId));

  return { userId, totalScore: Number(result.totalScore) };
}

/**
 * Get a breakdown of karma events for a user, grouped by event type.
 */
export async function getBreakdown(userId: string) {
  const breakdown = await db
    .select({
      eventType: karmaEvents.eventType,
      totalPoints: sql<number>`SUM(${karmaEvents.points})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(karmaEvents)
    .where(eq(karmaEvents.userId, userId))
    .groupBy(karmaEvents.eventType);

  return breakdown.map((b) => ({
    eventType: b.eventType,
    totalPoints: Number(b.totalPoints),
    count: Number(b.count),
  }));
}

// ── Leaderboard ────────────────────────────────

/**
 * Top 10 students by karma score.
 */
export async function getLeaderboard() {
  const leaderboard = await db
    .select({
      userId: karmaEvents.userId,
      totalScore: sql<number>`SUM(${karmaEvents.points})`,
    })
    .from(karmaEvents)
    .groupBy(karmaEvents.userId)
    .orderBy(desc(sql`SUM(${karmaEvents.points})`))
    .limit(10);

  // Enrich with user names
  const enriched = await Promise.all(
    leaderboard.map(async (entry, index) => {
      let userName = 'Unknown';
      if (entry.userId) {
        const [user] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, entry.userId))
          .limit(1);
        if (user) userName = user.name;
      }

      return {
        rank: index + 1,
        userId: entry.userId,
        userName,
        totalScore: Number(entry.totalScore),
      };
    })
  );

  return enriched;
}

// ── Add Karma Event ────────────────────────────
// Called by other modules (issues, attendance, finance, etc.)

/**
 * Add a karma event for a user. Also updates their cached karma_score in the users table.
 */
export async function addKarmaEvent(
  userId: string,
  eventType: KarmaEventType,
  points: number
) {
  const [event] = await db
    .insert(karmaEvents)
    .values({
      userId,
      eventType,
      points,
    })
    .returning();

  // Update the cached karma_score on the users table
  await db
    .update(users)
    .set({
      karmaScore: sql`COALESCE(${users.karmaScore}, 0) + ${points}`,
    })
    .where(eq(users.id, userId));

  return event;
}
