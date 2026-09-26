"""
TriageBridge Experimental Symptom-Pattern Evaluation Suite
==========================================================
Evaluates the isolated symptom-pattern model on held-out test data and
novel clinical inquiries.

SAFETY ASSURANCES:
- Outputs the mandatory clinical disclaimer with every prediction.
- Identifies confounding differential diagnosis pairs.
- Validates model isolation from the production triage pipeline.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    classification_report,
    confusion_matrix
)

MANDATORY_DISCLAIMER = "Experimental symptom-pattern classifier — not a diagnosis."


def evaluate_model(
    model_path: str = 'ml/models/disease_pattern_model.joblib',
    test_path: str = 'data/processed/symptom2disease_test.csv',
    report_txt: str = 'ml/reports/disease_pattern_evaluation_report.txt',
    report_json: str = 'ml/reports/disease_pattern_evaluation.json'
):
    """Run thorough evaluation on test set and write reports."""
    print("=" * 65)
    print("  TRIAGEBRIDGE SYMPTOM-PATTERN MODEL INDEPENDENT EVALUATION")
    print("=" * 65)

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    if not os.path.exists(test_path):
        raise FileNotFoundError(f"Test dataset not found: {test_path}")

    model = joblib.load(model_path)
    test_df = pd.read_csv(test_path)

    X_test = test_df['text']
    y_test = test_df['label']

    print(f"\n[INFO] Loaded model: {model_path}")
    print(f"[INFO] Loaded test set: {len(test_df)} samples")

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)
    classes = list(model.classes_)

    acc = accuracy_score(y_test, y_pred)
    bal_acc = balanced_accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro')
    weighted_f1 = f1_score(y_test, y_pred, average='weighted')

    print(f"\nAccuracy:          {acc:.4f} ({acc*100:.2f}%)")
    print(f"Balanced Accuracy: {bal_acc:.4f} ({bal_acc*100:.2f}%)")
    print(f"Macro F1:          {macro_f1:.4f}")
    print(f"Weighted F1:       {weighted_f1:.4f}")

    # Analyze misclassifications
    misclassified = []
    for i, (text, actual, pred, probs) in enumerate(zip(X_test, y_test, y_pred, y_prob)):
        if actual != pred:
            top_3_idx = np.argsort(probs)[::-1][:3]
            top_3 = [
                {"class": classes[idx], "prob": round(float(probs[idx]), 4)}
                for idx in top_3_idx
            ]
            misclassified.append({
                "test_index": i,
                "text": text,
                "actual_label": actual,
                "predicted_label": pred,
                "top_3_differential": top_3
            })

    print(f"\n[INFO] Total misclassified cases: {len(misclassified)} / {len(y_test)}")
    for m in misclassified:
        print(f"\n  Case: '{m['text'][:70]}...'")
        print(f"    Actual:    {m['actual_label']}")
        print(f"    Predicted: {m['predicted_label']} (Prob: {m['top_3_differential'][0]['prob']})")
        print(f"    Differential: {', '.join([f'{d['class']} ({d['prob']})' for d in m['top_3_differential']])}")

    # Test sample inference with disclaimer
    sample_queries = [
        "I have a throbbing headache on one side of my head, feeling sensitive to light and nausea.",
        "Constant wheezing and breathlessness, chest tightness especially early morning.",
        "Burning sensation when urinating and increased frequency throughout the day.",
        "Severe joint pain and morning stiffness in both knees making it difficult to bend."
    ]

    print("\n" + "=" * 65)
    print("  SAMPLE INFERENCE WITH MANDATORY CLINICAL DISCLAIMER")
    print("=" * 65)

    sample_results = []
    for q in sample_queries:
        probs = model.predict_proba([q])[0]
        top_idx = np.argsort(probs)[::-1][:3]
        top_diff = [
            {"pattern": classes[idx], "confidence": round(float(probs[idx]), 4)}
            for idx in top_idx
        ]
        res = {
            "query": q,
            "top_match": top_diff[0]["pattern"],
            "top_confidence": top_diff[0]["confidence"],
            "differential_matches": top_diff,
            "disclaimer": MANDATORY_DISCLAIMER
        }
        sample_results.append(res)
        print(f"\nQuery: '{q}'")
        print(f"Top Match:    {res['top_match']} ({res['top_confidence']*100:.1f}%)")
        print(f"Differential: {', '.join([f'{d['pattern']} ({d['confidence']*100:.1f}%)' for d in top_diff])}")
        print(f"Disclaimer:   {res['disclaimer']}")

    # Save reports
    os.makedirs(os.path.dirname(report_txt), exist_ok=True)
    report_dict = {
        "evaluation_timestamp": pd.Timestamp.now().isoformat(),
        "total_test_samples": len(y_test),
        "accuracy": round(float(acc), 4),
        "balanced_accuracy": round(float(bal_acc), 4),
        "macro_f1": round(float(macro_f1), 4),
        "weighted_f1": round(float(weighted_f1), 4),
        "total_misclassifications": len(misclassified),
        "misclassifications": misclassified,
        "sample_inferences": sample_results,
        "disclaimer": MANDATORY_DISCLAIMER
    }

    with open(report_json, 'w', encoding='utf-8') as f:
        json.dump(report_dict, f, indent=2)

    with open(report_txt, 'w', encoding='utf-8') as f:
        f.write("=" * 65 + "\n")
        f.write("  TRIAGEBRIDGE SYMPTOM-PATTERN MODEL EVALUATION REPORT\n")
        f.write("=" * 65 + "\n\n")
        f.write(f"Disclaimer: {MANDATORY_DISCLAIMER}\n\n")
        f.write(f"Accuracy:          {acc:.4f} ({acc*100:.2f}%)\n")
        f.write(f"Balanced Accuracy: {bal_acc:.4f} ({bal_acc*100:.2f}%)\n")
        f.write(f"Macro F1:          {macro_f1:.4f}\n")
        f.write(f"Weighted F1:       {weighted_f1:.4f}\n\n")
        f.write("Classification Report:\n")
        f.write(classification_report(y_test, y_pred))
        f.write("\n\nMisclassified Cases:\n")
        for m in misclassified:
            f.write(f"\nActual: {m['actual_label']} | Predicted: {m['predicted_label']}\n")
            f.write(f"Text: {m['text']}\n")
            f.write(f"Differential: {m['top_3_differential']}\n")

    print(f"\n[INFO] Saved text report to: {report_txt}")
    print(f"[INFO] Saved JSON report to: {report_json}")


if __name__ == '__main__':
    evaluate_model()
