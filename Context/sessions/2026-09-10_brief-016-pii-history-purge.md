# Session — 2026-09-10 · BRIEF-016 · purge real employee data from git history

**Approach:** Option B (Sean, 2026-09-10) — rewrite history, then delete and recreate the repo with the
scrubbed history. **Not** treated as a formal GDPR incident: Sean assessed it as ZB's own internal data
(names, roles, work setup; no contact details, no special-category data, zero forks). The goal is simply that
no real colleague's details sit in a public repo.

## What was exposed
The demo seed colleagues in `js/store.js` were **real Zimmer Biomet colleagues** — full name paired with role,
department and work classification (on-site / partially remote / fully remote, plus the floor-worker flag).
Public from the **first commit, 2026-09-04 13:31 UTC**, in 22 of 23 commits. **13 real-person entries** in
total: 12 colleagues plus a `Donnae Abbood` seed that CC added on 2026-09-09.

Audited and found clean: no employee spreadsheet or export was ever committed; no real email addresses beyond
the two admin addresses that are intentional and documented as public; no identifiable photos. Only two paths
ever carried the names — `js/store.js` and, embarrassingly, **CC's own BRIEF-015 session log**, which listed
nine of them while documenting the privacy fix.

## What we did
1. **Backed up** the full repo (working tree + `.git`) outside the project before touching anything, plus a
   `pre-rewrite-backup` ref.
2. **Full-history audit** across every blob in the object database, then `git grep` across all 25 commits, to
   establish the real blast radius rather than assuming it matched what was visible at HEAD.
3. **Landed BRIEF-015** (rebased onto `main`; only `version.json` conflicted — CI's stamp vs the branch).
4. **Scrubbed CC's session log** so the fix's own record no longer republishes the names.
5. **Added `tools/check-seed-names.js`** — and it **immediately caught three real colleagues still in
   `store.js` at HEAD** that CC's first pass had missed (they sat above the block CC had edited). HEAD was not
   actually clean until this ran. It is wired into CI beside the harness.
6. **Rewrote all history** with `git filter-repo --replace-text`, mapping each real person to a consistent
   invented one (same role, so the demo still exercises real matching). Verified zero matches for every real
   surname across all 25 commits — including the two surnames deliberately given no bare-surname rule
   (`Meijer`, `Timmers`) because they are common words that risked collateral edits.
7. **Repaired every dangling SHA reference** in `Context/` from filter-repo's commit map (15 files). One
   needed hand-mapping: `35b659b` was the pre-amend SHA of an amended commit, so it never existed in the new
   history — pointed at its successor instead.
8. **Deleted and recreated the GitHub repo**, pushed the scrubbed history, re-enabled Pages and the Action,
   and re-verified CI, the live app and the version stamp.

## Honest residual caveats
- **A rewrite cannot un-publish.** Anyone who cloned or viewed the repo between 2026-09-04 and 2026-09-10
  may hold the old data. Forks: 0, stars: 0, watchers: 0 at the time of the purge, and the URL was
  unadvertised, so realistic exposure is very low — but it is not zero, and the honest statement is
  "removed going forward", not "never happened".
- Recreating the repo (rather than force-pushing) was chosen precisely so no unreferenced objects linger on
  GitHub's side awaiting garbage collection, and so old commit URLs 404 immediately rather than staying
  reachable by SHA.
- **Every SHA changed.** Earlier version stamps (e.g. the one the live app showed before this) reference
  commits that no longer exist. Stamps from here on are correct; historical ones are not resolvable.

## Prevention
`tools/check-seed-names.js` runs in CI on every push and PR. It requires every seed colleague to be on an
explicit invented-names allow-list, and fails if a real team member appears as a seeded colleague. It cannot
tell a real name from an invented one — no script can — but it makes adding a colleague to the seeds a
deliberate act that has to edit the allow-list, instead of something that slips through in a diff. The comment
in `js/store.js` says the same thing to whoever edits it next.

**The underlying principle, per Sean:** colleagues set their own name and role at onboarding. That data lives
in Firestore behind the rules — never in this repo.
