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
<meta name="theme-color" content="#05060f">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ZBZGames"><meta name="application-name" content="ZBZGames">
{FONTS}
<link rel="stylesheet" href="/play/arcade.css?v={VER}">
<script src="/zz-app.js?v=2" data-sw="/sw.js" data-name="ZBZGames" defer></script>
{extra}
</head>'''


def bar(current):
    return f'''<header class="bar"><div class="wrap">
  <a class="logo" href="/play/"><img src="/icon-192.png" width="34" height="34" alt=""><span>ZBZ<b>Games</b></span></a>
  <nav aria-label="Main">
    <a href="/play/"{' aria-current="page"' if current == 'arcade' else ''}>Arcade</a>
    <a href="/play/#kids" class="hide-sm">Kids</a>
    <a href="/" class="hide-sm">Studio</a>
    <span data-zz-install></span>
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
  <p><a href="/">Studio &amp; mobile games</a><a href="https://zyeemzia.com">zyeemzia.com</a><a href="https://academy.zyeemzia.com">Academy</a><a href="https://ai.zyeemzia.com">ZyeemZia AI</a><a href="https://policy.zyeemzia.com">Policies</a></p>
  <p>Copyright © ZyeemZia</p>
</div></footer>'''

BEST_JS = '''<script>
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
  <h1>Free games, <span>built by ZBZ</span></h1>
  <p>{len(GAMES)} original games that open in a second on any phone, tablet or computer. No download, no sign-up, no ads. Install it and play offline.</p>
  <div class="stats"><div><b>{len(GAMES)}</b><span>Original games</span></div><div><b>{len(kids)}</b><span>For kids</span></div><div><b>0</b><span>Ads or sign-ups</span></div></div>
</div></section>
<div class="wrap">
  <div class="tools"><div class="chips" role="group" aria-label="Category">{chips}</div>
  <input class="search" type="search" placeholder="Search games…" aria-label="Search games" autocomplete="off"></div>
  <div class="grid" id="games">{''.join(card(g) for g in GAMES)}</div>
  <p class="empty" hidden>No game matches that. Try another word.</p>
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
<script src="/play/games/{g['id']}.js?v={VER}"></script>
{BEST_JS}
</body>
</html>
'''
    title = f"{g['name']} · Free online game by ZBZGames"
    desc = f"{g['desc']} Play {g['name']} free in your browser: no download, no sign-up, no ads."
    return head(title, desc, f"/play/{g['id']}/") + '\n' + body


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
    for rel in ('play/engine.js', 'play/arcade.css'):
        with open(os.path.join(ROOT, rel), 'rb') as f: h.update(f.read())
    VER = h.hexdigest()[:8]
    globals()['VER'] = VER
    write('play/index.html', hub())
    for g in GAMES:
        write(f"play/{g['id']}/index.html", page(g))
    write('manifest.webmanifest', json.dumps({
        'name': 'ZBZGames', 'short_name': 'ZBZGames', 'id': '/', 'start_url': '/play/', 'scope': '/',
        'description': f'{len(GAMES)} free original games by ZBZGames, the studio of ZyeemZia. Arcade, puzzle, brain and kids games that also play offline.',
        'display': 'standalone', 'orientation': 'any', 'background_color': '#05060f', 'theme_color': '#05060f',
        'lang': 'en', 'categories': ['games', 'entertainment', 'kids', 'education'],
        'icons': [{'src': '/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
                  {'src': '/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
                  {'src': '/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}],
        'shortcuts': [{'name': 'Kids corner', 'url': '/play/?cat=kids'}, {'name': 'All games', 'url': '/play/'},
                      {'name': 'Studio', 'url': '/'}]
    }, ensure_ascii=False, indent=1))
    pages = ['/', '/play/'] + [f"/play/{g['id']}/" for g in GAMES]
    assets = ['/play/arcade.css', '/play/engine.js', '/zz-app.js', '/manifest.webmanifest', '/favicon.ico', '/favicon-32.png',
              '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'] + [f"/play/games/{g['id']}.js" for g in GAMES]
    with open(os.path.join(ROOT, 'tools', 'sw.template.js'), encoding='utf-8') as f:
        sw = f.read()
    write('sw.js', sw.replace('__VERSION__', VER).replace('__PAGES__', json.dumps(pages)).replace('__ASSETS__', json.dumps(assets)))
    today = datetime.date.today().isoformat()
    extra = ['/privacy-golfcshipmini.html', '/terms-golfcshipmini.html', '/privacy-bdairforcemini.html', '/terms-bdairforcemini.html']
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          ''.join(f'  <url><loc>{ORIGIN}{p}</loc><lastmod>{today}</lastmod></url>\n' for p in pages + extra) + '</urlset>\n')
    print(f'built {len(GAMES)} games, version {VER}')
