"""
TriageBridge Urgency Classification Training Pipeline
=====================================================

Strict Safety & Compliance Rules:
1. Pure intake features only — ZERO target leakage.
2. Group-stratified train/val/test splitting to prevent near-duplicate/template leakage.
3. Target: RED, YELLOW, GREEN (GREY excluded from training; reserved for deterministic gating).
4. Class-weighted multinomial LogisticRegression baseline + comparison.
5. All evaluation metrics computed on held-out test set once.
6. Prominent non-diagnostic synthetic data notices.
"""

import os
import sys
import json
import hashlib
import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    f1_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
)

# ---------------------------------------------------------
# CONSTANTS & SAFETY DEFINITIONS
# ---------------------------------------------------------
RANDOM_SEED = 42
TARGET_COL = 'provisional_urgency_label'
TARGET_CLASSES = ['RED', 'YELLOW', 'GREEN']

# Features available STRICTLY at patient intake
TEXT_FEATURES = ['chief_complaint', 'symptoms']
NUMERIC_FEATURES = [
    'age',
    'duration_hours',
    'pain_score',
    'vitals_heart_rate_bpm',
    'vitals_systolic_bp',
    'vitals_diastolic_bp',
    'vitals_spo2_percent',
    'vitals_temperature_c',
    'vitals_respiratory_rate_bpm',
]
CATEGORICAL_FEATURES = [
    'gender',
    'patient_language',
    'medical_history',
    'allergies',
    'pregnancy_status',
]

ALL_INTAKE_FEATURES = TEXT_FEATURES + NUMERIC_FEATURES + CATEGORICAL_FEATURES

# Forbidden Leakage Columns
FORBIDDEN_LEAKAGE_COLUMNS = [
    'case_id',
    'patient_synthetic_id',
    'rule_based_red_flags',
    'rule_based_urgency',
    'ml_suggested_urgency',
    'ml_confidence_score',
    'missing_information',
    'requires_healthcare_worker_review',
    'healthcare_review_status',
    'is_synthetic',
    'is_validated',
    'clinical_disclaimer',
    'reviewer decisions',
    'reviewer_decisions',
    'explanations',
    'explanation',
    'any post-assessment field',
    'post_assessment_field',
    'disease',
    'cures',
    'doctor',
    'risk level',
    'reviewer_notes',
    'final_decision',
]


def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


def validate_leakage_safety(feature_list):
    """Enforces zero leakage into the feature matrix."""
    forbidden_normalized = {c.lower().replace(' ', '_') for c in FORBIDDEN_LEAKAGE_COLUMNS}
    for col in feature_list:
        norm_col = str(col).lower().replace(' ', '_')
        if norm_col in forbidden_normalized or str(col).lower() in [f.lower() for f in FORBIDDEN_LEAKAGE_COLUMNS]:
            raise AssertionError(f"CRITICAL LEAKAGE ERROR: Forbidden column '{col}' detected in feature set!")
    print(f"[LEAKAGE CHECK] PASSED: All {len(feature_list)} features verified pre-intake compliant.")


def build_narrative_groups(df):
    """Identifies near-duplicate cases derived from the same narrative template."""
    narratives = df['chief_complaint'].fillna('').str.strip() + " ||| " + df['symptoms'].fillna('').str.strip()
    unique_narratives = sorted(narratives.unique())
    narrative_to_group = {n: f"GROUP_{i:03d}" for i, n in enumerate(unique_narratives)}
    return narratives.map(narrative_to_group)


