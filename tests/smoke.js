// Smoke test for the built site in dist/. Run with: npm test
// (which builds first). Needs Playwright with Chromium.
// Fails (exit 1) on any page error, a broken page, a broken old-save
// upgrade, or a runaway early-game pace in Coin Crawl.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

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
  await page.waitForTimeout(5600); const tA = (await state()).life.time; await page.waitForTimeout(5600); const tB = (await state()).life.time;
  check(tB - tA < 1, `pause stops the game (moved ${(tB - tA).toFixed(1)}s while paused)`);
  await page.keyboard.press('KeyP');
  await page.keyboard.press('Backquote'); await page.waitForTimeout(200);
  check(!(await page.isVisible('#devModal')), 'developer menu is locked without the passphrase');
  await page.click('#setBtn').catch(() => page.evaluate(() => document.querySelector('[data-open="setModal"], #settingsBtn') && 0));
  await page.evaluate(() => { document.querySelector('#devPass').value = 'not-the-passphrase'; document.querySelector('#devUnlock').click(); });
  await page.waitForTimeout(300);
  check(await page.evaluate(() => document.querySelector('#devRow').hidden), 'a wrong passphrase does not unlock it');
  await page.evaluate(() => document.querySelectorAll('.overlay').forEach(o => { o.hidden = true; }));
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
  // app layout: the bottom tabs stay on screen and work, nothing widens the page, closing the menu grows the dungeon
  await page.waitForTimeout(1200);
  for (const tab of ['equip', 'skills', 'allies', 'trials', 'quests', 'book', 'legacy', 'hero', 'forge', 'train']) await page.click('#tab-' + tab, { timeout: 3000 });
  check(true, 'every bottom tab can be tapped on a phone');
  check(await page.evaluate(() => innerWidth <= 390 && document.querySelector('.shop .tabs').getBoundingClientRect().bottom <= innerHeight + 1), 'the bottom tab bar stays on screen');
  const h0 = await page.evaluate(() => document.querySelector('#arena').clientHeight);
  await page.click('#tab-train'); await page.waitForTimeout(300);
  const h1 = await page.evaluate(() => document.querySelector('#arena').clientHeight);
  check(h1 > h0 * 1.5, `tapping the open tab closes the menu and grows the dungeon (${h0}px -> ${h1}px)`);
  await page.click('#tab-equip'); await page.waitForTimeout(300);
  check(await page.evaluate(() => !document.body.classList.contains('panelClosed')), 'tapping a tab opens the menu again');
  await ctx.close();

  // 6. Installable app: served over http, the service worker caches the game so it loads offline
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  // a tiny stand-in for Supabase so the global leaderboard can be tested offline
  const board = new Map(), transfers = new Map();
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/config.js') { res.writeHead(200, { 'content-type': 'text/javascript' }); res.end(`window.IDK_CONFIG = { supabaseUrl: location.origin, supabaseKey: 'test-key' };`); return; }
    if (u.pathname === '/rest/v1/rpc/submit_score' && req.method === 'POST') {
      let body = ''; req.on('data', c => { body += c; }); req.on('end', () => {
        const b = JSON.parse(body), cur = board.get(b.p_id);
        if (req.headers.apikey !== 'test-key' || !/^[A-Za-z0-9 _.-]{2,16}$/.test(b.p_name || '') || (cur && cur.secret !== b.p_secret)) { res.writeHead(400); res.end('{"message":"bad name or not your score"}'); return; }
        const row = cur || { player_id: b.p_id, secret: b.p_secret, deepest: 0, abyss: 0, rush: 0, titan: 0, stars: 0 };
        row.name = b.p_name; for (const k of ['deepest', 'abyss', 'rush', 'titan', 'stars']) row[k] = Math.max(row[k], b['p_' + k] || 0); row.cls = b.p_cls || row.cls;
        board.set(b.p_id, row); res.writeHead(204); res.end();
      }); return;
    }
    if (u.pathname === '/rest/v1/rpc/create_transfer' || u.pathname === '/rest/v1/rpc/take_transfer') {
      let body = ''; req.on('data', c => { body += c; }); req.on('end', () => {
        const b = JSON.parse(body);
        res.writeHead(200, { 'content-type': 'application/json' });
        if (u.pathname.endsWith('create_transfer')) { const code = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, 'X'); transfers.set(code, b.p_data); res.end(JSON.stringify(code)); }
        else { const c = String(b.p_code || '').toUpperCase(), d = transfers.get(c); transfers.delete(c); res.end(JSON.stringify(d === undefined ? null : d)); }
      }); return;
    }
    if (u.pathname === '/rest/v1/scores') {
      const col = (u.searchParams.get('order') || 'deepest.desc').split('.')[0];
      const rows = [...board.values()].filter(r => r[col] > 0).sort((a, b) => b[col] - a[col]).map(({ secret, ...r }) => r);
      res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(rows)); return;
    }
    let f = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!f.startsWith(DIST) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
  }).listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  page = await ctx.newPage(); page.on('pageerror', e => errors.push(`http: ${e.message}`));
  await page.goto(base + '/coin-crawl/');
  check(await page.evaluate(() => fetch('../manifest.webmanifest').then(r => r.json()).then(m => m.icons.length > 0 && m.start_url === './coin-crawl/')), 'web manifest is served with icons');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); await page.waitForTimeout(500);
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(800);
  check(await page.isVisible('#titleGo') || await page.isVisible('#arena'), 'the game loads offline after one visit');
  await ctx.close();

  // 7. Global leaderboard on the website: set a name, post, see yourself
  ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(raw => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('coincrawl.v1', raw); } }, JSON.stringify({ floor: 40, maxFloor: 40, deepest: 40, runs: 3, seenVer: 99, life: { kills: 50, time: 3600 }, set: { tips: false } }));
  page = await ctx.newPage(); page.on('pageerror', e => errors.push(`board: ${e.message}`));
  await page.goto(base + '/coin-crawl/'); await page.waitForTimeout(600);
  await page.click('#titleGo'); await page.click('#tab-legacy'); await page.waitForTimeout(800);
  check(await page.isVisible('#webName'), 'website shows the global leaderboard when it is configured');
  await page.fill('#webName', 'Tester <b>'); await page.click('[data-cl="name"]'); await page.waitForTimeout(1200);
  const mine = [...board.values()][0];
  check(!!mine && mine.name === 'Tester b' && mine.deepest === 40, `posting a score stores a clean name and the best floor (${mine && mine.name}, ${mine && mine.deepest})`);
  check(/Tester b \(you\)/.test(await page.textContent('#boardBox')), 'your row shows on the board');
  const forged = await page.evaluate(async () => { const r = await fetch('/rest/v1/rpc/submit_score', { method: 'POST', headers: { apikey: 'test-key', 'Content-Type': 'application/json' }, body: JSON.stringify({ p_id: window.IDKBoard.me().id, p_secret: 'wrong'.repeat(8), p_name: 'Hacker', p_deepest: 9999 }) }); return r.status; });
  check(forged >= 400 && [...board.values()][0].deepest === 40, 'someone without your secret cannot overwrite your score');
  await ctx.close();

  // 8. Moving a save between devices: transfer code, save file and save code
  const deviceA = await browser.newContext({ ...require('playwright').devices['iPhone 13'], acceptDownloads: true });
  await deviceA.addInitScript(raw => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('coincrawl.v1', raw); } }, JSON.stringify({ floor: 37, maxFloor: 37, deepest: 37, runs: 2, gems: 123, seenVer: 99, life: { kills: 50, time: 3600 }, set: { tips: false } }));
  const phone = await deviceA.newPage(); phone.on('pageerror', e => errors.push(`phone: ${e.message}`));
  await phone.goto(base + '/coin-crawl/'); await phone.waitForTimeout(500); await phone.click('#titleGo');
  await phone.click('#openSettings'); await phone.click('#xferMake'); await phone.waitForTimeout(600);
  const code = (await phone.textContent('#xferShow')).trim();
  check(/^[A-Z0-9]{6}$/.test(code), `the phone gets a 6-character transfer code (${code})`);
  const [dl] = await Promise.all([phone.waitForEvent('download'), phone.click('#fileSave')]);
  const file = path.join(require('os').tmpdir(), 'cc-save-test.txt'); await dl.saveAs(file);
  await phone.click('#exportBtn'); await phone.waitForTimeout(300);
  const pasted = await phone.inputValue('#saveText');
  check(pasted.startsWith('CC2:') && pasted.length < JSON.stringify(await phone.evaluate(() => JSON.parse(localStorage.getItem('coincrawl.v1')))).length / 2, `save codes are compressed (${pasted.length} characters)`);
  const fresh = async () => {
    const c = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await c.addInitScript(() => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.clear(); } });
    const pg = await c.newPage(); pg.on('pageerror', e => errors.push(`pc: ${e.message}`)); pg.on('dialog', d => d.accept());
    await pg.goto(base + '/coin-crawl/'); await pg.waitForTimeout(500); await pg.click('#titleGo'); await pg.click('#openSettings');
    return { c, pg, floor: () => pg.evaluate(() => JSON.parse(localStorage.getItem('coincrawl.v1')).deepest) };
  };
  let pc = await fresh();
  await pc.pg.fill('#xferIn', code.toLowerCase()); await pc.pg.click('#xferLoad'); await pc.pg.waitForTimeout(800);
  check(await pc.floor() === 37, 'a PC loads the phone save from the transfer code');
  await pc.pg.fill('#xferIn', code); await pc.pg.click('#xferLoad'); await pc.pg.waitForTimeout(500);
  check(/already used|wrong/.test(await pc.pg.textContent('#saveMsg')), 'a transfer code only works once');
  await pc.c.close();
  pc = await fresh();
  await pc.pg.setInputFiles('#fileLoad', file); await pc.pg.waitForTimeout(800);
  check(await pc.floor() === 37, 'a PC loads the phone save from a save file');
  await pc.c.close();
  pc = await fresh();
  await pc.pg.fill('#saveText', pasted); await pc.pg.click('#importBtn'); await pc.pg.waitForTimeout(800);
  check(await pc.floor() === 37, 'a PC loads the phone save from a pasted save code');
  await pc.c.close(); await deviceA.close(); server.close();

  check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
  await browser.close();
  if (fails.length) { console.log(`\n${fails.length} check(s) failed.`); process.exit(1); }
  console.log('\nAll checks passed.');
})();
