/* Fruit Catch · ZBZGames™ original, for kids. Move the basket; catch the fruit, skip the rocks. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const FRUIT = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍐', '🥭'];
  let bx = w() / 2, drops = [], spawn = .4, hearts = 3, speed = 1, t = 0, squash = 0;
  const clouds = Array.from({ length: 4 }, (_, i) => ({ x: Math.random(), y: .08 + i * .09, s: .7 + Math.random() * .6 }));
  const keys = {};
  const follow = e => { const r = api.stage.getBoundingClientRect(); bx = e.clientX - r.left; };
  api.on(api.stage, 'pointermove', follow); api.on(api.stage, 'pointerdown', follow);
  api.on(window, 'keydown', e => { keys[e.key] = true; }); api.on(window, 'keyup', e => { keys[e.key] = false; });
  api.on(window, 'blur', () => { for (const k in keys) keys[k] = false; });
  api.loop(dt => {
    const W = w(), H = h(), bw = Math.max(84, W * .18), by = H - 54;
    t += dt; squash = Math.max(0, squash - dt * 5);
    if (keys.ArrowLeft || keys.a) bx -= 480 * dt; if (keys.ArrowRight || keys.d) bx += 480 * dt;
    bx = Math.max(bw / 2, Math.min(W - bw / 2, bx));
    speed = Math.min(2.4, speed + dt * .015);
    spawn -= dt;
    if (spawn <= 0) { const rock = Math.random() < .18; drops.push({ x: api.rand(24, Math.max(25, W - 24)), y: -30, e: rock ? '' : api.pick(FRUIT), rock, vy: api.rand(120, 170) * speed, rot: api.rand(-1, 1) }); spawn = Math.max(.35, .9 / speed); }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (api.c.dark) { g.addColorStop(0, '#1b2a6b'); g.addColorStop(1, '#0f5a4a'); } else { g.addColorStop(0, '#7dd3fc'); g.addColorStop(1, '#d9f99d'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = api.c.dark ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.85)';
    clouds.forEach(c => { const cx = ((c.x * W + t * 9 * c.s) % (W + 160)) - 80, cy = c.y * H; ctx.beginPath(); ctx.arc(cx, cy, 22 * c.s, 0, 7); ctx.arc(cx + 24 * c.s, cy - 9 * c.s, 27 * c.s, 0, 7); ctx.arc(cx + 52 * c.s, cy, 21 * c.s, 0, 7); ctx.fill(); });
    ctx.fillStyle = api.c.dark ? '#166534' : '#4ade80'; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H - 20);
    for (let i = 0; i <= 8; i++) ctx.quadraticCurveTo((i - .5) * W / 8, H - 34, i * W / 8, H - 20);
    ctx.lineTo(W, H); ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const d of drops) {
      d.y += d.vy * dt;
      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot * t * 1.5);
      if (d.rock) {
        const rg = ctx.createRadialGradient(-6, -7, 2, 0, 0, 20); rg.addColorStop(0, '#b6bcc8'); rg.addColorStop(1, '#565d6b');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(-17, 4); ctx.lineTo(-11, -13); ctx.lineTo(3, -18); ctx.lineTo(16, -8); ctx.lineTo(18, 7); ctx.lineTo(7, 16); ctx.lineTo(-9, 15); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(30,34,45,.55)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(3, -1); ctx.lineTo(1, 7); ctx.stroke();
      } else { ctx.font = '36px serif'; ctx.fillText(d.e, 0, 0); }
      ctx.restore();
      if (!d.gone && d.y > by - 18 && d.y < by + 20 && Math.abs(d.x - bx) < bw / 2) {
        d.gone = true; squash = 1;
        if (d.rock) { hearts--; api.sfx('bad'); api.fx.shake(7); api.fx.burst(d.x, by, '#9ca3af', 12); if (hearts <= 0) { api.end('Too many rocks in the basket.'); return; } }
        else { api.add(1); api.sfx('point'); api.fx.burst(d.x, by - 10, '#ffd23f', 10); api.fx.text(d.x, by - 34, '+1', '#fff', 20); }
      } else if (!d.gone && !d.rock && d.y > H - 10) {
        d.gone = true; hearts--; api.sfx('bad'); api.fx.burst(d.x, H - 16, '#ff5470', 10);
        if (hearts <= 0) { api.end('Three fruits fell to the ground.'); return; }
      }
    }
    drops = drops.filter(d => !d.gone && d.y < H + 40);
    // the basket
    const sq = 1 + squash * .12, top = by - 14, bot = by + 22;
    ctx.save(); ctx.translate(bx, bot); ctx.scale(sq, 1 / sq); ctx.translate(-bx, -bot);
    const bg = ctx.createLinearGradient(0, top, 0, bot); bg.addColorStop(0, '#d97706'); bg.addColorStop(1, '#92400e');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(bx - bw / 2, top); ctx.lineTo(bx + bw / 2, top); ctx.lineTo(bx + bw / 2 - 14, bot); ctx.lineTo(bx - bw / 2 + 14, bot); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(69,26,3,.55)'; ctx.lineWidth = 2;
    for (let i = 1; i < 5; i++) { const fx = bx - bw / 2 + bw * i / 5; ctx.beginPath(); ctx.moveTo(fx, top); ctx.lineTo(bx + (fx - bx) * .8, bot); ctx.stroke(); }
    ctx.fillStyle = '#fbbf24'; api.rr(ctx, bx - bw / 2 - 4, top - 6, bw + 8, 9, 4); ctx.fill();
    ctx.restore();
    ctx.font = '22px serif'; ctx.textAlign = 'left';
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = i < hearts ? 1 : .22; ctx.fillText('❤️', 12 + i * 28, 26); }
    ctx.globalAlpha = 1;
  });
} });
