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
  money:'<rect x="2.6" y="6.4" width="18.8" height="11.2" rx="2.4"/><circle cx="12" cy="12" r="2.7"/><path d="M6 10.1v3.8M18 10.1v3.8"/>',
  clock:'<circle cx="12" cy="12.6" r="8.4"/><path d="M12 8.2v4.4l2.9 1.9"/><path d="M9 2.6h6"/><path d="M12 2.6v1.6"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.9 9.4a2.2 2.2 0 1 1 2.7 2.5v1.5"/><path d="M12.6 16.6h-.01"/>',
  star:'<path d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85Z"/>',
  mail:'<rect x="2.6" y="4.8" width="18.8" height="14.4" rx="2.6"/><path d="M3.4 7.2 12 13.2l8.6-6"/>',
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
  const items=list.map((w,i)=>{const s=SCENES[w.scene]||SCENES.coffee;return `<div style="flex:none;position:relative;width:132px;height:340px;display:flex;align-items:center;justify-content:center;">${arcs[i%arcs.length]==='down'?`<div style="position:absolute;z-index:1;left:100px;top:226px;width:98px;height:46px;border-bottom:2px dashed rgba(255,255,255,.55);border-radius:0 0 46px 46px / 0 0 46px 46px;"></div>`:`<div style="position:absolute;z-index:1;left:100px;top:82px;width:98px;height:46px;border-top:2px dashed rgba(255,255,255,.55);border-radius:46px 46px 0 0 / 46px 46px 0 0;"></div>`}<div style="position:absolute;z-index:3;top:2px;left:${i%2?'-10px':'16px'};padding:9px 16px;border-radius:999px;background:${SHADES[i%SHADES.length]};border:1px solid rgba(255,255,255,.24);color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap;box-shadow:0 3px 8px rgba(10,20,40,.10);transform:rotate(${i%2?'7deg':'-5deg'});">${s.chip}</div><div style="position:relative;z-index:2;width:132px;background:#fff;border-radius:12px;padding:8px;box-shadow:0 10px 24px rgba(10,20,40,.26);transform:rotate(${rots[i%rots.length]});"><div style="display:flex;align-items:center;gap:6px;padding:0 1px 7px;"><div style="width:16px;height:16px;border-radius:999px;flex:none;background:${s.c1};"></div><div style="font-size:9px;font-weight:600;color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${w.names}</div></div>${sceneSquare(w.scene,'',w.photo)}<div style="display:flex;align-items:center;gap:10px;padding:7px 1px 0;color:#6B7280;font-size:9px;font-weight:600;"><span style="display:flex;align-items:center;gap:3px;">${icon('heart',9)}${w.hearts}</span><span style="display:flex;align-items:center;gap:3px;">${icon('chat',9)}${w.comments.length}</span></div></div></div>`;}).join('');
  return `<div style="position:relative;margin:0 -20px 30px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);transform:rotate(-6deg);"><div style="display:flex;width:max-content;align-items:center;gap:64px;padding:10px 8px;will-change:transform;transform:translateZ(0);animation:reelDrift 42s linear infinite;">${items}${items}</div></div>`;
}

/* ---------------- helpers ---------------- */
const $=s=>document.querySelector(s);
const inits=s=>{const p=(s||'').trim().split(/\s+/);return ((p[0]?.[0]||'?')+(p[1]?.[0]||'')).toUpperCase();};
function av(p,cls=''){const bg=p.color||'#cfd8e3';const label=p.photo?'':inits(p.name||p.first||'?');return `<span class="avatar ${cls}" style="background:${bg}">${p.photo?`<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover" onerror="this.remove()">`:label}</span>`;}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2000);}
function wcLabel(w){return w==='on-site'?'On-site':w==='remote'?'Fully remote':'Partially remote';}
// BRIEF-011A: a comment stores only byUid, so the display name is resolved from the author's
// profile at render time. Comments written before this change carry a client-supplied `by`
// string and no uid — those still render (from `by`), they are simply not verifiable.
function commentAuthor(c){
  if(c&&c.byUid){
    const me=C.me||{};
    if(c.byUid===me.uid||c.byUid==='me')return (me.first||(me.name||'You').split(' ')[0]);
    const u=(C.users||[]).filter(x=>x&&x.uid===c.byUid)[0];
    if(u)return (u.first||(u.name||'').split(' ')[0])||'A colleague';
    return 'A colleague';                       // author left, or not in the pool
  }
  return ((c&&c.by)||'').split(' ')[0]||'A colleague';   // legacy comment
}
function mention(txt){return (txt||'').replace(/@([A-Za-z]+)/g,'<span class="ment">@$1</span>');}
// Capture sizes: avatars only ever render small, but a meetup photo fills a wall card
// (~400px+ CSS, so 2x on a phone), and 256px upscaled is what made it look soft.
var AVATAR_PX=256, MEETUP_PX=960;   // 960 square @ q0.82 ~= 120-250KB base64, well under the 1MB doc limit
// Pick an image (camera or library on mobile), crop-to-square + downscale to a base64 JPEG.
// `px` is the target edge; we never upscale past the source, so a small original stays small.
function pickImage(cb,px){
  try{
    var inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
    inp.style.position='fixed'; inp.style.left='-9999px';
    function cleanup(){ if(inp&&inp.remove)inp.remove(); }
    inp.onchange=function(){
      var f=inp.files&&inp.files[0]; if(!f){cleanup();return;}
      var fr=new FileReader();
      fr.onload=function(){
        var img=new Image();
        img.onload=function(){
          var min=Math.min(img.width,img.height), sx=(img.width-min)/2, sy=(img.height-min)/2;
          var s=Math.min(px||AVATAR_PX, min);              // never upscale a small original
          var c=document.createElement('canvas'); c.width=s; c.height=s; var ctx=c.getContext('2d');
          ctx.drawImage(img, sx,sy,min,min, 0,0,s,s);
          var data; try{ data=c.toDataURL('image/jpeg',0.82); }catch(e){ data=null; }
          cleanup(); if(data) cb(data); else toast("Couldn't process that image");
        };
        img.onerror=function(){cleanup();toast("Couldn't read that image");};
        img.src=fr.result;
      };
      fr.onerror=function(){cleanup();toast("Couldn't read that file");};
      fr.readAsDataURL(f);
    };
    document.body.appendChild(inp); inp.click();
  }catch(e){ toast("Photo picker unavailable"); }
}

/* ---------------- i18n (BRIEF-023) ---------------- */
// The viewer's language. During onboarding the profile may not exist yet, so OB.lang leads.
const LANGS=["en","nl","ro"];
function myLang(){
  const l=(mode==="onboarding"&&OB&&OB.lang)||(C.me&&C.me.lang)||"en";
  return LANGS.indexOf(l)>-1?l:"en";
}
// t(key) — English is the fallback for a missing language and a missing key (never blank).
function t(key,params){ return window.ZB_T?window.ZB_T(key,myLang(),params):key; }
// Notifications are stored with an English `text` at send time. Render from `type` + `name` in
// the READER's language instead, and fall back to the stored English for anything older or of
// an unknown type — so nothing ever renders blank.
function notifText(n){
  if(!n)return '';
  const key={request:'notif_request',accept:'notif_accept',msg:'notif_msg',welcome:'notif_welcome'}[n.type];
  if(!key)return n.text||'';
  if(key==='notif_welcome')return t(key);
  const name=n.name||notifNameFromText(n.text);
  if(!name)return n.text||t(key,{name:''}).trim();
  return t(key,{name:name});
}
// Old notifications carry no `name` field; recover it from the stored English sentence.
function notifNameFromText(txt){
  txt=(txt||'').trim(); if(!txt)return '';
  const m=txt.match(/^(.+?) (?:wants to meet you|accepted your match|sent you a message)/);
  return m?m[1]:'';
}
// A question in the viewer's language, falling back to the canonical English `text`.
// Each side of a meetup therefore reads the same question in their own language.
function qText(q,lang){
  if(!q)return '';
  const l=lang||myLang();
  if(l!=='en'&&q['text_'+l])return q['text_'+l];
  // A match stores a snapshot of its questions as {id,t} — English, and canonical for the
  // admin export. So look the id up in the live bank to find the viewer's translation: both
  // participants read the same question, each in their own language.
  if(l!=='en'&&q.id){
    const b=(C.questions||[]).filter(x=>x&&x.id===q.id)[0];
    if(b&&b['text_'+l])return b['text_'+l];
  }
  return q.text||q.t||'';
}
// A small language cue on a colleague's card: "greet them in their language".
// Inline SVG rather than emoji flags — emoji render differently on every platform (and Windows
// shows letter pairs), whereas these are identical everywhere and need no font. Defined once
// here; every call-site gets it through langBadge().
const FLAG_SVG={
  // Union Jack, simplified: at 20px the counterchanged diagonals are invisible anyway.
  en:'<rect width="24" height="16" fill="#012169"/>'
    +'<path d="M0 0 24 16M24 0 0 16" stroke="#fff" stroke-width="3.2"/>'
    +'<path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" stroke-width="1.8"/>'
    +'<path d="M12 0v16M0 8h24" stroke="#fff" stroke-width="5.2"/>'
    +'<path d="M12 0v16M0 8h24" stroke="#C8102E" stroke-width="3"/>',
  nl:'<rect width="24" height="5.34" fill="#AE1C28"/><rect y="5.34" width="24" height="5.33" fill="#fff"/><rect y="10.67" width="24" height="5.33" fill="#21468B"/>',
  ro:'<rect width="8" height="16" fill="#002B7F"/><rect x="8" width="8" height="16" fill="#FCD116"/><rect x="16" width="8" height="16" fill="#CE1126"/>',
};
const LANG_LABEL={en:'EN',nl:'NL',ro:'RO'};
const LANG_TITLE={en:'Speaks English',nl:'Spreekt Nederlands',ro:'Vorbește română'};
function langBadge(lang){
  const l=LANGS.indexOf(lang)>-1?lang:'en';
  const title=LANG_TITLE[l]||LANG_TITLE.en;
  const flag=FLAG_SVG[l];
  // Never render an empty badge: if a flag can't resolve, fall back to the text pill.
  if(!flag)return `<span class="langpill" title="${title}" aria-label="${title}">${LANG_LABEL[l]||'EN'}</span>`;
  return `<span class="langflag" title="${title}" aria-label="${title}" role="img">`
    +`<svg viewBox="0 0 24 16" width="20" height="13" aria-hidden="true" focusable="false">${flag}</svg></span>`;
}

/* ---------------- go-live spin lock (BRIEF-019) ---------------- */
// Soft launch gate, deliberately client-side: a user with a wrong clock could spin early
// against a near-empty pool, which is harmless. It auto-lifts at SPIN_UNLOCK with no redeploy
// because every render and every tick re-compares against the one constant.
const SPIN_UNLOCK=window.ZB_SPIN_UNLOCK;
// ?preview=1 forces the countdown even for an admin (QA); ?preview=0 clears it.
(function(){try{
  const m=(location.search||'').match(/[?&]preview=([01])/);
  if(m)m[1]==='1'?localStorage.setItem('zbPreviewCountdown','1'):localStorage.removeItem('zbPreviewCountdown');
}catch(e){}})();
const previewCountdown=()=>{try{return localStorage.getItem('zbPreviewCountdown')==='1';}catch(e){return false;}};
// Admins bypass so Sean and Donnae can seed and test; preview overrides that for QA.
const spinLocked=()=>!!SPIN_UNLOCK&&Date.now()<SPIN_UNLOCK.getTime()&&(!C.admin||previewCountdown());
function unlockParts(){
  const ms=Math.max(0,SPIN_UNLOCK.getTime()-Date.now()), t=Math.floor(ms/1000);
  const p=n=>n<10?'0'+n:String(n);
  return {open:ms<=0,d:p(Math.floor(t/86400)),h:p(Math.floor(t/3600)%24),m:p(Math.floor(t/60)%60),s:p(t%60)};
}

/* ---------------- confetti (ported from the Claude Design handoff) ---------------- */
// Lifted from design_handoff_points_awarded (PointsAwarded.jsx): two bottom-corner cannons
// firing inward, gravity + drag, rectangles squashed by |cos(rot)| to fake a 3D flutter, 25%
// circles, fade over the final 40 frames. Vanilla canvas 2D + rAF — no library, no CDN.
// The handoff's React refs become module-level state here; the rAF loop stops when the
// particle array empties and restarts on the next burst.
const CONFETTI_COLORS=["#0079BD","#2E86D6","#20416F","#7FC4E8","#F2C230","#FFFFFF","#E8536B"];
let cfParts=[],cfRaf=null,cfSize={w:0,h:0},cfCanvas=null;
const reducedMotion=()=>{try{return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}};
function cfResize(){
  const c=cfCanvas; if(!c)return;
  const dpr=window.devicePixelRatio||1, r=c.getBoundingClientRect();
  c.width=r.width*dpr; c.height=r.height*dpr;
  c.getContext("2d").setTransform(dpr,0,0,dpr,0,0);
  cfSize={w:r.width,h:r.height};
}
function cfTick(){
  const c=cfCanvas; if(!c){cfRaf=null;return;}
  const {w,h}=cfSize, ctx=c.getContext("2d");
  ctx.clearRect(0,0,w,h);
  const next=[];
  for(const p of cfParts){
    p.life++; p.vy+=0.32; p.vx*=0.988; p.vy*=0.992;
    p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
    const fade=p.life>p.max-40?Math.max(0,(p.max-p.life)/40):1;
    if(p.life<p.max&&p.y<h+40){
      ctx.save(); ctx.globalAlpha=fade; ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color;
      if(p.round){ctx.beginPath();ctx.arc(0,0,p.w*0.55,0,Math.PI*2);ctx.fill();}
      else ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.rot*0.9)));
      ctx.restore(); next.push(p);
    }
  }
  cfParts=next;
  cfRaf=cfParts.length?requestAnimationFrame(cfTick):null;
}
function cfBurst(scale){
  if(!cfCanvas||reducedMotion())return;
  const {w,h}=cfSize, n=Math.round(120*(scale||1));
  for(let i=0;i<n;i++){
    const fromLeft=i%2===0;
    const ang=(fromLeft?-60:-120)+(Math.random()*44-22);
    const sp=11+Math.random()*11, rad=(ang*Math.PI)/180;
    cfParts.push({
      x:fromLeft?-8:w+8, y:h*(0.58+Math.random()*0.22),
      vx:Math.abs(Math.cos(rad))*sp*(fromLeft?1:-1), vy:Math.sin(rad)*sp,
      w:5+Math.random()*6, h:8+Math.random()*8,
      rot:Math.random()*Math.PI, vr:(Math.random()-0.5)*0.34,
      color:CONFETTI_COLORS[(Math.random()*CONFETTI_COLORS.length)|0],
      round:Math.random()<0.25, life:0, max:150+Math.random()*90
    });
  }
  if(!cfRaf)cfRaf=requestAnimationFrame(cfTick);
}
// Attach to the canvas in the award screen. Everything is feature-detected, so the Node
// harness (no rAF, no real canvas) skips it and the screen still renders its final state.
function confettiInit(){
  try{
    if(typeof requestAnimationFrame!=='function')return;
    const c=document.querySelector("#cfCanvas");
    if(!c||typeof c.getContext!=='function'||typeof c.getBoundingClientRect!=='function')return;
    const ctx=c.getContext("2d");
    if(!ctx||typeof ctx.clearRect!=='function'||typeof ctx.setTransform!=='function')return;
    cfCanvas=c; cfParts=[];
    cfResize();
    if(!window.__cfResizeBound){window.addEventListener("resize",cfResize);window.__cfResizeBound=true;}
    setTimeout(()=>cfBurst(1),220);      // entry sequence, per the handoff
    setTimeout(()=>cfBurst(0.5),900);
  }catch(e){/* decorative only — never let it break onboarding */}
}
window.zbCelebrate=function(){ if(!cfCanvas)confettiInit(); else cfBurst(1); };

