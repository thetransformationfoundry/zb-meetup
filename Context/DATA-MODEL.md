# ZB MeetUP — Data Model & Security Rules

Firestore structure + rules for the live app. Pairs with `SPEC.md`. Same stack as ZB Cup
(Firebase Auth email/password + Cloud Firestore; photos stored inline as base64, no Cloud Storage).

_Last updated: 2026-09-04_

---

## Privacy decision (locked)

**We do NOT commit the employee list to the (public) repo.** The `Overzicht Medewerkers.xlsx` (329 real
names + emails) stays **private** — it's just the invite list (who gets the URL). Colleagues
**self-register** with their work email and pick their **work setup + role** during onboarding (already
built), so matching eligibility is computed from each user's own stored fields. This keeps real PII out
of a public GitHub repo and is GDPR-clean, mirroring ZB Cup's self-registration approach.

## Collections

```
users/{uid}
  firstName, lastName, name, email, photo (base64 | null)
  workClass: "on-site" | "partial" | "remote"
  floorWorker: bool          // warehouse/floor — matches only with on-site
  role, department           // from onboarding
  points: number             // total engagement points
  consentAt: timestamp       // GDPR consent
  isAdmin: bool              // convenience mirror; source of truth is ADMIN_EMAILS
  respins: { date: "YYYY-MM-DD", used: number }
  matchedWith: [uid, ...]    // completed pairs, so we never re-match
  createdAt

matches/{matchId}
  a: uid, b: uid                       // a = requester, b = accepter
  status: "requested" | "active" | "completed" | "declined"
  meetupType: string
  questionIds: [id, id, id]
  answers: { <uid>: {q0,q1,q2}, <uid>: {...} }   // PRIVATE (participants + admins only)
  photo: base64 | null                 // ONE shared photo per meetup (v=7); either participant
                                       // may set or replace it. Replaced the per-uid photoBy map.
  photoAwarded: { <uid>: true }        // v=8 — the shared photo's +5, claimed once per participant
  completedBy: { <uid>: millis }       // v=8 — PER-USER completion; status flips to "completed"
                                       // only once BOTH uids are present
  postId: string | null                // v=8 — the one wall post for this meetup (guards duplicates)
  messages: [ { by: uid, text, at } ]  // 1:1 coordination chat
  createdAt, acceptedAt, completedAt, remindedAt

posts/{postId}                          // community wall (photos only)
  authorUid, matchId
  names: "A & B"                        // display
  scene: "walk"|"lunch"|"digital"|"coffee"|"litter"
  photo: base64                         // the real meetup photo
  hearts: number, heartedBy: [uid,...]
  comments: [ { byUid, text, at } ]      // BRIEF-011A: author is byUid = request.auth.uid,
                                        // enforced by the rule; the display name is rendered
                                        // from users/{byUid}, never stored on the comment.
                                        // Comments written before 2026-09-10 carry a
                                        // client-supplied `by` name and no uid — rendered
                                        // as-is, but not verifiable.
  seed: bool                            // seed/holding posts — excluded from analytics/exports
  createdAt

questionBank/{id}     text, type:"business"|"personal", tier:1|2, active:bool
notifications/{uid}/items/{id}   type, text, target, fromUid, read, createdAt
app/config            tournamentName, launchFlags, prizes, closed:bool   // single doc, admin-writable
```

> Reminders: a scheduled Cloud Function nudges both users if a match is `active` but not `completed`
> 3 days after `acceptedAt` (sets `remindedAt`). See ROADMAP.

## Security rules (Firestore)

> **The executable truth is [`firestore.rules`](../firestore.rules) at the repo root.** It is not duplicated
> here any more — this document used to carry its own copy and it **drifted** (it was missing the
> `bugReports` block, so pasting it over live would have silently disabled bug reporting). One file, diffable
> in git. See [`RULES.md`](RULES.md) for the edit → publish flow.
>
> **Rules only protect once published.** A change committed to `firestore.rules` does nothing until it is
> deployed to the project.

What the rules enforce, in prose (the *why*; `firestore.rules` is the *what*):

| Collection | Read | Write |
|---|---|---|
| `users/{uid}` | any signed-in colleague (needed for the spin pool + leaderboard) | create **only** with an allowed-domain token email (BRIEF-009 — the hard gate: no profile means no app); update/delete yourself, or an admin |
| `matches/{id}` | the two participants, or an admin | same — so a match's private `answers` are never readable by anyone else |
| `posts/{id}` | any signed-in colleague | author or admin may change the post's content (photo included); everyone else is limited to `hearts` / `heartedBy` / `comments` (BRIEF-010). Any write touching `comments` must be a **single append stamped with the caller's own uid** — admins exempt, so they can moderate (BRIEF-011A) |
| `questionBank/{id}` | any signed-in colleague | admins only |
| `notifications/{uid}/items/{id}` | **only you** | you may mark read / clear your own; any colleague may *deliver* one to you, stamped with their own `fromUid`, unread, and only in the documented shape (BRIEF-003) |
| `bugReports/{id}` | admins only | any signed-in colleague may file one |
| `app/{doc}` | any signed-in colleague | admins only |

Admin gating is by email (`isAdmin()`), matching `ADMIN_EMAILS` in `js/firebase-config.js`. The allowed
sign-up domains in `allowedDomain()` must stay in step with `ALLOWED_DOMAINS` in the same file — they are two
expressions of one decision, and changing one means changing the other.

### Known residual gaps
- ~~Comment attribution is client-supplied~~ — **closed** by BRIEF-011A (2026-09-10): comments store
  `byUid`, the rule requires it to be the caller's uid, and the name is rendered from the profile.
- **Interaction values** aren't validated: a non-author is limited to the three interaction *fields*, but
  could still set `hearts` to an arbitrary number. BRIEF-011 Part B — **won't do** (Sean, 2026-09-10).
- **Off-domain auth accounts** can still be created (they get no profile, so no app access) until the
  `beforeCreate` blocking function lands with BRIEF-004.

## GDPR / end-of-life

Same as ZB Cup: explicit consent at onboarding (`consentAt`); answers private; admin-only export; a
documented deletion path (reuse ZB Cup's `SHUTDOWN-GDPR.md` + `delete-colleague-users.js`) for when the
initiative ends. Seed/holding posts (`seed:true`) are excluded from analytics/exports.
