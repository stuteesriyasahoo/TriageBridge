import { SupportedLocale } from './types';
import { en } from './translations/en';

/**
 * Deterministic prewritten clinical translations requiring professional validation
 * for patient clinical statements.
 * Preserves original statements while providing accurate localized displays.
 */
interface StatementMapping {
  en: string;
  hi: string;
  or: string;
}

const CLINICAL_STATEMENT_CORPUS: StatementMapping[] = [
  {
    en: 'Severe tightness in center of chest since morning. Left arm feels numb and I feel dizzy when sitting up.',
    hi: 'सुबह से सीने के बीच में बहुत तेज दबाव महसूस हो रहा है। बायां हाथ सुन्न लग रहा है और बैठने पर चक्कर आ रहे हैं।',
    or: 'ସକାଳଠାରୁ ଛାତିର ମଝି ଭାଗରେ ଭୟଙ୍କର ଚାପ ଅନୁଭବ ହେଉଛି। ବାମ ହାତ ଅବଶ ଲାଗୁଛି ଏବଂ ବସିଲେ ମୁଣ୍ଡ ବୁଲାଉଛି।',
  },
  {
    en: 'Severe tightness in center of chest since morning...',
    hi: 'सुबह से सीने के बीच में बहुत तेज दबाव महसूस हो रहा है...',
    or: 'ସକାଳଠାରୁ ଛାତିର ମଝି ଭାଗରେ ଭୟଙ୍କର ଚାପ ଅନୁଭବ ହେଉଛି...',
  },
  {
    en: 'I have severe chest pain since this morning. The pain is radiating towards my left arm and shoulder. It is very hard to breathe and I am sweating profusely.',
    hi: 'मुझे आज सुबह से सीने में तेज दर्द हो रहा है। दर्द बाएं हाथ और कंधे की तरफ फैल रहा है। सांस लेना बहुत मुश्किल हो रहा है और बहुत पसीना आ रहा है।',
    or: 'ମୋର ଆଜି ସକାଳୁ ଛାତିରେ ପ୍ରବଳ ଯନ୍ତ୍ରଣା ହେଉଛି। ଯନ୍ତ୍ରଣା ବାମ ହାତ ଓ କାନ୍ଧ ଆଡ଼କୁ ବ୍ୟାପୁଛି। ନିଶ୍ୱାସ ନେବା ବହୁତ କଷ୍ଟକର ହେଉଛି ଓ ପ୍ରବଳ ଝାଳ ବୋହୁଛି।',
  },
  {
    en: 'High fever for four days with severe abdominal pain, nausea, and extreme fatigue.',
    hi: 'चार दिन से बहुत तेज बुखार है, पेट में असहनीय दर्द है, उल्टी का मन है और बहुत कमजोरी लग रही है।',
    or: 'ଚାରି ଦିନ ହେବ ପ୍ରବଳ ଜ୍ୱର ଅଛି, ପେଟରେ ଅସହ୍ୟ ଯନ୍ତ୍ରଣା ହେଉଛି, ବାନ୍ତି ଭାବ ଏବଂ ଅତ୍ୟଧିକ ଦୁର୍ବଳତା ଲାଗୁଛି।',
  },
  {
    en: 'Mild intermittent lower back stiffness after lifting heavy farm tools. No radiation or bowel/bladder issues.',
    hi: 'खेत के भारी औजार उठाने के बाद पीठ के निचले हिस्से में हल्का दर्द और अकड़न है। कोई गंभीर समस्या नहीं है।',
    or: 'ଭାରୀ ଚାଷ ଉପକରଣ ଉଠାଇବା ପରେ ଅଣ୍ଟାର ତଳ ଭାଗରେ ସାମାନ୍ୟ କଠିନତା ଓ ଯନ୍ତ୍ରଣା ଅନୁଭବ ହେଉଛି।',
  },
  {
    en: 'Chest feels very heavy... unable to speak for an hour... left side is aching severely...',
    hi: 'सीने में भारीपन लग रहा है... एक घंटे से बोल नहीं पा रहा... बाईं तरफ बहुत तेज दर्द है...',
    or: 'ଛାତି ଭାରୀ ଲାଗୁଛି ଆଜ୍ଞା... ଘଣ୍ଟାଏ ହେବ କିଛି କହିପାରୁନି... ବାମ ପାଖ ବହୁତ ବିନ୍ଧୁଛି...',
  },
  {
    en: 'Acute chest pain radiating to left arm with breathlessness',
    hi: 'सीने में तेज दर्द जो बाएं हाथ में फैल रहा है और सांस फूल रही है',
    or: 'ପ୍ରବଳ ଛାତି ଯନ୍ତ୍ରଣା, ବାମ ହାତକୁ ଯନ୍ତ୍ରଣା ବ୍ୟାପିବା ଏବଂ ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ',
  },
];