/* ---------------- build stamp ---------------- */
// The version we are RUNNING, taken from this script's own ?v= in index.html — so there is no
// second constant to forget to bump. null when that can't be read (e.g. the Node harness).
var ZB_APP_VERSION=(function(){try{var s=document.currentScript&&document.currentScript.src;var m=s&&s.match(/[?&]v=(\d+)/);return m?parseInt(m[1],10):null;}catch(e){return null;}})();
// version.json is written by the deploy workflow and fetched with cache:no-store, so it always
// reports what is DEPLOYED. Comparing it with ZB_APP_VERSION is how the app notices it is stale:
// on iOS a home-screen app can keep serving an old index.html (and so old app.js) indefinitely.
async function loadBuild(){
  if(typeof fetch!=='function')return;
  try{
    const r=await fetch('version.json?ts='+Date.now(),{cache:'no-store'});
    if(!r.ok)return;
    const b=await r.json();
    if(b&&b.version){C.build=b;if(view==='profile')render();}
  }catch(e){/* offline or no stamp deployed yet — the running version still shows */}
}
const buildIsStale=()=>!!(C.build&&ZB_APP_VERSION&&Number(C.build.version)>ZB_APP_VERSION);
function buildStampHTML(){
  const running=ZB_APP_VERSION?('v'+ZB_APP_VERSION):'dev';
  const b=C.build;
  const line=b?[running,b.sha,b.date].filter(Boolean).join(' · '):running;
  return `<div class="center" style="margin-top:18px">
    ${buildIsStale()?`<div class="card" style="border-color:#cfe6f5;background:var(--zb-blue-soft);text-align:left">
      <div class="row" style="gap:10px;align-items:flex-start"><div class="nicon" style="flex:none">${icon('refresh',18)}</div>
      <div class="small" style="line-height:1.5"><b>Update available</b> — this device is running ${running} but ${'v'+C.build.version} is live.
      Tap Check for update. If it keeps showing the old version and you opened this from a home-screen icon,
      remove the icon and add it again.</div></div></div>`:''}
    <div class="muted small" style="letter-spacing:.02em">${line}</div>
    <button class="btn ghost sm" style="margin-top:6px" onclick="checkUpdate()">${icon('refresh',16)} Check for update</button>
  </div>`;
}
// Reload past the cache. A page can only do so much: this re-requests index.html with a fresh query,
// which fixes a normal browser tab. An iOS home-screen app caches index.html itself, so if this
// doesn't shift it, the reliable reset is remove + re-add the icon (see Context/CACHING.md).
window.checkUpdate=function(){
  try{ if('caches' in window && caches.keys) caches.keys().then(ks=>ks.forEach(k=>caches.delete(k))); }catch(e){}
  location.replace(location.pathname+'?r='+Date.now());
};

/* ---------------- state ---------------- */
let C={me:null,users:[],matches:[],posts:[],notifs:[],questions:[],spin:{points:0,freeSpin:true},admin:false,leaderboard:[],bugs:[],build:null,adminData:null};
let adminOpenQ=null,adminAnon=false;   // which question is expanded; whether to hide who said what
let view="spin", onboardStep=0, mode="onboarding", authBusy=false, current=null;
let AWARD={first:"",points:30,bonus:0,balance:30};   // props for the Points Awarded screen
let ICE={qs:[],answers:["","",""],from:"onboard"};   // the icebreaker step
let OB={lang:"en",email:"",pass:"",name:"",color:"#0079BD",hasPhoto:false,workClass:"partial",floor:false,role:"IT Sr Analyst",dept:"IT - EMEA"};
// The two matching-critical labels — keyed off by eligible(), so never inline these strings.
const EMEA_ROLE='EMEA - QARA Commercial';
const GSCC_QARA='GSCC - QARA';
const QARA_SET=[EMEA_ROLE,GSCC_QARA];
// Generated from Context/roles-source.txt (107 verbatim rows from the spreadsheet): every row is
// prefixed 'GSCC ' except the two labels above, plus 'Other' as the catch-all. 108 options.
const ROLES=["GSCC Assoc Dir, Global Legal Ops","GSCC Assoc. Director, Pricing Technology","GSCC Bus Systems Manager","GSCC Buying Group & Tender Manager","GSCC Capex & Inventory Lead","GSCC Capex and Inventory Excellence Lead","GSCC Capital Equipment Sls Representative","GSCC Clinical Operations Project Assoc Manager","GSCC Clinical Operations Sr Manager","GSCC Clinical Programmer","GSCC Clinical Sales Specialist","GSCC Clinical Sales Sr Specialist","GSCC Cluster Payroll Supervisor","GSCC Consignment Auditor","GSCC Contract, Tender & Buying Group Specialist","GSCC Cust Experience Specialist","GSCC Cust Experience Sr Supervisor","GSCC CX Team Lead","GSCC Digital Mktg Senior Specialist","GSCC Distribution / Warehouse Assoc. Director I","GSCC Distribution Coordinator","GSCC Distribution Supervisor","GSCC Distribution Team Lead","GSCC DTS Clincal Sales Specialist","GSCC EUC Team Leader","GSCC Facility Coordinator","GSCC Facility Manager","GSCC Field Svc Engineer","GSCC Finance Manager","GSCC Finance Sr. Director","GSCC Finance VP EMEA","GSCC Glbl Freight & Transportation Manager","GSCC Global Customer Operations Manager","GSCC HR Advisor","GSCC HR Sr Manager","GSCC Inv Sr Analyst","GSCC Inventory Optimization Principal","GSCC IS Security & Controls Sr Analyst","GSCC IT Associate Director","GSCC IT BRM EMEA/APAC Glbl Supply Chain","GSCC IT Bus Relationship Manager","GSCC IT Bus Sys Manager Cust Excellence","GSCC IT Ntwrk Sr Engineer","GSCC IT Sr Analyst","GSCC Litigation Sr Manager","GSCC Marketing & Ops Intern","GSCC Master Data Analyst","GSCC MedEd & Events Manager","GSCC MedEd & Events Specialist","GSCC MedEd Manager UE&SPORTS","GSCC Housekeeping Clerk","GSCC IT Helpdesk Technician","GSCC Payroll Specialist","GSCC Senior Supply Coordination","GSCC Tax Manager","GSCC OpEx Sr. Specialist","GSCC Plant Sourcing Manager","GSCC Portfolio Optimization Lead","GSCC Portfolio Planning Director","GSCC Pricing Operation Support","GSCC Pricing Ops Specialist","GSCC Pricing Ops Sr Specialist / NL Pricing Supervisor","GSCC Pricing Sr Analyst","GSCC Procurement Specialist – Warehouse","GSCC Product Marketing Manager","GSCC Product Marketing Manager HIPS&DTS","GSCC Product Sr Manager","GSCC Program Assoc Director","GSCC Program Development Sr Manager EMEA","GSCC - QARA","EMEA - QARA Commercial","GSCC Reg Affairs Specialist","GSCC Rotating Kit Coordinator","GSCC Rotating Kit Handling Assistant","GSCC SC Network Planning Manager","GSCC Senior DTS Clincal Sales Specialist","GSCC Senior Supply Coordinator","GSCC Site Sppt Coordinator","GSCC Sls Manager","GSCC Sls Representative","GSCC Sls Sr Representative","GSCC Software Dev Manager","GSCC Software Developer Principal","GSCC Software Sr Developer","GSCC Solution Consultant","GSCC Sourcing Manager","GSCC Sr Marketing Manager Hips","GSCC Strategic Account Manager & DTS","GSCC Strategic Account Manager R & DTS","GSCC Strategic Initiatives Lead","GSCC Supply Chain Lifecycle Manager","GSCC Supply Chain Manager","GSCC Tax Sr Manager","GSCC Team Lead Kit Creation & In/Outbound","GSCC Team Lead RK BeLux","GSCC Team Lead RK Netherlands & Nordics","GSCC Trade Compl Assoc Director","GSCC Trade Compl Manager","GSCC Trade Compliance Sr Analyst","GSCC Transport & Customs Lead","GSCC Transport Coordinator","GSCC Transportation Specialist","GSCC Warehouse & Distribution Lead","GSCC Warehouse Clerk","GSCC Warehouse In & Outbound Assistant","GSCC Warehouse Supervisor","GSCC Workshops & Demos Coordinator","Other"];
// Live users onboarded on the old 18-role list. Normalised ON READ so nobody is left holding a
// role absent from ROLES (which would make their pool behave oddly and look broken in the UI).
const LEGACY_ROLES={'QARA Manager':GSCC_QARA,'Quality Specialist':GSCC_QARA,'NonEE Warehouse Clerk':'GSCC Warehouse Clerk'};
function normalizeRole(r){
  r=(r||'').trim(); if(!r) return 'Other';
  if(ROLES.includes(r)) return r;                 // already current (incl. the two verbatim labels)
  if(LEGACY_ROLES[r]) return LEGACY_ROLES[r];
  const prefixed='GSCC '+r;
  if(ROLES.includes(prefixed)) return prefixed;   // an old GSCC role that survives in the new list
  return 'Other';                                 // unknown -> a normal non-QARA GSCC role for matching
}
const COLORS=["#0079BD","#1E9E5A","#E8B923","#D64545","#7A5AF8","#0EA5A5","#E5731E","#C026A3","#2563EB","#57606A"];
const IN_PERSON=["a coffee","a walk at lunch","a shared break","a litter-pick challenge"], REMOTE=["a Teams coffee call","a virtual catch-up"];

// Completion is PER USER: a meetup leaves my active list once *I* finish my part,
// even if the other person hasn't finished theirs yet.
const activeMatches=()=>C.matches.filter(m=>(m.status==='requested'||m.status==='active')&&!m.completed);
const history=()=>C.matches.filter(m=>m.completed);
const myPoints=m=>(m.photoAwarded?5:0)+(m.completed?5:0);   // up to 10 per meetup, earned independently
function eligible(){
  const matched=new Set(history().map(m=>m.person.uid)), busy=new Set(activeMatches().map(m=>m.person.uid));
  return C.users.filter(p=>{
    if(matched.has(p.uid)||busy.has(p.uid))return false;
    // EMEA has a single role and only meets the QARA set: EMEA<->EMEA and EMEA<->GSCC - QARA.
    // GSCC - QARA keeps its full GSCC pool and gains EMEA. Additive — the floor rule below is unchanged.
    const involvesEmea=C.me.role===EMEA_ROLE||p.role===EMEA_ROLE;
    if(involvesEmea&&!(QARA_SET.includes(C.me.role)&&QARA_SET.includes(p.role)))return false;
    if(C.me.floor||p.floor)return C.me.workClass==='on-site'&&p.workClass==='on-site';
    return true;
  });
}
function meetupType(p){const list=(p.workClass==='remote'||C.me.workClass==='remote')?REMOTE:IN_PERSON;return list[Math.floor(Math.random()*list.length)];}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
// Three questions per meetup: a first meetup leads with tier 1 ("key idea"), later ones take
// one tier-1 plus two tier-2. Since an admin can now delete and re-tier freely (BRIEF-008), a
// tier can be empty — so the picks are topped up from the whole shuffled bank rather than
// leaving holes. Returns fewer than 3 only if the bank itself holds fewer.
// Meetup discussion questions are Tier-1 (IDEA) ONLY — BRIEF-020. Tier 2 are icebreakers,
// asked once at onboarding and never collected, so they must never appear in a meetup.
const ideaQuestions=()=>(C.questions||[]).filter(q=>q.tier===1);
const icebreakerQuestions=()=>(C.questions||[]).filter(q=>q.tier===2);
function pickQuestions(){
  const bank=ideaQuestions();
  if(!bank.length)return [];
  return shuffle(bank).slice(0,3).map(q=>({id:q.id,t:q.text,tier:q.tier}));
}
const myAnswersDone=m=>m.answers.every(a=>(a||'').trim());
const canComplete=m=>myAnswersDone(m)&&!m.completed;   // my 3 answers = my +5; the photo earns its own +5
function unread(){return C.notifs.filter(n=>!n.read).length;}

/* ---------------- data load ---------------- */
async function refresh(){
  const [me,users,matches,posts,notifs,questions,spin,admin,lb,bugs]=await Promise.all([
    S.getMe(),S.listUsers(),S.myMatches(),S.listPosts(),S.listNotifs(),S.questionBank(),S.spinState(),S.isAdmin(),S.leaderboard(),S.listBugs()
  ]);
  // Roles are normalised ON READ (see normalizeRole): live users onboarded on the old 18-role
  // list, and matches carry a profile snapshot taken at creation time, so both can hold legacy strings.
  if(me)me.role=normalizeRole(me.role);
  const users2=users.map(u=>Object.assign({},u,{role:normalizeRole(u.role)}));
  const matches2=matches.map(m=>m.person?Object.assign({},m,{person:Object.assign({},m.person,{role:normalizeRole(m.person.role)})}):m);
  C.me=me;C.users=users2;C.matches=matches2;C.posts=posts;C.notifs=notifs;C.questions=questions;C.spin=spin;C.admin=admin;C.leaderboard=lb;C.bugs=bugs;
  if(!C.build)loadBuild();          // fire-and-forget; re-renders the You screen when it lands
  // A shared photo is worth +5 to both, but each side may only write its own points, so claim mine here.
  // Accounts created before BRIEF-017 never got the 30-point signup bonus; grant it once.
  if(S.claimSignupBonus&&C.me&&!C.me.signupBonusGranted){
    if(await S.claimSignupBonus()){const [me2,lb2,sp2]=await Promise.all([S.getMe(),S.leaderboard(),S.spinState()]);C.me=me2;C.leaderboard=lb2;C.spin=sp2;}
  }
  const unclaimed=C.matches.filter(m=>m.photo&&!m.photoAwarded);
  if(unclaimed.length&&S.claimPhotoAward){
    let got=false;for(const m of unclaimed){ if(await S.claimPhotoAward(m.id))got=true; }
    if(got){const [me2,matches2,lb2]=await Promise.all([S.getMe(),S.myMatches(),S.leaderboard()]);C.me=me2;C.matches=matches2;C.leaderboard=lb2;}
  }
  render();
}

// The idea bank reads answers across ALL matches, so it is loaded lazily — only for an admin,
// only when the admin screen is opened — rather than on every refresh.
async function loadAdminData(force){
  if(!C.admin||(C.adminData&&!force))return;
  // Turn the hardcoded default questions into editable records the first time an admin looks.
  try{ if(S.seedQuestionBank&&await S.seedQuestionBank()){C.questions=await S.questionBank();} }catch(e){}
  try{ C.adminData=await S.adminAnswers(); }
  catch(e){ C.adminData={error:(e&&e.code)==='zb/not-admin'?'Admins only.':'Could not load answers.',questions:[],totalAnswers:0,totalMatches:0}; }
  if(view==='admin')render();
}
window.reloadAdmin=async function(){C.adminData=null;render();await loadAdminData(true);};
window.adminToggleQ=function(id){adminOpenQ=adminOpenQ===id?null:id;render();};
window.adminToggleAnon=function(){adminAnon=!adminAnon;render();};

