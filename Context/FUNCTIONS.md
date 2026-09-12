# Cloud Functions — ZB MeetUP (BRIEF-004)

Four functions in `functions/`, Node 20, Admin SDK. They run as the project's **runtime service
account** — there is no service-account key in this repo and there must never be one. Admin SDK calls
bypass Firestore rules, which is why sending and dead-token cleanup work even though a colleague can
only ever read their own tokens.

Deployed with `firebase deploy --only functions` (Blaze required — active since 2026-09-08).

## Why the v1 API
`functions/index.js` imports `firebase-functions/v1`. The Firestore database is in **eur3** (EU
multi-region). v2 Firestore triggers run through Eventarc and must be created in a region matching the
database, which is a deploy-time trap for a one-command handoff. The v1 triggers deploy to the default
region against any database location. If the database ever moves to a single region, v2 becomes the
better choice.

## 1. `onNotificationCreated` — the push path
Trigger: `notifications/{uid}/items/{id}` **onCreate**.

Every in-app notification becomes a device push, so **request / accept / message are one code path**.
The bell (BRIEF-003) and push can never disagree, because the notification document *is* the trigger.

- `type: "welcome"` is skipped — it is written during signup, before a token can exist, and pushing
  "welcome" to someone already looking at the app is noise. The bell still shows it.
- Respects `users/{uid}.pushConsent`. **Absent counts as consent**: accounts created before this brief
  have no field, and they only have a token at all if they opted in on that device.
- **Localised.** The stored notification `text` is English (the bell renders from a key + the viewer's
  language). A push built from that text would be English for everyone, so the function reads the
  *recipient's* `lang` and rebuilds the body from `functions/i18n.js`. The sender's first name comes
  from their user document rather than by parsing the English text.

## 2. `dailyReminder` — the 3-day nudge
Schedule: `0 10 * * *`, `Europe/Amsterdam`.

Matches with `acceptedAt` older than 3 days that are still `status: "active"`. Each participant is
reminded **only about their own unfinished part** (`completedBy[uid]`), deep-linking to `meet:<id>`.

The query ranges on `acceptedAt` **only** and filters status in code. Adding `where("status","==",...)`
alongside the range would require a composite index — an extra manual deploy step for no benefit at
this collection's size.

## 3. `dailySpinNudge` — 09:00 Europe/Amsterdam
Schedule: `0 9 * * *`, `Europe/Amsterdam`. Sends "time to spin" (`target: spin`) to everyone who has a
token and has not opted out.

**Silent before the launch instant.** `SPIN_UNLOCK_MS` mirrors `SPIN_UNLOCK` in `js/firebase-config.js`
— telling people to spin while spinning is still locked would deep-link them into a countdown. If that
date moves, change it in **both** places.

## 4. `onMatchPhotoWritten` — the instant +5
Trigger: `matches/{id}` **onUpdate**, and it returns immediately unless `photo` actually changed.

The shared photo is worth +5 to **both** participants, but a client may only write its own user
document — so BRIEF-005 had the other side self-claim on its next sync, seconds later. This grants it
the moment the photo lands.

**Idempotent**: the award runs in a transaction that re-checks `photoAwarded[uid]`, so this function,
the setter's own in-transaction claim and the client fallback can all race without double-paying. The
**client self-claim stays** as the fallback. Writing `photoAwarded` re-triggers the function once more,
which then exits on the unchanged-photo guard.

## Tokens
`users/{uid}/fcmTokens/{token}` — document id *is* the token; fields `createdAt`, `userAgent`.

**Multi-device**: tokens accumulate (phone + laptop) and are never wiped on sign-in. Dead ones are
removed at **send** time when FCM reports `registration-token-not-registered` /
`invalid-registration-token` (`functions/send.js`).

Rule — note that Firestore rules do **not** cascade into subcollections, so this match is required or
push silently never registers:

```
match /users/{uid}/fcmTokens/{token} {
  allow read, write: if isMe(uid);
}
```

Deliberately stricter than `users/{uid}`, which any signed-in colleague may read: device tokens are not
enumerable by anyone but their owner.

## Payloads are data-only
Messages carry `data: { title, body, target }` (all strings) and **no `notification` block**. The
service worker's `onBackgroundMessage` is the sole renderer. Including a `notification` block makes the
browser show its own copy too and every push arrives **twice**.

## Two copies of the push copy
`functions/i18n.js` mirrors `notif_request` / `notif_accept` / `notif_msg` from `js/i18n.js`, plus the
reminder and nudge strings. A Function cannot import the browser dictionary, so `tools/test-demo.js`
asserts the two agree in all three languages — they cannot drift silently.
