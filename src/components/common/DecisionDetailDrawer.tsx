import { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { DecisionExplanation } from './DecisionExplanation';
import { OperationalException } from '../../types/exception';

export interface DecisionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  exception: OperationalException | null;
  onApplyResolution: (exceptionId: string, resolutionId: string, notes?: string) => void;
}

export function DecisionDetailDrawer({
  isOpen,
  onClose,
  exception,
  onApplyResolution,
}: DecisionDetailDrawerProps) {
  const [selectedResolutionId, setSelectedResolutionId] = useState<string | null>(null);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideNotes, setOverrideNotes] = useState('');

  if (!isOpen || !exception) return null;

  const currentOptionId = selectedResolutionId || exception.recommendedResolutions[0]?.id;
  const currentOption = exception.recommendedResolutions.find((r) => r.id === currentOptionId) || exception.recommendedResolutions[0];

  const handleExecute = () => {
    if (isOverriding) {
      onApplyResolution(
        exception.id,
        currentOption?.id || 'override',
        `Manual Supervisor Override: ${overrideNotes || 'Manual allocation approved by Marcus Vance'}`
      );
    } else if (currentOption) {
      onApplyResolution(exception.id, currentOption.id, currentOption.actionTitle);
    }
    onClose();
  };

  // Explanation factors based on exception context
  const decisionFactors = [
    { label: 'SLA Urgency Weight', weight: 40, rationale: 'Same-day enterprise delivery commitment' },
    { label: 'Customer Tier Priority', weight: 25, rationale: 'Enterprise VIP contract grade' },
    { label: 'Inventory Feasibility', weight: 18, rationale: 'Stock available in active picking zone D' },
    { label: 'Order Age & Queue Index', weight: 9, rationale: 'Ingested 06:15 UTC (top of queue)' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-modal flex flex-col border-l border-border animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-[#F8FAFC]">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              DECISION #{exception.id.replace('EXC', 'DEC')}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                exception.severity === 'CRITICAL'
                  ? 'bg-rose-100 text-rose-800'
                  : exception.severity === 'HIGH'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {exception.type.replace(/_/g, ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Problem Statement */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-foreground">{exception.title}</h3>
            <p className="text-foreground-secondary leading-relaxed">{exception.description}</p>
          </div>

          {/* Current State vs Required Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-surface-subtle border border-border">
            <div>
              <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
                Required Units
              </span>
              <span className="font-mono font-bold text-foreground text-sm">10 units</span>
              <span className="text-[10px] text-foreground-tertiary block">ORD-1042 Demand</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
                Available Stock
              </span>
              <span className="font-mono font-bold text-emerald-700 text-sm">7 units</span>
              <span className="text-[10px] text-foreground-tertiary block">Bin D-13-01-C</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
                Shortfall
              </span>
              <span className="font-mono font-bold text-rose-600 text-sm">3 units</span>
              <span className="text-[10px] text-foreground-tertiary block">Reallocation target</span>
            </div>
          </div>

          {/* Root Cause Analysis */}
          {exception.rootCauseAnalysis && (
            <div className="p-3.5 rounded-lg bg-amber-50/40 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-[11px] text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Root Cause Telemetry</span>
              </div>
              <p className="text-[11px] leading-relaxed">{exception.rootCauseAnalysis}</p>
            </div>
          )}

          {/* Explainable Decision Scoring Component */}
          <DecisionExplanation
            score={currentOption?.confidenceScore || 92}
            engineName="WAREFLOW Decision Engine"
            factors={decisionFactors}
            summary="Recommended deterministic resolution minimizes overall warehouse SLA penalty."
          />

          {/* Decision Resolution Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                Evaluated Action Alternatives
              </span>
              <span className="text-[10px] text-foreground-tertiary font-medium">
                Select to preview impact
              </span>
            </div>

            <div className="space-y-2.5">
              {exception.recommendedResolutions.map((res) => {
                const isSelected = res.id === currentOptionId;
                return (
                  <div
                    key={res.id}
                    onClick={() => {
                      setSelectedResolutionId(res.id);
                      setIsOverriding(false);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                        : 'border-border bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-bold text-foreground text-xs">
                          {res.actionTitle}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                        {res.confidenceScore}% Score
                      </span>
                    </div>

                    <p className="text-foreground-secondary leading-relaxed pl-5.5 text-[11px]">
                      {res.description}
                    </p>

                    <div className="pl-5.5 flex items-center space-x-1.5 text-[11px]">
                      <span className="text-foreground-tertiary">Expected Impact:</span>
                      <span className="font-medium text-foreground">{res.impactAssessment}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supervisor Override Input */}
          {isOverriding && (
            <div className="p-3.5 rounded-lg bg-gray-50 border border-border space-y-2">
              <label className="text-[11px] font-bold text-foreground block">
                Supervisor Override Rationale & Notes
              </label>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="State the operational reason for overriding engine recommendation..."
                className="w-full h-20 p-2 text-xs rounded border border-border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Drawer Sticky Footer Actions */}
        <div className="p-4 border-t border-border bg-[#F8FAFC] flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOverriding(!isOverriding)}
            className="text-foreground-secondary hover:text-foreground text-xs"
          >
            {isOverriding ? 'Cancel Override' : 'Supervisor Override...'}
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={handleExecute}
            >
              {isOverriding ? 'Confirm Override' : 'Apply Recommendation'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
