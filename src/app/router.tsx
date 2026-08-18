import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { OrdersPage } from '../features/orders/OrdersPage';
import { OrderDetailPage } from '../features/orders/OrderDetailPage';
import { InventoryPage } from '../features/inventory/InventoryPage';
import { SkuDetailPage } from '../features/inventory/SkuDetailPage';
import { AllocationPage } from '../features/allocation/AllocationPage';
import { PickingPage } from '../features/picking/PickingPage';
import { PackingPage } from '../features/packing/PackingPage';
import { DispatchPage } from '../features/dispatch/DispatchPage';
import { ExceptionsPage } from '../features/exceptions/ExceptionsPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { HelpPage } from '../features/help/HelpPage';
import { NotFoundPage } from '../features/not-found/NotFoundPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: <DashboardPage />,
        },
        {
          path: 'orders',
          element: <OrdersPage />,
        },
        {
          path: 'orders/:orderId',
          element: <OrderDetailPage />,
        },
        {
          path: 'inventory',
          element: <InventoryPage />,
        },
        {
          path: 'inventory/:sku',
          element: <SkuDetailPage />,
        },
        {
          path: 'allocation',
          element: <AllocationPage />,
        },
        {
          path: 'picking',
          element: <PickingPage />,
        },
        {
          path: 'packing',
          element: <PackingPage />,
        },
        {
          path: 'dispatch',
          element: <DispatchPage />,
        },
        {
          path: 'exceptions',
          element: <ExceptionsPage />,
        },
        {
          path: 'analytics',
          element: <AnalyticsPage />,
        },
        {
          path: 'settings',
          element: <SettingsPage />,
        },
        {
          path: 'help',
          element: <HelpPage />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);
