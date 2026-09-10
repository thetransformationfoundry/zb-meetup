# BRIEF-020 · Split questions: T2 icebreakers → onboarding, T1 ideas → meetups (+ load 68 questions)

**Branch:** `feat/icebreakers-split`  ·  **Status:** ready for CC  ·  **From:** Sean/Donnae, 2026-09-10
**Priority:** high + launch-shaped — it changes **onboarding** (seen from Mon 14 Sep). Aim to land before the 14th; see timeline note.

## The redesign (Sean)
Two question tiers now serve two different purposes:
- **Tier 1 = Idea questions** — asked in the **meetup shared space**; answers feed the **admin idea-bank + export**
  (the company's actual goal). Private, admin-reviewed.
- **Tier 2 = Icebreakers** — **3 asked at ONBOARDING**; answers live on the user's **profile**, are shown to the
  people they get matched with as **talking points**, and are **NOT** part of the admin export. This is lighter,
  friendlier, and **better for GDPR** (personal answers aren't harvested — only idea answers are).

## Source of truth
`Context/questions-source.md` — Donnae's list, extracted verbatim: **34 Tier-1** + **34 Tier-2** (68 total).
Seed the bank from this file; keep the exact wording.

## Scope (do)
1. **Reseed the question bank** from `questions-source.md`: 34 T1 (`tier:1`) + 34 T2 (`tier:2`), replacing the 7
   current defaults. Live already seeded `q1–q7` — since we're pre-launch with no real answer data, **clear
   `questionBank` and reseed the 68** (bump the `app/questionBank` seed marker so it re-seeds cleanly). CC defines ids.
2. **Onboarding icebreaker step** (new step in the onboarding flow, `js/app.js`): pick **3 random Tier-2** questions
   and ask the user; store on their profile as e.g. `user.icebreakers = [{qid, q, a}, …]` (3 entries). Copy:
   *"Answer a few quick questions so the colleagues you meet know a bit about you — these are shared only with people
   you're matched with."* Plus a short **professionalism disclaimer** (*"Keep it friendly and professional."*).
   If fewer than 3 T2 exist, ask what's available.
   - **Skippable, with a +10 incentive (Sean, 2026-09-10):** the step is skippable so no one is blocked from
     finishing signup. **Completing all 3 icebreakers grants a one-time +10 points** to the leaderboard — guard with
     a `icebreakerBonusGranted` flag (same one-time self-claim pattern as the 30-pt signup bonus), so it can't be
     farmed by editing. Small toast on earning (reserve confetti for signup). Award whether they complete it at
     onboarding **or later** (see #2b).
2b. **Finish-it-later entry on the You screen:** if a user hasn't completed their icebreakers, show a card/prompt on
   **You** — *"Answer 3 quick questions to help colleagues get to know you — earn 10 points."* — that opens the same
   icebreaker step; on completion it stores the answers, grants the one-time +10, and the prompt disappears. (This is
   the "skip now, do it later for the points" path Sean asked for.)
3. **Meetup shows icebreakers** (`viewMeet`): a **"Get to know {firstName}"** section showing the **other
   participant's** 3 icebreaker Q&A (read from their `user.icebreakers`) as talking points; optionally show your own
   too. Visible to the two participants in the shared space.
4. **Meetup discussion = Tier-1 only:** `pickQuestions()` (`js/app.js`) now draws **only from Tier 1** (e.g. 3 random
   T1) — Tier 2 no longer appears in meetups. `match.answers[uid]` = the T1 answers. (The old first-meetup/tier-mix
   logic collapses to "N random T1".)
5. **Admin export scope = Tier-1 only:** the idea-bank aggregation + CSV export (BRIEF-007) already reads match
   answers — since meetups now carry only T1, this is automatically idea-only. **Confirm no T2/icebreaker answers
   ever enter the export.** The admin **question bank still manages BOTH tiers** (add/edit/delete/tier-toggle);
   relabel the pills so the meaning is clear — **T1 = "Idea" (meetup)**, **T2 = "Icebreaker" (onboarding)**.
6. **Consent/GDPR copy** (onboarding consent step): reflect the split — *idea answers (in meetups) are private and
   reviewed by admins for the idea bank; icebreaker answers are shared only with the colleagues you meet and are not
   collected by the company.*
7. **(Optional) edit icebreakers** in Edit Profile — nice-to-have; include if quick, else backlog.
8. Bump `?v=`. Harness assertions (below).

## Data model
- `users/{uid}.icebreakers`: `[{qid,q,a} ×3]`, set at onboarding. Readable by signed-in colleagues (same as name/
  role/photo today) so meetup partners can see them — acceptable given they're deliberately shareable + the
  professionalism disclaimer. *(If Sean later wants them visible ONLY to matched partners, that's a stricter Firestore
  rule — a follow-up, via `firestore.rules`.)*
- `matches`: `questions` + `answers[uid]` now T1-only. No schema change, just content.

## Guardrails (do NOT touch)
- **T2 icebreaker answers must never appear in the admin idea-bank or CSV export.** Only T1 idea answers are collected.
- Keep `ZB_STORE` API in lockstep across both stores; keep the BRIEF-008 admin CRUD working on both tiers.
- Don't break the spin/points economy, matching (EMEA/floor), or the countdown lock.
- Keep the questions verbatim from `questions-source.md`. No emojis.

## Test steps
- `node tools/test-demo.js` green, new assertions: onboarding stores 3 T2 answers on the profile; meetup shows the
  partner's icebreakers; `pickQuestions()` returns only T1; the admin export contains only T1 answers, never T2.
- Manual: onboard → answer 3 icebreakers (+ see the professionalism line) → **+10 awarded once** (re-answering
  doesn't re-award) → match + accept a meetup → see the partner's icebreaker talking points in the shared space,
  and only **T1** idea questions to answer together → complete → admin idea-bank/export shows the T1 answer, and
  **no** icebreaker text.
- **Skip path:** skip icebreakers at onboarding → finish signup → the **You** screen shows the "earn 10 points"
  prompt → complete it there → +10 granted once, prompt disappears.

## Definition of done
68 questions loaded (34 T1 + 34 T2 from source); onboarding captures 3 random icebreakers to the profile with a
professionalism note; meetups show partners' icebreakers and ask only T1 idea questions; admin export is T1-only;
admin still manages both tiers (relabelled Idea/Icebreaker); consent copy updated; both stores in lockstep; demo
harness green; `?v=` bumped; tracker + session log updated.

## Revision — polish from Sean's live test (2026-09-10, same `feat/icebreakers` branch, before merge)
Functionality + privacy boundary all verified (export is idea-only, no T2 leak). Four UI fixes:
1. **"A little about you" screen must mention the +10** at the top. The intro currently explains the sharing/
   privacy but not the reward — add that completing the 3 earns 10 points (the button already says "Save — earn 10
   points", but the header should set it up).
2. **Award screen — show the +10 as its own chip.** When the user answered the icebreakers, show a **"+10 points"**
   chip **beneath** the existing "30 points" chip (so the two awards read distinctly: 30 signup + 10 icebreakers →
   Balance 40). If they **skipped**, show only the 30-points chip. Balance line stays the true total.
3. **You-screen spacing.** The "Your icebreakers" card (answered) and the "Break the ice" card (skipped) sit too
   close to the buttons above — the card top touches the Admin dashboard / bug buttons. Add proper top margin/gap
   so the card breathes (match the spacing between the other You-screen cards).
4. **Meetup shared space order + emphasis.** Move **"1 · Share a photo" BELOW the Talking points card**, so the
   order is: hero → **Talking points** → Share a photo → Discussion questions. And make the **Talking points card
   "pop"** (more visual weight — e.g. a light accent background/border or subtle elevation) since it's the warm,
   human "here's your partner" moment. Keep the photo + questions steps working; renumber only if needed.

5. **Completed-meetup recap shows the icebreakers too.** The recap view (a completed match — "your part is
   complete") currently shows the photo + your private T1 answers but not the partner's icebreakers. Add the same
   **Talking points** card (partner's 3 icebreaker Q&A) to the recap, so it's consistent with the active shared
   space. Keep "Your answers" clearly labelled private (you + admins only); icebreakers remain the partner-visible set.

6. **Instruction line above the meetup log (Sean, 2026-09-10).** In the meetup **shared space**, add a short helper
   above the "Share a photo" / "Discussion questions" cards: *"Log your meetup below — add a photo and answer the
   questions together, during or just after you meet, to earn your points."* (Shared space only; the recap already
   says "your part is complete".) Confirmed: **Talking points stays partner-only** in both the shared space and the
   recap — each participant sees the *other's* icebreakers; your own live on your You screen.

(App-wide primary-button gradient consistency is a separate follow-up — BRIEF-021 — not this branch.)

## Timeline note
This reshapes onboarding, which colleagues hit from **Mon 14 Sep**, so it wants to land + be tested before then.
If the window gets too tight to test comfortably: the safe fallback is to **load the 68 questions now** (content,
low-risk) and ship the icebreaker *restructure* as a fast-follow — but early signups would then onboard without
icebreakers and need a later prompt to add them. Prefer landing it whole before the 14th.
