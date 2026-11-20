/* Hue Hunter · ZBZGames™ original. One tile is a slightly different colour. Find it before time runs out; it gets subtler every level. */
ZBZ.register({ start(api) {
  let level = 1, timeLeft = 40;
  const wrap = document.createElement('div');
  wrap.className = 'hh-wrap';
  wrap.innerHTML = `<div class="qz-time"><i></i></div><div class="hh-grid"></div>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.hh-grid'), bar = wrap.querySelector('.qz-time i');
  let odd = 0;
  function build() {
    const n = Math.min(8, 2 + Math.floor((level + 1) / 2)), cells = n * n;
    const hue = Math.floor(Math.random() * 360), sat = 65, light = 55;
    const diff = Math.max(3, 24 - level * 1.4);
    odd = Math.floor(Math.random() * cells);
    grid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    grid.innerHTML = Array.from({ length: cells }, (_, i) => `<button type="button" class="hh-c" data-i="${i}" aria-label="Tile ${i + 1}" style="background:hsl(${hue},${sat}%,${i === odd ? light + diff : light}%)"></button>`).join('');
  }
  api.on(grid, 'click', e => {
    const c = e.target.closest('.hh-c'); if (!c) return;
    if (+c.dataset.i === odd) { api.add(level); level++; timeLeft = Math.min(40, timeLeft + 1.5); api.sfx('point'); build(); }
    else { timeLeft -= 3; api.sfx('bad'); c.style.opacity = '.35'; }
  });
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / 40 * 100) + '%';
    if (timeLeft <= 0) api.end(`You reached level ${level}.`);
  });
  build();
} });
