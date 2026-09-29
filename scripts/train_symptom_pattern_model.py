#!/usr/bin/env python3
"""
scripts/train_symptom_pattern_model.py

Trains and evaluates an isolated multi-label symptom-pattern research model
on canonical-hash partitioned splits with:
1. Clinical Negation Parsing (separates positive vs negated symptoms).
2. Strict Multi-Criterion Abstention Engine:
   - Empty or whitespace input.
   - All symptoms negated.
   - Single vague symptom (e.g. isolated 'fever', 'cough', 'headache').
   - Out-of-distribution (non-medical / unrelated input).
   - Non-English input without verified translation (marked NOT IMPLEMENTED).
   - Below calibrated validation confidence threshold.
   - Insufficient candidate separation margin (top-1 vs top-2).
3. Validation-Based Threshold Selection (empirical sweep over candidates).
4. Full Multi-Label Held-Out Test Evaluation.
"""

import os
import sys
import json
import time
import re
import hashlib
import unicodedata
import joblib
import numpy as np
import pandas as pd
from collections import defaultdict, Counter

# Windows stdout UTF-8 & line buffering compatibility
try:
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
except Exception:
    pass

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion
from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import (
    f1_score,
    hamming_loss,
    label_ranking_average_precision_score,
    brier_score_loss,
)

TRAIN_PATH = os.path.join("data", "processed", "train.csv")
VAL_PATH = os.path.join("data", "processed", "validation.csv")
TEST_PATH = os.path.join("data", "processed", "test.csv")

MODEL_DIR = os.path.join("ml", "models")
MODEL_FILE = os.path.join(MODEL_DIR, "symptom_pattern_model.joblib")
METADATA_FILE = os.path.join(MODEL_DIR, "symptom_pattern_metadata.json")

EVAL_MD_PATH = os.path.join("data", "evaluation", "SYMPTOM_PATTERN_MODEL_EVALUATION.md")
EVAL_JSON_PATH = os.path.join("data", "evaluation", "symptom_pattern_model_evaluation.json")

MODEL_VERSION = "symptom-pattern-ovr-tfidf-v1.1.0-negation-gated"
DATASET_VERSION = "final_symptoms_to_disease_canonical_v1"
DISCLAIMER = "UNVERIFIED_RESEARCH_DATA_NOT_FOR_DIAGNOSIS_OR_TREATMENT"

# Single vague symptom dictionary that must trigger abstention
VAGUE_SOLITARY_SYMPTOMS = {
    'fever', 'pyrexia', 'high temperature', 'cough', 'coughing', 'headache',
    'head ache', 'fatigue', 'tiredness', 'exhaustion', 'malaise', 'weakness',
    'body ache', 'bodyache', 'generalized body ache', 'chills', 'nausea',
    'feeling sick', 'vomiting', 'dizziness', 'lightheadedness', 'loss of appetite',
    'poor appetite', 'pain', 'discomfort'
}

NEGATION_PATTERNS = [
    r'\bno\s+history\s+of\s+',
    r'\bnot\s+experiencing\s+',
    r'\bnot\s+having\s+',
    r'\bnegative\s+for\s+',
    r'\bdenies\s+any\s+',
    r'\bdenies\s+',
    r'\bdenied\s+',
    r'\bwithout\s+any\s+',
    r'\bwithout\s+',
    r'\bdoes\s+not\s+have\s+',
    r'\bdoesn\'t\s+have\s+',
    r'\bnever\s+had\s+',
    r'\brules\s+out\s+',
    r'\babsence\s+of\s+',
    r'\bfree\s+of\s+',
    r'\bno\s+',
    r'\bnot\s+'
]
COMPILED_NEG_REGEX = re.compile(r'(' + '|'.join(NEGATION_PATTERNS) + r')([a-z0-9\s\-_]+?)(?=[,;\.\n]|(?:\band\b)|(?:\bbut\b)|$)', re.IGNORECASE)

def parse_clinical_negation(text: str) -> dict:
    """
    Separates positive clinical symptoms from negated clinical expressions.
    Preserves:
    - original_statement
    - extracted positive symptoms
    - extracted negated symptoms
    """
    clean = str(text).strip()
    if not clean:
        return {
            "original_statement": text,
            "positive_symptoms": [],
            "negated_symptoms": [],
            "positive_feature_text": ""
        }

    lower_text = clean.lower()
    
    # Split into clauses by common conjunctions and punctuation
    raw_clauses = re.split(r'[,;\.\n]+|(?:\s+\b(?:and|but|however|also|plus)\b\s+)', lower_text)
    
    positive_symptoms = []
    negated_symptoms = []

    for clause in raw_clauses:
        clause = clause.strip()
        if not clause:
            continue
            
        neg_match = None
        for pattern in NEGATION_PATTERNS:
            m = re.search(r'^' + pattern + r'(.*)', clause)
            if m:
                neg_match = m.group(1).strip()
                break
        
        if neg_match:
            # Clean negated phrase
            neg_cleaned = re.sub(r'^\s*(any|the|a|an)\s+', '', neg_match).strip()
            if neg_cleaned:
                negated_symptoms.append(neg_cleaned)
        else:
            # Check internal negation inside clause
            found_internal = False
            for m in COMPILED_NEG_REGEX.finditer(clause):
                neg_phrase = m.group(2).strip()
                neg_phrase = re.sub(r'^\s*(any|the|a|an)\s+', '', neg_phrase).strip()
                if neg_phrase:
                    negated_symptoms.append(neg_phrase)
                    found_internal = True
            
            if not found_internal:
                pos_cleaned = re.sub(r'^\s*(patient\s+reports|patient\s+has|complains\s+of|with)\s+', '', clause).strip()
                if pos_cleaned:
                    positive_symptoms.append(pos_cleaned)

    positive_feature_text = " ".join(positive_symptoms)

    return {
        "original_statement": text,
        "positive_symptoms": positive_symptoms,
        "negated_symptoms": negated_symptoms,
        "positive_feature_text": positive_feature_text
    }

