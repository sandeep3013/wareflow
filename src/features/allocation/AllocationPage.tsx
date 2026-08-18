import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Sparkles, GitMerge } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useUIStore } from '../../store/useUIStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { PriorityBadge } from '../../components/ui/priority-badge';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';

export function AllocationPage() {
  const { orders, updateOrderStatus, reallocateOrderStock } = useOrderStore();
  const { addToast } = useUIStore();

  const queuedOrders = orders.filter((o) => ['NEW', 'PRIORITIZED', 'PARTIALLY_ALLOCATED'].includes(o.status));

  const handleRunBatchAllocation = () => {
    queuedOrders.forEach((o) => {
      if (o.id !== 'ORD-1042') {
        updateOrderStatus(o.id, 'ALLOCATED', 'Batch allocation engine completed bin reservations.');
      }
    });
    addToast({
      title: 'Auto-Allocation Batch Run Finished',
      description: `Optimally reserved stock for ${Math.max(1, queuedOrders.length - 1)} orders. ORD-1042 requires resolution triage.`,
      type: 'success',
    });
  };

  const handleAutoResolveConflict = () => {
    reallocateOrderStock('ORD-1042', [
      { sku: 'SKU-DKS-003', allocated: 10 },
      { sku: 'SKU-CBL-007', allocated: 10 },
    ]);
    updateOrderStatus('ORD-1042', 'ALLOCATED', 'Reallocated 3 units from ORD-1043 to satisfy VIP Same-Day SLA.');
    addToast({
      title: 'Allocation Conflict Resolved',
      description: 'ORD-1042 is now 100% ALLOCATED. Ready for picking wave assignment.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Inventory Allocation Engine"
        description="Deterministic stock reservation workbench. Evaluates pending order demand against physical bins using FIFO, proximity, and priority constraints."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {queuedOrders.length} Queued for Allocation
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={handleRunBatchAllocation}
            className="font-semibold shadow-xs"
          >
            Run Allocation Batch
          </Button>
        }
      />

      {/* Intelligent Allocation Explanation Banner */}
      <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-indigo-600 text-white shrink-0">
            <GitMerge className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-950">Deterministic Allocation Strategy Active</h4>
            <p className="text-indigo-800 text-[11px] mt-0.5">
              Prioritizes high customer tier contracts and immediate carrier cutoff deadlines while minimizing multi-aisle travel distance.
            </p>
          </div>
        </div>

        {queuedOrders.some((o) => o.id === 'ORD-1042' && o.status === 'PARTIALLY_ALLOCATED') && (
          <Button
            variant="danger"
            size="xs"
            leftIcon={<AlertCircle className="w-3.5 h-3.5" />}
            onClick={handleAutoResolveConflict}
            className="shrink-0"
          >
            Resolve ORD-1042 Shortage
          </Button>
        )}
      </div>

      {/* Allocation Queue Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer & Tier</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Required SKUs</TableHead>
              <TableHead>Allocation Feasibility</TableHead>
              <TableHead>Recommended Bin Strategy</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queuedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-foreground-secondary text-xs">
                  All active warehouse orders are currently 100% allocated.
                </TableCell>
              </TableRow>
            ) : (
              queuedOrders.map((order) => {
                const isConflict = order.id === 'ORD-1042' && order.status === 'PARTIALLY_ALLOCATED';

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-bold text-xs">
                      <Link to={`/orders/${order.id}`} className="text-primary-600 hover:underline">
                        {order.id}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">
                        {order.customer.company || order.customer.name}
                      </div>
                      <div className="text-[11px] text-foreground-secondary">{order.customer.tier}</div>
                    </TableCell>

                    <TableCell>
                      <PriorityBadge priority={order.priority} score={order.priorityScore} />
                    </TableCell>

                    <TableCell className="text-xs text-foreground font-mono">
                      {order.items.map((i) => i.sku).join(', ')}
                    </TableCell>

                    <TableCell>
                      {isConflict ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Stock Shortage (7 / 10)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          100% Available
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-foreground-secondary">
                      {isConflict
                        ? 'Requires reallocation from ORD-1043'
                        : 'Direct Single-Bin Pick (Fastest Path)'}
                    </TableCell>

                    <TableCell className="text-right">
                      {isConflict ? (
                        <Link to="/exceptions">
                          <Button variant="danger" size="xs">
                            Resolve
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            updateOrderStatus(order.id, 'ALLOCATED', 'Direct bin allocation confirmed.');
                            addToast({
                              title: 'Order Allocated',
                              description: `${order.id} reserved in pick bins.`,
                              type: 'success',
                            });
                          }}
                        >
                          Allocate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
