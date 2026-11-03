# idk Games

Two small browser games. No install, no account, no build tools needed to play.

| Game | What it is |
| --- | --- |
| **[Coin Crawl](coin-crawl/)** | An idle dungeon crawler. Your hero runs and fights on their own while you tap for combos, summon gear, pets and skills, evolve your class down branching paths, and push through 22 areas, the Endless Abyss and Boss Rush. |
| **[Orbit Hop](orbit-hop/)** | A one-button space game. Let go of your orbit at the right moment and get caught by the next planet. |

## Play

- **On GitHub Pages:** `https://poakow.github.io/idk/` once Pages is turned on (see [Deploying](#deploying)).
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
scripts/build.js        Builds dist/ for normal web hosting
tests/smoke.js          Playwright smoke test of the built site
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
```

The smoke test checks that:

- every page renders in standards mode
- the landing page links to both games
- Orbit Hop starts a run
- a fresh Coin Crawl game makes steady progress without running away (about 8 taps a second for 45 seconds)
- old saves upgrade cleanly
- every tab opens
- the phone layout fits 390px
- no page throws an error

### Coin Crawl developer menu

Press <kbd>`</kbd> in Coin Crawl, or open Settings > Developer menu, for cheats:

- typed amounts of any resource
- jump to any floor
- spawn bosses, goblins and rare monsters
- give gear, pets and skill copies
- god mode, one-hit kills and game speed up to ×10

Using it marks the save as a dev save.

## Deploying

1. In the repository on GitHub, open **Settings > Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to the default branch, or run the **Deploy to GitHub Pages** workflow from the Actions tab.

The workflow builds `dist/` and publishes it. Only the default branch deploys; every other branch still runs CI.
