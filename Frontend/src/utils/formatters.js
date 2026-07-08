// Formatting utilities for currency, numbers, text

/**
 * Format a number as Indian Rupees (₹1,23,45,678).
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a large currency value in shorthand (₹4.5 Cr, ₹45 L).
 */
export function formatCurrencyShort(amount) {
  if (amount === undefined || amount === null) return '—';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000)     return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

/**
 * Format a number with thousands separators.
 */
export function formatNumber(n) {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('en-IN').format(n);
}

/**
 * Truncate text to a given length.
 */
export function truncate(str, maxLen = 80) {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

/**
 * Capitalize first letter.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert SCREAMING_SNAKE_CASE to Title Case.
 */
export function labelCase(str) {
  if (!str) return '';
  return str.split('_').map(capitalize).join(' ');
}

/**
 * Get user initials from a name.
 */
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}
