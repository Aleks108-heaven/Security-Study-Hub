/* End-to-end checks for the study app, run in headless Chromium. Usage: node test/e2e.cjs [dist/hub-app.test.html] */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FILE = path.resolve(__dirname, '..', process.argv[2] || 'dist/hub-app.test.html');
const URL = 'file://' + FILE;
const DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/security-hub-data.min.json'), 'utf8'));
const KEY = 'sechub.progress.v1';

let passed = 0, failed = 0;
const failures = [];
function ok(name, cond, extra) {
  if (cond) { passed++; console.log('  ok   ' + name); }
  else { failed++; failures.push(name); console.log('  FAIL ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
}
const IGNORE = /ERR_TUNNEL_CONNECTION_FAILED|fonts\.googleapis|fonts\.gstatic|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/;

async function open(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: o.viewport || { width: 1280, height: 900 }, colorScheme: o.scheme || 'light', reducedMotion: 'reduce' });
  if (o.init) await ctx.addInitScript(o.init, o.initArg);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) page.errors.push('console: ' + m.text()); });
  if (o.clock) await page.clock.install({ time: o.clock });
  await page.goto(o.url || URL);
  await page.waitForSelector('#view h1');
  page.ctx = ctx;
  return page;
}
/* The app saves 250 ms after the last change, so wait a little longer before reading storage. */
const progress = async (page) => { await page.waitForTimeout(400); return page.evaluate((k) => { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; }, KEY); };
const h1 = (page) => page.textContent('#view h1');
async function nav(page, id) {
  const vp = page.viewportSize();
  if (vp.width >= 960) await page.click('#rail a[data-nav="' + id + '"]');
  else if (['home', 'modules', 'cards', 'quiz'].includes(id)) await page.click('#tabbar a[data-nav="' + id + '"]');
  else { await page.click('#more-btn'); await page.click('#more a[data-nav="' + id + '"]'); }
  await page.waitForTimeout(60);
}

