/* Pulse Breaker · ZBZGames™ original. Slide the paddle; clear the neon wall. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let px = w() / 2, ball, bricks = [], lives = 3, level = 1, trail = [];
  const keys = {};
  function wall() {
    bricks = [];
    const rows = 4 + Math.min(level, 4);
    for (let r = 0; r < rows; r++) for (let c = 0; c < 8; c++) bricks.push({ c, r, hp: r < level - 1 ? 2 : 1, hit: 0 });
  }
  const serve = () => { ball = { x: w() / 2, y: h() * .6, vx: api.rand(-1, 1) * 160, vy: -260 - Math.min(level, 8) * 25, stuck: .8 }; trail = []; };
  wall(); serve();
  const follow = e => { const r = api.stage.getBoundingClientRect(); px = e.clientX - r.left; };
  api.on(api.stage, 'pointermove', follow);
  api.on(api.stage, 'pointerdown', follow);
  api.on(window, 'keydown', e => { keys[e.key] = true; });
  api.on(window, 'keyup', e => { keys[e.key] = false; });
  api.on(window, 'blur', () => { for (const k in keys) keys[k] = false; });
  api.loop(dt => {
    const W = w(), H = h(), pw = Math.max(70, W * .16), py = H - 34, bw = W / 8, bh = 22, top = 50, R = 7;
    if (keys.ArrowLeft || keys.a) px -= 520 * dt;
    if (keys.ArrowRight || keys.d) px += 520 * dt;
    px = Math.max(pw / 2, Math.min(W - pw / 2, px));
    if (ball.stuck > 0) { ball.stuck -= dt; ball.x = px; ball.y = py - R - 2; }
    else {
      // Two half-steps, so a fast ball cannot pass through a brick.
      for (let pass = 0; pass < 2; pass++) {
        ball.x += ball.vx * dt / 2; ball.y += ball.vy * dt / 2;
        if (ball.x < R || ball.x > W - R) { ball.vx *= -1; ball.x = Math.max(R, Math.min(W - R, ball.x)); }
        if (ball.y < R) { ball.vy = Math.abs(ball.vy); ball.y = R; }
        if (ball.vy > 0 && ball.y > py - R && ball.y < py + 12 && Math.abs(ball.x - px) < pw / 2 + R) {
          const off = Math.max(-1, Math.min(1, (ball.x - px) / (pw / 2))), sp = Math.min(720, Math.hypot(ball.vx, ball.vy) * 1.01);
          ball.vx = off * sp * .75; ball.vy = -Math.sqrt(Math.max(1, sp * sp - ball.vx * ball.vx)); ball.y = py - R; api.sfx('tap');
        }
        for (const b of bricks) {
          if (b.hp <= 0) continue;
          const x = b.c * bw, y = top + b.r * bh;
          if (ball.x > x - R && ball.x < x + bw + R && ball.y > y - R && ball.y < y + bh + R) {
            b.hp--; b.hit = 1; api.add(10); api.sfx('point');
            if (b.hp <= 0) api.fx.burst(x + bw / 2, y + bh / 2, `hsl(${200 + b.r * 25},90%,62%)`, 10, 150);
            // Bounce off the face the ball came through.
            const side = Math.min(Math.abs(ball.x - x), Math.abs(ball.x - x - bw)) < Math.min(Math.abs(ball.y - y), Math.abs(ball.y - y - bh));
            if (side) { ball.vx = Math.abs(ball.vx) * (ball.x < x + bw / 2 ? -1 : 1); } else { ball.vy = Math.abs(ball.vy) * (ball.y < y + bh / 2 ? -1 : 1); }
            break;
          }
        }
      }
      if (ball.y > H + 20) { lives--; api.sfx('bad'); api.fx.shake(6); if (lives <= 0) { api.end(`Out of balls on level ${level}.`); return; } serve(); }
      if (bricks.every(b => b.hp <= 0)) { level++; api.add(100); api.sfx('win'); api.fx.text(W / 2, H * .4, 'Level ' + level, '#ffd23f', 34); wall(); serve(); }
    }
    api.bg(ctx, W, H);
    for (const b of bricks) if (b.hp > 0) {
      const x = b.c * bw + 2, y = top + b.r * bh + 2, hue = 200 + b.r * 25;
      b.hit = Math.max(0, b.hit - dt * 5);
      const g = ctx.createLinearGradient(0, y, 0, y + bh);
      if (b.hp > 1) { g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#c8922f'); } else { g.addColorStop(0, `hsl(${hue},92%,${66 + b.hit * 20}%)`); g.addColorStop(1, `hsl(${hue + 16},82%,46%)`); }
      ctx.fillStyle = g; api.rr(ctx, x, y, bw - 4, bh - 4, 5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(x + 3, y + 2, bw - 10, 3);
    }
    trail.push([ball.x, ball.y]); if (trail.length > 10) trail.shift();
    trail.forEach(([x, y], i) => { ctx.fillStyle = `rgba(86,224,255,${i / trail.length * .35})`; ctx.beginPath(); ctx.arc(x, y, R * i / trail.length, 0, 7); ctx.fill(); });
    ctx.fillStyle = api.c.dark ? '#fff' : '#2b2f6b'; ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 16;
    api.rr(ctx, px - pw / 2, py, pw, 11, 6); ctx.fill();
    ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = api.c.ink2; ctx.font = '700 16px Rajdhani,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Level ' + level, 12, 30);
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = i < lives ? 1 : .2; ctx.fillStyle = '#56e0ff'; ctx.beginPath(); ctx.arc(W - 20 - i * 20, 24, 6, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  });
} });
