/* ===== 05 languages: interface strings, plural forms, locale ===== */
/* Every interface string is written in English in the code. __('English text') looks it up in the catalogue (id "hub-ui")
   and returns the English text itself when a language has no entry, so a missing translation never breaks a screen.
   Dataset text (questions, cards, glossary and so on) is translated by overlay files that never touch ids or answer keys. */
const LANGS = [
  { id: 'en', tag: 'en-GB', name: 'English' },
  { id: 'uk', tag: 'uk-UA', name: 'Українська' },
  { id: 'pl', tag: 'pl-PL', name: 'Polski' },
  { id: 'es', tag: 'es-ES', name: 'Español' },
  { id: 'de', tag: 'de-DE', name: 'Deutsch' }
];
const LANG_PREFS = ['auto'].concat(LANGS.map((l) => l.id));
const LOC = { lang: 'en', tag: 'en-GB', ui: {}, rules: null, cover: null };
let CATALOG = {};

function loadCatalog() {
  try { CATALOG = JSON.parse(document.getElementById('hub-ui').textContent) || {}; } catch (e) { CATALOG = {}; }
}

/* pref is "auto" (follow the device) or a language id. Anything unknown means English. */
function pickLang(pref) {
  if (pref && pref !== 'auto') return LANGS.some((l) => l.id === pref) ? pref : 'en';
  let list = [];
  try { list = (navigator.languages && navigator.languages.length) ? Array.from(navigator.languages) : [navigator.language]; } catch (e) { list = []; }
  for (const raw of list) {
    const id = String(raw || '').slice(0, 2).toLowerCase();
    if (LANGS.some((l) => l.id === id)) return id;
  }
  return 'en';
}

function setUiLang(id) {
  const L = LANGS.find((x) => x.id === id) || LANGS[0];
  LOC.lang = L.id; LOC.tag = L.tag; LOC.ui = {};
  if (L.id !== 'en') {
    for (const k of Object.keys(CATALOG)) {
      const v = CATALOG[k] && CATALOG[k][L.id];
      if (typeof v === 'string' ? v.length > 0 : (v && typeof v === 'object' && typeof v.other === 'string')) LOC.ui[k] = v;
    }
  }
  try { LOC.rules = new Intl.PluralRules(L.tag); } catch (e) { LOC.rules = null; }
}

function __(key, ...args) {
  let s = LOC.ui[key];
  if (typeof s !== 'string') s = key;
  return args.length ? s.replace(/\{(\d+)\}/g, (m, i) => (Number(i) < args.length ? String(args[i]) : m)) : s;
}
/* Marks a string for translation where it is stored now and shown later (menus, label tables). Translate it with __() when drawing. */
const _N = (key) => key;

/* The noun for a count: "card" or "cards". English adds an s unless `many` is given; other languages take the form that their
   plural rules pick (Ukrainian and Polish have one, few, many and other) from the catalogue entry "plural:<one>". */
function pluralWord(n, one, many) {
  const f = LOC.ui['plural:' + one];
  if (f && typeof f === 'object') {
    const cat = LOC.rules ? LOC.rules.select(n) : 'other';
    return typeof f[cat] === 'string' ? f[cat] : f.other;
  }
  return n === 1 ? one : (many || one + 's');
}
/* "3 cards" */
function plural(n, one, many) { return n + ' ' + pluralWord(n, one, many); }
/* A number with one decimal in the reader's format: 10.3 or 10,3. */
function num1(x) { return Number(x).toLocaleString(LOC.tag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
