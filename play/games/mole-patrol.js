/* Mole Patrol · ZBZGames™ original, for kids. Tap the moles as they pop up; leave the bunnies alone. */
ZBZ.register({ start(api) {
  let timeLeft = 45, upFor = 1100, hits = 0;
  const wrap = document.createElement('div');
  wrap.className = 'mp-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Moles <b class="mp-n">0</b></span><span class="g-chip"><b class="mp-s">45</b>s</span></div><div class="qz-time"><i></i></div><div class="mp-grid">${Array.from({ length: 9 }, (_, i) => `<button class="mp-hole" type="button" data-i="${i}" aria-label="Hole ${i + 1}"><span></span></button>`).join('')}</div>`;
  api.stage.appendChild(wrap);
  const holes = [...wrap.querySelectorAll('.mp-hole')], bar = wrap.querySelector('.qz-time i'), nEl = wrap.querySelector('.mp-n'), sEl = wrap.querySelector('.mp-s');
  const state = holes.map(() => null), stamp = holes.map(() => 0);
  function pop() {
    const free = state.map((s, i) => s ? -1 : i).filter(i => i >= 0);
    if (!free.length) return;
    const i = api.pick(free), bunny = Math.random() < .2, id = ++stamp[i];
    state[i] = bunny ? 'bunny' : 'mole';
    holes[i].classList.add('up'); holes[i].firstChild.textContent = bunny ? '🐰' : '🐹';
    holes[i].setAttribute('aria-label', bunny ? 'Bunny, do not tap' : 'Mole, tap it');
    // Hide only the visitor this timer belongs to, never a later one in the same hole.
    api.after(upFor, () => { if (stamp[i] === id && state[i] !== 'hit') hide(i); });
  }
  function hide(i) { state[i] = null; holes[i].classList.remove('up', 'hit'); holes[i].setAttribute('aria-label', 'Hole ' + (i + 1)); }
  function whack(i) {
    const hole = holes[i], s = state[i];
    if (s !== 'mole' && s !== 'bunny') return;
    const id = stamp[i];
    hole.classList.add('hit'); state[i] = 'hit';
    api.after(200, () => { if (stamp[i] === id) hide(i); });
    if (s === 'mole') { hits++; nEl.textContent = hits; api.add(1); api.sfx('pop'); api.pop(hole, '#ffd23f', '+1'); upFor = Math.max(520, upFor - 12); }
    else { api.add(-2); api.sfx('bad'); api.pop(hole, '#ff5470', '−2'); }
  }
  api.on(wrap, 'pointerdown', e => { const hole = e.target.closest('.mp-hole'); if (hole) { e.preventDefault(); whack(+hole.dataset.i); } });
  api.key(k => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < 9) whack(i); });
  api.every(520, () => { pop(); if (Math.random() < Math.min(.5, (45 - timeLeft) / 60)) pop(); });
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / 45 * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`Time is up. ${hits} moles sent home. Nice patrol!`);
  });
} });
