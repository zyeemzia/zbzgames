/* Shadow Safari · ZBZGames™ original, for kids. An animal hides as a shadow. Tap the animal that makes that shadow. */
ZBZ.register({ start(api) {
  const ANIMALS = [['🐘', 'elephant'], ['🦒', 'giraffe'], ['🐪', 'camel'], ['🐢', 'turtle'], ['🐇', 'rabbit'], ['🐓', 'rooster'], ['🦆', 'duck'], ['🦉', 'owl'],
    ['🐍', 'snake'], ['🐬', 'dolphin'], ['🐳', 'whale'], ['🦀', 'crab'], ['🦋', 'butterfly'], ['🐌', 'snail'], ['🐎', 'horse'], ['🐄', 'cow'],
    ['🐖', 'pig'], ['🐑', 'sheep'], ['🦌', 'deer'], ['🐒', 'monkey'], ['🐧', 'penguin'], ['🦈', 'shark'], ['🐊', 'crocodile'], ['🦏', 'rhino']];
  const ROUNDS = 10;
  let round = 0, right = 0, first = true, lock = false, ans = -1, opts = [], used = [];
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap'; wrap.style.width = 'min(94%, 480px)';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Shadow <b class="sh-r">1</b>/${ROUNDS}</span><span class="g-chip">⭐ <b class="sh-ok">0</b></span></div><p class="g-msg" aria-live="polite"></p><div class="sh-plate"><span class="sh-shape"></span></div><div class="sh-opts"></div>`;
  api.stage.appendChild(wrap);
  const shape = wrap.querySelector('.sh-shape'), optEl = wrap.querySelector('.sh-opts'), msg = wrap.querySelector('.g-msg'), rEl = wrap.querySelector('.sh-r'), okEl = wrap.querySelector('.sh-ok');
  function next() {
    round++; first = true; lock = false;
    let a; do { a = Math.floor(Math.random() * ANIMALS.length); } while (used.includes(a));
    used.push(a);
    const set = new Set([a]); while (set.size < 4) set.add(Math.floor(Math.random() * ANIMALS.length));
    opts = [...set];
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    ans = opts.indexOf(a);
    shape.textContent = ANIMALS[a][0]; shape.className = 'sh-shape dark';
    shape.style.animation = 'none'; void shape.offsetWidth; shape.style.animation = '';
    optEl.innerHTML = opts.map((o, i) => `<button type="button" class="oo-c" data-i="${i}" aria-label="${ANIMALS[o][1]}"><small>${i + 1}</small>${ANIMALS[o][0]}</button>`).join('');
    msg.textContent = 'Whose shadow is this?'; rEl.textContent = round;
  }
  function pick(i) {
    const btn = optEl.children[i];
    if (lock || !btn || btn.classList.contains('no')) return;
    if (i === ans) {
      lock = true; btn.classList.add('ok'); shape.className = 'sh-shape';      // the shadow steps into the light
      if (first) { right++; okEl.textContent = right; }
      api.add(first ? 10 : 4); api.sfx(first ? 'star' : 'point'); api.pop(btn, '#3ddc84', first ? '⭐' : '👍');
      msg.textContent = `It is the ${ANIMALS[opts[i]][1]}!`;
      api.after(1300, () => { if (round >= ROUNDS) api.end(`${right} of ${ROUNDS} shadows named first time. ${right >= 8 ? 'A real safari guide!' : 'Look at the shape once more next time!'}`); else next(); });
    } else { first = false; btn.classList.add('no'); api.sfx('bad'); msg.textContent = `Not the ${ANIMALS[opts[i]][1]}. Look at the shape.`; }
  }
  api.on(optEl, 'click', e => { const b = e.target.closest('.oo-c'); if (b) { pick(+b.dataset.i); b.blur(); } });
  api.key((k, e) => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < 4 && !e.repeat) pick(i); });
  api.cursor(() => [...optEl.children], () => 2, i => pick(i));
  api.probe = () => ({ ans, lock });
  next();
} });
