/* Beam Bender · ZBZGames™ original. Flip the mirrors so the light beam bends its way to the target. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  // mirror 1 is "/", mirror 2 is "\"; a beam (dx,dy) leaves "/" as (-dy,-dx) and "\" as (dy,dx)
  let level = 1, N = 6, row = 0, target = 0, mir = [], sol = [], beam = [], hit = false, lock = false, timeLeft = 90, cur = -1, t = 0, done = 0;
  function trace() {
    beam = []; hit = false;
    let x = 0, y = row, dx = 1, dy = 0;
    for (let guard = 0; guard < N * N * 4; guard++) {
      if (x < 0 || y < 0 || x >= N || y >= N) break;
      const i = y * N + x; beam.push(i);
      if (i === target) { hit = true; break; }
      if (mir[i] === 1) [dx, dy] = [-dy, -dx]; else if (mir[i] === 2) [dx, dy] = [dy, dx];
      x += dx; y += dy;
    }
    return hit;
  }
  function build() {
    N = Math.min(8, 5 + Math.ceil(level / 2));
    const turns = Math.min(7, 2 + Math.ceil(level / 2));
    // Walk a real beam through the grid, dropping a mirror at each bend: that walk is the answer.
    for (let tries = 0; tries < 400; tries++) {
      mir = Array(N * N).fill(0); row = Math.floor(Math.random() * N);
      let x = 0, y = row, dx = 1, dy = 0, left = turns, ok = true, straight = 0;
      const seen = new Set();
      target = -1;
      for (let guard = 0; guard < 200; guard++) {
        if (x < 0 || y < 0 || x >= N || y >= N) { ok = false; break; }
        const i = y * N + x;
        if (mir[i]) { ok = false; break; }
        if (!left && straight >= 1 && !seen.has(i)) { target = i; break; }
        if (left && !seen.has(i) && straight >= 1 && Math.random() < .4) { mir[i] = 1 + Math.floor(Math.random() * 2); [dx, dy] = mir[i] === 1 ? [-dy, -dx] : [dy, dx]; left--; straight = 0; }
        else straight++;
        seen.add(i); x += dx; y += dy;
      }
      if (ok && target >= 0) {
        sol = mir.slice();
        // spare mirrors off the beam's path, then every mirror is flipped at random
        for (let n = 0, g = 0; n < 1 + Math.ceil(level / 2) && g < 200; g++) { const i = Math.floor(Math.random() * N * N); if (!seen.has(i) && i !== target && !mir[i]) { mir[i] = sol[i] = 1 + Math.floor(Math.random() * 2); n++; } }
        let g = 0;
        do { mir = sol.map(m => m ? 1 + Math.floor(Math.random() * 2) : 0); } while (trace() && ++g < 30);
        if (!hit) return;
      }
    }
    // never reached in practice: a straight shot with one mirror
    mir = Array(N * N).fill(0); row = 1; mir[N + 2] = 2; sol = mir.slice(); sol[N + 2] = 1; target = 2; trace();
  }
  function flip(i) {
    if (lock || !mir[i]) return;
    mir[i] = 3 - mir[i]; api.sfx('tap');
    if (!trace()) return;
    lock = true; done++;
    const pts = 20 + level * 5 + Math.ceil(timeLeft / 6);
    api.add(pts); api.sfx('win'); timeLeft = Math.min(120, timeLeft + 14);
    const g = geo(); api.fx.burst(g.ox + (target % N + .5) * g.c, g.oy + (Math.floor(target / N) + .5) * g.c, '#ffd23f', 28, 280);
    api.fx.text(w() / 2, h() / 2, 'On target! +' + pts, '#ffd23f', 30);
    api.after(1100, () => { level++; build(); lock = false; if (cur >= N * N) cur = -1; });
  }
  const geo = () => { const W = w(), H = h(), c = Math.floor(Math.min(W - 44, H - 78) / N), ox = (W - c * N) / 2 + 8, oy = 58 + (H - 58 - c * N) / 2; return { W, H, c, ox, oy }; };
  api.tap((x, y) => { const { c, ox, oy } = geo(), gx = Math.floor((x - ox) / c), gy = Math.floor((y - oy) / c); cur = -1; if (gx >= 0 && gy >= 0 && gx < N && gy < N) flip(gy * N + gx); });
  api.key(k => {
    const d = { ArrowUp: -N, ArrowDown: N, ArrowLeft: -1, ArrowRight: 1 }[k];
    if (d !== undefined) { if (cur < 0) cur = mir.findIndex(Boolean); else { const j = cur + d; if (j >= 0 && j < N * N && (Math.abs(d) !== 1 || Math.floor(j / N) === Math.floor(cur / N))) cur = j; } }
    else if ((k === ' ' || k === 'Enter') && cur >= 0) flip(cur);
  });
  api.probe = () => ({ N, level, lock, mir: mir.slice(), sol: sol.slice() });
  build();
  api.loop(dt => {
    t += dt; if (!lock) timeLeft -= dt;
    if (timeLeft <= 0) { api.end(`Targets lit: ${done}. You reached level ${level}.`); return; }
    const { W, H, c, ox, oy } = geo();
    api.bg(ctx, W, H);
    ctx.fillStyle = api.c.ink2; ctx.font = '700 17px Rajdhani,sans-serif'; ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left'; ctx.fillText('Level ' + level, 14, 26);
    ctx.textAlign = 'right'; ctx.fillStyle = timeLeft < 12 ? '#ff5470' : api.c.ink2; ctx.fillText(Math.ceil(timeLeft) + 's', W - 14, 26); ctx.textAlign = 'left';
    ctx.fillStyle = api.c.dark ? 'rgba(150,160,255,.16)' : 'rgba(60,70,140,.14)'; api.rr(ctx, 14, 36, W - 28, 8, 4); ctx.fill();
    ctx.fillStyle = timeLeft < 12 ? '#ff5470' : '#3ddc84'; api.rr(ctx, 14, 36, Math.max(8, (W - 28) * Math.min(1, timeLeft / 120)), 8, 4); ctx.fill();
    const mid = i => [ox + (i % N + .5) * c, oy + (Math.floor(i / N) + .5) * c];
    for (let i = 0; i < N * N; i++) {
      const x = ox + (i % N) * c, y = oy + Math.floor(i / N) * c;
      ctx.fillStyle = mir[i] ? (api.c.dark ? 'rgba(150,160,255,.14)' : 'rgba(60,70,140,.12)') : (api.c.dark ? 'rgba(150,160,255,.05)' : 'rgba(60,70,140,.05)');
      api.rr(ctx, x + 2, y + 2, c - 4, c - 4, c * .16); ctx.fill();
      if (i === cur) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; api.rr(ctx, x + 2, y + 2, c - 4, c - 4, c * .16); ctx.stroke(); }
    }
    // the lamp, then the beam
    const ly = oy + (row + .5) * c;
    ctx.fillStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 16; api.rr(ctx, ox - 24, ly - 11, 20, 22, 6); ctx.fill();
    ctx.strokeStyle = hit ? '#ffd23f' : '#ff5ea8'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 16; ctx.lineWidth = Math.max(3, c * .07); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(ox - 4, ly);
    beam.forEach(i => { const [bx, by] = mid(i); ctx.lineTo(bx, by); });
    if (!hit && beam.length) {   // run on to the wall the beam leaves through
      const last = beam[beam.length - 1], prev = beam.length > 1 ? beam[beam.length - 2] : -1;
      let dx = prev < 0 ? 1 : last % N - prev % N, dy = prev < 0 ? 0 : Math.floor(last / N) - Math.floor(prev / N);
      if (mir[last] === 1) [dx, dy] = [-dy, -dx]; else if (mir[last] === 2) [dx, dy] = [dy, dx];
      const [bx, by] = mid(last); ctx.lineTo(bx + dx * c * .5, by + dy * c * .5);
    }
    ctx.stroke(); ctx.shadowBlur = 0;
    // target and mirrors on top
    const [tx, ty] = mid(target), pulse = 1 + .08 * Math.sin(t * 5);
    ctx.strokeStyle = hit ? '#ffd23f' : '#3ddc84'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 16; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(tx, ty, c * .3 * pulse, 0, 7); ctx.stroke(); ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(tx, ty, c * .12, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    for (let i = 0; i < N * N; i++) if (mir[i]) {
      const [mx, my] = mid(i), s = c * .3, up = mir[i] === 1 ? -1 : 1;
      ctx.strokeStyle = api.c.dark ? '#dfe6ff' : '#2b2f6b'; ctx.lineWidth = Math.max(5, c * .12); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mx - s, my - s * up); ctx.lineTo(mx + s, my + s * up); ctx.stroke();
      ctx.strokeStyle = '#56e0ff'; ctx.lineWidth = Math.max(2, c * .04); ctx.beginPath(); ctx.moveTo(mx - s, my - s * up); ctx.lineTo(mx + s, my + s * up); ctx.stroke();
    }
  });
} });
