/* Checks for the assessment features, run in headless Chromium. Usage: node test/features.cjs [dist/hub-app.test.html]
   Covers: exam draw (scope, spread across topics, least-recently-answered first), the evidence rule behind mastery,
   the progress report, and the content security policy of the complete page. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FILE = path.resolve(__dirname, '..', process.argv[2] || 'dist/hub-app.test.html');
const URL = 'file://' + FILE;
const DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/security-hub-data.min.json'), 'utf8'));
const KEY = 'sechub.progress.v1';
const IGNORE = /ERR_TUNNEL_CONNECTION_FAILED|fonts\.googleapis|fonts\.gstatic|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/;
const QS = DATA.questions;
const QTOPIC = new Map(QS.map((q) => [q.id, q.topic]));
const ISTQB_TOPICS = new Set(DATA.tracks.find((t) => t.id === 'istqb').topics);

let passed = 0, failed = 0;
function ok(name, cond, extra) {
  if (cond) { passed++; console.log('  ok   ' + name); }
  else { failed++; console.log('  FAIL ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
}

async function open(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: o.locale || 'en-US', reducedMotion: 'reduce' });
  if (o.progress) await ctx.addInitScript(([k, v]) => { try { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }, [KEY, o.progress]);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) page.errors.push('console: ' + m.text()); });
  await page.goto(URL);
  await page.waitForSelector('#view h1');
  page.ctx = ctx;
  return page;
}
const progress = async (page) => { await page.waitForTimeout(400); return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY); };
const go = async (page, id) => { await page.evaluate((i) => { location.hash = i; }, id); await page.waitForTimeout(100); };
const doc = (extra) => Object.assign({ v: 1, settings: { lang: 'en' } }, extra || {});
const counts = (ids) => { const m = {}; for (const id of ids) m[QTOPIC.get(id)] = (m[QTOPIC.get(id)] || 0) + 1; return m; };
/* progress record for a question answered at time t */
const seenQ = (t, okLast) => ({ seen: 1, ok: okLast ? 1 : 0, lastOk: !!okLast, t });
const startExam = async (page, scope) => {
  await go(page, 'exam');
  if (scope) await page.selectOption('#exam-scope', scope);
  await page.click('button:has-text("Start ISTQB CT-STE mock exam")');
  await page.waitForSelector('#timer');
  return (await progress(page)).exam;
};

