/* ===== 10 dataset, progress document, merge, persistence, optional sync ===== */
let D = null;            // dataset (read only)
const IX = {};           // indexes built from the dataset
let S = null;            // progress document; always read through this binding, never keep a copy

function checkDataset(d) {
  try {
    const major = parseInt(String(d.meta.datasetVersion).split('.')[0], 10);
    if (major !== 1) return 'This app supports dataset version 1.x, but the data is version ' + d.meta.datasetVersion + '.';
    const need = ['topics', 'tracks', 'modules', 'glossary', 'flashcards', 'questions', 'testcases', 'labs', 'resources', 'tools', 'certifications'];
    for (const k of need) if (!Array.isArray(d[k]) || !d[k].length) return 'The dataset is missing "' + k + '".';
    if (!d.roadmap || !Array.isArray(d.roadmap.stages) || !d.exams || !d.reference || !d.app) return 'The dataset is incomplete.';
    for (const q of d.questions) {
      if (!Array.isArray(q.options) || q.options.length !== 4 || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
        return 'Question ' + q.id + ' has no valid answer key.';
      }
    }
    return null;
  } catch (e) { return 'The dataset could not be read.'; }
}

let D_TEXT = '';         // the English dataset as embedded; every language change starts again from this text
function loadData() {
  try { D_TEXT = document.getElementById('hub-data').textContent; D = JSON.parse(D_TEXT); } catch (e) { return 'The study data is missing or damaged.'; }
  const err = checkDataset(D);
  if (err) return err;
  buildIndex();
  return null;
}

/* ----- translated dataset text (overlays) -----
   An overlay file holds only text, keyed by record id. It can never change an id, an answer key, a K-level, a flag or a number.
   A record is translated all or nothing (a question needs its stem, four options and explanation together), so a half-finished
   translation can never put the wrong option under the answer key. Anything missing or malformed stays in English. */
