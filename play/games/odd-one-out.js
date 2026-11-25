/* Odd One Out · ZBZGames™ original, for kids. Three things belong together and one does not. Tap the one that does not belong. */
ZBZ.register({ start(api) {
  const GROUPS = [
    ['fruit', ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍍', '🍒']], ['an animal', ['🐶', '🐱', '🐘', '🐒', '🐄', '🐑', '🐎', '🐇']],
    ['a vehicle', ['🚗', '🚌', '🚲', '🚂', '✈️', '🚁', '⛵', '🚀']], ['something to wear', ['👕', '👗', '👟', '🧦', '🎩', '👖', '🧤', '👒']],
    ['a sea creature', ['🐟', '🐬', '🐳', '🐙', '🦀', '🐠', '🦈', '🐡']], ['a musical instrument', ['🎸', '🎹', '🎺', '🎻', '🥁', '🎷']],
    ['a bird', ['🐦', '🦆', '🦉', '🐧', '🦜', '🐓', '🦅', '🦢']], ['a sport ball', ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐']],
    ['a vegetable', ['🥕', '🌽', '🥦', '🍆', '🥔', '🥒']], ['something in the sky', ['☀️', '🌙', '⭐', '☁️', '🌈', '⚡']]
  ];
  const ROUNDS = 10;
  let round = 0, right = 0, first = true, lock = false, odd = -1, group = '', lastG = -1;
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap'; wrap.style.width = 'min(94%, 480px)';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Round <b class="oo-r">1</b>/${ROUNDS}</span><span class="g-chip">⭐ <b class="oo-ok">0</b></span></div><p class="g-msg" aria-live="polite"></p><div class="oo-grid"></div>`;
  api.stage.appendChild(wrap);
  const grid = wrap.querySelector('.oo-grid'), msg = wrap.querySelector('.g-msg'), rEl = wrap.querySelector('.oo-r'), okEl = wrap.querySelector('.oo-ok');
  const mix = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function next() {
    round++; first = true; lock = false;
    let g; do { g = Math.floor(Math.random() * GROUPS.length); } while (g === lastG);
    const CLASH = [[1, 4, 6], [2, 9], [0, 8]];
    let o; do { o = Math.floor(Math.random() * GROUPS.length); } while (o === g || CLASH.some(c => c.includes(o) && c.includes(g)));
    lastG = g; group = GROUPS[g][0];
    const count = round > 5 ? 5 : 3;      // later rounds hide the odd one among more
    const items = mix(GROUPS[g][1].slice()).slice(0, count).map(e => [e, false]);
    items.push([api.pick(GROUPS[o][1]), true]); mix(items);
    odd = items.findIndex(x => x[1]);
    grid.className = 'oo-grid' + (items.length > 4 ? ' six' : '');
    grid.innerHTML = items.map(([e], i) => `<button type="button" class="oo-c" data-i="${i}" aria-label="Choice ${i + 1}: ${e}" style="animation-delay:${i * 50}ms"><small>${i + 1}</small>${e}</button>`).join('');
    msg.textContent = 'Which one does not belong?'; rEl.textContent = round;
  }
  function pick(i) {
    const btn = grid.children[i];
    if (lock || !btn || btn.classList.contains('no')) return;
    if (i === odd) {
      lock = true; btn.classList.add('ok');
      if (first) { right++; okEl.textContent = right; }
      api.add(first ? 10 : 4); api.sfx(first ? 'star' : 'point'); api.pop(btn, '#3ddc84', first ? '⭐' : '👍');
      msg.textContent = `Yes! That one is not ${group}.`;
      api.after(1300, () => { if (round >= ROUNDS) api.end(`${right} of ${ROUNDS} spotted first time. ${right >= 8 ? 'Sharp eyes!' : 'Keep looking closely!'}`); else next(); });
    } else { first = false; btn.classList.add('no'); api.sfx('bad'); msg.textContent = `That one is ${group}. Look again.`; }
  }
  api.on(grid, 'click', e => { const b = e.target.closest('.oo-c'); if (b) { pick(+b.dataset.i); b.blur(); } });
  api.key((k, e) => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < grid.children.length && !e.repeat) pick(i); });
  api.cursor(() => [...grid.children], () => (grid.children.length > 4 ? 3 : 2), i => pick(i));
  api.probe = () => ({ odd, lock });
  next();
} });
