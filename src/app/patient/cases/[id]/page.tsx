'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { dataStore } from '../../../../lib/store';
import { TriageCase } from '../../../../lib/types';
import { UrgencyBadge } from '../../../../components/common/UrgencyBadge';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Stethoscope,
  Activity,
  FileText,
  AlertTriangle,
  Info,
  Calendar,
} from 'lucide-react';

export default function PatientCaseDetailPage() {
  const { id } = useParams() as { id: string };
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();

  const [triageCase, setTriageCase] = useState<TriageCase | null>(null);

  useEffect(() => {
    if (id) {
      const found = dataStore.getCaseById(id);
      if (found) {
        setTriageCase(found);
      }
    }
  }, [id]);

  if (!triageCase) {
    return (
      <div className="flex-1 bg-[#F7FAFC] py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-500">Loading case details...</p>
          <button
            onClick={() => router.push('/patient/cases')}
            className="text-xs text-[#0F8B8D] font-semibold hover:underline"
          >
            Back to Cases
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <button
          type="button"
          onClick={() => router.push('/patient/cases')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0F8B8D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Cases</span>
        </button>

        {/* Case Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-[#102A43]">
                  {triageCase.caseNumber}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 uppercase">
                  {triageCase.status.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Submitted on {new Date(triageCase.submittedAt).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Urgency:</span>
              <UrgencyBadge
                urgency={triageCase.finalUrgency || triageCase.provisionalUrgency}
                size="md"
              />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Chief Complaint
            </span>
            <p className="text-sm font-semibold text-[#102A43]">
              {triageCase.chiefComplaint}
            </p>
          </div>
        </div>

        {/* Clinician Review Response Card (if reviewed) */}
        {triageCase.clinicalReview && (
          <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span>Doctor / Clinician Review Verified</span>
              </div>
              <span className="text-xs text-emerald-700 font-mono">
                {new Date(triageCase.clinicalReview.reviewedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500">Reviewer:</span>
                <div className="font-bold text-slate-800">
                  {triageCase.clinicalReview.reviewerName} ({triageCase.clinicalReview.reviewerRole})
                </div>
              </div>
              <div>
                <span className="text-slate-500">Medical Reg No:</span>
                <div className="font-mono text-slate-800">
                  {triageCase.clinicalReview.reviewerRegNumber}
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1">
              <span className="font-bold text-emerald-900">Clinical Action &amp; Instructions:</span>
              <p className="leading-relaxed">{triageCase.clinicalReview.actionTaken}</p>
            </div>
          </div>
        )}

        {/* Input Details: Statement, Audio, Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statement & Voice */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3 text-xs">
            <span className="font-bold text-[#102A43] text-sm block">
              Patient Input Evidence
            </span>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Original Statement:</span>
              <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 italic">
                &quot;{triageCase.originalStatement}&quot;
              </p>
            </div>

            {triageCase.voiceTranscript && (
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Voice Transcription:</span>
                <p className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100 text-slate-700 italic">
                  &quot;{triageCase.voiceTranscript}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Vitals & Red Flags */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3 text-xs">
            <span className="font-bold text-[#102A43] text-sm block">
              Recorded Vital Signs
            </span>

            {triageCase.vitals ? (
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="p-2 bg-slate-50 rounded-lg border">
                  BP: <strong>{triageCase.vitals.systolicBp}/{triageCase.vitals.diastolicBp} mmHg</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border">
                  SpO2: <strong className={triageCase.vitals.oxygenSaturation && triageCase.vitals.oxygenSaturation < 90 ? 'text-red-600 font-bold' : ''}>
                    {triageCase.vitals.oxygenSaturation}%
                  </strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border">
                  HR: <strong>{triageCase.vitals.heartRate} bpm</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border">
                  Temp: <strong>{triageCase.vitals.temperatureCelsius}°C</strong>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">No vitals provided at time of triage.</p>
            )}

            {triageCase.redFlags && triageCase.redFlags.length > 0 && (
              <div className="pt-2">
                <span className="font-bold text-red-700 block mb-1">Triggered Warning Signs:</span>
                <div className="space-y-1">
                  {triageCase.redFlags.map(rf => (
                    <div key={rf.id} className="p-2 rounded bg-red-50 text-red-800 text-[11px] font-medium border border-red-200">
                      {rf.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Safety Notice */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>{t.brand.medicalNotice}</p>
        </div>
      </div>
    </div>
  );
}
