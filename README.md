# ZB MeetUP

An internal, mobile-first web app for **Zimmer Biomet** colleagues to connect across teams, departments
and sites. Each day it matches you with a new colleague for a quick meetup — a coffee, a walk, or a
virtual call — with a few friendly discussion questions, a community wall and a leaderboard. The goal is
simple: rebuild connection and morale, one conversation at a time.

## What it does
- **Daily match** — spin to be paired with a colleague you don't usually work with (matches are made
  thoughtfully so they work for on-site and remote staff alike).
- **Meet & log it** — coordinate in a quick chat, meet up, share a photo, and answer three rotating
  discussion questions together to earn points.
- **Community wall** — celebrate meetups across the business (photos, hearts, comments).
- **Leaderboard & prizes** — a bit of friendly competition, plus recognition for the best ideas shared.

## Tech
Plain **HTML, CSS and vanilla JavaScript** — no build step. Hosted on **GitHub Pages**. Backend is
**Firebase** (Email/Password Auth + Cloud Firestore). Photos are downscaled and stored inline. The app
has two interchangeable storage layers — a demo mode (in-browser only) and the live Firebase mode.

## Structure
- `index.html` — app shell that loads everything
- `css/` — styles (Apple-clean, ZB blue `#0079BD`)
- `js/` — app logic + the demo / Firebase storage layers, and `firebase-config.js`
- `assets/` — icons, logo, and holding photos used while there's little real data
- `data/` — static app data (e.g. the question bank)

## About this repo
This repository is **public so GitHub Pages can host it** — and so anyone curious is welcome to see how
it's built. There are **no credentials and no personal data in the code**: colleague sign-ups, emails,
profile and meetup photos, chat, and the private question answers all live in **Firebase (Cloud
Firestore)**, protected by security rules — never in this repo. The Firebase web config that *is* in the
code is public by design (a project address, not a secret); access is governed by the rules. The
employee list is never committed — colleagues sign themselves up.

## Credits

Designed and developed by **The Transformation Foundry** — [thetransformationfoundry.nl](https://thetransformationfoundry.nl) — for Zimmer Biomet.

Made with care for the ZB community. 🤝
