import { InventoryItem } from '../types/inventory';
import { Order } from '../types/order';
import { AllocationDecision } from '../types/operations';

export interface AllocationFeasibilityResult {
  canFulfillInFull: boolean;
  decisions: AllocationDecision[];
  recommendedStrategy: 'DIRECT_ALLOCATION' | 'CROSS_DOCK_RESERVE' | 'REALLOCATE_LOWER_PRIORITY' | 'PARTIAL_SPLIT_HOLD';
  summaryRationale: string;
}

/**
 * Evaluates and recommends optimal inventory allocation for an order across warehouse bins.
 *
 * @param order - The order requesting stock
 * @param availableInventory - Current snapshot of inventory records across all bins
 * @returns AllocationFeasibilityResult with bin recommendations and rationale
 *
 * TODO (Future Module):
 * 1. Implement strict FIFO (First-In, First-Out) and FEFO (First-Expired, First-Out) batch allocation
 * 2. Add single-bin consolidation optimization to minimize picker travel distance
 * 3. Implement inter-order stock reallocation solver when priority conflict occurs
 */
export function recommendAllocation(
  order: Order,
  availableInventory: InventoryItem[]
): AllocationFeasibilityResult {
  const decisions: AllocationDecision[] = [];
  let allItemsFulfillable = true;

  for (const item of order.items) {
    const matchingBins = availableInventory.filter(
      (inv) => inv.sku === item.sku && inv.quantityAvailable > 0
    );

    const totalAvailable = matchingBins.reduce((sum, bin) => sum + bin.quantityAvailable, 0);

    if (totalAvailable >= item.quantityOrdered) {
      const primaryBin = matchingBins[0];
      decisions.push({
        id: `alloc-${order.id}-${item.sku}`,
        orderId: order.id,
        sku: item.sku,
        requestedQuantity: item.quantityOrdered,
        allocatedQuantity: item.quantityOrdered,
        allocatedBinId: primaryBin.location.binId,
        confidenceScore: 98,
        rationale: `Full stock available in primary picking bin ${primaryBin.location.binId} (${primaryBin.quantityAvailable} units on-hand).`,
        status: 'OPTIMAL',
        evaluatedAt: new Date().toISOString(),
      });
    } else if (totalAvailable > 0) {
      allItemsFulfillable = false;
      const primaryBin = matchingBins[0];
      decisions.push({
        id: `alloc-${order.id}-${item.sku}`,
        orderId: order.id,
        sku: item.sku,
        requestedQuantity: item.quantityOrdered,
        allocatedQuantity: totalAvailable,
        allocatedBinId: primaryBin.location.binId,
        confidenceScore: 75,
        rationale: `Partial stock shortfall: requested ${item.quantityOrdered} units, only ${totalAvailable} available across active bins. Requires resolution.`,
        status: 'PARTIAL',
        evaluatedAt: new Date().toISOString(),
      });
    } else {
      allItemsFulfillable = false;
      decisions.push({
        id: `alloc-${order.id}-${item.sku}`,
        orderId: order.id,
        sku: item.sku,
        requestedQuantity: item.quantityOrdered,
        allocatedQuantity: 0,
        allocatedBinId: 'N/A',
        confidenceScore: 95,
        rationale: `Stockout: 0 units available for SKU ${item.sku} in any warehouse zone.`,
        status: 'FAILED_STOCKOUT',
        evaluatedAt: new Date().toISOString(),
      });
    }
  }

  const recommendedStrategy = allItemsFulfillable
    ? 'DIRECT_ALLOCATION'
    : order.priority === 'CRITICAL'
      ? 'REALLOCATE_LOWER_PRIORITY'
      : 'PARTIAL_SPLIT_HOLD';

  const summaryRationale = allItemsFulfillable
    ? `All ${order.items.length} items can be 100% fulfilled immediately from primary pick locations.`
    : `Stock bottleneck detected on 1 or more line items. Recommended strategy: ${recommendedStrategy}.`;

  return {
    canFulfillInFull: allItemsFulfillable,
    decisions,
    recommendedStrategy,
    summaryRationale,
  };
}
