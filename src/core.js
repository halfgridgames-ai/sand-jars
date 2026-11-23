/* Sand Jars core: level rules, generator, solver. Shared by the game and the node build/test tools.
   A jar is an array of colour ids, bottom first, at most CAP long. Jars flagged as funnels pour one scoop at a time. */
const SJ = (() => {
  const CAP = 4;
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // what each level number asks for (n is 1-based)
  function params(n) {
    const hard = n >= 20 && n % 10 === 0;
    let colors = n === 2 ? 2 : n <= 3 ? 3 : n <= 5 ? 4 : n <= 9 ? 5 : n <= 14 ? 6 : n <= 19 ? 7 : n <= 29 ? 8 : n <= 44 ? 9 : n <= 69 ? 10 : n <= 119 ? 11 : 12;
    if (hard) colors = Math.min(12, colors + 1);
    const funnels = n < 25 ? 0 : n === 25 ? 1 : n < 60 ? (n % 4 === 1 ? 1 : 0) : (n % 4 === 1 ? 2 : n % 4 === 3 ? 1 : 0);
    const hidden = n === 47 || (n > 47 && (n % 5 === 2 || n % 5 === 4));
    // wet sand clumps: the whole top run moves or nothing does (from level 35)
    const wet = n === 35 || (n > 35 && n % 3 === 0) ? (n >= 90 ? 2 : 1) : 0;
    return { colors, empties: 2, funnels, hidden, hard, wet };
  }

  function topRun(j) { if (!j.length) return 0; const c = j[j.length - 1]; let k = 1; while (k < j.length && j[j.length - 1 - k] === c) k++; return k; }
  function done(j) { return j.length === 0 || (j.length === CAP && topRun(j) === CAP); }
  function solved(st) { return st.jars.every(done); }
  // how many scoops a pour from a to b moves (0 = not allowed)
  function amount(st, a, b) {
    if (a === b) return 0; const A = st.jars[a], B = st.jars[b];
    if (!A.length || B.length >= (st.caps ? st.caps[b] : CAP)) return 0;
    if (B.length && B[B.length - 1] !== A[A.length - 1]) return 0;
    const room = (st.caps ? st.caps[b] : CAP) - B.length;
    if (st.wet && st.wet.length && st.wet.includes(A[A.length - 1])) { const run = topRun(A); return run <= room ? run : 0; }
    const run = st.funnel[a] ? 1 : topRun(A);
    return Math.min(run, room);
  }
  function apply(st, a, b) {
    const n = amount(st, a, b); if (!n) return 0;
    const c = st.jars[a][st.jars[a].length - 1];
    for (let i = 0; i < n; i++) { st.jars[a].pop(); st.jars[b].push(c); }
    return n;
  }
  function clone(st) { return { jars: st.jars.map(j => j.slice()), funnel: st.funnel.slice(), caps: st.caps ? st.caps.slice() : null, wet: st.wet || [] }; }
  function key(st) { return st.jars.map((j, i) => (st.funnel[i] ? 'f' : '') + j.join(',')).sort().join('|'); }
  function moves(st, pruneUseless = true) {
    const out = [];
    for (let a = 0; a < st.jars.length; a++) {
      const A = st.jars[a]; if (!A.length || done(A)) continue;
      for (let b = 0; b < st.jars.length; b++) {
        const n = amount(st, a, b); if (!n) continue;
        // pouring a whole single-colour jar into an empty one changes nothing
        if (pruneUseless && !st.jars[b].length && topRun(A) === A.length && !st.funnel[a]) continue;
        out.push([a, b, n]);
      }
    }
    return out;
  }
  function score(st, m) {
    const [a, b, n] = m, B = st.jars[b], A = st.jars[a];
    let s = 0;
    if (B.length && B.length + n === CAP && topRun(B) === B.length) s += 100;  // finishes a jar
    if (B.length) s += 20 + topRun(B) * 3; else s -= 10;
    if (n === topRun(A) && A.length - n > 0) s += 5;                            // uncovers something
    return s;
  }
  // depth-first search with a visited set; returns a list of [from, to] or null
  function solve(start, limit = 200000) {
    const seen = new Set(); let nodes = 0; const path = [];
    const st = clone(start);
    function dfs() {
      if (solved(st)) return true;
      if (++nodes > limit) return false;
      const k = key(st); if (seen.has(k)) return false; seen.add(k);
      const ms = moves(st).sort((x, y) => score(st, y) - score(st, x));
      for (const m of ms) {
        const [a, b, n] = m; const c = st.jars[a][st.jars[a].length - 1];
        for (let i = 0; i < n; i++) { st.jars[a].pop(); st.jars[b].push(c); }
        path.push([a, b]);
        if (dfs()) return true;
        path.pop(); for (let i = 0; i < n; i++) { st.jars[b].pop(); st.jars[a].push(c); }
        if (nodes > limit) return false;
      }
      return false;
    }
    const ok = dfs();
    return ok ? { moves: path.slice(), nodes } : null;
  }
  // a rough difficulty: share of semi-random players (who like matching colours) that finish
  function ease(start, tries = 60, seed = 1) {
    const r = rng(seed); let wins = 0;
    for (let t = 0; t < tries; t++) {
      const st = clone(start); const seen = new Set();
      for (let step = 0; step < 300; step++) {
        if (solved(st)) { wins++; break; }
        const ms = moves(st).filter(m => { const s = clone(st); apply(s, m[0], m[1]); return !seen.has(key(s)); });
        if (!ms.length) break;
        const good = ms.filter(m => st.jars[m[1]].length);
        const pick = good.length && r() < 0.75 ? good[Math.floor(r() * good.length)] : ms[Math.floor(r() * ms.length)];
        apply(st, pick[0], pick[1]); seen.add(key(st));
      }
    }
    return wins / tries;
  }
  function make(n, seed) {
    const p = params(n), r = rng(seed * 7919 + n * 104729);
    for (let attempt = 0; attempt < 400; attempt++) {
      const units = []; for (let c = 0; c < p.colors; c++) for (let k = 0; k < CAP; k++) units.push(c);
      for (let i = units.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [units[i], units[j]] = [units[j], units[i]]; }
      const jars = []; for (let c = 0; c < p.colors; c++) jars.push(units.slice(c * CAP, c * CAP + CAP));
      // no jar should start finished or nearly sorted
      if (jars.some(j => topRun(j) >= 3 || (j[0] === j[1] && j[1] === j[2]))) continue;
      let pairs = 0; for (const j of jars) for (let k = 1; k < CAP; k++) if (j[k] === j[k - 1]) pairs++;
      if (pairs > Math.max(1, p.colors / 3)) continue;
      for (let e = 0; e < p.empties; e++) jars.push([]);
      const funnel = jars.map(() => false);
      const fill = jars.map((j, i) => i).filter(i => jars[i].length);
      for (let f = 0; f < p.funnels; f++) funnel[fill[Math.floor(r() * fill.length)]] = true;
      const wet = []; while (wet.length < p.wet) { const c = Math.floor(r() * p.colors); if (!wet.includes(c)) wet.push(c); }
      const st = { jars, funnel, caps: null, hidden: p.hidden, hard: p.hard, n, wet };
      return st;
    }
    return null;
  }
  // hand-made first level: two pours win it
  const FIRST = { jars: [[0, 0, 1, 1], [1, 1], [0, 0]], funnel: [false, false, false], caps: null, wet: [], hidden: false, hard: false, n: 1 };
  function level(n, seed) {
    if (n === 1) return clone2(FIRST);
    return make(n, seed);
  }
  function clone2(st) { return Object.assign({}, st, { jars: st.jars.map(j => j.slice()), funnel: st.funnel.slice(), wet: (st.wet || []).slice() }); }
  return { CAP, rng, params, topRun, done, solved, amount, apply, clone, key, moves, solve, ease, make, level };
})();
if (typeof module !== 'undefined') module.exports = SJ;
