# Binary Symptom-Disease Dataset Validation & Provenance Audit Report

> [!CAUTION]
> **STRICT CLINICAL SAFETY & RESEARCH-ONLY NOTICE**  
> **Status: UNVERIFIED \| Licence: UNVERIFIED \| Clinical Use: PROHIBITED \| Research Only: True**  
> This dataset is an unverified external research artifact. It is strictly prohibited from any clinical diagnostic, triage, or decision-making application.

---

## 1. Executive Summary & Verification of Known Audit Targets

All known audit values specified for the newly uploaded dataset have been independently calculated and **100% verified**:

| Audit Property | Expected Value | Verified Value | Status |
| :--- | :---: | :---: | :---: |
| **Row Count** | 246,945 | **246,945** | **VERIFIED MATCH** |
| **Column Count** | 378 | **378** | **VERIFIED MATCH** |
| **Disease Classes** | 773 | **773** | **VERIFIED MATCH** |
| **Exact Duplicate Rows** | 57,298 | **57,298** | **VERIFIED MATCH** |
| **All-Zero Symptom Columns** | 49 | **49** | **VERIFIED MATCH** |
| **Conflicting Symptom Vectors** | 12,634 | **12,634** | **VERIFIED MATCH** |
| **Rows Involved in Conflicts (Raw)** | 39,728 | **39,728** | **VERIFIED MATCH** |
| **SHA-256 Checksum** | `8de90603...c21320` | `8de90603ebada467fc2703db2ee4292856e52d64e94982ef926df22fa0c21320` | **VERIFIED MATCH** |
| **Raw File Size** | ~190.8 MB | **190,786,867 bytes (181.95 MB)** | **VERIFIED MATCH** |

---

## 2. Investigation of `regurgitation` vs `regurgitation.1`

The raw CSV header contains two distinct columns representing regurgitation:
1. `regurgitation` (Column Index: **103**)
2. `regurgitation.1` (Column Index: **201**)

### Statistical & Co-occurrence Analysis:
- Total positive rows for `regurgitation`: **2,490**
- Total positive rows for `regurgitation.1`: **4,170**
- **Both == 1**: **2,490** rows
- **`regurgitation` only == 1**: **0** rows
- **`regurgitation.1` only == 1**: **1,680** rows
- **Neither == 1**: **242,775** rows

### Clinical & Contextual Discrepancy:
- `regurgitation` (index 103) is located adjacent to pediatric/infant symptoms (`pain during pregnancy`, `pelvic pain`, `impotence`, `infant spitting up`, `vomiting blood`, `burning abdominal pain`, `symptoms of infants`).
- `regurgitation.1` (index 201) is located adjacent to adult abdominal symptoms (`hand or finger lump`, `chills`, `groin pain`, `fatigue`, `abdominal distention`, `symptoms of the kidneys`, `melena`).
- The 1,680 cases where `regurgitation.1 == 1` but `regurgitation == 0` belong predominantly to hepatobiliary and gastric diseases: **cholecystitis (609)**, **gallstone (604)**, **gastritis (341)**.

> [!IMPORTANT]
> **VERDICT: DO NOT MERGE.**  
> DO NOT MERGE. While 'regurgitation' is a strict mathematical subset of 'regurgitation.1' (every positive instance of 'regurgitation' has 'regurgitation.1 == 1'), 'regurgitation.1' possesses 1,680 positive instances where 'regurgitation' is 0, occurring predominantly in hepatobiliary and gastric pathologies (e.g., cholecystitis: 609 rows, gallstone: 604 rows, gastritis: 341 rows). In contrast, 'regurgitation' (col 103) is grouped with infant/pediatric symptoms ('infant spitting up', 'symptoms of infants', 'burning abdominal pain'). Merging them without clinical ontology verification would alter ground-truth feature vectors and introduce uncontrolled synthetic distortion.

---

## 3. Cross-Dataset Comparison: `disease_symptoms_binary.csv` vs `final_symptoms_to_disease.csv`

