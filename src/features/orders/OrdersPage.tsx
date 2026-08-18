import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ExternalLink,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { OrderStatus, OrderPriority } from '../../types/order';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/status-badge';
import { PriorityBadge } from '../../components/ui/priority-badge';
import { Tabs } from '../../components/ui/tabs';
import { LoadingState } from '../../components/ui/loading-state';
import { CreateOrderModal } from '../../components/orders/CreateOrderModal';
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

export function OrdersPage() {
  const {
    getFilteredOrders,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    orders,
    isLoading,
    error,
  } = useOrderStore();

  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

  const filteredOrders = getFilteredOrders();

  const statusTabs = [
    { id: 'ALL', label: 'All Orders', count: orders.length },
    { id: 'NEW', label: 'New / Queued', count: orders.filter((o) => o.status === 'NEW').length },
    { id: 'PRIORITIZED', label: 'Prioritized', count: orders.filter((o) => o.status === 'PRIORITIZED').length },
    { id: 'ALLOCATED', label: 'Allocated', count: orders.filter((o) => o.status === 'ALLOCATED').length },
    { id: 'PARTIALLY_ALLOCATED', label: 'Partially Allocated', count: orders.filter((o) => o.status === 'PARTIALLY_ALLOCATED').length },
    { id: 'PICKING', label: 'Picking', count: orders.filter((o) => o.status === 'PICKING').length },
    { id: 'PACKING', label: 'Packing', count: orders.filter((o) => o.status === 'PACKING').length },
    { id: 'READY_TO_DISPATCH', label: 'Ready for Dock', count: orders.filter((o) => o.status === 'READY_TO_DISPATCH').length },
    { id: 'DISPATCHED', label: 'Dispatched', count: orders.filter((o) => o.status === 'DISPATCHED').length },
  ];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Order Operations Workbench"
        description="Monitor multi-channel order ingestion, priority scoring, automated inventory allocation, and fulfillment milestones."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
            {orders.length} Active Records
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOrderModalOpen(true)}
            className="font-semibold shadow-xs"
          >
            Manual Order
          </Button>
        }
      />

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Filter */}
      <Tabs
        tabs={statusTabs}
        activeTab={statusFilter}
        onChange={(id) => setStatusFilter(id as OrderStatus | 'ALL')}
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, customer, SKU..."
            className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-xs shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as OrderPriority | 'ALL')}
            className="h-9 rounded-md border border-border bg-white px-3 text-xs font-medium text-foreground shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Orders Data Table with Loading State */}
      {isLoading ? (
        <LoadingState message="Loading orders..." className="py-16" />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Order ID</TableHead>
                <TableHead>Customer / Channel</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Carrier & SLA</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-foreground-secondary text-xs">
                    No orders match current query criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-bold text-xs">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-800 hover:underline inline-flex items-center gap-1"
                      >
                        {order.id}
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">
                        {order.customer.company || order.customer.name}
                      </div>
                      <div className="text-[11px] text-foreground-secondary">
                        {order.channel.replace(/_/g, ' ')} • {order.customer.tier.replace(/_/g, ' ')}
                      </div>
                    </TableCell>

                    <TableCell>
                      <PriorityBadge priority={order.priority} score={order.priorityScore} />
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={order.status} size="sm" />
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {order.totalUnits}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">
                      {formatCurrency(order.totalValue)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-1.5 text-xs text-foreground">
                        <span className="font-medium">{order.carrier.replace(/_/g, ' ')}</span>
                        {order.slaRisk && (
                          <span className="flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            <AlertCircle className="w-3 h-3 mr-0.5" />
                            Risk
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-foreground-tertiary">
                        Cutoff: {formatDate(order.slaDeadline)}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="xs">
                          Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateOrderModalOpen}
        onClose={() => setIsCreateOrderModalOpen(false)}
      />
    </div>
  );
}
