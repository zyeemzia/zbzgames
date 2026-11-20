"""Builds the ZBZGames(TM) Arcade: play/index.html, one page per game, the web app
manifest, the service worker and sitemap.xml.  Copyright (c) ZyeemZia

Run from the repository root:   python tools/build_arcade.py
Add a game: write play/games/<id>.js and add one entry to GAMES below.
"""
import html, json, os, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGIN = 'https://zbzgames.zyeemzia.com'
CATS = [('all', 'All games'), ('kids', 'Kids'), ('arcade', 'Arcade'), ('puzzle', 'Puzzle'), ('brain', 'Brain'), ('quick', 'Quick play')]

GAMES = [
    dict(id='orbit-dash', name='Orbit Dash', icon='🪐', hue=265, cats=['arcade', 'quick'],
         desc='Circle the core, grab the stars and flip direction before the spikes.',
         how='Tap, click or press Space to flip direction. Collect stars, dodge the red spikes. It speeds up.'),
    dict(id='stack-tower', name='Stack Tower', icon='🏗️', hue=200, cats=['arcade', 'quick', 'kids'],
         desc='Drop each sliding block on the tower. Only the overlap stays.',
         how='Tap or press Space to drop the block. Land it exactly for a perfect bonus.'),
    dict(id='sky-glider', name='Sky Glider', icon='🛩️', hue=40, cats=['arcade', 'quick'],
         desc='Lift your glider through the neon gates of the night sky.',
         how='Tap or press Space to lift. Fly through the gaps; touching a gate ends the flight.'),
    dict(id='byte-serpent', name='Byte Serpent', icon='🐍', hue=170, cats=['arcade'],
         desc='Guide the data serpent, eat the golden bits and grow without biting your tail.',
         how='Swipe, or use the arrow keys or WASD. The walls wrap around; only your own tail is deadly.'),
    dict(id='pulse-breaker', name='Pulse Breaker', icon='🧱', hue=190, cats=['arcade'],
         desc='Bounce the energy ball and shatter wall after wall of neon bricks.',
         how='Move with your finger, the mouse or the arrow keys. Gold bricks take two hits. Three balls per game.'),
    dict(id='merge-matrix', name='Merge Matrix', icon='🔢', hue=300, cats=['puzzle', 'brain'],
         desc='Slide the grid so equal tiles fuse. Can you reach 2048?',
         how='Swipe or use the arrow keys. Two equal tiles that touch become one. The game ends when no move is left.'),
    dict(id='mine-sentinel', name='Mine Sentinel', icon='💣', hue=350, cats=['puzzle', 'brain'],
         desc='Clear the field using the numbers. Each one counts the mines around it.',
         how='Tap to dig. Long-press, right-click or switch to Flag mode to mark a mine. Your first dig is always safe.'),
    dict(id='word-forge', name='Word Forge', icon='🔤', hue=45, cats=['brain', 'puzzle'],
         desc='Find the hidden five-letter word in six tries, then forge the next.',
         how='Type or tap letters. Gold: right letter, right place. Blue: in the word, elsewhere. Grey: not in it.'),
    dict(id='math-sprint', name='Math Sprint', icon='➗', hue=140, cats=['kids', 'brain', 'quick'],
         desc='Sixty seconds of quick sums. The faster you go, the harder it gets.',
         how='Tap the right answer, or press 1 to 4. A wrong answer costs three seconds.'),
    dict(id='memory-stars', name='Memory Stars', icon='⭐', hue=50, cats=['kids', 'brain'],
         desc='Flip the cards and find every matching pair of animals, fruit or vehicles.',
         how='Tap two cards. A match stays open. Find all eight pairs with as few misses as you can.'),
    dict(id='bubble-pop', name='Bubble Pop', icon='🎈', hue=210, cats=['kids', 'quick'],
         desc='Pop the bubbles with the right letter, number or colour. Learn while you play.',
         how='Pop only the bubbles that match the target at the top. You have 60 seconds.'),
    dict(id='fruit-catch', name='Fruit Catch', icon='🧺', hue=110, cats=['kids', 'arcade'],
         desc='Slide the basket, catch the falling fruit and keep the rocks out.',
         how='Move with your finger, the mouse or the arrow keys. Three hearts: a dropped fruit or a caught rock costs one.'),
    dict(id='bangla-letters', name='Bangla Barnamala', icon='🔤', hue=200, cats=['kids', 'brain'], learn=True,
         fonts='Noto+Sans+Bengali:wght@500;700',
         desc='Learn every Bangla letter and number: hear it spoken, trace it with your finger, then play a quiz.',
         how='Pick Letters or Numbers, then Learn, Write or Quiz. Tap a letter to hear it. In Write, trace the dotted letter and press Check for stars.'),
    dict(id='arabic-letters', name='Alif Ba', icon='🌙', hue=160, cats=['kids', 'brain'], learn=True,
         fonts='Noto+Naskh+Arabic:wght@500;700',
         desc='The Arabic alphabet and numbers for kids: hear each letter, trace it, and test yourself.',
         how='Pick Letters or Numbers, then Learn, Write or Quiz. Tap a letter to hear its name and a word that starts with it.'),
    dict(id='english-letters', name='ABC Adventure', icon='🅰️', hue=270, cats=['kids', 'brain'], learn=True,
         desc='A to Z and 0 to 10 with pictures and voice: learn, trace each letter, then take the quiz.',
         how='Pick Letters or Numbers, then Learn, Write or Quiz. Tap the big letter to hear it again.'),
    dict(id='neon-lanes', name='Neon Lanes', icon='🏎️', hue=320, cats=['arcade', 'quick'],
         desc='Swerve between three neon lanes, dodge the traffic and grab the gold.',
         how='Tap the left or right half, or use the arrow keys, to change lane. Gold squares are a bonus.'),
    dict(id='quick-draw', name='Quick Draw', icon='⚡', hue=130, cats=['quick', 'brain'],
         desc='Wait for green, then tap faster than anyone. How sharp are your reflexes?',
         how='When the screen turns green, tap or press Space. Five rounds. Tapping on red costs you.'),
    dict(id='slide-shift', name='Slide Shift', icon='🧩', hue=230, cats=['puzzle', 'brain'],
         desc='Slide the scrambled tiles back into order from 1 to 15.',
         how='Tap a tile in line with the gap to slide it, or use the arrow keys. Fewer moves, higher score.'),
    dict(id='hue-hunter', name='Hue Hunter', icon='🎨', hue=20, cats=['brain', 'kids', 'quick'],
         desc='One tile is a slightly different colour. Spot it before the clock runs out.',
         how='Tap the odd tile out. Every level adds tiles and makes the difference subtler. A wrong tap costs three seconds.'),
    dict(id='echo-lights', name='Echo Lights', icon='🚦', hue=150, cats=['kids', 'brain'],
         desc='Watch the coloured lights, then play the pattern back. It grows every round.',
         how='Watch the sequence, then tap the lights in the same order, or press 1 to 4.'),
    dict(id='grid-duel', name='Grid Duel', icon='❌', hue=0, cats=['kids', 'brain'],
         desc='Noughts and crosses against the ZBZGames™ bot, which gets sharper as you win.',
         how='Tap a square, or press 1 to 9, to place your cross. Three in a row wins. Keep going until the bot beats you.'),
    dict(id='mole-patrol', name='Mole Patrol', icon='🐹', hue=90, cats=['kids', 'quick'],
         desc='Tap the moles as they pop up, but leave the bunnies alone.',
         how='Tap each mole before it hides. Tapping a bunny costs two points. You have 45 seconds.'),
]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">')
e = lambda s: html.escape(str(s), quote=True)


