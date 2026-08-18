import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ExternalLink,
  MapPin,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { InventoryStatus, InventoryItem } from '../../types/inventory';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/ui/status-badge';
import { Tabs } from '../../components/ui/tabs';
import { LoadingState } from '../../components/ui/loading-state';
import { AddProductModal } from '../../components/inventory/AddProductModal';
import { InventoryDetailDrawer } from '../../components/inventory/InventoryDetailDrawer';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { formatNumber } from '../../lib/formatters';

export function InventoryPage() {
  const {
    getFilteredInventory,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    zoneFilter,
    setZoneFilter,
    inventory,
    isLoading,
    error,
  } = useInventoryStore();

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<InventoryItem | null>(null);

  const filteredItems = getFilteredInventory();

  const statusTabs = [
    { id: 'ALL', label: 'All Inventory', count: inventory.length },
    { id: 'HEALTHY', label: 'Healthy Stock', count: inventory.filter((i) => i.status === 'HEALTHY').length },
    { id: 'LOW', label: 'Low Reorder Level', count: inventory.filter((i) => i.status === 'LOW').length },
    { id: 'CRITICAL', label: 'Critical Buffer', count: inventory.filter((i) => i.status === 'CRITICAL').length },
    { id: 'OUT_OF_STOCK', label: 'Stockout', count: inventory.filter((i) => i.status === 'OUT_OF_STOCK').length },
  ];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Inventory & Stock Health"
        description="Monitor physical bin locations, real-time allocations, reorder point thresholds, and supply depletion velocity."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {inventory.length} Stock Records
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddProductModalOpen(true)}
            className="font-semibold shadow-xs"
          >
            Add Product
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

      {/* Status Filter Tabs */}
      <Tabs
        tabs={statusTabs}
        activeTab={statusFilter}
        onChange={(id) => setStatusFilter(id as InventoryStatus | 'ALL')}
      />

      {/* Search and Zone Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, product title, or bin location..."
            className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-xs shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-white px-3 text-xs font-medium text-foreground shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="ALL">All Warehouse Zones</option>
            <option value="A">Zone A (Fast-Pick Electronics)</option>
            <option value="B">Zone B (Heavy Displays)</option>
            <option value="C">Zone C (Cables & Hubs)</option>
            <option value="D">Zone D (Audio & High-Value)</option>
          </select>
        </div>
      </div>

      {/* Inventory Records Table with Loading State */}
      {isLoading ? (
        <LoadingState message="Loading inventory..." className="py-16" />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">SKU</TableHead>
                <TableHead>Product Description</TableHead>
                <TableHead>Bin Location</TableHead>
                <TableHead className="text-right">On Hand</TableHead>
                <TableHead className="text-right">Allocated</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead>Health Status</TableHead>
                <TableHead className="text-right">Days of Supply</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-foreground-secondary text-xs">
                    No inventory items found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-bold text-xs">
                      <button
                        onClick={() => setSelectedDrawerItem(item)}
                        className="text-primary-600 hover:text-primary-800 hover:underline inline-flex items-center gap-1 font-bold text-left"
                      >
                        {item.sku}
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-foreground truncate max-w-xs">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-foreground-secondary">
                        {item.category} • Reorder at: {item.reorderPoint}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-subtle border border-border inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-foreground-tertiary" />
                        {item.location.binId}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs tabular-nums font-semibold">
                      {formatNumber(item.quantityOnHand)}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs tabular-nums text-foreground-secondary">
                      {formatNumber(item.quantityAllocated)}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs tabular-nums font-bold">
                      <span
                        className={
                          item.quantityAvailable === 0
                            ? 'text-rose-600'
                            : item.quantityAvailable <= 10
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                        }
                      >
                        {formatNumber(item.quantityAvailable)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={item.status} size="sm" />
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      <span
                        className={
                          item.daysOfSupplyRemaining < 1
                            ? 'text-rose-600 font-bold'
                            : 'text-foreground'
                        }
                      >
                        {item.daysOfSupplyRemaining}d
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedDrawerItem(item)}
                        >
                          Actions
                        </Button>
                        <Link to={`/inventory/${item.sku}`}>
                          <Button variant="ghost" size="xs">
                            Audit
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />

      {/* Inventory SKU Quick Action Drawer */}
      <InventoryDetailDrawer
        isOpen={!!selectedDrawerItem}
        onClose={() => setSelectedDrawerItem(null)}
        item={selectedDrawerItem}
      />
    </div>
  );
}
