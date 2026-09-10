# BRIEF-018 · Real prize amounts on the leaderboard card

**Branch:** `feat/prize-amounts`  ·  **Status:** ready for CC  ·  **From:** Donnae, 2026-09-10  ·  Small.

## Goal
Update the Prizes card on the leaderboard/ranks screen with the confirmed amounts + a money icon.

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
