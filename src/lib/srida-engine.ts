/**
 * Srida — Your TriageBridge Guide
 * Core Intelligence & Safety Engine
 * 
 * Safe, rule-governed platform guidance engine for TriageBridge patients.
 * Enforces medical safety boundaries, emergency safety protocols,
 * verified FAQ matching, multilingual native scripts (English, Hindi, Odia),
 * and PII protection (Aadhaar & sensitive data stripping).
 */

import {
  VERIFIED_FAQ_DATABASE,
  VerifiedFaqEntry,
  FaqCategory,
} from './srida-faq-kb';

export type SridaLocale = 'en' | 'hi' | 'or';

export interface SridaActionButton {
  label: string;
  route?: string;
  href?: string;
  variant?: 'primary' | 'emergency' | 'secondary';
  ariaLabel?: string;
}

export interface SridaEngineResult {
  answer: string;
  source: 'VERIFIED_KB' | 'AI_GUIDANCE' | 'MEDICAL_REFUSAL' | 'EMERGENCY_SAFETY' | 'FALLBACK';
  relatedRoute?: string;
  actionButtonLabel?: string;
  secondaryActions?: SridaActionButton[];
  isEmergency: boolean;
  isMedicalRefusal: boolean;
  faqId?: string;
  suggestedFaqs?: Array<{ id: string; question: string; category: FaqCategory }>;
}

export interface RouteGuidanceTip {
  title: string;
  description: string;
  actionLabel?: string;
  actionRoute?: string;
  faqs?: string[];
}

// ========================================================
// 1. SAFETY STRINGS (VERBATIM ACCORDING TO SPECIFICATIONS)
// ========================================================

export const SRIDA_DISCLAIMERS = {
  PERMANENT_NOTICE: {
    en: 'Srida provides platform guidance only—not medical advice.',
    hi: 'स्रीदा केवल प्लेटफ़ॉर्म मार्गदर्शन प्रदान करती है—चिकित्सीय सलाह नहीं।',
    or: 'ସ୍ରିଦା କେବଳ ପ୍ଲାଟଫର୍ମ ମାର୍ଗଦର୍ଶନ ପ୍ରଦାନ କରେ—ଡାକ୍ତରୀ ପରାମର୍ଶ ନୁହେଁ।',
  },
  APP_WIDE_DISCLAIMER: {
    en: 'AI-generated triage support — not a diagnosis. Final decisions must be made by a qualified healthcare professional.',
    hi: 'एआई-जनित ट्राइएज सहायता — कोई निदान नहीं है। अंतिम निर्णय किसी योग्य स्वास्थ्य देखभाल पेशेवर द्वारा ही लिया जाना चाहिए।',
    or: 'AI-ଦ୍ୱାରା ଟ୍ରାଇଏଜ୍ ସହାୟତା — କୌଣସି ରୋଗ ନିର୍ଣ୍ଣୟ ନୁହେଁ। ଚୂଡ଼ାନ୍ତ ନିଷ୍ପତ୍ତି ଜଣେ ଯୋଗ୍ୟ ସ୍ୱାସ୍ଥ୍ୟସେବା ବିଶେଷଜ୍ଞଙ୍କ ଦ୍ୱାରା ନିଆଯିବା ଆବଶ୍ୟକ।',
  },
  SYNTHETIC_DEMO: {
    en: 'Synthetic Hackathon Demo — No Real Patient Data',
    hi: 'सिंथेटिक हैकाथॉन डेमो — कोई वास्तविक मरीज डेटा नहीं',
    or: 'ସିନ୍ଥେଟିକ୍ ହାକାଥନ୍ ଡେମୋ — କୌଣସି ପ୍ରକୃତ ରୋଗୀ ତଥ୍ୟ ନାହିଁ',
  },
  OFFLINE_NOTICE: {
    en: 'Live AI assistance is unavailable. Verified platform guidance is still available.',
    hi: 'लाइव एआई सहायता अनुपलब्ध है। सत्यापित प्लेटफ़ॉर्म मार्गदर्शन अभी भी उपलब्ध है।',
    or: 'ଲାଇଭ୍ AI ସହାୟତା ଉପଲବ୍ଧ ନାହିଁ। ଯାଞ୍ଚ ହୋଇଥିବା ପ୍ଲାଟଫର୍ମ ମାର୍ଗଦର୍ଶନ ଏବେ ମଧ୍ୟ ଉପଲବ୍ଧ ଅଛି।',
  },
};

export const SRIDA_GREETINGS = {
  en: 'Hello! I’m Srida, your TriageBridge guide. I can help you navigate the platform, find appointments, upload documents and understand the triage process. I cannot diagnose medical conditions or prescribe medicines.',
  hi: 'नमस्ते! मैं स्रीदा हूँ, आपकी TriageBridge गाइड। मैं इस प्लेटफ़ॉर्म का उपयोग करने में आपकी सहायता कर सकती हूँ। मैं नियुक्तियाँ खोजने, दस्तावेज़ अपलोड करने और ट्राइएज प्रक्रिया को समझने में मदद कर सकती हूँ। मैं चिकित्सीय स्थितियों का निदान नहीं कर सकती या दवाएं नहीं लिख सकती।',
  or: 'ନମସ୍କାର! ମୁଁ ସ୍ରିଦା, ଆପଣଙ୍କ TriageBridge ଗାଇଡ୍। ମୁଁ ଏହି ପ୍ଲାଟଫର୍ମ ବ୍ୟବହାର କରିବାରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି। ମୁଁ ରୋଗ ନିର୍ଣ୍ଣୟ କରିପାରିବି ନାହିଁ କିମ୍ବା ଔଷଧ ଲେଖିପାରିବି ନାହିଁ।',
};

