// Coin Crawl balance simulator. Plays the real game code (built page in
// dist/) with a bot for many hours of game time, much faster than real time,
// and prints a progression table so balance changes can be measured.
//
//   npm run build && node scripts/sim.js [hours] [profile] [seed-save.json]
//
// profile: "active" (taps about 5 times a second, the default) or "idle"
// (never taps). Results are noisy, so compare runs, not single numbers.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const HOURS = +(process.argv[2] || 8);
const PROFILE = process.argv[3] || 'active';
const SEED = process.argv[4] ? fs.readFileSync(process.argv[4], 'utf8') : null;
const PAGE = 'file://' + path.resolve(__dirname, '..', 'dist', 'coin-crawl', 'index.html') + '?sim';

// Runs inside the game's closure (through __cc.ev), so it can call any
// internal function. One call plays one simulated second.
const BOT = `(function () {
  const B = { lastMax: 0, lastT: 0, sec: 0, retires: 0, ascends: 0, taps: ${PROFILE === 'idle' ? 0 : 5} };
  return function tick() {
    B.sec++;
    Object.assign(S.set, { autobuy: true, autoboss: true, autosummon: true, autolevel: true, autoeq: true, autoclaim: true, autodungeon: true, skip: true });
    S.auto = true;
    if (typeof dailyReady === 'function' && dailyReady()) claimDaily();
    for (let k = 0; k < B.taps; k++) {
      const f = front();
      if (chest) { openChest(1); continue; }
      if (goblin) { goblin.hits = 1; hitGoblin(goblin.x, goblin.y); continue; }
      if (f) tap(sx(f.wx), groundY() - PX * 5);
      __cc.step(0.2);
    }
    if (!B.taps) __cc.step(1);
    buyCheapest(true);
    if (S.maxFloor > B.lastMax) { B.lastMax = S.maxFloor; B.lastT = B.sec; }
    if (mode !== 'main') return B;
    // spend gold: skills and allies when cheap compared to gold on hand
    for (const s of SKILLS) if (s.gacha === undefined && unlocked(s) && skillCost(s) < S.gold * 0.15) { S.gold -= skillCost(s); S.sk[s.id]++; }
    for (const a of ALLIES) if (S.deepest >= a.unlock && S.chal !== 'noally' && allyCost(a) < S.gold * 0.2) { S.gold -= allyCost(a); S.allies[a.id]++; recalc(); }
    if (S.farm && B.sec % 30 === 0 && !autoOn('autoboss')) toggleFarm(); // a player pressing Fight boss
    if (B.sec % 20 === 0) {
      for (const k of CATS) { while (mergeAll(k)); if (k !== 'pet') equipBest(k); }
      if (S.eq.pet.on < 0 || S.eq.pet.s.lastIndexOf(1) > S.eq.pet.on) S.eq.pet.on = S.eq.pet.s.lastIndexOf(1);
      while (S.runes > 40 + enchCost()) rerollEnch();
      while (S.shards > enhCost() * 4 + 50) enhance();
      if (S.runes > 30 && S.prefix.pm < 1.2) reforge();
      if (evoReady()) evolveClass(Math.random() < 0.5 ? 'A' : 'B');
      const next = RANKS[S.rank + 1];
      if (next && S.deepest >= next.need && !fainted) startRun('trial', true);
      // talents: spread points
      if (typeof TALENTS !== 'undefined') { let left = talPoints() - talSpent(); for (const [, nodes] of TALENTS) for (const [k] of nodes) while (left > 0 && tal(k) < 5) { S.tal[k] = tal(k) + 1; left--; } recalc(); }
      // legacy shop: buy the cheapest affordable item
      if (typeof LSHOP !== 'undefined') for (const it of LSHOP.slice().sort((a, b) => a[4](ls(a[0])) - b[4](ls(b[0])))) { const L = ls(it[0]); if (L < it[2] && (S.ltok || 0) >= it[4](L)) { S.ltok -= it[4](L); S.lshop[it[0]] = L + 1; } }
      if (typeof summonSkills === 'function' && S.gems > 400) summonSkills(11);
      if (typeof claimMiles === 'function') { claimMiles(); for (const r of LAB) startLab(r[0]); }
    }
    const stall = B.sec - B.lastT;
    // ascend when stuck for a long time
    if (ascendGain() > 0 && stall > 600) { ascendArm = 0; ascend(); ascend(); B.ascends++; B.lastMax = 0; B.lastT = B.sec; return B; }
    // retire when progress has stalled and the gain is worth it
    const gain = talesFor(S.maxFloor);
    if (gain > 0 && stall > 150 && gain >= Math.max(5, S.tales * 0.4)) {
      const cls = S.cls === 'peasant' ? 'berserker' : S.cls;
      const keep = Object.assign(retireKeep(gain), { cls }); keep.chal = null;
      const prevGold = S.gold, prevLv = Object.assign({}, S.lv);
      resetRun(keep); afterRetire(prevGold, gain, prevLv);
      B.retires++; B.lastMax = 0; B.lastT = B.sec;
    }
    return B;
  };
})()`;

