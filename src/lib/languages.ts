import { SupportedLocale } from './types';

export interface LanguageMeta {
  code: SupportedLocale;
  nameEn: string;
  nameNative: string;
  script: string;
  direction: 'ltr' | 'rtl';
  bcp47: string;
  speechRecognitionSupported: boolean;
  textToSpeechSupported: boolean;
  sampleSymptom: string;
  sampleComplaint: string;
  emergencyNotice: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    nameEn: 'English',
    nameNative: 'English',
    script: 'Latin',
    direction: 'ltr',
    bcp47: 'en-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'Severe chest tightness radiating to left arm with breathlessness since morning.',
    sampleComplaint: 'Acute chest pain and shortness of breath',
    emergencyNotice: 'Emergency: Dial 108 or 112 immediately for life-threatening medical emergencies.',
  },
  {
    code: 'as',
    nameEn: 'Assamese',
    nameNative: 'অসমীয়া',
    script: 'Assamese',
    direction: 'ltr',
    bcp47: 'as-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'ৰাতিপুৱাৰ পৰা বুকুত প্ৰচণ্ড বিষ আৰু উশাহ লোৱাত কষ্ট হৈছে, বাওঁহাতখন বিষাইছে।',
    sampleComplaint: 'বুকুৰ তীব্ৰ বিষ আৰু উশাহ লোৱাত কষ্ট',
    emergencyNotice: 'জৰুৰীকালীন: জীৱন বিপন্ন হ’লে তৎকালীনভাৱে ১০৮ বা ১১২ নম্বৰত যোগাযোগ কৰক।',
  },
  {
    code: 'bn',
    nameEn: 'Bengali',
    nameNative: 'বাংলা',
    script: 'Bengali',
    direction: 'ltr',
    bcp47: 'bn-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'সকাল থেকে বুকে প্রচণ্ড ব্যথা, বাঁ হাতে ছড়িয়ে পড়ছে এবং শ্বাস নিতে খুব কষ্ট হচ্ছে।',
    sampleComplaint: 'বুকে তীব্র ব্যথা ও শ্বাসকষ্ট',
    emergencyNotice: 'জরুরী সতর্কতা: জীবন-বিপন্নকারী পরিস্থিতিতে অবিলম্বে ১০৮ বা ১১২ নম্বরে ফোন করুন।',
  },
  {
    code: 'brx',
    nameEn: 'Bodo',
    nameNative: 'बड़ो',
    script: 'Devanagari',
    direction: 'ltr',
    bcp47: 'brx-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'फुंनिफ्रायनो बिखायाव गोबां सादों आरो हाबिला लानो गोब्राब जादों, आगसि आखाइ सादों।',
    sampleComplaint: 'बिखा सानाय आरो हाबिला लानो गोब्राब जानाय',
    emergencyNotice: 'गोख्रों खौरां: जिउ खैफोदनि समाव १०৮ एबा ১১২ आव खौरां हर।',
  },
  {
    code: 'doi',
    nameEn: 'Dogri',
    nameNative: 'डोगरी',
    script: 'Devanagari',
    direction: 'ltr',
    bcp47: 'doi-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'सवेरे थमां छाती च बड़ी तेज पीड़ ऐ, खब्बे हत्थ च जा करदी ऐ ते साह लैने च औखड़ ऐ।',
    sampleComplaint: 'छाती च तीखी पीड़ ते साह लैने दी औखड़',
    emergencyNotice: 'आपातकालीन सूचना: गंभीर स्थिति च झटपट १०८ या ११२ उप्पर काल करो।',
  },
  {
    code: 'gu',
    nameEn: 'Gujarati',
    nameNative: 'ગુજરાતી',
    script: 'Gujarati',
    direction: 'ltr',
    bcp47: 'gu-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'સવારથી છાતીમાં ખૂબ જ દુખાવો થાય છે, ડાબા હાથમાં ફેલાય છે અને શ્વાસ લેવામાં તકલીફ પડે છે.',
    sampleComplaint: 'છાતીમાં તીવ્ર દુખાવો અને શ્વાસ લેવામાં તકલીફ',
    emergencyNotice: 'કટોકટી ચેતવણી: જીવન જોખમમાં હોય તેવી સ્થિતિમાં તરત જ ૧૦૮ અથવા ૧૧૨ પર સંપર્ક કરો.',
  },
  {
    code: 'hi',
    nameEn: 'Hindi',
    nameNative: 'हिन्दी',
    script: 'Devanagari',
    direction: 'ltr',
    bcp47: 'hi-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'सुबह से सीने में बहुत तेज दर्द है, बाएं हाथ में खिंचाव हो रहा है और सांस लेने में भारी तकलीफ है।',
    sampleComplaint: 'सीने में तेज दर्द और सांस लेने में कठिनाई',
    emergencyNotice: 'आपातकालीन चेतावनी: जीवन-घातक स्थिति में तुरंत १०८ या ११२ पर कॉल करें।',
  },
  {
    code: 'kn',
    nameEn: 'Kannada',
    nameNative: 'ಕನ್ನಡ',
    script: 'Kannada',
    direction: 'ltr',
    bcp47: 'kn-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'ಬೆಳಗಿನಿಂದ ಎದೆಯಲ್ಲಿ ತೀವ್ರವಾದ ನೋವು ಕಾಣಿಸಿಕೊಂಡಿದೆ, ಎಡಗೈಗೆ ಹರಡುತ್ತಿದೆ ಮತ್ತು ಉಸಿರಾಡಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ.',
    sampleComplaint: 'ತೀವ್ರ ಎದೆನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ',
    emergencyNotice: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ: ಜೀವಕ್ಕೆ ಅಪಾಯವಿದ್ದಲ್ಲಿ ತಕ್ಷಣವೇ ೧೦೮ ಅಥವಾ ೧೧೨ ಗೆ ಕರೆ ಮಾಡಿ.',
  },
  {
    code: 'ks',
    nameEn: 'Kashmiri',
    nameNative: 'کٲشُر',
    script: 'Perso-Arabic',
    direction: 'rtl',
    bcp47: 'ks-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'صبحے پیٹھہٕ چھ سینَس مَنٛز سخت داگ، کھووُر اَتھہٕ نِوان تہٕ دَم پھُٹان۔',
    sampleComplaint: 'سینَس مَنٛز سخت داگ تہٕ دَم پھُٹُن',
    emergencyNotice: 'ہنگامی اطلاع: خطرناک حالتس مَنٛز کٔرِو فورا ۱۰۸ یا ۱۱۲ پؠٹھ کال۔',
  },
  {
    code: 'kok',
    nameEn: 'Konkani',
    nameNative: 'कोंकणी',
    script: 'Devanagari',
    direction: 'ltr',
    bcp47: 'kok-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'सकाळ साकून काळजात खूब दूख आसा, दाव्या हातात वाडटा आनी श्वास घेवपाक त्रास जाता.',
    sampleComplaint: 'काळजात तीव्र दूख आनी श्वास घेवपाक त्रास',
    emergencyNotice: 'तातडीची सुचना: जीविताक धोको आशिल्ल्यार रोखडेंच १०८ वा ११२ चेर संपर्क करात.',
  },
  {
    code: 'mai',
    nameEn: 'Maithili',
    nameNative: 'मैथिली',
    script: 'Devanagari',
    direction: 'ltr',
    bcp47: 'mai-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'भोरे सँ छाती मे बड्ड जोर सँ दर्द भ रहल अछि, बाँया हाथ मे पसारि रहल अछि आ सांस लै मे कठिनाई अछि।',
    sampleComplaint: 'छाती मे तीव्र दर्द आ सांस फूलब',
    emergencyNotice: 'आपातकालीन चेतावनी: जान लेवा स्थिति मे तुरंत १०८ अथवा ११२ पर फोन करू।',
  },
  {
    code: 'ml',
    nameEn: 'Malayalam',
    nameNative: 'മലയാളം',
    script: 'Malayalam',
    direction: 'ltr',
    bcp47: 'ml-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'രാവിലെ മുതൽ നെഞ്ചിൽ കഠിനമായ വേദനയുണ്ട്, ഇടതുകൈയിലേക്ക് പടരുന്നു, ശ്വാസമെടുക്കാൻ വല്ലാതെ ബുദ്ധിമുട്ടുന്നു.',
    sampleComplaint: 'കഠിനമായ നെഞ്ചുവേദനയും ശ്വാസതടസ്സവും',
    emergencyNotice: 'അടിയന്തര മുന്നറിയിപ്പ്: അടിയന്തര സാഹചര്യങ്ങളിൽ ഉടൻ തന്നെ 108 അല്ലെങ്കിൽ 112 ൽ വിളിക്കുക.',
  },
  {
    code: 'mni',
    nameEn: 'Manipuri / Meitei',
    nameNative: 'মৈতৈলোন্',
    script: 'Bengali/Meetei',
    direction: 'ltr',
    bcp47: 'mni-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'অয়ুকতগী থৱাক্ত য়াম্না চিবগী ৱানা খংই, ওইথংবা খুত্তা সান্দোকখি অমসুং নুংশিৎ হোনবদা ৱাই।',
    sampleComplaint: 'থৱাক চিবগী ৱাবা অমসুং নুংশিৎ হোনবা ৱাবা',
    emergencyNotice: 'জরুরী পাউ: পুন্সিগী অকিবদা অথুবা ওইনা ১০৮ নত্রগা ১১২ দা কোল তৌবিয়ু।',
  },
  {
    code: 'mr',
    nameEn: 'Marathi',
    nameNative: 'मराठी',
    script: 'Devanagari',
    direction: 'ltr',
    bcp47: 'mr-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'सकाळपासून छातीत अतिशय तीव्र कळ येत आहे, डाव्या हाताकडे जात असून श्वास घेण्यास खूप त्रास होत आहे.',
    sampleComplaint: 'छातीत तीव्र वेदना आणि श्वास घेण्यास त्रास',
    emergencyNotice: 'तातडीची सूचना: जीवितास धोका असल्यास तात्काळ १०८ किंवा ११२ वर संपर्क साधा.',
  },
  {
    code: 'ne',
    nameEn: 'Nepali',
    nameNative: 'नेपाली',
    script: 'Devanagari',
    direction: 'ltr',
    bcp47: 'ne-NP',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'बिहानैदेखि छातीमा कडा दुखाइ भइरहेको छ, देब्रे हाततिर फैलिएको छ र सास फेर्न गाह्रो भइरहेको छ।',
    sampleComplaint: 'छातीमा तीव्र दुखाइ र सास फेर्न कठिनाइ',
    emergencyNotice: 'आपतकालीन सूचना: ज्यान जोखिममा हुँदा तुरुन्तै १०८ वा ११२ मा सम्पर्क गर्नुहोस्।',
  },
  {
    code: 'or',
    nameEn: 'Odia',
    nameNative: 'ଓଡ଼ିଆ',
    script: 'Odia',
    direction: 'ltr',
    bcp47: 'or-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'ସକାଳୁ ଛାତିରେ ପ୍ରବଳ ଯନ୍ତ୍ରଣା ହେଉଛି, ବାମ ହାତକୁ ବ୍ୟାପୁଛି ଏବଂ ନିଶ୍ୱାସ ନେବାରେ ଘୋର କଷ୍ଟ ହେଉଛି।',
    sampleComplaint: 'ଛାତିରେ ଗୁରୁତର ଯନ୍ତ୍ରଣା ଓ ଶ୍ୱାସକଷ୍ଟ',
    emergencyNotice: 'ଜରୁରୀକାଳୀନ ସୂଚନା: ପ୍ରାଣଘାତୀ ପରିସ୍ଥିତିରେ ତୁରନ୍ତ ୧୦୮ କିମ୍ବା ୧୧୨ କୁ କଲ୍ କରନ୍ତୁ।',
  },
  {
    code: 'pa',
    nameEn: 'Punjabi',
    nameNative: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    direction: 'ltr',
    bcp47: 'pa-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'ਸਵੇਰ ਤੋਂ ਛਾਤੀ ਵਿੱਚ ਬਹੁਤ ਤੇਜ਼ ਦਰਦ ਹੈ, ਖੱਬੇ ਹੱਥ ਵੱਲ ਵੱਧ ਰਿਹਾ ਹੈ ਅਤੇ ਸਾਹ ਲੈਣ ਵਿੱਚ ਬਹੁਤ ਔਖ ਹੋ ਰਹੀ ਹੈ।',
    sampleComplaint: 'ਛਾਤੀ ਵਿੱਚ ਗੰਭੀਰ ਦਰਦ ਅਤੇ ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼',
    emergencyNotice: 'ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ: ਜਾਨਲੇਵਾ ਸਥਿਤੀ ਵਿੱਚ ਤੁਰੰਤ ੧੦੮ ਜਾਂ ੧੧੨ ਤੇ ਸੰਪਰਕ ਕਰੋ।',
  },
  {
    code: 'sa',
    nameEn: 'Sanskrit',
    nameNative: 'संस्कृतम्',
    script: 'Devanagari',
    direction: 'ltr',
    bcp47: 'sa-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'प्रातःकालात् वक्षःस्थले तीव्रवेदना वर्तते, वामबाहुं प्रति प्रसृता अस्ति, श्वासग्रहणे च काठिन्यम् अनुभूयते।',
    sampleComplaint: 'वक्षोवेदना तथा श्वासकाठिन्यम्',
    emergencyNotice: 'आपत्कालीनचेतावनी: प्राणसंकटसमये शीघ्रं १०८ अथवा ११२ इत्यत्र सम्पर्कं कुर्वन्तु।',
  },
  {
    code: 'sat',
    nameEn: 'Santali',
    nameNative: 'ᱥᱟᱱᱛᱟᱲᱤ',
    script: 'Ol Chiki',
    direction: 'ltr',
    bcp47: 'sat-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'ᱥᱮᱛᱟᱜ ᱠᱷᱚᱱ ᱠᱚᱲᱟᱢ ᱨᱮ ᱟᱹᱰᱤ ᱡᱩᱨ ᱦᱟᱹᱥᱩ ᱠᱟᱱᱟ, ᱞᱮᱸᱜᱟ ᱛᱤ ᱥᱮᱫ ᱯᱟᱥᱱᱟᱣᱜ ᱠᱟᱱᱟ ᱟᱨ ᱥᱟᱦᱮᱫ ᱦᱟᱛᱟᱣ ᱨᱮ ᱠᱚᱥᱴᱚ ᱦᱩᱭᱩᱜ ᱠᱟᱱᱟ᱾',
    sampleComplaint: 'ᱠᱚᱲᱟᱢ ᱦᱟᱹᱥᱩ ᱟᱨ ᱥᱟᱦᱮᱫ ᱦᱟᱛᱟᱣ ᱨᱮ ᱠᱚᱥᱴᱚ',
    emergencyNotice: 'ᱟᱯᱟᱛᱠᱟᱞᱤᱱ ᱥᱟᱹᱠᱷᱤᱭᱟᱹᱛ: ᱡᱤᱣᱤ ᱵᱟᱧᱪᱟᱣ ᱞᱟᱹᱜᱤᱫ ချက်ချင်း ᱑᱐᱘ ᱥᱮ ᱑᱑᱒ ᱨᱮ ᱯᱷᱚᱱ ᱢᱮ᱾',
  },
  {
    code: 'sd',
    nameEn: 'Sindhi',
    nameNative: 'سنڌي',
    script: 'Arabic',
    direction: 'rtl',
    bcp47: 'sd-IN',
    speechRecognitionSupported: false,
    textToSpeechSupported: true,
    sampleSymptom: 'صبح کان ڇاتيءَ ۾ ڏاڍو سور آھي، کاٻي ٻانھن طرف پکڙجي رھيو آھي ۽ ساھ کڻڻ ۾ سخت ڏکيائي ٿئي پئي.',
    sampleComplaint: 'ڇاتيءَ ۾ تيز سور ۽ ساھ کڻڻ ۾ ڏکيائي',
    emergencyNotice: 'ھنگامي خبرداري: جاني خطري جي صورت ۾ فوري طور ۱۰۸ يا ۱۱۲ تي ڪال ڪريو.',
  },
  {
    code: 'ta',
    nameEn: 'Tamil',
    nameNative: 'தமிழ்',
    script: 'Tamil',
    direction: 'ltr',
    bcp47: 'ta-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'காலையிலிருந்து நெஞ்சில் கடுமையான வலி உள்ளது, இடது கைக்கு பரவுகிறது மற்றும் மூச்சு விடுவதில் மிகுந்த சிரமம் ஏற்படுகிறது.',
    sampleComplaint: 'கடுமையான நெஞ்சுவலி மற்றும் மூச்சுத் திணறல்',
    emergencyNotice: 'அவசர எச்சரிக்கை: உயிருக்கு ஆபத்தான நிலையில் உடனடியாக 108 அல்லது 112 ஐ தொடர்பு கொள்ளவும்.',
  },
  {
    code: 'te',
    nameEn: 'Telugu',
    nameNative: 'తెలుగు',
    script: 'Telugu',
    direction: 'ltr',
    bcp47: 'te-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'ఉదయం నుండి ఛాతీలో తీవ్రమైన నొప్పి వస్తోంది, ఎడమ చేతికి వ్యాపిస్తోంది మరియు శ్వాస తీసుకోవడం చాలా కష్టంగా ఉంది.',
    sampleComplaint: 'తీవ్రమైన ఛాతీ నొప్పి మరియు శ్వాస ఆడకపోవడం',
    emergencyNotice: 'అత్యవసర హెచ్చరిక: ప్రాణాపాయ స్థితిలో వెంటనే 108 లేదా 112 కు కాల్ చేయండి.',
  },
  {
    code: 'ur',
    nameEn: 'Urdu',
    nameNative: 'اردو',
    script: 'Perso-Arabic',
    direction: 'rtl',
    bcp47: 'ur-IN',
    speechRecognitionSupported: true,
    textToSpeechSupported: true,
    sampleSymptom: 'صبح سے سینے میں شدید درد ہے، بائیں بازو میں پھیل رہا ہے اور سانس لینے میں شدید دشواری ہو رہی ہے۔',
    sampleComplaint: 'سینے میں شدید درد اور سانس پھولنا',
    emergencyNotice: 'ہنگامی انتباہ: جان لیوا حالت میں فوری طور پر ۱۰۸ یا ۱۱۲ پر کال کریں۔',
  },
];

