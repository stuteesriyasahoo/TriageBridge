"""
Triage V3: 20 GREEN Presentation Families (Part 1: Families 1 to 10)
====================================================================
Non-urgent, ambulatory presentations appropriate for primary care or outpatient management.
Normal physiological vitals throughout.
"""

def r_int(low, high):
    import random
    return random.randint(low, high)

def r_float(low, high, dec=1):
    import random
    return round(random.uniform(low, high), dec)

GREEN_FAMILIES_PART1 = [
    # 1. Common Cold / Viral URI
    {
        "family_id": "FAM_GRN_01",
        "concept_id": "CONCEPT_VIRAL_UPPER_RESPIRATORY_INFECTION",
        "urgency": "GREEN",
        "min_age": 14, "max_age": 75,
        "pain_min": 1, "pain_max": 3,
        "duration_hours": [48.0, 72.0, 96.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(110, 130), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.6, 37.4), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "clear_rhinorrhea; sneezing; mild_scratchy_throat; afebrile; normal_chest",
                "en": {"cc": "Mild runny nose, sneezing and tickly dry cough for 3 days", "sym": "Clear watery nasal drip, itchy palate, mild sore throat on swallowing toast, chest clear, normal appetite"},
                "hi": {"cc": "तीन दिन से हल्की बहती नाक, छींकें और गले में खराश", "sym": "नाक से साफ पानी गिरना, गले में हल्की खुजली, छाती बिल्कुल साफ, बुखार नहीं, भूख सामान्य"},
                "or": {"cc": "୩ ଦିନ ହେଲା ସାମାନ୍ୟ ନାକରୁ ପାଣି ବୋହିବା, ଛିଙ୍କ ଓ ଖସଖସ କାଶ", "sym": "ନାକରୁ ନିର୍ମଳ ପାଣି ଝରିବା, ତଣ୍ଟି କୁଣ୍ଡାଇ ହେବା, ଛାତି ପରିଷ୍କାର, ଜ୍ୱର ନାହିଁ, ଭୋକ ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T02",
                "concepts": "nasal_congestion; minor_head_cold; throat_tickle; ambulatory",
                "en": {"cc": "Stuffy nose and muffled ears with occasional dry throat tickle", "sym": "Nose blocked alternating sides, taking warm lemon water, no difficulty breathing, afebrile"},
                "hi": {"cc": "नाक बंद, कानों में भारीपन और गले में हल्की खराश", "sym": "बारी-बारी से नाक बंद होना, सांस लेने में कोई परेशानी नहीं, घरेलू काढ़ा ले रहे हैं, बुखार नहीं"},
                "or": {"cc": "ନାକ ବନ୍ଦ, କାନ ଭାରୀ ଲାଗିବା ଓ ଗଳାରେ ସାମାନ୍ୟ ଖସଖସ", "sym": "ନାକପୁଡ଼ା ଜାମ, ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ ନାହିଁ, ଉଷୁମ ପାଣି ପିଉଛନ୍ତି, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "coryza; mild_dry_cough; clear_phlegm; stable",
                "en": {"cc": "Head cold with watery eyes and mild morning throat irritation", "sym": "Sneezing fits after waking, small clearing of clear mucus, lungs clear, energetic and walking well"},
                "hi": {"cc": "आंखों से पानी, छींकें और सुबह उठने पर गले में हल्की जलन", "sym": "सुबह उठते ही छींकें आना, हल्का साफ बलगम, चलने-फिरने में कोई कमजोरी नहीं"},
                "or": {"cc": "ଆଖିରୁ ପାଣି ବୋହିବା, ଛିଙ୍କ ଓ ସକାଳେ ଗଳାରେ ସାମାନ୍ୟ ଜ୍ୱାଳା", "sym": "ସକାଳୁ ଛିଙ୍କ ଆସିବା, ସାମାନ୍ୟ ଧଳା କଫ, ଦୁର୍ବଳତା ନାହିଁ, ଚାଲିବୁଲି ପାରୁଛନ୍ତି"}
            },
            {
                "sub_id": "T04",
                "concepts": "mild_rhinitis; intermittent_throat_clearing; normal_vitals",
                "en": {"cc": "Dry scratch in throat and blowing nose frequently at work", "sym": "Using paper tissues throughout day, drinking tea, temperature normal, no breathlessness"},
                "hi": {"cc": "गले में सूखापन और दिन भर बार-बार नाक साफ करना", "sym": "रुमाल का इस्तेमाल, गर्म चाय पीने से आराम, शरीर का तापमान सामान्य, सांस बिल्कुल ठीक"},
                "or": {"cc": "ଗଳାରେ ଶୁଷ୍କତା ଓ ଦିନସାରା ବାରମ୍ବାର ନାକ ଫୋଡ଼ିବା", "sym": "ନାକରୁ ପାଣି ପୋଛିବା, ଚା' ପିଇଲେ ଆରାମ, ଦେହର ଉତ୍ତାପ ସ୍ୱାଭାବିକ, ଶ୍ୱାସକ୍ରିୟା ଠିକ୍"}
            },
            {
                "sub_id": "T05",
                "concepts": "common_cold_resolving; mild_hoarseness; good_oral_intake",
                "en": {"cc": "Lingering cold symptoms with mild hoarseness after family flu", "sym": "Family members had same cold last week, throat improving, eating normal meals, no chest pain"},
                "hi": {"cc": "परिवार में जुकाम के बाद हल्की आवाज बैठना और नाक बहना", "sym": "घर में सबको जुकाम था, गले में धीरे-धीरे सुधार, खाना-पीना सामान्य, छाती में कोई दर्द नहीं"},
                "or": {"cc": "ପରିବାରରେ ଥଣ୍ଡା ପରେ ସାମାନ୍ୟ ସ୍ୱର ବସିଯିବା ଓ ନାକରୁ ପାଣି", "sym": "ଘରେ ସମସ୍ତଙ୍କର ଥଣ୍ଡା ଥିଲା, ଗଳା ସୁଧୁରୁଛି, ଖାଇବା ଠିକ୍ ଅଛି, ଛାତି କଷ୍ଟ ନାହିଁ"}
            }
        ]
    },

    # 2. Tension-Type Headache
    {
        "family_id": "FAM_GRN_02",
        "concept_id": "CONCEPT_TENSION_HEADACHE",
        "urgency": "GREEN",
        "min_age": 18, "max_age": 65,
        "pain_min": 2, "pain_max": 4,
        "duration_hours": [6.0, 12.0, 24.0, 48.0],
        "vitals_func": lambda: {
            "hr": r_int(66, 84), "sbp": r_int(112, 132), "dbp": r_int(72, 84),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "bilateral_band_like_pressure; non_pulsatile_headache; no_photophobia; no_vomiting; neck_tightness",
                "en": {"cc": "Mild band-like pressure across forehead after prolonged computer screen work", "sym": "Dull steady tightening band around temples, no nausea, light does not bother eyes, neck muscles slightly stiff"},
                "hi": {"cc": "कंप्यूटर पर देर तक काम करने के बाद माथे पर दोनों तरफ हल्का दबाव और भारीपन", "sym": "कनपटी के चारों ओर हल्की जकड़न, उल्टी का मन नहीं, रोशनी से कोई परेशानी नहीं, गर्दन में हल्का तनाव"},
                "or": {"cc": "କମ୍ପ୍ୟୁଟରରେ ବହୁତ ସମୟ କାମ ପରେ କପାଳରେ ଫିତା ବାନ୍ଧିଲା ଭଳି ଚାପ", "sym": "କପାଳ ଚାରିପାଖେ ଧିମା ଜକଡ଼ା ଭାବ, ବାନ୍ତି ନାହିଁ, ଆଲୋକରେ କଷ୍ଟ ନାହିଁ, ବେକ ସାମାନ୍ୟ ଟାଣ"}
            },
            {
                "sub_id": "T02",
                "concepts": "stress_headache; occipital_tightness; normal_neurological",
                "en": {"cc": "Dull ache at base of skull and forehead related to work stress", "sym": "Gradual onset over 2 days, tight feeling when turning neck, vision clear, walked into clinic comfortably"},
                "hi": {"cc": "काम के तनाव से सिर के पिछले हिस्से और माथे में धीमा दर्द", "sym": "दो दिन से हल्का खिंचाव, गर्दन घुमाने पर भारीपन, नजर बिल्कुल साफ, आराम से चलकर आए"},
                "or": {"cc": "କାମ ଚାପ ଯୋଗୁଁ ପଛ କପାଳ ଓ ମୁଣ୍ଡ ମୂଳରେ ଧିମା ବିନ୍ଧା", "sym": "ଦୁଇ ଦିନ ହେଲା ଧୀରେ ଧୀରେ ବଢ଼ିଛି, ବେକ ବୁଲାଇଲେ ଭାରୀ ଲାଗିବା, ଦୃଷ୍ଟି ନିର୍ମଳ"}
            },
            {
                "sub_id": "T03",
                "concepts": "episodic_tension_headache; cap_like_distribution; relieved_by_rest",
                "en": {"cc": "Tight helmet sensation over top of head after sleepless night", "sym": "Pressure feeling without throbbing, improves when resting in quiet room, no focal weakness"},
                "hi": {"cc": "नींद पूरी न होने के बाद सिर के ऊपर हेलमेट जैसा कसाव", "sym": "दबाव जैसा अहसास पर कोई धड़कन नहीं, शांत कमरे में आराम करने से राहत, कोई कमजोरी नहीं"},
                "or": {"cc": "ନିଦ ନହେବା ପରେ ମୁଣ୍ଡ ଉପରେ ହେଲମେଟ୍ ପିନ୍ଧିଲା ଭଳି ଜାକି ଧରିବା", "sym": "ଧିମା ଚାପ ଭାବ, ଶାନ୍ତ ଜାଗାରେ ବିଶ୍ରାମ କଲେ କମୁଛି, କୌଣସି ଦୁର୍ବଳତା ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "myofascial_cervicogenic_headache; dull_bilateral; no_red_flags",
                "en": {"cc": "Mild continuous head heaviness with shoulder knots", "sym": "Shoulder muscles tight, headache eases slightly with neck rub, appetite normal, no fever"},
                "hi": {"cc": "कंधों में तनाव के साथ सिर में हल्का भारीपन", "sym": "कंधे की मांसपेशियों में जकड़न, गर्दन दबाने पर सिर में थोड़ा आराम, भूख ठीक, बुखार नहीं"},
                "or": {"cc": "କାନ୍ଧ ଟାଣିବା ସହ ମୁଣ୍ଡରେ ସାମାନ୍ୟ ଭାରୀପଣ", "sym": "କାନ୍ଧ ମାଂସପେଶୀ ଜାମ, ବେକ ମାଲିସ କଲେ ଆରାମ, ଭୋକ ସ୍ୱାଭାବିକ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "tension_headache; bilateral_frontal; paracetamol_responsive",
                "en": {"cc": "Forehead ache recurring towards evening after study sessions", "sym": "Dull ache over eyebrows, completely resolved yesterday with regular paracetamol, no vomiting"},
                "hi": {"cc": "पढ़ाई के बाद शाम को भौंहों के ऊपर हल्का दर्द", "sym": "भौंहों के पास भारीपन, साधारण दवा लेने से कल पूरा आराम मिल गया था, कोई उल्टी नहीं"},
                "or": {"cc": "ପାଠ ପଢ଼ିବା ପରେ ସନ୍ଧ୍ୟା ବେଳକୁ ଭ୍ରୂଲତା ଉପରେ ସାମାନ୍ୟ ବିନ୍ଧା", "sym": "ଆଖିପତା ଉପରେ ଧିମା କଷ୍ଟ, ସାଧାରଣ ପାରାସିଟାମୋଲ୍ ଖାଇଲେ କମିଯାଉଛି"}
            }
        ]
    },

    # 3. Mild Allergic Rhinitis / Conjunctivitis
    {
        "family_id": "FAM_GRN_03",
        "concept_id": "CONCEPT_ALLERGIC_RHINITIS",
        "urgency": "GREEN",
        "min_age": 10, "max_age": 60,
        "pain_min": 1, "pain_max": 2,
        "duration_hours": [48.0, 72.0, 120.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(112, 128), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "itchy_watery_eyes; repetitive_sneezing; clear_rhinorrhea; seasonal_pattern; afebrile",
                "en": {"cc": "Itchy watery eyes and recurrent sneezing fits with seasonal pollen change", "sym": "Rubbing inner corners of eyes, clear runny nose, itching of roof of mouth, no chest tightness, no fever"},
                "hi": {"cc": "मौसम बदलने पर आंखों में खुजली, पानी और बार-बार छींकें आना", "sym": "आंखें मलने की इच्छा, नाक से साफ पानी, तालू में खुजली, छाती में कोई रुकावट नहीं, बुखार नहीं"},
                "or": {"cc": "ଋତୁ ପରିବର୍ତ୍ତନରେ ଆଖି କୁଣ୍ଡାଇ ହୋଇ ପାଣି ବାହାରିବା ଓ ଲଗାତାର ଛିଙ୍କ", "sym": "ଆଖି କୋଣ କୁଣ୍ଡାଇବା, ନାକରୁ ନିର୍ମଳ ପାଣି, ତାଳୁ କୁଣ୍ଡାଇ ହେବା, ଛାତି ଠିକ୍, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "allergic_conjunctivitis; bilateral_ocular_itching; no_purulent_discharge",
                "en": {"cc": "Pink gritty itchy eyes without pus discharge after lawn mowing", "sym": "Both eyes mildly red and tearing, eyelids slightly puffy, vision unaffected, no pain on eye movement"},
                "hi": {"cc": "घास कटाई के बाद दोनों आंखों में लाली, खुजली और पानी बिना किसी मवाद के", "sym": "दोनों आंखें गुलाबी और नम, नजर बिल्कुल साफ, आंख घुमाने में कोई दर्द नहीं"},
                "or": {"cc": "ଘାସ କାଟିବା ପରେ ଦୁଇ ଆଖି ନାଲି ପଡ଼ି କୁଣ୍ଡାଇ ହେବା, ପୂଜ ନାହିଁ", "sym": "ଉଭୟ ଆଖି ଗୋଲାପୀ ଓ ଲୁହଭରା, ପତା ସାମାନ୍ୟ ଫୁଲା, ଦୃଷ୍ଟି ସ୍ପଷ୍ଟ, କୌଣସି କଷ୍ଟ ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "hay_fever; nasal_pruritus; allergic_shiners_mild; clear_drainage",
                "en": {"cc": "Seasonal allergy flare with tickling nose and nose rubbing", "sym": "Constant urge to rub nose upwards, sneezing 6 times in row, afebrile, taking home antihistamines"},
                "hi": {"cc": "एलर्जी के कारण नाक में सुरसुराहट और बार-बार नाक रगड़ना", "sym": "नाक के अंदर तेज खुजली, एक साथ कई छींकें, बुखार बिल्कुल नहीं, एंटी-एलर्जी ले रहे हैं"},
                "or": {"cc": "ଏଲର୍ଜି ଯୋଗୁଁ ନାକ ଭିତର ସୁଡ଼ସୁଡ଼ ହେବା ଓ ବାରମ୍ବାର ନାକ ଘଷିବା", "sym": "ନାକ ଭିତରେ କୁଣ୍ଡିଆଣି, ଥରକେ ୬ଟି ଛିଙ୍କ, ଜ୍ୱର ଆଦୌ ନାହିଁ, ଏଲର୍ଜି ଔଷଧ ଖାଉଛନ୍ତି"}
            },
            {
                "sub_id": "T04",
                "concepts": "dust_allergy; conjunctival_hyperemia_mild; clear_lacrimation",
                "en": {"cc": "Red itchy eyes and runny nose after cleaning dusty bookshelves", "sym": "Immediate reaction to dust, clear nasal fluid, no sore throat, feels well otherwise"},
                "hi": {"cc": "धूल की किताबें साफ करने के बाद आंखों में लाली और नाक बहना", "sym": "धूल लगते ही आंखें लाल, नाक से साफ पानी, गले में कोई दर्द नहीं, बाकी सब ठीक"},
                "or": {"cc": "ଧୂଳି ସଫା କରିବା ପରେ ଆଖି ନାଲି ଓ ନାକରୁ ପାଣି ବୋହିବା", "sym": "ଧୂଳି ବାଜିବା ମାତ୍ରେ ଆଖି କୁଣ୍ଡାଇ ହେବା, ଗଳା ଦରଜ ନାହିଁ, ଅନ୍ୟ ସବୁ ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T05",
                "concepts": "rhinoconjunctivitis; intermittent_sneezing; normal_chest_sounds",
                "en": {"cc": "Watery nose and red eyes in morning since flowering season started", "sym": "Sneezing clears after shower, mild roof of mouth itch, appetite excellent, no wheezing"},
                "hi": {"cc": "फूलों के मौसम में सुबह उठते ही आंखों में पानी और नाक बहना", "sym": "नहाने के बाद छींकों में कमी, तालू में हल्की खुजली, भूख अच्छी, छाती में कोई घरघराहट नहीं"},
                "or": {"cc": "ଫୁଲ ଫୁଟିବା ଦିନରେ ସକାଳେ ଆଖିରୁ ପାଣି ଓ ନାକ ବୋହିବା", "sym": "ଗାଧୋଇବା ପରେ ଛିଙ୍କ କମୁଛି, ତାଳୁ ସାମାନ୍ୟ କୁଣ୍ଡାଇ, ଭୋକ ଭଲ, ଛାତିରେ ଶବ୍ଦ ନାହିଁ"}
            }
        ]
    },

    # 4. Superficial Skin Abrasion / Grazed Knee
    {
        "family_id": "FAM_GRN_04",
        "concept_id": "CONCEPT_SUPERFICIAL_ABRASION",
        "urgency": "GREEN",
        "min_age": 8, "max_age": 60,
        "pain_min": 2, "pain_max": 4,
        "duration_hours": [1.0, 2.0, 4.0, 8.0],
        "vitals_func": lambda: {
            "hr": r_int(70, 88), "sbp": r_int(112, 130), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "superficial_knee_graze; epidermal_loss_only; oozing_stopped; clean_margins; full_mobility",
                "en": {"cc": "Superficial skin graze on right knee from stumbling on pavement", "sym": "Minor surface scrape with capillary oozing stopped by tissue, knee joint bends fully without bone tenderness"},
                "hi": {"cc": "फुटपाथ पर फिसलने से दाहिने घुटने की चमड़ी छिलना और मामूली खरोंच", "sym": "सतही खरोंच, खून का रिसाव बंद हो चुका है, घुटना पूरी तरह मुड़ रहा है, हड्डी में कोई दर्द नहीं"},
                "or": {"cc": "ରାସ୍ତାରେ ଖସିପଡ଼ି ଡାହାଣ ଆଣ୍ଠୁ ଚମଡ଼ା ଛାଲିଯିବା ଓ ସାମାନ୍ୟ କ୍ଷତ", "sym": "ଉପର ଚମଡ଼ା ରଗଡ଼ି ହୋଇଛି, ରକ୍ତ ଝରିବା ବନ୍ଦ, ଆଣ୍ଠୁ ସମ୍ପୂର୍ଣ୍ଣ ଭାଙ୍ଗୁଛି, ହାଡ଼ରେ କଷ୍ଟ ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "friction_burn_elbow; raw_epidermis; intact_range_of_motion",
                "en": {"cc": "Scraped left elbow on turf during badminton game", "sym": "Red raw skin patch 3x3 cm, washed with clean water, mild stinging on touch, elbow moves normally"},
                "hi": {"cc": "खेलते समय कोहनी छिल जाना और हल्की जलन", "sym": "कोहनी पर 3x3 सेमी की लाल खरोंच, पानी से धोया है, छूने पर हल्की चुभन, हाथ पूरा मुड़ रहा"},
                "or": {"cc": "ଖେଳିବା ବେଳେ ବାମ କହୁଣୀ ଘଷି ହୋଇ ଛାଲିଯିବା ଓ ପୋଡ଼ିବା", "sym": "କହୁଣୀରେ ୩x୩ ସେମି ଲାଲ୍ ଘଷା ଚିହ୍ନ, ପାଣିରେ ଧୋଇଛନ୍ତି, ଛୁଇଁଲେ ସାମାନ୍ୟ କଷ୍ଟ, ହାତ ଚଳୁଛି"}
            },
            {
                "sub_id": "T03",
                "concepts": "palm_abrasion_fall; clean_wound; no_foreign_body",
                "en": {"cc": "Scratched palms after tripping on stairs, needs antiseptic clean", "sym": "Shallow surface grazes across palm heels, no embedded dirt, finger movement full, bleeding dried"},
                "hi": {"cc": "सीढ़ियों पर फिसलने से हथेलियों में खरोंचें, दवा लगवाने आए हैं", "sym": "हथेलियों की सतही चमड़ी छिलना, कोई कंकड़ नहीं फंसा, उंगलियां पूरी हिल रही हैं, खून रुका है"},
                "or": {"cc": "ପାହାଚରେ ଝୁଣ୍ଟି ହାତ ପାପୁଲି ଛାଲିଯିବା, ଔଷଧ ଲଗାଇବା ଦରକାର", "sym": "ପାପୁଲି ତଳ ଭାଗରେ ସାମାନ୍ୟ ରାମ୍ପୁଡ଼ା, କୌଣସି ଧୂଳି ପଶିନାହିଁ, ଆଙ୍ଗୁଠି ଚଳପ୍ରଚଳ ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T04",
                "concepts": "shin_scrape_pedal; minor_bruise; ambulatory",
                "en": {"cc": "Shin scrape from bicycle pedal with mild surface grazing", "sym": "Scratched shin with dry scab forming, walked in without limp, no deep cut, no numbness"},
                "hi": {"cc": "साइकिल के पैडल से पिंडली पर मामूली खरोंच", "sym": "हड्डी के ऊपर हल्की खरोंच जिस पर पपड़ी जम रही है, बिना लंगड़ाए चल रहे हैं, कोई गहरा घाव नहीं"},
                "or": {"cc": "ସାଇକେଲ ପେଡାଲ୍ ବାଜି ନଳି ହାଡ଼ରେ ସାମାନ୍ୟ ରାମ୍ପୁଡ଼ା", "sym": "ଚମଡ଼ା ଉପରେ ଶୁଖିଲା ଖସରା, ବିନା ଛୋଟେଇ ଚାଲୁଛନ୍ତି, ଗଭୀର କଟା ନାହିଁ, କାଲୁଆ ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "minor_abrasion_dressing_request; tetanus_update_request; superficial",
                "en": {"cc": "Clean graze on shoulder from garden fence, requesting clean dressing", "sym": "Surface scrape only, no flap of skin, no active bleeding, completely alert and comfortable"},
                "hi": {"cc": "बाड़ से कंधे पर मामूली खरोंच, पट्टी करवाने के लिए आए हैं", "sym": "केवल ऊपरी चमड़ी छूटी है, कोई खून नहीं बह रहा, मरीज पूरी तरह सहज और स्वस्थ"},
                "or": {"cc": "ବାଡ଼ ବାଜି କାନ୍ଧରେ ସାମାନ୍ୟ ଘୋଷାରି ହେବା, ପଟି ଲଗାଇବାକୁ ଆସିଛନ୍ତି", "sym": "କେବଳ ଉପର ଚମଡ଼ା ଛାଲିଛି, ରକ୍ତ ବୋହୁନାହିଁ, ରୋଗୀ ସମ୍ପୂର୍ଣ୍ଣ ସୁସ୍ଥ ଓ ଚେତନ"}
            }
        ]
    },

    # 5. Chronic Knee Osteoarthritis Flare
    {
        "family_id": "FAM_GRN_05",
        "concept_id": "CONCEPT_CHRONIC_KNEE_OSTEOARTHRITIS",
        "urgency": "GREEN",
        "min_age": 55, "max_age": 82,
        "pain_min": 3, "pain_max": 5,
        "duration_hours": [72.0, 168.0, 336.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 84), "sbp": r_int(120, 140), "dbp": r_int(74, 86),
            "spo2": r_int(97, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "chronic_bilateral_knee_crepitus; morning_stiffness_under_20min; pain_after_walking; no_joint_heat; afebrile",
                "en": {"cc": "Longstanding dull ache in both knees worse after prolonged walking in temple", "sym": "Bilateral joint crepitus on bending, morning stiffness lasts 10 minutes, no redness, no fever, walks with cane"},
                "hi": {"cc": "मंदिर में ज्यादा चलने के बाद दोनों घुटनों में पुराना धीमा दर्द बढ़ना", "sym": "घुटना मोड़ने पर कट-कट की आवाज, सुबह 10 मिनट की जकड़न, कोई लाली या गर्मी नहीं, बुखार नहीं"},
                "or": {"cc": "ମନ୍ଦିରରେ ଅଧିକ ଚାଲିବା ପରେ ଉଭୟ ଆଣ୍ଠୁରେ ପୁରୁଣା ଘୋଳାବିନ୍ଧା ବଢ଼ିବା", "sym": "ଭାଙ୍ଗିଲେ କଟକଟ ଶବ୍ଦ, ସକାଳେ ୧୦ ମିନିଟ୍ ଟାଣ ଲାଗିବା, ଲାଲ୍ ବା ଗରମ ନାହିଁ, ବାଡ଼ି ଧରି ଚାଲୁଛନ୍ତି"}
            },
            {
                "sub_id": "T02",
                "concepts": "knee_osteoarthritis_weather_flare; mechanical_ache; stable_effusion_none",
                "en": {"cc": "Knee soreness aggravated by damp cold weather over past week", "sym": "Familiar chronic joint ache, goes up stairs slowly, joints cool to touch, taking calcium supplements"},
                "hi": {"cc": "ठंडे मौसम के कारण पिछले एक हफ्ते से घुटनों में पुराना दर्द उभरना", "sym": "वही पुराना जाना-पहचाना दर्द, सीढ़ियां धीरे चढ़ना, घुटने गर्म नहीं हैं, कोई सूजन नहीं"},
                "or": {"cc": "ଥଣ୍ଡା ପାଗ ଯୋଗୁଁ ଗତ ଏକ ସପ୍ତାହରୁ ଆଣ୍ଠୁର ପୁରୁଣା କଷ୍ଟ ବଢ଼ିବା", "sym": "ସେହି ପୁରୁଣା ପରିଚିତ ବିନ୍ଧା, ପାହାଚ ଧୀରେ ଚଢ଼ୁଛନ୍ତି, ଆଣ୍ଠୁ ଥଣ୍ଡା ଅଛି, ଫୁଲା ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "degenerative_joint_ache; mild_swelling_chronic; mobile",
                "en": {"cc": "Aching inner edge of right knee after market grocery shopping", "sym": "Mild bony enlargement at joint margin, no acute redness, relieves after resting on sofa"},
                "hi": {"cc": "बाजार से सामान लाने के बाद दाहिने घुटने के अंदरूनी किनारे पर दर्द", "sym": "हड्डी थोड़ी मोटी महसूस होना, कोई लाली नहीं, सोफे पर पैर सीधा रखने से आराम मिलता है"},
                "or": {"cc": "ବଜାର କରିବା ପରେ ଡାହାଣ ଆଣ୍ଠୁର ଭିତର ପାଖରେ ବିନ୍ଧା", "sym": "ହାଡ଼ ସାମାନ୍ୟ ମୋଟା ଲାଗିବା, ଲାଲ୍ ନାହିଁ, ଚୌକିରେ ଗୋଡ଼ ଲମ୍ବାଇଲେ ଆରାମ ଲାଗୁଛି"}
            },
            {
                "sub_id": "T04",
                "concepts": "wear_and_tear_knee_pain; stiffness_on_inactivity; ambulatory",
                "en": {"cc": "Stiff knees when standing up from floor mat after puja", "sym": "Takes a minute to straighten up, smooths out after walking 20 steps, normal appetite, no fever"},
                "hi": {"cc": "पूजा के बाद जमीन से उठते समय घुटनों में जकड़न और दर्द", "sym": "खड़े होने में थोड़ा समय लगना, 20 कदम चलने के बाद जकड़न खुल जाना, बुखार नहीं"},
                "or": {"cc": "ପୂଜା ପରେ ତଳୁ ଉଠିଲା ବେଳେ ଆଣ୍ଠୁ ଜାମ ହୋଇ ବିନ୍ଧିବା", "sym": "ଛିଡ଼ା ହେବାକୁ ଟିକେ ସମୟ ଲାଗୁଛି, କିଛି ପାଦ ଚାଲିଲେ ଖୋଲିଯାଉଛି, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "chronic_arthrosis; pain_on_descending_stairs; no_systemic_symptoms",
                "en": {"cc": "Difficulty going down staircase due to dull kneecap ache", "sym": "Patellofemoral grinding sound, holds handrail firmly, joints look normal without redness"},
                "hi": {"cc": "सीढ़ियां उतरते समय घुटने की कटोरी में धीमा दर्द", "sym": "उतरते समय सहारा लेना, जोड़ पर कोई लाली या गर्माहट नहीं, सामान्य स्वास्थ्य ठीक"},
                "or": {"cc": "ପାହାଚ ଓହ୍ଲାଇବା ବେଳେ ଆଣ୍ଠୁ ଚକିରେ ଧିମା ବିନ୍ଧା", "sym": "ରେଲିଂ ଧରି ଓହ୍ଲାଉଛନ୍ତି, ଗଣ୍ଠିରେ ନାଲି ବା ଉଷୁମ ନାହିଁ, ସାଧାରଣ ସ୍ୱାସ୍ଥ୍ୟ ଭଲ"}
            }
        ]
    }
]