// The tiles are updated in place. Re-rendering the screen each second would restart every
// drift animation and the entry sequence, so only the digits change.
let cdTimer=null;
function cdTickOnce(){
  const t=unlockParts();
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('cdD',t.d);set('cdH',t.h);set('cdM',t.m);set('cdS',t.s);
  const tz=document.getElementById('cdTz');
  if(t.open&&tz)tz.textContent='Spinning is open — refresh';
  return !t.open;
}
function cdStop(){ if(cdTimer){clearInterval(cdTimer);cdTimer=null;} }
function cdStart(){
  cdStop();
  if(typeof setInterval!=='function')return;
  cdTickOnce();                                  // paint immediately, never flash zeros
  cdTimer=setInterval(()=>{
    if(!cdTickOnce()){cdStop();if(view==='spin')render();}   // at zero, fall through to the live screen
  },1000);
}
// Background tabs throttle timers — re-sync the moment we come back.
try{document.addEventListener&&document.addEventListener('visibilitychange',function(){
  if(!document.hidden&&cdTimer)cdTickOnce();
});}catch(e){}

/* ---------------- render / router ---------------- */
function render(){
  if(mode==="onboarding"){renderOnboard();return;}
  stopTagline();
  // Before unlock the countdown is a full-screen HOLDING screen: no appbar, no tab bar, and
  // nothing else reachable — there is nothing in the app worth showing yet. The chrome and the
  // rest of the app come back on their own the moment the lock lifts, because this re-evaluates
  // on every render and every countdown tick.
  if(spinLocked()){
    if(view!=="spin"&&view!=="howitworks")view="spin";
    $("#appbar").style.display='none';$("#tabbar").style.display='none';$("#screen").style.padding='0';
    S.setViewing && S.setViewing(view);
    const held=$("#screen");
    if(view==="howitworks"){held.innerHTML=howItWorksHTML(true);cdStop();}
    else {held.innerHTML=viewCountdown();cdStart();}
    return;
  }
  $("#appbar").style.display='';$("#tabbar").style.display='';$("#screen").style.padding='';
  S.setViewing && S.setViewing(view);
  renderAppbar();renderTabs();
  const s=$("#screen");
  if(view==="spin"){s.innerHTML=viewSpin();spinLocked()?cdStart():cdStop();}
  else if(view==="meetups")s.innerHTML=viewMeetups();
  else if(view==="messages")s.innerHTML=viewMessages();
  else if(view.startsWith("thread:"))s.innerHTML=viewThread(view.slice(7));
  else if(view.startsWith("meet:"))s.innerHTML=viewMeet(view.slice(5));
  else if(view.startsWith("recap:"))s.innerHTML=viewRecap(view.slice(6));
  else if(view==="howitworks")s.innerHTML=howItWorksHTML(true);
  else if(view==="wall")s.innerHTML=viewWall();
  else if(view==="ranks")s.innerHTML=viewRanks();
  else if(view==="profile")s.innerHTML=viewProfile();
  else if(view==="editprofile")s.innerHTML=viewEditProfile();
  else if(view==="bug")s.innerHTML=viewBug();
  else if(view==="admin"){s.innerHTML=viewAdmin();if(C.admin&&!C.adminData)loadAdminData();}
  else if(view==="notifs")s.innerHTML=viewNotifs();
  s.scrollTop=0;
}
let hiwFrom="spin";   // where the in-app How It Works was opened from, so Back returns there
window.go=v=>{
  // While locked the only routes are the countdown and How It Works — a deep-linked
  // notification must not drop a held user into an empty app.
  if(spinLocked()&&v!=="spin"&&v!=="howitworks")v="spin";
  if(v==="howitworks")hiwFrom=(view==="ranks"&&!spinLocked())?"ranks":"spin";
  if(v!=="spin")cdStop();
  view=v;render();
};
function renderAppbar(){$("#appbar").innerHTML=`<div class="brand">ZB <span>MeetUP</span></div><div class="spacer"></div><div class="pts">${C.me?C.me.points:0} pts</div><button class="bell" onclick="go('notifs')">${icon('bell',24)}${unread()?`<span class="badge">${unread()}</span>`:''}</button>`;}
function renderTabs(){
  const reqB=activeMatches().filter(m=>(m.status==='active'&&!myAnswersDone(m))||(m.status==='requested'&&m.incoming)).length;
  const tabs=[["spin","spinner","Spin"],["meetups","users","Meetups"],["wall","image","Wall"],["ranks","trophy","Ranks"],["profile","user","You"]];
  const root=(view.startsWith("meet:")||view.startsWith("thread:")||view==="messages")?"meetups":(view==="admin"||view==="editprofile"||view==="bug")?"profile":view;
  $("#tabbar").innerHTML=tabs.map(([id,ic,lb])=>{const b=id==='meetups'&&reqB?`<span class="badge" style="margin-left:4px">${reqB}</span>`:'';const ico=ic==='spinner'?spinnerIcon(21):icon(ic,22);return `<button class="${root===id?'active':''}" onclick="go('${id}')">${ico}<span>${lb}${b}</span></button>`;}).join("");
}

