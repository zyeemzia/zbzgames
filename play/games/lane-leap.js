/* Lane Leap · ZBZGames™ original. Hop forward across lanes of sliding blocks. Rest on the calm rows, but not for long: the ground behind you is rising. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const COLS = 7, rows = [];
  let col = 3, row = 0, top = 0, bonus = 0, floor = -2, cam = -2, t = 0, vx = 3, vy = 0, hop = 0, moved = false, run = 0, runLen = 2, dead = false;
  const mod = (a, n) => ((a % n) + n) % n;
  function lane(r) {
    while (rows.length <= r) {
      const i = rows.length;
      if (i < 3 || run >= runLen) { rows.push({ safe: true, star: i > 3 && Math.random() < .55 ? Math.floor(Math.random() * COLS) : -1 }); run = 0; runLen = 1 + Math.floor(Math.random() * Math.min(4, 2 + i / 30)); }
      else {
        run++;
        const bw = api.pick([1, 1, 2, 2, 3]);
        rows.push({ safe: false, dir: i % 2 ? 1 : -1, speed: api.rand(1.1, 1.9) + Math.min(1.7, i * .018), bw, P: bw + Math.max(2.3, api.rand(2.8, 4.2) - i * .008), off: api.rand(0, 8), hue: (api.hue + 140 + i * 47) % 360 });
      }
    }
    return rows[r];
  }
  // is the square (r, c) under a block at time tt?
  const hit = (r, c, tt) => { const L = lane(r); return !L.safe && mod(c + .8 - (L.off + L.dir * L.speed * tt), L.P) < L.bw + .6; };
  function safeFor(r, c, ahead) { if (c < 0 || c >= COLS) return false; for (let a = 0; a <= ahead; a += .04) if (hit(r, c, t + a)) return false; return true; }
  function go(dx, dy) {
    if (dead) return;
    if (dx && (col + dx < 0 || col + dx >= COLS)) return;
    col += dx; row += dy; moved = true; hop = 1;
    api.note(dy ? 440 + (row % 5) * 40 : 330, .07, .05);
    if (row > top) { top = row; }
    const L = lane(row);
    if (L.safe && L.star === col) { L.star = -1; bonus += 3; api.sfx('star'); api.fx.text(w() / 2, h() * .4, '+3', '#ffd23f', 24); }
    api.score(top + bonus);
  }
  api.tap(x => { const W = w(); if (x < W * .3) go(-1, 0); else if (x > W * .7) go(1, 0); else go(0, 1); });
  api.key((k, e) => {
    if (e.repeat) return;
    if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') go(0, 1); else if (k === 'ArrowLeft' || k === 'a' || k === 'A') go(-1, 0); else if (k === 'ArrowRight' || k === 'd' || k === 'D') go(1, 0);
  });
  api.probe = () => ({ col, row, t, floor, safeFor });
  function over(text) { if (dead) return; dead = true; api.fx.shake(9); api.fx.burst(w() / 2, h() / 2, '#ff5470', 20); api.end(text); }
  api.loop(dt => {
    const W = w(), H = h(), c = Math.min(W / COLS, 62, H / 9), ox = (W - c * COLS) / 2;
    t += dt; hop = Math.max(0, hop - dt * 7);
    if (moved) floor += Math.min(1.15, .55 + top * .006) * dt;
    floor = Math.max(floor, row - 7);
    const camT = Math.max(row - 2, floor);
    cam += (camT - cam) * Math.min(1, dt * 9); vx += (col - vx) * Math.min(1, dt * 18); vy += (row - vy) * Math.min(1, dt * 18);
    const yOf = r => H - c * 1.7 - (r - cam) * c;
    api.bg(ctx, W, H);
    const first = Math.max(0, Math.floor(cam - 2)), last = Math.ceil(cam + H / c);
    for (let r = first; r <= last; r++) {
      const L = lane(r), y = yOf(r);
      ctx.fillStyle = L.safe ? (api.c.dark ? 'rgba(61,220,132,.13)' : 'rgba(22,163,74,.14)') : (api.c.dark ? 'rgba(255,255,255,.035)' : 'rgba(20,24,70,.05)');
      api.rr(ctx, ox, y + 2, c * COLS, c - 4, 10); ctx.fill();
      if (L.safe && L.star >= 0) {
        const sx = ox + (L.star + .5) * c, sy = y + c / 2 + Math.sin(t * 4 + r) * 2;
        ctx.fillStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 10; ctx.beginPath();
        for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, rr = (j % 2 ? .13 : .28) * c; ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      }
      if (L.safe) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(ox, y, c * COLS, c); ctx.clip();
      for (let s = mod(L.off + L.dir * L.speed * t, L.P) - L.P; s < COLS; s += L.P) {
        const g = ctx.createLinearGradient(0, y, 0, y + c); g.addColorStop(0, `hsl(${L.hue},90%,68%)`); g.addColorStop(1, `hsl(${L.hue},80%,46%)`);
        ctx.fillStyle = g; ctx.shadowColor = `hsl(${L.hue},95%,60%)`; ctx.shadowBlur = 10; api.rr(ctx, ox + s * c + 3, y + c * .16, L.bw * c - 6, c * .68, c * .2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,.75)'; const fx = L.dir > 0 ? ox + (s + L.bw) * c - c * .2 : ox + s * c + c * .2; ctx.beginPath(); ctx.arc(fx, y + c * .34, c * .06, 0, 7); ctx.arc(fx, y + c * .66, c * .06, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    // the rising ground
    const fy = yOf(floor - .2) + c;
    if (fy < H + 4) { const g = ctx.createLinearGradient(0, fy - c * .6, 0, H); g.addColorStop(0, 'rgba(255,84,112,0)'); g.addColorStop(.5, 'rgba(255,84,112,.5)'); g.addColorStop(1, 'rgba(255,84,112,.75)'); ctx.fillStyle = g; ctx.fillRect(0, fy - c * .6, W, H - fy + c * .6); }
    // the leaper
    const px = ox + (vx + .5) * c, py = yOf(vy) + c / 2 - Math.sin(hop * Math.PI) * c * .22, s = c * .34;
    const g = ctx.createRadialGradient(px - s * .3, py - s * .4, 1, px, py, s * 1.2); g.addColorStop(0, `hsl(${api.hue},95%,84%)`); g.addColorStop(1, `hsl(${api.hue},85%,52%)`);
    ctx.fillStyle = g; ctx.shadowColor = `hsl(${api.hue},95%,60%)`; ctx.shadowBlur = 14; api.rr(ctx, px - s, py - s, s * 2, s * 2, s * .6); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - s * .4, py - s * .25, s * .26, 0, 7); ctx.arc(px + s * .4, py - s * .25, s * .26, 0, 7); ctx.fill();
    ctx.fillStyle = '#12163a'; ctx.beginPath(); ctx.arc(px - s * .4, py - s * .36, s * .12, 0, 7); ctx.arc(px + s * .4, py - s * .36, s * .12, 0, 7); ctx.fill();
    if (!moved) { ctx.fillStyle = api.c.ink; ctx.font = '700 18px Rajdhani,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Tap the middle to hop, the sides to step', W / 2, Math.max(24, yOf(5) + c / 2)); }
    if (hit(row, col, t)) over(`A block caught you on lane ${row}.`);
    else if (row < camT - 1.2) over(`The ground caught up with you at lane ${top}.`);
  });
} });
