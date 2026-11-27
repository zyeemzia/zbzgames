/* Box Battle · ZBZGames™ original. Take turns joining two dots. Close the fourth side of a box and it is yours, and you go again. Most boxes wins. */
ZBZ.register({ start(api) {
  const { ctx, w, h } = api.canvas();
  const N = 4, hE = Array(N * (N + 1)).fill(0), vE = Array(N * (N + 1)).fill(0), owner = Array(N * N).fill(0);
  let turn = 1, busy = false, done = false, last = null, kb = false, cx = 1, cy = 0, t = 0, glow = [];
  const geo = () => { const W = w(), H = h(), s = Math.min(W * .84, (H - 110) * .92) / N; return { s, ox: (W - s * N) / 2, oy: (H - s * N) / 2 + 18 }; };
  const sides = (r, c) => hE[r * N + c] + hE[(r + 1) * N + c] + vE[r * (N + 1) + c] + vE[r * (N + 1) + c + 1] > 0 ? [hE[r * N + c], hE[(r + 1) * N + c], vE[r * (N + 1) + c], vE[r * (N + 1) + c + 1]].filter(Boolean).length : 0;
  const boxesOf = (kind, i) => {       // the one or two boxes an edge belongs to
    const out = [];
    if (kind === 'h') { const r = Math.floor(i / N), c = i % N; if (r > 0) out.push([r - 1, c]); if (r < N) out.push([r, c]); }
    else { const r = Math.floor(i / (N + 1)), c = i % (N + 1); if (c > 0) out.push([r, c - 1]); if (c < N) out.push([r, c]); }
    return out;
  };
  const count = who => owner.filter(o => o === who).length;
  function draw(kind, i, who) {
    const E = kind === 'h' ? hE : vE;
    if (E[i]) return -1;
    E[i] = who; last = [kind, i];
    let made = 0;
    for (const [r, c] of boxesOf(kind, i)) if (!owner[r * N + c] && sides(r, c) === 4) { owner[r * N + c] = who; made++; glow.push({ r, c, life: 1 }); }
    return made;
  }
  function finish() {
    done = true; busy = true;
    const me = count(1), bot = count(2);
    api.score(me * 5 + (me > bot ? 30 : 0));
    if (me > bot) { api.sfx('win'); api.fx.confetti(); }
    api.after(1000, () => api.end(me > bot ? `You win ${me} boxes to ${bot}. That is a bonus of 30.` : me === bot ? `A draw, ${me} boxes each.` : `The bot wins ${bot} boxes to ${me}. Try not to draw the third side of a box.`));
  }
  function mine(kind, i) {
    if (busy || done || turn !== 1) return;
    const made = draw(kind, i, 1);
    if (made < 0) { api.note(180, .06, .04); return; }
    api.sfx(made ? 'point' : 'tap');
    if (made) { api.score(count(1) * 5); const g = geo(), [r, c] = boxesOf(kind, i).find(([br, bc]) => owner[br * N + bc] === 1 && sides(br, bc) === 4) || [0, 0]; api.fx.burst(g.ox + (c + .5) * g.s, g.oy + (r + .5) * g.s, `hsl(${api.hue},95%,68%)`, 12); }
    if (owner.every(Boolean)) return finish();
    if (!made) { turn = 2; busy = true; api.after(650, bot); }
  }
  function bot() {
    if (done) return;
    const free = [];
    hE.forEach((v, i) => { if (!v) free.push(['h', i]); }); vE.forEach((v, i) => { if (!v) free.push(['v', i]); });
    const closes = free.filter(([k, i]) => boxesOf(k, i).some(([r, c]) => sides(r, c) === 3));
    const calm = free.filter(([k, i]) => boxesOf(k, i).every(([r, c]) => sides(r, c) < 2));
    const [k, i] = api.pick(closes.length ? closes : calm.length ? calm : free);
    const made = draw(k, i, 2);
    api.note(made ? 300 : 240, .1, .06);
    if (owner.every(Boolean)) return finish();
    if (made) api.after(480, bot); else { turn = 1; busy = false; }
  }
  api.tap((x, y) => {
    kb = false;
    const g = geo(), gx = (x - g.ox) / g.s, gy = (y - g.oy) / g.s;
    if (gx < -.4 || gy < -.4 || gx > N + .4 || gy > N + .4) return;
    const hr = Math.max(0, Math.min(N, Math.round(gy))), hc = Math.max(0, Math.min(N - 1, Math.floor(gx))), hd = Math.abs(gy - hr);
    const vc = Math.max(0, Math.min(N, Math.round(gx))), vr = Math.max(0, Math.min(N - 1, Math.floor(gy))), vd = Math.abs(gx - vc);
    if (Math.min(hd, vd) > .42) return;
    if (hd <= vd) mine('h', hr * N + hc); else mine('v', vr * (N + 1) + vc);
  });
  api.key((k, e) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
    if (d) { kb = true; cx = Math.max(0, Math.min(2 * N, cx + d[0])); cy = Math.max(0, Math.min(2 * N, cy + d[1])); }
    else if ((k === 'Enter' || k === ' ') && kb && !e.repeat) {
      if (cx % 2 === 1 && cy % 2 === 0) mine('h', cy / 2 * N + (cx - 1) / 2); else if (cx % 2 === 0 && cy % 2 === 1) mine('v', (cy - 1) / 2 * (N + 1) + cx / 2); else api.note(180, .06, .04);
    }
  });
  api.probe = () => ({ N, h: hE.slice(), v: vE.slice(), owner: owner.slice(), turn, busy, done, geo: geo() });
  api.loop(dt => {
    const W = w(), H = h(), { s, ox, oy } = geo(), colMe = `hsl(${api.hue},90%,60%)`, colBot = `hsl(${(api.hue + 150) % 360},90%,62%)`;
    t += dt;
    api.bg(ctx, W, H);
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const o = owner[r * N + c]; if (!o) continue;
      ctx.globalAlpha = .26; ctx.fillStyle = o === 1 ? colMe : colBot; api.rr(ctx, ox + c * s + 5, oy + r * s + 5, s - 10, s - 10, 10); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = o === 1 ? colMe : colBot; ctx.font = `700 ${Math.round(s * .36)}px Rajdhani,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o === 1 ? 'You' : 'Bot', ox + (c + .5) * s, oy + (r + .5) * s + 1);
    }
    glow = glow.filter(g => (g.life -= dt * 2) > 0);
    for (const g of glow) { ctx.globalAlpha = g.life * .5; ctx.fillStyle = '#fff'; api.rr(ctx, ox + g.c * s + 5, oy + g.r * s + 5, s - 10, s - 10, 10); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.lineCap = 'round';
    const line = (x1, y1, x2, y2, who, isLast) => {
      ctx.strokeStyle = who === 1 ? colMe : who === 2 ? colBot : api.c.line; ctx.lineWidth = who ? 6 : 3;
      if (isLast) { ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14; }
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.shadowBlur = 0;
    };
    hE.forEach((v, i) => { const r = Math.floor(i / N), c = i % N; line(ox + c * s, oy + r * s, ox + (c + 1) * s, oy + r * s, v, last && last[0] === 'h' && last[1] === i); });
    vE.forEach((v, i) => { const r = Math.floor(i / (N + 1)), c = i % (N + 1); line(ox + c * s, oy + r * s, ox + c * s, oy + (r + 1) * s, v, last && last[0] === 'v' && last[1] === i); });
    ctx.fillStyle = api.c.ink;
    for (let r = 0; r <= N; r++) for (let c = 0; c <= N; c++) { ctx.beginPath(); ctx.arc(ox + c * s, oy + r * s, 5.5, 0, 7); ctx.fill(); }
    if (kb) { ctx.strokeStyle = '#56e0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ox + cx * s / 2, oy + cy * s / 2, 13 + Math.sin(t * 6) * 1.5, 0, 7); ctx.stroke(); }
    ctx.font = '700 18px Rajdhani,sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillStyle = api.c.ink; ctx.fillText(done ? 'All boxes taken' : turn === 1 ? 'Your turn: join two dots' : 'The bot is thinking…', W / 2, Math.max(20, oy - 52));
    ctx.font = '700 16px Rajdhani,sans-serif';
    ctx.fillStyle = colMe; ctx.textAlign = 'right'; ctx.fillText('You ' + count(1), W / 2 - 12, Math.max(42, oy - 28));
    ctx.fillStyle = colBot; ctx.textAlign = 'left'; ctx.fillText('Bot ' + count(2), W / 2 + 12, Math.max(42, oy - 28));
  });
} });
