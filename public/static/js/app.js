/* =====================================================================
   EV Voice Control — Cambodia   |   main application
   100% offline. No network requests after first load.
   ===================================================================== */

import { BRANDS, getBrand } from './data/brands.js';
import { COMMANDS, CATEGORIES, GEELY_CATEGORIES, byCategory, getCommand, CAT_MAP } from './data/commands.js';

/* Geely ships its own real on-car category set (语音助手/导航出行/车辆控制/
   音乐控制/系统控制/生活服务) — use that instead of the generic 12-category
   layout when Geely is the selected brand. */
const catsForBrand = (brandId) => brandId === 'geely' ? GEELY_CATEGORIES : CATEGORIES;

const QUICK_DEFAULT = ['ac_on','temp_down','win_open_all','music_play','vol_up','nav_home','battery_level','lock_car'];
const QUICK_GEELY   = ['gn_home','gc_win_open','gc_temp_24','gm_jay','gm_pause','gs_bt','gs_vol_up'];
const quickForBrand = (brandId) => brandId === 'geely' ? QUICK_GEELY : QUICK_DEFAULT;
// examples shown on the Talk page's 3-language guide (say it in EN / 中文 / ខ្មែរ)
const GUIDE_IDS = ['ac_on','temp_up','win_open_all','music_play','nav_home','lock_car'];

// built-in Fish Audio voices (free s2.1-pro-free model) users can choose from
const FISH_VOICES = [
  { id:'bbfff76fd7c74f35a04a33366574f2d6', label:'Voice 1', emoji:'🎙️' },
  { id:'808a0775aa204dde81943d1ba099c327', label:'Voice 2', emoji:'🗣️' },
  { id:'fbe02f8306fc4d3d915e9871722a39d5', label:'Voice 3', emoji:'🌐' }
];

/* =====================================================================
   REAL-TIME VEHICLE STATE
   Each toggleable command maps to a vehicle key:
     { k, v }          → after running, vehicle[k] = v
     { k, store:true } → after running, vehicle[k] = the spoken value
     { k, store:N }    → after running, vehicle[k] = N (fixed)
     { k, adj }        → after running, vehicle[k] += adj (from current or base)
   When a command's target state equals the current state, the app asks
   "already X — do you want to Y?" instead of repeating the same command.
   ===================================================================== */
const STATE_MAP = {
  // A/C
  ac_on:       { k:'ac', v:'on',  inv:'ac_off', label:'on' },
  ac_off:      { k:'ac', v:'off', inv:'ac_on',  label:'off' },
  gc_ac_power: { k:'ac', v:'on',  inv:'gc_ac_off', label:'on' },
  gc_ac_off:   { k:'ac', v:'off', inv:'gc_ac_power', label:'off' },
  // temperature
  temp_set:    { k:'temp', store:true },
  gc_temp_24:  { k:'temp', store:24 },
  temp_up:     { k:'temp', adj:1,  base:24, min:16, max:32 },
  temp_down:   { k:'temp', adj:-1, base:24, min:16, max:32 },
  gc_temp_down:{ k:'temp', adj:-1, base:24, min:16, max:32 },
  // windows
  win_open_all:     { k:'windows', v:'open',   inv:'win_close_all', label:'open' },
  win_close_all:    { k:'windows', v:'closed', inv:'win_open_all',  label:'closed' },
  win_half:         { k:'windows', v:'half',   inv:'win_close_all', label:'half-open' },
  gc_win_open:      { k:'windows', v:'open',   inv:'gc_win_close',  label:'open' },
  gc_win_close:     { k:'windows', v:'closed', inv:'gc_win_open',   label:'closed' },
  gc_win_half:      { k:'windows', v:'half',   inv:'gc_win_close',  label:'half-open' },
  gc_win_crack:     { k:'windows', v:'crack',  inv:'gc_win_close',  label:'cracked' },
  // sunroof
  roof_open:        { k:'sunroof', v:'open',   inv:'roof_close', label:'open' },
  roof_close:       { k:'sunroof', v:'closed', inv:'roof_open',  label:'closed' },
  gc_sunroof_open:  { k:'sunroof', v:'open',   inv:'gc_sunroof_close', label:'open' },
  gc_sunroof_close: { k:'sunroof', v:'closed', inv:'gc_sunroof_open',  label:'closed' },
  gc_sunroof_half:  { k:'sunroof', v:'half',   inv:'gc_sunroof_close', label:'half-open' },
  gc_sunroof_vent:  { k:'sunroof', v:'vent',   inv:'gc_sunroof_close', label:'vented' },
  // sunshade
  shade_open:       { k:'sunshade', v:'open',   inv:'shade_close', label:'open' },
  shade_close:      { k:'sunshade', v:'closed', inv:'shade_open',  label:'closed' },
  gc_shade_open:    { k:'sunshade', v:'open',   inv:'gc_shade_close', label:'open' },
  gc_shade_close:   { k:'sunshade', v:'closed', inv:'gc_shade_open',  label:'closed' },
  // seats
  seat_heat_on:     { k:'seatHeat', v:'on',  inv:'gc_seat_heat_off', label:'on' },
  seat_vent_on:     { k:'seatVent', v:'on',  inv:'gc_seat_vent_off', label:'on' },
  gc_seat_heat_on:  { k:'seatHeat', v:'on',  inv:'gc_seat_heat_off', label:'on' },
  gc_seat_heat_off: { k:'seatHeat', v:'off', inv:'gc_seat_heat_on',  label:'off' },
  gc_seat_vent_on:  { k:'seatVent', v:'on',  inv:'gc_seat_vent_off', label:'on' },
  gc_seat_vent_off: { k:'seatVent', v:'off', inv:'gc_seat_vent_on',  label:'off' },
  // cameras
  cam_360:          { k:'cam360', v:'on',  inv:'gc_cam360_off', label:'on' },
  gc_cam360_on:     { k:'cam360', v:'on',  inv:'gc_cam360_off', label:'on' },
  gc_cam360_off:    { k:'cam360', v:'off', inv:'gc_cam360_on',  label:'off' },
  // media
  music_play:  { k:'media', v:'playing', inv:'music_pause', label:'playing' },
  music_pause: { k:'media', v:'paused',  inv:'music_play',  label:'paused' },
  gm_play:     { k:'media', v:'playing', inv:'gm_pause',    label:'playing' },
  gm_pause:    { k:'media', v:'paused',  inv:'gm_play',     label:'paused' },
  gm_stop:     { k:'media', v:'stopped', inv:'gm_play',     label:'stopped' },
  // volume
  vol_set: { k:'volume', store:true },
  // lights
  light_on:  { k:'lights', v:'on',  inv:'light_off', label:'on' },
  light_off: { k:'lights', v:'off', inv:'light_on',  label:'off' },
  // doors / trunk / charging
  lock_car:     { k:'lock', v:'locked',   inv:'unlock_car', label:'locked' },
  unlock_car:   { k:'lock', v:'unlocked', inv:'lock_car',   label:'unlocked' },
  trunk_open:   { k:'trunk', v:'open',   inv:'trunk_close', label:'open' },
  trunk_close:  { k:'trunk', v:'closed', inv:'trunk_open',  label:'closed' },
  charge_start: { k:'charging', v:'charging', inv:'charge_stop', label:'charging' },
  charge_stop:  { k:'charging', v:'stopped',  inv:'charge_start', label:'stopped' },
  // navigation
  nav_home:  { k:'nav', v:'home', inv:'nav_stop', label:'navigating' },
  nav_stop:  { k:'nav', v:'off', label:'off' },
  gn_home:   { k:'nav', v:'home', inv:'gn_cancel', label:'navigating' },
  gn_cancel: { k:'nav', v:'off', label:'off' },
  // connectivity
  gs_wifi: { k:'wifi', v:'on', label:'on' },
  gs_bt:   { k:'bt',   v:'on', label:'on' }
};

/* My EV "Live status" chips — tap one to run its reverse action. */
const STATUS_ITEMS = [
  { k:'ac',       icon:'❄️', label:'A/C',          on:'On',      off:'Off',     inv:'ac_off' },
  { k:'temp',     icon:'🌡️', label:'Temperature',  fmt:(v)=>v+'°C' },
  { k:'windows',  icon:'🪟', label:'Windows',      on:'Open',    off:'Closed',  inv:'win_close_all' },
  { k:'sunroof',  icon:'🌞', label:'Sunroof',      on:'Open',    off:'Closed',  inv:'roof_close' },
  { k:'sunshade', icon:'🧵', label:'Sunshade',     on:'Open',    off:'Closed',  inv:'shade_close' },
  { k:'seatHeat', icon:'🔥', label:'Seat heat',    on:'On',      off:'Off',     inv:'gc_seat_heat_off' },
  { k:'seatVent', icon:'🪑', label:'Seat cooling', on:'On',      off:'Off',     inv:'gc_seat_vent_off' },
  { k:'cam360',   icon:'📷', label:'360° camera',  on:'On',      off:'Off',     inv:'gc_cam360_off' },
  { k:'media',    icon:'🎵', label:'Media',        on:'Playing', off:'Stopped', inv:'music_pause' },
  { k:'lock',     icon:'🔒', label:'Doors',        on:'Locked',  off:'Unlocked', inv:'unlock_car' },
  { k:'charging', icon:'🔋', label:'Charging',     on:'Charging',off:'Stopped', inv:'charge_stop' },
  { k:'nav',      icon:'🧭', label:'Navigation',   on:'Active',  off:'Off',     inv:'nav_stop' }
];
import { matchIntent, fill, searchCommands, isKhmer, matchReply } from './nlu.js';
import {
  loadVoices, chineseVoices, allVoices, offlineChineseReady,
  speakChinese, speakOwner, stopSpeaking, testPremiumVoice,
  ClipRecorder, clipStore, Listener, recognitionAvailable, settings
} from './speech.js';

/* ---------------------------------------------------------------
   STATE
   --------------------------------------------------------------- */