def head(title, desc, path, extra=''):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{ORIGIN}{path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="ZBZGames">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{ORIGIN}{path}"><meta property="og:image" content="{ORIGIN}/icon-512.png">
<meta name="theme-color" content="#f4f5fc" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#05060f" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<script>try{{var t=localStorage.getItem("matrixTheme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}}catch(e){{}}</script>
<link rel="icon" href="/favicon.ico?v=4" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=4">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=4">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ZBZGames"><meta name="application-name" content="ZBZGames">
{FONTS}
<link rel="stylesheet" href="/play/arcade.css?v={VER}">
<script src="/zz-app.js?v=4" data-icon="4" data-sw="/sw.js" data-name="ZBZGames" defer></script>
{extra}
</head>'''


def bar(current):
    return f'''<header class="bar"><div class="wrap">
  <a class="logo" href="/play/"><img src="/icon-192.png?v=4" width="34" height="34" alt=""><span>ZBZ<b>Games™</b></span></a>
  <nav aria-label="Main">
    <a href="/play/"{' aria-current="page"' if current == 'arcade' else ''}>Arcade</a>
    <a href="/play/#kids" class="hide-sm">Kids</a>
    <a href="/" class="hide-sm">Studio</a>
    <span data-zz-install></span>
    <button class="theme-btn" id="themeBtn" type="button" aria-label="Switch light or dark theme"><svg class="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="moon" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
  </nav>
</div></header>'''


def card(g):
    kids = '<i class="kids">Kids</i>' if 'kids' in g['cats'] else ''
    cat = next(n for c, n in CATS if c == g['cats'][0])
    return (f'<a class="game" href="/play/{g["id"]}/" data-id="{g["id"]}" data-cats="{" ".join(g["cats"])}" '
            f'data-name="{e(g["name"].lower() + " " + g["desc"].lower())}" style="--h:{g["hue"]}">'
            f'<div class="tags">{kids}<i>{e(cat if cat != "Kids" else "Learning")}</i></div><span class="best" hidden></span>'
            f'<div class="art" aria-hidden="true"><span>{g["icon"]}</span></div>'
            f'<div class="body"><h3>{e(g["name"])}</h3><p>{e(g["desc"])}</p></div></a>')


FOOT = '''<footer class="foot"><div class="wrap">
  <p>ZBZGames™ is the interactive entertainment studio of ZyeemZia™. Every arcade game is an original, free to play, with no sign-up and no ads.</p>
  <p><a href="/">Studio &amp; mobile games</a><a href="https://zyeemzia.com">zyeemzia.com</a><a href="https://academy.zyeemzia.com">Academy</a><a href="https://ai.zyeemzia.com">ZyeemZia AI</a><a href="/privacy-arcade.html">Privacy</a><a href="https://policy.zyeemzia.com">Policies</a></p>
  <p>Copyright © ZyeemZia</p>
</div></footer>'''

BEST_JS = '''<script>
/* Theme: follows the device until the visitor picks one; shared with the studio page. */
(function () {
  var b = document.getElementById('themeBtn'); if (!b) return;
  b.addEventListener('click', function () {
    var r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('matrixTheme', r.dataset.theme); } catch (e) {}
    window.dispatchEvent(new Event('zbz-theme'));
  });
})();
/* Show each game's best score on its card. Storage may be blocked; then nothing shows. */
document.querySelectorAll('.game[data-id]').forEach(function (a) {
  try { var v = JSON.parse(localStorage.getItem('zbz-best-' + a.dataset.id) || '0'); if (v > 0) { var b = a.querySelector('.best'); b.textContent = '★ ' + v; b.hidden = false; } } catch (e) {}
});
</script>'''


def hub():
    chips = ''.join(f'<button class="chip" type="button" data-cat="{c}" aria-pressed="{str(c == "all").lower()}">{n}</button>' for c, n in CATS)
    kids = [g for g in GAMES if 'kids' in g['cats']]
    body = f'''<body>
