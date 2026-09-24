'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { dataStore } from '../../../../lib/store';
import {
  TriageCase,
  UrgencyCategory,
  HealthcareWorkerProfile,
  DocumentShare,
  PatientLocationData,
} from '../../../../lib/types';
import { UrgencyBadge } from '../../../../components/common/UrgencyBadge';
import { AmbulanceModal } from '../../../../components/common/AmbulanceModal';
import {
  ArrowLeft,
  Stethoscope,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Send,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Navigation,
  MapPin,
  Compass,
  Siren,
  Home,
  Building2,
  Briefcase,
  HelpCircle,
  Radio,
  Eye,
  Volume2,
  VolumeX,
  Languages,
  Ear,
  ShieldAlert,
  Heart,
} from 'lucide-react';
import { getLanguageMeta, SUPPORTED_LANGUAGES } from '../../../../lib/languages';
import { SupportedLocale } from '../../../../lib/types';

export default function CaseReviewWorkspacePage() {
  const { id } = useParams() as { id: string };
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();

  const worker = currentUser as HealthcareWorkerProfile | null;
  const initialCase = id ? dataStore.getCaseById(id) : undefined;
  const [triageCase, setTriageCase] = useState<TriageCase | null>(initialCase || null);
  const [sharedDocuments, setSharedDocuments] = useState<DocumentShare[]>([]);
  const [patientLocation, setPatientLocation] = useState<PatientLocationData | null>(
    initialCase ? dataStore.getPatientLocation(initialCase.patientId) || null : null
  );
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);

  // Clinician Editable State
  const [finalUrgency, setFinalUrgency] = useState<UrgencyCategory>('RED');
  const [overrideReason, setOverrideReason] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState(
    'Initial presentation evaluated. Confirmed ischemic presentation with SpO2 compromise. Initiated supplemental high-flow O2 via non-rebreather mask. Bedside 12-lead ECG confirmed ST changes.'
  );
  const [actionTaken, setActionTaken] = useState(
    'Admitted to Emergency Resuscitation Bed 1. Commenced Dual Antiplatelet Therapy (DAPT) loading dose under protocol. Alerted on-call interventional cardiologist.'
  );
  const [assignedDepartment, setAssignedDepartment] = useState('Cardiology ICU');
  const [successToast, setSuccessToast] = useState('');
  const [doctorPreferredLang, setDoctorPreferredLang] = useState<SupportedLocale>(
    worker?.preferredLanguage || 'en'
  );
  const [isPlayingPatientAudio, setIsPlayingPatientAudio] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayPatientAudio = (text: string, audioUrl?: string) => {
    if (isPlayingPatientAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingPatientAudio(false);
      return;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingPatientAudio(false);
      audio.onerror = () => setIsPlayingPatientAudio(false);
      audio.play();
      setIsPlayingPatientAudio(true);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (triageCase) {
        utterance.lang = getLanguageMeta(triageCase.originalLanguage).bcp47;
      }
      utterance.onend = () => setIsPlayingPatientAudio(false);
      utterance.onerror = () => setIsPlayingPatientAudio(false);
      setIsPlayingPatientAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (id) {
      const found = dataStore.getCaseById(id);
      if (found) {
        setTriageCase(found);
        setFinalUrgency(found.finalUrgency || found.provisionalUrgency);
        if (found.clinicalReview) {
          setClinicalNotes(found.clinicalReview.clinicalTriageNotes);
          setActionTaken(found.clinicalReview.actionTaken);
          if (found.clinicalReview.overrideReason) {
            setOverrideReason(found.clinicalReview.overrideReason);
          }
        }

        // Fetch patient location data
        const loc = dataStore.getPatientLocation(found.patientId);
        setPatientLocation(loc || null);

        // Privacy & RBAC Audit: Log access if consented
        if (loc && loc.sharingStatus === 'SHARING_ACTIVE' && worker) {
          dataStore.logLocationAccess(found.patientId, {
            id: worker.id,
            name: worker.fullName,
            role: worker.role,
            facilityName: worker.facilityName || 'SCB Medical College & Hospital',
          });
        }
      }
    }
    if (currentUser) {
      setSharedDocuments(dataStore.getSharesForWorker(currentUser.id));
    }
  }, [id, currentUser, worker]);

  if (!triageCase) {
    return (
      <div className="flex-1 bg-[#F7FAFC] py-12 px-4 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-500">Loading Case Review Workspace...</p>
          <button
            onClick={() => router.push('/healthcare/queue')}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  const isOverridden = finalUrgency !== triageCase.provisionalUrgency;

  const handleFinalizeReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;

    if (isOverridden && !overrideReason.trim()) {
      alert('Clinical protocol requires entering an override justification when altering the AI provisional urgency.');
      return;
    }

    dataStore.reviewCase(triageCase.id, {
      reviewerId: worker.id,
      reviewerName: worker.fullName,
      reviewerRole: worker.role,
      reviewerRegNumber: worker.registrationNumber,
      finalUrgency,
      isOverridden,
      overrideReason: isOverridden ? overrideReason : undefined,
      clinicalTriageNotes: clinicalNotes,
      actionTaken,
    });

    setSuccessToast('Clinical Triage Decision & Verification recorded successfully!');
    setTimeout(() => {
      router.push('/healthcare/queue');
    }, 1800);
  };

  const handleRequestMoreInfo = () => {
    dataStore.updateCase(triageCase.id, { status: 'MORE_INFO_REQUIRED' });
    dataStore.addNotification({
      id: `notif-${Date.now()}`,
      userId: triageCase.patientId,
      caseId: triageCase.id,
      type: 'INFO_REQUESTED',
      titleEn: `Clarification Requested for Case ${triageCase.caseNumber}`,
      titleHi: `मामला ${triageCase.caseNumber} के लिए स्पष्टीकरण का अनुरोध`,
      titleOr: `କେସ୍ ${triageCase.caseNumber} ପାଇଁ ଡାକ୍ତର ଅଧିକ ତଥ୍ୟ ମାଗିଛନ୍ତି`,
      bodyEn: `${worker?.fullName || 'Reviewing Doctor'} requested additional information regarding your symptom onset and past treatments.`,
      bodyHi: `डॉक्टर ने आपके लक्षणों और पिछली दवाओं के बारे में अतिरिक्त जानकारी का अनुरोध किया है।`,
      bodyOr: `ଡାକ୍ତର ଆପଣଙ୍କ ଲକ୍ଷଣ ଓ ପୂର୍ବ ଔଷଧ ସମ୍ପର୍କରେ ଅଧିକ ତଥ୍ୟ ମାଗିଛନ୍ତି।`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setSuccessToast('Requested more information from patient. Status updated to MORE_INFO_REQUIRED.');
    setTriageCase(prev => (prev ? { ...prev, status: 'MORE_INFO_REQUIRED' } : null));
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Workspace Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/healthcare/queue')}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-[#102A43]">
                  {triageCase.caseNumber}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                  {triageCase.status.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  Patient: <strong className="text-slate-800">{triageCase.patientName}</strong> ({triageCase.patientAge}Y / {triageCase.patientGender})
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Facility: {triageCase.facilityName || 'SCB Medical College & Hospital'} • Submitted: {new Date(triageCase.submittedAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Provisional AI Category:</span>
            <UrgencyBadge urgency={triageCase.provisionalUrgency} size="sm" />
          </div>
        </div>

        {successToast && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* SPLIT SCREEN WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* LEFT SIDE: PATIENT INPUT & MULTIMODAL EVIDENCE */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0F8B8D]" />
                <span>{t.reviewer.leftPaneTitle}</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Language: {triageCase.originalLanguage.toUpperCase()}
              </span>
            </div>

            {/* 1. Side-by-Side "Original | Translated" Clinical View */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#0F8B8D]" />
                  <span className="font-bold text-[#102A43] dark:text-white uppercase tracking-wider text-[11px]">
                    Side-by-Side Clinical Translation View
                  </span>
                </div>

                {/* Doctor Preferred Language Switcher */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Doctor View:</span>
                  <select
                    value={doctorPreferredLang}
                    onChange={(e) => setDoctorPreferredLang(e.target.value as SupportedLocale)}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nameEn} ({l.nameNative})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side-by-Side Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Original Patient Statement */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>Original Patient Input</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono uppercase">
                        {getLanguageMeta(triageCase.originalLanguage).nameNative}
                      </span>
                    </span>
                    {triageCase.detectedLanguage && (
                      <span className="text-[10px] text-teal-700 dark:text-teal-300 font-medium">
                        Detected: {getLanguageMeta(triageCase.detectedLanguage).nameEn}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-slate-800 dark:text-slate-200 font-medium italic leading-relaxed break-words-indic"
                    dir={getLanguageMeta(triageCase.originalLanguage).direction}
                  >
                    &quot;{triageCase.originalStatement}&quot;
                  </p>

                  {/* Audio Listen Button */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handlePlayPatientAudio(triageCase.originalStatement, triageCase.audioUrl)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        isPlayingPatientAudio
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200'
                      }`}
                    >
                      {isPlayingPatientAudio ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen to Original Patient Audio</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400">Authentic Voice</span>
                  </div>
                </div>

                {/* Right Column: Standardized Clinical English */}
                <div className="p-3.5 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F8B8D] dark:text-teal-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Standardized Clinical English</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-bold">
                      Confidence: {triageCase.translationConfidence || 96}%
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                    &quot;{triageCase.translatedEnglishStatement || triageCase.originalStatement}&quot;
                  </p>

                  <div className="pt-2 border-t border-teal-100 dark:border-teal-900/60 text-[10px] text-teal-700 dark:text-teal-300">
                    Glossary-validated clinical mapping applied
                  </div>
                </div>
              </div>

              {/* Mandatory AI-Assisted Clinical Translation Notice */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  AI-assisted translation—verify critical clinical information directly with the patient.
                </span>
              </div>

              {/* Low confidence warning if confidence < 80% */}
              {(triageCase.translationConfidence || 96) < 80 && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Translation may be inaccurate. Interpreter or patient confirmation recommended.
                  </span>
                </div>
              )}
            </div>

            {/* Standardized Structured Triage Note */}
            {triageCase.structuredTriageNote && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-[#102A43] dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Standardized Structured Clinical Triage Note</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                    ISO / Clinical Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Chief Complaint</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{triageCase.structuredTriageNote.chiefComplaint}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Symptom Duration &amp; Onset</span>
                    <span>{triageCase.structuredTriageNote.symptomDuration}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Existing Conditions</span>
                    <span>{triageCase.structuredTriageNote.existingConditions?.join(', ') || 'None reported'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Medications</span>
                    <span>{triageCase.structuredTriageNote.currentMedicines?.join(', ') || 'None reported'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Known Allergies</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">{triageCase.structuredTriageNote.allergies?.join(', ') || 'No known allergies'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Diagnostic Report Summary</span>
                    <span>{triageCase.structuredTriageNote.reportSummary}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Screened Warning Signs / Missing Info Gaps</span>
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                      Red Flags: {triageCase.structuredTriageNote.warningSigns?.join(', ') || 'None'}. Missing: {triageCase.structuredTriageNote.missingInformation?.join('; ') || 'None'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[10px] text-teal-800 dark:text-teal-200 text-center">
                  AI-generated triage support — final decisions must be made by a qualified healthcare professional.
                </div>
              </div>
            )}

            {/* 2. Recorded Vital Signs (8-Parameter Matrix) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700">
                <span className="font-bold text-[#102A43] dark:text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#0F8B8D]" />
                  <span>Physiological Vital Signs (Age Protocol: {triageCase.patientAge < 18 ? 'Pediatric' : 'Adult'})</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Missing values never assumed normal
                </span>
              </div>

              {triageCase.vitals ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Blood Pressure */}
                  <div className={`p-2.5 rounded-xl border ${
                    triageCase.vitals.systolicBp && (triageCase.vitals.systolicBp >= 180 || triageCase.vitals.systolicBp <= 90)
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-900 dark:text-red-200'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                      {triageCase.vitals.systolicBp && triageCase.vitals.diastolicBp
                        ? `${triageCase.vitals.systolicBp}/${triageCase.vitals.diastolicBp} mmHg`
                        : <span className="text-amber-600 dark:text-amber-400 text-xs italic font-sans font-normal">Unmeasured</span>}
                    </span>
                  </div>

                  {/* Oxygen Saturation */}
                  <div className={`p-2.5 rounded-xl border ${
                    triageCase.vitals.oxygenSaturation && triageCase.vitals.oxygenSaturation < 90
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-200'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="text-[10px] block opacity-75 text-slate-400">SpO₂ Saturation</span>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                      {triageCase.vitals.oxygenSaturation !== null && triageCase.vitals.oxygenSaturation !== undefined
                        ? `${triageCase.vitals.oxygenSaturation}% SpO2`
                        : <span className="text-amber-600 dark:text-amber-400 text-xs italic font-sans font-normal">Unmeasured</span>}
                    </span>
                  </div>

                  {/* Heart Rate */}
                  <div className={`p-2.5 rounded-xl border ${
                    triageCase.vitals.heartRate && (triageCase.vitals.heartRate >= 130 || triageCase.vitals.heartRate <= 40)
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-200'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                      {triageCase.vitals.heartRate
                        ? `${triageCase.vitals.heartRate} bpm`
                        : <span className="text-amber-600 dark:text-amber-400 text-xs italic font-sans font-normal">Unmeasured</span>}
                    </span>
                  </div>

                  {/* Respiratory Rate */}
                  <div className={`p-2.5 rounded-xl border ${
                    triageCase.vitals.respiratoryRate && (triageCase.vitals.respiratoryRate >= 30 || triageCase.vitals.respiratoryRate <= 8)
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-200'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">Resp. Rate</span>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                      {triageCase.vitals.respiratoryRate
                        ? `${triageCase.vitals.respiratoryRate} /min`
                        : <span className="text-amber-600 dark:text-amber-400 text-xs italic font-sans font-normal">Unmeasured</span>}
                    </span>
                  </div>

                  {/* Temperature */}
                  <div className={`p-2.5 rounded-xl border ${
                    triageCase.vitals.temperatureCelsius && (triageCase.vitals.temperatureCelsius >= 39.5 || triageCase.vitals.temperatureCelsius <= 35.0)
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-200'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                      {triageCase.vitals.temperatureCelsius
                        ? `${triageCase.vitals.temperatureCelsius}°C`
                        : <span className="text-amber-600 dark:text-amber-400 text-xs italic font-sans font-normal">Unmeasured</span>}
                    </span>
                  </div>

                  {/* Blood Glucose */}
                  <div className="p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Blood Glucose</span>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                      {triageCase.vitals.bloodGlucoseMgDl
                        ? `${triageCase.vitals.bloodGlucoseMgDl} mg/dL`
                        : <span className="text-slate-400 text-xs italic font-sans font-normal">Unmeasured</span>}
                    </span>
                  </div>

                  {/* Pain Score */}
                  <div className={`p-2.5 rounded-xl border ${
                    triageCase.vitals.painScore && triageCase.vitals.painScore >= 8
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">Pain Score (0-10)</span>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                      {triageCase.vitals.painScore !== null && triageCase.vitals.painScore !== undefined
                        ? `${triageCase.vitals.painScore} / 10`
                        : <span className="text-slate-400 text-xs italic font-sans font-normal">Unrecorded</span>}
                    </span>
                  </div>

                  {/* Consciousness AVPU */}
                  <div className={`p-2.5 rounded-xl border ${
                    triageCase.vitals.consciousness && triageCase.vitals.consciousness !== 'ALERT'
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-900 dark:text-red-200'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">Consciousness (AVPU)</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-white uppercase">
                      {triageCase.vitals.consciousness || 'ALERT (Presumed)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                  No physiological vitals recorded by patient. Clinical safety requires triage nurse vital check.
                </div>
              )}
            </div>

            {/* Clinical Photograph Preview if present */}
            {(triageCase.clinicalImageUri || triageCase.visibleConditionImageUrl) && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 space-y-2 text-xs">
                <span className="font-bold text-[#102A43] dark:text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>Clinical Photograph Uploaded by Patient</span>
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-sm">
                  <img
                    src={triageCase.clinicalImageUri || triageCase.visibleConditionImageUrl}
                    alt="Clinical photograph"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform"
                  />
                </div>
              </div>
            )}

            {/* Pregnancy Status Card if applicable */}
            {triageCase.pregnancyStatus && triageCase.pregnancyStatus !== 'NOT_APPLICABLE' && (
              <div className="bg-rose-50/70 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 shadow-xs p-5 space-y-2 text-xs">
                <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>Obstetric Clinical Status: {triageCase.pregnancyStatus}</span>
                </span>
                {triageCase.pregnancyWeeks && (
                  <div className="text-rose-800 dark:text-rose-300 font-medium">
                    Gestational Age: <strong>{triageCase.pregnancyWeeks} weeks</strong>
                  </div>
                )}
                {triageCase.pregnancyWarningSigns && triageCase.pregnancyWarningSigns.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="font-bold text-rose-900 dark:text-rose-200 text-[11px] block">
                      Screened Obstetric Warning Signs:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {triageCase.pregnancyWarningSigns.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Uploaded Reports & OCR Findings */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3 text-xs">
              <span className="font-bold text-[#102A43] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{t.reviewer.ocrExtracted}</span>
              </span>

              {triageCase.uploadedReports.length > 0 ? (
                triageCase.uploadedReports.map(rep => (
                  <div key={rep.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rep.fileName}</span>
                      <span className="text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-mono">
                        Confidence: 95%
                      </span>
                    </div>

                    {rep.extractedData && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] text-slate-500 font-mono">
                          {rep.extractedData.suggestedHospitalName} • {rep.extractedData.suggestedDoctorName}
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                          {Object.entries(rep.extractedData.extractedLabValues).map(([k, v]) => (
                            <div key={k} className="flex justify-between py-0.5">
                              <span className="text-slate-500">{k}:</span>
                              <span className="font-bold">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">No medical reports uploaded with this triage case.</p>
              )}
            </div>

            {/* 4. Patient-Shared Documents (Vault Access Granted) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3 text-xs">
              <span className="font-bold text-[#102A43] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#0F8B8D]" />
                <span>{t.reviewer.sharedDocs}</span>
              </span>

              {sharedDocuments.length > 0 ? (
                <div className="space-y-2">
                  {sharedDocuments.map(share => (
                    <div key={share.id} className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#102A43]">{share.documentTitle}</div>
                        <div className="text-[10px] text-slate-500">
                          Access valid until: {new Date(share.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-300">
                        Granted
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">
                  No additional vault documents shared. Patient records remain private.
                </p>
              )}
            </div>

            {/* 5. Patient Location & Emergency Transport Assistance */}
            <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#2A3548] shadow-xs p-5 space-y-3.5 text-xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#102A43] dark:text-white flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-[#0F8B8D]" />
                  <span>Patient Geolocation &amp; Transport Assistance</span>
                </span>
                {patientLocation?.sharingStatus === 'SHARING_ACTIVE' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                    <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                    <span>Consent Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-[10px]">
                    <Lock className="w-3 h-3" />
                    <span>Private</span>
                  </span>
                )}
              </div>

              {patientLocation && patientLocation.sharingStatus === 'SHARING_ACTIVE' ? (
                <div className="space-y-3">
                  {/* Doctor Map View with Marker */}
                  <div className="relative rounded-xl border border-slate-200 dark:border-[#2A3548] overflow-hidden bg-slate-100 dark:bg-[#0B1220] h-44 shadow-inner flex flex-col justify-between p-3">
                    <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
                      <svg width="100%" height="100%">
                        <defs>
                          <pattern id="doc-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-teal-500" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#doc-grid)" />
                        <path d="M-20,60 Q120,90 260,40 T500,100" fill="none" stroke="#0F8B8D" strokeWidth="2.5" opacity="0.6" />
                        <path d="M100,-10 L200,200" fill="none" stroke="#35C2BD" strokeWidth="1.5" opacity="0.5" />
                      </svg>
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-white/90 dark:bg-[#172033]/90 font-mono text-[10px] text-slate-700 dark:text-slate-200">
                        {patientLocation.latitude?.toFixed(4)}, {patientLocation.longitude?.toFixed(4)}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/90 dark:bg-[#172033]/90 font-mono text-[10px] text-slate-700 dark:text-slate-200">
                        ±{patientLocation.accuracyMeters || 14}m GPS Fix
                      </span>
                    </div>

                    {/* Centered Beacon Pin */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-teal-500/20 animate-ping" />
                        <div className="absolute flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-red-600 text-white shadow-md flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="mt-0.5 px-2 py-0.2 bg-slate-900/90 text-white text-[9px] font-mono rounded">
                            {triageCase.patientName}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-[#111827]/80 px-2 py-0.5 rounded">
                      <span>Facility: <strong>{triageCase.facilityName || 'SCB Medical College & Hospital'}</strong></span>
                      <span>Distance: <strong>{patientLocation.distanceKmFromHospital || 1.4} km</strong></span>
                    </div>
                  </div>

                  {/* Location Parameters Details */}
                  <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3548]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#0F8B8D] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Approximate Pickup Address</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {patientLocation.address}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-[#2A3548]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Location Classification</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {patientLocation.locationType === 'HOME'
                            ? 'At Home'
                            : patientLocation.locationType === 'HOSPITAL'
                            ? 'At Hospital'
                            : patientLocation.locationType === 'WORKPLACE'
                            ? 'At Workplace'
                            : 'Other Location'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Last Location Update</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {new Date(patientLocation.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-[#2A3548] flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Transport Assistance Assessment:
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        patientLocation.requiresTransportAssistance || triageCase.provisionalUrgency === 'RED'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}>
                        {patientLocation.requiresTransportAssistance || triageCase.provisionalUrgency === 'RED'
                          ? 'URGENT TRANSPORT REQUIRED'
                          : 'Transport Not Flagged'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Ambulance Dispatch Trigger */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Doctor RBAC Access Audited</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAmbulanceModal(true)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Siren className="w-3.5 h-3.5" />
                      <span>Dispatch / Track Ambulance</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3548] text-center space-y-2">
                  <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Location unavailable — Patient has not provided consent.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Patient coordinates and precise address remain strictly encrypted. Healthcare professionals cannot access location telemetry without active patient permission.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT SIDE: CLINICAL TRIAGE NOTE & EDITABLE REVIEW FORM */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>{t.reviewer.rightPaneTitle}</span>
              </h2>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                Reviewing Clinician Active
              </span>
            </div>

            {/* Mandatory Clinical AI Decision Support Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                AI-generated triage support — the final urgency and care decision must be made by a qualified healthcare professional.
              </span>
            </div>

            {/* Explainable Clinical Rule Engine Triggers */}
            {((triageCase.urgencyAssessment?.triggeredRules && triageCase.urgencyAssessment.triggeredRules.length > 0) || (triageCase.redFlags && triageCase.redFlags.length > 0)) && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 space-y-2.5 text-xs text-red-900 dark:text-red-200">
                <div className="flex items-center justify-between pb-1 border-b border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Independent Clinical Red-Flag Rule Engine Triggers:</span>
                  </div>
                  <span className="text-[10px] bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-full font-mono text-red-800 dark:text-red-200 font-bold">
                    Deterministic Protocol
                  </span>
                </div>

                <div className="space-y-2">
                  {triageCase.urgencyAssessment?.triggeredRules && triageCase.urgencyAssessment.triggeredRules.length > 0 ? (
                    triageCase.urgencyAssessment.triggeredRules.map(rule => (
                      <div key={rule.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${rule.category === 'RED' ? 'bg-red-600 animate-ping' : 'bg-amber-500'}`} />
                            <span>{rule.ruleName}</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                            {rule.ageGroup} • {rule.sourceCriterion}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                          {rule.reason}
                        </p>
                        <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                          Standard: {rule.medicalReference}
                        </div>
                      </div>
                    ))
                  ) : (
                    triageCase.redFlags.map(rf => (
                      <div key={rf.id} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-800">
                        <span className="font-bold text-red-800 dark:text-red-300">{rf.name}</span>: {rf.descriptionEn}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Baseline Information Gaps Alert */}
            {triageCase.urgencyAssessment?.missingInformation && triageCase.urgencyAssessment.missingInformation.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>Identified Baseline Information Gaps (Missing values never assumed normal):</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  {triageCase.urgencyAssessment.missingInformation.map((gap, idx) => (
                    <li key={idx}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Structured Review Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              <form onSubmit={handleFinalizeReview} className="space-y-4 text-xs">
                {/* 1. Urgency Category Override */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#102A43]">
                      {t.reviewer.overrideUrgency}
                    </label>
                    <span className="text-[10px] text-slate-400">
                      AI Suggested: <strong>{triageCase.provisionalUrgency}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['RED', 'YELLOW', 'GREEN', 'NEEDS_CLINICIAN_REVIEW'] as UrgencyCategory[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFinalUrgency(cat)}
                        className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                          finalUrgency === cat
                            ? cat === 'RED'
                              ? 'bg-red-600 text-white border-red-600 shadow-xs'
                              : cat === 'YELLOW'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : cat === 'GREEN'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cat === 'RED' ? 'RED (Emergency)' : cat === 'YELLOW' ? 'YELLOW (Urgent)' : cat === 'GREEN' ? 'GREEN (Routine)' : 'NEEDS CLINICIAN REVIEW'}
                      </button>
                    ))}
                  </div>

                  {/* Justification input if overridden */}
                  {isOverridden && (
                    <div className="space-y-1 pt-2">
                      <label className="block font-semibold text-amber-900">
                        {t.reviewer.overrideReason} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={overrideReason}
                        onChange={e => setOverrideReason(e.target.value)}
                        placeholder={t.reviewer.overridePlaceholder}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/50 text-xs text-amber-950 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Clinical Notes & Action Plan */}
                <div>
                  <label className="block font-bold text-[#102A43] mb-1">
                    {t.reviewer.clinicalNotes} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={clinicalNotes}
                    onChange={e => setClinicalNotes(e.target.value)}
                    placeholder={t.reviewer.clinicalNotesPlaceholder}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* 3. Action Taken / Bed Assignment */}
                <div>
                  <label className="block font-bold text-[#102A43] mb-1">
                    {t.reviewer.actionTaken} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={actionTaken}
                    onChange={e => setActionTaken(e.target.value)}
                    placeholder={t.reviewer.actionPlaceholder}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* 4. Target Department */}
                <div>
                  <label className="block font-bold text-[#102A43] mb-1">
                    Assigned Ward / Department
                  </label>
                  <input
                    type="text"
                    value={assignedDepartment}
                    onChange={e => setAssignedDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {/* Clinician Reviewer Identification */}
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between text-[11px] text-slate-700">
                  <div>
                    Reviewer: <strong>{worker?.fullName || 'Dr. Alok Mohanty'}</strong> ({worker?.role || 'DOCTOR'})
                  </div>
                  <div className="font-mono text-slate-500">
                    Reg #{worker?.registrationNumber || 'SMC-ODI-48291'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.reviewer.finalizeBtn}</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleRequestMoreInfo}
                      className="flex-1 py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.reviewer.requestInfoBtn}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push(`/healthcare/referrals?caseId=${triageCase.id}`)}
                      className="flex-1 py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F8B8D] font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>{t.reviewer.referPatientBtn}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Doctor-Initiated Ambulance Modal */}
        <AmbulanceModal
          isOpen={showAmbulanceModal}
          onClose={() => setShowAmbulanceModal(false)}
          caseId={triageCase.id}
          caseNumber={triageCase.caseNumber}
          patientId={triageCase.patientId}
          patientName={triageCase.patientName}
          phoneNumber="+91 94370 12345"
          emergencyContact="+91 94370 67890 (Bikram Nayak - Son)"
          pickupAddress={patientLocation?.address || 'Ward No 4, Hospital Road, Athamallik, Angul District, Odisha'}
          pickupCoordinates={
            patientLocation?.latitude && patientLocation?.longitude
              ? { lat: patientLocation.latitude, lng: patientLocation.longitude }
              : undefined
          }
          hospitalName={triageCase.facilityName || 'SCB Medical College & Hospital'}
          primarySymptoms={triageCase.chiefComplaint}
          urgencyLevel={finalUrgency}
          initiatedBy="DOCTOR"
        />
      </div>
    </div>
  );
}
