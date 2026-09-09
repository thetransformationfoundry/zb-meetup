# BRIEF-011 · Wall integrity hardening (comment identity + interaction values)

**Branch:** `fix/wall-integrity`  ·  **Status:** ready for CC  ·  **From:** CC residual flags on BRIEF-010, 2026-09-09

Two gaps BRIEF-010 left open (it constrained *which* fields non-authors can touch, not the *identity* or *values*).

## Part A — Comment attribution (do before wider launch)
**The gap:** comments are attributed by a **client-supplied display name**. `Context/DATA-MODEL.md` specs a comment
as `{ by:uid, byName, text, at }`, but the code writes `{ by:<display name>, text, at }` with **no uid** — so a
direct write could post a comment under **another colleague's name**. Identity spoofing on the community wall is a
trust problem for a colleague app; close it before the wider invite.

**Do:**
1. Store comments with a **server-trustable author id**: `byUid` = `request.auth.uid`, plus `text`, `at`. Render
   the display name from the author's **profile** (`users/{byUid}`), not from a client-supplied string.
2. Firestore rule: a non-author appending a comment may only add a comment whose `byUid == request.auth.uid`
   (can't post as someone else). Keep hearts/comments writable by others per BRIEF-010, just tightened.
3. Reconcile `Context/DATA-MODEL.md` with the real shape (it currently drifts from the code).
4. Migrate/handle existing comments (old ones have no `byUid`) gracefully — render what's there, don't crash.
5. Bump `?v=` (client code changes here).

## Part B — Interaction value validation (backlog unless hearts feed prizes)
**The gap:** the BRIEF-010 rule constrains *fields* (`hearts`,`heartedBy`,`comments`) but not *values* — a direct
write could set `hearts` to any number or append many comments at once. Low impact while the wall is purely
internal/social; **matters if hearts ever count toward prizes or rankings.**

**Do (only when prioritised):**
1. Rule asserts a **±1 delta** on `hearts` and that `heartedBy` only gains/loses the **caller's own uid**
   (`request.auth.uid`), so a colleague can heart/un-heart once, not inflate the count.
2. Constrain a comment write to appending **one** comment at a time.
3. Rules-only where possible (no `?v=` needed for Part B alone).

## Guardrails (do NOT touch)
- Don't break hearts/comments for normal colleagues (BRIEF-010 behaviour stays).
- Keep one-post-per-meetup + seed-then-replace intact. Answers private / photos public unchanged.
- Keep `ZB_STORE` API in lockstep. No emojis.

## Test steps
- `node tools/test-demo.js` green (comments carry `byUid`; name renders from profile).
- Live, two accounts: B comments on A's post → shows B's real name (from profile), not a spoofable string.
  Simulator: a comment write with `byUid` ≠ caller uid is **Denied**.
- Part B (if built): simulator shows `hearts` jump of >1, or adding another user's uid to `heartedBy`, is **Denied**.

## Definition of done
Comments are attributed by trustable `byUid` with names rendered from profiles (no spoofing); DATA-MODEL matches
the code; (Part B, if prioritised) heart/comment values are delta-validated; hearts/comments unregressed; rules
published + verified; demo harness green; both stores in lockstep; tracker + session log updated.
