/* Fruit Catch · ZBZGames™ original, for kids. Move the basket; catch the fruit, skip the rocks. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const FRUIT = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍐', '🥭'];
  let bx = w() / 2, drops = [], spawn = 0, hearts = 3, speed = 1;
  const keys = {};
  const follow = e => { const r = api.stage.getBoundingClientRect(); bx = e.clientX - r.left; };
  api.on(api.stage, 'pointermove', follow); api.on(api.stage, 'pointerdown', follow);
  api.on(window, 'keydown', e => { keys[e.key] = true; }); api.on(window, 'keyup', e => { keys[e.key] = false; });
  api.loop(dt => {
    const W = w(), H = h(), bw = Math.max(80, W * .18), by = H - 50;
    if (keys.ArrowLeft) bx -= 480 * dt; if (keys.ArrowRight) bx += 480 * dt;
    bx = Math.max(bw / 2, Math.min(W - bw / 2, bx));
    speed = Math.min(2.4, speed + dt * .015);
    spawn -= dt;
    if (spawn <= 0) { const rock = Math.random() < .18; drops.push({ x: api.rand(24, W - 24), y: -30, e: rock ? '🪨' : api.pick(FRUIT), rock, vy: api.rand(120, 170) * speed }); spawn = Math.max(.35, .9 / speed); }
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7dd3fc'); g.addColorStop(1, '#bbf7d0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#4ade80'; ctx.fillRect(0, H - 22, W, 22);
    ctx.font = '34px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const d of drops) {
      d.y += d.vy * dt;
      ctx.fillText(d.e, d.x, d.y);
      if (!d.gone && d.y > by - 18 && d.y < by + 20 && Math.abs(d.x - bx) < bw / 2) {
        d.gone = true;
        if (d.rock) { hearts--; api.sfx('bad'); if (hearts <= 0) { api.end('Too many rocks in the basket.'); return; } }
        else { api.add(1); api.sfx('point'); }
      } else if (!d.gone && !d.rock && d.y > H) {
        d.gone = true; hearts--; api.sfx('bad');
        if (hearts <= 0) { api.end('Three fruits fell to the ground.'); return; }
      }
    }
    drops = drops.filter(d => !d.gone && d.y < H + 40);
    ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.moveTo(bx - bw / 2, by - 14); ctx.lineTo(bx + bw / 2, by - 14); ctx.lineTo(bx + bw / 2 - 12, by + 20); ctx.lineTo(bx - bw / 2 + 12, by + 20); ctx.fill();
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = '22px serif'; ctx.textAlign = 'left'; ctx.fillText('❤️'.repeat(Math.max(0, hearts)), 12, 24);
  });
} });
