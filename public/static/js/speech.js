/* =====================================================================
   SPEECH ENGINE  (offline-first)

   OUTPUT (to the car) — this is the critical path, must work offline:
     A. A clip the owner recorded themselves, stored in IndexedDB  → always offline
     B. Device speechSynthesis with a zh-CN voice → offline on Android/iOS
        (system voices are installed locally; no network needed)

   INPUT (from the owner):
     Web Speech Recognition where available. Chrome/Android streams to a
     server for most languages, so we NEVER depend on it: typed text +
     the button deck give full offline control. We surface the real state
     to the user instead of hiding it.
   ===================================================================== */

/* ---------------------------------------------------------------
   IndexedDB — recorded voice clips + settings
   --------------------------------------------------------------- */
const DB_NAME = 'evvoice';
const DB_VER = 1;
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const rq = indexedDB.open(DB_NAME, DB_VER);
    rq.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('clips')) db.createObjectStore('clips');
      if (!db.objectStoreNames.contains('meta'))  db.createObjectStore('meta');
    };
    rq.onsuccess = () => { _db = rq.result; resolve(_db); };
    rq.onerror = () => reject(rq.error);
  });
}

async function idbPut(store, key, val) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(val, key);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}
async function idbGet(store, key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readonly');
    const r = tx.objectStore(store).get(key);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function idbDel(store, key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}
async function idbKeys(store) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readonly');
    const r = tx.objectStore(store).getAllKeys();
    r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error);
  });
}

export const clipStore = {
  save: (id, blob) => idbPut('clips', id, blob),
  get:  (id) => idbGet('clips', id),
  del:  (id) => idbDel('clips', id),
  list: () => idbKeys('clips')
};

/* ---------------------------------------------------------------
   Voice inventory
   --------------------------------------------------------------- */
let _voices = [];
export function loadVoices() {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve([]);
    const grab = () => {
      const v = speechSynthesis.getVoices();
      if (v && v.length) { _voices = v; resolve(v); return true; }
      return false;
    };
    if (grab()) return;
    let tries = 0;
    const iv = setInterval(() => {
      if (grab() || ++tries > 20) { clearInterval(iv); resolve(_voices); }
    }, 150);
    speechSynthesis.onvoiceschanged = grab;
  });
}

export function chineseVoices() {
  return _voices.filter(v => /^zh(-|_)?/i.test(v.lang) || /chinese|mandarin|中文|普通话/i.test(v.name));
}
export function allVoices() { return _voices; }

/** Is a local (offline-capable) Chinese voice present? */
export function offlineChineseReady() {
  return chineseVoices().some(v => v.localService !== false);
}

/* ---------------------------------------------------------------
   SPEAK — the command to the car
   --------------------------------------------------------------- */
let _current = null;
let _premiumAudio = null;

export function stopSpeaking() {
  try { speechSynthesis.cancel(); } catch {}
  if (_current && _current.audio) { try { _current.audio.pause(); } catch {} }
  if (_premiumAudio) { try { _premiumAudio.pause(); } catch {} _premiumAudio = null; }
  _current = null;
}

/* ---------------------------------------------------------------
   PREMIUM — fish-audio/s2.1-pro-free via the Vercel AI Gateway
   Returns the server-generated audio and plays it. Throws with a
   useful message when the gateway is unavailable so callers can
   fall back to device TTS.
   --------------------------------------------------------------- */
