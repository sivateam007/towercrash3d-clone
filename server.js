/* ============================================================
   TOWER CRASH 3D — server.js
   Minimal Express static server for the Render Web Service.
   Serves the project root (index.html, css/, js/) on the
   port Render provides via process.env.PORT.
   ============================================================ */

'use strict';

const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

/* ------------------------------------------------------------
   Static file serving
   ------------------------------------------------------------ */
app.use(express.static(ROOT, {
  extensions: ['html'],
  index: 'index.html',
  maxAge: '1h',
  setHeaders(res, filePath) {
    /* Never cache HTML so deploys are picked up immediately */
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

/* ------------------------------------------------------------
   Health check (useful for Render)
   ------------------------------------------------------------ */
app.get('/healthz', (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

/* ------------------------------------------------------------
   SPA fallback — any unknown route returns index.html
   ------------------------------------------------------------ */
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') return next();

  /* Skip obvious asset paths so 404s stay 404s */
  if (/\.(js|css|map|png|jpg|jpeg|gif|svg|webp|ico|json|woff2?|ttf|otf)$/i.test(req.path)) {
    return next();
  }

  res.sendFile(path.join(ROOT, 'index.html'), (err) => {
    if (err) next(err);
  });
});

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */
const server = app.listen(PORT, () => {
  console.log(`Tower Crash 3D listening on http://localhost:${PORT}`);
});

/* Graceful shutdown so Render restarts cleanly */
function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 8000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));