# Symptom-Disease Research Dataset Validation Report

> [!IMPORTANT]
> **SAFETY & CLINICAL BOUNDARY**:
> This dataset (`final_symptoms_to_disease.csv`) contains unverified symptom patterns from an open NLP benchmark.
> It **must not** be used for clinical diagnosis, patient triage urgency scoring, medication selection, or treatment planning.

---

## 1. Executive Summary & File Integrity

| Metric | Measured Value | Standard / Expectation | Audit Verdict |
| :--- | :--- | :--- | :---: |
| **Filename** | `final_symptoms_to_disease.csv` | `final_symptoms_to_disease.csv` | PASS |
| **File Size** | 21,741,830 bytes | ~21.7 MB | PASS |
| **SHA-256** | `27069dae02c057a619467361325a46ec29b03bc66d95b6e3fead81b50e0f8f72` | Verified | PASS |
| **Total Rows** | 192,715 | 192,715 | CONFIRMED |
| **Total Columns** | 2 | 2 (`diseases`, `symptom_text`) | PASS |
| **Missing/Null Disease Values** | 0 | 0 | PASS |
| **Missing/Null Symptom Values** | 0 | 0 | PASS |
| **Blank / Empty Strings** | 0 | 0 | PASS |
| **Exact Duplicate Rows** | 28,988 | 28,988 | CONFIRMED |

---

## 2. Cardinality & Multi-Label Conflict Analysis

| Characteristic | Count | Methodological Consequence |
| :--- | :--- | :--- |
| **Unique Diseases (Raw)** | 254 | 254 distinct disease taxonomy terms |
| **Unique Symptoms (Raw)** | 149,241 | Natural language symptom strings |
| **Unique Symptoms (Normalized)** | 149,241 | Lowercase, trimmed, collapsed whitespace |
| **Symptom Texts with Multiple Diseases** | **10,179** | **High ambiguity; cannot use single-label classifier** |
| **Max Diseases per Single Symptom** | **17** | A single symptom phrase points to up to 17 diseases |
| **Rows in Conflicting Groups** | **27,897** | 27,897 rows share non-unique symptom text |

### Label Ambiguity Breakdown
| Diseases per Symptom Text | Number of Unique Symptom Texts |
| :---: | :---: |
| 1 disease | 139,062 symptom texts |
| 2 diseases | 7,562 symptom texts |
| 3 diseases | 1,688 symptom texts |
| 4 diseases | 533 symptom texts |
| 5 diseases | 221 symptom texts |
| 6 diseases | 87 symptom texts |
| 7 diseases | 44 symptom texts |
| 8 diseases | 23 symptom texts |
| 9 diseases | 9 symptom texts |
| 10 diseases | 4 symptom texts |
| 11 diseases | 2 symptom texts |
| 12 diseases | 1 symptom texts |
| 13 diseases | 2 symptom texts |
| 14 diseases | 2 symptom texts |
| 17 diseases | 1 symptom texts |

---

## 3. Class Distribution & Imbalance

- **Minimum Samples per Class:** 402
- **Maximum Samples per Class:** 1219
- **Median Samples per Class:** 681.0
- **Mean Samples per Class:** 758.72 (Std: 251.56)

### Top 5 Most Frequent Diseases
| Disease Name | Sample Count |
| :--- | :---: |
| cystitis | 1,219 |
| vulvodynia | 1,218 |
| nose disorder | 1,218 |
| complex regional pain syndrome | 1,217 |
| spondylosis | 1,216 |

### Bottom 5 Least Frequent Diseases
| Disease Name | Sample Count |
| :--- | :---: |
| fracture of the arm | 437 |
| oppositional disorder | 431 |
| hypovolemia | 424 |
| abdominal hernia | 407 |
| inguinal hernia | 402 |

---

## 4. Content Security & Privacy Scans

| Security / Privacy Check | Results Detected | Status |
| :--- | :---: | :---: |
| **HTML Tag Injections** | 0 | CLEAN |
| **Executable Script / Event Patterns** | 0 | CLEAN |
| **Malformed Control / Unprintable Unicode** | 0 | CLEAN |
| **Email Addresses** | 0 | ZERO DETECTED |
| **Phone Numbers** | 0 | ZERO DETECTED |
| **Social Security Number Formats** | 0 | ZERO DETECTED |
| **Medical Record ID / Patient ID Tags** | 0 | ZERO DETECTED |

---

## 5. Architectural Recommendations

1. **Reject Single-Label Diagnostic Framing**: Because 10,179 symptom descriptions legitimately map to multiple diseases (up to 17 diseases each), single-label cross-entropy models will hallucinate false certainty and misclassify valid differential candidates.
2. **Multi-Label Pattern Grouping**: Group identical symptom descriptions into a set of disease labels, producing a canonical multi-label dataset.
3. **Leakage-Free Splitting**: All occurrences of a given symptom text must be clustered into the same partition (train, validation, or test). Never perform row-wise random splitting.
4. **Isolated Shadow Execution**: Research predictions must remain backend-only, stored in a zero-access RLS table, disabled by default via `SYMPTOM_PATTERN_SHADOW_ENABLED=false`.
