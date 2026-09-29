"""
Triage V3: GREEN Presentation Families (Part 4: Families 16 to 20)
"""

def r_int(low, high):
    import random
    return random.randint(low, high)

def r_float(low, high, dec=1):
    import random
    return round(random.uniform(low, high), dec)

GREEN_FAMILIES_PART4 = [
    # 16. Dry Eye Syndrome / Digital Eye Strain
    {
        "family_id": "FAM_GRN_16",
        "concept_id": "CONCEPT_DRY_EYE_ASTHENOPIA",
        "urgency": "GREEN",
        "min_age": 18, "max_age": 60,
        "pain_min": 1, "pain_max": 2,
        "duration_hours": [48.0, 168.0, 336.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 84), "sbp": r_int(112, 128), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "bilateral_gritty_eyes; burning_sensation; asthenopia_screen_use; lubricating_drops_request; normal_vision",
                "en": {"cc": "Gritty tired eyes and burning sensation after 10 hours daily software work", "sym": "Sand-like roughness under eyelids by evening, blinking relieves temporarily, vision sharp 6/6, eyes white, no discharge"},
                "hi": {"cc": "कंप्यूटर पर काम के बाद आंखों में रेत जैसा चुभना और जलन, आई ड्रॉप चाहिए", "sym": "शाम होते ही आंखों में सूखापन, पलक झपकाने से आराम, नजर बिल्कुल साफ, कोई लाली या कीचड़ नहीं"},
                "or": {"cc": "କମ୍ପ୍ୟୁଟର କାମ ପରେ ଆଖିରେ ବାଲି ବାଲି କୁଟକୁଟ ହେବା ଓ ଜଳାପୋଡ଼ା, ଆଇ ଡ୍ରପ୍ ଦରକାର", "sym": "ସନ୍ଧ୍ୟା ବେଳକୁ ଆଖି ଶୁଖିଲା ଲାଗିବା, ପତା ଫିଟାଇଲେ ଆରାମ, ଦୃଷ୍ଟି ସ୍ପଷ୍ଟ, କିଞ୍ଚିତ ଲାଲ୍ ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "digital_eye_strain; reflex_tearing; eye_fatigue",
                "en": {"cc": "Watering eyes and heaviness over eyelids when reading on tablet", "sym": "Eyes tire quickly when reading fine print, water streams down cheeks paradoxically, visual acuity normal"},
                "hi": {"cc": "टैबलेट पर पढ़ाई करते समय आंखों से पानी आना और भारीपन", "sym": "छोटे अक्षर पढ़ने पर आंखें थक जाना, नजर साफ, कोई दर्द या लाली नहीं"},
                "or": {"cc": "ଟାବ୍‌ଲେଟ୍ ପଢ଼ିବା ବେଳେ ଆଖିରୁ ପାଣି ବାହାରିବା ଓ ଆଖିପତା ଭାରୀ ଲାଗିବା", "sym": "ଛୋଟ ଅକ୍ଷର ପଢ଼ିଲେ ଆଖି ଥକିଯାଉଛି, ଦୃଷ୍ଟିଶକ୍ତି ସ୍ୱାଭାବିକ, କୌଣସି କଷ୍ଟ ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "keratoconjunctivitis_sicca_mild; stinging_eyes; air_conditioning",
                "en": {"cc": "Stinging dry eyes worsening in air-conditioned office", "sym": "Constant urge to close eyes and rest, improves on walking outside into humid air, afebrile"},
                "hi": {"cc": "एसी ऑफिस में बैठते ही आंखों में जलन और सूखापन", "sym": "आंखें बंद रखने का मन करना, बाहर खुली हवा में आराम, बुखार नहीं"},
                "or": {"cc": "ଏସି ଅଫିସ୍ ଭିତରେ ଆଖି ପୋଡ଼ିବା ଓ ଶୁଖିଲା ଲାଗିବା", "sym": "ଆଖି ବନ୍ଦ କରି ରଖିବାକୁ ଇଚ୍ଛା, ବାହାର ପବନରେ ଆରାମ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "asthenopia; end_of_day_blurring; lubricating_drops",
                "en": {"cc": "Eye fatigue and temporary blurring cleared by hard blinking", "sym": "Blurry vision clears immediately with tear drops, no double vision, pupils equal"},
                "hi": {"cc": "शाम को आंखों में थकान और पलक झपकने से साफ दिखने वाला धुंधलापन", "sym": "आंसू की बूंद डालते ही नजर साफ, कोई दोहरा दिखना नहीं, पुतलियां सामान्य"},
                "or": {"cc": "ସନ୍ଧ୍ୟା ବେଳେ ଆଖି ଥକି ଝାପ୍‌ସା ଦିଶିବା ଯାହା ଆଖି ପିଛୁଳା ମାରିଲେ ସଫା ହେଉଛି", "sym": "ଡ୍ରପ୍ ପକାଇଲେ ତୁରନ୍ତ ସଫା, ଦୁଇଟା ଦିଶୁନାହିଁ, ଆଖି ଡୋଳା ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T05",
                "concepts": "ocular_dryness; burning_eyes; healthy_conjunctiva",
                "en": {"cc": "Prickly eye irritation after long distance night driving", "sym": "Eyes feel parched, conjunctiva clear white, normal facial movement, alert"},
                "hi": {"cc": "रात में गाड़ी चलाने के बाद आंखों में सूखापन और चुभन", "sym": "आंखें सूखी लग रही हैं, कोई लाली या मवाद नहीं, पूरी तरह स्वस्थ"},
                "or": {"cc": "ରାତିରେ ଗାଡ଼ି ଚଳାଇବା ପରେ ଆଖି ଶୁଖି କୁଟକୁଟ ହେବା", "sym": "ଆଖି ଶୁଖିଲା, ଲାଲ୍ ବା ପୂଜ ନାହିଁ, ସମ୍ପୂର୍ଣ୍ଣ ସୁସ୍ଥ ଅଛନ୍ତି"}
            }
        ]
    },

    # 17. Simple Hemorrhoidal Flare / Chronic Constipation
    {
        "family_id": "FAM_GRN_17",
        "concept_id": "CONCEPT_SIMPLE_HEMORRHOIDS",
        "urgency": "GREEN",
        "min_age": 22, "max_age": 70,
        "pain_min": 2, "pain_max": 4,
        "duration_hours": [48.0, 72.0, 168.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(115, 134), "dbp": r_int(72, 84),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "painless_bright_red_rectal_bleeding_on_toilet_paper; hard_stools; chronic_constipation; no_anemia_signs; stable",
                "en": {"cc": "Few streaks of bright fresh red blood on toilet paper after passing hard stool", "sym": "Blood only on wiping outside of stool, no blood mixed into stool bulk, no tummy ache, no dizziness on standing, normal pink conjunctiva"},
                "hi": {"cc": "कड़ा मल त्याग करने के बाद टॉयलेट पेपर पर ताजे लाल खून की कुछ लकीरें", "sym": "खून सिर्फ पोंछने पर बाहर लगा है, मल के अंदर कोई खून नहीं, पेट में कोई दर्द नहीं, चक्कर नहीं"},
                "or": {"cc": "ଟାଣ ଝାଡ଼ା ହେବା ପରେ କନା ବା ପେପରରେ ସାମାନ୍ୟ ତାଜା ଲାଲ୍ ରକ୍ତ ଦାଗ", "sym": "କେବଳ ପୋଛିବା ବେଳେ ବାହାରେ ରକ୍ତ ଲାଗୁଛି, ଝାଡ଼ା ଭିତରେ ରକ୍ତ ନାହିଁ, ପେଟ ବିନ୍ଧା ନାହିଁ, ମୁଣ୍ଡ ବୁଲାଉ ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "external_hemorrhoid_mild; anal_cushion_swelling; pruritus_ani",
                "en": {"cc": "Small pea-sized soft swelling at anal margin causing discomfort on sitting", "sym": "Soft grape-like lump that reduces when pushed gently, mild itching, no throbbing pain, afebrile"},
                "hi": {"cc": "मलद्वार के किनारे मटर जैसा छोटा नरम मस्सा जिससे बैठने में असुविधा", "sym": "नरम मस्सा जो हल्का दबाने पर अंदर चला जाता है, हल्की खुजली, कोई तेज टीस नहीं, बुखार नहीं"},
                "or": {"cc": "ମଳଦ୍ୱାର କଡ଼ରେ ମଟର ଦାନା ଭଳି ନରମ ଛୋଟ ଅର୍ଶ ମାଂସ ଯାହା ବସିଲେ କଷ୍ଟ ଦେଉଛି", "sym": "ନରମ ମାଂସ ଅଙ୍କୁର ଯାହା ସାମାନ୍ୟ ଚିପିଲେ ଭିତରକୁ ଯାଉଛି, କୁଣ୍ଡାଇ ହେବା, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "chronic_constipation_anal_fissure_minor; superficial_tear; ointment_request",
                "en": {"cc": "Sharp sting like paper cut during bowel movement after constipation", "sym": "Stinging lasts 5 minutes after toilet then settles, requesting stool softener syrup, walking normally"},
                "hi": {"cc": "कब्ज के बाद शौच करते समय मलद्वार में कागज के कटने जैसी जलन", "sym": "शौच के बाद 5 मिनट जलन फिर ठीक, पेट साफ करने का सिरप चाहिए, सामान्य चाल-ढाल"},
                "or": {"cc": "କୋଷ୍ଠକାଠିନ୍ୟ ପରେ ଝାଡ଼ା ଯିବା ବେଳେ କାଗଜ କଟିଲା ଭଳି ପୋଡ଼ିବା", "sym": "ଝାଡ଼ା ପରେ ୫ ମିନିଟ୍ ପୋଡ଼ାଜଳା ପରେ ଶାନ୍ତ, ପେଟ ସଫା ସିରପ୍ ଦରକାର, ସ୍ୱାଭାବିକ ଚାଲି"}
            },
            {
                "sub_id": "T04",
                "concepts": "piles_flare; mild_discomfort_sitting; no_weight_loss",
                "en": {"cc": "Longstanding piles irritation after long motorcycle trip", "sym": "Familiar hemorrhoid lump tender when riding scooter, warm sitz bath gives relief, appetite normal"},
                "hi": {"cc": "बाइक चलाने के बाद बवासीर के मस्सों में हल्की जलन और भारीपन", "sym": "वही पुराना जाना-पहचाना मस्सा, गर्म पानी में बैठने से आराम मिलता है, भूख ठीक"},
                "or": {"cc": "ବାଇକ୍ ଚଳାଇବା ପରେ ଅର୍ଶ ମାଂସ ବାହାରି କଷ୍ଟ ଓ ପୋଡ଼ାଜଳା", "sym": "ସେହି ପୁରୁଣା ମାଂସ ବାହାରିଛି, ଉଷୁମ ପାଣିରେ ବସିଲେ ଆରାମ ଲାଗୁଛି, ଭୋକ ଭଲ"}
            },
            {
                "sub_id": "T05",
                "concepts": "anal_pruritus_hemorrhoidal; hygiene_advice_needed; stable",
                "en": {"cc": "Itching around back passage with small droplet of fresh blood on stool", "sym": "Pruritus worse in humid heat, no black tarry stools, no abdominal tenderness"},
                "hi": {"cc": "मलद्वार के पास खुजली और शौच के साथ ताजा खून की एक बूंद", "sym": "गर्मी में खुजली बढ़ना, कोई काला दस्त नहीं, पेट बिल्कुल ठीक है"},
                "or": {"cc": "ମଳଦ୍ୱାର ପାଖରେ କୁଣ୍ଡାଇ ହେବା ଓ ଝାଡ଼ା ସହ ଟୋପାଏ ତାଜା ରକ୍ତ", "sym": "ଗରମରେ କୁଣ୍ଡିଆଣି ବଢ଼ୁଛି, କଳା ଝାଡ଼ା ନୁହେଁ, ପେଟ ସମ୍ପୂର୍ଣ୍ଣ ନରମ"}
            }
        ]
    },

    # 18. Localized Mild Insect Bite (Small Papule)
    {
        "family_id": "FAM_GRN_18",
        "concept_id": "CONCEPT_MILD_INSECT_BITE",
        "urgency": "GREEN",
        "min_age": 6, "max_age": 70,
        "pain_min": 1, "pain_max": 2,
        "duration_hours": [6.0, 12.0, 24.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(112, 128), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "localized_mosquito_papule; mild_erythema_1cm; central_punctum; intense_pruritus; no_anaphylaxis; afebrile",
                "en": {"cc": "Single itchy red mosquito bite lump on forearm with central dot", "sym": "Small 1cm itchy wheel on outer wrist, central bite punctum visible, no swelling of lips or face, breathing completely comfortable"},
                "hi": {"cc": "कलाई पर मच्छर काटने से छोटा लाल दाना और तेज खुजली", "sym": "1 सेमी का छोटा लाल चकत्ता जिसके बीच में डंक का निशान है, होंठ या चेहरे पर कोई सूजन नहीं, सांस बिल्कुल ठीक"},
                "or": {"cc": "କବଜି ଉପରେ ମଶା କାମୁଡ଼ି ଛୋଟ ଲାଲ୍ ଚିହ୍ନ ଓ କୁଣ୍ଡାଇ ହେବା", "sym": "୧ ସେମିର ଛୋଟ ଲାଲ୍ ପ୍ୟାଚ୍ ମଝିରେ ବିନ୍ଧା ଚିହ୍ନ, ମୁହଁ ବା ଓଠ ଫୁଲିନାହିଁ, ନିଶ୍ୱାସ ସମ୍ପୂର୍ଣ୍ଣ ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T02",
                "concepts": "ant_bite_papule; sterile_pustule_punctate; calamine_request",
                "en": {"cc": "Three tiny itchy ant bites on ankle requesting soothing lotion", "sym": "Small itchy red dots from garden red ants, ice cube relieved stinging, no red spreading streaks"},
                "hi": {"cc": "टखने पर लाल चींटी काटने से तीन छोटे दाने और खुजली", "sym": "बगीचे में चींटियों के काटने से लाल दाने, बर्फ लगाने से आराम, कोई फैलाव या बुखार नहीं"},
                "or": {"cc": "ଗୋଇଠି ଉପରେ ନାଲି ପିମ୍ପୁଡ଼ି କାମୁଡ଼ି ତିନୋଟି ଛୋଟ ଦାନା ଓ କୁଣ୍ଡାଇ ହେବା", "sym": "ବଗିଚାରେ ପିମ୍ପୁଡ଼ି କାମୁଡ଼ା, ବରଫ ଘଷିଲେ ଆରାମ, କୌଣସି ଲାଲ୍ ଗାର ନାହିଁ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "midge_bite; localized_wheal; antihistamine_request",
                "en": {"cc": "Itchy red bump on back of neck from evening park walk", "sym": "Firm pea-sized itchy papule, no difficulty swallowing, no rash on chest, afebrile"},
                "hi": {"cc": "पार्क में टहलने के बाद गर्दन के पीछे कीड़े का डंक और लाल सूजन", "sym": "मटर जैसा छोटा दाना, निगलने में कोई तकलीफ नहीं, सीने पर कोई दाने नहीं, बुखार नहीं"},
                "or": {"cc": "ପାର୍କରେ ବୁଲିବା ପରେ ବେକ ପଛପଟେ କୀଟ କାମୁଡ଼ି ଛୋଟ ଫୁଲା ଓ କୁଣ୍ଡାଇ", "sym": "ଛୋଟ ମଟର ଭଳି ଫୁଲା, ଢୋକିବାରେ କଷ୍ଟ ନାହିଁ, ଛାତିରେ ଦାଗ ନାହିଁ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "flea_bite_grouped; lower_leg_pruritus; localized",
                "en": {"cc": "Group of 4 itchy red spots around sock line after petting puppy", "sym": "Typical flea bite cluster on lower shin, highly itchy, skin cool around bites, normal vitals"},
                "hi": {"cc": "कुत्ते को छूने के बाद मोजे के पास पैर में चार लाल खुजलीदार दाने", "sym": "पिंडली पर छोटे-छोटे लाल दाने, बहुत खुजली, आसपास की चमड़ी सामान्य, बुखार नहीं"},
                "or": {"cc": "କୁକୁର ଛୁଇଁବା ପରେ ମୋଜା ପାଖରେ ଗୋଡ଼ରେ ଚାରୋଟି ଲାଲ୍ ଦାନା", "sym": "ଗୋଡ଼ ନଳିରେ ଛୋଟ ନାଲି ଦାନା, ବହୁତ କୁଣ୍ଡାଇ ହେଉଛି, ଚମଡ଼ା ସ୍ୱାଭାବିକ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "spider_bite_mild_non_necrotic; localized_wheal; clean",
                "en": {"cc": "Tender red insect welt on shoulder from cleaning dark storeroom", "sym": "Small 1.5cm red circle with no black center, no muscle cramps, pulse 76, healthy"},
                "hi": {"cc": "स्टोररूम साफ करते समय कंधे पर कीड़े का डंक, हल्का लाल गोला", "sym": "डेढ़ सेमी का लाल निशान, कोई काला दाग नहीं, मांसपेशियों में ऐंठन नहीं, नब्ज 76"},
                "or": {"cc": "ଭଣ୍ଡାର ଘର ସଫା ବେଳେ କାନ୍ଧରେ କୀଟ କାମୁଡ଼ି ଲାଲ୍ ଗୋଲ ଚିହ୍ନ", "sym": "୧.୫ ସେମି ଲାଲ୍ ଗୋଲାକାର ଚିହ୍ନ, କଳା ପଡ଼ିନାହିଁ, ମାଂସପେଶୀ ଟାଣୁନାହିଁ, ସୁସ୍ଥ ଅଛନ୍ତି"}
            }
        ]
    },

    # 19. Chronic Subungual Onychomycosis
    {
        "family_id": "FAM_GRN_19",
        "concept_id": "CONCEPT_CHRONIC_ONYCHOMYCOSIS",
        "urgency": "GREEN",
        "min_age": 25, "max_age": 75,
        "pain_min": 0, "pain_max": 1,
        "duration_hours": [720.0, 2160.0, 4320.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 84), "sbp": r_int(115, 130), "dbp": r_int(72, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "thickened_yellow_toenail; subungual_hyperkeratosis; painless_nail_dystrophy; no_paronychia; afebrile",
                "en": {"cc": "Thickened discolored yellow crumbling big toenail present for 6 months", "sym": "Toenail chalky and brittle with subungual debris, completely painless, no redness or pus at nail fold, walking normally"},
                "hi": {"cc": "छह महीने से पैर के अंगूठे का नाखून मोटा, पीला और भुरभुरा होना", "sym": "नाखून के नीचे सूखा चूना जैसा कचरा, कोई दर्द नहीं, नाखून के कोने पर कोई सूजन या मवाद नहीं"},
                "or": {"cc": "୬ ମାସ ହେଲା ଗୋଡ଼ ବୁଢ଼ା ଆଙ୍ଗୁଠି ନଖ ମୋଟା, ହଳଦିଆ ଓ ଝଡ଼ିବା", "sym": "ନଖ ତଳେ ଶୁଖିଲା ଚୂନ ଭଳି ମଇଳା, ଜମାରୁ ବିନ୍ଧା ନାହିଁ, ନଖ କୋଣରେ ପୂଜ ନାହିଁ, ଚାଲି ଠିକ୍ ଅଛି"}
            },
            {
                "sub_id": "T02",
                "concepts": "fungal_nail_infection; dystrophic_nail_plate; cosmetic_concern",
                "en": {"cc": "Rough yellowed toenails wanting antifungal paint prescription", "sym": "Both big toenails opaque and thickened, difficult to cut with ordinary clippers, non-tender"},
                "hi": {"cc": "पैर के नाखूनों में फंगस लगने से पीलापन, नाखून का लोशन चाहिए", "sym": "नाखून सख्त और भद्दे हो गए हैं, नेलकटर से नहीं कटते, कोई दर्द या सूजन नहीं"},
                "or": {"cc": "ଗୋଡ଼ ନଖରେ ଫଙ୍ଗସ୍ ଲାଗି ହଳଦିଆ ହେବା, ଔଷଧ ଲେଖାଇବାକୁ ଆସିଛନ୍ତି", "sym": "ନଖ ଶକ୍ତ ହୋଇ କଟି ହେଉନାହିଁ, କୌଣସି ଦରଜ ବା ଫୁଲା ନାହିଁ, ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T03",
                "concepts": "subungual_onychomycosis_distal; painless; no_cellulitis",
                "en": {"cc": "Yellow streak spreading along toenail edge noticed after monsoon season", "sym": "Nail plate lifted slightly at edge with crumbly white debris underneath, toe skin cool, no heat"},
                "hi": {"cc": "बरसात के बाद पैर के नाखून के किनारे पीली लकीर फैलना", "sym": "नाखून थोड़ा उठा हुआ, नीचे सूखा चूना, उंगली बिल्कुल सामान्य, कोई लाली नहीं"},
                "or": {"cc": "ବର୍ଷା ଋତୁ ପରେ ଗୋଡ଼ ନଖ କଡ଼ରେ ହଳଦିଆ ଦାଗ ମାଡ଼ିବା", "sym": "ନଖ ସାମାନ୍ୟ ଉପରକୁ ଉଠିଛି, ତଳେ ଖସରା ଗୁଣ୍ଡ, ଆଙ୍ଗୁଠି ଚମଡ଼ା ଥଣ୍ଡା, ନାଲି ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "chronic_nail_tinea; nail_bed_debris; healthy_foot",
                "en": {"cc": "Disfigured brittle toenails embarrassing when wearing sandals", "sym": "Painless slow progression over past year, shoes fit comfortably, pulses in feet strong"},
                "hi": {"cc": "नाखून भद्दे और रूखे होने से चप्पल पहनने में झिझक", "sym": "एक साल से धीमा बदलाव, कोई दर्द नहीं, जूता पहनने में कोई रुकावट नहीं"},
                "or": {"cc": "ନଖ ଭଙ୍ଗୁର ଓ ବିକୃତ ହେବା ଯୋଗୁଁ ଚପଲ ପିନ୍ଧିବାରେ ଲାଜ ଲାଗିବା", "sym": "ଗୋଟିଏ ବର୍ଷରୁ ଧୀରେ ଧୀରେ ହୋଇଛି, କଷ୍ଟ ନାହିଁ, ଜୋତା ଆରାମରେ ପିନ୍ଧି ହେଉଛି"}
            },
            {
                "sub_id": "T05",
                "concepts": "painless_nail_thickening; antifungal_advice; afebrile",
                "en": {"cc": "Yellow thickened toenail consultation for oral tablets advice", "sym": "Asymptomatic toenail thickening, liver history normal, walks 5km daily without difficulty"},
                "hi": {"cc": "नाखून के फंगस की गोली के बारे में डॉक्टर से सलाह लेने आए हैं", "sym": "नाखून में कोई दर्द नहीं, रोज 5 किमी घूमते हैं, सामान्य स्वास्थ्य उत्तम"},
                "or": {"cc": "ନଖ ଫଙ୍ଗସ୍ ଔଷଧ ଖାଇବା ବିଷୟରେ ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ପାଇଁ ଆସିଛନ୍ତି", "sym": "ନଖରେ ବିନ୍ଧା ନାହିଁ, ଦିନକୁ ୫ କିମି ଚାଲନ୍ତି, ସ୍ୱାସ୍ଥ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ ଭଲ"}
            }
        ]
    },

    # 20. Mild Uncomplicated Cystitis (Non-pregnant female, afebrile)
    {
        "family_id": "FAM_GRN_20",
        "concept_id": "CONCEPT_MILD_CYSTITIS",
        "urgency": "GREEN",
        "min_age": 18, "max_age": 45,
        "pain_min": 2, "pain_max": 4,
        "duration_hours": [24.0, 48.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(112, 128), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.6, 37.2), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "mild_dysuria; urinary_frequency; suprapubic_discomfort_mild; afebrile; no_flank_pain; not_pregnant",
                "en": {"cc": "Mild stinging burn at end of urination and passing small volumes frequently for 2 days", "sym": "Urgent need to pee every hour with small stream, mild ache over bladder, no back or side pain, temperature normal 36.8C, not pregnant"},
                "hi": {"cc": "दो दिन से पेशाब के अंत में हल्की जलन और बार-बार थोड़ा-थोड़ा पेशाब आना", "sym": "हर घंटे पेशाब की हाजत, पेट के निचले हिस्से में हल्का भारीपन, कमर या पसलियों में कोई दर्द नहीं, बुखार नहीं"},
                "or": {"cc": "ଦୁଇ ଦିନ ହେଲା ପରିସ୍ରା ଶେଷରେ ସାମାନ୍ୟ ପୋଡ଼ାଜଳା ଓ ବାରମ୍ବାର ଅଳ୍ପ ଅଳ୍ପ ହେବା", "sym": "ପ୍ରତି ଘଣ୍ଟାରେ ପରିସ୍ରା ଲାଗିବା, ତଳିପେଟରେ ସାମାନ୍ୟ ଭାରୀ, କମରରେ ବିନ୍ଧା ନାହିଁ, ଜ୍ୱର ନାହିଁ, ଗର୍ଭବତୀ ନୁହନ୍ତି"}
            },
            {
                "sub_id": "T02",
                "concepts": "lower_urinary_tract_irritation; bladder_fullness; clear_urine; afebrile",
                "en": {"cc": "Frequent urges to urinate with prickle sensation, drinking lots of barley water", "sym": "Urine pale yellow without visible blood, bladder feels irritated, no shivering fevers, kidneys non-tender"},
                "hi": {"cc": "पेशाब में हल्की चुभन और बार-बार जाने की इच्छा, जौ का पानी पी रहे हैं", "sym": "पेशाब का रंग साफ, कोई खून नहीं, पीठ में कोई दर्द नहीं, कंपकंपी या बुखार बिल्कुल नहीं"},
                "or": {"cc": "ପରିସ୍ରାରେ ସାମାନ୍ୟ କୁଟକୁଟ ଓ ବାରମ୍ବାର ଯିବା, ଯଅ ପାଣି ପିଉଛନ୍ତି", "sym": "ପରିସ୍ରାର ରଙ୍ଗ ପରିଷ୍କାର, ରକ୍ତ ନାହିଁ, ପିଠିରେ କଷ୍ଟ ନାହିଁ, ଥରିବା ବା ଜ୍ୱର ଆଦୌ ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "simple_acute_cystitis; dysuria; urinary_urgency; ambulatory",
                "en": {"cc": "Scalding sensation when passing water starting yesterday morning", "sym": "Slight pinch at bladder base when emptying, completely mobile and comfortable otherwise, afebrile"},
                "hi": {"cc": "कल सुबह से पेशाब करते समय हल्की जलन और गर्माहट का अहसास", "sym": "पेशाब खत्म होने पर हल्की टीस, बाकी सब ठीक है, कोई कमर दर्द या उल्टी नहीं"},
                "or": {"cc": "କାଲି ସକାଳୁ ପରିସ୍ରା ବେଳେ ସାମାନ୍ୟ ପୋଡ଼ିବା ଓ ଉଷୁମ ଭାବ", "sym": "ପରିସ୍ରା ସରିଲେ ସାମାନ୍ୟ ଟାଣିବା, ଅନ୍ୟ ସବୁ ଠିକ୍, କମର ବିନ୍ଧା ବା ବାନ୍ତି ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "mild_uti_outpatient; increased_frequency; no_systemic_upset",
                "en": {"cc": "Waking twice last night to urinate with mild stinging discomfort", "sym": "Passes urine in small quantities, feels much better after drinking tender coconut water, vitals normal"},
                "hi": {"cc": "रात को दो बार पेशाब के लिए उठना और हल्की जलन, नारियल पानी पी रहे हैं", "sym": "थोड़ा-थोड़ा पेशाब आना, नारियल पानी से आराम, बुखार नहीं, कमर में कोई दर्द नहीं"},
                "or": {"cc": "ରାତିରେ ଦୁଇ ଥର ପରିସ୍ରା ପାଇଁ ଉଠିବା ଓ ହାଲୁକା ପୋଡ଼ିବା, ଡାବ ପାଣି ପିଉଛନ୍ତି", "sym": "ଅଳ୍ପ ଅଳ୍ପ ପରିସ୍ରା ହେବା, ଡାବ ପାଣି ପିଇଲେ ଶାନ୍ତ, ଜ୍ୱର ନାହିଁ, କମରରେ କଷ୍ଟ ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "superficial_bladder_irritation; dysuria_mild; non_pregnant",
                "en": {"cc": "Burning urination requesting urine dipstick test and antibiotics", "sym": "Mild irritation relieved by water intake, no nausea, temperature 36.7C, walks briskly"},
                "hi": {"cc": "पेशाब में जलन, पेशाब की जांच और दवा करवाने के लिए आए हैं", "sym": "पानी पीने से जलन कम होना, उल्टी का मन नहीं, तापमान 36.7C, आराम से चल रहे हैं"},
                "or": {"cc": "ପରିସ୍ରା ପୋଡ଼ିବା, ପରିସ୍ରା ପରୀକ୍ଷା ଓ ଔଷଧ ପାଇଁ ଡାକ୍ତରଖାନା ଆସିଛନ୍ତି", "sym": "ପାଣି ପିଇଲେ କମୁଛି, ବାନ୍ତି ଭାବ ନାହିଁ, ୩୬.୭ ଡିଗ୍ରୀ ଉତ୍ତାପ, ସ୍ୱାଭାବିକ ଚାଲିବୁଲି ପାରୁଛନ୍ତି"}
            }
        ]
    }
]
