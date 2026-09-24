/**
 * CLINICAL RULES CONFIGURATION FILE
 * TriageBridge Clinical Safety Gate & Deterministic Emergency Rules
 * 
 * Medical Standards & Protocols Referenced:
 * - WHO Emergency Triage Assessment and Treatment (ETAT)
 * - UK Royal College of Physicians National Early Warning Score (NEWS2)
 * - Manchester Triage System (MTS) & Emergency Severity Index (ESI)
 * - American Heart Association / ASA Stroke & Acute Coronary Syndrome Protocols
 * - WHO Managing Complications in Pregnancy and Childbirth (MCPC)
 * 
 * NOTE FOR CLINICAL REVIEWERS:
 * This file is strictly maintained for expert clinical auditing.
 * All thresholds are deterministic safety baselines and must never be relaxed
 * without senior clinical director sign-off.
 */

import { VitalSigns, ConsciousnessLevel, UrgencyCategory } from './types';

export type AgeGroup = 'INFANT' | 'TODDLER' | 'CHILD' | 'ADOLESCENT' | 'ADULT';

export interface VitalSignThresholds {
  ageGroup: AgeGroup;
  minAgeYears: number;
  maxAgeYears: number;
  heartRate: {
    criticalBradycardia: number; // RED
    criticalTachycardia: number; // RED
    abnormalBradycardia: number; // YELLOW
    abnormalTachycardia: number; // YELLOW
  };
  respiratoryRate: {
    criticalBradypnea: number;   // RED
    criticalTachypnea: number;   // RED
    abnormalBradypnea: number;   // YELLOW
    abnormalTachypnea: number;   // YELLOW
  };
  systolicBp: {
    criticalHypotension: number; // RED
    criticalHypertension: number;// RED
    abnormalHypotension: number; // YELLOW
    abnormalHypertension: number;// YELLOW
  };
  diastolicBp?: {
    criticalHypertension: number;// RED (e.g. >= 110-120)
  };
  spo2: {
    criticalHypoxia: number;     // RED (< 90%)
    moderateHypoxia: number;     // YELLOW (90 - 93%)
    normalTarget: number;        // >= 94%
  };
  temperatureCelsius: {
    criticalHyperthermia: number;// RED (>= 40.0°C)
    criticalHypothermia: number; // RED (< 35.0°C)
    fever: number;               // YELLOW (>= 38.0°C)
  };
  bloodGlucoseMgDl: {
    criticalHypoglycemia: number;// RED (< 54 mg/dL - Level 2)
    criticalHyperglycemia: number;// RED (> 400 mg/dL - DKA/HHS risk)
    abnormalHypoglycemia: number;// YELLOW (< 70 mg/dL)
    abnormalHyperglycemia: number;// YELLOW (> 250 mg/dL)
  };
}

/**
 * Verified Pediatric & Adult Vital Sign Baselines
 * Derived from WHO ETAT & PALS (Pediatric Advanced Life Support) guidelines
 */
