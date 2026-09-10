# BRIEF-019 · Go-live spin countdown lock (unlock Wed 16 Sep 09:00)

**Branch:** `feat/spin-countdown`  ·  **Status:** ready for CC  ·  **From:** Sean/Donnae, 2026-09-10
**Priority:** LAUNCH-CRITICAL — must be live before **Mon 14 Sep** (signups open), definitely before Wed 16 Sep.

## Go-live plan
- **Signups open Mon 14 Sep 2026** — handled by *when Donnae sends the invite link*, not an in-app gate. People can
  onboard from the 14th (the app is already live; the link just isn't distributed before then). **No signup gate to build.**
- **Spinning unlocks Wed 16 Sep 2026, 09:00 Europe/Amsterdam** (= `2026-09-16T09:00:00+02:00`, i.e. 07:00 UTC —
  September is CEST/UTC+2). Until then, colleagues can sign up and set up their profile but **cannot spin**; they see
  a **countdown** to the unlock. At 09:00 on the 16th the lock lifts automatically and spinning works.

## Goal
Lock the **Spin** screen until the unlock time. Before then it shows a **countdown overlay over a blurred Spin
screen**. After onboarding (the Points Awarded screen → "Take me to Spin"), a locked user lands on this countdown.
Other tabs (You, Wall, Meetups) stay usable.

## Scope (do)
1. **Unlock constant** in `js/firebase-config.js` (one source): `SPIN_UNLOCK = new Date('2026-09-16T09:00:00+02:00')`.
2. **Full-screen countdown takeover for locked users** (`js/app.js`): if `now < SPIN_UNLOCK` and the user isn't
   bypassed → show the **countdown screen as a full-screen holding screen with the app chrome hidden** (hide the
   top appbar + bottom tab nav, the same way the welcome/onboarding/How-It-Works screens already suppress chrome).
   The ONLY things reachable are the countdown and its **How It Works** link — the rest of the app (Meetups, Wall,
   Ranks, You) is **not** accessible until unlock, because there's nothing there yet (no matches, no real posts).
   Keep the **action gate** on `doSpin()`/`sendReq()` too (belt-and-braces — the lock lives on the action, not just
   the view). At/after `SPIN_UNLOCK`, the chrome returns and the full app appears automatically (re-computed each
   render/tick, no redeploy). *(If Sean later wants locked users to still edit their profile/photo pre-launch, that's
   a small opt-in — for now it's countdown + How It Works only, per his call 2026-09-10.)*
3. **Bypass (so Sean & Donnae can test):**
   - **Admins bypass automatically** (reuse `ADMIN_EMAILS` / `isAdmin`) — Sean + Donnae can spin any time to
     test/seed. This is the main mechanism; no separate list needed.
   - Add a **`?preview=1` URL param** that sets a localStorage flag which *forces the countdown to show* even for an
     admin — so Sean can QA the countdown screen itself without waiting (and `?preview=0` clears it). A non-admin
     Test User will naturally see the real lock, which is the genuine colleague experience to verify.
4. **Countdown screen = Claude Design**, handoff at `zimmer-biomet/ZB-MeetUP/design_handoff_countdown/`
   (`countdown.html` is a dependency-free, no-build implementation — port it; `README.md` is the spec). Port like
   the award screen: vanilla, inline, reuse `icon()`, **no external libs**, **don't commit the raw handoff files**
   (port into `app.js`/`styles.css`; the logo/headshots already exist in `assets/` — use those, not the handoff copies).
   Key details from the README:
   - Frosted card over a **blurred Spin screen** — in production render the *actual* Spin screen behind, blurred
     (`filter: blur(18px)`) + a dark scrim for contrast, NOT the prototype's fake furniture shapes.
   - Clock medallion (pulsing + dashed ring), "COUNTDOWN TO LAUNCH" eyebrow with the live-dot, "Get ready to spin"
     headline, a **4-tile DAYS/HRS/MIN/SEC grid** (SEC tile accented; numbers **`tabular-nums`** so they don't
     jitter), sub-copy naming the launch date, and a **"How it works"** link that routes to the existing How It
     Works screen.
   - **Timer:** wire to the ONE `SPIN_UNLOCK` constant. Recompute `SPIN_UNLOCK - Date.now()` every tick (never
     decrement a stored counter), render once immediately, re-render on `visibilitychange`, clear at zero. Since
     `SPIN_UNLOCK` is a fixed instant (**Amsterdam 09:00 — confirmed by Sean 2026-09-10: everyone unlocks together**),
     the caption **names the timezone** (e.g. "Times shown for 09:00 Amsterdam") rather than "your local timezone";
     at zero it switches to "Spinning is open — refresh".
   - Keep the README's `prefers-reduced-motion` behaviour: pills hold still, entry animations off, **but the
     countdown keeps ticking** (it's information). Accessibility: `role="timer"`, `aria-label`, pills `aria-hidden`.
5. **Drifting signup pills — real people or neutral holders, never invented names.** The prototype ships with
   placeholder names (Priya Raman, Anna Kessler, …) — **do NOT ship those as fake colleagues** (same authenticity/
   privacy rule as the seed-name fix). Instead:
   - Populate the pills from **real signed-up colleagues**: read latest users (by `createdAt` desc, cap ~12), show
     each as **photo if they have one, else initials** on a deterministic tint by uid (per the README's palette).
     Use first name / display name only. Scale the lanes to the count — fewer signups → fewer lanes, per the README.
   - **Holding state (before real signups exist):** show just **one or three neutral, initials-only coloured
     placeholder avatars** — no names, no photos, no invented people. Tasteful minimal ambience, not fake colleagues.
6. Bump `?v=`.

## Guardrails (do NOT touch)
- Client-side time check is fine — this is a **soft launch gate, not security**. (A user who changes their device
  clock could spin early against a near-empty pool; harmless. Don't over-engineer server enforcement.)
- Don't lock onboarding, sign-in, profile, wall or meetups — only the **spin action**.
- Reuse the ONE `SPIN_UNLOCK` constant; don't scatter the date. Keep `ZB_STORE` untouched (no data change).
- The lock must **auto-lift** at the unlock time without a redeploy (compare to `SPIN_UNLOCK` on each render/tick).

## Test steps
- `node tools/test-demo.js` green (add: locked before unlock, open after; admin bypass; `?preview=1` forces the countdown).
- Manual: as a **non-admin** (Test User) before the unlock → "Take me to Spin" lands on the countdown, timer ticks,
  spin is not possible. As an **admin** → spin works normally. Admin + `?preview=1` → sees the countdown. Temporarily
  set `SPIN_UNLOCK` to a moment away and confirm it flips to the live spin screen at that time without reload beyond the tick.

## Definition of done
Spin is locked with a live countdown until 2026-09-16 09:00 Europe/Amsterdam, auto-unlocks then; admins bypass and
`?preview=1` previews it; other tabs unaffected; Claude Design countdown screen ported; `?v=` bumped; tracker +
session log updated. Live before Mon 14 Sep.
