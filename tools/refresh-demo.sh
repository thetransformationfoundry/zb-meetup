#!/bin/sh
# Refresh the local demo copy from the working tree.
#
# The copy exists for ONE reason: to force ZB_LIVE=false so local testing never
# touches live Firestore. Everything else must match the repo exactly — when it
# drifts, the browser runs old code and a correct build looks broken.
#
#   sh tools/refresh-demo.sh [dest]     (default: $ZB_DEMO_DIR, else ./_demo)
#
# Built in a staging dir and swapped in, so a failed copy can never leave the
# demo half-updated or — worse — pointing at live Firestore.
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-${ZB_DEMO_DIR:-$SRC/_demo}}"
STAGE="$DEST.staging.$$"
trap 'rm -rf "$STAGE"' EXIT INT TERM

rm -rf "$STAGE"; mkdir -p "$STAGE"
for item in index.html manifest.json css js assets; do
  [ -e "$SRC/$item" ] && cp -R "$SRC/$item" "$STAGE/"
done

# the one deliberate difference from the repo
printf '\n// LOCAL TEST COPY ONLY — force demo mode so nothing touches live Firestore.\nwindow.ZB_LIVE = false;\n' >> "$STAGE/js/firebase-config.js"

# refuse to publish a copy that would hit live Firestore
grep -q '^window.ZB_LIVE = false;$' "$STAGE/js/firebase-config.js" || {
  echo "ABORT: demo override missing — not swapping in." >&2; exit 1; }

rm -rf "$DEST.old"
[ -d "$DEST" ] && mv "$DEST" "$DEST.old"
mv "$STAGE" "$DEST"
rm -rf "$DEST.old"
echo "demo refreshed: $DEST  ($(grep -o 'app.js?v=[0-9]*' "$DEST/index.html" | head -1), ZB_LIVE=false)"
