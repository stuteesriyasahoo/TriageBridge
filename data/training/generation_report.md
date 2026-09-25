# TriageBridge Synthetic Triage Dataset (v2) — Data Generation Report

> **MANDATORY CLINICAL SAFETY DISCLAIMER**  
> **SYNTHETIC DATA — FOR HACKATHON DEVELOPMENT AND STRUCTURAL ML TESTING ONLY.**  
> This dataset contains entirely fictional, algorithmically generated patient encounters. It has **NOT** been clinically validated and does **NOT** contain real patient records. It must never be used for clinical decision-making, medical diagnosis, patient management, or therapeutic recommendation.

---

## 1. Overview & Provenance

* **File Name**: `data/training/triage_cases_v2.csv`
* **Generation Date**: 2026-09-25
* **Generator Script**: `scripts/generate_training_data.js`
* **Validation Suite**: `scripts/validate_training_data.js`
* **PRNG Algorithm**: Mulberry32 (Deterministic pseudorandom number generator)
* **Random Seed**: `123456789` (Fully reproducible)
* **Dataset SHA-256 Hash**: `bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f`
* **Total Encounters**: 500 records
* **Total Columns**: 25 structured columns

---

## 2. Data Sources & Separation of Concerns

* **Raw Reference Data (`data/raw/disease_symptom_reference.csv`)**:
  * Unverified external reference data.
  * Preserved 100% unchanged.
  * **Strictly isolated**: No diagnoses, cures, treatments, doctor specialties, or risk percentages from the raw file were used to generate this dataset.
* **Demonstration Dataset (`data/demo/triage_cases.csv`)**:
  * Original 20-case structural test set preserved unchanged.
* **New Training Dataset (`data/training/triage_cases_v2.csv`)**:
  * Self-contained, standardized 500-case dataset built specifically to support reproducible train/val/test splits (70/15/15) without feature leakage.

---

## 3. Schema Specification (25 Columns)

| # | Column Name | Type | Allowed / Sample Values | Nullable | Description |
| :---: | :--- | :---: | :--- | :---: | :--- |
| 1 | `case_id` | String | `CASE-SYNTH-0001` to `CASE-SYNTH-0500` | No | Unique case identifier |
| 2 | `patient_synthetic_id` | String | `PAT-SYNTH-0001` to `PAT-SYNTH-0500` | No | Fictional patient pseudonym |
| 3 | `age` | Integer | `1` to `90` | No | Patient age in completed years |
| 4 | `gender` | Enum | `MALE`, `FEMALE`, `OTHER` | No | Recorded sex / gender |
| 5 | `patient_language` | Enum | `en`, `hi`, `or` | No | Intake language (English, Hindi, Odia) |
| 6 | `chief_complaint` | String | Natural language text | No | Primary reason for triage visit |
| 7 | `symptoms` | String | Detailed clinical narrative | No | Presenting symptom constellation |
| 8 | `duration_hours` | Float | `0.25` to `2160.0` or blank | **Yes** | Symptom duration in hours |
| 9 | `pain_score` | Integer | `0` to `10` or blank | **Yes** | Numerical pain rating scale |
| 10 | `medical_history` | String | e.g. `hypertension, asthma`, `none_reported` | No | Documented pre-existing comorbidities |
| 11 | `allergies` | String | e.g. `penicillin`, `none_known` | No | Documented hypersensitivities |
| 12 | `pregnancy_status` | Enum | `yes`, `no`, `not_applicable`, `unknown` | No | Obstetric gating status |
| 13 | `vitals_heart_rate_bpm` | Integer | `65` to `192` or blank | **Yes** | Heart rate in beats per minute |
| 14 | `vitals_systolic_bp` | Integer | `70` to `245` or blank | **Yes** | Systolic blood pressure in mmHg |
| 15 | `vitals_diastolic_bp` | Integer | `42` to `138` or blank | **Yes** | Diastolic blood pressure in mmHg |
| 16 | `vitals_spo2_percent` | Integer | `82` to `100` or blank | **Yes** | Peripheral oxygen saturation in % |
| 17 | `vitals_temperature_c` | Float | `35.6` to `40.7` or blank | **Yes** | Core / tympanic temperature in °C |
| 18 | `vitals_respiratory_rate_bpm`| Integer | `12` to `58` or blank | **Yes** | Respiratory rate in breaths per minute |
| 19 | `rule_based_red_flags` | String | e.g. `RF-ACUTE-CHEST-PAIN`, `NONE` | No | Deterministic clinical rule triggers |
| 20 | `provisional_urgency_label` | Enum | `RED`, `YELLOW`, `GREEN`, `GREY` | No | **Ground truth target label** |
| 21 | `missing_information` | String | Semicolon-delimited tags | No | Documented clinical data gaps |
| 22 | `requires_healthcare_worker_review` | Boolean | `true` | No | Mandatory clinical oversight flag |
| 23 | `is_synthetic` | Boolean | `true` | No | Explicit synthetic data indicator |
| 24 | `is_validated` | Boolean | `false` | No | Clinical validation status |
| 25 | `clinical_disclaimer` | String | Standard safety disclaimer text | No | Mandatory non-diagnostic notice |

