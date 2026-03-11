#!/bin/bash
# Check if README might be outdated relative to source changes
# Outputs a reminder if significant source files changed since last README update

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0

README_TIME=$(git log -1 --format="%ct" -- README.md 2>/dev/null || echo "0")
LATEST_SRC_TIME=$(git log -1 --format="%ct" -- server/ prisma/ package.json nitro.config.ts Makefile 2>/dev/null || echo "0")

# Also check uncommitted changes to source files
UNCOMMITTED_SRC=$(git diff --name-only HEAD -- server/ prisma/ package.json nitro.config.ts Makefile 2>/dev/null | head -5)
STAGED_SRC=$(git diff --cached --name-only -- server/ prisma/ package.json nitro.config.ts Makefile 2>/dev/null | head -5)

if [ "$LATEST_SRC_TIME" -gt "$README_TIME" ] || [ -n "$UNCOMMITTED_SRC" ] || [ -n "$STAGED_SRC" ]; then
  echo "README.md may be outdated. Source files have changed since the last README update. Review and update README.md if the changes affect setup instructions, API endpoints, environment variables, testing commands, or tech stack description."
fi
