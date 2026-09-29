# Binary Symptom-Disease Dataset Preprocessing & Provenance Overlap Report

> [!CAUTION]
> **MANDATORY CLINICAL SAFETY NOTICE — UNVERIFIED RESEARCH DATA**  
> **Classification**: Research-only statistical artifact  
> **Provenance Status**: `UNVERIFIED`  
> **Licence Status**: `UNVERIFIED`  
> **Clinical Use**: `PROHIBITED`  
> **Research Only**: `true`  
> Under no circumstances may this dataset, or any models derived from it, be used for medical diagnosis, clinical decision-making, triage categorization, prescription, or direct patient presentation.

---

## 1. Executive Summary & Verification of Known Audit Values

All 8 specified verification audit values for the newly uploaded raw file (`Disease and symptoms dataset.csv.xls`, stored locally as `data/raw/disease_symptoms_binary.csv`) have been computed and **100% verified**:

| Audit Parameter | Target Known Value | Independently Verified | Verification Status |
| :--- | :---: | :---: | :---: |
| **Row Count** | 246,945 rows | **246,945 rows** | **EXACT MATCH [PASS]** |
| **Column Count** | 378 columns | **378 columns** | **EXACT MATCH [PASS]** |
| **Disease Classes** | 773 classes | **773 unique classes** | **EXACT MATCH [PASS]** |
| **Exact Duplicate Rows** | 57,298 rows | **57,298 rows (23.20%)** | **EXACT MATCH [PASS]** |
| **Constant All-Zero Columns** | 49 columns | **49 columns** | **EXACT MATCH [PASS]** |
| **Conflicting Symptom Vectors** | 12,634 vectors | **12,634 unique vectors** | **EXACT MATCH [PASS]** |
| **Rows Involved in Conflicts (Raw)** | 39,728 rows | **39,728 rows (16.09%)** | **EXACT MATCH [PASS]** |
| **SHA-256 Checksum** | `8de90603...c21320` | `8de90603ebada467fc2703db2ee4292856e52d64e94982ef926df22fa0c21320` | **EXACT MATCH [PASS]** |
| **Raw File Size** | ~190.8 MB | **190,786,867 bytes (181.95 MB)** | **EXACT MATCH [PASS]** |

---

## 2. Investigation of `regurgitation` vs `regurgitation.1`

The raw CSV header contains two distinct columns representing regurgitation:
1. `regurgitation` at column index **103**
2. `regurgitation.1` at column index **201**

### Empirical Co-occurrence Contingency Table:
- Total rows with `regurgitation == 1`: **2,490**
- Total rows with `regurgitation.1 == 1`: **4,170**
- **Both == 1**: **2,490** rows
- **`regurgitation` only == 1**: **0** rows
- **`regurgitation.1` only == 1**: **1,680** rows
- **Neither == 1**: **242,775** rows

### Clinical & Contextual Analysis:
- Every instance of `regurgitation` is also positive for `regurgitation.1` (`regurgitation` $\subset$ `regurgitation.1`).
- However, `regurgitation.1` possesses **1,680 positive instances where `regurgitation` is 0**.
- These 1,680 instances map predominantly to adult hepatobiliary and upper gastrointestinal diseases:
  - `cholecystitis`: 609 rows
  - `gallstone`: 604 rows
  - `gastritis`: 341 rows
- In contrast, `regurgitation` (index 103) is embedded in a pediatric cluster: `infant spitting up`, `symptoms of infants`, `burning abdominal pain`.
- `regurgitation.1` (index 201) is embedded in an adult visceral pain cluster: `abdominal distention`, `symptoms of the kidneys`, `melena`, `flushing`.

> [!IMPORTANT]
> **DETERMINISTIC VERDICT: DO NOT MERGE.**  
> The two columns represent distributionally and clinically distinct features in the underlying synthetic generation template. Merging them via boolean OR or summation without certified ontological equivalence would corrupt ground-truth symptom patterns and introduce synthetic label distortion. Both columns have been preserved as distinct, unmerged features in the cleaned dataset.

---

## 3. Cross-Dataset Overlap & Provenance Discovery

