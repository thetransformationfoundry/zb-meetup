# Session — 2026-09-11 · BRIEF-023 · multilingual EN/NL/RO (v=38)

**Branch:** `feat/multilingual` (off `main` @ c7927bf) · **Status:** built, harness 152/152 green,
**awaiting Sean's test + merge + a reseed**.

## What we did
- **`js/i18n.js`** — one dictionary, `{ key: { en, nl, ro } }`, 82 keys, plus `window.ZB_T(key, lang)`.
  English is the fallback for a missing language **and** a missing key; an unknown key returns the key itself
  rather than a blank, so a gap is visible in testing instead of silently empty. Loaded from `index.html`
  ahead of `app.js` and by the harness.
- **Language picker** as the step **straight after the account is created**, so every following onboarding
  screen — name, role, work setup, photo, consent, icebreakers — is already in the chosen language.
  `lang` persists on the profile, defaults to `en`, and is editable on **Edit profile** (changing it
  re-renders immediately).
- **Translated questions.** `text_nl` / `text_ro` added to all 68 question docs in both stores, taken from
  `Context/questions-i18n.md`. English `text` stays canonical.
- **`qText(q)`** resolves the viewer's language with English fallback — and it looks the question up **by id
  in the live bank** when given a match's snapshot, because a match stores `{id, t}` in English. That is what
  makes both participants read the same question each in their own language while the export stays English.
- **Core UI translated** on the scoped surfaces only: onboarding (all steps), consent/GDPR, the icebreaker
  screen and the You-screen icebreaker card, spin/match card and buttons, and the meetup shared-space labels.
  Admin and low-traffic screens stay English, per the brief.
- **Language badge** — a compact `EN`/`NL`/`RO` pill (not an emoji flag, so it renders identically on every
  platform and matches the `tierpill` treatment) on the match card, the Talking points header and your own
  profile.
- **Admin editor extended**: English (labelled canonical and required), Nederlands and Română per question,
  and the bank list shows an `NL·RO` marker for which translations exist.
- **Reseed** via `SEED_VERSION 3`; existing users default to `lang:'en'` via `profileToPublic` and the
  signup default.
- `?v=` 37 → 38.

## Two things cross-checking caught
1. **`t1q9`'s English differs between the source and the i18n file** by a double space
   (`€10,000 -  €100,000`). Harmless — but it is why the translations are keyed strictly **by id** and the
   i18n file's English is treated as informational. Matching on English text would have silently dropped that
   question's translations.
2. **`qText` first version was wrong.** It read `q['text_'+lang]` off the object it was given — which for a
   meetup question is the match's English snapshot, so every discussion question would have stayed English no
   matter what language you picked. The bank lookup by id fixes it; the harness asserts both the translated
   and the fallback path.

## Honest limits
- **NL/RO are machine-translation drafts pending native review** (Dutch: Donnae; Romanian: a native speaker).
  Nothing depends on the exact strings — they are editable in the admin question bank, and the UI dictionary
  is one file to correct.
- **Colleagues still cannot read each other's free-text answers across languages.** The questions and the UI
  are translated; the answers are not. The language badge is the launch-time bridge ("greet them in their
  language"); live answer translation would need a Cloud Function and is a later layer.
- The UI is scoped: admin, the wall, leaderboard, notifications and the countdown remain English. A colleague
  who picks Dutch will still meet English in places — deliberate, to avoid a full extraction before Monday.

## Harness (12 new checks, 152 total)
The language step renders with all three; onboarding then renders in Dutch and in Romanian and back in
English; `t()` falls back for a missing language and returns the key for an unknown one; a question with no
Romanian falls back to English while one with Romanian shows it; the CSV export stays English for a
non-English viewer; and the language badge appears on the match card, the Talking points header and You.

## Live note
As with BRIEF-020, the reseed runs when an **admin opens the admin dashboard** — that is what writes the
NL/RO text into `questionBank` and bumps the marker to `seedVersion: 3`. Until then live serves the
English-only docs and every question simply falls back to English, which is the designed behaviour rather
than a break.
