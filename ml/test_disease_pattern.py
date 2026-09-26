"""
Unit Tests for Isolated Symptom-Pattern Research Model
=====================================================
Validates model integrity, safety boundaries, and isolation from the
urgency classification pipeline.
"""

import os
import sys
import unittest
import json
import joblib
import numpy as np
import pandas as pd

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.evaluate_disease_pattern import MANDATORY_DISCLAIMER


class TestDiseasePatternModel(unittest.TestCase):
    """Test suite for the isolated auxiliary disease-pattern classifier."""

    @classmethod
    def setUpClass(cls):
        cls.model_path = 'ml/models/disease_pattern_model.joblib'
        cls.metadata_path = 'ml/models/disease_pattern_metadata.json'
        cls.clean_data_path = 'data/processed/symptom2disease_clean.csv'
        cls.urgency_model_path = 'ml/models/urgency_model.joblib'

        assert os.path.exists(cls.model_path), f"Missing model at {cls.model_path}"
        cls.model = joblib.load(cls.model_path)

    def test_model_loads_successfully(self):
        """Confirm model is an sklearn Pipeline with tfidf and clf."""
        self.assertTrue(hasattr(self.model, 'predict'))
        self.assertTrue(hasattr(self.model, 'predict_proba'))
        self.assertIn('tfidf', self.model.named_steps)
        self.assertIn('clf', self.model.named_steps)

    def test_classes_count_and_content(self):
        """Confirm model predicts across all 24 disease classes."""
        classes = self.model.classes_
        self.assertEqual(len(classes), 24, "Model must have exactly 24 disease classes")
        self.assertIn('Psoriasis', classes)
        self.assertIn('Dengue', classes)
        self.assertIn('Diabetes', classes)
        self.assertIn('Hypertension', classes)

    def test_prediction_output_and_probabilities(self):
        """Verify prediction and probability normalization."""
        sample_text = "I have a sudden high fever, severe headache, joint pain, and a rash across my skin."
        pred = self.model.predict([sample_text])[0]
        probs = self.model.predict_proba([sample_text])[0]

        self.assertIsInstance(pred, str)
        self.assertEqual(len(probs), 24)
        self.assertAlmostEqual(float(np.sum(probs)), 1.0, places=4)
        self.assertGreater(float(np.max(probs)), 0.0)

    def test_metadata_contains_mandatory_disclaimer(self):
        """Verify metadata file enforces clinical disclaimer and research boundaries."""
        self.assertTrue(os.path.exists(self.metadata_path))
        with open(self.metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)

        self.assertEqual(metadata.get('disclaimer'), MANDATORY_DISCLAIMER)
        self.assertFalse(metadata.get('is_diagnostic'))
        self.assertEqual(metadata.get('allowed_environment'), 'INTERNAL_RESEARCH_ONLY')
        self.assertIn('safety_constraints', metadata)
        self.assertIn('urgency_model_isolation', metadata['safety_constraints'])

    def test_isolation_from_urgency_model(self):
        """Confirm that urgency model and disease pattern model are separate files."""
        self.assertTrue(os.path.exists(self.urgency_model_path))
        self.assertNotEqual(
            os.path.abspath(self.model_path),
            os.path.abspath(self.urgency_model_path)
        )

        urgency_model = joblib.load(self.urgency_model_path)
        # Urgency model predicts RED, YELLOW, GREEN, not disease names
        self.assertEqual(set(urgency_model.classes_), {'GREEN', 'RED', 'YELLOW'})
        self.assertNotEqual(set(urgency_model.classes_), set(self.model.classes_))

    def test_deduplication_integrity(self):
        """Verify that processed dataset contains zero duplicate symptom descriptions."""
        self.assertTrue(os.path.exists(self.clean_data_path))
        df = pd.read_csv(self.clean_data_path)
        dup_count = df['text'].duplicated().sum()
        self.assertEqual(dup_count, 0, "Clean dataset must have 0 duplicate texts")
        self.assertEqual(len(df), 1153, "Clean dataset must contain exactly 1153 rows")
        self.assertNotIn('Unnamed: 0', df.columns, "Clean dataset must not have Unnamed: 0 column")


if __name__ == '__main__':
    unittest.main()
