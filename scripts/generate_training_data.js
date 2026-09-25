/**
 * Generator for synthetic patient triage encounters (v2)
 * Produces exactly 500 records:
 * - 150 RED
 * - 150 YELLOW
 * - 150 GREEN
 * - 50 GREY
 *
 * Strict Compliance:
 * - Deterministic PRNG with fixed seed
 * - Trilingual: en, hi, or
 * - Zero diagnoses, cures, treatments, doctor names, or risk percentages
 * - Clean CSV formatting with proper quoting
 */

const fs = require('fs');
const path = require('path');

// Mulberry32 deterministic PRNG
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(123456789);

function randInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 1) {
  const val = random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function choice(arr) {
  return arr[Math.floor(random() * arr.length)];
}

function sample(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - random());
  return shuffled.slice(0, n);
}

// Medical histories pool
const COMMON_HISTORIES = [
  'none_reported',
  'hypertension',
  'type_2_diabetes',
  'hypertension, type_2_diabetes',
  'asthma',
  'copd',
  'coronary_artery_disease',
  'hypothyroidism',
  'chronic_kidney_disease_stage_2',
  'osteoarthritis',
  'gastroesophageal_reflux',
  'epilepsy',
  'migraine',
  'allergic_rhinitis',
  'dyslipidemia',
];

// Allergies pool
const COMMON_ALLERGIES = [
  'none_known',
  'none_known',
  'none_known',
  'none_known',
  'penicillin',
  'sulfa_drugs',
  'nsaids',
  'amoxicillin',
  'ciprofloxacin',
  'aspirin',
  'dust_mites, pollen',
  'unknown',
];

