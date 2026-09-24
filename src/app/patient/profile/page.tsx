'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { PatientProfile, SupportedLocale } from '../../../lib/types';
import { User, Globe, Phone, MapPin, ShieldCheck, LogOut, CheckCircle2, Sun, Moon } from 'lucide-react';

export default function PatientProfilePage() {
  const { currentUser, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const patient = currentUser as PatientProfile | null;
  const [phone, setPhone] = useState(patient?.phoneNumber || '+91 94370 12345');
  const [emergencyName, setEmergencyName] = useState(patient?.emergencyContactName || 'Bikram Nayak (Son)');
  const [emergencyPhone, setEmergencyPhone] = useState(patient?.emergencyContactPhone || '+91 94370 67890');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            {t.nav.profile} &amp; Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your verified identity, emergency contacts, and multilingual preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        {/* Identity Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F8B8D] border border-teal-200 flex items-center justify-center font-bold text-xl">
              {patient?.fullName.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#102A43]">
                {patient?.fullName || 'Citizen Patient'}
              </h2>
              <div className="text-xs text-[#0F8B8D] font-mono">
                Synthetic Health ID: {patient?.syntheticId || 'PAT-2026-8912'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Masked Aadhaar: {patient?.maskedAadhaar || 'XXXX-XXXX-8912'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Theme Preference */}
            <div>
              <label className="block font-semibold text-[#102A43] mb-1.5 flex items-center gap-1.5">
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
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-[#0F8B8D] text-white border-[#0F8B8D] shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block font-semibold text-[#102A43] mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#0F8B8D]" />
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
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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
                <label className="block font-semibold text-[#102A43] mb-1">
                  Primary Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#102A43] mb-1">
                  Location / Health Center
                </label>
                <input
                  type="text"
                  defaultValue={patient?.location || 'Athamallik, Angul District, Odisha'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#102A43] mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#102A43] mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={logout}
                className="py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs flex items-center gap-1.5"
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
    </div>
  );
}
