# BRIEF-026 · Onboarding tap responsiveness (consent + icebreaker feel slow)

**Branch:** `fix/onboarding-responsiveness` off `main` · **Status:** ready for CC · **From:** Sean's iPhone test, 2026-09-12
**Priority: BEFORE MONDAY 14 Sep signups** — this is every new colleague's first 30 seconds. Small, low-risk UI fix;
carved out of the BRIEF-024 audit so it can ship on its own before launch.

## Why
On a real iPhone the **onboarding tail feels slow**: the consent step's **"Enter ZB MeetUP"** button and the
**icebreaker save** both do real network work behind a single tap with **no immediate feedback**, so the button
looks frozen for a beat and the user may tap again.
- `finishOnboard`: create the Firebase account → write the profile (`saveMe`) → request **push permission/token**
  (BRIEF-004) → start icebreakers → transition. Several round-trips.
- Icebreaker save: write the three answers + claim the +10 bonus.

Nothing is broken — it just doesn't acknowledge the tap, so it reads as lag.

## Scope (do) — feedback + non-blocking, nothing more
1. **Acknowledge every heavy onboarding tap instantly.** On press of "Enter ZB MeetUP", the icebreaker Save, and any
   other onboarding button that awaits a write: immediately **disable the button and show an inline spinner / busy
   label** (reuse the existing `spinnerIcon()` and button-busy pattern already in `app.js`), *then* run the async
   chain. Re-enable / advance on completion; on error, re-enable and show the existing error toast. This alone kills
   the "is it frozen?" feeling and the double-tap.
2. **Don't let non-gating writes block the screen change.** Where a write doesn't need to complete before the next
   screen is correct (e.g. a fire-and-forget profile/bonus write whose result the next screen doesn't read), let it
   settle in the background and advance the UI optimistically — but only where a failure is recoverable and won't
   leave the user in a wrong state. If unsure for a given write, keep it blocking and just rely on the spinner from
   #1. Prefer the safe choice.
3. **Guard against double-submit.** A disabled busy button also prevents the second tap creating a duplicate
   account / duplicate write. Confirm the account-create path can't be entered twice.

## Guardrails (do NOT touch)
- **Keep the push-permission request inside the user gesture** — Safari refuses a permission prompt fired outside a
  tap, so it must stay synchronous within the click handler (spinner goes up first, but `Notification.requestPermission`
  / `getToken` still runs in that same gesture). Don't defer it to a `.then()` that loses the gesture.
- **Do not reorder or weaken the account-create → profile-write → domain-gate sequence** (BRIEF-009). This is
  feedback + non-blocking only, not a rewrite of onboarding logic. If making a write non-blocking would risk a
  wrong-state screen, leave it blocking.
- Keep both stores' `ZB_STORE` API and the demo path working; harness green.
- No rules change, no data-model change.

## Test steps
- `node tools/test-demo.js` green.
- Demo: the consent button and icebreaker Save show an instant busy state on tap; no double-fire if you tap twice.
- Live on a real iPhone (the device that showed it): "Enter ZB MeetUP" and the icebreaker Save feel responsive —
  visible acknowledgement within ~100ms of the tap, even while the writes finish. Push permission still prompts
  (gesture preserved). Onboarding still completes correctly end to end; no duplicate account on a double-tap.

## Definition of done
Every heavy onboarding tap acknowledges instantly (disable + spinner), non-gating writes no longer block the screen
transition, double-submit is prevented, the push permission still fires inside the gesture, onboarding logic is
otherwise unchanged, harness green, `?v=` bumped, tracker + session log updated.
