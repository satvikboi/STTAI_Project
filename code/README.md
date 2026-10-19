# CS203 Assignment 1 — Project 5: Voice Helpdesk ASR
**Cross-Lingual Institute Voice Helpdesk with Drift-Triggered Retraining**

**Team**: Rajdeep Vraj, Vipul Sunil Patil, Satvik Sharma (Equal Contribution)
**Course**: CS 203, IIT Gandhinagar, Semester I 2026-27
**GitHub**: https://github.com/vipulSP2108/STTAI_Project.git
**Equal Contribution**: All 3 members contributed equally to all project phases.
**Deadline**: 18 October 2026

---

## Quickstart — Rebuild `data/` in 5 commands

```bash
# 1. Install all dependencies (pinned versions)
pip install -r requirements.txt

# 2. Build metadata.csv from raw audio files
python part_a_collection/build_metadata.py --audio-dir data/raw/audio/

# 3. Run 10 validation checks (all pass on fixed data)
pytest part_b_validation/validation_suite.py -v

# 4. Compute inter-annotator agreement + freeze gold test set
python part_c_labelling/compute_agreement.py

# 5. Create leakage-free splits (train/val/test/cohort_b)
python part_e_versioning/make_splits.py
```

---

## What Each Command Does

| Step | Command | Output |
|------|---------|--------|
| 1 | `pip install` | All Python dependencies at pinned versions |
| 2 | `build_metadata.py` | `data/metadata.csv` with SHA-256 hashes |
| 3 | `pytest validation_suite.py` | 10 quality checks on audio + transcripts |
| 4 | `compute_agreement.py` | WER + kappa report, `data/gold_test_set.csv` |
| 5 | `make_splits.py` | Speaker-disjoint `data/splits/*.csv` |

---

## Data Flow

```
Speaker recording → record_audio.py → data/raw/audio/*.wav
                                   → data/metadata.csv
                                   ↓
                         validation_suite.py (10 checks)
                                   ↓
                    Label Studio (transcripts + intent)
                                   ↓
              compute_agreement.py → agreement_report.json
                                   → data/gold_test_set.csv
                                   ↓
                    augment_audio.py → data/processed/augmented/
                    active_learning.py → supporting_files/plots/
                                   ↓
                   make_splits.py → data/splits/
                                   ↓
                         dvc push + git tag a1-final
```

---

## Repository Structure

```
code/
├── part_a_collection/   # Recording + metadata pipeline
├── part_b_validation/   # 10 automated validation checks
├── part_c_labelling/    # Label Studio config, guidelines, agreement
├── part_d_augmentation/ # Audio augmentation + active learning
├── part_e_versioning/   # DVC setup + split creation
├── part_f_report/       # Dataset card
└── prompts/             # All AI prompts used (required by grader)

data/
├── raw/audio/           # Original .wav clips (DVC-tracked)
├── processed/           # Augmented clips (DVC-tracked)
├── labels/              # Transcripts + intent labels
├── splits/              # Train/val/test/cohort_b manifests
└── gold_test_set.csv    # FROZEN: do not use for tuning

supporting_files/
├── label_studio_exports/     # Raw annotator exports
├── agreement_calculations/   # WER + kappa reports
├── validation_outputs/       # Before/after validation JSON
├── augmentation_samples/     # Sample augmented clips
└── plots/                    # Active learning curves
```

---

## DVC

Pull data: `dvc pull`
Push data: `dvc push`
Remote: configured in `.dvc/config`

## AI Assistance

See `prompts/` directory for all prompts used (model + version + date + exact text).
