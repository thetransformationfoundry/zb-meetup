# 2026-09-12 · BRIEF-025 — working @mentions, comment notifications, wall deep-link
Branch `feat/wall-social` off `main` (v=49) · built to **v=50** · harness **233 checks green** ·
**not merged; one rule needs publishing.**

## What shipped
**Real @mentions.** Typing `@` in a wall comment opens a colleague picker; choosing someone inserts
`@Name` **and records their uid**. The comment now stores `{byUid, text, at, mentions:[uid…]}`, and
chips render from those uids rather than the old `/@([A-Za-z]+)/`, which silently truncated accented and
multi-word names ("@Anna Kessler" chipped as "@Anna").

**Notifications on mention and comment.** At send, the commenter's client writes ordinary
`notifications/{uid}/items` docs — the same `addNotif` path as request/accept/message — so they become
translated device push through the pipeline BRIEF-004 already deployed. `mention` goes to each mentioned
colleague; `wallcomment` to each participant of the post's meetup. **One ping per person per comment**,
mention winning over wallcomment, and never to the commenter.

**`wall:<postId>` deep-link.** Tapping either notification — in the bell or as an OS push — opens the
Wall, scrolls to that post and highlights it for a couple of seconds.

## Three things the brief asserted that the code did not support
**1. The comment write would NOT have been denied.** The brief says the posts update rule "must allow the
`mentions` field … otherwise the comment write is denied". Reading the published rule, `commentAppendOk()`
constrained only the comment *count* and the appended comment's `byUid` — there was **no field allowlist
on the comment map at all**, so `mentions` would have been written happily. The rule change in this branch
is therefore a **tightening, not a fix**: it adds the allowlist the brief assumed already existed, which
also closes the door on arbitrary extra fields being smuggled onto a comment. Author identity is
untouched. Validated with `firebase deploy --only firestore:rules --dry-run` (compiles clean, publishes
nothing).

**2. The leaderboard cannot power the picker.** The brief says to reuse "the colleague list the Leaderboard
already reads". `leaderboard()` maps to `{name, points, color, photo, me}` — **no uid**, which is the one
field a mention must resolve to. The picker uses `C.users` (from `listUsers()`) instead: already loaded on
every screen, already readable under the existing `users` rule, and it *excludes the signed-in colleague*,
so you cannot mention yourself. Same guarantee the brief wanted — "exposes nothing new" — via the list that
actually carries a uid.

**3. "No Functions change needed" was not true.** `onNotificationCreated` maps `type → dictionary key`;
an unknown type falls back to the stored English `text`. Without adding `mention` and `wallcomment` to that
map, both push types would have arrived **in English for every colleague**, days after shipping NL/RO. Two
entries added — **so the Functions must be redeployed** for localised push. The dictionaries are in lockstep
and the harness asserts it.

## A stored XSS on the wall, fixed in passing
`mention()` ran a regex over raw comment text and the result went straight into `innerHTML`. A comment
containing `<img src=x onerror=…>` therefore **executed in every colleague's browser** — stored XSS,
live since the wall shipped, reachable by any signed-in colleague. Comment text and author names are now
escaped before the chips are applied. Two harness checks lock it down. This was not in the brief; it was
found while replacing the regex.

## Data model
Wall posts now carry `participants:[a,b]`. A `wallcomment` must reach both people in the meetup, but a
commenter who is not in it **cannot read the match document** (the `matches` rule limits reads to its two
participants). Resolving participants from the match would have required loosening that rule; storing them
on the post — which is world-readable to signed-in colleagues anyway, and already carries `names` — does
not. Pre-BRIEF-025 posts fall back to `authorUid`.

## Testing
233 checks. The new ones were verified to fail against the regression they guard: breaking the one-ping
de-dupe, reverting chips to the old regex, drifting the Functions dictionary, loosening the comment rule,
and un-escaping comment text.

## Handoff
- **Publish the rule** (diff below in the handoff message) — this is the only manual Firestore step.
- **Redeploy Functions** (`firebase deploy --only functions`) so the two new push types are localised.
- Not merged; waiting on Sean's test pass.
