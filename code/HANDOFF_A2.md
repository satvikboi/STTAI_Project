# HANDOFF_A2.md - Written at a1-final freeze.
# Assignment 2 must start from this exact state.
# Any number in A2 that uses these files must reference this document.

# Handoff Document — Assignment 2
# CS203 Project 5: Voice Helpdesk ASR

## a1-final Tag
Git commit hash: a1-final (tagged at submission freeze)
GitHub URL: https://github.com/vipulSP2108/STTAI_Project.git

## Frozen Files
| File | SHA-256 | Purpose |
|------|---------|---------|
| data/gold_test_set.csv | `01dc4503853893b0ea309184c1c75620fa63dabfaf1710a32f2847dc68fa4582` | Gold eval set — never use for tuning |
| data/splits/train.csv | `2a8fc53692251a7eb060824c5a3a893dfc755b9d589a1cb711235e8b8b81ee57` | Training set (speaker-disjoint) |
| data/splits/val.csv | `9b54f8e5727415f604621e1d8e2dd12e59a4f9cc037a1804be46c3abaa50821c` | Validation set |
| data/splits/test.csv | `5c1f32307a8ff6dc550185180c431434c6d2ad7fda79fb00126e8ee9d61ab71d` | Test set |
| data/splits/cohort_b_shifted.csv | `0d780ed6b5e4456590bdaa115f1815594d185b1e6372fb607c6afd78f285a47f` | Drift test (Cohort B accent group) |

## Label Schema
transcript: free text, code-mixed English/Hindi/Gujarati
intent: {admissions, hostel_mess, it_support, student_services}

## Split Definitions
- Split unit: speaker (never clip/row)
- Train: 70% of speakers (13 speakers, 181 clips)
- Val: 15% of speakers (2 speakers, 41 clips)
- Test: 15% of speakers (4 speakers, 27 clips)
- Cohort B: held-out region (Maharashtra group, 32 clips)
- SPLIT_SEED = 42

## Gold Set Checksum
SHA-256 of data/gold_test_set.csv: `01dc4503853893b0ea309184c1c75620fa63dabfaf1710a32f2847dc68fa4582`
DO NOT use this file for any training or hyperparameter tuning in A2.
