import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  GitMerge,
  PackageCheck,
  Box,
  Truck,
  AlertTriangle,
  BarChart3,
  X,
  Layers,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { NAVIGATION_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

export function MobileNav() {
  const { isMobileNavOpen, setMobileNavOpen } = useUIStore();
  const location = useLocation();
  const { orders } = useOrderStore();
  const { exceptions } = useExceptionStore();

  const activeExceptionsCount = exceptions.filter((e) => e.status !== 'RESOLVED').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'DISPATCHED').length;
  const pickingCount = orders.filter((o) => o.status === 'PICKING').length;
  const dispatchCount = orders.filter((o) => o.status === 'READY_TO_DISPATCH').length;

  const badgeCounts: Record<string, number> = {
    ordersCount: activeOrdersCount,
    exceptionsCount: activeExceptionsCount,
    pickingCount: pickingCount,
    dispatchCount: dispatchCount,
  };

  const iconMap: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
    ShoppingCart: <ShoppingCart className="w-4 h-4" />,
    Boxes: <Boxes className="w-4 h-4" />,
    GitMerge: <GitMerge className="w-4 h-4" />,
    PackageCheck: <PackageCheck className="w-4 h-4" />,
    Box: <Box className="w-4 h-4" />,
    Truck: <Truck className="w-4 h-4" />,
    AlertTriangle: <AlertTriangle className="w-4 h-4" />,
    BarChart3: <BarChart3 className="w-4 h-4" />,
  };

  return (
    <AnimatePresence>
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative flex flex-col w-4/5 max-w-xs h-full bg-surface border-r border-border shadow-modal z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-foreground">WAREFLOW</span>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1 rounded-md text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links List */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {NAVIGATION_CONFIG.map((group) => (
                <div key={group.label} className="space-y-1">
                  <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-foreground-tertiary">
                    {group.label}
                  </h4>
                  <div className="space-y-1 mt-1">
                    {group.items.map((item) => {
                      const isActive = location.pathname.startsWith(item.href);
                      const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : undefined;

                      return (
                        <NavLink
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={cn(
                            'flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all',
                            isActive
                              ? 'bg-primary-50 text-primary-700 font-semibold'
                              : 'text-foreground-secondary hover:bg-surface-subtle hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={isActive ? 'text-primary-600' : 'text-foreground-secondary'}>
                              {iconMap[item.iconName]}
                            </span>
                            <span>{item.title}</span>
                          </div>

                          {badgeCount !== undefined && badgeCount > 0 && (
                            <span
                              className={cn(
                                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                                item.badgeKey === 'exceptionsCount'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-gray-100 text-gray-700'
                              )}
                            >
                              {badgeCount}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer */}
            <div className="p-4 border-t border-border space-y-1 bg-surface-subtle/50 shrink-0">
              <NavLink
                to="/settings"
                onClick={() => setMobileNavOpen(false)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-subtle"
              >
                <Settings className="w-4 h-4" />
                <span>Facility Settings</span>
              </NavLink>
              <NavLink
                to="/help"
                onClick={() => setMobileNavOpen(false)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-subtle"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help & Documentation</span>
              </NavLink>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
