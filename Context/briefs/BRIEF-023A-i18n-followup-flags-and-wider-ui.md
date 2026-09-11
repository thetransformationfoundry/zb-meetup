# BRIEF-023A · i18n follow-up — SVG flags, wider UI coverage, translated notifications, talking-points language

**Branch:** `feat/multilingual` (continue) or `fix/i18n-followup` off it · **Status:** ready for CC · **From:** Sean, 2026-09-11
**Priority:** before Monday 14 Sep. Builds directly on BRIEF-023 (`acdf92d`, not yet merged).

## Why
Sean tested BRIEF-023 with his language set to **Romanian** and found the scoped translation stops short of
several high-traffic surfaces, plus one real bug and one visual request. This brief closes them so a NL/RO
colleague meets their language everywhere they'll actually look before launch. It deliberately widens the scope
BRIEF-023 held back — Sean's call, now that the core mechanism is proven green (harness 152/152).

Sean's exact findings (language = Romanian), verbatim intent:
1. Spin screen — good.
2. **Meetup screen still has English UI.**
3. **Notifications in English.**
4. Shared space top — good.
5. **Wall is in English** (titles/chrome).
6. **Leaderboard top English still.**
7. **How it works — English.**
Plus: **"nice flags on the cards"** instead of the `EN/NL/RO` pills, and **"the card of questions doesn't
change to Romanian"** (diagnosed below — it's the Talking-points card, not the discussion questions).

## Grounding — what the code actually does today (so CC doesn't re-diagnose)
- **Discussion questions already translate correctly.** `qText(q,lang)` (js/app.js ~L116) resolves `text_{lang}`
  and falls back to the live bank by id. Sean's Romanian screenshot shows the discussion questions in Romanian —
  that part works, leave it.
- **The real bug is the Talking-points card.** `talkingPointsHTML(m)` (js/app.js ~L894) renders the *partner's*
  icebreaker **questions in the partner's** language (the `${m.person.first} ${langBadge(...)}` chip cues "Ruben
  EN"), so a Romanian viewer reads English question prompts there. The partner's free-text **answer** can't be
  translated (leave it as written), but the **question prompt should render in the viewer's own language** via
  `qText(q, myLang())`. Keep the partner language badge on the card — it explains the answer is in their tongue.
- **The badge is a `langpill`** (js/app.js `langBadge()` ~L130): a text pill `EN/NL/RO`. CC chose a pill because
  emoji flags render inconsistently and English has no clean flag. Sean still wants flags — see scope item 1.
- **Notification bodies are stored English at send time** (`store.js` ~L208/290, `store-firebase.js` ~L292/301/422):
  e.g. `other.name+" accepted your match! ..."`. Each notif already carries a **`type`** (`accept|msg|welcome`)
  and a `target`. That's the hook for translating at render time — see scope item 4.
- **`ZB_T(key,lang)` / `t(key)`** and the one dictionary `window.ZB_I18N` in `js/i18n.js` are the single source.
  This brief only **adds keys** and **wraps more call-sites** — no new mechanism.

## Scope (do)

### 1. Flags on the language badge (replace the text pill)
Replace the `EN/NL/RO` text pill in `langBadge()` with a small **inline SVG flag**, so it renders identically on
every device (no emoji-font roulette). Decision (Sean, 2026-09-11):
- **English → the UK flag** (Union Jack). NL → Dutch tricolour, RO → Romanian tricolour.
- Keep it tasteful and small (≈18–20px wide, rounded corners, hairline border), inline SVG defined once (e.g. a
  `FLAG_SVG = {en,nl,ro}` map next to `langBadge`). No external assets, no emoji.
- Keep the existing `title`/`aria-label` ("Speaks English/Nederlands/Română") for accessibility.
- Apply everywhere `langBadge()` is already used: **match card, Talking-points header chip, own profile, Edit
  profile**. One function change flows to all call-sites — don't hand-place flags.
- If a flag ever fails to resolve, fall back to the current text pill (never render an empty badge).

### 2. Fix the Talking-points card language (the "questions don't change" report)
In `talkingPointsHTML(m)`, render each partner icebreaker **question** with `qText(q, myLang())` (the viewer's
language) instead of the raw English snapshot. Leave the partner's **answer** text exactly as written. Keep the
partner language badge chip. Net effect: a Romanian viewer reads the prompts in Romanian, the answers in whatever
the partner wrote.

