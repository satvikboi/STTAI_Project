# ============================================================
# ingest_records.py - Dynamic Audio Ingestion Pipeline
# CS203 Assignment 1 - Project 5: Voice Helpdesk ASR
#
# Flexible ingestion of multi-format participant recordings:
# - Auto-discovers any speaker directories (P1, P2, ... P20+)
# - Supports all audio formats: .m4a, .opus, .ogg, .mp4, .mpeg, .aac, .wav
# - Converts/resamples to canonical 16000 Hz mono WAV
# - Segments longer sessions on silence into query clips (1.0s - 30.0s)
# - Computes SHA-256 hashes and logs complete provenance in data/metadata.csv
# - Idempotent: re-running only processes newly added files/speakers
# - DOES NOT modify the source Records/ directory
# ============================================================

import argparse
import csv
import hashlib
import json
import os
import re
import subprocess
import sys
import wave
from datetime import datetime, timezone
from pathlib import Path
import numpy as np

SAMPLE_RATE = 16000
CHANNELS = 1
METADATA_FILE = Path("data/metadata.csv")
RAW_AUDIO_DIR = Path("data/raw/audio")
METADATA_COLUMNS = [
    "clip_id", "speaker_id", "region", "device", "noise_condition", "lang_mix",
    "sample_rate", "duration_sec", "channels", "recording_tool", "tool_version",
    "collector", "timestamp_utc", "sha256_hash", "script_prompt"
]

# Regional mappings for speakers (expandable dynamically)
DEFAULT_REGIONS = {
    "P1": "Gujarat", "P2": "Gujarat", "P3": "Gujarat", "P4": "Maharashtra",
    "P5": "North India", "P6": "North India", "P7": "Gujarat", "P8": "Rajasthan",
    "P9": "South India", "P10": "Gujarat", "P11": "North India", "P12": "Gujarat",
    "P13": "Maharashtra", "P14": "North India", "P15": "Gujarat", "P16": "South India",
    "P17": "Gujarat", "P18": "North India", "P19": "Rajasthan"
}

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(16384), b""):
            h.update(chunk)
    return h.hexdigest()

def get_audio_duration_ffprobe(filepath):
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(filepath)]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        info = json.loads(res.stdout)
        return float(info["format"]["duration"])
    except Exception:
        return 0.0

