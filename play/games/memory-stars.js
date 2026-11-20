/* Memory Stars · ZBZGames™ original, for kids. Flip two cards; find every matching pair. */
ZBZ.register({ start(api) {
  const SETS = [['🐶', '🐱', '🦁', '🐸', '🐼', '🐵', '🦊', '🐰'], ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🥕', '🍍'], ['🚀', '🚗', '🚂', '🚁', '⛵', '🚲', '🛸', '🚒']];
  const icons = api.pick(SETS);
  const cards = [...icons, ...icons].sort(() => Math.random() - .5);
  let open = [], found = 0, misses = 0, lock = false;
  const t0 = performance.now();
  const board = document.createElement('div');
  board.className = 'ms-board';
  board.innerHTML = cards.map((c, i) => `<button class="ms-card" type="button" data-i="${i}" aria-label="Hidden card"><span class="ms-back">★</span><span class="ms-face">${c}</span></button>`).join('');
  api.stage.appendChild(board);
  api.on(board, 'click', e => {
    const b = e.target.closest('.ms-card');
    if (!b || lock || b.classList.contains('up')) return;
    b.classList.add('up'); b.setAttribute('aria-label', cards[b.dataset.i]); api.sfx('tap');
    open.push(b);
    if (open.length < 2) return;
    const [a, c] = open; open = [];
    if (cards[a.dataset.i] === cards[c.dataset.i]) {
      a.classList.add('done'); c.classList.add('done'); found++; api.sfx('point');
      api.score(found * 20 - misses * 2);
      if (found === icons.length) {
        const secs = Math.round((performance.now() - t0) / 1000);
        api.score(Math.max(10, found * 20 - misses * 2 + Math.max(0, 90 - secs)));
        api.after(500, () => api.end(`All pairs found in ${secs} seconds with ${misses} misses. Well done!`));
      }
    } else {
      misses++; lock = true;
      api.after(750, () => { a.classList.remove('up'); c.classList.remove('up'); a.setAttribute('aria-label', 'Hidden card'); c.setAttribute('aria-label', 'Hidden card'); lock = false; });
    }
  });
} });
