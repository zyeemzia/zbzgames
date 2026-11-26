/* One Line · ZBZGames™ original. Draw a single line that passes through every open square exactly once. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const TIME = 75;
  let n = 4, walls = new Set(), sol = [], path = [], level = 1, timeLeft = TIME, lock = false, drag = false, G = { ox: 0, oy: 0, c: 1 }, glow = 0;
  const near = (i, j) => (Math.abs(i - j) === 1 && Math.floor(i / n) === Math.floor(j / n)) || Math.abs(i - j) === n;
  // A random walk that visits every square once: always try the square with the fewest ways out first.
  function walk() {
    const total = n * n;
    const nb = i => { const x = i % n, o = []; if (x) o.push(i - 1); if (x < n - 1) o.push(i + 1); if (i >= n) o.push(i - n); if (i + n < total) o.push(i + n); return o; };
    for (let tries = 0; tries < 60; tries++) {
      const seen = new Uint8Array(total), p = []; let steps = 0;
      const go = i => {
        if (steps++ > 4000) return false;
        seen[i] = 1; p.push(i);
        if (p.length === total) return true;
        const opts = nb(i).filter(j => !seen[j]).map(j => [nb(j).filter(k => !seen[k]).length + Math.random(), j]).sort((a, b) => a[0] - b[0]);
        for (const o of opts) if (go(o[1])) return true;
        seen[i] = 0; p.pop(); return false;
      };
      if (go(Math.floor(Math.random() * total))) return p;
    }
    // a plain snake always works
    return Array.from({ length: total }, (_, i) => { const y = Math.floor(i / n), x = i % n; return y * n + (y % 2 ? n - 1 - x : x); });
  }
  function gen() {
    n = Math.min(7, 4 + Math.floor((level - 1) / 2));
    const cut = level < 3 ? 0 : Math.min(5, Math.floor(level / 3)), p = walk();
    sol = p.slice(0, p.length - cut); walls = new Set(p.slice(p.length - cut)); path = [sol[0]];
  }
  function solved() {
    lock = true; glow = 1;
    const pts = 10 + level * 5;
    api.add(pts); api.sfx('win'); timeLeft = Math.min(TIME, timeLeft + 12 + n);
    const head = path[path.length - 1];
    api.fx.burst(G.ox + (head % n + .5) * G.c, G.oy + (Math.floor(head / n) + .5) * G.c, '#ffd23f', 26, 240);
    api.fx.text(w() / 2, G.oy - 8, '+' + pts, '#ffd23f', 26);
    api.after(950, () => { level++; gen(); lock = false; });
  }
  function touch(i) {
    if (lock || !api.alive || i < 0 || i >= n * n || walls.has(i)) return;
    const head = path[path.length - 1];
    if (i === head) return;
    const at = path.indexOf(i);
    if (at >= 0) { path.length = at + 1; api.note(240, .1, .05); return; }          // step back along the line
    if (!near(head, i)) return;
    path.push(i); api.note(260 + path.length * 16, .12, .06);
    if (path.length === n * n - walls.size) solved();
  }
  const cellAt = e => {
    const r = api.stage.getBoundingClientRect(), x = Math.floor((e.clientX - r.left - G.ox) / G.c), y = Math.floor((e.clientY - r.top - G.oy) / G.c);
    return x < 0 || y < 0 || x >= n || y >= n ? -1 : y * n + x;
  };
  api.on(api.stage, 'pointerdown', e => { drag = true; touch(cellAt(e)); });
  api.on(api.stage, 'pointermove', e => { if (drag) touch(cellAt(e)); });
  api.on(window, 'pointerup', () => { drag = false; });
  api.key(k => {
    const head = path[path.length - 1], x = head % n;
    if (k === 'ArrowLeft' || k === 'a') { if (x) touch(head - 1); }
    else if (k === 'ArrowRight' || k === 'd') { if (x < n - 1) touch(head + 1); }
    else if (k === 'ArrowUp' || k === 'w') touch(head - n);
    else if (k === 'ArrowDown' || k === 's') touch(head + n);
    else if ((k === 'Backspace' || k === 'u' || k === 'U') && path.length > 1 && !lock) { path.pop(); api.note(240, .1, .05); }
    else if ((k === 'r' || k === 'R') && !lock) path.length = 1;
  });
  api.probe = () => ({ n, sol: sol.slice(), path: path.slice(), walls: [...walls], level, lock, geo: G });
  gen();
  api.loop(dt => {
    const W = w(), H = h(), c = Math.floor(Math.min(W - 24, H - 96) / n), ox = (W - c * n) / 2, oy = 70 + (H - 70 - c * n) / 2;
    G = { ox, oy, c };
    if (!lock) timeLeft -= dt;
    glow = Math.max(0, glow - dt * 1.2);
    api.bg(ctx, W, H);
    // heading: level, squares left, time
    ctx.font = '700 18px Rajdhani,sans-serif'; ctx.textBaseline = 'middle'; ctx.fillStyle = api.c.ink;
    ctx.textAlign = 'left'; ctx.fillText('Level ' + level, 16, 24);
    ctx.textAlign = 'right'; ctx.fillText(Math.max(0, Math.ceil(timeLeft)) + 's', W - 16, 24);
    ctx.textAlign = 'center'; ctx.fillStyle = api.c.ink2; ctx.fillText((n * n - walls.size - path.length) + ' squares left', W / 2, 24);
    ctx.fillStyle = api.c.dark ? 'rgba(255,255,255,.1)' : 'rgba(20,30,90,.1)'; api.rr(ctx, 16, 42, W - 32, 8, 4); ctx.fill();
    const k = Math.max(0, timeLeft / TIME);
    ctx.fillStyle = k > .5 ? '#3ddc84' : k > .22 ? '#ffd23f' : '#ff5470'; api.rr(ctx, 16, 42, Math.max(8, (W - 32) * k), 8, 4); ctx.fill();
    const on = new Set(path), pad = Math.max(2, c * .05);
    for (let i = 0; i < n * n; i++) {
      const x = ox + (i % n) * c + pad, y = oy + Math.floor(i / n) * c + pad;
      api.rr(ctx, x, y, c - pad * 2, c - pad * 2, c * .2);
      if (walls.has(i)) { ctx.fillStyle = api.c.dark ? 'rgba(255,84,112,.16)' : 'rgba(225,29,72,.13)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,84,112,.55)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.fillStyle = on.has(i) ? `hsla(${api.hue},85%,58%,${api.c.dark ? .3 : .24})` : (api.c.dark ? 'rgba(255,255,255,.07)' : 'rgba(20,30,90,.07)'); ctx.fill(); }
    }
    const P = i => [ox + (i % n + .5) * c, oy + (Math.floor(i / n) + .5) * c];
    // the line itself
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = `hsl(${api.hue},90%,${api.c.dark ? 66 : 52}%)`; ctx.shadowColor = `hsl(${api.hue},95%,62%)`; ctx.shadowBlur = 12 + glow * 26; ctx.lineWidth = Math.max(6, c * .24);
    ctx.beginPath(); path.forEach((i, j) => { const [x, y] = P(i); if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    if (path.length > 1) ctx.stroke();
    ctx.shadowBlur = 0;
    const [sx, sy] = P(path[0]), [hx, hy] = P(path[path.length - 1]);
    ctx.fillStyle = `hsl(${api.hue},90%,${api.c.dark ? 66 : 52}%)`; ctx.beginPath(); ctx.arc(sx, sy, c * .2, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(hx, hy, c * (.2 + .03 * Math.sin(api.time() * 6)), 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(8,10,30,.75)'; ctx.beginPath(); ctx.arc(hx, hy, c * .07, 0, 7); ctx.fill();
    if (timeLeft <= 0) api.end(`You finished ${level - 1} line${level === 2 ? '' : 's'}.`);
  });
} });
