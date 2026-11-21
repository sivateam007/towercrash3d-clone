# Tower Crash 3D — Clone

A browser-playable clone of **Tower Crash 3D** (inspired by the GameSnacks title). A single tall narrow tower of brightly colored blocks stands in the center of the arena. Aim a small cannon from the bottom of the screen and fire colored balls down the lane. Balls destroy blocks of the **same color** and chain through the tower; balls of a **different color** bounce off. Clear the tower before you run out of balls.

Served by a tiny **Express** web service, deployed to **Render (free hobby plan)**.

---

## Tech Stack

| Layer     | Technology                                                            |
| --------- | --------------------------------------------------------------------- |
| Frontend  | Plain HTML + CSS + native ES modules                                  |
| 3D        | **Three.js 0.160.0** — loaded via CDN importmap (unpkg)              |
| Physics   | **cannon-es 0.20.0** — loaded via CDN importmap (unpkg)              |
| Animation | **anime.js 3.2.2** — loaded via CDN importmap (jsDelivr)             |
| Server    | **Node.js 18+** + **Express 4** — static file server                  |
| Deploy    | **Render** Web Service (free tier), described by `render.yaml`        |

No bundler. No build step. `node_modules` only ships Express.

---

## Project Structure


.
├── index.html # HTML markup, importmap, links to CSS + JS
├── css/
│ └── style.css # Sky/ocean background, HUD, power-ups, overlays
├── js/
│ ├── config.js # All constants — colors, physics, levels, prices
│ ├── effects.js # anime.js effect helpers (burst, shake, punch, …)
│ └── game.js # Entry module — Three.js scene + cannon-es physics
├── server.js # Express static server (process.env.PORT)
├── package.json # Node deps: express; start: node server.js
├── render.yaml # Render Web Service blueprint
└── README.md # This file

text
Copy
Download

---

## Running Locally

Requires **Node.js 18 or newer**.

```bash
# 1. Install the only server dependency (Express)
npm install

# 2. Start the server
npm start

Then open http://localhost:3000 in a modern browser (Chrome, Edge, Firefox, Safari 16.4+).

To use a different port:

bash
Copy
Download
PORT=8080 npm start

The browser must be able to load ES modules and support importmaps. file:// opening of index.html will not work — the game must be served over HTTP, which npm start does.

How to Play

Aim: move the mouse (or drag your finger) to aim the cannon.

Fire: click / tap / release, or press Space.

Match colors: a ball destroys every block of its own color it passes through; blocks of a different color bounce it back.

Switch color: tap the ball counter chip (bottom-left) or the muzzle ball to cycle to another color that still exists on the tower.

Power-ups (right rail):

Multiball — 25 coins — fires a 5-ball spread for the price of one shot.

Earthquake — 50 coins — destroys a random chunk of the tower and rocks the rest.

Coins drop from destroyed blocks and cleared levels. Big combos multiply the payout.

Progress bar fills as the tower is cleared. The tower grows taller and gains colors as levels advance.

Clear the tower to advance. Out of balls = game over, retry the level.

Keyboard shortcuts
Key	Action
Space	Shoot
Q	Earthquake
E	Multiball
Visual & Gameplay Details

Matched to the original GameSnacks reference:

Camera: far-back over-the-shoulder at distance ≈ 45 units, looking down the lane at the tower. The cannon is small at the bottom of the frame; the tower dominates the view.

Tower: one tall narrow column of tightly stacked blocks — 8 at level 1, growing as levels progress, with more colors introduced over time.

Muzzle ball: a large, clearly visible ball at the cannon mouth that shows the remaining ball count as a bold number.

Arena: bright blue sky gradient fading to an ocean-blue floor; a faint lane strip marks the firing direction.

HUD: gold coin counter (top-left), level + progress bar (top-center), shop button (top-right), two power-up cards on the right rail with coin prices.

Effects: explosive color-matched debris + expanding shockwave ring on every destroy, strong screen shake, camera punch + slight FOV zoom, ball trails, animated coin/ball counters, power-up flash, tower wobble on impact, level-clear confetti, and game-over red vignette — all driven by anime.js.

Deploying to Render (Free Web Service)

This project uses a Render Web Service (Node environment), not a Static Site, because the deliverable runs through Express.

Option A — Blueprint (recommended)

The repo ships with render.yaml, which declares the service.

Push this repository to GitHub / GitLab / Bitbucket.

In the Render dashboard, click New + → Blueprint.

Connect the repo. Render reads render.yaml and provisions:

Type: web

Environment: node

Plan: free

Build Command: npm install

Start Command: node server.js

Branch: main

Click Apply. Render builds and deploys automatically.

Every push to main triggers a redeploy.

Option B — Manual Web Service

Push the repository to GitHub / GitLab / Bitbucket.

In the Render dashboard, click New + → Web Service.

Connect the repo.

Fill in:

Name: towercrash3d-clone (or any name)

Environment: Node

Region / Branch: pick your defaults (branch 
main
 recommended)

Build Command: 
npm install

Start Command: node server.js

Plan: Free

Click Create Web Service. The first deploy runs immediately.

Free-plan notes

The free web service sleeps after 15 minutes of inactivity and cold-starts on the next request. This is expected on Render's free tier.

Health check endpoint: GET /healthz returns { "ok": true, "uptime": <seconds> }.

Custom domains: Settings → Custom Domains → add domain → follow DNS instructions. HTTPS is provisioned automatically.

Configuration

Every tunable — colors, physics constants, camera distance, level progression, combo multipliers, power-up prices, effect timings — lives in js/config.js.

Common tweaks:

Camera distance: CAMERA_BASE and CAMERA_LOOK.

Ball speed: BALL_SPEED.

Tower height at level 1: TOWER_HEIGHT.

Colors introduced per level: colorsForLevel(level).

Power-up prices: POWERUP_MULTIBALL.price, POWERUP_EARTHQUAKE.price.

Starting coins: STARTING_COINS.

Notes

Requires WebGL and ES module + importmap support (all modern browsers).

Three.js, cannon-es, and anime.js are fetched from CDNs on first load; the browser caches them afterwards.

No analytics, cookies, or database. The server is a pure static file host.

See server.js for the small Express configuration (HTML no-cache, /healthz, SPA fallback).

License

Fan-made educational clone. Three.js, cannon-es, and anime.js retain their respective licenses. The original Tower Crash 3D name and concept belong to GameSnacks / Google. No affiliation or endorsement is implied.