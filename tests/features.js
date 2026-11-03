// Feature test for Coin Crawl: drives every system through the game's own
// functions (via the ?sim hook) on a rich save and on a fresh, broke one,
// then checks for errors and impossible values (NaN, Infinity, negative
// currencies, broken equipment). Run with: npm run features (builds first).
const { chromium } = require('playwright');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'dist', 'coin-crawl', 'index.html') + '?sim';
const all = v => Object.fromEntries(['sword', 'armor', 'boots', 'ring', 'gaunt', 'torch', 'pet'].map(k => [k, v]));
const RICH = { floor: 120, maxFloor: 120, deepest: 120, runs: 8, rank: 9, tales: 900, gold: 1e40, gems: 50000, runes: 50000, shards: 50000, maps: 3, lv: all(150), allies: { knight: 30, wizard: 30, bard: 30, raccoon: 30, frog: 30, crab: 30 }, seenVer: 99, set: { tips: false }, life: { kills: 50, best: 120 } };

// Each action runs inside the game closure. Names are checked so a renamed
// function shows up as a failure instead of being skipped quietly.
const ACTIONS = [
  ['train: buy cheapest', 'buyCheapest(true)'],
  ['train: buy each part', 'PARTS.forEach(p => buyPart(p, 10))'],
  ['train: evolve parts', 'PARTS.forEach(p => evolvePart(p))'],
  ['skills: cast all', 'SKILLS.forEach(s => { skT[s.id] = 0; castSkill(s.id, true); })'],
  ['skills: ultimate', 'ultC = 100; castUlt()'],
  ['skills: summon', 'summonSkills(11); summonSkills(1)'],
  ['skills: level gacha', 'SKILLS.filter(s => s.gacha !== undefined).forEach(s => gachaLevel(s))'],
  ['equip: summon every slot', 'CATS.forEach(k => { summonEq(k, 35, true); summonEq(k, 11, true); summonEq(k, 1, true); })'],
  ['equip: merge and equip', 'CATS.forEach(k => { mergeAll(k); equipBest(k); })'],
  ['equip: level, awaken, dismantle', 'CATS.forEach(k => { const E = S.eq[k], i = E.s.lastIndexOf(1); if (i >= 0) { levelEq(k, i); awaken(k, i); } const j = E.s.indexOf(1); if (j >= 0 && E.c[j] > 1) dismantle(k, j); })'],
  ['equip: pet slots', 'setPetSlot(S.eq.pet.s.indexOf(1), 1); setPetSlot(S.eq.pet.s.lastIndexOf(1), 2)'],
  ['forge: enchant, enhance, reforge', 'for (let k = 0; k < 5; k++) { rerollEnch(); enhance(); reforge(); }'],
  ['forge: gems', 'for (let k = 0; k < 6; k++) craftGem(); for (const key of Object.keys(S.gemInv)) { const [tt, lv] = key.split(":"); fuseGem(tt, +lv); socketGem(tt, +lv); }'],
  ['hero: talents', 'for (const [, nodes] of TALENTS) for (const [k] of nodes) if (talPoints() - talSpent() > 0 && tal(k) < 5) S.tal[k] = tal(k) + 1; recalc()'],
  ['hero: class evolution', 'S.cls = "knight"; evolveClass("B"); evolveClass("A")'],
  ['allies: expedition', 'startExped("knight", 1); if (S.exped) { S.exped.end = Date.now() - 1; collectExped(); }'],
  ['allies: camp', 'campUpgrade("mine"); campUpgrade("garden"); campCollect("mine"); campCollect("garden")'],
  ['trials: rank trial', 'startRun("trial", true); __cc.step(3); endRun(true)'],
  ['trials: dungeons', 'for (const d of DUNGEONS) { S.keys[d.id] = 1; startRun(d.id, true); __cc.step(2); if (run) endRun(true); }'],
  ['trials: abyss, rush, daily', 'for (const m of ["abyss", "rush"]) { S.abyssT = 0; S.rushT = 0; startRun(m, true); __cc.step(2); if (run) endRun(false); } S.dailyCh = null; startDailyCh(); __cc.step(2); if (run) endRun(false)'],
  ['trials: treasure dig', 'openDig(); document.querySelectorAll("[data-dig]").forEach((b, i) => i < 3 && b.click())'],
  ['quests: daily, quests, weekly, milestones', 'S.daily.last = ""; claimDaily(); S.quests.forEach((q, i) => { q.done = true; claimQuest(i); }); claimMiles()'],
  ['quests: gem shop', 'GEMSHOP.forEach(g => buyGem(g))'],
  ['quests: event shop and pass', 'evCheck(); S.evTok = 1e4; EV_SHOP.forEach(([id]) => buyEv(id)); S.pass.xp = 99999; for (let k = 1; k <= 30; k++) claimPass(k)'],
  ['legacy: lab', 'LAB.forEach(r => startLab(r[0])); S.labJobs.forEach(j => { j.end = Date.now() - 1; }); labTick()'],
  ['legacy: legacy shop', 'S.ltok = 999; document.querySelectorAll("[data-ls]").forEach(b => b.click())'],
  ['legacy: retire', 'retireAs("rogue"); __cc.step(5)'],
  ['legacy: challenge', 'S.floor = S.maxFloor = 40; startChallenge("glass"); __cc.step(5); S.chal = null'],
  ['legacy: ascend', 'S.deepest = S.floor = S.maxFloor = 120; S.tales = 5000; ascendArm = 0; ascend(); ascend(); __cc.step(5)'],
  ['trials: titan', 'S.keys.titan = 1; startRun("titan", true); __cc.step(3); if (run) endRun(true)'],
  ['world: new areas past floor 110', 'for (const f of [111, 116, 121, 126]) { S.floor = f; S.maxFloor = Math.max(S.maxFloor, f); S.deepest = Math.max(S.deepest, f); enemies = []; spawnWave(); __cc.step(1); draw(); }'],
  ['legacy: progress chart', 'S.hist = [[0, 1, 1, 0], [600, 20, 20, 0], [1200, 8, 30, 1]]; showTab("legacy"); drawHist()'],
  ['train: boosters', 'S.bch = { gold: 3, dmg: 3, spd: 3 }; const d0 = st.dmg; useBoost("dmg"); useBoost("gold"); useBoost("spd"); if (!(st.dmg > d0 * 1.9)) throw Error("damage booster did nothing")'],
  ['quests: idle chest', 'S.afkT = Date.now() - 5 * 3600e3; const g0 = S.gems; claimAfk(false); S.gems += 100; claimAfk(true); if (!(S.gems > g0)) throw Error("idle chest paid nothing")'],
  ['equip: gear presets', 'savePreset(0); const was = S.eq.weapon.on; S.eq.weapon.on = -1; loadPreset(0); if (S.eq.weapon.on !== was) throw Error("preset did not restore the weapon")'],
  ['trials: featured dungeon pays double', 'const id = featDung(); if (featM(id) !== 2 || featM(id === "vault" ? "mine" : "vault") !== 1) throw Error("featured multiplier wrong")'],
  ['map: travel', 'S.deepest = Math.max(S.deepest, 30); travel(20); travel(1)'],
  ['ui: every tab and modal', 'Object.keys(RENDER).forEach(k => showTab(k)); breakdown(); renderFullLog(); openGuide(); shareCard(); renderMap(); renderSettings(); buildDev(); document.querySelectorAll(".overlay").forEach(o => { o.hidden = true; })'],
  ['play: 5 minutes with every auto on', 'Object.keys(S.set).forEach(k => { if (typeof S.set[k] === "boolean" && k !== "tips") S.set[k] = true; }); __cc.step(300)']
];

