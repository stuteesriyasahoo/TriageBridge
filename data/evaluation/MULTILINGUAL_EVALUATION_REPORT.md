# Multilingual Model Inference & Safety Audit Report (Hindi & Odia)

> **CLASSIFICATION STATUS: MULTILINGUAL INFERENCE NOT IMPLEMENTED**
>
> *Direct multilingual inference on Hindi (Devanagari) and Odia text without a verified neural clinical translation model produces spurious character/subsequence matches and is **STRICTLY PROHIBITED** in production.*
> *The model safely **ABSTAINS** on all untranslated Indic inputs.*

---

## 1. Technical Architecture & Translation Provenance

| Component | Current Implementation | Clinical Limitation | Safety Invariant |
| :--- | :--- | :--- | :--- |
| **Translation Engine** | Heuristic static lookup table ([`src/lib/clinical-translator.ts`](file:///c:/Users/bibhu/Downloads/bput/src/lib/clinical-translator.ts)) | Cannot parse free-form clinical syntax, dialectal phonetics, or complex compounding | **Model inference must abstain on untranslated Indic text** |
| **Neural NMT Model** | **NONE DEPLOYED** | No transformer-based Indic-to-English translation pipeline | **Status: NOT IMPLEMENTED** |
| **Preservation Rule** | Original native script is preserved verbatim in record metadata | Ensures no patient statements are corrupted or destroyed | **Original statement invariant enforced** |

---

## 2. Evaluation Summary: 50 Hindi & 50 Odia Clinical Scenarios

A benchmark of **100 realistic regional clinical presentations** (50 Hindi, 50 Odia) covering Emergency red flags, vague complaints, negation, phonetic misspellings, and multi-symptom syndromes was evaluated:

| Language | Total Tested | Emergency | Vague | Negation | Misspelling / ASR | Multi-Symptom | Abstention Rate | Inference Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Hindi (हिंदी)** | **50** | 10 | 10 | 10 | 10 | 10 | **100.0%** | **SAFELY ABSTAINED** |
| **Odia (ଓଡ଼ିଆ)** | **50** | 10 | 10 | 10 | 10 | 10 | **100.0%** | **SAFELY ABSTAINED** |

---

## 3. Representative Case Audits

### Hindi Audit Examples
| ID | Category | Original Devanagari Statement | Clinical Meaning | Pipeline Outcome |
| :--- | :--- | :--- | :--- | :---: |
| `HI-EMERG-01` | Emergency | *सीने में बहुत तेज दर्द हो रहा है और सांस लेने में भारी तकलीफ है* | Severe chest pain and dyspnea | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `HI-VAGUE-01` | Vague | *बुखार* | Isolated fever | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `HI-NEG-01` | Negation | *सीने में दर्द नहीं है, बुखार भी नहीं है* | Denies chest pain, denies fever | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `HI-ASR-01` | Misspelling | *सेने मे दरद हौर सांस फुल रहा हे* | Phonetic ASR speech error | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |

### Odia Audit Examples
| ID | Category | Original Odia Statement | Clinical Meaning | Pipeline Outcome |
| :--- | :--- | :--- | :--- | :---: |
| `OR-EMERG-01` | Emergency | *ଛାତିରେ ବହୁତ ଯନ୍ତ୍ରଣା ହେଉଛି ଏବଂ ନିଶ୍ୱାସ ନେବାରେ ଘୋର କଷ୍ଟ ହେଉଛି* | Severe chest pain and dyspnea | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `OR-VAGUE-01` | Vague | *ଜ୍ୱର* | Isolated fever | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `OR-NEG-01` | Negation | *ଛାତିରେ କିଛି ଯନ୍ତ୍ରଣା ନାହିଁ, ଜ୍ୱର ମଧ୍ୟ ନାହିଁ* | Denies chest pain, denies fever | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |
| `OR-ASR-01` | Misspelling | *ଛାତିରେ ଦରଦ ଓ ନିସ୍ୱାସ କସ୍ଟ ହଉଚି* | Phonetic ASR speech error | **Abstained** (`MULTILINGUAL_NOT_IMPLEMENTED`) |

---

## 4. Conclusion & Required Next Steps

1. **Mark Status**: Multilingual symptom-pattern model inference is officially **NOT IMPLEMENTED**.
2. **Deterministic Triage Safety**: In TriageBridge, triage urgency for non-English speakers is handled by deterministic red-flag keyword dictionaries with clinician review, completely isolated from experimental ML models.
3. **Prerequisite for Activation**: Before any multilingual ML inference could ever be considered, a dedicated, clinically validated neural translation model (e.g. fine-tuned IndicTrans2 or Med-PaLM) with certified BLEU/chrF metrics on clinical text would be strictly required.