A comprehensive alignment and overlap audit was conducted between `data/raw/disease_symptoms_binary.csv` and the earlier dataset `data/raw/final_symptoms_to_disease.csv`:

| Dimension | `disease_symptoms_binary.csv` (New Upload) | `final_symptoms_to_disease.csv` (Existing) | Overlap Findings |
| :--- | :---: | :---: | :--- |
| **Row Count** | 246,945 | 192,715 | Subset matches **192,715** rows exactly |
| **Disease Classes** | 773 | 254 | **254 / 254 (100.00%)** of text classes in binary |
| **Format** | Binary one-hot indicators (377 columns) | Comma-delimited serialized text (`symptom_text`) | Text is exact serialization of binary indicators |
| **Disease Order** | Row-for-row match on the 254-disease subset | 192,715 rows | **100% Sequence Alignment (192,715 / 192,715)** |
| **Symptom Tokens** | Active binary 1s | Text tokens | **100.00% sample token equivalence** |

### Critical Scientific Verdict:
> [!WARNING]
> **NOT AN INDEPENDENT DATASET.**  
> The two datasets are **NOT independent observational samples**.  
> `final_symptoms_to_disease.csv` was created by filtering `disease_symptoms_binary.csv` to 254 diseases and converting the active binary symptom columns into comma-separated text strings.  
> **Under NO circumstances can this newly uploaded dataset be used as independent, out-of-distribution, or external validation data for models trained on `final_symptoms_to_disease.csv`.** Doing so would produce 100% evaluation contamination.

---

## 4. Preprocessing & Cleaning Results

The preprocessing pipeline in `scripts/prepare_binary_symptom_dataset.py` executed cleanly:

### A. Deduplication:
- Raw rows: **246,945**
- Exact duplicate rows removed: **57,298 (23.20%)**
- Cleaned unique records: **189,647**

### B. Constant Column Pruning:
- Raw symptom columns: **377**
- Constant all-zero columns pruned: **49**
  ```
  pus in sputum, underweight, arm cramps or spasms, abnormal appearing tongue, pallor,
  shoulder cramps or spasms, joint stiffness or tightness, eye strain, pus in urine,
  abnormal size or shape of ear, elbow cramps or spasms, feeling hot and cold, nailbiting,
  hip swelling, foot or toe cramps or spasms, low back swelling, hip lump or mass,
  feet turned in, elbow stiffness or tightness, mass on ear, throat irritation, swollen tongue,
  disturbance of smell or taste, discharge in stools, pupils unequal, sleepwalking,
  skin oiliness, knee cramps or spasms, posture problems, bleeding in mouth, tongue bleeding,
  change in skin mole size or color, polyuria, infrequent menstruation, mass on vulva,
  jaw pain, eyelid retracted, elbow lump or mass, tongue pain, low back stiffness or tightness,
  skin on head or neck looks infected, stuttering or stammering, problems with orgasm,
  nose deformity, lump over jaw, hip weakness, back swelling, ankle stiffness or tightness,
  neck weakness
  ```
- Retained active symptom columns: **328**

### C. Conflicting Pattern Annotation:
- Total unique symptom vectors: **169,888**
- Single-label patterns: **157,254 (92.56%)**
- Conflicting multi-label patterns: **12,634 (7.44%)**
- Cleaned rows involved in conflicts: **32,393 (17.08%)**
- Each record has been annotated with:
  - `canonical_symptom_hash`: Order-invariant SHA-256 hash
  - `is_conflicting`: Boolean flag (true if symptom pattern maps to $\ge 2$ diseases)
  - `conflict_disease_count`: Number of distinct diseases mapped to this vector
  - `conflict_diseases`: Semicolon-delimited list of conflicting disease classes

---

## 5. Group-Aware Partitioning (Zero-Leakage Guarantee)

Using fixed random seed `42`, the 169,888 unique canonical symptom patterns were partitioned into independent groups:

