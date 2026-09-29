"""
Triage V3: Safety-Test Cohorts (RED and GREY)
==============================================
These records represent deterministic clinical emergency red flags and missing-information
scenarios used EXCLUSIVELY to test gate behavior. They must NEVER enter ML training!
"""

def r_int(low, high):
    import random
    return random.randint(low, high)

def r_float(low, high, dec=1):
    import random
    return round(random.uniform(low, high), dec)

RED_SAFETY_FAMILIES = [
    # 1. Acute Coronary Syndrome
    {
        "family_id": "FAM_RED_01",
        "concept_id": "CONCEPT_ACUTE_CORONARY_SYNDROME",
        "urgency": "RED",
        "min_age": 45, "max_age": 85,
        "pain_min": 8, "pain_max": 10,
        "duration_hours": [0.5, 1.0, 2.0],
        "vitals_func": lambda: {
            "hr": r_int(104, 130), "sbp": r_int(165, 205), "dbp": r_int(98, 118),
            "spo2": r_int(91, 95), "temp": r_float(36.5, 37.2), "rr": r_int(22, 28)
        },
        "rule_flag": "RF_CLINICAL_ACUTE_CHEST_PAIN; VITAL_HYPERTENSION_STAGE_2",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "retrosternal_crushing_chest_pain; radiation_to_arm_and_jaw; diaphoresis; severe_nausea; emergency_red_flag",
                "en": {"cc": "Severe retrosternal crushing chest pain with radiation to left shoulder and jaw", "sym": "Heavy pressure behind breastbone, cold clammy sweat, severe nausea, breathless"},
                "hi": {"cc": "सीने में अत्यधिक भारीपन और बाएं हाथ में खिंचाव", "sym": "छाती के बीच में तेज दबाव, दर्द बाएं हाथ और जबड़े तक फैलना, अत्यधिक पसीना और घबराहट"},
                "or": {"cc": "ଛାତିରେ ଅତ୍ୟଧିକ ଚାପ ଓ ବାମ ହାତକୁ ଯନ୍ତ୍ରଣା ବ୍ୟାପିବା", "sym": "ଛାତି ମଝିରେ ଭୀଷଣ ଯନ୍ତ୍ରଣା, ବାମ କାନ୍ଧ ଓ ବେକକୁ କଷ୍ଟ ବ୍ୟାପିବା, ପ୍ରବଳ ଝାଳ ଏବଂ ବାନ୍ତି ଭାବ"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_myocardial_infarction_suspect; elephant_on_chest; diaphoresis; emergency_red_flag",
                "en": {"cc": "Crushing chest tightness like elephant standing on breastbone with profuse sweating", "sym": "Cannot catch breath, agonizing central pressure, grey pale skin, vomiting"},
                "hi": {"cc": "छाती पर हाथी जैसा भारी वजन और पूरे शरीर पर पसीना", "sym": "सांस नहीं ली जा रही, सीने के बीच में भयानक दबाव, चेहरा पीला पड़ गया है"},
                "or": {"cc": "ଛାତି ଉପରେ ହାତୀ ଚାପିଲା ଭଳି ଅସହ୍ୟ ଚାପ ଓ ସାରା ଶରୀରରେ ଝାଳ", "sym": "ନିଶ୍ୱାସ ନେଇ ହେଉନାହିଁ, ଛାତି ମଝିରେ ଚରମ ଯନ୍ତ୍ରଣା, ଚେହେରା ଧଳା ପଡ଼ିଯିବା"}
            },
            {
                "sub_id": "T03",
                "concepts": "acute_coronary_ischemia; radiating_left_jaw; cold_clammy_skin; emergency_red_flag",
                "en": {"cc": "Choking retrosternal pain shooting into neck and left jaw since 45 minutes", "sym": "Constriction in throat and chest, drenched in cold sweat, clutching chest tightly"},
                "hi": {"cc": "गले और जबड़े में खिंचने वाला छाती का भयानक दर्द", "sym": "छाती में घुटन, ठंडा पसीना, मरीज छाती पकड़े हुए तड़प रहा है"},
                "or": {"cc": "ତଣ୍ଟି ଓ ଜହ୍ନାକୁ ଟାଣୁଥିବା ଛାତିର ଭୀଷଣ ଯନ୍ତ୍ରଣା", "sym": "ଛାତିରେ ନିଶ୍ୱାସ ରୁଦ୍ଧ, ଥଣ୍ଡା ଝାଳ, ରୋଗୀ ଦୁଇ ହାତରେ ଛାତି ଜାବୁଡ଼ି ଧରିଛନ୍ତି"}
            },
            {
                "sub_id": "T04",
                "concepts": "substernal_heaviness; diaphoresis; impending_doom; emergency_red_flag",
                "en": {"cc": "Intense substernal pressure and profound dizziness with feeling of impending doom", "sym": "Severe tight vise grip over ribs, clammy forehead, radiating left shoulder"},
                "hi": {"cc": "सीने के अंदर भारी दबाव, चक्कर और भयानक घबराहट", "sym": "पसलियों पर भारी जकड़न, ठंडा माथा, बाएं कंधे में खिंचाव"},
                "or": {"cc": "ଛାତି ଭିତରେ ଚରମ ଚାପ, ମୁଣ୍ଡ ବୁଲାଇବା ଓ ପ୍ରଚଣ୍ଡ ଭୟ", "sym": "ପଞ୍ଜରା ଉପରେ ଭାରୀ ଶିକୁଳି ବାନ୍ଧିଲା ଭଳି, କପାଳରେ ଝାଳ, ବାମ କାନ୍ଧରେ କଷ୍ଟ"}
            },
            {
                "sub_id": "T05",
                "concepts": "coronary_spasm_or_occlusion; arm_numbness; diaphoresis; emergency_red_flag",
                "en": {"cc": "Crushing central chest ache with numbness tingling down left arm", "sym": "Pain started suddenly at rest, cold clammy hands, unable to sit upright"},
                "hi": {"cc": "सीने में तेज दर्द और बाएं हाथ में सुन्नपन व झनझनाहट", "sym": "बैठे-बैठे अचानक दर्द, हाथ-पैर बिल्कुल ठंडे, सीधा बैठ नहीं पा रहे"},
                "or": {"cc": "ଛାତି ମଝିରେ ଭୀଷଣ ବିନ୍ଧା ଓ ବାମ ହାତ ଝିମଝିମ କାଲୁଆ ହେବା", "sym": "ବସିଥିବା ବେଳେ ହଠାତ୍ କଷ୍ଟ, ହାତଗୋଡ଼ ବରଫ ଭଳି ଥଣ୍ଡା, ବସି ରହିପାରୁ ନାହାନ୍ତି"}
            }
        ]
    },

    # 2. Acute Stroke / FAST
    {
        "family_id": "FAM_RED_02",
        "concept_id": "CONCEPT_ACUTE_STROKE_FAST",
        "urgency": "RED",
        "min_age": 45, "max_age": 88,
        "pain_min": 1, "pain_max": 7,
        "duration_hours": [0.5, 1.0, 2.0, 3.5],
        "vitals_func": lambda: {
            "hr": r_int(75, 108), "sbp": r_int(185, 230), "dbp": r_int(105, 125),
            "spo2": r_int(95, 99), "temp": r_float(36.4, 37.1), "rr": r_int(16, 22)
        },
        "rule_flag": "RF_CLINICAL_STROKE_FAST; VITAL_CRITICAL_HYPERTENSION",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "facial_droop_unilateral; arm_weakness; slurred_speech; acute_stroke_window; emergency_red_flag",
                "en": {"cc": "Sudden onset facial asymmetry, right arm weakness and slurred speech", "sym": "Acute right facial droop noticed 1 hour ago, complete inability to lift right arm, expressive dysphasia"},
                "hi": {"cc": "अचानक मुंह टेढ़ा होना और दाहिने हाथ में लकवा", "sym": "एक घंटे पहले अचानक चेहरे का दाहिना हिस्सा झुकना, दाहिना हाथ न उठना, बोलने में अत्यधिक लड़खड़ाहट"},
                "or": {"cc": "ଅଚାନକ ମୁହଁ ବଙ୍କା ହେବା ଓ ଡାହାଣ ହାତ ଅଚଳ ହେବା", "sym": "ହଠାତ୍ ମୁହଁ ଡାହାଣ ପଟକୁ ବଙ୍କିଯିବା, ଡାହାଣ ହାତ ଉଠାଇ ନପାରିବା, କଥା ସମ୍ପୂର୍ଣ୍ଣ ଅସ୍ପଷ୍ଟ ହେବା"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_hemiparesis; dysarthria; facial_asymmetry; emergency_red_flag",
                "en": {"cc": "Right sided arm and leg paralysis with inability to speak clearly noticed at breakfast", "sym": "Arm falls limp, drooling from right lip corner, confused speech, high blood pressure"},
                "hi": {"cc": "नाश्ते के समय अचानक दाहिना हाथ-पैर सुन्न होकर गिरना और बोली बंद होना", "sym": "हाथ बेजान होकर गिरना, मुंह के कोने से लार, बात समझ न आना, उच्च रक्तचाप"},
                "or": {"cc": "ଜଳଖିଆ ବେଳେ ହଠାତ୍ ଡାହାଣ ହାତଗୋଡ଼ ଅଚଳ ହୋଇ ତଳେ ପଡ଼ିବା ଓ କଥା ବନ୍ଦ", "sym": "ହାତ ନିର୍ଜୀବ ହୋଇ ଖସିପଡ଼ିବା, ମୁହଁ କୋଣରୁ ଲାଳ, କଥା ଅସଙ୍ଗତ, ଉଚ୍ଚ ରକ୍ତଚାପ"}
            },
            {
                "sub_id": "T03",
                "concepts": "fast_criteria_positive; acute_focal_neurological_deficit; emergency_red_flag",
                "en": {"cc": "Sudden face drooping on left side and dropping cup from hand", "sym": "Left arm plegia, unable to smile symmetrically, unintelligible vocal sounds, urgent CT required"},
                "hi": {"cc": "चेहरे का बायां हिस्सा लटक जाना और हाथ से कप छूटकर गिरना", "sym": "बायां हाथ बिल्कुल सुन्न, मुस्कुराने पर मुंह एक तरफ खिंचना, शब्द साफ न निकलना"},
                "or": {"cc": "ମୁହଁର ବାମ ପାଖ ଓହଳି ପଡ଼ିବା ଓ ହାତରୁ କପ୍ ଖସି ଭାଙ୍ଗିଯିବା", "sym": "ବାମ ହାତ ଅଚଳ, ହସିଲେ ମୁହଁ ବଙ୍କା, ଶବ୍ଦ ବାହାରୁ ନାହିଁ, ତୁରନ୍ତ ସିଟି ସ୍କାନ ଦରକାର"}
            },
            {
                "sub_id": "T04",
                "concepts": "cerebrovascular_accident_acute; speech_arrest; hemiplegia; emergency_red_flag",
                "en": {"cc": "Acute speech arrest and heavy dragging of right foot since 40 minutes", "sym": "Patient understands but cannot say words, right hand limp at side, alert"},
                "hi": {"cc": "40 मिनट से बोली बिल्कुल बंद और दाहिना पैर घिसट कर चलना", "sym": "मरीज समझ रहा है पर बोल नहीं पा रहा, दाहिना हाथ बेजान, पूरी तरह होश में"},
                "or": {"cc": "୪୦ ମିନିଟ୍ ହେଲା କଥା ସମ୍ପୂର୍ଣ୍ଣ ବନ୍ଦ ଓ ଡାହାଣ ଗୋଡ଼ ଘୋଷାରି ହେବା", "sym": "ରୋଗୀ ବୁଝୁଛନ୍ତି କିନ୍ତୁ କହିପାରୁ ନାହାନ୍ତି, ଡାହାଣ ହାତ ନିଷ୍କ୍ରିୟ, ସଚେତନ"}
            },
            {
                "sub_id": "T05",
                "concepts": "acute_brainstem_or_cerebral_ischemia; facial_palsy; emergency_red_flag",
                "en": {"cc": "Sudden crooked mouth, choking on water and inability to lift spoon", "sym": "Severe facial droop, swallow impaired, sudden onset within last 2 hours"},
                "hi": {"cc": "अचानक मुंह टेढ़ा, पानी पीने में अटकना और चम्मच न पकड़ पाना", "sym": "चेहरे पर स्पष्ट लकवा, निगलने में कठिनाई, दो घंटे के भीतर अचानक शुरू"},
                "or": {"cc": "ହଠାତ୍ ମୁହଁ ବଙ୍କା, ପାଣି ଢୋକିଲା ବେଳେ ବାଡ଼େଇ ହେବା ଓ ଚାମଚ ଧରି ନପାରିବା", "sym": "ମୁହଁରେ ସ୍ପଷ୍ଟ ପକ୍ଷାଘାତ, ଗିଳିବାରେ ବାଧା, ଗତ ୨ ଘଣ୍ଟା ମଧ୍ୟରେ ଅଚାନକ ହୋଇଛି"}
            }
        ]
    },

    # 3. Severe Hypoxic Respiratory Distress
    {
        "family_id": "FAM_RED_03",
        "concept_id": "CONCEPT_SEVERE_HYPOXIA_RESPIRATORY_DISTRESS",
        "urgency": "RED",
        "min_age": 18, "max_age": 82,
        "pain_min": 4, "pain_max": 8,
        "duration_hours": [1.0, 2.0, 3.0, 6.0],
        "vitals_func": lambda: {
            "hr": r_int(120, 150), "sbp": r_int(125, 160), "dbp": r_int(78, 98),
            "spo2": r_int(82, 88), "temp": r_float(37.4, 38.8), "rr": r_int(34, 44)
        },
        "rule_flag": "RF_CLINICAL_RESPIRATORY_DISTRESS; VITAL_CRITICAL_HYPOXIA; VITAL_CRITICAL_TACHYPNEA",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "gasping_respirations; peripheral_cyanosis; intercostal_indrawing; hypoxia_spo2_under_90; emergency_red_flag",
                "en": {"cc": "Gasping breathlessness with peripheral cyanosis and inability to complete single word", "sym": "Severe respiratory exhaustion, intercostal indrawing, dusky blue fingernails and lips, SpO2 84%"},
                "hi": {"cc": "सांस लेने में भारी कठिनाई, होंठ नीले पड़ना और दम घुटना", "sym": "बोलने में पूरी तरह असमर्थ, पसलियां अंदर खिंचना, उंगलियों और नाखूनों का नीला पड़ना, ऑक्सीजन 84%"},
                "or": {"cc": "ତୀବ୍ର ଶ୍ୱାସକଷ୍ଟ, ନୀଳ ପଡ଼ିଯିବା ଓ ଗୋଟିଏ ଶବ୍ଦ କହି ନପାରିବା", "sym": "ନିଶ୍ୱାସ ନେଇ ନପାରିବା, ପଞ୍ଜରା ଟାଣି ଧରିବା, ନଖ ଓ ଓଠ ନୀଳ ପଡ଼ିବା, ଅକ୍ସିଜେନ ୮୪%"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_respiratory_failure_impending; cyanosis; severe_dyspnea; emergency_red_flag",
                "en": {"cc": "Suffocating air hunger with blue tongue and struggling for breath", "sym": "Accessory muscles straining, oxygen saturation 85%, sweating with exhaustion"},
                "hi": {"cc": "दम घुटने जैसी सांस की तकलीफ और जीभ नीली पड़ना", "sym": "गर्दन की नसें खिंचना, ऑक्सीजन 85%, पसीने से तर-बतर, सांस के लिए छटपटाहट"},
                "or": {"cc": "ନିଶ୍ୱାସ ବନ୍ଦ ହେବା ଭଳି କଷ୍ଟ ଓ ଜିଭ ନୀଳ ପଡ଼ିଯିବା", "sym": "ବେକ ନସ ଟାଣି ହେବା, ଅକ୍ସିଜେନ ୮୫%, ଝାଳରେ ଭିଜି ଛଟପଟ ହେବା"}
            },
            {
                "sub_id": "T03",
                "concepts": "critical_hypoxemia; severe_tachypnea; exhaustion; emergency_red_flag",
                "en": {"cc": "Respiratory fatigue with SpO2 dropping to 83% despite inhalers", "sym": "Cannot speak words, tracheal tugging, lethargic from high work of breathing"},
                "hi": {"cc": "इनहेलर लेने के बाद भी ऑक्सीजन 83% तक गिरना और भारी सांस", "sym": "एक शब्द भी न बोल पाना, गले में सांस की नली खिंचना, सांस फूलने से थकान"},
                "or": {"cc": "ଇନହେଲର ନେଇ ବି ଅକ୍ସିଜେନ ୮୩%କୁ ଖସିବା ଓ ପ୍ରବଳ କଷ୍ଟ", "sym": "ଗୋଟିଏ ଶବ୍ଦ କହିପାରୁ ନାହାନ୍ତି, ଶ୍ୱାସନଳୀ ଟାଣି ହେବା, ଅବଶ ହୋଇ ପଡ଼ିବା"}
            },
            {
                "sub_id": "T04",
                "concepts": "severe_asthma_failure_threat; silent_chest_risk; emergency_red_flag",
                "en": {"cc": "Fighting for air with bluish discoloration around mouth", "sym": "Respiratory rate 38, intercostal recession, dusky skin, oxygen 86%"},
                "hi": {"cc": "मुंह के चारों तरफ नीलापन और सांस के लिए संघर्ष", "sym": "सांस की गति 38, छाती अंदर धंसना, चमड़ी नीली, ऑक्सीजन 86%"},
                "or": {"cc": "ମୁହଁ ଚାରିପାଖେ ନୀଳ ଦାଗ ଓ ନିଶ୍ୱାସ ପାଇଁ ସଂଘର୍ଷ", "sym": "ଶ୍ୱାସକ୍ରିୟା ୩୮, ଛାତି ପଞ୍ଜରା ତଳକୁ ଦବିଯିବା, ଅକ୍ସିଜେନ ୮୬%"}
            },
            {
                "sub_id": "T05",
                "concepts": "acute_pulmonary_edema_or_ards; severe_cyanosis; emergency_red_flag",
                "en": {"cc": "Drowning sensation in chest with blue lips and gasping", "sym": "Frothy sputum, severe hypoxia 85%, sweating cold, urgent resuscitation required"},
                "hi": {"cc": "सीने में पानी भरने जैसा अहसास, होंठ नीले और सांस उखड़ना", "sym": "झागदार कफ, गंभीर ऑक्सीजन कमी 85%, ठंडा पसीना, तुरंत आईसीयू की जरूरत"},
                "or": {"cc": "ଛାତିରେ ପାଣି ଜମିଲା ଭଳି ଶ୍ୱାସକଷ୍ଟ, ଓଠ ନୀଳ ଓ ନିଶ୍ୱାସ ଉଡ଼ିଯିବା", "sym": "ଫେଣଯୁକ୍ତ କଫ, ଅକ୍ସିଜେନ ୮୫%, ଥଣ୍ଡା ଝାଳ, ତୁରନ୍ତ ଜରୁରୀକାଳୀନ ଚିକିତ୍ସା ଦରକାର"}
            }
        ]
    },

    # 4. Acute Anaphylaxis
    {
        "family_id": "FAM_RED_04",
        "concept_id": "CONCEPT_ANAPHYLAXIS",
        "urgency": "RED",
        "min_age": 14, "max_age": 62,
        "pain_min": 2, "pain_max": 6,
        "duration_hours": [0.25, 0.5, 1.0],
        "vitals_func": lambda: {
            "hr": r_int(125, 150), "sbp": r_int(72, 84), "dbp": r_int(44, 54),
            "spo2": r_int(88, 93), "temp": r_float(36.7, 37.3), "rr": r_int(28, 36)
        },
        "rule_flag": "RF_CLINICAL_ANAPHYLAXIS; VITAL_CRITICAL_HYPOTENSION",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "acute_angioedema; inspiratory_stridor; circulatory_collapse; hypotension_under_85; emergency_red_flag",
                "en": {"cc": "Acute lip swelling, inspiratory stridor and collapse after insect sting", "sym": "Rapidly spreading facial angioedema, tightness in throat, high-pitched stridor, widespread hives, profound dizziness"},
                "hi": {"cc": "कीड़े के काटने के बाद होंठों में सूजन और सांस की नली बंद होना", "sym": "चेहरे और होंठों पर अचानक सूजन, गले में रुकावट, घरघराहट, पूरे शरीर पर लाल चकत्ते और चक्कर आकर गिरना"},
                "or": {"cc": "କୀଟ କାମୁଡ଼ିବା ପରେ ଓଠ ଫୁଲିବା ଓ ଶ୍ୱାସନଳୀ ବନ୍ଦ ହେବା", "sym": "ମୁହଁ ଓ ଓଠ ଅତ୍ୟଧିକ ଫୁଲିଯିବା, ଗଳା ବନ୍ଦ ହେବା ଭଳି ଲାଗିବା, ଘରଘର ଶବ୍ଦ, ସାରା ଶରୀରରେ କୁଣ୍ଡାଇ ଚିହ୍ନ"}
            },
            {
                "sub_id": "T02",
                "concepts": "anaphylactic_shock_peanut; airway_compromise; hypotension; emergency_red_flag",
                "en": {"cc": "Throat closing up with huge tongue swelling after eating peanut sauce", "sym": "Gasping stridor, blood pressure 78/48, covered in giant itchy wheals, fainting"},
                "hi": {"cc": "मूंगफली खाने के बाद जीभ फूलना और गले में सांस बंद होना", "sym": "सांस में सीटी जैसी घरघराहट, बीपी 78/48 तक गिरना, शरीर पर बड़े-बड़े चकत्ते, बेहोशी"},
                "or": {"cc": "ଚିନାବାଦାମ ଖାଇବା ପରେ ଜିଭ ଫୁଲିଯିବା ଓ ଗଳା ବନ୍ଦ ହୋଇ ଚେତା ହରାଇବା", "sym": "ଶ୍ୱାସନଳୀରୁ ତୀକ୍ଷ୍ଣ ଶବ୍ଦ, ରକ୍ତଚାପ ୭୮/୪୮କୁ ଖସିବା, ସାରା ଦେହରେ ଚକଡ଼ା ଦାଗ"}
            },
            {
                "sub_id": "T03",
                "concepts": "drug_induced_anaphylaxis; angioedema; stridor; emergency_red_flag",
                "en": {"cc": "Immediate choking sensation and facial ballooning after antibiotic injection", "sym": "Voice completely hoarse, eyes swollen shut, profound hypotension SBP 80, cold extremities"},
                "hi": {"cc": "सुई लगने के तुरंत बाद दम घुटना और चेहरा बुरी तरह सूज जाना", "sym": "आवाज बंद, आंखें सूजकर बंद होना, बीपी 80, हाथ-पैर ठंडे पड़ना"},
                "or": {"cc": "ଇଞ୍ଜେକ୍ସନ ନେବା ମାତ୍ରେ ଦମ ବନ୍ଦ ହେବା ଓ ମୁହଁ ଭୀଷଣ ଫୁଲିଯିବା", "sym": "ସ୍ୱର ବସିଯିବା, ଆଖି ଫୁଲି ବନ୍ଦ, ରକ୍ତଚାପ ୮୦, ହାତଗୋଡ଼ ଥଣ୍ଡା ପଡ଼ିଯିବା"}
            },
            {
                "sub_id": "T04",
                "concepts": "anaphylaxis_cardiovascular_collapse; urticaria_generalized; emergency_red_flag",
                "en": {"cc": "Generalized stinging hives with inability to breathe in and blackout", "sym": "High pitched inspiratory noise, systolic BP 75, peripheral pulses faint, urgent adrenaline"},
                "hi": {"cc": "पूरे शरीर पर लाल दाने, सांस न आना और चक्कर खाकर गिरना", "sym": "सांस लेते समय तेज घरघराहट, बीपी 75, नब्ज बहुत कमजोर, तुरंत एड्रेनालिन जरूरी"},
                "or": {"cc": "ସାରା ଦେହରେ କୁଣ୍ଡାଇ ଚକଡ଼ା, ନିଶ୍ୱାସ ବନ୍ଦ ହେବା ଓ ଅଚେତ ହୋଇ ପଡ଼ିବା", "sym": "ଘରଘର ଶବ୍ଦ, ରକ୍ତଚାପ ୭୫, ନାଡ଼ି ଅତି ଦୁର୍ବଳ, ତୁରନ୍ତ ଔଷଧ ଦରକାର"}
            },
            {
                "sub_id": "T05",
                "concepts": "severe_allergic_laryngeal_edema; stridor; emergency_red_flag",
                "en": {"cc": "Neck and tongue swelling after wasp sting with noisy breathing", "sym": "Stridor audible from doorway, cyanotic lips, blood pressure collapsing, needs stat airway"},
                "hi": {"cc": "ततैया के काटने के बाद गर्दन और जीभ में भारी सूजन और सांस से आवाज", "sym": "दूर से सांस की घरघराहट सुनाई देना, होंठ नीले, बीपी गिरना, तत्काल इलाज की जरूरत"},
                "or": {"cc": "ବୋଳତା କାମୁଡ଼ିବା ପରେ ବେକ ଓ ଜିଭ ଅତ୍ୟଧିକ ଫୁଲିବା ଓ ଶବ୍ଦ ହୋଇ ଶ୍ୱାସ", "sym": "ଦୂରରୁ ଘରଘର ଶବ୍ଦ ଶୁଭିବା, ଓଠ ନୀଳ, ରକ୍ତଚାପ ଖସିବା, ଜରୁରୀକାଳୀନ ଅମ୍ଳଜାନ ଦରକାର"}
            }
        ]
    }
]

