"""
Triage V3 Clinical Presentation Families & Template Definitions
================================================================
Contains 20 YELLOW families and 20 GREEN families (5 templates each),
plus RED and GREY safety-test cohorts.
"""

def r_int(low, high):
    import random
    return random.randint(low, high)

def r_float(low, high, dec=1):
    import random
    return round(random.uniform(low, high), dec)

# =============================================================================
# 20 YELLOW PRESENTATION FAMILIES (Urgent / Clinical Evaluation Required)
# =============================================================================

YELLOW_FAMILIES = [
    # 1. Acute Appendicitis
    {
        "family_id": "FAM_YEL_01",
        "concept_id": "CONCEPT_ACUTE_APPENDICITIS",
        "urgency": "YELLOW",
        "min_age": 12, "max_age": 55,
        "pain_min": 6, "pain_max": 8,
        "duration_hours": [12.0, 18.0, 24.0, 36.0, 48.0],
        "vitals_func": lambda: {
            "hr": r_int(88, 108), "sbp": r_int(115, 138), "dbp": r_int(72, 88),
            "spo2": r_int(97, 100), "temp": r_float(37.8, 38.8), "rr": r_int(18, 22)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "right_lower_quadrant_pain; periumbilical_migration; low_grade_fever; nausea",
                "en": {"cc": "Persistent right lower abdominal pain with low grade fever and nausea", "sym": "Pain began around naval now localized to right lower abdomen, aggravated by coughing, loss of appetite"},
                "hi": {"cc": "पेट के निचले दाहिने हिस्से में लगातार दर्द और हल्का बुखार", "sym": "दर्द पहले नाभि के पास था अब दाईं तरफ बढ़ गया है, खांसने पर दर्द तेज होना और उल्टी जैसा लगना"},
                "or": {"cc": "ପେଟର ଡାହାଣ ତଳ ଭାଗରେ ଲଗାତାର ଯନ୍ତ୍ରଣା ଓ ସାମାନ୍ୟ ଜ୍ୱର", "sym": "ନାଭି ପାଖରୁ ଆରମ୍ଭ ହୋଇ ଏବେ ଡାହାଣ ପଟେ କଷ୍ଟ ବଢ଼ିଛି, ଖାସିଲେ କଷ୍ଟ ହେବା ଓ ବାନ୍ତି ଭାବ"}
            },
            {
                "sub_id": "T02",
                "concepts": "sharp_iliac_fossa_pain; anorexia; walking_discomfort; focal_tenderness",
                "en": {"cc": "Sharp pain in right iliac fossa when walking with complete loss of appetite", "sym": "Cannot straighten right leg without sharp pain, unable to eat since morning, mild chills"},
                "hi": {"cc": "चलने पर दाहिनी कोख में तेज चुभन और बिल्कुल भूख न लगना", "sym": "दाहिना पैर सीधा करने में तेज दर्द, सुबह से कुछ नहीं खाया, हल्का कंपन"},
                "or": {"cc": "ଚାଲିଲା ବେଳେ ଡାହାଣ କୋଳିଥାରେ ତୀବ୍ର ବିନ୍ଧା ଓ ଅରୁଚି", "sym": "ଡାହାଣ ଗୋଡ଼ ସଳଖ କଲେ କଷ୍ଟ ହେଉଛି, ସକାଳୁ ଖାଇନାହାନ୍ତି, ହାଲୁକା ଥଣ୍ଡା ଲାଗିବା"}
            },
            {
                "sub_id": "T03",
                "concepts": "rebound_tenderness_suspect; progressive_rlq_ache; bilious_nausea",
                "en": {"cc": "Worsening abdominal cramp now settled in lower right groin area", "sym": "Started as general stomach upset yesterday, now very tender when pressing right side, nausea present"},
                "hi": {"cc": "पेट का दर्द अब निचले दाहिने हिस्से में बैठ गया है", "sym": "कल हल्का पेट खराब था, अब दाहिनी तरफ छूने पर भी तेज दर्द और मतली हो रही है"},
                "or": {"cc": "ପେଟ କଷ୍ଟ ଏବେ ତଳ ଡାହାଣ ପାଖରେ ଜମାଟ ବାନ୍ଧିଛି", "sym": "କାଲି ସାଧାରଣ ପେଟ ଖରାପ ଥିଲା, ଏବେ ଡାହାଣ ପାଖ ଚିପିଲେ ଯନ୍ତ୍ରଣା ଓ ବାନ୍ତି ଭାବ"}
            },
            {
                "sub_id": "T04",
                "concepts": "feverish_lower_belly_pain; jarring_pain_on_movement; localized_peritoneal_irritation",
                "en": {"cc": "Lower belly ache that hurts intensely when bumping or riding vehicle", "sym": "Any movement causes sharp twinges in right hip-abdominal line, feverish sensation, no diarrhea"},
                "hi": {"cc": "पेट के निचले हिस्से में दर्द जो वाहन पर बैठने या हिलने से बढ़ता है", "sym": "गाड़ी के झटकों से पेट के दाईं ओर भयानक टीस, शरीर गर्म लगना, दस्त नहीं हैं"},
                "or": {"cc": "ଗାଡ଼ିରେ ବସିଲେ ବା ହଲଚଲ ହେଲେ ତଳ ପେଟରେ ଅସହ୍ୟ ବିନ୍ଧା", "sym": "ଯାତାୟାତ ସମୟରେ ଡାହାଣ କଡ଼ରେ ଛୁଞ୍ଚି ଫୋଡ଼ି ହେଲା ଭଳି ଲାଗୁଛି, ଦେହ ଗରମ"}
            },
            {
                "sub_id": "T05",
                "concepts": "migratory_abdominal_pain; low_fever; localized_guarding",
                "en": {"cc": "Right sided deep stomach pain with warm forehead and feeling sick", "sym": "Constant dull ache turning acute right side, refuses solid food, slight shivering without sweat"},
                "hi": {"cc": "पेट के दाहिने हिस्से में गहरा दर्द, माथा गर्म और घबराहट", "sym": "लगातार बना रहने वाला दर्द, खाना खाने का बिल्कुल मन नहीं, हल्की कंपकंपी"},
                "or": {"cc": "ପେଟର ଡାହାଣ ଭାଗରେ ଗଭୀର ଯନ୍ତ୍ରଣା, ମୁଣ୍ଡ ତାତିବା ଓ ଦୁର୍ବଳତା", "sym": "ଅନବରତ ଧିମା ବିନ୍ଧା ଡାହାଣ ପଟେ ବଢ଼ୁଛି, ଖାଇବାକୁ ଅନିଚ୍ଛା, ସାମାନ୍ୟ ଥରିବା"}
            }
        ]
    },

    # 2. Acute Renal Colic
    {
        "family_id": "FAM_YEL_02",
        "concept_id": "CONCEPT_ACUTE_RENAL_COLIC",
        "urgency": "YELLOW",
        "min_age": 20, "max_age": 68,
        "pain_min": 7, "pain_max": 9,
        "duration_hours": [2.0, 4.0, 6.0, 12.0],
        "vitals_func": lambda: {
            "hr": r_int(90, 114), "sbp": r_int(130, 155), "dbp": r_int(82, 96),
            "spo2": r_int(98, 100), "temp": r_float(36.6, 37.4), "rr": r_int(18, 24)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "spasmodic_flank_pain; radiation_to_groin; microscopic_hematuria_suspect; restlessness",
                "en": {"cc": "Severe spasmodic right flank pain radiating to groin with red urine", "sym": "Excruciating wave-like flank spasms, unable to find a comfortable lying position, reddish tinge in urine"},
                "hi": {"cc": "कमर के दाहिने हिस्से से जांघ तक असहनीय लहरदार दर्द और लाल पेशाब", "sym": "अत्यधिक तेज मरोड़ वाला दर्द, मरीज बेचैन होकर करवटें बदल रहा है, पेशाब में लाली"},
                "or": {"cc": "କମର ଡାହାଣ ପଟୁ ଜଙ୍ଘ ଯାଏଁ ତୀବ୍ର ଲହରୀ କଷ୍ଟ ଓ ନାଲି ପରିସ୍ରା", "sym": "ଅସହ୍ୟ ଘୋଳାବିନ୍ଧା, ରୋଗୀ ଶୋଇ ରହିପାରୁ ନାହାନ୍ତି, ପରିସ୍ରାରେ ରକ୍ତ ଭଳି ରଙ୍ଗ"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_ureteric_colic; nausea_vomiting_secondary_to_pain; urinary_urgency",
                "en": {"cc": "Sudden agonizing side back ache with repeated retching", "sym": "Intense colicky pain coming every few minutes, retched twice from the pain severity, frequent urging to pee"},
                "hi": {"cc": "पीठ के एक तरफ अचानक भयानक दर्द और दर्द के कारण उल्टियां", "sym": "हर दो मिनट में असहनीय मरोड़, तेज दर्द से दो बार उल्टी हुई, बार-बार पेशाब की हाजत"},
                "or": {"cc": "ପିଠିର ଗୋଟିଏ ପଟେ ହଠାତ୍ ଅସହ୍ୟ କଷ୍ଟ ଓ ବାନ୍ତି", "sym": "ପ୍ରତି କିଛି ମିନିଟରେ ପ୍ରବଳ ମୋଡ଼ି ହେବା, କଷ୍ଟ ଯୋଗୁଁ ଦୁଇଥର ବାନ୍ତି ହୋଇଛି, ବାରମ୍ବାର ପରିସ୍ରା ଲାଗିବା"}
            },
            {
                "sub_id": "T03",
                "concepts": "costovertebral_angle_tenderness; stone_passage_suspect; diaphoresis_from_pain",
                "en": {"cc": "Sharp stabbing loin pain shooting downwards into private parts", "sym": "Severe loin agony causing cold sweating, pain does not ease with rest or massage, past stone history"},
                "hi": {"cc": "कमर की हड्डी के पास चुभने वाला दर्द जो नीचे की ओर जा रहा है", "sym": "दर्द से ठंडा पसीना छूटना, किसी भी स्थिति में आराम न मिलना, पहले भी पथरी की शिकायत"},
                "or": {"cc": "କମର ହାଡ଼ ପାଖରେ ଛୁଞ୍ଚି ଫୋଡ଼ି ହେବା ଭଳି କଷ୍ଟ ତଳକୁ ଯାଉଛି", "sym": "ଅସହ୍ୟ ବିନ୍ଧାରେ ଝାଳ ବୋହିବା, ବିଶ୍ରାମ କଲେ ବି ଉପଶମ ନାହିଁ, ପୂର୍ବରୁ ପଥର ଥିଲା"}
            },
            {
                "sub_id": "T04",
                "concepts": "paroxysmal_lobar_flank_pain; dysuria; urinary_hesitancy",
                "en": {"cc": "Severe left flank cramp with painful drops of urine", "sym": "Left kidney angle feels clamped in vise, excruciating burn when passing drops of urine, pacing the room"},
                "hi": {"cc": "बाईं कोख में भयानक जकड़न और बूंद-बूंद दर्द भरा पेशाब", "sym": "बाईं तरफ भयानक दर्द, पेशाब में तेज जलन और रुकावट, बेचैनी में टहलना"},
                "or": {"cc": "ବାମ କମରରେ ଭୀଷଣ ଯନ୍ତ୍ରଣା ଓ ଟୋପା ଟୋପା ପୋଡ଼ାଜଳା ପରିସ୍ରା", "sym": "ବାମ କିଡନୀ ପାଖ ଜାବୁଡ଼ି ଧରିଲା ଭଳି କଷ୍ଟ, ପରିସ୍ରା ବେଳେ ପ୍ରବଳ ପୋଡ଼ିବା, ଅସ୍ଥିରତା"}
            },
            {
                "sub_id": "T05",
                "concepts": "unilateral_renal_colic; severe_pain_score; episodic_spasm",
                "en": {"cc": "Intense cramping back pain on right side spreading forward", "sym": "Peaks every 15 minutes, severe nausea without diarrhea, history of kidney stones"},
                "hi": {"cc": "कमर के दाईं तरफ अत्यधिक मरोड़ जो आगे पेट की ओर आ रही है", "sym": "हर 15 मिनट में दर्द का दौरा, तेज मतली, पथरी का पुराना इतिहास"},
                "or": {"cc": "ଡାହାଣ କମରରୁ ପେଟ ଆଡ଼କୁ ମାଡ଼ି ଆସୁଥିବା ତୀବ୍ର ଘୋଳାବିନ୍ଧା", "sym": "ପ୍ରତି ୧୫ ମିନିଟରେ ପ୍ରଚଣ୍ଡ ଯନ୍ତ୍ରଣା, ବାନ୍ତି ଭାବ, ପୂର୍ବରୁ ପଥୁରୀ ଥିଲା"}
            }
        ]
    },

    # 3. Acute Cholecystitis / Biliary Colic
    {
        "family_id": "FAM_YEL_03",
        "concept_id": "CONCEPT_ACUTE_CHOLECYSTITIS",
        "urgency": "YELLOW",
        "min_age": 30, "max_age": 75,
        "pain_min": 6, "pain_max": 8,
        "duration_hours": [6.0, 12.0, 24.0, 36.0],
        "vitals_func": lambda: {
            "hr": r_int(86, 106), "sbp": r_int(125, 148), "dbp": r_int(78, 92),
            "spo2": r_int(96, 99), "temp": r_float(37.9, 38.9), "rr": r_int(18, 22)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "ruq_postprandial_pain; radiation_to_scapula; murphys_sign_suspect; low_fever",
                "en": {"cc": "Severe right upper belly pain under ribs after oily dinner with fever", "sym": "Constant heavy pressure under right ribcage radiating to right shoulder blade, fever and repeated vomiting"},
                "hi": {"cc": "चिकनाई वाला खाना खाने के बाद दाहिनी पसलियों के नीचे तेज दर्द और बुखार", "sym": "दाहिने कंधे की हड्डी तक खिंचने वाला भारी दर्द, छूने पर बहुत दर्द, उल्टी और बुखार"},
                "or": {"cc": "ତେଲଯୁକ୍ତ ଖାଦ୍ୟ ଖାଇବା ପରେ ଡାହାଣ ପଞ୍ଜରା ତଳେ ତୀବ୍ର ବିନ୍ଧା ଓ ଜ୍ୱର", "sym": "ଡାହାଣ ପିଠି କାନ୍ଧ ଆଡ଼କୁ ଯନ୍ତ୍ରଣା ବ୍ୟାପିବା, ଛୁଇଁଲେ କଷ୍ଟ, ବାରମ୍ବାର ବାନ୍ତି ଓ ଜ୍ୱର"}
            },
            {
                "sub_id": "T02",
                "concepts": "gallbladder_inflammation; persistent_biliary_pain; epigastric_fullness",
                "en": {"cc": "Severe cramp below right breastbone lasting 8 hours without relief", "sym": "Pain steady and unyielding, deep breath catches from ribcage tenderness, yellow bitter vomitus"},
                "hi": {"cc": "दाहिनी छाती के नीचे आठ घंटे से लगातार तेज मरोड़", "sym": "गहरी सांस लेने पर पसलियों में दर्द का झटका, कड़वी पीली उल्टी, दर्द में कोई कमी नहीं"},
                "or": {"cc": "ଡାହାଣ ଛାତି ତଳେ ୮ ଘଣ୍ଟା ଧରି ଅବିରତ ତୀବ୍ର ଯନ୍ତ୍ରଣା", "sym": "ନିଶ୍ୱାସ ନେଲେ ପଞ୍ଜରାରେ କଷ୍ଟ ବଢ଼ିବା, ପିତା ହଳଦିଆ ବାନ୍ତି, ଉପଶମ ମିଳୁନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "acute_cholecystitis; feverish_upper_abdominal_guarding; dyspepsia_progression",
                "en": {"cc": "Sharp pain in right liver area with hot skin and nausea", "sym": "Tenderness when pressing under right costal margin, shivering spells, unable to drink fluids"},
                "hi": {"cc": "लिवर वाले हिस्से में तेज चुभन, शरीर तपना और मतली", "sym": "पसलियों के किनारे दबाने पर तेज दर्द, कंपकंपी के साथ बुखार, पानी पीने में भी परेशानी"},
                "or": {"cc": "ଯକୃତ ସ୍ଥାନରେ ତୀକ୍ଷ୍ଣ ଯନ୍ତ୍ରଣା, ଦେହ ତାତିବା ଓ ଅସହଜତା", "sym": "ଡାହାଣ ପଞ୍ଜରା କୋଣ ଚିପିଲେ ଯନ୍ତ୍ରଣା, ଥରି ଜ୍ୱର ଆସିବା, ପାଣି ପିଇପାରୁ ନାହାନ୍ତି"}
            },
            {
                "sub_id": "T04",
                "concepts": "biliary_colic_prolonged; subcostal_tenderness; anorexia",
                "en": {"cc": "Heavy aching pain under right ribs keeping patient awake all night", "sym": "Pain started at midnight after heavy meal, constant ache, bloating and bitter taste in mouth"},
                "hi": {"cc": "दाहिनी पसलियों के नीचे भारी दर्द जिससे रात भर सो नहीं पाए", "sym": "रात के भारी भोजन के बाद दर्द शुरू हुआ, पेट फूलना और मुंह में कड़वा स्वाद"},
                "or": {"cc": "ଡାହାଣ ପଞ୍ଜରା ତଳେ ଭାରୀ କଷ୍ଟ ଯୋଗୁଁ ରାତିସାରା ନିଦ ନହେବା", "sym": "ରାତିରେ ଗରିଷ୍ଠ ଭୋଜନ ପରେ ବିନ୍ଧା ଆରମ୍ଭ, ପେଟ ଫାଙ୍କିବା ଓ ପାଟି ପିତା ଲାଗିବା"}
            },
            {
                "sub_id": "T05",
                "concepts": "gallstone_attack; right_hypochondriac_pain; vomiting",
                "en": {"cc": "Right upper stomach pain with yellow bile vomiting and mild fever", "sym": "Known gallstones, pain unmanageable with home pills, tenderness on right side"},
                "hi": {"cc": "पेट के ऊपरी दाहिने हिस्से में दर्द, पित्त की उल्टी और हल्का बुखार", "sym": "पित्त की पथरी का इतिहास, घरेलू दवा से आराम नहीं, दाहिनी तरफ छूने पर दर्द"},
                "or": {"cc": "ଉପର ଡାହାଣ ପେଟ ବିନ୍ଧା, ପିତ୍ତ ବାନ୍ତି ଓ ସାମାନ୍ୟ ଜ୍ୱର", "sym": "ପିତ୍ତକୋଷରେ ପଥର ଥିଲା, ଔଷଧରେ କମୁନାହିଁ, ଡାହାଣ ପାଖ ଛୁଇଁଲେ କଷ୍ଟ"}
            }
        ]
    },

    # 4. Community-Acquired Bronchopneumonia (Moderate)
    {
        "family_id": "FAM_YEL_04",
        "concept_id": "CONCEPT_MODERATE_PNEUMONIA",
        "urgency": "YELLOW",
        "min_age": 18, "max_age": 82,
        "pain_min": 4, "pain_max": 7,
        "duration_hours": [48.0, 72.0, 96.0, 120.0],
        "vitals_func": lambda: {
            "hr": r_int(95, 114), "sbp": r_int(120, 145), "dbp": r_int(76, 90),
            "spo2": r_int(91, 94), "temp": r_float(38.3, 39.3), "rr": r_int(22, 26)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "productive_cough_purulent; pleuritic_chest_pain; borderline_hypoxia; chills",
                "en": {"cc": "Productive purulent cough with breathlessness and shaking chills", "sym": "Thick greenish-yellow sputum, sharp pleuritic side chest ache on deep breath, breathless on walking"},
                "hi": {"cc": "पीले कफ वाली खांसी, सांस फूलना और तेज कंपकंपी वाला बुखार", "sym": "गहरे सांस लेने पर छाती में चुभने वाला दर्द, पीला-हरा गाढ़ा बलगम, थोड़ा चलने पर भी सांस भरना"},
                "or": {"cc": "ହଳଦିଆ କଫ ପଡ଼ିବା, ଶ୍ୱାସ ଫୁଲିବା ଓ ଥରି ଥରି ଜ୍ୱର ଆସିବା", "sym": "ନିଶ୍ୱାସ ନେଲେ ଛାତି କଡ଼ରେ ଛୁଞ୍ଚି ଫୋଡ଼ି ହେବା ଭଳି କଷ୍ଟ, ବହଳିଆ କଫ, ଚାଲିଲେ ଥକିବା"}
            },
            {
                "sub_id": "T02",
                "concepts": "fever_with_rigors; localized_consolidation_suspect; tachypnea_moderate",
                "en": {"cc": "Fever for 4 days with rusty phlegm and catching pain in right chest", "sym": "Persistent high fever, rusty brown sputum coughed up, localized right chest wall pain during coughing"},
                "hi": {"cc": "चार दिन से तेज बुखार, भूरे रंग का बलगम और छाती में जकड़न", "sym": "खांसते समय छाती के दाहिने हिस्से में खिंचाव, कफ में जंग जैसा रंग, सांस लेने में तेजी"},
                "or": {"cc": "୪ ଦିନ ଧରି ପ୍ରବଳ ଜ୍ୱର, ମାଟିଆ ରଙ୍ଗର କଫ ଓ ଛାତିରେ କଷ୍ଟ", "sym": "ଖାସିଲା ବେଳେ ଛାତିର ଡାହାଣ କଡ଼ରେ ଯନ୍ତ୍ରଣା, କଫ ଗାଢ଼, ଶ୍ୱାସକ୍ରିୟା ଦ୍ରୁତ"}
            },
            {
                "sub_id": "T03",
                "concepts": "lower_respiratory_tract_infection; exertional_dyspnea; bronchial_breathing",
                "en": {"cc": "Heavy chest congestion with wheezy rattle and sweating fevers", "sym": "Rattling in lower chest when breathing, night sweats, exhausting dry-to-loose cough, fatigue"},
                "hi": {"cc": "छाती में भारी जकड़न, घड़घड़ाहट और पसीने के साथ बुखार", "sym": "सांस लेते समय छाती से आवाज, रात को पसीना छूटना, लगातार खांसी और भारी कमजोरी"},
                "or": {"cc": "ଛାତିରେ କଫ ଜମି ଘରଘର ହେବା, ଝାଳ ବୋହି ଜ୍ୱର ହେବା", "sym": "ନିଶ୍ୱାସ ନେଲେ ଛାତିରୁ ଶବ୍ଦ, ରାତିରେ ଝାଳ, ଅବିରତ କାଶ ଓ ପ୍ରବଳ ଦୁର୍ବଳତା"}
            },
            {
                "sub_id": "T04",
                "concepts": "bacterial_pneumonia_suspect; side_stitch_pain; low_saturation",
                "en": {"cc": "Right sided stabbing breath pain with dark sputum and fever", "sym": "Pain stops deep inhalation, oxygen checked 92 percent on finger meter, high body temperature"},
                "hi": {"cc": "गहरी सांस पर छाती में चुभन, गहरा बलगम और तेज बुखार", "sym": "दर्द के कारण पूरी सांस नहीं ली जा रही, उंगली पर ऑक्सीजन 92 प्रतिशत आई, बदन तप रहा"},
                "or": {"cc": "ନିଶ୍ୱାସ ନେଲେ ଛାତିରେ ଛୁଞ୍ଚି ଭଳି ବିନ୍ଧା, କଳା କଫ ଓ ଜ୍ୱର", "sym": "ଯନ୍ତ୍ରଣା ଯୋଗୁଁ ସମ୍ପୂର୍ଣ୍ଣ ଶ୍ୱାସ ନେଇପାରୁ ନାହାନ୍ତି, ଅକ୍ସିଜେନ ୯୨ ପ୍ରତିଶତ, ଉତ୍ତାପ ବେଶି"}
            },
            {
                "sub_id": "T05",
                "concepts": "subacute_pneumonic_consolidation; persistent_pyrexia; malaise",
                "en": {"cc": "Severe chest heaviness with yellow sputum and unable to climb stairs", "sym": "Fever unbroken by paracetamol, heavy productive cough, exhaustion on minor effort"},
                "hi": {"cc": "छाती में भारीपन, पीला बलगम और सीढ़ियां चढ़ने में असमर्थता", "sym": "दवा से बुखार पूरी तरह न उतरना, गाढ़ा कफ, थोड़ा सा चलने पर सांस फूलना"},
                "or": {"cc": "ଛାତି ଭାରୀ ଲାଗିବା, ହଳଦିଆ କଫ ଓ ପାହାଚ ଚଢ଼ିବାରେ ଅସମର୍ଥତା", "sym": "ଔଷଧରେ ଜ୍ୱର ସମ୍ପୂର୍ଣ୍ଣ ଛାଡୁନାହିଁ, ବହଳିଆ କାଶ, ସାମାନ୍ୟ ପରିଶ୍ରମରେ ହଇରାଣ"}
            }
        ]
    },

    # 5. Acute Pyelonephritis
    {
        "family_id": "FAM_YEL_05",
        "concept_id": "CONCEPT_ACUTE_PYELONEPHRITIS",
        "urgency": "YELLOW",
        "min_age": 18, "max_age": 70,
        "pain_min": 6, "pain_max": 8,
        "duration_hours": [24.0, 36.0, 48.0, 72.0],
        "vitals_func": lambda: {
            "hr": r_int(96, 118), "sbp": r_int(118, 140), "dbp": r_int(74, 88),
            "spo2": r_int(97, 100), "temp": r_float(38.6, 39.6), "rr": r_int(18, 24)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "costovertebral_tenderness; high_spiking_fever; dysuria; rigors",
                "en": {"cc": "High burning fever with severe right flank pain and burning urine", "sym": "Teeth-chattering chills, tender right kidney angle, cloudy foul-smelling urine passed every 20 minutes"},
                "hi": {"cc": "तेज कंपकंपी वाला बुखार, कमर में तेज दर्द और पेशाब में जलन", "sym": "दांत किटकिटाने वाली ठंड, कमर के दाईं ओर छूने पर दर्द, गाढ़ा बदबूदार पेशाब बार-बार आना"},
                "or": {"cc": "ପ୍ରବଳ କମ୍ପ ଜ୍ୱର, ଡାହାଣ କମରରେ ଯନ୍ତ୍ରଣା ଓ ପରିସ୍ରାରେ ପୋଡ଼ାଜଳା", "sym": "ଦାନ୍ତ କାମୁଡ଼ିବା ଭଳି ଥଣ୍ଡା, କମର ପଛପଟ ଛୁଇଁଲେ କଷ୍ଟ, ଗୋଳିଆ ଦୁର୍ଗନ୍ଧ ପରିସ୍ରା ବାରମ୍ବାର ହେବା"}
            },
            {
                "sub_id": "T02",
                "concepts": "upper_urinary_tract_infection; loin_tenderness; persistent_vomiting",
                "en": {"cc": "Back ache in kidney area with persistent vomiting and 102F fever", "sym": "Cannot keep fluids down, agonizing tenderness over left costovertebral angle, dark cloudy urine"},
                "hi": {"cc": "गुर्दे वाले हिस्से में तेज दर्द, लगातार उल्टी और 102 डिग्री बुखार", "sym": "पानी भी नहीं पच रहा, पीठ के बाईं तरफ तेज चुभन, पेशाब का रंग मटमैला"},
                "or": {"cc": "କିଡନୀ ପାଖରେ ପ୍ରବଳ ବିନ୍ଧା, ଲଗାତାର ବାନ୍ତି ଓ ୧୦୨ ଡିଗ୍ରୀ ଜ୍ୱର", "sym": "ପାଣି ପିଇଲେ ବି ବାନ୍ତି ହେଉଛି, ବାମ କମର କଡ଼ରେ କଷ୍ଟ, ପରିସ୍ରା ଗୋଳିଆ ଦିଶୁଛି"}
            },
            {
                "sub_id": "T03",
                "concepts": "pyelonephritis_systemic_upset; urinary_frequency; shivers",
                "en": {"cc": "Shaking shivers, flank ache and extreme exhaustion after untreated UTI", "sym": "Bladder burn spread to back 2 days ago, high body temp, great weakness and nausea"},
                "hi": {"cc": "तेज कंपकंपी, कमर में दर्द और पेशाब के संक्रमण के बाद अत्यधिक कमजोरी", "sym": "पेशाब की जलन अब पीठ में फैल गई है, तेज बुखार, चलने की हिम्मत नहीं"},
                "or": {"cc": "ଥରି ଜ୍ୱର, କମର ବିନ୍ଧା ଓ ପରିସ୍ରା ସଂକ୍ରମଣ ପରେ ଅତ୍ୟଧିକ ଦୁର୍ବଳତା", "sym": "ପରିସ୍ରା ପୋଡ଼ିବା ଏବେ ପିଠିକୁ ବ୍ୟାପିଛି, ପ୍ରବଳ ଜ୍ୱର, ଛିଡ଼ା ହେବାକୁ ଶକ୍ତି ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "acute_renal_parenchymal_infection; pyuria; backache",
                "en": {"cc": "Right sided back agony and cloudy scalding urine with sweats", "sym": "Fever spikes each evening, deep throbbing loin pain, frequent urges to urinate"},
                "hi": {"cc": "दाहिनी पीठ में असहनीय दर्द, खौलता हुआ पेशाब और पसीना", "sym": "शाम को तेज बुखार चढ़ना, कमर में अंदरूनी टीस, बार-बार पेशाब जाना"},
                "or": {"cc": "ଡାହାଣ ପିଠିରେ ଭୀଷଣ ଯନ୍ତ୍ରଣା, ଫୁଟୁଥିବା ଭଳି ପୋଡ଼ା ପରିସ୍ରା ଓ ଝାଳ", "sym": "ସନ୍ଧ୍ୟାରେ ଜ୍ୱର ବଢ଼ିବା, କମର ଭିତରେ ଧିମା ବିନ୍ଧା, ବାରମ୍ବାର ପରିସ୍ରା ଲାଗିବା"}
            },
            {
                "sub_id": "T05",
                "concepts": "complicated_urinary_infection; high_temperature; flank_ache",
                "en": {"cc": "Fever, nausea and severe tenderness over left lower back rib area", "sym": "Pain worse on gentle tap on lower ribs, burning micturition, bedbound for 24h"},
                "hi": {"cc": "बुखार, उल्टी और पीठ के निचले हिस्से में पसलियों के पास तेज दर्द", "sym": "पीठ पर हल्का थपथपाने से भी चीख निकलना, पेशाब में आग जैसी जलन, बिस्तर से उठ नहीं पा रहे"},
                "or": {"cc": "ଜ୍ୱର, ବାନ୍ତି ଓ ତଳ ପିଠି ପଞ୍ଜରା ପାଖରେ ପ୍ରବଳ ବିନ୍ଧା", "sym": "ପିଠିରେ ସାମାନ୍ୟ ଆଘାତରେ କଷ୍ଟ ବଢ଼ିବା, ପରିସ୍ରା ନିଆଁ ଭଳି ପୋଡ଼ିବା, ଶୋଇ ରହିଛନ୍ତି"}
            }
        ]
    }
]
