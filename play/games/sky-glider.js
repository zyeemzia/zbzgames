/* Sky Glider · ZBZGames™ original. Tap to lift; glide through the gates. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let y = h() / 2, vy = 0, gates = [], t = 0, started = false, drift = 0, clock = 0, puffs = [];
  const stars = Array.from({ length: 60 }, () => [Math.random(), Math.random(), Math.random()]);
  const flap = () => { vy = -330; started = true; api.sfx('tap'); puffs.push({ x: w() * .28 - 12, y, life: .4 }); };
  api.tap(flap);
  api.key(k => { if (k === ' ' || k === 'ArrowUp' || k === 'Enter' || k === 'w') flap(); });
  const GW = 58;
  api.loop(dt => {
    const W = w(), H = h(), x = W * .28, gap = Math.max(150, H * .3);
    drift += dt * 20; clock += dt;
    if (started) { vy += 900 * dt; y += vy * dt; t -= dt; }
    else y = H / 2 + Math.sin(clock * 3.3) * 8;
    if (started && t <= 0) { gates.push({ x: W + 40, top: api.rand(60, Math.max(70, H - gap - 60)), done: false, hue: api.pick([265, 285, 245]) }); t = 1.55; }
    api.bg(ctx, W, H);
    stars.forEach(([sx, sy, s]) => {
      ctx.fillStyle = api.c.dark ? `rgba(255,255,255,${.25 + s * .5})` : `rgba(60,70,140,${.15 + s * .3})`;
      ctx.fillRect(((sx * W - drift * (.4 + s)) % W + W) % W, sy * H, 1 + s * 1.8, 1 + s * 1.8);
    });
    for (const g of gates) {
      g.x -= 170 * dt;
      const grad = ctx.createLinearGradient(g.x, 0, g.x + GW, 0);
      grad.addColorStop(0, `hsl(${g.hue},80%,62%)`); grad.addColorStop(1, `hsl(${g.hue + 20},75%,38%)`);
      ctx.fillStyle = grad;
      api.rr(ctx, g.x, -20, GW, g.top + 20, 12); ctx.fill();
      api.rr(ctx, g.x, g.top + gap, GW, H - g.top - gap + 20, 12); ctx.fill();
      ctx.fillStyle = '#56e0ff'; ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 16;
      api.rr(ctx, g.x - 5, g.top - 12, GW + 10, 12, 6); ctx.fill();
      api.rr(ctx, g.x - 5, g.top + gap, GW + 10, 12, 6); ctx.fill(); ctx.shadowBlur = 0;
      if (x + 14 > g.x && x - 14 < g.x + GW && (y - 11 < g.top || y + 11 > g.top + gap)) { api.fx.burst(x, y, '#e2b95c', 24, 240); api.fx.shake(8); api.end('Clipped a gate.'); return; }
      if (!g.done && g.x + GW < x) { g.done = true; api.add(1); api.sfx('point'); api.fx.text(x, y - 26, '+1', '#56e0ff', 20); }
    }
    gates = gates.filter(g => g.x > -90);
    if (started && (y > H - 10 || y < -40)) { api.fx.shake(8); api.end('Lost the sky.'); return; }
    puffs.forEach(p => { p.life -= dt; p.x -= 120 * dt; ctx.fillStyle = `rgba(226,185,92,${Math.max(0, p.life)})`; ctx.beginPath(); ctx.arc(p.x, p.y, 10 * (1 - p.life) + 3, 0, 7); ctx.fill(); });
    puffs = puffs.filter(p => p.life > 0);
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.max(-.5, Math.min(.9, vy / 600)));
    ctx.shadowColor = '#e2b95c'; ctx.shadowBlur = 16;
    ctx.fillStyle = '#f0cc74'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-15, -13); ctx.lineTo(-8, 0); ctx.lineTo(-15, 13); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#b8862f'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-8, 0); ctx.lineTo(-15, 13); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (!started) { ctx.fillStyle = api.c.ink2; ctx.font = '700 20px Rajdhani,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Tap to take off', W / 2, H * .75); ctx.textAlign = 'left'; }
  });
} });
