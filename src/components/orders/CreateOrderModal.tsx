import { useState } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { useUIStore } from '../../store/useUIStore';
import { Order, OrderItem, Channel, OrderPriority } from '../../types/order';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/formatters';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
  const { addOrder } = useOrderStore();
  const { inventory, products, adjustStockQuantity } = useInventoryStore();
  const { addException } = useExceptionStore();
  const { addToast } = useUIStore();

  const [customerName, setCustomerName] = useState('Apex Technologies');
  const [customerCompany, setCustomerCompany] = useState('Apex Global Logistics');
  const [customerTier, setCustomerTier] = useState<'ENTERPRISE_VIP' | 'STRATEGIC' | 'STANDARD'>('ENTERPRISE_VIP');
  const [salesChannel, setSalesChannel] = useState<Channel>('EDI_ENTERPRISE');
  const [carrier, setCarrier] = useState<'FEDEX_PRIORITY' | 'UPS_GROUND' | 'DHL_EXPRESS' | 'FREIGHT_LTL'>('FEDEX_PRIORITY');
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPEDITED' | 'OVERNIGHT_EXPRESS' | 'SAME_DAY'>('SAME_DAY');
  const [priority, setPriority] = useState<OrderPriority>('HIGH');
  const [slaHours, setSlaHours] = useState(4);
  const [notes, setNotes] = useState('Enterprise express fulfillment batch');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Line items state
  const [items, setItems] = useState<
    { sku: string; quantity: number }[]
  >([
    { sku: 'SKU-DKS-003', quantity: 10 },
  ]);

  const availableSkus = products.length > 0 ? products : [
    { sku: 'SKU-DKS-003', name: 'Thunderbolt 4 Docking Station', unitPrice: 199.99, dimensions: { weightGrams: 460, lengthCm: 20, widthCm: 10, heightCm: 5 } },
    { sku: 'SKU-CBL-007', name: 'USB-C to DisplayPort 1.4 Cable', unitPrice: 29.99, dimensions: { weightGrams: 95, lengthCm: 15, widthCm: 10, heightCm: 2 } },
    { sku: 'SKU-MON-001', name: '27-inch 4K UHD IPS Monitor', unitPrice: 349.99, dimensions: { weightGrams: 4800, lengthCm: 60, widthCm: 40, heightCm: 15 } },
    { sku: 'SKU-ADP-012', name: '100W GaN Fast Charger Adapter', unitPrice: 59.99, dimensions: { weightGrams: 180, lengthCm: 10, widthCm: 8, heightCm: 4 } },
  ];

  const handleAddItem = () => {
    const nextSku = availableSkus[items.length % availableSkus.length]?.sku || availableSkus[0]?.sku || 'SKU-DKS-003';
    setItems([...items, { sku: nextSku, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItemSku = (index: number, sku: string) => {
    const updated = [...items];
    updated[index].sku = sku;
    setItems(updated);
  };

  const handleUpdateItemQty = (index: number, quantity: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, quantity);
    setItems(updated);
  };

  // Live Calculations & Feasibility Checking
  const lineItemDetails = items.map((line) => {
    const prod = availableSkus.find((p) => p.sku === line.sku);
    const inv = inventory.find((i) => i.sku === line.sku);
    const availableQty = inv ? inv.quantityAvailable : 0;
    const binId = inv?.location?.binId || 'A-01-01-A';
    const isShortage = line.quantity > availableQty;
    const allocatedQty = Math.min(line.quantity, availableQty);
    const unfulfilledQty = Math.max(0, line.quantity - availableQty);

    return {
      sku: line.sku,
      productName: prod?.name || line.sku,
      unitPrice: prod?.unitPrice || 99.99,
      unitWeightGrams: prod?.dimensions?.weightGrams || 500,
      quantityOrdered: line.quantity,
      availableQty,
      allocatedQty,
      unfulfilledQty,
      isShortage,
      binId,
    };
  });

  const totalUnits = lineItemDetails.reduce((sum, item) => sum + item.quantityOrdered, 0);
  const totalAllocatedUnits = lineItemDetails.reduce((sum, item) => sum + item.allocatedQty, 0);
  const totalValue = lineItemDetails.reduce((sum, item) => sum + item.unitPrice * item.quantityOrdered, 0);
  const totalWeightKg = lineItemDetails.reduce((sum, item) => sum + (item.unitWeightGrams * item.quantityOrdered) / 1000, 0);
  const hasShortage = lineItemDetails.some((item) => item.isShortage);

  // Priority Score estimation
  const calculatedPriorityScore =
    (customerTier === 'ENTERPRISE_VIP' ? 30 : customerTier === 'STRATEGIC' ? 25 : 15) +
    (shippingMethod === 'SAME_DAY' ? 35 : shippingMethod === 'OVERNIGHT_EXPRESS' ? 25 : 10) +
    (totalValue > 1000 ? 20 : 10) +
    (priority === 'CRITICAL' ? 15 : priority === 'HIGH' ? 10 : 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Customer Name is required.');
      return;
    }

    if (!customerCompany.trim()) {
      setErrorMessage('Company Account is required.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Please add at least one line item.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `ORD-${Math.floor(1050 + Math.random() * 900)}`;
      const now = new Date();
      const deadline = new Date(now.getTime() + slaHours * 3600000);

      const orderItems: OrderItem[] = lineItemDetails.map((line, idx) => ({
        id: `item-${orderId}-${idx + 1}`,
        sku: line.sku,
        productName: line.productName,
        unitPrice: line.unitPrice,
        quantityOrdered: line.quantityOrdered,
        quantityAllocated: line.allocatedQty,
        quantityPicked: 0,
        quantityPacked: 0,
        assignedBin: line.binId,
        unitWeightGrams: line.unitWeightGrams,
      }));

      const finalStatus = hasShortage ? 'PARTIALLY_ALLOCATED' : 'ALLOCATED';

      const newOrder: Order = {
        id: orderId,
        externalReference: `PO-${Math.floor(100000 + Math.random() * 900000)}`,
        channel: salesChannel,
        customer: {
          id: `cust-${Date.now()}`,
          name: customerName.trim(),
          company: customerCompany.trim(),
          email: `ops@${customerCompany.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: '+1 (312) 555-0199',
          tier: customerTier,
        },
        shippingAddress: {
          street: '742 Enterprise Parkway, Suite 400',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60607',
          country: 'USA',
          isCommercial: true,
        },
        carrier,
        shippingMethod,
        status: finalStatus,
        priority,
        priorityScore: Math.min(100, calculatedPriorityScore),
        items: orderItems,
        totalValue,
        totalUnits,
        totalWeightKg,
        createdAt: now.toISOString(),
        slaDeadline: deadline.toISOString(),
        slaRisk: slaHours <= 3,
        notes: notes.trim(),
        timeline: [
          {
            status: 'NEW',
            timestamp: now.toISOString(),
            note: 'Manual enterprise order created via Operator Workbench.',
            actor: 'Marcus Vance (Ops Manager)',
          },
          {
            status: finalStatus,
            timestamp: new Date(now.getTime() + 1000).toISOString(),
            note: hasShortage
              ? `Partial allocation (${totalAllocatedUnits}/${totalUnits} units reserved). Shortage exception logged.`
              : `100% allocation verified (${totalUnits}/${totalUnits} units reserved).`,
            actor: 'WAREFLOW Allocation Engine',
          },
        ],
      };

      // 1. Deduct available stock in inventory store for allocated units
      lineItemDetails.forEach((line) => {
        if (line.allocatedQty > 0) {
          adjustStockQuantity(line.binId, line.sku, 0);
        }
      });

      // 2. If shortage occurred, generate an Operational Exception
      if (hasShortage) {
        const shortageItem = lineItemDetails.find((i) => i.isShortage);
        const excId = `EXC-${Math.floor(110 + Math.random() * 890)}`;
        await addException({
          id: excId,
          orderId: newOrder.id,
          sku: shortageItem?.sku,
          type: 'STOCK_SHORTAGE',
          severity: priority === 'CRITICAL' || priority === 'HIGH' ? 'CRITICAL' : 'HIGH',
          status: 'RECOMMENDED',
          title: `Inventory Contention on ${shortageItem?.sku} (${newOrder.id})`,
          description: `Order ${newOrder.id} requires ${shortageItem?.quantityOrdered} units of ${shortageItem?.productName}, but only ${shortageItem?.availableQty} units are available in ${shortageItem?.binId}.`,
          detectedAt: new Date().toISOString(),
          reportedBy: 'Deterministic Allocation Engine',
          rootCauseAnalysis: `Demand spike from enterprise client ${customerName}. Unallocated buffer is 0 units.`,
          recommendedResolutions: [
            {
              id: `res-${excId}-1`,
              actionTitle: `Reallocate from Low-Priority Ground Orders`,
              description: `Transfer ${shortageItem?.unfulfilledQty} units from pending standard orders to protect ${customerTier} SLA.`,
              suggestedActionType: 'REALLOCATE_ALT_BIN',
              impactAssessment: 'Preserves same-day dispatch; prevents $500/hr SLA late penalty.',
              confidenceScore: 94,
              isRecommended: true,
            },
            {
              id: `res-${excId}-2`,
              actionTitle: `Split Shipment & Dispatch Partial`,
              description: `Ship ${shortageItem?.allocatedQty} available units immediately; backorder ${shortageItem?.unfulfilledQty} units.`,
              suggestedActionType: 'SPLIT_ORDER',
              impactAssessment: 'Delivers 70% fulfillment today; secondary parcel costs $14.20.',
              confidenceScore: 82,
              isRecommended: false,
            },
          ],
        });
      }

      await addOrder(newOrder);

      addToast({
        title: 'Order created successfully.',
        description: `${orderId} created for ${customerCompany}. Status: ${finalStatus}.`,
        type: hasShortage ? 'warning' : 'success',
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create order in Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Manual Order"
      description="Inject an enterprise or direct-sales order into the live warehouse fulfillment stream."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Customer & Order Metadata */}
        <div className="space-y-3 p-4 rounded-lg bg-surface-subtle border border-border">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary block">
            1. Customer & Channel Information
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="order-customer-name" className="text-[11px] font-semibold text-foreground block mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="order-customer-name"
                name="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="order-company-account" className="text-[11px] font-semibold text-foreground block mb-1">
                Company Account <span className="text-rose-500">*</span>
              </label>
              <input
                id="order-company-account"
                name="customerCompany"
                type="text"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="order-customer-tier" className="text-[11px] font-semibold text-foreground block mb-1">
                Customer Contract Tier
              </label>
              <select
                id="order-customer-tier"
                name="customerTier"
                value={customerTier}
                onChange={(e) => setCustomerTier(e.target.value as any)}
                className="w-full h-8 px-2 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="STRATEGIC">Strategic Account (+30 Weight)</option>
                <option value="ENTERPRISE_VIP">Enterprise VIP (+25 Weight)</option>
                <option value="STANDARD">Standard Commercial</option>
              </select>
            </div>
            <div>
              <label htmlFor="order-sales-channel" className="text-[11px] font-semibold text-foreground block mb-1">
                Sales Channel
              </label>
              <select
                id="order-sales-channel"
                name="salesChannel"
                value={salesChannel}
                onChange={(e) => setSalesChannel(e.target.value as Channel)}
                className="w-full h-8 px-2 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="EDI_ENTERPRISE">EDI Enterprise Gateway</option>
                <option value="B2B_PORTAL">B2B Wholesale Portal</option>
                <option value="SHOPIFY_STORE">Shopify E-Commerce</option>
                <option value="DIRECT">Direct Sales Executive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping & SLA Urgency */}
        <div className="space-y-3 p-4 rounded-lg bg-surface-subtle border border-border">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary block">
            2. Carrier & SLA Cutoff Constraints
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="order-carrier" className="text-[11px] font-semibold text-foreground block mb-1">Carrier</label>
              <select
                id="order-carrier"
                name="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value as any)}
                className="w-full h-8 px-2 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="FEDEX_PRIORITY">FedEx Priority Air</option>
                <option value="UPS_GROUND">UPS Ground</option>
                <option value="DHL_EXPRESS">DHL Express International</option>
                <option value="FREIGHT_LTL">Freight LTL</option>
              </select>
            </div>
            <div>
              <label htmlFor="order-shipping-speed" className="text-[11px] font-semibold text-foreground block mb-1">Speed Service</label>
              <select
                id="order-shipping-speed"
                name="shippingMethod"
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value as any)}
                className="w-full h-8 px-2 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="SAME_DAY">Same-Day Priority</option>
                <option value="OVERNIGHT_EXPRESS">Overnight Express</option>
                <option value="EXPEDITED">Expedited (2-Day)</option>
                <option value="STANDARD">Standard Ground</option>
              </select>
            </div>
            <div>
              <label htmlFor="order-priority" className="text-[11px] font-semibold text-foreground block mb-1">Priority Override</label>
              <select
                id="order-priority"
                name="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as OrderPriority)}
                className="w-full h-8 px-2 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="CRITICAL">Critical (Top Queue)</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="order-sla-hours" className="text-[11px] font-semibold text-foreground block mb-1">SLA Target Cutoff</label>
              <select
                id="order-sla-hours"
                name="slaHours"
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                className="w-full h-8 px-2 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value={2}>2 Hours (Emergency Cutoff)</option>
                <option value={4}>4 Hours (High Urgency)</option>
                <option value={8}>8 Hours (End of Shift)</option>
                <option value={24}>24 Hours (Standard)</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <label htmlFor="order-notes" className="text-[11px] font-semibold text-foreground block mb-1">Internal Operations Notes</label>
            <input
              id="order-notes"
              name="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
          </div>
        </div>

        {/* Line Items Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
              3. Ordered SKUs & Requested Quantities
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              leftIcon={<Plus className="w-3 h-3" />}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.map((line, idx) => {
              const details = lineItemDetails[idx];
              const skuId = `order-item-sku-${idx}`;
              const qtyId = `order-item-qty-${idx}`;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border bg-white shadow-xs"
                >
                  <div className="flex-1">
                    <label htmlFor={skuId} className="sr-only">
                      Select SKU for line {idx + 1}
                    </label>
                    <select
                      id={skuId}
                      name={`itemSku_${idx}`}
                      value={line.sku}
                      onChange={(e) => handleUpdateItemSku(idx, e.target.value)}
                      className="w-full h-7 px-2 rounded border border-border bg-white text-xs font-mono font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      {availableSkus.map((p) => (
                        <option key={p.sku} value={p.sku}>
                          {p.sku} — {p.name} (${p.unitPrice})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-3 text-[11px] text-foreground-secondary mt-1">
                      <span>Available in Bin {details?.binId}: <strong className="text-foreground">{details?.availableQty} units</strong></span>
                    </div>
                  </div>

                  <div className="w-24">
                    <label htmlFor={qtyId} className="sr-only">
                      Quantity for line {idx + 1}
                    </label>
                    <input
                      id={qtyId}
                      name={`itemQty_${idx}`}
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => handleUpdateItemQty(idx, parseInt(e.target.value) || 1)}
                      className="w-full h-7 px-2 text-center rounded border border-border bg-white text-xs font-mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                      aria-label={`Remove line item ${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Feasibility & Decision Engine Recommendation Banner */}
        {hasShortage ? (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2 font-bold text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4" />
              <span>Partial Allocation Warning & Autonomous Shortage Triage</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Requested demand exceeds physical available inventory ({totalAllocatedUnits} of {totalUnits} units reservable).
            </p>
            <div className="p-2 rounded bg-white/80 border border-rose-200 text-[11px] font-medium text-rose-900">
              <strong>Engine Recommendation:</strong> Reserve {totalAllocatedUnits} units immediately and log high-priority exception to trigger emergency stock reallocation from standard buffer.
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Stock Available for Immediate Allocation</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
              Ready for Wave Picking
            </span>
          </div>
        )}

        {/* Summary Footer KPI */}
        <div className="grid grid-cols-4 gap-3 p-3 rounded-lg bg-surface-subtle border border-border text-center">
          <div>
            <span className="text-[10px] text-foreground-secondary uppercase font-bold block">Total Units</span>
            <span className="font-mono font-bold text-foreground text-sm">{totalUnits}</span>
          </div>
          <div>
            <span className="text-[10px] text-foreground-secondary uppercase font-bold block">Total Value</span>
            <span className="font-mono font-bold text-foreground text-sm">{formatCurrency(totalValue)}</span>
          </div>
          <div>
            <span className="text-[10px] text-foreground-secondary uppercase font-bold block">Weight</span>
            <span className="font-mono font-bold text-foreground text-sm">{totalWeightKg.toFixed(2)} kg</span>
          </div>
          <div>
            <span className="text-[10px] text-foreground-secondary uppercase font-bold block">Priority Score</span>
            <span className="font-mono font-bold text-primary-600 text-sm">{Math.min(100, calculatedPriorityScore)}/100</span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            className="font-semibold shadow-xs"
          >
            Create & Allocate Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