def group_stratified_split(df, group_col, target_col, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42):
    """
    Performs stratified group allocation:
    Keeps entire narrative template groups within ONE split (train, val, or test),
    preventing near-duplicate narrative leakage while maintaining balanced class ratios.
    """
    rng = np.random.RandomState(seed)
    train_indices, val_indices, test_indices = [], [], []

    for label in TARGET_CLASSES:
        label_df = df[df[target_col] == label]
        groups = list(label_df[group_col].unique())
        rng.shuffle(groups)

        n_groups = len(groups)
        n_train = max(1, int(round(n_groups * train_ratio)))
        n_val = max(1, int(round(n_groups * val_ratio)))

        # Ensure all splits get at least 1 group
        if n_train + n_val >= n_groups:
            n_train = max(1, n_groups - 2)
            n_val = 1
        n_test = n_groups - (n_train + n_val)
        if n_test <= 0:
            n_test = 1
            n_train -= 1

        train_groups = set(groups[:n_train])
        val_groups = set(groups[n_train:n_train + n_val])
        test_groups = set(groups[n_train + n_val:])

        train_indices.extend(label_df[label_df[group_col].isin(train_groups)].index)
        val_indices.extend(label_df[label_df[group_col].isin(val_groups)].index)
        test_indices.extend(label_df[label_df[group_col].isin(test_groups)].index)

    return df.loc[train_indices], df.loc[val_indices], df.loc[test_indices]


class TextCombiner:
    """Helper transformer to merge chief complaint and symptoms."""
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        cc = X['chief_complaint'].fillna('').astype(str)
        sym = X['symptoms'].fillna('').astype(str)
        return cc + " " + sym


def create_preprocessor(tfidf_max_features=500, tfidf_ngram=(1, 2)):
    text_pipe = Pipeline([
        ('vectorizer', TfidfVectorizer(
            ngram_range=tfidf_ngram,
            max_features=tfidf_max_features,
            min_df=2,
            strip_accents='unicode',
        ))
    ])

    num_pipe = Pipeline([
        ('imputer', SimpleImputer(strategy='median', add_indicator=True)),
        ('scaler', StandardScaler()),
    ])

    cat_pipe = Pipeline([
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False)),
    ])

    preprocessor = ColumnTransformer([
        ('text', text_pipe, 'combined_text'),
        ('num', num_pipe, NUMERIC_FEATURES),
        ('cat', cat_pipe, CATEGORICAL_FEATURES),
    ])

    return preprocessor


