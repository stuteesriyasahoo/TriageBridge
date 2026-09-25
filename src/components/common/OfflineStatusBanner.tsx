'use client';

import React, { useState } from 'react';
import { usePWA } from '../../context/PWAContext';
import { PendingSubmissionsDrawer } from './PendingSubmissionsDrawer';
import {
  CloudOff,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  X,
  CheckCircle2,
  ChevronRight,
  Wifi,
} from 'lucide-react';

export function OfflineStatusBanner() {
  const {
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
  } = usePWA();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    try {
      await syncNow();
    } finally {
      setIsSyncing(false);
    }
  };

  // Determine top sync status if any items are in queue
  const hasFailed = pendingList.some((p) => p.status === 'SYNCHRONIZATION_FAILED');
  const hasNeedsAttention = pendingList.some((p) => p.status === 'REQUIRES_USER_ATTENTION');
  const isCurrentlySyncing = pendingList.some((p) => p.status === 'SYNCHRONIZING') || isSyncing;

  return (
    <>
      {/* 1. UPDATE AVAILABLE FLOATING BANNER */}
      {updateAvailable && (
        <div className="bg-linear-to-r from-teal-900 to-indigo-900 text-white px-4 py-2.5 text-xs shadow-md border-b border-teal-500/40 sticky top-0 z-50 animate-slide-down">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-300 animate-pulse shrink-0" />
              <span className="font-semibold">
                An update to TriageBridge is ready.
              </span>
              <span className="hidden sm:inline text-teal-200/80">
                Refresh to load the latest clinical guidelines and offline cache.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={updateApp}
                className="px-3 py-1 rounded-lg bg-[#35C2BD] hover:bg-[#2bb2ad] text-[#102A43] font-bold transition-all shadow-xs"
              >
                Update Now
              </button>
              <button
                type="button"
                onClick={dismissUpdateBanner}
                className="p-1 rounded-md text-teal-300 hover:text-white transition-colors"
                aria-label="Dismiss update notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. OFFLINE STATUS BANNER (When browser is disconnected from internet) */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-medium">
              <CloudOff className="w-4 h-4 text-amber-200 shrink-0" />
              <span>
                <strong>Offline Mode Active:</strong> You can continue triage assessments and enter vitals. Data is saved locally in IndexedDB and will auto-sync on reconnect.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-semibold text-xs whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <span>Queue ({pendingCount})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. SYNC STATUS BAR (When online but has pending or failed syncs) */}
      {isOnline && pendingCount > 0 && (
        <div
          className={`px-4 py-2 text-xs shadow-xs border-b transition-colors ${
            hasNeedsAttention
              ? 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/60 dark:text-red-200 dark:border-red-900'
              : hasFailed
              ? 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-900'
              : 'bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-900'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isCurrentlySyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  <span className="font-semibold">
                    Synchronizing offline triage cases ({pendingCount} pending)...
                  </span>
                </>
              ) : hasNeedsAttention ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-semibold">
                    Requires User Attention: Offline case failed multiple sync attempts.
                  </span>
                </>
              ) : hasFailed ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="font-semibold">
                    Synchronization Failed: {pendingCount} offline case waiting for retry.
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-semibold">
                    Waiting to Synchronize: {pendingCount} offline triage assessment queued in IndexedDB.
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSyncClick}
                disabled={isCurrentlySyncing}
                className="px-2.5 py-1 rounded-md bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isCurrentlySyncing ? 'animate-spin' : ''}`} />
                <span>{isCurrentlySyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors"
              >
                Review Pending
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INSTALL APP PROMPT (When installable and not yet standalone) */}
      {isInstallable && !isStandalone && showInstallPrompt && (
        <div className="bg-slate-900 text-white px-4 py-2 text-xs border-b border-slate-800 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                <strong>Install TriageBridge on your desktop:</strong> Fast launch, full offline clinical rule engine and instant sync.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={installApp}
                className="px-3 py-1 rounded-lg bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Install TriageBridge</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInstallPrompt(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Dismiss install banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer for inspecting and managing pending submissions */}
      <PendingSubmissionsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
