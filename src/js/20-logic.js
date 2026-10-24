/* ===== 20 learning logic: mastery, spaced repetition, draws, exam scoring ===== */
/* Question evidence needed before quiz results count towards a topic's mastery. Repeats of one question do not add evidence. */
const MIN_EVIDENCE = 5;

function topicStats(tid) {
  const cards = IX.cardsByTopic.get(tid) || [];
  const qs = IX.qByTopic.get(tid) || [];
  let seenCards = 0, cm = 0;
  for (const c of cards) {
    const r = S.cards[c.id];
    if (r) { seenCards++; cm += (r.box - 1) / 4; }
  }
  const cardMast = cards.length ? cm / cards.length : 0;
  let answered = 0, correct = 0, distinct = 0, latestOk = 0;
  for (const q of qs) {
    const r = S.questions[q.id];
    if (r && r.seen > 0) { answered += r.seen; correct += r.ok; distinct++; if (r.lastOk) latestOk++; }
  }
  const acc = answered ? correct / answered : null;                // every attempt, shown for information only
  const recent = distinct ? latestOk / distinct : null;            // latest attempt per distinct question: old misses fade once corrected
  const enough = distinct >= MIN_EVIDENCE;
  const mastery = enough ? 0.5 * cardMast + 0.5 * recent : cardMast;
  return { id: tid, cards: cards.length, seenCards, cardMast, qTotal: qs.length, qDistinct: distinct, distinct, answered, correct, acc, recent, enough, mastery };
}
function allTopicStats() {
  const m = new Map();
  for (const t of D.topics) m.set(t.id, topicStats(t.id));
  return m;
}
const overallMastery = (m) => mean(D.topics.map((t) => m.get(t.id).mastery));
const trackProgress = (tr, m) => mean(tr.topics.map((id) => (m.get(id) ? m.get(id).mastery : 0)));
function readiness(m) {
  const tr = IX.track.get('istqb') || D.tracks[0];
  const value = trackProgress(tr, m);
  return { value, band: value < 0.5 ? 'early' : (value < 0.7 ? 'building' : 'ready') };
}
function quizTotals() {
  let answered = 0, correct = 0;
  for (const id of Object.keys(S.questions)) { answered += S.questions[id].seen; correct += S.questions[id].ok; }
  return { answered, correct, acc: answered ? correct / answered : null };
}
function weakestTopic(m) {
  let w = null;
  for (const t of D.topics) {
    const s = m.get(t.id);
    if (s.enough && s.recent < 0.7 && (w === null || s.recent < w.recent)) w = s;
  }
  return w;
}
function streak() {
  let d = today(), n = 0;
  if (!(S.activity[d] > 0)) d = addDays(d, -1);
  while (S.activity[d] > 0 && n < 3700) { n++; d = addDays(d, -1); }
  return n;
}
function lastDays(n) {
  const out = [];
  const t = today();
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(t, -i);
    out.push({ date: d, count: S.activity[d] || 0 });
  }
  return out;
}
function firstIncompleteModule() { return D.modules.find((m) => !(S.modules[m.id] && S.modules[m.id].done)) || null; }
function nextGate() { return D.roadmap.stages.find((st) => !(S.roadmap.gates[String(st.id)] && S.roadmap.gates[String(st.id)].done)) || null; }
function isNewLearner() {
  return !Object.keys(S.cards).length && !Object.keys(S.questions).length &&
    !Object.values(S.modules).some((x) => x.done) && !Object.values(S.roadmap.gates).some((x) => x.done) &&
    !S.exams.length && !S.exam;
}

/* ----- flashcards (Leitner boxes) ----- */
function dueCounts(filter) {
  const t = today();
  let reviews = 0, fresh = 0, next = null;
  for (const c of D.flashcards) {
    if (filter && !filter(c)) continue;
    const r = S.cards[c.id];
    if (!r) fresh++;
    else if (r.due <= t) reviews++;
    else if (next === null || r.due < next) next = r.due;
  }
  return { reviews, fresh, next };
}
function boxCounts() {
  const counts = [0, 0, 0, 0, 0];
  let fresh = 0;
  for (const c of D.flashcards) {
    const r = S.cards[c.id];
    if (r) counts[r.box - 1]++; else fresh++;
  }
  return { counts, fresh };
}
function drawCards(filter, cap) {
  const t = today();
  const rev = [], fr = [];
  for (const c of D.flashcards) {
    if (filter && !filter(c)) continue;
    const r = S.cards[c.id];
    if (!r) fr.push(c); else if (r.due <= t) rev.push(c);
  }
  const pick = shuffle(rev).slice(0, cap);
  if (pick.length < cap) pick.push(...shuffle(fr).slice(0, cap - pick.length));
  return shuffle(pick);
}
let lastGrade = { id: null, t: 0 };
function gradeCard(id, knew) {
  const now = Date.now();
  if (lastGrade.id === id && Math.abs(now - lastGrade.t) < 1000) return null;   // same card twice within a second: ignore
  lastGrade = { id, t: now };
  const t = today();
  const r = S.cards[id] || { box: 1, due: t, seen: 0, ok: 0, last: null, first: t, t: 0 };
  const from = r.box;
  r.seen += 1;
  if (knew) { r.ok += 1; r.box = Math.min(5, r.box + 1); } else { r.box = 1; }
  r.due = addDays(t, IX.intervals[r.box - 1] || 0);
  r.last = t;
  if (!r.first) r.first = t;
  r.t = now;
  S.cards[id] = r;
  bumpActivity();
  touch();
  return { from, to: r.box, due: r.due };
}

