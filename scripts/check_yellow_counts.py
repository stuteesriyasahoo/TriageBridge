import sys
import pandas as pd

sys.stdout.reconfigure(encoding='utf-8')
df = pd.read_csv('data/training/triage_cases_v2.csv')

yellow_df = df[df['provisional_urgency_label'] == 'YELLOW']
print(f"Total yellow rows: {len(yellow_df)}")
print("Yellow CC counts:")
print(yellow_df['chief_complaint'].value_counts())