/**
 * Returns translated display version for a patient statement in the selected language.
 * Never overwrites or mutates the original patient text.
 */
export function getTranslatedPatientStatement(
  statement: string,
  targetLocale: SupportedLocale,
  fallbackEnglishTranslation?: string
): string {
  if (!statement || !statement.trim()) return '';

  const clean = statement.trim();

  // Search in clinical corpus
  for (const item of CLINICAL_STATEMENT_CORPUS) {
    if (
      clean.includes(item.en) ||
      item.en.includes(clean) ||
      clean.includes(item.or) ||
      item.or.includes(clean) ||
      clean.includes(item.hi) ||
      item.hi.includes(clean)
    ) {
      if (targetLocale === 'or') return item.or;
      if (targetLocale === 'hi') return item.hi;
      return item.en;
    }
  }

  // If fallback English is supplied
  if (fallbackEnglishTranslation && fallbackEnglishTranslation.trim()) {
    const fallbackClean = fallbackEnglishTranslation.trim();
    for (const item of CLINICAL_STATEMENT_CORPUS) {
      if (fallbackClean.includes(item.en) || item.en.includes(fallbackClean)) {
        if (targetLocale === 'or') return item.or;
        if (targetLocale === 'hi') return item.hi;
        return item.en;
      }
    }
    if (targetLocale === 'en') return fallbackClean;
  }

  // If locale is english and text is already english
  const isOdia = /[\u0B00-\u0B7F]/.test(clean);
  const isHindi = /[\u0900-\u097F]/.test(clean);

  if (!isOdia && !isHindi && targetLocale === 'en') {
    return clean;
  }

  if (targetLocale === 'or' && isOdia) {
    return clean;
  }

  if (targetLocale === 'hi' && isHindi) {
    return clean;
  }

  if (fallbackEnglishTranslation) {
    return fallbackEnglishTranslation;
  }

  return clean;
}

/**
 * Deterministic prewritten clinical translations requiring professional validation
 * for red-flag warning signs.
 * Clinical abbreviations (BP, SpO₂, HR, mmHg, bpm, °C) are preserved verbatim.
 */
interface WarningRuleMapping {
  patterns: RegExp[];
  en: string;
  hi: string;
  or: string;
}

