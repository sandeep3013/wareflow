import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DecisionFactor {
  label: string;
  weight: number; // e.g. +40, +25, +18, +9
  rationale: string;
}

export interface DecisionExplanationProps {
  score: number; // 0-100
  engineName?: string;
  factors: DecisionFactor[];
  summary?: string;
  className?: string;
}

export function DecisionExplanation({
  score,
  engineName = 'Deterministic Recommendation Engine',
  factors,
  summary,
  className,
}: DecisionExplanationProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-[#F8FAFC] p-4 text-xs space-y-3.5',
        className
      )}
    >
      {/* Header: Engine + Confidence Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-100 text-indigo-700">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
              {engineName}
            </span>
            <span className="font-semibold text-foreground">Operational Decision Scoring</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <span className="text-[11px] text-foreground-secondary font-medium">Confidence:</span>
          <div className="flex items-center space-x-1.5">
            <div className="w-24 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                style={{ width: `${score}%` }}
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  score >= 90
                    ? 'bg-emerald-600'
                    : score >= 75
                      ? 'bg-indigo-600'
                      : 'bg-amber-500'
                )}
              />
            </div>
            <span className="font-mono font-bold text-foreground tabular-nums text-xs">
              {score}%
            </span>
          </div>
        </div>
      </div>

      {/* Rationale factors table */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary block">
          Weighted Evaluation Factors
        </span>

        <div className="space-y-1.5">
          {factors.map((factor, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded bg-white border border-border/80 text-[11px]"
            >
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="font-medium text-foreground">{factor.label}</span>
                <span className="text-foreground-secondary truncate hidden sm:inline text-[10px]">
                  ({factor.rationale})
                </span>
              </div>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 shrink-0">
                +{factor.weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Score Callout */}
      <div className="flex items-center justify-between pt-2 border-t border-border/80">
        <div className="flex items-center space-x-1.5 text-foreground-secondary text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{summary || 'Deterministic constraint policy verified.'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-bold uppercase text-foreground-secondary">Final Score:</span>
          <span className="font-mono font-bold text-sm text-foreground tabular-nums">{score} / 100</span>
        </div>
      </div>
    </div>
  );
}
