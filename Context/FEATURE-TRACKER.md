# ZB MeetUP — Feature Tracker

Status of features. Cowork keeps this current; CC ticks items as branches merge.
Legend: ✅ live · 🔨 in progress · 📋 briefed (ready for CC) · 💡 idea/backlog

| Feature | Status | Notes |
|---|---|---|
| Onboarding (email/pass → name → work setup + role → photo → consent) | ✅ | Real photo upload added (v=6) |
| Welcome / splash screen (logo, match visual, reel, rotating taglines) | ✅ | From Claude Design |
| How it works (5-step explainer) | ✅ | Our icons |
| Add to Home Screen hint + "Save as app" chip | ✅ | iOS/Android; mobile only |
| Daily **Spin** + match (floor-worker rule, 2 respins/day) | ✅ | |
| Match request → accept/decline (incoming requests) | ✅ | |
| Shared meetup space: 1:1 chat, **real shared photo**, 3 tiered questions, complete (+10) | ✅ | Chat + notifications; photo per BRIEF-001 (v=7) |
| Community wall (seed-then-replace, hearts, comments, @mention) | ✅ | Seed posts client-side |
| Leaderboard + prize banner | ✅ | Judged idea prize + climb prize |
| Notifications (bell + deep-links) | ✅ | |
| Profile / edit / **real photo** / sign out / delete account | ✅ | |
| Admin dashboard (stats, question bank add, bug reports) | ✅ | |
| Real photo capture on **meetup completion** (→ wall) | ✅ | BRIEF-001 — merged + live v=7 (2026-09-08, SHA b557fe3) |
| **First live deploy** (v=7 on main) | ✅ | 2026-09-08 — tested live by Sean + Donnae |
| Sign-in screen for returning users (+ forgot password) | 🔨 | BRIEF-002 built (v=9) on `feat/signin-screen` — awaiting Sean's test |
| In-app bell: requests/accepts/messages + deep-links; message composer layout | 📋 | BRIEF-003 |
| Real push notifications (FCM + SW + Cloud Functions) + 3-day reminder | 📋 | BRIEF-004 — Blaze approved |
| Per-user completion + correct points + completed-meetups view | ✅ | BRIEF-005 — merged + live v=8 (2026-09-08, SHA cc0ddc3) |
| Meetup photo quality (crisp) + card fit (no gutters) | 📋 | BRIEF-006 |
| Admin: surface captured answers + real Excel export | 📋 | BRIEF-007 |
| Admin: editable question bank with tiers | 📋 | BRIEF-008 |
| Real ~50-question bank (Donnae) + tiering | 💡 | Feeds BRIEF-008 once list ready |
| Version footer (semver + build id) + CI harness check | 💡 | Per operating model |
| Styled invite email (real screenshots) | 💡 | For launch comms |

## Live-feedback → brief map (2026-09-08)
1. Sign-in screen → BRIEF-002 · 2. Notifications in-app → BRIEF-003, push → BRIEF-004 ·
3. Points logic → BRIEF-005 · 4. Message layout + message notif → BRIEF-003 ·
5. Photo fit → BRIEF-006 · 6. Completed-meetups view → BRIEF-005 · 7. Photo pixelation → BRIEF-006 ·
8. Admin answers/export → BRIEF-007, editable questions → BRIEF-008.

## Pre-launch verification (needs real accounts, before inviting colleagues)
- [ ] **Non-admin earns the photo +5.** Sean + Donnae are both admins, so the rules path where a normal
  colleague self-claims the shared photo award (BRIEF-005) has never been exercised. Test with one real
  non-admin account before wider launch. (This was the exact rules gap the +10-to-both bug hid.)
- [ ] **Donnae's total corrected** as expected after the BRIEF-005 fix.
- [ ] Two-account live check of each merged feature as the backlog lands.
