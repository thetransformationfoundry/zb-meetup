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
- **Confetti**: an inline one-shot canvas burst (~90 pieces, 1.4s, self-removing) in ZB colours, fired on
  onboarding completion with *"You've earned 30 points to get started!"*. **No library, no CDN** — and every
  API it touches is feature-detected, so the Node harness and any browser without canvas/rAF skip it
  silently. It is decorative, wrapped in try/catch, and can never break onboarding.
- **Existing-user migration:** `refresh()` calls `claimSignupBonus()` once when `me.signupBonusGranted` is
  falsy — same self-claim pattern as the BRIEF-005 photo award, so it needs no rules change and no bulk
  write. Guarded inside a transaction, so it cannot double-grant.
- `?v=` 21 → 22.

## One existing assertion had to change
The harness asserted the appbar read `10 pts` after a completed meetup. With a 30-point signup bonus that is
now `40 pts` — the old check was only ever true because everyone started at 0. It now asserts the **delta**
(`mePts0 + 10`) rather than an absolute, which is what the check was actually about.

## Harness (12 new checks, 66 total)
Signup grants 30; the bonus is not granted twice; the first spin of the day is free and costs nothing; a
respin costs 1; each further respin costs 1 more; the reroll button shows its cost; draining 40 spins floors
at 0 and never goes negative; `paySpin()` returns `ok:false` at 0; the spin screen explains being out of
points; sending a request grants a free next spin; Skip is gone.

## What the demo path cannot prove
The demo store keeps `SPIN` in memory, so a **full page reload** resets it (along with all demo state).
Navigating away from the spin screen and back does *not* mint a free spin, so that part is testable locally —
but the "leaving and returning can't mint a free spin" guarantee proper is the **day-stamped user doc**, and
that only exists on the live path. Worth an explicit live check.

## Left intact
Matching (floor rule + EMEA from BRIEF-015) is untouched — this brief changes only what a spin *costs*, never
who is eligible. Meetup points (photo +5, questions +5) unchanged.
