/* Sky Glider · ZBZGames™ original. Tap to lift; glide through the gates. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let y = h() / 2, vy = 0, gates = [], t = 0, started = false, drift = 0;
  const stars = Array.from({ length: 40 }, () => [Math.random(), Math.random()]);
  const flap = () => { vy = -330; started = true; api.sfx('tap'); };
  api.tap(flap);
  api.key(k => { if (k === ' ' || k === 'ArrowUp') flap(); });
  api.loop(dt => {
    const W = w(), H = h(), x = W * .28, gap = Math.max(140, H * .3);
    drift += dt * 20;
    if (started) { vy += 900 * dt; y += vy * dt; t -= dt; }
    else y = H / 2 + Math.sin(performance.now() / 300) * 8;
    if (started && t <= 0) { gates.push({ x: W + 40, top: api.rand(60, Math.max(70, H - gap - 60)), done: false }); t = 1.55; }
    ctx.fillStyle = '#060818'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    stars.forEach(([sx, sy]) => ctx.fillRect(((sx * W - drift) % W + W) % W, sy * H, 2, 2));
    for (const g of gates) {
      g.x -= 170 * dt;
      ctx.fillStyle = '#7c3aed'; ctx.fillRect(g.x, 0, 56, g.top); ctx.fillRect(g.x, g.top + gap, 56, H);
      ctx.fillStyle = '#56e0ff'; ctx.fillRect(g.x - 4, g.top - 10, 64, 10); ctx.fillRect(g.x - 4, g.top + gap, 64, 10);
      if (x + 14 > g.x && x - 14 < g.x + 56 && (y - 11 < g.top || y + 11 > g.top + gap)) { api.end('Clipped a gate.'); return; }
      if (!g.done && g.x + 56 < x) { g.done = true; api.add(1); api.sfx('point'); }
    }
    gates = gates.filter(g => g.x > -80);
    if (started && (y > H - 10 || y < -40)) { api.end('Lost the sky.'); return; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.max(-.5, Math.min(.9, vy / 600)));
    ctx.fillStyle = '#e2b95c'; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-14, -12); ctx.lineTo(-8, 0); ctx.lineTo(-14, 12); ctx.fill(); ctx.restore();
    if (!started) { ctx.fillStyle = '#cfd5f2'; ctx.font = '600 20px Rajdhani,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Tap to take off', W / 2, H * .75); ctx.textAlign = 'left'; }
  });
} });
