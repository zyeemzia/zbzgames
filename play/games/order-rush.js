/* Order Rush · ZBZGames™ original. The numbers are scattered. Tap them in order, 1 upwards, before the clock runs out. Boards grow. */
ZBZ.register({ start(api) {
  const TIME = 60;
  let n = 3, next = 1, boards = 0, timeLeft = TIME, cells = [], lock = false;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Find <b class="or-next">1</b></span><span class="g-chip">Boards <b class="or-b">0</b></span><span class="g-chip"><b class="or-s">${TIME}</b>s</span></div><div class="qz-time"><i></i></div><div class="or-grid"></div>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.or-grid'), bar = wrap.querySelector('.qz-time i'), nextEl = wrap.querySelector('.or-next'), bEl = wrap.querySelector('.or-b'), sEl = wrap.querySelector('.or-s');
  function build() {
    n = Math.min(5, 3 + boards);
    const nums = Array.from({ length: n * n }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [nums[i], nums[j]] = [nums[j], nums[i]]; }
    next = 1; lock = false;
    grid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    grid.innerHTML = nums.map(v => `<button type="button" class="or-c" data-v="${v}" style="--hue:${(v * 37 + boards * 50) % 360}">${v}</button>`).join('');
    cells = [...grid.children]; nextEl.textContent = 1; bEl.textContent = boards;
  }
  function press(el) {
    if (lock || !el || el.classList.contains('done')) return;
    if (+el.dataset.v === next) {
      el.classList.add('done'); api.add(1); api.note(300 + next * 28, .12, .08); next++;
      if (next > n * n) {
        lock = true; boards++; api.add(10); api.sfx('win'); timeLeft = Math.min(TIME, timeLeft + 8);
        api.pop(el, '#ffd23f', 'Board clear +10');
        api.after(700, () => { build(); cur.paint(); });
      } else nextEl.textContent = next;
    } else { timeLeft -= 2; api.sfx('bad'); api.pop(el, '#ff5470', '−2s'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  }
  api.on(grid, 'pointerdown', e => { const c = e.target.closest('.or-c'); if (c) { e.preventDefault(); press(c); } });
  const cur = api.cursor(() => cells, () => n, (i, el) => press(el));
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / TIME * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`You cleared ${boards} board${boards === 1 ? '' : 's'} and were looking for ${next}.`);
  });
  build();
} });
