import os
import sys
import pandas as pd
import json

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath('.'))

df = pd.read_csv('data/training/triage_cases_v2.csv')

print("--- GREY CASES AUDIT ---")
grey_df = df[df['provisional_urgency_label'] == 'GREY']
print(f"Total GREY cases: {len(grey_df)}")
for idx, r in grey_df.head(10).iterrows():
    print(f"Case {r['case_id']}: rule={r['rule_based_red_flags']}, missing_info={r['missing_information']}")
    print(f"   HR={r['vitals_heart_rate_bpm']}, SBP={r['vitals_systolic_bp']}, SpO2={r['vitals_spo2_percent']}, Temp={r['vitals_temperature_c']}, RR={r['vitals_respiratory_rate_bpm']}, Dur={r['duration_hours']}")
    print(f"   CC={r['chief_complaint'][:60]}")

print("\n--- Check which 10 GREY cases did not trigger ml/predict.py's check_missing_critical_info ---")
from ml.predict import check_missing_critical_info
for idx, r in grey_df.iterrows():
    is_m, reasons = check_missing_critical_info(r.to_dict())
    if not is_m:
        print(f"GREY case NOT triggered by predict.py: {r['case_id']}, Rule: {r['rule_based_red_flags']}, CC: {r['chief_complaint']}")
        print(f"   Vitals: HR={r['vitals_heart_rate_bpm']}, SBP={r['vitals_systolic_bp']}, SpO2={r['vitals_spo2_percent']}, Temp={r['vitals_temperature_c']}, RR={r['vitals_respiratory_rate_bpm']}, Dur={r['duration_hours']}")

print("\n--- RED CASES AUDIT ---")
red_df = df[df['provisional_urgency_label'] == 'RED']
print(f"Total RED cases: {len(red_df)}")
print(red_df['rule_based_red_flags'].value_counts())

print("\n--- YELLOW CASES AUDIT ---")
yellow_df = df[df['provisional_urgency_label'] == 'YELLOW']
print(f"Total YELLOW cases: {len(yellow_df)}")
print(yellow_df['rule_based_red_flags'].value_counts())

print("\n--- GREEN CASES AUDIT ---")
green_df = df[df['provisional_urgency_label'] == 'GREEN']
print(f"Total GREEN cases: {len(green_df)}")
print(green_df['rule_based_red_flags'].value_counts())
