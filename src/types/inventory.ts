export type InventoryStatus = 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';

export interface LocationBin {
  zone: string; // e.g. "A", "B", "C", "D"
  aisle: string; // e.g. "01", "02"
  rack: string; // e.g. "03"
  shelf: string; // e.g. "A", "B", "C"
  binId: string; // e.g. "A-01-03-B"
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  location: LocationBin;
  quantityOnHand: number;
  quantityAllocated: number;
  quantityReserved: number;
  quantityAvailable: number; // calculated: onHand - allocated - reserved
  quantityDamaged: number;
  reorderPoint: number;
  status: InventoryStatus;
  lastCountedAt: string;
  lotNumber?: string;
  expiryDate?: string;
  dailyVelocity: number; // average units moved per day
  daysOfSupplyRemaining: number;
}

export interface StockAdjustment {
  id: string;
  sku: string;
  locationBinId: string;
  previousQuantity: number;
  newQuantity: number;
  reason: 'CYCLE_COUNT' | 'DAMAGE_WRITE_OFF' | 'RESTOCK' | 'FOUND_ITEM' | 'INSPECTION_REJECT';
  adjustedBy: string;
  timestamp: string;
  notes?: string;
}
