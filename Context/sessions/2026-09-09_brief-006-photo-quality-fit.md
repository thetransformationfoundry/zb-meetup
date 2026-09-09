# Session — 2026-09-09 · BRIEF-006 · meetup photo quality + card fit (v=15)

**Branch:** `feat/photo-quality-fit` (off `main` @ e6e60dc) · **Status:** built, harness 34/34 green,
**awaiting Sean's test + merge**.

## What we did
- **Capture size is now a parameter.** `pickImage(cb, px)` with `AVATAR_PX=256` and `MEETUP_PX=960`.
  Avatars are unchanged (they only ever render small, no reason to bloat a user doc); meetup photos capture at
  a 960px square, which is what the wall card actually needs. Added a **never-upscale guard**
  (`Math.min(px, shorterEdge)`) so a low-res original stays its own size rather than being blown up — the old
  code always forced 256 regardless of the source.
- **Card fit:** dropped `max-width:220px;margin:0 auto` from the shared-space photo, so it renders full
  card-width, square, `object-fit:cover`, rounded — no more white gutters. The wall and reel already used
  `object-fit:cover` at `sceneSquare()`, so they simply look crisp now.
- **Late-photo wall post (item 4).** Since BRIEF-005 made questions-only completion legal, a photo can arrive
  after completion. `setMatchPhoto(id, photo, post)` now takes optional post metadata and, when the meetup is
  already completed, either refreshes the existing post's photo or creates the one post if none exists —
  still guarded on `postId`, so never a duplicate. Both stores in lockstep.
- `?v=` 14 → 15.

## Size headroom (checked, per the brief)
960px square at q0.82 is roughly 90–200KB of JPEG, so ~120–266KB as base64 — **12–26% of the 1MB doc limit**,
comfortably clear. Still inline base64, no Cloud Storage. Worth eyeballing a real doc in Firestore once.

## A rules interaction worth knowing (not changed)
BRIEF-010 restricts a post's *content* to its author (and admins). So when the wall post already exists and the
**other** participant changes the photo, that write would be denied. Rather than fire a guaranteed failure, the
live store checks `authorUid` and skips the update — the new photo still shows in the shared space and the
recap, just not on the existing wall post.

Making it work for either participant needs a small rules addition: allow a `photo`-only diff when the caller
is a participant of `resource.data.matchId`, via a `get()` on the match. That's a real rules change, so under
the new agreement it goes through `firestore.rules` on its own branch where Sean can diff it — flagged, not
smuggled in here. In practice it only bites when a *completed* meetup's photo is replaced by the non-author.

## A bug I made and the harness caught
First attempt passed `MEETUP_PX` as the second argument to `new Promise(...)` instead of to `pickImage` — a
misplaced paren — so meetup photos silently kept capturing at 256px. The new assertion
("meetup photo captures at 960px, not 256") failed immediately. Worth noting because visual inspection of a
crisp-ish photo on a laptop would plausibly have passed it.

## Harness additions (4)
Avatar captures at 256; meetup captures at 960; a small original is not upscaled; a late photo updates the
existing post without duplicating it. The stub `Image` is now a realistic 2000×1500 with a `__imgPx` knob so
the no-upscale path is genuinely exercised.
