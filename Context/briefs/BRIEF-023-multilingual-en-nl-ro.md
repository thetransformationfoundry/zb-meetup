# BRIEF-023 · Multilingual (English / Dutch / Romanian) — language picker, translated questions + core UI, language flag

**Branch:** `feat/i18n`  ·  **Status:** ready for CC  ·  **From:** Sean/Donnae, 2026-09-11
**Priority:** before Monday 14 Sep (Sean's call). Push (BRIEF-004) moves to post-launch fast-follow to make room.

## Why
Most GSCC colleagues are **Dutch** or **Romanian**. Letting people pick a language and see the **questions** (and core
UI) in it helps them express themselves — especially the personal icebreakers. Matching stays cross-language; a
**language flag on the match card** cues you to who you're meeting.

## Languages
`en` (English, default/fallback) · `nl` (Dutch) · `ro` (Romanian).

## Scope (do)
1. **Language picker.** Add a language field `lang` (`'en'|'nl'|'ro'`) on the user profile, chosen at **onboarding
   as an early step** (so the rest of onboarding renders in that language), and editable later on **Edit profile**.
   Default `en`.
2. **Translated questions.** Question docs get `text_nl` and `text_ro` alongside `text` (English canonical). Display
   `text_{lang}` with **English fallback** if a translation is missing. Applies to the onboarding icebreakers and the
   meetup discussion questions (each viewer sees the question in *their own* `lang`). **Admin export stays canonical
   English** (`text`) so the idea-bank is consistent. Translations come from `Context/questions-i18n.md` (below);
   admin can edit any language in the question bank (extend the BRIEF-008 editor to the two extra fields).
3. **Core UI copy (scoped — NOT every string).** Add a small `t(key)` lookup (`js/i18n.js`: `{ key: {en,nl,ro} }`)
   driven by the user's `lang`, and translate the **high-traffic surfaces only**: onboarding steps + the language/
   work-setup/role/photo/consent labels, the icebreaker "A little about you" screen, How It Works, the Spin/match
   card + buttons, the meetup shared-space labels (Talking points / discussion / share a photo / complete), primary
   buttons, and the consent/GDPR copy. Leave admin, deep edge screens, and low-traffic text English for now (a later
   pass). English fallback for any missing key. Keep it single-source (one dictionary).
4. **Language flag on the match card.** After a spin, show the matched colleague's language as a small tasteful
   **badge** on their card (e.g. a country flag or an `EN`/`NL`/`RO` pill) — a "greet them in their language" cue.
   Also nice on the profile + Talking points header. Keep it on-brand (no clashing emoji in nav; a small flag/pill is fine).
5. **Reseed** questions with the NL/RO text (bump the `app/questionBank` seed marker), and **migrate existing users**
   to `lang:'en'` by default. Bump `?v=`.

## Known limitation (state to users later, not this brief)
Translating the questions + UI lets each person *navigate* in their language, but a colleague still can't *read*
another's free-text answer across languages — that needs the live **answer-translation API** (DeepL/Google via a
Cloud Function), a **later layer**. The language flag bridges it for launch.

## Guardrails (do NOT touch)
- English is always the fallback; never show a blank because a translation is missing.
- Admin idea-bank/export stays **English canonical** (don't export NL/RO answer prompts).
- Keep `ZB_STORE` API in lockstep; keep matching/points/countdown/rules unchanged.
- Scope UI to the core surfaces above — don't attempt a full-app string extraction before Monday (regression risk).
- Machine-translated drafts (`questions-i18n.md`) are **pending native review** (Dutch: Donnae; Romanian: a native
  speaker). Ship with drafts, refine via the admin editor after — the mechanism must not hard-depend on final wording.

## Test steps
- `node tools/test-demo.js` green (add: `t()` falls back to English for a missing key; a question with no `text_ro`
  falls back to English for a `ro` user).
- Onboard picking **Dutch** → onboarding + icebreakers render in Dutch; answers save. Same for **Romanian**.
- Spin → the match card shows the colleague's language badge. Open the meetup → discussion questions show in *your* language.
- Admin → question bank shows/edit all three languages; CSV export still shows the **English** question text.
- Switch language on Edit profile → the app re-renders in the new language.

## Definition of done
Users pick EN/NL/RO at onboarding (editable later); questions + core UI render in their language with English
fallback; match cards show a language flag; questions reseeded with NL/RO (admin-editable, English export);
existing users default to `en`; demo harness green; `?v=` bumped; tracker + session log updated. Native review of
`questions-i18n.md` tracked separately.
