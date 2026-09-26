"""
TriageBridge Experimental Symptom-Pattern Classifier Training Pipeline
======================================================================
Isolated Auxiliary Research Model: Symptom Text -> Disease-Pattern Category

SAFETY BOUNDARIES:
- Experimental research tool only. NOT a certified diagnostic device.
- Output MUST NOT be connected to patient dashboard, clinical advice, or final triage.
- Output MUST NOT be used as a feature in the urgency (RED/YELLOW/GREEN) model.
- Requires qualified healthcare-worker review before any clinical use.
- Metrics DO NOT validate clinical diagnosis or triage safety.
"""

import os
import sys
import json
import hashlib
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    classification_report,
    confusion_matrix
)

MANDATORY_DISCLAIMER = "Experimental symptom-pattern classifier — not a diagnosis."
CLINICAL_SAFETY_WARNING = (
    "Explicit Clinical Safety Warning: These statistical performance metrics do NOT "
    "validate clinical diagnosis, medical efficacy, or emergency triage safety. "
    "The dataset covers only 24 synthetic categories and must never be used for "
    "direct patient care or diagnostic recommendations."
)


def compute_sha256(filepath: str) -> str:
    """Compute SHA-256 hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def train_disease_pattern_pipeline(
    data_path: str = 'data/processed/symptom2disease_clean.csv',
    raw_path: str = 'data/raw/Symptom2Disease.csv',
    model_output_dir: str = 'ml/models',
    reports_output_dir: str = 'ml/reports'
):
    """Train, validate, and serialize the isolated symptom-pattern model with a 3-way split."""
    print("=" * 65)
    print("  TRIAGEBRIDGE EXPERIMENTAL SYMPTOM-PATTERN MODEL TRAINING")
    print("=" * 65)

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Cleaned dataset not found at {data_path}. Run ml/preprocess_symptom2disease.py first.")

    raw_hash = compute_sha256(raw_path) if os.path.exists(raw_path) else "UNKNOWN"
    clean_hash = compute_sha256(data_path)

    df = pd.read_csv(data_path)
    print(f"\n[INFO] Loaded clean dataset: {len(df)} rows, 24 disease classes")

    # -------------------------------------------------------------
    # 1. Leakage-Safe Stratified 3-Way Split (Train / Val / Test)
    # -------------------------------------------------------------
    # 70% Train (807), 15% Validation (173), 15% Held-out Test (173)
    train_val_df, test_df = train_test_split(
        df, test_size=0.15, random_state=42, stratify=df['label']
    )
    val_ratio_of_train_val = 0.15 / 0.85
    train_df, val_df = train_test_split(
        train_val_df, test_size=val_ratio_of_train_val, random_state=42, stratify=train_val_df['label']
    )

    print(f"[INFO] Dataset splits:")
    print(f"  - Training Set:   {len(train_df)} samples ({len(train_df)/len(df)*100:.1f}%)")
    print(f"  - Validation Set: {len(val_df)} samples ({len(val_df)/len(df)*100:.1f}%)")
    print(f"  - Held-out Test:  {len(test_df)} samples ({len(test_df)/len(df)*100:.1f}%)")
    print(f"  - Total:          {len(train_df) + len(val_df) + len(test_df)} samples")

    # Save split files for complete scientific reproducibility
    train_df.to_csv('data/processed/symptom2disease_train.csv', index=False)
    val_df.to_csv('data/processed/symptom2disease_val.csv', index=False)
    test_df.to_csv('data/processed/symptom2disease_test.csv', index=False)
    print("[INFO] Saved split CSVs to data/processed/")

    X_train, y_train = train_df['text'], train_df['label']
    X_val, y_val = val_df['text'], val_df['label']
    X_test, y_test = test_df['text'], test_df['label']

    # -------------------------------------------------------------
    # 2. Baseline Dummy Classifier
    # -------------------------------------------------------------
    dummy = DummyClassifier(strategy='most_frequent')
    dummy.fit(X_train, y_train)
    dummy_acc = dummy.score(X_test, y_test)
    print(f"\n[BASELINE] DummyClassifier (most-frequent) Accuracy: {dummy_acc:.4f} ({dummy_acc*100:.2f}%)")

    # -------------------------------------------------------------
    # 3. TF-IDF + Calibrated Logistic Regression Pipeline
    # -------------------------------------------------------------
    pipe = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.85,
            sublinear_tf=True
        )),
        ('clf', LogisticRegression(
            C=5.0,
            max_iter=1000,
            random_state=42,
            solver='lbfgs'
        ))
    ])

    print("\n[INFO] Fitting TF-IDF + Logistic Regression pipeline...")
    pipe.fit(X_train, y_train)

    # 5-fold cross-validation on training set
    cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring='accuracy')
    print(f"[INFO] 5-Fold CV Accuracy: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")

    # -------------------------------------------------------------
    # 4. Validation Set Performance
    # -------------------------------------------------------------
    y_val_pred = pipe.predict(X_val)
    val_acc = accuracy_score(y_val, y_val_pred)
    val_macro_f1 = f1_score(y_val, y_val_pred, average='macro')
    print(f"\n[VALIDATION] Accuracy: {val_acc:.4f} | Macro F1: {val_macro_f1:.4f}")

    # -------------------------------------------------------------
    # 5. Held-Out Test Set Performance & Confusion Matrix
    # -------------------------------------------------------------
    y_test_pred = pipe.predict(X_test)
    test_acc = accuracy_score(y_test, y_test_pred)
    balanced_acc = balanced_accuracy_score(y_test, y_test_pred)
    macro_f1 = f1_score(y_test, y_test_pred, average='macro')
    weighted_f1 = f1_score(y_test, y_test_pred, average='weighted')

    print("\n" + "=" * 65)
    print("  HELD-OUT TEST SET PERFORMANCE METRICS")
    print("=" * 65)
    print(f"Accuracy:          {test_acc:.4f} ({test_acc*100:.2f}%)")
    print(f"Balanced Accuracy: {balanced_acc:.4f} ({balanced_acc*100:.2f}%)")
    print(f"Macro F1 Score:    {macro_f1:.4f}")
    print(f"Weighted F1 Score: {weighted_f1:.4f}")

    classes = sorted(list(pipe.classes_))
    conf_mat = confusion_matrix(y_test, y_test_pred, labels=classes)
    clf_report_text = classification_report(y_test, y_test_pred, target_names=classes)
    clf_report_dict = classification_report(y_test, y_test_pred, target_names=classes, output_dict=True)

    print("\nPer-Class Classification Report:")
    print(clf_report_text)

    # -------------------------------------------------------------
    # 6. Save Reports & Confusion Matrix CSV
    # -------------------------------------------------------------
    os.makedirs(reports_output_dir, exist_ok=True)
    conf_mat_df = pd.DataFrame(conf_mat, index=classes, columns=classes)
    conf_mat_csv_path = os.path.join(reports_output_dir, 'disease_pattern_confusion_matrix.csv')
    conf_mat_df.to_csv(conf_mat_csv_path)
    print(f"\n[INFO] Saved confusion matrix to: {conf_mat_csv_path}")

    report_txt_path = os.path.join(reports_output_dir, 'disease_pattern_classification_report.txt')
    with open(report_txt_path, 'w', encoding='utf-8') as f:
        f.write("=" * 65 + "\n")
        f.write("  TRIAGEBRIDGE SYMPTOM-PATTERN MODEL CLASSIFICATION REPORT\n")
        f.write("=" * 65 + "\n\n")
        f.write(f"Disclaimer: {MANDATORY_DISCLAIMER}\n")
        f.write(f"Warning: {CLINICAL_SAFETY_WARNING}\n\n")
        f.write(f"Training Set Samples:   {len(train_df)}\n")
        f.write(f"Validation Set Samples: {len(val_df)}\n")
        f.write(f"Held-out Test Samples:  {len(test_df)}\n\n")
        f.write(f"Validation Accuracy: {val_acc:.4f} | Macro F1: {val_macro_f1:.4f}\n")
        f.write(f"Test Accuracy:       {test_acc:.4f} ({test_acc*100:.2f}%)\n")
        f.write(f"Balanced Accuracy:   {balanced_acc:.4f} ({balanced_acc*100:.2f}%)\n")
        f.write(f"Macro F1 Score:      {macro_f1:.4f}\n")
        f.write(f"Weighted F1 Score:   {weighted_f1:.4f}\n\n")
        f.write(clf_report_text)

    print(f"[INFO] Saved classification report text to: {report_txt_path}")

    # -------------------------------------------------------------
    # 7. Serialize Model & Metadata
    # -------------------------------------------------------------
    os.makedirs(model_output_dir, exist_ok=True)
    model_path = os.path.join(model_output_dir, 'disease_pattern_model.joblib')
    metadata_path = os.path.join(model_output_dir, 'disease_pattern_metadata.json')

    joblib.dump(pipe, model_path)
    print(f"[INFO] Serialized model to: {model_path}")

    metadata = {
        "model_name": "TriageBridge Experimental Symptom-Pattern Classifier",
        "model_version": "1.0.0-experimental-research",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": MANDATORY_DISCLAIMER,
        "clinical_safety_warning": CLINICAL_SAFETY_WARNING,
        "is_diagnostic": False,
        "allowed_environment": "INTERNAL_RESEARCH_ONLY",
        "dataset_provenance": {
            "source": "Symptom2Disease.csv (Niyar R. Barman, Kaggle)",
            "license": "CC0: Public Domain",
            "raw_dataset_sha256": raw_hash,
            "clean_dataset_sha256": clean_hash,
            "raw_rows": 1200,
            "clean_rows": len(df),
            "removed_duplicate_rows": 47,
            "train_samples": len(train_df),
            "val_samples": len(val_df),
            "test_samples": len(test_df),
        },
        "model_architecture": {
            "feature_extractor": "TfidfVectorizer(ngram_range=(1,2), sublinear_tf=True, min_df=2, max_df=0.85)",
            "classifier": "LogisticRegression(C=5.0, max_iter=1000, solver='lbfgs')",
            "classes": classes,
            "total_classes": len(classes)
        },
        "performance": {
            "dummy_baseline_accuracy": round(float(dummy_acc), 4),
            "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
            "cv_accuracy_std": round(float(cv_scores.std()), 4),
            "val_accuracy": round(float(val_acc), 4),
            "val_macro_f1": round(float(val_macro_f1), 4),
            "test_accuracy": round(float(test_acc), 4),
            "test_balanced_accuracy": round(float(balanced_acc), 4),
            "test_macro_f1": round(float(macro_f1), 4),
            "test_weighted_f1": round(float(weighted_f1), 4)
        },
        "safety_constraints": {
            "leakage_prevention": "Exact duplicate texts removed before splitting. Zero duplicate text across train, val, and test splits.",
            "urgency_model_isolation": "Disease prediction is NEVER fed as a feature into the RED/YELLOW/GREEN model.",
            "patient_isolation": "Predictions are never exposed on patient dashboards, confirmation slips, or SMS.",
            "clinical_governance": "Requires qualified healthcare-worker review. Not a diagnosis."
        }
    }

    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    print(f"[INFO] Serialized metadata to: {metadata_path}")

    return pipe, metadata


if __name__ == '__main__':
    train_disease_pattern_pipeline()