const ovStr = (x) => typeof x === 'string' && x.length > 0 && x.length < 6000;
const ovList = (x, n) => Array.isArray(x) && x.length === n && x.every(ovStr);
function applyOverlay(d, ov) {
  const cover = {};
  if (!isObj(ov)) return cover;
  const part = (key) => (isObj(ov[key]) ? ov[key] : {});
  const fieldsOf = (coll, key, fields, idOf) => {
    const src = part(key);
    let n = 0;
    for (const rec of d[coll]) {
      const o = src[idOf ? idOf(rec) : rec.id];
      if (!isObj(o) || !fields.every((f) => ovStr(o[f]))) continue;
      for (const f of fields) rec[f] = o[f];
      n++;
    }
    cover[key] = [n, d[coll].length];
  };
  fieldsOf('tracks', 'tracks', ['name', 'description']);
  fieldsOf('topics', 'topics', ['name', 'scope']);
  fieldsOf('glossary', 'glossary', ['term', 'definition']);
  fieldsOf('flashcards', 'flashcards', ['q', 'a']);
  fieldsOf('testcases', 'testcases', ['group', 'feature', 'test', 'expected']);
  fieldsOf('certifications', 'certifications', ['fits', 'notes']);
  fieldsOf('tools', 'tools', ['purpose', 'use']);
  fieldsOf('labs', 'labs', ['focus']);
  fieldsOf('resources', 'resources', ['note']);

  const q = part('questions');
  let nq = 0;
  for (const rec of d.questions) {
    const o = q[rec.id];
    if (!isObj(o) || !ovStr(o.stem) || !ovStr(o.explanation) || !ovList(o.options, rec.options.length)) continue;
    rec.stem = o.stem; rec.explanation = o.explanation; rec.options = o.options.slice();   // same order, same count, so the stored answer index still points at the right option
    nq++;
  }
  cover.questions = [nq, d.questions.length];

  const mo = part('modules');
  let nm = 0;
  for (const rec of d.modules) {
    const o = mo[rec.id];
    if (!isObj(o) || !ovStr(o.title) || !ovStr(o.summary) || !ovList(o.objectives, rec.objectives.length) ||
      !ovList(o.keyPoints, rec.keyPoints.length) || !ovList(o.practice, rec.practice.length)) continue;
    rec.title = o.title; rec.summary = o.summary;
    rec.objectives = rec.objectives.map((x, i) => ({ k: x.k, text: o.objectives[i] }));
    rec.keyPoints = o.keyPoints.slice(); rec.practice = o.practice.slice();
    nm++;
  }
  cover.modules = [nm, d.modules.length];

  const rm = isObj(ov.roadmap) ? ov.roadmap : {};
  const stages = isObj(rm.stages) ? rm.stages : {}, specs = isObj(rm.specialisations) ? rm.specialisations : {};
  let ns = 0;
  for (const s of d.roadmap.stages) {
    const o = stages[String(s.id)];
    if (isObj(o) && ovStr(o.name) && ovStr(o.focus) && ovStr(o.gate)) { s.name = o.name; s.focus = o.focus; s.gate = o.gate; ns++; }
  }
  for (const s of d.roadmap.specialisations) {
    const o = specs[s.id];
    if (isObj(o) && ovStr(o.name) && ovStr(o.portfolioProject)) { s.name = o.name; s.portfolioProject = o.portfolioProject; }
  }
  if (ovStr(rm.totalHoursNote)) d.roadmap.totalHoursNote = rm.totalHoursNote;
  cover.roadmap = [ns, d.roadmap.stages.length];

  const refs = part('reference');
  let nr = 0, nrt = 0;
  for (const key of Object.keys(d.reference)) {
    nrt++;
    const T = d.reference[key], o = refs[key];
    if (!isObj(o) || !isObj(o.columns) || !Array.isArray(o.rows) || o.rows.length !== T.rows.length) continue;
    if (!T.columns.every((c) => ovStr(o.columns[c.key]))) continue;
    /* every text cell (a string, or a list of strings) needs a translated cell of the same shape; numbers and nulls stay as they are */
    const cellOk = (base, v) => (typeof base === 'string' ? ovStr(v) : (Array.isArray(base) ? ovList(v, base.length) : true));
    if (!T.rows.every((row, i) => isObj(o.rows[i]) && Object.keys(row).every((k) => cellOk(row[k], o.rows[i][k])))) continue;
    for (const c of T.columns) c.label = o.columns[c.key];
    T.rows = T.rows.map((row, i) => {
      const out = Object.assign({}, row);
      for (const k of Object.keys(row)) if (typeof row[k] === 'string' || Array.isArray(row[k])) out[k] = o.rows[i][k];
      return out;
    });
    nr++;
  }
  cover.reference = [nr, nrt];

  const ex = part('exams');
  for (const id of Object.keys(d.exams)) if (isObj(ex[id]) && ovStr(ex[id].note)) d.exams[id].note = ex[id].note;
  if (isObj(ov.meta)) { if (ovStr(ov.meta.title)) d.meta.title = ov.meta.title; if (ovStr(ov.meta.notice)) d.meta.notice = ov.meta.notice; }
  return cover;
}

function loadOverlay(id) {
  const el = document.getElementById('hub-lang-' + id);
  if (!el) return null;
  try { return JSON.parse(el.textContent); } catch (e) { return null; }
}

