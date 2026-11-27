/* Sky Juggle · ZBZGames™ original. Keep the ball in the air: tap it before it drops. Every tap counts, and it gets livelier as you go. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  let x = w() / 2, y = h() * .3, vx = 0, vy = 0, kicks = 0, spin = 0, t = 0, squash = 0, started = false;
  const rad = () => Math.max(26, 44 - kicks * .35), grav = () => Math.min(1500, 820 + kicks * 14);
  function kick(dx) {
    started = true; kicks++; vy = -Math.min(760, 560 + kicks * 4); vx = Math.max(-330, Math.min(330, vx * .3 + dx)); squash = 1;
    api.add(1); api.note(392 + (kicks % 8) * 44, .12, .07); api.fx.burst(x, y + rad() * .6, `hsl(${(api.hue + kicks * 23) % 360},95%,68%)`, 8, 150);
    if (kicks % 10 === 0) { api.add(5); api.sfx('star'); api.fx.text(x, Math.max(30, y - rad() - 16), kicks + ' taps! +5', '#ffd23f', 22); }
  }
  api.tap((px, py) => { if (Math.hypot(px - x, py - y) <= rad() + 22) kick((x - px) * 7.5); else if (started) api.note(180, .05, .03); });
  api.key((k, e) => {
    if (e.repeat || (started && y < h() * .38)) return;      // the keys only reach a ball that has come down
    if (k === ' ' || k === 'ArrowUp') kick(api.rand(-40, 40)); else if (k === 'ArrowLeft') kick(-170); else if (k === 'ArrowRight') kick(170);
  });
  api.probe = () => ({ x, y, vx, vy, r: rad(), kicks, started });
  api.loop(dt => {
    const W = w(), H = h(), r = rad(), col = (api.hue + kicks * 23) % 360;
    t += dt; squash = Math.max(0, squash - dt * 4);
    if (started) { vy += grav() * dt; x += vx * dt; y += vy * dt; spin += vx * dt / r; }
    else y = H * .3 + Math.sin(t * 2.4) * 8;
    if (x < r) { x = r; vx = Math.abs(vx) * .9; api.note(300, .05, .03); }
    if (x > W - r) { x = W - r; vx = -Math.abs(vx) * .9; api.note(300, .05, .03); }
    if (y < r && vy < 0) { y = r; vy = Math.abs(vy) * .5; }
    api.bg(ctx, W, H);
    // the ground it must not touch
    const gr = ctx.createLinearGradient(0, H - 26, 0, H); gr.addColorStop(0, 'rgba(255,84,112,0)'); gr.addColorStop(1, 'rgba(255,84,112,.4)');
    ctx.fillStyle = gr; ctx.fillRect(0, H - 26, W, 26);
    // a soft shadow shows where it will come down
    const sh = Math.max(.25, Math.min(1, y / H));
    ctx.fillStyle = 'rgba(8,10,30,.22)'; ctx.beginPath(); ctx.ellipse(x, H - 12, r * sh, 5 * sh + 1, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.scale(1 + squash * .14, 1 - squash * .16); ctx.rotate(spin);
    const g = ctx.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r); g.addColorStop(0, '#fff'); g.addColorStop(.35, `hsl(${col},95%,70%)`); g.addColorStop(1, `hsl(${col},85%,44%)`);
    ctx.fillStyle = g; ctx.shadowColor = `hsl(${col},95%,60%)`; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, r * .62, i * 2.094, i * 2.094 + 1.2); ctx.stroke(); }
    ctx.restore();
    if (!started) { ctx.fillStyle = api.c.ink; ctx.font = '700 20px Rajdhani,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Tap the ball', W / 2, H * .3 + r + 34); }
    if (y - r > H) { api.fx.shake(7); api.end(kicks ? `${kicks} tap${kicks === 1 ? '' : 's'} before it touched the ground.` : 'Tap the ball to keep it up.'); }
  });
} });