const SNAP = `(() => ({ deep: S.deepest, floor: S.floor, tales: S.tales, rank: S.rank, stars: S.stars || 0, runs: S.runs, gems: Math.floor(S.gems), runes: Math.floor(S.runes), shards: Math.floor(S.shards),
  dmg: st.dmg, hp: st.maxHp, gold: st.goldMult, need: hpM(S.floor), eqW: S.eq.weapon.on, wlv: S.wlv, cls: S.cls + (clsTier() || ''), lv: S.lv.sword,
  tale: 1 + 0.1 * S.tales, rankM: Math.pow(1.3, S.rank), starM: Math.pow(1.5, S.stars || 0), eqM: eqEquip('weapon') * (1 + ownedSum('weapon') + ownedSum('pet')) * (1 + 0.12 * S.wlv) }))()`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(seed => {
    const real = Date.now.bind(Date), t0 = real();
    Date.now = () => t0 + (window.__simT || 0) * 1000;
    if (seed && !sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('coincrawl.v1', seed); }
    else if (!seed && !sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.clear(); }
  }, SEED);
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await page.goto(PAGE);
  await page.waitForTimeout(500);
  await page.evaluate(src => { document.querySelectorAll('.modal').forEach(m => { m.hidden = true; }); window.__bot = __cc.ev(src); }, BOT);
  const marks = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 960, 1200, 1440, 2160, 2880].filter(m => m <= HOURS * 60);
  const f = v => v >= 1e6 ? v.toExponential(1) : String(Math.round(v * 10) / 10);
  console.log(`profile ${PROFILE}, ${HOURS}h`);
  console.log('min  deep floor tales rank star runs  gems runes shards  cls   wpn +wlv  tale×  rank×  star×  eq×   dmg/need');
  let min = 0, b;
  const wall = Date.now();
  for (const m of marks) {
    while (min < m) { b = await page.evaluate(() => { let r; for (let k = 0; k < 60; k++) r = window.__bot(); return r; }); min++; }
    const s = await page.evaluate(src => __cc.ev(src), SNAP);
    console.log([String(m).padStart(4), String(s.deep).padStart(5), String(s.floor).padStart(5), String(s.tales).padStart(5), String(s.rank).padStart(4), String(s.stars).padStart(4), String(s.runs).padStart(4), String(s.gems).padStart(5), String(s.runes).padStart(5), String(s.shards).padStart(6), s.cls.padStart(10), String(s.eqW).padStart(4) + '+' + s.wlv, f(s.tale).padStart(6), f(s.rankM).padStart(6), f(s.starM).padStart(6), f(s.eqM).padStart(6), f(s.dmg / s.need).padStart(9)].join(' '));
  }
  console.log(`retires ${b.retires}, ascends ${b.ascends}, wall time ${Math.round((Date.now() - wall) / 1000)}s`);
  if (process.env.SIM_SAVE) fs.writeFileSync(process.env.SIM_SAVE, await page.evaluate(() => JSON.stringify(__cc.ev('S'))));
  await browser.close();
})();
