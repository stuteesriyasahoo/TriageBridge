'use client';

import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            {t.nav.privacy}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            How TriageBridge handles clinical data, AI safety guidelines, and patient rights.
          </p>
        </div>

        {/* Core Principles */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0F8B8D] shrink-0 mt-0.5" />
            <span>{t.brand.medicalNotice}</span>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#0F8B8D]" />
              <span>1. Zero-Trust Medical Privacy &amp; Data Minimization</span>
            </h2>
            <p>
              Your health documents in the vault are private by default. No healthcare worker can browse your general document archive without explicit, time-limited permission granted by you through the Controlled Document Sharing module.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-[#0F8B8D]" />
              <span>2. Aadhaar &amp; Personal Credential Masking</span>
            </h2>
            <p>
              Raw Aadhaar numbers are never stored in databases. They are converted immediately into synthetic identifiers (e.g. <code>PAT-2026-XXXX</code>) and displayed only as masked tokens (e.g. <code>XXXX-XXXX-1234</code>).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0F8B8D]" />
              <span>3. Human-in-the-Loop Decision Authority</span>
            </h2>
            <p>
              TriageBridge does not confirm diagnoses or prescribe medications. The provisional urgency level (RED, YELLOW, GREEN, GREY) is generated solely to prioritize patient flow in government health centers and camps. A certified medical doctor or nurse conducts the final assessment and records all clinical actions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F8B8D]" />
              <span>4. Right to Revoke Access</span>
            </h2>
            <p>
              Patients hold the perpetual right to revoke document access granted to any clinician at any point in time. Access logs are registered on an immutable clinical audit trail.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
