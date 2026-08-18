import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { ensureFirebaseSession } from '../../lib/firebase';
import { seedFirestoreIfEmpty } from '../../services/seedService';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { useSettingsStore } from '../../store/useSettingsStore';

interface SplashScreenProps {
  children: React.ReactNode;
}

export function SplashScreen({ children }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(() => {
    return !sessionStorage.getItem('wareflow_splash_shown');
  });
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing Operations Engine...');
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const runBootSequence = useCallback(async () => {
    setHasError(false);
    setIsRetrying(false);

    try {
      // Step 1: Initializing Operations Engine (15%)
      setProgress(15);
      setStatusText('Initializing Operations Engine...');
      await new Promise((r) => setTimeout(r, 120));

      // Step 2: Connecting to facility data & Anonymous Authentication (40%)
      setProgress(40);
      setStatusText('Connecting to facility data...');
      await ensureFirebaseSession();

      // Step 3: Verifying operational records & Seed check (65%)
      setProgress(65);
      setStatusText('Verifying operational records...');
      await seedFirestoreIfEmpty();

      // Step 4: Loading warehouse intelligence into reactive stores (90%)
      setProgress(90);
      setStatusText('Loading warehouse intelligence...');
      await Promise.all([
        useInventoryStore.getState().initInventory(),
        useOrderStore.getState().initOrders(),
        useExceptionStore.getState().initExceptions(),
        useSettingsStore.getState().initSettings(),
      ]);

      // Step 5: Ready (100%)
      setProgress(100);
      setStatusText('Ready.');

      await new Promise((r) => setTimeout(r, 300));
      sessionStorage.setItem('wareflow_splash_shown', 'true');
      setIsVisible(false);
    } catch (err) {
      console.error('[WAREFLOW Firebase] Boot sequence exception:', err);
      // Fallback: still initialize local stores so app doesn't freeze
      try {
        await Promise.all([
          useInventoryStore.getState().initInventory(),
          useOrderStore.getState().initOrders(),
          useExceptionStore.getState().initExceptions(),
          useSettingsStore.getState().initSettings(),
        ]);
        setProgress(100);
        setStatusText('Ready.');
        setTimeout(() => {
          sessionStorage.setItem('wareflow_splash_shown', 'true');
          setIsVisible(false);
        }, 300);
      } catch {
        setHasError(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isVisible) {
      // Background boot if splash already shown in this tab session
      (async () => {
        try {
          await ensureFirebaseSession();
          await seedFirestoreIfEmpty();
          useInventoryStore.getState().initInventory();
          useOrderStore.getState().initOrders();
          useExceptionStore.getState().initExceptions();
          useSettingsStore.getState().initSettings();
        } catch (e) {
          console.error('[WAREFLOW Firebase] Background boot notice:', e);
        }
      })();
      return;
    }

    runBootSequence();
  }, [isVisible, runBootSequence]);

  const handleRetry = () => {
    setIsRetrying(true);
    runBootSequence();
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0F19] text-white select-none px-6"
          >
            {/* Ambient Background Glow */}
            <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col items-center max-w-sm w-full text-center space-y-6">
              {/* Animated Glowing Logo */}
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md -z-10 animate-pulse" />
              </div>

              {/* Title & Brand Identity */}
              <div className="space-y-1.5">
                <h1 className="text-xl font-bold tracking-wider text-white">WAREFLOW</h1>
                <p className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">
                  INTELLIGENT WAREHOUSE OPERATIONS
                </p>
              </div>

              {hasError ? (
                /* Error Recovery State */
                <div className="w-full space-y-3 pt-2">
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Unable to connect to operational data</span>
                  </div>
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>Retry</span>
                  </button>
                </div>
              ) : (
                /* Progress Bar & Status Text */
                <div className="w-full space-y-2 pt-2">
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full"
                      initial={{ width: '15%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>{statusText}</span>
                    <span className="font-bold text-indigo-300">{progress}%</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Application */}
      {children}
    </>
  );
}
