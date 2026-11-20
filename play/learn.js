/* ZBZGames™ Learn: letters and numbers for kids.  Copyright © ZyeemZia
 *
 * One engine behind the Bangla, Arabic and English learning games. A game file
 * calls ZBZLearn(config) with its alphabet and numbers; this does the rest:
 *   Learn  a big card per letter, spoken aloud with an example word
 *   Write  trace the letter with a finger; the tracing is checked and earns stars
 *   Quiz   hear a letter, pick it from four; ten questions per round
 * Speech uses the device's own voices. When a device has no voice for the
 * language, the card shows how to say it instead, and explains how to add one.
 */
window.ZBZLearn = function (cfg) {
  'use strict';
  /* Speech. Only a real voice for the game's language is ever used: when a
     phone has no Bangla or Arabic voice, browsers otherwise read the text with
     an English voice, which mangles every letter. Among the matching voices the
     clearest is chosen (natural or online voices first). Voices load late on
     some browsers, so the first request waits briefly for them. */
  const want = cfg.lang.toLowerCase(), base = want.split('-')[0];
  let voice = null, voicesReady = false;
  const score = v => (v.lang.toLowerCase() === want ? 4 : 0) + (/natural|neural|online|google|enhanced|premium/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
  function pickVoice() {
    try {
      const vs = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').split('-')[0] === base);
      voicesReady = voicesReady || speechSynthesis.getVoices().length > 0;
      voice = vs.sort((x, y) => score(y) - score(x))[0] || null;
    } catch { voice = null; }
    return voice;
  }
  try { pickVoice(); speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch { /* no speech */ }
  const waitVoices = () => new Promise(res => {
    if (voicesReady) return res();
    let n = 0; const t = setInterval(() => { pickVoice(); if (voicesReady || ++n > 15) { clearInterval(t); res(); } }, 100);
  });
  /* Returns true when it spoke with a proper voice. */
  async function speak(text, rate = .78) {
    try {
      if (ZBZ.store.get('muted', false) || !('speechSynthesis' in window)) return true;
      await waitVoices();
      if (!voice) pickVoice();
      if (!voice) return false;
      speechSynthesis.cancel();
      // Chrome sometimes stays paused after cancel; resume keeps it reliable.
      try { speechSynthesis.resume(); } catch { /* fine */ }
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice; u.lang = voice.lang; u.rate = rate; u.pitch = 1; u.volume = 1;
      speechSynthesis.speak(u);
      return true;
    } catch { return false; }
  }

  ZBZ.register({ start(api) {
    let set = 'letters', mode = 'learn', idx = 0, heard = new Set(), quiz = null;
    const items = () => cfg[set];
    const wrap = document.createElement('div');
    wrap.className = 'ln-wrap';
    wrap.dir = 'ltr';
    wrap.innerHTML = `
      <div class="ln-top">
        <div class="ln-seg" role="group" aria-label="What to learn">
          <button type="button" data-set="letters" aria-pressed="true">${cfg.labels.letters}</button>
          <button type="button" data-set="numbers" aria-pressed="false">${cfg.labels.numbers}</button>
        </div>
        <div class="ln-seg" role="group" aria-label="Mode">
          <button type="button" data-mode="learn" aria-pressed="true">👀 Learn</button>
          <button type="button" data-mode="write" aria-pressed="false">✍️ Write</button>
          <button type="button" data-mode="quiz" aria-pressed="false">🎯 Quiz</button>
        </div>
      </div>
      <div class="ln-body"></div>
      <p class="ln-voice" hidden></p>`;
    api.stage.appendChild(wrap);
    api.stage.style.touchAction = 'auto';
    const body = wrap.querySelector('.ln-body'), voiceNote = wrap.querySelector('.ln-voice');

    async function say(it) {
      const ok = await speak(it.say || it.ch);
      if (!ok) {
        voiceNote.hidden = false;
        voiceNote.innerHTML = `🔈 This device has no ${cfg.langName} voice, so the sound is written under each letter instead of spoken with the wrong accent. To hear it, add the ${cfg.langName} voice in your phone's text-to-speech settings (Google Text-to-Speech on Android, Spoken Content on iPhone), then reload.`;
      } else voiceNote.hidden = true;
    }
    const COUNTERS = ['🍎', '🐟', '🌸', '⭐', '🎈', '🐤', '🍊', '🚗', '🦋', '🍓'];
    const countHtml = (n, small) => `<div class="ln-count${small ? ' small' : ''}" aria-label="${n}">${n ? Array.from({ length: n }, () => `<span>${COUNTERS[n % COUNTERS.length]}</span>`).join('') : '<em>0</em>'}</div>`;
    const font = cfg.font ? `font-family:${cfg.font}` : '';
    const strip = () => `<div class="ln-strip" dir="${cfg.dir || 'ltr'}">${items().map((it, i) => `<button type="button" class="${i === idx ? 'on' : ''}" data-i="${i}" style="${font}">${it.ch}</button>`).join('')}</div>`;

    /* ---------- Learn ---------- */
    function learn() {
      const it = items()[idx];
      body.innerHTML = `
        <div class="ln-card" style="--c:${it.color || cfg.color}">
          <button class="ln-big" type="button" aria-label="Hear it" style="${font}">${it.ch}</button>
          ${it.count !== undefined ? countHtml(it.count) : ''}<div class="ln-word">${it.emoji ? `<span class="ln-emoji">${it.emoji}</span>` : ''}<span style="${font}" dir="${cfg.dir || 'ltr'}">${it.word || ''}</span></div>
          <div class="ln-roman">${it.roman || ''}</div>
          <div class="ln-nav">
            <button type="button" class="ln-prev" aria-label="Previous">◀</button>
            <button type="button" class="ln-say">🔊 Hear it</button>
            <button type="button" class="ln-next" aria-label="Next">▶</button>
          </div>
        </div>${strip()}`;
      if (!heard.has(set + idx)) { heard.add(set + idx); api.add(1); }
      say(it);
    }
    /* ---------- Write ---------- */
    let pad = null;
    function write() {
      const it = items()[idx];
      body.innerHTML = `
        <div class="ln-write">
          <div class="ln-pad"><canvas class="ln-guide"></canvas><canvas class="ln-ink"></canvas></div>
          <div class="ln-stars" aria-live="polite"></div>
          <div class="ln-nav">
            <button type="button" class="ln-prev" aria-label="Previous">◀</button>
            <button type="button" class="ln-clear">🧽 Clear</button>
            <button type="button" class="ln-check">✅ Check</button>
            <button type="button" class="ln-say" aria-label="Hear it">🔊</button>
            <button type="button" class="ln-next" aria-label="Next">▶</button>
          </div>
        </div>${strip()}`;
      const box = body.querySelector('.ln-pad'), g = body.querySelector('.ln-guide'), ink = body.querySelector('.ln-ink');
      const size = Math.min(box.clientWidth, 420), d = Math.min(devicePixelRatio || 1, 2);
      [g, ink].forEach(c => { c.width = c.height = Math.round(size * d); c.style.width = c.style.height = size + 'px'; });
      box.style.height = size + 'px';
      const gx = g.getContext('2d'), ix = ink.getContext('2d');
      gx.scale(d, d); ix.scale(d, d);
      const family = cfg.canvasFont || 'Rajdhani, sans-serif';
      const fit = () => {
        let fs = size * .78; gx.font = `700 ${fs}px ${family}`;
        const w = gx.measureText(it.ch).width; if (w > size * .82) fs *= size * .82 / w;
        return fs;
      };
      const fs = fit();
      const drawGuide = () => {
        gx.clearRect(0, 0, size, size);
        gx.textAlign = 'center'; gx.textBaseline = 'middle'; gx.font = `700 ${fs}px ${family}`;
        gx.fillStyle = api.c.dark ? 'rgba(255,255,255,.14)' : 'rgba(40,50,120,.12)';
        gx.fillText(it.ch, size / 2, size / 2 + fs * (cfg.baseline || .04));
        gx.setLineDash([6, 8]); gx.lineWidth = 2; gx.strokeStyle = api.c.dark ? 'rgba(255,255,255,.35)' : 'rgba(40,50,120,.3)';
        gx.strokeText(it.ch, size / 2, size / 2 + fs * (cfg.baseline || .04)); gx.setLineDash([]);
      };
      drawGuide();
      const W = Math.max(14, size * .07);
      ix.lineCap = ix.lineJoin = 'round'; ix.lineWidth = W; ix.strokeStyle = it.color || cfg.color;
      let drawing = false, last = null, strokes = 0;
      const pt = e => { const r = ink.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      api.on(ink, 'pointerdown', e => { e.preventDefault(); ink.setPointerCapture?.(e.pointerId); drawing = true; last = pt(e); strokes++; ix.beginPath(); ix.arc(last[0], last[1], W / 2, 0, 7); ix.fillStyle = ix.strokeStyle; ix.fill(); });
      api.on(ink, 'pointermove', e => { if (!drawing) return; const p = pt(e); ix.beginPath(); ix.moveTo(last[0], last[1]); ix.lineTo(p[0], p[1]); ix.stroke(); last = p; });
      api.on(ink, 'pointerup', () => { drawing = false; });
      api.on(ink, 'pointercancel', () => { drawing = false; });
      pad = {
        clear() { ix.clearRect(0, 0, size, size); body.querySelector('.ln-stars').textContent = ''; strokes = 0; },
        check() {
          if (!strokes) { body.querySelector('.ln-stars').textContent = 'Trace over the letter with your finger first.'; return; }
          // compare the tracing with the letter's own shape
          const m = document.createElement('canvas'); m.width = m.height = 160; const mx = m.getContext('2d'), k = 160 / size;
          mx.font = `700 ${fs * k}px ${family}`; mx.textAlign = 'center'; mx.textBaseline = 'middle';
          mx.fillText(it.ch, 80, 80 + fs * k * (cfg.baseline || .04));
          const shape = mx.getImageData(0, 0, 160, 160).data;
          const t = document.createElement('canvas'); t.width = t.height = 160; const tx = t.getContext('2d');
          tx.drawImage(ink, 0, 0, 160, 160);
          const user = tx.getImageData(0, 0, 160, 160).data;
          let inShape = 0, covered = 0, inked = 0, outside = 0;
          for (let i = 3; i < shape.length; i += 4) {
            const s = shape[i] > 60, u = user[i] > 60;
            if (s) { inShape++; if (u) covered++; }
            if (u) { inked++; if (!s) outside++; }
          }
          const cover = covered / Math.max(1, inShape), stray = outside / Math.max(1, inked);
          const stars = cover > .6 && stray < .42 ? 3 : cover > .42 && stray < .52 ? 2 : cover > .3 && stray < .7 ? 1 : 0;
          body.querySelector('.ln-stars').innerHTML = stars ? '⭐'.repeat(stars) + ` <span>${['', 'Good try!', 'Well done!', 'Perfect!'][stars]}</span>` : 'Almost! Follow the dotted shape and try again.';
          if (stars) { api.add(stars); api.sfx(stars === 3 ? 'win' : 'star'); say(it); } else api.sfx('bad');
        }
      };
    }
    /* ---------- Quiz ---------- */
    function newQuestion() {
      const list = items(), ans = Math.floor(Math.random() * list.length);
      const opts = new Set([ans]); while (opts.size < Math.min(4, list.length)) opts.add(Math.floor(Math.random() * list.length));
      quiz.q = { ans, opts: [...opts].sort(() => Math.random() - .5) };
      quiz.n++;
      const it = list[ans];
      body.innerHTML = `
        <div class="ln-quiz">
          <p class="ln-qhead">Question ${quiz.n} of 10 · ${quiz.right} right</p>
          <button type="button" class="ln-say ln-hear">🔊 Listen, then tap the right one</button>
          ${it.count !== undefined ? countHtml(it.count, true) : `<p class="ln-hint ln-pic">${it.emoji || '❓'}</p>`}
          <div class="ln-opts">${quiz.q.opts.map(i => `<button type="button" data-o="${i}" style="${font}">${list[i].ch}</button>`).join('')}</div>
        </div>`;
      api.after(250, () => say(it));
    }
    function startQuiz() { quiz = { n: 0, right: 0, q: null, locked: false }; newQuestion(); }

    function render() {
      wrap.querySelectorAll('[data-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.set === set)));
      wrap.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
      if (idx >= items().length) idx = 0;
      if (mode === 'learn') learn(); else if (mode === 'write') write(); else startQuiz();
    }
    const go = d => { idx = (idx + d + items().length) % items().length; api.sfx('tap'); render(); };

    api.on(wrap, 'click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.set) { set = b.dataset.set; idx = 0; api.sfx('tap'); return render(); }
      if (b.dataset.mode) { mode = b.dataset.mode; api.sfx('tap'); return render(); }
      if (b.dataset.i !== undefined) { idx = +b.dataset.i; api.sfx('tap'); return render(); }
      if (b.classList.contains('ln-prev')) return go(-1);
      if (b.classList.contains('ln-next')) return go(1);
      if (b.classList.contains('ln-big') || b.classList.contains('ln-say')) return say(mode === 'quiz' ? items()[quiz.q.ans] : items()[idx]);
      if (b.classList.contains('ln-clear')) return pad && pad.clear();
      if (b.classList.contains('ln-check')) return pad && pad.check();
      if (b.dataset.o !== undefined && quiz && !quiz.locked) {
        quiz.locked = true;
        const ok = +b.dataset.o === quiz.q.ans;
        b.classList.add(ok ? 'ok' : 'no');
        if (!ok) wrap.querySelector(`[data-o="${quiz.q.ans}"]`).classList.add('ok');
        if (ok) { quiz.right++; api.add(10); api.sfx('point'); } else api.sfx('bad');
        api.after(ok ? 800 : 1500, () => {
          quiz.locked = false;
          if (quiz.n >= 10) api.end(`${quiz.right} out of 10 right in the ${cfg.langName} quiz. ${quiz.right >= 8 ? 'Brilliant!' : 'Keep practising!'}`);
          else newQuestion();
        });
      }
    });
    api.key(k => { if (mode !== 'quiz') { if (k === 'ArrowRight') go(cfg.dir === 'rtl' ? -1 : 1); if (k === 'ArrowLeft') go(cfg.dir === 'rtl' ? 1 : -1); if (k === ' ') say(items()[idx]); } });
    render();
  } });
};
