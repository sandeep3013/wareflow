import { create } from 'zustand';
import { NotificationItem } from '../types/analytics';
import { MOCK_NOTIFICATIONS } from '../data/analytics';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  isSearchModalOpen: boolean;
  isNotificationDrawerOpen: boolean;
  isQuickActionModalOpen: boolean;
  notifications: NotificationItem[];
  toasts: ToastMessage[];

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  setQuickActionModalOpen: (open: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  isMobileNavOpen: false,
  isSearchModalOpen: false,
  isNotificationDrawerOpen: false,
  isQuickActionModalOpen: false,
  notifications: MOCK_NOTIFICATIONS,
  toasts: [],

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),
  setNotificationDrawerOpen: (open) => set({ isNotificationDrawerOpen: open }),
  setQuickActionModalOpen: (open) => set({ isQuickActionModalOpen: open }),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearNotifications: () => set({ notifications: [] }),

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
