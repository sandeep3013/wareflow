import { InventoryItem } from '../types/inventory';

export interface StockForecastResult {
  sku: string;
  daysOfSupplyRemaining: number;
  isReorderRequired: boolean;
  recommendedOrderQuantity: number;
  stockoutRiskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  rationale: string;
}

/**
 * Evaluates current consumption velocity against safety stock thresholds to forecast stockouts.
 *
 * @param inventoryItem - The inventory item to forecast
 * @param leadTimeDays - Supplier lead time in calendar days
 * @returns StockForecastResult
 *
 * TODO (Future Module):
 * 1. Implement Holt-Winters exponential smoothing for seasonal variations
 * 2. Incorporate supplier reliability and historical lead-time jitter
 * 3. Factor in upcoming scheduled promotional events and sales spikes
 */
export function forecastStockout(inventoryItem: InventoryItem, leadTimeDays: number = 7): StockForecastResult {
  const velocity = Math.max(0.1, inventoryItem.dailyVelocity);
  const daysOfSupply = inventoryItem.quantityAvailable / velocity;

  let stockoutRiskLevel: StockForecastResult['stockoutRiskLevel'] = 'NONE';
  let isReorderRequired = false;

  if (inventoryItem.quantityAvailable === 0) {
    stockoutRiskLevel = 'CRITICAL';
    isReorderRequired = true;
  } else if (daysOfSupply <= 1.0) {
    stockoutRiskLevel = 'CRITICAL';
    isReorderRequired = true;
  } else if (daysOfSupply <= leadTimeDays) {
    stockoutRiskLevel = 'MEDIUM';
    isReorderRequired = true;
  } else if (inventoryItem.quantityOnHand <= inventoryItem.reorderPoint) {
    stockoutRiskLevel = 'LOW';
    isReorderRequired = true;
  }

  const recommendedOrderQuantity = isReorderRequired
    ? Math.max(50, Math.round(velocity * (leadTimeDays + 14))) // Target 2 weeks buffer
    : 0;

  const rationale = isReorderRequired
    ? `Available stock (${inventoryItem.quantityAvailable} units) will be depleted in ~${daysOfSupply.toFixed(1)} days at current velocity of ${velocity.toFixed(1)} units/day (Lead time: ${leadTimeDays} days).`
    : `Stock level healthy (${daysOfSupply.toFixed(1)} days remaining). Above reorder threshold of ${inventoryItem.reorderPoint} units.`;

  return {
    sku: inventoryItem.sku,
    daysOfSupplyRemaining: Math.round(daysOfSupply * 10) / 10,
    isReorderRequired,
    recommendedOrderQuantity,
    stockoutRiskLevel,
    rationale,
  };
}
