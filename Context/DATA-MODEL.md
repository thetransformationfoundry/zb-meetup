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
  comments: [ { by: uid, byName, text, at } ]
                                          // DRIFT (2026-09-09): the code writes only
                                          // { by: <display name>, text, at } — no uid. So a
                                          // comment's attribution is client-supplied. Harmless
                                          // through the UI; a direct write could spoof a name.
                                          // Fix = store byUid and render the name from it.
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
    // ZB MeetUP is closed to the world: a profile may only be created by someone whose
    // token email is on an allowed domain. Keep this list in step with ALLOWED_DOMAINS
    // in js/firebase-config.js — [.] is a literal dot, and ^...$ anchors the whole address
    // so "zimmerbiomet.com.evil.tld" and "notzimmerbiomet.com" are both rejected.
    function allowedDomain() {
      return signedIn() && request.auth.token.email is string
        && request.auth.token.email.lower()
             .matches('^[^@]+@(zimmerbiomet[.]com|thetransformationfoundry[.]nl)$');
    }

    // Profiles: anyone signed in can read (needed for spin pool + leaderboard);
    // you may only write your own doc (admins may write any, e.g. to fix points).
    match /users/{uid} {
      allow read: if signedIn();
      allow create: if isMe(uid) && allowedDomain();   // the hard gate: no profile => no app
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
      // The author (and admins) may edit the post's own content, photo included.
      // Everyone else gets the wall's social actions only — heart and comment — and
      // cannot touch authorUid, names, scene or photo. The app only ever writes those
      // three fields from heartPost()/commentPost(), so this is exactly what it needs.
      allow update: if signedIn() && (
           request.auth.uid == resource.data.authorUid
        || isAdmin()
        || request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['hearts','heartedBy','comments'])
      );
      allow delete: if isAdmin();
    }

    match /questionBank/{id} {
      allow read: if signedIn();
      allow write: if isAdmin();
    }

    match /notifications/{uid}/items/{id} {
      // Your own list is yours to read, mark read and clear.
      allow read, update, delete: if isMe(uid);
      // A colleague must be able to DELIVER a notification into someone else's list —
      // that is how requests, accepts and messages reach the bell. `allow write: isMe(uid)`
      // denied exactly that, so no cross-user notification had ever been written. Delivery
      // is constrained: the sender stamps their own uid, cannot pre-mark it read, and
      // cannot add fields outside this shape. They still cannot read or edit the list.
      allow create: if signedIn()
        && request.resource.data.fromUid == request.auth.uid
        && request.resource.data.read == false
        && request.resource.data.keys()
             .hasOnly(['type','icon','text','target','fromUid','read','createdAt']);
    }

    // Bug reports: anyone signed in can file one; only admins can read them.
    // (Was missing from this document while present in the published rules — added
    //  2026-09-09 so the documented ruleset is safe to paste over live.)
    match /bugReports/{id} {
      allow read: if isAdmin();
      allow create: if signedIn();
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
