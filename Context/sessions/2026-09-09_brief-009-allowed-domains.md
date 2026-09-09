# Session — 2026-09-09 · BRIEF-009 · restrict signup to allowed domains (v=12)

**Branch:** `feat/allowed-domains` (off `main` @ 948a1cf) · **Status:** built, harness 27/27 green,
**awaiting Sean's test + merge + a rules publish**. Launch-gating.

## What we did
- **One source of truth** — `ALLOWED_DOMAINS` in `js/firebase-config.js`
  (`zimmerbiomet.com`, `thetransformationfoundry.nl`), plus two helpers alongside it so nothing re-implements
  the check: `window.ZB_DOMAIN_OK(email)` and `window.ZB_DOMAIN_HINT()` (the "@a or @b" string used in
  messages). The domain match is **exact and case-insensitive**, taken from the last `@`, so
  `x@notzimmerbiomet.com` and `x@zimmerbiomet.com.evil.tld` are both rejected.
- **Client UX gate** — `obCreate()` stops before onboarding starts with: *"ZB MeetUP is for Zimmer Biomet
  colleagues — please use your @zimmerbiomet.com or @thetransformationfoundry.nl email."*
- **Defence in depth** — `signUp` in **both** stores rejects with `zb/domain-not-allowed` rather than
  trusting the UI, and `finishOnboard()` surfaces that code with the same friendly message.
- **The hard gate — Firestore rules** (`Context/DATA-MODEL.md`): a new `allowedDomain()` helper, and
  `users/{uid}` create is now `isMe(uid) && allowedDomain()`. No profile means no app, so even a forced auth
  account gets nowhere. **These rules do nothing until published** — see the publish steps in the handover.
- `?v=` 11 → 12. Harness: 3 new checks (off-domain blocked at create; the store refuses an off-domain
  sign-up; the constant and matcher behave, including the two near-miss domains above).

## The Identity Platform question (asked in the brief — answered)
**Yes, it needs a console toggle, so it is deferred.** Auth `beforeCreate` blocking functions are a feature of
**Firebase Authentication with Identity Platform**, not classic Firebase Auth. Enabling it is a one-off,
project-level upgrade in the console (Authentication → Settings → *Upgrade to Firebase Authentication with
Identity Platform*), and it is not cleanly reversible. Blaze being on is necessary but not sufficient.

Recommendation: **don't toggle it for this brief.** The published rules already close the hole that matters
(no profile => no app access), the client + store checks stop it long before that, and the upgrade deserves
its own decision rather than riding along here. It belongs with **BRIEF-004**, where Functions are being set
up anyway — a `beforeCreate` function is then a few lines and stops the off-domain *auth* account from ever
existing, which is the only gap left.

## Residual gap while the blocking function is deferred
Someone determined could still create an *auth* account on any domain (via the Firebase JS SDK against our
public config — the apiKey is public by design). They get no profile doc, so no spin, no matches, no wall, no
app. The visible symptom would be orphaned auth users in the console with no corresponding `users/` doc. Worth
a glance in Firebase → Authentication before launch; harmless, but that's what to look for.

## Left intact
Existing accounts (both admins are on allowed domains — nothing about sign-in or `update`/`delete` changed),
matching, points, onboarding steps beyond the domain check, and the welcome copy (which already said "For
Zimmer Biomet colleagues only" — now actually enforced).
