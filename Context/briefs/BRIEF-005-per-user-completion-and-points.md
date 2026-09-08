# BRIEF-005 · Per-user completion + correct points + completed-meetups view

**Branch:** `feat/per-user-completion`  ·  **Status:** ready for CC  ·  **From:** live feedback #3 + #6

## The bug (real code)
`completeMatch` awards **both** participants +10 in a single call, regardless of who completed or whether the
other person did anything:
- `store-firebase.js:174-180` — `tx.update(users/a,{points:+10}); tx.update(users/b,{points:+10})`.
- `store.js:126-130` — `ME.points+=10; otherUser.points+=10`.

So Sean completed and Donnae also got 10 without answering. Completion is match-level; it must be **per-user**.

## Points model (the decision — build to this)
A meetup is worth **up to 10 points per person**, earned independently:
- **Shared photo = +5, to BOTH participants**, awarded **once** when the shared photo first exists (either person
  can add it). Adding/changing the photo again must **not** re-award. Track that the photo award has been granted
  (e.g. a `photoAwarded:{<uid>:true}` map or a one-time flag per participant).
- **Own questions = +5, to that person only**, awarded when **that participant** has filled their own 3 answers
  (`answers[uid]`) and taps **Complete my part**. My completing does **not** award or complete Donnae's side.
- A person can therefore hold 5 (photo only, or questions only) or 10 (both). Photo points are independent of
  question completion — matching Sean: "Donnae holds 5 from the photo I uploaded" before she answers.

## Scope (do)
1. **Per-user completion state** on the match (e.g. `completedBy:{<uid>:timestamp}`). Replace the single
   match-level complete with a per-participant one in **both** stores. `completeMatch(id, post)` → completes only
   the **calling** user's side and awards only their still-unclaimed points.
2. **Correct awards:** photo +5 to both once (guard against double-award); questions +5 to the completer only.
   Never award the other participant for your action.
3. **`isComplete` / UI** (`js/app.js:99`, `:321`, `:332-333`): the shared space reflects *my* progress — my photo
   award state + my questions + my complete button; show the other person's status read-only (e.g. "Waiting on
   Donnae to finish her part"). The single wall post is still created once (keep one post per meetup; don't
   duplicate on the second person's completion).
4. **Completed-meetups view (#6):** a **Completed** section (reuse `history()`, `js/app.js`) listing past meetups;
   tapping one opens a read-only recap — the shared photo, the questions, **my** answers (not the other person's,
   per privacy), the type, and who completed. Wire it into Meetups/Profile.
5. Bump `?v=`.

## Guardrails (do NOT touch)
- Don't change matching logic, onboarding, or the leaderboard rendering (only how points are *earned*).
- Keep answers private: a completed-meetup recap shows **my** answers only, never the other participant's.
- Keep the wall to **one post per meetup**. Keep `ZB_STORE` API in lockstep across both stores.
- Photo stays shared (BRIEF-001) — this brief changes *points/completion*, not the photo model.

## Test steps
- `node tools/test-demo.js` green — add checks: completing my side awards only me; photo award happens once; the other user's points don't move.
- Live, two accounts: A adds photo → **both** show +5 (once; re-adding doesn't add more). A answers + Complete → A has 10, **B still has 5** (photo only). B answers + Complete → B goes to 10. Leaderboard reflects this.
- Completed view: after completing, the meetup appears under **Completed**; opening it shows the photo, questions and **only my** answers.

## Definition of done
Points are per-person and fair (photo +5 both once, questions +5 to the completer only), completion is per-user,
a completed-meetups recap exists (my answers only), one wall post per meetup; demo harness green; both stores in
lockstep; `?v=` bumped; tracker ticked; session log written.
