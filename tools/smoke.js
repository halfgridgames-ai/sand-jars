const { chromium } = require('playwright'); const path = require('path');
const out = process.argv[2] || 'shots';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto('file://' + path.resolve(__dirname, '../index.html')); await page.waitForTimeout(3400);
  await page.screenshot({ path: out + '/01-menu.png' });
  await page.click('#playBtn'); await page.waitForTimeout(500);
  await page.screenshot({ path: out + '/02-l1.png' });
  const tap = async i => { const p = await page.evaluate(i => { const J = __sj.G.jars[i]; return [J.x, J.y - 20 * __sj.G.g]; }, i); await page.mouse.click(p[0], p[1]); };
  await tap(0); await page.waitForTimeout(200); await tap(1); await page.waitForTimeout(600);
  await page.screenshot({ path: out + '/03-pouring.png' });
  await page.waitForTimeout(1600); await tap(0); await page.waitForTimeout(150); await tap(2); await page.waitForTimeout(4200);
  await page.screenshot({ path: out + '/04-win.png' });
  for (const L of [12, 30, 49]) { await page.evaluate(L => __sj.startLevel(L), L); await page.waitForTimeout(400); await page.evaluate(() => { document.querySelector('#tip').hidden = true; }); await page.screenshot({ path: out + `/05-l${L}.png` }); }
  console.log('errors:', errs.join('\n') || 'none');
  await browser.close();
})();
