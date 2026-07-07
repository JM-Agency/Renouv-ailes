#!/bin/bash
# Auto-commit + push every change in this project. Best-effort: never blocks
# or fails the calling tool, even offline or with nothing to commit.
cd "/Users/jonas/Documents/Claude/Projects/Renouv'ailes" || exit 0

git add -A >/dev/null 2>&1

if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "Auto-update $(date '+%Y-%m-%d %H:%M:%S')" >/dev/null 2>&1
  git push origin main >/dev/null 2>&1
fi

exit 0
