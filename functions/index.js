/* ============================================================
   ZB MeetUP — Cloud Functions (BRIEF-004)
   ------------------------------------------------------------
   Four functions, all server-side with the Admin SDK (no key in the repo —
   they run as the project's runtime service account and bypass rules):

     1. onNotificationCreated  notifications/{uid}/items/{id} onCreate -> push.
        ONE path covers request / accept / message, because every one of those
        already writes that in-app notification (BRIEF-003). The bell and the
        push can never disagree.
     2. dailyReminder          matches accepted > 3 days ago, not completed.
     3. dailySpinNudge         09:00 Europe/Amsterdam, "time to spin".
     4. onMatchPhotoWritten    the shared photo's +5, instantly and idempotently.

   WHY THE v1 API: this project's Firestore database is in eur3 (EU multi-region).
   v2 Firestore triggers run through Eventarc and must sit in a matching region,
   which is a deploy-time trap for a one-command handoff. The v1 triggers deploy
   to the default region against any database location. Swap to v2 later if the
   database ever moves to a single region.
   ============================================================ */
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const { sendToUser, recipient } = require("./send");
const { t } = require("./i18n");

const db = () => admin.firestore();
const DAY = 24 * 60 * 60 * 1000;

// All four run in europe-west1, inside the eur3 multi-region that holds the
// database. Two reasons: colleague data (names, message text, tokens) stays in
// the EU rather than crossing to us-central1 and back on every push, and the
// Firestore triggers stop making a transatlantic hop before they can send.
// Changing this region deletes and recreates the functions.
const eu = functions.region("europe-west1");

/* ---------------------------------------------------------------
   1. Every in-app notification becomes a device push.
   --------------------------------------------------------------- */
exports.onNotificationCreated = eu.firestore
  .document("notifications/{uid}/items/{id}")
  .onCreate(async (snap, ctx) => {
    const uid = ctx.params.uid;
    const n = snap.data() || {};

    // The welcome notification is written during signup, before a token can
    // exist, and a push saying "welcome" to someone already looking at the app
    // is noise. The bell still shows it.
    if (n.type === "welcome") return null;

    const to = await recipient(uid);
    if (!to.consent) return null;

    const key = { request: "notif_request", accept: "notif_accept", msg: "notif_msg" }[n.type];
    let body;
    if (key) {
      // Prefer the sender's real name over parsing the stored English text.
      let name = "";
      if (n.fromUid) { const from = await recipient(n.fromUid); name = from.first || from.name; }
      body = t(key, to.lang, { name: name || t("fallback_name", to.lang) });
    } else {
      body = n.text || "";                       // unknown type: stored text, still delivered
    }
    if (!body) return null;

    await sendToUser(uid, { title: "ZB MeetUP", body, target: n.target || "spin" });
    return null;
  });

/* ---------------------------------------------------------------
   2. Accepted but not finished after 3 days.
   Each side is nudged only about ITS OWN unfinished part.
   --------------------------------------------------------------- */
exports.dailyReminder = eu.pubsub
  .schedule("0 10 * * *").timeZone("Europe/Amsterdam")
  .onRun(async () => {
    const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - 3 * DAY);
    // Range on ONE field only, then filter status in code. Adding
    // .where("status","==","active") would need a composite index and so an
    // extra manual deploy step; at this collection's size the filter is free.
    const q = await db().collection("matches")
      .where("acceptedAt", "<=", cutoff)
      .get();

    let sent = 0;
    for (const doc of q.docs) {
      const m = doc.data() || {};
      if (m.status !== "active") continue;
      const done = m.completedBy || {};
      for (const side of ["a", "b"]) {
        const uid = m[side]; if (!uid || done[uid]) continue;
        const to = await recipient(uid); if (!to.consent) continue;
        const otherProfile = side === "a" ? m.bProfile : m.aProfile;
        const otherName = (otherProfile && (otherProfile.first || otherProfile.name)) || t("fallback_name", to.lang);
        const r = await sendToUser(uid, {
          title: "ZB MeetUP",
          body: t("push_reminder", to.lang, { name: otherName }),
          target: "meet:" + doc.id
        });
        sent += r.sent;
      }
    }
    console.log("dailyReminder: matches", q.size, "pushes", sent);
    return null;
  });

/* ---------------------------------------------------------------
   3. The 09:00 Europe/Amsterdam spin nudge.
   Silent before the launch instant — telling people to spin while spinning is
   still locked would send them to a countdown.
   --------------------------------------------------------------- */
const SPIN_UNLOCK_MS = Date.parse("2026-09-16T09:00:00+02:00");

exports.dailySpinNudge = eu.pubsub
  .schedule("0 9 * * *").timeZone("Europe/Amsterdam")
  .onRun(async () => {
    if (Date.now() < SPIN_UNLOCK_MS) { console.log("dailySpinNudge: before unlock, skipped"); return null; }
    const users = await db().collection("users").get();
    let sent = 0, skipped = 0;
    for (const u of users.docs) {
      const v = u.data() || {};
      if (v.pushConsent === false) { skipped++; continue; }
      const r = await sendToUser(u.id, {
        title: "ZB MeetUP",
        body: t("push_nudge", v.lang || "en"),
        target: "spin"
      });
      sent += r.sent;
    }
    console.log("dailySpinNudge: users", users.size, "pushes", sent, "opted out", skipped);
    return null;
  });

/* ---------------------------------------------------------------
   4. The shared photo is worth +5 to BOTH participants. The client can only
   write its own user doc, so BRIEF-005 had the other side self-claim on its
   next sync. This grants it the moment the photo lands.

   Idempotent: the award is inside a transaction that re-checks
   photoAwarded[uid], so this, the setter's own claim and the client fallback
   can all race without double-paying. The client self-claim STAYS as a
   fallback for the seconds before this runs, or if it ever fails.
   --------------------------------------------------------------- */
exports.onMatchPhotoWritten = eu.firestore
  .document("matches/{id}")
  .onUpdate(async (change) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};
    if (!after.photo) return null;
    if (before.photo === after.photo) return null;      // not a photo change

    const ref = change.after.ref;
    const uids = [after.a, after.b].filter(Boolean);

    for (const uid of uids) {
      await db().runTransaction(async tx => {
        const s = await tx.get(ref);
        const d = s.data(); if (!d || !d.photo) return;
        if (d.photoAwarded && d.photoAwarded[uid]) return;   // already paid — never twice
        tx.update(ref, { ["photoAwarded." + uid]: true });
        tx.update(db().collection("users").doc(uid),
          { points: admin.firestore.FieldValue.increment(5) });
      });
    }
    return null;
  });
