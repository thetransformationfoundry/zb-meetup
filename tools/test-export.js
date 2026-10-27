/* ZB MeetUP — fixture test for tools/export-campaign.js (BRIEF-038)

   Drives the REAL export end to end against a stubbed Firestore and asserts on the
   files it writes. A grep over the source proves no write call is present; this proves
   the thing actually produced is correct — the Tier-2 exclusion, the builder exclusion,
   the formula guard, the BOM/CRLF, the Amsterdam clock, the photo decode.

   Touches no network and no live project. Run: node tools/test-export.js            */
const fs = require("fs"), path = require("path"), os = require("os");

let pass = 0, fail = 0;
const chk = (name, ok) => { console.log((ok ? "✓ " : "✗ ") + name); ok ? pass++ : fail++; };

/* ---- fixture ---- */
const JPG = "data:image/jpeg;base64," + Buffer.from("fake-jpeg-bytes").toString("base64");
const ts = iso => ({ toDate: () => new Date(iso) });
const USERS = [
  { id:"u1", name:"Mira Halvorsen", email:"mira@zimmerbiomet.com", role:"GSCC - QARA", dept:"Quality", workClass:"partial", lang:"nl", points:95, createdAt:ts("2026-09-14T08:00:00Z") },
  { id:"u2", name:"Tobias Halvorsen", email:"tobias@zimmerbiomet.com", role:"GSCC Warehouse Clerk", dept:"Distribution", workClass:"on-site", lang:"ro", points:60, createdAt:ts("2026-09-15T08:00:00Z") },
  { id:"u3", name:"Donnae Example", email:"donnae@zimmerbiomet.com", role:"GSCC Lead", dept:"Quality", workClass:"partial", lang:"en", points:120, admin:true, createdAt:ts("2026-09-14T07:00:00Z") },
  { id:"b1", name:"Builder Person", email:"builder@thetransformationfoundry.nl", role:"Other", dept:"TTF", workClass:"remote", lang:"en", points:999, builder:true, createdAt:ts("2026-09-01T07:00:00Z") },
];
const MATCHES = [
  { id:"m1", a:"u1", b:"u2", type:"a coffee", status:"completed",
    createdAt:ts("2026-09-20T09:00:00Z"), acceptedAt:ts("2026-09-20T10:00:00Z"), completedAt:ts("2026-09-21T12:30:00Z"),
    completedBy:{ u1:1, u2:1 }, hasPhoto:true,
    questions:[{ id:"q1", text:"What would you change?", tier:1 },
               { id:"q2", text:"Favourite biscuit?", tier:2 },
               { id:"q3", text:"=1+1 formula bait", tier:1 }],
    answers:{ u1:["Fewer handovers", "ICEBREAKER-MUST-NOT-APPEAR", "=SUM(A1)"], u2:["More cross-site visits", "", ""] } },
  { id:"m2", a:"u1", b:"u3", type:"a walk at lunch", status:"active",
    createdAt:ts("2026-09-25T09:00:00Z"), acceptedAt:ts("2026-09-25T09:30:00Z"),
    completedBy:{ u1:1 }, questions:[], answers:{} },
];
const POSTS = [{ id:"p1", names:"Mira & Tobias", scene:"coffee", hearts:3, comments:[{},{}], createdAt:ts("2026-09-21T12:40:00Z") }];
const BANK = [{ id:"q1", text:"What would you change about how we work?", tier:1 },
               { id:"q2", text:"Favourite biscuit?", tier:2 },
               { id:"q3", text:"=1+1 formula bait", tier:1 }];
const MEDIA = { m1: { photo: JPG } };

const snap = rows => ({ docs: rows.map(r => ({ id:r.id, data: () => r })) });
function fakeCollection(name) {
  const data = { users:USERS, matches:MATCHES, posts:POSTS, questionBank:BANK }[name] || [];
  const q = { get: async () => snap(data), where:()=>q, orderBy:()=>q, limit:()=>q,
    doc: id => ({ id,
      get: async () => ({ exists:false, data:()=>({}) }),
      collection: () => ({ get: async () => snap([]), where:()=>q, orderBy:()=>q, limit:()=>q,
        doc: () => ({ get: async () => ({ exists: !!MEDIA[id], data: () => MEDIA[id] || {} }) }) }) }) };
  return q;
}
const ADMIN_STUB = { initializeApp(){}, firestore: () => ({ collection: fakeCollection }) };

/* ---- run the real script against it ---- */
const REPO = path.resolve(__dirname, "..");
// Write the stub to a real temp module and point the script at it. Seeding require.cache
// against functions/node_modules only worked when the Functions dependencies happened to be
// installed — they are gitignored, so CI never has them and the fixture failed there while
// passing locally. This way the fixture needs nothing installed.
const stubDir = fs.mkdtempSync(path.join(os.tmpdir(), "zb-admin-stub-"));
const stubFile = path.join(stubDir, "admin-stub.js");
fs.writeFileSync(stubFile, "module.exports = global.__ZB_ADMIN_STUB;", "utf8");
global.__ZB_ADMIN_STUB = ADMIN_STUB;
process.env.ZB_ADMIN_MODULE = stubFile;

