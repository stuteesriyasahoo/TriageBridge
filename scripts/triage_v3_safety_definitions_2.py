"""
Triage V3: Safety-Test Cohorts (Part 2: RED Families 5-8 and GREY Families 3-5)
"""

def r_int(low, high):
    import random
    return random.randint(low, high)

def r_float(low, high, dec=1):
    import random
    return round(random.uniform(low, high), dec)

RED_SAFETY_FAMILIES_PART2 = [
    # 5. Paediatric Sepsis
    {
        "family_id": "FAM_RED_05",
        "concept_id": "CONCEPT_PAEDIATRIC_SEPSIS_PURPURA",
        "urgency": "RED",
        "min_age": 1, "max_age": 8,
        "pain_min": 6, "pain_max": 9,
        "duration_hours": [4.0, 6.0, 8.0, 12.0],
        "vitals_func": lambda: {
            "hr": r_int(165, 192), "sbp": r_int(74, 88), "dbp": r_int(42, 54),
            "spo2": r_int(91, 94), "temp": r_float(39.9, 40.7), "rr": r_int(44, 58)
        },
        "rule_flag": "RF_CLINICAL_PAEDIATRIC_SEPSIS; VITAL_CRITICAL_HYPERTHERMIA; VITAL_CRITICAL_TACHYCARDIA",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "paediatric_septic_shock; purpuric_non_blanching_rash; extreme_lethargy; hyperpyrexia; emergency_red_flag",
                "en": {"cc": "Extreme lethargy, burning fever and spreading purpuric rash in toddler", "sym": "Drowsy toddler difficult to rouse, cold mottled hands, purple petechial spots on chest that do not fade under glass"},
                "hi": {"cc": "बच्चे में अत्यधिक सुस्ती, तेज बुखार और शरीर पर जामुनी धब्बे", "sym": "बच्चा होश में नहीं आ रहा, हाथ-पैर ठंडे, छाती और पेट पर बैंगनी चकत्ते जो दबाने पर भी नहीं मिटते"},
                "or": {"cc": "ଶିଶୁର ପ୍ରବଳ ଜ୍ୱର, ଚେତା ହରାଇବା ଭଳି ଅବସ୍ଥା ଓ ଦେହରେ ବାଇଗଣୀ ଦାଗ", "sym": "ପିଲା ଆଖି ଖୋଲୁନାହିଁ, ହାତଗୋଡ଼ ଥଣ୍ଡା ପଡ଼ିଯିବା, ଛାତି ଓ ପେଟରେ ଗାଢ଼ ବାଇଗଣୀ ଦାଗ ଯାହା ଚିପିଲେ ଲିଭୁନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "meningococcemia_suspect; petechiae; toxic_appearance; emergency_red_flag",
                "en": {"cc": "High fever with rapid dark purple skin spots appearing on legs and belly", "sym": "Child unrousable, pulse racing at 180, mottled limbs, critical emergency"},
                "hi": {"cc": "तेज बुखार के साथ पैरों और पेट पर गहरे बैंगनी धब्बे तेजी से फैलना", "sym": "बच्चा जगाने पर भी नहीं जाग रहा, नब्ज 180 पर भाग रही, हाथ-पैर नीले"},
                "or": {"cc": "ପ୍ରବଳ ଜ୍ୱର ସହ ଗୋଡ଼ ଓ ପେଟରେ ଗାଢ଼ ବାଇଗଣୀ ଦାଗ ଦ୍ରୁତ ମାଡ଼ିବା", "sym": "ପିଲା ଡାକିଲେ ଶୁଣୁନାହିଁ, ନାଡ଼ି ୧୮୦ରେ ଚାଲୁଛି, ହାତଗୋଡ଼ ଶୀତଳ"}
            },
            {
                "sub_id": "T03",
                "concepts": "septicemia_child; cold_shock; tachycardia_critical; emergency_red_flag",
                "en": {"cc": "Burning hot forehead but icy cold blue feet in infant with purple rash", "sym": "Capillary refill 5 seconds, purpura fulminans spreading, urgent resuscitation needed"},
                "hi": {"cc": "माथा आग जैसा गर्म पर पैर बर्फ जैसे ठंडे और शरीर पर जामुनी चकत्ते", "sym": "नाखून दबाने पर खून देर से लौटना, जामुनी दाने तेजी से बढ़ना, तुरंत इलाज जरूरी"},
                "or": {"cc": "ମୁଣ୍ଡ ନିଆଁ ଭଳି ତାତିଛି କିନ୍ତୁ ଗୋଡ଼ ବରଫ ଭଳି ଥଣ୍ଡା ଓ ବାଇଗଣୀ ଦାଗ", "sym": "ଚମଡ଼ା ରଙ୍ଗ ଫିକା, ବାଇଗଣୀ ଚକଡ଼ା ମାଡ଼ିଚାଲିଛି, ତୁରନ୍ତ ଡାକ୍ତରୀ ସେବା ଦରକାର"}
            },
            {
                "sub_id": "T04",
                "concepts": "paediatric_circulatory_failure; purpuric_eruption; emergency_red_flag",
                "en": {"cc": "Limp unresponsive 3-year-old covered in non-blanching red-purple spots", "sym": "Weak thready pulse, severe tachypnea 50/min, non-blanching glass test positive"},
                "hi": {"cc": "तीन साल का बच्चा बिल्कुल बेसुध और शरीर पर न मिटने वाले बैंगनी दाने", "sym": "कमजोर नब्ज, सांस बहुत तेज 50 प्रति मिनट, ग्लास टेस्ट पॉजिटिव"},
                "or": {"cc": "୩ ବର୍ଷର ଶିଶୁ ଅଚେତ ଓ ଦେହରେ ଚିପିଲେ ନ ଲିଭୁଥିବା ବାଇଗଣୀ ଦାଗ", "sym": "ଦୁର୍ବଳ ନାଡ଼ି, ଦ୍ରୁତ ଶ୍ୱାସକ୍ରିୟା ୫୦, ଗ୍ଲାସ୍ ଟେଷ୍ଟ ପଜିଟିଭ୍"}
            },
            {
                "sub_id": "T05",
                "concepts": "fulminant_sepsis_toddler; petechial_rash; critical; emergency_red_flag",
                "en": {"cc": "Child moaning in stupor with spreading rash and 104F temperature", "sym": "Extremities cold, core burning, petechiae coalescing into ecchymoses, stat IV access"},
                "hi": {"cc": "बच्चा बेहोशी में कराह रहा है, बदन पर फैलते दाने और 104 डिग्री बुखार", "sym": "हाथ-पैर ठंडे, बदन तप रहा, दाने आपस में मिलकर बड़े हो रहे हैं"},
                "or": {"cc": "ଶିଶୁ ଅଚେତ ଅବସ୍ଥାରେ କୁନ୍ଥାଉଛି, ଦେହରେ ମାଡ଼ୁଥିବା ଦାଗ ଓ ୧୦୪ ଡିଗ୍ରୀ ଜ୍ୱର", "sym": "ହାତଗୋଡ଼ ବରଫ, ଦେହ ନିଆଁ, ଦାଗ ବଡ଼ ହୋଇ ମିଶିଯାଉଛି"}
            }
        ]
    },

    # 6. Severe Hemorrhagic Shock
    {
        "family_id": "FAM_RED_06",
        "concept_id": "CONCEPT_SEVERE_HEMORRHAGIC_SHOCK",
        "urgency": "RED",
        "min_age": 20, "max_age": 75,
        "pain_min": 5, "pain_max": 9,
        "duration_hours": [1.0, 2.0, 4.0],
        "vitals_func": lambda: {
            "hr": r_int(125, 155), "sbp": r_int(70, 84), "dbp": r_int(42, 54),
            "spo2": r_int(92, 96), "temp": r_float(35.6, 36.6), "rr": r_int(26, 36)
        },
        "rule_flag": "RF_CLINICAL_SEVERE_HEMORRHAGE; VITAL_CRITICAL_HYPOTENSION; VITAL_CRITICAL_TACHYCARDIA",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "massive_hematemesis; postural_syncope; hemorrhagic_shock; hypotension_sbp_under_85; emergency_red_flag",
                "en": {"cc": "Massive vomiting of fresh blood with postural syncope and collapse", "sym": "Large volume hematemesis approx 500ml, dark clots, cold clammy skin, blacking out on sitting up, SBP 75"},
                "hi": {"cc": "मुंह से लगातार खून की उल्टियां और चक्कर खाकर गिरना", "sym": "ताजा लाल खून की तीन बड़ी उल्टियां, शरीर बिल्कुल ठंडा और पसीने से तर, उठने पर आंखों के आगे अंधेरा छाना"},
                "or": {"cc": "ପ୍ରଚୁର ରକ୍ତ ବାନ୍ତି ଏବଂ ଚେତାଶୂନ୍ୟ ହୋଇ ପଡ଼ିବା", "sym": "ପ୍ରବଳ ପରିମାଣରେ ଲାଲ୍ ରକ୍ତ ବାନ୍ତି, ଶରୀର ଥଣ୍ଡା ଓ ଝାଳରେ ଭିଜିଯିବା, ଉଠି ବସିବା ମାତ୍ରେ ଅଚେତ ହୋଇ ପଡ଼ିବା"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_upper_gi_bleed; shock; tachycardia; emergency_red_flag",
                "en": {"cc": "Vomiting bowlful of red blood with grey pallor and faint pulse", "sym": "Repeated coffee-ground and frank blood emesis, blood pressure 72/46, gasping faintness"},
                "hi": {"cc": "कटोरा भरकर लाल खून की उल्टी, चेहरा सफेद और कमजोर नब्ज", "sym": "बार-बार खून की उल्टी, बीपी 72/46, सांस लेने में कमजोरी, बेहोशी जैसी हालत"},
                "or": {"cc": "ବାଟିଏ ଲାଲ୍ ରକ୍ତ ବାନ୍ତି, ଚେହେରା ଧଳା ଓ ଦୁର୍ବଳ ନାଡ଼ି", "sym": "ବାରମ୍ବାର ରକ୍ତ ବାନ୍ତି, ରକ୍ତଚାପ ୭୨/୪୬, ଚେତା ବୁଡ଼ିଯିବା ଅବସ୍ଥା"}
            },
            {
                "sub_id": "T03",
                "concepts": "profuse_melena_syncope; severe_hypotension; emergency_red_flag",
                "en": {"cc": "Large black tarry stools with sudden collapse in toilet and cold sweat", "sym": "Massive foul melena, SBP 78, heart rate 140, unable to lift head from pillow"},
                "hi": {"cc": "शौच में भारी मात्रा में काला तारकोल जैसा खून और बाथरूम में गिरना", "sym": "बीपी 78, दिल की धड़कन 140, पसीना, तकिए से सिर नहीं उठा पा रहे"},
                "or": {"cc": "ଅତ୍ୟଧିକ କଳା ଆଲକାତରା ଭଳି ରକ୍ତ ଝାଡ଼ା ଓ ବସିବା ମାତ୍ରେ ଚେତା ହରାଇବା", "sym": "ରକ୍ତଚାପ ୭୮, ନାଡ଼ି ୧୪୦, ଝାଳ, ତକିଆରୁ ମୁଣ୍ଡ ଟେକି ହେଉନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "variceal_bleeding_suspect; decompensated_shock; emergency_red_flag",
                "en": {"cc": "Spurting blood from mouth with profound clamminess and confusion", "sym": "Liver cirrhosis patient, vomiting bright blood clots, pulse thready and fast"},
                "hi": {"cc": "मुंह से खून का फव्वारा, शरीर ठंडा और बहकी बातें", "sym": "लिवर के पुराने मरीज, खून के थक्कों की उल्टी, नब्ज बहुत कमजोर और तेज"},
                "or": {"cc": "ପାଟିରୁ ରକ୍ତ ଫିଚିକା ମାରି ବାହାରିବା, ଶରୀର ବରଫ ଓ ପ୍ରଳାପ", "sym": "ଲିଭର ରୋଗୀ, ଜମାଟ ରକ୍ତ ବାନ୍ତି, ନାଡ଼ି ଅତି ଦୁର୍ବଳ ଓ ଦ୍ରୁତ"}
            },
            {
                "sub_id": "T05",
                "concepts": "massive_internal_or_gi_hemorrhage; hypovolemia; emergency_red_flag",
                "en": {"cc": "Copious vomiting of dark blood with unrecordable diastolic pressure", "sym": "Systolic BP 70 mmHg, sweating, extreme thirst, pallor of lips and palms"},
                "hi": {"cc": "लगातार खून की उल्टियां और बीपी का अत्यधिक गिर जाना", "sym": "बीपी 70 तक गिरना, तेज पसीना, बहुत ज्यादा प्यास, होंठ और हथेलियां सफेद"},
                "or": {"cc": "ଲଗାତାର ରକ୍ତ ବାନ୍ତି ଓ ରକ୍ତଚାପ ଅତ୍ୟନ୍ତ ଖସିଯିବା", "sym": "ରକ୍ତଚାପ ୭୦, ପ୍ରଚୁର ଝାଳ, ଭୀଷଣ ଶୋଷ, ଓଠ ଓ ପାପୁଲି ଧଳା"}
            }
        ]
    },

    # 7. Hypertensive Emergency with Neurological Signs
    {
        "family_id": "FAM_RED_07",
        "concept_id": "CONCEPT_HYPERTENSIVE_EMERGENCY",
        "urgency": "RED",
        "min_age": 50, "max_age": 85,
        "pain_min": 8, "pain_max": 10,
        "duration_hours": [2.0, 4.0, 8.0],
        "vitals_func": lambda: {
            "hr": r_int(88, 116), "sbp": r_int(212, 245), "dbp": r_int(120, 138),
            "spo2": r_int(95, 98), "temp": r_float(36.5, 37.2), "rr": r_int(20, 26)
        },
        "rule_flag": "RF_CLINICAL_HYPERTENSIVE_EMERGENCY; VITAL_CRITICAL_HYPERTENSION",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "worst_headache_of_life; explosive_occipital_pain; visual_blurring; critical_hypertension_over_200; emergency_red_flag",
                "en": {"cc": "Explosive occipital headache with visual blurring and severe hypertension", "sym": "Worst headache of life at back of head, double vision, persistent vomiting, blood pressure 225/128"},
                "hi": {"cc": "सिर के पिछले हिस्से में असहनीय दर्द और आंखों से धुंधला दिखना", "sym": "सिर फटने जैसा भयानक दर्द, दोहरी दृष्टि, बार-बार उल्टी, अत्यधिक उच्च रक्तचाप 225/128"},
                "or": {"cc": "ମୁଣ୍ଡ ପଛପଟେ ଅସହ୍ୟ ଯନ୍ତ୍ରଣା ଓ ଆଖିକୁ ଝାପ୍‌ସା ଦେଖାଯିବା", "sym": "ମୁଣ୍ଡ ଫାଟିଯିବା ଭଳି ଭୀଷଣ ଯନ୍ତ୍ରଣା, ଗୋଟିଏ ଜିନିଷ ଦୁଇଟି ଦିଶିବା, ଅନବରତ ବାନ୍ତି, ରକ୍ତଚାପ ୨୨୫/୧୨୮"}
            },
            {
                "sub_id": "T02",
                "concepts": "hypertensive_encephalopathy; confusion; visual_scotoma; emergency_red_flag",
                "en": {"cc": "Agonizing crown headache with sudden blindness in one eye and BP 230/130", "sym": "Cannot see out of left eye, disorientation, vomiting water, emergency IV antihypertensive needed"},
                "hi": {"cc": "सिर में भयंकर दर्द, एक आंख से दिखना बंद और बीपी 230/130", "sym": "बाईं आंख से अंधापन, बहकी बातें, उल्टी, तुरंत नस में बीपी की दवा की जरूरत"},
                "or": {"cc": "ମୁଣ୍ଡ ଉପରେ ଚରମ କଷ୍ଟ, ଗୋଟିଏ ଆଖିକୁ ଅନ୍ଧାର ଦିଶିବା ଓ ବିପି ୨୩୦/୧୩୦", "sym": "ବାମ ଆଖିରେ ଦିଶୁନାହିଁ, ଅସଙ୍ଗତ ବାର୍ତ୍ତା, ବାନ୍ତି, ତୁରନ୍ତ ଇଞ୍ଜେକ୍ସନ ଦରକାର"}
            },
            {
                "sub_id": "T03",
                "concepts": "intracranial_hemorrhage_threat; critical_hypertension; vomiting; emergency_red_flag",
                "en": {"cc": "Thunderclap headache radiating to neck with projectile vomiting and BP 240/135", "sym": "Stiff neck, photophobia, blood pressure dangerously high, groaning in agony"},
                "hi": {"cc": "बिजली कड़कने जैसा सिरदर्द, तेज उल्टियां और बीपी 240/135", "sym": "गर्दन में अकड़न, रोशनी से दर्द, रक्तचाप खतरनाक स्तर पर, दर्द से कराहना"},
                "or": {"cc": "ବଜ୍ରପାତ ଭଳି ମୁଣ୍ଡବିନ୍ଧା, ପ୍ରବଳ ଛିଟିକା ବାନ୍ତି ଓ ବିପି ୨୪୦/୧୩୫", "sym": "ବେକ ଶକ୍ତ, ଆଲୋକରେ କଷ୍ଟ, ରକ୍ତଚାପ ଚରମ ବିପଦ ସୀମାରେ, ଯନ୍ତ୍ରଣାରେ କଲବଲ"}
            },
            {
                "sub_id": "T04",
                "concepts": "malignant_hypertension; papilledema_threat; confusion; emergency_red_flag",
                "en": {"cc": "Stupor and severe occipital throbbing in known hypertensive with BP 220/125", "sym": "Family notes unsteady wandering, slurred answers, blood pressure machine alarmed repeatedly"},
                "hi": {"cc": "हाई बीपी के मरीज में तेज सिरदर्द, सुस्ती और बीपी 220/125", "sym": "लड़खड़ा कर चलना, अस्पष्ट बोली, बीपी मशीन बार-बार लाल चेतावनी दे रही"},
                "or": {"cc": "ଉଚ୍ଚ ରକ୍ତଚାପ ରୋଗୀଙ୍କ ପ୍ରଚଣ୍ଡ ମୁଣ୍ଡବିନ୍ଧା, ଅଚେତ ଅବସ୍ଥା ଓ ବିପି ୨୨୦/୧୨୫", "sym": "ଚାଲିବାରେ ଝୁଣ୍ଟିବା, କଥା ଅସ୍ପଷ୍ଟ, ମେସିନ୍ ବାରମ୍ବାର ବିପଦ ସଙ୍କେତ ଦେଉଛି"}
            },
            {
                "sub_id": "T05",
                "concepts": "hypertensive_crisis_end_organ; chest_and_head_agony; emergency_red_flag",
                "en": {"cc": "Splitting headache with blurred vision, epistaxis and BP 235/130", "sym": "Brisk nosebleed from high pressure, double vision, retching, acute brain threat"},
                "hi": {"cc": "सिर फटने वाला दर्द, धुंधला दिखना, नाक से खून और बीपी 235/130", "sym": "अत्यधिक दबाव से नाक से खून, दोहरी दृष्टि, उल्टी, तुरंत इलाज जरूरी"},
                "or": {"cc": "ମୁଣ୍ଡ ଫାଟିଲା ଭଳି ଯନ୍ତ୍ରଣା, ଝାପ୍‌ସା ଦୃଷ୍ଟି, ନାକରୁ ରକ୍ତ ଓ ବିପି ୨୩୫/୧୩୦", "sym": "ଚରମ ରକ୍ତଚାପ ଯୋଗୁଁ ନାକରୁ ରକ୍ତ, ଗୋଟିଏ ଜିନିଷ ଦୁଇଟି ଦିଶିବା, ବାନ୍ତି"}
            }
        ]
    },

    # 8. Obstetric Eclampsia / Severe Preeclampsia
    {
        "family_id": "FAM_RED_08",
        "concept_id": "CONCEPT_OBSTETRIC_ECLAMPSIA",
        "urgency": "RED",
        "min_age": 19, "max_age": 38,
        "pain_min": 7, "pain_max": 10,
        "duration_hours": [1.0, 2.0, 4.0],
        "vitals_func": lambda: {
            "hr": r_int(105, 126), "sbp": r_int(178, 215), "dbp": r_int(110, 126),
            "spo2": r_int(95, 98), "temp": r_float(36.8, 37.5), "rr": r_int(22, 28)
        },
        "rule_flag": "RF_CLINICAL_PREGNANCY_EMERGENCY; VITAL_CRITICAL_HYPERTENSION",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "severe_preeclampsia_third_trimester; visual_scotoma_flashing_lights; epigastric_ruq_pain; severe_hypertension; emergency_red_flag",
                "en": {"cc": "Severe throbbing headache, visual flashing lights and epigastric pain in third trimester pregnancy", "sym": "Severe right upper quadrant pain, facial edema, photophobia, hyperreflexia in 34-week pregnant female"},
                "hi": {"cc": "गर्भावस्था के आठवें महीने में सिर में भयानक दर्द, आंखों के आगे चमक और पेट दर्द", "sym": "चेहरे और पैरों में अचानक भारी सूजन, तेज सिरदर्द, धुंधला दिखना, पेट के ऊपरी हिस्से में तेज मरोड़"},
                "or": {"cc": "ଗର୍ଭାବସ୍ଥାରେ ପ୍ରବଳ ମୁଣ୍ଡବିନ୍ଧା, ଆଖି ଆଗରେ ଆଲୋକ ଝଲକ ଓ ପେଟ କଷ୍ଟ", "sym": "ମୁହଁ ଓ ଗୋଡ଼ ଅତ୍ୟଧିକ ଫୁଲିବା, ମୁଣ୍ଡ ଘୁରାଇବା ସହ ଦୃଷ୍ଟିଶକ୍ତି କମିବା, ପେଟର ଉପର ଭାଗରେ ତୀବ୍ର ଯନ୍ତ୍ରଣା"}
            },
            {
                "sub_id": "T02",
                "concepts": "impending_eclampsia; hyperreflexia; clonus_suspect; emergency_red_flag",
                "en": {"cc": "Pregnant woman with twitching hands, blinding headache and blood pressure 195/118", "sym": "32 weeks gestation, flashing sparkles in eyes, severe liver area pain, seizure risk"},
                "hi": {"cc": "गर्भवती महिला के हाथों में झटके, भयानक सिरदर्द और बीपी 195/118", "sym": "आंखों के आगे चमकती रोशनी, लिवर के हिस्से में तेज दर्द, दौरे पड़ने का खतरा"},
                "or": {"cc": "ଗର୍ଭବତୀ ମହିଳାଙ୍କ ହାତ ଥରିବା, ଭୀଷଣ ମୁଣ୍ଡବିନ୍ଧା ଓ ବିପି ୧୯୫/୧୧୮", "sym": "ଆଖି ଆଗରେ ଚମକୁଥିବା ଆଲୋକ, ପେଟର ଡାହାଣ ପାଖରେ କଷ୍ଟ, ବାତ ଆସିବା ଭୟ"}
            },
            {
                "sub_id": "T03",
                "concepts": "severe_preeclampsia_hellp_threat; ruq_pain; emergency_red_flag",
                "en": {"cc": "Agonizing upper right belly pain and puffy face in 36-week pregnancy", "sym": "Persistent vomiting, vision dark at edges, BP 185/115, urgent magnesium sulfate needed"},
                "hi": {"cc": "गर्भावस्था के 36वें हफ्ते में पेट के ऊपरी दाईं तरफ असहनीय दर्द और फूला हुआ चेहरा", "sym": "लगातार उल्टी, किनारों से दिखना बंद, बीपी 185/115, तुरंत इंजेक्शन की जरूरत"},
                "or": {"cc": "୩୬ ସପ୍ତାହ ଗର୍ଭାବସ୍ଥାରେ ଉପର ଡାହାଣ ପେଟରେ ଅସହ୍ୟ କଷ୍ଟ ଓ ମୁହଁ ଫୁଲିବା", "sym": "ବାରମ୍ବାର ବାନ୍ତି, ଆଖିକୁ ଅନ୍ଧାର, ବିପି ୧୮୫/୧୧୫, ତୁରନ୍ତ ଚିକିତ୍ସା ଆବଶ୍ୟକ"}
            },
            {
                "sub_id": "T04",
                "concepts": "eclamptic_prodrome; severe_frontal_headache; hypertension; emergency_red_flag",
                "en": {"cc": "Sudden vision loss and head splitting ache in 8-month pregnant mother", "sym": "Severe facial and hand swelling, jerky arm reflexes, blood pressure 200/120"},
                "hi": {"cc": "आठ महीने की गर्भवती में अचानक दिखना बंद होना और सिर फटने जैसा दर्द", "sym": "चेहरे और हाथों में भारी सूजन, बीपी 200/120, दौरे की पूर्व स्थिति"},
                "or": {"cc": "୮ ମାସ ଗର୍ଭବତୀଙ୍କ ହଠାତ୍ ଆଖି ନ ଦିଶିବା ଓ ମୁଣ୍ଡ ଫାଟିଲା ଭଳି ଯନ୍ତ୍ରଣା", "sym": "ମୁହଁ ଓ ହାତରେ ଭାରୀ ଫୁଲା, ବିପି ୨୦୦/୧୨୦, ଜରୁରୀକାଳୀନ ଅବସ୍ଥା"}
            },
            {
                "sub_id": "T05",
                "concepts": "maternal_hypertensive_emergency; proteinuria_suspect; emergency_red_flag",
                "en": {"cc": "Preeclampsia crisis with BP 210/124 and epigastric agony at 35 weeks", "sym": "Cannot tolerate room light, vomiting bile, fetus moving sluggishly, stat obstetrics"},
                "hi": {"cc": "35 हफ्ते की गर्भावस्था में बीपी 210/124 और पेट में भयंकर मरोड़", "sym": "रोशनी बर्दाश्त न होना, पित्त की उल्टी, बच्चे की हलचल कम, तुरंत प्रसूति वार्ड जरूरी"},
                "or": {"cc": "୩୫ ସପ୍ତାହରେ ବିପି ୨୧୦/୧୨୪ ଓ ପେଟ ଭିତରେ ଭୀଷଣ ଯନ୍ତ୍ରଣା", "sym": "ଆଲୋକ ସହି ହେଉନାହିଁ, ପିତ୍ତ ବାନ୍ତି, ଶିଶୁର ହଲଚଲ କମିଛି, ତୁରନ୍ତ ଡାକ୍ତର ଦରକାର"}
            }
        ]
    }
]

