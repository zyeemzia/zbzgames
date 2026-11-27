/* Block Bay · ZBZGames™ original. Fit the three shapes into the bay. A full row or column clears and scores. The game ends when no shape fits. */
ZBZ.register({ start(api) {
  const N = 8;
  const SHAPES = ['1', '11', '1/1', '111', '1/1/1', '11/11', '11/10', '11/01', '10/11', '01/11', '1111', '1/1/1/1', '111/100', '111/001', '100/111', '001/111', '10/10/11', '01/01/11', '11/10/10', '11/01/01', '111/010', '010/111', '10/11/10', '01/11/01', '110/011', '011/110', '111/111/111', '11111', '1/1/1/1/1', '111/100/100', '111/001/001', '100/100/111', '001/001/111']
    .map(s => { const rows = s.split('/'), out = []; rows.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '1') out.push([r, c]); })); return { cells: out, hgt: rows.length, wid: Math.max(...rows.map(x => x.length)) }; });
  const b = Array(N * N).fill(0);
  let pieces = [], sel = 0, lock = false, placed = 0, lines = 0, ghost = -1;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap bb-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Lines <b class="bb-l">0</b></span><span class="g-chip">Shapes <b class="bb-n">0</b></span></div><div class="bb-grid">${Array.from({ length: N * N }, (_, i) => `<button type="button" class="bb-c" data-i="${i}" tabindex="-1"></button>`).join('')}</div><div class="bb-tray"></div><p class="g-sub">Pick a shape, then tap where its middle goes.</p>`;
  api.stage.appendChild(wrap);
  const gEl = wrap.querySelector('.bb-grid'), tray = wrap.querySelector('.bb-tray'), lEl = wrap.querySelector('.bb-l'), nEl = wrap.querySelector('.bb-n'), cells = [...gEl.children];
  const fits = (p, r0, c0) => r0 >= 0 && c0 >= 0 && r0 + p.hgt <= N && c0 + p.wid <= N && p.cells.every(([r, c]) => !b[(r0 + r) * N + c0 + c]);
  const anyFit = p => { for (let r = 0; r <= N - p.hgt; r++) for (let c = 0; c <= N - p.wid; c++) if (fits(p, r, c)) return true; return false; };
  // a tap names the middle of the shape; near an edge the shape slides back inside
  const origin = (p, i) => [Math.max(0, Math.min(N - p.hgt, Math.floor(i / N) - Math.floor((p.hgt - 1) / 2))), Math.max(0, Math.min(N - p.wid, i % N - Math.floor((p.wid - 1) / 2)))];
  function deal() {
    for (let tries = 0; tries < 30; tries++) {
      const filled = b.filter(Boolean).length, big = filled > 34 ? 14 : SHAPES.length;      // a crowded bay gets smaller shapes more often
      pieces = [0, 1, 2].map(() => { const s = SHAPES[Math.floor(Math.random() * (Math.random() < .55 ? big : SHAPES.length))]; return { cells: s.cells, hgt: s.hgt, wid: s.wid, hue: Math.floor(Math.random() * 12) * 30, used: false }; });
      if (pieces.some(anyFit)) break;
    }
    sel = Math.max(0, pieces.findIndex(anyFit));
  }
  function paintTray() {
    tray.innerHTML = pieces.map((p, i) => `<button type="button" class="bb-p${i === sel && !p.used ? ' sel' : ''}${p.used ? ' used' : ''}${!p.used && !anyFit(p) ? ' stuck' : ''}" data-p="${i}" ${p.used ? 'disabled' : ''} aria-label="Shape ${i + 1}"><small>${i + 1}</small><span class="bb-m" style="--w:${p.wid};--h:${p.hgt};--hue:${p.hue}">${Array.from({ length: p.hgt * p.wid }, (_, k) => `<i${p.cells.some(([r, c]) => r * p.wid + c === k) ? ' class="on"' : ''}></i>`).join('')}</span></button>`).join('');
  }
  function paint(flash) {
    cells.forEach((el, i) => { el.classList.toggle('on', !!b[i]); if (b[i]) el.style.setProperty('--hue', b[i] - 1); el.classList.remove('gh', 'gh-no'); if (flash && flash.has(i)) { el.classList.remove('clr'); void el.offsetWidth; el.classList.add('clr'); } });
    lEl.textContent = lines; nEl.textContent = placed;
  }
  function preview(i) {
    cells.forEach(el => el.classList.remove('gh', 'gh-no'));
    ghost = i; const p = pieces[sel];
    if (i < 0 || !p || p.used || lock) return;
    const [r0, c0] = origin(p, i), ok = fits(p, r0, c0);
    p.cells.forEach(([r, c]) => { const el = cells[(r0 + r) * N + c0 + c]; if (el) el.classList.add(ok ? 'gh' : 'gh-no'); });
  }
  function put(i) {
    const p = pieces[sel];
    if (lock || !p || p.used) return;
    const [r0, c0] = origin(p, i);
    if (!fits(p, r0, c0)) { api.sfx('bad'); gEl.classList.remove('shake'); void gEl.offsetWidth; gEl.classList.add('shake'); preview(-1); return; }
    p.cells.forEach(([r, c]) => { b[(r0 + r) * N + c0 + c] = p.hue + 1; });
    p.used = true; placed++; api.add(p.cells.length); api.sfx('tap');
    const full = [], flash = new Set();
    for (let k = 0; k < N; k++) {
      if (Array.from({ length: N }, (_, c) => b[k * N + c]).every(Boolean)) full.push(Array.from({ length: N }, (_, c) => k * N + c));
      if (Array.from({ length: N }, (_, r) => b[r * N + k]).every(Boolean)) full.push(Array.from({ length: N }, (_, r) => r * N + k));
    }
    if (full.length) {
      full.forEach(list => list.forEach(x => { b[x] = 0; flash.add(x); }));
      const pts = 10 * full.length * full.length; lines += full.length;
      api.add(pts); api.sfx(full.length > 1 ? 'win' : 'point'); api.pop(cells[full[0][Math.floor(N / 2)]], '#ffd23f', (full.length > 1 ? full.length + ' lines! +' : '+') + pts);
    }
    if (pieces.every(x => x.used)) deal(); else sel = Math.max(0, pieces.findIndex(x => !x.used && anyFit(x)));
    paint(flash); paintTray();
    if (!pieces.some(x => !x.used && anyFit(x))) { lock = true; api.after(800, () => api.end(`No shape fits any more. ${placed} shapes placed, ${lines} line${lines === 1 ? '' : 's'} cleared.`)); }
  }
  const under = e => { const el = document.elementFromPoint(e.clientX, e.clientY), c = el && el.closest ? el.closest('.bb-c') : null; return c ? +c.dataset.i : -1; };
  let held = false;
  api.on(gEl, 'pointerdown', e => { const c = e.target.closest('.bb-c'); if (!c || lock) return; e.preventDefault(); held = true; preview(+c.dataset.i); });
  api.on(window, 'pointermove', e => { if (lock) return; if (held || e.pointerType === 'mouse') { const i = under(e); if (i !== ghost) preview(i); } });
  api.on(window, 'pointerup', e => { if (!held) return; held = false; let i = under(e); if (i < 0 && e.target && e.target.closest) { const c = e.target.closest('.bb-c'); if (c) i = +c.dataset.i; } if (i >= 0) put(i); else preview(-1); });
  api.on(window, 'pointercancel', () => { held = false; preview(-1); });
  const choose = i => { if (!lock && pieces[i] && !pieces[i].used) { sel = i; paintTray(); api.note(440, .05, .04); } };
  api.on(tray, 'click', e => { const p = e.target.closest('.bb-p'); if (p) { choose(+p.dataset.p); } });
  const kbd = api.cursor(() => cells, () => N, i => put(i));
  api.key((k, e) => { if (!e.repeat && (k === '1' || k === '2' || k === '3')) choose(+k - 1); });
  api.probe = () => ({ N, b: b.slice(), sel, lock, pieces: pieces.map(p => ({ cells: p.cells, hgt: p.hgt, wid: p.wid, used: p.used })) });
  deal(); paint(); paintTray();
} });
