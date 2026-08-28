# EV Voice Bridge — និយាយជាមួយឡានអ្នក

**Speak English or Khmer. Your Chinese EV understands.**

## Project Overview

- **Name**: EV Voice Bridge (`webapp`)
- **Goal**: Let Cambodian owners of Chinese-market EVs control their car's built-in voice assistant, which only accepts Mandarin Chinese.
- **How it works**: You speak, type, or tap in **English** or **Khmer**. The app figures out what you meant, then **speaks the correct Chinese command out loud** through your phone speaker. Your car's microphone hears the Chinese and obeys. A live transcript shows exactly what was said in all languages, so you always understand what your car was told.

### Why this exists

Cars like BYD, Geely, Xiaomi, Wuling, Haval, Chery and Zeekr are sold in Cambodia in their **China-domestic-market** trim. Their voice assistants (小迪, 小爱同学, ZEEKR AI…) only recognise Mandarin. For an owner who speaks Khmer and English, one of the car's headline features is completely unusable. This app is the missing translation layer.

---

## Main Features

| Feature | Status |
|---|---|
| 🔘 **Tap-to-command deck** — 102 commands in 12 categories, browse & search | ✅ |
| 🇬🇧 **English voice input** | ✅ |
| 🇰🇭 **Khmer voice input** (ភាសាខ្មែរ) | ✅ |
| ⌨️ **Typed input fallback** (English + Khmer) — 100% offline, always works | ✅ |
| 💬 **Conversation mode** — drops the wake word so you can talk back and forth naturally | ✅ |
| 📝 **Live transcript** — every line shown in Chinese + Pinyin + Khmer-letter reading + English + Khmer | ✅ |
| 🗣 **Chinese TTS out loud** at adjustable speed & volume so the car hears clearly | ✅ |
| 🎙 **Record your own Chinese clips** — stored on the phone, used instead of robot voice | ✅ |
| 🚗 **25 Chinese EV brands** with their real wake words | ✅ |
| 📴 **Full offline PWA** — installable, works in airplane mode | ✅ |
| 🔢 **Numbers & Khmer numerals** — "set temperature to ២៥ អង្សា" → 温度调到25度 | ✅ |

---

## Honest note on "fully offline"

