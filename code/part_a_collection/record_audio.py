# ============================================================
# Part A: Audio Collection & Instrumentation
# CS203 Assignment 1 - Project 5: Voice Helpdesk ASR
# IIT Gandhinagar, 2026-27
#
# Purpose: Records helpdesk speech clips with full provenance.
# Every clip is traceable by: source, timestamp, collector ID,
# tool version, and SHA-256 content hash.
#
# Usage: python record_audio.py --speaker-id SPK001 --region Gujarat \
#        --device phone --noise-condition quiet --lang-mix en-hi \
#        --script-file scripts/helpdesk_prompts.txt
#
# CONSENT: Every speaker must complete the consent form first.
# Anonymised IDs (SPK001...) only - no real names in data.
# ============================================================

import argparse, csv, hashlib, os, sys, wave, struct
from datetime import datetime, timezone
from pathlib import Path

# NOTE: 16000 Hz is FIXED - required by Whisper and IndicWav2Vec.
SAMPLE_RATE = 16000
CHANNELS = 1
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

def get_tool_version():
    try:
        import sounddevice as sd, soundfile as sf
        return f"sounddevice=={sd.__version__};soundfile=={sf.__version__};python=={sys.version.split()[0]}"
    except: return f"python=={sys.version.split()[0]}"

def ensure_metadata():
    METADATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not METADATA_FILE.exists():
        with open(METADATA_FILE,"w",newline="",encoding="utf-8") as f:
            csv.DictWriter(f, fieldnames=METADATA_COLUMNS).writeheader()

def append_metadata(row):
    with open(METADATA_FILE,"a",newline="",encoding="utf-8") as f:
        csv.DictWriter(f, fieldnames=METADATA_COLUMNS).writerow(row)

def get_duration(p):
    try:
        import soundfile as sf; return sf.info(str(p)).duration
    except:
        with wave.open(str(p),"r") as w: return w.getnframes()/float(w.getframerate())

def record_clip(output_path, duration=5.0):
    try:
        import sounddevice as sd, soundfile as sf
        print(f"  Recording {duration}s..."); audio = sd.rec(int(duration*SAMPLE_RATE),samplerate=SAMPLE_RATE,channels=CHANNELS,dtype="float32"); sd.wait(); sf.write(str(output_path),audio,SAMPLE_RATE)
    except ImportError:
        print("  [MOCK] Creating silent placeholder")
        n=int(duration*SAMPLE_RATE)
        with wave.open(str(output_path),"w") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SAMPLE_RATE)
            w.writeframes(struct.pack("<"+"h"*n,*([0]*n)))

def main():
    p=argparse.ArgumentParser(description="Record helpdesk audio with provenance")
    p.add_argument("--speaker-id",required=True); p.add_argument("--region",required=True)
    p.add_argument("--device",required=True); p.add_argument("--noise-condition",required=True)
    p.add_argument("--lang-mix",required=True); p.add_argument("--script-file",type=Path)
    p.add_argument("--output-dir",type=Path,default=Path("data/raw/audio"))
    p.add_argument("--clips-per-session",type=int,default=5)
    p.add_argument("--duration",type=float,default=5.0)
    args=p.parse_args()
    args.output_dir.mkdir(parents=True,exist_ok=True); ensure_metadata()
    prompts=[]
    if args.script_file and args.script_file.exists():
        prompts=[l.strip() for l in args.script_file.read_text(encoding="utf-8").splitlines() if l.strip()]
    collector=os.getenv("USER","unknown"); tv=get_tool_version()
    print(f"\n=== Recording Session: {args.speaker_id} | {args.region} ===")
    for i in range(args.clips_per_session):
        ts=datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        cid=f"{args.speaker_id}_{ts}_{i:03d}"
        op=args.output_dir/f"{cid}.wav"
        sp=prompts[i%len(prompts)] if prompts else ""
        if sp: print(f"  Prompt: {sp}")
        record_clip(op, args.duration)
        sha=compute_sha256(op); dur=get_duration(op)
        row={"clip_id":cid,"speaker_id":args.speaker_id,"region":args.region,"device":args.device,
             "noise_condition":args.noise_condition,"lang_mix":args.lang_mix,"sample_rate":SAMPLE_RATE,
             "duration_sec":round(dur,3),"channels":CHANNELS,"recording_tool":"record_audio.py",
             "tool_version":tv,"collector":collector,"timestamp_utc":ts,"sha256_hash":sha,"script_prompt":sp}
        append_metadata(row)
        print(f"[RECORDED] clip_id={cid} duration={dur:.2f}s hash={sha[:12]}...")
    print(f"\nDone. {METADATA_FILE} updated.")

if __name__=="__main__": main()
