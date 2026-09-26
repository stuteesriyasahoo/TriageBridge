# TriageBridge Multilingual Challenge Medical Review Guide

**Document Reference:** `TB-MEDREV-GUIDE-V1.0`  
**Target Dataset:** `data/evaluation/multilingual_challenge_set.csv` (300 cases)  
**Tracking Sheet:** `data/evaluation/challenge_review_sheet.csv`  
**Current Audit Status:** `PENDING_QUALIFIED_MEDICAL_REVIEW`  

---

## 1. Regulatory Context & Review Philosophy

The TriageBridge urgency classifier is an **experimental machine learning prototype** trained on synthetic multilingual clinical triage records. Under no circumstances may this model be deployed for direct autonomous clinical decision-making or patient discharge.

> [!CAUTION]
> **CRITICAL CLINICAL SAFETY NOTICE**  
> In independent challenge testing, the machine learning model generated **13 unsafe YELLOW-to-GREEN downgrades** where patients with urgent conditions (e.g., corneal foreign bodies, diabetic hypoglycemia, discharging diabetic ulcers) were misclassified as routine outpatients due to normal vital signs.
> 
> A human healthcare worker's clinical assessment is **authoritative and paramount**. All model outputs in this repository are restricted to **silent shadow mode** for technical evaluation and audit only.

### Prohibition of Fabricated Medical Signatures
Review records must reflect genuine evaluation by licensed clinical practitioners. **Do not create, synthesize, or fabricate any medical signature, registration number, or clinician approval timestamp.** The placeholder status `PENDING_QUALIFIED_MEDICAL_REVIEW` must remain until a qualified doctor or nurse completes the physical or digital review sheet.

---

## 2. Urgency Label Definitions & Clinical Criteria

| Urgency Category | Color Code | Clinical Definition | Maximum Acceptable Initial Assessment Time | Action Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **Resuscitation / Immediate** | **RED** | Immediate life-threat, airway compromise, severe shock, unresponsive state, active seizure, or critical vital sign derangement. | **Immediate (0 minutes)** | Direct immediate transfer to resuscitation bay; notify emergency physician; initiate oxygen/IV access. |
| **Emergent / Urgent** | **YELLOW** | Severe pain, high-risk presentation with stable airway/breathing, potential rapid deterioration, acute surgical abdomen, progressive infection, or metabolic decompensation. | **≤ 15 to 30 minutes** | Placed in priority monitoring queue; vitals re-checked q30min; medical officer bedside evaluation. |
| **Non-Urgent / Routine** | **GREEN** | Stable chronic illness, mild minor injuries (sprains, minor abrasions), routine cough/cold with normal vitals, no red flags. | **≤ 60 to 120 minutes** | General outpatient consultation queue; standard triage advice provided. |
| **Incomplete / Missing Information** | **GREY** | Essential physiological information (e.g., blood pressure, pulse, SpO2) or critical temporal timeline is missing from intake. | **Immediate Data Capture** | Assigned deterministically by safety gate; triage officer must capture vital signs before clinical urgency determination. |

---

## 3. Project-Defined Deterministic Red-Flag Rules Pending Qualified Medical Review

The deterministic safety gate enforces an absolute floor of **minimum RED** whenever any of the following clinical triggers are present. Machine learning models **cannot downgrade** any encounter meeting these criteria:

1. **Altered Mental State / Airway Compromise (`RF-UNCONSCIOUS`):**
   - Coma, Glasgow Coma Scale (GCS) < 13, stupor, unresponsive, active seizure, acute collapse.
2. **Acute Coronary Syndrome (`RF-ACUTE-CHEST-PAIN`):**
   - Crushing retrosternal chest pain radiating to left arm, neck, or jaw, diaphoresis with chest pressure.
3. **Acute Stroke / FAST Deficit (`RF-STROKE-FAST`):**
   - Sudden unilateral facial droop, arm drift, slurred speech, sudden acute hemiplegia.
4. **Physiological Collapse / Critical Vitals:**
   - **Severe Hypoxia:** Oxygen saturation ($SpO_2$) $< 90\%$ on room air.
   - **Hypertensive Crisis:** Systolic Blood Pressure ($SBP$) $\ge 200\text{ mmHg}$ or Diastolic $DBP \ge 120\text{ mmHg}$.
   - **Decompensated Shock / Hypotension:** $SBP < 85\text{ mmHg}$ with tachycardia.
   - **Critical Arrhythmia / Extremes of Heart Rate:** Heart rate $< 40\text{ bpm}$ or $> 160\text{ bpm}$.
   - **Hyperpyrexia:** Core body temperature $\ge 40.5^\circ\text{C}$ ($104.9^\circ\text{F}$).

---

## 4. Deterministic Missing-Information Rules (GREY Gate)

Encounter records lacking vital clinical context are trapped by the GREY gate and prevented from entering the statistical classifier:

