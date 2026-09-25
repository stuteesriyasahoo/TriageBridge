"""
TriageBridge Urgency Model Prediction & Safety Gate Service
===========================================================

Safety Architecture:
1. Validate input fields.
2. Detect missing critical information -> Return GREY deterministically.
3. Check deterministic clinical red flags -> Return RED (ML cannot downgrade).
4. Run experimental ML model if safety rules and data completeness pass.
5. Require qualified healthcare-worker review on every outcome.

MANDATORY DISCLAIMER:
“Experimental AI-generated urgency suggestion — not a diagnosis.
Final review must be completed by a qualified healthcare professional.”
"""

import os
import joblib
import pandas as pd
import numpy as np

# Load model pipeline
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'urgency_model.joblib')

_cached_model = None

def get_model():
    global _cached_model
    if _cached_model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        _cached_model = joblib.load(MODEL_PATH)
    return _cached_model


def check_missing_critical_info(encounter):
    """
    Identifies if critical physiological triage data is absent.
    Returns: (is_critical_missing: bool, missing_reasons: list)
    """
    missing = []

    hr = encounter.get('vitals_heart_rate_bpm')
    sbp = encounter.get('vitals_systolic_bp')
    spo2 = encounter.get('vitals_spo2_percent')
    temp = encounter.get('vitals_temperature_c')
    duration = encounter.get('duration_hours')
    cc = str(encounter.get('chief_complaint', '')).lower()
    symptoms = str(encounter.get('symptoms', '')).lower()

    # Rule 1: Both heart rate and systolic BP absent
    if (hr is None or pd.isna(hr) or str(hr).strip() == '') and (sbp is None or pd.isna(sbp) or str(sbp).strip() == ''):
        missing.append("missing_both_hr_and_blood_pressure")

    # Rule 2: Respiratory complaint without SpO2
    resp_keywords = ['breath', 'breathing', 'dyspnea', 'cough', 'wheez', 'stridor', 'सांस', 'ଦମ', 'ନିଶ୍ୱାସ']
    if any(k in cc or k in symptoms for k in resp_keywords):
        if spo2 is None or pd.isna(spo2) or str(spo2).strip() == '':
            missing.append("missing_spo2_in_respiratory_presentation")

    # Rule 3: Infant/child without temperature or HR
    age = encounter.get('age')
    try:
        age_val = float(age) if age is not None else None
    except (ValueError, TypeError):
        age_val = None

    if age_val is not None and age_val <= 5:
        if (temp is None or pd.isna(temp) or str(temp).strip() == '') and (hr is None or pd.isna(hr) or str(hr).strip() == ''):
            missing.append("missing_paediatric_vitals_temp_and_hr")

    # Rule 4: Completely absent vitals
    vitals_keys = [
        'vitals_heart_rate_bpm', 'vitals_systolic_bp', 'vitals_diastolic_bp',
        'vitals_spo2_percent', 'vitals_temperature_c', 'vitals_respiratory_rate_bpm'
    ]
    all_vitals_blank = all(
        encounter.get(k) is None or pd.isna(encounter.get(k)) or str(encounter.get(k)).strip() == ''
        for k in vitals_keys
    )
    if all_vitals_blank:
        missing.append("missing_all_vital_signs")

    return (len(missing) > 0), missing


