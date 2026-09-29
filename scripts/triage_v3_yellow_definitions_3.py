"""
Triage V3: Yellow Families 13 to 20
"""

def r_int(low, high):
    import random
    return random.randint(low, high)

def r_float(low, high, dec=1):
    import random
    return round(random.uniform(low, high), dec)

YELLOW_FAMILIES_PART3 = [
    # 13. Acute Corneal Abrasion / Chemical Splash
    {
        "family_id": "FAM_YEL_13",
        "concept_id": "CONCEPT_CORNEAL_ABRASION_EYE_INJURY",
        "urgency": "YELLOW",
        "min_age": 10, "max_age": 70,
        "pain_min": 7, "pain_max": 9,
        "duration_hours": [1.0, 2.0, 4.0, 8.0],
        "vitals_func": lambda: {
            "hr": r_int(82, 102), "sbp": r_int(120, 142), "dbp": r_int(74, 88),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.2), "rr": r_int(16, 20)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "severe_ocular_pain; blepharospasm; foreign_body_sensation; photophobia; lacrimation",
                "en": {"cc": "Severe stinging right eye pain unable to open eye after gardening branch scratch", "sym": "Intense involuntary lid clenching, extreme light sensitivity, continuous clear tearing, gritty feeling"},
                "hi": {"cc": "टहनी लगने के बाद दाईं आंख में असहनीय दर्द और आंख न खोल पाना", "sym": "पलकें अपने आप बंद हो जाना, रोशनी में बिल्कुल न देख पाना, लगातार पानी बहना, आंख में कुछ चुभने का अहसास"},
                "or": {"cc": "ଡାଳ ବାଜିବା ପରେ ଡାହାଣ ଆଖିରେ ଅସହ୍ୟ ଯନ୍ତ୍ରଣା ଓ ଆଖି ଖୋଲି ନପାରିବା", "sym": "ପତା ଜାବୁଡ଼ି ହୋଇ ବନ୍ଦ ହୋଇଯିବା, ଆଲୋକ ଆଦୌ ସହି ନପାରିବା, ଲଗାତାର ଲୁହ ବୋହିବା"}
            },
            {
                "sub_id": "T02",
                "concepts": "chemical_splash_eye_cleaning_agent; severe_burning; conjunctival_injection",
                "en": {"cc": "Accidental bleach splash into left eye with intense burning despite water rinse", "sym": "Rinsed with tap water for 5 minutes, severe burning agony persists, conjunctiva bright fiery red"},
                "hi": {"cc": "बाईं आंख में फिनाइल या ब्लीच के छींटे पड़ने से तेज जलन और दर्द", "sym": "पानी से धोने के बाद भी भयानक जलन, आंख का सफेद हिस्सा गहरा लाल, पलकें सूजी हुईं"},
                "or": {"cc": "ବାମ ଆଖିରେ ଫିନାଇଲ ଛିଟିକି ପଡ଼ି ପ୍ରବଳ ପୋଡ଼ାଜଳା ଓ ଯନ୍ତ୍ରଣା", "sym": "ପାଣିରେ ଧୋଇବା ପରେ ବି ଭୀଷଣ ପୋଡ଼ିବା, ଆଖି ଡୋଳା ଲାଲ୍ ଟହଟହ, ପତା ଫୁଲିଯିବା"}
            },
            {
                "sub_id": "T03",
                "concepts": "metallic_foreign_body_eye; corneal_abrasion; visual_blurring_mild",
                "en": {"cc": "Grinding metal spark flew into eye causing constant sharp stabbing", "sym": "Feeling of metal grit scratch with every blink, cannot tolerate room lighting, vision slightly blurred"},
                "hi": {"cc": "वेल्डिंग या लोहे का कण आंख में जाने से लगातार चुभन और दर्द", "sym": "पलक झपकाने पर शीशा चुभने जैसा अहसास, कमरे की लाइट भी बर्दाश्त नहीं, धुंधलापन"},
                "or": {"cc": "ଓ୍ୱେଲ୍ଡିଂ କଣିକା ଆଖିରେ ପଡ଼ି କ୍ରମାଗତ ଛୁଞ୍ଚି ଭଳି ଫୋଡ଼ି ହେବା", "sym": "ପତା ପକାଇଲେ କାଚ ବାଲି କଣିକା ଘଷି ହେବା ଭଳି କଷ୍ଟ, ଆଲୋକ ସହି ହେଉନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "contact_lens_corneal_ulcer_suspect; ocular_injection; photophobia",
                "en": {"cc": "Worsening red painful eye after sleeping with contact lenses in", "sym": "Deep aching in eyeball, severe tearing, white speck noticed on iris edge, photophobia"},
                "hi": {"cc": "लेंस लगाकर सोने के बाद आंख लाल होना और तेज दर्द", "sym": "पुतली के पास सफेद बिंदु दिखना, तेज पानी बहना, आंख में गहरा दर्द, रोशनी से तकलीफ"},
                "or": {"cc": "ଲେନ୍ସ ଲଗାଇ ଶୋଇବା ପରେ ଆଖି ଲାଲ୍ ପଡ଼ି ପ୍ରବଳ ଯନ୍ତ୍ରଣା", "sym": "ଡୋଳା ପାଖରେ ଧଳା ଦାଗ, ପ୍ରବଳ ଲୁହ ଝରିବା, ଭିତରୁ ବିନ୍ଧା, ଆଲୋକରେ କଷ୍ଟ"}
            },
            {
                "sub_id": "T05",
                "concepts": "trauma_ocular_contusion; hyphema_exclusion_needed; sharp_pain",
                "en": {"cc": "Blunt shuttlecock hit to eye with severe throbbing and blurred sight", "sym": "Periorbital swelling, pupil reactive, intense ache, needs slit-lamp examination"},
                "hi": {"cc": "आंख पर शटलकॉक लगने के बाद तेज दर्द और कम दिखाई देना", "sym": "आंख के चारों ओर सूजन, पुतली हिल रही है, भयानक टीस, डॉक्टर द्वारा जांच जरूरी"},
                "or": {"cc": "ଆଖିରେ ଶଟଲ୍ ବାଜି ପ୍ରବଳ ଧପଧପ ବିନ୍ଧା ଓ ଝାପ୍‌ସା ଦେଖାଯିବା", "sym": "ଆଖି ଚାରିପାଖ ଫୁଲିଛି, ଡୋଳା ଭିତରେ କଷ୍ଟ, ଆଲୋକ ପରୀକ୍ଷା ଦରକାର"}
            }
        ]
    },

    # 14. Spreading Cellulitis / Erysipelas
    {
        "family_id": "FAM_YEL_14",
        "concept_id": "CONCEPT_SPREADING_CELLULITIS",
        "urgency": "YELLOW",
        "min_age": 22, "max_age": 80,
        "pain_min": 5, "pain_max": 7,
        "duration_hours": [24.0, 48.0, 72.0],
        "vitals_func": lambda: {
            "hr": r_int(88, 108), "sbp": r_int(122, 146), "dbp": r_int(76, 88),
            "spo2": r_int(97, 100), "temp": r_float(38.0, 39.0), "rr": r_int(18, 22)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "spreading_erythema_lower_limb; warmth_edema_skin; fever_rigors; pen_mark_crossed",
                "en": {"cc": "Rapidly expanding hot red painful swelling on right lower leg with chills", "sym": "Redness spread 5cm past marker pen drawn yesterday, skin tense shiny and hot, shivering fever"},
                "hi": {"cc": "दाहिनी पिंडली पर तेजी से फैलती लाल सूजन, तेज जलन और बुखार", "sym": "कल बनाए पेन के निशान से 5 सेमी आगे लाली फैल गई है, चमड़ी तनी हुई और गर्म, कंपकंपी"},
                "or": {"cc": "ଡାହାଣ ଗୋଡ଼ ନଳିରେ ଦ୍ରୁତ ମାଡ଼ୁଥିବା ଲାଲ୍ ଫୁଲା, ନିଆଁ ଭଳି ତାତି ଓ ଜ୍ୱର", "sym": "କାଲି ପେନ୍‌ରେ ଦିଆଯାଇଥିବା ଗାରଠାରୁ ୫ ସେମି ବାହାରକୁ ଲାଲ୍ ବ୍ୟାପିଛି, ଚମଡ଼ା ଟାଣ ଓ ଉଷୁମ"}
            },
            {
                "sub_id": "T02",
                "concepts": "facial_erysipelas_suspect; raised_indurated_border; feverish",
                "en": {"cc": "Bright red hot swollen rash spreading across bridge of nose and cheek", "sym": "Well-demarcated raised burning border, facial tightness, high temperature, eye opening restricted by cheek edema"},
                "hi": {"cc": "गाल और नाक पर आग की तरह लाल गर्म सूजन जो फैलती जा रही है", "sym": "उभरे हुए किनारे, चेहरे में खिंचाव, तेज बुखार, गाल सूजने से आंख आधी बंद"},
                "or": {"cc": "ନାକ ଓ ଗାଲ ଉପରେ ଚଡ଼ଚଡ଼ ଲାଲ୍ ଉଷୁମ ଫୁଲା ମାଡ଼ିଯିବା", "sym": "ଧାର ସ୍ପଷ୍ଟ ହୋଇ ଫୁଲିଛି, ମୁହଁ ଟାଣି ଧରିବା, ପ୍ରବଳ ଉତ୍ତାପ, ଆଖି ଖୋଲିବାରେ ବାଧା"}
            },
            {
                "sub_id": "T03",
                "concepts": "cellulitis_secondary_to_abrasion; ascending_lymphangitis; pain",
                "en": {"cc": "Red streaks traveling up forearm from infected thorn scratch with fever", "sym": "Tender red tracking lines along arm to armpit, throbbing forearm heat, fever 38.4C"},
                "hi": {"cc": "कांटा चुभने के बाद हाथ में लाल लकीरें ऊपर कंधे की तरफ बढ़ रही हैं", "sym": "बगल तक लाल धारियां, हाथ में तेज टीस और भारीपन, 38.4 डिग्री बुखार"},
                "or": {"cc": "କଣ୍ଟା ଫୁଟିବା ପରେ ହାତରୁ କାଖ ଆଡ଼କୁ ଲାଲ୍ ଧାର ମାଡ଼ିବା ଓ ଜ୍ୱର", "sym": "କାଖ ପର୍ଯ୍ୟନ୍ତ ନାଲି ଗାର ଟାଣି ହୋଇଛି, ହାତ ଧପଧପ ହୋଇ ଫୁଲିଛି, ୩୮.୪ ଡିଗ୍ରୀ ଜ୍ୱର"}
            },
            {
                "sub_id": "T04",
                "concepts": "diabetic_foot_cellulitis_early; localized_erythema; tenderness",
                "en": {"cc": "Red angry swelling around big toe spreading onto top of foot in diabetic", "sym": "Skin hot to touch, mild pus discharge at nail fold, throbbing pain preventing shoe wearing"},
                "hi": {"cc": "डायबिटीज मरीज के पैर के अंगूठे में लाल पकने वाली सूजन जो ऊपर फैल रही है", "sym": "पैर छूने पर गर्म, नाखून के पास से मवाद, जूता पहनना असंभव, तेज दर्द"},
                "or": {"cc": "ମଧୁମେହ ରୋଗୀଙ୍କ ବୁଢ଼ା ଆଙ୍ଗୁଠି ଚାରିପାଖେ ଲାଲ୍ ଫୁଲା ଉପରକୁ ମାଡ଼ିବା", "sym": "ଗୋଡ଼ ପାପୁଲି ଉଷୁମ, ନଖ କୋଣରୁ ପୂଜ ବାହାରିବା, ଜୋତା ପିନ୍ଧି ହେଉନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "periorbital_cellulitis_mild; localized_edema; intact_extraocular_movements",
                "en": {"cc": "Swollen tender purple-red eyelid in child following mosquito bite", "sym": "Eye movements normal without pain behind eye, lid warm and puffy, mild fever"},
                "hi": {"cc": "मच्छर काटने के बाद बच्चे की पलक में लाल गर्म सूजन", "sym": "पुतली चारों तरफ घूम रही है, आंख के अंदर दर्द नहीं पर पलक काफी सूजी है, हल्का बुखार"},
                "or": {"cc": "ମଶା କାମୁଡ଼ିବା ପରେ ପିଲାର ଆଖି ପତା ଲାଲ୍ ପଡ଼ି ଫୁଲିଯିବା", "sym": "ଡୋଳା ଚଳପ୍ରଚଳ ସ୍ୱାଭାବିକ, ଆଖି ପଛପଟ ବିନ୍ଧା ନାହିଁ କିନ୍ତୁ ପତା ଫୁଲିଛି, ଜ୍ୱର"}
            }
        ]
    },

    # 15. Moderate Head Injury with Brief Concussion
    {
        "family_id": "FAM_YEL_15",
        "concept_id": "CONCEPT_HEAD_INJURY_CONCUSSION",
        "urgency": "YELLOW",
        "min_age": 14, "max_age": 70,
        "pain_min": 6, "pain_max": 8,
        "duration_hours": [1.0, 2.0, 4.0],
        "vitals_func": lambda: {
            "hr": r_int(76, 98), "sbp": r_int(125, 148), "dbp": r_int(78, 92),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(16, 20)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "concussion_with_brief_amnesia; post_traumatic_headache; single_emesis; alert_gcs15",
                "en": {"cc": "Direct head blow during football with 30-second blackout, bad headache and one vomit", "sym": "Does not remember the impact moment, throbbing temporal headache, fully awake, pupils equal and reactive"},
                "hi": {"cc": "फुटबॉल खेलते समय सिर में टक्कर, 30 सेकंड बेहोशी, तेज सिरदर्द और एक उल्टी", "sym": "चोट लगने का समय याद नहीं, कनपटी में तेज दर्द, पूरी तरह होश में, दोनों पुतलियां सामान्य"},
                "or": {"cc": "ଫୁଟବଲ୍ ବେଳେ ମୁଣ୍ଡରେ ଶକ୍ତ ଆଘାତ, ୩୦ ସେକେଣ୍ଡ ଅଚେତ, ମୁଣ୍ଡବିନ୍ଧା ଓ ଥରେ ବାନ୍ତି", "sym": "ପଡ଼ିବା କଥା ମନେପଡୁ ନାହିଁ, କପାଳରେ ପ୍ରବଳ ବିନ୍ଧା, ସମ୍ପୂର୍ଣ୍ଣ ଚେତନା ଅଛି, ଡୋଳା ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T02",
                "concepts": "blunt_head_trauma; goose_egg_hematoma; persistent_nausea",
                "en": {"cc": "Large bulging forehead bump after falling against doorframe with persistent nausea", "sym": "Egg-sized tender hematoma, dizzy when sitting upright, answering questions appropriately, no neck stiffness"},
                "hi": {"cc": "दरवाजे से सिर टकराने के बाद माथे पर बड़ा गुमड़ा और लगातार मतली", "sym": "अंडे के आकार का सूजन, उठने पर चक्कर, सभी सवालों का सही जवाब दे रहे हैं, गर्दन नहीं अकड़ी"},
                "or": {"cc": "କବାଟରେ ମୁଣ୍ଡ ବାଜି କପାଳରେ ବଡ଼ ଗୁମୁଡ଼ା ଫୁଲା ଓ ଅବିରତ ବାନ୍ତି ଭାବ", "sym": "ଅଣ୍ଡା ଆକାରର ଫୁଲା, ଉଠି ବସିଲେ ମୁଣ୍ଡ ଘୁରାଉଛି, ସବୁ ପ୍ରଶ୍ନର ଉତ୍ତର ଦେଉଛନ୍ତି"}
            },
            {
                "sub_id": "T03",
                "concepts": "post_concussive_dizziness; retrograde_amnesia; stable_neurology",
                "en": {"cc": "Stumbled backwards hitting back of head on concrete, repeats questions", "sym": "Asks what happened repeatedly, knows own name and date, dull occipital ache, no ear/nose fluid"},
                "hi": {"cc": "फर्श पर पीछे की ओर गिरने से सिर के पिछले हिस्से में चोट, बार-बार एक ही बात पूछना", "sym": "बार-बार पूछ रहे हैं क्या हुआ, अपना नाम-तारीख पता है, कान या नाक से कोई पानी नहीं"},
                "or": {"cc": "କଂକ୍ରିଟ୍ ଚଟାଣରେ ପଛମୁଣ୍ଡ ବାଡ଼େଇ ହୋଇ ପଡ଼ିବା, ବାରମ୍ବାର ଗୋଟିଏ କଥା ପଚାରିବା", "sym": "କ'ଣ ହେଲା ବୋଲି ବାରମ୍ବାର ପଚାରୁଛନ୍ତି, ନିଜ ନାମ ଜାଣିଛନ୍ତି, ନାକ-କାନରୁ ରକ୍ତ ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "cranial_contusion; photophobia_post_trauma; gcs_normal",
                "en": {"cc": "Moderate head trauma from bicycle tumble with sensitivity to light and pain", "sym": "Severe bilateral headache, light hurts eyes, walking with normal gait, completely oriented"},
                "hi": {"cc": "साइकिल से गिरने के बाद सिर में तेज दर्द और रोशनी से घबराहट", "sym": "सिर के दोनों तरफ भारी दर्द, आंखें खोलने में तकलीफ, चलने में संतुलन ठीक है"},
                "or": {"cc": "ସାଇକେଲରୁ ପଡ଼ି ମୁଣ୍ଡରେ ଯନ୍ତ୍ରଣା ଓ ଆଲୋକରେ ଆଖି କଷ୍ଟ", "sym": "ମୁଣ୍ଡର ଦୁଇ ପାଖରେ ବିନ୍ଧା, ଆଲୋକ ଦେଖିଲେ କଷ୍ଟ, ଚାଲିବାରେ ସନ୍ତୁଳନ ଠିକ୍ ଅଛି"}
            },
            {
                "sub_id": "T05",
                "concepts": "minor_closed_head_injury; scalp_bruising; observation_candidate",
                "en": {"cc": "Head collision with heavy kitchen cabinet resulting in constant headache", "sym": "Tender bruised crown of scalp, mild wooziness, no seizures, no weakness in limbs"},
                "hi": {"cc": "रसोई की अलमारी से सिर टकराने के बाद लगातार बना रहने वाला तेज दर्द", "sym": "सिर के ऊपर नीला निशान, हल्का चक्कर, कोई दौरा या हाथ-पैर में कमजोरी नहीं"},
                "or": {"cc": "ଆଲମାରୀରେ ମୁଣ୍ଡ ପିଟି ହୋଇ କ୍ରମାଗତ ଅସହ୍ୟ ମୁଣ୍ଡବିନ୍ଧା", "sym": "ମୁଣ୍ଡ ଉପରେ କଳା ଦାଗ, ହାଲୁକା ମୁଣ୍ଡ ଘୁରାଇବା, ବାତ ନାହିଁ କିମ୍ବା ହାତଗୋଡ଼ ଦୁର୍ବଳ ନୁହେଁ"}
            }
        ]
    },

    # 16. Acute Gout Flare / Septic Monoarthritis Suspect
    {
        "family_id": "FAM_YEL_16",
        "concept_id": "CONCEPT_ACUTE_MONOARTHRITIS",
        "urgency": "YELLOW",
        "min_age": 30, "max_age": 75,
        "pain_min": 7, "pain_max": 9,
        "duration_hours": [6.0, 12.0, 24.0, 36.0],
        "vitals_func": lambda: {
            "hr": r_int(84, 106), "sbp": r_int(128, 150), "dbp": r_int(80, 92),
            "spo2": r_int(98, 100), "temp": r_float(37.5, 38.5), "rr": r_int(16, 20)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "acute_first_mtp_erythema; podagra; severe_joint_tenderness; bedsheet_intolerance",
                "en": {"cc": "Woke at 3 AM with red-hot excruciating swelling of big toe joint unable to touch bedsheet", "sym": "First metatarsophalangeal joint fiery red swollen shiny, even air breeze causes agony, cannot weight-bear"},
                "hi": {"cc": "रात तीन बजे पैर के अंगूठे में भयानक लाल गर्म सूजन, चादर का स्पर्श भी असहनीय", "sym": "अंगूठे का जोड़ बिल्कुल लाल और तपा हुआ, हवा लगने से भी चीख निकलना, पैर जमीन पर न रख पाना"},
                "or": {"cc": "ରାତି ୩ଟାରେ ଗୋଡ଼ ବୁଢ଼ା ଆଙ୍ଗୁଠି ଗଣ୍ଠି ଲାଲ୍ ଉଷୁମ ହୋଇ ଅସହ୍ୟ କଷ୍ଟ, ଚାଦର ଛୁଇଁଲେ ବି ଯନ୍ତ୍ରଣା", "sym": "ଆଙ୍ଗୁଠି ଗଣ୍ଠି ନାଲି ଟହଟହ ଓ ଫୁଲା, ପବନ ବାଜିଲେ ବି କଷ୍ଟ, ପାଦ ତଳେ ରଖି ହେଉନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_knee_monoarthritis; large_joint_effusion; warmth; fever_mild",
                "en": {"cc": "Rapidly ballooning hot right knee with severe pain and low fever", "sym": "Tense fluid effusion in right knee, ballottable patella, cannot bend joint past 20 degrees, warm skin"},
                "hi": {"cc": "दाहिना घुटना अचानक गुब्बारे की तरह फूलना, गर्म होना और तेज दर्द", "sym": "घुटने में बहुत ज्यादा पानी भर जाना, घुटना मुड़ नहीं रहा, हल्का बुखार और भयंकर टीस"},
                "or": {"cc": "ଡାହାଣ ଆଣ୍ଠୁ ହଠାତ୍ ବେଲୁନ୍ ଭଳି ଫୁଲି ଉଷୁମ ହେବା ଓ ଅସହ୍ୟ ବିନ୍ଧା", "sym": "ଆଣ୍ଠୁ ଭିତରେ ପାଣି ଜମିଛି, ଆଣ୍ଠୁ ଆଦୌ ଭାଙ୍ଗି ହେଉନାହିଁ, ସାମାନ୍ୟ ଜ୍ୱର ଓ କଷ୍ଟ"}
            },
            {
                "sub_id": "T03",
                "concepts": "gouty_arthritis_flare; hyperuricemia_history; severe_throbbing",
                "en": {"cc": "Known gout attack in ankle, unbearable throbbing despite two painkillers", "sym": "Ankle purple-red and expanded, skin desquamating, agonizing pressure feeling, chills"},
                "hi": {"cc": "टखने में गठिया का भयानक दौरा, दो गोलियां लेने के बाद भी असहनीय दर्द", "sym": "टखना बैंगनी-लाल होकर सूजा हुआ, चमड़ी में खिंचाव, दर्द से बुरा हाल, हल्की कंपकंपी"},
                "or": {"cc": "ଗୋଇଠି ଗଣ୍ଠିରେ ଗାଉଟ୍ ଯନ୍ତ୍ରଣାର ପ୍ରକୋପ, ଔଷଧ ଖାଇ ବି ଉପଶମ ନାହିଁ", "sym": "ଗୋଇଠି ବାଇଗଣୀ ଲାଲ୍ ହୋଇ ଫୁଲିଛି, ଭୀଷଣ ଘୋଳାବିନ୍ଧା, ଥରିବା ଭାବ"}
            },
            {
                "sub_id": "T04",
                "concepts": "monoarticular_swelling; joint_fluid_analysis_needed; feverish",
                "en": {"cc": "Hot swollen elbow joint doubled in size overnight with temperature 38.1C", "sym": "Olecranon bursa and joint warm and tense, holding arm frozen at 90 degrees, severe tenderness"},
                "hi": {"cc": "रात भर में कोहनी का जोड़ दोगुना सूज जाना, तेज गर्मी और 38.1C बुखार", "sym": "कोहनी छूने पर बहुत गर्म, हाथ हिलाना असंभव, तेज टीस और भारी सूजन"},
                "or": {"cc": "ରାତିକରେ କହୁଣୀ ଗଣ୍ଠି ଦୁଇଗୁଣ ଫୁଲି ଲାଲ୍ ପଡ଼ିବା ଓ ୩୮.୧ ଡିଗ୍ରୀ ଜ୍ୱର", "sym": "କହୁଣୀ ଛୁଇଁଲେ ନିଆଁ ଭଳି ତାତି, ହାତ ହଲାଇବା ଅସମ୍ଭବ, ପ୍ରବଳ ଯନ୍ତ୍ରଣା"}
            },
            {
                "sub_id": "T05",
                "concepts": "inflammatory_arthropathy; severe_localized_joint_pain; unable_to_walk",
                "en": {"cc": "Excruciating foot arch and midfoot joint burn since morning", "sym": "Midtarsal joints swollen red, hopping on other leg, history of high uric acid, feverish"},
                "hi": {"cc": "सुबह से पैर के पंजे में आग जैसी जलन और भयानक दर्द", "sym": "पंजे की हड्डियां सूजकर लाल, एक पैर से लंगड़ाकर चलना, यूरिक एसिड का पुराना इतिहास"},
                "or": {"cc": "ସକାଳୁ ପାଦ ପତା ଭିତରେ ନିଆଁ ଭଳି ପୋଡ଼ିବା ଓ ଅସହ୍ୟ ବିନ୍ଧା", "sym": "ପାଦ ହାଡ଼ ଫୁଲି ନାଲି ପଡ଼ିଛି, ଅନ୍ୟ ଗୋଡ଼ରେ ଡେଇଁ ଡେଇଁ ଚାଲୁଛନ୍ତି, ୟୁରିକ ଏସିଡ୍ ଇତିହାସ"}
            }
        ]
    },

    # 17. Acute Moderate Epistaxis
    {
        "family_id": "FAM_YEL_17",
        "concept_id": "CONCEPT_ACUTE_EPISTAXIS",
        "urgency": "YELLOW",
        "min_age": 18, "max_age": 80,
        "pain_min": 2, "pain_max": 5,
        "duration_hours": [0.5, 1.0, 2.0],
        "vitals_func": lambda: {
            "hr": r_int(86, 108), "sbp": r_int(145, 175), "dbp": r_int(90, 105),
            "spo2": r_int(97, 100), "temp": r_float(36.5, 37.2), "rr": r_int(16, 20)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "persistent_anterior_epistaxis; failed_direct_pressure; hypertension_associated; stable_vitals",
                "en": {"cc": "Continuous brisk nosebleed from right nostril for 45 minutes despite firm pinching", "sym": "Soaked multiple handkerchiefs, spitting occasional small dark clots, BP elevated, feels anxious but alert"},
                "hi": {"cc": "दाहिनी नाक से 45 मिनट से लगातार खून बहना, दबाने पर भी बंद न होना", "sym": "कई रुमाल खून से भीग चुके हैं, मुंह में खून के थक्के आना, बीपी बढ़ा हुआ, घबराहट पर होश में"},
                "or": {"cc": "ଡାହାଣ ନାକରୁ ୪୫ ମିନିଟ୍ ଧରି ଅବିରତ ରକ୍ତ ବୋହିବା, ଚାପି ଧରିଲେ ବି ବନ୍ଦ ନହେବା", "sym": "ଅନେକ ରୁମାଲ୍ ରକ୍ତରେ ଭିଜିଲାଣି, ପାଟିକୁ ରକ୍ତ ଗୋଟା ଆସୁଛି, ରକ୍ତଚାପ ବେଶି, ସଚେତନ"}
            },
            {
                "sub_id": "T02",
                "concepts": "hypertensive_epistaxis; active_bleeding; clot_passage",
                "en": {"cc": "Sudden heavy nasal bleed after sneezing in hypertensive patient", "sym": "Bleeding streaming steadily, ice pack held to nose bridge without stop, clothes stained with blood"},
                "hi": {"cc": "हाई बीपी के मरीज में छींकने के बाद नाक से तेज खून का फव्वारा", "sym": "बर्फ लगाने पर भी बहाव नहीं रुका, कपड़े खून से सने हुए, चक्कर या बेहोशी नहीं"},
                "or": {"cc": "ଉଚ୍ଚ ରକ୍ତଚାପ ଥିବା ରୋଗୀଙ୍କ ଛିଙ୍କିବା ପରେ ନାକରୁ ପ୍ରବଳ ରକ୍ତସ୍ରାବ", "sym": "ବରଫ ଲଗାଇଲେ ବି ରକ୍ତ ବନ୍ଦ ହେଉନାହିଁ, ପୋଷାକ ରକ୍ତରେ ଭିଜିଛି, ଚେତା ଅଛି"}
            },
            {
                "sub_id": "T03",
                "concepts": "anticoagulant_epistaxis_risk; persistent_ooze; stable_airway",
                "en": {"cc": "Nosebleed that will not coagulate in patient taking blood thinners", "sym": "On daily aspirin, steady drip filling kidney dish, airway clear, blood pressure 160/95"},
                "hi": {"cc": "खून पतला करने की दवा लेने वाले मरीज की नाक से लगातार खून रिसना", "sym": "एस्पिरिन की गोली लेते हैं, खून रुक नहीं रहा, सांस की नली साफ है, बीपी 160/95"},
                "or": {"cc": "ରକ୍ତ ପତଳା ଔଷଧ ଖାଉଥିବା ରୋଗୀଙ୍କ ନାକରୁ ଲଗାତାର ରକ୍ତ ଝରିବା", "sym": "ପ୍ରତିଦିନ ଆସ୍ପିରିନ୍ ଖାଆନ୍ତି, ରକ୍ତ ଜମାଟ ବାନ୍ଧୁନାହିଁ, ଶ୍ୱାସନଳୀ ସଫା, ରକ୍ତଚାପ ୧୬୦/୯୫"}
            },
            {
                "sub_id": "T04",
                "concepts": "posterior_or_arterial_epistaxis_suspect; packing_needed; alert",
                "en": {"cc": "Heavy flow of blood from both nostrils and down back of throat", "sym": "Swallowing blood causing nausea, pressure on nose wings unsuccessful, needs anterior packing"},
                "hi": {"cc": "दोनों नथुनों से खून बहना और गले के पीछे खून टपकना", "sym": "खून निगलने से उल्टी का मन, नाक दबाने से भी खून गले में जा रहा है, पट्टी की जरूरत"},
                "or": {"cc": "ଉଭୟ ନାକପୁଡ଼ାରୁ ରକ୍ତ ବୋହିବା ଓ ଗଳା ଭିତରକୁ ରକ୍ତ ଖସିବା", "sym": "ରକ୍ତ ଗିଳିବା ଯୋଗୁଁ ବାନ୍ତି ଭାବ, ନାକ ଚିପି ଧରିଲେ ବି ବନ୍ଦ ହେଉନାହିଁ, ପ୍ୟାକିଂ ଆବଶ୍ୟକ"}
            },
            {
                "sub_id": "T05",
                "concepts": "recurrent_epistaxis; elevated_blood_pressure; no_shock",
                "en": {"cc": "Third nosebleed episode today lasting over an hour with headache", "sym": "Tired of holding cotton plug, constant red trickling, pulse regular, no lightheadedness"},
                "hi": {"cc": "आज तीसरी बार नाक से खून फूटना जो एक घंटे से जारी है", "sym": "रुई लगाने पर भी खून का रिसाव, सिर में भारीपन, कमजोरी, खड़े होने पर चक्कर नहीं"},
                "or": {"cc": "ଆଜି ତୃତୀୟ ଥର ପାଇଁ ନାକରୁ ରକ୍ତ ଫିଟି ଘଣ୍ଟାଏରୁ ଅଧିକ ବୋହିବା", "sym": "ତୁଳା ଦେଇ ବି ରକ୍ତ ଝରୁଛି, ମୁଣ୍ଡ ଭାରୀ, ନାଡ଼ି ସ୍ୱାଭାବିକ, ମୁଣ୍ଡ ବୁଲାଉ ନାହିଁ"}
            }
        ]
    },

    # 18. Second-Degree Thermal Burn (< 10% TBSA)
    {
        "family_id": "FAM_YEL_18",
        "concept_id": "CONCEPT_SECOND_DEGREE_BURN",
        "urgency": "YELLOW",
        "min_age": 10, "max_age": 65,
        "pain_min": 7, "pain_max": 9,
        "duration_hours": [0.5, 1.0, 2.0],
        "vitals_func": lambda: {
            "hr": r_int(88, 110), "sbp": r_int(120, 142), "dbp": r_int(76, 88),
            "spo2": r_int(98, 100), "temp": r_float(36.6, 37.3), "rr": r_int(16, 20)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "scald_burn_forearm; bullae_formation; intense_pain; partial_thickness",
                "en": {"cc": "Severe boiling water scald across right forearm with large fluid-filled blisters", "sym": "Large tense blisters covering forearm, raw pink weeping skin exposed where one blister popped, intense pain"},
                "hi": {"cc": "हाथ पर खौलता पानी गिरने से बड़े-बड़े पानी भरे फफोले और भयानक जलन", "sym": "पूरे हाथ पर फफोले, एक फफोला फूटने से गुलाबी कच्चा मांस दिख रहा, असहनीय दर्द"},
                "or": {"cc": "ହାତରେ ଫୁଟୁଥିବା ଗରମ ପାଣି ପଡ଼ି ବଡ଼ ବଡ଼ ଫୋଟକା ଓ ପ୍ରଚଣ୍ଡ ପୋଡ଼ାଜଳା", "sym": "ହାତସାରା ପାଣି ଭର୍ତ୍ତି ଫୋଟକା, ଫୋଟକା ଫାଟି ଲାଲ୍ କଞ୍ଚା ଚମଡ଼ା ଦିଶୁଛି, ଅସହ୍ୟ କଷ୍ଟ"}
            },
            {
                "sub_id": "T02",
                "concepts": "hot_oil_splash_burn; partial_thickness; blistering; dressing_needed",
                "en": {"cc": "Hot cooking oil splash over dorsum of hand with peeling blistered skin", "sym": "Blistered hand swollen, stinging burns between fingers, cooled with running water for 10 min"},
                "hi": {"cc": "खाना बनाते समय खौलता तेल हाथ पर छलकने से चमड़ी उधड़ना और फफोले", "sym": "हाथ की चमड़ी लाल और छालेदार, उंगलियों के बीच तेज जलन, पानी से धोने पर भी दर्द"},
                "or": {"cc": "ରନ୍ଧା ବେଳେ ତାତିଲା ତେଲ ହାତରେ ପଡ଼ି ଚମଡ଼ା ଛାଲି ଫୋଟକା ହେବା", "sym": "ହାତ ପାପୁଲି ପଛପଟ ଫୁଲି ଫୋଟକା, ଆଙ୍ଗୁଠି ମଝିରେ ପୋଡ଼ିବା, ପାଣିରେ ଧୋଇଲେ ବି କଷ୍ଟ"}
            },
            {
                "sub_id": "T03",
                "concepts": "steam_iron_burn; localized_second_degree; acute_distress",
                "en": {"cc": "Contact iron burn on thigh causing raw blistering skin measuring 8x5 cm", "sym": "Shiny clear fluid blisters, agonizing pain to air contact, wrapped loosely with cling film"},
                "hi": {"cc": "गर्म इस्त्री जांघ पर लगने से 8x5 सेमी का गहरा जला घाव और छाले", "sym": "चमड़ी पर फफोले, हवा लगने से भी भयानक दर्द, साफ पन्नी से ढककर लाए हैं"},
                "or": {"cc": "ଗରମ ଇସ୍ତ୍ରୀ ଜଙ୍ଘରେ ବାଜି ୮x୫ ସେମି ଜଳା କ୍ଷତ ଓ ଫୋଟକା", "sym": "ଚମଡ଼ା ଉପରେ ପାଣିଆ ଫୋଟକା, ପବନ ବାଜିଲେ ଅସହ୍ୟ ପୋଡ଼ିବା, ପଲିଥିନ୍ ଘୋଡ଼ାଇ ଆସିଛନ୍ତି"}
            },
            {
                "sub_id": "T04",
                "concepts": "exhaust_pipe_burn; localized_dermal_burn; blistering",
                "en": {"cc": "Motorcycle exhaust silencer burn to right calf with intact blisters", "sym": "Circumscribed second-degree burn, very tender, swelling around ankle, no charring"},
                "hi": {"cc": "बाइक के गर्म साइलेंसर से पैर की पिंडली बुरी तरह जलना और फफोला", "sym": "पिंडली पर गोल जला हुआ घाव, छूने पर बहुत दर्द, टखने के पास हल्की सूजन"},
                "or": {"cc": "ବାଇକ୍ ସାଇଲେନ୍ସର ବାଜି ଗୋଡ଼ ପେଣ୍ଡା ଜଳିଯିବା ଓ ବଡ଼ ଫୋଟକା", "sym": "ଗୋଲ ଆକାରର ଜଳା ଘା', ସାମାନ୍ୟ ସ୍ପର୍ଶରେ କଷ୍ଟ, ଗୋଇଠି ପାଖ ଫୁଲିଛି"}
            },
            {
                "sub_id": "T05",
                "concepts": "firework_thermal_burn; hand_partial_thickness; acute_pain",
                "en": {"cc": "Firecracker thermal burn across palm with painful blistering", "sym": "Singed epidermis, blistering across palm base, fingers mobile, intense burning"},
                "hi": {"cc": "पटाखा फटने से हथेली में फफोले और भयानक जलन", "sym": "हथेली की चमड़ी जली हुई और पानी भरे छाले, उंगलियां हिल रही हैं पर तेज जलन"},
                "or": {"cc": "ବାଣ ଫୁଟି ହାତ ପାପୁଲି ଜଳିଯିବା ଓ ଯନ୍ତ୍ରଣାଦାୟକ ଫୋଟକା", "sym": "ପାପୁଲି ଚମଡ଼ା ପୋଡ଼ି ଫୋଟକା, ଆଙ୍ଗୁଠି ଚଳୁଛି କିନ୍ତୁ ଭୀଷଣ ଜଳାପୋଡ଼ା"}
            }
        ]
    },

    # 19. Acute Peritonsillar Abscess / Quinsy Suspect
    {
        "family_id": "FAM_YEL_19",
        "concept_id": "CONCEPT_PERITONSILLAR_ABSCESS",
        "urgency": "YELLOW",
        "min_age": 16, "max_age": 55,
        "pain_min": 7, "pain_max": 9,
        "duration_hours": [48.0, 72.0, 96.0],
        "vitals_func": lambda: {
            "hr": r_int(92, 114), "sbp": r_int(118, 140), "dbp": r_int(74, 88),
            "spo2": r_int(96, 99), "temp": r_float(38.3, 39.3), "rr": r_int(18, 22)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "unilateral_severe_sore_throat; trismus_difficulty_opening_mouth; hot_potato_voice; drooling; fever",
                "en": {"cc": "Severe right sided throat pain unable to swallow saliva with muffled hot potato voice", "sym": "Cannot open mouth wider than two fingers, right tonsil bulging across midline, pooling saliva in mouth, fever"},
                "hi": {"cc": "गले के दाहिने तरफ असहनीय दर्द, लार न निगल पाना और मुंह पूरा न खुलना", "sym": "दो अंगुली से ज्यादा मुंह नहीं खुल रहा, आवाज भारी और बदली हुई, लार टपकना, तेज बुखार"},
                "or": {"cc": "ଗଳାର ଡାହାଣ ପଟେ ଅସହ୍ୟ ଯନ୍ତ୍ରଣା, ଛେପ ଢୋକି ନପାରିବା ଓ ମୁହଁ ଖୋଲି ନହେବା", "sym": "ଦୁଇ ଆଙ୍ଗୁଠିରୁ ଅଧିକ ପାଟି ଖୋଲୁନାହିଁ, ସ୍ୱର ମୋଟା ଓ ଅସ୍ପଷ୍ଟ, ଲାଳ ବୋହିବା, ଜ୍ୱର"}
            },
            {
                "sub_id": "T02",
                "concepts": "quinsy_suspect; referred_otalgia; uvular_deviation_suspect; dysphagia",
                "en": {"cc": "Intense throat agony shooting into right ear when swallowing water", "sym": "Ear pain triggered by swallowing, large swollen tonsillar mass, fever unbroken for 3 days"},
                "hi": {"cc": "पानी घूंटने पर गले से कान में तेज दर्द की टीस और बुखार", "sym": "गले का दर्द कान में जाना, दाहिनी तरफ भारी सूजन, तीन दिन से बुखार नहीं उतर रहा"},
                "or": {"cc": "ପାଣି ଢୋକିଲେ ଗଳାରୁ କାନ ଭିତରକୁ ତୀବ୍ର ବିନ୍ଧା ମାଡ଼ିଯିବା ଓ ଜ୍ୱର", "sym": "ଢୋକିବା ମାତ୍ରେ କାନରେ କଷ୍ଟ, ଡାହାଣ ଗଳା ଫୁଲି କଣ୍ଠନାଳୀ ଚିପି ହେବା, ଜ୍ୱର"}
            },
            {
                "sub_id": "T03",
                "concepts": "peritonsillar_cellulitis; severe_odynophagia; trismus",
                "en": {"cc": "Severe one sided throat swelling making drinking liquids agonizing", "sym": "Spitting saliva into cup, neck tender under jaw angle, jaw muscles rigid, high temperature"},
                "hi": {"cc": "गले के एक तरफ भयानक सूजन जिससे पानी पीना भी दूभर", "sym": "थूक कप में थूकना पड़ रहा है, जबड़े के नीचे गिल्टी में तेज दर्द, जबड़ा जकड़ा हुआ, तेज बुखार"},
                "or": {"cc": "ଗଳାର ଗୋଟିଏ ପଟେ ଭୀଷଣ ଫୁଲା ଯୋଗୁଁ ଢୋକ ପିଇବା ଅସମ୍ଭବ", "sym": "ଛେପ ଗିଳି ନପାରି ପାତ୍ରରେ ପକାଉଛନ୍ତି, କାନତଳ ଗାଲ ଫୁଲି କଠିନ, ଜ୍ୱର"}
            },
            {
                "sub_id": "T04",
                "concepts": "tonsillar_abscess_progression; muffled_speech; high_fever",
                "en": {"cc": "Right tonsil throbbing with jaw locking and voice sounding like mouth full", "sym": "Worsening over 4 days despite amoxicillin, tender cervical lymph node, high body heat"},
                "hi": {"cc": "गले में दाहिनी तरफ मवाद जैसा दर्द, जबड़ा बंद और बोलने में तकलीफ", "sym": "एंटीबायोटिक लेने पर भी आराम नहीं, गर्दन की गांठ में दर्द, तेज बुखार"},
                "or": {"cc": "ଡାହାଣ ଟନସିଲ୍ ପୂଜ ଭଳି ବିନ୍ଧିବା, ପାଟି ବନ୍ଦ ହୋଇଯିବା ଓ କଥା ଅସ୍ପଷ୍ଟ", "sym": "ଔଷଧ ଖାଇ ବି ୪ ଦିନରୁ କମୁନାହିଁ, ବେକ ଗାଣ୍ଠି ଫୁଲିଛି, ପ୍ରବଳ ଜ୍ୱର"}
            },
            {
                "sub_id": "T05",
                "concepts": "deep_neck_space_infection_risk; trismus; pyrexia",
                "en": {"cc": "Inability to swallow solid food or pills with acute right neck angle swelling", "sym": "Spitting secretions, right submandibular tenderness, mouth opening limited, fever 38.8C"},
                "hi": {"cc": "खाना या गोली निगलने में असमर्थ, जबड़े के नीचे तेज दर्द और सूजन", "sym": "लार बाहर निकालना, गर्दन के ऊपरी हिस्से में भारी दर्द, मुंह नहीं खुल रहा, 38.8C बुखार"},
                "or": {"cc": "ଖାଦ୍ୟ ବା ବଟିକା ଗିଳି ନପାରିବା, ଗାଲ କୋଣରେ ତୀବ୍ର ବିନ୍ଧା ଓ ଫୁଲା", "sym": "ଛେପ ପକାଉଛନ୍ତି, ଡାହାଣ କାନତଳ ଚିପିଲେ କଷ୍ଟ, ମୁହଁ ଖୋଲୁନାହିଁ, ୩୮.୮ ଡିଗ୍ରୀ ଜ୍ୱର"}
            }
        ]
    },

    # 20. Symptomatic Atrial Fibrillation / Tachycardia (Stable Hemodynamics)
    {
        "family_id": "FAM_YEL_20",
        "concept_id": "CONCEPT_SYMPTOMATIC_TACHYCARDIA_STABLE",
        "urgency": "YELLOW",
        "min_age": 45, "max_age": 82,
        "pain_min": 1, "pain_max": 4,
        "duration_hours": [2.0, 4.0, 8.0, 18.0],
        "vitals_func": lambda: {
            "hr": r_int(125, 145), "sbp": r_int(124, 148), "dbp": r_int(78, 92),
            "spo2": r_int(96, 99), "temp": r_float(36.5, 37.2), "rr": r_int(18, 22)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "rapid_irregular_palpitations; flutter_sensation; lightheadedness; stable_blood_pressure; no_chest_pain",
                "en": {"cc": "Racing irregular heartbeat jumping like fish in chest with flutter and mild dizziness", "sym": "Pulse chaotic and fast at 135 bpm, fluttering in throat, lightheaded when walking, no chest tightness, BP stable"},
                "hi": {"cc": "सीने में दिल का बेहद तेज और अनियमित धड़कना, घबराहट और चक्कर", "sym": "नब्ज 135 पर बेतरतीब भाग रही है, गले में फड़फड़ाहट, चलने पर सिर घूमना, छाती में दर्द नहीं, बीपी ठीक है"},
                "or": {"cc": "ଛାତି ଭିତରେ ମାଛ ଫଡ଼ଫଡ଼ ହେବା ଭଳି ଦ୍ରୁତ ଅନିୟମିତ ସ୍ପନ୍ଦନ ଓ ମୁଣ୍ଡ ବୁଲାଇବା", "sym": "ନାଡ଼ି ୧୩୫ରେ ବେତାଳ ଚାଲୁଛି, ଗଳାରେ ଧପଧପ, ଚାଲିଲେ ମୁଣ୍ଡ ଘୁରାଉଛି, ଛାତି ବିନ୍ଧା ନାହିଁ, ରକ୍ତଚାପ ସ୍ଥିର"}
            },
            {
                "sub_id": "T02",
                "concepts": "atrial_fibrillation_rapid_ventricular_response; pulse_deficit; fatigue",
                "en": {"cc": "Sudden onset pounding irregular pulse keeping patient restless for 4 hours", "sym": "Heart thumping irregularly in ribcage, sudden fatigue, pulse feels erratic at wrist, alert"},
                "hi": {"cc": "चार घंटे से दिल की तेज धड़कन और नब्ज में बेतरतीब उछाल", "sym": "छाती में जोर-जोर से धड़कन महसूस होना, अचानक भारी कमजोरी, नब्ज का तालमेल बिगड़ा हुआ"},
                "or": {"cc": "୪ ଘଣ୍ଟା ଧରି ଛାତି ଭିତରେ ପ୍ରଚଣ୍ଡ ଧପଧପ ଓ ଅନିୟମିତ ନାଡ଼ି", "sym": "ପଞ୍ଜରା ଭିତରେ ହୃତ୍‌ପିଣ୍ଡ ଡେଉଁଛି, ହଠାତ୍ ପ୍ରବଳ କ୍ଳାନ୍ତି, ନାଡ଼ିର ଗତି ଠିକ୍ ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "paroxysmal_supraventricular_tachycardia_stable; throat_flutter; anxiety",
                "en": {"cc": "Rapid fluttering palpitations started while drinking tea, rate feels over 130", "sym": "Fast steady thumping, tried coughing and cold water without resetting rhythm, warm skin"},
                "hi": {"cc": "चाय पीते समय अचानक दिल की धड़कन 130 से ऊपर भागना", "sym": "लगातार तेज धड़कन, खांसने या ठंडा पानी पीने से भी नहीं थमी, हाथ-पैर सामान्य हैं"},
                "or": {"cc": "ଚା' ପିଉଥିବା ବେଳେ ହଠାତ୍ ଛାତି ଧଡ଼ଧଡ଼ ହୋଇ ୧୩୦ରୁ ଉର୍ଦ୍ଧ୍ୱ ଗତି", "sym": "ଅବିରତ ଦ୍ରୁତ ସ୍ପନ୍ଦନ, ଥଣ୍ଡା ପାଣି ପିଇଲେ ବି ସ୍ୱାଭାବିକ ହେଉନାହିଁ, ଚମଡ଼ା ଉଷୁମ"}
            },
            {
                "sub_id": "T04",
                "concepts": "tachyarrhythmia_normotensive; shortness_of_breath_on_exertion; pulse_irregularity",
                "en": {"cc": "Heart racing out of sync with breathlessness on climbing one flight of stairs", "sym": "Skipping beats followed by bursts of rapid pumping, mild chest flutter, no arm radiation, alert"},
                "hi": {"cc": "सीढ़ियां चढ़ने पर दिल बेकाबू धड़कना और सांस फूलना", "sym": "धड़कन का बीच-बीच में छूटना और फिर तेज भागना, सीने में कंपन, हाथ में कोई दर्द नहीं"},
                "or": {"cc": "ପାହାଚ ଚଢ଼ିଲା ବେଳେ ହୃଦସ୍ପନ୍ଦନ ଅନିୟନ୍ତ୍ରିତ ହେବା ଓ ଶ୍ୱାସ ଫୁଲିବା", "sym": "ସ୍ପନ୍ଦନ ବନ୍ଦ ହୋଇ ପୁଣି ଦ୍ରୁତ ହେବା, ଛାତିରେ କମ୍ପନ, ହାତକୁ କଷ୍ଟ ବ୍ୟାପୁନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "symptomatic_atrial_flutter; palpitations; preserved_perfusion",
                "en": {"cc": "Unpleasant fluttering sensation in chest causing weakness and anxiety", "sym": "Pulse rapid and irregular, capillary refill 2 seconds, no diaphoresis, fully conscious"},
                "hi": {"cc": "सीने में लगातार फड़फड़ाहट जिससे बेचैनी और कमजोरी महसूस हो रही", "sym": "तेज और असामान्य नब्ज, पसीना नहीं है, पूरी तरह होश में हैं, बीपी सामान्य"},
                "or": {"cc": "ଛାତିରେ ଅସ୍ୱାଭାବିକ ଫଡ଼ଫଡ଼ ଯୋଗୁଁ ଅସ୍ଥିରତା ଓ ଦୁର୍ବଳତା", "sym": "ନାଡ଼ି ଦ୍ରୁତ ଓ ଅନିୟମିତ, ଝାଳ ବୋହୁନାହିଁ, ସମ୍ପୂର୍ଣ୍ଣ ଚେତନା ଅଛି, ରକ୍ତଚାପ ଠିକ୍"}
            }
        ]
    }
]
