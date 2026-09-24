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
      bg: 'bg-red-50 text-red-700 border-red-300 ring-red-200',
      dot: 'bg-red-600',
      icon: AlertCircle,
      label: t.urgency.redShort,
      fullLabel: t.urgency.red,
    },
    YELLOW: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-200',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: t.urgency.yellowShort,
      fullLabel: t.urgency.yellow,
    },
    GREEN: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-200',
      dot: 'bg-emerald-600',
      icon: CheckCircle2,
      label: t.urgency.greenShort,
      fullLabel: t.urgency.green,
    },
    GREY: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-200',
      dot: 'bg-slate-500',
      icon: HelpCircle,
      label: t.urgency.greyShort,
      fullLabel: t.urgency.grey,
    },
  }[urgency] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-200',
    dot: 'bg-slate-500',
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
