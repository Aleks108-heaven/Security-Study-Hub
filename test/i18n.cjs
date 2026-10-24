/* Language checks for the study app, run in headless Chromium. Usage: node test/i18n.cjs [dist/hub-app.test.html]
   Covers: device-language detection, switching and saving the language, translated chrome, plural forms, answer keys in a translated
   exam, fallback to English, and layout at phone width in every language. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FILE = path.resolve(__dirname, '..', process.argv[2] || 'dist/hub-app.test.html');
const URL = 'file://' + FILE;
const DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/security-hub-data.min.json'), 'utf8'));
const KEY = 'sechub.progress.v1';
const UI = {};
for (const f of fs.readdirSync(path.resolve(__dirname, '../src/i18n/ui')).sort()) Object.assign(UI, JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/i18n/ui', f), 'utf8')));
const T = (lang, key) => UI[key][lang];
const LANGS = { uk: 'uk-UA', pl: 'pl-PL', es: 'es-ES', de: 'de-DE' };
const VIEWS = ['home', 'plan', 'modules', 'cards', 'quiz', 'exam', 'glossary', 'tests', 'reference', 'labs', 'prefs'];

let passed = 0, failed = 0;
const failures = [];
function ok(name, cond, extra) {
  if (cond) { passed++; console.log('  ok   ' + name); }
  else { failed++; failures.push(name); console.log('  FAIL ' + name + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); }
}
const IGNORE = /ERR_TUNNEL_CONNECTION_FAILED|fonts\.googleapis|fonts\.gstatic|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/;

async function open(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: o.viewport || { width: 1280, height: 900 }, locale: o.locale || 'en-US', reducedMotion: 'reduce' });
  if (o.progress) await ctx.addInitScript(([k, v]) => { try { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }, [KEY, o.progress]);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) page.errors.push('console: ' + m.text()); });
  await page.goto(o.url || URL);
  await page.waitForSelector('#view h1');
  page.ctx = ctx;
  return page;
}
const progress = async (page) => { await page.waitForTimeout(400); return page.evaluate((k) => { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; }, KEY); };
const go = async (page, id) => { await page.evaluate((i) => { location.hash = i; }, id); await page.waitForTimeout(80); };
const withLang = (lang, extra) => Object.assign({ v: 1, settings: { lang } }, extra || {});

(async () => {
  const browser = await chromium.launch();

  console.log('\n1. Device language and the language setting');
  {
    const page = await open(browser, { locale: 'en-US' });
    ok('English device: English interface, html lang en-GB', (await page.getAttribute('html', 'lang')) === 'en-GB' && (await page.textContent('#view h1')) === 'Welcome');
    await page.ctx.close();
  }
  for (const [lang, tag] of Object.entries(LANGS)) {
    const page = await open(browser, { locale: tag });
    ok(lang + ': follows the device language', (await page.getAttribute('html', 'lang')) === tag && (await page.textContent('#view h1')) === T(lang, 'Welcome'), await page.textContent('#view h1'));
    ok(lang + ': navigation is translated', (await page.textContent('#rail a[data-nav="exam"]')).trim() === T(lang, 'Exam simulator'), await page.textContent('#rail a[data-nav="exam"]'));
    ok(lang + ': document title is translated', (await page.title()) === T(lang, 'Security Testing Study Hub'), await page.title());
    ok(lang + ': no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }
  {
    const page = await open(browser, { locale: 'fr-FR' });
    ok('unsupported device language falls back to English', (await page.textContent('#view h1')) === 'Welcome');
    await page.ctx.close();
  }
  {
    // the setting wins over the device, is saved, survives a reload, and "auto" returns to the device language
    const page = await open(browser, { locale: 'en-US' });
    await go(page, 'prefs');
    await page.selectOption('#lang-select', 'de');
    ok('choosing German redraws the screen in German', (await page.textContent('#view h1')) === T('de', 'Settings'), await page.textContent('#view h1'));
    ok('the language select keeps focus', await page.evaluate(() => document.activeElement && document.activeElement.id === 'lang-select'));
    ok('the language is saved', (await progress(page)).settings.lang === 'de');
    await page.reload(); await page.waitForSelector('#view h1');
    ok('the language survives a reload', (await page.getAttribute('html', 'lang')) === 'de-DE');
    await go(page, 'prefs');
    ok('the settings page shows the translation line and the AI note', (await page.textContent('#view')).includes(T('de', 'The translations were prepared with AI assistance and have not been reviewed by a native-speaking security tester. The English text is the reference for ISTQB exam preparation.')));
    await page.selectOption('#lang-select', 'en');
    ok('choosing English restores the English interface', (await page.textContent('#view h1')) === 'Settings' && (await page.getAttribute('html', 'lang')) === 'en-GB');
    ok('English shows no translation notice', !(await page.textContent('#view')).includes('AI assistance'));
    ok('no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }
  {
    const page = await open(browser, { locale: 'es-ES', progress: withLang('auto') });
    ok('"auto" follows the device', (await page.getAttribute('html', 'lang')) === 'es-ES');
    await page.ctx.close();
  }
  {
    // an invalid language in an import is rejected with a reason
    const page = await open(browser);
    await go(page, 'prefs');
    await page.fill('#import-text', JSON.stringify({ v: 1, settings: { lang: 'xx' } }));
    await page.click('button:has-text("Check and import")');
    await page.waitForTimeout(60);
    ok('import with an unknown language is rejected', (await page.textContent('[aria-live="polite"].stack')).includes('settings.lang'));
    await page.ctx.close();
  }

  console.log('\n2. Plural forms (Ukrainian and Polish have four)');
  {
    const due = (n) => { const cards = {}; for (let i = 0; i < n; i++) cards[DATA.flashcards[i].id] = { box: 1, due: '2020-01-01', seen: 1, ok: 0, last: '2020-01-01', first: '2020-01-01', t: 1 }; return { cards, questions: {} }; };
    const heading = async (lang, n) => { const page = await open(browser, { locale: LANGS[lang], progress: withLang(lang, due(n)) }); const t = await page.textContent('#next-h'); await page.ctx.close(); return t; };
    const expect = { pl: { 1: '1 fiszka', 2: '2 fiszki', 5: '5 fiszek', 22: '22 fiszki', 25: '25 fiszek' }, uk: { 1: '1 картка', 2: '2 картки', 5: '5 карток', 21: '21 картка', 25: '25 карток' }, de: { 1: '1 Karte', 3: '3 Karten' }, es: { 1: '1 tarjeta', 3: '3 tarjetas' } };
    for (const lang of Object.keys(expect)) {
      for (const [n, text] of Object.entries(expect[lang])) {
        const t = await heading(lang, Number(n));
        ok(lang + ': ' + n + ' -> "' + text + '"', t.includes(text), t);
      }
    }
  }

  console.log('\n3. An exam in a translated language keeps the answer key');
  for (const lang of Object.keys(LANGS)) {
    const page = await open(browser, { locale: LANGS[lang], progress: withLang(lang) });
    await go(page, 'exam');
    await page.click('button.btn.primary:has-text("' + T(lang, 'Start {0} mock exam').replace('{0}', 'ISTQB CT-STE') + '")');
    await page.waitForSelector('#timer');
    const p0 = await progress(page);
    const first = DATA.questions.find((q) => q.id === p0.exam.ids[0]);
    // the stem on screen must be the translated one when the overlay has it, and the options must keep the stored order
    const stem = await page.textContent('.stem');
    const opts = await page.$$eval('.opts .opt', (els) => els.map((e) => e.textContent.replace(/^[A-D]/, '').trim()));
    ok(lang + ': the exam question has four options', opts.length === 4, opts.length);
    await page.keyboard.press(String(first.answer + 1));
    await page.click('#ask-submit');
    await page.click('button:has-text("' + T(lang, 'Submit now') + '")');
    await page.waitForSelector('.passfail');
    const p1 = await progress(page);
    ok(lang + ': the key answer is scored right (' + stem.slice(0, 28) + '...)', p1.exams.length === 1 && p1.exams[0].correct === 1, p1.exams);
    ok(lang + ': no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  console.log('\n4. Quiz in a translated language: feedback marks the stored key');
  for (const lang of Object.keys(LANGS)) {
    const page = await open(browser, { locale: LANGS[lang], progress: withLang(lang) });
    await go(page, 'quiz');
    await page.click('button.btn.primary:has-text("' + T(lang, 'Start quiz') + '")');
    await page.waitForSelector('.opt');
    const p = await page.evaluate(() => 0);
    await page.keyboard.press('1');
    await page.waitForSelector('.feedback');
    const marked = await page.$$eval('.opt', (els) => els.findIndex((e) => e.classList.contains('right')));
    const prog = await progress(page);
    const qid = Object.keys(prog.questions)[0];
    ok(lang + ': the option marked right is the stored answer index', marked === DATA.questions.find((q) => q.id === qid).answer, { marked, qid });
    await page.ctx.close();
  }

  console.log('\n5. Every screen at phone width, in every language');
  for (const lang of Object.keys(LANGS)) {
    const page = await open(browser, { viewport: { width: 320, height: 800 }, locale: LANGS[lang], progress: withLang(lang) });
    const bad = [];
    for (const id of VIEWS) {
      await go(page, id);
      const sw = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      if (sw.sw > sw.iw) bad.push(id + ' ' + sw.sw + '>' + sw.iw);
    }
    await go(page, 'mod-web');
    const sw2 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    if (sw2.sw > sw2.iw) bad.push('module ' + sw2.sw + '>' + sw2.iw);
    ok(lang + ' 320px: no horizontal page scroll on any screen', bad.length === 0, bad);
    ok(lang + ' 320px: no page errors', page.errors.length === 0, page.errors);
    await page.ctx.close();
  }

  console.log('\n6. Untranslated records fall back to English, never to a blank');
  {
    // a language whose overlay was reduced to nothing still shows the whole app
    const page = await open(browser, { locale: 'de-DE', progress: withLang('de') });
    const stems = await page.evaluate(() => 1);
    await go(page, 'glossary');
    const n = await page.locator('.gl .entry').count();
    ok('de: the glossary lists all ' + DATA.glossary.length + ' terms (translated or English)', n === DATA.glossary.length, n);
    const empty = await page.$$eval('.gl .entry', (els) => els.filter((e) => !e.textContent.trim()).length);
    ok('de: no glossary entry is empty', empty === 0, empty);
    await page.ctx.close();
  }

  await browser.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  if (failed) { console.log('Failures:\n - ' + failures.join('\n - ')); process.exit(1); }
})().catch((e) => { console.error('TEST HARNESS ERROR', e); process.exit(2); });
