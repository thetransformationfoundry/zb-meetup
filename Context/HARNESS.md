# Demo-path test harness

The app has **no build step**, so there's no framework test runner — but there's a lightweight
Node smoke test that loads the real files (`firebase-config.js` + `store.js` + `app.js`) with a
stub DOM and walks the whole flow.

## Run it

From the repo root:

```bash
node tools/test-demo.js
```

Green output + exit code 0 means the demo path is intact: welcome → onboarding → spin → match →
shared space → photo + questions → complete (+10 pts) → wall/leaderboard/admin all render without
throwing. **Run this before every deploy** and after any change to `app.js` or `store.js`.

## What it does NOT cover
- The **live Firestore path** (`store-firebase.js`) — it needs a browser + the Firebase SDK, so it
  can't run in Node. After deploy, verify live in the browser with **two accounts** (one normal, one
  incognito) to exercise a real match → accept → chat → complete between two people.
- Pixel/visual layout — eyeball the live site (and on a real phone for the Add-to-Home-Screen hint,
  the reel, and the welcome animations).

## When you change the store API
`store.js` (demo) and `store-firebase.js` (live) must expose the **same `ZB_STORE` methods**. If the
harness passes but live breaks, first check that a method you added exists in *both* files.
