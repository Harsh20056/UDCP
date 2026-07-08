import { cn } from '../../lib/utils.js';
import { DEPARTMENT_COLORS } from '../../config/constants.js';

export default function DepartmentTag({ department, size = 'sm', className, dot = true }) {
  const colors = DEPARTMENT_COLORS[department];
  if (!colors) return <span className="text-slate-400 text-xs">{department || '—'}</span>;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'xs' && 'px-1.5 py-0.5 text-2xs',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'md' && 'px-3 py-1.5 text-sm',
        className,
      )}
      style={{
        backgroundColor: colors.light,
        color: colors.hex,
        border: `1px solid ${colors.border}`,
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.hex }}
        />
      )}
      {department}
    </span>
  );
}
