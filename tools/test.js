// node tools/test.js [outDir] [levels...] : plays levels by real taps, following the solver, at 6x animation speed
const { chromium } = require('playwright'); const path = require('path');
const out = process.argv[2] || 'shots'; const pick = process.argv.slice(3).map(Number);
const levels = pick.length ? pick : [...Array.from({ length: 30 }, (_, i) => i + 1), 40, 47, 50, 61, 77, 100, 133, 160, 200, 230];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto('file://' + path.resolve(__dirname, '../index.html')); await page.waitForTimeout(3400);
  await page.evaluate(() => { __sj.TEST.speed = 6; __sj.save.seen = { funnel: 1, hidden: 1, hard: 1, wet: 1 }; });
  const tap = async i => { const p = await page.evaluate(i => { const J = __sj.G.jars[i]; return [J.x, J.y - 20 * __sj.G.g]; }, i); await page.mouse.click(p[0], p[1]); };
  const res = [];
  for (const L of levels) {
    await page.evaluate(L => { __sj.startLevel(L); }, L); await page.waitForTimeout(80);
    const sol = await page.evaluate(() => __sj.SJ.solve(__sj.stateOf(), 200000));
    if (!sol) { res.push(`L${L} NO SOLUTION`); continue; }
    let pours = 0;
    for (const [a, b] of sol.moves) {
      await tap(a); await tap(b); pours++;
      await page.waitForFunction(() => !__sj.G.pours.length, null, { timeout: 8000 });
    }
    await page.waitForTimeout(250);
    const st = await page.evaluate(() => ({ won: __sj.G.won, win: !document.querySelector('#win').hidden, jars: __sj.G.jars.length }));
    res.push(`L${L} jars ${st.jars} pours ${pours} ${st.won ? 'WON' : 'FAIL'}`);
  }
  console.log(res.join('\n')); console.log('errors:', errs.join('\n') || 'none');
  await browser.close();
})();
