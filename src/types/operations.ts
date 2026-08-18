export interface AllocationDecision {
  id: string;
  orderId: string;
  sku: string;
  requestedQuantity: number;
  allocatedQuantity: number;
  allocatedBinId: string;
  confidenceScore: number; // 0 - 100
  rationale: string;
  status: 'OPTIMAL' | 'SUB_OPTIMAL_SPLIT' | 'PARTIAL' | 'FAILED_STOCKOUT';
  evaluatedAt: string;
  alternativeBinIds?: string[];
}

export type PickingWaveType = 'SINGLE_ORDER' | 'BATCH_ZONE' | 'BULK_PALLET';

export interface PickingTask {
  id: string; // e.g. "PICK-8831"
  orderId: string;
  waveId: string;
  waveType: PickingWaveType;
  zone: string;
  assignedPickerId: string;
  assignedPickerName: string;
  totalItems: number;
  pickedItems: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXCEPTION_FLAGGED';
  estimatedDurationMins: number;
  startedAt?: string;
  completedAt?: string;
  routeSequence: {
    sequenceNumber: number;
    binId: string;
    sku: string;
    productName: string;
    quantity: number;
    picked: boolean;
  }[];
}

export interface PackingTask {
  id: string; // e.g. "PACK-4412"
  orderId: string;
  stationId: string;
  packerId: string;
  packerName: string;
  status: 'WAITING_ITEMS' | 'SCANNING' | 'QUALITY_CHECK' | 'SEALED_LABELED' | 'EXCEPTION_HOLD';
  boxType: 'BOX_SMALL' | 'BOX_MEDIUM' | 'BOX_LARGE' | 'PALLET_CONTAINER';
  verifiedWeightKg: number;
  expectedWeightKg: number;
  weightVarianceOk: boolean;
  trackingNumber?: string;
  scannedItemCount: number;
  totalItemCount: number;
  startedAt?: string;
  completedAt?: string;
}

export interface DispatchShipment {
  id: string; // e.g. "DSP-9021"
  orderId: string;
  customerName: string;
  carrier: string;
  trackingNumber: string;
  destinationCity: string;
  stagingDockId: string;
  totalPackages: number;
  totalWeightKg: number;
  status: 'STAGED' | 'LOADING' | 'DISPATCHED' | 'DELAYED_CARRIER';
  departureScheduledAt: string;
  actualDepartureAt?: string;
}
