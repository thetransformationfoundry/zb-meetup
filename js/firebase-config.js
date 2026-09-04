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

  // Only these emails get admin powers (the Admin dashboard).
  ADMIN_EMAILS: [
    "donnae.abbood@zimmerbiomet.com",         // Donnae — initiative owner
    "sean.abbood@thetransformationfoundry.nl" // Sean — builder
  ],

  appName: "ZB MeetUP"
};

// LIVE once real keys are present (they are), else DEMO mode.
window.ZB_LIVE = !!window.ZB_CONFIG.firebase.apiKey &&
                 window.ZB_CONFIG.firebase.apiKey.indexOf("PASTE") === -1;
