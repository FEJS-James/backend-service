#!/bin/bash

# Exit on error
set -e

# Function to display error messages
error_exit() {
    echo "ERROR: $1" >&2
    exit 1
}

# Generate a random unique version string using a simpler method
# Format: YYYYMMDD-HHMMSS-PID-RANDOM
timestamp=$(date +%Y%m%d-%H%M%S)
pid=$$
random=$((RANDOM % 10000))
version="${timestamp}-${pid}-${random}"
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

# Fetch branches
echo "Fetching branches from remote..."
git fetch origin main || echo "Warning: Failed to fetch main branch, it may not exist yet"
git fetch origin staging || echo "Warning: Failed to fetch staging branch, it may not exist yet"

# Switch to staging branch
echo "Switching to staging branch..."
git switch staging || error_exit "Failed to switch to staging branch"

# Delete all files and folders (except .git)
echo "Deleting all files and folders..."
find . -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} \;

# Add the deletion to Git
echo "Adding deletion to Git..."
git add . || error_exit "Failed to add deletion to Git"

# Commit the deletion
echo "Committing deletion..."
git commit -m "Delete all files and folders before merge" || error_exit "Failed to commit deletion"

# Merge the version branch into staging
echo "Merging $branch_name into staging..."
git merge "$branch_name" --allow-unrelated-histories -m "Merge $branch_name into staging" || error_exit "Failed to merge branches"

# Push staging branch to remote
echo "Pushing staging branch to remote..."
git push origin staging || error_exit "Failed to push staging branch"

echo "Deployment completed successfully!"
echo "Version: $version"
echo "Branch: $branch_name"