A rigorous cross-dataset provenance and alignment analysis was performed against the earlier dataset:

| Dimension | Binary Dataset (`disease_symptoms_binary.csv`) | Text Dataset (`final_symptoms_to_disease.csv`) | Overlap / Relationship |
| :--- | :---: | :---: | :--- |
| **Row Count** | 246,945 | 192,715 | Sub-slice matches **192,715 rows** exactly |
| **Unique Diseases** | 773 | 254 | **254 / 254 (100.00%)** of text diseases in binary |
| **Data Format** | One-hot binary indicator matrix (377 symptom cols) | Comma-delimited serialized text (`symptom_text`) | Text is exact serialization of binary 1s |
| **Disease Order** | Matches row-for-row on the 254-disease subset | 192,715 rows | **100% Sequence Alignment** |

### Critical Finding on Independence:
> [!WARNING]
> **NOT AN INDEPENDENT DATASET.**  
> `final_symptoms_to_disease.csv` is not an independent observational dataset; it is an exact serialized transformation and filtered subset of `disease_symptoms_binary.csv`.  
> **Under NO circumstances can this dataset be used as independent out-of-distribution or external validation data for models trained on `final_symptoms_to_disease.csv`.** Doing so would constitute 100% evaluation contamination and artificial performance inflation.

---

## 4. Constant All-Zero Columns (49 Columns)

The following 49 symptom columns have **zero positive occurrences** across all 246,945 records in the raw dataset and contain zero discriminative variance:
```
pus in sputum, underweight, arm cramps or spasms, abnormal appearing tongue, pallor, shoulder cramps or spasms, joint stiffness or tightness, eye strain, pus in urine, abnormal size or shape of ear, elbow cramps or spasms, feeling hot and cold, nailbiting, hip swelling, foot or toe cramps or spasms, low back swelling, hip lump or mass, feet turned in, elbow stiffness or tightness, mass on ear, throat irritation, swollen tongue, disturbance of smell or taste, discharge in stools, pupils unequal, sleepwalking, skin oiliness, knee cramps or spasms, posture problems, bleeding in mouth, tongue bleeding, change in skin mole size or color, polyuria, infrequent menstruation, mass on vulva, jaw pain, eyelid retracted, elbow lump or mass, tongue pain, low back stiffness or tightness, skin on head or neck looks infected, stuttering or stammering, problems with orgasm, nose deformity, lump over jaw, hip weakness, back swelling, ankle stiffness or tightness, neck weakness
```
*Action in Preprocessing*: These 49 dead columns will be documented and pruned from the modeling feature space.

---

## 5. Rare-Class Distribution & Class Imbalance

The 773 disease classes exhibit extreme long-tailed class imbalance:
- **Max Class Count**: 1219 (`cystitis`)
- **Min Class Count**: 1 (Singletons with 1 record: `foreign body in the nose`, `thalassemia`, `open wound of the head`, `rocky mountain spotted fever`, `kaposi sarcoma`)
- **Mean Class Count**: 319.46
- **Median Class Count**: 168.0
- **Classes with < 10 rows**: **96 (12.42%)**
- **Classes with < 50 rows**: **246 (31.82%)**
- **Classes with < 100 rows**: **330 (42.69%)**

Classes with fewer than 5–10 instances cannot support reliable multi-label statistical generalization or independent split holdout without severe representation collapse.

---

## 6. Safety & Repository Invariants

- **Provenance**: UNVERIFIED (Third-party synthetic clinical archetype repository).
- **Licence**: UNVERIFIED (Commercial or clinical use strictly prohibited).
- **Feature Flags**:
  - `TRIAGE_ML_SHADOW_ENABLED=false`
  - `SYMPTOM_PATTERN_SHADOW_ENABLED=false`
- **Database Status**: No migrations applied; table `symptom_pattern_shadow_predictions` remains unmigrated.
- **Application Isolation**: Strictly disconnected from patient routing, Srida assistant, and triage urgency.
- **Git Tracking**: Raw CSV (190.8 MB) is strictly excluded via `.gitignore`.
