/* Cloud Hopper · ZBZGames™ original. Bounce from cloud to cloud and climb as high as you can. Miss a cloud and you fall. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const GRAV = 1500, JUMP = 650, SPRING = 990;
  let x = w() / 2, y = -30, vy = -JUMP, tx = x, cam = -h() + 90, top = 0, best = 0, bonus = 0, plats = [], face = 1, squash = 0, t = 0;
  const keys = {};
  const follow = e => { const r = api.stage.getBoundingClientRect(); tx = e.clientX - r.left; };
  api.on(api.stage, 'pointermove', follow); api.on(api.stage, 'pointerdown', follow);
  api.on(window, 'keydown', e => { keys[e.key] = true; }); api.on(window, 'keyup', e => { keys[e.key] = false; });
  api.on(window, 'blur', () => { for (const k in keys) keys[k] = false; });
  plats.push({ x: w() / 2, y: 0, w: 120, kind: 'plain', dx: 0 });
  function grow(W) {
    while (top > cam - 140) {
      const high = -top / 20, gap = api.rand(58, Math.min(112, 74 + high * .12));
      top -= gap;
      const pw = Math.max(54, 92 - high * .09), r = Math.random();
      const kind = high > 12 && r < Math.min(.3, .08 + high / 900) ? 'move' : high > 25 && r > 1 - Math.min(.22, high / 1200) ? 'crumble' : 'plain';
      const p = { x: api.rand(pw / 2 + 6, Math.max(pw / 2 + 7, W - pw / 2 - 6)), y: top, w: pw, kind, dx: kind === 'move' ? api.pick([-1, 1]) * api.rand(50, 110) : 0 };
      if (kind === 'plain' && Math.random() < .09) p.spring = true;
      else if (Math.random() < .14) p.star = true;
      plats.push(p);
    }
  }
  api.probe = () => ({ x, y, vy, cam, plats: plats.filter(p => !p.gone).map(p => ({ x: p.x, y: p.y, w: p.w })) });
  api.loop(dt => {
    const W = w(), H = h();
    t += dt;
    if (keys.ArrowLeft || keys.a || keys.A) tx -= 520 * dt;
    if (keys.ArrowRight || keys.d || keys.D) tx += 520 * dt;
    tx = Math.max(16, Math.min(W - 16, tx));
    const bx = x; x += (tx - x) * Math.min(1, dt * 10); if (Math.abs(x - bx) > .4) face = x > bx ? 1 : -1;
    const feet = y + 18; vy += GRAV * dt; y += vy * dt; squash = Math.max(0, squash - dt * 5);
    grow(W);
    for (const p of plats) {
      if (p.dx) { p.x += p.dx * dt; if (p.x < p.w / 2 + 4 || p.x > W - p.w / 2 - 4) { p.dx = -p.dx; p.x = Math.max(p.w / 2 + 4, Math.min(W - p.w / 2 - 4, p.x)); } }
      if (p.star && !p.got && Math.abs(x - p.x) < 24 && Math.abs(y - (p.y - 44)) < 30) { p.got = true; bonus += 5; api.sfx('star'); api.fx.burst(p.x, p.y - 44 - cam, '#ffd23f', 12); api.fx.text(p.x, p.y - 64 - cam, '+5', '#ffd23f', 20); }
      // land only while falling, and only when the feet cross the top of the cloud
      if (!p.gone && vy > 0 && feet <= p.y + 2 && y + 18 >= p.y && Math.abs(x - p.x) < p.w / 2 + 12) {
        y = p.y - 18; vy = p.spring ? -SPRING : -JUMP; squash = 1;
        if (p.spring) { api.sfx('point'); api.fx.burst(p.x, p.y - cam, '#ffd23f', 10); } else api.note(p.kind === 'crumble' ? 300 : 440, .1, .05);
        if (p.kind === 'crumble') { p.gone = true; api.fx.burst(p.x, p.y - cam, '#ff9ecb', 12); }
      }
    }
    if (y - cam < H * .42) cam = y - H * .42;
    best = Math.max(best, Math.floor(-y / 20));
    api.score(best + bonus);
    plats = plats.filter(p => p.y < cam + H + 60);
    api.bg(ctx, W, H);
    for (const p of plats) {
      if (p.gone) continue;
      const py = p.y - cam, col = p.kind === 'move' ? [190, 90, 62] : p.kind === 'crumble' ? [335, 85, 70] : api.c.dark ? [230, 60, 86] : [225, 55, 72];
      const g = ctx.createLinearGradient(0, py, 0, py + 16); g.addColorStop(0, `hsl(${col[0]},${col[1]}%,${col[2]}%)`); g.addColorStop(1, `hsl(${col[0]},${col[1]}%,${col[2] - 20}%)`);
      ctx.fillStyle = g; ctx.shadowColor = `hsla(${col[0]},90%,60%,.6)`; ctx.shadowBlur = 12; api.rr(ctx, p.x - p.w / 2, py, p.w, 15, 7.5); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,.5)'; api.rr(ctx, p.x - p.w / 2 + 7, py + 3, p.w - 14, 3, 1.5); ctx.fill();
      if (p.kind === 'crumble') { ctx.strokeStyle = 'rgba(8,10,30,.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(p.x - 6, py + 2); ctx.lineTo(p.x, py + 8); ctx.lineTo(p.x - 3, py + 14); ctx.stroke(); }
      if (p.spring) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x - 8, py); ctx.lineTo(p.x + 8, py - 4); ctx.lineTo(p.x - 8, py - 8); ctx.lineTo(p.x + 8, py - 12); ctx.stroke(); }
      if (p.star && !p.got) {
        const cy = py - 44 + Math.sin(t * 4 + p.x) * 3;
        ctx.fillStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 12; ctx.beginPath();
        for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 5 : 11; ctx.lineTo(p.x + Math.cos(a) * r, cy + Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      }
    }
    // the hopper: a round fellow that squashes when it lands
    const py = y - cam, sq = 1 - squash * .22, st = 1 + squash * .18;
    ctx.save(); ctx.translate(x, py + 18); ctx.scale(st, sq);
    const g = ctx.createRadialGradient(-5, -24, 2, 0, -18, 20); g.addColorStop(0, `hsl(${api.hue},95%,82%)`); g.addColorStop(1, `hsl(${api.hue},85%,52%)`);
    ctx.fillStyle = g; ctx.shadowColor = `hsl(${api.hue},95%,60%)`; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(0, -18, 18, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(face * 6 - 5, -22, 4.6, 0, 7); ctx.arc(face * 6 + 5, -22, 4.6, 0, 7); ctx.fill();
    ctx.fillStyle = '#12163a'; ctx.beginPath(); ctx.arc(face * 7.5 - 5, -22 + Math.max(-1.5, Math.min(1.5, vy / 400)), 2.2, 0, 7); ctx.arc(face * 7.5 + 5, -22 + Math.max(-1.5, Math.min(1.5, vy / 400)), 2.2, 0, 7); ctx.fill();
    ctx.restore();
    ctx.fillStyle = api.c.ink2; ctx.font = '700 16px Rajdhani,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(best + ' m', 14, 22);
    if (y - cam > H + 50) { api.fx.shake(8); api.end(`You climbed ${best} metres.`); }
  });
} });
