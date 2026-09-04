# BRIEF-001 · Real photo capture on meetup completion

**Branch:** `feat/meetup-photo-capture`  ·  **Status:** ready for CC

## Decision (Sean, 2026-09-04): ONE SHARED PHOTO per meetup
A meetup has **one** photo of the two colleagues together — not one per person.
**Either participant** can add it; once added it shows for **both** in the shared space and on the
**single** community-wall post for that meetup. If a photo already exists, the other person sees it and
can **replace** it ("Change photo"). No per-user photo slots.

This resolves the open question CC raised on `store-firebase.js:68`
(`photo: !!(d.photos && d.photos[uid])` coerces the base64 to `true`). We drop the per-uid `photos` map
entirely and use a **single `photo` field on the match doc** — which also aligns the live store with the
demo store (`store.js` already keeps a single `m.photo`).

## Goal
Let colleagues attach a **real photo** of their meetup (not just a flag) so genuine photos appear on the
community wall — replacing the seed/scene tiles for real posts, exactly as the seed-then-replace design intends.

## Context
Today the meetup "Share a photo" step (`addPhoto` in `js/app.js`) just sets the photo to `true` (a flag).
The community wall renders real posts with the illustrated scene tile because no real image is stored. We
already have `pickImage(cb)` in `app.js` (crop-square + downscale to ~256px base64 JPEG) used by the profile
photo — reuse it here.

## Scope (do)
1. **Match data model → single shared photo.** Store the meetup photo as one base64 string on the match doc
   field `photo` (nullable). **Remove the per-uid `photos` map** from the live path. In `store-firebase.js`:
   - `setMatchPhoto(id, dataUri)` writes `photo: dataUri` on the match (not `photos[uid]`).
   - `myMatches` (and any single-match read) maps `photo: d.photo || null` — return the **string**, never a
     boolean. (This is the `:68` fix.)
   - Keep `store.js` (demo) in lockstep: `setMatchPhoto` sets a single `m.photo = dataUri`; reads return it.
2. **UI (`viewMeet`).** Change **"Add meetup photo"** to open `pickImage`; on pick, call
   `ZB_STORE.setMatchPhoto(id, dataUri)` and show the photo as a thumbnail in the shared space **for both
   users**. If a photo already exists, show it with a **"Change photo"** action (either participant may replace).
3. **Completion → wall.** On **complete** (`completeMatch`), pass the match's shared `photo` through to the
   single wall post (`post.photo`) so the wall/reel show the **real photo** when present (else the scene tile).
   One meetup → one wall post; whoever completes first creates it with the shared photo.
4. Bump `?v=` in `index.html` (→ **v=7**).

## Guardrails (do NOT touch)
- Don't change the matching logic, onboarding, welcome screen, leaderboard, or admin.
- Keep the `ZB_STORE` method **names/signatures** stable (`setMatchPhoto(id, dataUri)`); only the storage shape
  changes (single `photo` field), and it must change in **both** stores together.
- Keep photos downscaled (~256px) so Firestore docs stay small — do **not** store full-res images.
- Don't break seed-then-replace (seeds stay client-side, `seed:true`, never written to Firestore).
- No `backdrop-filter` on animated/transformed elements.

## Test steps
- `node tools/test-demo.js` stays green.
- Locally/branch: onboard → spin → match → accept → open shared space → **Add meetup photo** → pick an image →
  thumbnail shows → answer the 3 questions → **Complete** → open **Wall** → the post shows the **real photo**
  (not a scene tile), with the pair's names, hearts, comments.
- **Shared-photo check:** as the *other* participant, open the same meetup → the **same** photo shows; use
  **Change photo** → both sides + the wall post update to the new image (still one post).
- Live (2 accounts): confirm the single `photo` persists on the match doc (small), shows for **both** users,
  and the wall shows one post with the real photo.

## Definition of done
One shared meetup photo is captured, stored small on the match (`photo` string), visible to both participants,
and appears on the single community-wall post; the `:68` coercion is fixed (returns the string); demo harness
green; both stores in lockstep; `?v=` bumped to 7; `Context/FEATURE-TRACKER.md` ticked; a dated session log written.