/* Choose the language from the setting (or the device), rebuild the dataset in that language and set the page language. */
function applyLanguage() {
  const id = pickLang(S ? S.settings.lang : 'auto');
  setUiLang(id);
  D = JSON.parse(D_TEXT);
  LOC.cover = id === 'en' ? null : applyOverlay(D, loadOverlay(id));
  buildIndex();
  document.documentElement.setAttribute('lang', LOC.tag);
  document.title = __('Security Testing Study Hub');
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', __('A self-paced study app for security testing and cybersecurity: roadmap, flashcards, practice questions, exam simulator, glossary, test cases and labs.'));
}
function byId(list, key) { return new Map(list.map((x) => [x[key || 'id'], x])); }
function groupBy(list, key) {
  const m = new Map();
  for (const x of list) { if (!m.has(x[key])) m.set(x[key], []); m.get(x[key]).push(x); }
  return m;
}
function buildIndex() {
  IX.topic = byId(D.topics);
  IX.track = byId(D.tracks);
  IX.module = byId(D.modules);
  IX.moduleByTopic = byId(D.modules, 'topic');
  IX.card = byId(D.flashcards);
  IX.question = byId(D.questions);
  IX.term = byId(D.glossary);
  IX.testcase = byId(D.testcases);
  IX.stage = new Map(D.roadmap.stages.map((s) => [String(s.id), s]));
  IX.spec = byId(D.roadmap.specialisations);
  IX.cardsByTopic = groupBy(D.flashcards, 'topic');
  IX.qByTopic = groupBy(D.questions, 'topic');
  IX.termsByTopic = groupBy(D.glossary, 'topic');
  IX.glossarySorted = D.glossary.slice().sort((a, b) => a.term.localeCompare(b.term, LOC.lang, { sensitivity: 'base', numeric: true }));
  IX.intervals = (D.app.leitner && D.app.leitner.intervalsDays) || [0, 1, 3, 7, 14];
  IX.passPercent = (D.app.quiz && D.app.quiz.passPercent) || 65;
}

/* ----- progress document ----- */
function defaultProgress() {
  return {
    v: 1, updated: 0, resetAt: 0,
    settings: { theme: 'system', lang: 'auto', hoursPerWeek: 6, startDate: today(), extraTime: false, t: 0 },
    roadmap: { gates: {}, specialisation: null },
    modules: {}, cards: {}, questions: {}, testcases: {},
    exams: [], lastExam: null, activity: {},
    exam: null, examT: 0
  };
}

const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const numIn = (x, lo, hi) => (typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi ? x : null);
const intIn = (x, lo, hi) => (Number.isInteger(x) && x >= lo && x <= hi ? x : null);
const tnum = (x) => { const n = numIn(x, 0, 4102444800000); return n === null ? 0 : n; };
const THEMES = ['system', 'light', 'dark'];

function doneRec(v) {
  if (typeof v === 'boolean') return { done: v, t: 0, at: null };
  if (isObj(v) && typeof v.done === 'boolean') {
    const at = (typeof v.at === 'string' && v.at.length < 40 && !Number.isNaN(Date.parse(v.at))) ? v.at : null;
    return { done: v.done, t: tnum(v.t), at };
  }
  return null;
}

function normSnapshot(r, needTimes) {
  if (!isObj(r) || !D.exams[r.profile]) return null;
  if (!Array.isArray(r.ids) || r.ids.length < 1 || r.ids.length > 200) return null;
  if (!r.ids.every((id) => typeof id === 'string' && IX.question.has(id)) || new Set(r.ids).size !== r.ids.length) return null;
  const n = r.ids.length;
  if (!Array.isArray(r.answers) || r.answers.length !== n || !r.answers.every((a) => Number.isInteger(a) && a >= -1 && a <= 3)) return null;
  if (!Array.isArray(r.flags) || r.flags.length !== n || !r.flags.every((f) => f === 0 || f === 1)) return null;
  const out = { profile: r.profile, ids: r.ids.slice(), answers: r.answers.slice(), flags: r.flags.slice() };
  if (needTimes) {
    const started = numIn(r.started, 1e12, 4.2e12), deadline = numIn(r.deadline, 1e12, 4.2e12), minutes = numIn(r.minutes, 1, 1000);
    if (started === null || deadline === null || minutes === null || deadline <= started) return null;
    Object.assign(out, {
      started, deadline, minutes, extra: r.extra === true,
      cur: clamp(Number.isInteger(r.cur) ? r.cur : 0, 0, n - 1), w10: r.w10 === true, w1: r.w1 === true
    });
  } else {
    if (typeof r.finished !== 'string' || Number.isNaN(Date.parse(r.finished))) return null;
    out.finished = r.finished.slice(0, 40);
    out.t = tnum(r.t);
  }
  return out;
}

