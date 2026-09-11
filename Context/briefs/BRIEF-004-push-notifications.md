# BRIEF-004 · Real push notifications (FCM + service worker + Cloud Functions)

**Branch:** `feat/push-notifications`  ·  **Status:** ready for CC — **Blaze ACTIVE** (2026-09-08)  ·  **From:** live feedback #2 (push half)

> **PRIORITY (Sean, 2026-09-11): pulled to PRE-LAUNCH, FULL scope** (all of §Scope 1–5, incl. the 3-day reminder
> and the instant shared-photo-award Function). **Real deadline = Wed 16 Sep 09:00 spin-unlock**, not Monday
> signups — push only fires once people match. **Sequence: merge `feat/multilingual` (BRIEF-023/023A) to `main`
> FIRST**, then branch `feat/push-notifications` off the updated `main` (keeps the languages merge and the
> server-side push work as separate, clean diffs). Sean must: (a) generate the Web Push VAPID key now (§Sean's
> console step), (b) be ready to `firebase deploy --only functions` and publish the token rule when CC hands off.

## Precondition (satisfied)
Cloud Functions need the Firebase **Blaze** plan. **Done** — Sean upgraded the `zb-meetup` project to Blaze on
2026-09-08 (ZB Cup already runs on Blaze at ~zero cost when idle; same billing account). No blocker remaining;
the Functions can be deployed as part of this brief.

## NOT required: Identity Platform (Sean, 2026-09-10)
Push (FCM + service worker + Cloud Functions to send) does **NOT** need Identity Platform — it runs on plain
Firebase + Blaze. **Do not upgrade to Identity Platform for this brief.** The `beforeCreate` Auth **blocking
function** (the only thing that would need it) is **dropped from scope** — the domain restriction is already fully
enforced by the published Firestore `users` create rule + the client check (BRIEF-009). If the belt-and-braces
blocking function is ever wanted, it's a separate future decision (and Identity Platform upgrade) — not now.

## Goal
Colleagues get real device push (even with the app closed) for: a new **match request**, when someone
**accepts** their request, a new **message**, and a **reminder** if a match is accepted but not completed.
Push is offered + enabled by default at the **consent** step of onboarding.

## Context (real code)
In-app notifications already exist (BRIEF-003 / `addNotif`). This brief adds the *device push* layer on top —
same events, delivered via FCM. Every place that currently calls `addNotif(...)` is a trigger point for a
matching push. Data model: `users/{uid}` already exists; add an `fcmTokens` subcollection per user.

## Reference: Manna's proven push implementation — adopt the DECISIONS, adapt the MECHANICS
Manna (another of our apps) has working web push; its writeup (2026-09-10) gave these lessons. **Manna is a Vite
build; ZB MeetUP is deliberately no-build + compat SDK — so keep Manna's design choices, re-implement the plumbing
our way:**
- **Service worker:** Manna uses a Vite-built SW — WE CAN'T. Hand-write **`firebase-messaging-sw.js` at repo root**
  (scope `/`, which FCM needs) using the **compat** SDK via `importScripts(...firebase-app-compat.js, ...firebase-messaging-compat.js)`
  from gstatic (same CDN we already use). No bundler.
- **Data-only payloads (important):** send FCM with **no `notification` field** — put `title`/`body`/`target` in
  `data` (all strings). The SW's `onBackgroundMessage` is the *sole* renderer (`showNotification`). Including a
  `notification` block causes **duplicate notifications** (browser auto-shows + SW shows). Manna hit this; avoid it.
