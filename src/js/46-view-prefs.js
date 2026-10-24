/* ===== 46 views: settings and data control ===== */
function progressSummary(doc) {
  doc = doc || S;
  return {
    cards: Object.keys(doc.cards).length,
    answers: sum(Object.values(doc.questions).map((x) => x.seen)),
    modules: Object.values(doc.modules).filter((x) => x.done).length,
    gates: Object.values(doc.roadmap.gates).filter((x) => x.done).length,
    exams: doc.exams.length,
    tests: Object.values(doc.testcases).filter((x) => x.done).length
  };
}
function describeSummary(p) {
  return __('{0} studied, {1}, {2} done, {3} passed, {4}, {5} ticked',
    plural(p.cards, 'card'), plural(p.answers, 'quiz answer'), plural(p.modules, 'module'), plural(p.gates, 'gate'), plural(p.exams, 'exam attempt'), plural(p.tests, 'test case'));
}
function resetProgress() {
  const now = Date.now();
  const keep = S.settings;
  const d = defaultProgress();
  d.settings = Object.assign({}, keep, { t: now });
  d.resetAt = now; d.updated = now; d.examT = now;
  S = d;
  touch();
  refreshBadges();
}

/* How much of the dataset is available in the chosen language, as one readable line. */
function translationLine() {
  const c = LOC.cover;
  if (!c) return '';
  const part = (k, one) => { const v = c[k] || [0, 0]; return __('{0} of {1}', v[0], plural(v[1], one)); };
  return [part('questions', 'question'), part('flashcards', 'flashcard'), part('glossary', 'glossary term'), part('modules', 'module'), part('testcases', 'test case'), part('reference', 'reference table')].join(', ');
}

