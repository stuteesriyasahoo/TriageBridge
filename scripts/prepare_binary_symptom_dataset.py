#!/usr/bin/env python3
"""
scripts/prepare_binary_symptom_dataset.py

Clean and partition the raw binary symptom-disease research dataset:
    data/raw/disease_symptoms_binary.csv

Preprocessing Protocol:
  1. Remove exact duplicate rows (246,945 -> 189,647 rows; 57,298 duplicates removed).
  2. Report and prune 49 constant all-zero symptom columns (377 -> 328 active symptom columns).
  3. Strictly preserve 'regurgitation' and 'regurgitation.1' as distinct unmerged features.
  4. Preserve conflicting-label records and annotate with conflict metadata:
     - is_conflicting (bool)
     - conflict_disease_count (int)
     - conflict_diseases (semicolon-delimited string of diseases)
  5. Generate canonical order-invariant symptom-set hash for each unique symptom vector.
  6. Group-split by canonical hash with fixed random seed 42 (70% Train, 15% Validation, 15% Test).
  7. Verify 0.00% canonical hash leakage across splits.
  8. Save cleaned research partitions into data/processed/ (gitignored).
"""

import os
import sys
import json
import hashlib
import time
import pandas as pd
import numpy as np

# Ensure UTF-8 output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass

RAW_PATH = os.path.join("data", "raw", "disease_symptoms_binary.csv")
PROCESSED_DIR = os.path.join("data", "processed")
CLEANED_CSV_PATH = os.path.join(PROCESSED_DIR, "binary_symptoms_cleaned.csv")
TRAIN_CSV_PATH = os.path.join(PROCESSED_DIR, "binary_train.csv")
VAL_CSV_PATH = os.path.join(PROCESSED_DIR, "binary_validation.csv")
TEST_CSV_PATH = os.path.join(PROCESSED_DIR, "binary_test.csv")
SUMMARY_JSON_PATH = os.path.join(PROCESSED_DIR, "binary_split_summary.json")

RANDOM_SEED = 42

