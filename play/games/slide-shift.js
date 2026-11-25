/* Slide Shift · ZBZGames™ original. Slide the tiles back into order, 1 to 15, in as few moves as you can. */
ZBZ.register({ start(api) {
  const N = 4;
  let t = [...Array(15).keys()].map(i => i + 1).concat(0), moves = 0;
  const solvable = a => { const flat = a.filter(Boolean); let inv = 0; for (let i = 0; i < flat.length; i++) for (let j = i + 1; j < flat.length; j++) if (flat[i] > flat[j]) inv++; const blankRowFromBottom = N - Math.floor(a.indexOf(0) / N); return (inv + blankRowFromBottom) % 2 === 1; };
  const solved = a => a.every((v, i) => v === (i === 15 ? 0 : i + 1));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } };
  do { shuffle(t); } while (!solvable(t) || solved(t));
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap'; wrap.style.width = 'min(92%, 430px, 62vh)';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Moves <b class="ss-moves">0</b></span><span class="g-chip">In place <b class="ss-ok">0</b>/15</span></div><div class="mm-board ss-board" style="width:100%"></div>`;
  api.stage.appendChild(wrap);
  const board = wrap.querySelector('.ss-board'), movesEl = wrap.querySelector('.ss-moves'), okEl = wrap.querySelector('.ss-ok');
  const draw = () => {
    board.innerHTML = t.map((v, i) => `<button type="button" class="mm-t ss-t" data-i="${i}" data-v="${v}" style="--hue:${v ? (v === i + 1 ? 150 : (v * 9 + 215) % 360) : 0}" ${v ? `aria-label="Tile ${v}"` : 'tabindex="-1" aria-hidden="true"'}>${v || ''}</button>`).join('');
    movesEl.textContent = moves; okEl.textContent = t.filter((v, i) => v && v === i + 1).length;
  };
  function slide(i) {
    const z = t.indexOf(0), zr = Math.floor(z / N), zc = z % N, r = Math.floor(i / N), c = i % N;
    if (i === z || (r !== zr && c !== zc)) return;
    const step = r === zr ? (c < zc ? -1 : 1) : (r < zr ? -N : N);
    for (let k = z; k !== i; k += step) [t[k], t[k + step]] = [t[k + step], t[k]];
    moves++; api.sfx('tap'); draw();
    if (solved(t)) {
      const secs = Math.round(api.time());
      api.score(Math.max(50, 1000 - moves * 5 - secs * 2));
      api.end(`Solved in ${moves} moves and ${secs} seconds.`);
    }
  }
  api.on(board, 'click', e => { const b = e.target.closest('.ss-t'); if (b) slide(+b.dataset.i); });
  api.key(k => {
    const z = t.indexOf(0), zr = Math.floor(z / N), zc = z % N;
    const m = { ArrowLeft: zc < N - 1 ? z + 1 : -1, ArrowRight: zc > 0 ? z - 1 : -1, ArrowUp: zr < N - 1 ? z + N : -1, ArrowDown: zr > 0 ? z - N : -1 }[k];
    if (m !== undefined && m >= 0) slide(m);
  });
  api.probe = () => ({ tiles: t.slice(), set(a) { t = a.slice(); draw(); } });
  draw();
} });