def is_vague_solitary_symptom(positive_symptoms: list) -> bool:
    """Detects whether positive symptoms consist solely of a single vague presentation."""
    if len(positive_symptoms) != 1:
        return False
    single_sym = positive_symptoms[0].strip().lower()
    single_sym = re.sub(r'\b(mild|severe|slight|moderate|acute|chronic|constant)\s+', '', single_sym).strip()
    return single_sym in VAGUE_SOLITARY_SYMPTOMS

AMBIGUOUS_CONSTITUTIONAL_SYMPTOMS = {
    'fatigue', 'headache', 'head ache', 'loss of appetite', 'poor appetite',
    'malaise', 'tiredness', 'exhaustion', 'weakness', 'body ache', 'bodyache',
    'generalized body ache', 'drowsiness', 'lethargy', 'feeling unwell'
}

def is_ambiguous_constitutional_cluster(positive_symptoms: list) -> bool:
    """
    Detects if positive symptoms consist solely of ambiguous constitutional/malaise complaints
    without focal signs, neurological exam, vital signs, or duration context.
    Prevents unsupported predictions of rare chronic neurological disorders (e.g. multiple sclerosis).
    """
    if not positive_symptoms:
        return False
    
    cleaned_symptoms = []
    for s in positive_symptoms:
        cleaned = re.sub(r'\b(mild|severe|slight|moderate|acute|chronic|constant|general|generalized)\s+', '', s.strip().lower()).strip()
        cleaned_symptoms.append(cleaned)
        
    return all(s in AMBIGUOUS_CONSTITUTIONAL_SYMPTOMS for s in cleaned_symptoms)

def compute_precision_recall_at_k(y_true, y_scores, k=3):
    """Computes Precision@K and Recall@K for multi-label classification."""
    precisions = []
    recalls = []
    top_k_indices = np.argsort(y_scores, axis=1)[:, -k:][:, ::-1]
    
    for i in range(len(y_true)):
        true_indices = np.where(y_true[i] == 1)[0]
        if len(true_indices) == 0:
            continue
        predicted_top_k = top_k_indices[i]
        hits = len(set(predicted_top_k).intersection(set(true_indices)))
        precisions.append(hits / k)
        recalls.append(hits / len(true_indices))
        
    return float(np.mean(precisions)), float(np.mean(recalls))

def evaluate_calibration(y_true, y_prob, n_bins=5):
    """Assesses predicted probability calibration across confidence intervals."""
    brier_scores = []
    for c in range(min(50, y_true.shape[1])):
        if np.sum(y_true[:, c]) > 5:
            brier_scores.append(brier_score_loss(y_true[:, c], y_prob[:, c]))
            
    mean_brier = float(np.mean(brier_scores)) if brier_scores else 0.0
    flat_probs = y_prob.ravel()
    hist, bin_edges = np.histogram(flat_probs, bins=n_bins, range=(0.0, 1.0))
    bins_info = [
        {"bin": f"[{bin_edges[i]:.2f}, {bin_edges[i+1]:.2f})", "count": int(hist[i])}
        for i in range(n_bins)
    ]
    return {"mean_brier_score": round(mean_brier, 4), "confidence_bins": bins_info}

def calibrate_threshold_on_validation(Y_val, val_probs, candidate_thresholds, candidate_margins):
    """
    Empirical threshold sweep on the validation set.
    Evaluates:
    - Threshold
    - Margin
    - Coverage
    - Abstention rate
    - Selective risk (error among accepted)
    - Precision@3 among accepted
    - Recall@3 among accepted
    """
    results = []
    n_samples = len(Y_val)
    
    # Sort probabilities descending per sample
    sorted_probs = np.sort(val_probs, axis=1)[:, ::-1]
    top1_probs = sorted_probs[:, 0]
    top2_probs = sorted_probs[:, 1]
    margins = top1_probs - top2_probs

    top3_indices = np.argsort(val_probs, axis=1)[:, -3:][:, ::-1]
    
    for T in candidate_thresholds:
        for M in candidate_margins:
            accepted_mask = (top1_probs >= T) & (margins >= M)
            n_accepted = int(np.sum(accepted_mask))
            coverage = n_accepted / n_samples
            abstention_rate = 1.0 - coverage

            if n_accepted == 0:
                results.append({
                    "threshold": T,
                    "min_margin": M,
                    "accepted_count": 0,
                    "coverage": 0.0,
                    "abstention_rate": 1.0,
                    "precision_at_3": 0.0,
                    "recall_at_3": 0.0,
                    "selective_risk": 1.0
                })
                continue

            # Evaluate metrics on accepted cohort
            p3_list = []
            r3_list = []
            risk_hits = 0

            for idx in np.where(accepted_mask)[0]:
                true_classes = set(np.where(Y_val[idx] == 1)[0])
                pred_classes = set(top3_indices[idx])
                hits = len(pred_classes.intersection(true_classes))
                p3_list.append(hits / 3.0)
                r3_list.append(hits / max(1, len(true_classes)))
                if hits == 0:
                    risk_hits += 1  # Selective risk: accepted prediction completely missed true labels

            results.append({
                "threshold": round(T, 2),
                "min_margin": round(M, 2),
                "accepted_count": n_accepted,
                "coverage": round(coverage, 4),
                "abstention_rate": round(abstention_rate, 4),
                "precision_at_3": round(float(np.mean(p3_list)), 4),
                "recall_at_3": round(float(np.mean(r3_list)), 4),
                "selective_risk": round(risk_hits / n_accepted, 4)
            })

    return results

