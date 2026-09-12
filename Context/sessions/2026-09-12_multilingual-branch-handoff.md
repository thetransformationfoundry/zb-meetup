# `feat/multilingual` — branch handoff for Cowork
**Merged to `main` and deployed 2026-09-12 · v=48 · `42492e5` · harness 203/203**
Covers BRIEF-023 (EN/NL/RO) and BRIEF-023A (follow-up), eleven rounds of iteration.

## What shipped
A colleague picks **English, Nederlands or Română** during onboarding and can change it any time from
**Edit profile**; the whole app re-renders immediately in that language.

**Architecture — one dictionary, no build step.** `js/i18n.js` holds every string as
`{key: {en, nl, ro}}` and exposes `ZB_T(key, lang, params)` with `{param}` interpolation. `app.js` wraps it
as `t(key, params)` using `myLang()`. English is always the fallback: an unknown key renders the key itself,
never a blank. **277 keys, none missing a language** (asserted in the harness).

**Questions are translated as data, not UI.** Each of the 68 bank questions carries `text_nl` / `text_ro`
alongside `text`. `qText(q, lang)` resolves them, and — importantly — when handed a match's *stored English
snapshot* it looks the question up **by id in the live bank** to find the translation. Both stores carry all
68, byte-identical to `Context/questions-i18n.md` (272 comparisons, zero mismatches), including Donnae's 12
Dutch edits and the 30 Romanian edits from Sean's friend, both native-reviewed.

**Deliberately English:** the splash screen (Sean's decision) and the admin dashboard + CSV export (only the
two admins see it; the export is the canonical English record).

## The method change that mattered
Rounds 1-8 each fixed whatever a screenshot showed, so coverage was only ever as good as the last screenshot.
Round 9 replaced that with an **audit of every string literal in `app.js` that reaches the DOM** — text
between tags, `toast()` arguments, `textContent=` assignments — checked against the dictionary. It found a
large set of untranslated colleague-facing surfaces that no screenshot had covered, including the **bottom tab
bar**, You, Edit profile, the delete-account confirm, the bug report form, the message thread, the meetup
hero, the countdown screen, the Add-to-Home-Screen hint, the stale-build banner, and ~20 toasts across
sign-in, onboarding, spin and the photo picker. 79 keys added in one pass.

**Recommendation for future briefs: audit the literals, don't wait for screenshots.** The command is cheap and
it is the only way to find text on screens nobody thought to open.

## Bugs worth remembering
- **`qText` first read `text_*` off the match's English snapshot** — every discussion question would have
  stayed English. Fixed with the bank lookup by id.
- **`myLang()` preferred a stale `OB.lang`**, so changing language later never reached the icebreaker step.
  The saved profile now wins; `OB.lang` only leads during first-run onboarding.
- **`iceStart` reshuffled on every open** — "Edit answers" showed three *different* questions with empty
  boxes, and saving **discarded the colleague's answers**. Re-opening now keeps what was answered.
- **The Save button promised an already-earned +10.** Gated on `icebreakerBonusPending()`, used by both the
  render and the keystroke handler, so the label only promises points the save will actually pay.
- **Three functions declared a local `const t`** (`viewCountdown`, `cdTickOnce`, `sendBug`) which shadowed the
  translate helper — `t('key')` inside them would have thrown at runtime. Renamed, with comments. **Grep for
  `const t=` before adding translations to any function.**
- **BRIEF-023A suggested storing a `name` field on notifications** while forbidding rules changes. The
  published notifications rule has a `hasOnly` allowlist, so that write is **denied** — and because `addNotif`
  is non-fatal, cross-user notifications would have silently stopped again (the BRIEF-003 bug). Implemented,
  observed, **reverted**; the name is recovered from the stored English text instead. No rules publish needed.

## Two process findings
1. **A reported bug that was not a bug.** A Dutch signup showed an English countdown. `grep -c "COUNTDOWN TO
   LAUNCH" js/app.js` returned **0** — the string was not in the app at all, so the page under test was not
   the app. `lsof` showed the local server rooted in a **stale v=46 snapshot** in a scratchpad directory.
   When a local test contradicts a green harness, **confirm what is being served before touching code**.
2. **The safety step must not run last.** `tools/refresh-demo.sh` copied files and appended the
   `ZB_LIVE = false` override at the end. A permission error on one asset tripped `set -e` after the JS was
   copied but before the override — leaving the local demo wired to **live Firestore**. It now builds in a
   staging dir, applies the override, refuses to swap in a copy without it, and only then replaces the old
   one. Generalisable: if the safety step is last, every failure mode removes the safety.

## Testing
203 harness checks. The language checks were each verified to **fail** when `ZB_T` is forced to English — two
early drafts passed vacuously because a completed match renders the recap rather than the hero or an empty
thread, and were rewritten against a freshly created active match. Also fixed a **pre-existing flake**: the
meetup-type check listed five of six types, so a litter-pick draw failed at random.

## Open / next
- **An admin must open the admin dashboard once** on the live site to run the `SEED_VERSION 3` reseed, which
  pushes the reviewed Dutch + Romanian question text into Firestore. Until then live questions stay English.
- The **UI dictionary itself (277 keys) has never had a native review** in either language — only the 68
  questions were reviewed. Worth a brief.
- The launch date "Wednesday 16 September at 09:00" is now **hardcoded in three languages** (`cd_opens`,
  `spin_locked_toast`). If the date moves, all of them need editing — or derive it from `unlockParts()`.
- The **A2HS hint auto-shows on a 2.5-3.5s timer**; if the profile has not loaded by then it renders in
  English. Self-correcting (the chip re-opens it translated) and consistent with the English splash.
- `CB management` still appears in **`BRIEF-018` and the 3 Sep kickoff log**. Shipped copy now says **ZB**;
  the briefs are Cowork's record to correct.
- **BRIEF-004 (push notifications)** is next in the queue, carrying two deferrals: the Auth `beforeCreate`
  blocking function (needs Identity Platform) and the instant photo-award Cloud Function.