const S = {
  view: 'talk',
  brand: 'byd',
  cat: 'climate',
  inputLang: 'en',        // 'en' | 'km'
  transcript: [],
  listening: false,
  speaking: false,
  convo: false,           // conversation mode
  recordedClips: new Set(),
  cfg: {
    rate: 0.92, volume: 1, voiceURI: null,
    autoWake: true,       // prepend wake word
    speakBack: true,      // read the car's reply aloud in owner language
    showPinyin: true,
    showKhmerRead: true,
    useRecordings: true,
    premiumVoice: true,   // fish-audio s2.1-pro-free via /api/tts (falls back offline)
    voiceId: null,        // optional Fish Audio voice id (from fish.audio discovery)
    notifications: true,  // live local notifications for commands / car replies
    speakDelay: 0.3,      // seconds to wait before speaking a command (lets the car's assistant wake)
    replyDelay: 1,        // seconds to wait after speaking before listening for the car's reply (conversation mode)
    theme: 'auto',        // 'auto' | 'light' | 'dark'
    font: { zh:'default', en:'default', km:'default' }, // text size: 'small' | 'default' | 'large'
    vehicle: {              // real-time vehicle state — updated after each command and from the car's reply
      ac:'off', temp:null, fan:null, recirc:null,
      windows:'closed', sunroof:'closed', sunshade:'closed',
      seatVent:'off', seatHeat:'off', cam360:'off',
      media:'stopped', volume:null, lights:'off',
      lock:'locked', trunk:'closed', charging:null,
      wifi:null, bt:null, nav:null, wipers:'off', defrost:'off'
    },
    profile: {            // the owner's car — all user-provided, blanks allowed
      name: '', plate: '', battery: '', batteryCapacity: '', range: '', rangeUnit: 'mi',
      chargingPower: '', home: '', climate: '', media: '',
      tireFL: '', tireFR: '', tireRL: '', tireRR: '',
      journeys: []        // [{ dest, dist, time, pct }]
    }
  }
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

/* ---------------------------------------------------------------
   LOCAL NOTIFICATIONS — via the Service Worker (offline, no server)
   --------------------------------------------------------------- */
async function notify(title, body) {
  if (!S.cfg.notifications) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch { return; }
  }
  if (Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, {
      body,
      icon: '/static/icons/icon-192.png',
      badge: '/static/icons/icon-192.png',
      vibrate: [120, 60, 120]
    });
  } catch {}
}

/* PWA install prompt (captured so the user can trigger it from Settings) */
let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  render();
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  render();
});

/* ---------------------------------------------------------------
   PERSISTENCE
   --------------------------------------------------------------- */
function saveState() {
  settings.save({ brand: S.brand, inputLang: S.inputLang, cfg: S.cfg, convo: S.convo });
}
function loadState() {
  const s = settings.load();
  if (s.brand && BRANDS.some(b => b.id === s.brand)) S.brand = s.brand;
  if (s.inputLang) S.inputLang = s.inputLang;
  if (typeof s.convo === 'boolean') S.convo = s.convo;
  if (s.cfg) Object.assign(S.cfg, s.cfg);
}

/* ---------------------------------------------------------------
   THEME — light / dark / auto
   --------------------------------------------------------------- */
function systemLight() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches;
}
function applyTheme() {
  const t = S.cfg.theme || 'auto';
  const d = t === 'light' ? 'light' : t === 'dark' ? 'dark' : (systemLight() ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', d);
  const lbl = $('#menuThemeLabel');
  if (lbl) lbl.textContent = 'Theme: ' + (t === 'auto' ? 'Auto' : t === 'light' ? 'Light' : 'Dark');
  $$('[data-theme-opt]').forEach(b => b.classList.toggle('sel', b.dataset.themeOpt === t));
}

/* ---------------------------------------------------------------
   TEXT SIZE — per-language scale (Chinese / English / Khmer).
   Base sizes live in CSS vars (--fz-zh/-en/-km/-kmr/-py); the
   Khmer pronunciation line (kmr) is always larger than English.
   --------------------------------------------------------------- */
const FONT_MUL = { small: 0.86, default: 1, large: 1.18 };
function applyFontSizes() {
  const f = Object.assign({ zh:'default', en:'default', km:'default' }, S.cfg.font || {});
  const px = (v, base) => Math.round(base * (FONT_MUL[v] || 1) * 100) / 100 + 'px';
  const r = document.documentElement.style;
  r.setProperty('--fz-zh',  px(f.zh, 18));    // Chinese
  r.setProperty('--fz-py',  px(f.zh, 12));    // pinyin follows Chinese
  r.setProperty('--fz-en',  px(f.en, 13));    // English
  r.setProperty('--fz-km',  px(f.km, 13.5));  // Khmer translation
  r.setProperty('--fz-kmr', px(f.km, 15.5));  // Khmer pinyin — bigger than English by default
}
if (typeof matchMedia !== 'undefined') {
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (S.cfg.theme === 'auto') applyTheme(); });
}

/* ---------------------------------------------------------------
   TRANSCRIPT
   --------------------------------------------------------------- */
function now() {
  return new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}
function addLine(entry) {
  entry.t = now();
  S.transcript.push(entry);
  if (S.transcript.length > 200) S.transcript.shift();
  renderTranscript();
}
function clearTranscript() {
  S.transcript = [];
  renderTranscript();
}

function renderTranscript() {
  const box = $('#transcript');
  if (!box) return;

  if (!S.transcript.length) {
    box.innerHTML = `
      <div class="tr-empty">
        <div class="ee">💬</div>
        <p><b>No conversation yet</b></p>
        <p class="km">មិនមានការសន្ទនានៅឡើយទេ</p>
        <p style="margin-top:10px">Tap the mic, type below, or pick a command button.</p>
      </div>`;
    return;
  }

  box.innerHTML = S.transcript.map(e => {
    if (e.kind === 'sys')
      return `<div class="bub sys">${esc(e.text)}</div>`;

    if (e.kind === 'listening')
      return `<div class="bub listening"><div class="who">Listening…</div>${esc(e.text)}</div>`;

    if (e.kind === 'me') {
      // what the owner said/typed, plus what we sent to the car in Chinese
      let h = `<div class="bub me"><div class="who">You → Car</div>`;
      if (e.said)  h += `<div class="ln l-en">"${esc(e.said)}"</div>`;
      if (e.zh)    h += `<div class="ln l-zh">${esc(e.zh)}</div>`;
      if (e.py && S.cfg.showPinyin) h += `<div class="ln l-py">${esc(e.py)}</div>`;
      if (e.kmr && S.cfg.showKhmerRead) h += `<div class="ln l-kmr">🗣 ${esc(e.kmr)}</div>`;
      h += `<div class="ts">${esc(e.t)}${e.via ? ' · ' + esc(e.via) : ''}</div></div>`;
      return h;
    }

    // car reply
    if (e.waiting) {
      let w = `<div class="bub car waiting"><div class="who">👂 Waiting for the car…</div>`;
      if (e.text) w += `<div class="ln l-zh">${esc(e.text)}</div>`;
      w += `<div class="ts">${esc(e.t)}</div></div>`;
      return w;
    }
    let h = `<div class="bub car"><div class="who">🚗 Car replied</div>`;
    if (e.zh) h += `<div class="ln l-zh">${esc(e.zh)}</div>`;
    if (e.py && S.cfg.showPinyin) h += `<div class="ln l-py">${esc(e.py)}</div>`;
    if (e.en) h += `<div class="ln l-en">🇬🇧 ${esc(e.en)}</div>`;
    if (e.km) h += `<div class="ln l-km">🇰🇭 ${esc(e.km)}</div>`;
    if (e.note) h += `<div class="ln note">${esc(e.note)}</div>`;
    h += `<div class="ts">${esc(e.t)}</div></div>`;
    return h;
  }).join('');

  box.scrollTop = box.scrollHeight;
}

/* ---------------------------------------------------------------
   CORE: send a command to the car
   --------------------------------------------------------------- */
async function runCommand(cmd, value = null, meta = {}) {
  if (!cmd) return;

  // Commands with a level/number slot ("set temperature to __", "set volume to __")
  // ask the owner for the value instead of silently using a default.
  if (cmd.slot && (value === null || value === undefined)) {
    const v = await askForValue(cmd);
    if (v === null) { addLine({ kind:'sys', text:'⏹ Value input canceled.' }); return; }
    value = v;
  }

  // Real-time vehicle state — if the car is already in the state this command
  // would set, ask "already X — do you want to Y?" instead of repeating it.
  const st = STATE_MAP[cmd.id];
  if (st && st.v !== undefined && !meta.smart) {
    const veh = S.cfg.vehicle || (S.cfg.vehicle = {});
    if (veh[st.k] === st.v) {
      const choice = await askVehicleToggle(cmd, st);
      if (choice === 'reverse') {
        const inv = getCommand(st.inv);
        if (inv) return runCommand(inv, null, { via:'smart' });
        return;
      }
      if (choice === 'keep') addLine({ kind:'sys', text:`👍 OK — keeping it ${st.label}.` });
      return;
    }
  }

  const brand = getBrand(S.brand);

  const zhCore = fill(cmd.zh, value);
  const pyCore = fill(cmd.py, value);
  const kmrCore = fill(cmd.kmr, value);

  const wake = (S.cfg.autoWake && !S.convo) ? brand.wake : '';
  const zhFull = wake ? `${wake}，${zhCore}` : zhCore;
  const pyFull = wake ? `${brand.wakePy}, ${pyCore}` : pyCore;
  const kmrFull = wake ? `${brand.wakeKm}, ${kmrCore}` : kmrCore;

  addLine({
    kind: 'me',
    said: meta.said || null,
    zh: zhFull, py: pyFull, kmr: kmrFull,
    via: meta.via || null
  });

  // visual feedback on the card
  const el = $(`.cmd[data-id="${cmd.id}"]`);
  if (el) { el.classList.add('speaking'); setTimeout(() => el.classList.remove('speaking'), 1600); }

  // configurable pause before speaking — lets the car's voice assistant wake up
  const preDelay = parseFloat(S.cfg.speakDelay) || 0;
  if (preDelay > 0) await new Promise(r => setTimeout(r, preDelay * 1000));

  // speak it
  S.speaking = true;
  setMicState();
  const clipId = (S.cfg.useRecordings && S.recordedClips.has(cmd.id)) ? cmd.id : null;
  const res = await speakChinese(zhFull, {
    clipId,
    rate: S.cfg.rate,
    volume: S.cfg.volume,
    voiceURI: S.cfg.voiceURI,
    premium: S.cfg.premiumVoice,
    voiceId: S.cfg.voiceId
  });
  S.speaking = false;
  setMicState();

  notify('🚗 Command sent', meta.said || cmd.en || cmd.zh);

  // remember the new vehicle state (optimistic — the car's reply can correct it)
  if (st) {
    const veh = S.cfg.vehicle || (S.cfg.vehicle = {});
    if (st.adj)  veh[st.k] = Math.min(st.max ?? 99, Math.max(st.min ?? 0, ((veh[st.k] == null ? (st.base ?? 24) : veh[st.k]) + st.adj)));
    else if (st.store) veh[st.k] = (st.store === true) ? value : st.store;
    else veh[st.k] = st.v;
    saveState();
  }

  // Surface premium-voice problems once per session so it's never a silent fallback.
  if (res.premiumNote && !S._premiumWarned) {
    S._premiumWarned = true;
    addLine({ kind:'sys', text:`⚠ ${res.premiumNote} — check Settings → Premium voices.` });
  }

  if (res.method === 'none') {
    addLine({ kind:'sys', text:`⚠ ${res.detail}. Show the Chinese text on screen and read it aloud — or record your own clip in Settings.` });
  }

  // wait for the car's real reply and transcribe what it says
  listenForCarReply(value);
}