/* ---------------- welcome / splash ---------------- */
const ZB_LOGO_WHITE=`<svg viewBox="0 0 199 36" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M43.252 24.0777L51.4668 11.3H43.9816V9.85922H53.9001V10.124L45.9094 22.8611H53.7797V24.3629H43.2538V24.0777H43.252ZM56.6779 9.86107H58.4427V23.3129V24.3629H56.6779V9.86107ZM62.1927 9.86107H64.6464L69.1297 21.1592L73.4705 9.86107H75.9038V24.3629H74.139V12.1537L69.3316 24.3629H68.7834L63.8149 12.1537V24.3629H62.1927V9.86107ZM79.5519 9.86107H82.0057L86.4871 21.1592L90.8279 9.86107H93.2612V24.3629H91.4964V12.1537L86.689 24.3629H86.1408L81.1723 12.1537V24.3629H79.5501V9.86107H79.5519ZM96.9112 9.86107H105.369V11.3018H98.676V16.2296H104.07V17.6703H98.676V22.9222H105.733V24.3629H96.9112V9.86107ZM108.389 9.86107H112.75C115.528 9.86107 117.82 10.9963 117.82 13.8981V13.9796C117.82 16.3722 116.219 17.5481 114.23 17.9351L118.67 24.3648H116.704L112.383 18.0574H110.152V24.3648H108.387V9.86107H108.389ZM112.872 16.6555C114.941 16.6555 116.056 15.7629 116.056 13.9777V13.8963C116.056 11.9296 114.839 11.2796 112.872 11.2796H110.154V16.6537H112.872V16.6555ZM126.498 9.86107H130.859C133.556 9.86107 135.524 10.7537 135.524 13.6129V13.6944C135.524 15.0129 134.996 16.1888 133.333 16.7574C135.443 17.2648 136.233 18.3388 136.233 20.2259V20.3074C136.233 23.0463 134.367 24.3648 131.467 24.3648H126.498V9.86107ZM130.859 16.1888C132.989 16.1888 133.8 15.4185 133.8 13.6333V13.5518C133.8 11.9092 132.848 11.2388 130.819 11.2388H128.222V16.187H130.859V16.1888ZM131.428 22.9833C133.537 22.9833 134.511 22.05 134.511 20.287V20.2055C134.511 18.4203 133.517 17.5685 131.185 17.5685H128.222V22.9833H131.428ZM139.215 9.86107H140.98V23.1111V24.3629H139.215V9.86107ZM144.02 17.2037V17.0407C144.02 12.924 146.9 9.67773 151.159 9.67773C155.419 9.67773 158.237 12.9222 158.237 17V17.1629C158.237 21.2592 155.419 24.5463 151.2 24.5463C146.92 24.5444 144.02 21.2592 144.02 17.2037ZM156.413 17.1425V16.9796C156.413 13.7351 154.506 11.0981 151.159 11.0981C147.793 11.0981 145.846 13.5722 145.846 17.0203V17.1814C145.846 20.6907 148.178 23.0833 151.2 23.0833C154.424 23.0851 156.413 20.6518 156.413 17.1425ZM161.176 9.86107H163.63L168.111 21.1592L172.452 9.86107H174.885V24.3629H173.12V12.1537L168.313 24.3629H167.765L162.796 12.1537V24.3629H161.174V9.86107H161.176ZM178.535 9.86107H186.993V11.3018H180.3V16.2296H185.695V17.6703H180.3V22.9222H187.357V24.3629H178.535V9.86107ZM192.995 11.3018H188.776V9.86107H198.978V11.3018H194.759V24.3629H192.995V11.3018Z" fill="#FFFFFF"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M18.4984 0.015625C28.3688 0.015625 36.3688 8.01377 36.3688 17.8841C36.3688 27.7545 28.3688 35.7545 18.4984 35.7545C8.62988 35.7545 0.629883 27.7527 0.629883 17.8841C0.628031 7.22674 7.83914 0.015625 18.4984 0.015625ZM6.38729 29.3453L18.4558 6.42859L18.3391 6.41562C12.3817 6.41562 7.46692 11.0286 6.97988 16.8601V5.93044H30.1188C27.1151 3.01192 23.0169 1.21377 18.4965 1.21377C8.50766 1.21377 1.82248 7.89711 1.82248 17.8841C1.82433 22.323 3.55766 26.3564 6.38729 29.3453ZM6.68174 29.6416C9.70025 32.6786 13.878 34.5582 18.4965 34.5582C27.7058 34.5582 35.1706 27.0934 35.1706 17.8841C35.1706 13.3434 33.3558 9.22488 30.4114 6.21748L18.4577 29.1619C24.1595 29.1027 28.8558 24.8397 29.6058 19.3286L29.6077 29.6397H6.68174V29.6416Z" fill="#8FD0F5"></path></svg>`;
const TAGLINES=["Meet a new colleague, one coffee at a time.","Different team, different floor — same coffee break.","Small conversations, big connections."];
let _tagi=0,_tagTimer=null;
function startTagline(){ if(typeof setInterval!=='function')return; clearInterval(_tagTimer); _tagi=0; _tagTimer=setInterval(()=>{const el=document.getElementById('wtag');if(!el){clearInterval(_tagTimer);return;}el.style.opacity='0';setTimeout(()=>{_tagi=(_tagi+1)%TAGLINES.length;el.textContent=TAGLINES[_tagi];el.style.opacity='1';},350);},3800); }
function stopTagline(){ if(typeof clearInterval==='function')clearInterval(_tagTimer); }
const RW=["rgba(255,255,255,.17)","rgba(255,255,255,.26)","rgba(255,255,255,.12)"];
const REELW=[
 {label:"Priya met Tom",caption:"Priya & Tom",src:"assets/holding-demo-photos/priya-and-tom.jpg",color:"#7B4FA8",rot:"-6deg",likes:12,comments:3,top:"Coffee on site",topX:"-18px",topRot:"7deg",topShade:RW[0],arc:"down"},
 {label:"Marco met Inés",caption:"Marco & Inés",src:"assets/holding-demo-photos/marco-and-ines.jpg",color:"#C9821B",rot:"3deg",likes:8,comments:2,mid:"A walk & talk",midX:"62px",midRot:"-6deg",midShade:RW[1],bottom:"Lunch together",bottomX:"-6px",bottomRot:"9deg",bottomShade:RW[0],arc:"up"},
 {label:"Lena met Sven",caption:"Lena & Sven",src:"assets/holding-demo-photos/lena-and-sven.jpg",color:"#B03A4A",rot:"-3deg",likes:6,comments:1,top:"Teams coffee call",topX:"16px",topRot:"10deg",topShade:RW[2],arc:"down"},
 {label:"Anna met Mateo",caption:"Anna & Mateo",src:"assets/holding-demo-photos/anna-and-mateo.jpg",color:"#3E7C74",rot:"5deg",likes:15,comments:4,bottom:"Coffee on site",bottomX:"-14px",bottomRot:"5deg",bottomShade:RW[1],arc:"down"},
 {label:"Ravi met Chloé",caption:"Ravi & Chloé",src:"assets/holding-demo-photos/ravi-and-chloe.jpg",color:"#2F5F9E",rot:"-4deg",likes:9,comments:2,top:"Lunch together",topX:"-10px",topRot:"8deg",topShade:RW[0],arc:"up"},
 {label:"Yuki met Ben",caption:"Yuki & Ben",src:"assets/holding-demo-photos/yuki-and-ben.jpg",color:"#C2557E",rot:"2deg",likes:11,comments:5,top:"A walk & talk",topX:"20px",topRot:"-4deg",topShade:RW[2],bottom:"Teams coffee call",bottomX:"4px",bottomRot:"11deg",bottomShade:RW[0],arc:"down"},
];
function welcomeReel(){
  const items=REELW.concat(REELW).map(r=>`<div style="flex:none;position:relative;width:132px;height:300px;display:flex;align-items:center;justify-content:center;">
    ${r.arc==='down'?`<div style="position:absolute;z-index:1;left:100px;top:206px;width:98px;height:46px;border-bottom:2px dashed rgba(255,255,255,.55);border-radius:0 0 46px 46px / 0 0 46px 46px;"></div>`:`<div style="position:absolute;z-index:1;left:100px;top:62px;width:98px;height:46px;border-top:2px dashed rgba(255,255,255,.55);border-radius:46px 46px 0 0 / 46px 46px 0 0;"></div>`}
    ${r.top?`<div style="position:absolute;z-index:3;top:2px;left:${r.topX};padding:9px 16px;border-radius:999px;background:${r.topShade};border:1px solid rgba(255,255,255,.24);color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap;box-shadow:0 3px 8px rgba(10,20,40,.10);transform:rotate(${r.topRot});">${r.top}</div>`:''}
    ${r.mid?`<div style="position:absolute;z-index:3;top:2px;left:${r.midX};padding:9px 16px;border-radius:999px;background:${r.midShade};border:1px solid rgba(255,255,255,.24);color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap;box-shadow:0 3px 8px rgba(10,20,40,.10);transform:rotate(${r.midRot});">${r.mid}</div>`:''}
    ${r.bottom?`<div style="position:absolute;z-index:3;bottom:2px;left:${r.bottomX};padding:9px 16px;border-radius:999px;background:${r.bottomShade};border:1px solid rgba(255,255,255,.24);color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap;box-shadow:0 3px 8px rgba(10,20,40,.10);transform:rotate(${r.bottomRot});">${r.bottom}</div>`:''}
    <div style="position:relative;z-index:2;width:132px;background:#fff;border-radius:12px;padding:8px;box-shadow:0 10px 24px rgba(10,20,40,.26);transform:rotate(${r.rot});">
      <div style="display:flex;align-items:center;gap:6px;padding:0 1px 7px;"><div style="width:16px;height:16px;border-radius:999px;flex:none;background:${r.color};"></div><div style="font-size:9px;font-weight:600;color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.label}</div></div>
      <div style="position:relative;aspect-ratio:1;border-radius:8px;overflow:hidden;background-color:${r.color};"><div style="position:absolute;inset:0;background-image:url('${r.src}');background-size:cover;background-position:center;"></div><div style="position:absolute;inset:0;display:flex;align-items:flex-end;padding:8px;background:linear-gradient(to top,rgba(6,14,26,.6),rgba(6,14,26,0) 58%);"><div style="font-size:9.5px;font-weight:700;color:rgba(255,255,255,.96);">${r.caption}</div></div></div>
      <div style="display:flex;align-items:center;gap:10px;padding:7px 1px 0;color:#6B7280;font-size:9px;font-weight:600;"><span style="display:flex;align-items:center;gap:3px;">${icon('heart',9)}${r.likes}</span><span style="display:flex;align-items:center;gap:3px;">${icon('chat',9)}${r.comments}</span></div>
    </div></div>`).join('');
  return `<div style="position:relative;margin:78px 0 0;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);transform:rotate(-4deg);"><div style="display:flex;width:max-content;align-items:center;gap:64px;padding:10px 8px;will-change:transform;transform:translateZ(0);animation:reelDrift 40s linear infinite;">${items}</div></div>`;
}
function welcomeHTML(){
  return `<div style="min-height:100vh;background:linear-gradient(170deg,#3E6EA8 0%,#2F5F9E 42%,#20416F 100%);display:flex;flex-direction:column;overflow:hidden;">
    <div style="padding:34px 24px 0;display:flex;flex-direction:column;align-items:center;">
      ${ZB_LOGO_WHITE}
      <div style="margin-top:26px;font-size:32px;font-weight:700;letter-spacing:-.6px;color:#fff;">ZB <span style="color:#8FD0F5;">MeetUP</span></div>
      <div id="wtag" style="margin-top:8px;font-size:15px;line-height:1.5;color:rgba(255,255,255,.82);text-align:center;max-width:290px;transition:opacity .35s ease;">${TAGLINES[0]}</div>
    </div>
    <div style="position:relative;margin:30px 0 0;padding:0 24px;display:flex;justify-content:center;">
      <div style="position:relative;width:320px;height:184px;">
        <svg viewBox="0 0 320 184" width="320" height="184" fill="none" style="position:absolute;inset:0;"><path d="M74 96 C 118 26, 202 26, 246 96" stroke="rgba(255,255,255,.6)" stroke-width="2" stroke-dasharray="7 8" stroke-linecap="round" style="animation:dashDraw 1.5s ease-out .25s both, dashFlow 2.4s linear 1.75s infinite;"></path></svg>
        <div style="position:absolute;left:2px;top:44px;"><div style="position:relative;width:104px;height:104px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;inset:0;border-radius:999px;border:2px dashed rgba(255,255,255,.42);animation:ringSpin 30s linear infinite;"></div><img src="assets/priya_headshot.jpg" alt="" style="width:82px;height:82px;border-radius:999px;object-fit:cover;border:3px solid #F5F7FA;box-shadow:0 6px 20px rgba(16,24,40,.16);display:block;"></div></div>
        <div style="position:absolute;right:2px;top:44px;"><div style="position:relative;width:104px;height:104px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;inset:0;border-radius:999px;border:2px dashed rgba(255,255,255,.42);animation:ringSpin 30s linear infinite reverse;"></div><img src="assets/tom_headshot.jpg" alt="" style="width:82px;height:82px;border-radius:999px;object-fit:cover;border:3px solid rgba(255,255,255,.9);box-shadow:0 6px 20px rgba(6,14,26,.28);display:block;"></div></div>
        <div style="position:absolute;left:50%;top:22px;transform:translateX(-50%);"><div style="width:54px;height:54px;border-radius:999px;background:#fff;display:flex;align-items:center;justify-content:center;animation:sparkPulse 2.6s ease-in-out 2s infinite;"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0079BD" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3.4 12.9 8.3 17.8 10.2 12.9 12.1 11 17 9.1 12.1 4.2 10.2 9.1 8.3 11 3.4Z"></path><path d="M17.4 15.6l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"></path></svg></div></div>
        <div style="position:absolute;left:50%;bottom:2px;transform:translateX(-50%);"><div style="padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);color:#fff;font-size:13px;font-weight:600;white-space:nowrap;">Matched for a coffee</div></div>
      </div>
    </div>
    ${welcomeReel()}
    <div style="flex:1;min-height:18px;"></div>
    ${window._a2hsMobile?`<div style="display:flex;justify-content:center;margin:0 0 25px;"><button type="button" onclick="a2hsShow()" style="display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.30);color:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 3px 10px rgba(6,14,26,.18);">${icon('download',15)} Save as app</button></div>`:''}
    <div style="padding:20px 20px 24px;background:#F5F7FA;border-radius:26px 26px 0 0;box-shadow:0 -10px 34px rgba(6,14,26,.22);display:flex;flex-direction:column;gap:10px;">
      <button type="button" onclick="obGoCreate()" style="position:relative;overflow:hidden;width:100%;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:19px;border-radius:999px;background:${DARKBTN};color:#fff;font-family:inherit;font-size:17px;font-weight:600;animation:btnGlow 4.6s ease-in-out infinite;">${SHEEN}<span style="position:relative;">Create account</span></button>
      <button type="button" onclick="obGoSignIn()" style="width:100%;cursor:pointer;padding:17px;border-radius:999px;background:#fff;border:1px solid #ECEFF3;color:var(--ink);font-family:inherit;font-size:15px;font-weight:600;box-shadow:var(--shadow);">I already have an account</button>
      <div style="text-align:center;font-size:11.5px;color:var(--muted);margin-top:2px;">For Zimmer Biomet colleagues only &nbsp;·&nbsp; <a href="javascript:void(0)" onclick="obHow()" style="color:var(--zb-blue);font-weight:700">How it works</a></div>
    </div>
  </div>`;
}
function howItWorksHTML(inApp){
  const STEPS=[
    {n:1,ic:spinnerIcon(19),title:t('hiw_1_t'),body:t('hiw_1_b'),note:t('hiw_1_n')},
    {n:2,ic:icon('chat',19),title:t('hiw_2_t'),body:t('hiw_2_b'),note:""},
    {n:3,ic:icon('users',19),title:t('hiw_3_t'),body:t('hiw_3_b'),note:""},
    {n:4,ic:icon('camera',19),title:t('hiw_4_t'),body:t('hiw_4_b'),note:t('hiw_4_n')},
    {n:5,ic:icon('trophy',19),title:t('hiw_5_t'),body:t('hiw_5_b'),note:t('hiw_5_n')},
  ];
  const rows=STEPS.map((s,i)=>`<div style="position:relative;display:flex;gap:16px;padding-bottom:20px;">
    ${i<STEPS.length-1?`<div style="position:absolute;left:19px;top:44px;bottom:-2px;width:0;border-left:2px dashed #C6D8E6;"></div>`:''}
    <div style="position:relative;z-index:2;flex:none;width:38px;height:38px;border-radius:999px;background:var(--zb-blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;box-shadow:0 4px 14px rgba(0,121,189,.28),0 0 0 4px #F5F7FA;">${s.n}</div>
    <div style="flex:1;min-width:0;background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 16px 15px;box-shadow:var(--shadow);">
      <div style="display:flex;align-items:center;gap:11px;"><div style="flex:none;width:34px;height:34px;border-radius:11px;background:var(--zb-blue-soft);color:var(--zb-blue);display:flex;align-items:center;justify-content:center;">${s.ic}</div><div style="font-size:16.5px;font-weight:650;letter-spacing:-.2px;">${s.title}</div></div>
      <div style="margin-top:10px;font-size:13.5px;line-height:1.55;color:var(--muted);">${s.body}</div>
      ${s.note?`<div style="margin-top:11px;display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;background:var(--bg);border:1px solid var(--line);font-size:12px;font-weight:600;color:var(--zb-blue);">${icon('check',13)} ${s.note}</div>`:''}
    </div>
  </div>`).join('');
  return `<div style="min-height:100vh;background:var(--bg);display:flex;flex-direction:column;">
    <div style="position:sticky;top:0;z-index:20;display:flex;align-items:center;padding:16px 14px;background:rgba(245,247,250,.9);backdrop-filter:blur(12px);"><button type="button" onclick="${inApp?`go('${hiwFrom}')`:`obBackWelcome()`}" style="display:flex;align-items:center;gap:6px;padding:8px 12px 8px 8px;border:0;border-radius:999px;background:transparent;cursor:pointer;color:var(--ink);font-family:inherit;font-size:15px;font-weight:600;">${icon('back',18)}<span>Back</span></button></div>
    <div style="padding:2px 16px 0;animation:riseIn .5s ease-out both;"><div style="position:relative;overflow:hidden;border-radius:20px;padding:30px 26px 28px;background:linear-gradient(170deg,#3E6EA8 0%,#2F5F9E 42%,#20416F 100%);box-shadow:var(--shadow-lg);color:#fff;"><div style="position:absolute;right:-52px;top:-52px;width:172px;height:172px;border-radius:999px;border:2px dashed rgba(255,255,255,.22);"></div><div style="position:relative;font-size:11.5px;font-weight:700;letter-spacing:1.6px;color:rgba(255,255,255,.72);">FIVE SIMPLE STEPS</div><div style="position:relative;margin-top:10px;font-size:27px;line-height:1.18;font-weight:700;letter-spacing:-.5px;">How ZB MeetUP works</div><div style="position:relative;margin-top:10px;font-size:14.5px;line-height:1.5;color:rgba(255,255,255,.82);max-width:300px;">Meet colleagues, have great chats, earn points — in five simple steps.</div></div></div>
    <div style="padding:22px 16px 0;">${rows}</div>
    <div style="flex:1;min-height:8px;"></div>
    <div style="position:sticky;bottom:0;padding:14px 16px 22px;background:linear-gradient(to top,#F5F7FA 55%,rgba(245,247,250,0));">
      <button type="button" onclick="${inApp?`go('${hiwFrom}')`:`obGoCreate()`}" style="position:relative;overflow:hidden;width:100%;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;padding:19px;border-radius:999px;background:${DARKBTN};color:#fff;font-family:inherit;font-size:17px;font-weight:600;animation:btnGlow 4.6s ease-in-out infinite;">${SHEEN}<span style="position:relative;">${inApp?t('back'):t('hiw_cta')}</span></button>
      <div style="text-align:center;font-size:11.5px;color:var(--muted);margin-top:12px;">For Zimmer Biomet colleagues only</div>
    </div>
  </div>`;
}
window.obGoCreate=function(){stopTagline();onboardStep=0;renderOnboard();};
window.obGoSignIn=function(){stopTagline();onboardStep='signin';renderOnboard();};
window.obHow=function(){stopTagline();onboardStep='how';renderOnboard();};
window.obBackWelcome=function(){onboardStep='welcome';renderOnboard();};
// Three random icebreakers. `from` decides where Save/Skip goes: the onboarding award screen,
// or back to You when it's picked up later.
function iceStart(from){
  const pool=shuffle(icebreakerQuestions()).slice(0,3);
  const existing=(C.me&&C.me.icebreakers)||[];
  ICE={qs:pool.length?pool:[],answers:pool.map(q=>{
    const hit=existing.filter(x=>x&&x.id===q.id)[0];return hit?(hit.answer||''):'';
  }),from:from||'onboard'};
  if(!ICE.qs.length){iceDone();return;}
  mode="onboarding";onboardStep='ice';renderOnboard();
}
window.iceAns=function(i,v){ICE.answers[i]=v;
  const b=document.querySelector('.ob-cta .btn');
  if(b)b.textContent=ICE.answers.filter(a=>(a||'').trim()).length===3?'Save — earn 10 points':'Save';
};
function iceDone(){
  if(ICE.from==='profile'){mode="app";view="profile";refresh();return;}
  showAward();
}
window.iceSave=async function(){
  const list=ICE.qs.map((q,i)=>({id:q.id,question:q.text,answer:(ICE.answers[i]||'').trim()}))
                   .filter(x=>x.answer);
  await S.saveIcebreakers(list);
  if(list.length===3&&await S.claimIcebreakerBonus())toast("Nice — 10 points for your icebreakers!");
  await refresh();
  iceDone();
};
window.iceSkip=function(){iceDone();};
window.iceFromProfile=function(){iceStart('profile');};
// Leaving the award screen: stop the rAF loop and drop the canvas so it can't keep drawing.
async function showAward(){
  const me=await S.getMe();
  AWARD={first:(me&&(me.first||(me.name||"").split(" ")[0]))||"",points:30,
         bonus:(me&&me.icebreakerBonusGranted)?10:0,balance:(me&&me.points)||30};
  mode="onboarding";onboardStep='awarded';renderOnboard();
}
window.awardToSpin=async function(){
  try{ if(cfRaf)cancelAnimationFrame(cfRaf); }catch(e){}
  cfRaf=null;cfCanvas=null;cfParts=[];
  mode="app"; view="spin"; await refresh();
};

