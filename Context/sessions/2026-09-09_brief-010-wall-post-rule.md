# Session — 2026-09-09 · BRIEF-010 · lock the wall-post update rule

**Branch:** `fix/wall-post-update-rule` (off `main` @ 2cde987) · **Status:** built, harness 27/27 green,
**awaiting Sean's rules publish + merge**.

## The hole
The published `posts/{id}` rule was `allow update: if signedIn()` — any signed-in colleague could overwrite
any post, including its `authorUid`, `names`, `scene` and **photo**. Spotted while diffing the live rules
against `Context/DATA-MODEL.md` during BRIEF-009.

## The fix
```
allow update: if signedIn() && (
     request.auth.uid == resource.data.authorUid
  || isAdmin()
  || request.resource.data.diff(resource.data).affectedKeys()
       .hasOnly(['hearts','heartedBy','comments'])
);
```
Author or admin may edit the post's own content; everyone else is limited to the three interaction fields the
wall actually needs. Verified against the code first: `heartPost()` writes only `hearts`/`heartedBy`,
`commentPost()` only `comments`, and `completeMatch()` *creates* posts (covered by the unchanged create rule)
— so nothing in the app writes a post field outside the allowlist.

## Notable: this is a rules-only change
No client code changed, so per the brief there's **no `?v=` bump and nothing to deploy** — the security fix
takes effect the moment the rule is **published**, independent of the merge. The branch carries only
`Context/` updates. Merging is bookkeeping; publishing is the fix.

## Residual gaps (flagged, not in scope)
1. **Heart/comment values aren't validated.** A colleague can only touch those three fields, but a direct write
   could still set `hearts` to an arbitrary number or append many comments. Closing that means asserting the
   delta (`hearts` ±1) and that `heartedBy` only gains/loses the caller's own uid — noticeably more rule logic.
   Low value while the wall is internal and social; worth revisiting if leaderboard/hearts ever carry prizes.
2. **Comment attribution is client-supplied** — a genuine drift recorded in `DATA-MODEL.md` this session.
   The doc says `comments: [{ by: uid, byName, text, at }]`; the code writes `{ by: <display name>, text, at }`
   with no uid. Through the UI that's always your own name, but a direct write could post a comment under
   someone else's name. Proper fix: store `byUid` and render the name from the profile. Deserves its own brief.

## Left intact
Hearts and comments from other colleagues (the point of the wall), one-post-per-meetup, seed-then-replace,
the answers-private/photos-public split, and admin gating by email.
