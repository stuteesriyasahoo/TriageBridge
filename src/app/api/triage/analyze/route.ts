import { NextRequest, NextResponse } from 'next/server';
import {
  ExtractedTriageData,
  ExtractedSymptom,
  VitalSigns,
  UrgencyAssessment,
  ConsciousnessLevel,
} from '@/lib/types';
import { evaluateClinicalRules, MANDATORY_CLINICAL_DISCLAIMER } from '@/lib/red-flags';
import { detectTextLanguage } from '@/lib/languages';

interface AnalyzeRequestBody {
  patientAge?: number;
  gender?: string;
  originalLanguage?: string;
  chiefComplaint?: string;
  typedSymptoms?: string;
  voiceTranscript?: string;
  symptomDuration?: string;
  symptomSeverity?: string;
  measuredVitals?: VitalSigns | null;
  vitalsUnknown?: Record<string, boolean>;
  existingConditions?: string[];
  currentMedicines?: string[];
  allergies?: string[];
  pregnancyStatus?: string;
  pregnancyWeeks?: number | null;
  pregnancyWarningSigns?: string[];
  reportFindings?: string[];
  clinicalImageUri?: string;
}

/**
 * Validate extracted JSON schema before returning or persisting
 */
function validateExtractedSchema(data: ExtractedTriageData): boolean {
  if (typeof data !== 'object' || data === null) return false;
  if (typeof data.originalLanguage !== 'string') return false;
  if (typeof data.chiefComplaint !== 'string') return false;
  if (!Array.isArray(data.symptoms)) return false;
  if (!Array.isArray(data.conditions)) return false;
  if (!Array.isArray(data.medicines)) return false;
  if (!Array.isArray(data.allergies)) return false;
  if (typeof data.pregnancyStatus !== 'string') return false;
  if (!Array.isArray(data.reportFindings)) return false;
  if (!Array.isArray(data.possibleRedFlags)) return false;
  if (!Array.isArray(data.missingInformation)) return false;
  if (typeof data.vitals !== 'object' || data.vitals === null) return false;

  return true;
}

/**
 * Extract structured clinical symptoms from multimodal narrative
 */
