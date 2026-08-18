import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types/order';
import { handleFirebaseError, AppError } from './errorService';
import { MOCK_ORDERS } from '../data/orders';

const STORAGE_KEY_ORDERS = 'wareflow_local_orders_v2';

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_ORDERS;
}

function setLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch {}
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    if (!db) return getLocalOrders();

    try {
      const snap = await getDocs(collection(db, 'orders'));
      if (snap.empty) return getLocalOrders();
      const orders = snap.docs.map((d) => d.data() as Order);
      setLocalOrders(orders);
      return orders;
    } catch (err) {
      handleFirebaseError(err, 'Orders Fetch');
      return getLocalOrders();
    }
  },

  subscribeOrders(
    onData: (orders: Order[]) => void,
    onError?: (error: AppError) => void
  ): Unsubscribe {
    if (!db) {
      onData(getLocalOrders());
      return () => {};
    }

    try {
      const q = query(collection(db, 'orders'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const orders = snapshot.docs.map((d) => d.data() as Order);
            setLocalOrders(orders);
            onData(orders);
          }
        },
        (err) => {
          const appErr = handleFirebaseError(err, 'Orders Stream');
          if (onError) onError(appErr);
          onData(getLocalOrders());
        }
      );
    } catch {
      onData(getLocalOrders());
      return () => {};
    }
  },

  async createOrder(order: Order): Promise<void> {
    const current = getLocalOrders();
    setLocalOrders([order, ...current.filter((o) => o.id !== order.id)]);

    if (db) {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await setDoc(orderRef, order);
      } catch (err) {
        handleFirebaseError(err, 'Create Order Cloud Sync');
      }
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    currentOrders?: Order[]
  ): Promise<void> {
    const orders = currentOrders || getLocalOrders();
    const targetOrder = orders.find((o) => o.id === orderId);
    const now = new Date().toISOString();

    const newTimelineItem = {
      status,
      timestamp: now,
      note: note || `Status advanced to ${status}`,
      actor: 'Marcus Vance (Ops Manager)',
    };

    const updatedTimeline = targetOrder
      ? [...targetOrder.timeline, newTimelineItem]
      : [newTimelineItem];

    const updated = orders.map((o) => (o.id === orderId ? { ...o, status, timeline: updatedTimeline } : o));
    setLocalOrders(updated);

    if (db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          status,
          timeline: updatedTimeline,
        });
      } catch (err) {
        handleFirebaseError(err, 'Update Order Status Cloud Sync');
      }
    }
  },

  async reallocateOrderStock(
    orderId: string,
    allocations: { sku: string; allocated: number }[],
    currentOrders: Order[]
  ): Promise<void> {
    const targetOrder = currentOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const updatedItems = targetOrder.items.map((item) => {
      const alloc = allocations.find((a) => a.sku === item.sku);
      if (alloc) {
        return { ...item, quantityAllocated: alloc.allocated };
      }
      return item;
    });

    const updated = currentOrders.map((o) => (o.id === orderId ? { ...o, items: updatedItems } : o));
    setLocalOrders(updated);

    if (db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          items: updatedItems,
        });
      } catch (err) {
        handleFirebaseError(err, 'Reallocate Order Stock Cloud Sync');
      }
    }
  },

  async resetOrders(): Promise<void> {
    setLocalOrders(MOCK_ORDERS);

    if (db) {
      try {
        const batch = writeBatch(db);
        MOCK_ORDERS.forEach((order) => {
          const orderDoc = doc(db!, 'orders', order.id);
          batch.set(orderDoc, order, { merge: true });
        });
        await batch.commit();
      } catch (err) {
        handleFirebaseError(err, 'Reset Orders Cloud Sync');
      }
    }
  },
};
