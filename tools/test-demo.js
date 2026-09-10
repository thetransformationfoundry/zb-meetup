/* ZB MeetUP — demo-path smoke test.
   Loads firebase-config.js + store.js + app.js in Node with a stub DOM and walks the
   whole flow. Run from the repo root:  node tools/test-demo.js
   Exit 0 = green, 1 = a check failed / threw. (The LIVE Firestore path can't run here —
   verify that in the browser after deploy.) */
const fs = require("fs");

function El(){return new Proxy({_html:"",_txt:"",value:"",checked:true,disabled:false,style:{},files:[],
  classList:{add(){},remove(){},toggle(){}},remove(){},appendChild(){},
  click(){ if(this.onchange){ this.files=[{name:"meetup.jpg",type:"image/jpeg"}]; this.onchange(); } },
  getContext(){return {drawImage(){}};},toDataURL(){return "data:image/jpeg;base64,X";}},{
  get(t,k){if(k==="innerHTML")return t._html;if(k==="textContent")return t._txt;if(k in t)return t[k];return function(){};},
  set(t,k,v){if(k==="innerHTML")t._html=v;else if(k==="textContent")t._txt=v;else t[k]=v;
    if(k==="width")global.__canvasPx=v;   // pickImage() sizes its canvas to the capture edge
    return true;}});}
const store = {};
const document = { querySelector:s=>store[s]||(store[s]=El()), getElementById:id=>store["#"+id]||(store["#"+id]=El()),
  createElement:()=>El(), body:{appendChild(){}},
  // app.js derives the version it is RUNNING from its own script src
  currentScript:{ src:"js/app.js?v=15" } };
// version.json over fetch = what is DEPLOYED. Off until a test turns it on.
// export path: Blob + URL.createObjectURL + <a download>
global.confirm = () => true;
// ?preview=1 stores a flag in localStorage; the app reads it through try/catch.
const _ls = {};
global.localStorage = { getItem:k=>(k in _ls?_ls[k]:null), setItem:(k,v)=>{_ls[k]=String(v);}, removeItem:k=>{delete _ls[k];} };
const REAL_NOW = Date.now;
const setNow = t => { Date.now = () => t; };
const realNow = () => { Date.now = REAL_NOW; };          // question delete asks for confirmation
global.__lastDownload = null;
global.Blob = function(parts){ this.parts = parts; this._text = (parts||[]).join(""); };
global.URL = { createObjectURL(b){ global.__lastDownload = { text:b._text }; return "blob:zb"; }, revokeObjectURL(){} };
global.__buildOk = false;
global.__buildJson = null;
global.fetch = async () => ({ ok: global.__buildOk, json: async () => global.__buildJson });
const tick = async n => { for (let i = 0; i < (n||4); i++) await Promise.resolve(); };
const window = new Proxy({}, { set(t,k,v){t[k]=v;global[k]=v;return true;}, get(t,k){return t[k];} });
global.document = document; global.window = window;
// pickImage(): FileReader -> Image -> canvas.toDataURL. Synchronous stubs.
global.FileReader = function(){ this.readAsDataURL = () => { this.result = "data:image/jpeg;base64,SRC"; this.onload && this.onload(); }; };
// A realistic phone photo by default; __imgPx lets a test shrink the source to exercise
// pickImage()'s never-upscale guard.
global.__imgPx = 1500;
global.Image = function(){ const self = this; this.width = global.__imgPx + 500; this.height = global.__imgPx;
  Object.defineProperty(this, "src", { set(){ self.onload && self.onload(); } }); };
let depth = 0;
global.setTimeout = fn => { if (depth++ > 9000) return 0; fn(); return 0; };
global.setInterval = undefined; global.clearInterval = ()=>{}; global.clearTimeout = ()=>{};

