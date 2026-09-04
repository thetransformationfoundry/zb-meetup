# ZB MeetUP — Go-Live Setup

The two things only **you** can do (they need your logins). Do these whenever; they unblock me to wire
the app to the backend. It's the same shape as ZB Cup, so it'll feel familiar.

Defaults I'm assuming (tell me to change any): repo **`zb-meetup`** under the **thetransformationfoundry**
GitHub org, hosted on **GitHub Pages**; Firebase project **`zb-meetup`**.

## What lives where (locked)

- **Public GitHub repo = code only.** No emails, no photos, no question answers, no employee list — ever.
- **Firebase (Firestore) = all people-data** (sign-ups, emails, profile + meetup photos, chat, and the
  private answers), locked behind the security rules in `DATA-MODEL.md`.
- The repo's `firebaseConfig` (apiKey) **is** public — that's by design and safe; access is governed by
  the rules, not by hiding the config.
- The repo **README** will be written to read as a friendly explanation for any public visitor (an
  "About this repo" note, like ZB Cup) — not as internal instructions.

---

## A. New GitHub repo

1. GitHub → **New repository** → owner **thetransformationfoundry**, name **`zb-meetup`**, **Public**
   (Pages needs it), no README/licence. Create.
2. Leave it empty for now — I'll give you the exact files + commands once the app skeleton is built.
   (When ready: drop the `Code/` contents at the repo root and push to `main`, exactly like ZB Cup.)
3. Repo → **Settings → Pages** → Source **Deploy from a branch**, branch **main / root**, Save. Your URL
   will be `https://thetransformationfoundry.github.io/zb-meetup/`.

## B. New Firebase project

1. Firebase console → **Add project** → name **`zb-meetup`** (Google Analytics optional/off is fine).
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
3. **Build → Firestore Database → Create database → Production mode →** pick region **eur3 (europe-west)**
   (EU data residency — good for ZB NL). Create.
4. Project settings (⚙️) → **Your apps → Web (</>)** → register app "ZB MeetUP" → **copy the
   `firebaseConfig`** object. **Send me that config** and I'll paste it into `js/firebase-config.js`.
5. Firestore → **Rules** tab → I'll give you the ruleset from `DATA-MODEL.md` to paste + **Publish**.
6. (Later, optional) Blaze plan only if we add the 3-day reminder Cloud Function — not needed for launch.

## C. What I do once A + B are done

1. Build the deployable app: split the prototype into `index.html` + `css/` + `js/` with the storage-layer
   pattern (`store.js` demo + `store-firebase.js` live), same as ZB Cup.
2. Paste your Firebase config; set `ADMIN_EMAILS` to Donnae + you.
3. Give you the files + push commands for the repo, and the rules to publish.
4. We test sign-up → spin → match → chat → photo + questions → points → wall/leaderboard, live.
5. Load the real question bank (your ~50) and finalise the styled invite email with real screenshots.

## Order of play

You can start **A** and **B** now (10–15 min). The moment you paste me the **Firebase config**, I'll build
the app skeleton and hand you a ready-to-push repo. No colleague data or the employee spreadsheet goes into
the repo (see `DATA-MODEL.md` — self-registration + private invite list).
