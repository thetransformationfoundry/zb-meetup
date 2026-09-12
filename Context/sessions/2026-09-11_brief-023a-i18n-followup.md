# Session — 2026-09-11 · BRIEF-023A · i18n follow-up (v=39)

**Branch:** `feat/multilingual` (continues `acdf92d`) · **Status:** built, harness 178/178 green,
**awaiting Sean's test + merge + a reseed**. Presentation layer only.

## What we did
1. **SVG flags replace the text pill.** `langBadge()` now renders an inline SVG — Union Jack for English,
   Dutch tricolour, Romanian tricolour — at 20×13 with rounded corners and a hairline border. Inline rather
   than emoji so it renders identically everywhere (Windows shows emoji flags as letter pairs). One function,
   so the match card, Talking-points chip, profile and Edit profile all changed together. If a flag ever fails
   to resolve it falls back to the old text pill — and the harness tests that branch by deleting a flag from
   the map, not by assuming it.
2. **Talking-points language bug fixed.** The card rendered the partner's icebreaker *question* from their
   English snapshot, so a Romanian viewer read English prompts. Now `qText({id, text}, myLang())` — prompts in
   the viewer's language, the partner's **answer** left exactly as written, their flag still on the chip.
3. **Wider `t()` coverage**: meetup leftovers (answer placeholder, `key idea` pill, waiting/finished lines,
   complete hint), the whole completed recap, Messages (card + screen + composer), Wall, Leaderboard and the
   prize banner, all five How-It-Works step bodies, and the Notifications chrome. 136 dictionary keys now.
4. **Notifications translate at render time.** `notifText(n)` builds from `type` + name in the **reader's**
   language, falling back to the stored English for unknown types. `t()` gained `{param}` interpolation so
   word order stays correct per language instead of concatenating fragments.
5. **Donnae's 12 Dutch corrections folded in** and both stores regenerated from `questions-i18n.md`. Verified
   by script: all 68 NL and 68 RO strings byte-match the source, and all 12 corrections are present.

## A conflict in the brief, resolved the safe way
The brief suggested storing a `name` field on new notifications ("cleaner"), while the guardrails said **no
rules change**. Those can't both hold: the published notifications rule has a `hasOnly` field allowlist, so a
notif carrying `name` would be **denied** — and because `addNotif` is deliberately non-fatal (BRIEF-003),
cross-user notifications would have silently stopped appearing again, exactly the bug we already fixed once.

I added the field, saw the allowlist, and **reverted it**. `notifText()` recovers the name from the stored
English sentence instead, which is the brief's other suggested route and needs no rules change. If Sean wants
the cleaner structured field, it is one word added to the rule allowlist — his publish, his call.

## Two of my own mistakes, caught by checking
- A `git checkout` I used to undo the name field nearly reverted the regenerated translations too. Verified
  `t1q7` afterwards rather than assuming, and it had survived.
- My in-place translation rewrite matched `{ id:"t2q…"` and so **injected `text_nl`/`text_ro` into the three
  DEMO_ICE entries**, which share that shape. Harmless at runtime but wrong; found by noticing the file had 71
  "question" objects instead of 68, and cleaned.

## Deliberately unchanged
Admin dashboard, the question-bank editor labels and the **CSV export stay English** (asserted). Matching,
points, countdown, rules untouched. Free-text **answers** are still not translated across languages — the flag
remains the bridge; live answer translation is a later layer.

## Harness (28 new checks, 178 total)
Flags per language and the real pill-fallback branch; talking-points prompts follow the viewer; `t()`
interpolation; notifications by type, with name recovery from old English text, unknown-type fallback and
welcome; Wall / Leaderboard+prizes / Messages / Notifications / How-It-Works all render Romanian; **no raw
i18n keys leak**; English restores; and the export stays English.

## Live note
The reseed still runs when an **admin opens the admin dashboard** — that is what writes the corrected Dutch
into `questionBank`. Until then live serves whatever is already there and falls back to English.

## Round 2 — Sean's Romanian screenshots (v=40)
Sean re-tested in Romanian and found three surfaces still English. All now covered:
- **"My meetups"** (his point 3) — heading, subtitle, `Active`/`Ready`/`Waiting…`, `Open shared space` /
  `Review & complete`, the `Completed` section and the "waiting on {name}" line.