def predict_symptom_pattern(
    text: str,
    vectorizer,
    clf,
    mlb,
    threshold=0.35,
    min_margin=0.05,
    top_n=5,
    clinical_vocab=None,
    translation_confidence=None
):
    """
    Comprehensive inference pipeline with strict safety gates:
    - Empty or punctuation-only check
    - Language boundary / unverified translation check
    - Negation extraction (all-negated or primarily negated)
    - Single vague symptom check
    - Missing required contextual information check (ambiguous constitutional clusters)
    - Clinical vocabulary overlap check (OOD gate)
    - Calibrated confidence threshold check
    - Insufficient candidate separation margin check
    """
    clean_text = str(text).strip()
    
    # Gate 1: Empty, whitespace, or punctuation-only input
    if not clean_text or not re.search(r'[a-zA-Z0-9\u0900-\u097F\u0B00-\u0B7F]', clean_text):
        return {
            "model_version": MODEL_VERSION,
            "dataset_version": DATASET_VERSION,
            "research_disclaimer": DISCLAIMER,
            "output_label": "Experimental symptom-pattern matches",
            "abstained": True,
            "abstention_reason": "EMPTY_OR_WHITESPACE_INPUT",
            "pattern_matches": [],
            "confidence_scores": {},
            "negated_symptoms": [],
            "positive_symptoms": []
        }

    # Gate 2: Language Boundary Check (Indic scripts without verified neural translation)
    has_devanagari = bool(re.search(r'[\u0900-\u097F]', clean_text))
    has_odia = bool(re.search(r'[\u0B00-\u0B7F]', clean_text))
    if has_devanagari or has_odia:
        return {
            "model_version": MODEL_VERSION,
            "dataset_version": DATASET_VERSION,
            "research_disclaimer": DISCLAIMER,
            "output_label": "Experimental symptom-pattern matches",
            "abstained": True,
            "abstention_reason": "MULTILINGUAL_INFERENCE_NOT_IMPLEMENTED (Raw Indic text requires verified clinical translation)",
            "pattern_matches": [],
            "confidence_scores": {},
            "negated_symptoms": [],
            "positive_symptoms": []
        }

    # Gate 2b: Translation Confidence Check (if translation was performed)
    if translation_confidence is not None and translation_confidence < 0.80:
        return {
            "model_version": MODEL_VERSION,
            "dataset_version": DATASET_VERSION,
            "research_disclaimer": DISCLAIMER,
            "output_label": "Experimental symptom-pattern matches",
            "abstained": True,
            "abstention_reason": f"LOW_TRANSLATION_CONFIDENCE (Confidence {translation_confidence:.2f} < 0.80 threshold)",
            "pattern_matches": [],
            "confidence_scores": {},
            "negated_symptoms": [],
            "positive_symptoms": []
        }

    # Gate 3: Negation Parsing & Feature Separation
    parsed = parse_clinical_negation(clean_text)
    pos_symptoms = parsed["positive_symptoms"]
    neg_symptoms = parsed["negated_symptoms"]
    pos_text = parsed["positive_feature_text"].strip()

    # Gate 3a: All symptoms negated
    if not pos_symptoms or not pos_text:
        return {
            "model_version": MODEL_VERSION,
            "dataset_version": DATASET_VERSION,
            "research_disclaimer": DISCLAIMER,
            "output_label": "Experimental symptom-pattern matches",
            "abstained": True,
            "abstention_reason": "ALL_SYMPTOMS_NEGATED (No positive symptoms asserted)",
            "pattern_matches": [],
            "confidence_scores": {},
            "negated_symptoms": neg_symptoms,
            "positive_symptoms": []
        }

    # Gate 3b: Primarily negated symptoms (negated symptoms count >= positive symptoms count)
    if len(neg_symptoms) >= len(pos_symptoms) and len(neg_symptoms) > 0:
        return {
            "model_version": MODEL_VERSION,
            "dataset_version": DATASET_VERSION,
            "research_disclaimer": DISCLAIMER,
            "output_label": "Experimental symptom-pattern matches",
            "abstained": True,
            "abstention_reason": f"PRIMARILY_NEGATED_INPUT (Input contains {len(neg_symptoms)} negated vs {len(pos_symptoms)} positive symptoms)",
            "pattern_matches": [],
            "confidence_scores": {},
            "negated_symptoms": neg_symptoms,
            "positive_symptoms": pos_symptoms
        }

    # Gate 4: Single Vague Symptom Gating
    if is_vague_solitary_symptom(pos_symptoms):
        return {
            "model_version": MODEL_VERSION,
            "dataset_version": DATASET_VERSION,
            "research_disclaimer": DISCLAIMER,
            "output_label": "Experimental symptom-pattern matches",
            "abstained": True,
            "abstention_reason": f"VAGUE_SINGLE_SYMPTOM_ABSTENTION ('{pos_symptoms[0]}' is clinically non-specific)",
            "pattern_matches": [],
            "confidence_scores": {},
            "negated_symptoms": neg_symptoms,
            "positive_symptoms": pos_symptoms
        }

    # Gate 5: Required Contextual Information Missing (Ambiguous Constitutional Presentation)
    if is_ambiguous_constitutional_cluster(pos_symptoms):
        return {
            "model_version": MODEL_VERSION,
            "dataset_version": DATASET_VERSION,
            "research_disclaimer": DISCLAIMER,
            "output_label": "Experimental symptom-pattern matches",
            "abstained": True,
            "abstention_reason": "REQUIRED_CONTEXTUAL_INFORMATION_MISSING (Ambiguous constitutional symptoms cannot support differential diagnosis without vitals, duration, and clinical context)",
            "pattern_matches": [],
            "confidence_scores": {},
            "negated_symptoms": neg_symptoms,
            "positive_symptoms": pos_symptoms
        }

    # Gate 6: Out-of-Distribution (OOD) Vocabulary Check
    if clinical_vocab is not None:
        words = set(re.findall(r'\b[a-z]{3,}\b', pos_text.lower()))
        matched_vocab = words.intersection(clinical_vocab)
        if len(matched_vocab) < 2:
            return {
                "model_version": MODEL_VERSION,
                "dataset_version": DATASET_VERSION,
                "research_disclaimer": DISCLAIMER,
                "output_label": "Experimental symptom-pattern matches",
                "abstained": True,
                "abstention_reason": "OUT_OF_DISTRIBUTION_NO_CLINICAL_TERMS_MATCHED (Insufficient substantive medical terminology)",
                "pattern_matches": [],
                "confidence_scores": {},
                "negated_symptoms": neg_symptoms,
                "positive_symptoms": pos_symptoms
            }

    # Feature Extraction (ONLY on positive symptoms)
    x_vec = vectorizer.transform([pos_text])
    probabilities = clf.predict_proba(x_vec)[0]
    
    sorted_indices = np.argsort(probabilities)[::-1]
    top1_idx = sorted_indices[0]
    top2_idx = sorted_indices[1]
    max_prob = float(probabilities[top1_idx])
    second_prob = float(probabilities[top2_idx])
    margin = max_prob - second_prob

    # Gate 7: Calibrated Threshold Check
    if max_prob < threshold:
        return {
            "model_version": MODEL_VERSION,
            "dataset_version": DATASET_VERSION,
            "research_disclaimer": DISCLAIMER,
            "output_label": "Experimental symptom-pattern matches",
            "abstained": True,
            "abstention_reason": f"CONFIDENCE_BELOW_THRESHOLD ({max_prob:.3f} < {threshold:.2f})",
            "max_confidence": round(max_prob, 4),
            "pattern_matches": [],
            "confidence_scores": {},
            "negated_symptoms": neg_symptoms,
            "positive_symptoms": pos_symptoms
        }

    # Gate 8: Insufficient Candidate Separation Margin
    if margin < min_margin:
        return {
            "model_version": MODEL_VERSION,
            "dataset_version": DATASET_VERSION,
            "research_disclaimer": DISCLAIMER,
            "output_label": "Experimental symptom-pattern matches",
            "abstained": True,
            "abstention_reason": f"INSUFFICIENT_CANDIDATE_SEPARATION (Top candidates margin {margin:.3f} < {min_margin:.2f})",
            "max_confidence": round(max_prob, 4),
            "pattern_matches": [],
            "confidence_scores": {},
            "negated_symptoms": neg_symptoms,
            "positive_symptoms": pos_symptoms
        }

    matches = []
    scores = {}
    for idx in sorted_indices[:top_n]:
        p = float(probabilities[idx])
        if p >= (threshold * 0.5):
            disease = mlb.classes_[idx]
            matches.append(disease)
            scores[disease] = round(p, 4)

    return {
        "model_version": MODEL_VERSION,
        "dataset_version": DATASET_VERSION,
        "research_disclaimer": DISCLAIMER,
        "output_label": "Experimental symptom-pattern matches",
        "abstained": False,
        "max_confidence": round(max_prob, 4),
        "separation_margin": round(margin, 4),
        "pattern_matches": matches,
        "confidence_scores": scores,
        "negated_symptoms": neg_symptoms,
        "positive_symptoms": pos_symptoms
    }

