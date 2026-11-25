/* Colour Clash · ZBZGames™ original. A colour word is printed in a different ink. Answer what the rule asks, not what your eyes shout. */
ZBZ.register({ start(api) {
  const COLS = [['Red', '#ff4d5e'], ['Blue', '#4d8dff'], ['Green', '#2fd67b'], ['Yellow', '#ffd23f']];
  const TIME = 45;
  let timeLeft = TIME, right = 0, streak = 0, word = 0, ink = 0, rule = 'ink', lock = false;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Right <b class="cc-n">0</b></span><span class="g-chip">Streak <b class="cc-st">0</b></span><span class="g-chip"><b class="cc-s">${TIME}</b>s</span></div><div class="qz-time"><i></i></div><p class="cc-rule" aria-live="polite"></p><div class="cc-word"></div><div class="cc-opts">${COLS.map(([n, c], i) => `<button type="button" class="cc-o" data-i="${i}" style="--c:${c}"><small>${i + 1}</small><i></i>${n}</button>`).join('')}</div>`;
  api.stage.appendChild(wrap);
  const ruleEl = wrap.querySelector('.cc-rule'), wordEl = wrap.querySelector('.cc-word'), opts = wrap.querySelector('.cc-opts'), bar = wrap.querySelector('.qz-time i');
  const nEl = wrap.querySelector('.cc-n'), stEl = wrap.querySelector('.cc-st'), sEl = wrap.querySelector('.cc-s');
  function next() {
    const lastWord = word, lastInk = ink;
    do {
      word = Math.floor(Math.random() * 4);
      ink = Math.random() < .25 ? word : (word + 1 + Math.floor(Math.random() * 3)) % 4;
    } while (word === lastWord && ink === lastInk);
    // After a warm-up the rule itself starts to switch.
    rule = right >= 8 && Math.random() < .35 ? 'word' : 'ink';
    ruleEl.innerHTML = rule === 'ink' ? 'Tap the <b>ink colour</b>' : 'Tap what the <b>word says</b>';
    wordEl.textContent = COLS[word][0].toUpperCase(); wordEl.style.color = COLS[ink][1];
    wordEl.style.animation = 'none'; void wordEl.offsetWidth; wordEl.style.animation = '';
    lock = false;
  }
  function pick(i) {
    const btn = opts.children[i];
    if (lock || !btn) return;
    if (i === (rule === 'ink' ? ink : word)) {
      lock = true; right++; streak++;
      const pts = 1 + Math.floor(streak / 5);
      api.add(pts); api.sfx('point'); api.pop(btn, COLS[i][1], '+' + pts);
      api.after(120, next);
    } else {
      streak = 0; timeLeft -= 3; api.sfx('bad'); api.pop(btn, '#ff5470', '−3s');
      wordEl.classList.remove('shake'); void wordEl.offsetWidth; wordEl.classList.add('shake');
    }
    nEl.textContent = right; stEl.textContent = streak;
  }
  api.on(opts, 'pointerdown', e => { const b = e.target.closest('.cc-o'); if (b) { e.preventDefault(); pick(+b.dataset.i); } });
  api.key((k, e) => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < 4 && !e.repeat) pick(i); });
  api.loop(dt => {
    timeLeft -= dt; bar.style.width = Math.max(0, timeLeft / TIME * 100) + '%'; sEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) api.end(`${right} right answers. Your eyes and brain make a good team.`);
  });
  next();
} });
