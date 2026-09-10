# Session — 2026-09-09 · BRIEF-014 · version/build stamp + update check (v=16)

**Branch:** `feat/version-stamp` (off `main` @ fdda24f) · **Status:** built, harness 38/38 green,
**awaiting Sean's test + merge**.

## What we did
- **The running version stamps itself.** `app.js` reads its own `?v=` out of `document.currentScript.src`, so
  there is **no second constant to forget to bump** — the stamp cannot disagree with what index.html loaded.
- **`version.json`** says what is *deployed* (`{version, sha, date}`), written by CI on every push to `main`.
  The app fetches it with `cache:'no-store'`, so it stays fresh even when every other asset is stale.
- **Staleness is detected, not merely displayed.** If the deployed version is higher than the running one, the
  You screen says so in plain language and tells the user what to do — including remove/re-add for a
  home-screen icon, the only reliable reset. This is the part that turns the BRIEF-006 round trip into a
  one-glance answer.
- **You screen** shows `v16 · <shortSHA> · <date>` plus a **Check for update** button, which clears any Cache
  Storage it can and reloads with a fresh query.
- **`.github/workflows/ci.yml`** — one workflow, two jobs: `harness` (runs `node tools/test-demo.js` on every
  push to main, every PR, and on demand) and `stamp` (writes + commits `version.json`), with
  `needs: harness` so **a red harness is never stamped**. This also delivers the roadmap's CI check.
- **`Context/CACHING.md`** — the caching model, why `?v=` cannot refresh `index.html`, the iOS home-screen
  worst case with BRIEF-006 as the worked example, and a "device seems stuck" checklist.
- `?v=` 15 → 16.

## The Action: two traps I hit while writing it
1. **Infinite loop.** The stamp job pushes to `main`, which would retrigger the workflow. Fixed with
   `paths-ignore: [version.json, Context/**, **/*.md]` — the bot's own commit can't retrigger, and doc-only
   pushes skip CI since they can't affect the app.
2. **The stamp would not have deployed.** A push made with `GITHUB_TOKEN` deliberately does **not** trigger
   other workflows, and `pages build and deployment` is a workflow — so `version.json` would have landed in
   the repo and sat there undeployed until the next human push, making the stamp permanently one deploy
   behind. The job now explicitly requests a build:
   `gh api --method POST repos/<repo>/pages/builds` with `permissions: pages: write`.

**Unverified until the first merge:** whether that API call succeeds with the built-in token on this
branch-based Pages setup. It is wrapped so a failure is a warning, not a red build. If it doesn't work, the
fallbacks are (a) accept the stamp deploying on the following push, (b) commit `version.json` by hand
alongside the `?v=` bump — the stopgap the brief allows, or (c) move Pages to Actions-based deployment, which
generates the stamp without committing at all. **Watch the first merge and tell me which it is.**

## Note on the displayed SHA
The stamp records the SHA of the **code commit** that triggered CI. `main` then carries a
`chore(ci): stamp build <sha>` commit on top, so `origin/main` HEAD is one ahead of the SHA shown in the app.
That is deliberate — the code commit is the useful identifier — but worth knowing when comparing.

## Deliberately not built
A **service worker**. It is the only thing that can truly keep `index.html` fresh, but BRIEF-004 adds one for
push anyway; two registrations competing, or a badly scoped SW pinning users to a broken version, is a real
risk. `CACHING.md` records the handoff: give the shell a network-first / update-on-load strategy when the push
SW lands.

## Harness additions (4)
The stamp renders and degrades gracefully with no `version.json`; no false "update available" without a stamp;
the stamp shows the running version derived from `?v=`; a newer deployed version is reported as stale. Done by
stubbing `document.currentScript` and `fetch` so the **real** `loadBuild()` / `buildIsStale()` path runs —
no test-only hook was added to production code.
