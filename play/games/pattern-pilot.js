/* Pattern Pilot · ZBZGames™ original. Spot the rule behind the numbers and pick what comes next. Three slips and the flight is over. */
ZBZ.register({ start(api) {
  const LIMIT = 16;
  let level = 1, lives = 3, right = 0, q = null, lock = false, clock = LIMIT;
  const wrap = document.createElement('div');
  wrap.className = 'qz-wrap';
  wrap.innerHTML = `<div class="g-bar"><span class="g-chip">Level <b class="pp-lv">1</b></span><span class="g-chip">Solved <b class="pp-n">0</b></span><span class="g-chip pp-lives"></span></div><div class="qz-time"><i></i></div><div class="qz-q seq" aria-live="polite"></div><p class="g-sub pp-why"></p><div class="qz-opts"></div>`;
  api.stage.appendChild(wrap);
  const qEl = wrap.querySelector('.qz-q'), opts = wrap.querySelector('.qz-opts'), bar = wrap.querySelector('.qz-time i'), why = wrap.querySelector('.pp-why');
  const lvEl = wrap.querySelector('.pp-lv'), nEl = wrap.querySelector('.pp-n'), livesEl = wrap.querySelector('.pp-lives');
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const hearts = () => { livesEl.textContent = '❤️'.repeat(lives) + '🤍'.repeat(3 - lives); livesEl.setAttribute('aria-label', lives + ' lives'); };
  // Each rule returns six terms and a one-line explanation shown after the answer.
  const RULES = [
    () => { const a = ri(1, 12), d = ri(2, 4 + level); return [i => a + d * i, `Add ${d} each time.`]; },
    () => { const d = ri(2, 6), a = ri(5 * d + 1, 5 * d + 30); return [i => a - d * i, `Take away ${d} each time.`]; },
    () => { const a = ri(1, 4), r = ri(2, 3); return [i => a * Math.pow(r, i), `Multiply by ${r} each time.`]; },
    () => { const a = ri(1, 5); return [i => (i + a) * (i + a), 'Square numbers in a row.']; },
    () => { const a = ri(1, 6), d = ri(1, 3); return [i => a + d * i * (i + 1) / 2, `The step grows by ${d} each time.`]; },
    () => { const s = [ri(1, 5), ri(1, 5)]; for (let i = 2; i < 6; i++) s.push(s[i - 1] + s[i - 2]); return [i => s[i], 'Each number is the sum of the two before it.']; },
    () => { const a = ri(1, 9), x = ri(1, 4), y = ri(5, 9); return [i => a + Math.ceil(i / 2) * x + Math.floor(i / 2) * y, `Add ${x}, then ${y}, and repeat.`]; },
    () => { const a = ri(1, 9), b = ri(20, 40), x = ri(2, 5), y = ri(2, 5); return [i => i % 2 ? b - y * (i - 1) / 2 : a + x * i / 2, `Two patterns take turns: one adds ${x}, one takes away ${y}.`]; }
  ];
  function make() {
    const pool = level < 3 ? 2 : level < 5 ? 5 : RULES.length;
    const [f, text] = RULES[ri(0, pool - 1)]();
    const terms = Array.from({ length: 6 }, (_, i) => f(i)), ans = terms[5];
    if (terms.some(v => v < 0 || v > 9999) || (q && q.ans === ans)) return make();
    const set = new Set([ans]);
    for (let n = 0; set.size < 4; n++) { const v = ans + (n > 30 ? set.size : ri(-8, 8)); if (v >= 0) set.add(v); }
    const list = [...set];
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    q = { ans, opts: list, text };
    qEl.innerHTML = terms.slice(0, 5).join(', ') + ', <em>?</em>';
    qEl.style.animation = 'none'; void qEl.offsetWidth; qEl.style.animation = '';
    opts.innerHTML = list.map((v, i) => `<button type="button" class="qz-o" data-v="${v}"><small>${i + 1}</small>${v}</button>`).join('');
    why.textContent = ''; clock = LIMIT; lock = false; lvEl.textContent = level; hearts();
  }
  function settle(ok, btn) {
    lock = true; why.textContent = q.text;
    const good = [...opts.children].find(b => +b.dataset.v === q.ans);
    if (good) good.classList.add('ok');
    if (ok) {
      right++; nEl.textContent = right;
      const pts = level + Math.ceil(clock / 4);
      api.add(pts); api.sfx('point'); api.pop(btn, '#3ddc84', '+' + pts);
      if (right % 3 === 0) level++;
    } else {
      lives--; hearts(); api.sfx('bad'); if (btn) btn.classList.add('no');
      if (lives <= 0) { api.after(1500, () => api.end(`You solved ${right} patterns and reached level ${level}.`)); return; }
    }
    api.after(ok ? 900 : 1700, make);
  }
  function pick(v, btn) { if (!lock && btn) settle(v === q.ans, btn); }
  api.on(opts, 'click', e => { const b = e.target.closest('.qz-o'); if (b) { pick(+b.dataset.v, b); b.blur(); } });
  api.key((k, e) => { const i = +k - 1; if (k !== ' ' && i >= 0 && i < 4 && q && !e.repeat) pick(q.opts[i], opts.children[i]); });
  api.loop(dt => {
    if (lock) return;
    clock -= dt; bar.style.width = Math.max(0, clock / LIMIT * 100) + '%';
    if (clock <= 0) settle(false, null);
  });
  api.probe = () => ({ ans: q.ans, lock, lives, level });
  make();
} });