// Clinical Encounter Templates per Class and Language
const RED_TEMPLATES = [
  // 1. ACS / Acute chest pain
  {
    rule: 'RF-ACUTE-CHEST-PAIN; VITAL-HYPERTENSION-STAGE-2',
    minAge: 40, maxAge: 85,
    painMin: 8, painMax: 10,
    durationHours: [0.5, 0.75, 1.0, 1.5, 2.0, 3.0],
    vitals: () => ({
      hr: randInt(102, 132),
      sbp: randInt(165, 210),
      dbp: randInt(98, 120),
      spo2: randInt(91, 95),
      temp: randFloat(36.5, 37.3),
      rr: randInt(22, 28),
    }),
    missingInfo: 'serial_ecg_pending; cardiac_enzymes_pending',
    en: {
      cc: 'Severe retrosternal crushing chest pain with arm radiation',
      sym: 'Heavy pressure behind breastbone, pain radiating to left shoulder and jaw, diaphoresis, severe nausea',
    },
    hi: {
      cc: 'सीने में अत्यधिक भारीपन और बाएं हाथ में खिंचाव',
      sym: 'छाती के बीच में तेज दबाव, दर्द बाएं हाथ और जबड़े तक फैलना, अत्यधिक पसीना और घबराहट',
    },
    or: {
      cc: 'ଛାତିରେ ଅତ୍ୟଧିକ ଚାପ ଓ ବାମ ହାତକୁ ଯନ୍ତ୍ରଣା ବ୍ୟାପିବା',
      sym: 'ଛାତି ମଝିରେ ଭୀଷଣ ଯନ୍ତ୍ରଣା, ବାମ କାନ୍ଧ ଓ ବେକକୁ କଷ୍ଟ ବ୍ୟାପିବା, ପ୍ରବଳ ଝାଳ ଏବଂ ବାନ୍ତି ଭାବ',
    },
  },
  // 2. Stroke / FAST
  {
    rule: 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION',
    minAge: 45, maxAge: 88,
    painMin: 1, painMax: 7,
    durationHours: [0.5, 1.0, 1.5, 2.0, 3.5, 4.0],
    vitals: () => ({
      hr: randInt(74, 108),
      sbp: randInt(182, 228),
      dbp: randInt(104, 124),
      spo2: randInt(94, 98),
      temp: randFloat(36.4, 37.1),
      rr: randInt(16, 22),
    }),
    missingInfo: 'urgent_head_ct_pending; last_known_well_witness_statement_pending',
    en: {
      cc: 'Sudden onset facial asymmetry, right arm weakness and slurred speech',
      sym: 'Acute right facial droop noticed 1 hour ago, complete inability to lift right arm, expressive dysphasia',
    },
    hi: {
      cc: 'अचानक मुंह टेढ़ा होना और दाहिने हाथ में लकवा',
      sym: 'एक घंटे पहले अचानक चेहरे का दाहिना हिस्सा झुकना, दाहिना हाथ न उठना, बोलने में अत्यधिक लड़खड़ाहट',
    },
    or: {
      cc: 'ଅଚାନକ ମୁହଁ ବଙ୍କା ହେବା ଓ ଡାହାଣ ହାତ ଅଚଳ ହେବା',
      sym: 'ହଠାତ୍ ମୁହଁ ଡାହାଣ ପଟକୁ ବଙ୍କିଯିବା, ଡାହାଣ ହାତ ଉଠାଇ ନପାରିବା, କଥା ସମ୍ପୂର୍ଣ୍ଣ ଅସ୍ପଷ୍ଟ ହେବା',
    },
  },
  // 3. Critical Hypoxia / Severe Respiratory Distress
  {
    rule: 'RF-RESPIRATORY-DISTRESS; VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-TACHYPNEA',
    minAge: 18, maxAge: 82,
    painMin: 4, painMax: 8,
    durationHours: [1.0, 2.0, 3.0, 6.0, 12.0],
    vitals: () => ({
      hr: randInt(118, 148),
      sbp: randInt(125, 160),
      dbp: randInt(78, 98),
      spo2: randInt(82, 89),
      temp: randFloat(37.4, 38.8),
      rr: randInt(32, 44),
    }),
    missingInfo: 'abg_pending; portable_chest_xray_pending',
    en: {
      cc: 'Gasping breathlessness with peripheral cyanosis',
      sym: 'Severe respiratory fatigue, inability to speak words, intercostal indrawing, dusky blue fingernails and lips',
    },
    hi: {
      cc: 'सांस लेने में भारी कठिनाई और होंठ नीले पड़ना',
      sym: 'दम घुटना, बोलने में पूरी तरह असमर्थ, छाती की पसलियां खिंचना, उंगलियों और नाखूनों का नीला पड़ना',
    },
    or: {
      cc: 'ତୀବ୍ର ଶ୍ୱାସକଷ୍ଟ ଏବଂ ନୀଳ ପଡ଼ିଯିବା',
      sym: 'ନିଶ୍ୱାସ ନେଇ ନପାରିବା, ଗୋଟିଏ ଶବ୍ଦ କହିବାରେ କଷ୍ଟ, ପଞ୍ଜରା ଟାଣି ଧରିବା, ନଖ ଓ ଓଠ ନୀଳ ପଡ଼ିବା',
    },
  },
  // 4. Anaphylaxis
  {
    rule: 'RF-ANAPHYLAXIS; VITAL-CRITICAL-HYPOTENSION',
    minAge: 14, maxAge: 62,
    painMin: 2, painMax: 6,
    durationHours: [0.25, 0.5, 0.75, 1.0],
    vitals: () => ({
      hr: randInt(122, 150),
      sbp: randInt(72, 88),
      dbp: randInt(44, 56),
      spo2: randInt(88, 93),
      temp: randFloat(36.7, 37.3),
      rr: randInt(26, 36),
    }),
    missingInfo: 'epinephrine_dose_verification_pending; culprit_antigen_unverified',
    en: {
      cc: 'Acute lip swelling, inspiratory stridor and collapse after insect sting',
      sym: 'Rapidly spreading facial angioedema, tightness in throat, high-pitched stridor, widespread hives, profound dizziness',
    },
    hi: {
      cc: 'कीड़े के काटने के बाद होंठों में सूजन और सांस की नली बंद होना',
      sym: 'चेहरे और होंठों पर अचानक सूजन, गले में रुकावट, घरघराहट, पूरे शरीर पर लाल चकत्ते और चक्कर आकर गिरना',
    },
    or: {
      cc: 'କୀଟ କାମୁଡ଼ିବା ପରେ ଓଠ ଫୁଲିବା ଓ ଶ୍ୱାସନଳୀ ବନ୍ଦ ହେବା',
      sym: 'ମୁହଁ ଓ ଓଠ ଅତ୍ୟଧିକ ଫୁଲିଯିବା, ଗଳା ବନ୍ଦ ହେବା ଭଳି ଲାଗିବା, ଘରଘର ଶବ୍ଦ, ସାରା ଶରୀରରେ କୁଣ୍ଡାଇ ଚିହ୍ନ',
    },
  },
  // 5. Paediatric Sepsis / Purpura
  {
    rule: 'RF-PAEDIATRIC-SEPSIS; VITAL-CRITICAL-HYPERTHERMIA; VITAL-CRITICAL-TACHYCARDIA',
    minAge: 1, maxAge: 8,
    painMin: 6, painMax: 9,
    durationHours: [4.0, 6.0, 8.0, 14.0],
    vitals: () => ({
      hr: randInt(162, 192),
      sbp: randInt(74, 88),
      dbp: randInt(42, 54),
      spo2: randInt(91, 94),
      temp: randFloat(39.8, 40.7),
      rr: randInt(42, 58),
    }),
    missingInfo: 'blood_cultures_pending; lumbar_puncture_assessment_pending',
    en: {
      cc: 'Extreme lethargy, high burning fever and spreading purpuric rash in child',
      sym: 'Drowsy toddler difficult to rouse, cold mottled extremities, petechial purple spots on trunk that do not fade under pressure',
    },
    hi: {
      cc: 'बच्चे में अत्यधिक सुस्ती, तेज बुखार और शरीर पर जामुनी धब्बे',
      sym: 'बच्चा होश में नहीं आ रहा, हाथ-पैर ठंडे, छाती और पेट पर बैंगनी चकत्ते जो दबाने पर भी नहीं मिटते',
    },
    or: {
      cc: 'ଶିଶୁର ପ୍ରବଳ ଜ୍ୱର, ଚେତା ହରାଇବା ଭଳି ଅବସ୍ଥା ଓ ଦେହରେ ବାଇଗଣୀ ଦାଗ',
      sym: 'ପିଲା ଆଖି ଖୋଲୁନାହିଁ, ହାତଗୋଡ଼ ଥଣ୍ଡା ପଡ଼ିଯିବା, ଛାତି ଓ ପେଟରେ ଗାଢ଼ ବାଇଗଣୀ ଦାଗ ଯାହା ଚିପିଲେ ଲିଭୁନାହିଁ',
    },
  },
  // 6. Severe Hemorrhagic Shock
  {
    rule: 'RF-SEVERE-BLEEDING; VITAL-CRITICAL-HYPOTENSION; VITAL-CRITICAL-TACHYCARDIA',
    minAge: 20, maxAge: 75,
    painMin: 5, painMax: 9,
    durationHours: [1.0, 2.0, 4.0, 6.0],
    vitals: () => ({
      hr: randInt(125, 155),
      sbp: randInt(70, 86),
      dbp: randInt(44, 56),
      spo2: randInt(92, 96),
      temp: randFloat(35.6, 36.6),
      rr: randInt(26, 36),
    }),
    missingInfo: 'type_and_crossmatch_pending; hemoglobin_stat_pending',
    en: {
      cc: 'Massive vomiting of fresh blood with postural syncope',
      sym: 'Large volume hematemesis (approx 400ml), dark clots, profound cold clammy skin, blacking out on sitting up',
    },
    hi: {
      cc: 'मुंह से लगातार खून की उल्टियां और चक्कर खाकर गिरना',
      sym: 'ताजा लाल खून की तीन बड़ी उल्टियां, शरीर बिल्कुल ठंडा और पसीने से तर, उठने पर आंखों के आगे अंधेरा छाना',
    },
    or: {
      cc: 'ପ୍ରଚୁର ରକ୍ତ ବାନ୍ତି ଏବଂ ଚେତାଶୂନ୍ୟ ହୋଇ ପଡ଼ିବା',
      sym: 'ପ୍ରବଳ ପରିମାଣରେ ଲାଲ୍ ରକ୍ତ ବାନ୍ତି, ଶରୀର ଥଣ୍ଡା ଓ ଝାଳରେ ଭିଜିଯିବା, ଉଠି ବସିବା ମାତ୍ରେ ଅଚେତ ହୋଇ ପଡ଼ିବା',
    },
  },
  // 7. Hypertensive Emergency with Neurological Signs
  {
    rule: 'RF-HYPERTENSIVE-EMERGENCY; VITAL-CRITICAL-HYPERTENSION',
    minAge: 50, maxAge: 85,
    painMin: 8, painMax: 10,
    durationHours: [2.0, 4.0, 8.0, 18.0],
    vitals: () => ({
      hr: randInt(88, 116),
      sbp: randInt(210, 245),
      dbp: randInt(118, 138),
      spo2: randInt(94, 98),
      temp: randFloat(36.5, 37.2),
      rr: randInt(20, 26),
    }),
    missingInfo: 'fundoscopy_pending; serum_creatinine_stat_pending',
    en: {
      cc: 'Explosive occipital headache with visual blurring and severe hypertension',
      sym: 'Worst headache of life at back of head, double vision, persistent vomiting, blood pressure over 210/120',
    },
    hi: {
      cc: 'सिर के पिछले हिस्से में असहनीय दर्द और आंखों से धुंधला दिखना',
      sym: 'सिर फटने जैसा भयानक दर्द, दोहरी दृष्टि, बार-बार उल्टी, अत्यधिक उच्च रक्तचाप',
    },
    or: {
      cc: 'ମୁଣ୍ଡ ପଛପଟେ ଅସହ୍ୟ ଯନ୍ତ୍ରଣା ଓ ଆଖିକୁ ଝାପ୍‌ସା ଦେଖାଯିବା',
      sym: 'ମୁଣ୍ଡ ଫାଟିଯିବା ଭଳି ଭୀଷଣ ଯନ୍ତ୍ରଣା, ଗୋଟିଏ ଜିନିଷ ଦୁଇଟି ଦିଶିବା, ଅନବରତ ବାନ୍ତି, ରକ୍ତଚାପ ଚରମ ସୀମାରେ',
    },
  },
  // 8. Eclampsia / Severe Preeclampsia (Pregnancy specific)
  {
    rule: 'RF-PREGNANCY-EMERGENCY; VITAL-CRITICAL-HYPERTENSION',
    minAge: 19, maxAge: 38,
    painMin: 7, painMax: 10,
    durationHours: [1.0, 2.0, 4.0, 8.0],
    vitals: () => ({
      hr: randInt(104, 126),
      sbp: randInt(178, 215),
      dbp: randInt(110, 126),
      spo2: randInt(95, 98),
      temp: randFloat(36.8, 37.5),
      rr: randInt(22, 28),
    }),
    missingInfo: 'urine_protein_dipstick_pending; cardiotocography_pending',
    en: {
      cc: 'Severe throbbing headache, visual flashing lights and epigastric pain in third trimester pregnancy',
      sym: 'Severe right upper quadrant pain, facial edema, photophobia, hyperreflexia in 34-week pregnant female',
    },
    hi: {
      cc: 'गर्भावस्था के आठवें महीने में सिर में भयानक दर्द, आंखों के आगे चमक और पेट दर्द',
      sym: 'चेहरे और पैरों में अचानक भारी सूजन, तेज सिरदर्द, धुंधला दिखना, पेट के ऊपरी हिस्से में तेज मरोड़',
    },
    or: {
      cc: 'ଗର୍ଭାବସ୍ଥାରେ ପ୍ରବଳ ମୁଣ୍ଡବିନ୍ଧା, ଆଖି ଆଗରେ ଆଲୋକ ଝଲକ ଓ ପେଟ କଷ୍ଟ',
      sym: 'ମୁହଁ ଓ ଗୋଡ଼ ଅତ୍ୟଧିକ ଫୁଲିବା, ମୁଣ୍ଡ ଘୁରାଇବା ସହ ଦୃଷ୍ଟିଶକ୍ତି କମିବା, ପେଟର ଉପର ଭାଗରେ ତୀବ୍ର ଯନ୍ତ୍ରଣା',
    },
  },
];

