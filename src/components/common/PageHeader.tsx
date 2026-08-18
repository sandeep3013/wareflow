import React from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border/80', className)}>
      <div className="space-y-1">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs md:text-sm text-foreground-secondary leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center space-x-2 shrink-0">{actions}</div>}
    </div>
  );
}
