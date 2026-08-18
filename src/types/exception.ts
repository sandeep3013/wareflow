export type ExceptionType =
  | 'STOCK_SHORTAGE'
  | 'DAMAGED_ITEM'
  | 'MISSING_ITEM'
  | 'QUALITY_FAILURE'
  | 'SLA_RISK'
  | 'LOCATION_MISMATCH';

export type ExceptionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ExceptionStatus = 'OPEN' | 'INVESTIGATING' | 'RECOMMENDED' | 'RESOLVED' | 'DISMISSED';

export interface ResolutionRecommendation {
  id: string;
  actionTitle: string;
  description: string;
  suggestedActionType: 'REALLOCATE_ALT_BIN' | 'EXPEDITE_SHIPPING' | 'QUARANTINE_DAMAGED' | 'SPLIT_ORDER' | 'CYCLE_COUNT_LOCATION';
  impactAssessment: string;
  confidenceScore: number;
  isRecommended: boolean;
}

export interface OperationalException {
  id: string; // e.g. "EXC-109"
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  orderId?: string;
  sku?: string;
  productName?: string;
  locationBinId?: string;
  detectedAt: string;
  reportedBy: string;
  title: string;
  description: string;
  rootCauseAnalysis?: string;
  recommendedResolutions: ResolutionRecommendation[];
  selectedResolutionId?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}