const YELLOW_TEMPLATES = [
  // 1. Acute Appendicitis / RLQ pain
  {
    rule: 'NONE',
    minAge: 14, maxAge: 55,
    painMin: 6, painMax: 8,
    durationHours: [12.0, 18.0, 24.0, 36.0],
    vitals: () => ({
      hr: randInt(86, 104),
      sbp: randInt(116, 138),
      dbp: randInt(72, 86),
      spo2: randInt(97, 99),
      temp: randFloat(38.1, 38.8),
      rr: randInt(18, 22),
    }),
    missingInfo: 'abdominal_ultrasound_pending; wbc_differential_pending',
    en: {
      cc: 'Persistent right lower abdominal pain with low grade fever and nausea',
      sym: 'Pain initially around umbilicus now sharp and localized to right iliac fossa, worsened by walking, loss of appetite',
    },
    hi: {
      cc: 'पेट के निचले दाहिने हिस्से में लगातार दर्द और हल्का बुखार',
      sym: 'दर्द पहले नाभि के पास था अब दाहिनी तरफ तेज हो गया है, चलने पर दर्द बढ़ना, भूख न लगना और मतली',
    },
    or: {
      cc: 'ପେଟର ଡାହାଣ ତଳ ଭାଗରେ ଲଗାତାର ଯନ୍ତ୍ରଣା ଓ ଜ୍ୱର',
      sym: 'ନାଭି ପାଖରୁ ଆରମ୍ଭ ହୋଇ ଏବେ ଡାହାଣ ପଟେ ତୀବ୍ର କଷ୍ଟ, ଚାଲିଲେ ଯନ୍ତ୍ରଣା ବଢ଼ିବା, ଖାଇବାକୁ ଇଚ୍ଛା ନହେବା',
    },
  },
  // 2. Moderate Pneumonia / Borderline Hypoxia
  {
    rule: 'NONE',
    minAge: 25, maxAge: 82,
    painMin: 5, painMax: 7,
    durationHours: [48.0, 72.0, 96.0, 120.0],
    vitals: () => ({
      hr: randInt(94, 112),
      sbp: randInt(120, 145),
      dbp: randInt(76, 88),
      spo2: randInt(91, 93),
      temp: randFloat(38.4, 39.2),
      rr: randInt(22, 26),
    }),
    missingInfo: 'chest_radiograph_pending; sputum_culture_pending',
    en: {
      cc: 'Productive purulent cough with breathlessness and shaking chills',
      sym: 'Thick greenish-yellow sputum, sharp pleuritic side chest ache on deep breath, night chills, breathlessness on minor walking',
    },
    hi: {
      cc: 'पीले कफ वाली खांसी, सांस फूलना और तेज कंपकंपी वाला बुखार',
      sym: 'गहरे सांस लेने पर छाती में चुभने वाला दर्द, पीला-हरा गाढ़ा बलगम, रात को तेज ठंड लगना, थोड़ा चलने पर भी सांस भरना',
    },
    or: {
      cc: 'ହଳଦିଆ କଫ ପଡ଼ିବା, ଶ୍ୱାସ ଫୁଲିବା ଓ ଥରି ଥରି ଜ୍ୱର ଆସିବା',
      sym: 'ନିଶ୍ୱାସ ନେଲେ ଛାତି କଡ଼ରେ ଛୁଞ୍ଚି ଫୋଡ଼ି ହେବା ଭଳି କଷ୍ଟ, ବହଳିଆ କଫ, ପ୍ରବଳ ଥଣ୍ଡା ଲାଗିବା, ଚାଲିଲେ ଥକି ପଡ଼ିବା',
    },
  },
  // 3. Deep Laceration / Fracture Suspect
  {
    rule: 'NONE',
    minAge: 10, maxAge: 68,
    painMin: 7, painMax: 9,
    durationHours: [0.75, 1.5, 2.0, 4.0],
    vitals: () => ({
      hr: randInt(84, 106),
      sbp: randInt(124, 148),
      dbp: randInt(78, 90),
      spo2: randInt(98, 100),
      temp: randFloat(36.5, 37.1),
      rr: randInt(16, 20),
    }),
    missingInfo: 'wound_depth_exploration_pending; tetanus_vaccination_date_unverified',
    en: {
      cc: 'Deep 6cm forearm laceration from machinery with bleeding controlled by bandage',
      sym: 'Gaped skin edges exposing subcutaneous tissue, moderate bleeding halted with firm pressure, intact hand movement',
    },
    hi: {
      cc: 'हाथ में 6 सेमी गहरा घाव, पट्टी से खून का बहाव रुका हुआ',
      sym: 'मशीन से कटने के बाद गहरा घाव जिसमें अंदर का मांस दिख रहा है, दबाने पर खून रुक गया है, उंगलियां हिल रही हैं',
    },
    or: {
      cc: 'ହାତରେ ୬ ସେମି ଗଭୀର କ୍ଷତ, ପଟି ବାନ୍ଧିବା ପରେ ରକ୍ତ ବନ୍ଦ ଅଛି',
      sym: 'ଯନ୍ତ୍ରାଂଶ ବାଜି ଚମଡ଼ା ଫାଟି ଭିତର ମାଂସ ଦିଶିବା, ଦାବି ଧରିବାରୁ ରକ୍ତ ବନ୍ଦ ଅଛି, ଆଙ୍ଗୁଠି ଚଳାଚଳ ସ୍ୱାଭାବିକ',
    },
  },
  // 4. Acute Renal Colic
  {
    rule: 'NONE',
    minAge: 24, maxAge: 65,
    painMin: 8, painMax: 10,
    durationHours: [2.0, 4.0, 6.0, 10.0],
    vitals: () => ({
      hr: randInt(92, 114),
      sbp: randInt(138, 160),
      dbp: randInt(86, 98),
      spo2: randInt(98, 100),
      temp: randFloat(36.7, 37.3),
      rr: randInt(18, 22),
    }),
    missingInfo: 'renal_ultrasound_pending; urine_microscopy_pending',
    en: {
      cc: 'Severe spasmodic right flank pain radiating to groin with red urine',
      sym: 'Excruciating colicky back ache coming in waves, visible blood in urine, writhing in bed unable to find comfortable position',
    },
    hi: {
      cc: 'कमर के दाहिने हिस्से में असहनीय दर्द जो पेट के नीचे जा रहा है और लाल पेशाब',
      sym: 'लहरों की तरह उठने वाला तेज कमर दर्द, पेशाब में साफ खून दिखना, दर्द के मारे बेचैनी और उल्टी',
    },
    or: {
      cc: 'ଡାହାଣ କମରରେ ଅସହ୍ୟ କଷ୍ଟ ଓ ପରିସ୍ରାରେ ରକ୍ତ ପଡ଼ିବା',
      sym: 'କମରରୁ ତଳିପେଟ ଆଡ଼କୁ ତୀବ୍ର ମୋଡ଼ି ହେବା ଭଳି ଯନ୍ତ୍ରଣା, ଲାଲ ପରିସ୍ରା ହେବା, ଯନ୍ତ୍ରଣାରେ ଛଟପଟ ହେବା',
    },
  },
  // 5. Marked Hyperglycemia (Dehydration)
  {
    rule: 'NONE',
    minAge: 35, maxAge: 78,
    painMin: 2, painMax: 5,
    durationHours: [24.0, 48.0, 72.0],
    vitals: () => ({
      hr: randInt(98, 115),
      sbp: randInt(112, 134),
      dbp: randInt(70, 84),
      spo2: randInt(96, 99),
      temp: randFloat(36.6, 37.3),
      rr: randInt(18, 22),
    }),
    missingInfo: 'serum_ketones_pending; serum_electrolytes_stat_pending',
    en: {
      cc: 'High blood sugar over 360 mg/dL with intense thirst and dry mouth',
      sym: 'Excessive thirst drinking 5 litres of water, frequent urination every 30 minutes, dry cracked lips, weakness, no stomach pain',
    },
    hi: {
      cc: 'शुगर 360 से ऊपर, बहुत ज्यादा प्यास और मुंह सूखना',
      sym: 'लगातार गला सूखना, हर आधे घंटे में पेशाब आना, होठों पर पपड़ी जमना, अत्यधिक कमजोरी लेकिन पेट में दर्द नहीं',
    },
    or: {
      cc: 'ରକ୍ତରେ ଶର୍କରା ୩୬୦ରୁ ଅଧିକ, ପ୍ରବଳ ଶୋଷ ଓ ପାଟି ଶୁଖିଯିବା',
      sym: 'ପ୍ରଚୁର ପାଣି ପିଇବା ପରେ ବି ଶୋଷ ନମରିବା, ବାରମ୍ବାର ପରିସ୍ରା ଲାଗିବା, ଓଠ ଶୁଖି ଫାଟିଯିବା, ଅତ୍ୟଧିକ ଦୁର୍ବଳତା',
    },
  },
  // 6. Acute Pyelonephritis / Severe UTI
  {
    rule: 'NONE',
    minAge: 20, maxAge: 70,
    painMin: 6, painMax: 8,
    durationHours: [24.0, 36.0, 48.0],
    vitals: () => ({
      hr: randInt(96, 112),
      sbp: randInt(115, 135),
      dbp: randInt(72, 85),
      spo2: randInt(97, 99),
      temp: randFloat(38.6, 39.4),
      rr: randInt(18, 22),
    }),
    missingInfo: 'urine_culture_pending; renal_function_panel_pending',
    en: {
      cc: 'High fever, shaking chills, burning urination and right kidney tenderness',
      sym: 'Severe burning during micturition, constant ache in right back below ribs, shivers requiring 3 blankets',
    },
    hi: {
      cc: 'पेशाब में तेज जलन, पीठ में दर्द और कंपकंपी के साथ तेज बुखार',
      sym: 'पेशाब करते समय बहुत जलन, पीठ के निचले हिस्से में भारीपन और दर्द, तेज ठंड लगना',
    },
    or: {
      cc: 'ପରିସ୍ରାରେ ପ୍ରବଳ ପୋଡ଼ାଜଳା, କମର ବିନ୍ଧା ଓ କମ୍ପ ଜ୍ୱର',
      sym: 'ପରିସ୍ରା ହେବା ବେଳେ ଭୀଷଣ ଜଳାପୋଡ଼ା, ପିଠିର ତଳ ଭାଗରେ ଛୁଇଁଲେ ବିନ୍ଧିବା, କମ୍ପଲ ଘୋଡ଼ାଇ ହେବା ଭଳି ଥଣ୍ଡା ଲାଗିବା',
    },
  },
];

