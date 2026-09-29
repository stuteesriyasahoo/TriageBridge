#!/usr/bin/env python3
"""
scripts/prepare_symptom_disease_dataset.py

Preprocesses data/raw/final_symptoms_to_disease.csv into an isolated,
leakage-free multi-label research dataset.

Key Enhancements for Near-Duplicate Leakage Prevention:
1. Preserves raw CSV unchanged.
2. Normalizes whitespace, casing, and unicode.
3. Deduplicates identical (symptom, disease) pairs.
4. Aggregates multi-label disease targets for identical symptom descriptions.
5. Canonical Symptom-Set Hashing:
   - Tokenizes symptom text into constituent clinical words.
   - Applies basic plural/stem normalization.
   - Strips stop words and medically neutral connectives.
   - Sorts tokens alphabetically and generates order-invariant SHA-256 canonical hash.
6. Group-Aware Splitting by Canonical Hash:
   - Groups all records by canonical symptom-set hash.
   - Partitions hash groups deterministically (Seed 42) into 70% Train / 15% Val / 15% Test.
   - Guarantees ZERO token-set or permutation leakage across splits.
7. Computes near-duplicate Jaccard similarity audit across splits.
8. Writes data/processed/symptom_disease_multilabel.csv, train.csv, validation.csv, test.csv.
"""

import os
import sys
import re
import json
import hashlib
import unicodedata
import pandas as pd
import numpy as np

# Ensure stdout handles UTF-8 on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass

RAW_DATA_PATH = os.path.join("data", "raw", "final_symptoms_to_disease.csv")
PROCESSED_DIR = os.path.join("data", "processed")
MULTILABEL_OUT_PATH = os.path.join(PROCESSED_DIR, "symptom_disease_multilabel.csv")
TRAIN_OUT_PATH = os.path.join(PROCESSED_DIR, "train.csv")
VAL_OUT_PATH = os.path.join(PROCESSED_DIR, "validation.csv")
TEST_OUT_PATH = os.path.join(PROCESSED_DIR, "test.csv")
SUMMARY_JSON_PATH = os.path.join(PROCESSED_DIR, "split_summary.json")

RANDOM_SEED = 42

STOPWORDS = {
    'a', 'an', 'the', 'in', 'on', 'at', 'of', 'to', 'for', 'with', 'is', 'are', 'was',
    'were', 'has', 'have', 'had', 'been', 'experiencing', 'feeling', 'having', 'suffering',
    'from', 'and', 'or', 'but', 'by', 'that', 'this', 'these', 'those', 'also', 'as'
}

def normalize_symptom_text(text: str) -> str:
    """Normalize casing and spacing while preserving hyphens, commas, colons, slashes."""
    if not isinstance(text, str):
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    return text

def normalize_disease_label(label: str) -> str:
    """Normalize disease label string."""
    if not isinstance(label, str):
        return ""
    label = unicodedata.normalize("NFKC", label)
    label = label.lower().strip()
    label = re.sub(r"\s+", " ", label)
    return label

def stem_word(w: str) -> str:
    """Stem word to canonical form handling singular/plural and common inflection variations."""
    if len(w) <= 2:
        return w
    if w.endswith('ies') and len(w) > 4:
        w = w[:-3] + 'y'
    elif w.endswith(('shes', 'ches', 'sses', 'xes', 'zes')) and len(w) > 4:
        w = w[:-2]
    elif w.endswith('s') and len(w) > 3 and not w.endswith(('ss', 'us', 'is')):
        w = w[:-1]
    if w.endswith('e') and len(w) > 3 and not w.endswith(('ee', 'ie', 'oe', 'ye')):
        w = w[:-1]
    return w

def extract_canonical_tokens(text: str) -> list[str]:
    """Extracts alphabetized, plural-normalized distinct token set independent of order."""
    words = re.findall(r"\b[a-z0-9]+\b", str(text).lower())
    canonical = []
    for w in words:
        if w in STOPWORDS or len(w) <= 2:
            continue
        canonical.append(stem_word(w))
    return sorted(list(set(canonical)))