def load_existing_clip_ids():
    if not METADATA_FILE.exists():
        return set()
    with open(METADATA_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return {row["clip_id"] for row in reader if "clip_id" in row}

def append_metadata_rows(rows):
    METADATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    file_exists = METADATA_FILE.exists()
    with open(METADATA_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=METADATA_COLUMNS)
        if not file_exists:
            writer.writeheader()
        for r in rows:
            writer.writerow(r)

def convert_to_wav_16k(input_path, output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-i", str(input_path),
        "-ar", str(SAMPLE_RATE),
        "-ac", str(CHANNELS),
        "-c:a", "pcm_s16le",
        str(output_path)
    ]
    subprocess.run(cmd, capture_output=True, check=True)

def segment_wav_on_silence(wav_path, speaker_id, output_dir, max_len=28.0, min_len=2.0):
    """Segment longer WAV into clean query clips (2-28s) using energy/silence."""
    with wave.open(str(wav_path), "r") as w:
        sr = w.getframerate()
        frames = w.readframes(w.getnframes())
    audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
    total_dur = len(audio) / sr

    if total_dur <= max_len:
        return [(wav_path, total_dur)]

    # Frame energy calculation
    frame_len = int(0.05 * sr)  # 50ms frames
    hop_len = int(0.025 * sr)   # 25ms hop
    energies = []
    for i in range(0, len(audio) - frame_len, hop_len):
        frame = audio[i:i + frame_len]
        energies.append(np.mean(frame**2))
    energies = np.array(energies)
    silence_thresh = max(0.0001, np.percentile(energies, 25))

    # Identify split candidates near silence
    clip_paths = []
    target_seg_len = 15.0  # target 15-second query chunks
    target_samples = int(target_seg_len * sr)
    start_idx = 0
    seg_idx = 1

    while start_idx < len(audio):
        end_idx = min(start_idx + int(max_len * sr), len(audio))
        if len(audio) - end_idx < int(min_len * sr):
            end_idx = len(audio)
        else:
            # Find low energy point near target
            search_start = max(start_idx + int(min_len * sr), start_idx + target_samples - int(3 * sr))
            search_end = min(start_idx + int(max_len * sr), len(audio) - int(min_len * sr))
            if search_end > search_start:
                best_split = search_start
                min_e = float("inf")
                step = int(0.1 * sr)
                for s in range(search_start, search_end, step):
                    e = np.mean(audio[s:s + int(0.1 * sr)]**2)
                    if e < min_e:
                        min_e = e
                        best_split = s
                end_idx = best_split

        seg_audio = audio[start_idx:end_idx]
        seg_dur = len(seg_audio) / sr
        if seg_dur >= min_len:
            seg_filename = f"{speaker_id}_{wav_path.stem}_seg{seg_idx:03d}.wav"
            seg_out = output_dir / seg_filename
            seg_pcm = (np.clip(seg_audio, -0.99, 0.99) * 32767).astype(np.int16)
            with wave.open(str(seg_out), "w") as sw:
                sw.setnchannels(CHANNELS)
                sw.setsampwidth(2)
                sw.setframerate(SAMPLE_RATE)
                sw.writeframes(seg_pcm.tobytes())
            clip_paths.append((seg_out, seg_dur))
            seg_idx += 1

        start_idx = end_idx

    return clip_paths

def ingest_all(records_dir=Path("Records"), raw_audio_dir=RAW_AUDIO_DIR):
    records_dir = Path(records_dir)
    raw_audio_dir = Path(raw_audio_dir)
    raw_audio_dir.mkdir(parents=True, exist_ok=True)
    existing_clips = load_existing_clip_ids()

    # Discover speaker folders dynamically (e.g. P1, P2 ... P19, P20 ...)
    speaker_dirs = sorted([d for d in records_dir.iterdir() if d.is_dir() and not d.name.startswith(".")])
    print(f"[INGEST] Found {len(speaker_dirs)} speaker folders in {records_dir}")

    supported_exts = {".m4a", ".opus", ".ogg", ".mp4", ".mpeg", ".aac", ".wav"}
    all_new_metadata = []
    processed_count = 0

    for s_dir in speaker_dirs:
        speaker_id = s_dir.name
        region = DEFAULT_REGIONS.get(speaker_id, "Gujarat/General")
        audio_files = sorted([f for f in s_dir.iterdir() if f.suffix.lower() in supported_exts and not f.name.startswith(".")])
        
        for a_file in audio_files:
            clean_stem = re.sub(r"[^a-zA-Z0-9_-]", "_", a_file.stem)
            temp_wav = raw_audio_dir / f"temp_{speaker_id}_{clean_stem}.wav"

            try:
                # Convert raw multi-format to 16kHz mono WAV
                convert_to_wav_16k(a_file, temp_wav)
                dur = get_audio_duration_ffprobe(temp_wav)

                # If duration > 30s, segment into natural query clips
                if dur > 30.0:
                    segments = segment_wav_on_silence(temp_wav, speaker_id, raw_audio_dir, max_len=25.0, min_len=2.0)
                    if temp_wav.exists():
                        temp_wav.unlink()
                else:
                    final_wav = raw_audio_dir / f"{speaker_id}_{clean_stem}.wav"
                    temp_wav.rename(final_wav)
                    segments = [(final_wav, dur)]

                # Log metadata for each generated clip
                for seg_path, seg_dur in segments:
                    clip_id = seg_path.stem
                    if clip_id in existing_clips:
                        continue

                    sha256_hash = compute_sha256(seg_path)
                    row = {
                        "clip_id": clip_id,
                        "speaker_id": speaker_id,
                        "region": region,
                        "device": "phone",
                        "noise_condition": "normal",
                        "lang_mix": "en-hi-gu",
                        "sample_rate": SAMPLE_RATE,
                        "duration_sec": round(seg_dur, 2),
                        "channels": CHANNELS,
                        "recording_tool": "whatsapp_voice_pipeline",
                        "tool_version": "ffmpeg==7.1;python==3.12",
                        "collector": os.getenv("USER", "VipulSP2108"),
                        "timestamp_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "sha256_hash": sha256_hash,
                        "script_prompt": f"Helpdesk query recorded by {speaker_id}"
                    }
                    all_new_metadata.append(row)
                    existing_clips.add(clip_id)
                    processed_count += 1

            except Exception as e:
                print(f"[WARN] Failed processing {a_file}: {e}")
                if temp_wav.exists():
                    temp_wav.unlink()

    if all_new_metadata:
        append_metadata_rows(all_new_metadata)

    print(f"\n[INGEST COMPLETE]")
    print(f"Total new clips generated: {processed_count}")
    print(f"Total clips in metadata: {len(existing_clips)}")
    print(f"Metadata saved to: {METADATA_FILE}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest multi-format recordings into 16kHz mono dataset")
    parser.add_argument("--records-dir", type=Path, default=Path("Records"), help="Source records directory")
    parser.add_argument("--raw-audio-dir", type=Path, default=RAW_AUDIO_DIR, help="Destination raw audio directory")
    args = parser.parse_args()
    ingest_all(args.records_dir, args.raw_audio_dir)
