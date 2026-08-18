import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Minus,
} from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useUIStore } from '../../store/useUIStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/status-badge';
import { DecisionExplanation } from '../../components/common/DecisionExplanation';
import { forecastStockout } from '../../engines/stockForecastEngine';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { formatNumber, formatDate } from '../../lib/formatters';

export function SkuDetailPage() {
  const { sku } = useParams<{ sku: string }>();
  const { inventory, getProductBySku, adjustStockQuantity } = useInventoryStore();
  const { addToast } = useUIStore();

  const product = getProductBySku(sku || '');
  const matchingBins = inventory.filter((i) => i.sku === sku);

  if (!product && matchingBins.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-lg font-bold text-foreground">SKU Not Found</h2>
        <p className="text-xs text-foreground-secondary">
          No inventory or catalog records found for SKU #{sku}.
        </p>
        <Link to="/inventory">
          <Button variant="outline" size="sm">
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  const primaryItem = matchingBins[0] || {
    sku: sku || 'SKU-UNKNOWN',
    productName: product?.name || 'Item',
    category: product?.category || 'General',
    dailyVelocity: 14.5,
    quantityAvailable: 10,
    quantityOnHand: 20,
    reorderPoint: 25,
  };

  const forecast = forecastStockout(primaryItem as any, 7);

  const totalOnHand = matchingBins.reduce((sum, b) => sum + b.quantityOnHand, 0);
  const totalAllocated = matchingBins.reduce((sum, b) => sum + b.quantityAllocated, 0);
  const totalAvailable = matchingBins.reduce((sum, b) => sum + b.quantityAvailable, 0);
  const totalDamaged = matchingBins.reduce((sum, b) => sum + b.quantityDamaged, 0);

  const handleAdjust = (binId: string, delta: number) => {
    if (!sku) return;
    adjustStockQuantity(binId, sku, delta);
    addToast({
      title: 'Physical Cycle Count Adjusted',
      description: `${delta > 0 ? '+' : ''}${delta} units applied to bin ${binId}. Telemetry updated.`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link
          to="/inventory"
          className="p-1.5 rounded-md border border-border bg-white text-foreground-secondary hover:bg-surface-subtle transition-colors"
          aria-label="Back to inventory list"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold font-mono text-foreground">{sku}</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {product?.category || matchingBins[0]?.category}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {product?.name || matchingBins[0]?.productName}
          </p>
        </div>
      </div>

      {/* Top SKU KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 shadow-subtle">
          <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider">
            Total On-Hand
          </span>
          <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{formatNumber(totalOnHand)}</div>
          <span className="text-[11px] text-foreground-tertiary">Across active bins</span>
        </Card>

        <Card className="p-4 shadow-subtle">
          <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider">
            Allocated to Orders
          </span>
          <div className="text-2xl font-bold text-primary-600 mt-1 tabular-nums">{formatNumber(totalAllocated)}</div>
          <span className="text-[11px] text-foreground-tertiary">Reserved in pick waves</span>
        </Card>

        <Card className="p-4 shadow-subtle">
          <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider">
            Available to Fulfill
          </span>
          <div className={`text-2xl font-bold mt-1 tabular-nums ${totalAvailable === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {formatNumber(totalAvailable)}
          </div>
          <span className="text-[11px] text-foreground-tertiary">Unreserved stock</span>
        </Card>

        <Card className="p-4 shadow-subtle">
          <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider">
            Damaged / Quarantined
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1 tabular-nums">{formatNumber(totalDamaged)}</div>
          <span className="text-[11px] text-foreground-tertiary">Zone QRT inspection</span>
        </Card>
      </div>

      {/* Stock Forecast Explanation Banner */}
      <DecisionExplanation
        score={forecast.stockoutRiskLevel === 'CRITICAL' ? 95 : forecast.stockoutRiskLevel === 'MEDIUM' ? 78 : 25}
        engineName="WAREFLOW Stock Forecast Engine"
        factors={[
          { label: 'Daily Pick Velocity', weight: 35, rationale: `${primaryItem.dailyVelocity || 12.4} units/day moving average` },
          { label: 'Days of Supply Buffer', weight: 30, rationale: `${forecast.daysOfSupplyRemaining} days until depletion` },
          { label: 'Supplier Lead Time', weight: 20, rationale: '7 calendar days standard replenishment' },
          { label: 'Reorder Point Variance', weight: 15, rationale: `Threshold: ${primaryItem.reorderPoint || 25} units` },
        ]}
        summary={forecast.rationale}
      />

      {/* Bin Locations and Stock Adjustments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Physical Bin Locations ({matchingBins.length})</CardTitle>
            <p className="text-xs text-foreground-secondary">
              Real-time balance per aisle, rack, and shelf position
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TableContainer className="border-0 shadow-none">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bin ID</TableHead>
                  <TableHead>Zone / Aisle</TableHead>
                  <TableHead className="text-right">On Hand</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Counted</TableHead>
                  <TableHead className="text-right">Cycle Count Adjust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchingBins.map((bin) => (
                  <TableRow key={bin.id}>
                    <TableCell className="font-mono font-bold text-xs">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-600" />
                        {bin.location.binId}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs">
                      Zone {bin.location.zone} • Aisle {bin.location.aisle} • Rack {bin.location.rack}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs font-bold tabular-nums">
                      {bin.quantityOnHand}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs tabular-nums text-foreground-secondary">
                      {bin.quantityAllocated}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs font-bold tabular-nums">
                      <span className={bin.quantityAvailable === 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {bin.quantityAvailable}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={bin.status} size="sm" />
                    </TableCell>

                    <TableCell className="text-xs text-foreground-secondary font-mono">
                      {formatDate(bin.lastCountedAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="inline-flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleAdjust(bin.location.binId, -1)}
                          aria-label="Decrease stock by 1"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleAdjust(bin.location.binId, 1)}
                          aria-label="Increase stock by 1"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
