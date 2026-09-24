'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { TriageCase, UrgencyCategory } from '../../../lib/types';
import { UrgencyBadge } from '../../../components/common/UrgencyBadge';
import {
  Layers,
  Search,
  Filter,
  ArrowRight,
  Clock,
  AlertTriangle,
  Stethoscope,
  Globe,
} from 'lucide-react';

export default function PriorityQueuePage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [cases, setCases] = useState<TriageCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [languageFilter, setLanguageFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setCases(dataStore.getCases());
  }, []);

  const filteredCases = cases.filter(item => {
    const matchesUrgency = urgencyFilter === 'ALL' || item.provisionalUrgency === urgencyFilter;
    const matchesLang = languageFilter === 'ALL' || item.originalLanguage === languageFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesUrgency && matchesLang && matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            {t.reviewer.queueTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.reviewer.queueSubtitle}
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search patient, ID, complaint..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Urgency */}
            <div>
              <select
                value={urgencyFilter}
                onChange={e => setUrgencyFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
              >
                <option value="ALL">All Urgencies (RED / YELLOW / GREEN / GREY)</option>
                <option value="RED">RED — Immediate Assessment</option>
                <option value="YELLOW">YELLOW — Priority Assessment</option>
                <option value="GREEN">GREEN — Routine Assessment</option>
                <option value="GREY">GREY — More Info Required</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <select
                value={languageFilter}
                onChange={e => setLanguageFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
              >
                <option value="ALL">All Submission Languages</option>
                <option value="or">Odia (ଓଡ଼ିଆ)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
              >
                <option value="ALL">All Case Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="AWAITING_REVIEW">Awaiting Review</option>
                <option value="MORE_INFO_REQUIRED">More Info Required</option>
                <option value="REVIEWED">Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Case Reference</th>
                  <th className="px-4 py-3.5">Patient Details</th>
                  <th className="px-4 py-3.5">Chief Complaint</th>
                  <th className="px-4 py-3.5">Red Flags Triggered</th>
                  <th className="px-4 py-3.5">Provisional Urgency</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.length > 0 ? (
                  filteredCases.map(item => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        item.provisionalUrgency === 'RED' ? 'bg-red-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#102A43]">
                        {item.caseNumber}
                        <div className="text-[10px] text-slate-400 font-sans font-normal">
                          {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{item.patientName}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.patientAge}Y / {item.patientGender} • {item.patientLocation.split(',')[0]}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-xs truncate text-slate-700">
                        {item.chiefComplaint}
                      </td>

                      <td className="px-4 py-3">
                        {item.redFlags && item.redFlags.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>{item.redFlags.length} Flagged</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition-colors ${
                            item.provisionalUrgency === 'RED'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          <span>Review Case</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-500">
                      No cases match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
