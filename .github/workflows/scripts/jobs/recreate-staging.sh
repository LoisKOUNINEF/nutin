#!/bin/bash

set -euo pipefail

git config user.name github-actions
git config user.email github-actions@github.com

git fetch origin

if ! staging_sha="$(git rev-parse --verify --quiet origin/staging)"; then
  echo "No staging branch, creating it from main"
  git push origin origin/main:refs/heads/staging
elif git merge-base --is-ancestor "$staging_sha" origin/main; then
  echo "Fast-forwarding staging to main"
  git push origin origin/main:refs/heads/staging
elif git diff --quiet "$staging_sha" origin/main; then
  # squash/rebase merge: same content, other commits. The lease refuses the reset if staging
  # moved since the fetch.
  echo "Resetting staging to main (same content)"
  git push --force-with-lease="staging:$staging_sha" origin origin/main:refs/heads/staging
else
  echo "staging has changes that aren't on main, leaving it as it is: merge them or reset staging manually." >&2
  exit 1
fi
