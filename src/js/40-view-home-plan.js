/* ===== 40 views: home and roadmap ===== */
function navLink(tok, props, ...kids) {
  const a = h('a', Object.assign({ href: '#' + tok }, props || {}), ...kids);
  a.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    go(tok);
  });
  return a;
}
const DIFF_LABEL = { 1: _N('Basic'), 2: _N('Standard'), 3: _N('Advanced') };

function nextStep(m) {
  if (S.exam) {
    const run = S.exam, left = run.deadline - Date.now(), done = run.answers.filter((a) => a >= 0).length;
    return {
      title: __('Resume your {0} mock exam', examShort(run.profile)),
      reason: left > 0 ? __('{0} of {1} answered, {2} left on the clock.', done, run.ids.length, mmss(left)) : __('Time is up. Open the exam to see your result.'),
      cta: __('Resume exam'), to: 'exam'
    };
  }
  const dc = dueCounts();
  if (dc.reviews > 0) {
    return {
      title: __('Review {0} due today', plural(dc.reviews, 'card')),
      reason: __('Short, regular reviews are what make spaced repetition work.') + (dc.fresh ? ' ' + __('{0} are also waiting.', plural(dc.fresh, 'new card')) : ''),
      cta: __('Start reviewing'), to: 'cards'
    };
  }
  const wk = weakestTopic(m);
  if (wk) {
    return {
      title: __('Strengthen {0}', topicName(wk.id)),
      reason: __('Your latest answer was right for {0}% of the {1} you have tried in this topic.', pct(wk.recent), plural(wk.distinct, 'question')) + ' ' + __('Read the module, then practise this topic.'),
      cta: __('Practise this topic'), to: 'quiz', params: { topic: wk.id }
    };
  }
  const mod = firstIncompleteModule();
  if (mod) return { title: __('Read: {0}', mod.title), reason: __('The next unfinished module, about {0} of study.', hoursLabel(mod.estimatedMinutes)), cta: __('Open module'), to: mod.id };
  const g = nextGate();
  if (g) return { title: __('Pass the gate for stage {0}: {1}', g.id, g.name), reason: g.gate, cta: __('Open the roadmap'), to: 'plan' };
  return { title: __('Every module and gate is done'), reason: __('Keep your cards and quizzes going, and take a mock exam to test yourself under time pressure.'), cta: __('Take a mock exam'), to: 'exam' };
}

VIEWS.home = function () {
  const root = h('div', { class: 'view' });
  const fresh = isNewLearner();
  root.append(viewHead(fresh ? __('Welcome') : __('Your study hub'),
    __('A self-paced route from QA to security testing, with ISTQB CT-STE and CT-SEC preparation, spaced-repetition flashcards, practice questions and a timed exam simulator.'),
    __('Security testing and cybersecurity')));
  if (fresh) { root.append(...homeWelcome()); return root; }
  const m = allTopicStats();
  root.append(homeNext(m), homeStats(m), homeTracks(m), homeTopics(m), homeReadiness(m), homeActivity());
  return root;
};

const WELCOME_TILES = [['flashcards', _N('Flashcards')], ['questions', _N('Practice questions')], ['glossary', _N('Glossary terms')], ['testcases', _N('Test cases')], ['labs', _N('Labs')], ['referenceTables', _N('Reference tables')]];
function homeWelcome() {
  const trackCards = D.tracks.map((t) => {
    const mins = sum(t.topics.map((id) => (IX.moduleByTopic.get(id) || { estimatedMinutes: 0 }).estimatedMinutes));
    return h('div', { class: 'panel track-card' },
      h('div', { class: 'tc-name' }, t.name),
      h('p', { class: 'small muted' }, t.description),
      h('p', { class: 'tiny muted' }, __('{0}, about {1} of module study', plural(t.topics.length, 'topic'), hoursLabel(mins))),
      h('div', { class: 'chips' }, t.topics.slice(0, 4).map((id) => navLink(IX.moduleByTopic.get(id).id, { class: 'tag accent' }, topicName(id)))));
  });
  const c = D.meta.counts;
  const tiles = WELCOME_TILES.map(([k, l]) => h('div', { class: 'stat' }, h('div', { class: 'n' }, String(c[k])), h('div', { class: 'l' }, __(l))));
  return [
    h('section', { class: 'panel raised hero' },
      h('h2', null, __('Start with the map, then the basics.')),
      h('p', { class: 'prose' }, sync.state === 'on'
        ? __('Four study tracks share {0} topics. Pick the track that matches your goal, or follow the roadmap from stage 0. Progress, due dates and scores stay on this device and in your private space for this app.', D.topics.length)
        : __('Four study tracks share {0} topics. Pick the track that matches your goal, or follow the roadmap from stage 0. Progress, due dates and scores stay on this device.', D.topics.length)),
      h('div', { class: 'row' },
        navLink('mod-foundations', { class: 'btn primary' }, __('Start with orientation'), icon('next', 18)),
        navLink('plan', { class: 'btn' }, __('See the roadmap')))),
    h('section', { class: 'section' }, secHead(__('Four tracks'), __('They overlap, so nothing is learned twice')), h('div', { class: 'grid2' }, trackCards)),
    h('section', { class: 'section' }, secHead(__('What is inside'), __('Dataset {0}, as of {1}', D.meta.datasetVersion, fmtDate(D.meta.asOf))), h('div', { class: 'grid3' }, tiles),
      h('p', { class: 'small muted prose' }, D.meta.notice))
  ];
}

