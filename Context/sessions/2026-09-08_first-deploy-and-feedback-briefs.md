# Session — 2026-09-08 · First live deploy + feedback triaged into briefs

**Focus:** ship the first live version, then turn Sean's live-test feedback into the fix backlog.

## First live deploy
- BRIEF-001 (shared meetup photo, v=7) built by CC on `feat/meetup-photo-capture`, stacked on
  `chore/sync-and-tooling`. Both merged to `main` as clean fast-forwards; harness 10/10 green.
- Push blocked: active `gh` account was `zanmanna` (no write access). CC correctly refused to work around the
  sandbox token classifier. Sean ran `gh auth switch --user thetransformationfoundry && git push origin main`
  himself. `origin/main` → **b557fe3 (v=7)**; GitHub Pages rebuilt. **First version live.**
- Sean + Donnae tested live end-to-end: onboarding, spin, request/accept, shared photo (showed for both,
  Change photo worked), questions, complete, wall post with real photo, admin renders. Architecture proven.

## Feedback (8 items) → briefs
Decisions: **real push now** (Sean happy to put zb-meetup on Blaze — ZB Cup already is, ~zero cost idle);
**everything in one sweep**, but delivered **brief-by-brief, branch-by-branch**, and all of it must land
**before real colleagues join** beyond Sean + Donnae.

Confirmed: ZB Cup stores photos as base64 JPEG strings too (`photoURL: data:image/jpeg;base64,…`) — so the
pixelation is our 256px downscale, not the format.

Briefs written (all traced to real code lines):
- **BRIEF-002** sign-in screen — `obGoSignIn()` (app.js:225) wrongly opens create; `obSignIn()` (:264) already works, needs a screen + forgot-password.
- **BRIEF-003** in-app notifications completeness + message composer layout — `addNotif` already fires for request/accept/msg (store-fb:150/158/167); find why they don't surface in the bell + fix deep-links + composer overlap (app.js:347).
- **BRIEF-004** real push — FCM + root service worker + Cloud Functions + consent toggle (default on) + 3-day reminder. **Blaze approved**; enable on project before Functions deploy.
- **BRIEF-005** per-user completion + correct points + completed view — the bug: completeMatch awards BOTH +10 (store-fb:179-180, store:126-130). Model: photo +5 both (once), questions +5 each, per-user complete. Adds Completed recap (my answers only).
- **BRIEF-006** photo quality + fit — pickImage 256px (app.js:66) → ~1080px for meetup photos; drop max-width:220px (app.js:332) so it fills the card. Stay base64, under 1MB, no Cloud Storage.
- **BRIEF-007** admin answers + real Excel export — topQ counts are 0 (app.js:405), exportData is a stub (:409); aggregate `answers` across matches (admin-only, verify rules), real .xlsx.
- **BRIEF-008** admin editable question bank + tiers — make questions real editable records (not hardcoded seeds); admin CRUD + tier toggle; keep pickQuestions() tier logic (app.js:98).

## Recommended build order (for CC)
005 (fairness) → 002 (returning users) → 003 (in-app notifs + message layout) → 006 (photo polish) →
007 + 008 (admin) → 004 (push, needs Blaze on). Each: feature branch off main, harness, Sean tests, merge on OK.

## Open items
- ~~Sean: enable **Blaze** on the `zb-meetup` Firebase project~~ ✅ done 2026-09-08 — BRIEF-004 unblocked.
- As admin reads land (BRIEF-007) confirm + publish the Firestore rule that lets admins read participants' answers.
- Donnae's real ~50-question list feeds BRIEF-008.
