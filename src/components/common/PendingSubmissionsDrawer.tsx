'use client';

import React, { useState } from 'react';
import { usePWA } from '../../context/PWAContext';
import { OfflineSubmission, OfflineSyncStatus, offlineSyncEngine } from '../../lib/offline-sync';
import {
  X,
  RefreshCw,
  CloudOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Activity,
  Heart,
  FileText,
  Key,
  Calendar,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_OFFLINE_SUBMISSIONS: OfflineSubmission[] = [
  {
    id: 'case-offline-demo-1',
    idempotencyKey: 'idem-pat-001-1742918290-7f2a1b9c',
    createdAt: '2026-09-25T08:45:00.000Z',
    status: 'WAITING_TO_SYNC',
    retryCount: 0,
    caseData: {
      id: 'case-offline-demo-1',
      caseNumber: 'TB-2026-8812',
      patientId: 'pat-001',
      patientName: 'Ramesh Nayak',
      patientAge: 48,
      patientGender: 'MALE',
      patientLocation: 'Athamallik, Angul District, Odisha',
      patientPhone: '+91 94370 12345',
      chiefComplaint: 'Acute chest pain radiating to left arm with breathlessness',
      originalLanguage: 'or',
      originalStatement: 'Severe tightness in chest since morning.',
      status: 'SUBMITTED',
      provisionalUrgency: 'RED',
      facilityName: 'District Headquarters Hospital, Angul',
      vitals: { systolicBp: 175, diastolicBp: 102, heartRate: 118, oxygenSaturation: 88, temperatureCelsius: 37.1 },
      uploadedReports: [],
      redFlags: [],
      followUpQuestions: [],
      urgencyAssessment: {
        suggestedUrgency: 'RED',
        confidenceScore: 0.94,
        rationaleEn: 'Critical hypoxia with acute anginal chest pain flagged offline.',
        rationaleHi: '',
        rationaleOr: '',
        triggeredRedFlags: ['Critical Hypoxia', 'Acute Chest Pain'],
        missingInformation: [],
        isDiagnostic: false,
      },
      submittedAt: '2026-09-25T08:45:00.000Z',
      updatedAt: '2026-09-25T08:45:00.000Z',
    },
  },
  {
    id: 'case-offline-demo-2',
    idempotencyKey: 'idem-pat-001-1742917540-3d8e9a1f',
    createdAt: '2026-09-25T08:15:00.000Z',
    status: 'SYNCHRONIZATION_FAILED',
    retryCount: 1,
    errorDetails: 'HTTP 503: Connection to district health server timed out. Will retry on next reconnect.',
    caseData: {
      id: 'case-offline-demo-2',
      caseNumber: 'TB-2026-8805',
      patientId: 'pat-001',
      patientName: 'Ramesh Nayak',
      patientAge: 48,
      patientGender: 'MALE',
      patientLocation: 'Athamallik, Angul District, Odisha',
      patientPhone: '+91 94370 12345',
      chiefComplaint: 'High fever (39.5°C) with persistent shivering for 3 days',
      originalLanguage: 'or',
      originalStatement: 'High fever and shivering.',
      status: 'SUBMITTED',
      provisionalUrgency: 'YELLOW',
      facilityName: 'District Headquarters Hospital, Angul',
      vitals: { systolicBp: 122, diastolicBp: 78, heartRate: 98, oxygenSaturation: 96, temperatureCelsius: 39.5 },
      uploadedReports: [],
      redFlags: [],
      followUpQuestions: [],
      urgencyAssessment: {
        suggestedUrgency: 'YELLOW',
        confidenceScore: 0.88,
        rationaleEn: 'High-grade febrile presentation requiring urgent clinician evaluation.',
        rationaleHi: '',
        rationaleOr: '',
        triggeredRedFlags: ['High Fever'],
        missingInformation: [],
        isDiagnostic: false,
      },
      submittedAt: '2026-09-25T08:15:00.000Z',
      updatedAt: '2026-09-25T08:15:00.000Z',
    },
  },
];

export function PendingSubmissionsDrawer({ isOpen, onClose }: Props) {
  const { isOnline, pendingList, syncNow } = usePWA();
  const [retryingKey, setRetryingKey] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const isDemo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demoOffline') === 'true';
  const effectiveList: OfflineSubmission[] = (isDemo && pendingList.length === 0)
    ? DEMO_OFFLINE_SUBMISSIONS
    : pendingList;

  if (!isOpen) return null;

  const handleSyncAll = async () => {
    if (!isOnline) return;
    setSyncingAll(true);
    try {
      await syncNow();
    } finally {
      setSyncingAll(false);
    }
  };

  const handleRetrySingle = async (idempotencyKey: string) => {
    setRetryingKey(idempotencyKey);
    try {
      await offlineSyncEngine.syncSubmission(idempotencyKey);
    } finally {
      setRetryingKey(null);
    }
  };

  const handleDelete = async (idempotencyKey: string) => {
    if (confirm('Are you sure you want to remove this pending submission from offline storage?')) {
      await offlineSyncEngine.deleteSubmission(idempotencyKey);
    }
  };

  const getStatusBadge = (status: OfflineSyncStatus) => {
    switch (status) {
      case 'SAVED_OFFLINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <CloudOff className="w-3 h-3 text-slate-500" />
            <span>Saved Offline</span>
          </span>
        );
      case 'WAITING_TO_SYNC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Waiting to Synchronize</span>
          </span>
        );
      case 'SYNCHRONIZING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
            <span>Synchronizing</span>
          </span>
        );
      case 'SUCCESSFULLY_SYNCHRONIZED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Successfully Synchronized</span>
          </span>
        );
      case 'SYNCHRONIZATION_FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            <span>Synchronization Failed</span>
          </span>
        );
      case 'REQUIRES_USER_ATTENTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-700">
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span>Requires User Attention</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left"
        role="dialog"
        aria-modal="true"
        aria-label="Offline submissions drawer"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CloudOff className="w-5 h-5 text-[#0F8B8D]" />
              <h2 className="text-base font-bold text-[#102A43] dark:text-white">
                Pending Submissions Queue
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Idempotency-protected offline triage assessments in IndexedDB
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Controls Bar */}
        <div className="px-5 py-3.5 bg-teal-50/70 dark:bg-teal-950/30 border-b border-teal-100 dark:border-teal-900/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {isOnline ? 'Internet Connected' : 'Offline Mode (Local Storage Active)'}
            </span>
          </div>

          <button
            type="button"
            disabled={!isOnline || syncingAll || effectiveList.length === 0}
            onClick={handleSyncAll}
            className="px-3.5 py-1.5 rounded-lg bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`}
            />
            <span>{syncingAll ? 'Syncing...' : 'Sync All Pending'}</span>
          </button>
        </div>

        {/* Submissions List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {effectiveList.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  All Submissions Synchronized
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                  There are no pending offline cases. Assessments submitted offline will appear here and sync automatically upon reconnection.
                </p>
              </div>
            </div>
          ) : (
            effectiveList.map((item) => {
              const c = item.caseData;
              const isRetrying = retryingKey === item.idempotencyKey;
              return (
                <div
                  key={item.idempotencyKey}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-4 space-y-3 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Status & Idempotency Key */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      {getStatusBadge(item.status)}
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <Key className="w-3 h-3" />
                        <span className="truncate max-w-[220px]" title={item.idempotencyKey}>
                          {item.idempotencyKey}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Chief Complaint & Patient Info / Appointment / Document Details */}
                  {c && (
                    <>
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                        <div className="text-xs font-bold text-[#102A43] dark:text-white">
                          {c.chiefComplaint || 'Chief complaint not specified'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {c.patientName} • {c.patientAge}y • {c.patientGender} • Case #{c.caseNumber}
                        </div>
                      </div>

                      {c.vitals && (
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg text-[11px] font-mono">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">BP</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {c.vitals.systolicBp ? `${c.vitals.systolicBp}/${c.vitals.diastolicBp}` : 'Unknown'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">SpO₂</span>
                            <span className={`font-semibold ${c.vitals.oxygenSaturation && c.vitals.oxygenSaturation < 90 ? 'text-red-600 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                              {c.vitals.oxygenSaturation ? `${c.vitals.oxygenSaturation}%` : 'Unknown'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">HR</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {c.vitals.heartRate ? `${c.vitals.heartRate} bpm` : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {item.appointmentData && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <div className="text-xs font-bold text-[#102A43] dark:text-white">
                        Appointment: {item.appointmentData.hospitalName} ({item.appointmentData.department})
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.appointmentData.doctorName} • {item.appointmentData.appointmentDate} at {item.appointmentData.appointmentTime}
                      </div>
                    </div>
                  )}

                  {item.documentData && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <div className="text-xs font-bold text-[#102A43] dark:text-white">
                        Health Document: {item.documentData.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Category: {item.documentData.category} • File: {item.documentData.fileName}
                      </div>
                    </div>
                  )}

                  {/* Error Details if any */}
                  {item.errorDetails && (
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-[11px] text-red-700 dark:text-red-300 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span>{item.errorDetails}</span>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.idempotencyKey)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 font-medium flex items-center gap-1 p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      type="button"
                      disabled={!isOnline || isRetrying}
                      onClick={() => handleRetrySingle(item.idempotencyKey)}
                      className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                      <span>{isRetrying ? 'Retrying...' : 'Retry Sync'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Every record carries a unique idempotency key to prevent duplication even if connectivity drops mid-transmission.
          </span>
        </div>
      </div>
    </div>
  );
}