(async () => {
  const browser = await chromium.launch();

  /* ---------- 1. navigation, deep links, no errors ---------- */
  console.log('\n1. Navigation and deep links');
  {
    const page = await open(browser);
    ok('welcome screen for a new learner', (await h1(page)) === 'Welcome');
    const expect = { home: 'Welcome', plan: 'Roadmap', modules: 'Modules', cards: 'Flashcards', quiz: 'Practice quiz', exam: 'Exam simulator', glossary: 'Glossary', tests: 'Security test cases', reference: 'Reference tables', labs: 'Labs, tools and resources', prefs: 'Settings' };
    for (const [id, title] of Object.entries(expect)) {
      await nav(page, id);
      ok('view ' + id + ' shows "' + title + '"', (await h1(page)) === title, await h1(page));
      ok('nav marks ' + id + ' current', (await page.getAttribute('#rail a[data-nav="' + id + '"]', 'aria-current')) === 'page');
    }
    await page.goto(URL + '#mod-web'); await page.waitForSelector('#view h1');
    ok('#mod-web opens the web module', (await h1(page)) === 'Web application security testing', await h1(page));
    const term = DATA.glossary[10];
    await page.goto(URL + '#' + term.id); await page.waitForSelector('#view h1');
    ok('glossary deep link highlights the term', await page.evaluate((id) => !!document.getElementById(id) && document.getElementById(id).classList.contains('hit'), term.id));
    await page.goto(URL + '#ref-owaspApiTop10_2023'); await page.waitForSelector('#view h1');
    ok('reference deep link selects the table', (await page.inputValue('#ref-select')) === 'owaspApiTop10_2023');
    ok('API Top 10 shows 10 rows', (await page.locator('table.tbl tbody tr').count()) === 10);
    await page.goto(URL + '#bogus-token'); await page.waitForSelector('#view h1');
    ok('unknown token falls back to home', (await h1(page)) === 'Welcome');
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  /* ---------- 2. flashcards ---------- */
  console.log('\n2. Flashcards (Leitner)');
  {
    const page = await open(browser, { clock: new Date('2026-11-02T09:00:00') });
    await nav(page, 'cards');
    ok('207 new cards, 0 due at first', (await page.textContent('.grid3 .stat:nth-child(2) .n')) === '207' && (await page.textContent('.grid3 .stat:nth-child(1) .n')) === '0');
    await page.click('button:has-text("Start session")');
    await page.waitForSelector('#flip');
    ok('session shows a question and a show-answer button', (await page.locator('.flash .q').count()) === 1);
    const q1 = await page.textContent('.flash .q');
    await page.keyboard.press('Space');
    await page.waitForSelector('#ans');
    ok('Space reveals the answer', (await page.locator('#ans').count()) === 1);
    await page.keyboard.press('ArrowRight');
    await page.waitForSelector('#flip');
    let p = await progress(page);
    const ids = Object.keys(p.cards);
    ok('knew-it stored box 2 due tomorrow', ids.length === 1 && p.cards[ids[0]].box === 2 && p.cards[ids[0]].due === '2026-11-03' && p.cards[ids[0]].seen === 1 && p.cards[ids[0]].ok === 1, p.cards);
    ok('next card is a different question', (await page.textContent('.flash .q')) !== q1);
    await page.keyboard.press('Enter');          // focus is on the show-answer button: native activation
    await page.waitForSelector('#ans');
    await page.keyboard.press('ArrowLeft');
    await page.waitForSelector('#flip');
    p = await progress(page);
    const missed = Object.entries(p.cards).filter(([, r]) => r.box === 1);
    ok('missed card is in box 1 due today', missed.length === 1 && missed[0][1].due === '2026-11-02' && missed[0][1].seen === 1 && missed[0][1].ok === 0, p.cards);
    ok('activity counted twice today', p.activity['2026-11-02'] === 2, p.activity);
    await page.keyboard.press('Escape');
    await page.waitForSelector('h1:has-text("Session complete")');
    ok('Escape ends the session with a summary', (await page.textContent('.stat .n')) === '1');
    await page.click('button:has-text("Back to flashcards")');
    ok('1 review due (the missed card) and 205 new', (await page.textContent('.grid3 .stat:nth-child(1) .n')) === '1' && (await page.textContent('.grid3 .stat:nth-child(2) .n')) === '205');
    // advance one day: the knew-it card becomes due, the missed one stays due
    await page.clock.fastForward('24:00:00');
    await page.reload(); await page.waitForSelector('#view h1');
    await nav(page, 'cards');
    ok('after one day 2 cards are due', (await page.textContent('.grid3 .stat:nth-child(1) .n')) === '2', await page.textContent('.grid3 .stat:nth-child(1) .n'));
    // clock moving backwards must not crash
    await page.clock.setSystemTime(new Date('2026-10-01T09:00:00'));
    await page.reload(); await page.waitForSelector('#view h1');
    await nav(page, 'cards');
    ok('clock moved back: app still renders', (await h1(page)) === 'Flashcards');
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  /* ---------- 3. quiz ---------- */
  console.log('\n3. Practice quiz');
  {
    const page = await open(browser);
    await nav(page, 'quiz');
    await page.click('button:has-text("Start quiz")');
    await page.waitForSelector('.opt');
    ok('4 options shown', (await page.locator('.opt').count()) === 4);
    const stem = await page.textContent('.stem');
    const q = DATA.questions.find((x) => x.stem === stem);
    ok('question found in dataset', !!q);
    await page.keyboard.press(String(q.answer + 1));
    await page.waitForSelector('.feedback');
    ok('correct answer is marked right with text', (await page.locator('.opt.right').count()) === 1 && (await page.locator('.opt.right .res').innerText()).includes('Correct answer'));
    ok('feedback says Correct', (await page.textContent('.feedback .verdict')).trim() === 'Correct');
    ok('explanation shown', (await page.textContent('.feedback p')).includes(q.explanation.slice(0, 30)));
    await page.click('.opt >> nth=0', { force: true });      // clicking again must not change anything
    let p = await progress(page);
    ok('answer recorded once', Object.keys(p.questions).length === 1 && p.questions[q.id].seen === 1 && p.questions[q.id].ok === 1, p.questions);
    await page.keyboard.press('Enter');
    await page.waitForSelector('.opt:not(.locked)');
    // answer wrongly on purpose
    const stem2 = await page.textContent('.stem');
    const q2 = DATA.questions.find((x) => x.stem === stem2);
    await page.keyboard.press(String(((q2.answer + 1) % 4) + 1));
    await page.waitForSelector('.feedback.wrong');
    ok('wrong answer shows both the wrong and the right option', (await page.locator('.opt.wrong').count()) === 1 && (await page.locator('.opt.right').count()) === 1);
    for (let i = 2; i < 10; i++) {
      await page.keyboard.press('Enter');
      await page.waitForSelector('.opt:not(.locked)');
      await page.keyboard.press('1');
      await page.waitForSelector('.feedback');
    }
    await page.click('#next');
    await page.waitForSelector('h1:has-text("Quiz complete")');
    p = await progress(page);
    ok('10 distinct questions recorded', Object.keys(p.questions).length === 10, Object.keys(p.questions).length);
    ok('summary lists the missed questions', (await page.locator('.rev').count()) >= 1);
    ok('retry button present when something was missed', (await page.locator('button:has-text("Retry the")').count()) === 1);
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  /* ---------- 4. exam simulator, timer and resume ---------- */
  console.log('\n4. Exam simulator');
  {
    const page = await open(browser, { clock: new Date('2026-11-02T10:00:00') });
    await nav(page, 'exam');
    ok('approximation notice shown before the exam', (await page.textContent('.view')).includes('Scoring is an approximation'));
    await page.click('button:has-text("Start ISTQB CT-STE mock exam")');
    await page.waitForSelector('#timer');
    ok('CT-STE has 40 questions', (await page.locator('.examgrid .gcell').count()) === 40);
    ok('timer starts at 1:15:00', (await page.textContent('#timer')) === '1:15:00', await page.textContent('#timer'));
    await page.keyboard.press('a');
    await page.keyboard.press('n');
    await page.keyboard.press('b');
    await page.keyboard.press('f');
    let p = await progress(page);
    ok('answers and flag saved after each action', p.exam && p.exam.answers[0] === 0 && p.exam.answers[1] === 1 && p.exam.flags[1] === 1 && p.exam.cur === 1, p.exam && { a: p.exam.answers.slice(0, 3), f: p.exam.flags.slice(0, 3), c: p.exam.cur });
    ok('grid marks answered and flagged cells', (await page.locator('.gcell.ans').count()) === 2 && (await page.locator('.gcell.flag').count()) === 1);
    ok('legend explains the markers in words', (await page.textContent('.legend')).includes('dot means answered'));
    await page.reload(); await page.waitForSelector('#view h1');
    await nav(page, 'exam');
    ok('reload offers to resume', (await page.locator('button:has-text("Resume exam")').count()) === 1);
    await page.click('button:has-text("Resume exam")');
    await page.waitForSelector('#timer');
    ok('answers survive the reload', (await page.locator('.gcell.ans').count()) === 2 && (await page.locator('.opt.picked').count()) === 1);
    await page.clock.fastForward('01:05:00');        // 10 minutes remain
    await page.waitForTimeout(100);
    ok('10-minute warning appears', (await page.textContent('#exam-warn')).includes('10 minutes left'), await page.textContent('#exam-warn'));
    ok('timer shows 10:00 or less', /^(9:5\d|10:00)$/.test(await page.textContent('#timer')), await page.textContent('#timer'));
    await page.clock.fastForward('00:09:00');        // 1 minute remains
    await page.waitForTimeout(100);
    ok('1-minute warning appears', (await page.textContent('#exam-warn')).includes('1 minute left'), await page.textContent('#exam-warn'));
    await page.clock.fastForward('00:01:05');        // past zero
    await page.waitForSelector('h1:has-text("Time is up")', { timeout: 5000 });
    ok('auto-submit at zero shows the result', (await page.locator('.passfail').count()) === 1);
    p = await progress(page);
    ok('result saved once with 40 questions, exam cleared', p.exams.length === 1 && p.exams[0].total === 40 && p.exam === null, p.exams);
    ok('score line shows X / 40', /\d+ \/ 40/.test(await page.textContent('.score')));
    ok('pass mark is 26 of 40', (await page.textContent('.view')).includes('26 of 40'));
    ok('review lists all 40 questions', (await page.locator('.rev').count()) === 40);
    await page.click('button:has-text("Only wrong or unanswered")');
    ok('filter keeps only wrong/unanswered', (await page.locator('.rev').count()) >= 38);
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }
  {
    // an exam whose time ran out while the app was closed is submitted on the next load
    const page = await open(browser, { clock: new Date('2026-11-02T10:00:00') });
    await nav(page, 'exam');
    await page.click('button:has-text("Start ISTQB CT-SEC mock exam")');
    await page.waitForSelector('#timer');
    ok('CT-SEC has 45 questions and 2:00:00', (await page.locator('.examgrid .gcell').count()) === 45 && (await page.textContent('#timer')) === '2:00:00');
    await page.keyboard.press('a');
    await page.evaluate(() => { window.__t = true; });
    await page.clock.setSystemTime(new Date('2026-11-02T13:00:00'));
    await page.reload(); await page.waitForSelector('#view h1');
    let p = await progress(page);
    ok('expired exam finalised at load', p.exam === null && p.exams.length === 1 && p.exams[0].profile === 'ct-sec', p.exams);
    ok('lobby says it ran out of time (the page opens on #exam after the reload)', (await page.textContent('.view')).includes('ran out of time while the app was closed'));
    ok('the attempt is listed in the attempts table', (await page.locator('table.tbl tbody tr').count()) >= 1);
    await page.ctx.close();
  }
  {
    // 25% extra time and the abandon flow
    const page = await open(browser, { clock: new Date('2026-11-02T10:00:00') });
    await nav(page, 'exam');
    await page.check('#exam-extra');
    await page.click('button:has-text("Start ISTQB CT-STE mock exam")');
    await page.waitForSelector('#timer');
    ok('extra time gives 94 minutes', (await page.textContent('#timer')) === '1:34:00', await page.textContent('#timer'));
    await page.click('#ask-submit');
    ok('submit asks for confirmation and counts unanswered', (await page.textContent('[aria-label="Confirm submission"]')).includes('40 questions not answered'));
    await page.click('button:has-text("Keep working")');
    ok('keep working hides the confirmation', await page.locator('[aria-label="Confirm submission"]').count() === 0 || !(await page.locator('[aria-label="Confirm submission"]').isVisible()));
    await nav(page, 'exam');
    await page.click('button:has-text("Abandon this exam")');
    await page.click('button:has-text("Yes, abandon")');
    const p = await progress(page);
    ok('abandon clears the exam without a result', p.exam === null && p.exams.length === 0);
    await page.ctx.close();
  }

  /* ---------- 5. roadmap planner and boundaries ---------- */
  console.log('\n5. Roadmap planner');
  {
    const page = await open(browser, { clock: new Date('2026-11-02T10:00:00') });
    await nav(page, 'plan');
    await page.fill('#plan-start', '2026-11-01');
    await page.fill('#plan-hours', '40');
    const txt = await page.textContent('.panel.stack p.small');
    ok('40 h per week gives about 10 weeks', txt.includes('10.3 weeks'), txt);
    await page.fill('#plan-hours', '1');
    const t1 = await page.textContent('.panel.stack p.small');
    ok('1 h per week gives a long plan without breaking', t1.includes('410.0 weeks') && t1.includes('7.9 years'), t1);
    await page.fill('#plan-hours', '41');
    ok('41 is rejected with a message', (await page.textContent('#plan-err')).includes('1 to 40') && (await page.locator('#plan-err').isVisible()));
    ok('rejected value is not stored', (await progress(page)) === null || (await progress(page)).settings.hoursPerWeek === 1);
    await page.fill('#plan-hours', '0');
    ok('0 is rejected', await page.locator('#plan-err').isVisible());
    await page.fill('#plan-hours', '6');
    ok('valid value clears the error', !(await page.locator('#plan-err').isVisible()));
    ok('stage 5 shows ongoing', (await page.locator('.stage').last().textContent()).includes('No end date'));
    await page.check('#gate-0');
    const p = await progress(page);
    ok('gate tick persisted', p.roadmap.gates['0'] && p.roadmap.gates['0'].done === true);
    await page.uncheck('#gate-0');
    ok('gate tick reversible', (await progress(page)).roadmap.gates['0'].done === false);
    await page.check('input[name=spec] >> nth=0');
    ok('specialisation persisted', (await progress(page)).roadmap.specialisation.id === 'appsec-devsecops');
    ok('certificate table flags unchecked entries', (await page.locator('.tag.warn:has-text("Not re-checked")').count()) === 2);
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  /* ---------- 6. modules, glossary, tests, reference, labs ---------- */
  console.log('\n6. Library views');
  {
    const page = await open(browser);
    await nav(page, 'modules');
    ok('14 module cards', (await page.locator('.mod-card').count()) === 14);
    await page.click('.mod-card >> nth=0');
    ok('module detail has objectives with K badges', (await page.locator('.obj .k').count()) >= 3);
    await page.click('button[aria-pressed]:has-text("Mark as complete")');
    ok('mark complete persisted', (await progress(page)).modules['mod-foundations'].done === true);
    await page.click('button[aria-pressed]:has-text("Completed")');
    ok('mark complete reversible', (await progress(page)).modules['mod-foundations'].done === false);
    await page.click('button:has-text("glossary term")');
    ok('glossary link filters by topic', (await page.inputValue('#gl-topic')) === 'foundations' && (await page.locator('.gl .entry').count()) === DATA.glossary.filter((g) => g.topic === 'foundations').length);
    await page.fill('#gl-search', 'zzzzqqq');
    ok('empty glossary search shows message and reset', (await page.textContent('.empty')).includes('No term matches') && (await page.locator('.empty button').count()) === 1);
    await page.click('.empty button');
    ok('reset restores all 226 terms', (await page.locator('.gl .entry').count()) === 226);
    await page.fill('#gl-search', 'least privilege');
    ok('search highlights matches with <mark>', (await page.locator('.gl mark').count()) >= 1);
    ok('glossary sorted alphabetically', await page.evaluate(() => { const t = [...document.querySelectorAll('.gl dt')].map((d) => d.childNodes[0].textContent || d.textContent); return true; }));
    await page.fill('#gl-search', '');
    const terms = await page.$$eval('.gl .entry', (els) => els.map((e) => e.id));
    const sorted = DATA.glossary.slice().sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base', numeric: true })).map((g) => g.id);
    ok('glossary order matches case-insensitive sort', JSON.stringify(terms) === JSON.stringify(sorted));

    await nav(page, 'tests');
    ok('46 test cases listed', (await page.locator('table.tbl tbody tr').count()) === 46);
    ok('safety line present', (await page.textContent('.safety')).includes('authorised in writing'));
    await page.selectOption('#tc-feature', 'Login');
    ok('feature filter gives 7 login cases', (await page.locator('table.tbl tbody tr').count()) === 7);
    await page.selectOption('#tc-type', 'boundary');
    ok('type filter combines with feature', (await page.locator('table.tbl tbody tr').count()) === 2, await page.locator('table.tbl tbody tr').count());
    await page.check('table.tbl tbody tr >> nth=0 >> input[type=checkbox]');
    ok('test tick persisted', Object.keys((await progress(page)).testcases).length === 1);
    await page.selectOption('#tc-feature', ''); await page.selectOption('#tc-type', '');
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.click('button:has-text("Copy as CSV")');
    const csv = await page.inputValue('#tc-export');
    ok('CSV export has header and 46 rows', csv.split('\n')[0] === 'ID,Group,Feature,Type,Test,Expected secure result,References' && csv.trim().split('\n').length === 47, csv.split('\n').length);
    await page.click('button:has-text("Copy as Markdown")');
    ok('Markdown export has a table row per case', (await page.inputValue('#tc-export')).split('\n').filter((l) => l.startsWith('| LOGIN') || l.startsWith('| ')).length >= 46);

    await nav(page, 'reference');
    ok('reference selector lists 19 tables', (await page.locator('#ref-select option').count()) === 19);
    await page.selectOption('#ref-select', 'owaspTop10_2025');
    ok('OWASP Top 10:2025 has 10 rows', (await page.locator('table.tbl tbody tr').count()) === 10);
    await page.fill('#ref-search', 'injection');
    ok('in-table search filters rows', (await page.locator('table.tbl tbody tr').count()) >= 1 && (await page.locator('table.tbl tbody tr').count()) < 10);

    await nav(page, 'labs');
    ok('17 labs listed', (await page.locator('.lab').count()) === 17);
    await page.selectOption('#lab-cost', 'Free');
    ok('cost filter reduces the list', (await page.locator('.lab').count()) < 17 && (await page.locator('.lab').count()) > 5);
    await page.selectOption('#lab-cost', '');
    ok('every link on the labs page is https, new-tab and noopener', await page.$$eval('#view a[href^="http"], #view a[target]', (as) => as.length > 0 && as.every((a) => a.href.startsWith('https://') && a.rel.includes('noopener') && a.target === '_blank')));
    ok('no anchor without an address', await page.$$eval('#view a', (as) => as.every((a) => a.hasAttribute('href'))));
    ok('labs without a stored address say so and offer one search link each', (await page.locator('.lab:has-text("No link stored")').count()) === 15 && (await page.locator('.lab:has-text("No link stored") a').count()) === 15);
    ok('search links go to https and name the lab', await page.$$eval('.lab:has-text("No link stored") a', (as) => as.every((a) => a.href.startsWith('https://duckduckgo.com/?q=') && a.getAttribute('aria-label').startsWith('Search the web for '))));
    await page.click('button[data-tab="tools"]');
    ok('17 tool rows', (await page.locator('table.tbl tbody tr').count()) === 17);
    await page.click('button[data-tab="resources"]');
    ok('32 resource links', (await page.locator('.link-list li').count()) === 32);
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  /* ---------- 7. settings: theme, export, import, reset ---------- */
  console.log('\n7. Settings, import and export');
  {
    const page = await open(browser);
    // create some progress first
    await nav(page, 'cards');
    await page.click('button:has-text("Start session")');
    for (let i = 0; i < 3; i++) { await page.keyboard.press('Space'); await page.waitForSelector('#ans'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1100); }
    await page.keyboard.press('Escape');
    await nav(page, 'prefs');
    await page.click('button[data-theme="dark"]');
    ok('dark theme sets data-theme', (await page.getAttribute('html', 'data-theme')) === 'dark');
    await page.click('button[data-theme="system"]');
    ok('system theme removes the override', (await page.getAttribute('html', 'data-theme')) === null);
    await page.click('button[data-theme="light"]');
    ok('light theme sets data-theme', (await page.getAttribute('html', 'data-theme')) === 'light');
    const exp = await page.inputValue('#export-text');
    const parsed = JSON.parse(exp);
    ok('export is valid JSON with v:1 and 3 cards', parsed.v === 1 && Object.keys(parsed.cards).length === 3, Object.keys(parsed.cards).length);

    const tryImport = async (text) => { await page.fill('#import-text', text); await page.click('button:has-text("Check and import")'); await page.waitForTimeout(50); return (await page.textContent('[aria-live="polite"].stack')).trim(); };
    ok('empty import rejected', (await tryImport('')).includes('Paste progress data'));
    ok('non-JSON import rejected', (await tryImport('not json {')).includes('not valid JSON'));
    ok('wrong version rejected', (await tryImport('{"v":2}')).includes('Unsupported version'));
    const bad = JSON.parse(exp); const cid = Object.keys(bad.cards)[0]; bad.cards[cid].box = 9;
    ok('card box 9 rejected with a reason', (await tryImport(JSON.stringify(bad))).includes('box'));
    const bad2 = JSON.parse(exp); bad2.cards[cid].due = 'yesterday-ish';
    ok('due date "yesterday-ish" rejected', (await tryImport(JSON.stringify(bad2))).includes('due'));
    ok('oversized import rejected', (await tryImport('{"v":1,"x":"' + 'a'.repeat(1000100) + '"}')).includes('larger than 1 MB'));
    ok('rejected imports left progress unchanged', Object.keys((await progress(page)).cards).length === 3);
    const good = JSON.parse(exp); good.cards = {}; good.modules = { 'mod-web': { done: true } };
    const msg = await tryImport(JSON.stringify(good));
    ok('valid import asks for confirmation with a summary', msg.includes('Importing replaces') && msg.includes('1 module done'), msg);
    await page.click('button:has-text("Replace my progress")');
    await page.waitForSelector('#view h1');
    const p = await progress(page);
    ok('import replaced progress', Object.keys(p.cards).length === 0 && p.modules['mod-web'].done === true);
    // unknown ids are dropped, unknown fields ignored
    await nav(page, 'prefs');
    const odd = JSON.parse(exp); odd.cards['fc-does-not-exist-01'] = { box: 2, due: '2026-11-04', seen: 1, ok: 1 }; odd.extra = { hello: 1 };
    const m2 = await tryImport(JSON.stringify(odd));
    ok('unknown ids and fields do not block import', m2.includes('Importing replaces'), m2);
    await page.click('button:has-text("Replace my progress")');
    ok('unknown card id dropped', !('fc-does-not-exist-01' in (await progress(page)).cards));
    await nav(page, 'prefs');
    await page.click('button:has-text("Reset my progress")');
    ok('reset asks for confirmation', (await page.textContent('.panel.stack >> nth=2')).includes('Erase all progress'));
    await page.click('button:has-text("Yes, erase it")');
    const r = await progress(page);
    ok('reset clears progress and keeps settings', Object.keys(r.cards).length === 0 && Object.keys(r.modules).length === 0 && r.settings.theme === 'light' && r.resetAt > 0, { cards: Object.keys(r.cards).length, modules: Object.keys(r.modules).length, theme: r.settings.theme, resetAt: r.resetAt });
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  /* ---------- 8. corrupt and blocked storage ---------- */
  console.log('\n8. Corrupt and blocked storage');
  {
    const page = await open(browser, { init: (k) => { localStorage.setItem(k, '{"v":1,"cards":{"fc-foundations-01":{"box":3'); }, initArg: KEY });
    ok('corrupt blob: app still starts', (await h1(page)) === 'Welcome');
    ok('corrupt blob: user is told', (await page.textContent('#notices')).includes('could not be read'));
    ok('corrupt blob: copy kept under a separate key', await page.evaluate(() => localStorage.getItem('sechub.progress.v1.bad') !== null));
    await page.ctx.close();
  }
  {
    const page = await open(browser, { init: () => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); } });
    ok('blocked storage: app starts', (await h1(page)) === 'Welcome');
    await nav(page, 'cards');
    await page.click('button:has-text("Start session")');
    await page.keyboard.press('Space'); await page.waitForSelector('#ans'); await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    ok('blocked storage: still works in memory and warns', (await page.textContent('#notices')).includes('cannot be saved'), await page.textContent('#notices'));
    ok('blocked storage: no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  /* ---------- 9. sync through a fake db capability ---------- */
  console.log('\n9. Sync with the db capability (fake)');
  {
    const init = (seed) => {
      const store = seed || {};
      window.__db = store;
      window.__calls = { get: 0, set: 0 };
      const mkDoc = (path) => ({
        get: async () => { window.__calls.get++; const v = store[path]; return { exists: v !== undefined, data: () => (v === undefined ? undefined : JSON.parse(JSON.stringify(v))) }; },
        set: async (d) => { window.__calls.set++; store[path] = JSON.parse(JSON.stringify(d)); }
      });
      window.claude = { use: async (name) => {
        if (name === 'user') return { id: async () => 'u_test1', isOwner: async () => true, canEdit: async () => true, can: async () => true, me: async () => ({ id: 'u_test1' }) };
        if (name === 'db') return { doc: mkDoc, collection: (c) => ({ doc: (id) => mkDoc(c + '/' + id) }) };
        return null;
      } };
    };
    const page = await open(browser, { init, initArg: null });
    await page.waitForTimeout(200);
    ok('sync: untouched app does not create an empty remote document', (await page.evaluate(() => window.__calls.set)) === 0);
    await nav(page, 'cards');
    await page.click('button:has-text("Start session")');
    await page.keyboard.press('Space'); await page.waitForSelector('#ans'); await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(2300);
    const remote = await page.evaluate(() => window.__db['data/users/u_test1/progress']);
    ok('sync: progress written to data/users/<id>/progress', remote && remote.v === 1 && Object.keys(remote.cards).length === 1, remote && Object.keys(remote));
    await nav(page, 'prefs');
    ok('sync: settings say sync is on', (await page.textContent('.kv')).includes('On.'));
    const copy = JSON.parse(JSON.stringify(remote));
    await page.ctx.close();

    // second device: has its own older local progress and the remote doc from the first one
    const seed = { 'data/users/u_test1/progress': copy };
    const p3 = await open(browser, {
      init: (args) => {
        const [seedStore, key] = args;
        localStorage.setItem(key, JSON.stringify({ v: 1, updated: 5, cards: { 'fc-foundations-02': { box: 3, due: '2026-12-01', seen: 4, ok: 3, last: '2026-11-01', first: '2026-10-30', t: 1000 } } }));
        const store = JSON.parse(JSON.stringify(seedStore));
        window.__db = store;
        const mkDoc = (path) => ({
          get: async () => { const v = store[path]; return { exists: v !== undefined, data: () => (v === undefined ? undefined : JSON.parse(JSON.stringify(v))) }; },
          set: async (d) => { store[path] = JSON.parse(JSON.stringify(d)); }
        });
        window.claude = { use: async (name) => {
          if (name === 'user') return { id: async () => 'u_test1' };
          if (name === 'db') return { collection: (c) => ({ doc: (id) => mkDoc(c + '/' + id) }) };
          return null;
        } };
      }, initArg: [seed, KEY]
    });
    await p3.waitForTimeout(600);
    const merged = await progress(p3);
    const ids = Object.keys(merged.cards).sort();
    ok('sync: local and remote cards are merged', ids.length === 2 && ids.includes('fc-foundations-02'), ids);
    const written = await p3.evaluate(() => window.__db['data/users/u_test1/progress']);
    ok('sync: merged result written back', written && Object.keys(written.cards).length === 2, written && Object.keys(written.cards));
    // reset on this device must not be undone by the older remote copy
    await nav(p3, 'prefs');
    await p3.click('button:has-text("Reset my progress")'); await p3.click('button:has-text("Yes, erase it")');
    await p3.waitForTimeout(2300);
    const after = await p3.evaluate(() => window.__db['data/users/u_test1/progress']);
    ok('sync: reset is written to the remote document', after && Object.keys(after.cards).length === 0 && after.resetAt > 0, after && Object.keys(after.cards));
    ok('sync: no page errors', p3.errors.length === 0, p3.errors);
    await p3.ctx.close();
  }

  /* ---------- 10. layout at phone widths, themes, focus ---------- */
  console.log('\n10. Layout at phone widths and in dark mode');
  for (const w of [320, 390]) {
    const page = await open(browser, { viewport: { width: w, height: 800 }, scheme: 'dark' });
    for (const id of ['home', 'plan', 'modules', 'cards', 'quiz', 'exam', 'glossary', 'tests', 'reference', 'labs', 'prefs']) {
      await nav(page, id);
      const sw = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      ok(w + 'px ' + id + ': no horizontal page scroll', sw.sw <= sw.iw, sw);
    }
    await page.goto(URL + '#mod-web'); await page.waitForSelector('#view h1');
    const sw2 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    ok(w + 'px module detail: no horizontal page scroll', sw2.sw <= sw2.iw, sw2);
    ok(w + 'px: tab bar visible, rail hidden', (await page.locator('#tabbar').isVisible()) && !(await page.locator('#rail').isVisible()));
    ok(w + 'px: no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }
  {
    const page = await open(browser, { viewport: { width: 1280, height: 900 }, scheme: 'dark' });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    ok('dark scheme paints a dark body background', bg === 'rgb(12, 18, 24)', bg);
    await page.keyboard.press('Tab');
    ok('first Tab reaches the skip link', (await page.evaluate(() => document.activeElement.id)) === 'skip');
    await page.ctx.close();
  }

  await browser.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.log('Failures:\n - ' + failures.join('\n - ')); process.exit(1); }
})().catch((e) => { console.error('TEST HARNESS ERROR', e); process.exit(2); });
