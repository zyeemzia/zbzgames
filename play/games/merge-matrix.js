/* Merge Matrix · ZBZGames™ original. Slide the grid; equal tiles fuse. Reach 2048 and beyond. */
ZBZ.register({ start(api) {
  const N = 4;
  let g = Array.from({ length: N }, () => Array(N).fill(0)), won = false;
  const board = document.createElement('div');
  board.className = 'mm-board';
  api.stage.appendChild(board);
  const empty = () => { const e = []; g.forEach((r, y) => r.forEach((v, x) => { if (!v) e.push([y, x]); })); return e; };
  const spawn = () => { const e = empty(); if (!e.length) return; const [y, x] = api.pick(e); g[y][x] = Math.random() < .9 ? 2 : 4; };
  function draw() {
    board.innerHTML = g.flat().map(v => `<div class="mm-t" data-v="${v}" style="--hue:${v ? (Math.log2(v) * 28 + 190) % 360 : 0}">${v || ''}</div>`).join('');
  }
  function slideRow(row) {
    const a = row.filter(Boolean), out = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] === a[i + 1]) { out.push(a[i] * 2); api.add(a[i] * 2); if (a[i] * 2 === 2048 && !won) { won = true; api.sfx('win'); } i++; }
      else out.push(a[i]);
    }
    while (out.length < N) out.push(0);
    return out;
  }
  function move(d) {
    const before = JSON.stringify(g);
    const rot = m => m[0].map((_, i) => m.map(r => r[i]));
    if (d === 'L') g = g.map(slideRow);
    if (d === 'R') g = g.map(r => slideRow([...r].reverse()).reverse());
    if (d === 'U') g = rot(rot(g).map(slideRow));
    if (d === 'D') g = rot(rot(g).map(r => slideRow([...r].reverse()).reverse()));
    if (JSON.stringify(g) === before) return;
    api.sfx('tap'); spawn(); draw();
    const stuck = !empty().length && !g.some((r, y) => r.some((v, x) => v === r[x + 1] || (g[y + 1] && v === g[y + 1][x])));
    if (stuck) api.end(won ? 'You reached 2048!' : 'No moves left.');
  }
  api.key(k => { const m = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D', a: 'L', d: 'R', w: 'U', s: 'D' }[k]; if (m) move(m); });
  let sx = 0, sy = 0;
  api.on(board, 'pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  api.on(board, 'pointerup', e => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'));
  });
  spawn(); spawn(); draw();
} });