def main():
    print("=" * 70)
    print("  BINARY SYMPTOM-DISEASE DATASET PREPROCESSING & GROUP PARTITIONING")
    print("=" * 70)
    
    if not os.path.exists(RAW_PATH):
        print(f"ERROR: Raw dataset not found at '{RAW_PATH}'", file=sys.stderr)
        sys.exit(1)

    t_start = time.time()
    os.makedirs(PROCESSED_DIR, exist_ok=True)

    print(f"\n1. Loading raw dataset from '{RAW_PATH}'...")
    df = pd.read_csv(RAW_PATH)
    raw_rows, raw_cols = df.shape
    print(f"   Raw Shape: {raw_rows:,} rows x {raw_cols} columns")

    disease_col = df.columns[0]
    all_symptom_cols = [c for c in df.columns if c != disease_col]
    print(f"   Disease column: '{disease_col}' (Classes: {df[disease_col].nunique()})")
    print(f"   Total symptom columns: {len(all_symptom_cols)}")

    # Step 1: Remove exact duplicates
    print("\n2. Removing exact duplicate rows...")
    df_dedup = df.drop_duplicates().copy()
    dedup_rows = len(df_dedup)
    exact_dupes_removed = raw_rows - dedup_rows
    print(f"   Exact duplicates removed: {exact_dupes_removed:,} ({exact_dupes_removed / raw_rows * 100:.2f}%)")
    print(f"   Deduplicated row count:   {dedup_rows:,}")

    # Step 2: Identify and prune constant all-zero symptom columns
    print("\n3. Identifying and pruning constant all-zero symptom columns...")
    col_sums = df_dedup[all_symptom_cols].sum(axis=0)
    zero_cols = col_sums[col_sums == 0].index.tolist()
    active_symptom_cols = [c for c in all_symptom_cols if c not in zero_cols]
    print(f"   Constant all-zero columns detected: {len(zero_cols)}")
    print(f"   Active symptom columns retained:    {len(active_symptom_cols)}")

    # Verify regurgitation columns are preserved
    assert 'regurgitation' in active_symptom_cols, "'regurgitation' column missing!"
    assert 'regurgitation.1' in active_symptom_cols, "'regurgitation.1' column missing!"
    print("   -> 'regurgitation' and 'regurgitation.1' preserved as distinct unmerged features [PASS]")

    # Filter columns to disease + active symptoms
    keep_columns = [disease_col] + active_symptom_cols
    df_clean = df_dedup[keep_columns].copy()

    # Step 3: Canonical hash generation & Conflicting-pattern preservation
    print("\n4. Generating canonical symptom-set hashes & conflict flags...")
    arr = df_clean[active_symptom_cols].to_numpy(dtype=np.uint8)
    packed = np.packbits(arr, axis=1)
    
    # Generate canonical hash from byte vector
    byte_hashes = [f"bset_{hashlib.sha256(b.tobytes()).hexdigest()[:16]}" for b in packed]
    df_clean['canonical_symptom_hash'] = byte_hashes

    # Compute conflict groups
    print("   Computing multi-label conflict mappings per unique symptom vector...")
    disease_groups = df_clean.groupby('canonical_symptom_hash')[disease_col].agg(list).to_dict()
    
    conflict_map = {}
    for h, d_list in disease_groups.items():
        uniq_d = sorted(list(set(d_list)))
        is_conf = len(uniq_d) > 1
        conflict_map[h] = {
            'is_conflicting': is_conf,
            'conflict_disease_count': len(uniq_d),
            'conflict_diseases': "; ".join(uniq_d)
        }

    conf_meta = [conflict_map[h] for h in df_clean['canonical_symptom_hash']]
    df_clean['is_conflicting'] = [m['is_conflicting'] for m in conf_meta]
    df_clean['conflict_disease_count'] = [m['conflict_disease_count'] for m in conf_meta]
    df_clean['conflict_diseases'] = [m['conflict_diseases'] for m in conf_meta]

    unique_hashes = sorted(list(conflict_map.keys()))
    n_unique_patterns = len(unique_hashes)
    n_conflicting_patterns = sum(1 for m in conflict_map.values() if m['is_conflicting'])
    n_single_label_patterns = n_unique_patterns - n_conflicting_patterns
    n_conflicting_rows = int(df_clean['is_conflicting'].sum())

    print(f"   Unique Canonical Symptom Patterns: {n_unique_patterns:,}")
    print(f"   Single-Label Patterns:             {n_single_label_patterns:,} ({n_single_label_patterns / n_unique_patterns * 100:.2f}%)")
    print(f"   Conflicting Patterns:              {n_conflicting_patterns:,} ({n_conflicting_patterns / n_unique_patterns * 100:.2f}%)")
    print(f"   Rows Involved in Conflicts:        {n_conflicting_rows:,} ({n_conflicting_rows / len(df_clean) * 100:.2f}%)")

    # Step 4: Group-aware partitioning by canonical hash (Seed 42)
    print("\n5. Performing group-stratified train/val/test split by canonical hash (Seed 42)...")
    rng = np.random.RandomState(RANDOM_SEED)
    shuffled_hashes = list(unique_hashes)
    rng.shuffle(shuffled_hashes)

    train_cutoff = int(n_unique_patterns * 0.70)
    val_cutoff = int(n_unique_patterns * 0.85)

    train_hash_set = set(shuffled_hashes[:train_cutoff])
    val_hash_set = set(shuffled_hashes[train_cutoff:val_cutoff])
    test_hash_set = set(shuffled_hashes[val_cutoff:])

    # Verify zero hash overlap
    assert len(train_hash_set & val_hash_set) == 0, "Train & Val canonical hash overlap detected!"
    assert len(train_hash_set & test_hash_set) == 0, "Train & Test canonical hash overlap detected!"
    assert len(val_hash_set & test_hash_set) == 0, "Val & Test canonical hash overlap detected!"
    print("   -> Cross-split canonical hash overlap: ZERO (0.00% overlap) [PASS]")

    # Partition dataframes
    train_mask = df_clean['canonical_symptom_hash'].isin(train_hash_set)
    val_mask = df_clean['canonical_symptom_hash'].isin(val_hash_set)
    test_mask = df_clean['canonical_symptom_hash'].isin(test_hash_set)

    df_train = df_clean[train_mask].copy()
    df_val = df_clean[val_mask].copy()
    df_test = df_clean[test_mask].copy()

    print(f"   Train Set:      {len(df_train):,} rows ({len(df_train)/len(df_clean)*100:.2f}%) across {len(train_hash_set):,} symptom groups")
    print(f"   Validation Set: {len(df_val):,} rows ({len(df_val)/len(df_clean)*100:.2f}%) across {len(val_hash_set):,} symptom groups")
    print(f"   Test Set:       {len(df_test):,} rows ({len(df_test)/len(df_clean)*100:.2f}%) across {len(test_hash_set):,} symptom groups")
    print(f"   Total Split:    {len(df_train) + len(df_val) + len(df_test):,} rows")

    # Step 5: Save processed research datasets
    print("\n6. Saving cleaned research datasets to 'data/processed/'...")
    print(f"   Saving cleaned dataset to '{CLEANED_CSV_PATH}'...")
    df_clean.to_csv(CLEANED_CSV_PATH, index=False)
    
    print(f"   Saving train set to '{TRAIN_CSV_PATH}'...")
    df_train.to_csv(TRAIN_CSV_PATH, index=False)

    print(f"   Saving validation set to '{VAL_CSV_PATH}'...")
    df_val.to_csv(VAL_CSV_PATH, index=False)

    print(f"   Saving test set to '{TEST_CSV_PATH}'...")
    df_test.to_csv(TEST_CSV_PATH, index=False)

    # Save summary metadata JSON
    summary_data = {
        "dataset_name": "disease_symptoms_binary_cleaned",
        "provenance_status": "UNVERIFIED",
        "licence_status": "UNVERIFIED",
        "clinical_use": "PROHIBITED",
        "research_only": True,
        "random_seed": RANDOM_SEED,
        "raw_rows": raw_rows,
        "exact_duplicates_removed": exact_dupes_removed,
        "cleaned_rows": dedup_rows,
        "raw_symptom_columns": len(all_symptom_cols),
        "constant_zero_columns_removed": len(zero_cols),
        "constant_zero_columns_list": zero_cols,
        "active_symptom_columns": len(active_symptom_cols),
        "total_unique_symptom_groups": n_unique_patterns,
        "single_label_symptom_groups": n_single_label_patterns,
        "conflicting_symptom_groups": n_conflicting_patterns,
        "rows_involved_in_conflicts": n_conflicting_rows,
        "splits": {
            "train": {
                "rows": len(df_train),
                "symptom_groups": len(train_hash_set),
                "group_pct": 70.0,
                "row_pct": round(len(df_train) / len(df_clean) * 100, 2),
                "unique_diseases": int(df_train[disease_col].nunique())
            },
            "validation": {
                "rows": len(df_val),
                "symptom_groups": len(val_hash_set),
                "group_pct": 15.0,
                "row_pct": round(len(df_val) / len(df_clean) * 100, 2),
                "unique_diseases": int(df_val[disease_col].nunique())
            },
            "test": {
                "rows": len(df_test),
                "symptom_groups": len(test_hash_set),
                "group_pct": 15.0,
                "row_pct": round(len(df_test) / len(df_clean) * 100, 2),
                "unique_diseases": int(df_test[disease_col].nunique())
            }
        },
        "cross_split_hash_overlap": {
            "train_val_overlap": len(train_hash_set & val_hash_set),
            "train_test_overlap": len(train_hash_set & test_hash_set),
            "val_test_overlap": len(val_hash_set & test_hash_set)
        },
        "feature_flag_status": {
            "TRIAGE_ML_SHADOW_ENABLED": False,
            "SYMPTOM_PATTERN_SHADOW_ENABLED": False
        },
        "processing_duration_seconds": round(time.time() - t_start, 2)
    }

    with open(SUMMARY_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=2)
    print(f"   Saved split summary JSON to '{SUMMARY_JSON_PATH}'")

    print("\n" + "=" * 70)
    print("  PREPROCESSING COMPLETED SUCCESSFULLY")
    print(f"  Duration: {summary_data['processing_duration_seconds']} seconds")
    print("=" * 70)

if __name__ == "__main__":
    main()
