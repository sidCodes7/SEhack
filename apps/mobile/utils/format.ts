/**
 * Format utilities for the Aether mobile app.
 */

/**
 * Format a date string to a short readable format.
 * e.g., "Apr 19" or "Apr 19, 10:00 AM"
 */
export function formatDate(dateStr: string, includeTime = false): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (includeTime) {
    options.hour = 'numeric';
    options.minute = '2-digit';
    options.hour12 = true;
  }
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a currency amount in INR.
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Get relative time string (e.g., "2 hrs ago", "Just now").
 */
export function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours} hrs ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Get initials from a full name (e.g., "Priyank Mehta" -> "PM").
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}