/* ---------------- onboarding ---------------- */
function renderOnboard(){
  const sc=$("#screen"),ab=$("#appbar"),tb=$("#tabbar");
  if(onboardStep==='welcome'){ ab.style.display='none';tb.style.display='none';sc.style.padding='0';sc.innerHTML=welcomeHTML();startTagline();return; }
  if(onboardStep==='how'){ ab.style.display='none';tb.style.display='none';sc.style.padding='0';sc.innerHTML=howItWorksHTML();return; }
  if(onboardStep==='lang'){
    ab.style.display='';tb.style.display='';sc.style.padding='';
    ab.innerHTML=`<div class="brand" style="margin:0 auto">ZB <span>MeetUP</span></div>`;tb.innerHTML="";
    sc.innerHTML=`<div class="ob"><div>
      <h2>${t('lang_q')}</h2><p class="sub">${t('lang_sub')}</p>
      <div class="card">${LANGS.map(l=>`<button type="button" class="btn ${OB.lang===l?'':'alt'}" style="margin-bottom:8px" onclick="obLang('${l}')">
        ${window.ZB_T('lang_'+l,l)}${OB.lang===l?` ${icon('check',16)}`:''}</button>`).join('')}</div>
      </div><div class="ob-cta"><button class="btn" onclick="obStep(1)">${t('continue')}</button></div></div>`;
    return;
  }
  if(onboardStep==='ice'){
    ab.style.display='none';tb.style.display='none';sc.style.padding='';
    const done=ICE.qs.filter((q,i)=>(ICE.answers[i]||'').trim()).length;
    sc.innerHTML=`<div class="ob"><div>
      <h2>${t('ice_h')}</h2>
      <p class="sub">${t('ice_sub')}</p>
      ${ICE.qs.map((q,i)=>`<div class="q"><div class="t">${qText(q)}</div>
        <textarea class="input" rows="2" placeholder="${t('ice_answer_ph')}" oninput="iceAns(${i},this.value)">${ICE.answers[i]||''}</textarea></div>`).join('')}
      <p class="muted small" style="line-height:1.5">${t('ice_note')}</p>
      </div><div class="ob-cta">
      <button class="btn" onclick="iceSave()">${icon('check',18)} ${done===3?t('ice_save_bonus'):t('save')}</button>
      <button class="btn alt" style="margin-top:8px" onclick="iceSkip()">${t('skip_now')}</button>
    </div></div>`;
    return;
  }
  if(onboardStep==='awarded'){
    ab.style.display='none';tb.style.display='none';sc.style.padding='0';
    const first=(AWARD.first||'').trim();
    sc.innerHTML=`<div class="zb-award">
      <canvas id="cfCanvas"></canvas>
      <div class="glow"></div>
      <div class="body">
        <div class="zb-medal"><div class="ring"></div><div class="ring-dashed"></div><div class="disc">${icon('trophy',46)}</div></div>
        <div class="eyebrow">YOU'RE ALL SET</div>
        <h1>${first?`Nice work, ${first},`:'Nice work,'}<br>your first MeetUP awaits</h1>
        <p class="sub">Onboarding complete. Spin to get matched with a colleague and start earning.</p>
        <div class="zb-chip-award"><span class="puck">${icon('star',19)}</span>
          <span style="display:flex;align-items:baseline;gap:6px"><span class="n">${AWARD.points} points</span><span class="t">awarded to you!</span></span></div>
        ${AWARD.bonus?`<div class="zb-chip-award zb-chip-bonus"><span class="puck">${icon('chat',17)}</span>
          <span style="display:flex;align-items:baseline;gap:6px"><span class="n">+${AWARD.bonus} points</span><span class="t">for your icebreakers</span></span></div>`:''}
        <div class="balance">Balance: ${AWARD.balance} points</div>
      </div>
      <div class="foot">
        <button type="button" class="zb-primary-btn" onclick="awardToSpin()">${icon('refresh',20)}<span>Take me to Spin</span></button>
        <button type="button" class="zb-ghost-btn" onclick="zbCelebrate()">Celebrate again</button>
      </div></div>`;
    confettiInit();
    return;
  }
  if(onboardStep==='resetsent'){
    ab.style.display='';tb.style.display='';sc.style.padding='';
    ab.innerHTML=`<div class="brand" style="margin:0 auto">ZB <span>MeetUP</span></div>`;tb.innerHTML="";
    sc.innerHTML=`<div class="ob"><div>
      <div class="center" style="padding-top:14px">
        <div class="avatar lg" style="margin:0 auto 18px;background:var(--zb-blue)">${icon('mail',54)}</div>
        <h2>Check your email</h2>
        <p class="sub">If we know that address, a password-reset link is on its way${OB.email?` to <b>${OB.email}</b>`:''}.</p>
      </div>
      <div class="card"><div class="row" style="gap:10px;align-items:flex-start">
        <div class="nicon" style="background:var(--zb-blue-soft);flex:none">${icon('mail',20)}</div>
        <div class="small" style="line-height:1.5"><b>Can't see it?</b> Check your <b>junk</b> or <b>spam</b> folder — the
        message comes from <i>noreply@zb-meetup.firebaseapp.com</i>, which Outlook often files there the first time.
        Marking it "not junk" means the next one arrives properly.</div>
      </div></div>
      <p class="muted small center" style="margin-top:12px">Open the link, set a new password, then come back here and sign in.</p>
      </div><div class="ob-cta">
      <button class="btn" onclick="obGoSignIn()">${icon('check',18)} Sign in</button>
      <button class="btn alt" style="margin-top:8px" onclick="obForgot('resend')">Send the email again</button>
    </div></div>`;
    return;
  }
  if(onboardStep==='signin'){
    ab.style.display='';tb.style.display='';sc.style.padding='';
    ab.innerHTML=`<div class="brand" style="margin:0 auto">ZB <span>MeetUP</span></div>`;tb.innerHTML="";
    sc.innerHTML=`<div class="ob"><div>
      <button class="btn ghost sm" onclick="obBackWelcome()">${icon('back',16)} Back</button>
      <div class="center" style="padding-top:6px"><div class="avatar lg" style="margin:0 auto 16px;background:var(--zb-blue)">${icon('users',54)}</div><h2>Welcome back</h2><p class="sub">Sign in with your work email to pick up where you left off.</p></div>
      <div class="card"><label class="small" style="font-weight:700">Work email</label>
        <input class="input" id="ob-email" placeholder="you@zimmerbiomet.com" style="margin:6px 0 12px" value="${OB.email||''}">
        <label class="small" style="font-weight:700">Password</label>
        <input class="input" id="ob-pass" type="password" placeholder="Your password" style="margin-top:6px" onkeydown="if(event.key==='Enter')obSignIn()"></div>
      </div><div class="ob-cta">
      <button class="btn" onclick="obSignIn()">${icon('check',18)} Sign in</button>
      <button class="btn ghost" style="margin-top:2px;font-size:14px" onclick="obForgot()">Forgot password?</button>
      <div class="hr"></div>
      <p class="muted small center" style="margin:0 0 8px">New to ZB MeetUP?</p>
      <button class="btn alt" onclick="obGoCreate()">Create an account instead</button>
    </div></div>`;
    return;
  }
  ab.style.display='';tb.style.display='';sc.style.padding='';
  $("#appbar").innerHTML=`<div class="brand" style="margin:0 auto">ZB <span>MeetUP</span></div>`;$("#tabbar").innerHTML="";
  const dots=`<div class="steps">${[0,1,2,3,4].map(i=>`<i class="${i<=onboardStep?'on':''}"></i>`).join('')}</div>`;
  let body="",cta="";
  if(onboardStep===0){
    body=`<div class="center" style="padding-top:10px"><div class="avatar lg" style="margin:0 auto 16px;background:var(--zb-blue)">${icon('users',54)}</div><h2>Welcome to ZB MeetUP</h2><p class="sub">Meet a new colleague each day — coffee, a walk, or a quick call. Let's get you set up.</p></div>
      <div class="card"><label class="small" style="font-weight:700">Work email</label><input class="input" id="ob-email" placeholder="you@zimmerbiomet.com" style="margin:6px 0 12px" value="${OB.email}"><label class="small" style="font-weight:700">Password</label><input class="input" id="ob-pass" type="password" placeholder="At least 6 characters" style="margin-top:6px"></div>`;
    cta=`<button class="btn" onclick="obCreate()">Create account</button><button class="btn alt" style="margin-top:8px" onclick="obGoSignIn()">I already have an account — sign in</button><button class="btn ghost" style="margin-top:2px;font-size:14px" onclick="obForgot()">Forgot password?</button>`;
  } else if(onboardStep===1){
    body=`<h2>${t('ob_name_h')}</h2><p class="sub">${t('ob_name_sub')}</p><div class="card"><input class="input" id="ob-name" placeholder="${t('ob_name_ph')}" value="${OB.name||''}"></div>`;
    cta=`<button class="btn" onclick="obName()">${t('continue')}</button>`;
  } else if(onboardStep===2){
    body=`<h2>${t('ob_role_h')}</h2><p class="sub">${t('ob_role_sub')}</p><div class="card"><label class="small" style="font-weight:700">${t('ob_role_label')}</label><select class="input" id="ob-role" style="margin:6px 0 14px"><option value="" selected disabled>${t('ob_role_ph')}</option>${ROLES.map(r=>`<option>${r}</option>`).join('')}</select><label class="small" style="font-weight:700">${t('ob_wc_label')}</label><select class="input" id="ob-wc" style="margin-top:6px"><option value="warehouse">${t('ob_wc_warehouse')}</option><option value="on-site">${t('ob_wc_onsite')}</option><option value="partial" selected>${t('ob_wc_partial')}</option><option value="remote">${t('ob_wc_remote')}</option></select></div>`;
    cta=`<button class="btn" onclick="obWork()">${t('continue')}</button><p class="muted small center" style="margin-top:10px">Warehouse/floor colleagues are matched only with on-site colleagues.</p>`;
  } else if(onboardStep===3){
    body=`<h2>${t('ob_photo_h')}</h2><p class="sub">${t('ob_photo_sub')}</p>
      <div class="center"><span class="avatar lg" style="margin:0 auto;background:${OB.color}">${OB.photo?`<img src="${OB.photo}" style="width:100%;height:100%;object-fit:cover">`:inits(OB.name||'You')}</span></div>
      <button class="btn secondary" style="margin-top:16px" onclick="obPickPhoto()">${icon('camera',18)} ${OB.photo?t('ob_photo_change'):t('ob_photo_add')}</button>
      <div class="card" style="margin-top:12px"><span class="small" style="font-weight:700">${t('ob_colour')}</span><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px">${COLORS.map(c=>`<span onclick="obColor('${c}')" style="width:30px;height:30px;border-radius:50%;background:${c};cursor:pointer;border:${(OB.color===c&&!OB.photo)?'3px solid var(--ink)':'3px solid #fff'};box-shadow:0 0 0 1px var(--line)"></span>`).join('')}</div></div>`;
    cta=`<button class="btn" onclick="obStep(4)">${t('continue')}</button>`;
  } else {
    body=`<h2>${t('ob_consent_h')}</h2><p class="sub">${t('ob_consent_sub')}</p><div class="card small" style="line-height:1.5">${t('consent_intro')}
      <br><br>· ${t('consent_photos')}
      <br>· ${t('consent_answers')}
      <br>· ${t('consent_ice')}
      <br><br>${t('consent_delete')}</div><label class="row" style="gap:10px;cursor:pointer;margin-top:4px"><input type="checkbox" id="ob-consent" style="width:20px;height:20px"> <span class="small">${t('ob_consent_tick')}</span></label>`;
    cta=`<button class="btn" onclick="finishOnboard()">Enter ZB MeetUP</button>`;
  }
  $("#screen").innerHTML=`<div class="ob"><div>${dots}${body}</div><div class="ob-cta">${cta}</div></div>`;
}
window.obStep=n=>{onboardStep=n;renderOnboard();};
window.obLang=function(l){OB.lang=LANGS.indexOf(l)>-1?l:'en';renderOnboard();};
window.obColor=c=>{OB.color=c;OB.hasPhoto=false;OB.photo=null;renderOnboard();};
window.obPickPhoto=function(){pickImage(function(d){OB.photo=d;OB.hasPhoto=true;renderOnboard();});};
window.obCreate=function(){const e=$("#ob-email").value.trim(),p=$("#ob-pass").value;
  if(!e){toast("Please enter your email");return;}
  // ZB MeetUP is only for the two org domains — stop here rather than at the end of onboarding.
  if(!window.ZB_DOMAIN_OK(e)){toast("ZB MeetUP is for Zimmer Biomet colleagues — please use your "+window.ZB_DOMAIN_HINT()+" email");return;}
  if((p||'').length<6){toast("Password must be at least 6 characters");return;}
  OB.email=e;OB.pass=p;onboardStep='lang';renderOnboard();};   // language first (BRIEF-023)
window.obSignIn=async function(){const e=$("#ob-email").value.trim(),p=$("#ob-pass").value;if(!e||!p){toast("Enter your email and password");return;}try{await S.signIn(e,p);}catch(err){toast("Sign-in failed — check your details or tap Create account.");}};
window.obForgot=async function(resend){
  const e=resend?(OB.email||''):(($("#ob-email")||{}).value||'').trim();
  if(!e){toast("Enter your email first");return;}
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){toast("That doesn't look like an email address");return;}
  OB.email=e;
  try{ await S.resetPassword(e); }
  catch(err){ /* never reveal whether the address is registered — show the same screen either way */ }
  if(resend)toast("Sent again — check your junk folder too");
  onboardStep='resetsent';renderOnboard();
};
window.obName=function(){const n=$("#ob-name").value.trim();if(!n){toast("Please enter your name");return;}OB.name=n;onboardStep=2;renderOnboard();};
window.obWork=function(){const wc=$("#ob-wc").value,role=$("#ob-role").value;
  if(!role){toast("Please choose your role");return;}   // 108 options and no sensible default
  OB.role=role;
  if(wc==='warehouse'){OB.workClass='on-site';OB.floor=true;OB.dept='Distribution';}
  else{OB.workClass=wc;OB.floor=false;OB.dept=deptForRole(role);}
  onboardStep=3;renderOnboard();};
// Substring match, checked against the new GSCC-prefixed names. Order matters: QARA/quality is
// tested before the generic ones, and the \bIT\b word-boundary stops it catching "Litigation".
function deptForRole(r){
  r=r||'';
  if(/qara|quality|reg affairs/i.test(r))return 'Quality & Reg Affairs';
  if(/warehouse|kit|distribution|transport|freight|housekeep|inbound|outbound/i.test(r))return 'Distribution';
  if(/sales|sls|clinical|account manager/i.test(r))return 'Sales';
  if(/\bIT\b|software|helpdesk|ntwrk|network|euc|security & controls/i.test(r))return 'IT - EMEA';
  if(/experience|\bcx\b|customer operations/i.test(r))return 'Customer Experience';
  if(/pricing|tender|buying group/i.test(r))return 'Pricing & Tenders';
  if(/finance|tax|payroll|procure|sourcing|capex/i.test(r))return 'Finance & Procurement';
  if(/\bhr\b|legal|litigation|trade compl/i.test(r))return 'HR, Legal & Compliance';
  if(/marketing|mkt|meded|events|demos|workshops/i.test(r))return 'Marketing & Med Ed';
  if(/supply|inventory|planning|portfolio|master data|program|opex/i.test(r))return 'Supply Chain';
  return 'Zimmer Biomet';
}
window.finishOnboard=async function(){
  if(!$("#ob-consent").checked){toast("Please tick consent to continue");return;}
  authBusy=true;
  try{ if(!S.currentUser()) await S.signUp(OB.email,OB.pass); }
  catch(err){ authBusy=false; const code=(err&&err.code)||'';
    toast(/domain-not-allowed/.test(code)?"ZB MeetUP is for Zimmer Biomet colleagues — please use your "+window.ZB_DOMAIN_HINT()+" email"
      :/in-use/.test(code)?"That email already has an account — tap sign in.":"Couldn't create the account."); return; }
  await S.saveMe({name:OB.name,email:OB.email,lang:OB.lang||'en',color:OB.color,photo:OB.photo||null,workClass:OB.workClass,floor:OB.floor,role:OB.role,dept:OB.dept,consentAt:Date.now()});
  await S.welcome();
  authBusy=false;
  // The award screen is the last step of onboarding. It REPORTS the bonus the store already
  // granted — per the handoff, this screen is not the source of truth for the award — then
  // routes on to Spin.
  await refresh();
  iceStart('onboard');          // icebreakers first, so the award screen shows the real balance
};

/* ---------------- SPIN ---------------- */
// Resolves to --btn-grad in css/styles.css — one definition for every primary button.
const DARKBTN="var(--btn-grad)";
const SHEEN=`<span style="position:absolute;top:-40%;bottom:-40%;left:0;width:46%;background:radial-gradient(closest-side,rgba(78,180,255,.34),rgba(78,180,255,0) 70%);filter:blur(6px);animation:sheen 5.2s ease-in-out infinite;pointer-events:none;"></span>`;
function viewSpin(){ return spinLocked()?viewCountdown():spinScreenHTML(); }

// Pills are ambience: REAL signed-up colleagues only (photo, else initials), newest first,
// capped at 12. Before real signups exist we show one or three neutral initials-only holders —
// never invented people (same authenticity rule as the demo-seed fix, BRIEF-016).
const PILL_TINTS=['#4E80AE','#5E93B6','#6E9BC4','#7FA8CC'];
function pillPeople(){
  const tint=id=>{let h=0;const str=String(id||'');for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))>>>0;return PILL_TINTS[h%PILL_TINTS.length];};
  const real=(C.users||[]).filter(u=>u&&u.name).slice();
  real.sort((a,b)=>(b.createdAt&&b.createdAt.seconds||0)-(a.createdAt&&a.createdAt.seconds||0));
  const list=real.slice(0,12).map(u=>({name:(u.first||(u.name||'').split(' ')[0]||''),photo:u.photo||null,tint:tint(u.uid),ini:inits(u.name)}));
  if(list.length)return list;
  // holding state — no names, no photos, no invented colleagues
  return [{holder:true,tint:PILL_TINTS[0],ini:''},{holder:true,tint:PILL_TINTS[2],ini:''},{holder:true,tint:PILL_TINTS[3],ini:''}];
}
function pillHTML(p,dir,dur,delay,alpha){
  const av=p.photo?`<img class="av" src="${p.photo}" alt="">`
    :`<span class="av" style="background:${p.tint}">${p.holder?'':p.ini}</span>`;
  return `<div class="zb-pill" style="background:rgba(255,255,255,${alpha});animation:${dir} ${dur}s ${delay}s linear infinite">
    ${av}${p.holder?'':`<span class="nm">${p.name}</span>`}</div>`;
}
// Two pills per lane, offset exactly half a cycle, so their separation is constant and they
// can never collide — the handoff's collision rule. Lanes scale down with the signup count.
const LANES=[['zbDriftR',36,-3,-21,.26,.2],['zbDriftL',44,-8,-30,.22,.26],['zbDriftR',52,-14,-40,.24,.2],
             ['zbDriftL',40,-5,-25,.2,.26],['zbDriftR',48,-11,-35,.26,.22],['zbDriftL',56,-19,-47,.22,.24]];
