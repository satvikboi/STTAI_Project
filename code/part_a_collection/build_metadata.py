# -----------------------------------------------
# build_metadata.py - Post-collection metadata builder.
# CS203 Assignment 1 - Project 5: Voice Helpdesk ASR
#
# Scans data/raw/audio/ for .wav files and builds data/metadata.csv.
# Run after all recording sessions are complete.
# Safe to re-run (idempotent - does not duplicate rows).
#
# Usage: python build_metadata.py --audio-dir data/raw/audio/
# -----------------------------------------------

import argparse, csv, hashlib, os, sys, wave
from pathlib import Path
from datetime import datetime

METADATA_FILE = Path("data/metadata.csv")
METADATA_COLUMNS = [
    "clip_id","speaker_id","region","device","noise_condition","lang_mix",
    "sample_rate","duration_sec","channels","recording_tool","tool_version",
    "collector","timestamp_utc","sha256_hash","script_prompt"
]

def compute_sha256(p):
    h = hashlib.sha256()
    with open(p,"rb") as f:
        for chunk in iter(lambda: f.read(8192), b""): h.update(chunk)
    return h.hexdigest()

def get_audio_info(p):
    """Return (sample_rate, duration_sec, channels) from WAV file."""
    try:
        import soundfile as sf
        info = sf.info(str(p))
        return info.samplerate, info.duration, info.channels
    except ImportError:
        with wave.open(str(p),"r") as w:
            sr = w.getframerate(); ch = w.getnchannels()
            dur = w.getnframes() / float(sr)
            return sr, dur, ch

def parse_filename(stem):
    """Parse speaker_id and timestamp from filename: SPKXXX_TIMESTAMP_IDX."""
    parts = stem.split("_")
    if len(parts) >= 3:
        return parts[0], parts[1]
    return stem, "unknown"

def load_existing(path):
    """Load existing clip_ids to avoid duplicates."""
    if not path.exists(): return set()
    with open(path,"r",encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return {row["clip_id"] for row in reader}

def main():
    parser = argparse.ArgumentParser(description="Build metadata.csv from audio files")
    parser.add_argument("--audio-dir", type=Path, default=Path("data/raw/audio"))
    args = parser.parse_args()

    METADATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    existing = load_existing(METADATA_FILE)

    wav_files = sorted(args.audio_dir.glob("*.wav"))
    print(f"Found {len(wav_files)} WAV files in {args.audio_dir}")

    new_rows = []
    for wav in wav_files:
        clip_id = wav.stem
        if clip_id in existing:
            continue  # Skip already-indexed clips (idempotent)

        speaker_id, timestamp_utc = parse_filename(clip_id)
        sha256 = compute_sha256(wav)
        sr, dur, ch = get_audio_info(wav)

        new_rows.append({
            "clip_id": clip_id,
            "speaker_id": speaker_id,
            "region": "",          # Fill manually or from recording session
            "device": "",
            "noise_condition": "",
            "lang_mix": "",
            "sample_rate": sr,
            "duration_sec": round(dur, 3),
            "channels": ch,
            "recording_tool": "build_metadata.py",
            "tool_version": f"python=={sys.version.split()[0]}",
            "collector": os.getenv("USER","unknown"),
            "timestamp_utc": timestamp_utc,
            "sha256_hash": sha256,
            "script_prompt": "",
        })

    # Append new rows
    write_header = not METADATA_FILE.exists()
    with open(METADATA_FILE,"a",newline="",encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=METADATA_COLUMNS)
        if write_header: writer.writeheader()
        writer.writerows(new_rows)

    # Summary
    import pandas as pd
    df = pd.read_csv(METADATA_FILE)
    total_dur = df["duration_sec"].sum()
    print(f"Total clips: {len(df)}")
    print(f"Total duration: {total_dur/3600:.2f}h ({total_dur/60:.1f} min)")
    print(f"Unique speakers: {df['speaker_id'].nunique()}")
    if "lang_mix" in df.columns:
        print(f"Lang mix breakdown:")
        print(df["lang_mix"].value_counts().to_string())
    print(f"Metadata saved: {METADATA_FILE}")

if __name__ == "__main__": main()
