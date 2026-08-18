import React from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = <PackageOpen className="w-10 h-10 text-foreground-tertiary" />,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-surface-subtle/50 my-4',
        className
      )}
    >
      <div className="p-3 bg-white rounded-full border border-border shadow-subtle mb-3">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {description && (
        <p className="text-xs text-foreground-secondary max-w-sm mt-1 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