const EXPECT = {
  'train: evolve parts': 'PARTS.some(p => ptier(p.id) > 0)',
  'skills: summon': 'Object.keys(S.skOwn).length > 0',
  'equip: summon every slot': 'CATS.every(k => S.eq[k].s.some(Boolean))',
  'forge: enchant, enhance, reforge': 'S.ench.some(Boolean)',
  'forge: gems': 'S.sock.some(Boolean) || Object.keys(S.gemInv).length > 0',
  'allies: expedition': 'S.life.expeds >= 1',
  'trials: rank trial': 'S.rank >= 9',
  'trials: dungeons': 'S.life.dungeons >= 4',
  'quests: daily, quests, weekly, milestones': 'S.mileDone >= 100 && S.daily.streak >= 1',
  'trials: titan': 'S.life.titans >= 1 && S.life.titanBest >= 1',
  'world: new areas past floor 110': 'S.life.beasts.jelly > 0 || S.life.beasts.scarab > 0 || S.life.beasts.gargoyle > 0 || S.life.beasts.alien > 0 || enemies.some(e => ["jelly", "scarab", "gargoyle", "alien"].includes(e.kind))',
  'train: boosters': 'boostLeft("dmg") > 0 && S.bch.dmg === 2',
  'quests: idle chest': 'S.afkQ.n === 2',
  'legacy: lab': 'Object.values(S.lab).some(v => v > 0)',
  'legacy: retire': 'S.runs >= 9 && S.cls === "rogue" && S.tales > 900',
  'legacy: ascend': 'S.stars >= 1 && S.tales === 0',
  'play: 5 minutes with every auto on': 'S.life.time > 0 && S.floor >= 1'
};
const CHECK = `(() => {
  const bad = [];
  const walk = (o, p, d) => { if (d > 6 || o === null) return; if (typeof o === 'number') { if (!isFinite(o)) bad.push(p + '=' + o); return; } if (typeof o === 'object') for (const k in o) walk(o[k], p + '.' + k, d + 1); };
  walk(S, 'S', 0);
  for (const k of ['gold', 'gems', 'runes', 'shards']) if (S[k] < 0) bad.push('S.' + k + ' negative ' + S[k]);
  for (const k of ['dmg', 'maxHp', 'goldMult', 'tap', 'atkInt', 'crit', 'critMult']) if (!isFinite(st[k]) || st[k] < 0) bad.push('st.' + k + '=' + st[k]);
  for (const k of CATS) { const E = S.eq[k]; if (E.c.length !== 24 || E.c.some(v => v < 0)) bad.push('eq.' + k + ' counts'); if (E.on >= 0 && !E.s[E.on]) bad.push('eq.' + k + ' equips an unowned piece'); }
  if (S.floor < 1 || S.floor > S.maxFloor + 1) bad.push('floor ' + S.floor + ' max ' + S.maxFloor);
  return bad;
})()`;

