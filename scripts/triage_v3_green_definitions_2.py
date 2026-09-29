"""
Triage V3: GREEN Presentation Families (Part 2: Families 6 to 12)
"""

def r_int(low, high):
    import random
    return random.randint(low, high)

def r_float(low, high, dec=1):
    import random
    return round(random.uniform(low, high), dec)

GREEN_FAMILIES_PART2 = [
    # 6. Mild Dyspepsia / Heartburn
    {
        "family_id": "FAM_GRN_06",
        "concept_id": "CONCEPT_MILD_DYSPEPSIA",
        "urgency": "GREEN",
        "min_age": 20, "max_age": 65,
        "pain_min": 2, "pain_max": 4,
        "duration_hours": [6.0, 12.0, 24.0, 48.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(112, 132), "dbp": r_int(70, 84),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "epigastric_burning; postprandial_distress; acid_regurgitation; relieved_by_antacid; no_red_flags",
                "en": {"cc": "Mild burning in upper stomach after late fried dinner relieved by antacid liquid", "sym": "Sour acid taste in throat when lying down, soft non-tender abdomen, no vomiting, no weight loss, heart rate normal"},
                "hi": {"cc": "देर रात तला-भुना खाने के बाद पेट के ऊपरी हिस्से में हल्की जलन जो एंटासिड से कम होती है", "sym": "लेटने पर गले में खट्टा पानी, पेट छूने पर बिल्कुल नरम, कोई उल्टी नहीं, वजन कम नहीं हुआ"},
                "or": {"cc": "ରାତିରେ ତେଲଛଣା ଖାଇବା ପରେ ପେଟ ଉପରେ ସାମାନ୍ୟ ପୋଡ଼ାଜଳା ଯାହା ସିରପ୍ ପିଇଲେ କମୁଛି", "sym": "ଶୋଇଲେ ପାଟିକୁ ଖଟା ପାଣି ଆସିବା, ପେଟ ନରମ ଅଛି, ବାନ୍ତି ନାହିଁ, ହୃଦସ୍ପନ୍ଦନ ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T02",
                "concepts": "gastroesophageal_reflux_mild; waterbrash; retrosternal_warmth",
                "en": {"cc": "Sour belching and warm sensation behind chest bone after spicy tea", "sym": "Warm feeling rising to throat, disappears on standing and drinking water, no exertion pain, lungs clear"},
                "hi": {"cc": "मसालेदार चाय के बाद खट्टी डकारें और छाती के बीच में हल्की गर्माहट", "sym": "गले तक हल्की जलन उठना, पानी पीने पर शांत होना, चलने पर दर्द नहीं, सांस पूरी आ रही"},
                "or": {"cc": "ମସଲା ଚା' ପିଇବା ପରେ ଖଟା ଢେକୁର ଓ ଛାତି ମଝିରେ ସାମାନ୍ୟ ଉଷୁମ ଭାବ", "sym": "ତଣ୍ଟି ଆଡ଼କୁ ଜ୍ୱାଳା ଉଠିବା, ପାଣି ପିଇଲେ ଶାନ୍ତ ପଡ଼ିବା, ଚାଲିଲେ କଷ୍ଟ ହେଉନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "functional_dyspepsia; postprandial_bloating; mild_epigastric_ache",
                "en": {"cc": "Fullness and stomach tightness after eating lunch, requesting digestion aid", "sym": "Upper abdomen feels bloated like balloon, passes flatulence with relief, normal stools"},
                "hi": {"cc": "दोपहर के खाने के बाद पेट में भारीपन और अफारा, हाजमे की दवा चाहिए", "sym": "पेट फूला हुआ महसूस होना, डकार आने पर हल्का लगना, शौच बिल्कुल सामान्य"},
                "or": {"cc": "ମଧ୍ୟାହ୍ନ ଭୋଜନ ପରେ ପେଟ ଫାମ୍ପିବା ଓ ଭାରୀ ଲାଗିବା, ହଜମ ଔଷଧ ଦରକାର", "sym": "ପେଟ ଫୁଲି ରହିବା, ଢେକୁର ଆସିଲେ ହାଲୁକା ଲାଗିବା, ଝାଡ଼ା ସମ୍ପୂର୍ଣ୍ଣ ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T04",
                "concepts": "indigestion; occasional_heartburn; dietary_trigger",
                "en": {"cc": "Mild indigestion after eating heavy banquet food yesterday", "sym": "Burning behind breastbone after meals, relieved by sitting upright, appetite intact"},
                "hi": {"cc": "कल दावत का भारी खाना खाने के बाद हल्की बदहजमी और जलन", "sym": "खाने के बाद छाती में हल्की जलन, सीधा बैठने पर आराम, भूख ठीक लग रही है"},
                "or": {"cc": "କାଲି ଭୋଜି ଖାଇବା ପରେ ସାମାନ୍ୟ ବଦହଜମି ଓ ପେଟ ପୋଡ଼ିବା", "sym": "ଖାଇସାରିଲେ ଛାତି ତଳେ ପୋଡ଼ାଜଳା, ସଳଖ ବସିଲେ ଆରାମ, ଭୋକ ଠିକ୍ ଅଛି"}
            },
            {
                "sub_id": "T05",
                "concepts": "gastric_irritation_mild; non_radiating; afebrile",
                "en": {"cc": "Irritated stomach feeling after drinking strong black coffee on empty stomach", "sym": "Gnawing discomfort at epigastrium, completely soothed by drinking cold milk, alert"},
                "hi": {"cc": "खाली पेट तेज कॉफी पीने के बाद पेट में हल्की कुलबुलाहट और जलन", "sym": "पेट के ऊपरी हिस्से में हल्की चुभन, ठंडा दूध पीने पर तुरंत राहत, मरीज स्वस्थ"},
                "or": {"cc": "ଖାଲି ପେଟରେ କଡ଼ା କଫି ପିଇବା ପରେ ପେଟରେ ସାମାନ୍ୟ ଜ୍ୱାଳା", "sym": "ପେଟ ଭିତରେ କାମୁଡ଼ିଲା ଭଳି ଲାଗିବା, ଥଣ୍ଡା କ୍ଷୀର ପିଇଲେ ତୁରନ୍ତ ଉପଶମ, ସୁସ୍ଥ ଅଛନ୍ତି"}
            }
        ]
    },

    # 7. Simple Muscle Strain / Lumbar Myofascial Spasm
    {
        "family_id": "FAM_GRN_07",
        "concept_id": "CONCEPT_SIMPLE_LUMBAR_STRAIN",
        "urgency": "GREEN",
        "min_age": 20, "max_age": 65,
        "pain_min": 3, "pain_max": 5,
        "duration_hours": [12.0, 24.0, 48.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(115, 134), "dbp": r_int(72, 84),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "mechanical_lower_back_ache; paraspinal_muscle_spasm; pain_on_bending; no_radiculopathy; no_bowel_bladder_signs",
                "en": {"cc": "Mechanical lower back ache after lifting heavy water bucket this morning", "sym": "Paraspinal tenderness in lower lumbar muscles, worse on forward bending, no shooting leg pain, normal bladder and bowel control"},
                "hi": {"cc": "सुबह पानी की भारी बाल्टी उठाने के बाद कमर के निचले हिस्से में खिंचाव और दर्द", "sym": "रीढ़ के दोनों तरफ मांसपेशियों में अकड़न, झुकने पर दर्द, पैर में कोई बिजली जैसा दर्द नहीं, पेशाब पर पूरा नियंत्रण"},
                "or": {"cc": "ସକାଳେ ଭାରୀ ବାଲ୍‌ଟି ଟେକିବା ପରେ କମର ତଳେ ମାଂସପେଶୀ ଟାଣି ହୋଇ ବିନ୍ଧା", "sym": "ମେରୁଦଣ୍ଡ ଦୁଇ ପାଖରେ ମାଂସ ଜାମ, ଆଗକୁ ନଇଁଲେ କଷ୍ଟ, ଗୋଡ଼କୁ ବିନ୍ଧା ଯାଉନାହିଁ, ପରିସ୍ରା ନିୟନ୍ତ୍ରଣ ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_lumbago; muscle_tightness; relieved_recumbency",
                "en": {"cc": "Sore stiff lower back after long bumpy bus journey", "sym": "Ache across waistline, eased by lying flat on bed with pillow under knees, walked into triage independently"},
                "hi": {"cc": "बस के लंबे झटकेदार सफर के बाद कमर में अकड़न और भारीपन", "sym": "कमर की पट्टी में धीमा दर्द, सीधा लेटने पर बहुत आराम, खुद चलकर कमरे में आए हैं"},
                "or": {"cc": "ବସ୍ ଯାତ୍ରାରେ ଝଟକା ଲାଗି କମରରେ ଜକଡ଼ା ଓ ଯନ୍ତ୍ରଣା", "sym": "କମର ଚାରିପାଖେ ବିନ୍ଧା, ଚଟାଣରେ ଶୋଇଲେ ବହୁତ ଆଶ୍ୱସ୍ତି, ନିଜେ ଚାଲି ଆସିଛନ୍ତି"}
            },
            {
                "sub_id": "T03",
                "concepts": "myofascial_lumbar_strain; focal_tenderness; normal_straight_leg_raise",
                "en": {"cc": "Twisted lower back while shifting flower pot in garden", "sym": "Focal muscular tenderness at L4-L5 level, straight leg raise negative, no tingling in toes, alert"},
                "hi": {"cc": "गमला उठाते समय कमर में अचानक लचक और दर्द", "sym": "कमर की मांसपेशी छूने पर दर्द, पैर ऊपर उठाने में कोई नसों का खिंचाव नहीं, उंगलियां सुन्न नहीं"},
                "or": {"cc": "ଟବ୍ ଉଠାଇବା ବେଳେ କମର ମୋଡ଼ି ହୋଇ ଲଚକି ଯିବା ଓ କଷ୍ଟ", "sym": "ମାଂସପେଶୀ ଛୁଇଁଲେ ଦରଜ, ଗୋଡ଼ ଟେକିଲେ ନସ ଟାଣୁନାହିଁ, ଆଙ୍ଗୁଠି କାଲୁଆ ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "postural_back_pain; lumbar_erector_spasm; pain_standing",
                "en": {"cc": "Aching across lower spine after assembling flat-pack furniture", "sym": "Muscles feel tight like guitar strings, relieved by warm compress, gait normal, no fever"},
                "hi": {"cc": "फर्नीचर कसने के बाद रीढ़ के निचले हिस्से में मांसपेशियों का दर्द", "sym": "मांसपेशियों में खिंचाव, गर्म सिकाई से आराम, चलने-फिरने का तरीका सामान्य, बुखार नहीं"},
                "or": {"cc": "ଆସବାବପତ୍ର ସଜାଡ଼ିବା ପରେ କମର ହାଡ଼ ପାଖରେ ମାଂସପେଶୀ ଟାଣିବା", "sym": "ମାଂସ ଶକ୍ତ ଲାଗୁଛି, ଗରମ ସେକ ଦେଲେ ଉପଶମ, ଚାଲିବାରେ ବାଧା ନାହିଁ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "uncomplicated_back_ache; localized_ache; no_neurological_deficit",
                "en": {"cc": "Tight waist ache from digging garden patch yesterday", "sym": "Dull ache when rising from chair, resolves after walking few paces, taking ibuprofen gel"},
                "hi": {"cc": "कल बगीचे में मिट्टी खोदने के बाद कमर में अकड़न", "sym": "कुर्सी से उठते समय थोड़ा दर्द, दो कदम चलने पर ठीक, जेल लगाने से आराम मिलता है"},
                "or": {"cc": "କାଲି ବଗିଚା କାମ ପରେ କମର ଚାରିପାଖେ ମାଂସ ଟାଣି ବିନ୍ଧା", "sym": "ଚୌକିରୁ ଉଠିଲେ କଷ୍ଟ, କିଛି ବାଟ ଚାଲିଲେ ଠିକ୍, ମଲମ ଲଗାଇଲେ ଆରାମ"}
            }
        ]
    },

    # 8. Mild Acute Viral Gastroenteritis
    {
        "family_id": "FAM_GRN_08",
        "concept_id": "CONCEPT_MILD_GASTROENTERITIS",
        "urgency": "GREEN",
        "min_age": 16, "max_age": 65,
        "pain_min": 2, "pain_max": 4,
        "duration_hours": [12.0, 24.0, 36.0],
        "vitals_func": lambda: {
            "hr": r_int(72, 88), "sbp": r_int(112, 130), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.7, 37.4), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "mild_watery_diarrhea; no_vomiting; moist_mucous_membranes; normal_skin_turgor; good_hydration",
                "en": {"cc": "Three loose watery stools since morning without vomiting or high fever", "sym": "Passing watery stools with mild stomach gurgling, drinking rice water and oral rehydration salt solution easily, moist tongue, good urine output"},
                "hi": {"cc": "सुबह से तीन बार पतले दस्त, कोई उल्टी या तेज बुखार नहीं", "sym": "पेट में हल्की गुड़गुड़ाहट, ओआरएस का घोल और पानी आराम से पी रहे हैं, जीभ नम है, पेशाब खुलकर आ रहा"},
                "or": {"cc": "ସକାଳୁ ତିନି ଥର ପାତଳା ଝାଡ଼ା, ବାନ୍ତି ବା ପ୍ରବଳ ଜ୍ୱର ନାହିଁ", "sym": "ପେଟ ସାମାନ୍ୟ ଗୁଡ଼ୁଗୁଡ଼ୁ, ଓଆରଏସ୍ ଓ ତୋରାଣି ପାଣି ସହଜରେ ପିଉଛନ୍ତି, ଜିଭ ଓଦା ଅଛି, ପରିସ୍ରା ସ୍ୱାଭାବିକ"}
            },
            {
                "sub_id": "T02",
                "concepts": "mild_viral_enteritis; borborygmi; well_hydrated; ambulatory",
                "en": {"cc": "Stomach rumbling with loose bowels after street snack yesterday", "sym": "Cramps relieved immediately after bowel movement, appetite slightly reduced but drinking fluids well, eyes normal"},
                "hi": {"cc": "कल बाहर का चाट-पकौड़ा खाने के बाद पेट में मरोड़ और हल्के दस्त", "sym": "शौच जाने के बाद तुरंत आराम, पानी और चाय ले रहे हैं, आंखें बिल्कुल सामान्य, कोई कमजोरी नहीं"},
                "or": {"cc": "କାଲି ବାହାର ଜଳଖିଆ ଖାଇବା ପରେ ପେଟ ଗୋଳମାଳ ଓ ପାତଳା ଝାଡ଼ା", "sym": "ଝାଡ଼ା ଗଲେ ତୁରନ୍ତ ପେଟ ଶାନ୍ତ, ପାଣି ପିଉଛନ୍ତି, ଆଖି ସ୍ୱାଭାବିକ, କୌଣସି ଦୁର୍ବଳତା ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "mild_food_related_loose_stools; no_blood; hemodynamically_stable",
                "en": {"cc": "Soft watery motions 4 times today, requesting rehydration sachets", "sym": "No blood or slime in stool, no dizziness on standing up, skin pinch snaps back instantly"},
                "hi": {"cc": "आज चार बार पतले दस्त हुए, ओआरएस के पैकेट लेने आए हैं", "sym": "दस्त में कोई खून या आंव नहीं, खड़े होने पर चक्कर नहीं, चमड़ी में पूरा लचीलापन"},
                "or": {"cc": "ଆଜି ୪ ଥର ପାତଳା ଝାଡ଼ା ହୋଇଛି, ଓଆରଏସ୍ ପ୍ୟାକେଟ୍ ନେବାକୁ ଆସିଛନ୍ତି", "sym": "ଝାଡ଼ାରେ ରକ୍ତ ବା ଆମ୍ବ ନାହିଁ, ଛିଡ଼ା ହେଲେ ମୁଣ୍ଡ ବୁଲାଉ ନାହିଁ, ଚମଡ଼ାରେ ଟାଣ ଅଛି"}
            },
            {
                "sub_id": "T04",
                "concepts": "self_limiting_diarrhea; afebrile; passing_urine_normally",
                "en": {"cc": "Loose stomach since yesterday evening, urinating normally every few hours", "sym": "Passing clear straw-colored urine, feels hungry for light soup, walking briskly without aid"},
                "hi": {"cc": "कल शाम से पेट खराब, पेशाब हर दो-तीन घंटे में खुलकर आ रहा है", "sym": "पेशाब का रंग साफ, हल्की खिचड़ी खाने की इच्छा, आराम से चल-फिर रहे हैं"},
                "or": {"cc": "କାଲି ସନ୍ଧ୍ୟାରୁ ପେଟ ଖରାପ, ପ୍ରତି କିଛି ଘଣ୍ଟାରେ ସଫା ପରିସ୍ରା ହେଉଛି", "sym": "ପରିସ୍ରାର ରଙ୍ଗ ପରିଷ୍କାର, ଯାଉ ଖାଇବାକୁ ଇଚ୍ଛା, ସ୍ୱାଭାବିକ ଭାବେ ଚାଲୁଛନ୍ତି"}
            },
            {
                "sub_id": "T05",
                "concepts": "transient_enteritis; mild_abdominal_cramp; oral_tolerance_good",
                "en": {"cc": "Mild stomach gripe and 3 loose motions after wedding dinner", "sym": "Cramp lasts a minute then passes, tolerating electrolyte fluids, temperature 36.8C"},
                "hi": {"cc": "शादी के खाने के बाद पेट में हल्का मरोड़ और तीन बार दस्त", "sym": "मरोड़ एक मिनट रहता है फिर ठीक, पानी-नींबू पानी पच रहा है, बुखार नहीं"},
                "or": {"cc": "ବାହାଘର ଭୋଜି ପରେ ପେଟରେ ସାମାନ୍ୟ କାମୁଡ଼ା ଓ ତିନି ଥର ଝାଡ଼ା", "sym": "କାମୁଡ଼ା ମିନିଟେ ପରେ ଛାଡ଼ିଯାଉଛି, ଲେମ୍ବୁ ପାଣି ପିଉଛନ୍ତି, ଜ୍ୱର ନାହିଁ"}
            }
        ]
    },

    # 9. Localized Superficial Folliculitis / Small Boil
    {
        "family_id": "FAM_GRN_09",
        "concept_id": "CONCEPT_SUPERFICIAL_FOLLICULITIS",
        "urgency": "GREEN",
        "min_age": 16, "max_age": 60,
        "pain_min": 1, "pain_max": 3,
        "duration_hours": [48.0, 72.0, 96.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 84), "sbp": r_int(112, 128), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "punctate_pustule; hair_follicle_erythema; no_spreading_cellulitis; afebrile; non_fluctuant",
                "en": {"cc": "Pimply painful bump with tiny white head on outer thigh for 3 days", "sym": "Single 5mm red papule centered on hair follicle, no surrounding red flush, no fever, no groin lumps"},
                "hi": {"cc": "जांघ पर तीन दिन से बालों की जड़ में छोटी फुंसी और सफेद कील", "sym": "छोटी सी 5 मिमी की लाल फुंसी, आसपास कोई फैलाव नहीं, छूने पर हल्की टीस, बुखार नहीं"},
                "or": {"cc": "ଜଙ୍ଘ ଉପରେ ତିନି ଦିନ ହେଲା ବାଳ ମୂଳରେ ଛୋଟ ବଥ ଓ ଧଳା ମୁନ", "sym": "ଛୋଟ ୫ ମିମି ଲାଲ୍ ଫୋଟକା, ଚାରିପାଖକୁ ମାଡ଼ିନାହିଁ, ସାମାନ୍ୟ କଷ୍ଟ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "shaving_folliculitis_chin; superficial_pustules; localized",
                "en": {"cc": "Cluster of itchy red razor bumps under chin after wet shave", "sym": "Multiple tiny pustules on neck beard area, mildly itchy, completely superficial, energetic"},
                "hi": {"cc": "दाढ़ी बनाने के बाद ठुड्डी के नीचे लाल दाने और हल्की खुजली", "sym": "रेजर लगने से गर्दन पर छोटे-छोटे सफेद दाने, कोई गहरी गांठ नहीं, बुखार नहीं"},
                "or": {"cc": "ଦାଢ଼ି କାଟିବା ପରେ ଥୋଡ଼ି ତଳେ ଲାଲ୍ ଫୋଟକା ଦାନା ଓ କୁଣ୍ଡାଇ ହେବା", "sym": "ବ୍ଲେଡ୍ ବାଜି ଛୋଟ ଛୋଟ ପୂଜ ଦାନା, କୌଣସି ଗଭୀର ଫୁଲା ନାହିଁ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "isolated_furuncle_early; pointed_head; local_tenderness",
                "en": {"cc": "Small tender boil on buttock hurting when sitting on hard chair", "sym": "Single pea-sized firm nodule with yellow point, no red streaks, walked into clinic normally"},
                "hi": {"cc": "कूल्हे पर छोटा फोड़ा जिसके कारण सख्त कुर्सी पर बैठने में चुभन", "sym": "मटर के दाने जितना फोड़ा जिसमें पीला मुंह बन रहा है, कोई बुखार या फैलाव नहीं"},
                "or": {"cc": "ନିତମ୍ବରେ ଛୋଟ ବଥ ଯୋଗୁଁ କଠିନ ଚୌକିରେ ବସିଲା ବେଳେ କଷ୍ଟ", "sym": "ମଟର ଦାନା ଭଳି ଛୋଟ ବଥ ଯେଉଁଥିରେ ହଳଦିଆ ମୁହଁ ହୋଇଛି, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "superficial_skin_infection_minor; localized; clean_margins",
                "en": {"cc": "Inflamed red pore on upper arm from ingrown hair", "sym": "Tiny ingrown hair coiled inside red spot, mild prickle on pressure, no drainage, afebrile"},
                "hi": {"cc": "बांह पर बाल फंसने से लाल दाना और हल्की चुभन", "sym": "अंदर मुड़ा हुआ बाल साफ दिख रहा, दबाने पर हल्का दर्द, कोई मवाद या फैलाव नहीं"},
                "or": {"cc": "ବାହୁ ଉପରେ ବାଳ ବୁଲିଯିବା ଯୋଗୁଁ ଲାଲ୍ ଦାନା ଓ ସାମାନ୍ୟ କଷ୍ଟ", "sym": "ଭିତରେ ମୋଡ଼ି ହୋଇଥିବା ବାଳ, ଚିପିଲେ ସାମାନ୍ୟ ବିନ୍ଧା, ପୂଜ ନାହିଁ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "sweat_folliculitis; mild_pruritus; circumscribed",
                "en": {"cc": "Prickly heat pimples across upper back after gym workout", "sym": "Tiny itchy pinpoint red spots on sweaty skin, improving after cool shower, vitals normal"},
                "hi": {"cc": "जिम में पसीना आने के बाद पीठ के ऊपरी हिस्से में घमौरियां और फुंसियां", "sym": "पसीने से छोटे लाल दाने, ठंडे पानी से नहाने पर आराम, शरीर का तापमान बिल्कुल सामान्य"},
                "or": {"cc": "ବ୍ୟାୟାମରେ ଝାଳ ବୋହିବା ପରେ ପିଠିରେ ଝାଳବଥ ଓ କୁଣ୍ଡାଇ ହେବା", "sym": "ଛୋଟ ଲାଲ୍ ଦାନା, ଥଣ୍ଡା ପାଣିରେ ଗାଧୋଇଲେ ଆରାମ, ଦେହର ଉତ୍ତାପ ସ୍ୱାଭାବିକ"}
            }
        ]
    },

    # 10. Mild Ankle Inversion Strain (Grade 1 Sprain)
    {
        "family_id": "FAM_GRN_10",
        "concept_id": "CONCEPT_MILD_ANKLE_SPRAIN",
        "urgency": "GREEN",
        "min_age": 14, "max_age": 65,
        "pain_min": 2, "pain_max": 4,
        "duration_hours": [2.0, 4.0, 12.0, 24.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(114, 130), "dbp": r_int(70, 84),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "grade_1_inversion_sprain; minimal_lateral_swelling; able_to_bear_weight_immediately; no_bony_malleolar_tenderness",
                "en": {"cc": "Turned left ankle outward on garden step, walking with slight limp but bearing full weight", "sym": "Puffy swelling over anterior talofibular ligament, no bone pain on tapping ankle bones, took 10 steps immediately after twist"},
                "hi": {"cc": "सीढ़ी से उतरते समय बायां टखना हल्का मुड़ना, थोड़ा लंगड़ाकर पूरा वजन रख पा रहे हैं", "sym": "टखने के आगे हल्की सूजन, टखने की हड्डी पर कोई दर्द नहीं, मुड़ने के तुरंत बाद 10 कदम चले थे"},
                "or": {"cc": "ପାହାଚରୁ ବାମ ଗୋଇଠି ସାମାନ୍ୟ ମୋଡ଼ି ହେବା, ସାମାନ୍ୟ ଛୋଟେଇ ପୂରା ଭାର ଦେଇ ଚାଲିପାରୁଛନ୍ତି", "sym": "ଗୋଇଠି ଆଗରେ ହାଲୁକା ଫୁଲା, ହାଡ଼ ଉପରେ କଷ୍ଟ ନାହିଁ, ମୋଡ଼ି ହେବା ପରେ ନିଜେ ଚାଲିଲେ"}
            },
            {
                "sub_id": "T02",
                "concepts": "ligamentous_stretch_mild; lateral_soft_tissue_puffiness; weight_bearing_intact",
                "en": {"cc": "Mild ankle twist during jogging, wants compression crepe bandage", "sym": "Slight tenderness to side of ankle, walked home 1 km without crutches, toes warm and moving"},
                "hi": {"cc": "दौड़ते समय टखने में मामूली मोच, गरम पट्टी बंधवाने आए हैं", "sym": "टखने के किनारे हल्का दर्द, 1 किमी पैदल चलकर घर पहुंचे, उंगलियां पूरी चल रही हैं"},
                "or": {"cc": "ଦୌଡ଼ିବା ବେଳେ ଗୋଇଠିରେ ସାମାନ୍ୟ ମୋଚ, ଗରମ ପଟି ବାନ୍ଧିବାକୁ ଆସିଛନ୍ତି", "sym": "ଗୋଇଠି କଡ଼ରେ ସାମାନ୍ୟ କଷ୍ଟ, ୧ କିମି ଚାଲି ଘରକୁ ଗଲେ, ଆଙ୍ଗୁଠି ଚଳୁଛି"}
            },
            {
                "sub_id": "T03",
                "concepts": "ankle_strain_walkable; ecchymosis_minimal; full_plantarflexion",
                "en": {"cc": "Minor wobble off high curb with sore foot outside edge", "sym": "Trace yellow-blue bruising below ankle knob, can stand on tiptoes with minor discomfort"},
                "hi": {"cc": "ऊंचे फुटपाथ से पैर फिसलने पर पंजे के बाहरी किनारे में हल्का दर्द", "sym": "टखने के नीचे हल्का नीला निशान, पंजों के बल खड़े होने में हल्का खिंचाव, चल पा रहे हैं"},
                "or": {"cc": "ରାସ୍ତା କଡ଼ରୁ ଖସି ପାଦର ବାହାର ପାଖରେ ସାମାନ୍ୟ ବିନ୍ଧା", "sym": "ଗୋଇଠି ତଳେ ହାଲୁକା ନୀଳ ଚିହ୍ନ, ଆଙ୍ଗୁଠି ଭରା ଦେଇ ଛିଡ଼ା ହୋଇପାରୁଛନ୍ତି"}
            },
            {
                "sub_id": "T04",
                "concepts": "soft_tissue_twist_ankle; ice_responsive; mobile",
                "en": {"cc": "Twisted ankle while stepping out of auto, improved after ice pack", "sym": "Mild soreness around outer ankle strap, swelling went down with ice, normal shoe fits"},
                "hi": {"cc": "ऑटो से उतरते समय टखना मुड़ा, बर्फ लगाने से काफी आराम मिला", "sym": "टखने के पास हल्का दर्द, बर्फ से सूजन कम हुई, जूता आराम से आ रहा है"},
                "or": {"cc": "ଅଟୋରୁ ଓହ୍ଲାଇବା ବେଳେ ଗୋଇଠି ମୋଡ଼ି ହେଲା, ବରଫ ସେକ ପରେ ଆରାମ", "sym": "ଗୋଇଠି ପାଖରେ ସାମାନ୍ୟ କଷ୍ଟ, ବରଫରେ ଫୁଲା କମିଲା, ଜୋତା ପିନ୍ଧି ହେଉଛି"}
            },
            {
                "sub_id": "T05",
                "concepts": "simple_ligament_sprain; ambulatory_ottawa_negative; stable",
                "en": {"cc": "Stretched foot tendon during yoga class, able to walk into room", "sym": "Tender soft spot in front of lateral bone, no navicular tenderness, no limp"},
                "hi": {"cc": "योग करते समय पैर में हल्का खिंचाव, चलकर डॉक्टर के कमरे में पहुंचे", "sym": "हड्डी के आगे नरम जगह पर हल्का दर्द, कोई लंगड़ाहट नहीं, खुद चलकर आए"},
                "or": {"cc": "ଯୋଗାସନ ବେଳେ ପାଦ ଟାଣି ହୋଇଗଲା, ନିଜେ ଚାଲି ଡାକ୍ତରଖାନା ଆସିଲେ", "sym": "ହାଡ଼ ଆଗରେ ନରମ ସ୍ଥାନରେ ସାମାନ୍ୟ କଷ୍ଟ, ଛୋଟେଇବା ନାହିଁ, ଚାଲିବୁଲି ପାରୁଛନ୍ତି"}
            }
        ]
    }
]
