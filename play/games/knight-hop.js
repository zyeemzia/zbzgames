/* Knight Hop · ZBZGames™ original. Hop like a chess knight, two squares and one to the side, to reach each star in as few hops as you can. */
ZBZ.register({ start(api) {
  const N = 5, TIME = 60;
  const JUMPS = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
  let at = 12, star = 0, holes = new Set(), hops = 0, best = 0, stars = 0, timeLeft = TIME;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Stars <b class="kh-n">0</b></span><span class="g-chip">Hops <b class="kh-h">0</b> · best <b class="kh-b">0</b></span><span class="g-chip"><b class="kh-s">${TIME}</b>s</span></div><div class="qz-time"><i></i></div><div class="kh-grid">${Array.from({ length: N * N }, (_, i) => `<button type="button" class="kh-c${(i % N + Math.floor(i / N)) % 2 ? ' alt' : ''}" data-i="${i}"></button>`).join('')}</div><p class="g-sub">The dots show where the knight can land. Matching the best count scores five.</p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.kh-grid'), cells = [...grid.children], bar = wrap.querySelector('.qz-time i');
  const nEl = wrap.querySelector('.kh-n'), hEl = wrap.querySelector('.kh-h'), bEl = wrap.querySelector('.kh-b'), sEl = wrap.querySelector('.kh-s');
  const reach = i => { const x = i % N, y = Math.floor(i / N), out = []; for (const [dx, dy] of JUMPS) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < N && ny < N && !holes.has(ny * N + nx)) out.push(ny * N + nx); } return out; };
  // fewest hops from one square to every other, around the holes
  function dist(from) {
    const d = Array(N * N).fill(-1), q = [from]; d[from] = 0;
    for (let k = 0; k < q.length; k++) for (const j of reach(q[k])) if (d[j] < 0) { d[j] = d[q[k]] + 1; q.push(j); }
    return d;
  }
  function paint() {
    const can = new Set(reach(at));
    cells.forEach((c, i) => {
      c.classList.toggle('hole', holes.has(i)); c.classList.toggle('can', can.has(i));
      c.textContent = i === at ? '♞' : i === star ? '⭐' : '';
      c.classList.toggle('me', i === at);
      c.setAttribute('aria-label', i === at ? 'Knight' : i === star ? 'Star' : holes.has(i) ? 'Pit' : can.has(i) ? 'Free square, in reach' : 'Free square');
    });
    nEl.textContent = stars; hEl.textContent = hops; bEl.textContent = best;
  }
  function place() {
    // after a few stars, pits appear; the star is always somewhere the knight can still get to
    for (let tries = 0; tries < 60; tries++) {
      holes = new Set();
      const want = Math.min(5, Math.floor(stars / 3));
      while (holes.size < want) { const i = Math.floor(Math.random() * N * N); if (i !== at) holes.add(i); }
      const d = dist(at), far = d.map((v, i) => v >= 2 ? i : -1).filter(i => i >= 0);
      if (far.length) { star = api.pick(far); best = d[star]; hops = 0; return paint(); }
    }
    holes = new Set(); const d = dist(at); star = d.findIndex(v => v >= 2); best = d[star]; hops = 0; paint();
  }
  function hop(i) {
    if (!api.alive || i === at) return;
    if (!reach(at).includes(i)) { api.sfx('bad'); const c = cells[i]; c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); return; }
    at = i; hops++; api.sfx('tap');
    if (at === star) {
      const neat = hops <= best, pts = neat ? 5 : 2;
      stars++; api.add(pts); api.sfx(neat ? 'star' : 'point'); timeLeft = Math.min(TIME, timeLeft + 3);
      api.pop(cells[at], '#ffd23f', neat ? 'Best path +5' : '+2');
      star = -1; place();
    } else paint();
  }
  api.on(grid, 'click', e => { const c = e.target.closest('.kh-c'); if (c) { hop(+c.dataset.i); c.blur(); } });
  api.cursor(() => cells, () => N, i => hop(i));
  api.probe = () => ({ at, star, holes: [...holes], best, hops });
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / TIME * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`The knight collected ${stars} star${stars === 1 ? '' : 's'}.`);
  });
  place();
} });
