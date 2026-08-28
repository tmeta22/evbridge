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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600;700;800&display=swap">
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
  <button data-menu="talk">🎙 Talk</button>
  <button data-menu="commands">📚 Commands</button>
  <button data-menu="maps">🗺 EV Maps</button>
  <button data-menu="myev">🔋 My EV</button>
  <div class="menu-sep"></div>
  <button data-menu="theme">🌓 <span id="menuThemeLabel">Theme: Auto</span></button>
  <button data-menu="settings">⚙️ Settings</button>
</div>

<main class="wrap" id="appWrap">
  <div id="views" aria-live="polite">
    <div class="view active">
      <div class="card"><p class="hint center">Starting up…</p></div>
    </div>
  </div>
  <div class="map-page" id="mapPage" hidden>
    <div class="card">
      <div class="card-t"><span class="em">🗺</span> EV Maps <span class="muted small" style="text-transform:none;font-weight:600">· charging stations in Cambodia</span></div>
      <div class="seg map-layers" id="mapLayers">
        <button data-map-layer="google" class="sel">Google</button>
        <button data-map-layer="satellite">Satellite</button>
        <button data-map-layer="osm">OSM</button>
        <button data-map-layer="carto">CARTO</button>
      </div>
      <div class="map-host" id="mapHost"></div>
      <div class="map-strip" id="mapStrip">
        <p class="hint center" style="padding:14px">Loading stations…</p>
      </div>
    </div>
  </div>
</main>

<nav class="nav" id="nav" aria-label="Main navigation">
  <button class="nav-b sel" data-view="talk" type="button">
    <svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
    </svg><span>Talk</span>
  </button>
  <button class="nav-b" data-view="commands" type="button">
    <svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>
    </svg><span>Commands</span>
  </button>
  <button class="nav-b" data-view="maps" type="button">
    <svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>
    </svg><span>Maps</span>
  </button>
  <button class="nav-b" data-view="myev" type="button">
    <svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>
    </svg><span>My EV</span>
  </button>
  <button class="nav-b" data-view="settings" type="button">
    <svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg><span>Settings</span>
  </button>
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
      const payload: Record<string, unknown> = {
        text,
        reference_id: voice, // Fish Audio voice / reference id (e.g. fbe02f8306fc4d3d915e9871722a39d5)
        format: 'mp3',
        chunk_length: 200
      }
      if (language === 'zh' || language === 'en' || language === 'ja' || language === 'ko') payload.language = language
      const r = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${fishKey}`,
          'Content-Type': 'application/json',
          // fish.audio's free tier: model s2.1-pro-free (see fish.audio/blog/s2-1-pro-free-api)
          model: 's2.1-pro-free'
        },
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

/*
 * Charging stations proxy — forwards to the EV Cambodia (evskh) project API.
 * The client falls back to the bundled snapshot (/static/data/stations.json)
 * when this is unreachable, so the map still works offline.
 */
const EVSKH_API = process.env.EVSKH_API_URL || 'https://evskh.vercel.app'

app.get('/api/stations', async (c) => {
  try {
    const r = await fetch(`${EVSKH_API}/api/stations?provinces=1&stats=1`)
    if (!r.ok) return c.json({ error: 'upstream failed', status: r.status }, 502)
    const data = await r.json()
    return c.json(data)
  } catch (e) {
    console.error('[/api/stations] failed:', e)
    return c.json({ error: 'station service unavailable' }, 502)
  }
})

// SPA fallback: any non-asset path renders the shell
app.notFound((c) => {
  const p = new URL(c.req.url).pathname
  if (p.startsWith('/static/') || p.includes('.')) return c.text('Not found', 404)
  return c.html(SHELL)
})

export default app
