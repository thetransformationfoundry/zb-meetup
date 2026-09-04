/* ============================================================
   ZB MeetUP — app UI. Talks to window.ZB_STORE (demo or firebase).
   ============================================================ */
(function () {
"use strict";
const S = window.ZB_STORE, CFG = window.ZB_CONFIG;

/* ---------------- icons (Phosphor-style) ---------------- */
const P = {
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.4"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
  users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.4 19a5.6 5.6 0 0 1 11.2 0"/><path d="M15.5 5.2A2.8 2.8 0 0 1 17 10.6M16 13.4a5 5 0 0 1 4.6 5.6"/>',
  image:'<rect x="3" y="4.5" width="18" height="15" rx="2.6"/><circle cx="8.5" cy="10" r="1.7"/><path d="M4 17l4.6-4 3.4 3 3-2.6 5 4.6"/>',
  trophy:'<path d="M7 4.5h10V9a5 5 0 0 1-10 0V4.5Z"/><path d="M7 6.5H4.5v.8A3 3 0 0 0 7.4 10M17 6.5h2.5v.8A3 3 0 0 1 16.6 10"/><path d="M12 14v2.5M9 20h6M10.2 20l.5-3.5h2.6l.5 3.5"/>',
  user:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  bell:'<path d="M6 9.5a6 6 0 0 1 12 0c0 4.5 1.8 5.8 1.8 5.8H4.2S6 14 6 9.5Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  heart:'<path d="M12 20s-7-4.4-9.2-9A4.8 4.8 0 0 1 12 6.2 4.8 4.8 0 0 1 21.2 11C19 15.6 12 20 12 20Z"/>',
  chat:'<path d="M20.5 12a7.8 7.8 0 0 1-11.3 7L4 20.5l1.5-5.1A7.8 7.8 0 1 1 20.5 12Z"/>',
  camera:'<path d="M4 8.5h3L8.4 6.4h7.2L17 8.5h3v10.5H4V8.5Z"/><circle cx="12" cy="13.2" r="3.1"/>',
  refresh:'<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v4h-4"/>',
  send:'<path d="M4.5 12L20 5l-6.6 15-2.5-6.4L4.5 12Z"/>',
  trash:'<path d="M4.5 7h15M9 7V5h6v2M6.5 7l1 13h9l1-13"/>',
  bug:'<ellipse cx="12" cy="13.5" rx="5" ry="6"/><path d="M12 7.5V5M9 5.2l1.6 2.3M15 5.2l-1.6 2.3M7 12H4M7 16H4M17 12h3M17 16h3M12 8v11"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>', check:'<path d="M5 12.5l4.5 4.5L19 6.5"/>', plus:'<path d="M12 5v14M5 12h14"/>',
  signout:'<path d="M15 4.5h4.5v15H15M11 8l-4 4 4 4M7 12h9"/>', pencil:'<path d="M4 20h4L19.5 8.5l-4-4L4 16v4Z"/>',
  back:'<path d="M15 5l-7 7 7 7"/>', chart:'<path d="M4 20V4M4 20h16M8 20v-6M12 20V9M16 20v-9M20 20v-4"/>',
  download:'<path d="M12 4v11M8 11l4 4 4-4M5 20h14"/>'
};
function icon(name,size=22,filled=false){const f=filled?`fill="currentColor" stroke="none"`:`fill="none" stroke="currentColor" stroke-width="1.9"`;return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" ${f} stroke-linecap="round" stroke-linejoin="round">${P[name]||''}</svg>`;}
function spinnerIcon(size=22){return `<svg width="${size}" height="${size}" viewBox="0 0 256 256" fill="currentColor"><path d="M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm37.25,58.75a8,8,0,0,0,5.66-2.35l22.63-22.62a8,8,0,0,0-11.32-11.32L167.6,77.09a8,8,0,0,0,5.65,13.66ZM224,120H192a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm-45.09,47.6a8,8,0,0,0-11.31,11.31l22.62,22.63a8,8,0,0,0,11.32-11.32ZM128,184a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V192A8,8,0,0,0,128,184ZM77.09,167.6,54.46,190.22a8,8,0,0,0,11.32,11.32L88.4,178.91A8,8,0,0,0,77.09,167.6ZM72,128a8,8,0,0,0-8-8H32a8,8,0,0,0,0,16H64A8,8,0,0,0,72,128ZM65.78,54.46A8,8,0,0,0,54.46,65.78L77.09,88.4A8,8,0,0,0,88.4,77.09Z"></path></svg>`;}

/* ---------------- scenes (holding meetup images) ---------------- */
const SHADES=["rgba(255,255,255,.13)","rgba(255,255,255,.22)","rgba(255,255,255,.09)","rgba(255,255,255,.28)","rgba(255,255,255,.17)"];
const SCENES={walk:{chip:"A walk & talk",c1:"#1E9E5A",c2:"#0E7C5A"},lunch:{chip:"Lunch together",c1:"#E5731E",c2:"#C2557E"},digital:{chip:"A digital coffee",c1:"#2563EB",c2:"#7B4FA8"},coffee:{chip:"A coffee on site",c1:"#0079BD",c2:"#005f95"},litter:{chip:"A litter-pick walk",c1:"#0EA5A5",c2:"#1E9E5A"}};
const SCENE_ICONS={walk:'<circle cx="14" cy="4.6" r="1.7"/><path d="M13.4 8.2l-1.6 4.2 2.4 1.3 1.1 4.6M11.8 12.4l-2.2 2-1.6 3.4M13.8 13.2l3.1-.9"/>',lunch:'<path d="M8 3v7M6 3v4.5M10 3v4.5M8 10v11M15.5 3c-1.4 0-2.2 2.4-2.2 5.2s.8 4 2.2 4v8.8"/>',digital:'<rect x="3.5" y="5" width="17" height="11" rx="1.8"/><path d="M9 20h6M12 16v4"/><circle cx="12" cy="10.3" r="2.2"/>',coffee:'<path d="M5 9h11v3.6a4.5 4.5 0 0 1-9 0V9Z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2"/><path d="M6 20h11M8.5 5.5V4M11 5.5V4"/>',litter:'<path d="M5.5 8h13l-1 12h-11L5.5 8ZM4 8h16M9.5 8V5h5v3M10 11.5v6M14 11.5v6"/>'};
function slug(n){return (n||'').toLowerCase().replace(/\s*&\s*/g,'-and-').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function initialsPair(names){const p=(names||'').split(/\s*&\s*/);return ((p[0]||'?')[0]+(p[1]?p[1][0]:'')).toUpperCase();}
function typeToScene(t){t=(t||'').toLowerCase();if(t.includes('walk'))return 'walk';if(t.includes('lunch'))return 'lunch';if(t.includes('teams')||t.includes('virtual')||t.includes('call'))return 'digital';if(t.includes('litter'))return 'litter';return 'coffee';}
function sceneSquare(k,caption,photo){const s=SCENES[k]||SCENES.coffee;return `<div style="aspect-ratio:1;border-radius:8px;background:linear-gradient(135deg,${s.c1},${s.c2});display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;"><svg width="42%" height="42%" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${SCENE_ICONS[k]||SCENE_ICONS.coffee}</svg>${photo?`<img src="${photo}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">`:''}${caption?`<div style="position:absolute;left:0;right:0;bottom:0;padding:18px 10px 9px;background:linear-gradient(transparent,rgba(0,0,0,.5));font-size:11px;font-weight:800;color:#fff;z-index:2">${caption}</div>`:''}</div>`;}
function feedPosts(){const real=C.posts.filter(w=>!w.seed),seeds=C.posts.filter(w=>w.seed);return [...real,...seeds];}
function reelHTML(){
  let list=feedPosts(); while(list.length<6) list=list.concat(list); list=list.slice(0,8);
  const rots=["-6deg","3deg","-3deg","5deg","-4deg","2deg","4deg","-5deg"], arcs=["down","up","down","down","up","down","up","down"];
  const items=list.map((w,i)=>{const s=SCENES[w.scene]||SCENES.coffee;return `<div style="flex:none;position:relative;width:132px;height:340px;display:flex;align-items:center;justify-content:center;">${arcs[i%arcs.length]==='down'?`<div style="position:absolute;z-index:1;left:100px;top:226px;width:98px;height:46px;border-bottom:2px dashed rgba(255,255,255,.55);border-radius:0 0 46px 46px / 0 0 46px 46px;"></div>`:`<div style="position:absolute;z-index:1;left:100px;top:82px;width:98px;height:46px;border-top:2px dashed rgba(255,255,255,.55);border-radius:46px 46px 0 0 / 46px 46px 0 0;"></div>`}<div style="position:absolute;z-index:3;top:2px;left:${i%2?'-10px':'16px'};padding:9px 16px;border-radius:999px;background:${SHADES[i%SHADES.length]};border:1px solid rgba(255,255,255,.24);color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap;backdrop-filter:blur(4px);box-shadow:0 3px 8px rgba(10,20,40,.10);transform:rotate(${i%2?'7deg':'-5deg'});">${s.chip}</div><div style="position:relative;z-index:2;width:132px;background:#fff;border-radius:12px;padding:8px;box-shadow:0 10px 24px rgba(10,20,40,.26);transform:rotate(${rots[i%rots.length]});"><div style="display:flex;align-items:center;gap:6px;padding:0 1px 7px;"><div style="width:16px;height:16px;border-radius:999px;flex:none;background:${s.c1};"></div><div style="font-size:9px;font-weight:600;color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${w.names}</div></div>${sceneSquare(w.scene,'',w.photo)}<div style="display:flex;align-items:center;gap:10px;padding:7px 1px 0;color:#6B7280;font-size:9px;font-weight:600;"><span style="display:flex;align-items:center;gap:3px;">${icon('heart',9)}${w.hearts}</span><span style="display:flex;align-items:center;gap:3px;">${icon('chat',9)}${w.comments.length}</span></div></div></div>`;}).join('');
  return `<div style="position:relative;margin:0 -20px 30px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);transform:rotate(-6deg);"><div style="display:flex;width:max-content;align-items:center;gap:64px;padding:10px 8px;animation:reelDrift 42s linear infinite;">${items}${items}</div></div>`;
}

/* ---------------- helpers ---------------- */
const $=s=>document.querySelector(s);
const inits=s=>{const p=(s||'').trim().split(/\s+/);return ((p[0]?.[0]||'?')+(p[1]?.[0]||'')).toUpperCase();};
function av(p,cls=''){const bg=p.color||'#cfd8e3';const label=p.photo?'':inits(p.name||p.first||'?');return `<span class="avatar ${cls}" style="background:${bg}">${p.photo?`<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover" onerror="this.remove()">`:label}</span>`;}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2000);}
function wcLabel(w){return w==='on-site'?'On-site':w==='remote'?'Fully remote':'Partially remote';}
function mention(txt){return (txt||'').replace(/@([A-Za-z]+)/g,'<span class="ment">@$1</span>');}

/* ---------------- state ---------------- */
let C={me:null,users:[],matches:[],posts:[],notifs:[],questions:[],respins:2,admin:false,leaderboard:[],bugs:[]};
let view="spin", onboardStep=0, mode="onboarding", authBusy=false, current=null;
let OB={email:"",pass:"",name:"",color:"#0079BD",hasPhoto:false,workClass:"partial",floor:false,role:"IT Sr Analyst",dept:"IT - EMEA"};
const ROLES=["Warehouse Clerk","NonEE Warehouse Clerk","Rotating Kit Handling Assistant","Distribution Coordinator","Distribution Team Lead","Cust Experience Specialist","Clinical Sales Specialist","Sls Sr Representative","Quality Specialist","QARA Manager","IT Sr Analyst","Pricing Analyst","Field Svc Engineer","MedEd & Events Specialist","Inventory Optimization Principal","Facility Coordinator","Payroll Specialist","Other"];
const COLORS=["#0079BD","#1E9E5A","#E8B923","#D64545","#7A5AF8","#0EA5A5","#E5731E","#C026A3","#2563EB","#57606A"];
const IN_PERSON=["a coffee","a walk at lunch","a shared break","a litter-pick challenge"], REMOTE=["a Teams coffee call","a virtual catch-up"];

const activeMatches=()=>C.matches.filter(m=>m.status==='requested'||m.status==='active');
const history=()=>C.matches.filter(m=>m.status==='completed');
function eligible(){
  const matched=new Set(history().map(m=>m.person.uid)), busy=new Set(activeMatches().map(m=>m.person.uid));
  return C.users.filter(p=>{if(matched.has(p.uid)||busy.has(p.uid))return false;if(C.me.floor||p.floor)return C.me.workClass==='on-site'&&p.workClass==='on-site';return true;});
}
function meetupType(p){const list=(p.workClass==='remote'||C.me.workClass==='remote')?REMOTE:IN_PERSON;return list[Math.floor(Math.random()*list.length)];}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
function pickQuestions(){const first=history().length===0&&activeMatches().length===0;let ch;if(first)ch=C.questions.filter(q=>q.tier===1).slice(0,3);else{const t1=shuffle(C.questions.filter(q=>q.tier===1)),t2=shuffle(C.questions.filter(q=>q.tier===2));ch=[t1[0],t2[0],t2[1]].filter(Boolean);}return ch.map(q=>({id:q.id,t:q.text,tier:q.tier}));}
function isComplete(m){return m.photo&&m.answers.every(a=>(a||'').trim());}
function unread(){return C.notifs.filter(n=>!n.read).length;}

/* ---------------- data load ---------------- */
async function refresh(){
  const [me,users,matches,posts,notifs,questions,respins,admin,lb,bugs]=await Promise.all([
    S.getMe(),S.listUsers(),S.myMatches(),S.listPosts(),S.listNotifs(),S.questionBank(),S.respinsLeft(),S.isAdmin(),S.leaderboard(),S.listBugs()
  ]);
  C.me=me;C.users=users;C.matches=matches;C.posts=posts;C.notifs=notifs;C.questions=questions;C.respins=respins;C.admin=admin;C.leaderboard=lb;C.bugs=bugs;
  render();
}

/* ---------------- render / router ---------------- */
function render(){
  if(mode==="onboarding"){renderOnboard();return;}
  S.setViewing && S.setViewing(view);
  renderAppbar();renderTabs();
  const s=$("#screen");
  if(view==="spin")s.innerHTML=viewSpin();
  else if(view==="meetups")s.innerHTML=viewMeetups();
  else if(view==="messages")s.innerHTML=viewMessages();
  else if(view.startsWith("thread:"))s.innerHTML=viewThread(view.slice(7));
  else if(view.startsWith("meet:"))s.innerHTML=viewMeet(view.slice(5));
  else if(view==="wall")s.innerHTML=viewWall();
  else if(view==="ranks")s.innerHTML=viewRanks();
  else if(view==="profile")s.innerHTML=viewProfile();
  else if(view==="editprofile")s.innerHTML=viewEditProfile();
  else if(view==="bug")s.innerHTML=viewBug();
  else if(view==="admin")s.innerHTML=viewAdmin();
  else if(view==="notifs")s.innerHTML=viewNotifs();
  s.scrollTop=0;
}
window.go=v=>{view=v;render();};
function renderAppbar(){$("#appbar").innerHTML=`<div class="brand">ZB <span>MeetUP</span></div><div class="spacer"></div><div class="pts">${C.me?C.me.points:0} pts</div><button class="bell" onclick="go('notifs')">${icon('bell',24)}${unread()?`<span class="badge">${unread()}</span>`:''}</button>`;}
function renderTabs(){
  const reqB=activeMatches().filter(m=>(m.status==='active'&&!isComplete(m))||(m.status==='requested'&&m.incoming)).length;
  const tabs=[["spin","spinner","Spin"],["meetups","users","Meetups"],["wall","image","Wall"],["ranks","trophy","Ranks"],["profile","user","You"]];
  const root=(view.startsWith("meet:")||view.startsWith("thread:")||view==="messages")?"meetups":(view==="admin"||view==="editprofile"||view==="bug")?"profile":view;
  $("#tabbar").innerHTML=tabs.map(([id,ic,lb])=>{const b=id==='meetups'&&reqB?`<span class="badge" style="margin-left:4px">${reqB}</span>`:'';const ico=ic==='spinner'?spinnerIcon(21):icon(ic,22);return `<button class="${root===id?'active':''}" onclick="go('${id}')">${ico}<span>${lb}${b}</span></button>`;}).join("");
}

/* ---------------- onboarding ---------------- */
function renderOnboard(){
  $("#appbar").innerHTML=`<div class="brand" style="margin:0 auto">ZB <span>MeetUP</span></div>`;$("#tabbar").innerHTML="";
  const dots=`<div class="steps">${[0,1,2,3,4].map(i=>`<i class="${i<=onboardStep?'on':''}"></i>`).join('')}</div>`;
  let body="",cta="";
  if(onboardStep===0){
    body=`<div class="center" style="padding-top:10px"><div class="avatar lg" style="margin:0 auto 16px;background:var(--zb-blue)">${icon('users',54)}</div><h2>Welcome to ZB MeetUP</h2><p class="sub">Meet a new colleague each day — coffee, a walk, or a quick call. Let's get you set up.</p></div>
      <div class="card"><label class="small" style="font-weight:700">Work email</label><input class="input" id="ob-email" placeholder="you@zimmerbiomet.com" style="margin:6px 0 12px" value="${OB.email}"><label class="small" style="font-weight:700">Password</label><input class="input" id="ob-pass" type="password" placeholder="At least 6 characters" style="margin-top:6px"></div>`;
    cta=`<button class="btn" onclick="obCreate()">Create account</button><button class="btn ghost" style="margin-top:8px" onclick="obSignIn()">I already have an account — sign in</button><button class="btn ghost" style="margin-top:2px;font-size:14px" onclick="obForgot()">Forgot password?</button>`;
  } else if(onboardStep===1){
    body=`<h2>What's your name?</h2><p class="sub">This is how colleagues will see you.</p><div class="card"><input class="input" id="ob-name" placeholder="First and last name" value="${OB.name||''}"></div>`;
    cta=`<button class="btn" onclick="obName()">Continue</button>`;
  } else if(onboardStep===2){
    body=`<h2>Where do you work?</h2><p class="sub">This helps us match you with the right colleagues.</p><div class="card"><label class="small" style="font-weight:700">Work setup</label><select class="input" id="ob-wc" style="margin:6px 0 14px"><option value="warehouse">GSSC Warehouse — On-site (floor)</option><option value="on-site">On-site (office / desk)</option><option value="partial" selected>Partially remote</option><option value="remote">Fully remote</option></select><label class="small" style="font-weight:700">Your role</label><select class="input" id="ob-role" style="margin-top:6px">${ROLES.map(r=>`<option ${r==='IT Sr Analyst'?'selected':''}>${r}</option>`).join('')}</select></div>`;
    cta=`<button class="btn" onclick="obWork()">Continue</button><p class="muted small center" style="margin-top:10px">Warehouse/floor colleagues are matched only with on-site colleagues.</p>`;
  } else if(onboardStep===3){
    body=`<h2>Add a photo</h2><p class="sub">Or keep your initials — totally fine.</p><div class="center"><span class="avatar lg" style="margin:0 auto;background:${OB.color}">${inits(OB.name||'You')}</span></div><div class="card" style="margin-top:16px"><span class="small" style="font-weight:700">Pick an avatar colour</span><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px">${COLORS.map(c=>`<span onclick="obColor('${c}')" style="width:30px;height:30px;border-radius:50%;background:${c};cursor:pointer;border:${OB.color===c?'3px solid var(--ink)':'3px solid #fff'};box-shadow:0 0 0 1px var(--line)"></span>`).join('')}</div></div>`;
    cta=`<button class="btn" onclick="obStep(4)">Continue</button>`;
  } else {
    body=`<h2>One quick thing</h2><p class="sub">Your consent, so the app can work.</p><div class="card small" style="line-height:1.5">ZB MeetUP stores your profile, meetup <b>photos</b> and question <b>answers</b> so the app works. Meetup photos appear on the community wall; your answers stay <b>private</b> (visible only to admins). You can delete your account any time.</div><label class="row" style="gap:10px;cursor:pointer;margin-top:4px"><input type="checkbox" id="ob-consent" style="width:20px;height:20px"> <span class="small">I understand and consent (GDPR).</span></label>`;
    cta=`<button class="btn" onclick="finishOnboard()">Enter ZB MeetUP</button>`;
  }
  $("#screen").innerHTML=`<div class="ob"><div>${dots}${body}</div><div class="ob-cta">${cta}</div></div>`;
}
window.obStep=n=>{onboardStep=n;renderOnboard();};
window.obColor=c=>{OB.color=c;OB.hasPhoto=false;renderOnboard();};
window.obCreate=function(){const e=$("#ob-email").value.trim(),p=$("#ob-pass").value;if(!e){toast("Please enter your email");return;}if((p||'').length<6){toast("Password must be at least 6 characters");return;}OB.email=e;OB.pass=p;onboardStep=1;renderOnboard();};
window.obSignIn=async function(){const e=$("#ob-email").value.trim(),p=$("#ob-pass").value;if(!e||!p){toast("Enter your email and password");return;}try{await S.signIn(e,p);}catch(err){toast("Sign-in failed — check your details or tap Create account.");}};
window.obForgot=async function(){const e=$("#ob-email").value.trim();if(!e){toast("Enter your email first");return;}try{await S.resetPassword(e);toast("If an account exists, we've sent a reset link.");}catch(err){toast("Couldn't send reset — check the email.");}};
window.obName=function(){const n=$("#ob-name").value.trim();if(!n){toast("Please enter your name");return;}OB.name=n;onboardStep=2;renderOnboard();};
window.obWork=function(){const wc=$("#ob-wc").value,role=$("#ob-role").value;OB.role=role;if(wc==='warehouse'){OB.workClass='on-site';OB.floor=true;OB.dept='Distribution';}else{OB.workClass=wc;OB.floor=false;OB.dept=deptForRole(role);}onboardStep=3;renderOnboard();};
function deptForRole(r){if(/warehouse|kit|distribution/i.test(r))return 'Distribution';if(/sales|clinical/i.test(r))return 'Sales';if(/quality|qara/i.test(r))return 'Quality & Reg Affairs';if(/IT/i.test(r))return 'IT - EMEA';if(/experience/i.test(r))return 'Customer Experience';if(/pricing/i.test(r))return 'Pricing & Tenders';return 'Zimmer Biomet';}
window.finishOnboard=async function(){
  if(!$("#ob-consent").checked){toast("Please tick consent to continue");return;}
  authBusy=true;
  try{ if(!S.currentUser()) await S.signUp(OB.email,OB.pass); }
  catch(err){ authBusy=false; toast(err&&/in-use/.test(err.code||'')?"That email already has an account — tap sign in.":"Couldn't create the account."); return; }
  await S.saveMe({name:OB.name,email:OB.email,color:OB.color,photo:OB.hasPhoto?OB.color:null,workClass:OB.workClass,floor:OB.floor,role:OB.role,dept:OB.dept,consentAt:Date.now()});
  await S.welcome();
  authBusy=false; mode="app"; view="spin"; await refresh();
};

/* ---------------- SPIN ---------------- */
const DARKBTN="linear-gradient(100deg,#04070D 0%,#0A1421 26%,#123156 55%,#1E63A8 82%,#2E86D6 100%)";
const SHEEN=`<span style="position:absolute;top:-40%;bottom:-40%;left:0;width:46%;background:radial-gradient(closest-side,rgba(78,180,255,.34),rgba(78,180,255,0) 70%);filter:blur(6px);animation:sheen 5.2s ease-in-out infinite;pointer-events:none;"></span>`;
function viewSpin(){
  const idle=!current;
  const rule=C.me.floor?"You're a warehouse/floor colleague, so you'll match with other on-site colleagues.":"You're desk-based, so you can match with on-site and remote colleagues.";
  const faceInner=idle?`<span style="display:inline-flex;animation:ringSpin 3.6s linear infinite">${spinnerIcon(54)}</span>`:inits(current.name);
  const faceBg=idle?"#3E6EA8":current.color;
  return `<div style="display:flex;flex-direction:column;min-height:calc(100vh - 150px)">
    <div style="text-align:center;font-size:11.5px;font-weight:700;letter-spacing:1.6px;color:#7C8798;">TODAY'S MATCH</div>
    <div style="text-align:center;font-size:26px;line-height:1.2;font-weight:700;letter-spacing:-.5px;margin-top:8px;">${idle?'Spin to meet someone new':'You matched!'}</div>
    <div style="display:flex;justify-content:center;margin:22px 0 -86px;position:relative;z-index:5;"><div style="position:relative;width:172px;height:172px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;inset:0;border-radius:999px;border:2px dashed #A9C6DC;animation:ringSpin 26s linear infinite;"></div><div id="spinFace" style="width:112px;height:112px;border-radius:999px;border:3px solid #F5F7FA;box-shadow:0 6px 20px rgba(16,24,40,.18);display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:700;color:#fff;background-color:${faceBg};">${faceInner}</div></div></div>
    <div style="position:relative;overflow:hidden;flex:1;display:flex;flex-direction:column;border-radius:20px;padding:100px 20px 18px;background:linear-gradient(170deg,#3E6EA8 0%,#2F5F9E 42%,#20416F 100%);box-shadow:var(--shadow-lg);color:#fff;min-height:520px;">
      ${idle?`<div style="text-align:center;font-size:14.5px;line-height:1.5;color:rgba(255,255,255,.82);margin:0 auto;max-width:300px;">Tap the button below and we'll find you a colleague to grab a coffee or a call with.</div>`:`<div style="margin-top:18px;background:#fff;color:var(--ink);border-radius:16px;padding:16px;box-shadow:0 8px 30px rgba(16,24,40,.18);animation:popIn .34s cubic-bezier(.2,.9,.3,1.2) both;"><div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;flex:none;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;background:${current.color};">${inits(current.name)}</div><div style="min-width:0;"><div style="font-size:16px;font-weight:650;">${current.name}</div><div style="font-size:12.5px;color:var(--muted);margin-top:2px;">${current.role} · ${current.dept}</div></div><div style="margin-left:auto;flex:none;padding:4px 9px;border-radius:999px;background:#F5F7FA;border:1px solid #ECEFF3;font-size:11px;font-weight:600;color:var(--muted);">${wcLabel(current.workClass)}</div></div><div style="margin-top:12px;padding-top:12px;border-top:1px solid #ECEFF3;font-size:13.5px;font-weight:600;color:var(--zb-blue);">Suggested: ${current._type}</div></div>`}
      <div style="flex:1;min-height:14px;"></div>${reelHTML()}
    </div>
    ${idle?`<button type="button" onclick="doSpin()" style="position:relative;overflow:hidden;margin-top:14px;width:100%;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:19px;border-radius:999px;background:${DARKBTN};color:#fff;font-family:inherit;font-size:17px;font-weight:600;animation:btnGlow 4.6s ease-in-out infinite;">${SHEEN}<span id="spinLabel" style="position:relative;">Spin the wheel</span></button>`:`<div style="margin-top:14px;display:flex;flex-direction:column;gap:9px;"><button type="button" onclick="sendReq()" style="position:relative;overflow:hidden;width:100%;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:19px;border-radius:999px;background:${DARKBTN};color:#fff;font-family:inherit;font-size:17px;font-weight:600;animation:btnGlow 4.6s ease-in-out infinite;">${SHEEN}<span style="position:relative;">Send request to ${current.first}</span></button><div style="display:flex;gap:9px;"><button type="button" onclick="doSpin()" ${C.respins<=0?'disabled':''} style="flex:1;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;padding:13px;border-radius:12px;background:#fff;border:1px solid #ECEFF3;color:var(--muted);font-family:inherit;font-size:14px;font-weight:600;${C.respins<=0?'opacity:.5;cursor:not-allowed;':''}">${icon('refresh',15)}<span>Spin again (${C.respins})</span></button><button type="button" onclick="skip()" style="flex:1;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;padding:13px;border-radius:12px;background:#fff;border:1px solid #ECEFF3;color:var(--muted);font-family:inherit;font-size:14px;font-weight:600;">${icon('x',14)}<span>Skip</span></button></div></div>`}
    <div style="margin:14px 2px 4px;display:flex;align-items:flex-start;gap:9px;color:var(--muted);font-size:12.5px;line-height:1.45;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9AA3AF" stroke-width="1.9" stroke-linecap="round" style="flex:none;margin-top:1px;"><circle cx="12" cy="12" r="8.6"></circle><path d="M12 11v5.2M12 7.9v.1"></path></svg><span>${rule}</span></div>
  </div>`;
}
window.doSpin=async function(){
  const pool=eligible();if(!pool.length){toast("No one left to match!");return;}
  if(current){if(C.respins<=0){toast("No respins left today");return;}await S.useRespin();C.respins=await S.respinsLeft();}
  const face=$("#spinFace"),lbl=$("#spinLabel");if(lbl)lbl.textContent="Finding your match…";
  let ticks=0,total=18+Math.floor(Math.random()*6),delay=45;
  (function step(){const p=pool[Math.floor(Math.random()*pool.length)];if(face){face.textContent=inits(p.name);face.style.backgroundColor=p.color;}ticks++;if(ticks>=total){p._type=meetupType(p);current=p;render();return;}if(ticks>total-6)delay+=40;setTimeout(step,delay);})();
};
window.skip=function(){current=null;render();};
window.sendReq=async function(){const p=current;current=null;await S.createMatch(p,p._type,pickQuestions());toast("Request sent to "+p.first);await refresh();};
window.acceptReq=async function(id){await S.acceptMatch(id);toast("Matched! Plan your meetup");await refresh();};
window.declineReq=async function(id){await S.declineMatch(id);await refresh();};

/* ---------------- MEETUPS ---------------- */
function viewMeetups(){
  const act=activeMatches(),hist=history();
  if(!act.length&&!hist.length)return `<h2>My meetups</h2><p class="sub">Your matches will appear here.</p><div class="card center muted">No meetups yet — head to Spin to find your first match.</div>`;
  const totalUnread=act.reduce((s,m)=>s+(m.unread||0),0);
  let h=`<h2>My meetups</h2><p class="sub">Message, meet, then log it for points.</p>`;
  if(act.some(m=>m.status==='active'))h+=`<div class="card mailbox" onclick="go('messages')"><div class="nicon">${icon('chat',20)}</div><div style="flex:1"><div style="font-weight:700">Messages</div><div class="muted small">Coordinate your meetups with your matches</div></div>${totalUnread?`<span class="badge">${totalUnread} new</span>`:`<span style="color:var(--muted);transform:rotate(180deg)">${icon('back',18)}</span>`}</div>`;
  act.forEach(m=>{
    if(m.status==='requested'&&m.incoming)h+=`<div class="card"><div class="row"><div class="nicon" style="background:var(--zb-blue-soft)">${icon('users',20)}</div><div style="flex:1"><div style="font-weight:700">${m.person.name} wants to meet</div><div class="muted small">${m.person.role} · suggested ${m.type}</div></div></div><div class="row" style="gap:10px;margin-top:12px"><button class="btn sm" style="flex:1;justify-content:center" onclick="acceptReq('${m.id}')">${icon('check',16)} Accept</button><button class="btn ghost sm" style="flex:1;justify-content:center" onclick="declineReq('${m.id}')">${icon('x',16)} Decline</button></div></div>`;
    else if(m.status==='requested')h+=`<div class="card"><div class="row between"><div class="row">${av(m.person)}<div><div style="font-weight:700">${m.person.name}</div><div class="muted small">${m.person.role}</div></div></div><span class="chip grey">Waiting…</span></div></div>`;
    else{const done=isComplete(m);h+=`<div class="card"><div class="row between"><div class="row">${av(m.person)}<div><div style="font-weight:700">${m.person.name}</div><div class="muted small">${m.person.dept}</div></div></div><span class="chip ${done?'good':''}">${done?'Ready':'Active'}</span></div><div class="muted small" style="margin:10px 0 4px">Meetup: <b>${m.type}</b></div><button class="btn ${done?'secondary':''} sm" style="width:100%;margin-top:8px;justify-content:center" onclick="go('meet:${m.id}')">${done?'Review & complete':'Open shared space'}</button></div>`;}
  });
  if(hist.length){h+=`<div class="hr"></div><p class="sub" style="font-weight:700;color:var(--ink)">Completed</p>`;hist.forEach(m=>{h+=`<div class="card"><div class="row between"><div class="row">${av(m.person,'sm')}<div style="font-weight:600">${m.person.name}</div></div><span class="chip good">+10 pts</span></div></div>`;});}
  return h;
}
function viewMeet(id){
  const m=C.matches.find(x=>x.id===id&&x.status!=='completed');if(!m)return `<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button><div class="card muted">This meetup is complete.</div>`;
  const last=m.messages.length?m.messages[m.messages.length-1]:null;
  return `<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button><h2 style="margin-top:6px">Meetup with ${m.person.first}</h2><p class="sub">A shared space you both fill in</p>
   <div class="meet-hero"><div class="row">${av(m.person)}<div><div style="font-weight:800">${m.person.name}</div><div class="muted small">${m.person.role} · ${wcLabel(m.person.workClass)}</div></div></div><div class="small" style="margin-top:10px;opacity:.9">You both accepted — suggested: <b>${m.type}</b>. Plan a time and place together.</div><button class="btn white" style="margin-top:14px" onclick="go('thread:${m.id}')">${icon('chat',18)} Plan your meetup${m.unread?` &nbsp;<span class="badge">${m.unread}</span>`:''}</button>${last?`<div class="small" style="margin-top:10px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Last message: ${(last.by==='me'?'You: ':'')+last.text}</div>`:''}</div>
   <div class="card"><div class="row between"><b>1 · Share a photo</b><span class="chip ${m.photo?'good':'grey'}">${m.photo?'+5':'+5 pts'}</span></div><p class="muted small" style="margin:8px 0 10px">A quick pic of your coffee/walk — or a Teams screenshot.</p>${m.photo?`<div class="wall-photo" style="height:80px;background:linear-gradient(135deg,${C.me.color},${m.person.color})">You & ${m.person.first}</div>`:`<button class="btn secondary sm" style="width:100%;justify-content:center" onclick="addPhoto('${m.id}')">${icon('camera',18)} Add meetup photo</button>`}</div>
   <div class="card"><div class="row between"><b>2 · Discussion questions</b><span class="chip ${m.answers.every(a=>(a||'').trim())?'good':'grey'}">${m.answers.every(a=>(a||'').trim())?'+5':'+5 pts'}</span></div>${m.questions.map((q,i)=>`<div class="q"><div class="t">${q.t}${q.tier===1?'<span class="tierpill">key idea</span>':''}</div><textarea class="input" rows="2" oninput="ans('${m.id}',${i},this.value)" placeholder="Your answer…">${m.answers[i]||''}</textarea></div>`).join('')}<p class="muted small">Your answers stay private (admins only). The photo goes to the community wall.</p></div>
   <button class="btn" id="completeBtn" onclick="complete('${m.id}')" ${isComplete(m)?'':'disabled'}>${icon('check',18)} Complete meetup</button><p class="muted small center" style="margin-top:8px">${isComplete(m)?'Nice — full 10 points!':'Add a photo and answer all 3 to complete.'}</p>`;
}
function viewMessages(){
  const chats=activeMatches().filter(m=>m.status==='active');
  if(!chats.length)return `<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button><h2 style="margin-top:6px">Messages</h2><p class="sub">Your match chats appear here.</p><div class="card center muted">No chats yet — accept a match to start talking.</div>`;
  let h=`<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button><h2 style="margin-top:6px">Messages</h2><p class="sub">Your match conversations.</p><div class="card" style="padding:4px 14px">`;
  chats.forEach(m=>{const last=m.messages.length?m.messages[m.messages.length-1]:null;h+=`<div class="notif" onclick="go('thread:${m.id}')">${av(m.person,'sm')}<div style="flex:1;min-width:0"><div class="row between"><b>${m.person.first}</b>${m.unread?`<span class="badge">${m.unread}</span>`:''}</div><div class="muted small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${last?(last.by==='me'?'You: ':'')+last.text:'Say hi and pick a time'}</div></div></div>`;});
  return h+`</div>`;
}
function viewThread(id){
  const m=C.matches.find(x=>x.id===id);if(!m)return `<button class="btn ghost sm" onclick="go('messages')">${icon('back',16)} Back</button><div class="card muted">Chat unavailable.</div>`;
  if(m.unread){m.unread=0;S.clearMatchUnread&&S.clearMatchUnread(id);}
  const thread=m.messages.map(x=>`<div class="msg ${x.by}">${x.text}</div>`).join('')||`<div class="muted small center" style="padding:16px">Say hi and pick a time to meet.</div>`;
  return `<button class="btn ghost sm" onclick="go('meet:${m.id}')">${icon('back',16)} Back to meetup</button><div class="row" style="margin:10px 2px 12px">${av(m.person)}<div><div style="font-weight:800">${m.person.name}</div><div class="muted small">${m.type}</div></div></div><div class="card threadcard"><div class="thread">${thread}</div><div class="row" style="gap:8px;margin-top:12px"><input class="input" id="msgIn" placeholder="Message ${m.person.first}…" onkeydown="if(event.key==='Enter')sendMsg('${m.id}')"><button class="btn sm" onclick="sendMsg('${m.id}')">${icon('send',17)}</button></div></div>`;
}
window.sendMsg=async function(id){const inp=$("#msgIn");const v=(inp.value||'').trim();if(!v)return;await S.sendMessage(id,v);await refresh();};
function refreshCompleteBtn(m){const b=document.getElementById('completeBtn');if(b)b.disabled=!isComplete(m);}
window.addPhoto=async function(id){await S.setMatchPhoto(id,true);toast("Photo added +5 pts");await refresh();};
window.ans=async function(id,i,v){const m=C.matches.find(x=>x.id===id);if(!m)return;m.answers[i]=v;await S.setMatchAnswers(id,m.answers);refreshCompleteBtn(m);};
window.complete=async function(id){const m=C.matches.find(x=>x.id===id);if(!m||!isComplete(m))return;await S.completeMatch(id,{names:(C.me.name||'You')+' & '+m.person.first,scene:typeToScene(m.type),photo:typeof m.photo==='string'?m.photo:null});toast("Meetup complete! +10 pts");view="meetups";await refresh();};

/* ---------------- WALL ---------------- */
function viewWall(){
  const real=C.posts.filter(w=>!w.seed),seeds=C.posts.filter(w=>w.seed);
  const posts=[...real,...seeds].slice(0,Math.max(6,real.length));
  const motd=posts[0]||C.posts[0];const ms=SCENES[motd.scene]||SCENES.coffee;
  let h=`<h2>Community wall</h2><p class="sub">Celebrating meetups across ZB.</p><div class="card" style="background:linear-gradient(135deg,var(--zb-blue),var(--zb-blue-dark));color:#fff;border:none"><span class="chip gold" style="background:rgba(255,255,255,.2);color:#fff">${icon('trophy',14)} Match of the day</span><div style="font-weight:800;font-size:17px;margin-top:10px">${motd.names}</div><div class="small" style="opacity:.85">${ms.chip}</div></div>`;
  posts.forEach(w=>{const s=SCENES[w.scene]||SCENES.coffee;h+=`<div class="card"><div class="row" style="margin-bottom:10px"><span class="avatar sm" style="background:${s.c1}">${initialsPair(w.names)}</span><div class="small"><b>${w.names}</b>${w.seed?'':' · <span style="color:var(--good);font-weight:700">just now</span>'}</div></div>${sceneSquare(w.scene,s.chip,w.photo)}<div class="row" style="gap:16px;margin-top:10px"><button class="iconbtn ${w.liked?'liked':''}" onclick="like('${w.id}')">${icon('heart',19,w.liked)} ${w.hearts}</button><span class="iconbtn">${icon('chat',18)} ${w.comments.length}</span></div>${w.comments.map(c=>`<div class="comment"><b>${(c.by||'').split(' ')[0]}</b> ${mention(c.text)}</div>`).join('')}<div class="row" style="gap:8px;margin-top:8px"><input class="input" id="cin${w.id}" placeholder="Add a comment… use @ to mention" onkeydown="if(event.key==='Enter')addComment('${w.id}')"><button class="btn sm secondary" onclick="addComment('${w.id}')">${icon('send',16)}</button></div></div>`;});
  return h;
}
window.like=async function(id){await S.heartPost(id);await refresh();};
window.addComment=async function(id){const inp=$("#cin"+id);const v=(inp.value||'').trim();if(!v)return;await S.commentPost(id,v);await refresh();};

/* ---------------- RANKS ---------------- */
function viewRanks(){
  let h=`<h2>Leaderboard</h2><p class="sub">Getting to know colleagues, one meetup at a time.</p><div class="card prize"><span class="chip" style="background:rgba(255,255,255,.2);color:#fff">${icon('trophy',14)} Prizes · winners announced end of October 2026</span><p class="small" style="margin:11px 0 0;line-height:1.5;opacity:.96">Every meetup earns you points — but there's more. A panel of <b>CB management judges</b> will pick the best <b>ideas</b> shared in the discussions. Win a <b>cash prize for the best idea</b>, or a prize for <b>climbing the leaderboard</b>. Get to know your colleagues, brainstorm some fun ideas — and help make an impact on people's lives.</p><div class="prizerow"><div class="prizecard"><div class="pk">BEST IDEA</div><div class="pv">Cash prize</div></div><div class="prizecard"><div class="pk">TOP OF BOARD</div><div class="pv">Prize</div></div><div class="prizecard"><div class="pk">RUNNER-UP</div><div class="pv">Prize</div></div></div></div><div class="card">`;
  C.leaderboard.slice(0,15).forEach((r,i)=>{h+=`<div class="rankrow ${r.me?'me':''}"><div class="n">${i+1}</div><span class="avatar sm" style="background:${r.color}">${inits(r.name)}</span><div class="nm">${r.name}</div><div class="p">${r.points}</div></div>`;});
  return h+`</div>`;
}

/* ---------------- PROFILE ---------------- */
function viewProfile(){
  const me=C.me;
  return `<h2>You</h2><p class="sub">Manage your profile and account.</p><div class="card center"><span class="avatar lg" style="margin:0 auto;background:${me.color}">${inits(me.name||'You')}</span><div style="font-weight:800;font-size:18px;margin-top:12px">${me.name||'You'}</div><div class="muted small">${me.role} · ${me.dept}</div><div class="muted small">${me.email||''}</div><div style="margin-top:10px"><span class="chip">${me.points} pts</span> <span class="chip grey">${history().length} meetups</span></div></div>
   <button class="btn secondary" onclick="go('editprofile')">${icon('pencil',18)} Edit profile &amp; avatar</button>
   <button class="btn secondary" style="margin-top:10px" onclick="go('bug')">${icon('bug',18)} Report a bug</button>
   ${C.admin?`<button class="btn secondary" style="margin-top:10px" onclick="go('admin')">${icon('chart',18)} Admin dashboard</button>`:''}
   <div class="hr"></div><button class="btn ghost" onclick="signOut()">${icon('signout',18)} Sign out</button><button class="btn danger" style="margin-top:10px" onclick="askDelete()">${icon('trash',18)} Delete my account</button><p class="muted small center" style="margin-top:8px">Deleting removes your profile, photos and answers (GDPR).</p>`;
}
function viewEditProfile(){
  const me=C.me;
  return `<button class="btn ghost sm" onclick="go('profile')">${icon('back',16)} Back</button><h2 style="margin-top:6px">Edit profile</h2><p class="sub">Update how colleagues see you.</p><div class="center"><span class="avatar lg" style="margin:0 auto;background:${me.color}">${inits(me.name||'You')}</span></div><div class="card" style="margin-top:14px"><span class="small" style="font-weight:700">Avatar colour</span><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px">${COLORS.map(c=>`<span onclick="epColor('${c}')" style="width:30px;height:30px;border-radius:50%;background:${c};cursor:pointer;border:${me.color===c?'3px solid var(--ink)':'3px solid #fff'};box-shadow:0 0 0 1px var(--line)"></span>`).join('')}</div></div><div class="card"><label class="small" style="font-weight:700">Name</label><input class="input" id="ep-name" value="${me.name}" style="margin-top:6px"></div><button class="btn" onclick="saveProfile()">${icon('check',18)} Save changes</button>`;
}
window.epColor=async function(c){await S.saveMe({color:c,photo:null});await refresh();};
window.saveProfile=async function(){const n=$("#ep-name").value.trim();await S.saveMe(n?{name:n}:{});toast("Profile saved");view='profile';await refresh();};
window.signOut=async function(){toast("Signed out");await S.signOut();current=null;OB={email:"",pass:"",name:"",color:"#0079BD",hasPhoto:false,workClass:"partial",floor:false,role:"IT Sr Analyst",dept:"IT - EMEA"};onboardStep=0;mode="onboarding";renderOnboard();};
window.askDelete=function(){$("#screen").innerHTML=`<h2>Delete your account?</h2><p class="sub">This permanently removes your profile, photos and answers. This can't be undone.</p><div class="card small" style="line-height:1.5">In line with GDPR this deletes your account and your data.</div><button class="btn danger" onclick="doDelete()">${icon('trash',18)} Yes, delete my account</button><button class="btn ghost" style="margin-top:10px" onclick="go('profile')">Cancel</button>`;};
window.doDelete=async function(){toast("Account deleted");await (S.deleteAccount?S.deleteAccount():S.signOut());current=null;onboardStep=0;mode="onboarding";renderOnboard();};

/* ---------------- BUG ---------------- */
function viewBug(){return `<button class="btn ghost sm" onclick="go('profile')">${icon('back',16)} Back</button><h2 style="margin-top:6px">Report a bug</h2><p class="sub">Spotted something odd? Tell us — it goes straight to the admins.</p><div class="card"><label class="small" style="font-weight:700">What happened?</label><textarea class="input" id="bugtxt" rows="4" placeholder="Describe the issue…" style="margin-top:6px"></textarea></div><button class="btn" onclick="sendBug()">${icon('send',18)} Send report</button>`;}
window.sendBug=async function(){const t=($("#bugtxt").value||'').trim();if(!t){toast("Please describe the issue");return;}await S.sendBug(t);toast("Bug report sent — thank you!");view='profile';await refresh();};

/* ---------------- ADMIN ---------------- */
function viewAdmin(){
  const completed=history().length,activeN=activeMatches().length,parts=C.users.length+1;
  const topQ=[...C.questions].sort((a,b)=>(b.count||0)-(a.count||0)).slice(0,5);
  return `<button class="btn ghost sm" onclick="go('profile')">${icon('back',16)} Back</button><h2 style="margin-top:6px">Admin dashboard</h2><p class="sub">Super-admin view (Donnae + Sean).</p>
   <div class="card"><div class="row"><div class="stat"><div class="v">${completed}</div><div class="l">My meetups</div></div><div class="stat"><div class="v">${activeN}</div><div class="l">Active now</div></div><div class="stat"><div class="v">${parts}</div><div class="l">People</div></div><div class="stat"><div class="v">${C.posts.length}</div><div class="l">Wall posts</div></div></div></div>
   <div class="card"><div class="row between"><b>Most-answered questions</b>${icon('chart',18)}</div>${topQ.map(q=>`<div style="margin-top:10px"><div class="row between small"><span style="flex:1;padding-right:8px">${q.text}</span><b>${q.count||0}</b></div><div style="height:7px;background:var(--line);border-radius:4px;margin-top:4px;overflow:hidden"><div style="height:100%;width:${Math.min(100,(q.count||0)*10)}%;background:var(--zb-blue)"></div></div></div>`).join('')}<button class="btn secondary sm" style="width:100%;margin-top:14px;justify-content:center" onclick="exportData()">${icon('download',18)} Export answers to Excel</button><p class="muted small" style="margin-top:6px">The idea-bank harvest (AI initiatives, CEO-for-a-day, etc.).</p></div>
   <div class="card"><div class="row between" style="margin-bottom:6px"><b>Question bank</b><span class="chip grey">${C.questions.length}</span></div>${C.questions.map(q=>`<div class="small" style="padding:6px 0;border-top:1px solid var(--line)">${q.tier===1?'<span class="tierpill">T1</span> ':''}${q.text}</div>`).join('')}<div class="row" style="gap:8px;margin-top:10px"><input class="input" id="newq" placeholder="Add a question…"><button class="btn sm" onclick="addQ()">${icon('plus',16)}</button></div></div>
   <div class="card"><div class="row between"><b>Bug reports</b><span class="chip ${C.bugs.length?'':'grey'}">${C.bugs.length}</span></div>${C.bugs.length?C.bugs.map(b=>`<div class="small" style="padding:8px 0;border-top:1px solid var(--line)"><b>${b.by}</b> · ${b.at}<br>${b.text}</div>`).join(''):`<p class="muted small" style="margin-top:8px">No bug reports yet.</p>`}</div>`;
}
window.exportData=function(){toast("Export coming in the live build");};
window.addQ=async function(){const v=($("#newq").value||'').trim();if(!v)return;await S.addQuestion(v);toast("Question added");await refresh();};

/* ---------------- NOTIFICATIONS ---------------- */
function viewNotifs(){
  let h=`<div class="row between"><h2>Notifications</h2>${C.notifs.length?`<button class="iconbtn" onclick="clearNotifs()">Clear all</button>`:''}</div><p class="sub">Tap one to jump to it.</p>`;
  if(!C.notifs.length)return h+`<div class="card center muted">You're all caught up.</div>`;
  C.notifs.forEach(n=>{h+=`<div class="ncard ${n.read?'':'unread'}" onclick="openNotif('${n.id}')"><div class="nicon">${icon(n.icon||'bell',18)}</div><div class="small" style="flex:1">${n.text}</div></div>`;});
  return h;
}
window.openNotif=async function(id){const n=C.notifs.find(x=>String(x.id)===String(id));if(!n)return;await S.markNotifRead(id);if(n.target){view=n.target;await refresh();}else await refresh();};
window.clearNotifs=async function(){await S.markNotifsRead();await refresh();};

/* ---------------- boot ---------------- */
window.ZB_BOOT=function(){
  if(S.onChange)S.onChange(()=>{ if(mode==='app'&&!authBusy) refresh(); });
  S.onAuth(async user=>{
    if(authBusy)return;
    if(!user){mode="onboarding";onboardStep=0;renderOnboard();return;}
    const me=await S.getMe();
    if(!me||!me.name){mode="onboarding";if(onboardStep<1)onboardStep=1;OB.email=user.email||OB.email;renderOnboard();return;}
    mode="app";await refresh();
  });
};
})();
