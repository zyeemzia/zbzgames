/* Orbit Dash · ZBZGames™ original. Tap to flip direction; collect stars, dodge spikes. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let a = 0, dir = 1, speed = 1.6, items = [], spawn = 0, trail = [];
  const flip = () => { dir = -dir; api.sfx('tap'); };
  api.tap(flip);
  api.key(k => { if (k === ' ' || k === 'ArrowLeft' || k === 'ArrowRight') flip(); });
  const R = () => Math.min(w(), h()) * .34;
  function add() {
    let at, tries = 0;
    do { at = api.rand(0, Math.PI * 2); tries++; } while (tries < 20 && Math.abs(Math.atan2(Math.sin(at - a), Math.cos(at - a))) < .9);
    items.push({ at, kind: Math.random() < .62 ? 'star' : 'spike', life: 6 });
  }
  api.loop(dt => {
    const W = w(), H = h(), cx = W / 2, cy = H / 2, r = R();
    a += dir * speed * dt; speed = Math.min(4.2, speed + dt * .03);
    spawn -= dt; if (spawn <= 0) { add(); spawn = Math.max(.45, 1.3 - speed * .18); }
    const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
    trail.push([px, py]); if (trail.length > 18) trail.shift();
    ctx.fillStyle = api.c.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(120,140,255,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    ctx.fillStyle = '#e2b95c'; ctx.beginPath(); ctx.arc(cx, cy, r * .16, 0, 7); ctx.fill();
    for (const it of items) {
      it.life -= dt;
      const x = cx + Math.cos(it.at) * r, y = cy + Math.sin(it.at) * r;
      ctx.globalAlpha = Math.min(1, it.life);
      if (it.kind === 'star') {
        ctx.fillStyle = '#56e0ff'; ctx.beginPath();
        for (let i = 0; i < 10; i++) { const rr = i % 2 ? 5 : 12, aa = i * Math.PI / 5 - Math.PI / 2; ctx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); }
        ctx.fill();
      } else { ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); ctx.moveTo(x, y - 13); ctx.lineTo(x + 11, y + 9); ctx.lineTo(x - 11, y + 9); ctx.fill(); }
      ctx.globalAlpha = 1;
      if (Math.hypot(px - x, py - y) < 20) {
        if (it.kind === 'star') { it.life = 0; api.add(1); api.sfx('point'); }
        else { api.end('Spikes end the orbit. Flip earlier!'); return; }
      }
    }
    items = items.filter(i => i.life > 0);
    trail.forEach(([x, y], i) => { ctx.fillStyle = `rgba(167,139,250,${i / trail.length * .5})`; ctx.beginPath(); ctx.arc(x, y, 4 + i / 3, 0, 7); ctx.fill(); });
    ctx.fillStyle = api.c.dark ? '#fff' : '#2b2f6b'; ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(px, py, 10, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  });
} });
