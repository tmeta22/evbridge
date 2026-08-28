import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

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
<script>
  /* Apply the saved/system theme before first paint to avoid a flash. */
  (function () {
    try {
      var s = JSON.parse(localStorage.getItem('evvoice.settings') || '{}');
      var t = (s.cfg && s.cfg.theme) || 'auto';
      var d = t === 'light' ? 'light' : t === 'dark' ? 'dark'
        : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', d);
    } catch (e) {}
  })();
</script>
</head>
<body>

<header class="topbar" id="topbar">
  <div class="avatar" id="brandAvatar" aria-hidden="true">EV</div>
  <div class="tb-txt">
    <h1 id="brandName">EV Voice Bridge</h1>
    <p id="brandWake">Loading…</p>
  </div>
  <span class="pill" id="netPill" title="Connection status"><span class="dot"></span>CONNECTED</span>
  <button class="icon-btn" id="menuBtn" title="Menu" aria-label="Menu">☰</button>
</header>

<div class="menu" id="menu" hidden>
  <button data-menu="theme">🌓 <span id="menuThemeLabel">Theme: Auto</span></button>
  <button data-menu="cars">🚙 My Car</button>
  <button data-menu="settings">⚙️ Settings</button>
</div>

<main class="wrap" id="views" aria-live="polite">
  <div class="view active">
    <div class="card"><p class="hint center">Starting up…</p></div>
  </div>
</main>

<nav class="nav" id="nav" aria-label="Main navigation">
  <button class="nav-b sel" data-view="talk"     type="button"><span class="ni">🎙</span><span>Talk</span></button>
  <button class="nav-b"     data-view="myev"     type="button"><span class="ni">🚗</span><span>My EV</span></button>
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

/*
 * Premium TTS — fish-audio/s2.1-pro-free.
 * Two backends, tried in order:
 *   1. Vercel AI Gateway (AI_GATEWAY_TOKEN / AI_GATEWAY_API_KEY / VERCEL_AI_TOKEN)
 *   2. Direct fish.audio v3 API (FISH_AUDIO_API_KEY) — used when the gateway
 *      is not configured or is rate-limited / denied.
 * The frontend falls back to device TTS when this returns an error.
 */
app.post('/api/tts', async (c) => {
  let body: { text?: unknown; voice?: unknown; language?: unknown }
  try { body = await c.req.json() } catch { return c.json({ error: 'invalid json' }, 400) }

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (!text) return c.json({ error: 'text is required' }, 400)
  if (text.length > 2000) return c.json({ error: 'text too long' }, 400)

  const voice = typeof body.voice === 'string' && body.voice ? body.voice : undefined
  const language = typeof body.language === 'string' && body.language ? body.language : 'auto'
  const env = c.env as Record<string, unknown> | undefined

  const gatewayToken = (env && env.AI_GATEWAY_TOKEN as string | undefined)
    || process.env.AI_GATEWAY_TOKEN
    || process.env.AI_GATEWAY_API_KEY
    || process.env.VERCEL_AI_TOKEN
  const fishKey = (env && env.FISH_AUDIO_API_KEY as string | undefined)
    || process.env.FISH_AUDIO_API_KEY

  const audioResp = (bytes: BodyInit, contentType: string) =>
    new Response(bytes, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400, immutable' }
    })

  // ---- 1) Vercel AI Gateway ----
  if (gatewayToken) {
    try {
      const r = await fetch('https://ai-gateway.vercel.sh/v4/ai/speech-model', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gatewayToken}`,
          'ai-model-id': 'fish-audio/s2.1-pro-free',
          'ai-gateway-protocol-version': '0.0.1',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, voice, outputFormat: 'mp3', language })
      })
      if (r.ok) {
        const data = (await r.json()) as { audio?: string }
        if (!data.audio) return c.json({ error: 'tts failed: empty audio from gateway' }, 502)
        const bin = atob(data.audio)
        const bytes = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
        return audioResp(bytes, 'audio/mpeg')
      }
      // gateway refused / rate-limited → fall through to direct fish.audio
    } catch { /* fall through */ }
  }

  // ---- 2) Direct fish.audio v3 (fallback) ----
  if (fishKey) {
    if (!voice) {
      return c.json({ error: 'tts failed: a Fish Audio voice ID is required when using the direct API' }, 400)
    }
    try {
      const payload: Record<string, unknown> = { text, voiceId: voice, format: 'mp3' }
      if (language !== 'auto') payload.language = language
      const r = await fetch('https://fishaudio.org/api/open/v3/speech/tts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${fishKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (r.ok) {
        return audioResp(await r.arrayBuffer(), r.headers.get('Content-Type') || 'audio/mpeg')
      }
      const detail = await r.text().catch(() => '')
      console.error('[/api/tts] fish.audio error', r.status, detail)
      return c.json({ error: 'tts failed', detail: String(detail || r.status) }, r.status as ContentfulStatusCode)
    } catch (e) {
      console.error('[/api/tts] fish.audio failed:', e)
      return c.json({ error: 'tts failed', detail: String(e) }, 500)
    }
  }

  return c.json({ error: 'No TTS credentials configured (AI_GATEWAY_TOKEN or FISH_AUDIO_API_KEY)' }, 500)
})

// SPA fallback: any non-asset path renders the shell
app.notFound((c) => {
  const p = new URL(c.req.url).pathname
  if (p.startsWith('/static/') || p.includes('.')) return c.text('Not found', 404)
  return c.html(SHELL)
})

export default app
