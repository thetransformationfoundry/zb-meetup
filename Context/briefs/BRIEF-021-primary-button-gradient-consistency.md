# BRIEF-021 · Primary-button gradient consistency

**Branch:** `feat/button-consistency`  ·  **Status:** ready for CC (after BRIEF-020 merges)  ·  **From:** Sean, 2026-09-10  ·  Small, app-wide polish.

## Goal
Make **primary/CTA buttons** across the app use the same **dark→blue "Spin" gradient** used on the Spin button and
the Points Awarded / countdown "Take me to Spin" button, for visual consistency. Today several primary actions use a
flat mid-blue (e.g. onboarding "Continue", the icebreaker "Save — earn 10 points", "Answer 3 questions") — unify them.

## Scope (do)
1. Identify the flat solid-blue **primary** buttons and switch them to the shared Spin gradient treatment
   (the `DARKBTN` / award-screen gradient `linear-gradient(100deg,#04070D … #2E86D6)` + the existing `btnGlow`/sheen
   used on Spin). Best done as **one shared button style/class** so there's a single source, not per-button literals.
2. Apply to primary CTAs app-wide: onboarding step buttons ("Continue"/"Save"), the icebreaker save, the
   You-screen "Answer 3 questions", and any other solid-blue primary action.
3. **Leave secondary buttons as they are** — the pale/tinted buttons (Edit profile & avatar, Report a bug, Admin
   dashboard, and other ghost/secondary actions) stay their current lighter style. Only the *primary* action on a
   screen gets the gradient.
4. Bump `?v=`.

## Guardrails (do NOT touch)
- Don't change button behaviour/handlers — visual only.
- Don't restyle secondary/ghost buttons; keep the primary-vs-secondary hierarchy legible (one gradient primary per screen).
- No `backdrop-filter` on animated buttons (Android flicker); reuse the existing Spin/award button treatment which is already safe.
- No emojis. Keep touch targets ≥44px.

## Test steps
- `node tools/test-demo.js` green.
- Walk the app: onboarding, icebreakers, You, Spin, award, meetup — every primary CTA shows the gradient; secondary
  buttons unchanged; no screen has two competing gradient primaries.

## Revision — Sean's live test (2026-09-10, same `feat/button-gradient` branch, before merge)
Gradient + hierarchy all good. Two sizing/style fixes:
1. **Match the welcome button's size.** The full-width primary CTAs now render thinner than the Welcome
   "Create account" button — make the standard primary `.btn` match it (same vertical padding ~19px, font-size
   ~17px/600, full-width pill). The Welcome/award buttons are the reference height; every full-width primary should
   be that chunky. **`.btn.sm`** (thread send, admin Save/+, accept-request) **stays compact** — don't upsize those.
2. **Secondary buttons = white with blue text.** The secondary/ghost actions that sit **beneath a primary CTA**
   — e.g. "I already have an account — sign in", "Skip for now" — should be a proper **white background + ZB-blue
   (`#0079BD`) text** button with a subtle border, so they read as real secondary buttons, not faint text links.
   Keep the primary/secondary hierarchy obvious (one gradient primary, white-blue secondary beneath it). Leave the
   **You-screen stacked option buttons** (Edit profile & avatar / Report a bug / Admin dashboard) as they are —
   don't restyle those. Do this via the shared button classes so it stays single-source.

## Definition of done
Primary CTAs share one gradient button style app-wide; secondary buttons untouched; hierarchy stays clear; demo
harness green; `?v=` bumped; tracker updated.
