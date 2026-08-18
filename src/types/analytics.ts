export interface ThroughputHourlyPoint {
  time: string; // e.g. "08:00", "09:00"
  pickedUnits: number;
  packedUnits: number;
  dispatchedUnits: number;
  targetUnits: number;
}

export interface StatusDistributionPoint {
  name: string;
  count: number;
  color: string;
}

export interface ZoneBottleneckMetrics {
  zone: string;
  name: string;
  utilization: number;
  pickSpeedMinutes: number;
  congestionIndex: number;
  activeWorkers: number;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL_BOTTLENECK';
}

export interface OperationalKPIs {
  totalOrders: number;
  totalOrdersTrend: number; // percentage change vs yesterday
  totalInventoryUnits: number;
  totalInventorySKUs: number;
  ordersAtRiskCount: number;
  ordersAtRiskTrend: number;
  slaComplianceRate: number; // e.g. 94.2
  slaComplianceTrend: number;
  activeExceptionsCount: number;
  avgOrderFulfillmentMins: number;
}

export interface ActivityLogItem {
  id: string;
  type: 'ORDER_STATUS' | 'STOCK_ADJUSTMENT' | 'EXCEPTION_FILED' | 'EXCEPTION_RESOLVED' | 'ALLOCATION_OVERRIDE' | 'DISPATCH_CONFIRMED';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  entityId: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'BOTTLENECK' | 'INFO';
  timestamp: string;
  read: boolean;
  actionHref?: string;
}