const GREEN_TEMPLATES = [
  // 1. Mild Viral URI
  {
    rule: 'NONE',
    minAge: 5, maxAge: 75,
    painMin: 1, painMax: 3,
    durationHours: [24.0, 48.0, 72.0, 96.0],
    vitals: () => ({
      hr: randInt(66, 82),
      sbp: randInt(112, 126),
      dbp: randInt(70, 80),
      spo2: randInt(98, 100),
      temp: randFloat(36.5, 37.2),
      rr: randInt(13, 16),
    }),
    missingInfo: 'none_critical',
    en: {
      cc: 'Mild runny nose, sneezing and tickly dry cough for 3 days',
      sym: 'Clear watery nasal discharge, intermittent throat irritation, normal appetite, no fever, no difficulty breathing',
    },
    hi: {
      cc: 'हल्की बहती नाक, छींकें और गले में हल्की खराश',
      sym: 'नाक से पानी आना, बार-बार छींक आना, गले में हल्की खिचखिच, भूख सामान्य, बुखार बिल्कुल नहीं',
    },
    or: {
      cc: 'ସାମାନ୍ୟ ନାକରୁ ପାଣି ବୋହିବା, ଛିଙ୍କ ଓ ଗଳା କୁଣ୍ଡାଇ ହେବା',
      sym: 'ନାକରୁ ନିର୍ମଳ ପାଣି ବୋହିବା, ବାରମ୍ବାର ଛିଙ୍କ, ସାମାନ୍ୟ କାଶ, ଖିଆପିଆ ସ୍ୱାଭାବିକ, ଜ୍ୱର ନାହିଁ',
    },
  },
  // 2. Superficial Abrasion / Minor Contusion
  {
    rule: 'NONE',
    minAge: 6, maxAge: 65,
    painMin: 1, painMax: 3,
    durationHours: [1.0, 2.0, 4.0, 8.0],
    vitals: () => ({
      hr: randInt(65, 80),
      sbp: randInt(110, 124),
      dbp: randInt(68, 78),
      spo2: randInt(98, 100),
      temp: randFloat(36.5, 36.9),
      rr: randInt(12, 16),
    }),
    missingInfo: 'none_critical; tetanus_date_unverified',
    en: {
      cc: 'Superficial skin graze on right knee from stumbling on pavement',
      sym: 'Small 2cm epidermal scrape, minor oozing stopped, full range of joint movement without limitation',
    },
    hi: {
      cc: 'चलते समय फिसलने से घुटने पर मामूली खरोंच',
      sym: 'घुटने पर 2 सेमी की सतही रगड़, खून नहीं बह रहा, पैर मोड़ने और चलने में कोई दिक्कत नहीं',
    },
    or: {
      cc: 'ଚାଲୁ ଚାଲୁ ଗୋଡ଼ ଖସିଯିବାରୁ ଆଣ୍ଠୁରେ ସାମାନ୍ୟ ରାମ୍ପୁଡ଼ା ଚିହ୍ନ',
      sym: 'ଆଣ୍ଠୁ ଚମଡ଼ା ସାମାନ୍ୟ ଛାଲି ହୋଇଛି, ରକ୍ତ ବାହାରୁ ନାହିଁ, ଗୋଡ଼ ଭାଙ୍ଗିବାରେ କୌଣସି ଅସୁବିଧା ନାହିଁ',
    },
  },
  // 3. Chronic Osteoarthritis Joint Ache
  {
    rule: 'NONE',
    minAge: 48, maxAge: 85,
    painMin: 2, painMax: 4,
    durationHours: [360.0, 720.0, 1440.0, 2160.0],
    vitals: () => ({
      hr: randInt(68, 82),
      sbp: randInt(120, 136),
      dbp: randInt(74, 84),
      spo2: randInt(97, 99),
      temp: randFloat(36.4, 37.0),
      rr: randInt(14, 17),
    }),
    missingInfo: 'none_critical; prior_xray_report_not_brought',
    en: {
      cc: 'Longstanding dull ache in both knees worse after prolonged walking',
      sym: 'Chronic aching pain in knee joints for months, stiffness on rising lasting 10 minutes, no redness or warmth',
    },
    hi: {
      cc: 'काफी समय से दोनों घुटनों में हल्का दर्द, ज्यादा चलने पर बढ़ता है',
      sym: 'महीनों से घुटनों में मीठा दर्द, सुबह उठने पर 10 मिनट की जकड़न, घुटनों पर कोई सूजन या लाली नहीं',
    },
    or: {
      cc: 'ବହୁ ଦିନରୁ ଦୁଇ ଆଣ୍ଠୁରେ ସାମାନ୍ୟ ବିନ୍ଧା, ଚାଲିଲେ ବଢ଼େ',
      sym: 'ଅନେକ ଦିନରୁ ଆଣ୍ଠୁ ବିନ୍ଧା, ସକାଳେ ଉଠିଲେ କିଛି ସମୟ ଟାଣ ଲାଗିବା, କୌଣସି ଫୁଲା ବା ଲାଲ୍ ଚିହ୍ନ ନାହିଁ',
    },
  },
  // 4. Mild Tension Headache
  {
    rule: 'NONE',
    minAge: 18, maxAge: 58,
    painMin: 2, painMax: 4,
    durationHours: [8.0, 12.0, 24.0, 36.0],
    vitals: () => ({
      hr: randInt(68, 80),
      sbp: randInt(114, 128),
      dbp: randInt(72, 82),
      spo2: randInt(98, 100),
      temp: randFloat(36.6, 37.0),
      rr: randInt(13, 16),
    }),
    missingInfo: 'none_critical',
    en: {
      cc: 'Mild band-like pressure across forehead after prolonged screen work',
      sym: 'Dull pressing sensation around temples, no nausea, no sensitivity to bright light, relieved after sleep',
    },
    hi: {
      cc: 'कंप्यूटर पर काम के बाद माथे में हल्का भारीपन और दर्द',
      sym: 'माथे के दोनों तरफ हल्का दबाव, कोई उल्टी का मन नहीं, तेज रोशनी से कोई परेशानी नहीं',
    },
    or: {
      cc: 'କମ୍ପ୍ୟୁଟର କାମ ପରେ କପାଳରେ ସାମାନ୍ୟ ଭାରୀ ଲାଗିବା ଓ ମୁଣ୍ଡ ବିନ୍ଧା',
      sym: 'କପାଳ ଚାରିପଟେ ସାମାନ୍ୟ ଚାପ, ବାନ୍ତି ଭାବ ନାହିଁ, ଆଲୋକ ଦେଖିଲେ କୌଣସି ଅସୁବିଧା ନାହିଁ',
    },
  },
  // 5. Seasonal Allergic Rhinitis
  {
    rule: 'NONE',
    minAge: 12, maxAge: 52,
    painMin: 0, painMax: 2,
    durationHours: [72.0, 168.0, 240.0],
    vitals: () => ({
      hr: randInt(68, 80),
      sbp: randInt(112, 126),
      dbp: randInt(70, 80),
      spo2: randInt(98, 100),
      temp: randFloat(36.5, 36.9),
      rr: randInt(12, 16),
    }),
    missingInfo: 'none_critical',
    en: {
      cc: 'Itchy watery eyes and recurrent sneezing fits with seasonal change',
      sym: 'Bilateral eye itching, clear fluid dripping from nose, palate itching, symptoms worse outdoors',
    },
    hi: {
      cc: 'मौसम बदलने पर आंखों में खुजली, पानी आना और लगातार छींकें',
      sym: 'दोनों आंखों में खुजली, नाक से साफ पानी बहना, तालू में खुजली, बाहर जाने पर लक्षण बढ़ना',
    },
    or: {
      cc: 'ଋତୁ ପରିବର୍ତ୍ତନ ଯୋଗୁଁ ଆଖି କୁଣ୍ଡାଇ ହେବା, ପାଣି ବାହାରିବା ଓ ବାରମ୍ବାର ଛିଙ୍କ',
      sym: 'ଦୁଇ ଆଖି କୁଣ୍ଡାଇ ହେବା, ନାକରୁ ସଫା ପାଣି ବୋହିବା, ତାଳୁ କୁଣ୍ଡାଇ ହେବା, ଖରାରେ ଗଲେ ବଢ଼ିବା',
    },
  },
];

