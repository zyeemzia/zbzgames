/* Nova Blaster · ZBZGames™ original. Your ship fires by itself: slide it under the raiders and let none of them slip past. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let sx = w() / 2, tx = sx, shots = [], foes = [], drops = [], lives = 3, t = 0, fire = 0, spawn = .8, power = 0, safe = 0, kills = 0, tilt = 0;
  const keys = {};
  const follow = e => { const r = api.stage.getBoundingClientRect(); tx = e.clientX - r.left; };
  api.on(api.stage, 'pointermove', follow); api.on(api.stage, 'pointerdown', follow);
  api.on(window, 'keydown', e => { keys[e.key] = true; }); api.on(window, 'keyup', e => { keys[e.key] = false; });
  api.on(window, 'blur', () => { for (const k in keys) keys[k] = false; });
  const HUES = [335, 28, 268];
  function hurt(x, y) {
    lives--; safe = 1.4; api.sfx('bad'); api.fx.shake(9); api.fx.burst(x, y, '#ff5470', 22, 260);
    if (lives <= 0) api.end(`You shot down ${kills} raider${kills === 1 ? '' : 's'}.`);
  }
  api.probe = () => ({ lives, kills, foes: foes.length });
  api.loop(dt => {
    const W = w(), H = h(), sy = H - 64;
    t += dt; safe = Math.max(0, safe - dt); power = Math.max(0, power - dt);
    if (keys.ArrowLeft || keys.a || keys.A) tx -= 560 * dt;
    if (keys.ArrowRight || keys.d || keys.D) tx += 560 * dt;
    tx = Math.max(20, Math.min(W - 20, tx));
    const before = sx; sx += (tx - sx) * Math.min(1, dt * 14); tilt += ((sx - before) / Math.max(dt, .001) / 900 - tilt) * Math.min(1, dt * 10);
    fire -= dt;
    if (fire <= 0) {
      fire = power > 0 ? .16 : .24;
      if (power > 0) { shots.push({ x: sx - 11, y: sy - 18 }, { x: sx + 11, y: sy - 18 }); } else shots.push({ x: sx, y: sy - 24 });
    }
    spawn -= dt;
    if (spawn <= 0) {
      spawn = Math.max(.34, 1.05 - t / 80) * api.rand(.7, 1.3);
      const hp = 1 + (t > 20 && Math.random() < .3 ? 1 : 0) + (t > 50 && Math.random() < .25 ? 1 : 0), r = 15 + hp * 3;
      foes.push({ x0: api.rand(r + 8, Math.max(r + 9, W - r - 8)), x: 0, y: -r - 6, r, hp, max: hp, vy: Math.min(230, 62 + t * 1.3 + api.rand(0, 36)), ph: api.rand(0, 6), amp: api.rand(0, Math.min(60, 12 + t)), hit: 0 });
    }
    api.bg(ctx, W, H);
    // shots
    ctx.fillStyle = '#9ff3ff'; ctx.shadowColor = '#56e0ff'; ctx.shadowBlur = 12;
    for (const s of shots) { s.y -= 640 * dt; api.rr(ctx, s.x - 2.5, s.y - 9, 5, 18, 2.5); ctx.fill(); }
    ctx.shadowBlur = 0;
    shots = shots.filter(s => s.y > -20 && !s.dead);
    // raiders
    for (const f of foes) {
      f.y += f.vy * dt; f.x = Math.max(f.r, Math.min(W - f.r, f.x0 + Math.sin(t * 2 + f.ph) * f.amp)); f.hit = Math.max(0, f.hit - dt * 6);
      for (const s of shots) {
        if (s.dead || Math.abs(s.x - f.x) > f.r + 3 || Math.abs(s.y - f.y) > f.r + 9) continue;
        s.dead = true; f.hp--; f.hit = 1;
        if (f.hp <= 0) {
          f.dead = true; kills++; api.add(f.max); api.sfx('pop');
          api.fx.burst(f.x, f.y, `hsl(${HUES[f.max - 1]},95%,65%)`, 10 + f.max * 5, 220);
          if (f.max > 1) api.fx.text(f.x, f.y - 16, '+' + f.max, '#ffd23f', 20);
          if (Math.random() < .09) drops.push({ x: f.x, y: f.y, kind: lives < 3 && Math.random() < .4 ? 'life' : 'power' });
          break;
        }
      }
      if (f.dead) continue;
      const hue = HUES[f.max - 1], g = ctx.createLinearGradient(0, f.y - f.r, 0, f.y + f.r);
      g.addColorStop(0, f.hit > .3 ? '#fff' : `hsl(${hue},95%,70%)`); g.addColorStop(1, `hsl(${hue + 16},82%,42%)`);
      ctx.fillStyle = g; ctx.shadowColor = `hsl(${hue},95%,60%)`; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.moveTo(f.x, f.y + f.r); ctx.lineTo(f.x + f.r, f.y - f.r * .2); ctx.lineTo(f.x + f.r * .55, f.y - f.r * .85); ctx.lineTo(f.x - f.r * .55, f.y - f.r * .85); ctx.lineTo(f.x - f.r, f.y - f.r * .2); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(8,10,30,.7)'; ctx.beginPath(); ctx.arc(f.x - f.r * .3, f.y - f.r * .18, f.r * .15, 0, 7); ctx.arc(f.x + f.r * .3, f.y - f.r * .18, f.r * .15, 0, 7); ctx.fill();
      if (f.max > 1) { ctx.fillStyle = 'rgba(255,255,255,.85)'; for (let k = 0; k < f.hp; k++) ctx.fillRect(f.x - f.max * 4 + k * 8 + 1, f.y - f.r - 8, 6, 3); }
      if (f.y - f.r > H) { f.dead = true; hurt(f.x, H - 12); if (!api.alive) return; }
      else if (safe <= 0 && Math.abs(f.x - sx) < f.r + 15 && Math.abs(f.y - sy) < f.r + 16) { f.dead = true; hurt(sx, sy); if (!api.alive) return; }
    }
    foes = foes.filter(f => !f.dead);
    // falling bonuses
    for (const d of drops) {
      d.y += 150 * dt;
      const col = d.kind === 'life' ? '#ff5ea8' : '#ffd23f';
      ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(d.x, d.y, 12, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#1a1205'; ctx.font = '700 15px Rajdhani,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.kind === 'life' ? '♥' : '×2', d.x, d.y + 1);
      if (Math.abs(d.x - sx) < 30 && Math.abs(d.y - sy) < 30) {
        d.got = true; api.sfx('star'); api.fx.burst(d.x, d.y, col, 14);
        if (d.kind === 'life') { lives = Math.min(3, lives + 1); api.fx.text(sx, sy - 34, '+1 life', col, 20); } else { power = 7; api.fx.text(sx, sy - 34, 'Double fire', col, 20); }
      }
    }
    drops = drops.filter(d => !d.got && d.y < H + 20);
    // the ship
    if (safe <= 0 || Math.floor(t * 12) % 2) {
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.max(-.35, Math.min(.35, tilt)));
      ctx.fillStyle = 'rgba(86,224,255,.35)'; ctx.beginPath(); ctx.moveTo(-7, 16); ctx.lineTo(7, 16); ctx.lineTo(0, 30 + Math.random() * 12); ctx.closePath(); ctx.fill();
      const g = ctx.createLinearGradient(0, -24, 0, 18); g.addColorStop(0, '#e8fbff'); g.addColorStop(.5, '#56e0ff'); g.addColorStop(1, '#2563eb');
      ctx.fillStyle = g; ctx.shadowColor = power > 0 ? '#ffd23f' : '#56e0ff'; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(18, 16); ctx.lineTo(0, 8); ctx.lineTo(-18, 16); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(8,10,30,.65)'; ctx.beginPath(); ctx.ellipse(0, -4, 4, 7, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    ctx.font = '700 18px Rajdhani,sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff5ea8'; ctx.fillText('♥'.repeat(lives), 14, 22);
    ctx.fillStyle = api.c.ink2; ctx.fillText('♥'.repeat(3 - lives), 14 + ctx.measureText('♥'.repeat(lives)).width, 22);
    if (power > 0) { ctx.fillStyle = '#ffd23f'; api.rr(ctx, W - 114, 18, 100 * power / 7, 7, 3.5); ctx.fill(); }
  });
} });