- **How It Works hero card** (his point 7, "main card in english") — `FIVE SIMPLE STEPS`, the title and the
  standfirst. The five steps were already translated; the hero above them was not.
- **The completed recap** (his point 9, "not sure") — `Meetup with {name}`, `your part is complete`, the
  points breakdown (`Shared photo +5` / `No photo — no photo points` / `Your questions +5`), the partner
  status line, the photo button, and the Talking-points subline.
- Plus the leftovers an audit turned up: the empty-meetups line, "Meetup not found", "You've finished your
  part of this meetup", "View the recap", "For Zimmer Biomet colleagues only", and every `Back` label.

**Meetup types are now translated for display.** `a shared break`, `a Teams coffee call` and the rest were
rendering raw. They are **data** — stored in English on the match and relied on by the admin/export — so
`typeLabel()` maps the stored English to a key for display only, falling back to the raw string if a new type
ever appears. The stored value is untouched.

**A miss worth recording:** the prize paragraph had not actually been wired in round 1 — my replacement
silently matched nothing, and I only caught it by re-running a "what English literals remain in this view"
audit rather than trusting the earlier pass. That audit is why the four leftovers above were found too.

## Round 3 — a real bug in the language switch (v=41)
Sean switched from Romanian to Dutch, tapped **Beantwoord 3 vragen** on the You screen, and got the
icebreaker step **still in Romanian** — in English too. Everything else followed the new language.

**Cause.** `iceStart()` sets `mode="onboarding"` so it can reuse the onboarding shell, and `myLang()` read
`(mode==="onboarding" && OB.lang) || C.me.lang`. `OB.lang` is set once during first-run onboarding and is
never updated by Edit profile — so any screen that runs in onboarding mode rendered in **the language picked
at signup**, permanently. It only showed on the icebreaker step because that is the one such screen reachable
after onboarding.

**Fix.** The saved profile now wins: `(C.me && C.me.lang) || (mode==="onboarding" && OB.lang) || "en"`.
`OB.lang` still leads during genuine first-run onboarding, where no profile exists yet. `iceStart()` also
syncs `OB.lang` from the profile as belt and braces.

Three regression checks added — the step follows the current language, follows a second change, and returns
to English — because a stale-state bug like this returns the moment someone adds another screen that borrows
the onboarding shell.

## Round 4 — language first, and the pre-login screens (v=42)
Sean asked whether the language step should come **before** the account screen. It should: as built, a Dutch
or Romanian colleague met English on the very first screen they interact with — the worst possible place,
since it is also where they decide whether the app is for them.

- **Language is now the first onboarding step.** Welcome → *language* → create account → name → role → photo
  → consent → icebreakers → award. The account screen, and everything after it, renders in the chosen
  language.
- **The pre-login screens are translated**: create-account (heading, standfirst, both field labels, password
  hint, all three buttons), the sign-in screen, the forgot-password/"check your email" screen including the
  junk-folder guidance, and the **award screen** (eyebrow, headline with the name interpolated, sub-copy,
  both point chips, balance, both buttons). These were the last English islands in a Romanian session.
- **The picker defaults to the device language.** `navigator.language`, narrowed to en/nl/ro with English as
  the fallback. This matters for the screens that come *before* any choice — the splash and, for a returning
  colleague, the sign-in screen — which have no profile to read. A Dutch colleague on a Dutch device now sees
  Dutch from the first paint rather than after the picker.

Those keys existed from round 1 but had never been wired — I defined `ob_email`, `ob_create`,
`ob_have_account` and the rest and then translated only the later steps. The per-view "what English literals
remain" audit is what caught it, again.

Dictionary is now **195 keys**, all three languages complete.

### Still English before login
The **splash/welcome screen itself** (rotating taglines, the reel) stays English, since it renders before the
picker and the device-language default only covers the common case. A small flag switcher there would close
it — worth doing only if Sean wants it, as it adds a second place to choose a language.

## Round 5 — Romanian native review folded in (v=43)
Sean's Romanian reviewer returned **30 edits**, applied to `Context/questions-i18n.md` (its header now marks
Romanian native-reviewed, alongside Dutch). Both stores regenerated from the source by id.

**Verified the same way as Donnae's Dutch:** every one of the 68 NL and 68 RO strings in **both**
`js/store.js` and `js/store-firebase.js` is byte-identical to `questions-i18n.md` — 272 string comparisons,
zero mismatches. Confirmed Dutch was untouched (0 NL diffs), that exactly 30 Romanian strings changed, and
that no translation fields leaked onto the three DEMO_ICE entries this time (the mistake from round 1, where
those objects share the `{ id:"t2q…"` shape).

