/* Clock Wise · ZBZGames™ original, for kids. Read the hands of the clock and tap the right time. It starts with full hours and gets finer. */
ZBZ.register({ start(api) {
  const ROUNDS = 10;
  let round = 0, right = 0, first = true, lock = false, ans = -1, opts = [], prev = '';
  const wrap = document.createElement('div');
  wrap.className = 'g-wrap cw-wrap';
  const marks = Array.from({ length: 60 }, (_, i) => { const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = big ? 40 : 43, x = Math.sin(a), y = -Math.cos(a); return `<line x1="${50 + x * r1}" y1="${50 + y * r1}" x2="${50 + x * 45.5}" y2="${50 + y * 45.5}" class="${big ? 'b' : ''}"/>`; }).join('');
  const nums = Array.from({ length: 12 }, (_, i) => { const a = (i + 1) * 30 * Math.PI / 180; return `<text x="${50 + Math.sin(a) * 33}" y="${50 - Math.cos(a) * 33}">${i + 1}</text>`; }).join('');
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Clock <b class="cw-r">1</b>/${ROUNDS}</span><span class="g-chip">⭐ <b class="cw-ok">0</b></span></div><p class="g-msg" aria-live="polite"></p><svg class="cw-clock" viewBox="0 0 100 100" role="img" aria-label="A clock"><circle class="face" cx="50" cy="50" r="47"/>${marks}${nums}<line class="hand hr" x1="50" y1="50" x2="50" y2="29"/><line class="hand mn" x1="50" y1="50" x2="50" y2="15"/><circle class="pin" cx="50" cy="50" r="3"/></svg><div class="qz-opts"></div>`;
  api.stage.appendChild(wrap);
  const hr = wrap.querySelector('.hr'), mn = wrap.querySelector('.mn'), optEl = wrap.querySelector('.qz-opts'), msg = wrap.querySelector('.g-msg'), rEl = wrap.querySelector('.cw-r'), okEl = wrap.querySelector('.cw-ok');
  const show = (hh, mm) => `${hh}:${String(mm).padStart(2, '0')}`;
  const say = (hh, mm) => mm === 0 ? `${hh} o'clock` : mm === 30 ? `half past ${hh}` : mm === 15 ? `quarter past ${hh}` : mm === 45 ? `quarter to ${hh % 12 + 1}` : show(hh, mm);
  function next() {
    round++; first = true; lock = false;
    const steps = round <= 3 ? [0] : round <= 6 ? [0, 30] : round <= 8 ? [15, 45, 30] : [5, 10, 20, 25, 35, 40, 50, 55];
    let hh, mm; do { hh = 1 + Math.floor(Math.random() * 12); mm = api.pick(steps); } while (show(hh, mm) === prev);
    prev = show(hh, mm);
    const set = new Set([prev]);
    // a tempting wrong answer: the two hands read the other way round
    const swap = show(mm === 0 ? 12 : mm / 5, (hh % 12) * 5);
    if (round > 3) set.add(swap);
    const pool = round <= 3 ? [0] : round <= 6 ? [0, 30] : round <= 8 ? [0, 15, 30, 45] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    while (set.size < 4) set.add(show(1 + Math.floor(Math.random() * 12), api.pick(pool)));
    opts = [...set];
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    ans = opts.indexOf(prev);
    hr.style.transform = `rotate(${(hh % 12) * 30 + mm / 2}deg)`; mn.style.transform = `rotate(${mm * 6}deg)`;
    optEl.innerHTML = opts.map((o, i) => `<button type="button" class="qz-o" data-i="${i}"><small>${i + 1}</small>${o}</button>`).join('');
    msg.textContent = 'What time is it?'; rEl.textContent = round;
    wrap.dataset.say = say(hh, mm);
  }
  function pick(i) {
    const btn = optEl.children[i];
    if (lock || !btn || btn.classList.contains('no')) return;
    if (i === ans) {
      lock = true; btn.classList.add('ok');
      if (first) { right++; okEl.textContent = right; }
      api.add(first ? 10 : 4); api.sfx(first ? 'star' : 'point'); api.pop(btn, '#3ddc84', first ? '⭐' : '👍');
      msg.textContent = `Yes, it is ${wrap.dataset.say}!`;
      api.after(1300, () => { if (round >= ROUNDS) api.end(`${right} of ${ROUNDS} clocks read first time. ${right >= 8 ? 'You can tell the time!' : 'The short hand shows the hour, the long hand the minutes.'}`); else next(); });
    } else { first = false; btn.classList.add('no'); api.sfx('bad'); msg.textContent = 'Not that one. The short hand shows the hour.'; }
  }
  api.on(optEl, 'click', e => { const b = e.target.closest('.qz-o'); if (b) { pick(+b.dataset.i); b.blur(); } });
  api.key((k, e) => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < 4 && !e.repeat) pick(i); });
  api.cursor(() => [...optEl.children], () => 2, i => pick(i));
  api.probe = () => ({ ans, lock });
  next();
} });
