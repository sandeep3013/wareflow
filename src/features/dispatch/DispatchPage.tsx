import { Link } from 'react-router-dom';
import { Truck, CheckCircle2, FileText, Clock, Building2 } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useUIStore } from '../../store/useUIStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { formatDate } from '../../lib/formatters';

export function DispatchPage() {
  const { orders, updateOrderStatus } = useOrderStore();
  const { addToast } = useUIStore();

  const stagedOrders = orders.filter((o) => o.status === 'READY_TO_DISPATCH');

  const handleDispatchOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'DISPATCHED', 'Scanned onto carrier linehaul truck; driver electronic BOL signed.');
    addToast({
      title: 'Shipment Dispatched & BOL Signed',
      description: `${orderId} signed over to FedEx carrier driver. Tracking activated.`,
      type: 'success',
    });
  };

  const handleDispatchAll = () => {
    stagedOrders.forEach((o) => {
      updateOrderStatus(o.id, 'DISPATCHED', 'Carrier master manifest batch signoff.');
    });
    addToast({
      title: 'Batch Dispatch Confirmed',
      description: `All ${stagedOrders.length} staged shipments marked DISPATCHED. Electronic carrier manifest transmitted.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Outbound Carrier Dispatch & Staging"
        description="Dock bay staging, electronic Bill of Lading (eBOL) generation, flight cutoff timers, and automated EDI carrier manifest transmission."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {stagedOrders.length} Ready for Loading
          </span>
        }
        actions={
          stagedOrders.length > 0 ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={handleDispatchAll}
              className="font-semibold shadow-xs"
            >
              Sign Carrier Manifest ({stagedOrders.length})
            </Button>
          ) : undefined
        }
      />

      {/* Dock Staging Bays Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white border border-border shadow-subtle flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
              Dock 03 · Bay B (FedEx Air)
            </span>
            <span className="font-bold text-foreground text-sm">Cutoff: 14:00 CST</span>
            <span className="text-[11px] text-emerald-600 font-semibold block">Driver Staged (Truck #982)</span>
          </div>
          <div className="p-2 rounded bg-indigo-50 text-indigo-700">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-border shadow-subtle flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
              Dock 02 · Bay A (UPS Ground)
            </span>
            <span className="font-bold text-foreground text-sm">Cutoff: 16:30 CST</span>
            <span className="text-[11px] text-foreground-tertiary block">Trailer Loading in progress</span>
          </div>
          <div className="p-2 rounded bg-blue-50 text-blue-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-border shadow-subtle flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
              Dock 01 · Bay C (Freight LTL)
            </span>
            <span className="font-bold text-foreground text-sm">Cutoff: 18:00 CST</span>
            <span className="text-[11px] text-foreground-tertiary block">Pallet Wrapping Complete</span>
          </div>
          <div className="p-2 rounded bg-purple-50 text-purple-700">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Destination & Customer</TableHead>
              <TableHead>Carrier & Staging Bay</TableHead>
              <TableHead>Scheduled Cutoff</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stagedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-foreground-secondary text-xs">
                  All staged shipments have departed on schedule.
                </TableCell>
              </TableRow>
            ) : (
              stagedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-bold text-xs">
                    <Link to={`/orders/${order.id}`} className="text-primary-600 hover:underline">
                      {order.id}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold text-xs text-foreground">
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </div>
                    <div className="text-[11px] text-foreground-secondary">
                      {order.customer.company || order.customer.name}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-1.5 text-xs font-medium text-foreground">
                      <Truck className="w-3.5 h-3.5 text-primary-600" />
                      <span>{order.carrier.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="text-[10px] font-mono text-foreground-tertiary">
                      Staging Dock 03 • Bay B
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-foreground font-medium">
                    {formatDate(order.slaDeadline)}
                  </TableCell>

                  <TableCell className="text-right font-mono text-xs tabular-nums font-bold">
                    {order.totalWeightKg.toFixed(2)} kg
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="xs"
                      leftIcon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      onClick={() => handleDispatchOrder(order.id)}
                    >
                      Confirm Departure
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
