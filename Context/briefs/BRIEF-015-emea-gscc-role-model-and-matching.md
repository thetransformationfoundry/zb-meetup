# BRIEF-015 · Full GSCC/EMEA role list + QARA cross-site matching + onboarding reorder

**Branch:** `feat/emea-gscc-roles`  ·  **Status:** ready for CC  ·  **From:** Donnae/Sean, 2026-09-09 (full role list supplied)
**Priority:** launch-relevant — needed before EMEA colleagues are invited.

## Background
Built for **GSCC** (NL warehouse); **EMEA** now joins with a single role. Donnae supplied the full GSCC role list
(column F of the spreadsheet), saved verbatim at **`Context/roles-source.txt`** — that file is the source of truth.

## Decisions (confirmed 2026-09-09)
1. **Role list = `Context/roles-source.txt`, transformed:** that file was extracted verbatim from
   `Overzicht Medewerkers.xlsx` > Sheet2 and is **already deduped to 107 unique roles**. Keep
   `EMEA - QARA Commercial` and `GSCC - QARA` verbatim; **prefix every other line with `GSCC `**; append `Other`
   last → 108 options total. (The old 18-role list is fully replaced.)
2. **QARA is a single role** now — `GSCC - QARA` (Donnae collapsed the earlier Manager + QMS Specialist into one).
3. **EMEA role** = `EMEA - QARA Commercial` (exact label from the sheet).
4. **Matching:** `EMEA - QARA Commercial` matches ONLY {`EMEA - QARA Commercial`, `GSCC - QARA`}. `GSCC - QARA`
   matches everyone in GSCC as today **and** additionally EMEA. Only EMEA is restricted.
5. **Floor/remote logic unchanged** — an on-site/floor colleague still never matches a fully-remote one; that rule
   is driven by **work setup**, not role, and stays exactly as-is.
6. **Onboarding order flips:** ask **Role first, then Work setup** (currently work-setup is first — `app.js:344`).

## Current code (real refs)
- `ROLES` array: `js/app.js:131` (replace wholesale from the transformed source list).
- Matching pool filter (client-side, the only gate): `js/app.js:142` — floor rule lives here; add the EMEA clause here.
- Onboarding work-setup + role selects: `js/app.js:344` (reorder; also fix the typo **"GSSC"** → **"GSCC"** in the
  warehouse-floor option). Handler `obWork()` `js/app.js:379` reads `#ob-wc` + `#ob-role` — keep it working after reorder.
- `deptForRole()` `js/app.js:380` — substring/case-insensitive regex; re-check it still resolves departments
  sensibly against the new names (don't rewrite beyond what's needed).
- Demo seed users: `js/store.js:~27` — update roles + add an EMEA user (and keep a floor + a remote user) so the harness exercises everything.

## Scope (do)
1. **Generate `ROLES`** from `Context/roles-source.txt` using the transform in Decision 1. Define the two
   matching-critical strings as named constants — `EMEA_ROLE = 'EMEA - QARA Commercial'`,
   `QARA_SET = ['EMEA - QARA Commercial', 'GSCC - QARA']` — one source, no inline literals.
2. **Matching rule** — keep the floor rule at `app.js:142` exactly, and add:
   ```
   const involvesEmea = C.me.role === EMEA_ROLE || p.role === EMEA_ROLE;
   if (involvesEmea && !(QARA_SET.includes(C.me.role) && QARA_SET.includes(p.role))) return false;
   ```
   (EMEA↔EMEA ok, EMEA↔GSCC-QARA ok, EMEA↔any other GSCC blocked, GSCC-QARA↔all GSCC unaffected.)
3. **Onboarding reorder:** Role select first, Work-setup select second, on the same step; update the heading/copy to
   lead with role. Keep `obWork()` logic (floor set by the warehouse work-setup option). Fix `GSSC`→`GSCC`.
4. **Existing-user migration** (live users on old role strings). Provide a legacy→new map so nobody becomes
   unmatchable: old `QARA Manager` and `Quality Specialist` → `GSCC - QARA`; other old GSCC roles → `GSCC ` + old
   (they exist in the new list); `Other`/unknown → keep as `Other` (a normal non-QARA GSCC role for matching).
   Apply on read (safest) or one-time write-back — CC's call, but no user left on a role absent from the list.
5. **Demo seeds + harness** updated (below). Bump `?v=`.

## Guardrails (do NOT touch)
- **Floor/remote rule stays identical** — the EMEA clause is additive only.
- Matching remains a **client-side pool filter** (same layer as today) — no store API change, no security rule (matching is a suggestion, not an access boundary).
- Preserve the two labels EXACTLY: `GSCC - QARA`, `EMEA - QARA Commercial` (spaces + dash) — the matching keys off them.
- Don't drop `Other`; don't reorder roles beyond the prefixing.

## Open confirmations — all RESOLVED (2026-09-09)
- "After Sls Specialist" was the Sheet2 **column header**, not a role — no `Sls Specialist` to add.
- Sean confirmed **every** non-`EMEA - QARA Commercial` row is GSCC and gets the `GSCC ` prefix, including
  EMEA/global-sounding titles (e.g. `GSCC Finance VP EMEA`, `GSCC IT BRM EMEA/APAC…`). Only the two labels
  `GSCC - QARA` and `EMEA - QARA Commercial` stay verbatim.

## Test steps
- `node tools/test-demo.js` green with new assertions:
  - `EMEA - QARA Commercial` pool = only EMEA + `GSCC - QARA`.
  - `GSCC - QARA` pool = normal GSCC colleagues **and** EMEA.
  - A GSCC non-QARA role never sees EMEA.
  - Floor rule intact (floor ↔ on-site only; floor never sees fully-remote).
  - A user stored on a legacy role is normalized and matches correctly.
- Manual: onboarding now asks Role then Work setup; the full role list appears; the `GSSC`→`GSCC` typo is gone.

## Definition of done
Full GSCC role list (from `roles-source.txt`, all GSCC-prefixed) + single `GSCC - QARA` + `EMEA - QARA Commercial`;
EMEA matches only the QARA set while GSCC-QARA match all GSCC + EMEA; floor/remote rule unchanged; onboarding asks
role then work setup; existing users migrated; demo seeds + harness cover EMEA; `?v=` bumped; tracker + session log updated.
