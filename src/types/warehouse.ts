export type ZoneType = 'RECEIVING' | 'FAST_PICK' | 'BULK_STORAGE' | 'PACKING_STATION' | 'DISPATCH_STAGING' | 'QUARANTINE';

export interface WarehouseZone {
  id: string;
  code: string; // e.g., "ZONE_A"
  name: string;
  type: ZoneType;
  totalAisles: number;
  totalBins: number;
  capacityUtilization: number; // 0 - 100 percentage
  currentPickersCount: number;
  averagePickTimeMinutes: number;
  isBottleneck: boolean;
  congestionScore: number; // 0 - 100
}

export type EmployeeRole = 'MANAGER' | 'SUPERVISOR' | 'PICKER' | 'PACKER' | 'FORKLIFT_OPERATOR' | 'DISPATCHER';

export interface WarehouseEmployee {
  id: string;
  name: string;
  role: EmployeeRole;
  avatarUrl: string;
  currentZone: string;
  shift: string;
  status: 'ACTIVE_ON_FLOOR' | 'ON_BREAK' | 'OFF_SHIFT' | 'BUSY_TASK';
  currentTaskId?: string;
  picksPerHour: number;
  errorRatePercent: number;
  activeSince: string;
}

export interface WarehouseDetails {
  id: string;
  name: string;
  code: string;
  city: string;
  zones: WarehouseZone[];
  totalSqFt: number;
  activeWorkers: number;
  currentThroughputUph: number; // units per hour
}
