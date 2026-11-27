/* Ten Pairs · ZBZGames™ original, for kids. Tap two numbers that make ten. New numbers drop in. How many tens can you make in a minute? */
ZBZ.register({ start(api) {
  const TIME = 60, N = 16;
  let v = [], sel = -1, timeLeft = TIME, pairs = 0, streak = 0;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap tp-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Tens <b class="tp-n">0</b></span><span class="g-chip"><b class="tp-s">${TIME}</b>s</span></div><div class="qz-time"><i></i></div><p class="g-msg" aria-live="polite">Tap two numbers that make 10</p><div class="tp-grid"></div>`;
  api.stage.appendChild(wrap);
  const gEl = wrap.querySelector('.tp-grid'), bar = wrap.querySelector('.qz-time i'), nEl = wrap.querySelector('.tp-n'), sEl = wrap.querySelector('.tp-s'), msg = wrap.querySelector('.g-msg');
  const hasPair = () => v.some((a, i) => v.some((b2, j) => i !== j && a + b2 === 10));
  const fresh = () => 1 + Math.floor(Math.random() * 9);
  v = Array.from({ length: N }, fresh);
  if (!hasPair()) v[1] = 10 - v[0];
  gEl.innerHTML = v.map((x, i) => `<button type="button" class="tp-c" data-i="${i}" style="--hue:${x * 36}">${x}</button>`).join('');
  const cells = [...gEl.children];
  const set = (i, x) => { v[i] = x; const el = cells[i]; el.textContent = x; el.style.setProperty('--hue', x * 36); el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); };
  function press(i) {
    if (timeLeft <= 0) return;
    if (sel < 0) { sel = i; cells[i].classList.add('sel'); api.note(440, .05, .04); return; }
    if (sel === i) { cells[i].classList.remove('sel'); sel = -1; return; }
    const a = sel; sel = -1; cells[a].classList.remove('sel');
    if (v[a] + v[i] === 10) {
      pairs++; streak++; const pts = 5 + (streak >= 3 ? 2 : 0);
      api.add(pts); api.sfx(streak >= 3 ? 'star' : 'point'); api.pop(cells[i], '#3ddc84', `${v[a]} + ${v[i]} = 10`);
      nEl.textContent = pairs; msg.textContent = streak >= 3 ? `${streak} in a row! Bonus +2` : 'Yes! Find another ten';
      set(a, fresh()); set(i, fresh());
      if (!hasPair()) set(i, 10 - v[(i + 1) % N]);
    } else {
      streak = 0; api.sfx('bad'); msg.textContent = `${v[a]} + ${v[i]} = ${v[a] + v[i]}. Look for 10.`;
      [a, i].forEach(k => { cells[k].classList.remove('shake'); void cells[k].offsetWidth; cells[k].classList.add('shake'); });
    }
  }
  api.on(gEl, 'pointerdown', e => { const c = e.target.closest('.tp-c'); if (c) { e.preventDefault(); press(+c.dataset.i); } });
  api.cursor(() => cells, () => 4, i => press(i));
  api.probe = () => ({ v: v.slice(), sel, pairs });
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / TIME * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`You made ${pairs} ten${pairs === 1 ? '' : 's'}. ${pairs >= 12 ? 'Super adding!' : '1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5.'}`);
  });
} });
