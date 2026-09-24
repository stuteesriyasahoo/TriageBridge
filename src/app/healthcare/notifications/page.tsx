'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { NotificationItem } from '../../../lib/types';
import { Bell, AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

export default function HealthcareNotificationsPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setNotifications(dataStore.getNotifications());
  }, []);

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            {t.nav.notifications} Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time clinical queue alerts, red-flag triggers, and patient inquiries.
          </p>
        </div>

        <div className="space-y-3">
          {notifications.map(n => {
            const title = locale === 'or' ? n.titleOr : locale === 'hi' ? n.titleHi : n.titleEn;
            const body = locale === 'or' ? n.bodyOr : locale === 'hi' ? n.bodyHi : n.bodyEn;
            const isRedAlert = n.type === 'CASE_SUBMITTED' && body.includes('RED');

            return (
              <div
                key={n.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex items-start justify-between gap-4 transition-all ${
                  isRedAlert ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isRedAlert ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {isRedAlert ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[#102A43]">
                        {title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {n.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                      {body}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {n.caseId && (
                  <button
                    type="button"
                    onClick={() => router.push(`/healthcare/review/${n.caseId}`)}
                    className="shrink-0 py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
