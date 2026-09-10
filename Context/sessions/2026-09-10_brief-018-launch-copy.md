# Session — 2026-09-10 · BRIEF-018 · launch copy pass (v=27)

**Branch:** `feat/launch-copy` (off `main` @ a5d65b6) · **Status:** built, harness 104/104 green,
**awaiting Sean's test + merge**. Copy and one icon only — no logic touched.

## Part A — prize card (ranks screen)
- Tiles now read the confirmed amounts: **BEST IDEA €250 · TOP OF BOARD €250 · RUNNER-UP €150** (they said
  "Cash prize" / "Prize" / "Prize").
- The paragraph names the amounts too, so the card reads correctly on its own rather than relying on the
  tiles: *"Win €250 for the best idea, €250 for topping the leaderboard, or €150 as runner-up."*
- The chip icon is now a **money** glyph (a new Phosphor-style banknote-and-coin added to `icon()`) instead of
  the trophy, which already appears on the step-5 row of the explainer. "winners announced end of October
  2026" kept verbatim.

## Part B — How It Works
- **Step 1 "Get matched"** now explains the economy in plain language: the 30-point welcome bonus, the free
  first spin each day, and that swapping colleague costs a point — framed as *"give whoever comes up a
  chance"*, which is the actual intent of the mechanic rather than a rule recital. Its side note reads
  "First spin each day is free".
- **Step 5 "Climb & win"** states the real prizes and the panel, with the note carrying the three amounts.
- Steps 2–4 re-read against the current app and are still accurate (accept → shared space + chat → meet →
  photo + three questions), so they are untouched.

## Harness (4 new checks, 104 total)
The prize card shows both €250s, the €150 and the end-of-October line; the chip uses the money icon **and**
contains no emoji (the guardrail, asserted rather than assumed); How It Works mentions the 30-point bonus, the
free daily spin and the 1-point respin cost; and it states the real prize amounts and the announcement date.

## Note
The explainer is now the one place a colleague can read the points rules, and it is reachable from the
countdown's **How it works** link — so held colleagues can read the rules before launch. That is worth
knowing since the countdown is otherwise the only screen they see before Wednesday.