function extractStructuredSymptoms(
  text: string,
  voiceText: string,
  defaultDuration: string,
  defaultSeverity: string
): ExtractedSymptom[] {
  const symptoms: ExtractedSymptom[] = [];
  const combined = `${text} ${voiceText}`.toLowerCase();

  const symptomKeywords: { name: string; triggers: string[]; severityHint?: string }[] = [
    { name: 'Chest Pain / Angina', triggers: ['chest pain', 'chest tightness', 'सीने में दर्द', 'ଛାତି ଯନ୍ତ୍ରଣା', 'left arm pain'], severityHint: 'Severe' },
    { name: 'Shortness of Breath / Dyspnea', triggers: ['shortness of breath', 'breathless', 'difficulty breathing', 'सांस फूलना', 'ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ', 'gasping'], severityHint: 'Severe' },
    { name: 'Dizziness / Presyncope', triggers: ['dizzy', 'dizziness', 'lightheaded', 'चक्कर', 'ମୁଣ୍ଡ ବୁଲାଇବା'], severityHint: 'Moderate' },
    { name: 'Palpitations', triggers: ['palpitations', 'racing heart', 'धड़कन', 'ଛାତି ଧଡଧଡ'], severityHint: 'Moderate' },
    { name: 'High Fever', triggers: ['fever', 'high temp', 'chills', 'बुखार', 'ଜ୍ୱର'], severityHint: 'Moderate' },
    { name: 'Severe Headache', triggers: ['headache', 'severe headache', 'सिरदर्द', 'ମୁଣ୍ଡ ବିନ୍ଧା'], severityHint: 'Moderate' },
    { name: 'Cough', triggers: ['cough', 'coughing', 'खांसी', 'କାଶ'], severityHint: 'Mild' },
    { name: 'Abdominal Pain', triggers: ['stomach pain', 'abdominal pain', 'belly pain', 'पेट दर्द', 'ପେଟ କଷ୍ଟ'], severityHint: 'Moderate' },
    { name: 'Vomiting / Nausea', triggers: ['vomiting', 'nausea', 'vomit', 'उल्टी', 'ବାନ୍ତି'], severityHint: 'Moderate' },
    { name: 'Uncontrolled Bleeding', triggers: ['bleeding', 'blood', 'रक्तस्राव', 'ରକ୍ତସ୍ରାବ'], severityHint: 'Severe' },
  ];

  for (const item of symptomKeywords) {
    const matched = item.triggers.some(t => combined.includes(t.toLowerCase()));
    if (matched) {
      const source: 'text' | 'voice' = voiceText && item.triggers.some(t => voiceText.toLowerCase().includes(t.toLowerCase()))
        ? 'voice'
        : 'text';
      symptoms.push({
        name: item.name,
        duration: defaultDuration || 'Hours',
        severity: item.severityHint || defaultSeverity || 'Moderate',
        source,
      });
    }
  }

  // Fallback if no predefined dictionary match
  if (symptoms.length === 0 && (text || voiceText)) {
    symptoms.push({
      name: text.slice(0, 50) || voiceText.slice(0, 50),
      duration: defaultDuration || 'Unknown',
      severity: defaultSeverity || 'Moderate',
      source: voiceText ? 'voice' : 'text',
    });
  }

  return symptoms;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequestBody = await req.json();

    const {
      patientAge = 35,
      gender = 'OTHER',
      chiefComplaint = '',
      typedSymptoms = '',
      voiceTranscript = '',
      symptomDuration = '',
      symptomSeverity = '',
      measuredVitals = null,
      vitalsUnknown = {},
      existingConditions = [],
      currentMedicines = [],
      allergies = [],
      pregnancyStatus = 'NOT_APPLICABLE',
      pregnancyWeeks = null,
      pregnancyWarningSigns = [],
      reportFindings = [],
      clinicalImageUri,
    } = body;

    // Detect language of input
    const detectedInfo = detectTextLanguage(`${chiefComplaint} ${typedSymptoms} ${voiceTranscript}`);
    const originalLanguage = body.originalLanguage || detectedInfo.locale;

    // Build structured symptoms
    const structuredSymptoms = extractStructuredSymptoms(
      typedSymptoms,
      voiceTranscript,
      symptomDuration,
      symptomSeverity
    );

    // If clinical image is attached, record as symptom source
    if (clinicalImageUri) {
      structuredSymptoms.push({
        name: 'Visible Clinical Lesion / Trauma Photograph Uploaded',
        duration: symptomDuration || 'Acute',
        severity: symptomSeverity || 'Requires Inspection',
        source: 'image',
      });
    }

    // Safety Requirement: NEVER allow AI-generated values to replace measured vital signs
    // Measured vitals strictly preserve the user's manual inputs, with nulls for missing values
    const safeVitals = {
      temperature: vitalsUnknown.temperatureCelsius ? null : (measuredVitals?.temperatureCelsius ?? null),
      bloodPressureSystolic: vitalsUnknown.systolicBp ? null : (measuredVitals?.systolicBp ?? null),
      bloodPressureDiastolic: vitalsUnknown.diastolicBp ? null : (measuredVitals?.diastolicBp ?? null),
      heartRate: vitalsUnknown.heartRate ? null : (measuredVitals?.heartRate ?? null),
      respiratoryRate: vitalsUnknown.respiratoryRate ? null : (measuredVitals?.respiratoryRate ?? null),
      spo2: vitalsUnknown.oxygenSaturation ? null : (measuredVitals?.oxygenSaturation ?? null),
      bloodGlucose: vitalsUnknown.bloodGlucoseMgDl ? null : (measuredVitals?.bloodGlucoseMgDl ?? null),
      painScore: vitalsUnknown.painScore ? null : (measuredVitals?.painScore ?? null),
      consciousness: (vitalsUnknown.consciousness ? '' : (measuredVitals?.consciousness || '')) as ConsciousnessLevel | string,
    };

    // Extract possible red-flag statements from text/voice
    const possibleRedFlags: string[] = [];
    const narrative = `${chiefComplaint} ${typedSymptoms} ${voiceTranscript}`.toLowerCase();
    const redFlagPatterns = [
      { pattern: 'cannot breathe', text: 'Airway / severe respiratory compromise' },
      { pattern: 'chest pain', text: 'Acute anginal chest pain' },
      { pattern: 'unconscious', text: 'Altered consciousness or unresponsiveness' },
      { pattern: 'fainted', text: 'Syncope / collapse' },
      { pattern: 'bleeding', text: 'Hemorrhage / blood loss' },
      { pattern: 'seizure', text: 'Convulsion / active seizure' },
      { pattern: 'stroke', text: 'Focal neurological deficit' },
      { pattern: 'poison', text: 'Toxic ingestion / poisoning' },
      { pattern: 'swelling', text: 'Anaphylactic airway edema' },
    ];

    for (const rfp of redFlagPatterns) {
      if (narrative.includes(rfp.pattern)) {
        possibleRedFlags.push(rfp.text);
      }
    }

    // Determine missing information items
    const missingInformation: string[] = [];
    if (!chiefComplaint || chiefComplaint.trim().length < 5) {
      missingInformation.push('Chief complaint is missing or vague');
    }
    if (!symptomDuration) {
      missingInformation.push('Symptom onset and duration not specified');
    }
    if (safeVitals.spo2 === null) {
      missingInformation.push('Oxygen saturation (SpO2) not measured');
    }
    if (safeVitals.bloodPressureSystolic === null) {
      missingInformation.push('Blood pressure not measured');
    }
    if (safeVitals.heartRate === null) {
      missingInformation.push('Heart rate not measured');
    }
    if (!safeVitals.consciousness) {
      missingInformation.push('Consciousness status not evaluated');
    }
    if (gender === 'FEMALE' && (patientAge >= 12 && patientAge <= 55) && (!pregnancyStatus || pregnancyStatus === 'NOT_APPLICABLE')) {
      missingInformation.push('Pregnancy status unconfirmed for female of childbearing age');
    }

    // Assemble Strict Extracted JSON
    const extractedData: ExtractedTriageData = {
      originalLanguage,
      chiefComplaint: chiefComplaint || (typedSymptoms ? typedSymptoms.slice(0, 80) : 'Unspecified clinical presentation'),
      symptoms: structuredSymptoms,
      vitals: safeVitals,
      conditions: existingConditions,
      medicines: currentMedicines,
      allergies: allergies,
      pregnancyStatus: pregnancyStatus || 'NOT_APPLICABLE',
      pregnancyWeeks,
      pregnancyWarningSigns,
      reportFindings: reportFindings.length > 0 ? reportFindings : [],
      possibleRedFlags,
      missingInformation,
    };

    // Strict validation
    if (!validateExtractedSchema(extractedData)) {
      return NextResponse.json(
        { error: 'Extracted triage data failed strict schema validation' },
        { status: 422 }
      );
    }

    // Execute Separate Deterministic Clinical Red-Flag Rule Engine
    const ruleEvaluation = evaluateClinicalRules({
      patientAge,
      gender,
      text: `${chiefComplaint} ${typedSymptoms} ${voiceTranscript}`,
      chiefComplaint,
      vitals: measuredVitals,
      vitalsUnknown,
      pregnancyStatus,
      pregnancyWeeks,
      pregnancyWarningSigns,
      reportFindings,
      symptoms: structuredSymptoms.map(s => s.name),
    });

    const urgencyAssessment: UrgencyAssessment = {
      suggestedUrgency: ruleEvaluation.suggestedUrgency,
      confidenceScore: ruleEvaluation.confidenceScore,
      rationaleEn: ruleEvaluation.rationaleEn,
      rationaleHi: ruleEvaluation.rationaleHi,
      rationaleOr: ruleEvaluation.rationaleOr,
      triggeredRedFlags: ruleEvaluation.redFlags.map(r => r.name),
      triggeredRules: ruleEvaluation.triggeredRules,
      missingInformation: ruleEvaluation.missingInformation,
      isDiagnostic: false,
      clinicalDisclaimer: MANDATORY_CLINICAL_DISCLAIMER,
      evaluatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      extractedData,
      urgencyAssessment,
    });
  } catch (error) {
    console.error('Error in /api/triage/analyze:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze triage information',
        details: error instanceof Error ? error.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}
