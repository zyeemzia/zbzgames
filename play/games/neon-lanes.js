/* Neon Lanes · ZBZGames™ original. Switch between three lanes and dodge the oncoming traffic. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let lane = 1, x = null, cars = [], spawn = 0, speed = 260, dist = 0, coins = [];
  const move = d => { lane = Math.max(0, Math.min(2, lane + d)); api.sfx('tap'); };
  api.key(k => { if (k === 'ArrowLeft' || k === 'a') move(-1); if (k === 'ArrowRight' || k === 'd') move(1); });
  api.tap(px => move(px < w() / 2 ? -1 : 1));
  api.loop(dt => {
    const W = w(), H = h(), lw = Math.min(W, 520) / 3, ox = (W - lw * 3) / 2, py = H - 90;
    const tx = ox + lw * lane + lw / 2;
    x = x === null ? tx : x + (tx - x) * Math.min(1, dt * 14);
    speed = Math.min(720, speed + dt * 9); dist += speed * dt;
    spawn -= dt;
    if (spawn <= 0) {
      const free = [0, 1, 2].sort(() => Math.random() - .5);
      const n = Math.random() < .3 + Math.min(.4, speed / 2000) ? 2 : 1;
      free.slice(0, n).forEach(l => cars.push({ l, y: -80, hue: api.pick([340, 20, 280, 190]) }));
      const c = free[n]; if (c !== undefined && Math.random() < .6) coins.push({ l: c, y: -60 });
      spawn = Math.max(.42, 1.1 - speed / 1100);
    }
    ctx.fillStyle = api.c.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = api.c.dark ? '#0d1030' : '#e7e9f7'; ctx.fillRect(ox, 0, lw * 3, H);
    ctx.strokeStyle = api.c.dark ? 'rgba(86,224,255,.5)' : 'rgba(37,99,235,.45)'; ctx.lineWidth = 3; ctx.setLineDash([26, 22]); ctx.lineDashOffset = -dist % 48;
    for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(ox + lw * i, 0); ctx.lineTo(ox + lw * i, H); ctx.stroke(); }
    ctx.setLineDash([]);
    for (const c of coins) {
      c.y += speed * dt;
      const cx = ox + lw * c.l + lw / 2;
      ctx.fillStyle = '#e2b95c'; ctx.fillRect(cx - 9, c.y - 9, 18, 18);
      if (!c.got && Math.abs(c.y - py) < 34 && Math.abs(cx - x) < lw * .4) { c.got = true; api.add(5); api.sfx('point'); }
    }
    coins = coins.filter(c => !c.got && c.y < H + 40);
    for (const c of cars) {
      c.y += speed * dt;
      const cx = ox + lw * c.l + lw / 2, cw = lw * .56;
      ctx.fillStyle = `hsl(${c.hue},85%,58%)`; ctx.fillRect(cx - cw / 2, c.y - 34, cw, 68);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(cx - cw / 2 + 6, c.y - 18, cw - 12, 16);
      if (!c.passed && c.y - 34 > py + 30) { c.passed = true; api.add(1); }
      if (Math.abs(c.y - py) < 60 && Math.abs(cx - x) < (cw + lw * .5) / 2) { api.end('Crashed into traffic.'); return; }
    }
    cars = cars.filter(c => c.y < H + 80);
    const pw = lw * .5;
    ctx.fillStyle = '#56e0ff'; ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 20;
    ctx.fillRect(x - pw / 2, py - 30, pw, 60); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(x - pw / 2 + 6, py - 14, pw - 12, 14);
  });
} });