Everything is **100% offline** — the command database, the language matching, the Chinese text, the Pinyin, the Khmer readings, the app shell, the Khmer font, and the Chinese text-to-speech (which uses your phone's own installed voice, no internet).

The **one** exception is raw *microphone* speech-to-text. Browsers ship no bundled Khmer or English offline speech engine, so:

- On phones with on-device recognition, the mic works offline.
- On phones without it, the mic may need a connection — and the app tells you so clearly instead of silently failing.
- **You are never blocked**: typing and the button deck are always fully offline and give you the exact same result.

The app never pretends otherwise — the Settings tab explains this in plain language.

---

## Functional Entry URIs

This is a client-side PWA. The server only delivers the shell and assets.

| Path | Method | Purpose |
|---|---|---|
| `/` | GET | App shell (HTML). Also served for any unknown non-asset path (SPA fallback). |
| `/manifest.json` | GET | PWA install manifest |
| `/sw.js` | GET | Service worker (pre-caches all 13 assets on install) |
| `/static/css/app.css` | GET | Stylesheet + bundled `@font-face` |
| `/static/js/app.js` | GET | Main controller (ES module entry) |
| `/static/js/nlu.js` | GET | Offline intent matcher |
| `/static/js/speech.js` | GET | TTS, recording, IndexedDB clip store |
| `/static/js/data/commands.js` | GET | 102-command database |
| `/static/js/data/brands.js` | GET | 25 brand wake-word profiles |
| `/static/fonts/khmer-{khmer,latin}.woff2` | GET | Bundled Noto Sans Khmer (84 KB, no CDN) |
| `/static/icons/icon-{192,512}.png`, `icon-maskable-512.png` | GET | App icons |

**In-app views** (no URL change — client-side nav): `Talk` · `Commands` · `My Car` · `Settings`

---

## Data Architecture

**All data is client-side. No server database, no accounts, no telemetry, nothing leaves the phone.**

### Data models

```js
// Command
{ id, cat, zh, py, kmr, en, km, icon, keys[], kkeys[], reply{zh,en,km}, slot? }
//   zh  = Chinese spoken TO the car        py  = Pinyin
//   kmr = Chinese written in Khmer letters (so a Khmer reader can say it themselves)
//   en/km = meaning        keys/kkeys = English/Khmer trigger phrases
//   slot = 'number' | 'temp'  → fills the {n} placeholder in zh

// Brand
{ id, name, nameZh, assistant, wake, wakePy, wakeKm, models, color, popular }

// Transcript line
{ kind:'me'|'car'|'sys'|'listening', said, zh, py, kmr, text, via, time }
```

### Storage services

| Store | Used for |
|---|---|
| `localStorage` (`evvoice.settings`) | Chosen brand, input language, voice, speed, volume, all toggles |
| **IndexedDB** (`evvoice` → `clips`) | Owner-recorded Chinese audio clips (Blobs) |
| **Cache Storage** (`evvoice-v1`, via service worker) | All 13 app assets for offline use |

No Cloudflare D1 / KV / R2 is used — by design. Nothing needs to be on a server, and keeping it local is what makes the app work with no signal.

### Data flow

```
You speak / type / tap  (English or Khmer)
        ↓
nlu.js  →  exact phrase → token overlap → Khmer substring → bigram Dice (typo tolerance)
        ↓                                  + number/Khmer-numeral extraction
Matched command  →  wake word + Chinese text  (e.g. 你好小迪，温度调到25度)
        ↓
speech.js  →  your recorded clip  ▸ or ▸  phone's zh-CN voice  ▸ or ▸  on-screen warning
        ↓
📢 phone speaker  →  🎤 car microphone  →  car acts
        ↓
Live transcript shows it in 中文 / Pinyin / ខ្មែរ-reading / English / Khmer
```

---

## User Guide

### First-time setup (do this once, at home with Wi-Fi)

1. Open the app and let it finish loading — it caches itself for offline use.
2. Add it to your home screen: browser menu → **Add to Home screen** / **Install app**.
3. Go to **My Car** and tap your brand (BYD, Geely, Xiaomi, Wuling, Haval, Chery, Zeekr, Aion… 25 in total). The app now uses your car's correct wake word.
4. Tap **Test the wake word** and check you can hear it clearly.
5. If you see *"Chinese voice: not installed"* in **Settings**, install a Chinese voice:
   - **Android**: Settings → Language & input → Text-to-speech → install **中文 (Chinese)**
   - **iPhone**: Settings → Accessibility → Spoken Content → Voices → **Chinese**
   - Or skip this and record your own clips (below) — that works on any phone.

### Daily use in the car

1. Turn the phone volume **up** — the car's microphone needs to hear it.
2. Hold the phone toward the car's microphone (usually near the rear-view mirror or the screen).
3. Then either:
   - **Tap** a command in the **Commands** tab, or a quick chip on the **Talk** tab, or
   - **Tap the mic** and say it in English or Khmer, or
   - **Type** it (fully offline, always reliable).
4. The phone speaks the Chinese. Watch the **Live Transcript** to see exactly what was said and what the car should do.

### Conversation mode

Turn on **Conversation OFF → ON** at the top of the transcript. The wake word is then skipped, so you say the wake word once yourself and then go back and forth naturally without repeating "你好小迪" every time.

### Recording your own voice (most reliable option)

**Settings → Record your own Chinese** → pick a category → tap 🎙 → say the Chinese shown → tap ⏹.

Your clip is saved on the phone and played instead of the robot voice. This works on **any** phone with no Chinese voice installed, and is always 100% offline. Cars often recognise a real human voice better than TTS.

### Reading the transcript

Each of your lines shows:

```
你好小迪，打开空调          ← what the car hears (Chinese)
Nǐ hǎo Xiǎo Dí, Dǎ kāi kōng tiáo   ← Pinyin
🗣 នី ហាវ ស៊ាវ ឌី, តា ខាយ ឃុង ធាវ    ← the same Chinese in Khmer letters
```

That last line means **you can read the Chinese aloud yourself** even if the phone can't speak it — useful if you have no Chinese voice and no recording.

---

## Command Coverage (102 total)

| Category | # | Examples |
|---|---|---|
| ❄️ Climate / AC | 13 | on/off, temperature to N°, cooler, warmer, fan speed, defog, recirculate, auto |
| 🪟 Windows & Roof | 10 | open/close all, driver window, sunroof, sunshade, vent |
| 💡 Lights | 9 | headlights, high beam, fog, interior, ambient, hazards |
| 🎵 Media | 11 | play/pause, next/previous, volume to N, up/down, mute, radio, bluetooth |
| 🧭 Navigation | 10 | home, work, nearest charging station, petrol, hospital, cancel route, zoom |
| 💺 Seats | 9 | heating, ventilation, massage, driver seat position, steering heat |
| 🚘 Driving | 10 | sport/eco/comfort/snow mode, cruise control, regen braking, one-pedal |
| 🚪 Doors | 6 | lock/unlock, boot/trunk, charge port, child lock |
| 📞 Phone | 6 | make/answer/end a call, redial, bluetooth pairing |
| ℹ️ Info | 5 | battery %, range, tyre pressure, time, weather |
| 🌧️ Wipers | 6 | on/off, faster, auto, rear wiper, washer |
| 🛡️ Safety | 7 | 360 camera, reverse camera, dashcam, sentry mode, lane keep, parking sensors, honk-to-find |

Every command carries: Chinese · Pinyin · Khmer-letter reading · English · Khmer · English trigger phrases · Khmer trigger phrases · the car's expected reply in 3 languages.

---

## Supported Brands (25)

**Common in Cambodia**: BYD (你好小迪) · Geely (你好吉利) · Xiaomi (小爱小爱) · Wuling (你好五菱) · GWM/Ora/Haval (你好哈弗) · Chery/Omoda/Jaecoo (你好奇瑞) · Zeekr (你好极氪) · GAC Aion (你好小可)

**Also included**: Leapmotor · Deepal · Changan · Neta · MG · XPeng · NIO (Hey NOMI) · Li Auto (理想同学) · AITO (小艺小艺) · Jetour · Baojun · Hongqi · Dongfeng · JAC · Maxus · VW China · Generic

---

## Tech Stack & Deployment

- **Platform**: Cloudflare Pages
- **Status**: ✅ Running locally in the dev sandbox — not yet deployed to production
- **Stack**: Hono + TypeScript (edge shell) · vanilla ES-module frontend · zero CDN dependencies
- **Frontend size**: ~180 KB total including the Khmer font — no framework, no bundler for client code
- **Offline**: Service worker pre-caches all 13 assets on install (verified: 13/13 cached, app fully functional with the network disabled)

### Local development

```bash
npm run build                    # vite build → dist/
pm2 start ecosystem.config.cjs   # wrangler pages dev on :3000
curl http://localhost:3000
pm2 logs --nostream
```

### Deploy to production

```bash
npm run build
npx wrangler pages deploy dist --project-name webapp
```

---

## Verified Behaviour

- ✅ Build clean, no console errors on any view
- ✅ Offline reload with network disabled: app boots, all views render, commands process, Khmer font loads
- ✅ Service worker: 13/13 assets cached
- ✅ Intent matching: 43/43 unit tests pass, including indirect phrasings ("its too hot in here" → make it cooler)
- ✅ Slot filling: `24 degrees` → 温度调到24度 · Khmer `១៨ អង្សា` → 温度调到18度
- ✅ Brand switch changes the wake word used in every command (verified with Xiaomi 小爱小爱)
- ✅ Conversation mode correctly omits the wake word
- ✅ Search works across English, Chinese and Khmer
- ✅ Settings and brand choice persist across reload
- ✅ Recorder sheet opens, lists commands per category, closes

---

## Not Yet Implemented / Ideas

- **Offline Khmer/English ASR** — would need a bundled WASM model (~15–40 MB, e.g. Vosk/Whisper-tiny). Would make voice input truly offline on every phone.
- **Custom user commands** — let owners add their own phrase → Chinese mapping.
- **Command history & favourites** — most-used commands surfaced first.
- **Bulk clip recording** — record a whole category in one guided pass.
- **Export/import recordings** so a family can share one set of clips.
- **Real car integration** — Bluetooth/OBD or brand APIs, so commands don't need the acoustic loop.
- **Khmer UI translation** of the interface chrome itself (currently the chrome is English; all *content* is bilingual).
- **Volume auto-boost** during playback.

## Recommended Next Steps

1. Test in a real car with a real BYD/Geely/Xiaomi unit and tune the TTS speaking rate — this is the single highest-value validation.
2. Add "custom commands" so owners can fix anything the 102 don't cover.
3. Investigate bundling a small offline Khmer ASR model to close the last offline gap.
4. Deploy to Cloudflare Pages and share the install link with Cambodian EV owner groups for feedback.

---

**Last Updated**: 2026-08-28
