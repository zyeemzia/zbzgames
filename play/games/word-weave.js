/* Word Weave · ZBZGames™ original. The letters are tangled. Weave them back into the word before the clock runs out. */
ZBZ.register({ start(api) {
  const SHORT = 'chair dance eagle flame house magic piano queen river tiger voice whale zebra brave ghost honey jewel knife light money olive robot train water world young candy fairy juice lucky music party quick sunny truck uncle video wagon yacht bloom cabin daisy fresh giant happy ivory jolly kiosk maple noble pixel royal solar tulip unity vivid'.split(' ');
  const LONG = 'planet garden bridge castle flower candle rocket jungle window pencil button monkey yellow orange purple violet travel hunter wisdom puzzle circle square mirror basket pocket bottle camera guitar island winter summer spring autumn bright frozen golden market palace school ticket tunnel valley wizard dragon knight magnet museum number parrot rabbit turtle cookie banana cherry tomato butter cheese dinner pillow hammer ladder anchor sailor'.split(' ');
  const ALL = new Set([...SHORT, ...LONG]);
  const TIME = 75;
  let timeLeft = TIME, word = '', letters = [], used = [], solved = 0, streak = 0, lock = false, seen = [];
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap'; wrap.style.width = 'min(96%, 480px)';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Words <b class="ww-n">0</b></span><span class="g-chip">Streak <b class="ww-st">0</b></span><span class="g-chip"><b class="ww-s">${TIME}</b>s</span></div><div class="qz-time"><i></i></div><div class="ww-slots" aria-live="polite"></div><p class="g-msg"></p><div class="ww-tiles"></div><div class="g-bar"><button type="button" class="g-btn ww-back">⌫ Back</button><button type="button" class="g-btn ww-mix">🔀 Shuffle</button><button type="button" class="g-btn ww-skip">Skip (−5s)</button></div>`;
  api.stage.appendChild(wrap);
  const slots = wrap.querySelector('.ww-slots'), tiles = wrap.querySelector('.ww-tiles'), msg = wrap.querySelector('.g-msg'), bar = wrap.querySelector('.qz-time i');
  const nEl = wrap.querySelector('.ww-n'), stEl = wrap.querySelector('.ww-st'), sEl = wrap.querySelector('.ww-s');
  const mix = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function scramble() { let n = 0; do { mix(letters); } while (letters.join('') === word && ++n < 20); }
  function draw() {
    slots.innerHTML = [...word].map((_, i) => `<span class="${used[i] !== undefined ? 'f' : ''}">${used[i] !== undefined ? letters[used[i]] : ''}</span>`).join('');
    slots.setAttribute('aria-label', used.map(i => letters[i]).join('') || 'empty');
    tiles.innerHTML = letters.map((ch, i) => `<button type="button" data-i="${i}" class="${used.includes(i) ? 'used' : ''}" ${used.includes(i) ? 'tabindex="-1"' : ''}>${ch}</button>`).join('');
    nEl.textContent = solved; stEl.textContent = streak;
  }
  function next() {
    const pool = solved < 4 ? SHORT : solved < 8 ? SHORT.concat(LONG) : LONG;
    do { word = api.pick(pool); } while (seen.includes(word));
    seen.push(word); if (seen.length > 30) seen.shift();
    letters = [...word]; used = []; lock = false; msg.textContent = '';
    scramble(); draw();
  }
  function check() {
    const guess = used.map(i => letters[i]).join('');
    if (guess === word || ALL.has(guess)) {
      lock = true; solved++; streak++; nEl.textContent = solved; stEl.textContent = streak;
      const pts = 10 + Math.min(10, (streak - 1) * 2) + (word.length > 5 ? 5 : 0);
      api.add(pts); api.sfx('win'); timeLeft = Math.min(TIME, timeLeft + 4);
      msg.textContent = 'Woven!'; [...slots.children].forEach(s => api.pop(s, '#ffd23f')); api.fx.text(api.stage.clientWidth / 2, api.center(slots)[1] - 40, '+' + pts, '#ffd23f', 28);
      api.after(900, next);
    } else {
      lock = true; streak = 0; api.sfx('bad'); msg.textContent = 'Not that one. Try again.'; stEl.textContent = 0;
      slots.classList.remove('shake'); void slots.offsetWidth; slots.classList.add('shake');
      api.after(450, () => { used = []; lock = false; draw(); });
    }
  }
  function take(i) {
    if (lock || used.includes(i) || used.length >= word.length) return;
    used.push(i); api.sfx('tap'); draw();
    if (used.length === word.length) check();
  }
  function back() { if (lock || !used.length) return; used.pop(); draw(); }
  api.on(tiles, 'click', e => { const b = e.target.closest('button'); if (b) take(+b.dataset.i); });
  api.on(wrap.querySelector('.ww-back'), 'click', e => { back(); e.currentTarget.blur(); });
  api.on(wrap.querySelector('.ww-mix'), 'click', e => {
    e.currentTarget.blur(); if (lock) return;
    // Shuffle only the tiles still waiting, so the letters already placed stay put.
    const free = letters.map((_, i) => i).filter(i => !used.includes(i)), chars = mix(free.map(i => letters[i]));
    free.forEach((i, k) => { letters[i] = chars[k]; }); api.sfx('tap'); draw();
  });
  api.on(wrap.querySelector('.ww-skip'), 'click', e => { e.currentTarget.blur(); if (lock) return; timeLeft -= 5; streak = 0; api.sfx('bad'); msg.textContent = `It was “${word.toUpperCase()}”.`; lock = true; api.after(900, next); });
  api.key((k, e) => {
    if (k === 'Backspace') { e.preventDefault(); return back(); }
    if (!/^[a-z]$/i.test(k)) return;
    const ch = k.toLowerCase(), i = letters.findIndex((c, j) => c === ch && !used.includes(j));
    if (i >= 0) take(i);
  });
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / TIME * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`Words woven: ${solved}. The last one was “${word.toUpperCase()}”.`);
  });
  api.probe = () => ({ word, lock });
  next();
} });
