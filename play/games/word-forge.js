/* Word Forge · ZBZGames™ original. Find the hidden five-letter word in six tries.
   Gold: right letter, right place. Blue: in the word, elsewhere. Grey: not in the word.
   Solve one and the next word arrives; the run ends when a word beats you. */
ZBZ.register({ start(api) {
  const WORDS = ('apple brave chair dance eagle flame grape house input jolly knife lemon magic noble ocean piano queen river solar tiger unity voice whale youth zebra ' +
    'adapt badge cabin delta ember fable giant habit ivory jewel karma lunar maple nerve orbit pearl quest radar spark train ultra vivid world xenon yield zesty ' +
    'amber blaze cloud dream earth frost glide heart image judge koala laser medal night opera plant quiet robot smile torch urban vapor wheat young ' +
    'angle beach candy drift elbow fairy ghost honey index joint kiosk light money north olive pilot quick royal storm tower uncle venue water yacht ' +
    'arrow bread coral dwarf entry field grain human irony juice label mango nurse oasis peace raven sugar table unite video witty zonal ' +
    'alarm blend crown daisy equal focus green hotel ideal jumbo kneel logic metal novel otter pixel ranch shine thumb usher vital woven').split(' ').filter(w => w.length === 5);
  const ROWS = 6;
  let answer = api.pick(WORDS), row = 0, guess = '', solved = 0, busy = false;
  const status = {};
  const wrap = document.createElement('div');
  wrap.className = 'wf-wrap';
  wrap.innerHTML = `<div class="wf-grid"></div><p class="wf-msg" aria-live="polite"></p><div class="wf-keys"></div>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.wf-grid'), msg = wrap.querySelector('.wf-msg'), keys = wrap.querySelector('.wf-keys');
  const LAYOUT = ['qwertyuiop', 'asdfghjkl', '⏎zxcvbnm⌫'];
  function build() {
    grid.innerHTML = Array.from({ length: ROWS * 5 }, () => '<span class="wf-c"></span>').join('');
    keys.innerHTML = LAYOUT.map(r => `<div>${[...r].map(k => `<button type="button" data-k="${k}" class="${k === '⏎' || k === '⌫' ? 'wide' : ''}">${k === '⏎' ? 'Enter' : k}</button>`).join('')}</div>`).join('');
    Object.keys(status).forEach(k => delete status[k]);
  }
  const cell = (r, i) => grid.children[r * 5 + i];
  function show() { for (let i = 0; i < 5; i++) { const c = cell(row, i); c.textContent = guess[i] || ''; c.classList.toggle('fill', !!guess[i]); } }
  function submit() {
    if (guess.length < 5) { msg.textContent = 'Five letters, please.'; api.sfx('bad'); grid.classList.remove('shake'); void grid.offsetWidth; grid.classList.add('shake'); return; }
    const res = Array(5).fill('no'), pool = {};
    [...answer].forEach((ch, i) => { if (guess[i] === ch) res[i] = 'hit'; else pool[ch] = (pool[ch] || 0) + 1; });
    [...guess].forEach((ch, i) => { if (res[i] !== 'hit' && pool[ch]) { res[i] = 'near'; pool[ch]--; } });
    res.forEach((r, i) => {
      cell(row, i).classList.remove('fill'); cell(row, i).classList.add(r);
      const ch = guess[i], rank = { no: 0, near: 1, hit: 2 };
      if (!status[ch] || rank[r] > rank[status[ch]]) status[ch] = r;
    });
    keys.querySelectorAll('button').forEach(b => { const s = status[b.dataset.k]; if (s) b.className = (b.classList.contains('wide') ? 'wide ' : '') + s; });
    if (guess === answer) {
      solved++; api.add((ROWS - row) * 10); api.sfx('win'); for (let i = 0; i < 5; i++) api.pop(cell(row, i), '#ffd23f');
      msg.textContent = `Forged! “${answer.toUpperCase()}”. Next word…`;
      busy = true;
      api.after(1500, () => { let next; do { next = api.pick(WORDS); } while (next === answer); answer = next; row = 0; guess = ''; busy = false; msg.textContent = ''; build(); });
      return;
    }
    row++; guess = '';
    if (row >= ROWS) { api.end(`The word was “${answer.toUpperCase()}”. Words forged: ${solved}.`); return; }
    api.sfx('tap'); msg.textContent = `Try ${row + 1} of ${ROWS} · forged ${solved}`;
  }
  function press(k) {
    if (busy || !api.alive) return;
    if (k === '⏎' || k === 'Enter') return submit();
    if (k === '⌫' || k === 'Backspace') { guess = guess.slice(0, -1); return show(); }
    if (/^[a-z]$/i.test(k) && guess.length < 5) { guess += k.toLowerCase(); show(); }
  }
  api.on(keys, 'click', e => { const b = e.target.closest('button'); if (b) { press(b.dataset.k); b.blur(); } });
  api.key(k => press(k));
  api.probe = () => ({ answer, row, busy, words: WORDS });
  build();
} });
