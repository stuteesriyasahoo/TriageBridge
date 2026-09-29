import React from 'react';
import { UrgencyCategory } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

interface UrgencyBadgeProps {
  urgency: UrgencyCategory;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function UrgencyBadge({ urgency, size = 'md', showLabel = true }: UrgencyBadgeProps) {
  const { t } = useLanguage();

  const config = {
    RED: {
      bg: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 ring-red-200 dark:ring-red-900/50',
      dot: 'bg-red-600 dark:bg-red-500',
      icon: AlertCircle,
      label: t.urgency.redShort,
      fullLabel: t.urgency.red,
    },
    YELLOW: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800 ring-amber-200 dark:ring-amber-900/50',
      dot: 'bg-amber-500 dark:bg-amber-400',
      icon: AlertTriangle,
      label: t.urgency.yellowShort,
      fullLabel: t.urgency.yellow,
    },
    GREEN: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 ring-emerald-200 dark:ring-emerald-900/50',
      dot: 'bg-emerald-600 dark:bg-emerald-400',
      icon: CheckCircle2,
      label: t.urgency.greenShort,
      fullLabel: t.urgency.green,
    },
    GREY: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 ring-slate-200 dark:ring-slate-700',
      dot: 'bg-slate-500 dark:bg-slate-400',
      icon: HelpCircle,
      label: t.urgency.greyShort || 'Needs Review',
      fullLabel: t.urgency.grey || 'NEEDS CLINICIAN REVIEW',
    },
    NEEDS_CLINICIAN_REVIEW: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800 ring-indigo-200 dark:ring-indigo-900/50',
      dot: 'bg-indigo-500 dark:bg-indigo-400',
      icon: HelpCircle,
      label: t.urgency.needsClinicianReviewShort || 'Needs Review',
      fullLabel: t.urgency.needsClinicianReview || 'NEEDS CLINICIAN REVIEW',
    },
  }[urgency] || {
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 ring-slate-200 dark:ring-slate-700',
    dot: 'bg-slate-500 dark:bg-slate-400',
    icon: HelpCircle,
    label: t.urgency.greyShort,
    fullLabel: t.urgency.grey,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs ${config.bg} ${sizeClasses}`}
      title={config.fullLabel}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
