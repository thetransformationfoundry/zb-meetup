# Firestore rules — the repo is the source of truth

`firestore.rules` at the repo root **is** the ruleset. Not a copy, not documentation — the thing itself.
`Context/DATA-MODEL.md` explains *why* each rule exists; this file explains how to change them.

## Why this exists
Before BRIEF-012 the ruleset lived only in the Firebase console, plus throwaway scratch files. `DATA-MODEL.md`
carried its own copy and **drifted**: it was missing the `bugReports` block, so pasting the documented version
over live would have silently disabled bug reporting (default deny). One diffable file removes that class of
mistake.

## The flow

1. **Edit** `firestore.rules` on a branch, like any other change. The diff *is* the review.
2. **Sean publishes.** Two options, and they must not disagree:
   - **Console:** Firebase → Firestore Database → Rules → select all → paste the file → **Publish**.
   - **CLI:** `firebase deploy --only firestore:rules` (uses `firebase.json` → `firestore.rules` and
     `.firebaserc` → project `zb-meetup`). Requires `firebase login` as an account with access.
3. **Verify in the Rules Playground** — never assume. The checks worth re-running after any rules change:
   - `users/{uid}` **create** with an off-domain token email → **Denied**; allowed domain → **Allowed** (BRIEF-009)
   - `posts/{id}` **update** by a **non-author, non-admin** changing `photo` → **Denied**; changing only
     `hearts`/`heartedBy`/`comments` → **Allowed** (BRIEF-010)
   - `notifications/{other}/items/x` **create** with `fromUid` = your uid, `read:false` → **Allowed**;
     with someone else's `fromUid`, or `read:true` → **Denied**; **read** of another's list → **Denied** (BRIEF-003)
   - Use a **non-admin** identity for the deny cases. Both current accounts are admins, and admins are
     legitimately allowed more — an admin uid will come back *allowed* and prove nothing.
4. **Merge** once published and verified, so `main` always reflects what is live.

## Non-negotiables
- **Rules only protect once published.** A merged `firestore.rules` protects nothing on its own. Publishing is
  the security event; the commit is the record.
- **Publish and commit together.** If they diverge, the console wins in reality and the repo lies. If you ever
  edit rules directly in the console, paste them back into `firestore.rules` in a commit.
- **Never commit a service-account / Admin SDK private key.** `firebase.json` and `.firebaserc` hold only the
  project id and file paths — no credentials. Cloud Functions (BRIEF-004) run on the runtime service account
  and need no key in the repo.
- **Rules in a public repo are fine.** Security rules are the enforcement layer, not a secret; publishing them
  reveals no vulnerability. The admin emails in them are already public in `js/firebase-config.js` and are not
  credentials — access still requires authenticating as those accounts.

## Keep in step
`allowedDomain()` in `firestore.rules` and `ALLOWED_DOMAINS` in `js/firebase-config.js` are two expressions of
one decision. Change one, change the other, in the same commit.

## Room for later
`firebase.json` currently declares only `firestore.rules`. BRIEF-004 adds a `functions` section alongside it;
`firestore.indexes.json` can be added if composite indexes are ever needed (it is deliberately absent now —
referencing a file that doesn't exist breaks `firebase deploy`).
