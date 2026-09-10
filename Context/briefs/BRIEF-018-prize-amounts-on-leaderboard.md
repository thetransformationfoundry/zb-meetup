# BRIEF-018 · Launch copy pass — prize amounts + How It Works points economy

**Branch:** `feat/launch-copy`  ·  **Status:** ready for CC  ·  **From:** Donnae + Sean, 2026-09-10  ·  Small, launch-relevant.

## Goal
Update the Prizes card (ranks screen) with the confirmed amounts + money icon, AND update the **How It Works**
explainer so it reflects the new **points economy** (BRIEF-017), which it currently doesn't mention at all.

## Part B — How It Works updates (`howItWorksHTML` STEPS, `js/app.js:458`)
The 5-step explainer predates the points economy. Update the copy (keep the 5-step structure, icons, styling):
- **Step 1 "Get matched":** add the spin economy in plain language — you start with a **30-point welcome bonus**;
  your **first spin each day is free**; if you **skip/respin** the colleague you're matched with it **costs 1
  point**, so give people a chance. (Keep it friendly, not rule-heavy.)
- **Step 5 "Climb & win":** state the real prizes — **€250** best idea (chosen by a CB management panel), **€250**
  top of the leaderboard, **€150** runner-up; winners announced **end of October 2026**.
- Sanity-check steps 2–4 still read true (they do: accept → shared space/chat → meet → photo + 3 questions).
- Sean may tweak the exact wording — treat the above as the intent, keep it warm and concise.

## Part A — Prizes card

## The prizes (confirmed by Donnae)
- **Best Idea — €250** — most innovative idea, chosen by a panel of CB management judges.
- **Top of Board — €250** — highest score on the leaderboard.
- **Runner-up — €150** — 2nd-highest score on the leaderboard.
- Winners announced **end of October 2026** (keep this line).

## Scope (do)
1. Update the Prizes card (currently on the ranks/leaderboard view — the "Prizes · winners announced end of
   October 2026" panel with Best Idea / Top of Board / Runner-up tiles). Show the three amounts on their tiles
   (`€250` / `€250` / `€150`) and keep the explanatory copy (earn points from meetups; a panel of CB management
   judges picks the best idea; get to know colleagues, share ideas, make an impact).
2. Add a tasteful **money/prize icon** (Phosphor-style inline SVG — e.g. a coin/banknote/trophy; add it to the
   `icon()` set if not present). No emojis.
3. Keep it on-brand (ZB blue card, the existing pill/tile styling). Bump `?v=`.

## Guardrails (do NOT touch)
- Don't change the leaderboard logic or points; this is copy + one icon on the prize card only.
- No emojis; reuse `icon()`. Keep `ZB_STORE` untouched (no data change).

## Test steps
- `node tools/test-demo.js` green.
- Ranks screen shows the three amounts (€250 / €250 / €150) with the money icon and the end-of-October line.

## Definition of done
Prize card shows the real amounts + a money icon; copy intact; `?v=` bumped; tracker updated.
