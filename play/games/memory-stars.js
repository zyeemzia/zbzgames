/* Memory Stars · ZBZGames™ original, for kids. Flip two cards; find every matching pair. */
ZBZ.register({ start(api) {
  const SETS = [['🐶', '🐱', '🦁', '🐸', '🐼', '🐵', '🦊', '🐰'], ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🥕', '🍍'], ['🚀', '🚗', '🚂', '🚁', '⛵', '🚲', '🛸', '🚒']];
  const icons = api.pick(SETS);
  const cards = [...icons, ...icons];
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
  let open = [], found = 0, misses = 0, lock = false;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap'; wrap.style.width = 'min(94%, 460px, 66vh)';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Pairs <b class="ms-found">0</b>/${icons.length}</span><span class="g-chip">Misses <b class="ms-miss">0</b></span></div><div class="ms-board" style="width:100%">${cards.map((c, i) => `<button class="ms-card" type="button" data-i="${i}" aria-label="Hidden card"><span class="ms-back">★</span><span class="ms-face">${c}</span></button>`).join('')}</div>`;
  api.stage.appendChild(wrap);
  const board = wrap.querySelector('.ms-board'), foundEl = wrap.querySelector('.ms-found'), missEl = wrap.querySelector('.ms-miss');
  function flip(b) {
    if (!b || lock || b.classList.contains('up')) return;
    b.classList.add('up'); b.setAttribute('aria-label', cards[b.dataset.i]); api.sfx('tap');
    open.push(b);
    if (open.length < 2) return;
    const [a, c] = open; open = [];
    if (cards[a.dataset.i] === cards[c.dataset.i]) {
      a.classList.add('done'); c.classList.add('done'); found++; api.sfx('point'); foundEl.textContent = found;
      api.pop(a, '#3ddc84'); api.pop(c, '#3ddc84');
      api.score(found * 20 - misses * 2);
      if (found === icons.length) {
        const secs = Math.round(api.time());
        api.score(Math.max(10, found * 20 - misses * 2 + Math.max(0, 90 - secs)));
        api.after(600, () => api.end(`All pairs found in ${secs} seconds with ${misses} misses. Well done!`));
      }
    } else {
      misses++; lock = true; missEl.textContent = misses;
      api.after(750, () => { a.classList.remove('up'); c.classList.remove('up'); a.setAttribute('aria-label', 'Hidden card'); c.setAttribute('aria-label', 'Hidden card'); lock = false; });
    }
  }
  api.on(board, 'click', e => flip(e.target.closest('.ms-card')));
  api.cursor(() => [...board.children], () => 4, (i, el) => flip(el));
} });
