import {
  collection,
  getDocs,
  writeBatch,
  doc,
  limit,
  query,
} from 'firebase/firestore';
import { db, ensureFirebaseSession } from '../lib/firebase';
import { MOCK_INVENTORY } from '../data/inventory';
import { MOCK_PRODUCTS } from '../data/products';
import { MOCK_ORDERS } from '../data/orders';
import { MOCK_EXCEPTIONS } from '../data/exceptions';
import { DEFAULT_SETTINGS } from '../types/settings';

let isSeedingInProgress = false;

export async function seedFirestoreIfEmpty(): Promise<boolean> {
  // 1. Ensure authenticated session is active first
  await ensureFirebaseSession();
  if (!db) {
    return false;
  }

  if (isSeedingInProgress) {
    return false;
  }

  try {
    isSeedingInProgress = true;

    // Check if inventory collection has any documents
    const invRef = collection(db, 'inventory');
    const invSnap = await getDocs(query(invRef, limit(1)));

    if (!invSnap.empty) {
      // Data is already seeded; avoid re-seeding
      return false;
    }

    console.info('[WAREFLOW Seeder] Empty Firestore database detected. Seeding baseline operational data...');
    const batch = writeBatch(db);

    // 1. Seed Products
    MOCK_PRODUCTS.forEach((product) => {
      const prodDoc = doc(db!, 'products', product.sku);
      batch.set(prodDoc, product, { merge: true });
    });

    // 2. Seed Inventory
    MOCK_INVENTORY.forEach((item) => {
      const invDoc = doc(db!, 'inventory', item.id);
      batch.set(invDoc, item, { merge: true });
    });

    // 3. Seed Orders
    MOCK_ORDERS.forEach((order) => {
      const orderDoc = doc(db!, 'orders', order.id);
      batch.set(orderDoc, order, { merge: true });
    });

    // 4. Seed Exceptions
    MOCK_EXCEPTIONS.forEach((exception) => {
      const excDoc = doc(db!, 'exceptions', exception.id);
      batch.set(excDoc, exception, { merge: true });
    });

    // 5. Seed Settings
    const settingsDoc = doc(db!, 'settings', 'facility');
    batch.set(settingsDoc, DEFAULT_SETTINGS, { merge: true });

    await batch.commit();
    console.info('[WAREFLOW Seeder] Successfully seeded initial warehouse data into Firestore.');
    return true;
  } catch (err) {
    console.error('[WAREFLOW Firebase] Notice during data check/seeding:', err);
    return false;
  } finally {
    isSeedingInProgress = false;
  }
}