function laneBand(cls,laneIdx,people){
  if(!laneIdx.length)return '';
  return `<div class="band ${cls}" aria-hidden="true">${laneIdx.map(i=>{
    const [dir,dur,d1,d2,a1,a2]=LANES[i];
    const p1=people[(i*2)%people.length],p2=people[(i*2+1)%people.length];
    const two=people.length>1&&p1!==p2;
    return `<div class="lane">${pillHTML(p1,dir,dur,d1,a1)}${two?pillHTML(p2,dir,dur,d2,a2):''}</div>`;
  }).join('')}</div>`;
}
function viewCountdown(){
  const t=unlockParts(), people=pillPeople();
  // fewer signups -> fewer lanes, rather than repeating a name within a lane
  const laneCount=people.length>=6?6:(people.length>=3?4:2);
  const top=[0,1,2].slice(0,Math.ceil(laneCount/2)), bot=[3,4,5].slice(0,Math.floor(laneCount/2));
  return `<div class="zb-cd">
    <div class="behind" aria-hidden="true" inert>${spinScreenHTML()}</div>
    <div class="scrim"></div>
    ${laneBand('top',top,people)}
    <div class="stage">
      <div class="zb-cd-card">
        <img class="logo" src="assets/zimmer-biomet-logo.svg" alt="Zimmer Biomet">
        <div class="zb-clock"><div class="ring"></div><div class="ring-dashed"></div><div class="disc">${icon('clock',32)}</div></div>
        <div class="zb-cd-eyebrow"><span class="dot"></span>COUNTDOWN TO LAUNCH</div>
        <h1>Get ready to spin</h1>
        <div class="zb-grid" role="timer" aria-live="off" aria-label="Time until spinning opens">
          <div class="zb-tile"><div class="v" id="cdD">${t.d}</div><div class="l">Days</div></div>
          <div class="zb-tile"><div class="v" id="cdH">${t.h}</div><div class="l">Hrs</div></div>
          <div class="zb-tile"><div class="v" id="cdM">${t.m}</div><div class="l">Min</div></div>
          <div class="zb-tile sec"><div class="v" id="cdS">${t.s}</div><div class="l">Sec</div></div>
        </div>
        <p class="zb-cd-sub"><b>Spinning opens Wednesday 16 September at 09:00.</b> You're all set — explore the app and we'll see you then.</p>
      </div>
      <div class="zb-cd-foot">
        <button type="button" class="zb-how" onclick="go('howitworks')">${icon('help',17)}<span>How it works</span></button>
        <div class="zb-tz" id="cdTz">${t.open?'Spinning is open — refresh':'Times shown for 09:00 Amsterdam'}</div>
      </div>
    </div>
    ${laneBand('bot',bot,people)}
  </div>`;
}
function spinScreenHTML(){
  const idle=!current;
  const rule=C.me.floor?"You're a warehouse/floor colleague, so you'll match with other on-site colleagues.":"You're desk-based, so you can match with on-site and remote colleagues.";
  const faceInner=idle?`<span style="display:inline-flex;animation:ringSpin 3.6s linear infinite">${spinnerIcon(54)}</span>`:(current.photo?`<img src="${current.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:999px">`:inits(current.name));
  const faceBg=idle?"#3E6EA8":current.color;
  return `<div style="display:flex;flex-direction:column;min-height:calc(100vh - 150px)">
    <div style="text-align:center;font-size:11.5px;font-weight:700;letter-spacing:1.6px;color:#7C8798;">${t('spin_today')}</div>
    <div style="text-align:center;font-size:26px;line-height:1.2;font-weight:700;letter-spacing:-.5px;margin-top:8px;">${idle?t('spin_idle_h'):t('spin_matched_h')}</div>
    <div style="display:flex;justify-content:center;margin:22px 0 -86px;position:relative;z-index:5;"><div style="position:relative;width:172px;height:172px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;inset:0;border-radius:999px;border:2px dashed #A9C6DC;animation:ringSpin 26s linear infinite;"></div><div id="spinFace" style="width:112px;height:112px;border-radius:999px;border:3px solid #F5F7FA;box-shadow:0 6px 20px rgba(16,24,40,.18);display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:700;color:#fff;background-color:${faceBg};">${faceInner}</div></div></div>
    <div style="position:relative;overflow:hidden;flex:1;display:flex;flex-direction:column;border-radius:20px;padding:100px 20px 18px;background:linear-gradient(170deg,#3E6EA8 0%,#2F5F9E 42%,#20416F 100%);box-shadow:var(--shadow-lg);color:#fff;min-height:520px;">
      ${idle?`<div style="text-align:center;font-size:14.5px;line-height:1.5;color:rgba(255,255,255,.82);margin:0 auto;max-width:300px;">${t('spin_idle_sub')}</div>`:`<div style="margin-top:18px;background:#fff;color:var(--ink);border-radius:16px;padding:16px;box-shadow:0 8px 30px rgba(16,24,40,.18);animation:popIn .34s cubic-bezier(.2,.9,.3,1.2) both;"><div style="display:flex;align-items:center;gap:12px;"><div style="width:44px;height:44px;flex:none;border-radius:999px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;background:${current.color};">${current.photo?`<img src="${current.photo}" style="width:100%;height:100%;object-fit:cover">`:inits(current.name)}</div><div style="min-width:0;"><div style="font-size:16px;font-weight:650;">${current.name}</div><div style="font-size:12.5px;color:var(--muted);margin-top:2px;">${current.role} · ${current.dept}</div><div style="margin-top:4px">${langBadge(current.lang)}</div></div><div style="margin-left:auto;flex:none;padding:4px 9px;border-radius:999px;background:#F5F7FA;border:1px solid #ECEFF3;font-size:11px;font-weight:600;color:var(--muted);">${wcLabel(current.workClass)}</div></div><div style="margin-top:12px;padding-top:12px;border-top:1px solid #ECEFF3;font-size:13.5px;font-weight:600;color:var(--zb-blue);">${t('spin_suggested')} ${current._type}</div></div>`}
      <div style="flex:1;min-height:14px;"></div>${reelHTML()}
    </div>
    ${idle?`<button type="button" onclick="doSpin()" style="position:relative;overflow:hidden;margin-top:14px;width:100%;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:19px;border-radius:999px;background:${DARKBTN};color:#fff;font-family:inherit;font-size:17px;font-weight:600;animation:btnGlow 4.6s ease-in-out infinite;">${SHEEN}<span id="spinLabel" style="position:relative;">${t('spin_btn')}${C.spin.freeSpin?'':` (−1 pt)`}</span></button>`:`<div style="margin-top:14px;display:flex;flex-direction:column;gap:9px;"><button type="button" onclick="sendReq()" style="position:relative;overflow:hidden;width:100%;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:19px;border-radius:999px;background:${DARKBTN};color:#fff;font-family:inherit;font-size:17px;font-weight:600;animation:btnGlow 4.6s ease-in-out infinite;">${SHEEN}<span style="position:relative;">${t('spin_send_to')} ${current.first}</span></button><button type="button" onclick="doSpin()" ${(!C.spin.freeSpin&&C.spin.points<1)?'disabled':''} style="width:100%;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;padding:13px;border-radius:12px;background:#fff;border:1px solid #ECEFF3;color:var(--muted);font-family:inherit;font-size:14px;font-weight:600;${(!C.spin.freeSpin&&C.spin.points<1)?'opacity:.5;cursor:not-allowed;':''}">${icon('refresh',15)}<span>${C.spin.freeSpin?t('spin_again_free'):t('spin_again_cost')}</span></button><div class="muted small center">${C.spin.freeSpin?t('spin_free_line'):(C.spin.points<1?t('spin_out'):`You have ${C.spin.points} point${C.spin.points===1?'':'s'}. Meeting someone earns them back.`)}</div></div>`}
    <div style="margin:14px 2px 4px;display:flex;align-items:flex-start;gap:9px;color:var(--muted);font-size:12.5px;line-height:1.45;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9AA3AF" stroke-width="1.9" stroke-linecap="round" style="flex:none;margin-top:1px;"><circle cx="12" cy="12" r="8.6"></circle><path d="M12 11v5.2M12 7.9v.1"></path></svg><span>${rule}</span></div>
  </div>`;
}
window.doSpin=async function(){
  // The gate belongs on the action too: the blurred spin screen behind the countdown is
  // decorative, but a keyboard user could otherwise still reach its button.
  if(spinLocked()){toast("Spinning opens Wednesday 16 September at 09:00");return;}
  const pool=eligible();if(!pool.length){toast("No one left to match!");return;}
  // Every spin is priced by the store: a free spin (first of the day, or granted by sending a
  // request) costs nothing, otherwise 1 point. At 0 points it is blocked rather than going negative.
  const paid=await S.paySpin();
  if(!paid.ok){toast("You're out of points for now — send a request, or earn points by meeting someone");await refresh();return;}
  C.spin=await S.spinState();if(C.me)C.me.points=paid.points;
  if(!paid.free)renderAppbar();
  const face=$("#spinFace"),lbl=$("#spinLabel");if(lbl)lbl.textContent="Finding your match…";
  let ticks=0,total=18+Math.floor(Math.random()*6),delay=45;
  (function step(){const p=pool[Math.floor(Math.random()*pool.length)];if(face){face.textContent=inits(p.name);face.style.backgroundColor=p.color;}ticks++;if(ticks>=total){p._type=meetupType(p);current=p;render();return;}if(ticks>total-6)delay+=40;setTimeout(step,delay);})();
};
// skip() is gone with BRIEF-017: it returned to idle, which made the next spin look like a
// first-of-day free spin. The only actions on a candidate are now Send request and Spin again.
window.sendReq=async function(){if(spinLocked()){toast("Spinning opens Wednesday 16 September at 09:00");return;}
  const p=current;
  const qs=pickQuestions();
  if(!qs.length){toast("No discussion questions in the bank yet — an admin needs to add some");return;}
  current=null;
  await S.createMatch(p,p._type,qs);
  await S.grantFreeSpin();                      // chaining real meetups costs nothing
  toast("Request sent to "+p.first+" — your next spin is free");await refresh();};
window.acceptReq=async function(id){await S.acceptMatch(id);toast("Matched! Plan your meetup");await refresh();};
window.declineReq=async function(id){await S.declineMatch(id);await refresh();};

