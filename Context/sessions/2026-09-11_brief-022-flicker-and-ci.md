# Session — 2026-09-11 · BRIEF-022 · tabbar flicker + CI actions @v5 (v=37)

**Branch:** `fix/tabbar-and-ci` (off `main` @ a8d8e4c) · **Status:** built, harness 140/140 green,
**awaiting Sean's test + merge**. Two small tidies.

## Part A — the tab bar
`.tabbar` carried both `transform: translateX(-50%)` (for centring) and `backdrop-filter: blur(20px)` — the
exact pairing `CLAUDE.md` forbids after the reel flicker on Android Chrome. I flagged it back in BRIEF-003 and
left it alone then because changing the nav's appearance was a design call rather than mine.

The blur is gone and the background is now solid `var(--card)` instead of `rgba(255,255,255,.96)` + blur. At
96% opacity over a blurred backdrop the visual difference is imperceptible, and solid removes any chance of
scrolled content bleeding through now that there is nothing blurring it.

**Turned into a standing guard rather than a one-off fix.** The harness now asserts that **no** CSS rule pairs
`backdrop-filter` with `transform:` — it scans every rule, not just `.tabbar`. So the guardrail is enforced
by CI instead of relying on someone remembering it. (`.appbar` and the How-It-Works sticky header keep their
blur: both are `position: sticky` with no transform, so they are not the bitten combination.)

## Part B — CI actions
`actions/checkout@v4` → `@v5` (two places) and `actions/setup-node@v4` → `@v5`. That is the whole change; no
workflow logic touched. It should clear the Node-20 deprecation annotation that has been on every run since
we set CI up — **confirm on the next run**, since that is the only way to know.

## Harness (3 new checks, 140 total)
The tab bar has a transform and no `backdrop-filter`; its background is solid; and no rule anywhere pairs the
two. The first two are specific, the third is the one that keeps mattering.

## What still needs a real device
The flicker itself only shows on Android Chrome, so the fix is verified by removing the known cause rather
than by observing the symptom. Worth a scroll on a real Android phone before the wider invite.
