#!/usr/bin/env node
// Builds the static site into dist/.
//
// Pages in this repo are written in Claude artifact format: they start with
// <title>, <meta>, <link> and <style> and leave out the document skeleton,
// which the artifact viewer adds when it publishes. A plain web host does not
// add it, so this script wraps each page in a full HTML document (doctype,
// charset, viewport and the same small reset the viewer uses) and copies
// every other file as is.
//
// Usage: node scripts/build.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SOURCES = ['index.html', 'coin-crawl', 'orbit-hop'];

const RESET = ':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}' +
  'body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}img{max-width:100%}[hidden]{display:none!important}';

// Pull the leading <title>, <meta> and <link> tags into <head>; leave the rest in <body>.
function wrap(html) {
  if (/^\s*<!doctype/i.test(html)) return html; // already a full document
  const head = [];
  let rest = html;
  const tag = /^\s*(<title>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>)/i;
  let m;
  while ((m = rest.match(tag))) { head.push(m[1]); rest = rest.slice(m[0].length); }
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
    head.join('\n') + '\n<style>' + RESET + '</style>\n</head>\n<body>\n' + rest.trim() + '\n</body>\n</html>\n';
}

function copy(rel) {
  const src = path.join(ROOT, rel), dst = path.join(DIST, rel);
  const stat = fs.statSync(src);
  if (stat.isDirectory()) { for (const f of fs.readdirSync(src)) copy(path.join(rel, f)); return; }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (rel.endsWith('.html')) fs.writeFileSync(dst, wrap(fs.readFileSync(src, 'utf8')));
  else fs.copyFileSync(src, dst);
}

fs.rmSync(DIST, { recursive: true, force: true });
for (const s of SOURCES) copy(s);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, d) => n + (d.isDirectory() ? count(path.join(dir, d.name)) : 1), 0);
console.log(`Built ${count(DIST)} files into dist/`);
