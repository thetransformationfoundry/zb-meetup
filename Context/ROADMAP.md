# ZB MeetUP — Build Roadmap & ZB Cup Reuse Map

How we build ZB MeetUP fast by standing on ZB Cup — **without touching ZB Cup**.

_Last updated: 2026-09-03_

---

## Ground rule

ZB MeetUP is a **new app**: new folder (`zb-meetup/`), **new GitHub repo**, **new Firebase project**.
ZB Cup stays parked and untouched. We **copy** proven code out of ZB Cup and adapt it — we never edit
ZB Cup's files or point at its Firebase.

## What we reuse from ZB Cup (copy + adapt)

| ZB Cup piece | Reuse for ZB MeetUP | Change needed |
|---|---|---|
| `index.html` shell + `?v=` cache-busting | App shell | Rebrand, new script list |
| `css/styles.css` (design system) | Whole look & feel | Reuse as-is (ZB blue, cards, chips, buttons, avatars) |
| `js/firebase-config.js` | Config + `ADMIN_EMAILS` | **New Firebase project keys**; admins = Donnae + Sean |
| Storage-layer pattern (`store.js` demo + `store-firebase.js` live, one `APP_STORE` API) | Same pattern | New data methods (matches, spin, questions) |
| Auth + onboarding (email/password, photo/initials, profile gate) | Sign-in + onboarding | Add GDPR consent + directory prefill |
| Notifications (bell, badge, mark-read) | Requests/acceptances | Reuse; new notification types |
| Leaderboard | Leaderboard | Simplify to overall points |
| Community wall ← chat + colleague-of-the-day photo cards | Community wall | Photos from meetups; "match of the day" |
| Admin dashboard + Players tools | Admin | New metrics + Excel export |
| `SHUTDOWN-GDPR.md` pattern + `tools/delete-colleague-users.js` | End-of-initiative cleanup | Reuse when the time comes |
| Docs convention (`context/` + `sessions/`) | Already set up here | — |

## Build new (the heart of MeetUP)

- **Matching engine** — eligible-pool logic (no repeats, floor-worker rule), the **Spin** animation, 2-respins/day counter.
- **Match lifecycle** — request → accept → shared match space → completion + points.
- **Discussion questions** — question bank, tiering, 3-per-meetup selection, private answers.
- **Meetup types** adapting to work classification.
- **Excel export** of questionnaire data (the idea-bank harvest).
- **Directory seed** from `Overzicht Medewerkers.xlsx`.

## Phased plan

**Phase 0 — Foundations (now):** scope docs ✅, comms ✅. Next: set up new GitHub repo + new Firebase
project; copy the ZB Cup shell into `zb-meetup/Code/` and strip to a MeetUP skeleton.

**Phase 1 — Clickable prototype (demo mode, no backend):** onboarding → Spin animation → match card →
accept → shared space → answer questions + photo → points → leaderboard + community wall. Seeded with
sample colleagues so Donnae can *feel* it. (This is what we react to and refine.)

**Phase 2 — Live backend:** wire Firebase (Auth + Firestore + rules), directory seed, real matching,
notifications, admin dashboard + export, GDPR consent.

**Phase 3 — Launch polish:** question bank loaded (Donnae's ~50), meetup-type copy, styled invite
email with real screenshots, push/in-app notifications, prizes.

**Phase 4 — Live & iterate:** invite the 329, watch engagement, tune matching/questions before **Oct 4**.

## Timeline anchors

- **Sept 4** — off-site teaser (done: `Comms/`).
- **Sept 10** — newsletter article (done: `Comms/`) + aim to have the prototype demoable.
- **Before Oct 4** — live and driving engagement ahead of the company survey.

## Immediate next step

Set up the repo + Firebase project, then build the **Phase 1 prototype** (spin loop in demo mode).
Decisions in `CONTEXT.md §10` don't block the prototype — we'll use sensible defaults and confirm with
Donnae as we go.
