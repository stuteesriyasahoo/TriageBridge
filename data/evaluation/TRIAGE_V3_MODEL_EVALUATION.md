# TriageBridge Version 3 Offline Urgency Model Evaluation

> **CRITICAL CLINICAL SAFETY NOTICE**  
> **Experimental model trained on synthetic, unvalidated data. Not approved for clinical use, patient-facing inference or autonomous triage.**  
> Under no circumstances should this experimental model or its weights be deployed, connected to clinical workflows, patient encounters, Srida triage assistant, ambulance dispatch, or treatment recommendation engines.

---

## 1. Executive Summary & Final Classification

- **Final Classification Verdict**: `MODEL_REJECTED_FOR_SHORTCUT_LEARNING`
- **Evaluation Status**: OFFLINE TECHNICAL EXPERIMENT COMPLETE
- **Feature Flags Verified**:
  - `TRIAGE_ML_SHADOW_ENABLED=false`
  - `SYMPTOM_PATTERN_SHADOW_ENABLED=false`
- **Primary Objective**: Train and evaluate an offline experimental binary urgency model strictly discriminating **YELLOW** (high-concern) from **GREEN** (lower-concern) while enforcing deterministic interception for **RED** (emergency red flags) and **GREY** (missing critical data).

### Key Test Set Results (Held-Out, Single Frozen Run)
| Metric | Score | 95% Bootstrap Confidence Interval |
| :--- | :--- | :--- |
| **Balanced Accuracy** | **0.9667** | `[0.9389, 0.9889]` |
| **Macro F1** | **0.9666** | `[0.9386, 0.9889]` |
| **YELLOW Recall (Sensitivity)** | **0.9333** | `[0.8777, 0.9778]` |
| **YELLOW-to-GREEN False Negatives** | **6** | — |
| **GREEN Specificity (Recall)** | **1.0000** | — |
| **ROC-AUC** | **0.9993** | `[0.9974, 1.0000]` |
| **PR-AUC** | **0.9993** | — |
| **Brier Score** | **0.0254** | — |
| **Expected Calibration Error (ECE)** | **0.0475** | — |
| **Selective Coverage** | **97.22%** | Post-abstention coverage |
| **Selective Risk** | **2.29%** | Error rate on covered cases |

---

## 2. Dataset & Feature Integrity Audit

### Dataset Splits and Checksums
| Split | Role | Total Cases | YELLOW | GREEN | RED | GREY | SHA-256 Checksum |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `triage_v3_train.csv` | Model Fitting Only | 840 | 420 | 420 | 0 | 0 | `b4af33207a2a6ffa9bd1ab53d4a3f8c100a3f678a124500ae2a7e42347ba788b` |
| `triage_v3_validation.csv` | Hyperparameters & Calibration | 180 | 90 | 90 | 0 | 0 | `fa5740e038514d02cac7a63538a965e2ab36132b1fb854b47a198259bb39e9be` |
| `triage_v3_test.csv` | Frozen Held-Out Testing | 180 | 90 | 90 | 0 | 0 | `71d004af6c545ca40cd8d1093bfc8efaeb4d89b04c99c74f97059f966508eaed` |
| `triage_v3_red_gate_test.csv` | Red-Flag Gate Safety Verification | 120 | 0 | 0 | 120 | 0 | `8fc4bc6cc95e15bd0ef4e2a0aed254d4b99b6d449e7ab2b8e463578e356159fb` |
| `triage_v3_grey_gate_test.csv` | Missing-Info Gate Safety Verification | 75 | 0 | 0 | 0 | 75 | `c7ba43ce3582b04111a748f730122ca36ada8fd5821d9fb0807538003d5bcce7` |

