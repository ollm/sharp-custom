#!/usr/bin/env bash
set -e

PLATFORM=$1

# Replace @img/ with @img-custom/ in .json and .js only
find . \
  -path './.git' -prune -o \
  -type f \( -name '*.json' -o -name '*.js' \) \
  ! -name '*.bak' \
  -exec sed -i.bak 's/@img\/sharp-/@img-custom\/sharp-/g' {} +


