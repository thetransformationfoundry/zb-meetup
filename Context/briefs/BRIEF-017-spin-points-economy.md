# BRIEF-017 · Spin points economy (free first spin, paid respins, signup bonus + confetti)

**Branch:** `feat/spin-economy`  ·  **Status:** ready for CC  ·  **From:** Sean/Donnae, 2026-09-10
**Priority:** launch-relevant — this is the core daily-engagement mechanic; do before wider invite.

## The idea
Replace the hard "2 respins/day" cap with a **points economy** that rewards meeting whoever you're offered and
makes cherry-picking cost you. Points are the same pool as the **leaderboard/prize score** — that's deliberate:
respinning lowers your standing, meetups raise it.

## Rules (build to exactly this)
- **Signup bonus:** new users start with **30 points** (today they start at 0). Show a **confetti** moment on
  onboarding completion — "You've earned 30 points to get started!"
- **Free spins:**
  - The **first spin each day is free.**
  - **Sending a meetup request grants your next spin free** (so chaining real meetups costs nothing).
- **Paid spins:** any spin that isn't a free one — i.e. a **respin / reject to get a different colleague** — costs
  **−1 point** from the user's score, each time.
- **Unlimited** spins while you have points. **At 0 points you cannot respin** — the reroll is blocked with a
  friendly message ("You're out of points for now — send a request, or earn points by meeting someone"). You can
  still receive requests and earn points from meetups. Points **floor at 0** (never negative).
- **Remove the old model:** the fixed 2/day cap and the separate **Skip** button go away. After landing on a
  candidate the only actions are **Send request to X** and **Spin again**. Label the reroll with its cost:
  "Spin again (−1 pt)" normally, or "Spin again (free)" when a free spin is available.

## Free-spin logic (unambiguous)
A single `spin()` action, priced by a per-user "free spin available" state:
- Grant a free spin (a) once at the start of each day, and (b) each time the user **sends a request**.
- On spin: if a free spin is available → consume it, cost 0; else if `points >= 1` → deduct 1, proceed; else → block.
- `sendRequest()` → creates the match **and** sets the free-spin flag true for the next spin.
- Persist the daily-free-spin marker + points server-side so leaving/returning can't mint a fresh free spin (the
  old in-memory `current` reset was half the loophole Sean found — the free spin must be day-stamped in the store).

## Current code (real refs)
- `doSpin()` `js/app.js:476` (first spin free via `if(current)` guard), `skip()` `:483` (the loophole — returns to
  idle so the next spin is treated as free), `sendReq()` `:484`, spin buttons `:472`.
- `RESPINS` / `useRespin` / `respinsLeft` in `js/store.js:63,111,116` — replace with points-based accounting.
- New signup points: live `store-firebase.js` sets `data.points = 0` on first profile create (~`:110`) → make it 30;
  demo `store.js` seed/`saveMe`. Points deduct on respin in **both** stores (ZB_STORE method, in lockstep).

## Scope (do)
1. Points model in **both** stores: signup grants 30; `spin` consumes a free spin or deducts 1 (floored at 0);
   `sendRequest` grants the next free spin; day-stamped free-spin state persisted. Remove the 2/day cap + Skip.
2. UI (`viewSpin`): drop Skip; reroll button shows cost ("Spin again (−1 pt)" / "(free)"); disabled at 0 points
   with the message; show the user's current points on the spin screen so the cost is legible.
3. **Onboarding confetti** on completion + a "You earned 30 points" line. Keep it lightweight — a small inline
   canvas/CSS confetti, **no external library** (no-build architecture). No emojis in UI chrome.
4. **Existing-user migration:** grant +30 once to accounts that never received the signup bonus (guard so it's
   applied a single time — e.g. a `signupBonusGranted` flag), so you/Donnae/Test User start fair.
5. Bump `?v=`.

## Guardrails (do NOT touch)
- Keep `ZB_STORE` API in lockstep across both stores. Matching logic (floor rule + EMEA, BRIEF-015) is unchanged —
  this is only about spin *cost* and points, not *who* is eligible.
- Points floor at 0; never negative. Signup bonus applied exactly once per user.
- Don't let a free spin be mintable by leaving/reloading — day-stamp it server-side.
- Confetti must not depend on a CDN lib; keep it inline and cheap.

## Test steps
- `node tools/test-demo.js` green, new assertions: first spin of day free; respin −1; second respin −1; at 0 points
  respin blocked; sending a request grants a free next spin; signup grants 30; bonus not double-granted.
- Manual: onboard → confetti + 30 pts. Spin (free) → respin (score 30→29) → respin (29→28) → send request →
  next spin free again → keep respinning down to 0 → reroll blocks. Leave the screen mid-day and return → no free
  spin minted. Leaderboard reflects the spend.

## Definition of done
Signup grants 30 pts with confetti; first-of-day and post-request spins are free; respins cost 1 (floored at 0,
blocked at 0); Skip + the 2/day cap removed; reroll button shows its cost; existing users granted the bonus once;
both stores in lockstep; demo harness green; `?v=` bumped; tracker + session log updated.
(The daily 9am "come spin" push is in BRIEF-004.)
