import sys
import os
import hashlib
import json
import re
import pandas as pd
import numpy as np

# Reconfigure stdout/stderr for clean utf-8 on Windows
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))

from ml.triage_gates import evaluate_triage_encounter_gates, GATE_VERSION

csv_path = 'data/training/triage_cases_v2.csv'
df = pd.read_csv(csv_path)

print(f"Loaded {len(df)} encounters from {csv_path}")

# Run Gate 1 and Gate 2 on all 500 rows
results = []
for idx, row in df.iterrows():
    enc = row.to_dict()
    gate_res = evaluate_triage_encounter_gates(enc)
    results.append(gate_res)

gate_df = pd.DataFrame(results)
full_df = pd.concat([df, gate_df], axis=1)

# Task 1 Summary
missing_count = full_df['missing_gate_triggered'].sum()
rf_count = full_df['red_flag_gate_triggered'].sum()
ml_count = full_df['reached_ml_layer'].sum()

print("\n=== TASK 1: GATE SUMMARY ===")
print(f"Total encounters: {len(full_df)}")
print(f"Missing information gate triggered (GREY): {missing_count}")
print(f"Red flag gate triggered (RED): {rf_count}")
print(f"Encounters reaching ML layer: {ml_count}")
print("Deterministic output distribution:")
print(full_df['deterministic_output'].value_counts(dropna=False))

# Task 2: Recalculate the Real ML Cohort
print("\n=== TASK 2: REAL ML COHORT ANALYSIS ===")
ml_cohort = full_df[full_df['reached_ml_layer']]
print(f"Real ML Cohort Size: {len(ml_cohort)}")
print("Class distribution among cases reaching ML:")
ml_class_counts = ml_cohort['provisional_urgency_label'].value_counts().to_dict()
print(ml_class_counts)

# Identify unique narrative templates in residual cohort
# Grouping by normalized chief_complaint in English or across languages
ml_cohort_en = ml_cohort[ml_cohort['patient_language'] == 'en']
unique_templates_en = ml_cohort_en['chief_complaint'].nunique()
total_unique_cc = ml_cohort['chief_complaint'].nunique()
print(f"Unique English CC templates reaching ML: {unique_templates_en}")
print(f"Total unique CC texts reaching ML across all languages: {total_unique_cc}")

# Split analysis on the residual ML cohort (Seed 42)
# We test if residual cohort can be split and whether every residual class can be evaluated
# Let's map narrative template IDs based on chief complaint
template_map = {}
for i, cc in enumerate(ml_cohort['chief_complaint'].unique()):
    template_map[cc] = f"RESID_TPL_{i+1:03d}"

ml_cohort_copy = ml_cohort.copy()
ml_cohort_copy['template_id'] = ml_cohort_copy['chief_complaint'].map(template_map)

# Check group distribution
template_labels = ml_cohort_copy.groupby('template_id')['provisional_urgency_label'].first()
print(f"Total unique narrative template groups in residual ML cohort: {len(template_labels)}")
print("Template distribution by class in residual cohort:")
print(template_labels.value_counts())

# Task 3: Verify Label Consistency
print("\n=== TASK 3: LABEL CONSISTENCY AUDIT ===")
red_no_rf = full_df[(full_df['provisional_urgency_label'] == 'RED') & (~full_df['red_flag_gate_triggered'])]
print(f"RED-labelled cases with no deterministic red flag: {len(red_no_rf)}")
if len(red_no_rf) > 0:
    print(red_no_rf[['case_id', 'rule_based_red_flags', 'chief_complaint']].head())

yellow_rf = full_df[(full_df['provisional_urgency_label'] == 'YELLOW') & (full_df['red_flag_gate_triggered'])]
print(f"YELLOW cases triggering a deterministic red flag: {len(yellow_rf)}")

green_rf = full_df[(full_df['provisional_urgency_label'] == 'GREEN') & (full_df['red_flag_gate_triggered'])]
print(f"GREEN cases triggering a deterministic red flag: {len(green_rf)}")

grey_not_missing = full_df[(full_df['provisional_urgency_label'] == 'GREY') & (~full_df['missing_gate_triggered'])]
print(f"GREY cases not missing critical information: {len(grey_not_missing)}")

