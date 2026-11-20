/* Grid Duel · ZBZGames™ original, for kids and grown-ups. Noughts and crosses against the ZBZ bot. Win to score; the bot gets sharper as you go. */
ZBZ.register({ start(api) {
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let b, wins = 0, draws = 0, busy = false, youStart = true;
  const wrap = document.createElement('div');
  wrap.className = 'gd-wrap';
  wrap.innerHTML = `<p class="gd-msg" aria-live="polite"></p><div class="gd-grid"></div><p class="gd-sub"></p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.gd-grid'), msg = wrap.querySelector('.gd-msg'), sub = wrap.querySelector('.gd-sub');
  const winner = s => { for (const [a, c, d] of LINES) if (s[a] && s[a] === s[c] && s[a] === s[d]) return s[a]; return s.every(Boolean) ? 'draw' : null; };
  function best(s, me) {
    const w = winner(s); if (w === 'O') return { v: 1 }; if (w === 'X') return { v: -1 }; if (w === 'draw') return { v: 0 };
    let out = { v: me === 'O' ? -2 : 2, i: -1 };
    s.forEach((x, i) => { if (x) return; s[i] = me; const r = best(s, me === 'O' ? 'X' : 'O'); s[i] = null; if (me === 'O' ? r.v > out.v : r.v < out.v) out = { v: r.v, i }; });
    return out;
  }
  function botMove() {
    const free = b.map((x, i) => x ? -1 : i).filter(i => i >= 0);
    const sloppy = Math.max(.05, .45 - wins * .1);
    const i = Math.random() < sloppy ? api.pick(free) : best(b, 'O').i;
    b[i] = 'O'; draw(); check();
  }
  function draw() { grid.innerHTML = b.map((x, i) => `<button type="button" class="gd-c ${x || ''}" data-i="${i}" aria-label="${x || 'Empty'}">${x === 'X' ? '✖' : x === 'O' ? '◯' : ''}</button>`).join(''); }
  function check() {
    const w = winner(b);
    if (!w) { busy = false; msg.textContent = 'Your move (✖)'; return; }
    busy = true;
    if (w === 'X') { wins++; api.add(10 + wins * 2); api.sfx('win'); msg.textContent = 'You win this one!'; }
    else if (w === 'draw') { draws++; api.add(3); msg.textContent = 'A draw.'; }
    else { api.end(`The bot won. You took ${wins} wins and ${draws} draws.`); return; }
    sub.textContent = `Wins ${wins} · Draws ${draws}`;
    api.after(1100, game);
  }
  function game() {
    b = Array(9).fill(null); youStart = !youStart || wins + draws === 0; draw();
    if (youStart) { busy = false; msg.textContent = 'Your move (✖)'; } else { busy = true; msg.textContent = 'Bot starts…'; api.after(500, botMove); }
  }
  api.on(grid, 'click', e => {
    const c = e.target.closest('.gd-c'); if (!c || busy || b[+c.dataset.i]) return;
    b[+c.dataset.i] = 'X'; api.sfx('tap'); draw(); busy = true;
    if (winner(b)) check(); else api.after(380, botMove);
  });
  api.key(k => { const i = +k - 1; if (i >= 0 && i < 9 && !busy && !b[i]) { const el = grid.children[i]; el && el.click(); } });
  sub.textContent = 'Keys 1–9 work too.';
  game();
} });
