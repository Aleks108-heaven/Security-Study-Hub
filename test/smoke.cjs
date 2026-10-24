const { chromium } = require(process.env.PW_PATH || 'playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist/hub-app.test.html');
(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const [name, vp, scheme] of [['desktop-light', {width: 1280, height: 900}, 'light'], ['mobile-dark', {width: 390, height: 844}, 'dark']]) {
    const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(URL);
    await page.waitForSelector('#view h1');
    const title = await page.textContent('#view h1');
    await page.screenshot({ path: path.resolve(__dirname, name + '-home.png'), fullPage: false });
    out.push({ name, title, errors });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
