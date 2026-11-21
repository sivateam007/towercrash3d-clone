# Tower Crash 3D — Static Site

A browser-playable clone of **Tower Crash 3D** (inspired by the GameSnacks title of the same name). A tall column of colored blocks stands in the center of the arena. You aim a cannon and fire colored balls at it. Balls destroy blocks of the **same color** and chain through the tower; balls of a **different color** bounce off. Clear every block before you run out of balls.

No build step, no bundler, no server — plain HTML, CSS, and ES modules.

---

## Tech Stack

| Library   | Version | Delivery                                                          |
| --------- | ------- | ----------------------------------------------------------------- |
| Three.js  | 0.160.0 | ES module via CDN (unpkg) — declared in `index.html` importmap    |
| cannon-es | 0.20.0  | ES module via CDN (unpkg) — declared in `index.html` importmap    |
| anime.js  | 3.2.2   | ES module via CDN (jsDelivr) — declared in `index.html` importmap |

All game code lives in `js/` and is loaded as native ES modules with relative paths. Nothing needs to be installed or compiled.

---

## Project Structure


.
├── index.html # HTML markup, importmap, links to CSS + JS
├── css/
│ └── style.css # Sky/ocean look, HUD, power-up cards, overlays
├── js/
│ ├── config.js # All constants (colors, physics, levels, prices)
│ ├── effects.js # anime.js effect helpers
│ └── game.js # Entry module — scene, physics, gameplay
├── README.md # This file
└── render.yaml # Render Blueprint (static site)

text
Copy
Download

---

## Running Locally

Because the game uses **native ES modules** and an **importmap**, it must be served over HTTP — opening `index.html` directly with `file://` will not work in most browsers (CORS + module resolution).

From the project root, pick any of:

### Option A — Python 3

```bash
python3 -m http.server 8000

Open http://localhost:8000.

Option B — Node.js
bash
Copy
Download
npx serve .

Or if http-server is installed:

bash
Copy
Download
npx http-server -p 8000 .
Option C — VS Code

Install the Live Server extension, right-click index.html, and choose Open with Live Server.

Option D — Any static file server

Anything that serves the directory over HTTP works:

bash
Copy
Download
php -S localhost:8000
# or
ruby -run -e httpd . -p 8000
How to Play

Aim: move the mouse (or drag on touch) to aim the cannon.

Fire: click / tap / release, or press Space.

Match colors: a ball destroys every block of its own color it passes through; blocks of a different color bounce it back.

Switch color: tap the ball chip (bottom-left) or the muzzle ball to cycle to another color still on the field.

Power-ups (right side):

Multiball — fires a 5-ball spread for the price of one shot.

Earthquake — destroys a random chunk of the tower and shakes the rest.

Coins drop from destroying blocks and clearing levels; power-ups cost coins.

Progress bar fills as you clear blocks. Level shows current and next.

Clear the tower to advance. The tower grows taller and gains more colors as you progress.

Keyboard shortcuts
Key	Action
Space	Shoot
Q	Earthquake
E	Multiball
Deploying to Render (Free Hobby — Static Site)

The project is ready to deploy as a Render Static Site. There is no build step and no server process.

Option A — Blueprint (recommended)

The repo ships with render.yaml. To use it:

Push the repo to GitHub (or GitLab / Bitbucket).

In the Render dashboard, click New + → Blueprint.

Connect the repo and confirm the plan.

Render reads render.yaml, creates the Static Site, and deploys.

The blueprint is equivalent to:

yaml
Copy
Download
services:
  - type: static
    name: tower-crash-3d
    runtime: static
    buildCommand: ""
    staticPublishPath: ./
Option B — Manual Static Site

Push the repo to GitHub (or GitLab / Bitbucket).

In the Render dashboard, click New + → Static Site.

Connect the repo.

Set:

Name: t
ower-crash-3d
 (or any)

Branch: main

Build Command: (leave empty)

Publish Directory: ./

Click Create Static Site. Render deploys the repo as-is.

Every push to main triggers an automatic redeploy.

Custom domain

In Render: Static Site → Settings → Custom Domains. Add the domain and follow the DNS instructions. HTTPS is provisioned automatically.

Notes

Requires a browser with WebGL and ES module + importmap support (Chrome, Edge, Firefox, Safari 16.4+).

Libraries are fetched from CDNs on first load; the browser caches them afterwards.

No analytics, cookies, or server-side logic.

All tuning constants — colors, physics, level progression, prices, timings — live in js/config.js.

License

Fan-made educational clone. Three.js, cannon-es, and anime.js retain their respective licenses. The original Tower Crash 3D name and concept belong to GameSnacks / Google.