# BRIEF-001 · Real photo capture on meetup completion

**Branch:** `feat/meetup-photo-capture`  ·  **Status:** ready for CC

## Goal
Let colleagues attach a **real photo** of their meetup (not just a flag) so genuine photos appear on the
community wall — replacing the seed/scene tiles for real posts, exactly as the seed-then-replace design intends.

## Context
Today, the meetup "Share a photo" step (`addPhoto` in `js/app.js`) just sets `photo = true` (a flag). The
community wall renders real posts with the illustrated scene tile because no real image is stored. We already
have `pickImage(cb)` in `app.js` (crop-square + downscale to ~256px base64 JPEG) used by the profile photo —
reuse it here.

## Scope (do)
1. In the meetup shared space (`viewMeet`), change **"Add meetup photo"** to open `pickImage`; store the returned
   base64 on the match via `ZB_STORE.setMatchPhoto(id, dataUri)` (it already accepts a value — demo stores a
   flag/string; **live must store the base64 string** on `photos[uid]`). Show the chosen photo as a thumbnail in
   the shared space.
2. On **complete** (`completeMatch`), pass the acting user's photo through to the wall post (`post.photo`) so the
   wall shows the **real photo** (the wall/reel already render `photo` when present, else the scene tile).
3. Keep both stores in lockstep: `store.js` (demo) and `store-firebase.js` (live) must handle a base64 photo on
   the match and on the created post.
4. Bump `?v=` in `index.html`.

## Guardrails (do NOT touch)
- Don't change the matching logic, onboarding, welcome screen, leaderboard, or admin.
- Don't alter the `ZB_STORE` method names/signatures beyond storing a real photo (keep the API in lockstep).
- Keep photos downscaled (~256px) so Firestore docs stay small — do **not** store full-res images.
- Don't break the seed-then-replace behaviour (seeds stay client-side, `seed:true`).

## Test steps
- `node tools/test-demo.js` stays green.
- Locally/branch: onboard → spin → match → accept → open shared space → **Add meetup photo** → pick an image →
  thumbnail shows → answer the 3 questions → **Complete** → open **Wall** → the post shows the **real photo**
  (not a scene tile), with the pair's names, hearts, comments.
- Live (2 accounts): confirm the photo persists in Firestore (small doc) and shows on the wall for the *other*
  user too.

## Definition of done
Real meetup photos are captured, stored small, and appear on the community wall for both participants; demo
harness green; both stores in lockstep; `?v=` bumped; `Context/FEATURE-TRACKER.md` ticked; a session log written.
