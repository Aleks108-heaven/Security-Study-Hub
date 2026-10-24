/* ===== 45 views: glossary, test cases, reference tables, labs and tools ===== */
function setHashQuiet(tok) {
  cur.tok = tok;                                   // so the hashchange that may follow is ignored by the router
  try { history.replaceState(null, '', '#' + tok); } catch (e) { try { location.hash = tok; } catch (e2) { /* hash not writable */ } }
}
function highlight(text, q) {
  if (!q) return [text];
  const lower = text.toLowerCase();
  if (lower.length !== text.length) return [text];
  const out = [];
  let i = 0;
  for (;;) {
    const j = lower.indexOf(q, i);
    if (j < 0) break;
    if (j > i) out.push(text.slice(i, j));
    out.push(h('mark', null, text.slice(j, j + q.length)));
    i = j + q.length;
  }
  out.push(text.slice(i));
  return out;
}

/* ---------- glossary ---------- */
VIEWS.glossary = function (r, params) {
  const root = h('div', { class: 'view' });
  const st = { q: '', topic: params.topic && IX.topic.has(params.topic) ? params.topic : '' };
  const search = h('input', { type: 'search', id: 'gl-search', placeholder: __('Search terms and definitions'), autocomplete: 'off', spellcheck: 'false' });
  const sel = h('select', { id: 'gl-topic' }, h('option', { value: '' }, __('All topics')), D.topics.map((t) => h('option', { value: t.id }, t.name)));
  sel.value = st.topic;
  const box = h('div');
  const count = h('p', { class: 'hint', role: 'status' });
  const reset = () => { st.q = ''; st.topic = ''; search.value = ''; sel.value = ''; draw(); search.focus(); };

  function draw() {
    const q = st.q.trim().toLowerCase();
    const items = IX.glossarySorted.filter((g) => (!st.topic || g.topic === st.topic) && (!q || g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)));
    count.textContent = items.length === D.glossary.length ? plural(items.length, 'term') : __('{0} of {1}', items.length, plural(D.glossary.length, 'term'));
    if (!items.length) {
      box.replaceChildren(emptyState(__('No term matches that search.'), h('button', { type: 'button', class: 'btn', onclick: reset }, __('Clear the search and filters'))));
      return;
    }
    box.replaceChildren(h('dl', { class: 'gl' }, items.map((g) => h('div', { class: 'entry', id: g.id },
      h('dt', null, highlight(g.term, q), tagEl(topicName(g.topic)), g.verify ? checkFlag() : null),
      h('dd', null, highlight(g.definition, q))))));
  }
  search.addEventListener('input', () => { st.q = search.value; draw(); });
  sel.addEventListener('change', () => { st.topic = sel.value; draw(); });

  root.append(
    viewHead(__('Glossary'), __('Plain-language definitions of the terms used across the modules, with the topic each belongs to. In this app "authorization" means access control and "authorisation" means permission to test.'), __('Library')),
    h('div', { class: 'filters' },
      h('label', { class: 'field', for: 'gl-search' }, __('Search'), search),
      h('label', { class: 'field', for: 'gl-topic' }, __('Topic'), sel)),
    count, box);
  draw();
  if (r.term) {
    /* The view is not in the document yet, so look inside the list itself rather than calling document.getElementById. */
    const el = Array.from(box.querySelectorAll('.entry')).find((e) => e.id === r.term);
    if (el) { el.classList.add('hit'); setTimeout(() => el.scrollIntoView({ block: 'center' }), 0); }
  }
  return root;
};