def main():
    print("=" * 60)
    print("TRIAGEBRIDGE URGENCY MODEL TRAINING PIPELINE")
    print("=" * 60)

    dataset_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'training', 'triage_cases_v2.csv')
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at: {dataset_path}")

    dataset_hash = compute_sha256(dataset_path)
    print(f"Dataset: {dataset_path}")
    print(f"SHA-256: {dataset_hash}")

    df_raw = pd.read_csv(dataset_path)
    print(f"Total raw encounters in CSV: {len(df_raw)}")

    # 1. Leakage Guardrail
    validate_leakage_safety(ALL_INTAKE_FEATURES)

    # 2. Filter GREY cases
    grey_cases = df_raw[df_raw[TARGET_COL] == 'GREY']
    print(f"Deterministic Gating GREY cases reserved: {len(grey_cases)} (excluded from model training)")

    df = df_raw[df_raw[TARGET_COL].isin(TARGET_CLASSES)].copy().reset_index(drop=True)
    print(f"Target-eligible encounters (RED/YELLOW/GREEN): {len(df)}")
    print(f"Class counts:\n{df[TARGET_COL].value_counts().to_dict()}")

    # 3. Near-Duplicate & Group Identification
    exact_duplicates_count = int(df.duplicated(subset=ALL_INTAKE_FEATURES).sum())
    print(f"\n[NEAR-DUPLICATE PROTECTION] Exact duplicate cases: {exact_duplicates_count}")

    df['narrative_group'] = build_narrative_groups(df)
    n_groups = df['narrative_group'].nunique()
    print(f"[NEAR-DUPLICATE PROTECTION] Identified {n_groups} distinct narrative groups across {len(df)} records.")
    print(f"[SPLIT METHOD] Group-Stratified Split: keeping template/near-duplicate narrative groups strictly within individual splits.")

    # 4. Group-Stratified Split (Train 70%, Val 15%, Test 15%)
    train_df, val_df, test_df = group_stratified_split(
        df,
        group_col='narrative_group',
        target_col=TARGET_COL,
        train_ratio=0.70,
        val_ratio=0.15,
        test_ratio=0.15,
        seed=RANDOM_SEED
    )

    # Verify ZERO group contamination across splits
    train_groups = set(train_df['narrative_group'])
    val_groups = set(val_df['narrative_group'])
    test_groups = set(test_df['narrative_group'])

    assert len(train_groups.intersection(val_groups)) == 0, "LEAKAGE: Train and Val share narrative groups!"
    assert len(train_groups.intersection(test_groups)) == 0, "LEAKAGE: Train and Test share narrative groups!"
    assert len(val_groups.intersection(test_groups)) == 0, "LEAKAGE: Val and Test share narrative groups!"
    print("[SPLIT INTEGRITY] PASSED: ZERO narrative group overlap between train, val, and test splits.")

    split_summary = {
        "random_seed": RANDOM_SEED,
        "dataset_hash": dataset_hash,
        "split_method": "group_stratified_split",
        "exact_duplicates_count": exact_duplicates_count,
        "narrative_groups_count": n_groups,
        "narrative_group_leakage_between_splits": 0,
        "total_target_records": len(df),
        "total_grey_records": len(grey_cases),
        "train_count": len(train_df),
        "val_count": len(val_df),
        "test_count": len(test_df),
        "train_class_distribution": train_df[TARGET_COL].value_counts().to_dict(),
        "val_class_distribution": val_df[TARGET_COL].value_counts().to_dict(),
        "test_class_distribution": test_df[TARGET_COL].value_counts().to_dict(),
    }
    print(f"\nSplit Distribution:")
    print(f"  Train: {len(train_df)} cases ({split_summary['train_class_distribution']})")
    print(f"  Val:   {len(val_df)} cases ({split_summary['val_class_distribution']})")
    print(f"  Test:  {len(test_df)} cases ({split_summary['test_class_distribution']})")

    # 5. Feature Preparation
    for split_data in [train_df, val_df, test_df]:
        split_data['combined_text'] = split_data['chief_complaint'].fillna('') + ' ' + split_data['symptoms'].fillna('')

    X_train = train_df[['combined_text'] + NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y_train = train_df[TARGET_COL]

    X_val = val_df[['combined_text'] + NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y_val = val_df[TARGET_COL]

    X_test = test_df[['combined_text'] + NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y_test = test_df[TARGET_COL]

    # Verify ZERO leakage into final feature matrices
    validate_leakage_safety(X_train.columns)
    validate_leakage_safety(X_val.columns)
    validate_leakage_safety(X_test.columns)

    # 6. Baseline: Dummy Classifier
    dummy = DummyClassifier(strategy='most_frequent')
    dummy.fit(X_train, y_train)
    dummy_val_preds = dummy.predict(X_val)
    dummy_val_macro_f1 = f1_score(y_val, dummy_val_preds, average='macro')
    dummy_val_acc = balanced_accuracy_score(y_val, dummy_val_preds)
    print(f"\nDummy Baseline (Validation) -> Balanced Acc: {dummy_val_acc:.4f}, Macro F1: {dummy_val_macro_f1:.4f}")

    # 7. Model Selection on Validation Set
    print("\n--- Tuning Candidates on Validation Set ---")
    candidate_results = []
    best_candidate = None
    best_val_score = -1.0

    # Grid search over Logistic Regression hyperparams
    for c_val in [0.1, 0.5, 1.0, 5.0]:
        for max_feats in [250, 500]:
            for ngrams in [(1, 1), (1, 2)]:
                preprocessor = create_preprocessor(tfidf_max_features=max_feats, tfidf_ngram=ngrams)
                clf = LogisticRegression(
                    C=c_val,
                    class_weight='balanced',
                    solver='lbfgs',
                    max_iter=1000,
                    random_state=RANDOM_SEED
                )
                pipe = Pipeline([
                    ('preprocessor', preprocessor),
                    ('classifier', clf)
                ])

                pipe.fit(X_train, y_train)
                val_preds = pipe.predict(X_val)
                val_macro_f1 = f1_score(y_val, val_preds, average='macro')
                val_bal_acc = balanced_accuracy_score(y_val, val_preds)

                candidate_results.append({
                    "model": "LogisticRegression",
                    "C": c_val,
                    "max_features": max_feats,
                    "ngrams": ngrams,
                    "val_macro_f1": float(val_macro_f1),
                    "val_balanced_acc": float(val_bal_acc)
                })

                if val_macro_f1 > best_val_score:
                    best_val_score = val_macro_f1
                    best_candidate = {
                        "pipe": pipe,
                        "params": {"C": c_val, "max_features": max_feats, "ngrams": ngrams},
                        "macro_f1": val_macro_f1,
                        "model_name": "Class-Weighted Multinomial Logistic Regression"
                    }

    # Compare with Tree-based model (Random Forest)
    rf_pipe = Pipeline([
        ('preprocessor', create_preprocessor(tfidf_max_features=250, tfidf_ngram=(1, 1))),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=6, class_weight='balanced', random_state=RANDOM_SEED))
    ])
    rf_pipe.fit(X_train, y_train)
    rf_val_preds = rf_pipe.predict(X_val)
    rf_val_macro_f1 = f1_score(y_val, rf_val_preds, average='macro')
    rf_val_bal_acc = balanced_accuracy_score(y_val, rf_val_preds)
    candidate_results.append({
        "model": "RandomForestClassifier",
        "n_estimators": 100,
        "max_depth": 6,
        "val_macro_f1": float(rf_val_macro_f1),
        "val_balanced_acc": float(rf_val_bal_acc)
    })

    print(f"Best Logistic Regression Validation Macro-F1: {best_candidate['macro_f1']:.4f} (Params: {best_candidate['params']})")
    print(f"Random Forest Validation Macro-F1: {rf_val_macro_f1:.4f}")

    # Preference: Choose simplest model (Logistic Regression) as required
    selected_pipeline = best_candidate['pipe']
    selected_params = best_candidate['params']
    print(f"Selected Final Model: {best_candidate['model_name']}")

    # 8. Single-Pass Held-out Test Evaluation
    print("\n--- Evaluating Selected Model on Touched-Once Held-out Test Set ---")
    y_test_pred = selected_pipeline.predict(X_test)
    y_test_proba = selected_pipeline.predict_proba(X_test)

    # Dummy test baseline
    dummy_test_preds = dummy.predict(X_test)
    dummy_test_macro_f1 = float(f1_score(y_test, dummy_test_preds, average='macro'))
    dummy_test_acc = float(balanced_accuracy_score(y_test, dummy_test_preds))

    # Test Metrics
    test_macro_f1 = float(f1_score(y_test, y_test_pred, average='macro'))
    test_bal_acc = float(balanced_accuracy_score(y_test, y_test_pred))

    per_class_precision = precision_score(y_test, y_test_pred, labels=TARGET_CLASSES, average=None)
    per_class_recall = recall_score(y_test, y_test_pred, labels=TARGET_CLASSES, average=None)
    per_class_f1 = f1_score(y_test, y_test_pred, labels=TARGET_CLASSES, average=None)

    cm = confusion_matrix(y_test, y_test_pred, labels=TARGET_CLASSES)

    # Audit RED false negatives: True label is RED, predicted as YELLOW or GREEN
    red_idx = TARGET_CLASSES.index('RED')
    red_total = np.sum(cm[red_idx, :])
    red_true_positives = cm[red_idx, red_idx]
    red_false_negatives = int(red_total - red_true_positives)

    pred_distribution = pd.Series(y_test_pred).value_counts().to_dict()

    print(f"\n============================================================")
    print("MANDATORY NOTICE: Experimental prototype trained on synthetic data. Not clinically validated.")
    print("============================================================")
    print("SYNTHETIC DATA & SPLIT BIAS DISCUSSION:")
    print("Partition balance and zero near-duplicate group leakage do NOT imply clinical or statistical")
    print("validity in real hospital triage. Synthetic narratives feature constrained lexical templates,")
    print("and real-world clinical performance may degrade significantly on unstructured or colloquial inputs.")
    print("Qualified healthcare-worker clinical examination is mandatory on every case.")
    print("============================================================")
    print(f"Test Balanced Accuracy : {test_bal_acc:.4f} (Dummy: {dummy_test_acc:.4f})")
    print(f"Test Macro F1          : {test_macro_f1:.4f} (Dummy: {dummy_test_macro_f1:.4f})")
    print(f"RED False Negatives    : {red_false_negatives} out of {red_total} RED test cases")
    print(f"Prediction Distribution: {pred_distribution}")
    print(f"\nConfusion Matrix (labels={TARGET_CLASSES}):\n{cm}")

    clf_report = classification_report(y_test, y_test_pred, labels=TARGET_CLASSES, digits=4)
    print("\nClassification Report:\n" + clf_report)

    # 9. Save Outputs
    os.makedirs('ml/models', exist_ok=True)
    os.makedirs('ml/reports', exist_ok=True)

    # Model artifact
    model_path = 'ml/models/urgency_model.joblib'
    joblib.dump(selected_pipeline, model_path)
    print(f"Saved model to: {model_path}")

    # Comprehensive evaluation structure
    evaluation_data = {
        "mandatory_disclaimer": "Experimental prototype trained on synthetic data. Not clinically validated.",
        "balanced_accuracy": test_bal_acc,
        "macro_f1": test_macro_f1,
        "red_false_negatives": red_false_negatives,
        "red_total_test_cases": int(red_total),
        "per_class": {
            cls: {
                "precision": float(per_class_precision[i]),
                "recall": float(per_class_recall[i]),
                "f1": float(per_class_f1[i]),
                "support": int(np.sum(y_test == cls))
            }
            for i, cls in enumerate(TARGET_CLASSES)
        },
        "confusion_matrix": cm.tolist(),
        "confusion_matrix_labels": TARGET_CLASSES,
        "prediction_distribution": {cls: int(pred_distribution.get(cls, 0)) for cls in TARGET_CLASSES},
        "ground_truth_distribution": y_test.value_counts().to_dict(),
        "comparison_with_dummy": {
            "dummy_strategy": "most_frequent",
            "dummy_balanced_accuracy": dummy_test_acc,
            "dummy_macro_f1": dummy_test_macro_f1,
            "selected_model_balanced_accuracy": test_bal_acc,
            "selected_model_macro_f1": test_macro_f1,
            "balanced_accuracy_gain": test_bal_acc - dummy_test_acc,
            "macro_f1_gain": test_macro_f1 - dummy_test_macro_f1
        },
        "synthetic_template_bias_discussion": (
            "The balanced 70/15/15 group-stratified split isolates narrative template groups and prevents "
            "near-duplicate leakage, but does NOT make the model statistically or clinically valid for "
            "real-world clinical practice. Synthetic datasets possess low linguistic variance compared to "
            "unconstrained clinical conversations."
        )
    }

    # Metadata
    metadata = {
        "model_name": "TriageBridge Experimental Urgency Classifier",
        "model_version": "1.0.0-synthetic-prototype",
        "model_type": "Class-Weighted Multinomial Logistic Regression",
        "training_timestamp": pd.Timestamp.now().isoformat(),
        "dataset_name": "triage_cases_v2.csv",
        "dataset_sha256": dataset_hash,
        "dataset_size": len(df_raw),
        "dataset_size_total": len(df_raw),
        "feature_list": ALL_INTAKE_FEATURES,
        "input_features": {
            "text": TEXT_FEATURES,
            "numeric": NUMERIC_FEATURES,
            "categorical": CATEGORICAL_FEATURES
        },
        "excluded_leakage_fields": FORBIDDEN_LEAKAGE_COLUMNS,
        "target_classes": TARGET_CLASSES,
        "class_counts": df_raw[TARGET_COL].value_counts().to_dict(),
        "class_counts_eligible": df[TARGET_COL].value_counts().to_dict(),
        "split_counts": {
            "train": len(train_df),
            "validation": len(val_df),
            "test": len(test_df)
        },
        "random_seed": RANDOM_SEED,
        "selected_hyperparameters": selected_params,
        "test_metrics": evaluation_data,
        "red_false_negative_count": red_false_negatives,
        "known_limitations": [
            "Trained exclusively on synthetic patient encounters.",
            "Synthetic template bias: limited lexical variability compared to unconstrained clinical speech.",
            "Probabilities represent raw uncalibrated model scores and must NOT be interpreted as clinical confidence.",
            "Must never override deterministic clinical red flags.",
            "Deterministic GREY gating for critical missing data operates upstream of this model."
        ],
        "synthetic_data_warning": "Experimental prototype trained on synthetic data. Not clinically validated.",
        "not_clinically_validated_warning": "Not clinically validated. Must never be used for autonomous clinical triage without healthcare-worker review.",
        "clinical_validation_status": "NOT_CLINICALLY_VALIDATED",
        "mandatory_disclaimer": "Experimental prototype trained on synthetic data. Not clinically validated. Requires healthcare-worker review for every patient."
    }

    with open('ml/models/model_metadata.json', 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    with open('ml/reports/evaluation.json', 'w', encoding='utf-8') as f:
        json.dump(evaluation_data, f, indent=2)

    with open('ml/reports/data_split_summary.json', 'w', encoding='utf-8') as f:
        json.dump(split_summary, f, indent=2)

    with open('ml/reports/classification_report.txt', 'w', encoding='utf-8') as f:
        f.write("TRIAGEBRIDGE CLASSIFICATION REPORT (HELD-OUT TEST SET)\n")
        f.write("=" * 60 + "\n")
        f.write("NOTICE: Experimental prototype trained on synthetic data. Not clinically validated.\n")
        f.write(f"Model: {metadata['model_type']}\n")
        f.write(f"Dataset SHA-256: {dataset_hash}\n")
        f.write(f"Disclaimer: {metadata['mandatory_disclaimer']}\n\n")
        f.write("DISCUSSION ON SPLIT VALIDITY & SYNTHETIC BIAS:\n")
        f.write("While group-stratified partitioning ensures zero near-duplicate narrative leakage between\n")
        f.write("splits, balanced class frequencies do NOT constitute clinical or statistical validity in\n")
        f.write("real-world settings. Synthetic data lacks true clinical entropy, unmodeled comorbidities,\n")
        f.write("and natural language ambiguities. Real-world generalization remains strictly unvalidated.\n\n")
        f.write(clf_report)

    # Confusion matrix plot
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    ax.figure.colorbar(im, ax=ax)
    ax.set(
        xticks=np.arange(cm.shape[1]),
        yticks=np.arange(cm.shape[0]),
        xticklabels=TARGET_CLASSES,
        yticklabels=TARGET_CLASSES,
        ylabel='True Label',
        xlabel='Predicted Label',
        title='Confusion Matrix (Untouched Test Set)'
    )
    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, format(cm[i, j], 'd'),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black")
    fig.tight_layout()
    plt.savefig('ml/reports/confusion_matrix.png', dpi=150)
    plt.close()
    print("Saved confusion matrix image to: ml/reports/confusion_matrix.png")
    print("\nTraining and evaluation successfully completed.")


if __name__ == '__main__':
    main()
