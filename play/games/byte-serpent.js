/* Byte Serpent · ZBZGames™ original. Swipe or use the arrows; eat the data bits, never your own tail. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const N = 20;
  let snake = [[10, 10], [9, 10], [8, 10]], dir = [1, 0], queue = [], food = null, acc = 0, step = .14;
  const place = () => { do { food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; } while (snake.some(s => s[0] === food[0] && s[1] === food[1])); };
  place();
  // A short queue, so two quick turns in one tick are both honoured.
  const turn = d => {
    const last = queue.length ? queue[queue.length - 1] : dir;
    if ((d[0] !== -last[0] || d[1] !== -last[1]) && (d[0] !== last[0] || d[1] !== last[1]) && queue.length < 3) queue.push(d);
  };
  const KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
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
  api.loop(dt => {
    acc += dt;
    while (acc >= step) {
      acc -= step;
      if (queue.length) dir = queue.shift();
      const head = [(snake[0][0] + dir[0] + N) % N, (snake[0][1] + dir[1] + N) % N];
      const eats = head[0] === food[0] && head[1] === food[1];
      const body = eats ? snake : snake.slice(0, -1);
      if (body.some(s => s[0] === head[0] && s[1] === head[1])) { api.end('The serpent bit its own tail.'); return; }
      snake.unshift(head);
      if (eats) { api.add(1); api.sfx('point'); if (snake.length >= N * N) { api.end('You filled the whole grid!'); return; } place(); step = Math.max(.06, step - .003); }
      else snake.pop();
    }
    const W = w(), H = h(), c = Math.floor(Math.min(W, H) / N), ox = (W - c * N) / 2, oy = (H - c * N) / 2;
    ctx.fillStyle = '#060818'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(120,140,255,.08)'; ctx.lineWidth = 1;
    for (let i = 0; i <= N; i++) { ctx.beginPath(); ctx.moveTo(ox + i * c, oy); ctx.lineTo(ox + i * c, oy + N * c); ctx.moveTo(ox, oy + i * c); ctx.lineTo(ox + N * c, oy + i * c); ctx.stroke(); }
    ctx.fillStyle = '#e2b95c'; ctx.fillRect(ox + food[0] * c + c * .2, oy + food[1] * c + c * .2, c * .6, c * .6);
    snake.forEach((s, i) => { ctx.fillStyle = i ? `hsl(${190 + i * 3},90%,${Math.max(30, 62 - i)}%)` : '#fff'; ctx.fillRect(ox + s[0] * c + 1, oy + s[1] * c + 1, c - 2, c - 2); });
  });
} });
