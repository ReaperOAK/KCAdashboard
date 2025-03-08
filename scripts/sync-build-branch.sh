#!/bin/bash

# Script to correctly sync the build branch with remote

echo "Syncing build branch with remote origin..."

# Make sure we have the latest from remote
git fetch origin

# Save current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Check if build branch exists locally
if git show-ref --quiet refs/heads/build; then
  echo "Local build branch exists, recreating it..."
  # Switch to a different branch first (if we're currently on build)
  if [ "$CURRENT_BRANCH" = "build" ]; then
    git checkout main
  fi
  # Delete the local build branch
  git branch -D build
else
  echo "No local build branch exists yet"
fi

# Create a new build branch tracking the remote
echo "Creating new build branch tracking remote origin/build..."
git checkout -b build --track origin/build || git checkout -b build origin/build

echo "Build branch is now in sync with remote"

# Switch back to original branch if it wasn't build
if [ "$CURRENT_BRANCH" != "build" ] && [ -n "$CURRENT_BRANCH" ]; then
  git checkout "$CURRENT_BRANCH"
  echo "Switched back to $CURRENT_BRANCH"
fi

echo "Done!"