export const VITAL_SIGNS_THRESHOLDS: Record<AgeGroup, VitalSignThresholds> = {
  INFANT: {
    ageGroup: 'INFANT',
    minAgeYears: 0,
    maxAgeYears: 1,
    heartRate: {
      criticalBradycardia: 80,
      criticalTachycardia: 180,
      abnormalBradycardia: 100,
      abnormalTachycardia: 160,
    },
    respiratoryRate: {
      criticalBradypnea: 20,
      criticalTachypnea: 60,
      abnormalBradypnea: 30,
      abnormalTachypnea: 50,
    },
    systolicBp: {
      criticalHypotension: 60,
      criticalHypertension: 110,
      abnormalHypotension: 70,
      abnormalHypertension: 100,
    },
    spo2: {
      criticalHypoxia: 90,
      moderateHypoxia: 93,
      normalTarget: 94,
    },
    temperatureCelsius: {
      criticalHyperthermia: 39.5,
      criticalHypothermia: 35.5,
      fever: 38.0,
    },
    bloodGlucoseMgDl: {
      criticalHypoglycemia: 45,
      criticalHyperglycemia: 300,
      abnormalHypoglycemia: 60,
      abnormalHyperglycemia: 200,
    },
  },

  TODDLER: {
    ageGroup: 'TODDLER',
    minAgeYears: 1,
    maxAgeYears: 4,
    heartRate: {
      criticalBradycardia: 70,
      criticalTachycardia: 160,
      abnormalBradycardia: 80,
      abnormalTachycardia: 140,
    },
    respiratoryRate: {
      criticalBradypnea: 15,
      criticalTachypnea: 45,
      abnormalBradypnea: 20,
      abnormalTachypnea: 35,
    },
    systolicBp: {
      criticalHypotension: 70,
      criticalHypertension: 120,
      abnormalHypotension: 80,
      abnormalHypertension: 110,
    },
    spo2: {
      criticalHypoxia: 90,
      moderateHypoxia: 93,
      normalTarget: 94,
    },
    temperatureCelsius: {
      criticalHyperthermia: 40.0,
      criticalHypothermia: 35.5,
      fever: 38.0,
    },
    bloodGlucoseMgDl: {
      criticalHypoglycemia: 50,
      criticalHyperglycemia: 350,
      abnormalHypoglycemia: 70,
      abnormalHyperglycemia: 250,
    },
  },

  CHILD: {
    ageGroup: 'CHILD',
    minAgeYears: 5,
    maxAgeYears: 11,
    heartRate: {
      criticalBradycardia: 60,
      criticalTachycardia: 140,
      abnormalBradycardia: 70,
      abnormalTachycardia: 120,
    },
    respiratoryRate: {
      criticalBradypnea: 12,
      criticalTachypnea: 35,
      abnormalBradypnea: 16,
      abnormalTachypnea: 28,
    },
    systolicBp: {
      criticalHypotension: 80,
      criticalHypertension: 135,
      abnormalHypotension: 90,
      abnormalHypertension: 120,
    },
    spo2: {
      criticalHypoxia: 90,
      moderateHypoxia: 93,
      normalTarget: 94,
    },
    temperatureCelsius: {
      criticalHyperthermia: 40.0,
      criticalHypothermia: 35.0,
      fever: 38.0,
    },
    bloodGlucoseMgDl: {
      criticalHypoglycemia: 54,
      criticalHyperglycemia: 380,
      abnormalHypoglycemia: 70,
      abnormalHyperglycemia: 250,
    },
  },

  ADOLESCENT: {
    ageGroup: 'ADOLESCENT',
    minAgeYears: 12,
    maxAgeYears: 17,
    heartRate: {
      criticalBradycardia: 50,
      criticalTachycardia: 130,
      abnormalBradycardia: 60,
      abnormalTachycardia: 110,
    },
    respiratoryRate: {
      criticalBradypnea: 10,
      criticalTachypnea: 30,
      abnormalBradypnea: 12,
      abnormalTachypnea: 24,
    },
    systolicBp: {
      criticalHypotension: 85,
      criticalHypertension: 150,
      abnormalHypotension: 95,
      abnormalHypertension: 135,
    },
    spo2: {
      criticalHypoxia: 90,
      moderateHypoxia: 93,
      normalTarget: 94,
    },
    temperatureCelsius: {
      criticalHyperthermia: 40.0,
      criticalHypothermia: 35.0,
      fever: 38.0,
    },
    bloodGlucoseMgDl: {
      criticalHypoglycemia: 54,
      criticalHyperglycemia: 400,
      abnormalHypoglycemia: 70,
      abnormalHyperglycemia: 250,
    },
  },

  ADULT: {
    ageGroup: 'ADULT',
    minAgeYears: 18,
    maxAgeYears: 120,
    heartRate: {
      criticalBradycardia: 40,  // Severe bradycardia
      criticalTachycardia: 130, // Severe tachycardia
      abnormalBradycardia: 50,
      abnormalTachycardia: 110,
    },
    respiratoryRate: {
      criticalBradypnea: 8,     // Severe bradypnea / hypoventilation
      criticalTachypnea: 30,    // Severe tachypnea / distress
      abnormalBradypnea: 11,
      abnormalTachypnea: 22,
    },
    systolicBp: {
      criticalHypotension: 90,  // Shock / Decompensation
      criticalHypertension: 180,// Hypertensive Emergency
      abnormalHypotension: 100,
      abnormalHypertension: 140,
    },
    diastolicBp: {
      criticalHypertension: 110,// Hypertensive Emergency threshold
    },
    spo2: {
      criticalHypoxia: 90,      // Critical Hypoxia requiring urgent oxygen
      moderateHypoxia: 93,      // Borderline oxygenation
      normalTarget: 94,
    },
    temperatureCelsius: {
      criticalHyperthermia: 40.0,// Hyperpyrexia
      criticalHypothermia: 35.0, // Hypothermia
      fever: 38.0,
    },
    bloodGlucoseMgDl: {
      criticalHypoglycemia: 54, // Severe neuroglycopenia risk
      criticalHyperglycemia: 400,// DKA / HHS risk
      abnormalHypoglycemia: 70,
      abnormalHyperglycemia: 250,
    },
  },
};

