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
  let target = api.pick(mode.pool), bubbles = [], timeLeft = 60, spawn = 0, streak = 0, flash = 0;
  const label = v => mode.say === 'colour' ? '' : v;
  const colOf = v => mode.say === 'colour' ? HEX[v] : `hsl(${(v.charCodeAt(0) * 37) % 360},80%,60%)`;
  const newTarget = () => { let n; do { n = api.pick(mode.pool); } while (n === target); target = n; flash = 1; };
  function add() {
    const v = Math.random() < .4 ? target : api.pick(mode.pool);
    const r = api.rand(28, 42);
    bubbles.push({ v, r, x: api.rand(r, Math.max(r + 1, w() - r)), y: h() + r, vy: api.rand(45, 85), wob: api.rand(0, 6), pop: 0 });
  }
  api.tap((x, y) => {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (!b.pop && Math.hypot(b.x + Math.sin(b.wob) * 6 - x, b.y - y) < b.r + 10) {
        b.pop = .01;
        if (b.v === target) {
          streak++; const pts = 1 + Math.floor(streak / 5); api.add(pts); api.sfx('pop');
          api.fx.burst(x, b.y, colOf(b.v), 14); api.fx.text(x, b.y - b.r, '+' + pts, '#ffd23f', 22);
          if (streak % 6 === 0) newTarget();
        } else { streak = 0; api.sfx('bad'); api.fx.text(x, b.y - b.r, '✗', '#ff5470', 26); }
        return;
      }
    }
  });
  api.loop(dt => {
    const W = w(), H = h();
    timeLeft -= dt;
    if (timeLeft <= 0) { api.end('Time is up. Great popping!'); return; }
    spawn -= dt; if (spawn <= 0) { add(); spawn = .55; }
    flash = Math.max(0, flash - dt * 2);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (api.c.dark) { g.addColorStop(0, '#16307a'); g.addColorStop(1, '#0a1233'); } else { g.addColorStop(0, '#bfe3ff'); g.addColorStop(1, '#e6f4ff'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const b of bubbles) {
      b.y -= b.vy * dt; b.wob += dt * 2;
      const x = b.x + Math.sin(b.wob) * 6, r = b.r * (1 + (b.pop || 0) * .6);
      if (b.pop) { b.pop += dt * 4; ctx.globalAlpha = Math.max(0, 1 - b.pop); }
      const col = colOf(b.v), rg = ctx.createRadialGradient(x - r * .35, b.y - r * .4, r * .1, x, b.y, r);
      rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(.25, col); rg.addColorStop(1, col);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, b.y, r, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(b.r)}px Rajdhani,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.strokeText(label(b.v), x, b.y + 1); ctx.fillText(label(b.v), x, b.y + 1);
      ctx.globalAlpha = 1;
    }
    bubbles = bubbles.filter(b => b.y > -60 && (!b.pop || b.pop < 1));
    // the target banner and the clock
    ctx.fillStyle = 'rgba(8,10,30,.62)'; ctx.fillRect(0, 0, W, 56);
    ctx.fillStyle = timeLeft < 10 ? '#ff5470' : '#3ddc84'; ctx.fillRect(0, 54, W * Math.max(0, timeLeft / 60), 3);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '700 22px Rajdhani,sans-serif';
    const lead = `Pop the ${mode.say}:`;
    ctx.fillText(lead, 14, 28);
    const tx = 14 + ctx.measureText(lead + ' ').width;
    if (mode.say === 'colour') { ctx.fillStyle = HEX[target]; ctx.beginPath(); ctx.arc(tx + 16, 28, 14 + flash * 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
    else { ctx.fillStyle = '#ffd23f'; ctx.font = `700 ${Math.round(30 + flash * 16)}px Rajdhani,sans-serif`; ctx.fillText(target, tx, 28); }
    ctx.fillStyle = '#fff'; ctx.font = '700 22px Rajdhani,sans-serif'; ctx.textAlign = 'right'; ctx.fillText(Math.ceil(timeLeft) + 's', W - 14, 28); ctx.textAlign = 'left';
  });
} });
