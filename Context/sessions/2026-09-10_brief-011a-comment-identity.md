# Session — 2026-09-10 · BRIEF-011 Part A · comment identity (v=34)

**Branch:** `fix/comment-identity` (off `main` @ f426fbd) · **Status:** built, harness 134/134 green,
**awaiting Sean's rules publish + merge**. Part B dropped by Sean.

## The gap
A comment was `{ by: <display name>, text, at }` — the author was a **client-supplied string**. Through the UI
that is always your own name, but a direct write against the public config could post a comment on the
community wall **under another colleague's name**. On an app whose whole point is colleagues trusting each
other, that is the wrong kind of cheap.

## What we did
- **Comments now store `{ byUid, text, at }`** in both stores. `byUid` is the caller's own uid and **no display
  name is stored at all**, so there is nothing to forge.
- **The name is rendered from the author's profile** (`users/{byUid}`) via a new `commentAuthor(c)` helper.
- **The rule enforces it** (`firestore.rules`): any write touching `comments` must be a **single append**
  whose last element's `byUid` equals `request.auth.uid`. Admins are exempt so they can still moderate.
- **Legacy comments handled**: ones written before today have a `by` string and no uid. `commentAuthor()`
  falls back to that string, so they render normally — they are simply not verifiable. An author who has since
  left, or is otherwise not in the pool, renders as "A colleague" rather than blank.
- **`Context/DATA-MODEL.md` reconciled** — the comment shape, the rule in the prose table, and the stale
  "DRIFT (2026-09-09)" note removed now that the drift is actually closed. Part B marked won't-do.
- `?v=` 33 → 34.

## The rule, and why it is shaped this way
```
function commentAppendOk() {
  let newC = request.resource.data.comments;
  let oldC = resource.data.comments;
  return newC.size() == oldC.size() + 1
    && newC[newC.size() - 1].byUid == request.auth.uid;
}
```
Rules cannot iterate an array, so the guard is: **exactly one element longer, and that last element is
yours**. Combined with BRIEF-010's field allowlist it means a non-author can only ever append their own
comment or toggle a heart.

The two conditions are deliberately **separate** clauses rather than folded into the existing `||` chain:
the first decides *who may write at all* (author/admin for content, everyone for interactions), the second
applies to *any* write touching comments — including the author's own post. Without that split, a post's
author could have appended a comment carrying someone else's `byUid` to their own post.

## Honest limits
- **Old comments stay unverifiable.** There is no way to retro-attribute them; the alternative was deleting
  them. There are only a handful, all from Sean and Donnae testing.
- The rule cannot check the *shape* of every existing element, only the appended one. A malformed historical
  array stays as it is.
- Hearts values are still unvalidated — that was Part B, which Sean dropped.

## Harness (3 new checks, 134 total)
A comment stores `byUid` with no display name and a numeric `at`; the rendered name comes from the author's
profile; and a legacy comment (name string, no uid) still renders rather than crashing.
