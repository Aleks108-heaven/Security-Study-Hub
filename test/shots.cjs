/* Screenshots and an axe-core scan of every screen, with a realistic progress document. Usage: node test/shots.cjs */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const URL = 'file://' + path.resolve(__dirname, '../dist/hub-app.test.html');
const DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/security-hub-data.min.json'), 'utf8'));
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const KEY = 'sechub.progress.v1';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const NOAXE = !!process.env.NOAXE;

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const dayOffset = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };

function seed() {
  const now = Date.now();
  const doc = {
    v: 1, updated: now, resetAt: 0, examT: 0, exam: null, lastExam: null,
    settings: { theme: 'system', hoursPerWeek: 8, startDate: dayOffset(-24), extraTime: false, t: now },
    roadmap: { gates: {}, specialisation: { id: 'appsec-devsecops', t: now } },
    modules: {}, cards: {}, questions: {}, testcases: {}, exams: [], activity: {}
  };
  for (const g of [0, 1]) doc.roadmap.gates[String(g)] = { done: true, t: now, at: new Date().toISOString() };
  DATA.modules.slice(0, 4).forEach((m) => { doc.modules[m.id] = { done: true, t: now, at: new Date().toISOString() }; });
  DATA.flashcards.slice(0, 120).forEach((c, i) => {
    const box = (i % 5) + 1;
    const seen = 2 + (i % 4);
    const due = box === 1 ? dayOffset(-(i % 3)) : dayOffset((i % 9) - 3);
    doc.cards[c.id] = { box, due, seen, ok: Math.min(seen, box + (i % 2)), last: dayOffset(-(i % 6)), first: dayOffset(-20), t: now };
  });
  DATA.questions.slice(0, 70).forEach((q, i) => {
    const seen = 1 + (i % 3);
    doc.questions[q.id] = { seen, ok: i % 4 === 0 ? 0 : seen - (i % 5 === 0 ? 1 : 0), lastOk: i % 3 !== 0, t: now };
  });
  DATA.testcases.slice(0, 9).forEach((t) => { doc.testcases[t.id] = { done: true, t: now, at: new Date().toISOString() }; });
  for (let i = 0; i < 14; i++) if (i % 3 !== 2) doc.activity[dayOffset(-i)] = 6 + ((i * 7) % 25);
  doc.exams.push({
    profile: 'ct-ste', finished: new Date(now - 3 * 86400000).toISOString(), correct: 22, total: 40, passed: false,
    byTopic: { foundations: [4, 6], 'web-security': [5, 8] }, byK: { K1: [6, 8], K2: [10, 18], K3: [6, 14] }, t: now - 3 * 86400000
  });
  return doc;
}

const VIEWS = [
  ['home', '#home'], ['plan', '#plan'], ['modules', '#modules'], ['module-detail', '#mod-web'], ['cards', '#cards'],
  ['quiz', '#quiz'], ['exam', '#exam'], ['glossary', '#glossary'], ['tests', '#tests'], ['reference', '#ref-owaspTop10_2025'],
  ['labs', '#labs'], ['prefs', '#prefs']
];

async function axeScan(page, label, out) {
  if (NOAXE) return;
  await page.evaluate(AXE);
  const res = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, nodes: v.nodes.slice(0, 3).map((n) => ({ t: n.target.join(' '), s: (n.failureSummary || '').split('\n').slice(0, 3).join(' | ') })) }));
  });
  for (const v of res) out.push({ label, ...v });
}

