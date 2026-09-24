'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PATIENTS, DEMO_HEALTHCARE_WORKERS } from '../../lib/mock-data';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import {
  UserCheck,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Globe,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function MainLoginPage() {
  const { t, locale, currentLanguageMeta } = useLanguage();
  const { loginAsDemoUser } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F7FAFC] dark:bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#102A43] flex items-center justify-center text-white font-bold text-base shadow-sm">
            TB
          </div>
          <div>
            <span className="font-bold text-lg text-[#102A43] dark:text-white tracking-tight">
              TriageBridge
            </span>
            <span className="block text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wider uppercase">
              Multilingual Clinical Gateway
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSelector variant="header" />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full my-auto py-8 space-y-8">
        {/* Title & Welcome */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>23 Supported Languages • {currentLanguageMeta.nameNative} ({currentLanguageMeta.nameEn})</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
            {t.login.patientTitle} &amp; {t.login.hcwTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t.brand.tagline}
          </p>
        </div>

        {/* Searchable Language Selector Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 sm:p-6">
          <LanguageSelector variant="inline" />
        </div>

        {/* Portals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Portal Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#102A43] dark:text-white">
                  {t.roleSelect.patientCardTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {t.roleSelect.patientCardDesc}
                </p>
              </div>

              {/* Demo Patient Fast Login */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                  {t.login.quickDemoUsers}
                </span>
                <div className="flex flex-wrap gap-2">
                  {DEMO_PATIENTS.slice(0, 2).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => loginAsDemoUser(p.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/40 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                    >
                      {p.fullName} ({p.location.split(',')[0]})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/login/patient"
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>{t.roleSelect.patientBtn}</span>
              <ArrowRight className="w-4 h-4 rtl-mirror" />
            </Link>
          </div>

          {/* Healthcare Worker Portal Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#102A43] dark:text-white">
                  {t.roleSelect.hcwCardTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {t.roleSelect.hcwCardDesc}
                </p>
              </div>

              {/* Demo Clinician Fast Login */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                  {t.login.quickDemoHcw}
                </span>
                <div className="flex flex-wrap gap-2">
                  {DEMO_HEALTHCARE_WORKERS.slice(0, 2).map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => loginAsDemoUser(w.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                    >
                      {w.fullName} ({w.role})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/login/healthcare"
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[#102A43] hover:bg-[#0c2236] dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>{t.roleSelect.hcwBtn}</span>
              <ArrowRight className="w-4 h-4 rtl-mirror" />
            </Link>
          </div>
        </div>

        {/* Emergency Warning */}
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block mb-0.5">{t.landing.emergencyNotice.split(':')[0]}:</span>
            <span>{t.landing.emergencyNotice.split(':').slice(1).join(':') || t.landing.emergencyNotice}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 dark:text-slate-500 pt-6 border-t border-slate-200 dark:border-slate-800">
        <p>{t.brand.medicalNotice}</p>
      </div>
    </div>
  );
}