export const LANGUAGE_MAP = new Map<SupportedLocale, LanguageMeta>(
  SUPPORTED_LANGUAGES.map(lang => [lang.code, lang])
);

export function getLanguageMeta(code: SupportedLocale): LanguageMeta {
  return LANGUAGE_MAP.get(code) || SUPPORTED_LANGUAGES[0];
}

export function isRTLLocale(code: SupportedLocale): boolean {
  const meta = getLanguageMeta(code);
  return meta.direction === 'rtl';
}

export function detectBrowserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  try {
    const navLangs = navigator.languages || [navigator.language];
    for (const lang of navLangs) {
      const lower = lang.toLowerCase();
      const prefix = lower.split('-')[0] as SupportedLocale;
      if (LANGUAGE_MAP.has(prefix)) {
        return prefix;
      }
      // Special mappings for Indian locales
      if (lower.startsWith('bn')) return 'bn';
      if (lower.startsWith('gu')) return 'gu';
      if (lower.startsWith('hi')) return 'hi';
      if (lower.startsWith('kn')) return 'kn';
      if (lower.startsWith('ml')) return 'ml';
      if (lower.startsWith('mr')) return 'mr';
      if (lower.startsWith('or') || lower.startsWith('ory')) return 'or';
      if (lower.startsWith('pa')) return 'pa';
      if (lower.startsWith('ta')) return 'ta';
      if (lower.startsWith('te')) return 'te';
      if (lower.startsWith('ur')) return 'ur';
      if (lower.startsWith('as')) return 'as';
      if (lower.startsWith('ne')) return 'ne';
      if (lower.startsWith('sa')) return 'sa';
      if (lower.startsWith('ks')) return 'ks';
      if (lower.startsWith('sd')) return 'sd';
    }
  } catch {
    // fallback
  }
  return 'en';
}

