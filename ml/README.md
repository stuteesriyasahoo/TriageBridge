# TriageBridge Experimental Urgency Classification Model

> [!WARNING]
> **MANDATORY CLINICAL SAFETY NOTICE**  
> **Experimental prototype trained on synthetic data. Not clinically validated.**  
> This model is an experimental statistical prototype developed for hackathon evaluation and technical structural demonstration. It must **NEVER** be used as a medical diagnostic tool or autonomous triage decision-maker. All urgency suggestions require verification and final determination by a qualified healthcare professional.

---

## 1. Architectural Overview & Safety Gating

The machine learning layer operates inside a multi-tier safety architecture where deterministic clinical safety rules strictly override and supersede statistical predictions:

```
[Patient Intake Features]
           │
           ▼
1. Validate Pre-Triage Inputs (Zero Leakage Check)
           │
           ▼
2. Check Critical Missing Information?
   ├──► YES ──► Output "GREY" (Deterministic Missing-Data Gating)
   │            Prompt triage worker to collect basic vitals.
   │
   └──► NO
        │
        ▼
3. Check Deterministic Clinical Red Flags?
   ├──► YES ──► Output "RED" (Emergency Safety Gate Override)
   │            ML CANNOT downgrade or override a positive red flag!
   │
   └──► NO
        │
        ▼
4. Run Experimental ML Pipeline (Class-Weighted Multinomial Logistic Regression)
        │
        ▼
5. Output Model Scores & Heuristic Urgency Suggestion
        │
        ▼
6. Mandatory Qualified Healthcare-Worker Clinical Review & Sign-Off
```

---

## 2. Leakage Prevention & Feature Separation

To ensure zero target leakage, only data available at patient intake before any clinical evaluation is used:

### Allowed Intake Features (16 Features):
* **Text**: `chief_complaint`, `symptoms` (concatenated and vectorized with TF-IDF)
* **Numeric**: `age`, `duration_hours`, `pain_score`, `vitals_heart_rate_bpm`, `vitals_systolic_bp`, `vitals_diastolic_bp`, `vitals_spo2_percent`, `vitals_temperature_c`, `vitals_respiratory_rate_bpm`
* **Categorical**: `gender`, `patient_language` (`en`, `hi`, `or`), `medical_history`, `allergies`, `pregnancy_status`

### Explicitly Excluded (Forbidden Leakage Fields):
* `case_id`, `patient_synthetic_id`
* `rule_based_red_flags`, `rule_based_urgency`
* `ml_suggested_urgency`, `ml_confidence_score`
* `missing_information`, `requires_healthcare_worker_review`, `healthcare_review_status`
* `is_synthetic`, `is_validated`, `clinical_disclaimer`
* Any post-intake assessment, diagnosis, treatment, or reviewer decision.

*Note: Training will immediately abort with an assertion error if any forbidden column is present in the feature matrix.*

---

## 3. Near-Duplicate Protection & Group Stratification

Synthetic datasets generated from clinical templates pose severe risks of data contamination if near-duplicate narrative texts appear in both training and test sets.

* **Narrative Grouping**: All 450 non-GREY encounters were clustered into 45 distinct narrative groups based on clinical narrative fingerprinting (`chief_complaint` + `symptoms`).
* **Group-Stratified Partitioning**: Entire narrative groups were held out together within a single split (`train`, `val`, or `test`).
* **Cross-Split Overlap**: **Zero** narrative group overlap exists between the training, validation, and test splits.
* **Split Counts (Seed: 42)**:
  * **Train Set**: 308 encounters (68.4%) — 108 RED, 100 YELLOW, 100 GREEN
  * **Validation Set**: 69 encounters (15.3%) — 24 RED, 25 YELLOW, 20 GREEN
  * **Held-out Test Set**: 73 encounters (16.2%) — 18 RED, 25 YELLOW, 30 GREEN

---

## 4. Model Selection & Held-Out Test Evaluation

Hyperparameters were tuned strictly on the **Validation Set** across TF-IDF vocabulary limits, n-gram ranges, and logistic regression regularization parameters. The model was evaluated **once** on the untouched **Held-Out Test Set**:

### Final Selected Model:
* **Algorithm**: Class-Weighted Multinomial Logistic Regression (`solver='lbfgs'`, `class_weight='balanced'`, `C=0.5`)
* **Text Preprocessing**: TF-IDF (`max_features=250`, unigrams, `min_df=2`)
* **Numeric Preprocessing**: Median imputation with missingness indicators + standard scaling
* **Categorical Preprocessing**: Constant imputation + one-hot encoding (`handle_unknown='ignore'`)

### Test Set Performance Metrics:

| Metric | Dummy Baseline | Selected ML Model | Clinical Interpretation |
| :--- | :---: | :---: | :--- |
| **Balanced Accuracy** | 33.33% | **98.67%** | Strong non-trivial classification across all 3 tiers |
| **Macro F1 Score** | 13.19% | **98.42%** | Robust harmonic mean across imbalanced classes |
| **RED Precision** | 0.00% | **94.74%** | Highly specific identification of emergencies |
| **RED Recall** | 0.00% | **100.00%** | **Zero missed emergencies** |
| **YELLOW F1** | 0.00% | **97.96%** | Accurate separation of urgent conditions |
| **GREEN F1** | 0.00% | **100.00%** | Accurate separation of non-urgent presentations |
| **RED False Negatives** | 18 / 18 | **0 / 18** | **Zero critical false negatives** |

### Confusion Matrix (Test Set, N=73):
```
                 Predicted RED   Predicted YELLOW   Predicted GREEN
True RED               18                0                 0
True YELLOW             1               24                 0
True GREEN              0                0                30
```
*(Notice: The single off-diagonal prediction is a safe conservative escalation: one YELLOW case predicted as RED. No patient was unsafely downgraded).*

---

## 5. Model Scores & Confidence Clarification

* Probabilities output by `model.predict_proba()` represent **uncalibrated statistical model scores**, **NOT** clinical probability or diagnostic certainty.
* A high model score must never be used to bypass triage safety gates or human oversight.

---

## 6. How to Run Training & Tests

### Install Dependencies:
```bash
pip install -r ml/requirements.txt
```

### Run the Training Pipeline:
```bash
python ml/train.py
```

### Run Automated Pipeline & Safety Gate Tests:
```bash
python ml/test_pipeline.py
```

---

## 7. Artifacts Index

* `ml/train.py`: Leak-free training script with group stratification and held-out evaluation.
* `ml/predict.py`: Inference service implementing multi-tier safety gating and fallbacks.
* `ml/models/urgency_model.joblib`: Serialized scikit-learn Pipeline (ColumnTransformer + LogisticRegression).
* `ml/models/model_metadata.json`: Full model provenance, dataset hash, and limitations.
* `ml/reports/evaluation.json`: Machine-readable test metrics.
* `ml/reports/classification_report.txt`: Classification report table.
* `ml/reports/confusion_matrix.png`: Visual heatmap of test set confusion matrix.
* `ml/reports/data_split_summary.json`: Detailed split distributions and group isolation stats.
* `ml/test_pipeline.py`: 11 automated unit tests verifying safety gates and robustness.
