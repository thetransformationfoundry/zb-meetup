# BRIEF-012 · Make the repo the source of truth for Firestore rules

**Branch:** `chore/firestore-rules-in-repo`  ·  **Status:** ready for CC  ·  **From:** near-miss on BRIEF-003, 2026-09-09
**Priority:** do soon — every rules change until this lands risks the same drift (BRIEF-011 + BRIEF-004 both touch rules).

## Why
Right now the Firestore ruleset lives only in the Firebase console and in ephemeral scratchpad files CC generates
per change. There is no version-controlled copy. `Context/DATA-MODEL.md` already **drifted** from the live rules
(it was missing the `bugReports` block) — pasting the doc version would have silently disabled bug reporting. With
BRIEF-011 and BRIEF-004 both changing rules, this near-miss will recur. We need one unambiguous, diffable source.

## Goal
The **live ruleset is a file in the repo** (`firestore.rules`), changed via normal PRs/branches like any code, so
every rule change is a git diff and "what's live" is never in doubt. `DATA-MODEL.md` stays the human explanation;
`firestore.rules` is the executable truth.

## Scope (do)
1. Add **`firestore.rules`** at repo root, seeded with the **current live ruleset** (the v13 scratchpad set that is
   built from live and includes `bugReports`) — verify it byte-matches what's published before committing.
2. Add a minimal **`firebase.json`** pointing `firestore.rules` at that file (and leave room for `functions` later
   in BRIEF-004), plus `.firebaserc` with the `zb-meetup` project alias. Don't commit any secrets.
3. Document the flow in `Context/SETUP.md` (or a short `Context/RULES.md`): rules are edited in `firestore.rules`
   on a branch; Sean publishes by either pasting that file in the console **or** `firebase deploy --only firestore:rules`;
   the file and the console must always match. Note that **rules only protect once published** regardless.
4. Reconcile `DATA-MODEL.md` so its rules description matches `firestore.rules` (it now includes `bugReports`).
5. No app/client change; no `?v=` bump needed.

## Guardrails (do NOT touch)
- Don't change any rule behaviour in this brief — it's a **lift into the repo of exactly what's live**. Rule
  *changes* belong in their own briefs (011, 004).
- Don't commit service-account keys or any secret. `firebase.json`/`.firebaserc` are safe (no credentials).
- Don't break the existing deploy (GitHub Pages serves the app; this only adds Firebase config files).

## Test steps
- Diff `firestore.rules` against the live console rules — must be identical (no accidental behaviour change).
- `node tools/test-demo.js` green (unaffected).
- If `firebase deploy --only firestore:rules` is used, confirm it publishes the same rules and the BRIEF-009/010
  simulator checks still pass (domain gate + wall-post lock) afterwards.

## Definition of done
`firestore.rules` (+ `firebase.json`/`.firebaserc`) live in the repo, byte-matching the published rules; the
edit→publish flow is documented; `DATA-MODEL.md` reconciled; no behaviour change; demo harness green; tracker +
session log updated.
