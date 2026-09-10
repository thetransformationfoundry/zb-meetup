# BRIEF-014 · Version / build stamp in the app + "Check for update"

**Branch:** `feat/version-stamp`  ·  **Status:** ready for CC  ·  **From:** stale-device round trip on BRIEF-006, 2026-09-09
**Priority:** do next, before BRIEF-007. Already sanctioned by `CLAUDE.md` (non-negotiable convention) + roadmap — no new decision needed.

## Why
We have no way to tell which version a device is running, so a stale iPhone cache produced two "bugs" that were
really one old-code device (BRIEF-006). `CLAUDE.md` already requires: *"Show version + build id (git short SHA +
date) in the app so 'what's live' is unambiguous."* This implements it. Then a screenshot answers "what are you
running?" instantly and stale-cache confusion stops being a class of bug.

## Goal
The app shows its **version + build id + date** (e.g. `v15 · fdda24f · 2026-09-09`), and offers a **Check for
update** action that reloads past the cache — including the stubborn iOS home-screen case.

## Scope (do)
1. **Build stamp, accurate and automatic.** Display a small line on the **You** screen: `v<N> · <shortSHA> · <date>`.
   The hard part in a no-build app is getting the *real deploy commit SHA* in. Preferred: a **GitHub Action on push
   to `main`** that writes `version.json` (or `js/version.js`) with the short SHA + ISO date at deploy time, so it's
   always correct without manual effort. The app reads it and renders the line. (If the Action is deferred, a
   committed `version.js` constant updated alongside the `?v=` bump is an acceptable stopgap — but say so; the
   Action is the real fix and also seeds the roadmap's CI harness check, which can run in the same workflow.)
2. **Check for update.** A control on the You screen that force-reloads past cache (e.g. reload with a
   cache-busting query). Note the **iOS home-screen gotcha**: `index.html` is the entry point and isn't versioned,
   so `?v=` on assets can't refresh it; document that the reliable reset for a home-screen app is remove + re-add,
   and make the button do the best a page can (bust the query, and if/when a service worker exists, tell it to
   update — see #3).
3. **Document** the caching model in `Context/` (why `?v=` works for assets but not the home-screen `index.html`).
   Flag the overlap: **BRIEF-004 adds a service worker** for push; a network-first (or update-on-load) strategy for
   the app shell there is the proper long-term fix for stale `index.html`. Don't build the SW here — just note the handoff.
4. Bump `?v=`.

## Guardrails (do NOT touch)
- **Keep the no-build architecture** for the app itself — a GitHub Action writing a tiny stamp file is fine; a
  bundler/transpiler is not.
- Don't commit secrets. The Action uses the built-in `GITHUB_TOKEN`/commit metadata, no service-account key.
- Don't regress the existing GitHub Pages deploy. No emojis; keep the You-screen layout tidy.

## Test steps
- `node tools/test-demo.js` green (stamp renders; falls back gracefully if `version.json` is missing).
- After a deploy, the You screen shows the correct `v · SHA · date` matching `origin/main`.
- **Check for update** on desktop reloads to the latest. On the iOS home-screen app, confirm the documented
  remove/re-add resets it (button does its best; SW handoff noted for BRIEF-004).

## Definition of done
The app unambiguously shows what's deployed (version + short SHA + date, ideally stamped automatically on deploy),
a Check-for-update action exists, the iOS caching model is documented with the BRIEF-004 SW handoff noted; demo
harness green; `?v=` bumped; tracker + session log updated.
