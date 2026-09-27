/**
 * Srida — Your TriageBridge Guide
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
  // 1. GETTING STARTED (6 FAQs)
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
    keywords: ['free', 'cost', 'pricing', 'payment', 'charge', 'निःशुल्क', 'पैसे', 'शुल्क', 'ମାଗଣା', 'ଦେୟ', 'ମୂଲ୍ୟ'],
  },
  {
    id: 'faq-access-dashboard',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'How do I access my dashboard?',
    questionHi: 'मैं अपने डैशबोर्ड तक कैसे पहुँचूँ?',
    questionOr: 'ମୁଁ ମୋର ଡ୍ୟାସବୋର୍ଡ କିପରି ଦେଖିବି?',
    verifiedAnswerEn:
      'You can access your dashboard by selecting Dashboard in the main navigation menu or by clicking the Open Dashboard button below. Your dashboard summarizes your active cases, appointments, and recent health documents.',
    verifiedAnswerHi:
      'आप मुख्य नेविगेशन मेनू में डैशबोर्ड का चयन करके या नीचे दिए गए डैशबोर्ड खोलें बटन पर क्लिक करके अपने डैशबोर्ड तक पहुँच सकते हैं। आपका डैशबोर्ड आपके सक्रिय मामलों, नियुक्तियों और हालिया स्वास्थ्य दस्तावेज़ों को प्रदर्शित करता है।',
    verifiedAnswerOr:
      'ଆପଣ ମୁଖ୍ୟ ନେଭିଗେସନ୍ ମେନୁରୁ ଡ୍ୟାସବୋର୍ଡ ଚୟନ କରି କିମ୍ବା ତଳେ ଥିବା ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ ବଟନ୍ କ୍ଲିକ୍ କରି ନିଜର ଡ୍ୟାସବୋର୍ଡ ଦେଖିପାରିବେ। ଆପଣଙ୍କ ଡ୍ୟାସବୋର୍ଡ ସକ୍ରିୟ ମାମଲା, ନିଯୁକ୍ତି ଏବଂ ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଦର୍ଶାଏ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Open Dashboard',
    actionButtonLabelHi: 'डैशबोर्ड खोलें',
    actionButtonLabelOr: 'ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['dashboard', 'home', 'main page', 'overview', 'डैशबोर्ड', 'होम', 'मुख्य पृष्ठ', 'ଡ୍ୟାସବୋର୍ଡ'],
  },
  {
    id: 'faq-change-language',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'How do I change the language?',
    questionHi: 'मैं भाषा कैसे बदलूँ?',
    questionOr: 'ମୁଁ ଭାଷା କିପରି ବଦଳାଇବି?',
    verifiedAnswerEn:
      'You can change the language anytime by clicking the language selector in the top bar or inside your Patient Profile. TriageBridge supports English, Hindi (हिन्दी), and Odia (ଓଡ଼ିଆ) across the entire patient experience.',
    verifiedAnswerHi:
      'आप शीर्ष बार में या अपनी रोगी प्रोफ़ाइल के अंदर भाषा चयनकर्ता पर क्लिक करके किसी भी समय भाषा बदल सकते हैं। TriageBridge पूरे प्लेटफ़ॉर्म पर अंग्रेज़ी, हिन्दी और ଓଡ଼ିଆ का समर्थन करता है।',
    verifiedAnswerOr:
      'ଆପଣ ଉପର ବାର୍ କିମ୍ବା ଆପଣଙ୍କ ରୋଗୀ ପ୍ରୋଫାଇଲ୍ ଭିତରେ ଥିବା ଭାଷା ସିଲେକ୍ଟର୍ କ୍ଲିକ୍ କରି ଯେକୌଣସି ସମୟରେ ଭାଷା ବଦଳାଇ ପାରିବେ। TriageBridge ଇଂରାଜୀ, ହିନ୍ଦୀ ଏବଂ ଓଡ଼ିଆ ସମ୍ପୂର୍ଣ୍ଣ ରୂପେ ସମର୍ଥନ କରେ।',
    relatedRoute: '/patient/profile',
    actionButtonLabelEn: 'Change Language',
    actionButtonLabelHi: 'भाषा बदलें',
    actionButtonLabelOr: 'ଭାଷା ବଦଳାନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['language', 'hindi', 'odia', 'english', 'translate', 'भाषा', 'हिन्दी', 'उड़िया', 'ଓଡ଼ିଆ', 'ଭାଷା'],
  },
  {
    id: 'faq-update-profile',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'How do I update my profile?',
    questionHi: 'मैं अपनी प्रोफ़ाइल कैसे अपडेट करूँ?',
    questionOr: 'ମୁଁ ମୋର ପ୍ରୋଫାଇଲ୍ କିପରି ଅପଡେଟ୍ କରିବି?',
    verifiedAnswerEn:
      'Navigate to Patient Profile to review and update your personal details, emergency contacts, preferred language, and notification settings.',
    verifiedAnswerHi:
      'अपने व्यक्तिगत विवरण, आपातकालीन संपर्क, पसंदीदा भाषा और अधिसूचना सेटिंग्स की समीक्षा और अपडेट करने के लिए रोगी प्रोफ़ाइल पर जाएं।',
    verifiedAnswerOr:
      'ନିଜର ବ୍ୟକ୍ତିଗତ ବିବରଣୀ, ଜରୁରୀକାଳୀନ ଯୋଗାଯୋଗ, ପସନ୍ଦର ଭାଷା ଏବଂ ନୋଟିଫିକେସନ୍ ସେଟିଂସ୍ ଅପଡେଟ୍ କରିବାକୁ ରୋଗୀ ପ୍ରୋଫାଇଲ୍ କୁ ଯାଆନ୍ତୁ।',
    relatedRoute: '/patient/profile',
    actionButtonLabelEn: 'Open Profile',
    actionButtonLabelHi: 'प्रोफ़ाइल खोलें',
    actionButtonLabelOr: 'ପ୍ରୋଫାଇଲ୍ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['profile', 'account', 'personal details', 'contact', 'प्रोफ़ाइल', 'खाता', 'विवरण', 'ପ୍ରୋଫାଇଲ୍'],
  },
  {
    id: 'faq-log-out',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'How do I log out?',
    questionHi: 'मैं लॉग आउट कैसे करूँ?',
    questionOr: 'ମୁଁ କିପରି ଲଗ୍ ଆଉଟ୍ କରିବି?',
    verifiedAnswerEn:
      'Click on your avatar or menu icon at the top right of the navigation header and select Sign Out. This will securely clear your session and active chat history.',
    verifiedAnswerHi:
      'नेविगेशन हेडर के शीर्ष दाईं ओर अपने अवतार या मेनू आइकन पर क्लिक करें और साइन आउट चुनें। यह आपके सत्र और सक्रिय चैट इतिहास को सुरक्षित रूप से साफ़ कर देगा।',
    verifiedAnswerOr:
      'ନେଭିଗେସନ୍ ହେଡର୍ ର ଉପର ଡାହାଣ ପାର୍ଶ୍ୱରେ ଥିବା ଆପଣଙ୍କ ଅବତାର କିମ୍ବା ମେନୁ ଆଇକନ୍ କ୍ଲିକ୍ କରନ୍ତୁ ଏବଂ ସାଇନ୍ ଆଉଟ୍ ଚୟନ କରନ୍ତୁ। ଏହା ଆପଣଙ୍କ ସେସନ୍ କୁ ସୁରକ୍ଷିତ ଭାବରେ ସମାପ୍ତ କରିବ।',
    relatedRoute: '/patient/profile',
    actionButtonLabelEn: 'Open Profile to Sign Out',
    actionButtonLabelHi: 'लॉग आउट करने के लिए प्रोफ़ाइल खोलें',
    actionButtonLabelOr: 'ଲଗ୍ ଆଉଟ୍ ପାଇଁ ପ୍ରୋଫାଇଲ୍ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['logout', 'sign out', 'exit', 'leave', 'लॉग आउट', 'साइन आउट', 'बाहर निकलें', 'ଲଗ୍ ଆଉଟ୍'],
  },
  {
    id: 'faq-use-platform',
    category: 'GETTING_STARTED',
    categoryLabelEn: 'Getting Started',
    categoryLabelHi: 'शुरुआत करें',
    categoryLabelOr: 'ଆରମ୍ଭ କରନ୍ତୁ',
    questionEn: 'How do I use this platform?',
    questionHi: 'मैं इस प्लेटफ़ॉर्म का उपयोग कैसे करूँ?',
    questionOr: 'ମୁଁ ଏହି ପ୍ଲାଟଫର୍ମ କିପରି ବ୍ୟବହାର କରିବି?',
    verifiedAnswerEn:
      'TriageBridge allows you to submit triage cases, track clinician reviews, manage upcoming hospital appointments, and store OCR-extracted medical documents. Use the guided navigation buttons or ask Srida anytime for guidance.',
    verifiedAnswerHi:
      'TriageBridge आपको ट्राइएज मामले प्रस्तुत करने, समीक्षा ट्रैक करने, अस्पताल की नियुक्तियों का प्रबंधन करने और ओसीआर-निकाले गए चिकित्सा दस्तावेज़ों को संग्रहीत करने की अनुमति देता है। निर्देशित नेविगेशन बटन का उपयोग करें या किसी भी समय स्रीदा से मार्गदर्शन मांगें।',
    verifiedAnswerOr:
      'TriageBridge ଆପଣଙ୍କୁ ଟ୍ରାଇଏଜ୍ ମାମଲା ଦାଖଲ କରିବାକୁ, ସମୀକ୍ଷା ଟ୍ରାକ୍ କରିବାକୁ, ଆଗାମୀ ଡାକ୍ତରଖାନା ନିଯୁକ୍ତି ପରିଚାଳନା କରିବାକୁ ଏବଂ OCR ତଥ୍ୟ ସହିତ ଡକ୍ୟୁମେଣ୍ଟ ସାଇତିବାକୁ ଅନୁମତି ଦିଏ। ଗାଇଡେଡ୍ ବଟନ୍ ବ୍ୟବହାର କରନ୍ତୁ କିମ୍ବା ସ୍ରିଦାଙ୍କୁ ପଚାରନ୍ତୁ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Open Dashboard',
    actionButtonLabelHi: 'डैशबोर्ड खोलें',
    actionButtonLabelOr: 'ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['how to use', 'guide', 'features', 'help', 'उपयोग', 'सुविधाएं', 'मार्गदर्शन', 'ବ୍ୟବହାର', 'ସହାୟତା'],
  },

  // ========================================================
  // 2. TRIAGE AND CASE STATUS (5 FAQs)
  // ========================================================
  {
    id: 'faq-start-triage',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage and Case Status',
    categoryLabelHi: 'ट्राइएज एवं स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଏବଂ ସ୍ଥିତି',
    questionEn: 'How do I start a triage request?',
    questionHi: 'मैं ट्राइएज अनुरोध कैसे शुरू करूँ?',
    questionOr: 'ମୁଁ କିପରି ଟ୍ରାଇଏଜ୍ ଅନୁରୋଧ ଆରମ୍ଭ କରିବି?',
    verifiedAnswerEn:
      'Select Start Triage from your dashboard. Enter your symptoms, available vital signs and supporting reports before submitting the case for healthcare-worker review.',
    verifiedAnswerHi:
      'अपने डैशबोर्ड से ट्राइएज शुरू करें चुनें। स्वास्थ्य कार्यकर्ता की समीक्षा के लिए मामला प्रस्तुत करने से पहले अपने लक्षण, उपलब्ध महत्वपूर्ण संकेत और सहायक रिपोर्ट दर्ज करें।',
    verifiedAnswerOr:
      'ଆପଣଙ୍କ ଡ୍ୟାସବୋର୍ଡରୁ ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରନ୍ତୁ ଚୟନ କରନ୍ତୁ। ସ୍ୱାସ୍ଥ୍ୟକର୍ମୀଙ୍କ ସମୀକ୍ଷା ପାଇଁ ଦାଖଲ କରିବା ପୂର୍ବରୁ ଆପଣଙ୍କର ଲକ୍ଷଣ, ଭାଇଟାଲ୍ ସୂଚନା ଏବଂ ରିପୋର୍ଟ ପ୍ରଦାନ କରନ୍ତୁ।',
    relatedRoute: '/patient/triage',
    actionButtonLabelEn: 'Start Triage',
    actionButtonLabelHi: 'ट्राइएज शुरू करें',
    actionButtonLabelOr: 'ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['start triage', 'new case', 'symptoms', 'checkup', 'ट्राइएज शुरू करें', 'लक्षण', 'ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ'],
  },
  {
    id: 'faq-voice-input',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage and Case Status',
    categoryLabelHi: 'ट्राइएज एवं स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଏବଂ ସ୍ଥିତି',
    questionEn: 'How do I use voice input?',
    questionHi: 'मैं वॉइस इनपुट का उपयोग कैसे करूँ?',
    questionOr: 'ମୁଁ ଭଏସ୍ ଇନପୁଟ୍ କିପରି ବ୍ୟବହାର କରିବି?',
    verifiedAnswerEn:
      'On the Start Triage form, click the microphone button in the Voice Input Studio. Speak clearly in English, Hindi (हिन्दी), or Odia (ଓଡ଼ିଆ). Your speech is transcribed in real-time in its native script for you to review and edit before submission.',
    verifiedAnswerHi:
      'ट्राइएज शुरू करें फॉर्म पर, वॉइस इनपुट स्टूडियो में माइक्रोफ़ोन बटन पर क्लिक करें। अंग्रेज़ी, हिन्दी या ଓଡ଼ିଆ में स्पष्ट बोलें। सबमिशन से पहले समीक्षा और संपादन के लिए आपका भाषण मूल लिपि में वास्तविक समय में लिखा जाता है।',
    verifiedAnswerOr:
      'ଟ୍ରାଇଏଜ୍ ଆରମ୍ଭ ଫର୍ମରେ, ଭଏସ୍ ଇନପୁଟ୍ ଷ୍ଟୁଡିଓରେ ମାଇକ୍ରୋଫୋନ୍ ବଟନ୍ କ୍ଲିକ୍ କରନ୍ତୁ। ଇଂରାଜୀ, ହିନ୍ଦୀ କିମ୍ବା ଓଡ଼ିଆରେ ସ୍ପଷ୍ଟ କୁହନ୍ତୁ। ଆପଣଙ୍କ କଥା ସିଧାସଳଖ ନିଜ ଲିପିରେ ଲେଖାଯିବ, ଯାହାକୁ ଆପଣ ଯାଞ୍ଚ ଓ ଏଡିଟ୍ କରିପାରିବେ।',
    relatedRoute: '/patient/triage',
    actionButtonLabelEn: 'Open Voice Input in Triage',
    actionButtonLabelHi: 'ट्राइएज में वॉइस इनपुट खोलें',
    actionButtonLabelOr: 'ଟ୍ରାଇଏଜ୍ ରେ ଭଏସ୍ ଇନପୁଟ୍ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['voice', 'microphone', 'speech', 'speak', 'audio', 'वॉइस', 'माइक', 'बोलें', 'ଭଏସ୍', 'ମାଇକ୍'],
  },
  {
    id: 'faq-check-status',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage and Case Status',
    categoryLabelHi: 'ट्राइएज एवं स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଏବଂ ସ୍ଥିତି',
    questionEn: 'How do I check my case status?',
    questionHi: 'मैं अपने मामले की स्थिति कैसे देखूँ?',
    questionOr: 'ମୁଁ ମୋର ମାମଲାର ସ୍ଥିତି କିପରି ଯାଞ୍ଚ କରିବି?',
    verifiedAnswerEn:
      'Go to My Cases in your patient menu to check all submitted triage requests, clinician reviews, assigned urgency levels, and follow-up guidance.',
    verifiedAnswerHi:
      'सबमिट किए गए सभी ट्राइएज अनुरोधों, चिकित्सक समीक्षाओं, निर्दिष्ट तात्कालिकता स्तरों और अनुवर्ती मार्गदर्शन की जांच करने के लिए अपने रोगी मेनू में मेरे मामले पर जाएं।',
    verifiedAnswerOr:
      'ଦାଖଲ ହୋଇଥିବା ସମସ୍ତ ଟ୍ରାଇଏଜ୍ ଅନୁରୋଧ, ଡାକ୍ତରୀ ସମୀକ୍ଷା, ଜରୁରୀତା ସ୍ତର ଏବଂ ପରାମର୍ଶ ଯାଞ୍ଚ କରିବା ପାଇଁ ମୋର ମାମଲା ବିଭାଗକୁ ଯାଆନ୍ତୁ।',
    relatedRoute: '/patient/cases',
    actionButtonLabelEn: 'View My Cases',
    actionButtonLabelHi: 'मेरे मामले देखें',
    actionButtonLabelOr: 'ମୋର ମାମଲା ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['case status', 'my cases', 'review status', 'progress', 'मामले की स्थिति', 'ट्रैक', 'ମାମଲା ସ୍ଥିତି'],
  },
  {
    id: 'faq-triage-urgency-colors',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage and Case Status',
    categoryLabelHi: 'ट्राइएज एवं स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଏବଂ ସ୍ଥିତି',
    questionEn: 'What do RED, YELLOW, GREEN and GREY mean?',
    questionHi: 'RED, YELLOW, GREEN और GREY का क्या अर्थ है?',
    questionOr: 'RED, YELLOW, GREEN ଏବଂ GREY ର ଅର୍ଥ କ’ଣ?',
    verifiedAnswerEn:
      'Triage urgency colors represent clinical prioritization: RED indicates high urgency requiring immediate clinician attention; YELLOW indicates moderate urgency requiring timely evaluation; GREEN indicates non-urgent stable conditions; GREY indicates pending review or incomplete vitals requiring clinician assessment.',
    verifiedAnswerHi:
      'ट्राइएज तात्कालिकता रंग नैदानिक प्राथमिकता का प्रतिनिधित्व करते हैं: RED (लाल) का अर्थ है तत्काल चिकित्सक की आवश्यकता; YELLOW (पीला) समय पर मूल्यांकन की आवश्यकता को दर्शाता है; GREEN (हरा) गैर-आपातकालीन स्थिर स्थिति है; GREY (ग्रे) लंबित समीक्षा या अधूरी जानकारी को दर्शाता है।',
    verifiedAnswerOr:
      'ଟ୍ରାଇଏଜ୍ ରଙ୍ଗ ଡାକ୍ତରୀ ଅଗ୍ରାଧିକାରକୁ ଦର୍ଶାଏ: RED (ଲାଲ) ତୁରନ୍ତ ଡାକ୍ତରୀ ଧ୍ୟାନ ଆବଶ୍ୟକ କରେ; YELLOW (ହଳଦିଆ) ମଧ୍ୟମ ଜରୁରୀତା ଦର୍ଶାଏ; GREEN (ସବୁଜ) ସ୍ଥିର ସ୍ୱାସ୍ଥ୍ୟ ସ୍ଥିତି ଦର୍ଶାଏ; GREY (ଧୂସର) ଅପେକ୍ଷାରତ ସମୀକ୍ଷା କିମ୍ବା ଅସମ୍ପୂର୍ଣ୍ଣ ଭାଇଟାଲ୍ ସୂଚନା ଦର୍ଶାଏ।',
    relatedRoute: '/patient/cases',
    actionButtonLabelEn: 'View Case Urgencies',
    actionButtonLabelHi: 'मामले की तात्कालिकता देखें',
    actionButtonLabelOr: 'ମାମଲା ଜରୁରୀତା ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['red', 'yellow', 'green', 'grey', 'urgency', 'color', 'लाल', 'पीला', 'हरा', 'ग्रे', 'ଲାଲ', 'ହଳଦିଆ'],
  },
  {
    id: 'faq-contact-clinician',
    category: 'TRIAGE_AND_CASE_STATUS',
    categoryLabelEn: 'Triage and Case Status',
    categoryLabelHi: 'ट्राइएज एवं स्थिति',
    categoryLabelOr: 'ଟ୍ରାଇଏଜ୍ ଏବଂ ସ୍ଥିତି',
    questionEn: 'How do I contact a healthcare professional?',
    questionHi: 'मैं किसी स्वास्थ्य देखभाल पेशेवर से कैसे संपर्क करूँ?',
    questionOr: 'ମୁଁ ଜଣେ ସ୍ୱାସ୍ଥ୍ୟସେବା ବିଶେଷଜ୍ଞଙ୍କ ସହ କିପରି ଯୋଗାଯୋଗ କରିବି?',
    verifiedAnswerEn:
      'Once a healthcare worker reviews your case, their facility contacts and appointment instructions appear under the specific case details. For acute emergencies, call 108 or 112 immediately.',
    verifiedAnswerHi:
      'एक बार जब कोई स्वास्थ्य कार्यकर्ता आपके मामले की समीक्षा कर लेता है, तो उनके सुविधा संपर्क और नियुक्ति निर्देश विशिष्ट मामले के विवरण के तहत दिखाई देते हैं। आपात स्थिति में तुरंत 108 या 112 पर कॉल करें।',
    verifiedAnswerOr:
      'ଜଣେ ସ୍ୱାସ୍ଥ୍ୟକର୍ମୀ ଆପଣଙ୍କ ମାମଲା ଯାଞ୍ଚ କରିବା ପରେ, ସେମାନଙ୍କ ଯୋଗାଯୋଗ ଏବଂ ନିର୍ଦ୍ଦେଶ ସମ୍ପୃକ୍ତ ମାମଲାରେ ଦେଖାଯିବ। ଜରୁରୀକାଳୀନ ପରିସ୍ଥିତିରେ ତୁରନ୍ତ 108 କିମ୍ବା 112 କୁ କଲ୍ କରନ୍ତୁ।',
    relatedRoute: '/patient/cases',
    actionButtonLabelEn: 'View Clinician Contacts',
    actionButtonLabelHi: 'चिकित्सक संपर्क देखें',
    actionButtonLabelOr: 'ଡାକ୍ତରୀ ଯୋଗାଯୋଗ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['doctor', 'clinician', 'contact', 'healthcare worker', 'call', 'डॉक्टर', 'चिकित्सक', 'ଡାକ୍ତର'],
  },

  // ========================================================
  // 3. APPOINTMENTS (3 FAQs)
  // ========================================================
  {
    id: 'faq-find-letters',
    category: 'APPOINTMENTS',
    categoryLabelEn: 'Appointments',
    categoryLabelHi: 'नियुक्तियाँ',
    categoryLabelOr: 'ନିଯୁକ୍ତି',
    questionEn: 'Where are my appointment letters?',
    questionHi: 'मेरे अपॉइंटमेंट पत्र कहाँ हैं?',
    questionOr: 'ମୋର ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି କେଉଁଠାରେ ଅଛି?',
    verifiedAnswerEn:
      'You can find your appointment letters under Patient Dashboard → Appointments. Official letters include your appointment time, hospital unit, doctor in charge, and QR verification code.',
    verifiedAnswerHi:
      'आप अपने अपॉइंटमेंट पत्र रोगी डैशबोर्ड → नियुक्तियाँ के अंतर्गत पा सकते हैं। आधिकारिक पत्रों में आपका नियुक्ति समय, अस्पताल इकाई, प्रभारी चिकित्सक और क्यूआर सत्यापन कोड शामिल हैं।',
    verifiedAnswerOr:
      'ଆପଣ ନିଜର ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି ରୋଗୀ ଡ୍ୟାସବୋର୍ଡ → ନିଯୁକ୍ତି ଅଧୀନରେ ପାଇପାରିବେ। ଅଫିସିଆଲ୍ ଚିଠିରେ ନିଯୁକ୍ତି ସମୟ, ଡାକ୍ତରଖାନା ୟୁନିଟ୍, ଏବଂ QR ଯାଞ୍ଚ କୋଡ୍ ଥାଏ।',
    relatedRoute: '/patient/appointments',
    actionButtonLabelEn: 'Open Appointments',
    actionButtonLabelHi: 'नियुक्तियाँ खोलें',
    actionButtonLabelOr: 'ନିଯୁକ୍ତି ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['appointment letter', 'letter', 'booking', 'hospital slip', 'अपॉइंटमेंट पत्र', 'पत्र', 'ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି'],
  },
  {
    id: 'faq-view-upcoming-appointments',
    category: 'APPOINTMENTS',
    categoryLabelEn: 'Appointments',
    categoryLabelHi: 'नियुक्तियाँ',
    categoryLabelOr: 'ନିଯୁକ୍ତି',
    questionEn: 'How do I view upcoming appointments?',
    questionHi: 'मैं आगामी नियुक्तियाँ कैसे देखूँ?',
    questionOr: 'ମୁଁ ଆଗାମୀ ନିଯୁକ୍ତି କିପରି ଦେଖିବି?',
    verifiedAnswerEn:
      'Open the Appointments section from the main navigation to see scheduled visit dates, times, healthcare facility names, and attending specialists.',
    verifiedAnswerHi:
      'निर्धारित यात्रा की तारीखें, समय, स्वास्थ्य सुविधा के नाम और उपस्थित विशेषज्ञों को देखने के लिए मुख्य नेविगेशन से नियुक्तियाँ अनुभाग खोलें।',
    verifiedAnswerOr:
      'ନିର୍ଦ୍ଧାରିତ ତାରିଖ, ସମୟ, ଡାକ୍ତରଖାନାର ନାମ ଏବଂ ଡାକ୍ତରଙ୍କ ବିବରଣୀ ଦେଖିବା ପାଇଁ ମୁଖ୍ୟ ନେଭିଗେସନ୍ ରୁ ନିଯୁକ୍ତି ବିଭାଗ ଖୋଲନ୍ତୁ।',
    relatedRoute: '/patient/appointments',
    actionButtonLabelEn: 'View Appointments',
    actionButtonLabelHi: 'नियुक्तियाँ देखें',
    actionButtonLabelOr: 'ନିଯୁକ୍ତି ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['upcoming', 'scheduled', 'visits', 'calendar', 'आगामी', 'नियुक्तियाँ', 'ତାରିଖ', 'ଆଗାମୀ ନିଯୁକ୍ତି'],
  },
  {
    id: 'faq-download-letter',
    category: 'APPOINTMENTS',
    categoryLabelEn: 'Appointments',
    categoryLabelHi: 'नियुक्तियाँ',
    categoryLabelOr: 'ନିଯୁକ୍ତି',
    questionEn: 'How do I download an appointment letter?',
    questionHi: 'मैं अपॉइंटमेंट पत्र कैसे डाउनलोड करूँ?',
    questionOr: 'ମୁଁ ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି କିପରି ଡାଉନଲୋଡ୍ କରିବି?',
    verifiedAnswerEn:
      'Under Appointments, select any confirmed booking card and click Download Appointment Letter to save the official PDF on your device for offline presentation.',
    verifiedAnswerHi:
      'नियुक्तियाँ के तहत, किसी भी पुष्ट बुकिंग कार्ड का चयन करें और ऑफ़लाइन प्रस्तुति के लिए अपने डिवाइस पर आधिकारिक पीडीएफ को सहेजने के लिए अपॉइंटमेंट पत्र डाउनलोड करें पर क्लिक करें।',
    verifiedAnswerOr:
      'ନିଯୁକ୍ତି ଅଧୀନରେ, ଯେକୌଣସି ନିଶ୍ଚିତ ବୁକିଂ କାର୍ଡ ଚୟନ କରନ୍ତୁ ଏବଂ ଅଫଲାଇନ୍ ଦେଖାଇବା ପାଇଁ ଅଫିସିଆଲ୍ PDF ଡାଉନଲୋଡ୍ କରନ୍ତୁ।',
    relatedRoute: '/patient/appointments',
    actionButtonLabelEn: 'Download Appointment Letter',
    actionButtonLabelHi: 'अपॉइंटमेंट पत्र डाउनलोड करें',
    actionButtonLabelOr: 'ଆପଏଣ୍ଟମେଣ୍ଟ ଚିଠି ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['download letter', 'pdf', 'print', 'save letter', 'डाउनलोड', 'प्रिंट', 'ଡାଉନଲୋଡ୍'],
  },

  // ========================================================
  // 4. HEALTH DOCUMENTS (4 FAQs)
  // ========================================================
  {
    id: 'faq-upload-report',
    category: 'HEALTH_DOCUMENTS',
    categoryLabelEn: 'Health Documents',
    categoryLabelHi: 'स्वास्थ्य दस्तावेज़',
    categoryLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ',
    questionEn: 'How do I upload a medical report?',
    questionHi: 'मैं अपनी मेडिकल रिपोर्ट कैसे अपलोड करूँ?',
    questionOr: 'ମୁଁ ମୋର ମେଡିକାଲ୍ ରିପୋର୍ଟ କିପରି ଅପଲୋଡ୍ କରିବି?',
    verifiedAnswerEn:
      'Open Health Documents and select Upload Document. Review the OCR-extracted information before saving it.',
    verifiedAnswerHi:
      'स्वास्थ्य दस्तावेज़ खोलें और दस्तावेज़ अपलोड करें चुनें। इसे सहेजने से पहले ओसीआर-निकाली गई जानकारी की समीक्षा करें।',
    verifiedAnswerOr:
      'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଖୋଲନ୍ତୁ ଏବଂ ଡକ୍ୟୁମେଣ୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ ଚୟନ କରନ୍ତୁ। ସାଇତିବା ପୂର୍ବରୁ OCR ତଥ୍ୟ ଯାଞ୍ଚ କରନ୍ତୁ।',
    relatedRoute: '/patient/documents',
    actionButtonLabelEn: 'Open Health Documents',
    actionButtonLabelHi: 'स्वास्थ्य दस्तावेज़ खोलें',
    actionButtonLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଖୋଲନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['upload', 'medical report', 'lab test', 'prescription', 'अपलोड', 'रिपोर्ट', 'ପର୍ଚା', 'ଅପଲୋଡ୍ ରିପୋର୍ଟ'],
  },
  {
    id: 'faq-find-documents',
    category: 'HEALTH_DOCUMENTS',
    categoryLabelEn: 'Health Documents',
    categoryLabelHi: 'स्वास्थ्य दस्तावेज़',
    categoryLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ',
    questionEn: 'Where are my uploaded documents?',
    questionHi: 'मेरे अपलोड किए गए दस्तावेज़ कहाँ हैं?',
    questionOr: 'ମୋର ଅପଲୋଡ୍ ହୋଇଥିବା ଡକ୍ୟୁମେଣ୍ଟ କେଉଁଠାରେ ଅଛି?',
    verifiedAnswerEn:
      'All uploaded lab results, prescriptions, and imaging reports are stored securely in Health Documents. You can view, search, and download them at any time.',
    verifiedAnswerHi:
      'सभी अपलोड किए गए लैब परिणाम, नुस्खे और इमेजिंग रिपोर्ट स्वास्थ्य दस्तावेज़ में सुरक्षित रूप से संग्रहीत हैं। आप उन्हें किसी भी समय देख, खोज और डाउनलोड कर सकते हैं।',
    verifiedAnswerOr:
      'ସମସ୍ତ ଅପଲୋଡ୍ ହୋଇଥିବା ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଏବଂ ପ୍ରେସକ୍ରିପସନ୍ ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟରେ ସୁରକ୍ଷିତ ଅଛି। ଆପଣ ଯେକୌଣସି ସମୟରେ ଦେଖି ଓ ଡାଉନଲୋଡ୍ କରିପାରିବେ।',
    relatedRoute: '/patient/documents',
    actionButtonLabelEn: 'View Health Documents',
    actionButtonLabelHi: 'स्वास्थ्य दस्तावेज़ देखें',
    actionButtonLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['my documents', 'records', 'stored files', 'स्वास्थ्य दस्तावेज़', 'ଫାଇଲ୍', 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ'],
  },
  {
    id: 'faq-share-document',
    category: 'HEALTH_DOCUMENTS',
    categoryLabelEn: 'Health Documents',
    categoryLabelHi: 'स्वास्थ्य दस्तावेज़',
    categoryLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ',
    questionEn: 'How do I share a document with a doctor?',
    questionHi: 'मैं डॉक्टर के साथ दस्तावेज़ कैसे साझा करूँ?',
    questionOr: 'ମୁଁ ଡାକ୍ତରଙ୍କ ସହିତ ଡକ୍ୟୁମେଣ୍ଟ କିପରି ସେୟାର୍ କରିବି?',
    verifiedAnswerEn:
      'In Health Documents, select any record and click Share. You can grant temporary, consent-backed read access to authorized healthcare personnel assigned to your case.',
    verifiedAnswerHi:
      'स्वास्थ्य दस्तावेज़ में, किसी भी रिकॉर्ड का चयन करें और साझा करें पर क्लिक करें। आप अपने मामले में सौंपे गए अधिकृत स्वास्थ्य कर्मियों को अस्थायी, सहमति-समर्थित पढ़ने की पहुंच प्रदान कर सकते हैं।',
    verifiedAnswerOr:
      'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟରେ, ଯେକୌଣସି ଫାଇଲ୍ ଚୟନ କରନ୍ତୁ ଏବଂ ସେୟାର୍ କ୍ଲିକ୍ କରନ୍ତୁ। ଆପଣ ଅନୁମୋଦିତ ଡାକ୍ତରଙ୍କୁ ସୁରକ୍ଷିତ ଭାବରେ ପ୍ରବେଶ ଅଧିକାର ଦେଇପାରିବେ।',
    relatedRoute: '/patient/documents',
    actionButtonLabelEn: 'Share Health Documents',
    actionButtonLabelHi: 'स्वास्थ्य दस्तावेज़ साझा करें',
    actionButtonLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ ସେୟାର୍ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['share', 'doctor consent', 'permissions', 'साझा करें', 'अनुमति', 'ସେୟାର୍'],
  },
  {
    id: 'faq-ocr-extraction',
    category: 'HEALTH_DOCUMENTS',
    categoryLabelEn: 'Health Documents',
    categoryLabelHi: 'स्वास्थ्य दस्तावेज़',
    categoryLabelOr: 'ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ',
    questionEn: 'How does OCR extraction work?',
    questionHi: 'ओसीआर निष्कर्षण कैसे काम करता है?',
    questionOr: 'OCR ନିଷ୍କର୍ଷଣ କିପରି କାମ କରେ?',
    verifiedAnswerEn:
      'When you upload an image or scan of a medical document, our Optical Character Recognition (OCR) reads the text to help you automatically fill in details. OCR output is assistance only and is never presented as a confirmed medical result.',
    verifiedAnswerHi:
      'जब आप किसी मेडिकल दस्तावेज़ की छवि या स्कैन अपलोड करते हैं, तो हमारा ऑप्टिकल कैरेक्टर रिकग्निशन (OCR) विवरण भरने में सहायता के लिए पाठ पढ़ता है। ओसीआर आउटपुट केवल सहायता है और इसे कभी भी पुष्ट चिकित्सा परिणाम के रूप में प्रस्तुत नहीं किया जाता है।',
    verifiedAnswerOr:
      'ଯେତେବେଳେ ଆପଣ ଏକ ମେଡିକାଲ୍ ଡକ୍ୟୁମେଣ୍ଟ ଅପଲୋଡ୍ କରନ୍ତି, OCR ସ୍ୱୟଂଚାଳିତ ଭାବରେ ଲେଖା ପଢି ସୂଚନା ବାହାର କରେ। OCR ଫଳାଫଳ କେବଳ ସହାୟତା ପାଇଁ ଏବଂ ଏହା ଚୂଡାନ୍ତ ଡାକ୍ତରୀ ନିଷ୍ପତ୍ତି ନୁହେଁ।',
    relatedRoute: '/patient/documents',
    actionButtonLabelEn: 'Learn About OCR',
    actionButtonLabelHi: 'ओसीआर के बारे में जानें',
    actionButtonLabelOr: 'OCR ବିଷୟରେ ଜାଣନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['ocr', 'scanner', 'text extraction', 'optical character', 'ओसीआर', 'स्कैन', 'OCR'],
  },

  // ========================================================
  // 5. OFFLINE ACCESS (3 FAQs)
  // ========================================================
  {
    id: 'faq-offline-use',
    category: 'OFFLINE_ACCESS',
    categoryLabelEn: 'Offline Access',
    categoryLabelHi: 'ऑफ़लाइन पहुँच',
    categoryLabelOr: 'ଅଫଲାଇନ୍ ପ୍ରବେଶ',
    questionEn: 'Can I use TriageBridge without internet?',
    questionHi: 'क्या मैं इंटरनेट के बिना TriageBridge का उपयोग कर सकता हूँ?',
    questionOr: 'ମୁଁ ଇଣ୍ଟରନେଟ୍ ବିନା TriageBridge ବ୍ୟବହାର କରିପାରିବି କି?',
    verifiedAnswerEn:
      'Yes! TriageBridge includes full offline support. You can fill out triage forms, save drafts, view cached appointments, and browse verified Srida FAQs without internet. All data is safely stored in local IndexedDB storage.',
    verifiedAnswerHi:
      'हाँ! TriageBridge में पूर्ण ऑफ़लाइन समर्थन शामिल है। आप इंटरनेट के बिना ट्राइएज फॉर्म भर सकते हैं, ड्राफ्ट सहेज सकते हैं, कैश्ड नियुक्तियां देख सकते हैं और सत्यापित स्रीदा अक्सर पूछे जाने वाले प्रश्न देख सकते हैं।',
    verifiedAnswerOr:
      'ହଁ! TriageBridge ରେ ସମ୍ପୂର୍ଣ୍ଣ ଅଫଲାଇନ୍ ସୁବିଧା ଅଛି। ଆପଣ ଇଣ୍ଟରନେଟ୍ ବିନା ଟ୍ରାଇଏଜ୍ ଫର୍ମ ଭରିପାରିବେ, ସାଇତି ରଖିପାରିବେ ଏବଂ ସ୍ରିଦା FAQ ଦେଖିପାରିବେ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Explore Offline Capabilities',
    actionButtonLabelHi: 'ऑफ़लाइन क्षमताएं देखें',
    actionButtonLabelOr: 'ଅଫଲାଇନ୍ ସୁବିଧା ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['offline', 'no internet', 'connectivity', 'airplane mode', 'ऑफ़लाइन', 'बिना इंटरनेट', 'ଅଫଲାଇନ୍'],
  },
  {
    id: 'faq-pending-sync',
    category: 'OFFLINE_ACCESS',
    categoryLabelEn: 'Offline Access',
    categoryLabelHi: 'ऑफ़लाइन पहुँच',
    categoryLabelOr: 'ଅଫଲାଇନ୍ ପ୍ରବେଶ',
    questionEn: 'What does “Pending Sync” mean?',
    questionHi: '“Pending Sync” का क्या अर्थ है?',
    questionOr: '“Pending Sync” ର ଅର୍ଥ କ’ଣ?',
    verifiedAnswerEn:
      '“Pending Sync” indicates that your case or document was saved safely on your phone or computer while offline. As soon as your internet connection is restored, TriageBridge will upload it to the secure server automatically.',
    verifiedAnswerHi:
      '“Pending Sync” इंगित करता है कि आपका मामला या दस्तावेज़ ऑफ़लाइन रहने के दौरान आपके डिवाइस पर सुरक्षित रूप से सहेजा गया था। इंटरनेट कनेक्शन बहाल होते ही, यह स्वचालित रूप से सुरक्षित सर्वर पर अपलोड हो जाएगा।',
    verifiedAnswerOr:
      '“Pending Sync” ର ଅର୍ଥ ହେଉଛି ଆପଣଙ୍କ ତଥ୍ୟ ଅଫଲାଇନ୍ ଥିବାବେଳେ ଆପଣଙ୍କ ଡିଭାଇସରେ ସୁରକ୍ଷିତ ଭାବରେ ସାଇତା ଯାଇଛି। ଇଣ୍ଟରନେଟ୍ ଆସିବା ମାତ୍ରେ ଏହା ସ୍ୱୟଂଚାଳିତ ଭାବରେ ସିଙ୍କ୍ ହୋଇଯିବ।',
    relatedRoute: '/patient/cases',
    actionButtonLabelEn: 'Check Sync Queue',
    actionButtonLabelHi: 'सिंक कतार देखें',
    actionButtonLabelOr: 'ସିଙ୍କ୍ କ୍ୟୁ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['pending sync', 'sync', 'upload queue', 'पेंडिंग सिंक', 'सिंक्रनाइज़ेशन', 'ସିଙ୍କ୍'],
  },
  {
    id: 'faq-sync-after-reconnect',
    category: 'OFFLINE_ACCESS',
    categoryLabelEn: 'Offline Access',
    categoryLabelHi: 'ऑफ़लाइन पहुँच',
    categoryLabelOr: 'ଅଫଲାଇନ୍ ପ୍ରବେଶ',
    questionEn: 'Will my information synchronize after reconnecting?',
    questionHi: 'क्या दोबारा कनेक्ट होने के बाद मेरी जानकारी सिंक हो जाएगी?',
    questionOr: 'ପୁନଃ ସଂଯୋଗ ହେବା ପରେ ମୋର ସୂଚନା ସିଙ୍କ୍ ହେବ କି?',
    verifiedAnswerEn:
      'Yes. Our background synchronization engine automatically detects when your device reconnects to Wi-Fi or cellular network and delivers queued triage requests and documents securely without data loss.',
    verifiedAnswerHi:
      'हाँ। हमारा बैकग्राउंड सिंक्रोनाइज़ेशन इंजन स्वचालित रूप से पहचानता है कि आपका डिवाइस वाई-फ़ाई या मोबाइल नेटवर्क से कब जुड़ता है और बिना किसी डेटा हानि के कतारबद्ध अनुरोधों को सुरक्षित रूप से भेजता है।',
    verifiedAnswerOr:
      'ହଁ। ଆମର ବ୍ୟାକଗ୍ରାଉଣ୍ଡ ସିଙ୍କ୍ ଇଞ୍ଜିନ୍ ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗ ହେବା ମାତ୍ରେ ସ୍ୱୟଂଚାଳିତ ଭାବରେ ସମସ୍ତ ଅନୁରୋଧକୁ ବିନା କୌଣସି ତଥ୍ୟ ନଷ୍ଟରେ ପଠାଇଦିଏ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'View Connection Status',
    actionButtonLabelHi: 'कनेक्शन स्थिति देखें',
    actionButtonLabelOr: 'ସଂଯୋଗ ସ୍ଥିତି ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['reconnect', 'online sync', 'background sync', 'ऑटो सिंक', 'କନେକ୍ଟ'],
  },

  // ========================================================
  // 6. PRIVACY AND SECURITY (3 FAQs)
  // ========================================================
  {
    id: 'faq-security-privacy',
    category: 'PRIVACY_AND_SECURITY',
    categoryLabelEn: 'Privacy & Security',
    categoryLabelHi: 'गोपनीयता एवं सुरक्षा',
    categoryLabelOr: 'ଗୋପନୀୟତା ଓ ସୁରକ୍ଷା',
    questionEn: 'Is my health information secure?',
    questionHi: 'क्या मेरी स्वास्थ्य जानकारी सुरक्षित है?',
    questionOr: 'ମୋର ସ୍ୱାସ୍ଥ୍ୟ ସୂଚନା କ’ଣ ସୁରକ୍ଷିତ?',
    verifiedAnswerEn:
      'Yes. All patient records, symptoms, and documents are protected with Row-Level Security (RLS) and encrypted in transit and at rest. Your health data is accessible only to you and authorized clinicians assigned to your cases.',
    verifiedAnswerHi:
      'हाँ। सभी रोगी रिकॉर्ड, लक्षण और दस्तावेज़ रो-लेवल सिक्योरिटी (RLS) से सुरक्षित हैं और एन्क्रिप्टेड हैं। आपका स्वास्थ्य डेटा केवल आपके और आपके मामलों में सौंपे गए अधिकृत चिकित्सकों के लिए ही सुलभ है।',
    verifiedAnswerOr:
      'ହଁ। ସମସ୍ତ ରୋଗୀ ରେକର୍ଡ, ଲକ୍ଷଣ ଏବଂ ଡକ୍ୟୁମେଣ୍ଟ Row-Level Security (RLS) ଏବଂ ଏନକ୍ରିପସନ୍ ଦ୍ୱାରା ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ। କେବଳ ଆପଣ ଏବଂ ଅନୁମୋଦିତ ଡାକ୍ତର ହିଁ ଏହା ଦେଖିପାରିବେ।',
    relatedRoute: '/patient/profile',
    actionButtonLabelEn: 'Review Privacy Policies',
    actionButtonLabelHi: 'गोपनीयता नीति देखें',
    actionButtonLabelOr: 'ଗୋପନୀୟତା ନୀତି ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['security', 'privacy', 'encrypted', 'safe', 'सुरक्षा', 'गोपनीयता', 'ଏନକ୍ରିପସନ୍', 'ସୁରକ୍ଷା'],
  },
  {
    id: 'faq-who-can-view-docs',
    category: 'PRIVACY_AND_SECURITY',
    categoryLabelEn: 'Privacy & Security',
    categoryLabelHi: 'गोपनीयता एवं सुरक्षा',
    categoryLabelOr: 'ଗୋପନୀୟତା ଓ ସୁରକ୍ଷା',
    questionEn: 'Who can view my health documents?',
    questionHi: 'मेरे स्वास्थ्य दस्तावेज़ कौन देख सकता है?',
    questionOr: 'ମୋର ସ୍ୱାସ୍ଥ୍ୟ ଡକ୍ୟୁମେଣ୍ଟ କିଏ ଦେଖିପାରିବେ?',
    verifiedAnswerEn:
      'Only you and authorized healthcare workers directly assigned to your triage review or referrals have permission to access your documents. Anonymous users and other patients are strictly denied access.',
    verifiedAnswerHi:
      'केवल आपके और आपके ट्राइएज समीक्षा या रेफरल के लिए सीधे सौंपे गए अधिकृत स्वास्थ्य कार्यकर्ताओं को आपके दस्तावेज़ों तक पहुँचने की अनुमति है। अन्य मरीजों को पहुंच से सख्त मना किया गया है।',
    verifiedAnswerOr:
      'କେବଳ ଆପଣ ଏବଂ ଆପଣଙ୍କ ମାମଲାରେ ସମ୍ପୃକ୍ତ ଅନୁମୋଦିତ ସ୍ୱାସ୍ଥ୍ୟକର୍ମୀ ହିଁ ଆପଣଙ୍କ ଡକ୍ୟୁମେଣ୍ଟ ଦେଖିପାରିବେ। ଅନ୍ୟ କୌଣସି ରୋଗୀ ଏହା ଦେଖିପାରିବେ ନାହିଁ।',
    relatedRoute: '/patient/documents',
    actionButtonLabelEn: 'Manage Document Permissions',
    actionButtonLabelHi: 'दस्तावेज़ अनुमतियां प्रबंधित करें',
    actionButtonLabelOr: 'ଅନୁମତି ପରିଚାଳନା କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['who can see', 'access control', 'doctor view', 'पहुंच', 'किसको दिखेगा', 'କିଏ ଦେଖିବ'],
  },
  {
    id: 'faq-srida-store-conversations',
    category: 'PRIVACY_AND_SECURITY',
    categoryLabelEn: 'Privacy & Security',
    categoryLabelHi: 'गोपनीयता एवं सुरक्षा',
    categoryLabelOr: 'ଗୋପନୀୟତା ଓ ସୁରକ୍ଷା',
    questionEn: 'Does Srida save my conversations?',
    questionHi: 'क्या स्रीदा मेरी बातचीत सहेजती है?',
    questionOr: 'ସ୍ରିଦା କ’ଣ ମୋର ବାର୍ତ୍ତାଳାପ ସାଇତି ରଖେ?',
    verifiedAnswerEn:
      'Srida stores your active chat history locally on your device only for your current session. Conversations are never used for external AI training, are strictly isolated from other patients, and are wiped clean upon logout or role switching. You can also clear chat history anytime.',
    verifiedAnswerHi:
      'स्रीदा आपके सक्रिय चैट इतिहास को केवल आपके वर्तमान सत्र के लिए स्थानीय रूप से आपके डिवाइस पर संग्रहीत करती है। बातचीत का उपयोग कभी भी बाहरी एआई प्रशिक्षण के लिए नहीं किया जाता है और लॉग आउट करने पर साफ़ कर दिया जाता है।',
    verifiedAnswerOr:
      'ସ୍ରିଦା ଆପଣଙ୍କ ବାର୍ତ୍ତାଳାପକୁ କେବଳ ଆପଣଙ୍କ ଡିଭାଇସରେ ହିଁ ସାଇତି ରଖେ। ଏହା ବାହ୍ୟ AI ଟ୍ରେନିଂ ପାଇଁ କଦାପି ବ୍ୟବହୃତ ହୁଏ ନାହିଁ ଏବଂ ଲଗ୍ ଆଉଟ୍ କଲେ ସମ୍ପୂର୍ଣ୍ଣ ସଫା ହୋଇଯାଏ।',
    relatedRoute: '/patient/profile',
    actionButtonLabelEn: 'View Privacy Settings',
    actionButtonLabelHi: 'गोपनीयता सेटिंग्स देखें',
    actionButtonLabelOr: 'ଗୋପନୀୟତା ସେଟିଂସ୍ ଦେଖନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['chat history', 'store conversation', 'ai training', 'चैट हिस्ट्री', 'डेटा', 'ଚାଟ୍ ହିଷ୍ଟ୍ରି'],
  },

  // ========================================================
  // 7. EMERGENCY HELP (3 FAQs)
  // ========================================================
  {
    id: 'faq-emergency-ambulance',
    category: 'EMERGENCY_HELP',
    categoryLabelEn: 'Emergency Help',
    categoryLabelHi: 'आपातकालीन सहायता',
    categoryLabelOr: 'ଜରୁରୀକାଳୀନ ସହାୟତା',
    questionEn: 'How do I request an ambulance?',
    questionHi: 'मैं एम्बुलेंस का अनुरोध कैसे करूँ?',
    questionOr: 'ମୁଁ ଆମ୍ବୁଲାନ୍ସ କିପରି ଅନୁରୋଧ କରିବି?',
    verifiedAnswerEn:
      'Click the red Request Ambulance button available on your dashboard or call 108 immediately. In life-threatening emergencies, do not wait for online triage review.',
    verifiedAnswerHi:
      'अपने डैशबोर्ड पर उपलब्ध लाल एम्बुलेंस का अनुरोध करें बटन पर क्लिक करें या तुरंत 108 पर कॉल करें। जीवन-धमकाने वाली आपात स्थितियों में, ऑनलाइन ट्राइएज समीक्षा की प्रतीक्षा न करें।',
    verifiedAnswerOr:
      'ଆପଣଙ୍କ ଡ୍ୟାସବୋର୍ଡରେ ଥିବା ଲାଲ୍ ଆମ୍ବୁଲାନ୍ସ ଅନୁରୋଧ କରନ୍ତୁ ବଟନ୍ କ୍ଲିକ୍ କରନ୍ତୁ କିମ୍ବା ତୁରନ୍ତ 108 କୁ କଲ୍ କରନ୍ତୁ। ଜରୁରୀ ପରିସ୍ଥିତିରେ ଅନଲାଇନ୍ ସମୀକ୍ଷା ପାଇଁ ଅପେକ୍ଷା କରନ୍ତୁ ନାହିଁ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Request Ambulance Now',
    actionButtonLabelHi: 'अभी एम्बुलेंस का अनुरोध करें',
    actionButtonLabelOr: 'ତୁରନ୍ତ ଆମ୍ବୁଲାନ୍ସ ଅନୁରୋଧ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['ambulance', '108', 'emergency vehicle', 'hospital ride', 'एम्बुलेंस', '108 नंबर', 'ଆମ୍ବୁଲାନ୍ସ'],
  },
  {
    id: 'faq-emergency-steps',
    category: 'EMERGENCY_HELP',
    categoryLabelEn: 'Emergency Help',
    categoryLabelHi: 'आपातकालीन सहायता',
    categoryLabelOr: 'ଜରୁରୀକାଳୀନ ସହାୟତା',
    questionEn: 'What should I do during an emergency?',
    questionHi: 'आपात स्थिति के दौरान मुझे क्या करना चाहिए?',
    questionOr: 'ଜରୁରୀକାଳୀନ ପରିସ୍ଥିତିରେ ମୁଁ କ’ଣ କରିବା ଉଚିତ୍?',
    verifiedAnswerEn:
      'If you or someone nearby is experiencing chest pain, difficulty breathing, severe bleeding, or unconsciousness, dial 108 or 112 immediately or proceed to the nearest emergency department. Do not rely on chatbot messages or scheduled consultations.',
    verifiedAnswerHi:
      'यदि आप या आपके आस-पास कोई सीने में दर्द, सांस लेने में कठिनाई, अत्यधिक रक्तस्राव या बेहोशी का सामना कर रहा है, तो तुरंत 108 या 112 डायल करें या निकटतम आपातकालीन विभाग में जाएं।',
    verifiedAnswerOr:
      'ଯଦି ଆପଣ କିମ୍ବା କେହି ଛାତି ଯନ୍ତ୍ରଣା, ଶ୍ୱାସକଷ୍ଟ, ଅତ୍ୟଧିକ ରକ୍ତସ୍ରାବ କିମ୍ବା ଅଚେତ ହୋଇପଡିଛନ୍ତି, ତୁରନ୍ତ 108 କିମ୍ବା 112 କୁ କଲ୍ କରନ୍ତୁ କିମ୍ବା ନିକଟସ୍ଥ ଡାକ୍ତରଖାନାକୁ ଯାଆନ୍ତୁ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Emergency Protocol',
    actionButtonLabelHi: 'आपातकालीन प्रोटोकॉल',
    actionButtonLabelOr: 'ଜରୁରୀକାଳୀନ ପ୍ରୋଟୋକଲ୍',
    lastReviewedDate: '2026-09-26',
    keywords: ['emergency steps', 'crisis', 'urgent care', 'आपातकालीन कदम', 'तुरंत सहायता', 'ଜରୁରୀ ପଦକ୍ଷେପ'],
  },
  {
    id: 'faq-call-108-112',
    category: 'EMERGENCY_HELP',
    categoryLabelEn: 'Emergency Help',
    categoryLabelHi: 'आपातकालीन सहायता',
    categoryLabelOr: 'ଜରୁରୀକାଳୀନ ସହାୟତା',
    questionEn: 'How do I call 108 or 112?',
    questionHi: 'मैं 108 या 112 पर कैसे कॉल करूँ?',
    questionOr: 'ମୁଁ 108 କିମ୍ବା 112 କୁ କିପରି କଲ୍ କରିବି?',
    verifiedAnswerEn:
      'Dial 108 directly on your telephone for state emergency ambulance service, or dial 112 for the unified emergency response support system. Both numbers are toll-free and operate 24/7 across India.',
    verifiedAnswerHi:
      'राज्य आपातकालीन एम्बुलेंस सेवा के लिए अपने टेलीफोन पर सीधे 108 डायल करें, या एकीकृत आपातकालीन प्रतिक्रिया सहायता प्रणाली के लिए 112 डायल करें। दोनों नंबर टोल-फ्री हैं और 24/7 काम करते हैं।',
    verifiedAnswerOr:
      'ଜରୁରୀକାଳୀନ ଆମ୍ବୁଲାନ୍ସ ସେବା ପାଇଁ ସିଧାସଳଖ 108 ଡାଏଲ୍ କରନ୍ତୁ, କିମ୍ବା ଜରୁରୀକାଳୀନ ସହାୟତା ପାଇଁ 112 ଡାଏଲ୍ କରନ୍ତୁ। ଏହି ଦୁଇଟି ନମ୍ବର ସମ୍ପୂର୍ଣ୍ଣ ମାଗଣା ଏବଂ 24/7 କାର୍ଯ୍ୟକ୍ଷମ।',
    relatedRoute: '/patient/dashboard',
    actionButtonLabelEn: 'Call Emergency Services',
    actionButtonLabelHi: 'आपातकालीन सेवाओं को कॉल करें',
    actionButtonLabelOr: 'ଜରୁରୀକାଳୀନ ସେବାକୁ କଲ୍ କରନ୍ତୁ',
    lastReviewedDate: '2026-09-26',
    keywords: ['108', '112', 'toll free', 'dial', 'call emergency', 'कॉल', 'नंबर', 'ଫୋନ୍ କଲ୍'],
  },
];
