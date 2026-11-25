/* Grid Duel · ZBZGames™ original, for kids and grown-ups. Noughts and crosses against the ZBZGames™ bot. Win to score; the bot gets sharper as you go. */
ZBZ.register({ start(api) {
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let b, wins = 0, draws = 0, busy = false, youStart = false, last = -1;
  const wrap = document.createElement('div');
  wrap.className = 'gd-wrap';
  wrap.innerHTML = `<p class="gd-msg" aria-live="polite"></p><div class="gd-grid"></div><p class="gd-sub"></p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.gd-grid'), msg = wrap.querySelector('.gd-msg'), sub = wrap.querySelector('.gd-sub');
  const lineOf = s => LINES.find(([a, c, d]) => s[a] && s[a] === s[c] && s[a] === s[d]) || null;
  const winner = s => { const l = lineOf(s); return l ? s[l[0]] : (s.every(Boolean) ? 'draw' : null); };
  function best(s, me) {
    const w = winner(s); if (w === 'O') return { v: 1 }; if (w === 'X') return { v: -1 }; if (w === 'draw') return { v: 0 };
    let out = { v: me === 'O' ? -2 : 2, i: -1 };
    s.forEach((x, i) => { if (x) return; s[i] = me; const r = best(s, me === 'O' ? 'X' : 'O'); s[i] = null; if (me === 'O' ? r.v > out.v : r.v < out.v) out = { v: r.v, i }; });
    return out;
  }
  function botMove() {
    const free = b.map((x, i) => x ? -1 : i).filter(i => i >= 0);
    if (!free.length) return check();
    const sloppy = Math.max(.05, .45 - wins * .1);
    // An empty board has nine equal openings; pick one at random instead of searching.
    const i = Math.random() < sloppy || free.length === 9 ? api.pick(free) : best(b, 'O').i;
    b[i] = 'O'; last = i; api.sfx('tap'); draw(); check();
  }
  function draw() {
    const line = lineOf(b) || [];
    grid.innerHTML = b.map((x, i) => `<button type="button" class="gd-c ${x || ''}${i === last ? ' last' : ''}${line.includes(i) ? ' win' : ''}" data-i="${i}" aria-label="Square ${i + 1}: ${x === 'X' ? 'your cross' : x === 'O' ? 'bot nought' : 'empty'}">${x === 'X' ? '✖' : x === 'O' ? '◯' : ''}</button>`).join('');
  }
  function check() {
    const w = winner(b);
    if (!w) { busy = false; msg.textContent = 'Your move (✖)'; return; }
    busy = true;
    if (w === 'X') { wins++; api.add(10 + wins * 2); api.sfx('win'); msg.textContent = 'You win this one!'; lineOf(b).forEach(i => api.pop(grid.children[i], '#ffd23f')); }
    else if (w === 'draw') { draws++; api.add(3); msg.textContent = 'A draw.'; }
    else { msg.textContent = 'The bot takes it.'; sub.textContent = `Wins ${wins} · Draws ${draws}`; api.after(900, () => api.end(`The bot won. You took ${wins} wins and ${draws} draws.`)); return; }
    sub.textContent = `Wins ${wins} · Draws ${draws}`;
    api.after(1200, game);
  }
  function game() {
    b = Array(9).fill(null); last = -1; youStart = !youStart; draw();
    if (youStart) { busy = false; msg.textContent = 'Your move (✖)'; } else { busy = true; msg.textContent = 'Bot starts…'; api.after(550, botMove); }
  }
  function place(i) {
    if (busy || !b || b[i]) return;
    b[i] = 'X'; last = i; api.sfx('tap'); draw(); busy = true;
    if (winner(b)) check(); else api.after(400, botMove);
  }
  api.on(grid, 'click', e => { const c = e.target.closest('.gd-c'); if (c) place(+c.dataset.i); });
  api.key(k => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < 9) place(i); });
  api.cursor(() => [...grid.children], () => 3, i => place(i));
  sub.textContent = 'Keys 1 to 9 or the arrows work too.';
  game();
} });