const GREY_TEMPLATES = [
  // 1. Syncope with completely absent vitals
  {
    rule: 'RULE_INSUFFICIENT_CRITICAL_VITALS; RULE_SYNCOPE_UNASSESSED',
    minAge: 40, maxAge: 82,
    painMin: null, painMax: null,
    durationHours: null, // missing duration
    vitals: () => ({
      hr: null,
      sbp: null,
      dbp: null,
      spo2: null,
      temp: null,
      rr: null,
    }),
    missingInfo: 'missing_all_vital_signs; missing_duration; postural_bp_unassessed; ecg_unperformed',
    en: {
      cc: 'Sudden collapse at home with dizziness, patient refused vital sign cuff',
      sym: 'Brief loss of consciousness reported by daughter, patient agitated and uncooperative with vitals measurement, duration unclear',
    },
    hi: {
      cc: 'घर पर अचानक चक्कर खाकर गिरना, मरीज ने बीपी नापने से मना किया',
      sym: 'बेटी के अनुसार कुछ क्षण के लिए बेहोश हुआ, मरीज घबराया हुआ है और जांच में सहयोग नहीं कर रहा, समय अज्ञात',
    },
    or: {
      cc: 'ଘରେ ହଠାତ୍ ଚେତା ହରାଇ ପଡ଼ିଯିବା, ରୋଗୀ ରକ୍ତଚାପ ମାପିବାକୁ ଦେଉନାହିଁ',
      sym: 'ଝିଅ ଅନୁଯାୟୀ କିଛି ସମୟ ଅଚେତ ହୋଇଗଲେ, ରୋଗୀ ଅତ୍ୟନ୍ତ ଅସ୍ଥିର ଏବଂ ପରୀକ୍ଷାରେ ସହଯୋଗ କରୁନାହିଁ, ସମୟ ଅଜଣା',
    },
  },
  // 2. Acute chest tightness with missing BP and HR
  {
    rule: 'RULE_INSUFFICIENT_CRITICAL_VITALS; RULE_CHEST_SYMPTOMS_INCOMPLETE_DATA',
    minAge: 35, maxAge: 70,
    painMin: 5, painMax: 8,
    durationHours: null,
    vitals: () => ({
      hr: null,
      sbp: null,
      dbp: null,
      spo2: randInt(96, 98),
      temp: null,
      rr: null,
    }),
    missingInfo: 'missing_blood_pressure; missing_heart_rate; missing_respiratory_rate; unspecified_duration',
    en: {
      cc: 'Vague chest discomfort with unrecorded blood pressure and pulse',
      sym: 'Sensation of tightness across chest, unable to state exact time of onset, equipment malfunction prevented BP/HR reading',
    },
    hi: {
      cc: 'छाती में भारीपन लेकिन रक्तचाप और नब्ज रिकॉर्ड नहीं हो सकी',
      sym: 'छाती में जकड़न का अहसास, दर्द कब शुरू हुआ स्पष्ट नहीं, मशीन खराब होने से बीपी और पल्स दर्ज नहीं हो सके',
    },
    or: {
      cc: 'ଛାତିରେ ଅସ୍ପଷ୍ଟ ଭାରୀପଣ କିନ୍ତୁ ରକ୍ତଚାପ ଓ ନାଡ଼ି ମପା ହୋଇପାରି ନାହିଁ',
      sym: 'ଛାତି ଚିପି ଧରିବା ଭଳି ଲାଗୁଛି, କେତେବେଳେ ଆରମ୍ଭ ହେଲା ଜଣାନାହିଁ, ଯନ୍ତ୍ର ଖରାପ ଯୋଗୁଁ ରକ୍ତଚାପ ଓ ନାଡ଼ି ମପା ଯାଇନାହିଁ',
    },
  },
  // 3. Toddler lethargy with no temperature or HR
  {
    rule: 'RULE_INSUFFICIENT_CRITICAL_VITALS; RULE_PAEDIATRIC_VITALS_MISSING',
    minAge: 1, maxAge: 4,
    painMin: null, painMax: null,
    durationHours: null,
    vitals: () => ({
      hr: null,
      sbp: null,
      dbp: null,
      spo2: null,
      temp: null,
      rr: randInt(32, 42),
    }),
    missingInfo: 'missing_temperature; missing_heart_rate; missing_weight; hydration_fontanelle_unassessed',
    en: {
      cc: 'Toddler irritable and refusing fluids with no thermometer available at home',
      sym: 'Persistent crying, hot to touch by parent report, dry nappies for unknown duration, vitals could not be completed',
    },
    hi: {
      cc: 'छोटा बच्चा लगातार रो रहा है और दूध नहीं पी रहा, थर्मामीटर उपलब्ध नहीं',
      sym: 'माता-पिता के अनुसार शरीर गर्म है, कितने समय से पेशाब नहीं किया अज्ञात, नब्ज और तापमान नहीं लिया जा सका',
    },
    or: {
      cc: 'ଛୋଟ ପିଲା କ୍ଷୀର ଖାଉନାହିଁ ଓ କ୍ରମାଗତ କାନ୍ଦୁଛି, ଥର୍ମାମିଟର ଉପଲବ୍ଧ ନାହିଁ',
      sym: 'ବାପାମାଆଙ୍କ କହିବାନୁସାରେ ଦେହ ତାତିଛି, କେତେ ସମୟରୁ ପରିସ୍ରା ହୋଇନାହିଁ ଜଣାନାହିଁ, ନାଡ଼ି ଓ ଉତ୍ତାପ ମପା ହୋଇନାହିଁ',
    },
  },
  // 4. Geriatric altered mental state with missing glucose and vitals
  {
    rule: 'RULE_INSUFFICIENT_CRITICAL_VITALS; RULE_ALTERED_MENTAL_STATUS_UNASSESSED',
    minAge: 68, maxAge: 90,
    painMin: null, painMax: null,
    durationHours: null,
    vitals: () => ({
      hr: randInt(72, 86),
      sbp: randInt(130, 146),
      dbp: randInt(76, 86),
      spo2: null,
      temp: null,
      rr: null,
    }),
    missingInfo: 'missing_blood_glucose; missing_spo2; missing_temperature; missing_duration; medication_list_missing',
    en: {
      cc: 'New confusion and disorientation in elderly patient with unmeasured oxygen and glucose',
      sym: 'Patient not recognizing family members, speech wandering, glucometer unavailable, pulse oximeter failed to register',
    },
    hi: {
      cc: 'बुजुर्ग मरीज में अचानक भ्रम और बहकी बातें, शुगर और ऑक्सीजन रिकॉर्ड नहीं',
      sym: 'मरीज परिजनों को नहीं पहचान पा रहा, बातों में भटकाव, ग्लूकोमीटर न होने से शुगर जांच नहीं हो सकी, ऑक्सीजन दर्ज नहीं',
    },
    or: {
      cc: 'ବୃଦ୍ଧ ରୋଗୀଙ୍କ ଚେତନା ହଜିଯିବା ଓ ପ୍ରଳାପ ବକିବା, ଶର୍କରା ଓ ଅମ୍ଳଜାନ ମପା ହୋଇନାହିଁ',
      sym: 'ଘର ଲୋକଙ୍କୁ ଚିହ୍ନି ନପାରିବା, କଥା ଅସଙ୍ଗତ ହେବା, ଗ୍ଲୁକୋମିଟର ନଥିବାରୁ ଶର୍କରା ମପା ହୋଇନାହିଁ, ଅକ୍ସିଜେନ ମପା ହୋଇନାହିଁ',
    },
  },
  // 5. Spreading rash with all vitals missing and unknown drug
  {
    rule: 'RULE_INSUFFICIENT_CRITICAL_VITALS; RULE_DRUG_ERUPTION_EVALUATION_NEEDED',
    minAge: 20, maxAge: 62,
    painMin: 2, painMax: 5,
    durationHours: [12.0, 24.0, 48.0],
    vitals: () => ({
      hr: null,
      sbp: null,
      dbp: null,
      spo2: null,
      temp: null,
      rr: null,
    }),
    missingInfo: 'missing_all_vital_signs; mucosal_involvement_uninspected; unknown_offending_medication',
    en: {
      cc: 'Widespread peeling rash after unverified medicine, all vital signs omitted',
      sym: 'Red blotches across chest and back after taking unknown local pharmacy tablets, mucosal inspection not performed, vitals not recorded',
    },
    hi: {
      cc: 'अज्ञात दवा खाने के बाद पूरे शरीर पर लाल चकत्ते, कोई भी वाइटल दर्ज नहीं',
      sym: 'स्थानीय दुकान से ली गई गोली के बाद छाती और पीठ पर फैलते लाल दाने, मुंह के अंदर जांच नहीं हुई, रक्तचाप आदि दर्ज नहीं',
    },
    or: {
      cc: 'ଅଜଣା ଔଷଧ ଖାଇବା ପରେ ସାରା ଦେହରେ କୁଣ୍ଡାଇ ଦାଗ, କୌଣସି ଭାଇଟାଲ ମପା ହୋଇନାହିଁ',
      sym: 'ଦୋକାନରୁ ଆଣିଥିବା ବଟିକା ଖାଇବା ପରେ ଛାତି ଓ ପିଠିରେ ନାଲି ଦାଗ, ପାଟି ଭିତର ପରୀକ୍ଷା ହୋଇନାହିଁ, ରକ୍ତଚାପ ଆଦି ମପା ହୋଇନାହିଁ',
    },
  },
];