/* ---------------------------------------------------------------
   CAR REPLY — wait for the real reply and transcribe it
   --------------------------------------------------------------- */
let carListener = null;
let carListenTimer = null;

function stopCarListening() {
  if (carListener) { try { carListener.abort(); } catch {} carListener = null; }
  if (carListenTimer) { clearTimeout(carListenTimer); carListenTimer = null; }
}

function listenForCarReply(value = null) {
  stopCarListening();

  // Only auto-listen for the car's reply in conversation mode. With the wake
  // word prepended (conversation off) this is a one-shot command — no mic use.
  if (!S.convo) return;

  if (!recognitionAvailable) {
    addLine({ kind:'sys', text:"This browser can't hear the car's reply — it has no speech recognition. Listen to the car directly." });
    return;
  }
  if (S.listening) return; // the owner is already talking; don't run two listeners at once

  const waitLine = { kind:'car', waiting:true, text:'' };
  addLine(waitLine);
  let settled = false;

  const settle = (entry) => {
    if (settled) return;
    settled = true;
    stopCarListening();
    Object.assign(waitLine, entry);
    renderTranscript();
  };

  // configurable delay before listening — gives the car time to answer first
  const replyDelay = parseFloat(S.cfg.replyDelay) || 0;

  const begin = () => {
    if (settled) return;

    carListener = new Listener({
    lang: 'zh-CN',
    onPartial: (txt) => {
      if (settled) return;
      waitLine.text = txt;
      renderTranscript();
    },
    onFinal: (txt, alts) => {
      if (settled) return;
      // pick the transcription that best matches a known reply so we can translate it
      let chosen = txt, match = null;
      for (const c of [txt, ...(alts || [])].filter(Boolean)) {
        const m = matchReply(c);
        if (m) { chosen = c; match = m; break; }
      }
      const rep = match && match.reply ? match.reply : null;

      // the car's actual reply confirms the real state — remember it
      if (match) {
        const mst = STATE_MAP[match.id];
        if (mst) {
          const veh = S.cfg.vehicle || (S.cfg.vehicle = {});
          if (mst.adj)  veh[mst.k] = Math.min(mst.max ?? 99, Math.max(mst.min ?? 0, ((veh[mst.k] == null ? (mst.base ?? 24) : veh[mst.k]) + mst.adj)));
          else if (mst.store) veh[mst.k] = (mst.store === true) ? value : mst.store;
          else veh[mst.k] = mst.v;
          saveState();
        }
      }

      settle({
        waiting: false,
        zh: chosen,
        en: rep ? fill(rep.en, value) : null,
        km: rep ? fill(rep.km, value) : null,
        note: rep ? null : "The car said the Chinese above — no translation available for this exact reply."
      });
      notify('🚗 Car replied', (rep ? fill(rep.en, value) : chosen) || chosen);
      if (S.cfg.speakBack && rep) {
        const line = S.inputLang === 'km' ? fill(rep.km, value) : fill(rep.en, value);
        if (line) speakOwner(line, S.inputLang, { premium: S.cfg.premiumVoice, voiceId: S.cfg.voiceId });
      }
    },
    onError: (err) => {
      if (settled) return;
      const msgs = {
        'no-speech': "I didn't hear the car's reply.",
        'network': "Couldn't hear the car's reply — Chinese voice recognition needs internet on this phone.",
        'not-allowed': "Microphone permission is needed to hear the car's reply.",
        'audio-capture': "No microphone found on this device.",
        'language-not-supported': "Chinese voice input is not installed on this phone.",
        'unsupported': "Speech recognition is not supported here."
      };
      settle({ waiting:false, note: msgs[err] || "Couldn't hear the car's reply." });
    },
    onEnd: () => {
      if (settled) return;
      settle({ waiting:false, note:"I didn't hear a reply from the car." });
    }
  });

  if (!carListener.start()) {
    settle({ waiting:false, note:"Couldn't start listening for the car's reply." });
    return;
  }

  // safety timeout — some cars answer with a beep or nothing audible at all
  carListenTimer = setTimeout(() => {
    if (settled) return;
    settle({ waiting:false, note:"No reply heard — the car may have answered with a beep or just performed the action." });
  }, 12000);
  };

  if (replyDelay > 0) {
    waitLine.text = `Will listen for the car in ${replyDelay}s…`;
    renderTranscript();
    carListenTimer = setTimeout(begin, replyDelay * 1000);
  } else {
    begin();
  }
}

/* ---------------------------------------------------------------
   handle free text / recognised speech
   --------------------------------------------------------------- */
async function handleUtterance(text, via = 'typed') {
  const t = (text || '').trim();
  if (!t) return;

  const m = matchIntent(t);

  if (m && m.cmd) {
    await runCommand(m.cmd, m.value, { said: t, via });
    return;
  }

  // no confident match → show suggestions
  const sug = (m && m.suggestions) ? m.suggestions.slice(0, 3) : [];
  addLine({ kind:'me', said:t, zh:null, via });
  addLine({
    kind:'sys',
    text: sug.length
      ? `I didn't catch a command. Did you mean one of these? ${sug.map(c => c.en).join(' · ')}`
      : `No matching command found. Try the Commands tab to browse all ${COMMANDS.length} commands.`
  });

  if (sug.length) {
    const box = $('#suggestions');
    if (box) {
      box.innerHTML = sug.map(c =>
        `<button class="chip" data-sug="${c.id}">${c.icon} ${esc(c.en)}</button>`).join('');
      box.style.display = 'flex';
    }
  }
}

/* ---------------------------------------------------------------
   MIC
   --------------------------------------------------------------- */
let listener = null;

function setMicState() {
  const mic = $('#mic');
  if (!mic) return;
  mic.classList.toggle('live', S.listening);
  mic.classList.toggle('busy', S.speaking && !S.listening);
  mic.textContent = S.listening ? '⏹' : (S.speaking ? '🔊' : '🎤');
  const lb = $('#micLabel');
  const sub = $('#micSub');
  if (lb) lb.textContent = S.listening ? 'Listening… tap to stop'
        : S.speaking ? 'Speaking to car…' : 'Tap to speak';
  if (sub && !S.listening) {
    sub.textContent = recognitionAvailable
      ? (S.inputLang === 'km' ? 'ភាសាខ្មែរ · needs phone support' : 'English')
      : 'Voice input unavailable — use text box below';
  }
}

function startListening() {
  if (!recognitionAvailable) {
    addLine({ kind:'sys', text:'This browser has no speech recognition. Use the text box or the Commands tab — both work fully offline.' });
    return;
  }
  stopCarListening();
  stopSpeaking();
  const lang = S.inputLang === 'km' ? 'km-KH' : 'en-US';
  let partialShown = false;

  listener = new Listener({
    lang,
    onPartial: (txt) => {
      const last = S.transcript[S.transcript.length - 1];
      if (partialShown && last && last.kind === 'listening') {
        last.text = txt; renderTranscript();
      } else {
        addLine({ kind:'listening', text: txt }); partialShown = true;
      }
      const sub = $('#micSub'); if (sub) sub.textContent = txt.slice(0, 60);
    },
    onFinal: (txt) => {
      // drop the interim bubble
      if (partialShown) {
        const i = S.transcript.map(e => e.kind).lastIndexOf('listening');
        if (i >= 0) S.transcript.splice(i, 1);
      }
      handleUtterance(txt, S.inputLang === 'km' ? 'Khmer voice' : 'English voice');
    },
    onError: (err) => {
      if (partialShown) {
        const i = S.transcript.map(e => e.kind).lastIndexOf('listening');
        if (i >= 0) S.transcript.splice(i, 1);
      }
      const msgs = {
        'no-speech': 'I did not hear anything. Try again, or type instead.',
        'not-allowed': 'Microphone permission denied. Allow mic access in your browser settings.',
        'audio-capture': 'No microphone found on this device.',
        'network': 'This phone needs internet for that language. Khmer/English offline recognition is not available here — use the text box or command buttons (both work offline).',
        'language-not-supported': `${S.inputLang === 'km' ? 'Khmer' : 'English'} voice input is not installed on this phone. Use the text box or the Commands tab.`,
        'unsupported': 'Speech recognition not supported. Use the text box.'
      };
      addLine({ kind:'sys', text: msgs[err] || `Voice input error: ${err}. Use the text box instead.` });
      S.listening = false; setMicState();
    },
    onEnd: () => { S.listening = false; setMicState(); }
  });

  if (listener.start()) { S.listening = true; setMicState(); }
}

function toggleMic() {
  if (S.listening) { listener && listener.stop(); S.listening = false; setMicState(); }
  else startListening();
}

/* ---------------------------------------------------------------
   RENDER: TALK view
   --------------------------------------------------------------- */
