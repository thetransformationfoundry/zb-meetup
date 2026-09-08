# BRIEF-006 · Meetup photo quality + fit

**Branch:** `feat/photo-quality-fit`  ·  **Status:** ready for CC  ·  **From:** live feedback #5 + #7

## The problems (real code)
- **Pixelated wall photo (#7):** `pickImage` downscales every photo to a **256px** square at JPEG q0.82
  (`js/app.js:66` `var s=256`, `:69` `toDataURL('image/jpeg',0.82)`). 256px is fine for an avatar but the wall
  card renders ~400px+ wide, so it upscales and goes soft. **Storage format is correct** — base64 JPEG string,
  same as ZB Cup (confirmed: ZB Cup stores `photoURL: "data:image/jpeg;base64,…"`). The fix is resolution, not format.
- **White gutters in the meetup card (#5):** the shared-space photo renders at `max-width:220px;margin:0 auto`
  (`js/app.js:332`), so it's a narrow centred square leaving white space left/right of the card.

## Scope (do)
1. **Parameterise `pickImage`** so it can capture at a larger size for meetup/wall photos while avatars stay small:
   - Meetup photos: longer edge **~1080px** (or a ~960px square), JPEG q~0.82. This keeps the base64 well under
     Firestore's 1MB/doc limit (~120–250KB typical) — verify the resulting doc size stays comfortably small.
   - Profile avatars: keep ~256px (no need to bloat avatar docs). Do this via a size argument or a second helper —
     your call — but keep the crop-square + downscale behaviour.
2. **Fill the meetup card (#5):** render the shared photo full card-width (remove `max-width:220px`) with a
   sensible aspect ratio (square or ~4:3), `object-fit:cover`, rounded corners — like the wall/`sceneSquare`
   treatment (`js/app.js:38`) — so there are no white gutters.
3. Confirm the wall + reel already use `object-fit:cover` (they do at `:38`) so the higher-res photo simply looks crisp.
4. **Late-photo wall post (from BRIEF-005, flagged by CC):** the wall post is created on first completion. Since
   questions-only completion is now legal, a meetup completed without a photo, then given a photo later, produces
   no post (or a photoless one that never gets the image). Fix in `setMatchPhoto`: if the meetup is already
   completed and has a `postId`, update that post with the new photo; if it's completed with no post yet, create
   the one post now. Still exactly one post per meetup (guard on `postId`).
5. Bump `?v=`.

## Guardrails (do NOT touch)
- Keep the photo **shared** (BRIEF-001) and **base64 inline** — do NOT introduce Cloud Storage.
- Stay under Firestore's 1MB doc limit — don't ship full-res; ~1080px is the ceiling.
- Keep `ZB_STORE` API in lockstep. No emojis. Don't change the seed scene tiles' look.

## Test steps
- `node tools/test-demo.js` green (FileReader/Image stubs already exist in the harness — keep them working).
- Take a real photo: it appears **crisp** on the wall (no pixelation) and **fills** the meetup card (no white gutters).
- Inspect the match doc in Firestore — photo string is present and the doc is well under 1MB.
- Profile avatar still looks fine and its doc didn't balloon.

## Definition of done
Meetup photos capture at a wall-friendly resolution (crisp, still small base64, no Cloud Storage) and fill the
meetup card edge-to-edge; avatars unchanged; demo harness green; both stores in lockstep; `?v=` bumped; tracker
ticked; session log written.
