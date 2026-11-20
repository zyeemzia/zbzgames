/* Stack Tower · ZBZGames™ original. Tap to drop each block; only the overlap stays. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const BH = 26;
  let dirn = 1, cam = 0, falling = [], cur;
  const blocks = [{ x: w() * .25, wd: w() * .5, i: 0 }];
  const spawn = () => {
    const top = blocks[blocks.length - 1];
    // Enter from just inside the edge, so the block reaches the tower quickly.
    cur = { x: dirn > 0 ? -top.wd * .25 : w() - top.wd * .75, wd: top.wd, i: blocks.length, v: Math.min(520, 190 + blocks.length * 7) };
  };
  spawn();
  function drop() {
    const top = blocks[blocks.length - 1];
    const l = Math.max(cur.x, top.x), r = Math.min(cur.x + cur.wd, top.x + top.wd);
    if (r - l <= 2) { falling.push({ ...cur, vy: 0, y: 0 }); api.end('The block missed the tower.'); return; }
    const perfect = Math.abs(r - l - top.wd) < 5;
    if (!perfect) {
      if (cur.x < l) falling.push({ x: cur.x, wd: l - cur.x, i: cur.i, vy: 0, y: 0 });
      if (cur.x + cur.wd > r) falling.push({ x: r, wd: cur.x + cur.wd - r, i: cur.i, vy: 0, y: 0 });
    }
    blocks.push({ x: perfect ? top.x : l, wd: perfect ? top.wd : r - l, i: cur.i });
    api.add(perfect ? 3 : 1); api.sfx(perfect ? 'win' : 'point');
    dirn = -dirn; spawn();
  }
  api.tap(drop);
  api.key(k => { if (k === ' ' || k === 'Enter' || k === 'ArrowDown') drop(); });
  api.loop(dt => {
    const W = w(), H = h();
    cur.x += dirn * cur.v * dt;
    if ((dirn > 0 && cur.x > W) || (dirn < 0 && cur.x + cur.wd < 0)) dirn = -dirn;
    const want = Math.max(0, blocks.length * BH - H * .55);
    cam += (want - cam) * Math.min(1, dt * 5);
    const yOf = i => H - 40 - i * BH + cam;
    ctx.fillStyle = api.c.bg; ctx.fillRect(0, 0, W, H);
    const draw = (b, dy = 0, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = `hsl(${(b.i * 14 + 200) % 360},85%,60%)`; ctx.fillRect(b.x, yOf(b.i) + dy, b.wd, BH - 2); ctx.globalAlpha = 1; };
    blocks.forEach(b => draw(b));
    if (api.alive) draw(cur);
    falling.forEach(f => { f.vy += 900 * dt; f.y += f.vy * dt; draw(f, f.y, .6); });
    falling = falling.filter(f => f.y < H);
  });
} });