function homeNext(m) {
  const n = nextStep(m);
  return h('section', { class: 'panel next raised', 'aria-labelledby': 'next-h' },
    h('div', { class: 'stack' },
      h('p', { class: 'kicker' }, __('Next step')),
      h('h2', { id: 'next-h' }, n.title),
      h('p', { class: 'small muted prose' }, n.reason)),
    h('button', { type: 'button', class: 'btn primary', onclick: () => go(n.to, n.params) }, n.cta, icon('next', 18)));
}

function homeStats(m) {
  const dc = dueCounts(), qt = quizTotals(), st = streak();
  const tile = (n, l, s) => h('div', { class: 'stat' }, h('div', { class: 'n' }, n), h('div', { class: 'l' }, l), h('div', { class: 's' }, s));
  return h('section', { class: 'grid4', 'aria-label': __('Summary') },
    tile(String(dc.reviews), __('Cards due today'), __('{0} waiting', plural(dc.fresh, 'new card'))),
    tile(pct(overallMastery(m)) + '%', __('Mastery'), __('across {0} topics', D.topics.length)),
    tile(qt.acc === null ? __('n/a') : pct(qt.acc) + '%', __('Quiz accuracy'), __('{0} so far', plural(qt.answered, 'answer'))),
    tile(String(st), __('Study streak'), st ? pluralWord(st, 'day') + ' ' + __('in a row') : __('study today to start one')));
}

function homeTracks(m) {
  return h('section', { class: 'section' },
    secHead(__('Progress by track'), __('Mean mastery of each track’s topics')),
    h('div', null, D.tracks.map((t) => h('div', { class: 'track-row' },
      h('div', { class: 'row between' }, h('strong', null, t.name), h('span', { class: 'tiny muted' }, plural(t.topics.length, 'topic'))),
      meterEl(trackProgress(t, m), __('{0} progress', t.name))))));
}

function homeTopics(m) {
  const weak = weakestTopic(m);
  return h('section', { class: 'section' },
    secHead(__('Mastery by topic'), __('Card boxes, plus the latest result of each question once you have tried {0}', plural(MIN_EVIDENCE, 'question'))),
    h('div', { class: 'topic-grid' }, D.topics.map((t) => {
      const s = m.get(t.id);
      const detail = __('{0} of {1} cards seen', s.seenCards, s.cards) +
        (s.distinct ? '; ' + __('{0} of {1} questions tried, {2}% right last time', s.distinct, s.qTotal, pct(s.recent)) + (s.enough ? '' : ' ' + __('(needs {0} to count)', plural(MIN_EVIDENCE, 'question'))) : '');
      return h('div', { class: 'topic-row' },
        h('div', { class: 'row between' }, navLink(IX.moduleByTopic.get(t.id).id, null, t.name), weak && weak.id === t.id ? tagEl(__('Weakest'), 'bad') : null),
        meterEl(s.mastery, __('{0} mastery', t.name)),
        h('span', { class: 'tiny muted' }, detail));
    })));
}

