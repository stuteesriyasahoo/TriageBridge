'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  Mic,
  FileText,
  Stethoscope,
  Activity,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Lock,
  PhoneCall,
  HeartPulse,
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col bg-[#F7FAFC]">
      {/* Emergency Warning Banner */}
      <section className="bg-red-50 border-b border-red-200 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-red-800 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
            <span>{t.landing.emergencyNotice}</span>
          </div>
          <span className="shrink-0 font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full text-xs hidden md:inline">
            EMERGENCY: 108
          </span>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F8B8D]/10 border border-[#0F8B8D]/30 text-[#0F8B8D] text-xs font-semibold">
                <HeartPulse className="w-3.5 h-3.5 text-[#0F8B8D]" />
                <span>Multimodal Healthcare Triage Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102A43] tracking-tight leading-tight">
                {t.landing.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {t.landing.heroDesc}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/role-select')}
                  className="px-6 py-3.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>{t.landing.getStarted}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/login/patient')}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] border border-slate-300 font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-[#0F8B8D]" />
                  <span>{t.landing.patientLoginBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/login/healthcare')}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] border border-slate-300 font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  <span>{t.landing.healthcareLoginBtn}</span>
                </button>
              </div>

              {/* Safety Guarantee Callout */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#0F8B8D] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
                    {t.landing.safetyFirst}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t.landing.safetyFirstDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Visual Graphic: Multimodal Triage Architecture */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-xl p-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Clinical Workflow Architecture
                  </span>
                </div>

                <div className="space-y-4 py-4">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0F8B8D] flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#102A43]">
                        Multimodal Patient Capture
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Voice (Odia/Hindi/English) + OCR Lab Reports + Vitals
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/70 border border-red-100 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-bold text-red-900">
                        Deterministic Red-Flag Gate
                      </div>
                      <div className="text-[11px] text-red-700">
                        Immediate screening for SpO2 &lt; 90%, Chest Pain, Shock
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-100 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-900">
                        Dynamic Follow-Up Questions
                      </div>
                      <div className="text-[11px] text-amber-800">
                        Clarifies missing timeline, medication, and allergies
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900">
                        Doctor Verification Desk
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        Split-screen audit, notes modification & final sign-off
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center text-[11px] text-slate-400 font-medium">
                  Human-In-The-Loop Healthcare Standard
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-[#F7FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#102A43]">
              {t.landing.howItWorks}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Designed for PHCs, district hospitals, remote health camps, and campus infirmaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F8B8D] flex items-center justify-center mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#102A43] mb-2">
                {t.landing.features.multimodal.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.landing.features.multimodal.desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#102A43] mb-2">
                {t.landing.features.redFlag.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.landing.features.redFlag.desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#102A43] mb-2">
                {t.landing.features.ocr.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.landing.features.ocr.desc}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#102A43] mb-2">
                {t.landing.features.reviewer.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.landing.features.reviewer.desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Compliance Section */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#102A43]">
                  Human Healthcare Professional in Control
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  AI suggestions are strictly provisional. Every clinical review requires licensed doctor or nurse approval.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#0F8B8D] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#102A43]">
                  Private by Default &amp; Granular Consent
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Patient medical documents are stored in private storage and shared only for time-limited consultations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#102A43]">
                  Complete Immutable Audit Trail
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Every decision, red-flag screening, file upload, and override is permanently logged with timestamps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#102A43] text-slate-300 py-8 border-t border-[#0F8B8D]/30 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white text-sm">
              Triage<span className="text-[#35C2BD]">Bridge</span>
            </div>
            <div className="text-teal-200/70 text-[11px] mt-0.5">
              “Smarter Triage. Faster Care. Human at the Centre.”
            </div>
          </div>

          <div className="text-center md:text-right text-slate-400">
            <div>Clinical Decision Support System</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Healthcare triage assistance platform. Not connected to UIDAI.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
