'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { simulateOcrExtraction } from '../../../lib/ocr-simulator';
import { dataStore } from '../../../lib/store';
import {
  TriageCase,
  VitalSigns,
  UploadedReport,
  RedFlagAlert,
  UrgencyCategory,
  PatientProfile,
  StructuredTriageNote,
  ExtractedTriageData,
  UrgencyAssessment,
  ConsciousnessLevel,
  TriageDraft,
  ClinicalRuleTrigger,
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
  Save,
  RotateCcw,
  Camera,
  Trash2,
  Heart,
  Eye,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Volume2,
} from 'lucide-react';
import { detectTextLanguage, getLanguageMeta } from '../../../lib/languages';
import { evaluateClinicalRules, MANDATORY_CLINICAL_DISCLAIMER } from '../../../lib/red-flags';
import { offlineSyncEngine } from '../../../lib/offline-sync';

const DRAFT_LOCAL_KEY = 'tb_triage_draft_v1';

export default function PatientTriageWizard() {
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();
  const patient = currentUser as PatientProfile | null;

  // 10-Step Wizard State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draftBannerDismissed, setDraftBannerDismissed] = useState(false);
  const [availableDraft, setAvailableDraft] = useState<TriageDraft | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Step 1: Demographics
  const [patientName, setPatientName] = useState(patient?.fullName || 'Ramesh Nayak');
  const [age, setAge] = useState<number>(patient?.age || 48);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(patient?.gender || 'MALE');
  const [location, setLocation] = useState(patient?.location || 'Athamallik, Angul District, Odisha');
  const [phone, setPhone] = useState(patient?.phoneNumber || '+91 94370 12345');

  // Step 2: Chief Complaint
  const [chiefComplaint, setChiefComplaint] = useState(
    'Acute chest pain radiating to left arm with breathlessness'
  );

  // Step 3: Symptoms
  const [typedSymptoms, setTypedSymptoms] = useState(
    'Severe tightness in center of chest since morning. Left arm feels numb and I feel dizzy when sitting up.'
  );

  // Step 4: Duration and Severity
  const [symptomDuration, setSymptomDuration] = useState('2-6 Hours');
  const [symptomSeverity, setSymptomSeverity] = useState('Severe');
  const [severityTrajectory, setSeverityTrajectory] = useState('Getting progressively worse');

  // Step 5: Voice Description
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Step 6: Images and Medical Reports
  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([]);
  const [clinicalImageUri, setClinicalImageUri] = useState<string | null>(null);

  // Step 7: Vital Signs (8 parameters with individual "Unknown" checkboxes)
  const [vitals, setVitals] = useState<VitalSigns>({
    systolicBp: 175,
    diastolicBp: 102,
    heartRate: 114,
    oxygenSaturation: 89, // Critical hypoxia trigger
    temperatureCelsius: 37.2,
    respiratoryRate: 26,
    bloodGlucoseMgDl: 140,
    painScore: 8,
    consciousness: 'ALERT',
  });

  const [vitalsUnknown, setVitalsUnknown] = useState<Record<string, boolean>>({
    systolicBp: false,
    diastolicBp: false,
    heartRate: false,
    oxygenSaturation: false,
    temperatureCelsius: false,
    respiratoryRate: false,
    bloodGlucoseMgDl: false,
    painScore: false,
    consciousness: false,
  });

  // Step 8: Medicines, Allergies, Conditions
  const [existingConditions, setExistingConditions] = useState<string[]>([
    'Hypertension (Stage 2)',
    'Type 2 Diabetes Mellitus',
  ]);
  const [conditionInput, setConditionInput] = useState('');

  const [currentMedicines, setCurrentMedicines] = useState<string[]>([
    'Tab. Amlodipine 5mg OD',
    'Tab. Metformin 500mg BD',
  ]);
  const [medicineInput, setMedicineInput] = useState('');

  const [allergies, setAllergies] = useState<string[]>(['No Known Drug Allergies (NKDA)']);
  const [allergyInput, setAllergyInput] = useState('');

  // Step 9: Pregnancy Information
  const [pregnancyStatus, setPregnancyStatus] = useState<string>('NOT_APPLICABLE');
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number | null>(null);
  const [pregnancyWarningSigns, setPregnancyWarningSigns] = useState<string[]>([]);

  // Step 10: AI Analysis Result & Review
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedTriageData | null>(null);
  const [urgencyAssessment, setUrgencyAssessment] = useState<UrgencyAssessment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for saved draft or step query param on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const stepParam = urlParams.get('step');
        if (stepParam && Number(stepParam) >= 1 && Number(stepParam) <= 10) {
          setCurrentStep(Number(stepParam));
        }
      }

      const patientId = patient?.id || 'pat-guest';
      const storedDraft = dataStore.getDraft(patientId) || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(DRAFT_LOCAL_KEY) || 'null') : null);
      if (storedDraft && storedDraft.patientId === patientId) {
        setAvailableDraft(storedDraft);
      }
    } catch (e) {
      console.warn('Failed to load draft or step:', e);
    }
  }, [patient?.id]);

  // Save draft helper
  const handleSaveDraft = (stepToSave?: number) => {
    const draft: TriageDraft = {
      id: `draft-${Date.now()}`,
      patientId: patient?.id || 'pat-guest',
      lastSavedStep: stepToSave || currentStep,
      patientName,
      age,
      gender,
      location,
      phone,
      chiefComplaint,
      typedSymptoms,
      symptomDuration,
      symptomSeverity,
      voiceTranscript,
      audioUrl: audioUrl || undefined,
      clinicalImageUri: clinicalImageUri || undefined,
      uploadedReports,
      vitals,
      vitalsUnknown,
      existingConditions,
      currentMedicines,
      allergies,
      pregnancyStatus,
      pregnancyWeeks,
      pregnancyWarningSigns,
      updatedAt: new Date().toISOString(),
    };

    try {
      dataStore.saveDraft(draft);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DRAFT_LOCAL_KEY, JSON.stringify(draft));
      }
      setSaveSuccessMsg(`Draft saved at Step ${stepToSave || currentStep}! You can safely close or resume later.`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  };

  // Restore draft
  const handleRestoreDraft = () => {
    if (!availableDraft) return;
    setPatientName(availableDraft.patientName || patientName);
    setAge(availableDraft.age || age);
    setGender(availableDraft.gender || gender);
    setLocation(availableDraft.location || location);
    setPhone(availableDraft.phone || phone);
    setChiefComplaint(availableDraft.chiefComplaint || chiefComplaint);
    setTypedSymptoms(availableDraft.typedSymptoms || typedSymptoms);
    setSymptomDuration(availableDraft.symptomDuration || symptomDuration);
    setSymptomSeverity(availableDraft.symptomSeverity || symptomSeverity);
    setVoiceTranscript(availableDraft.voiceTranscript || '');
    if (availableDraft.audioUrl) setAudioUrl(availableDraft.audioUrl);
    if (availableDraft.clinicalImageUri) setClinicalImageUri(availableDraft.clinicalImageUri);
    if (availableDraft.uploadedReports) setUploadedReports(availableDraft.uploadedReports);
    if (availableDraft.vitals) setVitals(availableDraft.vitals);
    if (availableDraft.vitalsUnknown) setVitalsUnknown(availableDraft.vitalsUnknown);
    if (availableDraft.existingConditions) setExistingConditions(availableDraft.existingConditions);
    if (availableDraft.currentMedicines) setCurrentMedicines(availableDraft.currentMedicines);
    if (availableDraft.allergies) setAllergies(availableDraft.allergies);
    if (availableDraft.pregnancyStatus) setPregnancyStatus(availableDraft.pregnancyStatus);
    if (availableDraft.pregnancyWeeks !== undefined) setPregnancyWeeks(availableDraft.pregnancyWeeks);
    if (availableDraft.pregnancyWarningSigns) setPregnancyWarningSigns(availableDraft.pregnancyWarningSigns);

    setCurrentStep(availableDraft.lastSavedStep || 1);
    setAvailableDraft(null);
  };

  const handleDismissDraft = () => {
    const patientId = patient?.id || 'pat-guest';
    dataStore.deleteDraft(patientId);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_LOCAL_KEY);
    }
    setAvailableDraft(null);
    setDraftBannerDismissed(true);
  };

  // Toggle unknown vital sign
  const toggleVitalUnknown = (vitalKey: string) => {
    setVitalsUnknown(prev => ({
      ...prev,
      [vitalKey]: !prev[vitalKey],
    }));
  };

  // Speech recording handler
  const toggleSpeechRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
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
            setVoiceTranscript('Severe tightness in my chest and difficulty breathing (Transcribed via voice recognition).');
          };
          recognition.start();
          return;
        } catch {
          // fallback simulator below
        }
      }

      // High-fidelity speech simulator fallback
      setTimeout(() => {
        setIsRecording(false);
        const sampleVoice =
          locale === 'or'
            ? 'ଛାତି ବହୁତ କଷ୍ଟ ହେଉଛି ଆଜ୍ଞା... ଘଣ୍ଟାଏ ହେବ କିଛି କହିପାରୁନି... ବାମ ପାଖ ବହୁତ ବିନ୍ଧୁଛି...'
            : locale === 'hi'
            ? 'छाती में बहुत तेज दर्द है और सांस लेने में भारी तकलीफ हो रही है...'
            : 'Severe chest tightness radiating to my left arm with shortness of breath.';
        setVoiceTranscript(sampleVoice);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  // File upload for reports
  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Clinical photograph upload
  const handleClinicalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setClinicalImageUri(url);
  };

  // Step 10: Trigger AI Analysis
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    const isDeviceOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // Direct local clinical rule engine evaluation (runs purely client-side offline)
    const runLocalEvaluation = () => {
      const ruleEval = evaluateClinicalRules({
        patientAge: age,
        gender,
        text: [typedSymptoms, voiceTranscript, chiefComplaint].filter(Boolean).join(' '),
        chiefComplaint,
        vitals,
        vitalsUnknown,
        pregnancyStatus,
        pregnancyWeeks,
        pregnancyWarningSigns,
        reportFindings: uploadedReports.flatMap(r =>
          r.extractedData ? Object.entries(r.extractedData.extractedLabValues).map(([k, v]) => `${k}: ${v}`) : []
        ),
        symptoms: [typedSymptoms, voiceTranscript].filter(Boolean),
      });

      const fallbackAssessment: UrgencyAssessment = {
        suggestedUrgency: ruleEval.suggestedUrgency,
        confidenceScore: ruleEval.confidenceScore,
        rationaleEn: ruleEval.rationaleEn,
        rationaleHi: ruleEval.rationaleHi,
        rationaleOr: ruleEval.rationaleOr,
        triggeredRedFlags: ruleEval.redFlags.map(rf => rf.name),
        triggeredRules: ruleEval.triggeredRules,
        missingInformation: ruleEval.missingInformation,
        isDiagnostic: false,
        clinicalDisclaimer: MANDATORY_CLINICAL_DISCLAIMER,
        evaluatedAt: new Date().toISOString(),
      };

      setUrgencyAssessment(fallbackAssessment);
      setAnalysisCompleted(true);
    };

    if (!isDeviceOnline) {
      // Evaluate offline using full local deterministic rule engine
      runLocalEvaluation();
      setIsAnalyzing(false);
      return;
    }

    try {
      const payload = {
        patientAge: age,
        gender,
        originalLanguage: locale,
        chiefComplaint,
        typedSymptoms,
        voiceTranscript,
        symptomDuration,
        symptomSeverity,
        measuredVitals: vitals,
        vitalsUnknown,
        existingConditions,
        currentMedicines,
        allergies,
        pregnancyStatus,
        pregnancyWeeks,
        pregnancyWarningSigns,
        reportFindings: uploadedReports.flatMap(r =>
          r.extractedData ? Object.entries(r.extractedData.extractedLabValues).map(([k, v]) => `${k}: ${v}`) : []
        ),
        clinicalImageUri: clinicalImageUri || undefined,
      };

      const res = await fetch('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setExtractedData(data.extractedData);
      setUrgencyAssessment(data.urgencyAssessment);
      setAnalysisCompleted(true);
    } catch (err) {
      console.warn('API fetch failed, falling back to local clinical rule evaluation:', err);
      runLocalEvaluation();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run AI analysis automatically when reaching Step 10
  useEffect(() => {
    if (currentStep === 10 && !analysisCompleted && !isAnalyzing) {
      runAIAnalysis();
    }
  }, [currentStep]);

  // Final submission handler
  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    const uniqueNumber = `TB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const detectedInfo = detectTextLanguage(typedSymptoms || chiefComplaint);

    const safeUrgency: UrgencyCategory = urgencyAssessment?.suggestedUrgency || 'YELLOW';
    const isDeviceOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    const structuredTriageNote: StructuredTriageNote = {
      chiefComplaint,
      symptoms: [typedSymptoms, voiceTranscript].filter(Boolean),
      symptomDuration,
      severity: symptomSeverity,
      severityTrajectory,
      existingConditions,
      currentMedicines,
      allergies,
      uploadedReportSummary: uploadedReports.length > 0 ? uploadedReports.map(r => r.fileName).join(', ') : 'No physical lab report attached',
      reportSummary: uploadedReports.length > 0 ? uploadedReports.map(r => r.fileName).join(', ') : 'No physical lab report attached',
      warningSigns: urgencyAssessment?.triggeredRedFlags || [],
      missingInformation: urgencyAssessment?.missingInformation || [],
      suggestedUrgency: safeUrgency,
      patientLocation: location,
      transportOrAmbulanceRequired: safeUrgency === 'RED',
      transportRequirement: safeUrgency === 'RED' ? 'EMERGENCY_AMBULANCE_DISPATCH' : 'ROUTINE_TRANSPORT',
      isDiagnostic: false,
      clinicalDisclaimer: 'AI-generated triage support — the final urgency and care decision must be made by a qualified healthcare professional.',
      notesTimestamp: new Date().toISOString(),
    };

    const newCase: TriageCase = {
      id: `case-${Date.now()}`,
      caseNumber: uniqueNumber,
      patientId: patient?.id || 'pat-guest',
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
      translatedEnglishStatement: typedSymptoms,
      voiceTranscript,
      audioUrl: audioUrl || undefined,
      clinicalImageUri: clinicalImageUri || undefined,
      structuredTriageNote,
      extractedTriageData: extractedData || undefined,
      status: 'SUBMITTED',
      syncStatus: isDeviceOnline ? 'WAITING_TO_SYNC' : 'SAVED_OFFLINE',
      provisionalUrgency: safeUrgency,
      facilityName: 'District Headquarters Hospital, Angul',
      department: safeUrgency === 'RED' ? 'Emergency Resuscitation' : 'General OPD',
      vitals,
      uploadedReports,
      pregnancyStatus,
      pregnancyWeeks,
      pregnancyWarningSigns,
      redFlags: (urgencyAssessment?.triggeredRedFlags || []).map((rf, idx) => ({
        id: `rf-${idx}`,
        name: rf,
        severity: 'CRITICAL',
        descriptionEn: rf,
        descriptionHi: rf,
        descriptionOr: rf,
        matchedTrigger: rf,
      })),
      followUpQuestions: [],
      urgencyAssessment: urgencyAssessment || {
        suggestedUrgency: safeUrgency,
        confidenceScore: 0.94,
        rationaleEn: 'Clinical rule evaluation complete.',
        rationaleHi: 'क्लिनिकल नियम मूल्यांकन पूर्ण।',
        rationaleOr: 'ଡାକ୍ତରୀ ନିୟମ ମୂଲ୍ୟାଙ୍କନ ସମ୍ପୂର୍ଣ୍ଣ।',
        triggeredRedFlags: [],
        missingInformation: [],
        isDiagnostic: false,
        clinicalDisclaimer: 'AI-generated triage support — the final urgency and care decision must be made by a qualified healthcare professional.',
      },
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in offline sync engine with idempotency key
    offlineSyncEngine
      .saveOfflineSubmission(newCase)
      .then((submission) => {
        newCase.idempotencyKey = submission.idempotencyKey;
        newCase.syncStatus = submission.status;

        // Clean up draft
        const patientId = patient?.id || 'pat-guest';
        dataStore.deleteDraft(patientId);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(DRAFT_LOCAL_KEY);
        }

        if (isDeviceOnline) {
          offlineSyncEngine.syncSubmission(submission.idempotencyKey).finally(() => {
            router.push(`/patient/triage/confirmation?caseNumber=${newCase.caseNumber}&id=${newCase.id}`);
          });
        } else {
          router.push(
            `/patient/triage/confirmation?caseNumber=${newCase.caseNumber}&id=${newCase.id}&offline=true&idem=${submission.idempotencyKey}`
          );
        }
      })
      .catch((err) => {
        console.warn('Fallback to local store:', err);
        dataStore.addCase(newCase);
        router.push(`/patient/triage/confirmation?caseNumber=${newCase.caseNumber}&id=${newCase.id}`);
      });
  };

  const stepTitles = [
    'Patient Info',
    'Chief Complaint',
    'Symptoms',
    'Duration & Severity',
    'Voice Description',
    'Reports & Image',
    'Vital Signs',
    'Meds & History',
    'Pregnancy Info',
    'Review & Submit',
  ];

  return (
    <div className="flex-1 bg-[#F7FAFC] dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* DRAFT RESUME BANNER */}
        {availableDraft && !draftBannerDismissed && (
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  Unfinished Triage Assessment Draft Found
                </h4>
                <p className="text-[11px] text-teal-700 dark:text-teal-300">
                  Saved at Step {availableDraft.lastSavedStep}: {stepTitles[availableDraft.lastSavedStep - 1] || 'Assessment'} (
                  {new Date(availableDraft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3.5 py-1.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Resume Draft
              </button>
              <button
                type="button"
                onClick={handleDismissDraft}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                Start Fresh
              </button>
            </div>
          </div>
        )}

        {/* DRAFT SAVED TOAST */}
        {saveSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* TOP HEADER & SAVE DRAFT ACTION */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 uppercase">
                  Step {currentStep} of 10
                </span>
                <h1 className="text-lg font-bold text-[#102A43] dark:text-white">
                  {stepTitles[currentStep - 1]}
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Guided Multimodal Clinical Triage Assessment
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveDraft()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                title="Save draft and resume anytime"
              >
                <Save className="w-3.5 h-3.5 text-teal-600" />
                <span>Save Draft</span>
              </button>
            </div>
          </div>

          {/* 10-Step Progress Dots & Bar */}
          <div className="pt-4">
            <div className="grid grid-cols-10 gap-1.5 mb-2">
              {stepTitles.map((title, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      if (stepNum <= currentStep || stepNum === currentStep + 1) {
                        setCurrentStep(stepNum);
                      }
                    }}
                    className={`h-2 rounded-full transition-all ${
                      isCompleted
                        ? 'bg-teal-600 dark:bg-teal-400'
                        : isCurrent
                        ? 'bg-[#0F8B8D] ring-2 ring-teal-200 dark:ring-teal-900'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    title={`Step ${stepNum}: ${title}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
              <span>1. Demographics</span>
              <span className="hidden sm:inline">5. Voice</span>
              <span className="hidden sm:inline">7. Vitals</span>
              <span>10. Submit</span>
            </div>
          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-6">

          {/* ======================================================== */}
          {/* STEP 1: BASIC PATIENT INFORMATION */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                  Step 1: Patient Demographic Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm patient details. Pediatric and adult vital sign thresholds are automatically calibrated based on age.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age (Years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                    required
                  />
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 mt-1 block">
                    {age < 1 ? 'Infant Protocol (<1y)' : age <= 4 ? 'Toddler Protocol (1-4y)' : age <= 11 ? 'Child Protocol (5-11y)' : age <= 17 ? 'Adolescent Protocol (12-17y)' : 'Adult Protocol (18+y)'}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other / Non-Binary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Location / District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                    placeholder="e.g. Athamallik, Angul District, Odisha"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: CHIEF COMPLAINT */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                  Step 2: Primary Chief Complaint
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  What is the single most urgent health problem or symptom prompting care today?
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={chiefComplaint}
                    onChange={e => setChiefComplaint(e.target.value)}
                    placeholder="Describe main concern (e.g., Severe chest pain radiating to arm, Difficulty breathing in infant, High fever with vomiting)..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Quick Clinical Templates:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Acute chest pain radiating to left arm and breathlessness',
                      'High grade fever with persistent vomiting and weakness',
                      'Severe abdominal pain with dizziness',
                      'Child with rapid breathing and poor oral intake',
                      'Sudden weakness on one side of body with slurred speech',
                    ].map(template => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => setChiefComplaint(template)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 text-[11px] transition-colors border border-transparent hover:border-teal-300"
                      >
                        + {template.slice(0, 42)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: SYMPTOMS (MULTILINGUAL) */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                    Step 3: Detailed Symptoms Description
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Describe your symptoms in any of the 22 Indian languages or English.
                  </p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 font-mono">
                  {getLanguageMeta(locale).nameEn} ({getLanguageMeta(locale).nameNative})
                </span>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={5}
                  value={typedSymptoms}
                  onChange={e => setTypedSymptoms(e.target.value)}
                  placeholder="Type your symptoms here in your preferred language..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 leading-relaxed"
                />

                {/* Common quick symptom chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Add common symptoms:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Chest Tightness',
                      'Shortness of Breath',
                      'Dizziness / Fainting',
                      'Palpitations',
                      'High Fever',
                      'Severe Headache',
                      'Cough',
                      'Nausea / Vomiting',
                      'Cold Sweats',
                      'Body Aches',
                    ].map(sym => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() =>
                          setTypedSymptoms(prev => (prev ? `${prev}, ${sym}` : sym))
                        }
                        className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-teal-100 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
                      >
                        + {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: DURATION AND SEVERITY */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                  Step 4: Symptom Duration and Severity Progression
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Clinical timeline helps differentiate hyperacute emergencies from subacute conditions.
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  How long have these symptoms been present?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {['< 1 Hour (Sudden)', '1-6 Hours', '12-24 Hours', '2-3 Days', '1+ Week', 'Chronic (> 1 Month)'].map(
                    dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setSymptomDuration(dur)}
                        className={`p-3 rounded-xl border text-left font-medium transition-all ${
                          symptomDuration === dur
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 font-bold shadow-xs ring-1 ring-teal-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {dur}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Severity Level */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Symptom Severity:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { level: 'Mild', desc: 'Noticeable, can perform normal daily activities' },
                    { level: 'Moderate', desc: 'Uncomfortable, interferes with sleep or work' },
                    { level: 'Severe', desc: 'Intense distress, unable to carry out routine' },
                    { level: 'Worst Imaginable', desc: 'Agonizing, unbearable emergency pain' },
                  ].map(sev => (
                    <button
                      key={sev.level}
                      type="button"
                      onClick={() => setSymptomSeverity(sev.level)}
                      className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                        symptomSeverity === sev.level
                          ? sev.level === 'Worst Imaginable' || sev.level === 'Severe'
                            ? 'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-900 dark:text-red-200 font-bold ring-1 ring-red-500'
                            : 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200 font-bold ring-1 ring-teal-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block font-bold">{sev.level}</span>
                      <span className="text-[10px] opacity-80 block">{sev.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trajectory */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Progression Trajectory:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    'Getting rapidly worse',
                    'Getting slowly worse',
                    'Constant / Unchanged',
                    'Comes and goes in waves',
                  ].map(traj => (
                    <button
                      key={traj}
                      type="button"
                      onClick={() => setSeverityTrajectory(traj)}
                      className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                        severityTrajectory === traj
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 font-bold shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {traj}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: VOICE DESCRIPTION & REVIEW TRANSCRIPTION */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                  Step 5: Voice Recording Studio &amp; Transcription Review
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Speak your symptoms naturally in your local dialect. Review and edit the automatic transcription before submitting.
                </p>
              </div>

              {/* Recording Box */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-center space-y-4">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={toggleSpeechRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                        : 'bg-[#0F8B8D] hover:bg-[#0c7375] text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3">
                    {isRecording ? 'Listening... Speak now' : 'Tap microphone to speak'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Recognizes Odia, Hindi, Bengali, Telugu, and other regional languages
                  </span>
                </div>

                {/* Editable Transcription */}
                <div className="text-left space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>Review &amp; Correct Voice Transcription:</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Editable before review</span>
                  </div>
                  <textarea
                    rows={3}
                    value={voiceTranscript}
                    onChange={e => setVoiceTranscript(e.target.value)}
                    placeholder="Transcribed voice will appear here. You can manually edit or correct any words..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6: IMAGE OR MEDICAL REPORT UPLOAD */}
          {/* ======================================================== */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                  Step 6: Medical Reports &amp; Clinical Photograph Upload
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload PDF or image lab reports (ECG, blood test, prescription) or attach a photograph of a visible wound, rash or lesion.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reports Upload */}
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-3">
                  <FileText className="w-8 h-8 text-teal-600 mx-auto" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Medical Reports (PDF, JPG, PNG)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ECG, Lab reports, Discharge summary
                    </span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F8B8D] text-white text-xs font-semibold cursor-pointer hover:bg-[#0c7375] transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Report File</span>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      onChange={handleReportUpload}
                      className="hidden"
                    />
                  </label>

                  {uploadedReports.length > 0 && (
                    <div className="space-y-1.5 text-left pt-2">
                      {uploadedReports.map(rep => (
                        <div
                          key={rep.id}
                          className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {rep.fileName}
                          </span>
                          <span className="text-[10px] text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded font-mono">
                            OCR Read
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clinical Image Upload */}
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center space-y-3">
                  <Camera className="w-8 h-8 text-indigo-600 mx-auto" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Clinical Lesion / Trauma Photograph
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Skin condition, trauma wound, swelling, or clinical monitor
                    </span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer hover:bg-indigo-700 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Attach Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleClinicalImageUpload}
                      className="hidden"
                    />
                  </label>

                  {clinicalImageUri && (
                    <div className="pt-2 text-left relative">
                      <img
                        src={clinicalImageUri}
                        alt="Clinical Upload"
                        className="h-28 w-full object-cover rounded-lg border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setClinicalImageUri(null)}
                        className="absolute top-3 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 7: VITAL SIGNS (8 PARAMETERS WITH UNKNOWN TOGGLES) */}
          {/* ======================================================== */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                  Step 7: Physiological Vital Signs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter any measured vital signs. Check &quot;Unknown / Not Measured&quot; if unmeasured. Never assume a missing value is normal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                {/* 1. Temperature */}
                <div className={`p-3 rounded-xl border ${vitalsUnknown.temperatureCelsius ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 opacity-60' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Temperature (°C)
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitalsUnknown.temperatureCelsius || false}
                        onChange={() => toggleVitalUnknown('temperatureCelsius')}
                        className="rounded text-teal-600"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    disabled={vitalsUnknown.temperatureCelsius}
                    value={vitals.temperatureCelsius ?? ''}
                    onChange={e => setVitals(v => ({ ...v, temperatureCelsius: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    placeholder="e.g. 37.5"
                  />
                </div>

                {/* 2. Blood Pressure Systolic */}
                <div className={`p-3 rounded-xl border ${vitalsUnknown.systolicBp ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 opacity-60' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      BP Systolic (mmHg)
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitalsUnknown.systolicBp || false}
                        onChange={() => toggleVitalUnknown('systolicBp')}
                        className="rounded text-teal-600"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={vitalsUnknown.systolicBp}
                    value={vitals.systolicBp ?? ''}
                    onChange={e => setVitals(v => ({ ...v, systolicBp: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    placeholder="e.g. 120"
                  />
                </div>

                {/* 3. Blood Pressure Diastolic */}
                <div className={`p-3 rounded-xl border ${vitalsUnknown.diastolicBp ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 opacity-60' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      BP Diastolic (mmHg)
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitalsUnknown.diastolicBp || false}
                        onChange={() => toggleVitalUnknown('diastolicBp')}
                        className="rounded text-teal-600"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={vitalsUnknown.diastolicBp}
                    value={vitals.diastolicBp ?? ''}
                    onChange={e => setVitals(v => ({ ...v, diastolicBp: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    placeholder="e.g. 80"
                  />
                </div>

                {/* 4. Heart Rate */}
                <div className={`p-3 rounded-xl border ${vitalsUnknown.heartRate ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 opacity-60' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Heart Rate (bpm)
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitalsUnknown.heartRate || false}
                        onChange={() => toggleVitalUnknown('heartRate')}
                        className="rounded text-teal-600"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={vitalsUnknown.heartRate}
                    value={vitals.heartRate ?? ''}
                    onChange={e => setVitals(v => ({ ...v, heartRate: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    placeholder="e.g. 72"
                  />
                </div>

                {/* 5. Respiratory Rate */}
                <div className={`p-3 rounded-xl border ${vitalsUnknown.respiratoryRate ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 opacity-60' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Respiratory Rate (/min)
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitalsUnknown.respiratoryRate || false}
                        onChange={() => toggleVitalUnknown('respiratoryRate')}
                        className="rounded text-teal-600"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={vitalsUnknown.respiratoryRate}
                    value={vitals.respiratoryRate ?? ''}
                    onChange={e => setVitals(v => ({ ...v, respiratoryRate: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    placeholder="e.g. 18"
                  />
                </div>

                {/* 6. SpO2 */}
                <div className={`p-3 rounded-xl border ${vitalsUnknown.oxygenSaturation ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 opacity-60' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      SpO₂ Saturation (%)
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitalsUnknown.oxygenSaturation || false}
                        onChange={() => toggleVitalUnknown('oxygenSaturation')}
                        className="rounded text-teal-600"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={vitalsUnknown.oxygenSaturation}
                    value={vitals.oxygenSaturation ?? ''}
                    onChange={e => setVitals(v => ({ ...v, oxygenSaturation: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    placeholder="e.g. 98"
                  />
                </div>

                {/* 7. Blood Glucose */}
                <div className={`p-3 rounded-xl border ${vitalsUnknown.bloodGlucoseMgDl ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 opacity-60' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Blood Glucose (mg/dL)
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitalsUnknown.bloodGlucoseMgDl || false}
                        onChange={() => toggleVitalUnknown('bloodGlucoseMgDl')}
                        className="rounded text-teal-600"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={vitalsUnknown.bloodGlucoseMgDl}
                    value={vitals.bloodGlucoseMgDl ?? ''}
                    onChange={e => setVitals(v => ({ ...v, bloodGlucoseMgDl: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                    placeholder="e.g. 110"
                  />
                </div>

                {/* 8. Pain Score (0 to 10) */}
                <div className={`p-3 rounded-xl border ${vitalsUnknown.painScore ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 opacity-60' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Pain Score (0 - 10)
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitalsUnknown.painScore || false}
                        onChange={() => toggleVitalUnknown('painScore')}
                        className="rounded text-teal-600"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      disabled={vitalsUnknown.painScore}
                      value={vitals.painScore ?? 0}
                      onChange={e => setVitals(v => ({ ...v, painScore: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="font-mono font-bold w-6 text-center text-sm">
                      {vitalsUnknown.painScore ? '-' : vitals.painScore}
                    </span>
                  </div>
                </div>

                {/* 9. Consciousness (AVPU) */}
                <div className={`p-3 rounded-xl border ${vitalsUnknown.consciousness ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 opacity-60' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      Consciousness (AVPU)
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vitalsUnknown.consciousness || false}
                        onChange={() => toggleVitalUnknown('consciousness')}
                        className="rounded text-teal-600"
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  <select
                    disabled={vitalsUnknown.consciousness}
                    value={vitals.consciousness || 'ALERT'}
                    onChange={e => setVitals(v => ({ ...v, consciousness: e.target.value as ConsciousnessLevel }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="ALERT">Alert (Fully conscious)</option>
                    <option value="VOICE_RESPONSIVE">Voice Responsive (Drowsy)</option>
                    <option value="PAIN_RESPONSIVE">Pain Responsive (Critical)</option>
                    <option value="UNRESPONSIVE">Unresponsive (Emergency)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 8: MEDICINES, ALLERGIES, EXISTING CONDITIONS */}
          {/* ======================================================== */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                  Step 8: Existing Medical Conditions, Medicines &amp; Allergies
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Chronic conditions and active prescriptions inform clinical triage interactions.
                </p>
              </div>

              {/* Conditions */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Known Pre-existing Conditions:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={e => setConditionInput(e.target.value)}
                    placeholder="e.g. Asthma, Coronary Artery Disease..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && conditionInput.trim()) {
                        e.preventDefault();
                        setExistingConditions(c => [...c, conditionInput.trim()]);
                        setConditionInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (conditionInput.trim()) {
                        setExistingConditions(c => [...c, conditionInput.trim()]);
                        setConditionInput('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0F8B8D] text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {existingConditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1"
                    >
                      <span>{cond}</span>
                      <button
                        type="button"
                        onClick={() => setExistingConditions(c => c.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Medicines */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Daily Medications:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={medicineInput}
                    onChange={e => setMedicineInput(e.target.value)}
                    placeholder="e.g. Tab. Metformin 500mg, Inhaler..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && medicineInput.trim()) {
                        e.preventDefault();
                        setCurrentMedicines(m => [...m, medicineInput.trim()]);
                        setMedicineInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (medicineInput.trim()) {
                        setCurrentMedicines(m => [...m, medicineInput.trim()]);
                        setMedicineInput('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0F8B8D] text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentMedicines.map((med, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 text-xs font-medium flex items-center gap-1"
                    >
                      <span>{med}</span>
                      <button
                        type="button"
                        onClick={() => setCurrentMedicines(m => m.filter((_, i) => i !== idx))}
                        className="text-teal-400 hover:text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Known Drug &amp; Environmental Allergies:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={e => setAllergyInput(e.target.value)}
                    placeholder="e.g. Penicillin, Sulfa, Peanuts..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-900"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && allergyInput.trim()) {
                        e.preventDefault();
                        setAllergies(a => [...a, allergyInput.trim()]);
                        setAllergyInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (allergyInput.trim()) {
                        setAllergies(a => [...a, allergyInput.trim()]);
                        setAllergyInput('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0F8B8D] text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allergies.map((allg, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-1"
                    >
                      <span>{allg}</span>
                      <button
                        type="button"
                        onClick={() => setAllergies(a => a.filter((_, i) => i !== idx))}
                        className="text-amber-400 hover:text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 9: PREGNANCY INFORMATION */}
          {/* ======================================================== */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                  Step 9: Pregnancy Status &amp; Obstetric Warning Signs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pregnancy alters hemodynamics and introduces specific obstetric safety considerations (WHO MCPC standards).
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Pregnancy Status:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { value: 'NOT_PREGNANT', label: 'Not Pregnant' },
                    { value: 'PREGNANT', label: 'Currently Pregnant' },
                    { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPregnancyStatus(opt.value)}
                      className={`p-3 rounded-xl border font-bold text-left transition-all ${
                        pregnancyStatus === opt.value
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 ring-1 ring-teal-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {pregnancyStatus === 'PREGNANT' && (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-4 pt-4 mt-3">
                    <div>
                      <label className="block text-xs font-bold text-rose-900 dark:text-rose-200 mb-1">
                        Gestational Age (Estimated Weeks):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={42}
                        value={pregnancyWeeks ?? ''}
                        onChange={e => setPregnancyWeeks(e.target.value ? Number(e.target.value) : null)}
                        className="w-48 px-3 py-1.5 rounded-lg border border-rose-300 text-xs font-mono font-bold"
                        placeholder="e.g. 28 weeks"
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-rose-900 dark:text-rose-200">
                        Check any observed obstetric warning signs:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[
                          { key: 'vaginal_bleeding', label: 'Vaginal Bleeding or Spotting' },
                          { key: 'severe_headache', label: 'Severe Headache not relieved by rest' },
                          { key: 'visual_disturbance', label: 'Blurred vision or seeing flashing lights' },
                          { key: 'epigastric_pain', label: 'Severe pain under ribs / upper abdomen' },
                          { key: 'face_hands_swelling', label: 'Sudden swelling of face, hands or feet' },
                          { key: 'reduced_fetal_movement', label: 'Decreased or absent baby movements' },
                          { key: 'water_broken', label: 'Fluid leakage / water broke early' },
                        ].map(sign => {
                          const isChecked = pregnancyWarningSigns.includes(sign.key);
                          return (
                            <label
                              key={sign.key}
                              className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-rose-100 border-rose-400 text-rose-900 font-semibold'
                                  : 'bg-white border-rose-200 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setPregnancyWarningSigns(p => p.filter(k => k !== sign.key));
                                  } else {
                                    setPregnancyWarningSigns(p => [...p, sign.key]);
                                  }
                                }}
                                className="rounded text-rose-600"
                              />
                              <span>{sign.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 10: REVIEW AND SUBMIT */}
          {/* ======================================================== */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#102A43] dark:text-white">
                  Step 10: Multimodal Clinical Review &amp; AI Triage Support
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verify your entered information and inspect the explainable Suggested Triage Urgency.
                </p>
              </div>

              {/* AI SUGGESTED URGENCY CARD */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-teal-500/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      AI-Assisted Clinical Evaluation
                    </span>
                    <h4 className="text-base font-bold text-[#102A43] dark:text-white flex items-center gap-2 mt-0.5">
                      <Sparkles className="w-4 h-4 text-[#0F8B8D]" />
                      <span>Suggested Triage Urgency</span>
                    </h4>
                  </div>

                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-300 font-semibold animate-pulse">
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Running Rule Engine...</span>
                    </div>
                  ) : urgencyAssessment ? (
                    <UrgencyBadge urgency={urgencyAssessment.suggestedUrgency} size="lg" />
                  ) : null}
                </div>

                {/* MANDATORY NOTICE — MUST ALWAYS BE DISPLAYED */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    AI-generated triage support — the final urgency and care decision must be made by a qualified healthcare professional.
                  </span>
                </div>

                {/* Explainable Rationale */}
                {urgencyAssessment && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">
                        Explainable Clinical Rationale:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {urgencyAssessment.rationaleEn}
                      </p>
                      {urgencyAssessment.rationaleHi && locale === 'hi' && (
                        <p className="text-slate-700 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                          &quot;{urgencyAssessment.rationaleHi}&quot;
                        </p>
                      )}
                      {urgencyAssessment.rationaleOr && locale === 'or' && (
                        <p className="text-slate-700 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                          &quot;{urgencyAssessment.rationaleOr}&quot;
                        </p>
                      )}
                    </div>

                    {/* Triggered Red Flags */}
                    {urgencyAssessment.triggeredRedFlags && urgencyAssessment.triggeredRedFlags.length > 0 && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 space-y-1.5">
                        <span className="font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Triggered Red-Flag Emergency Indicators:</span>
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-red-800 dark:text-red-300">
                          {urgencyAssessment.triggeredRedFlags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Information Notice */}
                    {urgencyAssessment.missingInformation && urgencyAssessment.missingInformation.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Identified Baseline Information Gaps (Never Assumed Normal):</span>
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                          {urgencyAssessment.missingInformation.map((gap, idx) => (
                            <li key={idx}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Comprehensive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Clinical Summary */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-[#102A43] dark:text-white block border-b pb-1.5">
                    Patient &amp; Symptoms
                  </span>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Patient</span>
                    <span className="font-semibold">{patientName}, {age}y, {gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Chief Complaint</span>
                    <span className="font-semibold">{chiefComplaint}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Timeline &amp; Severity</span>
                    <span>{symptomDuration} • {symptomSeverity} ({severityTrajectory})</span>
                  </div>
                  {voiceTranscript && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Voice Note</span>
                      <span className="italic">&quot;{voiceTranscript}&quot;</span>
                    </div>
                  )}
                </div>

                {/* Measured Vitals Summary */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-[#102A43] dark:text-white block border-b pb-1.5">
                    Recorded Vitals &amp; Reports
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div>BP: <strong>{vitalsUnknown.systolicBp ? 'Unknown' : `${vitals.systolicBp}/${vitals.diastolicBp} mmHg`}</strong></div>
                    <div>SpO₂: <strong className={vitals.oxygenSaturation && vitals.oxygenSaturation < 90 ? 'text-red-600 font-bold' : ''}>{vitalsUnknown.oxygenSaturation ? 'Unknown' : `${vitals.oxygenSaturation}%`}</strong></div>
                    <div>HR: <strong>{vitalsUnknown.heartRate ? 'Unknown' : `${vitals.heartRate} bpm`}</strong></div>
                    <div>Temp: <strong>{vitalsUnknown.temperatureCelsius ? 'Unknown' : `${vitals.temperatureCelsius}°C`}</strong></div>
                    <div>Glucose: <strong>{vitalsUnknown.bloodGlucoseMgDl ? 'Unknown' : `${vitals.bloodGlucoseMgDl} mg/dL`}</strong></div>
                    <div>Consciousness: <strong>{vitalsUnknown.consciousness ? 'Unknown' : vitals.consciousness}</strong></div>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-500">
                    Reports: {uploadedReports.length} uploaded • Photo: {clinicalImageUri ? 'Attached' : 'None'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEPPER NAVIGATION BUTTONS (BOTTOM) */}
          {/* ======================================================== */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSaveDraft()}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-teal-600" />
                <span>Save Draft</span>
              </button>

              {currentStep < 10 ? (
                <button
                  type="button"
                  onClick={() => {
                    handleSaveDraft(currentStep + 1);
                    setCurrentStep(s => s + 1);
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting || isAnalyzing}
                  onClick={handleFinalSubmit}
                  className="flex-1 sm:flex-none px-7 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Submitting Case...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Triage Case to Queue</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
