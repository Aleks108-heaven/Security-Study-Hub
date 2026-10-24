/* ===== 42 views: flashcards (Leitner boxes) ===== */
VIEWS.cards = function (r, params) {
  const root = h('div', { class: 'view' });
  const st = { topics: new Set(params.topic && IX.topic.has(params.topic) ? [params.topic] : []), diffs: new Set(), core: false, size: 20 };
  let sess = null;
  const filterFn = () => (c) =>
    (st.topics.size === 0 || st.topics.has(c.topic)) && (st.diffs.size === 0 || st.diffs.has(c.difficulty)) && (!st.core || c.core);

  /* ----- setup screen ----- */
  function setup() {
    sess = null;
    const bc = boxCounts(), all = dueCounts();
    const match = h('p', { class: 'small', role: 'status' });
    const startBtn = h('button', { type: 'button', class: 'btn primary', onclick: start }, __('Start session'), icon('next', 18));
    const updateMatch = () => {
      const d = dueCounts(filterFn());
      const take = Math.min(st.size, d.reviews + d.fresh);
      if (take === 0) {
        match.textContent = d.next ? __('Nothing is due for these filters. The next review is on {0}.', fmtDate(d.next)) : __('No cards match these filters.');
      } else {
        match.textContent = __('{0} to review and {1} new.', d.reviews, d.fresh) + ' ' + __('This session: {0}.', plural(take, 'card'));
      }
      startBtn.disabled = take === 0;
    };

    const maxN = Math.max(1, bc.fresh, ...bc.counts);
    const cols = [{ lab: __('New'), sub: __('not seen'), n: bc.fresh, cls: 'new' }].concat(bc.counts.map((n, i) => {
      const iv = IX.intervals[i];
      return { lab: __('Box {0}', i + 1), sub: iv === 0 ? __('every session') : plural(iv, 'day'), n };
    }));
    const ladder = h('div', { class: 'ladder', role: 'img', 'aria-label': __('Cards per box: {0}', cols.map((c) => c.lab + ' ' + c.n).join(', ')) },
      cols.map((c) => h('div', { class: 'lvl' },
        h('span', { class: 'cnt tnum' }, String(c.n)),
        h('div', { class: 'col' + (c.cls ? ' ' + c.cls : ''), style: { height: Math.max(3, Math.round(c.n / maxN * 84)) + 'px' } }),
        h('span', { class: 'lab' }, c.lab),
        h('span', { class: 'lab tiny' }, c.sub))));

    const coreBtn = h('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' }, __('Only the cards printed in the hub'));
    coreBtn.addEventListener('click', () => { st.core = !st.core; coreBtn.setAttribute('aria-pressed', st.core ? 'true' : 'false'); updateMatch(); });
    const size = h('select', { id: 'cards-size' }, [10, 20, 40].map((n) => h('option', { value: String(n) }, plural(n, 'card'))));
    size.value = String(st.size);
    size.addEventListener('change', () => { st.size = Number(size.value); updateMatch(); });

    root.replaceChildren(
      viewHead(__('Flashcards'), __('Five boxes, spaced out over time. A card you know moves up a box and comes back later. A card you miss goes back to box 1 and comes back soon.'), __('Spaced repetition')),
      h('section', { class: 'grid3', 'aria-label': __('Today') },
        h('div', { class: 'stat' }, h('div', { class: 'n' }, String(all.reviews)), h('div', { class: 'l' }, __('Due for review')), h('div', { class: 's' }, __('seen before, due today or overdue'))),
        h('div', { class: 'stat' }, h('div', { class: 'n' }, String(all.fresh)), h('div', { class: 'l' }, __('New cards')), h('div', { class: 's' }, __('never studied'))),
        h('div', { class: 'stat' }, h('div', { class: 'n', style: { fontSize: '24px', paddingBlock: '5px' } }, all.reviews ? __('Today') : (all.next ? fmtDate(all.next) : __('n/a'))), h('div', { class: 'l' }, __('Next review')), h('div', { class: 's' }, __('earliest due date')))),
      h('section', { class: 'section' }, secHead(__('Your boxes'), __('Interval before a card returns')), h('div', { class: 'panel' }, ladder)),
      h('section', { class: 'section' }, secHead(__('Choose cards')),
        h('div', { class: 'panel stack' },
          h('div', { class: 'stack' }, h('h2', { class: 'minor' }, __('Topics (none selected means all)')),
            chipGroup(D.topics.map((t) => ({ id: t.id, label: t.name })), st.topics, updateMatch, __('Topics'))),
          h('div', { class: 'stack' }, h('h2', { class: 'minor' }, __('Difficulty')),
            chipGroup([1, 2, 3].map((n) => ({ id: n, label: __(DIFF_LABEL[n]) })), st.diffs, updateMatch, __('Difficulty'))),
          h('div', { class: 'row' }, coreBtn),
          h('label', { class: 'field', for: 'cards-size', style: { maxWidth: '220px' } }, __('Session size'), size),
          match,
          h('div', { class: 'row' }, startBtn))),
      h('p', { class: 'hint' }, __('Keyboard: Space or Enter shows the answer, the left arrow means missed, the right arrow means knew it, Escape ends the session.')));
    coreBtn.setAttribute('aria-pressed', st.core ? 'true' : 'false');
    updateMatch();
  }

  /* ----- session ----- */
  function start() {
    const queue = drawCards(filterFn(), st.size);
    if (!queue.length) { toast(__('No cards to study with these filters')); return; }
    sess = { queue, i: 0, flipped: false, known: 0, missed: 0, requeues: {}, graded: 0, moved: 0 };
    showCard();
  }
  function showCard() {
    const c = sess.queue[sess.i];
    if (!c) { summary(); return; }
    const total = sess.queue.length, left = total - sess.i;
    const meta = h('div', { class: 'row' }, tagEl(topicName(c.topic)), tagEl(__(DIFF_LABEL[c.difficulty])), c.verify ? checkFlag() : null);
    const front = h('p', { class: 'q', id: 'card-q' }, c.q);
    let body;
    if (!sess.flipped) {
      body = [front, h('button', { type: 'button', class: 'btn primary wide', id: 'flip', 'aria-describedby': 'card-q', onclick: flip }, icon('flip', 18), __('Show answer'))];
    } else {
      body = [front,
        h('div', { class: 'a', id: 'ans', tabindex: '-1' }, h('span', { class: 'kicker' }, __('Answer')), c.a),
        h('div', { class: 'grade' },
          h('button', { type: 'button', class: 'btn', id: 'miss', onclick: () => grade(false) }, icon('cross', 18), __('I missed it')),
          h('button', { type: 'button', class: 'btn primary', id: 'knew', onclick: () => grade(true) }, icon('check', 18), __('I knew it')))];
    }
    root.replaceChildren(
      h('h1', { class: 'sr-only' }, __('Flashcard session')),
      h('div', { class: 'row between' },
        h('p', { class: 'kicker', role: 'status' }, __('Card {0} of {1}', sess.i + 1, total) + '  /  ' + __('{0} left', left)),
        h('button', { type: 'button', class: 'btn quiet sm', onclick: end }, __('End session'))),
      h('div', { class: 'progress-line' }, barEl(sess.i / total, true)),
      h('section', { class: 'panel raised flash', 'aria-label': __('Flashcard') }, meta, body),
      h('p', { class: 'hint' }, sess.flipped ? __('Left arrow: missed. Right arrow: knew it.') : __('Press Space or Enter to show the answer.')));
    const f = sess.flipped ? $('#ans', root) : $('#flip', root);
    if (f) f.focus({ preventScroll: true });
  }
  function flip() { if (!sess || sess.flipped) return; sess.flipped = true; showCard(); }
  function grade(knew) {
    if (!sess || !sess.flipped) return;
    const c = sess.queue[sess.i];
    if (!c) return;
    const res = gradeCard(c.id, knew);
    if (res === null) return;                       // a second event for the same card within a second is ignored
    sess.graded++;
    if (res.to > res.from) sess.moved++;
    if (knew) sess.known++;
    else {
      sess.missed++;
      const n = sess.requeues[c.id] || 0;
      if (n < 3) { sess.requeues[c.id] = n + 1; sess.queue.splice(Math.min(sess.queue.length, sess.i + 4), 0, c); }   // missed cards return a few cards later
    }
    sess.i++;
    sess.flipped = false;
    refreshBadges();
    showCard();
  }
  function end() {
    if (sess && sess.graded > 0) summary(); else setup();
  }
  function summary() {
    const s = sess, d = dueCounts();
    const total = s.known + s.missed;
    root.replaceChildren(
      viewHead(__('Session complete'), total ? __('You answered {0}.', plural(total, 'card')) : __('No cards were answered.'), __('Flashcards')),
      h('section', { class: 'grid3' },
        h('div', { class: 'stat' }, h('div', { class: 'n' }, String(s.known)), h('div', { class: 'l' }, __('Knew it')), h('div', { class: 's' }, __('{0} moved up a box', s.moved))),
        h('div', { class: 'stat' }, h('div', { class: 'n' }, String(s.missed)), h('div', { class: 'l' }, __('Missed')), h('div', { class: 's' }, __('back in box 1'))),
        h('div', { class: 'stat' }, h('div', { class: 'n' }, total ? pct(s.known / total) + '%' : __('n/a')), h('div', { class: 'l' }, __('Recall')), h('div', { class: 's' }, __('{0} still due today', d.reviews)))),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn primary', onclick: setup }, __('Back to flashcards')),
        navLink('home', { class: 'btn' }, __('Home'))));
    const b = $('.btn.primary', root);
    if (b) b.focus({ preventScroll: true });
    announce(__('Session complete. {0} known, {1} missed.', s.known, s.missed));
  }

  setKeys((e, ctx) => {
    if (!sess) return false;
    if (e.key === 'Escape') { end(); return true; }
    const c = sess.queue[sess.i];
    if (!c) return false;
    if (!sess.flipped) {
      if ((e.key === ' ' || e.key === 'Enter') && !ctx.onControl && !ctx.inField) { flip(); return true; }
      return false;
    }
    if (e.key === 'ArrowLeft') { grade(false); return true; }
    if (e.key === 'ArrowRight') { grade(true); return true; }
    return false;
  });
  setup();
  return root;
};
