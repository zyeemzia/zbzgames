/* Ring Stop · ZBZGames™ original. A spark circles the ring. Stop it inside the glowing arc; the arc shrinks and the spark speeds up. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const LIMIT = 7;
  let a = -Math.PI / 2, dir = 1, speed = 2.1, zone = 1.2, half = .5, lives = 3, hits = 0, clock = LIMIT, flash = 0, t = 0;
  const diff = (x, y) => Math.atan2(Math.sin(x - y), Math.cos(x - y));
  function move() {
    let z; do { z = api.rand(0, Math.PI * 2); } while (Math.abs(diff(z, a)) < 1.3);
    zone = z; half = Math.max(.17, half * .94); speed = Math.min(5.2, speed + .16); clock = LIMIT;
  }
  function miss(why) {
    lives--; api.sfx('bad'); api.fx.shake(7); flash = -1;
    if (lives <= 0) { api.end(`${why} You stopped the spark ${hits} times.`); return; }
    clock = LIMIT;
  }
  function stop() {
    if (!api.alive) return;
    const off = Math.abs(diff(a, zone)), W = w(), H = h(), r = Math.min(W, H) * .33, x = W / 2 + Math.cos(a) * r, y = H / 2 + Math.sin(a) * r;
    if (off <= half) {
      const bull = off <= half * .3, pts = bull ? 3 : 1;
      hits++; api.add(pts); api.sfx(bull ? 'star' : 'point'); flash = 1;
      api.fx.burst(x, y, bull ? '#ffd23f' : '#56e0ff', bull ? 22 : 12); api.fx.text(x, y - 22, bull ? 'Bullseye +3' : '+1', bull ? '#ffd23f' : '#56e0ff', 22);
      dir = -dir; move();
    } else miss('Outside the arc.');
  }
  api.tap(stop);
  api.key((k, e) => { if ((k === ' ' || k === 'Enter') && !e.repeat) stop(); });
  api.probe = () => ({ off: Math.abs(diff(a, zone)), half, lives });
  api.loop(dt => {
    const W = w(), H = h(), cx = W / 2, cy = H / 2, r = Math.min(W, H) * .33;
    t += dt; a += dir * speed * dt; flash *= Math.pow(.02, dt);
    clock -= dt; if (clock <= 0) { miss('Too slow.'); if (!api.alive) return; }
    api.bg(ctx, W, H);
    // the track
    ctx.lineCap = 'round';
    ctx.strokeStyle = api.c.dark ? 'rgba(150,160,255,.16)' : 'rgba(60,70,140,.14)'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    // the arc to hit, with its bullseye
    ctx.strokeStyle = flash < -.05 ? '#ff5470' : '#3ddc84'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 18; ctx.lineWidth = 22;
    ctx.beginPath(); ctx.arc(cx, cy, r, zone - half, zone + half); ctx.stroke();
    ctx.strokeStyle = '#ffd23f'; ctx.shadowColor = '#ffd23f'; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.arc(cx, cy, r, zone - half * .3, zone + half * .3); ctx.stroke();
    ctx.shadowBlur = 0;
    // time left for this arc
    ctx.strokeStyle = clock < 2 ? '#ff5470' : (api.c.dark ? 'rgba(255,255,255,.5)' : 'rgba(40,50,120,.45)'); ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r * .62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, clock / LIMIT)); ctx.stroke();
    // the spark and its tail
    for (let i = 8; i >= 0; i--) {
      const aa = a - dir * i * .05 * speed / 2.1, x = cx + Math.cos(aa) * r, y = cy + Math.sin(aa) * r;
      ctx.fillStyle = i ? `rgba(167,139,250,${.5 - i * .05})` : (api.c.dark ? '#fff' : '#2b2f6b');
      if (!i) { ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 22; }
      ctx.beginPath(); ctx.arc(x, y, i ? 9 - i * .7 : 12, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    }
    // hearts and count in the middle
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = api.c.ink; ctx.font = `700 ${Math.round(r * .36 * (1 + Math.max(0, flash) * .25))}px Rajdhani,sans-serif`; ctx.fillText(hits, cx, cy - 6);
    ctx.font = '18px serif';
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = i < lives ? 1 : .22; ctx.fillText('❤️', cx + (i - 1) * 24, cy + r * .3); }
    ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  });
} });
