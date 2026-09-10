# Session — 2026-09-10 · BRIEF-020 · icebreakers + tier split by purpose (v=29)

**Branch:** `feat/icebreakers` (off `main` @ d73cefc) · **Status:** built, harness 119/119 green,
**awaiting Sean's test + merge**.

## The reframe
Tiers stop meaning "asked earlier / later" and start meaning **what a question is for**:
- **Tier 1 — Idea** (34): asked in the meetup shared space, collected into the admin idea bank and the CSV.
- **Tier 2 — Icebreaker** (34): asked **once at onboarding**, stored on the user, shown to meetup partners as
  talking points, and **never exported**.

That is a privacy boundary as much as a UX one, so it is enforced in three places and asserted four ways.

## What we did
- **Reseeded the bank from `Context/questions-source.md`** — all 68 questions, **verified verbatim** against
  the source file character-for-character (a script compares each one; it caught nothing, which is the point).
  `SEED_VERSION` bumped to 2, which **replaces** the collection: authorised because we are pre-launch with no
  real answers. The marker moved from `{seeded:true}` to `{seedVersion:2}`, and the read understands both.
- **Onboarding icebreaker step**: 3 random Tier-2 questions between profile creation and the award screen, so
  the award screen reports the true balance (30 + 10 = 40). Framing is the brief's: *"shared only with the
  people you match with — never on the wall, and not collected by admins"*, plus a professionalism line
  ("keep it work-appropriate — these are shown to colleagues you'll be meeting"). **Skippable.**
- **+10 once**, guarded by `icebreakerBonusGranted` inside a transaction — the same pattern as the 30-point
  signup bonus, and it only grants when all three are answered.
- **Finish-it-later on You**: an unanswered state offers "Answer 3 questions" with a +10 pts chip; once done
  the card shows the answers with an "Edit answers" action and a "+10 earned" chip. Both open the same step.
- **Meetups show the partner's icebreakers** as a "Talking points" card above the discussion questions, read
  from the live user list with the match's profile snapshot as fallback — so answers filled in *after* the
  match was created still appear.
- **Meetup questions are Tier-1 only.** `pickQuestions()` draws from `ideaQuestions()`, and the old
  "first meetup gets tier 1, later ones mix" logic is gone — tier no longer means sequencing.
- **Export isolation**: `exportData()` filters to `tier !== 2` even though icebreakers live on user docs and
  `adminAnswers()` never reads them. Defence in depth: a mis-tiered question cannot leak an icebreaker.
- **Admin pills relabelled** `Idea` / `Icebreaker`, with copy explaining what each tier means and does.
- **Consent copy rewritten** for the split: photos public; discussion answers private but **admin-reviewed**
  (they form the idea bank behind the prize); icebreakers **shared only with meetup partners, not collected**.
- **Demo colleagues now have icebreakers** (invented answers for invented people) so the Talking points card
  is exercised locally.
- `?v=` 28 → 29.

## Two harness findings worth recording
1. **The old "an empty tier-1 still yields 3 questions" check had to go** — it is no longer true *by design*.
   With meetup questions Tier-1 only, emptying Tier 1 means a meetup gets none, and spinning is blocked with a
   clear message. The replacement asserts exactly that.
2. **I wrote a tautological test and caught it.** My first Talking-points check was
   `X === (true && X)` — always true, asserting nothing. Replaced with a real one (the partner has three
   icebreakers and each answer appears on screen), which then failed for a genuine reason: it ran *after* the
   meetup was completed, where `viewMeet` correctly shows the recap. Moved to while the meetup is active.

## Harness (11 new checks, 119 total)
The bank is 68 with 34/34; onboarding asks three questions and they are all Tier 2; three answers are stored
on the user with question text; +10 granted once and not twice; the signup bonus is asserted at 30 *before*
the icebreaker bonus lands; meetup questions are Tier-1 only; with no Idea questions a meetup gets none; the
partner's icebreakers render as talking points; and four separate assertions that **no icebreaker answer and
no Tier-2 question text reaches the idea bank or the CSV**.

## Live note
The reseed happens when an **admin opens the admin dashboard** — that is what runs `seedQuestionBank()`. Until
then the live bank still serves the previous set. Worth doing deliberately and checking Firestore afterwards.
