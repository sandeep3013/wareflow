export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badgeKey?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    label: 'COMMAND CENTER',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        iconName: 'LayoutDashboard',
      },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      {
        title: 'Orders',
        href: '/orders',
        iconName: 'ShoppingCart',
        badgeKey: 'ordersCount',
      },
      {
        title: 'Inventory',
        href: '/inventory',
        iconName: 'Boxes',
      },
      {
        title: 'Allocation',
        href: '/allocation',
        iconName: 'GitMerge',
      },
      {
        title: 'Picking',
        href: '/picking',
        iconName: 'PackageCheck',
        badgeKey: 'pickingCount',
      },
      {
        title: 'Packing',
        href: '/packing',
        iconName: 'Box',
      },
      {
        title: 'Dispatch',
        href: '/dispatch',
        iconName: 'Truck',
        badgeKey: 'dispatchCount',
      },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      {
        title: 'Exceptions',
        href: '/exceptions',
        iconName: 'AlertTriangle',
        badgeKey: 'exceptionsCount',
      },
      {
        title: 'Analytics',
        href: '/analytics',
        iconName: 'BarChart3',
      },
    ],
  },
];

export const WAREHOUSES = [
  { id: 'wh-alpha', code: 'ORD-1', name: 'Chicago Central Fulfilment (Alpha)', city: 'Chicago, IL' },
  { id: 'wh-beta', code: 'DFW-2', name: 'Dallas Cross-Dock Logistics (Beta)', city: 'Dallas, TX' },
  { id: 'wh-gamma', code: 'ATL-1', name: 'Atlanta Omni Logistics (Gamma)', city: 'Atlanta, GA' },
];

export const CURRENT_USER = {
  id: 'usr-001',
  name: 'Marcus Vance',
  role: 'Warehouse Operations Manager',
  email: 'marcus.vance@wareflow.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  shift: 'Day Shift (07:00 - 15:30)',
};
