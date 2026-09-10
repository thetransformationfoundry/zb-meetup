# BRIEF-022 · Tabbar Android flicker fix + CI actions @v5 bump

**Branch:** `chore/flicker-and-ci`  ·  **Status:** ready for CC  ·  **From:** Sean, 2026-09-10  ·  Two tiny tidies, one branch.

## Part A — Tabbar Android flicker
The bottom tab bar (`.tabbar`) uses both `transform: translateX(-50%)` and `backdrop-filter: blur(20px)` — the exact
combination `CLAUDE.md` warns about (Android Chrome repaint flicker, already bitten on the reel). Remove the
`backdrop-filter` from the tab bar and give it a solid/near-solid background instead so it reads the same without the
blur. Keep it looking clean; check it doesn't go transparent over scrolled content.

## Part B — CI actions @v5 bump
The GitHub Action still uses `actions/checkout@v4` and `actions/setup-node@v4`, which emit GitHub's Node-20
deprecation notice (runners force Node 24). Bump both to **`@v5`** to silence it. No workflow logic change; confirm
the harness + stamp jobs still run green after.

## Guardrails (do NOT touch)
- No other styling changes; the tab bar should look the same minus the blur. No `backdrop-filter` on animated/
  transformed elements anywhere (the guardrail this fixes).
- CI: only the action versions change — don't touch the harness/stamp/Pages-build steps.

## Test steps
- `node tools/test-demo.js` green; after push, the CI run is green with **no** Node-20 deprecation annotation.
- On a real Android phone (or emulator), scroll the wall/leaderboard and confirm the tab bar no longer flickers.
- Bump `?v=` (tabbar CSS changed).

## Definition of done
Tabbar has no `backdrop-filter` (no Android flicker) and looks the same; CI actions on `@v5` with the deprecation
gone; harness green; `?v=` bumped; tracker updated.
