import React from 'react';
import { OrderPriority } from '../../types/order';
import { cn } from '../../lib/utils';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

export interface PriorityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  priority: OrderPriority;
  score?: number;
}

export function PriorityBadge({ priority, score, className, ...props }: PriorityBadgeProps) {
  const configs: Record<
    OrderPriority,
    { bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    CRITICAL: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />,
    },
    HIGH: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />,
    },
    MEDIUM: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <ArrowUp className="w-3 h-3 text-blue-600 shrink-0" />,
    },
    LOW: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      icon: <ArrowDown className="w-3 h-3 text-gray-500 shrink-0" />,
    },
  };

  const config = configs[priority] || configs.LOW;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border tracking-wider uppercase',
        config.bg,
        config.text,
        config.border,
        className
      )}
      {...props}
    >
      {config.icon}
      <span>{priority}</span>
      {score !== undefined && (
        <span className="ml-0.5 px-1 py-0.2 bg-white/70 rounded text-[10px] tabular-nums font-bold">
          {score}
        </span>
      )}
    </span>
  );
}