function normExamEntry(e) {
  if (!isObj(e) || !D.exams[e.profile]) return null;
  if (typeof e.finished !== 'string' || e.finished.length > 40 || Number.isNaN(Date.parse(e.finished))) return null;
  const total = intIn(e.total, 1, 200), correct = total === null ? null : intIn(e.correct, 0, total);
  if (total === null || correct === null || typeof e.passed !== 'boolean') return null;
  const pairs = (src, valid) => {
    const out = {};
    if (!isObj(src)) return out;
    for (const k of Object.keys(src)) {
      if (!valid(k)) continue;
      const v = src[k];
      const ok = Array.isArray(v) ? v[0] : (isObj(v) ? v.ok : null), tot = Array.isArray(v) ? v[1] : (isObj(v) ? v.total : null);
      const t2 = intIn(tot, 0, 200), o2 = t2 === null ? null : intIn(ok, 0, t2);
      if (t2 !== null && o2 !== null) out[k] = [o2, t2];
    }
    return out;
  };
  return {
    profile: e.profile, finished: e.finished, correct, total, passed: e.passed,
    byTopic: pairs(e.byTopic, (k) => IX.topic.has(k)),
    byK: pairs(e.byK, (k) => /^K[1-4]$/.test(k)),
    t: tnum(e.t) || Date.parse(e.finished)
  };
}

/* Returns { doc, problems, fatal }. Unknown ids and unknown fields are dropped silently; malformed records are
   reported in `problems` and dropped. Callers that import a file treat any problem as a rejection. */