(async () => {
  const browser = await chromium.launch();

  console.log('\n1. Exam draw: scope and spread');
  {
    const page = await open(browser, { progress: doc() });
    await go(page, 'exam');
    const opts = await page.$$eval('#exam-scope option', (o) => o.map((x) => x.value));
    ok('the scope select offers all topics and the ISTQB track', opts.join() === 'all,istqb', opts);
    const run = await startExam(page);
    const c = counts(run.ids);
    ok('a CT-STE mock draws 40 distinct questions', run.ids.length === 40 && new Set(run.ids).size === 40, run.ids.length);
    ok('the draw covers at least 12 of the 14 topics', Object.keys(c).length >= 12, c);
    ok('no topic supplies more than 4 of the 40 questions', Math.max(...Object.values(c)) <= 4, c);
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }
  {
    const page = await open(browser, { progress: doc() });
    const run = await startExam(page, 'istqb');
    ok('"ISTQB track topics only" draws only from the track topics', run.ids.every((id) => ISTQB_TOPICS.has(QTOPIC.get(id))), counts(run.ids));
    ok('the ISTQB pool still yields 40 questions', run.ids.length === 40, run.ids.length);
    await page.ctx.close();
  }

  console.log('\n2. Exam draw: least recently answered first');
  {
    // every question was answered long ago except 30 never seen; inside each topic the unseen ones must be picked first
    const unseen = new Set(QS.filter((_, i) => i % 4 === 0).slice(0, 30).map((q) => q.id));
    const qrec = {};
    QS.forEach((q, i) => { if (!unseen.has(q.id)) qrec[q.id] = seenQ(1.7e12 + i * 1000, true); });
    const page = await open(browser, { progress: doc({ questions: qrec }) });
    const run = await startExam(page);
    const picked = counts(run.ids);
    const bad = [];
    for (const t of Object.keys(picked)) {
      const unseenInTopic = QS.filter((q) => q.topic === t && unseen.has(q.id)).map((q) => q.id);
      const unseenPicked = run.ids.filter((id) => QTOPIC.get(id) === t && unseen.has(id)).length;
      if (unseenPicked !== Math.min(unseenInTopic.length, picked[t])) bad.push([t, unseenPicked, unseenInTopic.length, picked[t]]);
    }
    ok('unseen questions are drawn before answered ones in every topic', bad.length === 0, bad);
    await page.ctx.close();
  }
  {
    // all answered: the oldest answers come back first
    const qrec = {};
    QS.forEach((q, i) => { qrec[q.id] = seenQ(1.7e12 + i * 1000, true); });
    const page = await open(browser, { progress: doc({ questions: qrec }) });
    const run = await startExam(page);
    const age = (id) => qrec[id].t;
    const bad = [];
    for (const t of Object.keys(counts(run.ids))) {
      const all = QS.filter((q) => q.topic === t).map((q) => q.id).sort((a, b) => age(a) - age(b));
      const n = run.ids.filter((id) => QTOPIC.get(id) === t).length;
      const expected = new Set(all.slice(0, n));
      if (!run.ids.filter((id) => QTOPIC.get(id) === t).every((id) => expected.has(id))) bad.push(t);
    }
    ok('when everything has been answered, the oldest answers are drawn first', bad.length === 0, bad);
    await page.ctx.close();
  }

  console.log('\n3. Evidence rule and the progress report');
  const TOPIC = 'web';
  const webIds = QS.filter((q) => q.topic === TOPIC).map((q) => q.id);
  const webName = DATA.topics.find((t) => t.id === TOPIC).name;
  const reportRow = async (page) => {
    await go(page, 'prefs');
    const text = await page.inputValue('#report-text');
    return { text, row: text.split('\n').find((l) => l.startsWith('| ' + webName + ' |')) };
  };
  {
    const four = {}; webIds.slice(0, 4).forEach((id) => { four[id] = seenQ(1.7e12, true); });
    const page = await open(browser, { progress: doc({ questions: four }) });
    const { text, row } = await reportRow(page);
    ok('the report panel is a read-only text area', await page.$eval('#report-text', (e) => e.readOnly));
    ok('the report starts with its title and has the expected sections', /^# Study progress report/.test(text) && ['## Summary', '## Mastery by topic', '## Mock exams (latest ten)', '## Focus areas', '## How to read this report'].every((h) => text.includes(h)));
    ok('four questions are too few: the row says so', row && row.includes('Low: fewer than 5 questions, cards only'), row);
    ok('four questions do not produce a weak-area flag', !/Strengthen/.test(text));
    ok('the report flags the thin topic in the focus areas', text.includes('Too few questions to rate (fewer than 5)') && text.includes(webName));
    await page.ctx.close();
  }
  {
    const five = {}; webIds.slice(0, 5).forEach((id) => { five[id] = seenQ(1.7e12, false); });
    const page = await open(browser, { progress: doc({ questions: five }) });
    const { text, row } = await reportRow(page);
    ok('five questions count: the row reports cards and questions', row && row.includes('Cards and questions') && row.includes('5 / ' + webIds.length), row);
    ok('five questions all wrong on the latest try raise a "Strengthen" flag', text.includes('Strengthen ' + webName), text.split('\n').filter((l) => l.startsWith('- ')));
    await page.ctx.close();
  }
  {
    // repeating one question adds no evidence, and a corrected miss stops counting against the topic
    const rec = {}; webIds.slice(0, 5).forEach((id) => { rec[id] = { seen: 3, ok: 1, lastOk: true, t: 1.7e12 }; });
    const page = await open(browser, { progress: doc({ questions: rec }) });
    const { text, row } = await reportRow(page);
    ok('accuracy uses the latest try: 5 corrected questions show 100%', row && /\| 100% \| Cards and questions \|$/.test(row), row);
    ok('corrected misses raise no weak-area flag', !/Strengthen/.test(text));
    await page.ctx.close();
    const one = { [webIds[0]]: { seen: 40, ok: 0, lastOk: false, t: 1.7e12 } };
    const p2 = await open(browser, { progress: doc({ questions: one }) });
    const r2 = await reportRow(p2);
    ok('forty tries of one question still count as one question', r2.row && r2.row.includes('1 / ' + webIds.length) && r2.row.includes('Low: fewer than 5 questions, cards only'), r2.row);
    await p2.ctx.close();
  }
  {
    // the report follows the interface language, and a pipe or newline in a cell cannot break the table
    const page = await open(browser, { locale: 'de-DE', progress: { v: 1, settings: { lang: 'auto' } } });
    await go(page, 'prefs');
    const de = await page.inputValue('#report-text');
    ok('the report is written in the interface language', /^# /.test(de) && !de.startsWith('# Study progress report'), de.split('\n')[0]);
    const lines = de.split('\n').filter((l) => l.startsWith('| '));
    const widths = new Set(lines.map((l) => (l.match(/(?<!\\)\|/g) || []).length));
    ok('every table row has a consistent column count in at least the topic table', lines.length > 10 && widths.size <= 4, [...widths]);
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  console.log('\n4. Content security policy of the complete page');
  {
    const page = await open(browser);
    const csp = await page.$eval('meta[http-equiv="Content-Security-Policy"]', (m) => m.content).catch(() => null);
    ok('the complete page carries a CSP meta tag', !!csp);
    ok('scripts and styles are restricted to hashes', csp && /script-src[^;]*'sha256-/.test(csp) && /style-src[^;]*'sha256-/.test(csp) && !/script-src[^;]*'unsafe-inline'/.test(csp), csp);
    ok('network requests from script are blocked (connect-src none)', csp && /connect-src 'none'/.test(csp));
    ok('no form can post data elsewhere', csp && /form-action 'none'/.test(csp));
    const violations = await page.evaluate(() => new Promise((res) => {
      const seen = [];
      document.addEventListener('securitypolicyviolation', (e) => seen.push(e.violatedDirective + ' ' + e.blockedURI));
      location.hash = 'prefs'; setTimeout(() => { location.hash = 'reference'; setTimeout(() => { location.hash = 'exam'; setTimeout(() => res(seen), 200); }, 200); }, 200);
    }));
    ok('browsing three screens triggers no policy violation', violations.length === 0, violations);
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  await browser.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
