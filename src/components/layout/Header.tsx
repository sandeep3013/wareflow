import { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  Plus,
  Menu,
  Check,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useWarehouseStore } from '../../store/useWarehouseStore';
import { Button } from '../ui/button';
import { ProfileDropdown } from './ProfileDropdown';
import { cn } from '../../lib/utils';

export function Header() {
  const {
    setMobileNavOpen,
    setSearchModalOpen,
    setNotificationDrawerOpen,
    setQuickActionModalOpen,
    notifications,
  } = useUIStore();

  const { currentWarehouseId, warehouses, setWarehouse } = useWarehouseStore();
  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);

  const activeWarehouse = warehouses.find((w) => w.id === currentWarehouseId) || warehouses[0];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-border bg-white/95 backdrop-blur-md px-4 sm:px-6 shrink-0">
      {/* Left Area: Mobile Menu Toggle + Global Search Trigger */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden p-1.5 rounded-md text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Trigger for Search Modal) */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center justify-between w-full max-w-sm h-8 px-3 rounded-md border border-border bg-[#F8FAFC] text-foreground-secondary hover:bg-white hover:border-gray-300 text-xs transition-all shadow-subtle group"
          aria-label="Search orders, SKUs, bins"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-foreground-tertiary group-hover:text-foreground-secondary transition-colors" />
            <span className="text-foreground-secondary font-normal">Search orders, SKUs, bins...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-white px-1.5 py-0.2 text-[10px] font-mono font-medium text-foreground-secondary shadow-xs">
            <span>Ctrl</span><span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right Area: Facility Live Indicator, Warehouse Switcher, Quick Action, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Subtle Live Facility Telemetry Indicator */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Facility Live</span>
          <span className="text-emerald-400 font-normal">·</span>
          <span className="font-semibold text-emerald-900">{activeWarehouse.code} ({activeWarehouse.city.split(',')[0]})</span>
        </div>

        {/* Warehouse Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen)}
            className="flex items-center space-x-1.5 h-8 px-2.5 rounded-md border border-border bg-white hover:bg-surface-subtle text-xs font-medium text-foreground transition-colors shadow-subtle"
            aria-expanded={isWarehouseDropdownOpen}
            aria-label="Select facility"
          >
            <Building2 className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span className="font-semibold">{activeWarehouse.code}</span>
            <ChevronDown className="w-3 h-3 text-foreground-secondary ml-0.5" />
          </button>

          {isWarehouseDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsWarehouseDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-64 rounded-lg border border-border bg-white shadow-dropdown py-1.5 z-40">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-tertiary">
                  Switch Active Facility
                </div>
                {warehouses.map((wh) => (
                  <button
                    key={wh.id}
                    onClick={() => {
                      setWarehouse(wh.id);
                      setIsWarehouseDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors hover:bg-surface-subtle',
                      wh.id === currentWarehouseId
                        ? 'font-semibold text-primary-700 bg-primary-50/60'
                        : 'text-foreground'
                    )}
                  >
                    <div>
                      <div className="font-medium text-foreground">{wh.name}</div>
                      <div className="text-[11px] text-foreground-secondary">{wh.city}</div>
                    </div>
                    {wh.id === currentWarehouseId && (
                      <Check className="w-4 h-4 text-primary-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Action Button */}
        <Button
          size="sm"
          variant="primary"
          onClick={() => setQuickActionModalOpen(true)}
          className="hidden sm:inline-flex h-8 px-2.5 text-xs gap-1 font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Action</span>
        </Button>

        {/* Notification Bell with Badge */}
        <button
          onClick={() => setNotificationDrawerOpen(true)}
          className="relative p-2 rounded-md text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-sm animate-pulse-subtle">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar / Dropdown Button */}
        <div className="pl-1 border-l border-border">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
