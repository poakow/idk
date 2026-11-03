// Global leaderboard client for Coin Crawl on the website.
// Talks to Supabase (see supabase/schema.sql). Each device gets a random
// player id and secret, kept in this browser; the secret proves a score
// update comes from the same device. Exposes window.IDKBoard.
(() => {
  const C = window.IDK_CONFIG || {};
  const url = (C.supabaseUrl || '').replace(/\/+$/, ''), key = C.supabaseKey || '';
  const enabled = !!(url && key);
  const KEY = 'idk.player';
  const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
  const uuid = () => { const h = hex(16); return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${'89ab'[parseInt(h[16], 16) % 4]}${h.slice(17, 20)}-${h.slice(20, 32)}`; };
  function me() {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!p || !p.id || !p.secret) { p = { id: uuid(), secret: hex(24), name: 'Hero' + Math.floor(1000 + Math.random() * 9000) }; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
    return p;
  }
  const cleanName = n => String(n || '').replace(/[^A-Za-z0-9 _.-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
  function setName(n) { const p = me(), c = cleanName(n); if (c.length < 2) return false; p.name = c; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} return true; }
  const headers = () => ({ apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' });
  async function submit(f) {
    if (!enabled) return { ok: false, why: 'off' };
    const p = me(), body = { p_id: p.id, p_secret: p.secret, p_name: p.name };
    for (const [k, v] of Object.entries(f || {})) if (v !== undefined && v !== null) body['p_' + k] = typeof v === 'number' ? Math.max(0, Math.floor(v)) : String(v).slice(0, 40);
    try {
      const r = await fetch(url + '/rest/v1/rpc/submit_score', { method: 'POST', headers: headers(), body: JSON.stringify(body) });
      if (r.ok) return { ok: true };
      const t = await r.text(); return { ok: false, why: /implausible/.test(t) ? 'implausible' : /not your/.test(t) ? 'taken' : /bad name/.test(t) ? 'name' : 'error' };
    } catch (e) { return { ok: false, why: 'network' }; }
  }
  const COLS = ['deepest', 'abyss', 'rush', 'titan', 'stars'];
  async function top(cat, n, sinceDays) {
    if (!enabled) return null;
    const c = COLS.includes(cat) ? cat : 'deepest';
    const since = sinceDays ? `&updated_at=gte.${new Date(Date.now() - sinceDays * 864e5).toISOString()}` : '';
    const q = `select=player_id,name,deepest,abyss,rush,titan,stars,cls,title&${c}=gt.0${since}&order=${c}.desc,updated_at.asc&limit=${Math.min(100, n || 50)}`;
    try { const r = await fetch(url + '/rest/v1/scores?' + q, { headers: headers() }); if (!r.ok) return null; return await r.json(); } catch (e) { return null; }
  }
  // Save transfer between devices (see transfers in supabase/schema.sql)
  async function rpc(fn, body) { const r = await fetch(url + '/rest/v1/rpc/' + fn, { method: 'POST', headers: headers(), body: JSON.stringify(body) }); if (!r.ok) throw new Error(await r.text()); return r.json(); }
  async function sendSave(data) { if (!enabled) return null; try { return await rpc('create_transfer', { p_data: data }); } catch (e) { return null; } }
  async function takeSave(code) { if (!enabled) return null; try { return await rpc('take_transfer', { p_code: code }); } catch (e) { return null; } }
  window.IDKBoard = { enabled, me, setName, cleanName, submit, top, sendSave, takeSave };
})();
