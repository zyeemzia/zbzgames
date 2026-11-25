/* Mine Sentinel · ZBZGames™ original. Clear every safe square; numbers count the mines around them. */
ZBZ.register({ start(api) {
  const W = 9, H = 9, M = 10;
  let cells = [], first = true, flagMode = false, left = W * H - M;
  const wrap = document.createElement('div');
  wrap.className = 'mn-wrap';
  wrap.innerHTML = `<div class="mn-bar"><button class="mn-mode" type="button" aria-pressed="false">⛏️ Dig</button><span class="g-chip mn-left">🚩 ${M}</span></div><div class="mn-board" role="grid"></div><p class="mn-tip">Right-click, long-press or press F to flag.</p>`;
  api.stage.appendChild(wrap);
  const board = wrap.querySelector('.mn-board'), modeBtn = wrap.querySelector('.mn-mode'), leftEl = wrap.querySelector('.mn-left');
  for (let i = 0; i < W * H; i++) cells.push({ mine: false, n: 0, open: false, flag: false });
  board.innerHTML = cells.map((_, i) => `<button class="mn-c" type="button" data-i="${i}" aria-label="Hidden"></button>`).join('');
  const btns = [...board.children];
  const around = i => { const x = i % W, y = Math.floor(i / W), out = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if ((dx || dy) && nx >= 0 && ny >= 0 && nx < W && ny < H) out.push(ny * W + nx); } return out; };
  function lay(safe) {
    const no = new Set([safe, ...around(safe)]);
    let placed = 0;
    while (placed < M) { const i = Math.floor(Math.random() * W * H); if (!no.has(i) && !cells[i].mine) { cells[i].mine = true; placed++; } }
    cells.forEach((c, i) => { c.n = around(i).filter(j => cells[j].mine).length; });
  }
  const flags = () => cells.filter(c => c.flag).length;
  function paint(i) {
    const c = cells[i], b = btns[i], kb = b.classList.contains('kb');
    b.className = 'mn-c' + (c.open ? ' open' : '') + (c.flag ? ' flag' : '') + (kb ? ' kb' : '');
    b.textContent = c.open ? (c.mine ? '💥' : (c.n || '')) : (c.flag ? '🚩' : '');
    b.dataset.n = c.open ? c.n : '';
    b.setAttribute('aria-label', c.open ? (c.mine ? 'Mine' : (c.n ? c.n + ' mines near' : 'Empty')) : (c.flag ? 'Flagged' : 'Hidden'));
  }
  function open(i) {
    // An explicit stack, so a wide empty area can never overflow the call stack.
    const todo = [i];
    while (todo.length && api.alive) {
      const j = todo.pop(), c = cells[j];
      if (c.open || c.flag) continue;
      if (first) { first = false; lay(j); }
      c.open = true; paint(j);
      if (c.mine) {
        cells.forEach((d, k) => { if (d.mine) { d.open = true; paint(k); } });
        const [x, y] = api.center(btns[j]); api.fx.burst(x, y, '#ff5470', 30, 280); api.fx.shake(10);
        api.end('A mine went off.'); return;
      }
      left--;
      if (!c.n) todo.push(...around(j));
    }
    api.score(W * H - M - left);
    if (left === 0 && api.alive) {
      const secs = Math.round(api.time());
      cells.forEach((d, k) => { if (d.mine && !d.flag) { d.flag = true; paint(k); } });
      api.score(W * H - M + Math.max(0, 200 - secs));
      api.end(`Field cleared in ${secs} seconds.`);
    }
  }
  function flag(i) {
    const c = cells[i]; if (c.open) return;
    c.flag = !c.flag; paint(i); api.sfx('tap'); leftEl.textContent = '🚩 ' + (M - flags());
  }
  const setMode = on => { flagMode = on; modeBtn.textContent = flagMode ? '🚩 Flag' : '⛏️ Dig'; modeBtn.setAttribute('aria-pressed', String(flagMode)); };
  api.on(modeBtn, 'click', () => setMode(!flagMode));
  let pressT = 0, longPressed = false;
  const cancel = () => clearTimeout(pressT);
  api.on(board, 'pointerdown', e => {
    const b = e.target.closest('.mn-c'); if (!b) return;
    longPressed = false; cancel();
    if (e.button === 0) pressT = setTimeout(() => { if (api.alive) { longPressed = true; flag(+b.dataset.i); } }, 450);
  });
  api.on(board, 'pointerup', cancel); api.on(board, 'pointerleave', cancel); api.on(board, 'pointercancel', cancel);
  api.on(board, 'contextmenu', e => { e.preventDefault(); const b = e.target.closest('.mn-c'); if (b && !longPressed) flag(+b.dataset.i); });
  api.on(board, 'click', e => {
    const b = e.target.closest('.mn-c'); if (!b) return;
    if (longPressed) { longPressed = false; return; }
    const i = +b.dataset.i;
    if (flagMode) flag(i); else { api.sfx('tap'); open(i); }
  });
  api.probe = () => ({ mines: cells.map(c => c.mine), first });
  const cur = api.cursor(() => btns, () => W, i => { if (flagMode) flag(i); else { api.sfx('tap'); open(i); } });
  api.key(k => { if (k === 'f' || k === 'F') { if (cur.i >= 0) flag(cur.i); else setMode(!flagMode); } });
} });