export const MEDICAL_REFUSAL_RESPONSES = {
  en: {
    text: 'I cannot diagnose medical conditions. Please complete a triage request or consult a qualified healthcare professional.',
    actions: [
      { label: 'Start Triage', route: '/patient/triage', variant: 'primary' as const },
      { label: 'View My Cases', route: '/patient/cases', variant: 'secondary' as const },
    ],
  },
  hi: {
    text: 'मैं चिकित्सीय स्थितियों का निदान नहीं कर सकती। कृपया एक ट्राइएज अनुरोध पूरा करें या किसी योग्य स्वास्थ्य देखभाल पेशेवर से परामर्श लें।',
    actions: [
      { label: 'ट्राइएज शुरू करें', route: '/patient/triage', variant: 'primary' as const },
      { label: 'मेरे मामले देखें', route: '/patient/cases', variant: 'secondary' as const },
    ],
  },
  or: {
    text: 'ମୁଁ ଚିକିତ୍ସା ସମ୍ବନ୍ଧୀୟ ସ୍ଥିତି ନିର୍ଣ୍ଣୟ କରିପାରିବି ନାହିଁ। ଦୟାକରି ଏକ ଟ୍ରାଇଏଜ୍ ଅନୁରୋଧ ପୂରଣ କରନ୍ତୁ କିମ୍ବା ଜଣେ ଯୋଗ୍ୟ ସ୍ୱାସ୍ଥ୍ୟସେବା ବିଶେଷଜ୍ଞଙ୍କ ସହ ପରାମର୍ଶ କରନ୍ତୁ।',
    actions: [
      { label: 'ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରନ୍ତୁ', route: '/patient/triage', variant: 'primary' as const },
      { label: 'ମୋର ମାମଲାଗୁଡ଼ିକ ଦେଖନ୍ତୁ', route: '/patient/cases', variant: 'secondary' as const },
    ],
  },
};

export const EMERGENCY_RESPONSES = {
  en: {
    text: 'If you may be experiencing a medical emergency, do not wait for the chatbot. Call 108 or 112, or visit the nearest emergency department immediately.',
    actions: [
      { label: 'Call 108', href: 'tel:108', variant: 'emergency' as const },
      { label: 'Call 112', href: 'tel:112', variant: 'emergency' as const },
      { label: 'Request Ambulance', route: '/patient/dashboard?ambulance=true', variant: 'primary' as const },
    ],
  },
  hi: {
    text: 'यदि आप किसी चिकित्सीय आपात स्थिति का सामना कर रहे हैं, तो चैटबॉट की प्रतीक्षा न करें। तुरंत 108 या 112 पर कॉल करें, या निकटतम आपातकालीन विभाग में जाएं।',
    actions: [
      { label: '108 पर कॉल करें', href: 'tel:108', variant: 'emergency' as const },
      { label: '112 पर कॉल करें', href: 'tel:112', variant: 'emergency' as const },
      { label: 'एम्बुलेंस का अनुरोध करें', route: '/patient/dashboard?ambulance=true', variant: 'primary' as const },
    ],
  },
  or: {
    text: 'ଯଦି ଆପଣ କୌଣସି ଜରୁରୀକାଳୀନ ଚିକିତ୍ସା ପରିସ୍ଥିତିର ସମ୍ମୁଖୀନ ହେଉଛନ୍ତି, ତେବେ ଚାଟବଟ୍ ପାଇଁ ଅପେକ୍ଷା କରନ୍ତୁ ନାହିଁ। ତୁରନ୍ତ 108 କିମ୍ବା 112 କୁ କଲ୍ କରନ୍ତୁ, କିମ୍ବା ନିକଟତମ ଜରୁରୀକାଳୀନ ବିଭାଗକୁ ଯାଆନ୍ତୁ।',
    actions: [
      { label: '108 କୁ କଲ୍ କରନ୍ତୁ', href: 'tel:108', variant: 'emergency' as const },
      { label: '112 କୁ କଲ୍ କରନ୍ତୁ', href: 'tel:112', variant: 'emergency' as const },
      { label: 'ଆମ୍ବୁଲାନ୍ସ ଅନୁରୋଧ କରନ୍ତୁ', route: '/patient/dashboard?ambulance=true', variant: 'primary' as const },
    ],
  },
};

export const FALLBACK_RESPONSES = {
  en: 'I’m unable to verify that information. Please contact an authorized TriageBridge support representative or healthcare professional.',
  hi: 'मैं उस जानकारी को सत्यापित करने में असमर्थ हूँ। कृपया किसी अधिकृत TriageBridge सहायता प्रतिनिधि या स्वास्थ्य देखभाल पेशेवर से संपर्क करें।',
  or: 'ମୁଁ ସେହି ସୂଚନାକୁ ଯାଞ୍ଚ କରିବାରେ ଅସମର୍ଥ। ଦୟାକରି ଜଣେ ଅନୁମୋଦିତ TriageBridge ସହାୟତା ପ୍ରତିନିଧି କିମ୍ବା ସ୍ୱାସ୍ଥ୍ୟସେବା ବିଶେଷଜ୍ଞଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।',
};

// ========================================================
// 2. PRIVACY & SANITIZATION ENGINE
// ========================================================

/**
 * Strips Aadhaar numbers (12-digit numbers with or without spaces/hyphens),
 * sanitizes HTML/script tags, and removes control characters.
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return '';

  let sanitized = input;

  // Strip script and style blocks entirely including inner content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Strip any remaining html tags
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');

  // Strip potential Aadhaar numbers (4-4-4 digits pattern or 12 continuous digits)
  sanitized = sanitized.replace(/\b[2-9]{1}\d{3}[\s-]??\d{4}[\s-]??\d{4}\b/g, '[REDACTED_AADHAAR]');

  // Strip phone numbers with country code or standard 10 digits to prevent personal leak
  sanitized = sanitized.replace(/(\+91[\-\s]?)?[6-9]\d{9}\b/g, '[REDACTED_PHONE]');

  return sanitized.trim();
}

/**
 * Detects prompt injection attempts aiming to override platform assistant boundaries
 */
