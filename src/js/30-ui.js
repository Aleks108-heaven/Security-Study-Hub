/* ===== 30 UI kit, navigation, router ===== */
const NAV = [
  { id: 'home', label: _N('Home'), icon: 'home', group: _N('Study') },
  { id: 'plan', label: _N('Roadmap'), icon: 'plan' },
  { id: 'modules', label: _N('Modules'), icon: 'book' },
  { id: 'cards', label: _N('Flashcards'), icon: 'cards' },
  { id: 'quiz', label: _N('Practice quiz'), icon: 'quiz' },
  { id: 'exam', label: _N('Exam simulator'), icon: 'exam' },
  { id: 'glossary', label: _N('Glossary'), icon: 'list', group: _N('Library') },
  { id: 'tests', label: _N('Test cases'), icon: 'checksq' },
  { id: 'reference', label: _N('Reference'), icon: 'table' },
  { id: 'labs', label: _N('Labs and tools'), icon: 'flask' },
  { id: 'prefs', label: _N('Settings'), icon: 'sliders', group: _N('App') }
];
const TAB_IDS = ['home', 'modules', 'cards', 'quiz'];
const TAB_LABEL = { home: _N('Home'), modules: _N('Modules'), cards: _N('Cards'), quiz: _N('Quiz') };
const NAV_IDS = new Set(NAV.map((n) => n.id));

