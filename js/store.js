/* ============================================================
   ZB MeetUP — DEMO store (in-browser only, no backend)
   Implements the same ZB_STORE API as store-firebase.js so the
   UI (app.js) is identical in demo and live modes.
   All methods return Promises. Data is in-memory (resets on reload).
   ============================================================ */
(function () {
  "use strict";

  const COLORS = ["#0079BD","#1E9E5A","#E8B923","#D64545","#7A5AF8","#0EA5A5","#E5731E","#C026A3","#2563EB","#57606A"];
  let ci = 0; const col = () => COLORS[(ci++) % COLORS.length];

  // Demo colleagues (the pool you get matched with)
  const USERS = [
    ["Ksenija","Adamovic","Warehouse Clerk","Distribution","on-site",true],
    ["Branko","Adamovic","Warehouse Clerk","Distribution","on-site",true],
    ["Beata","Nowak","Quality Specialist","Quality & Reg Affairs","on-site",false],
    ["Feisal","Ajamai","Sls Sr Representative","Sales NL North","remote",false],
    ["Ronald","Akkermans","Warehouse Clerk","Distribution","on-site",true],
    ["Alexandra","Racolta","Cust Experience Specialist","Customer Experience","partial",false],
    ["Pascal","Poppelaars","Distribution Team Lead","Distribution","on-site",false],
    ["Patrick","Meijer","IT Sr Analyst","IT - EMEA","partial",false],
    ["Bianca","Nazare","Pricing Analyst","Pricing & Tenders","remote",false],
    ["Andrei","Oancea","Rotating Kit Handling Assistant","Distribution","on-site",true],
    ["Ashley","Timmers","MedEd & Events Specialist","Med Ed & Events","partial",false],
    ["Jakub","Cytryniak","Field Svc Engineer","Sales NL South","remote",false],
  ].map(p => ({ uid:p[0]+p[1], name:p[0]+" "+p[1], first:p[0], role:p[2], dept:p[3], workClass:p[4], floor:p[5], color:col(), photo:null, points:20+Math.floor(Math.random()*70) }));

  const QUESTIONS = [
    { id:"q1", text:"If you were CEO for a day, what would you initiate?", tier:1, count:6 },
    { id:"q2", text:"How would you bring AI into your day-to-day work?", tier:1, count:9 },
    { id:"q3", text:"Start / Stop / Continue — name one of each for our team.", tier:1, count:4 },
    { id:"q4", text:"What's a hobby or passion outside of work?", tier:2, count:7 },
    { id:"q5", text:"What's something you're proud of this year?", tier:2, count:3 },
    { id:"q6", text:"What's one thing that would make your workday better?", tier:2, count:5 },
    { id:"q7", text:"If you could swap roles for a week, what would you try?", tier:2, count:2 },
  ];

  const SEED_POSTS = [
    { names:"Anna & Mateo", scene:"walk",    hearts:12, comments:[{by:"Priya",text:"Love this @Anna!"}] },
    { names:"Priya & Tom",  scene:"lunch",   hearts:8,  comments:[] },
    { names:"Lena & Sven",  scene:"digital", hearts:15, comments:[{by:"Marco",text:"Great cross-team catch-up"}] },
    { names:"Ravi & Chloe", scene:"coffee",  hearts:6,  comments:[] },
    { names:"Marco & Ines", scene:"litter",  hearts:9,  comments:[] },
    { names:"Yuki & Ben",   scene:"coffee",  hearts:11, comments:[] },
  ];
  const slug = n => (n||"").toLowerCase().replace(/\s*&\s*/g,"-and-").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

  // ---- mutable demo state ----
  let ME = null;                 // profile once onboarded
  let MATCHES = [];              // {id,a,b,person,status,type,questionIds,questions,answers,photo,messages,createdAt}
  let NOTIFS = [];
  let POSTS = SEED_POSTS.map((p,i) => ({ id:"s"+(i+1), seed:true, names:p.names, scene:p.scene, photo:"assets/holding-demo-photos/"+slug(p.names)+".jpg", hearts:p.hearts, liked:false, comments:p.comments.map(c=>({...c})) }));
  let RESPINS = { date:"", used:0 };
  let mid = 1, wid = 100, nid = 1;
  const now = () => Date.now();
  const P = v => Promise.resolve(v);

  const ZB_STORE = {
    mode: "demo",
    ready: P(true),

    // ---- auth (demo: any credentials work; profile is null until onboarded) ----
    onAuth(cb) { this._authcb = cb; setTimeout(() => cb(this._email ? { uid:"me", email:this._email } : null), 0); },
    currentUser() { return this._email ? { uid:"me", email:this._email } : null; },
    signUp(email) { this._email = email; if (this._authcb) this._authcb({ uid:"me", email }); return P(true); },
    signIn(email) { this._email = email; if (this._authcb) this._authcb({ uid:"me", email }); return P(true); },
    resetPassword() { return P(true); },
    signOut() { this._email = null; ME = null; MATCHES = []; NOTIFS = []; if (this._authcb) this._authcb(null); return P(true); },

    // ---- profile ----
    getMe() { return P(ME ? { ...ME } : null); },
    saveMe(partial) {
      ME = Object.assign(ME || { points:0, color:"#0079BD" }, partial);
      if (this._email && !ME.email) ME.email = this._email;
      if (this._authcb) this._authcb({ uid:"me", email:ME.email });
      return P({ ...ME });
    },
    isAdmin() { const e = (this._email||"").toLowerCase(); return P((window.ZB_CONFIG.ADMIN_EMAILS||[]).map(x=>x.toLowerCase()).includes(e)); },

    // ---- users / leaderboard ----
    listUsers() { return P(USERS.map(u => ({ ...u }))); },
    leaderboard() {
      const all = USERS.map(u => ({ name:u.name, points:u.points, color:u.color, photo:u.photo, me:false }));
      if (ME) all.push({ name:ME.name, points:ME.points, color:ME.color, photo:ME.photo, me:true });
      return P(all.sort((a,b) => b.points - a.points));
    },

    // ---- matches ----
    myMatches() { return P(MATCHES.map(m => ({ ...m }))); },
    getMatch(id) { return P(MATCHES.find(m => m.id === id)); },
    respinsLeft() {
      const d = new Date().toISOString().slice(0,10);
      if (RESPINS.date !== d) RESPINS = { date:d, used:0 };
      return P(Math.max(0, 2 - RESPINS.used));
    },
    useRespin() { const d = new Date().toISOString().slice(0,10); if (RESPINS.date !== d) RESPINS = { date:d, used:0 }; RESPINS.used++; return P(true); },
    createMatch(other, type, questions) {
      const m = { id:"m"+(mid++), a:"me", b:other.uid, person:other, status:"requested", type, questionIds:questions.map(q=>q.id||q.t), questions, answers:["","",""], photo:false, messages:[], createdAt:now() };
      MATCHES.push(m);
      // DEMO: simulate the other person accepting shortly after
      setTimeout(() => {
        const mm = MATCHES.find(x => x.id === m.id);
        if (mm && mm.status === "requested") { mm.status = "active"; this._notify({ type:"accept", icon:"check", text:other.name+" accepted your match! Open the shared space to coordinate.", target:"meet:"+mm.id }); if (this._change) this._change(); }
      }, 1600);
      return P(m.id);
    },
    acceptMatch(id) { const m = MATCHES.find(x=>x.id===id); if (m) m.status = "active"; return P(true); },
    declineMatch(id) { MATCHES = MATCHES.filter(x=>x.id!==id); return P(true); },
    sendMessage(id, text) {
      const m = MATCHES.find(x=>x.id===id); if (!m) return P(false);
      m.messages.push({ by:"me", text, at:now() });
      // DEMO: canned reply
      setTimeout(() => {
        const r = ["Sounds good! Tomorrow 10:30 by the coffee machine?","Perfect, see you then!","Great — looking forward to it."];
        m.messages.push({ by:"them", text:r[Math.floor(Math.random()*r.length)], at:now() });
        if (this._viewing !== "thread:"+id) m.unread = (m.unread||0)+1;
        this._notify({ type:"msg", icon:"chat", text:m.person.name+" replied to your message", target:"thread:"+id });
        if (this._change) this._change();
      }, 1400);
      return P(true);
    },
    setMatchPhoto(id, photo) { const m = MATCHES.find(x=>x.id===id); if (m) m.photo = photo || true; return P(true); },
    setMatchAnswers(id, answers) { const m = MATCHES.find(x=>x.id===id); if (m) m.answers = answers; return P(true); },
    completeMatch(id, post) {
      const m = MATCHES.find(x=>x.id===id); if (!m) return P(false);
      m.status = "completed";
      if (ME) ME.points += 10;
      const u = USERS.find(x=>x.uid===m.person.uid); if (u) u.points += 10;
      m.questions.forEach(q => { const b = QUESTIONS.find(x => x.text === (q.t||q.text)); if (b) b.count++; });
      m.completedAt = now();  // keep the match (status=completed) for history + no-repeat matching
      POSTS.unshift({ id:"p"+(wid++), seed:false, names:post.names, scene:post.scene, photo:post.photo||null, hearts:0, liked:false, comments:[] });
      return P(true);
    },

    // ---- wall ----
    listPosts() { return P(POSTS.map(p => ({ ...p }))); },
    heartPost(id) { const w = POSTS.find(x=>x.id===id); if (w) { w.liked = !w.liked; w.hearts += w.liked ? 1 : -1; } return P(true); },
    commentPost(id, text) { const w = POSTS.find(x=>x.id===id); if (w) w.comments.push({ by:ME ? ME.name : "You", text }); return P(true); },

    // ---- notifications ----
    listNotifs() { return P(NOTIFS.map(n => ({ ...n }))); },
    _notify(o) { NOTIFS.unshift(Object.assign({ id:"n"+(nid++), read:false, at:now() }, o)); },
    markNotifsRead() { NOTIFS.forEach(n => n.read = true); return P(true); },
    markNotifRead(id) { const n = NOTIFS.find(x=>String(x.id)===String(id)); if (n) n.read = true; return P(true); },
    welcome() { this._notify({ type:"welcome", icon:"users", text:"Welcome to ZB MeetUP! Tap Spin to find your first match.", target:"spin" }); return P(true); },

    // ---- questions / admin ----
    questionBank() { return P(QUESTIONS.map(q => ({ ...q }))); },
    addQuestion(text) { QUESTIONS.push({ id:"q"+(QUESTIONS.length+1), text, tier:2, count:0 }); return P(true); },
    listBugs() { return P((this._bugs||[]).slice()); },
    sendBug(text) { this._bugs = this._bugs || []; this._bugs.unshift({ by:ME ? ME.name : "You", text, at:new Date().toLocaleDateString() }); return P(true); },
    unreadMatches() { return P(MATCHES.filter(m => m.unread).reduce((s,m)=>s+m.unread,0)); },
    clearMatchUnread(id) { const m = MATCHES.find(x=>x.id===id); if (m) m.unread = 0; return P(true); },
    clearNotifs() { NOTIFS.forEach(n => n.read = true); return P(true); },
    deleteAccount() { return this.signOut(); },

    // app registers callbacks so async demo events (accept/reply) can trigger a re-render
    onChange(cb) { this._change = cb; },
    setViewing(v) { this._viewing = v; },
  };

  window.ZB_STORE = ZB_STORE;
})();
