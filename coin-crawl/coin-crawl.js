/* Coin Crawl game code. Loaded by coin-crawl.html. */
(() => {
  const $ = s => document.querySelector(s);
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wpick = (items, weights) => { let r = Math.random() * weights.reduce((a, b) => a + b, 0); for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setText = (el, v) => { v = String(v); if (el._t !== v) { el.textContent = v; el._t = v; } };
  const setHTML = (el, v) => { if (el._h !== v) { el.innerHTML = v; el._h = v; } };

  let S; // save, defined below
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
    if (S && S.set.numfmt === 'sci') return n.toExponential(2).replace('+', '');
    if (n >= 1e21) return n.toExponential(2).replace('+', '');
    const u = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx'];
    let i = -1;
    while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
    return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + u[i];
  }
  const pct = v => Math.round(v * 100) + '%';
  const pct1 = v => (Math.round(v * 1000) / 10) + '%';
  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
  const dur = s => s < 90 ? Math.round(s) + 's' : s < 5400 ? Math.round(s / 60) + 'm' : (s / 3600).toFixed(1) + 'h';
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const yesterday = () => { const d = new Date(Date.now() - 864e5); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

  /* ================= sprites ================= */
  const SPR = {
    slime: ['..........', '..........', '....aa....', '...aaaa...', '..aaaaaa..', '.acdaacda.', 'aaaaaaaaaa', 'aaabbbbaaa', 'aaaaaaaaaa', '.bbbbbbbb.'],
    bat: ['..........', 'b........b', 'bb.a..a.bb', 'bbbaaaabbb', 'bbacdacdbb', '.bbaaaabb.', '..b.ee.b..', '...e..e...', '..........', '..........'],
    goblin: ['..........', '...aaaa...', 'a.aaaaaa.a', 'aaacdacdaa', '.aaaaaaaa.', '.aaeeeeaa.', '..bbbbbb..', '.abbbbbba.', '..bb..bb..', '..bb..bb..'],
    skeleton: ['...cccc...', '..cccccc..', '..cddcddc.', '..cccccc..', '...cdcd...', '....cc....', '..cccccc..', '.c.cccc.c.', '...c..c...', '..cc..cc..'],
    mushroom: ['...aaaa...', '.aaaeaaaa.', 'aaeaaaaeaa', 'aaaaaaaaaa', '.bbbbbbbb.', '...cccc...', '..ccdcdc..', '..cccccc..', '..cccccc..', '...c..c...'],
    ghost: ['...aaaa...', '..aaaaaa..', '.aaaaaaaa.', '.addaadda.', '.addaadda.', '.aaaaaaaa.', '.aaaddaaa.', '.aaaaaaaa.', '.aaaaaaaa.', '.a.aa.aa.a'],
    rat: ['..........', '..........', '..a.......', '.aaa......', 'aacaaaaa..', 'aaaaaaaaa.', '.aaaaaaaaa', '..b..b..tt', '........t.', '..........'],
    eyeball: ['...aaaa...', '.aaaaaaaa.', 'aaaccccaaa', 'aaccddccaa', 'aacddddcaa', 'aaccddccaa', 'aaaccccaaa', '.aaaaaaaa.', '...aaaa...', '..b.b.b...'],
    crab: ['..........', 'aa......aa', 'a.a....a.a', '.aa....aa.', '..aaaaaa..', '.acdaacda.', 'aaaaaaaaaa', '.aaaaaaaa.', 'a.a....a.a', '..........'],
    spider: ['..........', 'a.a....a.a', '.a.aaaa.a.', '..aaaaaa..', 'aaacdcdaaa', '.aaaaaaaa.', 'a.aaaaaa.a', '.a.a..a.a.', 'a..a..a..a', '..........'],
    frog: ['..........', '..cc..cc..', '.cddccddc.', '.aaaaaaaa.', 'aaaaaaaaaa', 'aabbbbbbaa', 'aaaaaaaaaa', '.aaaaaaaa.', 'aa.a..a.aa', '..........'],
    imp: ['a........a', 'aa......aa', '.aaaaaaaa.', '.acdaacda.', '.aaaaaaaa.', '..aeeeea..', '...aaaa..t', '..aaaaaa.t', '..aa..aa..', '..a....a..'],
    golem: ['..aaaaaa..', '.abbbbbba.', '.bcdbbcdb.', '.bbbbbbbb.', 'aabbbbbbaa', 'abbbbbbbba', 'ab.bbbb.ba', 'aa.bbbb.aa', '..bb..bb..', '.aaa..aaa.'],
    mummy: ['...cccc...', '..cbcccc..', '..cdccdc..', '..ccbccc..', '...cccc...', '.cccbcccc.', 'cc.cccc.cc', '...cbcc...', '...cc.cc..', '..cc..cc..'],
    yeti: ['..aaaaaa..', '.aaaaaaaa.', '.abbbbbba.', '.abdbbdba.', '.abbeebba.', 'aaaaaaaaaa', 'aaaaaaaaaa', 'a.aaaaaa.a', '..aa..aa..', '.aaa..aaa.'],
    wisp: ['....aa....', '...aaa....', '..aaaaa...', '.aaccccaa.', 'aaccccccaa', 'acdccccdca', 'accccccca.', '.aaccccaa.', '..aaaaaa..', '...aaaa...'],
    mimic: ['..........', '.aaaaaaaa.', 'abbcdbcdba', 'aaaaaaaaaa', 'aeaeaeaeae', 'kkkkkkkkkk', 'eaeaeaeaea', 'abbbffbbba', 'abbbbbbbba', 'aaaaaaaaaa'],
    robot: ['....e.....', '....a.....', '..aaaaaa..', '.abbbbbba.', '.bccbbccb.', '.bbbbbbbb.', '..aaaaaa..', '.aabbbbaa.', '..a....a..', '.aa....aa.'],
    cactus: ['...aaaa...', '..aaaaaa..', '..acdacd..', 'a.aaaaaa.a', 'a.aabbaa.a', 'aaaaaaaaaa', '..aaaaaa..', '..aaaaaa..', '.eeeeeeee.', '..eeeeee..'],
    snail: ['..........', '.......d.d', '.......a.a', '...bbbbaa.', '..bbccbbaa', '.bbcbbcbaa', '.bbccccba.', '..bbbbbaa.', 'aaaaaaaaaa', '..........'],
    penguin: ['...aaaa...', '..aaaaaa..', '..adwwda..', '..awwwwa..', '..aweewa..', '.aawwwwaa.', 'aaawwwwaaa', '.aawwwwaa.', '..aaaaaa..', '..ee..ee..'],
    ogre: ['...aaaaaa...', '..aaaaaaaa..', '..acdaacda..', '..aaaaaaaa..', '..aeaaaaea..', '...aaaaaa...', '.bbbbbbbbbb.', 'abbbbbbbbbba', 'a.bbbbbbbb.a', '..bbbbbbbb..', '..aaa..aaa..', '.aaaa..aaaa.'],
    dragon: ['........aa..', '.......aaaa.', 'b.....aacdaa', 'bb...aaaaaee', 'bbb.aaaaa...', 'bbbbaaaa....', '.bbaaaaaa...', '..aaaaaaaa..', '.aaaccccaa..', 'aaa.cccc.a..', 'aa..aa.aa...', 'a...aa..aa..'],
    lich: ['....eeee....', '...e.ee.e...', '...cccccc...', '..ccdccdcc..', '..cccccccc..', '...cdcdcd...', '..bbbbbbbb.s', '.bbbbbbbbbbs', 'bbbbbbbbbb.s', '.bbbbbbbbb.s', '..bbbbbbbb.s', '.bbb.bb.bbb.'],
    bee: ['..........', '.cc....cc.', '..cc..cc..', '..aaaaaa..', '.adabbada.', '.aabbbbaa.', '..aaaaaa..', '...bbbb...', '....bb....', '..........'],
    octopus: ['...aaaa...', '..aaaaaa..', '.aaaaaaaa.', '.acdaacda.', '.aaaaaaaa.', '..aaaaaa..', '.a.a..a.a.', 'a.a.aa.a.a', '.a..aa..a.', '..........'],
    dknight: ['...aaaa...', '..aaaaaa..', '..acccca..', '..aaaaaa..', '.e.bbbb...', 'eeabbbbaa.', '.e.bbbb.a.', '...bbbb...', '...b..b...', '..bb..bb..'],
    ninja: ['..........', '...aaaa...', '..aaaaaa..', '..bcbbcb..', '..aaaaaa..', '...aaaa.e.', '..aaaaaae.', '.a.aaaa...', '...a..a...', '..aa..aa..'],
    clown: ['..e....e..', '.eee..eee.', '..cccccc..', '.cdccccdc.', '.cccbbccc.', '..cbbbbc..', '...cccc...', '..aaaaaa..', '.aaaaaaaa.', '..ee..ee..'],
    hero: ['...eeee...', '..eeeeee..', '..ecdcde..', '..eeeeee.f', '...gggg..f', '..aaaaaa.f', '.gaaaaaaff', '..aaaaaa..', '..bb..bb..', '..bb..bb..'],
    hero2: ['...eeee...', '..eeeeee..', '..ecdcde..', '..eeeeee.f', '...gggg..f', '..aaaaaa.f', '.gaaaaaaff', '..aaaaaa..', '.bb...bb..', 'bb.....bb.'],
    wizard: ['....a.....', '...aaa....', '..aaeaa.e.', '.aaaaaaas.', '..gdgdg.s.', '..ggggg.s.', '..wwwww.s.', '.bbwwwbbs.', '.bbbbbbbs.', '..bb.bb.s.'],
    knight: ['...cccc...', '..cccccc..', '..cdccdc..', '..cccccc..', '.ssaaaa...', 'sssaaaaaa.', 'sssaaaaaa.', '.ssaaaaa..', '..bb..bb..', '..bb..bb..'],
    bard: ['..rrrr.f..', '.rrrrrrf..', '...gggg...', '...dgdg...', '...gggg...', '..aaaaaa..', '.llaaaaa..', 'lllaaaaa..', '.l.bb.bb..', '...bb.bb..'],
    raccoon: ['..........', '.a......a.', '.aa....aa.', '.aaaaaaaa.', 'akckaakcka', '.aaaadaaa.', '..wwwwww..', '.aaaaaaaa.', '.aa....aa.', '..........'],
    chest: ['..........', '..........', '.aaaaaaaa.', 'abbbbbbbba', 'abbbbbbbba', 'aaaaeeaaaa', 'abbbeebbba', 'abbbbbbbba', 'aaaaaaaaaa', '..........'],
    tgoblin: ['....ee....', '...eeee...', '...aaaa...', 'a.aaaaaa.a', 'aaacdacdaa', '.aaaaaaaa.', '..bbbbbb.e', '.abbbbbbee', '..bb..bbee', '..bb..bb..']
  };
  const ICON = {
    sword: ['.......c', '......cc', '.....cc.', '....cc..', 'b..cc...', '.bcc....', '..b.....', '.b.b....'],
    armor: ['.a....a.', 'aaa..aaa', 'aaaaaaaa', '.aaccaa.', '.aaaaaa.', '.aaccaa.', '.aaaaaa.', '..aaaa..'],
    boots: ['..aa....', '..aa....', '..aa....', '..aa....', '..aaa...', '..aaaaa.', '.bbbbbb.', '........'],
    ring: ['...cc...', '..cddc..', '...cc...', '..b..b..', '.b....b.', '.b....b.', '..b..b..', '...bb...'],
    gaunt: ['.a.a.a..', '.a.a.a..', '.aaaaa.a', '.aaaaaaa', '.aaaaaa.', '.aaaaa..', '..bbb...', '..bbb...'],
    torch: ['...e....', '..eee...', '..ede...', '...c....', '...b....', '...b....', '...b....', '...b....'],
    pet: ['........', 'b......b', 'bb.aa.bb', 'bbaaaabb', 'bacaacab', '.baaaab.', '..b..b..', '........'],
    spin: ['..aaaa..', '.a....a.', 'a..bb..a', 'a.b..b.a', 'a.b..b.a', 'a..bb..a', '.a....a.', '..aaa.a.'],
    bolt: ['....aa..', '...aa...', '..aa....', '.aaaaaa.', '....aa..', '...aa...', '..aa....', '.a......'],
    heal: ['........', '.aa..aa.', 'abaaaaaa', 'abaaaaaa', '.aaaaaa.', '..aaaa..', '...aa...', '........'],
    rush: ['..aaaa..', '.abbbba.', 'abbaabba', 'abbabbba', 'abbbabba', 'abbaabba', '.abbbba.', '..aaaa..'],
    frenzy: ['...a....', '..aa..a.', '..aaa.a.', '.aabaaa.', '.abbbaa.', 'aabbbbaa', 'aabccbaa', '.aaccaa.'],
    box: ['........', '.aaaaaa.', 'abbbbbba', 'aaaccaaa', 'abbccbba', 'abbbbbba', 'abbbbbba', '.aaaaaa.'],
    relicbox: ['...aa...', '..abba..', '.abbbba.', 'abbccbba', 'abbccbba', '.abbbba.', '..abba..', '...aa...'],
    meteor: ['......aa', '.....aab', '....aab.', '.cccab..', 'cdddc...', 'cdddc...', 'cdddc...', '.ccc....'],
    stop: ['..aaaa..', '.a....a.', 'a..b...a', 'a..b...a', 'a..bbb.a', 'a......a', '.a....a.', '..aaaa..'],
    clone: ['.aa..bb.', '.aa..bb.', 'aaaabbbb', '.aa..bb.', '.aa..bb.', '.a.a.b.b', '.a.a.b.b', '........'],
    axe: ['..aaa...', '.aaaab..', '.aaa.b..', '..a..b..', '.....b..', '.....b..', '.....b..', '.....b..'],
    spoon: ['....aa..', '...aaaa.', '...aaaa.', '....aa..', '...b....', '..b.....', '.b......', 'b.......'],
    staff: ['...aa...', '..adda..', '...aa...', '...b....', '...b....', '...b....', '...b....', '...b....'],
    helm: ['..aaaa..', '.aaaaaa.', 'aaaaaaaa', 'aabaabaa', 'aabaabaa', 'aaaaaaaa', '.a....a.', '........'],
    amulet: ['a......a', '.a....a.', '..a..a..', '...aa...', '..bccb..', '.bccccb.', '..bccb..', '...bb...'],
    hammer: ['.aaaaaa.', '.abbbba.', '.aaaaaa.', '...cc...', '...cc...', '...cc...', '...cc...', '...cc...'],
    crown: ['........', 'a..a..a.', 'aa.aa.aa', 'aaaaaaaa', 'abaacaab', 'aaaaaaaa', 'aaaaaaaa', '........'],
    scroll: ['.aaaaaa.', 'abbbbbba', '.bccccb.', '.bbbbbb.', '.bcccbb.', '.bbbbbb.', 'abbbbbba', '.aaaaaa.'],
    book: ['.aaaaaa.', 'abbbbbba', 'abccccba', 'abbbbbba', 'abcccbba', 'abbbbbba', 'aaaaaaaa', '.cccccc.'],
    hourglass: ['aaaaaaaa', '.bbbbbb.', '..bccb..', '...cc...', '...bb...', '..bccb..', '.bccccb.', 'aaaaaaaa'],
    potion: ['...aa...', '...bb...', '..bccb..', '.bccccb.', 'bccdccdb', 'bcccccdb', '.bccccb.', '..bbbb..'],
    pouch: ['...aa...', '..a..a..', '.bbbbbb.', 'bbccccbb', 'bccddccb', 'bccddccb', 'bbccccbb', '.bbbbbb.']
  };
  const ICON_PAL = {
    sword: { c: '#e8eefc', b: '#f5b942' }, armor: { a: '#8f9bb8', c: '#c9d2ea' }, boots: { a: '#8a5a3c', b: '#4a3326' },
    ring: { c: '#62d2c4', d: '#d8fff9', b: '#f5b942' }, gaunt: { a: '#b7bfd6', b: '#6d5a8a' },
    torch: { e: '#ff8a3d', d: '#ffe066', c: '#9aa3ba', b: '#8a5a3c' }, pet: { a: '#a07be0', b: '#5d3f99', c: '#fff' },
    spin: { a: '#ff7ad9', b: '#ffffff' }, bolt: { a: '#ffe066' }, heal: { a: '#ff5d73', b: '#ffc2cc' },
    rush: { a: '#b07d1f', b: '#f5b942' }, meteor: { a: '#ffe066', b: '#ff8a3d', c: '#8a5a3c', d: '#ff5d73' }, stop: { a: '#9fe3ff', b: '#ffffff' }, clone: { a: '#62d2c4', b: '#c9d2ea' }, frenzy: { a: '#e8394d', b: '#ff8a3d', c: '#ffe066' },
    box: { a: '#5b3a26', b: '#a8693e', c: '#b98cff' }, box10: { a: '#5b3a26', b: '#f5b942', c: '#b98cff' }, relicbox: { a: '#3b8f84', b: '#62d2c4', c: '#e9fffb' },
    hourglass: { a: '#8a5a3c', b: '#c9d2ea', c: '#f5b942' }, hammer: { a: '#9aa3ba', b: '#c9d2ea', c: '#8a5a3c' }, crown: { a: '#f5b942', b: '#ff5d73', c: '#62d2c4' },
    scroll: { a: '#a8693e', b: '#efe3cf', c: '#6d5a8a' }, book: { a: '#6d3f9a', b: '#b98cff', c: '#efe3cf' }, potion: { a: '#8a5a3c', b: '#c9d2ea', c: '#ff7ad9', d: '#ffd3f1' },
    runepouch: { a: '#8a5a3c', b: '#4a3b5c', c: '#6fd6ff', d: '#d8f6ff' }, shardpouch: { a: '#8a5a3c', b: '#4a3b5c', c: '#ff9a5a', d: '#ffe0c8' }
  };
  const ALLY_PAL = {
    wizard: { a: '#7d5ad1', e: '#ffe066', s: '#8a5a3c', g: '#f2c9a0', d: '#1a1424', w: '#f1ecff', b: '#4d3591' },
    knight: { c: '#c9cfe0', d: '#1a1424', s: '#f5b942', a: '#4f7bd1', b: '#3a3048' },
    bard: { r: '#3c8a5a', f: '#ff5d73', g: '#f2c9a0', d: '#1a1424', a: '#e08a2c', l: '#a8693e', b: '#3a3048' },
    raccoon: { a: '#8d8d9e', k: '#2a2238', c: '#ffffff', d: '#1a1424', w: '#d9d6e6' },
    frog: { a: '#5fbf5a', b: '#2f6f33', c: '#ffffff', d: '#1a1424' },
    crab: { a: '#ff7a45', c: '#ffffff', d: '#1a1424' }
  };

  /* ================= world content ================= */
  const THEMES = [
    { name: 'Damp Cellar', kinds: ['slime', 'bat', 'rat'], tint: '#7bd88f', wall: '#1f2a2a', fx: 'drip', boss: 'slime' },
    { name: 'Fungus Halls', kinds: ['mushroom', 'slime', 'snail'], tint: '#c98bff', wall: '#281f33', fx: 'spores', boss: 'mushroom' },
    { name: 'Goblin Market', kinds: ['goblin', 'rat', 'mimic'], tint: '#a6d35a', wall: '#2c2418', fx: 'dust', boss: 'ogre' },
    { name: 'Sewer Spa', kinds: ['rat', 'slime', 'crab', 'frog'], tint: '#5fc7b0', wall: '#16262a', fx: 'bubbles', boss: 'crab' },
    { name: 'Spider Nest', kinds: ['spider', 'bat'], tint: '#b7a6d6', wall: '#1d1a24', fx: 'dust', boss: 'spider' },
    { name: 'Bone Pantry', kinds: ['skeleton', 'bat', 'mummy'], tint: '#e7dcc2', wall: '#26222a', fx: 'dust', boss: 'lich' },
    { name: 'Frog Swamp', kinds: ['frog', 'snail', 'mushroom'], tint: '#b5d65a', wall: '#1b2a1c', fx: 'bubbles', boss: 'frog' },
    { name: 'Haunted Library', kinds: ['ghost', 'eyeball', 'wisp'], tint: '#9fb4ff', wall: '#1c1d33', fx: 'sparkles', boss: 'lich' },
    { name: 'Desert Tomb', kinds: ['mummy', 'cactus', 'spider'], tint: '#e0b56a', wall: '#2e2416', fx: 'sand', boss: 'mummy' },
    { name: 'Frozen Freezer', kinds: ['yeti', 'penguin', 'wisp'], tint: '#9fe3ff', wall: '#17243a', fx: 'snow', boss: 'yeti' },
    { name: 'Lava Basement', kinds: ['slime', 'imp', 'golem'], tint: '#ff7a45', wall: '#311a1a', fx: 'embers', boss: 'dragon' },
    { name: 'Imp Office', kinds: ['imp', 'mimic', 'goblin'], tint: '#ff6f6f', wall: '#2b1a22', fx: 'embers', boss: 'ogre' },
    { name: 'Crab Disco', kinds: ['crab', 'eyeball', 'frog'], tint: '#ff7ad9', wall: '#2a1631', fx: 'sparkles', disco: true, boss: 'crab' },
    { name: 'Robot Factory', kinds: ['robot', 'golem', 'spider'], tint: '#9fc3d6', wall: '#1a2228', fx: 'sparks', boss: 'golem' },
    { name: 'Cloud Kingdom', kinds: ['wisp', 'penguin', 'bat'], tint: '#cfe3ff', wall: '#2a3350', fx: 'snow', boss: 'dragon' },
    { name: 'The Void Attic', kinds: ['ghost', 'eyeball', 'skeleton', 'wisp'], tint: '#6fa8ff', wall: '#161a33', fx: 'sparkles', boss: 'lich' },
    { name: 'Candy Caverns', kinds: ['slime', 'bee', 'clown'], tint: '#ff9fd1', wall: '#2c1a2a', fx: 'sparkles', boss: 'clown' },
    { name: 'Pirate Cove', kinds: ['crab', 'octopus', 'rat'], tint: '#5fb7c7', wall: '#142430', fx: 'bubbles', boss: 'octopus' },
    { name: 'Clock Tower', kinds: ['robot', 'dknight', 'bat'], tint: '#d6b26a', wall: '#231f1a', fx: 'dust', boss: 'dknight' },
    { name: 'Mushroom Rave', kinds: ['mushroom', 'frog', 'wisp'], tint: '#9dff6a', wall: '#1d1430', fx: 'spores', disco: true, boss: 'mushroom' },
    { name: 'Ninja Dojo', kinds: ['ninja', 'imp', 'spider'], tint: '#ff6f6f', wall: '#1f1416', fx: 'dust', boss: 'ninja' },
    { name: "Dragon's Bedroom", kinds: ['imp', 'golem', 'dknight'], tint: '#ff9a3d', wall: '#2b1410', fx: 'embers', boss: 'dragon' }
  ];
  const PROPS = { 'Damp Cellar': 'barrel', 'Fungus Halls': 'shroom', 'Goblin Market': 'crate', 'Sewer Spa': 'pipe', 'Spider Nest': 'web', 'Bone Pantry': 'bones', 'Frog Swamp': 'reed', 'Haunted Library': 'shelf', 'Desert Tomb': 'cactus', 'Frozen Freezer': 'icicle', 'Lava Basement': 'rock', 'Imp Office': 'desk', 'Crab Disco': 'speaker', 'Robot Factory': 'gear', 'Cloud Kingdom': 'cloud', 'The Void Attic': 'crate', 'Candy Caverns': 'candy', 'Pirate Cove': 'barrel', 'Clock Tower': 'gear', 'Mushroom Rave': 'speaker', 'Ninja Dojo': 'lantern', "Dragon's Bedroom": 'gold' };
  const GUARDIANS = ['Gorgonzola, Cheese of Doom', 'The Unpaid Intern Supreme', 'Count Dracoola', 'Grandma Gristle', 'Sir Reginald Fluffbottom', 'The Final Landlord', 'Baron Bananas', 'Queen of All Slimes', 'The Dentist', 'Lord Snackington', 'Mecha Steve', 'The Floor Manager'];
  const LORE = { slime: 'Mostly water, partly attitude.', bat: 'Hangs out. Literally.', rat: 'Knows where the cheese is. Will not tell.', mushroom: 'A fun guy, allegedly.', snail: 'Slow, but has never once given up.', goblin: 'Runs three small businesses and owes everyone money.', mimic: 'It was a chest. It had a lot of opinions.', crab: 'Walks sideways out of spite.', frog: 'Ribbit means "no refunds".', spider: 'Eight legs, zero chill.', skeleton: 'Has a funny bone, but it is broken.', mummy: 'Wrapped up in its own problems.', ghost: 'Still paying rent on a room it can walk through.', eyeball: 'Sees everything, says nothing.', wisp: 'A little candle with big dreams.', cactus: 'Hugs are free. Recovery is not.', yeti: 'Big, fluffy and very bad at hide and seek.', penguin: 'Dressed for an event nobody else was invited to.', imp: 'Middle management of the underworld.', golem: 'Rock solid in every way except conversation.', robot: 'Beeps when happy. Beeps when angry. Just beeps.', ogre: 'Has layers. Mostly anger.', dragon: 'Sleeps on gold. Has back problems.', lich: 'Kept its soul in a jar. Lost the lid.', bee: 'Busy. Always busy. Do not ask.', octopus: 'Eight arms, all of them pointing at you.', dknight: 'Very edgy. Literally covered in edges.', ninja: 'You did not see this entry.', clown: 'Honk.' };
  const KINDS = ['slime', 'bat', 'rat', 'mushroom', 'snail', 'goblin', 'mimic', 'crab', 'frog', 'spider', 'skeleton', 'mummy', 'ghost', 'eyeball', 'wisp', 'cactus', 'yeti', 'penguin', 'imp', 'golem', 'robot', 'ogre', 'dragon', 'lich', 'bee', 'octopus', 'dknight', 'ninja', 'clown'];
  const CNAME = { slime: 'Slime', bat: 'Bat', goblin: 'Goblin', skeleton: 'Skeleton', mushroom: 'Shroom', ghost: 'Ghost', rat: 'Rat', eyeball: 'Eyeball', crab: 'Crab', spider: 'Spider', frog: 'Frog', imp: 'Imp', golem: 'Golem', mummy: 'Mummy', yeti: 'Yeti', wisp: 'Wisp', mimic: 'Mimic', robot: 'Robot', cactus: 'Cactus', snail: 'Snail', penguin: 'Penguin', ogre: 'Ogre', dragon: 'Dragon', lich: 'Lich', bee: 'Bee', octopus: 'Octopus', dknight: 'Dark Knight', ninja: 'Ninja', clown: 'Clown' };
  const BIG = { ogre: 1, dragon: 1, lich: 1 };
  const FLOATY = { bat: 1, ghost: 1, eyeball: 1, wisp: 1, bee: 1 };
  const ADJ = ['Grumpy', 'Soggy', 'Overconfident', 'Sleepy', 'Tax-Evading', 'Moist', 'Polite', 'Furious', 'Suspicious', 'Dramatic', 'Wobbly', 'Snacking', 'Unemployed', 'Very Loud', 'Shy', 'Sweaty', 'Smug', 'Sarcastic', 'Lost', 'Crunchy', 'Extremely Online', 'Retired', 'Bored', 'Caffeinated'];
  const BOSSES = ['Big Steve', 'Lord Wobblebottom', 'The Landlord', 'Duke Dampness', 'Sir Chompsalot', 'Queen Gloop', 'Baron Von Crumbs', 'Auntie Fangs', 'Gary Sr.', 'The Intern', 'Count Crumbleton', 'Mega Brenda', 'Admiral Pinch', 'Professor Ooze', 'The HOA President', 'Middle Manager Mort', 'Grand Wizard Kevin II', 'Chef Rotten', 'The Tax Man', 'Princess Pebble'];
  const VARIANTS = {
    armored: { name: 'Armored', hp: 2.2, dmg: 1, gold: 1.6, text: 'extra tough' },
    speedy: { name: 'Speedy', hp: 0.9, dmg: 0.9, gold: 1.6, text: 'attacks fast' },
    giant: { name: 'Giant', hp: 2.6, dmg: 1.5, gold: 2.5, scale: 1.3, text: 'huge' },
    tiny: { name: 'Tiny', hp: 0.45, dmg: 0.6, gold: 1, scale: 0.7, text: 'tiny' },
    vampire: { name: 'Vampire', hp: 1.2, dmg: 1.1, gold: 1.6, text: 'heals when it hits you' },
    explosive: { name: 'Explosive', hp: 1, dmg: 0.9, gold: 1.7, text: 'explodes when it dies' },
    ghostly: { name: 'Ghostly', hp: 1, dmg: 1, gold: 1.6, text: 'dodges 30% of swings' },
    frozen: { name: 'Frozen', hp: 1.2, dmg: 0.9, gold: 1.5, text: 'slows your swings' },
    golden: { name: 'Golden', hp: 0.5, dmg: 0.5, gold: 6, text: 'a walking piñata' },
    split: { name: 'Splitting', hp: 1, dmg: 1, gold: 1.2, text: 'splits in two when it dies' }
  };
  const BOSS_MECH = {
    enrage: 'Enrages at half health',
    shield: 'Raises a shield now and then',
    summon: 'Calls in minions',
    regen: 'Slowly heals'
  };

  const PREFIXES = [['Rusty', 0.85, 10], ['Bent', 0.9, 12], ['Damp', 0.92, 12], ['Borrowed', 0.95, 12], ['Plain', 1, 14], ['Shiny', 1.05, 10], ['Sharp', 1.1, 8], ['Polished', 1.12, 6], ['Blazing', 1.18, 4], ['Haunted', 1.2, 4], ['Thundering', 1.22, 3], ['Enchanted', 1.25, 2.5], ['Ancient', 1.3, 1.5], ['Cosmic', 1.35, 1], ["Grandmaster's", 1.42, 0.6], ['Mythic', 1.5, 0.3]];
  const WBASE = ['Butter Knife', 'Sword', 'Spoon', 'Baguette', 'Pool Noodle', 'Axe', 'Umbrella', 'Fish', 'Spatula', 'Greatsword', 'Rolling Pin', 'Mop'];
  const WSUF = ['of Mild Peril', 'of Snacking', 'of the Bat', 'of Regret', 'of Doom (Probably)', 'of Tuesday', 'of the Landlord', 'of Vibes', 'of the Sewer', 'of Extra Cheese'];
  const GRADES = [{ n: 'Common', c: '#c9cfe0' }, { n: 'Uncommon', c: '#7bd88f' }, { n: 'Rare', c: '#6fb7ff' }, { n: 'Epic', c: '#c98bff' }, { n: 'Legendary', c: '#f5b942' }, { n: 'Mythic', c: '#ff5d73' }];
  const TIERN = ['IV', 'III', 'II', 'I'];
  const CATS = ['weapon', 'armor', 'helm', 'boots', 'acc', 'pet'];
  const PET_KINDS = ['slime', 'rat', 'snail', 'bat', 'frog', 'crab', 'penguin', 'mushroom', 'spider', 'ghost', 'wisp', 'cactus', 'imp', 'eyeball', 'robot', 'mimic', 'yeti', 'golem', 'mummy', 'skeleton', 'ogre', 'lich', 'dragon', 'tgoblin'];
  const lvMul = lv => 1 + 0.15 * (lv - 1);
  const EQ = {
    weapon: { name: 'Weapons', one: 'weapon', names: ['Butter Knife', 'Spoon', 'Spatula', 'Mop', 'Rolling Pin', 'Baguette', 'Fish', 'Umbrella', 'Pool Noodle', 'Axe', 'Sword', 'Greatsword', 'Haunted Halberd', 'Thunder Trident', 'Blazing Scimitar', 'Frost Fang', 'Dragonbone Cleaver', 'Sunforged Blade', 'Moonlit Katana', 'Starfall Hammer', 'Cosmic Spork', 'Void Reaver', 'Eternity Edge', 'The Last Baguette'],
      equip: (i, lv) => 1.1 * Math.pow(1.2, i) * lvMul(lv), owned: (i, lv) => 0.02 * Math.pow(1.2, i) * lvMul(lv),
      eqText: (i, lv) => `×${fmt2(EQ.weapon.equip(i, lv))} damage`, owText: (i, lv) => `+${pct1(EQ.weapon.owned(i, lv))} damage` },
    armor: { name: 'Armor', one: 'armor', names: ['Cardboard Box', 'Oven Mitt Vest', 'Leather Jerkin', 'Pot Helmet', 'Chainmail', 'Studded Leather', 'Bronze Plate', "Knight's Tabard", 'Steel Plate', 'Mithril Shirt', 'Guardian Mail', 'Shadow Cloak', 'Dragonhide', 'Crystal Aegis', 'Phoenix Robe', 'Titan Plate', 'Celestial Armor', 'Abyssal Carapace', 'Sun Mantle', 'Moon Mantle', 'Cosmic Onesie', 'Void Plate', 'Eternity Shell', 'Bathrobe of Legends'],
      equip: (i, lv) => 1.1 * Math.pow(1.2, i) * lvMul(lv), owned: (i, lv) => 0.02 * Math.pow(1.2, i) * lvMul(lv),
      eqText: (i, lv) => `×${fmt2(EQ.armor.equip(i, lv))} health`, owText: (i, lv) => `+${pct1(EQ.armor.owned(i, lv))} health` },
    acc: { name: 'Accessories', one: 'accessory', names: ['String Ring', 'Lucky Penny', 'Bottle Cap Medal', 'Four-Leaf Clover', 'Silver Band', 'Ruby Pin', 'Owl Charm', 'Horseshoe', 'Emerald Ring', 'Fang Necklace', "Rabbit's Foot", 'Golden Compass', 'Phoenix Feather', 'Dragon Eye', 'Starstone', 'Hourglass Pendant', 'Crown of Greed', 'Ring of Kings', 'Eye of Midas', 'Infinity Loop', 'Cosmic Bling', 'Void Pearl', 'Heart of Gold', 'Ring of Endless Snacks'],
      equip: (i, lv) => 1.08 * Math.pow(1.12, i) * lvMul(lv), crit: i => 0.004 * i, owned: (i, lv) => 0.015 * Math.pow(1.15, i) * lvMul(lv),
      eqText: (i, lv) => `×${fmt2(EQ.acc.equip(i, lv))} gold, +${pct1(EQ.acc.crit(i))} crit`, owText: (i, lv) => `+${pct1(EQ.acc.owned(i, lv))} gold` },
    pet: { name: 'Pets', one: 'pet', names: ['Pocket Slime', 'House Rat', 'Garden Snail', 'Fruit Bat', 'Tiny Frog', 'Hermit Crab', 'Desk Penguin', 'Lucky Shroom', 'Jumping Spider', 'Friendly Ghost', 'Lantern Wisp', 'Hug Cactus', 'Office Imp', 'Third Eye', 'Butler Bot', 'Pet Mimic', 'Baby Yeti', 'Mini Golem', 'Cuddly Mummy', 'Bone Buddy', 'Ogre Pup', 'Lich Kitten', 'Baby Dragon', 'Golden Goblin'],
      equip: (i, lv) => 0.3 * Math.pow(1.18, i) * lvMul(lv), owned: (i, lv) => 0.015 * Math.pow(1.2, i) * lvMul(lv),
      eqText: (i, lv) => `Fights beside you: hits for ${fmt2(EQ.pet.equip(i, lv))}× your damage every 1.2s`, owText: (i, lv) => `+${pct1(EQ.pet.owned(i, lv))} damage` },
    helm: { name: 'Helmets', one: 'helmet', names: ['Paper Hat', 'Bucket', 'Leather Cap', 'Colander', 'Iron Pot', 'Bronze Helm', 'Miner Helmet', 'Horned Cap', 'Steel Visor', 'Owl Helm', 'Knight Helm', 'Shadow Hood', 'Dragon Skull', 'Crystal Circlet', 'Phoenix Crest', 'Titan Helm', 'Crown of Thorns', 'Moon Diadem', 'Sun Halo', 'Helm of Ages', 'Cosmic Beanie', 'Void Visage', 'Eternity Crown', 'The Thinking Cap'],
      equip: (i, lv) => 1.1 * Math.pow(1.2, i) * lvMul(lv), owned: (i, lv) => 0.015 * Math.pow(1.18, i) * lvMul(lv),
      eqText: (i, lv) => `×${fmt2(EQ.helm.equip(i, lv))} health`, owText: (i, lv) => `+${pct1(EQ.helm.owned(i, lv))} skill damage` },
    boots: { name: 'Boots', one: 'pair of boots', names: ['Flip Flops', 'Socks', 'Sandals', 'Slippers', 'Sneakers', 'Hiking Boots', 'Rain Boots', 'Roller Skates', 'Swift Boots', 'Ninja Tabi', 'Winged Shoes', 'Spring Heels', 'Comet Kicks', 'Storm Treads', 'Phoenix Steps', 'Thunder Greaves', 'Seven-League Boots', 'Moonwalkers', 'Sunrunners', 'Boots of Haste', 'Cosmic Crocs', 'Void Striders', 'Eternity Steps', 'The Fastest Socks'],
      equip: (i, lv) => 1 + 0.02 * i + 0.01 * (lv - 1), owned: (i, lv) => 0.01 * Math.pow(1.15, i) * lvMul(lv),
      eqText: (i, lv) => `×${EQ.boots.equip(i, lv).toFixed(2)} swing speed`, owText: (i, lv) => `+${EQ.boots.owned(i, lv).toFixed(2)}× crit damage` }
  };
  const eqMax = i => 10 + 5 * Math.floor(i / 4);
  const eqLvCost = (i, lv) => Math.ceil((3 + i) * lv * 1.2);
  const SUM_COST = { 1: 5, 11: 50, 35: 150 };
  const sumNeedEq = lv => 20 + (lv - 1) * 20;
  function gradeWeights(L) { L = Math.max(0, L - 1); return [Math.max(5, 55 - 3 * L), 30, 11 + 1.6 * L, 3.5 + 0.9 * L, 0.45 + 0.35 * L, 0.05 + 0.1 * L]; }
  const freshEq = () => Object.fromEntries(CATS.map(k => [k, { c: Array(24).fill(0), l: Array(24).fill(1), s: Array(24).fill(0), st: Array(24).fill(0), on: -1, x: [-1, -1], sl: 1, sx: 0, pity: 0 }]));
  const ENCH_STATS = [
    { id: 'dmg', name: 'Damage', r: [5, 10] }, { id: 'crit', name: 'Crit chance', r: [1, 2.5] }, { id: 'critm', name: 'Crit damage', r: [10, 25] },
    { id: 'gold', name: 'Gold', r: [5, 12] }, { id: 'spd', name: 'Swing speed', r: [3, 7] }, { id: 'tap', name: 'Tap damage', r: [8, 20] },
    { id: 'hp', name: 'Health', r: [6, 14] }, { id: 'skill', name: 'Skill damage', r: [8, 20] }, { id: 'boss', name: 'Boss damage', r: [8, 18] },
    { id: 'leech', name: 'Lifesteal', r: [0.3, 1] }
  ];
  const ENCH_TIERS = [
    { n: 'Common', m: 1, w: 55, c: '#c9cfe0' }, { n: 'Rare', m: 1.8, w: 28, c: '#6fb7ff' }, { n: 'Epic', m: 3, w: 12, c: '#c98bff' },
    { n: 'Legendary', m: 5, w: 4, c: '#f5b942' }, { n: 'Mythic', m: 8, w: 1, c: '#ff5d73' }
  ];
  const RELICS = [
    { id: 'spoon', name: "Grandma's Wooden Spoon", fx: 'gold', v: 0.10, text: '+10% gold' },
    { id: 'rock', name: 'Suspiciously Warm Rock', fx: 'hp', v: 0.10, text: '+10% health' },
    { id: 'sockl', name: 'Sock of Speed (Left)', fx: 'spd', v: 0.05, text: '+5% swing speed' },
    { id: 'sockr', name: 'Sock of Speed (Right)', fx: 'spd', v: 0.05, text: '+5% swing speed' },
    { id: 'tax', name: "Goblin's Tax Return", fx: 'gold', v: 0.15, text: '+15% gold' },
    { id: 'chicken', name: 'Rubber Chicken', fx: 'critm', v: 0.25, text: '+0.25× crit damage' },
    { id: 'bell', name: 'Very Loud Bell', fx: 'hold', v: 0.15, text: 'combo lasts 15% longer' },
    { id: 'gary', name: 'Pet Rock Named Gary', fx: 'pet', v: 0.25, text: '+25% bat bites' },
    { id: 'sandwich', name: 'Cursed Sandwich', fx: 'dmg', v: 0.12, text: '+12% damage (it whispers)' },
    { id: 'tooth', name: 'Mimic Tooth', fx: 'boss', v: 0.20, text: '+20% damage to bosses' },
    { id: 'shroom', name: 'Glowing Mushroom', fx: 'dmg', v: 0.08, text: '+8% damage' },
    { id: 'homework', name: "Dragon's Lost Homework", fx: 'tap', v: 0.20, text: '+20% tap damage' },
    { id: 'jar', name: 'Slime in a Jar', fx: 'regen', v: 0.30, text: '+30% healing' },
    { id: 'map', name: 'Map Drawn in Crayon', fx: 'chest', v: 0.50, text: '+50% chest chance' }
  ];
  const PARTS = [
    { id: 'sword', name: 'Sword Practice', base: 10, r: 1.19, fx: (s, n) => `Hits for ${fmt(s.dmg)} <span class="up">→ ${fmt(n.dmg)}</span>` },
    { id: 'armor', name: 'Armor', base: 12, r: 1.19, fx: (s, n) => `${fmt(s.maxHp)} health <span class="up">→ ${fmt(n.maxHp)}</span>` },
    { id: 'boots', name: 'Boots', base: 30, r: 1.28, fx: (s, n) => `${(1 / s.atkInt).toFixed(2)} swings/s <span class="up">→ ${(1 / n.atkInt).toFixed(2)}</span>` },
    { id: 'ring', name: 'Lucky Ring', base: 50, r: 1.25, fx: (s, n) => `${pct1(s.crit)} crit, ×${s.ringGold.toFixed(2)} gold <span class="up">→ ${pct1(n.crit)}, ×${n.ringGold.toFixed(2)}</span>` },
    { id: 'gaunt', name: 'Gauntlets', base: 15, r: 1.2, fx: (s, n) => `Taps hit for ${fmt(s.tap)} <span class="up">→ ${fmt(n.tap)}</span>` },
    { id: 'torch', name: 'Combo Torch', base: 60, r: 1.4, fx: (s, n) => `Combo up to ×${s.comboMax.toFixed(2)} <span class="up">→ ×${n.comboMax.toFixed(2)}</span>` },
    { id: 'pet', name: 'Pet Bat', base: 120, r: 1.25, fx: (s, n) => s.petRate ? `Bites ${s.petRate.toFixed(1)}/s for you <span class="up">→ ${n.petRate.toFixed(1)}/s</span>` : `Hire a bat that taps for you <span class="up">→ ${n.petRate.toFixed(1)}/s</span>` }
  ];
  const SKILLS = [
    { id: 'spin', short: 'Spin', name: 'Spin Slash', unlock: 3, cd: 8, base: 60, r: 1.45, val: L => 2 + L, fx: L => `Hits every monster on screen for ${2 + L}× damage` },
    { id: 'bolt', short: 'Thunder', name: 'Thunder Poke', unlock: 6, cd: 12, base: 150, r: 1.45, val: L => 8 + 4 * L, fx: L => `Zaps the front monster for ${8 + 4 * L}× damage` },
    { id: 'heal', short: 'Snack', name: 'Snack Break', unlock: 10, cd: 20, base: 600, r: 1.45, val: L => 0.25 + 0.05 * L, fx: L => `Heals ${pct(0.25 + 0.05 * L)} of your health` },
    { id: 'rush', short: 'Fever', name: 'Gold Fever', unlock: 15, cd: 40, base: 3000, r: 1.5, val: L => 2 + 0.25 * L, fx: L => `${(2 + 0.25 * L).toFixed(2)}× gold for 10 seconds` },
    { id: 'frenzy', short: 'Frenzy', name: 'Frenzy', unlock: 20, cd: 30, base: 12000, r: 1.5, val: L => 1.8 + 0.1 * L, fx: L => `${(1.8 + 0.1 * L).toFixed(1)}× swing speed for 8 seconds` },
    { id: 'meteor', short: 'Meteor', name: 'Meteor Shower', unlock: 30, cd: 25, base: 1e5, r: 1.5, val: L => 15 + 5 * L, fx: L => `Rains meteors on every monster for ${15 + 5 * L}× damage` },
    { id: 'stop', short: 'Stop', name: 'Time Out', unlock: 45, cd: 35, base: 2e6, r: 1.55, val: L => 4 + 0.5 * L, fx: L => `Freezes every monster for ${(4 + 0.5 * L).toFixed(1)} seconds` },
    { id: 'clone', short: 'Clone', name: 'Clone Buddy', unlock: 60, cd: 40, base: 5e7, r: 1.6, val: L => 8 + L, fx: L => `A clone doubles your swings for ${8 + L} seconds` }
  ];
  // Central balance knobs. scripts/sim.js plays the game with a bot to check
  // that changes here keep the pace sane (see README, Balance).
  const BAL = {
    knight: 0.12, wizard: 0.3, splash: 0.4, crab: 0.35, allyTier: [1, 1.6, 2.5], allyTierU: [1, 1.4, 1.9],
    bardSpd: 0.02, bardGold: 0.03, racSteal: 0.1, racChest: 0.003, chestCap: 0.2, ringGold: 0.04, torchCap: 2, petRate: 0.02, petHit: 0.5, hpGrowth: 1.55, lvGrowth: 1.04, mile: 1.6, rankDmg: 1.2, bossDrop: 0.35
  };
  const block = L => L ? Math.min(0.6, 0.1 + 0.04 * L) : 0;
  const ALLIES = [
    { id: 'knight', name: 'Sir Intern', unlock: 4, base: 150, r: 1.25, fx: L => `Blocks ${pct(block(L))} of hits and pokes for ${(BAL.knight * L).toFixed(1)}× damage` },
    { id: 'wizard', name: 'Grumpy Wizard', unlock: 8, base: 900, r: 1.27, fx: L => `Fireball every 2.2s for ${(BAL.wizard * L).toFixed(1)}× damage, splashes the rest` },
    { id: 'bard', name: 'Kevin the Bard', unlock: 12, base: 4000, r: 1.29, fx: L => `Plays bangers: +${Math.round(BAL.bardSpd * 100 * L)}% swing speed, +${Math.round(BAL.bardGold * 100 * L)}% gold` },
    { id: 'raccoon', name: 'Raccoon Thief', unlock: 16, base: 15000, r: 1.31, fx: L => `Steals extra gold on 20% of kills (×${(1 + BAL.racSteal * L).toFixed(1)}), +${(BAL.racChest * 100 * L).toFixed(1)}% chest chance` },
    { id: 'frog', name: 'Healer Frog', unlock: 25, base: 6e4, r: 1.33, fx: L => `Heals you for ${(1 + 0.4 * L).toFixed(1)}% health every second` },
    { id: 'crab', name: 'Cannon Crab', unlock: 35, base: 3e5, r: 1.35, fx: L => `Fires a cannonball every 3s that hits everything for ${(BAL.crab * L).toFixed(1)}× damage` }
  ];
  const ALLY_EVO = { knight: ['Sir Intern', 'Sir Manager', 'Sir CEO'], wizard: ['Grumpy Wizard', 'Furious Archwizard', 'Wizard of Pure Rage'], bard: ['Kevin the Bard', 'Kevin the Rockstar', 'Kevin the Legend'], raccoon: ['Raccoon Thief', 'Raccoon Kingpin', 'Raccoon Overlord'], frog: ['Healer Frog', 'Doctor Frog', 'Frog of Miracles'], crab: ['Cannon Crab', 'Artillery Crab', 'Battleship Crab'] };
  const allyTier = id => S.allies[id] >= 25 ? 2 : S.allies[id] >= 10 ? 1 : 0;
  const allyName = a => ALLY_EVO[a.id][allyTier(a.id)];
  const allyMul = id => BAL.allyTier[allyTier(id)];
  const allyMulU = id => BAL.allyTierU[allyTier(id)];
  const BANTER = ['Is it lunch yet?', 'I parked the cart outside.', 'That slime looked at me funny.', 'Ten more floors and I retire too.', 'Who keeps leaving bananas here?', 'My feet hurt.', 'Do monsters pay taxes?', 'I heard the boss is nice, actually.', 'Has anyone seen my other sock?', 'This dungeon needs better lighting.', 'I could do this all day. Please do not make me.', 'Gold! Shiny gold!', 'We are a team. A weird team.', 'Next time I pick the music.']
  const ALLY_BLURB = { frog: 'Heals you every second', crab: 'Shoots cannonballs that hit every monster', knight: 'Blocks hits for you and pokes things', wizard: 'Throws fireballs that splash every monster', bard: 'Makes you swing faster and earn more gold', raccoon: 'Steals bonus gold and sniffs out chests' };
  const CLASSES = {
    peasant: { name: 'Peasant', text: 'No bonus. Just vibes.', tunic: '#9a8a6a' },
    knight: { name: 'Knight', text: '+30% health and take 15% less damage', tunic: '#4f7bd1' },
    rogue: { name: 'Rogue', text: '+10% crit chance and +25% gold', tunic: '#3c8a5a' },
    mage: { name: 'Mage', text: 'Skills recharge 25% faster and hit 50% harder', tunic: '#8a4fd1' },
    berserker: { name: 'Berserker', text: '+40% damage, but 20% less health', tunic: '#d1495b' },
    monk: { name: 'Monk', text: 'Taps hit 60% harder, +20 combo cap, combo lasts longer', tunic: '#e08a2c' },
    necro: { name: 'Necromancer', text: 'Pets hit twice as hard', tunic: '#3b5c4a' },
    minstrel: { name: 'Minstrel', text: 'Allies hit twice as hard, +10% gold', tunic: '#c0577f' }
  };
  const CLASS_EVO = {
    peasant: { names: ['Peasant', 'Farmhand', 'Folk Hero', 'Living Legend'], text: t => ['No bonus. Just vibes.', '+15% damage, health and gold', '+35% damage, health and gold', '+70% damage, health and gold'][t] },
    knight: { names: ['Knight', 'Paladin', 'Holy Bulwark', 'Eternal Aegis'], text: t => `+${[30, 60, 100, 170][t]}% health, take ${[15, 25, 35, 45][t]}% less damage${t >= 2 ? ', double healing' : ''}` },
    rogue: { names: ['Rogue', 'Assassin', 'Shadow Lord', 'Nightmare'], text: t => `+${[10, 15, 20, 25][t]}% crit chance, +${[25, 50, 100, 180][t]}% gold${t >= 2 ? `, +${t - 1}× crit damage` : ''}` },
    mage: { names: ['Mage', 'Archmage', 'Time Wizard', 'Reality Bender'], text: t => `Skills recharge ${[25, 35, 45, 55][t]}% faster and hit ${[50, 120, 200, 350][t]}% harder` },
    berserker: { names: ['Berserker', 'Warlord', 'Rage Incarnate', 'Apocalypse'], text: t => `+${[40, 80, 140, 250][t]}% damage, ${[20, 15, 10, 5][t]}% less health` },
    monk: { names: ['Monk', 'Grandmaster', 'Enlightened Fist', 'Ascended Fist'], text: t => `Taps hit ${[60, 120, 200, 350][t]}% harder, +${[20, 40, 60, 90][t]} combo cap, combo lasts longer` },
    necro: { names: ['Necromancer', 'Bone Caller', 'Lich Lord', 'Master of Pets'], text: t => `Pets hit ${[2, 3, 4.5, 7][t]}× as hard, owned pet bonuses +${[0, 50, 100, 200][t]}%` },
    minstrel: { names: ['Minstrel', 'Troubadour', 'Rock God', 'Song of Creation'], text: t => `Allies hit ${[2, 3, 4.5, 7][t]}× as hard, +${[10, 20, 35, 60][t]}% gold` }
  };
  const EVO_REQ = [null, { deep: 40, rank: 5, gems: 60, runes: 60 }, { deep: 100, rank: 8, gems: 200, runes: 200 }, { deep: 200, rank: 11, gems: 500, runes: 500 }];
  const clsTier = c => (S.evo && S.evo[c || S.cls]) || 0;
  const clsName = c => brName(c || S.cls, clsTier(c));
  const clsText = c => { c = c || S.cls; const T = clsTier(c), P = pathOf(c); return CLASS_EVO[c].text(T) + (T ? ' · ' + [...Array(T)].map((_, k) => brPerkText(c, k + 1, P[k] || 'A')).join(' · ') : ''); };
  const PEVO_AT = [100, 250, 500, 1000];
  const PART_NAMES = {
    sword: ['Sword Practice', 'Sword Mastery', 'Blade Saint', 'Edge of Forever', 'Cosmic Cutlery'],
    armor: ['Armor', 'Plate Armor', 'Dragonscale', 'Fortress Shell', 'Living Mountain'],
    boots: ['Boots', 'Running Shoes', 'Wind Striders', 'Lightning Treads', 'Teleport Socks'],
    ring: ['Lucky Ring', 'Clover Ring', 'Fortune Band', 'Jackpot Loop', 'Ring of Infinite Luck'],
    gaunt: ['Gauntlets', 'Brass Knuckles', 'Titan Fists', 'Meteor Mitts', 'Big Bang Gloves'],
    torch: ['Combo Torch', 'Combo Lantern', 'Combo Bonfire', 'Combo Sun', 'Combo Supernova'],
    pet: ['Pet Bat', 'Vampire Bat', 'Bat Swarm', 'Bat Kaiju', 'Bat God']
  };
  const PEVO_FX = { sword: '×3 damage', armor: '×3 health', boots: '+25% swing speed', ring: '+5% crit, ×1.5 gold', gaunt: '×2 tap damage', torch: '+20 combo cap', pet: '×1.5 bites' };
  const ptier = id => (S.pevo && S.pevo[id]) || 0;
  const pcap = id => ptier(id) < PEVO_AT.length ? PEVO_AT[ptier(id)] : Infinity;
  const RANKS = [
    { n: 'Rookie', need: 0 }, { n: 'Copper', need: 5 }, { n: 'Bronze', need: 10 }, { n: 'Iron', need: 15 }, { n: 'Steel', need: 20 }, { n: 'Silver', need: 30 },
    { n: 'Gold', need: 40 }, { n: 'Platinum', need: 55 }, { n: 'Mythril', need: 70 }, { n: 'Adamant', need: 90 }, { n: 'Starforged', need: 110 }, { n: 'Cosmic', need: 135 }, { n: 'Legend', need: 165 }
  ];
  const DUNGEONS = [
    { id: 'vault', name: 'Gold Vault', kind: 'mimic', tint: '#f5b942', cur: 'gold', text: 'A greedy mimic full of gold. Every bar you break pays a pile of gold.' },
    { id: 'mine', name: 'Rune Mine', kind: 'golem', tint: '#6fd6ff', cur: 'runes', text: 'A rune golem. Every bar you break drops runes for enchants and reforging.' },
    { id: 'forge', name: 'Shard Forge', kind: 'robot', tint: '#ff9a5a', cur: 'shards', text: 'A haywire forge robot. Every bar you break drops shards for weapon enhancing.' },
    { id: 'grotto', name: 'Gem Grotto', kind: 'eyeball', tint: '#b98cff', cur: 'gems', text: 'A crystal eye that cries gems. One gem for every 3 bars. Only 1 key, and it refills every 4 hours.' }
  ];
  const keyMax = id => id === 'grotto' ? 1 : 3;
  const GROTTO_MS = 4 * 3600 * 1000;
  const KEY_MS = 20 * 60 * 1000;
  const QT = {
    kill: { text: n => `Defeat ${n} monsters`, n: () => 40, gems: 3 },
    boss: { text: n => `Beat ${n} bosses`, n: () => 2, gems: 4 },
    chest: { text: n => `Open ${n} chests`, n: () => 2, gems: 4 },
    combo: { text: n => `Reach a ${n} combo`, n: () => 25 + 5 * randi(0, 5), gems: 3, max: true },
    skill: { text: n => `Cast ${n} skills`, n: () => 15, gems: 3, need: () => S.maxFloor >= 3 },
    elite: { text: n => `Defeat ${n} shiny monster${n > 1 ? 's' : ''}`, n: () => randi(1, 2), gems: 5 },
    variant: { text: n => `Defeat ${n} special monsters (giant, armored and so on)`, n: () => 15, gems: 3 },
    taps: { text: n => `Tap ${n} times`, n: () => 250, gems: 2 },
    gold: { text: n => `Earn ${fmt(n)} gold`, n: () => Math.ceil(400 * goldM(S.floor)), gems: 3 },
    goblin: { text: () => 'Catch a treasure goblin', n: () => 1, gems: 6 },
    summon: { text: n => `Summon ${n} pieces of equipment`, n: () => 11, gems: 4, need: () => S.gems >= 50 },
    dungeon: { text: n => `Run ${n} side dungeon${n > 1 ? 's' : ''}`, n: () => 1, gems: 4, need: () => S.deepest >= 5 },
    ench: { text: n => `Reroll enchants ${n} times`, n: () => 3, gems: 3, need: () => S.runes >= 10 }
  };
  const GEMSHOP = [
    { id: 'party', icon: 'potion', name: 'Party Potion', cost: 8, text: '20 seconds of Gold Fever and Frenzy at once' },
    { id: 'warp', icon: 'hourglass', name: 'Time Warp', cost: 15, text: 'Get 30 minutes of gold right now' },
    { id: 'rpouch', icon: 'pouch', pal: 'runepouch', name: 'Rune Pouch', cost: 6, text: '+25 runes' },
    { id: 'spouch', icon: 'pouch', pal: 'shardpouch', name: 'Shard Pouch', cost: 6, text: '+30 shards' },
    { id: 'keys', icon: 'box', pal: 'box10', name: 'Dungeon Key Ring', cost: 12, text: 'Refill every dungeon key' },
    { id: 'rbox', icon: 'relicbox', name: 'Relic Box', cost: 25, text: 'One random relic' }
  ];
  const ACHS = [
    ['f10', 'Going Down', 'Reach floor 10', () => S.deepest >= 10],
    ['f25', 'Basement Dweller', 'Reach floor 25', () => S.deepest >= 25],
    ['f50', 'Mole Person', 'Reach floor 50', () => S.deepest >= 50],
    ['f100', 'Center of the Earth', 'Reach floor 100', () => S.deepest >= 100],
    ['f200', 'Other Side of the Earth', 'Reach floor 200', () => S.deepest >= 200],
    ['c50', 'Button Masher', 'Reach a 50 combo', () => S.life.bestCombo >= 50],
    ['c100', 'Finger Workout', 'Reach a 100 combo', () => S.life.bestCombo >= 100],
    ['c200', 'Carpal Tunnel', 'Reach a 200 combo', () => S.life.bestCombo >= 200],
    ['leg', 'Shiny Stick', 'Get a Legendary piece of equipment', () => S.life.legendaries >= 1],
    ['myth1', 'Mythic Pull', 'Get a Mythic piece of equipment', () => S.life.mythics >= 1],
    ['merge50', 'Merge Master', 'Merge equipment 50 times', () => S.life.merges >= 50],
    ['b96', 'Hoarder Supreme', 'Discover all 144 pieces of equipment', () => bookCount() >= 144],
    ['r5', 'Hoarder', 'Find 5 different relics', () => relicKinds() >= 5],
    ['r14', 'Museum Curator', 'Find every relic', () => relicKinds() >= RELICS.length],
    ['ret1', 'Happy Retirement', 'Retire once', () => S.runs >= 1],
    ['ret5', 'Serial Retiree', 'Retire 5 times', () => S.runs >= 5],
    ['ally', 'Party of Five', 'Hire all four allies', () => ALLIES.every(a => S.allies[a.id] > 0)],
    ['g1m', 'Millionaire', 'Earn 1M gold in total', () => S.life.goldEarned >= 1e6],
    ['g1b', 'Dragon Hoard', 'Earn 1B gold in total', () => S.life.goldEarned >= 1e9],
    ['g1t', 'Economy Breaker', 'Earn 1T gold in total', () => S.life.goldEarned >= 1e12],
    ['ch25', 'Chest Hunter', 'Open 25 chests', () => S.life.chests >= 25],
    ['gob5', 'Goblin Catcher', 'Catch 5 treasure goblins', () => S.life.goblins >= 5],
    ['el10', 'Shiny Hunter', 'Defeat 10 shiny monsters', () => S.life.elites >= 10],
    ['var100', 'Variety Pack', 'Defeat 100 special monsters', () => S.life.variants >= 100],
    ['k1k', 'Exterminator', 'Defeat 1,000 monsters', () => S.life.kills >= 1000],
    ['k10k', 'Dungeon Janitor', 'Defeat 10,000 monsters', () => S.life.kills >= 10000],
    ['b24', 'Collector', 'Discover 24 pieces of equipment', () => bookCount() >= 24],
    ['b48', 'Completionist', 'Discover 48 pieces of equipment', () => bookCount() >= 48],
    ['beast12', 'Zookeeper', 'Master 12 monster types', () => beastsMastered() >= 12],
    ['q10', 'Busy Bee', 'Claim 10 quests', () => S.life.quests >= 10],
    ['dead10', 'Professional Napper', 'Faint 10 times', () => S.life.deaths >= 10],
    ['rank3', 'Promoted', 'Reach Iron rank', () => S.rank >= 3],
    ['rank8', 'Top Brass', 'Reach Mythril rank', () => S.rank >= 8],
    ['dung10', 'Dungeon Regular', 'Finish 10 side dungeons', () => S.life.dungeons >= 10],
    ['myth', 'Mythic Touch', 'Roll a Mythic enchant', () => S.life.mythic >= 1],
    ['wlv10', 'Plus Ten', 'Enhance your weapon to +10', () => S.wlv >= 10],
    ['daily7', 'Creature of Habit', 'Open the daily chest 7 days in a row', () => S.daily.streak >= 7],
    ['daily30', 'Very Committed', 'Open the daily chest 30 days in a row', () => S.daily.streak >= 30],
    ['abyss10', 'Into the Abyss', 'Reach depth 10 in the Endless Abyss', () => S.abyssBest >= 10],
    ['abyss30', 'Abyss Walker', 'Reach depth 30 in the Endless Abyss', () => S.abyssBest >= 30],
    ['rush10', 'Boss Rush Champion', 'Beat all 10 bosses in a Boss Rush', () => S.rushBest >= 10],
    ['ascend1', 'Starborn', 'Ascend once', () => S.stars >= 1],
    ['ally6', 'Full House', 'Hire all six allies', () => ALLIES.every(a => S.allies[a.id] > 0)],
    ['allyevo', 'Promoted Again', 'Evolve an ally to its final form', () => ALLIES.some(a => allyTier(a.id) >= 2)],
    ['exped5', 'Travel Agent', 'Finish 5 expeditions', () => S.life.expeds >= 5],
    ['pets3', 'Pet Parade', 'Have 3 pets out at once', () => S.eq.pet.on >= 0 && S.eq.pet.x.every(v => v >= 0)],
    ['star5', 'Five Stars', 'Awaken any piece to 5 stars', () => CATS.some(k => S.eq[k].st.some(v => v >= 5))],
    ['fullset', 'Dressed to Kill', 'Wear a full 5-piece set', () => setInfo().n === 5],
    ['parry10', 'Not Today', 'Parry 10 boss smashes', () => S.life.parries >= 10],
    ['rare1', 'Rare Sighting', 'Defeat a rare wandering monster', () => S.life.rares >= 1],
    ['guard1', 'Guardian Slayer', 'Defeat a floor guardian', () => S.life.guardians >= 1],
    ['ult10', 'Ultimate Power', 'Use your ultimate 10 times', () => S.life.ults >= 10],
    ['evo4', 'Final Form', 'Evolve a class to its fourth form', () => Object.values(S.evo).some(v => v >= 3)],
    ['lore', 'Monster Scholar', 'Meet every monster type', () => KINDS.every(k => S.life.beasts[k])],
    ['skill18', 'Spellbook', 'Own all 18 summoned skills', () => SKILLS.filter(s => s.gacha !== undefined).every(s => S.skOwn[s.id])],
    ['myskill', 'Forbidden Knowledge', 'Own a Mythic skill', () => SKILLS.some(s => s.gacha === 5 && S.skOwn[s.id])],
    ['gem10', 'Jeweler', 'Socket a level 10 gem', () => (S.sock || []).some(g => g && g.lv >= 10)],
    ['branch', 'Choose Your Path', 'Pick a path B evolution', () => Object.values(S.evoPath || {}).some(p => p.includes('B'))],
    ['talent15', 'Talented', 'Spend 15 talent points', () => Object.values(S.tal || {}).reduce((a, b) => a + b, 0) >= 15],
    ['chal1', 'Challenger', 'Win a challenge', () => Object.keys(S.chDone || {}).length >= 1],
    ['chal5', 'Masochist', 'Win all five challenges', () => Object.keys(S.chDone || {}).length >= 5],
    ['camp', 'Happy Camper', 'Get both camp buildings to level 10', () => S.camp && S.camp.mine >= 10 && S.camp.garden >= 10],
    ['pass30', 'Season Finisher', 'Reach tier 30 of a monthly pass', () => S.pass && S.pass.xp >= 9000],
    ['fishm', 'The One That Got Away', 'Catch a Mythic Whale', () => S.life.whale >= 1],
    ['heir', 'Family Heirloom', 'Choose an heirloom', () => !!S.heir],
    ['look', 'Fashionista', 'Wear a hat and a cape', () => S.cos && S.cos.hat !== 'none' && S.cos.cape !== 'none']
  ];

  /* ================= save ================= */
  const KEY = 'coincrawl.v1';
  const freshLv = () => ({ sword: 0, armor: 0, boots: 0, ring: 0, gaunt: 0, torch: 0, pet: 0 });
  const freshSk = () => ({ spin: 1, bolt: 1, heal: 1, rush: 1, frenzy: 1, meteor: 1, stop: 1, clone: 1 });
  const freshAllies = () => ({ knight: 0, wizard: 0, bard: 0, raccoon: 0, frog: 0, crab: 0 });
  const freshLife = () => ({ parries: 0, rares: 0, guardians: 0, ults: 0, expeds: 0, ascends: 0, fastBoss: 0, bestDps: 0, bestPull: -1, first: {}, merges: 0, summons: 0, mythics: 0, kills: 0, bosses: 0, chests: 0, taps: 0, bestCombo: 0, goldEarned: 0, skills: 0, time: 0, goblins: 0, elites: 0, variants: 0, deaths: 0, legendaries: 0, quests: 0, dungeons: 0, enchants: 0, mythic: 0, trials: 0, beasts: {} });
  const freshSet = () => ({ cloudauto: true, numfmt: 'short', shake: true, nums: true, autobuy: false, autoclaim: false, autoboss: false, particles: true, skip: true, pin: true, autoeq: true, vol: 0.7, music: true, reserve: 0, compact: false, cb: false, autolevel: false, autosummon: false, autodungeon: false, autoretire: false, tips: true, banter: true });
  const fresh = () => ({
    gold: 0, gems: 0, runes: 0, shards: 0, floor: 1, kill: 0, maxFloor: 1, deepest: 1, tales: 0, runs: 0, cls: 'peasant', rank: 0,
    lv: freshLv(), sk: freshSk(), allies: freshAllies(), weapon: null, wlv: 0, ench: [null, null, null], locks: [false, false, false],
    relics: {}, book: {}, ach: {}, life: freshLife(), quests: [], keys: { vault: 3, mine: 3, forge: 3, grotto: 1 }, keyT: Date.now(),
    summon: { lv: 1, xp: 0 }, daily: { last: '', streak: 0 }, set: freshSet(),
    amt: '1', auto: true, farm: false, bossReady: false, evo: {}, pevo: {}, eq: freshEq(), prefix: { pre: 'Plain', pm: 1 }, tab: 'train', gps: 0, lastSeen: 0, muted: false, dev: false,
    evMonth: 0, evoPath: {}, tal: {}, chal: null, chDone: {}, lshop: {}, ltok: 0, heir: null, camp: null, pass: null, maps: 0, fish: null, dailyCh: null, skOwn: {}, skCp: {}, skLv: {}, evTok: 0, sock: [null, null, null, null], gemInv: {}, look: { weapon: -1 }, cos: { hat: 'none', cape: 'none' }, cosOwn: {}, stars: 0, abyssBest: 0, rushBest: 0, abyssT: 0, rushT: 0, grottoT: Date.now(), exped: null, loadout: ['spin', 'bolt', 'heal', 'rush', 'frenzy'], weekly: null, unl: {}, tutQ: [], lab: {}, labJobs: [], mileDone: 0, seenVer: 0, eqSel: { weapon: 0, armor: 0, acc: 0, pet: 0 }, eqCat: 'weapon'
  });
  function migrate(o) {
    const s = Object.assign(fresh(), o);
    s.lv = Object.assign(freshLv(), o.lv || {}); s.sk = Object.assign(freshSk(), o.sk || {});
    s.allies = Object.assign(freshAllies(), o.allies || {}); s.life = Object.assign(freshLife(), o.life || {});
    s.life.beasts = s.life.beasts || {}; s.relics = o.relics || {}; s.book = o.book || {}; s.ach = o.ach || {};
    s.set = Object.assign(freshSet(), o.set || {}); s.keys = Object.assign({ vault: 3, mine: 3, forge: 3, grotto: 1 }, o.keys || {}); s.life.first = s.life.first || {};
    s.eqSel = Object.assign({ weapon: 0, armor: 0, acc: 0, pet: 0 }, o.eqSel || {}); if (!Array.isArray(s.loadout) || s.loadout.length !== 5) s.loadout = ['spin', 'bolt', 'heal', 'rush', 'frenzy'];
    s.summon = Object.assign({ lv: 1, xp: 0 }, o.summon || {}); s.daily = Object.assign({ last: '', streak: 0 }, o.daily || {});
    s.ench = Array.isArray(o.ench) && o.ench.length === 3 ? o.ench : [null, null, null];
    s.locks = Array.isArray(o.locks) && o.locks.length === 3 ? o.locks : [false, false, false];
    s.quests = Array.isArray(o.quests) ? o.quests.filter(q => q && QT[q.type]) : [];
    if (!CLASSES[s.cls]) s.cls = 'peasant';
    s.evo = o.evo || {}; s.pevo = o.pevo || {};
    s.eq = freshEq();
    if (o.eq) { for (const k of CATS) if (o.eq[k]) Object.assign(s.eq[k], o.eq[k]); }
    else {
      const Wq = s.eq.weapon, map = [0, 2, 3, 4];
      for (const key of Object.keys(o.book || {})) { const [base, r] = key.split('|'); const i = Math.min(23, map[+r] * 4 + Math.max(0, WBASE.indexOf(base)) % 4); Wq.c[i]++; Wq.s[i] = 1; }
      if (o.weapon && o.weapon.rar !== undefined) { const i = map[o.weapon.rar] * 4 + 3; Wq.c[i]++; Wq.s[i] = 1; }
      Wq.on = Wq.s.lastIndexOf(1);
      if (o.summon && o.summon.lv) Wq.sl = o.summon.lv;
    }
    s.prefix = o.prefix || (o.weapon && o.weapon.pm ? { pre: o.weapon.pre || 'Plain', pm: o.weapon.pm } : { pre: 'Plain', pm: 1 });
    s.book = {}; s.weapon = null;
    if (s.tab === 'gear') s.tab = 'train';
    if (!Array.isArray(s.sock) || s.sock.length !== 4) s.sock = [null, null, null, null]; s.gemInv = s.gemInv || {}; s.look = Object.assign({ weapon: -1 }, s.look || {}); s.cos = Object.assign({ hat: 'none', cape: 'none' }, s.cos || {}); s.cosOwn = s.cosOwn || {}; s.skOwn = s.skOwn || {}; s.skCp = s.skCp || {}; s.skLv = s.skLv || {}; s.evoPath = s.evoPath || {}; s.tal = s.tal || {}; s.chDone = s.chDone || {}; s.lshop = s.lshop || {}; s.unl = s.unl || {}; s.lab = s.lab || {}; s.labJobs = Array.isArray(s.labJobs) ? s.labJobs : []; s.tutQ = Array.isArray(s.tutQ) ? s.tutQ : [];
    for (const k of CATS) {
      const E = s.eq[k], arr = (v, d) => Array.isArray(v) && v.length === 24 ? v.map(x => (typeof x === 'number' && isFinite(x) && x >= 0 ? x : d)) : Array(24).fill(d);
      E.c = arr(E.c, 0); E.l = arr(E.l, 1); E.s = arr(E.s, 0); E.st = arr(E.st, 0);
      if (!Array.isArray(E.x) || E.x.length !== 2) E.x = [-1, -1];
      for (const v of ['on', 'sl', 'sx', 'pity']) if (typeof E[v] !== 'number' || !isFinite(E[v])) E[v] = v === 'on' ? -1 : v === 'sl' ? 1 : 0;
      E.on = Math.max(-1, Math.min(23, Math.floor(E.on)));
    }
    if (!s.set || typeof s.set !== 'object') s.set = freshSet();
    if (!s.keys || typeof s.keys !== 'object') s.keys = { vault: 3, mine: 3, forge: 3, grotto: 1 };
    s.labJobs = (Array.isArray(s.labJobs) ? s.labJobs : []).filter(j => j && typeof j.k === 'string' && isFinite(j.end));
    if (s.weapon && !s.weapon.pm) { s.weapon.pm = 1; s.weapon.pre = s.weapon.name.split(' ')[0]; }
    return s;
  }
  // Numbers in a save must be finite: NaN or Infinity would spread into every
  // stat. Bad values become 0 (or a huge cap for overflowing currencies).
  const NUMS = ['gold', 'gems', 'runes', 'shards', 'floor', 'kill', 'maxFloor', 'deepest', 'tales', 'runs', 'rank', 'wlv', 'stars', 'abyssBest', 'rushBest', 'ltok', 'maps', 'evTok', 'mileDone', 'gps', 'keyT', 'grottoT', 'abyssT', 'rushT'];
  function sane(o) {
    for (const k of NUMS) { const v = o[k]; if (typeof v !== 'number' || Number.isNaN(v)) o[k] = 0; else if (!isFinite(v)) o[k] = v > 0 ? 1e300 : 0; }
    for (const k of ['floor', 'maxFloor', 'deepest']) o[k] = Math.max(1, Math.floor(o[k]));
    for (const box of [o.lv, o.sk, o.allies, o.skLv, o.lab, o.tal]) if (box) for (const k in box) { const v = box[k]; if (typeof v !== 'number' || !isFinite(v) || v < 0) box[k] = 0; }
    if (o.life) for (const k in o.life) if (typeof o.life[k] === 'number' && !isFinite(o.life[k])) o.life[k] = 0;
    return o;
  }
  S = fresh();
  let loadErr = '';
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try { S = sane(migrate(JSON.parse(raw))); }
      catch (e) {
        // Keep the broken save aside instead of overwriting it, then fall back to the backup.
        loadErr = 'Your save could not be read, so the last backup was loaded.';
        try { localStorage.setItem(KEY + '.broken', raw); } catch (e2) {}
        try { const bak = localStorage.getItem(KEY + '.bak'); S = bak ? sane(migrate(JSON.parse(bak))) : fresh(); } catch (e3) { S = fresh(); loadErr = 'Your save could not be read and there was no backup, so a new game started. The old save is kept under coincrawl.v1.broken.'; }
      }
    }
  } catch (e) {}
  let bakT = 0;
  function save() {
    S.lastSeen = Date.now();
    try {
      for (const k of ['gold', 'gems', 'runes', 'shards']) if (!isFinite(S[k])) S[k] = Number.isNaN(S[k]) ? 0 : 1e300;
      const json = JSON.stringify(S);
      localStorage.setItem(KEY, json);
      if (Date.now() - bakT > 60000) { bakT = Date.now(); localStorage.setItem(KEY + '.bak', json); }
    } catch (e) {}
  }

  /* ================= balance + stats ================= */
  const hpM = f => 16 * Math.pow(BAL.hpGrowth, f - 1);
  const dmgM = f => 2 * Math.pow(1.28, f - 1);
  const goldM = f => 2.5 * Math.pow(1.22, f - 1);
  const relicKinds = () => RELICS.filter(r => S.relics[r.id]).length;
  const bookCount = () => CATS.reduce((a, k) => a + S.eq[k].s.reduce((x, y) => x + (y ? 1 : 0), 0), 0);
  const fmt2 = v => v < 100 ? v.toFixed(2) : fmt(v);
  const starMul = (E, i) => 1 + 0.25 * (E.st[i] || 0);
  function ownedSum(cat) { const E = S.eq[cat], D = EQ[cat]; let v = 0; for (let i = 0; i < 24; i++) if (E.s[i]) v += D.owned(i, E.l[i]) * starMul(E, i); return v; }
  function setInfo() {
    const g = ['weapon', 'armor', 'helm', 'boots', 'acc'].map(k => S.eq[k] && S.eq[k].on >= 0 ? Math.floor(S.eq[k].on / 4) : -1).filter(x => x >= 0);
    let best = { n: 0, g: -1, mul: 1 };
    for (let k = 0; k < 6; k++) { const n = g.filter(x => x >= k).length; if (n >= 2) { const mul = 1 + 0.04 * (k + 1) * (n - 1); if (mul > best.mul) best = { n, g: k, mul }; } }
    return best;
  }
  const eqOn = cat => S.eq[cat].on;
  const eqEquip = cat => { const E = S.eq[cat]; return E.on >= 0 ? EQ[cat].equip(E.on, E.l[E.on]) * starMul(E, E.on) : (cat === 'pet' ? 0 : 1); };
  const petPower = i => i >= 0 ? EQ.pet.equip(i, S.eq.pet.l[i]) * starMul(S.eq.pet, i) : 0;
  const achCount = () => Object.keys(S.ach).length;
  const beastsMastered = () => KINDS.filter(k => (S.life.beasts[k] || 0) >= 100).length;
  const enchLines = () => 1 + (S.deepest >= 15 ? 1 : 0) + (S.deepest >= 30 ? 1 : 0);
  function rel(fx) { let m = 1; for (const r of RELICS) if (r.fx === fx && S.relics[r.id]) m += r.v * S.relics[r.id]; return m; }
  function ench(id) { let v = 0; S.ench.forEach((e, i) => { if (e && i < enchLines() && e.s === id) v += e.v; }); return v / 100; }
  const effAllies = () => { if (S.chal === 'noally') return freshAllies(); if (!S.exped || !S.exped.id) return S.allies; const a = Object.assign({}, S.allies); a[S.exped.id] = 0; return a; };
  function stats(lv, al) {
    al = al || effAllies();
    const C = S.cls, T = clsTier(C), rk = S.rank, star = Math.pow(1.5, S.stars || 0);
    const tale = 1 + 0.1 * S.tales;
    const setM = setInfo().mul;
    const PP = pathPerks(), CH = k => S.chDone && S.chDone[k];
    const necroOwn = C === 'necro' ? [1, 1.5, 2, 3][T] : 1;
    const wpn = eqEquip('weapon') * (S.prefix.pm || 1) * (1 + 0.12 * S.wlv) * (1 + ownedSum('weapon') + ownedSum('pet') * necroOwn);
    const perm = (1 + 0.03 * achCount()) * (1 + 0.01 * bookCount()) * Math.pow(BAL.rankDmg, rk) * star * setM;
    const mile = L => Math.pow(BAL.mile, Math.floor(L / 25));
    const pe = id => ptier(id);
    const folk = C === 'peasant' ? [1, 1.15, 1.35, 1.7][T] : 1;
    const cDmg = (C === 'berserker' ? [1.4, 1.8, 2.4, 3.5][T] : 1) * folk;
    const cHp = (C === 'knight' ? [1.3, 1.6, 2.0, 2.7][T] : C === 'berserker' ? [0.8, 0.85, 0.9, 0.95][T] : 1) * folk;
    const dmg = (1 + labV('whet')) * (1 + gem('ruby')) * 3 * (1 + 0.6 * lv.sword) * Math.pow(BAL.lvGrowth, lv.sword) * mile(lv.sword) * Math.pow(3, pe('sword')) * tale * rel('dmg') * wpn * perm * cDmg * (1 + ench('dmg')) * PP.dmg * (1 + 0.08 * tal('p1')) * (CH('noally') ? 1.15 : 1);
    const maxHp = 30 * (1 + labV('mail')) * (1 + 0.5 * lv.armor) * Math.pow(BAL.lvGrowth, lv.armor) * mile(lv.armor) * Math.pow(3, pe('armor')) * rel('hp') * Math.pow(BAL.rankDmg, rk) * star * setM * cHp * PP.hp * (1 + 0.1 * tal('t4')) * (S.chal === 'glass' ? 0.2 : 1) * (1 + ench('hp')) * eqEquip('armor') * (1 + ownedSum('armor')) * eqEquip('helm') * (1 + gem('sapphire'));
    const combo = 20 + labV('rhythm') + BAL.torchCap * lv.torch + 20 * pe('torch') + (C === 'monk' ? [20, 40, 60, 90][T] : 0);
    const rawCrit = Math.min(0.6, 0.05 + 0.02 * lv.ring) + 0.05 * pe('ring') + (C === 'rogue' ? [0.1, 0.15, 0.2, 0.25][T] : 0) + ench('crit') + (eqOn('acc') >= 0 ? EQ.acc.crit(eqOn('acc')) : 0);
    const bardU = al.bard * allyMulU('bard') * (C === 'minstrel' ? [2, 3, 4.5, 7][T] : 1);
    return {
      dmg, maxHp,
      regen: (maxHp * 0.02 + 0.5 * lv.armor) * rel('regen') * (C === 'knight' && T >= 2 ? 2 : 1),
      atkInt: Math.max(0.1, 1 / Math.min(12, (1 + 0.08 * lv.boots) * (1 + 0.25 * pe('boots')) * rel('spd') * (1 + BAL.bardSpd * bardU) * (1 + ench('spd')) * eqEquip('boots') * (1 + 0.04 * tal('t1')) * (CH('speed') ? 1.1 : 1))),
      crit: Math.min(0.9, rawCrit < 0.6 ? rawCrit : 0.6 + (rawCrit - 0.6) * 0.5),
      critMult: 2 * rel('critm') + ench('critm') + (C === 'rogue' && T >= 2 ? T - 1 : 0) + ownedSum('boots') + gem('topaz') + 0.15 * tal('p2') + (CH('glass') ? 0.5 : 0),
      ringGold: (1 + BAL.ringGold * lv.ring) * Math.pow(1.5, pe('ring')),
      goldMult: (1 + labV('greed')) * (1 + BAL.ringGold * lv.ring) * Math.pow(1.5, pe('ring')) * tale * rel('gold') * (C === 'rogue' ? [1.25, 1.5, 2, 2.8][T] : 1) * (C === 'minstrel' ? [1.1, 1.2, 1.35, 1.6][T] : 1) * folk * (1 + BAL.bardGold * bardU) * (1 + 0.05 * beastsMastered()) * Math.pow(1.1, rk) * star * setM * (1 + ench('gold')) * eqEquip('acc') * (1 + ownedSum('acc')) * (1 + gem('emerald')) * PP.gold * (1 + 0.08 * tal('f1')) * (CH('broke') ? 1.25 : 1) * (S.chal === 'broke' ? 0.3 : 1),
      tap: dmg * (0.4 + 0.02 * lv.gaunt) * Math.pow(2, pe('gaunt')) * rel('tap') * PP.tap * (CH('taponly') ? 1.5 : 1) * (C === 'monk' ? [1.6, 2.2, 3, 4.5][T] : 1) * (1 + ench('tap')),
      comboCap: combo,
      comboMax: 1 + 0.025 * combo,
      hold: (0.8 + 0.1 * lv.torch) * (1 + 0.1 * tal('t3')) * rel('hold') * (C === 'monk' ? [1.3, 1.5, 1.8, 2.2][T] : 1),
      petRate: lv.pet ? (1 + BAL.petRate * lv.pet) * rel('pet') * Math.pow(1.5, pe('pet')) : 0,
      boss: rel('boss') + labV('anat') + ench('boss') + gem('onyx') + 0.1 * tal('p3'),
      chest: Math.min(BAL.chestCap, 0.05 * rel('chest') + BAL.racChest * al.raccoon + 0.01 * tal('f2')),
      taken: (1 - block(al.knight)) * (C === 'knight' ? [0.85, 0.75, 0.65, 0.55][T] : 1),
      skillMult: (C === 'mage' ? [1.5, 2.2, 3, 4.5][T] : 1) * (1 + ench('skill')) * (1 + ownedSum('helm')) * (1 + gem('amethyst')) * (1 + 0.15 * tal('p4')),
      cdMult: (C === 'mage' ? [0.75, 0.65, 0.55, 0.45][T] : 1) * PP.cd * (1 - 0.04 * tal('t2')),
      leech: Math.min(0.06, ench('leech') + PP.leech),
      petHit: dmg * PP.pet * (C === 'necro' ? [2, 3, 4.5, 7][T] : 1),
      allyMult: (C === 'minstrel' ? [2, 3, 4.5, 7][T] : 1) * PP.ally,
      al
    };
  }
  let st = null;
  const recalc = () => { st = stats(S.lv); };

  /* ================= sound ================= */
  let AC = null;
  function audio() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  let activeTones = 0;
  function tone(f1, f2, d, type = 'square', vol = 0.04, delay = 0) {
    if (S.muted || !AC || activeTones > 16 || document.hidden) return;
    const a = audio(); if (!a) return;
    vol *= (S.set.vol === undefined ? 0.7 : S.set.vol) * 1.4;
    if (vol <= 0.0002) return;
    activeTones++; setTimeout(() => { activeTones--; }, (d + delay) * 1000 + 60);
    const t0 = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t0); o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + d + 0.05);
  }
  let lastHitSnd = 0;
  function sndHit(crit) { const n = performance.now(); if (n - lastHitSnd < 45) return; lastHitSnd = n; tone(crit ? 520 : 240 + Math.random() * 60, 90, 0.07, 'square', crit ? 0.05 : 0.03); }
  const jingle = () => { tone(523, 523, 0.12, 'triangle', 0.06, 0.05); tone(659, 659, 0.12, 'triangle', 0.06, 0.15); tone(784, 784, 0.2, 'triangle', 0.06, 0.25); };

  /* ================= battle state ================= */
  const cvs = $('#arena'), ctx = cvs.getContext('2d');
  let W = 0, H = 0, PX = 6;
  const RUN = 170;
  const hero = { hp: 30, atkT: 0.4, lunge: 0, flash: 0, wx: 0, running: false };
  let enemies = [], fainted = 0, combo = 0, comboHold = 0, petT = 0, chest = null, shake = 0, banner = null, t = 0;
  let floats = [], parts = [], slashes = [], fx = [], notes = [], ambient = [];
  const skT = { spin: 0, bolt: 0, heal: 0, rush: 0, frenzy: 0, meteor: 0, stop: 0, clone: 0 };
  const allyT = { knight: 0.5, wizard: 1 }, allyLunge = { knight: 0, wizard: 0 };
  let feverT = 0, frenzyT = 0, feverVal = 2, frenzyVal = 1.8, income = 0;
  let goblin = null, goblinT = rand(40, 75);
  let mode = 'main', run = null, farmLoops = 0, petEqT = 1, petLunge = 0;
  const dev = { god: false, onehit: false, speed: 1, debug: false };
  const dpsLog = [];
  let fullLog = [], hitStop = 0, slowmo = 0, flashT = 0, freezeT = 0, cloneT = 0, ultC = 0, coinFly = [], crabT = 2, banterT = 20, banter = null, xSlowT = 0, lastMax = 0, lastFloorT = 0, stuckT = 0, lastTitle = '', expPick = null, sumArm = 0;
  const petTimers = {}, petSkillT = {}, petLunges = {};

  const theme = f => THEMES[Math.floor((f - 1) / 5) % THEMES.length];
  const themeName = f => { const c = Math.floor((f - 1) / (5 * THEMES.length)); return theme(f).name + (c ? ' ' + ['II', 'III', 'IV', 'V', 'VI'][Math.min(c - 1, 4)] + (c > 5 ? '+' : '') : ''); };
  const hiredList = () => ALLIES.filter(a => S.allies[a.id] > 0 && !(S.exped && S.exped.id === a.id));
  const heroSX = () => W * 0.18 + hiredList().length * Math.min(PX * 7.5, (W * 0.34) / Math.max(1, hiredList().length));
  const groundY = () => H - 46;
  const sx = wx => heroSX() + (wx - hero.wx);
  const allyGap = () => Math.min(PX * 7.5, (W * 0.34) / Math.max(1, hiredList().length));
  const meleeX = () => hero.wx + PX * 11;
  const alive = () => enemies.filter(e => !e.dead);
  const front = () => alive()[0] || null;
  const inRange = e => e && e.wx <= meleeX() + 4;
  const onScreen = e => e && sx(e.wx) < W - 10;

  function makeEnemy(opt) {
    const f = S.floor, th = theme(f);
    const boss = !!opt.boss, minion = !!opt.minion;
    let kind = opt.kind || pick(th.kinds);
    if (boss && !opt.kind) kind = f % 5 === 0 ? th.boss : pick(th.kinds);
    const vChance = Math.min(0.5, 0.08 + f * 0.006);
    const variant = !boss && !minion && Math.random() < vChance ? pick(Object.keys(VARIANTS)) : null;
    const elite = !boss && !minion && Math.random() < 0.05;
    const V = variant ? VARIANTS[variant] : { hp: 1, dmg: 1, gold: 1 };
    const hp = hpM(f) * (boss ? 8 : elite ? 4 : minion ? 0.6 : 1) * V.hp;
    const mechs = [];
    if (boss && f >= 5) { const keys = Object.keys(BOSS_MECH); mechs.push(pick(keys)); if (f >= 40) { const k2 = pick(keys.filter(k => k !== mechs[0])); mechs.push(k2); } }
    const name = boss ? `${pick(BOSSES)} the ${CNAME[kind]}` : `${elite ? 'Shiny ' : ''}${variant ? V.name : pick(ADJ)} ${CNAME[kind]}`;
    return {
      kind, boss, elite, variant, minion, hp, max: hp, wx: opt.wx, name, mechs,
      dmg: dmgM(f) * (boss ? 1.8 : elite ? 1.4 : minion ? 0.6 : 1) * V.dmg, int: boss ? 1.3 : variant === 'speedy' ? 0.85 : 1.5, atkT: 0.9,
      gold: goldM(f) * (boss ? 10 : elite ? 8 : minion ? 0.3 : 1) * V.gold,
      tint: elite ? '#ffd76a' : variant === 'vampire' ? mix(th.tint, '#d1203a', 0.5) : variant === 'armored' ? mix(th.tint, '#8f9bb8', 0.55) : th.tint,
      scale: (boss ? (BIG[kind] ? 1.3 : 1.45) : 1) * (V.scale || 1),
      flash: 0, dead: false, deadT: 0, lunge: 0, ph: Math.random() * 6.28,
      timer: boss ? (S.chal === 'speed' ? 15 : 30) : 0, shT: 4, shield: 0, sumT: 4, enraged: false
    };
  }
  function spawnWave() {
    if (S.farm && S.kill >= 9) {
      S.kill = 0; farmLoops++;
      if (autoOn('autoboss') && farmLoops >= 3) { farmLoops = 0; S.farm = false; S.kill = 9; log('Auto boss: trying the boss again.', 'c'); }
    }
    const boss = S.kill >= 9;
    if (boss) S.bossReady = true;
    const n = boss ? 1 : 3 - (S.kill % 3);
    const start = hero.wx + Math.max(W - heroSX() + PX * 10, PX * 30);
    for (let i = 0; i < n; i++) enemies.push(xEnemy2(xEnemy(makeEnemy({ boss, wx: start + i * PX * 13 }))));
    if (boss) {
      const b = enemies[enemies.length - 1];
      banner = { text: 'BOSS', sub: `${b.name}${b.mechs.length ? ' · ' + b.mechs.map(m => BOSS_MECH[m]).join(', ') : ''}`, life: 2 };
      tone(110, 80, 0.5, 'sawtooth', 0.05);
    }
    buildPips();
  }

  function addFloat(wx, y, text, color, size = 16, force) { if (!S.set.nums && !force) return; floats.push({ wx: wx + rand(-10, 10), y, text, color, size, life: 1, vy: -40 }); if (floats.length > 60) floats.shift(); }
  function burst(wx, y, color, n, sp) {
    if (!S.set.particles) n = Math.ceil(n / 4);
    n = reduceMotion ? Math.ceil(n / 3) : n;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = rand(0.3, 1) * sp, l = rand(0.4, 0.8); parts.push({ wx, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: l, max: l, color, size: rand(2, 4) }); }
    if (parts.length > 400) parts.splice(0, parts.length - 400);
  }
  function log(html, cls = '') {
    const li = document.createElement('li'); li.innerHTML = html; if (cls) li.className = cls;
    fullLog.unshift({ t: Date.now(), html, cls }); if (fullLog.length > 150) fullLog.pop();
    const el = $('#log'); el.prepend(li); while (el.children.length > 6) el.lastChild.remove();
  }
  const comboMult = () => 1 + 0.025 * Math.floor(combo);
  const goldNow = () => st.goldMult * (feverT > 0 ? feverVal : 1) * (magnetT > 0 ? magnetVal : 1) * evGold();
  const baseGold = () => goldM(S.floor);
  function earn(g) { S.gold += g; income += g; S.life.goldEarned += g; questEvent('gold', g); }
  function addGems(n, why) { S.gems += n; log(`+${n} gem${n > 1 ? 's' : ''} ${why}.`, 'p'); tone(1175, 1760, 0.15, 'sine', 0.05); }
  const shakeIt = v => { if (S.set.shake && !reduceMotion) shake = Math.max(shake, v); };

  let lastStopT = -1;
  const SRC_COL = { tap: '#ff7ad9', pet: '#c7a6ff', skill: '#62d2c4', ally: '#ff9a5a', auto: '#f1ecff' };
  function hit(e, base, src) {
    if (!e || e.dead || fainted) return;
    const gy = groundY();
    if ((e.variant === 'ghostly' && (src === 'auto' || src === 'pet' || src === 'ally') && Math.random() < 0.3) || (floorEv && floorEv.dodge && src === 'auto' && !e.special && Math.random() < floorEv.dodge)) { addFloat(e.wx, gy - PX * 11, 'MISS', '#a99fc2', 14); tone(900, 1300, 0.05, 'sine', 0.02); return; }
    const crit = starT > 0 || Math.random() < st.crit;
    let amt = base * (crit ? st.critMult : 1) * comboMult() * (cryT > 0 ? cryVal : 1) * (e.boss || e.special ? st.boss : 1);
    if (e.shield > 0) amt *= 0.1;
    if (dev.onehit) amt = e.hp + 1;
    e.hp -= amt; e.flash = e.special ? 0.04 : 0.12;
    dpsLog.push([t, amt, src]);
    if (st.leech && src !== 'pet') hero.hp = Math.min(st.maxHp, hero.hp + Math.min(amt * st.leech, st.maxHp * 0.05));
    shakeIt(crit ? 5 : src === 'skill' ? 4 : 2);
    dmgFloat(e, amt, crit, src);
    if (crit && (e.boss || e.special) && (src === 'tap' || src === 'auto') && t - lastStopT > 0.3) { lastStopT = t; hitStop = Math.max(hitStop, 0.03); }
    sndHit(crit);
    if (e.boss && e.mechs.includes('enrage') && !e.enraged && e.hp < e.max * 0.5) { e.enraged = true; e.int *= 0.55; e.dmg *= 1.3; addFloat(e.wx, gy - PX * 18, 'ENRAGED!', '#ff5d73', 20, true); tone(90, 60, 0.4, 'sawtooth', 0.05); }
    if (e.special) { specialHit(e); return; }
    if (e.hp <= 0) kill(e);
  }

  function kill(e) {
    e.dead = true; e.deadT = 0;
    const g = e.gold * goldNow();
    earn(g);
    const y = groundY();
    addFloat(e.wx, y - PX * 6, `+${fmt(g)} gold`, '#f5b942', 18);
    burst(e.wx, y - PX * 4, e.tint, 18, 160);
    burst(e.wx, y - PX * 4, '#f5b942', 8, 120);
    tone(880, 1320, 0.08, 'triangle', 0.05);
    S.life.kills++; S.life.beasts[e.kind] = (S.life.beasts[e.kind] || 0) + 1;
    if (S.life.beasts[e.kind] === 100) { recalc(); log(`Mastered <b>${CNAME[e.kind]}s</b> in the bestiary: +5% gold forever.`, 't'); markTab('book'); }
    xKill(e); xKill2(e);
    questEvent('kill', 1);
    if (e.variant) { S.life.variants++; questEvent('variant', 1); }
    if (e.variant === 'explosive' && !fainted) {
      const d = st.maxHp * 0.12 * st.taken;
      if (!dev.god && !(invulnT > 0)) hero.hp -= d;
      burst(e.wx, y - PX * 4, '#ff8a3d', 30, 260); shakeIt(8);
      addFloat(hero.wx, y - PX * 13, 'BOOM -' + fmt(d), '#ff8a3d', 18, true);
      tone(120, 40, 0.35, 'sawtooth', 0.06);
      if (hero.hp <= 0) { faint(`An <b>${e.name}</b> blew you up. Back to the start of floor ${S.floor}.`); return; }
    }
    const rac = st.al.raccoon * allyMulU('raccoon');
    if (rac && Math.random() < 0.2) {
      const sg = e.gold * goldNow() * (1 + BAL.racSteal * rac);
      earn(sg); addFloat(e.wx, y - PX * 9, `STOLEN +${fmt(sg)}`, '#c9cfe0', 14);
    }
    if (e.elite) {
      S.life.elites++; questEvent('elite', 1);
      log(`Beat a <b style="color:#ffd76a">${e.name}</b>! Big gold.`, 'g');
      if (Math.random() < 0.3) addGems(1, 'from a shiny monster');
      if (Math.random() < 0.5) { const r = randi(2, 5); S.runes += r; log(`+${r} runes from the shiny monster.`, 'u'); }
    }
    if (e.minion) { buildPips(); return; }
    if (e.boss) {
      S.life.bosses++; questEvent('boss', 1);
      jingle();
      enemies.forEach(m => { if (m.minion && !m.dead) { m.dead = true; m.deadT = 0; } });
      const fightT = t - (e.engT || t), prevMax = S.maxFloor, prevDeep = S.deepest;
      let skip = 0;
      const steady = dpsLog.filter(d => d[2] !== 'skill' && d[2] !== 'tap' && d[0] > t - 5).reduce((a, d) => a + d[1], 0) / 5;
      if (S.set.skip && fightT < 2 && steady * 2 > e.max) skip = clamp(Math.floor(Math.log(steady * 2 / e.max) / Math.log(BAL.hpGrowth)), 0, 10);
      if (skip > 0) {
        let g = 0;
        for (let k = 1; k <= skip; k++) g += goldM(S.floor + k) * 19 * 0.25;
        earn(g * goldNow());
        log(`Crushed <b>${e.name}</b> in ${fightT.toFixed(1)}s! Skipped <b>${skip} floor${skip > 1 ? 's' : ''}</b> and picked up ${fmt(g * goldNow())} gold on the way.`, 'g');
      } else log(`Beat <b>${e.name}</b>! On to floor ${S.floor + 1}.`, 'g');
      S.floor += 1 + skip; S.kill = 0; farmLoops = 0; S.bossReady = false;
      S.maxFloor = Math.max(S.maxFloor, S.floor);
      S.deepest = Math.max(S.deepest, S.floor);
      const crossed = n => prevMax < n && S.maxFloor >= n, crossedDeep = n => prevDeep < n && S.deepest >= n;
      banner = { text: skip ? `+${skip + 1} FLOORS` : `FLOOR ${S.floor}`, sub: skip ? `Floor ${S.floor} · ${themeName(S.floor)}` : themeName(S.floor), life: 1.8 };
      if (Math.random() < BAL.bossDrop) dropEq();
      if (Math.random() < 0.2 || S.floor % 10 === 1) dropRelic();
      if (Math.random() < 0.25 + 0.03 * tal('f3')) addGems(1, 'from the boss');
      const sh = randi(1, 3) + skip; S.shards += sh;
      if (S.floor % 5 === 1 || skip >= 3) { const r = randi(3, 6); S.runes += r; log(`+${r} runes and +${sh} shards for clearing the area.`, 'u'); }
      for (const s of SKILLS) if (crossed(s.unlock)) { log(`New skill: <b>${s.name}</b>! ${s.fx(S.sk[s.id])}.`, 'c'); banner = { text: 'NEW SKILL', sub: s.name, life: 2.2 }; markTab('skills'); buildSkillbar(); }
      for (const a of ALLIES) if (crossedDeep(a.unlock)) { log(`<b>${a.name}</b> wants to join you. Hire them in Allies.`, 'c'); banner = { text: 'ALLY AVAILABLE', sub: a.name, life: 2.2 }; markTab('allies'); }
      if (crossedDeep(15) || crossedDeep(30)) { log('A new enchant line opened up on your weapon.', 'u'); markTab('forge'); }
      if (RANKS[S.rank + 1] && crossedDeep(RANKS[S.rank + 1].need)) { log(`The <b>${RANKS[S.rank + 1].n}</b> rank trial is open. Check Trials.`, 't'); markTab('trials'); }
      if (EVO_REQ.some(r => r && crossedDeep(r.deep))) markTab('hero');
      save();
    } else {
      S.kill++;
      if (!chest && Math.random() < st.chest * evChest()) {
        chest = { wx: e.wx, life: 6, gold: e.gold * (e.elite ? 2 : 12) };
        log('A treasure chest appeared! Tap it quick.', 'g');
        tone(660, 990, 0.15, 'triangle', 0.05);
      }
    }
    buildPips();
  }

  /* ================= loot ================= */
  function rollPrefix() { const p = wpick(PREFIXES, PREFIXES.map(x => x[2])); return { pre: p[0], pm: p[1] }; }
  const itemLabel = (cat, i) => `<b style="color:${GRADES[Math.floor(i / 4)].c}">${EQ[cat].names[i]}</b> (${GRADES[Math.floor(i / 4)].n} ${TIERN[i % 4]})`;
  function rollItem(L) { const g = wpick([0, 1, 2, 3, 4, 5], gradeWeights(L)); return g * 4 + wpick([0, 1, 2, 3], [40, 30, 20, 10]); }
  function giveItem(cat, i, n) {
    const E = S.eq[cat];
    const fresh = !E.s[i];
    E.c[i] += n || 1; E.s[i] = 1;
    if (Math.floor(i / 4) >= 4 && fresh) S.life.legendaries++;
    if (Math.floor(i / 4) >= 5) S.life.mythics++;
    if (Math.floor(i / 4) >= 5 && fresh) { slowmo = 1.2; flashT = 0.5; }
    if (fresh) markTab('equip');
    if (S.set.autoeq && i > E.on) E.on = i;
    return fresh;
  }
  function dropEq() {
    const cat = pick(['weapon', 'armor', 'helm', 'boots', 'acc']), i = Math.min(11, rollItem(1));
    const fresh = giveItem(cat, i);
    recalc();
    log(`Found ${itemLabel(cat, i)}${fresh ? ' <i style="color:var(--heal)">New! +1% damage.</i>' : '.'}`, 't');
    if (Math.floor(i / 4) >= 3) banner = { text: GRADES[Math.floor(i / 4)].n.toUpperCase() + '!', sub: EQ[cat].names[i], life: 2.2 };
    tone(659, 1319, 0.2, 'triangle', 0.05, 0.2);
  }
  function dropRelic() {
    const r = pick(RELICS);
    const had = S.relics[r.id] || 0;
    S.relics[r.id] = had + 1;
    recalc();
    log(had ? `Relic: <b>${r.name}</b> again, now ×${had + 1}. (${r.text})` : `New relic: <b>${r.name}</b>! (${r.text})`, 't');
    banner = { text: 'RELIC FOUND', sub: r.name, life: 2.2 };
    tone(784, 1568, 0.3, 'sine', 0.06, 0.3);
    markTab('legacy');
  }

  /* ================= forge: enchants, enhance, reforge ================= */
  function rollEnch() {
    const s = pick(ENCH_STATS), ti = ENCH_TIERS.indexOf(wpick(ENCH_TIERS, ENCH_TIERS.map(x => x.w)));
    const v = Math.round(rand(s.r[0], s.r[1]) * ENCH_TIERS[ti].m * 10) / 10;
    return { s: s.id, t: ti, v };
  }
  const enchCost = () => 5 + 3 * enchLines() + 6 * S.locks.filter((l, i) => l && i < enchLines()).length;
  function rerollEnch() {
    audio();
    const c = enchCost();
    if (S.runes < c || S.locks.slice(0, enchLines()).every(Boolean)) return;
    S.runes -= c;
    let best = -1;
    for (let i = 0; i < enchLines(); i++) {
      if (S.locks[i] && S.ench[i]) continue;
      S.ench[i] = rollEnch();
      best = Math.max(best, S.ench[i].t);
      if (S.ench[i].t === 4) S.life.mythic++;
    }
    S.life.enchants++; questEvent('ench', 1);
    if (best >= 3) { log(`Rolled a <b style="color:${ENCH_TIERS[best].c}">${ENCH_TIERS[best].n}</b> enchant!`, 'u'); jingle(); } else tone(700, 1100, 0.12, 'triangle', 0.05);
    recalc(); save();
  }
  const enhCost = () => Math.ceil(5 * Math.pow(1.25, S.wlv));
  const enhChance = () => Math.max(0.25, 1 - S.wlv * 0.05);
  function enhance() {
    audio();
    const c = enhCost();
    if (S.shards - c < (S.set.reserve || 0)) return;
    S.shards -= c;
    if (Math.random() < enhChance()) { S.wlv++; log(`Weapon enhanced to <b>+${S.wlv}</b>! (+${S.wlv * 12}% weapon power)`, 't'); tone(880, 1760, 0.15, 'triangle', 0.06); shakeIt(4); }
    else { log('The hammer slipped. Enhance failed, but nothing broke.', 'r'); tone(200, 120, 0.2, 'square', 0.04); }
    recalc(); save();
  }
  const reforgeCost = () => 8;
  function reforge() {
    audio();
    if (S.runes < reforgeCost()) return;
    S.runes -= reforgeCost();
    const p = rollPrefix(), old = S.prefix.pre;
    S.prefix = { pre: p.pre, pm: p.pm };
    log(`Reforged: <b>${old}</b> → <b>${p.pre}</b> (×${p.pm.toFixed(2)} power).`, 'u');
    tone(500, 900, 0.12, 'triangle', 0.05);
    recalc(); save();
  }

  /* ================= equipment: summon, merge, level ================= */
  let lastSum = 11;
  function summonEq(cat, n, auto) {
    audio();
    const cost = SUM_COST[n];
    if (S.gems < cost) return;
    if (n === 35 && !auto && sumArm < performance.now()) { sumArm = performance.now() + 3000; setText($('#sum35'), 'Tap again: 150 gems'); return; }
    sumArm = 0;
    S.gems -= cost; lastSum = n;
    const E = S.eq[cat], res = [];
    for (let k = 0; k < n; k++) {
      let i = rollItem(E.sl);
      if (Math.floor(i / 4) >= 4) E.pity = 0; else if (++E.pity >= 150) { i = 16 + randi(0, 3); E.pity = 0; log('Pity counter hit 150: a guaranteed Legendary!', 'p'); }
      if (Math.floor(i / 4) >= 4 && Math.random() < 0.5) i = Math.max(i, featured(cat));
      res.push({ i, fresh: giveItem(cat, i) });
      E.sx++; S.life.summons++;
      if (E.sx >= sumNeedEq(E.sl)) { E.sx -= sumNeedEq(E.sl); E.sl++; log(`${EQ[cat].name} summon level <b>${E.sl}</b>! Better odds from now on.`, 'p'); }
    }
    questEvent('summon', n);
    if (n === 35 && Math.max(...res.map(r => r.i)) < 12) { const last = res[res.length - 1]; E.c[last.i]--; last.i = 12 + randi(0, 3); last.fresh = giveItem(cat, last.i); }
    S.life.bestPull = Math.max(S.life.bestPull, ...res.map(r => r.i));
    recalc();
    const best = Math.max(...res.map(r => r.i)), bg = Math.floor(best / 4);
    log(`Summoned ${n} ${n > 1 ? EQ[cat].name.toLowerCase() : EQ[cat].one}. Best: ${itemLabel(cat, best)}.`, 'p');
    if (bg >= 3) { banner = { text: GRADES[bg].n.toUpperCase() + '!', sub: EQ[cat].names[best], life: 2.2 }; jingle(); } else tone(880, 1320, 0.15, 'triangle', 0.05);
    S.eqSel[cat] = best;
    lastSumKind = 'eq'; $('#sumMerge').hidden = false;
    if (n > 1 && !auto) {
      $('#sumRes').innerHTML = res.map((r, k) => `<div style="--gc:${GRADES[Math.floor(r.i / 4)].c};animation-delay:${Math.min(k * 25, 800)}ms" title="${EQ[cat].names[r.i]}"><img alt="${EQ[cat].names[r.i]}" src="${eqIcon(cat, r.i)}">${r.fresh ? '<span class="nw">NEW</span>' : ''}</div>`).join('');
      setText($('#sumResText'), `${res.filter(r => r.fresh).length} new, best was ${EQ[cat].names[best]} (${GRADES[bg].n} ${TIERN[best % 4]}).`);
      setText($('#sumAgain'), `Summon ×${n} again (${cost} gems)`);
      $('#sumModal').hidden = false;
    }
    save();
  }
  function mergeOne(cat, i) {
    const E = S.eq[cat];
    if (i >= 23 || E.c[i] < 5) return false;
    E.c[i] -= 5; S.life.merges++;
    const fresh = giveItem(cat, i + 1);
    return fresh;
  }
  function mergeAll(cat) {
    audio();
    let merges = 0, top = -1;
    for (let i = 0; i < 23; i++) while (S.eq[cat].c[i] >= 5) { mergeOne(cat, i); merges++; top = i + 1; }
    if (!merges) return 0;
    recalc();
    log(`Merged ${merges} time${merges > 1 ? 's' : ''}. Best new piece: ${itemLabel(cat, top)}.`, 'p');
    tone(523, 1046, 0.2, 'triangle', 0.05); burst(hero.wx, groundY() - PX * 6, GRADES[Math.floor(top / 4)].c, 20, 160);
    save(); return merges;
  }
  function levelEq(cat, i) {
    const E = S.eq[cat];
    if (!E.s[i] || E.l[i] >= eqMax(i)) return false;
    const c = eqLvCost(i, E.l[i]);
    if (S.shards - c < (S.set.reserve || 0)) return false;
    S.shards -= c; E.l[i]++;
    recalc(); tone(600 + E.l[i] * 10, 900, 0.06, 'triangle', 0.04);
    return true;
  }
  function equipBest(cat) { const E = S.eq[cat]; E.on = E.s.lastIndexOf(1); recalc(); save(); }
  const eqIconCache = {};
  function eqIcon(cat, i) {
    const key = cat + i;
    if (eqIconCache[key]) return eqIconCache[key];
    const gc = GRADES[Math.floor(i / 4)].c, dk = mix(gc, '#000000', 0.35), lt = mix(gc, '#ffffff', 0.5);
    let url;
    if (cat === 'weapon') { const id = ['sword', 'axe', 'spoon', 'staff'][i % 4]; url = spriteURL(ICON[id], { a: gc, b: '#8a5a3c', c: gc, d: lt }, 4); }
    else if (cat === 'armor') url = spriteURL(ICON[i % 2 ? 'helm' : 'armor'], { a: gc, b: dk, c: lt }, 4);
    else if (cat === 'boots') url = spriteURL(ICON.boots, { a: gc, b: dk }, 4);
    else if (cat === 'helm') url = spriteURL(ICON.helm, { a: gc, b: dk }, 4);
    else if (cat === 'acc') url = spriteURL(ICON[i % 2 ? 'amulet' : 'ring'], { a: gc, b: i % 2 ? dk : '#f5b942', c: lt, d: '#ffffff' }, 4);
    else url = spriteURL(SPR[PET_KINDS[i]], petPal(i), 3);
    return (eqIconCache[key] = url);
  }
  function petPal(i) {
    const k = PET_KINDS[i], gc = GRADES[Math.floor(i / 4)].c;
    if (k === 'tgoblin') return { a: '#f5b942', b: '#6b4a2f', c: '#ffffff', d: '#1a1424', e: '#ffe066' };
    return monPal({ kind: k, tint: mix(THEMES.find(t => t.kinds.includes(k) || t.boss === k).tint, gc, 0.35) });
  }

  /* ================= runs: dungeons + trials ================= */
  function regenKeys() {
    const now = Date.now();
    const std = DUNGEONS.filter(d => d.id !== 'grotto');
    if (std.every(d => S.keys[d.id] >= 3)) S.keyT = now;
    else { const ms = keyMs(), n = Math.floor((now - S.keyT) / ms); if (n > 0 && isFinite(n)) { const add = Math.min(n, 3); for (const d of std) S.keys[d.id] = Math.min(3, S.keys[d.id] + add); S.keyT = n > 3 ? now : S.keyT + n * ms; } else if (!isFinite(S.keyT)) S.keyT = now; }
    if (S.keys.grotto >= 1) S.grottoT = now; else if (now - S.grottoT >= GROTTO_MS) { S.keys.grotto = 1; S.grottoT = now; }
  }
  function startRun(type, silent) {
    audio();
    if (mode !== 'main' || fainted) return;
    const df = Math.max(1, S.deepest);
    if (type === 'abyss' || type === 'rush' || type === 'dailyc') { if (!xStartRun(type)) return; }
    else if (type === 'trial') {
      const next = RANKS[S.rank + 1];
      if (!next || S.deepest < next.need) return;
      const e = makeEnemy({ boss: true, kind: pick(['ogre', 'dragon', 'lich', 'golem']), wx: hero.wx + PX * 30 });
      e.name = `${next.n} Examiner`; e.special = 'trial'; e.mechs = [];
      e.hp = e.max = hpM(next.need) * 10; e.dmg = dmgM(next.need) * 1.6; e.timer = 40; e.gold = 0;
      run = { type, t: 40, rank: S.rank + 1, tier: 0 };
      enemies = [e];
      banner = { text: 'RANK TRIAL', sub: `Beat the ${next.n} Examiner in 40 seconds`, life: 2.2 };
    } else {
      const D = DUNGEONS.find(d => d.id === type);
      if (S.keys[type] <= 0) return;
      S.keys[type]--;
      const e = makeEnemy({ boss: true, kind: D.kind, wx: hero.wx + PX * 30 });
      e.name = D.name + ' Guardian'; e.special = type; e.mechs = []; e.tint = D.tint;
      e.base = hpM(df) * 3; e.hp = e.max = e.base; e.dmg = dmgM(df) * 0.7; e.timer = 30; e.gold = 0; e.tier = 0;
      run = { type, t: 30, tier: 0, got: 0 };
      enemies = [e];
      banner = { text: D.name.toUpperCase(), sub: 'Break as many health bars as you can in 30 seconds', life: 2 };
    }
    mode = 'run'; chest = null; hero.hp = st.maxHp; combo = 0; buildPips();
    tone(220, 440, 0.3, 'triangle', 0.05);
    if (!silent) $('#tab-trials').click();
  }
  function specialHit(e) {
    if (e.hp > 0) return;
    if (e.special === 'dailyc') { dailyKill(e); return; }
    if (e.special === 'abyss' || e.special === 'rush') { xSpecialKill(e); return; }
    if (e.special === 'trial') { endRun(true); return; }
    while (e.hp <= 0) {
      const over = -e.hp;
      run.tier++; e.tier = run.tier;
      const df = Math.max(1, S.deepest);
      if (e.special === 'vault') { const g = goldM(df) * st.goldMult * (2 + 0.5 * run.tier); earn(g); run.got += g; addFloat(e.wx, groundY() - PX * 18, `BAR ${run.tier}! +${fmt(g)} gold`, '#f5b942', 18, true); }
      if (e.special === 'mine') { const r = 1 + Math.ceil(run.tier * 0.8); S.runes += r; run.got += r; addFloat(e.wx, groundY() - PX * 18, `BAR ${run.tier}! +${r} runes`, '#6fd6ff', 18, true); }
      if (e.special === 'grotto' && run.tier % 3 === 0) { S.gems += 1; run.got += 1; addFloat(e.wx, groundY() - PX * 18, `BAR ${run.tier}! +1 gem`, '#b98cff', 18, true); }
      if (e.special === 'forge') { const r = 3 + run.tier; S.shards += r; run.got += r; addFloat(e.wx, groundY() - PX * 18, `BAR ${run.tier}! +${r} shards`, '#ff9a5a', 18, true); }
      e.max = e.base * Math.pow(1.8, run.tier); e.hp = e.max - over;
      if (run.tier >= 25) { addFloat(e.wx, groundY() - PX * 22, 'MAXED OUT!', '#62d2c4', 20, true); endRun(true); return; }
      burst(e.wx, groundY() - PX * 6, e.tint, 20, 200); tone(660 + run.tier * 40, 990, 0.12, 'triangle', 0.05);
    }
  }
  function endRun(win) {
    if (!run) return;
    const r = run;
    if (r.type === 'dailyc') { endDaily(r); run = null; mode = 'main'; enemies = []; hero.hp = st.maxHp; buildPips(); save(); return; }
    if (r.type === 'abyss' || r.type === 'rush') { xEndRun(r, win); run = null; mode = 'main'; enemies = []; hero.hp = st.maxHp; buildPips(); save(); return; }
    if (r.type === 'trial') {
      S.life.trials++;
      if (win) { S.rank = r.rank; recalc(); log(`Promoted to <b>${RANKS[S.rank].n}</b>! +20% damage, +20% health, +10% gold forever.`, 't'); banner = { text: 'PROMOTED', sub: RANKS[S.rank].n + ' rank', life: 2.6 }; jingle(); tone(1046, 2093, 0.4, 'sine', 0.05, 0.3); }
      else log('Trial failed. Train up and try again, it is free.', 'r');
    } else {
      S.life.dungeons++; questEvent('dungeon', 1);
      const D = DUNGEONS.find(d => d.id === r.type);
      log(`${D.name} done: broke <b>${r.tier}</b> bars for <b>${fmt(r.got)} ${D.cur}</b>.`, D.cur === 'gold' ? 'g' : 'u');
      banner = { text: `${r.tier} BARS`, sub: `+${fmt(r.got)} ${D.cur}`, life: 2 };
      jingle();
    }
    run = null; mode = 'main'; enemies = []; hero.hp = st.maxHp; buildPips(); save();
  }

  function faint(why) {
    if (dev.god) { hero.hp = st.maxHp; return; }
    if (mode === 'run') { hero.hp = 1; endRun(false); log('You got knocked out of the run.', 'r'); return; }
    hero.hp = 0; fainted = 2.2;
    S.life.deaths++;
    log(why, 'r');
    tone(300, 70, 0.6, 'sawtooth', 0.05);
    const wasBoss = enemies.some(e => e.boss && !e.dead);
    S.kill = 0; enemies = []; chest = null; combo = 0;
    if (wasBoss && !S.farm) { S.farm = true; farmLoops = 0; log(`Farming floor ${S.floor} for now. Press <b>Fight boss</b> when you're stronger${S.set.autoboss ? ', or wait for auto boss' : ''}.`); }
    buildPips(); save();
  }
  function monAttack(e) {
    e.lunge = 1;
    const d = e.dmg * st.taken;
    if (!dev.god && !(invulnT > 0)) hero.hp -= d;
    hero.flash = 0.12;
    addFloat(hero.wx, groundY() - PX * 11, '-' + fmt(d), '#ff5d73', 15);
    if (e.variant === 'vampire') { e.hp = Math.min(e.max, e.hp + d * 2); addFloat(e.wx, groundY() - PX * 13, '+heal', '#ff5d73', 12); }
    if (S.allies.knight) allyLunge.knight = 0.6;
    if (hero.hp <= 0) faint(`You fainted to <b>${e.name}</b>. Back to the start of floor ${S.floor}.`);
  }

  /* ================= skills ================= */
  const unlocked = s => s.gacha !== undefined ? !!(S.skOwn && S.skOwn[s.id]) : (S.maxFloor >= s.unlock || S.deepest >= s.unlock);
  function castSkill(id, manual) {
    const s = SKILLS.find(k => k.id === id);
    if (!unlocked(s) || skT[id] > 0 || fainted) return false;
    const f = front(), L = (s.gacha !== undefined ? S.skLv[id] : S.sk[id]) || 1, y = groundY();
    if (id === 'spin') {
      const targets = alive().filter(onScreen);
      if (!targets.length) return false;
      for (const e of targets) hit(e, st.dmg * s.val(L) * st.skillMult, 'skill');
      fx.push({ type: 'spin', life: 0.45 });
      tone(400, 900, 0.18, 'sawtooth', 0.04);
    } else if (id === 'bolt') {
      if (!f || !onScreen(f)) return false;
      fx.push({ type: 'bolt', wx: f.wx, life: 0.35 });
      hit(f, st.dmg * s.val(L) * st.skillMult, 'skill');
      tone(1400, 120, 0.3, 'sawtooth', 0.05);
    } else if (id === 'heal') {
      if (hero.hp >= st.maxHp * 0.98 && !manual) return false;
      const h = st.maxHp * s.val(L);
      hero.hp = Math.min(st.maxHp, hero.hp + h);
      addFloat(hero.wx, y - PX * 12, '+' + fmt(h), '#62d2c4', 18);
      burst(hero.wx, y - PX * 5, '#62d2c4', 16, 110);
      tone(523, 1046, 0.25, 'sine', 0.05);
    } else if (id === 'rush') {
      feverT = Math.max(feverT, 10); feverVal = s.val(L); tone(988, 1976, 0.3, 'triangle', 0.05);
      banner = { text: 'GOLD FEVER', sub: `${feverVal.toFixed(2)}× gold`, life: 1.3 };
    } else if (id === 'frenzy') {
      frenzyT = Math.max(frenzyT, 8); frenzyVal = s.val(L); tone(200, 600, 0.3, 'square', 0.04);
      banner = { text: 'FRENZY', sub: `${frenzyVal.toFixed(1)}× swing speed`, life: 1.3 };
    } else if (id === 'meteor') {
      const targets = alive().filter(onScreen);
      if (!targets.length) return false;
      for (const e of targets) { fx.push({ type: 'meteor', wx: e.wx, life: 0.5 }); hit(e, st.dmg * s.val(L) * st.skillMult, 'skill'); }
      tone(200, 60, 0.5, 'sawtooth', 0.05); shakeIt(8);
    } else if (id === 'stop') {
      if (!alive().length) return false;
      freezeT = s.val(L); banner = { text: 'TIME OUT', sub: `Monsters frozen for ${freezeT.toFixed(1)}s`, life: 1.2 }; tone(1200, 300, 0.4, 'sine', 0.05);
    } else if (id === 'clone') {
      if (!f) return false;
      cloneT = s.val(L); banner = { text: 'CLONE BUDDY', sub: `Double swings for ${cloneT}s`, life: 1.2 }; tone(500, 1000, 0.2, 'triangle', 0.05);
    } else if (s.gacha !== undefined) {
      if (!castGacha(s, L)) return false;
    }
    skT[id] = s.cd * st.cdMult;
    S.life.skills++; questEvent('skill', 1);
    return true;
  }
  function autoSkills() {
    if (!S.auto || fainted) return;
    const f = front(), engaged = f && inRange(f);
    for (const s of SKILLS.filter(k => S.loadout.includes(k.id))) {
      if (!unlocked(s) || skT[s.id] > 0) continue;
      if (s.id === 'heal' ? hero.hp < st.maxHp * 0.5 : s.id === 'rush' ? alive().length > 0 : engaged) castSkill(s.id, false);
    }
  }

  /* ================= quests, achievements, daily ================= */
  function newQuest() {
    const have = S.quests.map(q => q.type);
    const types = Object.keys(QT).filter(k => !have.includes(k) && (!QT[k].need || QT[k].need()));
    const type = pick(types);
    return { type, n: QT[type].n(), prog: 0, done: false, gems: Math.ceil(QT[type].gems * 1.5) };
  }
  function fillQuests() { while (S.quests.length < 3) S.quests.push(newQuest()); }
  function questEvent(type, amt) {
    weeklyEvent(type, amt);
    for (const q of S.quests) {
      if (q.type !== type || q.done) continue;
      q.prog = QT[type].max ? Math.max(q.prog, amt) : q.prog + amt;
      if (q.prog >= q.n) { q.prog = q.n; q.done = true; log(`Quest done: <b>${QT[type].text(q.n)}</b>.${S.set.autoclaim ? '' : ' Claim it in Quests.'}`, 'p'); markTab('quests'); tone(880, 1760, 0.2, 'sine', 0.05); }
    }
  }
  function claimQuest(i) {
    const q = S.quests[i];
    if (!q || !q.done) return;
    S.gems += q.gems; S.life.quests++; passXp(50);
    log(`Claimed <b>+${q.gems} gems</b>.`, 'p');
    tone(1175, 1760, 0.15, 'sine', 0.05); tone(1568, 2349, 0.15, 'sine', 0.04, 0.08);
    S.quests.splice(i, 1);
    S.quests.splice(i, 0, newQuest());
    save();
  }
  function checkAch() {
    let got = false;
    for (const [id, name, text, test] of ACHS) {
      if (S.ach[id]) continue;
      if (test()) { S.ach[id] = 1; got = true; log(`Achievement: <b>${name}</b> (${text}). +3% damage forever.`, 'g'); banner = { text: 'ACHIEVEMENT', sub: name, life: 2.2 }; markTab('legacy'); jingle(); }
    }
    if (got) { recalc(); save(); }
  }
  const dailyReady = () => S.daily.last !== today();
  const dailyStreakNext = () => S.daily.last === yesterday() ? S.daily.streak + 1 : 1;
  function dailyReward(st) { const m = Math.min(st, 30); return { gems: 5 + Math.min(m, 7) * 2 + Math.floor(m / 3) + (st === 7 ? 25 : st === 14 ? 50 : st === 30 ? 150 : st % 30 === 0 ? 100 : 0), runes: 10 + m * 3, shards: 10 + m * 3 }; }
  function claimDaily() {
    audio();
    if (!dailyReady()) return;
    const sk = dailyStreakNext(), r = dailyReward(sk);
    S.daily = { last: today(), streak: sk };
    S.gems += r.gems; S.runes += r.runes; S.shards += r.shards;
    log(`Daily chest (day ${sk} streak): <b>+${r.gems} gems, +${r.runes} runes, +${r.shards} shards</b>.`, 'p');
    banner = { text: 'DAILY CHEST', sub: `Day ${sk} streak`, life: 2 };
    jingle(); save();
  }

  function buyGem(item) {
    audio();
    if (S.gems < item.cost) return;
    S.gems -= item.cost;
    if (item.id === 'rbox') dropRelic();
    else if (item.id === 'warp') {
      const g = Math.max(S.gps, baseGold() * goldNow() * 0.6) * 1800;
      earn(g); log(`Time Warp: skipped 30 minutes and got <b>${fmt(g)} gold</b>.`, 'g');
      banner = { text: 'TIME WARP', sub: `+${fmt(g)} gold`, life: 2 };
      tone(200, 2000, 0.5, 'sine', 0.05);
    } else if (item.id === 'party') {
      feverT = 20; frenzyT = 20; feverVal = Math.max(feverVal, SKILLS[3].val(S.sk.rush)); frenzyVal = Math.max(frenzyVal, SKILLS[4].val(S.sk.frenzy));
      log('Party Potion! Gold Fever and Frenzy for 20 seconds.', 'c');
      banner = { text: 'PARTY TIME', sub: '20 seconds of everything', life: 2 };
      jingle();
    } else if (item.id === 'rpouch') { S.runes += 25; log('+25 runes.', 'u'); }
    else if (item.id === 'spouch') { S.shards += 30; log('+30 shards.', 'u'); }
    else if (item.id === 'keys') { for (const d of DUNGEONS) S.keys[d.id] = keyMax(d.id); log('All dungeon keys refilled.', 'u'); }
    recalc(); save();
  }

  /* ================= tapping ================= */
  function tap(x, y) {
    audio();
    const gy = groundY();
    if (chest) {
      const cx = sx(chest.wx);
      if (Math.abs(x - cx) < PX * 7 && y > gy - PX * 12 && y < gy + 12) { openChest(1); return; }
    }
    if (goblin && Math.abs(x - goblin.x) < PX * 6 && Math.abs(y - goblin.y + PX * 4) < PX * 7) { hitGoblin(x, y); return; }
    tryParry();
    ultC = Math.min(100, ultC + 0.4);
    const f = front();
    S.life.taps++; questEvent('taps', 1);
    if (!f || fainted || !onScreen(f)) return;
    const before = Math.floor(combo);
    combo = Math.min(st.comboCap, combo + 1);
    comboHold = st.hold;
    const now = Math.floor(combo);
    if (now > S.life.bestCombo) S.life.bestCombo = now;
    questEvent('combo', now);
    for (const m of [25, 50, 100, 200]) if (before < m && now >= m) { banner = { text: m === 25 ? 'NICE COMBO' : m === 50 ? 'WILD COMBO' : m === 100 ? 'UNSTOPPABLE' : 'ARE YOU OKAY', sub: `×${comboMult().toFixed(2)} damage`, life: 1.3 }; log(`Combo ${m}! Damage ×${comboMult().toFixed(2)}.`, 'c'); }
    slashes.push({ x, y, a: rand(-0.8, 0.8), life: 0.25 });
    hit(f, st.tap, 'tap');
  }
  function openChest(share) {
    const gy = groundY();
    const g = chest.gold * goldNow() * share;
    earn(g); S.life.chests++; questEvent('chest', 1);
    addFloat(chest.wx, gy - PX * 9, `+${fmt(g)} gold!`, '#f5b942', 22, true);
    burst(chest.wx, gy - PX * 4, '#f5b942', 26, 200);
    log(share < 1 ? `The raccoon grabbed the chest for you: <b>+${fmt(g)} gold</b>.` : `Opened a chest: <b>+${fmt(g)} gold</b>.`, 'g');
    tone(988, 1976, 0.2, 'triangle', 0.06); tone(1318, 2637, 0.2, 'triangle', 0.04, 0.08);
    if (share >= 1 && Math.random() < 0.4) dropEq();
    if (share >= 1 && Math.random() < 0.1) addGems(1, 'in the chest');
    if (Math.random() < 0.3) { const r = randi(1, 3); S.runes += r; }
    chest = null;
  }
  function hitGoblin(x, y) {
    goblin.hits--; goblin.flash = 0.1;
    slashes.push({ x, y, a: rand(-0.8, 0.8), life: 0.25 });
    tone(1200 + goblin.hits * 50, 900, 0.05, 'square', 0.04);
    const cg = baseGold() * goldNow();
    earn(cg);
    floats.push({ wx: hero.wx + (goblin.x - heroSX()), y: goblin.y - PX * 10, text: '+' + fmt(cg), color: '#f5b942', size: 14, life: 0.8, vy: -60 });
    if (goblin.hits <= 0) {
      const g = 40 * baseGold() * goldNow();
      earn(g); S.life.goblins++; questEvent('goblin', 1);
      burst(hero.wx + (goblin.x - heroSX()), goblin.y - PX * 4, '#f5b942', 40, 260);
      log(`Caught the treasure goblin! <b>+${fmt(g)} gold</b>.`, 'g');
      banner = { text: 'GOBLIN CAUGHT', sub: `+${fmt(g)} gold`, life: 2 };
      jingle();
      addGems(randi(1, 3), 'from the goblin\'s pockets');
      S.runes += 3; S.shards += 3;
      goblin = null;
    }
  }
  function spawnGoblin() { goblin = { x: W + 30, y: H * 0.47, hits: 8, flash: 0, vx: -(W + 80) / 7 }; log('A <b>treasure goblin</b> is running past! Tap it 8 times!', 'g'); tone(880, 440, 0.3, 'square', 0.04); }

  /* ================= update ================= */
  let gpsT = 0, slowT = 0, autoT = 0;
  function update(dt) {
    t += dt; S.life.time += dt;
    hero.lunge = Math.max(0, hero.lunge - dt * 6);
    hero.flash = Math.max(0, hero.flash - dt);
    shake = Math.max(0, shake - dt * 25);
    for (const k in skT) skT[k] = Math.max(0, skT[k] - dt);
    for (const k in allyLunge) allyLunge[k] = Math.max(0, allyLunge[k] - dt * 4);
    feverT = Math.max(0, feverT - dt); frenzyT = Math.max(0, frenzyT - dt);

    if (fainted > 0) {
      fainted -= dt;
      hero.hp = Math.min(st.maxHp, hero.hp + st.maxHp * dt / 2);
      hero.running = false;
      if (fainted <= 0) { fainted = 0; hero.hp = st.maxHp; }
    } else {
      if (mode === 'main' && !alive().length && enemies.every(e => e.deadT > 0.3)) { enemies = []; spawnWave(); }
      const list = alive();
      list.forEach((e, i) => {
        const target = meleeX() + i * PX * 13;
        const sp = e.variant === 'speedy' ? 140 : 70;
        if (e.wx > target && !(freezeT > 0)) e.wx -= Math.min(sp * dt, e.wx - target);
      });
      let f = list[0];
      hero.running = !f || !inRange(f);
      if (hero.running) hero.wx += RUN * dt;
      const atkInt = Math.max(0.03, (st.atkInt || 1) / (frenzyT > 0 ? frenzyVal : 1) * (f && f.variant === 'frozen' ? 1.3 : 1));
      if (f && inRange(f)) {
        hero.atkT -= dt;
        while (hero.atkT <= 0 && f && !f.dead && enemies.includes(f)) { hero.atkT += atkInt; if (S.chal !== 'taponly') { hero.lunge = 1; hit(f, st.dmg * (cloneT > 0 ? 2 : 1), 'auto'); } }
        f = front();
        if (f && !f.dead && !fainted) {
          if (f.boss) {
            if (!f.engT) f.engT = t;
            f.timer -= dt;
            if (run && run.type !== 'dailyc') run.t = f.timer;
            if (f.mechs.includes('regen')) f.hp = Math.min(f.max, f.hp + f.max * 0.012 * dt);
            if (f.mechs.includes('shield')) { f.shT -= dt; if (f.shT <= 0) { f.shield = 2; f.shT = 7; addFloat(f.wx, groundY() - PX * 18, 'SHIELD UP', '#6fd6ff', 16, true); } }
            if (f.shield > 0) f.shield -= dt;
            if (f.mechs.includes('summon')) { f.sumT -= dt; if (f.sumT <= 0) { f.sumT = 6; if (alive().filter(m => m.minion).length < 2) { const m = makeEnemy({ minion: true, wx: f.wx }); m.name = 'Minion ' + CNAME[m.kind]; enemies.unshift(m); f.wx += PX * 13; addFloat(f.wx, groundY() - PX * 18, 'MINION!', '#ff7ad9', 16, true); } } }
            if (f.timer <= 0) {
              if (run) { endRun(!(run.type === 'trial' || run.type === 'abyss' || run.type === 'rush' || run.type === 'dailyc')); f = null; }
              else {
                log(`<b>${f.name}</b> got bored and left. Farming floor ${S.floor}. Press <b>Fight boss</b> to try again.`, 'r');
                S.farm = true; S.kill = 0; farmLoops = 0; enemies = []; buildPips(); f = null;
              }
            }
          }
          if (f && !fainted && inRange(f) && !(freezeT > 0) && !(f.wind > 0)) { f.atkT -= dt; if (f.atkT <= 0) { f.atkT += f.int; monAttack(f); } }
        }
      } else hero.atkT = Math.min(hero.atkT, 0.15);
      f = front();
      if (f && !fainted) {
        if (st.petRate && onScreen(f)) { petT = Math.min(5, petT + dt * st.petRate); while (petT >= 1 && f && !f.dead) { petT -= 1; hit(f, st.tap * BAL.petHit, 'pet'); f = front(); } }
        f = front();
        const kL = st.al.knight, wL = st.al.wizard;
        if (kL && f) { allyT.knight -= dt; if (allyT.knight <= 0 && inRange(f)) { allyT.knight = 1.2; allyLunge.knight = 1; hit(f, st.dmg * BAL.knight * kL * allyMul('knight') * st.allyMult, 'ally'); } }
        f = front();
        if (wL && f) {
          allyT.wizard -= dt;
          if (allyT.wizard <= 0 && onScreen(f)) {
            allyT.wizard = 2.2; allyLunge.wizard = 1;
            fx.push({ type: 'fire', from: allySX('wizard'), to: sx(f.wx), life: 0.3 });
            tone(300, 150, 0.15, 'sawtooth', 0.03);
            const others = alive().filter(e => e !== f && onScreen(e));
            hit(f, st.dmg * BAL.wizard * wL * allyMul('wizard') * st.allyMult, 'ally');
            for (const e of others) hit(e, st.dmg * BAL.wizard * BAL.splash * wL * allyMul('wizard') * st.allyMult, 'ally');
          }
        }
      }
      f = front();
      xPets(dt);
      autoSkills();
    }
    petLunge = Math.max(0, petLunge - dt * 4);
    if (mode === 'main') {
      goblinT -= dt;
      if (!goblin && goblinT <= 0 && !fainted) { spawnGoblin(); goblinT = rand(70, 130); }
    }
    if (goblin) {
      goblin.x += goblin.vx * dt; goblin.flash = Math.max(0, goblin.flash - dt);
      if (goblin.x < -40) { goblin = null; log('The treasure goblin got away. Rude.'); }
    }
    for (const e of enemies) { e.flash = Math.max(0, e.flash - dt); e.lunge = Math.max(0, e.lunge - dt * 5); if (e.dead) e.deadT += dt; }
    if (!fainted) hero.hp = Math.min(st.maxHp, hero.hp + st.regen * dt);
    if (comboHold > 0) comboHold -= dt; else combo = Math.max(0, combo - 18 * dt);
    if (chest) {
      chest.life -= dt;
      if (chest.life <= 0 || sx(chest.wx) < -40) {
        if (S.allies.raccoon) openChest(0.5); else { chest = null; log('The chest wandered off. It had legs.'); }
      }
    }
    if (banner) { banner.life -= dt; if (banner.life <= 0) banner = null; }
    if (S.allies.bard && Math.random() < dt * 1.5) notes.push({ x: allySX('bard'), y: groundY() - PX * 9, life: 1.2, ch: pick(['♪', '♫']) });
    for (const n of notes) { n.y -= 30 * dt; n.x += Math.sin(t * 4 + n.y) * 0.4; n.life -= dt; }
    notes = notes.filter(n => n.life > 0);
    for (const f of floats) { f.y += f.vy * dt; f.vy *= 0.96; f.life -= dt * 1.1; }
    floats = floats.filter(f => f.life > 0);
    for (const p of parts) { p.wx += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; }
    parts = parts.filter(p => p.life > 0);
    for (const s of slashes) s.life -= dt;
    slashes = slashes.filter(s => s.life > 0);
    for (const f of fx) f.life -= dt;
    fx = fx.filter(f => f.life > 0);
    xUpdate(dt);
    updateAmbient(dt);
    gpsT += dt;
    if (gpsT >= 1) { S.gps = S.gps * 0.97 + (income / gpsT) * 0.03; income = 0; gpsT = 0; }
    slowT += dt;
    if (slowT >= 1) { slowT = 0; checkAch(); regenKeys(); if (S.set.autoclaim) S.quests.forEach((q, i) => { if (q.done) claimQuest(i); }); }
    autoT += dt;
    if (autoOn('autobuy') && autoT >= 0.5) { autoT = 0; buyCheapest(true); }
    while (dpsLog.length && dpsLog[0][0] < t - 5) dpsLog.shift();
  }

  /* ---------- ambient particles per area ---------- */
  function updateAmbient(dt) {
    const type = mode === 'run' ? 'sparkles' : theme(S.floor).fx;
    const want = S.set.particles && !reduceMotion ? 28 : 0;
    while (ambient.length < want) ambient.push(newAmb(type, true));
    if (ambient.length > want) ambient.length = want;
    for (let i = 0; i < ambient.length; i++) {
      const a = ambient[i];
      if (a.type !== type) { ambient[i] = newAmb(type, true); continue; }
      a.x += (a.vx - (hero.running ? RUN * 0.3 : 0)) * dt; a.y += a.vy * dt; a.life -= dt;
      if (a.life <= 0 || a.y > H || a.y < -10 || a.x < -10 || a.x > W + 10) ambient[i] = newAmb(type, false);
    }
  }
  function newAmb(type, anywhere) {
    const x = rand(0, W + 40), y = anywhere ? rand(0, H - 40) : (type === 'embers' || type === 'bubbles' || type === 'spores' ? H - 40 : -5);
    const A = { type, x, y, vx: 0, vy: 0, life: rand(3, 8), s: rand(1.5, 3) };
    if (type === 'snow') { A.vx = rand(-15, 5); A.vy = rand(20, 45); }
    else if (type === 'embers') { A.vx = rand(-10, 10); A.vy = rand(-40, -20); A.y = anywhere ? A.y : H - 40; }
    else if (type === 'bubbles') { A.vx = rand(-5, 5); A.vy = rand(-30, -15); A.s = rand(2, 5); }
    else if (type === 'spores') { A.vx = rand(-8, 8); A.vy = rand(-15, -5); }
    else if (type === 'sand') { A.vx = rand(-90, -50); A.vy = rand(-5, 5); A.y = rand(0, H - 40); A.x = anywhere ? A.x : W + 5; }
    else if (type === 'drip') { A.vx = 0; A.vy = rand(80, 140); A.s = 2; }
    else if (type === 'sparks') { A.vx = rand(-40, 40); A.vy = rand(20, 80); A.s = 2; }
    else if (type === 'sparkles') { A.vx = rand(-6, 6); A.vy = rand(-6, 6); }
    else { A.vx = rand(-8, 8); A.vy = rand(-4, 4); }
    return A;
  }
  const AMB_COL = { snow: 'rgba(240,248,255,.8)', embers: 'rgba(255,138,61,.85)', bubbles: 'rgba(160,240,230,.45)', spores: 'rgba(201,139,255,.6)', sand: 'rgba(224,181,106,.55)', drip: 'rgba(123,216,143,.5)', sparks: 'rgba(255,224,102,.9)', sparkles: 'rgba(255,255,255,.7)', dust: 'rgba(255,255,255,.18)' };

  /* ================= draw ================= */
  const ALLY_ORDER = ['knight', 'wizard', 'bard', 'raccoon', 'frog', 'crab'];
  function allySX(id) {
    const hired = ALLY_ORDER.filter(a => S.allies[a] > 0 && !(S.exped && S.exped.id === a));
    return heroSX() - PX * 8 - hired.indexOf(id) * allyGap();
  }
  function sprite(rows, cx, by, px, pal, flash, flip) {
    const h = rows.length, w = rows[0].length, x0 = cx - (w * px) / 2, y0 = by - h * px;
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
      const ch = rows[r][c]; if (ch === '.') continue;
      ctx.fillStyle = flash ? '#ffffff' : (pal[ch] || '#ff00ff');
      const cc = flip ? w - 1 - c : c;
      ctx.fillRect(Math.round(x0 + cc * px), Math.round(y0 + r * px), Math.ceil(px), Math.ceil(px));
    }
  }
  function monPal(m) {
    const d = '#1a1424', tint = m.tint, dk = mix(tint, '#000000', 0.45);
    const P = { a: tint, b: dk, c: '#ffffff', d, e: '#ffffff', w: '#f1ecff', t: '#ff9fb0', k: '#3a0f1a', f: '#f5b942', s: '#8a5a3c' };
    switch (m.kind) {
      case 'skeleton': return { c: m.elite ? '#ffe59a' : mix('#ece4cc', tint, 0.15), d };
      case 'mushroom': return Object.assign(P, { c: '#efe3cf' });
      case 'goblin': return Object.assign(P, { b: '#5b4636', e: '#fff6d0' });
      case 'ghost': return Object.assign(P, { a: mix(tint, '#ffffff', 0.5) });
      case 'rat': return Object.assign(P, { b: mix(tint, '#000000', 0.5), c: '#ff5d73' });
      case 'eyeball': return Object.assign(P, { a: m.elite ? '#fff3c4' : '#efe8f5', b: mix(tint, '#000000', 0.3), c: tint });
      case 'mummy': return { c: mix('#e8dcc0', tint, 0.15), b: '#a89878', d };
      case 'golem': return Object.assign(P, { a: mix(tint, '#000000', 0.5), b: tint, c: '#ffe066' });
      case 'yeti': return Object.assign(P, { a: mix('#f1ecff', tint, 0.2), b: mix(tint, '#5b4a7a', 0.4), e: d });
      case 'wisp': return Object.assign(P, { c: mix(tint, '#ffffff', 0.6) });
      case 'mimic': return Object.assign(P, { a: '#5b3a26', b: m.special ? tint : '#a8693e' });
      case 'robot': return Object.assign(P, { a: '#8a93a8', b: tint, c: '#62d2c4', e: '#ff5d73' });
      case 'cactus': return Object.assign(P, { a: mix(tint, '#5fbf5a', 0.6), b: d, e: '#c46a3c' });
      case 'snail': return Object.assign(P, { b: '#c4864a', c: '#f5d29a' });
      case 'penguin': return Object.assign(P, { a: mix('#2a2a3a', tint, 0.2), e: '#f5b942' });
      case 'imp': return Object.assign(P, { t: dk });
      case 'ogre': return Object.assign(P, { b: '#6b4a2f', e: '#fff6d0' });
      case 'dragon': return Object.assign(P, { c: '#ffe9a8', e: '#ff8a3d' });
      case 'bee': return Object.assign(P, { a: mix('#ffd166', tint, 0.25), b: '#2a2238' });
      case 'dknight': return Object.assign(P, { a: '#3a3048', b: mix(tint, '#3a3048', 0.5), c: '#ff5d73', e: '#c9d2ea' });
      case 'ninja': return Object.assign(P, { a: '#2a2238', b: tint, e: '#c9d2ea' });
      case 'clown': return Object.assign(P, { b: '#ff5d73', e: '#ff9a5a' });
      case 'lich': return { c: '#ece4cc', d: '#62d2c4', e: '#f5b942', b: mix('#3b2a5c', tint, 0.25), s: '#8a5a3c' };
      default: return P;
    }
  }
  function bar(x, y, w, frac, color, label) {
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(x - w / 2, y, w, 8);
    ctx.fillStyle = color; ctx.fillRect(x - w / 2 + 1, y + 1, Math.max(0, (w - 2) * clamp(frac, 0, 1)), 6);
    if (label) {
      ctx.fillStyle = '#f1ecff'; ctx.font = '600 13px "Pixelify Sans", monospace'; ctx.textAlign = 'center';
      const hw = ctx.measureText(label).width / 2 + 6;
      ctx.fillText(label, clamp(x, hw, W - hw), y - 6);
    }
  }

  function draw() {
    const th = theme(S.floor), gy = groundY(), off = hero.wx;
    const wall = mode === 'run' ? '#1a1530' : th.wall;
    ctx.save();
    if (shake) ctx.translate(rand(-shake, shake), rand(-shake, shake));
    ctx.fillStyle = wall; ctx.fillRect(-10, -10, W + 20, H + 20);
    if (th.disco && mode === 'main') {
      for (let i = 0; i < 6; i++) {
        const hx = ((i * 157 + t * 60) % (W + 200)) - 100;
        ctx.fillStyle = `hsla(${(t * 90 + i * 60) % 360},90%,60%,.10)`;
        ctx.beginPath(); ctx.moveTo(W / 2, -20); ctx.lineTo(hx - 40, H); ctx.lineTo(hx + 40, H); ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,.035)';
    const bw = 44, bh = 22, boff = (off * 0.6) % bw;
    for (let y = 0, row = 0; y < H - 40; y += bh, row++) for (let x = -bw - boff + (row % 2) * bw / 2; x < W + bw; x += bw) ctx.fillRect(x + 1, y + 1, bw - 3, bh - 3);
    const tsp = 360, toff = (off * 0.6) % tsp;
    const flameA = th.fx === 'snow' ? '#9fe3ff' : '#ff8a3d', flameB = th.fx === 'snow' ? '#e9fbff' : '#ffe066', glow = th.fx === 'snow' ? '159,227,255' : '255,170,70';
    for (let tx = -toff + 80; tx < W + 100; tx += tsp) {
      const fl = 0.8 + 0.2 * Math.sin(t * 13 + tx * 0.01) + 0.1 * Math.sin(t * 29);
      const g = ctx.createRadialGradient(tx, 50, 2, tx, 50, 90 * fl);
      g.addColorStop(0, `rgba(${glow},.35)`); g.addColorStop(1, `rgba(${glow},0)`);
      ctx.fillStyle = g; ctx.fillRect(tx - 100, -50, 200, 200);
      ctx.fillStyle = '#6b4a33'; ctx.fillRect(tx - 3, 54, 6, 22);
      ctx.fillStyle = flameA; ctx.fillRect(tx - 5, 42 - fl * 3, 10, 12 + fl * 3);
      ctx.fillStyle = flameB; ctx.fillRect(tx - 2, 46 - fl * 2, 4, 7);
    }
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-10, H - 40, W + 20, 50);
    ctx.fillStyle = 'rgba(255,255,255,.05)';
    const foff = off % 32;
    for (let x = -foff; x < W; x += 32) ctx.fillRect(x, H - 40, 30, 3);
    xDrawBack(gy, off);
    for (const a of ambient) {
      ctx.fillStyle = AMB_COL[a.type] || AMB_COL.dust;
      if (a.type === 'bubbles') { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(a.x, a.y, a.s, 0, 6.28); ctx.stroke(); }
      else if (a.type === 'drip') ctx.fillRect(a.x, a.y, 1.5, 5);
      else ctx.fillRect(a.x, a.y, a.s, a.s);
    }
    if (feverT > 0) { ctx.fillStyle = `rgba(245,185,66,${0.06 + 0.03 * Math.sin(t * 8)})`; ctx.fillRect(0, 0, W, H); }

    if (chest) {
      const cx = sx(chest.wx);
      const blink = chest.life < 1.5 && Math.floor(t * 8) % 2;
      const jump = Math.abs(Math.sin(t * 6)) * 6;
      if (!blink) sprite(SPR.chest, cx, gy - jump, PX * 0.9, { a: '#5b3a26', b: '#a8693e', e: '#f5b942' }, false);
      ctx.fillStyle = '#f5b942'; ctx.font = '600 12px "Pixelify Sans", monospace'; ctx.textAlign = 'center';
      ctx.fillText('TAP!', cx, gy - PX * 10 - jump);
    }

    const walkBob = k => hero.running ? Math.abs(Math.sin(t * 14 + k)) * 3 : Math.sin(t * 3 + k) * 1.2;
    ALLY_ORDER.forEach((id, k) => {
      if (!S.allies[id] || fainted || (S.exped && S.exped.id === id)) return;
      const ax = allySX(id) + (allyLunge[id] || 0) * (id === 'knight' ? 14 : 6);
      const apx = PX * 0.8;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(allySX(id), gy + 2, apx * 4, apx * 0.8, 0, 0, 6.28); ctx.fill();
      sprite(SPR[id], ax, gy - walkBob(k + 1), apx, ALLY_PAL[id], false, false);
    });
    xDrawPets(gy);
    ctx.font = '600 14px "Pixelify Sans", monospace'; ctx.textAlign = 'center';
    for (const n of notes) { ctx.globalAlpha = clamp(n.life, 0, 1); ctx.fillStyle = '#ffe066'; ctx.fillText(n.ch, n.x, n.y); }
    ctx.globalAlpha = 1;

    const hx0 = heroSX();
    const wlook = S.look && S.look.weapon >= 0 && S.eq.weapon.s[S.look.weapon] ? S.look.weapon : S.eq.weapon.on;
    const wcol = wlook >= 0 ? GRADES[Math.floor(wlook / 4)].c : '#e8eefc';
    const tunic = CLASSES[S.cls].tunic, ctier = clsTier();
    if (!fainted) {
      const f = front();
      const hx = hx0 + hero.lunge * 22 - (f && f.lunge ? f.lunge * 4 : 0);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(hx0, gy + 2, PX * 4, PX * 0.8, 0, 0, 6.28); ctx.fill();
      if (frenzyT > 0) { ctx.fillStyle = `rgba(232,57,77,${0.25 + 0.1 * Math.sin(t * 20)})`; ctx.beginPath(); ctx.arc(hx, gy - PX * 5, PX * 7, 0, 6.28); ctx.fill(); }
      if (S.wlv >= 5) { ctx.fillStyle = `rgba(255,154,90,${0.12 + 0.06 * Math.sin(t * 6)})`; ctx.beginPath(); ctx.arc(hx + PX * 4, gy - PX * 6, PX * 3, 0, 6.28); ctx.fill(); }
      if (ctier >= 2) { const g = ctx.createRadialGradient(hx, gy - PX * 5, 2, hx, gy - PX * 5, PX * 9); g.addColorStop(0, mix(tunic, '#ffffff', 0.3) + '88'); g.addColorStop(1, tunic + '00'); ctx.fillStyle = g; ctx.fillRect(hx - PX * 10, gy - PX * 15, PX * 20, PX * 20); }
      if (dev.god) { ctx.strokeStyle = 'rgba(255,224,102,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, gy - PX * 5, PX * 7, 0, 6.28); ctx.stroke(); }
      const rows = hero.running && Math.floor(t * 10) % 2 ? SPR.hero2 : SPR.hero;
      xDrawCape(hx, gy - walkBob(0));
      sprite(rows, hx, gy - walkBob(0), PX, { a: tunic, b: '#4a3b5c', c: '#62d2c4', d: '#1a1424', e: ctier ? '#f5b942' : '#c9cfe0', f: wcol, g: '#f2c9a0' }, hero.flash > 0);
      xDrawCosmetics(hx, gy - walkBob(0));
    } else {
      ctx.save(); ctx.translate(hx0, gy - PX * 2); ctx.rotate(-Math.PI / 2);
      sprite(SPR.hero, 0, PX * 5, PX, { a: mix(tunic, '#000000', 0.4), b: '#3a3048', c: '#2a2238', d: '#1a1424', e: '#8a8fa0', f: '#a9aec0', g: '#b89880' }, false);
      ctx.restore();
      ctx.fillStyle = '#f1ecff'; ctx.font = '600 15px "Pixelify Sans", monospace'; ctx.textAlign = 'center';
      ctx.fillText('z z z', hx0 + 20, gy - PX * 7 - Math.sin(t * 3) * 4);
    }
    bar(hx0, gy - PX * 10 - 14, PX * 10, hero.hp / st.maxHp, hero.hp / st.maxHp < 0.3 ? '#ff5d73' : '#62d2c4', 'You');

    let labeled = false;
    const fr = front();
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i], ex = sx(e.wx);
      if (ex > W + 120) continue;
      const rows = SPR[e.kind], sh = rows.length;
      const sc = e.scale;
      const px = PX * sc * (e.dead ? Math.max(0, 1 - e.deadT * 3) : 1);
      const walking = !e.dead && !inRange(e);
      const fl = FLOATY[e.kind];
      const bob = fl ? Math.sin(t * (e.kind === 'bat' ? 8 : 3) + e.ph) * 4 : walking ? Math.abs(Math.sin(t * (e.variant === 'speedy' ? 16 : 9) + e.ph)) * 4 : Math.sin(t * 3 + e.ph) * 1.5;
      const lift = fl ? PX * 3 : 0;
      const exx = ex - e.lunge * 18;
      const topY = gy - lift - bob - sh * px;
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(ex, gy + 2, PX * 4 * sc, PX * 0.8, 0, 0, 6.28); ctx.fill();
      if (e.elite && !e.dead) {
        const g = ctx.createRadialGradient(ex, gy - lift - PX * 5, 2, ex, gy - lift - PX * 5, PX * 9);
        g.addColorStop(0, 'rgba(255,215,106,.45)'); g.addColorStop(1, 'rgba(255,215,106,0)');
        ctx.fillStyle = g; ctx.fillRect(ex - PX * 10, gy - lift - PX * 15, PX * 20, PX * 20);
        if (Math.random() < 0.3) parts.push({ wx: e.wx + rand(-PX * 5, PX * 5), y: gy - lift - rand(0, PX * 10), vx: 0, vy: -30, life: 0.5, max: 0.5, color: '#fff3c4', size: 2 });
      }
      if (e.variant === 'speedy' && walking) { ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 3; k++) ctx.fillRect(ex + PX * 6 + k * 6, topY + PX * (3 + k * 2), 12, 2); }
      if (e.kind === 'ghost' || e.variant === 'ghostly') ctx.globalAlpha = e.variant === 'ghostly' ? 0.5 : 0.8;
      const flashOn = e.flash > 0 || (e.variant === 'explosive' && e.hp < e.max * 0.4 && Math.floor(t * 10) % 2);
      if (px > 0.3) {
        sprite(rows, exx, gy - lift - bob, px, flashOn && e.variant === 'explosive' && !(e.flash > 0) ? Object.assign({}, monPal(e), { a: '#ff8a3d' }) : monPal(e), e.flash > 0, true);
        if (e.boss && !BIG[e.kind] && !e.special) {
          const cy = topY - px * 2.2;
          ctx.fillStyle = '#f5b942';
          ctx.fillRect(exx - px * 3, cy + px, px * 6, px * 1.2);
          for (const k of [-3, -0.5, 2]) ctx.fillRect(exx + k * px, cy - px * 0.4, px, px * 1.6);
        }
        if (e.variant === 'armored') { ctx.fillStyle = '#c9d2ea'; ctx.fillRect(exx - px * 3, topY + px * 0.2, px * 6, px * 1.2); }
      }
      ctx.globalAlpha = 1;
      if (e.shield > 0 && !e.dead) { ctx.strokeStyle = `rgba(111,214,255,${0.5 + 0.3 * Math.sin(t * 20)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ex, gy - sh * px / 2 - lift, sh * px * 0.7, 0, 6.28); ctx.stroke(); }
      if (e.enraged && !e.dead) { ctx.fillStyle = 'rgba(255,60,80,.15)'; ctx.beginPath(); ctx.arc(ex, gy - sh * px / 2 - lift, sh * px * 0.7, 0, 6.28); ctx.fill(); }
      if (!e.dead) {
        const top = topY - (e.boss && !BIG[e.kind] ? PX * 3 : 0) - 14;
        const isFront = e === fr;
        const barW = e.special ? Math.min(W * 0.45, 180) : Math.min(W * 0.3, PX * 10 * sc + 10);
        bar(ex, top, barW, e.hp / e.max, e.special ? '#6fd6ff' : e.boss ? '#ff5d73' : e.elite ? '#ffd76a' : e.variant ? '#ff9a5a' : '#f5b942', isFront && !labeled ? e.name + (e.special && run && run.type !== 'trial' ? ` · bar ${run.tier + 1}` : '') : '');
        if (e.boss && inRange(e)) {
          ctx.font = '700 14px "Pixelify Sans", monospace'; ctx.textAlign = 'center';
          ctx.fillStyle = e.timer < 8 ? '#ff5d73' : '#f1ecff';
          ctx.fillText(mmss(Math.max(0, Math.ceil(e.timer))), clamp(ex, 30, W - 30), top - 22);
        }
        if (isFront) labeled = true;
      }
    }

    if (goblin) {
      const bob = Math.abs(Math.sin(t * 16)) * 5;
      sprite(SPR.tgoblin, goblin.x, goblin.y - bob, PX * 0.85, { a: '#a6d35a', b: '#6b4a2f', c: '#ffffff', d: '#1a1424', e: '#f5b942' }, goblin.flash > 0, false);
      ctx.font = '700 12px "Pixelify Sans", monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#f5b942';
      ctx.fillText(`TAP ×${goblin.hits}`, clamp(goblin.x, 30, W - 30), goblin.y - PX * 10);
    }

    for (const f of fx) {
      if (f.type === 'spin') {
        const k = 1 - f.life / 0.45;
        ctx.strokeStyle = `rgba(255,122,217,${1 - k})`; ctx.lineWidth = 6 * (1 - k) + 2;
        ctx.beginPath(); ctx.arc(hx0 + PX * 6, gy - PX * 5, PX * 8 + k * W * 0.6, -0.9, 0.9); ctx.stroke();
      } else if (f.type === 'bolt') {
        const bx = sx(f.wx);
        ctx.strokeStyle = `rgba(255,224,102,${f.life / 0.35})`; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(bx + 10, 0);
        for (let y = 0; y < gy; y += 24) ctx.lineTo(bx + (Math.random() - 0.5) * 22, y);
        ctx.lineTo(bx, gy - PX * 4); ctx.stroke();
      } else if (f.type === 'fire') {
        const k = 1 - f.life / 0.3;
        const x = f.from + (f.to - f.from) * k, y = gy - PX * 8 - Math.sin(k * Math.PI) * PX * 6;
        ctx.fillStyle = 'rgba(255,138,61,.4)'; ctx.beginPath(); ctx.arc(x, y, PX * 2.4, 0, 6.28); ctx.fill();
        ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(x, y, PX * 1.2, 0, 6.28); ctx.fill();
      }
    }
    for (const s of slashes) {
      const k = s.life / 0.25;
      ctx.strokeStyle = `rgba(255,122,217,${k})`; ctx.lineWidth = 3 * k + 1;
      ctx.beginPath(); ctx.moveTo(s.x - Math.cos(s.a) * 22, s.y - Math.sin(s.a) * 22); ctx.lineTo(s.x + Math.cos(s.a) * 22, s.y + Math.sin(s.a) * 22); ctx.stroke();
    }
    for (const p of parts) { ctx.globalAlpha = p.life / p.max; ctx.fillStyle = p.color; ctx.fillRect(sx(p.wx), p.y, p.size, p.size); }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    for (const f of floats) {
      const fxp = sx(f.wx);
      ctx.globalAlpha = clamp(f.life * 1.5, 0, 1);
      ctx.font = `700 ${f.size}px "Pixelify Sans", monospace`;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillText(f.text, fxp + 1.5, f.y + 1.5);
      ctx.fillStyle = f.color; ctx.fillText(f.text, fxp, f.y);
    }
    ctx.globalAlpha = 1;
    xDrawFront(gy);
    ctx.restore();

    if (combo >= 1) {
      const c = Math.floor(combo), k = clamp(comboHold / st.hold, 0, 1);
      ctx.textAlign = 'left';
      ctx.font = `700 ${20 + Math.min(14, c / 4)}px "Pixelify Sans", monospace`;
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillText(`${c} COMBO`, 15, 31);
      ctx.fillStyle = '#ff7ad9'; ctx.fillText(`${c} COMBO`, 14, 30);
      ctx.font = '600 13px "Pixelify Sans", monospace'; ctx.fillStyle = '#f1ecff';
      ctx.fillText(`×${comboMult().toFixed(2)} damage`, 14, 48);
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(14, 56, 90, 4);
      ctx.fillStyle = '#ff7ad9'; ctx.fillRect(14, 56, 90 * k, 4);
    }
    ctx.textAlign = 'right'; ctx.font = '600 13px "Pixelify Sans", monospace';
    let by = 24;
    if (run) { ctx.fillStyle = '#6fd6ff'; ctx.fillText(runLabel(), W - 12, by); by += 18; }
    if (feverT > 0) { ctx.fillStyle = '#f5b942'; ctx.fillText(`GOLD FEVER ${Math.ceil(feverT)}s`, W - 12, by); by += 18; }
    if (frenzyT > 0) { ctx.fillStyle = '#ff5d73'; ctx.fillText(`FRENZY ${Math.ceil(frenzyT)}s`, W - 12, by); by += 18; }
    if (S.farm && mode === 'main') { ctx.fillStyle = '#a99fc2'; ctx.fillText(S.set.autoboss ? `FARMING · auto boss in ${3 - farmLoops} loops` : 'FARMING', W - 12, by); by += 18; }
    if (dev.speed > 1) { ctx.fillStyle = '#ff5d73'; ctx.fillText(`DEV SPEED ×${dev.speed}`, W - 12, by); }
    if (banner) {
      const a = clamp(banner.life * 2, 0, 1);
      ctx.globalAlpha = a; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(10,8,16,.6)'; ctx.fillRect(0, H * 0.3 - 30, W, 58);
      ctx.font = '700 26px "Pixelify Sans", monospace'; ctx.fillStyle = '#f5b942'; ctx.fillText(banner.text, W / 2, H * 0.3);
      ctx.font = '600 14px "Nunito", sans-serif'; ctx.fillStyle = '#f1ecff';
      let sub = banner.sub; while (ctx.measureText(sub).width > W - 24 && sub.length > 10) sub = sub.slice(0, -2);
      ctx.fillText(sub === banner.sub ? sub : sub + '…', W / 2, H * 0.3 + 20);
      ctx.globalAlpha = 1;
    }
    drawEventOverlay();
    xDrawOverlay();
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    PX = clamp(W / 85, 4, 6.2);
  }

  /* ================= UI ================= */
  function spriteURL(rows, pal, cell) {
    const c = document.createElement('canvas'); c.width = rows[0].length * cell; c.height = rows.length * cell;
    const x = c.getContext('2d');
    rows.forEach((row, r) => { for (let k = 0; k < row.length; k++) { const ch = row[k]; if (ch === '.') continue; x.fillStyle = pal[ch] || '#ff00ff'; x.fillRect(k * cell, r * cell, cell, cell); } });
    return c.toDataURL();
  }
  const iconURL = (id, pal) => spriteURL(ICON[id], pal || ICON_PAL[id], 4);
  function holdable(btn, fn) {
    let tmr = null, delay = 0;
    const stop = () => { clearTimeout(tmr); tmr = null; btn.classList.remove('held'); };
    btn.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault(); stop();
      fn(); delay = 380; btn.classList.add('held');
      const step = () => { fn(); delay = Math.max(30, delay * 0.8); tmr = setTimeout(step, delay); };
      tmr = setTimeout(step, delay);
    });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel', 'lostpointercapture']) btn.addEventListener(ev, stop);
    window.addEventListener('blur', stop);
    btn.addEventListener('contextmenu', e => e.preventDefault());
    btn.addEventListener('click', e => { if (e.detail === 0) fn(); });
  }
  function makeRow(box, icon, onClick, btnClass, hold) {
    const el = document.createElement('div'); el.className = 'part';
    el.innerHTML = `<img alt="" src="${icon}"><div style="min-width:0"><div class="pname"><span class="nm"></span><span class="lv"></span></div><div class="pfx"></div></div><button class="buy ${btnClass || ''}" type="button"><span class="bn"></span><span class="bc"></span></button>`;
    box.appendChild(el);
    const r = { el, img: el.querySelector('img'), nm: el.querySelector('.nm'), lv: el.querySelector('.lv'), fx: el.querySelector('.pfx'), btn: el.querySelector('.buy'), bn: el.querySelector('.bn'), bc: el.querySelector('.bc') };
    if (hold) holdable(r.btn, onClick); else r.btn.addEventListener('click', onClick);
    return r;
  }
  function setRow(r, o) {
    setText(r.nm, o.name); setText(r.lv, o.lv); setHTML(r.fx, o.fx); setText(r.bn, o.bn); setText(r.bc, o.bc);
    r.btn.classList.toggle('ok', !!o.ok); r.btn.setAttribute('aria-disabled', String(!o.ok));
    r.img.style.opacity = o.dim ? '.3' : '';
  }

  const costOf = (base, r, L, n) => base * Math.pow(r, L) * (Math.pow(r, n) - 1) / (r - 1) * (1 - 0.02 * tal('f4')) * (1 - 0.03 * ls('cheap'));
  const maxBuy = (base, r, L) => Math.max(0, Math.floor(Math.log(S.gold * (r - 1) / (base * Math.pow(r, L)) + 1) / Math.log(r)));
  const amountFor = p => Math.max(1, Math.min(pcap(p.id) - S.lv[p.id], S.amt === 'max' ? Math.max(1, maxBuy(p.base, p.r, S.lv[p.id])) : +S.amt));
  const atCap = p => S.lv[p.id] >= pcap(p.id);
  const pevoCost = p => ({ gold: costOf(p.base, p.r, S.lv[p.id], 1) * 25, shards: 20 * Math.pow(ptier(p.id) + 1, 2) });
  function evolvePart(p) {
    if (!atCap(p)) return false;
    const c = pevoCost(p);
    if (S.gold < c.gold || S.shards < c.shards) return false;
    S.gold -= c.gold; S.shards -= c.shards;
    S.pevo[p.id] = ptier(p.id) + 1;
    const oldMax = st.maxHp; recalc(); if (st.maxHp > oldMax) hero.hp += st.maxHp - oldMax;
    log(`<b>${PART_NAMES[p.id][ptier(p.id) - 1]}</b> evolved into <b>${PART_NAMES[p.id][ptier(p.id)]}</b>! (${PEVO_FX[p.id]})`, 'p');
    banner = { text: 'EVOLVED!', sub: PART_NAMES[p.id][ptier(p.id)], life: 2.2 };
    jingle(); shakeIt(6); burst(hero.wx, groundY() - PX * 5, '#b98cff', 30, 200);
    save(); return true;
  }
  function buyPart(p, n) {
    if (atCap(p)) return false;
    n = Math.min(n, pcap(p.id) - S.lv[p.id]);
    const cost = costOf(p.base, p.r, S.lv[p.id], n);
    if (S.gold < cost) return false;
    const oldMax = st.maxHp;
    S.gold -= cost; S.lv[p.id] += n; recalc();
    if (st.maxHp > oldMax) hero.hp += st.maxHp - oldMax;
    return true;
  }
  function buyCheapest(silent) {
    let bought = 0;
    for (const p of PARTS) if (atCap(p) && evolvePart(p)) bought++;
    for (let k = 0; k < 40; k++) {
      let best = null, bc = Infinity;
      for (const p of PARTS) { if (atCap(p)) continue; const c = costOf(p.base, p.r, S.lv[p.id], 1) * focusW(p); if (c < bc) { bc = c; best = p; } }
      if (!best || !buyPart(best, 1)) { if (best && focusW(best) > 1) break; break; }
      bought++;
    }
    if (bought && !silent) tone(523, 784, 0.1, 'triangle', 0.05);
    return bought;
  }

  const pevoRows = {};
  const partRows = {}, skRows = {}, allyRows = {}, gemRows = {}, dungRows = {}, questEls = [], enchEls = [];
  const skillCost = s => s.base * Math.pow(s.r, S.sk[s.id] - 1);
  const allyCost = a => a.base * Math.pow(a.r, S.allies[a.id]);
  const LIFE = [['kills', 'Monsters'], ['bosses', 'Bosses'], ['elites', 'Shiny ones'], ['variants', 'Special ones'], ['chests', 'Chests'], ['goblins', 'Goblins'], ['taps', 'Taps'], ['bestCombo', 'Best combo'], ['skills', 'Skills cast'], ['deaths', 'Naps taken'], ['dungeons', 'Dungeon runs'], ['trials', 'Trials'], ['enchants', 'Rerolls'], ['goldEarned', 'Gold earned'], ['quests', 'Quests'], ['time', 'Time played']];
  function buildLists() {
    for (const p of PARTS) partRows[p.id] = makeRow($('#parts'), iconURL(p.id), () => { audio(); if (atCap(p)) { evolvePart(p); return; } if (buyPart(p, amountFor(p))) { tone(523, 784, 0.1, 'triangle', 0.05); save(); } }, '', true);
    for (const p of PARTS) pevoRows[p.id] = makeRow($('#pevoList'), iconURL(p.id), () => { audio(); evolvePart(p); }, 'evo');
    for (const s of SKILLS) skRows[s.id] = makeRow($('#skillList'), iconURL(s.id), () => {
      audio();
      if (s.gacha !== undefined) { gachaLevel(s); return; }
      const c = skillCost(s);
      if (!unlocked(s) || S.gold < c) return;
      S.gold -= c; S.sk[s.id]++; tone(659, 988, 0.12, 'triangle', 0.05); save();
    }, '', true);
    for (const a of ALLIES) allyRows[a.id] = makeRow($('#allyList'), spriteURL(SPR[a.id], ALLY_PAL[a.id], 4), () => {
      audio();
      const c = allyCost(a);
      if (S.deepest < a.unlock || S.gold < c || S.chal === 'noally') return;
      const first = !S.allies[a.id];
      S.gold -= c; S.allies[a.id]++; recalc();
      if (S.allies[a.id] === 10 || S.allies[a.id] === 25) { log(`${ALLY_EVO[a.id][allyTier(a.id) - 1]} evolved into <b>${allyName(a)}</b>! Much stronger.`, 'p'); jingle(); }
      if (first) { log(`<b>${a.name}</b> joined your party!`, 'c'); jingle(); } else tone(659, 988, 0.12, 'triangle', 0.05);
      save();
    }, '', true);
    for (const g of GEMSHOP) gemRows[g.id] = makeRow($('#gemList'), iconURL(g.icon, g.pal && ICON_PAL[g.pal]), () => buyGem(g), 'gemb');
    for (const d of DUNGEONS) {
      const el = document.createElement('div'); el.className = 'dung';
      el.innerHTML = `<img alt="" src="${spriteURL(SPR[d.kind], monPal({ kind: d.kind, tint: d.tint, special: true }), 4)}"><div style="min-width:0"><div class="pname">${d.name} <span class="keys"></span></div><div class="pfx">${d.text}</div></div><button class="buy" type="button"><span class="bn">Enter</span><span class="bc"></span></button>`;
      $('#dungList').appendChild(el);
      const r = { keys: el.querySelector('.keys'), btn: el.querySelector('.buy'), bc: el.querySelector('.bc') };
      r.btn.addEventListener('click', () => startRun(d.id));
      dungRows[d.id] = r;
    }
    const qb = $('#questList');
    for (let i = 0; i < 3; i++) {
      const el = document.createElement('div'); el.className = 'quest';
      el.innerHTML = `<div class="qt"></div><button class="buy claim" type="button"><span class="bn">Claim</span><span class="bc"></span></button><div class="qbar"><i></i></div><div class="qr"></div>`;
      qb.appendChild(el);
      const q = { el, qt: el.querySelector('.qt'), bar: el.querySelector('.qbar i'), qr: el.querySelector('.qr'), btn: el.querySelector('.buy'), bc: el.querySelector('.bc') };
      q.btn.addEventListener('click', () => { audio(); claimQuest(i); });
      questEls.push(q);
    }
    for (let i = 0; i < 3; i++) {
      const el = document.createElement('div'); el.className = 'ench';
      el.innerHTML = `<div><div class="tn"></div><div class="ev"></div></div><button class="lock" type="button" aria-pressed="false">Lock</button>`;
      $('#enchList').appendChild(el);
      const r = { el, tn: el.querySelector('.tn'), ev: el.querySelector('.ev'), lock: el.querySelector('.lock') };
      r.lock.addEventListener('click', () => { if (i >= enchLines() || !S.ench[i]) return; S.locks[i] = !S.locks[i]; save(); renderForge(); });
      enchEls.push(r);
    }
    $('#lifestats').innerHTML = LIFE.map(([k, l]) => `<div><span class="lbl">${l}</span><b id="life-${k}">0</b></div>`).join('');
  }

  function renderTrain() {
    for (const p of PARTS) {
      const L = S.lv[p.id], tier = ptier(p.id), nm = PART_NAMES[p.id][tier];
      if (atCap(p)) {
        const c = pevoCost(p);
        setRow(partRows[p.id], { name: nm, lv: `Lv ${L} · max`, fx: `Ready to evolve into <b style="color:var(--gem)">${PART_NAMES[p.id][tier + 1]}</b> (${PEVO_FX[p.id]}). Costs ${fmt(c.gold)} gold and ${c.shards} shards.`, bn: 'Evolve', bc: `${fmt(c.gold)}g`, ok: S.gold >= c.gold && S.shards >= c.shards });
        partRows[p.id].btn.classList.add('evo');
        continue;
      }
      partRows[p.id].btn.classList.remove('evo');
      const n = amountFor(p), cost = costOf(p.base, p.r, L, n);
      const nextMile = (Math.floor(L / 25) + 1) * 25;
      const extra = ['sword', 'armor'].includes(p.id) ? (nextMile >= pcap(p.id) ? ` · evolves at ${pcap(p.id)}` : ` · ×${BAL.mile} at ${nextMile}`) : (pcap(p.id) < Infinity ? ` · evolves at ${pcap(p.id)}` : '');
      setRow(partRows[p.id], { name: nm + (tier ? ' ' + '★'.repeat(tier) : ''), lv: 'Lv ' + L + extra, fx: p.fx(st, stats(Object.assign({}, S.lv, { [p.id]: L + n }))), bn: 'Buy ×' + n + (L + n >= pcap(p.id) ? ' (cap)' : '') + (S.gold < cost && S.gps > 0 ? ' · ' + dur((cost - S.gold) / S.gps) : ''), bc: fmt(Math.ceil(cost)) + 'g', ok: S.gold >= cost });
    }
    const ab = $('#autobuyBtn'); setText(ab, S.set.autobuy ? 'Auto-buy: on' : 'Auto-buy: off'); ab.setAttribute('aria-pressed', String(S.set.autobuy));
  }
  function renderForge() {
    const wi = S.eq.weapon.on, G = wi >= 0 ? GRADES[Math.floor(wi / 4)] : null, wc = $('#weapon');
    wc.style.setProperty('--rc', G ? G.c : '');
    setHTML(wc, `<img alt="" src="${wi >= 0 ? eqIcon('weapon', wi) : iconURL('sword')}"><div style="min-width:0"><div class="lbl">Equipped weapon${S.wlv ? ' +' + S.wlv : ''}</div><div class="wn">${S.prefix.pre} ${wi >= 0 ? EQ.weapon.names[wi] : 'Stick'}</div><div class="wr">${wi >= 0 ? `${G.n} ${TIERN[wi % 4]} · ×${fmt2(eqEquip('weapon'))} piece × ${(S.prefix.pm || 1).toFixed(2)} prefix × ${(1 + 0.12 * S.wlv).toFixed(2)} forge` : 'No weapon yet. Summon one in Equip.'} The forge upgrades the weapon slot, so it carries over when you swap weapons or retire.</div></div>`);
    setText($('#wlvLbl'), `Weapon +${S.wlv}`);
    setText($('#forgeText'), `Enhance: +12% weapon power per level. Next costs ${enhCost()} shards, ${pct(enhChance())} success. Reforge rolls a new prefix (from Rusty ×0.85 to Mythic ×1.50) for ${reforgeCost()} runes. Current prefix: ${S.prefix.pre} ×${(S.prefix.pm || 1).toFixed(2)}.`);
    const eb = $('#enhanceBtn'), rb = $('#reforgeBtn'), xb = $('#rerollBtn');
    eb.textContent = `Enhance (${enhCost()} shards)`; eb.classList.toggle('ok', S.shards >= enhCost());
    rb.textContent = `Reforge prefix (${reforgeCost()} runes)`; rb.classList.toggle('ok', S.runes >= reforgeCost());
    const lines = enchLines(), allLocked = S.locks.slice(0, lines).every((l, i) => l && S.ench[i]);
    xb.textContent = `Reroll enchants (${enchCost()} runes)`; xb.classList.toggle('ok', S.runes >= enchCost() && !allLocked);
    setText($('#enchHint'), lines < 3 ? `Line ${lines + 1} opens at floor ${lines === 1 ? 15 : 30}.` : 'Each lock adds 6 runes to the cost.');
    enchEls.forEach((r, i) => {
      const e = S.ench[i], open = i < lines;
      r.el.classList.toggle('off', !open);
      if (!open) { setText(r.tn, 'Locked line'); setText(r.ev, `Reach floor ${i === 1 ? 15 : 30}`); r.el.style.removeProperty('--tc'); }
      else if (!e) { setText(r.tn, 'Empty'); setText(r.ev, 'Reroll to add an enchant'); r.el.style.removeProperty('--tc'); }
      else { const T = ENCH_TIERS[e.t], s = ENCH_STATS.find(x => x.id === e.s); setText(r.tn, T.n); setText(r.ev, `+${e.v}% ${s.name}`); r.el.style.setProperty('--tc', T.c); }
      r.lock.setAttribute('aria-pressed', String(!!S.locks[i] && open && !!e));
      setText(r.lock, S.locks[i] && open && e ? 'Locked' : 'Lock');
    });
  }
  const evoReady = () => { const T = clsTier(), r = EVO_REQ[T + 1]; return !!r && S.deepest >= r.deep && S.rank >= r.rank && S.gems >= r.gems && S.runes >= r.runes; };
  function evolveClass(path) {
    audio();
    const T = clsTier(), r = EVO_REQ[T + 1];
    if (!r || !evoReady()) return;
    S.gems -= r.gems; S.runes -= r.runes;
    S.evo[S.cls] = T + 1; S.evoPath[S.cls] = (pathOf(S.cls) + 'AAA').slice(0, T) + (path || 'A'); recalc(); hero.hp = st.maxHp;
    log(`Your ${CLASS_EVO[S.cls].names[T]} evolved into a <b>${clsName()}</b>! ${clsText()}.`, 'p');
    banner = { text: 'CLASS EVOLVED', sub: clsName(), life: 2.6 };
    jingle(); tone(1046, 2093, 0.4, 'sine', 0.05, 0.3); shakeIt(8); burst(hero.wx, groundY() - PX * 5, CLASSES[S.cls].tunic, 40, 240);
    save();
  }
  function renderHero() {
    const T = clsTier();
    setHTML($('#clsCard'), `<img alt="" src="${heroIcon(S.cls)}"><div style="min-width:0"><div class="lbl">Your class · ${RANKS[S.rank].n} rank</div><div class="wn">${clsName()} <span class="stars">${'★'.repeat(T)}</span></div><div class="wr">${clsText()}</div></div>`);
    setHTML($('#evoChain'), CLASS_EVO[S.cls].names.map((n, i) => `<div class="evo${i <= T ? ' on' : i === T + 1 ? ' next' : ''}"><img alt="" src="${heroIcon(S.cls, i)}"><b>${n}</b><span>${CLASS_EVO[S.cls].text(i)}</span>${i > 0 ? `<span>${i <= T ? 'Unlocked' : `Floor ${EVO_REQ[i].deep}, ${RANKS[EVO_REQ[i].rank].n} rank`}</span>` : ''}</div>`).join(''));
    const r = EVO_REQ[T + 1], btn = $('#evoBtn');
    if (!r) { setText($('#evoText'), `Fully evolved. Your ${clsName()} is as strong as a class gets.`); btn.hidden = true; }
    else {
      btn.hidden = false;
      const need = [];
      if (S.deepest < r.deep) need.push(`reach floor ${r.deep} (deepest ${S.deepest})`);
      if (S.rank < r.rank) need.push(`reach ${RANKS[r.rank].n} rank`);
      setText($('#evoText'), need.length ? `To evolve into ${CLASS_EVO[S.cls].names[T + 1]}: ${need.join(' and ')}. Then it costs ${r.gems} gems and ${r.runes} runes.` : `Ready! Evolving into ${CLASS_EVO[S.cls].names[T + 1]} costs ${r.gems} gems and ${r.runes} runes.`);
      const ok = evoReady();
      btn.classList.toggle('ok', ok); btn.disabled = !ok;
      setText(btn, `Evolve into ${CLASS_EVO[S.cls].names[T + 1]} (${r.gems} gems, ${r.runes} runes)`);
    }
    setHTML($('#allCls'), Object.keys(CLASSES).map(c => `<div class="${c === S.cls ? 'cur' : ''}"><img alt="" src="${heroIcon(c)}"><span><b>${clsName(c)} <span class="stars">${'★'.repeat(clsTier(c))}</span></b>${clsText(c)}</span></div>`).join(''));
    for (const p of PARTS) {
      const tier = ptier(p.id), cap = pcap(p.id), L = S.lv[p.id], c = pevoCost(p);
      setRow(pevoRows[p.id], {
        name: PART_NAMES[p.id][tier] + (tier ? ' ' + '★'.repeat(tier) : ''), lv: `Lv ${L}`,
        fx: tier >= PEVO_AT.length ? 'Fully evolved.' : `Next: <b>${PART_NAMES[p.id][tier + 1]}</b> at level ${cap} (${PEVO_FX[p.id]}).`,
        bn: atCap(p) ? 'Evolve' : `Lv ${cap}`, bc: atCap(p) ? `${c.shards} shards` : `${Math.max(0, cap - L)} to go`, ok: atCap(p) && S.gold >= c.gold && S.shards >= c.shards
      });
    }
  }
  const heroIconCache = {};
  function heroIcon(cls, tier) {
    tier = tier === undefined ? clsTier(cls) : tier;
    const k = cls + tier;
    if (!heroIconCache[k]) heroIconCache[k] = spriteURL(SPR.hero, { a: CLASSES[cls].tunic, b: '#4a3b5c', c: tier >= 2 ? '#ffe066' : '#62d2c4', d: '#1a1424', e: tier ? '#f5b942' : '#c9cfe0', f: '#e8eefc', g: '#f2c9a0' }, 4);
    return heroIconCache[k];
  }
  function renderSkills() {
    renderSkillSummon();
    for (const s of SKILLS) {
      if (s.gacha !== undefined) { renderGachaRow(s); continue; }
      const L = S.sk[s.id], open = unlocked(s), cost = skillCost(s);
      setRow(skRows[s.id], {
        name: s.name, lv: open ? 'Lv ' + L : 'Locked', dim: !open,
        fx: open ? `${s.fx(L)}. Every ${Math.round(s.cd * st.cdMult)}s. <span class="up">Next level: ${s.fx(L + 1).toLowerCase()}</span>` : `Reach floor ${s.unlock} to unlock. ${s.fx(L)}.`,
        bn: open ? 'Level up' : 'Floor ' + s.unlock, bc: open ? fmt(Math.ceil(cost)) + 'g' : '—', ok: open && S.gold >= cost
      });
    }
  }
  function renderAllies() {
    for (const a of ALLIES) {
      const L = S.allies[a.id], open = S.deepest >= a.unlock, cost = allyCost(a);
      setRow(allyRows[a.id], {
        name: allyName(a) + (allyTier(a.id) ? ' ' + '★'.repeat(allyTier(a.id)) : ''), lv: S.exped && S.exped.id === a.id ? 'On expedition' : L ? 'Lv ' + L + (L < 25 ? ` · evolves at ${L < 10 ? 10 : 25}` : '') : open ? 'Not hired' : 'Locked', dim: !open,
        fx: !open ? `Reach floor ${a.unlock} to meet them. ${ALLY_BLURB[a.id]}.` : L ? `${a.fx(L)}. <span class="up">Next: ${a.fx(L + 1).toLowerCase()}</span>` : `${ALLY_BLURB[a.id]}. <span class="up">${a.fx(1)}</span>`,
        bn: !open ? 'Floor ' + a.unlock : L ? 'Level up' : 'Hire', bc: open ? fmt(Math.ceil(cost)) + 'g' : '—', ok: open && S.gold >= cost
      });
    }
  }
  function renderTrials() {
    setHTML($('#ranks'), RANKS.map((r, i) => `<span class="rk${i <= S.rank ? ' on' : i === S.rank + 1 ? ' next' : ''}" title="Needs floor ${r.need}">${r.n}</span>`).join(''));
    setText($('#rankLbl'), `${RANKS[S.rank].n} · ×${Math.pow(BAL.rankDmg, S.rank).toFixed(2)} damage`);
    const next = RANKS[S.rank + 1], tb = $('#trialText'), btn = $('#trialBtn');
    if (!next) { setText(tb, 'You hold the highest rank. Legend.'); btn.disabled = true; btn.classList.remove('ok'); }
    else {
      const ready = S.deepest >= next.need;
      setText(tb, ready ? `The ${next.n} Examiner is waiting. You have 40 seconds to beat it. It's free, and you can retry as often as you like.` : `Reach floor ${next.need} to unlock the ${next.n} trial (deepest so far: ${S.deepest}).`);
      btn.disabled = !ready || mode !== 'main' || fainted > 0; btn.classList.toggle('ok', !btn.disabled);
      setText(btn, mode === 'run' ? 'Run in progress' : `Start ${next.n} trial`);
    }
    for (const d of DUNGEONS) {
      const r = dungRows[d.id], k = S.keys[d.id];
      setText(r.keys, `· ${k}/${keyMax(d.id)} key${keyMax(d.id) > 1 ? 's' : ''}`);
      const ok = k > 0 && mode === 'main' && !fainted && S.deepest >= 5;
      r.btn.classList.toggle('ok', ok); r.btn.setAttribute('aria-disabled', String(!ok));
      setText(r.bc, S.deepest < 5 ? 'Floor 5' : mode === 'run' ? 'Busy' : `${k} key${k === 1 ? '' : 's'}`);
    }
    const full = DUNGEONS.every(d => S.keys[d.id] >= keyMax(d.id));
    setText($('#keyTimer'), full ? 'Keys full' : (DUNGEONS.some(d => d.id !== 'grotto' && S.keys[d.id] < 3) ? `Next key in ${mmss(Math.max(0, (keyMs() - (Date.now() - S.keyT)) / 1000))}` : 'Keys full') + (S.keys.grotto < 1 ? ` · Grotto key in ${mmss(Math.max(0, (GROTTO_MS - (Date.now() - S.grottoT)) / 1000))}` : ''));
  }
  function renderQuests() {
    fillQuests();
    S.quests.forEach((q, i) => {
      const e = questEls[i]; if (!e) return;
      setText(e.qt, QT[q.type].text(q.n));
      e.bar.style.width = pct(clamp(q.prog / q.n, 0, 1));
      setText(e.qr, `${q.type === 'gold' ? fmt(q.prog) : Math.floor(q.prog)} / ${q.type === 'gold' ? fmt(q.n) : q.n} · reward ${q.gems} gems`);
      setText(e.bc, q.done ? `+${q.gems}` : '…');
      e.btn.classList.toggle('ok', q.done); e.btn.setAttribute('aria-disabled', String(!q.done));
    });
    for (const g of GEMSHOP) setRow(gemRows[g.id], { name: g.name, lv: '', fx: g.text, bn: 'Buy', bc: g.cost + ' gems', ok: S.gems >= g.cost });
    const ab = $('#autoclaimBtn'); setText(ab, S.set.autoclaim ? 'Auto-claim: on' : 'Auto-claim: off'); ab.setAttribute('aria-pressed', String(S.set.autoclaim));
    const ready = dailyReady(), sk = ready ? dailyStreakNext() : S.daily.streak, r = dailyReward(ready ? sk : sk + 1);
    setText($('#dailyLbl'), `Streak: ${S.daily.streak} day${S.daily.streak === 1 ? '' : 's'}`);
    setText($('#dailyText'), ready ? `Today's chest (day ${sk}): ${r.gems} gems, ${r.runes} runes, ${r.shards} shards. Come back every day to grow the streak, up to day 7.` : `Opened today. Tomorrow's chest: ${r.gems} gems, ${r.runes} runes, ${r.shards} shards.`);
    const db = $('#dailyBtn'); db.disabled = !ready; db.classList.toggle('ok', ready); setText(db, ready ? 'Open daily chest' : 'Come back tomorrow');
  }
  function renderBook() {
    setHTML($('#bookGrid'), CATS.map(k => { const n = S.eq[k].s.reduce((x, y) => x + (y ? 1 : 0), 0); return `<span>${EQ[k].name}</span><span class="cell${n ? ' on' : ''}" style="--rc:${GRADES[Math.min(5, Math.floor(n / 4))].c};width:auto;grid-column:span 4;height:18px;position:relative"><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 11px var(--pixel);color:${n ? 'var(--stone)' : 'var(--mute)'}">${n} / 24</span></span>`; }).join(''));
    setText($('#bookCount'), `${bookCount()} / ${CATS.length * 24}`);
    setText($('#bookHint'), `Every new piece of equipment you discover is +1% damage forever. Collection bonus now: +${bookCount()}% damage. Open Equip to see every piece.`);
    setHTML($('#beast'), KINDS.map(k => {
      const n = S.life.beasts[k] || 0;
      return `<div class="${n ? '' : 'unseen'}"><img alt="" src="${beastIcon(k)}"><span><b>${n ? CNAME[k] : '???'}</b><span class="${n >= 100 ? 'done' : ''}">${n >= 100 ? 'Mastered · ' + fmt(n) : n + ' / 100'}</span><span class="lore">${n ? (LORE[k] || '') + (S.life.first[k] ? ' First seen on floor ' + S.life.first[k] + '.' : '') : ''}</span></span></div>`;
    }).join(''));
    setText($('#beastCount'), `${beastsMastered()} / ${KINDS.length} mastered`);
  }
  const beastCache = {};
  function beastIcon(k) {
    if (!beastCache[k]) { const th = THEMES.find(t => t.kinds.includes(k) || t.boss === k) || THEMES[0]; beastCache[k] = spriteURL(SPR[k], monPal({ kind: k, tint: th.tint }), 3); }
    return beastCache[k];
  }
  function renderLegacy() {
    setHTML($('#relics'), RELICS.map(r => { const n = S.relics[r.id] || 0; return n ? `<span class="chip" title="${r.text}">${r.name}${n > 1 ? ` <i>×${n}</i>` : ''} · <i>${r.text}</i></span>` : '<span class="chip unknown">???</span>'; }).join(''));
    setText($('#relicCount'), `${relicKinds()} / ${RELICS.length} found`);
    setHTML($('#achs'), ACHS.map(([id, name, text]) => `<span class="chip${S.ach[id] ? ' got' : ' unknown'}" title="${text}">${S.ach[id] ? name : name + ': ' + text}</span>`).join(''));
    setText($('#achCount'), `${achCount()} / ${ACHS.length} · +${achCount() * 3}% damage`);
    for (const [k] of LIFE) setText($('#life-' + k), k === 'time' ? dur(S.life.time) : fmt(S.life[k]));
    setText($('#bestLine'), `Deepest floor: ${S.deepest}` + (S.runs ? ` · Retired ${S.runs}×` : '') + (S.dev ? ' · dev save' : ''));
    const gain = talesFor(S.maxFloor), btn = $('#retireBtn');
    btn.disabled = gain <= 0 || mode !== 'main';
    setText(btn, gain <= 0 ? `Reach floor 10 to retire (now ${S.maxFloor})` : `Retire for +${gain} tales`);
  }
  const RENDER = { train: () => { renderTrain(); setText($('#focusBtn'), 'Focus: ' + (S.set.buyfocus || 'cheapest')); }, equip: renderEquip, forge: () => { renderForge(); renderSockets(); }, hero: () => { renderHero(); renderEvoBranches(); renderTalents(); renderWardrobe(); }, skills: () => { renderSkills(); xRenderSkills(); }, allies: () => { renderAllies(); xRenderAllies(); renderCamp(); }, trials: () => { renderTrials(); xRenderTrials(); renderTrials2(); }, quests: () => { renderMiles(); renderQuests(); xRenderQuests(); renderEventPass(); }, book: renderBook, legacy: () => { renderLegacy(); xRenderLegacy(); renderLegacyShop(); renderChallenges(); renderLab(); } };
  let boardRendered = 0; const _rl = RENDER.legacy; RENDER.legacy = () => { _rl(); if (performance.now() - boardRendered > 5000) { boardRendered = performance.now(); renderOnline(); } };

  const skBtns = {};
  function buildSkillbar() {
    const box = $('#skillbar'); box.innerHTML = '';
    S.loadout.map(id => SKILLS.find(k => k.id === id)).filter(Boolean).forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'sk'; b.id = 'cast-' + s.id;
      b.title = unlocked(s) ? `${s.name} (key ${i + 1}): ${s.fx((s.gacha !== undefined ? S.skLv[s.id] : S.sk[s.id]) || 1)}` : `Unlocks at floor ${s.unlock}`;
      b.innerHTML = `<img alt="" src="${iconURL(s.id)}"><span>${unlocked(s) ? s.short : 'Fl. ' + s.unlock}</span><b class="cdn"></b>`;
      b.addEventListener('click', () => { audio(); castSkill(s.id, true); });
      box.appendChild(b);
      skBtns[s.id] = { b, cdn: b.querySelector('.cdn') };
    });
    const u = document.createElement('button'); u.type = 'button'; u.className = 'sk ult'; u.id = 'ultBtn'; u.title = 'Ultimate (U): charges from taps and kills';
    u.innerHTML = '<span class="ultv">ULT</span><span class="ultp">0%</span>'; u.addEventListener('click', () => { audio(); castUlt(); }); box.appendChild(u);
    const a = document.createElement('button');
    a.type = 'button'; a.className = 'pill'; a.id = 'autoBtn';
    a.addEventListener('click', () => { S.auto = !S.auto; syncAuto(); save(); });
    box.appendChild(a);
    syncAuto();
  }
  function syncAuto() { const a = $('#autoBtn'); if (!a) return; a.textContent = S.auto ? 'Auto skills: on' : 'Auto skills: off'; a.setAttribute('aria-pressed', String(S.auto)); }
  function renderSkillbar() {
    for (const s of SKILLS) {
      const r = skBtns[s.id]; if (!r) continue;
      const open = unlocked(s), left = skT[s.id];
      r.b.classList.toggle('locked', !open);
      r.b.classList.toggle('ready', open && left <= 0);
      r.b.style.setProperty('--p', open ? (left / (s.cd * st.cdMult)).toFixed(3) : 1);
      setText(r.cdn, open && left > 0 ? Math.ceil(left) : '');
    }
  }
  function buildPips() {
    const box = $('#pips'); box.innerHTML = '';
    box.classList.toggle('farm', S.farm);
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span');
      s.className = 'pip' + (i === 9 ? ' boss' : '') + (i % 3 === 0 && i > 0 ? ' gap' : '') + (i < S.kill ? ' done' : i === S.kill ? ' now' : '');
      box.appendChild(s);
    }
    setText($('#floorNum'), mode === 'run' ? runTitle() : `Floor ${S.floor} · ` + (S.kill >= 9 ? 'Boss fight' : S.farm ? `Farming · wave ${Math.floor(S.kill / 3) + 1}` : `Wave ${Math.floor(S.kill / 3) + 1} of 3`));
    setText($('#floorName'), mode === 'run' && run ? runSub() : themeName(S.floor));
    const fb = $('#farmBtn');
    setText(fb, S.farm ? 'Fight boss' : 'Farm here');
    fb.classList.toggle('hot', S.farm);
    fb.disabled = mode !== 'main';
    fb.title = S.farm ? 'Stop farming and fight the boss now' : 'Skip the boss and keep fighting waves on this floor';
  }
  function toggleFarm() {
    audio();
    if (mode !== 'main') return;
    if (S.farm) {
      S.farm = false; farmLoops = 0;
      if (S.bossReady && !fainted) { S.kill = 9; enemies = enemies.filter(e => e.dead); log(`Going for the boss of floor ${S.floor}!`, 'c'); }
      else log(`Back to pushing floor ${S.floor}. The boss comes after wave 3.`, 'c');
    }
    else { S.farm = true; farmLoops = 0; log(`Farming floor ${S.floor}. The boss will wait.`); }
    buildPips(); save();
  }
  $('#farmBtn').addEventListener('click', toggleFarm);
  function showTab(id) {
    if (!isOpen('tab:' + id)) {
      if (S.tab !== id && RENDER[S.tab] && isOpen('tab:' + S.tab)) { log(`<b>${UNLOCKS['tab:' + id][0]}</b> opens when you ${UNLOCKS['tab:' + id][2].toLowerCase()}.`, 'c'); return; }
      id = 'train';
    }
    S.tab = id;
    for (const b of document.querySelectorAll('.tabs button')) {
      const on = b.dataset.tab === id;
      b.setAttribute('aria-selected', String(on));
      if (on) { const d = b.querySelector('.dot'); if (d) d.remove(); }
    }
    for (const p of Object.keys(RENDER)) $('#panel-' + p).hidden = p !== id;
    RENDER[id]();
  }
  function markTab(id) {
    if (S.tab === id) return;
    const b = $('#tab-' + id);
    if (b && !b.querySelector('.dot')) { const d = document.createElement('span'); d.className = 'dot'; b.appendChild(d); }
  }
  const phoneNav = () => window.matchMedia && matchMedia('(max-width: 920px)').matches;
  for (const b of document.querySelectorAll('.tabs button')) b.addEventListener('click', () => {
    const was = S.tab; showTab(b.dataset.tab); save();
    if (phoneNav() && S.tab === b.dataset.tab) {
      const shop = $('.panel.shop'), game = $('.panel.game'), pinned = document.body.classList.contains('pin');
      shop.style.scrollMarginTop = (pinned ? game.offsetHeight + 8 : 8) + 'px';
      if (was !== S.tab || shop.getBoundingClientRect().top > innerHeight * 0.6 || shop.getBoundingClientRect().bottom < 0) shop.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    b.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  });

  const talesFor = f => f < 10 ? 0 : Math.floor((2 + Math.pow(f / 5, 2)) * (1 + labV('story')));
  function renderHud() {
    setText($('#gold'), fmt(Math.floor(S.gold)));
    setText($('#gems'), fmt(S.gems)); setText($('#runes'), fmt(S.runes)); setText($('#shards'), fmt(S.shards));
    setText($('#gps'), S.gps > 0.05 ? `${fmt(S.gps)}/s` : '');
    $('#talesBox').hidden = !S.tales;
    setText($('#tales'), S.tales);
    setText($('#rankChip'), RANKS[S.rank].n + (S.dev ? ' · dev' : ''));
    setText($('#sDmg'), fmt(st.dmg * comboMult()));
    setText($('#sDps'), fmt(dpsLog.reduce((a, b) => a + b[1], 0) / 5));
    setText($('#sSpd'), (1 / (st.atkInt / (frenzyT > 0 ? frenzyVal : 1))).toFixed(2));
    setText($('#sHp'), fmt(Math.ceil(hero.hp)) + '/' + fmt(st.maxHp));
    setText($('#sCrit'), pct1(st.crit));
    setText($('#sTap'), fmt(st.tap * comboMult()));
    renderSkillbar();
    renderBadges();
    xHud();
    RENDER[S.tab]();
    if (dev.debug) { $('#debug').hidden = false; setText($('#debug'), `fps ${fps.toFixed(0)}  enemies ${enemies.length}  parts ${parts.length}\nmode ${mode}  floor ${S.floor}  kill ${S.kill}  hpM ${fmt(hpM(S.floor))}\ngps ${fmt(S.gps)}  speed ×${dev.speed}`); } else $('#debug').hidden = true;
  }

  /* ---------- retire + classes ---------- */
  function openRetire() {
    const gain = talesFor(S.maxFloor);
    if (gain <= 0 || mode !== 'main') return;
    setText($('#clsSub'), `Your hero retires with +${gain} tales (${S.tales + gain} total, +${(S.tales + gain) * 10}% damage and gold). Who goes down the stairs next? You keep equipment, forge, ranks, relics, class evolutions, achievements and currencies. Gold, training, skills, allies and floors reset.`);
    $('#classes').innerHTML = Object.keys(CLASSES).map(id => `<button type="button" class="cls" data-cls="${id}"><img alt="" src="${heroIcon(id)}"><b>${clsName(id)} <span class="stars">${'★'.repeat(clsTier(id))}</span></b><span>${clsText(id)}</span></button>`).join('');
    $('#classModal').hidden = false;
    setTimeout(() => { const b = $('#classes .cls'); if (b) b.focus(); }, 30);
  }
  $('#classes').addEventListener('click', e => {
    const b = e.target.closest('.cls'); if (!b) return;
    const gain = talesFor(S.maxFloor);
    if (gain <= 0) return;
    retireAs(b.dataset.cls);
  });
  function retireAs(cls) {
    const gain = talesFor(S.maxFloor);
    if (gain <= 0 || mode !== 'main') return;
    const keep = Object.assign(retireKeep(gain), { cls }); keep.chal = null;
    const prevGold = S.gold, prevLv = Object.assign({}, S.lv);
    resetRun(keep);
    afterRetire(prevGold, gain, prevLv);
    $('#classModal').hidden = true;
    lastMax = S.maxFloor; lastFloorT = t;
    log(`Retired! +${gain} tales. A new <b>${clsName(cls)}</b> enters the Damp Cellar.`, 't');
    banner = { text: 'NEW HERO', sub: `${clsName(cls)} · ${S.tales} tales`, life: 2.4 };
    jingle(); save(); refreshAll();
  }
  $('#cancelRetire').addEventListener('click', () => { $('#classModal').hidden = true; });
  $('#retireBtn').addEventListener('click', () => { audio(); openRetire(); });
  function resetRun(keep) {
    S = Object.assign(fresh(), keep);
    recalc(); hero.hp = st.maxHp; hero.wx = 0; enemies = []; chest = null; combo = 0; fainted = 0; feverT = 0; frenzyT = 0; goblin = null; mode = 'main'; run = null;
    for (const k in skT) skT[k] = 0;
  }

  /* ---------- settings ---------- */
  const SETTINGS = [
    ['autobuy', 'Auto-buy training', 'Buys the cheapest training upgrade twice a second'],
    ['autoclaim', 'Auto-claim quests', 'Finished quests pay out by themselves'],
    ['autoboss', 'Auto retry boss', 'While farming, tries the boss again every 3 loops'],
    ['skip', 'Floor skipping', 'Beat a boss in under 2 seconds to jump ahead up to 10 floors'],
    ['pin', 'Pin game on phones', 'Keeps the dungeon on screen while you scroll the menus'],
    ['shake', 'Screen shake', 'Shake on big hits'],
    ['nums', 'Damage numbers', 'Floating numbers over monsters'],
    ['particles', 'Particles', 'Sparkles, snow, embers and bursts'],
    ['music', 'Music', 'Little chiptune loops for every area'],
    ['banter', 'Ally chatter', 'Speech bubbles from your allies'],
    ['autolevel', 'Auto-level gear', 'Levels your equipped gear with spare shards'],
    ['autosummon', 'Auto-summon', 'Does a ×35 summon whenever you have 210+ gems'],
    ['autodungeon', 'Auto-dungeon', 'Runs a side dungeon whenever its keys are full'],
    ['autoretire', 'Auto-retire', 'Retires on its own when a run stalls for 3 minutes and the tales are worth it (keeps your class)'],
    ['tips', 'Tips', 'Shows a short tutorial card when a new feature unlocks'],
    ['compact', 'Compact menus', 'Hides descriptions to fit more on screen'],
    ['light', 'Light menus', 'Light colors for the menus (the dungeon stays dark)'],
    ['cloudauto', 'Auto cloud save', 'Saves to your cloud slot every 10 minutes (inside Claude)'],
    ['cb', 'Grade letters', 'Shows C/U/R/E/L/M on gear for colorblind players'],
    ['numfmt', 'Number style', 'Short (1.2M) or scientific (1.2e6)']
  ];
  function renderSettings() {
    $('#setGrid').innerHTML = SETTINGS.map(([k, n, d]) => {
      const on = k === 'numfmt' ? S.set.numfmt === 'sci' : !!S.set[k], lk = UNLOCKS['auto:' + k] && !isOpen('auto:' + k);
      return `<button type="button" class="toggle${lk ? ' locked' : ''}" data-set="${k}" aria-pressed="${on}"${lk ? ' disabled' : ''}><span><span style="display:block;font-weight:800">${n}</span><span class="hint">${lk ? UNLOCKS['auto:' + k][2] + ' to unlock' : d}</span></span><b>${k === 'numfmt' ? (on ? 'Scientific' : 'Short') : on ? 'On' : 'Off'}</b></button>`;
    }).join('');
  }
  $('#setGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-set]'); if (!b || b.disabled) return;
    const k = b.dataset.set;
    if (k === 'numfmt') S.set.numfmt = S.set.numfmt === 'sci' ? 'short' : 'sci'; else S.set[k] = !S.set[k];
    save(); renderSettings(); applyPin(); renderHud();
  });
  function applyPin() { document.body.classList.toggle('pin', !!S.set.pin); document.body.classList.toggle('compact', !!S.set.compact); document.body.classList.toggle('cb', !!S.set.cb); document.body.classList.toggle('light', !!S.set.light); }
  function openModal(id) { $('#' + id).hidden = false; if (id === 'setModal') { renderSettings(); xSettingsExtra(); renderOnline(); } if (id === 'devModal') buildDev(); if (id === 'mapModal') renderMap(); }
  for (const b of document.querySelectorAll('[data-close]')) b.addEventListener('click', () => { $('#' + b.dataset.close).hidden = true; });
  for (const m of document.querySelectorAll('.overlay')) m.addEventListener('click', e => { if (e.target === m && m.id !== 'classModal') m.hidden = true; });
  $('#openSettings').addEventListener('click', () => openModal('setModal'));
  $('#autobuyBtn').addEventListener('click', () => { S.set.autobuy = !S.set.autobuy; save(); renderTrain(); });
  $('#buyCheap').addEventListener('click', () => { audio(); if (buyCheapest(false)) save(); });
  $('#autoclaimBtn').addEventListener('click', () => { S.set.autoclaim = !S.set.autoclaim; save(); renderQuests(); });
  holdable($('#enhanceBtn'), enhance);
  $('#evoBtn').addEventListener('click', evolveClass);
  $('#openDev').addEventListener('click', () => { $('#setModal').hidden = true; openModal('devModal'); });
  $('#mapBtn').addEventListener('click', () => openModal('mapModal'));
  $('#mapGo').addEventListener('click', () => travel(+$('#mapFloor').value));
  $('#mapList').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) travel(+b.dataset.go); });
  $('#reforgeBtn').addEventListener('click', reforge);
  $('#rerollBtn').addEventListener('click', rerollEnch);
  $('#trialBtn').addEventListener('click', () => startRun('trial'));
  $('#dailyBtn').addEventListener('click', claimDaily);
  const encodeSave = () => btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  $('#exportBtn').addEventListener('click', () => {
    save();
    const code = encodeSave(), ta = $('#saveText');
    ta.value = code;
    const done = ok => setText($('#saveMsg'), ok ? 'Copied your save code. Keep it somewhere safe.' : 'Your save code is in the box. Select it and copy it.');
    try { navigator.clipboard.writeText(code).then(() => done(true), () => { ta.select(); done(false); }); } catch (e) { ta.select(); done(false); }
  });
  let importArm = 0;
  $('#importBtn').addEventListener('click', () => {
    const raw = $('#saveText').value.trim();
    if (!raw) { setText($('#saveMsg'), 'Paste a save code into the box first.'); return; }
    let o;
    try { o = JSON.parse(decodeURIComponent(escape(atob(raw)))); } catch (e) { setText($('#saveMsg'), "That code didn't work. Check that you copied all of it."); return; }
    if (importArm < performance.now()) { importArm = performance.now() + 4000; setText($('#saveMsg'), `Found a save on floor ${o.floor || 1}. Press Load again to replace your current game.`); return; }
    importArm = 0;
    S = migrate(o); recalc(); hero.hp = st.maxHp; enemies = []; mode = 'main'; run = null; save();
    setText($('#saveMsg'), 'Save loaded.'); log('Loaded a save.', 't'); refreshAll();
  });
  let wipeArm = 0;
  $('#wipe').addEventListener('click', () => {
    if (wipeArm < performance.now()) { wipeArm = performance.now() + 3000; $('#wipe').textContent = 'Tap again to erase everything'; setTimeout(() => { $('#wipe').textContent = 'Erase save'; }, 3000); return; }
    resetRun({ tab: S.tab }); save();
    $('#log').innerHTML = ''; log('Fresh start. A new hero enters the Damp Cellar.');
    $('#wipe').textContent = 'Erase save'; wipeArm = 0;
    $('#setModal').hidden = true;
    refreshAll();
  });

  /* ---------- equip tab ---------- */
  function buildEquip() {
    $('#eqCats').innerHTML = CATS.map(k => `<button type="button" data-cat="${k}" aria-pressed="${k === S.eqCat}"><img alt="" src="${eqIcon(k, k === 'pet' ? 4 : 10)}">${EQ[k].name}</button>`).join('');
    let html = '';
    for (let g = 0; g < 6; g++) {
      html += `<span class="gl" style="color:${GRADES[g].c}">${GRADES[g].n}</span>`;
      for (let k = 0; k < 4; k++) { const i = g * 4 + k; html += `<button type="button" class="eqc" data-i="${i}" data-g="${GRADES[g].n[0]}" style="--gc:${GRADES[g].c}"><img alt=""><span class="lvl"></span><span class="cnt"></span></button>`; }
    }
    $('#eqGrid').innerHTML = html;
  }
  function renderEquip() {
    const E = S.eq[S.eqCat], D = EQ[S.eqCat];
    for (const b of document.querySelectorAll('#eqCats button')) b.setAttribute('aria-pressed', String(b.dataset.cat === S.eqCat));
    for (const b of document.querySelectorAll('#eqGrid .eqc')) {
      const i = +b.dataset.i, seen = !!E.s[i];
      const img = b.querySelector('img'); const src = eqIcon(S.eqCat, i); if (img.getAttribute('src') !== src) img.src = src;
      b.classList.toggle('unseen', !seen);
      b.setAttribute('aria-pressed', String(S.eqSel[S.eqCat] === i));
      b.title = seen ? `${D.names[i]} · ${GRADES[Math.floor(i / 4)].n} ${TIERN[i % 4]}` : `${GRADES[Math.floor(i / 4)].n} ${TIERN[i % 4]} (not found yet)`;
      setText(b.querySelector('.lvl'), seen ? 'Lv' + E.l[i] : '');
      const cnt = b.querySelector('.cnt'); setText(cnt, E.c[i] ? '×' + E.c[i] : ''); cnt.classList.toggle('m', E.c[i] >= 5 && i < 23);
      let onb = b.querySelector('.onb');
      if (E.on === i && !onb) { onb = document.createElement('span'); onb.className = 'onb'; onb.textContent = 'E'; b.appendChild(onb); }
      else if (E.on !== i && onb) onb.remove();
    }
    const i = S.eqSel[S.eqCat] || 0, seen = !!E.s[i], G = GRADES[Math.floor(i / 4)], lv = E.l[i], max = eqMax(i);
    const d = $('#eqDetail'); d.style.setProperty('--gc', G.c);
    if (!d._built) { d.innerHTML = `<div class="big"><img alt=""></div><div style="min-width:0;display:flex;flex-direction:column;gap:6px"><div class="nm"></div><div class="fx"></div><div class="row"><button class="act heal" type="button" data-a="equip">Equip</button><button class="act shard" type="button" data-a="level">Level up</button><button class="act gem" type="button" data-a="merge">Merge 5 → 1</button><button class="act gem" type="button" data-a="awaken">Awaken</button><button class="act shard" type="button" data-a="dis">Dismantle</button><button class="act heal" type="button" data-a="slot1">Pet slot 2</button><button class="act heal" type="button" data-a="slot2">Pet slot 3</button></div><div class="fx xtra"></div></div>`; d._built = 1; holdable(d.querySelector('[data-a=level]'), () => { if (levelEq(S.eqCat, S.eqSel[S.eqCat])) save(); }); }
    d.querySelector('.big img').src = eqIcon(S.eqCat, i);
    d.querySelector('.big img').style.filter = seen ? '' : 'brightness(0) opacity(.35)';
    setHTML(d.querySelector('.nm'), seen ? `${D.names[i]} <span class="lbl" style="color:${G.c}">${G.n} ${TIERN[i % 4]}</span>` : `??? <span class="lbl">${G.n} ${TIERN[i % 4]}</span>`);
    setHTML(d.querySelector('.fx'), seen
      ? `Owned: <b>${E.c[i]}</b> · Level <b>${lv}/${max}</b><br>Equipped effect: <b>${D.eqText(i, lv)}</b>${E.on === i ? ' (equipped)' : ''}<br>Owned effect: <b>${D.owText(i, lv)}</b> (always on)${i < 23 ? `<br>Merge 5 into <b>${D.names[i + 1]}</b>.` : '<br>The best piece there is.'}`
      : `Not found yet. Summon ${D.name.toLowerCase()} or merge 5 of the piece before it.<br>Equipped effect: ${D.eqText(i, 1)}<br>Owned effect: ${D.owText(i, 1)}`);
    const be = d.querySelector('[data-a=equip]'), bl = d.querySelector('[data-a=level]'), bm = d.querySelector('[data-a=merge]');
    be.classList.toggle('ok', seen && E.on !== i); setText(be, E.on === i ? 'Equipped' : 'Equip');
    const lc = eqLvCost(i, lv);
    bl.classList.toggle('ok', seen && lv < max && S.shards >= lc); setText(bl, lv >= max ? 'Max level' : `Level up (${lc} shards)`);
    bm.classList.toggle('ok', E.c[i] >= 5 && i < 23); bm.hidden = i >= 23;
    const w = gradeWeights(E.sl), tot = w.reduce((a, b) => a + b, 0);
    setText($('#sumTitle'), `${D.name} summon`);
    setText($('#sumLbl'), `Summon level ${E.sl} · ${E.sx}/${sumNeedEq(E.sl)}`);
    $('#sumBar').style.width = pct(E.sx / sumNeedEq(E.sl));
    setText($('#sumOdds'), GRADES.map((g, k) => `${g.n} ${pct1(w[k] / tot)}`).join(' · ') + ` · Legendary guaranteed within ${150 - (E.pity || 0)} pulls`);
    setHTML($('#featTxt'), `Featured today: <b style="color:${GRADES[Math.floor(featured(S.eqCat) / 4)].c}">${D.names[featured(S.eqCat)]}</b>. Half of all Legendary-or-better pulls become it. Changes daily.`);
    for (const n of [1, 11, 35]) { const b = $('#sum' + n); setText(b, `×${n} · ${SUM_COST[n]} gems`); b.classList.toggle('ok', S.gems >= SUM_COST[n]); }
    const ab = $('#autoEq'); setText(ab, S.set.autoeq ? 'Auto-equip: on' : 'Auto-equip: off'); ab.setAttribute('aria-pressed', String(S.set.autoeq));
    xRenderEquipDetail(d, i);
    $('#mergeAll').disabled = !E.c.some((c, k) => c >= 5 && k < 23);
    const found = E.s.reduce((x, y) => x + (y ? 1 : 0), 0);
    setText($('#eqOwned'), `${found}/24 found. All owned ${D.name.toLowerCase()} together: ${S.eqCat === 'boots' ? '+' + ownedSum('boots').toFixed(2) + '× crit damage' : '+' + pct1(ownedSum(S.eqCat)) + ' ' + ({ weapon: 'damage', pet: 'damage', armor: 'health', helm: 'skill damage', acc: 'gold' })[S.eqCat]}.`);
  }
  $('#eqCats').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; S.eqCat = b.dataset.cat; renderEquip(); });
  $('#eqGrid').addEventListener('click', e => { const b = e.target.closest('.eqc'); if (!b) return; S.eqSel[S.eqCat] = +b.dataset.i; renderEquip(); });
  $('#eqDetail').addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    audio();
    const i = S.eqSel[S.eqCat], E = S.eq[S.eqCat];
    if (b.dataset.a === 'equip' && E.s[i]) { if (S.eqCat === 'pet') S.eq.pet.x = S.eq.pet.x.map(v => v === i ? -1 : v); E.on = i; recalc(); tone(660, 990, 0.1, 'triangle', 0.05); log(`Equipped ${itemLabel(S.eqCat, i)}.`, 't'); save(); }
    if (b.dataset.a === 'merge' && mergeOne(S.eqCat, i)) { recalc(); log(`Merged 5 into ${itemLabel(S.eqCat, i + 1)}!`, 'p'); tone(523, 1046, 0.2, 'triangle', 0.05); S.eqSel[S.eqCat] = i + 1; save(); }
    else if (b.dataset.a === 'merge' && E.c[i] >= 0) { recalc(); save(); }
    if (b.dataset.a === 'awaken') awaken(S.eqCat, i);
    if (b.dataset.a === 'dis') dismantle(S.eqCat, i);
    if (b.dataset.a === 'slot1') setPetSlot(i, 1);
    if (b.dataset.a === 'slot2') setPetSlot(i, 2);
    renderEquip();
  });
  for (const n of [1, 11, 35]) $('#sum' + n).addEventListener('click', () => summonEq(S.eqCat, n));
  $('#sumAgain').addEventListener('click', () => lastSumKind === 'skill' ? summonSkills(lastSum) : summonEq(S.eqCat, lastSum));
  $('#sumMerge').addEventListener('click', () => { mergeAll(S.eqCat); $('#sumModal').hidden = true; renderEquip(); });
  $('#mergeAll').addEventListener('click', () => { mergeAll(S.eqCat); renderEquip(); });
  $('#equipBest').addEventListener('click', () => { equipBest(S.eqCat); renderEquip(); });
  $('#autoEq').addEventListener('click', () => { S.set.autoeq = !S.set.autoeq; save(); renderEquip(); });
  $('#goEquip').addEventListener('click', () => showTab('equip'));

  /* ---------- world map ---------- */
  function travel(f) {
    f = clamp(Math.floor(f) || 1, 1, S.deepest);
    if (mode !== 'main') { setText($('#mapHint'), 'Finish your trial or dungeon first.'); return; }
    S.floor = f; S.kill = 0; S.farm = false; S.bossReady = false; farmLoops = 0;
    enemies = []; chest = null; combo = 0;
    if (fainted) { fainted = 0; hero.hp = st.maxHp; }
    $('#mapModal').hidden = true;
    log(`Traveled to floor ${f}, ${themeName(f)}.`, 't');
    banner = { text: `FLOOR ${f}`, sub: themeName(f), life: 1.6 };
    buildPips(); save();
  }
  function renderMap() {
    const lastArea = Math.floor((S.deepest - 1) / 5) + 1;
    let html = '';
    for (let a = 0; a <= lastArea; a++) {
      const start = a * 5 + 1, end = start + 4, th = THEMES[a % THEMES.length];
      const locked = start > S.deepest, here = S.floor >= start && S.floor <= end;
      const mons = th.kinds.map(k => `<img alt="${CNAME[k]}" title="${CNAME[k]}" src="${beastIcon(k)}">`).join('') + `<img class="boss" alt="Boss: ${CNAME[th.boss]}" title="Area boss: ${CNAME[th.boss]}" src="${beastIcon(th.boss)}">`;
      html += `<div class="area${locked ? ' locked' : ''}${here ? ' here' : ''}" style="--ac:${th.tint}"><div style="min-width:0"><div class="an">${themeName(start)}</div><div class="af">Floors ${start}–${end}${here ? ' · you are here' : locked ? ' · not reached yet' : start + 4 <= S.deepest ? ' · cleared' : ''}</div></div>${locked ? '<span class="lbl">Locked</span>' : `<button class="act ok heal" type="button" data-go="${start}">Go</button>`}<div class="mons" style="grid-column:1/-1">${mons}</div></div>`;
    }
    setHTML($('#mapList'), html);
    const inp = $('#mapFloor'); inp.max = S.deepest; if (+inp.value > S.deepest || !+inp.value) inp.value = S.floor;
    setText($('#mapHint'), `You can travel to floors 1–${S.deepest}.`);
    setTimeout(() => { const h = $('#mapList .here'); if (h) h.scrollIntoView({ block: 'center' }); }, 30);
  }

  /* ---------- developer menu ---------- */
  function devMark() { if (!S.dev) { S.dev = true; log('Developer mode used. This save is now marked as a dev save.', 'r'); } }
  function goFloor(f) {
    f = clamp(Math.floor(f) || 1, 1, 999);
    S.floor = f; S.kill = 0; S.maxFloor = Math.max(S.maxFloor, f); S.deepest = Math.max(S.deepest, f);
    enemies = []; mode = 'main'; run = null; S.farm = false; buildPips(); buildSkillbar();
    log(`Dev: jumped to floor ${f}.`, 'r');
  }
  const DEV = {
    devCur: [
      ['+10 min of gold', () => earn(Math.max(S.gps, goldM(S.floor) * goldNow()) * 600)],
      ['+1B gold', () => earn(1e9)], ['+1T gold', () => earn(1e12)],
      ['+100 gems', () => { S.gems += 100; }], ['+100 runes', () => { S.runes += 100; }], ['+100 shards', () => { S.shards += 100; }],
      ['+25 tales', () => { S.tales += 25; recalc(); }], ['Refill keys', () => { for (const d of DUNGEONS) S.keys[d.id] = keyMax(d.id); }]
    ],
    devProg: [
      ['Floor +10', () => goFloor(S.floor + 10)], ['Floor +50', () => goFloor(S.floor + 50)],
      ['Unlock all skills', () => { S.maxFloor = Math.max(S.maxFloor, 60); S.deepest = Math.max(S.deepest, 60); buildSkillbar(); }],
      ['Hire all allies Lv 10', () => { for (const a of ALLIES) S.allies[a.id] = Math.max(10, S.allies[a.id]); S.deepest = Math.max(S.deepest, 16); recalc(); }],
      ['Training +25 all', () => { for (const p of PARTS) S.lv[p.id] += 25; recalc(); hero.hp = st.maxHp; }],
      ['Rank up', () => { S.rank = Math.min(RANKS.length - 1, S.rank + 1); recalc(); }],
      ['Evolve class (free)', () => { S.evo[S.cls] = Math.min(2, clsTier() + 1); recalc(); }],
      ['Training to next evolution', () => { for (const p of PARTS) if (pcap(p.id) < Infinity) S.lv[p.id] = pcap(p.id); recalc(); hero.hp = st.maxHp; }],
      ['Next class (free)', () => { const k = Object.keys(CLASSES); S.cls = k[(k.indexOf(S.cls) + 1) % k.length]; recalc(); }],
      ['Complete quests', () => { S.quests.forEach(q => { q.prog = q.n; q.done = true; }); }],
      ['Unlock achievements', () => { for (const [id] of ACHS) S.ach[id] = 1; recalc(); }],
      ['Fake 1h offline', () => { const g = Math.max(S.gps, goldM(S.floor)) * 3600 * 0.5; earn(g); S.keyT -= 3600e3; regenKeys(); log(`Dev: 1 hour offline, +${fmt(g)} gold.`, 'r'); }],
      ['Reset cooldowns', () => { for (const k in skT) skT[k] = 0; }]
    ],
    devSpawn: [
      ['Boss now', () => { if (mode !== 'main') return; S.farm = false; S.kill = 9; enemies = []; }],
      ['Treasure goblin', () => spawnGoblin()],
      ['Chest', () => { chest = { wx: hero.wx + PX * 14, life: 6, gold: goldM(S.floor) * 12 }; }],
      ['Shiny wave', () => { if (mode !== 'main') return; enemies = []; const s0 = hero.wx + W; for (let i = 0; i < 3; i++) { const e = makeEnemy({ wx: s0 + i * PX * 13 }); e.elite = true; e.tint = '#ffd76a'; e.gold *= 8; e.hp = e.max = e.hp * 4; e.name = 'Shiny ' + e.name; enemies.push(e); } }],
      ['Variant wave', () => { if (mode !== 'main') return; enemies = []; const s0 = hero.wx + W; Object.keys(VARIANTS).slice(0, 3).forEach((v, i) => { let e; do { e = makeEnemy({ wx: s0 + i * PX * 13 }); } while (!e.variant); enemies.push(e); }); }],
      ['Party potion', () => { feverT = 20; frenzyT = 20; }],
      ['Rare monster', () => { if (mode !== 'main') return; enemies = []; const e = makeEnemy({ wx: hero.wx + W }); e.rare = true; e.name = 'Rare ' + CNAME[e.kind]; e.hp = e.max = e.hp * 6; e.gold *= 20; e.variant = null; enemies.push(e); }],
      ['Full ultimate', () => { ultC = 100; }],
      ['Reset Abyss and Rush timers', () => { S.abyssT = 0; S.rushT = 0; }],
      ['Finish expedition now', () => { if (S.exped) S.exped.end = Date.now() - 1; }],
      ['Show title screen', () => { $('#devModal').hidden = true; showTitle(''); }]
    ],
    devLoot: [
      ['Legendary set', () => { for (const k of CATS) giveItem(k, 16 + randi(0, 3)); recalc(); }],
      ['+35 of each pet/gear', () => { for (const k of CATS) for (let n = 0; n < 35; n++) giveItem(k, rollItem(S.eq[k].sl)); recalc(); }],
      ['Mythic enchants', () => { for (let i = 0; i < 3; i++) { const s = pick(ENCH_STATS); S.ench[i] = { s: s.id, t: 4, v: Math.round(s.r[1] * 8 * 10) / 10 }; } S.life.mythic++; recalc(); }],
      ['Every relic +1', () => { for (const r of RELICS) S.relics[r.id] = (S.relics[r.id] || 0) + 1; recalc(); }],
      ['Discover all equipment', () => { for (const k of CATS) for (let i = 0; i < 24; i++) S.eq[k].s[i] = 1; recalc(); }],
      ['Weapon +5', () => { S.wlv += 5; recalc(); }],
      ['Master bestiary', () => { for (const k of KINDS) S.life.beasts[k] = Math.max(100, S.life.beasts[k] || 0); recalc(); }]
    ],
    devCheat: [
      ['God mode', () => { dev.god = !dev.god; }, () => dev.god],
      ['One-hit kills', () => { dev.onehit = !dev.onehit; }, () => dev.onehit],
      ['Speed ×1', () => { dev.speed = 1; }, () => dev.speed === 1], ['Speed ×2', () => { dev.speed = 2; }, () => dev.speed === 2],
      ['Speed ×5', () => { dev.speed = 5; }, () => dev.speed === 5], ['Speed ×10', () => { dev.speed = 10; }, () => dev.speed === 10],
      ['Debug overlay', () => { dev.debug = !dev.debug; }, () => dev.debug],
      ['Clear dev mark', () => { S.dev = false; }]
    ]
  };
  function buildDev() {
    buildDevAmounts();
    for (const [box, items] of Object.entries(DEV)) {
      $('#' + box).innerHTML = items.map(([n, , on], i) => `<button type="button" data-dev="${box}:${i}"${on ? ` aria-pressed="${on()}"` : ''}>${n}</button>`).join('');
    }
    $('#devFloor').value = S.floor;
  }
  $('#devModal').addEventListener('click', e => {
    const b = e.target.closest('[data-dev]'); if (!b) return;
    const [box, i] = b.dataset.dev.split(':');
    const item = DEV[box][+i];
    if (!(box === 'devCheat' && item[0] === 'Clear dev mark')) devMark();
    item[1](); recalc(); save(); buildDev(); renderHud();
  });
  $('#devGo').addEventListener('click', () => { devMark(); goFloor(+$('#devFloor').value); save(); });

  /* ---------- input ---------- */
  cvs.addEventListener('pointerdown', e => {
    e.preventDefault();
    const r = cvs.getBoundingClientRect();
    tap(e.clientX - r.left, e.clientY - r.top);
  });
  window.addEventListener('keydown', e => {
    const open = [...document.querySelectorAll('.overlay')].find(m => !m.hidden);
    if (open) { if (open.id === 'titleModal' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); $('#titleGo').click(); return; } if (e.key === 'Escape') { if (open.id === 'titleModal') $('#titleGo').click(); else open.hidden = true; } return; }
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === '`') { openModal('devModal'); return; }
    if (/^Digit[1-5]$/.test(e.code)) { audio(); if (S.loadout[+e.code.slice(5) - 1]) castSkill(S.loadout[+e.code.slice(5) - 1], true); return; }
    if (e.code === 'KeyB') { toggleFarm(); return; }
    if (e.code === 'KeyM') { openModal('mapModal'); return; }
    if (e.code === 'KeyU') { audio(); castUlt(); return; }
    if (e.code === 'KeyN') { showNext(); return; }
    if (e.code === 'KeyL') { openLog(); return; }
    const tabKey = { KeyQ: 'quests', KeyE: 'equip', KeyT: 'train', KeyF: 'forge', KeyH: 'hero', KeyK: 'skills', KeyA: 'allies' }[e.code];
    if (tabKey) { showTab(tabKey); return; }
    if (e.code !== 'Space' || (e.target && e.target.tagName === 'BUTTON')) return;
    e.preventDefault();
    const f = front();
    tap(f ? sx(f.wx) + rand(-20, 20) : W * 0.6, groundY() - PX * 5 + rand(-15, 15));
  });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  const TAB_ICON = { train: () => iconURL('sword'), equip: () => eqIcon('acc', 13), forge: () => iconURL('hammer'), hero: () => heroIcon(S.cls, 0), skills: () => iconURL('bolt'), allies: () => spriteURL(SPR.wizard, ALLY_PAL.wizard, 3), trials: () => iconURL('crown'), quests: () => iconURL('scroll'), book: () => iconURL('book'), legacy: () => iconURL('relicbox') };
  const badges = {};
  for (const b of document.querySelectorAll('.tabs button')) {
    const img = document.createElement('img'); img.alt = ''; img.src = TAB_ICON[b.dataset.tab]();
    b.prepend(img);
    const bd = document.createElement('span'); bd.className = 'badge'; b.appendChild(bd); badges[b.dataset.tab] = bd;
  }
  function renderBadges() {
    const n = {
      train: PARTS.filter(p => atCap(p) ? (S.gold >= pevoCost(p).gold && S.shards >= pevoCost(p).shards) : S.gold >= costOf(p.base, p.r, S.lv[p.id], 1)).length,
      equip: CATS.reduce((a, k) => a + S.eq[k].c.filter((c, i) => c >= 5 && i < 23).length, 0) + (S.gems >= 50 ? 1 : 0),
      forge: (S.shards >= enhCost() ? 1 : 0),
      hero: evoReady() || PARTS.some(p => atCap(p) && S.gold >= pevoCost(p).gold && S.shards >= pevoCost(p).shards) ? '!' : '',
      skills: SKILLS.filter(s => unlocked(s) && S.gold >= skillCost(s)).length,
      allies: ALLIES.filter(a => S.deepest >= a.unlock && S.gold >= allyCost(a)).length,
      trials: (RANKS[S.rank + 1] && S.deepest >= RANKS[S.rank + 1].need ? '!' : ''),
      quests: S.quests.filter(q => q.done).length + (dailyReady() ? 1 : 0),
      book: '', legacy: talesFor(S.maxFloor) > 0 ? '!' : ''
    };
    for (const k in badges) { const v = n[k] || ''; setText(badges[k], v === 0 ? '' : v); badges[k].classList.toggle('hotb', v === '!'); }
  }
  function refreshAll() { applyLocks(); buildPips(); buildSkillbar(); syncAmt(); syncMute(); showTab(RENDER[S.tab] ? S.tab : 'train'); renderHud(); }
  function syncAmt() { for (const b of document.querySelectorAll('.amt button')) b.setAttribute('aria-pressed', String(b.dataset.amt === S.amt)); }
  for (const b of document.querySelectorAll('.amt button')) b.addEventListener('click', () => { S.amt = b.dataset.amt; syncAmt(); renderTrain(); save(); });
  function syncMute() { $('#mute').textContent = S.muted ? 'Sound off' : 'Sound on'; $('#mute').setAttribute('aria-pressed', String(!S.muted)); }
  $('#mute').addEventListener('click', () => { audio(); S.muted = !S.muted; syncMute(); save(); if (!S.muted) tone(660, 880, 0.08, 'triangle', 0.05); });

  /* ================= expansion: modes, pets, allies, QoL, feel ================= */
  const VER = 10;
  const FLAVOR = ['Smells faintly of victory.', 'Previously owned by a very small hero.', 'It hums when nobody is looking.', 'Comes with a tiny warranty.', 'Surprisingly heavy for its size.', 'Found under a couch on floor 3.', 'Has a name. It will not say it.', 'Makes a sound like a happy kettle.', 'Polished by three generations of goblins.', 'Glows a little in the dark.', 'Rated five stars by a slime.', 'Was in a museum, briefly.', 'Whispers advice. Mostly bad advice.', 'Forged during a thunderstorm on a Tuesday.', 'Leaves sparkles everywhere. Everywhere.', 'Bosses get nervous when they see it.', 'Said to be cut from a falling star.', 'The dragon wants it back.', 'Sings in a key that does not exist.', 'Older than the dungeon itself.', 'Reality bends politely around it.', 'Nobody knows who made it. It knows.', 'Contains exactly one small universe.', 'The last of its kind. Probably.'];
  const TITLES = [
    ['Legend of the Deep', () => S.deepest >= 200], ['Starborn', () => S.stars >= 1], ['Abyss Walker', () => S.abyssBest >= 30], ['Mythic Collector', () => S.life.mythics >= 1],
    ['Boss Rush Champion', () => S.rushBest >= 10], ['Combo King', () => S.life.bestCombo >= 200], ['Goblin Bane', () => S.life.goblins >= 25], ['Parry Master', () => S.life.parries >= 25],
    ['Bat Whisperer', () => (S.life.beasts.bat || 0) >= 500], ['Dungeon Regular', () => S.life.dungeons >= 25], ['Retiree', () => S.runs >= 1], ['Monster Hunter', () => S.life.kills >= 1000], ['Newbie', () => true]];
  const titleNow = () => TITLES.find(x => x[1]())[0];

  function dmgFloat(e, amt, crit, src) {
    if (!S.set.nums) return;
    const pre = e.shield > 0 ? 'BLOCKED ' : crit ? 'CRIT ' : '';
    const f = floats.find(q => q.e === e && q.src === src && q.crit === crit && q.life > 0.8);
    if (f) { f.val += amt; f.text = pre + fmt(f.val); return; }
    floats.push({ wx: e.wx + rand(-10, 10), y: groundY() - PX * (e.boss ? 15 : 11), text: pre + fmt(amt), color: crit ? '#ffe066' : SRC_COL[src], size: crit ? 22 : src === 'pet' || src === 'ally' ? 14 : src === 'skill' ? 20 : 16, life: 1, vy: -40, e, src, crit, val: amt });
    if (floats.length > 60) floats.shift();
  }

  /* ---------- monsters ---------- */
  function xEnemy(e) {
    const f = S.floor;
    if (e.boss && f % 25 === 0 && !e.special) { e.guardian = true; e.name = GUARDIANS[(f / 25 - 1) % GUARDIANS.length]; e.hp = e.max = e.hp * 1.5; e.gold *= 3; }
    else if (!e.boss && !e.minion && Math.random() < 1 / 400) { e.rare = true; e.name = 'Rare ' + CNAME[e.kind]; e.hp = e.max = e.hp * 6; e.gold *= 20; e.variant = null; log(`A <b>rare ${CNAME[e.kind]}</b> appeared! It drops great gear.`, 'p'); }
    if (e.variant === 'golden') e.tint = '#f5b942';
    if (e.variant === 'frozen') e.tint = mix(e.tint, '#9fe3ff', 0.6);
    if (e.boss) e.teleT = rand(5, 8);
    return e;
  }
  function xKill(e) {
    if (!S.life.first[e.kind]) { S.life.first[e.kind] = S.floor; log(`New monster in the bestiary: <b>${CNAME[e.kind]}</b>. ${LORE[e.kind] || ''}`, 't'); markTab('book'); }
    ultC = Math.min(100, ultC + (e.boss ? 8 : 1.5));
    const ex = sx(e.wx);
    if (S.set.particles) for (let k = 0; k < (e.boss ? 8 : 3); k++) coinFly.push({ x: ex + rand(-10, 10), y: groundY() - PX * 5 + rand(-10, 10), t: -k * 0.05 });
    if (e.variant === 'split' && !e.minion) {
      for (let k = 0; k < 2; k++) { const m = makeEnemy({ minion: true, kind: e.kind, wx: e.wx + k * PX * 6 }); m.hp = m.max = e.max * 0.3; m.scale = 0.7; m.name = 'Split ' + CNAME[e.kind]; m.gold = e.gold * 0.2; enemies.push(m); }
    }
    if (e.rare) { S.life.rares++; const cat = pick(CATS); const i = 12 + randi(0, 7); giveItem(cat, i); recalc(); log(`The rare ${CNAME[e.kind]} dropped ${itemLabel(cat, i)}!`, 'p'); addGems(2, 'from the rare monster'); banner = { text: 'RARE DROP', sub: EQ[cat].names[i], life: 2.2 }; }
    if (e.guardian) { S.life.guardians++; const cat = pick(['weapon', 'armor', 'helm', 'boots', 'acc']); const i = Math.min(23, 12 + Math.floor(S.floor / 50) * 2 + randi(0, 3)); giveItem(cat, i); recalc(); log(`Guardian down! It dropped ${itemLabel(cat, i)}.`, 'p'); addGems(3, 'from the guardian'); }
    if (e.boss) { hitStop = Math.max(hitStop, 0.08); const ft = t - (e.engT || t); if (ft > 0.05 && (!S.life.fastBoss || ft < S.life.fastBoss)) S.life.fastBoss = ft; }
  }
  function tryParry() {
    const f = front();
    if (!f || !(f.wind > 0)) return false;
    f.wind = 0; f.teleT = rand(7, 10); f.atkT += 2; S.life.parries++;
    addFloat(f.wx, groundY() - PX * 18, 'PARRY!', '#62d2c4', 22, true);
    tone(1500, 2400, 0.12, 'square', 0.05); shakeIt(6); hitStop = Math.max(hitStop, 0.08);
    return true;
  }
  function castUlt() {
    if (ultC < 100 || fainted) return;
    const targets = alive().filter(onScreen);
    if (!targets.length) return;
    ultC = 0; S.life.ults++;
    for (const e of targets) hit(e, st.dmg * 25 * st.skillMult, 'skill');
    flashT = 0.35; shakeIt(12); hitStop = 0.1;
    banner = { text: 'ULTIMATE!', sub: 'Everything on screen takes 25× damage', life: 1.4 };
    tone(80, 1600, 0.6, 'sawtooth', 0.06); tone(400, 100, 0.8, 'square', 0.05, 0.1);
  }

  /* ---------- pets ---------- */
  const petSlots = () => 1 + (S.rank >= 4 ? 1 : 0) + (S.rank >= 8 ? 1 : 0);
  const equippedPets = () => [S.eq.pet.on, ...S.eq.pet.x.slice(0, petSlots() - 1)].map((i, slot) => ({ i, slot })).filter(p => p.i >= 0);
  function xPets(dt) {
    const f = front();
    for (const p of equippedPets()) {
      petTimers[p.slot] = (petTimers[p.slot] === undefined ? 1 + p.slot * 0.4 : petTimers[p.slot]) - dt;
      petSkillT[p.slot] = (petSkillT[p.slot] === undefined ? 10 : petSkillT[p.slot]) - dt;
      if (!f || fainted || !onScreen(f)) continue;
      const power = st.petHit * petPower(p.i) * (p.slot ? 0.6 : 1);
      if (petTimers[p.slot] <= 0) { petTimers[p.slot] = 1.2; petLunges[p.slot] = 1; hit(f, power, 'ally'); }
      const g = Math.floor(p.i / 4), tgt = front();
      if (g >= 3 && petSkillT[p.slot] <= 0 && tgt) {
        petSkillT[p.slot] = 10;
        const y = groundY() - PX * (17 + p.slot * 2);
        if (g === 3) { hit(tgt, power * 6, 'skill'); addFloat(hero.wx, y, `${EQ.pet.names[p.i]}: BIG BITE`, '#c98bff', 13, true); }
        else if (g === 4) { const h = st.maxHp * 0.08; hero.hp = Math.min(st.maxHp, hero.hp + h); addFloat(hero.wx, y, `${EQ.pet.names[p.i]}: +${fmt(h)} heal`, '#62d2c4', 13, true); }
        else { const gg = baseGold() * goldNow() * 20; earn(gg); hit(tgt, power * 10, 'skill'); addFloat(hero.wx, y, `${EQ.pet.names[p.i]}: COIN SHOWER +${fmt(gg)}`, '#f5b942', 13, true); for (let k = 0; k < 8; k++) coinFly.push({ x: heroSX() + rand(-30, 30), y: groundY() - PX * 14, t: -k * 0.04 }); }
      }
    }
  }
  function xDrawPets(gy) {
    if (fainted) return;
    for (const p of equippedPets()) {
      const pi = p.i, pk = PET_KINDS[pi], stars = S.eq.pet.st[pi] || 0, ppx = PX * 0.55 * (1 + 0.07 * stars);
      const px0 = heroSX() - PX * (8 - p.slot * 5) + (petLunges[p.slot] || 0) * PX * 12, py0 = gy - PX * (12 + p.slot * 3) + Math.sin(t * 4 + p.slot) * 4;
      if (pi >= 16 || stars >= 3) { const c = GRADES[Math.floor(pi / 4)].c, g = ctx.createRadialGradient(px0, py0 - ppx * 5, 1, px0, py0 - ppx * 5, PX * 5); g.addColorStop(0, c + '66'); g.addColorStop(1, c + '00'); ctx.fillStyle = g; ctx.fillRect(px0 - PX * 6, py0 - PX * 10, PX * 12, PX * 12); }
      sprite(SPR[pk], px0, py0, ppx, petPal(pi), false, false);
    }
  }
  function awaken(cat, i) {
    const E = S.eq[cat], s0 = E.st[i] || 0;
    if (!E.s[i] || s0 >= 5 || E.l[i] < eqMax(i) || E.c[i] < 3) return false;
    const c = 40 * Math.pow(s0 + 1, 2);
    if (S.shards < c) return false;
    S.shards -= c; E.c[i] -= 2; E.st[i] = s0 + 1; recalc();
    log(`${cat === 'pet' ? 'Evolved' : 'Awakened'} ${itemLabel(cat, i)} to <b>${'★'.repeat(E.st[i])}</b>! (+25% to its effects)`, 'p'); jingle(); shakeIt(5); save(); return true;
  }
  function dismantle(cat, i) {
    const E = S.eq[cat]; if (E.c[i] <= 1) return false;
    const n = E.c[i] - 1, sh = n * (1 + Math.floor(i / 4) * 2); E.c[i] = 1; S.shards += sh;
    log(`Dismantled ${n} × ${EQ[cat].names[i]} for ${sh} shards.`, 'u'); tone(400, 200, 0.12, 'square', 0.04); save(); return true;
  }
  function setPetSlot(i, slot) {
    const P = S.eq.pet; if (!P.s[i] || slot > petSlots() - 1) return;
    if (P.on === i) P.on = -1;
    P.x = P.x.map(v => v === i ? -1 : v);
    if (slot === 0) P.on = i; else P.x[slot - 1] = i;
    recalc(); save();
  }
  function xRenderEquipDetail(d, i) {
    const cat = S.eqCat, E = S.eq[cat], lv = E.l[i], stars = E.st[i] || 0, seen = !!E.s[i];
    const aw = d.querySelector('[data-a=awaken]'), dm = d.querySelector('[data-a=dis]'), p2 = d.querySelector('[data-a=slot1]'), p3 = d.querySelector('[data-a=slot2]');
    const ac = 40 * Math.pow(stars + 1, 2), canAw = seen && stars < 5 && lv >= eqMax(i) && E.c[i] >= 3 && S.shards >= ac;
    aw.hidden = !seen; aw.classList.toggle('ok', canAw);
    setText(aw, stars >= 5 ? '★★★★★ max' : `${cat === 'pet' ? 'Evolve' : 'Awaken'} ★${stars + 1} (max level, 3 copies, ${ac} shards)`);
    dm.hidden = !(E.c[i] > 1); dm.classList.toggle('ok', E.c[i] > 1); setText(dm, `Dismantle ${Math.max(0, E.c[i] - 1)} extra`);
    const slots = petSlots();
    p2.hidden = cat !== 'pet' || slots < 2 || !seen; p3.hidden = cat !== 'pet' || slots < 3 || !seen;
    p2.classList.toggle('ok', S.eq.pet.x[0] !== i); p3.classList.toggle('ok', S.eq.pet.x[1] !== i);
    setText(p2, S.eq.pet.x[0] === i ? 'In pet slot 2' : 'Pet slot 2'); setText(p3, S.eq.pet.x[1] === i ? 'In pet slot 3' : 'Pet slot 3');
    const si = setInfo();
    setHTML(d.querySelector('.xtra'), `${seen ? `<i>${FLAVOR[i]}</i>` : ''}${stars ? `<br>Stars: <b style="color:var(--gem)">${'★'.repeat(stars)}</b> (+${stars * 25}% effects)` : ''}${i < 23 ? `<br>The next piece equips for <b>${EQ[cat].eqText(i + 1, 1)}</b>.` : ''}${cat === 'pet' && i >= 12 ? `<br>Pet skill: <b>${['', '', '', 'Big Bite every 10s', 'Heals you every 10s', 'Coin Shower every 10s'][Math.floor(i / 4)]}</b>` : ''}${cat === 'pet' ? `<br>Pet slots: ${slots}/3 (more at Steel and Mythril rank)` : ''}${cat !== 'pet' ? `<br>Set bonus: ${si.n >= 2 ? `<b>${si.n} pieces at ${GRADES[si.g].n} or better</b>, ×${si.mul.toFixed(2)} damage, health and gold` : 'wear 2 to 5 pieces (weapon, armor, helmet, boots, accessory) of the same grade or better for a bonus'}` : ''}`);
  }

  /* ---------- allies, banter, per-second jobs ---------- */
  function xUpdate(dt) {
    xUpdate2(dt); xUpdate3(dt);
    freezeT = Math.max(0, freezeT - dt); cloneT = Math.max(0, cloneT - dt);
    for (const k in petLunges) petLunges[k] = Math.max(0, petLunges[k] - dt * 4);
    for (const c of coinFly) c.t += dt;
    coinFly = coinFly.filter(c => c.t < 0.7);
    if (coinFly.length > 60) coinFly.splice(0, coinFly.length - 60);
    for (const e of enemies) if (e.rare) e.tint = GRADES[Math.floor(t * 4) % 6].c;
    const f = front(), al = st.al;
    if (!fainted) {
      if (al.frog) hero.hp = Math.min(st.maxHp, hero.hp + st.maxHp * (0.01 + 0.004 * al.frog) * allyMulU('frog') * Math.min(3, st.allyMult) * dt);
      if (al.crab && f) { crabT -= dt; if (crabT <= 0 && onScreen(f)) { crabT = 3; fx.push({ type: 'cannon', from: allySX('crab'), life: 0.4 }); tone(120, 60, 0.25, 'square', 0.05); for (const e of alive().filter(onScreen)) hit(e, st.dmg * BAL.crab * al.crab * allyMul('crab') * st.allyMult, 'ally'); shakeIt(4); } }
    }
    if (f && f.boss && !f.special && inRange(f) && !fainted && !(freezeT > 0)) {
      if (f.wind > 0) {
        f.wind -= dt;
        if (f.wind <= 0) {
          const d = f.dmg * 3 * st.taken;
          if (!dev.god && !(invulnT > 0)) hero.hp -= d;
          hero.flash = 0.2; addFloat(hero.wx, groundY() - PX * 13, 'SMASH -' + fmt(d), '#ff5d73', 20, true); shakeIt(10); tone(70, 40, 0.4, 'sawtooth', 0.07);
          f.teleT = rand(7, 10);
          if (hero.hp <= 0) faint(`<b>${f.name}</b> smashed you. Tap the boss when you see the red ! to parry.`);
        }
      } else { f.teleT = (f.teleT === undefined ? 6 : f.teleT) - dt; if (f.teleT <= 0) { f.wind = 1.3; addFloat(f.wx, groundY() - PX * 19, 'TAP TO PARRY!', '#ff5d73', 16, true); tone(300, 600, 0.3, 'square', 0.04); } }
    }
    if (S.auto && ultC >= 100 && f && f.boss && inRange(f)) castUlt();
    banterT -= dt;
    if (banterT <= 0) { banterT = rand(18, 35); const h = hiredList(); if (S.set.banter && h.length && !fainted) banter = { id: pick(h).id, text: pick(BANTER), life: 3.5 }; }
    if (banter) { banter.life -= dt; if (banter.life <= 0) banter = null; }
    xSlowT += dt;
    if (xSlowT >= 1) { xSlowT = 0; xSecond(); }
  }
  function xSecond() {
    checkChallenge(); onlineTick();
    if (S.maxFloor > lastMax) { lastMax = S.maxFloor; lastFloorT = t; }
    const dps = dpsLog.reduce((a, b) => a + b[1], 0) / 5; if (dps > S.life.bestDps) S.life.bestDps = dps;
    if (mode === 'main' && t - lastFloorT > 1200 && t - stuckT > 600) { stuckT = t; const sg = suggestions()[0]; log(`Stuck? Tip: ${sg ? sg.text : 'retire for tales, then push again'}.`, 'c'); }
    if (autoOn('autolevel')) for (const k of CATS) { const E = S.eq[k]; const list = k === 'pet' ? equippedPets().map(p => p.i) : [E.on]; for (const i of list) if (i >= 0) for (let n = 0; n < 5 && levelEq(k, i); n++); }
    if (autoOn('autosummon') && S.gems >= 210) { const k = CATS.slice().sort((a, b) => S.eq[a].sl - S.eq[b].sl)[0]; summonEq(k, 35, true); }
    if (autoOn('autodungeon') && mode === 'main' && !fainted && S.deepest >= 5) { const d = DUNGEONS.find(q => S.keys[q.id] >= keyMax(q.id)); if (d) startRun(d.id, true); }
    if (S.exped && Date.now() >= S.exped.end && !S.exped.told) { S.exped.told = 1; log(`<b>${allyName(ALLIES.find(a => a.id === S.exped.id))}</b> is back from the expedition! Collect the loot in Allies.`, 'c'); markTab('allies'); }
    weeklyCheck(); applyLocks(); labTick(); autoRetireTick(); if ($('#tutCard').hidden) showTut();
    const ti = titleNow(); if (ti !== lastTitle) { if (lastTitle) log(`New title: <b>${ti}</b>.`, 'g'); lastTitle = ti; }
  }

  /* ---------- drawing extras ---------- */
  function drawProp(type, x, y, th) {
    const c = ctx;
    if (type === 'barrel') { c.fillStyle = '#6b4a33'; c.fillRect(x - 12, y - 30, 24, 30); c.fillStyle = '#3a2a1e'; c.fillRect(x - 12, y - 24, 24, 3); c.fillRect(x - 12, y - 9, 24, 3); }
    else if (type === 'crate') { c.fillStyle = '#7a5a3a'; c.fillRect(x - 14, y - 28, 28, 28); c.strokeStyle = '#4a3324'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 14, y - 28); c.lineTo(x + 14, y); c.moveTo(x + 14, y - 28); c.lineTo(x - 14, y); c.stroke(); }
    else if (type === 'shroom') { c.fillStyle = '#efe3cf'; c.fillRect(x - 4, y - 22, 8, 22); c.fillStyle = th.tint; c.beginPath(); c.ellipse(x, y - 22, 18, 10, 0, Math.PI, 0); c.fill(); }
    else if (type === 'pipe') { c.fillStyle = '#4a5560'; c.fillRect(x - 8, 0, 16, y - 10); c.fillRect(x - 12, y - 14, 24, 8); c.fillStyle = 'rgba(95,199,176,.6)'; c.fillRect(x - 3, y - 6, 6, 6); }
    else if (type === 'web') { c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 40 + k * 20, 50); c.stroke(); } for (let r = 15; r < 50; r += 12) { c.beginPath(); c.arc(x, 0, r, 0.6, Math.PI - 0.6); c.stroke(); } }
    else if (type === 'bones') { c.fillStyle = '#ece4cc'; c.fillRect(x - 14, y - 5, 28, 4); c.fillRect(x - 16, y - 7, 5, 8); c.fillRect(x + 11, y - 7, 5, 8); c.beginPath(); c.arc(x + 22, y - 8, 7, 0, 6.28); c.fill(); }
    else if (type === 'reed') { c.strokeStyle = '#7bbf5a'; c.lineWidth = 3; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 6, y); c.lineTo(x + k * 8, y - 30 - Math.abs(k) * -4); c.stroke(); } }
    else if (type === 'shelf') { c.fillStyle = '#4a3324'; c.fillRect(x - 22, y - 60, 44, 60); const cols = ['#d1495b', '#4f7bd1', '#3c8a5a', '#f5b942', '#8a4fd1']; for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { c.fillStyle = cols[(r * 6 + k) % 5]; c.fillRect(x - 19 + k * 6.5, y - 56 + r * 19, 5, 15); } }
    else if (type === 'cactus') { c.fillStyle = '#5fbf5a'; c.fillRect(x - 5, y - 34, 10, 34); c.fillRect(x - 15, y - 24, 10, 6); c.fillRect(x - 15, y - 30, 6, 10); c.fillRect(x + 5, y - 18, 10, 6); c.fillRect(x + 9, y - 26, 6, 10); }
    else if (type === 'icicle') { c.fillStyle = 'rgba(200,240,255,.7)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x - 24 + k * 14, 0); c.lineTo(x - 18 + k * 14, 0); c.lineTo(x - 21 + k * 14, 18 + (k % 2) * 12); c.fill(); } }
    else if (type === 'rock') { c.fillStyle = '#3a2a2a'; c.beginPath(); c.ellipse(x, y - 8, 22, 12, 0, Math.PI, 0); c.fill(); c.fillStyle = 'rgba(255,138,61,.7)'; c.fillRect(x - 6, y - 10, 3, 3); c.fillRect(x + 6, y - 14, 3, 3); }
    else if (type === 'desk') { c.fillStyle = '#6b4a33'; c.fillRect(x - 22, y - 22, 44, 6); c.fillRect(x - 20, y - 16, 5, 16); c.fillRect(x + 15, y - 16, 5, 16); c.fillStyle = '#efe3cf'; c.fillRect(x - 10, y - 28, 14, 6); }
    else if (type === 'speaker') { c.fillStyle = '#1a1424'; c.fillRect(x - 14, y - 40, 28, 40); c.fillStyle = `hsl(${(t * 120) % 360},80%,60%)`; c.beginPath(); c.arc(x, y - 12, 8 + Math.sin(t * 12) * 1.5, 0, 6.28); c.fill(); c.beginPath(); c.arc(x, y - 30, 5, 0, 6.28); c.fill(); }
    else if (type === 'gear') { c.save(); c.translate(x, y - 40); c.rotate(t * 0.8); c.fillStyle = 'rgba(160,170,190,.5)'; for (let k = 0; k < 8; k++) { c.rotate(Math.PI / 4); c.fillRect(-3, -18, 6, 8); } c.beginPath(); c.arc(0, 0, 12, 0, 6.28); c.fill(); c.restore(); }
    else if (type === 'cloud') { c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(x, 40, 30, 10, 0, 0, 6.28); c.ellipse(x + 18, 34, 18, 9, 0, 0, 6.28); c.fill(); }
    else if (type === 'candy') { c.fillStyle = '#efe3cf'; c.fillRect(x - 2, y - 36, 4, 36); c.fillStyle = '#ff9fd1'; c.beginPath(); c.arc(x, y - 40, 12, 0, 6.28); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.arc(x, y - 40, 6, 0, 5); c.stroke(); }
    else if (type === 'lantern') { c.strokeStyle = '#3a2a2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 30); c.stroke(); c.fillStyle = '#d1203a'; c.beginPath(); c.ellipse(x, 42, 10, 13, 0, 0, 6.28); c.fill(); c.fillStyle = 'rgba(255,200,100,.35)'; c.beginPath(); c.arc(x, 42, 18, 0, 6.28); c.fill(); }
    else if (type === 'gold') { c.fillStyle = '#f5b942'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x - 12 + (k % 3) * 12, y - 4 - Math.floor(k / 3) * 7, 6, 0, 6.28); c.fill(); } c.fillStyle = '#ffe066'; c.fillRect(x - 2, y - 18, 3, 3); }
  }
  function xDrawBack(gy, off) {
    ctx.fillStyle = 'rgba(0,0,0,.16)';
    const ps = 230, po = (off * 0.3) % ps;
    for (let x = -po; x < W + ps; x += ps) ctx.fillRect(x, 0, 22, H - 40);
    if (mode !== 'main') return;
    const th = theme(S.floor), prop = PROPS[th.name] || 'crate', sp = 320, oo = off % sp;
    for (let x = -oo + 150; x < W + 60; x += sp) drawProp(prop, x, H - 40, th);
  }
  function xDrawFront(gy) {
    const hx = heroSX();
    if (!fainted && cloneT > 0) { ctx.globalAlpha = 0.45; sprite(SPR.hero, hx - PX * 3 + hero.lunge * 18, gy - 2, PX, { a: '#62d2c4', b: '#3a3048', c: '#ffffff', d: '#1a1424', e: '#9fe3ff', f: '#ffffff', g: '#9fe3ff' }, false); ctx.globalAlpha = 1; }
    if (!fainted && hero.lunge > 0.6) { ctx.strokeStyle = `rgba(255,255,255,${(hero.lunge - 0.6) * 1.8})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx + PX * 5, gy - PX * 6, PX * 6, -1.1, 0.9); ctx.stroke(); }
    const f = front();
    if (f && f.wind > 0) {
      const ex = sx(f.wx), pulse = 1 + 0.2 * Math.sin(t * 20);
      ctx.fillStyle = 'rgba(255,60,80,.25)'; ctx.beginPath(); ctx.arc(ex, gy - PX * 6 * f.scale, PX * 9 * pulse, 0, 6.28); ctx.fill();
      ctx.fillStyle = '#ff5d73'; ctx.font = `700 ${Math.round(32 * pulse)}px "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.fillText('!', ex, gy - PX * 10 * f.scale - PX * 9);
    }
    for (const q of fx) {
      if (q.type === 'meteor') { const k = 1 - q.life / 0.5, x = sx(q.wx) - 40 + k * 40, y = -20 + k * (gy - PX * 4 + 20); ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.arc(x, y, PX * 2.5, 0, 6.28); ctx.fill(); ctx.fillStyle = 'rgba(255,224,102,.7)'; ctx.beginPath(); ctx.arc(x, y, PX * 1.3, 0, 6.28); ctx.fill(); }
      if (q.type === 'cannon') { const k = 1 - q.life / 0.4; ctx.fillStyle = '#2a2238'; ctx.beginPath(); ctx.arc(q.from + k * (W - q.from), gy - PX * 6 - Math.sin(k * Math.PI) * PX * 8, PX * 1.6, 0, 6.28); ctx.fill(); }
    }
    if (banter && !fainted && S.allies[banter.id]) {
      ctx.font = '600 12px "Nunito", sans-serif';
      const w = ctx.measureText(banter.text).width + 14, cx = clamp(allySX(banter.id), w / 2 + 4, W - w / 2 - 4), by = gy - PX * 14;
      ctx.globalAlpha = clamp(banter.life, 0, 1);
      ctx.fillStyle = '#f1ecff'; ctx.fillRect(cx - w / 2, by - 18, w, 22);
      ctx.fillStyle = '#16131d'; ctx.textAlign = 'center'; ctx.fillText(banter.text, cx, by - 3);
      ctx.globalAlpha = 1;
    }
  }
  function xDrawOverlay() {
    ctx.textAlign = 'center'; ctx.font = '700 14px "Pixelify Sans", monospace';
    if (freezeT > 0) { ctx.fillStyle = 'rgba(159,227,255,.12)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#9fe3ff'; ctx.fillText(`TIME OUT ${freezeT.toFixed(1)}s`, W / 2, 20); }
    if (cloneT > 0) { ctx.fillStyle = '#62d2c4'; ctx.fillText(`CLONE ${Math.ceil(cloneT)}s`, W / 2, freezeT > 0 ? 38 : 20); }
    for (const c of coinFly) {
      if (c.t < 0) continue;
      const k = clamp(c.t / 0.7, 0, 1), e = k * k, x = c.x + (W - 16 - c.x) * e, y = c.y + (14 - c.y) * e - Math.sin(k * Math.PI) * 30;
      ctx.fillStyle = '#f5b942'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 6.28); ctx.fill();
    }
    if (flashT > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(0.8, flashT * 1.6)})`; ctx.fillRect(0, 0, W, H); }
  }

  /* ---------- runs: abyss + boss rush ---------- */
  const ABYSS_CD = 15 * 60e3, RUSH_CD = 60 * 60e3;
  const RUSH_KINDS = ['ogre', 'dragon', 'lich', 'golem', 'dknight', 'clown', 'octopus', 'ninja', 'yeti', 'mummy'];
  function runLabel() {
    const tm = mmss(Math.max(0, run.t));
    if (run.type === 'trial') return `RANK TRIAL ${tm}`;
    if (run.type === 'abyss') return `ABYSS DEPTH ${run.depth + 1} · ${tm}`;
    if (run.type === 'rush') return `BOSS RUSH ${run.k}/10 · ${tm}`;
    if (run.type === 'dailyc') return `DAILY ${run.kills} DOWN · ${tm}`;
    return `${DUNGEONS.find(d => d.id === run.type).name.toUpperCase()} ${tm} · ${run.tier} bars`;
  }
  const runTitle = () => !run ? '' : run.type === 'trial' ? 'Rank trial' : run.type === 'abyss' ? 'Endless Abyss' : run.type === 'rush' ? 'Boss Rush' : run.type === 'dailyc' ? 'Daily challenge' : 'Side dungeon';
  const runSub = () => !run ? themeName(S.floor) : run.type === 'trial' ? `${RANKS[run.rank].n} Examiner` : run.type === 'abyss' ? `Depth ${run.depth + 1} · best ${S.abyssBest}` : run.type === 'rush' ? `Boss ${run.k + 1} of 10` : run.type === 'dailyc' ? `${run.kills} defeated` : DUNGEONS.find(d => d.id === run.type).name;
  function abyssEnemy(d, wx) {
    const base = Math.max(1, Math.floor(S.deepest * 0.6));
    const e = makeEnemy({ boss: true, kind: pick(KINDS), wx });
    e.special = 'abyss'; e.mechs = d >= 5 ? [pick(Object.keys(BOSS_MECH))] : [];
    e.hp = e.max = hpM(base) * 3 * Math.pow(1.22, d); e.dmg = dmgM(base) * 1.2 * Math.pow(1.08, d); e.timer = 20; e.gold = 0;
    e.tint = mix(theme(base).tint, '#6f2cff', Math.min(0.7, d * 0.03));
    e.name = `Abyss ${CNAME[e.kind]}`;
    return e;
  }
  function rushBoss(k, wx, time) {
    const base = Math.max(1, Math.floor(S.deepest * 0.75));
    const e = makeEnemy({ boss: true, kind: RUSH_KINDS[k % RUSH_KINDS.length], wx });
    e.special = 'rush'; e.mechs = k >= 4 ? [pick(Object.keys(BOSS_MECH))] : [];
    e.hp = e.max = hpM(base) * 3 * Math.pow(1.18, k); e.dmg = dmgM(base) * 1.3; e.timer = time; e.gold = 0;
    e.name = `${pick(BOSSES)} (${k + 1}/10)`;
    return e;
  }
  function xStartRun(type) {
    const now = Date.now();
    if (type === 'dailyc') return startDailyCh();
    if (type === 'abyss') {
      if (S.deepest < 20) return false;
      if (now < S.abyssT) { log(`The Abyss opens again in ${mmss((S.abyssT - now) / 1000)}.`); return false; }
      S.abyssT = now + ABYSS_CD;
      run = { type, depth: 0, t: 20, tier: 0, gems: 0, runes: 0, shards: 0 };
      enemies = [abyssEnemy(0, hero.wx + PX * 30)];
      banner = { text: 'ENDLESS ABYSS', sub: 'One life. 20 seconds per monster. How deep can you go?', life: 2.4 };
    } else {
      if (S.deepest < 30) return false;
      if (now < S.rushT) { log(`Boss Rush opens again in ${mmss((S.rushT - now) / 1000)}.`); return false; }
      S.rushT = now + RUSH_CD;
      run = { type, k: 0, t: 90, tier: 0, got: 0, gems: 0 };
      enemies = [rushBoss(0, hero.wx + PX * 30, 90)];
      banner = { text: 'BOSS RUSH', sub: '10 bosses, 90 seconds total', life: 2.4 };
    }
    return true;
  }
  function xSpecialKill(e) {
    const gy = groundY();
    burst(e.wx, gy - PX * 6, e.tint, 26, 220); tone(660, 1320, 0.15, 'triangle', 0.05); hitStop = 0.06;
    if (e.special === 'abyss') {
      run.depth++; run.runes += 2; run.shards += 3; if (run.depth % 3 === 0) run.gems++;
      addFloat(e.wx, gy - PX * 18, `DEPTH ${run.depth}!`, '#b98cff', 20, true);
      if (run.depth > S.abyssBest) S.abyssBest = run.depth;
      enemies = [abyssEnemy(run.depth, e.wx + PX * 22)]; run.t = 20;
    } else {
      run.k++;
      const g = 30 * goldM(Math.max(1, Math.floor(S.deepest * 0.75))) * st.goldMult * (1 + run.k * 0.2);
      earn(g); run.got += g; if (run.k % 2 === 0) run.gems++;
      addFloat(e.wx, gy - PX * 18, `BOSS ${run.k}/10! +${fmt(g)}`, '#f5b942', 18, true);
      if (run.k > S.rushBest) S.rushBest = run.k;
      if (run.k >= 10) { endRun(true); return; }
      enemies = [rushBoss(run.k, e.wx + PX * 22, Math.max(1, e.timer))];
    }
  }
  function xEndRun(r) {
    if (r.type === 'abyss') {
      S.gems += r.gems; S.runes += r.runes; S.shards += r.shards;
      log(`Abyss run over at depth <b>${r.depth}</b> (best ${S.abyssBest}). Loot: ${r.gems} gems, ${r.runes} runes, ${r.shards} shards.`, 'p');
      banner = { text: `DEPTH ${r.depth}`, sub: `+${r.gems} gems, +${r.runes} runes, +${r.shards} shards`, life: 2.4 };
    } else {
      S.gems += r.gems;
      log(`Boss Rush: beat <b>${r.k}/10</b> bosses for ${fmt(r.got)} gold and ${r.gems} gems.${r.k >= 10 ? ' Flawless!' : ''}`, 'g');
      banner = { text: `${r.k}/10 BOSSES`, sub: `+${fmt(r.got)} gold, +${r.gems} gems`, life: 2.4 };
    }
    jingle();
  }
  function xRenderTrials() {
    const now = Date.now(), ab = $('#abyssBtn'), rb = $('#rushBtn');
    const aReady = now >= S.abyssT && S.deepest >= 20 && mode === 'main' && !fainted;
    setText($('#abyssText'), S.deepest < 20 ? 'Reach floor 20 to open the Abyss.' : `Best depth: ${S.abyssBest}. One life, 20 seconds per monster, and every monster is tougher than the last. Loot: 2 runes and 3 shards per depth, 1 gem every 3 depths. Every 15 minutes.` + (now < S.abyssT ? ` Opens again in ${mmss((S.abyssT - now) / 1000)}.` : ''));
    ab.classList.toggle('ok', aReady); ab.disabled = !aReady; setText(ab, run && run.type === 'abyss' ? 'Diving…' : 'Dive in');
    const rReady = now >= S.rushT && S.deepest >= 30 && mode === 'main' && !fainted;
    setText($('#rushText'), S.deepest < 30 ? 'Reach floor 30 to unlock Boss Rush.' : `Best: ${S.rushBest}/10. Beat 10 bosses in 90 seconds total for big gold and a gem for every 2 bosses. Once an hour.` + (now < S.rushT ? ` Opens again in ${mmss((S.rushT - now) / 1000)}.` : ''));
    rb.classList.toggle('ok', rReady); rb.disabled = !rReady;
  }
  $('#abyssBtn').addEventListener('click', () => startRun('abyss'));
  $('#rushBtn').addEventListener('click', () => startRun('rush'));

  /* ---------- expeditions ---------- */
  function startExped(id, h) { if (S.exped || !S.allies[id]) return; S.exped = { id, h, end: Date.now() + h * 3600e3 }; expPick = null; recalc(); log(`<b>${allyName(ALLIES.find(a => a.id === id))}</b> left on a ${h}-hour expedition.`, 'c'); save(); }
  function collectExped() {
    const x = S.exped; if (!x || Date.now() < x.end) return;
    const h = x.h, a = ALLIES.find(q => q.id === x.id);
    const g = Math.max(S.gps, goldM(S.deepest) * st.goldMult) * h * 3600 * 0.15;
    earn(g); S.shards += 12 * h; S.runes += 6 * h;
    const gm = h >= 8 ? 5 : h >= 4 ? 2 : 0; S.gems += gm;
    const items = [];
    for (let k = 0; k < h; k++) if (Math.random() < 0.6) { const cat = pick(CATS), i = rollItem(1 + Math.floor(S.deepest / 12)); giveItem(cat, i); items.push(EQ[cat].names[i]); }
    S.exped = null; S.life.expeds++; recalc();
    log(`${allyName(a)} brought back ${fmt(g)} gold, ${12 * h} shards, ${6 * h} runes${gm ? `, ${gm} gems` : ''}${items.length ? ' and ' + items.join(', ') : ''}.`, 'g');
    jingle(); save();
  }
  function xRenderAllies() {
    const x = S.exped, box = $('#expBox');
    if (x) {
      const a = ALLIES.find(q => q.id === x.id), left = (x.end - Date.now()) / 1000;
      setHTML(box, `<p><b>${allyName(a)}</b> is on a ${x.h}-hour expedition. ${left > 0 ? `Back in ${left > 90 ? dur(left) : 'under 2 minutes'}.` : 'Back now!'}</p><div class="row"><button class="act${left <= 0 ? ' ok heal' : ''}" type="button" data-ex="collect"${left > 0 ? ' disabled' : ''}>Collect loot</button><button class="linkbtn" type="button" data-ex="cancel">Call it off</button></div>`);
    } else {
      const h = hiredList();
      setHTML(box, h.length ? `<p>Send one ally away to gather loot. They don't fight while they're gone. Longer trips bring more gold, shards, runes, gems and gear.</p><div class="row">${h.map(a => `<button class="pill${expPick === a.id ? ' hot' : ''}" type="button" data-ex="pick" data-id="${a.id}">${allyName(a)}</button>`).join('')}</div><div class="row">${[1, 4, 8].map(n => `<button class="act${expPick ? ' ok heal' : ''}" type="button" data-ex="go" data-h="${n}"${expPick ? '' : ' disabled'}>${n} hour${n > 1 ? 's' : ''}</button>`).join('')}</div>` : '<p>Hire an ally first, then send them on expeditions for loot.</p>');
    }
  }
  $('#expBox').addEventListener('click', e => {
    const b = e.target.closest('[data-ex]'); if (!b) return;
    audio();
    const a = b.dataset.ex;
    if (a === 'pick') expPick = b.dataset.id;
    if (a === 'go' && expPick) startExped(expPick, +b.dataset.h);
    if (a === 'collect') collectExped();
    if (a === 'cancel' && S.exped) { log('Expedition called off. Nothing found.'); S.exped = null; recalc(); save(); }
    xRenderAllies();
  });

  /* ---------- ascend ---------- */
  const ascendGain = () => S.deepest < 80 ? 0 : Math.max(1, Math.floor(0.4 * Math.log(1 + 0.1 * S.tales) / Math.log(1.5) + (S.deepest - 80) / 100));
  let ascendArm = 0;
  function ascend() {
    const g = ascendGain(); if (!g || mode !== 'main') return;
    if (ascendArm < performance.now()) { ascendArm = performance.now() + 4000; xRenderLegacy(); return; }
    ascendArm = 0;
    const life = S.life; life.ascends = (life.ascends || 0) + 1;
    const keep = { unl: S.unl, tutQ: S.tutQ, lab: S.lab, labJobs: S.labJobs, mileDone: S.mileDone, evMonth: S.evMonth, tal: S.tal, chDone: S.chDone, lshop: S.lshop, ltok: S.ltok, heir: S.heir, evoPath: S.evoPath, camp: S.camp, pass: S.pass, maps: S.maps, fish: S.fish, dailyCh: S.dailyCh, skOwn: S.skOwn, skCp: S.skCp, skLv: S.skLv, evTok: S.evTok, sock: S.sock, gemInv: S.gemInv, look: S.look, cos: S.cos, cosOwn: S.cosOwn, stars: S.stars + g, rank: S.rank, life, ach: S.ach, relics: S.relics, gems: S.gems, runes: S.runes, shards: S.shards, eq: S.eq, prefix: S.prefix, wlv: S.wlv, ench: S.ench, locks: S.locks, evo: S.evo, set: S.set, muted: S.muted, amt: S.amt, auto: S.auto, tab: S.tab, dev: S.dev, cls: S.cls, abyssBest: S.abyssBest, rushBest: S.rushBest, abyssT: S.abyssT, rushT: S.rushT, grottoT: S.grottoT, keys: S.keys, keyT: S.keyT, daily: S.daily, loadout: S.loadout, weekly: S.weekly, seenVer: S.seenVer, eqSel: S.eqSel, eqCat: S.eqCat, quests: S.quests, runs: S.runs };
    resetRun(keep);
    log(`Ascended! +${g} stars (${S.stars} total). Everything is ×${Math.pow(1.5, S.stars).toFixed(1)} stronger forever.`, 'p');
    banner = { text: 'ASCENDED', sub: `${S.stars} stars`, life: 3 }; flashT = 0.6; jingle(); save(); refreshAll();
  }
  $('#ascBtn').addEventListener('click', () => { audio(); ascend(); });
  function xRenderLegacy() {
    const g = ascendGain(), b = $('#ascBtn'), armed = ascendArm > performance.now();
    setText($('#ascText'), S.deepest < 80 ? `Reach floor 80 to unlock Ascending (deepest ${S.deepest}). Ascending is a bigger reset: your tales and floors go too, but you get stars. More tales and a deeper floor give more stars. Each star is ×1.5 damage, health and gold forever. You keep ranks, equipment, relics, class evolutions, achievements, gems, runes and shards.${S.stars ? ` You have ${S.stars} stars.` : ''}` : `Ascend now for +${g} star${g > 1 ? 's' : ''} (you have ${S.stars}). Resets tales and floors as well as everything a retire resets. Keeps ranks, equipment, relics, class evolutions, achievements and currencies. More tales give more stars, so retire a few times first.`);
    b.disabled = !g || mode !== 'main'; b.classList.toggle('armed', armed);
    setText(b, !g ? 'Reach floor 80' : armed ? `Tap again to ascend for +${g} stars` : `Ascend for +${g} stars`);
    setHTML($('#records'), [['Fastest boss', S.life.fastBoss ? S.life.fastBoss.toFixed(2) + 's' : '—'], ['Best DPS', fmt(S.life.bestDps)], ['Best pull', S.life.bestPull >= 0 ? `${GRADES[Math.floor(S.life.bestPull / 4)].n} ${TIERN[S.life.bestPull % 4]}` : '—'], ['Abyss depth', S.abyssBest], ['Boss Rush', S.rushBest + '/10'], ['Parries', S.life.parries], ['Rare monsters', S.life.rares], ['Guardians', S.life.guardians], ['Ascends', S.life.ascends || 0]].map(([l, v]) => `<div><span class="lbl">${l}</span><b>${v}</b></div>`).join(''));
    setText($('#titleLine'), `Title: ${titleNow()}`);
  }

  /* ---------- weekly quest ---------- */
  const weekNo = () => Math.floor((Date.now() / 864e5 + 3) / 7);
  function weeklyCheck() {
    if (S.weekly && S.weekly.week === weekNo() && QT[S.weekly.type]) return;
    const types = ['kill', 'boss', 'chest', 'elite', 'variant', 'taps', 'skill', 'goblin', 'dungeon', 'summon'];
    const type = pick(types), base = QT[type].n();
    S.weekly = { week: weekNo(), type, n: type === 'goblin' ? 5 : type === 'summon' ? 70 : type === 'dungeon' ? 10 : base * 12, prog: 0, done: false, gems: 40 };
  }
  function weeklyEvent(type, amt) {
    const w = S.weekly; if (!w || w.done || w.type !== type) return;
    w.prog += amt;
    if (w.prog >= w.n) { w.prog = w.n; w.done = true; log(`Weekly quest done: <b>${QT[type].text(w.n)}</b>! Claim it in Quests.`, 'p'); markTab('quests'); }
  }
  function xRenderQuests() {
    weeklyCheck();
    const w = S.weekly, ms = ((weekNo() + 1) * 7 - 3) * 864e5 - Date.now();
    setHTML($('#weeklyBox'), `<div class="shophead"><h3>Weekly quest</h3><span class="lbl">Resets in ${dur(ms / 1000)}</span></div><p>${QT[w.type].text(w.n)} · ${Math.floor(w.prog)} / ${w.n}</p><div class="qbar"><i style="width:${pct(clamp(w.prog / w.n, 0, 1))}"></i></div><div class="row"><button class="act${w.done && !w.claimed ? ' ok heal' : ''}" type="button" data-wk="1"${w.done && !w.claimed ? '' : ' disabled'}>${w.claimed ? 'Claimed. New quest next week.' : `Claim ${w.gems} gems, 50 runes, 50 shards`}</button></div>`);
  }
  $('#weeklyBox').addEventListener('click', e => {
    if (!e.target.closest('[data-wk]')) return;
    const w = S.weekly; if (!w || !w.done || w.claimed) return;
    audio(); w.claimed = true; S.gems += w.gems; S.runes += 50; S.shards += 50;
    log(`Weekly reward: +${w.gems} gems, +50 runes, +50 shards.`, 'p'); jingle(); save(); xRenderQuests();
  });

  /* ---------- skill loadout ---------- */
  function xRenderSkills() {
    setHTML($('#loadout'), SKILLS.filter(unlocked).map(s => `<button type="button" class="chip${S.loadout.includes(s.id) ? ' got' : ''}" data-lo="${s.id}" aria-pressed="${S.loadout.includes(s.id)}">${s.name}</button>`).join('') || '<span class="hint">Reach floor 3 to unlock your first skill.</span>');
  }
  $('#loadout').addEventListener('click', e => {
    const b = e.target.closest('[data-lo]'); if (!b) return;
    const id = b.dataset.lo, L = S.loadout.filter(Boolean);
    if (L.includes(id)) { if (L.length > 1) S.loadout = L.filter(x => x !== id); }
    else { if (L.length >= 5) L.pop(); L.push(id); S.loadout = L; }
    buildSkillbar(); xRenderSkills(); save();
  });

  /* ---------- helpers: next step, breakdown, log, share ---------- */
  function suggestions() {
    const out = [], add = (c, text, tab) => { if (c) out.push({ text, tab }); };
    add(dailyReady(), 'open your daily chest in Quests', 'quests');
    add(S.quests.some(q => q.done) || (S.weekly && S.weekly.done && !S.weekly.claimed), 'claim your finished quests in Quests', 'quests');
    add(S.exped && Date.now() >= S.exped.end, 'collect your expedition loot in Allies', 'allies');
    add(RANKS[S.rank + 1] && S.deepest >= RANKS[S.rank + 1].need, `take the ${RANKS[S.rank + 1] ? RANKS[S.rank + 1].n : ''} rank trial in Trials`, 'trials');
    add(evoReady(), 'evolve your class in Hero', 'hero');
    add(PARTS.some(p => atCap(p) && S.gold >= pevoCost(p).gold && S.shards >= pevoCost(p).shards), 'evolve a training part in Train', 'train');
    add(CATS.some(k => S.eq[k].c.some((c, i) => c >= 5 && i < 23)), 'merge your duplicate gear in Equip', 'equip');
    add(S.gems >= 50, `spend your ${S.gems} gems on an equipment summon in Equip`, 'equip');
    add(ALLIES.some(a => S.deepest >= a.unlock && !S.allies[a.id] && S.gold >= allyCost(a)), 'hire a new ally in Allies', 'allies');
    add(!S.exped && hiredList().length > 1, 'send an ally on an expedition in Allies', 'allies');
    add(S.deepest >= 5 && mode === 'main' && DUNGEONS.some(d => S.keys[d.id] > 0), 'use your dungeon keys in Trials', 'trials');
    add(S.deepest >= 20 && Date.now() >= S.abyssT, 'dive into the Endless Abyss in Trials', 'trials');
    add(PARTS.some(p => !atCap(p) && S.gold >= costOf(p.base, p.r, S.lv[p.id], 1)), 'buy training upgrades in Train', 'train');
    add(SKILLS.some(s => unlocked(s) && S.gold >= skillCost(s)), 'level up a skill in Skills', 'skills');
    add(S.farm && talesFor(S.maxFloor) > 0, `retire for ${talesFor(S.maxFloor)} tales in Legacy`, 'legacy');
    add(ascendGain() > 0, `ascend for ${ascendGain()} stars in Legacy`, 'legacy');
    return out;
  }
  function showNext() {
    const s = suggestions();
    if (!s.length) { log('Nothing urgent. Keep tapping!', 'c'); return; }
    log(`Next up: <b>${s[0].text}</b>.${s[1] ? ` After that: ${s[1].text}.` : ''}`, 'c');
    showTab(s[0].tab);
  }
  function breakdown() {
    const lv = S.lv, C = S.cls, T = clsTier(C), mile = L => Math.pow(BAL.mile, Math.floor(L / 25));
    const sw = 3 * (1 + 0.6 * lv.sword) * Math.pow(BAL.lvGrowth, lv.sword) * mile(lv.sword) * Math.pow(3, ptier('sword'));
    const D = [['Sword training', sw], ['Tales', 1 + 0.1 * S.tales], ['Relics', rel('dmg')], ['Weapon piece', eqEquip('weapon')], ['Weapon prefix', S.prefix.pm || 1], ['Weapon forge', 1 + 0.12 * S.wlv],
      ['Owned weapons and pets', 1 + ownedSum('weapon') + ownedSum('pet') * (C === 'necro' ? [1, 1.5, 2, 3][T] : 1)], ['Achievements', 1 + 0.03 * achCount()], ['Collection', 1 + 0.01 * bookCount()], ['Rank', Math.pow(BAL.rankDmg, S.rank)],
      ['Stars', Math.pow(1.5, S.stars || 0)], ['Set bonus', setInfo().mul], ['Class', (C === 'berserker' ? [1.4, 1.8, 2.4, 3.5][T] : 1) * (C === 'peasant' ? [1, 1.15, 1.35, 1.7][T] : 1)], ['Enchants', 1 + ench('dmg')]];
    const G = [['Lucky Ring', st.ringGold], ['Tales', 1 + 0.1 * S.tales], ['Relics', rel('gold')], ['Accessory', eqEquip('acc')], ['Owned accessories', 1 + ownedSum('acc')], ['Rank', Math.pow(1.1, S.rank)], ['Stars', Math.pow(1.5, S.stars || 0)], ['Set bonus', setInfo().mul], ['Bestiary', 1 + 0.05 * beastsMastered()], ['Enchants', 1 + ench('gold')]];
    const row = (n, v, base) => `<div class="brow"><span>${n}</span><b>${base ? fmt(v) : '×' + fmt2(v)}</b></div>`;
    $('#breakBody').innerHTML = `<h3>Damage per swing: ${fmt(st.dmg)}</h3>` + D.map((x, i) => row(x[0], x[1], i === 0)).join('') +
      `<p class="hint" style="display:block">Taps hit for ${fmt(st.tap)}. Crits do ×${st.critMult.toFixed(2)} damage at ${pct1(st.crit)} chance. Combos add up to ×${st.comboMax.toFixed(2)}. Swings: ${(1 / st.atkInt).toFixed(2)} per second.</p>` +
      `<h3>Gold: ×${fmt2(st.goldMult)}</h3>` + G.map(x => row(x[0], x[1])).join('') +
      `<h3>Health: ${fmt(st.maxHp)}</h3><p class="hint" style="display:block">You take ${pct(1 - st.taken)} less damage and heal ${fmt(st.regen)} per second.</p>`;
    $('#breakModal').hidden = false;
  }
  let logFilter = 'all';
  function renderFullLog() {
    const map = { loot: ['t', 'p', 'u'], gold: ['g'], danger: ['r'], all: null }, f = map[logFilter];
    $('#fullLog').innerHTML = fullLog.filter(x => !f || f.includes(x.cls)).map(x => `<li class="${x.cls}"><span class="lt">${new Date(x.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> ${x.html}</li>`).join('') || '<li>Nothing here yet.</li>';
    for (const b of document.querySelectorAll('#logFilters button')) b.setAttribute('aria-pressed', String(b.dataset.f === logFilter));
  }
  function openLog() { renderFullLog(); $('#logModal').hidden = false; }
  $('#logFilters').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; logFilter = b.dataset.f; renderFullLog(); });
  $('#nextBtn').addEventListener('click', showNext);
  $('#breakBtn').addEventListener('click', breakdown);
  $('#logBtn').addEventListener('click', openLog);
  $('#mergeEvery').addEventListener('click', () => { let n = 0; for (const k of CATS) n += mergeAll(k) || 0; if (!n) log('Nothing to merge in any slot.'); renderEquip(); });
  function shareCard() {
    const c = document.createElement('canvas'); c.width = 600; c.height = 320;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.fillStyle = '#16131d'; x.fillRect(0, 0, 600, 320); x.fillStyle = theme(S.floor).wall; x.fillRect(16, 16, 568, 288);
    x.fillStyle = '#f5b942'; x.font = '700 40px "Pixelify Sans", monospace'; x.fillText('Coin Crawl', 40, 70);
    x.fillStyle = '#f1ecff'; x.font = '600 20px "Nunito", sans-serif';
    const lines = [`${clsName()} · ${RANKS[S.rank].n} rank${S.stars ? ` · ${S.stars} stars` : ''}`, `Deepest floor ${S.deepest} · Abyss depth ${S.abyssBest}`, `Best combo ${S.life.bestCombo} · ${fmt(S.life.kills)} monsters`, `Weapon: ${S.eq.weapon.on >= 0 ? EQ.weapon.names[S.eq.weapon.on] : 'Stick'}`, `Title: ${titleNow()}`];
    lines.forEach((l, i) => x.fillText(l, 40, 115 + i * 34));
    const img = new Image();
    img.onload = () => { x.drawImage(img, 430, 100, 120, 120); $('#shareImg').src = c.toDataURL(); };
    img.src = heroIcon(S.cls);
    $('#shareText').value = `I'm a ${clsName()} on floor ${S.deepest} in Coin Crawl, ${RANKS[S.rank].n} rank, best combo ${S.life.bestCombo}. Title: ${titleNow()}.`;
    setText($('#shareMsg'), '');
    $('#shareModal').hidden = false;
  }
  $('#shareBtn').addEventListener('click', shareCard);
  $('#shareCopy').addEventListener('click', () => {
    const ta = $('#shareText');
    try { navigator.clipboard.writeText(ta.value).then(() => setText($('#shareMsg'), 'Copied.'), () => { ta.select(); setText($('#shareMsg'), 'Select the text and copy it.'); }); } catch (e) { ta.select(); setText($('#shareMsg'), 'Select the text and copy it.'); }
  });
  function xSettingsExtra() {
    $('#setExtra').innerHTML = `<label class="lbl" for="volIn">Volume</label><input type="range" id="volIn" min="0" max="1" step="0.05" value="${S.set.vol}"><label class="lbl" for="resIn">Keep at least this many shards when holding buttons or auto-leveling</label><input type="number" id="resIn" min="0" value="${S.set.reserve || 0}">`;
    $('#volIn').addEventListener('input', e => { S.set.vol = +e.target.value; save(); });
    $('#resIn').addEventListener('change', e => { S.set.reserve = Math.max(0, Math.floor(+e.target.value || 0)); save(); });
  }
  function xHud() {
    setText($('#titleChip'), titleNow());
    const u = $('#ultBtn');
    if (u) { u.style.setProperty('--p', (1 - ultC / 100).toFixed(3)); u.classList.toggle('ready', ultC >= 100); setText(u.querySelector('.ultp'), ultC >= 100 ? 'READY' : Math.floor(ultC) + '%'); }
  }

  /* ---------- offline, title screen, music ---------- */
  function xOffline() {
    if (!S.lastSeen) return '';
    const away = Math.min(8 * 3600, (Date.now() - S.lastSeen) / 1000);
    if (away < 60) return '';
    const g = S.gps > 0 ? S.gps * away * 0.5 : 0;
    const sh = Math.floor(away / 600 * (1 + S.deepest / 25)), ru = Math.floor(sh / 2);
    S.gold += g; S.life.goldEarned += g; S.shards += sh; S.runes += ru;
    const msg = `You were gone for ${dur(away)}. Your hero found <b>${fmt(g)} gold</b>, <b>${sh} shards</b> and <b>${ru} runes</b>.${S.exped && Date.now() >= S.exped.end ? ' Your expedition is back too.' : ''}`;
    log(msg, 'g');
    if (g > 0) banner = { text: 'WELCOME BACK', sub: `+${fmt(g)} gold while you were away`, life: 3 };
    return msg;
  }
  const CHANGES = ['Roomier, easier-to-read menus, and a bottom tab bar on phones', 'Tips that explain each feature when it unlocks', 'Crash and freeze fixes, plus automatic save backups', 'Rebalanced economy: monsters, gold, training, allies, pets, combo, ranks and stars were retuned so power no longer runs away', 'Features now unlock as you go deeper and retire, with a teaser showing what opens each one', 'Research lab (after 3 retires): timed projects that keep running while you are away', 'Floor milestones: one-time rewards for your best floor, with Legendary gear every 50 floors', 'Auto-retire (after 5 retires) and 5 new achievements', 'Ascending now keeps your ranks, and stars come from tales and depth', 'Branching class evolutions: two paths at every step', 'Skill summon with 18 new skills, from Double Slash to Black Hole', 'Helmets and boots, gem sockets, a daily featured banner, a wardrobe with hats, capes and weapon looks', 'Talents, challenges, a legacy shop and heirlooms', 'Daily challenge, treasure maps, fishing, a camp, floor events and mini-bosses', 'A monthly event and pass, a leaderboard and cloud save', 'A light menu theme, an auto-buy focus and a How to play guide', 'Endless Abyss and Boss Rush in Trials, plus the Gem Grotto dungeon', 'Expeditions: send allies away for loot', 'Ascend: a second prestige layer with stars', 'Gear awakening, pet evolution, set bonuses and up to 3 pets with skills', 'Healer Frog and Cannon Crab, and allies now evolve at levels 10 and 25', 'Necromancer and Minstrel classes, plus a fourth evolution for every class', 'Three new skills, a skill bar you pick, and an ultimate (U)', '5 new monsters, 6 new areas, floor guardians, rare monsters and boss parries', 'Weekly quest, titles, records, stat breakdown, full log and a share card', 'Music, flying coins, hit pauses, props and many quality-of-life settings'];
  function showTitle(report) {
    const returning = S.life.kills > 0, isNew = (S.seenVer || 0) < VER && returning;
    $('#titleHero').src = heroIcon(S.cls);
    setText($('#titleSub'), returning ? `${clsName()} · ${RANKS[S.rank].n} rank · Floor ${S.floor} · ${titleNow()}` : 'An idle dungeon crawler. Tap, upgrade, go deeper.');
    setHTML($('#titleNews'), (report ? `<div class="box"><h3>While you were away</h3><p>${report}</p></div>` : '') + (isNew ? `<div class="box"><h3>New in this update</h3><ul class="news">${CHANGES.map(c => `<li>${c}</li>`).join('')}</ul></div>` : ''));
    setText($('#titleGo'), returning ? 'Continue' : 'Start');
    $('#titleModal').hidden = false;
    setTimeout(() => $('#titleGo').focus({ preventScroll: true }), 30);
  }
  $('#titleGo').addEventListener('click', () => { audio(); S.seenVer = VER; $('#titleModal').hidden = true; if (!S.life.kills && !(S.unl && S.unl.start)) { S.unl.start = 1; queueTut('start'); } save(); startMusic(); });
  const MPAT = [[0, -1, 2, -1, 4, 2, -1, 1], [0, 2, 4, 5, 4, 2, 0, -1], [4, -1, 3, 2, 0, -1, 2, -1], [0, 0, 4, -1, 5, 4, 2, -1], [2, 4, 6, 4, 2, -1, 0, -1]];
  let musicOn = false, mStep = 0;
  function startMusic() { if (musicOn) return; musicOn = true; setInterval(musicTick, 190); }
  function musicTick() {
    if (!AC || S.muted || !S.set.music || document.hidden) return;
    const ti = THEMES.indexOf(theme(S.floor)), base = [220, 196, 247, 262, 233, 208, 185, 175][ti % 8] * (mode === 'run' ? 0.84 : 1);
    const sc = [0, 2, 3, 5, 7, 9, 10, 12], pat = MPAT[ti % MPAT.length], n = pat[mStep % pat.length];
    if (n >= 0) { const fq = base * Math.pow(2, sc[n] / 12); tone(fq, fq * 0.995, 0.16, 'triangle', 0.012); }
    if (mStep % 4 === 0) tone(base / 2, base / 2, 0.3, 'square', 0.006);
    if (mStep % 8 === 6 && mode === 'run') tone(base * 2, base * 2, 0.05, 'square', 0.005);
    mStep++;
  }

  /* ================= expansion 2e: leaderboard, cloud save, guide ================= */
  let DB = null, USER = null, myId = null, boardRows = [], boardState = 'loading', lastPostDeep = 0, lastPostT = 0, lastCloudT = 0, cloudArm = 0, cloudMsg = '';
  (async () => {
    try {
      if (!window.claude || typeof window.claude.use !== 'function') { boardState = 'off'; renderOnline(); return; }
      const [d, u] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      DB = d; USER = u; myId = u ? await u.id() : null;
      if (!DB) { boardState = 'off'; renderOnline(); return; }
      const timer = setTimeout(() => { if (boardState === 'loading') { boardState = 'slow'; renderOnline(); } }, 10000);
      DB.collection('board').orderBy('deepest', 'desc').limit(50).onSnapshot(snap => {
        if (!snap.metadata.fromCache) clearTimeout(timer);
        boardRows = snap.docs.map(x => Object.assign({ id: x.id }, x.data()));
        boardState = 'ok'; renderOnline();
      }, () => { clearTimeout(timer); boardState = 'error'; renderOnline(); });
      renderOnline();
    } catch (e) { boardState = 'off'; renderOnline(); }
  })();
  async function postScore(manual) {
    if (!DB || !myId) { if (manual) { cloudMsg = 'The leaderboard is only available inside Claude while signed in.'; renderOnline(); } return; }
    try {
      await DB.doc('board/' + myId).set({ deepest: S.deepest, abyss: S.abyssBest, rush: S.rushBest, stars: S.stars || 0, cls: clsName(), title: titleNow(), combo: S.life.bestCombo, kills: S.life.kills, at: Date.now() });
      lastPostDeep = S.deepest; lastPostT = Date.now();
      if (manual) { cloudMsg = 'Score posted.'; log('Posted your score to the leaderboard.', 't'); }
    } catch (e) { cloudMsg = e && e.code === 'invalid_argument' ? "Your access to this game doesn't allow posting scores." : 'Could not post right now. Try again in a bit.'; }
    renderOnline();
  }
  async function cloudSave(manual) {
    if (!DB || !myId) { if (manual) { cloudMsg = 'Cloud save needs Claude and a signed-in account. Use the save code above instead.'; renderOnline(); } return; }
    try { await DB.doc('data/users/' + myId + '/save').set({ code: btoa(unescape(encodeURIComponent(JSON.stringify(S)))), floor: S.floor, deepest: S.deepest, at: Date.now() }); lastCloudT = Date.now(); cloudMsg = manual ? 'Saved to your cloud slot.' : cloudMsg; }
    catch (e) { cloudMsg = e && e.code === 'invalid_argument' ? "Your access to this game doesn't include a cloud slot." : 'Cloud save failed. Your game is still saved in this browser.'; }
    renderOnline();
  }
  async function cloudLoad() {
    if (!DB || !myId) return;
    try {
      const snap = await DB.doc('data/users/' + myId + '/save').get();
      if (!snap.exists) { cloudMsg = 'Your cloud slot is empty. Save to it first.'; renderOnline(); return; }
      const d = snap.data();
      if (cloudArm < performance.now()) { cloudArm = performance.now() + 4000; cloudMsg = `Cloud save from ${new Date(d.at).toLocaleString()} (floor ${d.floor}, deepest ${d.deepest}). Press Load again to replace this game.`; renderOnline(); return; }
      cloudArm = 0;
      S = migrate(JSON.parse(decodeURIComponent(escape(atob(d.code))))); recalc(); hero.hp = st.maxHp; enemies = []; mode = 'main'; run = null; save();
      cloudMsg = 'Loaded your cloud save.'; log('Loaded your cloud save.', 't'); refreshAll();
    } catch (e) { cloudMsg = 'Could not load the cloud save.'; }
    renderOnline();
  }
  function onlineTick() {
    if (!DB || !myId) return;
    if (S.deepest >= lastPostDeep + 5 && Date.now() - lastPostT > 120e3 && S.deepest >= 10) postScore(false);
    if (S.set.cloudauto !== false && Date.now() - lastCloudT > 600e3 && S.life.kills > 50) cloudSave(false);
  }
  async function renderOnline() {
    const box = $('#boardBox'), cb = $('#cloudBox');
    if (cb) setHTML(cb, DB && myId ? `<p>Your private cloud slot. Only you can read it. It also saves itself every 10 minutes and when you retire${S.set.cloudauto === false ? ' (turned off in settings)' : ''}.</p><div class="row"><button class="act ok heal" type="button" data-cl="save">Save to cloud</button><button class="act ok gold" type="button" data-cl="load">Load from cloud</button></div><p>${cloudMsg}</p>` : `<p>Cloud save works when the game is open in Claude and you're signed in. Here, use the save code above.</p>`);
    if (!box) return;
    if (boardState === 'off') { setHTML(box, '<p>The leaderboard works when the game is open in Claude and you\'re signed in.</p>'); return; }
    if (boardState === 'loading') { setHTML(box, '<p>Loading the leaderboard…</p>'); return; }
    if (boardState === 'slow') { setHTML(box, "<p>The leaderboard can't be reached yet. It will appear when the connection comes back.</p>"); return; }
    if (boardState === 'error') { setHTML(box, '<p>The leaderboard is unavailable right now.</p>'); return; }
    const ids = boardRows.map(r => r.id);
    let ps = {};
    try { if (USER && ids.length) ps = await USER.profiles(ids); } catch (e) {}
    const rows = boardRows.map((r, k) => `<div class="brow${r.id === myId ? ' me' : ''}"><span><b>${k + 1}.</b> <span data-name="${k}"></span>${r.id === myId ? ' (you)' : ''} · <span class="hint" style="display:inline">${r.cls || ''}${r.title ? ' · ' + r.title : ''}</span></span><b>Floor ${r.deepest || 0}${r.abyss ? ` · Abyss ${r.abyss}` : ''}${r.stars ? ` · ★${r.stars}` : ''}</b></div>`).join('');
    box.innerHTML = (rows || '<p>No scores yet. Be the first!</p>') + `<div class="row"><button class="act ok gem" type="button" data-cl="post">Post my score</button><span class="hint">Scores also post themselves as you go deeper.</span></div>`;
    boardRows.forEach((r, k) => { const el = box.querySelector(`[data-name="${k}"]`); if (el) el.textContent = (ps[r.id] && ps[r.id].name) || 'Someone'; });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cl]'); if (!b) return;
    audio();
    if (b.dataset.cl === 'post') postScore(true);
    if (b.dataset.cl === 'save') cloudSave(true);
    if (b.dataset.cl === 'load') cloudLoad();
  });

  const GUIDE = [
    ['Unlocking things', 'You start with just Train. New tabs and features open as you reach deeper floors and retire, and a dashed box shows what opens each locked one. Auto-buy opens at floor 8, retiring and the Hero tab at floor 10, and the Research lab after 3 retires.'],
    ['The basics', 'Your hero runs and fights on their own. Tap the dungeon to hit harder, and keep tapping for a combo. Spend gold in Train. Every 10 kills is a boss with a 30-second timer. Lose, and you farm that floor until you press Fight boss.'],
    ['Getting stronger', 'Train upgrades your stats with gold. Equip gives you weapons, armor, helmets, boots, accessories and pets from gem summons. Forge enhances your weapon slot and holds enchants and gem sockets. Skills fire on their own, and you pick which 5 sit on your bar.'],
    ['Permanent progress', 'Retire (Legacy) for tales and legacy tokens, then pick a class. Rank trials (Trials) multiply everything forever. Class evolutions branch two ways at each step. Talents, achievements, relics, the collection and the bestiary all stack up. Ascend at floor 80 for stars, the biggest multiplier.'],
    ['Things to do every day', 'Daily chest and quests (Quests), the daily challenge, the Abyss every 15 minutes, Boss Rush every hour, side dungeons with keys, 5 fishing casts, camp collection, expeditions, and the monthly event and pass.'],
    ['Combat tips', 'Tap a boss when the red ! appears to parry its smash. Your ultimate (U) charges from taps and kills. Shiny, rare and mini-boss monsters drop the best stuff. Floor events like Gold Rush or Blood Moon change the rules for one floor.'],
    ['Research and milestones', 'The Research lab (Legacy) runs timed projects for runes and shards, even while you are away. You get a second slot at your first star. Floor milestones (Quests) pay once for your best floor ever, with a Legendary piece every 50 floors.'],
    ['Stuck?', 'Press "What should I do next?" under the dungeon. Check Stat breakdown to see where your power comes from. Usually the answer is: retire for tales, take a rank trial, or merge and level your gear.']
  ];
  function openGuide() { setHTML($('#guideBody'), GUIDE.map(([h2, p]) => `<h3>${h2}</h3><p>${p}</p>`).join('')); $('#guideModal').hidden = false; }
  $('#guideBtn').addEventListener('click', openGuide);
  $('#titleGuide').addEventListener('click', () => { $('#titleGo').click(); openGuide(); });

  /* ================= expansion 2d: events, minigames, camp, pass ================= */
  const FLOOR_EVENTS = [
    { id: 'goldrush', n: 'Gold Rush', text: '×2 gold on this floor', gold: 2 },
    { id: 'bloodmoon', n: 'Blood Moon', text: 'monsters have ×1.5 health and drop ×3 gold', hp: 1.5, gold: 3 },
    { id: 'fog', n: 'Fog', text: 'monsters dodge 15% of swings, +30% gold', dodge: 0.15, gold: 1.3 },
    { id: 'breeze', n: 'Lucky Breeze', text: 'chests are 3× as likely', chest: 3 },
    { id: 'blackout', n: 'Blackout', text: 'the lights are out, +60% gold', gold: 1.6, dark: true },
    { id: 'swarm', n: 'Swarm', text: 'every monster is tiny', tiny: true, gold: 1.2 }
  ];
  let floorEv = null, evFloor = -1;
  const evGold = () => floorEv && floorEv.gold ? floorEv.gold : 1;
  const evChest = () => floorEv && floorEv.chest ? floorEv.chest : 1;
  function xUpdate3(dt) {
    if (run && run.type === 'dailyc' && !fainted) { run.t -= dt; if (run.t <= 0) { endRun(true); return; } }
    if (S.floor !== evFloor) {
      evFloor = S.floor;
      floorEv = mode === 'main' && S.floor > 3 && Math.random() < 0.18 ? pick(FLOOR_EVENTS) : null;
      if (floorEv) log(`Floor event: <b>${floorEv.n}</b>, ${floorEv.text}.`, 'c');
    }
  }
  function xEnemy2(e) {
    if (floorEv && !e.special) { if (floorEv.hp) e.hp = e.max = e.hp * floorEv.hp; if (floorEv.tiny && !e.boss) { e.scale = 0.7; e.hp = e.max = e.hp * 0.5; } }
    if (!e.boss && !e.minion && !e.rare && S.floor >= 8 && Math.random() < 0.04) { e.mini = true; e.name = 'Mini-boss ' + CNAME[e.kind]; e.hp = e.max = e.hp * 3.5; e.scale = 1.2; e.gold *= 5; e.variant = null; }
    return e;
  }
  function drawEventOverlay() {
    if (!floorEv || mode !== 'main') return;
    if (floorEv.dark) { const g = ctx.createRadialGradient(heroSX(), groundY() - PX * 5, PX * 6, heroSX(), groundY() - PX * 5, W * 0.7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.75)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    if (floorEv.id === 'bloodmoon') { ctx.fillStyle = 'rgba(180,20,40,.12)'; ctx.fillRect(0, 0, W, H); }
    if (floorEv.id === 'fog') { ctx.fillStyle = 'rgba(200,200,220,.12)'; ctx.fillRect(0, 0, W, H); }
    ctx.textAlign = 'center'; ctx.font = '700 12px "Pixelify Sans", monospace'; ctx.fillStyle = '#ffe066';
    ctx.fillText(floorEv.n.toUpperCase(), W / 2, H - 14);
  }

  /* ---------- daily challenge run ---------- */
  const DAILY_MODS = ['giant', 'speedy', 'armored', 'ghostly', 'vampire'];
  const dailyMod = () => DAILY_MODS[dayNo() % DAILY_MODS.length];
  const dailyDone = () => S.dailyCh && S.dailyCh.day === dayNo();
  function dailyEnemy(wx, time) {
    const base = Math.max(1, Math.floor(S.deepest * 0.7));
    const e = makeEnemy({ boss: true, kind: pick(KINDS.slice(0, 24)), wx });
    e.special = 'dailyc'; e.mechs = []; e.variant = dailyMod(); e.scale = e.variant === 'giant' ? 1.5 : 1.2;
    e.hp = e.max = hpM(base) * 1.5 * (VARIANTS[e.variant].hp || 1); e.dmg = dmgM(base) * 1.2; e.timer = 9999; e.gold = 0;
    if (e.variant === 'speedy') e.int = 0.85;
    e.name = `${VARIANTS[e.variant].name} ${CNAME[e.kind]}`;
    return e;
  }
  function startDailyCh() {
    if (S.deepest < 15 || dailyDone()) return false;
    S.dailyCh = { day: dayNo(), best: 0 };
    run = { type: 'dailyc', t: 60, tier: 0, kills: 0 };
    enemies = [dailyEnemy(hero.wx + PX * 30, 60)];
    banner = { text: 'DAILY CHALLENGE', sub: `Every monster is ${VARIANTS[dailyMod()].name.toLowerCase()}. Defeat as many as you can in 60s.`, life: 2.4 };
    return true;
  }
  function dailyKill(e) {
    run.kills++; burst(e.wx, groundY() - PX * 6, e.tint, 18, 180); tone(660, 990, 0.1, 'triangle', 0.05);
    addFloat(e.wx, groundY() - PX * 16, `${run.kills}!`, '#ffe066', 20, true);
    enemies = [dailyEnemy(e.wx + PX * 20, Math.max(1, e.timer))];
  }
  function endDaily(r) {
    const gm = Math.min(30, Math.floor(r.kills / 2) + 3), ru = r.kills * 3;
    S.gems += gm; S.runes += ru; S.dailyCh.best = r.kills; passXp(100);
    log(`Daily challenge: <b>${r.kills}</b> monsters down. +${gm} gems, +${ru} runes.`, 'p');
    banner = { text: `${r.kills} DEFEATED`, sub: `+${gm} gems, +${ru} runes`, life: 2.4 }; jingle();
  }

  /* ---------- camp ---------- */
  const campRate = (k, lv) => (k === 'mine' ? 4 : 2) * lv * (1 + S.deepest / 50);
  const campCost = (k, lv) => goldM(Math.max(5, S.deepest)) * 60 * Math.pow(1.6, lv) * (k === 'mine' ? 1 : 1.3);
  function campStock(k) { const c = S.camp; if (!c || !c[k]) return 0; const h = Math.min(12, (Date.now() - c[k + 'T']) / 3600e3); return Math.floor(campRate(k, c[k]) * h); }
  function campUpgrade(k) {
    if (S.deepest < 15) return;
    if (!S.camp) S.camp = { mine: 0, garden: 0, mineT: Date.now(), gardenT: Date.now() };
    const lv = S.camp[k], c = campCost(k, lv);
    if (S.gold < c) return;
    campCollect(k, true); S.gold -= c; S.camp[k] = lv + 1; S.camp[k + 'T'] = Date.now();
    log(`${k === 'mine' ? 'Shard Mine' : 'Rune Garden'} is now level ${lv + 1}.`, 'u'); tone(600, 900, 0.1, 'triangle', 0.05); save();
  }
  function campCollect(k, quiet) {
    const n = campStock(k); if (!S.camp) return;
    S.camp[k + 'T'] = Date.now(); if (!n) return;
    if (k === 'mine') S.shards += n; else S.runes += n;
    if (!quiet) { log(`Collected ${n} ${k === 'mine' ? 'shards' : 'runes'} from camp.`, 'u'); tone(900, 1300, 0.1, 'triangle', 0.05); save(); }
  }
  function renderCamp() {
    const box = $('#campBox');
    if (S.deepest < 15) { setHTML(box, '<p>Reach floor 15 to set up camp.</p>'); return; }
    const c = S.camp || { mine: 0, garden: 0 };
    setHTML(box, `<p>Your camp makes resources while you play or are away, and stores up to 12 hours.</p>` + [['mine', 'Shard Mine', 'shards'], ['garden', 'Rune Garden', 'runes']].map(([k, n, u]) => `<div class="part" style="grid-template-columns:minmax(0,1fr) auto auto"><div style="min-width:0"><div class="pname">${n} <span class="lv">Lv ${c[k] || 0}</span></div><div class="pfx">${c[k] ? `${fmt(campRate(k, c[k]))} ${u}/hour · ${campStock(k)} ready` : 'Not built yet'}</div></div><button class="buy${campStock(k) ? ' ok' : ''}" type="button" data-camp="c:${k}"><span class="bn">Collect</span><span class="bc">${campStock(k)}</span></button><button class="buy${S.gold >= campCost(k, c[k] || 0) ? ' ok' : ''}" type="button" data-camp="u:${k}"><span class="bn">${c[k] ? 'Upgrade' : 'Build'}</span><span class="bc">${fmt(campCost(k, c[k] || 0))}g</span></button></div>`).join(''));
  }
  $('#campBox').addEventListener('click', e => { const b = e.target.closest('[data-camp]'); if (!b) return; const [a, k] = b.dataset.camp.split(':'); audio(); if (a === 'c') campCollect(k); else campUpgrade(k); renderCamp(); });

  /* ---------- treasure maps ---------- */
  let dig = null;
  function openDig() {
    if ((S.maps || 0) < 1) return;
    S.maps--; save();
    const tiles = ['gold', 'gold', 'gold', 'gems', 'gems', 'runes', 'runes', 'gear', 'shards', 'shards'];
    while (tiles.length < 16) tiles.push('dirt');
    for (let i = tiles.length - 1; i > 0; i--) { const j = randi(0, i); [tiles[i], tiles[j]] = [tiles[j], tiles[i]]; }
    dig = { tiles, open: Array(16).fill(false), left: 3 };
    renderDig(); $('#digModal').hidden = false;
  }
  function renderDig() {
    const lbl = { gold: 'Gold!', gems: 'Gems!', runes: 'Runes!', gear: 'Gear!', shards: 'Shards!', dirt: 'Dirt' };
    setHTML($('#digGrid'), dig.tiles.map((tt, i) => `<button type="button" class="dig${dig.open[i] ? ' open ' + tt : ''}" data-dig="${i}"${dig.open[i] || !dig.left ? ' disabled' : ''}>${dig.open[i] ? lbl[tt] : dig.left ? '?' : ''}</button>`).join(''));
    setText($('#digLeft'), dig.left ? `${dig.left} dig${dig.left > 1 ? 's' : ''} left` : 'All done. Your loot is in your pockets.');
  }
  $('#digGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-dig]'); if (!b || !dig || !dig.left) return;
    const i = +b.dataset.dig; if (dig.open[i]) return;
    dig.open[i] = true; dig.left--; audio();
    const tt = dig.tiles[i], d = Math.max(1, S.deepest);
    if (tt === 'gold') { const g = goldM(d) * st.goldMult * 40; earn(g); log(`Dug up ${fmt(g)} gold.`, 'g'); }
    if (tt === 'gems') { const n = randi(3, 6); S.gems += n; log(`Dug up ${n} gems.`, 'p'); }
    if (tt === 'runes') { const n = randi(15, 30); S.runes += n; log(`Dug up ${n} runes.`, 'u'); }
    if (tt === 'shards') { const n = randi(20, 40); S.shards += n; log(`Dug up ${n} shards.`, 'u'); }
    if (tt === 'gear') { const cat = pick(CATS), it = 8 + randi(0, 7); giveItem(cat, it); recalc(); log(`Dug up ${itemLabel(cat, it)}!`, 'p'); }
    tone(tt === 'dirt' ? 200 : 900, tt === 'dirt' ? 150 : 1500, 0.12, 'triangle', 0.05);
    if (!dig.left) for (let k = 0; k < 16; k++) dig.open[k] = true;
    save(); renderDig();
  });

  /* ---------- fishing ---------- */
  const FISH = [['Old Boot', 0, '#8a5a3c'], ['Sardine', 1, '#c9cfe0'], ['Goldfish', 2, '#f5b942'], ['Rune Ray', 3, '#6fd6ff'], ['Gem Koi', 4, '#b98cff'], ['Mythic Whale', 5, '#ff5d73']];
  let fishState = null;
  const fishLeft = () => { if (!S.fish || S.fish.day !== dayNo()) S.fish = { day: dayNo(), casts: 5 }; return S.fish.casts; };
  function openFish() { if (S.deepest < 10 || fishLeft() < 1) return; S.fish.casts--; save(); fishState = { t0: performance.now(), zone: rand(0.25, 0.75), w: rand(0.12, 0.2), done: false }; $('#fishModal').hidden = false; setText($('#fishMsg'), 'Press Reel in when the marker is inside the green zone. Closer to the middle catches better fish.'); fishLoop(); }
  function fishLoop() {
    if (!fishState || fishState.done || $('#fishModal').hidden) return;
    const k = (performance.now() - fishState.t0) / 1000, pos = 0.5 + 0.48 * Math.sin(k * 2.6 + Math.sin(k * 1.3));
    fishState.pos = pos;
    const bar = $('#fishBar');
    bar.style.setProperty('--z', (fishState.zone - fishState.w / 2) * 100 + '%'); bar.style.setProperty('--zw', fishState.w * 100 + '%'); bar.style.setProperty('--m', pos * 100 + '%');
    requestAnimationFrame(fishLoop);
  }
  $('#fishReel').addEventListener('click', () => {
    if (!fishState || fishState.done) return;
    audio(); fishState.done = true;
    const d = Math.abs(fishState.pos - fishState.zone) / (fishState.w / 2);
    let tier = d > 1 ? 0 : d > 0.7 ? 1 : d > 0.4 ? 2 : d > 0.2 ? 3 : d > 0.08 ? 4 : 5;
    if (tier === 5 && Math.random() > 0.35) tier = 4;
    const [name, , col] = FISH[tier], dd = Math.max(1, S.deepest);
    let reward = '';
    if (tier === 0) { S.shards += 5; reward = '5 shards'; }
    if (tier === 1) { const g = goldM(dd) * st.goldMult * 20; earn(g); reward = fmt(g) + ' gold'; }
    if (tier === 2) { const g = goldM(dd) * st.goldMult * 60; earn(g); reward = fmt(g) + ' gold'; }
    if (tier === 3) { S.runes += 15; reward = '15 runes'; }
    if (tier === 4) { S.gems += 3; reward = '3 gems'; }
    if (tier === 5) { S.life.whale = (S.life.whale || 0) + 1; S.gems += 15; const cat = pick(CATS), it = 12 + randi(0, 7); giveItem(cat, it); recalc(); reward = `15 gems and ${EQ[cat].names[it]}`; }
    setHTML($('#fishMsg'), `You caught ${/^[AEIOU]/.test(name) ? 'an' : 'a'} <b style="color:${col}">${name}</b>! +${reward}. ${fishLeft()} cast${fishLeft() === 1 ? '' : 's'} left today.`);
    log(`Fishing: caught ${/^[AEIOU]/.test(name) ? 'an' : 'a'} <b style="color:${col}">${name}</b> (+${reward}).`, tier >= 4 ? 'p' : 'g');
    tone(400 + tier * 200, 900 + tier * 200, 0.2, 'triangle', 0.05); passXp(20); save();
  });

  /* ---------- seasonal event + monthly pass ---------- */
  const EVENTS = { 9: { n: 'Spooky Season', cur: 'candy', hat: 'pumpkin', c: '#ff8a3d' }, 10: { n: 'Harvest Festival', cur: 'acorns', hat: 'acorn', c: '#c4864a' }, 11: { n: 'Frost Fest', cur: 'snowflakes', hat: 'snow', c: '#9fe3ff' } };
  const monthKey = () => { const d = new Date(); return d.getFullYear() * 12 + d.getMonth(); };
  const eventNow = () => EVENTS[new Date().getMonth()] || { n: 'Festival of Coins', cur: 'tokens', hat: 'party', c: '#f5b942' };
  function evCheck() { if (S.evMonth !== monthKey()) { S.evMonth = monthKey(); S.evTok = 0; } if (!S.pass || S.pass.month !== monthKey()) S.pass = { month: monthKey(), xp: 0, claimed: [] }; }
  function passXp(n) { evCheck(); S.pass.xp += n; }
  const EV_SHOP = [['hat', 'Event hat', 300], ['gems', '50 gems', 120], ['summon', 'Free ×11 gear summon', 200], ['runes', '40 runes', 60]];
  function buyEv(id) {
    evCheck(); const it = EV_SHOP.find(x => x[0] === id), ev = eventNow();
    if (!it || S.evTok < it[2]) return;
    if (id === 'hat' && S.cosOwn[ev.hat]) return;
    S.evTok -= it[2];
    if (id === 'hat') { S.cosOwn[ev.hat] = 1; log(`Unlocked the <b>${HATS[ev.hat].n}</b>! Wear it in Hero › Wardrobe.`, 'p'); }
    if (id === 'gems') S.gems += 50;
    if (id === 'runes') S.runes += 40;
    if (id === 'summon') { S.gems += 50; summonEq(pick(CATS), 11, true); }
    jingle(); save();
  }
  const PASS_XP = 300;
  function passReward(k) { return k % 10 === 0 ? { t: 'piece', text: 'a Legendary piece' } : k % 5 === 0 ? { t: 'gems', n: 30, text: '30 gems' } : k % 3 === 0 ? { t: 'runes', n: 20 + k, text: `${20 + k} runes` } : k % 3 === 1 ? { t: 'shards', n: 25 + k, text: `${25 + k} shards` } : { t: 'gems', n: 5 + Math.floor(k / 3), text: `${5 + Math.floor(k / 3)} gems` }; }
  function claimPass(k) {
    evCheck(); if (S.pass.claimed.includes(k) || Math.floor(S.pass.xp / PASS_XP) < k) return;
    const r = passReward(k); S.pass.claimed.push(k);
    if (r.t === 'gems') S.gems += r.n; if (r.t === 'runes') S.runes += r.n; if (r.t === 'shards') S.shards += r.n;
    if (r.t === 'piece') { const cat = pick(CATS), it = 16 + randi(0, 3); giveItem(cat, it); recalc(); }
    log(`Pass tier ${k}: +${r.text}.`, 'p'); tone(1000, 1500, 0.12, 'triangle', 0.05); save();
  }
  function renderEventPass() {
    evCheck();
    const ev = eventNow(), tier = Math.min(30, Math.floor(S.pass.xp / PASS_XP));
    setHTML($('#eventBox'), `<div class="shophead"><h3 style="color:${ev.c}">${ev.n}</h3><span class="lbl">${S.evTok || 0} ${ev.cur}</span></div><p>This month's event. Monsters drop ${ev.cur} (bosses drop more). Spend them before the month ends: they reset.</p><div class="row">${EV_SHOP.map(([id, n, c]) => { const owned = id === 'hat' && S.cosOwn[ev.hat]; return `<button type="button" class="act${!owned && (S.evTok || 0) >= c ? ' ok gold' : ''}" data-ev="${id}"${owned ? ' disabled' : ''}>${id === 'hat' ? HATS[ev.hat].n : n} · ${owned ? 'owned' : c + ' ' + ev.cur}</button>`; }).join('')}</div>`);
    const claimable = [...Array(tier)].map((_, k) => k + 1).filter(k => !S.pass.claimed.includes(k));
    setHTML($('#passBox'), `<div class="shophead"><h3>Monthly pass</h3><span class="lbl">Tier ${tier}/30</span></div><div class="qbar" style="height:8px"><i style="width:${pct(clamp((S.pass.xp % PASS_XP) / PASS_XP, 0, 1))}"></i></div><p>${fmt(S.pass.xp % PASS_XP)}/${PASS_XP} XP to the next tier. XP comes from monsters, bosses, quests, fishing and the daily challenge. Every 5th tier gives 30 gems, every 10th a Legendary piece.</p><div class="row"><button type="button" class="act${claimable.length ? ' ok heal' : ''}" data-pass="all"${claimable.length ? '' : ' disabled'}>Claim ${claimable.length} reward${claimable.length === 1 ? '' : 's'}</button><span class="hint">Next: tier ${Math.min(30, tier + 1)} gives ${passReward(Math.min(30, tier + 1)).text}.</span></div>`);
    setHTML($('#fishBox'), S.deepest < 10 ? '<p>Reach floor 10 to find the fishing pond.</p>' : `<p>${fishLeft()} of 5 casts left today. Time your reel for better fish.</p><div class="row"><button type="button" class="act${fishLeft() ? ' ok heal' : ''}" id="fishGo"${fishLeft() ? '' : ' disabled'}>Cast a line</button></div>`);
  }
  $('#eventBox').addEventListener('click', e => { const b = e.target.closest('[data-ev]'); if (b) { audio(); buyEv(b.dataset.ev); renderEventPass(); } });
  $('#passBox').addEventListener('click', e => { if (e.target.closest('[data-pass]')) { audio(); evCheck(); for (let k = 1; k <= Math.min(30, Math.floor(S.pass.xp / PASS_XP)); k++) claimPass(k); renderEventPass(); } });
  $('#fishBox').addEventListener('click', e => { if (e.target.closest('#fishGo')) { audio(); openFish(); renderEventPass(); } });
  function xKill2(e) {
    passXp(e.boss ? 10 : 1);
    if (Math.random() < (e.boss ? 1 : 0.06)) S.evTok = (S.evTok || 0) + (e.boss ? 3 : 1);
    if ((e.elite && Math.random() < 0.15) || (e.boss && Math.random() < 0.03) || e.rare) { S.maps = (S.maps || 0) + 1; log('You found a <b>treasure map</b>! Dig it up in Trials.', 'g'); markTab('trials'); }
    if (e.mini && !chest) { chest = { wx: e.wx, life: 6, gold: e.gold * 3 }; log('The mini-boss dropped a chest!', 'g'); }
  }
  function renderTrials2() {
    const db = $('#dailyChBtn'), ok = S.deepest >= 15 && !dailyDone() && mode === 'main' && !fainted;
    setText($('#dailyChText'), S.deepest < 15 ? 'Reach floor 15 to unlock the daily challenge.' : dailyDone() ? `Done for today: ${S.dailyCh.best} monsters. A new challenge starts tomorrow.` : `Today every monster is ${VARIANTS[dailyMod()].name.toLowerCase()}. Defeat as many as you can in 60 seconds. Rewards gems and runes.`);
    db.disabled = !ok; db.classList.toggle('ok', ok);
    const mb = $('#mapBtn2'); mb.disabled = !(S.maps > 0); mb.classList.toggle('ok', S.maps > 0); setText(mb, `Dig up a map (${S.maps || 0})`);
  }
  $('#dailyChBtn').addEventListener('click', () => startRun('dailyc'));
  $('#mapBtn2').addEventListener('click', () => { audio(); openDig(); });
  const FOCUS = ['cheapest', 'damage', 'health', 'gold'];
  function focusW(p) {
    const f = S.set.buyfocus || 'cheapest';
    if (f === 'damage') return ['sword', 'gaunt', 'boots', 'torch', 'pet'].includes(p.id) ? 1 : 6;
    if (f === 'health') return p.id === 'armor' ? 1 : 4;
    if (f === 'gold') return p.id === 'ring' ? 1 : 4;
    return 1;
  }
  $('#focusBtn').addEventListener('click', () => { S.set.buyfocus = FOCUS[(FOCUS.indexOf(S.set.buyfocus || 'cheapest') + 1) % FOCUS.length]; save(); setText($('#focusBtn'), 'Focus: ' + S.set.buyfocus); });

  /* ================= expansion 2c: branching evolutions, talents, challenges, legacy shop ================= */
  const BR = {
    peasant: [['Militia', 'Merchant'], ['Folk Hero', 'Guildmaster'], ['Living Legend', 'Golden Tycoon']],
    knight: [['Paladin', 'Guardian'], ['Crusader', 'Holy Bulwark'], ['Sun Knight', 'Eternal Aegis']],
    rogue: [['Assassin', 'Thief'], ['Shadow Lord', 'Master Thief'], ['Nightmare', 'Prince of Coins']],
    mage: [['Battlemage', 'Archmage'], ['Storm Caller', 'Time Wizard'], ['Star Breaker', 'Reality Bender']],
    berserker: [['Warlord', 'Bloodletter'], ['Rage Incarnate', 'Blood King'], ['Apocalypse', 'Undying']],
    monk: [['Grandmaster', 'Zen Master'], ['Enlightened Fist', 'Combo Sage'], ['Ascended Fist', 'Thousand Palms']],
    necro: [['Bone Caller', 'Beast Tamer'], ['Lich Lord', 'Pet Whisperer'], ['Master of Death', 'Master of Pets']],
    minstrel: [['Troubadour', 'Bandleader'], ['Rock God', 'Conductor'], ['Song of Creation', 'Symphony of Allies']]
  };
  const BPERK = { peasant: 'gold', knight: 'hp', rogue: 'gold', mage: 'cd', berserker: 'leech', monk: 'tap', necro: 'pet', minstrel: 'ally' };
  const BTEXT = { gold: k => `+${40 * k}% gold`, hp: k => `+${40 * k}% health`, cd: k => `skills recharge ${8 * k}% faster`, leech: k => `+${(0.5 * k).toFixed(1)}% lifesteal and +${25 * k}% health`, tap: k => `+${40 * k}% tap damage`, pet: k => `+${40 * k}% pet damage`, ally: k => `+${40 * k}% ally damage` };
  const pathOf = c => (S.evoPath && S.evoPath[c]) || '';
  function brName(c, T) { return T <= 0 ? CLASS_EVO[c].names[0] : BR[c][T - 1][(pathOf(c)[T - 1] || 'A') === 'A' ? 0 : 1]; }
  function brPerkText(c, k, p) { return p === 'A' ? `+${30 * k}% damage` : BTEXT[BPERK[c]](k); }
  function pathPerks() {
    const c = S.cls, T = clsTier(c), P = pathOf(c), out = { dmg: 1, hp: 1, gold: 1, cd: 1, leech: 0, tap: 1, pet: 1, ally: 1 };
    for (let k = 1; k <= T; k++) {
      const p = P[k - 1] || 'A';
      if (p === 'A') out.dmg *= 1 + 0.3 * k;
      else { const b = BPERK[c]; if (b === 'cd') out.cd *= 1 - 0.08 * k; else if (b === 'leech') { out.leech += 0.005 * k; out.hp *= 1 + 0.25 * k; } else out[b] *= 1 + 0.4 * k; }
    }
    return out;
  }
  function renderEvoBranches() {
    const c = S.cls, T = clsTier(c), P = pathOf(c);
    let html = `<div class="evo on"><img alt="" src="${heroIcon(c, 0)}"><b>${CLASS_EVO[c].names[0]}</b><span>${CLASS_EVO[c].text(0)}</span></div>`;
    for (let k = 1; k <= 3; k++) {
      const chosen = k <= T ? (P[k - 1] || 'A') : null;
      html += `<div class="evo${k <= T ? ' on' : k === T + 1 ? ' next' : ''}"><img alt="" src="${heroIcon(c, k)}"><b>${k <= T ? BR[c][k - 1][chosen === 'A' ? 0 : 1] : `${BR[c][k - 1][0]} or ${BR[c][k - 1][1]}`}</b><span>${k <= T ? `${CLASS_EVO[c].text(k)} · ${brPerkText(c, k, chosen)}` : `A: ${brPerkText(c, k, 'A')} · B: ${brPerkText(c, k, 'B')}`}</span><span>${k <= T ? 'Unlocked' : `Floor ${EVO_REQ[k].deep}, ${RANKS[EVO_REQ[k].rank].n} rank`}</span></div>`;
    }
    setHTML($('#evoChain'), html);
    const r = EVO_REQ[T + 1], pickBox = $('#evoPick');
    $('#evoBtn').hidden = true;
    if (!r) { setHTML(pickBox, ''); return; }
    const ok = evoReady();
    setHTML(pickBox, ['A', 'B'].map(p => `<button class="act gem${ok ? ' ok' : ''}" type="button" data-evo="${p}"${ok ? '' : ' disabled'}>Evolve into ${BR[c][T][p === 'A' ? 0 : 1]} (${brPerkText(c, T + 1, p)})</button>`).join(''));
  }
  $('#evoPick').addEventListener('click', e => { const b = e.target.closest('[data-evo]'); if (b) { evolveClass(b.dataset.evo); RENDER.hero(); } });

  const TALENTS = [
    ['Power', [['p1', 'Sharp Edge', '+8% damage'], ['p2', 'Crit Training', '+0.15× crit damage'], ['p3', 'Giant Slayer', '+10% boss damage'], ['p4', 'Overkill', '+15% skill damage']]],
    ['Fortune', [['f1', 'Coin Sense', '+8% gold'], ['f2', 'Treasure Nose', '+1% chest chance'], ['f3', 'Gem Finder', '+3% gem drops from bosses'], ['f4', 'Bargain', '-2% training costs']]],
    ['Tempo', [['t1', 'Quick Hands', '+4% swing speed'], ['t2', 'Focus', '-4% skill cooldowns'], ['t3', 'Rhythm', '+10% combo time'], ['t4', 'Thick Skin', '+10% health']]]
  ];
  const tal = k => (S.tal && S.tal[k]) || 0;
  const talPoints = () => S.rank * 2 + (S.stars || 0) * 3 + Math.floor(S.deepest / 25) + Math.floor(achCount() / 5);
  const talSpent = () => Object.values(S.tal || {}).reduce((a, b) => a + b, 0);
  function renderTalents() {
    const left = talPoints() - talSpent();
    setHTML($('#talents'), `<p class="hint" style="display:block">${left} of ${talPoints()} points free. You earn points from ranks (2 each), stars (3 each), every 25 floors and every 5 achievements. Talents stay forever. Resetting is free.</p><div class="talgrid">${TALENTS.map(([br, nodes]) => `<div class="talcol"><h3>${br}</h3>${nodes.map(([k, n, d]) => `<div class="tal"><span><b>${n}</b> <i>${tal(k)}/5</i><br><span class="hint" style="display:inline">${d} per point</span></span><button type="button" class="pill" data-tal="${k}"${left > 0 && tal(k) < 5 ? '' : ' disabled'}>+</button></div>`).join('')}</div>`).join('')}</div><div class="row"><button type="button" class="linkbtn" id="talReset">Reset talents</button></div>`);
  }
  $('#talents').addEventListener('click', e => {
    const b = e.target.closest('[data-tal]');
    if (b) { const k = b.dataset.tal; if (talPoints() - talSpent() > 0 && tal(k) < 5) { S.tal[k] = tal(k) + 1; recalc(); save(); tone(700, 1000, 0.08, 'triangle', 0.04); } }
    if (e.target.id === 'talReset') { S.tal = {}; recalc(); save(); }
    renderTalents();
  });

  const CHALLENGES = {
    noally: { n: 'Lone Wolf', text: 'You cannot hire allies', goal: 40, reward: '+15% damage forever' },
    taponly: { n: 'Tap Only', text: 'Your hero never swings. Only taps, pets, allies and skills hurt', goal: 30, reward: '+50% tap damage forever' },
    glass: { n: 'Glass Cannon', text: 'You have 20% of your health', goal: 35, reward: '+0.5× crit damage forever' },
    broke: { n: 'Broke', text: 'You earn 30% of the usual gold', goal: 30, reward: '+25% gold forever' },
    speed: { n: 'Speedrun', text: 'Bosses leave after 15 seconds', goal: 40, reward: '+10% swing speed forever' }
  };
  const chDone = k => !!(S.chDone && S.chDone[k]);
  function startChallenge(id) {
    if (mode !== 'main' || S.chal) return;
    const gain = talesFor(S.maxFloor);
    const prevGold = S.gold, prevLv = Object.assign({}, S.lv);
    const keep = retireKeep(gain);
    resetRun(keep); afterRetire(prevGold, gain, prevLv);
    S.chal = id;
    log(`Challenge started: <b>${CHALLENGES[id].n}</b>. ${CHALLENGES[id].text}. Reach floor ${CHALLENGES[id].goal} to win ${CHALLENGES[id].reward}.${gain ? ` You also earned ${gain} tales.` : ''}`, 'c');
    banner = { text: 'CHALLENGE', sub: CHALLENGES[id].n, life: 2.4 }; save(); refreshAll();
  }
  function checkChallenge() {
    const c = S.chal; if (!c) return;
    if (S.floor >= CHALLENGES[c].goal) { S.chDone[c] = 1; S.chal = null; recalc(); log(`Challenge complete: <b>${CHALLENGES[c].n}</b>! ${CHALLENGES[c].reward}.`, 'p'); banner = { text: 'CHALLENGE WON', sub: CHALLENGES[c].reward, life: 2.6 }; jingle(); save(); }
  }
  function renderChallenges() {
    setHTML($('#challenges'), Object.entries(CHALLENGES).map(([k, c]) => `<div class="part" style="grid-template-columns:minmax(0,1fr) auto"><div style="min-width:0"><div class="pname">${c.n}${chDone(k) ? ' <span class="lv" style="color:var(--heal)">Done</span>' : S.chal === k ? ' <span class="lv" style="color:var(--combo)">Active</span>' : ''}</div><div class="pfx">${c.text}. Goal: floor ${c.goal}. Reward: ${c.reward}.</div></div>${S.chal === k ? `<button class="buy ok" type="button" data-chq="${k}"><span class="bn">Give up</span><span class="bc">Floor ${S.floor}/${c.goal}</span></button>` : `<button class="buy${!S.chal && mode === 'main' ? ' ok' : ''}" type="button" data-ch="${k}"${S.chal ? ' disabled' : ''}><span class="bn">Start</span><span class="bc">${chDone(k) ? 'again' : 'resets run'}</span></button>`}</div>`).join(''));
  }
  let chArm = '';
  $('#challenges').addEventListener('click', e => {
    const b = e.target.closest('[data-ch],[data-chq]'); if (!b) return;
    if (b.dataset.chq) { S.chal = null; log('Challenge abandoned.'); save(); renderChallenges(); return; }
    if (chArm !== b.dataset.ch) { chArm = b.dataset.ch; setText(b.querySelector('.bn'), 'Tap again'); setTimeout(() => { chArm = ''; }, 3000); return; }
    chArm = ''; startChallenge(b.dataset.ch);
  });

  const LSHOP = [
    ['head', 'Head Start', 8, L => `Start each new hero on floor ${1 + 5 * L}`, L => 3 * (L + 1)],
    ['inherit', 'Inheritance', 10, L => `Keep ${2 * L}% of your gold when you retire`, L => 2 * (L + 1)],
    ['cheap', 'Bulk Discount', 10, L => `Training costs ${3 * L}% less`, L => 2 * (L + 1)],
    ['vet', 'Veteran Allies', 10, L => `Unlocked allies start at level ${L}`, L => 3 * (L + 1)],
    ['habit', 'Old Habits', 10, L => `Basic skills start at level ${1 + L}`, L => 2 * (L + 1)]
  ];
  const ls = k => (S.lshop && S.lshop[k]) || 0;
  function retireKeep(gain) {
    return { tales: S.tales + gain, runs: S.runs + (gain ? 1 : 0), rank: S.rank, relics: S.relics, deepest: S.deepest, gems: S.gems, runes: S.runes, shards: S.shards, book: S.book, ach: S.ach, life: S.life, quests: S.quests, keys: S.keys, keyT: S.keyT, summon: S.summon, daily: S.daily, set: S.set, evo: S.evo, evoPath: S.evoPath, eq: S.eq, prefix: S.prefix, wlv: S.wlv, ench: S.ench, locks: S.locks, skOwn: S.skOwn, skCp: S.skCp, skLv: S.skLv, evTok: S.evTok, sock: S.sock, gemInv: S.gemInv, look: S.look, cos: S.cos, cosOwn: S.cosOwn, stars: S.stars, abyssBest: S.abyssBest, rushBest: S.rushBest, abyssT: S.abyssT, rushT: S.rushT, grottoT: S.grottoT, loadout: S.loadout, weekly: S.weekly, seenVer: S.seenVer, eqSel: S.eqSel, eqCat: S.eqCat, tal: S.tal, chDone: S.chDone, lshop: S.lshop, unl: S.unl, tutQ: S.tutQ, lab: S.lab, labJobs: S.labJobs, mileDone: S.mileDone, evMonth: S.evMonth, ltok: (S.ltok || 0) + (gain ? Math.ceil(gain / 4) + 1 : 0), heir: S.heir, camp: S.camp, pass: S.pass, maps: S.maps, fish: S.fish, dailyCh: S.dailyCh, muted: S.muted, amt: S.amt, auto: S.auto, tab: S.tab, dev: S.dev, cls: S.cls };
  }
  function afterRetire(prevGold, gain, prevLv) {
    const start = Math.min(1 + 5 * ls('head'), Math.max(1, S.deepest));
    S.floor = start; S.maxFloor = Math.max(S.maxFloor, start);
    if (ls('inherit')) S.gold += prevGold * 0.02 * ls('inherit');
    if (ls('vet')) for (const a of ALLIES) if (S.deepest >= a.unlock && !(S.chal === 'noally')) S.allies[a.id] = Math.max(S.allies[a.id], ls('vet'));
    if (ls('habit')) for (const sk of SKILLS) if (sk.gacha === undefined) S.sk[sk.id] = 1 + ls('habit');
    if (S.heir && prevLv && prevLv[S.heir]) { S.lv[S.heir] = Math.min(PEVO_AT[0] - 1, Math.floor(prevLv[S.heir] * 0.1)); }
    recalc(); hero.hp = st.maxHp;
    postScore(false); cloudSave(false);
  }
  function renderLegacyShop() {
    setHTML($('#lshop'), `<p class="hint" style="display:block">You have <b>${S.ltok || 0}</b> legacy tokens. Retiring gives a quarter of the tales you earn as tokens, plus one.</p>` + LSHOP.map(([k, n, max, fx, cost]) => `<div class="part" style="grid-template-columns:minmax(0,1fr) auto"><div style="min-width:0"><div class="pname">${n} <span class="lv">Lv ${ls(k)}/${max}</span></div><div class="pfx">${fx(ls(k))}${ls(k) < max ? ` <span class="up">→ ${fx(ls(k) + 1).toLowerCase()}</span>` : ''}</div></div><button type="button" class="buy${ls(k) < max && (S.ltok || 0) >= cost(ls(k)) ? ' ok' : ''}" data-ls="${k}"><span class="bn">${ls(k) >= max ? 'Max' : 'Buy'}</span><span class="bc">${ls(k) >= max ? '—' : cost(ls(k)) + ' tokens'}</span></button></div>`).join('') +
      `<div class="lbl" style="margin-top:6px">Heirloom</div><p class="hint" style="display:block">Pick one training part. When you retire, it keeps 10% of its levels.</p><div class="chips">${PARTS.map(p => `<button type="button" class="chip${S.heir === p.id ? ' got' : ''}" data-heir="${p.id}">${p.name}</button>`).join('')}</div>`);
  }
  $('#lshop').addEventListener('click', e => {
    const b = e.target.closest('[data-ls],[data-heir]'); if (!b) return;
    if (b.dataset.heir) { S.heir = S.heir === b.dataset.heir ? null : b.dataset.heir; save(); renderLegacyShop(); return; }
    const item = LSHOP.find(x => x[0] === b.dataset.ls), L = ls(item[0]), c = item[4](L);
    if (L >= item[2] || (S.ltok || 0) < c) return;
    S.ltok -= c; S.lshop[item[0]] = L + 1; recalc(); tone(700, 1100, 0.1, 'triangle', 0.05); save(); renderLegacyShop();
  });

  /* ================= expansion 2b: skill summon + dev amounts ================= */
  const GSK = [
    ['dslash', 'Double Slash', 0, 6, 'spin', L => 4 + L, L => `Slashes the front monster twice for ${4 + L}× damage each`],
    ['bubble', 'Bubble Shield', 0, 20, 'heal', L => 2 + 0.3 * L, L => `Blocks all damage for ${(2 + 0.3 * L).toFixed(1)}s`],
    ['cry', 'Battle Cry', 1, 25, 'frenzy', L => 1.4 + 0.06 * L, L => `×${(1.4 + 0.06 * L).toFixed(2)} damage for 8s`],
    ['toss', 'Coin Toss', 1, 30, 'rush', L => 8 + 2 * L, L => `Flips a coin worth ${8 + 2 * L} monsters of gold`],
    ['blizzard', 'Blizzard', 2, 18, 'stop', L => 10 + 3 * L, L => `Hits everything for ${10 + 3 * L}× damage and freezes it for 1.5s`],
    ['bite', 'Vampire Bite', 2, 14, 'heal', L => 12 + 4 * L, L => `Bites the front monster for ${12 + 4 * L}× damage and heals 15%`],
    ['storm', 'Blade Storm', 2, 16, 'spin', L => 3 + L, L => `Hits everything 5 times for ${3 + L}× damage each`],
    ['star', 'Lucky Star', 2, 30, 'rush', L => 4 + 0.4 * L, L => `Every hit is a crit for ${(4 + 0.4 * L).toFixed(1)}s`],
    ['breath', 'Dragon Breath', 3, 22, 'frenzy', L => 30 + 8 * L, L => `Burns everything for ${30 + 8 * L}× damage`],
    ['drain', 'Soul Drain', 3, 20, 'clone', L => 25 + 6 * L, L => `Drains the front monster for ${25 + 6 * L}× damage and charges your ultimate`],
    ['haste', 'Haste', 3, 45, 'stop', L => 0.5 + 0.02 * L, L => `Cuts your other cooldowns by ${pct(Math.min(0.8, 0.5 + 0.02 * L))}`],
    ['magnet', 'Gold Magnet', 3, 40, 'rush', L => 3 + 0.25 * L, L => `×${(3 + 0.25 * L).toFixed(2)} gold for 12s`],
    ['nova', 'Supernova', 4, 35, 'meteor', L => 80 + 20 * L, L => `Explodes everything for ${80 + 20 * L}× damage`],
    ['warp', 'Time Warp', 4, 50, 'stop', L => 5 + 0.3 * L, L => `Freezes monsters and doubles your swings for ${(5 + 0.3 * L).toFixed(1)}s`],
    ['army', 'Skeleton Army', 4, 40, 'clone', L => 6 + L, L => `Skeletons hit the front monster 5 times a second for ${6 + L}s`],
    ['judge', 'Judgement', 5, 45, 'bolt', L => 300 + 60 * L, L => `Smites the front monster for ${300 + 60 * L}× damage`],
    ['hole', 'Black Hole', 5, 50, 'spin', L => 150 + 30 * L, L => `Swallows everything for ${150 + 30 * L}× damage`],
    ['phoenix', 'Phoenix', 5, 90, 'heal', L => 5 + 0.3 * L, L => `Full heal and immune to damage for ${(5 + 0.3 * L).toFixed(1)}s`]
  ];
  for (const [id, name, g, cd, ic, val, fx] of GSK) {
    SKILLS.push({ id, short: name.split(' ')[0], name, gacha: g, cd, val, fx, unlock: 0 });
    ICON[id] = ICON[ic];
    const gc = GRADES[g].c;
    ICON_PAL[id] = { a: gc, b: '#ffffff', c: mix(gc, '#ffffff', 0.5), d: mix(gc, '#000000', 0.4) };
    if (skT[id] === undefined) skT[id] = 0;
  }
  let invulnT = 0, cryT = 0, cryVal = 1, starT = 0, magnetT = 0, magnetVal = 1, armyT = 0, armyTick = 0, lastSumKind = 'eq';
  const skNeed = L => Math.min(10, L);
  function castGacha(s, L) {
    const f = front(), all = alive().filter(onScreen), D = st.dmg * st.skillMult, gy = groundY();
    const hitAll = (m, fxType) => { if (!all.length) return false; for (const e of all) { if (fxType) fx.push({ type: fxType, wx: e.wx, life: 0.5 }); hit(e, D * m, 'skill'); } return true; };
    switch (s.id) {
      case 'dslash': if (!f || !onScreen(f)) return false; hit(f, D * s.val(L), 'skill'); hit(f, D * s.val(L), 'skill'); slashes.push({ x: sx(f.wx), y: gy - PX * 6, a: -0.6, life: 0.25 }, { x: sx(f.wx), y: gy - PX * 6, a: 0.6, life: 0.25 }); break;
      case 'bubble': invulnT = s.val(L); tone(800, 1200, 0.2, 'sine', 0.05); break;
      case 'cry': cryT = 8; cryVal = s.val(L); banner = { text: 'BATTLE CRY', sub: `×${cryVal.toFixed(2)} damage`, life: 1.2 }; tone(150, 300, 0.4, 'sawtooth', 0.05); break;
      case 'toss': { const g = baseGold() * goldNow() * s.val(L); earn(g); addFloat(hero.wx, gy - PX * 14, `+${fmt(g)} gold`, '#f5b942', 18, true); for (let k = 0; k < 6; k++) coinFly.push({ x: heroSX(), y: gy - PX * 10, t: -k * 0.05 }); break; }
      case 'blizzard': if (!hitAll(s.val(L))) return false; freezeT = Math.max(freezeT, 1.5); tone(1500, 400, 0.4, 'sine', 0.05); break;
      case 'bite': if (!f || !onScreen(f)) return false; hit(f, D * s.val(L), 'skill'); hero.hp = Math.min(st.maxHp, hero.hp + st.maxHp * 0.15); break;
      case 'storm': if (!all.length) return false; for (let k = 0; k < 5; k++) for (const e of alive().filter(onScreen)) hit(e, D * s.val(L), 'skill'); fx.push({ type: 'spin', life: 0.45 }); break;
      case 'star': starT = s.val(L); banner = { text: 'LUCKY STAR', sub: 'Every hit crits', life: 1.2 }; break;
      case 'breath': if (!hitAll(s.val(L), 'meteor')) return false; shakeIt(8); tone(200, 80, 0.5, 'sawtooth', 0.05); break;
      case 'drain': if (!f || !onScreen(f)) return false; hit(f, D * s.val(L), 'skill'); ultC = Math.min(100, ultC + 25); break;
      case 'haste': for (const k in skT) if (k !== 'haste') skT[k] *= 1 - Math.min(0.8, s.val(L)); tone(600, 1800, 0.2, 'triangle', 0.05); break;
      case 'magnet': magnetT = 12; magnetVal = s.val(L); banner = { text: 'GOLD MAGNET', sub: `×${magnetVal.toFixed(2)} gold`, life: 1.2 }; break;
      case 'nova': if (!hitAll(s.val(L), 'meteor')) return false; flashT = 0.3; shakeIt(10); break;
      case 'warp': freezeT = Math.max(freezeT, s.val(L)); cloneT = Math.max(cloneT, s.val(L)); banner = { text: 'TIME WARP', sub: 'Frozen monsters, double swings', life: 1.2 }; break;
      case 'army': armyT = s.val(L); banner = { text: 'SKELETON ARMY', sub: 'Rattle rattle', life: 1.2 }; break;
      case 'judge': if (!f || !onScreen(f)) return false; fx.push({ type: 'bolt', wx: f.wx, life: 0.35 }); hit(f, D * s.val(L), 'skill'); flashT = 0.2; break;
      case 'hole': if (!all.length) return false; for (const e of all) { e.wx = Math.min(e.wx, all[0].wx + PX * 4); hit(e, D * s.val(L), 'skill'); } flashT = 0.3; shakeIt(12); break;
      case 'phoenix': hero.hp = st.maxHp; invulnT = s.val(L); burst(hero.wx, gy - PX * 5, '#ff8a3d', 40, 220); banner = { text: 'PHOENIX', sub: 'Reborn in flames', life: 1.2 }; break;
    }
    return true;
  }
  function xUpdate2(dt) {
    invulnT = Math.max(0, invulnT - dt); cryT = Math.max(0, cryT - dt); starT = Math.max(0, starT - dt); magnetT = Math.max(0, magnetT - dt); armyT = Math.max(0, armyT - dt);
    if (armyT > 0) { armyTick -= dt; const f = front(); if (armyTick <= 0 && f && onScreen(f) && !fainted) { armyTick = 0.2; hit(f, st.dmg * 2, 'ally'); } }
  }
  function gachaLevel(s) {
    const L = S.skLv[s.id] || 1, need = skNeed(L), c = (S.skCp[s.id] || 0);
    if (!S.skOwn[s.id] || L >= 15 || c < need) return;
    S.skCp[s.id] = c - need; S.skLv[s.id] = L + 1;
    log(`<b>${s.name}</b> reached level ${L + 1}!`, 'p'); tone(700, 1400, 0.15, 'triangle', 0.05); save();
  }
  function renderGachaRow(s) {
    const own = !!S.skOwn[s.id], L = S.skLv[s.id] || 1, need = skNeed(L), c = S.skCp[s.id] || 0, G = GRADES[s.gacha];
    setRow(skRows[s.id], {
      name: s.name, lv: own ? `${G.n} · Lv ${L}` : `${G.n} · not owned`, dim: !own,
      fx: own ? `${s.fx(L)}. Every ${Math.round(s.cd * st.cdMult)}s. ${L < 15 ? `<span class="up">Next level needs ${need} more ${need > 1 ? 'copies' : 'copy'}.</span>` : 'Max level.'}` : `Get it from the skill summon. ${s.fx(1)}.`,
      bn: own ? (L >= 15 ? 'Max' : 'Level up') : 'Summon', bc: own ? `${c}/${need} copies` : '—', ok: own && L < 15 && c >= need
    });
  }
  const SKW = [40, 30, 18, 8, 3, 1];
  function summonSkills(n) {
    audio();
    const cost = n === 11 ? 100 : 10;
    if (S.gems < cost || S.deepest < 10) return;
    S.gems -= cost; lastSum = n; lastSumKind = 'skill';
    const pool = SKILLS.filter(s => s.gacha !== undefined), res = [];
    for (let k = 0; k < n; k++) {
      let g = wpick([0, 1, 2, 3, 4, 5], SKW);
      if (n === 11 && k === 10 && Math.max(...res.map(r => r.s.gacha)) < 2) g = 2;
      const s = pick(pool.filter(x => x.gacha === g));
      const fresh = !S.skOwn[s.id];
      if (fresh) { S.skOwn[s.id] = 1; S.skLv[s.id] = S.skLv[s.id] || 1; } else S.skCp[s.id] = (S.skCp[s.id] || 0) + 1;
      res.push({ s, fresh });
    }
    const best = res.reduce((a, r) => r.s.gacha > a.s.gacha ? r : a, res[0]);
    log(`Skill summon ×${n}: best was <b style="color:${GRADES[best.s.gacha].c}">${best.s.name}</b>. ${res.filter(r => r.fresh).length} new.`, 'p');
    if (best.s.gacha >= 3) { banner = { text: GRADES[best.s.gacha].n.toUpperCase() + ' SKILL', sub: best.s.name, life: 2.2 }; jingle(); } else tone(880, 1320, 0.15, 'triangle', 0.05);
    if (n > 1) {
      $('#sumRes').innerHTML = res.map((r, k) => `<div style="--gc:${GRADES[r.s.gacha].c};animation-delay:${k * 40}ms" title="${r.s.name}"><img alt="${r.s.name}" src="${iconURL(r.s.id)}">${r.fresh ? '<span class="nw">NEW</span>' : ''}</div>`).join('');
      setText($('#sumResText'), `${res.filter(r => r.fresh).length} new skills. Duplicates become copies for leveling up. Add new skills to your bar in the list below.`);
      setText($('#sumAgain'), `Summon ×11 again (100 gems)`); $('#sumMerge').hidden = true;
      $('#sumModal').hidden = false;
    }
    markTab('skills'); save();
  }
  function renderSkillSummon() {
    const ok = S.deepest >= 10;
    setText($('#skSumTxt'), ok ? `Odds: ${GRADES.map((g, k) => `${g.n} ${pct1(SKW[k] / 100)}`).join(' · ')}. ×11 guarantees a Rare or better. ${SKILLS.filter(s => s.gacha !== undefined && S.skOwn[s.id]).length}/18 skills owned.` : 'Reach floor 10 to unlock the skill summon.');
    for (const [id, n, c] of [['#skSum1', 1, 10], ['#skSum11', 11, 100]]) { const b = $(id); b.classList.toggle('ok', ok && S.gems >= c); setText(b, `×${n} · ${c} gems`); }
  }
  $('#skSum1').addEventListener('click', () => summonSkills(1));
  $('#skSum11').addEventListener('click', () => summonSkills(11));

  /* ---------- dev: typed amounts ---------- */
  function buildDevAmounts() {
    const resOpts = ['gold', 'gems', 'runes', 'shards', 'tales', 'stars', 'tokens'].map(r => `<option value="${r}">${r}</option>`).join('');
    $('#devAmt').innerHTML = `<div class="row"><select id="devRes" aria-label="Resource">${resOpts}</select><input id="devNum" type="text" inputmode="decimal" value="1e6" aria-label="Amount, for example 5000 or 1e30"><button class="act ok gem" type="button" data-da="give">Give</button><button class="act ok heal" type="button" data-da="set">Set to</button></div>
      <div class="row"><select id="devPart" aria-label="Training part">${PARTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select><input id="devLv" type="number" min="0" value="100" aria-label="Level"><button class="act ok gem" type="button" data-da="lv">Set level</button></div>
      <div class="row"><select id="devCat" aria-label="Gear slot">${CATS.map(k => `<option value="${k}">${EQ[k].name}</option>`).join('')}</select><input id="devPiece" type="number" min="0" max="23" value="23" aria-label="Piece 0 to 23"><input id="devCount" type="number" min="1" value="5" aria-label="Copies"><button class="act ok gem" type="button" data-da="piece">Give pieces</button></div>
      <div class="row"><select id="devSkill" aria-label="Skill">${SKILLS.filter(s => s.gacha !== undefined).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select><input id="devSkN" type="number" min="1" value="10" aria-label="Copies"><button class="act ok gem" type="button" data-da="skill">Give skill copies</button></div>`;
  }
  $('#devAmt').addEventListener('click', e => {
    const b = e.target.closest('[data-da]'); if (!b) return;
    devMark();
    const a = b.dataset.da;
    if (a === 'give' || a === 'set') {
      const r = $('#devRes').value, v = Number($('#devNum').value);
      if (!isFinite(v)) { log('Dev: that amount is not a number. Try 5000 or 1e30.', 'r'); return; }
      const key = r === 'tokens' ? null : r;
      if (r === 'tokens') { S.evTok = a === 'set' ? v : (S.evTok || 0) + v; }
      else if (a === 'set') S[key] = v; else if (r === 'gold') earn(v); else S[key] += v;
      log(`Dev: ${a === 'set' ? 'set' : 'gave'} ${fmt(v)} ${r}.`, 'r');
    }
    if (a === 'lv') { const p = $('#devPart').value; S.lv[p] = Math.max(0, Math.floor(+$('#devLv').value || 0)); log(`Dev: ${p} set to level ${S.lv[p]}.`, 'r'); }
    if (a === 'piece') { const k = $('#devCat').value, i = clamp(Math.floor(+$('#devPiece').value || 0), 0, 23), n = Math.max(1, Math.floor(+$('#devCount').value || 1)); giveItem(k, i, n); log(`Dev: +${n} × ${EQ[k].names[i]}.`, 'r'); }
    if (a === 'skill') { const id = $('#devSkill').value, n = Math.max(1, Math.floor(+$('#devSkN').value || 1)); if (!S.skOwn[id]) { S.skOwn[id] = 1; S.skLv[id] = S.skLv[id] || 1; } S.skCp[id] = (S.skCp[id] || 0) + n; buildSkillbar(); log(`Dev: +${n} copies of ${SKILLS.find(s => s.id === id).name}.`, 'r'); }
    recalc(); save(); renderHud();
  });

  /* ================= expansion 2a: sockets, banners, wardrobe ================= */
  const GEM_TYPES = {
    ruby: { n: 'Ruby', c: '#ff5d73', base: 0.06, text: 'damage' }, sapphire: { n: 'Sapphire', c: '#6fb7ff', base: 0.08, text: 'health' },
    emerald: { n: 'Emerald', c: '#7bd88f', base: 0.06, text: 'gold' }, topaz: { n: 'Topaz', c: '#ffd166', base: 0.08, text: 'crit damage (×)' },
    amethyst: { n: 'Amethyst', c: '#c98bff', base: 0.08, text: 'skill damage' }, onyx: { n: 'Onyx', c: '#9aa3ba', base: 0.06, text: 'boss damage' }
  };
  const gemVal = (t, lv) => GEM_TYPES[t].base * lv * (1 + 0.15 * (lv - 1));
  function gem(t) { let v = 0; (S.sock || []).forEach((g, k) => { if (g && k < sockSlots() && g.t === t) v += gemVal(t, g.lv); }); return v; }
  const sockSlots = () => (S.deepest >= 10 ? 1 : 0) + (S.rank >= 2 ? 1 : 0) + (S.rank >= 5 ? 1 : 0) + (S.stars >= 1 ? 1 : 0);
  const gemInvKey = (t, lv) => t + ':' + lv;
  function craftGem() {
    audio();
    if (S.shards < 25 || S.runes < 10) return;
    S.shards -= 25; S.runes -= 10;
    const t = pick(Object.keys(GEM_TYPES)), k = gemInvKey(t, 1);
    S.gemInv[k] = (S.gemInv[k] || 0) + 1;
    log(`Crafted a <b style="color:${GEM_TYPES[t].c}">${GEM_TYPES[t].n} Lv 1</b>.`, 'u'); tone(900, 1400, 0.12, 'triangle', 0.05); save();
  }
  function fuseGem(t, lv) {
    const k = gemInvKey(t, lv);
    if ((S.gemInv[k] || 0) < 3 || lv >= 10) return;
    S.gemInv[k] -= 3; const k2 = gemInvKey(t, lv + 1); S.gemInv[k2] = (S.gemInv[k2] || 0) + 1;
    log(`Fused 3 into a <b style="color:${GEM_TYPES[t].c}">${GEM_TYPES[t].n} Lv ${lv + 1}</b>!`, 'u'); jingle(); recalc(); save();
  }
  function socketGem(t, lv) {
    const k = gemInvKey(t, lv); if ((S.gemInv[k] || 0) < 1) return;
    const n = sockSlots(); if (!n) { log('Reach floor 10 to open your first socket.'); return; }
    let slot = -1;
    for (let i = 0; i < n; i++) if (!S.sock[i]) { slot = i; break; }
    if (slot < 0) { let lo = 0; for (let i = 1; i < n; i++) if (S.sock[i].lv < S.sock[lo].lv) lo = i; slot = lo; const old = S.sock[slot]; const ok = gemInvKey(old.t, old.lv); S.gemInv[ok] = (S.gemInv[ok] || 0) + 1; }
    S.gemInv[k]--; S.sock[slot] = { t, lv }; recalc(); tone(700, 1100, 0.1, 'triangle', 0.05); save();
  }
  function unsocket(i) { const g = S.sock[i]; if (!g) return; const k = gemInvKey(g.t, g.lv); S.gemInv[k] = (S.gemInv[k] || 0) + 1; S.sock[i] = null; recalc(); save(); }
  function renderSockets() {
    const n = sockSlots();
    setHTML($('#sockets'), [0, 1, 2, 3].map(i => {
      const g = S.sock[i], open = i < n;
      return `<button type="button" class="sockb" data-sock="${i}" style="--gc:${g ? GEM_TYPES[g.t].c : 'var(--edge)'}"${open ? '' : ' disabled'}>${!open ? ['Floor 10', 'Copper rank', 'Silver rank', '1 star'][i] : g ? `<b>${GEM_TYPES[g.t].n} ${g.lv}</b><span>+${g.t === 'topaz' ? gemVal(g.t, g.lv).toFixed(2) + '×' : pct(gemVal(g.t, g.lv))} ${GEM_TYPES[g.t].text}</span>` : '<span>Empty</span>'}</button>`;
    }).join(''));
    const inv = Object.entries(S.gemInv).filter(([, c]) => c > 0).sort();
    setHTML($('#gemInv'), inv.length ? inv.map(([k, c]) => { const [t, lv] = k.split(':'); return `<span class="gemchip" style="--gc:${GEM_TYPES[t].c}"><button type="button" data-gs="${k}">${GEM_TYPES[t].n} ${lv} ×${c}</button>${c >= 3 && +lv < 10 ? `<button type="button" class="fz" data-gf="${k}">Fuse 3</button>` : ''}</span>`; }).join('') : '<span class="hint">No gems yet. Craft some below.</span>');
    const cb = $('#craftGem'); cb.classList.toggle('ok', S.shards >= 25 && S.runes >= 10);
  }
  $('#sockets').addEventListener('click', e => { const b = e.target.closest('[data-sock]'); if (b) { unsocket(+b.dataset.sock); renderSockets(); } });
  $('#gemInv').addEventListener('click', e => {
    const s1 = e.target.closest('[data-gs]'), f1 = e.target.closest('[data-gf]');
    if (f1) { const [t, lv] = f1.dataset.gf.split(':'); fuseGem(t, +lv); }
    else if (s1) { const [t, lv] = s1.dataset.gs.split(':'); socketGem(t, +lv); }
    renderSockets();
  });
  $('#craftGem').addEventListener('click', () => { craftGem(); renderSockets(); });

  const dayNo = () => Math.floor(Date.now() / 864e5);
  const featured = cat => 16 + ((dayNo() * 7 + CATS.indexOf(cat) * 3) % 8);

  const HATS = {
    none: { n: 'No hat', ok: () => true, rows: [] },
    party: { n: 'Party hat', ok: () => true, rows: ['..a...', '..a...', '.aba..', '.aaa..'], pal: { a: '#ff7ad9', b: '#ffe066' } },
    crown: { n: 'Crown', need: '10 achievements', ok: () => achCount() >= 10, rows: ['a.a.a.', 'aaaaa.', 'abaca.'], pal: { a: '#f5b942', b: '#ff5d73', c: '#62d2c4' } },
    wizard: { n: 'Wizard hat', need: 'reach floor 50', ok: () => S.deepest >= 50, rows: ['..a...', '.aa...', '.aab..', 'aaaaa.'], pal: { a: '#7d5ad1', b: '#ffe066' } },
    chef: { n: 'Chef hat', need: 'defeat 5,000 monsters', ok: () => S.life.kills >= 5000, rows: ['.aaa..', 'aaaaa.', '.aaa..', '.bbb..'], pal: { a: '#ffffff', b: '#d9d6e6' } },
    viking: { n: 'Viking helmet', need: 'beat 200 bosses', ok: () => S.life.bosses >= 200, rows: ['b....b', 'baaaab', '.aaaa.'], pal: { a: '#9aa3ba', b: '#efe3cf' } },
    halo: { n: 'Halo', need: 'ascend once', ok: () => S.stars >= 1, rows: ['.aaaa.', 'a....a', '.aaaa.'], pal: { a: '#ffe066' } },
    acorn: { n: 'Acorn cap', need: 'the Harvest Festival shop', ok: () => !!(S.cosOwn && S.cosOwn.acorn), rows: ['..b...', '.aaaa.', 'aaaaaa'], pal: { a: '#8a5a3c', b: '#5b3a26' } },
    pumpkin: { n: 'Pumpkin head', need: 'the Spooky Season shop', ok: () => !!(S.cosOwn && S.cosOwn.pumpkin), rows: ['..b...', '.aaaa.', 'acaaca', '.aaaa.'], pal: { a: '#ff8a3d', b: '#3c8a5a', c: '#1a1424' } },
    snow: { n: 'Snow cap', need: 'the Frost Fest shop', ok: () => !!(S.cosOwn && S.cosOwn.snow), rows: ['....b.', '.aaaa.', 'cccccc'], pal: { a: '#d1495b', b: '#ffffff', c: '#ffffff' } }
  };
  const CAPES = { none: { n: 'No cape', ok: () => true }, red: { n: 'Red cape', c: '#d1203a', ok: () => true }, blue: { n: 'Blue cape', c: '#4f7bd1', ok: () => S.deepest >= 20 }, gold: { n: 'Gold cape', c: '#f5b942', need: 'Silver rank', ok: () => S.rank >= 5 }, void: { n: 'Void cape', c: '#6f2cff', need: 'Abyss depth 20', ok: () => S.abyssBest >= 20 }, rainbow: { n: 'Rainbow cape', c: 'rainbow', need: 'a Mythic piece', ok: () => S.life.mythics >= 1 } };
  CAPES.blue.need = 'reach floor 20';
  function xDrawCape(hx, by) {
    const cp = CAPES[(S.cos || {}).cape]; if (!cp || !cp.c || fainted) return;
    const x0 = hx - 5 * PX, y0 = by - 10 * PX, sway = hero.running ? Math.sin(t * 14) * PX * 0.6 : 0;
    ctx.fillStyle = cp.c === 'rainbow' ? GRADES[Math.floor(t * 3) % 6].c : cp.c;
    ctx.fillRect(Math.round(x0 + PX * 1 - sway), Math.round(y0 + PX * 4), Math.ceil(PX * 2), Math.ceil(PX * 5));
  }
  function xDrawCosmetics(hx, by) {
    const h = HATS[(S.cos || {}).hat]; if (!h || !h.rows.length || fainted) return;
    const x0 = hx - 5 * PX + PX * 2, y0 = by - 10 * PX - h.rows.length * PX + PX;
    h.rows.forEach((row, r) => { for (let c = 0; c < row.length; c++) { const ch = row[c]; if (ch === '.') continue; ctx.fillStyle = h.pal[ch]; ctx.fillRect(Math.round(x0 + c * PX), Math.round(y0 + r * PX), Math.ceil(PX), Math.ceil(PX)); } });
  }
  function renderWardrobe() {
    const W0 = S.eq.weapon, looks = W0.s.map((v, i) => v ? i : -1).filter(i => i >= 0);
    setHTML($('#wardrobe'), `<div class="lbl">Weapon look</div><div class="chips"><button type="button" class="chip${S.look.weapon < 0 ? ' got' : ''}" data-look="-1">Match equipped</button>${looks.map(i => `<button type="button" class="chip${S.look.weapon === i ? ' got' : ''}" data-look="${i}" style="color:${GRADES[Math.floor(i / 4)].c}">${EQ.weapon.names[i]}</button>`).join('')}</div>
      <div class="lbl">Hats</div><div class="chips">${Object.entries(HATS).map(([k, h]) => h.ok() ? `<button type="button" class="chip${S.cos.hat === k ? ' got' : ''}" data-hat="${k}">${h.n}</button>` : `<span class="chip unknown" title="Unlock: ${h.need}">${h.n}: ${h.need}</span>`).join('')}</div>
      <div class="lbl">Capes</div><div class="chips">${Object.entries(CAPES).map(([k, c]) => c.ok() ? `<button type="button" class="chip${S.cos.cape === k ? ' got' : ''}" data-cape="${k}">${c.n}</button>` : `<span class="chip unknown">${c.n}: ${c.need}</span>`).join('')}</div>`);
  }
  $('#wardrobe').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.look !== undefined) S.look.weapon = +b.dataset.look;
    if (b.dataset.hat) S.cos.hat = b.dataset.hat;
    if (b.dataset.cape) S.cos.cape = b.dataset.cape;
    save(); renderWardrobe();
  });

  /* ================= expansion 3: unlocks, research lab, milestones, auto-retire ================= */
  // Features open up as you progress. Tests use your best floor ever (kept
  // through ascending), retires, rank and stars, so nothing re-locks.
  const bestDeep = () => Math.max(S.deepest, (S.life && S.life.best) || 0);
  const atF = n => [() => bestDeep() >= n, `Reach floor ${n}`];
  const atR = n => [() => (S.runs || 0) >= n, n === 1 ? 'Retire once' : `Retire ${n} times`];
  const UNLOCKS = {
    'tab:quests': ['Quests', ...atF(2)], 'tab:skills': ['Skills', ...atF(3)], 'tab:allies': ['Allies', ...atF(4)],
    'tab:equip': ['Equip', ...atF(5)], 'tab:trials': ['Trials', ...atF(5)], 'tab:book': ['Book', ...atF(6)],
    'tab:forge': ['Forge', ...atF(8)], 'tab:hero': ['Hero', ...atF(10)], 'tab:legacy': ['Legacy', ...atF(10)],
    dung: ['Side dungeons', ...atF(5)], gemshop: ['Gem shop', ...atF(8)], ench: ['Enchants', ...atF(8)],
    fish: ['Fishing pond', ...atF(10)], sockets: ['Gem sockets', ...atF(10)], wardrobe: ['Wardrobe', ...atF(10)],
    weekly: ['Weekly quest', ...atF(12)], event: ['Monthly event and pass', ...atF(15)], maps: ['Treasure maps', ...atF(15)],
    exped: ['Expeditions', ...atF(20)], dailyc: ['Daily challenge', ...atF(25)], camp: ['Camp', ...atF(30)],
    evo: ['Class evolution', ...atF(35)], abyss: ['Endless Abyss', ...atF(40)],
    rush: ['Boss Rush', () => bestDeep() >= 60 || S.stars > 0, 'Reach floor 60'],
    talents: ['Talents', () => S.rank >= 1 || S.stars > 0, 'Reach Copper rank'],
    sksum: ['Skill summon', ...atR(1)], lshop: ['Legacy shop', ...atR(1)], ascend: ['Ascend', ...atR(2)],
    chal: ['Challenges', ...atR(3)], lab: ['Research lab', ...atR(3)],
    'auto:autobuy': ['Auto-buy', ...atF(8)], 'auto:autoboss': ['Auto retry boss', ...atF(10)], 'auto:autolevel': ['Auto-level gear', ...atF(15)],
    'auto:autodungeon': ['Auto-dungeon', ...atF(20)], 'auto:autosummon': ['Auto-summon', ...atR(1)], 'auto:autoretire': ['Auto-retire', ...atR(5)]
  };
  const isOpen = k => !UNLOCKS[k] || UNLOCKS[k][1]();
  const autoOn = k => !!S.set[k] && isOpen('auto:' + k);
  const lockNeed = k => `${UNLOCKS[k][0]}: ${UNLOCKS[k][2].toLowerCase()} to unlock`;
  let lockInit = false;
  function applyLocks() {
    S.life.best = bestDeep(); S.unl = S.unl || {};
    for (const k in UNLOCKS) {
      if (S.unl[k] || !isOpen(k)) continue;
      S.unl[k] = 1;
      if (!lockInit) continue;
      queueTut(k); log(`Unlocked: <b>${UNLOCKS[k][0]}</b>!`, 'p'); banner = { text: 'UNLOCKED', sub: UNLOCKS[k][0], life: 2.2 }; tone(784, 1175, 0.2, 'triangle', 0.05);
      if (k.startsWith('tab:')) markTab(k.slice(4));
      else { const el = document.querySelector(`[data-lock="${k}"]`), pn = el && el.closest('.tabpanel'); if (pn) markTab(pn.id.slice(6)); }
    }
    lockInit = true;
    for (const b of document.querySelectorAll('.tabs button')) { const k = 'tab:' + b.dataset.tab, lk = !isOpen(k); b.classList.toggle('locked', lk); b.setAttribute('aria-disabled', String(lk)); b.title = lk ? lockNeed(k) : ''; }
    for (const el of document.querySelectorAll('[data-lock]')) { const k = el.dataset.lock, lk = !isOpen(k); el.classList.toggle('locked', lk); if (lk) el.dataset.need = lockNeed(k); }
    $('#autobuyBtn').hidden = !isOpen('auto:autobuy');
  }

  // Research lab: slow, timed projects paid with runes and shards. Runs on the
  // real clock, so it keeps going while you're away.
  const LAB = [
    ['whet', 'Whetstone Science', 'damage', 0.05, v => `+${pct(v)} damage`],
    ['mail', 'Chainmail Weaving', 'health', 0.05, v => `+${pct(v)} health`],
    ['greed', 'Applied Greed', 'gold', 0.04, v => `+${pct(v)} gold`],
    ['anat', 'Boss Anatomy', 'boss', 0.05, v => `+${pct(v)} boss damage`],
    ['rhythm', 'Combo Theory', 'combo', 2, v => `+${v} combo cap`],
    ['story', 'Storytelling', 'tales', 0.03, v => `+${pct(v)} tales when you retire`],
    ['lock', 'Locksmithing', 'keys', 0.04, v => `dungeon keys refill ${pct(v)} faster`]
  ];
  const LAB_MAX = 10;
  const labL = k => (S.lab && S.lab[k]) || 0;
  function labV(k) { const r = LAB.find(x => x[0] === k); return r ? labL(k) * r[3] : 0; }
  const labCost = L => ({ runes: 15 + 10 * L, shards: 20 + 15 * L });
  const labTime = L => 300 * Math.pow(1.7, L);
  const labSlots = () => 1 + (S.stars > 0 ? 1 : 0);
  const keyMs = () => KEY_MS / (1 + labV('lock'));
  function startLab(k) {
    const L = labL(k), c = labCost(L), jobs = S.labJobs || [];
    if (!isOpen('lab') || L >= LAB_MAX || jobs.length >= labSlots() || jobs.some(j => j.k === k) || S.runes < c.runes || S.shards < c.shards) return;
    S.runes -= c.runes; S.shards -= c.shards;
    S.labJobs = jobs.concat([{ k, end: Date.now() + labTime(L) * 1000 }]);
    log(`Research started: <b>${LAB.find(x => x[0] === k)[1]}</b> (${dur(labTime(L))}).`, 'u'); tone(600, 900, 0.1, 'triangle', 0.05); save(); renderLab();
  }
  function labTick() {
    if (!S.labJobs || !S.labJobs.length) return;
    const now = Date.now(), done = S.labJobs.filter(j => now >= j.end);
    if (!done.length) return;
    S.labJobs = S.labJobs.filter(j => now < j.end);
    for (const j of done) { const r = LAB.find(x => x[0] === j.k); if (!r) continue; S.lab[j.k] = labL(j.k) + 1; S.life.labs = (S.life.labs || 0) + 1; log(`Research done: <b>${r[1]}</b> level ${labL(j.k)} (${r[4](labV(j.k))}).`, 'p'); banner = { text: 'RESEARCH DONE', sub: r[1], life: 2.2 }; markTab('legacy'); }
    recalc(); save();
  }
  function renderLab() {
    const jobs = S.labJobs || [], now = Date.now();
    setText($('#labLbl'), `${jobs.length}/${labSlots()} running${labSlots() < 2 ? ' · 2nd slot at your first star' : ''}`);
    setHTML($('#labBox'), LAB.map(([k, n, , , fx]) => {
      const L = labL(k), c = labCost(L), j = jobs.find(x => x.k === k), max = L >= LAB_MAX;
      const can = !j && !max && jobs.length < labSlots() && S.runes >= c.runes && S.shards >= c.shards;
      const prog = j ? 1 - (j.end - now) / (labTime(L) * 1000) : 0;
      return `<div class="lab"><div style="min-width:0"><div class="pname">${n} <span class="lv">Lv ${L}/${LAB_MAX}</span></div><div class="pfx">${L ? fx(labV(k)) : 'Not researched yet'}${max ? '' : ` <span class="up">→ ${fx((L + 1) * LAB.find(x => x[0] === k)[3])}</span>`}</div></div>` +
        `<button type="button" class="buy${can ? ' ok' : ''}" data-lab="${k}"${j || max ? ' disabled' : ''}><span class="bn">${max ? 'Max' : j ? dur(Math.max(0, (j.end - now) / 1000)) + ' left' : 'Research'}</span><span class="bc">${max || j ? '—' : `${c.runes} runes, ${c.shards} shards · ${dur(labTime(L))}`}</span></button>` +
        (j ? `<div class="qbar"><i style="width:${(prog * 100).toFixed(1)}%"></i></div>` : '') + '</div>';
    }).join(''));
  }
  $('#labBox').addEventListener('click', e => { const b = e.target.closest('[data-lab]'); if (b) { audio(); startLab(b.dataset.lab); } });

  // Floor milestones: one-time rewards for your best floor ever.
  const MILES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 250, 300, 400, 500];
  const mileReward = f => ({ gems: 10 + Math.floor(f / 2), runes: 10 + Math.floor(f / 3), shards: 15 + Math.floor(f / 2), piece: f % 50 === 0 });
  const mileText = f => { const r = mileReward(f); return `${r.gems} gems, ${r.runes} runes, ${r.shards} shards${r.piece ? ' and a Legendary piece' : ''}`; };
  const milesReady = () => MILES.filter(f => f > (S.mileDone || 0) && bestDeep() >= f);
  function claimMiles() {
    const list = milesReady(); if (!list.length) return;
    for (const f of list) {
      const r = mileReward(f); S.gems += r.gems; S.runes += r.runes; S.shards += r.shards;
      if (r.piece) { const cat = pick(['weapon', 'armor', 'helm', 'boots', 'acc']), i = 16 + randi(0, 3); giveItem(cat, i); log(`Milestone gift: ${itemLabel(cat, i)}!`, 'p'); }
      S.mileDone = f;
    }
    log(`Claimed ${list.length} floor milestone${list.length > 1 ? 's' : ''} (up to floor ${S.mileDone}).`, 'p'); jingle(); recalc(); save(); renderMiles();
  }
  function renderMiles() {
    const next = MILES.find(f => f > (S.mileDone || 0)), ready = milesReady();
    setHTML($('#mileBox'), `<div class="shophead"><h3>Floor milestones</h3><span class="lbl">Best floor ${bestDeep()}</span></div><div class="mile">${MILES.map(f => `<span class="${f <= (S.mileDone || 0) ? 'got' : f === next ? 'next' : ''}">${f}</span>`).join('')}</div>` +
      `<p class="hint" style="display:block">${next ? `Floor ${next}: ${mileText(next)}.` : 'Every milestone claimed. Wow.'}</p>` +
      (ready.length ? `<div class="row"><button type="button" class="act ok gem" id="mileBtn">Claim ${ready.length} milestone${ready.length > 1 ? 's' : ''}</button></div>` : ''));
  }
  $('#mileBox').addEventListener('click', e => { if (e.target.closest('#mileBtn')) { audio(); claimMiles(); } });

  // Auto-retire: when a run has stalled for 3 minutes and the tales are worth it.
  function autoRetireTick() {
    if (!autoOn('autoretire') || mode !== 'main' || fainted || S.chal) return;
    const gain = talesFor(S.maxFloor);
    if (gain > 0 && t - lastFloorT > 180 && gain >= Math.max(10, S.tales * 0.5)) { log('Auto-retire: the run stalled, so your hero retired.', 'c'); retireAs(S.cls); }
  }

  // Tutorials: a short tip card when something new unlocks. "Show me" opens
  // the right tab and highlights the feature.
  const TUTS = {
    start: ['Welcome to Coin Crawl', 'Your hero fights on their own. Tap the dungeon (or press Space) to hit harder, and keep tapping for a combo. Spend gold in Train, starting with Sword Practice and Armor. New tabs open as you go deeper.', 'train', '#parts'],
    'tab:quests': ['Quests', 'Quests pay gems. Finish one, claim it and a new one takes its place. Open the daily chest every day to grow your streak.', 'quests', '#questList'],
    'tab:skills': ['Skills', 'Skills fire on their own while Auto skills is on, or tap them under the dungeon (keys 1 to 5). Level them up here with gold. More skills unlock deeper.', 'skills', '#skillList'],
    'tab:allies': ['Allies', 'Hire helpers with gold. They walk behind you and fight, and they evolve at levels 10 and 25. They go home when you retire.', 'allies', '#allyList'],
    'tab:equip': ['Equipment', 'Spend gems to summon gear and pets. Every piece you own gives a small bonus forever, even when not equipped. Merge 5 copies into a better piece and level pieces with shards.', 'equip', '#sum11'],
    'tab:trials': ['Rank trials', 'Beat a rank examiner in 40 seconds to promote: +20% damage and health and +10% gold forever. Trials are free to retry.', 'trials', '#trialBtn'],
    'tab:book': ['Book', 'Every new piece of equipment you discover is +1% damage. Defeat 100 of a monster type to master it for +5% gold.', 'book', '#bookGrid'],
    'tab:forge': ['Forge', 'Enhance your weapon slot with shards. It can fail, but nothing breaks. Reforge rerolls the weapon prefix for runes.', 'forge', '#enhanceBtn'],
    'tab:hero': ['Hero', 'Your class lives here. Training parts evolve at level 100 for a big boost, paid with gold and shards. Check Training evolutions when a part hits its cap.', 'hero', '#pevoList'],
    'tab:legacy': ['Retiring', 'Retire to restart stronger. You earn tales (+10% damage and gold each, forever) and pick a class. Retire when progress slows down, not before.', 'legacy', '#retireBtn'],
    dung: ['Side dungeons', '30-second runs against a huge monster. The more health bars you break, the bigger the reward. Each run costs a key, and keys refill over time.', 'trials', '#dungList'],
    gemshop: ['Gem shop', 'Spend gems on boosts like Time Warp (30 minutes of gold now), rune and shard pouches, and relic boxes.', 'quests', '#gemList'],
    ench: ['Enchants', 'Reroll enchant lines on your weapon with runes. Lock a line you like so rerolls keep it. More lines open at floors 15 and 30.', 'forge', '#rerollBtn'],
    fish: ['Fishing', '5 casts a day. Press Reel in while the marker is in the green zone. The closer to the middle, the better the fish.', 'quests', '[data-lock="fish"]'],
    sockets: ['Gem sockets', 'Craft gems with shards and runes, then socket them for bonuses. Fuse 3 of the same gem into a stronger one.', 'forge', '#sockets'],
    wardrobe: ['Wardrobe', 'Hats, capes and weapon looks for your hero. Pure style. Achievements and events unlock more.', 'hero', '#wardrobe'],
    weekly: ['Weekly quest', 'One bigger quest every week with a big payout of gems, runes and shards.', 'quests', '#weeklyBox'],
    event: ['Monthly event', 'Each month has an event currency and a pass. You earn pass XP just by playing. Claim tier rewards and spend tokens in the event shop.', 'quests', '#eventBox'],
    maps: ['Treasure maps', 'Shiny and rare monsters drop treasure maps. Each map lets you dig 3 of 16 spots for loot.', 'trials', '[data-lock="maps"]'],
    exped: ['Expeditions', 'Send an ally away for a few hours to bring back loot. They do not fight while they are gone.', 'allies', '#expBox'],
    dailyc: ['Daily challenge', 'A special run with the same twists for everyone, once a day. Go as far as you can for rewards.', 'trials', '#dailyChBtn'],
    camp: ['Camp', 'Camp buildings make resources over time, even while you are away. Collect and upgrade them here.', 'allies', '#campBox'],
    evo: ['Class evolution', 'Evolve your class with gems and runes for big permanent bonuses. Each step offers two paths, and the choice is permanent for that class.', 'hero', '#evoBtn'],
    abyss: ['Endless Abyss', 'One life, endless depth. Each depth is harder and pays more. You can dive every 15 minutes.', 'trials', '#abyssBtn'],
    rush: ['Boss Rush', 'Beat 10 bosses in 90 seconds. Once an hour.', 'trials', '#rushBtn'],
    talents: ['Talents', 'Talent points come from ranks, stars, every 25 floors and achievements. Talents stay forever, and resetting them is free.', 'hero', '#talents'],
    sksum: ['Skill summon', 'Summon 18 extra skills with gems. Duplicate copies level them up. Put your favorites in the skill bar.', 'skills', '#skSum1'],
    lshop: ['Legacy shop', 'Retiring gives legacy tokens. Spend them on head starts and discounts. Pick an heirloom to keep 10% of one part\'s levels when you retire.', 'legacy', '#lshop'],
    ascend: ['Ascending', 'A bigger reset: tales and floors go, but you earn stars. Each star is ×1.5 damage, health and gold forever. More tales give more stars, so retire a few times first.', 'legacy', '#ascBtn'],
    chal: ['Challenges', 'Start a new hero with a handicap. Reach the goal floor to win a permanent reward.', 'legacy', '#challenges'],
    lab: ['Research lab', 'Research takes real time and keeps going while you are away. Pay runes and shards to start a project. You get a second slot at your first star.', 'legacy', '#labBox'],
    'auto:autobuy': ['Auto-buy', 'The Auto-buy button in Train buys the cheapest training upgrade twice a second.', 'train', '#autobuyBtn'],
    'auto:autoboss': ['Auto retry boss', 'Turn it on in Settings: while farming, you try the boss again every 3 loops.', 'settings', ''],
    'auto:autolevel': ['Auto-level gear', 'Turn it on in Settings: spare shards level up your equipped gear.', 'settings', ''],
    'auto:autodungeon': ['Auto-dungeon', 'Turn it on in Settings: side dungeons run whenever their keys are full.', 'settings', ''],
    'auto:autosummon': ['Auto-summon', 'Turn it on in Settings: a ×35 summon happens whenever you have 210+ gems.', 'settings', ''],
    'auto:autoretire': ['Auto-retire', 'Turn it on in Settings: your hero retires when a run stalls for 3 minutes and the tales are worth it.', 'settings', '']
  };
  const overlayOpen = () => !!document.querySelector('.overlay:not([hidden])');
  function queueTut(k) {
    if (!TUTS[k] || S.set.tips === false) return;
    S.tutQ = (S.tutQ || []).filter(x => x !== k).concat([k]);
    showTut();
  }
  function showTut() {
    const c = $('#tutCard'), q = (S.tutQ || []).filter(k => TUTS[k]);
    S.tutQ = q;
    if (!q.length || S.set.tips === false) { c.hidden = true; return; }
    if (overlayOpen()) return;
    const [n, body] = TUTS[q[0]];
    setHTML(c, `<div class="tuthead"><b>${n}</b>${q.length > 1 ? `<span class="lbl">1 of ${q.length}</span>` : ''}</div><p>${body}</p><div class="row"><button type="button" class="act ok gem" data-tut="show">Show me</button><button type="button" class="pill" data-tut="ok">Got it</button><button type="button" class="linkbtn" data-tut="off">Turn off tips</button></div>`);
    c.hidden = false;
  }
  $('#tutCard').addEventListener('click', e => {
    const b = e.target.closest('[data-tut]'); if (!b) return;
    const k = (S.tutQ || [])[0], act = b.dataset.tut;
    S.tutQ = (S.tutQ || []).slice(1);
    if (act === 'off') { S.set.tips = false; S.tutQ = []; log('Tips are off. Turn them back on in Settings.', 'c'); }
    if (act === 'show' && TUTS[k]) {
      const [, , tab, sel] = TUTS[k];
      if (tab === 'settings') openModal('setModal');
      else {
        showTab(tab); save();
        const el = sel && document.querySelector(sel);
        if (el) { el.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); el.classList.remove('tutHi'); void el.offsetWidth; el.classList.add('tutHi'); setTimeout(() => el.classList.remove('tutHi'), 3200); }
      }
    }
    save(); showTut();
  });

  ACHS.push(
    ['unlock10', 'Grand Tour', 'Unlock 20 features', () => Object.keys(S.unl || {}).length >= 20],
    ['unlockall', 'Seen It All', 'Unlock every feature', () => Object.keys(UNLOCKS).every(isOpen)],
    ['lab5', 'Mad Scientist', 'Finish 5 research projects', () => (S.life.labs || 0) >= 5],
    ['labmax', 'Nobel Prize', 'Max a research project', () => LAB.some(r => labL(r[0]) >= LAB_MAX)],
    ['mile100', 'Milestone Maniac', 'Claim the floor 100 milestone', () => (S.mileDone || 0) >= 100]
  );

  /* ================= boot ================= */
  applyPin();
  buildEquip();
  buildLists(); resize(); recalc(); hero.hp = st.maxHp; fillQuests(); regenKeys();
  if (!RENDER[S.tab]) S.tab = 'train';
  refreshAll();
  const awayMsg = xOffline();
  if (!awayMsg) log(S.floor > 1 || S.gold > 0 ? `Welcome back. Floor ${S.floor}, ${fmt(S.gold)} gold in your pocket.` : 'A brave peasant enters the Damp Cellar. Tap the slimes!');
  if (dailyReady()) { log('Your daily chest is ready in Quests.', 'p'); markTab('quests'); }
  weeklyCheck(); lastMax = S.maxFloor;
  save();
  showTitle(awayMsg);
  if (loadErr) log(loadErr, 'r');
  // Balance simulator hook (scripts/sim.js). Only active with ?sim in the URL:
  // it steps the game without drawing and exposes the internals to the bot.
  const SIM = /[?&]sim\b/.test(location.search);
  if (SIM) window.__cc = { ev: c => eval(c), step(sec) { for (let k = 0; k < sec * 10; k++) { window.__simT = (window.__simT || 0) + 0.1; update(0.1); } } };
  let last = performance.now(), uiT = 0, saveT = 0, fps = 60;
  let errN = 0;
  function frameErr(e) {
    errN++;
    console.error('Coin Crawl error', e);
    if (errN <= 3) { try { log(`Something went wrong (${String(e && e.message || e).slice(0, 80)}). The game kept running. If this keeps happening, export your save in Settings.`, 'r'); } catch (e2) {} }
  }
  function frame(now) {
    if (SIM) return;
    requestAnimationFrame(frame);
    try { frameBody(now); } catch (e) { frameErr(e); }
  }
  function frameBody(now) {
    const raw = Math.min(0.05, (now - last) / 1000); last = now;
    fps = fps * 0.95 + (1 / Math.max(raw, 0.001)) * 0.05;
    let left = raw * dev.speed * (slowmo > 0 ? 0.3 : 1);
    if (hitStop > 0) { hitStop -= raw; left = 0; }
    slowmo = Math.max(0, slowmo - raw); flashT = Math.max(0, flashT - raw);
    while (left > 0) { const step = Math.min(0.05, left); update(step); left -= step; }
    draw();
    uiT += raw; saveT += raw;
    if (uiT > 0.15) { uiT = 0; renderHud(); }
    if (saveT > 5) { saveT = 0; save(); }
  }
  requestAnimationFrame(frame);
})();