/* ----- announcements, toast, keys, cleanup ----- */
function announce(msg) {
  const l = $('#live');
  if (!l) return;
  l.textContent = '';
  setTimeout(() => { l.textContent = msg; }, 40);
}
let toastTimer = 0;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  announce(msg);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}
let leaveFns = [], keyFn = null;
function onLeave(fn) { leaveFns.push(fn); }
function setKeys(fn) { keyFn = fn; }
function runLeave() {
  const fns = leaveFns;
  leaveFns = []; keyFn = null;
  for (const f of fns) { try { f(); } catch (e) { /* ignore */ } }
}
document.addEventListener('keydown', (e) => {
  if (!keyFn || e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target, tag = t && t.tagName;
  const inField = (tag === 'INPUT' && t.type !== 'radio' && t.type !== 'checkbox') || tag === 'TEXTAREA' || tag === 'SELECT' || !!(t && t.isContentEditable);
  const onControl = tag === 'BUTTON' || tag === 'A' || tag === 'LABEL' || (tag === 'INPUT');
  if (keyFn(e, { inField, onControl, tag })) e.preventDefault();
});

/* ----- small components ----- */
const topicName = (id) => (IX.topic.get(id) ? IX.topic.get(id).name : String(id));
const kBadge = (k) => h('span', { class: 'k', title: __('Knowledge level {0}', k) }, k);
function checkFlag() {
  return h('span', { class: 'checkflag', title: __('This fact was not re-checked against a primary source on the as-of date. Check it before relying on it.') }, icon('flag', 13), __('Check this'));
}
const tagEl = (text, cls) => h('span', { class: 'tag' + (cls ? ' ' + cls : '') }, text);
function barEl(p, thin) {
  return h('div', { class: 'bar' + (thin ? ' thin' : ''), 'aria-hidden': 'true' }, h('i', { style: { width: pct(p) + '%' } }));
}
function meterEl(p, srLabel) {
  return h('div', { class: 'meter' }, barEl(p), h('span', { class: 'val tnum', 'aria-label': __('{0} {1} percent', srLabel || '', pct(p)) }, pct(p) + '%'));
}
function secHead(title, aside) {
  return h('h2', { class: 'sec' }, h('span', null, title), aside ? h('span', { class: 'aside' }, aside) : null);
}
function note(kind, ...kids) {
  const ic = kind === 'bad' ? 'warn' : (kind === 'ok' ? 'check' : (kind === 'info' ? 'info' : 'warn'));
  return h('div', { class: 'notice' + (kind && kind !== 'warn' ? ' ' + kind : ''), role: kind === 'bad' ? 'alert' : null }, icon(ic, 18), h('div', { class: 'grow' }, kids));
}
function safetyLine() {
  return h('div', { class: 'safety' }, icon('shield', 20),
    h('p', null, __('Run these only on systems you own or are authorised in writing to test. The material is for learning and for non-destructive testing.')));
}
function viewHead(title, lead, kicker) {
  return h('header', { class: 'view-head' },
    kicker ? h('p', { class: 'kicker' }, kicker) : null,
    h('h1', { tabindex: '-1' }, title),
    lead ? h('p', { class: 'lead' }, lead) : null);
}
function emptyState(msg, actions) {
  return h('div', { class: 'empty' }, h('p', null, msg), actions || null);
}
/* A table wider or taller than its box scrolls. While it overflows, the wrapper takes a tab stop so keyboard users can scroll it. */
function scrollRegion(wrap, label) {
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', label);
  if (typeof ResizeObserver === 'function') {
    const check = () => { if (wrap.scrollWidth > wrap.clientWidth + 1 || wrap.scrollHeight > wrap.clientHeight + 1) wrap.setAttribute('tabindex', '0'); else wrap.removeAttribute('tabindex'); };
    const ro = new ResizeObserver(check);
    ro.observe(wrap);
    if (wrap.firstElementChild) ro.observe(wrap.firstElementChild);
  } else wrap.setAttribute('tabindex', '0');
  return wrap;
}
function tblWrap(cls, label, ...kids) { return scrollRegion(h('div', { class: cls }, ...kids), label); }
function chipGroup(items, selected, onChange, label) {
  /* items: [{id, label}]. `selected` is a Set (empty set means "no filter"). */
  const wrap = h('div', { class: 'chips', role: 'group', 'aria-label': label });
  for (const it of items) {
    const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': selected.has(it.id) ? 'true' : 'false' }, it.label);
    b.addEventListener('click', () => {
      if (selected.has(it.id)) selected.delete(it.id); else selected.add(it.id);
      b.setAttribute('aria-pressed', selected.has(it.id) ? 'true' : 'false');
      onChange();
    });
    wrap.append(b);
  }
  return wrap;
}
function armedButton(o) {
  /* A destructive action that needs a second, explicit click inside the page (the viewer blocks confirm()). */
  const wrap = h('span', { class: 'row' });
  const show = () => { wrap.replaceChildren(h('button', { type: 'button', class: 'btn ' + (o.cls || ''), onclick: arm }, o.label)); };
  const arm = () => {
    const yes = h('button', { type: 'button', class: 'btn danger sm', onclick: () => { show(); o.onYes(); } }, o.yes);
    wrap.replaceChildren(h('span', { class: 'small', role: 'alert' }, o.ask), yes, h('button', { type: 'button', class: 'btn sm', onclick: show }, __('Cancel')));
    yes.focus();
  };
  show();
  return wrap;
}

/* ----- clipboard and file saving ----- */
async function copyText(text, fallbackEl) {
  try {
    await navigator.clipboard.writeText(text);
    toast(__('Copied to the clipboard'));
    return true;
  } catch (e) { /* fall through */ }
  try {
    if (fallbackEl) {
      fallbackEl.focus(); fallbackEl.select();
      if (document.execCommand && document.execCommand('copy')) { toast(__('Copied to the clipboard')); return true; }
    }
  } catch (e) { /* fall through */ }
  if (fallbackEl) { fallbackEl.focus(); fallbackEl.select(); }
  toast(__('The text is selected. Copy it with your keyboard or the long-press menu.'));
  return false;
}
const caps = { downloads: null, ready: null };
caps.ready = (async () => {
  try { if (window.claude && typeof window.claude.use === 'function') caps.downloads = await window.claude.use('downloads'); } catch (e) { caps.downloads = null; }
})();
async function saveFile(filename, text) {
  if (!caps.downloads) return false;
  try { await caps.downloads.save({ filename, data: text }); toast(__('Saved {0}', filename)); return true; }
  catch (e) { if (!e || e.code !== 'declined') toast(__('This view cannot save files. Use Copy instead.')); return false; }
}
function saveButton(filename, getText, label) {
  const b = h('button', { type: 'button', class: 'btn', hidden: true, onclick: () => saveFile(filename, getText()) }, icon('down', 18), label || __('Save file'));
  caps.ready.then(() => { if (caps.downloads) b.hidden = false; });
  return b;
}

/* ----- notices (storage and sync state) ----- */
function refreshNotices() {
  const box = $('#notices');
  if (!box) return;
  const items = [];
  if (store.loadNote) items.push(note('warn', __('Saved progress in this browser could not be read, so you are starting fresh. The old data was kept: copy it from Settings.')));
  if (!store.ok && sync.state !== 'on') items.push(note('warn', __('Your progress cannot be saved in this browser right now, so it is kept in memory only. Use Export in Settings before you leave.')));
  box.replaceChildren(...items);
  const foot = $('#rail-foot');
  if (foot) foot.textContent = sync.state === 'on' ? __('Progress is saved here and in your private space for this app.') : (store.ok ? __('Progress is saved in this browser.') : __('Progress is not being saved.'));
  refreshBadges();
}
function refreshBadges() {
  if (!S) return;
  const n = dueCounts().reviews;
  for (const el of $$('[data-due-badge]')) {
    el.hidden = n === 0;
    el.textContent = n > 99 ? '99+' : String(n);
    el.setAttribute('aria-label', __('{0} due', plural(n, 'card')));
  }
}

/* ----- theme and language ----- */
let initialTheme = null;
function applyTheme() {
  const r = document.documentElement;
  const t = S.settings.theme;
  if (t === 'light' || t === 'dark') r.setAttribute('data-theme', t);
  else if (initialTheme) r.setAttribute('data-theme', initialTheme);
  else r.removeAttribute('data-theme');
}
/* Switching language rebuilds the dataset and the chrome, then redraws the current screen where the reader is. */
function changeLanguage(pref) {
  S.settings.lang = pref;
  S.settings.t = Date.now();
  touch();
  applyLanguage();
  buildNav();
  refreshNotices();
  route(cur.tok, { force: true, initial: true });
}

/* ----- navigation chrome ----- */
function buildNav() {
  const rail = $('#rail');
  rail.setAttribute('aria-label', __('Sections'));
  rail.replaceChildren(
    h('div', { class: 'brand' },
      h('div', { class: 'brand-mark' }, icon('shield', 22)),
      h('div', null, h('div', { class: 'brand-name' }, __('Security Testing Study Hub')), h('div', { class: 'brand-sub' }, 'v' + D.meta.datasetVersion + ' / ' + D.meta.asOf))),
    h('div', { class: 'rail-nav' }, NAV.map((n) => [
      n.group ? h('div', { class: 'rail-group' }, __(n.group)) : null,
      h('a', { href: '#' + n.id, 'data-nav': n.id },
        icon(n.icon, 20), h('span', null, __(n.label)),
        n.id === 'cards' ? h('span', { class: 'badge-n', 'data-due-badge': '', hidden: true }) : null)
    ])),
    h('p', { class: 'rail-foot', id: 'rail-foot' }, ''));

  const bar = $('#tabbar');
  bar.setAttribute('aria-label', __('Main'));
  const tabs = TAB_IDS.map((id) => {
    const n = NAV.find((x) => x.id === id);
    return h('a', { class: 'tab', href: '#' + id, 'data-nav': id }, icon(n.icon, 22),
      h('span', null, __(TAB_LABEL[id] || n.label)),
      id === 'cards' ? h('span', { class: 'badge-n', 'data-due-badge': '', hidden: true }) : null);
  });
  const more = h('button', { type: 'button', class: 'tab', id: 'more-btn', 'aria-expanded': 'false', 'aria-controls': 'more' }, icon('more', 22), h('span', null, __('More')));
  bar.replaceChildren(...tabs, more);

  const sheet = $('#more');
  sheet.replaceChildren(...NAV.filter((n) => !TAB_IDS.includes(n.id)).map((n) => h('a', { href: '#' + n.id, 'data-nav': n.id }, icon(n.icon, 20), h('span', null, __(n.label)))));
  const setMore = (open) => {
    sheet.hidden = !open;
    more.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  more.addEventListener('click', () => setMore(sheet.hidden));
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) setMore(false); });
  if (!buildNav.bound) {                     // document-level listeners are added once, however often the chrome is rebuilt
    buildNav.bound = true;
    document.addEventListener('click', (e) => { const s = $('#more'); if (s && !s.hidden && !e.target.closest('#more') && !e.target.closest('#more-btn')) { s.hidden = true; const b = $('#more-btn'); if (b) b.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', (e) => { const s = $('#more'); if (e.key === 'Escape' && s && !s.hidden) { s.hidden = true; const b = $('#more-btn'); if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); } } });
  }
  for (const a of $$('a[data-nav]')) {
    a.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      go(a.getAttribute('data-nav'));
    });
  }
  updateNav();
}
function updateNav() {
  for (const a of $$('a[data-nav]')) {
    if (a.getAttribute('data-nav') === cur.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  const more = $('#more-btn');
  if (more) { if (cur.id && !TAB_IDS.includes(cur.id)) more.setAttribute('aria-current', 'true'); else more.removeAttribute('aria-current'); }
  refreshBadges();
}

/* ----- router ----- */
const VIEWS = {};
let cur = { tok: null, id: null };
function parseToken(tok) {
  tok = tok || 'home';
  if (NAV_IDS.has(tok)) return { id: tok };
  if (tok.startsWith('mod-') && IX.module.has(tok)) return { id: 'modules', module: tok };
  if (tok.startsWith('g-') && IX.term.has(tok)) return { id: 'glossary', term: tok };
  if (tok.startsWith('ref-') && D.reference[tok.slice(4)]) return { id: 'reference', table: tok.slice(4) };
  return { id: 'home' };
}
function route(tok, opts) {
  opts = opts || {};
  const key = tok || 'home';
  if (!opts.force && cur.tok === key) return;
  runLeave();
  const r = parseToken(key);
  cur = { tok: key, id: r.id };
  const view = $('#view');
  view.replaceChildren();
  let node;
  try { node = VIEWS[r.id](r, opts.params || {}); }
  catch (err) { node = h('div', { class: 'view' }, viewHead(__('Something went wrong')), note('bad', __('This screen could not be drawn. Go back to Home and try again. Your progress is not affected.'))); if (window.console) console.error(err); }
  view.append(node);
  updateNav();
  if (!opts.initial) {
    const t = $('h1', view);
    if (t) t.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}
function go(tok, params) {
  try { if (location.hash !== '#' + tok) location.hash = tok; } catch (e) { /* hash not writable: route directly */ }
  route(tok, { force: true, params });
}
function showFatal(msg) {
  const v = $('#view');
  v.replaceChildren(h('div', { class: 'view' }, viewHead(__('The study data could not be loaded')), note('bad', msg)));
}