function normalizeProgress(raw) {
  const problems = [];
  const bad = (m) => { if (problems.length < 20) problems.push(m); };
  const P = defaultProgress();
  if (!isObj(raw)) { bad('The data is not a JSON object.'); return { doc: P, problems, fatal: true }; }
  if (raw.v !== 1) { bad('Unsupported version: expected "v": 1.'); return { doc: P, problems, fatal: true }; }
  P.updated = tnum(raw.updated); P.examT = tnum(raw.examT); P.resetAt = tnum(raw.resetAt);

  if (raw.settings !== undefined) {
    if (!isObj(raw.settings)) bad('"settings" must be an object.');
    else {
      const s = raw.settings, o = P.settings;
      if (s.theme !== undefined) { if (THEMES.includes(s.theme)) o.theme = s.theme; else bad('settings.theme must be system, light or dark.'); }
      if (s.lang !== undefined) { if (LANG_PREFS.includes(s.lang)) o.lang = s.lang; else bad('settings.lang must be auto, en, uk, pl, es or de.'); }
      if (s.hoursPerWeek !== undefined) { const n = intIn(s.hoursPerWeek, 1, 40); if (n === null) bad('settings.hoursPerWeek must be a whole number from 1 to 40.'); else o.hoursPerWeek = n; }
      if (s.startDate !== undefined) { if (isYmd(s.startDate)) o.startDate = s.startDate; else bad('settings.startDate must be a date such as 2026-11-01.'); }
      if (s.extraTime !== undefined) { if (typeof s.extraTime === 'boolean') o.extraTime = s.extraTime; else bad('settings.extraTime must be true or false.'); }
      o.t = tnum(s.t);
    }
  }
  if (raw.roadmap !== undefined) {
    if (!isObj(raw.roadmap)) bad('"roadmap" must be an object.');
    else {
      const g = raw.roadmap.gates;
      if (g !== undefined) {
        if (!isObj(g)) bad('roadmap.gates must be an object.');
        else for (const k of Object.keys(g)) {
          if (!IX.stage.has(k)) continue;
          const r = doneRec(g[k]);
          if (r === null) bad('roadmap.gates.' + k + ' must be true, false or an object with "done".'); else P.roadmap.gates[k] = r;
        }
      }
      const sp = raw.roadmap.specialisation;
      if (sp !== undefined && sp !== null) {
        const id = typeof sp === 'string' ? sp : (isObj(sp) ? sp.id : undefined);
        if (typeof id !== 'string') bad('roadmap.specialisation must be an id.');
        else if (IX.spec.has(id)) P.roadmap.specialisation = { id, t: isObj(sp) ? tnum(sp.t) : 0 };
      }
    }
  }
  if (raw.modules !== undefined) {
    if (!isObj(raw.modules)) bad('"modules" must be an object.');
    else for (const id of Object.keys(raw.modules)) {
      if (!IX.module.has(id)) continue;
      const r = doneRec(raw.modules[id]);
      if (r === null) bad('modules.' + id + ' must be an object with "done".'); else P.modules[id] = r;
    }
  }
  if (raw.testcases !== undefined) {
    if (!isObj(raw.testcases)) bad('"testcases" must be an object.');
    else for (const id of Object.keys(raw.testcases)) {
      if (!IX.testcase.has(id)) continue;
      const r = doneRec(raw.testcases[id]);
      if (r === null) bad('testcases.' + id + ' must be true, false or an object with "done".'); else P.testcases[id] = r;
    }
  }
  if (raw.cards !== undefined) {
    if (!isObj(raw.cards)) bad('"cards" must be an object.');
    else for (const id of Object.keys(raw.cards)) {
      if (!IX.card.has(id)) continue;
      const r = raw.cards[id];
      if (!isObj(r)) { bad('cards.' + id + ' must be an object.'); continue; }
      const box = intIn(r.box, 1, 5), seen = intIn(r.seen, 1, 1000000), ok = intIn(r.ok, 0, 1000000);
      if (box === null) { bad('cards.' + id + '.box must be a whole number from 1 to 5.'); continue; }
      if (!isYmd(r.due)) { bad('cards.' + id + '.due must be a date such as 2026-11-04.'); continue; }
      if (seen === null || ok === null || ok > seen) { bad('cards.' + id + ' has invalid "seen" or "ok" counts.'); continue; }
      P.cards[id] = { box, due: r.due, seen, ok, last: isYmd(r.last) ? r.last : null, first: isYmd(r.first) ? r.first : null, t: tnum(r.t) };
    }
  }
  if (raw.questions !== undefined) {
    if (!isObj(raw.questions)) bad('"questions" must be an object.');
    else for (const id of Object.keys(raw.questions)) {
      if (!IX.question.has(id)) continue;
      const r = raw.questions[id];
      if (!isObj(r)) { bad('questions.' + id + ' must be an object.'); continue; }
      const seen = intIn(r.seen, 0, 1000000), ok = seen === null ? null : intIn(r.ok, 0, seen);
      if (seen === null || ok === null) { bad('questions.' + id + ' has invalid "seen" or "ok" counts.'); continue; }
      P.questions[id] = { seen, ok, lastOk: r.lastOk === true, t: tnum(r.t) };
    }
  }
  if (raw.exams !== undefined) {
    if (!Array.isArray(raw.exams)) bad('"exams" must be a list.');
    else for (const e of raw.exams.slice(-50)) {
      const x = normExamEntry(e);
      if (x) P.exams.push(x); else bad('An entry in "exams" is malformed.');
    }
  }
  if (raw.lastExam !== undefined && raw.lastExam !== null) {
    const x = normSnapshot(raw.lastExam, false);
    if (x) P.lastExam = x; else bad('"lastExam" is malformed.');
  }
  if (raw.activity !== undefined) {
    if (!isObj(raw.activity)) bad('"activity" must be an object.');
    else {
      const keys = Object.keys(raw.activity).filter((k) => isYmd(k)).sort().slice(-400);
      for (const k of keys) { const n = intIn(raw.activity[k], 0, 100000); if (n !== null) P.activity[k] = n; }
    }
  }
  if (raw.exam !== undefined && raw.exam !== null) {
    const x = normSnapshot(raw.exam, true);
    if (x) P.exam = x; else bad('"exam" (an exam in progress) is malformed and was ignored.');
  }
  return { doc: P, problems, fatal: false };
}

