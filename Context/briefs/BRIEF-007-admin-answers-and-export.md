# BRIEF-007 · Admin — surface captured answers + real Excel export

**Branch:** `feat/admin-answers-export`  ·  **Status:** ready for CC  ·  **From:** live feedback #8 (data half)

## The problem (real code)
Sean answered "test" to all questions but the admin dashboard shows nothing:
- **Most-answered questions** shows `count:0` for every question (`js/app.js:405`, `topQ`) — nothing is
  aggregating the real `answers` from matches.
- **Export answers to Excel** is a stub: `exportData()` just toasts "Export coming in the live build" (`js/app.js:409`).
- Answers live at `matches/{id}.answers[uid]` (`store-firebase.js:173`) and are marked **PRIVATE (participants +
  admins only)** in `Context/DATA-MODEL.md:38`. The admin screen never reads across matches to surface them.

## Scope (do)
1. **Admin aggregation read** (live store): an admin-only method that reads answers across all matches and returns,
   per question, the **count answered** + the **list of answers** (with light attribution — who/what type/when, but
   keep it usable as an anonymous idea-bank if Donnae prefers). Mirror the shape in the demo store so the harness/UI
   work. **Confirm Firestore rules actually allow admins to read other participants' answers** (DATA-MODEL says
   participants + admins) — if the published rules don't yet grant admin read, note it as a rules change to publish
   (rules only protect/allow once published).
2. **Wire the dashboard:** Most-answered counts reflect real data; add a way to **view the answers** for a question
   (the idea-bank harvest — AI initiatives, CEO-for-a-day, etc.), not just counts.
3. **Real Excel export:** replace the `exportData()` stub with a genuine export of questions × answers (client-side
   XLSX/CSV is fine — no server). Filename dated; one row per answer with question, answer, type, date.
4. Bump `?v=`.

## Guardrails (do NOT touch)
- **Admin-gated only** (`donnae.abbood@zimmerbiomet.com`, `sean.abbood@thetransformationfoundry.nl`) — never expose
  answers to non-admins. Don't change the wall (photos public) vs answers (private) split.
- Keep `ZB_STORE` API in lockstep. Don't alter the question bank here (that's BRIEF-008). No emojis.
- Don't commit any real answers/PII to the repo.

## Test steps
- `node tools/test-demo.js` green (demo store returns sample aggregated answers so counts + export are testable).
- Live: A + B answer questions in a meetup → admin dashboard **Most-answered** shows real counts → open a question →
  the actual answers show. **Export** downloads a real .xlsx/.csv with the answers.
- Sign in as a **non-admin** (once more colleagues exist) → no access to answers/export.

## Definition of done
Admin sees real answer counts + the answers themselves and can export them to Excel; access is admin-only and
rules verified/published; demo harness green; both stores in lockstep; `?v=` bumped; tracker ticked; session log written.