/* ---------- test cases ---------- */
function csvCell(v) {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;          // keep spreadsheet programs from reading a cell as a formula
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
/* The export files keep English column names and type words so that they match security-test-cases.csv and import cleanly elsewhere;
   the text in the cells is in the language the reader chose. */
function testsToCsv(list) {
  const head = ['ID', 'Group', 'Feature', 'Type', 'Test', 'Expected secure result', 'References'];
  const rows = list.map((t) => [t.id, t.group, t.feature, t.type, t.test, t.expected, t.refs.join('; ')]);
  return [head].concat(rows).map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
}
function testsToMd(list) {
  const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const lines = ['# Security test cases', '', 'Run these only on systems you are authorised to test.', '', '| ID | Feature | Type | Test | Expected secure result | Ref |', '| --- | --- | --- | --- | --- | --- |'];
  for (const t of list) lines.push('| ' + [t.id, t.feature, t.type, t.test, t.expected, t.refs.join(', ')].map(esc).join(' | ') + ' |');
  return lines.join('\n') + '\n';
}

const TEST_TYPES = [_N('positive'), _N('negative'), _N('boundary'), _N('exploratory')];
VIEWS.tests = function () {
  const root = h('div', { class: 'view' });
  const st = { feature: '', type: '', q: '' };
  const features = Array.from(new Set(D.testcases.map((t) => t.feature)));
  const fSel = h('select', { id: 'tc-feature' }, h('option', { value: '' }, __('All features')), features.map((f) => h('option', { value: f }, f)));
  const tSel = h('select', { id: 'tc-type' }, h('option', { value: '' }, __('All types')), TEST_TYPES.map((t) => h('option', { value: t }, __(t))));
  const q = h('input', { type: 'search', id: 'tc-q', placeholder: __('Search tests and expected results'), autocomplete: 'off' });
  const prog = h('p', { class: 'hint', role: 'status' });
  const tableBox = h('div', { class: 'stack' });
  const exportText = h('textarea', { id: 'tc-export', readonly: true, 'aria-label': __('Export text'), rows: '8' });
  const details = h('details', null, h('summary', null, __('Show the export text')), exportText);
  let shown = [];

  const doneCount = () => D.testcases.filter((t) => S.testcases[t.id] && S.testcases[t.id].done).length;
  const filtered = () => {
    const ql = st.q.trim().toLowerCase();
    return D.testcases.filter((t) => (!st.feature || t.feature === st.feature) && (!st.type || t.type === st.type) &&
      (!ql || (t.id + ' ' + t.test + ' ' + t.expected + ' ' + t.refs.join(' ')).toLowerCase().includes(ql)));
  };
  function drawProg() { prog.textContent = __('{0} of {1} cases shown, {2} marked done', shown.length, D.testcases.length, doneCount()); }
  function draw() {
    shown = filtered();
    drawProg();
    if (!shown.length) {
      tableBox.replaceChildren(emptyState(__('No test case matches those filters.'), h('button', { type: 'button', class: 'btn', onclick: () => { st.feature = st.type = st.q = ''; fSel.value = tSel.value = q.value = ''; draw(); } }, __('Clear the filters'))));
      return;
    }
    const groups = Array.from(new Set(shown.map((t) => t.group)));
    tableBox.replaceChildren(...groups.map((g) => {
      const rows = shown.filter((t) => t.group === g).map((t) => {
        const box = h('input', { type: 'checkbox', 'aria-label': __('Done: {0}', t.id), checked: !!(S.testcases[t.id] && S.testcases[t.id].done) });
        box.addEventListener('change', () => { S.testcases[t.id] = { done: box.checked, t: Date.now(), at: null }; touch(); drawProg(); });
        const copy = h('button', { type: 'button', class: 'btn sm', 'aria-label': __('Copy {0}', t.id), onclick: () => copyText(t.id + ' [' + t.type + '] ' + t.test + '\n' + __('Expected:') + ' ' + t.expected + '\n' + __('References:') + ' ' + t.refs.join(', ')) }, icon('copy', 16), __('Copy'));
        return h('tr', null,
          h('td', { 'data-label': __('Done') }, h('div', { class: 'tc-done' }, box)),
          h('td', { 'data-label': __('ID'), class: 'nowrap' }, h('span', { class: 'id' }, t.id)),
          h('td', { 'data-label': __('Type') }, tagEl(__(t.type))),
          h('td', { 'data-label': __('Test') }, t.test),
          h('td', { 'data-label': __('Expected') }, t.expected),
          h('td', { 'data-label': __('Refs') }, t.refs.map((r, i) => [i ? ', ' : null, h('span', { class: 'nowrap' }, r)])),
          h('td', { 'data-label': __('Copy') }, copy));
      });
      return h('section', { class: 'section' }, secHead(g, plural(rows.length, 'case')),
        tblWrap('tbl-wrap flat', __('{0} test cases table', g), h('table', { class: 'tbl stackable' },
          h('thead', null, h('tr', null, [__('Done'), __('ID'), __('Type'), __('Test'), __('Expected secure result'), __('Refs'), __('Copy')].map((t) => h('th', { scope: 'col' }, t)))),
          h('tbody', null, rows))));
    }));
  }
  fSel.addEventListener('change', () => { st.feature = fSel.value; draw(); });
  tSel.addEventListener('change', () => { st.type = tSel.value; draw(); });
  q.addEventListener('input', () => { st.q = q.value; draw(); });

  const doExport = async (kind) => {
    const text = kind === 'csv' ? testsToCsv(shown) : testsToMd(shown);
    exportText.value = text;
    const ok = await copyText(text, exportText);
    if (!ok) details.open = true;
  };
  root.append(
    viewHead(__('Security test cases'), __('Reusable, non-destructive test ideas for common web features. Each has an expected secure result and a reference such as an OWASP category or a CWE number. Filter them, tick the ones you have run, and export the list.'), __('Library')),
    safetyLine(),
    h('div', { class: 'filters' },
      h('label', { class: 'field', for: 'tc-feature' }, __('Feature'), fSel),
      h('label', { class: 'field', for: 'tc-type' }, __('Type'), tSel),
      h('label', { class: 'field', for: 'tc-q' }, __('Search'), q)),
    prog,
    h('div', { class: 'row' },
      h('button', { type: 'button', class: 'btn', onclick: () => doExport('md') }, icon('copy', 18), __('Copy as Markdown')),
      h('button', { type: 'button', class: 'btn', onclick: () => doExport('csv') }, icon('copy', 18), __('Copy as CSV')),
      saveButton('security-test-cases.md', () => testsToMd(shown), __('Save Markdown')),
      saveButton('security-test-cases.csv', () => testsToCsv(shown), __('Save CSV'))),
    details,
    tableBox);
  draw();
  return root;
};

/* ---------- reference tables ---------- */
const REF_NAMES = {
  securityProperties: _N('Security properties (CIA and more)'),
  technicalBuildingBlocks: _N('Technical building blocks'),
  istqbCertificates: _N('ISTQB security certificates'),
  istqbCrosswalk: _N('ISTQB crosswalk: CT-SEC and CT-STE'),
  testProcessStages: _N('Security test process'),
  istqbTechniquesForSecurity: _N('ISTQB techniques applied to security'),
  sdlcActivities: _N('Security activities across the SDLC'),
  automatedTestTypes: _N('Automated security test types'),
  owaspTop10_2025: _N('OWASP Top 10:2025'),
  wstgCategories: _N('OWASP WSTG test categories'),
  owaspApiTop10_2023: _N('OWASP API Security Top 10:2023'),
  securityMechanisms: _N('Security mechanisms and how to test them'),
  infrastructureDomains: _N('Mobile, cloud and infrastructure'),
  owaspLlmTop10_2025: _N('OWASP Top 10 for LLM applications 2025'),
  socialEngineering: _N('Social engineering techniques'),
  assessmentTypes: _N('Assessment types'),
  identifiersAndScoring: _N('Identifiers and scoring'),
  detectionChain: _N('Detection chain'),
  frameworksAndLaws: _N('Frameworks and laws')
};
const refName = (k) => (REF_NAMES[k] ? __(REF_NAMES[k]) : k);
VIEWS.reference = function (r) {
  const root = h('div', { class: 'view' });
  const keys = Object.keys(D.reference);
  let key = r.table && D.reference[r.table] ? r.table : keys[0];
  let query = '';
  const sel = h('select', { id: 'ref-select' }, keys.map((k) => h('option', { value: k }, refName(k))));
  sel.value = key;
  const search = h('input', { type: 'search', id: 'ref-search', placeholder: __('Filter rows'), autocomplete: 'off' });
  const box = h('div', { class: 'stack' });
  const count = h('p', { class: 'hint', role: 'status' });
  const cellText = (v) => (Array.isArray(v) ? v.join(', ') : (v == null ? '' : String(v)));

  function draw() {
    const T = D.reference[key];
    const ql = query.trim().toLowerCase();
    const rows = T.rows.filter((row) => !ql || T.columns.some((c) => cellText(row[c.key]).toLowerCase().includes(ql)));
    count.textContent = __('{0} of {1}', rows.length, plural(T.rows.length, 'row'));
    if (!rows.length) {
      box.replaceChildren(emptyState(__('No row matches that filter.'), h('button', { type: 'button', class: 'btn', onclick: () => { query = ''; search.value = ''; draw(); } }, __('Clear the filter'))));
      return;
    }
    box.replaceChildren(tblWrap('tbl-wrap tall flat', __('{0} table', refName(key)), h('table', { class: 'tbl stackable' },
      h('caption', { class: 'sr-only' }, refName(key)),
      h('thead', null, h('tr', null, T.columns.map((c) => h('th', { scope: 'col' }, c.label)))),
      h('tbody', null, rows.map((row) => h('tr', null, T.columns.map((c) => h('td', { 'data-label': c.label }, highlight(cellText(row[c.key]), ql)))))))));
  }
  sel.addEventListener('change', () => { key = sel.value; query = ''; search.value = ''; setHashQuiet('ref-' + key); draw(); });
  search.addEventListener('input', () => { query = search.value; draw(); });
  root.append(
    viewHead(__('Reference tables'), __('Compact tables for revision: the OWASP lists, the WSTG categories, ISTQB techniques applied to security, frameworks, identifiers and more. Check the as-of date before you rely on a list: {0}.', fmtDate(D.meta.asOf)), __('Library')),
    h('div', { class: 'filters' },
      h('label', { class: 'field', for: 'ref-select' }, __('Table'), sel),
      h('label', { class: 'field', for: 'ref-search' }, __('Filter rows'), search)),
    count, box);
  draw();
  return root;
};

/* ---------- labs, tools and resources ---------- */
const KIND_LABEL = { istqb: 'ISTQB', owasp: 'OWASP', nist: 'NIST', mitre: 'MITRE', scoring: _N('Scoring and identifiers'), certification: _N('Certifications'), lab: _N('Practice labs'), framework: _N('Frameworks'), law: _N('Law and regulation'), tool: _N('Tools') };
/* Cost and level values come from the dataset in English and drive the filters, so the stored words stay as they are and only their labels change. */
const COST_BUCKETS = { Paid: _N('Paid'), 'Free tier plus paid': _N('Free tier plus paid'), Free: _N('Free') };
const LAB_LEVELS = { Beginner: _N('Beginner'), Intermediate: _N('Intermediate'), Advanced: _N('Advanced') };
function costBucket(c) {
  const s = String(c).toLowerCase();
  if (s.startsWith('mostly paid') || s === 'paid') return 'Paid';
  if (s.startsWith('free') && s.includes('paid')) return 'Free tier plus paid';
  return 'Free';
}
function levelHas(level, want) { return String(level).toLowerCase().includes(want.toLowerCase()); }
/* A cost or level phrase such as "Free; paid options" is shown through the catalogue when it has an entry, and as stored when it has none. */
const stored = (s) => __(String(s));

VIEWS.labs = function (r, params) {
  const root = h('div', { class: 'view' });
  let tab = ['labs', 'tools', 'resources'].includes(params.tab) ? params.tab : 'labs';
  const body = h('div', { class: 'stack' });
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': __('Section') });
  const lf = { cost: '', level: '' };

  function checkedTag(ok) { return ok ? h('span', { class: 'tag ok' }, icon('check', 13), __('Link checked {0}', fmtDate(D.meta.asOf))) : h('span', { class: 'tag warn' }, __('Link not re-checked')); }

  function drawLabs() {
    const costs = Array.from(new Set(D.labs.map((l) => costBucket(l.cost))));
    const levels = Object.keys(LAB_LEVELS);
    const cSel = h('select', { id: 'lab-cost' }, h('option', { value: '' }, __('Any cost')), costs.map((c) => h('option', { value: c }, __(COST_BUCKETS[c]))));
    const lSel = h('select', { id: 'lab-level' }, h('option', { value: '' }, __('Any level')), levels.map((l) => h('option', { value: l }, __(LAB_LEVELS[l]))));
    cSel.value = lf.cost; lSel.value = lf.level;
    const list = h('div');
    const paint = () => {
      const items = D.labs.filter((l) => (!lf.cost || costBucket(l.cost) === lf.cost) && (!lf.level || levelHas(l.level, lf.level)));
      list.replaceChildren(...(items.length ? items.map((l) => h('article', { class: 'lab' },
        h('h2', null, l.url ? ext(l.url, [l.name, ' ', icon('external', 14)], { class: 'name' }) : h('span', { class: 'name' }, l.name)),
        h('p', { class: 'prose' }, l.focus),
        h('div', { class: 'row' }, tagEl(stored(l.cost)), tagEl(stored(l.level)),
          l.sections && l.sections.length ? tagEl(l.sections.length > 1 ? __('Hub sections {0}', l.sections.join(', ')) : __('Hub section {0}', l.sections.join(', '))) : null,
          l.url ? checkedTag(l.checked) : h('span', { class: 'tag warn' }, __('No link stored'))),
        l.url ? null : h('p', { class: 'small' }, ext('https://duckduckgo.com/?q=' + encodeURIComponent(l.name + ' official site'),
          [__('Search the web for this lab'), ' ', icon('external', 14)], { 'aria-label': __('Search the web for {0} (opens in a new tab)', l.name) })))) : [emptyState(__('No lab matches those filters.'))]));
    };
    cSel.addEventListener('change', () => { lf.cost = cSel.value; paint(); });
    lSel.addEventListener('change', () => { lf.level = lSel.value; paint(); });
    const noLink = D.labs.filter((l) => !l.url).length;
    body.replaceChildren(
      safetyLine(),
      noLink ? note('info', __('{0} of {1} labs have no stored link because their addresses were not re-checked on {2}. Each of those has a web-search link instead, so you can find the official page yourself.', noLink, D.labs.length, fmtDate(D.meta.asOf))) : null,
      h('div', { class: 'filters' }, h('label', { class: 'field', for: 'lab-cost' }, __('Cost'), cSel), h('label', { class: 'field', for: 'lab-level' }, __('Level'), lSel)),
      list);
    paint();
  }
  function drawTools() {
    body.replaceChildren(
      safetyLine(),
      tblWrap('tbl-wrap flat', __('Tools table'), h('table', { class: 'tbl stackable' },
        h('thead', null, h('tr', null, [__('Purpose'), __('Tools'), __('Cost'), __('Use')].map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', null, D.tools.map((t) => h('tr', null,
          h('td', { 'data-label': __('Purpose') }, t.purpose),
          h('td', { 'data-label': __('Tools') }, t.tools.join(', ')),
          h('td', { 'data-label': __('Cost') }, stored(t.cost)),
          h('td', { 'data-label': __('Use') }, t.use)))))));
  }
  function drawResources() {
    const kinds = Array.from(new Set(D.resources.map((x) => x.kind)));
    body.replaceChildren(...kinds.map((k) => h('section', { class: 'section res-group' },
      secHead(KIND_LABEL[k] ? __(KIND_LABEL[k]) : k, plural(D.resources.filter((x) => x.kind === k).length, 'link')),
      h('ul', { class: 'link-list' }, D.resources.filter((x) => x.kind === k).map((x) => h('li', null,
        h('span', null, ext(x.url, [x.name, ' ', icon('external', 14)])),
        h('span', { class: 'small muted' }, x.note),
        h('span', null, x.verified ? h('span', { class: 'tag ok' }, icon('check', 13), __('Checked {0}', fmtDate(D.meta.asOf))) : h('span', { class: 'tag warn' }, __('Not re-checked')))))))));
  }
  function paintTab() {
    for (const b of $$('button', seg)) b.setAttribute('aria-pressed', b.dataset.tab === tab ? 'true' : 'false');
    ({ labs: drawLabs, tools: drawTools, resources: drawResources })[tab]();
  }
  for (const [id, label] of [['labs', _N('Labs')], ['tools', _N('Tools')], ['resources', _N('Resources')]]) {
    seg.append(h('button', { type: 'button', 'data-tab': id, 'aria-pressed': 'false', onclick: () => { tab = id; paintTab(); } }, __(label)));
  }
  root.append(
    viewHead(__('Labs, tools and resources'), __('Places to practise legally, the tools that go with each kind of testing, and the official sources behind this hub. Links open in a new tab.'), __('Library')),
    seg, body);
  paintTab();
  return root;
};