No rules change, no data-model change. `?v=` 42 → 43; harness 178/178 green.

**Both question sets are now native-reviewed.** The remaining machine-drafted text is the **UI dictionary**
(`js/i18n.js`, 195 keys) — never reviewed in either language. Worth tracking separately; it is one file and
correctable without a reseed, unlike the questions.

## Round 6 — a data-loss bug found by Sean's "are these random?" question (v=44)
Sean asked whether the icebreaker and discussion questions are randomised per user. Checking the code to
answer him turned up a real bug in `iceStart()`.

**What was wrong.** It reshuffled the bank **every time**, including when the colleague already had saved
icebreakers. So "Edit answers" presented three *different* questions with empty boxes, and `iceSave()` then
replaced the stored list with those three — **silently discarding the answers they had written**, and with
them the evidence of the +10 they had earned.

**Fix.** Re-opening now reuses the questions actually answered (resolved against the live bank so the
viewer's language applies), topping up at random only when there are fewer than three — i.e. first run, or a
partially completed set. Two regression checks: re-opening shows the answered questions, and saving after a
re-open preserves the answers.

**Randomisation, as answered to Sean:** icebreakers are 3 drawn at random from the 34 Tier-2 per colleague,
fixed once answered; discussion questions are 3 drawn at random from the 34 Tier-1 **per meetup**, snapshotted
on the match so both participants see the same three, each in their own language.

Validated the eight questions in Sean's screenshots against `questions-i18n.md` by id: the icebreakers were
t2q23 / t2q20 / t2q2, the talking points t2q23 / t2q11 / t2q25, and the discussion questions t1q3 / t1q14 /
t1q1 — all correct tiers, all matching the reviewed Romanian text exactly.

## Round 7 — two more English leaks in the icebreaker flow (v=45)
Sean's test of the round-6 fix surfaced two separate bugs, both in the same area:

1. **The You-screen card rendered the stored English snapshot.** A saved icebreaker is
   `{id, question, answer}` where `question` is the **canonical English** text captured at save time. The
   Talking-points card had been fixed to resolve it through `qText()` in round 2, but the colleague's *own*
   card on the You screen still printed `x.question` raw — so a Romanian user read their own icebreakers in
   English. Now routed through `qText({id, text:x.question}, myLang())` like every other question render.
2. **Typing overwrote the translated Save label with English.** `iceAns()` re-set the button text on every
   keystroke using hardcoded `'Save — earn 10 points'` / `'Save'`, so a fully Romanian screen sprouted an
   English button the moment the colleague typed. It now uses `t()`.

The second is the more instructive one: the *render* was correctly translated and the bug lived in an
imperative DOM update that ran afterwards. A screenshot taken before typing would have looked perfect — which
is exactly what the earlier rounds' screenshots were.

Three checks added (183 total): re-opened prompts render in the viewer's language rather than the stored
English, the Save label stays translated while typing, and the You card renders prompts translated.

**Confirmed working in Sean's test:** the round-6 fix held (the three answered questions came back with their
answers), editing one answer saved correctly, and the +10 did not re-award (points stayed at 40).

## Round 8 — stop promising a bonus that was already paid (v=46)
Sean: the Save button offered **"Salvează — primești 10 puncte"** when editing icebreakers he had already
completed during onboarding. The +10 is once per colleague, so the label was promising points that would
never arrive — the save succeeds, the balance does not move, and the app looks like it broke a promise.

`icebreakerBonusPending()` is now the single source, used by both the render and the keystroke handler: the
bonus label shows **only** when all three are answered **and** `icebreakerBonusGranted` is not yet set.
Everyone else sees a plain **Save / Salvează / Opslaan**.

The You-screen card was already correct on this — it swaps to the "+10 earned" variant once the bonus is
granted — so only the button needed the gate. Two checks: a colleague who has not earned it is offered it,
and one who has is not.

## Round 9 — verify the skip-then-set path, then audit for every remaining English string (v=47)
Sean asked to confirm that skipping the icebreakers during onboarding and setting them later from **You**
still offers the bonus, and sent two screenshots: the empty form showing a plain **Save**, then the same form
with all three boxes filled showing **Save — earn 10 points**.

