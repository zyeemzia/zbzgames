/* Neon Lanes · ZBZGames™ original. Switch between three lanes and dodge the oncoming traffic. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let lane = 1, x = null, cars = [], spawn = .5, speed = 260, dist = 0, coins = [], t = 0;
  const move = d => { const n = Math.max(0, Math.min(2, lane + d)); if (n !== lane) { lane = n; api.sfx('tap'); } };
  api.key(k => { if (k === 'ArrowLeft' || k === 'a' || k === 'A') move(-1); if (k === 'ArrowRight' || k === 'd' || k === 'D') move(1); });
  api.tap(px => move(px < w() / 2 ? -1 : 1));
  function car(cx, cy, cw, ch, hue, mine) {
    const g = ctx.createLinearGradient(0, cy - ch / 2, 0, cy + ch / 2);
    g.addColorStop(0, `hsl(${hue},90%,${mine ? 68 : 62}%)`); g.addColorStop(1, `hsl(${hue + 15},82%,42%)`);
    ctx.fillStyle = g; api.rr(ctx, cx - cw / 2, cy - ch / 2, cw, ch, cw * .24); ctx.fill();
    ctx.fillStyle = 'rgba(8,10,30,.62)'; api.rr(ctx, cx - cw / 2 + cw * .14, cy - ch * (mine ? .22 : .08), cw * .72, ch * .28, 5); ctx.fill();
    ctx.fillStyle = mine ? '#fff7c2' : '#ffd2d2';
    const ly = mine ? cy - ch / 2 + 3 : cy + ch / 2 - 7;
    ctx.fillRect(cx - cw / 2 + 5, ly, cw * .18, 4); ctx.fillRect(cx + cw / 2 - 5 - cw * .18, ly, cw * .18, 4);
  }
  api.loop(dt => {
    const W = w(), H = h(), lw = Math.min(W, 520) / 3, ox = (W - lw * 3) / 2, py = H - 90;
    const tx = ox + lw * lane + lw / 2;
    t += dt;
    x = x === null ? tx : x + (tx - x) * Math.min(1, dt * 14);
    speed = Math.min(720, speed + dt * 9); dist += speed * dt;
    spawn -= dt;
    if (spawn <= 0) {
      const free = [0, 1, 2].sort(() => Math.random() - .5);
      const n = Math.random() < .3 + Math.min(.4, speed / 2000) ? 2 : 1;
      free.slice(0, n).forEach(l => cars.push({ l, y: -80, hue: api.pick([340, 20, 280, 45]) }));
      const c = free[n]; if (c !== undefined && Math.random() < .6) coins.push({ l: c, y: -60 });
      spawn = Math.max(.42, 1.1 - speed / 1100);
    }
    api.bg(ctx, W, H);
    ctx.fillStyle = api.c.dark ? '#0d1030' : '#dfe3f6'; ctx.fillRect(ox, 0, lw * 3, H);
    // glowing kerbs and moving lane marks
    ctx.fillStyle = '#ff5ea8'; ctx.shadowColor = '#ff5ea8'; ctx.shadowBlur = 14; ctx.fillRect(ox - 4, 0, 4, H); ctx.fillRect(ox + lw * 3, 0, 4, H); ctx.shadowBlur = 0;
    ctx.strokeStyle = api.c.dark ? 'rgba(86,224,255,.55)' : 'rgba(37,99,235,.5)'; ctx.lineWidth = 3; ctx.setLineDash([26, 22]); ctx.lineDashOffset = -dist % 48;
    for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(ox + lw * i, 0); ctx.lineTo(ox + lw * i, H); ctx.stroke(); }
    ctx.setLineDash([]);
    for (const c of coins) {
      c.y += speed * dt;
      const cx = ox + lw * c.l + lw / 2, sq = Math.abs(Math.cos(t * 5));
      ctx.fillStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.ellipse(cx, c.y, 3 + 9 * sq, 12, 0, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      if (!c.got && Math.abs(c.y - py) < 34 && Math.abs(cx - x) < lw * .4) { c.got = true; api.add(5); api.sfx('point'); api.fx.burst(cx, c.y, '#ffd23f', 12); api.fx.text(cx, c.y - 20, '+5', '#ffd23f', 20); }
    }
    coins = coins.filter(c => !c.got && c.y < H + 40);
    for (const c of cars) {
      c.y += speed * dt;
      const cx = ox + lw * c.l + lw / 2, cw = lw * .56;
      car(cx, c.y, cw, 68, c.hue, false);
      if (!c.passed && c.y - 34 > py + 30) { c.passed = true; api.add(1); }
      if (Math.abs(c.y - py) < 60 && Math.abs(cx - x) < (cw + lw * .5) / 2) { api.fx.burst(x, py - 20, '#ff5470', 30, 280); api.fx.shake(10); api.end('Crashed into traffic.'); return; }
    }
    cars = cars.filter(c => c.y < H + 80);
    const pw = lw * .5;
    ctx.fillStyle = 'rgba(86,224,255,.22)'; ctx.beginPath(); ctx.moveTo(x - pw * .3, py + 30); ctx.lineTo(x + pw * .3, py + 30); ctx.lineTo(x, py + 52 + Math.random() * 14); ctx.closePath(); ctx.fill();
    ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 22; car(x, py, pw, 60, 188, true); ctx.shadowBlur = 0;
    ctx.fillStyle = api.c.ink2; ctx.font = '700 16px Rajdhani,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(Math.round(speed / 4) + ' km/h', Math.max(12, ox + 10), H - 14);
  });
} });
