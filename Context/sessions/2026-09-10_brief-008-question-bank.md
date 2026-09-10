# Session — 2026-09-10 · BRIEF-008 · editable question bank (v=24)

**Branch:** `feat/admin-question-bank` (off `main` @ 339029e) · **Status:** built, harness 77/77 green,
**awaiting Sean's test + merge**.

## Rules: nothing to publish (verified, not assumed)
`firestore.rules` already has exactly what this brief needs:
```
match /questionBank/{id} { allow read: if signedIn(); allow write: if isAdmin(); }
match /app/{doc}         { allow read: if signedIn(); allow write: if isAdmin(); }
```
Signed-in colleagues read questions (they are shown in meetups); only admins write. The second rule matters
because the seed marker lives at `app/questionBank`. Both were already published.

## The migration problem, and how it's handled
The seven questions were **hardcoded** `DEFAULTS` in each store, and live returned `DEFAULTS.concat(added)` —
so the originals could never be edited or deleted, and any deletion would simply reappear. Making the
collection authoritative naively would have been worse: an admin who has already added questions would find
the seven defaults vanish.

So: a marker doc `app/questionBank {seeded:true}`.
- **Before seeding** — `questionBank()` returns `DEFAULTS.concat(docs)`, exactly today's behaviour, so
  meetups keep working for everyone even though no admin has opened the admin screen yet.
- **`seedQuestionBank()`** (admin-only, idempotent) writes the defaults as real docs under their own ids,
  skipping any id already present, then sets the marker. It runs automatically the first time an admin opens
  the admin screen.
- **After seeding** — the collection is authoritative, so deletions stick and every question is editable.

## What we did
- **CRUD in both stores, in lockstep:** `addQuestion(text, tier)`, `updateQuestion(id, {text, tier})`,
  `deleteQuestion(id)`, `seedQuestionBank()`.
- **Admin UI:** each question is a row with a **tier toggle** (T1/T2, reusing `tierpill`), **edit**
  (inline textarea + Save/Cancel) and **delete** (confirm dialog that says answers already given keep their
  wording). Adding still works and states that new questions start at tier 2.
- **`pickQuestions()` hardened.** Tiering is unchanged — a first meetup leads with tier 1, later ones take one
  tier-1 plus two tier-2 — but since an admin can now empty a tier, the picks are **topped up from the whole
  shuffled bank** instead of leaving holes. It returns fewer than 3 only if the bank itself holds fewer.
- **Answers sized to the questions asked** in both stores (was a hardcoded `["","",""]`). Without this, a
  bank of fewer than 3 would leave a permanently unanswerable slot and no one could ever complete.
- **Spinning with an empty bank is blocked** with "No questions in the bank yet — an admin needs to add some",
  rather than creating a match with no questions (which `myAnswersDone` would have treated as instantly
  complete — worth 5 points for nothing).
- **Idea-bank labelling** (the decision flagged to Sean): answers group by question **id** and are labelled
  with the question's **current** wording, so editing a question relabels its history instead of splitting it
  into two entries. The individual answers keep the wording colleagues were actually asked.
- `?v=` 23 → 24.

## Harness (9 new checks, 77 total)
Add / edit / tier-toggle / delete all persist; the UI exposes all three controls; emptying tier 1 still yields
3 questions; tiering restores; a non-admin cannot seed; and editing a question relabels its answers rather
than duplicating them.

One harness fix along the way: my first attempt reached into `C` directly, which lives inside `app.js`'s
IIFE. Replaced with the public `reloadAdmin()` handler — no test-only production surface, per the standard
set in BRIEF-015.

## Left intact
Answer capture and export (BRIEF-007), matching, points, the spin economy.
