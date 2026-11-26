/* Maze Dash · ZBZGames™ original. Race through a fresh maze to the star before the clock runs out. Each maze is bigger. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const TIME = 45, N = 1, E = 2, S = 4, Wb = 8;
  const DIR = { up: [0, -1, N], right: [1, 0, E], down: [0, 1, S], left: [-1, 0, Wb] }, BACK = { 1: S, 2: Wb, 4: N, 8: E };
  let cols = 6, rows = 8, open = new Uint8Array(1), at = 0, exit = 0, gem = -1, level = 1, timeLeft = TIME, lock = false, px = 0, py = 0, seen = new Set(), down = null, G = { ox: 0, oy: 0, c: 1 }, pulse = 0;
  function gen() {
    const W = w(), H = h();
    if (W > H) { rows = Math.min(11, 4 + level); cols = Math.max(5, Math.min(22, Math.floor((W - 20) / ((H - 80) / rows)))); }
    else { cols = Math.min(12, 5 + level); rows = Math.max(5, Math.min(20, Math.floor((H - 80) / ((W - 20) / cols)))); }
    open = new Uint8Array(cols * rows);
    // carve passages with a wandering path that backs up at dead ends
    const done = new Uint8Array(cols * rows), stack = [0]; done[0] = 1;
    while (stack.length) {
      const i = stack[stack.length - 1], x = i % cols, y = Math.floor(i / cols), opts = [];
      for (const k in DIR) { const [dx, dy, bit] = DIR[k], nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !done[ny * cols + nx]) opts.push([ny * cols + nx, bit]); }
      if (!opts.length) { stack.pop(); continue; }
      const [j, bit] = opts[Math.floor(Math.random() * opts.length)];
      open[i] |= bit; open[j] |= BACK[bit]; done[j] = 1; stack.push(j);
    }
    at = 0; exit = cols * rows - 1; px = 0; py = 0; seen = new Set([0]);
    const ends = []; for (let i = 1; i < exit; i++) if ([N, E, S, Wb].filter(b => open[i] & b).length === 1) ends.push(i);
    gem = ends.length ? api.pick(ends) : -1;
  }
  function go(name) {
    if (lock || !api.alive) return;
    const [dx, dy, bit] = DIR[name]; let moved = 0;
    while (open[at] & bit) {
      at += dx + dy * cols; moved++; seen.add(at);
      if (at === gem) { gem = -1; api.add(3); api.sfx('star'); api.fx.text(G.ox + (at % cols + .5) * G.c, G.oy + (Math.floor(at / cols) + .5) * G.c - 12, '+3', '#56e0ff', 20); }
      if (at === exit) break;
      if ([N, E, S, Wb].filter(b => open[at] & b).length > 2) break;       // stop where the way splits
    }
    if (!moved) return;
    api.note(330 + Math.min(12, moved) * 22, .09, .05);
    if (at === exit) {
      lock = true; pulse = 1;
      const pts = 10 + level * 2;
      api.add(pts); api.sfx('win'); timeLeft = Math.min(60, timeLeft + 8 + level);
      api.fx.burst(G.ox + (exit % cols + .5) * G.c, G.oy + (rows - .5) * G.c, '#ffd23f', 28, 240);
      api.fx.text(w() / 2, G.oy + rows * G.c / 2, '+' + pts, '#ffd23f', 30);
      api.after(800, () => { level++; gen(); lock = false; });
    }
  }
  api.key((k, e) => {
    const name = { ArrowUp: 'up', w: 'up', W: 'up', ArrowRight: 'right', d: 'right', D: 'right', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left' }[k];
    if (name && !e.repeat) go(name);
  });
  api.on(api.stage, 'pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
  api.on(window, 'pointerup', e => {
    if (!down) return;
    let dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.hypot(dx, dy) < 22) {      // a tap: head towards the finger
      const r = api.stage.getBoundingClientRect();
      dx = e.clientX - r.left - (G.ox + (px + .5) * G.c); dy = e.clientY - r.top - (G.oy + (py + .5) * G.c);
    }
    down = null;
    go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });
  api.probe = () => ({ cols, rows, open: [...open], at, exit, level, lock });
  gen();
  api.loop(dt => {
    const W = w(), H = h(), c = Math.floor(Math.min((W - 20) / cols, (H - 80) / rows)), ox = (W - c * cols) / 2, oy = 66 + (H - 66 - c * rows) / 2;
    G = { ox, oy, c };
    if (!lock) timeLeft -= dt;
    pulse = Math.max(0, pulse - dt * 1.4);
    const tx = at % cols, ty = Math.floor(at / cols), ease = Math.min(1, dt * 20);
    px += (tx - px) * ease; py += (ty - py) * ease;
    api.bg(ctx, W, H);
    ctx.font = '700 18px Rajdhani,sans-serif'; ctx.textBaseline = 'middle'; ctx.fillStyle = api.c.ink;
    ctx.textAlign = 'left'; ctx.fillText('Maze ' + level, 16, 24);
    ctx.textAlign = 'right'; ctx.fillText(Math.max(0, Math.ceil(timeLeft)) + 's', W - 16, 24);
    ctx.fillStyle = api.c.dark ? 'rgba(255,255,255,.1)' : 'rgba(20,30,90,.1)'; api.rr(ctx, 16, 42, W - 32, 8, 4); ctx.fill();
    const k = Math.max(0, timeLeft / 60);
    ctx.fillStyle = timeLeft > 20 ? '#3ddc84' : timeLeft > 9 ? '#ffd23f' : '#ff5470'; api.rr(ctx, 16, 42, Math.max(8, (W - 32) * Math.min(1, k)), 8, 4); ctx.fill();
    // where you have been
    ctx.fillStyle = `hsla(${api.hue},85%,58%,${api.c.dark ? .16 : .13})`;
    seen.forEach(i => { ctx.fillRect(ox + (i % cols) * c, oy + Math.floor(i / cols) * c, c, c); });
    // walls
    ctx.strokeStyle = `hsl(${api.hue},85%,${api.c.dark ? 68 : 44}%)`; ctx.lineWidth = Math.max(2, c * .1); ctx.lineCap = 'round';
    ctx.shadowColor = `hsl(${api.hue},95%,60%)`; ctx.shadowBlur = api.c.dark ? 8 : 0;
    ctx.beginPath();
    for (let i = 0; i < cols * rows; i++) {
      const x = ox + (i % cols) * c, y = oy + Math.floor(i / cols) * c;
      if (!(open[i] & N)) { ctx.moveTo(x, y); ctx.lineTo(x + c, y); }
      if (!(open[i] & Wb)) { ctx.moveTo(x, y); ctx.lineTo(x, y + c); }
      if (i % cols === cols - 1) { ctx.moveTo(x + c, y); ctx.lineTo(x + c, y + c); }
      if (i >= cols * (rows - 1)) { ctx.moveTo(x, y + c); ctx.lineTo(x + c, y + c); }
    }
    ctx.stroke(); ctx.shadowBlur = 0;
    const star = (cx, cy, r, color) => {
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.beginPath();
      for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, rr = j % 2 ? r * .45 : r; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    };
    star(ox + (exit % cols + .5) * c, oy + (rows - .5) * c, c * (.32 + .04 * Math.sin(api.time() * 5) + pulse * .3), '#ffd23f');
    if (gem >= 0) {
      const gx = ox + (gem % cols + .5) * c, gy = oy + (Math.floor(gem / cols) + .5) * c, r = c * .2;
      ctx.fillStyle = '#56e0ff'; ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.moveTo(gx, gy - r); ctx.lineTo(gx + r, gy); ctx.lineTo(gx, gy + r); ctx.lineTo(gx - r, gy); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    }
    // the runner
    const cx = ox + (px + .5) * c, cy = oy + (py + .5) * c, g = ctx.createRadialGradient(cx - c * .08, cy - c * .1, 1, cx, cy, c * .34);
    g.addColorStop(0, '#fff'); g.addColorStop(.35, '#ff9ecb'); g.addColorStop(1, '#ff5ea8');
    ctx.fillStyle = g; ctx.shadowColor = '#ff5ea8'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(cx, cy, c * .3, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    if (timeLeft <= 0) api.end(`You escaped ${level - 1} maze${level === 2 ? '' : 's'}.`);
  });
} });