// app.js is wrapped in an IIFE, so test exports have to be injected INSIDE it (before the
// closing `})();`) rather than appended, or they can't see its internals.
function load(f, inject){
  let src = fs.readFileSync(f, "utf8");
  if (inject) {
    const i = src.lastIndexOf("})();");
    src = i === -1 ? src + inject : src.slice(0, i) + inject + "\n" + src.slice(i);
  }
  new Function("window", "document", src)(window, document);
}
load("js/firebase-config.js");
window.ZB_LIVE = false;              // force the demo store for the test
load("js/store.js");
// Export the real internals for assertions instead of adding window.* hooks to production code.
load("js/app.js", "\n;window.__eligible=eligible;window.__normalizeRole=normalizeRole;window.__ROLES=ROLES;window.__pickQuestions=pickQuestions;window.__spinLocked=()=>spinLocked();window.__unlock=SPIN_UNLOCK;");

const scr = () => document.querySelector("#screen").innerHTML;
const bar = () => document.querySelector("#appbar").innerHTML;
let ok = true;
const chk = (label, cond) => { console.log((cond?"✓":"✗")+" "+label); if(!cond) ok=false; };

// refresh() isn't exposed, and it fires loadBuild() without awaiting it — so drive a refresh
// through a real action and let the microtasks settle.
const refreshAndSettle = async () => { await window.clearNotifs(); await tick(6); };

