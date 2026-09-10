/* ZB MeetUP — guard against real colleagues' details in the repo.

   The demo seed users in js/store.js once held REAL colleagues (name + role + department +
   work location) and were public from the first commit. History was purged under BRIEF-016.
   This check exists so it cannot happen again quietly.

   It is a heuristic, not a database lookup: we cannot tell a real name from an invented one.
   What it CAN do is insist that every seed entry is on an explicit allow-list of invented
   people, so adding a colleague to the seeds fails CI and needs a deliberate edit here.

   Run:  node tools/check-seed-names.js     (exit 0 = clean, 1 = something to look at)
*/
const fs = require("fs");

// The invented demo colleagues. Add a name here ONLY if you made it up.
const INVENTED = new Set([
  "Noor Baaijens", "Wessel Duifhuis", "Ilse Verkerk", "Bram Roelofsen",
  "Sanne Kolthoff", "Timo Vermeulen", "Joris Stevens", "Maud Hendriks",
  "Lars Wieringa", "Fenna Bergsma", "Margot Lefevre", "Ruben Vos",
  "Mira Halvorsen", "Tobias Halvorsen", "Elin Koster",
]);

// Real people who legitimately appear in the repo as the project team (docs/config), and must
// never appear as a seeded, matchable colleague.
const TEAM = ["Donnae", "Abbood", "Sean"];

const src = fs.readFileSync("js/store.js", "utf8");
const entries = [...src.matchAll(/\["([A-Z][\w'-]*)","([A-Z][\w'-]*)"/g)].map(m => `${m[1]} ${m[2]}`);

let bad = [];
for (const name of entries) {
  if (!INVENTED.has(name)) bad.push(`${name} — not on the invented allow-list in tools/check-seed-names.js`);
  if (TEAM.some(t => name.includes(t))) bad.push(`${name} — a real team member must not be a seeded colleague`);
}
if (!entries.length) bad.push("found no seed entries at all — has the pattern in this check drifted from store.js?");

if (bad.length) {
  console.log("✗ seed-name check FAILED\n");
  bad.forEach(b => console.log("  " + b));
  console.log("\nDemo seeds must be invented people. Real colleagues set their own name and role");
  console.log("at onboarding; that data belongs in Firestore, never in this public repo.");
  process.exit(1);
}
console.log(`✓ seed-name check: ${entries.length} seed colleagues, all on the invented allow-list`);
