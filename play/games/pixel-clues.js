/* Pixel Clues · ZBZGames™ original. The numbers beside each row and above each column tell how many squares in a line are filled. Work out the picture. */
ZBZ.register({ start(api) {
  const TIME = 150;
  let n = 5, level = 1, sol = [], cur = [], timeLeft = TIME, lock = false, mark = false, solved = 0;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap pc-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Picture <b class="pc-l">1</b></span><span class="g-chip"><b class="pc-s">${TIME}</b>s</span><button type="button" class="g-btn pc-mode" aria-pressed="false">✕ Mark empty</button></div><div class="qz-time"><i></i></div><div class="pc-board"></div><p class="g-sub">A clue of 2 1 means a run of two, a gap, then one.</p>`;
  api.stage.appendChild(wrap);
  const board = wrap.querySelector('.pc-board'), bar = wrap.querySelector('.qz-time i'), lEl = wrap.querySelector('.pc-l'), sEl = wrap.querySelector('.pc-s'), modeBtn = wrap.querySelector('.pc-mode');
  const runs = line => { const out = []; let k = 0; for (const v of line) { if (v === 1) k++; else if (k) { out.push(k); k = 0; } } if (k) out.push(k); return out.length ? out : [0]; };
  const rowOf = (g, r) => g.slice(r * n, r * n + n), colOf = (g, c) => g.filter((_, i) => i % n === c);
  let cells = [], tops = [], lefts = [];
  function build() {
    n = level <= 3 ? 5 : 6; lock = false;
    do { sol = Array.from({ length: n * n }, () => Math.random() < .56 ? 1 : 0); }
    while (Array.from({ length: n }, (_, i) => i).some(i => !rowOf(sol, i).includes(1) || !colOf(sol, i).includes(1)));
    cur = Array(n * n).fill(0);
    board.style.setProperty('--n', n);
    let html = '<span class="pc-corner"></span>';
    for (let c = 0; c < n; c++) html += `<span class="pc-top">${runs(colOf(sol, c)).join('<br>')}</span>`;
    for (let r = 0; r < n; r++) { html += `<span class="pc-left">${runs(rowOf(sol, r)).join(' ')}</span>`; for (let c = 0; c < n; c++) html += `<button type="button" class="pc-c" data-i="${r * n + c}" aria-label="Row ${r + 1}, column ${c + 1}"></button>`; }
    board.innerHTML = html;
    cells = [...board.querySelectorAll('.pc-c')]; tops = [...board.querySelectorAll('.pc-top')]; lefts = [...board.querySelectorAll('.pc-left')];
    lEl.textContent = level; check();
  }
  function check() {
    let all = true;
    for (let i = 0; i < n; i++) {
      const r = runs(rowOf(cur, i)).join() === runs(rowOf(sol, i)).join(), c = runs(colOf(cur, i)).join() === runs(colOf(sol, i)).join();
      lefts[i].classList.toggle('ok', r); tops[i].classList.toggle('ok', c); if (!r || !c) all = false;
    }
    return all;
  }
  function press(i, asMark) {
    if (lock || i < 0 || i >= n * n) return;
    const want = asMark ? 2 : 1;
    cur[i] = cur[i] === want ? 0 : want;
    cells[i].classList.toggle('on', cur[i] === 1); cells[i].classList.toggle('x', cur[i] === 2); cells[i].textContent = cur[i] === 2 ? '✕' : '';
    api.note(cur[i] === 1 ? 520 : 300, .06, .05);
    if (check()) {
      lock = true; solved++; const pts = n === 5 ? 20 : 35;
      api.add(pts); api.sfx('win'); timeLeft = Math.min(TIME, timeLeft + 30);
      cells.forEach((el, k) => { if (cur[k] === 1) el.classList.add('done'); });
      api.pop(board, '#ffd23f', 'Solved +' + pts);
      api.after(1200, () => { level++; build(); kbd.paint(); });
    }
  }
  api.on(board, 'pointerdown', e => { const c = e.target.closest('.pc-c'); if (c) { e.preventDefault(); press(+c.dataset.i, mark); } });
  api.on(modeBtn, 'click', () => { mark = !mark; modeBtn.setAttribute('aria-pressed', String(mark)); modeBtn.classList.toggle('on', mark); modeBtn.blur(); });
  const kbd = api.cursor(() => cells, () => n, i => press(i, false));
  api.key(k => { if ((k === 'x' || k === 'X') && kbd.i >= 0) press(kbd.i, true); });
  api.probe = () => ({ n, sol: sol.slice(), cur: cur.slice(), level, lock, time: timeLeft });
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / TIME * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`You worked out ${solved} picture${solved === 1 ? '' : 's'}.`);
  });
  build();
} });