1. **Dual Core Cardiovascular Vital Omission:**
   - Both Heart Rate and Systolic Blood Pressure are absent or unmeasured.
2. **Respiratory Presentation Missing Oximetry:**
   - Any complaint involving shortness of breath, dyspnea, wheezing, cough, or respiratory distress without an oxygen saturation ($SpO_2$) measurement.
3. **Paediatric Presentation Missing Thermal/Cardiac Assessment:**
   - Patient age $\le 5$ years lacking both body temperature and heart rate documentation.
4. **Total Absence of Vital Signs:**
   - Completely blank vital sign records.

---

## 5. Audit of the 13 Unsafe YELLOW-to-GREEN Challenge Downgrades

During the independent challenge evaluation of 300 synthetic multilingual cases, the statistical ML model committed **13 critical unsafe downgrades** (support: 90 YELLOW cases, 13 misclassified as GREEN).

### Root Cause Analysis
In all 13 cases, the patient's physiological vital signs (heart rate, blood pressure, $SpO_2$) fell within standard reference ranges. The machine learning model assigned disproportionate statistical weight to normal numerical vitals, effectively ignoring high-risk narrative indicators and colloquial descriptions of urgent conditions.

### Detailed Case Inventory

| Case ID | Language | Chief Complaint / Presentation | Vitals Profile | Model Output | Ground Truth | Clinical Failure Reason |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CHALLENGE-047` | English | Severe vertigo with spinning room and unsteadiness when turning head | HR 82, BP 134/82, SpO2 98% | **GREEN** | **YELLOW** | Acute vestibular crisis / stroke mimic misjudged due to normal vitals. |
| `CHALLENGE-048` | English | Severe foreign body sensation in left eye after metal angle grinding | HR 78, BP 124/78, SpO2 99% | **GREEN** | **YELLOW** | Corneal metallic foreign body risk of penetration/ulceration ignored. |
| `CHALLENGE-050` | English | Left foot ulcer in diabetic patient discharging cloudy fluid | HR 86, BP 140/84, SpO2 98% | **GREEN** | **YELLOW** | Diabetic foot sepsis / osteomyelitis risk downgraded as minor wound. |
| `CHALLENGE-052` | English | Sharp chest wall pain worsened by pressing on 4th rib costochondral junction | HR 76, BP 128/80, SpO2 99% | **GREEN** | **YELLOW** | Atypical chest pain requiring ECG exclusion improperly triaged to routine outpatient. |
| `CHALLENGE-055` | English | Confusion and unsteadiness in elderly diabetic, blood sugar 54 mg/dL | HR 94, BP 138/82, SpO2 98% | **GREEN** | **YELLOW** | Acute symptomatic neuroglycopenia downgraded due to stable blood pressure. |
| `CHALLENGE-147` | Hindi | Sar ghoom raha hai aur aas paas ki cheezein gol gol ghoomti lag rahi | HR 80, BP 132/80, SpO2 98% | **GREEN** | **YELLOW** | Hindi colloquial vertigo missed by tokeniser; vitals treated as ambulatory. |
| `CHALLENGE-148` | Hindi | Welding ka kaam karte waqt aankh me metal ka kanka chala gaya | HR 76, BP 122/76, SpO2 99% | **GREEN** | **YELLOW** | Occupational ocular metal trauma downgraded to routine care. |
| `CHALLENGE-152` | Hindi | Chhati me ek jagah dabane par tez dard hota hai, khansi me bhi dard | HR 74, BP 126/78, SpO2 99% | **GREEN** | **YELLOW** | Pleuritic/chest wall pain requiring clinician evaluation triaged to routine. |
| `CHALLENGE-155` | Hindi | Sugar 58 aa rahi hai aur hath kaanp rahe hain, paseena aa raha hai | HR 92, BP 136/80, SpO2 98% | **GREEN** | **YELLOW** | Diaphoresis and tremor from hypoglycemia triaged as non-urgent. |
| `CHALLENGE-247` | Odia | Munda ghuruchhi o charipakhara jinisaha sabu ghurila bhali laguchi | HR 82, BP 134/82, SpO2 98% | **GREEN** | **YELLOW** | Odia colloquial vertigo phrase ignored; normal vitals triggered GREEN. |
| `CHALLENGE-248` | Odia | Grinder chalauthila bele akhi bhitare loha kanka pasigala | HR 78, BP 124/78, SpO2 99% | **GREEN** | **YELLOW** | Ocular foreign body classified as minor outpatient complaint. |
| `CHALLENGE-252` | Odia | Chhati majhire gote nirdista sthana re chipile tez betha heuchi | HR 76, BP 128/80, SpO2 99% | **GREEN** | **YELLOW** | Focal chest pain misidentified as non-urgent without clinical rule exclusion. |
| `CHALLENGE-255` | Odia | Sugar 56 heijaichi o hatha tharuchi saha ghamuchhi | HR 94, BP 138/82, SpO2 98% | **GREEN** | **YELLOW** | Symptomatic hypoglycemia with diaphoresis downgraded to routine. |

---

## 6. Audit of the 9 Conservative Escalations (YELLOW to RED)

The model escalated 9 cases from YELLOW to RED:

| Case ID | Language | Presentation | Vitals Trigger | Model Output | Ground Truth | Clinical Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CHALLENGE-034` | English | Asthma exacerbation with persistent tight wheeze | HR 104, SpO2 93%, BP 134/84 | **RED** | **YELLOW** | Borderline SpO2 (93%) and tachycardia triggered conservative RED escalation. |
| `CHALLENGE-035` | English | Productive green phlegm cough and pleuritic chest ache | HR 100, SpO2 92%, Temp 38.6°C | **RED** | **YELLOW** | Community acquired pneumonia with mild hypoxemia elevated to resuscitation level. |
| `CHALLENGE-037` | English | Unable to pass urine for 16 hours, tense painful bladder | HR 98, BP 158/94, SpO2 97% | **RED** | **YELLOW** | Severe acute urinary retention elevated to RED due to hypertension from distress. |
| `CHALLENGE-041` | English | Child with persistent barking cough, hoarseness | HR 118, SpO2 95%, BP 102/64 | **RED** | **YELLOW** | Viral croup with stridor features over-triaged; clinically safe but resource intensive. |
| `CHALLENGE-134` | Hindi | Asthma flare up, pump lene ke baad bhi seeti bajj rahi | HR 102, SpO2 93%, BP 132/82 | **RED** | **YELLOW** | Moderate asthma exacerbation with SpO2 93% escalated conservatively. |
| `CHALLENGE-135` | Hindi | Peele balgam wali khansi teen din se aur tez bukhar | HR 98, SpO2 92%, BP 136/84 | **RED** | **YELLOW** | Pneumonia presentation escalated to RED. Safe for patient, adds ED queue load. |
| `CHALLENGE-234` | Odia | Asthma rogira chhati chipi heuchi o seeti sabda | HR 104, SpO2 93%, BP 134/84 | **RED** | **YELLOW** | Odia wheezing presentation escalated safely to RED. |
| `CHALLENGE-235` | Odia | Haladia kasha balgam paduchi o chhati re thanda jwara | HR 100, SpO2 92%, BP 138/86 | **RED** | **YELLOW** | Odia pneumonia presentation with SpO2 92% escalated to RED. |
| `CHALLENGE-241` | Odia | Pila ku rati ru kukurara bhou bhou bhali khasi | HR 118, SpO2 95%, BP 102/64 | **RED** | **YELLOW** | Paediatric barking cough safely triaged to high priority RED. |

