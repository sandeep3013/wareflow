import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDrawer } from './NotificationDrawer';
import { QuickActionModal } from './QuickActionModal';
import { ToastContainer } from '../ui/toast';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function AppShell() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-indigo-100 selection:text-indigo-900">
      {/* Desktop Persistent Left Dark Sidebar */}
      <Sidebar />

      {/* Mobile Slide-Out Drawer */}
      <MobileNav />

      {/* Main Content Workspace Column */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Global Fixed Application Header */}
        <Header />

        {/* Independently Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 lg:p-7 max-w-[1536px] w-full mx-auto">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className="w-full min-h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <GlobalSearchModal />
      <NotificationDrawer />
      <QuickActionModal />
      <ToastContainer />
    </div>
  );
}
