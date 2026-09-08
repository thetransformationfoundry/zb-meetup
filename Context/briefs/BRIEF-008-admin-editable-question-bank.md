# BRIEF-008 · Admin — editable question bank with tiers

**Branch:** `feat/admin-question-bank`  ·  **Status:** ready for CC  ·  **From:** live feedback #8 (questions half)

## Goal
Donnae (admin) can fully manage the question bank from the admin screen — **add, edit, delete**, and **tag each
question's tier** — with the current questions as **editable starting points**, not hardcoded.

## Context (real code)
- The bank renders at `js/app.js:406`; `addQ()` adds a question; there's a `T1` pill for tier-1.
- Tiering drives what gets asked: `pickQuestions()` (`js/app.js:98`) picks tier-1 for a first meetup, then a
  tier-1 + two tier-2 mix. So tier is functional, not cosmetic.
- Questions currently originate as seed data in the store (effectively fixed). They need to be **real editable
  records** (Firestore `questionBank` collection on live; the demo store's in-memory list mirrors it).

## Scope (do)
1. **Editable records:** back the bank with real `questionBank` docs (live) / list (demo), each `{id, text, tier}`.
   Seed the existing questions as normal editable records on first run (don't hardcode them into the UI).
2. **Admin CRUD:** in the admin screen, let an admin **add** (exists), **edit text**, **delete**, and **toggle
   tier** (tier 1 = "key idea" / tier 2 = general — reuse the existing `tierpill` styling). Changes persist and
   immediately affect `pickQuestions()`.
3. **Lockstep + rules:** add the CRUD methods to **both** stores; ensure Firestore rules allow **admin-only**
   writes to `questionBank` (reads can be open to signed-in users since questions are shown in meetups). Note any
   rules change to publish.
4. Bump `?v=`.

## Guardrails (do NOT touch)
- Question **writes are admin-only**; regular users only read them when answering.
- Don't break `pickQuestions()` tier logic — first-meetup = tier-1; later = tier-1 + two tier-2. Handle the edge
  case where an admin deletes so many that a tier is empty (fall back gracefully, don't crash the spin/meetup).
- Keep `ZB_STORE` API in lockstep. No emojis. Don't touch answer capture/export (BRIEF-007).

## Test steps
- `node tools/test-demo.js` green (demo CRUD works; `pickQuestions()` still returns 3).
- Live as admin: add a question, edit one, delete one, flip a tier → all persist and show. Start a new meetup →
  the questions asked reflect the edits (tier-1 leads a first meetup).
- Delete-down to an empty tier → meetup still gets 3 sensible questions, no crash.
- Non-admin cannot write questions.

## Definition of done
Admins fully manage the question bank (add/edit/delete/tier) with current questions as editable seed records;
tiering still drives `pickQuestions()`; admin-only writes with rules verified/published; demo harness green; both
stores in lockstep; `?v=` bumped; tracker ticked; session log written.
