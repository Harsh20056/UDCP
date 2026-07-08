import { cn } from '../../lib/utils.js';
import { PRIORITY_CONFIG } from '../../config/constants.js';

const PRIORITY_ICONS = {
  LOW:      '↓',
  MEDIUM:   '→',
  HIGH:     '↑',
  CRITICAL: '⬆',
};

export default function PriorityTag({ priority, size = 'sm', className }) {
  const config = PRIORITY_CONFIG[priority];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium',
        size === 'xs' && 'px-1.5 py-0.5 text-2xs',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        className,
      )}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      <span>{PRIORITY_ICONS[priority]}</span>
      {config.label}
    </span>
  );
}
