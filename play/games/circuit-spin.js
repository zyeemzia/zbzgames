/* Circuit Spin · ZBZGames™ original. Rotate the wire tiles until power from the core reaches every tile. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];           // bit 0 up, 1 right, 2 down, 3 left
  const turn = m => ((m << 1) & 15) | (m >> 3);            // a quarter turn clockwise
  let sol = [], level = 1, N = 4, cells = [], src = 0, timeLeft = 90, lock = false, cur = -1, t = 0, done = 0;
  const at = (i, d) => { const x = i % N + DX[d], y = Math.floor(i / N) + DY[d]; return x < 0 || y < 0 || x >= N || y >= N ? -1 : y * N + x; };
  function flow() {
    cells.forEach(c => { c.lit = false; });
    const todo = [src]; cells[src].lit = true;
    while (todo.length) {
      const i = todo.pop();
      for (let d = 0; d < 4; d++) {
        if (!(cells[i].m & (1 << d))) continue;
        const j = at(i, d);
        if (j >= 0 && !cells[j].lit && (cells[j].m & (1 << ((d + 2) % 4)))) { cells[j].lit = true; todo.push(j); }
      }
    }
    return cells.every(c => c.lit);
  }
  function build() {
    N = Math.min(6, 3 + Math.ceil(level / 2));
    cells = Array.from({ length: N * N }, () => ({ m: 0, a: 0, lit: false }));
    src = Math.floor(N / 2) * N + Math.floor(N / 2);
    // Grow a random tree from the core: every tile is wired in, so every board can be solved.
    const seen = new Set([src]), open = [src];
    while (open.length) {
      const k = Math.random() < .65 ? open.length - 1 : Math.floor(Math.random() * open.length), i = open[k];
      const ways = [0, 1, 2, 3].filter(d => { const j = at(i, d); return j >= 0 && !seen.has(j); });
      if (!ways.length) { open.splice(k, 1); continue; }
      const d = api.pick(ways), j = at(i, d);
      cells[i].m |= 1 << d; cells[j].m |= 1 << ((d + 2) % 4); seen.add(j); open.push(j);
    }
    sol = cells.map(c => c.m);
    let guard = 0;
    do { cells.forEach(c => { for (let r = Math.floor(Math.random() * 4); r > 0; r--) c.m = turn(c.m); }); } while (flow() && ++guard < 20);
    if (cur >= N * N) cur = -1;
  }
  function spin(i) {
    if (lock || i < 0 || i >= cells.length) return;
    const c = cells[i]; c.m = turn(c.m); c.a = -Math.PI / 2; api.sfx('tap');
    if (!flow()) return;
    lock = true; done++;
    const bonus = 10 * N + level * 5;
    api.add(bonus); api.sfx('win'); timeLeft = Math.min(120, timeLeft + 15);
    api.fx.text(w() / 2, h() / 2, 'Powered! +' + bonus, '#ffd23f', 30); api.fx.burst(w() / 2, h() / 2, '#56e0ff', 30, 300);
    api.after(1100, () => { level++; build(); lock = false; });
  }
  const geo = () => { const W = w(), H = h(), c = Math.floor(Math.min(W - 20, H - 78) / N), ox = (W - c * N) / 2, oy = 58 + (H - 58 - c * N) / 2; return { W, H, c, ox, oy }; };
  api.tap((x, y) => {
    const { c, ox, oy } = geo(), gx = Math.floor((x - ox) / c), gy = Math.floor((y - oy) / c);
    cur = -1;
    if (gx >= 0 && gy >= 0 && gx < N && gy < N) spin(gy * N + gx);
  });
  api.key(k => {
    const d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[k];
    if (d !== undefined) { if (cur < 0) cur = src; else { const j = at(cur, d); if (j >= 0) cur = j; } }
    else if ((k === ' ' || k === 'Enter') && cur >= 0) spin(cur);
  });
  build();
  api.probe = () => ({ N, level, lock, masks: cells.map(c => c.m), sol });
  api.loop(dt => {
    t += dt;
    if (!lock) timeLeft -= dt;
    if (timeLeft <= 0) { api.end(`Circuits powered: ${done}. You reached level ${level}.`); return; }
    const { W, H, c, ox, oy } = geo();
    api.bg(ctx, W, H);
    // level and clock
    ctx.fillStyle = api.c.ink2; ctx.font = '700 17px Rajdhani,sans-serif'; ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left'; ctx.fillText('Level ' + level, 14, 26);
    ctx.textAlign = 'right'; ctx.fillStyle = timeLeft < 12 ? '#ff5470' : api.c.ink2; ctx.fillText(Math.ceil(timeLeft) + 's', W - 14, 26);
    ctx.fillStyle = api.c.dark ? 'rgba(150,160,255,.16)' : 'rgba(60,70,140,.14)'; api.rr(ctx, 14, 36, W - 28, 8, 4); ctx.fill();
    ctx.fillStyle = timeLeft < 12 ? '#ff5470' : '#3ddc84'; api.rr(ctx, 14, 36, Math.max(8, (W - 28) * Math.min(1, timeLeft / 120)), 8, 4); ctx.fill();
    ctx.textAlign = 'left';
    cells.forEach((cell, i) => {
      const x = ox + (i % N) * c, y = oy + Math.floor(i / N) * c, mx = x + c / 2, my = y + c / 2;
      cell.a += (0 - cell.a) * Math.min(1, dt * 16);
      ctx.fillStyle = cell.lit ? (api.c.dark ? 'rgba(86,224,255,.1)' : 'rgba(14,165,233,.12)') : (api.c.dark ? 'rgba(150,160,255,.07)' : 'rgba(60,70,140,.07)');
      api.rr(ctx, x + 3, y + 3, c - 6, c - 6, c * .16); ctx.fill();
      if (i === cur) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; api.rr(ctx, x + 3, y + 3, c - 6, c - 6, c * .16); ctx.stroke(); }
      ctx.save(); ctx.translate(mx, my); ctx.rotate(cell.a);
      const col = cell.lit ? '#56e0ff' : (api.c.dark ? '#59608f' : '#9aa1c7');
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(4, c * .15); ctx.lineCap = 'butt';
      if (cell.lit) { ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 14; }
      let ends = 0;
      for (let d = 0; d < 4; d++) if (cell.m & (1 << d)) { ends++; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(DX[d] * c / 2, DY[d] * c / 2); ctx.stroke(); }
      if (i === src) {
        ctx.fillStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 18 + 6 * Math.sin(t * 4);
        ctx.beginPath(); ctx.arc(0, 0, c * .2, 0, 7); ctx.fill();
      } else if (ends === 1) {
        ctx.fillStyle = cell.lit ? '#fff7c2' : (api.c.dark ? '#2a3065' : '#cfd4ee'); ctx.beginPath(); ctx.arc(0, 0, c * .19, 0, 7); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
      } else { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, c * .1, 0, 7); ctx.fill(); }
      ctx.restore(); ctx.shadowBlur = 0;
    });
  });
} });
