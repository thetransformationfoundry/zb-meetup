# BRIEF-013 · Let either match participant update the shared photo on the wall post

**Branch:** `feat/participant-photo-wall` (+ rule via `firestore.rules`)  ·  **Status:** ready for CC  ·  **From:** CC residual on BRIEF-006, 2026-09-09
**Priority:** low — not launch-gating; edge case only. Natural to pair with BRIEF-011's `posts` rule work (same block, one publish).

## Context
BRIEF-001 established one **shared** photo per meetup: either participant can add/replace it, and it shows for both
and on the **single** wall post. BRIEF-010 then locked `posts` content edits to the **author** (+admin). These
collide after completion: if the **non-author** participant replaces the photo, the wall-post update is denied, so
CC's client now **skips** it — the new photo appears in the shared space + recap but the existing wall post keeps
the old one. Safe, but it undercuts the shared-photo intent.

## Goal
Either participant of a meetup may update the **photo** on that meetup's single wall post, without reopening the
post to arbitrary edits by non-authors.

## Scope (do)
1. **Rule (via `firestore.rules`, own diff):** in the `posts` update rule, additionally allow an update whose
   `diff(resource.data).affectedKeys()` is **only `['photo']`** (or `['photo','updatedAt']` if we stamp that) when
   the caller is a participant of the match the post belongs to — i.e. `get(/matches/$(resource.data.matchId)).data`
   has `a` or `b` == `request.auth.uid`. Keep the existing author/admin full-content edit and the
   `['hearts','heartedBy','comments']` allowlist untouched.
2. **Client:** in `setMatchPhoto`, remove the non-author skip so either participant's photo replace updates the
   single wall post (still guarded on `postId`; still one post per meetup).
3. Confirm the `get()` cost is negligible (one read per photo-replace on a completed meetup — rare).
4. Bump `?v=` (client change).

## Guardrails (do NOT touch)
- **Photo-only diff** — do not let non-authors change caption/author/names/anything else. This is the narrow crack, not a re-open.
- Rule change goes through `firestore.rules` on a branch so Sean diffs it before publishing (per BRIEF-012 agreement).
- Keep one post per meetup; keep BRIEF-010's author/admin + hearts/comments behaviour intact.

## Test steps
- `node tools/test-demo.js` green.
- Simulator: as a **participant** (match `a`/`b`) of the post's match, an update touching only `photo` → **Allowed**;
  the same participant touching `photo` + any other field → **Denied**; a **non-participant** touching `photo` → **Denied**.
- Live, two accounts: A creates the wall post; **B (non-author) replaces the shared photo** → it now updates on the
  wall post for both, not just the shared space.

## Definition of done
Either participant can update only the shared photo on the single wall post; non-authors still can't touch other
content; rule diffed + published; demo harness green; `?v=` bumped; tracker + session log updated.