# GREY Missing Information Safety Families
GREY_SAFETY_FAMILIES = [
    # 1. Unresponsive / Collapse with All Vitals Missing
    {
        "family_id": "FAM_GRY_01",
        "concept_id": "CONCEPT_MISSING_ALL_VITALS_COLLAPSE",
        "urgency": "GREY",
        "min_age": 20, "max_age": 75,
        "pain_min": None, "pain_max": None,
        "duration_hours": None,
        "vitals_func": lambda: {
            "hr": None, "sbp": None, "dbp": None, "spo2": None, "temp": None, "rr": None
        },
        "missing_reason": "MISSING_ALL_VITAL_SIGNS; MISSING_HEMODYNAMIC_BASELINE_HR_AND_SBP",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "sudden_collapse; missing_all_vitals; refusal_or_equipment_failure; unassessed_triage",
                "en": {"cc": "Sudden collapse at home with dizziness, patient refused vital signs recording", "sym": "Daughter states patient passed out briefly, extremely agitated and refusing cuff or probe"},
                "hi": {"cc": "घर में अचानक चक्कर खाकर गिरना, मरीज वाइटल्स की जांच नहीं करने दे रहा", "sym": "बेटी के अनुसार कुछ देर बेहोश रहे, अत्यधिक बेचैन और बीपी कफ नहीं बंधवा रहे"},
                "or": {"cc": "ଘରେ ହଠାତ୍ ଚେତା ହରାଇ ପଡ଼ିଯିବା, ରୋଗୀ ରକ୍ତଚାପ ମାପିବାକୁ ଦେଉନାହିଁ", "sym": "ଝିଅ ଅନୁଯାୟୀ କିଛି ସମୟ ଅଚେତ ହୋଇଗଲେ, ରୋଗୀ ଅତ୍ୟନ୍ତ ଅସ୍ଥିର ଏବଂ ସହଯୋଗ କରୁନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "syncope_unassessed; omitted_vital_signs; incomplete_data",
                "en": {"cc": "Blackout on street brought by bystanders, all vitals unmeasured due to broken monitor", "sym": "Bystander history only, triage monitor battery drained, no physiological readings"},
                "hi": {"cc": "सड़क पर बेहोश होकर गिरे, मशीन खराब होने से कोई वाइटल दर्ज नहीं हुआ", "sym": "आसपास के लोग लाए हैं, मॉनिटर खराब, कोई भी वाइटल रिकॉर्ड नहीं"},
                "or": {"cc": "ରାସ୍ତାରେ ଅଚେତ ହୋଇ ପଡ଼ିବା, ଯନ୍ତ୍ର ଖରାପ ଯୋଗୁଁ କୌଣସି ପରୀକ୍ଷା ହୋଇନାହିଁ", "sym": "ବାଟୋଇ ଉଦ୍ଧାର କରି ଆଣିଛନ୍ତି, ମେସିନ୍ ବ୍ୟାଟେରୀ ସରିଛି, ରକ୍ତଚାପ ମପା ହୋଇନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "fainting_spell; unrecorded_parameters; incomplete_intake",
                "en": {"cc": "Fainted at bus stand, vitals completely missing from transit slip", "sym": "Transit slip blank, patient sitting in wheelchair with family, duration unknown"},
                "hi": {"cc": "बस स्टैंड पर बेहोशी, पर्ची पर कोई भी वाइटल दर्ज नहीं है", "sym": "पर्ची खाली, व्हीलचेयर पर बैठे हैं, बेहोशी का समय अज्ञात"},
                "or": {"cc": "ବସ୍ ଷ୍ଟାଣ୍ଡରେ ଅଚେତ, କୌଣସି ଭାଇଟାଲ୍ ଚିଠାରେ ଲେଖା ନାହିଁ", "sym": "ଚିଠା ଖାଲି ଅଛି, ହୁଇଲ୍ ଚେୟାରରେ ବସିଛନ୍ତି, ସମୟ ଅଜଣା"}
            },
            {
                "sub_id": "T04",
                "concepts": "transient_loss_of_consciousness; no_vital_signs; unmeasured",
                "en": {"cc": "Collapse episode during prayer meeting, no nurse available to take vitals", "sym": "Pale patient, vitals station was unattended, awaiting complete triage measurement"},
                "hi": {"cc": "प्रार्थना सभा में गिरना, कोई स्टाफ उपलब्ध न होने से वाइटल नहीं लिए गए", "sym": "मरीज पीला पड़ा है, वाइटल्स की जांच बाकी है"},
                "or": {"cc": "ପ୍ରାର୍ଥନା ସଭାରେ ଚେତା ହରାଇବା, କର୍ମଚାରୀ ନଥିବାରୁ ପରୀକ୍ଷା ହୋଇନାହିଁ", "sym": "ରୋଗୀ ପାଣ୍ଡୁର ଦିଶୁଛନ୍ତି, ଭାଇଟାଲ୍ ମପା ବାକି ଅଛି"}
            },
            {
                "sub_id": "T05",
                "concepts": "unrecorded_collapse; missing_hemodynamics; triage_pending",
                "en": {"cc": "Sudden fall in kitchen with dizziness, zero vitals recorded on arrival", "sym": "Family rushed in without ambulance sheet, all 6 vital sign fields blank"},
                "hi": {"cc": "रसोई में चक्कर खाकर गिरना, अस्पताल पहुंचने पर कोई वाइटल दर्ज नहीं", "sym": "घरवाले सीधे लेकर आए, सभी वाइटल खाली पड़े हैं"},
                "or": {"cc": "ରୋଷେଇ ଘରେ ମୁଣ୍ଡ ବୁଲାଇ ପଡ଼ିବା, ପହଞ୍ଚିବା ପରେ କୌଣସି ପରୀକ୍ଷା ହୋଇନାହିଁ", "sym": "ଘରଲୋକେ ସିଧା ଆଣିଛନ୍ତି, ସବୁ ଭାଇଟାଲ୍ ଘର ଖାଲି"}
            }
        ]
    },

    # 2. Chest Presentation with Missing Hemodynamics
    {
        "family_id": "FAM_GRY_02",
        "concept_id": "CONCEPT_MISSING_CHEST_HEMODYNAMICS",
        "urgency": "GREY",
        "min_age": 35, "max_age": 70,
        "pain_min": 5, "pain_max": 8,
        "duration_hours": None,
        "vitals_func": lambda: {
            "hr": None, "sbp": None, "dbp": None, "spo2": r_int(96, 98), "temp": None, "rr": None
        },
        "missing_reason": "MISSING_HEMODYNAMICS_IN_CHEST_PRESENTATION; MISSING_HEMODYNAMIC_BASELINE_HR_AND_SBP",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "vague_chest_discomfort; missing_blood_pressure; missing_heart_rate; unspecified_duration",
                "en": {"cc": "Vague chest discomfort with unrecorded blood pressure and pulse", "sym": "Sensation of tightness across chest, unable to state exact time of onset, equipment malfunction prevented BP/HR reading"},
                "hi": {"cc": "छाती में भारीपन लेकिन रक्तचाप और नब्ज रिकॉर्ड नहीं हो सकी", "sym": "छाती में जकड़न का अहसास, दर्द कब शुरू हुआ स्पष्ट नहीं, मशीन खराब होने से बीपी और पल्स दर्ज नहीं हो सके"},
                "or": {"cc": "ଛାତିରେ ଅସ୍ପଷ୍ଟ ଭାରୀପଣ କିନ୍ତୁ ରକ୍ତଚାପ ଓ ନାଡ଼ି ମପା ହୋଇପାରି ନାହିଁ", "sym": "ଛାତି ଚିପି ଧରିବା ଭଳି ଲାଗୁଛି, କେତେବେଳେ ଆରମ୍ଭ ହେଲା ଜଣାନାହିଁ, ଯନ୍ତ୍ର ଖରାପ ଯୋଗୁଁ ରକ୍ତଚାପ ଓ ନାଡ଼ି ମପା ଯାଇନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "substernal_ache; bp_cuff_leak; missing_pulse; triage_grey",
                "en": {"cc": "Heavy chest pressure with torn blood pressure cuff preventing reading", "sym": "Cuff bladder leaking air, pulse oximeter reads SpO2 97%, blood pressure completely unassessed"},
                "hi": {"cc": "सीने में दबाव लेकिन बीपी कफ फटा होने से रक्तचाप दर्ज नहीं", "sym": "बीपी कफ से हवा लीक, ऑक्सीजन 97%, रक्तचाप और नब्ज की जांच नहीं हो पाई"},
                "or": {"cc": "ଛାତିରେ ଚାପ କିନ୍ତୁ ରକ୍ତଚାପ ପଟି ଫାଟିଯିବାରୁ ମପା ହୋଇପାରି ନାହିଁ", "sym": "ପଟିରୁ ପବନ ବାହାରିଯାଉଛି, ଅକ୍ସିଜେନ ୯୭%, ରକ୍ତଚାପ ଓ ନାଡ଼ି ମପା ହୋଇନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "retrosternal_soreness; pulse_reading_omitted; bp_omitted",
                "en": {"cc": "Retrosternal chest ache with only oxygen taken, no pulse or pressure", "sym": "SpO2 96%, blood pressure and heart rate rows left blank by triage desk"},
                "hi": {"cc": "छाती में दर्द, केवल ऑक्सीजन नापी गई, बीपी और नब्ज खाली", "sym": "ऑक्सीजन 96%, बीपी और नब्ज का कॉलम खाली छोड़ दिया गया"},
                "or": {"cc": "ଛାତି ଭିତରେ କଷ୍ଟ, କେବଳ ଅକ୍ସିଜେନ ମପା ହୋଇଛି, ବିପି ଓ ନାଡ଼ି ଖାଲି", "sym": "ଅକ୍ସିଜେନ ୯୬%, ରକ୍ତଚାପ ଓ ନାଡ଼ି କଲମ ଖାଲି ରଖାଯାଇଛି"}
            },
            {
                "sub_id": "T04",
                "concepts": "chest_fullness; hemodynamic_data_absent; grey_gate",
                "en": {"cc": "Tight chest feeling with unmeasured vitals due to power cut", "sym": "Electronic monitor lost power during assessment, chest discomfort ongoing"},
                "hi": {"cc": "सीने में कसाव, बिजली जाने से वाइटल्स की जांच अधूरी", "sym": "मॉनिटर बंद हो गया, छाती में भारीपन बना हुआ है"},
                "or": {"cc": "ଛାତି ଜାମ, ବିଦ୍ୟୁତ୍ କାଟ ଯୋଗୁଁ ପରୀକ୍ଷା ଅସମ୍ପୂର୍ଣ୍ଣ", "sym": "ମନିଟର ବନ୍ଦ ହୋଇଗଲା, ଛାତି କଷ୍ଟ ଲାଗିରହିଛି"}
            },
            {
                "sub_id": "T05",
                "concepts": "precordial_discomfort; missing_hemodynamics; clinical_hold",
                "en": {"cc": "Precordial chest tightness with absent pulse and blood pressure documentation", "sym": "Patient states chest feels restricted, vitals not completed by admitting clerk"},
                "hi": {"cc": "सीने में जकड़न, नब्ज और रक्तचाप का कोई रिकॉर्ड नहीं", "sym": "मरीज को छाती में खिंचाव महसूस हो रहा है, वाइटल दर्ज नहीं"},
                "or": {"cc": "ଛାତି ପିଞ୍ଜରାରେ କଷ୍ଟ, ନାଡ଼ି ଓ ରକ୍ତଚାପର କୌଣସି ରେକର୍ଡ ନାହିଁ", "sym": "ଛାତି ଟାଣି ଧରିଛି, ଭାଇଟାଲ୍ ଲେଖା ହୋଇନାହିଁ"}
            }
        ]
    }
]
