/* Number Nest · ZBZGames™ original. A small sudoku: every row, column and box holds each number once. Starts 4 by 4, then grows to 6 by 6. */
ZBZ.register({ start(api) {
  let n = 4, bw = 2, bh = 2, sol = [], cur = [], given = [], sel = -1, hearts = 3, puzzle = 1, lock = false, bad = -1;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap nn-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Puzzle <b class="nn-p">1</b></span><span class="g-chip nn-h" aria-label="Hearts"></span></div><div class="nn-grid"></div><div class="nn-pad"></div><p class="g-sub">Tap an empty square, then its number. A wrong number costs a heart.</p>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.nn-grid'), pad = wrap.querySelector('.nn-pad'), pEl = wrap.querySelector('.nn-p'), hEl = wrap.querySelector('.nn-h');
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fits = (g, i, d) => {
    const r = Math.floor(i / n), c = i % n, br = r - r % bh, bc = c - c % bw;
    for (let k = 0; k < n; k++) if (g[r * n + k] === d || g[k * n + c] === d) return false;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (g[(br + y) * n + bc + x] === d) return false;
    return true;
  };
  // how many ways the grid can be finished, counted up to two
  function count(g) {
    const i = g.indexOf(0);
    if (i < 0) return 1;
    let total = 0;
    for (let d = 1; d <= n && total < 2; d++) if (fits(g, i, d)) { g[i] = d; total += count(g); g[i] = 0; }
    return total;
  }
  function make() {
    n = puzzle > 2 ? 6 : 4; bw = n === 6 ? 3 : 2; bh = 2;
    // a valid pattern, then rows, columns and numbers shuffled so every puzzle is different
    const groups = (size, step) => shuffle(Array.from({ length: size / step }, (_, g) => g)).flatMap(g => shuffle(Array.from({ length: step }, (_, k) => g * step + k)));
    const rws = groups(n, bh), cls = groups(n, bw), nums = shuffle(Array.from({ length: n }, (_, k) => k + 1));
    sol = []; for (const r of rws) for (const c of cls) sol.push(nums[(bw * (r % bh) + Math.floor(r / bh) + c) % n]);
    cur = sol.slice();
    const want = n === 4 ? Math.min(10, 5 + puzzle * 2) : Math.min(22, 12 + puzzle * 2);
    let out = 0;
    for (const i of shuffle(Array.from({ length: n * n }, (_, k) => k))) {
      if (out >= want) break;
      const keep = cur[i]; cur[i] = 0;
      if (count(cur.slice()) === 1) out++; else cur[i] = keep;       // only one answer may remain
    }
    given = cur.map(v => v > 0); sel = cur.indexOf(0); bad = -1;
    grid.style.setProperty('--n', n);
    pad.innerHTML = Array.from({ length: n }, (_, k) => `<button type="button" class="nn-k" data-d="${k + 1}" aria-label="Number ${k + 1}">${k + 1}</button>`).join('');
    draw();
  }
  function draw() {
    const same = sel >= 0 ? cur[sel] : 0;
    grid.innerHTML = cur.map((v, i) => {
      const r = Math.floor(i / n), c = i % n;
      return `<button type="button" class="nn-c${given[i] ? ' given' : ''}${i === sel ? ' sel' : ''}${i === bad ? ' shake no' : ''}${(c + 1) % bw === 0 && c < n - 1 ? ' br' : ''}${(r + 1) % bh === 0 && r < n - 1 ? ' bb' : ''}" data-i="${i}" aria-label="Row ${r + 1}, column ${c + 1}: ${v || 'empty'}">${v || ''}</button>`;
    }).join('');
    pEl.textContent = puzzle; hEl.textContent = '❤'.repeat(Math.max(0, hearts)) + '♡'.repeat(Math.max(0, 3 - hearts));
    [...pad.children].forEach(k => { k.disabled = cur.filter(v => v === +k.dataset.d).length >= n; });
    kb.paint();
  }
  function put(d) {
    if (lock || !api.alive || d < 1 || d > n) return;
    if (kb.i >= 0 && !cur[kb.i]) sel = kb.i;
    if (sel < 0 || cur[sel]) { sel = cur.indexOf(0); draw(); if (sel < 0) return; }
    if (d !== sol[sel]) {
      hearts--; bad = sel; api.sfx('bad'); draw(); bad = -1;
      if (hearts <= 0) { lock = true; api.after(700, () => api.end(`You finished ${puzzle - 1} puzzle${puzzle === 2 ? '' : 's'}.`)); }
      return;
    }
    cur[sel] = d; api.add(5); api.sfx('point');
    const was = sel;
    // carry on with the next empty square
    sel = -1; for (let k = 1; k <= n * n; k++) { const j = (was + k) % (n * n); if (!cur[j]) { sel = j; break; } }
    draw(); api.pop(grid.children[was], '#3ddc84');
    if (sel < 0) {
      lock = true; api.add(20 + n * 5); api.sfx('win'); api.fx.confetti();
      api.after(1300, () => { puzzle++; lock = false; make(); });
    }
  }
  api.on(grid, 'click', e => { const c = e.target.closest('.nn-c'); if (c && !lock) { const i = +c.dataset.i; if (!cur[i]) { sel = i; api.sfx('tap'); draw(); } c.blur(); } });
  api.on(pad, 'click', e => { const k = e.target.closest('.nn-k'); if (k) { put(+k.dataset.d); k.blur(); } });
  api.key((k, e) => { const d = +k; if (k !== ' ' && d >= 1 && d <= 9 && !e.repeat) put(d); });
  const kb = api.cursor(() => [...grid.children], () => n, i => { if (!cur[i] && !lock) { sel = i; draw(); } });
  api.probe = () => ({ n, sol: sol.slice(), cur: cur.slice(), hearts, puzzle, lock, sel });
  make();
} });