/* ----- merge of two normalised documents (used by sync and tests) ----- */
function pickNewer(x, y, getT) { // ties keep x
  if (!x) return y; if (!y) return x;
  return getT(y) > getT(x) ? y : x;
}
function mergeMap(a, b, better) {
  const out = {};
  const keys = new Set(Object.keys(a).concat(Object.keys(b)));
  for (const k of keys) {
    const x = a[k], y = b[k];
    out[k] = (x && y) ? better(x, y) : (x || y);
  }
  return out;
}
function mergeProgress(a, b) {
  const out = defaultProgress();
  out.v = 1;
  out.updated = Math.max(a.updated, b.updated);
  out.resetAt = Math.max(a.resetAt, b.resetAt);
  const newerT = (x, y) => ((y.t || 0) > (x.t || 0) ? y : x);
  out.settings = Object.assign({}, b.settings.t > a.settings.t ? b.settings : a.settings);
  out.roadmap.gates = mergeMap(a.roadmap.gates, b.roadmap.gates, newerT);
  out.roadmap.specialisation = pickNewer(a.roadmap.specialisation, b.roadmap.specialisation, (x) => x.t || 0);
  out.modules = mergeMap(a.modules, b.modules, newerT);
  out.testcases = mergeMap(a.testcases, b.testcases, newerT);
  out.cards = mergeMap(a.cards, b.cards, (x, y) => {
    if ((y.t || 0) !== (x.t || 0)) return (y.t || 0) > (x.t || 0) ? y : x;
    if (y.seen !== x.seen) return y.seen > x.seen ? y : x;
    return (y.last || '') > (x.last || '') ? y : x;
  });
  out.questions = mergeMap(a.questions, b.questions, (x, y) => {
    if (y.seen !== x.seen) return y.seen > x.seen ? y : x;
    return (y.t || 0) > (x.t || 0) ? y : x;
  });
  /* A reset or an import raises resetAt; anything older than it is dropped, so it cannot come back from another device. */
  const ra = out.resetAt;
  if (ra) {
    for (const m of [out.modules, out.testcases, out.cards, out.questions, out.roadmap.gates]) {
      for (const k of Object.keys(m)) if ((m[k].t || 0) < ra) delete m[k];
    }
    if (out.roadmap.specialisation && (out.roadmap.specialisation.t || 0) < ra) out.roadmap.specialisation = null;
  }
  const seenEx = new Map();
  for (const e of a.exams.concat(b.exams)) {
    if (ra && (e.t || 0) < ra) continue;
    seenEx.set(e.profile + '|' + e.finished, e);
  }
  out.exams = Array.from(seenEx.values()).sort((x, y) => Date.parse(x.finished) - Date.parse(y.finished)).slice(-50);
  out.lastExam = pickNewer(a.lastExam, b.lastExam, (x) => Date.parse(x.finished) || 0);
  if (out.lastExam && ra && (out.lastExam.t || 0) < ra) out.lastExam = null;
  if (a.resetAt > b.resetAt) out.activity = Object.assign({}, a.activity);
  else if (b.resetAt > a.resetAt) out.activity = Object.assign({}, b.activity);
  else out.activity = mergeMap(a.activity, b.activity, (x, y) => Math.max(x, y));
  if (b.examT > a.examT) { out.exam = b.exam; out.examT = b.examT; } else { out.exam = a.exam; out.examT = a.examT; }
  return out;
}

/* Give every record a fresh timestamp: used after an import or a reset so the new state wins any later merge. */
function stampAll(doc, now) {
  doc.updated = now;
  doc.settings.t = now;
  for (const m of [doc.roadmap.gates, doc.modules, doc.testcases, doc.cards, doc.questions]) for (const k of Object.keys(m)) m[k].t = now;
  if (doc.roadmap.specialisation) doc.roadmap.specialisation.t = now;
  for (const e of doc.exams) e.t = now;
  if (doc.lastExam) doc.lastExam.t = now;
  doc.examT = now;
  return doc;
}

