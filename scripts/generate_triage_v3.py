"""
TriageBridge Urgency Dataset Generator (Version 3)
==================================================
Scope: OFFLINE TECHNICAL EXPERIMENTATION ONLY.
- Classifies: YELLOW and GREEN only via statistical ML.
- RED and GREY are deterministic safety-test gates and never enter ML training.
- Zero language-condition modulo artifacts.
- 20 independent YELLOW presentation families, 5+ templates per family.
- 20 independent GREEN presentation families, 5+ templates per family.
- Clinically equivalent paraphrases in English, Hindi, and Odia.
- Preserves original_patient_text and normalized_clinical_concepts.
"""

import os
import sys
import json
import hashlib
import random
import numpy as np
import pandas as pd

# Reconfigure stdout/stderr for UTF-8
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

COMMON_HISTORIES = [
    'none_reported', 'hypertension', 'type_2_diabetes', 'hypertension, type_2_diabetes',
    'asthma', 'copd', 'coronary_artery_disease', 'hypothyroidism', 'chronic_kidney_disease_stage_2',
    'osteoarthritis', 'gastroesophageal_reflux', 'epilepsy', 'migraine', 'allergic_rhinitis', 'dyslipidemia'
]

COMMON_ALLERGIES = [
    'none_known', 'none_known', 'none_known', 'penicillin', 'sulfa_drugs', 'nsaids',
    'amoxicillin', 'ciprofloxacin', 'aspirin', 'dust_mites, pollen', 'unknown'
]
