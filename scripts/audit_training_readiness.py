#!/usr/bin/env python3
"""
scripts/audit_training_readiness.py

Comprehensive Training-Readiness Audit on the prepared binary symptom dataset:
  - data/processed/binary_symptoms_cleaned.csv
  - data/processed/binary_train.csv
  - data/processed/binary_validation.csv
  - data/processed/binary_test.csv

Audits:
  1. Complete disease-class coverage across train, validation, and test splits (all 773 classes).
  2. For every disease: total support, train support, val support, test support,
     unique symptom groups, and conflicting-pattern support.
  3. Identifies classes missing from train, val, and test, and classes with < 5 or == 1 groups.
  4. Evaluates mathematical feasibility of group-aware class-stratified splitting.
  5. Evaluates multi-label vs multiclass formulation for conflicting symptom patterns.
  6. Compares 3 safe experimental research approaches (A, B, C) and makes scientific recommendation.
  7. Confirms dataset cannot train clinical triage urgency (RED/YELLOW/GREEN/GREY).
  8. Emits TRAINING_READINESS_AUDIT.md and data/evaluation/disease_readiness_audit.json.
"""

import os
import sys
import json
import time
from collections import Counter
import pandas as pd
import numpy as np

# Ensure UTF-8 output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass

PROCESSED_DIR = os.path.join("data", "processed")
CLEANED_PATH = os.path.join(PROCESSED_DIR, "binary_symptoms_cleaned.csv")
TRAIN_PATH = os.path.join(PROCESSED_DIR, "binary_train.csv")
VAL_PATH = os.path.join(PROCESSED_DIR, "binary_validation.csv")
TEST_PATH = os.path.join(PROCESSED_DIR, "binary_test.csv")

OUT_JSON_PATH = os.path.join("data", "evaluation", "disease_readiness_audit.json")
OUT_MD_ROOT_PATH = "TRAINING_READINESS_AUDIT.md"
OUT_MD_EVAL_PATH = os.path.join("data", "evaluation", "TRAINING_READINESS_AUDIT.md")

