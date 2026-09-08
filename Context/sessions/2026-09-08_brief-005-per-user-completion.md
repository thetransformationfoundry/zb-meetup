# Session — 2026-09-08 · BRIEF-005 · per-user completion + correct points (v=8)

**Branch:** `feat/per-user-completion` (off `main` @ b557fe3) · **Status:** built, harness 18/18 green,
**awaiting Sean's local test + merge**.

## The bug, fixed
`completeMatch` awarded **both** participants +10 on one call (`store-firebase.js` tx updating `users/a`
*and* `users/b`; `store.js` `ME.points+=10` plus the other user). Completion is now **per-user**.

## Points model as built
- **Shared photo = +5 each, once.** Tracked in `photoAwarded:{<uid>:true}`. Replacing the photo never re-awards.
- **Own questions = +5 to the completer only**, on **Complete my part**, guarded by `completedBy:{<uid>}`.
- So a person can hold 5 (photo only, or questions only) or 10 — independently of the other participant.

## The Firestore-rules problem (important — a design deviation)
The brief says the photo awards "+5 to BOTH" in one go. **The published rules forbid that for normal
colleagues:** `users/{uid}` is `allow update: if isMe(uid) || isAdmin()`, so a participant cannot write the
other participant's points doc. The old +10-to-both only worked live **because Sean and Donnae are both
admins** — it would have failed silently for every real colleague.

Built instead as a **self-claim** model, which needs no rules change:
- `setMatchPhoto` awards **my own** +5 and sets `photoAwarded[myUid]`.
- New `claimPhotoAward(id)` (in **both** stores) claims **my own** +5 for a photo the other person added.
- `app.js refresh()` claims any unclaimed award on load, so the other participant's +5 lands the next time
  their app syncs (they have a realtime match listener, so in practice: seconds).
- Net effect matches the brief; the timing of the other person's +5 is "on their next sync", not instant.
- The demo store simulates the other side's claim immediately, so demo behaviour shows the model directly.

If you'd rather it be truly instantaneous, that needs either a Cloud Function awarding points server-side
(Blaze is on — natural to fold into **BRIEF-004**) or a rules change letting a participant increment the
other's points, which is hard to express safely. **Recommend the Cloud Function route.**

## Also in this branch
- **Completed view (#6):** `history()` is now "matches *I* completed"; the Completed list on Meetups is
  tappable → new **`viewRecap(id)`** (route `recap:<id>`): the shared photo, meetup type, points I earned,
  whether the other person has finished, the 3 questions and **only my** answers.
- `activeMatches()` excludes matches I've completed; `isComplete` split into `myAnswersDone` / `canComplete`
  (my own answers gate my own complete — the photo is independent, per the points model).
- `viewMeet` shows my progress and the other side read-only ("Waiting on X to finish their part").
- **One wall post per meetup** kept: `postId` on the match guards the second completion from duplicating.
- `?v=` 7 → 8. Harness: 6 new checks (award-once, per-user, other's points frozen, recap).

## Known gap (deliberate, flagging rather than widening scope)
The wall post is created on the **first completion**, carrying the shared photo if one exists. If a meetup is
completed with **no** photo and a photo is added later, that meetup gets no wall post (previously impossible,
since a photo was required to complete — the new model makes questions-only completion legal). One-line fix
available in `setMatchPhoto` if you want it; not in the brief, so not built.

## Left intact
BRIEF-001's shared-photo model, matching logic, onboarding, leaderboard rendering. Answers stay private —
the recap shows my answers only. `getMatch` remains demo-only (pre-existing, unused).
