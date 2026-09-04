# ZB MeetUP — Feature Spec

Detailed spec for the app. Pairs with `CONTEXT.md` (the source of truth) and `ROADMAP.md` (build plan).
Grounded in the 2026-09-03 kickoff transcript + the employee spreadsheet.

---

## 1. Screens (mobile-first, bottom tab bar — like ZB Cup)

1. **Onboarding / sign-in** — work email + password (create / sign in / forgot password). Then: add
   name (prefilled from directory), profile photo (or initials fallback), and **GDPR consent** tick.
2. **Home / Spin** — the daily hero. A big **Spin** button triggers the match animation (profile
   photos flying past, slowing, landing on a colleague). Shows the matched person's card with
   **Send request / Skip / Spin again** (respins left today: 2). Below: "Waiting for acceptance" items.
3. **Match requests** — incoming requests from others → **Accept / Decline**. On accept, the shared
   match space opens.
4. **My meetups** — list of active + past matches. Each opens the **shared match space**:
   - The other person + agreed meetup type (coffee / walk / break / litter-pick / Teams call).
   - **Upload photo** (5 pts) and the **3 discussion questions** to answer (5 pts).
   - Stays **open until both** have completed; then it's archived in history (both can view photo + both sets of answers).
5. **Community wall** — public feed of meetup **photos** ("engagement of the day / latest meetups") +
   **Match of the day/week**. (Photos only — never the private answers.)
   - **Seed-then-replace content (REQUIREMENT).** The wall and the spin-screen reel must **never look
     empty**. Ship with **seed "meetup" posts** — dummy pairs + illustrative scene images (two people on a
     walk, eating lunch, a digital/Teams coffee, a coffee on site, a litter-pick). As colleagues post real
     meetup photos, **real posts appear on top and push the seed posts out** (once there are enough real
     posts, no seeds show). The **reel and the wall read from the same source** so they always agree. Seed
     posts are flagged (`seed:true`) and excluded from analytics/exports.
6. **Leaderboard** — overall points ranking with photo/initials + total.
7. **Notifications** — bell + badge: new request, request accepted, meetup completed by partner.
8. **Settings** — change photo/name, view consent, sign out.
9. **Admin** (super-admins only) — dashboard + data export (see §5).

## 2. The match lifecycle (states)

`spun` (candidate shown, not sent) → `requested` (A sent, awaiting B) → `active` (B accepted; shared
space open) → `completed` (both uploaded photo and/or answered) → archived in history.
Also `skipped` / `declined` (never counts as "matched"; but pair is still burned so they can't be
re-shown? **Decision needed** — recommend: a *declined/skipped* pair can reappear later, a *completed*
pair cannot).

- **On accept → "Plan your meetup" suggested action.** As soon as both accept, the shared space shows a
  prominent *Plan your meetup* CTA that opens the 1:1 chat, so the pair immediately coordinate a time/place.
- **Reminders.** If a match isn't `completed` within **3 days** of accepting, nudge **both** users
  (notification + optional email) to finish their meetup. Needs a scheduled function in the live build
  (reuse the ZB Cup Cloud Function/scheduler pattern).
- **Admins:** exactly **two** super-admins with access to the Admin area, gated by `ADMIN_EMAILS` (by
  email, same as ZB Cup): `donnae.abbood@zimmerbiomet.com` and `sean.abbood@thetransformationfoundry.nl`.

## 3. Matching engine

- **Eligible pool for user A** = all users where: not A · never previously matched (completed) with A ·
  respects the floor-worker rule (if A or candidate is a floor worker, both must be On-Site).
- **Spin** picks a random eligible user (weight later if needed to spread matches evenly).
- **Respins:** max 2/day per user (server-side counter, resets daily in the user's day).
- **Meetup types** offered adapt to work classification: in-person options when both on-site; a
  **Teams call** option whenever either is remote.
- Derived fields per user: `floorWorker` (from position title = Warehouse Clerk / NonEE Warehouse
  Clerk), `workClass` normalised to `on-site | partial | remote` (take the *current* state from the
  messy "A → B" values in the sheet).

## 4. Discussion questions

- `questionBank`: ~50 questions, each with `text`, `type` (business/personal), `tier` (1 = highest
  value shown first). 3 per meetup, chosen by tier (early meetups pull tier 1), avoiding repeats for
  that user where possible.
- Each meetup stores the 3 question IDs + each participant's answers.
- Answers are **private** (admin-only). **Decision:** show partner's answers to each other after both
  submit (recommended) vs. keep fully private — confirm with Donnae.

## 5. Admin dashboard + export

- Metrics: total meetups, completion rate, most-answered questions, most-engaged people, matches over
  time, entity/department spread.
- **Export questionnaire data to Excel/CSV** (question, answer, respondent, date) for analysis — this
  is the strategic idea-bank harvest (e.g. AI initiatives).
- Manage: question bank (add/edit/tier), community wall moderation, user list, prizes/announcements.

## 6. Data model (Firestore — draft)

```
users/{uid}
  personId, firstName, lastName, email, photo(base64|null)
  legalEntity, location, department, positionTitle
  workClass: "on-site"|"partial"|"remote"   floorWorker: bool
  points: number   consentAt: ts   isAdmin: bool
  respins: { date: "YYYY-MM-DD", used: 0 }

matches/{id}
  a: uid, b: uid   status: requested|active|completed|declined
  meetupType: string   questionIds: [id,id,id]
  answers: { <uid>: {q1,q2,q3}, <uid>: {...} }
  photoBy: { <uid>: base64|null }
  pointsAwarded: { <uid>: number }
  createdAt, acceptedAt, completedAt

questionBank/{id}     text, type, tier, active
posts/{id}            (community wall) authorUid, matchId, photo, caption, createdAt
notifications/{uid}/items/{id}   type, fromUid, matchId, read, createdAt
directory/{personId}  (seed from spreadsheet: for pre-populating eligibility + names, pre-signup)
tournament/config     (app-wide: name, prizes, launch flags)  — mirrors ZB Cup's config pattern
```

Photos stored **inline as base64** (downscaled in-browser), like ZB Cup — no Cloud Storage.

## 7. Security & privacy

- Firestore rules: users read/write own doc; matches readable/writable only by the two participants;
  `answers` never exposed to non-participants; admin-only collections gated by `ADMIN_EMAILS`.
- **GDPR:** explicit consent at onboarding; answers private; export is admin-only; documented deletion
  path for end-of-initiative (reuse ZB Cup's `SHUTDOWN-GDPR` pattern).

## 8. The employee spreadsheet (private — NOT in the repo)

**Decision (see DATA-MODEL.md):** `Overzicht Medewerkers.xlsx` (329 real names + emails) stays **private**
— it's just the **invite list** (who gets the URL). We do **not** commit it or a derived directory to the
public repo. Colleagues **self-register** (email/password) and choose their **work setup + role** at
onboarding, so matching eligibility comes from each user's own stored fields. Keeps PII out of a public
repo and is GDPR-clean (mirrors ZB Cup).
