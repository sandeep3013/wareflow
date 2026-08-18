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
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Layers,
  Activity,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { NAVIGATION_CONFIG } from '../../lib/constants';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const { orders } = useOrderStore();
  const { exceptions } = useExceptionStore();

  const activeExceptionsCount = exceptions.filter((e) => e.status !== 'RESOLVED').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'DISPATCHED').length;
  const pickingCount = orders.filter((o) => o.status === 'PICKING' || o.status === 'ALLOCATED').length;
  const dispatchCount = orders.filter((o) => o.status === 'READY_TO_DISPATCH').length;

  const badgeCounts: Record<string, number> = {
    ordersCount: activeOrdersCount,
    exceptionsCount: activeExceptionsCount,
    pickingCount: pickingCount,
    dispatchCount: dispatchCount,
  };

  const iconMap: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    ShoppingCart: <ShoppingCart className="w-4 h-4 shrink-0" />,
    Boxes: <Boxes className="w-4 h-4 shrink-0" />,
    GitMerge: <GitMerge className="w-4 h-4 shrink-0" />,
    PackageCheck: <PackageCheck className="w-4 h-4 shrink-0" />,
    Box: <Box className="w-4 h-4 shrink-0" />,
    Truck: <Truck className="w-4 h-4 shrink-0" />,
    AlertTriangle: <AlertTriangle className="w-4 h-4 shrink-0" />,
    BarChart3: <BarChart3 className="w-4 h-4 shrink-0" />,
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-[#1E293B] bg-[#0B0F19] text-gray-300 select-none transition-all duration-200 z-30 h-full shrink-0',
        isSidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-3.5 border-b border-[#1E293B] shrink-0">
        <NavLink to="/dashboard" className="flex items-center space-x-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shrink-0 font-bold tracking-wider">
            <Layers className="w-4 h-4 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs tracking-wider text-white">WAREFLOW</span>
              <span className="text-[9px] text-indigo-400 font-semibold tracking-widest uppercase">
                INTELLIGENT OPS
              </span>
            </div>
          )}
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-gray-400 hover:bg-[#161F30] hover:text-white transition-colors"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Live System Status Pill */}
      {!isSidebarCollapsed && (
        <div className="px-3 pt-3 shrink-0">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#111827] border border-[#1E293B] text-[10px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online
            </span>
            <span className="font-mono text-gray-400">v2.4.0</span>
          </div>
        </div>
      )}

      {/* Navigation Links (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAVIGATION_CONFIG.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isSidebarCollapsed ? (
              <h4 className="px-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                {group.label}
              </h4>
            ) : (
              <div className="h-px bg-[#1E293B] my-2 mx-1" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : undefined;

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    title={isSidebarCollapsed ? item.title : undefined}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all group relative',
                      isActive
                        ? 'bg-indigo-600/20 text-white font-semibold border border-indigo-500/30'
                        : 'text-gray-400 hover:bg-[#161F30] hover:text-gray-100'
                    )}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className={cn(
                          'transition-colors',
                          isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-200'
                        )}
                      >
                        {iconMap[item.iconName]}
                      </span>
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </div>

                    {!isSidebarCollapsed && badgeCount !== undefined && badgeCount > 0 && (
                      <span
                        className={cn(
                          'text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums',
                          item.badgeKey === 'exceptionsCount'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isActive
                              ? 'bg-indigo-500/30 text-indigo-200'
                              : 'bg-[#1E293B] text-gray-400'
                        )}
                      >
                        {badgeCount}
                      </span>
                    )}

                    {/* Left active line accent */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-r" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Section */}
      <div className="p-2 border-t border-[#1E293B] space-y-0.5 shrink-0">
        <NavLink
          to="/analytics"
          className={cn(
            'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
            location.pathname === '/analytics'
              ? 'bg-indigo-600/20 text-white font-semibold'
              : 'text-gray-400 hover:bg-[#161F30] hover:text-gray-200'
          )}
          title={isSidebarCollapsed ? 'Live Telemetry' : undefined}
        >
          <Activity className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {!isSidebarCollapsed && <span>Live Telemetry</span>}
        </NavLink>

        <NavLink
          to="/settings"
          className={cn(
            'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
            location.pathname === '/settings'
              ? 'bg-indigo-600/20 text-white font-semibold'
              : 'text-gray-400 hover:bg-[#161F30] hover:text-gray-200'
          )}
          title={isSidebarCollapsed ? 'Facility Settings' : undefined}
        >
          <Settings className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {!isSidebarCollapsed && <span>Settings</span>}
        </NavLink>

        <NavLink
          to="/help"
          className={cn(
            'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
            location.pathname === '/help'
              ? 'bg-indigo-600/20 text-white font-semibold'
              : 'text-gray-400 hover:bg-[#161F30] hover:text-gray-200'
          )}
          title={isSidebarCollapsed ? 'Help & Documentation' : undefined}
        >
          <HelpCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {!isSidebarCollapsed && <span>Help & Docs</span>}
        </NavLink>
      </div>
    </aside>
  );
}
