# Session — 2026-09-04 · Build the deployable live app

**Focus:** convert the approved prototype into the real, deployable multi-user app (ZB Cup
storage-layer pattern) and wire Firebase.

## What we did
- **Firebase project created** (`zb-meetup`, eur3 EU region, Email/Password auth). Config saved to
  `Code/js/firebase-config.js` (+ admin emails Donnae + Sean; `ZB_LIVE` on).
- **GitHub repo created** (`thetransformationfoundry/zb-meetup`, public). Pages left off until push.
- **Built the app** (`Code/`):
  - `index.html` (shell, loads demo or Firebase store by `ZB_LIVE`), `css/styles.css`, `manifest.json`,
    `assets/apple-touch-icon.png`, public-friendly `README.md`, `.gitignore`.
  - `js/store.js` — DEMO data layer (in-browser), full `ZB_STORE` API.
  - `js/store-firebase.js` — LIVE Firestore layer, same API (auth, users, matches w/ accept + chat +
    photo + answers + complete/points, wall posts w/ hearts/comments, notifications, question bank,
    bug reports). Realtime listeners on matches + notifications; TTL caches to limit read costs.
  - `js/app.js` — the UI (ported from the prototype), all actions async against `ZB_STORE`; added an
    **incoming-request accept/decline** flow (real users must accept; demo auto-accepts).
- **IDs made strings** (Firestore-safe) across stores + app; click handlers quoted.
- **Verified the demo path end-to-end** with a DOM-shim harness (onboarding → spin → match → chat →
  photo + questions → complete +10 → wall/leaderboard/admin → sign out). `store-firebase.js`
  parse-checked; both stores confirmed to expose the same API surface. (Live path tested after deploy.)

## Decisions
- Real photo capture on meetups deferred (photo = a "logged" flag for launch; wall shows scene tiles).
  Live question **counts** for admin analytics also deferred. Both are easy Phase-2 adds.
- Seed wall/reel posts kept client-side (flagged seed) and merged under real posts — never written to Firestore.

## Deploy + welcome screen (2026-09-04, cont.)
- Deployed to GitHub Pages (`thetransformationfoundry.github.io/zb-meetup`). First upload flattened folders → fixed by re-uploading with folders preserved (repo now: `css/ js/ assets/` + root files). GitHub "secret detected" on the Firebase apiKey = expected false positive (public by design), dismissed.
- **Home-screen icon**: rendered Sean's `app-zb-match-icon.svg` → `assets/apple-touch-icon.png` (+ icon-192/512) with the dark→blue gradient + MeetUP wordmark; manifest updated. ZB logo saved to `assets/zimmer-biomet-logo.svg`.
- **Welcome screen** (from Claude Design) ported into `js/app.js`: Zimmer logo, two-headshot match visual (priya/tom headshots) with animated arc + spark, photo reel of real meetups, bottom sheet with Create / Sign-in. Added **rotating taglines** (3, cycle every ~3.8s) and a **"How it works"** 5-step explainer screen (no emojis). Chrome hidden on welcome/how; restored for app. Cache bumped to `?v=3`. Verified full flow in the demo harness.

## Live polish (2026-09-04, cont.)
- Ported Claude Design's improved **How it works** screen (blue header, numbered steps + dashed connector, note pills, sticky button) — using our Phosphor icons + spinner.
- **Add to Home Screen**: refactored so closing the hint stops auto-nag but a persistent **"Save as app" chip** on the welcome screen re-opens it (mobile only, above the create sheet on the blue).
- **Android flicker fix**: removed `backdrop-filter:blur()` from the animated welcome/spin reel chips (Chrome-Android repaint bug under a transformed/animated ancestor) + added `will-change:transform;translateZ(0)` to the reel tracks. Cache → **v=5**.
- All verified in the DOM-shim harness.

## Real profile photos (2026-09-04, cont.)
- Added a real image picker (`pickImage`): opens camera/library on mobile, crop-to-square + downscale to 256px JPEG base64. Wired to onboarding "Add a photo" + Edit Profile. Photos now render on profile, leaderboard, spin card/face, and match cards (via `av()`). Cache → v=6.
- Still a placeholder: the **meetup completion "Share a photo"** (addPhoto) is a flag, not a real capture — offered to wire it next (would put real photos on the community wall).

## Handoff to Claude Code / git workflow (2026-09-04, end)
- Decided to move development to **Claude Code in VS Code** against the git repo (branches → PR → merge
  to `main` = deploy). No more manual web-UI uploads.
- Added **`CLAUDE.md`** (repo-root project brief: architecture, conventions, security, workflow, file map,
  roadmap), **`tools/test-demo.js`** (Node DOM-shim smoke test, exits 0/1 — verified green), and
  **`docs/HARNESS.md`**. Updated CONTEXT status → LIVE (v=6), git/CC workflow.
- Repo docs will live under **`docs/`** (context + sessions). This Cowork session's logs are the seed for
  `docs/sessions/`.
- Handover steps + Claude Code kickoff prompt given to Sean (clone repo → copy latest Code/* to root +
  Documentation → docs/ → open in VS Code → paste prompt → CC syncs, runs harness, commits, deploys).

## Open items / next up (for Claude Code)
1. **Sean:** upload `Code/` contents to the repo **root**; enable **Pages** (main/root); **publish the
   Firestore rules** (from `DATA-MODEL.md`) in the Firebase console.
2. **Together:** test live on two accounts (sign up → spin → request → accept → chat → complete → wall).
3. Load the real ~50-question bank; finalise the styled invite email with real screenshots.
4. Phase-2: real photo uploads; live question-count analytics + Excel export; 3-day reminder function.
