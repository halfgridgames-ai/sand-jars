const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 390, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '../index.html')); await page.waitForTimeout(3400);
  await page.evaluate(() => { __sj.TEST.speed = 6; __sj.startLevel(10); });
  const before = await page.evaluate(() => JSON.stringify(__sj.stateOf().jars));
  const [a, c] = await page.evaluate(() => __sj.SJ.solve(__sj.stateOf()).moves[0]);
  const tap = async i => { const p = await page.evaluate(i => { const J = __sj.G.jars[i]; return [J.x, J.y - 20 * __sj.G.g]; }, i); await page.mouse.click(p[0], p[1]); };
  await tap(a); await tap(c); await page.waitForFunction(() => !__sj.G.pours.length);
  const mid = await page.evaluate(() => JSON.stringify(__sj.stateOf().jars));
  await page.click('#undoBtn'); await page.waitForTimeout(100);
  const after = await page.evaluate(() => JSON.stringify(__sj.stateOf().jars));
  console.log('changed', mid !== before, 'undo restores', after === before, 'undos left', await page.evaluate(() => __sj.G.undos), errs.join(' ') || 'no errors');
  await b.close();
})();
