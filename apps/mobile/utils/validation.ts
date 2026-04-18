/**
 * Validation utilities for form inputs.
 */

/**
 * Validate an email address format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password meets minimum requirements.
 * At least 6 characters.
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Check if a string is not empty after trimming.
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate a time string in HH:mm format.
 */
export function isValidTime(time: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

/**
 * Validate that end time is after start time.
 */
export function isEndAfterStart(start: string, end: string): boolean {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em > sh * 60 + sm;
}

/**
 * Get a validation error message or null if valid.
 */
export function validateBookingForm(data: {
  room: string;
  date: string;
  fromTime: string;
  toTime: string;
  purpose: string;
}): string | null {
  if (!isNotEmpty(data.room)) return 'Please select a room.';
  if (!isNotEmpty(data.date)) return 'Please select a date.';
  if (!isNotEmpty(data.fromTime)) return 'Please select start time.';
  if (!isNotEmpty(data.toTime)) return 'Please select end time.';
  if (!isEndAfterStart(data.fromTime, data.toTime)) return 'End time must be after start time.';
  if (!isNotEmpty(data.purpose)) return 'Please describe the purpose.';
  return null;
}
