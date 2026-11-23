const { chromium } = require('playwright'); const path = require('path');
const out = process.argv[2] || 'shots';
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto('file://' + path.resolve(__dirname, '../index.html')); await page.waitForTimeout(3400);
  await page.evaluate(() => { __sj.save.layers = 23; __sj.save.level = 24; __sj.save.coins = 1200; __sj.showMenu(); });
  await page.waitForTimeout(300); await page.screenshot({ path: out + '/10-menu-progress.png' });
  await page.click('#shelfBtn'); await page.waitForTimeout(300); await page.screenshot({ path: out + '/11-shelf.png' });
  await page.click('#shelfClose'); await page.click('#shopBtn'); await page.waitForTimeout(300); await page.screenshot({ path: out + '/12-shop.png' });
  await page.click('#shopClose');
  await page.evaluate(() => { __sj.TEST.speed = 1; __sj.save.seen = {}; __sj.startLevel(25); }); await page.waitForTimeout(400); await page.screenshot({ path: out + '/13-funnel-tip.png' });
  await page.click('#tipOk'); await page.click('#jarBtn'); await page.waitForTimeout(200); await page.screenshot({ path: out + '/14-offer.png' });
  await page.click('#offerCoins'); await page.waitForTimeout(300);
  await page.click('#hintBtn'); await page.click('#offerCoins'); await page.waitForTimeout(500); await page.screenshot({ path: out + '/15-extra-jar-hint.png' });
  await page.evaluate(() => __sj.startLevel(0, true)); await page.waitForTimeout(400); await page.screenshot({ path: out + '/16-daily.png' });
  console.log('errors:', errs.join('\n') || 'none'); await browser.close();
})();
