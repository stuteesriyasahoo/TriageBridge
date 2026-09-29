import sys
import os
import pandas as pd
import json

# Ensure stdout handles UTF-8
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath('.'))
from ml.predict import check_missing_critical_info, check_deterministic_red_flags

df = pd.read_csv('data/training/triage_cases_v2.csv')
print(f"Total rows: {len(df)}")
print(f"Provisional labels: {df['provisional_urgency_label'].value_counts().to_dict()}")

# Inspect dataset's rule_based_red_flags
print("\nUnique rule_based_red_flags in dataset:")
print(df['rule_based_red_flags'].value_counts())

# Test predict.py functions on the dataset
missing_triggered = []
red_flag_triggered = []
reached_ml = []
deterministic_output = []

for idx, row in df.iterrows():
    enc = row.to_dict()
    is_missing, missing_reasons = check_missing_critical_info(enc)
    is_rf, rf_reasons = check_deterministic_red_flags(enc)
    
    missing_triggered.append(is_missing)
    red_flag_triggered.append(is_rf)
    
    if is_missing:
        det_out = "GREY"
        reaches = False
    elif is_rf:
        det_out = "RED"
        reaches = False
    else:
        det_out = None
        reaches = True
        
    reached_ml.append(reaches)
    deterministic_output.append(det_out)

df['test_missing'] = missing_triggered
df['test_rf'] = red_flag_triggered
df['test_reaches_ml'] = reached_ml
df['test_det_out'] = deterministic_output

print("\n--- Gate Results using current ml/predict.py functions ---")
print(f"Missing gate triggered: {df['test_missing'].sum()}")
print(f"Red flag gate triggered: {df['test_rf'].sum()}")
print(f"Reached ML: {df['test_reaches_ml'].sum()}")
print(f"Deterministic output distribution:\n{df['test_det_out'].value_counts(dropna=False)}")

print("\nCrosstab of provisional_urgency_label vs reached_ml:")
print(pd.crosstab(df['provisional_urgency_label'], df['test_reaches_ml']))

print("\nCrosstab of provisional_urgency_label vs test_det_out:")
print(pd.crosstab(df['provisional_urgency_label'], df['test_det_out'].fillna('REACHED_ML')))

print("\nBreakdown of RED encounters on red flag test:")
red_cases = df[df['provisional_urgency_label'] == 'RED']
print(f"RED cases with test_rf=True: {(red_cases['test_rf']).sum()} / {len(red_cases)}")
if (~red_cases['test_rf']).sum() > 0:
    print("RED cases with test_rf=False:")
    for _, r in red_cases[~red_cases['test_rf']].iterrows():
        print(f"  Case: {r['case_id']}, Rule: {r['rule_based_red_flags']}, CC: {r['chief_complaint']}, Sym: {r['symptoms'][:50]}, Vitals: HR={r['vitals_heart_rate_bpm']}, SBP={r['vitals_systolic_bp']}, SpO2={r['vitals_spo2_percent']}")

print("\nBreakdown of YELLOW encounters on red flag test:")
yellow_cases = df[df['provisional_urgency_label'] == 'YELLOW']
print(f"YELLOW cases with test_rf=True: {(yellow_cases['test_rf']).sum()} / {len(yellow_cases)}")
if (yellow_cases['test_rf']).sum() > 0:
    print("YELLOW cases with test_rf=True:")
    for _, r in yellow_cases[yellow_cases['test_rf']].iterrows():
        print(f"  Case: {r['case_id']}, CC: {r['chief_complaint']}, SBP={r['vitals_systolic_bp']}, SpO2={r['vitals_spo2_percent']}")

print("\nBreakdown of GREEN encounters on red flag test:")
green_cases = df[df['provisional_urgency_label'] == 'GREEN']
print(f"GREEN cases with test_rf=True: {(green_cases['test_rf']).sum()} / {len(green_cases)}")
