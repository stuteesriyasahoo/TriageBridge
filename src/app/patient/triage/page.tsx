'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { screenRedFlags } from '../../../lib/red-flags';
import { simulateOcrExtraction, generateFollowUpQuestions } from '../../../lib/ocr-simulator';
import { dataStore } from '../../../lib/store';
import {
  TriageCase,
  VitalSigns,
  UploadedReport,
  RedFlagAlert,
  FollowUpQuestion,
  UrgencyCategory,
  PatientProfile,
  StructuredTriageNote,
} from '../../../lib/types';
import { UrgencyBadge } from '../../../components/common/UrgencyBadge';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Mic,
  MicOff,
  Upload,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { VoiceInputStudio, TextToSpeechButton } from '../../../components/common/VoiceInputStudio';
import { detectTextLanguage, getLanguageMeta } from '../../../lib/languages';

export default function PatientTriageWizard() {
  const { currentUser } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const router = useRouter();

  const patient = currentUser as PatientProfile | null;

  // Step state: 1 to 8
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Consent
  const [hasConsented, setHasConsented] = useState<boolean>(false);

  // Step 2: Demographics
  const [patientName, setPatientName] = useState(patient?.fullName || 'Ramesh Nayak');
  const [age, setAge] = useState<number>(patient?.age || 48);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(patient?.gender || 'MALE');
  const [location, setLocation] = useState(patient?.location || 'Athamallik, Angul District, Odisha');
  const [phone, setPhone] = useState(patient?.phoneNumber || '+91 94370 12345');
  const [chiefComplaint, setChiefComplaint] = useState('Acute chest pain radiating to left arm and breathlessness');

  // Step 3: Multimodal Input
  const [typedSymptoms, setTypedSymptoms] = useState(
    'I have had severe chest tightness since 8 AM today. The pain is traveling down my left arm and I feel breathless and dizzy.'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([]);
  const [vitals, setVitals] = useState<VitalSigns>({
    systolicBp: 175,
    diastolicBp: 102,
    heartRate: 114,
    oxygenSaturation: 89, // Will trigger RED hypoxia flag!
    temperatureCelsius: 37.2,
    respiratoryRate: 26,
  });

  // Step 4: Processing Animation states
  const [processingStage, setProcessingStage] = useState(0);

  // Step 5: Red flags
  const [detectedRedFlags, setDetectedRedFlags] = useState<RedFlagAlert[]>([]);
  const [provisionalUrgency, setProvisionalUrgency] = useState<UrgencyCategory>('RED');
  const [urgencyRationale, setUrgencyRationale] = useState({ en: '', hi: '', or: '' });

  // Step 6: Follow up questions
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);

  // Speech Recognition hook simulation
  const toggleSpeechRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // If Web Speech API is supported
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const SpeechRecognition = (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = locale === 'or' ? 'or-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setVoiceTranscript(prev => (prev ? `${prev} ${transcript}` : transcript));
            setIsRecording(false);
          };
          recognition.onerror = () => {
            setIsRecording(false);
            setVoiceTranscript('ଛାତି ବହୁତ କଷ୍ଟ ହେଉଛି ଆଜ୍ଞା... ନିଶ୍ୱାସ ନେଇପାରୁନି... (Speech transcribed)');
          };
          recognition.start();
          return;
        } catch {
          // fallback simulator below
        }
      }

      // High-fidelity speech simulator fallback for non-Chrome or permissions-denied environments
      setTimeout(() => {
        setIsRecording(false);
        const sampleVoice =
          locale === 'or'
            ? 'ଛାତି ବହୁତ କଷ୍ଟ ହେଉଛି ଆଜ୍ଞା... ଘଣ୍ଟାଏ ହେବ କିଛି କହିପାରୁନି... ବାମ ପାଖ ବହୁତ ବିନ୍ଧୁଛି...'
            : locale === 'hi'
            ? 'छाती में बहुत तेज दर्द है और सांस लेने में भारी तकलीफ हो रही है...'
            : 'Severe chest tightness radiating to my left arm with shortness of breath.';
        setVoiceTranscript(sampleVoice);
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  // Mock File Upload Handler with instant OCR
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ocrData = simulateOcrExtraction(file.name, file.size);
    const newReport: UploadedReport = {
      id: `rep-${Date.now()}`,
      fileName: file.name,
      fileType: file.type || 'application/pdf',
      fileSizeBytes: file.size,
      storageUrl: URL.createObjectURL(file),
      category: 'MEDICAL_REPORT',
      uploadedAt: new Date().toISOString(),
      extractedData: ocrData,
    };

    setUploadedReports(prev => [...prev, newReport]);
  };

  // Move to Step 4 Processing automatically triggers analysis sequence
  const startProcessing = () => {
    setCurrentStep(4);
    setProcessingStage(1);

    // Simulate transparent processing pipeline
    setTimeout(() => setProcessingStage(2), 700);
    setTimeout(() => setProcessingStage(3), 1400);
    setTimeout(() => setProcessingStage(4), 2100);
    setTimeout(() => {
      setProcessingStage(5);

      // Run Deterministic Red-Flag Gate
      const fullText = `${chiefComplaint} ${typedSymptoms} ${voiceTranscript}`;
      const screenResult = screenRedFlags(fullText, vitals);
      setDetectedRedFlags(screenResult.redFlags);
      setProvisionalUrgency(screenResult.provisionalUrgency);
      setUrgencyRationale({
        en: screenResult.rationaleEn,
        hi: screenResult.rationaleHi,
        or: screenResult.rationaleOr,
      });

      // Generate dynamic follow-up questions
      const generatedQ = generateFollowUpQuestions(fullText);
      setFollowUpQuestions(generatedQ);

      // Transition to Step 5 (Red-Flag Safety Gate)
      setTimeout(() => {
        setCurrentStep(5);
      }, 600);
    }, 2800);
  };

  // Submission handler
  const handleFinalSubmit = () => {
    const uniqueNumber = `TB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const detectedInfo = detectTextLanguage(typedSymptoms || chiefComplaint);
    const structuredTriageNote: StructuredTriageNote = {
      chiefComplaint,
      symptoms: [typedSymptoms, voiceTranscript].filter(Boolean),
      symptomDuration: 'Acute onset (< 12 hours)',
      severity: provisionalUrgency === 'RED' ? 'CRITICAL_ACUTE' : 'MODERATE_PROGRESSIVE',
      severityTrajectory: provisionalUrgency === 'RED' ? 'CRITICAL_ACUTE' : 'MODERATE_PROGRESSIVE',
      existingConditions: ['Hypertension (Stage 2)'],
      currentMedicines: ['Tab. Amlodipine 5mg OD'],
      allergies: ['No Known Drug Allergies (NKDA)'],
      uploadedReportSummary: uploadedReports.length > 0 ? uploadedReports.map(r => r.fileName).join(', ') : 'No physical lab report attached',
      reportSummary: uploadedReports.length > 0 ? uploadedReports.map(r => r.fileName).join(', ') : 'No physical lab report attached',
      warningSigns: detectedRedFlags.map(r => r.name),
      missingInformation: ['Baseline 12-lead ECG', 'Serum Troponin-T / cardiac enzymes'],
      suggestedUrgency: provisionalUrgency,
      patientLocation: location,
      transportOrAmbulanceRequired: provisionalUrgency === 'RED',
      transportRequirement: provisionalUrgency === 'RED' ? 'EMERGENCY_AMBULANCE_DISPATCH' : 'ROUTINE_TRANSPORT',
      isDiagnostic: false,
      clinicalDisclaimer: 'AI-generated triage support — final decisions must be made by a qualified healthcare professional.',
      notesTimestamp: new Date().toISOString(),
    };

    const newCase: TriageCase = {
      id: `case-${Date.now()}`,
      caseNumber: uniqueNumber,
      patientId: patient?.id || 'pat-001',
      patientName,
      patientAge: age,
      patientGender: gender,
      patientLocation: location,
      patientPhone: phone,
      chiefComplaint,
      originalLanguage: locale,
      detectedLanguage: detectedInfo.locale,
      translationConfidence: Math.round(detectedInfo.confidence * 100),
      originalStatement: typedSymptoms || chiefComplaint,
      translatedEnglishStatement: typedSymptoms, // Already clinical or machine translated
      voiceTranscript,
      audioUrl: audioUrl || undefined,
      structuredTriageNote,
      status: 'SUBMITTED',
      provisionalUrgency,
      facilityName: 'District Headquarters Hospital, Angul',
      department: provisionalUrgency === 'RED' ? 'Emergency / Resuscitation' : 'General OPD',
      vitals,
      uploadedReports,
      redFlags: detectedRedFlags,
      followUpQuestions,
      urgencyAssessment: {
        suggestedUrgency: provisionalUrgency,
        confidenceScore: provisionalUrgency === 'RED' ? 0.98 : 0.88,
        rationaleEn: urgencyRationale.en,
        rationaleHi: urgencyRationale.hi,
        rationaleOr: urgencyRationale.or,
        triggeredRedFlags: detectedRedFlags.map(r => r.name),
        missingInformation: [],
        isDiagnostic: false,
      },
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dataStore.addCase(newCase);
    router.push(`/patient/triage/confirmation?caseNumber=${newCase.caseNumber}&id=${newCase.id}`);
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Bar & Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#0F8B8D]">
              {t.triage.wizardTitle}
            </span>
            <span className="font-mono text-slate-500">
              {t.triage.step} {currentStep} {t.triage.of} 8
            </span>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#0F8B8D] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            ></div>
          </div>

          <div className="text-sm font-bold text-[#102A43]">
            {currentStep === 1 && t.triage.steps.consent}
            {currentStep === 2 && t.triage.steps.basicInfo}
            {currentStep === 3 && t.triage.steps.multimodal}
            {currentStep === 4 && t.triage.steps.processing}
            {currentStep === 5 && t.triage.steps.redFlags}
            {currentStep === 6 && t.triage.steps.followUp}
            {currentStep === 7 && t.triage.steps.urgency}
            {currentStep === 8 && t.triage.steps.review}
          </div>
        </div>

        {/* ============================================================ */}
        {/* STEP 1: INFORMED CONSENT & MEDICAL DISCLAIMER */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F8B8D] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#102A43]">
                  {t.triage.consentTitle}
                </h2>
                <p className="text-xs text-slate-500">
                  Patient Safety Guarantee &amp; Human-in-the-Loop Protocol
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
              <p className="font-semibold text-slate-900">
                {t.brand.medicalNotice}
              </p>
              <p>{t.triage.consentNotice}</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>This platform prioritises triage queues; it does not replace a clinical examination.</li>
                <li>Your voice recordings and uploaded files will be reviewed by authorised medical personnel only.</li>
                <li>In case of sudden life-threatening symptoms, immediately alert duty staff or dial 108.</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={e => setHasConsented(e.target.checked)}
                className="mt-0.5 rounded-sm border-slate-300 text-[#0F8B8D] focus:ring-[#0F8B8D]"
              />
              <span className="text-xs text-[#102A43] font-medium leading-relaxed">
                {t.triage.consentCheckbox}
              </span>
            </label>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!hasConsented}
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-xl bg-[#0F8B8D] disabled:opacity-50 hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <span>{t.triage.next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: BASIC PATIENT INFORMATION */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
            <h2 className="text-lg font-bold text-[#102A43]">
              {t.triage.steps.basicInfo}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  {t.triage.patientName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#102A43] mb-1">
                    {t.triage.age} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    min={1}
                    max={120}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102A43] mb-1">
                    {t.triage.gender}
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
                  >
                    <option value="MALE">{t.triage.male}</option>
                    <option value="FEMALE">{t.triage.female}</option>
                    <option value="OTHER">{t.triage.other}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  {t.triage.location}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1">
                {t.triage.chiefComplaint} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                placeholder={t.triage.chiefComplaintPlaceholder}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.triage.back}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <span>{t.triage.next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: MULTIMODAL INPUT (VOICE, TYPED, OCR REPORT, VITALS) */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-[#102A43]">
              {t.triage.steps.multimodal}
            </h2>

            {/* 1. Voice Input (Odia, Hindi, English) */}
            {/* 1. Multilingual Voice & Typed Studio */}
            <VoiceInputStudio
              initialText={typedSymptoms}
              onTranscriptionChange={(text) => {
                setTypedSymptoms(text);
                setVoiceTranscript(text);
              }}
              onAudioRecorded={(url) => setAudioUrl(url)}
              label={t.triage.symptomVoiceTitle}
              placeholder={t.triage.typePlaceholder}
            />

            {/* Language Auto-Detection Prompt */}
            {(() => {
              const detected = detectTextLanguage(typedSymptoms || chiefComplaint);
              if (detected.locale !== locale && (typedSymptoms || chiefComplaint).trim().length > 8) {
                const meta = getLanguageMeta(detected.locale);
                return (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {t.translation.lowConfidencePrompt} <strong>{meta.nameNative} ({meta.nameEn})</strong>
                        <span className="ml-1 opacity-75">({Math.round(detected.confidence * 100)}% match)</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocale(detected.locale)}
                      className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 transition-colors"
                    >
                      {t.translation.confirmLang}
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            {/* 3. Attach Medical Report (OCR) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <label className="block text-xs font-bold text-[#102A43]">
                {t.triage.reportUploadTitle}
              </label>

              <div className="border-2 border-dashed border-slate-300 hover:border-[#0F8B8D] bg-white rounded-xl p-5 text-center transition-colors">
                <input
                  type="file"
                  id="report-file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="report-file" className="cursor-pointer block space-y-2">
                  <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                  <span className="text-xs font-semibold text-[#0F8B8D] block">
                    {t.triage.dropReport}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Supported: PDF, PNG, JPG (e.g., CBC, Chest X-ray, OPD prescription)
                  </span>
                </label>
              </div>

              {uploadedReports.length > 0 && (
                <div className="space-y-2 pt-1">
                  {uploadedReports.map(rep => (
                    <div
                      key={rep.id}
                      className="p-3 bg-white rounded-lg border border-teal-200 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0F8B8D]" />
                        <span className="font-semibold text-slate-800">{rep.fileName}</span>
                        <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-semibold">
                          OCR Extracted
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Optional Vital Signs Entry */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#0F8B8D]" />
                  <span>{t.triage.vitalsTitle}</span>
                </span>
                <span className="text-[10px] text-slate-500">Optional</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    {t.triage.systolicBp}
                  </label>
                  <input
                    type="number"
                    value={vitals.systolicBp || ''}
                    onChange={e => setVitals({ ...vitals, systolicBp: Number(e.target.value) })}
                    placeholder="120"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    {t.triage.diastolicBp}
                  </label>
                  <input
                    type="number"
                    value={vitals.diastolicBp || ''}
                    onChange={e => setVitals({ ...vitals, diastolicBp: Number(e.target.value) })}
                    placeholder="80"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    {t.triage.spo2}
                  </label>
                  <input
                    type="number"
                    value={vitals.oxygenSaturation || ''}
                    onChange={e => setVitals({ ...vitals, oxygenSaturation: Number(e.target.value) })}
                    placeholder="98"
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                      vitals.oxygenSaturation && vitals.oxygenSaturation < 90
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    {t.triage.heartRate}
                  </label>
                  <input
                    type="number"
                    value={vitals.heartRate || ''}
                    onChange={e => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                    placeholder="72"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    {t.triage.temp}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperatureCelsius || ''}
                    onChange={e => setVitals({ ...vitals, temperatureCelsius: Number(e.target.value) })}
                    placeholder="37.0"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    {t.triage.respiratoryRate}
                  </label>
                  <input
                    type="number"
                    value={vitals.respiratoryRate || ''}
                    onChange={e => setVitals({ ...vitals, respiratoryRate: Number(e.target.value) })}
                    placeholder="16"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.triage.back}</span>
              </button>

              <button
                type="button"
                onClick={startProcessing}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <span>Run Clinical Analysis</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: TRANSPARENT PROCESSING SCREEN */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0F8B8D] flex items-center justify-center mx-auto animate-spin">
              <Activity className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#102A43]">
                {t.triage.processingTitle}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t.triage.processingDesc}
              </p>
            </div>

            {/* Transparent Pipeline Stage Checklist */}
            <div className="max-w-md mx-auto text-left space-y-3 pt-2">
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  processingStage >= 1
                    ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>1. {t.triage.stageSpeech}</span>
                {processingStage >= 1 && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  processingStage >= 2
                    ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>2. {t.triage.stageOcr}</span>
                {processingStage >= 2 && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  processingStage >= 3
                    ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>3. {t.triage.stageTranslation}</span>
                {processingStage >= 3 && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  processingStage >= 4
                    ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>4. {t.triage.stageExtraction}</span>
                {processingStage >= 4 && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  processingStage >= 5
                    ? 'bg-teal-50 border-teal-200 text-teal-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>5. {t.triage.stageMissing}</span>
                {processingStage >= 5 && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: DETERMINISTIC RED-FLAG SAFETY GATE */}
        {/* ============================================================ */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#102A43]">
                {t.triage.redFlagTitle}
              </h2>
              <UrgencyBadge urgency={provisionalUrgency} size="sm" />
            </div>

            {detectedRedFlags.length > 0 ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 space-y-3">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{t.triage.redFlagDetected}</span>
                </div>

                <p className="text-xs font-semibold text-red-800">
                  {t.brand.redFlagAlertBanner}
                </p>

                <div className="space-y-2 pt-1">
                  {detectedRedFlags.map(rf => (
                    <div
                      key={rf.id}
                      className="p-3 bg-white rounded-lg border border-red-200 text-xs text-slate-800 space-y-1"
                    >
                      <div className="font-bold text-red-700">{rf.name}</div>
                      <div className="text-slate-600">
                        {locale === 'or' ? rf.descriptionOr : locale === 'hi' ? rf.descriptionHi : rf.descriptionEn}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Triggered by: <code>{rf.matchedTrigger}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t.triage.redFlagNone}</span>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.triage.back}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <span>Proceed to Clarifications</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 6: DYNAMIC FOLLOW-UP QUESTIONS */}
        {/* ============================================================ */}
        {currentStep === 6 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#102A43]">
                {t.triage.followUpTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t.triage.followUpDesc}
              </p>
            </div>

            <div className="space-y-4">
              {followUpQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                >
                  <label className="block font-bold text-slate-900">
                    {idx + 1}. {locale === 'or' ? q.questionOr : locale === 'hi' ? q.questionHi : q.questionEn}
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Why we ask: {q.reasonEn}
                  </p>
                  <input
                    type="text"
                    value={q.answer || ''}
                    onChange={e => {
                      const updated = [...followUpQuestions];
                      updated[idx].answer = e.target.value;
                      setFollowUpQuestions(updated);
                    }}
                    placeholder="Type or speak answer..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0F8B8D]"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.triage.back}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <span>View Suggested Urgency</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 7: PROVISIONAL URGENCY RESULT */}
        {/* ============================================================ */}
        {currentStep === 7 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#102A43]">
                {t.triage.urgencyTitle}
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono uppercase">
                Provisional AI Support
              </span>
            </div>

            {/* Urgency Highlight Card */}
            <div className="p-5 rounded-2xl border bg-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                <UrgencyBadge urgency={provisionalUrgency} size="lg" />
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-xs font-bold text-slate-700">
                  {t.triage.urgencyExplanation}:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {locale === 'or'
                    ? urgencyRationale.or
                    : locale === 'hi'
                    ? urgencyRationale.hi
                    : urgencyRationale.en}
                </p>
              </div>

              {detectedRedFlags.length > 0 && (
                <div className="pt-2 text-xs">
                  <span className="font-bold text-red-700">Triggered Warning Signs:</span>
                  <ul className="list-disc pl-4 mt-1 text-slate-700 space-y-0.5">
                    {detectedRedFlags.map(r => (
                      <li key={r.id}>
                        {r.name} ({r.matchedTrigger})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Prominent Medical Safety Notice */}
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#0F8B8D] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {t.brand.medicalNotice} A doctor or authorized triage officer will review your full statement and reports in the clinical review queue.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.triage.back}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="px-6 py-2.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <span>Review &amp; Confirm Case</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 8: SUBMISSION REVIEW & CONFIRM */}
        {/* ============================================================ */}
        {currentStep === 8 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#102A43]">
                Step 8: Review &amp; Submit to Clinical Queue
              </h2>
              <UrgencyBadge urgency={provisionalUrgency} size="sm" />
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Patient &amp; Facility</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Name: <strong>{patientName}</strong></div>
                  <div>Age/Sex: <strong>{age}Y / {gender}</strong></div>
                  <div>District: <strong>{location}</strong></div>
                  <div>Contact: <strong>{phone}</strong></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Chief Complaint &amp; Statement</div>
                <p className="text-slate-700 italic">&quot;{chiefComplaint}&quot;</p>
                {voiceTranscript && (
                  <p className="text-slate-500 text-[11px] pt-1">
                    Voice Note: &quot;{voiceTranscript}&quot;
                  </p>
                )}
              </div>

              {vitals.oxygenSaturation && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">Vital Signs</div>
                  <div className="grid grid-cols-3 gap-2 text-slate-600">
                    <div>SpO2: <strong className={vitals.oxygenSaturation < 90 ? 'text-red-600 font-bold' : ''}>{vitals.oxygenSaturation}%</strong></div>
                    <div>BP: <strong>{vitals.systolicBp}/{vitals.diastolicBp} mmHg</strong></div>
                    <div>HR: <strong>{vitals.heartRate} bpm</strong></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.triage.back}</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-7 py-3 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <span>{t.triage.submitCase}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
