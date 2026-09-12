# 2026-09-12 · BRIEF-026 — onboarding tap responsiveness
Branch `fix/onboarding-responsiveness` off `main` (v=50) · built to **v=51** · harness **238 checks green** ·
not merged. No rules or data-model change, as required.

## What changed
`btnBusy()` / `btnIdle()` in `app.js`: on press, the button is disabled and its label is replaced with
`spinnerIcon()` plus the original text, so the tap is acknowledged before any network work starts.
Applied to the four onboarding actions that wait on a write — **Enter ZB MeetUP**, the **icebreaker Save**,
**sign in**, and **forgot password**. The purely local steps (name, role, photo, colour, language) do no
network work and were left alone.

## What was taken off the critical path, and what deliberately was not
`finishOnboard` ran five sequential awaits. Two are now background work:

- **`S.welcome()`** — writes the welcome notification. Nothing on the next screen reads it and a missed one
  is cosmetic.
- **`S.pushEnable()` + `refreshPush()`** — the slowest link in the chain (service worker registration plus
  `getToken`, a network round-trip to FCM). Nothing on the next screen reads the result, and push can be
  switched on later from **You**. This is most of the perceived win.

Left blocking on purpose:

- **`S.signUp`** and **`S.saveMe`** — `onAuth` sends anyone without a saved `name` back to onboarding, and
  the icebreaker step reads the saved language. Advancing before these land would show the wrong screen.
- **`saveIcebreakers` → `claimIcebreakerBonus`** — the claim **re-reads the saved answers** and refuses
  unless all three are present, so it cannot start before the write lands, and the award screen reports the
  balance they produce. Per the brief's "prefer the safe choice", these keep the spinner and stay awaited.

**One await was simply removed.** `iceSave` awaited `refresh()` before `iceDone()`. It was redundant —
`showAward()` fetches its own profile and `iceDone()`'s profile path refreshes itself — and actively risky:
a late `refresh()` resolving after the award screen had drawn would re-render it mid-confetti.

## The push-permission guardrail
`Notification.requestPermission()` still fires inside the tap, before any `await`; only `getToken` moved to
the background, and that needs no gesture. The harness asserts this by calling the handler **without
awaiting it** and checking the permission request has already been recorded — so a future refactor that
defers the prompt into a `.then()` fails the build rather than silently breaking Safari.

## Two things found while building
**The double-submit guard had to be a flag, not the button.** The first version treated "button already
busy" as the guard. But `renderOnboard()` replaces the CTA markup, so a re-render mid-flight hands out a
fresh, un-busy button and the guard evaporates. `obSubmitting` / `iceSaving` are now authoritative and
`btnBusy` is purely visual.

**`signUp` was a weak thing to assert.** The first double-tap check counted sign-ups — and passed even with
the guard removed, because `if(!S.currentUser())` already skips the second one. The check now counts
**profile writes**, which is what actually re-runs when the handler is re-entered, and it fails without the
guard.

**A shim sharp edge worth remembering:** the harness's DOM proxy returns a *function* for any unset
property, so `if(el._zbBusy)` read truthy on a fresh button and the handler bailed instantly. Strict
comparisons (`=== true`, `typeof … === 'string'`) behave correctly under both the shim and a real browser.
`dataset` is worse than useless here — the proxy hands back a new object each read, so writes vanish; plain
expando properties work in both.

## Testing
238 checks. Five new ones, each verified to fail against the regression it guards: the instant busy state on
both heavy taps, the permission-inside-gesture ordering, and both double-submit guards.

**Still needs the real device.** The harness proves ordering and guards; it cannot prove it *feels* fast.
The iPhone that showed the lag is the test that matters.