function escapeCSV(val) {
  if (val === null || val === undefined || val === '') return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateDataset() {
  const records = [];
  const header = [
    'case_id',
    'patient_synthetic_id',
    'age',
    'gender',
    'patient_language',
    'chief_complaint',
    'symptoms',
    'duration_hours',
    'pain_score',
    'medical_history',
    'allergies',
    'pregnancy_status',
    'vitals_heart_rate_bpm',
    'vitals_systolic_bp',
    'vitals_diastolic_bp',
    'vitals_spo2_percent',
    'vitals_temperature_c',
    'vitals_respiratory_rate_bpm',
    'rule_based_red_flags',
    'provisional_urgency_label',
    'missing_information',
    'requires_healthcare_worker_review',
    'is_synthetic',
    'is_validated',
    'clinical_disclaimer',
  ];

  let caseCounter = 1;

  // Generate for a specific class
  function generateClassRecords(label, count, templates) {
    const languages = ['en', 'hi', 'or'];
    for (let i = 0; i < count; i++) {
      const caseId = `CASE-SYNTH-${String(caseCounter).padStart(4, '0')}`;
      const patientId = `PAT-SYNTH-${String(caseCounter).padStart(4, '0')}`;
      caseCounter++;

      const template = templates[i % templates.length];
      const lang = languages[i % 3]; // cyclical en, hi, or to ensure balanced language distribution

      const age = randInt(template.minAge, template.maxAge);
      const gender = choice(['MALE', 'FEMALE', 'FEMALE', 'MALE', 'OTHER']);

      // Pregnancy status logic
      let pregnancyStatus = 'not_applicable';
      if (gender === 'FEMALE' && age >= 12 && age <= 55) {
        if (template.rule && template.rule.includes('PREGNANCY')) {
          pregnancyStatus = 'yes';
        } else {
          pregnancyStatus = choice(['no', 'no', 'no', 'no', 'yes', 'unknown']);
        }
      }

      // Pain score
      let painScore = '';
      if (template.painMin !== null && template.painMax !== null) {
        painScore = randInt(template.painMin, template.painMax);
      }

      // Duration hours
      let durationHours = '';
      if (template.durationHours && template.durationHours.length > 0) {
        durationHours = choice(template.durationHours);
      }

      // Vitals
      const vitals = template.vitals();

      // Text
      const textData = template[lang] || template.en;
      const chiefComplaint = textData.cc;
      const symptoms = textData.sym;

      const medHistory = choice(COMMON_HISTORIES);
      const allergies = choice(COMMON_ALLERGIES);

      records.push([
        caseId,
        patientId,
        age,
        gender,
        lang,
        chiefComplaint,
        symptoms,
        durationHours,
        painScore,
        medHistory,
        allergies,
        pregnancyStatus,
        vitals.hr ?? '',
        vitals.sbp ?? '',
        vitals.dbp ?? '',
        vitals.spo2 ?? '',
        vitals.temp ?? '',
        vitals.rr ?? '',
        template.rule,
        label,
        template.missingInfo,
        'true',
        'true',
        'false',
        'SYNTHETIC_DATA_UNVALIDATED_FOR_STRUCTURAL_TESTING_ONLY_DO_NOT_USE_FOR_CLINICAL_DECISION_MAKING',
      ]);
    }
  }

  // 150 RED
  generateClassRecords('RED', 150, RED_TEMPLATES);
  // 150 YELLOW
  generateClassRecords('YELLOW', 150, YELLOW_TEMPLATES);
  // 150 GREEN
  generateClassRecords('GREEN', 150, GREEN_TEMPLATES);
  // 50 GREY
  generateClassRecords('GREY', 50, GREY_TEMPLATES);

  // Convert to CSV
  const csvLines = [
    header.join(','),
    ...records.map(row => row.map(escapeCSV).join(',')),
  ];

  const outPath = path.join(__dirname, '..', 'data', 'training', 'triage_cases_v2.csv');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, csvLines.join('\n') + '\n', 'utf8');

  console.log(`Generated ${records.length} records to ${outPath}`);
}

generateDataset();
