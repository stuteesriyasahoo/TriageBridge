import {
  RedFlagAlert,
  VitalSigns,
  UrgencyCategory,
  ClinicalRuleTrigger,
  ConsciousnessLevel,
  AgeGroup,
} from './types';
import {
  VITAL_SIGNS_THRESHOLDS,
  CLINICAL_RED_FLAG_RULES,
  getAgeGroup,
} from './clinical-rules-config';

export interface EvaluateClinicalRulesParams {
  patientAge?: number;
  gender?: string;
  text?: string;
  chiefComplaint?: string;
  vitals?: VitalSigns | null;
  vitalsUnknown?: Record<string, boolean>;
  pregnancyStatus?: string;
  pregnancyWeeks?: number | null;
  pregnancyWarningSigns?: string[];
  reportFindings?: string[];
  symptoms?: string[];
}

export interface ClinicalRuleEvaluationResult {
  suggestedUrgency: UrgencyCategory;
  confidenceScore: number;
  triggeredRules: ClinicalRuleTrigger[];
  redFlags: RedFlagAlert[];
  missingInformation: string[];
  rationaleEn: string;
  rationaleHi: string;
  rationaleOr: string;
  clinicalDisclaimer: string;
  ageGroup: AgeGroup;
}

export const MANDATORY_CLINICAL_DISCLAIMER =
  'AI-generated triage support — the final urgency and care decision must be made by a qualified healthcare professional.';

/**
 * Transparent, Configurable Deterministic Clinical Red-Flag Rule Engine
 * Independent of Generative AI.
 * 
 * Rules:
 * - A confirmed RED rule must ALWAYS result in RED.
 * - Missing critical information must NOT default to GREEN; returns NEEDS_CLINICIAN_REVIEW.
 * - Paediatric and adult limits are strictly segregated.
 */
