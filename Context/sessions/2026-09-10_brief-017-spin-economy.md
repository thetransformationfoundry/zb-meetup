# Session — 2026-09-10 · BRIEF-017 · spin points economy (v=22)

**Branch:** `feat/spin-economy` (off `main` @ 17c713c) · **Status:** built, harness 66/66 green,
**awaiting Sean's test + merge**.

## What we did
- **New `ZB_STORE` methods in both stores**, replacing `respinsLeft` / `useRespin` entirely:
  `spinState()` → `{points, freeSpin}`, `paySpin()` → `{ok, free, points}`, `grantFreeSpin()`,
  `claimSignupBonus()`.
- **Signup grants 30 points.** Live: set on first profile create in `saveMe` with a
  `signupBonusGranted` flag. Demo: the same on first `saveMe`.
- **Free spins, day-stamped server-side.** `users/{uid}.spin = { date, freeAvailable }`. A record from a
  previous day normalises to "today, free available", so each day grants one free spin; sending a request
  sets `freeAvailable` true again. **The old loophole is closed at the source**: `skip()` used to return the
  screen to idle, which made the next spin look like a first-of-day free spin — `skip()` is gone, and
  freeness now lives in the store rather than in the in-memory `current` variable.
- **Pricing in one place.** `doSpin()` calls `paySpin()` and reacts: free → no cost; otherwise −1 point;
  at 0 points → blocked with *"You're out of points for now — send a request, or earn points by meeting
  someone"*. Points are decremented with `FieldValue.increment(-1)` **inside a transaction** that re-reads
  the doc, so two rapid taps can't spend the same point twice or push the balance negative.
- **UI:** Skip removed; a single reroll labelled **"Spin again (free)"** or **"Spin again (−1 pt)"**,
  disabled at 0; the idle button also shows `(−1 pt)` when the free spin is spent; and a line under the
  actions states the balance so the cost is legible before tapping.
- **Points Awarded screen, ported from the Claude Design handoff** (`design_handoff_points_awarded`,
  scope item 3 as updated 2026-09-10). Onboarding's last step is now a full-bleed award screen: trophy
  medallion with the pulsing + dashed rings, "YOU'RE ALL SET" eyebrow, *"Nice work, {firstName}, your first
  MeetUP awaits"*, the 30-points chip with its idle bob, the balance line, the dark→blue **Take me to Spin**
  and a **Celebrate again** ghost button.
  - The **confetti is the handoff's own** `burst()`/`tick()`: two bottom-corner cannons firing inward,
    gravity `+0.32`, drag `0.988`/`0.992`, rectangles squashed by `|cos(rot*0.9)|` to fake a flutter, 25%
    circles, 150–240 frame lifespan fading over the last 40, DPR-scaled canvas re-measured on resize, and
    the rAF loop stopping when the array empties. Lifted as-is, React refs becoming module-level state.
    **No library, no CDN** — the no-build architecture is intact.
  - Entry sequence per the handoff: burst of 120 at 220ms, a lighter 60 at 900ms.
  - **`prefers-reduced-motion` honoured in both places**: the CSS block drops the looping animations and
    `cfBurst()` returns early, so the screen renders in its final state with no confetti.
  - Every canvas API is feature-detected, so the Node harness (no rAF, stub canvas) renders the screen's
    final state and skips the animation. The whole init is wrapped — decorative code can never break signup.
  - `awardToSpin()` cancels the rAF and drops the canvas reference on the way out, so nothing keeps drawing.

### Keyframe collisions, checked rather than assumed
The handoff's `animations.css` defines `popIn`, `riseIn` and `btnGlow`, and **we already have all three**.
`btnGlow` is **byte-identical** (it is the shared button treatment the handoff says Spin/Welcome/How It Works
use, which we already implement) so it is reused. `popIn` and `riseIn` are **not** — ours are gentler and
shared by other screens — so the award screen gets `zbAwardPop` / `zbAwardRise` rather than redefining them
and silently changing the spin card and the A2HS hint.

### Not committed
The raw handoff files stay in `~/Downloads` — they reference a DC `support.js`. Only the ported CSS, confetti
and markup live in `css/styles.css` and `js/app.js`, per the brief.
- **Existing-user migration:** `refresh()` calls `claimSignupBonus()` once when `me.signupBonusGranted` is
  falsy — same self-claim pattern as the BRIEF-005 photo award, so it needs no rules change and no bulk
  write. Guarded inside a transaction, so it cannot double-grant.
- `?v=` 21 → 22.

## One existing assertion had to change
The harness asserted the appbar read `10 pts` after a completed meetup. With a 30-point signup bonus that is
now `40 pts` — the old check was only ever true because everyone started at 0. It now asserts the **delta**
(`mePts0 + 10`) rather than an absolute, which is what the check was actually about.

## Harness (14 new checks, 68 total)
Signup grants 30; the bonus is not granted twice; the first spin of the day is free and costs nothing; a
respin costs 1; each further respin costs 1 more; the reroll button shows its cost; draining 40 spins floors
at 0 and never goes negative; `paySpin()` returns `ok:false` at 0; the spin screen explains being out of
points; sending a request grants a free next spin; Skip is gone. Plus the award screen: it renders with the injected first name, the 30-points chip and balance, both buttons, and survives having no real canvas.

## What the demo path cannot prove
The demo store keeps `SPIN` in memory, so a **full page reload** resets it (along with all demo state).
Navigating away from the spin screen and back does *not* mint a free spin, so that part is testable locally —
but the "leaving and returning can't mint a free spin" guarantee proper is the **day-stamped user doc**, and
that only exists on the live path. Worth an explicit live check.

## Left intact
Matching (floor rule + EMEA from BRIEF-015) is untouched — this brief changes only what a spin *costs*, never
who is eligible. Meetup points (photo +5, questions +5) unchanged.
