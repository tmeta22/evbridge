/* =====================================================================
   OFFLINE NLU  —  intent matcher
   Runs 100% in the browser. No model download, no network.
   Strategy (cheap → expensive):
     1. exact phrase hit on keys/kkeys
     2. token overlap scoring (weighted by phrase length)
     3. Khmer substring matching (Khmer has no spaces between words)
     4. character-bigram Dice coefficient for typo tolerance
     5. slot extraction for numbers / temperature (EN + Khmer numerals)
   ===================================================================== */

import { COMMANDS } from './data/commands.js';

/* ---------- Khmer numeral support ---------- */
const KHMER_DIGITS = { '០':'0','១':'1','២':'2','៣':'3','៤':'4','៥':'5','៦':'6','៧':'7','៨':'8','៩':'9' };
const KHMER_WORDS = {
  'សូន្យ':0,'មួយ':1,'ពីរ':2,'បី':3,'បួន':4,'ប្រាំ':5,'ប្រាំមួយ':6,'ប្រាំពីរ':7,
  'ប្រាំបី':8,'ប្រាំបួន':9,'ដប់':10,'ដប់មួយ':11,'ដប់ពីរ':12,'ដប់បី':13,
  'ដប់បួន':14,'ដប់ប្រាំ':15,'ដប់ប្រាំមួយ':16,'ដប់ប្រាំពីរ':17,'ដប់ប្រាំបី':18,
  'ដប់ប្រាំបួន':19,'ម្ភៃ':20,'សាមសិប':30
};
const EN_WORDS = {
  zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
  eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,
  eighteen:18,nineteen:19,twenty:20,thirty:30,
  'twenty one':21,'twenty two':22,'twenty three':23,'twenty four':24,'twenty five':25,
  'twenty six':26,'twenty seven':27,'twenty eight':28,'twenty nine':29
};

function khmerDigitsToArabic(s) {
  return s.replace(/[០-៩]/g, ch => KHMER_DIGITS[ch]);
}

/** Extract a numeric value from free text (Arabic, Khmer numerals or words). */
export function extractNumber(text) {
  const t = khmerDigitsToArabic(text.toLowerCase());
  const digit = t.match(/(\d{1,3})/);
  if (digit) return parseInt(digit[1], 10);
  // multi-word English first (longest match)
  const enKeys = Object.keys(EN_WORDS).sort((a,b) => b.length - a.length);
  for (const k of enKeys) if (t.includes(k)) return EN_WORDS[k];
  for (const k of Object.keys(KHMER_WORDS).sort((a,b) => b.length - a.length))
    if (text.includes(k)) return KHMER_WORDS[k];
  return null;
}

/* ---------- text normalisation ---------- */
function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[.,!?;:"'’“”()\-_/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set([
  'the','a','an','to','my','me','please','can','you','could','would','i','it',
  'is','are','for','of','on','in','at','and','do','does','let','want','need',
  'car','hey','ok','okay','now','some','that','this','up','down','with','make'
]);

function tokens(s) {
  return norm(s).split(' ').filter(w => w && !STOP.has(w));
}

