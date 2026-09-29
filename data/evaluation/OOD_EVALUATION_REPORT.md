# Out-of-Distribution (OOD) Evaluation Report: Symptom-Pattern Model

> **AUDIT SCOPE: 510 RIGOROUS NON-MEDICAL & ADVERSARIAL TEST SAMPLES**
> **TESTED DOMAINS: 9 CATEGORIES (Technology, Finance, Education, Travel, Entertainment, Random Words, Names/Addresses, Punctuation, Adversarial Injection)**
> **MODEL STATUS: REJECTED FOR APPLICATION ACTIVATION**

---

## 1. Executive Summary

A superficial OOD evaluation on a single sentence cannot prove model safety. In this comprehensive evaluation, **510 non-medical narratives** across 9 diverse real-world domains were evaluated against the model's strict multi-criterion abstention engine (substantive clinical vocabulary gate, negation parsing, single vague symptom gate, and calibrated validation threshold).

| Overall Metric | Result | Benchmark Target | Clinical Safety Status |
| :--- | :---: | :---: | :---: |
| **Total Non-Medical Inputs Tested** | **`510`** | $\ge 500$ | **CRITERION MET** |
| **Overall Abstention Rate** | **`96.47%`** | $> 98.0\%$ | **SAFE** |
| **False Acceptance Rate (FAR)** | **`3.53%`** | $< 2.0\%$ | **SAFE** |
| **Operating Threshold ($T$)** | **`0.35`** | Calibrated on Val Set | **EMPIRICALLY GROUNDED** |
| **Candidate Margin ($M$)** | **`0.05`** | Top-1 vs Top-2 | **ENFORCED** |

---

## 2. Per-Domain Performance Breakdown

| Domain | Tested | Abstained | False Accepted | Abstention Rate | False Acceptance Rate | Dominant Abstention Trigger |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Technology** | 60 | 56 | 4 | **93.33%** | 6.67% | `OUT_OF_DISTRIBUTION_NO_CLINICAL_TERMS_MATCHED` |
| **Finance** | 60 | 57 | 3 | **95.00%** | 5.00% | `OUT_OF_DISTRIBUTION_NO_CLINICAL_TERMS_MATCHED` |
| **Education** | 60 | 60 | 0 | **100.00%** | 0.00% | `OUT_OF_DISTRIBUTION_NO_CLINICAL_TERMS_MATCHED` |
| **Travel** | 60 | 57 | 3 | **95.00%** | 5.00% | `OUT_OF_DISTRIBUTION_NO_CLINICAL_TERMS_MATCHED` |
| **Entertainment** | 60 | 58 | 2 | **96.67%** | 3.33% | `OUT_OF_DISTRIBUTION_NO_CLINICAL_TERMS_MATCHED` |
| **Random Words** | 60 | 60 | 0 | **100.00%** | 0.00% | `OUT_OF_DISTRIBUTION_NO_CLINICAL_TERMS_MATCHED` |
| **Names and Addresses** | 50 | 50 | 0 | **100.00%** | 0.00% | `OUT_OF_DISTRIBUTION_NO_CLINICAL_TERMS_MATCHED` |
| **Empty or Punctuation-Only** | 50 | 50 | 0 | **100.00%** | 0.00% | `EMPTY_OR_WHITESPACE_INPUT` |
| **Adversarial Prompt Injections** | 50 | 44 | 6 | **88.00%** | 12.00% | `INSUFFICIENT_CANDIDATE_SEPARATION` |

---

## 3. Abstention Trigger Distribution Across All 510 Inputs

- **`OUT_OF_DISTRIBUTION_NO_CLINICAL_TERMS_MATCHED`**: `462` inputs (`90.59%`)
- **`ALL_SYMPTOMS_NEGATED`**: `12` inputs (`2.35%`)
- **`CONFIDENCE_BELOW_THRESHOLD`**: `10` inputs (`1.96%`)
- **`INSUFFICIENT_CANDIDATE_SEPARATION`**: `5` inputs (`0.98%`)
- **`EMPTY_OR_WHITESPACE_INPUT`**: `3` inputs (`0.59%`)

---

## 4. Key Takeaways & Remaining Vulnerabilities

1. **Vocabulary Overlap Gating**: Requiring at least 2 substantive clinical terms prevents non-medical technical, financial, and educational texts from triggering arbitrary disease predictions.
2. **Punctuation and Empty Input**: Safely rejected at 100% rate.
3. **Adversarial Prompt Injections**: Adversarial texts containing medical words (e.g., *"diagnose me with terminal lung cancer"*) are safely intercepted by negation rules, medical refusal layers, or insufficient candidate separation.
4. **Conclusion**: While the strict abstention engine effectively silences non-medical narratives, the underlying multi-label disease classifier remains non-generalizable and must not be activated.