complete_vitals_grey = full_df[(full_df['provisional_urgency_label'] == 'GREY') & 
    full_df['vitals_heart_rate_bpm'].notna() & 
    full_df['vitals_systolic_bp'].notna() & 
    full_df['vitals_spo2_percent'].notna() & 
    full_df['vitals_temperature_c'].notna() & 
    full_df['vitals_respiratory_rate_bpm'].notna()]
print(f"Complete-vitals cases incorrectly labelled GREY: {len(complete_vitals_grey)}")

# Check identical intake patterns assigned different labels
full_df['intake_hash'] = full_df.apply(lambda r: hashlib.sha256(
    f"{r['age']}_{r['gender']}_{r['chief_complaint']}_{r['vitals_heart_rate_bpm']}_{r['vitals_systolic_bp']}_{r['vitals_spo2_percent']}".encode('utf-8')
).hexdigest(), axis=1)

conflicting_intakes = full_df.groupby('intake_hash')['provisional_urgency_label'].nunique()
conflicts = conflicting_intakes[conflicting_intakes > 1]
print(f"Identical intake patterns assigned different labels: {len(conflicts)}")

# Rule imitation analysis
rules_in_red = df[df['provisional_urgency_label'] == 'RED']['rule_based_red_flags'].unique()
print(f"\nRule-based red flags present in RED cases:\n{rules_in_red}")

# Task 4: Template and Leakage Audit
print("\n=== TASK 4: TEMPLATE & LEAKAGE HASHING ===")
# Hash normalized CC and symptoms
def norm_text(s):
    return re.sub(r'\s+', ' ', str(s).strip().lower())

full_df['text_hash'] = full_df.apply(lambda r: hashlib.sha256(f"{norm_text(r['chief_complaint'])}_{norm_text(r['symptoms'])}".encode('utf-8')).hexdigest()[:16], axis=1)
full_df['vitals_hash'] = full_df.apply(lambda r: hashlib.sha256(f"{round(float(r['vitals_heart_rate_bpm']) if pd.notna(r['vitals_heart_rate_bpm']) else -1)}_{round(float(r['vitals_systolic_bp']) if pd.notna(r['vitals_systolic_bp']) else -1)}_{round(float(r['vitals_spo2_percent']) if pd.notna(r['vitals_spo2_percent']) else -1)}".encode('utf-8')).hexdigest()[:16], axis=1)

print(f"Unique text hashes in entire dataset: {full_df['text_hash'].nunique()}")
print(f"Unique vitals hashes in entire dataset: {full_df['vitals_hash'].nunique()}")
print(f"Unique text hashes in residual ML cohort: {ml_cohort_copy['chief_complaint'].nunique()}")

# Task 5: Subgroup Analysis of Language
print("\n=== TASK 5: LANGUAGE SUBGROUP AUDIT ===")
print("Language distribution in total dataset:")
print(full_df['patient_language'].value_counts().to_dict())
print("Language distribution in residual ML cohort:")
print(ml_cohort['patient_language'].value_counts().to_dict())
print("Crosstab of Language vs Provisional Urgency in Residual ML Cohort:")
print(pd.crosstab(ml_cohort['patient_language'], ml_cohort['provisional_urgency_label']))

# Export detailed summary
summary_data = {
    "total_encounters": len(full_df),
    "missing_gated_grey": int(missing_count),
    "red_flag_intercepted_red": int(rf_count),
    "encounters_reaching_ml": int(ml_count),
    "ml_class_distribution": {k: int(v) for k, v in ml_class_counts.items()},
    "red_no_deterministic_rf": len(red_no_rf),
    "yellow_green_with_rf": len(yellow_rf) + len(green_rf),
    "grey_not_missing_critical": len(grey_not_missing),
    "complete_vitals_labelled_grey": len(complete_vitals_grey),
    "identical_intakes_different_labels": len(conflicts),
    "residual_unique_templates": int(ml_cohort['chief_complaint'].nunique())
}

with open('data/evaluation/residual_cohort_summary.json', 'w', encoding='utf-8') as f:
    json.dump(summary_data, f, indent=2)

print("\nSaved summary to data/evaluation/residual_cohort_summary.json")
