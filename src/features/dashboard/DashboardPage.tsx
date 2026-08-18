import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ShoppingCart,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { useUIStore } from '../../store/useUIStore';
import {
  MOCK_KPIS,
  MOCK_HOURLY_THROUGHPUT,
  MOCK_ORDERS_BY_STATUS,
  MOCK_ZONE_BOTTLENECKS,
  MOCK_ACTIVITY_LOGS,
} from '../../data/analytics';
import { MetricCard } from '../../components/common/MetricCard';
import { ActionQueueCard } from '../../components/common/ActionQueueCard';
import { TelemetryStrip } from '../../components/common/TelemetryStrip';
import { DecisionDetailDrawer } from '../../components/common/DecisionDetailDrawer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { formatNumber, formatPercent, formatRelativeTime } from '../../lib/formatters';
import { OperationalException } from '../../types/exception';

export function DashboardPage() {
  const { orders, initOrders, updateOrderStatus, reallocateOrderStock } = useOrderStore();
  const { inventory, initInventory, adjustStockQuantity } = useInventoryStore();
  const { exceptions, initExceptions, resolveException } = useExceptionStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [selectedDrawerException, setSelectedDrawerException] = useState<OperationalException | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    initOrders();
    initInventory();
    initExceptions();
  }, [initOrders, initInventory, initExceptions]);

  const totalInventoryUnits = inventory.reduce((sum, item) => sum + item.quantityOnHand, 0);
  const criticalOrdersCount = orders.filter((o) => o.priority === 'CRITICAL' && o.status !== 'DISPATCHED').length;
  const activeExceptions = exceptions.filter((e) => e.status !== 'RESOLVED');

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([initOrders(), initInventory(), initExceptions()]);
      addToast({
        title: 'Facility Telemetry Synced',
        description: 'Synchronized with automated warehouse sensors (ORD-1 Alpha).',
        type: 'info',
        duration: 2500,
      });
    } catch {
      addToast({
        title: 'Sync Notice',
        description: 'Using local cached warehouse sensors telemetry.',
        type: 'info',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Main Demo Scenario Handler: Apply Recommendation on ORD-1042 conflict
  const handleApplyResolution = async (exceptionId: string, resolutionId: string, notes?: string) => {
    try {
      await resolveException(exceptionId, resolutionId, notes);

      if (exceptionId === 'EXC-101') {
        // 1. Reallocate 3 units from ORD-1043 to ORD-1042
        await reallocateOrderStock('ORD-1042', [
          { sku: 'SKU-DKS-003', allocated: 10 },
          { sku: 'SKU-CBL-007', allocated: 10 },
        ]);
        await updateOrderStatus('ORD-1042', 'ALLOCATED', 'Allocated 10/10 units (3 units reallocated from ORD-1043 per Decision Engine recommendation).');
        
        // Update Bin on-hand / available
        await adjustStockQuantity('D-13-01-C', 'SKU-DKS-003', 0);

        addToast({
          title: 'Decision Executed: ORD-1042 Stock Reallocated',
          description: 'ORD-1042 is now 100% ALLOCATED. Ready for wave picking. Customer SLA preserved.',
          type: 'success',
        });
      } else {
        addToast({
          title: 'Decision Applied & Saved to Cloud',
          description: `Applied resolution on ${exceptionId}. Operational state synchronized.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Decision Error',
        description: err.message || 'Failed to save resolution.',
        type: 'error',
      });
    }
  };

  const handleReviewDecision = (exc: OperationalException) => {
    setSelectedDrawerException(exc);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Page Header with Operational Control Room Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Operations Command Center
            </h1>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FACILITY TELEMETRY LIVE</span>
            </div>
          </div>
          <p className="text-xs text-foreground-secondary mt-1 max-w-3xl leading-relaxed">
            Real-time visibility into order throughput, inventory risk, fulfillment performance, and operational decisions.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            isLoading={isSyncing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handleSync}
            className="text-xs"
          >
            Sync Telemetry
          </Button>

          <Link to="/exceptions">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
              className="text-xs font-semibold"
            >
              Triage Queue ({activeExceptions.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* COMPACT REAL-TIME TELEMETRY STRIP */}
      <TelemetryStrip />

      {/* TOP KPI CARDS WITH SPARKLINES & INSTANT NAVIGATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders Today"
          value={formatNumber(orders.length > 0 ? orders.length * 15 + 13 : MOCK_KPIS.totalOrders)}
          trend={MOCK_KPIS.totalOrdersTrend}
          trendLabel="vs yesterday"
          sparklineData={[18, 24, 30, 28, 35, 42, 48]}
          icon={<ShoppingCart className="w-4 h-4 text-primary-600" />}
          onClick={() => navigate('/orders')}
        />
        <MetricCard
          title="Total Inventory Units"
          value={formatNumber(totalInventoryUnits || MOCK_KPIS.totalInventoryUnits)}
          subtitle={`${inventory.length} active warehouse SKUs`}
          sparklineData={[4200, 4180, 4150, 4120, 4090, 4050, 3980]}
          icon={<Boxes className="w-4 h-4 text-blue-600" />}
          onClick={() => navigate('/inventory')}
        />
        <MetricCard
          title="Orders At Risk"
          value={criticalOrdersCount || MOCK_KPIS.ordersAtRiskCount}
          trend={-18.4}
          trendLabel="active risk reduction"
          variant="critical"
          sparklineData={[9, 8, 6, 5, 4, 3, 2]}
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
          onClick={() => navigate('/exceptions')}
        />
        <MetricCard
          title="SLA Compliance Rate"
          value={formatPercent(MOCK_KPIS.slaComplianceRate)}
          trend={MOCK_KPIS.slaComplianceTrend}
          trendLabel="above 92% benchmark"
          variant="success"
          sparklineData={[91, 92, 93, 92, 94, 95, 96]}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION: THE INTELLIGENT ACTION QUEUE */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-indigo-100 text-indigo-700 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-foreground uppercase">
                Intelligent Action Queue
              </h2>
              <p className="text-xs text-foreground-secondary">
                Autonomous problem detection and explainable decision recommendations generated by WAREFLOW engines.
              </p>
            </div>
          </div>
          <Link
            to="/exceptions"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <span>View all exceptions ({activeExceptions.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Action Queue Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Demo Action Card: ORD-1042 Allocation Conflict */}
          <ActionQueueCard
            id="action-1"
            exceptionId="EXC-101"
            orderId="ORD-1042"
            sku="SKU-DKS-003"
            priority="CRITICAL"
            type="Allocation Conflict"
            problem="Order #ORD-1042 requires 10 units, but only 7 units are available in primary Bin D-13-01-C. Competing order #ORD-1043 holds demand for 5 units."
            requiredQty={10}
            availableQty={7}
            recommendation="Allocate 7 available units to ORD-1042 + Reallocate 3 units from lower-priority ORD-1043 to satisfy VIP Same-Day SLA."
            whyFactors={[
              'Critical Same-Day SLA risk (<6h remaining)',
              'Enterprise VIP customer contract tier',
              'Highest order age in current batch',
              'Sufficient non-critical demand buffer in ORD-1043',
            ]}
            confidence={92}
            isResolved={exceptions.find((e) => e.id === 'EXC-101')?.status === 'RESOLVED'}
            onApply={() => handleApplyResolution('EXC-101', 'res-101-1', 'Approved allocation recommendation')}
            onReview={() => {
              const exc = exceptions.find((e) => e.id === 'EXC-101') || null;
              if (exc) handleReviewDecision(exc);
            }}
            onOverride={() => {
              const exc = exceptions.find((e) => e.id === 'EXC-101') || null;
              if (exc) handleReviewDecision(exc);
            }}
          />

          {/* Secondary Action Card: SKU-1045 Stockout Forecast */}
          <ActionQueueCard
            id="action-2"
            exceptionId="EXC-102"
            sku="SKU-1045"
            priority="HIGH"
            type="Stock Shortage Forecast"
            problem="SKU-1045 (Mini DisplayPort Adapter) is below safety reorder threshold (14 on-hand vs 30 min). 0.3 days of supply remaining."
            requiredQty={30}
            availableQty={14}
            recommendation="Trigger Emergency Purchase Order to Tier-1 Vendor (200 units with 3-day expedited courier delivery)."
            whyFactors={[
              'Pick velocity increased by 22% in last 48 hours',
              'Prevents expected stockout across 8 pending orders',
              'Supplier lead time: 3 calendar days',
              'Estimated stockout cost exceeds rush shipping fee',
            ]}
            confidence={95}
            isResolved={exceptions.find((e) => e.id === 'EXC-102')?.status === 'RESOLVED'}
            onApply={() => handleApplyResolution('EXC-102', 'res-102-1', 'Approved emergency PO trigger')}
            onReview={() => {
              const exc = exceptions.find((e) => e.id === 'EXC-102') || null;
              if (exc) handleReviewDecision(exc);
            }}
            onOverride={() => {
              const exc = exceptions.find((e) => e.id === 'EXC-102') || null;
              if (exc) handleReviewDecision(exc);
            }}
          />
        </div>
      </div>

      {/* OPERATIONS VISUALIZATION CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fulfillment Throughput (Area Chart) - 2 Cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Fulfillment Hourly Throughput</CardTitle>
              <CardDescription>
                Units picked, packed, and dispatched vs hourly facility target (412 UPH)
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-primary-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-primary-600" />
                <span>Picked Units</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>Dispatched</span>
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_HOURLY_THROUGHPUT} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pickedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="dispatchedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E4E7EC',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pickedUnits"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pickedGrad)"
                    name="Picked Units"
                  />
                  <Area
                    type="monotone"
                    dataKey="dispatchedUnits"
                    stroke="#16A34A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dispatchedGrad)"
                    name="Dispatched Units"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status (Donut Chart) - 1 Col */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Orders by Lifecycle Stage</CardTitle>
            <CardDescription>Current pipeline breakdown across active orders</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_ORDERS_BY_STATUS}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {MOCK_ORDERS_BY_STATUS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E4E7EC',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-foreground">{orders.length}</span>
                <span className="text-[10px] text-foreground-secondary uppercase tracking-wider">Orders</span>
              </div>
            </div>

            {/* Compact Legend */}
            <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2 text-xs">
              {MOCK_ORDERS_BY_STATUS.slice(0, 6).map((item) => (
                <div key={item.name} className="flex items-center space-x-1.5 truncate">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-foreground-secondary truncate">{item.name}</span>
                  <span className="font-semibold text-foreground ml-auto tabular-nums">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ZONE BOTTLENECK MONITOR & REAL-TIME ACTIVITY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone Bottlenecks - 2 Cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Warehouse Zone Congestion Telemetry</CardTitle>
              <CardDescription>
                Physical aisle utilization, pick speed, and congestion scores
              </CardDescription>
            </div>
            <Link to="/analytics">
              <Button variant="ghost" size="xs">
                Zone Heatmap
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_ZONE_BOTTLENECKS.map((zone) => (
                <div
                  key={zone.zone}
                  className={`p-3.5 rounded-lg border transition-all ${
                    zone.status === 'CRITICAL_BOTTLENECK'
                      ? 'bg-rose-50/40 border-rose-200'
                      : zone.status === 'ELEVATED'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-surface-subtle/50 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {zone.zone}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        zone.status === 'CRITICAL_BOTTLENECK'
                          ? 'bg-rose-100 text-rose-800'
                          : zone.status === 'ELEVATED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {zone.status === 'CRITICAL_BOTTLENECK'
                        ? 'Congested'
                        : zone.status === 'ELEVATED'
                          ? 'Elevated'
                          : 'Normal'}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-foreground mt-1 truncate">
                    {zone.name}
                  </h4>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-[10px] text-foreground-secondary block">Pick Time</span>
                      <span className="font-bold tabular-nums text-foreground">
                        {zone.pickSpeedMinutes}m
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-foreground-secondary block">Capacity</span>
                      <span className="font-bold tabular-nums text-foreground">
                        {zone.utilization}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-foreground-secondary block">Staff</span>
                      <span className="font-bold tabular-nums text-foreground">
                        {zone.activeWorkers} active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-Time Activity Feed - 1 Col */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Live Operations Stream</CardTitle>
            <CardDescription>Instant event logging across facility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_ACTIVITY_LOGS.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 text-xs pb-2.5 border-b border-border/60 last:border-0 last:pb-0"
              >
                <div
                  className={`p-1.5 rounded-full mt-0.5 shrink-0 ${
                    log.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-700'
                      : log.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : log.severity === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate">
                      {log.title}
                    </span>
                    <span className="text-[10px] text-foreground-tertiary ml-1">
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground-secondary mt-0.5 line-clamp-2">
                    {log.description}
                  </p>
                  <span className="text-[10px] font-mono text-foreground-tertiary">
                    by {log.actor}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* DECISION DETAIL SLIDE-OUT DRAWER */}
      <DecisionDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        exception={selectedDrawerException}
        onApplyResolution={handleApplyResolution}
      />
    </div>
  );
}
