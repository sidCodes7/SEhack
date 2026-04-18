/**
 * Client-side clash detection utility.
 * This is an optional pre-check — the server is authoritative for clash detection.
 */

interface TimeSlot {
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  roomId: string;
}

interface Event {
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  title?: string;
}

/**
 * Converts "HH:mm" time string to minutes since midnight.
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Checks if two time ranges overlap.
 */
function rangesOverlap(
  start1: number, end1: number,
  start2: number, end2: number,
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Check if a proposed booking clashes with any existing events.
 * Returns the list of clashing events, or an empty array if no clash.
 */
export function detectClashes(proposed: TimeSlot, existingEvents: Event[]): Event[] {
  const proposedStart = timeToMinutes(proposed.startTime);
  const proposedEnd = timeToMinutes(proposed.endTime);

  return existingEvents.filter((event) => {
    if (event.date !== proposed.date) return false;
    if (event.roomId !== proposed.roomId) return false;

    const eventStart = timeToMinutes(event.startTime);
    const eventEnd = timeToMinutes(event.endTime);

    return rangesOverlap(proposedStart, proposedEnd, eventStart, eventEnd);
  });
}

/**
 * Generate alternative time slot suggestions when a clash is detected.
 * Suggests 3 non-overlapping slots around the desired time.
 */
export function suggestAlternatives(
  proposed: TimeSlot,
  existingEvents: Event[],
  durationMinutes: number = 60,
): TimeSlot[] {
  const suggestions: TimeSlot[] = [];
  const proposedStart = timeToMinutes(proposed.startTime);

  // Try slots: 1 hour before, 2 hours after, and 3 hours after
  const offsets = [-60, 120, 180];

  for (const offset of offsets) {
    const candidateStart = proposedStart + offset;
    const candidateEnd = candidateStart + durationMinutes;

    if (candidateStart < 480 || candidateEnd > 1200) continue; // 8 AM - 8 PM

    const candidate: TimeSlot = {
      date: proposed.date,
      startTime: `${Math.floor(candidateStart / 60).toString().padStart(2, '0')}:${(candidateStart % 60).toString().padStart(2, '0')}`,
      endTime: `${Math.floor(candidateEnd / 60).toString().padStart(2, '0')}:${(candidateEnd % 60).toString().padStart(2, '0')}`,
      roomId: proposed.roomId,
    };

    const clashes = detectClashes(candidate, existingEvents);
    if (clashes.length === 0) {
      suggestions.push(candidate);
    }

    if (suggestions.length >= 3) break;
  }

  return suggestions;
}
