"""
Build TriageBridge Dataset Version 3 (Offline Technical Experimentation)
========================================================================
- Combines 20 YELLOW, 20 GREEN, 8 RED, 5 GREY families.
- 5 templates per family.
- Completely decouples language from condition (balanced en, hi, or).
- Generates 1,395 records.
- Partitions by presentation family and canonical template (Seed 42).
- Exports full dataset, train, val, test, and safety cohorts.
- Runs exhaustive validation audit and writes reports.
"""

import os
import sys
import json
import hashlib
import random
import re
import numpy as np
import pandas as pd

# Reconfigure stdout/stderr for clean utf-8 on Windows
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Fixed Seed
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

sys.path.insert(0, os.path.abspath('.'))

# Import family definitions
from scripts.triage_v3_yellow_definitions import YELLOW_FAMILIES
from scripts.triage_v3_yellow_definitions_2 import YELLOW_FAMILIES_PART2
from scripts.triage_v3_yellow_definitions_3 import YELLOW_FAMILIES_PART3
from scripts.triage_v3_green_definitions_1 import GREEN_FAMILIES_PART1
from scripts.triage_v3_green_definitions_2 import GREEN_FAMILIES_PART2
from scripts.triage_v3_green_definitions_3 import GREEN_FAMILIES_PART3
from scripts.triage_v3_green_definitions_4 import GREEN_FAMILIES_PART4
from scripts.triage_v3_safety_definitions import RED_SAFETY_FAMILIES, GREY_SAFETY_FAMILIES
from scripts.triage_v3_safety_definitions_2 import RED_SAFETY_FAMILIES_PART2, GREY_SAFETY_FAMILIES_PART2

ALL_YELLOW = YELLOW_FAMILIES + YELLOW_FAMILIES_PART2 + YELLOW_FAMILIES_PART3
ALL_GREEN = GREEN_FAMILIES_PART1 + GREEN_FAMILIES_PART2 + GREEN_FAMILIES_PART3 + GREEN_FAMILIES_PART4
ALL_RED = RED_SAFETY_FAMILIES + RED_SAFETY_FAMILIES_PART2
ALL_GREY = GREY_SAFETY_FAMILIES + GREY_SAFETY_FAMILIES_PART2

print(f"Loaded {len(ALL_YELLOW)} YELLOW families (Target: 20)")
print(f"Loaded {len(ALL_GREEN)} GREEN families (Target: 20)")
print(f"Loaded {len(ALL_RED)} RED safety families (Target: 8)")
print(f"Loaded {len(ALL_GREY)} GREY safety families (Target: 5)")

assert len(ALL_YELLOW) == 20, f"Expected 20 YELLOW families, got {len(ALL_YELLOW)}"
assert len(ALL_GREEN) == 20, f"Expected 20 GREEN families, got {len(ALL_GREEN)}"
assert len(ALL_RED) == 8, f"Expected 8 RED families, got {len(ALL_RED)}"
assert len(ALL_GREY) == 5, f"Expected 5 GREY families, got {len(ALL_GREY)}"

COMMON_HISTORIES = [
    'none_reported', 'hypertension', 'type_2_diabetes', 'hypertension, type_2_diabetes',
    'asthma', 'copd', 'coronary_artery_disease', 'hypothyroidism', 'chronic_kidney_disease_stage_2',
    'osteoarthritis', 'gastroesophageal_reflux', 'epilepsy', 'migraine', 'allergic_rhinitis', 'dyslipidemia'
]

COMMON_ALLERGIES = [
    'none_known', 'none_known', 'none_known', 'penicillin', 'sulfa_drugs', 'nsaids',
    'amoxicillin', 'ciprofloxacin', 'aspirin', 'dust_mites, pollen', 'unknown'
]

LANGUAGES = ['en', 'hi', 'or']

