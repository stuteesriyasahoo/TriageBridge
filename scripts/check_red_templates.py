import sys
import os
import pandas as pd
import numpy as np
import re

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath('.'))

df = pd.read_csv('data/training/triage_cases_v2.csv')

print(f"Loaded {len(df)} rows from data/training/triage_cases_v2.csv")

# Let's inspect the 8 RED templates and their expressions in en, hi, or
red_df = df[df['provisional_urgency_label'] == 'RED']
print(f"Total RED rows: {len(red_df)}")

# Group by chief_complaint and rule_based_red_flags
red_groups = red_df.groupby(['rule_based_red_flags', 'patient_language'])['chief_complaint'].unique()
for (rule, lang), ccs in red_groups.items():
    print(f"[{rule}] ({lang}): {ccs[0]}")
