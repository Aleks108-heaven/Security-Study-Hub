/* ===== 41 views: modules ===== */
function moduleDone(id) { return !!(S.modules[id] && S.modules[id].done); }

VIEWS.modules = function (r) {
  return r.module ? moduleDetail(IX.module.get(r.module)) : moduleList();
};

function moduleList() {
  const m = allTopicStats();
  const done = D.modules.filter((x) => moduleDone(x.id)).length;
  const root = h('div', { class: 'view' });
  root.append(viewHead(__('Modules'), __('One short module per topic: what to learn, the key points, and practice tasks. Each links to its flashcards, questions and glossary terms.'), __('Study material')));
  root.append(h('section', { class: 'section' },
    secHead(plural(D.modules.length, 'module'), __('{0} done', done)),
    h('div', { class: 'mod-grid' }, D.modules.map((mod) => navLink(mod.id, { class: 'mod-card' },
      h('div', { class: 'row between' },
        h('span', { class: 'id' }, __('Hub section {0}', mod.section)),
        moduleDone(mod.id) ? h('span', { class: 'tag ok' }, icon('check', 13), __('Done')) : null),
      h('span', { class: 't' }, mod.title),
      h('span', { class: 'sum' }, mod.summary),
      h('div', { class: 'tiny muted' }, __('{0} of study', hoursLabel(mod.estimatedMinutes))),
      meterEl(m.get(mod.topic).mastery, __('{0} mastery', mod.title)))))));
  return root;
}

function toggleModule(id) {
  const r = S.modules[id];
  const done = !(r && r.done);
  S.modules[id] = { done, at: done ? new Date().toISOString() : (r ? r.at : null), t: Date.now() };
  if (done) bumpActivity();
  touch();
  return done;
}

function moduleDetail(mod) {
  const idx = D.modules.findIndex((x) => x.id === mod.id);
  const prev = D.modules[idx - 1], next = D.modules[idx + 1];
  const nCards = (IX.cardsByTopic.get(mod.topic) || []).length, nQ = (IX.qByTopic.get(mod.topic) || []).length, nG = (IX.termsByTopic.get(mod.topic) || []).length;
  const root = h('div', { class: 'view' });
  const toggle = h('button', { type: 'button', class: 'btn', 'aria-pressed': moduleDone(mod.id) ? 'true' : 'false' });
  const paint = () => {
    const d = moduleDone(mod.id);
    toggle.setAttribute('aria-pressed', d ? 'true' : 'false');
    toggle.className = 'btn' + (d ? '' : ' primary');
    toggle.replaceChildren(icon('check', 18), d ? __('Completed (click to undo)') : __('Mark as complete'));
  };
  toggle.addEventListener('click', () => { const d = toggleModule(mod.id); paint(); announce(d ? __('{0} marked as complete', mod.title) : __('{0} marked as not complete', mod.title)); });
  paint();

  root.append(
    h('div', null, navLink('modules', { class: 'btn quiet sm' }, icon('back', 16), __('All modules'))),
    viewHead(mod.title, mod.summary, __('Hub section {0}', mod.section) + '  /  ' + __('about {0}', hoursLabel(mod.estimatedMinutes))),
    h('div', { class: 'row' },
      toggle,
      h('button', { type: 'button', class: 'btn', onclick: () => go('cards', { topic: mod.topic }) }, plural(nCards, 'flashcard')),
      h('button', { type: 'button', class: 'btn', onclick: () => go('quiz', { topic: mod.topic }) }, __('Practise {0}', plural(nQ, 'question'))),
      h('button', { type: 'button', class: 'btn', onclick: () => go('glossary', { topic: mod.topic }) }, plural(nG, 'glossary term'))),
    h('section', { class: 'section' }, secHead(__('What you should be able to do'), __('K1 recall, K2 understand, K3 apply, K4 analyse')),
      h('div', null, mod.objectives.map((o) => h('div', { class: 'obj' }, kBadge(o.k), h('span', null, o.text))))),
    h('section', { class: 'section' }, secHead(__('Key points')),
      h('ul', { class: 'points prose' }, mod.keyPoints.map((p) => h('li', null, p)))),
    h('section', { class: 'section' }, secHead(__('Practice tasks'), __('Do these in a lab you own')),
      h('ul', { class: 'points prose' }, mod.practice.map((p) => h('li', null, p))),
      safetyLine()),
    h('section', { class: 'section' }, secHead(__('Go deeper')),
      h('p', { class: 'small' }, __('The hub document has the full text for this topic in section {0}.', mod.section) + ' ',
        ext(D.meta.hubUrl, [__('Open the hub document'), icon('external', 14)]))),
    h('div', { class: 'pager' },
      prev ? navLink(prev.id, { class: 'btn' }, icon('back', 16), prev.title) : h('span'),
      next ? navLink(next.id, { class: 'btn' }, next.title, icon('next', 16)) : h('span')));
  return root;
}
