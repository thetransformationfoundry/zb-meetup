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
| Real photo capture on **meetup completion** (→ wall) | ✅ | BRIEF-001 — merged + live v=7 (2026-09-08, SHA 13668bd) |
| **First live deploy** (v=7 on main) | ✅ | 2026-09-08 — tested live by Sean + Donnae |
| Sign-in screen for returning users (+ forgot password) | ✅ | BRIEF-002 + amendment — merged + live v=10 (2026-09-09, SHA 2857ba4) |
| Password-reset confirmation screen (check email + junk) | ✅ | Live feedback 2026-09-09 (reset email hit Outlook Junk) — merged + live v=11 (SHA 57e1f31) |
| Reset email deliverability (SPF/DKIM / IT allow-list) | ⏭️ | NOT PURSUING (Sean, 2026-09-10): Donnae sends colleagues a personal email with the app link, so the ZB IT allow-list note isn't needed. Reset emails may still land in Junk; acceptable. Custom sender domain remains a later nicety |
| Restrict sign-up to allowed domains (zimmerbiomet.com / thetransformationfoundry.nl) | ✅ | BRIEF-009 — merged + live v=12 (2026-09-09, SHA 943499a); rules published + tested. Auth blocking function deferred to BRIEF-004 (needs Identity Platform) |
| Lock wall-post update rule (author/admin edit content; others heart/comment only) | ✅ | BRIEF-010 — rules published + simulator-verified DENIED for non-author overwrite (2026-09-09). Branch `cc6d8d2` to merge as bookkeeping |
| Wall integrity: comment identity (byUid) | 🔨 | BRIEF-011 **Part A** built (v=34) on `fix/comment-identity` — **needs the rules published**. Part B won't do (Sean) |
| Firestore rules versioned in the repo (`firestore.rules`) | ✅ | BRIEF-012 — merged 2026-09-09; live/repo byte-identical (sha256 792f9b16…0eb6, confirmed by Sean). All rule changes now go via a branch diff |
| In-app bell: requests/accepts/messages + deep-links; message composer layout | ✅ | BRIEF-003 — client live v=14 (SHA e7ebed0); notifications rule published + all 4 simulator checks verified (2026-09-09). Final two-account bell test with Donnae = last human confirmation |
| Real push notifications (FCM + SW + Cloud Functions) + 3-day reminder + 9am nudge | 📋 | BRIEF-004 — **PULLED TO PRE-LAUNCH, FULL scope** (Sean, 2026-09-11); target **Wed 16 Sep 09:00 spin-unlock**. Sequence: **merge languages first**, then branch off `main`. No Identity Platform; Manna's approach folded in (no-build). Sean: generate VAPID key now + deploy Functions / publish token rule at hand-off. Includes 3-day reminder, 9am spin nudge, instant shared-photo +5 Function |
| Per-user completion + correct points + completed-meetups view | ✅ | BRIEF-005 — merged + live v=8 (2026-09-08, SHA a2d7c5c) |
| Meetup photo quality (crisp) + card fit (no gutters) | ✅ | BRIEF-006 — merged + live v=15 (2026-09-09, SHA fdda24f); 960px capture + never-upscale guard, full-width card. Confirmed on a real phone (fresh capture crisp; card fills edge-to-edge) after clearing the iOS home-screen cache |
| Either participant can refresh the shared photo on the wall post | 🔨 | BRIEF-013 built (v=35) on `fix/either-participant-photo` — **needs the rules published** |
| Admin: surface captured answers + real export | ✅ | BRIEF-007 — merged + live v=21 (2026-09-10, SHA 17c713c); idea bank (real counts + answers, anonymise toggle), CSV export (formula-injection guarded). No rules change needed |
| Admin: editable question bank with tiers | ✅ | BRIEF-008 — merged + live v=24 (2026-09-10, SHA 2a23184); add/edit/delete/tier on real records, defaults seeded once into `questionBank` on first admin visit, no rules change. Also fixed 3 latent bugs (answers sized to Qs, empty-bank completion loophole, tier top-up). **Sean to open Admin once live to seed q1–q7; deletions permanent after** |
| **Go-live spin countdown lock** (unlock Wed 16 Sep 09:00) | 🔨 | BRIEF-019 built (v=26) on `feat/spin-countdown` — full-screen holding screen (chrome hidden) over the blurred real Spin screen; admins bypass, `?preview=1` for QA; auto-lifts, no redeploy |
| Launch copy: prize amounts + How It Works points economy | ✅ | BRIEF-018 — merged + live v=28 (2026-09-10, SHA cc48f14); €250/€250/€150 + money icon, "best idea" singular, How-It-Works link on Ranks, explainer covers the economy + returns to wherever it was opened from |
| **Icebreakers + tier split by purpose** (68-question bank) | ✅ | BRIEF-020 — merged + live v=31 (2026-09-10, SHA 9f24ea4). 34 Idea (meetups, exported) + 34 Icebreaker (onboarding, partner-only, never exported); +10 bonus (own chip); Talking points card + log instruction; recap shows icebreakers; consent copy updated. Reseed run live 2026-09-10 → 68 docs confirmed (t1q1–34, t2q1–34, `app/questionBank {seedVersion:2}`) |
| Primary-button gradient consistency | ✅ | BRIEF-021 — approved + merging (v=33, `08016ea`); one `--btn-grad` source for every primary CTA at Welcome-button size, `.btn.alt` white/blue secondaries, `.btn.sm` compact, secondaries/ghost untouched. Tested green by Sean |
| Go-live schedule | ℹ️ | Signups open **Mon 14 Sep** (via Donnae's invite link — no in-app gate); spinning unlocks **Wed 16 Sep 09:00 Europe/Amsterdam** (BRIEF-019) |

| **Multilingual follow-up** (SVG flags, wider UI, translated notifications, talking-points lang) | 📋 | BRIEF-023A — from Sean's Romanian test (2026-09-11): UK/NL/RO **SVG flags** replace the text pill; Talking-points partner **question** renders in the viewer's language (the "questions don't change" report — discussion Qs already translate fine); extend `t()` to meetup leftovers, Messages, Wall, Leaderboard/prize, **How-It-Works content**, Notifications (chrome + **render-from-type** bodies, EN fallback). Admin + export stay English. Presentation only — no rules/data-model change. Also folds in **Donnae's 12 Dutch edits** + **Sean's friend's 30 Romanian edits** (both native-reviewed 2026-09-11; NL + RO now final in `questions-i18n.md`). **Merged + deployed at v=48 (2026-09-12), harness 203/203.** Ten rounds on `feat/multilingual`. Rounds 1-8 were screenshot-driven; round 9 replaced that with a full audit of every string literal in `app.js` that reaches the DOM (tag text, `toast()` args, `textContent=`), which found the **tab bar**, You, Edit profile, delete confirm, bug report, thread, meetup hero, countdown, A2HS hint, stale-build banner and ~20 toasts still English — 79 keys added, dictionary now **250 keys, no language missing**. Splash + admin stay English by decision. Round 10: a reported "Dutch signup still shows English countdown" was **not a code bug** — the local demo server served a stale v=46 snapshot; `tools/refresh-demo.sh` now re-syncs it safely. Final pass: `CB`→`ZB management judges` (6 strings) and **EMEA - QARA Commercial moved to the top** of the 108-role dropdown (it is the only non-GSCC role). Notif `name`-field idea REJECTED (would break the notifications `hasOnly` rule → BRIEF-003 bug); name recovered from stored English text, no rules publish needed. All 68 NL + 68 RO strings verified byte-identical to `questions-i18n.md` incl. Donnae's 12 |
| **Spin points economy** + Points Awarded screen | ✅ | BRIEF-017 — merged + live v=23 (2026-09-10, SHA b3740a3). 30-pt bonus, free first/post-request spins, −1 respins, Skip + 2/day cap removed; award screen ported from the Claude Design handoff. Live-tested with a non-admin Test User (30→28 respins→33 after a meetup) |
| Full GSCC/EMEA role list + QARA cross-site matching + onboarding reorder | ✅ | BRIEF-015 — merged 2026-09-10 (v=18); 108 roles, EMEA restricted to the QARA set, legacy roles normalised on read |
| Purge real names from git history + seed-name CI guard | ✅ | BRIEF-016 — repo recreated + history scrubbed 2026-09-10 (0 real names across 28 commits; old commit URLs 404). `tools/check-seed-names.js` gates every push. Repo hygiene, not a formal GDPR incident (Sean). Caveat: can't un-publish 4–10 Sep window (0 forks/stars) |
| Real ~50-question bank (Donnae) + tiering | 💡 | Feeds BRIEF-008 once list ready |
| Tabbar Android flicker + CI actions @v5 | 🔨 | BRIEF-022 built (v=37) on `fix/tabbar-and-ci` — `backdrop-filter` off the transformed tab bar, now guarded in CI; actions bumped |
| Version / build stamp in-app + Check-for-update | ✅ | BRIEF-014 — merged + live v=16 (2026-09-09, code SHA 26122d0; stamp commit 2573047). CI (harness + auto-stamp + Pages build) verified end-to-end on first run. Staleness *detected*, not just displayed |
| CI: harness on every push/PR (GitHub Action) | ✅ | Rode along with BRIEF-014 — roadmap item done |
| Bump CI actions checkout/setup-node → @v5 | 💡 | Silence GitHub's Node 20 deprecation notice; cosmetic, when convenient |
| Styled invite email (real screenshots) | 💡 | For launch comms |
| **Purge real employee data from git history** | ✅ | BRIEF-016 — Option B: history rewritten + repo recreated 2026-09-10. CI guard `check-seed-names.js` prevents recurrence |

## Live-feedback → brief map (2026-09-08)
1. Sign-in screen → BRIEF-002 · 2. Notifications in-app → BRIEF-003, push → BRIEF-004 ·
3. Points logic → BRIEF-005 · 4. Message layout + message notif → BRIEF-003 ·
5. Photo fit → BRIEF-006 · 6. Completed-meetups view → BRIEF-005 · 7. Photo pixelation → BRIEF-006 ·
8. Admin answers/export → BRIEF-007, editable questions → BRIEF-008.

## Pre-launch verification (needs real accounts, before inviting colleagues)
- [x] **Non-admin earns points.** DONE 2026-09-10: a non-admin Test User onboarded (award screen, +30), respun
  (30→28), sent a request and completed their part (+5 → 33) — all on the live rules. The non-admin points path
  (the exact rules gap the +10-to-both bug hid) works end-to-end.
- [ ] **Donnae's total corrected** as expected after the BRIEF-005 fix.
- [x] **Locked non-admin countdown experience** confirmed 2026-09-10 (throwaway account → full-screen countdown, locked out).
- [x] **Test accounts cleaned up** (2026-09-10) — throwaway + `+testuser` removed; board/pills start clean.
- [ ] **FULL DATA WIPE before launch** (planned Sat 2026-09-12, after testing) — clear all test users, meetups, posts, comments, points from Firestore so Monday's signups start from zero. Keep only Sean + Donnae admin accounts (and re-check the leaderboard/wall/pills are empty).
- [x] **Question bank reseeded live** (2026-09-10) — 68 real questions, seedVersion:2.
- [ ] Two-account live check of each merged feature as the backlog lands.
