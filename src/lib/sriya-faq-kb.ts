/**
 * Sriya — Your TriageBridge Guide
 * Verified FAQ Knowledge Base
 * 
 * Structured and editable knowledge base for TriageBridge patient guidance.
 * All entries are reviewed and certified for safety and platform accuracy.
 * Never invent policy, pricing, payment or clinical information.
 */

export type FaqCategory =
  | 'GETTING_STARTED'
  | 'TRIAGE_AND_CASE_STATUS'
  | 'APPOINTMENTS'
  | 'HEALTH_DOCUMENTS'
  | 'OFFLINE_ACCESS'
  | 'PRIVACY_AND_SECURITY'
  | 'EMERGENCY_HELP';

export interface VerifiedFaqEntry {
  id: string;
  category: FaqCategory;
  categoryLabelEn: string;
  categoryLabelHi: string;
  categoryLabelOr: string;
  questionEn: string;
  questionHi: string;
  questionOr: string;
  verifiedAnswerEn: string;
  verifiedAnswerHi: string;
  verifiedAnswerOr: string;
  relatedRoute?: string;
  actionButtonLabelEn?: string;
  actionButtonLabelHi?: string;
  actionButtonLabelOr?: string;
  lastReviewedDate: string;
  keywords: string[];
}

export const VERIFIED_FAQ_DATABASE: VerifiedFaqEntry[] = [
  // ========================================================
  // 1. GETTING STARTED
  // ========================================================
  {
    id: 'faq-free-to-use',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'Is TriageBridge free to use?',
    questionHi: 'क्या TriageBridge का उपयोग निःशुल्क है?',
    questionOr: 'TriageBridge ବ୍ୟବହାର କରିବା କ’ଣ ମାଗଣା?',
    verifiedAnswerEn:
      'TriageBridge is currently a synthetic hackathon demonstration platform. No payment should be made through this prototype. Availability and pricing in a real deployment would be determined by the implementing healthcare institution.',
    verifiedAnswerHi:
      'TriageBridge वर्तमान में एक सिंथेटिक हैकाथॉन प्रदर्शन प्लेटफ़ॉर्म है। इस प्रोटोटाइप के माध्यम से कोई भुगतान नहीं किया जाना चाहिए। वास्तविक परिनियोजन में उपलब्धता और मूल्य निर्धारण कार्यान्वयन स्वास्थ्य संस्थान द्वारा निर्धारित किया जाएगा।',
    verifiedAnswerOr:
      'TriageBridge ବର୍ତ୍ତମାନ ଏକ ସିନ୍ଥେଟିକ୍ ହାକାଥନ୍ ଡେମୋନଷ୍ଟ୍ରେସନ୍ ପ୍ଲାଟଫର୍ମ। ଏହି ପ୍ରୋଟୋଟାଇପ୍ ମାଧ୍ୟମରେ କୌଣସି ଦେୟ ପ୍ରଦାନ କରାଯିବା ଉଚିତ୍ ନୁହେଁ। ବାସ୍ତବ ପ୍ରୟୋଗରେ ଉପଲବ୍ଧତା ଏବଂ ମୂଲ୍ୟ କାର୍ଯ୍ୟକାରୀ ସ୍ୱାସ୍ଥ୍ୟ ସଂସ୍ଥାନ ଦ୍ୱାରା ନିର୍ଦ୍ଧାରଣ କରାଯିବ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Open Dashboard',
    actionButtonLabelHi: 'डैशबोर्ड खोलें',
    actionButtonLabelOr: 'ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['free', 'cost', 'payment', 'charge', 'pricing', 'money', 'fees', 'paid', 'ମାଗଣା', 'ଫିସ', 'ଖର୍ଚ୍ଚ', 'पैसे', 'मुफ्त', 'फीस'],
  },
  {
    id: 'faq-access-dashboard',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'How do I access my dashboard?',
    questionHi: 'मैं अपने डैशबोर्ड तक कैसे पहुँचूँ?',
    questionOr: 'ମୁଁ ମୋ ଡ୍ୟାସବୋର୍ଡ କିପରି ଦେଖିବି?',
    verifiedAnswerEn:
      'You can access your patient dashboard anytime by selecting "Dashboard" in the top navigation or clicking the button below. Your dashboard displays active triage cases, upcoming clinic appointments, and recent health records.',
    verifiedAnswerHi:
      'आप शीर्ष नेविगेशन में "Dashboard" चुनकर या नीचे दिए गए बटन पर क्लिक करके किसी भी समय अपने मरीज़ डैशबोर्ड तक पहुँच सकते हैं। आपका डैशबोर्ड सक्रिय ट्राइएज मामले, आगामी क्लिनिक अपॉइंटमेंट और हाल के स्वास्थ्य रिकॉर्ड प्रदर्शित करता है।',
    verifiedAnswerOr:
      'ଆପଣ ଉପର ନେଭିଗେସନ୍‌ରେ "Dashboard" ବାଛି କିମ୍ବା ତଳେ ଥିବା ବଟନ୍ କ୍ଲିକ୍ କରି ଯେକୌଣସି ସମୟରେ ନିଜ ରୋଗୀ ଡ୍ୟାସବୋର୍ଡ ଦେଖିପାରିବେ। ଏଠାରେ ଆପଣଙ୍କ ସକ୍ରିୟ ଟ୍ରାଇଏଜ୍ କେସ୍, ଆଗାମୀ ଡାକ୍ତରୀ ଆପଏଣ୍ଟମେଣ୍ଟ ଓ ନୂତନ ରେକର୍ଡ ଦେଖାଯାଏ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Go to Dashboard',
    actionButtonLabelHi: 'डैशबोर्ड पर जाएँ',
    actionButtonLabelOr: 'ଡ୍ୟାସବୋର୍ଡକୁ ଯାଆନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['dashboard', 'home', 'main page', 'overview', 'ଡ୍ୟାସବୋର୍ଡ', 'ମୁଖ୍ୟ ପୃଷ୍ଠା', 'डैशबोर्ड', 'होम'],
  },
  {
    id: 'faq-change-language',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'How do I change the language?',
    questionHi: 'मैं भाषा कैसे बदलूँ?',
    questionOr: 'ମୁଁ ଭାଷା କିପରି ପରିବର୍ତ୍ତନ କରିବି?',
    verifiedAnswerEn:
      'You can switch the platform language anytime between English, Odia (ଓଡ଼ିଆ), and Hindi (हिन्दी) using the language selector in the top header or in your Patient Profile.',
    verifiedAnswerHi:
      'आप शीर्ष हेडर में या अपने मरीज़ प्रोफ़ाइल में भाषा चयनकर्ता का उपयोग करके अंग्रेजी, ओडिया (ଓଡ଼ିଆ), और हिन्दी (हिन्दी) के बीच कभी भी प्लेटफ़ॉर्म की भाषा बदल सकते हैं।',
    verifiedAnswerOr:
      'ଆପଣ ଉପର ହେଡରରେ ଥିବା ଭାଷା ଡ୍ରପ୍‌ଡାଉନ୍ କିମ୍ବା ନିଜ ପ୍ରୋଫାଇଲ୍ ବ୍ୟବହାର କରି ଇଂରାଜୀ, ଓଡ଼ିଆ (ଓଡ଼ିଆ) ଏବଂ ହିନ୍ଦୀ (हिन्दी) ମଧ୍ୟରେ ଯେକୌଣସି ସମୟରେ ଭାଷା ବଦଳାଇ ପାରିବେ।',
    relatedRoute: '/patient/profile',
    actionButtonLabelEn: 'Open Profile Settings',
    actionButtonLabelHi: 'प्रोफ़ाइल सेटिंग्स खोलें',
    actionButtonLabelOr: 'ପ୍ରୋଫାଇଲ୍ ସେଟିଙ୍ଗ୍ସ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['language', 'hindi', 'odia', 'english', 'locale', 'translate', 'ଭାଷା', 'ଓଡ଼ିଆ', 'ହିନ୍ଦୀ', 'भाषा', 'ओडिया', 'हिन्दी'],
  },
  {
    id: 'faq-update-profile',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'How do I update my profile?',
    questionHi: 'मैं अपनी प्रोफ़ाइल कैसे अपडेट करूँ?',
    questionOr: 'ମୁଁ ମୋ ପ୍ରୋଫାଇଲ୍ କିପରି ଅପଡେଟ୍ କରିବି?',
    verifiedAnswerEn:
      'Navigate to Patient Profile to review or update your contact information, emergency phone number, residence location, and accessibility preferences.',
    verifiedAnswerHi:
      'अपनी संपर्क जानकारी, आपातकालीन फ़ोन नंबर, निवास स्थान और पहुँच प्राथमिकताओं की समीक्षा करने या अपडेट करने के लिए मरीज़ प्रोफ़ाइल पर जाएँ।',
    verifiedAnswerOr:
      'ନିଜ ଯୋଗାଯୋଗ ନମ୍ବର, ଜରୁରୀକାଳୀନ ଫୋନ୍ ନମ୍ବର, ଠିକଣା ଓ ପସନ୍ଦ ଅପଡେଟ୍ କରିବାକୁ ରୋଗୀ ପ୍ରୋଫାଇଲ୍ ପୃଷ୍ଠାକୁ ଯାଆନ୍ତୁ।',
    relatedRoute: '/patient/profile',
    actionButtonLabelEn: 'Update Profile',
    actionButtonLabelHi: 'प्रोफ़ाइल अपडेट करें',
    actionButtonLabelOr: 'ପ୍ରୋଫାଇଲ୍ ଅପଡେଟ୍ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['profile', 'phone', 'address', 'location', 'name', 'emergency contact', 'ପ୍ରୋଫାଇଲ୍', 'ନାମ', 'ଫୋନ୍', 'प्रोफ़ाइल', 'पता', 'फ़ोन'],
  },
  {
    id: 'faq-logout',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'How do I log out?',
    questionHi: 'मैं लॉग आउट कैसे करूँ?',
    questionOr: 'ମୁଁ କିପରି ଲଗ୍ ଆଉଟ୍ କରିବି?',
    verifiedAnswerEn:
      'Click your user avatar icon in the top-right header and select "Logout". You can also use the Quick Demo Switcher bar at the very top of the screen to switch accounts or log out safely.',
    verifiedAnswerHi:
      'शीर्ष-दाएं हेडर में अपने उपयोगकर्ता अवतार आइकन पर क्लिक करें और "लॉगआउट" चुनें। आप खातों को सुरक्षित रूप से बदलने या लॉग आउट करने के लिए स्क्रीन के शीर्ष पर त्वरित डेमो स्विचर बार का भी उपयोग कर सकते हैं।',
    verifiedAnswerOr:
      'ଉପର ଡାହାଣ କୋଣରେ ଥିବା ନିଜ ୟୁଜର୍ ଆଇକନ୍ କ୍ଲିକ୍ କରି "Logout" ବାଛନ୍ତୁ। ଆପଣ ସ୍କ୍ରିନ୍‌ର ଉପରେ ଥିବା ଡେମୋ ସୁଇଚର୍ ବାର୍ ମଧ୍ୟ ବ୍ୟବହାର କରିପାରିବେ।',
    relatedRoute: '/role-select',
    actionButtonLabelEn: 'Switch Role or Log Out',
    actionButtonLabelHi: 'रोल बदलें या लॉग आउट करें',
    actionButtonLabelOr: 'ରୋଲ୍ ବଦଳାନ୍ତୁ ବା ଲଗ୍ ଆଉଟ୍ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['logout', 'sign out', 'exit', 'switch account', 'ଲଗ୍ ଆଉଟ୍', 'ବାହାରନ୍ତୁ', 'लॉगआउट', 'साइन आउट'],
  },

  // ========================================================
  // 2. TRIAGE AND CASE STATUS
  // ========================================================
  {
    id: 'faq-start-triage',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage & Case Status',
    categoryLabelHi: 'ट्राइएज और केस स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଓ କେସ୍ ସ୍ଥିତି',
    questionEn: 'How do I start a triage request?',
    questionHi: 'मैं ट्राइएज अनुरोध कैसे शुरू करूँ?',
    questionOr: 'ମୁଁ କିପରି ଟ୍ରାଇଏଜ୍ ଅନୁରୋଧ ଆରମ୍ଭ କରିବି?',
    verifiedAnswerEn:
      'Select "Start Triage" from your patient dashboard. Enter your symptoms, duration, available vital signs, and optional medical reports. After reviewing the explainable AI urgency suggestion, submit your case for healthcare-worker review.',
    verifiedAnswerHi:
      'अपने मरीज़ डैशबोर्ड से "Start Triage" चुनें। अपने लक्षण, अवधि, उपलब्ध वाइटल संकेत और वैकल्पिक मेडिकल रिपोर्ट दर्ज करें। एआई तात्कालिकता सुझाव की समीक्षा करने के बाद, स्वास्थ्य कर्मी की समीक्षा के लिए अपना मामला जमा करें।',
    verifiedAnswerOr:
      'ରୋଗୀ ଡ୍ୟାସବୋର୍ଡରୁ "Start Triage" ବାଛନ୍ତୁ। ନିଜ ଲକ୍ଷଣ, ସମୟ, ରକ୍ତଚାପ/ଅକ୍ସିଜେନ୍ ଆଦି ଭାଇଟାଲ୍ ଏବଂ ରିପୋର୍ଟ ପ୍ରଦାନ କରି ସମୀକ୍ଷା ପରେ ଡାକ୍ତରଙ୍କ ଯାଞ୍ଚ ପାଇଁ ଦାଖଲ କରନ୍ତୁ।',
    relatedRoute: '/patient/triage',
    actionButtonLabelEn: 'Start Triage',
    actionButtonLabelHi: 'ट्राइएज शुरू करें',
    actionButtonLabelOr: 'ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['start triage', 'new case', 'symptoms', 'assessment', 'submit case', 'ଟ୍ରାଇଏଜ୍', 'ନୂତନ କେସ୍', 'ଲକ୍ଷଣ', 'ट्राइएज', 'नया केस', 'लक्षण'],
  },
  {
    id: 'faq-use-voice-input',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage & Case Status',
    categoryLabelHi: 'ट्राइएज और केस स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଓ କେସ୍ ସ୍ଥିତି',
    questionEn: 'How do I use voice input?',
    questionHi: 'मैं वॉयस इनपुट का उपयोग कैसे करूँ?',
    questionOr: 'ମୁଁ ଭଏସ୍ ଇନପୁଟ୍ କିପରି ବ୍ୟବହାର କରିବି?',
    verifiedAnswerEn:
      'On Step 5 (Voice Description) of the triage wizard, select your spoken language—Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), or English. Tap the microphone icon and describe your symptoms. Speech is transcribed in its native script without Roman transliteration, and you can edit the text before saving.',
    verifiedAnswerHi:
      'ट्राइएज विज़ार्ड के चरण 5 (वॉयस विवरण) पर, अपनी बोली जाने वाली भाषा चुनें—ओडिया (ଓଡ଼ିଆ), हिन्दी (हिन्दी), या अंग्रेजी। माइक्रोफ़ोन आइकन पर टैप करें और अपने लक्षणों का वर्णन करें। भाषण को बिना रोमन लिप्यंतरण के उसकी मूल लिपि में ट्रांसक्राइब किया जाता है, और आप सहेजने से पहले पाठ को संपादित कर सकते हैं।',
    verifiedAnswerOr:
      'ଟ୍ରାଇଏଜ୍‌ର ୫ମ ପାହାଚ (ଭଏସ୍)ରେ ନିଜ ଭାଷା—ଓଡ଼ିଆ (ଓଡ଼ିଆ), ହିନ୍ଦୀ (हिन्दी) କିମ୍ବା ଇଂରାଜୀ ବାଛନ୍ତୁ। ମାଇକ୍ରୋଫୋନ୍ ଛୁଇଁ ନିଜ ଲକ୍ଷଣ କୁହନ୍ତୁ। ଏହା ଓଡ଼ିଆ ଅକ୍ଷରରେ ଟାଇପ୍ ହେବ ଏବଂ ଆପଣ ଏହାକୁ ସଂଶୋଧନ କରିପାରିବେ।',
    relatedRoute: '/patient/triage',
    actionButtonLabelEn: 'Open Triage Voice Studio',
    actionButtonLabelHi: 'वॉयस स्टूडियो खोलें',
    actionButtonLabelOr: 'ଭଏସ୍ ଷ୍ଟୁଡିଓ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['voice', 'microphone', 'speech', 'mic', 'speak', 'audio', 'recording', 'ଭଏସ୍', 'ସ୍ୱର', 'ମାଇକ୍', 'କଥା', 'वॉयस', 'माइक', 'बोलें', 'ऑडियो'],
  },
  {
    id: 'faq-check-case-status',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage & Case Status',
    categoryLabelHi: 'ट्राइएज और केस स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଓ କେସ୍ ସ୍ଥିତି',
    questionEn: 'How do I check my case status?',
    questionHi: 'मैं अपने केस की स्थिति कैसे देखूँ?',
    questionOr: 'ମୁଁ ମୋ କେସ୍ ସ୍ଥିତି କିପରି ଜାଣିବି?',
    verifiedAnswerEn:
      'Open "My Cases" from the navigation bar. You can view whether your case is Submitted, Under Review by a doctor, Verified, or whether more clinical information was requested.',
    verifiedAnswerHi:
      'नेविगेशन बार से "My Cases" खोलें। आप देख सकते हैं कि आपका मामला जमा कर दिया गया है, डॉक्टर द्वारा समीक्षाधीन है, सत्यापित है, या अधिक नैदानिक जानकारी का अनुरोध किया गया है।',
    verifiedAnswerOr:
      'ନେଭିଗେସନ୍‌ରୁ "My Cases" ଖୋଲନ୍ତୁ। ଆପଣଙ୍କ କେସ୍ ଦାଖଲ ହୋଇଛି, ଡାକ୍ତର ସମୀକ୍ଷା କରୁଛନ୍ତି, ଯାଞ୍ଚ ଶେଷ ହୋଇଛି କି ଅଧିକ ତଥ୍ୟ ଆବଶ୍ୟକ ତାହା ଏଠାରେ ଦେଖିପାରିବେ।',
    relatedRoute: '/patient/cases',
    actionButtonLabelEn: 'View My Cases',
    actionButtonLabelHi: 'मेरे केस देखें',
    actionButtonLabelOr: 'ମୋ କେସ୍ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['case status', 'track case', 'status', 'submitted', 'review', 'କେସ୍ ସ୍ଥିତି', 'ଟ୍ରାକ୍', 'केस स्थिति', 'ट्रैक केस', 'स्टेटस'],
  },
  {
    id: 'faq-urgency-colors',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage & Case Status',
    categoryLabelHi: 'ट्राइएज और केस स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଓ କେସ୍ ସ୍ଥିତି',
    questionEn: 'What do RED, YELLOW, GREEN and GREY mean?',
    questionHi: 'RED, YELLOW, GREEN और GREY का क्या अर्थ है?',
    questionOr: 'RED, YELLOW, GREEN ଏବଂ GREY ର ଅର୍ଥ କ’ଣ?',
    verifiedAnswerEn:
      'These represent standardized clinical triage urgency categories: RED indicates immediate emergency resuscitation; YELLOW indicates urgent medical evaluation recommended; GREEN indicates non-urgent routine OPD care; and GREY indicates mild symptoms suitable for self-care or tele-consultation. Final care decisions are always made by a doctor.',
    verifiedAnswerHi:
      'ये मानकीकृत नैदानिक ट्राइएज तात्कालिकता श्रेणियों का प्रतिनिधित्व करते हैं: RED तत्काल आपातकालीन पुनर्जीवन को दर्शाता है; YELLOW अनुशंसित तत्काल चिकित्सा मूल्यांकन को दर्शाता है; GREEN गैर-जरूरी नियमित ओपीडी देखभाल को दर्शाता है; और GREY स्व-देखभाल या टेली-परामर्श के लिए उपयुक्त हल्के लक्षणों को दर्शाता है।',
    verifiedAnswerOr:
      'ଏଗୁଡ଼ିକ ଡାକ୍ତରୀ ଜରୁରୀକାଳୀନ ବର୍ଗ ଅଟେ: RED ଅର୍ଥାତ୍ ଅତି ଜରୁରୀ ଆପାତକାଳୀନ ଚିକିତ୍ସା; YELLOW ଅର୍ଥାତ୍ ଶୀଘ୍ର ଡାକ୍ତରୀ ଯାଞ୍ଚ ଆବଶ୍ୟକ; GREEN ଅର୍ଥାତ୍ ସାଧାରଣ OPD ପରାମର୍ଶ; ଏବଂ GREY ଅର୍ଥାତ୍ ସାମାନ୍ୟ ଲକ୍ଷଣ ବା ଘରୋଇ ଯତ୍ନ। ଶେଷ ନିଷ୍ପତ୍ତି ଡାକ୍ତରଙ୍କ ଦ୍ୱାରା ନିଆଯାଏ।',
    relatedRoute: '/patient/cases',
    actionButtonLabelEn: 'Learn in My Cases',
    actionButtonLabelHi: 'केस विवरण देखें',
    actionButtonLabelOr: 'କେସ୍ ବିବରଣୀ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['red', 'yellow', 'green', 'grey', 'urgency', 'color', 'emergency', 'ରଙ୍ଗ', 'ଲାଲ', 'ହଳଦିଆ', 'ସବୁଜ', 'लाल', 'पीला', 'हरा', 'रंग'],
  },
  {
    id: 'faq-contact-hcw',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage & Case Status',
    categoryLabelHi: 'ट्राइएज और केस स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଓ କେସ୍ ସ୍ଥିତି',
    questionEn: 'How do I contact a healthcare professional?',
    questionHi: 'मैं किसी स्वास्थ्य पेशेवर से कैसे संपर्क करूँ?',
    questionOr: 'ମୁଁ ଜଣେ ସ୍ୱାସ୍ଥ୍ୟକର୍ମୀ ବା ଡାକ୍ତରଙ୍କ ସହ କିପରି ଯୋଗାଯୋଗ କରିବି?',
    verifiedAnswerEn:
      'Once a healthcare worker reviews your triage case, their clinical notes, recommended actions, and facility appointment will appear directly inside the case details. For immediate visits, refer to the Appointments section.',
    verifiedAnswerHi:
      'एक बार जब कोई स्वास्थ्य कार्यकर्ता आपके ट्राइएज मामले की समीक्षा कर लेता है, तो उनके नैदानिक नोट्स, अनुशंसित कार्रवाई और सुविधा अपॉइंटमेंट सीधे केस विवरण के अंदर दिखाई देंगे। तत्काल मुलाक़ात के लिए, अपॉइंटमेंट अनुभाग देखें।',
    verifiedAnswerOr:
      'ସ୍ୱାସ୍ଥ୍ୟକର୍ମୀ ଆପଣଙ୍କ କେସ୍ ସମୀକ୍ଷା କଲା ପରେ ତାଙ୍କ ପରାମର୍ଶ ଓ ଆପଏଣ୍ଟମେଣ୍ଟ କେସ୍ ବିବରଣୀରେ ଦେଖାଯିବ। ଅଧିକ ପରାମର୍ଶ ପାଇଁ ଆପଏଣ୍ଟମେଣ୍ଟ ବିଭାଗ ଦେଖନ୍ତୁ।',
    relatedRoute: '/patient/cases',
    actionButtonLabelEn: 'View Case Notes',
    actionButtonLabelHi: 'केस नोट्स देखें',
    actionButtonLabelOr: 'କେସ୍ ନୋଟ୍ସ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['doctor', 'nurse', 'contact', 'healthcare worker', 'specialist', 'ଡାକ୍ତର', 'ଯୋଗାଯୋଗ', 'ଡାକ୍ତରଖାନା', 'डॉक्टर', 'नर्स', 'संपर्क'],
  },

  // ========================================================
  // 3. APPOINTMENTS
  // ========================================================
  {
    id: 'faq-find-appointment-letters',
    category: 'APPOINTMENTS',
    categoryLabelEn: 'Appointments',
    categoryLabelHi: 'अपॉइंटमेंट',
    categoryLabelOr: 'ଡାକ୍ତରୀ ଆପଏଣ୍ଟମେଣ୍ଟ',
    questionEn: 'Where can I find my appointment letters?',
    questionHi: 'मुझे अपने अपॉइंटमेंट पत्र कहाँ मिल सकते हैं?',
    questionOr: 'ମୋର ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି ମୁଁ କେଉଁଠାରେ ପାଇବି?',
    verifiedAnswerEn:
      'You can find your appointment letters and slips under Patient Dashboard → Appointments. Each scheduled visit lists hospital department, doctor name, date, time, room number, and downloadable slip.',
    verifiedAnswerHi:
      'आप अपने अपॉइंटमेंट पत्र और पर्चियां मरीज़ डैशबोर्ड → Appointments के अंतर्गत पा सकते हैं। प्रत्येक निर्धारित मुलाक़ात में अस्पताल विभाग, डॉक्टर का नाम, तिथि, समय, कमरा संख्या और डाउनलोड करने योग्य पर्ची सूचीबद्ध होती है।',
    verifiedAnswerOr:
      'ଆପଣ ନିଜ ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି ଓ ସ୍ଲିପ୍ ରୋଗୀ ଡ୍ୟାସବୋର୍ଡ → Appointments ବିଭାଗରେ ପାଇପାରିବେ। ଏଥିରେ ଡାକ୍ତରଖାନା, ଡାକ୍ତରଙ୍କ ନାମ, ତାରିଖ, ସମୟ ଓ ଡାଉନଲୋଡ୍ ସ୍ଲିପ୍ ଥାଏ।',
    relatedRoute: '/patient/appointments',
    actionButtonLabelEn: 'Open Appointments',
    actionButtonLabelHi: 'अपॉइंटमेंट खोलें',
    actionButtonLabelOr: 'ଆପଏଣ୍ଟମେଣ୍ଟ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['appointment letter', 'slip', 'appointment', 'booking', 'visit', 'letter', 'ଆପଏଣ୍ଟମେଣ୍ଟ', 'ଚିଠି', 'ସ୍ଲିପ୍', 'अपॉइंटमेंट', 'पत्र', 'पर्ची'],
  },
  {
    id: 'faq-view-upcoming-appointments',
    category: 'APPOINTMENTS',
    categoryLabelEn: 'Appointments',
    categoryLabelHi: 'अपॉइंटमेंट',
    categoryLabelOr: 'ଡାକ୍ତରୀ ଆପଏଣ୍ଟମେଣ୍ଟ',
    questionEn: 'How do I view upcoming appointments?',
    questionHi: 'मैं आगामी अपॉइंटमेंट कैसे देखूँ?',
    questionOr: 'ମୁଁ ଆଗାମୀ ଆପଏଣ୍ଟମେଣ୍ଟ କିପରି ଦେଖିବି?',
    verifiedAnswerEn:
      'Upcoming appointments are displayed on your main dashboard in the "Upcoming Appointment" card and in the dedicated Appointments tab, sorted by nearest date.',
    verifiedAnswerHi:
      'आगामी अपॉइंटमेंट आपके मुख्य डैशबोर्ड पर "Upcoming Appointment" कार्ड में और समर्पित अपॉइंटमेंट टैब में निकटतम तिथि के अनुसार क्रमबद्ध दिखाई देते हैं।',
    verifiedAnswerOr:
      'ଆଗାମୀ ଆପଏଣ୍ଟମେଣ୍ଟ ଆପଣଙ୍କ ମୁଖ୍ୟ ଡ୍ୟାସବୋର୍ଡ କାର୍ଡରେ ଏବଂ Appointments ବିଭାଗରେ ତାରିଖ କ୍ରମରେ ସ୍ପଷ୍ଟ ଦେଖାଯାଏ।',
    relatedRoute: '/patient/appointments',
    actionButtonLabelEn: 'View Upcoming Visits',
    actionButtonLabelHi: 'आगामी मुलाक़ातें देखें',
    actionButtonLabelOr: 'ଆଗାମୀ ଆପଏଣ୍ଟମେଣ୍ଟ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['upcoming', 'scheduled', 'next visit', 'clinic date', 'ଆଗାମୀ', 'ତାରିଖ', 'आगामी', 'तारीख'],
  },
  {
    id: 'faq-download-appointment-letter',
    category: 'APPOINTMENTS',
    categoryLabelEn: 'Appointments',
    categoryLabelHi: 'अपॉइंटमेंट',
    categoryLabelOr: 'ଡାକ୍ତରୀ ଆପଏଣ୍ଟମେଣ୍ଟ',
    questionEn: 'How do I download an appointment letter?',
    questionHi: 'मैं अपॉइंटमेंट पत्र कैसे डाउनलोड करूँ?',
    questionOr: 'ମୁଁ ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି କିପରି ଡାଉନଲୋଡ୍ କରିବି?',
    verifiedAnswerEn:
      'Navigate to Appointments, select the appointment card, and click "Download Appointment Slip" to save a secure authenticated PDF slip to your phone or computer.',
    verifiedAnswerHi:
      'Appointments पर जाएँ, अपॉइंटमेंट कार्ड चुनें, और अपने फ़ोन या कंप्यूटर पर एक सुरक्षित प्रमाणित पीडीएफ पर्ची सहेजने के लिए "Download Appointment Slip" पर क्लिक करें।',
    verifiedAnswerOr:
      'Appointments କୁ ଯାଇ ସେହି ଆପଏଣ୍ଟମେଣ୍ଟ କାର୍ଡରୁ "Download Appointment Slip" କ୍ଲିକ୍ କରି ନିଜ ଫୋନ୍ ବା କମ୍ପ୍ୟୁଟରରେ PDF ସ୍ଲିପ୍ ସେଭ୍ କରନ୍ତୁ।',
    relatedRoute: '/patient/appointments',
    actionButtonLabelEn: 'Download Appointment Slip',
    actionButtonLabelHi: 'अपॉइंटमेंट पर्ची डाउनलोड करें',
    actionButtonLabelOr: 'ଆପଏଣ୍ଟମେଣ୍ଟ ସ୍ଲିପ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['download', 'pdf', 'slip download', 'print', 'ଡାଉନଲୋଡ୍', 'ପିଡିଏଫ୍', 'डाउनलोड', 'पीडीएफ'],
  },

  // ========================================================
  // 4. HEALTH DOCUMENTS
  // ========================================================
  {
    id: 'faq-upload-medical-report',
    category: 'HEALTH_DOCUMENTS',
    categoryLabelEn: 'Health Documents',
    categoryLabelHi: 'स्वास्थ्य दस्तावेज़',
    categoryLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଦସ୍ତାବିଜ୍',
    questionEn: 'How do I upload a medical report?',
    questionHi: 'मैं मेडिकल रिपोर्ट कैसे अपलोड करूँ?',
    questionOr: 'ମୁଁ ଏକ ମେଡିକାଲ୍ ରିପୋର୍ଟ କିପରି ଅପଲୋଡ୍ କରିବି?',
    verifiedAnswerEn:
      'Open Health Documents and select "Upload Document". Choose a PDF, JPG, JPEG, or PNG file up to 15MB. Review the OCR-extracted text before saving it.',
    verifiedAnswerHi:
      'Health Documents खोलें और "Upload Document" चुनें। 15MB तक की PDF, JPG, JPEG या PNG फ़ाइल चुनें। इसे सहेजने से पहले ओसीआर द्वारा निकाले गए पाठ की समीक्षा करें।',
    verifiedAnswerOr:
      'Health Documents ଖୋଲି "Upload Document" ଚୟନ କରନ୍ତୁ। ୧୫MB ପର୍ଯ୍ୟନ୍ତ PDF, JPG, JPEG ବା PNG ଫାଇଲ୍ ବାଛନ୍ତୁ ଏବଂ ସେଭ୍ କରିବା ପୂର୍ବରୁ OCR ତଥ୍ୟ ଯାଞ୍ଚ କରନ୍ତୁ।',
    relatedRoute: '/patient/documents',
    actionButtonLabelEn: 'Open Health Documents',
    actionButtonLabelHi: 'स्वास्थ्य दस्तावेज़ खोलें',
    actionButtonLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଦସ୍ତାବିଜ୍ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['upload', 'report', 'file', 'prescription', 'ecg', 'lab', 'ଅପଲୋଡ୍', 'ରିପୋର୍ଟ', 'ଫାଇଲ୍', 'अपलोड', 'रिपोर्ट', 'दस्तावेज़'],
  },
  {
    id: 'faq-where-uploaded-documents',
    category: 'HEALTH_DOCUMENTS',
    categoryLabelEn: 'Health Documents',
    categoryLabelHi: 'स्वास्थ्य दस्तावेज़',
    categoryLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଦସ୍ତାବିଜ୍',
    questionEn: 'Where are my uploaded documents?',
    questionHi: 'मेरे अपलोड किए गए दस्तावेज़ कहाँ हैं?',
    questionOr: 'ମୋର ଅପଲୋଡ୍ ହୋଇଥିବା ଦସ୍ତାବିଜ୍ କେଉଁଠାରେ ଅଛି?',
    verifiedAnswerEn:
      'All your uploaded lab reports, prescriptions, and scans are organized in your private Health Documents vault, sorted latest first. You can preview, download, or delete them anytime.',
    verifiedAnswerHi:
      'आपकी सभी अपलोड की गई लैब रिपोर्ट, नुस्खे और स्कैन आपके निजी Health Documents वॉल्ट में व्यवस्थित हैं, जो नवीनतम पहले क्रमबद्ध हैं। आप उन्हें कभी भी देख, डाउनलोड या हटा सकते हैं।',
    verifiedAnswerOr:
      'ଆପଣଙ୍କ ସମସ୍ତ ପରୀକ୍ଷା ରିପୋର୍ଟ, ଔଷଧ ଚିଠା ଓ ସ୍କାନ୍ Health Documents ଭଲ୍ଟରେ ସୁରକ୍ଷିତ ଥାଏ। ଆପଣ ଏଗୁଡ଼ିକୁ ଯେକୌଣସି ସମୟରେ ଦେଖିପାରିବେ ବା ଡାଉନଲୋଡ୍ କରିପାରିବେ।',
    relatedRoute: '/patient/documents',
    actionButtonLabelEn: 'View Document Vault',
    actionButtonLabelHi: 'दस्तावेज़ वॉल्ट देखें',
    actionButtonLabelOr: 'ଦସ୍ତାବିଜ୍ ଭଲ୍ଟ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['documents', 'vault', 'records', 'files', 'reports', 'ଭଲ୍ଟ', 'ରେକର୍ଡ', 'ଫାଇଲ୍', 'दस्तावेज़', 'वॉल्ट', 'फ़ाइलें'],
  },
  {
    id: 'faq-share-document-with-doctor',
    category: 'HEALTH_DOCUMENTS',
    categoryLabelEn: 'Health Documents',
    categoryLabelHi: 'स्वास्थ्य दस्तावेज़',
    categoryLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଦସ୍ତାବିଜ୍',
    questionEn: 'How do I share a document with a doctor?',
    questionHi: 'मैं डॉक्टर के साथ दस्तावेज़ कैसे साझा करूँ?',
    questionOr: 'ମୁଁ ଡାକ୍ତରଙ୍କ ସହିତ ଏକ ଦସ୍ତାବିଜ୍ କିପରି ସେୟାର୍ କରିବି?',
    verifiedAnswerEn:
      'In Health Documents, click "Share Access" on any document. Select an authorized healthcare provider or case. You can set an expiration time and revoke access at any moment.',
    verifiedAnswerHi:
      'Health Documents में, किसी भी दस्तावेज़ पर "Share Access" पर क्लिक करें। किसी अधिकृत स्वास्थ्य सेवा प्रदाता या केस का चयन करें। आप समाप्ति समय निर्धारित कर सकते हैं और किसी भी समय एक्सेस रद्द कर सकते हैं।',
    verifiedAnswerOr:
      'Health Documents ରେ ଯେକୌଣସି ଦସ୍ତାବିଜ୍ ଉପରେ "Share Access" କ୍ଲିକ୍ କରନ୍ତୁ। ଡାକ୍ତର ବା କେସ୍ ବାଛି ସମୟସୀମା ସ୍ଥିର କରନ୍ତୁ। ଆପଣ ଯେକୌଣସି ସମୟରେ ଏହାକୁ ବନ୍ଦ କରିପାରିବେ।',
    relatedRoute: '/patient/documents/sharing',
    actionButtonLabelEn: 'Open Sharing Controls',
    actionButtonLabelHi: 'शेयरिंग नियंत्रण खोलें',
    actionButtonLabelOr: 'ସେୟାରିଂ ନିୟନ୍ତ୍ରଣ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['share', 'doctor share', 'consent', 'permission', 'revoke', 'ସେୟାର୍', 'ଅନୁମତି', 'ଡାକ୍ତରଙ୍କୁ ଦିଅନ୍ତୁ', 'साझा', 'सहमति', 'डॉक्टर को दें'],
  },
  {
    id: 'faq-how-ocr-works',
    category: 'HEALTH_DOCUMENTS',
    categoryLabelEn: 'Health Documents',
    categoryLabelHi: 'स्वास्थ्य दस्तावेज़',
    categoryLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଦସ୍ତାବିଜ୍',
    questionEn: 'How does OCR extraction work?',
    questionHi: 'ओसीआर निष्कर्षण कैसे काम करता है?',
    questionOr: 'OCR ପାଠ୍ୟ ଚିହ୍ନଟ କିପରି କାମ କରେ?',
    verifiedAnswerEn:
      'Optical Character Recognition (OCR) applies canvas image enhancement (orientation correction, contrast stretching, noise reduction) to scan text from reports. Unverified OCR output is never used for clinical decisions until verified by you or a clinician.',
    verifiedAnswerHi:
      'ऑप्टिकल कैरेक्टर रिकग्निशन (OCR) रिपोर्ट से टेक्स्ट स्कैन करने के लिए इमेज एन्हांसमेंट लागू करता है। असत्यापित ओसीआर आउटपुट का उपयोग आपके या किसी चिकित्सक द्वारा सत्यापित होने तक नैदानिक निर्णयों के लिए कभी नहीं किया जाता है।',
    verifiedAnswerOr:
      'ଅପ୍ଟିକାଲ୍ କ୍ୟାରେକ୍ଟର୍ ରିକଗ୍ନିସନ୍ (OCR) ଇମେଜ୍ ପରିଷ୍କାର କରି ରିପୋର୍ଟରୁ ତଥ୍ୟ ଖୋଜେ। ଏହାକୁ ଡାକ୍ତର ବା ରୋଗୀ ଯାଞ୍ଚ ନକରିବା ପର୍ଯ୍ୟନ୍ତ କଦାପି ଚିକିତ୍ସା ନିଷ୍ପତ୍ତିରେ ବ୍ୟବହାର କରାଯାଏ ନାହିଁ।',
    relatedRoute: '/patient/documents',
    actionButtonLabelEn: 'Learn in Documents',
    actionButtonLabelHi: 'दस्तावेज़ में देखें',
    actionButtonLabelOr: 'ଦସ୍ତାବିଜ୍‌ରେ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['ocr', 'text extraction', 'scan', 'read report', 'ଓସିଆର', 'ପାଠ୍ୟ', 'ସ୍କାନ', 'ओसीआर', 'स्कैन', 'टेक्स्ट'],
  },

  // ========================================================
  // 5. OFFLINE ACCESS
  // ========================================================
  {
    id: 'faq-use-without-internet',
    category: 'OFFLINE_ACCESS',
    categoryLabelEn: 'Offline Access',
    categoryLabelHi: 'ऑफ़लाइन पहुँच',
    categoryLabelOr: 'ଅଫଲାଇନ୍ ସୁବିଧା',
    questionEn: 'Can I use TriageBridge without internet?',
    questionHi: 'क्या मैं इंटरनेट के बिना TriageBridge का उपयोग कर सकता हूँ?',
    questionOr: 'ମୁଁ ଇଣ୍ଟରନେଟ୍ ବିନା TriageBridge ବ୍ୟବହାର କରିପାରିବି କି?',
    verifiedAnswerEn:
      'Yes! TriageBridge includes full offline support. You can fill out triage forms, save drafts, view cached appointments, and browse verified Sriya FAQs without internet. All data is safely stored in local IndexedDB storage.',
    verifiedAnswerHi:
      'हाँ! TriageBridge में पूर्ण ऑफ़लाइन समर्थन शामिल है। आप इंटरनेट के बिना ट्राइएज फ़ॉर्म भर सकते हैं, ड्राफ़्ट सहेज सकते हैं, कैश्ड अपॉइंटमेंट देख सकते हैं और सत्यापित श्रिया अक्सर पूछे जाने वाले प्रश्न ब्राउज़ कर सकते हैं।',
    verifiedAnswerOr:
      'ହଁ! TriageBridge ରେ ସମ୍ପୂର୍ଣ୍ଣ ଅଫଲାଇନ୍ ସୁବିଧା ଅଛି। ଆପଣ ଇଣ୍ଟରନେଟ୍ ବିନା ଟ୍ରାଇଏଜ୍ ଫର୍ମ ଭରିପାରିବେ, ଡ୍ରାଫ୍ଟ ସେଭ୍ କରିପାରିବେ ଏବଂ ଆପଏଣ୍ଟମେଣ୍ଟ ଦେଖିପାରିବେ। ତଥ୍ୟ ଆପଣଙ୍କ ଫୋନ୍‌ରେ ସୁରକ୍ଷିତ ରହେ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Open Dashboard',
    actionButtonLabelHi: 'डैशबोर्ड खोलें',
    actionButtonLabelOr: 'ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['offline', 'no internet', 'network', 'disconnected', 'ଅଫଲାଇନ୍', 'ଇଣ୍ଟରନେଟ୍ ନାହିଁ', 'ऑफ़लाइन', 'इंटरनेट नहीं', 'नेटवर्क'],
  },
  {
    id: 'faq-pending-sync-meaning',
    category: 'OFFLINE_ACCESS',
    categoryLabelEn: 'Offline Access',
    categoryLabelHi: 'ऑफ़लाइन पहुँच',
    categoryLabelOr: 'ଅଫଲାଇନ୍ ସୁବିଧା',
    questionEn: 'What does “Pending Sync” mean?',
    questionHi: '“Pending Sync” का क्या अर्थ है?',
    questionOr: '“Pending Sync” ର ଅର୍ଥ କ’ଣ?',
    verifiedAnswerEn:
      '“Pending Sync” means your triage assessment or document was saved securely on your device while offline. It has a unique idempotency key to prevent duplication and will automatically upload once internet reconnects.',
    verifiedAnswerHi:
      '“Pending Sync” का अर्थ है कि आपका ट्राइएज मूल्यांकन या दस्तावेज़ ऑफ़लाइन रहते हुए आपके डिवाइस पर सुरक्षित रूप से सहेजा गया था। इसमें दोहराव को रोकने के लिए एक विशिष्ट पहचानकर्ता है और इंटरनेट पुनः कनेक्ट होने पर यह स्वचालित रूप से अपलोड हो जाएगा।',
    verifiedAnswerOr:
      '“Pending Sync” ର ଅର୍ଥ ହେଉଛି ଆପଣଙ୍କ ତଥ୍ୟ ଅଫଲାଇନ୍ ସମୟରେ ନିଜ ଫୋନ୍‌ରେ ସୁରକ୍ଷିତ ସେଭ୍ ହୋଇଛି। ଇଣ୍ଟରନେଟ୍ ଆସିବା ମାତ୍ରେ ଏହା ବିନା ଡୁପ୍ଲିକେଟ୍‌ରେ ଡାକ୍ତରଖାନାକୁ ଅପଲୋଡ୍ ହୋଇଯିବ।',
    relatedRoute: '/patient/cases',
    actionButtonLabelEn: 'Check Sync Status',
    actionButtonLabelHi: 'सिंक स्थिति देखें',
    actionButtonLabelOr: 'ସିଙ୍କ ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['pending sync', 'sync', 'offline queue', 'uploading later', 'ସିଙ୍କ', 'ଅପଲୋଡ୍ ବାକି', 'पेंडिंग सिंक', 'सिंक स्थिति'],
  },
  {
    id: 'faq-reconnecting-upload',
    category: 'OFFLINE_ACCESS',
    categoryLabelEn: 'Offline Access',
    categoryLabelHi: 'ऑफ़लाइन पहुँच',
    categoryLabelOr: 'ଅଫଲାଇନ୍ ସୁବିଧା',
    questionEn: 'Will my information be uploaded after reconnecting?',
    questionHi: 'क्या पुनः कनेक्ट होने के बाद मेरी जानकारी अपलोड हो जाएगी?',
    questionOr: 'ଇଣ୍ଟରନେଟ୍ ଆସିବା ପରେ ମୋ ତଥ୍ୟ ଆପେ ଅପଲୋଡ୍ ହେବ କି?',
    verifiedAnswerEn:
      'Yes, automatically. The offline sync engine detects connectivity restoration and synchronizes your pending submissions with Supabase while guaranteeing idempotency so no record is duplicated.',
    verifiedAnswerHi:
      'हाँ, स्वतः। ऑफ़लाइन सिंक इंजन कनेक्टिविटी बहाली का पता लगाता है और आपके लंबित सबमिशन को सुरक्षित रूप से सिंक्रनाइज़ करता है ताकि कोई रिकॉर्ड दोहराया न जाए।',
    verifiedAnswerOr:
      'ହଁ, ସ୍ୱୟଂଚାଳିତ ଭାବେ। ନେଟୱର୍କ ଆସିବା କ୍ଷଣି ସିଙ୍କ ଇଞ୍ଜିନ୍ ଆପଣଙ୍କ ପେଣ୍ଡିଂ ତଥ୍ୟକୁ ସୁରକ୍ଷିତ ଭାବେ ଅପଲୋଡ୍ କରିଦେବ।',
    relatedRoute: '/patient/cases',
    actionButtonLabelEn: 'Track My Cases',
    actionButtonLabelHi: 'मेरे केस ट्रैक करें',
    actionButtonLabelOr: 'ମୋ କେସ୍ ଟ୍ରାକ୍ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['reconnect', 'auto upload', 'synchronization', 'ସିଙ୍କ୍ରୋନାଇଜ୍', 'ଅପଲୋଡ୍', 'पुनः कनेक्ट', 'ऑटो अपलोड'],
  },

  // ========================================================
  // 6. PRIVACY AND SECURITY
  // ========================================================
  {
    id: 'faq-health-info-secure',
    category: 'PRIVACY_AND_SECURITY',
    categoryLabelEn: 'Privacy & Security',
    categoryLabelHi: 'गोपनीयता और सुरक्षा',
    categoryLabelOr: 'ଗୋପନୀୟତା ଓ ସୁରକ୍ଷା',
    questionEn: 'Is my health information secure?',
    questionHi: 'क्या मेरी स्वास्थ्य जानकारी सुरक्षित है?',
    questionOr: 'ମୋ ସ୍ୱାସ୍ଥ୍ୟ ତଥ୍ୟ ସୁରକ୍ଷିତ କି?',
    verifiedAnswerEn:
      'Yes. TriageBridge uses Postgres Row-Level Security (RLS), masked Aadhaar identity numbers, and encrypted storage. Only you and explicitly authorized clinicians can view your records.',
    verifiedAnswerHi:
      'हाँ। TriageBridge पोस्टग्रेज रो-लेवल सिक्योरिटी (RLS), मास्क किए गए आधार पहचान संख्या और एन्क्रिप्टेड स्टोरेज का उपयोग करता है। केवल आप और स्पष्ट रूप से अधिकृत चिकित्सक ही आपके रिकॉर्ड देख सकते हैं।',
    verifiedAnswerOr:
      'ହଁ। TriageBridge ରେ ରୋ-ଲେଭେଲ ସୁରକ୍ଷା (RLS), ମାସ୍କ ଆଧାର ନମ୍ବର ଏବଂ ଏନକ୍ରିପ୍ଟେଡ୍ ଷ୍ଟୋରେଜ୍ ବ୍ୟବହାର ହୁଏ। କେବଳ ଆପଣ ଓ ଅନୁମତିପ୍ରାପ୍ତ ଡାକ୍ତର ହିଁ ଏହା ଦେଖିପାରିବେ।',
    relatedRoute: '/patient/privacy',
    actionButtonLabelEn: 'Review Privacy Controls',
    actionButtonLabelHi: 'गोपनीयता नियंत्रण देखें',
    actionButtonLabelOr: 'ଗୋପନୀୟତା ନିୟନ୍ତ୍ରଣ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['secure', 'privacy', 'safe', 'data protection', 'rls', 'ସୁରକ୍ଷା', 'ଗୋପନୀୟତା', 'सुरक्षा', 'गोपनीयता', 'सुरक्षित'],
  },
  {
    id: 'faq-who-views-documents',
    category: 'PRIVACY_AND_SECURITY',
    categoryLabelEn: 'Privacy & Security',
    categoryLabelHi: 'गोपनीयता और सुरक्षा',
    categoryLabelOr: 'ଗୋପନୀୟତା ଓ ସୁରକ୍ଷା',
    questionEn: 'Who can view my medical documents?',
    questionHi: 'मेरे मेडिकल दस्तावेज़ कौन देख सकता है?',
    questionOr: 'ମୋର ମେଡିକାଲ୍ ଦସ୍ତାବିଜ୍ କିଏ ଦେଖିପାରିବେ?',
    verifiedAnswerEn:
      'Only you and authorized healthcare workers assigned to your care or granted explicit consent by you can view your documents. Anonymous users and other patients have zero access.',
    verifiedAnswerHi:
      'केवल आप और आपकी देखभाल के लिए सौंपे गए अधिकृत स्वास्थ्य कार्यकर्ता या आपके द्वारा स्पष्ट सहमति दिए गए कार्यकर्ता ही आपके दस्तावेज़ देख सकते हैं। अन्य मरीज़ों की कोई पहुँच नहीं है।',
    verifiedAnswerOr:
      'କେବଳ ଆପଣ ଏବଂ ଆପଣ ଅନୁମତି ଦେଇଥିବା ନିର୍ଦ୍ଦିଷ୍ଟ ଡାକ୍ତର ହିଁ ଆପଣଙ୍କ ଦସ୍ତାବିଜ୍ ଦେଖିପାରିବେ। ଅନ୍ୟ କୌଣସି ରୋଗୀ ଏହା ଦେଖିପାରିବେ ନାହିଁ।',
    relatedRoute: '/patient/documents/sharing',
    actionButtonLabelEn: 'Manage Permissions',
    actionButtonLabelHi: 'अनुमतियाँ प्रबंधित करें',
    actionButtonLabelOr: 'ଅନୁମତି ପରିଚାଳନା କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['who can see', 'access', 'permissions', 'view records', 'କିଏ ଦେଖିବ', 'ଅନୁମତି', 'कौन देख सकता है', 'अनुमति'],
  },
  {
    id: 'faq-sriya-store-conversations',
    category: 'PRIVACY_AND_SECURITY',
    categoryLabelEn: 'Privacy & Security',
    categoryLabelHi: 'गोपनीयता और सुरक्षा',
    categoryLabelOr: 'ଗୋପନୀୟତା ଓ ସୁରକ୍ଷା',
    questionEn: 'Does Sriya store my conversations?',
    questionHi: 'क्या श्रिया मेरी बातचीत को संग्रहीत करती है?',
    questionOr: 'ଶ୍ରିୟା କ’ଣ ମୋ ବାର୍ତ୍ତାଳାପ ସଂରକ୍ଷଣ କରେ?',
    verifiedAnswerEn:
      'Sriya stores your active chat history locally on your device only for your current session. Conversations are never used for external AI training, are strictly isolated from other patients, and are wiped clean upon logout or role switching. You can also clear chat history anytime.',
    verifiedAnswerHi:
      'श्रिया आपके सक्रिय चैट इतिहास को केवल आपके वर्तमान सत्र के लिए आपके डिवाइस पर स्थानीय रूप से संग्रहीत करती है। बातचीत का उपयोग कभी भी बाहरी एआई प्रशिक्षण के लिए नहीं किया जाता है और लॉगआउट करने पर साफ़ कर दिया जाता है।',
    verifiedAnswerOr:
      'ଶ୍ରିୟା ଆପଣଙ୍କ ବାର୍ତ୍ତାଳାପ କେବଳ ଆପଣଙ୍କ ଫୋନ୍‌ରେ ଅସ୍ଥାୟୀ ଭାବେ ରଖେ। ଏହା ବାହ୍ୟ AI ପ୍ରଶିକ୍ଷଣରେ ବ୍ୟବହାର ହୁଏ ନାହିଁ ଏବଂ ଲଗ୍ ଆଉଟ୍ କଲେ ସମ୍ପୂର୍ଣ୍ଣ ଡିଲିଟ୍ ହୋଇଯାଏ। ଆପଣ ନିଜେ ମଧ୍ୟ ସଫା କରିପାରିବେ।',
    relatedRoute: '/patient/privacy',
    actionButtonLabelEn: 'Privacy Settings',
    actionButtonLabelHi: 'गोपनीयता सेटिंग्स',
    actionButtonLabelOr: 'ଗୋପନୀୟତା ସେଟିଙ୍ଗ୍ସ',
    lastReviewedDate: '2026-09-26',
    keywords: ['store', 'chat history', 'privacy chat', 'conversation', 'delete chat', 'ବାର୍ତ୍ତାଳାପ', 'ଚାଟ୍ ଡିଲିଟ୍', 'चैट हिस्ट्री', 'बातचीत'],
  },

  // ========================================================
  // 7. EMERGENCY HELP
  // ========================================================
  {
    id: 'faq-request-ambulance',
    category: 'EMERGENCY_HELP',
    categoryLabelEn: 'Emergency Help',
    categoryLabelHi: 'आपातकालीन सहायता',
    categoryLabelOr: 'ଜରୁରୀକାଳୀନ ସହାୟତା',
    questionEn: 'How do I request an ambulance?',
    questionHi: 'मैं एम्बुलेंस का अनुरोध कैसे करूँ?',
    questionOr: 'ମୁଁ ଆମ୍ବୁଲାନ୍ସ କିପରି ଡକାଇବି?',
    verifiedAnswerEn:
      'Click the red "Request Ambulance" button on your patient dashboard. You can confirm your pickup address, share GPS coordinates with consent, and submit an immediate dispatch request to the hospital network.',
    verifiedAnswerHi:
      'अपने मरीज़ डैशबोर्ड पर लाल "Request Ambulance" बटन पर क्लिक करें। आप अपने पिकअप पते की पुष्टि कर सकते हैं, सहमति के साथ जीपीएस निर्देशांक साझा कर सकते हैं, और अस्पताल नेटवर्क को तत्काल अनुरोध भेज सकते हैं।',
    verifiedAnswerOr:
      'ରୋଗୀ ଡ୍ୟାସବୋର୍ଡରେ ଥିବା ନାଲି ରଙ୍ଗର "Request Ambulance" ବଟନ୍ ଛୁଅନ୍ତୁ। ନିଜ ଠିକଣା ବା GPS ଦେଇ ତୁରନ୍ତ ଡାକ୍ତରଖାନାକୁ ଆମ୍ବୁଲାନ୍ସ ପାଇଁ ଅନୁରୋଧ ପଠାନ୍ତୁ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Request Ambulance',
    actionButtonLabelHi: 'एम्बुलेंस अनुरोध करें',
    actionButtonLabelOr: 'ଆମ୍ବୁଲାନ୍ସ ଡାକନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['ambulance', 'emergency vehicle', '108', 'dispatch', 'hospital transport', 'ଆମ୍ବୁଲାନ୍ସ', 'ଗାଡ଼ି', 'ଏମରଜେନ୍ସି', 'एम्बुलेंस', 'आपातकालीन वाहन'],
  },
  {
    id: 'faq-what-in-emergency',
    category: 'EMERGENCY_HELP',
    categoryLabelEn: 'Emergency Help',
    categoryLabelHi: 'आपातकालीन सहायता',
    categoryLabelOr: 'ଜରୁରୀକାଳୀନ ସହାୟତା',
    questionEn: 'What should I do during an emergency?',
    questionHi: 'आपातकाल के दौरान मुझे क्या करना चाहिए?',
    questionOr: 'ଜରୁରୀକାଳୀନ ସ୍ଥିତିରେ ମୁଁ କ’ଣ କରିବା ଉଚିତ୍?',
    verifiedAnswerEn:
      'If you may be experiencing a medical emergency (severe chest pain, difficulty breathing, sudden paralysis, unconsciousness), do not wait for the chatbot. Call 108 or 112, or visit the nearest emergency department immediately.',
    verifiedAnswerHi:
      'यदि आप किसी चिकित्सीय आपात स्थिति (सीने में तेज दर्द, सांस लेने में कठिनाई, अचानक पक्षाघात, बेहोशी) का सामना कर रहे हैं, तो चैटबॉट की प्रतीक्षा न करें। तुरंत 108 या 112 पर कॉल करें, या तुरंत निकटतम आपातकालीन विभाग में जाएँ।',
    verifiedAnswerOr:
      'ଯଦି କୌଣସି ଜରୁରୀକାଳୀନ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା (ତୀବ୍ର ଛାତି ଯନ୍ତ୍ରଣା, ଶ୍ୱାସକଷ୍ଟ, ହଠାତ୍ ପକ୍ଷାଘାତ, ଅଚେତ ହେବା) ହୁଏ, ତେବେ ଚାଟ୍‌ବଟ୍‌କୁ ଅପେକ୍ଷା କରନ୍ତୁ ନାହିଁ। ତୁରନ୍ତ ୧୦୮ କିମ୍ବା ୧୧୨ କଲ୍ କରନ୍ତୁ କିମ୍ବା ନିକଟସ୍ଥ ଡାକ୍ତରଖାନାକୁ ଯାଆନ୍ତୁ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Emergency Services',
    actionButtonLabelHi: 'आपातकालीन सेवाएं',
    actionButtonLabelOr: 'ଜରୁରୀକାଳୀନ ସେବା',
    lastReviewedDate: '2026-09-26',
    keywords: ['emergency', 'urgent', 'chest pain', 'breathing', 'critical', 'life threatening', 'ଜରୁରୀ', 'ବିପଦ', 'ଆପାତକାଳ', 'आपातकाल', 'गंभीर', 'खतरा'],
  },
  {
    id: 'faq-call-108-112',
    category: 'EMERGENCY_HELP',
    categoryLabelEn: 'Emergency Help',
    categoryLabelHi: 'आपातकालीन सहायता',
    categoryLabelOr: 'ଜରୁରୀକାଳୀନ ସହାୟତା',
    questionEn: 'How do I call 108 or 112?',
    questionHi: 'मैं 108 या 112 पर कैसे कॉल करूँ?',
    questionOr: 'ମୁଁ ୧୦୮ ବା ୧୧୨ କୁ କିପରି କଲ୍ କରିବି?',
    verifiedAnswerEn:
      'Dial 108 for free state emergency medical ambulance dispatch across Odisha and India. Dial 112 for the unified emergency service (Police, Fire, and Medical). You can click the emergency call link directly.',
    verifiedAnswerHi:
      'ओडिशा और भारत भर में मुफ्त राज्य आपातकालीन चिकित्सा एम्बुलेंस प्रेषण के लिए 108 डायल करें। एकीकृत आपातकालीन सेवा (पुलिस, अग्निशमन और चिकित्सा) के लिए 112 डायल करें।',
    verifiedAnswerOr:
      'ଓଡ଼ିଶା ତଥା ସାରା ଭାରତରେ ମାଗଣା ଜରୁରୀକାଳୀନ ଆମ୍ବୁଲାନ୍ସ ପାଇଁ ୧୦୮ ଡାଏଲ୍ କରନ୍ତୁ। ପୋଲିସ୍, ଅଗ୍ନିଶମ ଓ ମେଡିକାଲ୍ ପାଇଁ ୧୧୨ ଡାଏଲ୍ କରନ୍ତୁ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Emergency Contacts',
    actionButtonLabelHi: 'आपातकालीन संपर्क',
    actionButtonLabelOr: 'ଜରୁରୀକାଳୀନ ନମ୍ବର',
    lastReviewedDate: '2026-09-26',
    keywords: ['108', '112', 'phone', 'call', 'police', 'ambulance number', '୧୦୮', '୧୧୨', 'ଫୋନ୍ ନମ୍ବର', 'कॉल', 'फ़ोन नंबर'],
  },
];
