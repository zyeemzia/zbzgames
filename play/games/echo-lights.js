/* Echo Lights · ZBZGames™ original, for kids and grown-ups. Watch the lights, then repeat the pattern. It grows by one each round. */
ZBZ.register({ start(api) {
  const PADS = [{ c: '#3ddc84', f: 330 }, { c: '#ff5470', f: 392 }, { c: '#ffd23f', f: 440 }, { c: '#4d8dff', f: 523 }];
  const seq = [];
  let pos = 0, listening = false;
  const wrap = document.createElement('div');
  wrap.className = 'el-wrap';
  wrap.innerHTML = `<p class="el-msg" aria-live="polite">Watch…</p><div class="el-grid">${PADS.map((p, i) => `<button class="el-pad" type="button" data-i="${i}" style="--c:${p.c}" aria-label="Light ${i + 1}"><small>${i + 1}</small></button>`).join('')}</div>`;
  api.stage.appendChild(wrap);
  const msg = wrap.querySelector('.el-msg'), pads = [...wrap.querySelectorAll('.el-pad')];
  let ac = null;
  function tone(f) {
    if (api.store.get('muted', false)) return;
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.setValueAtTime(.09, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + .35); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .4); } catch { /* no audio */ }
  }
  function flash(i, ms) { pads[i].classList.add('on'); tone(PADS[i].f); api.after(ms, () => pads[i].classList.remove('on')); }
  function round() {
    listening = false; pos = 0; seq.push(Math.floor(Math.random() * 4));
    msg.textContent = `Round ${seq.length}: watch…`;
    const gap = Math.max(260, 620 - seq.length * 25);
    seq.forEach((p, k) => api.after(500 + k * gap, () => flash(p, gap * .6)));
    api.after(500 + seq.length * gap, () => { listening = true; msg.textContent = 'Your turn!'; });
  }
  function press(i) {
    if (!listening) return;
    flash(i, 220);
    if (i !== seq[pos]) { listening = false; api.end(`You remembered ${seq.length - 1} in a row.`); return; }
    pos++;
    if (pos === seq.length) { api.score(seq.length); api.sfx('point'); listening = false; msg.textContent = 'Great!'; api.after(700, round); }
  }
  api.on(wrap, 'pointerdown', e => { const b = e.target.closest('.el-pad'); if (b) { e.preventDefault(); press(+b.dataset.i); } });
  api.key(k => { const i = +k - 1; if (i >= 0 && i < 4) press(i); });
  round();
} });
