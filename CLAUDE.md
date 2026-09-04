# ZB MeetUP — Claude Code brief

**ZB MeetUP** is a **live** internal web app for Zimmer Biomet colleagues: each day you spin to be
matched with a colleague for a coffee/walk/call, answer a few discussion questions together, and earn
points on a leaderboard. Community wall + admin dashboard. Read `Context/CONTEXT.md`, `Context/SPEC.md`,
and `Context/DATA-MODEL.md` before changing anything.

- **Live:** https://thetransformationfoundry.github.io/zb-meetup/ · **Repo:** github.com/thetransformationfoundry/zb-meetup (public, GitHub Pages, `main`/root)
- **Firebase project:** `zb-meetup` (region eur3/EU) — Email/Password Auth + Cloud Firestore. No Cloud Storage.
- **Admins (only two):** `donnae.abbood@zimmerbiomet.com`, `sean.abbood@thetransformationfoundry.nl`

## Team & operating model (how we work)
Three-part team — lean on it:
- **Sean — product owner.** Non-technical but hands-on; cares deeply about clean architecture + docs.
  Makes product/commercial calls, **tests locally before anything goes live**, and is the human-in-the-loop
  for accounts/sign-ins/payments/approvals. **Merges to `main` only when he's happy.**
- **Cowork — researcher / architect / scribe.** Researches, weighs options with Sean, writes self-contained
  **briefs** into `Context/`, reviews diffs/logic, keeps the Context current. Does **not** write production code.
- **Claude Code (you) — the builder.** Take a brief, implement it on a **feature branch off `main`**, run it,
  and hand Sean exact local test steps.

### Build loop (per feature)
1. A brief lands in `Context/briefs/` (goal · scope · **guardrails: what NOT to touch** · exact test steps · definition of done). One brief = one feature branch.
2. Build on `feat/…` (or `fix/…`) off `main`. Small, conventional commits.
3. Tell Sean exactly what to test locally. **Never deploy straight to production with live users.** Merge to
   `main` only on Sean's approval. (For purely additive, well-tested changes we may deploy-then-verify — but
   say so explicitly and get the OK.)
4. Update `Context/` alongside the work: tick the **feature tracker**, record decisions, and write a dated
   **session log** in `Context/sessions/`.

When Sean gives feedback (usually a screenshot): **find the real code causing it first** (the class/line),
don't guess. Reconcile older briefs against current code, and state which recent work to preserve.

## Architecture (no build step — deliberate)
Plain HTML/CSS/vanilla JS, classic `<script>` tags. `index.html` loads:
1. `js/firebase-config.js` (config + `ADMIN_EMAILS`; sets `window.ZB_LIVE`), then
2. by `ZB_LIVE`: the **live** store `js/store-firebase.js` (Firestore) or the **demo** store `js/store.js`
   (in-browser). Both expose the **same async `ZB_STORE` API**.
3. `js/app.js` — all UI; talks only to `ZB_STORE`, never Firebase directly. Design system in `css/styles.css`.

## Conventions & guardrails (non-negotiable)
- **Bump every `?v=N` in `index.html` on each deploy** (cache-bust; currently v=6). Show version + build id
  (git short SHA + date) in the app so "what's live" is unambiguous (add a small footer/`About` if not present).
- **Keep the two stores' `ZB_STORE` API in lockstep** — add a method to *both* `store.js` and `store-firebase.js`.
- **No emojis in nav/buttons** — use the inline Phosphor icons in `app.js` (`icon()`, `spinnerIcon()`).
- **String IDs** everywhere (Firestore-safe); quote them in inline `onclick`s.
- **Photos**: crop-square + downscale to ~256px base64 JPEG (`pickImage` in `app.js`); stored inline (no Cloud Storage).
- **Seed-then-replace**: wall + spin reel show `seed:true` posts until real posts arrive; reel + wall read one
  source; seeds never hit Firestore.
- **No `backdrop-filter` on animated/transformed elements** (Android Chrome flicker — already bitten).
- **Grep for undefined design tokens / typos** — they render silently wrong.

## Security / privacy (public repo, live users)
- **Never commit secrets or personal data.** No emails/photos/answers/employee list in the repo; colleagues
  self-register. The Firebase **web apiKey is public by design** — do NOT rotate it; dismiss GitHub
  secret-scanning alerts as false positives.
- Firestore rules enforce access (`Context/DATA-MODEL.md`): match `answers` are private to participants;
  admin gating is by email. **Reminder:** new/changed rules only protect once **published** — verify then deploy.
- Non-negotiable: legal, privacy-respecting (GDPR), doesn't exploit people.

## Testing
- **Demo path:** `node tools/test-demo.js` (Node DOM-shim smoke test; exits 0/1). **Run before every deploy**
  and after any `app.js`/`store.js` change. See `Context/HARNESS.md`.
- **Live Firestore path** can't run in Node — verify in the browser after deploy with **two accounts**
  (one normal + one incognito) for a real match → accept → chat → complete. Test on a real phone for the
  Add-to-Home-Screen hint, the reel, and welcome animations.
- Worth setting up early: a **CI check** (GitHub Action running the harness on push) as a safety net.

## File map
```
index.html · manifest.json · README.md · CLAUDE.md
css/styles.css
js/firebase-config.js · js/app.js · js/store.js · js/store-firebase.js
assets/ (app-icon.svg, apple-touch-icon.png, icon-192/512, zimmer-biomet-logo.svg, headshots, holding-demo-photos/)
tools/test-demo.js
Context/  (CONTEXT, SPEC, DATA-MODEL, ROADMAP, SETUP, HARNESS, FEATURE-TRACKER, briefs/, sessions/)  ← the shared brain
```

## Roadmap / open items
- **Meetup completion photo** (`addPhoto`) is a placeholder flag — wire real capture (reuse `pickImage`) so real
  meetup photos post to the community wall.
- Load Donnae's real **~50-question bank**; live **question-count analytics** + Excel export for admin.
- **3-day reminder** (scheduled Cloud Function) if a match isn't completed.
- Finalise the **styled invite email** with real screenshots.
- Add **version footer + CI harness check** per the operating model.
See `Context/ROADMAP.md`, `Context/FEATURE-TRACKER.md`, and the latest `Context/sessions/` log.
