# Session — 2026-09-04 · BRIEF-001 · real meetup photo capture (v=7)

**Branch:** `feat/meetup-photo-capture` (off `chore/sync-and-tooling`, see note) · **Status:** built, harness
green, **awaiting Sean's local test + merge**.

## Decision applied
Sean, 2026-09-04: **one shared photo per meetup**, not one per person. Either participant adds it; both see
it; either can replace it; one wall post per meetup.

## What we did
- **`js/store-firebase.js`** — dropped the per-uid `photos` map:
  - `setMatchPhoto(id, dataUri)` now writes a single `photo` field on the match doc.
  - `createMatch` seeds `photo:null` (was `photos:{}`).
  - **The `:68` fix:** `mapMatch` returned `!!(d.photos && d.photos[uid])`, coercing the base64 to `true` —
    which made `completeMatch`'s `typeof m.photo==='string'` check fail, so the wall post always got `null`.
    It now returns the **string** via a new `matchPhoto(d)` helper.
  - `completeMatch` prefers the photo stored **on the match** (`d.photo`) if the client's copy is stale.
- **`js/store.js`** (lockstep) — `setMatchPhoto` stores a single `m.photo` string; `newMatch` seeds
  `photo:null` (was `false`); `completeMatch` falls back to the match's shared photo.
- **`js/app.js`** — `addPhoto` now opens `pickImage` (crop-square, ~256px base64 JPEG — the same picker as the
  profile photo) and stores the result. `viewMeet` shows the real photo as a square thumbnail with a
  **"Change photo"** action; falls back to the old gradient tile only for legacy flag-only matches.
  `addPhoto` returns a Promise that resolves once stored (so the harness can await it).
- **`tools/test-demo.js`** — stubbed `FileReader` + `Image` and made the stub file input fire `onchange`, so
  the test exercises the *real* capture path. Added two checks: the match photo is a `data:image/…` string,
  and exactly **one** wall post carries it. **10/10 green, exit 0.**
- **`index.html`** — all five `?v=` refs bumped **6 → 7**.
- Docs: `Context/DATA-MODEL.md` (match `photoBy` map → single `photo`), `Context/FEATURE-TRACKER.md` ticked.

## Notes for Sean
- **Branched off `chore/sync-and-tooling`, not `main`.** `main` is still at v=5 with no `pickImage` and no
  harness, so a branch off `main` couldn't reuse the picker or be tested. Merge the sync branch first, then
  this one — they're stacked and will fast-forward cleanly.
- **No Firestore rules change needed:** `match /matches/{id}` lets participants update the doc with no field
  allowlist, so the new `photo` field writes fine under the published rules.
- **Live migration:** matches created before v=7 hold `photos:{uid:true}` and no `photo`. `matchPhoto(d)` reads
  that legacy map as a fallback, so in-flight meetups keep their completed photo step (they just show the
  gradient tile rather than a real image, since only a flag was ever stored). Not in the brief — added to
  avoid regressing live users mid-meetup.
- Firestore doc size: a 256px JPEG at q0.82 is roughly 8–15 KB of base64, well inside the 1 MB doc limit.

## Open items
- Sean to test locally, then merge **both** branches to `main` (= deploy) and verify live with two accounts.
- Next candidates: version footer + CI harness check; Donnae's ~50-question bank.