GREY_SAFETY_FAMILIES_PART2 = [
    # 3. Paediatric Vitals Missing
    {
        "family_id": "FAM_GRY_03",
        "concept_id": "CONCEPT_MISSING_PAEDIATRIC_VITALS",
        "urgency": "GREY",
        "min_age": 1, "max_age": 4,
        "pain_min": None, "pain_max": None,
        "duration_hours": None,
        "vitals_func": lambda: {
            "hr": None, "sbp": None, "dbp": None, "spo2": None, "temp": None, "rr": r_int(32, 42)
        },
        "missing_reason": "MISSING_PAEDIATRIC_VITALS_TEMP_AND_HR; MISSING_HEMODYNAMIC_BASELINE_HR_AND_SBP",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "toddler_fever_unmeasured; crying; refusal_of_feeds; missing_temp_and_hr",
                "en": {"cc": "Toddler irritable and refusing fluids with no thermometer available at home", "sym": "Persistent crying, hot to touch by parent report, dry nappies for unknown duration, vitals could not be completed"},
                "hi": {"cc": "छोटा बच्चा लगातार रो रहा है और दूध नहीं पी रहा, थर्मामीटर उपलब्ध नहीं", "sym": "माता-पिता के अनुसार शरीर गर्म है, कितने समय से पेशाब नहीं किया अज्ञात, नब्ज और तापमान नहीं लिया जा सका"},
                "or": {"cc": "ଛୋଟ ପିଲା କ୍ଷୀର ଖାଉନାହିଁ ଓ କ୍ରମାଗତ କାନ୍ଦୁଛି, ଥର୍ମାମିଟର ଉପଲବ୍ଧ ନାହିଁ", "sym": "ବାପାମାଆଙ୍କ କହିବାନୁସାରେ ଦେହ ତାତିଛି, କେତେ ସମୟରୁ ପରିସ୍ରା ହୋଇନାହିଁ ଜଣାନାହିଁ, ନାଡ଼ି ଓ ଉତ୍ତାପ ମପା ହୋଇନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "paediatric_pyrexia_unassessed; combative_child; vitals_omitted",
                "en": {"cc": "Feverish 2-year-old screaming and thrashing, nurse unable to attach cuff or probe", "sym": "Severe distress, parent states hot forehead, pulse and oximeter reading rejected by combative child"},
                "hi": {"cc": "दो साल का बच्चा रो रहा है और बीपी कफ या थर्मामीटर नहीं लगाने दे रहा", "sym": "बच्चा बहुत छटपटा रहा है, माता-पिता के अनुसार शरीर गर्म, कोई वाइटल दर्ज नहीं हुआ"},
                "or": {"cc": "୨ ବର୍ଷର ପିଲା କାନ୍ଦି ହାତଗୋଡ଼ ଛାଟୁଛି, କୌଣସି ପରୀକ୍ଷା କରେଇ ଦେଉନାହିଁ", "sym": "ପିଲା ଛଟପଟ ହେଉଛି, ମାଆ କହୁଛନ୍ତି ଦେହ ତାତିଛି, ଉତ୍ତାପ ବା ନାଡ଼ି ମପା ଯାଇନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "infant_lethargy_unmeasured; thermometer_broken; incomplete_triage",
                "en": {"cc": "Hot irritable baby with broken clinic thermometer at primary health sub-centre", "sym": "Thermometer shattered on floor, pulse rate omitted, awaiting digital unit"},
                "hi": {"cc": "बच्चे का बदन गर्म, प्राथमिक केंद्र पर थर्मामीटर टूटा हुआ", "sym": "थर्मामीटर टूट गया, नब्ज नहीं गिनी गई, दूसरी मशीन का इंतजार"},
                "or": {"cc": "ଛୁଆ ଦେହ ତାତିଛି କିନ୍ତୁ ସ୍ୱାସ୍ଥ୍ୟକେନ୍ଦ୍ରରେ ଥର୍ମାମିଟର ଭାଙ୍ଗିଯାଇଛି", "sym": "ଥର୍ମାମିଟର ଭାଙ୍ଗିଛି, ନାଡ଼ି ଗଣା ହୋଇନାହିଁ, ଅନ୍ୟ ଯନ୍ତ୍ରକୁ ଅପେକ୍ଷା"}
            },
            {
                "sub_id": "T04",
                "concepts": "toddler_poor_feeding; unrecorded_temperature; triage_hold",
                "en": {"cc": "Baby refusing breastfeeding since morning, vital sign equipment unavailable in triage room", "sym": "Parent concerned, triage desk awaiting replacement batteries for monitors"},
                "hi": {"cc": "बच्चा सुबह से दूध नहीं पी रहा, वाइटल की मशीन की बैटरी खत्म", "sym": "माता-पिता चिंतित, मशीन की बैटरी बदली जा रही है, जांच बाकी"},
                "or": {"cc": "ଶିଶୁ ସକାଳୁ ସ୍ତନ୍ୟପାନ କରୁନାହିଁ, ପରୀକ୍ଷା ଯନ୍ତ୍ରରେ ବ୍ୟାଟେରୀ ସରିଛି", "sym": "ବାପାମାଆ ଚିନ୍ତିତ, ବ୍ୟାଟେରୀ ପଡ଼ିଲେ ମପା ହେବ, ଅପେକ୍ଷା"}
            },
            {
                "sub_id": "T05",
                "concepts": "paediatric_assessment_incomplete; vitals_pending",
                "en": {"cc": "Warm feverish infant brought after long rural journey, vitals station bypassed", "sym": "Carried in blanket, intake recorded without vital measurements"},
                "hi": {"cc": "दूर गांव से लाए गए बीमार बच्चे के वाइटल अभी दर्ज नहीं हुए हैं", "sym": "कंबल में लपेटा बच्चा, पर्चा बना पर वाइटल्स का खाना खाली"},
                "or": {"cc": "ଗାଁରୁ ଅଣାଯାଇଥିବା ଛୁଆର ପରୀକ୍ଷା ଏଯାଏଁ କରାଯାଇ ନାହିଁ", "sym": "କମ୍ବଳରେ ଗୁଡ଼ା ହୋଇ ଆସିଛି, ଚିଠା ହୋଇଛି କିନ୍ତୁ ଭାଇଟାଲ୍ ମପା ହୋଇନାହିଁ"}
            }
        ]
    },

    # 4. Altered Mental State with Missing Oxygenation & Vitals
    {
        "family_id": "FAM_GRY_04",
        "concept_id": "CONCEPT_MISSING_AMS_VITALS",
        "urgency": "GREY",
        "min_age": 68, "max_age": 90,
        "pain_min": None, "pain_max": None,
        "duration_hours": None,
        "vitals_func": lambda: {
            "hr": r_int(72, 86), "sbp": r_int(130, 146), "dbp": r_int(76, 86),
            "spo2": None, "temp": None, "rr": None
        },
        "missing_reason": "MISSING_VITAL_MONITORING_IN_ALTERED_MENTAL_STATUS",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "acute_confusion_elderly; missing_oxygen_and_temperature; unassessed_delirium",
                "en": {"cc": "New confusion and disorientation in elderly patient with unmeasured oxygen and glucose", "sym": "Patient not recognizing family members, speech wandering, glucometer unavailable, pulse oximeter failed to register"},
                "hi": {"cc": "बुजुर्ग मरीज में अचानक भ्रम और बहकी बातें, शुगर और ऑक्सीजन रिकॉर्ड नहीं", "sym": "मरीज परिजनों को नहीं पहचान पा रहा, बातों में भटकाव, ग्लूकोमीटर न होने से शुगर जांच नहीं हो सकी, ऑक्सीजन दर्ज नहीं"},
                "or": {"cc": "ବୃଦ୍ଧ ରୋଗୀଙ୍କ ଚେତନା ହଜିଯିବା ଓ ପ୍ରଳାପ ବକିବା, ଶର୍କରା ଓ ଅମ୍ଳଜାନ ମପା ହୋଇନାହିଁ", "sym": "ଘର ଲୋକଙ୍କୁ ଚିହ୍ନି ନପାରିବା, କଥା ଅସଙ୍ଗତ ହେବା, ଗ୍ଲୁକୋମିଟର ନଥିବାରୁ ଶର୍କରା ମପା ହୋଇନାହିଁ, ଅକ୍ସିଜେନ ମପା ହୋଇନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "delirium_investigation_pending; missing_saturation; elderly_confusion",
                "en": {"cc": "Elderly grandmother disoriented since noon, cold fingers prevented pulse ox reading", "sym": "Talking to deceased relatives, finger oximeter could not detect waveform, temperature not taken"},
                "hi": {"cc": "बुजुर्ग महिला दोपहर से भ्रमित, हाथ ठंडे होने से पल्स ऑक्सीमीटर काम नहीं कर रहा", "sym": "पुरानी बातें करना, मशीन रीडिंग नहीं ले पा रही, तापमान नहीं नापा गया"},
                "or": {"cc": "ବୃଦ୍ଧା ମହିଳା ଦ୍ୱିପ୍ରହରରୁ ଅସ୍ଥିର, ହାତ ଥଣ୍ଡା ଯୋଗୁଁ ଅକ୍ସିମିଟର କାମ କରୁନାହିଁ", "sym": "ବହେ ପ୍ରଳାପ ବକୁଛନ୍ତି, ଯନ୍ତ୍ର ତରଙ୍ଗ ପାଉନାହିଁ, ଉତ୍ତାପ ମପା ହୋଇନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "altered_sensorium_unmonitored; vitals_partially_blank; incomplete",
                "en": {"cc": "Wandering confusion in dementia patient, triage oximetry and respirations left blank", "sym": "Restless and pulling off probes, respiratory rate not counted, SpO2 missing"},
                "hi": {"cc": "भूलने की बीमारी वाले मरीज में बेचैनी और भ्रम, ऑक्सीजन और सांस की गति खाली", "sym": "मरीज मशीन के तार खींच रहा है, सांस की गिनती नहीं हुई, ऑक्सीजन खाली"},
                "or": {"cc": "ବୃଦ୍ଧ ରୋଗୀଙ୍କ ଅସ୍ଥିରତା ଓ ପ୍ରଳାପ, ଅକ୍ସିଜେନ ଓ ଶ୍ୱାସକ୍ରିୟା ଘର ଖାଲି", "sym": "ରୋଗୀ ତାର ଟାଣି ଫିଙ୍ଗି ଦେଉଛନ୍ତି, ଶ୍ୱାସ ଗଣା ହୋଇନାହିଁ, ଅକ୍ସିଜେନ ଖାଲି"}
            },
            {
                "sub_id": "T04",
                "concepts": "acute_encephalopathy_evaluation_pending; missing_temp_and_spo2",
                "en": {"cc": "Sudden muddled speech in grandfather with missing temperature probe", "sym": "Confused timeline, clinic temperature probe broken, SpO2 unrecorded"},
                "hi": {"cc": "दादाजी में अचानक बहकी बातें, थर्मामीटर न होने से तापमान दर्ज नहीं", "sym": "समय और जगह का होश नहीं, थर्मामीटर खराब, ऑक्सीजन रिकॉर्ड नहीं"},
                "or": {"cc": "ଜେଜେବାପା ହଠାତ୍ ଅସଙ୍ଗତ କଥା କହିବା, ଥର୍ମାମିଟର ନଥିବାରୁ ଉତ୍ତାପ ଲେଖା ନାହିଁ", "sym": "ଜାଗା ବା ସମୟ ଜ୍ଞାନ ନାହିଁ, ଯନ୍ତ୍ର ଖରାପ, ଅକ୍ସିଜେନ ଲେଖା ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "confusional_state; vital_omissions; triage_grey",
                "en": {"cc": "Drowsy disoriented senior citizen, oxygen saturation and temperature omitted from chart", "sym": "Sluggish responses, chart missing SpO2 and core temp, needs complete vitals capture"},
                "hi": {"cc": "सुस्त और भ्रमित बुजुर्ग, चार्ट पर ऑक्सीजन और तापमान नहीं लिखा गया", "sym": "सवालों का देर से जवाब, चार्ट अधूरा, पूरी जांच जरूरी"},
                "or": {"cc": "ଅଚେତନ ପ୍ରାୟ ବୃଦ୍ଧ ରୋଗୀ, ରେକର୍ଡରେ ଅକ୍ସିଜେନ ଓ ଉତ୍ତାପ ଲେଖା ହୋଇନାହିଁ", "sym": "ଧୀରେ ଉତ୍ତର ଦେଉଛନ୍ତି, ଚାର୍ଟରେ ଅକ୍ସିଜେନ ନାହିଁ, ସମ୍ପୂର୍ଣ୍ଣ ମାପ ଦରକାର"}
            }
        ]
    },

    # 5. Spreading Rash with All Vitals Missing
    {
        "family_id": "FAM_GRY_05",
        "concept_id": "CONCEPT_MISSING_RASH_VITALS",
        "urgency": "GREY",
        "min_age": 20, "max_age": 62,
        "pain_min": 2, "pain_max": 5,
        "duration_hours": [12.0, 24.0, 48.0],
        "vitals_func": lambda: {
            "hr": None, "sbp": None, "dbp": None, "spo2": None, "temp": None, "rr": None
        },
        "missing_reason": "MISSING_ALL_VITAL_SIGNS; MISSING_HEMODYNAMIC_BASELINE_HR_AND_SBP",
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "drug_rash_unassessed; all_vital_signs_omitted; mucosal_uninspected; triage_grey",
                "en": {"cc": "Widespread peeling rash after unverified medicine, all vital signs omitted", "sym": "Red blotches across chest and back after taking unknown local pharmacy tablets, mucosal inspection not performed, vitals not recorded"},
                "hi": {"cc": "अज्ञात दवा खाने के बाद पूरे शरीर पर लाल चकत्ते, कोई भी वाइटल दर्ज नहीं", "sym": "स्थानीय दुकान से ली गई गोली के बाद छाती और पीठ पर फैलते लाल दाने, मुंह के अंदर जांच नहीं हुई, रक्तचाप आदि दर्ज नहीं"},
                "or": {"cc": "ଅଜଣା ଔଷଧ ଖାଇବା ପରେ ସାରା ଦେହରେ କୁଣ୍ଡାଇ ଦାଗ, କୌଣସି ଭାଇଟାଲ ମପା ହୋଇନାହିଁ", "sym": "ଦୋକାନରୁ ଆଣିଥିବା ବଟିକା ଖାଇବା ପରେ ଛାତି ଓ ପିଠିରେ ନାଲି ଦାଗ, ପାଟି ଭିତର ପରୀକ୍ଷା ହୋଇନାହିଁ, ରକ୍ତଚାପ ଆଦି ମପା ହୋଇନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_dermatosis_unmeasured; omitted_physiological_readings",
                "en": {"cc": "Fast spreading skin eruption, registration clerk forwarded directly without vitals", "sym": "Covered in red hives, sent straight to doctor queue without nursing vital check"},
                "hi": {"cc": "तेजी से फैलते दाने, बिना वाइटल लिए मरीज को सीधे आगे भेज दिया गया", "sym": "पूरे बदन पर दाने, नर्स द्वारा कोई बीपी या बुखार नहीं नापा गया"},
                "or": {"cc": "ଦ୍ରୁତ ମାଡ଼ୁଥିବା ଚମଡ଼ା ରୋଗ, ବିନା ପରୀକ୍ଷାରେ ରୋଗୀଙ୍କୁ ସିଧା ପଠାଗଲା", "sym": "ଦେହସାରା ଲାଲ୍ ଦାଗ, ନର୍ସଙ୍କ ଦ୍ୱାରା ରକ୍ତଚାପ ବା ଜ୍ୱର ମପା ହୋଇନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "erythematous_rash_unassessed; vital_chart_blank",
                "en": {"cc": "Burning itchy body rash with blank vital sign sheet", "sym": "All 6 vital sign fields empty on intake form, patient waiting in corridor"},
                "hi": {"cc": "पूरे शरीर पर जलन वाले दाने, पर्चे पर वाइटल्स का खाना पूरी तरह खाली", "sym": "फॉर्म पर सभी 6 वाइटल खाली पड़े हैं, मरीज गैलरी में बैठा है"},
                "or": {"cc": "ସାରା ଦେହରେ ଜଳାପୋଡ଼ା ଦାଗ, କାଗଜରେ ଭାଇଟାଲ୍ ଘର ସମ୍ପୂର୍ଣ୍ଣ ଖାଲି", "sym": "ଫର୍ମର ସବୁ ୬ଟି ଯାକ ଘର ଖାଲି, ରୋଗୀ ବାରଣ୍ଡାରେ ଅପେକ୍ଷା କରିଛନ୍ତି"}
            },
            {
                "sub_id": "T04",
                "concepts": "severe_pruritus_rash; omitted_temperature_pulse; grey_gate",
                "en": {"cc": "Full body red welts after seafood dinner with zero vitals taken", "sym": "Intense itching, no heart rate or blood pressure recorded, needs complete intake"},
                "hi": {"cc": "मछली खाने के बाद पूरे शरीर पर चकत्ते, कोई भी वाइटल नहीं लिया गया", "sym": "तेज खुजली, नब्ज या बीपी कुछ भी दर्ज नहीं, पूरी जांच जरूरी"},
                "or": {"cc": "ମାଛ ଖାଇବା ପରେ ସାରା ଦେହରେ ଚକଡ଼ା, କୌଣସି ପରୀକ୍ଷା କରାଯାଇ ନାହିଁ", "sym": "ପ୍ରବଳ କୁଣ୍ଡିଆଣି, ନାଡ଼ି ବା ରକ୍ତଚାପ ଲେଖା ନାହିଁ, ସମ୍ପୂର୍ଣ୍ଣ ମାପ ଦରକାର"}
            },
            {
                "sub_id": "T05",
                "concepts": "allergic_eruption; unmeasured_vital_signs; triage_hold",
                "en": {"cc": "Spreading skin redness after herbal medicine, vitals omitted due to shift handover", "sym": "Shift change at triage desk left patient sheet without observations"},
                "hi": {"cc": "देसी दवा के बाद फैलती लाली, शिफ्ट बदलने के चक्कर में वाइटल छूटे", "sym": "स्टाफ बदलने से मरीज का कोई भी वाइटल दर्ज नहीं हो सका"},
                "or": {"cc": "ଦେଶୀ ଔଷଧ ପରେ ଦେହ ଲାଲ୍ ପଡ଼ିବା, କର୍ମଚାରୀ ବଦଳି ଯୋଗୁଁ ପରୀକ୍ଷା ଛୁଟିଗଲା", "sym": "ଡିଉଟି ବଦଳି ସମୟରେ ରୋଗୀଙ୍କ କୌଣସି ଭାଇଟାଲ୍ ମପା ହୋଇପାରିଲା ନାହିଁ"}
            }
        ]
    }
]
