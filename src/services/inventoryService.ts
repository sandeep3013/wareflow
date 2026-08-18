import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { InventoryItem, InventoryStatus } from '../types/inventory';
import { Product } from '../types/product';
import { handleFirebaseError, AppError } from './errorService';
import { MOCK_INVENTORY } from '../data/inventory';
import { MOCK_PRODUCTS } from '../data/products';

const STORAGE_KEY_INVENTORY = 'wareflow_local_inventory_v2';
const STORAGE_KEY_PRODUCTS = 'wareflow_local_products_v2';

function getLocalInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVENTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_INVENTORY;
}

function setLocalInventory(items: InventoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));
  } catch {}
}

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_PRODUCTS;
}

function setLocalProducts(prods: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(prods));
  } catch {}
}

export const inventoryService = {
  async getInventory(): Promise<InventoryItem[]> {
    if (!db) return getLocalInventory();

    try {
      const snap = await getDocs(collection(db, 'inventory'));
      if (snap.empty) {
        return getLocalInventory();
      }
      const items = snap.docs.map((d) => d.data() as InventoryItem);
      setLocalInventory(items);
      return items;
    } catch (err) {
      handleFirebaseError(err, 'Inventory Fetch');
      return getLocalInventory();
    }
  },

  async getProducts(): Promise<Product[]> {
    if (!db) return getLocalProducts();

    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) {
        return getLocalProducts();
      }
      const prods = snap.docs.map((d) => d.data() as Product);
      setLocalProducts(prods);
      return prods;
    } catch (err) {
      handleFirebaseError(err, 'Products Fetch');
      return getLocalProducts();
    }
  },

  subscribeInventory(
    onData: (items: InventoryItem[]) => void,
    onError?: (error: AppError) => void
  ): Unsubscribe {
    if (!db) {
      onData(getLocalInventory());
      return () => {};
    }

    try {
      const q = query(collection(db, 'inventory'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as InventoryItem);
            setLocalInventory(items);
            onData(items);
          }
        },
        (err) => {
          const appErr = handleFirebaseError(err, 'Inventory Stream');
          if (onError) onError(appErr);
          onData(getLocalInventory());
        }
      );
    } catch (err) {
      handleFirebaseError(err, 'Inventory Stream Init');
      onData(getLocalInventory());
      return () => {};
    }
  },

  subscribeProducts(
    onData: (products: Product[]) => void
  ): Unsubscribe {
    if (!db) {
      onData(getLocalProducts());
      return () => {};
    }

    try {
      const q = query(collection(db, 'products'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const prods = snapshot.docs.map((d) => d.data() as Product);
            setLocalProducts(prods);
            onData(prods);
          }
        },
        (err) => {
          handleFirebaseError(err, 'Products Stream');
          onData(getLocalProducts());
        }
      );
    } catch {
      onData(getLocalProducts());
      return () => {};
    }
  },

  async addProduct(product: Product, inventoryItem: InventoryItem): Promise<void> {
    // 1. Update local storage first (optimistic resilience)
    const currentProds = getLocalProducts();
    const currentInv = getLocalInventory();

    const isDuplicate = currentProds.some((p) => p.sku.toLowerCase() === product.sku.toLowerCase()) ||
      currentInv.some((i) => i.sku.toLowerCase() === product.sku.toLowerCase());

    if (isDuplicate) {
      throw new Error('SKU already exists.');
    }

    setLocalProducts([product, ...currentProds]);
    setLocalInventory([inventoryItem, ...currentInv]);

    // 2. Persist to Firestore if available
    if (db) {
      try {
        const prodRef = doc(db, 'products', product.sku);
        const existing = await getDoc(prodRef);
        if (existing.exists()) {
          throw new Error('SKU already exists.');
        }

        const batch = writeBatch(db);
        batch.set(prodRef, {
          ...product,
          createdAt: new Date().toISOString(),
        });

        const invRef = doc(db, 'inventory', inventoryItem.id);
        batch.set(invRef, {
          ...inventoryItem,
          lastCountedAt: new Date().toISOString(),
        });

        await batch.commit();
      } catch (err: any) {
        if (err.message === 'SKU already exists.') throw err;
        handleFirebaseError(err, 'Add Product Cloud Sync');
      }
    }
  },

  async adjustStockQuantity(
    binId: string,
    sku: string,
    deltaOnHand: number,
    currentInventory: InventoryItem[]
  ): Promise<void> {
    const item = currentInventory.find((i) => i.location.binId === binId && i.sku === sku);
    if (!item) return;

    const newOnHand = Math.max(0, item.quantityOnHand + deltaOnHand);
    const newAvailable = Math.max(0, newOnHand - item.quantityAllocated - item.quantityReserved);
    let newStatus: InventoryStatus = 'HEALTHY';
    if (newOnHand === 0) newStatus = 'OUT_OF_STOCK';
    else if (newOnHand <= item.reorderPoint / 2) newStatus = 'CRITICAL';
    else if (newOnHand <= item.reorderPoint) newStatus = 'LOW';

    const updated = currentInventory.map((i) =>
      i.id === item.id
        ? {
            ...i,
            quantityOnHand: newOnHand,
            quantityAvailable: newAvailable,
            status: newStatus,
            lastCountedAt: new Date().toISOString(),
          }
        : i
    );
    setLocalInventory(updated);

    if (db) {
      try {
        const invRef = doc(db, 'inventory', item.id);
        await updateDoc(invRef, {
          quantityOnHand: newOnHand,
          quantityAvailable: newAvailable,
          status: newStatus,
          lastCountedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirebaseError(err, 'Stock Adjustment Cloud Sync');
      }
    }
  },

  async transferStock(
    sku: string,
    fromBinId: string,
    toBinId: string,
    quantity: number,
    currentInventory: InventoryItem[]
  ): Promise<void> {
    const fromItem = currentInventory.find((i) => i.sku === sku && i.location.binId === fromBinId);
    if (!fromItem || fromItem.quantityAvailable < quantity) {
      throw new Error(`Insufficient available quantity (${fromItem?.quantityAvailable || 0}) for transfer.`);
    }

    if (db) {
      try {
        const batch = writeBatch(db);

        const newFromOnHand = fromItem.quantityOnHand - quantity;
        const newFromAvailable = Math.max(0, newFromOnHand - fromItem.quantityAllocated - fromItem.quantityReserved);
        const newFromStatus: InventoryStatus =
          newFromOnHand === 0 ? 'OUT_OF_STOCK' : newFromOnHand <= fromItem.reorderPoint ? 'LOW' : 'HEALTHY';

        const fromRef = doc(db, 'inventory', fromItem.id);
        batch.update(fromRef, {
          quantityOnHand: newFromOnHand,
          quantityAvailable: newFromAvailable,
          status: newFromStatus,
        });

        const existingToItem = currentInventory.find((i) => i.sku === sku && i.location.binId === toBinId);
        if (existingToItem) {
          const newToOnHand = existingToItem.quantityOnHand + quantity;
          const newToAvailable = newToOnHand - existingToItem.quantityAllocated - existingToItem.quantityReserved;
          const newToStatus: InventoryStatus = newToOnHand <= existingToItem.reorderPoint ? 'LOW' : 'HEALTHY';

          const toRef = doc(db, 'inventory', existingToItem.id);
          batch.update(toRef, {
            quantityOnHand: newToOnHand,
            quantityAvailable: newToAvailable,
            status: newToStatus,
          });
        } else {
          const toZone = toBinId.split('-')[0] || 'A';
          const toAisle = toBinId.split('-')[1] || '01';
          const toRack = toBinId.split('-')[2] || '01';
          const toShelf = toBinId.split('-')[3] || 'A';

          const newTargetId = `inv-${sku}-${toBinId}-${Date.now()}`;
          const newTargetItem: InventoryItem = {
            ...fromItem,
            id: newTargetId,
            location: {
              zone: toZone,
              aisle: toAisle,
              rack: toRack,
              shelf: toShelf,
              binId: toBinId,
            },
            quantityOnHand: quantity,
            quantityAllocated: 0,
            quantityReserved: 0,
            quantityAvailable: quantity,
            quantityDamaged: 0,
            status: 'HEALTHY',
            lastCountedAt: new Date().toISOString(),
          };

          const targetRef = doc(db, 'inventory', newTargetId);
          batch.set(targetRef, newTargetItem);
        }

        await batch.commit();
      } catch (err) {
        handleFirebaseError(err, 'Stock Transfer Cloud Sync');
      }
    }
  },

  async markDamaged(
    binId: string,
    sku: string,
    quantity: number,
    currentInventory: InventoryItem[]
  ): Promise<void> {
    const item = currentInventory.find((i) => i.location.binId === binId && i.sku === sku);
    if (!item) return;

    const deduct = Math.min(item.quantityAvailable, quantity);
    const newOnHand = Math.max(0, item.quantityOnHand - deduct);
    const newAvailable = Math.max(0, newOnHand - item.quantityAllocated - item.quantityReserved);
    const newDamaged = item.quantityDamaged + deduct;
    const newStatus: InventoryStatus =
      newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand <= item.reorderPoint ? 'LOW' : 'HEALTHY';

    if (db) {
      try {
        const invRef = doc(db, 'inventory', item.id);
        await updateDoc(invRef, {
          quantityOnHand: newOnHand,
          quantityAvailable: newAvailable,
          quantityDamaged: newDamaged,
          status: newStatus,
          lastCountedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirebaseError(err, 'Mark Damaged Cloud Sync');
      }
    }
  },

  async resetInventory(): Promise<void> {
    setLocalInventory(MOCK_INVENTORY);
    setLocalProducts(MOCK_PRODUCTS);

    if (db) {
      try {
        const batch = writeBatch(db);
        MOCK_INVENTORY.forEach((item) => {
          const invDoc = doc(db!, 'inventory', item.id);
          batch.set(invDoc, item, { merge: true });
        });
        MOCK_PRODUCTS.forEach((product) => {
          const prodDoc = doc(db!, 'products', product.sku);
          batch.set(prodDoc, product, { merge: true });
        });
        await batch.commit();
      } catch (err) {
        handleFirebaseError(err, 'Reset Inventory Cloud Sync');
      }
    }
  },
};
