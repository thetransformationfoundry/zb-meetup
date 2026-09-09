# Caching: why `?v=` works for assets but not for `index.html`

## The model
`index.html` loads every asset with a cache-bust query — `css/styles.css?v=16`, `js/app.js?v=16`, and so on.
Bumping `N` changes those URLs, so browsers treat them as new resources and fetch them. That is why the
**convention is to bump every `?v=` on each deploy** (`CLAUDE.md`).

The gap: **`index.html` itself carries no version.** It is the entry point, so nothing can append a query to
it. A browser holding a cached `index.html` keeps requesting the *old* asset URLs — `?v=15` — and never learns
that `?v=16` exists. The cache-bust is therefore only as fresh as `index.html`.

## Why iOS home-screen apps are the worst case
A page added to the iOS home screen runs in its own WebKit context with its own cache, which iOS keeps
aggressively and does not clear when you reload Safari. So a home-screen ZB MeetUP can serve an old
`index.html` — and therefore old `app.js` — long after a deploy.

**This bit us on BRIEF-006 (2026-09-09).** A photo looked soft and its card had white gutters on Sean's
iPhone but was correct in a desktop browser. Both symptoms were one cause: the phone was running pre-v=15
code, so it captured the photo at 256px and rendered it with the old `max-width:220px`. It cost a round trip
because **nothing in the app said which version it was running** — which is what BRIEF-014 fixes.

## What we do about it now (BRIEF-014)
- `app.js` derives the version it is **running** from its own `?v=` (`document.currentScript.src`), so there is
  no second constant to keep in sync.
- `version.json` — written by the CI workflow on every push to `main` — says what is **deployed**. The app
  fetches it with `cache: 'no-store'`, so it is always fresh even when everything else is stale.
- The **You** screen shows `v16 · <shortSHA> · <date>`, so a screenshot answers "what are you running?".
- When the deployed version is **higher** than the running one, the You screen says so plainly and tells the
  user what to do — including the home-screen remove/re-add, because that is the only reliable reset.
- **Check for update** clears any Cache Storage it can and reloads with a fresh query. That fixes a normal
  browser tab. It cannot guarantee a home-screen app picks up a new `index.html` — a page has no API for that.

## The proper fix, and the handoff
A **service worker** is the only thing that can reliably keep the app shell fresh. It can serve
`index.html` network-first (or check for an update on load and swap in the new shell), which removes this
whole class of problem.

**BRIEF-004 adds a service worker anyway**, for push notifications (FCM requires one at the site root). When
that lands, give the shell a network-first / update-on-load strategy at the same time and this document
becomes history. Deliberately **not** built in BRIEF-014: a service worker registered for caching and then
replaced by the push one risks two competing registrations, and a badly-scoped SW can pin users to a broken
version — it belongs with the brief that owns the SW.

## If a device seems stuck
1. Open the **You** screen and read the stamp. If it shows an older `v` than the deployed one, the device is
   stale — that is now visible rather than guesswork.
2. Tap **Check for update**.
3. Still stale and opened from a home-screen icon: **remove the icon and add it again**.
4. In Safari itself: Settings → Safari → Clear History and Website Data (heavier, clears other sites too).
5. Signing out and back in also worked in practice — it forces a full app reload.