function renderTalk() {
  const brand = getBrand(S.brand);
  const quick = quickForBrand(S.brand);

  return `
    <div class="brand-hero">
      <div class="brand-mark" style="background:${brand.color}">${esc(brand.name.split(/[\s/]/)[0].slice(0,7))}</div>
      <div class="bh-i">
        <h3>${esc(brand.name)} <span class="muted small">${esc(brand.nameZh)}</span></h3>
        <div class="zhw">${esc(brand.wake)}</div>
        <div class="pyw">${esc(brand.wakePy)}</div>
      </div>
      <button class="icon-btn" id="goBrand" title="Change car">🔄</button>
    </div>

    <div class="card">
      <div class="mic-zone">
        <button class="mic" id="mic"><span class="mic-ring"></span>🎤</button>
        <div class="mic-lb" id="micLabel">Tap to speak</div>
        <div class="mic-sub" id="micSub"></div>
      </div>

      <div class="lang-toggle">
        <button class="lang-b ${S.inputLang==='en'?'sel':''}" data-lang="en">🇬🇧 English</button>
        <button class="lang-b ${S.inputLang==='km'?'sel':''}" data-lang="km">🇰🇭 ខ្មែរ</button>
      </div>

      <div class="in-row">
        <input id="textIn" placeholder="${S.inputLang==='km' ? 'សរសេរបញ្ជា…' : 'Or type a command…'}"
               autocomplete="off" autocapitalize="off" spellcheck="false">
        <button id="sendIn" title="Send">➤</button>
      </div>

      <div class="chips" id="suggestions" style="display:none"></div>

      <div class="chips">
        ${quick.map(id => { const c = getCommand(id);
          return c ? `<button class="chip" data-quick="${id}">${c.icon} ${esc(c.en)}</button>` : ''; }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">🗣</span> 3-language guide</div>
      <p class="hint" style="margin-bottom:10px">Say it in <b>English</b>, <b>Chinese</b>, or <b>Khmer</b> — the app speaks Chinese to your car. The Khmer line below the Chinese is its pronunciation guide. Tap one to send it.</p>
      <div class="guide">
        ${GUIDE_IDS.map(id => { const c = getCommand(id); if (!c) return '';
          return `<button class="gchip" data-sug="${id}">
            <span class="g-en">🇬🇧 ${esc(c.en)}</span>
            <span class="g-zh">${esc(c.zh)}</span>
            <span class="g-kmr">🗣 ${esc(c.kmr)}</span>
            <span class="g-km">🇰🇭 ${esc(c.km)}</span>
          </button>`; }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="tr-head">
        <h3>📝 Live Transcript</h3>
        <button class="pill ${S.convo?'on':''}" id="convoToggle">
          <span class="dot ${S.convo?'pulse':''}"></span>${S.convo ? 'Conversation ON' : 'Conversation OFF'}
        </button>
        <button class="tr-clear" id="clearTr">Clear</button>
    </div>
    <div class="transcript" id="transcript"></div>
  </div>
`;
}

/* ---------------------------------------------------------------
   RENDER: MY EV dashboard
   (Live vehicle status tracked from commands + car replies; the
   profile tiles are the owner's own data. Quick actions below run
   the actual voice commands.)
   --------------------------------------------------------------- */
