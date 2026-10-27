#!/usr/bin/env node
/* ============================================================
   ZB MeetUP — campaign data export (BRIEF-038)

   One command that reads the live campaign out of Firestore and writes a folder a
   human can open: standings, idea answers, meetups, colleagues, wall posts, question
   stats, and the meetup photos as real JPGs.

   STRICTLY READ-ONLY. Not by convention — by construction: the Firestore handle is
   wrapped in an allow-list (`get`, `doc`, `collection`, `where`, `orderBy`, `limit`)
   and nothing else is reachable from it. A write method is not "unused" here, it does
   not exist. tools/test-demo.js also greps this file for write-call syntax.

   AUTH: Application Default Credentials only — `gcloud auth application-default login`.
   No service-account key, and nothing credential-like is ever written to disk.

   USAGE: node tools/export-campaign.js --out "<folder outside the repo>"
   ============================================================ */

const fs = require("fs");
const path = require("path");

const PROJECT_ID = "zb-meetup";
const TZ = "Europe/Amsterdam";
const REPO = path.resolve(__dirname, "..");

/* ---------- args ---------- */
function parseArgs(argv) {
  const out = { out: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--out") out.out = argv[++i];
    else if (argv[i].startsWith("--out=")) out.out = argv[i].slice(6);
  }
  return out;
}

function die(msg) { console.error("\n✖ " + msg + "\n"); process.exit(1); }

/* ---------- CSV ----------
   UTF-8 with BOM + CRLF so Excel opens accents correctly on both Mac and Windows.
   The leading =+-@ guard is copied from app.js csvCell() rather than imported: this
   script must not depend on browser code. */
