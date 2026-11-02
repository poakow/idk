// Smoke test for coin-crawl.html. Run with: node tests/smoke.js
// Needs Playwright with Chromium. Fails (exit 1) on any page error,
// a broken old-save upgrade, or a runaway early-game pace.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'coin-crawl.html');
const seed = o => `if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('coincrawl.v1', ${JSON.stringify(JSON.stringify(o))}); }`;
const fails = [];
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails.push(msg); };

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const open = async (save, viewport) => {
    const ctx = await browser.newContext({ viewport: viewport || { width: 1280, height: 900 } });
    if (save) await ctx.addInitScript(seed(save));
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(URL); await page.waitForTimeout(600);
    return { ctx, page, state: () => page.evaluate(() => JSON.parse(localStorage.getItem('coincrawl.v1'))) };
  };

  // 1. Fresh game: title screen, then 45 seconds of tapping and buying
  let { ctx, page, state } = await open(null);
  check(await page.isVisible('#titleModal'), 'title screen shows on load');
  await page.click('#titleGo');
  const box = await page.locator('#arena').boundingBox();
  const t0 = Date.now();
  while (Date.now() - t0 < 45000) {
    for (let i = 0; i < 3; i++) await page.mouse.click(box.x + box.width * 0.6, box.y + box.height - 80);
    await page.click('#tab-train'); await page.click('#buyCheap');
  }
  let s = await state();
  check(s.floor >= 4, `fresh game makes progress (floor ${s.floor} after 45s)`);
  check(s.floor <= 25, `fresh game does not run away (floor ${s.floor} after 45s, limit 25)`);
  for (const tab of ['train', 'equip', 'forge', 'hero', 'skills', 'allies', 'trials', 'quests', 'book', 'legacy']) await page.click('#tab-' + tab);
  check(true, 'every tab opens');
  await ctx.close();

  // 2. Old save from before equipment existed upgrades cleanly
  ({ ctx, page, state } = await open({ floor: 12, maxFloor: 12, deepest: 12, gold: 100, weapon: { name: 'Sharp Spatula', base: 'Spatula', rar: 1, power: 2, pre: 'Sharp', pm: 1.1 }, book: { 'Spoon|0': 1 }, tab: 'gear' }));
  s = await state();
  check(s.eq && s.eq.weapon.on >= 0 && s.prefix.pre === 'Sharp', 'old weapon converts into equipment and keeps its prefix');
  check(s.tab === 'train', 'old Gear tab maps to Train');
  await ctx.close();

  // 3. Phone layout has no sideways scroll
  ({ ctx, page } = await open({ floor: 40, maxFloor: 40, deepest: 40, seenVer: 99, life: { kills: 1 } }, { width: 390, height: 844 }));
  await page.click('#titleGo'); await page.waitForTimeout(800);
  check(await page.evaluate(() => document.documentElement.scrollWidth) <= 390, 'phone layout fits 390px');
  await ctx.close();

  check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
  await browser.close();
  if (fails.length) { console.log(`\n${fails.length} check(s) failed.`); process.exit(1); }
  console.log('\nAll checks passed.');
})();
