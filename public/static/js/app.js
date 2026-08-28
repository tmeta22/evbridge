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
import { matchIntent, fill, searchCommands, isKhmer, matchReply } from './nlu.js';
import {
  loadVoices, chineseVoices, allVoices, offlineChineseReady,
  speakChinese, speakOwner, stopSpeaking,
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
    useRecordings: true
  }
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

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

  // speak it
  S.speaking = true;
  setMicState();
  const clipId = (S.cfg.useRecordings && S.recordedClips.has(cmd.id)) ? cmd.id : null;
  const res = await speakChinese(zhFull, {
    clipId,
    rate: S.cfg.rate,
    volume: S.cfg.volume,
    voiceURI: S.cfg.voiceURI
  });
  S.speaking = false;
  setMicState();

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
      settle({
        waiting: false,
        zh: chosen,
        en: rep ? fill(rep.en, value) : null,
        km: rep ? fill(rep.km, value) : null,
        note: rep ? null : "The car said the Chinese above — no translation available for this exact reply."
      });
      if (S.cfg.speakBack && rep) {
        const line = S.inputLang === 'km' ? fill(rep.km, value) : fill(rep.en, value);
        if (line) speakOwner(line, S.inputLang);
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
   RENDER: COMMANDS view
   --------------------------------------------------------------- */
function cmdCard(c) {
  const hasClip = S.recordedClips.has(c.id);
  const catColor = (CAT_MAP[c.cat] && CAT_MAP[c.cat].color) || '#22d3ee';
  return `
    <button class="cmd" data-id="${c.id}">
      <div class="cmd-ic" style="background:${catColor}22;border-color:${catColor}55">${c.icon}</div>
      <div class="cmd-b">
        <div class="cmd-zh">${esc(c.zh)}</div>
        ${S.cfg.showPinyin ? `<div class="cmd-py">${esc(c.py)}</div>` : ''}
        <div class="cmd-en">${esc(c.en)}</div>
        <div class="cmd-km">${esc(c.km)}</div>
        ${S.cfg.showKhmerRead ? `<div class="cmd-kmr">🗣 ${esc(c.kmr)}</div>` : ''}
        ${hasClip ? `<div class="rec-tag">🎙 your recording</div>` : ''}
      </div>
      <div class="cmd-go">▶</div>
    </button>`;
}

function renderCommands() {
  const q = $('#cmdSearch') ? $('#cmdSearch').value : '';
  const cats = catsForBrand(S.brand);
  const list = q.trim() ? searchCommands(q) : byCategory(S.cat);

  return `
    <div class="search-box">
      <span class="si">🔍</span>
      <input id="cmdSearch" placeholder="Search English / ខ្មែរ / 中文 / pinyin…"
             value="${esc(q)}" autocomplete="off" spellcheck="false">
      <button class="sx ${q?'show':''}" id="clearSearch">✕</button>
    </div>

    ${q.trim() ? '' : `
    <div class="cat-row">
      ${cats.map(c => `
        <button class="cat-c ${S.cat===c.id?'sel':''}" data-cat="${c.id}" style="--catc:${c.color}">
          <span>${c.icon}</span><span>${esc(c.en)}</span>
          <span class="cnt">${byCategory(c.id).length}</span>
        </button>`).join('')}
    </div>`}

    ${q.trim() ? `<p class="hint" style="margin-bottom:10px">${list.length} result${list.length===1?'':'s'} for "${esc(q)}"</p>` : `
      <p class="hint km" style="margin-bottom:10px">${esc(CAT_MAP[S.cat].km)} · ${esc(CAT_MAP[S.cat].zh)}</p>`}

    <div class="cmd-grid">
      ${list.length ? list.map(cmdCard).join('')
        : `<div class="tr-empty"><div class="ee">🔍</div><p>Nothing found. Try another word.</p></div>`}
    </div>
    <div class="sp"></div>
  `;
}

/* ---------------------------------------------------------------
   RENDER: CARS view
   --------------------------------------------------------------- */
function renderCars() {
  const popular = BRANDS.filter(b => b.popular);
  const rest = BRANDS.filter(b => !b.popular);
  const card = (b) => `
    <button class="brand-c ${S.brand===b.id?'sel':''}" data-brand="${b.id}">
      <div class="bstripe" style="background:${b.color}"></div>
      ${b.popular ? '<span class="star">★</span>' : ''}
      <div class="bn">${esc(b.name)}</div>
      <div class="bz">${esc(b.wake)}</div>
      <div class="bw">${esc(b.assistant)}</div>
    </button>`;

  const b = getBrand(S.brand);
  return `
    <div class="card">
      <div class="card-t"><span class="em">🚗</span> Your car</div>
      <div class="big-zh">
        <div class="bz-zh">${esc(b.wake)}</div>
        <div class="bz-py">${esc(b.wakePy)}</div>
        <div class="bz-kmr">🇰🇭 ${esc(b.wakeKm)}</div>
      </div>
      <p class="hint"><b>${esc(b.name)}</b> · ${esc(b.assistant)}<br>${esc(b.models)}</p>
      <div class="sp"></div>
      <button class="btn" id="testWake">🔊 Test the wake word</button>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">★</span> Common in Cambodia</div>
      <div class="brand-grid">${popular.map(card).join('')}</div>
    </div>

    <div class="card">
      <div class="card-t"><span class="em">➕</span> Other Chinese brands</div>
      <div class="brand-grid">${rest.map(card).join('')}</div>
    </div>
    <div class="sp"></div>
  `;
}

/* ---------------------------------------------------------------
   RENDER: SETTINGS view
   --------------------------------------------------------------- */
function renderSettings() {
  const zh = chineseVoices();
  const ready = offlineChineseReady();
  const all = allVoices();

  return `
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
        to a server for this, so it may need internet. <b>Everything else in this app is fully offline:</b>
        all ${COMMANDS.length} commands, Chinese speech-out, your recordings, translation and the transcript.<br><br>
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

  const host = $('#views');
  if (S.view === 'talk')      host.innerHTML = `<div class="view active">${renderTalk()}</div>`;
  if (S.view === 'commands')  host.innerHTML = `<div class="view active">${renderCommands()}</div>`;
  if (S.view === 'cars')      host.innerHTML = `<div class="view active">${renderCars()}</div>`;
  if (S.view === 'settings')  host.innerHTML = `<div class="view active">${renderSettings()}</div>`;

  $$('.nav-b').forEach(b => b.classList.toggle('sel', b.dataset.view === S.view));
  if (S.view === 'talk') { renderTranscript(); setMicState(); }

  // keep the selected category tab visible in its horizontal scroller
  const selCat = document.querySelector('.cat-row .cat-c.sel');
  if (selCat) {
    const row = selCat.parentElement;
    row.scrollLeft = Math.max(0, selCat.offsetLeft - row.clientWidth / 2 + selCat.offsetWidth / 2);
  }
}

function go(view) { S.view = view; render(); window.scrollTo(0, 0); }

/* ---------------------------------------------------------------
   EVENTS (single delegated handler)
   --------------------------------------------------------------- */
document.addEventListener('click', async (e) => {
  const t = e.target;
  const hit = (sel) => t.closest(sel);

  // nav
  const nav = hit('.nav-b');
  if (nav) return go(nav.dataset.view);

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
      ? `Conversation mode ON — wake word "${getBrand(S.brand).wake}" is now skipped, so you can talk back and forth naturally. Say the wake word once yourself to start.`
      : 'Conversation mode OFF — the wake word is added before every command again.' });
    return;
  }
  if (hit('#clearTr')) return clearTranscript();

  // command card
  const cc = hit('.cmd');
  if (cc) return runCommand(getCommand(cc.dataset.id), null, { via:'button' });

  // category
  const cat = hit('[data-cat]');
  if (cat) { S.cat = cat.dataset.cat; render(); return; }

  // search clear
  if (hit('#clearSearch')) { $('#cmdSearch').value = ''; render(); return; }

  // brand
  const br = hit('[data-brand]');
  if (br) {
    S.brand = br.dataset.brand;
    // keep the selected commands-category valid for the new brand's category set
    const validCats = catsForBrand(S.brand);
    if (!validCats.some(c => c.id === S.cat)) S.cat = validCats[0].id;
    saveState(); render(); return;
  }
  if (hit('#goBrand')) return go('cars');
  if (hit('#testWake')) {
    const b = getBrand(S.brand);
    return speakChinese(b.wake, { rate:S.cfg.rate, volume:S.cfg.volume, voiceURI:S.cfg.voiceURI });
  }

  // settings toggles
  const sw = hit('[data-cfg]');
  if (sw) {
    const k = sw.dataset.cfg;
    S.cfg[k] = !S.cfg[k]; saveState(); render(); return;
  }
  if (hit('#testVoice')) {
    const b = getBrand(S.brand);
    const r = await speakChinese(`${b.wake}，打开空调`, { rate:S.cfg.rate, volume:S.cfg.volume, voiceURI:S.cfg.voiceURI });
    if (r.method === 'none') alert('No Chinese voice available on this device.\n\nInstall a Chinese TTS voice in your phone settings, or record your own clips instead.');
    return;
  }

  // recorder sheet
  if (hit('#openRec')) return openRecorder();
  if (hit('#sheetClose') || t.id === 'mask') {
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

/* keyboard: Enter to send, live search */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'textIn') {
    const v = e.target.value; e.target.value = '';
    const sg = $('#suggestions'); if (sg) sg.style.display = 'none';
    handleUtterance(v, 'typed');
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
  p.className = 'pill ' + (on ? '' : 'on');
  p.innerHTML = `<span class="dot"></span>${on ? 'Online' : 'Offline ✓'}`;
  p.title = on
    ? 'Internet available — but this app does not need it'
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

  // service worker for offline
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('/sw.js'); } catch {}
  }

}

boot();
