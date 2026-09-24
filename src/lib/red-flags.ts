import { RedFlagAlert, VitalSigns, UrgencyCategory } from './types';

interface RedFlagRule {
  id: string;
  name: string;
  severity: 'CRITICAL' | 'WARNING';
  keywords: string[];
  descriptionEn: string;
  descriptionHi: string;
  descriptionOr: string;
}

const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'CHEST_PAIN',
    name: 'Acute Chest Pain / Cardiac Compromise',
    severity: 'CRITICAL',
    keywords: [
      'chest pain', 'chest tightness', 'heart attack', 'radiating to left arm', 'jaw pain',
      'छाती में दर्द', 'सीने में दर्द', 'दिल का दौरा', 'छाती भारी',
      'ଛାତି ଯନ୍ତ୍ରଣା', 'ଛାତି ଭାରୀ', 'ବାମ ହାତ ବିନ୍ଧିବା', 'ହାର୍ଟ ଆଟାକ୍'
    ],
    descriptionEn: 'Acute chest discomfort with potential ischemic or cardiac risk.',
    descriptionHi: 'सीने में तीव्र असुविधा या संभावित हृदय संबंधी जोखिम।',
    descriptionOr: 'ଛାତିରେ ଗୁରୁତର କଷ୍ଟ କିମ୍ବା ହୃଦରୋଗ ଜନିତ ବିପଦର ସମ୍ଭାବନା।',
  },
  {
    id: 'RESPIRATORY_DISTRESS',
    name: 'Severe Breathing Difficulty / Hypoxia',
    severity: 'CRITICAL',
    keywords: [
      'cannot breathe', 'difficulty breathing', 'shortness of breath', 'gasping', 'choking', 'wheezing severe',
      'सांस लेने में तकलीफ', 'सांस फूलना', 'दम घुटना',
      'ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ', 'ଦମ୍ ଫୁଲିବା', 'ଶ୍ୱାସକଷ୍ଟ'
    ],
    descriptionEn: 'Severe respiratory compromise requiring immediate supplemental oxygen assessment.',
    descriptionHi: 'गंभीर श्वसन संकट जिसके लिए तत्काल ऑक्सीजन मूल्यांकन की आवश्यकता है।',
    descriptionOr: 'ଗୁରୁତର ଶ୍ୱାସକଷ୍ଟ, ଯାହା ପାଇଁ ତୁରନ୍ତ ଅକ୍ସିଜେନ୍ ଆବଶ୍ୟକ।',
  },
  {
    id: 'ALTERED_CONSCIOUSNESS',
    name: 'Altered Mental Status / Loss of Consciousness',
    severity: 'CRITICAL',
    keywords: [
      'unconscious', 'fainted', 'passed out', 'collapsed', 'unresponsive', 'coma',
      'बेहोश', 'मूर्छित', 'अचेत', 'बेसुध',
      'ବେହୋସ୍', 'ମୂର୍ଚ୍ଛା', 'ଚେତାଶୂନ୍ୟ', 'ଅଚେତ'
    ],
    descriptionEn: 'Impaired consciousness or sudden collapse requiring airway protection.',
    descriptionHi: 'चेतना का ह्रास या अचानक गिर पड़ना, जिसके लिए तत्काल वायुमार्ग सुरक्षा आवश्यक है।',
    descriptionOr: 'ଚେତା ହରାଇବା କିମ୍ବା ଅଚେତ ହୋଇପଡ଼ିବା, ତୁରନ୍ତ ଡାକ୍ତରୀ ସହାୟତା ଆବଶ୍ୟକ।',
  },
  {
    id: 'SEVERE_HEMORRHAGE',
    name: 'Active Uncontrolled Bleeding',
    severity: 'CRITICAL',
    keywords: [
      'heavy bleeding', 'uncontrolled bleeding', 'coughing blood', 'vomiting blood', 'hemorrhage',
      'भारी रक्तस्राव', 'खून की उल्टी', 'खून बह रहा है',
      'ପ୍ରବଳ ରକ୍ତସ୍ରାବ', 'ରକ୍ତ ବାନ୍ତି', 'ରକ୍ତ ବୋହିବା'
    ],
    descriptionEn: 'Massive or uncontrolled hemorrhage carrying acute hypovolemic shock risk.',
    descriptionHi: 'अत्यधिक रक्तस्राव जिससे हाइपोवोलेमिक शॉक का खतरा हो सकता है।',
    descriptionOr: 'ଅତ୍ୟଧିକ ରକ୍ତସ୍ରାବ ଯାହାଦ୍ୱାରା ଶକ୍ ହେବାର ଆଶଙ୍କା ରହିଛି।',
  },
  {
    id: 'STROKE_SIGNS',
    name: 'Sudden Focal Neurological Deficit / Stroke',
    severity: 'CRITICAL',
    keywords: [
      'slurred speech', 'facial droop', 'one side paralyzed', 'weakness arm leg', 'stroke',
      'चेहरे का टेढ़ापन', 'एक तरफ कमजोरी', 'बोली लड़खड़ाना', 'लकवा',
      'ମୁହଁ ବଙ୍କା ହେବା', 'ଗୋଟିଏ ପାଖ ଦୁର୍ବଳ', 'କଥା କହିନପାରିବା', 'ପକ୍ଷାଘାତ'
    ],
    descriptionEn: 'Acute neurological signs indicative of cerebral ischemia or stroke.',
    descriptionHi: 'तीव्र न्यूरोलॉजिकल लक्षण जो स्ट्रोक का संकेत हो सकते हैं।',
    descriptionOr: 'ହଠାତ୍ ପକ୍ଷାଘାତ ବା ଷ୍ଟ୍ରୋକ୍ ର ଗୁରୁତର ଲକ୍ଷଣ।',
  },
  {
    id: 'SEIZURE',
    name: 'Active or Recent Seizure / Convulsion',
    severity: 'CRITICAL',
    keywords: [
      'seizure', 'convulsion', 'fits', 'shaking violently',
      'दौरे', 'मिरगी', 'झटके आना',
      'ବାତ', 'ମୃଗୀ ରୋଗ', 'ଶରୀର ଥରିବା'
    ],
    descriptionEn: 'Convulsive episode requiring immediate neurological stabilization.',
    descriptionHi: 'दौरे या ऐंठन की स्थिति जिसके लिए तत्काल स्थिरीकरण आवश्यक है।',
    descriptionOr: 'ବାତ ବା ଝଟକା ଆସିବା, ତୁରନ୍ତ ଡାକ୍ତରୀ ସ୍ଥିରୀକରଣ ଆବଶ୍ୟକ।',
  },
  {
    id: 'ANAPHYLAXIS',
    name: 'Severe Allergic Reaction / Anaphylaxis',
    severity: 'CRITICAL',
    keywords: [
      'severe allergy', 'swollen tongue', 'swollen lips', 'throat closing', 'anaphylaxis',
      'गंभीर एलर्जी', 'जीभ सूज गई', 'गला घुट रहा है',
      'ଗୁରୁତର ଆଲର୍ଜି', 'ଜିଭ ଫୁଲିବା', 'ତଣ୍ଟି ବନ୍ଦ ହେବା'
    ],
    descriptionEn: 'Systemic allergic manifestation with airway edema and cardiovascular collapse risk.',
    descriptionHi: 'वायुमार्ग सूजन और कार्डियोवैस्कुलर पतन के जोखिम के साथ गंभीर एलर्जी।',
    descriptionOr: 'ଗୁରୁତର ଆଲର୍ଜି ପ୍ରତିକ୍ରିୟା ଯାହା ନିଶ୍ୱାସ ବନ୍ଦ କରିପାରେ।',
  },
  {
    id: 'SELF_HARM',
    name: 'Suicidal Intent / Self-Harm Crisis',
    severity: 'CRITICAL',
    keywords: [
      'suicide', 'kill myself', 'end my life', 'harm myself', 'poison',
      'आत्महत्या', 'जान देना', 'जहर',
      'ଆତ୍ମହତ୍ୟା', 'ଜୀବନ ହାରିବା', 'ବିଷ ଖାଇବା'
    ],
    descriptionEn: 'Critical mental health safety alert requiring protective clinical intervention.',
    descriptionHi: 'सुरक्षा चेतावनी जिसके लिए तत्काल आपातकालीन हस्तक्षेप आवश्यक है।',
    descriptionOr: 'ଜରୁରୀକାଳୀନ ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ ସୁରକ୍ଷା ସତର୍କତା।',
  },
];

