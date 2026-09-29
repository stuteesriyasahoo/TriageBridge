import sys
import os
import hashlib
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedGroupKFold

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))

from ml.triage_gates import evaluate_triage_encounter_gates

df = pd.read_csv('data/training/triage_cases_v2.csv')

# Run gates
results = [evaluate_triage_encounter_gates(row.to_dict()) for _, row in df.iterrows()]
gate_df = pd.DataFrame(results)
full_df = pd.concat([df, gate_df], axis=1)

# Residual ML cohort
ml_df = full_df[full_df['reached_ml_layer']].copy().reset_index(drop=True)
print(f"Residual ML cohort size: {len(ml_df)}")
print(f"Class distribution: {ml_df['provisional_urgency_label'].value_counts().to_dict()}")

# Group by normalized chief_complaint as narrative template
template_map = {cc: f"TPL_{i:02d}" for i, cc in enumerate(ml_df['chief_complaint'].unique())}
ml_df['template_group'] = ml_df['chief_complaint'].map(template_map)

print(f"Total unique template groups in residual cohort: {ml_df['template_group'].nunique()}")

# Perform a 70/15/15 group-aware split with Seed 42
# 21 groups total: ~15 train, ~3 val, ~3 test
np.random.seed(42)
unique_groups = ml_df[['template_group', 'provisional_urgency_label']].drop_duplicates()
print("Unique groups per class:")
print(unique_groups['provisional_urgency_label'].value_counts())

# Group-stratified split
# 15 GREEN groups, 6 YELLOW groups
# Let's shuffle groups with seed 42 per class
green_groups = unique_groups[unique_groups['provisional_urgency_label'] == 'GREEN']['template_group'].sample(frac=1.0, random_state=42).tolist()
yellow_groups = unique_groups[unique_groups['provisional_urgency_label'] == 'YELLOW']['template_group'].sample(frac=1.0, random_state=42).tolist()

train_groups = set(green_groups[:11] + yellow_groups[:4]) # 11 green, 4 yellow = 15 groups
val_groups = set(green_groups[11:13] + yellow_groups[4:5]) # 2 green, 1 yellow = 3 groups
test_groups = set(green_groups[13:] + yellow_groups[5:])   # 2 green, 1 yellow = 3 groups

train_df = ml_df[ml_df['template_group'].isin(train_groups)]
val_df = ml_df[ml_df['template_group'].isin(val_groups)]
test_df = ml_df[ml_df['template_group'].isin(test_groups)]

print("\n--- RESIDUAL COHORT SPLIT RESULTS (SEED 42) ---")
print(f"Train encounters: {len(train_df)} | Groups: {train_df['template_group'].nunique()}")
print(f"  Class counts: {train_df['provisional_urgency_label'].value_counts().to_dict()}")
print(f"Val encounters: {len(val_df)} | Groups: {val_df['template_group'].nunique()}")
print(f"  Class counts: {val_df['provisional_urgency_label'].value_counts().to_dict()}")
print(f"Test encounters: {len(test_df)} | Groups: {test_df['template_group'].nunique()}")
print(f"  Class counts: {test_df['provisional_urgency_label'].value_counts().to_dict()}")

# Check patient leakage
print(f"Train/Val patient overlap: {len(set(train_df['patient_synthetic_id']) & set(val_df['patient_synthetic_id']))}")
print(f"Train/Test patient overlap: {len(set(train_df['patient_synthetic_id']) & set(test_df['patient_synthetic_id']))}")
print(f"Val/Test patient overlap: {len(set(val_df['patient_synthetic_id']) & set(test_df['patient_synthetic_id']))}")

# Check template overlap
print(f"Train/Val template overlap: {len(set(train_groups) & set(val_groups))}")
print(f"Train/Test template overlap: {len(set(train_groups) & set(test_groups))}")
print(f"Val/Test template overlap: {len(set(val_groups) & set(test_groups))}")

# Check RED class support in splits
print(f"\nRED support in Train: {(train_df['provisional_urgency_label'] == 'RED').sum()}")
print(f"RED support in Val: {(val_df['provisional_urgency_label'] == 'RED').sum()}")
print(f"RED support in Test: {(test_df['provisional_urgency_label'] == 'RED').sum()}")
