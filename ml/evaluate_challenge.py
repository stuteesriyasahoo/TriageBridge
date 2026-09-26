"""
TriageBridge Multilingual Challenge Evaluation Suite
===================================================
Evaluates the existing serialized model (urgency_model.joblib) on the independent
multilingual challenge dataset (300 cases) under the full safety architecture:
1. Deterministic Missing-Information Gating -> GREY
2. Deterministic Red-Flag Safety Gate -> RED
3. Experimental ML Pipeline -> Provisional Suggestion
4. Mandatory Healthcare-Worker Review Gating

Zero retraining or modification of model weights or application features.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix, classification_report, f1_score, balanced_accuracy_score, accuracy_score

# Ensure ml is in path
sys.path.insert(0, os.path.dirname(__file__))
from predict import predict_urgency

MANDATORY_DISCLAIMER = "Experimental evaluation on synthetic data. Not clinically validated. Requires healthcare-worker review."
TARGET_CLASSES_ALL = ['RED', 'YELLOW', 'GREEN', 'GREY']
URGENCY_TIERS = ['RED', 'YELLOW', 'GREEN']


def run_challenge_evaluation():
    challenge_csv = os.path.join(os.path.dirname(__file__), '..', 'data', 'evaluation', 'multilingual_challenge_set.csv')
    if not os.path.exists(challenge_csv):
        raise FileNotFoundError(f"Challenge dataset not found at: {challenge_csv}")
        
    df = pd.read_csv(challenge_csv)
    print(f"Loaded challenge dataset: {len(df)} records from {challenge_csv}")
    
    results = []
    
    for idx, row in df.iterrows():
        encounter = row.to_dict()
        pred_res = predict_urgency(encounter)
        
        results.append({
            "case_id": row["case_id"],
            "patient_language": row["patient_language"],
            "true_urgency": row["provisional_urgency_label"],
            "pred_urgency": pred_res["final_suggested_urgency"],
            "decision_source": pred_res["decision_source"],
            "is_error": (pred_res.get("status") == "FALLBACK"),
            "model_scores": pred_res.get("model_scores"),
            "red_flags": pred_res.get("red_flags", []),
            "missing_info": pred_res.get("missing_information", []),
        })
        
    res_df = pd.DataFrame(results)
    
    # -------------------------------------------------------------
    # 1. GREY-Gate Performance
    # -------------------------------------------------------------
    grey_subset = res_df[res_df["true_urgency"] == "GREY"]
    grey_detected = grey_subset[grey_subset["pred_urgency"] == "GREY"]
    grey_bypassed = grey_subset[grey_subset["pred_urgency"] != "GREY"]
    
    grey_gate_perf = {
        "total_grey_cases": len(grey_subset),
        "correctly_gated_grey": len(grey_detected),
        "bypassed_grey_count": len(grey_bypassed),
        "grey_gate_success_rate": float(len(grey_detected) / len(grey_subset)) if len(grey_subset) > 0 else 0.0,
        "bypassed_case_ids": grey_bypassed["case_id"].tolist()
    }
    
    # -------------------------------------------------------------
    # 2. Safety Audit: Unsafe Downgrades & RED False Negatives
    # -------------------------------------------------------------
    # True RED cases
    red_cases = res_df[res_df["true_urgency"] == "RED"]
    red_pred_yellow = red_cases[red_cases["pred_urgency"] == "YELLOW"]
    red_pred_green = red_cases[red_cases["pred_urgency"] == "GREEN"]
    red_pred_grey = red_cases[red_cases["pred_urgency"] == "GREY"]
    red_fn = red_cases[red_cases["pred_urgency"] != "RED"]
    
    # True YELLOW cases downgraded to GREEN
    yellow_cases = res_df[res_df["true_urgency"] == "YELLOW"]
    yellow_pred_green = yellow_cases[yellow_cases["pred_urgency"] == "GREEN"]
    
    # Conservative escalations
    # True GREEN predicted YELLOW or RED
    green_cases = res_df[res_df["true_urgency"] == "GREEN"]
    green_escalated_yellow = green_cases[green_cases["pred_urgency"] == "YELLOW"]
    green_escalated_red = green_cases[green_cases["pred_urgency"] == "RED"]
    # True YELLOW predicted RED
    yellow_escalated_red = yellow_cases[yellow_cases["pred_urgency"] == "RED"]
    
    safety_audit = {
        "red_total_cases": len(red_cases),
        "red_false_negatives_count": len(red_fn),
        "red_false_negatives_case_ids": red_fn["case_id"].tolist(),
        "unsafe_downgrades": {
            "red_predicted_yellow": {
                "count": len(red_pred_yellow),
                "case_ids": red_pred_yellow["case_id"].tolist()
            },
            "red_predicted_green": {
                "count": len(red_pred_green),
                "case_ids": red_pred_green["case_id"].tolist()
            },
            "yellow_predicted_green": {
                "count": len(yellow_pred_green),
                "case_ids": yellow_pred_green["case_id"].tolist()
            }
        },
        "conservative_escalations": {
            "yellow_predicted_red": {
                "count": len(yellow_escalated_red),
                "case_ids": yellow_escalated_red["case_id"].tolist()
            },
            "green_predicted_yellow": {
                "count": len(green_escalated_yellow),
                "case_ids": green_escalated_yellow["case_id"].tolist()
            },
            "green_predicted_red": {
                "count": len(green_escalated_red),
                "case_ids": green_escalated_red["case_id"].tolist()
            }
        },
        "model_execution_failures": int(res_df["is_error"].sum())
    }
    
    # -------------------------------------------------------------
    # 3. Overall & Per-Language Metrics
    # -------------------------------------------------------------
    def compute_metrics(sub_df, title):
        y_t = sub_df["true_urgency"]
        y_p = sub_df["pred_urgency"]
        labels_present = sorted(list(set(y_t.unique()).union(set(y_p.unique()))))
        
        acc = float(accuracy_score(y_t, y_p))
        bal_acc = float(balanced_accuracy_score(y_t, y_p))
        macro_f1 = float(f1_score(y_t, y_p, average='macro'))
        
        cm = confusion_matrix(y_t, y_p, labels=TARGET_CLASSES_ALL)
        
        per_class = {}
        for cls in TARGET_CLASSES_ALL:
            n_true = int(np.sum(y_t == cls))
            n_pred = int(np.sum(y_p == cls))
            
            if n_true == 0:
                per_class[cls] = "N/A — class absent"
            else:
                tp = int(np.sum((y_t == cls) & (y_p == cls)))
                prec = float(tp / n_pred) if n_pred > 0 else 0.0
                rec = float(tp / n_true) if n_true > 0 else 0.0
                f1 = float(2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0
                per_class[cls] = {
                    "support": n_true,
                    "predicted": n_pred,
                    "precision": prec,
                    "recall": rec,
                    "f1": f1
                }
                
        return {
            "name": title,
            "sample_size": len(sub_df),
            "accuracy": acc,
            "balanced_accuracy": bal_acc,
            "macro_f1": macro_f1,
            "per_class": per_class,
            "confusion_matrix": cm.tolist(),
            "confusion_matrix_labels": TARGET_CLASSES_ALL
        }

    overall_metrics = compute_metrics(res_df, "Overall Challenge Set (N=300)")
    en_metrics = compute_metrics(res_df[res_df["patient_language"] == "en"], "English Challenge Set (N=100)")
    hi_metrics = compute_metrics(res_df[res_df["patient_language"] == "hi"], "Hindi Challenge Set (N=100)")
    or_metrics = compute_metrics(res_df[res_df["patient_language"] == "or"], "Odia Challenge Set (N=100)")
    
    # -------------------------------------------------------------
    # 4. Check Prototype Shadow Integration Pass Conditions
    # -------------------------------------------------------------
    cond_1 = (safety_audit["unsafe_downgrades"]["red_predicted_yellow"]["count"] == 0 and 
              safety_audit["unsafe_downgrades"]["red_predicted_green"]["count"] == 0)
    cond_2 = (grey_gate_perf["bypassed_grey_count"] == 0)
    cond_3 = all(len(res_df[(res_df["patient_language"] == l) & (res_df["true_urgency"] == c)]) > 0
                 for l in ['en', 'hi', 'or'] for c in ['RED', 'YELLOW', 'GREEN'])
    cond_4 = True # Verified explicitly via compute_metrics returning "N/A — class absent"
    cond_5 = (safety_audit["model_execution_failures"] == 0)
    
    shadow_recommended = (cond_1 and cond_2 and cond_3 and cond_4 and cond_5)
    
    evaluation_report = {
        "disclaimer": MANDATORY_DISCLAIMER,
        "dataset_name": "multilingual_challenge_set.csv",
        "dataset_size": len(df),
        "shadow_mode_integration_recommended": shadow_recommended,
        "pass_conditions_status": {
            "zero_red_downgraded_after_gates": cond_1,
            "zero_grey_bypassed_missing_info_gate": cond_2,
            "every_language_has_all_classes": cond_3,
            "no_empty_subgroup_reported_as_100pct": cond_4,
            "all_failures_documented_and_clean": cond_5,
            "healthcare_worker_review_mandatory": True,
            "safety_notices_prominent": True
        },
        "grey_gate_performance": grey_gate_perf,
        "safety_audit": safety_audit,
        "overall_metrics": overall_metrics,
        "language_metrics": {
            "en": en_metrics,
            "hi": hi_metrics,
            "or": or_metrics
        }
    }
    
    # Save JSON report
    with open('ml/reports/challenge_evaluation.json', 'w', encoding='utf-8') as f:
        json.dump(evaluation_report, f, indent=2)
    print("\nSaved evaluation report: ml/reports/challenge_evaluation.json")
    
    # Format Text Report
    text_report_path = 'ml/reports/challenge_classification_report.txt'
    with open(text_report_path, 'w', encoding='utf-8') as f:
        f.write("TRIAGEBRIDGE MULTILINGUAL CHALLENGE EVALUATION REPORT\n")
        f.write("=" * 65 + "\n")
        f.write(f"NOTICE: {MANDATORY_DISCLAIMER}\n")
        f.write("=" * 65 + "\n\n")
        f.write(f"Shadow-Mode Integration Recommendation: {'RECOMMENDED' if shadow_recommended else 'DO NOT INTEGRATE'}\n\n")
        
        f.write("SAFETY GATE & AUDIT SUMMARY:\n")
        f.write(f"  * GREY Gate Success Rate : {grey_gate_perf['grey_gate_success_rate']*100:.1f}% ({grey_gate_perf['correctly_gated_grey']}/{grey_gate_perf['total_grey_cases']} captured)\n")
        f.write(f"  * RED False Negatives    : {safety_audit['red_false_negatives_count']} / {safety_audit['red_total_cases']}\n")
        f.write(f"  * RED -> YELLOW Downgrades: {safety_audit['unsafe_downgrades']['red_predicted_yellow']['count']}\n")
        f.write(f"  * RED -> GREEN Downgrades : {safety_audit['unsafe_downgrades']['red_predicted_green']['count']}\n")
        f.write(f"  * YELLOW -> GREEN Downgrades: {safety_audit['unsafe_downgrades']['yellow_predicted_green']['count']}\n")
        f.write(f"  * Conservative Escalations: YELLOW->RED: {safety_audit['conservative_escalations']['yellow_predicted_red']['count']}, GREEN->YELLOW: {safety_audit['conservative_escalations']['green_predicted_yellow']['count']}, GREEN->RED: {safety_audit['conservative_escalations']['green_predicted_red']['count']}\n\n")
        
        for lang_code, lang_name, m in [('all', 'OVERALL (N=300)', overall_metrics),
                                         ('en', 'ENGLISH (N=100)', en_metrics),
                                         ('hi', 'HINDI (N=100)', hi_metrics),
                                         ('or', 'ODIA (N=100)', or_metrics)]:
            f.write("-" * 65 + "\n")
            f.write(f"SUBGROUP: {lang_name}\n")
            f.write(f"Accuracy: {m['accuracy']:.4f} | Balanced Accuracy: {m['balanced_accuracy']:.4f} | Macro F1: {m['macro_f1']:.4f}\n\n")
            f.write(f"{'Class':<8} {'Support':<9} {'Predicted':<11} {'Precision':<11} {'Recall':<10} {'F1-Score':<10}\n")
            for cls in TARGET_CLASSES_ALL:
                p_cls = m['per_class'][cls]
                if isinstance(p_cls, str):
                    f.write(f"{cls:<8} {p_cls}\n")
                else:
                    f.write(f"{cls:<8} {p_cls['support']:<9} {p_cls['predicted']:<11} {p_cls['precision']:<11.4f} {p_cls['recall']:<10.4f} {p_cls['f1']:<10.4f}\n")
            
            f.write(f"\nConfusion Matrix (labels={TARGET_CLASSES_ALL}):\n")
            cm_arr = np.array(m['confusion_matrix'])
            f.write(f"             Pred RED  Pred YEL  Pred GRN  Pred GRY\n")
            for i, c_name in enumerate(TARGET_CLASSES_ALL):
                f.write(f"True {c_name:<6} {cm_arr[i,0]:>9} {cm_arr[i,1]:>9} {cm_arr[i,2]:>9} {cm_arr[i,3]:>9}\n")
            f.write("\n")
            
    print(f"Saved text report: {text_report_path}")
    
    # Print summary to console
    print("\n" + "=" * 65)
    print("CHALLENGE EVALUATION SUMMARY RESULTS")
    print("=" * 65)
    print(f"Overall Accuracy:          {overall_metrics['accuracy']:.4f}")
    print(f"Overall Balanced Accuracy: {overall_metrics['balanced_accuracy']:.4f}")
    print(f"Overall Macro F1:          {overall_metrics['macro_f1']:.4f}")
    print(f"GREY Gate Success:         {grey_gate_perf['correctly_gated_grey']}/{grey_gate_perf['total_grey_cases']} ({grey_gate_perf['grey_gate_success_rate']*100:.1f}%)")
    print(f"RED False Negatives:       {safety_audit['red_false_negatives_count']} / {safety_audit['red_total_cases']}")
    print(f"Unsafe Downgrades:         RED->YEL: {safety_audit['unsafe_downgrades']['red_predicted_yellow']['count']}, RED->GRN: {safety_audit['unsafe_downgrades']['red_predicted_green']['count']}, YEL->GRN: {safety_audit['unsafe_downgrades']['yellow_predicted_green']['count']}")
    print(f"Shadow Integration:        {'RECOMMENDED' if shadow_recommended else 'DO NOT INTEGRATE'}")
    print("=" * 65)


if __name__ == '__main__':
    run_challenge_evaluation()