export function screenRedFlags(
  text: string,
  vitals?: VitalSigns
): { redFlags: RedFlagAlert[]; provisionalUrgency: UrgencyCategory; rationaleEn: string; rationaleHi: string; rationaleOr: string } {
  const detectedFlags: RedFlagAlert[] = [];
  const normalizedText = (text || '').toLowerCase();

  // 1. Text Keyword Screening
  for (const rule of RED_FLAG_RULES) {
    for (const kw of rule.keywords) {
      if (normalizedText.includes(kw.toLowerCase())) {
        detectedFlags.push({
          id: rule.id,
          name: rule.name,
          severity: rule.severity,
          descriptionEn: rule.descriptionEn,
          descriptionHi: rule.descriptionHi,
          descriptionOr: rule.descriptionOr,
          matchedTrigger: kw,
        });
        break; // Match rule once
      }
    }
  }

  // 2. Deterministic Vital Signs Screening
  if (vitals) {
    if (vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation < 90) {
      detectedFlags.push({
        id: 'CRITICAL_HYPOXIA',
        name: 'Critical Hypoxia (SpO2 < 90%)',
        severity: 'CRITICAL',
        descriptionEn: `Oxygen saturation dangerously low at ${vitals.oxygenSaturation}%. Immediate oxygen therapy required.`,
        descriptionHi: `ऑक्सीजन स्तर अत्यधिक कम (${vitals.oxygenSaturation}%) है। तत्काल ऑक्सीजन सहायता आवश्यक है।`,
        descriptionOr: `ଅକ୍ସିଜେନ୍ ସ୍ତର ବିପଜ୍ଜନକ ଭାବେ କମ୍ (${vitals.oxygenSaturation}%) ରହିଛି। ତୁରନ୍ତ ଅକ୍ସିଜେନ୍ ଆବଶ୍ୟକ।`,
        matchedTrigger: `SpO2 ${vitals.oxygenSaturation}%`,
      });
    }

    if (vitals.systolicBp !== undefined) {
      if (vitals.systolicBp >= 180) {
        detectedFlags.push({
          id: 'HYPERTENSIVE_CRISIS',
          name: 'Hypertensive Urgency / Crisis (Systolic >= 180)',
          severity: 'CRITICAL',
          descriptionEn: `Severely elevated systolic blood pressure (${vitals.systolicBp} mmHg) carries end-organ risk.`,
          descriptionHi: `अत्यधिक उच्च रक्तचाप (${vitals.systolicBp} mmHg) जिससे अंगों को नुकसान का खतरा है।`,
          descriptionOr: `ଅତ୍ୟଧିକ ଉଚ୍ଚ ରକ୍ତଚାପ (${vitals.systolicBp} mmHg) ଜରୁରୀ ଯାଞ୍ଚ ଆବଶ୍ୟକ କରେ।`,
          matchedTrigger: `Systolic BP ${vitals.systolicBp} mmHg`,
        });
      } else if (vitals.systolicBp <= 80) {
        detectedFlags.push({
          id: 'CRITICAL_HYPOTENSION',
          name: 'Severe Hypotension / Impending Shock (Systolic <= 80)',
          severity: 'CRITICAL',
          descriptionEn: `Severe low blood pressure (${vitals.systolicBp} mmHg) indicates possible circulatory collapse.`,
          descriptionHi: `अत्यधिक निम्न रक्तचाप (${vitals.systolicBp} mmHg) संचार पतन (शॉक) का संकेत दे सकता है।`,
          descriptionOr: `ଅତ୍ୟଧିକ କମ୍ ରକ୍ତଚାପ (${vitals.systolicBp} mmHg) ଶକ୍ ର ସଙ୍କେତ ଦେଉଛି।`,
          matchedTrigger: `Systolic BP ${vitals.systolicBp} mmHg`,
        });
      }
    }

    if (vitals.heartRate !== undefined) {
      if (vitals.heartRate >= 130) {
        detectedFlags.push({
          id: 'SEVERE_TACHYCARDIA',
          name: 'Severe Tachycardia (HR >= 130 bpm)',
          severity: 'WARNING',
          descriptionEn: `Marked tachycardia (${vitals.heartRate} bpm) requires prompt evaluation.`,
          descriptionHi: `अत्यधिक तेज हृदय गति (${vitals.heartRate} bpm) की तत्काल जांच आवश्यक है।`,
          descriptionOr: `ଅତ୍ୟଧିକ ନାଡ଼ି ଗତି (${vitals.heartRate} bpm) ତୁରନ୍ତ ସମୀକ୍ଷା ଆବଶ୍ୟକ କରେ।`,
          matchedTrigger: `HR ${vitals.heartRate} bpm`,
        });
      } else if (vitals.heartRate <= 40) {
        detectedFlags.push({
          id: 'SEVERE_BRADYCARDIA',
          name: 'Severe Bradycardia (HR <= 40 bpm)',
          severity: 'CRITICAL',
          descriptionEn: `Dangerously low heart rate (${vitals.heartRate} bpm) risks syncope or arrest.`,
          descriptionHi: `अत्यधिक धीमी हृदय गति (${vitals.heartRate} bpm) बेहोशी या अरेस्ट का कारण बन सकती है।`,
          descriptionOr: `ବିପଜ୍ଜନକ କମ୍ ନାଡ଼ି ଗତି (${vitals.heartRate} bpm)।`,
          matchedTrigger: `HR ${vitals.heartRate} bpm`,
        });
      }
    }
  }

  // 3. Determine Urgency Category
  let provisionalUrgency: UrgencyCategory = 'GREEN';
  let rationaleEn = 'Stable symptoms reported without red-flag physiological compromises.';
  let rationaleHi = 'स्थिर लक्षण दर्ज किए गए हैं, कोई आपातकालीन संकेत नहीं मिले हैं।';
  let rationaleOr = 'ସ୍ଥିର ଲକ୍ଷଣ ଦାଖଲ ହୋଇଛି, କୌଣସି ଜରୁରୀକାଳୀନ ବିପଦ ଚିହ୍ନଟ ହୋଇନାହିଁ।';

  const criticalCount = detectedFlags.filter(f => f.severity === 'CRITICAL').length;
  const warningCount = detectedFlags.filter(f => f.severity === 'WARNING').length;

  if (criticalCount > 0) {
    provisionalUrgency = 'RED';
    rationaleEn = `Immediate clinical intervention flagged due to ${criticalCount} life-threatening red-flag indicators.`;
    rationaleHi = `${criticalCount} जीवन-घातक रेड-फ्लैग संकेतों के कारण तत्काल डॉक्टर समीक्षा अनिवार्य है।`;
    rationaleOr = `${criticalCount} ଗୁରୁତର ବିପଦ ସଙ୍କେତ ଯୋଗୁଁ ତୁରନ୍ତ ଡାକ୍ତରୀ ଯାଞ୍ଚ ଆବଶ୍ୟକ।`;
  } else if (warningCount > 0 || (vitals?.temperatureCelsius && vitals.temperatureCelsius >= 39.0)) {
    provisionalUrgency = 'YELLOW';
    rationaleEn = 'Priority review warranted due to moderate physiological derangement or severe pain.';
    rationaleHi = 'मध्यम शारीरिक असंतुलन या तीव्र दर्द के कारण प्राथमिकता समीक्षा आवश्यक है।';
    rationaleOr = 'ମଧ୍ୟମ ଶାରୀରିକ ସମସ୍ୟା ଯୋଗୁଁ ପ୍ରାଥମିକତା ସମୀକ୍ଷା ଆବଶ୍ୟକ।';
  } else if (!text || text.trim().length < 15) {
    provisionalUrgency = 'GREY';
    rationaleEn = 'Insufficient clinical details provided to categorize urgency safely.';
    rationaleHi = 'सुरक्षित वर्गीकरण के लिए पर्याप्त नैदानिक विवरण उपलब्ध नहीं है।';
    rationaleOr = 'ସଠିକ୍ ବର୍ଗୀକରଣ ପାଇଁ ଆବଶ୍ୟକୀୟ ତଥ୍ୟ ଅସମ୍ପୂର୍ଣ୍ଣ ରହିଛି।';
  }

  return {
    redFlags: detectedFlags,
    provisionalUrgency,
    rationaleEn,
    rationaleHi,
    rationaleOr,
  };
}
