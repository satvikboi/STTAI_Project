<!-- guidelines_v2.md: Revised after Round 1 disagreement analysis.
     Key changes from v1 are marked with [REVISED]. -->

# Annotation Guidelines v2
## Voice Helpdesk ASR — CS203 Project 5
**Date**: [fill after Round 1 disagreement review]
**Version**: v2 (used in Round 2)
**Changes from v1**: See Section 7 below.

---

## 1-6: [Same as guidelines_v1.md — reproduced here for completeness]
[Copy sections 1-6 from v1]

---

## 7. Changes from v1 [REVISED]

Based on Round 1 disagreement analysis (see agreement_report.json):

### 7.1 Filler words [REVISED]
- v1: "OMIT unless they affect meaning"
- v2: **Always omit** the following: um, uh, hmm, haan, huh, ha
- Reason: Annotators disagreed on "haan" (sometimes omitted, sometimes kept)

### 7.2 Code-mixed Hindi words in Roman script [REVISED]
- v1: unclear
- v2: If speaker clearly says Hindi word in Roman script (e.g., "mera hostel"),
  write it in Devanagari (मेरा hostel). Roman Hindi → Devanagari rule.
- Exception: Proper nouns remain in Roman (WiFi, Google, etc.)

### 7.3 Multi-topic intent tie-breaking [REVISED]
- v1: "Choose dominant topic"
- v2: If two topics are equally prominent, choose the FIRST mentioned topic.
- Reason: Annotators tied on 8 clips; first-mention rule removes ambiguity.

### 7.4 Partial sentences [REVISED]
- v2: If the speaker clearly starts a new sentence mid-clip, transcribe both parts.
  Do not truncate at clause boundaries.
