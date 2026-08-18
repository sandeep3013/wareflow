import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Play, CheckCircle2, Navigation } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useUIStore } from '../../store/useUIStore';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { WarehouseFloorMap } from '../../components/warehouse/WarehouseFloorMap';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';

export function PickingPage() {
  const { orders, updateOrderStatus } = useOrderStore();
  const { addToast } = useUIStore();

  const [selectedWaveId, setSelectedWaveId] = useState<string>('ORD-1042');

  const pickingOrders = orders.filter((o) => ['ALLOCATED', 'PARTIALLY_ALLOCATED', 'PICKING'].includes(o.status));

  const handleStartPick = (orderId: string) => {
    updateOrderStatus(orderId, 'PICKING', 'Picker started optimized wave route');
    addToast({
      title: 'Pick Task Initiated',
      description: `Dispatched serpentine route for ${orderId} to floor picker Darius Thorne (P-07).`,
      type: 'info',
    });
  };

  const handleCompletePick = (orderId: string) => {
    updateOrderStatus(orderId, 'PACKING', 'Pick completed. Tote sent to Packing Station P1');
    addToast({
      title: 'Wave Verified & Pick Completed',
      description: `Order ${orderId} moved to Packing line for quality weigh-in.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Wave & Batch Picking Operations"
        description="Autonomous aisle routing algorithms, serpentine travel minimization, tote barcode verification, and multi-picker task orchestration."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {pickingOrders.length} Active Pick Waves
          </span>
        }
      />

      {/* WAREHOUSE FLOOR MAP & OPTIMIZED SERPENTINE ROUTING */}
      <WarehouseFloorMap
        activeRouteBins={['A-03', 'B-04', 'C-02']}
        currentPicker={{ id: 'P-07', name: 'Darius Thorne', currentBin: 'A-03' }}
      />

      {/* ACTIVE PICK WAVES TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
              Active Pick Queue
            </h3>
            <p className="text-xs text-foreground-secondary">
              Orders allocated to floor totes with serpentine sequence ordering.
            </p>
          </div>
          <span className="text-xs font-mono text-foreground-secondary">
            Avg Pick Time: <strong>2.8 mins/order</strong>
          </span>
        </div>

        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order / Wave</TableHead>
                <TableHead>Primary Zone</TableHead>
                <TableHead>Assigned Picker</TableHead>
                <TableHead>Wave Progress</TableHead>
                <TableHead>Optimized Sequence</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickingOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-foreground-secondary text-xs">
                    No active picking waves currently pending in queue.
                  </TableCell>
                </TableRow>
              ) : (
                pickingOrders.map((order) => {
                  const totalItems = order.items.reduce((sum, i) => sum + i.quantityOrdered, 0);
                  const pickedItems = order.items.reduce((sum, i) => sum + (i.quantityPicked || (order.status === 'PICKING' ? Math.floor(i.quantityOrdered / 2) : 0)), 0);
                  const progressPct = order.status === 'PICKING' ? 65 : 0;

                  return (
                    <TableRow
                      key={order.id}
                      onClick={() => setSelectedWaveId(order.id)}
                      className={order.id === selectedWaveId ? 'bg-indigo-50/30' : undefined}
                    >
                      <TableCell className="font-mono font-bold text-xs">
                        <Link to={`/orders/${order.id}`} className="text-primary-600 hover:underline">
                          {order.id}
                        </Link>
                        <div className="text-[11px] text-foreground-secondary">
                          {order.priority} Priority • {order.items.length} line items
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-subtle border border-border">
                          {order.items[0]?.assignedBin ? order.items[0].assignedBin.split('-')[0] : 'Zone A'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2 text-xs">
                          <User className="w-3.5 h-3.5 text-foreground-tertiary" />
                          <span className="font-medium text-foreground">
                            {order.assignedPickerId ? 'Darius Thorne (P-07)' : 'Elena Rostova (P-04)'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="w-48">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-foreground-secondary">{pickedItems} / {totalItems} units</span>
                            <span className="font-bold text-foreground">{progressPct}%</span>
                          </div>
                          <Progress value={progressPct} size="sm" variant={progressPct > 50 ? 'success' : 'primary'} />
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-foreground-secondary">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded border border-indigo-100">
                          <Navigation className="w-3 h-3 text-indigo-600" />
                          {order.items.map((i) => i.assignedBin || 'A-01-01').join(' → ')}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        {order.status === 'ALLOCATED' || order.status === 'PARTIALLY_ALLOCATED' ? (
                          <Button
                            variant="primary"
                            size="xs"
                            leftIcon={<Play className="w-3 h-3" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartPick(order.id);
                            }}
                          >
                            Start Route
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            size="xs"
                            leftIcon={<CheckCircle2 className="w-3 h-3" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompletePick(order.id);
                            }}
                          >
                            Complete Pick
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
    </div>
  );
}