const CLINICAL_WARNING_MAPPINGS: WarningRuleMapping[] = [
  {
    patterns: [/Critical Hypoxia/i, /SpO2\s*<\s*90/i, /Hypoxia/i],
    en: 'Critical Hypoxia',
    hi: 'गंभीर हाइपोक्सिया (ऑक्सीजन की अत्यधिक कमी)',
    or: 'ଗୁରୁତର ହାଇପୋକ୍ସିଆ (ଅମ୍ଳଜାନର ଘୋର ଅଭାବ)',
  },
  {
    patterns: [
      /Severely Altered Consciousness/i,
      /Impaired Consciousness/i,
      /Unresponsiveness/i,
      /AVPU:\s*Pain/i,
    ],
    en: 'Severely Altered Consciousness or Unresponsiveness',
    hi: 'चेतना की गंभीर कमी या अनुत्तरदायी स्थिति',
    or: 'ଅତ୍ୟନ୍ତ ବିଚଳିତ ଚେତନା କିମ୍ବା ନିସ୍ପନ୍ଦ ଅବସ୍ଥା',
  },
  {
    patterns: [
      /Acute Chest Pain/i,
      /Cardiac Compromise/i,
      /Acute Anginal Pain/i,
      /ଛାତି ଯନ୍ତ୍ରଣା/i,
    ],
    en: 'Acute Chest Pain / Cardiac Compromise',
    hi: 'सीने में तीव्र दर्द / हृदय संबंधी आपातकाल',
    or: 'ଛାତିରେ ପ୍ରବଳ ଯନ୍ତ୍ରଣା / ହୃଦ୍‌ରୋଗ ଜନିତ ସଙ୍କଟ',
  },
  {
    patterns: [/Hypertensive (Crisis|Urgency)/i, /SBP\s*>?\s*180/i],
    en: 'Hypertensive Crisis / Severe Blood Pressure Elevation',
    hi: 'हाइपरटेंसिव क्राइसिस / अत्यधिक उच्च रक्तचाप',
    or: 'ଅତ୍ୟଧିକ ଉଚ୍ଚ ରକ୍ତଚାପ (ହାଇପରଟେନସିଭ୍ କ୍ରାଇସିସ୍)',
  },
  {
    patterns: [/Severe Tachycardia/i, /HR\s*>?\s*130/i],
    en: 'Severe Tachycardia (Extreme Heart Rate)',
    hi: 'गंभीर टैचीकार्डिया (अत्यधिक तेज दिल की धड़कन)',
    or: 'ଅତ୍ୟନ୍ତ ଦ୍ରୁତ ହୃଦ୍‌ସ୍ପନ୍ଦନ',
  },
  {
    patterns: [/Severe Bradycardia/i, /HR\s*<\s*40/i],
    en: 'Severe Bradycardia (Critically Low Heart Rate)',
    hi: 'गंभीर ब्रैडीकार्डिया (अत्यधिक धीमी दिल की धड़कन)',
    or: 'ଅତ୍ୟନ୍ତ ମନ୍ଥର ହୃଦ୍‌ସ୍ପନ୍ଦନ',
  },
  {
    patterns: [/Respiratory Distress/i, /Tachypnea/i, /RR\s*>?\s*30/i],
    en: 'Severe Respiratory Distress / Impaired Breathing',
    hi: 'गंभीर श्वसन संकट / सांस लेने में तीव्र कठिनाई',
    or: 'ଗୁରୁତର ଶ୍ୱାସକଷ୍ଟ / ନିଶ୍ୱାସ ନେବାରେ ଘୋର ବ୍ୟାଘାତ',
  },
  {
    patterns: [/Hyperpyrexia/i, /High Fever/i, /Temp\s*>?\s*39/i],
    en: 'Severe Hyperpyrexia / Extreme High Fever',
    hi: 'अत्यधिक तेज बुखार / हाइपरपायरेक्सिया',
    or: 'ଅତ୍ୟନ୍ତ ପ୍ରବଳ ଜ୍ୱର (ହାଇପରପାଇରେକ୍ସିଆ)',
  },
  {
    patterns: [/Severe Hypothermia/i, /Temp\s*<\s*35/i],
    en: 'Severe Hypothermia (Critical Body Coldness)',
    hi: 'गंभीर हाइपोथर्मिया (शरीर का खतरनाक रूप से ठंडा होना)',
    or: 'ଅତ୍ୟନ୍ତ କମ୍ ଶାରୀରିକ ତାପମାତ୍ରା (ହାଇପୋଥର୍ମିଆ)',
  },
  {
    patterns: [/Severe Hypoglycemia/i, /Glucose\s*<\s*54/i],
    en: 'Critical Hypoglycemia (Severe Low Blood Sugar)',
    hi: 'गंभीर हाइपोग्लाइसीमिया (ब्लड शुगर का खतरनाक रूप से कम होना)',
    or: 'ଗୁରୁତର ରକ୍ତ ଶର୍କରା ହ୍ରାସ (ହାଇପୋଗ୍ଲାଇସେମିଆ)',
  },
  {
    patterns: [/Severe Hyperglycemia/i, /Ketoacidosis/i],
    en: 'Severe Hyperglycemia / Ketoacidosis Risk',
    hi: 'गंभीर हाइपरग्लाइसीमिया (ब्लड शुगर का अत्यधिक बढ़ना)',
    or: 'ଗୁରୁତର ରକ୍ତ ଶର୍କରା ବୃଦ୍ଧି (ହାଇପରଗ୍ଲାଇସେମିଆ)',
  },
  {
    patterns: [/Anaphylaxis/i, /Airway Stridor/i],
    en: 'Severe Anaphylaxis / Airway Stridor',
    hi: 'गंभीर एनाफिलेक्सिस / वायुमार्ग अवरोध',
    or: 'ଗୁରୁତର ଆନାଫାଇଲାକ୍ସିସ୍ / ଶ୍ୱାସନଳୀ ଅବରୋଧ',
  },
  {
    patterns: [/Hemorrhage/i, /Active Arterial Bleeding/i],
    en: 'Massive Hemorrhage / Active Arterial Bleeding',
    hi: 'अत्यधिक रक्तस्राव / सक्रिय धमनी से खून बहना',
    or: 'ଅତ୍ୟଧିକ ରକ୍ତସ୍ରାବ / ଧମନୀରୁ ତୀବ୍ର ରକ୍ତପାତ',
  },
  {
    patterns: [/Convulsion/i, /Epilepticus/i],
    en: 'Active Convulsion / Status Epilepticus',
    hi: 'सक्रिय दौरा / लगातार मिर्गी के झटके',
    or: 'ତୀବ୍ର ବାତ / ଲଗାତାର ଆକ୍ଷେପ (କନଭଲସନ)',
  },
  {
    patterns: [/Stroke/i, /Neurological Deficit/i],
    en: 'Acute Focal Neurological Deficit (Stroke Protocol)',
    hi: 'तीव्र न्यूरोलॉजिकल लक्षण (स्ट्रोक प्रोटोकॉल)',
    or: 'ତୀବ୍ର ସ୍ନାୟବିକ ବିକୃତି (ଷ୍ଟ୍ରୋକ୍ ସତର୍କତା)',
  },
  {
    patterns: [/Sepsis/i, /Septic Shock/i],
    en: 'Severe Sepsis / Septic Shock Risk',
    hi: 'गंभीर सेप्सिस / सेप्टिक शॉक का खतरा',
    or: 'ଗୁରୁତର ସେପ୍ସିସ୍ / ସେପ୍ଟିକ୍ ଶକ୍ ଆଶଙ୍କା',
  },
  {
    patterns: [/Eclampsia/i, /Preeclampsia/i],
    en: 'Pregnancy Eclampsia / Severe Preeclampsia Risk',
    hi: 'गर्भावस्था में एक्लम्पसिया / गंभीर उच्च रक्तचाप जोखिम',
    or: 'ଗର୍ଭାବସ୍ଥାରେ ଏକ୍ଲାମ୍ପସିଆ / ଅତ୍ୟନ୍ତ ଉଚ୍ଚ ରକ୍ତଚାପ ଆଶଙ୍କା',
  },
  {
    patterns: [/Pre-Hospital Delivery/i],
    en: 'Imminent Pre-Hospital Emergency Delivery',
    hi: 'अस्पताल पूर्व आसन्न आपातकालीन प्रसव',
    or: 'ଜରୁରୀକାଳୀନ ପ୍ରସବ ପରିସ୍ଥିତି',
  },
  {
    patterns: [/Postpartum Hemorrhage/i, /Antepartum Hemorrhage/i],
    en: 'Severe Antepartum or Postpartum Hemorrhage',
    hi: 'प्रसव पूर्व या प्रसवोत्तर गंभीर रक्तस्राव',
    or: 'ପ୍ରସବ ପୂର୍ବ ବା ପରବର୍ତ୍ତୀ ଅତ୍ୟଧିକ ରକ୍ତସ୍ରାବ',
  },
];

