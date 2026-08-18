import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X, AlertCircle, AlertTriangle, Activity, Info, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { formatRelativeTime } from '../../lib/formatters';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function NotificationDrawer() {
  const {
    isNotificationDrawerOpen,
    setNotificationDrawerOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useUIStore();

  const navigate = useNavigate();

  const icons = {
    CRITICAL: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    WARNING: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    BOTTLENECK: <Activity className="w-4 h-4 text-purple-600 shrink-0" />,
    INFO: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
  };

  const handleNotificationClick = (actionHref?: string, id?: string) => {
    if (id) markNotificationAsRead(id);
    if (actionHref) {
      setNotificationDrawerOpen(false);
      navigate(actionHref);
    }
  };

  return (
    <AnimatePresence>
      {isNotificationDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-y-0 right-0 max-w-sm w-full bg-surface border-l border-border shadow-modal flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-primary-600" />
                <h3 className="text-sm font-semibold text-foreground">Operational Alerts</h3>
              </div>
              <div className="flex items-center space-x-1">
                {notifications.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={markAllNotificationsAsRead}
                      leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
                    >
                      Read
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={clearNotifications}
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Clear
                    </Button>
                  </>
                )}
                <button
                  onClick={() => setNotificationDrawerOpen(false)}
                  className="p-1 rounded-md text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-xs text-foreground-secondary">
                  No active operational notifications.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.actionHref, n.id)}
                    className={cn(
                      'p-3 rounded-lg border transition-all cursor-pointer space-y-1',
                      n.read
                        ? 'bg-surface border-border/70 opacity-75'
                        : 'bg-primary-50/20 border-primary-200 shadow-subtle hover:border-primary-400'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {icons[n.type]}
                        <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                          {n.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-foreground-tertiary">
                        {formatRelativeTime(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary leading-relaxed pl-6">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
