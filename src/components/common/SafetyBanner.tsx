'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface SafetyBannerProps {
  isCritical?: boolean;
}

export function SafetyBanner({ isCritical = false }: SafetyBannerProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Persistent Demo Safety Label */}
      <div
        role="region"
        aria-label="Synthetic Demo Disclaimer"
        className="bg-amber-500/15 dark:bg-amber-950/70 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-3 py-1 text-[11px] font-semibold flex items-center justify-center gap-2 text-center"
      >
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold border border-amber-500/40 tracking-wide uppercase text-[10px]">
          Synthetic Hackathon Demo — No Real Patient Data
        </span>
      </div>

      {isCritical ? (
        <aside
          aria-label="Critical Emergency Alert"
          className="bg-red-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-center shadow-md animate-pulse"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-200" />
          <span>{t.brand.redFlagAlertBanner}</span>
        </aside>
      ) : (
        <aside
          aria-label="Medical Safety Disclaimer"
          className="bg-[#102A43] text-teal-100 border-b border-[#0F8B8D]/30 px-3 py-1.5 text-xs sm:text-xs font-medium flex items-center justify-center gap-2 text-center"
        >
          <ShieldCheck className="w-4 h-4 text-[#35C2BD] shrink-0" />
          <span>{t.brand.medicalNotice}</span>
        </aside>
      )}
    </div>
  );
}
