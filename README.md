# idk Games

Two small browser games. No install, no account, no build tools needed to play.

| Game | What it is |
| --- | --- |
| **[Coin Crawl](coin-crawl/)** | An idle dungeon crawler. Your hero runs and fights on their own while you tap for combos, summon gear, pets and skills, evolve your class down branching paths, and push through 22 areas, the Endless Abyss and Boss Rush. Features unlock as you go deeper and retire, and a research lab and floor milestones give long-term goals. |
| **[Orbit Hop](orbit-hop/)** | A one-button space game. Let go of your orbit at the right moment and get caught by the next planet. |

## Play

- **On the web:** https://poakow.github.io/idk/
- **As an app:** open the site on your phone or in Chrome or Edge and choose *Install* or *Add to Home Screen*. After one visit the games also work offline.
- **Locally:** run `npm run serve` and open http://localhost:8080, or open `dist/index.html` after `npm run build`.

Progress saves in your browser (`localStorage`). Coin Crawl also has save export/import in Settings. Its leaderboard and cloud save only work when the game is opened inside Claude as an artifact; anywhere else those panels say so and the rest of the game works normally.

## Project layout

```
index.html              Landing page that links to both games
coin-crawl/
  index.html            Coin Crawl page: markup and styles
  coin-crawl.js         Coin Crawl game code
orbit-hop/
  index.html            Orbit Hop (single file)
scripts/build.js        Builds dist/ for normal web hosting, plus the app manifest and offline service worker
site/icons/             App icons
scripts/sim.js          Balance simulator: a bot plays Coin Crawl for hours of game time
tests/smoke.js          Playwright smoke test of the built site
tests/stress.js         Crash and freeze test: extreme and broken saves plus random clicking
tests/features.js       Feature test: drives every system and checks the save for impossible values
.github/workflows/
  ci.yml                Builds and tests every push and pull request
  pages.yml             Deploys dist/ to GitHub Pages from the default branch
```

### Why there is a build step

The pages are written in Claude artifact format: each file starts with `<title>`, `<meta>`, `<link>` and `<style>` and leaves out `<!doctype html>`, `<head>` and `<body>`, because the artifact viewer adds those when it publishes. A normal web host doesn't add them, and a page without a doctype renders in quirks mode. `scripts/build.js` wraps every page in a full HTML document (doctype, charset, viewport and the same small reset the viewer uses) and copies everything into `dist/`. Edit the source files, never `dist/`.

## Development

Needs Node 20 or newer.

```sh
npm ci                                   # install dev dependencies (Playwright)
npx playwright install chromium          # once, for the smoke test
npm run build                            # write dist/
npm test                                 # build, then run the smoke test
npm run serve                            # build and serve dist/ on port 8080
npm run stress                           # crash and freeze test (about 3 minutes)
npm run features                         # every system on a rich and a fresh save
npm run sim -- 8 active                  # simulate 8 hours of play (see Balance)
```

The smoke test checks that:

- every page renders in standards mode
- the landing page links to both games
- Orbit Hop starts a run
- a fresh Coin Crawl game makes steady progress without running away (about 8 taps a second for 45 seconds)
- old saves upgrade cleanly
- locked tabs match the player's progress, and a seasoned save has every tab and feature open
- the research lab shows and floor milestones pay out
- the phone layout fits 390px
- the site serves a web manifest and the game loads offline after one visit
- no page throws an error

### Balance

Coin Crawl's tuning knobs live in one table, `BAL`, near the top of `coin-crawl/coin-crawl.js`. The rule that keeps the game from running away: monster health grows faster per floor (×1.55) than everything you can buy with that floor's gold. Your power then always meets a wall, and retiring, ranks, research and ascending move the wall instead of breaking it.

To check a change, run the simulator. It loads the built game with `?sim`, which exposes the game internals to a bot and steps time without drawing:

```sh
npm run sim -- 24 active    # taps about 5 times a second, buys, summons, retires, ascends
npm run sim -- 4 idle       # never taps
```

It prints your deepest floor, tales, rank, stars and the main multipliers at fixed times. Current targets (best floor reached):

| Time | Active | Idle |
| --- | --- | --- |
| 10 min | about 45 | about 20 |
| 1 hour | about 95 | about 80 |
| 4 hours | about 115 | about 115 |
| 24 hours | about 300 | |

The bot plays better than most people, so treat these as upper bounds. Runs are random, so compare a few runs rather than single numbers.

### Unlocks

You start with only Train. Tabs, features and auto toggles open as your best floor rises and as you retire. The table is `UNLOCKS` in `coin-crawl.js`. A locked feature shows a dashed box that says what opens it. Unlocks use your best floor ever, so ascending never locks anything again.

### Coin Crawl developer menu

The developer menu (cheats for testing) is locked behind a passphrase, so players can't open it. Only a SHA-256 hash of the passphrase is in the code (`DEV_HASH` in `coin-crawl.js`). To unlock it on a device, enter the passphrase in Settings, or open the game once with `#dev=<passphrase>` at the end of the address. Then press <kbd>`</kbd> or use Settings > Developer menu. It has:

- typed amounts of any resource
- jump to any floor
- spawn bosses, goblins and rare monsters
- give gear, pets and skill copies
- god mode, one-hit kills and game speed up to ×10

Using it marks the save as a dev save, and dev saves are never posted to the leaderboard. To change the passphrase, put the SHA-256 hex of the new one in `DEV_HASH`. The `?sim` hook used by the simulator only works on local files and localhost.

## Deploying

1. In the repository on GitHub, open **Settings > Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to the default branch, or run the **Deploy to GitHub Pages** workflow from the Actions tab.

The workflow builds `dist/` and publishes it. Only the default branch deploys; every other branch still runs CI.
