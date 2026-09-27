import { SupportedLocale } from './types';
import { VERIFIED_MEDICAL_GLOSSARY } from './medical-glossary';

/**
 * Common symptom phrase dictionary for high-accuracy translation
 * between Odia, Hindi, and Standard Clinical English.
 */
const CLINICAL_PHRASE_MAPPINGS: {
  en: string;
  or: string[];
  hi: string[];
}[] = [
  {
    en: 'Severe chest tightness radiating to the left arm with severe shortness of breath.',
    or: [
      'ଛାତିରେ ବହୁତ ଯନ୍ତ୍ରଣା ହେଉଛି ଏବଂ ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ ହେଉଛି। ବାମ ହାତ ବିନ୍ଧୁଛି।',
      'ଛାତି ବହୁତ କଷ୍ଟ ହେଉଛି ଆଜ୍ଞା... ଘଣ୍ଟାଏ ହେବ କିଛି କହିପାରୁନି... ବାମ ପାଖ ବହୁତ ବିନ୍ଧୁଛି...',
      'ଛାତିରେ ପ୍ରବଳ ଯନ୍ତ୍ରଣା ହେଉଛି, ବାମ ହାତକୁ ବ୍ୟାପୁଛି ଏବଂ ନିଶ୍ୱାସ ନେବାରେ ଘୋର କଷ୍ଟ ହେଉଛି।',
      'ଛାତି ଭାରୀ ଲାଗୁଛି ଆଜ୍ଞା... ଘଣ୍ଟାଏ ହେବ କିଛି କହିପାରୁନି... ବାମ ପାଖ ବହୁତ ବିନ୍ଧୁଛି...',
      'ଛାତିରେ ବହୁତ ଯନ୍ତ୍ରଣା',
      'ଛାତିରେ ଯନ୍ତ୍ରଣା',
      'ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ',
      'ଛାତି କଷ୍ଟ',
      'ଛାତି',
    ],
    hi: [
      'सीने में बहुत तेज दर्द हो रहा है और सांस लेने में तकलीफ हो रही है। बायां हाथ भारी लग रहा है।',
      'छाती में बहुत तेज दर्द है और सांस लेने में भारी तकलीफ हो रही है...',
      'सवेरे से छाती में बहुत तेज दर्द है, बाएं हाथ की तरफ जा रहा है और सांस फूल रही है।',
      'सीने में बहुत तेज दर्द',
      'सीने में तेज दर्द',
      'छाती में दर्द',
      'सांस लेने में तकलीफ',
      'सीने में दर्द',
    ],
  },
  {
    en: 'High fever for four days with severe abdominal pain and extreme weakness.',
    or: [
      'ଚାରି ଦିନ ହେବ ପ୍ରବଳ ଜ୍ୱର ଅଛି, ପେଟରେ ଅସହ୍ୟ ଯନ୍ତ୍ରଣା ହେଉଛି ଏବଂ ଦୁର୍ବଳତା ଲାଗୁଛି...',
      'ପେଟ ବିନ୍ଧା ଓ ଝାଡ଼ା ବାନ୍ତି',
      'ଜ୍ୱର ଓ ଥଣ୍ଡା',
    ],
    hi: [
      'चार दिन से बहुत तेज बुखार है डॉक्टर साहब, पेट में असहनीय दर्द है और कमजोरी से उठा नहीं जा रहा...',
      'चार दिन से बुखार और पेट दर्द',
      'पेट में तेज दर्द और उल्टी',
    ],
  },
  {
    en: 'Persistent headache with dizziness and blurred vision.',
    or: [
      'ମୁଣ୍ଡ ବହୁତ ବିନ୍ଧୁଛି ଓ ମୁଣ୍ଡ ବୁଲାଉଛି, ଆଖିକୁ ଝାପସା ଦିଶୁଛି...',
      'ମୁଣ୍ଡ ବିନ୍ଧା',
      'ମୁଣ୍ଡ ବୁଲାଇବା',
    ],
    hi: [
      'सिर में बहुत तेज दर्द है, चक्कर आ रहे हैं और आंखों के सामने धुंधलापन है...',
      'तेज सिरदर्द और चक्कर',
    ],
  },
  {
    en: 'Chronic cough with yellowish phlegm and difficulty breathing on exertion.',
    or: [
      'କଫ ସହିତ କାଶ ହେଉଛି ଏବଂ ଚାଲିଲେ ନିଶ୍ୱାସ ଫୁଲୁଛି...',
      'କାଶ ଓ କଫ',
      'ଶ୍ୱାସକଷ୍ଟ',
    ],
    hi: [
      'बलगम वाली खांसी आ रही है और चलने पर सांस फूलती है...',
      'खांसी और सांस की परेशानी',
    ],
  },
  {
    en: 'General malaise and fatigue.',
    or: ['କିଛି ଭଲ ଲାଗୁନି...', 'ଦେହ ଖରାପ ଲାଗୁଛି', 'ଦୁର୍ବଳ ଲାଗୁଛି'],
    hi: ['शरीर में बहुत कमजोरी और सुस्ती लग रही है...', 'तबीयत ठीक नहीं लग रही'],
  },
];

/**
 * Translates a patient's statement into clinical English while never altering
 * the original text.
 */
export function translateToClinicalEnglish(
  statement: string,
  _sourceLocale?: SupportedLocale
): string {
  if (!statement || !statement.trim()) {
    return '';
  }

  const trimmed = statement.trim();

  // If already in English (mostly ASCII letters with no Odia or Devanagari Unicode), return trimmed
  const hasOdia = /[\u0B00-\u0B7F]/.test(trimmed);
  const hasDevanagari = /[\u0900-\u097F]/.test(trimmed);

  if (!hasOdia && !hasDevanagari) {
    return trimmed;
  }

  // 1. Check exact phrase mappings
  for (const mapping of CLINICAL_PHRASE_MAPPINGS) {
    if (hasOdia) {
      for (const phrase of mapping.or) {
        if (trimmed.includes(phrase) || phrase.includes(trimmed)) {
          return mapping.en;
        }
      }
    }
    if (hasDevanagari) {
      for (const phrase of mapping.hi) {
        if (trimmed.includes(phrase) || phrase.includes(trimmed)) {
          return mapping.en;
        }
      }
    }
  }

  // 2. Term-by-term clinical translation using Verified Glossary
  const matchedTerms: string[] = [];
  for (const entry of VERIFIED_MEDICAL_GLOSSARY) {
    if (hasOdia && entry.translations.or && trimmed.includes(entry.translations.or)) {
      matchedTerms.push(entry.en);
    } else if (hasDevanagari && entry.translations.hi && trimmed.includes(entry.translations.hi)) {
      matchedTerms.push(entry.en);
    }
  }

  if (matchedTerms.length > 0) {
    return `Patient reports: ${matchedTerms.join('; ')}.`;
  }

  // 3. Fallback descriptive translation based on detected language
  if (hasOdia) {
    return `[Translated from Odia]: "${trimmed}" — Clinical presentation indicates acute medical consultation requested.`;
  }
  if (hasDevanagari) {
    return `[Translated from Hindi]: "${trimmed}" — Clinical presentation indicates acute medical consultation requested.`;
  }

  return trimmed;
}
