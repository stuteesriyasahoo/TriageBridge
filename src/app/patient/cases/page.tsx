'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { TriageCase } from '../../../lib/types';
import { UrgencyBadge } from '../../../components/common/UrgencyBadge';
import { ClipboardList, ArrowRight, Clock, Plus, Filter } from 'lucide-react';

export default function PatientCasesPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [cases, setCases] = useState<TriageCase[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    if (currentUser) {
      setCases(dataStore.getCasesByPatientId(currentUser.id));
    }
  }, [currentUser]);

  const filteredCases = cases.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#102A43]">
              {t.nav.myCases}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Track clinical review progression, provisional urgency, and doctor referrals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/patient/triage')}
            className="py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.dashboard.startTriageBtn}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['ALL', 'SUBMITTED', 'AWAITING_REVIEW', 'MORE_INFO_REQUIRED', 'REVIEWED', 'REFERRED'].map(
            status => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterStatus === status
                    ? 'bg-[#102A43] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status === 'ALL' ? 'All Cases' : status.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        {/* Case List */}
        {filteredCases.length > 0 ? (
          <div className="space-y-3">
            {filteredCases.map(item => (
              <div
                key={item.id}
                onClick={() => router.push(`/patient/cases/${item.id}`)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#0F8B8D] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-[#0F8B8D]">
                      {item.caseNumber}
                    </span>
                    <UrgencyBadge urgency={item.provisionalUrgency} size="sm" />
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[#102A43] line-clamp-1">
                    {item.chiefComplaint}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.submittedAt).toLocaleDateString()} at{' '}
                      {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span>Facility: {item.facilityName || 'District HQ Hospital'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-semibold text-[#0F8B8D] group-hover:underline">
                    View Details
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#0F8B8D] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
            <h2 className="text-sm font-bold text-[#102A43]">No triage cases found</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no triage cases matching this status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