function csvCell(v) {
  v = String(v == null ? "" : v);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return '"' + v.replace(/"/g, '""') + '"';
}
function csv(rows) {
  return "﻿" + rows.map(r => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

/* ---------- dates ----------
   Everything the reader sees is Europe/Amsterdam, so a timestamp in the CSV matches
   what the colleague saw in the app. */
const dtf = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hour12: false
});
function toDate(v) {
  if (v == null) return null;
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") { const n = Date.parse(v); return isNaN(n) ? null : new Date(n); }
  if (v instanceof Date) return v;
  if (typeof v.toDate === "function") return v.toDate();
  if (typeof v.seconds === "number") return new Date(v.seconds * 1000);
  return null;
}
function fmt(v) {
  const d = toDate(v);
  if (!d) return "";                       // absent stays absent — never a stand-in date
  const p = {};
  dtf.formatToParts(d).forEach(x => { p[x.type] = x.value; });
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}
function fmtDay(v) { const s = fmt(v); return s ? s.slice(0, 10) : ""; }

/* ---------- read-only Firestore ----------
   An allow-list wrapper. Only these methods exist on anything this script touches, so
   .set/.update/.delete/.add/batch/runTransaction are unreachable rather than merely
   unused — the guarantee survives someone editing this file later. */
function roQuery(q) {
  const ro = {
    get: () => q.get(),
    where: (...a) => roQuery(q.where(...a)),
    orderBy: (...a) => roQuery(q.orderBy(...a)),
    limit: n => roQuery(q.limit(n)),
  };
  // A CollectionReference can address one document; a Query cannot. Exposing it only
  // where it exists is what lets matches/{id}/media/photo be read — the first version
  // omitted it, so every meetup photo silently fell through to the legacy path and was
  // reported as unreadable. Caught by the fixture, not by reading the code.
  if (typeof q.doc === "function") ro.doc = id => roDoc(q.doc(id));
  return ro;
}
function roDoc(d) {
  return { get: () => d.get(), collection: name => roQuery(d.collection(name)), id: d.id };
}
function roDb(db) { return { collection: name => roQuery(db.collection(name)) }; }

/* ---------- main ---------- */
async function main() {
  const args = parseArgs(process.argv);
  if (!args.out) die('Missing --out. Usage:\n  node tools/export-campaign.js --out "<folder outside the repo>"');

  const outRoot = path.resolve(args.out.replace(/^~(?=$|\/)/, process.env.HOME || "~"));
  // Personal data must never land in a public repo, so refuse point-blank.
  const rel = path.relative(REPO, outRoot);
  if (rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel)))
    die("--out is inside the repo (" + outRoot + ").\nThis export contains names and email addresses and must never\nland in a public repository. Point --out at OneDrive instead.");
  if (!fs.existsSync(outRoot)) die("--out folder does not exist: " + outRoot);

  let admin;
  try { admin = require(path.join(REPO, "functions", "node_modules", "firebase-admin")); }
  catch (e) { die("firebase-admin not found under functions/node_modules.\nRun:  cd functions && npm install"); }

  try { admin.initializeApp({ projectId: PROJECT_ID }); }
  catch (e) { die("Could not initialise firebase-admin: " + (e && e.message)); }

  const db = roDb(admin.firestore());

  const readAll = async name => {
    try { const s = await db.collection(name).get(); return s.docs.map(d => ({ id: d.id, ...d.data() })); }
    catch (e) {
      if (String(e && e.message).match(/could not load the default credentials|UNAUTHENTICATED|PERMISSION_DENIED/i))
        die("Firestore refused the read.\n\nRun this once, then try again:\n  gcloud auth application-default login\n\n(" + e.message + ")");
      throw e;
    }
  };

  console.log("Reading " + PROJECT_ID + " …");
  const users = await readAll("users");
  const matches = await readAll("matches");
  const posts = await readAll("posts");
  const bank = await readAll("questionBank");
  console.log(`  users ${users.length} · matches ${matches.length} · posts ${posts.length} · questions ${bank.length}`);

  const stamp = fmtDay(new Date());
  const dir = path.join(outRoot, "ZB-MeetUP-campaign-export-" + stamp);
  const photoDir = path.join(dir, "photos", "meetups");
  fs.mkdirSync(photoDir, { recursive: true });

  const byUid = {};
  users.forEach(u => { byUid[u.id] = u; });
  const nameOf = uid => (byUid[uid] && byUid[uid].name) || "A colleague";

  // "completed" is per person (BRIEF-005), so count each colleague's own completions.
  const completedBy = {};
  matches.forEach(m => Object.keys(m.completedBy || {}).forEach(uid => {
    completedBy[uid] = (completedBy[uid] || 0) + 1;
  }));

  /* 01 — standings. Same builder exclusion and sort as the in-app leaderboard. */
  const ranked = users.filter(u => !u.builder).sort((a, b) => (b.points || 0) - (a.points || 0));
  const standings = [["Rank", "Name", "Points", "Meetups completed", "Eligible for prizes", "Role", "Department", "Language"]];
  ranked.forEach((u, i) => standings.push([
    i + 1, u.name || "", u.points || 0, completedBy[u.id] || 0,
    u.admin ? "No — admin" : "Yes", u.role || "", u.dept || "", u.lang || "en"
  ]));

  /* 02 — idea answers. Tier-1 only; icebreakers live on user docs and never come near
     this loop, but the tier filter stays as the same belt-and-braces the app uses. */
  const currentText = {}; bank.forEach(q => { currentText[q.id] = q.text; });
  const answerRows = [["Question", "Tier", "Answer", "Colleague", "Meetup type", "Date", "Match ID"]];
  const stats = {};
  matches.forEach(m => {
    const qs = m.questions || [], ans = m.answers || {};
    const when = fmtDay(m.completedAt || m.createdAt);
    Object.keys(ans).forEach(uid => (ans[uid] || []).forEach((text, i) => {
      text = (text || "").trim(); if (!text) return;
      const q = qs[i] || {};
      if (q.tier === 2) return;                       // never export an icebreaker
      const key = q.id || q.t || ("q" + i);
      const label = currentText[q.id] || q.text || q.t || "(question not recorded)";
      if (!stats[key]) stats[key] = { text: label, tier: q.tier == null ? "" : q.tier, count: 0 };
      stats[key].count++;
      answerRows.push([label, q.tier == null ? "" : q.tier, text, nameOf(uid), m.type || "", when, m.id]);
    }));
  });

  /* 03 — meetups */
  const meetupRows = [["Match ID", "Person A", "Person B", "Type", "Status", "Requested", "Accepted", "Completed", "Photo"]];
  matches.forEach(m => meetupRows.push([
    m.id, nameOf(m.a), nameOf(m.b), m.type || "", m.status || "",
    fmt(m.createdAt), fmt(m.acceptedAt), fmt(m.completedAt),
    (m.hasPhoto || m.photo) ? "Yes" : "No"
  ]));

  /* 04 — colleagues (contains email: see the privacy note in the README) */
  const WORK = { "on-site": "On site", "partial": "Partly remote", "remote": "Fully remote" };
  const colleagueRows = [["Name", "Email", "Role", "Department", "Work setup", "Language", "Points", "Joined", "Meetups completed"]];
  users.filter(u => !u.builder).forEach(u => colleagueRows.push([
    u.name || "", u.email || "", u.role || "", u.dept || "",
    WORK[u.workClass] || u.workClass || "", u.lang || "en",
    u.points || 0, fmt(u.createdAt), completedBy[u.id] || 0
  ]));

  /* 05 — wall posts. The post carries no free-text caption, so the scene is the caption. */
  const postRows = [["Date", "Participants", "Caption (scene)", "Likes", "Comments"]];
  posts.slice().sort((a, b) => (toDate(b.createdAt) || 0) - (toDate(a.createdAt) || 0))
    .forEach(p => postRows.push([
      fmt(p.createdAt), p.names || "", p.scene || "", p.hearts || 0, (p.comments || []).length
    ]));

  /* 06 — question stats */
  const statRows = [["Question", "Tier", "Times answered"]];
  Object.keys(stats).map(k => stats[k]).sort((a, b) => b.count - a.count)
    .forEach(s => statRows.push([s.text, s.tier, s.count]));

  /* photos — media/photo subdoc, with the legacy inline fallback readPhoto() uses */
  let photoCount = 0, photoMisses = 0;
  for (const m of matches) {
    if (!(m.hasPhoto || m.photo)) continue;
    let b64 = null;
    try {
      const snap = await db.collection("matches").doc(m.id).collection("media").doc("photo").get();
      if (snap.exists) b64 = (snap.data() || {}).photo || null;
    } catch (e) { /* fall through to the inline copy */ }
    if (!b64 && typeof m.photo === "string") b64 = m.photo;          // pre-migration straggler
    if (!b64 && m.photos) b64 = Object.keys(m.photos).map(k => m.photos[k]).filter(Boolean)[0] || null;
    if (!b64) { photoMisses++; continue; }
    const mm = /^data:image\/([a-z+]+);base64,/i.exec(b64);
    const ext = mm ? (mm[1].toLowerCase() === "jpeg" ? "jpg" : mm[1].toLowerCase()) : "jpg";
    const raw = b64.indexOf(",") > -1 ? b64.slice(b64.indexOf(",") + 1) : b64;
    const safe = s => String(s || "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "colleague";
    const file = `${fmtDay(m.completedAt || m.createdAt) || "undated"}_${safe(nameOf(m.a))}_${safe(nameOf(m.b))}.${ext}`;
    fs.writeFileSync(path.join(photoDir, file), Buffer.from(raw, "base64"));
    photoCount++;
  }

  const files = [
    ["01-final-standings.csv", csv(standings), standings.length - 1, "ranked colleagues"],
    ["02-idea-answers.csv", csv(answerRows), answerRows.length - 1, "Tier-1 answers (icebreakers excluded)"],
    ["03-meetups.csv", csv(meetupRows), meetupRows.length - 1, "meetups"],
    ["04-colleagues.csv", csv(colleagueRows), colleagueRows.length - 1, "colleagues (includes email)"],
    ["05-wall-posts.csv", csv(postRows), postRows.length - 1, "wall posts"],
    ["06-question-stats.csv", csv(statRows), statRows.length - 1, "questions answered at least once"],
  ];
  files.forEach(([name, body]) => fs.writeFileSync(path.join(dir, name), body, "utf8"));

  const readme = `# ZB MeetUP — campaign export

Exported **${fmt(new Date())}** (Europe/Amsterdam) from the live \`${PROJECT_ID}\` Firestore project.
Read-only export — nothing in the app was changed by producing this.

## What's inside

| File | Rows | Contents |
|---|---|---|
${files.map(([n, , c, d]) => `| \`${n}\` | ${c} | ${d} |`).join("\n")}
| \`photos/meetups/\` | ${photoCount} | one JPG per meetup photo, named \`date_NameA_NameB\` |

Source totals: **${users.length}** user records, **${matches.length}** meetups, **${posts.length}** wall posts,
**${bank.length}** questions in the bank.${photoMisses ? `\n\n${photoMisses} meetup(s) are flagged as having a photo but no image could be read.` : ""}

## Notes

- **Standings** use the same rule as the app's Ranks tab: builder accounts excluded, sorted by points.
  Admins appear in the standings and are marked **not eligible for prizes**, exactly as in the app.
- **Idea answers** are **Tier-1 only**. Icebreaker (Tier-2) answers are personal to each colleague and
  are never exported — the same rule the in-app admin export follows.
- **Meetups completed** is counted per person: each colleague completes their own half of a meetup.
- Empty cells mean the app genuinely holds no value — they are never a substitute for a missing date.
- CSVs are UTF-8 with a byte-order mark and CRLF line endings, so Dutch and Romanian accents open
  correctly in Excel on both Mac and Windows.

## Privacy

\`04-colleagues.csv\` contains **names and work email addresses**, and the photos show identifiable people.
Keep this folder on OneDrive, share it only with Donnae and Sean, and do not place it in the app repository
(which is public) or anywhere else it could be indexed.
`;
  fs.writeFileSync(path.join(dir, "README.md"), readme, "utf8");

  console.log("\n✔ Export complete\n");
  files.forEach(([n, , c, d]) => console.log(`   ${String(c).padStart(5)}  ${n}  — ${d}`));
  console.log(`   ${String(photoCount).padStart(5)}  photos/meetups/`);
  if (photoMisses) console.log(`   ${String(photoMisses).padStart(5)}  meetup photos could not be read`);
  console.log("\n   " + dir + "\n");
}

// Run when invoked directly; exported so tools/test-export.js can drive the whole
// pipeline against a fixture and assert on the FILES, not on how the source reads.
if (require.main === module) {
  main().catch(e => { console.error("\n✖ Export failed:", (e && e.stack) || e); process.exit(1); });
}
module.exports = { main, csvCell, csv, fmt, fmtDay, toDate, roDb };
