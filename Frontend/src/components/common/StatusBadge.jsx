import { cn } from '../../lib/utils.js';
import { STATUS_CONFIG } from '../../config/constants.js';

const STATUS_ICONS = {
  DRAFT:             '○',
  SUBMITTED:         '→',
  CONFLICT_ANALYSIS: '⚠',
  DEPT_NOTIFIED:     '📢',
  UNDER_REVIEW:      '⏳',
  APPROVED:          '✓',
  REJECTED:          '✕',
  SCHEDULED:         '📅',
  IN_PROGRESS:       '●',
  COMPLETED:         '✓',
};

export default function StatusBadge({ status, size = 'sm', className }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'xs' && 'px-1.5 py-0.5 text-2xs',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'md' && 'px-3 py-1.5 text-sm',
        className,
      )}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      <span className="text-xs">{STATUS_ICONS[status]}</span>
      {config.label}
    </span>
  );
}
