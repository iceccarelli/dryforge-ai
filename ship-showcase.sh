#!/usr/bin/env bash
# ship-showcase.sh — one-shot installer for the Autonomous Finishing showcase.
# Run from the repo root:  bash ship-showcase.sh
# Requires: dryforge-finishing-showcase.patch present in the repo root.
set -euo pipefail

BRANCH="feat/autonomous-finishing-showcase"
PATCH="dryforge-finishing-showcase.patch"

echo "==> Sanity checks"
test -f package.json || { echo "!! Run this from the repo root (no package.json here)."; exit 1; }
test -f "$PATCH"     || { echo "!! $PATCH not found in repo root. Drag it into the file tree first."; exit 1; }

echo "==> Reset $BRANCH from origin/main (discards the earlier empty branch)"
git fetch origin
git checkout -B "$BRANCH" origin/main

echo "==> Apply the code patch"
git apply --3way "$PATCH"

echo "==> Materialize all 80 images from the 8 zips into two collections"
rm -rf public/showcase && mkdir -p public/showcase/independent public/showcase/field
tmp="$(mktemp -d)"

# ordered: "zip glob | dest folder | numeric offset"
place () {
  local zip="$1" dest="$2" off="$3"
  test -f "$zip" || { echo "!! missing zip: $zip"; exit 1; }
  local d; d="$(mktemp -d)"
  unzip -o -q "$zip" -d "$d"
  local i=1 f n
  # recursive find handles zips that nest images inside a subfolder
  while IFS= read -r f; do
    n=$(printf "%02d" $(( off + i )))
    cp "$f" "public/showcase/$dest/$n.png"
    i=$(( i + 1 ))
  done < <(find "$d" -name '*.png' | sort)
  rm -rf "$d"
}

place "dryforge-ai_independent_10.zip"      independent  0
place "dryforge-ai_independent_10 (1).zip"  independent 10
place "dryforge-ai_independent_10 (2).zip"  independent 20
place "dryforge-ai_independent_10 (3).zip"  independent 30
place "dryforge-ai_10_images.zip"           field        0
place "dryforge-ai_10_images (1).zip"       field       10
place "dryforge-ai_10_images (2).zip"       field       20
place "dryforge-ai_10_images (3).zip"       field       30
rm -rf "$tmp"

ind=$(find public/showcase/independent -name '*.png' | wc -l)
fld=$(find public/showcase/field -name '*.png' | wc -l)
echo "    independent=$ind  field=$fld  total=$(( ind + fld ))  (expected 40/40/80)"
test "$ind" = "40" -a "$fld" = "40" || { echo "!! image count off — check zip names"; exit 1; }

echo "==> Install and build"
npm install
npm run build

echo "==> Commit and push"
git add -A
git commit -m "feat: Autonomous Drywall Finishing Systems showcase — 80-render filterable gallery + lightbox"
git push -u origin "$BRANCH" --force-with-lease

echo "==> Done. Open the PR:"
echo "    https://github.com/iceccarelli/dryforge-ai/pull/new/$BRANCH"
