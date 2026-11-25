/* Merge Matrix · ZBZGames™ original. Slide the grid; equal tiles fuse. Reach 2048 and beyond. */
ZBZ.register({ start(api) {
  const N = 4;
  let g = Array.from({ length: N }, () => Array(N).fill(0)), won = false;
  const board = document.createElement('div');
  board.className = 'mm-board';
  api.stage.appendChild(board);
  const empty = () => { const e = []; g.forEach((r, y) => r.forEach((v, x) => { if (!v) e.push([y, x]); })); return e; };
  const spawn = () => { const e = empty(); if (!e.length) return null; const [y, x] = api.pick(e); g[y][x] = Math.random() < .9 ? 2 : 4; return y * N + x; };
  const hueOf = v => (Math.log2(v) * 28 + 190) % 360;
  function draw(fresh = [], merged = []) {
    board.innerHTML = g.flat().map((v, i) => `<div class="mm-t${fresh.includes(i) ? ' new' : ''}${merged.includes(i) ? ' merged' : ''}" data-v="${v}" style="--hue:${v ? hueOf(v) : 0}">${v || ''}</div>`).join('');
  }
  function slideRow(row) {
    const a = row.filter(t => t.v), out = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i + 1] && a[i].v === a[i + 1].v) {
        const v = a[i].v * 2; out.push({ v, m: true }); api.add(v);
        if (v === 2048 && !won) { won = true; api.sfx('win'); }
        i++;
      } else out.push({ v: a[i].v, m: false });
    }
    while (out.length < N) out.push({ v: 0, m: false });
    return out;
  }
  function move(d) {
    const before = JSON.stringify(g), hadWon = won;
    const rot = m => m[0].map((_, i) => m.map(r => r[i]));
    let G = g.map(r => r.map(v => ({ v, m: false })));
    if (d === 'L') G = G.map(slideRow);
    if (d === 'R') G = G.map(r => slideRow([...r].reverse()).reverse());
    if (d === 'U') G = rot(rot(G).map(slideRow));
    if (d === 'D') G = rot(rot(G).map(r => slideRow([...r].reverse()).reverse()));
    g = G.map(r => r.map(t => t.v));
    if (JSON.stringify(g) === before) return;
    const merged = []; G.flat().forEach((t, i) => { if (t.m) merged.push(i); });
    api.sfx(merged.length ? 'point' : 'tap');
    const s = spawn(); draw(s === null ? [] : [s], merged);
    merged.forEach(i => { const v = g[Math.floor(i / N)][i % N]; if (v >= 64) api.pop(board.children[i], `hsl(${hueOf(v)},90%,62%)`); });
    if (won && !hadWon) api.fx.text(api.stage.clientWidth / 2, api.stage.clientHeight * .16, '2048! Keep going', '#ffd23f', 30);
    const stuck = !empty().length && !g.some((r, y) => r.some((v, x) => v === r[x + 1] || (g[y + 1] && v === g[y + 1][x])));
    if (stuck) api.end(won ? 'You reached 2048!' : 'No moves left.');
  }
  api.key(k => { const m = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D', a: 'L', d: 'R', w: 'U', s: 'D', A: 'L', D: 'R', W: 'U', S: 'D' }[k]; if (m) move(m); });
  // Swipe anywhere on the stage, not only on the board.
  let sx = 0, sy = 0, down = false;
  api.on(api.stage, 'pointerdown', e => { sx = e.clientX; sy = e.clientY; down = true; });
  api.on(window, 'pointerup', e => {
    if (!down) return; down = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'));
  });
  api.on(window, 'pointercancel', () => { down = false; });
  const a = spawn(), b = spawn(); draw([a, b]);
} });
