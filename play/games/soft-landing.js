/* Soft Landing · ZBZGames™ original. Fire the engine to slow your fall and set the craft down gently on the pad. Each pad is smaller and the pull is stronger. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const keys = {}, SHIPS = 3;
  let x = 0, y = 0, vx = 0, vy = 0, fuel = 1, level = 0, ships = SHIPS, landed = 0, pad = { x: 0, w: 0 }, hold = false, tx = 0, lock = true, t = 0, wind = 0, hills = [], flame = 0;
  const ground = () => h() - 56, LIMIT = 95, SIDE = 70;
  const grav = () => Math.min(250, 120 + level * 11);
  function setup(next) {
    const W = w();
    if (next) level++;
    pad.w = Math.max(54, Math.min(W * .34, 130) - level * 6); pad.x = api.rand(pad.w / 2 + 14, W - pad.w / 2 - 14);
    x = api.rand(W * .2, W * .8); y = 46; vx = api.rand(-30, 30) * Math.min(2, 1 + level * .12); vy = 20; fuel = 1; tx = x; hold = false;
    wind = level > 3 ? api.rand(-1, 1) * Math.min(38, level * 4) : 0;
    hills = Array.from({ length: 9 }, () => api.rand(6, 30));
    lock = false;
  }
  const point = e => { const r = api.stage.getBoundingClientRect(); tx = e.clientX - r.left; };
  api.on(api.stage, 'pointerdown', e => { hold = true; point(e); });
  api.on(api.stage, 'pointermove', e => { if (hold) point(e); });
  api.on(window, 'pointerup', () => { hold = false; }); api.on(window, 'pointercancel', () => { hold = false; });
  api.on(window, 'keydown', e => { keys[e.key] = true; }); api.on(window, 'keyup', e => { keys[e.key] = false; });
  api.on(window, 'blur', () => { hold = false; for (const k in keys) keys[k] = false; });
  api.probe = () => ({ x, y, vx, vy, fuel, level, ships, landed, lock, pad: { x: pad.x, w: pad.w }, ground: ground(), limit: LIMIT, grav: grav() });
  function touch() {
    const onPad = Math.abs(x - pad.x) < pad.w / 2 - 6, soft = vy <= LIMIT && Math.abs(vx) <= SIDE;
    lock = true;
    if (onPad && soft) {
      const pts = 20 + Math.round(fuel * 20) + (vy <= LIMIT / 2 ? 10 : 0);
      landed++; api.add(pts); api.sfx('win'); api.fx.burst(x, ground(), '#3ddc84', 18); api.fx.text(x, ground() - 60, (vy <= LIMIT / 2 ? 'Feather soft! +' : 'Landed +') + pts, '#3ddc84', 22);
      api.after(1100, () => setup(true));
    } else {
      ships--; api.sfx('bad'); api.fx.shake(10); api.fx.burst(x, ground() - 6, '#ff9f43', 26, 260);
      api.fx.text(x, ground() - 60, onPad ? 'Too fast!' : 'Missed the pad', '#ff5470', 22);
      y = -999;
      if (ships <= 0) api.after(700, () => api.end(`${landed} soft landing${landed === 1 ? '' : 's'}. Slow right down before you touch the pad.`));
      else api.after(1100, () => setup(false));
    }
  }
  setup(false);
  api.loop(dt => {
    const W = w(), H = h(), G = ground();
    t += dt;
    const up = hold || keys[' '] || keys.ArrowUp || keys.w || keys.W, burn = !lock && up && fuel > 0;
    if (!lock) {
      let ax = wind;
      if (keys.ArrowLeft || keys.a || keys.A) ax -= 170;
      if (keys.ArrowRight || keys.d || keys.D) ax += 170;
      if (hold) ax += Math.max(-170, Math.min(170, (tx - x) * 3.2));
      vy += grav() * dt;
      if (burn) { vy -= grav() * 2.5 * dt; fuel = Math.max(0, fuel - dt * .24); if (Math.random() < .3) api.note(90, .05, .02); }
      vx += ax * dt; vx *= 1 - .25 * dt;
      x += vx * dt; y += vy * dt;
      if (x < 14) { x = 14; vx = Math.abs(vx) * .4; } if (x > W - 14) { x = W - 14; vx = -Math.abs(vx) * .4; }
      if (y < 16) { y = 16; vy = Math.max(0, vy); }
      if (y + 16 >= G) { y = G - 16; touch(); }
    }
    flame += ((burn ? 1 : 0) - flame) * Math.min(1, dt * 16);
    api.bg(ctx, W, H);
    // hills and the pad
    ctx.fillStyle = api.c.dark ? '#1a2050' : '#c5cbee'; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, G);
    hills.forEach((v, i) => { const hx = (i + .5) * W / hills.length, near = Math.abs(hx - pad.x) < pad.w / 2 + W / hills.length * .5; ctx.lineTo(hx, G - (near ? 0 : v)); });
    ctx.lineTo(W, G); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = api.c.dark ? '#1a2050' : '#c5cbee'; ctx.fillRect(pad.x - pad.w / 2 - 8, G, pad.w + 16, H - G);
    ctx.fillStyle = '#3ddc84'; ctx.shadowColor = '#3ddc84'; ctx.shadowBlur = 14; api.rr(ctx, pad.x - pad.w / 2, G - 3, pad.w, 7, 3.5); ctx.fill(); ctx.shadowBlur = 0;
    for (let i = 0; i < 2; i++) { const lx = pad.x + (i ? 1 : -1) * (pad.w / 2 - 4); ctx.fillStyle = Math.sin(t * 6 + i * 3) > 0 ? '#ffd23f' : 'rgba(255,210,63,.3)'; ctx.beginPath(); ctx.arc(lx, G - 8, 3, 0, 7); ctx.fill(); }
    // the craft
    if (y > -100) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.max(-.35, Math.min(.35, vx / 400)));
      if (flame > .05) { const fl = (16 + Math.random() * 12) * flame; const fg = ctx.createLinearGradient(0, 12, 0, 12 + fl); fg.addColorStop(0, '#fff'); fg.addColorStop(.4, '#ffd23f'); fg.addColorStop(1, 'rgba(255,94,58,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(0, 12 + fl); ctx.lineTo(6, 12); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle = api.c.ink2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-14, 16); ctx.moveTo(8, 8); ctx.lineTo(14, 16); ctx.moveTo(-17, 16); ctx.lineTo(-11, 16); ctx.moveTo(11, 16); ctx.lineTo(17, 16); ctx.stroke();
      const g = ctx.createLinearGradient(0, -16, 0, 12); g.addColorStop(0, `hsl(${api.hue},90%,80%)`); g.addColorStop(1, `hsl(${api.hue},80%,50%)`);
      ctx.fillStyle = g; ctx.shadowColor = `hsl(${api.hue},95%,60%)`; ctx.shadowBlur = 14; api.rr(ctx, -12, -14, 24, 26, 9); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#0d1130'; ctx.beginPath(); ctx.arc(0, -3, 5.5, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(86,224,255,.9)'; ctx.beginPath(); ctx.arc(-1.5, -4.5, 2, 0, 7); ctx.fill();
      ctx.restore();
    }
    // gauges: fuel, speed, ships
    const bw = Math.min(150, W * .36);
    ctx.fillStyle = api.c.line; api.rr(ctx, 14, 14, bw, 10, 5); ctx.fill();
    ctx.fillStyle = fuel > .25 ? '#56e0ff' : '#ff5470'; api.rr(ctx, 14, 14, Math.max(0, bw * fuel), 10, 5); ctx.fill();
    ctx.font = '700 14px Rajdhani,sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = api.c.ink2; ctx.fillText('Fuel', 14, 36);
    const fast = vy > LIMIT || Math.abs(vx) > SIDE;
    ctx.fillStyle = lock ? api.c.ink2 : fast ? '#ff5470' : '#3ddc84'; ctx.fillText(lock ? '' : fast ? 'Too fast  ' + Math.round(vy) : 'Safe speed  ' + Math.round(Math.max(0, vy)), 14, 54);
    ctx.textAlign = 'right'; ctx.fillStyle = api.c.ink2; ctx.fillText('Pad ' + (level + 1) + (wind ? (wind > 0 ? '   wind →' : '   ← wind') : ''), W - 14, 19);
    ctx.fillStyle = '#ff5ea8'; ctx.fillText('▲'.repeat(Math.max(0, ships)), W - 14, 38);
  });
} });