| Partition | Symptom Pattern Groups | Group Pct | Assigned Rows | Row Pct | Unique Diseases |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Train Set** (`binary_train.csv`) | 118,921 | 70.00% | **132,574** | 69.91% | 772 |
| **Validation Set** (`binary_validation.csv`) | 25,483 | 15.00% | **28,534** | 15.05% | 761 |
| **Test Set** (`binary_test.csv`) | 25,484 | 15.00% | **28,539** | 15.05% | 761 |
| **Total Cleaned** | **169,888** | **100.00%** | **189,647** | **100.00%** | **773** |

### Cross-Split Leakage Verification:
- $\text{Train Groups} \cap \text{Validation Groups} = \mathbf{0} \quad (0.00\%)$
- $\text{Train Groups} \cap \text{Test Groups} = \mathbf{0} \quad (0.00\%)$
- $\text{Validation Groups} \cap \text{Test Groups} = \mathbf{0} \quad (0.00\%)$
- **Leakage Status**: **ZERO CANONICAL LEAKAGE VERIFIED**.

---

## 6. Rare-Class Distribution & Imbalance Audit

The 773 disease classes exhibit severe long-tailed distribution:
- **Maximum Class Count**: 1,219 (`cystitis`)
- **Top 5 Classes**: `cystitis` (1,219), `vulvodynia` (1,218), `nose disorder` (1,218), `complex regional pain syndrome` (1,217), `spondylosis` (1,216)
- **Minimum Class Count**: 1
- **Extreme Rare Singletons (1 row only)**:
  - `foreign body in the nose`
  - `thalassemia`
  - `open wound of the head`
  - `rocky mountain spotted fever`
  - `kaposi sarcoma`
- **Mean Class Frequency**: 319.46 rows
- **Median Class Frequency**: 168.0 rows
- **Classes with $< 10$ rows**: **96 classes (12.42%)**
- **Classes with $< 50$ rows**: **246 classes (31.82%)**
- **Classes with $< 100$ rows**: **330 classes (42.69%)**

*Methodological Impact*: 96 classes have fewer than 10 training samples across the entire dataset. In independent split holdout, singletons can only reside in a single split, guaranteeing 0% test recall for classes absent from training.

---

## 7. Git Tracking & Repository Status Audit

### Files Strictly Excluded from Git (`.gitignore`):
- `data/raw/disease_symptoms_binary.csv` (190.8 MB raw CSV)
- `data/raw/final_symptoms_to_disease.csv` (21.7 MB raw CSV)
- `data/processed/binary_symptoms_cleaned.csv` (~135 MB cleaned CSV)
- `data/processed/binary_train.csv` (~95 MB train CSV)
- `data/processed/binary_validation.csv` (~20 MB val CSV)
- `data/processed/binary_test.csv` (~20 MB test CSV)
- `data/processed/symptom_disease_multilabel.csv`
- `data/processed/train.csv`
- `data/processed/validation.csv`
- `data/processed/test.csv`
- `ml/models/*.joblib`

### Files Included in Git:
- `scripts/validate_binary_symptom_dataset.py` (Validation script)
- `scripts/prepare_binary_symptom_dataset.py` (Data preparation script)
- `data/README.md` (Dataset provenance registry)
- `data/evaluation/BINARY_DATASET_VALIDATION_REPORT.md` (Validation report)
- `data/evaluation/binary_dataset_validation_report.json` (Structured validation findings)
- `data/evaluation/BINARY_PREPROCESSING_REPORT.md` (This document)
- `data/processed/binary_split_summary.json` (Structured split summary)

---

## 8. Clinical Isolation & Safety Invariants

1. **Feature Flags**: Both shadow feature flags remain **strictly disabled**:
   - `TRIAGE_ML_SHADOW_ENABLED=false`
   - `SYMPTOM_PATTERN_SHADOW_ENABLED=false`
2. **Database Status**:
   - Migration `20260927_symptom_pattern_shadow_predictions.sql` remains **DRAFT / UNAPPLIED**.
   - No database schema modifications or table creations were executed.
3. **Application Decoupling**:
   - The binary dataset is strictly offline research data.
   - Zero connections to patient triage, Srida assistant, urgency determination, emergency red flags, or frontend UI queries.
4. **Model Retraining Status**:
   - **No model training or retraining was performed.**
   - All research files remain inert on disk for evaluation only.