### 3. Extend `t()` to the remaining high-traffic surfaces (all additive string extraction)
Add keys to `js/i18n.js` and wrap the call-sites. English canonical + fallback as always. Surfaces:

- **Meetup shared space leftovers** (js/app.js ~L908–931): the `"Your answer…"` textarea placeholder, the
  `"key idea"` tier pill label, `"Waiting on {first} to finish their part — your points don't depend on it."` and
  `"{first} has finished their part."`, the completed-recap card (`"Your answers"`, `"Only you (and admins) can
  see these…"`, `"Not answered"`), and the **Messages** entry card (`"Messages"`, `"Coordinate your meetups with
  your matches"`, `"{n} new"`). Use interpolation params for the name/count — don't concatenate translated
  fragments.
- **Messages screen** (`viewMessages()` ~L933): `"Messages"`, `"Your match chats appear here."`, `"No chats yet —
  accept a match to start talking."`, `"Your match conversations."`, and the Back label.
- **Wall** (`viewWall()` ~L962): `"Community wall"`, `"Celebrating meetups across ZB."`, `"Match of the day"`, the
  comment input placeholder `"Add a comment… use @ to mention"`.
- **Leaderboard + prize banner** (`viewRanks()` ~L971): `"Leaderboard"`, `"Getting to know colleagues, one meetup
  at a time."`, the prize paragraph, the three prize-card labels (`BEST IDEA / TOP OF BOARD / RUNNER-UP`) and the
  `"Prizes · winners announced end of October 2026"` chip, `"How it works"` button. Keep €amounts and "CB
  management judges" untranslated inside the sentence (proper nouns/figures) — translate the surrounding copy.
- **How It Works** content (`howitworks` view + `obHow()`): the header key `hiw_h` exists but the **5 step bodies
  are still English** — extract them. This is the screen Sean flagged as point 7.
- **Notifications chrome** (js/app.js ~L1116): `"Notifications"`, `"Tap one to jump to it."`, `"Clear all"`.

### 4. Translate notification bodies at render time (Sean: "translate now")
Notifications are stored English. Rather than translate stored strings, **render from `type` + params** in the
reader's language:
- When rendering the notifications list, if a notif has a known `type` (`accept`, `msg`, `welcome`), build its text
  from a `t()` template + the actor's name (e.g. `notif_accept` → `"{name} accepted your match! Open the shared
  space to coordinate."`, `notif_msg` → `"{name} sent you a message"`, `notif_welcome` → `"Welcome to ZB MeetUP!
  Tap Spin to find your first match."`). Pull the name from the stored text or, cleaner, store a `name` field on
  the notif going forward.
- **Back-compat:** old notifs (already in Firestore from testing) may lack a clean `name` field — fall back to the
  **stored English `text`** if the type is unknown or the name can't be recovered. Never render blank. (The Sat
  data wipe clears the test notifs anyway, so this is belt-and-braces.)
- Keep `_notify`/`addNotif` writing an English `text` too (so anything unmigrated still reads) — just add the
  structured fields the renderer prefers.

### 5. Fold in Donnae's Dutch corrections (native review is back)
Donnae reviewed the Dutch and returned 12 edits, now applied to `Context/questions-i18n.md` (the nl column is the
source of truth; header marks Dutch as native-reviewed, Romanian still a draft). CC must **reseed the question bank
with the corrected NL text** — same reseed path as BRIEF-023 (admin opens the dashboard → writes `text_nl`/`text_ro`
→ bumps the marker). Since BRIEF-023 hasn't merged yet, just make sure the seed data reads the current
`questions-i18n.md` so the corrections land on the **first** live reseed (no separate migration needed). If any NL
text was already hard-coded in the seed constant rather than read from the source, update these 12 by id:

