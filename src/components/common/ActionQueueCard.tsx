import { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface ActionQueueCardProps {
  id: string;
  exceptionId?: string;
  orderId?: string;
  sku?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  problem: string;
  requiredQty?: number;
  availableQty?: number;
  recommendation: string;
  whyFactors: string[];
  confidence: number;
  isResolved?: boolean;
  onApply: () => void;
  onReview: () => void;
  onOverride?: () => void;
}

export function ActionQueueCard({
  orderId,
  sku,
  priority,
  type,
  problem,
  requiredQty,
  availableQty,
  recommendation,
  whyFactors,
  confidence,
  isResolved = false,
  onApply,
  onReview,
  onOverride,
}: ActionQueueCardProps) {
  const [applied, setApplied] = useState(isResolved);

  const handleApplyClick = () => {
    setApplied(true);
    onApply();
  };

  const priorityStyles = {
    CRITICAL: 'border-l-4 border-l-rose-600 bg-white shadow-card hover:shadow-card-hover border-border',
    HIGH: 'border-l-4 border-l-amber-500 bg-white shadow-card hover:shadow-card-hover border-border',
    MEDIUM: 'border-l-4 border-l-indigo-500 bg-white shadow-card hover:shadow-card-hover border-border',
    LOW: 'border-l-4 border-l-gray-400 bg-white shadow-card hover:shadow-card-hover border-border',
  };

  if (applied || isResolved) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4.5 flex items-center justify-between text-xs transition-all">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-emerald-900">{type} Resolved</span>
              {orderId && (
                <span className="font-mono text-[11px] font-bold text-emerald-700">#{orderId}</span>
              )}
            </div>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Decision executed. Warehouse allocation & telemetry state updated.
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded bg-emerald-100/60">
          Applied by Supervisor
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-5 transition-all text-xs space-y-4',
        priorityStyles[priority]
      )}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center space-x-2">
          <span
            className={cn(
              'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide',
              priority === 'CRITICAL'
                ? 'bg-rose-100 text-rose-800'
                : priority === 'HIGH'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-indigo-100 text-indigo-800'
            )}
          >
            {priority}
          </span>
          <span className="font-bold text-foreground text-xs uppercase tracking-wider">
            {type}
          </span>
          {(orderId || sku) && (
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              {orderId ? `#${orderId}` : sku}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 text-foreground-secondary text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-foreground">Decision Engine</span>
        </div>
      </div>

      {/* Problem Statement & Quantities */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground leading-relaxed">
          {problem}
        </p>

        {requiredQty !== undefined && availableQty !== undefined && (
          <div className="flex items-center space-x-4 pt-1 text-[11px] font-mono">
            <span className="text-foreground-secondary">
              Demand: <strong className="text-foreground">{requiredQty} units</strong>
            </span>
            <span className="text-foreground-secondary">
              Available: <strong className="text-emerald-700">{availableQty} units</strong>
            </span>
            <span className="text-foreground-secondary">
              Shortage: <strong className="text-rose-600">{Math.max(0, requiredQty - availableQty)} units</strong>
            </span>
          </div>
        )}
      </div>

      {/* Recommendation Highlight Box */}
      <div className="p-3.5 rounded-md bg-[#F8FAFC] border border-indigo-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 block">
            Recommended Action
          </span>
          <span className="font-mono text-[10px] font-bold text-indigo-900 bg-indigo-100/60 px-1.5 py-0.2 rounded">
            Optimal Resolution
          </span>
        </div>
        <p className="text-xs font-semibold text-foreground leading-relaxed">
          {recommendation}
        </p>

        {/* Why Factors List */}
        {whyFactors.length > 0 && (
          <div className="pt-2 border-t border-indigo-100/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary block">
              Why this decision?
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-foreground-secondary">
              {whyFactors.map((factor, i) => (
                <li key={i} className="flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span className="truncate">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confidence Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-foreground-secondary font-medium">Decision Confidence</span>
          <span className="font-mono font-bold text-foreground tabular-nums">{confidence}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            style={{ width: `${confidence}%` }}
            className={cn(
              'h-full rounded-full transition-all duration-500',
              confidence >= 90
                ? 'bg-emerald-600'
                : confidence >= 75
                  ? 'bg-indigo-600'
                  : 'bg-amber-500'
            )}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/80">
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            onClick={handleApplyClick}
            className="shadow-xs font-semibold"
          >
            Apply Recommendation
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            onClick={onReview}
          >
            Review Decision
          </Button>
        </div>

        {onOverride && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onOverride}
            className="text-foreground-secondary hover:text-foreground text-[11px]"
          >
            Override...
          </Button>
        )}
      </div>
    </div>
  );
}
