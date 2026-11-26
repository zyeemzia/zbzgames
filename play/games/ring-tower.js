/* Ring Tower · ZBZGames™ original. Move the whole stack of rings to the last peg, one ring at a time, never a bigger ring on a smaller one. */
ZBZ.register({ start(api) {
  const TIME = 90;
  let n = 3, pegs = [[], [], []], held = -1, moves = 0, level = 1, timeLeft = TIME, lock = false;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap rt-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Level <b class="rt-l">1</b></span><span class="g-chip">Moves <b class="rt-m">0</b> · best <b class="rt-b">7</b></span><span class="g-chip"><b class="rt-s">${TIME}</b>s</span></div><div class="qz-time"><i></i></div><div class="rt-board"></div><p class="g-sub">Tap a peg to lift its top ring, then tap the peg to put it on. Fill the last peg.</p>`;
  api.stage.appendChild(wrap);
  const board = wrap.querySelector('.rt-board'), bar = wrap.querySelector('.qz-time i');
  const lEl = wrap.querySelector('.rt-l'), mEl = wrap.querySelector('.rt-m'), bEl = wrap.querySelector('.rt-b'), sEl = wrap.querySelector('.rt-s');
  function draw() {
    board.innerHTML = pegs.map((p, k) => `<button type="button" class="rt-peg${k === held ? ' held' : ''}${k === 2 ? ' goal' : ''}" data-k="${k}" aria-label="Peg ${k + 1}, ${p.length} ring${p.length === 1 ? '' : 's'}${k === held ? ', top ring lifted' : ''}"><small>${k + 1}</small>${p.map((d, j) => `<i class="rt-d${k === held && j === p.length - 1 ? ' up' : ''}" style="--s:${d};--n:${n}"></i>`).join('')}</button>`).join('');
    lEl.textContent = level; mEl.textContent = moves; bEl.textContent = 2 ** n - 1;
    cur.paint();
  }
  function setup() {
    n = Math.min(7, 2 + level);
    pegs = [Array.from({ length: n }, (_, i) => n - i), [], []]; held = -1; moves = 0; draw();
  }
  function tap(k) {
    if (lock || !api.alive || k < 0 || k > 2) return;
    if (held < 0) { if (pegs[k].length) { held = k; api.sfx('tap'); draw(); } return; }
    if (k === held) { held = -1; draw(); return; }
    const d = pegs[held][pegs[held].length - 1], t = pegs[k][pegs[k].length - 1];
    if (t !== undefined && t < d) {
      api.sfx('bad'); const el = board.children[k]; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
      return;
    }
    pegs[k].push(pegs[held].pop()); held = -1; moves++; api.sfx('pop'); draw();
    if (pegs[2].length === n) {
      const neat = moves === 2 ** n - 1, pts = n * 10 + (neat ? 15 : 0);
      lock = true; api.add(pts); api.sfx('win'); timeLeft = Math.min(120, timeLeft + 20 + n * 5);
      api.pop(board.children[2], '#ffd23f', neat ? `Perfect +${pts}` : '+' + pts);
      api.after(1100, () => { level++; lock = false; setup(); });
    }
  }
  api.on(board, 'click', e => { const p = e.target.closest('.rt-peg'); if (p) { tap(+p.dataset.k); p.blur(); } });
  api.key((k, e) => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < 3 && !e.repeat) tap(i); });
  const cur = api.cursor(() => [...board.children], () => 3, i => tap(i));
  api.probe = () => ({ pegs: pegs.map(p => p.slice()), n, level, lock, held, moves });
  api.loop(dt => {
    if (!lock) timeLeft -= dt;
    bar.style.width = Math.max(0, Math.min(1, timeLeft / TIME) * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`You moved ${level - 1} tower${level === 2 ? '' : 's'}.`);
  });
  setup();
} });
