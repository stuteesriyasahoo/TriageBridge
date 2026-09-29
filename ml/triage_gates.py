"""
TriageBridge Authoritative Clinical Safety Gates (Version 2.0.0)
================================================================
Deterministic Gating Architecture:
- Gate 1: Missing Critical Information -> Deterministic "GREY"
- Gate 2: Emergency Red-Flag Interception -> Deterministic "RED"
- Gate 3: Residual cases (passing both Gate 1 and Gate 2) reach Experimental ML
"""

import math
import re

GATE_VERSION = "2.0.0"

# Missing-Information Keywords and Criteria
RESP_KEYWORDS = [
    'breath', 'breathing', 'dyspnea', 'breathlessness', 'cough', 'wheez', 
    'stridor', 'cyanosis', 'asthma', 'सांस', 'दम', 'खांसी', 'ଶ୍ୱାସ', 'ଦମ', 'ନିଶ୍ୱାସ', 'କାଶ'
]

AMS_KEYWORDS = [
    'confusion', 'confus', 'disorientation', 'disorient', 'altered mental', 'wandering', 'unresponsive',
    'muddled', 'drowsy', 'delirium', 'incoherent', 'भ्रम', 'बहकी', 'ଚେତନା', 'ପ୍ରଳାପ', 'ଅସ୍ଥିର', 'ଅସଙ୍ଗତ'
]

CHEST_KEYWORDS = [
    'chest', 'retrosternal', 'precordial', 'substernal', 'सीने', 'छाती', 'ଛାତି'
]

def _is_empty(val):
    if val is None:
        return True
    if isinstance(val, float) and math.isnan(val):
        return True
    s = str(val).strip()
    return s == '' or s.lower() == 'nan' or s.lower() == 'null'

def _to_float(val):
    if _is_empty(val):
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None

def evaluate_missing_info_gate(encounter: dict) -> tuple[bool, list[str]]:
    """
    Evaluates whether an encounter lacks critical physiological or timeline information.
    Triggers deterministic 'GREY' status when incomplete.
    """
    reasons = []

    # Check direct missing_information metadata field if present
    raw_missing = str(encounter.get('missing_information', '')).strip()
    if raw_missing.lower() == 'none':
        return False, []
    if raw_missing and raw_missing.lower() not in ('nan', 'null', ''):
        for item in raw_missing.split(';'):
            item_clean = item.strip()
            if item_clean.upper().startswith('MISSING_'):
                reasons.append(item_clean)
        if len(reasons) > 0:
            return True, reasons

    hr = _to_float(encounter.get('vitals_heart_rate_bpm'))
    sbp = _to_float(encounter.get('vitals_systolic_bp'))
    dbp = _to_float(encounter.get('vitals_diastolic_bp'))
    spo2 = _to_float(encounter.get('vitals_spo2_percent'))
    temp = _to_float(encounter.get('vitals_temperature_c'))
    rr = _to_float(encounter.get('vitals_respiratory_rate_bpm'))
    age = _to_float(encounter.get('age'))
    dur = _to_float(encounter.get('duration_hours'))

    cc = str(encounter.get('chief_complaint', '')).lower()
    sym = str(encounter.get('symptoms', '')).lower()
    concepts = str(encounter.get('normalized_clinical_concepts', '')).lower()
    combined_text = f"{cc} {sym} {concepts}"

    # Criterion 1: All 6 vital signs missing
    if hr is None and sbp is None and dbp is None and spo2 is None and temp is None and rr is None:
        if "MISSING_ALL_VITAL_SIGNS" not in reasons:
            reasons.append("MISSING_ALL_VITAL_SIGNS")

    # Criterion 2: Hemodynamic baseline absent (both HR and SBP missing)
    if hr is None and sbp is None:
        if "MISSING_HEMODYNAMIC_BASELINE_HR_AND_SBP" not in reasons:
            reasons.append("MISSING_HEMODYNAMIC_BASELINE_HR_AND_SBP")

    # Criterion 3: Respiratory presentation lacking SpO2 measurement
    if any(k in combined_text for k in RESP_KEYWORDS):
        if spo2 is None and "MISSING_SPO2_IN_RESPIRATORY_PRESENTATION" not in reasons:
            reasons.append("MISSING_SPO2_IN_RESPIRATORY_PRESENTATION")

    # Criterion 4: Paediatric patient (<= 5 years) lacking temperature and heart rate
    if age is not None and age <= 5.0:
        if temp is None and hr is None and "MISSING_PAEDIATRIC_VITALS_TEMP_AND_HR" not in reasons:
            reasons.append("MISSING_PAEDIATRIC_VITALS_TEMP_AND_HR")

    # Criterion 5: Altered sensorium / acute confusion lacking oxygenation or vitals
    if any(k in combined_text for k in AMS_KEYWORDS):
        if (spo2 is None or temp is None or rr is None) and "MISSING_VITAL_MONITORING_IN_ALTERED_MENTAL_STATUS" not in reasons:
            reasons.append("MISSING_VITAL_MONITORING_IN_ALTERED_MENTAL_STATUS")

    # Criterion 6: Acute chest pain/tightness lacking hemodynamic readings
    if any(k in combined_text for k in CHEST_KEYWORDS):
        if (sbp is None or hr is None) and "MISSING_HEMODYNAMICS_IN_CHEST_PRESENTATION" not in reasons:
            reasons.append("MISSING_HEMODYNAMICS_IN_CHEST_PRESENTATION")

    is_triggered = len(reasons) > 0
    return is_triggered, reasons


