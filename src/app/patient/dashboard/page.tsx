'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { TriageCase, Appointment, HealthDocument, PatientProfile } from '../../../lib/types';
import { UrgencyBadge } from '../../../components/common/UrgencyBadge';
import { translateCaseStatus } from '../../../lib/clinical-safety-translations';
import {
  Sparkles,
  Calendar,
  FolderLock,
  ArrowRight,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  FileText,
  Siren,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  CloudOff,
  ShieldCheck,
} from 'lucide-react';
import { LocationCard } from '../../../components/patient/LocationCard';
import { AmbulanceModal } from '../../../components/common/AmbulanceModal';
import { LanguageSelector } from '../../../components/common/LanguageSelector';

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const { t, formatDate } = useLanguage();
  const router = useRouter();

  const [cases, setCases] = useState<TriageCase[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);

  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<HealthDocument | null>(null);
  const [previewSignedUrl, setPreviewSignedUrl] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<HealthDocument | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  const patient = currentUser as PatientProfile | null;

  const loadDocuments = () => {
    if (!currentUser) return;
    setIsLoadingDocs(true);
    setDocsError(null);
    try {
      // Strictly load documents for currently authenticated patient, sorted latest first
      const userDocs = dataStore.getDocuments(currentUser.id);
      setDocuments(userDocs);
    } catch {
      setDocsError('Unable to load documents. Please retry.');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setCases(dataStore.getCasesByPatientId(currentUser.id));
      setAppointments(dataStore.getAppointments(currentUser.id));
      loadDocuments();
    }
  }, [currentUser]);

  const recentCase = cases[0];

  const isAppointmentUpcoming = (a: Appointment) => {
    if (a.status !== 'UPCOMING' && a.status !== 'RESCHEDULED') return false;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = a.appointmentDate.split('-').map(Number);
      const apptDate = new Date(year, month - 1, day);
      return apptDate.getTime() >= today.getTime();
    } catch {
      return false;
    }
  };

  const upcomingAppointment = appointments
    .filter(isAppointmentUpcoming)
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0];

  const handlePreviewDoc = (doc: HealthDocument) => {
    if (!currentUser) return;
    setPreviewDoc(doc);
    const signedUrl = dataStore.getSignedDocumentUrl(doc, 3600);
    setPreviewSignedUrl(signedUrl);
  };

  const handleDownloadDoc = (doc: HealthDocument) => {
    if (!currentUser) return;
    const signedUrl = dataStore.getSignedDocumentUrl(doc, 3600);
    const link = document.createElement('a');
    link.href = signedUrl;
    link.download = doc.title || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeDeleteDocument = () => {
    if (!docToDelete || !currentUser) return;
    try {
      dataStore.deleteDocument(docToDelete.id);
      setDocuments(prev => prev.filter(d => d.id !== docToDelete.id));
      setDeleteSuccessMsg(`"${docToDelete.title}" was permanently removed.`);
      setTimeout(() => setDeleteSuccessMsg(''), 3500);
    } catch {
      alert('Failed to delete document. Please try again.');
    } finally {
      setDocToDelete(null);
    }
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Delete Success Toast */}
        {deleteSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{deleteSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setDeleteSuccessMsg('')}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-[#0F8B8D] dark:text-teal-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t.dashboard.verifiedHealthId} • {patient?.syntheticId || 'PAT-2026-8912'}</span>
              </div>
              <div className="bg-slate-800 text-white rounded-lg p-0.5">
                <LanguageSelector />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] dark:text-white">
              {t.dashboard.welcome}, {patient?.fullName || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.dashboard.locationLabel}: {patient?.location || 'Angul, Odisha'} • {t.dashboard.maskedIdLabel}: {patient?.maskedAadhaar || 'XXXX-XXXX-8912'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setShowAmbulanceModal(true)}
              className="py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Siren className="w-4 h-4 animate-pulse" />
              <span>{t.location.requestAmbulance}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/patient/triage')}
              className="py-3 px-5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>{t.dashboard.startTriageBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/90 dark:border-red-900/60 text-red-900 dark:text-red-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-red-700 dark:text-red-300">{t.dashboard.emergencyCareQuestion}</span>
              <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
                {t.ambulance.lifeThreatNotice}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:112"
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t.dashboard.call112}</span>
            </a>
            <button
              type="button"
              onClick={() => setShowAmbulanceModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-slate-700 text-red-700 dark:text-red-300 font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>{t.dashboard.ambulanceShort}</span>
            </button>
          </div>
        </div>

        {/* Consent-Based GPS Location Card */}
        <LocationCard
          patientId={patient?.id || 'pat-001'}
          patientName={patient?.fullName || 'Ramesh Nayak'}
          phoneNumber={patient?.phoneNumber || '+91 94370 12345'}
          emergencyContact={patient?.emergencyContactPhone || '+91 94370 67890'}
        />

        {/* 2-Column Grid: Active Triage Status & Upcoming Appointment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Triage Status Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.dashboard.activeTriageStatus}
                </span>
                {recentCase && <UrgencyBadge urgency={recentCase.provisionalUrgency} size="sm" />}
              </div>

              {recentCase ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-[#102A43] dark:text-white">
                      {t.dashboard.caseNumberLabel} #{recentCase.caseNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(recentCase.submittedAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    &quot;{recentCase.chiefComplaint}&quot;
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>
                      {t.dashboard.statusLabel}: <strong className="text-slate-800 dark:text-slate-200">{translateCaseStatus(recentCase.status, t)}</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                  {t.dashboard.noActiveCase}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
              {recentCase ? (
                <button
                  type="button"
                  onClick={() => router.push(`/patient/cases/${recentCase.id}`)}
                  className="text-xs font-semibold text-[#0F8B8D] dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>{t.dashboard.trackCaseAndNotes}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/patient/triage')}
                  className="text-xs font-semibold text-[#0F8B8D] dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>{t.dashboard.beginGuidedTriage}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Upcoming Appointment Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.dashboard.upcomingAppointment}
                </span>
                <Calendar className="w-4 h-4 text-[#0F8B8D] dark:text-teal-400" />
              </div>

              {upcomingAppointment ? (
                <div className="space-y-2">
                  <div className="text-sm font-bold text-[#102A43] dark:text-white">
                    {upcomingAppointment.hospitalName}
                  </div>
                  <div className="text-xs text-[#0F8B8D] dark:text-teal-400 font-medium">
                    {upcomingAppointment.department} • {upcomingAppointment.doctorName}
                  </div>
                  <div className="p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{t.common.date}: <strong>{formatDate(upcomingAppointment.appointmentDate)}</strong></span>
                    <span>{t.common.time}: <strong>{upcomingAppointment.appointmentTime}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {t.dashboard.locationLabel}: {upcomingAppointment.locationRoom || 'OPD Room'}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                  {t.dashboard.noUpcomingAppt}.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
              <button
                type="button"
                onClick={() => router.push('/patient/appointments')}
                className="text-xs font-semibold text-[#0F8B8D] dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>{t.dashboard.viewAllAppointments}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access Shortcuts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => router.push('/patient/cases')}
            className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0F8B8D] dark:hover:border-teal-500 shadow-xs text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0F8B8D] dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102A43] dark:text-white">
                  {t.nav.myCases} ({cases.length})
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.dashboard.quickCasesDesc}
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/patient/appointments')}
            className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0F8B8D] dark:hover:border-teal-500 shadow-xs text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102A43] dark:text-white">
                  {t.nav.appointments} ({appointments.length})
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.dashboard.quickApptsDesc}
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/patient/documents')}
            className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0F8B8D] dark:hover:border-teal-500 shadow-xs text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderLock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102A43] dark:text-white">
                  {t.nav.healthDocs} ({documents.length})
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.dashboard.quickDocsDesc}
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/patient/documents')}
            className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0F8B8D] dark:hover:border-teal-500 shadow-xs text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102A43] dark:text-white">
                  {t.vault.uploadBtn}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.dashboard.quickUploadDesc}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* ======================================================== */}
        {/* RECENT HEALTH DOCUMENTS SECTION (FUNCTIONAL FIX) */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-[#0F8B8D] dark:text-teal-400" />
              <h2 className="text-sm font-bold text-[#102A43] dark:text-white uppercase tracking-wider">
                {t.vault.recentDocs}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                {documents.length} {t.dashboard.totalLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDocuments}
                disabled={isLoadingDocs}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Refresh document list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin text-teal-600' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => router.push('/patient/documents')}
                className="text-xs font-semibold text-[#0F8B8D] dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>{t.dashboard.viewAll} ({documents.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingDocs && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 space-y-2.5">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error State with Retry */}
          {!isLoadingDocs && docsError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{docsError}</span>
              </div>
              <button
                type="button"
                onClick={loadDocuments}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
              >
                {t.dashboard.retryBtn}
              </button>
            </div>
          )}

          {/* Document Cards List (Filtered by Authenticated Patient, Latest First) */}
          {!isLoadingDocs && !docsError && documents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {documents.slice(0, 3).map((doc) => {
                const isPendingSync = doc.syncStatus === 'PENDING_SYNC' || doc.syncStatus === 'SAVED_OFFLINE';
                const isOcrComplete = doc.ocrStatus === 'EXTRACTION_COMPLETE';
                const isOcrFailed = doc.ocrStatus === 'FAILED';
                const isVerified = doc.verificationStatus === 'VERIFIED';
                const isFlagged = doc.verificationStatus === 'FLAGGED';

                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 hover:border-[#0F8B8D] dark:hover:border-teal-500 shadow-2xs transition-all space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {doc.category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {doc.uploadDate || doc.documentDate}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white line-clamp-1" title={doc.title}>
                        {doc.title}
                      </h4>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {doc.hospitalName || doc.doctorName || 'District Headquarters Hospital'}
                      </div>

                      {/* Status Badges: Verification, OCR, Offline Sync */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {/* Offline Sync Status */}
                        {isPendingSync && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                            <CloudOff className="w-3 h-3 text-amber-600 animate-pulse" />
                            <span>{t.dashboard.pendingSync}</span>
                          </span>
                        )}

                        {/* Verification Status */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isVerified
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                              : isFlagged
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{isVerified ? t.dashboard.clinicianVerified : isFlagged ? t.dashboard.reviewFlagged : t.dashboard.pendingReview}</span>
                        </span>

                        {/* OCR Status */}
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            isOcrComplete
                              ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                              : isOcrFailed
                              ? 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {isOcrComplete ? `${t.dashboard.ocrComplete} ${doc.ocrConfidence ? `(${doc.ocrConfidence}%)` : ''}` : isOcrFailed ? t.dashboard.ocrFailed : t.dashboard.ocrPending}
                        </span>
                      </div>
                    </div>

                    {/* Functional Card Actions: Preview, Download, Delete */}
                    <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handlePreviewDoc(doc)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-[#0F8B8D] dark:text-teal-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Secure authenticated preview"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{t.common.preview}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                          title="Download document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDocToDelete(doc)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete document with confirmation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoadingDocs && !docsError && documents.length === 0 && (
            <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
              <FolderLock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {t.dashboard.noDocsYet}
              </p>
              <button
                type="button"
                onClick={() => router.push('/patient/documents')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.dashboard.uploadFirstReport}</span>
              </button>
            </div>
          )}
        </div>

        {/* Global Ambulance Modal */}
        <AmbulanceModal
          isOpen={showAmbulanceModal}
          onClose={() => setShowAmbulanceModal(false)}
          patientId={patient?.id || 'pat-001'}
          patientName={patient?.fullName || 'Ramesh Nayak'}
          phoneNumber={patient?.phoneNumber || '+91 94370 12345'}
          emergencyContact={patient?.emergencyContactPhone || '+91 94370 67890'}
          pickupAddress={patient?.location || 'Ward No 4, Hospital Road, Athamallik, Angul District, Odisha'}
          hospitalName="Athamallik Sub-Divisional Hospital (SCB Tele-Triage Network)"
          primarySymptoms="Emergency dispatch requested from patient portal"
          urgencyLevel="RED"
          initiatedBy="PATIENT"
        />

        {/* ======================================================== */}
        {/* SECURE DOCUMENT PREVIEW MODAL */}
        {/* ======================================================== */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0F8B8D] dark:text-teal-400" />
                  <div>
                    <h3 className="text-sm font-bold text-[#102A43] dark:text-white truncate max-w-md">
                      {previewDoc.title}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {previewDoc.category} • {previewDoc.hospitalName || 'District HQ Hospital'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc(null);
                    setPreviewSignedUrl(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Secure Preview Body */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {/* Security and Signed URL Notice */}
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{t.dashboard.secureSignedNotice}</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                    {t.dashboard.encryptedBadge}
                  </span>
                </div>

                {/* Document Metadata Table */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">{t.dashboard.uploadedOnLabel}:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{previewDoc.uploadDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.dashboard.verificationLabel}:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{previewDoc.verificationStatus || 'PENDING_REVIEW'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t.dashboard.ocrExtractionLabel}:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{previewDoc.ocrStatus || 'EXTRACTION_COMPLETE'}</strong>
                  </div>
                </div>

                {/* Extracted Findings Preview */}
                {previewDoc.extractedData && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      {t.dashboard.extractedValuesLabel}:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {Object.entries(previewDoc.extractedData.extractedLabValues || {}).map(([k, v]) => (
                        <div key={k} className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between">
                          <span className="text-slate-500 capitalize">{k}:</span>
                          <strong className="text-slate-800 dark:text-white font-mono">{String(v)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safe Document Frame or Image Preview */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center min-h-[180px]">
                  {previewSignedUrl && (previewDoc.mimeType?.startsWith('image/') || previewDoc.fileUri?.endsWith('.png') || previewDoc.fileUri?.endsWith('.jpg')) ? (
                    <img
                      src={previewSignedUrl}
                      alt={previewDoc.title}
                      className="max-h-72 object-contain w-full"
                    />
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <FileText className="w-10 h-10 text-teal-600 dark:text-teal-400 mx-auto" />
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t.dashboard.pdfEncryptedDoc}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(previewDoc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F8B8D] text-white text-xs font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t.dashboard.downloadPdf}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.common.download}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc(null);
                    setPreviewSignedUrl(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#0F8B8D] text-white text-xs font-semibold"
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* ======================================================== */}
        {docToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                    {t.dashboard.confirmDocDeletion}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">&quot;{docToDelete.title}&quot;</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                {t.common.facility}: <strong>{docToDelete.hospitalName || 'District HQ Hospital'}</strong> • Category: <strong>{docToDelete.category}</strong>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDocToDelete(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={executeDeleteDocument}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.dashboard.deleteDocBtn}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
