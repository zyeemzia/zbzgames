/* Math Sprint · ZBZGames™ original, for kids and grown-ups. Answer as many sums as you can in 60 seconds. */
ZBZ.register({ start(api) {
  let timeLeft = 60, level = 1, right = 0, q;
  const wrap = document.createElement('div');
  wrap.className = 'qz-wrap';
  wrap.innerHTML = `<div class="qz-time"><i></i></div><div class="qz-q" aria-live="polite"></div><div class="qz-opts"></div>`;
  api.stage.appendChild(wrap);
  const qEl = wrap.querySelector('.qz-q'), opts = wrap.querySelector('.qz-opts'), bar = wrap.querySelector('.qz-time i');
  const ri = (a, b) => Math.floor(api.rand(a, b + 1));
  function make() {
    const ops = level < 3 ? ['+', '−'] : level < 6 ? ['+', '−', '×'] : ['+', '−', '×', '÷'];
    const op = api.pick(ops), top = 5 + level * 3;
    let a = ri(1, top), b = ri(1, top), ans;
    if (op === '+') ans = a + b;
    if (op === '−') { if (b > a) [a, b] = [b, a]; ans = a - b; }
    if (op === '×') { a = ri(2, Math.min(12, 3 + level)); b = ri(2, 10); ans = a * b; }
    if (op === '÷') { b = ri(2, 10); ans = ri(2, 10); a = b * ans; }
    const set = new Set([ans]);
    while (set.size < 4) set.add(Math.max(0, ans + ri(-6, 6) || ans + set.size));
    q = { text: `${a} ${op} ${b}`, ans, opts: [...set].sort(() => Math.random() - .5) };
    qEl.textContent = q.text + ' = ?';
    opts.innerHTML = q.opts.map((v, i) => `<button type="button" class="qz-o" data-v="${v}"><small>${i + 1}</small>${v}</button>`).join('');
  }
  function pick(v, btn) {
    if (v === q.ans) { right++; api.add(level); api.sfx('point'); if (right % 5 === 0) level++; btn && btn.classList.add('ok'); api.after(160, make); }
    else { timeLeft = Math.max(0, timeLeft - 3); api.sfx('bad'); btn && btn.classList.add('no'); }
  }
  api.on(opts, 'click', e => { const b = e.target.closest('.qz-o'); if (b && !b.classList.contains('no')) pick(+b.dataset.v, b); });
  api.key(k => { const i = +k - 1; if (i >= 0 && i < 4 && q) pick(q.opts[i], opts.children[i]); });
  api.loop(dt => {
    timeLeft -= dt;
    bar.style.width = Math.max(0, timeLeft / 60 * 100) + '%';
    if (timeLeft <= 0) api.end(`${right} correct answers. Level ${level} reached.`);
  });
  make();
} });
