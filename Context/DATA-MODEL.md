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
  photoBy: { <uid>: base64 | null }
  pointsAwarded: { <uid>: number }
  messages: [ { by: uid, text, at } ]  // 1:1 coordination chat
  createdAt, acceptedAt, completedAt, remindedAt

posts/{postId}                          // community wall (photos only)
  authorUid, matchId
  names: "A & B"                        // display
  scene: "walk"|"lunch"|"digital"|"coffee"|"litter"
  photo: base64                         // the real meetup photo
  hearts: number, heartedBy: [uid,...]
  comments: [ { by: uid, byName, text, at } ]
  seed: bool                            // seed/holding posts — excluded from analytics/exports
  createdAt

questionBank/{id}     text, type:"business"|"personal", tier:1|2, active:bool
notifications/{uid}/items/{id}   type, text, target, fromUid, read, createdAt
app/config            tournamentName, launchFlags, prizes, closed:bool   // single doc, admin-writable
```

> Reminders: a scheduled Cloud Function nudges both users if a match is `active` but not `completed`
> 3 days after `acceptedAt` (sets `remindedAt`). See ROADMAP.

## Security rules (Firestore, v2 — starting point)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() { return request.auth != null; }
    function isAdmin() {
      return signedIn() && request.auth.token.email in [
        'donnae.abbood@zimmerbiomet.com',
        'sean.abbood@thetransformationfoundry.nl'
      ];
    }
    function isMe(uid) { return signedIn() && request.auth.uid == uid; }

    // Profiles: anyone signed in can read (needed for spin pool + leaderboard);
    // you may only write your own doc (admins may write any, e.g. to fix points).
    match /users/{uid} {
      allow read: if signedIn();
      allow create: if isMe(uid);
      allow update, delete: if isMe(uid) || isAdmin();
    }

    // Matches: only the two participants (or an admin) can read/write.
    match /matches/{id} {
      allow read, update, delete: if isAdmin()
        || (signedIn() && (request.auth.uid == resource.data.a || request.auth.uid == resource.data.b));
      allow create: if signedIn() && request.auth.uid == request.resource.data.a;
    }

    // Wall posts: any signed-in user can read; author creates; anyone signed-in may
    // update ONLY hearts/comments (append) — not the photo/author.
    match /posts/{id} {
      allow read: if signedIn();
      allow create: if signedIn() && request.auth.uid == request.resource.data.authorUid;
      allow update: if signedIn()
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['hearts','heartedBy','comments']);
      allow delete: if isAdmin();
    }

    match /questionBank/{id} {
      allow read: if signedIn();
      allow write: if isAdmin();
    }

    match /notifications/{uid}/items/{id} {
      allow read, write: if isMe(uid);
    }

    match /app/{doc} {
      allow read: if signedIn();
      allow write: if isAdmin();
    }
  }
}
```

**Notes / hardening (later):** like ZB Cup, points are written client-side for launch simplicity
(trust-based, internal audience). If we want to harden, move point awards + match scoring into a Cloud
Function and lock down `users.points` / `matches.pointsAwarded` writes to admin/functions only. Answers
are protected because they live on `matches`, which only participants can read.

## GDPR / end-of-life

Same as ZB Cup: explicit consent at onboarding (`consentAt`); answers private; admin-only export; a
documented deletion path (reuse ZB Cup's `SHUTDOWN-GDPR.md` + `delete-colleague-users.js`) for when the
initiative ends. Seed/holding posts (`seed:true`) are excluded from analytics/exports.
