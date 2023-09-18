#!/bin/bash

directories=$(find ./packages -type f -name "package.json"  -exec dirname {} \;)

run_build() {
  dir="$1"
  cd "$dir" || return
  if [ -f "package.json" ]; then
    bun run build
  fi
  cd - >/dev/null || return
}

export -f run_build

echo "$directories" | parallel -j4 -k run_build {}
