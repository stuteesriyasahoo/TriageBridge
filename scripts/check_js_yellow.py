with open('scripts/generate_training_data.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines[310:430], 311):
    print(f"{i}: {line}", end='')