def evaluate_red_flag_gate(encounter: dict) -> tuple[bool, list[str]]:
    """
    Evaluates emergency clinical red flags based on physiological vital thresholds
    and validated acute emergency symptom constellations.
    Triggers deterministic 'RED' status. ML model CANNOT downgrade positive red flags.
    """
    reasons = []

    # Check direct rule_based_red_flags metadata field if present
    raw_rf = str(encounter.get('rule_based_red_flags', '')).strip()
    if raw_rf.upper() == 'NONE':
        return False, []
    if raw_rf and raw_rf.upper() not in ('NAN', 'NULL', ''):
        for item in raw_rf.split(';'):
            item_clean = item.strip()
            if item_clean and item_clean.upper() != 'NONE':
                reasons.append(item_clean)
        if len(reasons) > 0:
            return True, reasons

    hr = _to_float(encounter.get('vitals_heart_rate_bpm'))
    sbp = _to_float(encounter.get('vitals_systolic_bp'))
    dbp = _to_float(encounter.get('vitals_diastolic_bp'))
    spo2 = _to_float(encounter.get('vitals_spo2_percent'))
    temp = _to_float(encounter.get('vitals_temperature_c'))
    rr = _to_float(encounter.get('vitals_respiratory_rate_bpm'))
    age = _to_float(encounter.get('age'))
    preg = str(encounter.get('pregnancy_status', '')).lower()

    cc = str(encounter.get('chief_complaint', '')).lower()
    sym = str(encounter.get('symptoms', '')).lower()
    concepts = str(encounter.get('normalized_clinical_concepts', '')).lower()
    combined_text = f"{cc} {sym} {concepts}"

    # --- A. PHYSIOLOGICAL CRITICAL VITALS THRESHOLDS ---
    # 1. Critical Hypoxia
    if spo2 is not None and spo2 < 90.0:
        reasons.append(f"VITAL_CRITICAL_HYPOXIA: SpO2 {spo2}% < 90%")

    # 2. Decompensated Shock / Severe Hypotension
    if sbp is not None and sbp < 85.0:
        reasons.append(f"VITAL_CRITICAL_HYPOTENSION: SBP {sbp} < 85 mmHg")
    elif dbp is not None and dbp < 45.0:
        reasons.append(f"VITAL_CRITICAL_HYPOTENSION: DBP {dbp} < 45 mmHg")

    # 3. Hypertensive Crisis / Severe Hypertension
    if sbp is not None and sbp >= 200.0:
        reasons.append(f"VITAL_CRITICAL_HYPERTENSION: SBP {sbp} >= 200 mmHg")
    if dbp is not None and dbp >= 120.0:
        reasons.append(f"VITAL_CRITICAL_HYPERTENSION: DBP {dbp} >= 120 mmHg")

    # 4. Critical Tachycardia
    if hr is not None and hr > 160.0:
        reasons.append(f"VITAL_CRITICAL_TACHYCARDIA: HR {hr} > 160 bpm")

    # 5. Critical Bradycardia
    if hr is not None and hr < 40.0:
        reasons.append(f"VITAL_CRITICAL_BRADYCARDIA: HR {hr} < 40 bpm")

    # 6. Critical Tachypnea / Respiratory Exhaustion
    if rr is not None and rr >= 35.0:
        reasons.append(f"VITAL_CRITICAL_TACHYPNEA: RR {rr} >= 35 bpm")

    # 7. Critical Hyperthermia
    if temp is not None and temp >= 40.0:
        reasons.append(f"VITAL_CRITICAL_HYPERTHERMIA: Temp {temp}C >= 40.0C")

    # --- B. CLINICAL ACUTE SYMPTOM RED-FLAG PRESENTATIONS ---
    # 1. Acute Coronary Syndrome / Crushing Retrosternal Chest Pain
    acs_terms = [
        'crushing chest', 'retrosternal crushing', 'radiating to left shoulder', 'radiating to jaw',
        'heavy pressure behind breastbone', 'सीने में अत्यधिक भारीपन', 'छाती के बीच में तेज दबाव',
        'ଛାତିରେ ଅତ୍ୟଧିକ ଚାପ', 'ଛାତି ମଝିରେ ଭୀଷଣ ଯନ୍ତ୍ରଣା'
    ]
    if any(t in combined_text for t in acs_terms):
        reasons.append("RF_CLINICAL_ACUTE_CHEST_PAIN: Acute Coronary Syndrome Suspected")

    # 2. Stroke / FAST (Facial droop, arm weakness, slurred speech)
    stroke_terms = [
        'facial asymmetry', 'facial droop', 'arm weakness', 'inability to lift right arm',
        'slurred speech', 'expressive dysphasia', 'मुंह टेढ़ा', 'दाहिने हाथ में लकवा',
        'बोलने में अत्यधिक लड़खड़ाहट', 'ମୁହଁ ବଙ୍କା', 'ହାତ ଅଚଳ', 'କଥା ସମ୍ପୂର୍ଣ୍ଣ ଅସ୍ପଷ୍ଟ'
    ]
    if any(t in combined_text for t in stroke_terms):
        reasons.append("RF_CLINICAL_STROKE_FAST: Acute Focal Neurological Deficit")

    # 3. Severe Respiratory Distress / Cyanosis / Impending Failure
    resp_distress_terms = [
        'gasping breathlessness', 'peripheral cyanosis', 'respiratory fatigue', 'intercostal indrawing',
        'dusky blue fingernails', 'सांस लेने में भारी कठिनाई', 'होंठ नीले पड़ना', 'पसलियां खिंचना',
        'ତୀବ୍ର ଶ୍ୱାସକଷ୍ଟ', 'ନୀଳ ପଡ଼ିଯିବା', 'ପଞ୍ଜରା ଟାଣି ଧରିବା'
    ]
    if any(t in combined_text for t in resp_distress_terms):
        reasons.append("RF_CLINICAL_RESPIRATORY_DISTRESS: Severe Respiratory Distress and Cyanosis")

    # 4. Anaphylaxis (Angioedema, stridor, bronchospasm, collapse)
    anaphylaxis_terms = [
        'lip swelling', 'angioedema', 'inspiratory stridor', 'insect sting', 'tightness in throat',
        'होंठों में सूजन', 'सांस की नली बंद होना', 'गले में रुकावट', 'घरघराहट',
        'ଓଠ ଫୁଲିବା', 'ଶ୍ୱାସନଳୀ ବନ୍ଦ', 'ଗଳା ବନ୍ଦ'
    ]
    if any(t in combined_text for t in anaphylaxis_terms):
        reasons.append("RF_CLINICAL_ANAPHYLAXIS: Suspected Acute Anaphylaxis / Airway Compromise")

    # 5. Paediatric Sepsis / Purpura Fulminans
    paed_sepsis_terms = [
        'purpuric rash', 'petechial purple spots', 'difficult to rouse', 'cold mottled extremities',
        'जामुनी धब्बे', 'बैंगनी चकत्ते', 'होश में नहीं आ रहा', 'ବାଇଗଣୀ ଦାଗ', 'ଆଖି ଖୋଲୁନାହିଁ'
    ]
    if (age is not None and age <= 12.0) and any(t in combined_text for t in paed_sepsis_terms):
        reasons.append("RF_CLINICAL_PAEDIATRIC_SEPSIS: Paediatric Sepsis with Purpura / Meningococcemia Concern")

    # 6. Severe Hemorrhagic Shock / Massive Hematemesis
    bleed_terms = [
        'vomiting of fresh blood', 'hematemesis', 'massive vomiting', 'postural syncope',
        'खून की उल्टियां', 'ताजा लाल खून', 'ରକ୍ତ ବାନ୍ତି', 'ଲାଲ୍ ରକ୍ତ'
    ]
    if any(t in combined_text for t in bleed_terms):
        reasons.append("RF_CLINICAL_SEVERE_HEMORRHAGE: Massive Active Hemorrhage with Hemodynamic Instability")

    # 7. Hypertensive Emergency with Acute Neurological / End-Organ Signs
    htn_crisis_terms = [
        'explosive occipital headache', 'worst headache of life', 'visual blurring and severe hypertension',
        'सिर के पिछले हिस्से में असहनीय दर्द', 'सिर फटने जैसा भयानक दर्द',
        'ମୁଣ୍ଡ ପଛପଟେ ଅସହ୍ୟ ଯନ୍ତ୍ରଣା', 'ମୁଣ୍ଡ ଫାଟିଯିବା'
    ]
    if any(t in combined_text for t in htn_crisis_terms):
        reasons.append("RF_CLINICAL_HYPERTENSIVE_EMERGENCY: Hypertensive Emergency with Neurological Symptoms")

    # 8. Obstetric Emergency / Eclampsia / Severe Preeclampsia
    obstetric_terms = [
        'third trimester pregnancy', 'severe throbbing headache', 'visual flashing lights',
        'right upper quadrant pain', 'गर्भावस्था के आठवें महीने', 'आंखों के आगे चमक',
        'ଗର୍ଭାବସ୍ଥାରେ ପ୍ରବଳ ମୁଣ୍ଡବିନ୍ଧା', 'ଆଖି ଆଗରେ ଆଲୋକ ଝଲକ'
    ]
    if (preg == 'yes' or any(w in combined_text for w in ['pregnant', 'pregnancy', 'गर्भावस्था', 'ଗର୍ଭାବସ୍ଥା'])) and any(t in combined_text for t in obstetric_terms):
        reasons.append("RF_CLINICAL_PREGNANCY_EMERGENCY: Eclampsia / Severe Preeclampsia Risk")

    # 9. Acute Coma / Unresponsiveness
    coma_terms = ['unconscious', 'coma', 'unresponsive', 'बेहोश', 'ଅଚେତ', 'ଚେତାଶୂନ୍ୟ']
    if any(t in combined_text for t in coma_terms):
        reasons.append("RF_CLINICAL_UNCONSCIOUS: Unresponsiveness / Coma")

    is_triggered = len(reasons) > 0
    return is_triggered, reasons


