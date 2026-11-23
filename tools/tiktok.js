// node tools/tiktok.js outDir [level] : records a sharp vertical gameplay clip as 1080x1920 frames (frames/, frames.txt)
// plus the sound cues it played (cues.json), for tools/tiktok-mix.py to turn into an mp4 with game sounds.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const out = process.argv[2], L = +(process.argv[3] || 8);
(async () => {
  // a real 2x window (not emulation), so the screencast frames come out at 1080x1920 with a sharp canvas
  const b = await chromium.launch({ args: ['--force-device-scale-factor=2', '--window-size=540,960'] });
  const page = await (await b.newContext({ viewport: null })).newPage();
  await page.goto('file://' + path.resolve(__dirname, '../index.html'));
  await page.waitForTimeout(3600);
  fs.mkdirSync(out + '/frames', { recursive: true });
  const cdp = await page.context().newCDPSession(page); const frames = [];
  cdp.on('Page.screencastFrame', async f => { const n = frames.length; fs.writeFileSync(`${out}/frames/${String(n).padStart(5, '0')}.jpg`, Buffer.from(f.data, 'base64')); frames.push(f.metadata.timestamp); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  const wall0 = await page.evaluate(L => {
    window.__cues = []; window.__t0 = performance.now();
    for (const k of Object.keys(__sj.sfx)) { const f = __sj.sfx[k]; __sj.sfx[k] = (...a) => { __cues.push([k, (performance.now() - __t0) / 1000, a]); return f.apply(__sj.sfx, a); }; }
    __sj.save.seen = { funnel: 1, hidden: 1, hard: 1, wet: 1 }; __sj.save.layers = 4; __sj.save.coins = 350; __sj.startLevel(L);
    return Date.now() / 1000;
  }, L);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  await page.waitForTimeout(900);
  const sol = await page.evaluate(() => __sj.SJ.solve(__sj.stateOf(), 200000).moves);
  const tap = async i => { const p = await page.evaluate(i => { const J = __sj.G.jars[i]; return [J.x, J.y - 20 * __sj.G.g]; }, i); await page.mouse.click(p[0], p[1]); };
  for (const [a, c] of sol) { await page.waitForFunction(([a, c]) => !__sj.G.jars[a].busy && !__sj.G.jars[c].busy, [a, c], { polling: 50 }); await page.waitForTimeout(120); await tap(a); await page.waitForTimeout(200); await tap(c); await page.waitForTimeout(500); }
  await page.waitForTimeout(4200);
  await cdp.send('Page.stopScreencast');
  const cues = await page.evaluate(() => __cues);
  // frame times relative to the level start (cue time 0)
  const ft = frames.map(t => t - wall0);
  let list = ''; for (let i = 0; i < ft.length; i++) { const d = i + 1 < ft.length ? ft[i + 1] - ft[i] : 0.04; list += `file 'frames/${String(i).padStart(5, '0')}.jpg'\nduration ${Math.max(0.001, d).toFixed(4)}\n`; }
  fs.writeFileSync(out + '/frames.txt', list);
  fs.writeFileSync(out + '/cues.json', JSON.stringify({ cues, firstFrame: ft[0], moves: sol.length }));
  await b.close();
  console.log('moves', sol.length, 'frames', ft.length, 'first frame at', ft[0].toFixed(2), 'last', ft[ft.length - 1].toFixed(2));
})();