def check_deterministic_red_flags(encounter):
    """
    Deterministic clinical safety gate:
    Evaluates acute emergency keywords and critical vitals.
    ML model must NEVER override or downgrade a positive red flag!
    """
    red_flags = []
    cc = str(encounter.get('chief_complaint', '')).lower()
    sym = str(encounter.get('symptoms', '')).lower()
    combined = cc + " " + sym

    # 1. Unconsciousness / Coma / Syncope
    unconscious_terms = ['unconscious', 'coma', 'unresponsive', 'not waking up', 'collapsed', 'बेहोश', 'ଅଚେତ', 'ଜ୍ଞାନଶୂନ୍ୟ']
    if any(t in combined for t in unconscious_terms):
        red_flags.append("RF-UNCONSCIOUS: Altered Consciousness / Unresponsiveness")

    # 2. Acute Coronary / Crushing Chest Pain
    chest_terms = ['crushing chest', 'radiating to left', 'radiating to jaw', 'छाती में तेज', 'ଛାତିରେ ଭୀଷଣ']
    if any(t in combined for t in chest_terms):
        red_flags.append("RF-ACUTE-CHEST-PAIN: Suspected Acute Coronary Syndrome")

    # 3. Stroke / FAST
    stroke_terms = ['facial droop', 'arm weakness', 'slurred speech', 'facial asymmetry', 'लकवा', 'ପକ୍ଷାଘାତ', 'ମୁହଁ ବଙ୍କା']
    if any(t in combined for t in stroke_terms):
        red_flags.append("RF-STROKE-FAST: Acute Neurological Deficit (FAST)")

    # 4. Critical Vitals Thresholds
    try:
        spo2 = float(encounter.get('vitals_spo2_percent')) if encounter.get('vitals_spo2_percent') not in [None, ''] else None
        if spo2 is not None and spo2 < 90:
            red_flags.append(f"VITAL-CRITICAL-HYPOXIA: SpO2 {spo2}% < 90%")
    except (ValueError, TypeError):
        pass

    try:
        sbp = float(encounter.get('vitals_systolic_bp')) if encounter.get('vitals_systolic_bp') not in [None, ''] else None
        if sbp is not None:
            if sbp >= 200:
                red_flags.append(f"VITAL-CRITICAL-HYPERTENSION: SBP {sbp} >= 200 mmHg")
            elif sbp < 85:
                red_flags.append(f"VITAL-CRITICAL-HYPOTENSION: SBP {sbp} < 85 mmHg")
    except (ValueError, TypeError):
        pass

    try:
        hr = float(encounter.get('vitals_heart_rate_bpm')) if encounter.get('vitals_heart_rate_bpm') not in [None, ''] else None
        if hr is not None and (hr > 160 or hr < 40):
            red_flags.append(f"VITAL-CRITICAL-HEART-RATE: HR {hr} bpm")
    except (ValueError, TypeError):
        pass

    try:
        temp = float(encounter.get('vitals_temperature_c')) if encounter.get('vitals_temperature_c') not in [None, ''] else None
        if temp is not None and temp >= 40.5:
            red_flags.append(f"VITAL-CRITICAL-HYPERTHERMIA: Temperature {temp}°C >= 40.5°C")
    except (ValueError, TypeError):
        pass

    return (len(red_flags) > 0), red_flags


