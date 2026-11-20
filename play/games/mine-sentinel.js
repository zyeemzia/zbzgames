/* Mine Sentinel · ZBZGames™ original. Clear every safe square; numbers count the mines around them. */
ZBZ.register({ start(api) {
  const W = 9, H = 9, M = 10;
  let cells = [], first = true, flagMode = false, left = W * H - M;
  const t0 = performance.now();
  const wrap = document.createElement('div');
  wrap.className = 'mn-wrap';
  wrap.innerHTML = `<div class="mn-bar"><button class="mn-mode" type="button" aria-pressed="false">⛏️ Dig</button><span class="mn-left">🚩 ${M}</span></div><div class="mn-board" role="grid"></div><p class="mn-tip">Right-click or long-press to flag.</p>`;
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
    const c = cells[i], b = btns[i];
    b.className = 'mn-c' + (c.open ? ' open' : '') + (c.flag ? ' flag' : '');
    b.textContent = c.open ? (c.mine ? '💥' : (c.n || '')) : (c.flag ? '🚩' : '');
    b.dataset.n = c.open ? c.n : '';
    b.setAttribute('aria-label', c.open ? (c.mine ? 'Mine' : (c.n ? c.n + ' mines near' : 'Empty')) : (c.flag ? 'Flagged' : 'Hidden'));
  }
  function open(i) {
    const c = cells[i];
    if (c.open || c.flag) return;
    if (first) { first = false; lay(i); }
    c.open = true; paint(i);
    if (c.mine) {
      cells.forEach((d, j) => { if (d.mine) { d.open = true; paint(j); } });
      api.sfx('bad'); api.end('A mine went off.'); return;
    }
    left--; api.score(W * H - M - left);
    if (!c.n) around(i).forEach(open);
    if (left === 0 && api.alive) {
      const secs = Math.round((performance.now() - t0) / 1000);
      api.score(W * H - M + Math.max(0, 200 - secs));
      api.end(`Field cleared in ${secs} seconds.`);
    }
  }
  function flag(i) {
    const c = cells[i]; if (c.open) return;
    c.flag = !c.flag; paint(i); api.sfx('tap'); leftEl.textContent = '🚩 ' + (M - flags());
  }
  modeBtn.onclick = () => { flagMode = !flagMode; modeBtn.textContent = flagMode ? '🚩 Flag' : '⛏️ Dig'; modeBtn.setAttribute('aria-pressed', String(flagMode)); };
  let pressT = 0, longPressed = false;
  api.on(board, 'pointerdown', e => {
    const b = e.target.closest('.mn-c'); if (!b) return;
    longPressed = false;
    pressT = setTimeout(() => { longPressed = true; flag(+b.dataset.i); }, 450);
  });
  const cancel = () => clearTimeout(pressT);
  api.on(board, 'pointerup', cancel); api.on(board, 'pointerleave', cancel);
  api.on(board, 'contextmenu', e => { e.preventDefault(); });
  api.on(board, 'click', e => {
    const b = e.target.closest('.mn-c'); if (!b || longPressed) return;
    const i = +b.dataset.i;
    if (flagMode) flag(i); else { api.sfx('tap'); open(i); }
  });
  api.on(board, 'auxclick', e => { const b = e.target.closest('.mn-c'); if (b && e.button === 2) flag(+b.dataset.i); });
} });
