"""
Triage V3: GREEN Presentation Families (Part 3: Families 11 to 20)
"""

def r_int(low, high):
    import random
    return random.randint(low, high)

def r_float(low, high, dec=1):
    import random
    return round(random.uniform(low, high), dec)

GREEN_FAMILIES_PART3 = [
    # 11. Impacted Cerumen / Earwax
    {
        "family_id": "FAM_GRN_11",
        "concept_id": "CONCEPT_IMPACTED_CERUMEN",
        "urgency": "GREEN",
        "min_age": 14, "max_age": 80,
        "pain_min": 1, "pain_max": 2,
        "duration_hours": [72.0, 168.0, 336.0],
        "vitals_func": lambda: {
            "hr": r_int(66, 84), "sbp": r_int(114, 130), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "muffled_hearing_unilateral; ear_fullness; no_ear_discharge; no_otalgia_severe; afebrile",
                "en": {"cc": "Blocked feeling and muffled hearing in right ear after swimming pool bath", "sym": "Right ear feels plugged like cotton wool, hearing reduced, no sharp pain, no fluid or blood draining, afebrile"},
                "hi": {"cc": "स्विमिंग पूल में नहाने के बाद दाहिने कान में भारीपन और कम सुनाई देना", "sym": "कान में रुई फंसी होने जैसा अहसास, कोई तेज दर्द नहीं, कोई मवाद या पानी नहीं बह रहा, बुखार नहीं"},
                "or": {"cc": "ପୋଖରୀରେ ଗାଧୋଇବା ପରେ ଡାହାଣ କାନ ବନ୍ଦ ଲାଗିବା ଓ କମ ଶୁଭିବା", "sym": "କାନ ଭିତରେ ତୁଳା ପଶିଲା ଭଳି ଭାରୀ, ତୀବ୍ର କଷ୍ଟ ନାହିଁ, ପାଣି ବା ରକ୍ତ ବୋହୁନାହିଁ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "wax_plug_ear; conductively_muffled; no_vertigo",
                "en": {"cc": "Gradual deafness in left ear from hard wax accumulation", "sym": "Using cotton buds made blockage worse, ear canal feels tightly plugged, no spinning dizziness"},
                "hi": {"cc": "बाएं कान में मैल जमने से धीरे-धीरे आवाज कम सुनाई देना", "sym": "ईयरबड लगाने से कान और बंद हो गया, कान में मैल का डाट, कोई चक्कर नहीं आ रहा"},
                "or": {"cc": "ବାମ କାନରେ ଖଇଳ ଜମି ଧୀରେ ଧୀରେ କମ ଶୁଣାଯିବା", "sym": "ତୁଳା କାଠି ମାରିବାରୁ କାନ ଆହୁରି ବନ୍ଦ ହୋଇଗଲା, କାନ ଭିତର ବନ୍ଦ, ମୁଣ୍ଡ ବୁଲାଉ ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "cerumen_impaction; request_ear_syringing; asymptomatic_otherwise",
                "en": {"cc": "Ear syringing request for longstanding hardened earwax", "sym": "Mild echo of own voice in left ear, no fever, no sore throat, feels perfectly well"},
                "hi": {"cc": "कान का पुराना सूखा मैल साफ करवाने के लिए आए हैं", "sym": "बोलते समय अपनी आवाज कान में गूंजना, बुखार या गले में दर्द नहीं, मरीज बिल्कुल स्वस्थ"},
                "or": {"cc": "କାନର ଶୁଖିଲା ଖଇଳ ସଫା କରିବା ପାଇଁ ଡାକ୍ତରଖାନା ଆସିଛନ୍ତି", "sym": "ନିଜ କଥା କାନ ଭିତରେ ପ୍ରତିଧ୍ୱନିତ ହେବା, ଜ୍ୱର ବା ଗଳା କଷ୍ଟ ନାହିଁ, ସମ୍ପୂର୍ଣ୍ଣ ସୁସ୍ଥ"}
            },
            {
                "sub_id": "T04",
                "concepts": "aural_fullness; autophony; no_infection_signs",
                "en": {"cc": "Sensation of water trapped inside ear canal for 4 days", "sym": "Tickling sensation in outer ear, no redness of earlobe, normal balance"},
                "hi": {"cc": "चार दिन से कान के अंदर पानी भरा होने जैसा अहसास", "sym": "कान में हल्की सरसराहट, कान की बाहरी त्वचा सामान्य, संतुलन बिल्कुल ठीक"},
                "or": {"cc": "୪ ଦିନ ହେଲା କାନ ଭିତରେ ପାଣି ପଶି ରହିଲା ଭଳି ଲାଗିବା", "sym": "କାନ ଭିତରେ ସାମାନ୍ୟ କୁତୁକୁତୁ, କାନ ବାହାର ଲାଲ୍ ନାହିଁ, ଚାଲିବାରେ ସନ୍ତୁଳନ ଠିକ୍"}
            },
            {
                "sub_id": "T05",
                "concepts": "cerumen_obstruction; auditory_muffle; stable",
                "en": {"cc": "Decreased hearing in telephone ear due to wax buildup", "sym": "Struggles to hear phone on right side, no tinnitus, no earache, vitals completely normal"},
                "hi": {"cc": "कान में मैल के कारण फोन पर बात सुनने में परेशानी", "sym": "दाहिनी तरफ से फोन की आवाज धीमी लगना, कान में सीटी की आवाज नहीं, कोई दर्द नहीं"},
                "or": {"cc": "କାନରେ ଖଇଳ ଯୋଗୁଁ ଫୋନ୍ ଶୁଣିବାରେ ଅସୁବିଧା ହେବା", "sym": "ଡାହାଣ କାନରେ ଫୋନ୍ ଶୁଣି ହେଉନାହିଁ, ସାଁ-ସାଁ ଶବ୍ଦ ନାହିଁ, କାନ ବିନ୍ଧା ନାହିଁ"}
            }
        ]
    },

    # 12. Minor Aphthous Stomatitis / Mouth Canker Sore
    {
        "family_id": "FAM_GRN_12",
        "concept_id": "CONCEPT_APHTHOUS_STOMATITIS",
        "urgency": "GREEN",
        "min_age": 12, "max_age": 60,
        "pain_min": 2, "pain_max": 4,
        "duration_hours": [24.0, 48.0, 72.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(112, 128), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "single_oral_canker_sore; inner_lip_ulcer_3mm; painful_with_spicy_food; no_neck_lymphadenopathy; afebrile",
                "en": {"cc": "Painful small white sore inside lower lip stinging when eating spicy curry", "sym": "Single 3mm round ulcer with red halo, stinging with salt or lime, no fever, neck glands not enlarged, normal speech"},
                "hi": {"cc": "निचले होंठ के अंदर छोटा सफेद छाला जो मसालेदार खाना खाने पर जलता है", "sym": "3 मिमी का गोल सफेद छाला, नमक या नींबू लगने पर तेज जलन, बुखार नहीं, गर्दन में कोई गांठ नहीं"},
                "or": {"cc": "ତଳ ଓଠ ଭିତରେ ଛୋଟ ଧଳା ଘା' ଯାହା ରାଗ ତରକାରୀ ଖାଇଲେ ପୋଡୁଛି", "sym": "୩ ମିମି ଗୋଲାକାର ଧଳା ଘା', ଲୁଣ ବା ଲେମ୍ବୁ ବାଜିଲେ ପୋଡ଼ିବା, ଜ୍ୱର ନାହିଁ, ବେକରେ ଗାଣ୍ଠି ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "aphthous_ulcer_tongue; localized_stinging; healthy_mucosa",
                "en": {"cc": "Small tender blister on tip of tongue after accidental tooth bite", "sym": "Shallow greyish ulcer bed, hurts when tongue rubs teeth, eating bland khichdi comfortably"},
                "hi": {"cc": "दांत से जीभ कटने के बाद जीभ की नोक पर दर्द भरा छाला", "sym": "दांत छूने पर हल्का दर्द, सादा खिचड़ी आराम से खा रहे हैं, बुखार बिल्कुल नहीं"},
                "or": {"cc": "ଦାନ୍ତ ବାଜି କଟିଯିବା ପରେ ଜିଭ ଅଗରେ ଛୋଟ ଯନ୍ତ୍ରଣାଦାୟକ ଘା'", "sym": "ଦାନ୍ତରେ ଘଷି ହେଲେ ବିନ୍ଧା, ସାଧାରଣ ଯାଉ ସହଜରେ ଖାଉଛନ୍ତି, ଜ୍ୱର ଆଦୌ ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "buccal_mucosa_canker; minor_aphthae; gel_request",
                "en": {"cc": "Inner cheek mouth ulcer requesting soothing pain relief gel", "sym": "Single ulcer on buccal mucosa, clean margins, drinks milk without pain, afebrile"},
                "hi": {"cc": "गाल के अंदर छाला, दर्द कम करने वाला जेल लेने के लिए आए हैं", "sym": "गाल की अंदरूनी सतह पर एक छाला, दूध आराम से पी पा रहे हैं, बुखार नहीं"},
                "or": {"cc": "ଗାଲ ଭିତରେ ଛୋଟ ଘା', ଆରାମ ଦେବା ପାଇଁ ମଲମ ଦରକାର", "sym": "ଗାଲ ଚମଡ଼ାରେ ଗୋଟିଏ ଛୋଟ ଘା', କ୍ଷୀର ଆରାମରେ ପିଉଛନ୍ତି, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "recurrent_aphthous_minor; localized; good_hydration",
                "en": {"cc": "Familiar recurring mouth ulcer during exam revision week", "sym": "Heals typically in 5 days, drinks plenty of water, speaks normally, no rash on hands or feet"},
                "hi": {"cc": "परीक्षा की पढ़ाई के दौरान मुंह में फिर से वही पुराना छाला निकलना", "sym": "चार-पांच दिन में खुद ठीक हो जाता है, पानी खूब पी रहे हैं, हाथ-पैरों पर कोई दाने नहीं"},
                "or": {"cc": "ପରୀକ୍ଷା ଚାପ ସମୟରେ ପାଟିରେ ପୁଣି ସେହି ପୁରୁଣା ଘା' ବାହାରିବା", "sym": "୫ ଦିନରେ ନିଜେ ଭଲ ହୋଇଯାଏ, ପ୍ରଚୁର ପାଣି ପିଉଛନ୍ତି, ହାତଗୋଡ଼ରେ ଦାଗ ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "mild_stomatitis; stinging_on_citrus; normal_vitals",
                "en": {"cc": "Stinging gum sore when drinking orange juice", "sym": "Punctate 2mm superficial ulcer near molar tooth, teeth clean and firm, vitals normal"},
                "hi": {"cc": "संतरे का जूस पीने पर मसूड़े में तेज जलन और टीस", "sym": "दाढ़ के पास 2 मिमी का छोटा छाला, दांत मजबूत हैं, शरीर का तापमान बिल्कुल सामान्य"},
                "or": {"cc": "କମଳା ରସ ପିଇଲା ବେଳେ ମାଢ଼ିରେ ପୋଡ଼ାଜଳା ଓ କଷ୍ଟ", "sym": "ଦାନ୍ତ ପାଖରେ ୨ ମିମି ଛୋଟ ଘା', ଦାନ୍ତ ଶକ୍ତ ଅଛି, ଦେହର ଉତ୍ତାପ ସ୍ୱାଭାବିକ"}
            }
        ]
    },

    # 13. Subacute Mechanical Neck Stiffness (Wry Neck / Torticollis)
    {
        "family_id": "FAM_GRN_13",
        "concept_id": "CONCEPT_MECHANICAL_NECK_STIFFNESS",
        "urgency": "GREEN",
        "min_age": 18, "max_age": 60,
        "pain_min": 2, "pain_max": 4,
        "duration_hours": [12.0, 24.0, 48.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 86), "sbp": r_int(112, 130), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "mechanical_torticollis; sleeping_awkwardly; sternocleidomastoid_spasm; no_meningismus; no_fever; no_photophobia",
                "en": {"cc": "Woke up with stiff tilted neck and muscular ache after sleeping awkwardly on travel pillow", "sym": "Tight knot in side of neck muscle, hurts when turning head to right, chin can touch chest when asked, no fever, no headache, no photophobia"},
                "hi": {"cc": "यात्रा में गलत तरीके से सोने के बाद सुबह गर्दन अकड़ जाना और एक तरफ मुड़ना", "sym": "गर्दन की नस में गांठ जैसा खिंचाव, दाईं ओर मुड़ाने में दर्द, ठुड्डी छाती से छू सकती है, बुखार या तेज सिरदर्द नहीं"},
                "or": {"cc": "ଯାତ୍ରା ବେଳେ ବେକ ବଙ୍କା କରି ଶୋଇବା ପରେ ସକାଳୁ ବେକ ଜାମ ହୋଇ ବିନ୍ଧିବା", "sym": "ବେକ ମାଂସପେଶୀରେ ଶକ୍ତ ଗଣ୍ଠି, ଡାହାଣକୁ ବୁଲାଇଲେ କଷ୍ଟ, ଥୋଡ଼ି ଛାତି ଛୁଇଁପାରୁଛି, ଜ୍ୱର ବା ମୁଣ୍ଡବିନ୍ଧା ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "acute_wry_neck; trapezius_tightness; warm_compress_responsive",
                "en": {"cc": "Painful neck spasm from cold AC draft blowing onto neck all night", "sym": "Holding shoulder slightly raised, eases after hot shower, arms fully strong, alert"},
                "hi": {"cc": "रात भर एसी की सीधी हवा लगने से गर्दन की नस चढ़ जाना", "sym": "कंधा थोड़ा उचका कर रखना पड़ रहा है, गर्म पानी से नहाने पर आराम, हाथों में पूरी ताकत"},
                "or": {"cc": "ରାତିସାରା ଏସି ପବନ ବାଜି ବେକ ମାଂସ ଟାଣି ହୋଇ କଷ୍ଟ", "sym": "କାନ୍ଧ ସାମାନ୍ୟ ଉଠାଇ ରଖିଛନ୍ତି, ଗରମ ପାଣିରେ ଗାଧୋଇଲେ ଉପଶମ, ହାତରେ ସମ୍ପୂର୍ଣ୍ଣ ଶକ୍ତି"}
            },
            {
                "sub_id": "T03",
                "concepts": "cervical_myofascial_spasm; lateral_flexion_limited; alert",
                "en": {"cc": "Stiff neck after long highway driving yesterday, turning whole body to see", "sym": "Rotates torso instead of neck to look sideways, paraspinal muscles tender, no numbness"},
                "hi": {"cc": "कल लंबी गाड़ी चलाने के बाद गर्दन का घूमना बंद होना", "sym": "बगल में देखने के लिए पूरा शरीर घुमाना पड़ रहा है, नस में खिंचाव, हाथों में कोई सुन्नपन नहीं"},
                "or": {"cc": "କାଲି ବହୁତ ବାଟ ଗାଡ଼ି ଚଳାଇବା ପରେ ବେକ ବୁଲାଇ ନପାରିବା", "sym": "ପାଖକୁ ଦେଖିବା ପାଇଁ ପୂରା ଶରୀର ବୁଲାଉଛନ୍ତି, ମାଂସପେଶୀ ଦରଜ, ହାତ କାଲୁଆ ନୁହେଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "muscular_neck_crick; localized_trapezius; good_general_condition",
                "en": {"cc": "Crick in left neck after sudden jerk while looking behind", "sym": "Sharp catch on quick movement, neck moves forward and back easily, no pins and needles"},
                "hi": {"cc": "पीछे मुड़कर देखते समय अचानक गर्दन में झटका और दर्द", "sym": "अचानक हिलाने पर टीस, आगे-पीछे आसानी से मुड़ रही है, कोई झनझनाहट नहीं"},
                "or": {"cc": "ପଛକୁ ଚାହିଁବା ବେଳେ ବେକରେ ହଠାତ୍ ଝଟକା ଲାଗି କଷ୍ଟ", "sym": "ହଠାତ୍ ହଲାଇଲେ ବିନ୍ଧା, ଆଗପଛ ସହଜରେ ହେଉଛି, ଝିମଝିମ ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "torticollis_benign; postural_origin; walking_normally",
                "en": {"cc": "Uncomfortable stiff neck from studying on bed with laptop", "sym": "Gentle massage brings relief, walking with normal upright posture, temperature 36.6C"},
                "hi": {"cc": "बिस्तर पर लेटकर लैपटॉप चलाने से गर्दन में अकड़न", "sym": "हल्की मालिश से राहत, चलने-फिरने का तरीका सामान्य, बुखार बिल्कुल नहीं"},
                "or": {"cc": "ଖଟରେ ଶୋଇ ଲାପଟପ୍ ଦେଖିବା ଯୋଗୁଁ ବେକ ଜକଡ଼ି ଯିବା", "sym": "ସାମାନ୍ୟ ମାଲିସ କଲେ ଆରାମ, ଚାଲିଚଳଣ ସ୍ୱାଭାବିକ, ଉତ୍ତାପ ସ୍ୱାଭାବିକ"}
            }
        ]
    },

    # 14. Mild Contact Dermatitis
    {
        "family_id": "FAM_GRN_14",
        "concept_id": "CONCEPT_CONTACT_DERMATITIS",
        "urgency": "GREEN",
        "min_age": 14, "max_age": 65,
        "pain_min": 1, "pain_max": 2,
        "duration_hours": [24.0, 48.0, 72.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 84), "sbp": r_int(112, 128), "dbp": r_int(70, 82),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "pruritic_erythematous_plaque; watch_strap_nickel_allergy; localized_wrist; no_systemic_symptoms; afebrile",
                "en": {"cc": "Itchy red square rash on left wrist right under metal watch buckle", "sym": "Discrete red itchy patch with tiny papules matching watch clasp outline, no rash elsewhere, no fever, no facial swelling"},
                "hi": {"cc": "घड़ी के बकल के नीचे बाईं कलाई पर लाल चौकोर दाने और खुजली", "sym": "घड़ी के आकार का लाल निशान, छोटी फुंसियां, शरीर पर कहीं और कोई दाना नहीं, बुखार नहीं"},
                "or": {"cc": "ଘଣ୍ଟା ବେଲ୍ଟ ତଳେ ବାମ କବଜିରେ ଲାଲ୍ ଦାଗ ଓ କୁଣ୍ଡାଇ ହେବା", "sym": "ଘଣ୍ଟା ବକଲ୍ ଆକାରର ନାଲି ପ୍ୟାଚ୍, କୁଣ୍ଡିଆଣି ହେଉଛି, ଅନ୍ୟ କୌଣସି ଜାଗାରେ ଦାଗ ନାହିଁ, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "earlobe_contact_allergy; faux_jewelry; localized_eczema",
                "en": {"cc": "Red peeling earlobes after wearing artificial golden earrings", "sym": "Crusty dry red skin on both ear lobes, itching stopped after removing earrings, no pus"},
                "hi": {"cc": "नकली झुमके पहनने के बाद कान के लोलक पर लाली और पपड़ी", "sym": "दोनों कानों में खुजली और रूखापन, झुमके उतारने के बाद आराम, कोई मवाद नहीं"},
                "or": {"cc": "ନକଲି ଝୁମକା ପିନ୍ଧିବା ପରେ କାନ ଲତି ଲାଲ୍ ପଡ଼ି ଚମଡ଼ା ଉଠିବା", "sym": "ଦୁଇ କାନରେ କୁଣ୍ଡାଇ ଚମଡ଼ା ଶୁଖିଲା, ଝୁମକା କାଢ଼ିବା ପରେ ଶାନ୍ତ, ପୂଜ ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "belt_buckle_dermatitis; pruritus; sharply_demarcated",
                "en": {"cc": "Itchy red patch on lower tummy where belt metal touches skin", "sym": "Oval red eczematous plaque below belly button, very itchy, no systemic symptoms"},
                "hi": {"cc": "नाभि के नीचे बेल्ट का बकल लगने वाली जगह पर लाल चकत्ता और खुजली", "sym": "गोल लाल निशान, काफी खुजली, बकल हटाने पर आराम, बुखार या कमजोरी नहीं"},
                "or": {"cc": "ନାଭି ତଳେ ବେଲ୍ଟ ବାଜୁଥିବା ଜାଗାରେ ନାଲି ଚିହ୍ନ ଓ କୁଣ୍ଡାଇ ହେବା", "sym": "ଗୋଲ ନାଲି ପ୍ୟାଚ୍, କୁଣ୍ଡିଆଣି ହେଉଛି, ବେଲ୍ଟ କାଢ଼ିଲେ ଆଶ୍ୱସ୍ତି, ଜ୍ୱର ନାହିଁ"}
            },
            {
                "sub_id": "T04",
                "concepts": "detergent_hand_irritant; dry_fissures; localized_pruritus",
                "en": {"cc": "Dry rough itchy palms after washing clothes with new strong detergent", "sym": "Superficial flaking on fingers, skin dry and stinging with lemon, improves with coconut oil"},
                "hi": {"cc": "सर्फ से कपड़े धोने के बाद हाथों की चमड़ी रूखी, लाल और खुजलीदार", "sym": "उंगलियों की चमड़ी उतरना, नारियल तेल लगाने से आराम, कोई छाले या मवाद नहीं"},
                "or": {"cc": "ନୂଆ ସର୍ଫରେ ଲୁଗା ସଫା ପରେ ହାତ ପାପୁଲି ଶୁଖି ଖସଖସ ଓ କୁଣ୍ଡାଇ ହେବା", "sym": "ଚମଡ଼ା ଛାଲିବା, ନଡ଼ିଆ ତେଲ ଲଗାଇଲେ ଆରାମ, ଫୋଟକା ବା ପୂଜ ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "plant_contact_rash_mild; linear_pruritic_papules; afebrile",
                "en": {"cc": "Streaky red itchy lines on forearm after trimming garden weeds", "sym": "Scratch-like red line of itchy bumps, no blisters, no shortness of breath, comfortable"},
                "hi": {"cc": "बगीचे में घास साफ करने के बाद हाथ पर लाल खुजलीदार धारियां", "sym": "घास लगने से लकीर जैसे लाल दाने, कोई फफोला नहीं, सांस बिल्कुल सामान्य"},
                "or": {"cc": "ବଗିଚାରେ ଘାସ ସଫା କରିବା ପରେ ହାତରେ ନାଲି ଗାର ଓ କୁଣ୍ଡାଇ ହେବା", "sym": "ଘାସ ବାଜି ଲମ୍ବା ଲାଲ୍ ଦାନା, ଫୋଟକା ନାହିଁ, ନିଶ୍ୱାସ ସ୍ୱାଭାବିକ"}
            }
        ]
    },

    # 15. Chronic Bilateral Tinnitus
    {
        "family_id": "FAM_GRN_15",
        "concept_id": "CONCEPT_CHRONIC_TINNITUS",
        "urgency": "GREEN",
        "min_age": 40, "max_age": 80,
        "pain_min": 0, "pain_max": 1,
        "duration_hours": [336.0, 720.0, 2160.0],
        "vitals_func": lambda: {
            "hr": r_int(68, 84), "sbp": r_int(120, 138), "dbp": r_int(74, 86),
            "spo2": r_int(98, 100), "temp": r_float(36.5, 37.1), "rr": r_int(14, 18)
        },
        "templates": [
            {
                "sub_id": "T01",
                "concepts": "bilateral_high_pitched_tinnitus; gradual_onset_months; non_pulsatile; stable_hearing; no_vertigo",
                "en": {"cc": "Continuous high-pitched ringing sound in both ears noticed for 3 months especially at night", "sym": "Steady cicada-like hiss, more noticeable in quiet bedroom, speech hearing preserved, no dizzy spinning, no ear pain"},
                "hi": {"cc": "तीन महीने से दोनों कानों में लगातार सीटी जैसी आवाज, खासकर रात में", "sym": "रात के सन्नाटे में झींगुर जैसी आवाज सुनाई देना, सुनने में कोई खास कमी नहीं, चक्कर नहीं आते, कोई दर्द नहीं"},
                "or": {"cc": "୩ ମାସ ହେଲା ଦୁଇ କାନରେ ଝିଁ-ଝିଁ ଶବ୍ଦ ଶୁଭିବା, ବିଶେଷ କରି ରାତିରେ", "sym": "ଶାନ୍ତ ପରିବେଶରେ ଝିଣ୍ଟିକା ଶବ୍ଦ ଭଳି ଲାଗିବା, କଥା ଶୁଣି ହେଉଛି, ମୁଣ୍ଡ ବୁଲାଉ ନାହିଁ, କାନ ବିନ୍ଧା ନାହିଁ"}
            },
            {
                "sub_id": "T02",
                "concepts": "sensorineural_tinnitus_presbycusis; bilateral_cricket_sound; stable",
                "en": {"cc": "Persistent whistling noise inside ears requesting hearing advice", "sym": "Constant faint whistle since retirement, fan sound masks it partially, no sudden drop in hearing"},
                "hi": {"cc": "कानों में हल्की सीटी बजने की आवाज, कान की जांच के लिए आए हैं", "sym": "पंखे की आवाज में यह दब जाती है, अचानक बहरापन नहीं हुआ, कोई कान का दर्द नहीं"},
                "or": {"cc": "କାନ ଭିତରେ ସାମାନ୍ୟ ସୁସୁରି ଶବ୍ଦ, ପରୀକ୍ଷା ପାଇଁ ଆସିଛନ୍ତି", "sym": "ପଙ୍ଖା ଶବ୍ଦରେ କମିଯାଏ, ହଠାତ୍ କାଲ ହୋଇନାହିଁ, କାନରେ କୌଣସି କଷ୍ଟ ନାହିଁ"}
            },
            {
                "sub_id": "T03",
                "concepts": "subacute_tinnitus; bilateral; no_neurological_symptoms",
                "en": {"cc": "Bilateral ringing after attending loud festival wedding 2 weeks ago", "sym": "Both ears ringing quietly, slowly fading over days, walks upright with good balance"},
                "hi": {"cc": "शादी में लाउडस्पीकर सुनने के बाद दो हफ्ते से कानों में गूंज", "sym": "दोनों कानों में हल्की सनसनाहट जो धीरे-धीरे घट रही है, संतुलन ठीक है, बुखार नहीं"},
                "or": {"cc": "ବାହାଘର ବାଜା ଶୁଣିବା ପରେ ଦୁଇ ସପ୍ତାହ ହେଲା କାନରେ ଗୁଣୁଗୁଣୁ ଶବ୍ଦ", "sym": "ଦୁଇ କାନରେ ହାଲୁକା ଶବ୍ଦ ଯାହା ଧୀରେ ଧୀରେ କମୁଛି, ଚାଲିବାରେ ସନ୍ତୁଳନ ଠିକ୍"}
            },
            {
                "sub_id": "T04",
                "concepts": "non_pulsatile_tinnitus; symmetrical; no_headache",
                "en": {"cc": "Gentle buzzing sound in head when lying down to sleep", "sym": "Non-pulsatile humming tone, blood pressure normal, speech crystal clear, alert"},
                "hi": {"cc": "रात को सोने लेटते समय सिर में हल्की भिनभिनाहट की आवाज", "sym": "लगातार एक सुर की आवाज, बीपी सामान्य, बातचीत बिल्कुल साफ, कोई सिरदर्द नहीं"},
                "or": {"cc": "ରାତିରେ ଶୋଇବା ବେଳେ ମୁଣ୍ଡ ଭିତରେ ଭୁଁ-ଭୁଁ ଶବ୍ଦ ଶୁଭିବା", "sym": "ଲଗାତାର ସମାନ ସ୍ୱରର ଶବ୍ଦ, ରକ୍ତଚାପ ସ୍ୱାଭାବିକ, କଥାବାର୍ତ୍ତା ସ୍ପଷ୍ଟ, ମୁଣ୍ଡବିନ୍ଧା ନାହିଁ"}
            },
            {
                "sub_id": "T05",
                "concepts": "chronic_ear_ringing; insomnia_secondary; ambulatory",
                "en": {"cc": "Ringing in ears making it hard to fall asleep, requesting sleep aids", "sym": "Noise present throughout day but annoying at bedtime, appetite normal, no ear discharge"},
                "hi": {"cc": "कान में आवाज आने से नींद आने में परेशानी, नींद की सलाह चाहिए", "sym": "दिन में काम करते समय ध्यान नहीं जाता, रात को महसूस होना, कान से कोई मवाद नहीं"},
                "or": {"cc": "କାନରେ ଶବ୍ଦ ଯୋଗୁଁ ନିଦ ଆସିବାରେ ଅସୁବିଧା, ପରାମର୍ଶ ଦରକାର", "sym": "ଦିନସାରା ଧ୍ୟାନ ରହୁନାହିଁ କିନ୍ତୁ ଶୋଇବା ବେଳେ ବାଧୁଛି, କାନରୁ ପୂଜ ନାହିଁ"}
            }
        ]
    }
]
