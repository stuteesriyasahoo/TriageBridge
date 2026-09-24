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

  return (
    <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#102A43]">
          {t.triage.caseSubmitted}
        </h1>
        <p className="text-xs text-slate-500">
          Your symptoms and multimodal records are now in the clinical review queue.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
        <span className="text-xs text-slate-500 uppercase font-medium">
          {t.triage.caseIdLabel}
        </span>
        <div className="text-xl font-bold font-mono text-[#0F8B8D]">
          {caseNumber}
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5 text-left">
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
