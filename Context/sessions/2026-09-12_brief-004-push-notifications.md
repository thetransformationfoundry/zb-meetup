# 2026-09-12 · BRIEF-004 — real push notifications (FCM + SW + Cloud Functions)
Branch `feat/push-notifications` off `main` (v=48) · built to **v=49** · harness **216 checks green** ·
**not merged, nothing deployed** — Functions and rules are Sean's to publish.

Full §Scope 1–5. Identity Platform untouched, per the brief.

## What was built
**Client** — `firebase-messaging-compat.js` added to the live SDK load only; a hand-written
`firebase-messaging-sw.js` at repo root; the push layer in `js/store-firebase.js`
(`pushSupported / pushNeedsInstall / pushState / pushEnable / pushDisable / savePushConsent / onPush`),
mirrored as inert stubs in `js/store.js` so the two stores stay in lockstep and the harness never
touches FCM.

**Consent** — the consent step gains a "Get notified about matches and messages" tick, **checked by
default and untickable**. Unticked means no prompt, no token, no nagging. `pushConsent` is stored on the
profile so the scheduled Functions can respect it server-side, where `Notification.permission` is
invisible. The GDPR copy gained a push line, translated.

**You screen** — a persistent **Push notifications** toggle, both directions, independent of the signup
choice. Off deletes this device's token (`deleteToken` *and* the Firestore document) so the Function has
nothing to send to; "don't ask again" would not have stopped pushes. On re-requests permission, and an
OS-level denial is explained as something only device settings can undo.

**Functions** — four, documented in `Context/FUNCTIONS.md`.

## Decisions worth keeping
**The brief's scope claim was wrong, and it mattered.** It says "GitHub Pages serves from root, so the
SW scope covers the whole app". This is a **project page**: the app is at `/zb-meetup/`, and
`https://thetransformationfoundry.github.io/firebase-messaging-sw.js` is a 404 (verified). The outcome
is still fine — repo root maps to `/zb-meetup/`, whose scope covers the whole app — but the mechanics
differ: the SW must be registered with a **relative** URL, `getToken` must be handed that registration,
and the SW's `notificationclick` must build its URL from `self.registration.scope`. A hardcoded
`/firebase-messaging-sw.js` would have failed in production while working on any localhost root server.
The harness asserts no root-scoped path is hardcoded.

**Pushes are localised; the brief did not ask for this.** The stored notification `text` is English by
design — the bell renders from a key plus the viewer's language. Sending that text verbatim would have
shipped English-only pushes days after BRIEF-023 translated the app. The Function reads the *recipient's*
`lang` and rebuilds the body. This needs a second dictionary (`functions/i18n.js`) because a Function
cannot import the browser one, so the harness asserts the two agree in all three languages.

**No VAPID key yet ⇒ the feature hides itself.** `pushSupported()` returns false when
`VAPID_PUBLIC_KEY` is empty, so there is no toggle and no consent tick rather than a switch that can
only fail, plus a one-time console warning. **Sean must paste the key before this is testable.**

**The token rule is load-bearing.** Firestore rules do **not** cascade into subcollections, so
`users/{uid}` does not cover `users/{uid}/fcmTokens/{token}`. Without the new match, every token write
is denied and push silently never registers — the same failure shape as the BRIEF-003 notifications bug.
It is also deliberately *stricter* than its parent: any signed-in colleague may read `users/{uid}`, but
only the owner may read their own device tokens.

**Reminder query avoids a composite index.** Ranging on `acceptedAt` and filtering `status` in code
keeps the deploy to one command; the equality-plus-range version would have needed an index published
separately.

**Nudge is silent before launch.** The 09:00 job returns early until the spin-unlock instant — a "time
to spin" push before the 16th would deep-link into the countdown. The date is now mirrored in
`functions/index.js`; if it moves, both places change.

## Testing
216 checks. The push checks were verified to **fail** when the regression they guard is introduced:
drifting the service worker's copy of the Firebase config, adding a `notification` block (the
duplicate-push bug), weakening the token rule to any signed-in user, and drifting the Functions' copy of
the push copy were each caught. The demo path asserts `firebase`, `navigator.serviceWorker` and
`Notification` are never touched, and that no toggle or tick renders with push unavailable. The
two-way toggle is exercised against a stubbed `pushState`, since the demo store can never report
supported.

## Not done here, on purpose
Nothing is deployed and no rules are published — handed to Sean with exact commands and a two-phone
script. The VAPID key is still empty in `js/firebase-config.js`.

## Flagged, not fixed (outside this brief)
`finishOnboard`'s error toasts are still hardcoded English — the domain-rejection message, "That email
already has an account" and "Couldn't create the account." The BRIEF-023 audit missed them because they
sit in a ternary inside a concatenated `toast(...)`. Worth a small follow-up.