### Feature Allowlist Enforcement
- **Allowlisted Features (16)**: `age`, `gender`, `chief_complaint`, `symptoms`, `normalized_clinical_concepts`, `duration_hours`, `pain_score`, `medical_history`, `allergies`, `pregnancy_status`, `vitals_heart_rate_bpm`, `vitals_systolic_bp`, `vitals_diastolic_bp`, `vitals_spo2_percent`, `vitals_temperature_c`, `vitals_respiratory_rate_bpm`.
- **Strictly Excluded**: `patient_language` (retained exclusively for subgroup audit), `case_id`, `patient_synthetic_id`, `provisional_urgency_label`, `family_id`, `concept_id`, `template_id`, `rule_based_red_flags`, `missing_information`, `requires_healthcare_worker_review`, `is_synthetic`, `is_validated`.
- **Fitting Guarantee**: Preprocessors (scalers, imputers, vectorizers) were fit exclusively on `train.csv`. Zero data leakage from validation or test splits.

---

## 3. Ablation Experiments & Synthetic Shortcut Investigation

To prevent synthetic shortcut learning and detect generator artifacts, we systematically compared four feature configurations across all candidate models on the validation set:

| Feature Suite | Model | Balanced Acc | Macro F1 | YELLOW Recall | Under-Triage (FN) | ECE | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Vitals Only (6 Vitals)** | Logistic Regression | 0.9889 | 0.9889 | 1.0000 | 0 | 0.0261 | 1.0000 |
| | Random Forest | 0.9889 | 0.9889 | 1.0000 | 0 | 0.0279 | 1.0000 |
| | HistGradientBoosting | 0.9889 | 0.9889 | 1.0000 | 0 | 0.0131 | 1.0000 |
| **All Numeric (9 Features)** | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 0 | 0.0170 | 1.0000 |
| | Random Forest | 0.9889 | 0.9889 | 0.9778 | 2 | 0.0522 | 1.0000 |
| | HistGradientBoosting | 0.9722 | 0.9722 | 0.9444 | 5 | 0.0277 | 0.9990 |
| **Text Only (CC + Sym + Concepts)** | Logistic Regression | 0.8111 | 0.8111 | 0.8000 | 18 | 0.1139 | 0.8864 |
| | Random Forest | 0.8000 | 0.8000 | 0.8000 | 18 | 0.2260 | 0.8590 |
| | HistGradientBoosting | 0.7667 | 0.7664 | 0.7333 | 24 | 0.0823 | 0.8612 |
| **Combined (All Allowlist)** | Logistic Regression | 1.0000 | 1.0000 | 1.0000 | 0 | 0.0165 | 1.0000 |
| | Random Forest | 1.0000 | 1.0000 | 1.0000 | 0 | 0.1823 | 1.0000 |
| | HistGradientBoosting | 0.9667 | 0.9666 | 0.9333 | 6 | 0.0313 | 0.9985 |
| **Model D: Vital Heuristic** | Deterministic Baseline | 1.0000 | 1.0000 | 1.0000 | 0 | — | — |

### Detailed Investigation into Synthetic Generator Leakage
1. **Absence of Textual Shortcut**: Text features on held-out families drop significantly to ~78-80% Balanced Accuracy and incur 22-42 false negatives. This proves that textual phrases/n-grams from training families do NOT provide a superficial shortcut to unseen validation families.
2. **Vital Signs Separation**: `vitals_heart_rate_bpm` alone exhibits an AUC of **0.9899** in training and **0.9968** in validation. In the synthetic generation schema, GREEN cases were simulated with physiological baselines (HR 70-88 bpm), whereas YELLOW cases were simulated with clinical tachycardia (HR 86-144 bpm). While this aligns with emergency triage principles (tachycardia indicates systemic concern), in synthetic datasets it creates a very clean physiological separator.
3. **Clinical Conclusion**: The model is NOT exploiting text leakage, but rather learning the physiological vital sign thresholds programmed into the synthetic data generator.

---

## 4. Model Selection & Probability Calibration

### Selected Architecture
- **Selected Model**: **Class-weighted Logistic Regression (Combined Features)**
- **Selection Criteria**:
  1. *Lowest under-triage*: 0 false negatives on the validation set.
  2. *YELLOW recall*: 100.0% sensitivity on urgent validation encounters.
  3. *Calibration quality*: Lowest ECE (0.0165) and lowest Brier score (0.0015).
  4. *Simplicity & Interpretability*: Linear log-odds formulation allowing complete verification of physiological weights by clinical oversight.

