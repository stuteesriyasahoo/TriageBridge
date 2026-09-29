# Continuation of scripts/triage_v3_yellow_definitions.py (Families 9 to 20)

def r_int(low, high):
    import random
    return random.randint(low, high)

def r_float(low, high, dec=1):
    import random
    return round(random.uniform(low, high), dec)

YELLOW_FAMILIES_PART2 = [
    # 9. Symptomatic Hyperglycemia
    {
        "family_id": "FAM_YEL_09",
        "concept_id": "CONCEPT_SYMPTOMATIC_HYPERGLYCEMIA",
        "urgency": "YELLOW",
        "min_age": 25, "max_age": 78,
        "pain_min": 1, "pain_max": 4,
        "duration_hours": [24.0, 48.0, 72.0],
        "vitals_func": lambda: {
            "hr": r_int(92, 112), "sbp": r_int(125, 148), "dbp": r_int(76, 90),
            "spo2": r_int(97, 100), "temp": r_float(36.6, 37.4), "rr": r_int(18, 22)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "marked_hyperglycemia; polyuria; polydipsia; dry_mucosa; non_ketotic_alert",
                "en": {"cc": "Fingerstick blood sugar over 380 mg/dL with extreme unquenchable thirst and frequent urination", "sym": "Drinking liters of water every hour, parched dry tongue, blurred vision, fully oriented, no fruity breath"},
                "hi": {"cc": "शुगर 380 से ऊपर, बहुत ज्यादा प्यास और बार-बार पेशाब आना", "sym": "हर घंटे खूब पानी पीना, जुबान बिल्कुल सूखी, आंखों के आगे धुंधलापन, पूरी तरह होश में हैं"},
                "or": {"cc": "ଶର୍କରା ୩୮୦ରୁ ଊର୍ଦ୍ଧ୍ୱ, ଅତ୍ୟଧିକ ଶୋଷ ଓ ଘନ ଘନ ପରିସ୍ରା ଲାଗିବା", "sym": "ପ୍ରତି ଘଣ୍ଟାରେ ଲିଟର ଲିଟର ପାଣି ପିଉଛନ୍ତି, ଜିଭ ଶୁଖିଲା, ଆଖି ଝାପ୍‌ସା, ସମ୍ପୂର୍ଣ୍ଣ ଚେତନା ଅଛି"}
            },
            {
                "sub_id": "T02",
                "concepts": "diabetic_dysregulation; blurred_vision; fatigue; high_random_glucose",
                "en": {"cc": "High home sugar test reading HI with dizziness and heavy leg fatigue", "sym": "Glucometer reads above maximum, urinating throughout night, mild dry mouth, alert and conversant"},
                "hi": {"cc": "ग्लूकोमीटर में हाई लिखा आना, चक्कर और पैरों में भारी थकान", "sym": "पूरी रात पेशाब के लिए उठना, मुंह सूखना, कमजोरी, बातचीत सामान्य कर रहे हैं"},
                "or": {"cc": "ଗ୍ଲୁକୋମିଟରରେ HI ଦେଖାଇବା, ମୁଣ୍ଡ ବୁଲାଇବା ଓ ଗୋଡ଼ ଘୋଳାଇ ହେବା", "sym": "ରାତିସାରା ପରିସ୍ରା ପାଇଁ ଉଠିବା, ପାଟି ଶୁଖିବା, ଭୀଷଣ ଦୁର୍ବଳତା, କଥାବାର୍ତ୍ତା ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T03",
                "concepts": "missed_insulin_hyperglycemia; polyuria; headache; stable",
                "en": {"cc": "Severe sugar elevation after missing insulin doses for two days", "sym": "Blood sugar 350, dull persistent forehead ache, excessive urination, skin turgor reduced"},
                "hi": {"cc": "दो दिन से इंसुलिन छूटने के बाद शुगर अत्यधिक बढ़ जाना", "sym": "शुगर 350 आई, सिर में भारीपन, लगातार पेशाब जाना, चमड़ी में खिंचाव"},
                "or": {"cc": "ଦୁଇ ଦିନ ଇନସୁଲିନ ନନେବା ଯୋଗୁଁ ରକ୍ତ ଶର୍କରା ଅତ୍ୟଧିକ ବୃଦ୍ଧି", "sym": "ଶର୍କରା ୩୫୦ ଆସିଲା, ମୁଣ୍ଡ ବିନ୍ଧା, ବାରମ୍ବାର ପରିସ୍ରା, ଚମଡ଼ା ଶୁଖିଲା"}
            },
            {
                "sub_id": "T04",
                "concepts": "hyperglycemic_fatigue; dry_tongue; stable_respirations",
                "en": {"cc": "Severe dry mouth, excessive drinking and fatigue with sugar 395", "sym": "Cannot satisfy thirst, normal breathing rate without sweet odor, alert and walking independently"},
                "hi": {"cc": "मुंह में सूखापन, बहुत ज्यादा प्यास और थकान, शुगर 395", "sym": "प्यास नहीं बुझ रही, सांस की गति सामान्य, मरीज खुद चलकर आया है"},
                "or": {"cc": "ପାଟି ଶୁଖିବା, ଅସମ୍ଭବ ଶୋଷ ଓ କ୍ଳାନ୍ତି, ଶର୍କରା ୩୯୫", "sym": "ପାଣି ପିଇଲେ ବି ଶୋଷ ମରୁନାହିଁ, ଶ୍ୱାସକ୍ରିୟା ସ୍ୱାଭାବିକ, ନିଜେ ଚାଲି ଆସିଛନ୍ତି"}
            },
            {
                "sub_id": "T05",
                "concepts": "uncontrolled_diabetes; osmotic_symptoms; vision_changes",
                "en": {"cc": "Sudden worsening vision and constant bathroom trips with sugar 360", "sym": "Visual focusing difficulty, drinking 5 liters water daily, no vomiting, fully conscious"},
                "hi": {"cc": "अचानक आंखों में धुंधलापन और हर समय पेशाब आना, शुगर 360", "sym": "चीजें साफ न दिखना, दिन में 5 लीटर पानी पीना, उल्टी नहीं है, पूरी तरह सचेत"},
                "or": {"cc": "ହଠାତ୍ ଆଖିକୁ ଝାପ୍‌ସା ଦିଶିବା ଓ ବାରମ୍ବାର ପରିସ୍ରା ଯିବା, ଶର୍କରା ୩୬୦", "sym": "ଦୃଷ୍ଟି ସ୍ପଷ୍ଟ ହେଉନାହିଁ, ଦିନକୁ ୫ ଲିଟର ପାଣି, ବାନ୍ତି ନାହିଁ, ସଚେତନ ଅଛନ୍ତି"}
            }
        ]
    },

    # 10. Acute Diverticulitis / Left Lower Quadrant Pain
    {
        "family_id": "FAM_YEL_10",
        "concept_id": "CONCEPT_ACUTE_DIVERTICULITIS",
        "urgency": "YELLOW",
        "min_age": 45, "max_age": 82,
        "pain_min": 5, "pain_max": 8,
        "duration_hours": [24.0, 48.0, 72.0],
        "vitals_func": lambda: {
            "hr": r_int(86, 104), "sbp": r_int(125, 150), "dbp": r_int(78, 92),
            "spo2": r_int(97, 100), "temp": r_float(37.9, 38.8), "rr": r_int(18, 22)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "left_lower_quadrant_pain; persistent_tenderness; low_fever; altered_bowels",
                "en": {"cc": "Constant aching pain in lower left side of abdomen with low fever and bloating", "sym": "Localized tenderness in left iliac fossa, painful bowel motion, feverish sensation for 2 days"},
                "hi": {"cc": "पेट के निचले बाएं हिस्से में लगातार दर्द, हल्का बुखार और पेट फूलना", "sym": "बाईं तरफ छूने पर भारी दर्द, शौच जाने में तकलीफ, दो दिन से शरीर गर्म"},
                "or": {"cc": "ପେଟର ତଳ ବାମ ପାଖରେ ଲଗାତାର ଯନ୍ତ୍ରଣା, ହାଲୁକା ଜ୍ୱର ଓ ପେଟ ଫାମ୍ପିବା", "sym": "ବାମ ପାଖ ଚିପିଲେ କଷ୍ଟ, ଝାଡ଼ା ଯିବା ବେଳେ ଯନ୍ତ୍ରଣା, ଦୁଇ ଦିନରୁ ଦେହ ତାତିବା"}
            },
            {
                "sub_id": "T02",
                "concepts": "sigmoid_diverticulitis_suspect; crampy_llq_pain; constipation",
                "en": {"cc": "Deep cramp in left groin area worsening with walking or standing", "sym": "Firm tender area felt on lower left stomach, constipation for 3 days, mild shivers"},
                "hi": {"cc": "पेट के बाईं ओर गहरा मरोड़ जो चलने या खड़े होने से बढ़ता है", "sym": "बाईं तरफ कड़ी गांठ जैसा दर्द, तीन दिन से कब्ज, हल्की ठंड लगना"},
                "or": {"cc": "ବାମ ତଳ ପେଟରେ ଗଭୀର କଷ୍ଟ ଯାହା ଚାଲିଲେ ବା ଛିଡ଼ା ହେଲେ ବଢ଼ୁଛି", "sym": "ବାମ କଡ଼ରେ ଶକ୍ତ ଯନ୍ତ୍ରଣା, ତିନି ଦିନ ହେଲା କୋଷ୍ଠକାଠିନ୍ୟ, ସାମାନ୍ୟ ଥରିବା"}
            },
            {
                "sub_id": "T03",
                "concepts": "colonic_inflammation; focal_abdominal_guarding; fever",
                "en": {"cc": "Severe throbbing in left lower stomach with mild nausea and chills", "sym": "Cannot sleep on left side, tender to touch, loss of appetite, no rectal bleeding"},
                "hi": {"cc": "पेट के निचले बाएं हिस्से में टीस, हल्की मतली और कंपकंपी", "sym": "बाईं करवट सोना मुश्किल, हाथ लगाने पर तेज दर्द, भूख न लगना"},
                "or": {"cc": "ତଳ ବାମ ପେଟରେ ତୀବ୍ର ଧପଧପ ବିନ୍ଧା, ସାମାନ୍ୟ ବାନ୍ତି ଭାବ ଓ ଜ୍ୱର", "sym": "ବାମ କଡ଼ ମାଡ଼ି ଶୋଇପାରୁ ନାହାନ୍ତି, ଛୁଇଁଲେ କଷ୍ଟ, ଖାଇବାକୁ ଇଚ୍ଛା ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "subacute_diverticular_flare; localized_tenderness; pyrexia",
                "en": {"cc": "Left pelvic cramp and temperature 38.4C after days of constipation", "sym": "Pain steady and sharp on pressure, bloating relieved slightly by passing gas, persistent fever"},
                "hi": {"cc": "कब्ज के बाद पेल्विस के बाएं हिस्से में दर्द और 38.4C बुखार", "sym": "दबाने पर तेज दर्द, गैस पास होने पर थोड़ा आराम, पर बुखार बना हुआ"},
                "or": {"cc": "କୋଷ୍ଠକାଠିନ୍ୟ ପରେ ବାମ ପେଟରେ ବିନ୍ଧା ଓ ୩୮.୪ ଡିଗ୍ରୀ ଜ୍ୱର", "sym": "ଚିପିଲେ ତୀକ୍ଷ୍ଣ କଷ୍ଟ, ବାୟୁ ଛାଡ଼ିଲେ ସାମାନ୍ୟ ଆଶ୍ୱସ୍ତି କିନ୍ତୁ ଜ୍ୱର ଲାଗିରହିଛି"}
            },
            {
                "sub_id": "T05",
                "concepts": "recurrent_diverticulitis; left_iliac_tenderness; malaise",
                "en": {"cc": "Known diverticular flare-up with pain in lower left abdomen and sweats", "sym": "Same pain as previous hospital admission, tender palpable colon, paracetamol not relieving"},
                "hi": {"cc": "डाइवरटिकुलाइटिस का पुराना दर्द फिर से पेट के बाएं हिस्से में उठा", "sym": "पिछली बार जैसा ही दर्द, बाईं तरफ छूने पर टीस, दवा से आराम नहीं"},
                "or": {"cc": "ବାମ ପେଟରେ ପୂର୍ବ ଭଳି ଯନ୍ତ୍ରଣା ପୁଣି ଆରମ୍ଭ ଓ ଝାଳ ବୋହିବା", "sym": "ପୂର୍ବର ଡାଇଭର୍ଟିକ୍ୟୁଲାଇଟିସ୍ କଷ୍ଟ ଭଳି ଅନୁଭବ, ଡାହାଣ ନୁହେଁ ବାମ ପାଖରେ କଷ୍ଟ"}
            }
        ]
    },

    # 11. Acute Pelvic Inflammatory Disease
    {
        "family_id": "FAM_YEL_11",
        "concept_id": "CONCEPT_PELVIC_INFLAMMATORY_DISEASE",
        "urgency": "YELLOW",
        "min_age": 18, "max_age": 44,
        "pain_min": 6, "pain_max": 8,
        "duration_hours": [48.0, 72.0, 96.0],
        "vitals_func": lambda: {
            "hr": r_int(88, 108), "sbp": r_int(112, 134), "dbp": r_int(70, 84),
            "spo2": r_int(98, 100), "temp": r_float(38.1, 39.0), "rr": r_int(18, 22)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "bilateral_lower_abdominal_pain; cervical_motion_tenderness_suspect; purulent_vaginal_discharge; fever",
                "en": {"cc": "Severe bilateral lower pelvic pain with high fever and foul vaginal discharge", "sym": "Deep aching across both lower quadrants, worsened by walking or intercourse, shivering fevers"},
                "hi": {"cc": "पेल्विस के दोनों तरफ तेज दर्द, तेज बुखार और बदबूदार स्राव", "sym": "पेट के निचले दोनों हिस्सों में गहरा दर्द, चलने पर तकलीफ बढ़ना, कंपकंपी वाला बुखार"},
                "or": {"cc": "ତଳ ପେଟର ଉଭୟ ପାଖରେ ତୀବ୍ର ଯନ୍ତ୍ରଣା, ପ୍ରବଳ ଜ୍ୱର ଓ ଦୁର୍ଗନ୍ଧ ଯୋନିସ୍ରାବ", "sym": "ଦୁଇ ପାଖରେ ଭାରୀ କଷ୍ଟ, ଚାଲିଲେ ବଢ଼ୁଛି, ଥରି ଥରି ଜ୍ୱର ଆସିବା"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_salpingitis_suspect; pelvic_fullness; dyspareunia; malaise",
                "en": {"cc": "Intense cramping across womb area with heavy yellow discharge and chills", "sym": "Jarring pain when sitting down, high temperature, nausea and profound weakness for 3 days"},
                "hi": {"cc": "गर्भाशय के पास भयानक मरोड़, पीला स्राव और ठंड लगना", "sym": "बैठने पर झटके जैसा दर्द, तेज बुखार, उल्टी का मन और तीन दिन से भारी कमजोरी"},
                "or": {"cc": "ଜରାୟୁ ପାଖରେ ଭୀଷଣ କଷ୍ଟ, ହଳଦିଆ ସ୍ରାବ ଓ ଥଣ୍ଡା ଲାଗିବା", "sym": "ବସିବା ମାତ୍ରେ ଝଟକା କଷ୍ଟ, ପ୍ରବଳ ଜ୍ୱର, ବାନ୍ତି ଭାବ ଓ ଦୁର୍ବଳତା"}
            },
            {
                "sub_id": "T03",
                "concepts": "pelvic_peritonitis_localized; lower_quadrant_guarding; pyrexia",
                "en": {"cc": "Lower stomach ache on both sides with hot burning urine and fever", "sym": "Pain spreading across pelvic bone, unable to straighten up fully, temperature 38.6C"},
                "hi": {"cc": "निचले पेट के दोनों तरफ दर्द, पेशाब में तेज जलन और बुखार", "sym": "पेल्विस की हड्डी के ऊपर दर्द, सीधा खड़ा नहीं हुआ जा रहा, 38.6 डिग्री तापमान"},
                "or": {"cc": "ତଳ ପେଟର ଦୁଇ ପାଖରେ ବିନ୍ଧା, ପରିସ୍ରାରେ ପୋଡ଼ାଜଳା ଓ ଜ୍ୱର", "sym": "ପେଲଭିକ୍ ହାଡ଼ ଉପରେ କଷ୍ଟ, ସଳଖ ହୋଇ ଛିଡ଼ା ହୋଇପାରୁ ନାହାନ୍ତି, ୩୮.୬ ଡିଗ୍ରୀ ଉତ୍ତାପ"}
            },
            {
                "sub_id": "T04",
                "concepts": "gynecological_infection; hypogastric_tenderness; postcoital_pain",
                "en": {"cc": "Severe pelvic throbbing and unusual bleeding with fever", "sym": "Persistent deep dull pelvic pain, spotting between periods, shivering spells at night"},
                "hi": {"cc": "पेल्विस में तेज टीस, असामान्य रक्तस्राव और बुखार", "sym": "अंदरूनी गहरा दर्द, माहवारी के बीच में दाग लगना, रात को कंपकंपी"},
                "or": {"cc": "ପେଲଭିସରେ ତୀବ୍ର ଯନ୍ତ୍ରଣା, ଅସ୍ୱାଭାବିକ ରକ୍ତସ୍ରାବ ଓ ଜ୍ୱର", "sym": "ଅନ୍ତର୍ନିହିତ ଗଭୀର ବିନ୍ଧା, ମାସିକ ଋତୁ ମଝିରେ ରକ୍ତ ଦାଗ, ରାତିରେ କମ୍ପ ଜ୍ୱର"}
            },
            {
                "sub_id": "T05",
                "concepts": "acute_adnexal_inflammation; lower_abdominal_tenderness; chills",
                "en": {"cc": "Both side lower tummy tenderness with warm forehead and feeling faint", "sym": "Pain constant for 48 hours, worse with bladder fullness, fever spikes"},
                "hi": {"cc": "पेट के निचले दोनों किनारों पर तेज दर्द, माथा तपना और कमजोरी", "sym": "48 घंटे से दर्द जारी, पेशाब रोकने पर और दर्द, बुखार का चढ़ना-उतरना"},
                "or": {"cc": "ତଳ ପେଟର ଦୁଇ ପାଖ ଛୁଇଁଲେ କଷ୍ଟ, ମୁଣ୍ଡ ତାତିବା ଓ ଦୁର୍ବଳ ଲାଗିବା", "sym": "୪୮ ଘଣ୍ଟା ଧରି କଷ୍ଟ, ପରିସ୍ରା ରଖିଲେ ଆହୁରି ବିନ୍ଧା, ଜ୍ୱର ବାରମ୍ବାର ଆସୁଛି"}
            }
        ]
    },

    # 12. Acute Moderate Dehydration from Gastroenteritis
    {
        "family_id": "FAM_YEL_12",
        "concept_id": "CONCEPT_MODERATE_DEHYDRATION",
        "urgency": "YELLOW",
        "min_age": 16, "max_age": 75,
        "pain_min": 4, "pain_max": 7,
        "duration_hours": [24.0, 36.0, 48.0],
        "vitals_func": lambda: {
            "hr": r_int(104, 122), "sbp": r_int(98, 115), "dbp": r_int(62, 75),
            "spo2": r_int(97, 100), "temp": r_float(37.5, 38.5), "rr": r_int(18, 22)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "profuse_watery_diarrhea; frequent_vomiting; sunken_eyes; tachycardia_orthostatic; dry_tongue",
                "en": {"cc": "Over 12 watery stools and repeated vomiting in 24 hours with dizzy spells on standing", "sym": "Dry parched tongue, sunken dark circles under eyes, passing very dark scant urine, fast heart rate on standing"},
                "hi": {"cc": "24 घंटे में 12 से ज्यादा पतले दस्त और उल्टियां, खड़े होने पर चक्कर", "sym": "जीभ बिल्कुल सूखी, आंखें अंदर धंसी हुई, पेशाब बहुत कम और गहरा पीला, खड़े होने पर दिल तेज धड़कना"},
                "or": {"cc": "୨୪ ଘଣ୍ଟାରେ ୧୨ରୁ ଅଧିକ ପାଣିଆ ଝାଡ଼ା ଓ ବାନ୍ତି, ଛିଡ଼ା ହେଲେ ମୁଣ୍ଡ ବୁଲାଇବା", "sym": "ଜିଭ ଶୁଖି କାଠ, ଆଖି ଭିତରକୁ ପଶିଯାଇଛି, ଅତି କମ ଗାଢ଼ ପରିସ୍ରା, ଛିଡ଼ା ହେଲେ ଛାତି ଧଡ଼ଧଡ଼"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_gastroenteritis_dehydration; reduced_skin_turgor; postural_dizziness",
                "en": {"cc": "Exhausting stomach cramps with liquid bowel motions and inability to keep oral fluids down", "sym": "Pinching skin stays tented briefly, lightheaded when walking across room, thirsty but vomits water"},
                "hi": {"cc": "पेट में तेज मरोड़ के साथ पानी जैसे दस्त और पानी भी न पचना", "sym": "चमड़ी खींचने पर वापस देर से जाना, कमरे में चलने पर चक्कर, प्यास बहुत है पर उल्टी हो जाती है"},
                "or": {"cc": "ପେଟ ମୋଡ଼ି ପାଣି ଭଳି ଝାଡ଼ା ଓ ପାଣି ଟୋପାଏ ବି ହଜମ ନହେବା", "sym": "ଚମଡ଼ା ଧରି ଟାଣିଲେ ସଙ୍ଗେ ସଙ୍ଗେ ଫେରୁନାହିଁ, ଚାଲିଲେ ମୁଣ୍ଡ ବୁଲାଉଛି, ପ୍ରବଳ ଶୋଷ କିନ୍ତୁ ବାନ୍ତି ହେଉଛି"}
            },
            {
                "sub_id": "T03",
                "concepts": "infective_diarrhea_volume_depletion; oliguria; crampy_abdomen",
                "en": {"cc": "Continuous watery purging with zero urine output since morning", "sym": "Abdominal cramping spasms before every loose stool, dry mouth, rapid pulse felt in neck"},
                "hi": {"cc": "लगातार पानी जैसे दस्त और सुबह से बिल्कुल पेशाब न आना", "sym": "हर दस्त से पहले पेट में तेज ऐंठन, मुंह सूखा, गले में तेज नब्ज महसूस होना"},
                "or": {"cc": "ଅନବରତ ପାଣିଆ ଝାଡ଼ା ଓ ସକାଳୁ ଆଦୌ ପରିସ୍ରା ନହେବା", "sym": "ପ୍ରତି ଝାଡ଼ା ପୂର୍ବରୁ ପେଟ କାମୁଡ଼ିବା, ପାଟି ଶୁଖିଲା, ବେକରେ ଦ୍ରୁତ ନାଡ଼ି ଚାଲିବା"}
            },
            {
                "sub_id": "T04",
                "concepts": "severe_fluid_loss; muscular_cramps_secondary_hypokalemia; lethargy_mild",
                "en": {"cc": "Calf muscle spasms and weakness after a day of food poisoning diarrhoea", "sym": "Severe painful cramping in calves, dry lips, dizzy when sitting upright, 10 stools today"},
                "hi": {"cc": "फूड पॉइजनिंग और दस्त के बाद पिंडलियों में तेज ऐंठन और कमजोरी", "sym": "पिंडलियों की नसों में भयानक खिंचाव, सूखे होंठ, उठकर बैठने पर सिर घूमना, 10 बार दस्त"},
                "or": {"cc": "ଖାଦ୍ୟ ବିଷକ୍ରିୟା ଓ ଝାଡ଼ା ପରେ ପେଣ୍ଡା ମାଂସପେଶୀ ଟାଣି ଧରିବା ଓ ଦୁର୍ବଳତା", "sym": "ଗୋଡ଼ ପେଣ୍ଡାରେ ଅସହ୍ୟ କଷ୍ଟ, ଶୁଖିଲା ଓଠ, ବସିଲେ ମୁଣ୍ଡ ବୁଲାଇବା, ୧୦ ଥର ଝାଡ଼ା"}
            },
            {
                "sub_id": "T05",
                "concepts": "rotavirus_or_bacterial_colitis; dehydration_signs; sunken_eyes",
                "en": {"cc": "Severe fluid loss from persistent loose motions with rapid heartbeat", "sym": "Skin dry and warm, eyes hollow, drinks greedily from cup, alert but weak"},
                "hi": {"cc": "लगातार दस्त से शरीर का पानी सूखना और दिल की धड़कन तेज", "sym": "चमड़ी सूखी, आंखें धंसी हुई, पानी तेजी से पीना, पूरी तरह होश में पर कमजोरी"},
                "or": {"cc": "ଅବିରତ ଝାଡ଼ା ଯୋଗୁଁ ଶରୀର ଜଳଶୂନ୍ୟ ଓ ହୃଦସ୍ପନ୍ଦନ ଦ୍ରୁତ", "sym": "ଚମଡ଼ା ଶୁଖିଲା, ଆଖି ଗାତରେ ପଶିଛି, ବ୍ୟାକୁଳ ହୋଇ ପାଣି ପିଉଛନ୍ତି, ସଚେତନ କିନ୍ତୁ ଅବଶ"}
            }
        ]
    }
]
