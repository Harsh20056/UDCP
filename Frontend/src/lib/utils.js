import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn/ui cn() utility — merges Tailwind class names intelligently.
 * Handles conflicting classes (e.g. px-2 and px-4 → px-4).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
