const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist/hub-app.test.html');
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await page.goto(URL); await page.waitForSelector('#view h1');
  const tiles = await page.$$eval('.grid3 .stat', (els) => els.map((e) => e.querySelector('.n').textContent + ' ' + e.querySelector('.l').textContent));
  console.log('home tiles:', tiles.join(' | '));
  await page.goto(URL + '#quiz'); await page.waitForSelector('#view h1');
  console.log('quiz:', (await page.textContent('p[role=status]')).slice(0, 80));
  await page.goto(URL + '#cards'); await page.waitForSelector('#view h1');
  console.log('cards:', (await page.textContent('.grid3')).replace(/\s+/g, ' ').slice(0, 120));
  console.log('html lang:', await page.evaluate(() => document.documentElement.lang), '| title:', await page.title());
  await b.close();
})();
