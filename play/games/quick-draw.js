/* Quick Draw · ZBZGames™ original. Wait for green, then tap as fast as you can. Five rounds; tap too early and it counts against you. */
ZBZ.register({ start(api) {
  const ROUNDS = 5, times = [];
  let state = 'wait', goAt = 0;
  const pad = document.createElement('button');
  pad.type = 'button'; pad.className = 'qd-pad';
  api.stage.appendChild(pad);
  function arm() {
    state = 'wait'; pad.className = 'qd-pad wait';
    pad.innerHTML = `<b>Wait for green…</b><span>Round ${times.length + 1} of ${ROUNDS}</span>`;
    api.after(api.rand(1200, 3600), () => { state = 'go'; goAt = performance.now(); pad.className = 'qd-pad go'; pad.innerHTML = '<b>TAP!</b>'; });
  }
  function hit() {
    if (state === 'wait') {
      state = 'early'; api.sfx('bad'); pad.className = 'qd-pad early';
      pad.innerHTML = '<b>Too early!</b><span>+500 ms penalty</span>'; times.push(800);
      return api.after(1100, next);
    }
    if (state !== 'go') return;
    const ms = Math.round(performance.now() - goAt); times.push(ms); state = 'shown'; api.sfx('point');
    pad.className = 'qd-pad done'; pad.innerHTML = `<b>${ms} ms</b><span>${ms < 250 ? 'Lightning!' : ms < 350 ? 'Sharp.' : 'Keep going.'}</span>`;
    api.after(1000, next);
  }
  function next() {
    if (times.length >= ROUNDS) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      api.score(Math.max(0, 1000 - avg)); api.end(`Average reaction: ${avg} ms.`); return;
    }
    arm();
  }
  api.on(pad, 'pointerdown', e => { e.preventDefault(); hit(); });
  api.key(k => { if (k === ' ' || k === 'Enter') hit(); });
  arm();
} });
