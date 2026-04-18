// ──────────────────────────────────────────────
// Clash Detector — Calendar Conflict Detection
// ──────────────────────────────────────────────
// Detects overlapping room bookings and suggests alternative time slots.

import { db } from '../../shared/db/neon.client.js';
import { calendarEvents } from '../../shared/db/schema.js';
import { eq, and, sql, ne } from 'drizzle-orm';

export interface ClashResult {
  hasClash: boolean;
  conflictingEvents: {
    id: string;
    title: string;
    room: string | null;
    startTime: Date;
    endTime: Date;
  }[];
}

export interface SlotSuggestion {
  room: string;
  startTime: string;
  endTime: string;
  score: number;
}

/**
 * Detect if a room has any overlapping bookings in the given time range.
 * Two events clash if: existingStart < newEnd AND existingEnd > newStart
 */
export async function detectClash(
  room: string,
  startTime: Date,
  endTime: Date,
  excludeEventId?: string
): Promise<ClashResult> {
  const conditions = [
    eq(calendarEvents.room, room),
    sql`${calendarEvents.startTime} < ${endTime.toISOString()}::timestamptz`,
    sql`${calendarEvents.endTime} > ${startTime.toISOString()}::timestamptz`,
  ];

  // Exclude a specific event (useful when checking updates)
  if (excludeEventId) {
    conditions.push(ne(calendarEvents.id, excludeEventId));
  }

  const conflicts = await db
    .select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      room: calendarEvents.room,
      startTime: calendarEvents.startTime,
      endTime: calendarEvents.endTime,
    })
    .from(calendarEvents)
    .where(and(...conditions));

  return {
    hasClash: conflicts.length > 0,
    conflictingEvents: conflicts,
  };
}

/**
 * Suggest 3 available time slots for a given room on a given date.
 * Avoids clashes with existing bookings and the user's own schedule.
 */
export async function suggestSlots(
  room: string,
  date: string,
  userId: string
): Promise<SlotSuggestion[]> {
  const dayStart = new Date(`${date}T08:00:00Z`); // Campus day starts 8 AM
  const dayEnd = new Date(`${date}T20:00:00Z`);   // Campus day ends 8 PM
  const slotDuration = 60 * 60 * 1000; // 1 hour slots

  // Fetch all bookings for this room on this date
  const roomBookings = await db
    .select({
      startTime: calendarEvents.startTime,
      endTime: calendarEvents.endTime,
    })
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.room, room),
        sql`${calendarEvents.startTime} >= ${dayStart.toISOString()}::timestamptz`,
        sql`${calendarEvents.endTime} <= ${dayEnd.toISOString()}::timestamptz`
      )
    );

  // Fetch user's own schedule for this date
  const userSchedule = await db
    .select({
      startTime: calendarEvents.startTime,
      endTime: calendarEvents.endTime,
    })
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.organizerId, userId),
        sql`${calendarEvents.startTime} >= ${dayStart.toISOString()}::timestamptz`,
        sql`${calendarEvents.endTime} <= ${dayEnd.toISOString()}::timestamptz`
      )
    );

  const allBookings = [...roomBookings, ...userSchedule];
  const suggestions: SlotSuggestion[] = [];

  // Scan hourly slots and find 3 free ones
  for (
    let slotStart = dayStart.getTime();
    slotStart + slotDuration <= dayEnd.getTime() && suggestions.length < 3;
    slotStart += slotDuration
  ) {
    const slotEnd = slotStart + slotDuration;

    const hasConflict = allBookings.some((booking) => {
      const bStart = new Date(booking.startTime).getTime();
      const bEnd = new Date(booking.endTime).getTime();
      return bStart < slotEnd && bEnd > slotStart;
    });

    if (!hasConflict) {
      // Score: prefer mid-day slots (10 AM - 4 PM = higher score)
      const hour = new Date(slotStart).getUTCHours();
      const score = hour >= 10 && hour <= 16 ? 1.0 : 0.5;

      suggestions.push({
        room,
        startTime: new Date(slotStart).toISOString(),
        endTime: new Date(slotEnd).toISOString(),
        score,
      });
    }
  }

  // Sort by score descending (best slots first)
  suggestions.sort((a, b) => b.score - a.score);

  return suggestions;
}
