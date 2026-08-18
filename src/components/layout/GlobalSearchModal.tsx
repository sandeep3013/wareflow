import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Boxes,
  MapPin,
  AlertTriangle,
  ArrowRight,
  X,
  Sparkles,
  Zap,
  Navigation,
  BarChart3,
  GitMerge,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { Modal } from '../ui/modal';

export function GlobalSearchModal() {
  const { isSearchModalOpen, setSearchModalOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { orders } = useOrderStore();
  const { inventory } = useInventoryStore();
  const { exceptions } = useExceptionStore();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(!isSearchModalOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setSearchModalOpen]);

  const q = query.trim().toLowerCase();

  const quickActions = [
    {
      id: 'act-1',
      title: 'Triage Critical Exceptions',
      desc: 'Resolve ORD-1042 stock shortage & inventory contention',
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" />,
      path: '/exceptions',
    },
    {
      id: 'act-2',
      title: 'Start Wave Picking Route',
      desc: 'Launch optimized serpentine floor route P-07',
      icon: <Navigation className="w-3.5 h-3.5 text-amber-600" />,
      path: '/picking',
    },
    {
      id: 'act-3',
      title: 'Run Stock Allocation Engine',
      desc: 'Process queued batch reservations and FIFO assignments',
      icon: <GitMerge className="w-3.5 h-3.5 text-blue-600" />,
      path: '/allocation',
    },
    {
      id: 'act-4',
      title: 'Inspect Zone Congestion Heatmap',
      desc: 'Check Zone B pick speed variance & rebalance floor staff',
      icon: <BarChart3 className="w-3.5 h-3.5 text-purple-600" />,
      path: '/analytics',
    },
  ];

  const matchedActions = q
    ? quickActions.filter(
        (a) => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)
      )
    : quickActions;

  const matchedOrders = q
    ? orders
        .filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.customer.name.toLowerCase().includes(q) ||
            (o.customer.company && o.customer.company.toLowerCase().includes(q))
        )
        .slice(0, 4)
    : orders.slice(0, 3);

  const matchedInventory = q
    ? inventory
        .filter(
          (i) =>
            i.sku.toLowerCase().includes(q) ||
            i.productName.toLowerCase().includes(q) ||
            i.location.binId.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : inventory.slice(0, 3);

  const matchedExceptions = q
    ? exceptions
        .filter(
          (e) =>
            e.id.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q) ||
            (e.orderId && e.orderId.toLowerCase().includes(q)) ||
            (e.sku && e.sku.toLowerCase().includes(q))
        )
        .slice(0, 3)
    : exceptions.slice(0, 2);

  const handleSelect = (path: string) => {
    setSearchModalOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <Modal
      isOpen={isSearchModalOpen}
      onClose={() => {
        setSearchModalOpen(false);
        setQuery('');
      }}
      maxWidth="xl"
      showCloseButton={false}
    >
      <div className="-m-6">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border bg-surface">
          <label htmlFor="global-search-modal-input" className="sr-only">
            Search WAREFLOW Operations
          </label>
          <Search className="w-4 h-4 text-foreground-secondary shrink-0 mr-2" />
          <input
            id="global-search-modal-input"
            name="globalSearchQuery"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search orders (ORD-1042), SKUs, Bins..."
            className="w-full h-12 text-sm bg-transparent outline-none placeholder:text-foreground-tertiary"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-foreground-secondary hover:text-foreground"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 text-xs">
          {/* Quick Command Actions */}
          {matchedActions.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 px-2 mb-1.5">
                <Zap className="w-3 h-3" />
                <span>Operational Commands & Actions</span>
              </div>
              <div className="space-y-1">
                {matchedActions.map((action) => (
                  <div
                    key={action.id}
                    onClick={() => handleSelect(action.path)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-indigo-50/50 transition-colors cursor-pointer group border border-transparent hover:border-indigo-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 rounded bg-surface-subtle border border-border group-hover:bg-white group-hover:border-indigo-300">
                        {action.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-xs">{action.title}</div>
                        <div className="text-[11px] text-foreground-secondary">{action.desc}</div>
                      </div>
                    </div>
                    <kbd className="text-[10px] font-mono text-foreground-tertiary group-hover:text-indigo-600">
                      Jump →
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Section */}
          {matchedOrders.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-tertiary px-2 mb-1.5">
                <ShoppingCart className="w-3 h-3" />
                <span>Orders</span>
              </div>
              <div className="space-y-1">
                {matchedOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleSelect(`/orders/${order.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                        {order.id}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          {order.customer.company || order.customer.name}
                        </div>
                        <div className="text-[11px] text-foreground-secondary">
                          {order.items.length} items • ${order.totalValue.toFixed(2)} • {order.status}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-foreground-tertiary group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Section */}
          {matchedInventory.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-tertiary px-2 mb-1.5">
                <Boxes className="w-3 h-3" />
                <span>Inventory & SKUs</span>
              </div>
              <div className="space-y-1">
                {matchedInventory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(`/inventory/${item.sku}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {item.sku}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-foreground truncate max-w-sm">
                          {item.productName}
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-foreground-secondary">
                          <span className="inline-flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5 text-foreground-tertiary" />
                            {item.location.binId}
                          </span>
                          <span>•</span>
                          <span>{item.quantityOnHand} on hand ({item.quantityAvailable} avail)</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-foreground-tertiary group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exceptions Section */}
          {matchedExceptions.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 px-2 mb-1.5">
                <AlertTriangle className="w-3 h-3" />
                <span>Operational Exceptions</span>
              </div>
              <div className="space-y-1">
                {matchedExceptions.map((exc) => (
                  <div
                    key={exc.id}
                    onClick={() => handleSelect('/exceptions')}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-rose-50/50 transition-colors cursor-pointer group border border-transparent hover:border-rose-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {exc.id}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-foreground truncate max-w-sm">
                          {exc.title}
                        </div>
                        <div className="text-[11px] text-foreground-secondary">
                          {exc.type} • Severity: {exc.severity}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-foreground-tertiary group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle border-t border-border text-[11px] text-foreground-secondary">
          <div className="flex items-center space-x-3">
            <span><kbd className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-border">↑↓</kbd> to navigate</span>
            <span><kbd className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-border">ESC</kbd> to close</span>
          </div>
          <span className="font-mono font-bold text-indigo-700">WAREFLOW Command Palette</span>
        </div>
      </div>
    </Modal>
  );
}
