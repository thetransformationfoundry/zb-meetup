# Session — 2026-09-11 · BRIEF-013 · either participant may refresh the wall photo (v=35)

**Branch:** `fix/either-participant-photo` (off `main` @ 6da651e) · **Status:** built, harness 137/137 green,
**awaiting Sean's rules publish + merge**.

## The collision this resolves
BRIEF-001 gave a meetup **one shared photo** either participant can replace. BRIEF-010 then locked `posts`
content edits to the **author**. After completion those collided: the non-author's replacement was denied, so
the client skipped it — the new photo showed in the shared space and the recap while the wall post kept the
old one. Safe, but it quietly undercut the shared-photo intent, and I flagged it at the time rather than
widening BRIEF-010's rule on my own initiative.

## The rule
```
function photoOnlyByParticipant() {
  let keys = request.resource.data.diff(resource.data).affectedKeys();
  return keys.hasOnly(['photo'])
    && resource.data.matchId is string
    && exists(/databases/$(database)/documents/matches/$(resource.data.matchId))
    && request.auth.uid in [
         get(/databases/$(database)/documents/matches/$(resource.data.matchId)).data.a,
         get(/databases/$(database)/documents/matches/$(resource.data.matchId)).data.b
       ];
}
```
Added as one more `||` branch on the `posts` update rule. Deliberately narrow:
- **`hasOnly(['photo'])`** — a diff of anything else, even photo *plus* one more field, falls through to the
  existing branches and is denied for a non-author. This is a crack, not a re-opening.
- **`exists()` before `get()`** so a post whose match was deleted fails closed rather than erroring.
- **`matchId is string`** so a post without one (there are none, but still) cannot reach the `get()`.
- The **comment guard is unaffected**: it is a separate `&&` clause, so this branch cannot be used to slip a
  comment through.

**Cost:** one document read, and only when a photo is replaced on an already-completed meetup — rare. Rules
cache `get()` within a single evaluation, so the two calls are one read.

## Client
The non-author skip is gone from `setMatchPhoto` in the live store; it now updates the post unconditionally,
still guarded on `postId` so there is still exactly one post per meetup. The demo store was already
unconditional, so the two stay aligned.

## What the harness can and cannot prove
It proves the **behaviour**: replacing the shared photo after completion updates that one post and never
creates a second. It **cannot** prove the rule — the demo path has no Firestore rules at all. The rule itself
is only verifiable in the Rules Playground and live, which is why the simulator cases are spelled out in the
handover rather than left to "should be fine".

## Note
This is the last of the residual flags I raised during BRIEF-005/006/010. BRIEF-011 Part B (validating heart
*values*) stays won't-do by Sean's call.

## Follow-up: the feature was unreachable after both completed (Sean, 2026-09-11)
Writing the test steps I told Sean to change the photo "from the recap" — and he correctly pointed out there
was no such control. Checking properly: `viewMeet` bails to the recap once **you** have completed, and the
recap only had a Back button. So the reachable window was narrow:

| Situation | Could you replace the photo? |
|---|---|
| You haven't completed | yes — shared space still active |
| You completed, partner hasn't | no UI path |
| Both completed | no UI path for either |

The rule and the client both permitted it; only the UI didn't offer it. **Added a Change photo action to the
recap** (`?v=36`) — the same `addPhoto(id)` handler, with a line saying either participant can change it and
that it updates on the wall for both. `addPhoto` already looked matches up across all statuses, so no other
change was needed.

Worth knowing: after completion the photo is already public on the wall, so changing it changes what
colleagues have already seen. No confirm dialog — Sean asked for the action directly, and it is the same
shared-photo intent as before completion.

Two checks added: the recap exposes the action, and using it updates the same single post.
