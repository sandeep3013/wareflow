import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Box, Scale, QrCode } from 'lucide-react';
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

export function PackingPage() {
  const { orders, updateOrderStatus } = useOrderStore();
  const { addToast } = useUIStore();

  const packingOrders = orders.filter((o) => ['PACKING', 'QUALITY_CHECK'].includes(o.status));

  const handleVerifyAndPack = (orderId: string) => {
    updateOrderStatus(orderId, 'READY_TO_DISPATCH', 'Weight verified (±0.02kg), box sealed, shipping label affixed, moved to Dock 03');
    addToast({
      title: 'Carton Sealed & Shipping Label Affixed',
      description: `${orderId} passed QA scale verification and staged at Dock 03 Bay B.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Packing Stations & Quality Verification"
        description="High-precision digital scales, automated box sizing algorithms, barcode scan verification, and carrier compliant thermal label generation."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
            {packingOrders.length} Parcels at Station
          </span>
        }
      />

      {/* Station Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white border border-border shadow-subtle flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
              Active Pack Station
            </span>
            <span className="font-bold text-foreground text-sm">Station P1 (Automated)</span>
            <span className="text-[11px] text-foreground-tertiary block">Packer: Jordan Miller</span>
          </div>
          <div className="p-2 rounded bg-indigo-50 text-indigo-700">
            <Box className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-border shadow-subtle flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
              Scale Calibration
            </span>
            <span className="font-bold text-emerald-700 text-sm">Certified (±0.01kg)</span>
            <span className="text-[11px] text-foreground-tertiary block">Next calibration: in 24d</span>
          </div>
          <div className="p-2 rounded bg-emerald-50 text-emerald-700">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-border shadow-subtle flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
              Thermal Label Printer
            </span>
            <span className="font-bold text-foreground text-sm">Online (Zebra ZT411)</span>
            <span className="text-[11px] text-foreground-tertiary block">4x6 Carrier Labels</span>
          </div>
          <div className="p-2 rounded bg-blue-50 text-blue-700">
            <QrCode className="w-5 h-5" />
          </div>
        </div>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Station / Operator</TableHead>
              <TableHead>Box Sizing</TableHead>
              <TableHead className="text-right">Expected Weight</TableHead>
              <TableHead>QA Verification</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packingOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-foreground-secondary text-xs">
                  No orders currently awaiting packing or verification.
                </TableCell>
              </TableRow>
            ) : (
              packingOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-bold text-xs">
                    <Link to={`/orders/${order.id}`} className="text-primary-600 hover:underline">
                      {order.id}
                    </Link>
                    <div className="text-[11px] text-foreground-secondary">
                      {order.items.length} SKUs • Carrier: {order.carrier.replace(/_/g, ' ')}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold text-xs text-foreground">
                      Station P1
                    </div>
                    <div className="text-[11px] text-foreground-secondary">Jordan Miller</div>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-subtle border border-border">
                      {order.totalWeightKg > 5 ? 'Box Large (BX-03)' : 'Box Medium (BX-02)'}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-mono text-xs tabular-nums font-bold">
                    {order.totalWeightKg.toFixed(2)} kg
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Scale Verified (±0.02kg)
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="primary"
                      size="xs"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => handleVerifyAndPack(order.id)}
                      className="font-semibold shadow-xs"
                    >
                      Affix Label & Seal
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
