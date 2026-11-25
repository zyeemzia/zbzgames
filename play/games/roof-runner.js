/* Roof Runner · ZBZGames™ original. Run the rooftops: jump the gaps, jump again in mid-air, and grab the stars. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const G = 1900, SIZE = 26;
  let roofs = [], stars = [], v = 250, y = 0, vy = 0, jumps = 0, grounded = true, t = 0, squash = 0, on = null, trail = [];
  const far = Array.from({ length: 14 }, (_, i) => ({ x: i * 90 + Math.random() * 40, w: 50 + Math.random() * 50, h: .2 + Math.random() * .35 }));
  const px = () => w() * .25;
  function addRoof() {
    const H = h(), last = roofs[roofs.length - 1];
    // A gap is always within one jump at the current pace; the second jump is a spare.
    const gap = api.rand(55, Math.min(40 + v * .3, 230));
    const top = Math.max(H * .42, Math.min(H * .8, last.y + api.rand(-50, 60)));
    const r = { x: last.x + last.w + gap, w: api.rand(150, 300), y: top, hue: api.pick([255, 275, 215, 300]), seen: false };
    roofs.push(r);
    if (Math.random() < .45) stars.push({ x: r.x + r.w * api.rand(.3, .7), y: r.y - api.rand(70, 120) });
  }
  roofs.push({ x: -40, w: w() * .8 + 200, y: h() * .66, hue: 255, seen: true });
  on = roofs[0]; y = on.y;
  for (let i = 0; i < 6; i++) addRoof();
  function jump() {
    if (!api.alive || jumps >= 2) return;
    vy = jumps ? -560 : -650; jumps++; grounded = false; on = null; api.sfx('tap');
    api.fx.burst(px(), y, '#a78bfa', 6, 90);
  }
  api.tap(jump);
  api.key((k, e) => { if ((k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W' || k === 'Enter') && !e.repeat) jump(); });
  api.probe = () => { const X = px(), cur = roofs.find(r => X + 10 > r.x && X - 10 < r.x + r.w); const nx = roofs.find(r => r.x > X); return { grounded, jumps, vy, y, edge: on ? on.x + on.w - X : 0, below: !!cur && cur.y >= y - 1, nextTop: nx ? nx.y : 0 }; };
  api.loop(dt => {
    const W = w(), H = h(), X = px();
    t += dt; v = Math.min(560, v + dt * 7); squash = Math.max(0, squash - dt * 6);
    const dx = v * dt;
    roofs.forEach(r => { r.x -= dx; }); stars.forEach(s => { s.x -= dx; });
    if (grounded) {
      if (!on || X - 10 > on.x + on.w) { grounded = false; on = null; jumps = Math.max(jumps, 1); }   // ran off the edge: one air jump left
    }
    if (!grounded) {
      const before = y; vy += G * dt; y += vy * dt;
      if (vy >= 0) {
        const r = roofs.find(q => X + 10 > q.x && X - 10 < q.x + q.w && before <= q.y + 1 && y >= q.y);
        if (r) {
          y = r.y; vy = 0; grounded = true; jumps = 0; on = r; squash = 1;
          if (!r.seen) { r.seen = true; api.add(1); api.sfx('point'); }
        }
      }
      if (y > H + 80) { api.fx.shake(8); api.end('Missed the roof. Jump a little later next time.'); return; }
    }
    while (roofs[roofs.length - 1].x < W + 300) addRoof();
    roofs = roofs.filter(r => r.x + r.w > -60); stars = stars.filter(s => s.x > -30 && !s.got);
    // night sky, far skyline, roofs
    api.bg(ctx, W, H);
    ctx.fillStyle = api.c.dark ? 'rgba(120,130,220,.13)' : 'rgba(60,70,140,.1)';
    far.forEach(b => { const bx = ((b.x - t * v * .12) % (W + 160) + W + 160) % (W + 160) - 80; ctx.fillRect(bx, H - H * b.h, b.w, H * b.h); });
    for (const r of roofs) {
      const g = ctx.createLinearGradient(0, r.y, 0, H);
      g.addColorStop(0, `hsl(${r.hue},55%,${api.c.dark ? 34 : 52}%)`); g.addColorStop(1, `hsl(${r.hue},50%,${api.c.dark ? 14 : 34}%)`);
      ctx.fillStyle = g; api.rr(ctx, r.x, r.y, r.w, H - r.y + 20, 8); ctx.fill();
      ctx.fillStyle = '#56e0ff'; ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 10; ctx.fillRect(r.x, r.y, r.w, 4); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,220,120,.5)';
      for (let wx = r.x + 16; wx < r.x + r.w - 22; wx += 30) for (let wy = r.y + 22; wy < H - 10; wy += 34) if ((Math.round(wx - r.x) * 7 + Math.round(wy - r.y) * 3 + Math.round(r.w)) % 5 < 3) ctx.fillRect(wx, wy, 12, 16);
    }
    for (const s of stars) {
      ctx.save(); ctx.translate(s.x, s.y + Math.sin(t * 4 + s.x * .01) * 4); ctx.rotate(t);
      ctx.fillStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 14; ctx.beginPath();
      for (let i = 0; i < 10; i++) { const rr = i % 2 ? 5 : 12, aa = i * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); }
      ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
      if (Math.hypot(s.x - X, s.y - (y - SIZE / 2)) < 30) { s.got = true; api.add(3); api.sfx('star'); api.fx.burst(s.x, s.y, '#ffd23f', 12); api.fx.text(s.x, s.y - 18, '+3', '#ffd23f', 20); }
    }
    // the runner
    trail.push([X, y - SIZE / 2]); if (trail.length > 9) trail.shift();
    trail.forEach(([tx, ty], i) => { ctx.fillStyle = `rgba(167,139,250,${i / trail.length * .3})`; api.rr(ctx, tx - SIZE / 2 - (trail.length - i) * 5, ty - SIZE / 2, SIZE, SIZE, 7); ctx.fill(); });
    const sq = 1 + squash * .22;
    ctx.save(); ctx.translate(X, y); ctx.scale(sq, 1 / sq); if (!grounded) ctx.rotate(Math.max(-.35, Math.min(.5, vy / 1600)));
    ctx.fillStyle = api.c.dark ? '#ffffff' : '#2b2f6b'; ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 18; api.rr(ctx, -SIZE / 2, -SIZE, SIZE, SIZE, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = api.c.dark ? '#0b0e24' : '#fff'; ctx.beginPath(); ctx.arc(5, -SIZE * .62, 3.2, 0, 7); ctx.fill();
    if (grounded) { const leg = Math.sin(t * v * .06) * 5; ctx.strokeStyle = api.c.dark ? '#fff' : '#2b2f6b'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-5 + leg, 5); ctx.moveTo(5, 0); ctx.lineTo(5 - leg, 5); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = api.c.ink2; ctx.font = '700 16px Rajdhani,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(Math.round(t * v / 60) + ' m' + (jumps === 1 && !grounded ? '   one jump left' : ''), 12, 26);
  });
} });
