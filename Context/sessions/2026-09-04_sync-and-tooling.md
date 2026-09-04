# Session — 2026-09-04 · Sync repo to v=6 + adopt the Claude Code workflow

**Focus:** get git to match what's actually live, land the shared brain (`CLAUDE.md` + `Context/`)
and the test harness in the repo, and start working to the branch → approve → merge loop.

## What we did
- **Sanity-checked the tree** against `CLAUDE.md`: `index.html` at **`?v=6`** on all five refs
  (`styles.css`, `firebase-config.js`, `store.js` / `store-firebase.js`, `app.js`); `js/` (app,
  firebase-config, both stores), `css/styles.css`, `assets/` (icons, logo, headshots,
  `holding-demo-photos/`), `tools/test-demo.js`, docs under `Context/`.
- **Dev scraps:** `prototype.html` and `ZB-MeetUP-demo.html` were **not present** (nothing to remove).
  Added a `.gitignore` for `.DS_Store` so macOS scraps stay out of a public repo.
- **Harness green:** `node tools/test-demo.js` → 8/8 checks, exit 0 (welcome → onboarding → spin →
  match → shared space → photo + questions → complete +10 → wall / leaderboard / profile / admin).
- **Committed on `chore/sync-and-tooling`:** the v=5 → v=6 bump, the real **profile** photo capture
  (`pickImage()` — crop-square + downscale to 256px base64 JPEG, wired into onboarding, edit-profile,
  the spin face and the leaderboard), `CLAUDE.md`, the whole `Context/` doc set, and `tools/test-demo.js`.

## Notes / open items
- `data/` is **empty** on disk (git doesn't track empty dirs), so the question bank referenced by
  `README.md` isn't in the repo yet — it lands with Donnae's ~50-question bank.
- Awaiting Sean's local verification before the merge to `main` (= deploy via GitHub Pages).
- Next: **BRIEF-001** (real meetup photo capture) on `feat/meetup-photo-capture`.
