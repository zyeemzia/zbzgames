/* Tiny Speller · ZBZGames™ original, for kids. Look at the picture and tap the letters in order to spell its name. */
ZBZ.register({ start(api) {
  const ROUNDS = 8;
  const WORDS = [['🐱', 'CAT'], ['🐶', 'DOG'], ['☀️', 'SUN'], ['🐟', 'FISH'], ['🌳', 'TREE'], ['⭐', 'STAR'], ['🐸', 'FROG'], ['🚗', 'CAR'], ['🐝', 'BEE'], ['🥚', 'EGG'], ['🍎', 'APPLE'], ['📖', 'BOOK'], ['🌙', 'MOON'], ['🐦', 'BIRD'], ['🚢', 'SHIP'], ['🔑', 'KEY'], ['🎩', 'HAT'], ['🐄', 'COW'], ['🦆', 'DUCK'], ['🍰', 'CAKE'], ['🐻', 'BEAR'], ['🦁', 'LION'], ['🐷', 'PIG'], ['🚌', 'BUS'], ['🥛', 'MILK'], ['🏠', 'HOUSE'], ['🐭', 'MOUSE'], ['🍇', 'GRAPE'], ['🐴', 'HORSE'], ['🔔', 'BELL'], ['🥁', 'DRUM'], ['🐐', 'GOAT'], ['🌧️', 'RAIN'], ['👑', 'CROWN']];
  let round = 0, right = 0, first = true, lock = false, word = '', got = 0, tiles = [];
  const order = WORDS.slice();
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  order.sort((a, b) => Math.min(4, a[1].length) - Math.min(4, b[1].length));      // short words first
  const picks = order.slice(0, 4).concat(order.filter(x => x[1].length >= 4).slice(0, 4));
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap ts-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Word <b class="ts-r">1</b>/${ROUNDS}</span><span class="g-chip">⭐ <b class="ts-ok">0</b></span></div><div class="ts-pic" aria-hidden="true"></div><div class="ts-slots"></div><p class="g-msg" aria-live="polite"></p><div class="ts-tiles"></div>`;
  api.stage.appendChild(wrap);
  const pic = wrap.querySelector('.ts-pic'), slots = wrap.querySelector('.ts-slots'), tEl = wrap.querySelector('.ts-tiles'), msg = wrap.querySelector('.g-msg'), rEl = wrap.querySelector('.ts-r'), okEl = wrap.querySelector('.ts-ok');
  function next() {
    round++; first = true; lock = false; got = 0;
    const [emoji, w] = picks[round - 1]; word = w;
    const letters = [...w];
    while (letters.length < w.length + 2) { const ch = String.fromCharCode(65 + Math.floor(Math.random() * 26)); if (!w.includes(ch) && !letters.includes(ch)) letters.push(ch); }
    for (let i = letters.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [letters[i], letters[j]] = [letters[j], letters[i]]; }
    tiles = letters.map(ch => ({ ch, used: false }));
    pic.textContent = emoji; pic.classList.remove('in'); void pic.offsetWidth; pic.classList.add('in');
    slots.innerHTML = letters.slice(0, w.length).map(() => '<span></span>').join('');
    tEl.innerHTML = tiles.map((x, i) => `<button type="button" class="ts-t" data-i="${i}" style="--hue:${(x.ch.charCodeAt(0) * 29) % 360}">${x.ch}</button>`).join('');
    msg.textContent = 'Spell the word'; rEl.textContent = round;
  }
  function press(i) {
    const tile = tiles[i], btn = tEl.children[i];
    if (lock || !tile || tile.used) return;
    if (tile.ch === word[got]) {
      tile.used = true; btn.classList.add('used'); btn.disabled = true;
      const slot = slots.children[got]; slot.textContent = tile.ch; slot.classList.add('on'); got++;
      api.note(392 + got * 60, .12, .07);
      if (got === word.length) {
        lock = true; if (first) { right++; okEl.textContent = right; }
        api.add(first ? 10 : 4); api.sfx(first ? 'star' : 'point'); api.pop(slots, '#3ddc84', first ? '⭐' : '👍');
        msg.textContent = `${word}! Well done.`;
        api.after(1300, () => { if (round >= ROUNDS) api.end(`${right} of ${ROUNDS} words spelled without a slip. ${right >= 6 ? 'Great spelling!' : 'Say the word slowly and listen for each sound.'}`); else next(); });
      }
    } else { first = false; api.sfx('bad'); msg.textContent = `Not ${tile.ch}. What comes ${got ? 'next' : 'first'}?`; btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake'); }
  }
  api.on(tEl, 'click', e => { const b2 = e.target.closest('.ts-t'); if (b2) { press(+b2.dataset.i); b2.blur(); } });
  api.key((k, e) => {
    if (e.repeat || k.length !== 1) return;
    const ch = k.toUpperCase(); if (ch < 'A' || ch > 'Z') return;
    // the typed letter: the wanted one if it is there, else any tile with that letter
    let i = tiles.findIndex(x => !x.used && x.ch === ch && ch === word[got]); if (i < 0) i = tiles.findIndex(x => !x.used && x.ch === ch);
    if (i >= 0) press(i);
  });
  api.cursor(() => [...tEl.children], () => Math.ceil(tiles.length / 2), i => press(i));
  api.probe = () => ({ word, got, lock, round, tiles: tiles.map(x => ({ ch: x.ch, used: x.used })) });
  next();
} });
