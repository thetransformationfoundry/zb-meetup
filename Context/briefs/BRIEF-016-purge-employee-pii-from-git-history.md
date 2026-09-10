# BRIEF-016 · Purge real employee PII from git history (privacy remediation)

**Branch:** operates on `main` history (force-push)  ·  **Status:** approved — **Option B** (Sean, 2026-09-10)
**Priority:** do before the wider invite. **Repo hygiene**, not a formal GDPR incident — Sean assessed it as ZB's
own internal data (names/roles/work-setup only, no contact details), so no incident note is required; the goal is
simply that no real names/roles appear in the public repo. Repo stays public.

## The problem
The demo seed users in `js/store.js` contained **real Zimmer Biomet colleagues** — full names paired with role,
department and work location — committed to a **public** repo since the first commit. CC replaced them with
invented names at HEAD (`35b659b`, v=18), so the *current* files are clean, **but the real data is still in git
history** and is publicly readable by checking out old commits. Sean confirmed the names are real and must not be
public ("that should stay in the database… set by themselves at onboarding"). `CLAUDE.md` already forbids this:
"Never commit … personal data … no employee list in the repo."

The specific real names are deliberately NOT listed in this (tracked) file — writing them here would re-commit the
PII we're removing. The authoritative set was derived from `git` history in-session (see the chat audit): **12
external colleagues** confirmed (cross-checked independently by Cowork against every historical blob of
`js/store.js`), **plus a "Donnae Abbood" seed** (13 real-person entries total). The other ~12 seed names in history
are CC's fictional replacements. CC/Sean work from the in-session list, not from a committed copy.

## Scope (do)
1. **Full-history audit first.** Grep the entire history (all branches, all commits) for: each known real name; any
   real email addresses; the employee spreadsheet (`Overzicht Medewerkers`) or any exported employee list; and any
   real, identifiable photos. Produce the list of affected commits/paths so we know the true blast radius before rewriting.
2. **Remediate history** per Sean's chosen approach (see decision below) — either a surgical rewrite that keeps
   history minus the PII, or a reset to a single clean commit. Force-push `main`.
3. **Coordinate the rewrite** with Sean (his force-push / re-clone; CC can't force-push without it going through
   the account with write access). Note it invalidates old SHAs — the BRIEF-014 version stamps reference commit
   SHAs, so the historical `d696b6e` stamp won't resolve after; going forward is fine.
4. **Re-verify after:** CI green, Pages redeploys, live app + version stamp still correct, matching unaffected.
5. **Confirm the scrub:** old commit URLs no longer show the names (spot-check on GitHub). Document honest
   residual caveats: GitHub may cache commit objects/PR views and any forks persist — for names (not credentials)
   a force-push + cache purge is the pragmatic bar; if we want more, GitHub Support can purge cached views.
6. **Prevent recurrence:** keep CC's "invented names only" comment in `store.js`; consider a lightweight
   pre-commit/CI grep for the known-name pattern. Demo seeds stay fictional, roles stay real.

## Decision needed from Sean (see AskUserQuestion)
- **Approach:** surgical history rewrite (`git filter-repo`, preserves Context/session history minus the PII) vs.
  reset to one clean commit (nukes all history — simplest, bulletproof, but loses commit + CI history).
- **Repo visibility:** keep public (GitHub Pages on free needs public) vs. make private (Pages from a private repo
  needs a paid GitHub plan). Separate lever; can be decided alongside or after.

## Guardrails (do NOT touch)
- Don't lose the current clean working tree — whatever approach, HEAD's files must match today's (invented seeds, v=18).
- Don't break CI / Pages / the live app. Re-verify after the force-push.
- Don't commit any real PII in the process (e.g. don't paste the real names into a tracked file — this brief keeps
  them only for the one-time audit; scrub this brief's name list once done if Sean prefers).

## Definition of done
Real employee PII is removed from git history (per chosen approach), history audited for anything else, `main`
force-pushed, CI + Pages + live app + stamp re-verified, residual caveats documented, recurrence guard in place.