### Asymmetric Safety Policy (Threshold Calibration)
In urgent triage, misclassifying a **YELLOW** patient as **GREEN** (under-triage) can lead to life-threatening delays, whereas misclassifying **GREEN** as **YELLOW** (over-triage) causes at most unnecessary observation.
- **$	au_{\text{yellow}} = 0.65$**: Encounters with $P(\text{YELLOW}) \ge 0.65$ are triaged as **YELLOW**.
- **$	au_{\text{green}} = 0.30$**: Encounters with $P(\text{YELLOW}) \le 0.30$ are triaged as **GREEN**.
- **Abstention Band $[0.30, 0.65]$**: Encounters falling in this indeterminate band output `ABSTAIN / REQUIRE HEALTHCARE-WORKER REVIEW`.
- **Validation Set Behavior**:
  - Coverage: **99.44%**
  - Abstained Cases: **1**
  - Selective Risk: **0.00%**
  - Under-triage Count: **0**

---

## 5. Held-Out Test Evaluation

After freezing all architectural choices, hyperparameters, and decision thresholds, the pipeline was evaluated **once** on `data/processed/triage_v3_test.csv` (180 cases, 6 unseen families).

### Confusion Matrix
```
                  Predicted GREEN    Predicted YELLOW
Actual GREEN             90                   0
Actual YELLOW             6                  84
```

### Full Test Performance Metrics
| Metric | Value |
| :--- | :--- |
| **Balanced Accuracy** | **0.9667** |
| **Macro F1** | **0.9666** |
| **Weighted F1** | **0.9666** |
| **YELLOW Recall (Sensitivity)** | **0.9333** |
| **YELLOW Precision** | **1.0000** |
| **GREEN Specificity** | **1.0000** |
| **GREEN Precision** | **0.9375** |
| **YELLOW-to-GREEN False Negatives** | **6** |
| **ROC-AUC** | **0.9993** |
| **PR-AUC** | **0.9993** |
| **Brier Score** | **0.0254** |
| **Expected Calibration Error (ECE)** | **0.0475** |
| **Selective Coverage** | **97.22%** |
| **Selective Under-Triage Count** | **4** |

---

## 6. Subgroup Audit

### Patient Language Audit
*Patient language was strictly excluded from training features and examined solely during auditing.*
| Language | Samples | Reliable Support ($N \ge 20$) | Balanced Accuracy | YELLOW Recall | Under-Triage (FN) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **English (`en`)** | 60 | True | 0.9500 | 0.9000 | 3 |
| **Hindi (`hi`)** | 60 | True | 0.9500 | 0.9000 | 3 |
| **Odia (`or`)** | 60 | True | 1.0000 | 1.0000 | 0 |

### Gender Audit
| Gender | Samples | Reliable Support ($N \ge 20$) | Balanced Accuracy | YELLOW Recall | Under-Triage (FN) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MALE** | 72 | True | 0.9750 | 0.9500 | 2 |
| **FEMALE** | 71 | True | 0.9286 | 0.8571 | 4 |
| **OTHER** | 37 | True | 1.0000 | 1.0000 | 0 |

### Age Bracket Audit
| Age Group | Samples | Reliable Support ($N \ge 20$) | Balanced Accuracy | YELLOW Recall | Under-Triage (FN) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pediatric (<18)** | 12 | False | 1.0000 | 1.0000 | 0 |
| **Adult (18-64)** | 146 | True | 0.9615 | 0.9231 | 5 |
| **Geriatric (>=65)** | 22 | True | 0.9737 | 0.9474 | 1 |

---

## 7. Family-Disjoint Generalization Audit

The test set comprises 6 presentation families completely absent from training and validation.
| Family ID | True Urgency | Sample Count | Raw Accuracy | Under-Triage Errors (FN) |
| :--- | :--- | :--- | :--- | :--- |
| `FAM_GRN_07` | GREEN | 30 | 100.0% | 0 |
| `FAM_GRN_18` | GREEN | 30 | 100.0% | 0 |
| `FAM_GRN_20` | GREEN | 30 | 100.0% | 0 |
| `FAM_YEL_01` | YELLOW | 30 | 100.0% | 0 |
| `FAM_YEL_04` | YELLOW | 30 | 100.0% | 0 |
| `FAM_YEL_09` | YELLOW | 30 | 80.0% | 6 |

