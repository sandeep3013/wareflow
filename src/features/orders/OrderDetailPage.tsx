import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Play,
  Activity,
} from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useUIStore } from '../../store/useUIStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/status-badge';
import { PriorityBadge } from '../../components/ui/priority-badge';
import { DecisionExplanation } from '../../components/common/DecisionExplanation';
import { calculateOrderPriority } from '../../engines/priorityEngine';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { formatCurrency, formatDate } from '../../lib/formatters';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById, updateOrderStatus } = useOrderStore();
  const { addToast } = useUIStore();

  const order = getOrderById(orderId || '');

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Order Not Found</h2>
        <p className="text-xs text-foreground-secondary">
          Could not locate order #{orderId} in the current active warehouse database.
        </p>
        <Link to="/orders">
          <Button variant="outline" size="sm">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const priorityBreakdown = calculateOrderPriority(order);

  const handleAdvanceStatus = () => {
    let nextStatus: typeof order.status = 'PICKING';
    if (order.status === 'NEW') nextStatus = 'PRIORITIZED';
    else if (order.status === 'PRIORITIZED') nextStatus = 'ALLOCATED';
    else if (order.status === 'ALLOCATED' || order.status === 'PARTIALLY_ALLOCATED') nextStatus = 'PICKING';
    else if (order.status === 'PICKING') nextStatus = 'PACKING';
    else if (order.status === 'PACKING') nextStatus = 'QUALITY_CHECK';
    else if (order.status === 'QUALITY_CHECK') nextStatus = 'READY_TO_DISPATCH';
    else if (order.status === 'READY_TO_DISPATCH') nextStatus = 'DISPATCHED';

    updateOrderStatus(order.id, nextStatus, `Operator advanced stage to ${nextStatus}`);
    addToast({
      title: 'Order Status Advanced',
      description: `Order ${order.id} updated to ${nextStatus}.`,
      type: 'success',
    });
  };

  const workflowSteps: typeof order.status[] = [
    'NEW',
    'PRIORITIZED',
    'ALLOCATED',
    'PICKING',
    'PACKING',
    'QUALITY_CHECK',
    'READY_TO_DISPATCH',
    'DISPATCHED',
  ];

  const currentStepIndex = workflowSteps.indexOf(
    order.status === 'PARTIALLY_ALLOCATED' ? 'ALLOCATED' : order.status
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <Link
          to="/orders"
          className="p-1.5 rounded-md border border-border bg-white text-foreground-secondary hover:bg-surface-subtle transition-colors"
          aria-label="Back to orders list"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold font-mono text-foreground">{order.id}</h1>
              <PriorityBadge priority={order.priority} score={order.priorityScore} />
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-foreground-secondary mt-0.5">
              Created {formatDate(order.createdAt)} • Ref: {order.externalReference || 'N/A'} • Channel: {order.channel.replace(/_/g, ' ')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {order.status !== 'DISPATCHED' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play className="w-3.5 h-3.5" />}
                onClick={handleAdvanceStatus}
              >
                Advance Stage ({order.status})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Workflow Timeline Bar */}
      <Card className="p-4 bg-white shadow-card">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 py-1">
          {workflowSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex || order.status === 'DISPATCHED';
            const isCurrent = idx === currentStepIndex && order.status !== 'DISPATCHED';

            return (
              <div key={step} className="flex items-center space-x-2 shrink-0">
                <div
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-current text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                  )}
                  <span>{step.replace(/_/g, ' ')}</span>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className={`h-0.5 w-4 sm:w-8 ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Grid: Order Line Items & Customer / Fulfillment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Items Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>Order Items & Bin Reservations ({order.items.length})</CardTitle>
              <span className="text-xs font-mono text-foreground-secondary">
                Total Units: <strong>{order.totalUnits}</strong>
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <TableContainer className="border-0 shadow-none">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU / Item Description</TableHead>
                      <TableHead>Bin Location</TableHead>
                      <TableHead className="text-right">Ordered</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Link
                            to={`/inventory/${item.sku}`}
                            className="font-mono text-xs font-bold text-primary-600 hover:underline block"
                          >
                            {item.sku}
                          </Link>
                          <span className="text-xs text-foreground font-medium block">
                            {item.productName}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-subtle border border-border">
                            {item.assignedBin || 'Pending Allocation'}
                          </span>
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {item.quantityOrdered}
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs tabular-nums font-bold">
                          <span
                            className={
                              item.quantityAllocated < item.quantityOrdered
                                ? 'text-rose-600'
                                : 'text-emerald-700'
                            }
                          >
                            {item.quantityAllocated} / {item.quantityOrdered}
                          </span>
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs tabular-nums text-foreground-secondary">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs font-bold tabular-nums">
                          {formatCurrency(item.unitPrice * item.quantityOrdered)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Professional Milestone Audit Timeline */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Milestone Audit Log & Event Timeline</CardTitle>
                <p className="text-xs text-foreground-secondary">
                  Immutable chronological lifecycle events recorded by warehouse engines and floor operators.
                </p>
              </div>
              <div className="p-1 rounded bg-indigo-50 text-indigo-700">
                <Activity className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                {order.timeline.map((entry, i) => (
                  <div key={i} className="relative text-xs group">
                    <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {entry.status.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[10px] text-foreground-tertiary">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-foreground-secondary mt-0.5 text-[11px] leading-relaxed">
                        {entry.note}
                      </p>
                    )}
                    <span className="text-[10px] font-mono text-indigo-600 block mt-0.5">
                      Source / Actor: {entry.actor || 'WAREFLOW Automation Core'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer, Priority & Shipping Summary Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* Priority Explainability Component */}
          <DecisionExplanation
            score={priorityBreakdown.totalScore}
            engineName="WAREFLOW Priority Engine"
            factors={[
              { label: 'SLA Urgency Weight', weight: priorityBreakdown.slaWeightScore, rationale: 'Minutes remaining to carrier cutoff' },
              { label: 'Customer Contract Tier', weight: priorityBreakdown.customerTierScore, rationale: order.customer.tier },
              { label: 'Shipping Speed Service', weight: priorityBreakdown.shippingSpeedScore, rationale: order.shippingMethod },
              { label: 'Order Dollar Value', weight: priorityBreakdown.orderValueScore, rationale: formatCurrency(order.totalValue) },
            ]}
            summary={priorityBreakdown.rationale}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Customer & SLA Constraints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-foreground-secondary text-[11px] block">Company / Customer</span>
                <span className="font-bold text-foreground text-sm">
                  {order.customer.company || order.customer.name}
                </span>
                <span className="text-[11px] text-foreground-secondary block mt-0.5">
                  {order.customer.email} • {order.customer.phone}
                </span>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-foreground-secondary text-[11px] block">SLA Commitment</span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <span className="font-semibold text-foreground">
                    {formatDate(order.slaDeadline)}
                  </span>
                </div>
                {order.slaRisk && (
                  <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                    ⚠️ SLA risk detected: Requires high-priority pick wave assignment.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-foreground-secondary text-[11px] block">Destination</span>
                <div className="flex items-start space-x-2 mt-0.5">
                  <MapPin className="w-4 h-4 text-foreground-secondary shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-foreground-secondary text-[11px] block">Carrier & Service</span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <Truck className="w-4 h-4 text-primary-600" />
                  <span className="font-semibold text-foreground">
                    {order.carrier.replace(/_/g, ' ')} ({order.shippingMethod.replace(/_/g, ' ')})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
