/* ===== 00 core: constants, DOM helpers, icons, dates ===== */
const KEY = 'sechub.progress.v1';
const BAD_KEY = 'sechub.progress.v1.bad';
const MAX_IMPORT = 1000000;
const SVGNS = 'http://www.w3.org/2000/svg';

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

/* Only fragment links and https URLs are ever written to an href. */
function safeHref(v) {
  v = String(v);
  if (/^#[A-Za-z0-9._~-]*$/.test(v)) return v;
  try { const u = new URL(v); if (u.protocol === 'https:') return u.href; } catch (e) { /* fall through */ }
  return '#';
}

/* Element builder. Strings become text nodes, so dataset text can never turn into markup. */
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const k of Object.keys(props)) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'href') el.setAttribute('href', safeHref(v));
      else if (k.length > 2 && k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'value' || k === 'checked' || k === 'disabled' || k === 'hidden' || k === 'selected') el[k] = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  add(el, kids);
  return el;
}
function add(el, kids) {
  for (const k of kids) {
    if (Array.isArray(k)) add(el, k);
    else if (k == null || k === false) continue;
    else el.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
  return el;
}
function ext(url, children, props) {
  /* With no usable https address the text is shown as plain text, never as a link that goes nowhere. */
  if (!url || safeHref(url) === '#') return h('span', props && props.class ? { class: props.class } : null, children);
  return h('a', Object.assign({ href: url, target: '_blank', rel: 'noopener noreferrer' }, props || {}), children);
}

/* ----- icons (stroke paths on a 24 x 24 grid) ----- */
const ICONS = {
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M9 12l2 2 4-4'],
  home: ['M3 11l9-8 9 8', 'M5 10v10h14V10', 'M10 20v-6h4v6'],
  plan: ['M5 5h14v15H5z', 'M5 10h14', 'M9 3v4', 'M15 3v4'],
  book: ['M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z', 'M4 17a3 3 0 0 1 3-3h11'],
  cards: ['M4 8h13v12H4z', 'M8 4h12v12'],
  quiz: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.4-1 .9-1 1.8', 'M12 17h.01'],
  exam: ['M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M12 9v4l2.5 1.5', 'M9 2h6'],
  list: ['M8 6h12', 'M8 12h12', 'M8 18h12', 'M4 6h.01', 'M4 12h.01', 'M4 18h.01'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  checksq: ['M4 4h16v16H4z', 'M8 12l3 3 5-6'],
  cross: ['M6 6l12 12', 'M18 6L6 18'],
  table: ['M4 5h16v14H4z', 'M4 10h16', 'M10 5v14'],
  flask: ['M9 3h6', 'M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3'],
  sliders: ['M4 7h9', 'M17 7h3', 'M4 17h3', 'M11 17h9', 'M15 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', 'M9 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'],
  more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  flag: ['M5 21V4', 'M5 4h12l-2 4 2 4H5'],
  back: ['M19 12H5', 'M11 6l-6 6 6 6'],
  next: ['M5 12h14', 'M13 6l6 6-6 6'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5H5V6h5'],
  copy: ['M9 9h11v11H9z', 'M5 15V4h11'],
  warn: ['M12 3l10 18H2z', 'M12 10v4.5', 'M12 17.5h.01'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 11v6', 'M12 7.5h.01'],
  flip: ['M20 12a8 8 0 1 1-2.3-5.7', 'M20 4v4h-4'],
  down: ['M12 4v12', 'M6 12l6 6 6-6'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2']
};
function icon(name, size) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', String(size || 20));
  s.setAttribute('height', String(size || 20));
  s.setAttribute('class', 'ico');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('focusable', 'false');
  s.style.cssText = 'fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none';
  for (const d of (ICONS[name] || [])) {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d);
    s.appendChild(p);
  }
  return s;
}

/* ----- small utilities ----- */
const sum = (a) => a.reduce((x, y) => x + y, 0);
const mean = (a) => (a.length ? sum(a) / a.length : 0);
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const pct = (x) => Math.round(clamp(x, 0, 1) * 100);
function shuffle(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = b[i]; b[i] = b[j]; b[j] = t;
  }
  return b;
}
function mmss(ms) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const hh = Math.floor(t / 3600), mm = Math.floor((t % 3600) / 60), ss = t % 60;
  return (hh ? hh + ':' + String(mm).padStart(2, '0') : String(mm)) + ':' + String(ss).padStart(2, '0');
}
function hoursLabel(min) {
  const hrs = min / 60;
  return __('{0} h', Number.isInteger(hrs) ? String(hrs) : num1(hrs));
}

/* ----- dates (local calendar days, stored as YYYY-MM-DD) ----- */
const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const today = () => ymd(new Date());
function parseYmd(s) {
  if (typeof s !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  const dt = new Date(y, mo - 1, d);
  return (dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d) ? dt : null;
}
function isYmd(s) {
  const d = parseYmd(s);
  return !!d && d.getFullYear() >= 2000 && d.getFullYear() <= 2100;
}
function addDays(s, n) {
  const dt = parseYmd(s) || new Date();
  dt.setDate(dt.getDate() + n);
  return ymd(dt);
}
function fmtDate(s) {
  const dt = parseYmd(s);
  return dt ? dt.toLocaleDateString(LOC.tag, { day: 'numeric', month: 'short', year: 'numeric' }) : String(s);
}
function fmtStamp(iso) {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return String(iso);
  return new Date(ms).toLocaleString(LOC.tag, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function daysBetween(a, b) { // whole local days from a to b
  const x = parseYmd(a), y = parseYmd(b);
  if (!x || !y) return 0;
  return Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) - Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / 86400000);
}