<a class="sr" href="#games">Skip to the games</a>
{bar('arcade')}
<main>
<section class="hero"><div class="wrap">
  <span class="eyebrow">ZBZGames™ Arcade</span>
  <h1>Free games, <span>built by ZBZGames™</span></h1>
  <p>{len(GAMES)} original games that open in a second on any phone, tablet or computer. No download, no sign-up, no ads. Install it and play offline.</p>
  <div class="stats"><div><b>{len(GAMES)}</b><span>Original games</span></div><div><b>{len(kids)}</b><span>For kids</span></div><div><b>0</b><span>Ads or sign-ups</span></div></div>
</div></section>
<div class="wrap">
  <div class="tools"><div class="chips" role="group" aria-label="Category">{chips}</div>
  <input class="search" type="search" placeholder="Search games…" aria-label="Search games" autocomplete="off"></div>
  <div class="grid" id="games">{''.join(card(g) for g in GAMES)}</div>
  <p class="empty" hidden>No game matches that. Try another word.</p>
  <a class="classic-band" href="/1971-baf/">
    <span class="classic-tag">Since 2004 · Where ZBZGames began</span>
    <strong>1971 BAF</strong>
    <span>The first ZBZGames title, a Windows game made by Zyeem Bin Zia as a child. Free download for PC.</span>
    <em>Download for Windows →</em>
  </a>
  <section class="kids-band" id="kids">
    <h2>🧒 Kids corner</h2>
    <p>Gentle, colourful games that practise letters, numbers, colours, memory and quick sums. Safe to hand over: no chat, no links out, no ads.</p>
    <div class="grid">{''.join(card(g) for g in kids)}</div>
  </section>
