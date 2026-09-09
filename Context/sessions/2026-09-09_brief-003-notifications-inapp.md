# Session — 2026-09-09 · BRIEF-003 · in-app notifications + composer layout (v=13)

**Branch:** `feat/notifications-inapp` (off `main` @ 10b8470) · **Status:** built, harness 30/30 green,
**awaiting Sean's test + a rules publish + merge**.

## Root cause — it was never the client

The brief asked me to find why the request notification never reached Sean's bell before changing anything.
It is **the published Firestore rule**:

```
match /notifications/{uid}/items/{id} { allow read, write: if isMe(uid); }
```

`addNotif(uid, …)` writes into the **recipient's** subtree — `notifications/<their uid>/items` — for all three
events (`request` → `other.uid`, `accept` → `d.a`, `msg` → `other`). `isMe(uid)` permits writing **only your
own** subtree, so every cross-user notification has been **denied since day one**. The only notification that
ever worked is `welcome()`, which writes to yourself — which is exactly why the bell has only ever shown the
welcome item. No client change could have fixed this, and the client was in fact already correct:
`viewNotifs()` renders every notif, `openNotif()` honours `n.target` via `go()`, and the notif `onSnapshot`
already triggers `refresh()`.

### The knock-on effect, which is worse than the missing bell item
`addNotif` was `await`ed **after** the real write in `createMatch`, `acceptMatch` and `sendMessage`, and none
of the callers (`sendReq`, `acceptReq`, `sendMsg` in `app.js`) has a try/catch. So on every live use the
permission error **rejected the whole call after the match/accept/message had already been written**: the
"Request sent" and "Matched!" toasts never fired and `refresh()` never ran. It only looked like it worked
because the realtime match listener re-rendered a moment later. This is very likely behind more than one of
the "it didn't seem to do anything" observations from the live test.

## What we did
- **Rules (the actual fix):** split the notifications rule — `read, update, delete` stay `isMe(uid)`, and a new
  constrained `create` lets a signed-in colleague *deliver* a notification: they must stamp
  `fromUid == request.auth.uid`, cannot pre-mark it `read`, and cannot write fields outside
  `[type, icon, text, target, fromUid, read, createdAt]`. They still cannot read or edit anyone's list.
- **`addNotif` is now non-fatal** (`store-firebase.js`): wrapped in try/catch, logs a warning, returns null. A
  notification that can't be delivered must never abort the match request, accept or message that triggered
  it. It also now stamps `fromUid`, which the rule requires (and which `DATA-MODEL.md` already specified).
- **Composer overlap (#4):** `.threadcard` was `height:calc(100vh - 220px)`. On mobile Safari `100vh` counts
  the browser chrome as usable space, so the card ran past the visible viewport and the input slid under the
  fixed nav. Now `100dvh` (with the `100vh` line kept first as the fallback for older Safari), minus the nav
  and `env(safe-area-inset-bottom)`. Also added the home-bar inset to `.screen`'s bottom padding and to
  `.tabbar`, so nothing on any screen can sit under the nav.
- `?v=` 12 → 13. Harness: 3 new checks (a message produces a `msg` notif targeting the thread; the bell list
  renders; `openNotif` deep-links into the chat thread).

## Also fixed: another doc/live rules drift
`Context/DATA-MODEL.md`'s ruleset was **missing `bugReports` entirely** while the published rules have it —
so pasting the documented ruleset over live would have silently killed bug reporting (default deny). Added,
with a note. Worth a habit: diff the doc against the console before any publish.

## Left intact
Match/points logic, onboarding, the wall, the Meetups-nav unread badge (this is additive), no new
`backdrop-filter` on animated elements, no emojis, `ZB_STORE` API unchanged.

## Flagged, not changed
`.tabbar` has both `transform:translateX(-50%)` **and** `backdrop-filter:blur(20px)` — the exact combination
`CLAUDE.md` warns about for Android Chrome flicker. Pre-existing, and removing the blur changes how the nav
looks, so it's a design call rather than mine. Worth a look if flicker is ever reported.
