// Date utility functions

/**
 * Format a date string to a readable display format.
 * @param {string} dateStr - ISO date string.
 * @param {object} opts - Intl.DateTimeFormat options.
 */
export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', ...opts,
  });
}

/**
 * Format a datetime string to a readable display.
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Return a relative time string (e.g. "2 hours ago").
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

/**
 * Check if two date ranges overlap.
 */
export function datesOverlap(start1, end1, start2, end2) {
  return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
}

/**
 * Get the number of days between two dates.
 */
export function daysBetween(date1, date2) {
  return Math.round(Math.abs(new Date(date1) - new Date(date2)) / 86400000);
}

/**
 * Format duration in days to a readable string.
 */
export function formatDuration(startDate, endDate) {
  const days = daysBetween(startDate, endDate);
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
}
