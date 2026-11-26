/* Four Fall · ZBZGames™ original. Drop discs into the frame and line up four before the ZBZGames™ bot does. The bot thinks further ahead each time you win. */
ZBZ.register({ start(api) {
  const C = 7, R = 6, ORDER = [3, 2, 4, 1, 5, 0, 6];
  // every line of four on the board
  const WIN = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const ec = c + dc * 3, er = r + dr * 3;
    if (ec < C && er < R && er >= 0) WIN.push([0, 1, 2, 3].map(k => (r + dr * k) * C + c + dc * k));
  }
  let b = [], busy = true, wins = 0, draws = 0, youStart = false, col = 3, last = -1, line = [], kb = false;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap ff-wrap';
  wrap.innerHTML = `<p class="g-msg" aria-live="polite"></p><div class="ff-grid"></div><p class="g-sub">Tap a column, or press 1 to 7.</p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.ff-grid'), msg = wrap.querySelector('.g-msg'), sub = wrap.querySelector('.g-sub');
  const drop = (g, c, who) => { for (let r = R - 1; r >= 0; r--) if (!g[r * C + c]) { g[r * C + c] = who; return r * C + c; } return -1; };
  const won = (g, who) => WIN.find(w => g[w[0]] === who && g[w[1]] === who && g[w[2]] === who && g[w[3]] === who) || null;
  const value = g => {
    let s = 0;
    for (const w of WIN) {
      let a = 0, o = 0;
      for (const i of w) { if (g[i] === 2) a++; else if (g[i] === 1) o++; }
      if (a && !o) s += [0, 1, 6, 40][a] || 0; else if (o && !a) s -= [0, 1, 6, 50][o] || 0;
    }
    return s;
  };
  function search(g, depth, lo, hi, who) {
    if (won(g, 2)) return 9000 + depth;
    if (won(g, 1)) return -9000 - depth;
    const cols = ORDER.filter(c => !g[c]);
    if (!cols.length) return 0;
    if (!depth) return value(g);
    let best = who === 2 ? -1e9 : 1e9;
    for (const c of cols) {
      const i = drop(g, c, who), v = search(g, depth - 1, lo, hi, 3 - who); g[i] = 0;
      if (who === 2) { if (v > best) best = v; if (best > lo) lo = best; } else { if (v < best) best = v; if (best < hi) hi = best; }
      if (lo >= hi) break;
    }
    return best;
  }
  function draw() {
    grid.innerHTML = b.map((x, i) => `<button type="button" class="ff-c${x ? ' p' + x : ''}${i === last ? ' last' : ''}${line.includes(i) ? ' win' : ''}${kb && i === col ? ' kb' : ''}" data-c="${i % C}" style="--r:${Math.floor(i / C) + 1}" aria-label="Column ${i % C + 1}, row ${Math.floor(i / C) + 1}: ${x === 1 ? 'your disc' : x === 2 ? 'bot disc' : 'empty'}"><i></i></button>`).join('');
  }
  function settle() {
    const mine = won(b, 1), bots = won(b, 2);
    if (!mine && !bots && b.some(x => !x)) return false;
    busy = true; line = mine || bots || []; draw();
    if (mine) { wins++; api.add(20 + wins * 5); api.sfx('win'); msg.textContent = 'Four in a row. You win!'; line.forEach(i => api.pop(grid.children[i], '#ffd23f')); }
    else if (bots) { msg.textContent = 'The bot lined up four.'; api.after(1200, () => api.end(`The bot won. You took ${wins} win${wins === 1 ? '' : 's'} and ${draws} draw${draws === 1 ? '' : 's'}.`)); return true; }
    else { draws++; api.add(5); msg.textContent = 'The frame is full: a draw.'; }
    sub.textContent = `Wins ${wins} · Draws ${draws}`;
    api.after(1500, game);
    return true;
  }
  function botMove() {
    const free = ORDER.filter(c => !b[c]);
    if (!free.length) return settle();
    let c = free[0];
    if (Math.random() < Math.max(.04, .28 - wins * .1)) c = api.pick(free);
    else {
      let top = -1e9; const depth = Math.min(5, 3 + wins);
      for (const k of free) { const i = drop(b, k, 2), v = search(b, depth, -1e9, 1e9, 1) + Math.random() * .5; b[i] = 0; if (v > top) { top = v; c = k; } }
    }
    last = drop(b, c, 2); api.sfx('tap'); draw();
    if (!settle()) { busy = false; msg.textContent = 'Your move'; }
  }
  function place(c) {
    if (busy || !api.alive || c < 0 || c >= C) return;
    if (b[c]) { api.sfx('bad'); return; }
    col = c; last = drop(b, c, 1); api.sfx('pop'); draw(); busy = true;
    if (!settle()) { msg.textContent = 'The bot is thinking…'; api.after(520, botMove); }
  }
  function game() {
    b = Array(C * R).fill(0); last = -1; line = []; youStart = !youStart; draw();
    if (youStart) { busy = false; msg.textContent = 'Your move'; } else { busy = true; msg.textContent = 'The bot starts…'; api.after(600, botMove); }
  }
  api.on(grid, 'click', e => { const c = e.target.closest('.ff-c'); if (c) { kb = false; place(+c.dataset.c); } });
  api.key((k, e) => {
    const n = +k;
    if (k !== ' ' && n >= 1 && n <= C) { if (!e.repeat) place(n - 1); return; }
    if (k === 'ArrowLeft' || k === 'ArrowRight') { kb = true; col = Math.max(0, Math.min(C - 1, col + (k === 'ArrowLeft' ? -1 : 1))); draw(); }
    else if ((k === ' ' || k === 'Enter' || k === 'ArrowDown') && !e.repeat) { e.preventDefault(); kb = true; place(col); }
  });
  api.probe = () => ({ b: b.slice(), busy, wins });
  game();
} });
