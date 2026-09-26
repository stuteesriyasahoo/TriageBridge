# Symptom2Disease Auxiliary Research Dataset Audit

> [!WARNING]
> **CLINICAL SAFETY NOTICE**: This dataset and any model trained upon it are designated strictly for **isolated auxiliary research**. They must NEVER be connected to patient-facing systems, medication advice, or clinical triage decisions, nor used as features for the provisional urgency (RED/YELLOW/GREEN) model.

## 1. Dataset Verification & Provenance

- **Storage Location (Raw):** `data/raw/Symptom2Disease.csv`
- **Raw SHA-256 Hash:** `00c14a2f38c041179d24a91de80c4b3a9d105f58982aa52e96a7226ca994dba8`
- **Clean Location:** `data/processed/symptom2disease_clean.csv`
- **Clean SHA-256 Hash:** `373cd9c08b2abe4dd7a3f79817eeb9f45e05593e4d52e85326de2dee4be6cf21`
- **Source & Curator:** Curated by Niyar R. Barman, hosted on Kaggle.
- **License:** **CC0: Public Domain** (Creative Commons 1.0 Universal).
- **Provenance Verification:** Synthesized natural language symptom narratives across 24 common conditions. Does NOT represent real electronic health records or clinically validated diagnostic ground truth.

## 2. Core Audit Assertions & Confirmations

| Audit Check | Expected | Actual / Verified | Status |
| :--- | :---: | :---: | :---: |
| **Total Rows** | 1,200 | 1200 | CONFIRMED |
| **Disease Labels** | 24 | 24 | CONFIRMED |
| **Records Per Label** | Exactly 50 each | Min: 50, Max: 50 | CONFIRMED |
| **Missing Values (Label)** | 0 | 0 | CONFIRMED |
| **Missing Values (Text)** | 0 | 0 | CONFIRMED |
| **Repeated Text Rows** | 47 | 47 | CONFIRMED |
| **Duplicate-Text Groups** | 43 | 43 | CONFIRMED |
| **Cross-Label Text Conflicts** | 0 | 0 | CONFIRMED |
| **'Unnamed: 0' Index Column** | Repeated 0..299 block | Unusable repeated index artifact (dropped) | CONFIRMED |
| **Clean Deduplicated Rows** | 1,153 | 1153 | CONFIRMED |

## 3. Label Distribution (Raw vs Clean Deduplicated)

| Disease Class | Raw Count | Clean Deduplicated Count | Duplicate Rows Removed |
| :--- | :---: | :---: | :---: |
| **Acne** | 50 | 46 | 4 |
| **Allergy** | 50 | 50 | 0 |
| **Arthritis** | 50 | 46 | 4 |
| **Bronchial Asthma** | 50 | 49 | 1 |
| **Cervical Spondylosis** | 50 | 49 | 1 |
| **Chicken Pox** | 50 | 49 | 1 |
| **Common Cold** | 50 | 49 | 1 |
| **Dengue** | 50 | 50 | 0 |
| **Diabetes** | 50 | 50 | 0 |
| **Dimorphic Hemorrhoids** | 50 | 41 | 9 |
| **Drug Reaction** | 50 | 50 | 0 |
| **Fungal Infection** | 50 | 50 | 0 |
| **Gastroesophageal Reflux Disease** | 50 | 48 | 2 |
| **Hypertension** | 50 | 50 | 0 |
| **Impetigo** | 50 | 50 | 0 |
| **Jaundice** | 50 | 38 | 12 |
| **Malaria** | 50 | 44 | 6 |
| **Migraine** | 50 | 47 | 3 |
| **Peptic Ulcer Disease** | 50 | 50 | 0 |
| **Pneumonia** | 50 | 47 | 3 |
| **Psoriasis** | 50 | 50 | 0 |
| **Typhoid** | 50 | 50 | 0 |
| **Urinary Tract Infection** | 50 | 50 | 0 |
| **Varicose Veins** | 50 | 50 | 0 |
| **Total** | **1200** | **1153** | **47** |

## 4. Text Length Statistics (Cleaned Dataset)

| Metric | Character Length | Word Count |
| :--- | :---: | :---: |
| **Mean** | 171.09 | 30.63 |
| **Median (50%)** | 169.00 | 30.00 |
| **Std Deviation** | 35.50 | 6.72 |
| **Minimum** | 59 | 12 |
| **25th Percentile ($Q_1$)** | 147.00 | 26.00 |
| **75th Percentile ($Q_3$)** | 192.00 | 35.00 |
| **Maximum** | 317 | 55 |

## 5. Architectural Safety Boundaries

1. **Zero Contamination**: `Symptom2Disease.csv` is NEVER merged with `triage_cases_v2.csv`.
2. **Zero Feature Leakage**: Disease predictions are NEVER provided as inputs or features to the urgency model.
3. **Zero Patient / Clinician UI Exposure**: Predictions do not appear in patient portals, dashboards, or triage decision cards.
4. **Mandatory Research Disclaimer**: All internal research tools MUST display:
   > *"Experimental symptom-pattern classifier — not a diagnosis."*
5. **Deterministic Gate Precedence Unchanged**:
   - Missing critical physiological information -> **GREY**
   - Confirmed clinical red flags -> **RED**
   - Stable baseline -> Existing Provisional Urgency Model (RED/YELLOW/GREEN)
   - Healthcare-worker review -> Final Triage Decision