</div>
</main>
{FOOT}
<script>
(function () {{
  var chips = document.querySelectorAll('.chip'), cards = document.querySelectorAll('#games .game'), q = document.querySelector('.search'), empty = document.querySelector('.empty'), cat = 'all';
  function apply() {{
    var s = (q.value || '').trim().toLowerCase(), n = 0;
    cards.forEach(function (c) {{ var ok = (cat === 'all' || c.dataset.cats.split(' ').indexOf(cat) >= 0) && (!s || c.dataset.name.indexOf(s) >= 0); c.hidden = !ok; if (ok) n++; }});
    empty.hidden = n > 0;
  }}
  chips.forEach(function (b) {{ b.addEventListener('click', function () {{ cat = b.dataset.cat; chips.forEach(function (x) {{ x.setAttribute('aria-pressed', String(x === b)); }}); apply(); }}); }});
  q.addEventListener('input', apply);
  var m = /[?&]cat=(\\w+)/.exec(location.search); if (m) {{ var b = document.querySelector('.chip[data-cat="' + m[1] + '"]'); if (b) b.click(); }}
}})();
</script>
{BEST_JS}
</body>
</html>
'''
    desc = f'Play {len(GAMES)} free original online games by ZBZGames: arcade, puzzle, brain and kids games. No download, no sign-up, no ads.'
    return head('ZBZGames Arcade · Free online games for everyone', desc, '/play/') + '\n' + body


CLASSIC_SHA = '43e1b07e9172061584233b70df33aa0de52b675d5d6f07e62c1814fb2c4f0401'


def classic():
    desc = ('1971 BAF, the first ZBZGames title (2004): a Windows PC game made by Zyeem Bin Zia as a child, '
            'honouring the Bangladesh Air Force of 1971. Free download, never for sale.')
    body = f'''<body>
<a class="sr" href="#main">Skip to content</a>
{bar('classic')}
<main id="main" class="wrap classic">
  <section class="classic-hero">
    <span class="eyebrow">ZBZGames™ Heritage · 2004</span>
    <h1>1971 <span>BAF</span></h1>
    <p class="lead">Where ZBZGames began. Long before the arcade and the Google Play titles, a young Zyeem Bin Zia built this
    Windows game in honour of the Bangladesh Air Force and the Liberation War of 1971, and gave it away free with the words
    <q>This game is not for sale</q>. It is kept here exactly as it shipped in 2004.</p>
    <div class="classic-cta">
      <a class="go" href="/downloads/1971-BAF-Setup.exe" download="1971-BAF-Setup.exe">Download for Windows</a>
      <span class="classic-meta">Installer · 7.0 MB · Windows · Free</span>
    </div>
  </section>
  <section class="classic-grid">
    <div class="panel">
      <h2>The story</h2>
      <p>1971 BAF was the very first game published under the ZBZGames™ name, created and published by Zyeem Bin Zia in 2004
      while still a child. Its spirit lives on in <a href="/">Bangladesh Airforce Mini</a> on Google Play, a modern
      ten-mission campaign flying with Kilo Flight, the first air operations unit of the Bangladesh Air Force.</p>
      <ul class="facts">
        <li><b>Released</b><span>2004</span></li>
        <li><b>Studio</b><span>ZBZGames™</span></li>
        <li><b>Platform</b><span>Windows PC</span></li>
        <li><b>Price</b><span>Free, never for sale</span></li>
      </ul>
    </div>
    <div class="panel">
      <h2>Original system requirements</h2>
      <ul class="facts">
        <li><b>Windows</b><span>98, 98 SE, ME, 2000 Professional or XP</span></li>
        <li><b>DirectX</b><span>9.0 or later</span></li>
        <li><b>Processor</b><span>Intel Pentium 200 MHz or faster</span></li>
        <li><b>Memory</b><span>64 MB or more</span></li>
        <li><b>Disk</b><span>12 MB</span></li>
      </ul>
    </div>
    <div class="panel">
      <h2>Playing it on Windows 10 or 11</h2>
      <ol>
        <li>Download and open <b>1971-BAF-Setup.exe</b>. It is a 2004 installer without a modern signature, so Windows may
        show <i>Windows protected your PC</i>: choose <b>More info</b>, then <b>Run anyway</b>.</li>
        <li>If the installer asks for a password, the original one from 2004 is <b>godzbzgames</b>.</li>
        <li>If the game does not start, right-click its shortcut, choose <b>Properties</b>, then <b>Compatibility</b>, tick
        <b>Run this program in compatibility mode for Windows XP (Service Pack 3)</b>, and try again.</li>
        <li>Old DirectX games may also need Microsoft's free <b>DirectX End-User Runtime</b>.</li>
      </ol>
    </div>
    <div class="panel">
      <h2>Check your download</h2>
      <p>The file here is the original installer. Its SHA-256 fingerprint is:</p>
      <code class="sha">{CLASSIC_SHA}</code>
      <p class="small">On Windows: <code>certutil -hashfile 1971-BAF-Setup.exe SHA256</code></p>
    </div>
  </section>
  <p class="classic-more"><a href="/play/">Or play the free ZBZGames™ games in your browser now →</a></p>
