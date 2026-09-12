/* ============================================================
   ZB MeetUP — Firebase Cloud Messaging service worker (BRIEF-004)
   ------------------------------------------------------------
   Hand-written on purpose: the app has no build step, so this uses the
   COMPAT SDK via importScripts from the same gstatic CDN as index.html.

   SCOPE: GitHub Pages serves this project at /zb-meetup/, NOT at the domain
   root, so this file registers with scope /zb-meetup/ — which still covers
   the whole app. That is why the page registers it with a RELATIVE url and
   passes the registration to getToken(); never hardcode a leading "/".

   PAYLOADS ARE DATA-ONLY. The Cloud Functions send title/body/target inside
   `data` with no `notification` block, so onBackgroundMessage below is the
   SOLE renderer. Adding a `notification` block makes the browser auto-show
   its own notification as well and every push arrives twice.

   CONFIG BELOW IS DUPLICATED from js/firebase-config.js because a service
   worker has no `window` and cannot importScripts that file. It is public
   config, not a secret. tools/test-demo.js asserts the two copies match, so
   they cannot drift silently.
   ============================================================ */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAGOa0dpFlaFEg_hLDe8lX64jclZMYn9Cc",
  authDomain: "zb-meetup.firebaseapp.com",
  projectId: "zb-meetup",
  storageBucket: "zb-meetup.firebasestorage.app",
  messagingSenderId: "781096444172",
  appId: "1:781096444172:web:ba9839447f3734bd9ce929"
});

var messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  var d = (payload && payload.data) || {};
  // Every field arrives as a string — FCM data payloads carry nothing else.
  var title = d.title || 'ZB MeetUP';
  var opts = {
    body: d.body || '',
    icon: 'assets/icon-192.png',
    badge: 'assets/icon-192.png',
    // Collapse repeats of the same conversation rather than stacking them.
    tag: d.tag || d.target || 'zb',
    renotify: true,
    data: { target: d.target || 'spin' }
  };
  return self.registration.showNotification(title, opts);
});

// ONE deep-link source: the notification's own `target`, the same string the
// in-app bell already uses (meetups / thread:<id> / meet:<id> / spin). No
// second type->route map to drift out of step with the app.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = (event.notification.data && event.notification.data.target) || 'spin';
  var scope = self.registration.scope;                       // .../zb-meetup/
  var url = scope + '?zbTarget=' + encodeURIComponent(target);

  event.waitUntil((async function () {
    var all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < all.length; i++) {
      if (all[i].url.indexOf(scope) === 0) {
        // Already open: focus it and let the app route itself, so we don't
        // reload and lose whatever the colleague was typing.
        try { all[i].postMessage({ zbTarget: target }); } catch (e) {}
        return all[i].focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
