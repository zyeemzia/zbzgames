/* Gem Cascade · ZBZGames™ original. Swap two neighbouring gems to line up three or more. Gems fall into the gaps and can chain. */
ZBZ.register({ start(api) {
  const N = 7, KINDS = 6, MOVES = 25;
  const SHAPE = ['●', '◆', '▲', '■', '★', '⬢'], NAME = ['Red', 'Gold', 'Green', 'Blue', 'Violet', 'Orange'];
  const rnd = n => Math.floor(Math.random() * n);
  let b = [], sel = -1, busy = false, moves = MOVES, fresh = new Set(), down = null, swiped = false, chain = 0, best = 0;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap gc-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Moves <b class="gc-m">${MOVES}</b></span><span class="g-chip gc-chain" hidden>Chain ×<b>2</b></span></div><div class="gc-grid"></div><p class="g-sub">Swap two gems that touch. Longer lines and chains score more.</p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.gc-grid'), mEl = wrap.querySelector('.gc-m'), chainEl = wrap.querySelector('.gc-chain'), sub = wrap.querySelector('.g-sub');
  // every gem that sits in a line of three or more
  const runs = g => {
    const out = new Set();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x, v = g[i]; if (v < 0) continue;
      if (x <= N - 3 && g[i + 1] === v && g[i + 2] === v) { let k = x; while (k < N && g[y * N + k] === v) out.add(y * N + k++); }
      if (y <= N - 3 && g[i + N] === v && g[i + 2 * N] === v) { let k = y; while (k < N && g[k * N + x] === v) out.add(k++ * N + x); }
    }
    return out;
  };
  // one swap that makes a line, or null when the board is stuck
  const hint = g => {
    for (let i = 0; i < N * N; i++) for (const j of [i % N < N - 1 ? i + 1 : -1, i + N < N * N ? i + N : -1]) {
      if (j < 0) continue;
      [g[i], g[j]] = [g[j], g[i]]; const ok = runs(g).size > 0; [g[i], g[j]] = [g[j], g[i]];
      if (ok) return [i, j];
    }
    return null;
  };
  function fill() {
    do {
      b = Array.from({ length: N * N }, () => rnd(KINDS));
      for (let guard = 0; guard < 300 && runs(b).size; guard++) runs(b).forEach(i => { b[i] = rnd(KINDS); });
    } while (runs(b).size || !hint(b));
  }
  function draw() {
    grid.innerHTML = b.map((v, i) => `<button type="button" class="gc-c k${v}${i === sel ? ' sel' : ''}${fresh.has(i) ? ' new' : ''}" data-i="${i}" aria-label="${NAME[v]} gem">${SHAPE[v]}</button>`).join('');
    mEl.textContent = moves;
    cur.paint();
  }
  const touching = (i, j) => (Math.abs(i - j) === 1 && Math.floor(i / N) === Math.floor(j / N)) || Math.abs(i - j) === N;
  function resolve() {
    const hit = runs(b);
    if (!hit.size) {
      busy = false; chainEl.hidden = true; fresh = new Set();
      if (moves <= 0) return api.end(`Your longest chain was ×${best}.`);
      if (!hint(b)) { fill(); sub.textContent = 'No swap was left, so the gems were shuffled.'; }
      return draw();
    }
    chain++; best = Math.max(best, chain);
    const pts = hit.size * 10 * chain + (hit.size > 3 ? (hit.size - 3) * 10 : 0), list = [...hit];
    api.add(pts); api.sfx(chain > 1 ? 'star' : 'point');
    list.forEach(i => { const c = grid.children[i]; if (c) c.classList.add('gone'); });
    const mid = grid.children[list[Math.floor(list.length / 2)]];
    if (mid) api.pop(mid, '#ffd23f', '+' + pts);
    if (chain > 1) { chainEl.hidden = false; chainEl.querySelector('b').textContent = chain; }
    api.after(240, () => {
      list.forEach(i => { b[i] = -1; }); fresh = new Set();
      for (let x = 0; x < N; x++) {
        let w = N - 1;
        for (let y = N - 1; y >= 0; y--) { const v = b[y * N + x]; if (v >= 0) { if (w !== y) { b[w * N + x] = v; b[y * N + x] = -1; fresh.add(w * N + x); } w--; } }
        for (; w >= 0; w--) { b[w * N + x] = rnd(KINDS); fresh.add(w * N + x); }
      }
      draw(); api.after(280, resolve);
    });
  }
  function trySwap(i, j) {
    if (busy || !api.alive || !touching(i, j)) return;
    sel = -1;
    [b[i], b[j]] = [b[j], b[i]];
    if (!runs(b).size) {
      [b[i], b[j]] = [b[j], b[i]]; api.sfx('bad'); draw();
      [i, j].forEach(k => grid.children[k].classList.add('shake'));
      return;
    }
    moves--; busy = true; chain = 0; fresh = new Set([i, j]); api.sfx('tap'); sub.textContent = 'Swap two gems that touch. Longer lines and chains score more.';
    draw(); api.after(170, resolve);
  }
  function tapCell(i) {
    if (busy) return;
    if (sel >= 0 && touching(sel, i)) return trySwap(sel, i);
    sel = sel === i ? -1 : i; api.sfx('tap'); draw();
  }
  api.on(grid, 'pointerdown', e => { const c = e.target.closest('.gc-c'); swiped = false; down = c ? { i: +c.dataset.i, x: e.clientX, y: e.clientY } : null; });
  api.on(api.stage, 'pointermove', e => {
    if (!down || busy) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.hypot(dx, dy) < 18) return;
    const i = down.i, x = i % N, y = Math.floor(i / N); down = null; swiped = true;
    const j = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? (x < N - 1 ? i + 1 : -1) : (x > 0 ? i - 1 : -1)) : (dy > 0 ? (y < N - 1 ? i + N : -1) : (y > 0 ? i - N : -1));
    if (j >= 0) trySwap(i, j);
  });
  api.on(window, 'pointerup', () => { down = null; });
  api.on(grid, 'click', e => { const c = e.target.closest('.gc-c'); if (c && !swiped) tapCell(+c.dataset.i); swiped = false; });
  const cur = api.cursor(() => [...grid.children], () => N, i => tapCell(i));
  api.probe = () => ({ b: b.slice(), N, busy, moves, hint: busy ? null : hint(b.slice()) });
  fill(); draw();
} });