export function evaluateClinicalRules(
  params: EvaluateClinicalRulesParams
): ClinicalRuleEvaluationResult {
  const patientAge = params.patientAge ?? 30;
  const ageGroup = getAgeGroup(patientAge);
  const thresholds = VITAL_SIGNS_THRESHOLDS[ageGroup];

  const triggeredRules: ClinicalRuleTrigger[] = [];
  const redFlags: RedFlagAlert[] = [];
  const missingInformation: string[] = [];

  const vitals = params.vitals;
  const vitalsUnknown = params.vitalsUnknown || {};

  // -------------------------------------------------------------
  // 1. EVALUATE CONSCIOUSNESS & VITAL SIGNS (AGE-ADJUSTED)
  // -------------------------------------------------------------
  if (!vitals) {
    missingInformation.push('All physiological vital signs (BP, SpO2, HR, RR, Temp) unrecorded');
  } else {
    // A. Consciousness / AVPU
    if (vitalsUnknown['consciousness'] || !vitals.consciousness) {
      missingInformation.push('Consciousness status (AVPU scale) not assessed');
    } else {
      const c = String(vitals.consciousness).toUpperCase();
      if (c === 'UNRESPONSIVE' || c === 'PAIN_RESPONSIVE') {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-VITAL-CONSCIOUSNESS-CRITICAL',
          ruleName: 'Impaired Consciousness (AVPU: Pain / Unresponsive)',
          category: 'RED',
          reason: `Patient assessed as ${c}. Airway protection reflex impaired.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'WHO ETAT / AVPU Disability Score (Critical Airway)',
          sourceCriterion: 'VITAL_SIGN',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: `मरीज की चेतना स्तर अत्यधिक कम (${c}) है। तत्काल वायुमार्ग सुरक्षा आवश्यक है।`,
          descriptionOr: `ରୋଗୀଙ୍କ ଚେତା ସ୍ତର ଅତ୍ୟନ୍ତ କମ୍ (${c})। ତୁରନ୍ତ ଡାକ୍ତରୀ ସହାୟତା ଆବଶ୍ୟକ।`,
          matchedTrigger: `AVPU ${c}`,
        });
      } else if (c === 'VOICE_RESPONSIVE') {
        triggeredRules.push({
          id: 'RF-VITAL-CONSCIOUSNESS-URGENT',
          ruleName: 'Depressed Mental Status (AVPU: Voice Responsive)',
          category: 'YELLOW',
          reason: 'Patient drowsy; responds only to verbal stimuli.',
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'NEWS2 Neurological Assessment',
          sourceCriterion: 'VITAL_SIGN',
        });
      }
    }

    // B. Oxygen Saturation (SpO2)
    if (vitalsUnknown['oxygenSaturation'] || vitals.oxygenSaturation === null || vitals.oxygenSaturation === undefined) {
      missingInformation.push('Oxygen saturation (SpO2) unknown/unmeasured');
    } else {
      const spo2 = Number(vitals.oxygenSaturation);
      if (spo2 < thresholds.spo2.criticalHypoxia) {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-VITAL-SPO2-CRITICAL',
          ruleName: `Critical Hypoxia (SpO2 ${spo2}%)`,
          category: 'RED',
          reason: `SpO2 ${spo2}% is below critical safety threshold (<${thresholds.spo2.criticalHypoxia}% for ${ageGroup}). Immediate oxygenation required.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'WHO ETAT / BTS Oxygen Emergency Guidelines',
          sourceCriterion: 'VITAL_SIGN',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: `ऑक्सीजन स्तर अत्यधिक कम (${spo2}%) है। तत्काल ऑक्सीजन सहायता आवश्यक है।`,
          descriptionOr: `ଅକ୍ସିଜେନ୍ ସ୍ତର ବିପଜ୍ଜନକ ଭାବେ କମ୍ (${spo2}%) ରହିଛି। ତୁରନ୍ତ ଅକ୍ସିଜେନ୍ ଆବଶ୍ୟକ।`,
          matchedTrigger: `SpO2 ${spo2}%`,
        });
      } else if (spo2 <= thresholds.spo2.moderateHypoxia) {
        triggeredRules.push({
          id: 'RF-VITAL-SPO2-URGENT',
          ruleName: `Moderate Hypoxia (SpO2 ${spo2}%)`,
          category: 'YELLOW',
          reason: `SpO2 ${spo2}% is borderline low for ${ageGroup} (target >= ${thresholds.spo2.normalTarget}%).`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'BTS Oxygen Therapy Standard',
          sourceCriterion: 'VITAL_SIGN',
        });
      }
    }

    // C. Systolic & Diastolic Blood Pressure
    if (vitalsUnknown['systolicBp'] || vitals.systolicBp === null || vitals.systolicBp === undefined) {
      missingInformation.push('Blood pressure unmeasured/unknown');
    } else {
      const sbp = Number(vitals.systolicBp);
      if (sbp <= thresholds.systolicBp.criticalHypotension) {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-VITAL-BP-HYPOTENSION-CRITICAL',
          ruleName: `Critical Hypotension / Impending Shock (Systolic ${sbp} mmHg)`,
          category: 'RED',
          reason: `Systolic BP ${sbp} mmHg falls below shock threshold (<= ${thresholds.systolicBp.criticalHypotension} mmHg for ${ageGroup}).`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'Surviving Sepsis Campaign / PALS Hemodynamic Thresholds',
          sourceCriterion: 'VITAL_SIGN',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: `अत्यधिक निम्न रक्तचाप (${sbp} mmHg) संचार विफलता (शॉक) का संकेत दे सकता है।`,
          descriptionOr: `ଅତ୍ୟଧିକ କମ୍ ରକ୍ତଚାପ (${sbp} mmHg) ଶକ୍ ର ସଙ୍କେତ ଦେଉଛି।`,
          matchedTrigger: `Systolic BP ${sbp} mmHg`,
        });
      } else if (sbp >= thresholds.systolicBp.criticalHypertension) {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-VITAL-BP-HYPERTENSION-CRITICAL',
          ruleName: `Hypertensive Crisis Threshold (Systolic ${sbp} mmHg)`,
          category: 'RED',
          reason: `Systolic BP ${sbp} mmHg >= critical emergency limit (${thresholds.systolicBp.criticalHypertension} mmHg for ${ageGroup}).`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'AHA / ACC Hypertensive Emergency Guidelines',
          sourceCriterion: 'VITAL_SIGN',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: `अत्यधिक उच्च रक्तचाप (${sbp} mmHg) जिससे मस्तिष्क या हृदय को नुकसान का खतरा है।`,
          descriptionOr: `ଅତ୍ୟଧିକ ଉଚ୍ଚ ରକ୍ତଚାପ (${sbp} mmHg) ଜରୁରୀ ଯାଞ୍ଚ ଆବଶ୍ୟକ କରେ।`,
          matchedTrigger: `Systolic BP ${sbp} mmHg`,
        });
      } else if (sbp <= thresholds.systolicBp.abnormalHypotension) {
        triggeredRules.push({
          id: 'RF-VITAL-BP-HYPOTENSION-URGENT',
          ruleName: `Low Blood Pressure (Systolic ${sbp} mmHg)`,
          category: 'YELLOW',
          reason: `Systolic BP ${sbp} mmHg is abnormally low for ${ageGroup}.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'NEWS2 Blood Pressure Parameter',
          sourceCriterion: 'VITAL_SIGN',
        });
      } else if (sbp >= thresholds.systolicBp.abnormalHypertension) {
        triggeredRules.push({
          id: 'RF-VITAL-BP-HYPERTENSION-URGENT',
          ruleName: `Stage 2 Elevated Blood Pressure (Systolic ${sbp} mmHg)`,
          category: 'YELLOW',
          reason: `Systolic BP ${sbp} mmHg is elevated above normal limit.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'AHA Blood Pressure Stages',
          sourceCriterion: 'VITAL_SIGN',
        });
      }

      if (vitals.diastolicBp && vitals.diastolicBp >= 120) {
        triggeredRules.push({
          id: 'RF-VITAL-DIASTOLIC-CRITICAL',
          ruleName: `Severe Diastolic Elevation (${vitals.diastolicBp} mmHg)`,
          category: 'RED',
          reason: `Diastolic BP >= 120 mmHg poses acute end-organ threat.`,
          ageGroup: 'ADULT',
          medicalReference: 'AHA Hypertensive Urgency Criteria',
          sourceCriterion: 'VITAL_SIGN',
        });
      }
    }

    // D. Heart Rate
    if (vitalsUnknown['heartRate'] || vitals.heartRate === null || vitals.heartRate === undefined) {
      missingInformation.push('Heart rate unmeasured/unknown');
    } else {
      const hr = Number(vitals.heartRate);
      if (hr <= thresholds.heartRate.criticalBradycardia) {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-VITAL-HR-BRADY-CRITICAL',
          ruleName: `Critical Bradycardia (${hr} bpm)`,
          category: 'RED',
          reason: `Heart rate ${hr} bpm is below critical threshold (${thresholds.heartRate.criticalBradycardia} bpm for ${ageGroup}).`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'AHA / ACLS Severe Bradycardia Protocol',
          sourceCriterion: 'VITAL_SIGN',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: `अत्यधिक धीमी हृदय गति (${hr} bpm) बेहोशी या अरेस्ट का कारण बन सकती है।`,
          descriptionOr: `ବିପଜ୍ଜନକ କମ୍ ନାଡ଼ି ଗତି (${hr} bpm)।`,
          matchedTrigger: `HR ${hr} bpm`,
        });
      } else if (hr >= thresholds.heartRate.criticalTachycardia) {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-VITAL-HR-TACHY-CRITICAL',
          ruleName: `Severe Tachycardia (${hr} bpm)`,
          category: 'RED',
          reason: `Heart rate ${hr} bpm exceeds critical limit (${thresholds.heartRate.criticalTachycardia} bpm for ${ageGroup}).`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'ACLS Tachycardia with Pulse Algorithm',
          sourceCriterion: 'VITAL_SIGN',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: `अत्यधिक तेज हृदय गति (${hr} bpm) की तत्काल जांच आवश्यक है।`,
          descriptionOr: `ଅତ୍ୟଧିକ ନାଡ଼ି ଗତି (${hr} bpm) ତୁରନ୍ତ ସମୀକ୍ଷା ଆବଶ୍ୟକ କରେ।`,
          matchedTrigger: `HR ${hr} bpm`,
        });
      } else if (hr <= thresholds.heartRate.abnormalBradycardia || hr >= thresholds.heartRate.abnormalTachycardia) {
        triggeredRules.push({
          id: 'RF-VITAL-HR-URGENT',
          ruleName: `Abnormal Heart Rate (${hr} bpm)`,
          category: 'YELLOW',
          reason: `Heart rate ${hr} bpm is abnormal for ${ageGroup} (expected ${thresholds.heartRate.abnormalBradycardia}-${thresholds.heartRate.abnormalTachycardia} bpm).`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'NEWS2 Heart Rate Scale',
          sourceCriterion: 'VITAL_SIGN',
        });
      }
    }

    // E. Respiratory Rate
    if (vitalsUnknown['respiratoryRate'] || vitals.respiratoryRate === null || vitals.respiratoryRate === undefined) {
      missingInformation.push('Respiratory rate unmeasured/unknown');
    } else {
      const rr = Number(vitals.respiratoryRate);
      if (rr <= thresholds.respiratoryRate.criticalBradypnea) {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-VITAL-RR-BRADY-CRITICAL',
          ruleName: `Severe Bradypnea / Respiratory Failure (${rr}/min)`,
          category: 'RED',
          reason: `Respiratory rate ${rr}/min indicates impending respiratory arrest (limit <= ${thresholds.respiratoryRate.criticalBradypnea} for ${ageGroup}).`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'WHO ETAT / BTS Respiratory Arrest Risk',
          sourceCriterion: 'VITAL_SIGN',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: `सांस लेने की गति अत्यधिक धीमी (${rr}/min) है। तत्काल सहायता आवश्यक है।`,
          descriptionOr: `ଅତ୍ୟନ୍ତ କମ୍ ଶ୍ୱାସକ୍ରିୟା (${rr}/min), ତୁରନ୍ତ ସହାୟତା ଆବଶ୍ୟକ।`,
          matchedTrigger: `RR ${rr}/min`,
        });
      } else if (rr >= thresholds.respiratoryRate.criticalTachypnea) {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-VITAL-RR-TACHY-CRITICAL',
          ruleName: `Severe Tachypnea / Respiratory Exhaustion (${rr}/min)`,
          category: 'RED',
          reason: `Respiratory rate ${rr}/min >= critical threshold (${thresholds.respiratoryRate.criticalTachypnea}/min for ${ageGroup}).`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'BTS / NICE Sepsis & Respiratory Guidelines',
          sourceCriterion: 'VITAL_SIGN',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: `सांस लेने की गति अत्यधिक तीव्र (${rr}/min) है।`,
          descriptionOr: `ପ୍ରବଳ ଶ୍ୱାସକ୍ରିୟା ଗତି (${rr}/min)।`,
          matchedTrigger: `RR ${rr}/min`,
        });
      } else if (rr <= thresholds.respiratoryRate.abnormalBradypnea || rr >= thresholds.respiratoryRate.abnormalTachypnea) {
        triggeredRules.push({
          id: 'RF-VITAL-RR-URGENT',
          ruleName: `Abnormal Respiratory Rate (${rr}/min)`,
          category: 'YELLOW',
          reason: `Respiratory rate ${rr}/min outside normal range for ${ageGroup}.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'NEWS2 Respiratory Scale',
          sourceCriterion: 'VITAL_SIGN',
        });
      }
    }

    // F. Temperature
    if (vitalsUnknown['temperatureCelsius'] || vitals.temperatureCelsius === null || vitals.temperatureCelsius === undefined) {
      missingInformation.push('Body temperature unmeasured/unknown');
    } else {
      const temp = Number(vitals.temperatureCelsius);
      if (temp >= thresholds.temperatureCelsius.criticalHyperthermia) {
        triggeredRules.push({
          id: 'RF-VITAL-TEMP-HYPER-CRITICAL',
          ruleName: `Hyperpyrexia / Extreme Fever (${temp}°C)`,
          category: 'RED',
          reason: `Core temperature >= ${thresholds.temperatureCelsius.criticalHyperthermia}°C risks febrile encephalopathy/heatstroke.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'WHO ETAT Severe Fever Guidelines',
          sourceCriterion: 'VITAL_SIGN',
        });
      } else if (temp <= thresholds.temperatureCelsius.criticalHypothermia) {
        triggeredRules.push({
          id: 'RF-VITAL-TEMP-HYPO-CRITICAL',
          ruleName: `Severe Hypothermia (${temp}°C)`,
          category: 'RED',
          reason: `Core temperature <= ${thresholds.temperatureCelsius.criticalHypothermia}°C indicates thermal decompensation.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'ERC Hypothermia Guidelines',
          sourceCriterion: 'VITAL_SIGN',
        });
      } else if (temp >= thresholds.temperatureCelsius.fever) {
        triggeredRules.push({
          id: 'RF-VITAL-TEMP-FEVER-URGENT',
          ruleName: `Pyrexia / Fever (${temp}°C)`,
          category: 'YELLOW',
          reason: `Elevated body temperature indicating systemic infection or inflammation.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'NICE Fever in Under 5s / Adult Sepsis',
          sourceCriterion: 'VITAL_SIGN',
        });
      }
    }

    // G. Blood Glucose
    if (vitalsUnknown['bloodGlucoseMgDl'] || vitals.bloodGlucoseMgDl === null || vitals.bloodGlucoseMgDl === undefined) {
      missingInformation.push('Blood glucose level unmeasured/unknown');
    } else {
      const bg = Number(vitals.bloodGlucoseMgDl);
      if (bg <= thresholds.bloodGlucoseMgDl.criticalHypoglycemia) {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-VITAL-GLUCOSE-HYPO-CRITICAL',
          ruleName: `Critical Hypoglycemia (${bg} mg/dL)`,
          category: 'RED',
          reason: `Blood glucose ${bg} mg/dL is life-threatening neuroglycopenia (< ${thresholds.bloodGlucoseMgDl.criticalHypoglycemia} mg/dL). Immediate IV dextrose/glucagon needed.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'ADA Standards of Medical Care: Severe Hypoglycemia',
          sourceCriterion: 'VITAL_SIGN',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: `ब्लड शुगर अत्यधिक कम (${bg} mg/dL) है। तत्काल ग्लूकोज सहायता अनिवार्य है।`,
          descriptionOr: `ରକ୍ତରେ ଶର୍କରା ଅତ୍ୟନ୍ତ କମ୍ (${bg} mg/dL)। ତୁରନ୍ତ ଗ୍ଲୁକୋଜ୍ ଆବଶ୍ୟକ।`,
          matchedTrigger: `Glucose ${bg} mg/dL`,
        });
      } else if (bg >= thresholds.bloodGlucoseMgDl.criticalHyperglycemia) {
        triggeredRules.push({
          id: 'RF-VITAL-GLUCOSE-HYPER-CRITICAL',
          ruleName: `Extreme Hyperglycemia (${bg} mg/dL) — DKA/HHS Alert`,
          category: 'RED',
          reason: `Blood glucose >= ${thresholds.bloodGlucoseMgDl.criticalHyperglycemia} mg/dL risks diabetic ketoacidosis or hyperosmolar state.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'ADA Hyperglycemic Crises Protocol',
          sourceCriterion: 'VITAL_SIGN',
        });
      } else if (bg <= thresholds.bloodGlucoseMgDl.abnormalHypoglycemia || bg >= thresholds.bloodGlucoseMgDl.abnormalHyperglycemia) {
        triggeredRules.push({
          id: 'RF-VITAL-GLUCOSE-URGENT',
          ruleName: `Abnormal Blood Glucose (${bg} mg/dL)`,
          category: 'YELLOW',
          reason: `Blood glucose out of safe fasting/postprandial range.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'ADA Glycemic Guidelines',
          sourceCriterion: 'VITAL_SIGN',
        });
      }
    }

    // H. Pain Score (0 - 10)
    if (vitalsUnknown['painScore'] || vitals.painScore === null || vitals.painScore === undefined) {
      missingInformation.push('Pain score (0-10 numeric scale) unrecorded');
    } else {
      const pain = Number(vitals.painScore);
      if (pain >= 8) {
        triggeredRules.push({
          id: 'RF-VITAL-PAIN-SEVERE',
          ruleName: `Severe Intractable Pain (${pain}/10)`,
          category: 'YELLOW',
          reason: `Pain intensity reported as ${pain}/10 requiring prompt analgesia and clinical evaluation.`,
          ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
          medicalReference: 'WHO Pain Ladder / MTS Pain Severity Criterion',
          sourceCriterion: 'VITAL_SIGN',
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 2. TEXT & REPORT SCREENING VIA CLINICAL_RED_FLAG_RULES
  // -------------------------------------------------------------
  const combinedTextParts: string[] = [
    params.chiefComplaint || '',
    params.text || '',
    ...(params.symptoms || []),
    ...(params.reportFindings || []),
  ];
  const normalizedCombinedText = combinedTextParts.join(' ').toLowerCase();

  for (const rule of CLINICAL_RED_FLAG_RULES) {
    // Check age applicability
    if (rule.appliesToAge === 'ADULT_ONLY' && ageGroup !== 'ADULT') {
      continue;
    }
    if (rule.appliesToAge === 'PAEDIATRIC_ONLY' && ageGroup === 'ADULT') {
      continue;
    }
    // Check pregnancy applicability
    if (rule.pregnancySpecific && params.pregnancyStatus !== 'PREGNANT' && params.pregnancyStatus !== 'YES') {
      continue;
    }

    let ruleMatched = false;
    let matchedKw = '';

    for (const kw of rule.keywords) {
      if (normalizedCombinedText.includes(kw.toLowerCase())) {
        ruleMatched = true;
        matchedKw = kw;
        break;
      }
    }

    if (ruleMatched) {
      const trigger: ClinicalRuleTrigger = {
        id: rule.id,
        ruleName: rule.ruleNameEn,
        category: rule.category,
        reason: rule.clinicalRationale,
        ageGroup: ageGroup === 'ADULT' ? 'ADULT' : 'PAEDIATRIC',
        medicalReference: rule.medicalReference,
        sourceCriterion: rule.pregnancySpecific ? 'PREGNANCY' : 'RED_FLAG',
      };
      triggeredRules.push(trigger);

      if (rule.category === 'RED') {
        redFlags.push({
          id: rule.id,
          name: rule.ruleNameEn,
          severity: 'CRITICAL',
          descriptionEn: rule.clinicalRationale,
          descriptionHi: rule.ruleNameHi,
          descriptionOr: rule.ruleNameOr,
          matchedTrigger: matchedKw,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 3. PREGNANCY SPECIFIC CLINICAL WARNING SIGNS
  // -------------------------------------------------------------
  if (params.pregnancyStatus === 'PREGNANT' || params.pregnancyStatus === 'YES') {
    if (params.pregnancyWarningSigns && params.pregnancyWarningSigns.length > 0) {
      const severeObstetric = params.pregnancyWarningSigns.some(s =>
        ['bleeding', 'vaginal_bleeding', 'seizures', 'severe_headache', 'epigastric_pain', 'visual_disturbance'].some(k =>
          s.toLowerCase().includes(k)
        )
      );
      if (severeObstetric) {
        const trigger: ClinicalRuleTrigger = {
          id: 'RF-PREG-DANGER-SIGNS',
          ruleName: 'Obstetric Red Flag: Danger Signs in Pregnancy',
          category: 'RED',
          reason: `Reported pregnancy warning signs: ${params.pregnancyWarningSigns.join(', ')}. Risk of eclampsia or antepartum hemorrhage.`,
          ageGroup: 'ADULT',
          medicalReference: 'WHO Managing Complications in Pregnancy and Childbirth (MCPC)',
          sourceCriterion: 'PREGNANCY',
        };
        triggeredRules.push(trigger);
        redFlags.push({
          id: trigger.id,
          name: trigger.ruleName,
          severity: 'CRITICAL',
          descriptionEn: trigger.reason,
          descriptionHi: 'गर्भावस्था में गंभीर खतरे के संकेत दर्ज किए गए हैं।',
          descriptionOr: 'ଗର୍ଭାବସ୍ଥାରେ ଗୁରୁତର ବିପଦ ସଙ୍କେତ ଚିହ୍ନଟ ହୋଇଛି।',
          matchedTrigger: params.pregnancyWarningSigns.join(', '),
        });
      } else {
        triggeredRules.push({
          id: 'RF-PREG-MONITORING',
          ruleName: 'Obstetric Assessment Required',
          category: 'YELLOW',
          reason: `Pregnancy symptoms reported requiring obstetrician review.`,
          ageGroup: 'ADULT',
          medicalReference: 'WHO MCPC Protocol',
          sourceCriterion: 'PREGNANCY',
        });
      }
    }
    if (!params.pregnancyWeeks) {
      missingInformation.push('Gestational age (pregnancy weeks) not documented');
    }
  }

  // Check chief complaint length & detail
  if (!params.chiefComplaint || params.chiefComplaint.trim().length < 4) {
    missingInformation.push('Chief complaint is absent or underspecified');
  }

  // -------------------------------------------------------------
  // 4. DETERMINE SUGGESTED TRIAGE URGENCY
  // -------------------------------------------------------------
  const redRuleCount = triggeredRules.filter(r => r.category === 'RED').length;
  const yellowRuleCount = triggeredRules.filter(r => r.category === 'YELLOW').length;

  let suggestedUrgency: UrgencyCategory = 'GREEN';
  let confidenceScore = 0.92;
  let rationaleEn = '';
  let rationaleHi = '';
  let rationaleOr = '';

  // SAFETY RULE 1: Confirmed RED rule must ALWAYS result in RED
  if (redRuleCount > 0) {
    suggestedUrgency = 'RED';
    confidenceScore = 0.95;
    const names = triggeredRules.filter(r => r.category === 'RED').map(r => r.ruleName).slice(0, 2).join('; ');
    rationaleEn = `Immediate emergency clinical assessment flagged: Triggered ${redRuleCount} life-threatening red-flag criteria (${names}).`;
    rationaleHi = `${redRuleCount} जीवन-घातक आपातकालीन नियमों के कारण तत्काल डॉक्टर समीक्षा अनिवार्य है (${names})।`;
    rationaleOr = `${redRuleCount} ଟି ଜରୁରୀକାଳୀନ ବିପଦ ସଙ୍କେତ କାରଣରୁ ତୁରନ୍ତ ଡାକ୍ତରୀ ଚିକିତ୍ସା ଆବଶ୍ୟକ (${names})।`;
  }
  // SAFETY RULE 2: YELLOW rules warrant urgent review
  else if (yellowRuleCount > 0) {
    suggestedUrgency = 'YELLOW';
    confidenceScore = 0.88;
    const names = triggeredRules.filter(r => r.category === 'YELLOW').map(r => r.ruleName).slice(0, 2).join('; ');
    rationaleEn = `Urgent clinical review warranted: Physiological derangement or priority warning signs detected (${names}).`;
    rationaleHi = `प्राथमिकता समीक्षा आवश्यक है: मध्यम शारीरिक असंतुलन या चेतावनी संकेत मिले हैं (${names})।`;
    rationaleOr = `ପ୍ରାଥମିକତା ସମୀକ୍ଷା ଆବଶ୍ୟକ: ମଧ୍ୟମ ଶାରୀରିକ ସମସ୍ୟା କିମ୍ବା ସତର୍କତା ସଙ୍କେତ ଚିହ୍ନଟ ହୋଇଛି (${names})।`;
  }
  // SAFETY RULE 3: Missing critical information must NOT default to GREEN -> NEEDS_CLINICIAN_REVIEW
  else if (
    missingInformation.length >= 3 ||
    (vitalsUnknown && Object.values(vitalsUnknown).filter(Boolean).length >= 4) ||
    (!params.text && !params.chiefComplaint) ||
    ((params.text?.trim().length || 0) + (params.chiefComplaint?.trim().length || 0) < 15)
  ) {
    suggestedUrgency = 'NEEDS_CLINICIAN_REVIEW';
    confidenceScore = 0.60;
    const missingSummary = missingInformation.slice(0, 3).join(', ');
    rationaleEn = `Provisional urgency deferred to qualified clinician review due to insufficient baseline information (${missingSummary}).`;
    rationaleHi = `अधूरी जानकारी के कारण स्वचालित वर्गीकरण को डॉक्टर की समीक्षा के लिए सुरक्षित रखा गया है (${missingSummary})।`;
    rationaleOr = `ଅସମ୍ପୂର୍ଣ୍ଣ ତଥ୍ୟ କାରଣରୁ ସ୍ୱତଃ ବର୍ଗୀକରଣ ବଦଳରେ ଡାକ୍ତରୀ ସମୀକ୍ଷା ପାଇଁ ପଠାଗଲା (${missingSummary})।`;
  }
  // SAFETY RULE 4: All normal, fully measured, no red flags
  else {
    suggestedUrgency = 'GREEN';
    confidenceScore = 0.91;
    rationaleEn = 'Stable clinical presentation without physiological red flags or vital sign compromises.';
    rationaleHi = 'स्थिर नैदानिक स्थिति, कोई आपातकालीन संकेत या शारीरिक असामान्यता नहीं पाई गई।';
    rationaleOr = 'ସ୍ଥିର ଶାରୀରିକ ସ୍ଥିତି, କୌଣସି ଜରୁରୀକାଳୀନ ବିପଦ ସଙ୍କେତ ଚିହ୍ନଟ ହୋଇନାହିଁ।';
  }

  return {
    suggestedUrgency,
    confidenceScore,
    triggeredRules,
    redFlags,
    missingInformation,
    rationaleEn,
    rationaleHi,
    rationaleOr,
    clinicalDisclaimer: MANDATORY_CLINICAL_DISCLAIMER,
    ageGroup,
  };
}

/**
 * Backward compatibility wrapper for existing callers
 */
export function screenRedFlags(
  text: string,
  vitals?: VitalSigns,
  patientAge?: number
): {
  redFlags: RedFlagAlert[];
  provisionalUrgency: UrgencyCategory;
  rationaleEn: string;
  rationaleHi: string;
  rationaleOr: string;
  triggeredRules: ClinicalRuleTrigger[];
  missingInformation: string[];
} {
  const result = evaluateClinicalRules({
    text,
    vitals,
    patientAge: patientAge ?? 35,
  });

  return {
    redFlags: result.redFlags,
    provisionalUrgency: result.suggestedUrgency,
    rationaleEn: result.rationaleEn,
    rationaleHi: result.rationaleHi,
    rationaleOr: result.rationaleOr,
    triggeredRules: result.triggeredRules,
    missingInformation: result.missingInformation,
  };
}
