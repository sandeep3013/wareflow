import React from 'react';
import { cn } from '../../lib/utils';
import { getStatusColor } from '../../lib/formatters';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function StatusBadge({
  status,
  size = 'md',
  showDot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const { bg, border, dot } = getStatusColor(status);

  const formatStatusText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide uppercase',
        bg,
        border,
        sizeClasses,
        className
      )}
      {...props}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} />}
      <span className="font-semibold">{formatStatusText(status)}</span>
    </span>
  );
}
