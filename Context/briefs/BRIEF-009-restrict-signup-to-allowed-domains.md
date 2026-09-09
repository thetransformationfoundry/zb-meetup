# BRIEF-009 · Restrict account creation to allowed email domains

**Branch:** `feat/allowed-domains`  ·  **Status:** ready for CC (run after BRIEF-002 merges)  ·  **From:** Sean, 2026-09-09
**Priority:** launch-gating — must be live before any colleagues are invited beyond Sean + Donnae.

## Goal
Only people with a **Zimmer Biomet** or **The Transformation Foundry** email can create an account and use the app.
Everyone else is blocked — the app is closed to the world, open only to the two org domains.

Allowed domains (single source of truth): **`zimmerbiomet.com`**, **`thetransformationfoundry.nl`**.
(Current accounts both pass: Sean `@thetransformationfoundry.nl`, Donnae `@zimmerbiomet.com`.)

## Context (real code)
- Account creation starts at `obCreate()` (`js/app.js:263`): it validates the email is non-empty and the password
  is ≥6 chars, then advances onboarding and eventually calls `S.signUp` in the live store. There is **no domain
  check** — any email is accepted.
- Admin gating already uses an email allow-list pattern (`ADMIN_EMAILS` in `js/firebase-config.js`) — mirror that
  for domains: add `ALLOWED_DOMAINS = ['zimmerbiomet.com','thetransformationfoundry.nl']` in one place.
- Firestore rules (`Context/DATA-MODEL.md`) gate `users/{uid}` writes to self/admin — they don't yet check the
  email domain on **create**.

## Scope (do)
1. **Client UX check** (`obCreate`): before creating anything, if the email's domain isn't in `ALLOWED_DOMAINS`,
   stop with a clear, friendly toast — e.g. "ZB MeetUP is for Zimmer Biomet colleagues — please use your
   @zimmerbiomet.com email." Case-insensitive; trim; handle missing `@`. Do this in **both** stores' path where
   relevant so the demo behaves consistently.
2. **Server enforcement — Firestore rules (the real gate):** allow creating a `users/{uid}` profile doc only if
   `request.auth.token.email` ends in an allowed domain (plus the existing self/admin rules). This means even if
   someone forces an auth account, they get no profile and therefore no app access. Update `Context/DATA-MODEL.md`
   with the new rule and note it must be **published** in the Firebase console to take effect (rules only protect
   once published — verify after).
3. **Strongest enforcement (recommended, now Blaze is on):** a Firebase Auth **`beforeCreate` blocking function**
   that rejects sign-ups whose email domain isn't allowed, so no auth account is ever created off-domain. Note:
   blocking functions require Identity Platform (a Blaze feature) enabled on the project — flag if it needs a
   console toggle. If this is deferred, rules (#2) remain the hard gate; the blocking function is the clean finish
   and can ride with the BRIEF-004 Functions work.
4. Keep the welcome copy accurate (it already says "For Zimmer Biomet colleagues only"). Bump `?v=`.

## Guardrails (do NOT touch)
- Don't break existing accounts (both current admins are on allowed domains).
- Don't hardcode domains in multiple files — one `ALLOWED_DOMAINS` constant, reused.
- Keep `ZB_STORE` API in lockstep. Don't change matching/points/onboarding steps beyond the domain check.
- Rules change is real security — verify in the console after publishing; don't assume unpublished rules protect anything.

## Test steps
- `node tools/test-demo.js` green (add a check: an off-domain email is rejected at create; an allowed one passes).
- Live: try to create an account with a personal email (e.g. gmail) → blocked with the friendly message, no auth
  account, no profile. Create with an `@zimmerbiomet.com` / `@thetransformationfoundry.nl` email → works.
- With rules published, confirm (Firebase console / rules simulator) that a `users/{uid}` create with an
  off-domain token email is **denied**.
- Existing accounts (Sean, Donnae) still sign in and use the app normally.

## Definition of done
Only allowed-domain emails can create an account and get a profile; enforced client-side (UX) **and** by published
Firestore rules (hard gate), with an optional Auth blocking function as the strongest finish; existing accounts
unaffected; demo harness green; both stores in lockstep; `?v=` bumped; `Context/DATA-MODEL.md` + tracker updated;
session log written.
