import sys
import os
import pandas as pd
import json

sys.stdout.reconfigure(encoding='utf-8')
df = pd.read_csv('data/training/triage_cases_v2.csv')

yellow_df = df[df['provisional_urgency_label'] == 'YELLOW']
green_df = df[df['provisional_urgency_label'] == 'GREEN']

print("YELLOW unique chief complaints (English):")
for cc in yellow_df[yellow_df['patient_language'] == 'en']['chief_complaint'].unique():
    print(f"  - {cc}")

print("\nGREEN unique chief complaints (English):")
for cc in green_df[green_df['patient_language'] == 'en']['chief_complaint'].unique():
    print(f"  - {cc}")