VIEWS.prefs = function () {
  const root = h('div', { class: 'view' });
  root.append(viewHead(__('Settings'), __('Appearance, your progress data, and what is in the dataset behind this app.'), __('App')));

  /* appearance and language */
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': __('Theme') });
  const paintTheme = () => { for (const b of $$('button', seg)) b.setAttribute('aria-pressed', b.dataset.theme === S.settings.theme ? 'true' : 'false'); };
  for (const [id, label] of [['system', __('Match my device')], ['light', __('Light')], ['dark', __('Dark')]]) {
    seg.append(h('button', { type: 'button', 'data-theme': id, 'aria-pressed': 'false', onclick: () => { S.settings.theme = id; S.settings.t = Date.now(); touch(); applyTheme(); paintTheme(); refreshExport(); } }, label));
  }
  paintTheme();
  const langSel = h('select', { id: 'lang-select' },
    h('option', { value: 'auto' }, __('Automatic (device language)')),
    LANGS.map((l) => h('option', { value: l.id }, l.name)));
  langSel.value = S.settings.lang;
  langSel.addEventListener('change', () => {
    changeLanguage(langSel.value);
    const again = $('#lang-select');
    if (again) again.focus({ preventScroll: true });
  });
  const langInfo = LOC.lang === 'en' ? null : h('div', { class: 'stack' },
    h('p', { class: 'small' }, __('Translated so far: {0}. Anything not translated is shown in English.', translationLine())),
    h('p', { class: 'small muted' }, __('The translations were prepared with AI assistance and have not been reviewed by a native-speaking security tester. The English text is the reference for ISTQB exam preparation.')));
  root.append(h('section', { class: 'section' }, secHead(__('Appearance and language')),
    h('div', { class: 'stack' }, h('div', null, seg), h('label', { class: 'field', for: 'lang-select', style: { maxWidth: '320px' } }, __('Language'), langSel), langInfo)));

  /* progress data */
  const exportBox = h('textarea', { id: 'export-text', readonly: true, rows: '8', 'aria-label': __('Exported progress as JSON'), spellcheck: 'false' });
  const refreshExport = () => { exportBox.value = JSON.stringify(S, null, 1); };
  refreshExport();
  const sum1 = describeSummary(progressSummary());
  const importBox = h('textarea', { id: 'import-text', rows: '6', placeholder: __('Paste exported progress here, or choose a file'), 'aria-label': __('Progress JSON to import'), spellcheck: 'false' });
  const fileIn = h('input', { type: 'file', id: 'import-file', accept: '.json,application/json' });
  const msg = h('div', { class: 'stack', 'aria-live': 'polite' });
  let pending = null;
  const say = (kind, ...lines) => { msg.replaceChildren(note(kind, lines.map((l) => h('div', null, l)))); };

  function check() {
    pending = null;
    const text = importBox.value.trim();
    if (!text) { say('bad', __('Paste progress data or choose a file first.')); return; }
    if (text.length > MAX_IMPORT) { say('bad', __('The data is larger than 1 MB, so it was not read.')); return; }
    let raw;
    try { raw = JSON.parse(text); } catch (e) { say('bad', __('This is not valid JSON, so nothing was imported.')); return; }
    const res = normalizeProgress(raw);
    if (res.fatal || res.problems.length) {
      say('bad', __('Nothing was imported because the data does not have the expected shape:'), ...res.problems.slice(0, 5).map((p) => '- ' + p));
      return;
    }
    pending = res.doc;
    const yes = h('button', { type: 'button', class: 'btn danger sm', onclick: apply }, __('Replace my progress'));
    const no = h('button', { type: 'button', class: 'btn sm', onclick: () => { pending = null; msg.replaceChildren(); } }, __('Cancel'));
    msg.replaceChildren(note('info', h('div', null, __('This data contains {0}. Importing replaces your current progress.', describeSummary(progressSummary(pending))))), h('div', { class: 'row' }, yes, no));
    yes.focus();
  }
  function apply() {
    if (!pending) return;
    const now = Date.now();
    const doc = pending;
    pending = null;
    doc.resetAt = now - 1;
    stampAll(doc, now);
    S = doc;
    touch();
    applyTheme();
    applyLanguage();
    buildNav();
    refreshNotices();
    toast(__('Progress imported'));
    go('home');
  }
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files && fileIn.files[0];
    if (!f) return;
    if (f.size > MAX_IMPORT) { say('bad', __('That file is larger than 1 MB, so it was not read.')); return; }
    try { importBox.value = await f.text(); check(); } catch (e) { say('bad', __('The file could not be read.')); }
  });

  root.append(
    h('section', { class: 'section' },
      secHead(__('Your progress'), __('Stored with this app, not sent anywhere else')),
      h('p', { class: 'small' }, sum1 + '.'),
      h('div', { class: 'panel stack' },
        h('h3', { class: 'title' }, __('Export')),
        h('p', { class: 'small muted prose' }, __('Copy this text and keep it somewhere safe. It is your whole progress, including settings.')),
        exportBox,
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn', onclick: () => { refreshExport(); copyText(exportBox.value, exportBox); } }, icon('copy', 18), __('Copy progress')),
          saveButton('security-hub-progress.json', () => JSON.stringify(S, null, 1), __('Save as file')))),
      h('div', { class: 'panel stack' },
        h('h3', { class: 'title' }, __('Import')),
        h('p', { class: 'small muted prose' }, __('Importing replaces what you have now. The data is checked first and rejected with a reason if it is malformed or larger than 1 MB.')),
        importBox,
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: check }, __('Check and import')),
          h('label', { class: 'btn', for: 'import-file' }, __('Choose a file'), fileIn)),
        msg),
      h('div', { class: 'panel stack' },
        h('h3', { class: 'title' }, __('Reset')),
        h('p', { class: 'small muted prose' }, __('Clears cards, answers, module progress, gates, exam history and test-case ticks. Your appearance and plan settings stay.')),
        armedButton({ label: __('Reset my progress'), ask: __('Erase all progress? This cannot be undone.'), yes: __('Yes, erase it'), onYes: () => { resetProgress(); toast(__('Progress reset')); go('home'); } }))));
  /* the hidden file input sits inside its label, so it stays keyboard reachable */
  fileIn.classList.add('sr-only');

  /* progress report */
  const reportBox = h('textarea', { id: 'report-text', readonly: true, rows: '10', 'aria-label': __('Progress report as Markdown text'), spellcheck: 'false' });
  const refreshReport = () => { reportBox.value = buildReport(); };
  refreshReport();
  root.append(h('section', { class: 'section' }, secHead(__('Progress report'), __('A summary to paste into your notes or share with a mentor')),
    h('div', { class: 'panel stack' },
      h('p', { class: 'small muted prose' }, __('It lists what you have studied and how you did, with the evidence behind each figure. It holds no personal data and is built on this device only.')),
      reportBox,
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn', onclick: () => { refreshReport(); copyText(reportBox.value, reportBox); } }, icon('copy', 18), __('Copy report')),
        saveButton('security-hub-report.md', () => buildReport(), __('Save as file'))))));

  /* storage and sync */
  const syncText = () => {
    if (sync.state === 'on') return __('On. A private copy of your progress is kept with this app for your account, and merged when you open it on another device.');
    if (sync.state === 'connecting') return __('Connecting.');
    if (sync.state === 'error') return /invalid_argument|not_granted/.test(sync.err) ? __('Off. You may have view-only access to this app, so progress stays in this browser.') : __('Temporarily unavailable ({0}). Progress is still saved in this browser and will sync later.', sync.err);
    return __('Off. Sync is not available in this view, so progress stays in this browser.');
  };
  root.append(h('section', { class: 'section' }, secHead(__('Where progress is kept')),
    h('dl', { class: 'kv' },
      h('dt', null, __('This browser')), h('dd', null, store.ok ? __('Saved') : __('Not saving: browser storage is blocked or full')),
      h('dt', null, __('Sync')), h('dd', null, syncText()),
      h('dt', null, __('Last change')), h('dd', null, S.updated ? fmtStamp(new Date(S.updated).toISOString()) : __('Nothing saved yet'))),
    store.badBlob ? h('div', { class: 'panel stack' }, h('p', { class: 'small' }, __('A progress record that could not be read was kept so you can recover it.')),
      h('textarea', { readonly: true, rows: '5', 'aria-label': __('Unreadable saved data'), value: store.badBlob.slice(0, 200000) })) : null));

  /* shortcuts */
  const sc = (k, t) => [h('span', { class: 'kbd' }, k), h('span', null, t)];
  root.append(h('section', { class: 'section' }, secHead(__('Keyboard shortcuts')),
    h('div', { class: 'shortcuts' },
      sc(__('Space / Enter'), __('Show the flashcard answer')), sc(__('Left / Right'), __('Flashcard: missed / knew it')), sc(__('Esc'), __('End a flashcard session')),
      sc(__('1 to 4 or A to D'), __('Choose an answer in the quiz and the exam')), sc(__('Enter'), __('Next question after a quiz answer')),
      sc(__('N / P / F'), __('Exam: next, previous, flag for review')))));

  /* about */
  const c = D.meta.counts;
  root.append(h('section', { class: 'section' }, secHead(__('About the data')),
    h('dl', { class: 'kv' },
      h('dt', null, __('Dataset')), h('dd', null, __('{0}, version {1}', D.meta.title, D.meta.datasetVersion)),
      h('dt', null, __('As of')), h('dd', null, fmtDate(D.meta.asOf)),
      h('dt', null, __('Contents')), h('dd', null, [plural(c.topics, 'topic'), plural(c.modules, 'module'), plural(c.flashcards, 'flashcard'), plural(c.questions, 'question'), plural(c.glossary, 'glossary term'), plural(c.testcases, 'test case'), plural(c.labs, 'lab'), plural(c.referenceTables, 'reference table')].join(', ')),
      h('dt', null, __('Hub document')), h('dd', null, ext(D.meta.hubUrl, [__('Open the hub document'), icon('external', 14)])),
      h('dt', null, __('Spelling')), h('dd', null, __('British English. "Authorization" means access control; "authorisation" means permission to test.'))),
    h('p', { class: 'small muted prose' }, D.meta.notice),
    h('p', { class: 'small muted prose' }, __('Items marked "Check this" rest on facts that were not re-checked against a primary source on the as-of date. Confirm exam details on the ISTQB website before you book.'))));
  return root;
};
