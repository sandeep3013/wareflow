import { describe, it, expect } from 'vitest';
import { recommendAllocation } from '../src/engines/allocationEngine';
import { calculateOrderPriority } from '../src/engines/priorityEngine';
import { forecastStockout } from '../src/engines/stockForecastEngine';
import { optimizePickingRoute } from '../src/engines/pickingOptimizer';
import { detectBottlenecks } from '../src/engines/bottleneckDetector';
import { recommendExceptionResolution } from '../src/engines/exceptionEngine';
import { Order } from '../src/types/order';
import { InventoryItem } from '../src/types/inventory';
import { WarehouseZone } from '../src/types/warehouse';
import { OperationalException } from '../src/types/exception';

describe('WAREFLOW V2 Engine Test Suite', () => {
  // -------------------------------------------------------------
  // TEST CASE 1: Partial Allocation (Required: 10, Available: 7)
  // -------------------------------------------------------------
  describe('Allocation Engine - Edge Cases', () => {
    it('TEST CASE 1: should return partial allocation when required (10) exceeds available (7)', () => {
      const order: Order = {
        id: 'ORD-TEST-01',
        externalReference: 'PO-001',
        channel: 'B2B_PORTAL',
        customer: { id: 'c1', name: 'Test Corp', tier: 'STRATEGIC', email: 'test@corp.com', phone: '123' },
        shippingAddress: { street: '123 Main', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'USA' },
        carrier: 'FEDEX_PRIORITY',
        shippingMethod: 'SAME_DAY',
        status: 'NEW',
        priority: 'HIGH',
        priorityScore: 75,
        items: [
          {
            id: 'item-1',
            sku: 'SKU-DKS-003',
            productName: 'Thunderbolt 4 Docking Station',
            unitPrice: 199,
            quantityOrdered: 10,
            quantityAllocated: 0,
            quantityPicked: 0,
            quantityPacked: 0,
            assignedBin: 'D-13-01-C',
            unitWeightGrams: 460,
          },
        ],
        totalValue: 1990,
        totalUnits: 10,
        totalWeightKg: 4.6,
        createdAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + 3600000).toISOString(),
        slaRisk: true,
        timeline: [],
      };

      const inventory: InventoryItem[] = [
        {
          id: 'inv-1',
          sku: 'SKU-DKS-003',
          productName: 'Thunderbolt 4 Docking Station',
          category: 'Docking Stations',
          location: { zone: 'D', aisle: '13', rack: '01', shelf: 'C', binId: 'D-13-01-C' },
          quantityOnHand: 7,
          quantityAllocated: 0,
          quantityReserved: 0,
          quantityAvailable: 7,
          quantityDamaged: 0,
          unitCost: 110,
          reorderPoint: 20,
          status: 'LOW',
          dailyVelocity: 12,
          daysOfSupplyRemaining: 0.6,
          lastCountedAt: new Date().toISOString(),
        },
      ];

      const result = recommendAllocation(order, inventory);

      expect(result.canFulfillInFull).toBe(false);
      expect(result.decisions[0].allocatedQuantity).toBe(7);
      expect(result.decisions[0].status).toBe('PARTIAL');
      expect(result.recommendedStrategy).toBe('PARTIAL_SPLIT_HOLD');
    });

    // -------------------------------------------------------------
    // TEST CASE 2: Full Allocation (Required: 10, Available: 20)
    // -------------------------------------------------------------
    it('TEST CASE 2: should return 100% full allocation when required (10) <= available (20)', () => {
      const order: Order = {
        id: 'ORD-TEST-02',
        externalReference: 'PO-002',
        channel: 'EDI_ENTERPRISE',
        customer: { id: 'c2', name: 'Global Enterprise', tier: 'ENTERPRISE_VIP', email: 'g@corp.com', phone: '123' },
        shippingAddress: { street: '500 Tech Way', city: 'Dallas', state: 'TX', zipCode: '75201', country: 'USA' },
        carrier: 'FEDEX_PRIORITY',
        shippingMethod: 'SAME_DAY',
        status: 'NEW',
        priority: 'CRITICAL',
        priorityScore: 95,
        items: [
          {
            id: 'item-2',
            sku: 'SKU-DKS-003',
            productName: 'Thunderbolt 4 Docking Station',
            unitPrice: 199,
            quantityOrdered: 10,
            quantityAllocated: 0,
            quantityPicked: 0,
            quantityPacked: 0,
            assignedBin: 'D-13-01-C',
            unitWeightGrams: 460,
          },
        ],
        totalValue: 1990,
        totalUnits: 10,
        totalWeightKg: 4.6,
        createdAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + 3600000).toISOString(),
        slaRisk: false,
        timeline: [],
      };

      const inventory: InventoryItem[] = [
        {
          id: 'inv-2',
          sku: 'SKU-DKS-003',
          productName: 'Thunderbolt 4 Docking Station',
          category: 'Docking Stations',
          location: { zone: 'D', aisle: '13', rack: '01', shelf: 'C', binId: 'D-13-01-C' },
          quantityOnHand: 20,
          quantityAllocated: 0,
          quantityReserved: 0,
          quantityAvailable: 20,
          quantityDamaged: 0,
          unitCost: 110,
          reorderPoint: 20,
          status: 'HEALTHY',
          dailyVelocity: 12,
          daysOfSupplyRemaining: 1.6,
          lastCountedAt: new Date().toISOString(),
        },
      ];

      const result = recommendAllocation(order, inventory);

      expect(result.canFulfillInFull).toBe(true);
      expect(result.decisions[0].allocatedQuantity).toBe(10);
      expect(result.decisions[0].status).toBe('OPTIMAL');
      expect(result.recommendedStrategy).toBe('DIRECT_ALLOCATION');
    });

    // -------------------------------------------------------------
    // TEST CASE 4: Inventory: 0 -> Out-of-stock exception
    // -------------------------------------------------------------
    it('TEST CASE 4: should report FAILED_STOCKOUT when inventory is 0', () => {
      const order: Order = {
        id: 'ORD-TEST-04',
        externalReference: 'PO-004',
        channel: 'ECOMMERCE_STANDARD',
        customer: { id: 'c4', name: 'Retail Customer', tier: 'STANDARD', email: 'r@user.com', phone: '123' },
        shippingAddress: { street: '1 Elm', city: 'Atlanta', state: 'GA', zipCode: '30301', country: 'USA' },
        carrier: 'UPS_GROUND',
        shippingMethod: 'STANDARD',
        status: 'NEW',
        priority: 'LOW',
        priorityScore: 30,
        items: [
          {
            id: 'item-4',
            sku: 'SKU-ZERO-001',
            productName: 'Out of Stock Part',
            unitPrice: 50,
            quantityOrdered: 5,
            quantityAllocated: 0,
            quantityPicked: 0,
            quantityPacked: 0,
            assignedBin: '',
            unitWeightGrams: 200,
          },
        ],
        totalValue: 250,
        totalUnits: 5,
        totalWeightKg: 1,
        createdAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + 86400000).toISOString(),
        slaRisk: false,
        timeline: [],
      };

      const result = recommendAllocation(order, []);

      expect(result.canFulfillInFull).toBe(false);
      expect(result.decisions[0].allocatedQuantity).toBe(0);
      expect(result.decisions[0].status).toBe('FAILED_STOCKOUT');
    });
  });

  // -------------------------------------------------------------
  // TEST CASE 3: Priority Engine (Urgent order vs Normal order)
  // -------------------------------------------------------------
  describe('Priority Engine - Urgent vs Normal', () => {
    it('TEST CASE 3: should assign CRITICAL priority to urgent VIP same-day order and LOW to standard order', () => {
      const urgentOrder: Order = {
        id: 'ORD-URGENT',
        externalReference: 'VIP-01',
        channel: 'EDI_ENTERPRISE',
        customer: { id: 'v1', name: 'VIP Corp', tier: 'ENTERPRISE_VIP', email: 'v@corp.com', phone: '123' },
        shippingAddress: { street: '100 Loop', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'USA' },
        carrier: 'FEDEX_PRIORITY',
        shippingMethod: 'SAME_DAY',
        status: 'NEW',
        priority: 'LOW',
        priorityScore: 0,
        items: [],
        totalValue: 3500,
        totalUnits: 15,
        totalWeightKg: 5,
        createdAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + 3600000).toISOString(),
        slaRisk: true,
        timeline: [],
      };

      const normalOrder: Order = {
        id: 'ORD-NORMAL',
        externalReference: 'STD-01',
        channel: 'ECOMMERCE_STANDARD',
        customer: { id: 'n1', name: 'Normal Customer', tier: 'STANDARD', email: 'n@user.com', phone: '123' },
        shippingAddress: { street: '200 Oak', city: 'Dallas', state: 'TX', zipCode: '75201', country: 'USA' },
        carrier: 'UPS_GROUND',
        shippingMethod: 'STANDARD',
        status: 'NEW',
        priority: 'LOW',
        priorityScore: 0,
        items: [],
        totalValue: 120,
        totalUnits: 2,
        totalWeightKg: 0.5,
        createdAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        slaRisk: false,
        timeline: [],
      };

      const urgentScore = calculateOrderPriority(urgentOrder);
      const normalScore = calculateOrderPriority(normalOrder);

      expect(urgentScore.totalScore).toBeGreaterThan(80);
      expect(urgentScore.assignedPriority).toBe('CRITICAL');
      expect(normalScore.totalScore).toBeLessThan(50);
      expect(urgentScore.totalScore).toBeGreaterThan(normalScore.totalScore);
    });
  });

  // -------------------------------------------------------------
  // TEST CASE 5: Stock Forecast Engine (Damaged stock & lead time)
  // -------------------------------------------------------------
  describe('Stock Forecast Engine', () => {
    it('TEST CASE 5: should trigger CRITICAL stockout risk when available supply is depleted', () => {
      const depletedItem: InventoryItem = {
        id: 'inv-depleted',
        sku: 'SKU-CRIT-001',
        productName: 'Critical Display Adapter',
        category: 'Adapters',
        location: { zone: 'C', aisle: '02', rack: '01', shelf: 'A', binId: 'C-02-01-A' },
        quantityOnHand: 4,
        quantityAllocated: 4,
        quantityReserved: 0,
        quantityAvailable: 0, // 0 available due to damage / allocations
        quantityDamaged: 2,
        unitCost: 15,
        reorderPoint: 30,
        status: 'CRITICAL',
        dailyVelocity: 10,
        daysOfSupplyRemaining: 0,
        lastCountedAt: new Date().toISOString(),
      };

      const forecast = forecastStockout(depletedItem, 7);

      expect(forecast.stockoutRiskLevel).toBe('CRITICAL');
      expect(forecast.isReorderRequired).toBe(true);
      expect(forecast.recommendedOrderQuantity).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------
  // TEST CASE 6: Picking Optimizer (Serpentine routing & time savings)
  // -------------------------------------------------------------
  describe('Picking Optimizer & Serpentine Sequence', () => {
    it('should generate ordered sequential aisle stops and estimate travel distances', () => {
      const items = [
        {
          id: 'i-1',
          sku: 'SKU-01',
          productName: 'Item 1',
          unitPrice: 10,
          quantityOrdered: 2,
          quantityAllocated: 2,
          quantityPicked: 0,
          quantityPacked: 0,
          assignedBin: 'C-02-01-A',
        },
        {
          id: 'i-2',
          sku: 'SKU-02',
          productName: 'Item 2',
          unitPrice: 20,
          quantityOrdered: 1,
          quantityAllocated: 1,
          quantityPicked: 0,
          quantityPacked: 0,
          assignedBin: 'A-03-01-B',
        },
        {
          id: 'i-3',
          sku: 'SKU-03',
          productName: 'Item 3',
          unitPrice: 30,
          quantityOrdered: 4,
          quantityAllocated: 4,
          quantityPicked: 0,
          quantityPacked: 0,
          assignedBin: 'B-04-02-C',
        },
      ];

      const route = optimizePickingRoute(items);

      expect(route.sequence.length).toBe(3);
      expect(route.sequence[0].binId).toBe('A-03-01-B');
      expect(route.sequence[1].binId).toBe('B-04-02-C');
      expect(route.sequence[2].binId).toBe('C-02-01-A');
      expect(route.totalDistanceMeters).toBeGreaterThan(0);
      expect(route.estimatedTimeMinutes).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------
  // Bottleneck Detector Tests
  // -------------------------------------------------------------
  describe('Bottleneck Detector Engine', () => {
    it('should flag zone with high congestion as a bottleneck with recommended actions', () => {
      const zones: WarehouseZone[] = [
        {
          id: 'z-a',
          code: 'A',
          name: 'Fast Pick Electronics',
          congestionScore: 30,
          averagePickTimeMinutes: 3.0,
          activeWorkers: 6,
          isBottleneck: false,
          temperatureCelsius: 21,
          totalBins: 120,
          utilizationPercentage: 45,
        },
        {
          id: 'z-b',
          code: 'B',
          name: 'Heavy Displays',
          congestionScore: 85,
          averagePickTimeMinutes: 5.8,
          activeWorkers: 4,
          isBottleneck: true,
          temperatureCelsius: 20,
          totalBins: 80,
          utilizationPercentage: 88,
        },
      ];

      const evaluations = detectBottlenecks(zones, 3.5);

      expect(evaluations[0].isBottleneck).toBe(false);
      expect(evaluations[1].isBottleneck).toBe(true);
      expect(evaluations[1].severity).toBe('CRITICAL');
      expect(evaluations[1].recommendedAction).toContain('Rebalance');
    });
  });

  // -------------------------------------------------------------
  // Exception Engine Tests
  // -------------------------------------------------------------
  describe('Exception Resolution Engine', () => {
    it('should score and recommend highest confidence resolution plan', () => {
      const exception: OperationalException = {
        id: 'EXC-TEST-01',
        type: 'STOCK_SHORTAGE',
        severity: 'CRITICAL',
        status: 'RECOMMENDED',
        title: 'Stock Shortage',
        description: 'Shortage on SKU-DKS-003',
        detectedAt: new Date().toISOString(),
        reportedBy: 'Allocation Engine',
        recommendedResolutions: [
          {
            id: 'res-low',
            actionTitle: 'Backorder Order',
            description: 'Wait 7 days',
            suggestedActionType: 'SPLIT_ORDER',
            impactAssessment: 'High delay',
            confidenceScore: 65,
            isRecommended: false,
          },
          {
            id: 'res-high',
            actionTitle: 'Reallocate Available Stock',
            description: 'Reallocate 3 units from ORD-1043',
            suggestedActionType: 'REALLOCATE_ALT_BIN',
            impactAssessment: 'Zero SLA delay',
            confidenceScore: 96,
            isRecommended: true,
          },
        ],
      };

      const plan = recommendExceptionResolution(exception);

      expect(plan).not.toBeNull();
      expect(plan?.recommendedOption.id).toBe('res-high');
      expect(plan?.recommendedOption.confidenceScore).toBe(96);
      expect(plan?.autoExecutable).toBe(true);
    });
  });
});
