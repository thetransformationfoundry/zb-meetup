# BRIEF-010 · Lock down the wall-post update rule

**Branch:** `fix/wall-post-update-rule`  ·  **Status:** ready for CC  ·  **From:** CC security flag, 2026-09-09
**Priority:** security — must be live before colleagues are invited (do before BRIEF-003).

## The hole
The published Firestore rule for `posts/{id}` currently lets **any signed-in colleague update any post**, including
overwriting the author, caption, or **photo**. So one colleague could tamper with or replace another's wall post.
Low current blast radius (only Sean + Donnae), but it's a real integrity hole that must close before launch.
CC has already identified the minimal fix and verified it safe against the current code.

## Goal
A colleague can still do the normal social interactions the wall needs — **heart** and **comment** on anyone's
post — but **cannot alter another person's post content** (author, caption, photo). Only the post's author (and
admins) may change the post's own content.

## Scope (do)
1. Update the `posts/{id}` **update** rule so:
   - The **author** (and admins) may update the post's content fields.
   - **Other signed-in colleagues** may only touch the interaction fields the wall relies on (hearts count /
     hearted-by, and appending comments) — not author, caption, or photo.
   - Nobody can change the post's `photo`/author except the author/admin.
   Use a field-diff/allowlist approach (`request.resource.data.diff(resource.data).affectedKeys()`), whatever is
   the minimal safe form CC verified. Keep it tight — don't over-broaden.
2. Update `Context/DATA-MODEL.md` to document the new rule, and note it must be **published** in the console to
   take effect (rules only protect once published — verify after).
3. If any client code assumed it could write arbitrary post fields, confirm it still works under the tighter rule
   (hearts + comments must keep functioning). Bump `?v=` only if client code changes; a rules-only change may not need it.

## Guardrails (do NOT touch)
- Don't break **hearts** or **comments** from other colleagues — those are the whole point of the wall.
- Don't change the one-post-per-meetup guarantee or the seed-then-replace behaviour.
- Keep answers private / photos public split intact. Admin-gating by email unchanged.

## Test steps
- `node tools/test-demo.js` green (demo has no rules, but confirm hearts/comments still work in the UI path).
- Live, two accounts: A creates a post → **B can heart and comment** on it → but **B cannot** overwrite A's
  photo/caption/author (verify in the Firebase rules simulator or by attempting a direct write). A can still edit
  their own post; admin can moderate.
- Confirm the rule is **published** and the simulator denies a non-author content overwrite.

## Definition of done
Wall posts can be hearted/commented by anyone but only the author/admin can change post content (incl. photo);
rule published + verified in the simulator; `Context/DATA-MODEL.md` + tracker updated; hearts/comments unregressed;
demo harness green; session log noted.
