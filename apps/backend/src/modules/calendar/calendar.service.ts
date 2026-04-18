// ──────────────────────────────────────────────
// Calendar Service — Business Logic
// ──────────────────────────────────────────────

import { db } from '../../shared/db/neon.client.js';
import { calendarEvents } from '../../shared/db/schema.js';
import { eq, and, sql, desc } from 'drizzle-orm';
import { detectClash, suggestSlots } from './clash-detector.js';
import { createError } from '../../shared/middleware/error.middleware.js';

// ── Event Queries ──────────────────────────────

/**
 * Get all events for a user in a given date range.
 */
export async function getEvents(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  const conditions = [eq(calendarEvents.organizerId, userId)];

  if (startDate) {
    conditions.push(sql`${calendarEvents.startTime} >= ${startDate}::timestamptz`);
  }
  if (endDate) {
    conditions.push(sql`${calendarEvents.endTime} <= ${endDate}::timestamptz`);
  }

  const events = await db
    .select()
    .from(calendarEvents)
    .where(and(...conditions))
    .orderBy(calendarEvents.startTime);

  return events;
}

/**
 * Get room availability — all events for a specific room.
 */
export async function getRoomAvailability(room: string) {
  const events = await db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      startTime: calendarEvents.startTime,
      endTime: calendarEvents.endTime,
      isLocked: calendarEvents.isLocked,
    })
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.room, room),
        sql`${calendarEvents.endTime} > NOW()` // Only future events
      )
    )
    .orderBy(calendarEvents.startTime);

  return { room, events };
}

/**
 * List all distinct rooms.
 */
export async function listRooms() {
  const rooms = await db
    .selectDistinct({ room: calendarEvents.room })
    .from(calendarEvents)
    .where(sql`${calendarEvents.room} IS NOT NULL`);

  return rooms.map((r) => r.room);
}

// ── Room Booking ───────────────────────────────

/**
 * Book a room. Runs clash detection first.
 * If clear → creates event with is_locked = true.
 * If clash → returns suggestions.
 */
export async function bookRoom(
  userId: string,
  title: string,
  room: string,
  startTime: string,
  endTime: string
) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    throw createError('startTime must be before endTime', 400);
  }

  // Run clash detection
  const clash = await detectClash(room, start, end);

  if (clash.hasClash) {
    // Return clash info + suggestions
    const date = startTime.split('T')[0];
    const suggestions = await suggestSlots(room, date, userId);

    return {
      booked: false,
      clash,
      suggestions,
    };
  }

  // No clash — create the booking
  const [event] = await db
    .insert(calendarEvents)
    .values({
      organizerId: userId,
      title,
      type: 'room_booking',
      room,
      startTime: start,
      endTime: end,
      isLocked: true,
    })
    .returning();

  return {
    booked: true,
    event,
  };
}

// ── Clash Check (standalone) ───────────────────

export async function checkClash(room: string, startTime: string, endTime: string) {
  return detectClash(room, new Date(startTime), new Date(endTime));
}

// ── Smart Suggestions ──────────────────────────

export async function getSmartSuggestions(room: string, date: string, userId: string) {
  return suggestSlots(room, date, userId);
}
