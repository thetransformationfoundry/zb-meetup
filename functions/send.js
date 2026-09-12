/* ============================================================
   ZB MeetUP Functions — one place that talks to FCM
   ------------------------------------------------------------
   DATA-ONLY payloads. No `notification` block: the service worker's
   onBackgroundMessage is the sole renderer. Including one makes the browser
   auto-show its own copy as well, and every push arrives twice.

   All data values MUST be strings — FCM rejects anything else.

   SELF-HEALING TOKENS: dead tokens are removed when a send reports them
   unregistered. That is why the client keeps every device's token instead of
   wiping on sign-in — a colleague may use a phone and a laptop.
   ============================================================ */
const admin = require("firebase-admin");

const DEAD = [
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument"
];

async function tokensFor(uid) {
  const snap = await admin.firestore()
    .collection("users").doc(uid).collection("fcmTokens").get();
  return snap.docs.map(d => d.id).filter(Boolean);
}

async function dropTokens(uid, tokens) {
  if (!tokens.length) return;
  const batch = admin.firestore().batch();
  tokens.forEach(tk => batch.delete(
    admin.firestore().collection("users").doc(uid).collection("fcmTokens").doc(tk)));
  await batch.commit();
}

/** Send one data-only push to every device a user has. Never throws. */
async function sendToUser(uid, { title, body, target }) {
  if (!uid || !body) return { sent: 0, removed: 0 };
  let tokens;
  try { tokens = await tokensFor(uid); } catch (e) { console.error("tokens read failed", uid, e); return { sent: 0, removed: 0 }; }
  if (!tokens.length) return { sent: 0, removed: 0 };            // push simply off for them

  const message = {
    data: {
      title: String(title || "ZB MeetUP"),
      body: String(body),
      target: String(target || "spin")
    }
  };

  // 500 tokens per call is the API limit; chunk so a popular account cannot fail wholesale.
  let sent = 0; const dead = [];
  for (let i = 0; i < tokens.length; i += 500) {
    const chunk = tokens.slice(i, i + 500);
    let res;
    try {
      res = await admin.messaging().sendEachForMulticast(Object.assign({ tokens: chunk }, message));
    } catch (e) { console.error("send failed", uid, e && e.message); continue; }
    res.responses.forEach((r, idx) => {
      if (r.success) { sent++; return; }
      const code = (r.error && r.error.code) || "";
      if (DEAD.indexOf(code) > -1) dead.push(chunk[idx]);
      else console.warn("push error", uid, code);
    });
  }
  if (dead.length) { try { await dropTokens(uid, dead); } catch (e) { console.error("cleanup failed", uid, e); } }
  return { sent, removed: dead.length };
}

/** A user's language + push consent, with safe defaults. */
async function recipient(uid) {
  try {
    const d = await admin.firestore().collection("users").doc(uid).get();
    const v = d.exists ? (d.data() || {}) : {};
    return {
      lang: v.lang || "en",
      name: v.name || "",
      first: (v.name || "").split(" ")[0] || "",
      // Absent means consented: accounts created before BRIEF-004 have no field,
      // and they only have a token at all if they opted in on this device.
      consent: v.pushConsent !== false
    };
  } catch (e) { return { lang: "en", name: "", first: "", consent: true }; }
}

module.exports = { sendToUser, recipient, tokensFor };
