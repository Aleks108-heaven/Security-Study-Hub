/* ===== 44 views: exam simulator ===== */
let expiredNotice = false;   // set at boot when an exam ran out of time while the app was closed

VIEWS.exam = function () {
  const root = h('div', { class: 'view' });
  let timer = 0, tickFn = null;
  const stop = () => { if (timer) { clearInterval(timer); timer = 0; } };
  const onVis = () => { if (document.visibilityState === 'visible' && tickFn) tickFn(); };
  document.addEventListener('visibilitychange', onVis);
  onLeave(stop);
  onLeave(() => document.removeEventListener('visibilitychange', onVis));
  setKeys(() => false);

  function ensureVisible(el) {
    const top = el.getBoundingClientRect().top;
    if (top < 90 || top > window.innerHeight * 0.6) window.scrollTo({ top: Math.max(0, top + window.scrollY - 100) });
  }

  /* ---------- lobby ---------- */
  let scope = 'all';
  function lobby() {
    stop(); tickFn = null; setKeys(() => false);
    const extra = h('input', { type: 'checkbox', id: 'exam-extra', checked: S.settings.extraTime });
    const profiles = h('div', { class: 'grid2' });
    const istqb = IX.track.get('istqb');
    const scopeSel = h('select', { id: 'exam-scope' },
      h('option', { value: 'all' }, __('All {0} topics ({1} questions)', D.topics.length, D.questions.length)),
      istqb ? h('option', { value: 'istqb' }, __('ISTQB track topics only ({0} questions)', examPool('istqb').length)) : null);
    scopeSel.value = scope;
    const drawProfiles = () => {
      profiles.replaceChildren(...Object.keys(D.exams).map((id) => {
        const P = D.exams[id];
        const pool = examPool(scope).length;
        const n = Math.min(P.questions, pool);
        const minutes = Math.round(P.minutes * (extra.checked ? 1.25 : 1));
        const b = h('button', { type: 'button', class: 'btn primary', disabled: !!S.exam || n === 0, onclick: () => begin(id) }, __('Start {0} mock exam', examShort(id)));
        return h('div', { class: 'panel stack' },
          h('h3', { class: 'title' }, P.name),
          h('dl', { class: 'kv' },
            h('dt', null, __('Questions')), h('dd', null, String(n) + (n < P.questions ? ' ' + __('(the bank has fewer than the real exam)') : '')),
            h('dt', null, __('Time')), h('dd', null, plural(minutes, 'minute') + (extra.checked ? ' ' + __('(with 25% extra time)') : '')),
            h('dt', null, __('Pass mark here')), h('dd', null, __('{0} of {1} ({2}%)', passMark(n), n, IX.passPercent)),
            h('dt', null, __('Real exam')), h('dd', null, __('{0} of {1} points', P.passPoints, P.points))),
          h('p', { class: 'tiny muted' }, P.note),
          b);
      }));
    };
    extra.addEventListener('change', () => { S.settings.extraTime = extra.checked; S.settings.t = Date.now(); touch(); drawProfiles(); });
    scopeSel.addEventListener('change', () => { scope = scopeSel.value; drawProfiles(); });
    drawProfiles();

    const parts = [viewHead(__('Exam simulator'), __('Practise under exam conditions: questions spread across the topics, a countdown that survives reloads, and a review with explanations at the end.'), __('Mock exam'))];
    if (expiredNotice) { parts.push(note('warn', __('Your last exam ran out of time while the app was closed. It was submitted automatically. You can review it below.'))); expiredNotice = false; }
    if (S.exam) {
      const R = S.exam, left = R.deadline - Date.now(), done = R.answers.filter((a) => a >= 0).length;
      parts.push(h('section', { class: 'panel raised stack', 'aria-label': __('Exam in progress') },
        h('p', { class: 'kicker' }, __('Exam in progress')),
        h('h2', { class: 'title' }, __('{0}: {1} of {2} answered', examShort(R.profile), done, R.ids.length)),
        h('p', { class: 'small muted' }, __('The clock keeps running while the app is closed. {0} left.', mmss(left))),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn primary', onclick: () => run() }, __('Resume exam'), icon('next', 18)),
          armedButton({ label: __('Abandon this exam'), ask: __('Abandon and lose this attempt?'), yes: __('Yes, abandon'), onYes: () => { S.exam = null; S.examT = Date.now(); touch(); lobby(); } }))));
    }
    parts.push(note('info', __('Scoring is an approximation. This simulator gives one point per question and a {0}% pass mark. The real ISTQB exams weight questions by knowledge level, so use the result as a self-study indicator, not as a prediction.', IX.passPercent)));
    parts.push(h('section', { class: 'section' }, secHead(__('Choose an exam')),
      h('label', { class: 'field', for: 'exam-scope', style: { maxWidth: '420px' } }, __('Questions come from'), scopeSel),
      h('p', { class: 'tiny muted' }, __('The questions are shared out evenly across the topics. Within a topic, the ones you answered longest ago come first, so repeated mock exams work through the bank before a question returns.')),
      h('label', { class: 'check', for: 'exam-extra' }, extra, h('span', null, __('Add 25% extra time (offered by ISTQB to candidates taking the exam in a non-native language)'))),
      profiles));
    if (S.exams.length) {
      const rows = S.exams.slice(-10).reverse().map((e) => h('tr', null,
        h('td', { 'data-label': __('Finished') }, fmtStamp(e.finished)),
        h('td', { 'data-label': __('Exam') }, examShort(e.profile)),
        h('td', { 'data-label': __('Score'), class: 'tnum' }, e.correct + ' / ' + e.total + ' (' + pct(e.correct / e.total) + '%)'),
        h('td', { 'data-label': __('Result') }, tagEl(e.passed ? __('Pass') : __('Below pass mark'), e.passed ? 'ok' : 'bad'))));
      parts.push(h('section', { class: 'section' }, secHead(__('Your attempts'), __('Latest ten')),
        tblWrap('tbl-wrap flat', __('Your attempts table'), h('table', { class: 'tbl stackable' },
          h('thead', null, h('tr', null, [__('Finished'), __('Exam'), __('Score'), __('Result')].map((t) => h('th', { scope: 'col' }, t)))),
          h('tbody', null, rows)))));
    }
    if (S.lastExam) parts.push(h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn', onclick: () => result(S.lastExam, examResult(S.lastExam), { fromLobby: true }) }, __('Review the last exam'))));
    root.replaceChildren(...parts);
  }

  function begin(id) {
    if (S.exam) return;
    const info = startExamRun(id, document.getElementById('exam-extra') ? document.getElementById('exam-extra').checked : S.settings.extraTime, scope);
    run(info.short ? __('Only {0} questions are available for this choice, so all of them are used.', info.n) : null);
  }

  /* ---------- running ---------- */
  function run(startNote) {
    const R = S.exam;
    if (!R) { lobby(); return; }
    const n = R.ids.length;
    const timerEl = h('span', { class: 'timer', id: 'timer', role: 'timer' });
    const infoEl = h('div', { class: 'small tnum' });
    const warn = h('div', { id: 'exam-warn' });
    const qBox = h('section', { class: 'panel raised stack', 'aria-label': __('Question'), tabindex: '-1' });
    const actions = h('div', { class: 'row between' });
    const gridBox = h('section', { class: 'section' });
    const submitBox = h('div', { hidden: true });
    root.replaceChildren(
      h('h1', { class: 'sr-only' }, __('{0} mock exam in progress', examShort(R.profile))),
      h('div', { class: 'examtop' },
        h('div', null, h('div', { class: 'kicker' }, __('{0} mock exam', examShort(R.profile))), infoEl),
        h('div', { class: 'row' }, h('span', { class: 'sr-only' }, __('Time left')), timerEl)),
      warn, qBox, actions, gridBox, submitBox);
    if (startNote) warn.append(note('info', startNote));

    const counts = () => ({ answered: R.answers.filter((a) => a >= 0).length, flagged: sum(R.flags) });
    const persist = () => { S.examT = Date.now(); touch(); };
    const banner = (msg) => { warn.replaceChildren(note('warn', msg)); announce(msg); };

    function drawInfo() {
      const c = counts();
      infoEl.textContent = __('Question {0} of {1}', R.cur + 1, n) + '  /  ' + __('{0} answered', c.answered) + '  /  ' + __('{0} flagged', c.flagged);
    }
    function setAnswer(j) {
      R.answers[R.cur] = j;
      persist();
      $$('.opt', qBox).forEach((lab, k) => {
        lab.classList.toggle('picked', k === j);
        const inp = $('input', lab);
        if (inp) inp.checked = k === j;
      });
      drawGrid(); drawInfo();
    }
    function drawQ() {
      const q = IX.question.get(R.ids[R.cur]);
      const flagTag = h('span', { class: 'tag warn', hidden: !R.flags[R.cur] }, icon('flag', 13), __('Flagged for review'));
      const opts = q.options.map((t, j) => {
        const input = h('input', { type: 'radio', name: 'exam-opt', id: 'xo' + j, value: String(j), class: 'sr-only', checked: R.answers[R.cur] === j });
        input.addEventListener('change', () => setAnswer(j));
        return h('li', null, h('label', { class: 'opt' + (R.answers[R.cur] === j ? ' picked' : ''), for: 'xo' + j },
          input, h('span', { class: 'let', 'aria-hidden': 'true' }, LETTERS[j]), h('span', null, t)));
      });
      qBox.replaceChildren(
        h('div', { class: 'row' }, h('span', { class: 'id' }, 'Q' + (R.cur + 1)), kBadge(q.k), tagEl(topicName(q.topic)), flagTag),
        h('p', { class: 'stem' }, q.stem),
        h('ol', { class: 'opts', 'aria-label': __('Answer options') }, opts));

      const flagBtn = h('button', { type: 'button', class: 'btn', 'aria-pressed': R.flags[R.cur] ? 'true' : 'false' });
      const paintFlag = () => {
        flagBtn.setAttribute('aria-pressed', R.flags[R.cur] ? 'true' : 'false');
        flagBtn.replaceChildren(icon('flag', 18), R.flags[R.cur] ? __('Flagged (remove)') : __('Flag for review'));
        flagTag.hidden = !R.flags[R.cur];
      };
      flagBtn.addEventListener('click', () => { R.flags[R.cur] = R.flags[R.cur] ? 0 : 1; persist(); paintFlag(); drawGrid(); drawInfo(); });
      paintFlag();
      actions.replaceChildren(
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn', disabled: R.cur === 0, onclick: () => goQ(R.cur - 1) }, icon('back', 18), __('Previous')),
          flagBtn,
          h('button', { type: 'button', class: 'btn', disabled: R.cur === n - 1, onclick: () => goQ(R.cur + 1) }, __('Next'), icon('next', 18))),
        h('button', { type: 'button', class: 'btn primary', id: 'ask-submit', onclick: askSubmit }, __('Submit exam')));
    }
    const cellLabel = (i) => [__('Question {0}', i + 1), R.answers[i] >= 0 ? __('answered') : __('not answered'), R.flags[i] ? __('flagged') : null, i === R.cur ? __('current') : null].filter(Boolean).join(', ');
    function drawGrid() {
      gridBox.replaceChildren(
        secHead(__('Questions'), __('Jump to any question')),
        h('div', { class: 'examgrid' }, R.ids.map((id, i) => h('button', {
          type: 'button', 'data-i': String(i),
          class: 'gcell' + (R.answers[i] >= 0 ? ' ans' : '') + (R.flags[i] ? ' flag' : '') + (i === R.cur ? ' cur' : ''),
          'aria-current': i === R.cur ? 'true' : null,
          'aria-label': cellLabel(i),
          onclick: () => goQ(i, true)
        }, String(i + 1)))),
        h('p', { class: 'legend' }, h('span', null, __('A dot means answered.')), h('span', null, __('A folded corner means flagged for review.')), h('span', null, __('The outlined number is the current question.'))));
    }
    function goQ(i, fromGrid) {
      R.cur = clamp(i, 0, n - 1);
      persist();
      submitBox.hidden = true;
      drawQ(); drawGrid(); drawInfo();
      announce(__('Question {0} of {1}', R.cur + 1, n) + ', ' + (R.answers[R.cur] >= 0 ? __('answered') : __('not answered')) + '. ' + IX.question.get(R.ids[R.cur]).stem);
      if (fromGrid) { const c = $('[data-i="' + R.cur + '"]', gridBox); if (c) c.focus({ preventScroll: true }); }
      ensureVisible(qBox);
    }
    function askSubmit() {
      const c = counts();
      const un = n - c.answered;
      const keep = h('button', { type: 'button', class: 'btn', onclick: () => { submitBox.hidden = true; const b = $('#ask-submit', root); if (b) b.focus(); } }, __('Keep working'));
      const text = [un ? __('{0} not answered and will count as wrong.', plural(un, 'question')) : __('Every question is answered.'),
        c.flagged ? __('{0} still flagged for review.', plural(c.flagged, 'question')) : null].filter(Boolean).join(' ');
      submitBox.replaceChildren(h('div', { class: 'panel raised stack', role: 'group', 'aria-label': __('Confirm submission') },
        h('h2', { class: 'title' }, __('Submit the exam?')),
        h('p', null, text),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', onclick: () => finish(false) }, __('Submit now')), keep)));
      submitBox.hidden = false;
      keep.focus();
      ensureVisible(submitBox);
    }
    function finish(timedOut) {
      stop(); tickFn = null;
      const res = finalizeExam(R);
      result(S.lastExam, res, { timedOut });
    }
    function tick() {
      const left = R.deadline - Date.now();
      if (left <= 0) { timerEl.textContent = '0:00'; finish(true); return; }
      timerEl.textContent = mmss(left);
      timerEl.className = 'timer' + (left <= 60000 ? ' low' : (left <= 600000 ? ' mid' : ''));
      if (left <= 600000 && !R.w10 && R.minutes > 10) { R.w10 = true; persist(); banner(__('10 minutes left. Check your flagged questions.')); }
      if (left <= 60000 && !R.w1) { R.w1 = true; persist(); banner(__('1 minute left. The exam is submitted automatically at zero.')); }
    }
    tickFn = tick;
    drawQ(); drawGrid(); drawInfo();
    tick();
    if (S.exam === R) timer = setInterval(tick, 500);

    setKeys((e, ctx) => {
      if (S.exam !== R || ctx.inField) return false;
      const k = e.key;
      let j = -1;
      if (/^[1-4]$/.test(k)) j = Number(k) - 1;
      else if (/^[a-dA-D]$/.test(k)) j = LETTERS.indexOf(k.toUpperCase());
      if (j >= 0) { setAnswer(j); return true; }
      if ((k === 'n' || k === 'N') && R.cur < n - 1) { goQ(R.cur + 1); return true; }
      if ((k === 'p' || k === 'P') && R.cur > 0) { goQ(R.cur - 1); return true; }
      if (k === 'f' || k === 'F') { const b = $('[aria-pressed]', actions); if (b) b.click(); return true; }
      return false;
    });
    window.scrollTo(0, 0);
    qBox.focus({ preventScroll: true });
  }

  /* ---------- result ---------- */
  function result(snap, res, opts) {
    stop(); tickFn = null; setKeys(() => false);
    opts = opts || {};
    const P = D.exams[snap.profile], total = res.total, need = passMark(total);
    const onlyWrong = { v: false };
    const reviewBox = h('div');
    const drawReview = () => {
      const items = [];
      snap.ids.forEach((id, i) => {
        const q = IX.question.get(id), a = snap.answers[i];
        const ok = a === q.answer, none = a < 0;
        if (onlyWrong.v && ok) return;
        items.push(h('div', { class: 'rev' },
          h('div', { class: 'row' }, h('span', { class: 'id' }, 'Q' + (i + 1)), kBadge(q.k), tagEl(topicName(q.topic)),
            snap.flags[i] ? tagEl(__('Flagged'), 'warn') : null,
            ok ? h('span', { class: 'tag ok' }, icon('check', 13), __('Correct')) : (none ? h('span', { class: 'tag warn' }, __('Not answered')) : h('span', { class: 'tag bad' }, icon('cross', 13), __('Wrong'))),
            q.verify ? checkFlag() : null),
          h('p', { class: 'stem' }, q.stem),
          none ? h('p', { class: 'your' }, h('strong', null, __('Your answer:') + ' '), __('none')) : h('p', { class: 'your' }, h('strong', null, __('Your answer:') + ' '), LETTERS[a] + '. ' + q.options[a]),
          ok ? null : h('p', { class: 'corr' }, h('strong', null, __('Correct answer:') + ' '), LETTERS[q.answer] + '. ' + q.options[q.answer]),
          h('p', { class: 'small muted' }, q.explanation)));
      });
      reviewBox.replaceChildren(...(items.length ? items : [emptyState(__('Nothing to show here. Every question was answered correctly.'))]));
    };
    const toggle = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, __('Only wrong or unanswered'));
    toggle.addEventListener('click', () => { onlyWrong.v = !onlyWrong.v; toggle.setAttribute('aria-pressed', onlyWrong.v ? 'true' : 'false'); drawReview(); });
    drawReview();

    const table = (entries, labelFn, heading, aria) => {
      const rows = entries.map(([k, [o, t]]) => h('tr', null,
        h('td', { 'data-label': heading }, labelFn(k)),
        h('td', { 'data-label': __('Correct'), class: 'tnum nowrap' }, o + ' / ' + t),
        h('td', { 'data-label': __('Share') }, meterEl(t ? o / t : 0, labelFn(k)))));
      return tblWrap('tbl-wrap flat', aria, h('table', { class: 'tbl stackable' },
        h('thead', null, h('tr', null, [heading, __('Correct'), __('Share')].map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', null, rows)));
    };
    const byTopic = Object.entries(res.byTopic).sort((a, b) => (a[1][0] / a[1][1]) - (b[1][0] / b[1][1]));
    const byK = Object.entries(res.byK).sort((a, b) => a[0].localeCompare(b[0]));

    root.replaceChildren(
      viewHead(opts.fromLobby ? __('Exam result') : (opts.timedOut ? __('Time is up') : __('Exam submitted')), __('{0} mock exam, finished {1}', P.name, fmtStamp(snap.finished)), __('Result')),
      h('section', { class: 'panel raised stack', 'aria-label': __('Score') },
        h('div', { class: 'row between' },
          h('div', { class: 'score tnum' }, res.correct + ' / ' + total),
          h('span', { class: 'passfail ' + (res.passed ? 'pass' : 'fail') }, icon(res.passed ? 'check' : 'cross', 20), res.passed ? __('Pass') : __('Below pass mark'))),
        h('p', null, __('{0}% correct. The pass mark in this simulator is {1} of {2} ({3}%).', pct(res.correct / total), need, total, IX.passPercent) +
          (opts.timedOut ? ' ' + __('Time ran out, so questions you had not answered count as wrong.') : '')),
        note('info', __('This is an approximation. The real exam weights questions by knowledge level and has {0} points with {1} needed to pass. Treat this result as a self-study indicator.', P.points, P.passPoints))),
      h('section', { class: 'section' }, secHead(__('By topic'), __('Weakest first')), table(byTopic, topicName, __('Topic'), __('Results by topic table'))),
      h('section', { class: 'section' }, secHead(__('By knowledge level')), table(byK, (k) => k, __('Level'), __('Results by level table'))),
      h('section', { class: 'section' }, secHead(__('Review every question'), __('Answers and reasoning')), h('div', { class: 'row' }, toggle), reviewBox),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn primary', onclick: lobby }, __('Back to the exam simulator')),
        navLink('home', { class: 'btn' }, __('Home'))));
    announce(__('Exam finished. You scored {0} out of {1}.', res.correct, total) + ' ' + (res.passed ? __('Pass.') : __('Below the pass mark.')));
    const f = $('h1', root);
    if (f) f.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  if (S.exam && Date.now() >= S.exam.deadline) {
    const res = finalizeExam(S.exam);
    result(S.lastExam, res, { timedOut: true });
  } else {
    lobby();
  }
  return root;
};
