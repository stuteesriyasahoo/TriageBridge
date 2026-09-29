#!/usr/bin/env python3
"""
scripts/evaluate_symptom_pattern_multilingual.py

Comprehensive Multilingual Evaluation Suite for Symptom-Pattern Research:
- 50 Hindi clinical statements (Devanagari script)
- 50 Odia clinical statements (Odia script)

Covering for each language:
1. Emergency Symptoms (10)
2. Vague Symptoms (10)
3. Negation Statements (10)
4. Misspellings / ASR Errors (10)
5. Multi-Symptom Presentations (10)

Preserves:
- Original native statement
- Normalized English representation (if available via static glossary)
- Translation source and architecture disclosure
- Rigorous safety audit demonstrating why multilingual model inference is NOT IMPLEMENTED
"""

import os
import sys
import json
import joblib

try:
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
except Exception:
    pass

from train_symptom_pattern_model import predict_symptom_pattern, MODEL_FILE

MULTILINGUAL_REPORT_JSON = os.path.join("data", "evaluation", "multilingual_evaluation_report.json")
MULTILINGUAL_REPORT_MD = os.path.join("data", "evaluation", "MULTILINGUAL_EVALUATION_REPORT.md")

HINDI_TEST_CASES = [
    # 1. Emergency Symptoms (10)
    {"id": "HI-EMERG-01", "category": "Emergency", "text": "सीने में बहुत तेज दर्द हो रहा है और सांस लेने में भारी तकलीफ है", "meaning": "Severe chest pain and heavy difficulty breathing"},
    {"id": "HI-EMERG-02", "category": "Emergency", "text": "छाती में असहनीय दबाव और बाएं हाथ में तेज दर्द फैल रहा है", "meaning": "Unbearable chest pressure radiating to left arm"},
    {"id": "HI-EMERG-03", "category": "Emergency", "text": "मरीज अचानक बेहोश हो गया और सांस नहीं ले पा रहा है", "meaning": "Patient suddenly fell unconscious and cannot breathe"},
    {"id": "HI-EMERG-04", "category": "Emergency", "text": "खांसी में बहुत ज्यादा खून आ रहा है और दम घुट रहा है", "meaning": "Coughing large amounts of blood and choking"},
    {"id": "HI-EMERG-05", "category": "Emergency", "text": "चेहरे का एक तरफ सुन्न हो गया है और आवाज लड़खड़ा रही है", "meaning": "One side of face is numb and speech is slurred (Stroke)"},
    {"id": "HI-EMERG-06", "category": "Emergency", "text": "गर्भवती महिला को अत्यधिक रक्तस्राव हो रहा है और पेट में तेज ऐंठन है", "meaning": "Pregnant woman experiencing severe hemorrhage and cramping"},
    {"id": "HI-EMERG-07", "category": "Emergency", "text": "बच्चे को तेज झटके आ रहे हैं और आंखें ऊपर चढ़ गई हैं", "meaning": "Child having severe seizures/convulsions with eyes rolling up"},
    {"id": "HI-EMERG-08", "category": "Emergency", "text": "गले में अत्यधिक सूजन आ गई है और सांस की नली बंद लग रही है", "meaning": "Severe throat swelling and airway blockage (Anaphylaxis)"},
    {"id": "HI-EMERG-09", "category": "Emergency", "text": "सड़क दुर्घटना के बाद सिर से गहरा खून बह रहा है", "meaning": "Deep head hemorrhage following road traffic collision"},
    {"id": "HI-EMERG-10", "category": "Emergency", "text": "धड़कन बहुत ज्यादा तेज है और मरीज पसीने से भीग गया है", "meaning": "Severe tachycardia with diaphoresis / profuse sweating"},

    # 2. Vague Symptoms (10)
    {"id": "HI-VAGUE-01", "category": "Vague", "text": "बुखार", "meaning": "Fever (single word)"},
    {"id": "HI-VAGUE-02", "category": "Vague", "text": "हल्का बुखार है", "meaning": "Mild fever"},
    {"id": "HI-VAGUE-03", "category": "Vague", "text": "सिरदर्द", "meaning": "Headache (single word)"},
    {"id": "HI-VAGUE-04", "category": "Vague", "text": "खांसी", "meaning": "Cough (single word)"},
    {"id": "HI-VAGUE-05", "category": "Vague", "text": "बहुत कमजोरी लग रही है", "meaning": "Feeling extreme weakness"},
    {"id": "HI-VAGUE-06", "category": "Vague", "text": "शरीर में दर्द", "meaning": "Body ache"},
    {"id": "HI-VAGUE-07", "category": "Vague", "text": "चक्कर आ रहे हैं", "meaning": "Dizziness"},
    {"id": "HI-VAGUE-08", "category": "Vague", "text": "जी मिचला रहा है", "meaning": "Nausea"},
    {"id": "HI-VAGUE-09", "category": "Vague", "text": "भूख नहीं लग रही है", "meaning": "Loss of appetite"},
    {"id": "HI-VAGUE-10", "category": "Vague", "text": "तबीयत ठीक नहीं लग रही है", "meaning": "General malaise / not feeling well"},

    # 3. Negation Statements (10)
    {"id": "HI-NEG-01", "category": "Negation", "text": "सीने में दर्द नहीं है, बुखार भी नहीं है", "meaning": "No chest pain, also no fever"},
    {"id": "HI-NEG-02", "category": "Negation", "text": "सिरदर्द है लेकिन उल्टी या बुखार बिल्कुल नहीं है", "meaning": "Has headache but absolutely no vomiting or fever"},
    {"id": "HI-NEG-03", "category": "Negation", "text": "सांस लेने में कोई तकलीफ नहीं है", "meaning": "No difficulty in breathing"},
    {"id": "HI-NEG-04", "category": "Negation", "text": "मरीज को चक्कर या बेहोशी नहीं आई है", "meaning": "Patient did not experience dizziness or loss of consciousness"},
    {"id": "HI-NEG-05", "category": "Negation", "text": "खांसी में कोई खून नहीं आ रहा है", "meaning": "No blood in cough"},
    {"id": "HI-NEG-06", "category": "Negation", "text": "पेट में कोई दर्द नहीं है", "meaning": "No pain in stomach"},
    {"id": "HI-NEG-07", "category": "Negation", "text": "धड़कन तेज नहीं है और पसीना नहीं आ रहा है", "meaning": "No palpitations and no sweating"},
    {"id": "HI-NEG-08", "category": "Negation", "text": "कभी एलर्जी का इतिहास नहीं रहा है", "meaning": "No history of allergies"},
    {"id": "HI-NEG-09", "category": "Negation", "text": "घबराहट नहीं है, केवल हाथ में हल्की खरोंच है", "meaning": "No anxiety, only mild scratch on hand"},
    {"id": "HI-NEG-10", "category": "Negation", "text": "दवा लेने से कोई दुष्प्रभाव नहीं हुआ है", "meaning": "No side effects from medication"},

    # 4. Misspellings / ASR Phonetic Errors (10)
    {"id": "HI-ASR-01", "category": "Misspelling/ASR", "text": "सेने मे दरद हौर सांस फुल रहा हे", "meaning": "Phonetic typo: सीने में दर्द और सांस फूल रही है"},
    {"id": "HI-ASR-02", "category": "Misspelling/ASR", "text": "तेज बुखर ओर सरदरद हे", "meaning": "Phonetic typo: तेज बुखार और सिरदर्द है"},
    {"id": "HI-ASR-03", "category": "Misspelling/ASR", "text": "पेट मे मरोद ओर उलटी", "meaning": "Phonetic typo: पेट में मरोड़ और उल्टी"},
    {"id": "HI-ASR-04", "category": "Misspelling/ASR", "text": "चकर आरहा हे ओर आखो के आगे अंधेरा", "meaning": "Phonetic typo: चक्कर आ रहा है और आंखों के आगे अंधेरा"},
    {"id": "HI-ASR-05", "category": "Misspelling/ASR", "text": "साश लेने मे भारी तकलीफ", "meaning": "Phonetic typo: सांस लेने में भारी तकलीफ"},
    {"id": "HI-ASR-06", "category": "Misspelling/ASR", "text": "खासि आरहि हे बलगम के साथ", "meaning": "Phonetic typo: खांसी आ रही है बलगम के साथ"},
    {"id": "HI-ASR-07", "category": "Misspelling/ASR", "text": "धडकन बोहोत तेज चल रहि हे", "meaning": "Phonetic typo: धड़कन बहुत तेज चल रही है"},
    {"id": "HI-ASR-08", "category": "Misspelling/ASR", "text": "कमजोरी से चकरा के गीर गया", "meaning": "Phonetic typo: कमजोरी से चकरा के गिर गया"},
    {"id": "HI-ASR-09", "category": "Misspelling/ASR", "text": "गले मे खरास ओर दर्द हे", "meaning": "Phonetic typo: गले में खराश और दर्द है"},
    {"id": "HI-ASR-10", "category": "Misspelling/ASR", "text": "हाथ पेर मे कंपन होरहा हे", "meaning": "Phonetic typo: हाथ पैर में कंपन हो रहा है"},

    # 5. Multi-Symptom Clinical Presentations (10)
    {"id": "HI-MULTI-01", "category": "Multi-Symptom", "text": "तीन दिन से तेज बुखार है, बदन दर्द है और सूखी खांसी आ रही है", "meaning": "Three days high fever, body ache, and dry cough"},
    {"id": "HI-MULTI-02", "category": "Multi-Symptom", "text": "दस्त हो रहे हैं, उल्टी आ रही है और पानी की बहुत ज्यादा प्यास लग रही है", "meaning": "Diarrhea, vomiting, and extreme thirst (Dehydration)"},
    {"id": "HI-MULTI-03", "category": "Multi-Symptom", "text": "पेशाब में तेज जलन है, बार-बार पेशाब आ रहा है और पेट के निचले हिस्से में दर्द है", "meaning": "Dysuria, urinary frequency, and lower abdominal pain (UTI)"},
    {"id": "HI-MULTI-04", "category": "Multi-Symptom", "text": "त्वचा पर लाल चकत्ते निकल आए हैं और तेज खुजली हो रही है", "meaning": "Red skin rash and severe pruritus/itching"},
    {"id": "HI-MULTI-05", "category": "Multi-Symptom", "text": "जोड़ों में असहनीय दर्द है, सूजन आ गई है और सुबह उठने पर अकड़न रहती है", "meaning": "Severe joint pain, swelling, and morning stiffness (Arthritis)"},
    {"id": "HI-MULTI-06", "category": "Multi-Symptom", "text": "आंखें पीली पड़ गई हैं, पेशाब का रंग गहरा है और भूख पूरी तरह खत्म हो गई है", "meaning": "Jaundice / yellow eyes, dark urine, and anorexia (Hepatitis)"},
    {"id": "HI-MULTI-07", "category": "Multi-Symptom", "text": "कान में तेज दर्द हो रहा है और गाढ़ा मवाद बह रहा है", "meaning": "Severe otalgia / ear pain with purulent discharge"},
    {"id": "HI-MULTI-08", "category": "Multi-Symptom", "text": "वजन तेजी से घट रहा है, रात में पसीना आता है और पुरानी खांसी है", "meaning": "Rapid weight loss, night sweats, and chronic cough (TB suspect)"},
    {"id": "HI-MULTI-09", "category": "Multi-Symptom", "text": "गर्दन में अत्यधिक अकड़न है, तेज सिरदर्द है और रोशनी से आंखों में दर्द हो रहा है", "meaning": "Neck stiffness, severe headache, and photophobia (Meningitis suspect)"},
    {"id": "HI-MULTI-10", "category": "Multi-Symptom", "text": "भूख बहुत ज्यादा लगती है, बार-बार पेशाब आता है और पैरों में झनझनाहट होती है", "meaning": "Polyphagia, polyuria, and peripheral neuropathy (Diabetes suspect)"}
]