/* ---------- similarity: character bigram Dice ---------- */
function bigrams(s) {
  const t = norm(s).replace(/ /g, '');
  const out = new Set();
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return out;
}
function dice(a, b) {
  const A = bigrams(a), B = bigrams(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return (2 * inter) / (A.size + B.size);
}

/* ---------- Khmer helpers ---------- */
const KHMER_RE = /[\u1780-\u17FF]/;
export const isKhmer = (s) => KHMER_RE.test(s || '');

/* =====================================================================
   MAIN MATCHER
   returns { cmd, score, value, lang } | null
   ===================================================================== */
export function matchIntent(input, opts = {}) {
  const raw = (input || '').trim();
  if (!raw) return null;

  const khmer = isKhmer(raw);
  const lang = khmer ? 'km' : 'en';
  const n = norm(raw);
  const toks = tokens(raw);
  const results = [];

  for (const cmd of COMMANDS) {
    let best = 0;

    // ---- Chinese direct hit (owner may paste/say the Chinese itself) ----
    if (raw.includes(cmd.zh)) best = Math.max(best, 1.3);
    if (cmd.py && n.includes(norm(cmd.py))) best = Math.max(best, 1.25);

    // ---- Khmer path: substring matching (no word boundaries in Khmer) ----
    if (khmer) {
      for (const k of cmd.kkeys) {
        if (raw.includes(k)) {
          // longer keyword match = stronger signal
          best = Math.max(best, 1.0 + Math.min(k.length / 100, 0.2));
        }
      }
      // Khmer meaning of the command itself
      if (cmd.km && (raw.includes(cmd.km) || cmd.km.includes(raw))) {
        best = Math.max(best, 1.05);
      }
      // fuzzy on Khmer keys for partial/misspoken input
      for (const k of cmd.kkeys) best = Math.max(best, dice(raw, k) * 0.85);
      if (cmd.km) best = Math.max(best, dice(raw, cmd.km) * 0.8);
    }

    // ---- English path ----
    if (!khmer) {
      for (const k of cmd.keys) {
        const nk = norm(k);
        if (n === nk) { best = Math.max(best, 1.4); continue; }
        if (n.includes(nk)) {
          // reward multi-word keyword matches heavily
          const words = nk.split(' ').length;
          best = Math.max(best, 1.0 + Math.min(words * 0.06, 0.24));
          continue;
        }
        // token overlap
        const kt = tokens(k);
        if (kt.length) {
          const hit = kt.filter(w => toks.includes(w)).length;
          const ratio = hit / kt.length;
          if (ratio > 0) {
            // require decent coverage of the input too, to avoid 1-word false hits
            const cover = hit / Math.max(toks.length, 1);
            best = Math.max(best, ratio * 0.75 + cover * 0.2);
          }
        }
        best = Math.max(best, dice(n, nk) * 0.7);
      }
      // English meaning of the command
      const ne = norm(cmd.en);
      if (n === ne) best = Math.max(best, 1.4);
      else if (n.includes(ne) || ne.includes(n)) best = Math.max(best, 1.0);
      else {
        const et = tokens(cmd.en);
        const hit = et.filter(w => toks.includes(w)).length;
        if (et.length) best = Math.max(best, (hit / et.length) * 0.7);
        best = Math.max(best, dice(n, ne) * 0.6);
      }
    }

    if (best > 0) results.push({ cmd, score: best });
  }

  if (!results.length) return null;
  results.sort((a, b) => b.score - a.score);
  const top = results[0];

  const threshold = opts.threshold ?? 0.52;
  if (top.score < threshold) {
    return { cmd: null, score: top.score, suggestions: results.slice(0, 4).map(r => r.cmd), lang };
  }

  // ---- slot filling ----
  // If a number was spoken it is used (clamped to sane ranges); if none was
  // spoken, value stays null so the app can ask the owner for it.
  let value = null;
  if (top.cmd.slot) {
    value = extractNumber(raw);
    if (value !== null) {
      if (top.cmd.slot === 'temp') value = Math.min(32, Math.max(16, value));
      if (top.cmd.slot === 'number') value = Math.min(40, Math.max(0, value));
    }
  }

  return {
    cmd: top.cmd,
    score: top.score,
    value,
    lang,
    alternatives: results.slice(1, 4).map(r => r.cmd)
  };
}

/* ---------- reply matcher: what did the car actually say? ---------- */
/**
 * Given a Chinese transcription of the car's real reply, find the command
 * whose known reply (cmd.reply.zh) it matches best. Returns the command
 * (so its en/km translation can be shown) or null when nothing matches
 * closely enough.
 */
export function matchReply(input) {
  const raw = (input || '').trim();
  if (!raw) return null;
  const n = norm(raw);
  if (!n) return null;

  let best = null, bestScore = 0;
  for (const cmd of COMMANDS) {
    const rep = cmd.reply;
    if (!rep || !rep.zh) continue;
    const zh = rep.zh.trim();
    const plain = zh.replace(/\{n\}/g, '').trim();
    if (!plain) continue;

    let score = 0;
    // exact match, treating {n} as any number
    try {
      const re = new RegExp('^' + zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\{n\}/g, '\\d+') + '$');
      if (re.test(n)) score = 1;
    } catch {}
    if (score < 1 && n === plain) score = 0.98;
    // containment: cars often add a short prefix/suffix, e.g. "好的，空调已打开"
    if (score < 0.9 && plain.length >= 2 && (n.includes(plain) || plain.includes(n))) score = 0.85;
    if (score === 0) score = dice(n, plain) * 0.6;

    if (score > bestScore) { bestScore = score; best = cmd; }
  }
  return bestScore >= 0.8 ? best : null;
}

/* ---------- fill {n} placeholders ---------- */
export function fill(str, value) {
  if (str == null) return '';
  if (value === null || value === undefined) return str.replace(/\{n\}/g, '');
  return str.replace(/\{n\}/g, String(value));
}

/* ---------- free-text search for the command browser ---------- */
export function searchCommands(q) {
  const query = (q || '').trim();
  if (!query) return COMMANDS;
  const khmer = isKhmer(query);
  const n = norm(query);
  return COMMANDS
    .map(cmd => {
      let s = 0;
      if (khmer) {
        if (cmd.km.includes(query)) s = 3;
        else if (cmd.kkeys.some(k => k.includes(query) || query.includes(k))) s = 2.5;
        else if (cmd.kmr && cmd.kmr.includes(query)) s = 2;
        else s = dice(query, cmd.km) * 1.5;
      } else {
        if (norm(cmd.en).includes(n)) s = 3;
        else if (cmd.keys.some(k => norm(k).includes(n))) s = 2.5;
        else if (norm(cmd.py).includes(n)) s = 2.2;
        else if (cmd.zh.includes(query)) s = 2.2;
        else s = Math.max(dice(n, cmd.en), dice(n, cmd.py)) * 1.5;
      }
      return { cmd, s };
    })
    .filter(r => r.s > 0.45)
    .sort((a, b) => b.s - a.s)
    .map(r => r.cmd);
}
