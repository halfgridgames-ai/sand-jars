// node tools/store-shots.js : raw gameplay screens (store/raw) then captioned store screenshots (store/screenshots, store/ios)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const root = path.resolve(__dirname, '..'), raw = root + '/store/raw';
const CAPS = [
  ['1-pour', 'Pour real sand', 'Every grain falls and piles up'],
  ['2-board', 'Sort every colour', 'Calm puzzles, hundreds of levels'],
  ['3-wet', 'Wet sand sticks', 'New twists keep it fresh'],
  ['4-win', 'Make sand art', 'Every level adds a layer to your bottle'],
  ['5-shelf', 'Fill your shelf', '20 souvenir bottles to collect'],
];
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + root + '/index.html'); await page.waitForTimeout(3600);
  await page.evaluate(() => { __sj.save.seen = { funnel: 1, hidden: 1, hard: 1, wet: 1 }; __sj.save.coins = 640; });
  const tap = async i => { const p = await page.evaluate(i => { const J = __sj.G.jars[i]; return [J.x, J.y - 20 * __sj.G.g]; }, i); await page.mouse.click(p[0], p[1]); };
  const pourMid = async (pick) => {
    const mv = await page.evaluate(pick => { const st = __sj.stateOf(); const ms = __sj.SJ.moves(st); return ms.find(pick ? (m => st.jars[m[1]].length > 0 && m[2] >= 2) : (() => true)) || ms[0]; }, pick);
    await tap(mv[0]); await page.waitForTimeout(150); await tap(mv[1]); await page.waitForTimeout(620);
  };
  await page.evaluate(() => __sj.startLevel(16)); await page.waitForTimeout(500);
  await pourMid(true); await page.screenshot({ path: raw + '/1-pour.png' }); await page.waitForTimeout(2500);
  await page.evaluate(() => __sj.startLevel(42)); await page.waitForTimeout(500); await page.screenshot({ path: raw + '/2-board.png' });
  await page.evaluate(() => __sj.startLevel(36)); await page.waitForTimeout(500);
  const wm = await page.evaluate(() => { const st = __sj.stateOf(); return __sj.SJ.moves(st).find(m => st.wet.includes(st.jars[m[0]][st.jars[m[0]].length - 1])); });
  if (wm) { await tap(wm[0]); await page.waitForTimeout(150); await tap(wm[1]); await page.waitForTimeout(700); }
  await page.screenshot({ path: raw + '/3-wet.png' }); await page.waitForTimeout(2500);
  // win: play level 3 out with the solver
  await page.evaluate(() => { __sj.save.layers = 6; __sj.startLevel(3); }); await page.waitForTimeout(400);
  await page.evaluate(() => { __sj.TEST.speed = 6; });
  const sol = await page.evaluate(() => __sj.SJ.solve(__sj.stateOf(), 200000).moves);
  for (const [a, c] of sol) { await tap(a); await page.waitForTimeout(60); await tap(c); await page.waitForTimeout(700); }
  await page.evaluate(() => { __sj.TEST.speed = 1; }); await page.waitForTimeout(3600); await page.screenshot({ path: raw + '/4-win.png' });
  await page.evaluate(() => { __sj.save.layers = 47; __sj.save.level = 48; __sj.showMenu(); }); await page.waitForTimeout(300);
  await page.click('#shelfBtn'); await page.waitForTimeout(500); await page.screenshot({ path: raw + '/5-shelf.png' });
  // captioned frames
  const out = [['screenshots', 1080, 1920], ['ios', 1290, 2796]];
  const fp = await b.newPage();
  for (const [dir, w, h] of out) {
    fs.mkdirSync(root + '/store/' + dir, { recursive: true });
    await fp.setViewportSize({ width: w, height: h });
    for (const [f, t1, t2] of CAPS) {
      const img = 'data:image/png;base64,' + fs.readFileSync(raw + '/' + f + '.png').toString('base64');
      const ph = Math.round(h * 0.76), pw = Math.round(ph * 430 / 932);
      await fp.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@800&display=swap"></head>
<body style="margin:0;width:${w}px;height:${h}px;overflow:hidden;background:linear-gradient(180deg,#3a245c 0%,#8c4f86 55%,#f0aa86 100%);font-family:Nunito,sans-serif;text-align:center;color:#fff6e8">
<div style="padding-top:${Math.round(h * 0.045)}px;font-family:'Lilita One',sans-serif;font-size:${Math.round(w * 0.092)}px;line-height:1.05;text-shadow:0 ${Math.round(w * 0.006)}px 0 rgba(40,10,40,.35)">${t1}</div>
<div style="margin-top:${Math.round(h * 0.012)}px;font-size:${Math.round(w * 0.042)}px;color:#ffe2c8">${t2}</div>
<img src="${img}" style="position:absolute;left:${(w - pw) / 2}px;bottom:${Math.round(h * 0.035)}px;width:${pw}px;height:${ph}px;border-radius:${Math.round(w * 0.05)}px;box-shadow:0 ${Math.round(w * 0.02)}px ${Math.round(w * 0.05)}px rgba(30,10,30,.45);border:${Math.round(w * 0.012)}px solid #fff6e8">
</body></html>`, { waitUntil: 'networkidle' });
      await fp.waitForTimeout(300); await fp.screenshot({ path: `${root}/store/${dir}/${f}.png` });
    }
  }
  console.log('errors:', errs.join('\n') || 'none'); await b.close();
})();