function statusChips() {
  const veh = S.cfg.vehicle || {};
  return STATUS_ITEMS.map(it => {
    const cur = veh[it.k];
    if (cur == null) return '';
    const isOn = it.on != null && cur === it.on;
    const val = it.fmt ? it.fmt(cur) : (isOn ? it.on : it.off);
    return `<button class="vchip ${isOn?'on':''}" data-vinv="${it.inv || ''}" title="${esc(it.label)} — tap to ${it.inv ? 'toggle' : 'view'}">
      <span class="vchip-ic">${it.icon}</span>
      <b>${esc(it.label)}</b>
      <em>${esc(val)}</em>
    </button>`;
  }).join('');
}
function renderMyEv() {
  const brand = getBrand(S.brand);
  const p = S.cfg.profile || {};
  const d = (v) => (v === '' || v == null ? '—' : esc(v));

  const tile = (icon, label, value, unit) => `
    <div class="stat-tile">
      <div class="st-ic">${icon}</div>
      <div class="st-lb">${esc(label)}</div>
      <div class="st-v">${d(value)}</div>
      <div class="st-u">${esc(unit)}</div>
    </div>`;

  const psi = [['FL', p.tireFL], ['FR', p.tireFR], ['RL', p.tireRL], ['RR', p.tireRR]];
  const anyTire = psi.some(([, v]) => v);
  const journeys = (p.journeys || []).filter(j => j.dest);
  const soc = Math.max(0, Math.min(100, parseFloat(p.battery) || 0));
  const rangeUnit = p.rangeUnit || 'mi';

  return `
    <div class="ev-hero">
      <span class="ev-pill on"><span class="dot"></span>Active</span>
      <h2 style="font-size:28px;font-weight:800;letter-spacing:-.03em;margin-top:9px">${d(p.name || brand.name)}</h2>
      <div class="ev-loc"><span class="pin">📍</span><span>${p.home ? esc(p.home) : 'Wake: ' + esc(brand.wake)}</span></div>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">🔴</span> Live status</div>
      <p class="hint" style="margin-bottom:10px">Tracked in real time from your commands and the car's replies. Tap a chip to run its reverse action (e.g. close what's open).</p>
      <div class="vchips">${statusChips()}</div>
    </div>

    <div class="stat-grid">
      ${tile('🔋','Battery', p.battery, '%')}
      ${tile('🛣️','Range', p.range, rangeUnit)}
      ${tile('❄️','Climate', p.climate, '°C')}
      ${tile('⚡','Charging', p.chargingPower, 'kW')}
    </div>

    <div class="ev-dark">
      <div class="ed-lb">Tire Pressure</div>
      <h3>${anyTire ? 'Optimal' : 'Not set'}</h3>
      <div class="ed-sub">${anyTire ? 'All wheels within spec' : 'Add your PSI in Settings → Car profile'}</div>
      <div class="ed-row">
        ${psi.map(([k, v]) => `
          <div class="psi"><div class="p">${k}</div><div class="v">${d(v)}</div><div class="u">PSI</div></div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">⚡</span> Charging Status</div>
      <div class="ev-charge">
        <div class="ec-main">
          <div class="ec-lb">State of charge</div>
          <div class="ec-big">${d(p.battery)}<small>%</small></div>
          <div class="ec-meta">${p.chargingPower ? `<b>${esc(p.chargingPower)} kW</b> charging rate` : '— kW charging rate'}</div>
          <div class="ec-bar"><i style="width:${soc}%"></i></div>
        </div>
        <button class="btn dang" style="flex:0 0 120px;margin:0" data-evcmd="charge_stop">⛔ Stop Charge</button>
      </div>

      <div class="ev-quick">
        <button class="q" data-quick="ac_on"    data-via="quick"><span class="qi">❄️</span>Climate</button>
        <button class="q" data-quick="unlock_car" data-via="quick"><span class="qi">🔓</span>Unlock</button>
        <button class="q" data-quick="find_car"  data-via="quick"><span class="qi">📢</span>Honk</button>
        <button class="q" data-quick="light_hazard" data-via="quick"><span class="qi">💡</span>Flash</button>
        <button class="precool" data-quick="ac_on" data-via="quick">❄️<span style="font-size:9px">Pre-Cool</span></button>
      </div>
    </div>

    <div class="stat-grid">
      <div class="card" style="margin-bottom:0">
        <div class="card-t"><span class="em">❄️</span> Climate</div>
        <div class="stat-mini"><div class="sv">${d(p.climate)}°C</div><div class="sl">Driver zone</div></div>
        <div class="sp"></div>
        <p class="hint">${p.climate ? 'Comfort climate target' : 'Not set'}</p>
      </div>
      <div class="card" style="margin-bottom:0">
        <div class="card-t"><span class="em">🎵</span> Media</div>
        <div class="stat-mini"><div class="sv" style="font-size:15px;letter-spacing:0">${d(p.media)}</div><div class="sl">Now playing</div></div>
        <div class="sp"></div>
        <p class="hint">${p.media ? 'Bluetooth · ' + esc(brand.name) : 'Not set'}</p>
      </div>
    </div>

    <div class="card">
      <div class="jhead"><h3>Recent Journeys</h3><a href="#" data-goto="settings">Manage</a></div>
      ${journeys.length ? journeys.map(j => `
        <div class="ev-journey">
          <div class="jic">📍</div>
          <div class="jb"><div class="jdest">${esc(j.dest)}</div>
            <div class="jmeta">${d(j.dist)} ${esc(rangeUnit)} · ${d(j.time)} min</div></div>
          <div class="jpct">${d(j.pct)}%</div>
        </div>`).join('')
        : `<div class="ev-empty"><div class="ee">🗺️</div><p>No journeys yet.<br>Add them in <a href="#" data-goto="settings">Settings → Car profile</a>.</p></div>`}
    </div>

    <p class="hint center">Your car details — edit them in <a href="#" data-goto="settings">Settings → Car profile</a>. Empty fields show “—” until you fill them in.</p>
    <div class="sp"></div>
  `;
}

/* ---------------------------------------------------------------
   RENDER: COMMANDS view
   --------------------------------------------------------------- */
function cmdCard(c) {
  const hasClip = S.recordedClips.has(c.id);
  const catColor = (CAT_MAP[c.cat] && CAT_MAP[c.cat].color) || '#22d3ee';
  // slot commands ("{n}") show a "set" chip — tapping asks for the value
  const slot = (s) => c.slot ? esc(s).replace(/\{n\}/g, '<span class="slot-chip">set</span>') : esc(s);
  return `
    <button class="cmd" data-id="${c.id}">
      <div class="cmd-ic" style="background:${catColor}22;border-color:${catColor}55">${c.icon}</div>
      <div class="cmd-b">
        <div class="cmd-zh">${slot(c.zh)}</div>
        ${S.cfg.showPinyin ? `<div class="cmd-py">${slot(c.py)}</div>` : ''}
        <div class="cmd-en">${slot(c.en)}</div>
        <div class="cmd-km">${slot(c.km)}</div>
        ${S.cfg.showKhmerRead ? `<div class="cmd-kmr">🗣 ${slot(c.kmr)}</div>` : ''}
        ${hasClip ? `<div class="rec-tag">🎙 your recording</div>` : ''}
      </div>
      <div class="cmd-go">▶</div>
    </button>`;
}

function renderCommands() {
  const q = $('#cmdSearch') ? $('#cmdSearch').value : '';
  const cats = catsForBrand(S.brand);
  const allCmds = COMMANDS.filter(c => cats.some(x => x.id === c.cat));
  const list = q.trim() ? searchCommands(q) : (S.cat === 'all' ? allCmds : byCategory(S.cat));

  return `
    <div class="search-box">
      <span class="si">🔍</span>
      <input id="cmdSearch" placeholder="Search English / ខ្មែរ / 中文 / pinyin…"
             value="${esc(q)}" autocomplete="off" spellcheck="false">
      <button class="sx ${q?'show':''}" id="clearSearch">✕</button>
    </div>

    ${q.trim() ? '' : `
    <div class="cat-row">
      <button class="cat-c ${S.cat==='all'?'sel':''}" data-cat="all" style="--catc:#94a3b8">
        <span>🗂</span><span>All</span>
        <span class="cnt">${allCmds.length}</span>
      </button>
      ${cats.map(c => `
        <button class="cat-c ${S.cat===c.id?'sel':''}" data-cat="${c.id}" style="--catc:${c.color}">
          <span>${c.icon}</span><span>${esc(c.en)}</span>
          <span class="cnt">${byCategory(c.id).length}</span>
        </button>`).join('')}
    </div>`}

    ${q.trim() ? `<p class="hint" style="margin-bottom:10px">${list.length} result${list.length===1?'':'s'} for "${esc(q)}"</p>` : `
      <p class="hint km" style="margin-bottom:10px">${S.cat === 'all'
        ? `${allCmds.length} commands — tap the active tab again to show All`
        : `${esc(CAT_MAP[S.cat].km)} · ${esc(CAT_MAP[S.cat].zh)}`}</p>`}

    <div class="cmd-grid">
      ${list.length ? list.map(cmdCard).join('')
        : `<div class="tr-empty"><div class="ee">🔍</div><p>Nothing found. Try another word.</p></div>`}
    </div>
    <div class="sp"></div>
  `;
}

/* ---------------------------------------------------------------
   MY CAR + CAR PROFILE (both live inside Settings)
   --------------------------------------------------------------- */
function brandCard(b) {
  return `
    <button class="brand-c ${S.brand===b.id?'sel':''}" data-brand="${b.id}">
      <div class="bstripe" style="background:${b.color}"></div>
      ${b.popular ? '<span class="star">★</span>' : ''}
      <div class="bn">${esc(b.name)}</div>
      <div class="bz">${esc(b.wake)}</div>
      <div class="bw">${esc(b.assistant)}</div>
    </button>`;
}

function myCarCard() {
  const b = getBrand(S.brand);
  return `
    <div class="card">
      <div class="card-t"><span class="em">🚗</span> My Car</div>
      <div class="big-zh">
        <div class="bz-zh">${esc(b.wake)}</div>
        <div class="bz-py">${esc(b.wakePy)}</div>
        <div class="bz-kmr">🇰🇭 ${esc(b.wakeKm)}</div>
      </div>
      <p class="hint"><b>${esc(b.name)}</b> · ${esc(b.assistant)}<br>${esc(b.models)}</p>
      <div class="sp"></div>
      <div class="brand-grid">${BRANDS.map(brandCard).join('')}</div>
      <div class="sp"></div>
      <button class="btn sec" id="testWake">🔊 Test the wake word</button>
    </div>`;
}

function carProfileCard() {
  const p = S.cfg.profile || {};
  const filled = Object.entries(p)
    .filter(([k, v]) => k !== 'journeys' && k !== 'rangeUnit' && v !== '' && v != null).length;
  return `
    <div class="card">
      <div class="card-t"><span class="em">🔑</span> Car Profile <span class="pro-badge" style="margin-left:auto">★ Pro</span></div>
      <p class="hint">Your own car details — name, battery, range, tires, journeys. They fill the <b>My EV</b> dashboard. Blanks show as “—” until you add them.</p>
      <div class="sp"></div>
      <button class="btn" id="editProfile">🚗 Edit car profile</button>
      <p class="hint" style="margin-top:9px">${filled ? `${filled} field${filled===1?'':'s'} saved` : 'Nothing set yet'}</p>
    </div>`;
}

/* ---------------------------------------------------------------
   VALUE DIALOG — for slot commands (temperature / volume / level).
   Asks the owner to type the number, shows a live preview of the
   exact Chinese phrase, then speaks it. Resolves null on cancel.
   --------------------------------------------------------------- */
function askForValue(cmd) {
  return new Promise((resolve) => {
    const isTemp = cmd.slot === 'temp';
    const min = isTemp ? 16 : 0;
    const max = isTemp ? 32 : 40;
    const def = isTemp ? 24 : 5;
    const unit = isTemp ? '°C' : '';
    const title = cmd.en.replace(/\{n\}.*$/, '…');

    const body = $('#sheetBody');
    body.innerHTML = `
      <div class="sheet-h">
        <h3>${isTemp ? '🌡️' : '🎚️'} ${esc(title)}</h3>
        <button class="icon-btn" id="sheetClose">✕</button>
      </div>
      <p class="hint">${isTemp
        ? 'Set the temperature the car should use (16–32 °C).'
        : 'Set the value the car should use (0–40).'}</p>
      <div class="val">
        <input type="number" id="valIn" min="${min}" max="${max}" step="1" value="${def}" inputmode="numeric">
        <div class="val-prev">
          <div class="vp-zh" id="vpZh">${esc(fill(cmd.zh, def))}</div>
          <div class="vp-py" id="vpPy">${esc(fill(cmd.py, def))}</div>
          <div class="vp-en" id="vpEn">🇬🇧 ${esc(fill(cmd.en, def))}</div>
        </div>
        <div class="val-row">
          <button class="btn sec" id="valCancel">Cancel</button>
          <button class="btn" id="valOk">Speak to car 🔊</button>
        </div>
      </div>
    `;
    $('#mask').classList.add('open');

    let done = false;
    const settle = (v) => { if (done) return; done = true; resolve(v); };
    const cleanup = () => {
      $('#mask').classList.remove('open');
    };
    const onKey = (e) => { if (e.key === 'Enter') confirmVal(); };
    const confirmVal = () => {
      const raw = $('#valIn')?.value;
      const num = parseFloat(raw);
      if (raw === '' || isNaN(num)) return;
      const v = Math.min(max, Math.max(min, Math.round(num * 10) / 10));
      settle(v); cleanup();
    };
    const cancel = () => { settle(null); cleanup(); };

    S._valAsk = { cmd, isTemp, confirmVal, cancel, onKey };
    setTimeout(() => { const inp = $('#valIn'); if (inp) inp.focus(); }, 40);
  });
}

/* ---------------------------------------------------------------
   VEHICLE TOGGLE DIALOG — "already open, do you want to close?"
   Resolves 'reverse' | 'keep' | 'dismiss'.
   --------------------------------------------------------------- */
function askVehicleToggle(cmd, st) {
  return new Promise((resolve) => {
    const inv = st.inv ? getCommand(st.inv) : null;
    $('#sheetBody').innerHTML = `
      <div class="sheet-h">
        <h3>${cmd.icon} Already ${esc(st.label)}</h3>
        <button class="icon-btn" id="sheetClose">✕</button>
      </div>
      <p class="hint">Your car is already <b>${esc(st.label)}</b> (${esc(cmd.en)}). What would you like to do?</p>
      <div class="sp"></div>
      ${inv ? `<button class="btn" id="vt-reverse">${inv.icon} ${esc(inv.en)}</button><div class="sp"></div>` : ''}
      <button class="btn sec" id="vt-keep">Keep it as it is</button>
    `;
    $('#mask').classList.add('open');
    S._vtAsk = { resolve };
  });
}

function openProfile() {
  const p = S.cfg.profile || {};
  const row = (j, i) => `
    <div class="jr">
      <input data-jfield="dest" data-ji="${i}" placeholder="Destination" value="${esc(j.dest||'')}">
      <input data-jfield="dist" data-ji="${i}" placeholder="Dist" value="${esc(j.dist||'')}">
      <input data-jfield="time" data-ji="${i}" placeholder="Min" value="${esc(j.time||'')}">
      <input data-jfield="pct"  data-ji="${i}" placeholder="%" value="${esc(j.pct||'')}">
      <button class="jdel" data-jdel="${i}" title="Remove">✕</button>
    </div>`;

  $('#sheetBody').innerHTML = `
    <div class="sheet-h">
      <h3>🚗 Car profile</h3>
      <span class="pro-badge">★ Pro</span>
      <button class="icon-btn" id="sheetClose">✕</button>
    </div>
    <p class="hint">Your own car details — shown on the My EV dashboard. Leave anything blank; blanks display as “—” until you fill them in.</p>
    <div class="pf">
      <label class="pf-label">Car name / model</label>
      <input id="pf-name" type="text" placeholder="e.g. BYD Atto 3 Extended" value="${esc(p.name||'')}">
      <label class="pf-label">License plate</label>
      <input id="pf-plate" type="text" placeholder="e.g. PP 1234" value="${esc(p.plate||'')}">
      <div class="pf-grid">
        <div><label class="pf-label">Battery charge %</label><input id="pf-battery" type="number" min="0" max="100" step="1" placeholder="84" value="${esc(p.battery||'')}"></div>
        <div><label class="pf-label">Battery (kWh)</label><input id="pf-batteryCapacity" type="number" min="0" step="0.1" placeholder="60" value="${esc(p.batteryCapacity||'')}"></div>
        <div><label class="pf-label">Range</label><input id="pf-range" type="number" min="0" step="1" placeholder="312" value="${esc(p.range||'')}"></div>
        <div><label class="pf-label">Range unit</label>
          <select id="pf-rangeUnit">
            <option value="mi" ${p.rangeUnit==='mi'?'selected':''}>miles (mi)</option>
            <option value="km" ${p.rangeUnit==='km'?'selected':''}>kilometres (km)</option>
          </select>
        </div>
        <div><label class="pf-label">Charging (kW)</label><input id="pf-chargingPower" type="number" min="0" step="0.1" placeholder="11" value="${esc(p.chargingPower||'')}"></div>
        <div><label class="pf-label">Climate temp °C</label><input id="pf-climate" type="number" step="0.5" placeholder="21" value="${esc(p.climate||'')}"></div>
        <div><label class="pf-label">Home / location</label><input id="pf-home" type="text" placeholder="e.g. Bayshore Drive" value="${esc(p.home||'')}"></div>
        <div><label class="pf-label">Now playing</label><input id="pf-media" type="text" placeholder="e.g. Starlight Muse" value="${esc(p.media||'')}"></div>
      </div>
      <label class="pf-label">Tire pressure (PSI)</label>
      <div class="pf-grid">
        <div><input id="pf-tireFL" type="number" min="20" max="60" step="0.5" placeholder="FL · 42" value="${esc(p.tireFL||'')}"></div>
        <div><input id="pf-tireFR" type="number" min="20" max="60" step="0.5" placeholder="FR · 42" value="${esc(p.tireFR||'')}"></div>
        <div><input id="pf-tireRL" type="number" min="20" max="60" step="0.5" placeholder="RL · 40" value="${esc(p.tireRL||'')}"></div>
        <div><input id="pf-tireRR" type="number" min="20" max="60" step="0.5" placeholder="RR · 40" value="${esc(p.tireRR||'')}"></div>
      </div>
      <label class="pf-label">Recent journeys</label>
      <div id="pf-journeys">${(p.journeys||[]).map(row).join('')}</div>
      <button class="btn sec" id="pf-addJourney">＋ Add journey</button>
    </div>
    <div class="sp"></div>
    <button class="btn" id="pf-done">Done</button>
  `;
  $('#mask').classList.add('open');
}

/* ---- persist car profile fields as they're typed ---- */
document.addEventListener('input', (e) => {
  const t = e.target;
  if (!t) return;
  const id = t.id;
  if (id && id.startsWith('pf-') && id !== 'pf-journeys') {
    const key = id.slice(3);
    const p = S.cfg.profile;
    p[key] = (t.type === 'number' || t.type === 'select-one') ? t.value : t.value.trim();
    saveState();
    return;
  }
  const jf = t.dataset && t.dataset.jfield;
  if (jf) {
    const p = S.cfg.profile;
    const j = (p.journeys || [])[+t.dataset.ji] || {};
    j[jf] = t.value.trim();
    p.journeys[+t.dataset.ji] = j;
    saveState();
  }
});

/* ---------------------------------------------------------------
   RENDER: SETTINGS view
   --------------------------------------------------------------- */
function renderSettings() {
  const zh = chineseVoices();
  const ready = offlineChineseReady();
  const all = allVoices();

  return `
    <div class="card">
      <div class="card-t"><span class="em">🌓</span> Appearance</div>
      <div class="row">
        <div class="rl">
          <div class="rt">Theme</div>
          <div class="rd">Auto follows your phone's light/dark setting</div>
        </div>
      </div>
      <div class="seg" style="margin-top:12px">
        <button data-theme-opt="auto"  class="${S.cfg.theme==='auto'?'sel':''}">Auto</button>
        <button data-theme-opt="light" class="${S.cfg.theme==='light'?'sel':''}">Light</button>
        <button data-theme-opt="dark"  class="${S.cfg.theme==='dark'?'sel':''}">Dark</button>
      </div>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">🔤</span> Text size</div>
      <p class="hint" style="margin-bottom:12px">Adjust the size of each language separately. Khmer pronunciation is shown larger than English by default.</p>
      ${[['zh','中文 · Chinese'],['en','English'],['km','ខ្មែរ · Khmer']].map(([k,label]) => `
        <div class="row">
          <div class="rl">
            <div class="rt">${label}</div>
            <div class="rd">${k==='km' ? 'Controls the Khmer translation AND its pronunciation guide' : k==='zh' ? 'Controls Chinese text and pinyin' : 'Controls English text'}</div>
          </div>
          <div class="seg mini" data-font-for="${k}">
            <button data-font-opt="${k}" data-v="small"  class="${S.cfg.font[k]==='small'?'sel':''}">A−</button>
            <button data-font-opt="${k}" data-v="default" class="${(S.cfg.font[k]||'default')==='default'?'sel':''}">A</button>
            <button data-font-opt="${k}" data-v="large"  class="${S.cfg.font[k]==='large'?'sel':''}">A+</button>
          </div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-t"><span class="em">⏱</span> Timing</div>
      <div class="row">
        <div class="rl">
          <div class="rt">Speak delay</div>
          <div class="rd">Pause before the Chinese command is spoken — lets the car's voice assistant wake up first.</div>
        </div>
      </div>
      <input type="range" id="speakDelay" min="0" max="5" step="0.5" value="${S.cfg.speakDelay ?? 0.3}">
      <div class="lbl-row"><span>0s</span><b id="speakDelayVal">${(S.cfg.speakDelay ?? 0.3).toFixed(1)}s</b><span>5s</span></div>
      <div class="row" style="margin-top:12px">
        <div class="rl">
          <div class="rt">Reply listen delay</div>
          <div class="rd">Wait this long after speaking before listening for the car's reply (conversation mode).</div>
        </div>
      </div>
      <input type="range" id="replyDelay" min="0" max="10" step="0.5" value="${S.cfg.replyDelay ?? 1}">
      <div class="lbl-row"><span>0s</span><b id="replyDelayVal">${(S.cfg.replyDelay ?? 1).toFixed(1)}s</b><span>10s</span></div>
    </div>

    ${myCarCard()}

    ${carProfileCard()}

    <div class="banner ${ready ? 'good' : ''}">
      <span class="bi">${ready ? '✅' : '⚠️'}</span>
      <div>
        <b>Chinese voice: ${ready ? 'ready & offline' : (zh.length ? 'found, may need internet' : 'not installed')}</b><br>
        ${ready
          ? `${zh.length} Chinese voice${zh.length===1?'':'s'} on this device. Commands are spoken offline.`
          : `No offline Chinese voice detected. Install one in your phone settings (Android: Settings → Language → Text-to-speech → install 中文; iOS: Settings → Accessibility → Spoken Content → Voices → Chinese), or record your own clips below.`}
      </div>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">🔊</span> Speaking to the car</div>

      <div class="row">
        <div class="rl">
          <div class="rt">Chinese voice</div>
          <div class="rd">Which installed voice speaks to your car</div>
        </div>
        <select id="voiceSel">
          <option value="">Auto (best Chinese)</option>
          ${zh.map(v => `<option value="${esc(v.voiceURI)}" ${S.cfg.voiceURI===v.voiceURI?'selected':''}>
            ${esc(v.name)}${v.localService===false?' (online)':''}</option>`).join('')}
          ${zh.length ? '' : all.slice(0,12).map(v => `<option value="${esc(v.voiceURI)}">${esc(v.name)} (${esc(v.lang)})</option>`).join('')}
        </select>
      </div>

      <div class="row">
        <div class="rl">
          <div class="rt">Speaking speed — <span id="rateVal">${S.cfg.rate.toFixed(2)}×</span></div>
          <div class="rd">Slower is easier for the car to recognise</div>
        </div>
      </div>
      <input type="range" id="rate" min="0.6" max="1.3" step="0.02" value="${S.cfg.rate}">

      <div class="row">
        <div class="rl">
          <div class="rt">Volume — <span id="volVal">${Math.round(S.cfg.volume*100)}%</span></div>
          <div class="rd">Turn up so the car's microphone hears clearly</div>
        </div>
      </div>
      <input type="range" id="vol" min="0.2" max="1" step="0.05" value="${S.cfg.volume}">

      <div class="row">
        <div class="rl">
          <div class="rt">Add wake word automatically</div>
          <div class="rd">Say "${esc(getBrand(S.brand).wake)}" before every command</div>
        </div>
        <button class="sw ${S.cfg.autoWake?'on':''}" data-cfg="autoWake"></button>
      </div>

      <div class="row">
        <div class="rl">
          <div class="rt">Use my recorded clips</div>
          <div class="rd">Prefer your own voice over the phone's TTS</div>
        </div>
        <button class="sw ${S.cfg.useRecordings?'on':''}" data-cfg="useRecordings"></button>
      </div>

      <div class="sp"></div>
      <button class="btn sec" id="testVoice">🔊 Test: say "${esc(getBrand(S.brand).wake)}，打开空调"</button>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">✨</span> Premium voices (online)</div>
      <div class="row">
        <div class="rl">
          <div class="rt">Use Fish Audio voice (free)</div>
          <div class="rd">Natural Chinese &amp; English from fish.audio's <b>free</b> model <b>s2.1-pro-free</b> — no credit card, no hard usage cap (fair use). Needs internet; falls back to the phone's own voice when offline.</div>
        </div>
        <button class="sw ${S.cfg.premiumVoice?'on':''}" data-cfg="premiumVoice"></button>
      </div>
      <div class="row">
        <div class="rl">
          <div class="rt">Choose a Fish Audio voice</div>
          <div class="rd">Tap a voice to use it — or paste your own ID below. Tap 🎧 next to a voice to preview it.</div>
        </div>
      </div>
      <div class="voices">
        ${FISH_VOICES.map((v, i) => `
          <button class="vsel ${S.cfg.voiceId === v.id ? 'sel' : ''}" data-voice-preset="${i}">
            <span class="vs-em">${v.emoji}</span>
            <span class="vs-n">${esc(v.label)}</span>
            <span class="vs-id">${v.id.slice(0, 8)}…</span>
            <span class="vs-play" data-voice-play="${i}" title="Preview">🎧</span>
          </button>`).join('')}
      </div>
      <input id="voiceIdIn" placeholder="Or paste any Fish Audio voice ID…" value="${esc(S.cfg.voiceId || '')}" autocomplete="off" spellcheck="false">
      <div class="sp"></div>
      <button class="btn sec" id="testPremium">🎧 Test selected voice</button>
      <p class="hint" id="premiumStatus" style="margin-top:8px">
        Needs a server credential: Vercel env <b>AI_GATEWAY_TOKEN</b> (vercel.com/ai-gateway/keys) — or a free <b>FISH_AUDIO_API_KEY</b> (fish.audio/app/api-keys), used automatically when the gateway is rate-limited. Then redeploy.
      </p>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">🎙</span> Record your own Chinese</div>
      <p class="hint">The most reliable option — works on any phone, always offline. Record yourself (or a Chinese-speaking friend) saying a command, and the app plays that exact clip to your car.</p>
      <div class="sp"></div>
      <div class="stat-grid">
        <div class="stat"><div class="sv">${S.recordedClips.size}</div><div class="sl">clips saved</div></div>
        <div class="stat"><div class="sv">${COMMANDS.length}</div><div class="sl">commands total</div></div>
      </div>
      <div class="sp"></div>
      <button class="btn" id="openRec">🎙 Record clips</button>
      ${S.recordedClips.size ? `<button class="btn dang" id="delClips">🗑 Delete all recordings</button>` : ''}
    </div>

    <div class="card">
      <div class="card-t"><span class="em">👂</span> Understanding the car</div>
      <div class="row">
        <div class="rl">
          <div class="rt">Read replies aloud to me</div>
          <div class="rd">Speak the car's answer in ${S.inputLang==='km'?'Khmer':'English'}</div>
        </div>
        <button class="sw ${S.cfg.speakBack?'on':''}" data-cfg="speakBack"></button>
      </div>
      <div class="row">
        <div class="rl">
          <div class="rt">Live notifications</div>
          <div class="rd">Alert me when a command is sent and when the car replies ${('Notification' in window && Notification.permission === 'granted') ? '' : '— tap a command to ask permission'}</div>
        </div>
        <button class="sw ${S.cfg.notifications?'on':''}" data-cfg="notifications"></button>
      </div>
      <div class="row">
        <div class="rl">
          <div class="rt">Show pinyin</div>
          <div class="rd">Romanised Chinese under each command</div>
        </div>
        <button class="sw ${S.cfg.showPinyin?'on':''}" data-cfg="showPinyin"></button>
      </div>
      <div class="row">
        <div class="rl">
          <div class="rt">Show Khmer pronunciation</div>
          <div class="rd">អានចិនជាអក្សរខ្មែរ — read Chinese in Khmer letters</div>
        </div>
        <button class="sw ${S.cfg.showKhmerRead?'on':''}" data-cfg="showKhmerRead"></button>
      </div>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">🎤</span> Voice input status</div>
      <p class="hint">
        <b>Speech recognition:</b> ${recognitionAvailable ? 'available on this browser' : 'not available on this browser'}<br><br>
        Reading your voice (English or Khmer) uses your phone's own speech engine. Many phones send audio
        to a server for this, so it may need internet. <b>The app itself works fully offline:</b> all ${COMMANDS.length}
        commands, translation, the transcript and your recordings. Voice output uses the <b>premium Fish Audio voice</b>
        when online, and falls back to the phone's built-in Chinese voice when offline.<br><br>
        If voice input fails, the <b>text box</b> and the <b>Commands tab</b> give you complete control with no internet at all.
      </p>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">ℹ️</span> About</div>
      <p class="hint">
        <b>EV Voice Control — Cambodia</b><br>
        ${COMMANDS.length} commands · ${CATEGORIES.length} categories · ${BRANDS.length} car brands<br>
        Chinese · Pinyin · English · ខ្មែរ<br><br>
        Built for Cambodian owners of Chinese EVs whose cars only accept Chinese voice commands.
        Install to your home screen to use it with no internet.
      </p>
      ${installPrompt ? `
      <div class="sp"></div>
      <button class="btn" id="installApp">📲 Install EV Voice app</button>` : ''}
    </div>
    <div class="sp"></div>
  `;
}

/* ---------------------------------------------------------------
   RECORDING SHEET
   --------------------------------------------------------------- */
let recorder = null;
let recTarget = null;

function openRecorder() {
  const list = byCategory(S.cat);
  $('#sheetBody').innerHTML = `
    <div class="sheet-h">
      <h3>🎙 Record your Chinese</h3>
      <button class="icon-btn" id="sheetClose">✕</button>
    </div>
    <p class="hint">Pick a command, tap record, and say the Chinese out loud. Your clip is saved on the phone and used instead of the robot voice.</p>
    <div class="sp"></div>
    <div class="cat-row">
      ${CATEGORIES.map(c => `<button class="cat-c ${S.cat===c.id?'sel':''}" data-reccat="${c.id}">
        <span>${c.icon}</span><span>${esc(c.en)}</span></button>`).join('')}
    </div>
    <div id="recList">
      ${list.map(c => `
        <div class="row">
          <div class="rl">
            <div class="rt" style="color:var(--zh);font-size:15px">${esc(c.zh)}</div>
            <div class="rd">${esc(c.py)}<br>${esc(c.en)}</div>
          </div>
          ${S.recordedClips.has(c.id)
            ? `<button class="icon-btn" data-play="${c.id}" title="Play">▶</button>
               <button class="icon-btn" data-delclip="${c.id}" title="Delete">🗑</button>`
            : `<button class="icon-btn" data-rec="${c.id}" title="Record">🎙</button>`}
        </div>`).join('')}
    </div>
  `;
  $('#mask').classList.add('open');
}

async function toggleRecord(id) {
  const btn = $(`[data-rec="${id}"]`);
  if (recTarget === id && recorder) {
    const blob = await recorder.stop();
    recorder = null; recTarget = null;
    if (blob && blob.size > 500) {
      await clipStore.save(id, blob);
      S.recordedClips.add(id);
      openRecorder();
    } else {
      if (btn) btn.textContent = '🎙';
      addLine({ kind:'sys', text:'Recording too short — try holding it longer.' });
    }
    return;
  }
  try {
    recorder = new ClipRecorder();
    await recorder.start();
    recTarget = id;
    if (btn) { btn.textContent = '⏹'; btn.style.background = '#dc2626'; }
  } catch (e) {
    recorder = null; recTarget = null;
    alert('Microphone access is needed to record. Please allow it in your browser settings.');
  }
}

/* ---------------------------------------------------------------
   ROUTER / RENDER
   --------------------------------------------------------------- */
function render() {
  const brand = getBrand(S.brand);
  $('#brandName').textContent = brand.name;
  $('#brandWake').textContent = `${brand.wake} · ${brand.assistant}`;
  const av = $('#brandAvatar');
  if (av) {
    const first = (brand.name.split(/[\s/]/)[0] || brand.name).slice(0, 2).toUpperCase();
    av.textContent = first || 'EV';
  }
  applyTheme();
  applyFontSizes();

  const host = $('#views');
  const isMaps = S.view === 'maps';
  if (isMaps) {
    // the map lives in #mapPage (outside #views) — clear the other page so
    // the two never mix
    host.innerHTML = '';
  } else {
    if (S.view === 'talk')      host.innerHTML = `<div class="view active">${renderTalk()}</div>`;
    if (S.view === 'myev')      host.innerHTML = `<div class="view active">${renderMyEv()}</div>`;
    if (S.view === 'commands')  host.innerHTML = `<div class="view active">${renderCommands()}</div>`;
    if (S.view === 'settings')  host.innerHTML = `<div class="view active">${renderSettings()}</div>`;
  }

  // EV Maps lives outside #views so Leaflet isn't rebuilt on every render
  const mapPage = $('#mapPage');
  if (mapPage) mapPage.hidden = !isMaps;
  if (isMaps) initMapsPage();

  $$('.nav-b').forEach(b => b.classList.toggle('sel', b.dataset.view === S.view));
  if (S.view === 'talk') { renderTranscript(); setMicState(); }

  // keep the selected category tab visible in its horizontal scroller
  const selCat = document.querySelector('.cat-row .cat-c.sel');
  if (selCat) {
    const row = selCat.parentElement;
    row.scrollLeft = Math.max(0, selCat.offsetLeft - row.clientWidth / 2 + selCat.offsetWidth / 2);
  }
}

function go(view) { if (view === 'cars') view = 'settings'; S.view = view; render(); window.scrollTo(0, 0); }

/* ---------------------------------------------------------------
   EV MAPS — lazy-load the map module (Leaflet via CDN) only when
   the user opens the Maps tab. Idempotent; the map keeps its state
   while the user switches tabs.
   --------------------------------------------------------------- */
let mapsReady = null;
function initMapsPage() {
  if (!mapsReady) {
    mapsReady = import('/static/js/maps.js')
      .then(m => m.initMaps())
      .catch((err) => {
        console.error('EV Maps failed to load:', err);
        const strip = $('#mapStrip');
        if (strip) strip.innerHTML = '<p class="hint center" style="padding:14px">⚠ Maps need an internet connection — check your connection and try again.</p>';
      });
  }
  return mapsReady;
}

/* ---------------------------------------------------------------
   EVENTS (single delegated handler)
   --------------------------------------------------------------- */
document.addEventListener('click', async (e) => {
  const t = e.target;
  const hit = (sel) => t.closest(sel);

  // nav
  const nav = hit('.nav-b');
  if (nav) return go(nav.dataset.view);

  // header dropdown menu: close when tapping anywhere outside it
  const menu = $('#menu');
  if (menu && !menu.hidden && !hit('#menuBtn') && !t.closest('.menu')) menu.hidden = true;
  if (hit('#menuBtn')) { if (menu) menu.hidden = !menu.hidden; return; }
  const menuItem = hit('[data-menu]');
  if (menuItem) {
    if (menu) menu.hidden = true;
    if (menuItem.dataset.menu === 'theme') {
      const order = ['auto', 'light', 'dark'];
      const i = order.indexOf(S.cfg.theme || 'auto');
      S.cfg.theme = order[(i + 1) % order.length];
      saveState(); applyTheme(); render();
    } else {
      go(menuItem.dataset.menu);
    }
    return;
  }
  const themeOpt = hit('[data-theme-opt]');
  if (themeOpt) {
    S.cfg.theme = themeOpt.dataset.themeOpt;
    saveState(); applyTheme(); render();
    return;
  }
  const fontOpt = hit('[data-font-opt]');
  if (fontOpt) {
    const k = fontOpt.dataset.fontOpt, v = fontOpt.dataset.v;
    if (!S.cfg.font) S.cfg.font = {};
    S.cfg.font[k] = v;
    saveState(); applyFontSizes();
    $$(`[data-font-for="${k}"] [data-font-opt]`).forEach(b => b.classList.toggle('sel', b.dataset.v === v));
    return;
  }
  const evcmd = hit('[data-evcmd]');
  if (evcmd) { runCommand(getCommand(evcmd.dataset.evcmd), null, { via: 'dashboard' }); return; }
  const vchip = hit('[data-vinv]');
  if (vchip && vchip.dataset.vinv) {
    const c = getCommand(vchip.dataset.vinv);
    if (c) return runCommand(c, null, { via: 'status' });
    return;
  }
  const goto = hit('[data-goto]');
  if (goto) { e.preventDefault(); go(goto.dataset.goto); return; }

  // mic
  if (hit('#mic')) return toggleMic();

  // language toggle
  const lb = hit('[data-lang]');
  if (lb) { S.inputLang = lb.dataset.lang; saveState(); render(); return; }

  // send typed text
  if (hit('#sendIn')) {
    const inp = $('#textIn');
    const v = inp.value; inp.value = '';
    const sg = $('#suggestions'); if (sg) sg.style.display = 'none';
    return handleUtterance(v, 'typed');
  }

  // quick chip / suggestion
  const qk = hit('[data-quick]');
  if (qk) return runCommand(getCommand(qk.dataset.quick), null, { via:'button' });
  const sug = hit('[data-sug]');
  if (sug) {
    const sg = $('#suggestions'); if (sg) sg.style.display = 'none';
    return runCommand(getCommand(sug.dataset.sug), null, { via:'suggestion' });
  }

  // conversation mode
  if (hit('#convoToggle')) {
    S.convo = !S.convo; saveState(); render();
    addLine({ kind:'sys', text: S.convo
      ? `Conversation mode ON — wake word "${getBrand(S.brand).wake}" is skipped and the app auto-listens for the car's reply after each command. Say the wake word once yourself to start.`
      : 'Conversation mode OFF — the wake word is added before every command again, and the app no longer auto-listens for the car\u2019s reply.' });
    return;
  }
  if (hit('#clearTr')) return clearTranscript();

  // command card
  const cc = hit('.cmd');
  if (cc) return runCommand(getCommand(cc.dataset.id), null, { via:'button' });

  // category — tapping the active tab again clears the filter and shows All
  const cat = hit('[data-cat]');
  if (cat) { S.cat = (S.cat === cat.dataset.cat) ? 'all' : cat.dataset.cat; render(); return; }

  // search clear
  if (hit('#clearSearch')) { $('#cmdSearch').value = ''; render(); return; }

  // brand
  const br = hit('[data-brand]');
  if (br) {
    S.brand = br.dataset.brand;
    // keep the selected commands-category valid for the new brand's category set
    const validCats = catsForBrand(S.brand);
    if (S.cat !== 'all' && !validCats.some(c => c.id === S.cat)) S.cat = validCats[0].id;
    saveState(); render(); return;
  }
  if (hit('#goBrand')) return go('settings');
  if (hit('#testWake')) {
    const b = getBrand(S.brand);
    return speakChinese(b.wake, { rate:S.cfg.rate, volume:S.cfg.volume, voiceURI:S.cfg.voiceURI, premium:S.cfg.premiumVoice, voiceId:S.cfg.voiceId });
  }

  // settings toggles
  const sw = hit('[data-cfg]');
  if (sw) {
    const k = sw.dataset.cfg;
    S.cfg[k] = !S.cfg[k]; saveState(); render(); return;
  }
  if (hit('#testVoice')) {
    const b = getBrand(S.brand);
    const r = await speakChinese(`${b.wake}，打开空调`, { rate:S.cfg.rate, volume:S.cfg.volume, voiceURI:S.cfg.voiceURI, premium:S.cfg.premiumVoice, voiceId:S.cfg.voiceId });
    if (r.method === 'none') alert('No Chinese voice available on this device.\n\nInstall a Chinese TTS voice in your phone settings, or record your own clips instead.');
    return;
  }

  // install the PWA from the About card
  if (hit('#installApp')) {
    if (installPrompt) { try { installPrompt.prompt(); } catch {} }
    return;
  }

  // preview a built-in Fish Audio voice (without switching to it)
  const vPlay = hit('[data-voice-play]');
  if (vPlay) {
    const v = FISH_VOICES[+vPlay.dataset.voicePlay];
    if (v) {
      const st = $('#premiumStatus');
      if (st) { st.textContent = `Previewing ${v.label}…`; st.style.color = ''; }
      try {
        await testPremiumVoice(`${getBrand(S.brand).wake}，打开空调`, v.id);
        if (st) { st.textContent = `✓ ${v.label} works!`; st.style.color = 'var(--ok)'; }
      } catch (err) {
        if (st) { st.textContent = `✗ ${(err && err.message) || 'failed'}`; st.style.color = 'var(--err)'; }
      }
    }
    return;
  }

  // choose a built-in Fish Audio voice
  const vPreset = hit('[data-voice-preset]');
  if (vPreset) {
    const v = FISH_VOICES[+vPreset.dataset.voicePreset];
    if (v) { S.cfg.voiceId = v.id; saveState(); render(); }
    return;
  }

  // verify the premium voice end-to-end
  if (hit('#testPremium')) {
    const btn = $('#testPremium');
    const st = $('#premiumStatus');
    const b = getBrand(S.brand);
    btn.textContent = '⏳ Generating…';
    if (st) { st.textContent = 'Contacting the server…'; st.style.color = ''; }
    try {
      await testPremiumVoice(`${b.wake}，打开空调`, S.cfg.voiceId);
      if (st) { st.textContent = '✓ Premium voice works!'; st.style.color = 'var(--ok)'; }
    } catch (err) {
      const why = err && err.message ? err.message : 'unknown error';
      if (st) {
        st.textContent = `✗ ${why} — check the AI_GATEWAY_TOKEN env var on Vercel and redeploy.`;
        st.style.color = 'var(--err)';
      }
    }
    btn.textContent = '🎧 Test premium voice';
    return;
  }

  // car profile sheet
  if (hit('#editProfile')) return openProfile();
  if (hit('#pf-addJourney')) {
    const p = S.cfg.profile;
    if (!Array.isArray(p.journeys)) p.journeys = [];
    p.journeys.push({ dest:'', dist:'', time:'', pct:'' });
    saveState(); openProfile(); return;
  }
  if (hit('#pf-done')) {
    $('#mask').classList.remove('open'); render(); return;
  }
  const jdel = hit('[data-jdel]');
  if (jdel) {
    const p = S.cfg.profile;
    if (Array.isArray(p.journeys)) p.journeys.splice(+jdel.dataset.jdel, 1);
    saveState(); openProfile(); return;
  }

  // value dialog (slot commands: temperature / volume / level)
  if (S._valAsk) {
    if (hit('#valOk'))     { const a = S._valAsk; S._valAsk = null; a.confirmVal(); return; }
    if (hit('#valCancel')) { const a = S._valAsk; S._valAsk = null; a.cancel(); return; }
  }

  // vehicle toggle dialog ("already open — close it?")
  if (S._vtAsk) {
    if (hit('#vt-reverse')) { const a = S._vtAsk; S._vtAsk = null; $('#mask').classList.remove('open'); a.resolve('reverse'); return; }
    if (hit('#vt-keep'))    { const a = S._vtAsk; S._vtAsk = null; $('#mask').classList.remove('open'); a.resolve('keep'); return; }
  }

  // recorder sheet
  if (hit('#openRec')) return openRecorder();
  if (hit('#sheetClose') || t.id === 'mask') {
    if (S._valAsk) { const a = S._valAsk; S._valAsk = null; a.cancel(); return; }
    if (S._vtAsk)  { const a = S._vtAsk;  S._vtAsk  = null; $('#mask').classList.remove('open'); a.resolve('dismiss'); return; }
    if (recorder) recorder.cancel();
    recorder = null; recTarget = null;
    $('#mask').classList.remove('open'); return;
  }
  const rcat = hit('[data-reccat]');
  if (rcat) { S.cat = rcat.dataset.reccat; openRecorder(); return; }
  const rec = hit('[data-rec]');
  if (rec) return toggleRecord(rec.dataset.rec);
  const play = hit('[data-play]');
  if (play) {
    const blob = await clipStore.get(play.dataset.play);
    if (blob) { const a = new Audio(URL.createObjectURL(blob)); a.play(); }
    return;
  }
  const dc = hit('[data-delclip]');
  if (dc) {
    await clipStore.del(dc.dataset.delclip);
    S.recordedClips.delete(dc.dataset.delclip);
    openRecorder(); return;
  }
  if (hit('#delClips')) {
    if (confirm(`Delete all ${S.recordedClips.size} recordings?`)) {
      for (const id of Array.from(S.recordedClips)) await clipStore.del(id);
      S.recordedClips.clear(); render();
    }
    return;
  }

  // banner dismiss
  const bx = hit('.banner-x');
  if (bx) { bx.closest('.banner').remove(); return; }
});

/* keyboard: Enter to send, live search, value dialog confirm */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'textIn') {
    const v = e.target.value; e.target.value = '';
    const sg = $('#suggestions'); if (sg) sg.style.display = 'none';
    handleUtterance(v, 'typed');
  }
  if (e.key === 'Enter' && e.target.id === 'valIn' && S._valAsk) {
    const a = S._valAsk; S._valAsk = null; a.confirmVal();
  }
});