---

## 7. Reviewer Instructions: Recording Approvals & Corrections

Licensed medical professionals reviewing `data/evaluation/challenge_review_sheet.csv` must follow this standardized protocol:

### Step 1: Open the Review Sheet
Locate `data/evaluation/challenge_review_sheet.csv`. The columns are:
1. `case_id`: Immutable challenge identifier (e.g., `CHALLENGE-001`).
2. `original_urgency_label`: Synthetic benchmark label (`RED`, `YELLOW`, `GREEN`, `GREY`).
3. `reviewer_approved_label`: The clinician's verified urgency level (`RED`, `YELLOW`, `GREEN`, `GREY`).
4. `reviewer_name_or_id`: Full clinician name and State Medical Council / Nursing Council registration ID.
5. `review_date`: ISO-8601 date string (e.g., `2026-09-26`).
6. `reviewer_notes`: Mandatory clinical justification if correcting or confirming edge cases.
7. `approval_status`: Update from `PENDING_QUALIFIED_MEDICAL_REVIEW` to `APPROVED` or `AMENDED`.

### Step 2: Protocol for Correcting Labels (Non-Destructive Versioning)
To ensure regulatory compliance and forensic auditability:
- **Never overwrite or delete `original_urgency_label`.**
- Enter the amended label in `reviewer_approved_label`.
- Enter the exact reason for reclassification in `reviewer_notes` (e.g., `"Reclassified from YELLOW to RED due to borderline pediatric tachycardia and inspiratory stridor"`).
- When a revision is completed, the dataset pipeline archives the previous review sheet to `data/evaluation/archive/review_sheet_v1_YYYYMMDD.csv` before saving the new revision.

---

## 8. Summary Checklist for Qualified Clinician Sign-off

- [ ] All 300 cases examined against medical triage standards.
- [ ] Special verification performed on the 13 YELLOW-to-GREEN challenge cases.
- [ ] Verification performed on the 9 conservative escalations.
- [ ] No patient or synthetic identifier modified.
- [ ] Reviewer registration number recorded in council database.
- [ ] Review status updated to `APPROVED` or `AMENDED` with timestamp.
