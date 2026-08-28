/* ==========================================================
   EV Voice Bridge — Service Worker
   Full offline: every asset is pre-cached on install so the
   app works with the phone in airplane mode.
   ========================================================== */

const VERSION = 'evvoice-v1';
const CORE = [
  '/',
  '/manifest.json',
  '/static/css/app.css',
  '/static/js/app.js',
  '/static/js/nlu.js',
  '/static/js/speech.js',
  '/static/js/data/brands.js',
  '/static/js/data/commands.js',
  '/static/fonts/khmer-khmer.woff2',
  '/static/fonts/khmer-latin.woff2',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/icons/icon-maskable-512.png'
];

/* ---------- install: pre-cache everything ---------- */
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // addAll fails the whole batch if one URL 404s — add individually so a
    // single missing optional asset can never block offline readiness.
    await Promise.all(CORE.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res.ok) await cache.put(url, res);
      } catch (_) { /* ignore, retried at runtime */ }
    }));
    self.skipWaiting();
  })());
});

/* ---------- activate: drop old versions ---------- */
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* ---------- fetch: cache-first, network only to refresh ---------- */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin pass through

  // Navigations: serve the cached shell so the app opens offline.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const fresh = await fetch(req);
        if (fresh.ok) cache.put('/', fresh.clone());
        return fresh;
      } catch (_) {
        return (await cache.match('/')) || Response.error();
      }
    })());
    return;
  }

  // Assets: cache-first (instant + offline), refresh quietly in background.
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req);
    if (hit) {
      e.waitUntil((async () => {
        try {
          const fresh = await fetch(req);
          if (fresh.ok) await cache.put(req, fresh);
        } catch (_) {}
      })());
      return hit;
    }
    try {
      const fresh = await fetch(req);
      if (fresh.ok) await cache.put(req, fresh.clone());
      return fresh;
    } catch (_) {
      return new Response('Offline and not cached', { status: 504 });
    }
  })());
});

/* ---------- allow the page to ask about cache state ---------- */
self.addEventListener('message', async (e) => {
  if (e.data === 'CACHE_STATUS') {
    const cache = await caches.open(VERSION);
    const keys = await cache.keys();
    e.source && e.source.postMessage({ type: 'CACHE_STATUS', cached: keys.length, total: CORE.length });
  }
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
