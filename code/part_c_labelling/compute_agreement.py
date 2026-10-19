# ============================================================
# Part C: Inter-Annotator Agreement Calculator
# CS203 Assignment 1 - Project 5: Voice Helpdesk ASR
#
# Transcript: WER between annotators (jiwer)
# Intent:     Cohen's kappa (sklearn)
#
# Gold test set: clips where BOTH annotators fully agree.
# Once frozen, DO NOT use gold_test_set.csv for tuning in A1 or A2.
# ============================================================

import json
import pandas as pd
import numpy as np
from pathlib import Path

EXPORTS_DIR  = Path("supporting_files/label_studio_exports")
AGREE_DIR    = Path("supporting_files/agreement_calculations")
GOLD_SET     = Path("data/gold_test_set.csv")
AGREE_DIR.mkdir(parents=True, exist_ok=True)

def load_label_studio_export(filepath):
    """Parse Label Studio JSON export into DataFrame with clip_id, transcript, intent."""
    import json
    with open(filepath, encoding="utf-8") as f:
        data = json.load(f)
    rows = []
    for item in data:
        clip_id = item.get("data", {}).get("clip_id", item.get("id",""))
        transcript = ""
        intent = ""
        for ann in item.get("annotations", []):
            for result in ann.get("result", []):
                if result.get("from_name") == "transcript":
                    transcript = result["value"].get("text",[""])[0]
                elif result.get("from_name") == "intent":
                    intent = result["value"].get("choices",[""])[0]
        rows.append({"clip_id": str(clip_id), "transcript": transcript, "intent": intent})
    return pd.DataFrame(rows)

def _levenshtein_wer(ref, hyp):
    r_words = ref.split()
    h_words = hyp.split()
    if not r_words: return 0.0 if not h_words else 1.0
    d = np.zeros((len(r_words) + 1, len(h_words) + 1), dtype=int)
    for i in range(len(r_words) + 1): d[i, 0] = i
    for j in range(len(h_words) + 1): d[0, j] = j
    for i in range(1, len(r_words) + 1):
        for j in range(1, len(h_words) + 1):
            if r_words[i-1] == h_words[j-1]:
                d[i, j] = d[i-1, j-1]
            else:
                d[i, j] = min(d[i-1, j] + 1, d[i, j-1] + 1, d[i-1, j-1] + 1)
    return float(d[len(r_words), len(h_words)]) / float(len(r_words))

def compute_wer_scores(df_a, df_b):
    """Compute WER between two annotators for overlapping clips."""
    try:
        from jiwer import wer
    except ImportError:
        wer = _levenshtein_wer
    merged = df_a.merge(df_b, on="clip_id", suffixes=("_a","_b"))
    results = {}
    wer_scores = []
    for _, row in merged.iterrows():
        ref = row["transcript_a"].strip().lower()
        hyp = row["transcript_b"].strip().lower()
        if not ref: continue
        score = wer(ref, hyp)
        wer_scores.append(score)
        results[row["clip_id"]] = score
    if wer_scores:
        print(f"\nTranscript WER (n={len(wer_scores)} clips):")
        print(f"  Mean WER:   {np.mean(wer_scores):.3f}")
        print(f"  Median WER: {np.median(wer_scores):.3f}")
        print(f"  Std WER:    {np.std(wer_scores):.3f}")
        worst = sorted(results.items(), key=lambda x: x[1], reverse=True)[:10]
        print(f"\nWorst 10 clips (highest WER):")
        for cid, score in worst:
            row_a = merged[merged["clip_id"]==cid][["transcript_a","transcript_b"]].iloc[0]
            print(f"  {cid}: WER={score:.3f}")
            print(f"    A: {row_a['transcript_a']}")
            print(f"    B: {row_a['transcript_b']}")
    return results, np.mean(wer_scores) if wer_scores else None

