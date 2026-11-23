// node tools/seeds.js [count] -> tools/seeds.json : one checked seed per level (index 0 = level 1)
const SJ = require('../src/core.js'); const fs = require('fs');
const N = +(process.argv[2] || 200);
const target = n => n < 6 ? 0.9 : n < 15 ? 0.7 : n < 30 ? 0.5 : n < 60 ? 0.35 : n < 120 ? 0.25 : 0.18;
const seeds = [0], info = ['L1 hand'];
const t0 = Date.now();
for (let n = 2; n <= N; n++) {
  const p = SJ.params(n), cands = [];
  for (let s = 1; cands.length < (p.hard ? 8 : 5) && s < 200; s++) {
    const st = SJ.level(n, s); if (!st) continue;
    const sol = SJ.solve(st, 150000); if (!sol) continue;
    cands.push({ s, e: SJ.ease(st, 40, s), len: sol.moves.length, nodes: sol.nodes });
  }
  let pick;
  if (p.hard) pick = cands.reduce((a, b) => (b.e < a.e ? b : a));
  else pick = cands.reduce((a, b) => (Math.abs(b.e - target(n)) < Math.abs(a.e - target(n)) ? b : a));
  seeds.push(pick.s);
  info.push(`L${n} c${p.colors} f${p.funnels}${p.hidden ? ' hid' : ''}${p.hard ? ' HARD' : ''} seed ${pick.s} ease ${pick.e.toFixed(2)} sol ${pick.len} nodes ${pick.nodes}`);
}
fs.writeFileSync(__dirname + '/seeds.json', JSON.stringify(seeds));
fs.writeFileSync(__dirname + '/seeds.txt', info.join('\n'));
console.log(info.filter((_, i) => i < 12 || i % 10 === 9).join('\n'), '\n', (Date.now() - t0) / 1000, 's');
