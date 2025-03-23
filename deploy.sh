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
    echo "        Values: yes, no, or empty (defaults to yes)"
    echo "  Example: $0 no"
    exit 1
}

# Process arguments
PUSH_TO_REMOTE="yes"  # Default value
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

echo "Push to remote: $PUSH_TO_REMOTE"

# Generate a random unique version string with time and 5-character unique string
date_part=$(date +%Y%m%d)
time_part=$(date +%H%M%S)
# Generate a random 5-character string using lowercase letters and numbers
unique_string=$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 5 | head -n 1)
version="${date_part}-${time_part}-${unique_string}"
echo "Generated version: $version"

# Initialize Git repository if not already initialized
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init || error_exit "Failed to initialize Git repository"
else
    echo "Git repository already initialized"
fi

# Add all files to staging
echo "Adding files to Git..."
git add . || error_exit "Failed to add files to Git"

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo "Remote 'origin' already exists, updating URL..."
    git remote set-url origin git@me.github.com:FEJS-James/backend-service.git || error_exit "Failed to update remote URL"
else
    echo "Adding remote 'origin'..."
    git remote add origin git@me.github.com:FEJS-James/backend-service.git || error_exit "Failed to add remote"
fi

# Create commit
echo "Creating commit..."
git commit -m "merge-${version}" || error_exit "Failed to create commit"

# Create and switch to new branch
branch_name="version-${version}"
echo "Creating and switching to branch: $branch_name"
git branch "$branch_name" || error_exit "Failed to create branch"
git switch "$branch_name" || error_exit "Failed to switch to branch"

# Delete frontend Next.js folders and files from the version branch
echo "Deleting frontend Next.js folders and files from version branch..."
rm -rf app components styles hooks public 2>/dev/null || true
rm -f postcss.config.mjs tailwind.config.ts next.config.mjs components.json 2>/dev/null || true

# Replace package.json with server.package.json
echo "Replacing package.json with server.package.json..."
if [ -f server.package.json ]; then
    mv server.package.json package.json || error_exit "Failed to replace package.json"
else
    echo "Warning: server.package.json not found, keeping existing package.json"
fi

# Add and commit the deletion to the version branch
echo "Adding deletion to Git..."
git add . || error_exit "Failed to add deletion to Git"
echo "Committing deletion to version branch..."
git commit -m "Remove frontend Next.js files from backend service" >/dev/null 2>&1 || error_exit "Failed to commit deletion"

# Fetch branches
echo "Fetching branches from remote..."
git fetch origin main >/dev/null 2>&1 || echo "Warning: Failed to fetch main branch, it may not exist yet"
git fetch origin staging >/dev/null 2>&1 || echo "Warning: Failed to fetch staging branch, it may not exist yet"

# Switch to staging branch
echo "Switching to staging branch..."
git switch staging >/dev/null 2>&1 || error_exit "Failed to switch to staging branch"

# Delete all files and folders (except .git)
echo "Deleting all files and folders from staging branch..."
find . -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} \;

# Add the deletion to Git
echo "Adding deletion to Git..."
git add . || error_exit "Failed to add deletion to Git"

# Commit the deletion
echo "Committing deletion to staging branch..."
git commit -m "Delete all files and folders before merge" >/dev/null 2>&1 || error_exit "Failed to commit deletion"

# Merge the version branch into staging
echo "Merging $branch_name into staging..."
git merge "$branch_name" --allow-unrelated-histories -m "Merge $branch_name into staging" >/dev/null 2>&1 || error_exit "Failed to merge branches"

# Push staging branch to remote if PUSH_TO_REMOTE is yes
if [ "$PUSH_TO_REMOTE" = "yes" ]; then
    echo "Pushing staging branch to remote..."
    git push origin staging >/dev/null 2>&1 || error_exit "Failed to push staging branch"
    echo "Successfully pushed to remote repository."
else
    echo "Skipping push to remote repository as requested."
fi

echo "Deployment completed successfully!"
echo "Version: $version"
echo "Branch: $branch_name"

# Install dependencies
echo "Installing dependencies..."
npm i || error_exit "Failed to install dependencies"

echo "All done! Dependencies installed successfully."

