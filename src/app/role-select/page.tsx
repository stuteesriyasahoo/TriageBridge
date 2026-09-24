'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Stethoscope, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { DEMO_PATIENTS, DEMO_HEALTHCARE_WORKERS } from '../../lib/mock-data';

export default function RoleSelectPage() {
  const { t } = useLanguage();
  const { loginAsDemoUser } = useAuth();
  const router = useRouter();

  return (
    <div className="flex-1 bg-[#F7FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B8D] text-xs font-semibold">
            <HeartPulse className="w-3.5 h-3.5 text-[#0F8B8D]" />
            <span>Role-Based Healthcare Access</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#102A43] tracking-tight">
            {t.roleSelect.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            {t.roleSelect.subtitle}
          </p>
        </div>

        {/* Two Large Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4">
          {/* Card 1: Patient Portal */}
          <div className="bg-white rounded-2xl border-2 border-slate-200/80 hover:border-[#0F8B8D] shadow-sm hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-[#0F8B8D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#102A43]">
                  {t.roleSelect.patientCardTitle}
                </h2>
                <span className="text-[11px] font-semibold text-[#0F8B8D] uppercase tracking-wider">
                  Citizens • Rural Health Campers • Students
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.roleSelect.patientCardDesc}
              </p>

              {/* Patient feature bullets */}
              <ul className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Voice symptom entry in Odia, Hindi, or English</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>OCR lab report extraction and appointment slips</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Simulated Aadhaar &amp; OTP instant verification</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                type="button"
                onClick={() => router.push('/login/patient')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>{t.roleSelect.patientBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => loginAsDemoUser(DEMO_PATIENTS[0].id)}
                className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-600 hover:text-[#0F8B8D] hover:bg-teal-50 transition-colors"
              >
                ⚡ Quick Demo: Enter as {DEMO_PATIENTS[0].fullName} (Odia)
              </button>
            </div>
          </div>

          {/* Card 2: Healthcare Worker Portal */}
          <div className="bg-white rounded-2xl border-2 border-slate-200/80 hover:border-indigo-600 shadow-sm hover:shadow-xl transition-all p-6 sm:p-8 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#102A43]">
                  {t.roleSelect.hcwCardTitle}
                </h2>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Doctors • Triage Nurses • Medical Officers
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.roleSelect.hcwCardDesc}
              </p>

              {/* Healthcare features */}
              <ul className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Split-screen comparison: Original Input vs Clinical Note</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Priority Queue sorted by RED, YELLOW, GREEN, GREY</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Urgency override, inter-hospital referrals &amp; audit logging</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                type="button"
                onClick={() => router.push('/login/healthcare')}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>{t.roleSelect.hcwBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => loginAsDemoUser(DEMO_HEALTHCARE_WORKERS[0].id)}
                className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                ⚡ Quick Demo: Enter as {DEMO_HEALTHCARE_WORKERS[0].fullName} (Doctor)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
