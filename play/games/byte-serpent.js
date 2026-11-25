/* Byte Serpent · ZBZGames™ original. Swipe or use the arrows; eat the data bits, never your own tail. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const N = 20;
  let snake = [[10, 10], [9, 10], [8, 10]], prev = snake.map(s => s.slice()), dir = [1, 0], queue = [], food = null, acc = 0, step = .14, t = 0;
  const place = () => { do { food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; } while (snake.some(s => s[0] === food[0] && s[1] === food[1])); };
  place();
  // A short queue, so two quick turns in one tick are both honoured.
  const turn = d => {
    const last = queue.length ? queue[queue.length - 1] : dir;
    if ((d[0] !== -last[0] || d[1] !== -last[1]) && (d[0] !== last[0] || d[1] !== last[1]) && queue.length < 3) queue.push(d);
  };
  const KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0] };
  api.key(k => { if (KEYS[k]) turn(KEYS[k]); });
  let sx = 0, sy = 0, down = false;
  api.on(api.stage, 'pointerdown', e => { sx = e.clientX; sy = e.clientY; down = true; });
  api.on(api.stage, 'pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
    sx = e.clientX; sy = e.clientY;
  });
  api.on(window, 'pointerup', () => { down = false; });
  api.on(window, 'pointercancel', () => { down = false; });
  const geo = () => { const W = w(), H = h(), c = Math.floor(Math.min(W, H) / N), ox = (W - c * N) / 2, oy = (H - c * N) / 2; return { W, H, c, ox, oy }; };
  api.loop(dt => {
    acc += dt; t += dt;
    while (acc >= step) {
      acc -= step;
      if (queue.length) dir = queue.shift();
      const head = [(snake[0][0] + dir[0] + N) % N, (snake[0][1] + dir[1] + N) % N];
      const eats = head[0] === food[0] && head[1] === food[1];
      const body = eats ? snake : snake.slice(0, -1);
      if (body.some(s => s[0] === head[0] && s[1] === head[1])) {
        const g = geo(); api.fx.burst(g.ox + (snake[0][0] + .5) * g.c, g.oy + (snake[0][1] + .5) * g.c, '#ff5470', 24, 240); api.fx.shake(8);
        api.end('The serpent bit its own tail.'); return;
      }
      prev = snake.map(s => s.slice());
      snake.unshift(head);
      if (eats) {
        const g = geo(); api.add(1); api.sfx('point'); api.fx.burst(g.ox + (head[0] + .5) * g.c, g.oy + (head[1] + .5) * g.c, '#e2b95c', 14);
        prev.push(prev[prev.length - 1].slice());
        if (snake.length >= N * N) { api.end('You filled the whole grid!'); return; }
        place(); step = Math.max(.06, step - .003);
      } else snake.pop();
    }
    const { W, H, c, ox, oy } = geo(), k = Math.min(1, acc / step);
    api.bg(ctx, W, H);
    ctx.fillStyle = api.c.dark ? 'rgba(10,14,40,.55)' : 'rgba(255,255,255,.6)'; api.rr(ctx, ox - 4, oy - 4, N * c + 8, N * c + 8, 14); ctx.fill();
    ctx.strokeStyle = api.c.line; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < N; i++) { ctx.moveTo(ox + i * c, oy); ctx.lineTo(ox + i * c, oy + N * c); ctx.moveTo(ox, oy + i * c); ctx.lineTo(ox + N * c, oy + i * c); }
    ctx.stroke();
    // the bit
    const fr = c * (.3 + .05 * Math.sin(t * 6)), fx = ox + (food[0] + .5) * c, fy = oy + (food[1] + .5) * c;
    ctx.fillStyle = '#e2b95c'; ctx.shadowColor = '#e2b95c'; ctx.shadowBlur = 16;
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(Math.PI / 4 + t); api.rr(ctx, -fr, -fr, fr * 2, fr * 2, fr * .35); ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
    // the serpent, eased between cells (a wrap jumps instead of sliding across the grid)
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i], p = prev[i] || s;
      let gx = s[0], gy = s[1];
      if (Math.abs(s[0] - p[0]) <= 1 && Math.abs(s[1] - p[1]) <= 1) { gx = p[0] + (s[0] - p[0]) * k; gy = p[1] + (s[1] - p[1]) * k; }
      const pad = i ? Math.min(c * .16, 1 + i * .04) : 0, x = ox + gx * c + pad, y = oy + gy * c + pad, sz = c - pad * 2;
      ctx.fillStyle = i ? `hsl(${170 + i * 2.5},85%,${Math.max(34, 58 - i * .6)}%)` : (api.c.dark ? '#eafff9' : '#0f5f55');
      if (!i) { ctx.shadowColor = '#3ddcc0'; ctx.shadowBlur = 14; }
      api.rr(ctx, x, y, sz, sz, c * .32); ctx.fill(); ctx.shadowBlur = 0;
      if (!i) {
        ctx.fillStyle = api.c.dark ? '#0b0e24' : '#fff';
        const ex = dir[1] ? c * .22 : 0, ey = dir[0] ? c * .22 : 0, hx = x + sz / 2 + dir[0] * c * .16, hy = y + sz / 2 + dir[1] * c * .16;
        ctx.beginPath(); ctx.arc(hx - ex, hy - ey, c * .09, 0, 7); ctx.arc(hx + ex, hy + ey, c * .09, 0, 7); ctx.fill();
      }
    }
    ctx.fillStyle = api.c.ink2; ctx.font = '700 15px Rajdhani,sans-serif'; ctx.textAlign = 'left';
    if (oy > 26) ctx.fillText('Length ' + snake.length, ox, oy - 10);
  });
} });