def predict_urgency(encounter_dict):
    """
    Main triage endpoint function.
    Returns:
    {
        "final_suggested_urgency": "RED" | "YELLOW" | "GREEN" | "GREY",
        "decision_source": "DETERMINISTIC_MISSING_DATA_GATE" | "DETERMINISTIC_RED_FLAG_SAFETY_GATE" | "EXPERIMENTAL_ML_MODEL",
        "red_flags": [...],
        "missing_information": [...],
        "model_scores": { "RED": float, "YELLOW": float, "GREEN": float } or None,
        "is_calibrated": False,
        "requires_healthcare_worker_review": True,
        "disclaimer": "...",
        "status": "SUCCESS" | "FALLBACK"
    }
    """
    SAFETY_DISCLAIMER = "Experimental AI-generated urgency suggestion — not a diagnosis. Final review must be completed by a qualified healthcare professional."

    try:
        # Step 1: Detect missing critical information (GREY gating)
        has_critical_missing, missing_tags = check_missing_critical_info(encounter_dict)
        if has_critical_missing:
            return {
                "final_suggested_urgency": "GREY",
                "decision_source": "DETERMINISTIC_MISSING_DATA_GATE",
                "red_flags": [],
                "missing_information": missing_tags,
                "model_scores": None,
                "is_calibrated": False,
                "requires_healthcare_worker_review": True,
                "disclaimer": SAFETY_DISCLAIMER,
                "guidance": "Critical vital signs or timeline information is missing. Triage worker must collect basic vitals before setting a clinical urgency level.",
                "status": "SUCCESS"
            }

        # Step 2: Run deterministic clinical red flags (RED safety gate)
        has_red_flags, detected_red_flags = check_deterministic_red_flags(encounter_dict)
        if has_red_flags:
            # Deterministic RED overrides ML completely
            return {
                "final_suggested_urgency": "RED",
                "decision_source": "DETERMINISTIC_RED_FLAG_SAFETY_GATE",
                "red_flags": detected_red_flags,
                "missing_information": [],
                "model_scores": None,
                "is_calibrated": False,
                "requires_healthcare_worker_review": True,
                "disclaimer": SAFETY_DISCLAIMER,
                "guidance": "Emergency safety-rule trigger detected. Immediate medical officer review and resuscitation readiness required.",
                "status": "SUCCESS"
            }

        # Step 3: Run the experimental ML model
        model = get_model()

        # Build clean single-row DataFrame with expected features
        cc = str(encounter_dict.get('chief_complaint', '')).strip()
        sym = str(encounter_dict.get('symptoms', '')).strip()
        combined_text = cc + " " + sym

        row_data = {
            'combined_text': [combined_text],
            'age': [pd.to_numeric(encounter_dict.get('age'), errors='coerce')],
            'duration_hours': [pd.to_numeric(encounter_dict.get('duration_hours'), errors='coerce')],
            'pain_score': [pd.to_numeric(encounter_dict.get('pain_score'), errors='coerce')],
            'vitals_heart_rate_bpm': [pd.to_numeric(encounter_dict.get('vitals_heart_rate_bpm'), errors='coerce')],
            'vitals_systolic_bp': [pd.to_numeric(encounter_dict.get('vitals_systolic_bp'), errors='coerce')],
            'vitals_diastolic_bp': [pd.to_numeric(encounter_dict.get('vitals_diastolic_bp'), errors='coerce')],
            'vitals_spo2_percent': [pd.to_numeric(encounter_dict.get('vitals_spo2_percent'), errors='coerce')],
            'vitals_temperature_c': [pd.to_numeric(encounter_dict.get('vitals_temperature_c'), errors='coerce')],
            'vitals_respiratory_rate_bpm': [pd.to_numeric(encounter_dict.get('vitals_respiratory_rate_bpm'), errors='coerce')],
            'gender': [str(encounter_dict.get('gender', 'OTHER'))],
            'patient_language': [str(encounter_dict.get('patient_language', 'en'))],
            'medical_history': [str(encounter_dict.get('medical_history', 'none_reported'))],
            'allergies': [str(encounter_dict.get('allergies', 'none_known'))],
            'pregnancy_status': [str(encounter_dict.get('pregnancy_status', 'not_applicable'))],
        }
        df_input = pd.DataFrame(row_data)

        ml_pred = model.predict(df_input)[0]
        classes = list(model.classes_)
        raw_probs = model.predict_proba(df_input)[0]

        model_scores = {cls: round(float(raw_probs[i]), 4) for i, cls in enumerate(classes)}

        return {
            "final_suggested_urgency": ml_pred,
            "decision_source": "EXPERIMENTAL_ML_MODEL",
            "red_flags": [],
            "missing_information": [],
            "model_scores": model_scores,
            "is_calibrated": False,
            "requires_healthcare_worker_review": True,
            "disclaimer": SAFETY_DISCLAIMER,
            "guidance": "Model scores represent raw uncalibrated heuristic scores, not clinical certainty. Qualified clinician must conduct clinical examination.",
            "status": "SUCCESS"
        }

    except Exception as e:
        return {
            "final_suggested_urgency": "GREY",
            "decision_source": "ERROR_FALLBACK",
            "red_flags": [],
            "missing_information": ["model_execution_failure"],
            "model_scores": None,
            "is_calibrated": False,
            "requires_healthcare_worker_review": True,
            "disclaimer": "AI analysis unavailable — healthcare-worker review required.",
            "error_details": str(e),
            "status": "FALLBACK"
        }
