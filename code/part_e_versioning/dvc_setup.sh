#!/bin/bash
# ============================================================
# dvc_setup.sh - Data versioning setup
# CS203 Assignment 1 - Project 5: Voice Helpdesk ASR
#
# Run ONCE after all data is frozen and splits are made.
# Creates the a1-final git tag that Assignment 2 starts from.
# WARNING: Do NOT re-run after tagging without removing the tag.
#
# Usage: bash part_e_versioning/dvc_setup.sh
# ============================================================

set -e

echo "=== DVC Setup for CS203 A1 Project 5 ==="

# Step 1: Initialise DVC (skip if already done)
echo "[1/6] Initialising DVC..."
dvc init 2>/dev/null || echo "  DVC already initialised - skipping"

# Step 2: Track the data directory
echo "[2/6] Adding data/ to DVC tracking..."
dvc add data/

# Step 3: Set up local DVC remote
echo "[3/6] Setting up DVC remote..."
mkdir -p ../dvc-remote
dvc remote add -d localremote ../dvc-remote 2>/dev/null ||     dvc remote modify localremote url ../dvc-remote

# Step 4: Commit DVC tracking files to git
echo "[4/6] Committing DVC files to git..."
git add data.dvc .dvc/ .dvcignore
git commit -m "chore: DVC track data/ at a1-final [CS203 A1 P5]" ||     echo "  Nothing new to commit"

# Step 5: Push data to DVC remote
echo "[5/6] Pushing data to DVC remote..."
dvc push

# Step 6: Tag the repository
echo "[6/6] Creating git tag a1-final..."
git tag -a a1-final -m "Assignment 1 final submission - CS203 Project 5 Voice Helpdesk ASR" 2>/dev/null ||     echo "  Tag a1-final already exists - remove with: git tag -d a1-final"

echo ""
echo "=== DVC Setup Complete ==="
echo "Tag a1-final created. Assignment 2 starts from this tag."
echo "GitHub URL: $(git remote get-url origin 2>/dev/null || echo 'not set')"
