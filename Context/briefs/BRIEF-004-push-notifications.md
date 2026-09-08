# BRIEF-004 · Real push notifications (FCM + service worker + Cloud Functions)

**Branch:** `feat/push-notifications`  ·  **Status:** ready for CC — **Blaze ACTIVE** (2026-09-08)  ·  **From:** live feedback #2 (push half)

## Precondition (satisfied)
Cloud Functions need the Firebase **Blaze** plan. **Done** — Sean upgraded the `zb-meetup` project to Blaze on
2026-09-08 (ZB Cup already runs on Blaze at ~zero cost when idle; same billing account). No blocker remaining;
the Functions can be deployed as part of this brief.

## Goal
Colleagues get real device push (even with the app closed) for: a new **match request**, when someone
**accepts** their request, a new **message**, and a **reminder** if a match is accepted but not completed.
Push is offered + enabled by default at the **consent** step of onboarding.

## Context (real code)
In-app notifications already exist (BRIEF-003 / `addNotif`). This brief adds the *device push* layer on top —
same events, delivered via FCM. Every place that currently calls `addNotif(...)` is a trigger point for a
matching push. Data model: `users/{uid}` already exists; add an `fcmTokens` array/subcollection per user.

## Scope (do)
1. **Web Push client** (`store-firebase.js` + a small init in `firebase-config.js`):
   - Add FCM to the compat SDK load. Register a `firebase-messaging-sw.js` **service worker at repo root**
     (GitHub Pages serves from root, so the SW scope covers the whole app).
   - On consent (enabled by default — see #4), request notification permission and, if granted, get the FCM
     token and store it on `users/{uid}.fcmTokens` (dedupe; remove stale tokens on failure).
   - Handle foreground messages gracefully (in-app toast/bell) and background (SW shows the OS notification,
     click deep-links to the `target` screen).
2. **Cloud Functions** (`functions/` — new; Node, Firestore triggers):
   - On new **request** / **accept** / **message** notif (or the underlying write), send FCM to the recipient's
     tokens with title/body + a `target` for deep-linking.
   - **Scheduled reminder**: once/day, for matches accepted > 3 days ago and not completed by that user, send a
     "finish your meetup" push. (This also delivers the roadmap's 3-day reminder.)
3. **Consent step** (`js/app.js:255`): add a line + default-on toggle — "Get notified about matches and
   messages" — that drives the permission request. Respect a user who declines at the OS level (don't nag;
   re-offerable from Profile). Keep the GDPR consent copy accurate (mention push).
4. **Docs + rules:** document the Functions in `Context/`; ensure Firestore/token rules don't leak tokens
   (a user can write only their own tokens). Bump `?v=`.

## Guardrails (do NOT touch)
- Don't deploy Functions until Blaze is enabled — say so and wait for Sean.
- Don't break the in-app bell (BRIEF-003) — push is additive.
- Don't rotate the public web apiKey. No secrets committed; Functions use the runtime service account, not a key in the repo.
- Keep `ZB_STORE` API in lockstep; keep photos/answers rules intact.

## Test steps
- `node tools/test-demo.js` green (demo path has no push — guard the FCM init behind `ZB_LIVE` so demo/harness don't touch it).
- Live, two accounts on **real phones**: grant permission at consent → request/accept/message each produce an OS push → tapping it deep-links to the right screen. Leave a match accepted + uncompleted → next day the reminder fires.
- Decline permission → app still works, no errors, re-offer available in Profile.

## Definition of done
Real device push for requests/accepts/messages + a 3-day completion reminder, consent-driven and default-on,
with a root service worker and Cloud Functions deployed on Blaze; in-app bell unaffected; demo harness green;
`?v=` bumped; tracker ticked; session log written.
