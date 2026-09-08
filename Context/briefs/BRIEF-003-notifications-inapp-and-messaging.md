# BRIEF-003 · In-app notifications completeness + message composer layout

**Branch:** `feat/notifications-inapp`  ·  **Status:** ready for CC  ·  **From:** live feedback #2 (in-app half) + #4

## Goal
Every meaningful event shows in the **bell notification list** with tap-to-open deep-linking, and the
message composer no longer overlaps the bottom nav.

## Context (real code)
The notification plumbing already exists and is mostly wired:
- `store-firebase.js:47` `addNotif(uid,o)` writes to `notifications/{uid}/items`; `listNotifs()` (`:209`) reads them; the bell renders from `listNotifs`.
- Requests already notify: `:150` `addNotif(other.uid,{type:"request",target:"meetups"})`.
- Accepts already notify the requester: `:158` `type:"accept", target:"meet:"+id`.
- Messages already notify: `:167` `type:"msg", target:"thread:"+id`.

So the store already creates these. **Confirm why the request notification wasn't in Sean's bell list** (feedback #2): likely the bell list isn't refreshing after a realtime notif arrives, the deep-link `target` isn't being honoured on tap, or `markNotifsRead` is clearing the badge but the item routing is wrong. **Find the real cause before changing anything** — check the notif onSnapshot (`:58`) actually triggers a re-render of the bell view, and that tapping a notif calls `go(target)`.

Message composer overlap (#4): the thread composer is inside `.card.threadcard` (`js/app.js:347`) — the input row sits flush against the fixed bottom nav (screenshot shows "Message Dev…" overlapping the nav). The thread/messages views don't reserve space for the bottom nav bar.

## Scope (do)
1. **Bell list shows all events + deep-links.** Verify (and fix) that `request`, `accept`, and `msg` notifications all appear in the bell list and that tapping any of them routes via `go(n.target)` to the right screen (Meetups / shared space / the specific chat thread). A new **message** must produce a bell item that opens the **focused chat thread** (`thread:<id>`).
2. **Realtime refresh.** When a notif arrives via the onSnapshot listener while the user is in-app, the bell badge/count and (if open) the notification list update without a manual refresh.
3. **Message composer layout.** Fix the composer so it sits **above** the bottom nav with safe padding on both `thread:` and `messages` views — no overlap, works with the iOS safe-area inset. (Reserve bottom space equal to the nav height; keep the composer reachable while the thread scrolls above it.)
4. Bump `?v=`.

## Guardrails (do NOT touch)
- Don't change match/points logic, onboarding, or the wall.
- Keep `ZB_STORE` API in lockstep across both stores.
- No `backdrop-filter` on animated/transformed elements. No emojis.
- Don't remove the Meetups-nav unread badge — this is *additive* (bell list too), not a replacement.

## Test steps
- `node tools/test-demo.js` green.
- Live, two accounts: A sends request → **B's bell** shows it → tap → opens Meetups. B accepts → **A's bell** shows the accept → tap → opens the shared space. A messages B → **B's bell** shows a message notif → tap → opens the **chat thread** (not just Meetups).
- Composer: on a phone, the message box sits clear above the nav; typing + sending works; the thread scrolls behind it. Check on iOS (safe-area) and Android.

## Definition of done
Requests, accepts and messages all appear in the bell with correct deep-links and live refresh; message composer never overlaps the nav; demo harness green; both stores in lockstep; `?v=` bumped; tracker ticked; session log written.
