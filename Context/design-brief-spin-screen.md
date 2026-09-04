# Claude Design brief — ZB MeetUP "Spin / Today's match" screen

Paste everything below into Claude Design, and **attach your reference image** in the same message.

---

**Please design ONE mobile screen as a single self-contained HTML file (inline CSS + JS, no build tools, no external libraries except optionally Phosphor Icons via CDN). Match the attached reference image for layout and feel.**

## Context
This is the **"Spin / Today's match"** screen of **ZB MeetUP** — an internal, mobile-first web app for Zimmer Biomet colleagues that matches them with a new colleague each day for a coffee, walk, or Teams call. It's playful but clean and professional (think Apple-clean + a friendly dating-app vibe). It renders in a centered phone column, **max-width 460px**. It's plain HTML/CSS/vanilla JS (no React, no Tailwind).

## Use these exact design tokens (put in :root)
```css
:root{
  --zb-blue:#0079BD; --zb-blue-dark:#005f95; --zb-blue-soft:#E6F2F9;
  --bg:#F5F7FA; --card:#FFFFFF; --ink:#1A1A1A; --muted:#6B7280; --line:#ECEFF3;
  --good:#1E9E5A; --bad:#D64545; --gold:#E8B923;
  --radius:16px; --radius-sm:10px;
  --shadow:0 1px 2px rgba(16,24,40,.04),0 4px 16px rgba(16,24,40,.06);
  --shadow-lg:0 8px 30px rgba(16,24,40,.12);
  --font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
```
- System font stack (no web fonts). Brand colour `--zb-blue` used for actions/highlights only.
- **No emojis anywhere** — use line icons (Phosphor Icons style: target/crosshair, paper-plane, arrows-clockwise, X, bell, users). Phosphor via CDN is fine, or inline SVG.

## The screen, top to bottom
1. **App bar** (sticky, white, subtle blur, 1px bottom border): left = wordmark "ZB **MeetUP**" (MeetUP in blue); right = a points pill ("0 pts", blue) and a notification **bell** icon with a small red unread badge.
2. **Hero card** — a big **blue gradient** panel (rounded ~20px, `--shadow-lg`), white text, filling most of the screen height so there's no wasted white space above the nav:
   - small uppercase eyebrow "TODAY'S MATCH"
   - a bold white heading ("Spin to meet someone new" in the idle state; "You matched!" once a match lands)
   - a **circular avatar inside a dashed ring** (the spinner). Idle = a "?" placeholder; matched = the colleague's photo/initials avatar.
   - when matched, a **white "match card" that pops in** (subtle scale animation) showing the colleague's name, role · department, a work-status chip, and a "Suggested: a coffee" line in blue.
   - **THE KEY ELEMENT (see reference image):** near the bottom of the hero, a **reel of small SQUARE photo cards drifting/scrolling horizontally**, interspersed with **rounded "idea chips"** (e.g. "Coffee on site", "Litter-pick walk", "Teams coffee call", "Team lunch"). The photo cards are slightly rotated/fanned like a scattered reel of real meetup snapshots, each with a tiny caption ("Alexandra & Patrick"). This should feel alive — like a highlight reel of colleagues meeting up. **Photos must be square (aspect-ratio 1).**
   - **Primary action button sits LOW** in the hero (thumb reach): a white "Spin the wheel" button in the idle state; when matched, a white "Send request" button plus two translucent-glass secondary buttons ("Spin again (2)" and "Skip").
3. Below the hero: a small soft-yellow **note** line explaining the matching rule ("You're desk-based, so you can match with on-site and remote colleagues.").
4. **Bottom tab bar** (5 tabs, line icons + labels, active tab in blue): Spin · Meetups · Wall · Ranks · You.

## Behaviour (JS)
- Clicking **Spin the wheel** runs a fun animation: the avatar in the ring rapidly cycles through several colleague avatars, decelerates, and lands on one — then the white match card pops in and the buttons switch to Send request / Spin again / Skip.
- The **reel** scrolls continuously (idle and during spin), looping seamlessly, with a soft fade mask on the left/right edges.
- Use ~8 sample colleagues (names + a coloured circle avatar with initials) and the meetup chips above as placeholder data.

## Output
A single `.html` file I can open directly, self-contained, using the tokens above, laid out for a 460px-wide phone column. Prioritise matching the **reference image's** reel-of-photos look and the low-button placement. Thanks!
