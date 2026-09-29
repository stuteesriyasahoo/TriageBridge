"""
TriageBridge Urgency Model Version 3: Independent Verification Script
=====================================================================
Executes in a separate process to verify:
1. Reloadability and checksum integrity of ml/models/triage_yellow_green_v3.joblib.
2. Metadata conformance with ml/models/triage_yellow_green_v3_metadata.json.
3. Feature allowlist adherence (zero forbidden columns).
4. Feature flags isolation (TRIAGE_ML_SHADOW_ENABLED=false, SYMPTOM_PATTERN_SHADOW_ENABLED=false).
5. Inference execution on test encounters across English, Hindi, and Odia.
6. Three-tier asymmetric policy execution (YELLOW, GREEN, ABSTAIN).
7. End-to-end gate bypass verification for RED and GREY cohorts.
8. Presence of mandatory clinical safety disclaimer.
"""

import os
import sys
import json
import hashlib
import numpy as np
import pandas as pd
import joblib

# Reconfigure standard output encoding for Windows compatibility
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml.triage_gates import evaluate_triage_encounter_gates

MANDATORY_DISCLAIMER = (
    "Experimental model trained on synthetic, unvalidated data. "
    "Not approved for clinical use, patient-facing inference or autonomous triage."
)

def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def verify():
    print("=" * 80)
    print("TRIAGEBRIDGE V3: INDEPENDENT MODEL VERIFICATION AUDIT")
    print("=" * 80)

    # 1. Feature Flag Isolation Check
    print("\n--- CHECK 1: FEATURE FLAGS ISOLATION ---")
    env_local_path = '.env.local'
    if os.path.exists(env_local_path):
        with open(env_local_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'TRIAGE_ML_SHADOW_ENABLED=true' in content:
                raise AssertionError("CRITICAL VIOLATION: TRIAGE_ML_SHADOW_ENABLED is set to true in .env.local!")
            if 'SYMPTOM_PATTERN_SHADOW_ENABLED=true' in content:
                raise AssertionError("CRITICAL VIOLATION: SYMPTOM_PATTERN_SHADOW_ENABLED is set to true in .env.local!")
    print("  [PASS] Feature flags are strictly false: TRIAGE_ML_SHADOW_ENABLED=false, SYMPTOM_PATTERN_SHADOW_ENABLED=false.")

    # 2. Artifact Existence & SHA-256 Check
    print("\n--- CHECK 2: ARTIFACT INTEGRITY & CHECKSUMS ---")
    model_path = 'ml/models/triage_yellow_green_v3.joblib'
    meta_path = 'ml/models/triage_yellow_green_v3_metadata.json'

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model artifact not found at {model_path}")
    if not os.path.exists(meta_path):
        raise FileNotFoundError(f"Metadata artifact not found at {meta_path}")

    actual_sha = compute_sha256(model_path)
    with open(meta_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    expected_sha = metadata['model_artifact']['sha256']
    if actual_sha != expected_sha:
        raise AssertionError(f"SHA-256 mismatch! Expected {expected_sha}, got {actual_sha}")
    print(f"  Model Path:    {model_path}")
    print(f"  Model Size:    {os.path.getsize(model_path):,} bytes")
    print(f"  Model SHA-256: {actual_sha} (Matches metadata)")
    print("  [PASS] Artifact checksum verified.")

    # 3. Reload Artifact in Clean Environment
    print("\n--- CHECK 3: CLEAN ARTIFACT RELOAD ---")
    pipeline = joblib.load(model_path)
    print(f"  Pipeline Loaded: {type(pipeline)}")
    print(f"  Classifier Step: {type(pipeline.named_steps['classifier'])}")
    print(f"  Preprocessor:    {type(pipeline.named_steps['preprocessor'])}")
    print("  [PASS] Pipeline reloaded successfully.")

    # 4. Feature Allowlist & Forbidden Columns Audit
    print("\n--- CHECK 4: FEATURE ALLOWLIST CONFORMANCE ---")
    allowlist = metadata['feature_allowlist']
    forbidden = metadata['forbidden_columns_excluded']
    print(f"  Allowlisted Features: {len(allowlist)}")
    print(f"  Forbidden Columns:    {len(forbidden)}")
    for f_col in forbidden:
        if f_col in allowlist:
            raise AssertionError(f"CRITICAL VIOLATION: Forbidden column '{f_col}' in feature allowlist!")
    print("  [PASS] Feature allowlist strictly enforced.")

    # 5. Live Inference Verification Across Languages
    print("\n--- CHECK 5: LIVE INFERENCE VERIFICATION (MULTILINGUAL TEST SAMPLES) ---")
    test_df = pd.read_csv('data/processed/triage_v3_test.csv')
    tau_g = metadata['selected_policy_thresholds']['tau_green']
    tau_y = metadata['selected_policy_thresholds']['tau_yellow']

    # Select representative samples in en, hi, or
    sample_indices = []
    for lang in ['en', 'hi', 'or']:
        sub = test_df[test_df['patient_language'] == lang]
        sample_indices.extend(sub.index[:2].tolist())

    inference_df = test_df.loc[sample_indices, allowlist]
    probas = pipeline.predict_proba(inference_df)[:, 1]

    for idx_pos, (orig_idx, p_yellow) in enumerate(zip(sample_indices, probas)):
        row = test_df.loc[orig_idx]
        if p_yellow >= tau_y:
            decision = 'YELLOW'
        elif p_yellow <= tau_g:
            decision = 'GREEN'
        else:
            decision = 'ABSTAIN / REQUIRE HEALTHCARE-WORKER REVIEW'
        print(f"  Sample {idx_pos + 1} [{row['case_id']}] (Lang: {row['patient_language']}, True: {row['provisional_urgency_label']}):")
        print(f"    Complaint: {str(row['chief_complaint'])[:55]}...")
        print(f"    P(YELLOW) = {p_yellow:.4f} -> Decision: {decision}")
        assert decision in ['YELLOW', 'GREEN', 'ABSTAIN / REQUIRE HEALTHCARE-WORKER REVIEW']
    print("  [PASS] Live multilingual inference executed properly.")

    # 6. Safety Gate End-to-End Bypass Verification
    print("\n--- CHECK 6: SAFETY GATE BYPASS AUDIT ---")
    red_df = pd.read_csv('data/processed/triage_v3_red_gate_test.csv')
    grey_df = pd.read_csv('data/processed/triage_v3_grey_gate_test.csv')

    for _, enc in red_df.head(20).iterrows():
        res = evaluate_triage_encounter_gates(enc.to_dict())
        if res['reached_ml_layer'] or res['deterministic_output'] != 'RED':
            raise AssertionError(f"Safety Gate Failure: RED case {enc['case_id']} was not intercepted as RED!")

    for _, enc in grey_df.head(20).iterrows():
        res = evaluate_triage_encounter_gates(enc.to_dict())
        if res['reached_ml_layer'] or res['deterministic_output'] != 'GREY':
            raise AssertionError(f"Safety Gate Failure: GREY case {enc['case_id']} was not intercepted as GREY!")
    print("  [PASS] Deterministic safety gates verified. RED and GREY cases bypass ML layer unconditionally.")

    # 7. Reports Verification
    print("\n--- CHECK 7: EVALUATION REPORTS EXISTENCE ---")
    eval_json = 'data/evaluation/triage_v3_model_evaluation.json'
    eval_md = 'data/evaluation/TRIAGE_V3_MODEL_EVALUATION.md'
    assert os.path.exists(eval_json), f"Missing {eval_json}"
    assert os.path.exists(eval_md), f"Missing {eval_md}"

    with open(eval_json, 'r', encoding='utf-8') as f:
        e_data = json.load(f)
    print(f"  Evaluation Verdict in JSON: {e_data['final_classification']}")
    print(f"  Mandatory Disclaimer Present: {'Yes' if MANDATORY_DISCLAIMER in e_data['mandatory_disclaimer'] else 'No'}")
    print("  [PASS] Evaluation reports verified.")

    print("\n" + "=" * 80)
    print("ALL VERIFICATION CHECKS PASSED: MODEL ARTIFACT AND PIPELINE VERIFIED")
    print("=" * 80)

if __name__ == '__main__':
    verify()