async function premiumSpeak(text, { lang = 'auto', voiceId = null, timeoutMs = 12000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: lang, voice: voiceId || null }),
      signal: ctrl.signal
    });
  } catch (e) {
    clearTimeout(timer);
    throw new Error('offline or network error');
  }
  clearTimeout(timer);
  if (!res.ok) {
    let msg = 'server error ' + res.status;
    try {
      const j = await res.json();
      if (j && typeof j.detail === 'string') msg = j.detail;
      else if (j && typeof j.error === 'string') msg = j.error;
    } catch {}
    throw new Error(msg);
  }

  const buf = await res.arrayBuffer();
  const url = URL.createObjectURL(new Blob([buf], { type: res.headers.get('Content-Type') || 'audio/mpeg' }));
  const audio = new Audio(url);
  _premiumAudio = audio;
  await audio.play();
  return new Promise((resolve, reject) => {
    // Safety net: some browsers never fire "ended" (autoplay policy, paused
    // media, background tab). Settle once playback should have finished.
    let done = false;
    const finish = (err) => {
      if (done) return; done = true;
      clearTimeout(t);
      URL.revokeObjectURL(url);
      err ? reject(err) : resolve();
    };
    const dur = audio.duration;
    const t = setTimeout(() => finish(), (Number.isFinite(dur) && dur > 0) ? Math.min(dur * 1000 + 2000, 60000) : 15000);
    audio.onended = () => finish();
    audio.onerror = () => finish(new Error('audio play failed'));
  });
}

/** Verify the premium voice end-to-end (Settings test button). Throws on failure. */
export async function testPremiumVoice(text, voiceId = null) {
  if (typeof navigator === 'undefined' || !navigator.onLine) throw new Error('no internet connection');
  await premiumSpeak(text, { lang: 'zh', voiceId });
}

/**
 * Speak Chinese text to the car.
 * Order: recorded clip → premium Fish Audio (if enabled + online) → device TTS.
 * @returns {Promise<{method:'clip'|'premium'|'tts'|'none', detail:string}>}
 */
export async function speakChinese(text, cfg = {}) {
  const { clipId = null, rate = 0.92, volume = 1, pitch = 1, voiceURI = null, premium = true, voiceId = null } = cfg;
  let premiumNote = null;

  // ---- A. owner-recorded clip wins (guaranteed offline) ----
  if (clipId) {
    try {
      const blob = await clipStore.get(clipId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.volume = volume;
        _current = { audio };
        await audio.play();
        return new Promise((resolve) => {
          let done = false;
          const finish = (err) => {
            if (done) return; done = true;
            clearTimeout(t);
            URL.revokeObjectURL(url);
            resolve({ method:'clip', detail: err ? 'Recording failed' : 'Your recording' });
          };
          const t = setTimeout(() => finish(), 15000);
          audio.onended = () => finish();
          audio.onerror = () => finish(true);
        });
      }
    } catch (e) { /* fall through to TTS */ }
  }

  // ---- B. premium Fish Audio voice (online, when enabled) ----
  if (premium && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await premiumSpeak(text, { lang: 'zh', voiceId });
      return { method: 'premium', detail: 'Fish Audio voice', premiumNote: null };
    } catch (e) {
      premiumNote = e && e.message ? e.message : 'premium voice failed';
    }
  } else if (premium) {
    premiumNote = 'Premium voice needs internet — using the phone voice.';
  }

  // ---- C. device Chinese TTS ----
  if (!('speechSynthesis' in window)) return { method:'none', detail:'No speech engine on this device', premiumNote };
  if (!_voices.length) await loadVoices();

  const zh = chineseVoices();
  let voice = null;
  if (voiceURI) voice = _voices.find(v => v.voiceURI === voiceURI) || null;
  if (!voice) voice = zh.find(v => v.localService !== false && /zh[-_]?CN|Chinese \(China|普通话/i.test(v.lang + v.name))
                   || zh.find(v => v.localService !== false)
                   || zh[0] || null;

  return new Promise((resolve) => {
    try { speechSynthesis.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    if (voice) u.voice = voice;
    u.rate = rate; u.volume = volume; u.pitch = pitch;
    let done = false;
    const finish = (method, detail) => { if (!done) { done = true; resolve({ method, detail, premiumNote }); } };
    u.onend   = () => finish(voice ? 'tts' : 'none', voice ? voice.name : 'No Chinese voice installed');
    u.onerror = () => finish('none', 'Speech engine error');
    speechSynthesis.speak(u);
    // safety net: some engines never fire onend
    setTimeout(() => finish(voice ? 'tts' : 'none', voice ? voice.name : 'No Chinese voice installed'),
               Math.max(3000, text.length * 400));
  });
}

/** Speak a translated line back to the owner (EN or KM). Uses the premium
 *  Fish Audio voice when enabled + online, otherwise the device TTS. */
export async function speakOwner(text, lang = 'en', opts = {}) {
  const { premium = false, voiceId = null } = opts;
  if (premium && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await premiumSpeak(text, { lang: lang === 'km' ? 'auto' : 'en', voiceId });
      return;
    } catch { /* fall through to the device TTS */ }
  }
  if (!('speechSynthesis' in window)) return;
  const want = lang === 'km' ? 'km' : 'en';
  const v = _voices.find(x => x.lang && x.lang.toLowerCase().startsWith(want))
         || _voices.find(x => x.lang && x.lang.toLowerCase().startsWith('en'));
  const u = new SpeechSynthesisUtterance(text);
  u.lang = v ? v.lang : (want === 'km' ? 'km-KH' : 'en-US');
  if (v) u.voice = v;
  u.rate = 0.95;
  speechSynthesis.speak(u);
}

