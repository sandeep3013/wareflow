export type OrderStatus =
  | 'NEW'
  | 'PRIORITIZED'
  | 'ALLOCATED'
  | 'PARTIALLY_ALLOCATED'
  | 'PICKING'
  | 'PACKING'
  | 'QUALITY_CHECK'
  | 'READY_TO_DISPATCH'
  | 'DISPATCHED'
  | 'ON_HOLD';

export type OrderPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Channel = 'B2B_PORTAL' | 'SHOPIFY_STORE' | 'AMAZON_FBA' | 'EDI_ENTERPRISE' | 'DIRECT';

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  tier: 'ENTERPRISE_VIP' | 'STRATEGIC' | 'STANDARD';
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isCommercial: boolean;
}

export interface OrderItem {
  id: string;
  sku: string;
  productName: string;
  unitPrice: number;
  quantityOrdered: number;
  quantityAllocated: number;
  quantityPicked: number;
  quantityPacked: number;
  assignedBin?: string;
  unitWeightGrams: number;
}

export interface Order {
  id: string; // e.g. "ORD-1042"
  externalReference?: string;
  channel: Channel;
  customer: Customer;
  shippingAddress: ShippingAddress;
  carrier: 'FEDEX_PRIORITY' | 'UPS_GROUND' | 'DHL_EXPRESS' | 'FREIGHT_LTL';
  shippingMethod: 'STANDARD' | 'EXPEDITED' | 'OVERNIGHT_EXPRESS' | 'SAME_DAY';
  status: OrderStatus;
  priority: OrderPriority;
  priorityScore: number; // 0 - 100 calculated score
  items: OrderItem[];
  totalValue: number;
  totalUnits: number;
  totalWeightKg: number;
  createdAt: string;
  slaDeadline: string;
  slaRisk: boolean;
  assignedPickerId?: string;
  assignedPackerId?: string;
  notes?: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
    actor?: string;
  }[];
}