(async () => {
  const browser = await chromium.launch();
  let failed = 0;
  for (const [label, save] of [['rich save', RICH], ['fresh save', null]]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(raw => {
      if (sessionStorage.getItem('s')) return;
      sessionStorage.setItem('s', 1); localStorage.clear();
      if (raw) localStorage.setItem('coincrawl.v1', raw);
    }, save && JSON.stringify(save));
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.goto(PAGE);
    await page.waitForTimeout(500);
    console.log(`== ${label}`);
    for (const [name, code] of ACTIONS) {
      const expect = save ? EXPECT[name] : null;
      const res = await page.evaluate(([code, check, expect]) => {
        try { __cc.ev(code); __cc.step(1); } catch (e) { return { err: String(e && e.stack || e).split('\n').slice(0, 2).join(' ') }; }
        const bad = __cc.ev(check);
        if (expect && !__cc.ev(expect)) bad.push('expected: ' + expect);
        return { bad };
      }, [code, CHECK, expect]);
      const pe = errs.splice(0);
      const ok = !res.err && !res.bad.length && !pe.length;
      if (!ok) failed++;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${res.err ? ' — threw: ' + res.err : ''}${res.bad && res.bad.length ? ' — bad values: ' + res.bad.slice(0, 5).join(', ') : ''}${pe.length ? ' — page error: ' + pe[0] : ''}`);
    }
    await ctx.close();
  }
  await browser.close();
  if (failed) { console.log(`\n${failed} check(s) failed.`); process.exit(1); }
  console.log('\nEvery feature ran cleanly.');
})();
