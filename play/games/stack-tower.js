/* Stack Tower · ZBZGames™ original. Tap to drop each block; only the overlap stays. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const BH = 28;
  let dirn = 1, cam = 0, falling = [], cur, combo = 0;
  const blocks = [{ x: w() * .25, wd: w() * .5, i: 0 }];
  const spawn = () => {
    const top = blocks[blocks.length - 1];
    // Enter from just inside the edge, so the block reaches the tower quickly.
    cur = { x: dirn > 0 ? -top.wd * .25 : w() - top.wd * .75, wd: top.wd, i: blocks.length, v: Math.min(520, 190 + blocks.length * 7) };
  };
  spawn();
  const yOf = i => h() - 44 - i * BH + cam;
  function drop() {
    if (!api.alive) return;
    const top = blocks[blocks.length - 1];
    const l = Math.max(cur.x, top.x), r = Math.min(cur.x + cur.wd, top.x + top.wd);
    if (r - l <= 2) { falling.push({ ...cur, vy: 0, y: 0 }); api.fx.shake(7); api.end('The block missed the tower.'); return; }
    const perfect = Math.abs(r - l - top.wd) < 6;
    if (!perfect) {
      combo = 0;
      if (cur.x < l) falling.push({ x: cur.x, wd: l - cur.x, i: cur.i, vy: 0, y: 0 });
      if (cur.x + cur.wd > r) falling.push({ x: r, wd: cur.x + cur.wd - r, i: cur.i, vy: 0, y: 0 });
    } else combo++;
    const nb = { x: perfect ? top.x : l, wd: perfect ? top.wd : r - l, i: cur.i, flash: perfect ? 1 : 0 };
    blocks.push(nb);
    const pts = perfect ? 3 : 1;
    api.add(pts); api.sfx(perfect ? 'star' : 'point');
    if (perfect) { api.fx.text(nb.x + nb.wd / 2, yOf(nb.i) - 12, 'Perfect +' + pts, '#ffd23f'); api.fx.burst(nb.x + nb.wd / 2, yOf(nb.i) + BH / 2, '#ffd23f', 16); }
    dirn = -dirn; spawn();
  }
  api.tap(drop);
  api.key(k => { if (k === ' ' || k === 'Enter' || k === 'ArrowDown') drop(); });
  const hueOf = i => (i * 13 + 200) % 360;
  api.loop(dt => {
    const W = w(), H = h();
    cur.x += dirn * cur.v * dt;
    if ((dirn > 0 && cur.x > W - cur.wd * .25) || (dirn < 0 && cur.x + cur.wd < cur.wd * .25)) dirn = -dirn;
    const want = Math.max(0, blocks.length * BH - H * .55);
    cam += (want - cam) * Math.min(1, dt * 5);
    api.bg(ctx, W, H);
    // ground
    ctx.fillStyle = api.c.dark ? 'rgba(150,160,255,.12)' : 'rgba(60,70,140,.12)'; ctx.fillRect(0, H - 16 + cam, W, 40);
    const draw = (b, dy = 0, alpha = 1) => {
      const y = yOf(b.i) + dy; if (y > H + 10 || y < -BH) return;
      ctx.globalAlpha = alpha;
      const g = ctx.createLinearGradient(0, y, 0, y + BH);
      g.addColorStop(0, `hsl(${hueOf(b.i)},88%,${66 + (b.flash || 0) * 20}%)`); g.addColorStop(1, `hsl(${hueOf(b.i) + 14},80%,46%)`);
      ctx.fillStyle = g; api.rr(ctx, b.x, y, b.wd, BH - 3, 6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.3)'; api.rr(ctx, b.x + 2, y + 2, Math.max(0, b.wd - 4), 4, 2); ctx.fill();
      ctx.globalAlpha = 1;
    };
    blocks.forEach(b => { if (b.flash) b.flash = Math.max(0, b.flash - dt * 3); draw(b); });
    if (api.alive) {
      // a faint guide under the moving block
      const top = blocks[blocks.length - 1];
      ctx.fillStyle = api.c.dark ? 'rgba(255,255,255,.05)' : 'rgba(40,50,120,.05)'; ctx.fillRect(top.x, 0, top.wd, yOf(top.i));
      ctx.shadowColor = `hsl(${hueOf(cur.i)},90%,60%)`; ctx.shadowBlur = 18; draw(cur); ctx.shadowBlur = 0;
    }
    falling.forEach(f => { f.vy += 900 * dt; f.y += f.vy * dt; draw(f, f.y, .55); });
    falling = falling.filter(f => f.y < H);
    ctx.fillStyle = api.c.ink2; ctx.font = '700 16px Rajdhani,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Height ' + (blocks.length - 1) + (combo > 1 ? '   Perfect ×' + combo : ''), 14, 26);
  });
} });
