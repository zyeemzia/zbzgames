/* Mind Tiles · ZBZGames™ original. Some tiles flash, then hide. Tap every tile that lit up. Three slips end the run. */
ZBZ.register({ start(api) {
  let level = 1, lives = 3, n = 3, target = new Set(), found = 0, phase = 'show', cells = [];
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Level <b class="mt-lv">1</b></span><span class="g-chip mt-lives" aria-label="Lives"></span></div><p class="g-msg" aria-live="polite"></p><div class="mt-grid"></div>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.mt-grid'), msg = wrap.querySelector('.g-msg'), lvEl = wrap.querySelector('.mt-lv'), livesEl = wrap.querySelector('.mt-lives');
  const hearts = () => { livesEl.textContent = '❤️'.repeat(lives) + '🤍'.repeat(3 - lives); livesEl.setAttribute('aria-label', lives + ' lives'); };
  function build() {
    n = Math.min(6, 3 + Math.floor(level / 3));
    const count = Math.min(Math.floor(n * n * .45), 2 + level);
    target = new Set(); while (target.size < count) target.add(Math.floor(Math.random() * n * n));
    found = 0; phase = 'show';
    grid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    grid.innerHTML = Array.from({ length: n * n }, (_, i) => `<button type="button" class="mt-c${target.has(i) ? ' show' : ''}" data-i="${i}" aria-label="Tile ${i + 1}"></button>`).join('');
    cells = [...grid.children];
    lvEl.textContent = level; hearts(); msg.textContent = `Remember ${count} tiles…`;
    api.after(850 + count * 130, () => { cells.forEach(c => c.classList.remove('show')); phase = 'play'; msg.textContent = 'Now tap them!'; cur.paint(); });
  }
  function press(i) {
    const el = cells[i];
    if (phase !== 'play' || !el || el.dataset.d) return;
    el.dataset.d = '1';
    if (target.has(i)) {
      el.classList.add('hit'); found++; api.add(level); api.sfx('point');
      if (found === target.size) {
        phase = 'wait'; msg.textContent = 'Perfect memory!'; api.sfx('star');
        cells.forEach((c, k) => { if (target.has(k)) api.pop(c, '#56e0ff'); });
        api.after(800, () => { level++; build(); });
      }
    } else {
      el.classList.add('miss'); lives--; hearts(); api.sfx('bad');
      if (lives <= 0) {
        phase = 'over'; msg.textContent = 'Here is what you missed.';
        cells.forEach((c, k) => { if (target.has(k)) c.classList.add('show'); });
        api.after(1300, () => api.end(`You reached level ${level}.`));
      }
    }
  }
  api.on(grid, 'click', e => { const c = e.target.closest('.mt-c'); if (c) { press(+c.dataset.i); c.blur(); } });
  const cur = api.cursor(() => cells, () => n, i => press(i));
  build();
} });
