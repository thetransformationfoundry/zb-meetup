# Session — 2026-09-09 · BRIEF-015 · GSCC/EMEA roles + QARA matching + onboarding reorder (v=17)

**Branch:** `feat/emea-gscc-roles` (off `main` @ d696b6e) · **Status:** built, harness 47/47 green,
**awaiting Sean's test + merge**.

## What we did
- **`ROLES` regenerated from `Context/roles-source.txt`** by the agreed transform: 107 verbatim rows, every one
  prefixed `GSCC ` except `GSCC - QARA` and `EMEA - QARA Commercial`, plus `Other` last → **108 options**,
  all unique, no double prefixes. Generated and asserted rather than hand-typed.
- **Named constants, no inline literals:** `EMEA_ROLE`, `GSCC_QARA`, `QARA_SET`. The matching rule keys off
  these, so the two exact labels live in one place.
- **Matching (`eligible()`)** — the floor/remote line is **byte-for-byte unchanged**; the EMEA clause is added
  above it:
  EMEA↔EMEA ✓ · EMEA↔`GSCC - QARA` ✓ · EMEA↔any other GSCC ✗ · `GSCC - QARA`↔all GSCC unaffected, plus EMEA.
- **Legacy migration, on read.** `normalizeRole()` maps `QARA Manager` and `Quality Specialist` →
  `GSCC - QARA`, `NonEE Warehouse Clerk` → `GSCC Warehouse Clerk`, any other old role → `GSCC <old>` when that
  exists in the new list, and anything unknown → `Other`. Applied in `refresh()` to `C.me`, `C.users` **and**
  each match's `person` — matches carry a profile snapshot taken at creation time, so they hold legacy strings
  too. Nobody is left on a role absent from the list.
- **Onboarding reordered** to Role → Work setup on the same step, heading leads with role, and the
  **`GSSC` → `GSCC` typo is gone**. `obWork()` still drives `floor` from the warehouse work-setup option.
- **`deptForRole()` widened** for the new names: QARA/quality is tested first, `\bIT\b` is word-bounded so it
  no longer catches "Litigation", and four departments were added (Finance & Procurement, HR/Legal/Compliance,
  Marketing & Med Ed, Supply Chain). Distribution across all 108: Distribution 17, Sales 13, IT 13, Finance 11,
  Supply Chain 11, Marketing 9, HR/Legal 7, Pricing 7, CX 4, QARA 3, generic fallback 13.
- **Demo seeds** now include `GSCC - QARA`, `EMEA - QARA Commercial` (a remote EMEA colleague) and a user
  still on the legacy `QARA Manager`, alongside the existing floor and remote users — so the harness exercises
  every branch. **All seed colleagues are fictional** (see below).
- `?v=` 16 → 17.

## Two judgement calls
1. **The role select has no default.** With 108 options, defaulting to whichever sorts first would silently
   mislabel people, so there is a disabled `Select your role…` placeholder and `obWork()` refuses to continue
   without a choice. Slightly beyond the brief; the alternative was worse.
2. **Migration on read, not write-back.** Safest per the brief: no bulk write over live user docs, and it
   self-heals if an old string reappears from a stale profile snapshot. The cost is that Firestore still holds
   the old string until that user next saves their profile — cosmetic only, since every read normalises.

## Harness (12 new checks, 47 total)
108 roles with both labels verbatim and `Other` last; legacy normalisation incl. unknown → `Other`; a GSCC
non-QARA never sees EMEA; EMEA sees only itself + `GSCC - QARA`; `GSCC - QARA` sees all GSCC plus EMEA; a
legacy-role colleague is matchable after normalising; the floor rule still yields on-site only and never a
remote colleague; and the role step now refuses to continue without a role.

To assert the real `eligible()` / `normalizeRole()` rather than a reimplementation, the harness injects test
exports **inside** `app.js`'s IIFE (it is wrapped in one, so appending put them out of scope) — **no
test-only hooks were added to production code**. Pool assertions drive `ZB_STORE.saveMe()` + a real refresh,
so migration is exercised end to end.

## Flagged, not changed
`deptForRole()` still returns the department label **`IT - EMEA`** for IT roles. That predates this brief, but
now that "EMEA" names a specific role and site, an IT colleague showing `IT - EMEA` next to
`EMEA - QARA Commercial` reads confusingly. Renaming it is a one-word change but it is a **product/labelling
decision** (it appears on profiles, spin cards and the shared space), so it is Sean's or Donnae's call, not mine.


## Privacy fix prompted by Sean's review (2026-09-09)
Sean asked whether the seed colleagues shown on the spin card are hardcoded test data. They are — demo-store
only, never written to Firestore, never seen by a live user — but his question exposed something worse that I
had made a step toward: I had seeded `GSCC - QARA` as **"Donnae Abbood"**, a real person, with her role and
work setup, in a **public repo**.

Checking the file properly, the nine pre-existing seed colleagues (`Noor Baaijens`, `Wessel Duifhuis`,
`Ilse Verkerk`, `Bram Roelofsen`, `Sanne Kolthoff`, `Timo Vermeulen`, `Joris Stevens`, `Maud Hendriks`,
`Lars Wieringa`) read like real Dutch/EMEA colleagues, each paired with a specific role, department and work
location. `Context/holding-photos.md` explicitly labels the *wall* pairs as dummy names; nothing said the same
of the seed **users**. Name + role + site for a real colleague is personal data, and `CLAUDE.md` is
unambiguous: *"Never commit secrets or personal data… no employee list in the repo."*

**Action taken:** all twelve seed colleagues are now clearly **fictional**, with a comment in `js/store.js`
saying so and warning against putting a real colleague's details there. Roles remain genuine `ROLES` entries,
so the demo still exercises real matching — only the people are invented. Nothing in the app or harness keys
off the names, so the change is inert beyond the demo UI.

**Open question for Sean:** were those nine original names taken from the employee spreadsheet? If so they
were in the public repo from the first commit and are in git history, which a rename does not erase. If any is
a real colleague, say so and we can decide whether history needs rewriting before the wider invite — a public
repo, a real name, and their role and work location together is the kind of thing worth being sure about.
