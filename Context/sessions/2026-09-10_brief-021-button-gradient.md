# Session — 2026-09-10 · BRIEF-021 · primary-button gradient consistency (v=32)

**Branch:** `feat/button-gradient` (off `main` @ d753eff) · **Status:** built, harness 131/131 green,
**awaiting Sean's test + merge**. Visual only — no handler touched.

## One source, verified
The gradient now exists **once**, as `--btn-grad` in `css/styles.css`. Everything resolves to it:
- `.btn` (every primary CTA in the app)
- `.zb-primary-btn` (the award and countdown "Take me to Spin")
- `DARKBTN` in `app.js`, now literally `"var(--btn-grad)"` — the inline-styled welcome, spin and
  how-it-works buttons therefore share the same definition instead of repeating the colour stops.

Asserted: the literal `#04070D` appears **once** in the whole codebase, in the variable definition.

## What changed
- `.btn` gained the gradient, the `btnGlow` pulse Spin already used, a **999px pill** radius (matching
  Spin/award), a 44px minimum height, and a `filter: brightness()` hover — the old
  `background: var(--zb-blue-dark)` hover would have flattened the gradient on contact.
- **Every non-primary variant cancels the treatment** — `secondary`, `ghost`, `danger`, `white`, `glass` each
  set `animation:none; box-shadow:none` and keep their 12px radius. Without that, every pale secondary in the
  app would have started pulsing, which is the opposite of legible hierarchy.
- `:disabled` also stops the glow — a disabled button that keeps breathing looks broken.
- **The You screen's icebreaker CTA is promoted** from `secondary` to primary: it is the one action that
  screen is asking for. Edit profile / Report a bug / Admin dashboard stay secondary.

## Hierarchy audit rather than assumption
I counted primaries per screen programmatically. Every view had one or zero — except **admin**, which has the
inline question **Save** and the **+ add**, and those can render simultaneously while editing. Rather than
demote either (both are affirmative actions), **`.btn.sm` keeps the gradient but drops the pulse**. So the
breathing glow marks the single full-width CTA per screen, and compact primaries stay static and calm. That
also stops the thread send button and the accept-request button from pulsing, which they would have.

## A wrong test of mine, corrected
My first hierarchy check asserted the You screen's primary is the icebreaker CTA — and failed, because by
that point in the harness the icebreakers are answered, so the screen correctly shows the answered card
instead of the prompt. Rather than weaken the assertion I **drove the real state**: clear the icebreakers,
re-render, assert the prompt is the single gradient primary, then restore. The check now exercises both
branches instead of whichever one happened to be showing.

## Harness (4 new checks, 131 total)
The answered You screen has no competing gradient primary; the unanswered one has exactly one and it is the
icebreaker CTA; and the three secondaries stay secondary.

## Revision (2026-09-10) — sizing and the white secondary
1. **Full-width primaries now match the Welcome CTA**: 19px vertical padding, 17px/600 with the same −.2px
   tracking, 10px icon gap, full-width pill. They were rendering visibly thinner than "Create account"
   because the base `.btn` was still 13px/16px/700 from before the gradient change. `.btn.sm` pins its own
   14px/700 so the thread send, admin Save/+ and accept-request buttons stay compact.
2. **`.btn.alt` — white with ZB-blue text and a subtle border**, for the secondary action sitting under a
   primary CTA: "I already have an account — sign in", "Skip for now", "Send the email again", "Create an
   account instead". They were ghosts, which read as text links rather than buttons.

**Why a new class rather than restyling `.btn.ghost`:** ghost is also used by Sign out, Back, Cancel, Change
photo, Edit answers, Check for update and the admin utilities. Sweeping those into white-with-a-border would
have restyled a dozen quiet controls — and Sign out sits on the You screen, which the brief explicitly says to
leave alone. `.btn.alt` is applied to the four buttons that are actually "the alternative to the CTA", and
`.btn.secondary` (the You-screen stacked options) is untouched.

**Left as-is, flagged:** the award screen's "Celebrate again" is `.zb-ghost-btn` — also a secondary under a
primary, but it sits on the dark navy ground where the handoff specifies translucent white text. A white
button there would fight the design. Worth a look on screen; a one-line change if Sean wants it matched.
