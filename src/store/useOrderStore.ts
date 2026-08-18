import { create } from 'zustand';
import { Order, OrderStatus, OrderPriority } from '../types/order';
import { MOCK_ORDERS } from '../data/orders';
import { orderService } from '../services/orderService';

interface OrderState {
  orders: Order[];
  selectedOrderId: string | null;
  searchQuery: string;
  statusFilter: OrderStatus | 'ALL';
  priorityFilter: OrderPriority | 'ALL';
  channelFilter: string | 'ALL';
  isLoading: boolean;
  error: string | null;

  // Actions
  initOrders: () => Promise<void>;
  setSelectedOrderId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: OrderStatus | 'ALL') => void;
  setPriorityFilter: (priority: OrderPriority | 'ALL') => void;
  setChannelFilter: (channel: string | 'ALL') => void;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  reallocateOrderStock: (orderId: string, allocations: { sku: string; allocated: number }[]) => Promise<void>;
  resetOrders: () => Promise<void>;
  getFilteredOrders: () => Order[];
  getOrderById: (id: string) => Order | undefined;
}

let isOrdersSubscribed = false;

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: MOCK_ORDERS,
  selectedOrderId: null,
  searchQuery: '',
  statusFilter: 'ALL',
  priorityFilter: 'ALL',
  channelFilter: 'ALL',
  isLoading: false,
  error: null,

  initOrders: async () => {
    if (isOrdersSubscribed) return;
    set({ isLoading: true, error: null });

    try {
      // 1. Initial fetch
      const loadedOrders = await orderService.getOrders();
      set({ orders: loadedOrders, isLoading: false });

      // 2. Real-time subscription
      isOrdersSubscribed = true;
      orderService.subscribeOrders(
        (updatedOrders) => {
          set({ orders: updatedOrders });
        },
        (appErr) => {
          set({ error: appErr.message });
        }
      );
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Unable to load orders.' });
    }
  },

  setSelectedOrderId: (id) => set({ selectedOrderId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setChannelFilter: (channel) => set({ channelFilter: channel }),

  addOrder: async (order) => {
    // 1. Write to Firestore
    await orderService.createOrder(order);

    // 2. Optimistic local update
    set((state) => ({
      orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
    }));
  },

  updateOrderStatus: async (orderId, status, note) => {
    const { orders } = get();
    // 1. Optimistic update
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          status,
          timeline: [
            ...order.timeline,
            {
              status,
              timestamp: new Date().toISOString(),
              note: note || `Status advanced to ${status}`,
              actor: 'Marcus Vance (Ops Manager)',
            },
          ],
        };
      }
      return order;
    });

    set({ orders: updated });
    await orderService.updateOrderStatus(orderId, status, note, orders);
  },

  reallocateOrderStock: async (orderId, allocations) => {
    const { orders } = get();
    const updated = orders.map((order) => {
      if (order.id === orderId) {
        const updatedItems = order.items.map((item) => {
          const alloc = allocations.find((a) => a.sku === item.sku);
          if (alloc) {
            return { ...item, quantityAllocated: alloc.allocated };
          }
          return item;
        });
        return { ...order, items: updatedItems };
      }
      return order;
    });

    set({ orders: updated });
    await orderService.reallocateOrderStock(orderId, allocations, orders);
  },

  resetOrders: async () => {
    await orderService.resetOrders();
    set({ orders: MOCK_ORDERS });
  },

  getFilteredOrders: () => {
    const { orders, searchQuery, statusFilter, priorityFilter, channelFilter } = get();

    return orders.filter((order) => {
      if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && order.priority !== priorityFilter) return false;
      if (channelFilter !== 'ALL' && order.channel !== channelFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesCustomer =
          order.customer.name.toLowerCase().includes(q) ||
          (order.customer.company && order.customer.company.toLowerCase().includes(q));
        const matchesRef = order.externalReference?.toLowerCase().includes(q);
        const matchesSku = order.items.some((i) => i.sku.toLowerCase().includes(q));

        return matchesId || matchesCustomer || matchesRef || matchesSku;
      }
      return true;
    });
  },

  getOrderById: (id: string) => {
    return get().orders.find((order) => order.id === id);
  },
}));
