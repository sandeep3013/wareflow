import { WarehouseZone } from '../types/warehouse';

export interface BottleneckEvaluation {
  zoneId: string;
  zoneCode: string;
  isBottleneck: boolean;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  congestionVariancePercent: number;
  recommendedAction: string;
  explanation: string;
}

/**
 * Detects throughput and labor congestion bottlenecks across warehouse physical zones.
 *
 * @param zones - List of warehouse zones with active utilization metrics
 * @param warehouseAveragePickMins - Global baseline pick time across the facility
 * @returns Array of BottleneckEvaluation results
 *
 * TODO (Future Module):
 * 1. Implement real-time picker GPS/RFID density heatmaps
 * 2. Predict aisle queue buildup based on incoming pick wave volume
 * 3. Auto-generate labor dynamic rebalance recommendations
 */
export function detectBottlenecks(
  zones: WarehouseZone[],
  warehouseAveragePickMins: number = 3.5
): BottleneckEvaluation[] {
  return zones.map((zone) => {
    const pickTimeVariance =
      ((zone.averagePickTimeMinutes - warehouseAveragePickMins) / warehouseAveragePickMins) * 100;

    const isBottleneck = zone.congestionScore > 75 || pickTimeVariance > 25;
    const severity: BottleneckEvaluation['severity'] =
      zone.congestionScore > 80 || pickTimeVariance > 30
        ? 'CRITICAL'
        : zone.congestionScore > 60 || pickTimeVariance > 15
          ? 'WARNING'
          : 'NORMAL';

    let recommendedAction = 'No action required. Operations within normal tolerance.';
    if (severity === 'CRITICAL') {
      recommendedAction = `Rebalance 2 pickers from low-congestion zones to ${zone.name} to clear backlog.`;
    } else if (severity === 'WARNING') {
      recommendedAction = `Monitor pick queue in ${zone.code}; restrict multi-pallet equipment access.`;
    }

    const explanation = isBottleneck
      ? `${zone.name} is experiencing ${Math.round(pickTimeVariance)}% higher pick duration than warehouse standard with ${zone.congestionScore}% congestion.`
      : `${zone.name} is performing at optimal velocity (${zone.averagePickTimeMinutes}m avg pick).`;

    return {
      zoneId: zone.id,
      zoneCode: zone.code,
      isBottleneck,
      severity,
      congestionVariancePercent: Math.round(pickTimeVariance),
      recommendedAction,
      explanation,
    };
  });
}