export function isPromptInjection(input: string): boolean {
  const normalized = input.toLowerCase();
  const injectionPatterns = [
    'ignore previous instructions',
    'ignore all previous',
    'forget your instructions',
    'you are now a doctor',
    'act as a doctor',
    'roleplay as a physician',
    'diagnose me anyway',
    'pretend to be a physician',
    'jailbreak',
    'system prompt',
    'override safety',
    'disregard safety guidelines',
  ];

  return injectionPatterns.some((pattern) => normalized.includes(pattern));
}

// ========================================================
// 3. EMERGENCY DETECTION PATTERNS
// ========================================================

const EMERGENCY_PATTERNS = [
  // English
  'emergency',
  'chest pain',
  'heart attack',
  'difficulty breathing',
  'breathless',
  'cannot breathe',
  'can not breathe',
  'unconscious',
  'passed out',
  'fainted',
  'bleeding heavily',
  'severe bleeding',
  'heavy bleeding',
  'stroke',
  'head trauma',
  'severe burn',
  'dying',
  'call 108',
  'call 112',
  'ambulance',
  'cardiac arrest',
  'seizure',
  'choking',
  // Hindi
  'आपातकालीन',
  'आपातकाल',
  'छाती में दर्द',
  'सीने में दर्द',
  'सांस लेने में कठिनाई',
  'सांस नहीं आ रही',
  'सांस फूलना',
  'बेहोश',
  'दिल का दौरा',
  'अत्यधिक रक्तस्राव',
  'खून बह रहा',
  'एम्बुलेंस',
  'स्ट्रोक',
  'जल गया',
  '108',
  '112',
  // Odia
  'ଜରୁରୀକାଳୀନ',
  'ଛାତିରେ ଯନ୍ତ୍ରଣା',
  'ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ',
  'ନିଶ୍ୱାସ ବନ୍ଦ',
  'ହୃଦଘାତ',
  'ଅଚେତ',
  'ଅତ୍ୟଧିକ ରକ୍ତସ୍ରାବ',
  'ରକ୍ତ ବୋହିବା',
  'ଆମ୍ବୁଲାନ୍ସ',
  '୧୦୮',
  '୧୧୨',
];

export function isEmergencyQuery(input: string): boolean {
  const normalized = input.toLowerCase();
  return EMERGENCY_PATTERNS.some((pattern) => normalized.includes(pattern.toLowerCase()));
}

// ========================================================
// 4. MEDICAL ADVICE & REFUSAL DETECTION
// ========================================================

const MEDICAL_INQUIRY_PATTERNS = [
  // English
  'what medicine',
  'which medicine',
  'prescribe',
  'prescription',
  'recommend medicine',
  'dosage',
  'dose of',
  'cure for',
  'treatment for',
  'how to treat',
  'diagnose',
  'diagnosis',
  'what disease do i have',
  'do i have',
  'paracetamol',
  'antibiotic',
  'painkiller',
  'tablet',
  'syrup',
  'what should i take for',
  'should i take',
  'medicine for',
  'remedy for',
  'symptoms of infection',
  // Hindi
  'क्या दवा',
  'कौन सी दवा',
  'दवा',
  'दवाई',
  'इलाज',
  'उपचार',
  'खुराक',
  'निदान',
  'रोग का इलाज',
  'क्या बीमारी है',
  'दर्द की दवा',
  'गोली',
  'प्रिस्क्रिप्शन',
  'एंटीबायोटिक',
  'मुझे क्या खाना चाहिए',
  // Odia
  'କେଉଁ ଔଷଧ',
  'କ’ଣ ଔଷଧ',
  'ଔଷଧ',
  'ଚିକିତ୍ସା',
  'ରୋଗ ନିର୍ଣ୍ଣୟ',
  'ମାତ୍ରା',
  'ପ୍ରେସକ୍ରିପସନ୍',
  'ରୋଗର ଉପଶମ',
  'ମୁଁ କ’ଣ ଖାଇବି',
  'ଟାବଲେଟ୍',
];

export function isMedicalInquiry(input: string): boolean {
  const normalized = input.toLowerCase();
  return MEDICAL_INQUIRY_PATTERNS.some((pattern) => normalized.includes(pattern.toLowerCase()));
}

// ========================================================
// 5. VERIFIED FAQ KNOWLEDGE BASE SEARCH
// ========================================================

function normalizeTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function searchVerifiedFaq(
  query: string,
  locale: SridaLocale = 'en'
): { entry: VerifiedFaqEntry; score: number } | null {
  const clean = sanitizeUserInput(query);
  if (!clean || clean.length < 2) return null;

  const queryLower = clean.toLowerCase();
  const queryTokens = normalizeTokens(clean);

  let bestEntry: VerifiedFaqEntry | null = null;
  let bestScore = 0;

  for (const entry of VERIFIED_FAQ_DATABASE) {
    let score = 0;

    const qEn = entry.questionEn.toLowerCase();
    const qHi = entry.questionHi.toLowerCase();
    const qOr = entry.questionOr.toLowerCase();

    // 1. Direct question substring match (Highest priority)
    if (qEn.includes(queryLower) || queryLower.includes(qEn)) {
      score += 100;
    }
    if (qHi.includes(queryLower) || queryLower.includes(qHi)) {
      score += 100;
    }
    if (qOr.includes(queryLower) || queryLower.includes(qOr)) {
      score += 100;
    }

    // 2. Keyword exact matches
    for (const kw of entry.keywords) {
      const kwLower = kw.toLowerCase();
      if (queryLower.includes(kwLower)) {
        score += 25;
      }
    }

    // 3. Token overlap with Question in target locale
    const localizedQuestion =
      locale === 'hi' ? entry.questionHi : locale === 'or' ? entry.questionOr : entry.questionEn;
    const qTokens = normalizeTokens(localizedQuestion);

    let matchCount = 0;
    for (const qt of queryTokens) {
      if (qTokens.includes(qt)) {
        matchCount++;
      }
    }
    if (qTokens.length > 0) {
      score += Math.round((matchCount / Math.max(queryTokens.length, 1)) * 40);
    }

    // 4. Token overlap with English question as cross-language bridge
    if (locale !== 'en') {
      const enTokens = normalizeTokens(entry.questionEn);
      let enMatch = 0;
      for (const qt of queryTokens) {
        if (enTokens.includes(qt)) enMatch++;
      }
      if (enTokens.length > 0) {
        score += Math.round((enMatch / Math.max(queryTokens.length, 1)) * 30);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Threshold: at least 25 points to be considered a confident match
  if (bestEntry && bestScore >= 25) {
    return { entry: bestEntry, score: bestScore };
  }

  return null;
}

// ========================================================
// 6. MAIN ENGINE EXECUTION
// ========================================================

export function processSridaMessage(
  rawQuery: string,
  locale: SridaLocale = 'en'
): SridaEngineResult {
  const query = sanitizeUserInput(rawQuery);

  // 1. Check prompt injection attempt
  if (isPromptInjection(query)) {
    return {
      answer:
        locale === 'hi'
          ? 'मैं एक सुरक्षित TriageBridge सहायक हूँ। मैं केवल स्वीकृत प्लेटफ़ॉर्म मार्गदर्शन प्रदान कर सकती हूँ।'
          : locale === 'or'
          ? 'ମୁଁ ଏକ ସୁରକ୍ଷିତ TriageBridge ସହାୟକ। ମୁଁ କେବଳ ଅନୁମୋଦିତ ପ୍ଲାଟଫର୍ମ ମାର୍ଗଦର୍ଶନ ପ୍ରଦାନ କରିପାରିବି।'
          : 'I am Srida, your safe TriageBridge guide. I only provide verified platform assistance and cannot fulfill system override requests.',
      source: 'FALLBACK',
      isEmergency: false,
      isMedicalRefusal: false,
    };
  }

  // 2. Medical Diagnosis / Prescription Refusal Check (Prioritized for medication inquiries)
  if (isMedicalInquiry(query)) {
    const resp = MEDICAL_REFUSAL_RESPONSES[locale] || MEDICAL_REFUSAL_RESPONSES.en;
    return {
      answer: resp.text,
      source: 'MEDICAL_REFUSAL',
      isEmergency: false,
      isMedicalRefusal: true,
      secondaryActions: resp.actions.map((act) => ({
        label: act.label,
        route: act.route,
        variant: act.variant,
      })),
      relatedRoute: '/patient/triage',
      actionButtonLabel:
        locale === 'hi' ? 'ट्राइएज शुरू करें' : locale === 'or' ? 'ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରନ୍ତୁ' : 'Start Triage',
    };
  }

  // 3. Emergency Check (Emergency protocol for acute distress & ambulance inquiries)
  if (isEmergencyQuery(query)) {
    const resp = EMERGENCY_RESPONSES[locale] || EMERGENCY_RESPONSES.en;
    return {
      answer: resp.text,
      source: 'EMERGENCY_SAFETY',
      isEmergency: true,
      isMedicalRefusal: false,
      secondaryActions: resp.actions.map((act) => ({
        label: act.label,
        route: 'route' in act ? act.route : undefined,
        href: 'href' in act ? act.href : undefined,
        variant: act.variant,
      })),
      relatedRoute: '/patient/dashboard',
      actionButtonLabel:
        locale === 'hi'
          ? 'आपातकालीन सहायता'
          : locale === 'or'
          ? 'ଜରୁରୀକାଳୀନ ସହାୟତା'
          : 'Emergency Assistance',
    };
  }

  // 4. Verified FAQ Knowledge Base Search
  const faqMatch = searchVerifiedFaq(query, locale);
  if (faqMatch) {
    const { entry } = faqMatch;
    const answer =
      locale === 'hi'
        ? entry.verifiedAnswerHi
        : locale === 'or'
        ? entry.verifiedAnswerOr
        : entry.verifiedAnswerEn;

    const actionLabel =
      locale === 'hi'
        ? entry.actionButtonLabelHi
        : locale === 'or'
        ? entry.actionButtonLabelOr
        : entry.actionButtonLabelEn;

    return {
      answer,
      source: 'VERIFIED_KB',
      faqId: entry.id,
      relatedRoute: entry.relatedRoute,
      actionButtonLabel: actionLabel,
      isEmergency: false,
      isMedicalRefusal: false,
    };
  }

  // 5. Fallback Response (Safe human-support boundary)
  return {
    answer: FALLBACK_RESPONSES[locale] || FALLBACK_RESPONSES.en,
    source: 'FALLBACK',
    isEmergency: false,
    isMedicalRefusal: false,
    suggestedFaqs: getSuggestedFaqsForCategory('GETTING_STARTED', locale),
  };
}

// ========================================================
// 7. CONTEXT-AWARE ROUTE GUIDANCE (EXACT SPECIFICATIONS)
// ========================================================

export function getRouteContextGuidance(
  pathname: string,
  locale: SridaLocale = 'en'
): RouteGuidanceTip | null {
  if (!pathname) return null;

  if (pathname.includes('/patient/dashboard')) {
    return {
      title:
        locale === 'hi'
          ? 'रोगी डैशबोर्ड'
          : locale === 'or'
          ? 'ରୋଗୀ ଡ୍ୟାସବୋର୍ଡ'
          : 'Patient Dashboard',
      description:
        locale === 'hi'
          ? 'आपके डैशबोर्ड में आपका स्वागत है। यहाँ से, आप ट्राइएज शुरू कर सकते हैं, मामलों को ट्रैक कर सकते हैं, नियुक्तियाँ देख सकते हैं और स्वास्थ्य दस्तावेज़ों तक पहुँच सकते हैं।'
          : locale === 'or'
          ? 'ଆପଣଙ୍କ ଡ୍ୟାସବୋର୍ଡକୁ ସ୍ୱାଗତ। ଏଠାରୁ, ଆପଣ ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରିପାରିବେ, ମାମଲା ଟ୍ରାକ୍ କରିପାରିବେ, ନିଯୁକ୍ତି ଦେଖିପାରିବେ ଏବଂ ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଦେଖିପାରିବେ।'
          : 'Welcome to your dashboard. From here, you can start triage, track cases, view appointments and access health documents.',
      actionLabel:
        locale === 'hi'
          ? 'ट्राइएज शुरू करें'
          : locale === 'or'
          ? 'ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରନ୍ତୁ'
          : 'Start Triage',
      actionRoute: '/patient/triage',
      faqs: ['faq-access-dashboard', 'faq-check-status', 'faq-view-appointments'],
    };
  }

  if (pathname.includes('/patient/triage')) {
    return {
      title:
        locale === 'hi'
          ? 'ट्राइएज अनुरोध'
          : locale === 'or'
          ? 'ଟ୍ରାଇଏଜ୍ ଅନୁରୋଧ'
          : 'Triage Request',
      description:
        locale === 'hi'
          ? 'यह अनुभाग आपको स्वास्थ्य-कार्यकर्ता की समीक्षा के लिए लक्षण, वॉइस इनपुट, उपलब्ध वाइटल संकेत और चिकित्सा रिपोर्ट प्रस्तुत करने में मदद करता है।'
          : locale === 'or'
          ? 'ଏହି ବିଭାଗ ଆପଣଙ୍କୁ ସ୍ୱାସ୍ଥ୍ୟସେବା କର୍ମଚାରୀଙ୍କ ସମୀକ୍ଷା ପାଇଁ ଲକ୍ଷଣ, ଭଏସ୍ ଇନପୁଟ୍, ଉପଲବ୍ଧ ଭାଇଟାଲ୍ ସୂଚନା ଏବଂ ମେଡିକାଲ୍ ରିପୋର୍ଟ ଦାଖଲ କରିବାରେ ସାହାଯ୍ୟ କରେ।'
          : 'This section helps you submit symptoms, voice input, available vital signs and medical reports for healthcare-worker review.',
      actionLabel:
        locale === 'hi'
          ? 'वॉइस इनपुट कैसे काम करता है?'
          : locale === 'or'
          ? 'ଭଏସ୍ ଇନପୁଟ୍ କିପରି କାମ କରେ?'
          : 'How does Voice Input work?',
      actionRoute: '/patient/triage',
      faqs: ['faq-start-triage', 'faq-voice-input', 'faq-triage-urgency-colors'],
    };
  }

  if (pathname.includes('/patient/cases')) {
    return {
      title:
        locale === 'hi'
          ? 'मेरे मामले'
          : locale === 'or'
          ? 'ମୋର ମାମଲା'
          : 'My Cases',
      description:
        locale === 'hi'
          ? 'यह अनुभाग आपको अपने सबमिट किए गए मामलों और स्वास्थ्य-कार्यकर्ता की प्रतिक्रियाओं को ट्रैक करने की अनुमति देता है।'
          : locale === 'or'
          ? 'ଏହି ବିଭାଗ ଆପଣଙ୍କୁ ଆପଣଙ୍କର ଦାଖଲ ହୋଇଥିବା ମାମଲା ଏବଂ ସ୍ୱାସ୍ଥ୍ୟସେବା କର୍ମଚାରୀଙ୍କ ପ୍ରତିକ୍ରିୟା ଟ୍ରାକ୍ କରିବାକୁ ଅନୁମତି ଦିଏ।'
          : 'This section allows you to track your submitted cases and healthcare-worker responses.',
      actionLabel:
        locale === 'hi'
          ? 'मामले की स्थिति देखें'
          : locale === 'or'
          ? 'ମାମଲା ସ୍ଥିତି ଦେଖନ୍ତୁ'
          : 'View My Cases',
      actionRoute: '/patient/cases',
      faqs: ['faq-check-status', 'faq-triage-urgency-colors', 'faq-contact-clinician'],
    };
  }

  if (pathname.includes('/patient/appointments')) {
    return {
      title:
        locale === 'hi'
          ? 'नियुक्तियाँ'
          : locale === 'or'
          ? 'ନିଯୁକ୍ତି'
          : 'Appointments',
      description:
        locale === 'hi'
          ? 'इस अनुभाग में आपकी आगामी नियुक्तियाँ, यात्रा की जानकारी और अपॉइंटमेंट पत्र शामिल हैं।'
          : locale === 'or'
          ? 'ଏହି ବିଭାଗରେ ଆପଣଙ୍କର ଆଗାମୀ ନିଯୁକ୍ତି, ପରିଦର୍ଶନ ସୂଚନା ଏବଂ ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି ରହିଛି।'
          : 'This section contains your upcoming appointments, visit information and appointment letters.',
      actionLabel:
        locale === 'hi'
          ? 'अपॉइंटमेंट पत्र देखें'
          : locale === 'or'
          ? 'ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି ଦେଖନ୍ତୁ'
          : 'View Appointment Letters',
      actionRoute: '/patient/appointments',
      faqs: ['faq-find-letters', 'faq-view-upcoming-appointments', 'faq-download-letter'],
    };
  }

  if (pathname.includes('/patient/documents')) {
    return {
      title:
        locale === 'hi'
          ? 'स्वास्थ्य दस्तावेज़'
          : locale === 'or'
          ? 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ'
          : 'Health Documents',
      description:
        locale === 'hi'
          ? 'यह अनुभाग आपको स्वास्थ्य दस्तावेज़ अपलोड करने, देखने और सुरक्षित रूप से साझा करने की अनुमति देता है।'
          : locale === 'or'
          ? 'ଏହି ବିଭାଗ ଆପଣଙ୍କୁ ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଅପଲୋଡ୍ କରିବାକୁ, ଦେଖିବାକୁ ଏବଂ ସୁରକ୍ଷିତ ଭାବରେ ସେୟାର୍ କରିବାକୁ ଅନୁମତି ଦିଏ।'
          : 'This section allows you to upload, view and securely share health documents.',
      actionLabel:
        locale === 'hi'
          ? 'दस्तावेज़ अपलोड करें'
          : locale === 'or'
          ? 'ଡକ୍ୟୁମେଣ୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ'
          : 'Upload Document',
      actionRoute: '/patient/documents',
      faqs: ['faq-upload-report', 'faq-find-documents', 'faq-ocr-extraction', 'faq-share-document'],
    };
  }

  if (pathname.includes('/patient/profile') || pathname.includes('/patient/privacy')) {
    return {
      title:
        locale === 'hi'
          ? 'प्रोफ़ाइल एवं सेटिंग्स'
          : locale === 'or'
          ? 'ପ୍ରୋଫାଇଲ୍ ଏବଂ ସେଟିଂସ୍'
          : 'Profile & Settings',
      description:
        locale === 'hi'
          ? 'यह अनुभाग आपको अपनी प्रोफ़ाइल, पसंदीदा भाषा और गोपनीयता सेटिंग्स प्रबंधित करने की अनुमति देता है।'
          : locale === 'or'
          ? 'ଏହି ବିଭାଗ ଆପଣଙ୍କୁ ନିଜର ପ୍ରୋଫାଇଲ୍, ପସନ୍ଦର ଭାଷା ଏବଂ ଗୋପନୀୟତା ସେଟିଂସ୍ ପରିଚାଳନା କରିବାକୁ ଅନୁମତି ଦିଏ।'
          : 'This section allows you to manage your profile, preferred language and privacy settings.',
      actionLabel:
        locale === 'hi'
          ? 'भाषा बदलें'
          : locale === 'or'
          ? 'ଭାଷା ବଦଳାନ୍ତୁ'
          : 'Change Language',
      actionRoute: '/patient/profile',
      faqs: ['faq-update-profile', 'faq-change-language', 'faq-security-privacy', 'faq-who-can-view-docs'],
    };
  }

  return null;
}

// ========================================================
// 8. FIRST-TIME ONBOARDING BUBBLE TEXT
// ========================================================

export const ONBOARDING_WELCOME_BUBBLE = {
  en: 'Hi! I’m Srida, your TriageBridge guide. I can help you understand and use this platform. Tap here whenever you need help.',
  hi: 'नमस्ते! मैं स्रीदा हूँ, आपकी TriageBridge गाइड। मैं इस प्लेटफ़ॉर्म को समझने और उपयोग करने में आपकी सहायता कर सकती हूँ। जब भी आपको मदद चाहिए, यहाँ टैप करें।',
  or: 'ନମସ୍କାର! ମୁଁ ସ୍ରିଦା, ଆପଣଙ୍କ TriageBridge ଗାଇଡ୍। ମୁଁ ଏହି ପ୍ଲାଟଫର୍ମ ବୁଝିବାରେ ଏବଂ ବ୍ୟବହାର କରିବାରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି। ଯେତେବେଳେ ବି ସହାୟତା ଦରକାର, ଏଠାରେ ଟ୍ୟାପ୍ କରନ୍ତୁ।',
};

// ========================================================
// 9. GUIDED NAVIGATION ITEMS
// ========================================================

export interface GuidedNavItem {
  id: string;
  labelEn: string;
  labelHi: string;
  labelOr: string;
  route: string;
}

export const GUIDED_NAVIGATION_ACTIONS: GuidedNavItem[] = [
  { id: 'nav-dashboard', labelEn: 'Open Dashboard', labelHi: 'डैशबोर्ड खोलें', labelOr: 'ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ', route: '/patient/dashboard' },
  { id: 'nav-triage', labelEn: 'Start Triage', labelHi: 'ट्राइएज शुरू करें', labelOr: 'ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରନ୍ତୁ', route: '/patient/triage' },
  { id: 'nav-cases', labelEn: 'View My Cases', labelHi: 'मेरे मामले देखें', labelOr: 'ମୋର ମାମଲା ଦେଖନ୍ତୁ', route: '/patient/cases' },
  { id: 'nav-appointments', labelEn: 'View Appointments', labelHi: 'नियुक्तियाँ देखें', labelOr: 'ନିଯୁକ୍ତି ଦେଖନ୍ତୁ', route: '/patient/appointments' },
  { id: 'nav-letters', labelEn: 'View Appointment Letters', labelHi: 'अपॉइंटमेंट पत्र देखें', labelOr: 'ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି ଦେଖନ୍ତୁ', route: '/patient/appointments' },
  { id: 'nav-documents', labelEn: 'Open Health Documents', labelHi: 'स्वास्थ्य दस्तावेज़ खोलें', labelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଖୋଲନ୍ତୁ', route: '/patient/documents' },
  { id: 'nav-upload', labelEn: 'Upload a Report', labelHi: 'रिपोर्ट अपलोड करें', labelOr: 'ରିପୋର୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ', route: '/patient/documents' },
  { id: 'nav-profile', labelEn: 'Open Profile', labelHi: 'प्रोफ़ाइल खोलें', labelOr: 'ପ୍ରୋଫାଇଲ୍ ଖୋଲନ୍ତୁ', route: '/patient/profile' },
];

// ========================================================
// 10. GUIDED APP TOUR STEPS (9 EXACT STEPS)
// ========================================================

export interface TourStep {
  step: number;
  titleEn: string;
  titleHi: string;
  titleOr: string;
  contentEn: string;
  contentHi: string;
  contentOr: string;
  targetRoute?: string;
  actionLabelEn?: string;
  actionLabelHi?: string;
  actionLabelOr?: string;
}

export const APP_TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    titleEn: '1. Patient Dashboard',
    titleHi: '1. रोगी डैशबोर्ड',
    titleOr: '1. ରୋଗୀ ଡ୍ୟାସବୋର୍ଡ',
    contentEn: 'Welcome to your dashboard. From here, you can start triage, track cases, view appointments and access health documents.',
    contentHi: 'आपके डैशबोर्ड में आपका स्वागत है। यहाँ से, आप ट्राइएज शुरू कर सकते हैं, मामलों को ट्रैक कर सकते हैं, नियुक्तियाँ देख सकते हैं और स्वास्थ्य दस्तावेज़ों तक पहुँच सकते हैं।',
    contentOr: 'ଆପଣଙ୍କ ଡ୍ୟାସବୋର୍ଡକୁ ସ୍ୱାଗତ। ଏଠାରୁ, ଆପଣ ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରିପାରିବେ, ମାମଲା ଟ୍ରାକ୍ କରିପାରିବେ, ନିଯୁକ୍ତି ଦେଖିପାରିବେ ଏବଂ ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଦେଖିପାରିବେ।',
    targetRoute: '/patient/dashboard',
    actionLabelEn: 'Open Dashboard',
    actionLabelHi: 'डैशबोर्ड खोलें',
    actionLabelOr: 'ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ',
  },
  {
    step: 2,
    titleEn: '2. Start Triage',
    titleHi: '2. ट्राइएज शुरू करें',
    titleOr: '2. ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରନ୍ତୁ',
    contentEn: 'This section helps you submit symptoms, voice input, available vital signs and medical reports for healthcare-worker review.',
    contentHi: 'यह अनुभाग आपको स्वास्थ्य-कार्यकर्ता की समीक्षा के लिए लक्षण, वॉइस इनपुट, उपलब्ध वाइटल संकेत और चिकित्सा रिपोर्ट प्रस्तुत करने में मदद करता है।',
    contentOr: 'ଏହି ବିଭାଗ ଆପଣଙ୍କୁ ସ୍ୱାସ୍ଥ୍ୟସେବା କର୍ମଚାରୀଙ୍କ ସମୀକ୍ଷା ପାଇଁ ଲକ୍ଷଣ, ଭଏସ୍ ଇନପୁଟ୍, ଉପଲବ୍ଧ ଭାଇଟାଲ୍ ସୂଚନା ଏବଂ ମେଡିକାଲ୍ ରିପୋର୍ଟ ଦାଖଲ କରିବାରେ ସାହାଯ୍ୟ କରେ।',
    targetRoute: '/patient/triage',
    actionLabelEn: 'Start Triage',
    actionLabelHi: 'ट्राइएज शुरू करें',
    actionLabelOr: 'ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରନ୍ତୁ',
  },
  {
    step: 3,
    titleEn: '3. Track My Cases',
    titleHi: '3. मेरे मामले',
    titleOr: '3. ମୋର ମାମଲା',
    contentEn: 'This section allows you to track your submitted cases and healthcare-worker responses.',
    contentHi: 'यह अनुभाग आपको अपने सबमिट किए गए मामलों और स्वास्थ्य-कार्यकर्ता की प्रतिक्रियाओं को ट्रैक करने की अनुमति देता है।',
    contentOr: 'ଏହି ବିଭାଗ ଆପଣଙ୍କୁ ଆପଣଙ୍କର ଦାଖଲ ହୋଇଥିବା ମାମଲା ଏବଂ ସ୍ୱାସ୍ଥ୍ୟସେବା କର୍ମଚାରୀଙ୍କ ପ୍ରତିକ୍ରିୟା ଟ୍ରାକ୍ କରିବାକୁ ଅନୁମତି ଦିଏ।',
    targetRoute: '/patient/cases',
    actionLabelEn: 'View My Cases',
    actionLabelHi: 'मेरे मामले देखें',
    actionLabelOr: 'ମୋର ମାମଲା ଦେଖନ୍ତୁ',
  },
  {
    step: 4,
    titleEn: '4. Appointments & Letters',
    titleHi: '4. नियुक्तियाँ और पत्र',
    titleOr: '4. ନିଯୁକ୍ତି ଏବଂ ଚିଠି',
    contentEn: 'This section contains your upcoming appointments, visit information and appointment letters.',
    contentHi: 'इस अनुभाग में आपकी आगामी नियुक्तियाँ, यात्रा की जानकारी और अपॉइंटमेंट पत्र शामिल हैं।',
    contentOr: 'ଏହି ବିଭାଗରେ ଆପଣଙ୍କର ଆଗାମୀ ନିଯୁକ୍ତି, ପରିଦର୍ଶନ ସୂଚନା ଏବଂ ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି ରହିଛି।',
    targetRoute: '/patient/appointments',
    actionLabelEn: 'View Appointments',
    actionLabelHi: 'नियुक्तियाँ देखें',
    actionLabelOr: 'ନିଯୁକ୍ତି ଦେଖନ୍ତୁ',
  },
  {
    step: 5,
    titleEn: '5. Health Documents',
    titleHi: '5. स्वास्थ्य दस्तावेज़',
    titleOr: '5. ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ',
    contentEn: 'This section allows you to upload, view and securely share health documents.',
    contentHi: 'यह अनुभाग आपको स्वास्थ्य दस्तावेज़ अपलोड करने, देखने और सुरक्षित रूप से साझा करने की अनुमति देता है।',
    contentOr: 'ଏହି ବିଭାଗ ଆପଣଙ୍କୁ ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଅପଲୋଡ୍ କରିବାକୁ, ଦେଖିବାକୁ ଏବଂ ସୁରକ୍ଷିତ ଭାବରେ ସେୟାର୍ କରିବାକୁ ଅନୁମତି ଦିଏ।',
    targetRoute: '/patient/documents',
    actionLabelEn: 'Open Health Documents',
    actionLabelHi: 'स्वास्थ्य दस्तावेज़ खोलें',
    actionLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଖୋଲନ୍ତୁ',
  },
  {
    step: 6,
    titleEn: '6. Language Selector',
    titleHi: '6. भाषा चयनकर्ता',
    titleOr: '6. ଭାଷା ଚୟନକାରୀ',
    contentEn: 'This section allows you to manage your profile, preferred language and privacy settings. Support is fully native in English, हिन्दी, and ଓଡ଼ିଆ.',
    contentHi: 'यह अनुभाग आपको अपनी प्रोफ़ाइल, पसंदीदा भाषा और गोपनीयता सेटिंग्स प्रबंधित करने की अनुमति देता है। अंग्रेज़ी, हिन्दी और ଓଡ଼ିଆ में पूर्ण सहायता उपलब्ध है।',
    contentOr: 'ଏହି ବିଭାଗ ଆପଣଙ୍କୁ ନିଜର ପ୍ରୋଫାଇଲ୍, ପସନ୍ଦର ଭାଷା ଏବଂ ଗୋପନୀୟତା ସେଟିଂସ୍ ପରିଚାଳନା କରିବାକୁ ଅନୁମତି ଦିଏ। ଇଂରାଜୀ, ହିନ୍ଦୀ ଏବଂ ଓଡ଼ିଆ ସମର୍ଥିତ।',
    targetRoute: '/patient/profile',
    actionLabelEn: 'Open Profile',
    actionLabelHi: 'प्रोफ़ाइल खोलें',
    actionLabelOr: 'ପ୍ରୋଫାଇଲ୍ ଖୋଲନ୍ତୁ',
  },
  {
    step: 7,
    titleEn: '7. Offline Synchronization',
    titleHi: '7. ऑफ़लाइन सिंक्रनाइज़ेशन',
    titleOr: '7. ଅଫଲାଇନ୍ ସିଙ୍କ୍ରୋନାଇଜେସନ୍',
    contentEn: 'You can use TriageBridge offline without internet. Your cases and records save locally and automatically sync once you reconnect.',
    contentHi: 'आप इंटरनेट के बिना TriageBridge का ऑफ़लाइन उपयोग कर सकते हैं। आपके मामले और रिकॉर्ड स्थानीय रूप से सहेजे जाते हैं और आपके पुन: कनेक्ट होने पर स्वचालित रूप से सिंक होते हैं।',
    contentOr: 'ଆପଣ ଇଣ୍ଟରନେଟ୍ ବିନା TriageBridge ଅଫଲାଇନ୍ ବ୍ୟବହାର କରିପାରିବେ। ଆପଣଙ୍କ ତଥ୍ୟ ସ୍ଥାନୀୟ ଭାବରେ ସାଇତା ଯାଏ ଏବଂ ଇଣ୍ଟରନେଟ୍ ଆସିବା ମାତ୍ରେ ସ୍ୱୟଂଚାଳିତ ଭାବରେ ସିଙ୍କ୍ ହୁଏ।',
    targetRoute: '/patient/dashboard',
    actionLabelEn: 'Explore Offline Mode',
    actionLabelHi: 'ऑफ़लाइन मोड देखें',
    actionLabelOr: 'ଅଫଲାଇନ୍ ମୋଡ୍ ଦେଖନ୍ତୁ',
  },
  {
    step: 8,
    titleEn: '8. Emergency Assistance',
    titleHi: '8. आपातकालीन सहायता',
    titleOr: '8. ଜରୁରୀକାଳୀନ ସହାୟତା',
    contentEn: 'If you experience a medical emergency, do not wait for the platform. Immediately dial 108 or 112, or call an ambulance.',
    contentHi: 'यदि आप किसी चिकित्सीय आपात स्थिति का सामना कर रहे हैं, तो प्लेटफ़ॉर्म की प्रतीक्षा न करें। तुरंत 108 या 112 डायल करें, या एम्बुलेंस को कॉल करें।',
    contentOr: 'ଯଦି ଆପଣ କୌଣସି ଜରୁରୀକାଳୀନ ଚିକିତ୍ସା ପରିସ୍ଥିତିର ସମ୍ମୁଖୀନ ହେଉଛନ୍ତି, ତେବେ ପ୍ଲାଟଫର୍ମ ପାଇଁ ଅପେକ୍ଷା କରନ୍ତୁ ନାହିଁ। ତୁରନ୍ତ 108 କିମ୍ବା 112 ଡାଏଲ୍ କରନ୍ତୁ।',
    targetRoute: '/patient/dashboard',
    actionLabelEn: 'Emergency Protocol',
    actionLabelHi: 'आपातकालीन प्रोटोकॉल',
    actionLabelOr: 'ଜରୁରୀକାଳୀନ ପ୍ରୋଟୋକଲ୍',
  },
  {
    step: 9,
    titleEn: '9. Srida Guide',
    titleHi: '9. स्रीदा गाइड',
    titleOr: '9. ସ୍ରିଦା ଗାଇଡ୍',
    contentEn: 'You can ask Srida for help at any time.',
    contentHi: 'आप किसी भी समय मदद के लिए स्रीदा से पूछ सकते हैं।',
    contentOr: 'ଆପଣ ଯେକୌଣସି ସମୟରେ ସହାୟତା ପାଇଁ ସ୍ରିଦାଙ୍କୁ ପଚାରିପାରିବେ।',
    targetRoute: '/patient/dashboard',
  },
];

// ========================================================
// 11. HELPERS & CATEGORY SUGGESTIONS
// ========================================================

export function getFaqsByCategory(category: FaqCategory): VerifiedFaqEntry[] {
  return VERIFIED_FAQ_DATABASE.filter((item) => item.category === category);
}

export function getSuggestedFaqsForCategory(
  category: FaqCategory,
  locale: SridaLocale = 'en'
): Array<{ id: string; question: string; category: FaqCategory }> {
  return VERIFIED_FAQ_DATABASE.filter((item) => item.category === category)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      category: item.category,
      question:
        locale === 'hi'
          ? item.questionHi
          : locale === 'or'
          ? item.questionOr
          : item.questionEn,
    }));
}

export function getFaqById(id: string): VerifiedFaqEntry | undefined {
  return VERIFIED_FAQ_DATABASE.find((item) => item.id === id);
}