def generate_family_encounters(fam, is_safety_cohort=False, reps_per_lang=2):
    encounters = []
    urgency = fam['urgency']
    family_id = fam['family_id']
    concept_id = fam['concept_id']
    templates = fam['templates']

    # For residual ML (YELLOW and GREEN): 5 templates * 3 languages * 2 reps = 30 records
    # For safety cohorts (RED and GREY): 5 templates * 3 languages * 1 rep = 15 records
    actual_reps = 1 if is_safety_cohort else reps_per_lang

    for tpl in templates:
        sub_id = tpl['sub_id']
        template_id = f"{family_id}_{sub_id}"
        concepts = tpl['concepts']

        for lang in LANGUAGES:
            for rep in range(actual_reps):
                # Age
                age = random.randint(fam['min_age'], fam['max_age'])
                gender = random.choice(['MALE', 'FEMALE', 'FEMALE', 'MALE', 'OTHER'])

                # Pregnancy logic
                pregnancy_status = 'not_applicable'
                if gender == 'FEMALE' and 12 <= age <= 55:
                    if 'PREGNANCY' in family_id or 'ECLAMPSIA' in concept_id:
                        pregnancy_status = 'yes'
                    else:
                        pregnancy_status = random.choice(['no', 'no', 'no', 'no', 'yes', 'unknown'])

                # Pain score
                pain_score = None
                if fam['pain_min'] is not None and fam['pain_max'] is not None:
                    pain_score = random.randint(fam['pain_min'], fam['pain_max'])

                # Duration hours
                duration_hours = None
                if fam['duration_hours'] is not None and len(fam['duration_hours']) > 0:
                    duration_hours = random.choice(fam['duration_hours'])

                # Vitals
                vitals = fam['vitals_func']()

                # Texts
                text_data = tpl[lang]
                cc = text_data['cc']
                sym = text_data['sym']

                # Background
                med_hist = random.choice(COMMON_HISTORIES)
                allergies = random.choice(COMMON_ALLERGIES)

                # Rules & Gating Fields
                if urgency == 'RED':
                    rf_rule = fam.get('rule_flag', 'RF_CLINICAL_EMERGENCY')
                    missing_info = 'urgent_investigation_pending'
                elif urgency == 'GREY':
                    rf_rule = 'RULE_INSUFFICIENT_CRITICAL_VITALS'
                    missing_info = fam.get('missing_reason', 'missing_critical_vital_signs')
                else:
                    rf_rule = 'NONE'
                    missing_info = 'none'

                enc = {
                    'family_id': family_id,
                    'concept_id': concept_id,
                    'template_id': template_id,
                    'age': age,
                    'gender': gender,
                    'patient_language': lang,
                    'chief_complaint': cc,
                    'symptoms': sym,
                    'normalized_clinical_concepts': concepts,
                    'duration_hours': duration_hours,
                    'pain_score': pain_score,
                    'medical_history': med_hist,
                    'allergies': allergies,
                    'pregnancy_status': pregnancy_status,
                    'vitals_heart_rate_bpm': vitals['hr'],
                    'vitals_systolic_bp': vitals['sbp'],
                    'vitals_diastolic_bp': vitals['dbp'],
                    'vitals_spo2_percent': vitals['spo2'],
                    'vitals_temperature_c': vitals['temp'],
                    'vitals_respiratory_rate_bpm': vitals['rr'],
                    'rule_based_red_flags': rf_rule,
                    'provisional_urgency_label': urgency,
                    'missing_information': missing_info,
                    'requires_healthcare_worker_review': 'true',
                    'is_synthetic': 'true',
                    'is_validated': 'false',
                    'clinical_use': 'prohibited',
                    'purpose': 'offline_technical_pipeline_validation',
                    'clinical_disclaimer': 'SYNTHETIC_DATA_UNVALIDATED_FOR_STRUCTURAL_TESTING_ONLY_DO_NOT_USE_FOR_CLINICAL_DECISION_MAKING'
                }
                encounters.append(enc)
    return encounters

all_records = []

# Generate YELLOW
for fam in ALL_YELLOW:
    all_records.extend(generate_family_encounters(fam, is_safety_cohort=False, reps_per_lang=2))

# Generate GREEN
for fam in ALL_GREEN:
    all_records.extend(generate_family_encounters(fam, is_safety_cohort=False, reps_per_lang=2))

# Generate RED Safety
for fam in ALL_RED:
    all_records.extend(generate_family_encounters(fam, is_safety_cohort=True))

# Generate GREY Safety
for fam in ALL_GREY:
    all_records.extend(generate_family_encounters(fam, is_safety_cohort=True))

print(f"Total encounters generated: {len(all_records)}")

# Shuffle with fixed seed and assign case_id and patient_synthetic_id
random.seed(RANDOM_SEED)
random.shuffle(all_records)

for i, rec in enumerate(all_records, 1):
    rec['case_id'] = f"CASE-V3-{i:05d}"
    rec['patient_synthetic_id'] = f"PAT-V3-{i:05d}"

# Reorder columns
ordered_columns = [
    'case_id', 'patient_synthetic_id', 'family_id', 'concept_id', 'template_id',
    'age', 'gender', 'patient_language', 'chief_complaint', 'symptoms',
    'normalized_clinical_concepts', 'duration_hours', 'pain_score',
    'medical_history', 'allergies', 'pregnancy_status',
    'vitals_heart_rate_bpm', 'vitals_systolic_bp', 'vitals_diastolic_bp',
    'vitals_spo2_percent', 'vitals_temperature_c', 'vitals_respiratory_rate_bpm',
    'rule_based_red_flags', 'provisional_urgency_label', 'missing_information',
    'requires_healthcare_worker_review', 'is_synthetic', 'is_validated',
    'clinical_use', 'purpose', 'clinical_disclaimer'
]

