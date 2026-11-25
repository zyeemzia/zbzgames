/* Tide Fill · ZBZGames™ original. Start in the top-left corner and let one colour spread, pick by pick, until it covers the whole board. */
ZBZ.register({ start(api) {
  const COLS = ['#ff5470', '#4d8dff', '#3ddc84', '#ffd23f', '#a78bfa', '#ff9f43'];
  const NAMES = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  let level = 1, N = 8, K = 4, g = [], moves = 0, limit = 0, lock = false, filled = 0;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Level <b class="tf-lv">1</b></span><span class="g-chip">Moves <b class="tf-mv">0</b>/<span class="tf-lim">0</span></span><span class="g-chip">Covered <b class="tf-pc">0</b>%</span></div><div class="tf-grid"></div><div class="tf-pal"></div><p class="g-sub">Pick a colour. Your corner patch takes it and swallows every touching tile of that colour.</p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.tf-grid'), pal = wrap.querySelector('.tf-pal');
  const lvEl = wrap.querySelector('.tf-lv'), mvEl = wrap.querySelector('.tf-mv'), limEl = wrap.querySelector('.tf-lim'), pcEl = wrap.querySelector('.tf-pc');
  // the corner patch: every tile joined to the top-left one through tiles of the same colour
  function patch(b) {
    const c = b[0], seen = new Uint8Array(N * N), todo = [0], out = [];
    seen[0] = 1;
    while (todo.length) {
      const i = todo.pop(); out.push(i);
      const x = i % N;
      for (const j of [i - N, i + N, x ? i - 1 : -1, x < N - 1 ? i + 1 : -1]) if (j >= 0 && j < N * N && !seen[j] && b[j] === c) { seen[j] = 1; todo.push(j); }
    }
    return out;
  }
  const pour = (b, c) => { patch(b).forEach(i => { b[i] = c; }); return patch(b).length; };
  // How many picks a simple greedy player needs: the move limit is that plus a little, so every board can be won.
  function greedy(start) {
    const b = start.slice(); let n = 0;
    while (patch(b).length < N * N && n < 200) {
      let best = -1, size = -1;
      for (let c = 0; c < K; c++) { if (c === b[0]) continue; const t = b.slice(), s = pour(t, c); if (s > size) { size = s; best = c; } }
      pour(b, best); n++;
    }
    return n;
  }
  function paint(fresh) {
    const cells = grid.children;
    for (let i = 0; i < N * N; i++) { cells[i].style.background = COLS[g[i]]; if (fresh && fresh.has(i)) { cells[i].classList.remove('in'); void cells[i].offsetWidth; cells[i].classList.add('in'); } }
    filled = patch(g).length;
    lvEl.textContent = level; mvEl.textContent = moves; limEl.textContent = limit; pcEl.textContent = Math.floor(filled / (N * N) * 100);
    [...pal.children].forEach((b, c) => { b.disabled = c === g[0]; });
  }
  function build() {
    N = Math.min(12, 6 + level * 2); K = Math.min(COLS.length, 3 + Math.ceil(level / 2));
    do { g = Array.from({ length: N * N }, () => Math.floor(Math.random() * K)); } while (patch(g).length === N * N);
    moves = 0; limit = greedy(g) + Math.max(1, 3 - Math.floor(level / 3)); lock = false;
    grid.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    grid.innerHTML = Array.from({ length: N * N }, () => '<i></i>').join('');
    pal.innerHTML = COLS.slice(0, K).map((c, i) => `<button type="button" class="tf-p" data-c="${i}" style="--c:${c}" aria-label="${NAMES[i]}"><small>${i + 1}</small></button>`).join('');
    paint();
  }
  function choose(c) {
    if (lock || c < 0 || c >= K || c === g[0]) return;
    const before = new Set(patch(g));
    pour(g, c); moves++; api.sfx('pop');
    const fresh = new Set(patch(g).filter(i => !before.has(i)));
    paint(fresh);
    if (fresh.size >= 6) api.fx.text(api.stage.clientWidth / 2, api.center(grid)[1], '+' + fresh.size + ' tiles', COLS[c], 24);
    if (filled === N * N) {
      lock = true;
      const pts = 30 + level * 10 + (limit - moves) * 5;
      api.add(pts); api.sfx('win'); api.fx.text(api.stage.clientWidth / 2, api.center(grid)[1] - 30, 'Flooded! +' + pts, '#ffd23f', 30); api.fx.burst(api.stage.clientWidth / 2, api.center(grid)[1], COLS[c], 30, 300);
      api.after(1200, () => { level++; build(); });
    } else if (moves >= limit) { lock = true; api.fx.shake(6); api.after(500, () => api.end(`Out of moves on level ${level} with ${Math.floor(filled / (N * N) * 100)}% covered.`)); }
  }
  api.on(pal, 'click', e => { const b = e.target.closest('.tf-p'); if (b) { choose(+b.dataset.c); b.blur(); } });
  // tapping a tile on the board picks that tile's colour
  api.on(grid, 'pointerdown', e => { const i = [...grid.children].indexOf(e.target); if (i >= 0) choose(g[i]); });
  api.key((k, e) => { const c = +k - 1; if (k !== ' ' && c >= 0 && c < K && !e.repeat) choose(c); });
  api.probe = () => ({ N, K, g: g.slice(), moves, limit, level, lock });
  build();
} });
