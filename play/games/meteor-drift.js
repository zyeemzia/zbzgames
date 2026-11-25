/* Meteor Drift · ZBZGames™ original. Steer through the meteor shower, grab crystals, and let a shield take one hit for you. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let sx = w() / 2, tx = sx, rocks = [], items = [], t = 0, spawn = 1.2, gemT = 2.5, shieldT = 12, shield = false, tick = 0, tilt = 0, crystals = 0;
  const stars = Array.from({ length: 70 }, () => [Math.random(), Math.random(), Math.random()]);
  const keys = {};
  const follow = e => { const r = api.stage.getBoundingClientRect(); tx = e.clientX - r.left; };
  api.on(api.stage, 'pointermove', follow); api.on(api.stage, 'pointerdown', follow);
  api.on(window, 'keydown', e => { keys[e.key] = true; }); api.on(window, 'keyup', e => { keys[e.key] = false; });
  api.on(window, 'blur', () => { for (const k in keys) keys[k] = false; });
  function rock(W) {
    const r = api.rand(14, Math.min(34, 20 + t));   // the shower starts with small rocks
    rocks.push({ x: api.rand(r, Math.max(r + 1, W - r)), y: -r - 10, r, vx: api.rand(-45, 45), vy: api.rand(130, 210), rot: api.rand(0, 6), vr: api.rand(-2, 2), shape: Array.from({ length: 9 }, () => api.rand(.72, 1.08)), hue: api.pick([18, 28, 350, 265]) });
  }
  api.loop(dt => {
    const W = w(), H = h(), sy = H - 78, pace = Math.min(2.6, 1 + t / 40);
    t += dt;
    if (keys.ArrowLeft || keys.a || keys.A) tx -= 560 * dt;
    if (keys.ArrowRight || keys.d || keys.D) tx += 560 * dt;
    tx = Math.max(18, Math.min(W - 18, tx));
    const before = sx; sx += (tx - sx) * Math.min(1, dt * 12); tilt += ((sx - before) / Math.max(dt, .001) / 900 - tilt) * Math.min(1, dt * 10);
    tick += dt; if (tick >= .5) { tick -= .5; api.add(1); }
    spawn -= dt; if (spawn <= 0) { rock(W); spawn = Math.max(.22, .95 - t * .012); }
    gemT -= dt; if (gemT <= 0) { items.push({ x: api.rand(24, Math.max(25, W - 24)), y: -20, kind: 'gem', vy: 150 }); gemT = api.rand(2, 4); }
    shieldT -= dt; if (shieldT <= 0) { if (!shield) items.push({ x: api.rand(24, Math.max(25, W - 24)), y: -20, kind: 'shield', vy: 130 }); shieldT = api.rand(14, 20); }
    api.bg(ctx, W, H);
    stars.forEach(([x, y, s]) => {
      ctx.fillStyle = api.c.dark ? `rgba(255,255,255,${.25 + s * .55})` : `rgba(60,70,140,${.15 + s * .3})`;
      ctx.fillRect(x * W, ((y * H + t * (30 + s * 120) * pace) % H), 1 + s * 1.6, 1 + s * 4 * pace);
    });
    for (const it of items) {
      it.y += it.vy * pace * dt;
      ctx.save(); ctx.translate(it.x, it.y);
      if (it.kind === 'gem') {
        ctx.rotate(t * 2); ctx.fillStyle = '#56e0ff'; ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(10, 0); ctx.lineTo(0, 13); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(10, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      } else {
        ctx.strokeStyle = '#3ddc84'; ctx.shadowColor = '#3ddc84'; ctx.shadowBlur = 16; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, 12 + Math.sin(t * 6) * 2, 0, 7); ctx.stroke(); ctx.fillStyle = '#3ddc84'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill();
      }
      ctx.restore(); ctx.shadowBlur = 0;
      if (Math.hypot(it.x - sx, it.y - sy) < 30) {
        it.got = true;
        if (it.kind === 'gem') { crystals++; api.add(5); api.sfx('point'); api.fx.burst(it.x, it.y, '#56e0ff', 12); api.fx.text(it.x, it.y - 20, '+5', '#56e0ff', 20); }
        else { shield = true; api.sfx('star'); api.fx.text(sx, sy - 34, 'Shield on', '#3ddc84', 20); }
      }
    }
    items = items.filter(i => !i.got && i.y < H + 30);
    for (const r of rocks) {
      r.x += r.vx * dt; r.y += r.vy * pace * dt; r.rot += r.vr * dt;
      if (r.x < r.r || r.x > W - r.r) r.vx *= -1;
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot);
      const g = ctx.createRadialGradient(-r.r * .3, -r.r * .3, r.r * .1, 0, 0, r.r);
      g.addColorStop(0, `hsl(${r.hue},45%,62%)`); g.addColorStop(1, `hsl(${r.hue},40%,28%)`);
      ctx.fillStyle = g; ctx.beginPath();
      r.shape.forEach((k, i) => { const a = i / r.shape.length * Math.PI * 2; ctx.lineTo(Math.cos(a) * r.r * k, Math.sin(a) * r.r * k); });
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.arc(r.r * .25, r.r * .15, r.r * .2, 0, 7); ctx.arc(-r.r * .3, r.r * .3, r.r * .12, 0, 7); ctx.fill();
      ctx.restore();
      if (!r.hit && Math.hypot(r.x - sx, r.y - sy) < r.r * .85 + 12) {
        r.hit = true;
        api.fx.burst(r.x, r.y, `hsl(${r.hue},45%,60%)`, 20, 240);
        if (shield) { shield = false; api.sfx('pop'); api.fx.shake(6); api.fx.text(sx, sy - 34, 'Shield gone', '#ff9f43', 20); }
        else { api.fx.burst(sx, sy, '#ff5470', 30, 300); api.fx.shake(11); api.end(`You drifted for ${Math.round(t)} seconds and took ${crystals} crystals.`); return; }
      }
    }
    rocks = rocks.filter(r => !r.hit && r.y < H + 60);
    // the ship
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.max(-.45, Math.min(.45, tilt)));
    ctx.fillStyle = `rgba(255,${150 + Math.random() * 80},60,.9)`; ctx.beginPath(); ctx.moveTo(-7, 14); ctx.lineTo(0, 26 + Math.random() * 12); ctx.lineTo(7, 14); ctx.closePath(); ctx.fill();
    const sg = ctx.createLinearGradient(0, -22, 0, 16); sg.addColorStop(0, '#ffffff'); sg.addColorStop(1, api.c.dark ? '#8ea0ff' : '#4b55c9');
    ctx.fillStyle = sg; ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(16, 14); ctx.lineTo(5, 9); ctx.lineTo(0, 16); ctx.lineTo(-5, 9); ctx.lineTo(-16, 14); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#56e0ff'; ctx.beginPath(); ctx.ellipse(0, -6, 4, 7, 0, 0, 7); ctx.fill();
    if (shield) { ctx.strokeStyle = 'rgba(61,220,132,.85)'; ctx.lineWidth = 3; ctx.shadowColor = '#3ddc84'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(0, -2, 30 + Math.sin(t * 5) * 1.5, 0, 7); ctx.stroke(); }
    ctx.restore(); ctx.shadowBlur = 0;
    ctx.fillStyle = api.c.ink2; ctx.font = '700 16px Rajdhani,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('💎 ' + crystals + (shield ? '   Shield ready' : ''), 12, 26);
  });
} });