That is the intended behaviour and the code now has a test for it rather than an assurance. The label is tied
to whether the save will *actually* pay: the bonus is granted only when all three are answered, so a form with
gaps offers a plain Save. Five checks cover the path — empty offers plain Save, two-of-three offers plain
Save, all three offers the bonus, saving grants the +10, and re-editing afterwards no longer offers it. The
block restores the surrounding section's state so it does not disturb the checks that follow it.

### The wider find: screenshots were never going to catch the rest
Rounds 1–8 each fixed whatever a screenshot showed. So instead of waiting for the next one, this round audited
`js/app.js` for **every string literal that reaches the DOM** — text between tags, `toast(...)` arguments, and
`textContent=` assignments — and checked each against the dictionary. That found a large set of untranslated
colleague-facing surfaces, most of which no screenshot had covered:

- the **bottom tab bar** (Spin / Meetups / Wall / Ranks / You) and the points chip in the app bar
- **You**, **Edit profile**, the **delete-account confirm**, and the **bug report** form
- the **message thread** (empty-state and unavailable-chat lines) and the **meetup hero**
- the **countdown** screen, the **Add to Home Screen** hint, and the stale-build **Update available** banner
- ~20 toasts and inline errors across sign-in, onboarding, spin and the photo picker

79 new keys in all three languages. The dictionary is now **250 keys, none missing a language**.

**A latent trap worth recording:** three functions declared a local `const t` — `viewCountdown` and
`cdTickOnce` (the countdown parts object) and `sendBug` (the textarea value). Each shadowed the `t()` translate
helper inside its own body, so calling `t('key')` there would have thrown at runtime rather than failing
quietly. The locals are renamed (`cd`, `txt`) with a comment saying why. Worth grepping for `const t=` before
adding translations to any function.

**Left in English deliberately:** the splash screen (Sean's call — he is happy for it to stay English) and the
admin dashboard plus CSV export helpers, which only the two admins ever see.

**Also fixed — a pre-existing harness flake.** "meetup type is translated for display" listed five of the six
type labels, so a random litter-pick draw failed the run at random. It now derives the expected strings from
the dictionary and additionally asserts that no English label leaks through. Six consecutive runs green.

197 checks. The eight new language checks were each verified to **fail** when `ZB_T` is forced to English, so
they assert something real — two earlier drafts passed vacuously because the completed match renders the recap
rather than the hero or an empty thread, and were rewritten against a freshly created active match.

### Still open
`cd_opens` and `spin_locked_toast` carry the hardcoded launch date ("Wednesday 16 September at 09:00") in all
three languages. Translating it did not change that it is hardcoded in three places now instead of one — if
the launch date moves, all three need editing.

## Round 10 — a test failure that was not a code failure (2026-09-12)
Sean signed up as a Dutch colleague and the countdown screen came back in English — screenshot attached to
the thread. The harness said otherwise, so one of the two was wrong.

The deciding check took one command: `grep -c "COUNTDOWN TO LAUNCH" js/app.js` returns **0**. The string in
Sean's screenshot does not exist anywhere in the app any more. So the page under test was not running the
app — it was running an older copy of it.

`lsof` on the two local servers found both rooted in **scratchpad snapshot directories**, not the repo:

- `localhost:8001` → `scratchpad/demo`, frozen at **v=46** (11 Sep 17:51), still holding the English literal
- `localhost:8002` → `scratchpad/demo-stale`, **v=16**, deliberately old (it exists to exercise the v=14
  build-stamp staleness banner — leave it alone)

The copy is not a mistake in itself: it exists so that `window.ZB_LIVE = false` can be forced, keeping local
testing away from live Firestore. The mistake is that it is a **snapshot**, so it drifts silently every time
the repo changes, and the drift presents as a product bug.

`tools/refresh-demo.sh` now re-copies the tree and re-applies the one-line demo override, and `_demo/` is
gitignored so a copy — which would contain no secrets but would duplicate the whole app — can never be
committed. `localhost:8001` now serves v=47 and the Dutch countdown, verified over HTTP rather than on disk.

**The lesson worth keeping:** when a local test contradicts a green harness, confirm *what is being served*
before touching the code. Grepping the source for the exact string in the screenshot settles it immediately —
if the string is not in the file, the file is not what ran. Re-run `sh tools/refresh-demo.sh <dir>` before
every local test pass.
