'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { usePWA } from '../../../context/PWAContext';
import { PatientProfile, SupportedLocale } from '../../../lib/types';
import { PendingSubmissionsDrawer } from '../../../components/common/PendingSubmissionsDrawer';
import {
  User,
  Globe,
  Phone,
  MapPin,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Sun,
  Moon,
  Download,
  Smartphone,
  Laptop,
  CloudOff,
  RefreshCw,
  HardDrive,
  Info,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function PatientProfilePage() {
  const { currentUser, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const {
    isOnline,
    isInstallable,
    isStandalone,
    pendingCount,
    installApp,
    syncNow,
    updateApp,
  } = usePWA();

  const patient = currentUser as PatientProfile | null;
  const [phone, setPhone] = useState(patient?.phoneNumber || '+91 94370 12345');
  const [emergencyName, setEmergencyName] = useState(patient?.emergencyContactName || 'Bikram Nayak (Son)');
  const [emergencyPhone, setEmergencyPhone] = useState(patient?.emergencyContactPhone || '+91 94370 67890');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('drawer') === 'true') {
        setIsDrawerOpen(true);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleManualSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      await syncNow();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] dark:bg-[#0B1220] py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] dark:text-white">
            {t.nav.profile} &amp; Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your verified identity, application installation, offline storage, and multilingual preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        {/* 1. INSTALL TRIAGEBRIDGE PWA CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0F8B8D] dark:text-[#35C2BD] border border-teal-200 dark:border-teal-800 flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#102A43] dark:text-white flex items-center gap-2">
                  <span>Install TriageBridge</span>
                  {isStandalone && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      Installed
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Progressive Web Application (PWA) with instant offline access and standalone mode.
                </p>
              </div>
            </div>

            {isStandalone ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Running as App</span>
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={installApp}
                className="px-4 py-2 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install TriageBridge</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 dark:text-slate-500 italic hidden sm:block">
                Browser installation ready
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Laptop className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Standalone App</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Runs outside the browser tab in a dedicated desktop or mobile window without URL chrome.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <HardDrive className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Offline Rule Engine</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Deterministic clinical triage rules evaluate vitals and red flags completely client-side.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Background Sync</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Queued cases automatically sync with hospital servers the moment you regain internet connectivity.
              </p>
            </div>
          </div>

          {!isStandalone && !isInstallable && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                To install on your mobile device, open browser menu (&ldquo;...&rdquo; on Chrome/Edge or &ldquo;Share&rdquo; on Safari) and select <strong>&ldquo;Add to Home Screen&rdquo;</strong>. On desktop, click the install icon in your address bar.
              </span>
            </div>
          )}
        </div>

        {/* 2. OFFLINE STORAGE & SYNCHRONIZATION QUEUE CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0F8B8D] dark:text-[#35C2BD] flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#102A43] dark:text-white">
                  Offline Storage &amp; Sync Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Encrypted IndexedDB stores: pending submissions &amp; unfinished triage drafts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Queue Status
              </span>
              <div className="text-2xl font-bold font-mono text-[#0F8B8D] dark:text-[#35C2BD]">
                {pendingCount} {pendingCount === 1 ? 'Case' : 'Cases'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {pendingCount === 0
                  ? 'All local submissions are synchronized with the hospital queue.'
                  : `${pendingCount} triage assessments are stored locally and waiting to synchronize.`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Synchronization Actions
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Manual synchronization triggers immediate transmission with idempotency verification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isOnline || isSyncing || pendingCount === 0}
                  onClick={handleManualSync}
                  className="px-3 py-1.5 rounded-lg bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                >
                  Review Pending ({pendingCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PROFILE & PREFERENCES CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0F8B8D] dark:text-[#35C2BD] border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold text-xl">
              {patient?.fullName.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#102A43] dark:text-white">
                {patient?.fullName || 'Citizen Patient'}
              </h2>
              <div className="text-xs text-[#0F8B8D] dark:text-[#35C2BD] font-mono">
                Synthetic Health ID: {patient?.syntheticId || 'PAT-2026-8912'}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Masked Aadhaar: {patient?.maskedAadhaar || 'XXXX-XXXX-8912'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Theme Preference */}
            <div>
              <label className="block font-semibold text-[#102A43] dark:text-white mb-1.5 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Appearance / Theme Mode</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    theme === 'light'
                      ? 'bg-[#0F8B8D] text-white border-[#0F8B8D] shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-[#0F8B8D] text-white border-[#0F8B8D] shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block font-semibold text-[#102A43] dark:text-white mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#0F8B8D] dark:text-[#35C2BD]" />
                <span>Preferred Language for Triage &amp; Instructions</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en' as SupportedLocale, label: 'English' },
                  { code: 'hi' as SupportedLocale, label: 'हिन्दी (Hindi)' },
                  { code: 'or' as SupportedLocale, label: 'ଓଡ଼ିଆ (Odia)' },
                ].map(item => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLocale(item.code)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      locale === item.code
                        ? 'bg-[#0F8B8D] text-white border-[#0F8B8D] shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-[#102A43] dark:text-slate-200 mb-1">
                  Primary Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#102A43] dark:text-slate-200 mb-1">
                  Location / Health Center
                </label>
                <input
                  type="text"
                  defaultValue={patient?.location || 'Athamallik, Angul District, Odisha'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#102A43] dark:text-slate-200 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#102A43] dark:text-slate-200 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={logout}
                className="py-2 px-3 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold text-xs flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.nav.logout}</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>

      <PendingSubmissionsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
