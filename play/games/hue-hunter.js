/* Hue Hunter · ZBZGames™ original. One tile is a slightly different colour. Find it before time runs out; it gets subtler every level. */
ZBZ.register({ start(api) {
  let level = 1, timeLeft = 40, odd = 0, n = 2;
  const wrap = document.createElement('div');
  wrap.className = 'hh-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Level <b class="hh-lv">1</b></span><span class="g-chip"><b class="hh-s">40</b>s</span></div><div class="qz-time"><i></i></div><div class="hh-grid"></div>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.hh-grid'), bar = wrap.querySelector('.qz-time i'), lvEl = wrap.querySelector('.hh-lv'), sEl = wrap.querySelector('.hh-s');
  function build() {
    n = Math.min(8, 2 + Math.floor((level + 1) / 2));
    const cells = n * n, hue = Math.floor(Math.random() * 360), sat = 65, light = 52;
    const diff = Math.max(3, 24 - level * 1.4) * (Math.random() < .5 ? 1 : -1);
    odd = Math.floor(Math.random() * cells);
    grid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    grid.style.gap = Math.max(3, 8 - n / 2) + 'px';
    grid.innerHTML = Array.from({ length: cells }, (_, i) => `<button type="button" class="hh-c" data-i="${i}" aria-label="Tile ${i + 1}" style="background:hsl(${hue},${sat}%,${i === odd ? light + diff : light}%)"></button>`).join('');
    lvEl.textContent = level;
  }
  function choose(c) {
    if (!c || c.dataset.x) return;
    if (+c.dataset.i === odd) { api.pop(c, '#ffd23f', '+' + level); api.add(level); level++; timeLeft = Math.min(40, timeLeft + 1.5); api.sfx('point'); build(); cur.paint(); }
    else { timeLeft -= 3; api.sfx('bad'); c.style.opacity = '.3'; c.dataset.x = '1'; api.pop(c, '#ff5470', '−3s'); }
  }
  api.on(grid, 'click', e => { const c = e.target.closest('.hh-c'); if (c) { choose(c); c.blur(); } });
  const cur = api.cursor(() => [...grid.children], () => n, (i, el) => choose(el));
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / 40 * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`You reached level ${level}.`);
  });
  build();
} });