(async () => {
  window.ZB_BOOT(); await new Promise(r=>setTimeout(r,0));
  chk("boots to welcome", /Matched for a coffee/.test(scr()));

  // returning users get a real sign-in screen, not the create-account step
  window.obGoSignIn();
  const si = scr();
  chk("sign-in screen renders", /Welcome back/.test(si) && /ob-email/.test(si) && /ob-pass/.test(si)
      && /Sign in<\/button>|>Sign in</.test(si) && /Forgot password\?/.test(si) && /Create an account instead/.test(si));
  chk("sign-in is not the create step", !/Create account<\/button>/.test(si));
  // forgot password -> the "check your email (and junk)" confirmation screen
  document.getElementById("ob-email").value = "test@zimmerbiomet.com";
  await window.obForgot();
  const rs = scr();
  chk("forgot password lands on the check-your-email screen",
      /Check your email/.test(rs) && /junk/i.test(rs) && /test@zimmerbiomet\.com/.test(rs)
      && /obGoSignIn\(\)/.test(rs) && /Send the email again/.test(rs));
  window.obGoSignIn(); chk("sign-in reachable from that screen", /Welcome back/.test(scr()));

  window.obBackWelcome(); chk("back to welcome from sign-in", /Matched for a coffee/.test(scr()));

  // only the two org domains may create an account
  window.obGoCreate();
  document.getElementById("ob-email").value = "someone@gmail.com";
  document.getElementById("ob-pass").value = "demo1234";
  window.obCreate();
  chk("off-domain email is blocked at create", /Work email/.test(scr()) && !/What's your name/.test(scr()));
  let rejected = false;
  try { await window.ZB_STORE.signUp("someone@gmail.com", "demo1234"); }
  catch (e) { rejected = /domain-not-allowed/.test((e && e.code) || ""); }
  chk("the store refuses an off-domain sign-up", rejected);
  chk("allowed domains come from one constant",
      Array.isArray(window.ZB_CONFIG.ALLOWED_DOMAINS)
      && window.ZB_DOMAIN_OK("A.Person@ZimmerBiomet.com") === true
      && window.ZB_DOMAIN_OK("x@thetransformationfoundry.nl") === true
      && window.ZB_DOMAIN_OK("x@notzimmerbiomet.com") === false
      && window.ZB_DOMAIN_OK("x@zimmerbiomet.com.evil.tld") === false
      && window.ZB_DOMAIN_OK("nodomain") === false);

  chk("create step's sign-in link goes to the sign-in screen", /obGoSignIn\(\)/.test(scr()) && !/onclick="obSignIn\(\)"/.test(scr()));
  // onboard as an ADMIN address (allowed domain) so BRIEF-007's idea bank is exercised
  document.getElementById("ob-email").value = "sean.abbood@thetransformationfoundry.nl";
  document.getElementById("ob-pass").value = "demo1234"; window.obCreate();
  document.getElementById("ob-name").value = "Test User"; window.obName();
  document.getElementById("ob-wc").value = "partial";
  document.getElementById("ob-role").value = "";           // the 108-option list has no default
  window.obWork();
  chk("role is required before continuing", /Your role/.test(scr()));
  document.getElementById("ob-role").value = "GSCC IT Sr Analyst"; window.obWork();
  window.obPickPhoto();
  chk("avatar captures at 256px", global.__canvasPx === 256);
  window.obStep(4); document.getElementById("ob-consent").checked = true;
  await window.finishOnboard();
  // onboarding now ends on the Points Awarded screen (BRIEF-017 / Claude Design handoff)
  const award = scr();
  chk("lands on the Points Awarded screen", /YOU'RE ALL SET/.test(award)
      && /Nice work, Test,/.test(award)                     // firstName injected
      && /30 points/.test(award) && /awarded to you!/.test(award)
      && /Balance: 30 points/.test(award)
      && /Take me to Spin/.test(award) && /Celebrate again/.test(award));
  chk("award screen renders without a real canvas", /<canvas id="cfCanvas">/.test(award));
  window.zbCelebrate();                                     // must be a no-op, not a throw
  await window.awardToSpin();
  chk("enters app on Spin", /TODAY.S MATCH/.test(scr()));
  /* ---- BRIEF-017: spin points economy ---- */
  chk("signup grants the 30-point bonus", (await window.ZB_STORE.getMe()).points === 30);
  chk("the bonus is not granted twice", (await window.ZB_STORE.claimSignupBonus()) === false
      && (await window.ZB_STORE.getMe()).points === 30);
  chk("first spin of the day is free", (await window.ZB_STORE.spinState()).freeSpin === true);
  await window.doSpin(); chk("spins a match", /Send request/.test(scr()));
  chk("the free spin cost nothing", (await window.ZB_STORE.getMe()).points === 30
      && (await window.ZB_STORE.spinState()).freeSpin === false);
  await window.doSpin();
  chk("a respin costs 1 point", (await window.ZB_STORE.getMe()).points === 29);
  await window.doSpin();
  chk("each further respin costs 1 more", (await window.ZB_STORE.getMe()).points === 28);
  chk("the reroll button shows its cost", /Spin again \(−1 pt\)/.test(scr()));

  // drain to zero and confirm the block, and that points never go negative
  for (let i = 0; i < 40; i++) await window.doSpin();
  const drained = await window.ZB_STORE.getMe();
  chk("points floor at 0, never negative", drained.points === 0);
  const blocked = await window.ZB_STORE.paySpin();
  chk("respin is blocked at 0 points", blocked.ok === false && blocked.points === 0);
  window.go("spin");
  chk("spin screen explains being out of points", /out of points/.test(scr()));

  // sending a request grants the next spin free
  await window.ZB_STORE.saveMe({ points: 5 });
  await window.doSpin();               // costs 1 -> 4
  await window.sendReq(); await new Promise(r=>setTimeout(r,0));
  chk("sending a request grants a free next spin", (await window.ZB_STORE.spinState()).freeSpin === true);
  chk("Skip is gone from the spin screen", !/onclick="skip\(\)"/.test(scr()));
  const id = (await window.ZB_STORE.myMatches())[0].id;
  window.go("meet:"+id);

  // messaging + the bell: a message must produce a notif that deep-links to the thread
  window.go("thread:"+id);
  document.getElementById("msgIn").value = "Coffee at 10:30?";
  await window.sendMsg(id);
  const msgN = (await window.ZB_STORE.listNotifs()).find(n => n.type === "msg");
  chk("a message produces a bell notification", !!msgN && msgN.target === "thread:" + id);
  window.go("notifs");
  chk("bell list renders notifications", /Notifications/.test(scr()) && /replied to your message/.test(scr()));
  await window.openNotif(msgN.id);
  chk("notification deep-links to the chat thread", /Back to meetup/.test(scr()));
  window.go("meet:"+id);
  const other = (await window.ZB_STORE.myMatches()).find(x => x.id === id).person;
  const ptsOf = async name => { const r = (await window.ZB_STORE.leaderboard()).find(x => x.name === name); return r ? r.points : null; };
  const mePts0 = await ptsOf("Test User"), otherPts0 = await ptsOf(other.name);

  await window.addPhoto(id);
  const withPhoto = (await window.ZB_STORE.myMatches()).find(x => x.id === id);
  chk("meetup photo stored as a base64 string", typeof withPhoto.photo === "string" && /^data:image\//.test(withPhoto.photo));
  chk("meetup photo captures at 960px, not 256", global.__canvasPx === 960);
  global.__imgPx = 300;                       // a low-res source must not be upscaled
  await window.addPhoto(id);
  chk("a small original is not upscaled", global.__canvasPx === 300);
  global.__imgPx = 1500;
  await window.addPhoto(id);
  chk("shared photo awards +5 to BOTH", (await ptsOf("Test User")) === mePts0 + 5 && (await ptsOf(other.name)) === otherPts0 + 5);

  await window.addPhoto(id);   // replacing the photo must not re-award
  chk("re-adding the photo does not re-award", (await ptsOf("Test User")) === mePts0 + 5 && (await ptsOf(other.name)) === otherPts0 + 5);
  await window.ans(id,0,"a"); await window.ans(id,1,"b"); await window.ans(id,2,"c");
  await window.complete(id);
  chk("appbar shows the new total after +10", bar().indexOf((mePts0 + 10) + " pts") > -1);
  chk("my questions award only me", (await ptsOf("Test User")) === mePts0 + 10);
  chk("the other participant's points do not move", (await ptsOf(other.name)) === otherPts0 + 5);
  const mine = (await window.ZB_STORE.myMatches()).find(x => x.id === id);
  chk("completion is per-user", mine.completed === true && mine.otherCompleted === false);
  chk("completing twice awards nothing more", (await window.ZB_STORE.completeMatch(id, {names:"x",scene:"coffee",photo:null})) === false
      && (await ptsOf("Test User")) === mePts0 + 10);
  window.go("wall");  chk("wall renders + real post", /Community wall/.test(scr()) && /Test User & /.test(scr()));
  const real = (await window.ZB_STORE.listPosts()).filter(p => !p.seed);
  chk("one wall post, carrying the real photo", real.length === 1 && /^data:image\//.test(real[0].photo || ""));
  // a photo arriving after completion must still reach the one wall post
  const before = (await window.ZB_STORE.listPosts()).filter(p => !p.seed).length;
  await window.ZB_STORE.setMatchPhoto(id, "data:image/jpeg;base64,LATE", {names:"Test User & X",scene:"coffee"});
  const after = (await window.ZB_STORE.listPosts()).filter(p => !p.seed);
  chk("late photo updates the existing post, no duplicate",
      after.length === before && after[0].photo === "data:image/jpeg;base64,LATE");

  window.go("meetups"); chk("shows under Completed", /Completed/.test(scr()) && /\+10 pts/.test(scr()));
  window.go("recap:"+id); chk("recap shows my answers, not theirs", /Your answers/.test(scr()) && /Not answered/.test(scr()) === false);
  window.go("ranks"); chk("leaderboard + prizes", /CB management judges/.test(scr()));
  window.go("profile");
  const prof = scr();
  chk("profile", /Manage your profile/.test(prof));
  // the build stamp must render (and degrade gracefully) with no fetch and no version.json
  chk("build stamp falls back with no version.json", /Check for update/.test(prof) && /dev|v\d+/.test(prof));
  chk("no false 'update available' without a stamp", !/Update available/.test(prof));
  chk("stamp shows the running version from its own ?v=", /v15/.test(prof));

  // now a newer version is deployed while this device still runs v15
  global.__buildOk = true;
  global.__buildJson = { version:"16", sha:"abc1234", date:"2026-09-09" };
  await refreshAndSettle();
  window.go("profile");
  chk("a newer deployed version is reported as stale",
      /Update available/.test(scr()) && /abc1234/.test(scr()) && /remove the icon/.test(scr()));
  window.go("admin"); chk("admin dashboard", /Admin dashboard/.test(scr()));

  /* ---- BRIEF-007: the idea bank + export ---- */
  chk("runs as an admin", (await window.ZB_STORE.isAdmin()) === true);
  const agg = await window.ZB_STORE.adminAnswers();
  chk("answers aggregate across matches", agg.totalAnswers === 3 && agg.questions.length === 3
      && agg.questions.every(q => q.count === 1 && q.answers[0].text.length > 0));

  await refreshAndSettle();
  window.go("admin"); await tick(8); window.go("admin");
  const dash = scr();
  chk("dashboard shows real counts, not zero", /The idea bank/.test(dash) && /3 answers/.test(dash));

  const q0 = agg.questions[0];
  window.adminToggleQ(q0.id);
  chk("a question expands to show its answers", scr().includes(q0.answers[0].text));
  window.adminToggleAnon();
  chk("anonymise hides who answered", /anonymised/.test(scr()));
  window.adminToggleAnon();

  window.exportData();
  const csv = (global.__lastDownload || {}).text || "";
  chk("export produces real CSV rows",
      csv.indexOf('"Question","Tier","Answer"') > -1 && csv.split("\r\n").length === 4);

  // security property: a non-admin gets nothing
  window.ZB_STORE._email = "someone.else@zimmerbiomet.com";
  let denied = false;
  try { await window.ZB_STORE.adminAnswers(); } catch (e) { denied = (e && e.code) === "zb/not-admin"; }
  chk("a non-admin cannot read the answers", denied && (await window.ZB_STORE.isAdmin()) === false);
  window.ZB_STORE._email = "sean.abbood@thetransformationfoundry.nl";

  /* ---- BRIEF-019: go-live spin lock ---- */
  const UNLOCK = window.__unlock.getTime();
  chk("SPIN_UNLOCK is 2026-09-16 07:00Z (09:00 Amsterdam)",
      window.__unlock.toISOString() === "2026-09-16T07:00:00.000Z");

  setNow(UNLOCK - 3 * 86400000);          // three days before launch
  // a normal colleague is locked out and sees the countdown
  window.ZB_STORE._email = "someone.else@zimmerbiomet.com";
  await refreshAndSettle();
  chk("a non-admin is locked before unlock", window.__spinLocked() === true);
  window.go("spin");
  const cd = scr();
  chk("countdown screen renders", /COUNTDOWN TO LAUNCH/.test(cd) && /Get ready to spin/.test(cd)
      && /id="cdD"/.test(cd) && /id="cdS"/.test(cd) && /How it works/.test(cd));
  chk("countdown shows 3 days remaining", /id="cdD">03</.test(cd));
  chk("the real spin screen is behind it, blurred", /class="behind"/.test(cd) && /TODAY.S MATCH/.test(cd));
  chk("no invented colleagues in the pills", !/Priya Raman|Anna Kessler|Mandy Hill|Jonas Ott/.test(cd));
  chk("the decorative layer is inert, so it can't be tabbed into", /class="behind"[^>]*inert/.test(cd));
  // the gate is on the ACTION too, not just the view
  const ptsBefore = (await window.ZB_STORE.getMe()).points;
  await window.doSpin();
  chk("doSpin is refused while locked", (await window.ZB_STORE.getMe()).points === ptsBefore);

  // How it works is reachable and comes back to Spin
  window.go("howitworks");
  chk("How it works opens in-app and returns to Spin", /go\('spin'\)/.test(scr()));

  // admins bypass so they can seed and test
  window.ZB_STORE._email = "sean.abbood@thetransformationfoundry.nl";
  await refreshAndSettle();
  chk("an admin bypasses the lock", window.__spinLocked() === false);
  window.go("spin"); chk("admin sees the real spin screen", /TODAY.S MATCH/.test(scr()) && !/COUNTDOWN TO LAUNCH/.test(scr()));

  // ?preview=1 forces the countdown for QA, even as an admin
  global.localStorage.setItem("zbPreviewCountdown", "1");
  chk("preview forces the countdown for an admin", window.__spinLocked() === true);
  window.go("spin"); chk("preview shows the countdown", /COUNTDOWN TO LAUNCH/.test(scr()));
  global.localStorage.removeItem("zbPreviewCountdown");

  // at and after the unlock instant the gate lifts with no redeploy
  setNow(UNLOCK);
  window.ZB_STORE._email = "someone.else@zimmerbiomet.com";
  await refreshAndSettle();
  chk("the lock lifts exactly at the unlock instant", window.__spinLocked() === false);
  setNow(UNLOCK + 60000);
  chk("still open after the unlock", window.__spinLocked() === false);
  window.go("spin"); chk("spin works after unlock", /TODAY.S MATCH/.test(scr()));
  realNow();
  window.ZB_STORE._email = "sean.abbood@thetransformationfoundry.nl";
  await refreshAndSettle();

  /* ---- BRIEF-008: editable question bank ---- */
  const bank = () => window.ZB_STORE.questionBank();
  const n0 = (await bank()).length;

  await window.ZB_STORE.addQuestion("A brand new question?", 2);
  let qs = await bank();
  chk("admin can add a question", qs.length === n0 + 1
      && qs.some(q => q.text === "A brand new question?" && q.tier === 2));

  const target = qs.find(q => q.text === "A brand new question?");
  await window.ZB_STORE.updateQuestion(target.id, { text:"An edited question?" });
  qs = await bank();
  chk("admin can edit the text", qs.some(q => q.id === target.id && q.text === "An edited question?")
      && !qs.some(q => q.text === "A brand new question?"));

  await window.ZB_STORE.updateQuestion(target.id, { tier:1 });
  qs = await bank();
  chk("admin can toggle the tier", qs.find(q => q.id === target.id).tier === 1);

  await window.ZB_STORE.deleteQuestion(target.id);
  qs = await bank();
  chk("admin can delete a question", qs.length === n0 && !qs.some(q => q.id === target.id));

  // the UI exposes all of it
  await window.reloadAdmin(); await tick(8); window.go("admin");
  const bankUI = scr();
  chk("bank UI offers edit, delete and tier controls",
      /qEdit\(/.test(bankUI) && /qDel\(/.test(bankUI) && /qTier\(/.test(bankUI));

  // tiering still drives pickQuestions, including when a tier is emptied
  const tier1 = (await bank()).filter(q => q.tier === 1);
  for (const q of tier1) await window.ZB_STORE.updateQuestion(q.id, { tier:2 });
  await refreshAndSettle();
  chk("an empty tier-1 still yields 3 questions", window.__pickQuestions().length === 3);
  for (const q of tier1) await window.ZB_STORE.updateQuestion(q.id, { tier:1 });
  await refreshAndSettle();
  chk("tiering restored", (await bank()).filter(q => q.tier === 1).length === tier1.length);

  // a non-admin cannot seed the bank
  window.ZB_STORE._email = "someone.else@zimmerbiomet.com";
  let seedDenied = false;
  try { await window.ZB_STORE.seedQuestionBank(); } catch (e) { seedDenied = (e && e.code) === "zb/not-admin"; }
  chk("a non-admin cannot seed the question bank", seedDenied);
  window.ZB_STORE._email = "sean.abbood@thetransformationfoundry.nl";

  // an edited question must not split the idea bank into two entries
  const answered = (await window.ZB_STORE.adminAnswers()).questions[0];
  await window.ZB_STORE.updateQuestion(answered.id, { text:"Reworded by the admin?" });
  const relabelled = await window.ZB_STORE.adminAnswers();
  const same = relabelled.questions.filter(q => q.id === answered.id);
  chk("editing a question relabels its answers, not duplicates them",
      same.length === 1 && same[0].text === "Reworded by the admin?"
      && same[0].count === answered.count);
  window.ZB_STORE._email = "sean.abbood@thetransformationfoundry.nl";

  /* ---- BRIEF-015: role list, migration, EMEA/GSCC matching ---- */
  const EMEA = "EMEA - QARA Commercial", QARA = "GSCC - QARA";
  chk("108 roles, both labels verbatim, Other last",
      window.__ROLES.length === 108 && window.__ROLES.includes(EMEA) && window.__ROLES.includes(QARA)
      && window.__ROLES[window.__ROLES.length - 1] === "Other"
      && !window.__ROLES.some(r => r.startsWith("GSCC GSCC")));
  chk("legacy roles normalise", window.__normalizeRole("QARA Manager") === QARA
      && window.__normalizeRole("Quality Specialist") === QARA
      && window.__normalizeRole("Warehouse Clerk") === "GSCC Warehouse Clerk"
      && window.__normalizeRole("NonEE Warehouse Clerk") === "GSCC Warehouse Clerk"
      && window.__normalizeRole("Nonsense Role") === "Other"
      && window.__normalizeRole(EMEA) === EMEA && window.__normalizeRole(QARA) === QARA);

  const rolesInPool = async patch => {
    await window.ZB_STORE.saveMe(patch);
    await refreshAndSettle();
    return window.__eligible().map(p => p.role);
  };

  // a normal GSCC colleague must never see EMEA
  let pool = await rolesInPool({ role:"GSCC IT Sr Analyst", workClass:"partial", floor:false });
  chk("GSCC non-QARA never sees EMEA", !pool.includes(EMEA) && pool.length > 0);

  // EMEA sees ONLY the QARA set
  pool = await rolesInPool({ role:EMEA, workClass:"remote", floor:false });
  chk("EMEA sees only itself + GSCC - QARA",
      pool.length > 0 && pool.every(r => r === EMEA || r === QARA) && pool.includes(QARA));

  // GSCC - QARA keeps the whole GSCC pool and gains EMEA
  pool = await rolesInPool({ role:QARA, workClass:"partial", floor:false });
  chk("GSCC - QARA sees all GSCC plus EMEA",
      pool.includes(EMEA) && pool.some(r => r.startsWith("GSCC ") && r !== QARA));

  // the migrated legacy user (seeded as "QARA Manager") is in the pool as GSCC - QARA
  chk("a legacy-role colleague is matchable after normalising",
      pool.filter(r => r === QARA).length >= 1);

  // floor rule untouched: on-site only, and never a fully-remote colleague
  const floorPool = (async () => {
    await window.ZB_STORE.saveMe({ role:"GSCC Warehouse Clerk", workClass:"on-site", floor:true });
    await refreshAndSettle();
    return window.__eligible();
  });
  const fp = await floorPool();
  chk("floor rule intact — on-site only, no remote",
      fp.length > 0 && fp.every(p => p.workClass === "on-site"));
  chk("floor colleague never sees EMEA (remote)", !fp.map(p => p.role).includes(EMEA));

  console.log(ok ? "\nDEMO PATH GREEN ✅" : "\nDEMO PATH FAILED ❌");
  process.exit(ok ? 0 : 1);
})().catch(e => { console.log("ERROR:", e.message); process.exit(1); });