</main>
{FOOT}
{BEST_JS}
</body>
</html>
'''
    return head('1971 BAF · The first ZBZGames title (2004) · Free PC download', desc, '/1971-baf/') + '\n' + body


def privacy():
    desc = 'Privacy for the ZBZGames Arcade, its Kids corner, the installable app and the 1971 BAF download: no accounts, no ads, no tracking.'
    body = f'''<body>
<a class="sr" href="#main">Skip to content</a>
{bar('privacy')}
<main id="main" class="wrap classic">
  <section class="classic-hero">
    <span class="eyebrow">ZBZGames™ · Privacy</span>
    <h1>Arcade <span>privacy</span></h1>
    <p class="lead">The ZBZGames™ Arcade at zbzgames.zyeemzia.com/play/ is built to collect nothing. This page covers the browser games,
    the Kids corner, the installable app and the 1971 BAF download. The Google Play games have their own policies, listed in the
    <a href="https://policy.zyeemzia.com">Trust &amp; Security Center</a>.</p>
  </section>
  <section class="classic-grid">
    <div class="panel"><h2>Nothing collected</h2><ul class="facts">
      <li><b>Accounts</b><span>None. No sign-up, no login.</span></li>
      <li><b>Advertising</b><span>None.</span></li>
      <li><b>Analytics and tracking</b><span>None. No cookies.</span></li>
      <li><b>Personal data</b><span>None is asked for or sent to us.</span></li></ul></div>
    <div class="panel"><h2>What stays on your device</h2>
      <p>Best scores, your light or dark choice and the sound setting are saved in your own browser so they are there next time.
      Clearing the site's data, or uninstalling the app, removes them. They are never sent anywhere.</p></div>
    <div class="panel"><h2>Kids corner</h2>
      <p>The Kids corner and the Bangla, Arabic and English learning games are made to be safe to hand to a child: no chat, no
      ads, no purchases, no links out of the arcade and no data collection. Finger tracing in the Write mode is checked on the
      device itself and never uploaded.</p>
      <p>Letters are read aloud by your device's own text-to-speech voice. Some phones may use their maker's online speech
      service to produce that voice; that is a setting of the device, not of the game, and it can be changed in the phone's
      text-to-speech settings.</p></div>
    <div class="panel"><h2>The installable app</h2>
      <p>Installing ZBZGames keeps a copy of the games in your browser so they open instantly and play offline. When a new
      version is published the app offers to update; nothing installs without your tap. Uninstalling removes the copy.</p></div>
    <div class="panel"><h2>1971 BAF download</h2>
      <p>1971 BAF is the original 2004 Windows installer, offered free and unchanged as a piece of ZBZGames history. It is
      provided as is, and it runs on your computer, not on our servers. Check its SHA-256 fingerprint on the
      <a href="/1971-baf/">1971 BAF page</a> before you run it.</p></div>
    <div class="panel"><h2>Contact</h2>
      <p>Questions about privacy: <a href="mailto:admin@zyeemzia.com">admin@zyeemzia.com</a>. The full terms, privacy principles and
      every product policy are in the <a href="https://policy.zyeemzia.com">Trust &amp; Security Center</a>.</p></div>
  </section>
  <p class="classic-more"><a href="/play/">Back to the arcade →</a></p>
</main>
{FOOT}
{BEST_JS}
</body>
</html>
'''
    return head('Arcade privacy · ZBZGames', desc, '/privacy-arcade.html') + '\n' + body


def page(g):
    others = [o for o in GAMES if o['id'] != g['id']]
    same = [o for o in others if set(o['cats']) & set(g['cats'])][:4]
    more = same + [o for o in others if o not in same][:6 - len(same)]
    meta = json.dumps({'id': g['id'], 'name': g['name'], 'how': g['how']}, ensure_ascii=False).replace('</', '<\\/')
    body = f'''<body>
