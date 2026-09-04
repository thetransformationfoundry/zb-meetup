/* ZB MeetUP — demo-path smoke test.
   Loads firebase-config.js + store.js + app.js in Node with a stub DOM and walks the
   whole flow. Run from the repo root:  node tools/test-demo.js
   Exit 0 = green, 1 = a check failed / threw. (The LIVE Firestore path can't run here —
   verify that in the browser after deploy.) */
const fs = require("fs");

function El(){return new Proxy({_html:"",_txt:"",value:"",checked:true,disabled:false,style:{},files:[],
  classList:{add(){},remove(){},toggle(){}},remove(){},click(){},appendChild(){},
  getContext(){return {drawImage(){}};},toDataURL(){return "data:image/jpeg;base64,X";}},{
  get(t,k){if(k==="innerHTML")return t._html;if(k==="textContent")return t._txt;if(k in t)return t[k];return function(){};},
  set(t,k,v){if(k==="innerHTML")t._html=v;else if(k==="textContent")t._txt=v;else t[k]=v;return true;}});}
const store = {};
const document = { querySelector:s=>store[s]||(store[s]=El()), getElementById:id=>store["#"+id]||(store["#"+id]=El()),
  createElement:()=>El(), body:{appendChild(){}} };
const window = new Proxy({}, { set(t,k,v){t[k]=v;global[k]=v;return true;}, get(t,k){return t[k];} });
global.document = document; global.window = window;
let depth = 0;
global.setTimeout = fn => { if (depth++ > 9000) return 0; fn(); return 0; };
global.setInterval = undefined; global.clearInterval = ()=>{}; global.clearTimeout = ()=>{};

function load(f){ new Function("window","document", fs.readFileSync(f,"utf8"))(window, document); }
load("js/firebase-config.js");
window.ZB_LIVE = false;              // force the demo store for the test
load("js/store.js");
load("js/app.js");

const scr = () => document.querySelector("#screen").innerHTML;
const bar = () => document.querySelector("#appbar").innerHTML;
let ok = true;
const chk = (label, cond) => { console.log((cond?"✓":"✗")+" "+label); if(!cond) ok=false; };

(async () => {
  window.ZB_BOOT(); await new Promise(r=>setTimeout(r,0));
  chk("boots to welcome", /Matched for a coffee/.test(scr()));
  window.obGoCreate();
  document.getElementById("ob-email").value = "test@zimmerbiomet.com";
  document.getElementById("ob-pass").value = "demo1234"; window.obCreate();
  document.getElementById("ob-name").value = "Test User"; window.obName();
  document.getElementById("ob-wc").value = "partial"; window.obWork();
  window.obStep(4); document.getElementById("ob-consent").checked = true;
  await window.finishOnboard();
  chk("enters app on Spin", /TODAY.S MATCH/.test(scr()));
  await window.doSpin(); chk("spins a match", /Send request/.test(scr()));
  await window.sendReq(); await new Promise(r=>setTimeout(r,0));
  const id = (await window.ZB_STORE.myMatches())[0].id;
  window.go("meet:"+id);
  await window.addPhoto(id);
  await window.ans(id,0,"a"); await window.ans(id,1,"b"); await window.ans(id,2,"c");
  await window.complete(id);
  chk("completes meetup (+10 pts)", /10 pts/.test(bar()));
  window.go("wall");  chk("wall renders + real post", /Community wall/.test(scr()) && /Test User & /.test(scr()));
  window.go("ranks"); chk("leaderboard + prizes", /CB management judges/.test(scr()));
  window.go("profile"); chk("profile", /Manage your profile/.test(scr()));
  window.go("admin"); chk("admin dashboard", /Admin dashboard/.test(scr()));
  console.log(ok ? "\nDEMO PATH GREEN ✅" : "\nDEMO PATH FAILED ❌");
  process.exit(ok ? 0 : 1);
})().catch(e => { console.log("ERROR:", e.message); process.exit(1); });