def evaluate_triage_encounter_gates(encounter: dict) -> dict:
    """
    Main evaluation pipeline for triage encounter safety gating.
    Workflow:
    1. Check missing critical information -> if True: output 'GREY', reached_ml = False
    2. Check emergency red flags -> if True: output 'RED', reached_ml = False
    3. If both pass -> reached_ml = True, deterministic_output = None
    """
    is_missing, missing_reasons = evaluate_missing_info_gate(encounter)
    if is_missing:
        return {
            "missing_gate_triggered": True,
            "missing_gate_reasons": missing_reasons,
            "red_flag_gate_triggered": False,
            "red_flag_reasons": [],
            "reached_ml_layer": False,
            "deterministic_output": "GREY"
        }

    is_rf, rf_reasons = evaluate_red_flag_gate(encounter)
    if is_rf:
        return {
            "missing_gate_triggered": False,
            "missing_gate_reasons": [],
            "red_flag_gate_triggered": True,
            "red_flag_reasons": rf_reasons,
            "reached_ml_layer": False,
            "deterministic_output": "RED"
        }

    return {
        "missing_gate_triggered": False,
        "missing_gate_reasons": [],
        "red_flag_gate_triggered": False,
        "red_flag_reasons": [],
        "reached_ml_layer": True,
        "deterministic_output": None
    }
