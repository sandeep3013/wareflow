import { create } from 'zustand';
import { InventoryItem, InventoryStatus } from '../types/inventory';
import { Product } from '../types/product';
import { MOCK_INVENTORY } from '../data/inventory';
import { MOCK_PRODUCTS } from '../data/products';
import { inventoryService } from '../services/inventoryService';

interface InventoryState {
  inventory: InventoryItem[];
  products: Product[];
  selectedSku: string | null;
  searchQuery: string;
  statusFilter: InventoryStatus | 'ALL';
  zoneFilter: string | 'ALL';
  categoryFilter: string | 'ALL';
  isLoading: boolean;
  error: string | null;

  // Actions
  initInventory: () => Promise<void>;
  setSelectedSku: (sku: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: InventoryStatus | 'ALL') => void;
  setZoneFilter: (zone: string | 'ALL') => void;
  setCategoryFilter: (category: string | 'ALL') => void;
  adjustStockQuantity: (binId: string, sku: string, deltaOnHand: number) => Promise<void>;
  addProduct: (product: Product, inventoryItem: InventoryItem) => Promise<void>;
  transferStock: (sku: string, fromBinId: string, toBinId: string, quantity: number) => Promise<void>;
  markDamaged: (binId: string, sku: string, quantity: number) => Promise<void>;
  resetInventory: () => Promise<void>;
  getFilteredInventory: () => InventoryItem[];
  getItemBySku: (sku: string) => InventoryItem | undefined;
  getProductBySku: (sku: string) => Product | undefined;
}

let isInventorySubscribed = false;

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: MOCK_INVENTORY,
  products: MOCK_PRODUCTS,
  selectedSku: null,
  searchQuery: '',
  statusFilter: 'ALL',
  zoneFilter: 'ALL',
  categoryFilter: 'ALL',
  isLoading: false,
  error: null,

  initInventory: async () => {
    if (isInventorySubscribed) return;
    set({ isLoading: true, error: null });

    try {
      // 1. Initial fetch
      const [items, prods] = await Promise.all([
        inventoryService.getInventory(),
        inventoryService.getProducts(),
      ]);
      set({ inventory: items, products: prods, isLoading: false });

      // 2. Real-time subscription
      isInventorySubscribed = true;
      inventoryService.subscribeInventory(
        (updatedItems) => {
          set({ inventory: updatedItems });
        },
        (appErr) => {
          set({ error: appErr.message });
        }
      );

      inventoryService.subscribeProducts((updatedProds) => {
        set({ products: updatedProds });
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Unable to load inventory data.' });
    }
  },

  setSelectedSku: (sku) => set({ selectedSku: sku }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setZoneFilter: (zone) => set({ zoneFilter: zone }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  adjustStockQuantity: async (binId, sku, deltaOnHand) => {
    const { inventory } = get();
    // Optimistic local update
    const updatedInventory = inventory.map((item) => {
      if (item.location.binId === binId && item.sku === sku) {
        const newOnHand = Math.max(0, item.quantityOnHand + deltaOnHand);
        const newAvailable = Math.max(0, newOnHand - item.quantityAllocated - item.quantityReserved);
        let newStatus: InventoryStatus = 'HEALTHY';
        if (newOnHand === 0) newStatus = 'OUT_OF_STOCK';
        else if (newOnHand <= item.reorderPoint / 2) newStatus = 'CRITICAL';
        else if (newOnHand <= item.reorderPoint) newStatus = 'LOW';

        return {
          ...item,
          quantityOnHand: newOnHand,
          quantityAvailable: newAvailable,
          status: newStatus,
          lastCountedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    set({ inventory: updatedInventory });
    await inventoryService.adjustStockQuantity(binId, sku, deltaOnHand, inventory);
  },

  addProduct: async (product, inventoryItem) => {
    // 1. Write to Firestore
    await inventoryService.addProduct(product, inventoryItem);

    // 2. Update local state
    set((state) => ({
      products: [product, ...state.products.filter((p) => p.sku !== product.sku)],
      inventory: [inventoryItem, ...state.inventory.filter((i) => i.id !== inventoryItem.id)],
    }));
  },

  transferStock: async (sku, fromBinId, toBinId, quantity) => {
    const { inventory } = get();
    await inventoryService.transferStock(sku, fromBinId, toBinId, quantity, inventory);
  },

  markDamaged: async (binId, sku, quantity) => {
    const { inventory } = get();
    await inventoryService.markDamaged(binId, sku, quantity, inventory);
  },

  resetInventory: async () => {
    await inventoryService.resetInventory();
    set({ inventory: MOCK_INVENTORY, products: MOCK_PRODUCTS });
  },

  getFilteredInventory: () => {
    const { inventory, searchQuery, statusFilter, zoneFilter, categoryFilter } = get();

    return inventory.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (zoneFilter !== 'ALL' && item.location.zone !== zoneFilter) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesName = item.productName.toLowerCase().includes(q);
        const matchesBin = item.location.binId.toLowerCase().includes(q);
        return matchesSku || matchesName || matchesBin;
      }
      return true;
    });
  },

  getItemBySku: (sku: string) => {
    return get().inventory.find((item) => item.sku === sku);
  },

  getProductBySku: (sku: string) => {
    return get().products.find((p) => p.sku === sku);
  },
}));
