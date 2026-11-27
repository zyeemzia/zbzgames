/* Paddle Duel · ZBZGames™ original. A ball, two paddles, and a bot at the top that gets sharper with every point you take. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let px = w() / 2, tx = px, ox = px, lives = 3, wins = 0, rally = 0, t = 0, aim = 0;
  const ball = { x: 0, y: 0, vx: 0, vy: 0, on: false }, keys = {}, trail = [], R = 9, PH = 12;
  const PW = () => Math.max(64, Math.min(120, w() * .24)), topY = () => 44, botY = () => h() - 44;
  const follow = e => { const r = api.stage.getBoundingClientRect(); tx = e.clientX - r.left; };
  api.on(api.stage, 'pointermove', follow); api.on(api.stage, 'pointerdown', follow);
  api.on(window, 'keydown', e => { keys[e.key] = true; }); api.on(window, 'keyup', e => { keys[e.key] = false; });
  api.on(window, 'blur', () => { for (const k in keys) keys[k] = false; });
  function serve(dir) {
    const sp = Math.min(560, 290 + wins * 22), a = api.rand(-.5, .5);
    ball.x = w() / 2; ball.y = h() / 2; ball.vx = Math.sin(a) * sp; ball.vy = Math.cos(a) * sp * dir; ball.on = true; rally = 0; trail.length = 0; aim = api.rand(-.3, .3);
  }
  function bounce(cx, dir) {
    const sp = Math.min(780, Math.hypot(ball.vx, ball.vy) * 1.035), a = Math.max(-1, Math.min(1, (ball.x - cx) / (PW() / 2 + R))) * 1.02;
    ball.vx = Math.sin(a) * sp; ball.vy = Math.cos(a) * sp * dir;
  }
  api.probe = () => ({ x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, on: ball.on, px, lives, wins });
  api.after(650, () => serve(1));
  api.loop(dt => {
    const W = w(), H = h(), pw = PW();
    t += dt;
    if (keys.ArrowLeft || keys.a || keys.A) tx -= 560 * dt;
    if (keys.ArrowRight || keys.d || keys.D) tx += 560 * dt;
    tx = Math.max(pw / 2, Math.min(W - pw / 2, tx));
    px += (tx - px) * Math.min(1, dt * 16);
    // the bot follows the ball when it is coming, and drifts home when it is not
    const want = ball.on && ball.vy < 0 ? ball.x + aim * pw : W / 2, top = Math.min(520, 150 + wins * 24) * dt;
    ox += Math.max(-top, Math.min(top, want - ox)); ox = Math.max(pw / 2, Math.min(W - pw / 2, ox));
    if (ball.on) {
      const by = ball.y;
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx); api.note(330, .06, .04); }
      if (ball.x > W - R) { ball.x = W - R; ball.vx = -Math.abs(ball.vx); api.note(330, .06, .04); }
      const lineB = botY() - PH / 2 - R, lineT = topY() + PH / 2 + R;
      if (ball.vy > 0 && by <= lineB && ball.y >= lineB && Math.abs(ball.x - px) < pw / 2 + R) {
        ball.y = lineB; bounce(px, -1); rally++; api.add(1); api.sfx('tap'); api.fx.burst(ball.x, ball.y, `hsl(${api.hue},95%,70%)`, 6, 120); aim = api.rand(-.42, .42);
      } else if (ball.vy < 0 && by >= lineT && ball.y <= lineT && Math.abs(ball.x - ox) < pw / 2 + R) {
        ball.y = lineT; bounce(ox, 1); api.note(520, .07, .05);
      }
      trail.push([ball.x, ball.y]); if (trail.length > 12) trail.shift();
      if (ball.y > H + 24) {
        ball.on = false; lives--; api.sfx('bad'); api.fx.shake(8);
        if (lives <= 0) return api.end(`You took ${wins} point${wins === 1 ? '' : 's'} off the bot.`);
        api.after(800, () => serve(-1));
      } else if (ball.y < -24) {
        ball.on = false; wins++; api.add(10); api.sfx('point'); api.fx.burst(ball.x, 20, '#ffd23f', 18); api.fx.text(W / 2, H / 2 - 30, '+10', '#ffd23f', 30);
        api.after(800, () => serve(1));
      }
    }
    api.bg(ctx, W, H);
    ctx.strokeStyle = api.c.line; ctx.lineWidth = 3; ctx.setLineDash([10, 12]); ctx.beginPath(); ctx.moveTo(14, H / 2); ctx.lineTo(W - 14, H / 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * .13, 0, 7); ctx.stroke();
    const pad = (cx, cy, hueV) => {
      const g = ctx.createLinearGradient(0, cy - PH / 2, 0, cy + PH / 2); g.addColorStop(0, `hsl(${hueV},95%,74%)`); g.addColorStop(1, `hsl(${hueV},85%,50%)`);
      ctx.fillStyle = g; ctx.shadowColor = `hsl(${hueV},95%,60%)`; ctx.shadowBlur = 16; api.rr(ctx, cx - pw / 2, cy - PH / 2, pw, PH, PH / 2); ctx.fill(); ctx.shadowBlur = 0;
    };
    pad(ox, topY(), (api.hue + 150) % 360); pad(px, botY(), api.hue);
    trail.forEach((p, i) => { ctx.globalAlpha = i / trail.length * .35; ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(p[0], p[1], R * i / trail.length, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
    if (ball.on) { ctx.fillStyle = '#fff'; ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
    ctx.fillStyle = api.c.ink2; ctx.font = '700 16px Rajdhani,sans-serif'; ctx.textBaseline = 'middle';
    ctx.textAlign = 'left'; ctx.fillText('Points ' + wins, 14, H / 2 - 16);
    ctx.textAlign = 'right'; ctx.fillStyle = '#ff5ea8'; ctx.fillText('♥'.repeat(Math.max(0, lives)), W - 14, H / 2 - 16);
  });
} });