<a class="sr" href="#stage">Skip to the game</a>
{bar('game')}
<main class="play-main">
  <div class="hud">
    <h1>{g['icon']} {e(g['name'])}</h1>
    <div class="num"><small>Score</small><b id="score">0</b></div>
    <div class="num best"><small>Best</small><b id="best">0</b></div>
    <button class="hbtn" id="pause" type="button" aria-label="Pause" hidden>&#10073;&#10073;</button>
    <button class="hbtn" id="mute" type="button" aria-label="Sound off">&#128264;</button>
    <button class="hbtn" id="full" type="button" aria-label="Full screen">&#x26F6;</button>
  </div>
  <div id="arena"><div id="stage" tabindex="0" aria-label="{e(g['name'])} game area"></div><div id="card" hidden></div></div>
  <section class="more"><h2>More games</h2><div class="grid">{''.join(card(o) for o in more)}</div></section>
</main>
{FOOT}
<script>window.ZBZ_GAME = {meta};</script>
<script src="/play/engine.js?v={VER}"></script>
{'<script src="/play/learn.js?v=' + VER + '"></script>' if g.get('learn') else ''}
<script src="/play/games/{g['id']}.js?v={VER}"></script>
{BEST_JS}
</body>
</html>
'''
    title = f"{g['name']} · Free online game by ZBZGames"
    desc = f"{g['desc']} Play {g['name']} free in your browser: no download, no sign-up, no ads."
    fonts = f'<link href="https://fonts.googleapis.com/css2?family={g["fonts"]}&display=swap" rel="stylesheet">' if g.get('fonts') else ''
    return head(title, desc, f"/play/{g['id']}/", fonts) + '\n' + body


def write(rel, text):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


if __name__ == '__main__':
    import hashlib
    h = hashlib.sha256()
    for g in GAMES:
        with open(os.path.join(ROOT, 'play', 'games', g['id'] + '.js'), 'rb') as f: h.update(f.read())
    for rel in ('play/engine.js', 'play/learn.js', 'play/arcade.css', 'icon-512.png', 'icon-maskable-512.png', 'index.html'):
        with open(os.path.join(ROOT, rel), 'rb') as f: h.update(f.read())
    VER = h.hexdigest()[:8]
    globals()['VER'] = VER
    write('play/index.html', hub())
    write('1971-baf/index.html', classic())
    write('privacy-arcade.html', privacy())
    for g in GAMES:
        write(f"play/{g['id']}/index.html", page(g))
    write('manifest.webmanifest', json.dumps({
        'name': 'ZBZGames', 'short_name': 'ZBZGames', 'id': '/', 'start_url': '/play/', 'scope': '/',
        'description': f'{len(GAMES)} free original games by ZBZGames, the studio of ZyeemZia. Arcade, puzzle, brain and kids games that also play offline.',
        'display': 'standalone', 'orientation': 'any', 'background_color': '#05060f', 'theme_color': '#05060f',
        'lang': 'en', 'categories': ['games', 'entertainment', 'kids', 'education'],
        'icons': [{'src': '/icon-192.png?v=4', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
                  {'src': '/icon-512.png?v=4', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
                  {'src': '/icon-maskable-512.png?v=4', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}],
        'shortcuts': [{'name': 'Kids corner', 'url': '/play/?cat=kids'}, {'name': 'All games', 'url': '/play/'},
                      {'name': 'Studio', 'url': '/'}]
    }, ensure_ascii=False, indent=1))
    pages = ['/', '/play/', '/1971-baf/', '/privacy-arcade.html'] + [f"/play/{g['id']}/" for g in GAMES]
    assets = ['/play/arcade.css', '/play/engine.js', '/play/learn.js', '/zz-app.js', '/manifest.webmanifest', '/favicon.ico', '/favicon-32.png',
              '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'] + [f"/play/games/{g['id']}.js" for g in GAMES]
    with open(os.path.join(ROOT, 'tools', 'sw.template.js'), encoding='utf-8') as f:
        sw = f.read()
    write('sw.js', sw.replace('__VERSION__', VER).replace('__PAGES__', json.dumps(pages)).replace('__ASSETS__', json.dumps(assets)))
    today = datetime.date.today().isoformat()
    extra = ['/privacy-golfcshipmini.html', '/terms-golfcshipmini.html', '/privacy-bdairforcemini.html', '/terms-bdairforcemini.html']
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          ''.join(f'  <url><loc>{ORIGIN}{p}</loc><lastmod>{today}</lastmod></url>\n' for p in pages + extra) + '</urlset>\n')
    print(f'built {len(GAMES)} games, version {VER}')
