/* ZBZGames™ arcade engine.  Copyright © ZyeemZia
 *
 * Every game is a small module that calls ZBZ.register(game). The engine owns
 * everything around it: the start screen, score, best score, pause, game over,
 * restart, full screen and clean-up. Each round starts on an empty stage, and
 * every loop, timer and listener a round made through `api` is removed when it
 * ends, so a restart can never leave a second game running underneath.
 *
 * game = { start(api) }  — api:
 *   stage            the element to build in (cleared each round)
 *   canvas()         -> { ctx, w(), h() }  a crisp canvas that fills the stage
 *   loop(fn)         fn(dt seconds, t) every frame; pauses when hidden
 *   every(ms, fn)    interval;  after(ms, fn) timeout
 *   on(el, ev, fn)   listener;  key(fn) keydown with e.key
 *   tap(fn)          pointer down on the stage: fn(x, y, e) in stage pixels
 *   score(n) add(n)  set or add to the score;  end(text?) finish the round
 *   sfx(kind)        'tap' 'point' 'bad' 'win'  (tiny synth, muted toggle)
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
  /* Theme colours for canvas games, read from the page's CSS so a game is
     light in the light theme and dark in the dark one, and follows a switch. */
  const colors = { bg: '#060818', ink: '#fff', ink2: '#aab2d8', line: 'rgba(120,140,255,.1)' };
  function readColors() {
    try {
      const cs = getComputedStyle(document.documentElement);
      const v = n => cs.getPropertyValue(n).trim();
      colors.bg = v('--g-bg') || colors.bg; colors.ink = v('--g-ink') || colors.ink;
      colors.ink2 = v('--g-ink2') || colors.ink2; colors.line = v('--g-line') || colors.line;
      colors.dark = (getComputedStyle(document.documentElement).colorScheme || '').includes('dark');
    } catch { /* keep defaults */ }
  }
  readColors();
  window.addEventListener('zbz-theme', readColors);
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTimeout(readColors, 0)); } catch { /* old browser */ }
  let game = null, round = null, score = 0, playing = false, paused = false;
  let muted = store.get('muted', false);

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

  /* ---------- one round ---------- */
  function newRound() {
    const stage = $('#stage');
    const disposers = [];
    let alive = true;
    stage.innerHTML = '';
    const api = {
      stage, store, sfx, c: colors,
      rand: (a, b) => a + Math.random() * (b - a),
      pick: arr => arr[Math.floor(Math.random() * arr.length)],
      get alive() { return alive; },
      canvas() {
        const c = document.createElement('canvas');
        c.className = 'zbz-canvas';
        stage.appendChild(c);
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
        return { ctx, el: c, w: () => W, h: () => H };
      },
      loop(fn) {
        let last = performance.now(), id = 0;
        const step = t => {
          if (!alive) return;
          const dt = Math.min(.05, (t - last) / 1000); last = t;
          if (!paused) fn(dt, t);
          id = requestAnimationFrame(step);
        };
        id = requestAnimationFrame(step);
        disposers.push(() => cancelAnimationFrame(id));
      },
      every(ms, fn) { const id = setInterval(() => { if (!paused && alive) fn(); }, ms); disposers.push(() => clearInterval(id)); return id; },
      after(ms, fn) { const id = setTimeout(() => { if (alive) fn(); }, ms); disposers.push(() => clearTimeout(id)); return id; },
      on(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); disposers.push(() => el.removeEventListener(ev, fn, opt)); },
      key(fn) { api.on(window, 'keydown', e => { if (!paused && alive && !e.metaKey && !e.ctrlKey) fn(e.key, e); }); },
      tap(fn) {
        api.on(stage, 'pointerdown', e => {
          if (paused || !alive) return;
          const r = stage.getBoundingClientRect();
          fn(e.clientX - r.left, e.clientY - r.top, e);
        });
      },
      score(n) { score = Math.max(0, Math.round(n)); paint(); },
      add(n) { api.score(score + n); },
      end(text) {
        if (!alive) return;
        alive = false; playing = false;
        disposers.splice(0).forEach(d => { try { d(); } catch { /* already gone */ } });
        const best = store.get('best-' + meta.id, 0);
        const isBest = score > best;
        if (isBest) store.set('best-' + meta.id, score);
        sfx(isBest ? 'win' : 'bad');
        showCard('over', text, isBest);
        paint();
      }
    };
    round = { api, dispose() { alive = false; disposers.splice(0).forEach(d => { try { d(); } catch { /* gone */ } }); } };
    return api;
  }

  function play() {
    if (!game) return;
    if (round) round.dispose();
    hideCard(); score = 0; paused = false; playing = true; paint();
    try { game.start(newRound()); }
    catch (e) { console.error(e); round && round.api.end('Something went wrong. Tap Play again.'); }
    $('#stage').focus({ preventScroll: true });
  }

  /* ---------- HUD and cards ---------- */
  function paint() {
    $('#score').textContent = score;
    $('#best').textContent = Math.max(store.get('best-' + meta.id, 0), 0);
    $('#pause').hidden = !playing;
    $('#pause').setAttribute('aria-label', paused ? 'Resume' : 'Pause');
    $('#pause').innerHTML = paused ? '&#9654;' : '&#10073;&#10073;';
    $('#mute').innerHTML = muted ? '&#128263;' : '&#128264;';
    $('#mute').setAttribute('aria-label', muted ? 'Sound on' : 'Sound off');
  }
  function showCard(kind, text, isBest) {
    const card = $('#card');
    const best = store.get('best-' + meta.id, 0);
    card.innerHTML = kind === 'start'
      ? `<h1>${meta.name}</h1><p class="how">${meta.how}</p><button class="go" id="go" type="button">Play</button>${best ? `<p class="small">Your best: ${best}</p>` : ''}`
      : kind === 'pause'
        ? `<h2>Paused</h2><button class="go" id="go" type="button">Resume</button>`
        : `<h2>${isBest ? 'New best!' : 'Game over'}</h2><p class="big">${score}</p>${text ? `<p class="how">${text}</p>` : ''}<button class="go" id="go" type="button">Play again</button><p class="small">Best: ${Math.max(best, score)}</p>`;
    card.hidden = false;
    const go = $('#go');
    go.onclick = () => kind === 'pause' ? togglePause() : play();
    setTimeout(() => go.focus({ preventScroll: true }), 30);
  }
  function hideCard() { $('#card').hidden = true; }
  function togglePause() {
    if (!playing) return;
    paused = !paused;
    if (paused) showCard('pause'); else { hideCard(); $('#stage').focus({ preventScroll: true }); }
    paint();
  }

  /* ---------- boot ---------- */
  window.ZBZ = {
    register(g) { game = g; },
    store
  };
  document.addEventListener('DOMContentLoaded', () => {
    $('#pause').onclick = togglePause;
    $('#mute').onclick = () => { muted = !muted; store.set('muted', muted); paint(); };
    $('#full').onclick = () => {
      const el = $('#arena');
      try {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } catch { /* not allowed here */ }
    };
    document.addEventListener('visibilitychange', () => { if (document.hidden && playing && !paused) togglePause(); });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' || e.key === 'p') { if (playing) { e.preventDefault(); togglePause(); } }
      if ((e.key === 'Enter' || e.key === ' ') && !$('#card').hidden && document.activeElement !== $('#go')) { e.preventDefault(); $('#go').click(); }
    });
    // Arrow keys and space must move the game, not the page.
    window.addEventListener('keydown', e => {
      if (playing && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    }, { passive: false });
    paint();
    if (game) showCard('start');
    else { $('#card').innerHTML = '<h2>This game could not load</h2><p class="how">Check your connection and reload.</p>'; $('#card').hidden = false; }
    store.set('last', meta.id);
  });
})();
