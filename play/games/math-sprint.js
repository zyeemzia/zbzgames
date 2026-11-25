/* Math Sprint · ZBZGames™ original, for kids and grown-ups. Answer as many sums as you can in 60 seconds. */
ZBZ.register({ start(api) {
  let timeLeft = 60, level = 1, right = 0, streak = 0, q = null, lock = false;
  const wrap = document.createElement('div');
  wrap.className = 'qz-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Level <b class="qz-lv">1</b></span><span class="g-chip">Streak <b class="qz-st">0</b></span><span class="g-chip"><b class="qz-s">60</b>s</span></div><div class="qz-time"><i></i></div><div class="qz-q" aria-live="polite"></div><div class="qz-opts"></div>`;
  api.stage.appendChild(wrap);
  const qEl = wrap.querySelector('.qz-q'), opts = wrap.querySelector('.qz-opts'), bar = wrap.querySelector('.qz-time i');
  const lvEl = wrap.querySelector('.qz-lv'), stEl = wrap.querySelector('.qz-st'), sEl = wrap.querySelector('.qz-s');
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
    for (let n = 0; set.size < 4; n++) set.add(n > 40 ? ans + set.size : Math.max(0, ans + ri(-6, 6)));
    const list = [...set];
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    q = { ans, opts: list };
    qEl.textContent = `${a} ${op} ${b} = ?`;
    qEl.style.animation = 'none'; void qEl.offsetWidth; qEl.style.animation = '';
    opts.innerHTML = q.opts.map((v, i) => `<button type="button" class="qz-o" data-v="${v}"><small>${i + 1}</small>${v}</button>`).join('');
    lock = false;
  }
  function pick(v, btn) {
    // One answer per question: a double tap or a held key cannot score twice.
    if (lock || !btn || btn.classList.contains('no')) return;
    if (v === q.ans) {
      lock = true; right++; streak++; api.add(level); api.sfx('point'); btn.classList.add('ok'); api.pop(btn, '#3ddc84', '+' + level);
      if (right % 5 === 0) { level++; lvEl.textContent = level; }
      api.after(170, make);
    } else { streak = 0; timeLeft = Math.max(0, timeLeft - 3); api.sfx('bad'); btn.classList.add('no'); api.pop(btn, '#ff5470', '−3s'); }
    stEl.textContent = streak;
  }
  api.on(opts, 'click', e => { const b = e.target.closest('.qz-o'); if (b) { pick(+b.dataset.v, b); b.blur(); } });
  api.key(k => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < 4 && q) pick(q.opts[i], opts.children[i]); });
  api.loop(dt => {
    timeLeft -= dt;
    bar.style.width = Math.max(0, timeLeft / 60 * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`${right} correct answers. Level ${level} reached.`);
  });
  make();
} });
