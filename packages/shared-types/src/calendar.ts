// ──────────────────────────────────────────────
// Calendar & Booking Types — @aether/shared-types
// ──────────────────────────────────────────────

export type CalendarEventType = 'class' | 'event' | 'room_booking';

export interface CalendarEvent {
  id: string;
  organizerId: string;
  title: string;
  type?: CalendarEventType;
  room?: string;
  startTime: string;
  endTime: string;
  isLocked: boolean;
  createdAt: string;
}

export interface ClashResult {
  hasClash: boolean;
  conflictingEvents: CalendarEvent[];
}

export interface SlotSuggestion {
  room: string;
  startTime: string;
  endTime: string;
  score: number;
}

export interface BookRoomPayload {
  title: string;
  room: string;
  startTime: string;
  endTime: string;
}
