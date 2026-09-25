'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { offlineSyncEngine, OfflineSubmission, OfflineSyncStatus } from '../lib/offline-sync';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isStandalone: boolean;
  updateAvailable: boolean;
  pendingCount: number;
  pendingList: OfflineSubmission[];
  installApp: () => Promise<boolean>;
  updateApp: () => void;
  syncNow: () => Promise<void>;
  dismissUpdateBanner: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [pendingList, setPendingList] = useState<OfflineSubmission[]>([]);

  // Check initial online and standalone state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      offlineSyncEngine.syncAllPending();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect standalone display mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);

    // Capture beforeinstallprompt for installable PWA
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Register Service Worker in browser
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Check for existing waiting worker
          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setUpdateAvailable(true);
          }

          // Listen for new worker installing
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[TriageBridge PWA] Service worker registration notice:', err);
        });

      // Reload when new worker takes over
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      mediaQuery.removeEventListener('change', checkStandalone);
    };
  }, []);

  // Subscribe to offline sync engine updates
  const refreshPendingList = useCallback(async () => {
    try {
      const list = await offlineSyncEngine.getPendingSubmissions();
      setPendingList(list);
    } catch {
      setPendingList([]);
    }
  }, []);

  useEffect(() => {
    refreshPendingList();
    const unsubscribe = offlineSyncEngine.subscribe(refreshPendingList);
    return () => unsubscribe();
  }, [refreshPendingList]);

  // Trigger app installation prompt
  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Install prompt failed:', e);
      return false;
    }
  };

  // Trigger service worker update
  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  const dismissUpdateBanner = () => {
    setUpdateAvailable(false);
  };

  // Manual sync trigger
  const syncNow = async () => {
    await offlineSyncEngine.syncAllPending();
    await refreshPendingList();
  };

  const pendingCount = pendingList.filter(
    (item) => item.status !== 'SUCCESSFULLY_SYNCHRONIZED'
  ).length;

  return (
    <PWAContext.Provider
      value={{
        isOnline,
        isInstallable,
        isStandalone,
        updateAvailable,
        pendingCount,
        pendingList,
        installApp,
        updateApp,
        syncNow,
        dismissUpdateBanner,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA(): PWAContextType {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}
