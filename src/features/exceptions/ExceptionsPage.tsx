import { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Check,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { useExceptionStore } from '../../store/useExceptionStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useUIStore } from '../../store/useUIStore';
import { PageHeader } from '../../components/common/PageHeader';
import { DecisionExplanation } from '../../components/common/DecisionExplanation';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/status-badge';
import { LoadingState } from '../../components/ui/loading-state';
import { formatRelativeTime } from '../../lib/formatters';

export function ExceptionsPage() {
  const {
    exceptions,
    selectedExceptionId,
    setSelectedExceptionId,
    resolveException,
    statusFilter,
    setStatusFilter,
    severityFilter,
    setSeverityFilter,
    isLoading,
    error,
  } = useExceptionStore();

  const { updateOrderStatus, reallocateOrderStock } = useOrderStore();
  const { adjustStockQuantity } = useInventoryStore();
  const { addToast } = useUIStore();

  const filteredExceptions = exceptions.filter((exc) => {
    if (statusFilter !== 'ALL' && exc.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && exc.severity !== severityFilter) return false;
    return true;
  });

  const selectedException =
    filteredExceptions.find((e) => e.id === selectedExceptionId) || filteredExceptions[0];

  const [selectedResolutionOption, setSelectedResolutionOption] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const handleApplyResolution = async () => {
    if (!selectedException) return;

    const chosenOptionId =
      selectedResolutionOption ||
      selectedException.recommendedResolutions[0]?.id;

    if (!chosenOptionId) return;

    const chosen = selectedException.recommendedResolutions.find((r) => r.id === chosenOptionId);

    setIsResolving(true);
    try {
      await resolveException(selectedException.id, chosenOptionId, chosen?.actionTitle);

      // If it was the critical ORD-1042 allocation exception, reallocate stock & advance order state
      if (selectedException.orderId === 'ORD-1042') {
        await reallocateOrderStock('ORD-1042', [
          { sku: 'SKU-DKS-003', allocated: 10 },
          { sku: 'SKU-CBL-007', allocated: 10 },
        ]);
        await updateOrderStatus('ORD-1042', 'ALLOCATED', 'Reallocated 3 units from ORD-1043 per manager decision');
        await adjustStockQuantity('D-13-01-C', 'SKU-DKS-003', 0);
      }

      addToast({
        title: 'Resolution Approved & Saved',
        description: `Executed: "${chosen?.actionTitle}". Operational state synchronized.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Resolution Error',
        description: err.message || 'Failed to record exception resolution.',
        type: 'error',
      });
    } finally {
      setIsResolving(false);
    }
  };

  const decisionFactors = [
    { label: 'SLA Urgency Weight', weight: 40, rationale: 'Carrier flight/truck cutoff schedule' },
    { label: 'Customer Tier Priority', weight: 25, rationale: 'Contractual penalty clause protection' },
    { label: 'Inventory Feasibility', weight: 18, rationale: 'Warehouse physical bin availability' },
    { label: 'Order Age & Queue Index', weight: 9, rationale: 'FIFO priority sequence' },
  ];

  return (
    <div className="flex flex-col space-y-4 pb-6">
      {/* Header & Filter Bar */}
      <div className="space-y-4 shrink-0">
        <PageHeader
          title="Exception Resolution Center"
          description="Autonomous problem detection, explainable decision scoring, and supervisor resolution execution."
          badge={
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                {exceptions.filter((e) => e.status !== 'RESOLVED').length} Active Issues
              </span>
            </div>
          }
        />

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-border text-xs shadow-subtle">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-foreground-secondary" />
            <span className="font-bold text-foreground">Filter Exceptions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by exception status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 rounded-md border border-border bg-white px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="RECOMMENDED">Recommended</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              aria-label="Filter by exception severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="h-8 rounded-md border border-border bg-white px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading exceptions..." className="py-20" />
      ) : (
        /* Main Split Layout with INDEPENDENT SCROLL on desktop, natural stacking on mobile */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Independent Scroll Container on Desktop, normal flow on mobile */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary px-1 shrink-0">
              Detected Operational Exceptions ({filteredExceptions.length})
            </h3>

            <div className="space-y-2.5 lg:max-h-[calc(100dvh-280px)] lg:overflow-y-auto lg:pr-1">
              {filteredExceptions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-lg border border-border text-xs text-foreground-secondary">
                  No exceptions matching the current filter criteria.
                </div>
              ) : (
                filteredExceptions.map((exc) => {
                  const isSelected = exc.id === selectedException?.id;
                  const isResolved = exc.status === 'RESOLVED';

                  return (
                    <div
                      key={exc.id}
                      onClick={() => {
                        setSelectedExceptionId(exc.id);
                        setSelectedResolutionOption(null);
                      }}
                      className={`p-4 rounded-lg border transition-all cursor-pointer text-left space-y-2 shadow-subtle ${
                        isSelected
                          ? 'border-indigo-600 bg-white ring-1 ring-indigo-600 shadow-card'
                          : isResolved
                            ? 'border-border bg-[#F8FAFC]/60 opacity-70'
                            : 'border-border bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              exc.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : exc.severity === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {exc.severity}
                          </span>
                          <span className="font-mono text-xs font-bold text-foreground">
                            {exc.id}
                          </span>
                        </div>
                        <StatusBadge status={exc.status} size="sm" />
                      </div>

                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {exc.title}
                      </h4>

                      <p className="text-[11px] text-foreground-secondary line-clamp-2 leading-relaxed">
                        {exc.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-foreground-tertiary font-medium">
                        <span>Reported by {exc.reportedBy}</span>
                        <span>{formatRelativeTime(exc.detectedAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Independent Scroll Container on Desktop, normal flow on mobile */}
          <div className="lg:col-span-7 lg:max-h-[calc(100dvh-280px)] lg:overflow-y-auto lg:pr-1">
            {selectedException ? (
              <Card className="p-6 space-y-6 bg-white shadow-card">
                {/* Header */}
                <div className="border-b border-border pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                        {selectedException.id}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
                        {selectedException.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <StatusBadge status={selectedException.status} />
                  </div>
                  <h2 className="text-base font-bold text-foreground">
                    {selectedException.title}
                  </h2>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {selectedException.description}
                  </p>
                </div>

                {/* 1. Root Cause Analysis */}
                {selectedException.rootCauseAnalysis && (
                  <div className="p-3.5 rounded-lg bg-surface-subtle border border-border space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-tertiary block">
                      Root Cause Telemetry
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      {selectedException.rootCauseAnalysis}
                    </p>
                  </div>
                )}

                {/* 2. Explainable Decision Factors */}
                <DecisionExplanation
                  score={selectedException.recommendedResolutions[0]?.confidenceScore || 92}
                  engineName="WAREFLOW Autonomous Exception Engine"
                  factors={decisionFactors}
                />

                {/* 3. Calculated Decision Recommendations */}
                {selectedException.status !== 'RESOLVED' ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-indigo-700">
                      <Sparkles className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Decision Recommendations (Select to Approve)
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {selectedException.recommendedResolutions.map((res, index) => {
                        const isOptionSelected =
                          selectedResolutionOption === res.id ||
                          (!selectedResolutionOption && index === 0);

                        return (
                          <div
                            key={res.id}
                            onClick={() => setSelectedResolutionOption(res.id)}
                            className={`p-4 rounded-lg border transition-all cursor-pointer text-left space-y-2 ${
                              isOptionSelected
                                ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600'
                                : 'border-border bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                    isOptionSelected
                                      ? 'border-indigo-600 bg-indigo-600 text-white'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {isOptionSelected && <Check className="w-3 h-3" />}
                                </div>
                                <span className="text-xs font-bold text-foreground">
                                  {res.actionTitle}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {res.confidenceScore}% Confidence
                              </span>
                            </div>

                            <p className="text-xs text-foreground-secondary pl-6 leading-relaxed">
                              {res.description}
                            </p>

                            <div className="pl-6 pt-1 text-[11px] text-foreground font-medium flex items-center space-x-1">
                              <span className="text-foreground-secondary">Impact:</span>
                              <span>{res.impactAssessment}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-end space-x-2">
                      <Button
                        variant="primary"
                        size="md"
                        isLoading={isResolving}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={handleApplyResolution}
                        className="font-semibold shadow-xs"
                      >
                        Approve & Execute Resolution
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Exception Successfully Resolved</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {selectedException.resolutionNotes}
                    </p>
                    <div className="text-[11px] text-emerald-700 pt-1">
                      Resolved by {selectedException.resolvedBy} on{' '}
                      {formatRelativeTime(selectedException.resolvedAt || '')}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12 text-center text-foreground-secondary text-xs">
                Select an operational exception to inspect automated decisions.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
