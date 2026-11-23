// node tools/shots3.js outDir : round-2 screenshots (fine sand, stream, wet sand)
const { chromium } = require('playwright'); const path = require('path');
const out = process.argv[2] || 'shots3';
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '../index.html')); await page.waitForTimeout(3400);
  await page.evaluate(() => { __sj.save.seen = { funnel: 1, hidden: 1, hard: 1 }; __sj.startLevel(35); }); await page.waitForTimeout(500);
  await page.screenshot({ path: out + '/a-wet-tip.png' });
  await page.click('#tipOk'); await page.waitForTimeout(300); await page.screenshot({ path: out + '/b-l35.png' });
  // pour the first legal non-wet move and catch it mid-stream, then a wet one
  for (const wantWet of [false, true]) {
    const mv = await page.evaluate(w => { const st = __sj.stateOf(); const ms = __sj.SJ.moves(st); const m = ms.find(m => { const A = st.jars[m[0]]; return st.wet.includes(A[A.length - 1]) === w; }); return m || null; }, wantWet);
    if (!mv) { console.log('no move', wantWet); continue; }
    const tap = async i => { const p = await page.evaluate(i => { const J = __sj.G.jars[i]; return [J.x, J.y - 20 * __sj.G.g]; }, i); await page.mouse.click(p[0], p[1]); };
    await tap(mv[0]); await page.waitForTimeout(150); await tap(mv[1]); await page.waitForTimeout(wantWet ? 650 : 560);
    await page.screenshot({ path: out + (wantWet ? '/d-wet-pour.png' : '/c-pour.png') }); await page.waitForTimeout(2500);
  }
  await page.screenshot({ path: out + '/e-after.png' });
  console.log('errors:', errs.join('\n') || 'none'); await b.close();
})();