export function getAgeGroup(ageYears: number): AgeGroup {
  if (ageYears < 1) return 'INFANT';
  if (ageYears <= 4) return 'TODDLER';
  if (ageYears <= 11) return 'CHILD';
  if (ageYears <= 17) return 'ADOLESCENT';
  return 'ADULT';
}

export interface RedFlagRuleDefinition {
  id: string;
  category: 'RED' | 'YELLOW';
  ruleNameEn: string;
  ruleNameHi: string;
  ruleNameOr: string;
  keywords: string[];
  medicalReference: string;
  clinicalRationale: string;
  appliesToAge: 'ALL' | 'PAEDIATRIC_ONLY' | 'ADULT_ONLY';
  pregnancySpecific?: boolean;
}

/**
 * Deterministic Clinical Emergency Red-Flag Catalog
 * Each rule represents a hard stop: if positive, the case must be classified as RED.
 */
export const CLINICAL_RED_FLAG_RULES: RedFlagRuleDefinition[] = [
  // 1. Unconsciousness or severely altered consciousness
  {
    id: 'RF-UNCONSCIOUS',
    category: 'RED',
    ruleNameEn: 'Severely Altered Consciousness or Unresponsiveness',
    ruleNameHi: 'बेहोशी या चेतना की गंभीर कमी',
    ruleNameOr: 'ଚେତାଶୂନ୍ୟ କିମ୍ବା ଗୁରୁତର ଅଚେତ ଅବସ୍ଥା',
    keywords: [
      'unconscious', 'coma', 'unresponsive', 'fainted', 'loss of consciousness',
      'syncope', 'collapsed', 'not waking up', 'drowsy cannot rouse', 'avpu p', 'avpu u',
      'बेहोश', 'चेतना खोना', 'अचेत', 'गश खाकर', 'ଚେତା ହରାଇବା', 'ଅଚେତ', 'ଜ୍ଞାନଶୂନ୍ୟ',
    ],
    medicalReference: 'WHO ETAT / AVPU Disability Scale (Voice/Pain/Unresponsive)',
    clinicalRationale: 'Immediate airway compromise risk; mandates urgent resuscitation and physician assessment.',
    appliesToAge: 'ALL',
  },

  // 2. Severe breathing difficulty / acute respiratory distress
  {
    id: 'RF-RESPIRATORY-DISTRESS',
    category: 'RED',
    ruleNameEn: 'Severe Respiratory Distress or Acute Stridor',
    ruleNameHi: 'गंभीर सांस लेने में कठिनाई या घरघराहट',
    ruleNameOr: 'ତୀବ୍ର ଶ୍ୱାସକଷ୍ଟ କିମ୍ବା ଘରଘର ଶବ୍ଦ',
    keywords: [
      'gasping', 'stridor', 'severe breathlessness', 'unable to complete sentence',
      'intercostal retractions', 'grunting', 'choking', 'cyanotic breathing',
      'सांस फूलना', 'दम घुटना', 'सांस नहीं ले पा रहा', 'ନିଶ୍ୱାସ ବନ୍ଦ', 'ପ୍ରବଳ ଶ୍ୱାସକଷ୍ଟ',
    ],
    medicalReference: 'BTS / WHO Emergency Triage (Airway & Breathing Gate)',
    clinicalRationale: 'High risk of impending respiratory arrest; urgent bronchodilators, high-flow O2 or intubation readiness required.',
    appliesToAge: 'ALL',
  },

  // 3. Acute Severe Chest Pain (Suspected ACS / Aortic Emergency)
  {
    id: 'RF-ACUTE-CHEST-PAIN',
    category: 'RED',
    ruleNameEn: 'Acute Substernal Anginal Chest Pain radiating to Arm or Jaw',
    ruleNameHi: 'सीने में तेज दर्द, बाएं हाथ या जबड़े में खिंचाव',
    ruleNameOr: 'ଛାତିରେ ପ୍ରବଳ ଯନ୍ତ୍ରଣା ବାମ ହାତ କିମ୍ବା ବେକକୁ ବ୍ୟାପିବା',
    keywords: [
      'chest pain', 'chest tightness', 'crushing chest', 'pressure in chest',
      'radiating to left arm', 'radiating to jaw', 'heavy chest diaphoresis',
      'सीने में दर्द', 'छाती में जकड़न', 'बाएं हाथ में दर्द', 'ଛାତି ଯନ୍ତ୍ରଣା', 'ଛାତି ଚିପି ଧରିବା',
    ],
    medicalReference: 'AHA / ACC STEMI / NSTEMI Acute Coronary Syndrome Protocol',
    clinicalRationale: 'Potential acute myocardial infarction; requires 12-lead ECG within 10 minutes and telemetry.',
    appliesToAge: 'ADULT_ONLY',
  },

  // 4. Stroke-like symptoms (FAST Protocol)
  {
    id: 'RF-STROKE-FAST',
    category: 'RED',
    ruleNameEn: 'Acute Neurological Deficit / Stroke-Like Presentation (FAST)',
    ruleNameHi: 'अचानक लकवा, चेहरे का टेढ़ापन या बोलने में असमर्थता (स्ट्रोक)',
    ruleNameOr: 'ପକ୍ଷାଘାତ ଲକ୍ଷଣ, ମୁହଁ ବଙ୍କା ହେବା କିମ୍ବା କଥା ଅସ୍ପଷ୍ଟ (ଷ୍ଟ୍ରୋକ୍)',
    keywords: [
      'facial droop', 'face drooping', 'arm weakness', 'hemiparesis', 'slurred speech',
      'unable to speak', 'sudden numbness one side', 'stroke', 'fast positive',
      'लकवा', 'मुंह टेढ़ा होना', 'आधा शरीर सुन्न', 'बोली बंद', 'ପକ୍ଷାଘାତ', 'ମୁହଁ ବଙ୍କା', 'କଥା ନଆସିବା',
    ],
    medicalReference: 'AHA / ASA Acute Ischemic Stroke Thrombolysis Window Guidelines',
    clinicalRationale: 'Hyperacute brain ischemia; urgent non-contrast head CT and thrombolysis screening required within 4.5 hours.',
    appliesToAge: 'ALL',
  },

  // 5. Severe uncontrolled bleeding / hemorrhage
  {
    id: 'RF-SEVERE-BLEEDING',
    category: 'RED',
    ruleNameEn: 'Exsanguinating or Uncontrolled Active Hemorrhage',
    ruleNameHi: 'गंभीर अनियंत्रित रक्तस्राव',
    ruleNameOr: 'ଅତ୍ୟଧିକ ଅନିୟନ୍ତ୍ରିତ ରକ୍ତସ୍ରାବ',
    keywords: [
      'uncontrolled bleeding', 'profuse bleeding', 'arterial bleed', 'spurting blood',
      'heavy blood loss', 'hematemesis large volume', 'massive hemoptysis',
      'खून बहना', 'अत्यधिक खून', 'रक्त बहना', 'ରକ୍ତସ୍ରାବ', 'ପ୍ରବଳ ରକ୍ତ ବୋହିବା',
    ],
    medicalReference: 'ATLS (Advanced Trauma Life Support) Hemorrhage Control',
    clinicalRationale: 'Exsanguination risk leading to irreversible hypovolemic shock; immediate tourniquet/compression and IV volume replacement.',
    appliesToAge: 'ALL',
  },

  // 6. Active or prolonged seizure / Status Epilepticus
  {
    id: 'RF-ACTIVE-SEIZURE',
    category: 'RED',
    ruleNameEn: 'Active Convulsion or Status Epilepticus',
    ruleNameHi: 'सक्रिय दौरा या मिरगी का दौरा जारी रहना',
    ruleNameOr: 'ବାତ ମାରିବା କିମ୍ବା କ୍ରମାଗତ ଅପସ୍ମାର ଦୌରା',
    keywords: [
      'active seizure', 'convulsions', 'shaking violently', 'status epilepticus',
      'fits ongoing', 'frothing at mouth seizure',
      'दौरा', 'मिरगी', 'झटका लगना', 'ବାତ ମାରିବା', 'ମୃଗୀ ରୋଗ ଦୌରା',
    ],
    medicalReference: 'Neurocritical Care Society Status Epilepticus Guideline',
    clinicalRationale: 'Prolonged cerebral hypoxia and metabolic derangement; requires immediate benzodiazepines and airway protection.',
    appliesToAge: 'ALL',
  },

  // 7. Severe Anaphylaxis / Allergic Airway Reaction
  {
    id: 'RF-ANAPHYLAXIS',
    category: 'RED',
    ruleNameEn: 'Severe Anaphylactic Reaction with Airway Compromise',
    ruleNameHi: 'गंभीर एनाफिलेक्सिस, होंठ/गले में सूजन और सांस की रुकावट',
    ruleNameOr: 'ଗୁରୁତର ଆନାଫାଇଲାକ୍ସିସ୍, ଓଠ/ଗଳା ଫୁଲିବା ଓ ଶ୍ୱାସରୋଧ',
    keywords: [
      'anaphylaxis', 'tongue swelling', 'lip swelling', 'throat closing',
      'stridor post bee sting', 'angioedema', 'severe peanut allergy shock',
      'एलर्जी', 'गला चोक होना', 'होंठ सूजना', 'ଗଳା ଫୁଲିଯିବା', 'ତୀବ୍ର ଆଲର୍ଜି',
    ],
    medicalReference: 'WAO (World Allergy Organization) Anaphylaxis Guidelines',
    clinicalRationale: 'Rapidly fatal asphyxiation; immediate intramuscular Epinephrine (Adrenaline 1:1000) administration mandated.',
    appliesToAge: 'ALL',
  },

  // 8. Central Cyanosis
  {
    id: 'RF-CYANOSIS',
    category: 'RED',
    ruleNameEn: 'Central Cyanosis (Blue Discoloration of Lips/Tongue)',
    ruleNameHi: 'साइनोसिस (होंठ या जीभ का नीला पड़ना)',
    ruleNameOr: 'ନୀଳ ପଡ଼ିଯିବା (ଓଠ ଓ ଜିଭର ଅକ୍ସିଜେନ୍ ଅଭାବ)',
    keywords: [
      'cyanosis', 'lips turned blue', 'blue tongue', 'turning blue', 'cyanotic skin',
      'नीला पड़ना', 'होंठ नीले', 'ନୀଳ ପଡ଼ିବା', 'ଶରୀର ନୀଳ ହେବା',
    ],
    medicalReference: 'WHO ETAT Emergency Signs: Oxygenation Deficit',
    clinicalRationale: 'Severe arterial deoxygenation (deoxyhemoglobin > 5 g/dL); immediate supplemental oxygenation and circulation assessment.',
    appliesToAge: 'ALL',
  },

  // 9. Major Trauma / Polytrauma
  {
    id: 'RF-MAJOR-TRAUMA',
    category: 'RED',
    ruleNameEn: 'Major High-Energy Trauma / Penetrating Injury',
    ruleNameHi: 'गंभीर दुर्घटना या गहरी चोट (पॉलीट्रामा)',
    ruleNameOr: 'ଗୁରୁତର ଦୁର୍ଘଟଣା କିମ୍ବା ଶରୀର ଭିତରକୁ ଆଘାତ',
    keywords: [
      'major accident', 'polytrauma', 'penetrating chest wound', 'head injury deformed skull',
      'fall from height', 'crushed under vehicle', 'pedestrian hit by truck',
      'सड़क दुर्घटना', 'गंभीर चोट', 'सिर पर भारी चोट', 'ମୋଟର ଦୁର୍ଘଟଣା', 'ମୁଣ୍ଡରେ ଗୁରୁତର ଆଘାତ',
    ],
    medicalReference: 'ATLS Golden Hour Trauma Resuscitation Protocol',
    clinicalRationale: 'High risk of occult tension pneumothorax, intracranial hemorrhage, or pelvic pelvic catastrophe.',
    appliesToAge: 'ALL',
  },

  // 10. Serious Poisoning / Toxic Ingestion
  {
    id: 'RF-POISONING',
    category: 'RED',
    ruleNameEn: 'Acute Toxic Chemical Ingestion / Severe Poisoning',
    ruleNameHi: 'विषाक्त पदार्थ या कीटनाशक का सेवन',
    ruleNameOr: 'ବିଷାକ୍ତ କୀଟନାଶକ କିମ୍ବା ରାସାୟନିକ ପଦାର୍ଥ ସେବନ',
    keywords: [
      'poisoning', 'insecticide', 'pesticide ingestion', 'organophosphate',
      'paraquat', 'swallowed poison', 'acid ingestion', 'severe overdose',
      'जहर', 'कीटनाशक', 'विषाक्तता', 'ବିଷ ପିଇବା', 'କୀଟନାଶକ',
    ],
    medicalReference: 'WHO Clinical Management of Acute Pesticide Poisoning',
    clinicalRationale: 'Acute cholinergic crisis / cardiotoxicity; immediate atropinization, decontamination, and intensive monitoring required.',
    appliesToAge: 'ALL',
  },

  // 11. Severe Pregnancy Warning Signs (Pre-eclampsia / Antepartum Hemorrhage)
  {
    id: 'RF-PREGNANCY-EMERGENCY',
    category: 'RED',
    ruleNameEn: 'Severe Obstetric Emergency (Severe Pre-eclampsia / Obstetric Hemorrhage)',
    ruleNameHi: 'गंभीर प्रसवकालीन आपातकाल (प्री-एक्लेमप्सिया या भारी रक्तस्राव)',
    ruleNameOr: 'ଗର୍ଭାବସ୍ଥାରେ ଗୁରୁତର ସଙ୍କଟ (ଉଚ୍ଚ ରକ୍ତଚାପ କିମ୍ବା ପ୍ରଚୁର ରକ୍ତସ୍ରାବ)',
    keywords: [
      'pregnancy bleeding', 'heavy vaginal bleeding pregnant', 'severe pre-eclampsia',
      'eclampsia', 'convulsions pregnancy', 'severe headache epigastric pregnant',
      'गर्भावस्था में खून', 'गर्भावस्था में तेज सिरदर्द', 'ଗର୍ଭାବସ୍ଥାରେ ରକ୍ତସ୍ରାବ',
    ],
    medicalReference: 'WHO Managing Complications in Pregnancy and Childbirth (MCPC)',
    clinicalRationale: 'Threat to both maternal and fetal survival; immediate magnesium sulfate / obstetric emergency response.',
    appliesToAge: 'ADULT_ONLY',
    pregnancySpecific: true,
  },
];