const out = fs.mkdtempSync(path.join(os.tmpdir(), "zb-export-test-"));
process.argv = ["node", "export-campaign.js", "--out", out];

(async () => {
  const mod = require(path.join(REPO, "tools", "export-campaign.js"));
  await mod.main();

  const dir = fs.readdirSync(out).filter(d => d.startsWith("ZB-MeetUP-campaign-export-"))[0];
  chk("creates one dated export folder", !!dir);
  const read = f => fs.readFileSync(path.join(out, dir, f), "utf8");
  const names = fs.readdirSync(path.join(out, dir));
  chk("writes all six CSVs plus a README",
      ["01-final-standings.csv","02-idea-answers.csv","03-meetups.csv","04-colleagues.csv",
       "05-wall-posts.csv","06-question-stats.csv","README.md"].every(f => names.includes(f)));

  const standings = read("01-final-standings.csv");
  chk("CSV is UTF-8 with a BOM and CRLF line endings",
      standings.charCodeAt(0) === 0xFEFF && standings.indexOf("\r\n") > -1);
  chk("builders are excluded from the standings",
      standings.indexOf("Builder Person") === -1);
  chk("standings are ranked by points, highest first",
      standings.indexOf("Donnae Example") < standings.indexOf("Mira Halvorsen")
      && standings.indexOf("Mira Halvorsen") < standings.indexOf("Tobias Halvorsen"));
  chk("an admin ranks normally but is marked not eligible",
      // rank 1 on points, 0 completions (she completed neither fixture meetup), not eligible
      /^"1","Donnae Example","120","0","No — admin"/.test(standings.split("\r\n")[1]));
  chk("meetups completed is counted per person, not per match",
      /"Mira Halvorsen","95","2"/.test(standings) && /"Tobias Halvorsen","60","1"/.test(standings));

  const answers = read("02-idea-answers.csv");
  chk("Tier-2 icebreaker answers never reach the export",
      answers.indexOf("ICEBREAKER-MUST-NOT-APPEAR") === -1 && answers.indexOf("Fewer handovers") > -1);
  chk("a formula-looking answer is neutralised for Excel",
      answers.indexOf('"\'=SUM(A1)"') > -1);
  chk("questions use the bank's current wording, not the stored snapshot",
      answers.indexOf("What would you change about how we work?") > -1);

  const meetups = read("03-meetups.csv");
  chk("meetup dates render in Europe/Amsterdam, not UTC",
      meetups.indexOf("2026-09-21 14:30") > -1);           // 12:30Z = 14:30 CEST
  chk("a meetup with no completion date leaves the cell empty, never a stand-in",
      /"m2","Mira Halvorsen","Donnae Example","a walk at lunch","active","2026-09-25 11:00","2026-09-25 11:30",""/.test(meetups));
  chk("photo yes/no reflects the flag", /"m1".*"Yes"/.test(meetups) && /"m2".*"No"/.test(meetups));

  const colleagues = read("04-colleagues.csv");
  chk("colleagues carry email and a readable work setup",
      colleagues.indexOf("mira@zimmerbiomet.com") > -1 && colleagues.indexOf("Partly remote") > -1);
  chk("builders are excluded from the colleague list too",
      colleagues.indexOf("builder@thetransformationfoundry.nl") === -1);

  chk("wall posts carry date, participants, likes and comment count",
      /"2026-09-21 14:40","Mira & Tobias","coffee","3","2"/.test(read("05-wall-posts.csv")));
  const stats = read("06-question-stats.csv");
  chk("question stats count Tier-1 only",
      /"What would you change about how we work\?","1","2"/.test(stats)
      && stats.indexOf("Favourite biscuit") === -1);

  const photos = fs.readdirSync(path.join(out, dir, "photos", "meetups"));
  chk("the meetup photo is decoded to a real file, named by date and people",
      photos.length === 1 && /^2026-09-21_Mira-Halvorsen_Tobias-Halvorsen\.jpg$/.test(photos[0])
      && fs.readFileSync(path.join(out, dir, "photos", "meetups", photos[0]), "utf8") === "fake-jpeg-bytes");

  const readme = read("README.md");
  chk("the README states the counts and carries the privacy note",
      readme.indexOf("| 3 |") > -1 && /names and work email addresses/.test(readme)
      && /Tier-1 only/.test(readme));

  fs.rmSync(out, { recursive:true, force:true });
  fs.rmSync(stubDir, { recursive:true, force:true });
  console.log(`\n${fail ? "EXPORT FIXTURE FAILED ❌" : "EXPORT FIXTURE GREEN ✅"}  (${pass} passed, ${fail} failed)`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("\n✖ fixture run failed:", e && e.stack || e); process.exit(1); });