let searchTimer = null;
document.addEventListener('input', (e) => {
  if (e.target.id === 'cmdSearch') {
    clearTimeout(searchTimer);
    const val = e.target.value;
    searchTimer = setTimeout(() => {
      const pos = e.target.selectionStart;
      render();
      const inp = $('#cmdSearch');
      if (inp) { inp.focus(); try { inp.setSelectionRange(pos, pos); } catch {} }
    }, 220);
  }
  if (e.target.id === 'rate')  { S.cfg.rate = parseFloat(e.target.value); saveState();
    const lbl = document.getElementById('rateVal');
    if (lbl) lbl.textContent = S.cfg.rate.toFixed(2) + '×'; }
  if (e.target.id === 'vol')   { S.cfg.volume = parseFloat(e.target.value); saveState();
    const lbl = document.getElementById('volVal');
    if (lbl) lbl.textContent = Math.round(S.cfg.volume * 100) + '%'; }
  if (e.target.id === 'speakDelay') { S.cfg.speakDelay = parseFloat(e.target.value); saveState();
    const lbl = document.getElementById('speakDelayVal');
    if (lbl) lbl.textContent = S.cfg.speakDelay.toFixed(1) + 's'; }
  if (e.target.id === 'replyDelay') { S.cfg.replyDelay = parseFloat(e.target.value); saveState();
    const lbl = document.getElementById('replyDelayVal');
    if (lbl) lbl.textContent = S.cfg.replyDelay.toFixed(1) + 's'; }
  if (e.target.id === 'voiceIdIn') {
    const v = e.target.value.trim();
    S.cfg.voiceId = v || null;
    saveState();
  }
  if (e.target.id === 'valIn' && S._valAsk) {
    const a = S._valAsk;
    const raw = e.target.value;
    const v = raw === '' ? null : parseFloat(raw);
    const lo = a.isTemp ? 16 : 0, hi = a.isTemp ? 32 : 40;
    const used = v == null ? (a.isTemp ? 24 : 5) : Math.min(hi, Math.max(lo, v));
    const zh = $('#vpZh'), py = $('#vpPy'), en = $('#vpEn');
    if (zh) zh.textContent = fill(a.cmd.zh, used);
    if (py) py.textContent = fill(a.cmd.py, used);
    if (en) en.textContent = '🇬🇧 ' + fill(a.cmd.en, used);
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'voiceSel') { S.cfg.voiceURI = e.target.value || null; saveState(); }
  if (e.target.id === 'rate' || e.target.id === 'vol') render();
});

