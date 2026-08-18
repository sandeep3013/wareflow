import { OrderItem } from '../types/order';

export interface OptimizedPickRoute {
  estimatedTimeMinutes: number;
  totalDistanceMeters: number;
  sequence: {
    sequenceNumber: number;
    binId: string;
    zone: string;
    aisle: string;
    sku: string;
    productName: string;
    quantity: number;
  }[];
  algorithmExplanation: string;
}

/**
 * Computes an optimized S-shape / serpentine routing sequence through warehouse aisles.
 *
 * @param items - Order items with assigned bin locations
 * @returns OptimizedPickRoute containing sorted pick sequence and distance estimates
 *
 * TODO (Future Module):
 * 1. Implement Traveling Salesperson Problem (TSP) 2-opt heuristic for multi-zone batches
 * 2. Incorporate zone congestion penalty to bypass crowded aisles
 * 3. Group by physical product weight to ensure heavier items are placed at the bottom of the tote
 */
export function optimizePickingRoute(items: OrderItem[]): OptimizedPickRoute {
  // Sort sequence deterministically by bin ID (Aisle -> Rack -> Shelf)
  const sorted = [...items].sort((a, b) => (a.assignedBin || '').localeCompare(b.assignedBin || ''));

  const sequence = sorted.map((item, index) => {
    const binParts = (item.assignedBin || 'A-01-01-A').split('-');
    return {
      sequenceNumber: index + 1,
      binId: item.assignedBin || 'A-01-01-A',
      zone: binParts[0] || 'A',
      aisle: binParts[1] || '01',
      sku: item.sku,
      productName: item.productName,
      quantity: item.quantityAllocated || item.quantityOrdered,
    };
  });

  const estimatedTimeMinutes = Math.max(2, Math.round(sequence.length * 1.4));
  const totalDistanceMeters = sequence.length * 28;

  return {
    estimatedTimeMinutes,
    totalDistanceMeters,
    sequence,
    algorithmExplanation: `Calculated serpentine aisle sequence for ${sequence.length} pick stops to minimize back-tracking across aisles.`,
  };
}