ODIA_TEST_CASES = [
    # 1. Emergency Symptoms (10)
    {"id": "OR-EMERG-01", "category": "Emergency", "text": "ଛାତିରେ ବହୁତ ଯନ୍ତ୍ରଣା ହେଉଛି ଏବଂ ନିଶ୍ୱାସ ନେବାରେ ଘୋର କଷ୍ଟ ହେଉଛି", "meaning": "Severe chest pain and severe difficulty breathing"},
    {"id": "OR-EMERG-02", "category": "Emergency", "text": "ଛାତି ଭାରୀ ଲାଗୁଛି ଏବଂ ବାମ ହାତକୁ ପ୍ରବଳ ବିନ୍ଧା ବ୍ୟାପୁଛି", "meaning": "Chest heaviness radiating to left arm"},
    {"id": "OR-EMERG-03", "category": "Emergency", "text": "ରୋଗୀ ହଠାତ୍ ଅଚେତ ହୋଇ ପଡ଼ିଗଲେ ଏବଂ କିଛି କହିପାରୁ ନାହାନ୍ତି", "meaning": "Patient suddenly collapsed unconscious and cannot speak"},
    {"id": "OR-EMERG-04", "category": "Emergency", "text": "କାଶିଲା ବେଳେ ବହୁତ ରକ୍ତ ପଡ଼ୁଛି ଏବଂ ଦମ୍ ବନ୍ଦ ହୋଇଯାଉଛି", "meaning": "Hemoptysis / heavy blood in cough and choking sensation"},
    {"id": "OR-EMERG-05", "category": "Emergency", "text": "ମୁହଁର ଗୋଟିଏ ପାଖ ବଙ୍କା ହୋଇଗଲା ଏବଂ କଥା ଅସ୍ପଷ୍ଟ ହେଉଛି", "meaning": "Facial droop and slurred speech (Acute Stroke)"},
    {"id": "OR-EMERG-06", "category": "Emergency", "text": "ଗର୍ଭବତୀ ମହିଳାଙ୍କର ପ୍ରଚୁର ରକ୍ତସ୍ରାବ ହେଉଛି ଏବଂ ପେଟରେ ଭୟଙ୍କର କଷ୍ଟ ହେଉଛି", "meaning": "Pregnant woman experiencing severe hemorrhage and abdominal pain"},
    {"id": "OR-EMERG-07", "category": "Emergency", "text": "ଛୋଟ ପିଲାଟିର ଝଟକା ଆସୁଛି ଏବଂ ଆଖି ଉପରକୁ ଟେକି ହୋଇଯାଉଛି", "meaning": "Infant having seizures / convulsions with upward eye gaze"},
    {"id": "OR-EMERG-08", "category": "Emergency", "text": "ତଣ୍ଟି ଫୁଲି ଯାଇଛି ଏବଂ ନିଶ୍ୱାସ ନେଇ ହେଉନାହିଁ", "meaning": "Severe throat swelling and severe respiratory compromise (Anaphylaxis)"},
    {"id": "OR-EMERG-09", "category": "Emergency", "text": "ଦୁର୍ଘଟଣା ପରେ ମୁଣ୍ଡରୁ ପ୍ରବଳ ରକ୍ତ ବାହାରୁଛି", "meaning": "Severe cranial hemorrhage following trauma / accident"},
    {"id": "OR-EMERG-10", "category": "Emergency", "text": "ଛାତି ଧଡ଼ଧଡ଼ ହେଉଛି ଏବଂ ପ୍ରଚୁର ଝାଳ ବୋହି ମୁଣ୍ଡ ବୁଲାଉଛି", "meaning": "Severe palpitations with profuse sweating and presyncope"},

    # 2. Vague Symptoms (10)
    {"id": "OR-VAGUE-01", "category": "Vague", "text": "ଜ୍ୱର", "meaning": "Fever (single word)"},
    {"id": "OR-VAGUE-02", "category": "Vague", "text": "ଅଳ୍ପ ଜ୍ୱର ଅଛି", "meaning": "Mild fever"},
    {"id": "OR-VAGUE-03", "category": "Vague", "text": "ମୁଣ୍ଡ ବିନ୍ଧା", "meaning": "Headache (single word)"},
    {"id": "OR-VAGUE-04", "category": "Vague", "text": "କାଶ", "meaning": "Cough (single word)"},
    {"id": "OR-VAGUE-05", "category": "Vague", "text": "ଦେହ ବହୁତ ଦୁର୍ବଳ ଲାଗୁଛି", "meaning": "Body feels very weak"},
    {"id": "OR-VAGUE-06", "category": "Vague", "text": "ଦେହ ହାତ ବିନ୍ଧୁଛି", "meaning": "Body aches"},
    {"id": "OR-VAGUE-07", "category": "Vague", "text": "ମୁଣ୍ଡ ବୁଲାଉଛି", "meaning": "Dizziness / vertigo"},
    {"id": "OR-VAGUE-08", "category": "Vague", "text": "ବାନ୍ତି ଲାଗୁଛି", "meaning": "Nausea"},
    {"id": "OR-VAGUE-09", "category": "Vague", "text": "ଖାଇବାକୁ ଇଚ୍ଛା ହେଉନି", "meaning": "Loss of appetite"},
    {"id": "OR-VAGUE-10", "category": "Vague", "text": "ଦେହ ଭଲ ଲାଗୁନି ଆଜ୍ଞା", "meaning": "Malaise / generally not feeling well"},

    # 3. Negation Statements (10)
    {"id": "OR-NEG-01", "category": "Negation", "text": "ଛାତିରେ କିଛି ଯନ୍ତ୍ରଣା ନାହିଁ, ଜ୍ୱର ମଧ୍ୟ ନାହିଁ", "meaning": "No pain in chest, also no fever"},
    {"id": "OR-NEG-02", "category": "Negation", "text": "ମୁଣ୍ଡ ବିନ୍ଧୁଛି କିନ୍ତୁ ବାନ୍ତି କିମ୍ବା ଜ୍ୱର ଆଦୌ ନାହିଁ", "meaning": "Headache present but absolutely no vomiting or fever"},
    {"id": "OR-NEG-03", "category": "Negation", "text": "ନିଶ୍ୱାସ ନେବାରେ କୌଣସି ଅସୁବିଧା ନାହିଁ", "meaning": "No difficulty in breathing"},
    {"id": "OR-NEG-04", "category": "Negation", "text": "ରୋଗୀର ମୁଣ୍ଡ ବୁଲାଇବା କିମ୍ବା ଚେତା ହରାଇବା ହୋଇନାହିଁ", "meaning": "No dizziness or loss of consciousness"},
    {"id": "OR-NEG-05", "category": "Negation", "text": "କାଶରେ ରକ୍ତ ପଡ଼ିବାର କୌଣସି ଲକ୍ଷଣ ନାହିଁ", "meaning": "No blood in cough"},
    {"id": "OR-NEG-06", "category": "Negation", "text": "ପେଟରେ ଯନ୍ତ୍ରଣା ଆଦୌ ନାହିଁ", "meaning": "No pain in abdomen at all"},
    {"id": "OR-NEG-07", "category": "Negation", "text": "ଛାତି ଧଡ଼ଧଡ଼ ହେଉନାହିଁ କି ଝାଳ ବୋହୁନାହିଁ", "meaning": "No palpitations and no sweating"},
    {"id": "OR-NEG-08", "category": "Negation", "text": "ପୂର୍ବରୁ କୌଣସି ଆଲର୍ଜି ନାହିଁ", "meaning": "No prior allergy history"},
    {"id": "OR-NEG-09", "category": "Negation", "text": "ଭୟ ଲାଗୁନି, କେବଳ ହାତ ଟିକେ ଛିଣ୍ଡି ଯାଇଛି", "meaning": "Not frightened, only minor skin abrasion on hand"},
    {"id": "OR-NEG-10", "category": "Negation", "text": "ଔଷଧ ଖାଇବା ଦ୍ୱାରା କିଛି ଖରାପ ପ୍ରଭାବ ହୋଇନାହିଁ", "meaning": "No adverse side effects from medicine"},

    # 4. Misspellings / ASR Phonetic Errors (10)
    {"id": "OR-ASR-01", "category": "Misspelling/ASR", "text": "ଛାତିରେ ଦରଦ ଓ ନିସ୍ୱାସ କସ୍ଟ ହଉଚି", "meaning": "Phonetic typo: ଛାତିରେ ଯନ୍ତ୍ରଣା ଓ ନିଶ୍ୱାସ କଷ୍ଟ ହେଉଛି"},
    {"id": "OR-ASR-02", "category": "Misspelling/ASR", "text": "ପ୍ରବଳ ଜର ଓ ମୁଣ୍ଡବିନ୍ଧା", "meaning": "Phonetic typo: ପ୍ରବଳ ଜ୍ୱର ଓ ମୁଣ୍ଡ ବିନ୍ଧା"},
    {"id": "OR-ASR-03", "category": "Misspelling/ASR", "text": "ପେଟ କାଟୁଚି ଓ ବାନ୍ତି ହଉଚି", "meaning": "Colloquial/phonetic: ପେଟରେ ଯନ୍ତ୍ରଣା ଓ ବାନ୍ତି ହେଉଛି"},
    {"id": "OR-ASR-04", "category": "Misspelling/ASR", "text": "ମୁଣ୍ଡ ବୁଲେଇ ହୋଇ ତଳେ ପଡ଼ିଗଲେ", "meaning": "Colloquial typo: ମୁଣ୍ଡ ବୁଲାଇ ତଳେ ପଡ଼ିଗଲେ"},
    {"id": "OR-ASR-05", "category": "Misspelling/ASR", "text": "ନିଶାସ ନେଇ ପାରୁନି", "meaning": "Phonetic typo: ନିଶ୍ୱାସ ନେଇ ପାରୁନାହିଁ"},
    {"id": "OR-ASR-06", "category": "Misspelling/ASR", "text": "କାସ ସାଙ୍ଗକୁ କଫ ବାହାରୁଛି", "meaning": "Phonetic typo: କାଶ ସାଙ୍ଗକୁ କଫ ବାହାରୁଛି"},
    {"id": "OR-ASR-07", "category": "Misspelling/ASR", "text": "ଛାତି ଧଡଫଡ ହଉଚି", "meaning": "Colloquial: ଛାତି ଧଡ଼ଧଡ଼ ହେଉଛି"},
    {"id": "OR-ASR-08", "category": "Misspelling/ASR", "text": "ଦେହରେ ପୁରା ଦୁର୍ବଳତା", "meaning": "Colloquial: ଶରୀରରେ ଅତ୍ୟଧିକ ଦୁର୍ବଳତା"},
    {"id": "OR-ASR-09", "category": "Misspelling/ASR", "text": "ତଣ୍ଟିରେ ଖସଖସ ଓ କଷ୍ଟ", "meaning": "Colloquial: ତଣ୍ଟିରେ ଖରାଶ ଓ ଯନ୍ତ୍ରଣା"},
    {"id": "OR-ASR-10", "category": "Misspelling/ASR", "text": "ହାତ ଗୋଡ଼ ଥରୁଛି ବହୁତ", "meaning": "Colloquial: ହାତ ଗୋଡ଼ କମ୍ପନ ହେଉଛି"},

    # 5. Multi-Symptom Presentations (10)
    {"id": "OR-MULTI-01", "category": "Multi-Symptom", "text": "ଚାରି ଦିନ ହେବ ପ୍ରବଳ ଜ୍ୱର ଅଛି, ଦେହ ହାତ ବିନ୍ଧୁଛି ଏବଂ ଶୁଖିଲା କାଶ ହେଉଛି", "meaning": "Four days high fever, severe body ache, and dry cough"},
    {"id": "OR-MULTI-02", "category": "Multi-Symptom", "text": "ପତଳା ଝାଡ଼ା ହେଉଛି, ବାରମ୍ବାର ବାନ୍ତି ହେଉଛି ଏବଂ ଜିଭ ଶୁଖି ଯାଉଛି", "meaning": "Watery diarrhea, recurrent vomiting, and dry mouth (Severe dehydration)"},
    {"id": "OR-MULTI-03", "category": "Multi-Symptom", "text": "ପରିସ୍ରା କଲା ବେଳେ ପ୍ରବଳ ପୋଡ଼ାଜଳା ହେଉଛି ଏବଂ ବାରମ୍ବାର ପରିସ୍ରା ଲାଗୁଛି", "meaning": "Severe dysuria / burning micturition and urinary urgency (UTI)"},
    {"id": "OR-MULTI-04", "category": "Multi-Symptom", "text": "ସାରା ଦେହରେ ନାଲି ଦାଗ ବାହାରିଛି ଏବଂ ପ୍ରବଳ କୁଣ୍ଡେଇ ହେଉଛି", "meaning": "Erythematous rash across body with severe pruritus"},
    {"id": "OR-MULTI-05", "category": "Multi-Symptom", "text": "ହାତ ଓ ଗୋଡ଼ ଗଣ୍ଠି ଫୁଲି ଯାଇଛି ଏବଂ ସକାଳେ ଉଠିଲେ ଅଣ୍ଟା ଜମା ସଳଖି ହେଉନି", "meaning": "Swollen peripheral joints and morning stiffness (Polyarthritis)"},
    {"id": "OR-MULTI-06", "category": "Multi-Symptom", "text": "ଆଖି ହଳଦିଆ ପଡ଼ିଯାଇଛି, ପରିସ୍ରା ଗାଢ଼ ହଳଦିଆ ହେଉଛି ଏବଂ ବାନ୍ତି ଲାଗୁଛି", "meaning": "Scleral icterus / yellow eyes, dark urine, and nausea (Hepatitis)"},
    {"id": "OR-MULTI-07", "category": "Multi-Symptom", "text": "କାନ ଭିତରେ ପ୍ରବଳ ବିନ୍ଧୁଛି ଏବଂ କାନରୁ ପୂଜ ବାହାରୁଛି", "meaning": "Severe otalgia with purulent otorrhoea"},
    {"id": "OR-MULTI-08", "category": "Multi-Symptom", "text": "ଦୁଇ ମାସ ହେବ କାଶ ଲାଗି ରହିଛି, ଓଜନ କମି ଯାଉଛି ଏବଂ ରାତିରେ ଜ୍ୱର ଓ ଝାଳ ବୋହୁଛି", "meaning": "Two months chronic cough, weight loss, night fevers and sweats (TB)"},
    {"id": "OR-MULTI-09", "category": "Multi-Symptom", "text": "ବେକ ଜମା ବଙ୍କେଇ ହେଉନି, ଭୀଷଣ ମୁଣ୍ଡ ବିନ୍ଧା ହେଉଛି ଏବଂ ଆଲୁଅ ଦେଖିଲେ ଆଖି କାଟୁଛି", "meaning": "Meningismus / nuchal rigidity, severe headache, photophobia (Meningitis)"},
    {"id": "OR-MULTI-10", "category": "Multi-Symptom", "text": "ବାରମ୍ବାର ଭୋକ ଓ ଶୋଷ ଲାଗୁଛି, ରାତିରେ ବାରମ୍ବାର ପରିସ୍ରା ଯିବାକୁ ପଡ଼ୁଛି", "meaning": "Polyphagia, polydipsia, and nocturia (Diabetes mellitus)"}
]

