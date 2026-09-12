# BRIEF-025 · Working @mentions + wall comment/mention notifications + bell deep-link to the post

**Branch:** `feat/wall-social` off `main` · **Status:** ready for CC · **From:** Sean's two-phone test, 2026-09-12
**Depends on:** BRIEF-004 (push) — now live. New notification types get device push + translation **for free** via the
existing `onNotificationCreated` → FCM path; no Functions change needed beyond the shared dictionary.

## Why
On the wall today: (1) `@mentions` are **cosmetic only** — `mention()` (app.js:71) wraps `@Name` in a styled span
via `/@([A-Za-z]+)/`, with no picker, no resolution to a real colleague, no link, no notification; (2) posting a
**comment creates no notification** (`commentPost`, store-firebase.js:444, just appends `{byUid,text,at}`), so the
people in the post never learn someone commented; (3) tapping a mention/comment in the bell has nowhere to go.
Sean found all three in testing. This makes the wall actually social and closes the loop back to the post.

## Scope (do)

### 1. Make @mention real (picker + resolution)
- When the user types `@` in a wall comment box, show a small **autocomplete of colleagues** (name → uid).
  **Reuse the colleague list the Leaderboard already reads** (all users' names are already surfaced there, so this
  exposes nothing new and needs no new read surface/rule). Filter as they type; selecting inserts `@Name` into the
  text **and records the selected `uid`** for that mention.
- Store resolved mentions on the comment: extend the comment map to `{ byUid, text, at, mentions:[uid,…] }`
  (`mentions` optional/empty when none). Keep `text` with the literal `@Name` for display.
- Render mentions from the **stored mentions**, not a fragile regex — the current `/@([A-Za-z]+)/` misses accented
  and multi-word names. A mention should render as a tappable chip/link; tapping it is fine to be a no-op profile
  peek for now (don't over-build), the important link is the notification → post (item 3).

### 2. Notifications (→ push + translated, automatically) on comment and mention
At comment send, the commenter's client writes in-app notifications (same `addNotif` path as request/accept/message,
so they ride the live push+translation pipeline):
- **Mention:** one `type:"mention"` notif to **each mentioned uid** (skip self) — "{name} mentioned you in a comment".
- **Comment on a post:** one `type:"wallcomment"` notif to **each participant of the post's match** (a and b),
  except the commenter and except anyone already getting a mention notif for the same comment (no double-ping).
  "{name} commented on your meetup". (A wall post belongs to a match — notify both people in it.)
- De-dupe: a single comment sends at most one notification per recipient (mention wins over wallcomment).
- All bodies are **template + name** via the dictionary (EN/NL/RO), added to **both** `js/i18n.js` and
  `functions/i18n.js` (the harness asserts the two agree in all three languages — same rule as BRIEF-004). The push
  is then localised to each recipient's `lang` by the existing Function; nothing new server-side.

### 3. Bell deep-link back to the post + comment
- Give these notifications a new **`target: "wall:<postId>"`**. Extend the single `target` router (the one shared by
  the in-app bell tap and the service worker's `notificationclick` — do NOT create a second map) so `wall:<postId>`
  opens the **Wall**, scrolls to that post, and reveals its comments (briefly highlight the post so it's obvious
  which one). If the post isn't loaded yet, load then scroll.
- The wall view takes an optional focus id (post to scroll/highlight); tapping a mention notification lands the user
  on that post with the comments visible — the loop Sean asked for.

### 4. Rules + docs
- The comment map now carries a `mentions` array. The posts **update** rule (BRIEF-010/011A field allowlist on the
  appended comment) must **allow the `mentions` field** on a comment map while keeping `byUid == caller` enforced —
  otherwise the comment write is denied. Update `firestore.rules` on the branch and give Sean the exact diff +
  publish step (this is the one part that needs a Sean publish; the notifications themselves reuse the existing,
  already-published notifications rule).
- `mention`/`wallcomment` are ordinary `notifications/{uid}/items` docs — no new rule for those.
- Document the two new notification types + the `wall:` target in `Context/` (`FUNCTIONS.md` / data-model). Bump `?v=`.

## Guardrails (do NOT touch)
- Reuse the existing `addNotif` → `onNotificationCreated` → FCM path; do **not** add or re-region Functions.
- One `target` router shared by app + service worker — don't fork it.
- Keep the two i18n dictionaries in lockstep (harness asserts) and keep `ZB_STORE` API in lockstep across both stores
  (add `mentions` handling to the demo `store.js` too, and the demo mention picker so the harness/demo still work).
- Don't expose any colleague data the Leaderboard doesn't already read; the picker uses that same list.
- Comment identity stays `byUid == caller` (BRIEF-011A) — the rule change only *adds* the `mentions` field, it must
  not loosen author spoofing protection.
- Seeds: keep the existing seed comments rendering; seed posts never write to Firestore.

## Test steps
- `node tools/test-demo.js` green; add: a comment with a mention writes a `mention` notif to the mentioned uid and a
  `wallcomment` notif to the other participant, with no double-ping; the two dictionaries agree for the new keys;
  `wall:<postId>` routes to the wall.
- Demo: type `@` in a comment → picker appears → pick a colleague → send → the mention renders as a chip.
- Live, two accounts: A comments on a post mentioning B → **B gets a push** ("mentioned you", in B's language) → tap
  it → lands on that post with comments open. A comments on B's meetup post without a mention → **B (and the other
  participant) get a "commented on your meetup" push** → tap → same post. Commenter gets no self-notification.
- Toggle push off for B → B still gets the in-app bell notification but no device push (consistent with BRIEF-004).

## Definition of done
@mentions resolve to real colleagues via a picker and are stored on the comment; mentioning someone and commenting
on a meetup post both create in-app notifications that deliver as translated device push via the existing pipeline;
the bell/SW deep-link `wall:<postId>` opens the post with its comments; the posts update rule allows the `mentions`
field with author identity still enforced (diff + publish handed to Sean); both i18n dictionaries updated and in
lockstep; both stores in lockstep; demo harness green; `?v=` bumped; tracker + session log updated.

## Not in scope (later, if wanted)
- Mentioning colleagues who aren't in the post and aren't on the leaderboard list (a full searchable directory).
- Threaded replies, comment editing/delete, heart-on-comment notifications.
