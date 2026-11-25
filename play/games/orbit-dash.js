/* Orbit Dash · ZBZGames™ original. Tap to flip direction; collect stars, dodge spikes. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let a = -Math.PI / 2, dir = 1, speed = 1.6, items = [], spawn = .6, trail = [], t = 0;
  const dust = Array.from({ length: 46 }, () => [Math.random(), Math.random(), Math.random()]);
  const flip = () => { dir = -dir; api.sfx('tap'); };
  api.tap(flip);
  api.key(k => { if (k === ' ' || k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Enter') flip(); });
  const R = () => Math.min(w(), h()) * .34;
  const gap = (x, y) => Math.abs(Math.atan2(Math.sin(x - y), Math.cos(x - y)));
  function add() {
    let at, tries = 0;
    // Never on top of the player, and never on top of another item.
    do { at = api.rand(0, Math.PI * 2); tries++; } while (tries < 30 && (gap(at, a) < Math.max(.9, speed * .45) || items.some(i => gap(at, i.at) < .42)));
    if (tries >= 30) return;
    items.push({ at, kind: Math.random() < .62 ? 'star' : 'spike', life: 6, age: 0 });
  }
  api.loop(dt => {
    const W = w(), H = h(), cx = W / 2, cy = H / 2, r = R();
    t += dt;
    a += dir * speed * dt; speed = Math.min(4.2, speed + dt * .03);
    spawn -= dt; if (spawn <= 0) { add(); spawn = Math.max(.45, 1.3 - speed * .18); }
    const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    trail.push([px, py]); if (trail.length > 22) trail.shift();
    api.bg(ctx, W, H);
    ctx.fillStyle = api.c.dark ? 'rgba(255,255,255,.5)' : 'rgba(60,70,140,.35)';
    dust.forEach(([x, y, s]) => { ctx.globalAlpha = .3 + .5 * Math.abs(Math.sin(t * (.5 + s) + s * 9)); ctx.fillRect(x * W, y * H, 1 + s * 1.6, 1 + s * 1.6); });
    ctx.globalAlpha = 1;
    // the orbit and its core
    ctx.strokeStyle = api.c.dark ? 'rgba(167,139,250,.35)' : 'rgba(109,40,217,.28)'; ctx.lineWidth = 2; ctx.setLineDash([3, 9]); ctx.lineDashOffset = -t * 14;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    const cr = r * (.17 + .012 * Math.sin(t * 3));
    const cg = ctx.createRadialGradient(cx - cr * .3, cy - cr * .3, cr * .1, cx, cy, cr);
    cg.addColorStop(0, '#fff3c4'); cg.addColorStop(.5, '#f0cc74'); cg.addColorStop(1, '#b8862f');
    ctx.shadowColor = '#e2b95c'; ctx.shadowBlur = 34; ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    for (const it of items) {
      it.life -= dt; it.age += dt;
      const x = cx + Math.cos(it.at) * r, y = cy + Math.sin(it.at) * r, s = Math.min(1, it.age * 5);
      ctx.globalAlpha = Math.max(0, Math.min(1, it.life));
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      if (it.kind === 'star') {
        ctx.rotate(t * 1.5); ctx.fillStyle = '#56e0ff'; ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 16; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const rr = i % 2 ? 5.5 : 13, aa = i * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); }
        ctx.fill();
      } else {
        ctx.rotate(it.at + Math.PI / 2); ctx.fillStyle = '#ff4d6d'; ctx.shadowColor = '#ff4d6d'; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(12, 10); ctx.lineTo(-12, 10); ctx.closePath(); ctx.fill();
      }
      ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      // An item only counts once it has fully appeared.
      if (it.age > .25 && Math.hypot(px - x, py - y) < 20) {
        if (it.kind === 'star') { it.life = 0; api.add(1); api.sfx('point'); api.fx.burst(x, y, '#56e0ff', 14); api.fx.text(x, y - 18, '+1', '#56e0ff', 20); }
        else { api.fx.burst(px, py, '#ff4d6d', 26, 260); api.fx.shake(9); api.end('Spikes end the orbit. Flip earlier!'); return; }
      }
    }
    items = items.filter(i => i.life > 0);
    trail.forEach(([x, y], i) => { ctx.fillStyle = `rgba(167,139,250,${i / trail.length * .5})`; ctx.beginPath(); ctx.arc(x, y, 2 + i / 3, 0, 7); ctx.fill(); });
    ctx.fillStyle = api.c.dark ? '#fff' : '#2b2f6b'; ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(px, py, 10, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  });
} });
