/* Letter Hunt · ZBZGames™ original. Words hide in the grid: across, down and on the slant. Drag from the first letter to the last to catch each one. */
ZBZ.register({ start(api) {
  const N = 8, TIME = 120;
  const POOL = 'APPLE MANGO LEMON GRAPE PEACH MELON BERRY TIGER HORSE ZEBRA CAMEL EAGLE SHARK WHALE MOUSE RIVER OCEAN CLOUD STORM RAIN SNOW WIND MOON STAR PLANET COMET ROCKET ROBOT PIXEL GAME SCORE LEVEL BONUS PUZZLE MAZE QUEST HERO CROWN SWORD SHIELD CASTLE BRIDGE GARDEN FLOWER FOREST ISLAND BEACH MUSIC DRUM PIANO SONG DANCE BREAD HONEY SUGAR RICE BOOK PAPER CLOCK LIGHT'.split(' ');
  const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  let grid = [], words = [], level = 1, timeLeft = TIME, lock = false, found = 0, anchor = -1, down = -1, drag = false, cells = [];
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap lh-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Board <b class="lh-l">1</b></span><span class="g-chip"><b class="lh-s">${TIME}</b>s</span></div><div class="qz-time"><i></i></div><div class="lh-grid"></div><div class="lh-words"></div>`;
  api.stage.appendChild(wrap);
  const gEl = wrap.querySelector('.lh-grid'), wEl = wrap.querySelector('.lh-words'), bar = wrap.querySelector('.qz-time i'), lEl = wrap.querySelector('.lh-l'), sEl = wrap.querySelector('.lh-s');
  function build() {
    lock = false; anchor = -1; down = -1; drag = false;
    grid = Array(N * N).fill(''); words = [];
    const pool = POOL.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    for (const wd of pool) {
      if (words.length >= 6) break;
      for (let tries = 0; tries < 60; tries++) {
        const [dr, dc] = api.pick(DIRS), r0 = Math.floor(Math.random() * N), c0 = Math.floor(Math.random() * N), r1 = r0 + dr * (wd.length - 1), c1 = c0 + dc * (wd.length - 1);
        if (r1 < 0 || r1 >= N || c1 >= N) continue;
        const at = [...wd].map((_, k) => (r0 + dr * k) * N + c0 + dc * k);
        if (at.some((p, k) => grid[p] && grid[p] !== wd[k])) continue;
        at.forEach((p, k) => { grid[p] = wd[k]; }); words.push({ w: wd, cells: at, found: false }); break;
      }
    }
    for (let i = 0; i < N * N; i++) if (!grid[i]) grid[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    gEl.innerHTML = grid.map((ch, i) => `<button type="button" class="lh-c" data-i="${i}">${ch}</button>`).join('');
    cells = [...gEl.children];
    wEl.innerHTML = words.map((x, i) => `<span data-w="${i}">${x.w}</span>`).join('');
    lEl.textContent = level;
  }
  // the squares in a straight line from a to b, or null when they do not line up
  function line(a, b) {
    const r0 = Math.floor(a / N), c0 = a % N, dr = Math.floor(b / N) - r0, dc = b % N - c0, len = Math.max(Math.abs(dr), Math.abs(dc));
    if (!len || (dr && dc && Math.abs(dr) !== Math.abs(dc))) return null;
    return Array.from({ length: len + 1 }, (_, k) => (r0 + Math.sign(dr) * k) * N + c0 + Math.sign(dc) * k);
  }
  function show(list) { cells.forEach((el, i) => el.classList.toggle('sel', !!list && list.includes(i))); if (anchor >= 0 && cells[anchor]) cells[anchor].classList.add('sel'); }
  function attempt(a, b) {
    const at = line(a, b); show(null);
    if (!at) return;
    const s = at.map(i => grid[i]).join(''), rev = [...s].reverse().join('');
    const hit = words.find(x => !x.found && (x.w === s || x.w === rev));
    if (!hit) { api.sfx('bad'); return; }
    hit.found = true; found++; hit.cells = at;
    at.forEach(i => cells[i].classList.add('got')); wEl.children[words.indexOf(hit)].classList.add('found');
    api.add(10); api.sfx('point'); timeLeft = Math.min(TIME, timeLeft + 4); api.pop(cells[at[Math.floor(at.length / 2)]], '#3ddc84', hit.w + ' +10');
    if (words.every(x => x.found)) {
      lock = true; api.add(20); api.sfx('win'); timeLeft = Math.min(TIME, timeLeft + 15);
      api.after(900, () => { api.pop(gEl, '#ffd23f', 'Board clear +20'); });
      api.after(1500, () => { level++; build(); kbd.paint(); });
    }
  }
  const under = e => { const el = document.elementFromPoint(e.clientX, e.clientY), c = el && el.closest ? el.closest('.lh-c') : null; return c && gEl.contains(c) ? +c.dataset.i : -1; };
  api.on(gEl, 'pointerdown', e => { const c = e.target.closest('.lh-c'); if (!c || lock) return; e.preventDefault(); down = +c.dataset.i; drag = false; if (anchor < 0) show([down]); });
  api.on(window, 'pointermove', e => { if (down < 0 || lock) return; const j = under(e); if (j >= 0 && j !== down) { drag = true; anchor = -1; show(line(down, j) || [down]); } });
  api.on(window, 'pointerup', e => {
    if (down < 0 || lock) { down = -1; return; }
    const a = down; let j = under(e); if (j < 0 && e.target && e.target.closest) { const c = e.target.closest('.lh-c'); if (c) j = +c.dataset.i; }
    down = -1;
    if (drag) { drag = false; if (j >= 0) attempt(a, j); else show(null); }
    else tapped(a);
  });
  function tapped(i) {
    if (lock) return;
    if (anchor < 0) { anchor = i; show(null); api.note(440, .05, .04); }
    else if (anchor === i) { anchor = -1; show(null); }
    else { const a = anchor; anchor = -1; attempt(a, i); }
  }
  const kbd = api.cursor(() => cells, () => N, i => tapped(i));
  api.probe = () => ({ n: N, grid: grid.slice(), words: words.map(x => ({ w: x.w, cells: x.cells.slice(), found: x.found })), level, lock });
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / TIME * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`You caught ${found} word${found === 1 ? '' : 's'}.`);
  });
  build();
} });