const READY_LABEL = { early: _N('Early'), building: _N('Building'), ready: _N('Ready to try a mock exam') };
function homeReadiness(m) {
  const r = readiness(m);
  return h('section', { class: 'section' },
    secHead(__('Exam readiness'), __('Based on the ISTQB track topics')),
    h('div', { class: 'panel stack' },
      h('div', { class: 'row between' }, h('strong', null, 'CT-STE and CT-SEC'), tagEl(__(READY_LABEL[r.band]), r.band === 'ready' ? 'ok' : (r.band === 'building' ? 'accent' : 'warn'))),
      meterEl(r.value, __('Exam readiness')),
      h('p', { class: 'tiny muted' }, __('A self-study indicator, not a prediction. Below 50% is early, 50 to 70% is building, and 70% or more is a good time for a mock exam.')),
      h('div', { class: 'row' }, navLink('exam', { class: 'btn sm' }, __('Open the exam simulator')))));
}

function homeActivity() {
  const days = lastDays(14);
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = sum(days.map((d) => d.count));
  const wd = (ds) => parseYmd(ds).toLocaleDateString(LOC.tag, { weekday: 'narrow' });
  return h('section', { class: 'section' },
    secHead(__('Last 14 days'), plural(total, 'study action')),
    h('div', { class: 'panel' },
      h('div', { class: 'activity', role: 'img', 'aria-label': __('Study actions per day over the last 14 days, {0} in total', total) },
        days.map((d) => h('div', { class: 'day' },
          h('span', { class: 'tiny tnum', 'aria-hidden': 'true' }, d.count ? String(d.count) : ''),
          h('div', { class: 'col' + (d.count ? '' : ' zero'), style: { height: Math.max(2, Math.round(d.count / max * 56)) + 'px' } }),
          h('span', { class: 'd', 'aria-hidden': 'true' }, wd(d.date)))))));
}

