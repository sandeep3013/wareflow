import { useState } from 'react';
import {
  X,
  MapPin,
  Plus,
  Minus,
  ArrowRightLeft,
  AlertTriangle,
  RotateCcw,
  Boxes,
} from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { useUIStore } from '../../store/useUIStore';
import { InventoryItem } from '../../types/inventory';
import { StatusBadge } from '../ui/status-badge';
import { Button } from '../ui/button';
import { formatNumber } from '../../lib/formatters';

interface InventoryDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export function InventoryDetailDrawer({ isOpen, onClose, item }: InventoryDetailDrawerProps) {
  const { adjustStockQuantity, transferStock, markDamaged } = useInventoryStore();
  const { addException } = useExceptionStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'details' | 'adjust' | 'transfer' | 'damage'>('details');
  const [adjustDelta, setAdjustDelta] = useState(5);
  const [adjustReason, setAdjustReason] = useState('Cycle count audit');
  const [transferQty, setTransferQty] = useState(10);
  const [targetBin, setTargetBin] = useState('B-02-01-A');
  const [damageQty, setDamageQty] = useState(2);
  const [damageReason, setDamageReason] = useState('Water damage from roof condensation leak');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !item) return null;

  const handleApplyAdjustment = async (delta: number) => {
    setIsProcessing(true);
    try {
      await adjustStockQuantity(item.location.binId, item.sku, delta);
      addToast({
        title: 'Physical Inventory Adjusted & Saved',
        description: `${delta > 0 ? '+' : ''}${delta} units applied to ${item.sku} in Bin ${item.location.binId}. (${adjustReason})`,
        type: 'info',
      });
      setActiveTab('details');
    } catch (err: any) {
      addToast({
        title: 'Adjustment Failed',
        description: err.message || 'Failed to update stock quantity in cloud database.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyTransfer = async () => {
    if (transferQty > item.quantityAvailable) {
      addToast({ title: 'Transfer Failed', description: `Requested ${transferQty} exceeds available ${item.quantityAvailable} units.`, type: 'error' });
      return;
    }
    setIsProcessing(true);
    try {
      await transferStock(item.sku, item.location.binId, targetBin, transferQty);
      addToast({
        title: 'Stock Inter-Bin Transfer Complete',
        description: `Transferred ${transferQty} units of ${item.sku} from ${item.location.binId} to ${targetBin}.`,
        type: 'success',
      });
      setActiveTab('details');
    } catch (err: any) {
      addToast({
        title: 'Transfer Failed',
        description: err.message || 'Failed to record inter-bin transfer in cloud database.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyDamage = async () => {
    if (damageQty > item.quantityAvailable) {
      addToast({ title: 'Operation Failed', description: `Cannot quarantine more than available ${item.quantityAvailable} units.`, type: 'error' });
      return;
    }
    setIsProcessing(true);
    try {
      await markDamaged(item.location.binId, item.sku, damageQty);
      
      // Log exception for damage triage
      const excId = `EXC-DMG-${Math.floor(100 + Math.random() * 900)}`;
      await addException({
        id: excId,
        sku: item.sku,
        type: 'DAMAGED_ITEM',
        severity: 'HIGH',
        status: 'OPEN',
        title: `Damaged Stock Quarantined in ${item.location.binId}`,
        description: `${damageQty} units of ${item.productName} marked damaged. Rationale: ${damageReason}.`,
        detectedAt: new Date().toISOString(),
        reportedBy: 'Physical Floor Auditor',
        recommendedResolutions: [
          {
            id: `res-${excId}-1`,
            actionTitle: 'Write-off and Quarantine to Zone QRT',
            description: 'Move damaged goods to scrap holding area and file vendor RMA claim.',
            suggestedActionType: 'REALLOCATE_ALT_BIN',
            impactAssessment: 'Updates inventory health and triggers replenishment if stock drops below buffer.',
            confidenceScore: 95,
            isRecommended: true,
          },
        ],
      });

      addToast({
        title: 'Stock Quarantined & Exception Created',
        description: `${damageQty} units of ${item.sku} marked damaged. Exception #${excId} logged for supervisor triage.`,
        type: 'warning',
      });
      setActiveTab('details');
    } catch (err: any) {
      addToast({
        title: 'Operation Error',
        description: err.message || 'Failed to mark damaged stock in cloud database.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateReplenishment = () => {
    addToast({
      title: 'Purchase Order Triggered',
      description: `Replenishment PO #PO-REQ-${Math.floor(1000 + Math.random() * 9000)} generated for 100 units from vendor.`,
      type: 'success',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-modal flex flex-col border-l border-border animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-[#F8FAFC]">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded">
              {item.sku}
            </span>
            <StatusBadge status={item.status} size="sm" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b border-border bg-white px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-primary-600 text-primary-700 font-bold'
                : 'border-transparent text-foreground-secondary hover:text-foreground'
            }`}
          >
            Stock Telemetry
          </button>
          <button
            onClick={() => setActiveTab('adjust')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'adjust'
                ? 'border-primary-600 text-primary-700 font-bold'
                : 'border-transparent text-foreground-secondary hover:text-foreground'
            }`}
          >
            Cycle Count
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'transfer'
                ? 'border-primary-600 text-primary-700 font-bold'
                : 'border-transparent text-foreground-secondary hover:text-foreground'
            }`}
          >
            Transfer Bin
          </button>
          <button
            onClick={() => setActiveTab('damage')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'damage'
                ? 'border-primary-600 text-primary-700 font-bold'
                : 'border-transparent text-foreground-secondary hover:text-foreground'
            }`}
          >
            Mark Damaged
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {activeTab === 'details' && (
            <>
              {/* Product Title */}
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground">{item.productName}</h2>
                <div className="text-xs text-foreground-secondary flex items-center gap-2">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span className="font-mono">Bin: {item.location.binId}</span>
                </div>
              </div>

              {/* Stock KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="text-[10px] text-foreground-secondary uppercase font-bold block">On Hand</span>
                  <span className="text-lg font-bold text-foreground font-mono">{formatNumber(item.quantityOnHand)}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="text-[10px] text-foreground-secondary uppercase font-bold block">Allocated</span>
                  <span className="text-lg font-bold text-primary-600 font-mono">{formatNumber(item.quantityAllocated)}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="text-[10px] text-foreground-secondary uppercase font-bold block">Available</span>
                  <span className={`text-lg font-bold font-mono ${item.quantityAvailable === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {formatNumber(item.quantityAvailable)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-border">
                  <span className="text-[10px] text-foreground-secondary uppercase font-bold block">Damaged</span>
                  <span className="text-lg font-bold text-rose-600 font-mono">{formatNumber(item.quantityDamaged)}</span>
                </div>
              </div>

              {/* Location & Velocity Metrics */}
              <div className="p-4 rounded-lg bg-white border border-border space-y-3 shadow-subtle">
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className="font-bold text-foreground">Location & Storage Buffer</span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface-subtle border border-border inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-600" />
                    Zone {item.location.zone} · Aisle {item.location.aisle} · Bin {item.location.binId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-foreground-secondary block">Reorder Point Threshold:</span>
                    <strong className="text-foreground font-mono">{item.reorderPoint} units</strong>
                  </div>
                  <div>
                    <span className="text-foreground-secondary block">Estimated Days of Supply:</span>
                    <strong className="text-foreground font-mono">{item.daysOfSupplyRemaining} days</strong>
                  </div>
                  <div>
                    <span className="text-foreground-secondary block">Daily Pick Velocity:</span>
                    <strong className="text-foreground font-mono">{item.dailyVelocity} units/day</strong>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-200 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-900 block">
                  Autonomous Inventory Actions
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={() => setActiveTab('adjust')}
                  >
                    Adjust Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                    onClick={() => setActiveTab('transfer')}
                  >
                    Transfer Bin
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                    onClick={() => setActiveTab('damage')}
                  >
                    Report Damaged
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    leftIcon={<Boxes className="w-3.5 h-3.5" />}
                    onClick={handleCreateReplenishment}
                  >
                    PO Replenish
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'adjust' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-border">
                <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
                  Cycle Count Adjustment
                </span>
                <p className="text-xs text-foreground-secondary mt-1">
                  Adjust physically verified inventory count for Bin <strong className="font-mono text-foreground">{item.location.binId}</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-foreground block">Adjustment Quantity</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustDelta((prev) => prev - 1)}
                    disabled={isProcessing}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                    className="w-24 h-9 text-center rounded border border-border bg-white text-sm font-mono font-bold"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustDelta((prev) => prev + 1)}
                    disabled={isProcessing}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-foreground block">Reason for Adjustment</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('details')} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" isLoading={isProcessing} onClick={() => handleApplyAdjustment(adjustDelta)}>
                  Apply Count Adjustment
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-border">
                <span className="text-[10px] uppercase font-bold text-foreground-secondary tracking-wider block">
                  Inter-Bin Stock Transfer
                </span>
                <p className="text-xs text-foreground-secondary mt-1">
                  Move inventory from <strong className="font-mono text-foreground">{item.location.binId}</strong> to another location.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-foreground block">Transfer Quantity (Max: {item.quantityAvailable})</label>
                <input
                  type="number"
                  min={1}
                  max={item.quantityAvailable}
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                  className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-foreground block">Destination Bin ID</label>
                <input
                  type="text"
                  value={targetBin}
                  onChange={(e) => setTargetBin(e.target.value.toUpperCase())}
                  placeholder="e.g. B-02-01-A"
                  className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('details')} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" isLoading={isProcessing} onClick={handleApplyTransfer}>
                  Confirm Bin Transfer
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'damage' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Mark Damaged & Quarantine</span>
                </div>
                <p className="text-[11px] mt-1 leading-relaxed">
                  Quarantining stock automatically deducts available inventory and generates an Operational Exception for warehouse supervisor triage.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-foreground block">Damaged Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={item.quantityAvailable}
                  value={damageQty}
                  onChange={(e) => setDamageQty(parseInt(e.target.value) || 1)}
                  className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-foreground block">Damage Rationale / Root Cause</label>
                <textarea
                  value={damageReason}
                  onChange={(e) => setDamageReason(e.target.value)}
                  className="w-full h-16 p-2 rounded border border-border bg-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('details')} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" isLoading={isProcessing} onClick={handleApplyDamage}>
                  Quarantine Damaged Stock
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
