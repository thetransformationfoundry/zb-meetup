# BRIEF-002 · Real sign-in screen for returning users

**Branch:** `feat/signin-screen`  ·  **Status:** ready for CC  ·  **From:** live feedback #1

## Goal
"I already have an account" must land on a proper **sign-in** screen, not the create-account flow.

## Context (real code)
`js/app.js:225` — `obGoSignIn()` currently does the exact same thing as `obGoCreate()` (`onboardStep=0; renderOnboard()`), so both buttons open the create-account step. The sign-in handler already exists and works: `obSignIn()` at `js/app.js:264` reads `#ob-email` + `#ob-pass` and calls `S.signIn(e,p)`. There's just no dedicated screen that renders those fields with a Sign-in button.

## Scope (do)
1. Add a distinct onboarding step (e.g. `onboardStep='signin'`) with its own render branch in `renderOnboard()` (`js/app.js:230`). It shows:
   - Email + password inputs (`#ob-email`, `#ob-pass`) so the existing `obSignIn()` works unchanged.
   - A primary **Sign in** button → `obSignIn()`.
   - A **Forgot password?** link → calls a new `S.resetPassword(email)` (Firebase `sendPasswordResetEmail`) in **both** stores; demo store just toasts "Reset email sent (demo)". Show a toast on success/failure; don't leak whether the email exists.
   - A secondary **Create account** button → `obGoCreate()` (the safety net for people who tapped the wrong one).
   - A **Back** control to the welcome screen (`obBackWelcome()`).
2. Point `obGoSignIn()` at the new step instead of `onboardStep=0`.
3. Bump `?v=` in `index.html`.

## Guardrails (do NOT touch)
- Don't change the create-account flow, the welcome screen, or `obSignIn()`'s existing logic/validation.
- Keep the `ZB_STORE` API in lockstep — `resetPassword` goes in **both** `store.js` and `store-firebase.js`.
- No emojis; use existing `icon()` set. String IDs quoted in onclicks.

## Test steps
- `node tools/test-demo.js` stays green (add a check that the signin step renders email+password+Sign in).
- Welcome → **I already have an account** → lands on the sign-in screen (not create).
- Wrong password → friendly toast, stays on screen. Correct details → signs in.
- **Forgot password?** → toast; in live, the reset email actually arrives.
- **Create account** on the sign-in screen → create flow.

## Definition of done
Returning users get a real sign-in screen with forgot-password + a create-account escape hatch; demo harness green; both stores in lockstep; `?v=` bumped; tracker ticked; session log written.

## Amendment (2026-09-09) — route the create-screen sign-in link to the new screen
On the same `feat/signin-screen` branch. The create-account step (step 0) still has its own "I already have an
account — sign in" link that calls `obSignIn()` directly against whatever's typed in the create form. Now that a
real sign-in screen exists, point that link at **`obGoSignIn()`** instead, so it navigates to the "Welcome back"
screen (consistent single sign-in path). One-line change; don't otherwise touch the create flow.
- Test: welcome → Create account → tap "I already have an account — sign in" → lands on **Welcome back** (not an
  inline sign-in attempt). Harness stays green. Bump `?v=`.