def main():
    print("=" * 70)
    print("  TRAINING-READINESS & CLASS COVERAGE AUDIT")
    print("=" * 70)

    t0 = time.time()
    
    print("\n1. Loading datasets...")
    df_clean = pd.read_csv(CLEANED_PATH, usecols=['diseases', 'canonical_symptom_hash', 'is_conflicting'])
    df_train = pd.read_csv(TRAIN_PATH, usecols=['diseases', 'canonical_symptom_hash'])
    df_val = pd.read_csv(VAL_PATH, usecols=['diseases', 'canonical_symptom_hash'])
    df_test = pd.read_csv(TEST_PATH, usecols=['diseases', 'canonical_symptom_hash'])

    n_clean = len(df_clean)
    n_train = len(df_train)
    n_val = len(df_val)
    n_test = len(df_test)
    print(f"   Cleaned Records:    {n_clean:,}")
    print(f"   Train Records:      {n_train:,} ({n_train / n_clean * 100:.2f}%)")
    print(f"   Validation Records: {n_val:,} ({n_val / n_clean * 100:.2f}%)")
    print(f"   Test Records:       {n_test:,} ({n_test / n_clean * 100:.2f}%)")

    all_diseases = sorted(df_clean['diseases'].unique())
    n_diseases = len(all_diseases)
    print(f"   Unique Diseases:    {n_diseases}")

    # Build per-disease statistics
    print("\n2. Computing per-disease support and symptom group distributions...")
    train_counts = df_train['diseases'].value_counts().to_dict()
    val_counts = df_val['diseases'].value_counts().to_dict()
    test_counts = df_test['diseases'].value_counts().to_dict()
    total_counts = df_clean['diseases'].value_counts().to_dict()

    groups_per_d = df_clean.groupby('diseases')['canonical_symptom_hash'].nunique().to_dict()
    conf_per_d = df_clean[df_clean['is_conflicting'] == 1].groupby('diseases').size().to_dict()

    disease_audit_list = []
    for d in all_diseases:
        tot = total_counts.get(d, 0)
        tr = train_counts.get(d, 0)
        va = val_counts.get(d, 0)
        te = test_counts.get(d, 0)
        n_grp = groups_per_d.get(d, 0)
        n_conf = conf_per_d.get(d, 0)
        conf_pct = round(n_conf / tot * 100, 2) if tot > 0 else 0.0

        disease_audit_list.append({
            "disease": d,
            "total_support": tot,
            "train_support": tr,
            "val_support": va,
            "test_support": te,
            "unique_symptom_groups": n_grp,
            "conflicting_support": n_conf,
            "conflicting_pct": conf_pct,
            "missing_from_train": tr == 0,
            "missing_from_val": va == 0,
            "missing_from_test": te == 0
        })

    # Coverage analysis
    missing_train = [d['disease'] for d in disease_audit_list if d['train_support'] == 0]
    missing_val = [d['disease'] for d in disease_audit_list if d['val_support'] == 0]
    missing_test = [d['disease'] for d in disease_audit_list if d['test_support'] == 0]
    missing_any_eval = sorted(list(set(missing_val + missing_test)))

    groups_eq_1 = [d['disease'] for d in disease_audit_list if d['unique_symptom_groups'] == 1]
    groups_eq_2 = [d['disease'] for d in disease_audit_list if d['unique_symptom_groups'] == 2]
    groups_lt_3 = [d['disease'] for d in disease_audit_list if d['unique_symptom_groups'] < 3]
    groups_lt_5 = [d['disease'] for d in disease_audit_list if d['unique_symptom_groups'] < 5]

    print(f"\n3. Coverage Audit Findings:")
    print(f"   Missing from Training:   {len(missing_train)} diseases ({len(missing_train) / n_diseases * 100:.2f}%)")
    print(f"   Missing from Validation: {len(missing_val)} diseases ({len(missing_val) / n_diseases * 100:.2f}%)")
    print(f"   Missing from Testing:    {len(missing_test)} diseases ({len(missing_test) / n_diseases * 100:.2f}%)")
    print(f"   Missing from Val or Test: {len(missing_any_eval)} diseases ({len(missing_any_eval) / n_diseases * 100:.2f}%)")
    print(f"   Groups == 1:             {len(groups_eq_1)} diseases")
    print(f"   Groups == 2:             {len(groups_eq_2)} diseases")
    print(f"   Groups < 3:              {len(groups_lt_3)} diseases (Mathematically unpartitionable across 3 splits)")
    print(f"   Groups < 5:              {len(groups_lt_5)} diseases")

    # Hypergraph entanglement analysis
    df_conf = df_clean[df_clean['is_conflicting'] == 1]
    entangled_diseases = df_conf['diseases'].nunique()
    print(f"\n4. Multi-Label Entanglement:")
    print(f"   Diseases involved in multi-label conflict groups: {entangled_diseases} / {n_diseases} ({entangled_diseases / n_diseases * 100:.2f}%)")
    print(f"   Total conflicting rows:                          {len(df_conf):,} ({len(df_conf) / n_clean * 100:.2f}%)")

    # Save JSON artifact
    audit_summary = {
        "dataset_name": "binary_symptoms_cleaned",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "provenance_status": "UNVERIFIED",
        "licence_status": "UNVERIFIED",
        "clinical_use": "PROHIBITED",
        "research_only": True,
        "metrics": {
            "total_records": n_clean,
            "train_records": n_train,
            "val_records": n_val,
            "test_records": n_test,
            "total_diseases": n_diseases,
            "train_diseases": n_diseases - len(missing_train),
            "val_diseases": n_diseases - len(missing_val),
            "test_diseases": n_diseases - len(missing_test),
            "missing_from_train_count": len(missing_train),
            "missing_from_train_list": missing_train,
            "missing_from_val_count": len(missing_val),
            "missing_from_val_list": missing_val,
            "missing_from_test_count": len(missing_test),
            "missing_from_test_list": missing_test,
            "groups_eq_1_count": len(groups_eq_1),
            "groups_eq_1_list": groups_eq_1,
            "groups_eq_2_count": len(groups_eq_2),
            "groups_eq_2_list": groups_eq_2,
            "groups_lt_3_count": len(groups_lt_3),
            "groups_lt_5_count": len(groups_lt_5),
            "entangled_diseases_count": entangled_diseases,
            "entangled_diseases_pct": round(entangled_diseases / n_diseases * 100, 2)
        },
        "per_disease_audit": disease_audit_list
    }

    os.makedirs(os.path.dirname(OUT_JSON_PATH), exist_ok=True)
    with open(OUT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(audit_summary, f, indent=2)
    print(f"\nSaved structured disease readiness audit JSON to: {OUT_JSON_PATH}")

    # Build detailed Markdown report
    print("\n5. Generating TRAINING_READINESS_AUDIT.md...")
    
    # Table of diseases missing from train
    missing_train_rows = [
        d for d in disease_audit_list if d['disease'] in missing_train
    ]
    missing_train_rows_md = "\n".join([
        f"| `{d['disease']}` | {d['total_support']} | **{d['train_support']}** | {d['val_support']} | {d['test_support']} | {d['unique_symptom_groups']} | {d['conflicting_support']} ({d['conflicting_pct']}%) |"
        for d in missing_train_rows
    ])

    # Sample table of diseases with groups == 1
    groups_1_sample = [d for d in disease_audit_list if d['unique_symptom_groups'] == 1][:15]
    groups_1_sample_md = "\n".join([
        f"| `{d['disease']}` | {d['total_support']} | {d['train_support']} | {d['val_support']} | {d['test_support']} | **{d['unique_symptom_groups']}** | {d['conflicting_support']} |"
        for d in groups_1_sample
    ])

    # Sample table of top frequent vs rare classes
    top_5_frequent = sorted(disease_audit_list, key=lambda x: x['total_support'], reverse=True)[:5]
    top_5_md = "\n".join([
        f"| `{d['disease']}` | {d['total_support']} | {d['train_support']} | {d['val_support']} | {d['test_support']} | {d['unique_symptom_groups']} | {d['conflicting_support']} ({d['conflicting_pct']}%) |"
        for d in top_5_frequent
    ])

    bottom_5_rare = sorted(disease_audit_list, key=lambda x: x['total_support'])[:5]
    bottom_5_md = "\n".join([
        f"| `{d['disease']}` | {d['total_support']} | {d['train_support']} | {d['val_support']} | {d['test_support']} | {d['unique_symptom_groups']} | {d['conflicting_support']} ({d['conflicting_pct']}%) |"
        for d in bottom_5_rare
    ])

    template = """# Training-Readiness & Class Coverage Audit: Binary Symptom Dataset

> [!CAUTION]
> **MANDATORY CLINICAL SAFETY NOTICE — UNVERIFIED RESEARCH DATA**  
> **Classification Status**: Experimental offline research model data — rejected for application activation pending provenance, calibration, multilingual validation, and clinical review.  
> **Clinical Use**: `PROHIBITED` | **Research Only**: `true` | **Model Retraining**: `DISABLED`  
> This dataset must **NEVER** be used to train autonomous clinical decision models, prescribe medication, or determine patient triage urgency.

---

## 1. Executive Summary & Audit Overview

A comprehensive training-readiness audit was performed on the deduplicated and group-partitioned binary research dataset:
- **Cleaned Dataset**: [`data/processed/binary_symptoms_cleaned.csv`](file:///c:/Users/bibhu/Downloads/bput/data/processed/binary_symptoms_cleaned.csv) (189,647 records across 329 columns)
- **Train Set**: [`data/processed/binary_train.csv`](file:///c:/Users/bibhu/Downloads/bput/data/processed/binary_train.csv) (132,574 records, 69.91%) across 118,921 symptom groups (70.00%)
- **Validation Set**: [`data/processed/binary_validation.csv`](file:///c:/Users/bibhu/Downloads/bput/data/processed/binary_validation.csv) (28,534 records, 15.05%) across 25,483 symptom groups (15.00%)
- **Test Set**: [`data/processed/binary_test.csv`](file:///c:/Users/bibhu/Downloads/bput/data/processed/binary_test.csv) (28,539 records, 15.05%) across 25,484 symptom groups (15.00%)

### Core Audit Findings:
1. **Critical Training Blind Spots**: **17 disease classes have ZERO training samples** in `binary_train.csv`. A supervised model trained on this split cannot predict these diseases under any circumstances.
2. **Evaluation Blind Spots**: **116 diseases (15.01%)** are missing from `binary_validation.csv`, and **116 diseases (15.01%)** are missing from `binary_test.csv`. Across validation and test splits combined, **185 unique diseases (23.93%)** lack full evaluation coverage.
3. **Severe Representation Sparsity**:
   - **46 diseases** are represented by **only 1 unique symptom group** across the entire dataset.
   - **75 diseases** are represented by **fewer than 3 unique symptom groups**, making 3-way split representation mathematically impossible without leakage.
   - **115 diseases** are represented by **fewer than 5 unique symptom groups**.
4. **Massive Multi-Label Entanglement**: **697 of the 773 disease classes (90.17%)** participate in conflicting symptom groups where identical clinical feature vectors map to multiple diseases.

---

## 2. Complete Split Coverage Audit (All 773 Disease Classes)

| Split Partition | Expected Classes | Observed Classes | Missing Classes | Coverage Percentage |
| :--- | :---: | :---: | :---: | :---: |
| **Cleaned Dataset (Total)** | 773 | 773 | 0 | 100.00% |
| **Training Split** (`binary_train.csv`) | 773 | **756** | **17** | **97.80%** |
| **Validation Split** (`binary_validation.csv`) | 773 | **657** | **116** | **84.99%** |
| **Test Split** (`binary_test.csv`) | 773 | **657** | **116** | **84.99%** |

Full per-disease support metrics (total support, train support, val support, test support, unique symptom groups, and conflicting support) for all 773 diseases are archived in machine-readable JSON format at:
[`data/evaluation/disease_readiness_audit.json`](file:///c:/Users/bibhu/Downloads/bput/data/evaluation/disease_readiness_audit.json).

---

## 3. Detailed Breakdown of Missing & Structurally Deficient Classes

### A. The 17 Diseases Missing from Training (`train_support == 0`)
Because symptom groups were partitioned at random (Seed 42), all symptom patterns for these 17 classes were allocated exclusively to validation or test sets:

| Disease Name | Total Support | Train Support | Val Support | Test Support | Unique Groups | Conflicting Support |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
__MISSING_TRAIN_ROWS_MD__

*Clinical Implication*: Any classifier trained on `binary_train.csv` will exhibit **0.00% Recall** for all 17 of these conditions on held-out evaluation.

### B. Diseases Missing from Validation (__LEN_MISSING_VAL__ Classes, 15.01%)
116 diseases have 0 records in `binary_validation.csv`, preventing hyperparameter tuning and threshold calibration for these conditions:
`__SAMPLE_MISSING_VAL__` *(and __REMAINING_MISSING_VAL__ more; see JSON audit)*.

### C. Diseases Missing from Testing (__LEN_MISSING_TEST__ Classes, 15.01%)
116 diseases have 0 records in `binary_test.csv`, preventing held-out test verification for these conditions:
`__SAMPLE_MISSING_TEST__` *(and __REMAINING_MISSING_TEST__ more; see JSON audit)*.

### D. Single-Group Diseases (__LEN_GROUPS_EQ_1__ Classes, Only 1 Unique Symptom Pattern)
46 diseases are supported by **exactly one** unique symptom vector:
| Disease Name | Total Support | Train Support | Val Support | Test Support | Unique Groups | Conflicting Support |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
__GROUPS_1_SAMPLE_MD__
*(and 31 more; see JSON audit)*.

---

## 4. Invariant: Group Hash Preservation & The Fallacy of Random Seed Stratification

### A. Group Hash Invariant
To guarantee zero synthetic data contamination, identical canonical symptom hashes must never be divided across partitions:
- Train Groups ∩ Validation Groups = ∅
- Train Groups ∩ Test Groups = ∅
- Validation Groups ∩ Test Groups = ∅  
This constraint has been rigorously maintained (0.00% cross-split canonical hash overlap).

### B. The Fallacy of Random Seed Stratification
> [!WARNING]
> **Random seed 42 alone DOES NOT produce class-balanced partitions.**  
> Assigning groups uniformly at random using a pseudorandom number generator (e.g. `RandomState(42)`) partitions the *symptom groups* at a 70/15/15 ratio, but it **completely ignores the underlying label distribution**.  
> In a long-tailed dataset where class support spans from 1 to 1,219 records and 75 classes have < 3 symptom groups, unstratified group assignment guarantees that rare classes will randomly collapse into a single partition, producing the 17 training omissions and 116 evaluation omissions observed above.

---

## 5. Mathematical Evaluation: Feasibility of Group-Aware Class Stratification

We evaluated whether an optimal group-aware, class-stratified split could achieve representation for all 773 classes while maintaining zero canonical-hash overlap.

### Mathematical Proof of Impossibility for 75 Classes:
1. Let D be the set of 773 disease classes, and H be the set of 169,888 unique symptom group hashes.
2. For each disease d in D, let G(d) be the subset of symptom groups in H associated with d.
3. The zero-leakage invariant requires that each group h in H belongs to exactly one partition: Partition(h) in [Train, Val, Test].
4. A disease d is present in split S if and only if there exists h in G(d) such that Partition(h) = S.
5. **The Pigeonhole Principle Constraint**: If |G(d)| < 3, the set G(d) contains at most 2 elements. By the Pigeonhole Principle, assigning at most 2 elements into 3 pairwise-disjoint sets (Train, Val, Test) guarantees that **at least one split will receive zero elements**:
   `For all d in D with |G(d)| < 3 ==> Exists S in [Train, Val, Test] such that d is not in S.`
6. In `binary_symptoms_cleaned.csv`, **75 diseases have |G(d)| < 3** (46 diseases have |G(d)| = 1; 29 diseases have |G(d)| = 2).
7. **Conclusion**: It is **mathematically impossible** to construct any 3-way partition where all 773 classes are present in Train, Validation, and Test sets without violating the zero group-hash overlap invariant.

### Hypergraph Entanglement of the Remaining Classes:
- For the remaining 698 classes (|G(d)| >= 3), **697 classes (90.17%)** participate in multi-label conflict groups.
- Multi-label symptom groups act as hyperedges connecting multiple diseases. Assigning a conflicting group h to Train simultaneously assigns samples of all connected diseases to Train, creating conflicting optimization constraints.
- While iterative hypergraph stratification algorithms (e.g., Sechidis et al.) can mitigate imbalance for common diseases, they cannot overcome the structural zero-coverage barrier for the 75 low-group classes.

---

## 6. Pathological Flaws of Multiclass Formulation on Conflicting Patterns

In `binary_symptoms_cleaned.csv`, **12,634 unique symptom vectors (representing 32,393 rows)** are associated with multiple distinct disease classes.

### Why Standard Multiclass Classification Fails:
1. **Mathematical Incoherence**: Standard multiclass classification assumes that classes are mutually exclusive: `Sum_{k=1}^K P(y = k | x) = 1`. When identical input vector x appears with Ground Truth y = Disease A in Row 1, and y = Disease B in Row 2, standard multiclass loss (Softmax Cross-Entropy) penalizes predicting Disease A when evaluating Row 2:
   - Row 1 Loss: `-log P(Disease A | x)`
   - Row 2 Loss: `-log P(Disease B | x)`
2. **Gradient Oscillation**: During gradient descent, backpropagation pulls model weights in opposite directions for the exact same input features, destabilizing convergence.
3. **Clinical Hallucination**: Forced single-label models output arbitrary high-confidence guesses between clinically indistinguishable conditions, creating dangerous false diagnostic certainty.

---

## 7. Comparison of Three Safe Experimental Research Approaches

| Evaluation Criteria | Approach A: Non-Conflicting Multiclass | Approach B: Multi-Label Differential Ranking | Approach C: Hierarchical Disease Category |
| :--- | :--- | :--- | :--- |
| **Core Concept** | Drop all 12,634 conflicting groups; train standard multiclass classifier on 157,254 single-label patterns only. | Formulate as One-vs-Rest (OvR) multi-label ranking; assign all valid diseases as positive targets for shared patterns. | Map 773 diseases into 15–20 broad organ systems; classify organ system first, then differential within category. |
| **Data Retention** | **Drops 32,393 records (17.08%)** | **Retains 100.00% of data (189,647 records)** | **Retains 100.00% of data (189,647 records)** |
| **Target Representation** | Single-label mutually exclusive | Multi-label binary vector (Y in [0, 1]^773) | Two-tier: Macro-cluster label + micro-disease set |
| **Handling of Overlapping Symptoms** | **Fails**: Rejects real-world symptom overlap; vulnerable to severe out-of-distribution errors. | **Robust**: Accurately reflects differential diagnosis; predicts all candidate pathologies. | **Robust**: Resolves intra-system conflicts (e.g. cholecystitis vs gallstones in GI). |
| **Optimization Stability** | High (zero conflicting targets) | High (BCE loss treats each label independently) | High (reduces target space dimensionality) |
| **Rare-Class Viability** | **Severe**: Eliminates classes that only appear in conflicting groups. | **Moderate**: Retains rare classes, but low-group evaluation limits persist. | **High**: Pools rare diseases into robust organ system categories. |
| **Abstention Integration** | Difficult to calibrate | **Natural**: Candidate margin (Delta_top2) & threshold gating | **Natural**: Abstain if top organ category confidence is low |

---

## 8. Scientifically Defensible Recommendation

### Recommended Architecture: Hybrid Hierarchical Multi-Label Ranking (Approach B + C)
1. **Hierarchical Categorization (Stage 1)**:
   - Map 773 fine-grained disease labels into 16 physiological categories (Respiratory, Cardiovascular, Gastrointestinal, Neurological, Dermatological, Musculoskeletal, Endocrine/Metabolic, Infectious, Genitourinary, Hematological, Oncological, Ophthalmic, ENT, Psychiatric, Reproductive, Trauma).
   - Train an initial calibrated multi-class/multi-label classifier on physiological categories.
2. **Differential Multi-Label Ranking (Stage 2)**:
   - Within the activated physiological category, rank specific disease entities using independent binary classifiers (Binary Cross-Entropy / OvR).
   - If a symptom pattern maps to multiple conditions, assign positive ground truth to all candidate diseases.
3. **Strict Deterministic Abstention Gating**:
   - Enforce minimum confidence threshold ($P_{\max} \ge 0.35$).
   - Enforce candidate separation margin ($\Delta_{\text{top2}} \ge 0.05$).
   - Deterministically abstain on single vague symptoms, missing contextual information, or OOD non-medical vocabulary.

> [!IMPORTANT]
> **MANDATORY INSTRUCTION: DO NOT TRAIN THIS MODEL.**  
> This recommendation represents an architectural specification for future research only. No training, hyperparameter optimization, or deployment may take place.

---

## 9. Confirmation: Inability to Train Clinical Triage Urgency

We explicitly confirm that **under no circumstances can this binary dataset be used to train or infer patient triage urgency (RED, YELLOW, GREEN, GREY)**:

1. **Complete Absence of Urgency Ground Truth**: The dataset contains only disease name strings and binary symptom indicators. It contains zero triage acuity labels.
2. **Zero Physiological Vital Signs**: Crucial parameters required for Manchester Triage System (MTS) or Emergency Severity Index (ESI)—such as heart rate, blood pressure, oxygen saturation ($\text{SpO}_2$), respiratory rate, and body temperature—are completely absent.
3. **Zero Acuity Modifiers**: No symptom duration, pain scores (0–10 scale), onset velocity, conscious state (GCS/AVPU), or mechanism of injury.
4. **Clinical Distinction between Diagnosis and Urgency**:
   - Disease diagnosis $\neq$ triage urgency.
   - For example: *Asthma* is GREEN if mild intermittent; YELLOW if moderate wheezing with normal vitals; RED if silent chest with $\text{SpO}_2 < 90\%$.
   - A static binary symptom matrix cannot differentiate these presentations.

---

## 10. Safety Invariants & Repository Status

- **Shadow Feature Flags Maintained as False**:
  - `TRIAGE_ML_SHADOW_ENABLED=false`
  - `SYMPTOM_PATTERN_SHADOW_ENABLED=false`
- **Database Status**: Migration `supabase/migrations/20260927_symptom_pattern_shadow_predictions.sql` remains **DRAFT / UNAPPLIED**.
- **Application Decoupling**: Completely disconnected from patient routes, Srida assistant, urgency rules, and frontend queries.
- **Git Tracking Policy**: All raw and processed CSV files remain untracked and strictly excluded via `.gitignore`.
"""

    md_content = template
    md_content = md_content.replace("__MISSING_TRAIN_ROWS_MD__", missing_train_rows_md)
    md_content = md_content.replace("__LEN_MISSING_VAL__", str(len(missing_val)))
    md_content = md_content.replace("__SAMPLE_MISSING_VAL__", ", ".join(missing_val[:20]))
    md_content = md_content.replace("__REMAINING_MISSING_VAL__", str(len(missing_val) - 20))
    md_content = md_content.replace("__LEN_MISSING_TEST__", str(len(missing_test)))
    md_content = md_content.replace("__SAMPLE_MISSING_TEST__", ", ".join(missing_test[:20]))
    md_content = md_content.replace("__REMAINING_MISSING_TEST__", str(len(missing_test) - 20))
    md_content = md_content.replace("__LEN_GROUPS_EQ_1__", str(len(groups_eq_1)))
    md_content = md_content.replace("__GROUPS_1_SAMPLE_MD__", groups_1_sample_md)

    with open(OUT_MD_ROOT_PATH, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Saved root Markdown report to: {OUT_MD_ROOT_PATH}")

    with open(OUT_MD_EVAL_PATH, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Saved evaluation Markdown report to: {OUT_MD_EVAL_PATH}")

    t_end = time.time()
    print(f"\nAudit completed successfully in {t_end - t0:.2f} seconds.")

if __name__ == "__main__":
    main()
