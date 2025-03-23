#!/bin/bash

# Exit on error
set -e

# Function to display error messages
error_exit() {
    echo "ERROR: $1" >&2
    exit 1
}

# Function to display usage information
usage() {
    echo "Usage: $0 [push]"
    echo "  push: Optional. Controls whether to push to remote repository."
    echo "        Values: yes, no, or empty (defaults to no)"
    echo "  Example: $0 yes"
    exit 1
}

# Process arguments
PUSH_TO_REMOTE="no"  # Default value changed to "no"
if [ $# -gt 0 ]; then
    if [ "$1" = "yes" ] || [ "$1" = "no" ]; then
        PUSH_TO_REMOTE="$1"
    elif [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        usage
    else
        echo "Invalid argument: $1"
        usage
    fi
fi

echo ""
echo "=== DEPLOYMENT CONFIGURATION ==="
echo "Push to remote: $PUSH_TO_REMOTE"

# Generate a version string with date and time
date_part=$(date +%Y%m%d)
time_part=$(date +%H%M%S)
version="${date_part}-${time_part}"
echo "Generated version: $version"
echo ""

# Initialize Git repository if not already initialized
echo "=== STEP 1: REPOSITORY SETUP ==="
if [ ! -d .git ]; then
    echo "[1.1] Initializing Git repository..."
    git init >/dev/null 2>&1 || error_exit "Failed to initialize Git repository"
    echo "      ✓ Git repository initialized"
else
    echo "[1.1] Git repository already initialized"
fi

# Add all files to staging
echo "[1.2] Adding files to Git..."
git add . >/dev/null 2>&1 || error_exit "Failed to add files to Git"
echo "      ✓ Files added to Git"

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo "[1.3] Updating remote 'origin' URL..."
    git remote set-url origin git@me.github.com:FEJS-James/backend-service.git >/dev/null 2>&1 || error_exit "Failed to update remote URL"
    echo "      ✓ Remote URL updated"
else
    echo "[1.3] Adding remote 'origin'..."
    git remote add origin git@me.github.com:FEJS-James/backend-service.git >/dev/null 2>&1 || error_exit "Failed to add remote"
    echo "      ✓ Remote added"
fi
echo ""

# Create commit
echo "=== STEP 2: VERSION BRANCH CREATION ==="
echo "[2.1] Creating initial commit..."
git commit -m "merge-${version}" >/dev/null 2>&1 || error_exit "Failed to create commit"
echo "      ✓ Commit created"

# Create and switch to new branch
branch_name="version-${version}"
echo "[2.2] Creating and switching to branch: $branch_name"
git branch "$branch_name" >/dev/null 2>&1 || error_exit "Failed to create branch"
git switch "$branch_name" >/dev/null 2>&1 || error_exit "Failed to switch to branch"
echo "      ✓ Branch created and switched"
echo ""

# Delete frontend Next.js folders and files from the version branch
echo "=== STEP 3: CLEANING FRONTEND FILES ==="
echo "[3.1] Deleting frontend Next.js folders and files..."
rm -rf app components styles hooks public 2>/dev/null || true
rm -f postcss.config.mjs tailwind.config.ts next.config.mjs components.json 2>/dev/null || true
echo "      ✓ Frontend files deleted"

# Replace package.json with server.package.json
echo "[3.2] Replacing package.json with server.package.json..."
if [ -f server.package.json ]; then
    mv server.package.json package.json || error_exit "Failed to replace package.json"
    echo "      ✓ package.json replaced"
else
    echo "      ⚠ Warning: server.package.json not found, keeping existing package.json"
fi

# Add and commit the deletion to the version branch
echo "[3.3] Committing changes to version branch..."
git add . >/dev/null 2>&1 || error_exit "Failed to add deletion to Git"
git commit -m "Remove frontend Next.js files from backend service" >/dev/null 2>&1 || error_exit "Failed to commit deletion"
echo "      ✓ Changes committed"
echo ""

# Fetch branches
echo "=== STEP 4: STAGING BRANCH PREPARATION ==="
echo "[4.1] Fetching branches from remote..."
git fetch origin main >/dev/null 2>&1 || echo "      ⚠ Warning: Failed to fetch main branch, it may not exist yet"
git fetch origin staging >/dev/null 2>&1 || echo "      ⚠ Warning: Failed to fetch staging branch, it may not exist yet"
echo "      ✓ Branches fetched"

# Switch to staging branch
echo "[4.2] Switching to staging branch..."
git switch staging >/dev/null 2>&1 || error_exit "Failed to switch to staging branch"
echo "      ✓ Switched to staging branch"

# Delete all files and folders (except .git)
echo "[4.3] Cleaning staging branch..."
find . -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} \; >/dev/null 2>&1
echo "      ✓ Staging branch cleaned"

# Add the deletion to Git
echo "[4.4] Committing clean state to staging branch..."
git add . >/dev/null 2>&1 || error_exit "Failed to add deletion to Git"
git commit -m "Delete all files and folders before merge" >/dev/null 2>&1 || error_exit "Failed to commit deletion"
echo "      ✓ Clean state committed"
echo ""

# Merge the version branch into staging
echo "=== STEP 5: MERGING AND DEPLOYMENT ==="
echo "[5.1] Merging $branch_name into staging..."
git merge "$branch_name" --allow-unrelated-histories -m "Merge $branch_name into staging" >/dev/null 2>&1 || error_exit "Failed to merge branches"
echo "      ✓ Branches merged successfully"

# Push staging branch to remote if PUSH_TO_REMOTE is yes
if [ "$PUSH_TO_REMOTE" = "yes" ]; then
    echo "[5.2] Pushing staging branch to remote..."
    git push origin staging >/dev/null 2>&1 || error_exit "Failed to push staging branch"
    echo "      ✓ Successfully pushed to remote repository"
else
    echo "[5.2] Skipping push to remote repository as requested"
fi
echo ""

# Install dependencies
echo "=== STEP 6: DEPENDENCIES INSTALLATION ==="
echo "[6.1] Installing dependencies..."
npm i >/dev/null 2>&1 || error_exit "Failed to install dependencies"
echo "      ✓ Dependencies installed successfully"
echo ""

echo "=== DEPLOYMENT SUMMARY ==="
echo "✅ Deployment completed successfully!"
echo "   Version: $version"
echo "   Branch: $branch_name"
echo ""