def generate_canonical_hash(text: str) -> str:
    """Order-invariant 16-character SHA-256 hash representing the symptom-set."""
    tokens = extract_canonical_tokens(text)
    canonical_str = " ".join(tokens)
    return f"cset_{hashlib.sha256(canonical_str.encode('utf-8')).hexdigest()[:16]}"

def generate_record_id(text: str) -> str:
    """Stable 16-character SHA-256 based hash ID for a symptom narrative."""
    return f"rec_{hashlib.sha256(str(text).encode('utf-8')).hexdigest()[:16]}"

def prepare_dataset():
    print(f"=== [Step 3 & 4] Preprocessing & Leakage-Safe Splitting ===", flush=True)
    print(f"Reading raw data from: {RAW_DATA_PATH}", flush=True)
    
    if not os.path.exists(RAW_DATA_PATH):
        print(f"ERROR: File not found: {RAW_DATA_PATH}", file=sys.stderr)
        sys.exit(1)

    df_raw = pd.read_csv(RAW_DATA_PATH, encoding="utf-8")
    initial_rows = len(df_raw)
    print(f"Initial raw rows: {initial_rows:,}", flush=True)

    # 1. Clean casing and whitespace
    print("Normalizing symptom text and disease labels...", flush=True)
    df_raw["normalized_symptom_text"] = df_raw["symptom_text"].apply(normalize_symptom_text)
    df_raw["normalized_disease"] = df_raw["diseases"].apply(normalize_disease_label)

    # 2. Remove exact duplicate (symptom, disease) pairs
    df_dedup = df_raw.drop_duplicates(subset=["normalized_symptom_text", "normalized_disease"])
    dedup_rows = len(df_dedup)
    print(f"Rows after removing exact duplicates: {dedup_rows:,} (Removed {initial_rows - dedup_rows:,} duplicate pairs)", flush=True)

    # 3. Group by normalized_symptom_text to aggregate multi-label disease targets
    print("Aggregating multi-label disease sets for identical symptom text...", flush=True)
    grouped = df_dedup.groupby("normalized_symptom_text")["normalized_disease"].apply(
        lambda diseases: sorted(list(set(diseases)))
    ).reset_index()

    # 4. Construct canonical processed columns
    print("Generating canonical symptom-set hashes for permutation-leakage prevention...", flush=True)
    grouped["record_id"] = grouped["normalized_symptom_text"].apply(generate_record_id)
    grouped["canonical_symptom_hash"] = grouped["normalized_symptom_text"].apply(generate_canonical_hash)
    grouped["disease_labels"] = grouped["normalized_disease"].apply(lambda d: ";".join(d))
    grouped["disease_label_count"] = grouped["normalized_disease"].apply(len)
    grouped["source_dataset"] = "final_symptoms_to_disease"
    grouped["is_conflicting_label_group"] = grouped["disease_label_count"] > 1
    grouped["is_validated"] = False
    grouped["research_disclaimer"] = "UNVERIFIED_RESEARCH_DATA_NOT_FOR_DIAGNOSIS_OR_TREATMENT"

    df_processed = grouped[[
        "record_id",
        "canonical_symptom_hash",
        "normalized_symptom_text",
        "disease_labels",
        "disease_label_count",
        "source_dataset",
        "is_conflicting_label_group",
        "is_validated",
        "research_disclaimer"
    ]].copy()

    total_processed_records = len(df_processed)
    unique_canonical_hashes = df_processed["canonical_symptom_hash"].nunique()
    print(f"Total unique multi-label symptom records: {total_processed_records:,}", flush=True)
    print(f"Total distinct canonical symptom-set clusters: {unique_canonical_hashes:,}", flush=True)

    conflicting_count = int(df_processed["is_conflicting_label_group"].sum())
    single_label_count = total_processed_records - conflicting_count
    max_labels = int(df_processed["disease_label_count"].max())

    print(f"Single-label symptom records: {single_label_count:,} ({single_label_count / total_processed_records * 100:.2f}%)", flush=True)
    print(f"Conflicting / multi-label symptom records: {conflicting_count:,} ({conflicting_count / total_processed_records * 100:.2f}%)", flush=True)
    print(f"Maximum disease labels associated with one symptom description: {max_labels}", flush=True)

    # 5. Save canonical processed dataset
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    df_processed.to_csv(MULTILABEL_OUT_PATH, index=False, encoding="utf-8")
    print(f"Saved canonical multi-label dataset to: {MULTILABEL_OUT_PATH}", flush=True)

    # 6. Group-Aware Leakage-Safe Splitting by Canonical Symptom-Set Hash
    # Shuffling clusters by canonical_symptom_hash guarantees that ALL symptom records with
    # identical words (regardless of symptom ordering, punctuation, or basic plurals) are
    # placed entirely within a single split!
    print(f"\nPerforming group-aware canonical-hash split (Seed: {RANDOM_SEED})...", flush=True)
    unique_hashes = df_processed["canonical_symptom_hash"].drop_duplicates().values
    np.random.seed(RANDOM_SEED)
    shuffled_hashes = np.random.permutation(unique_hashes)

    n_total_hashes = len(shuffled_hashes)
    n_train_hashes = int(0.70 * n_total_hashes)
    n_val_hashes = int(0.15 * n_total_hashes)

    train_hashes = set(shuffled_hashes[:n_train_hashes])
    val_hashes = set(shuffled_hashes[n_train_hashes:n_train_hashes + n_val_hashes])
    test_hashes = set(shuffled_hashes[n_train_hashes + n_val_hashes:])

    df_train = df_processed[df_processed["canonical_symptom_hash"].isin(train_hashes)].copy()
    df_val = df_processed[df_processed["canonical_symptom_hash"].isin(val_hashes)].copy()
    df_test = df_processed[df_processed["canonical_symptom_hash"].isin(test_hashes)].copy()

    # 7. Leakage Assertion Verification
    train_symptoms = set(df_train["normalized_symptom_text"])
    val_symptoms = set(df_val["normalized_symptom_text"])
    test_symptoms = set(df_test["normalized_symptom_text"])

    overlap_train_val = len(train_symptoms.intersection(val_symptoms))
    overlap_train_test = len(train_symptoms.intersection(test_symptoms))
    overlap_val_test = len(val_symptoms.intersection(test_symptoms))

    train_csets = set(df_train["canonical_symptom_hash"])
    val_csets = set(df_val["canonical_symptom_hash"])
    test_csets = set(df_test["canonical_symptom_hash"])

    cset_overlap_train_val = len(train_csets.intersection(val_csets))
    cset_overlap_train_test = len(train_csets.intersection(test_csets))
    cset_overlap_val_test = len(val_csets.intersection(test_csets))

    print(f"Exact text overlap (Train ∩ Validation): {overlap_train_val}", flush=True)
    print(f"Exact text overlap (Train ∩ Test):       {overlap_train_test}", flush=True)
    print(f"Exact text overlap (Validation ∩ Test):  {overlap_val_test}", flush=True)
    print(f"Canonical set overlap (Train ∩ Validation): {cset_overlap_train_val}", flush=True)
    print(f"Canonical set overlap (Train ∩ Test):       {cset_overlap_train_test}", flush=True)
    print(f"Canonical set overlap (Validation ∩ Test):  {cset_overlap_val_test}", flush=True)

    assert overlap_train_val == 0, "Train-Val exact symptom text leakage detected!"
    assert overlap_train_test == 0, "Train-Test exact symptom text leakage detected!"
    assert overlap_val_test == 0, "Val-Test exact symptom text leakage detected!"
    assert cset_overlap_train_val == 0, "Train-Val canonical set leakage detected!"
    assert cset_overlap_train_test == 0, "Train-Test canonical set leakage detected!"
    assert cset_overlap_val_test == 0, "Val-Test canonical set leakage detected!"

    print("CANONICAL LEAKAGE INTEGRITY VERIFIED: 0% symptom-set overlap across all splits.", flush=True)

    # 8. Sample-based Near-Duplicate Jaccard Similarity Audit
    print("\nAuditing near-duplicate Jaccard similarity across splits (sample of 1,000 test records)...", flush=True)
    test_sample = df_test.sample(n=min(1000, len(df_test)), random_state=RANDOM_SEED)
    train_tokens_list = [set(extract_canonical_tokens(t)) for t in df_train["normalized_symptom_text"].sample(n=min(5000, len(df_train)), random_state=RANDOM_SEED)]

    high_similarity_count = 0  # Jaccard > 0.85
    for _, row in test_sample.iterrows():
        t_tokens = set(extract_canonical_tokens(row["normalized_symptom_text"]))
        if not t_tokens:
            continue
        for tr_tokens in train_tokens_list:
            union = len(t_tokens.union(tr_tokens))
            if union == 0:
                continue
            jaccard = len(t_tokens.intersection(tr_tokens)) / union
            if jaccard >= 0.85:
                high_similarity_count += 1
                break

    print(f"Near-duplicate test candidates with Jaccard >= 0.85 to train sample: {high_similarity_count} / {len(test_sample)} ({high_similarity_count / len(test_sample) * 100:.2f}%)", flush=True)

    # 9. Save partitioned CSVs
    df_train.to_csv(TRAIN_OUT_PATH, index=False, encoding="utf-8")
    df_val.to_csv(VAL_OUT_PATH, index=False, encoding="utf-8")
    df_test.to_csv(TEST_OUT_PATH, index=False, encoding="utf-8")

    print(f"Saved Train Split:      {len(df_train):,} rows -> {TRAIN_OUT_PATH}", flush=True)
    print(f"Saved Validation Split: {len(df_val):,} rows -> {VAL_OUT_PATH}", flush=True)
    print(f"Saved Test Split:       {len(df_test):,} rows -> {TEST_OUT_PATH}", flush=True)

    # 10. Split summary JSON
    summary = {
        "dataset_name": "final_symptoms_to_disease_canonical_split",
        "random_seed": RANDOM_SEED,
        "initial_raw_rows": initial_rows,
        "exact_duplicates_removed": initial_rows - dedup_rows,
        "unique_multilabel_records": total_processed_records,
        "distinct_canonical_symptom_hash_clusters": unique_canonical_hashes,
        "single_label_records": single_label_count,
        "conflicting_label_records": conflicting_count,
        "max_diseases_per_symptom": max_labels,
        "split_sizes": {
            "train": {
                "rows": len(df_train),
                "percentage": round(len(df_train) / total_processed_records * 100, 2),
                "distinct_canonical_hashes": len(train_hashes)
            },
            "validation": {
                "rows": len(df_val),
                "percentage": round(len(df_val) / total_processed_records * 100, 2),
                "distinct_canonical_hashes": len(val_hashes)
            },
            "test": {
                "rows": len(df_test),
                "percentage": round(len(df_test) / total_processed_records * 100, 2),
                "distinct_canonical_hashes": len(test_hashes)
            }
        },
        "leakage_verification": {
            "train_val_exact_overlap": overlap_train_val,
            "train_test_exact_overlap": overlap_train_test,
            "val_test_exact_overlap": overlap_val_test,
            "train_val_canonical_set_overlap": cset_overlap_train_val,
            "train_test_canonical_set_overlap": cset_overlap_train_test,
            "val_test_canonical_set_overlap": cset_overlap_val_test,
            "status": "ZERO_LEAKAGE_CONFIRMED"
        }
    }

    with open(SUMMARY_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"Saved split summary to: {SUMMARY_JSON_PATH}", flush=True)
    print(f"=== Preprocessing Pipeline Completed Successfully ===", flush=True)

if __name__ == "__main__":
    prepare_dataset()