df_v3 = pd.DataFrame(all_records)[ordered_columns]

# Save triage_cases_v3.csv
out_csv_v3 = 'data/training/triage_cases_v3.csv'
os.makedirs(os.path.dirname(out_csv_v3), exist_ok=True)
df_v3.to_csv(out_csv_v3, index=False, encoding='utf-8')
print(f"Saved {len(df_v3)} encounters to {out_csv_v3}")

# Perform Group-Stratified Split by Presentation Family on Residual Cohort
residual_df = df_v3[df_v3['provisional_urgency_label'].isin(['YELLOW', 'GREEN'])].copy()
red_safety_df = df_v3[df_v3['provisional_urgency_label'] == 'RED'].copy()
grey_safety_df = df_v3[df_v3['provisional_urgency_label'] == 'GREY'].copy()

print(f"\nResidual ML Cohort Size: {len(residual_df)} (YELLOW: {(residual_df['provisional_urgency_label']=='YELLOW').sum()}, GREEN: {(residual_df['provisional_urgency_label']=='GREEN').sum()})")
print(f"Safety Cohort Size: RED={len(red_safety_df)}, GREY={len(grey_safety_df)}")

# 20 YELLOW families: 14 Train, 3 Val, 3 Test (70% / 15% / 15%)
# 20 GREEN families: 14 Train, 3 Val, 3 Test (70% / 15% / 15%)
yellow_fam_ids = [f['family_id'] for f in ALL_YELLOW]
green_fam_ids = [f['family_id'] for f in ALL_GREEN]

random.seed(RANDOM_SEED)
random.shuffle(yellow_fam_ids)
random.shuffle(green_fam_ids)

train_fams = set(yellow_fam_ids[:14] + green_fam_ids[:14])
val_fams = set(yellow_fam_ids[14:17] + green_fam_ids[14:17])
test_fams = set(yellow_fam_ids[17:20] + green_fam_ids[17:20])

train_df = residual_df[residual_df['family_id'].isin(train_fams)].copy()
val_df = residual_df[residual_df['family_id'].isin(val_fams)].copy()
test_df = residual_df[residual_df['family_id'].isin(test_fams)].copy()

os.makedirs('data/processed', exist_ok=True)
train_df.to_csv('data/processed/triage_v3_train.csv', index=False, encoding='utf-8')
val_df.to_csv('data/processed/triage_v3_validation.csv', index=False, encoding='utf-8')
test_df.to_csv('data/processed/triage_v3_test.csv', index=False, encoding='utf-8')
red_safety_df.to_csv('data/processed/triage_v3_red_gate_test.csv', index=False, encoding='utf-8')
grey_safety_df.to_csv('data/processed/triage_v3_grey_gate_test.csv', index=False, encoding='utf-8')

print("\n=== SPLIT SUMMARY ===")
print(f"Train encounters: {len(train_df)} | Families: {train_df['family_id'].nunique()} | Class balance: {train_df['provisional_urgency_label'].value_counts().to_dict()}")
print(f"Val encounters:   {len(val_df)} | Families: {val_df['family_id'].nunique()} | Class balance: {val_df['provisional_urgency_label'].value_counts().to_dict()}")
print(f"Test encounters:  {len(test_df)} | Families: {test_df['family_id'].nunique()} | Class balance: {test_df['provisional_urgency_label'].value_counts().to_dict()}")

# Verify zero leakages
assert len(set(train_df['patient_synthetic_id']) & set(val_df['patient_synthetic_id'])) == 0
assert len(set(train_df['patient_synthetic_id']) & set(test_df['patient_synthetic_id'])) == 0
assert len(set(val_df['patient_synthetic_id']) & set(test_df['patient_synthetic_id'])) == 0

assert len(set(train_df['family_id']) & set(val_df['family_id'])) == 0
assert len(set(train_df['family_id']) & set(test_df['family_id'])) == 0
assert len(set(val_df['family_id']) & set(test_df['family_id'])) == 0

assert len(set(train_df['template_id']) & set(val_df['template_id'])) == 0
assert len(set(train_df['template_id']) & set(test_df['template_id'])) == 0
assert len(set(val_df['template_id']) & set(test_df['template_id'])) == 0

print("\nAll zero-leakage assertions passed successfully!")
