/* Mole Patrol · ZBZGames™ original, for kids. Tap the moles as they pop up; leave the bunnies alone. */
ZBZ.register({ start(api) {
  let timeLeft = 45, upFor = 1100;
  const wrap = document.createElement('div');
  wrap.className = 'mp-wrap';
  wrap.innerHTML = `<div class="qz-time"><i></i></div><div class="mp-grid">${Array.from({ length: 9 }, (_, i) => `<button class="mp-hole" type="button" data-i="${i}" aria-label="Hole ${i + 1}"><span></span></button>`).join('')}</div>`;
  api.stage.appendChild(wrap);
  const holes = [...wrap.querySelectorAll('.mp-hole')], bar = wrap.querySelector('.qz-time i');
  const state = holes.map(() => null);
  function pop() {
    const free = state.map((s, i) => s ? -1 : i).filter(i => i >= 0);
    if (!free.length) return;
    const i = api.pick(free), bunny = Math.random() < .2;
    state[i] = bunny ? 'bunny' : 'mole';
    holes[i].classList.add('up'); holes[i].firstChild.textContent = bunny ? '🐰' : '🐹';
    holes[i].setAttribute('aria-label', bunny ? 'Bunny, do not tap' : 'Mole, tap it');
    const mine = state[i];
    api.after(upFor, () => { if (state[i] === mine) hide(i); });
  }
  function hide(i) { state[i] = null; holes[i].classList.remove('up', 'hit'); holes[i].setAttribute('aria-label', 'Hole ' + (i + 1)); }
  api.on(wrap, 'pointerdown', e => {
    const h = e.target.closest('.mp-hole'); if (!h) return;
    const i = +h.dataset.i;
    if (state[i] === 'mole') { api.add(1); api.sfx('point'); h.classList.add('hit'); state[i] = 'hit'; api.after(180, () => hide(i)); upFor = Math.max(520, upFor - 12); }
    else if (state[i] === 'bunny') { api.add(-2); api.sfx('bad'); h.classList.add('hit'); state[i] = 'hit'; api.after(180, () => hide(i)); }
  });
  api.every(520, () => { pop(); if (Math.random() < Math.min(.5, (45 - timeLeft) / 60)) pop(); });
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / 45 * 100) + '%';
    if (timeLeft <= 0) api.end('Time is up. Nice patrol!');
  });
} });
