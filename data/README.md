# TriageBridge Research Datasets Registry

> [!CAUTION]
> **STRICT CLINICAL SAFETY NOTICE**:
> The datasets catalogued in this directory are designated **EXCLUSIVELY FOR ISOLATED EXPERIMENTAL RESEARCH**.
> Under NO circumstances may these datasets, or models trained upon them, be used to:
> - Diagnose patients or confirm diseases.
> - Prescribe, recommend, or adjust medicines or treatments.
> - Assign or modify triage urgency categories (RED, YELLOW, GREEN, GREY).
> - Override deterministic missing-information gates or emergency red-flag rules.
> - Present outputs directly or indirectly to patients.
> - Replace or bypass healthcare-worker clinical judgement.

---

## 1. Dataset Provenance Registry

### `data/raw/final_symptoms_to_disease.csv`

| Property | Details |
| :--- | :--- |
| **Dataset Filename** | `final_symptoms_to_disease.csv` |
| **Local Storage Path** | `data/raw/final_symptoms_to_disease.csv` (Untracked, gitignored) |
| **Provenance Status** | **UNVERIFIED** (Original creator, institutional source, and definitive redistribution licence remain unconfirmed; search queries indicate possible association with open NLP benchmarks, but provenance is not independently verified) |
| **Licence Status** | **UNCONFIRMED / UNVERIFIED** (Treated as unverified external research data; raw CSV must NOT be committed or pushed to GitHub) |
| **Download Date** | September 27, 2026 |
| **Raw Row Count** | 192,715 rows |
| **Columns** | `diseases` (string, 254 unique disease names), `symptom_text` (string, comma-delimited symptom descriptions) |
| **Missing Values** | 0 nulls across both columns |
| **Patient Identifiers** | **None**. Scanned and verified zero PII, zero emails, zero phone numbers, zero patient names, zero hospital identifiers. |
| **Intended Use** | **Isolated offline research only**: Multi-label symptom-pattern association analysis and shadow evaluation. |
| **Git Tracking Policy** | **EXCLUDED FROM GIT REPOSITORY** via `.gitignore`. Commit only scripts, metadata, schema, and sanitized aggregate reports. |
| **Clinical Validation Status** | **UNVERIFIED RESEARCH DATA**. Strictly prohibited from clinical diagnostic or triage use. |

### `data/raw/disease_symptoms_binary.csv`

| Property | Details |
| :--- | :--- |
| **Dataset Filename** | `disease_symptoms_binary.csv` (uploaded as `Disease and symptoms dataset.csv.xls`) |
| **Local Storage Path** | `data/raw/disease_symptoms_binary.csv` (Untracked, gitignored) |
| **Provenance Status** | **UNVERIFIED** (Original creator, institutional source, and redistribution licence unconfirmed; synthetic archetype dataset) |
| **Licence Status** | **UNVERIFIED** (Treated as unverified external research data; raw CSV must NOT be committed, pushed, or deployed) |
| **Clinical Use** | **PROHIBITED** (Strictly forbidden from any clinical diagnostic, triage, emergency, or medication use) |
| **Research Only** | **`true`** (Isolated offline research and provenance audit only) |
| **Download Date** | September 27, 2026 |
| **Raw Row Count** | 246,945 rows |
| **Columns** | 378 columns (1 disease label column `diseases`, 377 one-hot binary symptom indicator columns) |
| **Disease Classes** | 773 unique disease names |
| **Exact Duplicates** | 57,298 exact duplicate rows (23.20%) |
| **Constant Zero Columns** | 49 symptom columns with zero variance / zero positive occurrences |
| **Conflicting Vectors** | 12,634 unique symptom patterns mapped to multiple disease classes (39,728 raw rows involved in conflicts) |
| **SHA-256 Checksum** | `8de90603ebada467fc2703db2ee4292856e52d64e94982ef926df22fa0c21320` |
| **File Size** | 190,786,867 bytes (181.95 MB) |
| **Cross-Dataset Relationship** | **PARENT SUPERSET** of `final_symptoms_to_disease.csv`. 254 diseases and 192,715 rows in `final_symptoms_to_disease.csv` correspond 100% row-for-row to a filtered, serialized transformation of this binary dataset. **NOT INDEPENDENT VALIDATION DATA.** |
| **Git Tracking Policy** | **EXCLUDED FROM GIT REPOSITORY** via `.gitignore`. Commit only scripts, metadata, and sanitized evaluation reports. |

