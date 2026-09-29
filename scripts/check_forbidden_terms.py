import sys

forbidden = [
    'clinically validated',
    'clinically accurate',
    'safe for clinical deployment',
    'production ready'
]

def check_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read().lower()
    found = []
    for term in forbidden:
        if term in content:
            found.append(term)
    return found

print("Checking TRIAGE_TRAINING_READINESS_AUDIT.md...")
md_found = check_file('data/evaluation/TRIAGE_TRAINING_READINESS_AUDIT.md')
print(f"Forbidden terms found in MD: {md_found}")

print("Checking triage_training_readiness.json...")
with open('data/evaluation/triage_training_readiness.json', 'r', encoding='utf-8') as f:
    json_content = f.read()

# In json, we had keys like "contains_clinically_validated", let's check values or sentences
import json
data = json.loads(json_content)
# Check verdict and rationale
print("JSON verdict:", data['readiness_verdict'])
print("JSON rationale forbidden check:", [t for t in forbidden if t in data['verdict_rationale'].lower()])
