'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { TriageCase, HealthcareWorkerProfile } from '../../../lib/types';
import { UrgencyBadge } from '../../../components/common/UrgencyBadge';
import {
  Activity,
  Layers,
  FileCheck2,
  ClipboardList,
  AlertCircle,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Stethoscope,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { LanguageSelector } from '../../../components/common/LanguageSelector';

export default function HealthcareDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const worker = currentUser as HealthcareWorkerProfile | null;
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  useEffect(() => {
    setCases(dataStore.getCases());
  }, []);

  const totalPending = cases.filter(c => c.status === 'SUBMITTED' || c.status === 'AWAITING_REVIEW').length;
  const urgentRed = cases.filter(c => c.provisionalUrgency === 'RED' && c.status !== 'REVIEWED').length;
  const awaitingInfo = cases.filter(c => c.status === 'MORE_INFO_REQUIRED').length;
  const reviewedTotal = cases.filter(c => c.status === 'REVIEWED').length;

  const filteredQueue = cases.filter(c => {
    const matchesUrgency = urgencyFilter === 'ALL' || c.provisionalUrgency === urgencyFilter;
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesUrgency && matchesSearch;
  });

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clinician Welcome Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{worker?.role || 'DOCTOR'} • Reg #{worker?.registrationNumber || 'SMC-ODI-48291'}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#102A43]">
              {worker?.fullName || 'Dr. Alok Mohanty'}
            </h1>
            <p className="text-xs text-slate-500">
              Facility: {worker?.facilityName || 'SCB Medical College & Hospital'} • Department: {worker?.department || 'Emergency Triage'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-slate-800 text-white rounded-lg p-0.5">
              <LanguageSelector />
            </div>
            <button
              type="button"
              onClick={() => router.push('/healthcare/queue')}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>Open Priority Queue</span>
            </button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Urgent RED */}
          <div className="bg-white rounded-2xl border-l-4 border-red-500 border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>{t.reviewer.urgentCases}</span>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-700">
              {urgentRed}
            </div>
            <div className="text-[11px] text-slate-400">Immediate bedside / resuscitation review</div>
          </div>

          {/* Card 2: Total Pending */}
          <div className="bg-white rounded-2xl border-l-4 border-[#0F8B8D] border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>{t.reviewer.totalPending}</span>
              <Clock className="w-4 h-4 text-[#0F8B8D]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#102A43]">
              {totalPending}
            </div>
            <div className="text-[11px] text-slate-400">Awaiting clinician sign-off</div>
          </div>

          {/* Card 3: Awaiting Info */}
          <div className="bg-white rounded-2xl border-l-4 border-slate-500 border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>{t.reviewer.awaitingInfo}</span>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-700">
              {awaitingInfo}
            </div>
            <div className="text-[11px] text-slate-400">Sparse input / clarifications needed</div>
          </div>

          {/* Card 4: Reviewed Today */}
          <div className="bg-white rounded-2xl border-l-4 border-emerald-500 border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>{t.reviewer.reviewedToday}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {reviewedTotal}
            </div>
            <div className="text-[11px] text-slate-400">Final decisions confirmed</div>
          </div>
        </div>

        {/* Priority Queue Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#102A43]">
                {t.reviewer.queueTitle}
              </h2>
              <p className="text-xs text-slate-500">
                Sorted by clinical urgency severity (RED &gt; YELLOW &gt; GREEN &gt; GREY) and submission age.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search case, name, symptom..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={urgencyFilter}
                onChange={e => setUrgencyFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium"
              >
                <option value="ALL">All Urgencies</option>
                <option value="RED">RED Only</option>
                <option value="YELLOW">YELLOW Only</option>
                <option value="GREEN">GREEN Only</option>
                <option value="GREY">GREY Only</option>
              </select>
            </div>
          </div>

          {/* Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">{t.reviewer.caseNumber}</th>
                  <th className="px-4 py-3">{t.reviewer.patient}</th>
                  <th className="px-4 py-3">{t.reviewer.chiefComplaintCol}</th>
                  <th className="px-4 py-3">{t.reviewer.urgencyCol}</th>
                  <th className="px-4 py-3">{t.reviewer.statusCol}</th>
                  <th className="px-4 py-3 text-right">{t.reviewer.actionCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map(item => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      item.provisionalUrgency === 'RED' ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#102A43]">
                      {item.caseNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.patientName}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.patientAge}Y / {item.patientGender} • {item.originalLanguage.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-700">
                      {item.chiefComplaint}
                    </td>
                    <td className="px-4 py-3">
                      <UrgencyBadge urgency={item.provisionalUrgency} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => router.push(`/healthcare/review/${item.id}`)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                          item.provisionalUrgency === 'RED'
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <span>{t.reviewer.reviewCase}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