/* ---------------- MEETUPS ---------------- */
function viewMeetups(){
  const act=activeMatches(),hist=history();
  if(!act.length&&!hist.length)return `<h2>My meetups</h2><p class="sub">Your matches will appear here.</p><div class="card center muted">No meetups yet — head to Spin to find your first match.</div>`;
  const totalUnread=act.reduce((s,m)=>s+(m.unread||0),0);
  let h=`<h2>My meetups</h2><p class="sub">Message, meet, then log it for points.</p>`;
  if(act.some(m=>m.status==='active'))h+=`<div class="card mailbox" onclick="go('messages')"><div class="nicon">${icon('chat',20)}</div><div style="flex:1"><div style="font-weight:700">${t('msgs_h')}</div><div class="muted small">${t('msgs_card_sub')}</div></div>${totalUnread?`<span class="badge">${t('msgs_new',{n:totalUnread})}</span>`:`<span style="color:var(--muted);transform:rotate(180deg)">${icon('back',18)}</span>`}</div>`;
  act.forEach(m=>{
    if(m.status==='requested'&&m.incoming)h+=`<div class="card"><div class="row"><div class="nicon" style="background:var(--zb-blue-soft)">${icon('users',20)}</div><div style="flex:1"><div style="font-weight:700">${m.person.name} wants to meet</div><div class="muted small">${m.person.role} · suggested ${m.type}</div></div></div><div class="row" style="gap:10px;margin-top:12px"><button class="btn sm" style="flex:1;justify-content:center" onclick="acceptReq('${m.id}')">${icon('check',16)} Accept</button><button class="btn ghost sm" style="flex:1;justify-content:center" onclick="declineReq('${m.id}')">${icon('x',16)} Decline</button></div></div>`;
    else if(m.status==='requested')h+=`<div class="card"><div class="row between"><div class="row">${av(m.person)}<div><div style="font-weight:700">${m.person.name}</div><div class="muted small">${m.person.role}</div></div></div><span class="chip grey">Waiting…</span></div></div>`;
    else{const done=canComplete(m);h+=`<div class="card"><div class="row between"><div class="row">${av(m.person)}<div><div style="font-weight:700">${m.person.name}</div><div class="muted small">${m.person.dept}</div></div></div><span class="chip ${done?'good':''}">${done?'Ready':'Active'}</span></div><div class="muted small" style="margin:10px 0 4px">Meetup: <b>${m.type}</b></div><button class="btn ${done?'secondary':''} sm" style="width:100%;margin-top:8px;justify-content:center" onclick="go('meet:${m.id}')">${done?'Review & complete':'Open shared space'}</button></div>`;}
  });
  if(hist.length){h+=`<div class="hr"></div><p class="sub" style="font-weight:700;color:var(--ink)">Completed</p>`;hist.forEach(m=>{h+=`<div class="card" style="cursor:pointer" onclick="go('recap:${m.id}')"><div class="row between"><div class="row">${av(m.person,'sm')}<div><div style="font-weight:600">${m.person.name}</div><div class="muted small">${m.type}${m.otherCompleted?'':` · waiting on ${m.person.first}`}</div></div></div><div class="row" style="gap:8px"><span class="chip good">+${myPoints(m)} pts</span>${icon('back',16)}</div></div></div>`;});}
  return h;
}
// A partner's icebreakers, shown in both the active shared space and the completed recap so the
// two cannot drift. Read from the live user list first; the match's profile snapshot is the
// fallback, so answers filled in after the match was created still appear.
function talkingPointsHTML(m){
  const fresh=(C.users||[]).filter(u=>u&&u.uid===m.person.uid)[0];
  const ib=((fresh&&fresh.icebreakers)||m.person.icebreakers||[]).filter(x=>x&&(x.answer||'').trim());
  if(!ib.length)return '';
  return `<div class="card talk"><div class="row between"><div class="lead"><span class="nicon">${icon('chat',18)}</span><b>${t('meet_talking')}</b></div><span class="chip">${m.person.first} ${langBadge((fresh&&fresh.lang)||m.person.lang)}</span></div>
    <p class="muted small" style="margin:8px 0 2px">${m.person.first}'s icebreakers — a head start on the conversation.</p>
    ${ib.map(x=>`<div class="q"><div class="t">${qText({id:x.id,text:x.question},myLang())}</div><div class="small ans">${x.answer}</div></div>`).join('')}</div>`;
}
function viewMeet(id){
  const m=C.matches.find(x=>x.id===id&&!x.completed);if(!m)return `<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button><div class="card muted">You've finished your part of this meetup.</div><button class="btn secondary" onclick="go('recap:${id}')">${icon('check',18)} View the recap</button>`;
  const last=m.messages.length?m.messages[m.messages.length-1]:null;
  const mp=typeof m.photo==='string'?m.photo:null;   // the shared meetup photo (base64), if set
  return `<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button><h2 style="margin-top:6px">${t('meet_with')} ${m.person.first}</h2><p class="sub">${t('meet_shared')}</p>
   <div class="meet-hero"><div class="row">${av(m.person)}<div><div style="font-weight:800">${m.person.name}</div><div class="muted small">${m.person.role} · ${wcLabel(m.person.workClass)}</div></div></div><div class="small" style="margin-top:10px;opacity:.9">You both accepted — suggested: <b>${m.type}</b>. Plan a time and place together.</div><button class="btn white" style="margin-top:14px" onclick="go('thread:${m.id}')">${icon('chat',18)} ${t('meet_plan')}${m.unread?` &nbsp;<span class="badge">${m.unread}</span>`:''}</button>${last?`<div class="small" style="margin-top:10px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Last message: ${(last.by==='me'?'You: ':'')+last.text}</div>`:''}</div>
   ${talkingPointsHTML(m)}
   <p class="muted small" style="margin:2px 2px 10px;line-height:1.5">${t('meet_log')}</p>
   <div class="card"><div class="row between"><b>${t('meet_photo_h')}</b><span class="chip ${m.photoAwarded?'good':'grey'}">${m.photoAwarded?'+5 earned':'+5 pts'}</span></div><p class="muted small" style="margin:8px 0 10px">${t('meet_photo_sub')}</p>${m.photo?`${mp?`<img src="${mp}" alt="Your meetup photo" style="display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;">`:`<div class="wall-photo" style="height:80px;background:linear-gradient(135deg,${C.me.color},${m.person.color})">You &amp; ${m.person.first}</div>`}<button class="btn ghost sm" style="width:100%;justify-content:center;margin-top:10px" onclick="addPhoto('${m.id}')">${icon('camera',18)} Change photo</button>`:`<button class="btn secondary sm" style="width:100%;justify-content:center" onclick="addPhoto('${m.id}')">${icon('camera',18)} ${t('meet_photo_add')}</button>`}</div>
   <div class="card"><div class="row between"><b>${t('meet_q_h')}</b><span class="chip ${myAnswersDone(m)?'good':'grey'}">${myAnswersDone(m)?'+5':'+5 pts'}</span></div>${m.questions.map((q,i)=>`<div class="q"><div class="t">${qText(q)}${q.tier===1?`<span class="tierpill">${t('key_idea')}</span>`:''}</div><textarea class="input" rows="2" oninput="ans('${m.id}',${i},this.value)" placeholder="${t('q_answer_ph')}">${m.answers[i]||''}</textarea></div>`).join('')}<p class="muted small">${t('meet_q_private')}</p></div>
   <button class="btn" id="completeBtn" onclick="complete('${m.id}')" ${canComplete(m)?'':'disabled'}>${icon('check',18)} ${t('meet_complete')}</button>
   <p class="muted small center" style="margin-top:8px">${canComplete(m)?t('meet_complete_ok'):t('meet_complete_hint')}</p>
   <p class="muted small center" style="margin-top:6px">${m.otherCompleted?t('meet_partner_done',{name:m.person.first}):t('meet_waiting',{name:m.person.first})}</p>`;
}
function viewRecap(id){
  const m=C.matches.find(x=>x.id===id);
  if(!m)return `<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button><div class="card muted">Meetup not found.</div>`;
  const mp=typeof m.photo==='string'?m.photo:null;
  const sc=typeToScene(m.type);
  return `<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button>
   <h2 style="margin-top:6px">Meetup with ${m.person.first}</h2><p class="sub">${m.type}${m.completed?' · your part is complete':''}</p>
   <div class="card"><div class="row between"><div class="row">${av(m.person)}<div><div style="font-weight:700">${m.person.name}</div><div class="muted small">${m.person.role} · ${m.person.dept}</div></div></div><span class="chip good">+${myPoints(m)} pts</span></div>
     <div class="muted small" style="margin-top:10px">${m.photoAwarded?'Shared photo +5':'No photo — no photo points'} · ${m.completed?'Your questions +5':'Questions not completed'}</div>
     <div class="muted small" style="margin-top:4px">${m.otherCompleted?`${m.person.first} has finished their part too.`:`${m.person.first} hasn't finished their part yet.`}</div></div>
   <div class="card"><b>${t('recap_photo')}</b><div style="margin-top:10px">${sceneSquare(sc,'',mp)}</div>${mp?'':`<p class="muted small" style="margin-top:8px">${t('recap_no_photo')}</p>`}
     <p class="muted small" style="margin:10px 0 8px">${t('recap_photo_note')}</p>
     <button class="btn secondary sm" style="width:100%;justify-content:center" onclick="addPhoto('${m.id}')">${icon('camera',16)} ${mp?'Change photo':'Add a photo'}</button></div>
   ${talkingPointsHTML(m)}
   <div class="card"><b>${t('recap_your_answers')}</b><p class="muted small" style="margin:6px 0 10px">${t('recap_private')}</p>
     ${m.questions.map((q,i)=>`<div class="q"><div class="t">${qText(q)}${q.tier===1?`<span class="tierpill">${t('key_idea')}</span>`:''}</div><div class="small" style="margin-top:6px;white-space:pre-wrap">${(m.answers[i]||'').trim()||('<span class="muted">'+t('recap_not_answered')+'</span>')}</div></div>`).join('')}</div>`;
}
function viewMessages(){
  const chats=activeMatches().filter(m=>m.status==='active');
  if(!chats.length)return `<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button><h2 style="margin-top:6px">${t('msgs_h')}</h2><p class="sub">${t('msgs_sub')}</p><div class="card center muted">${t('msgs_none')}</div>`;
  let h=`<button class="btn ghost sm" onclick="go('meetups')">${icon('back',16)} Back</button><h2 style="margin-top:6px">${t('msgs_h')}</h2><p class="sub">${t('msgs_convos')}</p><div class="card" style="padding:4px 14px">`;
  chats.forEach(m=>{const last=m.messages.length?m.messages[m.messages.length-1]:null;h+=`<div class="notif" onclick="go('thread:${m.id}')">${av(m.person,'sm')}<div style="flex:1;min-width:0"><div class="row between"><b>${m.person.first}</b>${m.unread?`<span class="badge">${m.unread}</span>`:''}</div><div class="muted small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${last?(last.by==='me'?'You: ':'')+last.text:t('msgs_say_hi')}</div></div></div>`;});
  return h+`</div>`;
}
function viewThread(id){
  const m=C.matches.find(x=>x.id===id);if(!m)return `<button class="btn ghost sm" onclick="go('messages')">${icon('back',16)} Back</button><div class="card muted">Chat unavailable.</div>`;
  if(m.unread){m.unread=0;S.clearMatchUnread&&S.clearMatchUnread(id);}
  const thread=m.messages.map(x=>`<div class="msg ${x.by}">${x.text}</div>`).join('')||`<div class="muted small center" style="padding:16px">Say hi and pick a time to meet.</div>`;
  return `<button class="btn ghost sm" onclick="go('meet:${m.id}')">${icon('back',16)} ${t('back_to_meetup')}</button><div class="row" style="margin:10px 2px 12px">${av(m.person)}<div><div style="font-weight:800">${m.person.name}</div><div class="muted small">${m.type}</div></div></div><div class="card threadcard"><div class="thread">${thread}</div><div class="row" style="gap:8px;margin-top:12px"><input class="input" id="msgIn" placeholder="${t('msgs_ph',{name:m.person.first})}" onkeydown="if(event.key==='Enter')sendMsg('${m.id}')"><button class="btn sm" onclick="sendMsg('${m.id}')">${icon('send',17)}</button></div></div>`;
}
window.sendMsg=async function(id){const inp=$("#msgIn");const v=(inp.value||'').trim();if(!v)return;await S.sendMessage(id,v);await refresh();};
function refreshCompleteBtn(m){const b=document.getElementById('completeBtn');if(b)b.disabled=!canComplete(m);}
window.addPhoto=function(id){const had=!!(C.matches.find(x=>x.id===id)||{}).photo;
  const m=C.matches.find(x=>x.id===id);
  const post=m?{names:(C.me.name||'You')+' & '+m.person.first,scene:typeToScene(m.type)}:null;
  return new Promise(function(res){pickImage(async function(d){await S.setMatchPhoto(id,d,post);toast(had?"Photo updated":"Photo added +5 pts");await refresh();res(true);},MEETUP_PX);});};
window.ans=async function(id,i,v){const m=C.matches.find(x=>x.id===id);if(!m)return;m.answers[i]=v;await S.setMatchAnswers(id,m.answers);refreshCompleteBtn(m);};
window.complete=async function(id){const m=C.matches.find(x=>x.id===id);if(!m||!canComplete(m))return;
  await S.completeMatch(id,{names:(C.me.name||'You')+' & '+m.person.first,scene:typeToScene(m.type),photo:typeof m.photo==='string'?m.photo:null});
  toast(m.photoAwarded?"Your part is complete! +5 pts (10 in total)":"Your part is complete! +5 pts");view="meetups";await refresh();};

/* ---------------- WALL ---------------- */
function viewWall(){
  const real=C.posts.filter(w=>!w.seed),seeds=C.posts.filter(w=>w.seed);
  const posts=[...real,...seeds].slice(0,Math.max(6,real.length));
  const motd=posts[0]||C.posts[0];const ms=SCENES[motd.scene]||SCENES.coffee;
  let h=`<h2>${t('wall_h')}</h2><p class="sub">${t('wall_sub')}</p><div class="card" style="background:linear-gradient(135deg,var(--zb-blue),var(--zb-blue-dark));color:#fff;border:none"><span class="chip gold" style="background:rgba(255,255,255,.2);color:#fff">${icon('trophy',14)} ${t('wall_motd')}</span><div style="font-weight:800;font-size:17px;margin-top:10px">${motd.names}</div><div class="small" style="opacity:.85">${ms.chip}</div></div>`;
  posts.forEach(w=>{const s=SCENES[w.scene]||SCENES.coffee;h+=`<div class="card"><div class="row" style="margin-bottom:10px"><span class="avatar sm" style="background:${s.c1}">${initialsPair(w.names)}</span><div class="small"><b>${w.names}</b>${w.seed?'':' · <span style="color:var(--good);font-weight:700">'+t('wall_just_now')+'</span>'}</div></div>${sceneSquare(w.scene,s.chip,w.photo)}<div class="row" style="gap:16px;margin-top:10px"><button class="iconbtn ${w.liked?'liked':''}" onclick="like('${w.id}')">${icon('heart',19,w.liked)} ${w.hearts}</button><span class="iconbtn">${icon('chat',18)} ${w.comments.length}</span></div>${w.comments.map(c=>`<div class="comment"><b>${commentAuthor(c)}</b> ${mention(c.text)}</div>`).join('')}<div class="row" style="gap:8px;margin-top:8px"><input class="input" id="cin${w.id}" placeholder="${t('wall_comment_ph')}" onkeydown="if(event.key==='Enter')addComment('${w.id}')"><button class="btn sm secondary" onclick="addComment('${w.id}')">${icon('send',16)}</button></div></div>`;});
  return h;
}
window.like=async function(id){await S.heartPost(id);await refresh();};
window.addComment=async function(id){const inp=$("#cin"+id);const v=(inp.value||'').trim();if(!v)return;await S.commentPost(id,v);await refresh();};

/* ---------------- RANKS ---------------- */
function viewRanks(){
  let h=`<h2>${t('ranks_h')}</h2><p class="sub">${t('ranks_sub')}</p><div class="card prize"><span class="chip" style="background:rgba(255,255,255,.2);color:#fff">${icon('money',14)} ${t('prize_chip')}</span><p class="small" style="margin:11px 0 0;line-height:1.5;opacity:.96">Every meetup earns you points — but there's more. A panel of <b>CB management judges</b> will pick the best <b>idea</b> shared in the discussions. Win <b>€250 for the best idea</b>, <b>€250</b> for topping the leaderboard, or <b>€150</b> as runner-up. Get to know your colleagues, brainstorm some fun ideas — and help make an impact on people's lives.</p><div class="prizerow"><div class="prizecard"><div class="pk">${t('prize_best')}</div><div class="pv">€250</div></div><div class="prizecard"><div class="pk">${t('prize_top')}</div><div class="pv">€250</div></div><div class="prizecard"><div class="pk">${t('prize_runner')}</div><div class="pv">€150</div></div></div><button type="button" class="btn white sm" style="width:100%;justify-content:center;margin-top:12px" onclick="go('howitworks')">${icon('help',16)} ${t('hiw_h')}</button></div><div class="card">`;
  C.leaderboard.slice(0,15).forEach((r,i)=>{h+=`<div class="rankrow ${r.me?'me':''}"><div class="n">${i+1}</div><span class="avatar sm" style="background:${r.color}">${r.photo?`<img src="${r.photo}" style="width:100%;height:100%;object-fit:cover">`:inits(r.name)}</span><div class="nm">${r.name}</div><div class="p">${r.points}</div></div>`;});
  return h+`</div>`;
}

/* ---------------- PROFILE ---------------- */
function viewProfile(){
  const me=C.me;
  return `<h2>You</h2><p class="sub">Manage your profile and account.</p><div class="card center"><span class="avatar lg" style="margin:0 auto;background:${me.color}">${me.photo?`<img src="${me.photo}" style="width:100%;height:100%;object-fit:cover">`:inits(me.name||'You')}</span><div style="font-weight:800;font-size:18px;margin-top:12px">${me.name||'You'}</div><div class="muted small">${me.role} · ${me.dept}</div><div class="muted small">${me.email||''}</div><div style="margin-top:6px">${langBadge(me.lang)}</div><div style="margin-top:10px"><span class="chip">${me.points} pts</span> <span class="chip grey">${history().length} meetups</span></div></div>
   <button class="btn secondary" onclick="go('editprofile')">${icon('pencil',18)} Edit profile &amp; avatar</button>
   <button class="btn secondary" style="margin-top:10px" onclick="go('bug')">${icon('bug',18)} Report a bug</button>
   ${C.admin?`<button class="btn secondary" style="margin-top:10px" onclick="go('admin')">${icon('chart',18)} Admin dashboard</button>`:''}
   ${(function(){
     const ib=(C.me&&C.me.icebreakers)||[];
     const top='style="margin-top:14px"';
     const answered=ib.filter(x=>x&&(x.answer||'').trim()).length;
     if(answered>=3&&C.me&&C.me.icebreakerBonusGranted)
       return `<div class="card" ${top}><div class="row between"><b>${t('ice_yours')}</b><span class="chip good">+10 earned</span></div>
         <p class="muted small" style="margin:8px 0 10px">${t('ice_yours_sub')}</p>
         ${ib.map(x=>`<div class="q"><div class="t">${x.question||''}</div><div class="small" style="margin-top:4px;white-space:pre-wrap">${x.answer}</div></div>`).join('')}
         <button class="btn ghost sm" style="width:100%;justify-content:center" onclick="iceFromProfile()">${icon('pencil',15)} ${t('ice_edit')}</button></div>`;
     return `<div class="card" ${top}><div class="row between"><b>${t('ice_break_h')}</b><span class="chip">+10 pts</span></div>
       <p class="muted small" style="margin:8px 0 10px">${t('ice_break_sub')}</p>
       <button class="btn" style="width:100%;justify-content:center" onclick="iceFromProfile()">${icon('chat',17)} ${answered?t('ice_finish'):t('ice_answer3')}</button></div>`;
   })()}
   ${buildStampHTML()}
   <div class="hr"></div><button class="btn ghost" onclick="signOut()">${icon('signout',18)} Sign out</button><button class="btn danger" style="margin-top:10px" onclick="askDelete()">${icon('trash',18)} Delete my account</button><p class="muted small center" style="margin-top:8px">Deleting removes your profile, photos and answers (GDPR).</p>`;
}
function viewEditProfile(){
  const me=C.me;
  return `<button class="btn ghost sm" onclick="go('profile')">${icon('back',16)} Back</button><h2 style="margin-top:6px">Edit profile</h2><p class="sub">Update how colleagues see you.</p><div class="center"><span class="avatar lg" style="margin:0 auto;background:${me.color}">${me.photo?`<img src="${me.photo}" style="width:100%;height:100%;object-fit:cover">`:inits(me.name||'You')}</span></div><button class="btn secondary" style="margin-top:14px" onclick="epPickPhoto()">${icon('camera',18)} ${me.photo?'Change photo':'Add a photo'}</button><div class="card" style="margin-top:12px"><span class="small" style="font-weight:700">${t('ob_colour')}</span><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px">${COLORS.map(c=>`<span onclick="epColor('${c}')" style="width:30px;height:30px;border-radius:50%;background:${c};cursor:pointer;border:${me.color===c?'3px solid var(--ink)':'3px solid #fff'};box-shadow:0 0 0 1px var(--line)"></span>`).join('')}</div></div><div class="card"><label class="small" style="font-weight:700">Name</label><input class="input" id="ep-name" value="${me.name}" style="margin-top:6px">
   <label class="small" style="font-weight:700;display:block;margin-top:14px">${t('lang_label')}</label>
   <select class="input" id="ep-lang" style="margin-top:6px" onchange="epLang(this.value)">${LANGS.map(l=>`<option value="${l}" ${(me.lang||'en')===l?'selected':''}>${window.ZB_T('lang_'+l,l)}</option>`).join('')}</select></div><button class="btn" onclick="saveProfile()">${icon('check',18)} Save changes</button>`;
}
// Changing language re-renders the app immediately in the new one.
window.epLang=async function(l){ await S.saveMe({lang:LANGS.indexOf(l)>-1?l:'en'}); await refresh(); toast(t('lang_label')); };
window.epColor=async function(c){await S.saveMe({color:c,photo:null});await refresh();};
window.epPickPhoto=function(){pickImage(async function(d){await S.saveMe({photo:d});await refresh();toast("Photo updated");});};
window.saveProfile=async function(){const n=$("#ep-name").value.trim();await S.saveMe(n?{name:n}:{});toast("Profile saved");view='profile';await refresh();};
window.signOut=async function(){toast("Signed out");await S.signOut();current=null;OB={email:"",pass:"",name:"",color:"#0079BD",hasPhoto:false,workClass:"partial",floor:false,role:"IT Sr Analyst",dept:"IT - EMEA"};onboardStep="welcome";mode="onboarding";renderOnboard();};
window.askDelete=function(){$("#screen").innerHTML=`<h2>Delete your account?</h2><p class="sub">This permanently removes your profile, photos and answers. This can't be undone.</p><div class="card small" style="line-height:1.5">In line with GDPR this deletes your account and your data.</div><button class="btn danger" onclick="doDelete()">${icon('trash',18)} Yes, delete my account</button><button class="btn ghost" style="margin-top:10px" onclick="go('profile')">Cancel</button>`;};
window.doDelete=async function(){toast("Account deleted");await (S.deleteAccount?S.deleteAccount():S.signOut());current=null;onboardStep="welcome";mode="onboarding";renderOnboard();};

