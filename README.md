# Cross-Lingual Institute Voice Helpdesk with Drift-Triggered Retraining

**CS203: Software Tools and Techniques in AI — Assignment 1 (Project 5)**  
Department of Computer Science and Engineering, Indian Institute of Technology Gandhinagar  
**Repository**: [https://github.com/vipulSP2108/STTAI_Project.git](https://github.com/vipulSP2108/STTAI_Project.git)

---

## Team & Equal Contribution Statement

| Team Member | Roll Number | Academic Program |
| :--- | :--- | :--- |
| **Rajdeep Vraj** | 24110260 | M.Tech CSE, IIT Gandhinagar |
| **Vipul Sunil Patil** | 24110381 | M.Tech CSE, IIT Gandhinagar |
| **Satvik Sharma** | 24110300 | M.Tech CSE, IIT Gandhinagar |

> **Statement of Equal Contribution:**  
> All three team members (**Rajdeep Vraj**, **Vipul Sunil Patil**, and **Satvik Sharma**) have contributed equally to this project across all phases. Responsibilities were collaboratively planned, shared, and executed in equal measure, including:
> - Audio data collection, multi-format container parsing, and audio segmentation (`Records/` & `1 clip 1 tar`).
> - Automated 10-check validation test suite using `pytest` and `pandera`, plus corruption checks.
> - Label Studio double-annotation protocol, guideline calibration, and inter-annotator agreement computation (WER & Cohen's $\kappa$).
> - Audio perturbation augmentations (speed, pitch, MUSAN noise, RIR reverb) and active learning uncertainty sampling curves.
> - Speaker-disjoint train/val/test splits, Cohort B demographic distribution shift creation, and DVC/Git release management.
> - Academic research paper authoring (`report/report.pdf`), interactive visual dashboards, and dataset documentation.

---

## Project Overview

This repository implements the end-to-end data engineering, quality validation, annotation agreement, audio augmentation, and provenance tracking pipeline for an institute voice helpdesk ASR system (Project 5). The system is designed to handle Indian academic campus acoustic environments characterized by heavy code-mixing (English, Hindi, and Gujarati), smartphone microphone variability, and regional accent diversity.

### Corpus Summary
- **Participants**: 19 unique student speakers (P1–P19) across 4 administrative domains (*Admissions*, *Hostel & Mess*, *IT Support*, *Student Services*).
- **Audio Profiles**:
  - **P1–P12**: Extended spontaneous and scripted voice queries (~1 min/clip, mean $62.3\,\text{s}$).
  - **P13–P19**: Bundled 2-minute multi-query sessions segmented into discrete individual query audio files stored in `Records/P<N>/1 clip 1 tar/` (101 clips, mean $8.5\,\text{s}$).
- **Canonical Corpus**: 249 standardized $16\,\text{kHz}$ mono WAV audio clips totaling $1.28$ hours ($4{,}625.1\,\text{s}$) with complete SHA-256 cryptographic provenance in `data/metadata.csv`.
- **Validation**: 10 automated quality checks passing 100% on clean calibrated data, with adversarial tests catching downsampling, clipping, and silence.
- **Inter-Annotator Agreement**: Dual-pass annotation demonstrating improvement from Round 1 ($\text{WER}=0.008, \kappa=0.911$) to Round 2 ($\text{WER}=0.001, \kappa=1.000$).
- **Active Learning**: Uncertainty sampling reaches $90\%$ intent coverage in $21$ samples vs. $45$ samples for random baseline ($\sim 53\%$ reduction in annotation effort).
- **Speaker-Disjoint Splits**: Leakage-free partitions (Train: 181 clips, Val: 41 clips, Test: 27 clips, Cohort B Shifted: 32 clips).

---

## Repository Structure

```
STTAI_Project/
├── Records/                     # Raw multi-format audio organized by speaker (P1–P19)
│   ├── P1/ ... P12/             # Large voice notes (~1 min each)
│   └── P13/ ... P19/            # Bundled recordings + "1 clip 1 tar" discrete query subfolders
├── code/                        # Modular pipeline implementation
│   ├── part_a_collection/       # Ingestion & metadata extraction
│   ├── part_b_validation/       # 10-check automated pytest suite & corruption tests
│   ├── part_c_labelling/        # Label Studio schema, guidelines, & agreement calculation
│   ├── part_d_augmentation/     # Audio augmentations & active learning simulation
│   ├── part_e_versioning/       # Speaker-disjoint dataset splitting logic
│   ├── part_f_report/           # Dataset card & Hugging Face specification
│   ├── requirements.txt         # Pinned Python package dependencies
│   └── HANDOFF_A2.md            # Checksums and specifications for Assignment 2 handoff
├── data/                        # Canonical dataset & labels
│   ├── raw/audio/               # 249 canonical 16 kHz mono WAV clips
│   ├── labels/                  # Transcripts and 4-class intent labels
│   ├── splits/                  # train.csv, val.csv, test.csv, cohort_b_shifted.csv
│   └── gold_test_set.csv        # Immutable frozen gold test benchmark (119 clips)
├── supporting_files/            # Validation logs, Label Studio JSONs, plots
│   ├── agreement_calculations/  # Agreement report (WER & Cohen's kappa)
│   ├── validation_outputs/      # Before/after audit JSONs & corruption test logs
│   └── plots/                   # Publication-grade figures & AL simulation data
└── report/                      # Academic report deliverables
    ├── report.tex               # IEEE journal format LaTeX source
    ├── report.pdf               # 5-page compiled PDF report
    ├── ReportDashboard.tsx      # Interactive React TSX report dashboard
    ├── index.html               # Standalone browser viewer
    └── figures/                 # Embedded publication-grade diagrams and plots
```

---

## Quickstart & Reproduction

All steps can be executed sequentially in a clean Python 3.10+ virtual environment:

```bash
# 1. Install dependencies
pip install -r code/requirements.txt

# 2. Ingest raw records & generate canonical metadata
python code/part_a_collection/ingest_records.py --records-dir Records
python code/part_a_collection/build_metadata.py --audio-dir data/raw/audio/

# 3. Run automated validation suite (10 checks) & corruption tests
pytest code/part_b_validation/validation_suite.py -v
python code/part_b_validation/corruption_test.py

# 4. Compute inter-annotator agreement & verify frozen gold test set
python code/part_c_labelling/compute_agreement.py

# 5. Generate audio augmentations & active learning curve
python code/part_d_augmentation/augment_audio.py
python code/part_d_augmentation/active_learning.py

# 6. Create speaker-disjoint splits with Cohort B shift
python code/part_e_versioning/make_splits.py
```

---

## Frozen Benchmarks & Git Release

- **Release Tag**: `a1-final`
- **Gold Test Set SHA-256**: `01dc4503853893b0ea309184c1c75620fa63dabfaf1710a32f2847dc68fa4582`
- **Academic Report**: [report/report.pdf](report/report.pdf) (5 pages, IEEE format)
