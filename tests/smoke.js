// Smoke test for the built site in dist/. Run with: npm test
// (which builds first). Needs Playwright with Chromium.
// Fails (exit 1) on any page error, a broken page, a broken old-save
// upgrade, or a runaway early-game pace in Coin Crawl.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const url = rel => 'file://' + path.join(DIST, rel);
const seed = o => `if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('coincrawl.v1', ${JSON.stringify(JSON.stringify(o))}); }`;
const fails = [];
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails.push(msg); };

(async () => {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.log('dist/ is missing. Run: npm run build'); process.exit(1); }
  const browser = await chromium.launch();
  const errors = [];
  const open = async (rel, save, viewport) => {
    const ctx = await browser.newContext({ viewport: viewport || { width: 1280, height: 900 } });
    if (save) await ctx.addInitScript(seed(save));
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(`${rel}: ${e.message}`));
    await page.goto(url(rel)); await page.waitForTimeout(600);
    return { ctx, page, state: () => page.evaluate(() => JSON.parse(localStorage.getItem('coincrawl.v1'))) };
  };

  // 0. Every built page is a full document (standards mode, not quirks)
  for (const rel of ['index.html', 'coin-crawl/index.html', 'orbit-hop/index.html']) {
    const { ctx, page } = await open(rel);
    check(await page.evaluate(() => document.compatMode) === 'CSS1Compat', `${rel} renders in standards mode`);
    await ctx.close();
  }

  // 1. Landing page links to both games
  let { ctx, page, state } = await open('index.html');
  const links = await page.$$eval('a.game', as => as.map(a => a.getAttribute('href')));
  check(links.includes('coin-crawl/') && links.includes('orbit-hop/'), 'landing page links to both games');
  await ctx.close();

  // 2. Orbit Hop starts and launches
  ({ ctx, page } = await open('orbit-hop/index.html'));
  check(await page.isVisible('#menu'), 'Orbit Hop menu shows');
  await page.click('#go');
  for (let i = 0; i < 4; i++) { await page.waitForTimeout(500); await page.keyboard.press('Space'); }
  check(!(await page.isVisible('#menu')), 'Orbit Hop starts a run');
  await ctx.close();

  // 3. Coin Crawl fresh game: title screen, then 45 seconds of tapping and buying
  ({ ctx, page, state } = await open('coin-crawl/index.html'));
  check(await page.isVisible('#titleModal'), 'Coin Crawl title screen shows on load');
  await page.click('#titleGo');
  const box = await page.locator('#arena').boundingBox();
  const t0 = Date.now();
  while (Date.now() - t0 < 45000) {
    for (let i = 0; i < 3; i++) await page.mouse.click(box.x + box.width * 0.6, box.y + box.height - 80);
    await page.click('#tab-train'); await page.click('#buyCheap');
    await page.waitForTimeout(300); // about 8 taps a second, like a fast human
  }
  let s = await state();
  check(s.floor >= 3, `fresh game makes progress (floor ${s.floor} after 45s)`);
  check(s.floor <= 15, `fresh game does not run away (floor ${s.floor} after 45s, limit 15)`);
  const forgeLocked = await page.evaluate(() => document.querySelector('#tab-forge').classList.contains('locked'));
  check(forgeLocked === (s.floor < 8), `Forge tab lock matches progress (floor ${s.floor}, locked ${forgeLocked})`);
  await ctx.close();

  // 3b. A seasoned save: every tab and feature is open, nothing re-locks
  ({ ctx, page, state } = await open('coin-crawl/index.html', { floor: 70, maxFloor: 70, deepest: 70, runs: 6, rank: 5, seenVer: 99, life: { kills: 1 } }));
  await page.click('#titleGo');
  for (const tab of ['train', 'equip', 'forge', 'hero', 'skills', 'allies', 'trials', 'quests', 'book', 'legacy']) await page.click('#tab-' + tab);
  check(true, 'every Coin Crawl tab opens on a seasoned save');
  check(await page.evaluate(() => document.querySelectorAll('[data-lock].locked').length) === 0, 'every feature is unlocked on a seasoned save');
  check(await page.isVisible('#labBox .lab'), 'research lab shows its projects');
  check(/inside Claude|works when/.test(await page.textContent('#boardBox')), 'leaderboard explains it needs Claude when hosted elsewhere');
  await page.click('#tab-quests');
  check(await page.isVisible('#mileBtn'), 'floor milestones can be claimed');
  await page.click('#mileBtn');
  s = await state();
  check(s.mileDone === 70 && s.gems > 0, `claiming milestones pays out (up to floor ${s.mileDone})`);
  // quality of life
  await page.waitForTimeout(1200);
  check(await page.isVisible('#readyBar .rchip'), 'ready bar lists things to do');
  await page.click('#readyBar .rchip');
  await page.waitForTimeout(300);
  check(await page.evaluate(() => !!document.querySelector('.tutHi')), 'a ready chip jumps to and highlights its target');
  await page.click('#tab-legacy');
  await page.click('#panel-legacy .foldbtn');
  check(await page.evaluate(() => document.querySelector('#panel-legacy .box').classList.contains('folded')), 'sections fold');
  await page.waitForTimeout(5500);
  s = await state();
  check(Object.values(s.set.fold || {}).some(Boolean), 'folded sections are remembered');
  await page.keyboard.press('KeyP');
  const tA = (await state()).life.time; await page.waitForTimeout(6000); const tB = (await state()).life.time;
  check(tB - tA < 1, `pause stops the game (moved ${(tB - tA).toFixed(1)}s while paused)`);
  await page.keyboard.press('KeyP');
  await page.keyboard.press('Shift+Slash');
  check(await page.isVisible('#keysModal'), 'question mark opens the shortcut list');
  await ctx.close();

  // 4. Old save from before equipment existed upgrades cleanly
  ({ ctx, page, state } = await open('coin-crawl/index.html', { floor: 12, maxFloor: 12, deepest: 12, gold: 100, weapon: { name: 'Sharp Spatula', base: 'Spatula', rar: 1, power: 2, pre: 'Sharp', pm: 1.1 }, book: { 'Spoon|0': 1 }, tab: 'gear' }));
  s = await state();
  check(s.eq && s.eq.weapon.on >= 0 && s.prefix.pre === 'Sharp', 'old weapon converts into equipment and keeps its prefix');
  check(s.tab === 'train', 'old Gear tab maps to Train');
  await ctx.close();

  // 5. Phone layout has no sideways scroll
  ({ ctx, page } = await open('coin-crawl/index.html', { floor: 40, maxFloor: 40, deepest: 40, seenVer: 99, life: { kills: 1 } }, { width: 390, height: 844 }));
  await page.click('#titleGo'); await page.waitForTimeout(800);
  check(await page.evaluate(() => document.documentElement.scrollWidth) <= 390, 'Coin Crawl phone layout fits 390px');
  await ctx.close();

  check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
  await browser.close();
  if (fails.length) { console.log(`\n${fails.length} check(s) failed.`); process.exit(1); }
  console.log('\nAll checks passed.');
})();
