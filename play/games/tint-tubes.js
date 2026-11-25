/* Tint Tubes · ZBZGames™ original. Pour colours between tubes until every tube holds a single colour. */
ZBZ.register({ start(api) {
  const COLS = ['#ff5470', '#4d8dff', '#3ddc84', '#ffd23f', '#a78bfa', '#ff9f43', '#56e0ff'];
  const NAMES = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'aqua'];
  const CAP = 4;
  let level = 1, tubes = [], sel = -1, moves = 0, history = [], undos = 3, lock = false, sorted = 0, fresh = null;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap'; wrap.style.width = 'min(96%, 560px)';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Level <b class="tt-lv">1</b></span><span class="g-chip">Moves <b class="tt-mv">0</b></span><button type="button" class="g-btn tt-undo">↶ Undo (3)</button><button type="button" class="g-btn tt-end">Finish</button></div><div class="tt-rack"></div><p class="g-sub">Tap a tube, then the tube to pour into. Only matching colours stack.</p>`;
  api.stage.appendChild(wrap);
  const rack = wrap.querySelector('.tt-rack'), lvEl = wrap.querySelector('.tt-lv'), mvEl = wrap.querySelector('.tt-mv'), undoBtn = wrap.querySelector('.tt-undo'), endBtn = wrap.querySelector('.tt-end');
  const top = t => t[t.length - 1];
  const whole = t => t.length === CAP && t.every(c => c === t[0]);
  const plain = t => t.every(c => c === t[0]);
  const isDone = T => T.every(t => !t.length || whole(t));
  const can = (T, a, b) => a !== b && T[a].length > 0 && T[b].length < CAP && (!T[b].length || top(T[b]) === top(T[a]));
  function pour(T, a, b) { const c = top(T[a]); let n = 0; while (T[a].length && top(T[a]) === c && T[b].length < CAP) { T[b].push(T[a].pop()); n++; } return n; }
  // A bounded search: a deal is only used when it is known to have a solution.
  function solvable(start) {
    const key = T => T.map(t => t.join('')).sort().join('|');
    const seen = new Set([key(start)]), todo = [start];
    let budget = 15000;
    while (todo.length && budget-- > 0) {
      const T = todo.pop();
      if (isDone(T)) return true;
      for (let a = 0; a < T.length; a++) {
        if (!T[a].length || whole(T[a])) continue;
        for (let b = 0; b < T.length; b++) {
          if (!can(T, a, b) || (!T[b].length && plain(T[a]))) continue;
          const U = T.map(t => t.slice()); pour(U, a, b);
          const k = key(U); if (!seen.has(k)) { seen.add(k); todo.push(U); }
        }
      }
    }
    return false;
  }
  function deal() {
    const k = Math.min(COLS.length, 2 + level);
    let tries = 0;
    do {
      const units = []; for (let c = 0; c < k; c++) for (let i = 0; i < CAP; i++) units.push(c);
      for (let i = units.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [units[i], units[j]] = [units[j], units[i]]; }
      tubes = Array.from({ length: k }, (_, i) => units.slice(i * CAP, i * CAP + CAP)).concat([[], []]);
    } while (++tries < 30 && (isDone(tubes) || tubes.some(whole) || !solvable(tubes)));
    sel = -1; moves = 0; history = []; undos = 3; fresh = null; draw();
  }
  function draw() {
    rack.innerHTML = tubes.map((t, i) => `<button type="button" class="tt-tube${i === sel ? ' sel' : ''}${whole(t) ? ' full' : ''}" data-i="${i}" aria-label="Tube ${i + 1}: ${t.length ? t.map(c => NAMES[c]).join(', ') : 'empty'}"><small>${i + 1}</small>${t.map((c, k) => `<i class="${fresh && fresh.b === i && k >= t.length - fresh.n ? 'in' : ''}" style="--c:${COLS[c]}"></i>`).join('')}</button>`).join('');
    lvEl.textContent = level; mvEl.textContent = moves;
    undoBtn.textContent = `↶ Undo (${undos})`; undoBtn.disabled = !history.length || !undos || lock;
    fresh = null;
  }
  function choose(i) {
    if (lock || i < 0 || i >= tubes.length) return;
    if (sel < 0) { if (tubes[i].length && !whole(tubes[i])) { sel = i; api.sfx('tap'); } }
    else if (sel === i) sel = -1;
    else if (can(tubes, sel, i)) {
      history.push(tubes.map(t => t.slice()));
      const n = pour(tubes, sel, i); fresh = { b: i, n }; sel = -1; moves++; api.sfx('pop');
      draw();
      if (whole(tubes[i])) { api.sfx('star'); api.pop(rack.children[i], COLS[tubes[i][0]]); }
      if (isDone(tubes)) {
        lock = true; sorted++;
        const pts = 30 + level * 10 + Math.max(0, 30 - moves);
        api.add(pts); api.sfx('win'); api.fx.text(api.stage.clientWidth / 2, api.stage.clientHeight * .3, 'Sorted! +' + pts, '#ffd23f', 30);
        draw();
        api.after(1200, () => { level++; lock = false; deal(); });
      } else if (!tubes.some((_, a) => tubes.some((__, b) => can(tubes, a, b)))) {
        if (undos && history.length) wrap.querySelector('.g-sub').textContent = 'No pour left. Undo a move, or finish the run.';
        else { lock = true; api.end(`No pour left. Levels sorted: ${sorted}.`); }
      }
      return;
    } else if (tubes[i].length && !whole(tubes[i])) { sel = i; api.sfx('tap'); }
    else { api.sfx('bad'); const el = rack.children[i]; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); return; }
    draw();
  }
  function undo() {
    if (lock || !history.length || !undos) return;
    tubes = history.pop(); undos--; sel = -1; moves++; api.sfx('tap'); draw();
  }
  api.on(rack, 'click', e => { const b = e.target.closest('.tt-tube'); if (b) choose(+b.dataset.i); });
  api.on(undoBtn, 'click', () => { undo(); undoBtn.blur(); });
  api.on(endBtn, 'click', () => { if (!lock) api.end(`Levels sorted: ${sorted}.`); });
  api.key(k => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < 9) choose(i); else if (k === 'u' || k === 'U' || k === 'Backspace') undo(); });
  deal();
} });