/* ----- quiz ----- */
function questionPool(f) {
  return D.questions.filter((q) =>
    (!f.topics || f.topics.size === 0 || f.topics.has(q.topic)) &&
    (!f.ks || f.ks.size === 0 || f.ks.has(q.k)) &&
    (!f.core || q.core));
}
function drawQuestions(f, n) {
  const rows = questionPool(f).map((q) => {
    const r = S.questions[q.id];
    const seen = r ? r.seen : 0;
    return { q, seen, acc: seen ? r.ok / seen : 0, rnd: Math.random() };
  });
  rows.sort((a, b) => ((a.seen > 0) - (b.seen > 0)) || (a.acc - b.acc) || (a.rnd - b.rnd));   // unseen first, then weakest, ties random
  const take = (n === Infinity || n >= rows.length) ? rows : rows.slice(0, n);
  return shuffle(take.map((r) => r.q));
}
function recordAnswer(q, correct) {
  const r = S.questions[q.id] || { seen: 0, ok: 0, lastOk: false, t: 0 };
  r.seen += 1;
  if (correct) r.ok += 1;
  r.lastOk = correct;
  r.t = Date.now();
  S.questions[q.id] = r;
  bumpActivity();
  touch();
}

/* ----- exam simulator ----- */
const examShort = (id) => String(D.exams[id].name).split(' (')[0];
const passMark = (total) => Math.ceil(total * IX.passPercent / 100);
function examResult(snap) {
  const n = snap.ids.length;
  let correct = 0;
  const byTopic = {}, byK = {};
  snap.ids.forEach((id, i) => {
    const q = IX.question.get(id);
    const ok = snap.answers[i] === q.answer;
    if (ok) correct++;
    const bt = byTopic[q.topic] || (byTopic[q.topic] = [0, 0]); bt[1]++; if (ok) bt[0]++;
    const bk = byK[q.k] || (byK[q.k] = [0, 0]); bk[1]++; if (ok) bk[0]++;
  });
  return { correct, total: n, passed: correct >= passMark(n), byTopic, byK, answered: snap.answers.filter((a) => a >= 0).length };
}
/* Exam scope: every topic, or only the topics of the ISTQB exam-preparation track. */
function examPool(scope) {
  if (scope === 'istqb') {
    const tr = IX.track.get('istqb');
    const ids = new Set(tr ? tr.topics : []);
    return D.questions.filter((q) => ids.has(q.topic));
  }
  return D.questions.slice();
}
/* Largest-remainder split of n over the topics in proportion to their pool size. A quota never exceeds the pool of its topic. */
function examQuotas(sizes, n) {
  const total = sum(Array.from(sizes.values()));
  const out = new Map(), rest = [];
  let given = 0;
  for (const [t, c] of sizes) {
    const exact = total ? n * c / total : 0, base = Math.floor(exact);
    out.set(t, base); given += base; rest.push({ t, frac: exact - base, rnd: Math.random() });
  }
  rest.sort((a, b) => (b.frac - a.frac) || (a.rnd - b.rnd));
  for (let i = 0; given < n && i < rest.length; i++, given++) out.set(rest[i].t, out.get(rest[i].t) + 1);
  return out;
}
/* A mock exam should sample the whole syllabus, not whatever random draw clumps in one topic. Inside a topic, questions
   answered longest ago (or never) come first, so repeated mocks cycle through the bank before a question comes back. */
function drawExamQuestions(pool, n) {
  const byTopic = groupBy(pool, 'topic');
  const sizes = new Map(Array.from(byTopic, ([t, list]) => [t, list.length]));
  const quota = examQuotas(sizes, Math.min(n, pool.length));
  const picked = [];
  for (const [t, list] of byTopic) {
    const rows = list.map((q) => ({ q, last: S.questions[q.id] ? (S.questions[q.id].t || 1) : 0, rnd: Math.random() }));
    rows.sort((a, b) => (a.last - b.last) || (a.rnd - b.rnd));
    for (const r of rows.slice(0, quota.get(t) || 0)) picked.push(r.q.id);
  }
  return shuffle(picked);
}
function startExamRun(profileId, extra, scope) {
  const P = D.exams[profileId];
  const pool = examPool(scope);
  const ids = drawExamQuestions(pool, P.questions);
  const n = ids.length;
  const minutes = Math.round(P.minutes * (extra ? 1.25 : 1));
  const now = Date.now();
  S.exam = {
    profile: profileId, started: now, deadline: now + minutes * 60000, minutes, extra: !!extra,
    ids, answers: new Array(n).fill(-1), flags: new Array(n).fill(0), cur: 0, w10: false, w1: false
  };
  S.examT = now;
  touch();
  return { n, short: n < P.questions };
}
function finalizeExam(run) {
  const res = examResult(run);
  const now = Date.now();
  run.ids.forEach((id, i) => {
    if (run.answers[i] < 0) return;
    const q = IX.question.get(id);
    const ok = run.answers[i] === q.answer;
    const r = S.questions[id] || { seen: 0, ok: 0, lastOk: false, t: 0 };
    r.seen += 1; if (ok) r.ok += 1; r.lastOk = ok; r.t = now;
    S.questions[id] = r;
  });
  bumpActivity(res.answered);
  const fin = new Date(now).toISOString();
  S.exams.push({ profile: run.profile, finished: fin, correct: res.correct, total: res.total, passed: res.passed, byTopic: res.byTopic, byK: res.byK, t: now });
  if (S.exams.length > 50) S.exams = S.exams.slice(-50);
  S.lastExam = { profile: run.profile, ids: run.ids.slice(), answers: run.answers.slice(), flags: run.flags.slice(), finished: fin, t: now };
  S.exam = null;
  S.examT = now;
  touch();
  return res;
}
