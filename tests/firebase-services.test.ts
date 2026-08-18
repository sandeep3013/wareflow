import { describe, it, expect } from 'vitest';
import { handleFirebaseError } from '../src/services/errorService';
import { inventoryService } from '../src/services/inventoryService';
import { orderService } from '../src/services/orderService';
import { exceptionService } from '../src/services/exceptionService';
import { settingsService } from '../src/services/settingsService';
import { DEFAULT_SETTINGS } from '../src/types/settings';

describe('Firebase Error Service', () => {
  it('translates permission-denied errors gracefully into offline demo notices without auth errors', () => {
    const err = { code: 'permission-denied', message: 'Missing permissions' };
    const appErr = handleFirebaseError(err, 'Inventory Add');
    expect(appErr.message).toContain('offline demo mode');
    expect(appErr.message).not.toContain('Access denied');
    expect(appErr.message).not.toContain('session is active');
  });

  it('translates network unavailable errors gracefully into cached demo notices', () => {
    const err = { code: 'unavailable', message: 'Backend unreachable' };
    const appErr = handleFirebaseError(err, 'Orders Fetch');
    expect(appErr.message).toContain('Connection interrupted');
  });

  it('translates not-found errors gracefully', () => {
    const err = { code: 'not-found', message: 'Doc missing' };
    const appErr = handleFirebaseError(err, 'Exception Triage');
    expect(appErr.message).toContain('was not found');
  });
});

describe('Data Services Fallback & Baseline Capabilities', () => {
  it('inventoryService retrieves baseline items when database is uninitialized or offline', async () => {
    const items = await inventoryService.getInventory();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('sku');
    expect(items[0]).toHaveProperty('quantityOnHand');
  });

  it('orderService retrieves baseline orders when database is uninitialized or offline', async () => {
    const orders = await orderService.getOrders();
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0]).toHaveProperty('id');
    expect(orders[0]).toHaveProperty('customer');
  });

  it('exceptionService retrieves baseline operational exceptions', async () => {
    const exceptions = await exceptionService.getExceptions();
    expect(exceptions.length).toBeGreaterThan(0);
    expect(exceptions[0]).toHaveProperty('severity');
    expect(exceptions[0]).toHaveProperty('recommendedResolutions');
  });

  it('settingsService retrieves baseline settings', async () => {
    const settings = await settingsService.getSettings();
    expect(settings.facilityName).toBe(DEFAULT_SETTINGS.facilityName);
    expect(settings.engineVersion).toBe(DEFAULT_SETTINGS.engineVersion);
    expect(settings.defaultWarehouseId).toBe(DEFAULT_SETTINGS.defaultWarehouseId);
  });
});
