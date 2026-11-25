/* Quick Draw · ZBZGames™ original. Wait for green, then tap as fast as you can. Five rounds; tap too early and it counts against you. */
ZBZ.register({ start(api) {
  const ROUNDS = 5, times = [];
  let state = 'wait', goAt = 0, armed = 0;
  const pad = document.createElement('button');
  pad.type = 'button'; pad.className = 'qd-pad';
  api.stage.appendChild(pad);
  const dots = () => `<div class="qd-dots" aria-hidden="true">${Array.from({ length: ROUNDS }, (_, i) => `<i class="${i < times.length ? 'on' : ''}"></i>`).join('')}</div>`;
  function arm() {
    state = 'wait'; pad.className = 'qd-pad wait';
    pad.innerHTML = `<b>Wait for green…</b><span>Round ${times.length + 1} of ${ROUNDS}</span>${dots()}`;
    // The clock is the engine's, so a pause never counts as reaction time.
    // An early tap retires this light, so it cannot turn green over the "Too early" screen.
    const mine = ++armed;
    api.after(api.rand(1200, 3600), () => { if (mine !== armed || state !== 'wait') return; state = 'go'; goAt = api.time(); pad.className = 'qd-pad go'; pad.innerHTML = '<b>TAP!</b>'; });
  }
  function hit() {
    if (state === 'wait') {
      state = 'early'; armed++; api.sfx('bad'); pad.className = 'qd-pad early'; times.push(800);
      pad.innerHTML = `<b>Too early!</b><span>Counted as 800 ms</span>${dots()}`;
      return api.after(1100, next);
    }
    if (state !== 'go') return;
    const ms = Math.max(1, Math.round((api.time() - goAt) * 1000)); times.push(ms); state = 'shown'; api.sfx('point');
    pad.className = 'qd-pad done'; pad.innerHTML = `<b>${ms} ms</b><span>${ms < 250 ? 'Lightning!' : ms < 350 ? 'Sharp.' : 'Keep going.'}</span>${dots()}`;
    if (ms < 350) api.fx.burst(api.stage.clientWidth / 2, api.stage.clientHeight / 2, '#ffd23f', 18, 240);
    api.after(1000, next);
  }
  function next() {
    if (times.length >= ROUNDS) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length), fastest = Math.min(...times);
      api.score(Math.max(0, 1000 - avg)); api.end(`Average reaction: ${avg} ms. Fastest: ${fastest} ms.`); return;
    }
    arm();
  }
  api.on(pad, 'pointerdown', e => { e.preventDefault(); hit(); });
  api.key((k, e) => { if ((k === ' ' || k === 'Enter') && !e.repeat) { e.preventDefault(); hit(); } });
  arm();
} });