/* ----- local persistence ----- */
const store = { ok: true, badBlob: null, loadNote: false };
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

function loadLocal() {
  const raw = lsGet(KEY);
  if (raw === null) return defaultProgress();
  try {
    const res = normalizeProgress(JSON.parse(raw));
    if (res.fatal) throw new Error('unreadable');
    return res.doc;
  } catch (e) {
    store.badBlob = raw;
    lsSet(BAD_KEY, raw);
    store.loadNote = true;      // the message is worded in refreshNotices, once the language is known
    return defaultProgress();
  }
}

let saveTimer = 0, dirty = false;
function touch() {
  S.updated = Date.now();
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushLocal, 250);
}
function pruneActivity() {
  const keys = Object.keys(S.activity).sort();
  if (keys.length > 400) for (const k of keys.slice(0, keys.length - 400)) delete S.activity[k];
}
function flushLocal() {
  clearTimeout(saveTimer);
  if (!dirty) return;
  dirty = false;
  pruneActivity();
  store.ok = lsSet(KEY, JSON.stringify(S));
  refreshNotices();
  scheduleRemote();
}
function bumpActivity(n) {
  const d = today();
  S.activity[d] = Math.min(100000, (S.activity[d] || 0) + (n || 1));
}

/* ----- optional sync through the page's db capability (a private per-user document) ----- */
const sync = { state: 'off', ref: null, timer: 0, busy: false, again: false, last: '', err: '', failedAt: 0, notify: null };

async function initSync() {
  try {
    if (!window.claude || typeof window.claude.use !== 'function') { sync.state = 'off'; return; }
    sync.state = 'connecting';
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    const uid = user ? await user.id() : null;
    if (!db || !uid) { sync.state = 'off'; return; }
    sync.ref = db.collection('data/users/' + uid).doc('progress');
    await syncNow(true);
  } catch (e) {
    sync.state = 'error'; sync.err = (e && e.code) || 'unknown';
  }
  refreshNotices();
}

async function syncNow(first) {
  if (!sync.ref) return;
  if (sync.busy) { sync.again = true; return; }
  sync.busy = true;
  try {
    const snap = await sync.ref.get();
    let merged = S;
    if (snap.exists) {
      const res = normalizeProgress(snap.data());
      if (!res.fatal) merged = mergeProgress(S, res.doc);
    }
    const before = JSON.stringify(S), after = JSON.stringify(merged);
    if (after !== before) { S = merged; dirty = true; clearTimeout(saveTimer); saveTimer = setTimeout(flushLocal, 250); }
    const untouched = first && !snap.exists && S.updated === 0;   // nothing to save yet: do not create an empty document
    if (after !== sync.last && !untouched) {
      await sync.ref.set(JSON.parse(JSON.stringify(merged)));
      sync.last = after;
    }
    sync.state = 'on'; sync.err = '';
    if (first && after !== before && typeof sync.notify === 'function') sync.notify();
  } catch (e) {
    sync.state = 'error'; sync.err = (e && e.code) || 'unknown'; sync.failedAt = Date.now();
  } finally {
    sync.busy = false;
    refreshNotices();
    if (sync.again) { sync.again = false; scheduleRemote(); }
  }
}
function scheduleRemote() {
  if (!sync.ref) return;
  if (sync.state === 'error' && /^(invalid_argument|quota_exceeded|revoked|not_granted|capability_disabled|capability_removed)$/.test(sync.err)) return;
  clearTimeout(sync.timer);
  const wait = (sync.state === 'error' && Date.now() - sync.failedAt < 20000) ? 20000 : 1500;
  sync.timer = setTimeout(() => syncNow(false), wait);
}
function flushNow() {
  flushLocal();
}
