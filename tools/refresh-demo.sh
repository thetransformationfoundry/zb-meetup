#!/bin/sh
# Refresh the local demo copy from the working tree.
#
# The demo copy exists for ONE reason: it forces ZB_LIVE=false so local testing
# never touches live Firestore. Everything else must be an exact copy of the repo
# — when it drifts, the browser shows old code and a passing build looks broken.
# Run this after every change you want to test locally.
#
#   sh tools/refresh-demo.sh [dest]    (default: $ZB_DEMO_DIR, else ./_demo)
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-${ZB_DEMO_DIR:-$SRC/_demo}}"
mkdir -p "$DEST"
for item in index.html manifest.json css js assets; do
  [ -e "$SRC/$item" ] && cp -R "$SRC/$item" "$DEST/"
done
printf '\n// LOCAL TEST COPY ONLY — force demo mode so nothing touches live Firestore.\nwindow.ZB_LIVE = false;\n' >> "$DEST/js/firebase-config.js"
echo "demo refreshed: $DEST  ($(grep -o 'app.js?v=[0-9]*' "$DEST/index.html" | head -1))"