- `t1q7` → "Start / Stop / Doorgaan: noem één ding waar we mee moeten gaan beginnen, één waar we mee moeten stoppen en één wat we moeten behouden."
- `t1q15` → "Welk rapport, controle of administratieve stap zou geautomatiseerd kunnen worden zodat je je op waardevoller werk kunt richten?"
- `t1q16` → "Heb je de ZB AI Portal al gebruikt en wat vind je ervan? Hoe kan het verbeteren?"
- `t1q18` → "Welke technologie of welk gereedschap zou jouw werk makkelijker maken?"
- `t1q21` → "Waar worstelen nieuwe collega's het meeste mee in hun eerste weken – hoe kan de onboarding beter?"
- `t1q27` → "Stel je voor dat een nieuwe collega uit het jaar 2040 Hazeldonk bezoekt. Waar zouden ze om lachen als ze zien hoe we vandaag werken?"
- `t1q28` → "Als onze grootste klant een 12-jarige was, hoe zou je uitleggen wat we doen – en wat zouden ze maar raar vinden?"
- `t1q29` → "Bedenk een compleet belachelijk product of dienst voor ZB. Vertel dan welk serieus idee er achter verstopt zit."
- `t1q31` → "Je bent benoemd tot Minister van Dinsdagen. Wat zou je doen om elke dinsdag bij ZB beter te maken?"
- `t1q33` → "Er begint maandag een robot in jouw team. Beschrijf zijn functieomschrijving in drie regels."
- `t2q5` → "Waarover zouden je collega's verrast zijn om over je te weten te komen?"
- `t2q32` → "Als je morgen de loterij wint, wat is het eerste (verstandige) en het eerste (minder verstandige) dat je zou doen?"

The other 56 Dutch strings were approved unchanged. Romanian is untouched (still a machine draft — a native
speaker check is tracked separately, not launch-blocking).

## Guardrails (do NOT touch)
- English is always the fallback; a missing key/translation renders English, never blank (existing `ZB_T` contract).
- **Admin stays English** — dashboard, question-bank editor labels, CSV export all remain English canonical. Do
  not translate admin or the export (BRIEF-023 rule holds).
- Keep matching / points / countdown / **Firestore rules** unchanged. This is presentation only — **no rules change,
  no data-model change** beyond optionally adding descriptive fields to *new* notifications.
- Keep the two stores' `ZB_STORE` API in lockstep if you add any notif field.
- One dictionary (`js/i18n.js`), one `langBadge()`, one `qText()` — don't fork per-screen copies.
- Free-text **answers** across languages are still not translated (out of scope — the later answer-translation
  layer). The badge remains the bridge.

## Test steps (set language to Romanian unless noted)
- `node tools/test-demo.js` green — add coverage: `talkingPointsHTML` uses viewer language; a notif of each type
  renders via `t()`; an unknown-type notif falls back to its stored English `text`; `langBadge` returns a flag for
  each of en/nl/ro and the text-pill fallback for an unknown code.
- **Flags:** match card, Talking-points chip, profile and Edit-profile all show the SVG flag (UK for EN). No
  broken/empty badge, no emoji.
- **Talking points:** open a shared space with an English-speaking partner → the icebreaker **question prompts**
  are Romanian, the partner's **answers** stay as written, the partner chip still shows their flag.
- **Meetup screen:** placeholder, tier pill, "Waiting on…/has finished", recap card and the Messages card all
  Romanian.
- **Notifications:** the screen chrome and the accept/message/welcome bodies all Romanian. Create a fresh accept
  (two accounts) and confirm the new one is Romanian; an old English-only notif still renders (fallback).
- **Wall / Leaderboard / How It Works:** titles, subtitles, prize banner, prize-card labels and all 5 how-it-works
  steps render Romanian; €amounts intact.
- Switch to **Dutch** and re-check the same surfaces; switch back to **English** and confirm no key-names leak
  (i.e. no raw `notif_accept` showing).
- Admin dashboard, question-bank editor and CSV export are **still English**.

## Definition of done
Language badge is an SVG flag (UK/NL/RO) everywhere `langBadge` is used; Talking-points question prompts follow the
viewer's language; meetup leftovers, Messages, Wall, Leaderboard/prize, How-It-Works content and Notifications
(chrome + bodies, render-from-type with English fallback) all translate; admin + export stay English; no rules or
data-model change beyond additive notif fields; harness green with the new assertions; `?v=` bumped; tracker +
session log updated. NL/RO wording remains the machine-draft pending native review (unchanged from BRIEF-023).
