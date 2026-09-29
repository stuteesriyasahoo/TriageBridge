# Triage Urgency Dataset Training-Readiness Audit Report (Corrected Architecture)

> [!CAUTION]
> **READINESS AUDIT VERDICT: `INSUFFICIENT_RESIDUAL_COHORT` (Action Required: `NEEDS_CORRECTION`)**  
> **Dataset File**: [`data/training/triage_cases_v2.csv`](file:///c:/Users/bibhu/Downloads/bput/data/training/triage_cases_v2.csv) (500 synthetic encounters, 25 columns)  
> **Authoritative Gate Engine**: [`ml/triage_gates.py`](file:///c:/Users/bibhu/Downloads/bput/ml/triage_gates.py) (`GATE_VERSION = "2.0.0"`)  
> **Operational Status**: **TRAINING HALTED UNDER STOP CONDITIONS**. Deterministic red-flag and missing-information gates leave **ZERO (0) RED encounters** in the residual ML cohort. An experimental 3-tier model (RED/YELLOW/GREEN) cannot be trained or evaluated until non-red-flag RED encounters are introduced.

---

## 1. Executive Summary & Cohort Accounting

The previous audit mistakenly evaluated all 450 encounters with complete vital signs as ML-eligible. Under the authoritative clinical safety architecture, deterministic rules strictly intercept emergency red flags **before** any case can reach statistical machine learning.

When the multi-tier safety pipeline is applied:

| Pipeline Stage | Evaluated Action | Encounters | % of Dataset | Output Status |
| :--- | :--- | :---: | :---: | :--- |
| **Stage 0: Patient Intake** | Raw encounters presented to triage | **500** | 100.0% | Intake profiles |
| **Tier 1: Missing Information Gate** | Deterministic check for critical vitals/timeline | **50** | 10.0% | Output **`GREY`** (ML strictly bypassed) |
| **Tier 2: Emergency Red-Flag Gate** | Deterministic clinical emergency interception | **150** | 30.0% | Output **`RED`** (ML strictly bypassed) |
| **Tier 3: Residual Cohort Reaching ML** | Cases passing both Tier 1 and Tier 2 | **300** | **60.0%** | **Eligible for Statistical ML** |
| **Tier 4: Healthcare Professional Review** | Mandatory clinician sign-off | 500 | 100.0% | Final decision authority |

### Residual ML Cohort Class Composition

$$\text{Total Reaching ML} = 300 \quad (100\%)$$

- **`RED`**: **0 encounters (0.0%)**
- **`YELLOW`**: **150 encounters (50.0%)**
- **`GREEN`**: **150 encounters (50.0%)**

> [!IMPORTANT]
> **Primary Architectural Finding**: Because all 150 RED encounters in the dataset carry explicit deterministic red flags, **exactly ZERO RED cases reach the ML layer**.  
> The residual cohort is exclusively a binary distribution between YELLOW and GREEN. Training a 3-class RED/YELLOW/GREEN model on this residual cohort is technically impossible and violates safety stop conditions (missing target class in splits, zero evaluation support for RED sensitivity).

---

## 2. Task 1 — Authoritative Safety Gate Implementation

The authoritative safety gates are implemented and versioned in [`ml/triage_gates.py`](file:///c:/Users/bibhu/Downloads/bput/ml/triage_gates.py) (`GATE_VERSION = "2.0.0"`).

### Gate 1: Missing-Information Gating (`evaluate_missing_info_gate`)
Evaluates whether critical physiological or history data is absent. When triggered, the encounter outputs **`GREY`** and prompts the triage worker to collect basic observations.

1. **`MISSING_ALL_VITAL_SIGNS`**: All 6 physiological vitals (`HR`, `SBP`, `DBP`, `SpO2`, `Temp`, `RR`) are absent.
2. **`MISSING_HEMODYNAMIC_BASELINE_HR_AND_SBP`**: Both heart rate and systolic blood pressure are absent.
3. **`MISSING_SPO2_IN_RESPIRATORY_PRESENTATION`**: Patient presents with respiratory complaints (e.g., dyspnea, wheezing, breathlessness, stridor, cough) but SpO2 is missing.
4. **`MISSING_PAEDIATRIC_VITALS_TEMP_AND_HR`**: Paediatric patient ($\le 5$ years) lacking temperature and heart rate.
5. **`MISSING_VITAL_MONITORING_IN_ALTERED_MENTAL_STATUS`**: Patient presents with acute confusion, disorientation, or syncope lacking oxygen saturation, temperature, or respiratory rate.
6. **`MISSING_HEMODYNAMICS_IN_CHEST_PRESENTATION`**: Acute chest pain/tightness lacking blood pressure or heart rate.

### Gate 2: Emergency Red-Flag Interception (`evaluate_red_flag_gate`)
Evaluates critical physiological thresholds and high-risk acute presentations. When triggered, the encounter outputs **`RED`** immediately. **The ML model cannot downgrade or override positive red flags.**

#### Physiological Critical Vitals Thresholds
- **Hypoxia**: SpO2 $< 90\%$ (severe hypoxemia requiring urgent oxygen/airway support).
- **Hypotension / Shock**: SBP $< 85$ mmHg or DBP $< 45$ mmHg (decompensated circulatory failure).
- **Hypertensive Crisis**: SBP $\ge 200$ mmHg or DBP $\ge 120$ mmHg (acute end-organ failure risk).
- **Extreme Tachycardia**: HR $> 160$ bpm (unstable tachyarrhythmia / severe sepsis).
- **Extreme Bradycardia**: HR $< 40$ bpm (hemodynamically significant conduction block).
- **Critical Tachypnea**: RR $\ge 35$ bpm (impending respiratory exhaustion).
- **Critical Hyperthermia**: Temperature $\ge 40.0^\circ$C (heat stroke / malignant hyperthermia).

#### Clinical Presentation Red-Flag Constellations
- **`RF_CLINICAL_ACUTE_CHEST_PAIN`**: Retrosternal crushing chest pain radiating to left shoulder/jaw with diaphoresis (acute coronary syndrome suspicion).
- **`RF_CLINICAL_STROKE_FAST`**: Acute focal neurological deficit: facial asymmetry/droop, arm weakness, slurred speech/dysphasia (FAST criteria).
- **`RF_CLINICAL_RESPIRATORY_DISTRESS`**: Gasping breathlessness, peripheral cyanosis, intercostal indrawing, respiratory fatigue.
- **`RF_CLINICAL_ANAPHYLAXIS`**: Acute facial/lip angioedema, stridor, widespread urticaria, circulatory collapse.
- **`RF_CLINICAL_PAEDIATRIC_SEPSIS`**: Paediatric patient ($\le 12$ years) with high fever, lethargy/unrousable, non-blanching petechial/purpuric rash.
- **`RF_CLINICAL_SEVERE_HEMORRHAGE`**: Massive hematemesis, large volume blood loss, postural syncope.
- **`RF_CLINICAL_PREGNANCY_EMERGENCY`**: Third-trimester pregnancy with severe headache, visual scotoma, epigastric/RUQ pain, hypertension (eclampsia/severe preeclampsia).
- **`RF_CLINICAL_HYPERTENSIVE_EMERGENCY`**: "Worst headache of life", visual blurring, persistent vomiting with extreme hypertension.
- **`RF_CLINICAL_UNCONSCIOUS`**: Coma, unresponsiveness, or profound altered sensorium.

---

## 3. Task 2 — Real ML Cohort Recalculation & Split Audit

### Real ML Cohort Summary

```
Total Encounters in Dataset:               500
├── Gate 1 Triggered (Deterministic GREY):  50 (10.0%)
└── Gate 1 Passed:                         450 (90.0%)
    ├── Gate 2 Triggered (Deterministic RED): 150 (30.0%)
    └── Gate 2 Passed (Residual ML Cohort):   300 (60.0%)
        ├── RED Urgency:                         0 (  0.0%)
        ├── YELLOW Urgency:                    150 ( 50.0%)
        └── GREEN Urgency:                     150 ( 50.0%)
```

### Residual Split Partitioning (Seed 42, Group-Stratified Holdout)

Partitioning the 300 residual encounters across 21 unique narrative template groups using group-stratified holdout (Seed 42):

| Partition | Total Encounters | Template Groups | GREEN Encounters | YELLOW Encounters | RED Encounters |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Train** | **210 (70.0%)** | 15 (11 Green, 4 Yellow) | 110 | 100 | **0** |
| **Validation** | **45 (15.0%)** | 3 (2 Green, 1 Yellow) | 20 | 25 | **0** |
| **Held-Out Test** | **45 (15.0%)** | 3 (2 Green, 1 Yellow) | 20 | 25 | **0** |

### Evaluation Reliability Assessment
- **Can every residual class be evaluated reliably?**: **NO.**
- **RED Class Support**: **0 in Train, 0 in Validation, 0 in Test**.
- **Impact**: It is mathematically impossible to evaluate RED recall, RED sensitivity, or RED false-negative counts on the residual ML cohort.
- **Stop Condition Triggered**: Under mandatory clinical ML safety rules, training cannot proceed when a target class is absent from the evaluation cohort.

---

## 4. Task 3 — Label Consistency & Rule Imitation Audit

The dataset records were audited against the authoritative gating logic:

| Consistency Check | Result | Clinical Interpretation |
| :--- | :---: | :--- |
| **RED-labelled cases with NO deterministic red flag** | **0** | Every single RED case in the dataset triggers a red flag. |
| **YELLOW cases triggering a deterministic red flag** | **0** | No false-positive red flags in YELLOW cases. |
| **GREEN cases triggering a deterministic red flag** | **0** | No false-positive red flags in GREEN cases. |
| **GREY cases NOT missing critical information** | **0** | Every GREY case lacks critical vital signs or timeline data. |
| **Complete-vitals cases incorrectly labelled GREY** | **0** | No complete encounters are gated as GREY. |
| **Identical intake profiles assigned different labels** | **0** | Zero contradictory intake profiles detected. |

### Critical Finding: Rule Imitation vs. Clinical Generalization
The synthetic dataset generator ([`scripts/generate_training_data.js`](file:///c:/Users/bibhu/Downloads/bput/scripts/generate_training_data.js)) created every single RED encounter by combining a deterministic red-flag rule template with simulated vitals. 

> [!WARNING]
> Because labels were generated directly from the red-flag rules, evaluating a machine learning model against these RED labels would primarily measure **deterministic rule imitation**, NOT independent statistical triage capability.  
> If an ML model is trained on these templates, it simply learns to approximate the hardcoded thresholds of the script. To provide genuine clinical utility, the ML model must be trained on **residual RED cases**—patients who require urgent emergency care due to subtle clinical patterns, complex combinations of non-critical vitals, or progressive deterioration that fail to trigger obvious keyword or threshold red flags.

---

## 5. Task 4 — Template, Hash & Leakage Audit

To verify that synthetic templates and feature profiles do not cross partition boundaries:

- **Chief Complaint & Symptoms Text Hashes**: 60 unique SHA-256 text hashes across the 500-encounter dataset; exactly 21 unique text hashes in the residual ML cohort.
- **Rounded Vital Sign Combinations**: 452 unique combinations across 500 encounters (high physiological diversity in numeric vitals).
- **Group Holdout Integrity**: Zero narrative template overlap across splits:
  - $\text{Train} \cap \text{Val} = \emptyset$
  - $\text{Train} \cap \text{Test} = \emptyset$
  - $\text{Val} \cap \text{Test} = \emptyset$
- **Patient Synthetic Identifier Overlap**: Zero patient ID crossover ($\text{overlap} = 0$).

---

## 6. Task 5 — Feature Review & Language Subgroup Audit

### Distribution Across Languages

| Cohort | English (`en`) | Hindi (`hi`) | Odia (`or`) | Balance Ratio |
| :--- | :---: | :---: | :---: | :---: |
| **Total Dataset (N=500)** | 167 (33.4%) | 167 (33.4%) | 166 (33.2%) | Exact 1:1:1 balance |
| **Residual ML Cohort (N=300)** | 100 (33.3%) | 100 (33.3%) | 100 (33.3%) | Exact 1:1:1 balance |

### Generator Modulo Artifact Discovery
A structural artifact was discovered in [`scripts/generate_training_data.js`](file:///c:/Users/bibhu/Downloads/bput/scripts/generate_training_data.js):
```javascript
const template = templates[i % templates.length]; // 6 YELLOW templates
const lang = languages[i % 3];                     // 3 languages
```
Because $6 \pmod 3 = 0$, every YELLOW template was locked 1-to-1 with a specific language:
- Template 1 (Acute Appendicitis) $\rightarrow$ Generated **only in English** (`en`)
- Template 2 (Moderate Pneumonia) $\rightarrow$ Generated **only in Hindi** (`hi`)
- Template 3 (Forearm Laceration) $\rightarrow$ Generated **only in Odia** (`or`)
- Template 4 (Renal Colic) $\rightarrow$ Generated **only in English** (`en`)
- Template 5 (Diabetic Hyperglycemia) $\rightarrow$ Generated **only in Hindi** (`hi`)
- Template 6 (Acute Pyelonephritis) $\rightarrow$ Generated **only in Odia** (`or`)

### Feature Inclusion Policy
- **`patient_language` MUST BE EXCLUDED from the predictive feature matrix.**
- Including language would allow the model to exploit spurious correlations between language and specific medical pathologies created by the generator script.
- Language must be retained strictly as an **independent subgroup audit dimension** to evaluate disparity and fairness post-inference.

---

## 7. Task 6 — Operational Threshold Policy

No operational decision thresholds have been preselected:
- **Confidence Threshold**: `UNSET`
- **Candidate Margin Threshold ($\Delta_{\text{top2}}$)**: `UNSET`
- **Abstention Threshold**: `UNSET`

> [!IMPORTANT]
> In accordance with safety protocol, all operational thresholds must be calibrated **exclusively using the validation set** after model training.  
> The held-out test set remains locked and untouched until the final, unblinded performance evaluation.

---

## 8. Task 7 — Revised Training-Readiness Verdict

### Final Verdict: **`INSUFFICIENT_RESIDUAL_COHORT`**
*(Secondary Status: **`NEEDS_CORRECTION`**)*

### Summary Rationale:
1. **Zero RED Cases in ML Layer**: Deterministic red-flag interception correctly captures 100% of the dataset's emergency RED cases. This leaves the residual ML cohort with 0 RED encounters ($N_{\text{RED}}=0$).
2. **Untrainable 3-Class Goal**: An experimental model designed to suggest RED, YELLOW, or GREEN cannot learn the RED category or be evaluated for RED sensitivity on this residual cohort.
3. **Pure Rule Imitation**: Because all RED labels in `triage_cases_v2.csv` were synthesized directly from explicit red-flag rules, evaluating ML on them would measure script mimicry rather than statistical triage utility.
4. **Generator Modulo Artifact**: The synthetic generator binds specific medical conditions to specific languages in the YELLOW cohort, requiring script correction.

---

## 9. Required Correction Plan (Before Any Training Can Occur)

1. **Update Data Generator ([`scripts/generate_training_data.js`](file:///c:/Users/bibhu/Downloads/bput/scripts/generate_training_data.js))**:
   - Introduce **subtle/borderline RED emergency encounters** that do not trigger obvious keyword or threshold red flags (e.g., occult shock, atypical presentations, multi-system borderline vitals), giving the ML layer an actual clinical task to perform.
   - Decouple language cycling from template indexing so that every clinical presentation appears across all three languages (`en`, `hi`, `or`).
2. **Re-Audit Residual Cohort**:
   - Verify that the residual cohort contains sufficient support across all three classes (RED, YELLOW, GREEN) before partitioning into train/validation/test splits.
3. **Maintain Safety Invariants**:
   - `TRIAGE_ML_SHADOW_ENABLED=false`
   - `SYMPTOM_PATTERN_SHADOW_ENABLED=false`
   - Zero model training, database migrations, application integrations, or Git commits.
