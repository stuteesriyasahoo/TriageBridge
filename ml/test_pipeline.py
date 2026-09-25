"""
TriageBridge ML Pipeline Test Suite
===================================
Automated verification tests covering:
1. Forbidden leakage columns detection
2. Missing numerical values handling
3. Unknown categories handling
4. Empty symptom text handling
5. Hindi input inference
6. Odia input inference
7. Invalid vitals handling
8. GREY cases bypassing ML training (deterministic gate)
9. Reproducible splits check
10. Near-duplicate isolation check
11. Model load and prediction verification
"""

import os
import sys
import unittest
import pandas as pd
import numpy as np

# Ensure ml module is importable
sys.path.insert(0, os.path.dirname(__file__))

from predict import predict_urgency, check_missing_critical_info, check_deterministic_red_flags
from train import (
    validate_leakage_safety,
    build_narrative_groups,
    group_stratified_split,
    compute_sha256,
    FORBIDDEN_LEAKAGE_COLUMNS,
    RANDOM_SEED,
)


class TestTriagePipeline(unittest.TestCase):

    def setUp(self):
        self.csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'training', 'triage_cases_v2.csv')
        self.df = pd.read_csv(self.csv_path)

    # 1. Forbidden Leakage Columns
    def test_forbidden_leakage_columns(self):
        with self.assertRaises(AssertionError):
            validate_leakage_safety(['age', 'symptoms', 'rule_based_urgency'])
        with self.assertRaises(AssertionError):
            validate_leakage_safety(['age', 'ml_suggested_urgency'])
        with self.assertRaises(AssertionError):
            validate_leakage_safety(['age', 'disease'])

    # 2. Missing Numerical Values Handling
    def test_missing_numerical_values(self):
        encounter = {
            'chief_complaint': 'Mild headache after studying',
            'symptoms': 'Dull ache across forehead, no nausea',
            'age': 25,
            'duration_hours': None,
            'pain_score': None,
            'vitals_heart_rate_bpm': 72,
            'vitals_systolic_bp': 120,
            'vitals_diastolic_bp': 80,
            'vitals_spo2_percent': 99,
            'vitals_temperature_c': None,
            'vitals_respiratory_rate_bpm': 14,
            'gender': 'FEMALE',
            'patient_language': 'en',
            'medical_history': 'none_reported',
            'allergies': 'none_known',
            'pregnancy_status': 'no',
        }
        res = predict_urgency(encounter)
        self.assertIn(res['final_suggested_urgency'], ['GREEN', 'YELLOW', 'RED', 'GREY'])
        self.assertEqual(res['status'], 'SUCCESS')

    # 3. Unknown Categories Handling
    def test_unknown_categories(self):
        encounter = {
            'chief_complaint': 'Sore throat and runny nose',
            'symptoms': 'Clear rhinorrhea, tickly throat, no fever',
            'age': 30,
            'duration_hours': 24.0,
            'pain_score': 2,
            'vitals_heart_rate_bpm': 74,
            'vitals_systolic_bp': 118,
            'vitals_diastolic_bp': 76,
            'vitals_spo2_percent': 99,
            'vitals_temperature_c': 36.8,
            'vitals_respiratory_rate_bpm': 14,
            'gender': 'NON_BINARY_UNSEEN_VALUE',
            'patient_language': 'fr',  # unseen language
            'medical_history': 'unseen_rare_genetic_condition',
            'allergies': 'unseen_synthetic_compound_allergy',
            'pregnancy_status': 'unseen_status',
        }
        res = predict_urgency(encounter)
        self.assertEqual(res['status'], 'SUCCESS')
        self.assertIn(res['final_suggested_urgency'], ['GREEN', 'YELLOW', 'RED'])

    # 4. Empty Symptom Text Handling
    def test_empty_symptom_text(self):
        encounter = {
            'chief_complaint': '',
            'symptoms': '',
            'age': 45,
            'duration_hours': 12.0,
            'pain_score': 1,
            'vitals_heart_rate_bpm': 70,
            'vitals_systolic_bp': 120,
            'vitals_diastolic_bp': 80,
            'vitals_spo2_percent': 98,
            'vitals_temperature_c': 36.6,
            'vitals_respiratory_rate_bpm': 15,
            'gender': 'MALE',
            'patient_language': 'en',
            'medical_history': 'none_reported',
            'allergies': 'none_known',
            'pregnancy_status': 'not_applicable',
        }
        res = predict_urgency(encounter)
        self.assertEqual(res['status'], 'SUCCESS')

    # 5. Hindi Input Inference
    def test_hindi_input_inference(self):
        encounter = {
            'chief_complaint': 'सीने में अत्यधिक भारीपन और बाएं हाथ में खिंचाव',
            'symptoms': 'छाती के बीच में तेज दबाव, दर्द बाएं हाथ और जबड़े तक फैलना, अत्यधिक पसीना',
            'age': 56,
            'duration_hours': 1.0,
            'pain_score': 9,
            'vitals_heart_rate_bpm': 110,
            'vitals_systolic_bp': 175,
            'vitals_diastolic_bp': 105,
            'vitals_spo2_percent': 93,
            'vitals_temperature_c': 36.9,
            'vitals_respiratory_rate_bpm': 24,
            'gender': 'MALE',
            'patient_language': 'hi',
            'medical_history': 'hypertension',
            'allergies': 'none_known',
            'pregnancy_status': 'not_applicable',
        }
        res = predict_urgency(encounter)
        self.assertEqual(res['status'], 'SUCCESS')
        self.assertEqual(res['final_suggested_urgency'], 'RED')

    # 6. Odia Input Inference
    def test_odia_input_inference(self):
        encounter = {
            'chief_complaint': 'ଛାତିରେ ଅତ୍ୟଧିକ ଚାପ ଓ ବାମ ହାତକୁ ଯନ୍ତ୍ରଣା ବ୍ୟାପିବା',
            'symptoms': 'ଛାତି ମଝିରେ ଭୀଷଣ ଯନ୍ତ୍ରଣା, ବାମ କାନ୍ଧ ଓ ବେକକୁ କଷ୍ଟ ବ୍ୟାପିବା, ପ୍ରବଳ ଝାଳ',
            'age': 62,
            'duration_hours': 1.5,
            'pain_score': 9,
            'vitals_heart_rate_bpm': 115,
            'vitals_systolic_bp': 180,
            'vitals_diastolic_bp': 108,
            'vitals_spo2_percent': 92,
            'vitals_temperature_c': 37.1,
            'vitals_respiratory_rate_bpm': 26,
            'gender': 'FEMALE',
            'patient_language': 'or',
            'medical_history': 'type_2_diabetes',
            'allergies': 'none_known',
            'pregnancy_status': 'not_applicable',
        }
        res = predict_urgency(encounter)
        self.assertEqual(res['status'], 'SUCCESS')
        self.assertEqual(res['final_suggested_urgency'], 'RED')

    # 7. Invalid Vitals Handling
    def test_invalid_vitals_handling(self):
        encounter = {
            'chief_complaint': 'Dizziness with extreme readings',
            'symptoms': 'Lightheadedness',
            'age': 35,
            'duration_hours': 2.0,
            'pain_score': 5,
            'vitals_heart_rate_bpm': 'invalid_string',
            'vitals_systolic_bp': 9999,
            'vitals_diastolic_bp': -100,
            'vitals_spo2_percent': 85,
            'vitals_temperature_c': 55.0,
            'vitals_respiratory_rate_bpm': 'unknown',
            'gender': 'MALE',
            'patient_language': 'en',
            'medical_history': 'none_reported',
            'allergies': 'none_known',
            'pregnancy_status': 'not_applicable',
        }
        res = predict_urgency(encounter)
        # Should gracefully handle or trigger critical vital red flag
        self.assertEqual(res['status'], 'SUCCESS')
        self.assertIn(res['final_suggested_urgency'], ['RED', 'GREY'])

    # 8. GREY Cases Bypassing ML Training (Deterministic Missing Data Gate)
    def test_grey_cases_deterministic_gating(self):
        # Case missing both HR and BP
        encounter_missing_vitals = {
            'chief_complaint': 'Sudden collapse at home',
            'symptoms': 'Brief loss of consciousness reported by family',
            'age': 65,
            'duration_hours': None,
            'pain_score': None,
            'vitals_heart_rate_bpm': None,
            'vitals_systolic_bp': None,
            'vitals_diastolic_bp': None,
            'vitals_spo2_percent': None,
            'vitals_temperature_c': None,
            'vitals_respiratory_rate_bpm': None,
            'gender': 'MALE',
            'patient_language': 'en',
            'medical_history': 'unknown',
            'allergies': 'unknown',
            'pregnancy_status': 'not_applicable',
        }
        res = predict_urgency(encounter_missing_vitals)
        self.assertEqual(res['final_suggested_urgency'], 'GREY')
        self.assertEqual(res['decision_source'], 'DETERMINISTIC_MISSING_DATA_GATE')
        self.assertIsNone(res['model_scores'])

    # 9. Reproducible Splits Check
    def test_reproducible_splits(self):
        df_target = self.df[self.df['provisional_urgency_label'].isin(['RED', 'YELLOW', 'GREEN'])].copy()
        df_target['narrative_group'] = build_narrative_groups(df_target)

        train_a, val_a, test_a = group_stratified_split(
            df_target, group_col='narrative_group', target_col='provisional_urgency_label', seed=RANDOM_SEED
        )
        train_b, val_b, test_b = group_stratified_split(
            df_target, group_col='narrative_group', target_col='provisional_urgency_label', seed=RANDOM_SEED
        )

        pd.testing.assert_frame_equal(train_a, train_b)
        pd.testing.assert_frame_equal(val_a, val_b)
        pd.testing.assert_frame_equal(test_a, test_b)

    # 10. Near-Duplicate Isolation Check
    def test_near_duplicate_isolation(self):
        df_target = self.df[self.df['provisional_urgency_label'].isin(['RED', 'YELLOW', 'GREEN'])].copy()
        df_target['narrative_group'] = build_narrative_groups(df_target)

        train_df, val_df, test_df = group_stratified_split(
            df_target, group_col='narrative_group', target_col='provisional_urgency_label', seed=RANDOM_SEED
        )

        train_groups = set(train_df['narrative_group'])
        val_groups = set(val_df['narrative_group'])
        test_groups = set(test_df['narrative_group'])

        self.assertEqual(len(train_groups.intersection(val_groups)), 0)
        self.assertEqual(len(train_groups.intersection(test_groups)), 0)
        self.assertEqual(len(val_groups.intersection(test_groups)), 0)

    # 11. Model Load & Prediction Verification
    def test_model_load_and_prediction(self):
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'urgency_model.joblib')
        if os.path.exists(model_path):
            sample = {
                'chief_complaint': 'Mild knee pain when climbing stairs',
                'symptoms': 'Aching sensation for 6 months, no redness, normal movement',
                'age': 55,
                'duration_hours': 720.0,
                'pain_score': 3,
                'vitals_heart_rate_bpm': 72,
                'vitals_systolic_bp': 122,
                'vitals_diastolic_bp': 78,
                'vitals_spo2_percent': 98,
                'vitals_temperature_c': 36.7,
                'vitals_respiratory_rate_bpm': 14,
                'gender': 'FEMALE',
                'patient_language': 'en',
                'medical_history': 'osteoarthritis',
                'allergies': 'none_known',
                'pregnancy_status': 'no',
            }
            res = predict_urgency(sample)
            self.assertEqual(res['status'], 'SUCCESS')
            self.assertIn(res['final_suggested_urgency'], ['GREEN', 'YELLOW', 'RED'])
            self.assertTrue(res['requires_healthcare_worker_review'])
            self.assertIn('Experimental AI-generated urgency suggestion', res['disclaimer'])


if __name__ == '__main__':
    unittest.main()