export function detectTextLanguage(text: string): { locale: SupportedLocale; confidence: number } {
  if (!text || text.trim().length === 0) {
    return { locale: 'en', confidence: 0.5 };
  }

  // Unicode Script range detection for Indian Scripts
  const scriptCounts: Record<string, number> = {
    Devanagari: 0, // hi, mr, ne, sa, brx, doi, kok, mai
    Bengali: 0,    // bn, as, mni
    Odia: 0,       // or
    Gurmukhi: 0,   // pa
    Gujarati: 0,   // gu
    Tamil: 0,      // ta
    Telugu: 0,     // te
    Kannada: 0,    // kn
    Malayalam: 0,  // ml
    Arabic: 0,     // ur, sd, ks
    OlChiki: 0,    // sat
    Latin: 0,      // en
  };

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0900 && code <= 0x097F) scriptCounts.Devanagari++;
    else if (code >= 0x0980 && code <= 0x09FF) scriptCounts.Bengali++;
    else if (code >= 0x0B00 && code <= 0x0B7F) scriptCounts.Odia++;
    else if (code >= 0x0A00 && code <= 0x0A7F) scriptCounts.Gurmukhi++;
    else if (code >= 0x0A80 && code <= 0x0AFF) scriptCounts.Gujarati++;
    else if (code >= 0x0B80 && code <= 0x0BFF) scriptCounts.Tamil++;
    else if (code >= 0x0C00 && code <= 0x0C7F) scriptCounts.Telugu++;
    else if (code >= 0x0C80 && code <= 0x0CFF) scriptCounts.Kannada++;
    else if (code >= 0x0D00 && code <= 0x0D7F) scriptCounts.Malayalam++;
    else if (code >= 0x0600 && code <= 0x06FF) scriptCounts.Arabic++;
    else if (code >= 0x1C50 && code <= 0x1C7F) scriptCounts.OlChiki++;
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) scriptCounts.Latin++;
  }

  // Find max script
  let maxScript = 'Latin';
  let maxCount = 0;
  let totalIndic = 0;

  for (const [script, count] of Object.entries(scriptCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxScript = script;
    }
    if (script !== 'Latin') totalIndic += count;
  }

  if (maxCount === 0) {
    return { locale: 'en', confidence: 0.5 };
  }

  const confidence = Math.min(0.98, Math.max(0.65, maxCount / (maxCount + 5)));

  if (maxScript === 'Odia') return { locale: 'or', confidence };
  if (maxScript === 'Tamil') return { locale: 'ta', confidence };
  if (maxScript === 'Telugu') return { locale: 'te', confidence };
  if (maxScript === 'Kannada') return { locale: 'kn', confidence };
  if (maxScript === 'Malayalam') return { locale: 'ml', confidence };
  if (maxScript === 'Gujarati') return { locale: 'gu', confidence };
  if (maxScript === 'Gurmukhi') return { locale: 'pa', confidence };
  if (maxScript === 'OlChiki') return { locale: 'sat', confidence };
  if (maxScript === 'Arabic') return { locale: 'ur', confidence };
  if (maxScript === 'Bengali') {
    // Distinguish Bengali and Assamese by unique characters
    if (text.includes('ৰ') || text.includes('ৱ')) return { locale: 'as', confidence };
    return { locale: 'bn', confidence };
  }
  if (maxScript === 'Devanagari') {
    // Distinguish Marathi / Nepali / Sanskrit / Hindi
    if (text.includes('आहे') || text.includes('नाही') || text.includes('कळ')) return { locale: 'mr', confidence };
    if (text.includes('छ') || text.includes('भइरहेको') || text.includes('हुन्छ')) return { locale: 'ne', confidence };
    if (text.includes('अस्ति') || text.includes('भवति') || text.includes('कुर्वन्तु')) return { locale: 'sa', confidence };
    if (text.includes('अछि') || text.includes('सँ') || text.includes('भेल')) return { locale: 'mai', confidence };
    return { locale: 'hi', confidence };
  }

  return { locale: 'en', confidence };
}
