/* Pulse Breaker · ZBZGames™ original. Slide the paddle; clear the neon wall. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let px = w() / 2, ball, bricks = [], lives = 3, level = 1;
  const keys = {};
  function wall() {
    bricks = [];
    const rows = 4 + Math.min(level, 4);
    for (let r = 0; r < rows; r++) for (let c = 0; c < 8; c++) bricks.push({ c, r, hp: r < level - 1 ? 2 : 1 });
  }
  const serve = () => { ball = { x: w() / 2, y: h() * .6, vx: api.rand(-1, 1) * 160, vy: -260 - level * 25, stuck: .8 }; };
  wall(); serve();
  const follow = e => { const r = api.stage.getBoundingClientRect(); px = e.clientX - r.left; };
  api.on(api.stage, 'pointermove', follow);
  api.on(api.stage, 'pointerdown', follow);
  api.on(window, 'keydown', e => { keys[e.key] = true; });
  api.on(window, 'keyup', e => { keys[e.key] = false; });
  api.loop(dt => {
    const W = w(), H = h(), pw = Math.max(70, W * .16), py = H - 34, bw = W / 8, bh = 22, top = 50, R = 7;
    if (keys.ArrowLeft) px -= 520 * dt;
    if (keys.ArrowRight) px += 520 * dt;
    px = Math.max(pw / 2, Math.min(W - pw / 2, px));
    if (ball.stuck > 0) { ball.stuck -= dt; ball.x = px; ball.y = py - R - 2; }
    else {
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x < R || ball.x > W - R) { ball.vx *= -1; ball.x = Math.max(R, Math.min(W - R, ball.x)); }
      if (ball.y < R) { ball.vy = Math.abs(ball.vy); ball.y = R; }
      if (ball.vy > 0 && ball.y > py - R && ball.y < py + 12 && Math.abs(ball.x - px) < pw / 2 + R) {
        const off = Math.max(-1, Math.min(1, (ball.x - px) / (pw / 2))), sp = Math.min(720, Math.hypot(ball.vx, ball.vy) * 1.01);
        ball.vx = off * sp * .75; ball.vy = -Math.sqrt(Math.max(1, sp * sp - ball.vx * ball.vx)); api.sfx('tap');
      }
      for (const b of bricks) {
        if (b.hp <= 0) continue;
        const x = b.c * bw, y = top + b.r * bh;
        if (ball.x > x - R && ball.x < x + bw + R && ball.y > y - R && ball.y < y + bh + R) {
          b.hp--; api.add(10); api.sfx('point');
          const side = Math.min(Math.abs(ball.x - x), Math.abs(ball.x - x - bw)) < Math.min(Math.abs(ball.y - y), Math.abs(ball.y - y - bh));
          if (side) ball.vx *= -1; else ball.vy *= -1;
          break;
        }
      }
      if (ball.y > H + 20) { lives--; api.sfx('bad'); if (lives <= 0) { api.end('Out of balls.'); return; } serve(); }
      if (bricks.every(b => b.hp <= 0)) { level++; api.add(100); api.sfx('win'); wall(); serve(); }
    }
    ctx.fillStyle = '#060818'; ctx.fillRect(0, 0, W, H);
    for (const b of bricks) if (b.hp > 0) { ctx.fillStyle = b.hp > 1 ? '#e2b95c' : `hsl(${200 + b.r * 25},90%,60%)`; ctx.fillRect(b.c * bw + 2, top + b.r * bh + 2, bw - 4, bh - 4); }
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 16;
    ctx.fillRect(px - pw / 2, py, pw, 10);
    ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#aab2d8'; ctx.font = '600 15px Rajdhani,sans-serif';
    ctx.fillText('Level ' + level + '   Balls ' + '●'.repeat(lives), 12, 28);
  });
} });