---

## 2. Known Dataset Limitations & Methodological Constraints

1. **High Non-Specificity & Semantic Overlap**:
   - Symptoms are inherently non-specific across human pathologies.
   - In `final_symptoms_to_disease.csv`: 10,179 symptom descriptions map identically to multiple diseases (27,897 rows).
   - In `disease_symptoms_binary.csv`: 12,634 unique symptom vectors map identically to multiple diseases (39,728 raw rows, 32,393 deduplicated rows).
   - A single identical symptom vector maps to as many as 17 distinct diseases.
2. **Duplication Artifacts**:
   - `final_symptoms_to_disease.csv`: 28,988 exact duplicate rows.
   - `disease_symptoms_binary.csv`: 57,298 exact duplicate rows.
3. **Absence of Critical Clinical Dimensions**:
   - Zero patient age or sex.
   - Zero physiological vital signs (heart rate, blood pressure, SpO2, respiratory rate, temperature).
   - Zero symptom duration, onset trajectory, or severity quantification.
   - Zero medical history, comorbidity profiles, medication history, allergies, or pregnancy status.
   - Zero triage urgency labels (cannot distinguish acute life-threatening presentations from chronic mild complaints).
4. **Mandatory Multi-Label Framing**:
   - Because identical symptom text legitimately maps to multiple distinct disease categories, forced single-disease classification produces false diagnostic certainty.
   - Multi-label framing with deterministic abstention is mandatory.
5. **Non-Independence of Datasets**:
   - The two raw files are not independent observational samples; `final_symptoms_to_disease.csv` is a direct text transformation of a 254-disease subset of `disease_symptoms_binary.csv`. Evaluating a model trained on one against the other causes 100% data contamination.

---

## 3. Associated Processed Datasets

| File | Description | Purpose |
| :--- | :--- | :--- |
| `data/processed/symptom_disease_multilabel.csv` | Canonical multi-label representation with stable record hash IDs, deduplicated text, and grouped disease label sets. | Multi-label training and validation (text dataset) |
| `data/processed/train.csv` | Group-split training partition (70% unique symptom clusters) | Model training (text dataset) |
| `data/processed/validation.csv` | Group-split validation partition (15% unique symptom clusters) | Threshold calibration (text dataset) |
| `data/processed/test.csv` | Group-split held-out test partition (15% unique symptom clusters) | Leakage-free evaluation (text dataset) |
| `data/processed/binary_symptoms_cleaned.csv` | Deduplicated binary dataset (189,647 rows x 329 cols) with canonical symptom hashes and conflict flags. | Cleaned binary research dataset |
| `data/processed/binary_train.csv` | Group-split binary training partition (70% unique symptom patterns, 132,574 rows) | Binary model research partition |
| `data/processed/binary_validation.csv` | Group-split binary validation partition (15% unique symptom patterns, 28,534 rows) | Binary validation partition |
| `data/processed/binary_test.csv` | Group-split binary test partition (15% unique symptom patterns, 28,539 rows) | Binary held-out test partition |

---

## 4. Verification Checksums

- **Raw File (Text)**: `data/raw/final_symptoms_to_disease.csv`  
  - Size: 21,741,830 bytes  
  - SHA-256: Verified in validation audit.
- **Raw File (Binary)**: `data/raw/disease_symptoms_binary.csv`  
  - Size: 190,786,867 bytes  
  - SHA-256: `8de90603ebada467fc2703db2ee4292856e52d64e94982ef926df22fa0c21320`

