# TriageBridge Dataset Version 3 Comprehensive Data & Safety Audit

> [!IMPORTANT]
> **READINESS AUDIT VERDICT: `READY_FOR_OFFLINE_TECHNICAL_EXPERIMENT`**  
> **Dataset**: [`data/training/triage_cases_v3.csv`](file:///c:/Users/bibhu/Downloads/bput/data/training/triage_cases_v3.csv) (1,395 encounters, 31 columns)  
> **Operational Status**: Approved strictly for **offline technical pipeline experimentation and benchmarking**.  
> **Production Status**: **CLINICAL USE PROHIBITED** (`clinical_use=prohibited`, `is_validated=false`).

---

## 1. Executive Summary & Verification of Dataset v3

Dataset Version 3 was generated specifically for **offline technical experimentation** to resolve the architectural limitations and generator artifacts identified in previous audits.

| Audit Parameter | Dataset v3 Metric | Specification Requirement | Compliance Status |
| :--- | :---: | :---: | :---: |
| **Total Encounters** | **1,395** | Offline technical cohort | **COMPLIANT [PASS]** |
| **Residual ML Cohort (YELLOW / GREEN)** | **1,200 (600 Y / 600 G)** | Minimum 400+ balanced | **COMPLIANT [PASS]** |
| **Deterministic RED Gate-Test Cohort** | **120 encounters** | Safety gate testing only | **COMPLIANT [PASS]** |
| **Deterministic GREY Gate-Test Cohort**| **75 encounters** | Missing info testing only | **COMPLIANT [PASS]** |
| **YELLOW Presentation Families** | **20 families** | At least 20 families | **COMPLIANT [PASS]** |
| **GREEN Presentation Families** | **20 families** | At least 20 families | **COMPLIANT [PASS]** |
| **Templates per Family** | **5 distinct templates** | At least 5 templates | **COMPLIANT [PASS]** |
| **Total Narrative Templates** | **265 templates** | Rich multilingual diversity | **COMPLIANT [PASS]** |
| **Language-Condition Modulo Artifact** | **RESOLVED (Chi2=0, p=1.0)** | Complete independence | **COMPLIANT [PASS]** |
| **Multilingual Paraphrase Coverage** | **100% (en, hi, or)** | Trilingual representation | **COMPLIANT [PASS]** |
| **Dual Text Representation** | **Original text + Normalized concepts** | Both preserved | **COMPLIANT [PASS]** |
| **Exact Duplicate Encounters** | **0** | Zero duplicates | **COMPLIANT [PASS]** |
| **Conflicting Intake Labels** | **0** | Zero contradictory labels | **COMPLIANT [PASS]** |
| **Physiologically Invalid Vitals** | **0** | Physiological ranges | **COMPLIANT [PASS]** |
| **Contradictory Clinical Records** | **0** | Zero clinical conflicts | **COMPLIANT [PASS]** |
| **Patient Cross-Split Leakage** | **0 (0.00%)** | Zero patient overlap | **COMPLIANT [PASS]** |
| **Family / Template Cross-Split Leakage** | **0 (0.00%)** | Zero family/template overlap | **COMPLIANT [PASS]** |
| **Feature Leakage Violations** | **0 forbidden fields** | Pure pre-assessment only | **COMPLIANT [PASS]** |

---

## 2. Model Scope & Multi-Tier Safety Architecture

The experimental machine learning model is strictly restricted in scope:
- **ML Target Scope**: Classifies **ONLY `YELLOW` and `GREEN`**.
- **Prohibited Predictions**: The ML model must **NEVER predict `RED` or `GREY`**.

```
[Patient Intake Encounter Features]
           │
           ▼
[Tier 1: Deterministic Missing-Information Gating]
   ├──► Critical vitals / timeline missing ────────► Output "GREY" (Deterministic)
   │                                                 (ML strictly bypassed; prompts vitals capture)
   └──► Critical information complete
           │
           ▼
[Tier 2: Deterministic Emergency Red-Flag Interception]
   ├──► Emergency Red-Flag Triggered ──────────────► Output "RED" (Deterministic)
   │                                                 (ML strictly bypassed; emergency escalation)
   └──► Zero deterministic red flags detected
           │
           ▼
[Tier 3: Experimental ML Urgency Suggestion (YELLOW or GREEN ONLY)]
   ├──► Suggests provisional triage tier (YELLOW vs GREEN)
   └──► Generates calibrated class probabilities and confidence margin
           │
           ▼
[Tier 4: Mandatory Qualified Healthcare-Worker Clinical Review & Sign-Off]
   └──► Final clinical decision authority lies exclusively with human clinician.
```

---

## 3. Data Cohort Accounting

```
Total Encounters in Dataset v3:                      1,395 (100.0%)
├── Deterministic Gate-Test Cohorts:                   195 ( 14.0%)
│   ├── RED Emergency Safety Cohort (8 Families):      120 (  8.6%)
│   └── GREY Missing Information Cohort (5 Families):   75 (  5.4%)
└── Residual ML Experimental Cohort:                 1,200 ( 86.0%)
    ├── YELLOW Urgency (20 Families):                  600 ( 43.0%)
    └── GREEN Urgency (20 Families):                   600 ( 43.0%)
```

- **Exact 1:1 ML Class Balance**: 600 YELLOW (50.0%) and 600 GREEN (50.0%).
- **Isolation of Red/Grey Records**: RED and GREY encounters are preserved exclusively for testing Gate 1 and Gate 2 performance and are strictly barred from entering ML training or validation pipelines.

---

## 4. Dataset-Generator Corrections & Language Audit

### Resolution of Modulo Artifact
In earlier synthetic versions, cycling 6 templates across 3 languages produced an unintended $6 \pmod 3 = 0$ binding where conditions were locked to specific languages. In Dataset v3:
- Every template is systematically and independently generated across English (`en`), Hindi (`hi`), and Odia (`or`).
- **Chi-Squared Independence Test**:
  $$\chi^2 = 0.0000, \quad \text{degrees of freedom} = 78, \quad p\text{-value} = 1.0000$$
  Statistical confirmation: **Language is completely independent of medical condition and urgency class.**

### Trilingual Distribution
- **Overall Dataset**: English: 465 (33.3%), Hindi: 465 (33.3%), Odia: 465 (33.3%)
- **Residual ML Cohort**: English: 400 (33.3%), Hindi: 400 (33.3%), Odia: 400 (33.3%)
- **YELLOW Class**: English: 200 (33.3%), Hindi: 200 (33.3%), Odia: 200 (33.3%)
- **GREEN Class**: English: 200 (33.3%), Hindi: 200 (33.3%), Odia: 200 (33.3%)

### Dual Text Representation
Each encounter preserves both:
1. `chief_complaint` and `symptoms`: Original patient-facing narrative in the patient's language.
2. `normalized_clinical_concepts`: Semicolon-separated standardized English clinical concepts (e.g. `right_lower_quadrant_pain; periumbilical_migration; low_grade_fever; nausea`).

### Feature Policy
- **`patient_language` IS STRICTLY EXCLUDED from the predictive feature matrix.**
- It is retained exclusively as an independent subgroup attribute for post-prediction disparity and fairness auditing.

---

## 5. Group-Stratified Presentation Family Split Audit (Seed 42)

The 1,200-encounter residual ML cohort was partitioned by **presentation family** and **canonical template**, ensuring that no clinical presentation family or narrative template crosses split boundaries:

| Partition | Encounters | Presentation Families | Narrative Templates | GREEN Encounters | YELLOW Encounters | Cross-Split Leakage |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Train** | **840 (70.0%)** | **28 (14 Y, 14 G)** | **140** | **420 (50.0%)** | **420 (50.0%)** | **0.00%** |
| **Validation** | **180 (15.0%)** | **6 (3 Y, 3 G)** | **30** | **90 (50.0%)** | **90 (50.0%)** | **0.00%** |
| **Held-Out Test**| **180 (15.0%)** | **6 (3 Y, 3 G)** | **30** | **90 (50.0%)** | **90 (50.0%)** | **0.00%** |

### Cross-Split Leakage Audit:
- **Patient ID Overlap**: **0 (0.00%)**
- **Presentation Family Overlap**: **0 (0.00%)**
- **Narrative Template Overlap**: **0 (0.00%)**
- **Canonical Concept Overlap**: **0 (0.00%)**
- **Class Representation**: Both YELLOW and GREEN are present with exact 1:1 balance in every partition.
- **Language Representation**: Exactly 140 `en`, 140 `hi`, 140 `or` per class in Train; exactly 30 per language per class in Validation and Test.

---

## 6. Physiological Sanity & Integrity Audit

- **Exact Duplicate Rows**: **0**
- **Intake Feature Duplicates**: **0**
- **Conflicting Labels (identical intake with different labels)**: **0**
- **Clinical Contradictions**: **0** (All 558 males and 270 other-gender encounters marked `pregnancy_status='not_applicable'`).
- **Physiological Ranges Observed**:
  - Heart Rate: 66.0 – 189.0 bpm (mean: 92.5)
  - Systolic BP: 71.0 – 245.0 mmHg (mean: 130.1)
  - Diastolic BP: 42.0 – 138.0 mmHg (mean: 80.6)
  - SpO2: 82.0 – 100.0% (mean: 98.0%)
  - Temperature: 35.7 – 40.7 °C (mean: 37.3 °C)
  - Respiratory Rate: 14.0 – 58.0 bpm (mean: 19.3)

---

## 7. Target-Leakage Audit

The 15 permitted pre-assessment machine learning features are strictly confined to intake observations:
`age`, `gender`, `chief_complaint`, `symptoms`, `duration_hours`, `pain_score`, `medical_history`, `allergies`, `pregnancy_status`, `vitals_heart_rate_bpm`, `vitals_systolic_bp`, `vitals_diastolic_bp`, `vitals_spo2_percent`, `vitals_temperature_c`, `vitals_respiratory_rate_bpm`.

**Forbidden Fields Strictly Excluded from Features**:
- `family_id`, `concept_id`, `template_id` (Generator metadata)
- `rule_based_red_flags`, `missing_information` (Deterministic gate logic)
- `provisional_urgency_label` (Target label)
- `requires_healthcare_worker_review`, `is_synthetic`, `is_validated`, `clinical_use`, `purpose`, `clinical_disclaimer` (Administrative metadata)
- `patient_language` (Excluded to prevent spurious linguistic bias)

---

## 8. Verification of Stop Conditions

| Stop Condition | Verification Finding | Status |
| :--- | :--- | :---: |
| **Language remains correlated with condition** | $\chi^2 = 0.0000, p = 1.0000$ (Zero correlation) | **PASS** |
| **A generator family crosses splits** | Overlap = 0 across all partitions | **PASS** |
| **Target label inferred from hidden template ID** | Template IDs excluded from feature matrix | **PASS** |
| **Identical or near-identical templates cross splits** | Zero template overlap across splits | **PASS** |
| **Either YELLOW or GREEN missing from a split** | Both classes have exact 50/50 balance in all splits | **PASS** |
| **Contradictory clinical records detected** | 0 contradictory or non-physiological records | **PASS** |

---

## 9. Feature Flag & Safety Policy Invariants

- **`TRIAGE_ML_SHADOW_ENABLED=false`**
- **`SYMPTOM_PATTERN_SHADOW_ENABLED=false`**
- **Strictly halted without model training, database migrations, application integrations, Git commits, or pushes.**\n