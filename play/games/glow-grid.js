/* Glow Grid · ZBZGames™ original. A tap flips a tile and its four neighbours. Light the whole grid before the moves run out. */
ZBZ.register({ start(api) {
  const N = 5;
  let on = [], level = 1, movesLeft = 0, lock = false;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Level <b class="gg-lv">1</b></span><span class="g-chip">Moves left <b class="gg-mv">0</b></span><span class="g-chip">Lit <b class="gg-lit">0</b>/${N * N}</span></div><div class="gg-grid">${Array.from({ length: N * N }, (_, i) => `<button type="button" class="gg-c" data-i="${i}"></button>`).join('')}</div><p class="g-sub">Each tap flips a tile and the tiles beside it.</p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.gg-grid'), cells = [...grid.children];
  const lvEl = wrap.querySelector('.gg-lv'), mvEl = wrap.querySelector('.gg-mv'), litEl = wrap.querySelector('.gg-lit');
  const near = i => [i, i - N, i + N, i % N ? i - 1 : -1, i % N < N - 1 ? i + 1 : -1].filter(j => j >= 0 && j < N * N);
  const flip = i => near(i).forEach(j => { on[j] = !on[j]; });
  function draw() {
    cells.forEach((c, i) => { c.classList.toggle('on', on[i]); c.setAttribute('aria-label', `Tile ${i + 1}, ${on[i] ? 'lit' : 'dark'}`); });
    lvEl.textContent = level; mvEl.textContent = movesLeft; litEl.textContent = on.filter(Boolean).length;
  }
  function build() {
    // Start fully lit and undo a few taps, so every puzzle has an answer within the move limit.
    const taps = Math.min(11, 2 + level);
    do {
      on = Array(N * N).fill(true);
      const picks = new Set(); while (picks.size < taps) picks.add(Math.floor(Math.random() * N * N));
      picks.forEach(flip);
    } while (on.every(Boolean));
    movesLeft = taps * 2 + 5;
    draw();
  }
  function press(i) {
    if (lock) return;
    flip(i); movesLeft--; api.sfx('tap'); draw();
    if (on.every(Boolean)) {
      lock = true;
      const pts = 20 + level * 5 + movesLeft * 2;
      api.add(pts); api.sfx('win'); api.pop(cells[12], '#ffd23f', '+' + pts);
      cells.forEach((c, k) => { if (k % 3 === 0) api.pop(c, '#ffd23f'); });
      api.after(1000, () => { level++; build(); lock = false; });
    } else if (movesLeft <= 0) { lock = true; api.fx.shake(6); api.end(`Out of moves on level ${level}.`); }
  }
  api.on(grid, 'click', e => { const c = e.target.closest('.gg-c'); if (c) { press(+c.dataset.i); c.blur(); } });
  api.cursor(() => cells, () => N, i => press(i));
  build();
} });
