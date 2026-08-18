import React from 'react';
import { Card } from '../ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // percentage, positive or negative
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'success';
  sparklineData?: number[];
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel = 'vs yesterday',
  icon,
  variant = 'default',
  sparklineData,
  className,
  onClick,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const isNeutral = trend !== undefined && trend === 0;

  const variantBorders = {
    default: 'hover:border-primary-300',
    critical: 'border-rose-200 bg-rose-50/15 hover:border-rose-300',
    warning: 'border-amber-200 bg-amber-50/15 hover:border-amber-300',
    success: 'border-emerald-200 bg-emerald-50/15 hover:border-emerald-300',
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 flex flex-col justify-between transition-all duration-200 shadow-subtle hover:shadow-card',
        variantBorders[variant],
        onClick && 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-secondary">{title}</span>
        {icon && (
          <div className="p-1.5 rounded-md bg-surface-subtle border border-border/80 text-foreground-secondary">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</div>
          {(trend !== undefined || subtitle) && (
            <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-foreground-secondary">
              {trend !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center font-bold text-xs',
                    isPositive && (variant === 'critical' ? 'text-rose-600' : 'text-emerald-600'),
                    isNegative && (variant === 'critical' ? 'text-emerald-600' : 'text-rose-600'),
                    isNeutral && 'text-gray-500'
                  )}
                >
                  {isPositive && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                  {isNegative && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                  {isNeutral && <Minus className="w-3.5 h-3.5 mr-0.5" />}
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              <span className="text-[11px] text-foreground-tertiary">
                {trend !== undefined ? trendLabel : subtitle}
              </span>
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="flex items-end gap-1 h-7 pb-0.5">
            {sparklineData.map((val, idx) => {
              const max = Math.max(...sparklineData, 1);
              const heightPct = Math.max(15, Math.round((val / max) * 100));
              return (
                <div
                  key={idx}
                  style={{ height: `${heightPct}%` }}
                  className={cn(
                    'w-1.5 rounded-t transition-all',
                    variant === 'critical'
                      ? 'bg-rose-400/80'
                      : variant === 'success'
                        ? 'bg-emerald-400/80'
                        : 'bg-primary-400/80'
                  )}
                  title={`Step ${idx + 1}: ${val}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
