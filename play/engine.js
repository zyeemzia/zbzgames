/* ZBZGames™ arcade engine.  Copyright © ZyeemZia
 *
 * Every game is a small module that calls ZBZ.register(game). The engine owns
 * everything around it: the start screen, score, best score, pause, game over,
 * restart, full screen, effects and clean-up. Each round starts on an empty
 * stage, and every loop, timer and listener a round made through `api` is
 * removed when it ends, so a restart can never leave a second game running.
 *
 * game = { start(api) }  — api:
 *   stage            the element to build in (cleared each round)
 *   canvas()         -> { ctx, w(), h() }  a crisp canvas that fills the stage
 *   loop(fn)         fn(dt seconds, t) every frame; stops while paused
 *   every(ms, fn)    interval;  after(ms, fn) timeout (both wait while paused)
 *   time()           seconds played this round, not counting pauses
 *   on(el, ev, fn)   listener;  key(fn) keydown with e.key
 *   tap(fn)          pointer down on the stage: fn(x, y, e) in stage pixels
 *   cursor(cells, cols, press)   arrow keys move a highlight over a grid of
 *                    elements, Enter or Space presses the highlighted one
 *   score(n) add(n)  set or add to the score;  end(text?) finish the round
 *   sfx(kind)        'tap' 'point' 'bad' 'win' 'pop' 'star';  note(freq, len)
 *   fx.burst(x, y, colour, n)  fx.text(x, y, text, colour)  fx.shake(px)
 *   pop(el, colour, text)      the same effects, centred on an element
 *   bg(ctx, W, H)    themed backdrop;  rr(ctx, x, y, w, h, r) rounded-rect path
 *   c                theme colours;  hue  the game's own colour
 *   rand(a,b) pick(arr) store.get/set
 */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('zbz-' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('zbz-' + k, JSON.stringify(v)); } catch { /* fine */ } }
  };
  const meta = window.ZBZ_GAME || { id: 'game', name: 'Game', how: '' };
  const hue = meta.hue === undefined ? 250 : meta.hue;
  let calm = false;
  try { calm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* old browser */ }
  /* Theme colours for canvas games, read from the page's CSS so a game is
     light in the light theme and dark in the dark one, and follows a switch. */
  const colors = { bg: '#070a1c', bg2: '#0d1130', ink: '#fff', ink2: '#aab2d8', line: 'rgba(120,140,255,.1)', dark: true };
  function readColors() {
    try {
      const cs = getComputedStyle(document.documentElement);
      const v = n => cs.getPropertyValue(n).trim();
      colors.bg = v('--g-bg') || colors.bg; colors.bg2 = v('--g-bg2') || colors.bg; colors.ink = v('--g-ink') || colors.ink;
      colors.ink2 = v('--g-ink2') || colors.ink2; colors.line = v('--g-line') || colors.line;
      colors.dark = (cs.colorScheme || '').includes('dark');
    } catch { /* keep defaults */ }
  }
  readColors();
  window.addEventListener('zbz-theme', readColors);
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTimeout(readColors, 0)); } catch { /* old browser */ }
  let game = null, round = null, score = 0, shown = -1, playing = false, paused = false;
  let muted = store.get('muted', false);

  /* ---------- progress ----------
     A player level, a daily streak and the list of games tried. All of it is
     kept on this device only, next to the best scores. */
  const RANKS = ['Rookie', 'Player', 'Pro', 'Ace', 'Master', 'Legend'];
  const levelBase = l => 50 * l * (l - 1);                       // 0, 100, 300, 600, 1000 …
  const levelOf = xp => { let l = 1; while (levelBase(l + 1) <= xp) l++; return l; };
  const rankOf = l => RANKS[Math.min(RANKS.length - 1, Math.floor((l - 1) / 3))];
  const MOTES = Array.from({ length: 22 }, () => [Math.random(), Math.random(), Math.random()]);
  function earn(isBest) {
    const num = (k, d) => { const v = store.get(k, d); return typeof v === 'number' && isFinite(v) ? v : d; };
    const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    let tried = store.get('tried', []); if (!Array.isArray(tried)) tried = [];
    const first = !tried.includes(meta.id);
    if (first) store.set('tried', tried.concat(meta.id));
    let st = store.get('streak', null); if (!st || typeof st !== 'object') st = { d: 0, n: 0 };
    const newDay = st.d !== day;
    if (newDay) { st = { d: day, n: st.d === day - 1 ? (st.n || 0) + 1 : 1 }; store.set('streak', st); }
    const gain = (score > 0 ? 10 : 2) + (isBest ? 25 : 0) + (first ? 30 : 0) + (newDay ? 15 : 0);
    const before = num('xp', 0), xp = before + gain;
    store.set('xp', xp);
    return { gain, xp, up: levelOf(xp) > levelOf(before), streak: st.n };
  }

  /* ---------- sound ----------
     Synthesized in the browser, no files to download. Each effect layers a
     tone with its harmonics, a short noise transient for the "attack" a real
     instrument has, and a soft echo for space, through a compressor so loud
     moments never clip. */
  let ac = null, out = null, wet = null;
  function audio() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return ac; }
    ac = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
    out = ac.createGain(); out.gain.value = .9; out.connect(comp).connect(ac.destination);
    // a small room: a filtered feedback delay
    const d = ac.createDelay(1); d.delayTime.value = .13;
    const fb = ac.createGain(); fb.gain.value = .28;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    wet = ac.createGain(); wet.gain.value = .22;
    wet.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(out);
    return ac;
  }
  function tone(f, t, len, { type = 'sine', vol = .16, glide = 0, harm = [1, .35, .12] } = {}) {
    harm.forEach((amp, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = i ? 'sine' : type;
      o.frequency.setValueAtTime(f * (i + 1), t);
      if (glide) o.frequency.exponentialRampToValueAtTime(f * (i + 1) * glide, t + len);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * amp, t + .008);
      g.gain.exponentialRampToValueAtTime(.0001, t + len);
      o.connect(g); g.connect(out); g.connect(wet);
      o.start(t); o.stop(t + len + .05);
    });
  }
  function noise(t, len, vol, freq) {
    const n = Math.floor(ac.sampleRate * len), b = ac.createBuffer(1, n, ac.sampleRate), ch = b.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = b;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    const g = ac.createGain(); g.gain.value = vol;
    s.connect(f).connect(g).connect(out); s.start(t);
  }
  function sfx(kind) {
    // A short buzz on a mistake, only once the player has touched the page (browsers refuse it before that).
    if (kind === 'bad') { try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(35); } catch { /* no haptics */ } }
    if (muted) return;
    try {
      audio(); const t = ac.currentTime + .005;
      if (kind === 'tap') { noise(t, .03, .25, 3200); tone(880, t, .09, { vol: .09, harm: [1, .2] }); }
      else if (kind === 'point') { tone(988, t, .35, { vol: .12 }); tone(1319, t + .07, .45, { vol: .1 }); noise(t, .02, .12, 6000); }
      else if (kind === 'bad') { tone(196, t, .32, { type: 'triangle', vol: .2, glide: .6, harm: [1, .4] }); noise(t, .12, .3, 220); }
      else if (kind === 'win') { [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .09, .6 - i * .05, { vol: .11 })); noise(t + .27, .25, .06, 8000); }
      else if (kind === 'pop') { noise(t, .05, .4, 1800); tone(620, t, .08, { vol: .1, glide: 1.8, harm: [1] }); }
      else if (kind === 'star') { [1319, 1568, 2093].forEach((f, i) => tone(f, t + i * .06, .4, { vol: .07, harm: [1, .2] })); }
      else tone(660, t, .15, { vol: .1 });
    } catch { /* no audio */ }
  }
  function note(f, len = .35, vol = .12) {
    if (muted) return;
    try { audio(); tone(f, ac.currentTime + .005, len, { vol, harm: [1, .3, .1] }); } catch { /* no audio */ }
  }

  /* ---------- effects ----------
     One transparent canvas above the stage draws sparks, floating numbers and
     confetti for every game, canvas or not. It only runs while something is
     on it, and stays quiet for visitors who asked for reduced motion. */
  const fx = (() => {
    const cv = document.createElement('canvas'); cv.className = 'zbz-fx'; cv.setAttribute('aria-hidden', 'true');
    const x = cv.getContext('2d');
    let parts = [], running = false, W = 0, H = 0, last = 0;
    const R = (a, b) => a + Math.random() * (b - a);
    function fit() {
      const st = cv.parentNode; if (!st) return;
      const r = st.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * d); cv.height = Math.round(H * d); x.setTransform(d, 0, 0, d, 0, 0);
    }
    function tick(t) {
      const dt = Math.min(.05, (t - last) / 1000); last = t;
      x.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.life -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        x.globalAlpha = Math.max(0, Math.min(1, p.life / p.fade));
        if (p.text) {
          x.font = `700 ${p.size}px Rajdhani,sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.lineWidth = 4; x.strokeStyle = 'rgba(5,6,15,.55)'; x.strokeText(p.text, p.x, p.y);
          x.fillStyle = p.color; x.fillText(p.text, p.x, p.y);
        } else if (p.rect) {
          p.rot += p.vr * dt;
          x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.fillStyle = p.color; x.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); x.restore();
        } else { x.fillStyle = p.color; x.beginPath(); x.arc(p.x, p.y, Math.max(.5, p.size * x.globalAlpha), 0, 7); x.fill(); }
      }
      x.globalAlpha = 1;
      parts = parts.filter(p => p.life > 0 && p.y < H + 40);
      if (parts.length) requestAnimationFrame(tick); else { running = false; x.clearRect(0, 0, W, H); }
    }
    function kick() { if (parts.length > 500) parts.splice(0, parts.length - 500); if (!running) { running = true; fit(); last = performance.now(); requestAnimationFrame(tick); } }
    return {
      el: cv, fit,
      burst(px, py, color = '#ffd23f', n = 12, speed = 190) {
        if (calm) return;
        for (let i = 0; i < n; i++) { const a = R(0, 6.283), s = R(.3, 1) * speed; parts.push({ x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, g: 340, life: R(.35, .75), fade: .4, size: R(2, 4.6), color }); }
        kick();
      },
      text(px, py, text, color = '#ffd23f', size = 24) { parts.push({ x: px, y: py, vx: 0, vy: -60, g: 0, life: .9, fade: .4, size, color, text: String(text) }); kick(); },
      confetti() {
        if (calm) return;
        fit();
        const cols = ['#ffd23f', '#56e0ff', '#a78bfa', '#ff5ea8', '#3ddc84', '#ff9f43'];
        for (let i = 0; i < 90; i++) parts.push({ x: R(0, W), y: R(-H * .4, -10), vx: R(-70, 70), vy: R(90, 260), g: 110, life: R(1.8, 3), fade: .5, size: R(8, 14), color: cols[i % cols.length], rect: true, rot: R(0, 6), vr: R(-9, 9) });
        kick();
      },
      shake(px = 7) {
        if (calm) return;
        try { cv.parentNode.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${px}px,${-px * .6}px)` }, { transform: `translate(${-px}px,${px * .5}px)` }, { transform: `translate(${px * .5}px,${px * .4}px)` }, { transform: 'translate(0,0)' }], { duration: 280, easing: 'ease-out' }); } catch { /* no animation API */ }
      },
      clear() { parts = []; }
    };
  })();

  /* ---------- one round ---------- */
  function newRound() {
    const stage = $('#stage');
    const disposers = [], timers = new Set();
    let alive = true, clock = 0, mark = performance.now(), told = false;
    const oldBest = store.get('best-' + meta.id, 0);
    stage.innerHTML = '';
    fx.clear(); stage.appendChild(fx.el); fx.fit();
    const arm = t => { t.at = performance.now(); t.id = setTimeout(() => { timers.delete(t); if (alive) t.fn(); }, t.left); };
    const api = {
      stage, store, sfx, note, fx, hue, c: colors,
      rand: (a, b) => a + Math.random() * (b - a),
      pick: arr => arr[Math.floor(Math.random() * arr.length)],
      get alive() { return alive; },
      time() { return (clock + (paused ? 0 : performance.now() - mark)) / 1000; },
      canvas() {
        const c = document.createElement('canvas');
        c.className = 'zbz-canvas';
        stage.insertBefore(c, fx.el);
        const ctx = c.getContext('2d');
        let W = 0, H = 0;
        const fit = () => {
          const r = stage.getBoundingClientRect();
          const d = Math.min(window.devicePixelRatio || 1, 2);
          W = Math.max(1, r.width); H = Math.max(1, r.height);
          c.width = Math.round(W * d); c.height = Math.round(H * d);
          ctx.setTransform(d, 0, 0, d, 0, 0);
        };
        fit();
        api.on(window, 'resize', fit);
        try { const ro = new ResizeObserver(() => { const r = stage.getBoundingClientRect(); if (Math.abs(r.width - W) > 1 || Math.abs(r.height - H) > 1) fit(); }); ro.observe(stage); disposers.push(() => ro.disconnect()); } catch { /* resize event covers it */ }
        return { ctx, el: c, w: () => W, h: () => H };
      },
      loop(fn) {
        let last = performance.now(), id = 0;
        const step = t => {
          if (!alive) return;
          const dt = Math.max(0, Math.min(.05, (t - last) / 1000)); last = t;
          if (!paused) fn(dt, t);
          if (alive) id = requestAnimationFrame(step);
        };
        id = requestAnimationFrame(step);
        disposers.push(() => cancelAnimationFrame(id));
      },
      every(ms, fn) { const id = setInterval(() => { if (!paused && alive) fn(); }, ms); disposers.push(() => clearInterval(id)); return id; },
      after(ms, fn) { const t = { left: Math.max(0, ms), fn, id: 0, at: 0 }; timers.add(t); if (!paused) arm(t); return t; },
      on(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); disposers.push(() => el.removeEventListener(ev, fn, opt)); },
      key(fn) { api.on(window, 'keydown', e => { if (!paused && alive && !e.metaKey && !e.ctrlKey && !e.altKey) fn(e.key, e); }); },
      tap(fn) {
        api.on(stage, 'pointerdown', e => {
          if (paused || !alive) return;
          const r = stage.getBoundingClientRect();
          fn(e.clientX - r.left, e.clientY - r.top, e);
        });
      },
      cursor(cells, cols, press) {
        let i = -1;
        const paintCursor = () => cells().forEach((el, k) => el.classList.toggle('kb', k === i));
        api.on(stage, 'pointerdown', () => { if (i >= 0) { i = -1; paintCursor(); } });
        api.key((k, e) => {
          const list = cells(), n = list.length, w = Math.max(1, cols());
          if (!n) return;
          const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -w, ArrowDown: w }[k];
          if (d !== undefined) {
            if (i < 0 || i >= n) i = 0;
            else if (i + d >= 0 && i + d < n && (Math.abs(d) !== 1 || Math.floor((i + d) / w) === Math.floor(i / w))) i += d;
            stage.focus({ preventScroll: true }); paintCursor();
          } else if ((k === ' ' || k === 'Enter') && i >= 0 && list[i]) { e.preventDefault(); press(i, list[i]); if (alive) paintCursor(); }
        });
        return { paint: paintCursor, get i() { return i; } };
      },
      center(el) { const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(); return [r.left + r.width / 2 - s.left, r.top + r.height / 2 - s.top]; },
      pop(el, color, text) { const [x, y] = api.center(el); fx.burst(x, y, color); if (text !== undefined) fx.text(x, y - 14, text, color); },
      rr(ctx, x, y, w, h, r) {
        r = Math.max(0, Math.min(r, w / 2, h / 2));
        ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
      },
      bg(ctx, W, H) {
        const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, colors.bg); g.addColorStop(1, colors.bg2);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        const r = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, Math.max(W, H) * .85);
        r.addColorStop(0, `hsla(${hue},90%,60%,${colors.dark ? .2 : .13})`); r.addColorStop(1, `hsla(${hue},90%,60%,0)`);
        ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
        if (calm) return;
        // slow drifting motes give every canvas game some depth; they stop with the game clock
        const tt = api.time();
        ctx.fillStyle = `hsl(${hue},90%,${colors.dark ? 80 : 42}%)`;
        for (let i = 0; i < MOTES.length; i++) {
          const m = MOTES[i], x = (m[0] * W + tt * (5 + m[2] * 12)) % (W + 20) - 10, y = (m[1] * H + tt * (3 + m[2] * 8)) % (H + 20) - 10;
          ctx.globalAlpha = (colors.dark ? .34 : .2) * (.3 + .7 * Math.abs(Math.sin(tt * (.4 + m[2]) + i)));
          ctx.beginPath(); ctx.arc(x, y, .8 + m[2] * 1.7, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
      score(n) {
        score = Math.max(0, Math.round(n)); paint();
        // the moment an old best is beaten, say so once
        if (!told && alive && oldBest > 0 && score > oldBest) { told = true; fx.text(stage.clientWidth / 2, 34, 'New best!', '#ffd23f', 26); sfx('star'); }
      },
      add(n) { api.score(score + n); },
      end(text) {
        if (!alive) return;
        alive = false; playing = false;
        cleanup();
        const best = store.get('best-' + meta.id, 0);
        const isBest = score > best;
        if (isBest) store.set('best-' + meta.id, score);
        const prog = earn(isBest);
        sfx(isBest || prog.up ? 'win' : 'bad');
        showCard('over', text, isBest, prog);
        if (isBest || prog.up) fx.confetti();
        paint();
      }
    };
    function cleanup() {
      timers.forEach(t => clearTimeout(t.id)); timers.clear();
      disposers.splice(0).forEach(d => { try { d(); } catch { /* already gone */ } });
    }
    round = {
      api,
      dispose() { alive = false; cleanup(); },
      pause() { clock += performance.now() - mark; timers.forEach(t => { clearTimeout(t.id); t.left = Math.max(0, t.left - (performance.now() - t.at)); }); },
      resume() { mark = performance.now(); timers.forEach(arm); }
    };
    return api;
  }

  function play() {
    if (!game) return;
    if (round) round.dispose();
    hideCard(); score = 0; shown = 0; paused = false; playing = true; paint();
    const recent = store.get('recent', []);
    store.set('recent', [meta.id].concat((Array.isArray(recent) ? recent : []).filter(x => x !== meta.id)).slice(0, 8));
    try { game.start(newRound()); }
    catch (e) { console.error(e); round && round.api.end('Something went wrong. Tap Play again.'); }
    $('#stage').focus({ preventScroll: true });
  }

  /* ---------- HUD and cards ---------- */
  const ICON = {
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M7 4.5v15l13-7.5z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M3 9.5v5h4l5 4.5v-14L7 9.5z"/><path d="M16 9a4.5 4.5 0 0 1 0 6M18.8 6.2a8.5 8.5 0 0 1 0 11.6"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="f" d="M3 9.5v5h4l5 4.5v-14L7 9.5z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>',
    full: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
  };
  function paint() {
    const s = $('#score');
    s.textContent = score;
    if (score !== shown) { if (score > shown && shown >= 0 && playing) { s.classList.remove('bump'); void s.offsetWidth; s.classList.add('bump'); } shown = score; }
    $('#best').textContent = Math.max(store.get('best-' + meta.id, 0), 0);
    $('#pause').hidden = !playing;
    $('#pause').setAttribute('aria-label', paused ? 'Resume' : 'Pause');
    $('#pause').innerHTML = paused ? ICON.play : ICON.pause;
    $('#mute').innerHTML = muted ? ICON.mute : ICON.sound;
    $('#mute').setAttribute('aria-label', muted ? 'Sound on' : 'Sound off');
    $('#mute').setAttribute('aria-pressed', String(muted));
  }
  const chips = () => {
    const t = meta.touch ? `<span>👆 ${meta.touch}</span>` : '', k = meta.keys ? `<span class="k">⌨️ ${meta.keys}</span>` : '';
    return t || k ? `<div class="ctl">${t}${k}</div>` : '';
  };
  function progRow(p) {
    if (!p) return '';
    const L = levelOf(p.xp), a = levelBase(L), b = levelBase(L + 1), pct = Math.max(4, Math.min(100, Math.round((p.xp - a) / (b - a) * 100)));
    return `<div class="xp${p.up ? ' up' : ''}"><span>${p.up ? 'Level up! ' : ''}Level ${L} · ${rankOf(L)}</span><i><b style="width:${pct}%"></b></i><span>+${p.gain} XP${p.streak > 1 ? ' · 🔥 ' + p.streak : ''}</span></div>`;
  }
  function share(btn) {
    const text = `I scored ${score} in ${meta.name} on ZBZGames. Can you beat it?`, url = location.origin + '/play/' + meta.id + '/';
    const done = () => { btn.textContent = 'Copied ✓'; };
    try {
      if (navigator.share) navigator.share({ title: meta.name + ' · ZBZGames', text, url }).catch(() => {});
      else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text + ' ' + url).then(done, () => {});
    } catch { /* sharing is not allowed here */ }
  }
  function showCard(kind, text, isBest, prog) {
    const card = $('#card');
    const best = store.get('best-' + meta.id, 0);
    const icon = `<div class="c-icon" aria-hidden="true">${meta.icon || '🎮'}</div>`;
    const home = '<a class="ghost" href="/play/">All games</a>';
    const canShare = !meta.kids && score > 0 && (navigator.share || (navigator.clipboard && navigator.clipboard.writeText));
    const extra = (canShare ? '<button class="ghost sm" id="share" type="button">Share score</button>' : '')
      + (meta.next ? `<a class="ghost sm" href="/play/${meta.next.id}/">Next: ${meta.next.icon} ${meta.next.name}</a>` : '');
    card.innerHTML = kind === 'start'
      ? `${icon}<h1>${meta.name}</h1><p class="how">${meta.how}</p>${chips()}<button class="go" id="go" type="button">▶ Play</button>${best ? `<p class="small">Your best: ${best}</p>` : ''}`
      : kind === 'pause'
        ? `<h2>Paused</h2><p class="how">${meta.how}</p>${chips()}<div class="c-row"><button class="go" id="go" type="button">▶ Resume</button><button class="ghost" id="again" type="button">Restart</button>${home}</div>`
        : `${isBest ? '<p class="badge">New best</p>' : ''}<h2>${isBest ? 'Well played!' : 'Game over'}</h2><p class="big" id="final">0</p>${text ? `<p class="how">${text}</p>` : ''}<div class="c-row"><button class="go" id="go" type="button">↻ Play again</button>${home}</div>${extra ? `<div class="c-row">${extra}</div>` : ''}${progRow(prog)}<p class="small">Best: ${Math.max(best, score)}</p>`;
    card.hidden = false;
    const go = $('#go');
    go.onclick = () => kind === 'pause' ? togglePause() : play();
    const again = $('#again'); if (again) again.onclick = play;
    const sh = $('#share'); if (sh) sh.onclick = () => share(sh);
    if (kind === 'over') {
      const el = $('#final'), end = score, t0 = performance.now(), dur = calm ? 0 : Math.min(900, 250 + end * 8);
      const up = t => { if (!el.isConnected) return; const k = dur ? Math.min(1, (t - t0) / dur) : 1; el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(up); };
      requestAnimationFrame(up);
    }
    setTimeout(() => { if (!card.hidden && go.isConnected) go.focus({ preventScroll: true }); }, 30);
  }
  function hideCard() { $('#card').hidden = true; }
  function togglePause() {
    if (!playing || !round) return;
    paused = !paused;
    if (paused) { round.pause(); showCard('pause'); } else { hideCard(); round.resume(); $('#stage').focus({ preventScroll: true }); }
    paint();
  }

  /* ---------- boot ---------- */
  window.ZBZ = {
    register(g) { game = g; },
    store,
    /* What a game chooses to show its play tests (the tests solve puzzles with it). */
    get probe() { return round && round.api.probe ? round.api.probe() : null; }
  };
  document.addEventListener('DOMContentLoaded', () => {
    $('#pause').onclick = togglePause;
    $('#mute').onclick = () => { muted = !muted; store.set('muted', muted); paint(); if (!muted) sfx('tap'); };
    $('#full').innerHTML = ICON.full;
    $('#full').onclick = () => {
      const el = $('#arena');
      try {
        if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } catch { /* not allowed here */ }
    };
    window.addEventListener('resize', () => fx.fit());
    document.addEventListener('visibilitychange', () => { if (document.hidden && playing && !paused) togglePause(); });
    window.addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Games you type in keep every letter; Escape always pauses.
      if (e.key === 'Escape' || (!meta.typing && (e.key === 'p' || e.key === 'P'))) { if (playing) { e.preventDefault(); togglePause(); } return; }
      if ((e.key === 'Enter' || e.key === ' ') && !$('#card').hidden && $('#go') && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('#card'))) { e.preventDefault(); $('#go').click(); }
    });
    // Arrow keys and space must move the game, not the page.
    window.addEventListener('keydown', e => {
      if (playing && !paused && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    }, { passive: false });
    paint();
    if (game) showCard('start');
    else { $('#card').innerHTML = '<h2>This game could not load</h2><p class="how">Check your connection and reload.</p><div class="c-row"><a class="ghost" href="/play/">All games</a></div>'; $('#card').hidden = false; }
    store.set('last', meta.id);
  });
})();
