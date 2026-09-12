# BRIEF-024 · Code audit + safe cleanup (dead code, dictionary hygiene, store parity, latent bugs)

**Branch:** `chore/audit` (Phase 1 is read-only) → `chore/cleanup-*` per approved item (Phase 2) · **Status:** ready for CC
**From:** Sean, 2026-09-12 · **Timing: BEFORE MONDAY 14 Sep signups** (Sean's call — catch bugs before real users
arrive). This is only safe *because* of the two-phase discipline below: a read-only audit, then only Sean-approved
fixes as small verified commits — never a big-bang refactor. If any approved fix looks risky or wide, it is deferred
past launch rather than rushed in.

### Running in parallel with BRIEF-004 (push)
Push is being built on `feat/push-notifications`; this audit runs at the same time. Keep them from colliding:
- **Phase 1 is read-only** — audit against current `main` (v=48); it touches no code, so it can never conflict
  with the push branch. Do it first.
- **Phase 2 fixes** go on their own `chore/cleanup-*` branches off `main` and merge to `main` before Monday.
  Whichever of {cleanup, push} merges first, the other **rebases onto the updated `main`** before its own merge
  (CC flags any real conflict to Sean rather than resolving product logic silently). Don't fold cleanup commits
  into the push branch.
- If a bug the audit finds is **launch-critical** (breaks signup, matching, points, rules, or the countdown), raise
  it immediately as its own tiny fix — don't wait for the full Phase-2 pass.

## Why
The app has grown fast across ~24 briefs on a no-build codebase with two hand-kept stores and a 277-key i18n
dictionary. Things accumulate: unused functions, orphaned CSS/design tokens, dictionary keys referenced-but-missing
or defined-but-unused, `ZB_STORE` methods that drifted between the demo and live stores, dead assets, and latent
bugs no screenshot happened to catch. This brief finds them and removes the safe ones — **without changing any
behaviour**.

## Non-negotiable shape: audit first, fix second, one category per commit
This is a **live, public-repo app with real users**. The failure mode of "cleanup" is a silent regression. So:
- **Phase 1 is READ-ONLY.** CC produces a findings report and changes no product code.
- **Phase 2 touches only what Sean ticks.** Each approved category is its own small commit on its own branch,
  harness green before and after, with a one-line "why this is safe / what could it have affected" note. No
  big-bang refactor, no drive-by "while I'm here" edits, no logic or rules changes except a flagged, agreed bug fix.

## Phase 1 — Audit (read-only). Deliverable: `Context/audits/2026-09-1x_code-audit.md`
A findings report, each item tagged **[remove] / [fix] / [keep, documented] / [needs Sean]** with the file+line and
a one-line risk note. Cover:

1. **Dead JavaScript.** Functions/consts defined but never referenced; unreachable branches; commented-out blocks;
   `console.log` left in. Grep-based, cross-checked against inline `onclick=` handler names (those are string
   references, easy to miss — a function used only from an inline handler is NOT dead).
2. **`ZB_STORE` parity (highest value).** Diff the method surface of `js/store.js` vs `js/store-firebase.js`. Every
   method must exist in both with the same signature and contract (CLAUDE.md guardrail). Report any method in one
   store and not the other, or where the demo behaviour no longer mirrors live. This is the likeliest place a real
   bug hides.
3. **i18n dictionary hygiene.** Cross-reference `js/i18n.js` keys against every `t(...)` / `ZB_T(...)` call site:
   - keys **referenced but missing** (would render the raw key — a visible bug),
   - keys **defined but never used** (dead),
   - rows **missing a language** (would silently fall back to English),
   - any hard-coded UI string in `app.js` that reaches the DOM but bypasses the dictionary (continue the Round-9
     DOM-literal audit method — tag text, `toast()` args, `textContent=`, placeholders, `aria-label`s).
4. **CSS / design tokens.** Undefined tokens referenced (render silently wrong — CLAUDE.md guardrail), tokens
   defined but unused, duplicate/orphaned rules, and any lingering `backdrop-filter` on transformed/animated
   elements (the Android flicker guardrail).
5. **Unused assets.** Files in `assets/` not referenced anywhere; oversized inline base64 images; icons no longer used.
6. **Latent bugs / edge cases (report, don't fix yet).** Points-economy edge cases (double-award, floor at 0),
   seed-then-replace boundaries, notification `target` values with no matching route, missing `await`s / unhandled
   promise rejections, error paths that fail silently, `?v=` / version-stamp consistency, and anything that only
   works because of current data rather than by construction.
7. **Console + network at runtime.** Load each screen in the demo and note console errors/warnings and any obviously
   redundant Firestore reads (report only; performance tuning is out of scope unless it's a bug).
8. **Repo hygiene.** Confirm no secrets/personal data crept in (the seed-name CI guard should still pass); confirm
   the `refresh-demo.sh` safety fix (staging dir + `ZB_LIVE=false` override enforced) is in place and documented so
   the demo can never again be swapped in wired to live Firestore.

## Phase 2 — Apply only what Sean approves
For each ticked item: smallest possible change, its own commit/branch, `node tools/test-demo.js` green before and
after, `?v=` bumped once at the end. Removing dead code must be provable (grep shows zero references incl. inline
handlers). Any **[fix]** for a real bug gets a harness assertion added so it can't regress. If a fix would touch
Firestore rules, matching, points, countdown or push, it stops and becomes its own briefed change with Sean's
publish — not folded in here.

## Guardrails (do NOT touch)
- No behaviour change in Phase 2 except an explicitly agreed bug fix. Cleanup ≠ redesign.
- Keep the two stores' `ZB_STORE` API in lockstep — if you add/remove a method, do it in both.
- Don't rotate the public web apiKey; don't commit secrets or personal data; keep the seed-name guard passing.
- Don't remove anything referenced only from an inline `onclick=`/`onkeydown=` string until you've grepped for it.
- Don't restructure into a build step, modules, or a framework — the no-build architecture is deliberate.
- Admin, export and matching logic stay behaviour-identical unless a flagged bug says otherwise.

## Test steps
- `node tools/test-demo.js` green after every Phase-2 commit.
- Spot-check the surfaces touched by any removal in the demo (two-account flow if a store method was involved).
- After merge, a quick live smoke test of the affected areas with two accounts.

## Definition of done
Phase 1 audit report committed under `Context/audits/`, triaged with Sean. Phase 2: only the approved items applied,
each a small verified commit, harness green, no behaviour change beyond agreed fixes (each with a new regression
assertion), stores kept in lockstep, `?v=` bumped, tracker + session log updated. Anything deferred is recorded as
a follow-up item rather than half-done.
