# ZB MeetUP — Project Context

> **What this file is:** the single, grounded source of truth for the ZB MeetUP app — the concept,
> who it's for, decisions, feature map, matching rules, points, and current open items. **Read this
> first** at the start of every session.
>
> **Docs layout:** `Documentation/context/` = living project docs (this file + SPEC, DATA-MODEL, ROADMAP).
> `Documentation/sessions/` = dated work logs. `Comms/` = launch communications for Donnae.
> **Sibling project:** ZB Cup (`../zb-cup`) — we *reuse components* from it but ZB MeetUP is a
> **separate app, separate GitHub repo, separate Firebase project**. Nothing here touches ZB Cup.

_Last updated: 2026-09-04 — **status: LIVE (v=6)** · moving to a git + Claude Code workflow_

> **Dev workflow (new):** development now happens in **Claude Code / VS Code** against the git repo
> (branches → PR → merge to `main` = deploy via GitHub Pages). Project brief for CC is in **`CLAUDE.md`**
> at the repo root; test harness in **`docs/HARNESS.md`** (`node tools/test-demo.js`). Docs live in
> **`docs/`** (context + dated session logs). No more manual web-UI uploads.

> **Privacy (locked):** the employee spreadsheet stays private (invite list only) — no employee
> directory in the public repo; colleagues self-register + pick work setup/role at onboarding. See
> `DATA-MODEL.md`. Go-live steps for Sean: `SETUP.md`.

---

## 1. The idea in one line

A friendly, mobile-first app that matches Zimmer Biomet colleagues with each other each day for a
quick meetup (coffee, walk, or Teams call) — to rebuild human connection and morale, gamified with
points and a leaderboard.

## 2. Why it exists

ZB has been through a major restructure — people joined, people left, morale and engagement dipped.
ZB MeetUP is a light, positive way to **reconnect colleagues across departments, entities and
locations** ahead of the **company engagement survey on 4 October 2026**. Guiding philosophy:
**human connection first** — once people know each other, business collaboration follows organically.
Not a business-quiz app; it's about well-being and real conversation.

## 3. Who it's for

- **Users:** ~329 Zimmer Biomet colleagues from `ZB-MeetUP/Overzicht Medewerkers.xlsx` — two legal
  entities (Biomet Global Supply Chain ×242, ZB Netherlands B.V. ×87), across Hazeldonk (on-site) and
  NL Commercial (largely remote). Employees (292) and externals (37), all with `@zimmerbiomet.com` emails.
- **Super-admins:** Donnae Abbood (`donnae.abbood@zimmerbiomet.com`, QARA Manager, initiative owner)
  and Sean (`sean.abbood@thetransformationfoundry.nl`, builder). Both see the admin dashboard + exports.

## 4. The core loop

Spin (fun animation cycling colleague faces → slows → lands on a match) → **send request** → the other
person gets a **notification** → they **accept** → a **shared match space unlocks** that both can see and
fill in → they **meet up** → **prove it** (photo + answer the 3 discussion questions) → match moves to
each person's **history list**.

## 5. Locked decisions (from the kickoff meeting)

| Topic | Decision |
|---|---|
| Name | **ZB MeetUP** (evolved from ZB Match / ZB MatchUp) |
| Platform | Mobile-first web app, **same stack as ZB Cup**: plain HTML/CSS/vanilla JS, no build |
| Hosting / backend | **New** GitHub Pages repo + **new** Firebase project (Auth + Firestore). Separate from ZB Cup. |
| Sign-in | Work email + password (like ZB Cup); send colleagues the URL |
| Profile | Photo or initials fallback |
| Matching | Never the same person twice; **max 2 respins/day**; skip / send / spin-again |
| Hard rule | **Floor workers (Warehouse Clerk / NonEE Warehouse Clerk — no computer) can only match with on-site colleagues.** Everyone else can match with anyone (incl. fully remote). |
| Points | Photo of meetup = **5**; answer the 3 questions = **5** (10/match) |
| Questions | Round-robin bank (~50), **3 per meetup**, ~60/40 business/personal, **tiered** (highest-value first) |
| Privacy | Meetup **photos** → community wall (public); **questionnaire answers → private** (admins only) |
| Consent | **GDPR consent** disclaimer at onboarding |
| Notifications | Push/in-app notifications for requests & acceptances |
| Design | Reuse the **`zimmer-app-design`** system (Apple-clean, ZB blue `#0079BD`) |

## 6. Matching rules (the hard logic)

The real divider is **"on the floor, no computer" vs. everyone else**:

- **Floor workers** = positions `Warehouse Clerk` and `NonEE Warehouse Clerk` (155 people in the sheet,
  all On-Site). They can **only** be matched with **on-site** colleagues.
- **Everyone else** — even fully on-site (e.g. Quality behind a desk) — can be matched with anyone,
  including fully remote.
- Derive a boolean **`floorWorker`** from the position title; derive **`onSite` / `partial` / `remote`**
  from Work Classification (which is messy in the sheet — has transition values like "Partially
  Remote → Fully Remote" — so **normalise** to the current state).
- Match eligibility (A can match B) = not previously matched · A≠B · if either is a floor worker, both
  must be on-site. Meetup *type* options adapt to work classification (in-person options for on-site
  pairs; Teams-call option when either is remote).

## 7. Points & gamification

| Action | Points |
|---|---|
| Upload a meetup photo (in-person or Teams screenshot) | 5 |
| Answer the 3 discussion questions for a meetup | 5 |

- Leaderboard (overall). **Match of the day / week.** Community wall of photos.
- Prizes TBD (idea floated: a Transformation Foundry AI workshop for top idea-contributors — noted
  potential conflict of interest since Sean is married to Donnae; park for later).

## 8. Discussion questions

- Bank of **~50**, **3 shown per meetup**, mix ~60% business / 40% personal.
- **Tiered:** everyone's earliest meetups get the highest-value questions (e.g. "If you were CEO for a
  day, what would you initiate?", "How would you bring AI into your day-to-day?", Start/Stop/Continue);
  lighter/personal ones later (hobbies, aspirations, fears).
- Answers may repeat across matches (opinions change). **Strategic payoff:** the answers form a
  structured **idea bank** (e.g. 30 AI initiatives → pick 3 to run → originators help lead them).

## 9. Admin

Super-admins (Donnae + Sean): dashboard of most-answered questions & most-engaged people, granular
engagement data, and **export questionnaire data to Excel**. Questionnaire answers are admin-only.

## 10. Open decisions / to confirm

- Exact **question bank** (Donnae to curate the ~50 + the tier order).
- "Minimum number of responses" Donnae mentioned — clarify what it gates.
- Daily match limit beyond the 2-respin cap? (e.g. how many *active* open matches at once.)
- Do both parties fill answers before either can see the other's, or visible once submitted?
- Meetup-type list per work classification (final wording + any point bonuses e.g. litter-pick).
- Prizes + the workshop idea (conflict-of-interest handling).
- Push notifications: true push (needs setup) vs. in-app only for v1.

## 11. Comms (Donnae's asks — see `../../Comms/`)

Off-site teaser (Sept 4) · exec summary for her manager · Sept 10 newsletter article · styled invite
email. Drafts delivered in `Comms/ZB-MeetUP-comms.md`.

## 12. Timeline

Off-site teaser **Sept 4** → newsletter **Sept 10** → drive engagement → **engagement survey Oct 4**
(be live and buzzing before this).
