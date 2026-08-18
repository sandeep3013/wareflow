import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';
import { initFirebase } from '../../lib/firebase';
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
  const [statusText, setStatusText] = useState('Initializing telemetry runtime...');

  useEffect(() => {
    if (!isVisible) {
      // Background boot if splash already shown in this tab session
      (async () => {
        await initFirebase();
        await seedFirestoreIfEmpty();
        useInventoryStore.getState().initInventory();
        useOrderStore.getState().initOrders();
        useExceptionStore.getState().initExceptions();
        useSettingsStore.getState().initSettings();
      })();
      return;
    }

    let isMounted = true;

    const bootApp = async () => {
      try {
        if (isMounted) {
          setProgress(30);
          setStatusText('Connecting to Firestore cloud engine...');
        }

        // 1. Initialize Firebase & Auth
        await initFirebase();

        if (isMounted) {
          setProgress(60);
          setStatusText('Synchronizing facility inventory & order streams...');
        }

        // 2. Idempotent seed check
        await seedFirestoreIfEmpty();

        // 3. Initialize Stores
        await Promise.all([
          useInventoryStore.getState().initInventory(),
          useOrderStore.getState().initOrders(),
          useExceptionStore.getState().initExceptions(),
          useSettingsStore.getState().initSettings(),
        ]);

        if (isMounted) {
          setProgress(95);
          setStatusText('WAREFLOW v2.4 Intelligent Ops Ready');
        }

        await new Promise((resolve) => setTimeout(resolve, 350));
      } catch (err) {
        console.warn('[WAREFLOW Boot Notice]', err);
      } finally {
        if (isMounted) {
          setProgress(100);
          setTimeout(() => {
            sessionStorage.setItem('wareflow_splash_shown', 'true');
            setIsVisible(false);
          }, 300);
        }
      }
    };

    bootApp();

    return () => {
      isMounted = false;
    };
  }, [isVisible]);

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

              {/* Progress Bar & Status Text */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Application */}
      {children}
    </>
  );
}
