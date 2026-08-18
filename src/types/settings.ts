export interface AppSettings {
  // General
  facilityName: string;
  defaultWarehouseId: string;
  timeZone: string;
  dateFormat: string;

  // Operations
  autoAllocationEnabled: boolean;
  priorityScoringStrictness: 'standard' | 'aggressive' | 'lenient';
  lowStockThresholdUnits: number;
  slaWarningThresholdMins: number;
  pickingOptimizationMode: 'serpentine' | 'zone_batched' | 'direct_path';
  exceptionAutoTriage: boolean;

  // Notifications
  criticalInventoryAlerts: boolean;
  orderRiskAlerts: boolean;
  pickingBottleneckAlerts: boolean;
  dispatchAlerts: boolean;

  // Appearance
  density: 'compact' | 'comfortable';
  theme: 'dark' | 'light' | 'system';
  reducedMotion: boolean;

  // System
  engineVersion: string;
  lastDataRefresh: string;
  isDemoMode: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  facilityName: 'Chicago Central Fulfilment (ORD-1)',
  defaultWarehouseId: 'wh-alpha',
  timeZone: 'America/Chicago (CST)',
  dateFormat: 'MM/DD/YYYY HH:mm',

  autoAllocationEnabled: true,
  priorityScoringStrictness: 'aggressive',
  lowStockThresholdUnits: 15,
  slaWarningThresholdMins: 120,
  pickingOptimizationMode: 'serpentine',
  exceptionAutoTriage: true,

  criticalInventoryAlerts: true,
  orderRiskAlerts: true,
  pickingBottleneckAlerts: true,
  dispatchAlerts: true,

  density: 'comfortable',
  theme: 'system',
  reducedMotion: false,

  engineVersion: '2.4.0-prod',
  lastDataRefresh: new Date().toISOString(),
  isDemoMode: true,
};
