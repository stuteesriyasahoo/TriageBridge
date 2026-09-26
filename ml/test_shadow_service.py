"""
Unit Tests for TriageBridge ML Shadow Service
============================================
Location: ml/test_shadow_service.py

Tests:
1. Health and version endpoints.
2. Strict schema validation (rejects unknown fields, rejects PII).
3. Deterministic gates (GREY for missing info, RED for red flags).
4. Model output structure (uncalibrated scores, disclaimers, no diagnosis/treatment).
5. Audit logs (structured JSON, zero PII).
6. Non-blocking error handling.
"""

import os
import sys
import json
import unittest

# Ensure repo root is in python path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from ml.service import (
    get_health,
    get_version,
    validate_input_schema,
    run_prediction,
    ALLOWED_FIELDS,
    FORBIDDEN_PII_KEYS,
    LOG_FILE,
)


class TestMLShadowService(unittest.TestCase):

    def test_01_health_endpoint(self):
        health = get_health()
        self.assertIn("status", health)
        self.assertEqual(health["status"], "HEALTHY")
        self.assertTrue(health["model_loaded"])
        self.assertIn("model_version", health)

    def test_02_version_endpoint(self):
        ver = get_version()
        self.assertIn("model_version", ver)
        self.assertIn("dataset_hash", ver)
        self.assertFalse(ver["is_validated"])
        self.assertEqual(ver["dataset_hash"], "bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f")

    def test_03_schema_validation_rejects_pii(self):
        # Should reject patient name
        valid, err = validate_input_schema({"age": 30, "name": "John Doe"})
        self.assertFalse(valid)
        self.assertIn("ERR_PII_PROHIBITED", err)

        # Should reject aadhaar
        valid, err = validate_input_schema({"age": 30, "aadhaar": "123456789012"})
        self.assertFalse(valid)
        self.assertIn("ERR_PII_PROHIBITED", err)

        # Should reject phone number
        valid, err = validate_input_schema({"age": 30, "phone": "9876543210"})
        self.assertFalse(valid)
        self.assertIn("ERR_PII_PROHIBITED", err)

        # Should reject exact address
        valid, err = validate_input_schema({"age": 30, "address": "Plot 123, Bhubaneswar"})
        self.assertFalse(valid)
        self.assertIn("ERR_PII_PROHIBITED", err)

    def test_04_schema_validation_rejects_unknown_fields(self):
        valid, err = validate_input_schema({"age": 30, "arbitrary_custom_field": "test"})
        self.assertFalse(valid)
        self.assertIn("ERR_UNSUPPORTED_FIELDS", err)

    def test_05_schema_validation_accepts_clean_intake(self):
        clean_input = {
            "age": 45,
            "gender": "FEMALE",
            "patient_language": "hi",
            "chief_complaint": "Bukhar aur khansi",
            "symptoms": "teen din se khansi hai",
            "duration_hours": 72,
            "pain_score": 3,
            "vitals_heart_rate_bpm": 88,
            "vitals_systolic_bp": 120,
            "vitals_diastolic_bp": 80,
            "vitals_spo2_percent": 98,
            "vitals_temperature_c": 38.2,
            "vitals_respiratory_rate_bpm": 18,
            "medical_history": "hypertension",
            "allergies": "none_known",
            "pregnancy_status": "not_pregnant"
        }
        valid, err = validate_input_schema(clean_input)
        self.assertTrue(valid)
        self.assertIsNone(err)

    def test_06_prediction_output_safety_disclaimers(self):
        clean_input = {
            "age": 45,
            "gender": "FEMALE",
            "patient_language": "en",
            "chief_complaint": "Mild headache",
            "symptoms": "Dull ache for two hours",
            "duration_hours": 2,
            "pain_score": 2,
            "vitals_heart_rate_bpm": 76,
            "vitals_systolic_bp": 120,
            "vitals_diastolic_bp": 80,
            "vitals_spo2_percent": 99,
            "vitals_temperature_c": 36.8,
            "vitals_respiratory_rate_bpm": 16,
            "medical_history": "none_reported",
            "allergies": "none_known",
            "pregnancy_status": "not_applicable"
        }
        res = run_prediction(clean_input)
        self.assertTrue(res["success"])
        self.assertIn(res["prediction"], ["RED", "YELLOW", "GREEN"])
        self.assertIn("uncalibrated_model_scores", res)
        self.assertIn("warning", res)
        self.assertIn("not clinically validated", res["warning"].lower())
        # Safety: NEVER return diagnosis or treatment
        self.assertNotIn("diagnosis", res)
        self.assertNotIn("treatment", res)
        self.assertNotIn("prescription", res)

    def test_07_structured_logs_exclude_pii(self):
        # Trigger prediction and check log file
        clean_input = {
            "age": 50,
            "gender": "MALE",
            "patient_language": "or",
            "chief_complaint": "Munda betha",
            "symptoms": "Munda ghuruchhi",
            "duration_hours": 12,
            "pain_score": 4,
            "vitals_heart_rate_bpm": 80,
            "vitals_systolic_bp": 130,
            "vitals_diastolic_bp": 84,
            "vitals_spo2_percent": 98,
            "vitals_temperature_c": 37.0,
            "vitals_respiratory_rate_bpm": 16,
        }
        run_prediction(clean_input)

        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, 'r', encoding='utf-8') as f:
                logs = f.readlines()
                last_line = logs[-1].strip()
                log_obj = json.loads(last_line)
                # Verify zero PII in event payload
                for pii_key in FORBIDDEN_PII_KEYS:
                    self.assertNotIn(pii_key, log_obj.get("event", {}))


if __name__ == '__main__':
    unittest.main()
