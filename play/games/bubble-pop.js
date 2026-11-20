/* Bubble Pop · ZBZGames™ original, for kids. Pop the bubbles that match the target before time runs out. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const MODES = [
    { say: 'letter', pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') },
    { say: 'number', pool: '0123456789'.split('') },
    { say: 'colour', pool: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] }
  ];
  const HEX = { red: '#ff5470', blue: '#4d8dff', green: '#3ddc84', yellow: '#ffd23f', purple: '#a78bfa', orange: '#ff9f43' };
  const mode = api.pick(MODES);
  let target = api.pick(mode.pool), bubbles = [], timeLeft = 60, spawn = 0, streak = 0;
  const label = v => mode.say === 'colour' ? '' : v;
  function add() {
    const v = Math.random() < .4 ? target : api.pick(mode.pool);
    const r = api.rand(26, 40);
    bubbles.push({ v, r, x: api.rand(r, w() - r), y: h() + r, vy: api.rand(45, 85), wob: api.rand(0, 6), pop: 0 });
  }
  api.tap((x, y) => {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (!b.pop && Math.hypot(b.x - x, b.y - y) < b.r + 8) {
        b.pop = .01;
        if (b.v === target) { streak++; api.add(1 + Math.floor(streak / 5)); api.sfx('point'); if (streak % 6 === 0) target = api.pick(mode.pool); }
        else { streak = 0; api.sfx('bad'); }
        return;
      }
    }
  });
  api.loop(dt => {
    const W = w(), H = h();
    timeLeft -= dt;
    if (timeLeft <= 0) { api.end('Time is up. Great popping!'); return; }
    spawn -= dt; if (spawn <= 0) { add(); spawn = .55; }
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#132a6b'); g.addColorStop(1, '#0a1233');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const b of bubbles) {
      b.y -= b.vy * dt; b.wob += dt * 2;
      const x = b.x + Math.sin(b.wob) * 6;
      if (b.pop) { b.pop += dt * 4; ctx.globalAlpha = Math.max(0, 1 - b.pop); }
      const col = mode.say === 'colour' ? HEX[b.v] : `hsl(${(b.v.charCodeAt(0) * 37) % 360},80%,62%)`;
      ctx.fillStyle = col + (mode.say === 'colour' ? '' : '');
      ctx.beginPath(); ctx.arc(x, b.y, b.r * (1 + (b.pop || 0)), 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(x - b.r * .35, b.y - b.r * .35, b.r * .22, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(b.r)}px Rajdhani,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label(b.v), x, b.y + 1);
      ctx.globalAlpha = 1;
    }
    bubbles = bubbles.filter(b => b.y > -60 && (!b.pop || b.pop < 1));
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, 54);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '700 22px Rajdhani,sans-serif';
    ctx.fillText(`Pop the ${mode.say}:`, 14, 27);
    if (mode.say === 'colour') { ctx.fillStyle = HEX[target]; ctx.beginPath(); ctx.arc(14 + ctx.measureText(`Pop the ${mode.say}:`).width + 24, 27, 14, 0, 7); ctx.fill(); }
    else { ctx.fillStyle = '#ffd23f'; ctx.fillText(target, 14 + ctx.measureText(`Pop the ${mode.say}: `).width, 27); }
    ctx.fillStyle = '#cfd5f2'; ctx.textAlign = 'right'; ctx.fillText(Math.ceil(timeLeft) + 's', W - 14, 27); ctx.textAlign = 'left';
  });
} });