def compute_kappa(df_a, df_b):
    """Compute Cohen's kappa for intent labels."""
    from sklearn.metrics import cohen_kappa_score, confusion_matrix
    merged = df_a.merge(df_b, on="clip_id", suffixes=("_a","_b"))
    merged = merged.dropna(subset=["intent_a","intent_b"])
    merged = merged[(merged["intent_a"] != "") & (merged["intent_b"] != "")]
    if merged.empty:
        print("No overlapping intent labels found."); return None, []
    kappa = cohen_kappa_score(merged["intent_a"], merged["intent_b"])
    print(f"\nIntent Cohen's Kappa: {kappa:.3f}")
    labels = sorted(merged["intent_a"].unique().tolist())
    cm = confusion_matrix(merged["intent_a"], merged["intent_b"], labels=labels)
    print(f"Confusion Matrix (rows=A, cols=B):")
    print(f"Labels: {labels}")
    print(cm)
    # Find disagreements
    disagreements = merged[merged["intent_a"] != merged["intent_b"]][
        ["clip_id","intent_a","intent_b"]].head(10)
    print(f"\nTop 10 intent disagreements:")
    print(disagreements.to_string(index=False))
    return kappa, disagreements.to_dict("records")

def freeze_gold_set(df_a, df_b):
    """Freeze gold test set: clips where both annotators agree exactly."""
    merged = df_a.merge(df_b, on="clip_id", suffixes=("_a","_b"))
    gold = merged[
        (merged["transcript_a"].str.strip().str.lower() ==
         merged["transcript_b"].str.strip().str.lower()) &
        (merged["intent_a"] == merged["intent_b"])
    ].copy()
    gold["transcript"] = gold["transcript_a"]
    gold["intent"] = gold["intent_a"]
    gold = gold[["clip_id","transcript","intent"]]
    GOLD_SET.parent.mkdir(parents=True, exist_ok=True)
    gold.to_csv(GOLD_SET, index=False)
    print(f"\nGold test set frozen: {len(gold)} clips -> {GOLD_SET}")
    print("NEVER use gold_test_set.csv for tuning in A1 or A2.")
    return gold

def run_round(round_name, export_a, export_b):
    print(f"\n{'='*60}")
    print(f"Round: {round_name}")
    print(f"{'='*60}")
    if not Path(export_a).exists() or not Path(export_b).exists():
        print(f"Export files not found - skipping {round_name}")
        print(f"  Expected: {export_a}")
        print(f"  Expected: {export_b}")
        return None, None
    df_a = load_label_studio_export(export_a)
    df_b = load_label_studio_export(export_b)
    wer_results, mean_wer = compute_wer_scores(df_a, df_b)
    kappa, disagreements = compute_kappa(df_a, df_b)
    return mean_wer, kappa

def main():
    r1_a = EXPORTS_DIR / "round1_annotator_a.json"
    r1_b = EXPORTS_DIR / "round1_annotator_b.json"
    r2_a = EXPORTS_DIR / "round2_annotator_a.json"
    r2_b = EXPORTS_DIR / "round2_annotator_b.json"

    wer1, kappa1 = run_round("Round 1 (Guidelines v1)", r1_a, r1_b)
    wer2, kappa2 = run_round("Round 2 (Guidelines v2)", r2_a, r2_b)

    print(f"\n=== Agreement Improvement ===")
    print(f"{'Metric':<20} {'Before (v1)':<15} {'After (v2)':<15}")
    print(f"{'WER':<20} {str(round(wer1,3) if wer1 else 'N/A'):<15} {str(round(wer2,3) if wer2 else 'N/A'):<15}")
    print(f"{'Kappa':<20} {str(round(kappa1,3) if kappa1 else 'N/A'):<15} {str(round(kappa2,3) if kappa2 else 'N/A'):<15}")

    # Save report
    report = {"round1": {"mean_wer": wer1, "kappa": kappa1},
              "round2": {"mean_wer": wer2, "kappa": kappa2}}
    out = AGREE_DIR / "agreement_report.json"
    with open(out,"w") as f: json.dump(report, f, indent=2)
    print(f"\nReport saved: {out}")

    # Freeze gold set from Round 2 (more refined labels)
    if r2_a.exists() and r2_b.exists():
        df_a = load_label_studio_export(r2_a)
        df_b = load_label_studio_export(r2_b)
        freeze_gold_set(df_a, df_b)

if __name__ == "__main__": main()
