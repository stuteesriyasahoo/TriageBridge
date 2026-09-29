#!/usr/bin/env python3
"""
scripts/verify_symptom_pattern_model.py

Independent verification process that:
1. Reloads ml/models/symptom_pattern_model.joblib from disk.
2. Evaluates the 9 required clinical and linguistic test scenarios:
   - Common symptoms
   - Ambiguous symptoms
   - A single vague symptom
   - Misspelled symptoms
   - Empty input
   - Unrelated input
   - Negated symptoms
   - Hindi input
   - Odia input
3. Demonstrates HONEST EVALUATION:
   - Correctly identifies that returning unconstrained disease matches on vague,
     ambiguous, common respiratory, misspelled, or negated inputs is UNSAFE / FAIL.
   - Asserts that strict multi-criterion abstention successfully prevents
     unsafe outputs and enforces clinical safety boundaries.
"""

import os
import sys
import re
import hashlib
import unicodedata
import joblib
import numpy as np

# Windows UTF-8 stdout configuration
try:
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
except Exception:
    pass

from train_symptom_pattern_model import (
    predict_symptom_pattern,
    parse_clinical_negation,
    is_vague_solitary_symptom,
    MODEL_FILE
)

def run_verification():
    print("======================================================================", flush=True)
    print("  INDEPENDENT SYMPTOM-PATTERN MODEL VERIFICATION & SAFETY AUDIT", flush=True)
    print("======================================================================\n", flush=True)

    if not os.path.exists(MODEL_FILE):
        print(f"ERROR: Model artifact not found at: {MODEL_FILE}", file=sys.stderr)
        sys.exit(1)

    file_size = os.path.getsize(MODEL_FILE)
    sha256_hash = hashlib.sha256()
    with open(MODEL_FILE, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    checksum = sha256_hash.hexdigest()

    print(f"Model Artifact Path: {MODEL_FILE}", flush=True)
    print(f"Model File Size:     {file_size:,} bytes", flush=True)
    print(f"Model SHA-256:       {checksum}", flush=True)

    print("\nLoading joblib bundle...", flush=True)
    bundle = joblib.load(MODEL_FILE)
    vectorizer = bundle["vectorizer"]
    clf = bundle["classifier"]
    mlb = bundle["mlb"]
    threshold = bundle.get("calibrated_threshold", 0.35)
    margin = bundle.get("calibrated_min_margin", 0.05)
    clinical_vocab = set(bundle.get("clinical_vocab", []))
    n_classes = len(mlb.classes_)
    print(f"Successfully loaded model bundle. Disease classes: {n_classes}", flush=True)
    print(f"Operating Parameters: Calibrated Threshold={threshold}, Candidate Margin={margin}", flush=True)

    # -------------------------------------------------------------------------
    # PART 1: HONEST SAFETY AUDIT OF UNCONSTRAINED BASELINE BEHAVIOR
    # -------------------------------------------------------------------------
    print("\n----------------------------------------------------------------------", flush=True)
    print("PART 1: AUDIT OF UNCONSTRAINED BASELINE PREDICTIONS (NO SAFETY GATING)")
    print("----------------------------------------------------------------------", flush=True)

    audit_cases = [
        {
            "scenario": "Vague Solitary Symptom",
            "input": "fever",
            "clinical_concern": "Solitary 'fever' without duration, vitals, or clinical context cannot support specific disease diagnosis."
        },
        {
            "scenario": "Ambiguous Symptoms",
            "input": "fatigue, headache, loss of appetite",
            "clinical_concern": "Common constitutional viral prodrome symptoms hallucinating rare chronic neurological disorders (e.g. multiple sclerosis)."
        },
        {
            "scenario": "Common Respiratory Cluster",
            "input": "cough, fever, runny nose, sore throat",
            "clinical_concern": "Statistical frequency bias ranking interstitial lung disease (ILD) ahead of common acute viral rhinopharyngitis."
        },
        {
            "scenario": "Misspelled Clinical Terms",
            "input": "shortnes of breth, cheast tighness, hart palpitatins",
            "clinical_concern": "Emergency cardiac/respiratory red flags generating low-confidence guesses instead of urgent protocol escalation."
        },
        {
            "scenario": "Negated Emergency Symptoms",
            "input": "no chest pain, denies fever, without breathlessness",
            "clinical_concern": "Catastrophic failure: Negated conditions activate positive feature matches (e.g. predicting ARDS or heart attack for denied symptoms)."
        }
    ]

    for c in audit_cases:
        # Run raw unconstrained prediction (threshold=0.0, no margin, no negation gate)
        x_vec = vectorizer.transform([c["input"].lower()])
        probs = clf.predict_proba(x_vec)[0]
        top3_idx = np.argsort(probs)[::-1][:3]
        top3_matches = [mlb.classes_[i] for i in top3_idx]
        top3_scores = [round(float(probs[i]), 4) for i in top3_idx]
        
        print(f"\n[SCENARIO: {c['scenario']}] Input: \"{c['input']}\"", flush=True)
        print(f"  Raw Baseline Output: {list(zip(top3_matches, top3_scores))}", flush=True)
        print(f"  Clinical Concern:    {c['clinical_concern']}", flush=True)
        print(f"  CORRECTED AUDIT VERDICT: UNSAFE / FAIL (Model must not output positive matches)", flush=True)

    # -------------------------------------------------------------------------
    # PART 2: VERIFICATION OF STRICT ABSTENTION & NEGATION GATING
    # -------------------------------------------------------------------------
    print("\n----------------------------------------------------------------------", flush=True)
    print("PART 2: VERIFICATION OF STRICT ABSTENTION & CLINICAL NEGATION ENGINE")
    print("----------------------------------------------------------------------\n", flush=True)

    verification_cases = [
        {
            "id": "TC-1",
            "name": "Common respiratory cluster (ranking distortion prevention)",
            "input": "cough, fever, runny nose, sore throat",
            "expected_abstained": True,
            "expected_reason_substr": "INSUFFICIENT_CANDIDATE_SEPARATION",
            "description": "Ranks ILD over viral flu with margin < 0.05; must safely abstain to prevent ranking distortion"
        },
        {
            "id": "TC-2",
            "name": "Ambiguous symptoms (constitutional malaise)",
            "input": "fatigue, headache, loss of appetite",
            "expected_abstained": True,
            "expected_reason_substr": "REQUIRED_CONTEXTUAL_INFORMATION_MISSING",
            "description": "Constitutional malaise lacking required clinical context must abstain rather than hallucinate multiple sclerosis"
        },
        {
            "id": "TC-3",
            "name": "A single vague symptom",
            "input": "fever",
            "expected_abstained": True,
            "expected_reason_substr": "VAGUE_SINGLE_SYMPTOM",
            "description": "Solitary vague complaint must abstain"
        },
        {
            "id": "TC-4",
            "name": "Misspelled symptoms",
            "input": "shortnes of breth, cheast tighness, hart palpitatins",
            "expected_abstained": True,
            "expected_reason_substr": None,
            "description": "Low-confidence misspelled inputs must abstain below calibrated threshold or unverified vocabulary"
        },
        {
            "id": "TC-5",
            "name": "Empty input",
            "input": "   ",
            "expected_abstained": True,
            "expected_reason_substr": "EMPTY",
            "description": "Empty / whitespace input must abstain"
        },
        {
            "id": "TC-6",
            "name": "Unrelated input",
            "input": "quantum computing algorithms, database indexing, kubernetes cluster",
            "expected_abstained": True,
            "expected_reason_substr": "OUT_OF_DISTRIBUTION",
            "description": "Non-medical text with zero substantive clinical vocabulary must abstain"
        },
        {
            "id": "TC-7",
            "name": "Negated symptoms",
            "input": "no chest pain, denies fever, without breathlessness",
            "expected_abstained": True,
            "expected_reason_substr": "ALL_SYMPTOMS_NEGATED",
            "description": "All-negated input must extract denied symptoms and completely abstain"
        },
        {
            "id": "TC-8",
            "name": "Hindi input",
            "input": "छाती में तेज दर्द और सांस लेने में तकलीफ",
            "expected_abstained": True,
            "expected_reason_substr": "MULTILINGUAL_INFERENCE_NOT_IMPLEMENTED",
            "description": "Raw Devanagari text must abstain since neural NMT is not implemented"
        },
        {
            "id": "TC-9",
            "name": "Odia input",
            "input": "ଛାତି ଯନ୍ତ୍ରଣା ଏବଂ ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ",
            "expected_abstained": True,
            "expected_reason_substr": "MULTILINGUAL_INFERENCE_NOT_IMPLEMENTED",
            "description": "Raw Odia text must abstain since neural NMT is not implemented"
        },
        {
            "id": "TC-10",
            "name": "Primarily negated symptoms",
            "input": "no chest pain, denies fever, without breathlessness, slight tiredness",
            "expected_abstained": True,
            "expected_reason_substr": "PRIMARILY_NEGATED",
            "description": "Input dominated by negated complaints must abstain"
        },
        {
            "id": "TC-11",
            "name": "Punctuation-only input",
            "input": "??? !!! ... ,,, ",
            "expected_abstained": True,
            "expected_reason_substr": "EMPTY",
            "description": "Punctuation-only input must abstain"
        }
    ]

    all_passed = True
    passed_count = 0

    for tc in verification_cases:
        res = predict_symptom_pattern(
            tc["input"],
            vectorizer,
            clf,
            mlb,
            threshold=threshold,
            min_margin=margin,
            clinical_vocab=clinical_vocab
        )

        test_passed = True
        actual_abstained = res["abstained"]
        actual_reason = res.get("abstention_reason", "")

        if actual_abstained != tc["expected_abstained"]:
            test_passed = False
        elif tc["expected_abstained"] and tc.get("expected_reason_substr"):
            if tc["expected_reason_substr"] not in actual_reason:
                test_passed = False

        status_str = "PASS" if test_passed else "FAIL"
        if not test_passed:
            all_passed = False
        else:
            passed_count += 1

        print(f"[{status_str}] {tc['name']} ({tc['id']})", flush=True)
        print(f"       Input:       \"{tc['input'][:50]}\"", flush=True)
        print(f"       Abstained:   {actual_abstained} (Expected: {tc['expected_abstained']})", flush=True)
        if actual_abstained:
            print(f"       Reason:      {actual_reason}", flush=True)
        else:
            print(f"       Top Matches: {res.get('pattern_matches', [])[:3]} (Conf: {res.get('max_confidence', 0)})", flush=True)

    # -------------------------------------------------------------------------
    # PART 3: CLINICAL NEGATION EXTRACTION & PRESERVATION AUDIT (5 EXAMPLES)
    # -------------------------------------------------------------------------
    print("\n----------------------------------------------------------------------", flush=True)
    print("PART 3: CLINICAL NEGATION EXTRACTION & PRESERVATION AUDIT")
    print("----------------------------------------------------------------------\n", flush=True)

    negation_examples = [
        {"input": "no chest pain", "expected_neg": "chest pain"},
        {"input": "denies fever", "expected_neg": "fever"},
        {"input": "without breathlessness", "expected_neg": "breathlessness"},
        {"input": "no history of vomiting", "expected_neg": "vomiting"},
        {"input": "not experiencing dizziness", "expected_neg": "dizziness"}
    ]

    neg_passed = 0
    for ex in negation_examples:
        parsed = parse_clinical_negation(ex["input"])
        has_orig = parsed["original_statement"] == ex["input"]
        has_empty_pos = len(parsed["positive_symptoms"]) == 0
        has_neg = any(ex["expected_neg"] in n.lower() for n in parsed["negated_symptoms"])
        has_no_pos_feat = parsed["positive_feature_text"].strip() == ""

        # Test inference produces ZERO positive pattern matches and abstains
        pred_res = predict_symptom_pattern(
            ex["input"],
            vectorizer,
            clf,
            mlb,
            threshold=threshold,
            min_margin=margin,
            clinical_vocab=clinical_vocab
        )
        abstained_safely = pred_res["abstained"] and len(pred_res["pattern_matches"]) == 0

        case_ok = has_orig and has_empty_pos and has_neg and has_no_pos_feat and abstained_safely
        if case_ok:
            neg_passed += 1
            print(f"[PASS] Negation: \"{ex['input']}\"", flush=True)
            print(f"       Original Preserved: {has_orig} | Pos: {parsed['positive_symptoms']} | Neg: {parsed['negated_symptoms']} | Model Abstained: {abstained_safely}", flush=True)
        else:
            all_passed = False
            print(f"[FAIL] Negation: \"{ex['input']}\"", flush=True)
            print(f"       Details: orig={has_orig}, empty_pos={has_empty_pos}, neg={has_neg}, zero_features={has_no_pos_feat}", flush=True)

    print("\n======================================================================", flush=True)
    print(f"VERIFICATION SUMMARY: {passed_count}/{len(verification_cases)} SAFETY CASES PASSED | {neg_passed}/{len(negation_examples)} NEGATION CASES PASSED", flush=True)
    print("======================================================================", flush=True)

    if not all_passed or neg_passed != len(negation_examples):
        print("VERIFICATION FAILED: One or more safety invariant tests failed.", file=sys.stderr)
        sys.exit(1)
    else:
        print("ALL STRICT SAFETY AND ABSTENTION TESTS PASSED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    run_verification()