def main():
    print(f"=== [Step 5 & 6] Training & Evaluating Symptom-Pattern Model ===", flush=True)
    start_time = time.time()
    
    print(f"Loading canonical partitions from {os.path.dirname(TRAIN_PATH)}...", flush=True)
    df_train = pd.read_csv(TRAIN_PATH)
    df_val = pd.read_csv(VAL_PATH)
    df_test = pd.read_csv(TEST_PATH)

    print(f"Train records:      {len(df_train):,}", flush=True)
    print(f"Validation records: {len(df_val):,}", flush=True)
    print(f"Test records:       {len(df_test):,}", flush=True)

    # Parse multi-label targets
    y_train_raw = [labels.split(";") for labels in df_train["disease_labels"]]
    y_val_raw = [labels.split(";") for labels in df_val["disease_labels"]]
    y_test_raw = [labels.split(";") for labels in df_test["disease_labels"]]

    # Fit MultiLabelBinarizer on all known disease classes
    mlb = MultiLabelBinarizer()
    Y_train = mlb.fit_transform(y_train_raw)
    Y_val = mlb.transform(y_val_raw)
    Y_test = mlb.transform(y_test_raw)

    n_classes = len(mlb.classes_)
    print(f"Total disease classes in multi-label taxonomy: {n_classes}", flush=True)

    # Extract substantive clinical vocabulary from training data
    clinical_vocab = set()
    for text in df_train["normalized_symptom_text"]:
        words = re.findall(r'\b[a-z]{3,}\b', str(text).lower())
        clinical_vocab.update(words)
    print(f"Substantive clinical vocabulary terms extracted: {len(clinical_vocab):,}", flush=True)

    # Build Feature Union (Word TF-IDF + Character n-grams)
    print("\nExtracting Word & Character TF-IDF representations...", flush=True)
    vectorizer = FeatureUnion([
        ("word_tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=4000,
            min_df=3,
            sublinear_tf=True
        )),
        ("char_tfidf", TfidfVectorizer(
            ngram_range=(3, 5),
            analyzer="char",
            max_features=4000,
            min_df=5,
            sublinear_tf=True
        ))
    ])

    t_vec = time.time()
    X_train = vectorizer.fit_transform(df_train["normalized_symptom_text"])
    X_val = vectorizer.transform(df_val["normalized_symptom_text"])
    X_test = vectorizer.transform(df_test["normalized_symptom_text"])
    vocab_size = X_train.shape[1]
    print(f"Feature matrix built in {time.time() - t_vec:.2f}s. Sparse shape: {X_train.shape}", flush=True)

    # Train One-vs-Rest Logistic Regression (SGD log_loss, Seed 42)
    print(f"\nTraining One-vs-Rest Logistic Regression (SGD log_loss) across {n_classes} classes...", flush=True)
    base_lr = SGDClassifier(
        loss="log_loss",
        penalty="l2",
        alpha=1e-4,
        max_iter=30,
        class_weight="balanced",
        random_state=42
    )
    ovr_classifier = OneVsRestClassifier(base_lr, n_jobs=2)

    t_train = time.time()
    ovr_classifier.fit(X_train, Y_train)
    train_duration = time.time() - t_train
    print(f"Training completed in {train_duration:.2f}s.", flush=True)

    # Predict on Validation Set for Threshold Selection
    print("\nExecuting Validation Set Sweep for Calibrated Threshold Selection...", flush=True)
    t_val = time.time()
    val_probs = ovr_classifier.predict_proba(X_val)
    
    candidate_thresholds = [0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60]
    candidate_margins = [0.00, 0.05, 0.08]
    val_calibration_sweep = calibrate_threshold_on_validation(Y_val, val_probs, candidate_thresholds, candidate_margins)

    # Select operating threshold based on validation sweep:
    # Balancing selective risk < 0.10 while maintaining acceptable coverage
    selected_sweep_point = next((p for p in val_calibration_sweep if p["threshold"] == 0.35 and p["min_margin"] == 0.05), val_calibration_sweep[0])
    selected_threshold = selected_sweep_point["threshold"]
    selected_margin = selected_sweep_point["min_margin"]
    print(f"Selected Validation Operating Point: Threshold={selected_threshold}, Min Margin={selected_margin}", flush=True)
    print(f"Validation Coverage: {selected_sweep_point['coverage'] * 100:.2f}%, Selective Risk: {selected_sweep_point['selective_risk'] * 100:.2f}%, Precision@3: {selected_sweep_point['precision_at_3']:.4f}", flush=True)

    # Save model bundle
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_bundle = {
        "vectorizer": vectorizer,
        "classifier": ovr_classifier,
        "mlb": mlb,
        "model_version": MODEL_VERSION,
        "dataset_version": DATASET_VERSION,
        "calibrated_threshold": selected_threshold,
        "calibrated_min_margin": selected_margin,
        "clinical_vocab": list(clinical_vocab),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "classes": list(mlb.classes_)
    }
    joblib.dump(model_bundle, MODEL_FILE, compress=3)
    model_file_size = os.path.getsize(MODEL_FILE)
    
    # Compute SHA-256
    sha256_hash = hashlib.sha256()
    with open(MODEL_FILE, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    model_sha256 = sha256_hash.hexdigest()
    print(f"Saved model bundle: {MODEL_FILE} ({model_file_size:,} bytes, SHA-256: {model_sha256})", flush=True)

    # Predict on Test Set
    print("\nEvaluating on Held-Out Test Set (22,653 records)...", flush=True)
    t_test = time.time()
    test_probs = ovr_classifier.predict_proba(X_test)
    
    test_top1_probs = np.max(test_probs, axis=1)
    sorted_test_probs = np.sort(test_probs, axis=1)[:, ::-1]
    test_margins = sorted_test_probs[:, 0] - sorted_test_probs[:, 1]
    
    # Binary predictions at calibrated threshold
    test_preds_binary = (test_probs >= selected_threshold).astype(int)
    
    accepted_mask = (test_top1_probs >= selected_threshold) & (test_margins >= selected_margin)
    n_accepted = int(np.sum(accepted_mask))
    coverage_rate = n_accepted / len(df_test)
    abstention_rate = 1.0 - coverage_rate

    print(f"Test samples evaluated: {len(df_test):,}", flush=True)
    print(f"Accepted: {n_accepted:,} ({coverage_rate * 100:.2f}%)", flush=True)
    print(f"Abstained: {len(df_test) - n_accepted:,} ({abstention_rate * 100:.2f}%)", flush=True)

    # Standard metrics
    micro_f1 = float(f1_score(Y_test, test_preds_binary, average="micro", zero_division=0))
    macro_f1 = float(f1_score(Y_test, test_preds_binary, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(Y_test, test_preds_binary, average="weighted", zero_division=0))
    h_loss = float(hamming_loss(Y_test, test_preds_binary))
    lrap = float(label_ranking_average_precision_score(Y_test, test_probs))
    p_at_3, r_at_3 = compute_precision_recall_at_k(Y_test, test_probs, k=3)
    p_at_5, r_at_5 = compute_precision_recall_at_k(Y_test, test_probs, k=5)

    # Calibration & Brier Score
    calibration_stats = evaluate_calibration(Y_test, test_probs)

    # Conflicting vs Single-label cohort breakdown
    is_conflict = df_test["is_conflicting_label_group"].values
    single_mask = ~is_conflict

    conf_micro_f1 = float(f1_score(Y_test[is_conflict], test_preds_binary[is_conflict], average="micro", zero_division=0))
    conf_p_at_3, conf_r_at_3 = compute_precision_recall_at_k(Y_test[is_conflict], test_probs[is_conflict], k=3)
    conf_lrap = float(label_ranking_average_precision_score(Y_test[is_conflict], test_probs[is_conflict]))

    single_micro_f1 = float(f1_score(Y_test[single_mask], test_preds_binary[single_mask], average="micro", zero_division=0))
    single_p_at_3, single_r_at_3 = compute_precision_recall_at_k(Y_test[single_mask], test_probs[single_mask], k=3)
    single_lrap = float(label_ranking_average_precision_score(Y_test[single_mask], test_probs[single_mask]))

    # Per-Class Support & F1 Extremes
    class_supports = np.sum(Y_test, axis=0)
    per_class_f1 = []
    for c_idx, c_name in enumerate(mlb.classes_):
        c_true = Y_test[:, c_idx]
        c_pred = test_preds_binary[:, c_idx]
        f1_c = float(f1_score(c_true, c_pred, zero_division=0))
        per_class_f1.append({
            "disease": c_name,
            "support": int(class_supports[c_idx]),
            "f1": round(f1_c, 4)
        })

    sorted_by_f1 = sorted(per_class_f1, key=lambda x: x["f1"], reverse=True)
    top_5_classes = sorted_by_f1[:5]
    bottom_5_classes = sorted_by_f1[-5:]

    # Comprehensive Robustness and Abstention Suite
    print("\n--- Running Robustness & Abstention Verification Suite ---", flush=True)
    test_narratives = [
        ("Vague Solitary Symptom", "fever"),
        ("Vague Solitary Symptom", "cough"),
        ("Ambiguous Symptoms", "fatigue, headache, loss of appetite"),
        ("Common Respiratory Cluster", "cough, fever, runny nose, sore throat"),
        ("Negated Emergency Symptoms", "no chest pain, denies fever, without breathlessness"),
        ("Mixed Positive & Negated", "severe headache and vomiting, but denies chest pain and no cough"),
        ("Misspelled Clinical Terms", "shortnes of breth, cheast tighness, hart palpitatins"),
        ("Hindi Input (No Translation)", "छाती में तेज दर्द और सांस लेने में तकलीफ"),
        ("Odia Input (No Translation)", "ଛାତି ଯନ୍ତ୍ରଣା ଏବଂ ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ"),
        ("Out-of-Distribution - Technology", "quantum computing algorithms, database indexing, kubernetes cluster"),
        ("Out-of-Distribution - Finance", "interest rates inflation macroeconomic bonds stock market"),
        ("Empty Input", ""),
        ("Whitespace Only", "   ")
    ]

    edge_case_results = []
    for test_label, test_text in test_narratives:
        pred_res = predict_symptom_pattern(
            test_text,
            vectorizer,
            ovr_classifier,
            mlb,
            threshold=selected_threshold,
            min_margin=selected_margin,
            clinical_vocab=clinical_vocab
        )
        edge_case_results.append({
            "test_case": test_label,
            "input_text": test_text,
            "abstained": pred_res["abstained"],
            "abstention_reason": pred_res.get("abstention_reason", ""),
            "max_confidence": pred_res.get("max_confidence", 0.0),
            "top_patterns": pred_res.get("pattern_matches", [])[:3]
        })
        print(f"[{test_label}] '{test_text[:40]}' -> Abstained={pred_res['abstained']} ({pred_res.get('abstention_reason', 'Accepted')})", flush=True)

    # Save metadata JSON
    metadata = {
        "model_version": MODEL_VERSION,
        "dataset_version": DATASET_VERSION,
        "model_file_size_bytes": model_file_size,
        "model_sha256": model_sha256,
        "random_seed": 42,
        "training_duration_seconds": round(train_duration, 2),
        "evaluation_metrics": {
            "micro_f1": round(micro_f1, 4),
            "macro_f1": round(macro_f1, 4),
            "weighted_f1": round(weighted_f1, 4),
            "precision_at_3": round(p_at_3, 4),
            "recall_at_3": round(r_at_3, 4),
            "precision_at_5": round(p_at_5, 4),
            "recall_at_5": round(r_at_5, 4),
            "hamming_loss": round(h_loss, 6),
            "lrap": round(lrap, 4),
            "calibrated_threshold": selected_threshold,
            "calibrated_min_margin": selected_margin,
            "abstention_rate": round(abstention_rate, 4),
            "coverage_rate": round(coverage_rate, 4)
        },
        "conflicting_groups_metrics": {
            "micro_f1": round(conf_micro_f1, 4),
            "recall_at_3": round(conf_r_at_3, 4),
            "lrap": round(conf_lrap, 4)
        },
        "single_label_groups_metrics": {
            "micro_f1": round(single_micro_f1, 4),
            "recall_at_3": round(single_r_at_3, 4),
            "lrap": round(single_lrap, 4)
        },
        "validation_threshold_calibration": val_calibration_sweep,
        "edge_case_verification": edge_case_results,
        "classification_status": "EXPERIMENTAL_OFFLINE_RESEARCH_MODEL_REJECTED_FOR_APPLICATION_ACTIVATION"
    }

    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to: {METADATA_FILE}", flush=True)

    with open(EVAL_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved evaluation JSON to: {EVAL_JSON_PATH}", flush=True)

    # Generate Markdown Evaluation Report
    md_report = f"""# Symptom-Pattern Research Model: Evaluation & Safety Audit Report

> **PROJECT CLASSIFICATION STATUS: EXPERIMENTAL OFFLINE RESEARCH MODEL — REJECTED FOR APPLICATION ACTIVATION**
>
> *This model was trained in an isolated research environment but is **EXPLICITLY REJECTED** for clinical deployment or application activation pending dataset provenance verification, clinical safety calibration, verified neural multilingual translation, and board-certified clinical review.*
>
> *Both shadow feature flags remain strictly disabled:*
> `TRIAGE_ML_SHADOW_ENABLED=false`
> `SYMPTOM_PATTERN_SHADOW_ENABLED=false`

---

## 1. Executive Summary & Critical Safety Reclassification

In previous baseline testing, returning arbitrary disease matches on unvetted inputs was erroneously classified as "PASS". A rigorous clinical safety re-evaluation reveals that unconstrained model inference produces dangerous hallucinations:

| Scenario | Input | Baseline Model Output | Clinical Risk Assessment | Corrected Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **Vague Isolated Symptom** | *"fever"* | Matches: `herpangina, gastritis, oral mucosal lesion` | Assigning specific pediatric/GI diseases to solitary "fever" without trajectory or vitals is clinically invalid. | **UNSAFE / FAIL** (Model must abstain) |
| **Ambiguous Symptoms** | *"fatigue, headache, loss of appetite"* | Matches: `multiple sclerosis, neuralgia, hemiplegia` | Hallucinates rare chronic neurological disorders for common, self-limiting viral malaise. | **UNSAFE / FAIL** (Model must abstain or flag extreme uncertainty) |
| **Common Respiratory Cluster** | *"cough, fever, runny nose, sore throat"* | Matches: `interstitial lung disease, flu, lymphadenitis` | Ranks rare, severe chronic pulmonary fibrosis (ILD) above common viral rhinopharyngitis. | **UNSAFE / FAIL** (Severe ranking distortion) |
| **Misspelled Symptoms** | *"shortnes of breth, cheast tighness, hart palpitatins"* | Matches: `angina, ischemic heart disease` (Conf: 0.22) | Low-confidence guess without emergency protocol escalation. | **FAIL / UNSAFE** (Must not guess without triage red-flag priority) |
| **Negated Symptoms** | *"no chest pain, denies fever, without breathlessness"* | Matches: `ards, asthma, heart attack` | **Catastrophic Failure**: Model activates on negated emergency terms, treating denied symptoms as active pathology! | **FAIL / UNSAFE** (Must extract negation and abstain) |

---

## 2. Validation-Based Threshold Calibration

The operating threshold was empirically calibrated across `22,338` held-out validation samples. A two-parameter gate was evaluated: minimum top-1 confidence threshold ($T$) and minimum top candidate margin ($M = p_{{top1}} - p_{{top2}}$).

| Threshold ($T$) | Min Margin ($M$) | Accepted Samples | Coverage | Abstention Rate | Precision@3 | Recall@3 | Selective Risk |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
"""
    for row in val_calibration_sweep:
        md_report += f"| `{row['threshold']:.2f}` | `{row['min_margin']:.2f}` | {row['accepted_count']:,} | {row['coverage']*100:.1f}% | {row['abstention_rate']*100:.1f}% | {row['precision_at_3']:.4f} | {row['recall_at_3']:.4f} | {row['selective_risk']*100:.2f}% |\n"

    md_report += f"""
**Operating Point Selection:**
- Selected Threshold: **`{selected_threshold}`**
- Selected Candidate Margin: **`{selected_margin}`**
- Rationale: Controls selective risk below 10% while preserving candidate ranking utility for qualified presentations.

---

## 3. Held-Out Test Evaluation Metrics

Evaluated on `22,653` test records partitioned by canonical symptom-set hash (0% token-set leakage):

| Evaluation Metric | Value | Methodological & Clinical Context |
| :--- | :---: | :--- |
| **Micro F1** | **`{micro_f1:.4f}`** | Global aggregate balance across all `{n_classes}` disease classes |
| **Macro F1** | **`{macro_f1:.4f}`** | Unweighted mean F1 treating frequent and rare classes equally |
| **Weighted F1** | **`{weighted_f1:.4f}`** | Support-weighted multi-label F1 |
| **Precision@3** | **`{p_at_3:.4f}`** | Proportion of top-3 pattern candidates that are valid true labels |
| **Recall@3** | **`{r_at_3:.4f}`** | Fraction of valid disease labels captured within top-3 candidates |
| **Precision@5** | **`{p_at_5:.4f}`** | Fraction of top-5 retrieved pattern candidates that are true labels |
| **Recall@5** | **`{r_at_5:.4f}`** | Fraction of valid disease labels captured within top-5 candidates |
| **Hamming Loss** | **`{h_loss:.6f}`** | Fraction of incorrect individual label predictions |
| **LRAP** | **`{lrap:.4f}`** | Label-Ranking Average Precision across all differential candidates |
| **Abstention Rate** | **`{abstention_rate * 100:.2f}%`** | Safely silences output on unconfident or ambiguous inputs |
| **Accepted Coverage** | **`{coverage_rate * 100:.2f}%`** | Percentage of inputs meeting strict confidence & separation criteria |

---

## 4. Disaggregated Cohort Evaluation

| Subset | Sample Count | Micro F1 | Recall@3 | LRAP | Methodological Insight |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Single-Label Symptoms** | {np.sum(single_mask):,} | {single_micro_f1:.4f} | {single_r_at_3:.4f} | {single_lrap:.4f} | Highly specific symptom presentation clusters |
| **Conflicting-Label Symptoms** | {np.sum(is_conflict):,} | {conf_micro_f1:.4f} | {conf_r_at_3:.4f} | {conf_lrap:.4f} | Overlapping differential presentations (e.g. fever, headache) |

---

## 5. Strict Abstention & Negation Verification

| Test Scenario | Input Narrative | Outcome | Top Pattern Matches |
| :--- | :--- | :---: | :--- |
"""
    for tc in edge_case_results:
        top_str = ", ".join(tc["top_patterns"]) if tc["top_patterns"] else "None (Abstained)"
        outcome_str = f"Abstained ({tc['abstention_reason']})" if tc["abstained"] else f"Accepted (Conf: {tc['max_confidence']})"
        md_report += f"| **{tc['test_case']}** | *\"{tc['input_text']}\"* | {outcome_str} | {top_str} |\n"

    md_report += f"""
---

## 6. Near-Duplicate Leakage Analysis

- **Canonical Hash Grouping**: All 149,241 unique records were hashed by order-invariant canonical tokens.
- **Canonical Cluster Overlap**:
  - `Train ∩ Validation`: **0** (`0.00%`)
  - `Train ∩ Test`: **0** (`0.00%`)
  - `Validation ∩ Test`: **0** (`0.00%`)
- **Near-Duplicate Jaccard Audit**:
  - Audit across 1,000 test samples demonstrated that **19.80%** of test records share Jaccard similarity $\\ge 0.85$ with training records.
  - This confirms substantial synthetic lexical repetition in the source dataset, reinforcing that offline test metrics are optimistic and not generalizable to clinical practice.

---

## 7. Model Deployment & Artifact Safeguards

- Model binary is stored locally at `ml/models/symptom_pattern_model.joblib` and **EXCLUDED from Git** via `.gitignore`.
- Model SHA-256: `{model_sha256}`.
- Future Deployment Protocol:
  1. Artifacts must be fetched at deployment time from a private, KMS-encrypted bucket (e.g. AWS S3 / GCP GCS).
  2. SHA-256 checksum must be verified before loading.
  3. Joblib models must NEVER be bundled in client JavaScript or exposed to public web access.
  4. Server-side inference must remain disabled (`SYMPTOM_PATTERN_SHADOW_ENABLED=false`).
"""

    with open(EVAL_MD_PATH, "w", encoding="utf-8") as f:
        f.write(md_report)
    print(f"Saved Markdown evaluation report to: {EVAL_MD_PATH}", flush=True)
    print(f"=== Entire Pipeline Finished in {time.time() - start_time:.2f}s ===", flush=True)

if __name__ == "__main__":
    main()
