import { useState } from 'react';
import {
  Plus,
  Tag,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useUIStore } from '../../store/useUIStore';
import { Product, ProductCategory } from '../../types/product';
import { InventoryItem, InventoryStatus } from '../../types/inventory';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const { inventory, addProduct } = useInventoryStore();
  const { addToast } = useUIStore();

  const [sku, setSku] = useState('SKU-MON-008');
  const [productName, setProductName] = useState('32-inch 4K HDR USB-C Creator Display');
  const [description, setDescription] = useState('Professional color-accurate IPS monitor with 90W power delivery.');
  const [category, setCategory] = useState<ProductCategory>('Monitors & Displays');
  const [supplier, setSupplier] = useState('UltraView Display Corp');

  const [zone, setZone] = useState('B');
  const [aisle, setAisle] = useState('05');
  const [rack, setRack] = useState('02');
  const [shelf, setShelf] = useState('A');
  const [quantityOnHand, setQuantityOnHand] = useState(150);
  const [reorderPoint, setReorderPoint] = useState(40);
  const [unitCost, setUnitCost] = useState(280);
  const [unitPrice, setUnitPrice] = useState(449.99);
  const [unitWeightGrams, setUnitWeightGrams] = useState(6200);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const binId = `${zone}-${aisle}-${rack}-${shelf}`;

  // Live Calculations & Validation
  const isSkuTakenLocal = Boolean(
    sku.trim() &&
    inventory.some((item) => item.sku.toLowerCase() === sku.trim().toLowerCase())
  );
  const quantityAllocated = 0;
  const quantityAvailable = Math.max(0, quantityOnHand - quantityAllocated);
  const estimatedDailyVelocity = 12.5;
  const daysOfSupply = quantityOnHand > 0 ? (quantityOnHand / estimatedDailyVelocity).toFixed(1) : '0';

  let reorderStatus: InventoryStatus = 'HEALTHY';
  if (quantityOnHand === 0) reorderStatus = 'OUT_OF_STOCK';
  else if (quantityOnHand <= reorderPoint / 2) reorderStatus = 'CRITICAL';
  else if (quantityOnHand <= reorderPoint) reorderStatus = 'LOW';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanSku = (sku.trim() || `SKU-PROD-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
    const cleanName = productName.trim();

    if (!cleanSku) {
      setErrorMessage('SKU is required.');
      return;
    }

    if (!cleanName) {
      setErrorMessage('Product Title is required.');
      return;
    }

    if (!category) {
      setErrorMessage('Category is required.');
      return;
    }

    if (quantityOnHand < 0 || isNaN(quantityOnHand)) {
      setErrorMessage('Initial On-Hand Quantity must be a valid non-negative number.');
      return;
    }

    if (reorderPoint < 0 || isNaN(reorderPoint)) {
      setErrorMessage('Reorder Point must be a valid non-negative number.');
      return;
    }

    if (unitCost < 0 || isNaN(unitCost)) {
      setErrorMessage('Unit Cost must be a valid number.');
      return;
    }

    if (unitPrice < 0 || isNaN(unitPrice)) {
      setErrorMessage('Unit Price must be a valid number.');
      return;
    }

    if (isSkuTakenLocal) {
      setErrorMessage('SKU already exists. Please use a unique SKU.');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();

      const newProduct: Product = {
        sku: cleanSku,
        name: cleanName,
        description: description.trim(),
        category,
        unitPrice,
        costPrice: unitCost,
        dimensions: { lengthCm: 60, widthCm: 40, heightCm: 15, weightGrams: unitWeightGrams },
        barcode: `84920${Math.floor(100000 + Math.random() * 900000)}`,
        reorderPoint,
        idealStockLevel: reorderPoint * 3,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80',
        leadTimeDays: 7,
        createdAt: now,
      };

      const newInventoryItem: InventoryItem = {
        id: `inv-${cleanSku}-${binId}-${Date.now()}`,
        sku: cleanSku,
        productName: cleanName,
        category,
        location: {
          zone,
          aisle,
          rack,
          shelf,
          binId,
        },
        quantityOnHand,
        quantityAllocated: 0,
        quantityReserved: 0,
        quantityAvailable,
        quantityDamaged: 0,
        reorderPoint,
        status: reorderStatus,
        dailyVelocity: estimatedDailyVelocity,
        daysOfSupplyRemaining: parseFloat(daysOfSupply),
        lastCountedAt: now,
      };

      await addProduct(newProduct, newInventoryItem);

      addToast({
        title: 'Product added successfully.',
        description: `${cleanSku} (${cleanName}) registered to Bin ${binId} with ${quantityOnHand} units.`,
        type: 'success',
      });

      onClose();
    } catch (err: any) {
      if (err.message && err.message.includes('SKU already exists')) {
        setErrorMessage('SKU already exists. Please use a unique SKU.');
      } else {
        setErrorMessage(err.message || 'Failed to create product. Entered data has been preserved.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Inventory Product"
      description="Register a new catalog item, assign warehouse bin coordinates, and calculate storage supply."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-xs">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Product Information */}
        <div className="space-y-3 p-3.5 sm:p-4 rounded-lg bg-surface-subtle border border-border">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
            <Tag className="w-3.5 h-3.5 text-primary-600" />
            <span>1. Product Catalog Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="product-sku-input" className="text-[11px] font-semibold text-foreground block mb-1">
                SKU Code <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-sku-input"
                name="sku"
                type="text"
                value={sku}
                placeholder="e.g. SKU-MON-008"
                required
                onChange={(e) => {
                  setSku(e.target.value.toUpperCase());
                  setErrorMessage(null);
                }}
                className={`w-full h-8 px-2.5 rounded border bg-white font-mono text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  errorMessage?.includes('SKU already exists') || isSkuTakenLocal
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-border'
                }`}
              />
              {(errorMessage?.includes('SKU already exists') || isSkuTakenLocal) && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">
                  SKU already exists. Please use a unique SKU.
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="product-name-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-name-input"
                name="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="product-description-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Description / Specifications
              </label>
              <input
                id="product-description-input"
                name="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="product-category-select" className="text-[11px] font-semibold text-foreground block mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="product-category-select"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                required
                className="w-full h-8 px-2 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="Monitors & Displays">Monitors & Displays</option>
                <option value="Keyboards & Mice">Keyboards & Mice</option>
                <option value="Cables & Adapters">Cables & Adapters</option>
                <option value="Storage & Memory">Storage & Memory</option>
                <option value="Audio & Headsets">Audio & Headsets</option>
                <option value="Mounts & Ergonomics">Mounts & Ergonomics</option>
                <option value="Networking & Hubs">Networking & Hubs</option>
              </select>
            </div>

            <div>
              <label htmlFor="product-supplier-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Supplier / Vendor
              </label>
              <input
                id="product-supplier-input"
                name="supplier"
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="product-unit-weight-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Unit Weight (grams)
              </label>
              <input
                id="product-unit-weight-input"
                name="unitWeightGrams"
                type="number"
                min={1}
                value={unitWeightGrams}
                onChange={(e) => setUnitWeightGrams(Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Warehouse Bin Location & Stock Quantities */}
        <div className="space-y-3 p-3.5 sm:p-4 rounded-lg bg-surface-subtle border border-border">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
            <MapPin className="w-3.5 h-3.5 text-primary-600" />
            <span>2. Physical Warehouse Location & Quantity Thresholds</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="product-zone-select" className="text-[11px] font-semibold text-foreground block mb-1">
                Zone <span className="text-rose-500">*</span>
              </label>
              <select
                id="product-zone-select"
                name="zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                required
                className="w-full h-8 px-2 rounded border border-border bg-white text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="A">Zone A (Fast Electronics)</option>
                <option value="B">Zone B (Heavy Displays)</option>
                <option value="C">Zone C (Cables & Adapters)</option>
                <option value="D">Zone D (Secured Audio)</option>
              </select>
            </div>
            <div>
              <label htmlFor="product-aisle-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Aisle <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-aisle-input"
                name="aisle"
                type="text"
                value={aisle}
                onChange={(e) => setAisle(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="product-rack-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Rack <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-rack-input"
                name="rack"
                type="text"
                value={rack}
                onChange={(e) => setRack(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="product-shelf-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Shelf <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-shelf-input"
                name="shelf"
                type="text"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="product-onhand-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Initial On-Hand <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-onhand-input"
                name="quantityOnHand"
                type="number"
                min={0}
                value={quantityOnHand}
                onChange={(e) => setQuantityOnHand(Math.max(0, parseInt(e.target.value) || 0))}
                required
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="product-reorder-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Reorder Point <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-reorder-input"
                name="reorderPoint"
                type="number"
                min={0}
                value={reorderPoint}
                onChange={(e) => setReorderPoint(Math.max(0, parseInt(e.target.value) || 0))}
                required
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="product-unit-cost-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Unit Cost ($)
              </label>
              <input
                id="product-unit-cost-input"
                name="unitCost"
                type="number"
                min={0}
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="product-unit-price-input" className="text-[11px] font-semibold text-foreground block mb-1">
                Unit Price ($)
              </label>
              <input
                id="product-unit-price-input"
                name="unitPrice"
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-8 px-2.5 rounded border border-border bg-white text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Live Inventory Health Preview */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-indigo-50/60 border border-indigo-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 block">
            Live Inventory Health Preview (Computed Engine Telemetry)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-white border border-indigo-100 shadow-xs">
              <span className="text-[10px] text-foreground-secondary uppercase font-semibold block">On Hand</span>
              <span className="font-mono font-bold text-foreground text-sm">{quantityOnHand}</span>
            </div>
            <div className="p-2 rounded bg-white border border-indigo-100 shadow-xs">
              <span className="text-[10px] text-foreground-secondary uppercase font-semibold block">Allocated</span>
              <span className="font-mono font-bold text-foreground text-sm">0</span>
            </div>
            <div className="p-2 rounded bg-white border border-indigo-100 shadow-xs">
              <span className="text-[10px] text-foreground-secondary uppercase font-semibold block">Available</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">{quantityAvailable}</span>
            </div>
            <div className="p-2 rounded bg-white border border-indigo-100 shadow-xs">
              <span className="text-[10px] text-foreground-secondary uppercase font-semibold block">Status</span>
              <span className="font-bold text-indigo-800 text-xs">{reorderStatus}</span>
            </div>
            <div className="p-2 rounded bg-white border border-indigo-100 shadow-xs">
              <span className="text-[10px] text-foreground-secondary uppercase font-semibold block">Days Supply</span>
              <span className="font-mono font-bold text-foreground text-sm">{daysOfSupply}d</span>
            </div>
          </div>

          <div className="text-[11px] text-indigo-950 font-medium pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
            <span>Assigned Bin Location: <strong className="font-mono">{binId}</strong></span>
            <span>Est. Velocity: <strong>{estimatedDailyVelocity} units/day</strong></span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            disabled={isSkuTakenLocal}
            className="font-semibold shadow-xs"
          >
            Add Product to Inventory
          </Button>
        </div>
      </form>
    </Modal>
  );
}