---

## 4. Class Distribution & Rationale

```
RED    : 150 encounters (30.0%)
YELLOW : 150 encounters (30.0%)
GREEN  : 150 encounters (30.0%)
GREY   :  50 encounters (10.0%)
TOTAL  : 500 encounters (100.0%)
```

### Acuity Definitions:
* **`RED` (150 Cases)**: Immediate resuscitation / emergent conditions triggering verified safety rules from `CLINICAL_RED_FLAG_RULES` (acute coronary syndrome, stroke FAST+, severe hypoxia SpO2 < 90%, anaphylaxis, pediatric sepsis/meningism, severe hemorrhage, hypertensive crisis with neuro signs, eclampsia).
* **`YELLOW` (150 Cases)**: Urgent conditions requiring prompt evaluation within 1–2 hours without immediate hemodynamic collapse (acute appendicitis/RLQ pain, pneumonia with SpO2 91–93%, deep lacerations requiring sutures, renal colic with macroscopic hematuria, high hyperglycemia, severe pyelonephritis).
* **`GREEN` (150 Cases)**: Non-urgent, stable primary/ambulatory presentations with normal age-adjusted vitals and pain score <= 4 (mild viral URI, superficial knee grazes, chronic knee osteoarthritis ache, mild tension headache, seasonal allergic rhinitis).
* **`GREY` (50 Cases)**: Deterministically triggered by critical missing vital signs, absent duration, or incomplete primary assessments (syncope with 0 vitals, acute chest discomfort with missing BP/HR, pediatric irritability without temperature, geriatric confusion without glucose/SpO2, drug rash without vital signs).

---

## 5. Trilingual Linguistic Diversity

Intake encounters are evenly generated across the three primary TriageBridge operational languages:
* **English (`en`)**: 167 cases (33.4%)
* **Hindi (`hi`)**: 167 cases (33.4%)
* **Odia (`or`)**: 166 cases (33.2%)

All clinical narratives reflect authentic terminology used by patients in rural and urban clinics across Odisha and northern India.

---

## 6. Demographic & Consistency Validation

### Age Group Distribution:
* **Child (1–11 years)**: 32 cases (6.4%)
* **Adolescent (12–17 years)**: 16 cases (3.2%)
* **Adult (18–64 years)**: 360 cases (72.0%)
* **Geriatric (65+ years)**: 92 cases (18.4%)

### Pregnancy Field Consistency:
* **`not_applicable`**: 390 cases (All males, females < 12, and females > 55).
* **`no`**: 70 cases (Non-pregnant females of reproductive age).
* **`yes`**: 26 cases (Pregnant females presenting with pregnancy-related or incidental conditions).
* **`unknown`**: 14 cases (Reproductive-age females where status was unconfirmed).
* **Inconsistencies**: **0** (100% rule adherence).

### Duplicate Analysis:
* **Duplicate Case IDs**: **0** (All 500 IDs are strictly unique).
* **Feature Collisions / Near-Duplicates**: **0** (Zero identical clinical profiles).

---

## 7. Execution & Audit Command

To re-verify the dataset at any time, execute the validation script from the project root:

```bash
node scripts/validate_training_data.js
```