(async () => {
  const browser = await chromium.launch();
  const configs = [
    { name: 'desktop-light', viewport: { width: 1280, height: 900 }, scheme: 'light' },
    { name: 'desktop-dark', viewport: { width: 1280, height: 900 }, scheme: 'dark' },
    { name: 'mobile-light', viewport: { width: 390, height: 844 }, scheme: 'light' },
    { name: 'mobile-dark', viewport: { width: 390, height: 844 }, scheme: 'dark' }
  ];
  const violations = [];
  const errors = [];
  for (const cfg of configs) {
    if (ONLY && !ONLY.includes(cfg.name)) continue;
    const ctx = await browser.newContext({ viewport: cfg.viewport, colorScheme: cfg.scheme, reducedMotion: 'reduce' });
    await ctx.addInitScript(([k, v]) => { try { if (!localStorage.getItem(k)) localStorage.setItem(k, v); } catch (e) { /* ignore */ } }, [KEY, JSON.stringify(seed())]);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(cfg.name + ' pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.|ERR_TUNNEL|ERR_NAME|ERR_INTERNET/.test(m.text())) errors.push(cfg.name + ' console: ' + m.text()); });
    for (const [name, hash] of VIEWS) {
      await page.goto(URL + hash);
      await page.waitForSelector('#view h1');
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(OUT, cfg.name + '-' + name + '.png'), fullPage: false });
      if (cfg.name === 'desktop-light' || cfg.name === 'mobile-dark') await page.screenshot({ path: path.join(OUT, cfg.name + '-' + name + '-full.png'), fullPage: true });
      await axeScan(page, cfg.name + ' ' + name, violations);
    }
    // states that need interaction
    const shot = async (name) => { await page.waitForTimeout(120); await page.screenshot({ path: path.join(OUT, cfg.name + '-' + name + '.png') }); };
    await page.goto(URL + '#cards'); await page.waitForSelector('#view h1');
    await page.click('button:has-text("Start session")');
    await page.waitForSelector('#flip'); await shot('cards-front'); await axeScan(page, cfg.name + ' cards-front', violations);
    await page.keyboard.press('Space'); await page.waitForSelector('#ans'); await shot('cards-back'); await axeScan(page, cfg.name + ' cards-back', violations);
    await page.keyboard.press('ArrowRight'); await page.waitForSelector('#flip'); await page.keyboard.press('Escape'); await page.waitForSelector('h1:has-text("Session complete")'); await shot('cards-done');

    await page.goto(URL + '#quiz'); await page.waitForSelector('#view h1');
    await page.click('button:has-text("Start quiz")'); await page.waitForSelector('.opt');
    await shot('quiz-question'); await axeScan(page, cfg.name + ' quiz-question', violations);
    await page.keyboard.press('2'); await page.waitForSelector('.feedback'); await shot('quiz-feedback'); await axeScan(page, cfg.name + ' quiz-feedback', violations);

    await page.goto(URL + '#exam'); await page.waitForSelector('#view h1');
    await page.click('button:has-text("Start ISTQB CT-STE mock exam")'); await page.waitForSelector('#timer');
    await page.keyboard.press('b'); await page.keyboard.press('n'); await page.keyboard.press('c'); await page.keyboard.press('f'); await page.keyboard.press('n');
    await shot('exam-running'); await axeScan(page, cfg.name + ' exam-running', violations);
    await page.click('#ask-submit'); await shot('exam-submit'); await axeScan(page, cfg.name + ' exam-submit', violations);
    await page.click('button:has-text("Submit now")');
    await page.waitForSelector('.passfail'); await shot('exam-result'); await axeScan(page, cfg.name + ' exam-result', violations);
    if (cfg.name === 'desktop-light' || cfg.name === 'mobile-dark') await page.screenshot({ path: path.join(OUT, cfg.name + '-exam-result-full.png'), fullPage: true });

    await page.goto(URL + '#prefs'); await page.waitForSelector('#view h1');
    await page.fill('#import-text', 'not json'); await page.click('button:has-text("Check and import")'); await shot('prefs-import-error');
    await ctx.close();
  }
  await browser.close();
  console.log('page errors:', errors.length ? errors : 'none');
  const grouped = {};
  for (const v of violations) { const k = v.id + ' [' + v.impact + '] ' + v.help; (grouped[k] = grouped[k] || []).push(v); }
  const keys = Object.keys(grouped);
  console.log('axe violation types:', keys.length);
  for (const k of keys) {
    console.log('\n- ' + k + '  (seen on ' + grouped[k].length + ' screens: ' + grouped[k].map((x) => x.label).slice(0, 8).join('; ') + ')');
    const first = grouped[k][0];
    for (const n of first.nodes) console.log('    ' + n.t + '   ' + n.s.slice(0, 220));
  }
})().catch((e) => { console.error('SHOTS ERROR', e); process.exit(2); });
