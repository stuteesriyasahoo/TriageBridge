forbidden = [
    'clinically validated',
    'clinically accurate',
    'safe for clinical deployment',
    'production ready'
]

for path in ['data/evaluation/TRIAGE_V3_DATA_AUDIT.md', 'data/evaluation/triage_v3_data_audit.json']:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read().lower()
    found = [term for term in forbidden if term in content]
    print(f"Checking {path}: found={found}")