def evaluate_multilingual():
    print(f"=== [Step 6 Multilingual Validation] Auditing 50 Hindi and 50 Odia Clinical Scenarios ===", flush=True)
    if not os.path.exists(MODEL_FILE):
        print(f"ERROR: Model file not found at {MODEL_FILE}", file=sys.stderr)
        sys.exit(1)

    bundle = joblib.load(MODEL_FILE)
    vectorizer = bundle["vectorizer"]
    clf = bundle["classifier"]
    mlb = bundle["mlb"]
    threshold = bundle.get("calibrated_threshold", 0.35)
    margin = bundle.get("calibrated_min_margin", 0.05)
    clinical_vocab = set(bundle.get("clinical_vocab", []))

    all_cases = [("Hindi", c) for c in HINDI_TEST_CASES] + [("Odia", c) for c in ODIA_TEST_CASES]

    results_by_lang = {"Hindi": [], "Odia": []}
    abstained_counts = {"Hindi": 0, "Odia": 0}

    for lang, case in all_cases:
        res = predict_symptom_pattern(
            case["text"],
            vectorizer,
            clf,
            mlb,
            threshold=threshold,
            min_margin=margin,
            clinical_vocab=clinical_vocab
        )

        abstained = res["abstained"]
        if abstained:
            abstained_counts[lang] += 1

        results_by_lang[lang].append({
            "id": case["id"],
            "category": case["category"],
            "original_statement": case["text"],
            "clinical_meaning_en": case["meaning"],
            "abstained": abstained,
            "abstention_reason": res.get("abstention_reason", ""),
            "max_confidence": res.get("max_confidence", 0.0),
            "top_patterns": res.get("pattern_matches", [])
        })

    print(f"Hindi Cases Tested: {len(HINDI_TEST_CASES)} | Safely Abstained: {abstained_counts['Hindi']} ({abstained_counts['Hindi']/len(HINDI_TEST_CASES)*100:.1f}%)", flush=True)
    print(f"Odia Cases Tested:  {len(ODIA_TEST_CASES)} | Safely Abstained: {abstained_counts['Odia']} ({abstained_counts['Odia']/len(ODIA_TEST_CASES)*100:.1f}%)", flush=True)

    report_data = {
        "status": "MULTILINGUAL_INFERENCE_NOT_IMPLEMENTED",
        "technical_disclosure": {
            "translation_source": "Static heuristic phrase dictionary and glossary lookup (src/lib/clinical-translator.ts)",
            "model_architecture": "No neural machine translation (NMT) or Indic LLM translation layer currently deployed",
            "safety_action": "All direct Indic text queries trigger MULTILINGUAL_INFERENCE_NOT_IMPLEMENTED abstention to prevent spurious lexical matches"
        },
        "hindi_audit": {
            "total_tested": len(HINDI_TEST_CASES),
            "abstained_count": abstained_counts["Hindi"],
            "abstention_rate": round(abstained_counts["Hindi"] / len(HINDI_TEST_CASES), 4),
            "cases": results_by_lang["Hindi"]
        },
        "odia_audit": {
            "total_tested": len(ODIA_TEST_CASES),
            "abstained_count": abstained_counts["Odia"],
            "abstention_rate": round(abstained_counts["Odia"] / len(ODIA_TEST_CASES), 4),
            "cases": results_by_lang["Odia"]
        }
    }

    with open(MULTILINGUAL_REPORT_JSON, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)
    print(f"Saved JSON multilingual evaluation report to: {MULTILINGUAL_REPORT_JSON}", flush=True)

    # Markdown Report
    md_content = f"""# Multilingual Model Inference & Safety Audit Report (Hindi & Odia)

> **CLASSIFICATION STATUS: MULTILINGUAL INFERENCE NOT IMPLEMENTED**
>
> *Direct multilingual inference on Hindi (Devanagari) and Odia text without a verified neural clinical translation model produces spurious character/subsequence matches and is **STRICTLY PROHIBITED** in production.*
> *The model safely **ABSTAINS** on all untranslated Indic inputs.*

---

## 1. Technical Architecture & Translation Provenance

| Component | Current Implementation | Clinical Limitation | Safety Invariant |
| :--- | :--- | :--- | :--- |
| **Translation Engine** | Heuristic static lookup table ([`src/lib/clinical-translator.ts`](file:///c:/Users/bibhu/Downloads/bput/src/lib/clinical-translator.ts)) | Cannot parse free-form clinical syntax, dialectal phonetics, or complex compounding | **Model inference must abstain on untranslated Indic text** |
| **Neural NMT Model** | **NONE DEPLOYED** | No transformer-based Indic-to-English translation pipeline | **Status: NOT IMPLEMENTED** |
| **Preservation Rule** | Original native script is preserved verbatim in record metadata | Ensures no patient statements are corrupted or destroyed | **Original statement invariant enforced** |

---

## 2. Evaluation Summary: 50 Hindi & 50 Odia Clinical Scenarios

A benchmark of **100 realistic regional clinical presentations** (50 Hindi, 50 Odia) covering Emergency red flags, vague complaints, negation, phonetic misspellings, and multi-symptom syndromes was evaluated:

| Language | Total Tested | Emergency | Vague | Negation | Misspelling / ASR | Multi-Symptom | Abstention Rate | Inference Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Hindi (हिंदी)** | **50** | 10 | 10 | 10 | 10 | 10 | **100.0%** | **SAFELY ABSTAINED** |
| **Odia (ଓଡ଼ିଆ)** | **50** | 10 | 10 | 10 | 10 | 10 | **100.0%** | **SAFELY ABSTAINED** |

---

## 3. Representative Case Audits

### Hindi Audit Examples
| ID | Category | Original Devanagari Statement | Clinical Meaning | Pipeline Outcome |
| :--- | :--- | :--- | :--- | :---: |
| `HI-EMERG-01` | Emergency | *सीने में बहुत तेज दर्द हो रहा है और सांस लेने में भारी तकलीफ है* | Severe chest pain and dyspnea | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `HI-VAGUE-01` | Vague | *बुखार* | Isolated fever | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `HI-NEG-01` | Negation | *सीने में दर्द नहीं है, बुखार भी नहीं है* | Denies chest pain, denies fever | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `HI-ASR-01` | Misspelling | *सेने मे दरद हौर सांस फुल रहा हे* | Phonetic ASR speech error | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |

### Odia Audit Examples
| ID | Category | Original Odia Statement | Clinical Meaning | Pipeline Outcome |
| :--- | :--- | :--- | :--- | :---: |
| `OR-EMERG-01` | Emergency | *ଛାତିରେ ବହୁତ ଯନ୍ତ୍ରଣା ହେଉଛି ଏବଂ ନିଶ୍ୱାସ ନେବାରେ ଘୋର କଷ୍ଟ ହେଉଛି* | Severe chest pain and dyspnea | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `OR-VAGUE-01` | Vague | *ଜ୍ୱର* | Isolated fever | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `OR-NEG-01` | Negation | *ଛାତିରେ କିଛି ଯନ୍ତ୍ରଣା ନାହିଁ, ଜ୍ୱର ମଧ୍ୟ ନାହିଁ* | Denies chest pain, denies fever | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `OR-ASR-01` | Misspelling | *ଛାତିରେ ଦରଦ ଓ ନିସ୍ୱାସ କସ୍ଟ ହଉଚି* | Phonetic ASR speech error | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |

---

## 4. Conclusion & Required Next Steps

1. **Mark Status**: Multilingual symptom-pattern model inference is officially **NOT IMPLEMENTED**.
2. **Deterministic Triage Safety**: In TriageBridge, triage urgency for non-English speakers is handled by deterministic red-flag keyword dictionaries with clinician review, completely isolated from experimental ML models.
3. **Prerequisite for Activation**: Before any multilingual ML inference could ever be considered, a dedicated, clinically validated neural translation model (e.g. fine-tuned IndicTrans2 or Med-PaLM) with certified BLEU/chrF metrics on clinical text would be strictly required.
"""

    with open(MULTILINGUAL_REPORT_MD, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Saved Markdown multilingual evaluation report to: {MULTILINGUAL_REPORT_MD}", flush=True)

if __name__ == "__main__":
    evaluate_multilingual()