/* ---------------------------------------------------------------
   BOOT
   --------------------------------------------------------------- */
/* online/offline pill — reflects reality immediately, then on every change */
function setNet() {
  const p = $('#netPill');
  if (!p) return;
  const on = navigator.onLine;
  p.className = 'pill ' + (on ? 'on' : 'off');
  p.innerHTML = `<span class="dot"></span>${on ? 'Connected' : 'Offline'}`;
  p.title = on
    ? 'Internet available — the app works with or without it'
    : 'No internet — the app still works completely';
}
setNet();
window.addEventListener('online', setNet);
window.addEventListener('offline', setNet);

async function boot() {
  loadState();
  render();
  setNet();

  await loadVoices();
  try { (await clipStore.list()).forEach(id => S.recordedClips.add(id)); } catch {}
  render();

  // first-run guidance
  const b = getBrand(S.brand);
  addLine({ kind:'sys', text:`Ready for your ${b.name}. Wake word: ${b.wake} (${b.wakePy}). Tap the mic, type a command, or browse the Commands tab — all ${COMMANDS.length} commands work offline.` });
  if (!offlineChineseReady()) {
    addLine({ kind:'sys', text:'⚠ No offline Chinese voice found on this phone. Open Settings → install a Chinese TTS voice, or record your own clips for guaranteed offline use.' });
  }

  // service worker: offline cache + auto PWA updates
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      // Auto PWA updates — silently reload once a newer service worker activates.
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      }
      // Ask the browser to look for a newer worker on every launch.
      try { reg.update(); } catch {}
    } catch {}
  }

}

boot();
