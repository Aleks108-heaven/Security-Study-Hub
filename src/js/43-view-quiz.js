/* ===== 43 views: practice quiz ===== */
const LETTERS = 'ABCD';

VIEWS.quiz = function (r, params) {
  const root = h('div', { class: 'view' });
  const st = { topics: new Set(params.topic && IX.topic.has(params.topic) ? [params.topic] : []), ks: new Set(), core: false, size: 10 };
  let Q = null;

  /* ----- setup ----- */
  function setup() {
    Q = null;
    const match = h('p', { class: 'small', role: 'status' });
    const startBtn = h('button', { type: 'button', class: 'btn primary', onclick: () => begin(drawQuestions(st, st.size === 0 ? Infinity : st.size)) }, __('Start quiz'), icon('next', 18));
    const update = () => {
      const pool = questionPool(st);
      const unseen = pool.filter((q) => !S.questions[q.id]).length;
      const take = st.size === 0 ? pool.length : Math.min(st.size, pool.length);
      match.textContent = __('Matching questions: {0}. Not seen yet: {1}. This quiz: {2}.', pool.length, unseen, plural(take, 'question')) + ' ' + __('Unseen questions come first, then your weakest.');
      startBtn.disabled = take === 0;
    };
    const coreBtn = h('button', { type: 'button', class: 'chip', 'aria-pressed': st.core ? 'true' : 'false' }, __('Only the questions printed in the hub'));
    coreBtn.addEventListener('click', () => { st.core = !st.core; coreBtn.setAttribute('aria-pressed', st.core ? 'true' : 'false'); update(); });
    const size = h('select', { id: 'quiz-size' }, [[10, plural(10, 'question')], [20, plural(20, 'question')], [0, __('All matching questions')]].map(([v, l]) => h('option', { value: String(v) }, l)));
    size.value = String(st.size);
    size.addEventListener('change', () => { st.size = Number(size.value); update(); });
    const qt = quizTotals();
    root.replaceChildren(
      viewHead(__('Practice quiz'), __('Questions at ISTQB knowledge levels K1 to K4. You see the answer and the reasoning straight after each question. Answers cannot be changed once submitted.'), __('Practice')),
      qt.answered ? h('p', { class: 'small muted' }, __('So far: {0}, {1}% correct.', plural(qt.answered, 'answer'), pct(qt.acc))) : null,
      h('section', { class: 'panel stack' },
        h('div', { class: 'stack' }, h('h2', { class: 'minor' }, __('Topics (none selected means all)')),
          chipGroup(D.topics.map((t) => ({ id: t.id, label: t.name })), st.topics, update, __('Topics'))),
        h('div', { class: 'stack' }, h('h2', { class: 'minor' }, __('Knowledge level')),
          chipGroup(['K1', 'K2', 'K3', 'K4'].map((k) => ({ id: k, label: k })), st.ks, update, __('Knowledge level'))),
        h('div', { class: 'row' }, coreBtn),
        h('label', { class: 'field', for: 'quiz-size', style: { maxWidth: '260px' } }, __('Length'), size),
        match,
        h('div', { class: 'row' }, startBtn)),
      h('p', { class: 'hint' }, __('Keyboard: press 1 to 4 (or A to D) to answer, then Enter for the next question.')));
    update();
  }

  /* ----- running ----- */
  function begin(list) {
    if (!list.length) { toast(__('No questions match these filters')); return; }
    Q = { list, i: 0, picks: new Array(list.length).fill(-1), right: 0 };
    show();
  }
  function show() {
    const q = Q.list[Q.i], pick = Q.picks[Q.i], answered = pick >= 0, total = Q.list.length;
    const opts = q.options.map((text, j) => {
      const isRight = answered && j === q.answer, isWrong = answered && j === pick && pick !== q.answer;
      const cls = 'opt' + (answered ? ' locked' : '') + (isRight ? ' right' : '') + (isWrong ? ' wrong' : '');
      const res = isRight ? h('span', { class: 'res' }, icon('check', 16), __('Correct answer')) : (isWrong ? h('span', { class: 'res' }, icon('cross', 16), __('Your answer')) : null);
      return h('li', null, h('button', { type: 'button', class: cls, 'aria-disabled': answered ? 'true' : null, 'data-j': String(j), onclick: () => choose(j) },
        h('span', { class: 'let', 'aria-hidden': 'true' }, LETTERS[j]), h('span', null, text), res));
    });
    const qSection = h('section', { class: 'panel raised stack', 'aria-label': __('Question'), 'aria-describedby': 'q-stem', tabindex: '-1', 'data-q': '' },
      h('div', { class: 'row' }, kBadge(q.k), tagEl(topicName(q.topic)), q.verify ? checkFlag() : null),
      h('p', { class: 'stem', id: 'q-stem' }, q.stem),
      h('ol', { class: 'opts', 'aria-label': __('Answer options') }, opts));
    const parts = [
      h('h1', { class: 'sr-only' }, __('Practice quiz')),
      h('div', { class: 'row between' },
        h('p', { class: 'kicker', role: 'status' }, __('Question {0} of {1}', Q.i + 1, total)),
        h('span', { class: 'tiny muted tnum' }, __('{0} correct so far', Q.right))),
      barEl((Q.i + (answered ? 1 : 0)) / total, true),
      qSection
    ];
    if (answered) {
      const ok = pick === q.answer;
      parts.push(h('div', { class: 'feedback ' + (ok ? 'right' : 'wrong'), id: 'fb' },
        h('div', { class: 'verdict' }, icon(ok ? 'check' : 'cross', 20), ok ? __('Correct') : __('Not quite. The correct answer is {0}.', LETTERS[q.answer])),
        h('p', null, q.explanation),
        q.verify ? h('p', { class: 'tiny' }, checkFlag(), ' ' + __('This fact was not re-checked on the as-of date.')) : null));
      const last = Q.i === total - 1;
      parts.push(h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', id: 'next', onclick: next }, last ? __('See results') : __('Next question'), icon('next', 18))));
    }
    root.replaceChildren(...parts);
    if (answered) { const n = $('#next', root); if (n) n.focus({ preventScroll: true }); }
    else {
      /* A new question replaces the old one, so put focus on it (screen readers then read it) and keep its top in view. */
      qSection.focus({ preventScroll: true });
      qSection.scrollIntoView({ block: 'nearest' });
    }
  }
  function choose(j) {
    if (!Q) return;
    if (Q.picks[Q.i] >= 0) {                        // locked after the first answer: send focus to Next instead of doing nothing
      const n = $('#next', root);
      if (n) n.focus({ preventScroll: true });
      return;
    }
    const q = Q.list[Q.i];
    Q.picks[Q.i] = j;
    const ok = j === q.answer;
    if (ok) Q.right++;
    recordAnswer(q, ok);
    announce((ok ? __('Correct.') : __('Not quite. The correct answer is {0}.', LETTERS[q.answer])) + ' ' + q.explanation);
    show();
  }
  function next() {
    if (!Q || Q.picks[Q.i] < 0) return;
    if (Q.i === Q.list.length - 1) { summary(); return; }
    Q.i++;
    show();
  }
  function summary() {
    const total = Q.list.length;
    const wrong = Q.list.filter((q, i) => Q.picks[i] !== q.answer);
    const score = Q.right / total;
    const reviews = wrong.map((q) => {
      const pick = Q.picks[Q.list.indexOf(q)];
      return h('div', { class: 'rev' },
        h('div', { class: 'row' }, kBadge(q.k), tagEl(topicName(q.topic)), q.verify ? checkFlag() : null),
        h('p', { class: 'stem' }, q.stem),
        h('p', { class: 'your' }, h('strong', null, __('Your answer:') + ' '), LETTERS[pick] + '. ' + q.options[pick]),
        h('p', { class: 'corr' }, h('strong', null, __('Correct answer:') + ' '), LETTERS[q.answer] + '. ' + q.options[q.answer]),
        h('p', { class: 'small muted' }, q.explanation));
    });
    const retry = h('button', { type: 'button', class: 'btn primary', onclick: () => begin(shuffle(wrong)) }, __('Retry the {0} I missed', wrong.length));
    root.replaceChildren(
      viewHead(__('Quiz complete'), null, __('Practice')),
      h('section', { class: 'panel raised stack' },
        h('div', { class: 'score tnum' }, Q.right + ' / ' + total),
        h('p', null, __('{0}% correct.', pct(score)) + ' ' + (wrong.length ? __('{0} to review below.', plural(wrong.length, 'question')) : __('Every answer was right.'))),
        h('div', { class: 'row' }, wrong.length ? retry : null,
          h('button', { type: 'button', class: wrong.length ? 'btn' : 'btn primary', onclick: setup }, __('New quiz')),
          navLink('home', { class: 'btn' }, __('Home')))),
      wrong.length ? h('section', { class: 'section' }, secHead(__('Review what you missed')), h('div', null, reviews)) : null);
    announce(__('Quiz complete. {0} of {1} correct.', Q.right, total));
    const f = $('h1', root);
    if (f) f.focus({ preventScroll: true });
  }

  setKeys((e, ctx) => {
    if (!Q || ctx.inField) return false;
    const answered = Q.picks[Q.i] >= 0;
    if (!answered) {
      let j = -1;
      if (/^[1-4]$/.test(e.key)) j = Number(e.key) - 1;
      else if (/^[a-dA-D]$/.test(e.key)) j = LETTERS.indexOf(e.key.toUpperCase());
      if (j >= 0) { choose(j); return true; }
      return false;
    }
    if ((e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') && !(ctx.onControl && e.key === 'Enter')) { next(); return true; }
    return false;
  });
  setup();
  return root;
};
