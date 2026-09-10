# Session — 2026-09-10 · BRIEF-019 · go-live spin countdown lock (v=25)

**Branch:** `feat/spin-countdown` (off `main` @ 81d2287) · **Status:** built, harness 93/93 green,
**awaiting Sean's test + merge**. **Launch-critical — needs to be live before Mon 14 Sep.**

## What we did
- **One constant**: `SPIN_UNLOCK: "2026-09-16T09:00:00+02:00"` in `js/firebase-config.js`, exposed as
  `window.ZB_SPIN_UNLOCK`. Verified it resolves to exactly **2026-09-16T07:00:00.000Z**, so everyone unlocks
  together regardless of device timezone — the harness asserts that ISO instant so a future edit can't
  silently shift it.
- **Full-screen holding screen** (scope item 2, revised 2026-09-10). A locked user gets **only** the countdown
  and How It Works: the appbar and tab bar are hidden the same way the welcome/onboarding screens hide them,
  and `go()` redirects any other route back to the countdown — so a deep-linked notification can't drop a held
  colleague into an empty Meetups or Wall. `?preview=1` gets the identical treatment, so the preview is what
  colleagues actually see. At unlock the chrome and the whole app return on their own, because `render()`
  re-evaluates the lock every render and every tick. The `doSpin()` / `sendReq()` action gate stays as
  belt-and-braces.
- **Gate**: `viewSpin()` now returns the countdown when locked, else the real screen (the old body became
  `spinScreenHTML()`). Locked = `now < SPIN_UNLOCK && (!admin || preview)`. It re-compares on every render and
  every tick, so the lock **auto-lifts with no redeploy**.
- **Bypass**: admins bypass automatically (Sean + Donnae can seed and test). `?preview=1` stores a flag that
  forces the countdown even for an admin; `?preview=0` clears it.
- **Countdown screen ported** from `design_handoff_countdown/countdown.html`: clock medallion with the pulsing
  and slowly rotating dashed rings, live-dot eyebrow, "Get ready to spin", the four-tile DAYS/HRS/MIN/SEC grid
  with the accented SEC tile and **`tabular-nums`**, the dated sub-copy, and a **How it works** button.
  - **Timer** exactly as the handoff specifies: recomputed from `SPIN_UNLOCK - Date.now()` every tick (never a
    decremented counter), painted once immediately so it never flashes zeros, re-synced on `visibilitychange`,
    cleared at zero — at which point it falls through to the live spin screen on its own.
  - **Only the four digits are updated in place.** Re-rendering the screen each second would restart every
    drift animation and the entry sequence.
  - The blurred layer is the **actual Spin screen** (`filter: blur(18px)` + the handoff's scrim), not the
    prototype's fake furniture shapes.
- **Pills are real colleagues or nothing.** Newest signups first, capped at 12, photo if they have one else
  initials on a tint derived deterministically from their uid. The handoff's collision rule is kept: two pills
  per lane sharing a duration, offset exactly half a cycle. Lanes scale down with the signup count (6 → 4 → 2).
  **Before real signups exist: three neutral, initials-only, nameless holders.** The prototype's placeholder
  names are never shipped — the harness asserts they don't appear.
- **How It Works reused, not duplicated**: `howItWorksHTML(inApp)` swaps the onboarding chrome (Back →
  `go('spin')`, CTA → "Back") for the in-app route.
- `?v=` 24 → 26.

## A real hole the checks surfaced
The blurred layer is decorative and had `pointer-events:none` — which stops the mouse but **not the keyboard**.
A keyboard user could have tabbed into the hidden "Spin the wheel" button and pressed Enter, spinning while
locked. Fixed twice over:
1. `inert` on the layer, removing it from the tab order and blocking activation;
2. **the gate moved onto the action** — `doSpin()` and `sendReq()` refuse while locked. That is where it
   belonged anyway: a view-only gate is one stray code path away from being bypassed.

## A deliberate deviation from the handoff
The handoff puts `backdrop-filter: blur(24px)` on the frosted card, which also carries a `riseIn` entry
animation — **exactly the combination `CLAUDE.md` forbids** (Android Chrome flicker, "already bitten"). The
card background is `rgba(255,255,255,.94)`, so the blur contributes almost nothing behind it. Dropped on the
animated card, kept on static elements. Noted in the CSS at the point of the change.

## Honest limits
- The time check is **client-side by design** (the brief calls it a soft gate). Someone who sets their device
  clock forward could spin early against a near-empty pool. Harmless, and not worth server enforcement.
- The handoff's `role="timer"` / `aria-live="off"` and `aria-hidden` bands are in place, and "How it works" is
  a real focusable button. What I have **not** verified is a screen-reader pass on a device.

## Harness (24 new checks, 100 total)
The unlock instant; a non-admin is locked; the countdown renders with its tiles and shows the right day count;
the real spin screen sits behind it; the prototype's invented names never appear; the layer is inert;
`doSpin()` is refused while locked; How It Works opens in-app and returns; an admin bypasses; preview forces
the countdown for an admin; the lock lifts exactly at the instant and stays open after; spinning works after
unlock; the chrome is hidden while locked (including under preview and on How It Works), other tabs are not
reachable, and both chrome and the rest of the app come back at unlock. Time is controlled by stubbing
`Date.now`, so this is tested rather than reasoned about.
