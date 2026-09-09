# Session — 2026-09-09 · BRIEF-012 · Firestore rules into the repo

**Branch:** `chore/firestore-rules-in-repo` (off `main` @ eac9602) · **Status:** built, harness 30/30 green,
**awaiting Sean's diff-vs-console check + merge**. No client change, no `?v=` bump.

## What we did
- **`firestore.rules`** at the repo root, seeded byte-for-byte from the v13 set Sean published earlier today
  (sha256 `792f9b16…0eb6`). Lift and shift — **zero rule behaviour changed**.
- **`firebase.json`** declaring only `{"firestore":{"rules":"firestore.rules"}}`, and **`.firebaserc`** with
  the `zb-meetup` default alias. Both validated as JSON. No `firestore.indexes.json` reference — pointing at a
  file that doesn't exist breaks `firebase deploy`; BRIEF-004 adds the `functions` section.
- **`.gitignore`**: `.firebase/`, `firebase-debug.log`, `firestore-debug.log` (CLI local output).
- **`Context/RULES.md`** — the edit → publish → verify → merge flow, the standing Playground checks for
  BRIEF-009/010/003, and the non-negotiables (publish *is* the security event; publish and commit together;
  never commit a service-account key; use a **non-admin** identity for deny checks, since both current
  accounts are admins and would be legitimately allowed).
- **`Context/SETUP.md`** points at it.
- **`DATA-MODEL.md` reconciled by removing its copy of the ruleset**, replaced with a pointer to
  `firestore.rules` plus a per-collection prose table (the *why*) and the three known residual gaps. The
  duplicate copy is precisely what drifted, so deleting it — rather than re-syncing it — is the actual fix.

## Verification, stated precisely
- `firestore.rules` is **byte-identical** (`cmp` + matching sha256) to the file handed over and published for
  the notifications change.
- **What I could not do:** independently read the live console ruleset. The Firebase CLI (15.22.0, installed)
  has no command to fetch rules — `firestore:*` covers delete/indexes/databases/operations only — and the REST
  Rules API needs an access token, which is out of bounds here (and no service-account key is going in this
  repo). So "matches live" rests on the published set being the file as handed over, unedited.
- **How Sean closes that gap in one step:** in the console, select all → copy → paste into a file → compare
  its sha256 to `792f9b16…0eb6`, or paste it back here and I'll diff it. Worth doing once, now, because from
  this commit onward the file *is* the record.

## Secret check
Scanned the three new files for `private_key` / `BEGIN … PRIVATE KEY` / `client_secret` / `serviceAccount` /
`refresh_token` — none. `.firebaserc` holds the project id `zb-meetup`, already public in the live URL;
`firebase.json` holds a file path. Rules themselves are the enforcement layer, safe to publish, and the admin
emails in them were already public in `js/firebase-config.js` and are not credentials.

## Why this mattered
Two doc/live drifts turned up in one day: `DATA-MODEL.md` missing `bugReports`, and its `posts` rule showing a
tightened form that live didn't have. Three of the four significant bugs fixed today were **rules** problems
rather than code, and each was diagnosed by reading a ruleset pasted into chat. From here they are a git diff.
