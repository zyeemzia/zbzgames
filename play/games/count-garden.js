/* Count Garden · ZBZGames™ original, for kids. Count what is in the garden and tap the right number. Ten gardens a round. */
ZBZ.register({ start(api) {
  const THINGS = [['🌻', 'sunflowers'], ['🐞', 'ladybirds'], ['🦋', 'butterflies'], ['🍄', 'mushrooms'], ['🐝', 'bees'], ['🌷', 'tulips'], ['🐌', 'snails'], ['🍓', 'strawberries'], ['🐥', 'chicks'], ['🐸', 'frogs']];
  const ROUNDS = 10;
  let round = 0, right = 0, n = 0, first = true, lock = false, opts = [];
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap'; wrap.style.width = 'min(94%, 520px)';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Garden <b class="cg-r">1</b>/${ROUNDS}</span><span class="g-chip">⭐ <b class="cg-ok">0</b></span></div><p class="g-msg" aria-live="polite"></p><div class="cg-field"></div><div class="qz-opts"></div>`;
  api.stage.appendChild(wrap);
  const field = wrap.querySelector('.cg-field'), optEl = wrap.querySelector('.qz-opts'), msg = wrap.querySelector('.g-msg'), rEl = wrap.querySelector('.cg-r'), okEl = wrap.querySelector('.cg-ok');
  function next() {
    round++; first = true; lock = false;
    const max = round < 4 ? 5 : round < 8 ? 9 : 12, prev = n;
    do { n = 1 + Math.floor(Math.random() * max); } while (n === prev);
    const [emoji, name] = api.pick(THINGS);
    field.innerHTML = Array.from({ length: n }, (_, i) => `<span style="animation-delay:${i * 45}ms">${emoji}</span>`).join('');
    field.setAttribute('aria-label', `${n} ${name}`);
    msg.textContent = `How many ${name}?`;
    // Four choices close to the answer, in counting order.
    const set = new Set([n]);
    for (let d = 1; set.size < 4; d++) { [n - d, n + d].forEach(v => { if (v > 0 && set.size < 4 && Math.random() < .8) set.add(v); }); if (d > 12) set.add(n + d); }
    opts = [...set].sort((a, b) => a - b);
    optEl.innerHTML = opts.map((v, i) => `<button type="button" class="qz-o" data-v="${v}"><small>${i + 1}</small>${v}</button>`).join('');
    rEl.textContent = round;
  }
  function pick(v, btn) {
    if (lock || !btn || btn.classList.contains('no')) return;
    if (v === n) {
      lock = true; btn.classList.add('ok');
      if (first) { right++; okEl.textContent = right; }
      api.add(first ? 10 : 4); api.sfx(first ? 'star' : 'point'); api.pop(btn, '#3ddc84', first ? '⭐' : '👍');
      msg.textContent = first ? `Yes! ${n}.` : `That's it: ${n}.`;
      // Count them out loud, one by one.
      [...field.children].forEach((s, i) => api.after(i * 70, () => s.classList.add('cnt')));
      api.after(900 + n * 70, () => { if (round >= ROUNDS) api.end(`${right} of ${ROUNDS} gardens counted right first time. ${right >= 8 ? 'Brilliant counting!' : 'Keep counting!'}`); else next(); });
    } else { first = false; btn.classList.add('no'); api.sfx('bad'); msg.textContent = 'Count again, slowly.'; }
  }
  api.on(optEl, 'click', e => { const b = e.target.closest('.qz-o'); if (b) { pick(+b.dataset.v, b); b.blur(); } });
  api.key((k, e) => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < opts.length && !e.repeat) pick(opts[i], optEl.children[i]); });
  next();
} });
