/* Flip Field · ZBZGames™ original. Trap the bot's discs between yours to flip them. Whoever owns more of the field at the end wins. */
ZBZ.register({ start(api) {
  const N = 6, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  // corners are precious, the squares beside them are traps
  const WEIGHT = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const ex = x === 0 || x === N - 1, ey = y === 0 || y === N - 1, nx = x === 1 || x === N - 2, ny = y === 1 || y === N - 2;
    WEIGHT.push(ex && ey ? 100 : (nx && ny) ? -40 : ((ex && ny) || (ey && nx)) ? -15 : (ex || ey) ? 10 : 1);
  }
  let b = Array(N * N).fill(0), busy = false, done = false, turned = new Set(), last = -1;
  b[2 * N + 2] = 2; b[3 * N + 3] = 2; b[2 * N + 3] = 1; b[3 * N + 2] = 1;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap rf-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip rf-you">You <b class="rf-a">2</b></span><span class="g-chip rf-bot">Bot <b class="rf-b">2</b></span></div><p class="g-msg" aria-live="polite">Your move</p><div class="rf-grid"></div><p class="g-sub">Place a disc so the bot's discs are caught in a line between two of yours.</p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.rf-grid'), msg = wrap.querySelector('.g-msg'), aEl = wrap.querySelector('.rf-a'), bEl = wrap.querySelector('.rf-b');
  function flips(g, i, who) {
    if (g[i]) return [];
    const x = i % N, y = Math.floor(i / N), out = [];
    for (const [dx, dy] of DIRS) {
      const run = []; let cx = x + dx, cy = y + dy;
      while (cx >= 0 && cy >= 0 && cx < N && cy < N && g[cy * N + cx] === 3 - who) { run.push(cy * N + cx); cx += dx; cy += dy; }
      if (run.length && cx >= 0 && cy >= 0 && cx < N && cy < N && g[cy * N + cx] === who) out.push(...run);
    }
    return out;
  }
  const movesOf = who => { const out = []; for (let i = 0; i < N * N; i++) if (flips(b, i, who).length) out.push(i); return out; };
  const count = who => b.filter(x => x === who).length;
  function draw() {
    const can = busy || done ? [] : movesOf(1);
    grid.innerHTML = b.map((x, i) => `<button type="button" class="rf-c${x ? ' p' + x : ''}${can.includes(i) ? ' can' : ''}${turned.has(i) ? ' turn' : ''}${i === last ? ' last' : ''}" data-i="${i}" aria-label="Square ${i + 1}: ${x === 1 ? 'yours' : x === 2 ? 'the bot' : can.includes(i) ? 'empty, you can play here' : 'empty'}"><i></i></button>`).join('');
    aEl.textContent = count(1); bEl.textContent = count(2);
    api.score(count(1) - 2);   // discs won beyond the two you start with
    cur.paint();
  }
  function put(i, who) {
    const f = flips(b, i, who);
    b[i] = who; f.forEach(k => { b[k] = who; }); turned = new Set(f); last = i;
    return f.length;
  }
  function finish() {
    done = true; busy = true; turned = new Set(); draw();
    const a = count(1), o = count(2);
    if (a > o) { api.add(30); api.sfx('win'); }
    msg.textContent = a > o ? 'The field is yours!' : a === o ? 'A draw.' : 'The bot holds the field.';
    api.after(1300, () => api.end(a > o ? `You won ${a} to ${o}. The win adds 30.` : a === o ? `A draw, ${a} each.` : `The bot won ${o} to ${a}.`));
  }
  function next(who) {
    // who is to move; a side with no move passes, and with no move for either the game is over
    if (movesOf(who).length) {
      if (who === 1) { busy = false; msg.textContent = 'Your move'; draw(); }
      else { busy = true; msg.textContent = 'The bot is thinking…'; draw(); api.after(650, botMove); }
    } else if (movesOf(3 - who).length) {
      msg.textContent = who === 1 ? 'You have no move. The bot plays again.' : 'The bot has no move. Play again.';
      if (who === 1) { busy = true; draw(); api.after(900, botMove); } else { busy = false; draw(); }
    } else finish();
  }
  function botMove() {
    const list = movesOf(2);
    if (!list.length) return next(1);
    let pick = list[0], top = -1e9;
    if (Math.random() < .12) pick = api.pick(list);
    else for (const i of list) { const v = WEIGHT[i] + flips(b, i, 2).length * 2 + Math.random(); if (v > top) { top = v; pick = i; } }
    put(pick, 2); api.sfx('tap');
    next(1);
  }
  function place(i) {
    if (busy || done || !api.alive) return;
    if (!flips(b, i, 1).length) { if (!b[i]) { api.sfx('bad'); const c = grid.children[i]; c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); } return; }
    const n = put(i, 1); api.sfx('pop'); busy = true; draw();
    api.pop(grid.children[i], '#ffd23f', '+' + n);
    next(2);
  }
  api.on(grid, 'click', e => { const c = e.target.closest('.rf-c'); if (c) { place(+c.dataset.i); c.blur(); } });
  const cur = api.cursor(() => [...grid.children], () => N, i => place(i));
  api.probe = () => ({ b: b.slice(), busy, done, moves: busy || done ? [] : movesOf(1) });
  draw();
} });