/* ---------- roadmap ---------- */
VIEWS.plan = function () {
  const root = h('div', { class: 'view' });
  root.append(viewHead(__('Roadmap'), __('Six stages from orientation to professional proof. Set your weekly hours and a start date to project when each stage could finish.'), __('Learning plan')));

  const hpw = h('input', { type: 'number', id: 'plan-hours', min: '1', max: '40', step: '1', inputmode: 'numeric', value: String(S.settings.hoursPerWeek), 'aria-describedby': 'plan-err' });
  const start = h('input', { type: 'date', id: 'plan-start', value: S.settings.startDate, 'aria-describedby': 'plan-err' });
  const err = h('p', { class: 'err', id: 'plan-err', role: 'alert', hidden: true });
  const summary = h('p', { class: 'small' });
  const list = h('div', null);
  const gateCount = h('span', { class: 'aside' });

  function plan() {
    let cum = 0;
    const hours = S.settings.hoursPerWeek, st = S.settings.startDate;
    return D.roadmap.stages.map((s) => {
      if (s.hours === null) return { s, ongoing: true };
      cum += s.hours;
      const weeks = cum / hours;
      return { s, cum, week: Math.ceil(weeks), finish: addDays(st, Math.round(weeks * 7)) };
    });
  }
  function drawSummary() {
    const total = D.roadmap.totalHours, weeks = total / S.settings.hoursPerWeek;
    const years = weeks >= 52 ? ', ' + __('about {0} years', num1(weeks / 52)) : '';
    const last = plan().filter((p) => !p.ongoing).pop();
    summary.textContent = __('{0} hours at {1} h a week is {2} weeks', total, S.settings.hoursPerWeek, num1(weeks)) + years + '. ' +
      __('Stages 0 to 4 would finish on {0}.', fmtDate(last.finish)) + ' ' + D.roadmap.totalHoursNote;
  }
  function drawGateCount() {
    const n = D.roadmap.stages.filter((s) => S.roadmap.gates[String(s.id)] && S.roadmap.gates[String(s.id)].done).length;
    gateCount.textContent = __('{0} of {1} gates passed', n, D.roadmap.stages.length);
  }
  function drawStages() {
    list.replaceChildren(...plan().map((p) => {
      const s = p.s, gate = S.roadmap.gates[String(s.id)], done = !!(gate && gate.done);
      const box = h('input', { type: 'checkbox', id: 'gate-' + s.id, checked: done });
      const row = h('div', { class: 'stage' + (done ? ' done' : '') });
      box.addEventListener('change', () => {
        S.roadmap.gates[String(s.id)] = { done: box.checked, t: Date.now(), at: null };
        touch();
        row.classList.toggle('done', box.checked);
        drawGateCount();
        announce(box.checked ? __('Stage {0} gate marked as passed', s.id) : __('Stage {0} gate marked as not passed', s.id));
      });
      row.append(
        h('div', { class: 'num', 'aria-hidden': 'true' }, String(s.id)),
        h('div', { class: 'stack' },
          h('h3', null, __('Stage {0}: {1}', s.id, s.name)),
          h('div', { class: 'meta' },
            tagEl(s.hours === null ? __('Ongoing') : __('{0} h', s.hours)),
            p.ongoing ? h('span', null, __('No end date')) : h('span', { class: 'tnum' }, __('Week {0}, finish by {1}', p.week, fmtDate(p.finish)))),
          h('p', { class: 'prose' }, s.focus),
          h('label', { class: 'check', for: 'gate-' + s.id }, box, h('span', null, h('strong', null, __('Gate:') + ' '), s.gate)),
          h('div', { class: 'chips' }, s.topics.map((id) => navLink(IX.moduleByTopic.get(id).id, { class: 'tag accent' }, topicName(id))))));
      return row;
    }));
  }
  function redraw() { drawSummary(); drawStages(); drawGateCount(); }

  hpw.addEventListener('input', () => {
    const raw = hpw.value.trim(), n = Number(raw);
    if (raw === '' || !Number.isInteger(n) || n < 1 || n > 40) { err.textContent = __('Enter a whole number of hours from 1 to 40.'); err.hidden = false; return; }
    err.hidden = true;
    if (n !== S.settings.hoursPerWeek) { S.settings.hoursPerWeek = n; S.settings.t = Date.now(); touch(); }
    redraw();
  });
  start.addEventListener('input', () => {
    if (!isYmd(start.value)) { err.textContent = __('Pick a valid start date between 2000 and 2100.'); err.hidden = false; return; }
    err.hidden = true;
    if (start.value !== S.settings.startDate) { S.settings.startDate = start.value; S.settings.t = Date.now(); touch(); }
    redraw();
  });

  root.append(
    h('section', { class: 'panel stack' },
      h('div', { class: 'filters' },
        h('label', { class: 'field', for: 'plan-hours' }, __('Hours you can study per week'), hpw),
        h('label', { class: 'field', for: 'plan-start' }, __('Start date'), start)),
      err, summary),
    h('section', { class: 'section' }, h('h2', { class: 'sec' }, h('span', null, __('Stages')), gateCount), list));

  const chosen = S.roadmap.specialisation ? S.roadmap.specialisation.id : null;
  const specs = D.roadmap.specialisations.map((sp) => {
    const r = h('input', { type: 'radio', name: 'spec', value: sp.id, checked: chosen === sp.id });
    r.addEventListener('change', () => { S.roadmap.specialisation = { id: sp.id, t: Date.now() }; touch(); announce(__('{0} chosen as your specialisation', sp.name)); });
    return h('label', { class: 'spec' }, r, h('span', null,
      h('span', { class: 't' }, sp.name),
      h('span', { class: 'small muted', style: { display: 'block' } }, __('Portfolio project: {0}', sp.portfolioProject)),
      h('span', { class: 'tiny muted', style: { display: 'block' } }, __('Topics: {0}', sp.topics.map(topicName).join(', ')))));
  });
  const clear = h('button', { type: 'button', class: 'btn quiet sm', onclick: () => { S.roadmap.specialisation = null; touch(); for (const r of $$('input[name=spec]', root)) r.checked = false; } }, __('Clear my choice'));
  root.append(h('section', { class: 'section' }, secHead(__('Specialisation'), __('Choose one after stage 3')), h('div', { class: 'stack', role: 'radiogroup', 'aria-label': __('Specialisation') }, specs), h('div', null, clear)));

  const rows = D.certifications.map((c) => h('tr', null,
    h('td', { 'data-label': __('Certificate') }, c.name, c.verify ? h('div', null, tagEl(__('Not re-checked'), 'warn')) : null),
    h('td', { 'data-label': __('Stage'), class: 'nowrap' }, c.stage),
    h('td', { 'data-label': __('Fits') }, c.fits),
    h('td', { 'data-label': __('Notes') }, c.notes)));
  root.append(h('section', { class: 'section' }, secHead(__('Certifications'), __('Entries marked "Not re-checked" need a look at the vendor page')),
    tblWrap('tbl-wrap flat', __('Certifications table'), h('table', { class: 'tbl stackable' },
      h('thead', null, h('tr', null, [__('Certificate'), __('Stage'), __('Fits'), __('Notes')].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', null, rows)))));
  redraw();
  return root;
};
