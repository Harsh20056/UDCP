import { cn } from '../../lib/utils.js';

export default function LoadingSpinner({ size = 'md', label, className }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full border-slate-200 dark:border-slate-700 border-t-primary-700 animate-spin',
          sizes[size],
        )}
        style={{ borderTopColor: '#0B4F8A' }}
        role="status"
        aria-label={label || 'Loading…'}
      />
      {label && <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
}
