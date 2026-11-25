/* Sum Trail · ZBZGames™ original. Link neighbouring numbers into a trail that adds up to the target. Longer trails score more. */
ZBZ.register({ start(api) {
  const N = 5, TIME = 75;
  let nums = [], sel = [], target = 0, timeLeft = TIME, made = 0, dragging = false;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap';
  wrap.innerHTML = `<div class="st-target"><small>Make</small><span class="st-t">0</span></div><div class="g-bar"><span class="g-chip">Trail <b class="st-sum">0</b></span><span class="g-chip">Trails <b class="st-n">0</b></span><span class="g-chip"><b class="st-s">${TIME}</b>s</span></div><div class="qz-time"><i></i></div><div class="st-grid">${Array.from({ length: N * N }, (_, i) => `<button type="button" class="st-c" data-i="${i}"></button>`).join('')}</div><p class="g-sub">Drag or tap neighbours, diagonals too.</p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.st-grid'), cells = [...grid.children], bar = wrap.querySelector('.qz-time i');
  const tEl = wrap.querySelector('.st-t'), sumEl = wrap.querySelector('.st-sum'), nEl = wrap.querySelector('.st-n'), sEl = wrap.querySelector('.st-s');
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const adj = (a, b) => a !== b && Math.abs(a % N - b % N) <= 1 && Math.abs(Math.floor(a / N) - Math.floor(b / N)) <= 1;
  const total = () => sel.reduce((s, i) => s + nums[i], 0);
  function paint() {
    cells.forEach((c, i) => { c.textContent = nums[i]; c.classList.toggle('sel', sel.includes(i)); });
    sumEl.textContent = total(); nEl.textContent = made;
  }
  // The target is the sum of a real trail on the board, so it can always be made.
  function newTarget() {
    const want = Math.min(5, 2 + Math.floor(Math.random() * (2 + Math.min(3, made / 3))));
    let path = [];
    for (let tries = 0; tries < 40; tries++) {
      path = [ri(0, N * N - 1)];
      while (path.length < want) {
        const last = path[path.length - 1], next = [];
        for (let j = 0; j < N * N; j++) if (adj(last, j) && !path.includes(j)) next.push(j);
        if (!next.length) break;
        path.push(api.pick(next));
      }
      if (path.length >= 2) break;
    }
    const sum = path.reduce((s, i) => s + nums[i], 0);
    if (sum === target && made) return newTarget();
    target = sum; tEl.textContent = target;
    tEl.style.animation = 'none'; void tEl.offsetWidth; tEl.style.animation = 'pop .25s ease-out';
  }
  function choose(i, byDrag) {
    if (!api.alive) return;
    const last = sel[sel.length - 1];
    if (sel.includes(i)) {
      if (byDrag) { if (sel.length > 1 && i === sel[sel.length - 2]) sel.pop(); else return; }   // drag back to shorten
      else if (i === last) sel.pop(); else sel = [i];
    } else if (sel.length && !adj(last, i)) { if (byDrag) return; sel = [i]; }
    else sel.push(i);
    api.note(330 + sel.length * 60, .14, .07);
    const sum = total();
    if (sum === target) {
      const pts = sel.length * sel.length; made++;
      api.add(pts); api.sfx('point'); timeLeft = Math.min(TIME, timeLeft + 2);
      api.pop(cells[i], '#a78bfa', '+' + pts);
      sel.forEach(k => { nums[k] = ri(1, 9); const c = cells[k]; c.classList.remove('new'); void c.offsetWidth; c.classList.add('new'); });
      sel = []; dragging = false; paint(); newTarget();
    } else if (sum > target) {
      api.sfx('bad'); timeLeft -= 2; sel = []; dragging = false;
      grid.classList.remove('shake'); void grid.offsetWidth; grid.classList.add('shake');
      paint();
    } else paint();
  }
  api.on(grid, 'pointerdown', e => {
    const c = e.target.closest('.st-c'); if (!c) return;
    e.preventDefault(); dragging = true; choose(+c.dataset.i, false);
  });
  api.on(window, 'pointermove', e => {
    if (!dragging) return;
    const el = document.elementFromPoint(e.clientX, e.clientY), c = el && el.closest ? el.closest('.st-c') : null;
    if (!c || !grid.contains(c)) return;
    // Only the middle of a tile counts, so a diagonal drag does not catch the corners it passes.
    const r = c.getBoundingClientRect();
    if (Math.hypot(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2) > r.width * .38) return;
    const i = +c.dataset.i;
    if (i !== sel[sel.length - 1]) choose(i, true);
  });
  api.on(window, 'pointerup', () => { dragging = false; });
  api.on(window, 'pointercancel', () => { dragging = false; });
  api.cursor(() => cells, () => N, i => choose(i, false));
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / TIME * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`You made ${made} trails.`);
  });
  nums = Array.from({ length: N * N }, () => ri(1, 9));
  paint(); newTarget();
} });