- **Token store:** `users/{uid}/fcmTokens/{token}` (token = doc id) with `createdAt`/`userAgent`. **Self-heal:** the
  Cloud Function cleans tokens that return `invalid-registration-token` / `registration-token-not-registered` from
  `sendEachForMulticast`. **Go multi-device** (keep all a user's tokens — colleagues may use phone + laptop; don't
  copy Manna's single-device wipe), relying on send-time cleanup for dead ones.
- **Support gate:** wrap client FCM in an `isSupported()` check (compat: guard on `firebase.messaging.isSupported()`)
  and never call messaging in unsupported contexts. Request permission **only from a user gesture**.
- **"Active" ≠ permission:** track push-enabled by **whether a real token exists in Firestore**, not by
  `Notification.permission` (permission can stay granted after tokens are gone).
- **iOS install-first:** iOS web push only works when the app is **installed to the Home Screen** (standalone,
  iOS 16.4+). Detect iOS + not-standalone and show our existing **A2HS** hint ("add to Home Screen first") instead
  of a permission prompt that would silently no-op. So on iOS the order is **install → then ask permission**.
- **One deep-link source:** Manna's type→route map drifted because it lived in two places (SW + app). WE already
  have a single `target` on every notification (`meetups` / `thread:<id>` / `spin` / `meet:<id>`). The SW's
  `notificationclick` must deep-link using that **same `target`** — do not invent a second mapping.
- **Pair push with the in-app notif:** every push already corresponds to a `notifications/{uid}/items/{id}` doc.
  Cleanest trigger: a Cloud Function on **`notifications/{uid}/items/{id}` onCreate** → send push to that uid's
  tokens using the doc's `text`/`target`. That reuses the existing in-app inbox as the push source (one code path).

## Sean's console step (needed once)
Generate a **Web Push certificate (VAPID key)**: Firebase Console → Project Settings → Cloud Messaging → Web Push
certificates → generate key pair. Give the **public** key to CC (it's public, safe in client code). No Identity Platform.

## Scope (do)
1. **Web Push client** (`store-firebase.js` + a small init in `firebase-config.js`):
   - Add FCM to the compat SDK load. Register a `firebase-messaging-sw.js` **service worker at repo root**
     (GitHub Pages serves from root, so the SW scope covers the whole app).
   - On consent (enabled by default — see #4) **and from a user gesture**, request permission and, if granted,
     `getToken({ vapidKey, serviceWorkerRegistration })` and store at `users/{uid}/fcmTokens/{token}` (multi-device;
     see Reference). Gate on `isSupported()`. Track "enabled" by token presence, not `Notification.permission`.
   - iOS: install-first per the Reference (reuse our A2HS hint; ask permission only once standalone).
   - Foreground `onMessage` → light in-app toast/bell; background handled by the root SW (`onBackgroundMessage` →
     `showNotification`), and `notificationclick` deep-links via the notification's existing `target`.
2. **Cloud Functions** (`functions/` — new; Node, Admin SDK):
   - **Trigger on `notifications/{uid}/items/{id}` onCreate** → send **data-only** FCM (title/body/target in `data`,
     stringified) to that uid's tokens via `sendEachForMulticast`; clean invalid tokens from the response. This
     covers request / accept / message in one path (they already write that in-app notif).
   - **Scheduled reminder**: once/day, for matches accepted > 3 days ago and not completed by that user, send a
     "finish your meetup" push. (This also delivers the roadmap's 3-day reminder.)
   - **Daily spin nudge (from Sean, 2026-09-10):** a scheduled function at **09:00 Europe/Amsterdam** sends every
     user who has a token + notification consent a "Time to spin — meet someone new today" push (`target: spin`).
     Respect consent/opt-out; don't send to users who declined.
3. **Consent step** (`js/app.js:255`): add a line + default-on toggle — "Get notified about matches and
   messages" — that drives the permission request. Respect a user who declines at the OS level (don't nag;
   re-offerable from Profile). Keep the GDPR consent copy accurate (mention push).
4. **Instant shared-photo award (from BRIEF-005):** BRIEF-005 made the photo's +5 to the *other* participant a
   client "self-claim" (lands on their next sync, seconds later) because rules forbid a participant writing
   another user's points doc. With Blaze on, add a Cloud Function that grants the other participant's +5 the
   moment a shared photo is set, so it's truly instant and doesn't depend on their client being open. Keep the
   client self-claim as the fallback; the Function must be idempotent (respect `photoAwarded[uid]`, never double-award).
5. **Docs + rules:** document the Functions in `Context/`; ensure Firestore/token rules don't leak tokens
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
