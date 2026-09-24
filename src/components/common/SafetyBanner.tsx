'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface SafetyBannerProps {
  isCritical?: boolean;
}

export function SafetyBanner({ isCritical = false }: SafetyBannerProps) {
  const { t } = useLanguage();

  if (isCritical) {
    return (
      <aside
        aria-label="Critical Emergency Alert"
        className="bg-red-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-center shadow-md animate-pulse"
      >
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-200" />
        <span>{t.brand.redFlagAlertBanner}</span>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Medical Safety Disclaimer"
      className="bg-[#102A43] text-teal-100 border-b border-[#0F8B8D]/30 px-3 py-1.5 text-xs sm:text-xs font-medium flex items-center justify-center gap-2 text-center"
    >
      <ShieldCheck className="w-4 h-4 text-[#35C2BD] shrink-0" />
      <span>{t.brand.medicalNotice}</span>
    </aside>
  );
}
