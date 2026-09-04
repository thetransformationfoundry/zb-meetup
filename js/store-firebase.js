/* ============================================================
   ZB MeetUP — LIVE store (Firebase Auth + Cloud Firestore)
   Implements the same ZB_STORE API as store.js (demo).
   Uses the compat SDK loaded by index.html.
   ============================================================ */
(function () {
"use strict";
firebase.initializeApp(window.ZB_CONFIG.firebase);
const auth = firebase.auth();
const db = firebase.firestore();
const FV = firebase.firestore.FieldValue;
const nowTs = () => FV.serverTimestamp();
const ADMINS = (window.ZB_CONFIG.ADMIN_EMAILS || []).map(e => e.toLowerCase());

// default question bank (always present; admin can add more)
const DEFAULTS = [
  { id:"q1", text:"If you were CEO for a day, what would you initiate?", tier:1, count:0 },
  { id:"q2", text:"How would you bring AI into your day-to-day work?", tier:1, count:0 },
  { id:"q3", text:"Start / Stop / Continue — name one of each for our team.", tier:1, count:0 },
  { id:"q4", text:"What's a hobby or passion outside of work?", tier:2, count:0 },
  { id:"q5", text:"What's something you're proud of this year?", tier:2, count:0 },
  { id:"q6", text:"What's one thing that would make your workday better?", tier:2, count:0 },
  { id:"q7", text:"If you could swap roles for a week, what would you try?", tier:2, count:0 },
];
const slug = n => (n||"").toLowerCase().replace(/\s*&\s*/g,"-and-").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const SEED_DEFS = [
  { names:"Anna & Mateo", scene:"walk",    hearts:12, comments:[{by:"Priya",text:"Love this @Anna!"}] },
  { names:"Priya & Tom",  scene:"lunch",   hearts:8,  comments:[] },
  { names:"Lena & Sven",  scene:"digital", hearts:15, comments:[{by:"Marco",text:"Great cross-team catch-up"}] },
  { names:"Ravi & Chloe", scene:"coffee",  hearts:6,  comments:[] },
  { names:"Marco & Ines", scene:"litter",  hearts:9,  comments:[] },
  { names:"Yuki & Ben",   scene:"coffee",  hearts:11, comments:[] },
];
const SEEDS = SEED_DEFS.map((p,i) => ({ id:"s"+(i+1), seed:true, names:p.names, scene:p.scene, photo:"assets/holding-demo-photos/"+slug(p.names)+".jpg", hearts:p.hearts, liked:false, comments:p.comments.map(c=>({...c})) }));

let cachedMe = null, _change = null, _unsub = [], _viewing = "";
// tiny TTL caches to keep read counts down
const cache = {};
function ttl(key, ms, loader) {
  const c = cache[key];
  if (c && (Date.now() - c.t) < ms) return Promise.resolve(c.v);
  return loader().then(v => { cache[key] = { t:Date.now(), v }; return v; });
}
const uidNow = () => auth.currentUser && auth.currentUser.uid;
const profileToPublic = d => ({ uid:d.uid, name:d.name, first:d.first || (d.name||"").split(" ")[0], role:d.role, dept:d.dept, workClass:d.workClass, floor:!!d.floor, color:d.color, photo:d.photo||null, points:d.points||0 });

async function addNotif(uid, o) {
  return db.collection("notifications").doc(uid).collection("items").add(Object.assign({ read:false, createdAt:nowTs() }, o));
}

function attachListeners() {
  detachListeners();
  const uid = uidNow(); if (!uid) return;
  const fire = () => { cache["posts"] = null; if (_change) _change(); };
  const debounced = (() => { let t; return () => { clearTimeout(t); t = setTimeout(fire, 250); }; })();
  _unsub.push(db.collection("matches").where("a","==",uid).onSnapshot(debounced, ()=>{}));
  _unsub.push(db.collection("matches").where("b","==",uid).onSnapshot(debounced, ()=>{}));
  _unsub.push(db.collection("notifications").doc(uid).collection("items").onSnapshot(debounced, ()=>{}));
}
function detachListeners() { _unsub.forEach(u => { try { u(); } catch(e){} }); _unsub = []; }

function mapMatch(id, d, uid) {
  const other = d.a === uid ? d.bProfile : d.aProfile;
  const myAns = (d.answers && d.answers[uid]) || ["","",""];
  const msgs = (d.messages || []).map(m => ({ by: m.by === uid ? "me" : "them", text:m.text }));
  const unread = Math.max(0, msgs.filter(m => m.by === "them").length - ((d.reads && d.reads[uid]) || 0));
  return { id, a:d.a, b:d.b, status:d.status, type:d.type, questions:d.questions || [], person:other,
           answers:myAns.slice(), photo: !!(d.photos && d.photos[uid]), messages:msgs, unread,
           incoming: (d.b === uid && d.status === "requested") };
}

const ZB_STORE = {
  mode: "firebase",
  ready: Promise.resolve(true),

  // ---- auth ----
  onAuth(cb) {
    this._authcb = cb;
    auth.onAuthStateChanged(async u => {
      if (u) { try { const s = await db.collection("users").doc(u.uid).get(); cachedMe = s.exists ? Object.assign({ uid:u.uid }, s.data()) : null; } catch(e){ cachedMe = null; } attachListeners(); }
      else { cachedMe = null; detachListeners(); }
      cb(u ? { uid:u.uid, email:u.email } : null);
    });
  },
  currentUser() { return auth.currentUser ? { uid:auth.currentUser.uid, email:auth.currentUser.email } : null; },
  signUp(email, pass) { return auth.createUserWithEmailAndPassword(email, pass); },
  signIn(email, pass) { return auth.signInWithEmailAndPassword(email, pass); },
  resetPassword(email) { return auth.sendPasswordResetEmail(email); },
  signOut() { detachListeners(); return auth.signOut(); },
  async deleteAccount() { const u = auth.currentUser; if (!u) return; try { await db.collection("users").doc(u.uid).delete(); } catch(e){} try { await u.delete(); } catch(e){ await auth.signOut(); } },

  // ---- profile ----
  async getMe() { const uid = uidNow(); if (!uid) return null; const s = await db.collection("users").doc(uid).get(); cachedMe = s.exists ? Object.assign({ uid }, s.data()) : null; return cachedMe ? { ...cachedMe } : null; },
  async saveMe(partial) {
    const uid = uidNow(); if (!uid) throw new Error("not signed in");
    const ref = db.collection("users").doc(uid);
    const existing = await ref.get();
    const data = Object.assign({}, partial);
    if (partial.name) data.first = partial.name.split(" ")[0];
    if (!existing.exists) { data.points = 0; data.createdAt = nowTs(); data.email = auth.currentUser.email; }
    await ref.set(data, { merge:true });
    const s = await ref.get(); cachedMe = Object.assign({ uid }, s.data());
    cache["users"] = null;
    return { ...cachedMe };
  },
  isAdmin() { const e = (auth.currentUser && auth.currentUser.email || "").toLowerCase(); return Promise.resolve(ADMINS.includes(e)); },

  // ---- users / leaderboard (cached 20s to limit reads) ----
  _allUsers() { return ttl("users", 20000, () => db.collection("users").get().then(q => q.docs.map(d => Object.assign({ uid:d.id }, d.data())))); },
  async listUsers() { const uid = uidNow(); const all = await this._allUsers(); return all.filter(u => u.uid !== uid).map(profileToPublic); },
  async leaderboard() { const uid = uidNow(); const all = await this._allUsers(); return all.map(u => ({ name:u.name, points:u.points||0, color:u.color, photo:u.photo||null, me:u.uid===uid })).sort((a,b)=>b.points-a.points); },

  // ---- matches ----
  async myMatches() {
    const uid = uidNow(); if (!uid) return [];
    const [qa, qb] = await Promise.all([ db.collection("matches").where("a","==",uid).get(), db.collection("matches").where("b","==",uid).get() ]);
    const seen = {}; const out = [];
    [...qa.docs, ...qb.docs].forEach(doc => { if (seen[doc.id]) return; seen[doc.id] = 1; const d = doc.data(); if (d.status === "declined") return; out.push(mapMatch(doc.id, d, uid)); });
    out.sort((a,b) => 0);
    return out;
  },
  async respinsLeft() {
    const me = cachedMe || (await this.getMe()) || {};
    const r = me.respins || { date:"", used:0 }; const today = new Date().toISOString().slice(0,10);
    return r.date === today ? Math.max(0, 2 - r.used) : 2;
  },
  async useRespin() {
    const uid = uidNow(); const today = new Date().toISOString().slice(0,10);
    const me = cachedMe || (await this.getMe()) || {}; const r = me.respins || {};
    const used = r.date === today ? (r.used||0) + 1 : 1;
    await db.collection("users").doc(uid).set({ respins:{ date:today, used } }, { merge:true });
    if (cachedMe) cachedMe.respins = { date:today, used };
    return true;
  },
  async createMatch(other, type, questions) {
    const uid = uidNow(); const me = cachedMe || (await this.getMe());
    const doc = { a:uid, b:other.uid, aProfile:profileToPublic(Object.assign({ uid }, me)), bProfile:profileToPublic(other),
                  status:"requested", type, questions, answers:{}, photos:{}, messages:[], reads:{}, createdAt:nowTs() };
    const ref = await db.collection("matches").add(doc);
    await addNotif(other.uid, { type:"request", icon:"users", text:(me.name||"A colleague")+" wants to meet you — open Meetups to accept.", target:"meetups" });
    return ref.id;
  },
  async acceptMatch(id) {
    const uid = uidNow(); const ref = db.collection("matches").doc(id);
    const d = (await ref.get()).data(); if (!d) return false;
    await ref.update({ status:"active", acceptedAt:nowTs() });
    const meName = (cachedMe && cachedMe.name) || "Your match";
    await addNotif(d.a, { type:"accept", icon:"check", text:meName+" accepted your match! Open the shared space to coordinate.", target:"meet:"+id });
    return true;
  },
  async declineMatch(id) { await db.collection("matches").doc(id).update({ status:"declined" }); return true; },
  async sendMessage(id, text) {
    const uid = uidNow(); const ref = db.collection("matches").doc(id);
    const d = (await ref.get()).data(); if (!d) return false;
    await ref.update({ messages: FV.arrayUnion({ by:uid, text, at:Date.now() }) });
    const other = d.a === uid ? d.b : d.a;
    await addNotif(other, { type:"msg", icon:"chat", text:((cachedMe&&cachedMe.name)||"Your match")+" sent you a message", target:"thread:"+id });
    return true;
  },
  async clearMatchUnread(id) { const uid = uidNow(); const ref = db.collection("matches").doc(id); const d = (await ref.get()).data(); if (d) await ref.update({ ["reads."+uid]: (d.messages||[]).length }); return true; },
  async setMatchPhoto(id, photo) { const uid = uidNow(); await db.collection("matches").doc(id).update({ ["photos."+uid]: photo || true }); return true; },
  async setMatchAnswers(id, answers) { const uid = uidNow(); await db.collection("matches").doc(id).update({ ["answers."+uid]: answers }); return true; },
  async completeMatch(id, post) {
    const uid = uidNow(); const ref = db.collection("matches").doc(id);
    await db.runTransaction(async tx => {
      const s = await tx.get(ref); const d = s.data(); if (!d || d.status === "completed") return;
      tx.update(ref, { status:"completed", completedAt:nowTs() });
      tx.update(db.collection("users").doc(d.a), { points: FV.increment(10) });
      tx.update(db.collection("users").doc(d.b), { points: FV.increment(10) });
      const pref = db.collection("posts").doc();
      tx.set(pref, { authorUid:uid, matchId:id, names:post.names, scene:post.scene, photo:post.photo||null, hearts:0, heartedBy:[], comments:[], createdAt:nowTs() });
    });
    cache["users"] = null;
    return true;
  },

  // ---- wall ----
  async listPosts() {
    const uid = uidNow();
    const real = await ttl("posts", 15000, () => db.collection("posts").orderBy("createdAt","desc").limit(30).get()
      .then(q => q.docs.map(doc => { const d = doc.data(); return { id:doc.id, seed:false, names:d.names, scene:d.scene, photo:d.photo||null, hearts:d.hearts||0, liked:(d.heartedBy||[]).includes(uid), comments:d.comments||[] }; })));
    return real.concat(SEEDS.map(s => ({ ...s, comments:s.comments.slice() })));
  },
  async heartPost(id) {
    if (String(id).startsWith("s")) { const w = SEEDS.find(x => x.id === id); if (w) { w.liked = !w.liked; w.hearts += w.liked ? 1 : -1; } return true; }
    const uid = uidNow(); const ref = db.collection("posts").doc(id);
    await db.runTransaction(async tx => { const s = await tx.get(ref); const d = s.data(); if (!d) return; const has = (d.heartedBy||[]).includes(uid); tx.update(ref, { heartedBy: has ? FV.arrayRemove(uid) : FV.arrayUnion(uid), hearts: FV.increment(has ? -1 : 1) }); });
    cache["posts"] = null; return true;
  },
  async commentPost(id, text) {
    const c = { by:(cachedMe&&cachedMe.name)||"You", text, at:Date.now() };
    if (String(id).startsWith("s")) { const w = SEEDS.find(x => x.id === id); if (w) w.comments.push(c); return true; }
    await db.collection("posts").doc(id).update({ comments: FV.arrayUnion(c) }); cache["posts"] = null; return true;
  },

  // ---- notifications ----
  async listNotifs() {
    const uid = uidNow(); if (!uid) return [];
    const q = await db.collection("notifications").doc(uid).collection("items").orderBy("createdAt","desc").limit(30).get();
    return q.docs.map(d => Object.assign({ id:d.id }, d.data()));
  },
  async markNotifRead(id) { const uid = uidNow(); await db.collection("notifications").doc(uid).collection("items").doc(id).update({ read:true }); return true; },
  async markNotifsRead() { const uid = uidNow(); const q = await db.collection("notifications").doc(uid).collection("items").where("read","==",false).get(); const b = db.batch(); q.docs.forEach(d => b.update(d.ref, { read:true })); await b.commit(); return true; },
  clearNotifs() { return this.markNotifsRead(); },
  async welcome() { const uid = uidNow(); if (uid) await addNotif(uid, { type:"welcome", icon:"users", text:"Welcome to ZB MeetUP! Tap Spin to find your first match.", target:"spin" }); return true; },

  // ---- questions / admin ----
  async questionBank() {
    const added = await ttl("qbank", 60000, () => db.collection("questionBank").get().then(q => q.docs.map(d => Object.assign({ id:d.id }, d.data()))));
    return DEFAULTS.concat(added);
  },
  async addQuestion(text) { await db.collection("questionBank").add({ text, tier:2, count:0, createdAt:nowTs() }); cache["qbank"] = null; return true; },
  async listBugs() { const isAdmin = ADMINS.includes((auth.currentUser && auth.currentUser.email || "").toLowerCase()); if (!isAdmin) return []; const q = await db.collection("bugReports").orderBy("at","desc").limit(50).get(); return q.docs.map(d => d.data()); },
  async sendBug(text) { const uid = uidNow(); await db.collection("bugReports").add({ by:(cachedMe&&cachedMe.name)||"A user", byUid:uid, text, at:new Date().toLocaleDateString() }); return true; },
  async unreadMatches() { const ms = await this.myMatches(); return ms.reduce((s,m)=>s+(m.unread||0),0); },

  onChange(cb) { _change = cb; },
  setViewing(v) { _viewing = v; },
};

window.ZB_STORE = ZB_STORE;
})();
