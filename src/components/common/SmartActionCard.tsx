import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export type SmartActionType = 'CRITICAL' | 'WARNING' | 'BOTTLENECK' | 'INFO';

export interface SmartActionCardProps {
  type: SmartActionType;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
  badge?: string;
  entityId?: string;
  timestamp?: string;
  className?: string;
}

export function SmartActionCard({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  badge,
  entityId,
  timestamp,
  className,
}: SmartActionCardProps) {
  const configs = {
    CRITICAL: {
      border: 'border-rose-200 hover:border-rose-300',
      bg: 'bg-white',
      accentBar: 'bg-rose-500',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
      typeLabel: 'CRITICAL',
      typeColor: 'text-rose-700',
    },
    WARNING: {
      border: 'border-amber-200 hover:border-amber-300',
      bg: 'bg-white',
      accentBar: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
      typeLabel: 'WARNING',
      typeColor: 'text-amber-700',
    },
    BOTTLENECK: {
      border: 'border-purple-200 hover:border-purple-300',
      bg: 'bg-white',
      accentBar: 'bg-purple-500',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: <Activity className="w-4 h-4 text-purple-600 shrink-0" />,
      typeLabel: 'BOTTLENECK',
      typeColor: 'text-purple-700',
    },
    INFO: {
      border: 'border-blue-200 hover:border-blue-300',
      bg: 'bg-white',
      accentBar: 'bg-blue-500',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />,
      typeLabel: 'INFO',
      typeColor: 'text-blue-700',
    },
  };

  const config = configs[type] || configs.INFO;

  const content = (
    <div
      className={cn(
        'relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border shadow-card transition-all duration-150 hover:shadow-card-hover group gap-4',
        config.bg,
        config.border,
        className
      )}
    >
      {/* Left Accent indicator line */}
      <div className={cn('absolute left-0 top-3 bottom-3 w-1 rounded-r-full', config.accentBar)} />

      {/* Main Information */}
      <div className="flex items-start space-x-3.5 pl-2.5">
        <div className="mt-0.5">{config.icon}</div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('text-[11px] font-bold tracking-wider uppercase', config.typeColor)}>
              {config.typeLabel}
            </span>
            {badge && (
              <span className={cn('text-[10px] font-semibold px-2 py-0.2 rounded-full border', config.badgeBg)}>
                {badge}
              </span>
            )}
            {entityId && (
              <span className="text-[11px] font-mono text-foreground-secondary bg-surface-subtle px-1.5 py-0.2 rounded border border-border">
                {entityId}
              </span>
            )}
            {timestamp && (
              <span className="text-[11px] text-foreground-tertiary">
                • {timestamp}
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary-700 transition-colors">
            {title}
          </h4>
          <p className="text-xs text-foreground-secondary leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0 flex items-center justify-end pl-2.5 md:pl-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-surface-subtle border border-border text-foreground hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all shadow-subtle group-hover:translate-x-0.5">
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );

  if (actionHref) {
    return <Link to={actionHref} className="block">{content}</Link>;
  }

  return <div onClick={onAction} className="cursor-pointer">{content}</div>;
}
