# run_validation.py - Wrapper that produces before/after validation evidence.
# CS203 Assignment 1 - Part B
#
# Usage:
#   python run_validation.py --phase before  (run on raw data)
#   python run_validation.py --phase after   (run on fixed data)

import argparse, json, subprocess, sys
from pathlib import Path

OUT_DIR = Path("supporting_files/validation_outputs")
OUT_DIR.mkdir(parents=True, exist_ok=True)

def run_pytest_json(phase):
    result_file = OUT_DIR / f"{phase}.json"
    cmd = [
        sys.executable, "-m", "pytest",
        "part_b_validation/validation_suite.py",
        "-v", "--tb=short",
        f"--json-report", f"--json-report-file={result_file}"
    ]
    print(f"\nRunning validation suite ({phase} phase)...")
    proc = subprocess.run(cmd, capture_output=True, text=True)
    print(proc.stdout)
    if proc.returncode not in (0, 1):
        print(proc.stderr)
    return result_file, proc.returncode

def print_summary(result_file):
    if not Path(result_file).exists():
        print("No JSON report found - install pytest-json-report: pip install pytest-json-report")
        return
    with open(result_file) as f:
        data = json.load(f)
    print("\n=== Validation Summary ===")
    print(f"{'Check':<30} {'Status':<10} {'Details'}")
    print("-"*70)
    for test in data.get("tests", []):
        name = test["nodeid"].split("::")[-1]
        status = test["outcome"].upper()
        msg = ""
        if test["outcome"] == "failed":
            msg = test.get("call",{}).get("longrepr","")[:80]
        print(f"{name:<30} {status:<10} {msg}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", choices=["before","after"], required=True)
    args = parser.parse_args()
    rf, rc = run_pytest_json(args.phase)
    print_summary(rf)
    print(f"\nReport saved: {rf}")
