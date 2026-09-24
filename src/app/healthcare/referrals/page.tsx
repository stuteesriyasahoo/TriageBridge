'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { Referral, UrgencyCategory, HealthcareWorkerProfile, TriageCase } from '../../../lib/types';
import { UrgencyBadge } from '../../../components/common/UrgencyBadge';
import {
  FileCheck2,
  Plus,
  ArrowRight,
  Building2,
  Clock,
  CheckCircle2,
  X,
  Stethoscope,
  Send,
} from 'lucide-react';

function ReferralsContent() {
  const searchParams = useSearchParams();
  const preselectedCaseId = searchParams?.get('caseId') || '';
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const worker = currentUser as HealthcareWorkerProfile | null;
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(Boolean(preselectedCaseId));
  const [toastMessage, setToastMessage] = useState('');

  // Form states
  const [targetCaseId, setTargetCaseId] = useState(preselectedCaseId);
  const [targetFacility, setTargetFacility] = useState('SCB Medical College & Hospital, Cuttack');
  const [targetDepartment, setTargetDepartment] = useState('Cardiology ICU');
  const [urgency, setUrgency] = useState<UrgencyCategory>('RED');
  const [referralReason, setReferralReason] = useState(
    'Acute coronary syndrome with ST elevation on 12-lead ECG, requiring immediate interventional cardiology / catheterization laboratory.'
  );

  useEffect(() => {
    setReferrals(dataStore.getReferrals());
    const allCases = dataStore.getCases();
    setCases(allCases);
    if (!targetCaseId && allCases.length > 0) {
      setTargetCaseId(allCases[0].id);
    }
  }, [targetCaseId]);

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const caseObj = cases.find(c => c.id === targetCaseId);
    if (!caseObj || !worker) return;

    const newRef: Referral = {
      id: `ref-${Date.now()}`,
      caseId: caseObj.id,
      caseNumber: caseObj.caseNumber,
      patientId: caseObj.patientId,
      patientName: caseObj.patientName,
      referringWorkerName: `${worker.fullName} (${worker.role})`,
      targetFacility,
      targetDepartment,
      referralReason,
      urgency,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    dataStore.addReferral(newRef);
    setReferrals(dataStore.getReferrals());
    setShowCreateModal(false);
    setToastMessage(`Inter-hospital referral order created for ${caseObj.patientName} (${caseObj.caseNumber})!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            {t.referral.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.referral.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Clinical Referral</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Referrals Cards Grid */}
      <div className="space-y-4">
        {referrals.map(ref => (
          <div
            key={ref.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono font-bold text-sm text-indigo-700">
                  {ref.caseNumber}
                </span>
                <UrgencyBadge urgency={ref.urgency} size="sm" />
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {ref.status}
                </span>
              </div>

              <div className="text-sm font-bold text-[#102A43]">
                Patient: {ref.patientName} &rarr; Referred to {ref.targetFacility}
              </div>

              <div className="text-xs text-indigo-600 font-semibold">
                Target Department: {ref.targetDepartment}
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                Reason: &quot;{ref.referralReason}&quot;
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span>Referring Clinician: {ref.referringWorkerName}</span>
                <span>•</span>
                <span>Timestamp: {new Date(ref.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="shrink-0 flex gap-2">
              <button
                type="button"
                onClick={() => router.push(`/healthcare/review/${ref.caseId}`)}
                className="py-2 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <span>View Full Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Referral Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#102A43]">
                Generate Inter-Facility Referral Order
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#102A43] mb-1">
                  Select Triage Case
                </label>
                <select
                  value={targetCaseId}
                  onChange={e => setTargetCaseId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.patientName} ({c.provisionalUrgency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#102A43] mb-1">
                  {t.referral.targetFacility}
                </label>
                <input
                  type="text"
                  value={targetFacility}
                  onChange={e => setTargetFacility(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    {t.referral.targetDepartment}
                  </label>
                  <input
                    type="text"
                    value={targetDepartment}
                    onChange={e => setTargetDepartment(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    {t.referral.urgencyLevel}
                  </label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as UrgencyCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                  >
                    <option value="RED">RED — Immediate Transfer</option>
                    <option value="YELLOW">YELLOW — Priority Transfer</option>
                    <option value="GREEN">GREEN — Elective / OPD Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#102A43] mb-1">
                  {t.referral.reason}
                </label>
                <textarea
                  rows={3}
                  value={referralReason}
                  onChange={e => setReferralReason(e.target.value)}
                  required
                  placeholder={t.referral.reasonPlaceholder}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.referral.createBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-xs text-slate-500">Loading referrals...</div>}>
        <ReferralsContent />
      </Suspense>
    </div>
  );
}