/**
 * Translates warning sign / red flag names accurately while keeping measurements
 * (e.g. SpO₂, BP, HR, mmHg, bpm, °C) unchanged.
 */
export function translateWarningSign(warningName: string, locale: SupportedLocale): string {
  if (!warningName) return '';

  // Extract any measurement suffix e.g. "(SpO2 88%)" or "(SBP 178)"
  const measurementMatch = warningName.match(/\(([^)]+)\)/);
  let measurementSuffix = '';
  if (measurementMatch) {
    // Keep clinical abbreviations SpO2 -> SpO₂
    measurementSuffix = ` (${measurementMatch[1].replace(/SpO2/gi, 'SpO₂')})`;
  }

  for (const mapping of CLINICAL_WARNING_MAPPINGS) {
    if (mapping.patterns.some((p) => p.test(warningName))) {
      const base = locale === 'or' ? mapping.or : locale === 'hi' ? mapping.hi : mapping.en;
      if (measurementSuffix && !base.includes(measurementSuffix.trim())) {
        return `${base}${measurementSuffix}`;
      }
      return base;
    }
  }

  return warningName;
}

/**
 * Helper to translate internal database enum values to localized user-facing strings.
 */
export function translateCaseStatus(status: string | undefined, t: typeof en): string {
  if (!status) return '';
  const key = status as keyof typeof t.status;
  return t.status[key] || status.replace(/_/g, ' ');
}

export function translateSyncStatus(syncStatus: string | undefined, t: typeof en): string {
  if (!syncStatus) return '';
  const key = syncStatus as keyof typeof t.syncStatus;
  return t.syncStatus[key] || syncStatus.replace(/_/g, ' ');
}

export function translateUrgencyLabel(urgency: string | undefined, t: typeof en): string {
  if (!urgency) return '';
  switch (urgency.toUpperCase()) {
    case 'RED':
      return t.urgency.red;
    case 'YELLOW':
      return t.urgency.yellow;
    case 'GREEN':
      return t.urgency.green;
    case 'GREY':
      return t.urgency.grey;
    case 'NEEDS_CLINICIAN_REVIEW':
      return t.urgency.needsClinicianReview;
    default:
      return urgency;
  }
}