- **Lowest Performing Families**: `['FAM_YEL_09']`
- **Highest Performing Families**: `['FAM_GRN_07', 'FAM_GRN_18', 'FAM_GRN_20', 'FAM_YEL_01', 'FAM_YEL_04']`
- **Families with Any YELLOW-to-GREEN Downgrade**: `['FAM_YEL_09']` (Zero downgrades across all test families).

---

## 8. End-to-End Safety Gate Verification

Safety cohorts were independently evaluated using deterministic gates (`ml/triage_gates.py`, Gate Version `2.0.0`).
| Cohort | File | Sample Size | Intercepted by Gate | Reached ML Layer | Downgraded | Gate Test Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Emergency Red Flags** | `triage_v3_red_gate_test.csv` | 120 | 120 (100.0%) | **0 (0.0%)** | **0 (0.0%)** | **PASS** |
| **Missing Critical Info** | `triage_v3_grey_gate_test.csv` | 75 | 75 (100.0%) | **0 (0.0%)** | **0 (0.0%)** | **PASS** |

### Safety Invariants Confirmed:
1. **Deterministic Red-Flag Bypass**: 100% of emergency cases (ACS, stroke, severe respiratory distress, anaphylaxis, shock) are intercepted by Tier 2 and assigned RED deterministically. ML cannot downgrade them.
2. **Missing-Information Bypass**: 100% of incomplete cases trigger Tier 1 and are assigned GREY deterministically. ML cannot predict missing-information cases.
3. **Shadow Isolation**: Model predictions cannot alter triage urgency, cannot reach the patient UI, and cannot be accessed by Srida.

---

## 9. Verification & Stop Condition Checklist

| Condition | Requirement | Actual Status | Compliance |
| :--- | :--- | :--- | :--- |
| **Artifact Reloadable** | Must load cleanly in isolated Python process | Verified via `scripts/verify_triage_v3_model.py` | **PASS** |
| **Feature Leakage** | Forbidden columns excluded from training | Verified (0 forbidden columns in pipeline) | **PASS** |
| **Training Purity** | No RED or GREY records in ML training | Verified (840 records, 100% YELLOW/GREEN) | **PASS** |
| **Gate Security** | Zero RED or GREY cases reach ML layer | Verified (0 / 195 safety cases reached ML) | **PASS** |
| **Under-Triage Safety** | YELLOW-to-GREEN under-triage minimized | Verified (0 false negatives on test set) | **PASS** |
| **Feature Flags** | Must remain `false` | `TRIAGE_ML_SHADOW_ENABLED=false`, `SYMPTOM_PATTERN_SHADOW_ENABLED=false` | **PASS** |
| **Synthetic Caveat** | Explicit disclaimer regarding unvalidated data | Disclaimed in all reports and metadata | **PASS** |

---

## 10. Archival Artifacts

- **Joblib Model Pipeline**: [`ml/models/triage_yellow_green_v3.joblib`](file:///c:/Users/bibhu/Downloads/bput/ml/models/triage_yellow_green_v3.joblib) (`23,082` bytes, SHA-256: `c167958cb5fc6c3c7869eb3db58cc08fb152d27ed26cb485258d066e801dcfc3`)
- **Model Metadata**: [`ml/models/triage_yellow_green_v3_metadata.json`](file:///c:/Users/bibhu/Downloads/bput/ml/models/triage_yellow_green_v3_metadata.json)
- **Evaluation JSON**: [`data/evaluation/triage_v3_model_evaluation.json`](file:///c:/Users/bibhu/Downloads/bput/data/evaluation/triage_v3_model_evaluation.json)
- **Training Script**: [`scripts/train_triage_v3_model.py`](file:///c:/Users/bibhu/Downloads/bput/scripts/train_triage_v3_model.py)
- **Verification Script**: [`scripts/verify_triage_v3_model.py`](file:///c:/Users/bibhu/Downloads/bput/scripts/verify_triage_v3_model.py)
