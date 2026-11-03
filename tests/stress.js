// Crash and freeze test for Coin Crawl. Loads extreme, overflowing and
// corrupted saves, then clicks random buttons and taps the dungeon. Fails on
// any page error, console error, a frozen main thread, or a game loop that
// stopped advancing. Run with: npm run stress (builds first).
const { chromium } = require('playwright');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'dist', 'coin-crawl', 'index.html');
const SECONDS = +(process.env.STRESS_SECONDS || 20);
const all = o => Object.fromEntries(['sword', 'armor', 'boots', 'ring', 'gaunt', 'torch', 'pet'].map(k => [k, o]));
const CASES = {
  'fresh game': null,
  'late game': { floor: 400, maxFloor: 400, deepest: 400, runs: 40, rank: 12, stars: 60, tales: 1e5, gold: 1e80, gems: 1e6, runes: 1e6, shards: 1e6, lv: all(900), pevo: all(4), allies: { knight: 300, wizard: 300, bard: 300, raccoon: 300, frog: 300, crab: 300 }, seenVer: 99, life: { kills: 9, best: 400 } },
  'number overflow': { floor: 1700, maxFloor: 1700, deepest: 1700, runs: 5, stars: 900, tales: 1e9, gold: 1e308, gems: 1e300, lv: all(5000), seenVer: 99, life: { kills: 9 } },
  'garbage values': { gold: 'abc', gems: null, floor: -5, deepest: 'x', lv: { sword: 'x', armor: -3 }, quests: 'nope', ench: {}, locks: 7, set: 5, eq: { weapon: { c: 'bad' } }, keys: null, keyT: 0, grottoT: -1, labJobs: [{ k: 'zzz', end: 'x' }], tutQ: ['nope', 'tab:forge'], life: { kills: 9 }, seenVer: 99 },
  'corrupted JSON': '{"gold": 5, "floor": 3',
  'very old timestamps': { floor: 30, maxFloor: 30, deepest: 30, keyT: 1, grottoT: 1, lastSeen: 1, abyssT: 1, rushT: 1, camp: { mine: 3, garden: 3, mineT: 1, gardenT: 1 }, exped: { id: 'knight', h: 1, end: 1 }, allies: { knight: 5 }, seenVer: 99, life: { kills: 9 } }
};

(async () => {
  const browser = await chromium.launch();
  const fails = [];
  for (const [name, save] of Object.entries(CASES)) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(raw => {
      if (sessionStorage.getItem('s')) return;
      sessionStorage.setItem('s', 1); localStorage.clear();
      if (raw !== null) localStorage.setItem('coincrawl.v1', raw);
    }, save === null ? null : typeof save === 'string' ? save : JSON.stringify(save));
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.goto(PAGE);
    await page.waitForTimeout(500);
    const alive = async () => Promise.race([page.evaluate(() => true), new Promise(r => setTimeout(() => r(false), 3000))]);
    const gameTime = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('coincrawl.v1')).life.time || 0; } catch (e) { return -1; } });
    if (await page.isVisible('#titleGo')) await page.click('#titleGo');
    const box = await page.locator('#arena').boundingBox();
    const t0 = Date.now(), time0 = await gameTime();
    let clicks = 0, frozen = false;
    while (Date.now() - t0 < SECONDS * 1000) {
      if (!(await alive())) { frozen = true; break; }
      // close any open overlay now and then, like a player would
      if (Math.random() < 0.3) await page.evaluate(() => { for (const o of document.querySelectorAll('.overlay:not([hidden])')) { const c = o.querySelector('[data-close]'); if (c) c.click(); } });
      const r = Math.random();
      if (r < 0.4) { for (let k = 0; k < 4; k++) await page.mouse.click(box.x + Math.random() * box.width, box.y + Math.random() * box.height); }
      else {
        const n = await page.evaluate(() => {
          const els = [...document.querySelectorAll('button, .chip, [data-tal], [data-lab]')].filter(b => !b.disabled && b.offsetParent && !/reset|wipe|delete|export|download/i.test(b.textContent + b.id));
          const b = els[Math.floor(Math.random() * els.length)];
          if (b) b.click();
          return els.length;
        }).catch(() => 0);
        if (!n) await page.keyboard.press(['Space', '1', '2', '3', 'u', 'm', 'b', 'Escape'][Math.floor(Math.random() * 8)]);
      }
      clicks++;
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(5600); // one save cycle
    const time1 = await gameTime();
    const moved = time1 > time0;
    const ok = !frozen && moved && errs.length === 0;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${clicks} actions, game time ${Math.round(time0)}s -> ${Math.round(time1)}s${frozen ? ', FROZEN' : ''}${errs.length ? ', errors: ' + [...new Set(errs)].slice(0, 4).join(' | ') : ''}`);
    if (!ok) fails.push(name);
    await ctx.close();
  }
  await browser.close();
  if (fails.length) { console.log(`\n${fails.length} case(s) failed.`); process.exit(1); }
  console.log('\nNo crashes or freezes.');
})();
