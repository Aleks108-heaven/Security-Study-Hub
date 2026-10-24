/* ===== 25 progress report: Markdown text built from the progress document ===== */
const mdCell = (s) => String(s).replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();
function mdTable(head, rows) {
  const line = (cells) => '| ' + cells.map(mdCell).join(' | ') + ' |';
  return [line(head), line(head.map(() => '---'))].concat(rows.map(line)).join('\n');
}

/* The report states what the numbers rest on (evidence column, caveats), so a reader can judge it without the app. */
function buildReport() {
  const m = allTopicStats();
  const qt = quizTotals();
  const rd = readiness(m);
  const dc = dueCounts();
  const tried = D.questions.filter((q) => S.questions[q.id] && S.questions[q.id].seen > 0);
  const triedOk = tried.filter((q) => S.questions[q.id].lastOk).length;
  const mods = D.modules.filter((x) => S.modules[x.id] && S.modules[x.id].done).length;
  const gates = D.roadmap.stages.filter((s) => S.roadmap.gates[String(s.id)] && S.roadmap.gates[String(s.id)].done).length;
  const cardsSeen = Object.keys(S.cards).length;
  const exams = S.exams.slice(-10).reverse();
  const bestExam = S.exams.reduce((b, e) => (!b || e.correct / e.total > b.correct / b.total ? e : b), null);
  const band = __(READY_LABEL[rd.band]).toLowerCase();
  const st = streak();

  const out = [];
  out.push('# ' + __('Study progress report'), '');
  out.push(__('{0}. Generated {1}. Dataset version {2}, as of {3}.', D.meta.title.replace(/:[^:]*$/, ''), today(), D.meta.datasetVersion, D.meta.asOf), '');

  out.push('## ' + __('Summary'), '');
  out.push(mdTable([__('Measure'), __('Value')], [
    [__('Overall mastery'), __('{0}% across {1} topics', pct(overallMastery(m)), D.topics.length)],
    [__('Exam readiness (ISTQB track topics)'), pct(rd.value) + '%, ' + band],
    [__('Flashcards studied'), __('{0} of {1} ({2} due today)', cardsSeen, D.flashcards.length, dc.reviews)],
    [__('Questions tried'), __('{0} of {1}', tried.length, D.questions.length)],
    [__('Right on the latest try'), tried.length ? __('{0}% of the questions tried', pct(triedOk / tried.length)) : __('n/a')],
    [__('Quiz answers given (all attempts)'), String(qt.answered) + (qt.acc === null ? '' : ', ' + __('{0}% correct', pct(qt.acc)))],
    [__('Mock exams taken'), String(S.exams.length) + (bestExam ? ', ' + __('best {0} of {1} ({2}%)', bestExam.correct, bestExam.total, pct(bestExam.correct / bestExam.total)) : '')],
    [__('Modules completed'), __('{0} of {1}', mods, D.modules.length)],
    [__('Roadmap gates passed'), __('{0} of {1}', gates, D.roadmap.stages.length)],
    [__('Study streak'), plural(st, 'day')]
  ]), '');

  out.push('## ' + __('Mastery by topic'), '');
  out.push(mdTable([__('Topic'), __('Mastery'), __('Cards seen'), __('Questions tried'), __('Right on latest try'), __('Evidence')],
    D.topics.map((t) => {
      const s = m.get(t.id);
      return [t.name, pct(s.mastery) + '%', s.seenCards + ' / ' + s.cards, s.distinct + ' / ' + s.qTotal,
        s.recent === null ? __('n/a') : pct(s.recent) + '%',
        s.enough ? __('Cards and questions') : (s.distinct ? __('Low: fewer than {0}, cards only', plural(MIN_EVIDENCE, 'question')) : __('Cards only'))];
    })), '');

  out.push('## ' + __('Mock exams (latest ten)'), '');
  if (!exams.length) out.push(__('No mock exam has been taken yet.'), '');
  else {
    out.push(mdTable([__('Finished'), __('Exam'), __('Score'), __('Result')], exams.map((e) => [
      String(e.finished).slice(0, 10), examShort(e.profile), e.correct + ' / ' + e.total + ' (' + pct(e.correct / e.total) + '%)', e.passed ? __('Pass') : __('Below pass mark')])), '');
    const last = S.exams[S.exams.length - 1];
    const ks = Object.keys(last.byK).sort();
    if (ks.length) {
      out.push(__('Latest attempt by knowledge level:'), '');
      out.push(mdTable([__('Level'), __('Correct')], ks.map((k) => [k, last.byK[k][0] + ' / ' + last.byK[k][1]])), '');
    }
  }

  out.push('## ' + __('Focus areas'), '');
  const all = D.topics.map((t) => m.get(t.id));
  const weak = all.filter((s) => s.enough && s.recent < 0.7).sort((a, b) => a.recent - b.recent);
  const untried = all.filter((s) => s.distinct === 0);
  const thin = all.filter((s) => s.distinct > 0 && !s.enough);
  const focus = [];
  for (const s of weak) focus.push('- ' + __('Strengthen {0}: right on the latest try for {1}% of {2}.', topicName(s.id), pct(s.recent), plural(s.distinct, 'question')));
  if (untried.length) focus.push('- ' + __('No questions tried yet: {0}.', untried.map((s) => topicName(s.id)).join('; ')));
  if (thin.length) focus.push('- ' + __('Too few questions to rate (fewer than {0}): {1}.', MIN_EVIDENCE, thin.map((s) => topicName(s.id)).join('; ')));
  if (dc.reviews) focus.push('- ' + __('{0} due for review.', plural(dc.reviews, 'flashcard')));
  out.push(...(focus.length ? focus : ['- ' + __('No weak areas flagged. Keep reviewing cards and take a mock exam.')]), '');

  out.push('## ' + __('How to read this report'), '');
  out.push(
    '- ' + __('Mastery starts from flashcard progress (the mean box level of the topic\'s cards, with unseen cards at zero). Once {0} different questions of a topic have been tried, it is averaged 50/50 with the share of those questions that were right on the latest try. Repeating one question adds no evidence.', MIN_EVIDENCE),
    '- ' + __('Exam readiness is a self-study indicator, not a prediction. The mock exam gives one point per question and a {0}% pass mark; the real ISTQB exams weight questions by knowledge level.', IX.passPercent),
    '- ' + __('The questions are original practice items, not official exam content, and some rest on facts that were not re-checked on the as-of date.'),
    '- ' + __('The data comes from one browser and has not been independently verified.'));
  return out.join('\n') + '\n';
}
