/* ============================================================
   ZB MeetUP — Firebase configuration
   ------------------------------------------------------------
   The app runs in DEMO MODE (in-browser, no backend) until real
   Firebase keys are present below — then it switches to LIVE MODE
   (shared by all colleagues via Firebase Auth + Cloud Firestore).

   NOTE: the Firebase web config below is PUBLIC by design and safe
   to commit — it's a project address, not a secret. Access to data
   is controlled by the Firestore security rules, not by hiding this.
   No colleague data (emails, photos, answers) is ever stored in this
   repo — it all lives in Firestore behind the rules.
   ============================================================ */

window.ZB_CONFIG = {
  firebase: {
    apiKey: "AIzaSyAGOa0dpFlaFEg_hLDe8lX64jclZMYn9Cc",
    authDomain: "zb-meetup.firebaseapp.com",
    projectId: "zb-meetup",
    storageBucket: "zb-meetup.firebasestorage.app",
    messagingSenderId: "781096444172",
    appId: "1:781096444172:web:ba9839447f3734bd9ce929"
  },

  // ZB MeetUP is closed to the world: only these email domains may create an account.
  // Single source of truth — the client check, both stores and the Firestore rules all key off this.
  // Changing this list means re-publishing the Firestore rules to match (see Context/DATA-MODEL.md).
  ALLOWED_DOMAINS: [
    "zimmerbiomet.com",            // Zimmer Biomet colleagues
    "thetransformationfoundry.nl"  // The Transformation Foundry (builder)
  ],

  // Only these emails get admin powers (the Admin dashboard).
  ADMIN_EMAILS: [
    "donnae.abbood@zimmerbiomet.com",         // Donnae — initiative owner
    "sean.abbood@thetransformationfoundry.nl" // Sean — builder
  ],

  // Spinning unlocks Wed 16 Sep 2026, 09:00 Europe/Amsterdam (CEST = UTC+2, so 07:00Z).
  // ONE source of truth — a fixed instant, so everyone unlocks together regardless of device
  // timezone. This is a soft launch gate, not security: the check is client-side by design.
  SPIN_UNLOCK: "2026-09-16T09:00:00+02:00",

  // Web Push (BRIEF-004). PUBLIC key from Firebase Console -> Project Settings ->
  // Cloud Messaging -> Web Push certificates. Public by design, like the apiKey.
  // Empty = push stays off everywhere: no prompts, no toggle, no errors.
  VAPID_PUBLIC_KEY: "BLKfta0lc2uk7fjphtHt5f_uq-rN8CMk9sJJpa0-3uuAsTGkc8WZOYXHdJnTEohPE5o83A8NbaOEbvERCmP3ymo",

  appName: "ZB MeetUP"
};

window.ZB_SPIN_UNLOCK = new Date(window.ZB_CONFIG.SPIN_UNLOCK);

// Is this email allowed to hold an account? Case-insensitive, exact domain match
// (so "notzimmerbiomet.com" and "zimmerbiomet.com.evil.tld" are both rejected).
window.ZB_DOMAIN_OK = function (email) {
  const at = String(email || "").trim().toLowerCase().lastIndexOf("@");
  if (at < 1) return false;
  const domain = String(email).trim().toLowerCase().slice(at + 1);
  return (window.ZB_CONFIG.ALLOWED_DOMAINS || []).some(d => d.toLowerCase() === domain);
};
// Human-readable form of the list, for messages shown to people.
window.ZB_DOMAIN_HINT = function () {
  return (window.ZB_CONFIG.ALLOWED_DOMAINS || []).map(d => "@" + d).join(" or ");
};

// LIVE once real keys are present (they are), else DEMO mode.
window.ZB_LIVE = !!window.ZB_CONFIG.firebase.apiKey &&
                 window.ZB_CONFIG.firebase.apiKey.indexOf("PASTE") === -1;
