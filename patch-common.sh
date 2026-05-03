#!/usr/bin/env bash
set -e

PLATFORM=$1

# Replace @img/sharp with @img-custom/sharp in .json and .js only
find . \
  \( -path './.git' -o -path '*/.git/*' \) -prune -o \
  -type f \( -name '*.json' -o -name '*.js' \) \
  ! -name '*.bak' \
  -exec sed -i.bak 's|@img/sharp-|@img-custom/sharp-|g' {} +

# Replace (lovell/sharp-libvips and lovell/sharp) with (ollm/sharp-libvips-custom and lovell/sharp-custom) in .json (For provenance)
find . \
  \( -path './.git' -o -path '*/.git/*' \) -prune -o \
  -type f -name '*.json' \
  ! -name '*.bak' \
  -exec sed -i.bak \
    -e 's|lovell/sharp-libvips|ollm/sharp-libvips-custom|g' \
    -e 's|lovell/sharp|ollm/sharp-custom|g' \
  {} +

# Replace version (Only for developing)
find . \
  \( -path './.git' -o -path '*/.git/*' \) -prune -o \
  -type f -name '*.json' \
  ! -name '*.bak' \
  -exec sed -i.bak 's|"0.34.5"|"0.0.2"|g' {} +

# Replace version (Only for developing)
find . \
  \( -path './.git' -o -path '*/.git/*' \) -prune -o \
  -type f -name '*.json' \
  ! -name '*.bak' \
  -exec sed -i.bak 's|"1.2.4"|"0.0.8"|g' {} +