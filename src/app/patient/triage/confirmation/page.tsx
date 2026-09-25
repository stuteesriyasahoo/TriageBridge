'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '../../../../context/LanguageContext';
import { CheckCircle2, ArrowRight, Home, ShieldCheck, Clock } from 'lucide-react';

function ConfirmationContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const caseNumber = searchParams?.get('caseNumber') || 'TB-2026-9901';
  const caseId = searchParams?.get('id') || 'case-001';
  const isOffline = searchParams?.get('offline') === 'true';
  const idempotencyKey = searchParams?.get('idem');

  return (
    <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#102A43] dark:text-white">
          {isOffline ? 'Triage Saved Securely Offline' : t.triage.caseSubmitted}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isOffline
            ? 'Your triage assessment is safely stored in IndexedDB. It will submit automatically when your network reconnects.'
            : 'Your symptoms and multimodal records are now in the clinical review queue.'}
        </p>
      </div>

      {isOffline && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Status: Saved Offline / Waiting to Synchronize</span>
            </span>
          </div>
          {idempotencyKey && (
            <div className="font-mono text-[11px] text-amber-800 dark:text-amber-300">
              Idempotency Key: <span className="font-semibold">{idempotencyKey}</span>
            </div>
          )}
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
            Duplicate prevention is active. The system will never submit multiple copies of this case.
          </p>
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">
          {t.triage.caseIdLabel}
        </span>
        <div className="text-xl font-bold font-mono text-[#0F8B8D]">
          {caseNumber}
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5 text-left">
        <ShieldCheck className="w-4 h-4 text-[#0F8B8D] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t.brand.medicalNotice} A doctor or authorized triage nurse at the facility will verify your case shortly.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => router.push(`/patient/cases/${caseId}`)}
          className="flex-1 py-3 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Clock className="w-4 h-4" />
          <span>{t.triage.trackCaseBtn}</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/patient/dashboard')}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>{t.triage.backHomeBtn}</span>
        </button>
      </div>
    </div>
  );
}

export default function TriageConfirmationPage() {
  return (
    <div className="flex-1 bg-[#F7FAFC] py-12 px-4 flex flex-col justify-center items-center">
      <Suspense fallback={<div className="text-xs text-slate-500">Loading confirmation...</div>}>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
