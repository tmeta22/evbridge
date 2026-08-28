import { Hono } from 'hono'

const app = new Hono()

const SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0a0e14">
<meta name="description" content="Offline voice control bridge for Chinese-market EVs in Cambodia. Speak English or Khmer, the app speaks Chinese to your car.">
<title>EV Voice Bridge — និយាយជាមួយឡានអ្នក</title>
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/static/icons/icon-192.png">
<link rel="apple-touch-icon" href="/static/icons/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="mobile-web-app-capable" content="yes">
<link rel="stylesheet" href="/static/css/app.css">
</head>
<body>

<header class="topbar" id="topbar">
  <div class="logo" aria-hidden="true">🚗</div>
  <div class="tb-txt">
    <h1 id="brandName">EV Voice Bridge</h1>
    <p id="brandWake">Loading…</p>
  </div>
  <span class="pill" id="netPill" title="Connection status"><span class="dot"></span>&nbsp;</span>
</header>

<main class="wrap" id="views" aria-live="polite">
  <div class="view active">
    <div class="card"><p class="hint center">Starting up…</p></div>
  </div>
</main>

<nav class="nav" id="nav" aria-label="Main navigation">
  <button class="nav-b sel" data-view="talk"     type="button"><span class="ni">🎙</span><span>Talk</span></button>
  <button class="nav-b"     data-view="commands" type="button"><span class="ni">⌨️</span><span>Commands</span></button>
  <button class="nav-b"     data-view="cars"     type="button"><span class="ni">🚙</span><span>My Car</span></button>
  <button class="nav-b"     data-view="settings" type="button"><span class="ni">⚙️</span><span>Settings</span></button>
</nav>

<div class="mask" id="mask" role="dialog" aria-modal="true">
  <section class="sheet" id="sheetBody"></section>
</div>

<noscript>
  <div style="padding:24px;color:#eaf0f7;font-family:sans-serif">
    This app needs JavaScript enabled to work. Please turn it on in your browser settings.
  </div>
</noscript>

<script type="module" src="/static/js/app.js"></script>
</body>
</html>`

app.get('/', (c) => c.html(SHELL))

// SPA fallback: any non-asset path renders the shell
app.notFound((c) => {
  const p = new URL(c.req.url).pathname
  if (p.startsWith('/static/') || p.includes('.')) return c.text('Not found', 404)
  return c.html(SHELL)
})

export default app