/* ---------------------------------------------------------------
   RECORDER — owner records their own Chinese pronunciation
   --------------------------------------------------------------- */
export class ClipRecorder {
  constructor() { this.rec = null; this.chunks = []; this.stream = null; }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const types = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'];
    const mime = types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
    this.chunks = [];
    this.rec = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined);
    this.rec.ondataavailable = (e) => { if (e.data && e.data.size) this.chunks.push(e.data); };
    this.rec.start();
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.rec) return resolve(null);
      this.rec.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.rec.mimeType || 'audio/webm' });
        this.stream.getTracks().forEach(t => t.stop());
        this.rec = null;
        resolve(blob);
      };
      this.rec.stop();
    });
  }

  cancel() {
    try { this.rec && this.rec.stop(); } catch {}
    try { this.stream && this.stream.getTracks().forEach(t => t.stop()); } catch {}
    this.rec = null;
  }
}

/* ---------------------------------------------------------------
   LISTEN — speech recognition wrapper (best effort)
   --------------------------------------------------------------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const recognitionAvailable = !!SR;

export class Listener {
  constructor({ lang = 'en-US', onPartial, onFinal, onError, onEnd } = {}) {
    this.lang = lang;
    this.onPartial = onPartial; this.onFinal = onFinal;
    this.onError = onError; this.onEnd = onEnd;
    this.r = null; this.active = false;
  }

  start() {
    if (!SR) { this.onError && this.onError('unsupported'); return false; }
    try {
      const r = new SR();
      this.r = r;
      r.lang = this.lang;
      r.continuous = false;
      r.interimResults = true;
      r.maxAlternatives = 3;

      r.onresult = (e) => {
        let interim = '', final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) final += res[0].transcript;
          else interim += res[0].transcript;
        }
        if (interim && this.onPartial) this.onPartial(interim);
        if (final && this.onFinal) {
          const alts = [];
          const last = e.results[e.results.length - 1];
          for (let i = 0; i < last.length; i++) alts.push(last[i].transcript);
          this.onFinal(final.trim(), alts);
        }
      };
      r.onerror = (e) => { this.active = false; this.onError && this.onError(e.error || 'error'); };
      r.onend   = () => { this.active = false; this.onEnd && this.onEnd(); };
      r.start();
      this.active = true;
      return true;
    } catch (e) {
      this.onError && this.onError('start-failed');
      return false;
    }
  }

  stop() { try { this.r && this.r.stop(); } catch {} this.active = false; }
  abort() { try { this.r && this.r.abort(); } catch {} this.active = false; }
}

/* ---------------------------------------------------------------
   Settings persistence (localStorage — sync + offline)
   --------------------------------------------------------------- */
const SKEY = 'evvoice.settings';
export const settings = {
  load() {
    try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch { return {}; }
  },
  save(obj) {
    try { localStorage.setItem(SKEY, JSON.stringify(obj)); } catch {}
  }
};