/* ---------------- BUG ---------------- */
function viewBug(){return `<button class="btn ghost sm" onclick="go('profile')">${icon('back',16)} Back</button><h2 style="margin-top:6px">Report a bug</h2><p class="sub">Spotted something odd? Tell us — it goes straight to the admins.</p><div class="card"><label class="small" style="font-weight:700">What happened?</label><textarea class="input" id="bugtxt" rows="4" placeholder="Describe the issue…" style="margin-top:6px"></textarea></div><button class="btn" onclick="sendBug()">${icon('send',18)} Send report</button>`;}
window.sendBug=async function(){const t=($("#bugtxt").value||'').trim();if(!t){toast("Please describe the issue");return;}await S.sendBug(t);toast("Bug report sent — thank you!");view='profile';await refresh();};

/* ---------------- ADMIN ---------------- */
function viewAdmin(){
  const completed=history().length,activeN=activeMatches().length,parts=C.users.length+1;
  const topQ=[...C.questions].sort((a,b)=>(b.count||0)-(a.count||0)).slice(0,5);
  return `<button class="btn ghost sm" onclick="go('profile')">${icon('back',16)} Back</button><h2 style="margin-top:6px">Admin dashboard</h2><p class="sub">Super-admin view (Donnae + Sean).</p>
   <div class="card"><div class="row"><div class="stat"><div class="v">${completed}</div><div class="l">My meetups</div></div><div class="stat"><div class="v">${activeN}</div><div class="l">Active now</div></div><div class="stat"><div class="v">${parts}</div><div class="l">People</div></div><div class="stat"><div class="v">${C.posts.length}</div><div class="l">Wall posts</div></div></div></div>
   ${(function(){
     const d=C.adminData;
     if(!C.admin)return `<div class="card muted small">Admin only.</div>`;
     if(!d)return `<div class="card center muted small">Loading answers…</div>`;
     if(d.error)return `<div class="card muted small">${d.error}</div>`;
     const qs=d.questions||[];
     return `<div class="card"><div class="row between"><b>The idea bank</b><span class="chip ${d.totalAnswers?'':'grey'}">${d.totalAnswers} answers</span></div>
       <p class="muted small" style="margin:8px 0 10px">Across ${d.totalMatches} meetup${d.totalMatches===1?'':'s'}. Tap a question to read the answers. These are private — admins only.</p>
       ${qs.length?qs.map(q=>`<div style="border-top:1px solid var(--line);padding:10px 0 4px">
           <div class="row between" style="cursor:pointer;gap:10px" onclick="adminToggleQ('${String(q.id).replace(/'/g,"\\'")}')">
             <span class="small" style="flex:1;min-width:0">${q.text}</span>
             ${q.tier===1?`<span class="tierpill" style="flex:none;margin-left:0">key idea</span>`:''}
             <span class="chip ${q.count?'':'grey'}" style="flex:none">${q.count}</span>
           </div>
           ${adminOpenQ===q.id?`<div style="margin-top:8px">${q.answers.map(a=>`<div class="q" style="margin:8px 0"><div class="small" style="white-space:pre-wrap">${a.text}</div><div class="muted small" style="margin-top:4px">${adminAnon?'anonymised':a.by}${a.type?' · '+a.type:''}${a.date?' · '+a.date:''}</div></div>`).join('')||'<div class="muted small">No answers yet.</div>'}</div>`:''}
         </div>`).join(''):`<div class="muted small">No answers captured yet — they appear here as colleagues complete meetups.</div>`}
       <div class="row" style="gap:8px;margin-top:12px">
         <button class="btn secondary sm" onclick="exportData()">${icon('download',16)} Export answers</button>
         <button class="btn ghost sm" onclick="adminToggleAnon()">${adminAnon?'Show names':'Anonymise'}</button>
         <button class="btn ghost sm" onclick="reloadAdmin()">${icon('refresh',16)}</button>
       </div></div>`;
   })()}
   <div class="card"><div class="row between" style="margin-bottom:6px"><b>Question bank</b><span class="chip grey">${C.questions.length}</span></div>
     <p class="muted small" style="margin:0 0 10px"><b>Idea</b> questions are asked in meetups and collected for the idea bank. <b>Icebreakers</b> are asked once at onboarding, shown only to a colleague's meetup partners, and never exported. Tap the pill to switch. Editing a question doesn't change answers already given.</p>
     ${C.questions.map(q=>qEditId===q.id
       ? `<div class="q" style="margin:10px 0">
            <label class="small" style="font-weight:700">English (canonical — used in the export)</label>
            <textarea class="input" rows="2" id="qedit-${q.id}" style="margin-top:4px">${q.text||''}</textarea>
            <label class="small" style="font-weight:700;display:block;margin-top:8px">Nederlands</label>
            <textarea class="input" rows="2" id="qedit-nl-${q.id}" style="margin-top:4px" placeholder="(falls back to English)">${q.text_nl||''}</textarea>
            <label class="small" style="font-weight:700;display:block;margin-top:8px">Română</label>
            <textarea class="input" rows="2" id="qedit-ro-${q.id}" style="margin-top:4px" placeholder="(falls back to English)">${q.text_ro||''}</textarea>
            <div class="row" style="gap:8px;margin-top:8px"><button class="btn sm" onclick="qSave('${q.id}')">${icon('check',15)} Save</button>
            <button class="btn ghost sm" onclick="qEdit(null)">Cancel</button></div></div>`
       : `<div class="row between" style="gap:10px;border-top:1px solid var(--line);padding:9px 0">
            <span class="small" style="flex:1;min-width:0">${q.text}${(q.text_nl||q.text_ro)?` <span class="muted" style="font-size:10px">${q.text_nl?'NL':''}${(q.text_nl&&q.text_ro)?'·':''}${q.text_ro?'RO':''}</span>`:''}</span>
            <button class="iconbtn" title="Tier" onclick="qTier('${q.id}',${q.tier===1?2:1})"><span class="tierpill" style="margin-left:0;cursor:pointer;${q.tier===1?'':'opacity:.45'}">${q.tier===1?'Idea':'Icebreaker'}</span></button>
            <button class="iconbtn" title="Edit" onclick="qEdit('${q.id}')">${icon('pencil',16)}</button>
            <button class="iconbtn" title="Delete" onclick="qDel('${q.id}')">${icon('trash',16)}</button>
          </div>`).join('')}
     <div class="row" style="gap:8px;margin-top:12px"><input class="input" id="newq" placeholder="Add a question…"><button class="btn sm" onclick="addQ()">${icon('plus',16)}</button></div>
     <div class="row" style="gap:8px;margin-top:8px"><span class="muted small">New questions start as Icebreakers — tap the pill to make one an Idea question.</span></div></div>
   <div class="card"><div class="row between"><b>Bug reports</b><span class="chip ${C.bugs.length?'':'grey'}">${C.bugs.length}</span></div>${C.bugs.length?C.bugs.map(b=>`<div class="small" style="padding:8px 0;border-top:1px solid var(--line)"><b>${b.by}</b> · ${b.at}<br>${b.text}</div>`).join(''):`<p class="muted small" style="margin-top:8px">No bug reports yet.</p>`}</div>`;
}
// CSV rather than .xlsx: a real xlsx is a zip archive, which would mean pulling in a library
// (SheetJS ~100KB) and this app deliberately has no build step. Excel opens this natively —
// UTF-8 BOM so accented names survive, CRLF line endings, and every field quoted.
function csvCell(v){
  v=String(v==null?'':v);
  // A leading = + - @ makes Excel treat the cell as a formula; prefix so it stays text.
  if(/^[=+\-@]/.test(v))v="'"+v;
  return '"'+v.replace(/"/g,'""')+'"';
}
window.exportData=function(){
  const d=C.adminData;
  if(!C.admin){toast("Admins only");return;}
  if(!d||d.error||!(d.questions||[]).length){toast("No answers to export yet");return;}
  const rows=[["Question","Tier","Answer","Colleague","Meetup type","Date","Match ID"]];
  // Tier-1 only. Icebreakers live on user docs and never reach adminAnswers(), but filter here
  // too so a mis-tiered question can never leak an icebreaker answer into the export.
  const ideaOnly=d.questions.filter(q=>q.tier!==2);
  ideaOnly.forEach(q=>q.answers.forEach(a=>rows.push([
    q.text,q.tier||'',a.text,adminAnon?'anonymised':a.by,a.type,a.date,a.matchId])));
  const csv="\uFEFF"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n");
  const name="zb-meetup-answers-"+new Date().toISOString().slice(0,10)+".csv";
  try{
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download=name;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
    toast((rows.length-1)+" answers exported");
  }catch(e){ toast("Couldn't start the download"); }
};
let qEditId=null;   // which question is open for inline editing
window.qEdit=function(id){qEditId=id;render();};
window.qSave=async function(id){
  const val=x=>{const el=document.getElementById(x);return ((el&&el.value)||'').trim();};
  const v=val('qedit-'+id);
  if(!v){toast("A question can't be empty");return;}   // English is canonical, so it is required
  await S.updateQuestion(id,{text:v,text_nl:val('qedit-nl-'+id),text_ro:val('qedit-ro-'+id)});
  qEditId=null; toast("Question updated"); await refresh();
};
window.qTier=async function(id,tier){await S.updateQuestion(id,{tier:tier});await refresh();};
window.qDel=async function(id){
  const q=C.questions.find(x=>x.id===id);
  if(!confirm('Delete this question?\n\n"'+((q&&q.text)||'')+'"\n\nAnswers already given keep the wording colleagues were asked.'))return;
  await S.deleteQuestion(id); toast("Question deleted"); await refresh();
};
window.addQ=async function(){const v=($("#newq").value||'').trim();if(!v)return;await S.addQuestion(v,2);toast("Question added");await refresh();};

/* ---------------- NOTIFICATIONS ---------------- */
function viewNotifs(){
  let h=`<div class="row between"><h2>${t('notifs_h')}</h2>${C.notifs.length?`<button class="iconbtn" onclick="clearNotifs()">${t('notifs_clear')}</button>`:''}</div><p class="sub">${t('notifs_sub')}</p>`;
  if(!C.notifs.length)return h+`<div class="card center muted">${t('notifs_none')}</div>`;
  C.notifs.forEach(n=>{h+=`<div class="ncard ${n.read?'':'unread'}" onclick="openNotif('${n.id}')"><div class="nicon">${icon(n.icon||'bell',18)}</div><div class="small" style="flex:1">${notifText(n)}</div></div>`;});
  return h;
}
window.openNotif=async function(id){const n=C.notifs.find(x=>String(x.id)===String(id));if(!n)return;await S.markNotifRead(id);if(n.target){view=n.target;await refresh();}else await refresh();};
window.clearNotifs=async function(){await S.markNotifsRead();await refresh();};

/* ---------------- Add to Home Screen hint ---------------- */
function initA2HS(){
  try{
    var w=window, nav=(typeof navigator!=='undefined')?navigator:{userAgent:''};
    var standalone=(w.matchMedia&&w.matchMedia('(display-mode: standalone)').matches)||nav.standalone===true;
    var ua=nav.userAgent||''; var isIOS=/iphone|ipad|ipod/i.test(ua); var isAndroid=/android/i.test(ua);
    window._a2hsMobile=(!standalone)&&(isIOS||isAndroid);   // drives the "Save as app" chip
    if(!window._a2hsMobile)return; // desktop / already installed: no hint, no chip
    var deferred=null;
    window._a2hsClose=function(){var b=document.getElementById('a2hs');if(b&&b.remove)b.remove();try{localStorage.setItem('zb_a2hs','1');}catch(e){}};
    window._a2hsInstall=function(){if(deferred){deferred.prompt();if(deferred.userChoice&&deferred.userChoice.finally)deferred.userChoice.finally(window._a2hsClose);}else{window._a2hsClose();}};
    function iosShare(){return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0079BD" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11"/><path d="M8 7l4-4 4 4"/><path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/></svg>';}
    window.a2hsShow=function(){     // callable any time (from the chip, or auto on first visit)
      if(document.getElementById('a2hs'))return;
      var b=document.createElement('div'); b.id='a2hs'; b.className='a2hs';
      var html='<div class="a2hs-ic"><img src="assets/icon-192.png" alt=""></div>';
      if(isIOS){
        html+='<div class="a2hs-txt"><b>Add ZB MeetUP to your home screen</b><div class="a2hs-sub">Tap '+iosShare()+' in the toolbar, then <b>Add to Home Screen</b>.</div></div>';
        html+='<button class="a2hs-x" onclick="_a2hsClose()">'+icon('x',18)+'</button>';
        html+='<div class="a2hs-arrow"><svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor"><path d="M10 12L0 0h20z"/></svg></div>';
      } else {
        html+='<div class="a2hs-txt"><b>Install ZB MeetUP</b><div class="a2hs-sub">Add it to your home screen for quick access.</div></div>';
        html+='<button class="btn sm" style="width:auto" onclick="_a2hsInstall()">Add</button><button class="a2hs-x" onclick="_a2hsClose()">'+icon('x',18)+'</button>';
      }
      b.innerHTML=html; document.body.appendChild(b);
    };
    if(isAndroid) w.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;});
    // auto-show once (unless previously dismissed) — the chip brings it back afterwards
    var dismissed=false; try{dismissed=localStorage.getItem('zb_a2hs')==='1';}catch(e){}
    if(!dismissed) setTimeout(window.a2hsShow, isAndroid?3500:2500);
  }catch(e){}
}

/* ---------------- boot ---------------- */
window.ZB_BOOT=function(){
  initA2HS();
  if(S.onChange)S.onChange(()=>{ if(mode==='app'&&!authBusy) refresh(); });
  S.onAuth(async user=>{
    if(authBusy)return;
    if(!user){mode="onboarding";onboardStep="welcome";renderOnboard();return;}
    const me=await S.getMe();
    if(!me||!me.name){mode="onboarding";if(onboardStep<1)onboardStep=1;OB.email=user.email||OB.email;renderOnboard();return;}
    mode="app";await refresh();
  });
};
})();
