"""Builds the ZBZGames(TM) Arcade: play/index.html, one page per game, the web app
manifest, the service worker and sitemap.xml.  Copyright (c) ZyeemZia

Run from the repository root:   python tools/build_arcade.py
Add a game: write play/games/<id>.js and add one entry to GAMES below.
"""
import html, json, os, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGIN = 'https://zbzgames.zyeemzia.com'
CATS = [('all', 'All games'), ('kids', 'Kids'), ('arcade', 'Arcade'), ('puzzle', 'Puzzle'), ('brain', 'Brain'), ('quick', 'Quick play'), ('new', 'New')]

GAMES = [
    dict(id='orbit-dash', name='Orbit Dash', icon='🪐', hue=265, cats=['arcade', 'quick'], touch='Tap to flip', keys='Space',
         desc='Circle the core, grab the stars and flip direction before the spikes.',
         how='Tap, click or press Space to flip direction. Collect stars, dodge the red spikes. It speeds up.'),
    dict(id='circuit-spin', name='Circuit Spin', icon='🔌', hue=188, cats=['puzzle', 'brain'], touch='Tap to rotate', keys='Arrows, Space',
         desc='Rotate the wire tiles until power from the core reaches every corner.',
         how='Tap a tile to turn it. Join the wires so the glowing core powers every tile. Each solved board adds time.'),
    dict(id='beam-bender', name='Beam Bender', icon='🔦', hue=335, cats=['puzzle', 'brain'], touch='Tap a mirror', keys='Arrows, Space',
         desc='Flip the mirrors so the light beam bends its way to the target.',
         how='Tap a mirror to flip it. Bounce the beam from the lamp to the glowing target. Each target you light adds time.'),
    dict(id='stack-tower', name='Stack Tower', icon='🏗️', hue=200, cats=['arcade', 'quick', 'kids'], touch='Tap to drop', keys='Space',
         desc='Drop each sliding block on the tower. Only the overlap stays.',
         how='Tap or press Space to drop the block. Land it exactly for a perfect bonus.'),
    dict(id='word-forge', name='Word Forge', icon='⚒️', hue=45, cats=['brain', 'puzzle'], touch='Tap letters', keys='Type, Enter', typing=True,
         desc='Find the hidden five-letter word in six tries, then forge the next.',
         how='Type or tap letters. Gold: right letter, right place. Blue: in the word, elsewhere. Grey: not in it.'),
    dict(id='meteor-drift', name='Meteor Drift', icon='☄️', hue=255, cats=['arcade', 'quick'], touch='Drag to steer', keys='← →',
         desc='Steer through a meteor shower, grab crystals and let a shield take one hit.',
         how='Move with your finger, the mouse or the arrow keys. Crystals score five. A green ring is a shield that saves you once.'),
    dict(id='roof-runner', name='Roof Runner', icon='🏃', hue=235, cats=['arcade', 'quick'], touch='Tap to jump', keys='Space',
         desc='Sprint across the rooftops, leap the gaps and snatch the stars.',
         how='Tap or press Space to jump, and once more in mid-air for a second jump. Every new roof scores one, a star three.'),
    dict(id='merge-matrix', name='Merge Matrix', icon='🔢', hue=300, cats=['puzzle', 'brain'], touch='Swipe', keys='Arrows',
         desc='Slide the grid so equal tiles fuse. Can you reach 2048?',
         how='Swipe or use the arrow keys. Two equal tiles that touch become one. The game ends when no move is left.'),
    dict(id='sum-trail', name='Sum Trail', icon='➕', hue=275, cats=['brain', 'puzzle', 'quick'], touch='Drag or tap', keys='Arrows, Enter',
         desc='Link neighbouring numbers into a trail that adds up to the target.',
         how='Drag or tap across touching numbers until they add up to the target. Longer trails score more. Going over costs two seconds.'),
    dict(id='sky-glider', name='Sky Glider', icon='🛩️', hue=40, cats=['arcade', 'quick'], touch='Tap to lift', keys='Space',
         desc='Lift your glider through the neon gates of the night sky.',
         how='Tap or press Space to lift. Fly through the gaps; touching a gate ends the flight.'),
    dict(id='knight-hop', name='Knight Hop', icon='🐴', hue=265, cats=['brain', 'puzzle'], touch='Tap a square', keys='Arrows, Enter',
         desc='Hop like a chess knight to reach each star in the fewest moves.',
         how='The knight moves two squares one way and one to the side. Tap a dotted square to hop. Reach the star in the best count for five points.'),
    dict(id='tint-tubes', name='Tint Tubes', icon='🧪', hue=330, cats=['puzzle', 'brain'], touch='Tap two tubes', keys='1 to 9, U to undo',
         desc='Pour the colours from tube to tube until each tube holds just one.',
         how='Tap a tube, then the tube to pour into. A colour only lands on the same colour or in an empty tube. Three undos per level.'),
    dict(id='byte-serpent', name='Byte Serpent', icon='🐍', hue=170, cats=['arcade'], touch='Swipe', keys='Arrows or WASD',
         desc='Guide the data serpent, eat the golden bits and grow without biting your tail.',
         how='Swipe, or use the arrow keys or WASD. The walls wrap around; only your own tail is deadly.'),
    dict(id='mind-tiles', name='Mind Tiles', icon='🧠', hue=215, cats=['brain', 'kids'], touch='Tap the tiles', keys='Arrows, Enter',
         desc='Tiles flash, then hide. Tap every one that lit up. The grid keeps growing.',
         how='Watch which tiles light up, then tap them all from memory. A wrong tile costs a heart; you have three.'),
    dict(id='tide-fill', name='Tide Fill', icon='🌊', hue=195, cats=['puzzle', 'brain'], touch='Tap a colour', keys='1 to 6',
         desc='Spread one colour from the corner until it floods the whole board.',
         how='Pick a colour: your corner patch changes to it and takes in every touching tile of that colour. Cover the board within the move limit.'),
    dict(id='pulse-breaker', name='Pulse Breaker', icon='🧱', hue=190, cats=['arcade'], touch='Drag the paddle', keys='← →',
         desc='Bounce the energy ball and shatter wall after wall of neon bricks.',
         how='Move with your finger, the mouse or the arrow keys. Gold bricks take two hits. Three balls per game.'),
    dict(id='glow-grid', name='Glow Grid', icon='💡', hue=48, cats=['puzzle', 'brain'], touch='Tap a tile', keys='Arrows, Enter',
         desc='Every tap flips a tile and its neighbours. Light up the whole grid.',
         how='Tapping a tile flips it and the tiles above, below, left and right. Light all 25 before your moves run out.'),
    dict(id='mine-sentinel', name='Mine Sentinel', icon='💣', hue=350, cats=['puzzle', 'brain'], touch='Tap, long-press to flag', keys='Arrows, Enter, F',
         desc='Clear the field using the numbers. Each one counts the mines around it.',
         how='Tap to dig. Long-press, right-click or switch to Flag mode to mark a mine. Your first dig is always safe.'),
    dict(id='ring-stop', name='Ring Stop', icon='🎯', hue=150, cats=['arcade', 'quick'], touch='Tap to stop', keys='Space',
         desc='Stop the circling spark inside the glowing arc. It gets faster and tighter.',
         how='Tap or press Space when the spark is inside the green arc. The gold centre scores three. A miss or a slow arc costs a heart.'),
    dict(id='colour-clash', name='Colour Clash', icon='🌈', hue=10, cats=['brain', 'quick'], touch='Tap a colour', keys='1 2 3 4',
         desc='The word says one colour, the ink shows another. Trust the rule, not your eyes.',
         how='Tap the colour of the ink, not the word you read. Later the rule flips now and then. A wrong tap costs three seconds.'),
    dict(id='math-sprint', name='Math Sprint', icon='➗', hue=140, cats=['kids', 'brain', 'quick'], touch='Tap the answer', keys='1 2 3 4',
         desc='Sixty seconds of quick sums. The faster you go, the harder it gets.',
         how='Tap the right answer, or press 1 to 4. A wrong answer costs three seconds.'),
    dict(id='word-weave', name='Word Weave', icon='🧶', hue=25, cats=['brain', 'puzzle'], touch='Tap letters', keys='Type, Backspace', typing=True,
         desc='The letters are tangled. Weave them back into the word before time runs out.',
         how='Tap or type the letters in the right order to rebuild the word. Each word adds time. Shuffle for a fresh look.'),
    dict(id='order-rush', name='Order Rush', icon='🧮', hue=20, cats=['brain', 'quick', 'kids'], touch='Tap in order', keys='Arrows, Enter',
         desc='The numbers are scattered. Tap them in order, from 1 up, as fast as you can.',
         how='Find and tap 1, then 2, then 3 and so on. Clearing a board adds time and the next board is bigger. A wrong tap costs two seconds.'),
    dict(id='memory-stars', name='Memory Stars', icon='⭐', hue=50, cats=['kids', 'brain'], touch='Tap two cards', keys='Arrows, Enter',
         desc='Flip the cards and find every matching pair of animals, fruit or vehicles.',
         how='Tap two cards. A match stays open. Find all eight pairs with as few misses as you can.'),
    dict(id='pattern-pilot', name='Pattern Pilot', icon='🔮', hue=285, cats=['brain', 'puzzle'], touch='Tap the answer', keys='1 2 3 4',
         desc='Spot the rule behind the numbers and pick what comes next.',
         how='Work out how the row of numbers grows, then pick the next one. The rule is shown after each answer. Three hearts.'),
    dict(id='bubble-pop', name='Bubble Pop', icon='🎈', hue=210, cats=['kids', 'quick'], touch='Tap the bubbles', keys='',
         desc='Pop the bubbles with the right letter, number or colour. Learn while you play.',
         how='Pop only the bubbles that match the target at the top. You have 60 seconds.'),
    dict(id='shadow-safari', name='Shadow Safari', icon='🦒', hue=35, cats=['kids'], touch='Tap the animal', keys='1 2 3 4',
         desc='An animal hides as a shadow. Which animal is it?',
         how='Look at the shadow and tap the animal that makes it. Ten shadows a round, and a star for every one you get first time.'),
    dict(id='count-garden', name='Count Garden', icon='🌻', hue=125, cats=['kids'], touch='Tap the number', keys='1 2 3 4',
         desc='Count the flowers, bees and frogs in the garden, then tap the right number.',
         how='Count what you see and tap the number. Ten gardens a round, and a star for every one you get first time.'),
    dict(id='odd-one-out', name='Odd One Out', icon='🔍', hue=300, cats=['kids', 'brain'], touch='Tap the odd one', keys='1 to 6',
         desc='Three things belong together and one does not. Can you spot it?',
         how='Tap the picture that does not belong with the others. Later rounds hide it among more pictures. A star for each first-time find.'),
    dict(id='fruit-catch', name='Fruit Catch', icon='🧺', hue=110, cats=['kids', 'arcade'], touch='Drag the basket', keys='← →',
         desc='Slide the basket, catch the falling fruit and keep the rocks out.',
         how='Move with your finger, the mouse or the arrow keys. Three hearts: a dropped fruit or a caught rock costs one.'),
    dict(id='bangla-letters', name='Bangla Barnamala', icon='🔤', hue=200, cats=['kids', 'brain'], learn=True, touch='Tap and trace', keys='← → Space',
         fonts='Noto+Sans+Bengali:wght@500;700',
         desc='Learn every Bangla letter and number: hear it spoken, trace it with your finger, then play a quiz.',
         how='Pick Letters or Numbers, then Learn, Write or Quiz. Tap a letter to hear it. In Write, trace the dotted letter and press Check for stars.'),
    dict(id='arabic-letters', name='Alif Ba', icon='🌙', hue=160, cats=['kids', 'brain'], learn=True, touch='Tap and trace', keys='← → Space',
         fonts='Noto+Naskh+Arabic:wght@500;700',
         desc='The Arabic alphabet and numbers for kids: hear each letter, trace it, and test yourself.',
         how='Pick Letters or Numbers, then Learn, Write or Quiz. Tap a letter to hear its name and a word that starts with it.'),
    dict(id='english-letters', name='ABC Adventure', icon='🅰️', hue=270, cats=['kids', 'brain'], learn=True, touch='Tap and trace', keys='← → Space',
         desc='A to Z and 0 to 10 with pictures and voice: learn, trace each letter, then take the quiz.',
         how='Pick Letters or Numbers, then Learn, Write or Quiz. Tap the big letter to hear it again.'),
    dict(id='neon-lanes', name='Neon Lanes', icon='🏎️', hue=320, cats=['arcade', 'quick'], touch='Tap left or right', keys='← →',
         desc='Swerve between three neon lanes, dodge the traffic and grab the gold.',
         how='Tap the left or right half, or use the arrow keys, to change lane. Gold coins are a bonus.'),
    dict(id='quick-draw', name='Quick Draw', icon='⚡', hue=130, cats=['quick', 'brain'], touch='Tap', keys='Space',
         desc='Wait for green, then tap faster than anyone. How sharp are your reflexes?',
         how='When the screen turns green, tap or press Space. Five rounds. Tapping on red costs you.'),
    dict(id='slide-shift', name='Slide Shift', icon='🧩', hue=230, cats=['puzzle', 'brain'], touch='Tap a tile', keys='Arrows',
         desc='Slide the scrambled tiles back into order from 1 to 15.',
         how='Tap a tile in line with the gap to slide it, or use the arrow keys. Fewer moves, higher score.'),
    dict(id='hue-hunter', name='Hue Hunter', icon='🎨', hue=20, cats=['brain', 'kids', 'quick'], touch='Tap the odd tile', keys='Arrows, Enter',
         desc='One tile is a slightly different colour. Spot it before the clock runs out.',
         how='Tap the odd tile out. Every level adds tiles and makes the difference subtler. A wrong tap costs three seconds.'),
    dict(id='echo-lights', name='Echo Lights', icon='🚦', hue=150, cats=['kids', 'brain'], touch='Tap the lights', keys='1 2 3 4',
         desc='Watch the coloured lights, then play the pattern back. It grows every round.',
         how='Watch the sequence, then tap the lights in the same order, or press 1 to 4.'),
    dict(id='grid-duel', name='Grid Duel', icon='❌', hue=0, cats=['kids', 'brain'], touch='Tap a square', keys='1 to 9',
         desc='Noughts and crosses against the ZBZGames™ bot, which gets sharper as you win.',
         how='Tap a square, or press 1 to 9, to place your cross. Three in a row wins. Keep going until the bot beats you.'),
    dict(id='mole-patrol', name='Mole Patrol', icon='🐹', hue=90, cats=['kids', 'quick'], touch='Tap the moles', keys='1 to 9',
         desc='Tap the moles as they pop up, but leave the bunnies alone.',
         how='Tap each mole before it hides. Tapping a bunny costs two points. You have 45 seconds.'),
    dict(id='gem-cascade', name='Gem Cascade', icon='💎', hue=280, cats=['puzzle', 'quick'], touch='Swipe or tap two gems', keys='Arrows, Enter',
         desc='Swap neighbouring gems into lines of three and set off chain reactions.',
         how='Swipe a gem, or tap two gems that touch, to swap them. Three or more in a line vanish and new gems fall in. You have 25 moves.'),
    dict(id='nova-blaster', name='Nova Blaster', icon='🚀', hue=225, cats=['arcade', 'quick'], touch='Drag to steer', keys='← →',
         desc='Your ship fires by itself. Slide under the raiders and let none slip past.',
         how='Move with your finger, the mouse or the arrow keys. Tough raiders need more hits. Gold gives double fire, pink gives a life back.'),
    dict(id='one-line', name='One Line', icon='✏️', hue=160, cats=['puzzle', 'brain'], touch='Drag a line', keys='Arrows, U to undo',
         desc='Draw a single line that passes through every square exactly once.',
         how='Drag from the gold dot through touching squares until every open square is filled. Drag back along the line to undo. Each solved board adds time.'),
    dict(id='cloud-hopper', name='Cloud Hopper', icon='☁️', hue=205, cats=['arcade', 'kids'], touch='Drag left or right', keys='← →',
         desc='Bounce from cloud to cloud and climb as high as the sky goes.',
         how='You bounce by yourself: steer with your finger, the mouse or the arrow keys. Pink clouds break, blue clouds move, and a spring sends you flying.'),
    dict(id='four-fall', name='Four Fall', icon='🔴', hue=5, cats=['brain', 'kids'], touch='Tap a column', keys='1 to 7',
         desc='Drop discs into the frame and line up four before the ZBZGames™ bot does.',
         how='Tap a column to drop your disc. Four in a row, across, down or slanted, wins. Keep winning until the bot beats you.'),
    dict(id='maze-dash', name='Maze Dash', icon='🌀', hue=250, cats=['arcade', 'puzzle'], touch='Swipe', keys='Arrows or WASD',
         desc='Race through a fresh maze to the star. Every maze is bigger than the last.',
         how='Swipe or use the arrow keys. You run until the path splits. Reach the gold star before the clock runs out; a blue gem is a bonus.'),
    dict(id='flip-field', name='Flip Field', icon='⚫', hue=145, cats=['brain', 'puzzle'], touch='Tap a square', keys='Arrows, Enter',
         desc='Trap the bot\'s discs between yours to flip them and take the field.',
         how='Place a disc so that a line of the bot\'s discs is caught between two of yours: they all flip. The dots show where you can play. Most discs wins.'),
    dict(id='ring-tower', name='Ring Tower', icon='🗼', hue=30, cats=['puzzle', 'brain', 'kids'], touch='Tap two pegs', keys='1 2 3',
         desc='Move the whole tower of rings to the last peg, one ring at a time.',
         how='Tap a peg to lift its top ring, then tap where it goes. A bigger ring never sits on a smaller one. The fewest moves earn a bonus.'),
    dict(id='number-nest', name='Number Nest', icon='🔟', hue=255, cats=['brain', 'puzzle'], touch='Tap a square, then a number', keys='Arrows, 1 to 6',
         desc='A pocket sudoku: each row, column and box holds every number once.',
         how='Tap an empty square, then the number that belongs there. No number repeats in a row, a column or a box. Three wrong numbers end the game.'),
    dict(id='clock-wise', name='Clock Wise', icon='🕒', hue=185, cats=['kids', 'brain'], touch='Tap the time', keys='1 2 3 4',
         desc='Read the hands of the clock and pick the right time.',
         how='The short hand shows the hour and the long hand the minutes. Tap the time the clock shows. Ten clocks a round, and a star for each one read first time.'),
    dict(id='paddle-duel', name='Paddle Duel', icon='🏓', hue=175, cats=['arcade', 'quick', 'new'], touch='Drag to move', keys='← →',
         desc='Bat the ball past the bot at the top. It gets sharper with every point.',
         how='Move your paddle with your finger, the mouse or the arrow keys. Each return scores 1 and each point off the bot scores 10. Miss three and the duel is over.'),
    dict(id='lane-leap', name='Lane Leap', icon='🐸', hue=95, cats=['arcade', 'kids', 'new'], touch='Tap middle or sides', keys='Arrows or WASD',
         desc='Hop across lanes of sliding blocks and keep ahead of the rising ground.',
         how='Tap the middle to hop forward and the sides to step left or right. Rest on the green rows and pick up stars, but do not wait too long: the ground behind you is rising.'),
    dict(id='soft-landing', name='Soft Landing', icon='🛸', hue=240, cats=['arcade', 'new'], touch='Hold to fire the engine', keys='Space, ← →',
         desc='Fire the engine to slow your fall and set the craft down gently on the pad.',
         how='Hold to fire the engine; the craft leans toward your finger. Touch the green pad while the speed reads safe. Fuel left over is a bonus. Three crashes end the flight.'),
    dict(id='sky-juggle', name='Sky Juggle', icon='⚽', hue=30, cats=['arcade', 'quick', 'kids', 'new'], touch='Tap the ball', keys='Space, ← →',
         desc='Keep the ball in the air. Every tap counts, and it gets livelier as you go.',
         how='Tap the ball to knock it up. Tap its left side to send it right, and its right side to send it left. Every ten taps is a bonus. It ends when the ball drops.'),
    dict(id='box-battle', name='Box Battle', icon='🔲', hue=205, cats=['brain', 'kids', 'new'], touch='Tap between two dots', keys='Arrows, Enter',
         desc='Join the dots. Close a box to claim it, and take more boxes than the bot.',
         how='Take turns drawing a line between two dots. Draw the fourth side of a box and it is yours, and you go again. Most boxes wins, with a bonus for beating the bot.'),
    dict(id='pixel-clues', name='Pixel Clues', icon='🖼️', hue=315, cats=['puzzle', 'brain', 'new'], touch='Tap to fill', keys='Arrows, Enter, X',
         desc='Number clues tell how many squares in each line are filled. Work out the picture.',
         how='Each number is a run of filled squares in that row or column, in order, with a gap between runs. Tap to fill a square. A clue turns green when its line fits. Each picture adds time.'),
    dict(id='letter-hunt', name='Letter Hunt', icon='🔎', hue=60, cats=['brain', 'puzzle', 'new'], touch='Drag over a word', keys='Arrows, Enter',
         desc='Six words hide in the letters: across, down and on the slant. Catch them all.',
         how='Drag from the first letter of a word to its last, or tap those two letters. Words run across, down or on a slant. Each word adds a little time; a cleared board adds more.'),
    dict(id='block-bay', name='Block Bay', icon='🟦', hue=215, cats=['puzzle', 'new'], touch='Pick a shape, tap the bay', keys='1 2 3, Arrows, Enter',
         desc='Fit the shapes into the bay. Full rows and columns clear. How long can you last?',
         how='Pick one of the three shapes, then tap where its middle should go; hold and slide to see it first. A full row or column clears. The game ends when no shape fits.'),
    dict(id='ten-pairs', name='Ten Pairs', icon='🍒', hue=350, cats=['kids', 'brain', 'quick', 'new'], touch='Tap two numbers', keys='Arrows, Enter',
         desc='Tap two numbers that add up to ten. How many tens can you make in a minute?',
         how='Tap two numbers that make 10, like 3 and 7. They pop and new numbers drop in. Three tens in a row earn a bonus. You have one minute.'),
    dict(id='tiny-speller', name='Tiny Speller', icon='🔡', hue=285, cats=['kids', 'brain', 'new'], touch='Tap the letters', keys='Type the letters', typing=True,
         desc='Look at the picture and tap the letters in order to spell its name.',
         how='Tap the letters in the right order to spell the word for the picture. Two of the letters do not belong. Eight words a round, and a star for each one spelled without a slip.'),
]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">')
e = lambda s: html.escape(str(s), quote=True)


# ZyeemZia house style: every page gets the small script that justifies normal writing.
HOUSE_MARK = 'ZyeemZia house style: justified writing'
HOUSE = "<script>/* ZyeemZia house style: justified writing. Paragraphs and list text that read left-aligned are justified; centred text, headings, buttons and columns too narrow to justify cleanly stay as they are. Copyright © ZyeemZia */(function(){var S='p,li,dd,blockquote';function j(r){if(!r||!r.querySelectorAll)return;var L=r.querySelectorAll(S);for(var i=0;i<L.length;i++){var e=L[i];if(e.getAttribute('data-zj'))continue;e.setAttribute('data-zj','1');var a=getComputedStyle(e).textAlign;if(a==='start'||a==='left'||a==='-webkit-auto'){var w=e.clientWidth;if(!w||w>=280)e.style.textAlign='justify'}}}function go(){j(document);if(!window.MutationObserver)return;new MutationObserver(function(m){for(var i=0;i<m.length;i++){var N=m[i].addedNodes;for(var k=0;k<N.length;k++){var n=N[k];if(n.nodeType===1)j(n.matches&&n.matches(S)?n.parentNode:n)}}}).observe(document.body,{childList:true,subtree:true})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go()})()</script>\n"


def house(name, text):
    """Add the house-style script to an html page, once, just before </body>."""
    if not str(name).endswith('.html') or HOUSE_MARK in text or '</body>' not in text:
        return text
    i = text.rfind('</body>')
    return text[:i] + HOUSE + text[i:]


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
    if 'new' in g['cats']:
        kids += '<i class="new">New</i>'
    names = [n for c, n in CATS if c in g['cats'] and c not in ('kids', 'new')]
    cat = ' · '.join(names[:2]) if names else 'Kids'
    return (f'<a class="game" href="/play/{g["id"]}/" data-id="{g["id"]}" data-cats="{" ".join(g["cats"])}" '
            f'data-name="{e(g["name"].lower() + " " + g["desc"].lower())}" style="--h:{g["hue"]}">'
            f'<div class="art" aria-hidden="true"><span class="ico">{g["icon"]}</span><em class="playpill">Play</em></div>'
            f'{kids}<span class="best" hidden></span>'
            f'<div class="body"><small class="cat">{e(cat)}</small><h3>{e(g["name"])}</h3><p>{e(desc_of(g))}</p></div></a>')


def desc_of(g):
    return g['desc']


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
    count = lambda c: len(GAMES) if c == 'all' else sum(1 for g in GAMES if c in g['cats'])
    chips = ''.join(f'<button class="chip" type="button" data-cat="{c}" aria-pressed="{str(c == "all").lower()}">{n}<small>{count(c)}</small></button>' for c, n in CATS)
    kids = [g for g in GAMES if 'kids' in g['cats']]
    names = ''.join(f'<span>{g["icon"]} {e(g["name"])}</span>' for g in GAMES)
    body = f"""<body>
<a class="sr" href="#games">Skip to the games</a>
{bar('arcade')}
<main>
<section class="hero">
<div class="wrap">
  <div class="hero-copy">
    <span class="eyebrow">ZBZGames™ Arcade</span>
    <h1>Free games, <span>built by ZBZGames™</span></h1>
    <p>{len(GAMES)} original games that open in a second on any phone, tablet or computer. No download, no sign-up, no ads. Install it and play offline.</p>
    <div class="hero-go"><a class="go" href="#games">▶ Play now</a><button class="ghost" id="lucky" type="button">🎲 Surprise me</button></div>
    <div class="stats"><div><b>{len(GAMES)}</b><span>Original games</span></div><div><b>{len(kids)}</b><span>For kids</span></div><div><b>0</b><span>Ads or sign-ups</span></div></div>
  </div>
  <div class="pick" id="pick" hidden><p class="pick-label">Today's pick <span id="pickNote"></span></p></div>
</div>
<div class="marquee" aria-hidden="true"><div>{names}{names}</div></div>
</section>
<div class="wrap">
  <section class="me" id="me" hidden aria-label="Your progress">
    <div class="me-lv"><b id="meLv">1</b><span>Level</span></div>
    <div class="me-xp"><div><strong id="meRank">Rookie</strong><span id="meNext"></span></div><i><b id="meBar"></b></i></div>
    <div class="me-st"><b id="meStreak">0</b><span>Day streak</span></div>
    <div class="me-st"><b id="meTried">0</b><span>Games tried</span></div>
    <div class="me-st"><b id="meBests">0</b><span>Best scores</span></div>
    <div class="badges" id="badges" aria-label="Badges"></div>
  </section>
  <section class="shelf" id="recent" hidden><h2>Jump back in</h2><div class="row"></div></section>
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
    <p>Gentle, colourful games that practise letters, numbers, counting, colours, memory and quick sums. Safe to hand over: no chat, no links out, no ads.</p>
    <div class="grid">{''.join(card(g) for g in kids)}</div>
  </section>
</div>
</main>
{FOOT}
<script>
(function () {{
  var chips = document.querySelectorAll('.chip'), cards = [].slice.call(document.querySelectorAll('#games .game')), q = document.querySelector('.search'), empty = document.querySelector('.empty'), cat = 'all';
  function apply() {{
    var s = (q.value || '').trim().toLowerCase(), n = 0;
    cards.forEach(function (c) {{ var ok = (cat === 'all' || c.dataset.cats.split(' ').indexOf(cat) >= 0) && (!s || c.dataset.name.indexOf(s) >= 0); c.hidden = !ok; if (ok) n++; }});
    empty.hidden = n > 0;
  }}
  /* Favourites are marked on the game pages and kept on this device. */
  try {{
    var favs = JSON.parse(localStorage.getItem('zbz-favs') || '[]'), nf = 0; favs = Array.isArray(favs) ? favs : [];
    [].forEach.call(document.querySelectorAll('.game[data-id]'), function (c) {{ if (favs.indexOf(c.dataset.id) >= 0) c.classList.add('faved'); }});
    cards.forEach(function (c) {{ if (favs.indexOf(c.dataset.id) >= 0) {{ c.dataset.cats += ' fav'; nf++; }} }});
    if (nf) {{
      var fb = document.createElement('button'); fb.className = 'chip'; fb.type = 'button'; fb.dataset.cat = 'fav'; fb.setAttribute('aria-pressed', 'false');
      fb.innerHTML = '♥ Favourites<small>' + nf + '</small>';
      var bar = document.querySelector('.chips'); bar.insertBefore(fb, bar.children[1] || null);
      chips = document.querySelectorAll('.chip');
    }}
  }} catch (e) {{}}
  chips.forEach(function (b) {{ b.addEventListener('click', function () {{ cat = b.dataset.cat; chips.forEach(function (x) {{ x.setAttribute('aria-pressed', String(x === b)); }}); apply(); }}); }});
  q.addEventListener('input', apply);
  var m = /[?&]cat=(\\w+)/.exec(location.search); if (m) {{ var b = document.querySelector('.chip[data-cat="' + m[1] + '"]'); if (b) b.click(); }}
  /* Surprise me: any game except the one played last. */
  var last = null; try {{ last = JSON.parse(localStorage.getItem('zbz-last')); }} catch (e) {{}}
  document.getElementById('lucky').addEventListener('click', function () {{
    var pool = cards.filter(function (c) {{ return c.dataset.id !== last; }});
    location.href = pool[Math.floor(Math.random() * pool.length)].href;
  }});
  /* Today's pick: the same game for everyone on the same day. */
  var day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000), pick = document.getElementById('pick');
  var todays = cards[(day * 7) % cards.length];
  pick.appendChild(todays.cloneNode(true)); pick.hidden = false;
  /* Playing today's pick earns bonus XP once; the game page reads this note. */
  try {{
    var dl = JSON.parse(localStorage.getItem('zbz-daily') || 'null');
    if (!dl || dl.d !== day || dl.id !== todays.dataset.id) {{ dl = {{ d: day, id: todays.dataset.id }}; localStorage.setItem('zbz-daily', JSON.stringify(dl)); }}
    document.getElementById('pickNote').textContent = dl.done ? 'Bonus earned ✓' : '+20 XP today';
  }} catch (e) {{}}
  /* Your progress: level, daily streak and games tried, all kept on this device. */
  try {{
    var num = function (k) {{ var v = JSON.parse(localStorage.getItem('zbz-' + k) || '0'); return typeof v === 'number' && isFinite(v) ? v : 0; }};
    var xp = num('xp'), base = function (l) {{ return 50 * l * (l - 1); }}, lv = 1; while (base(lv + 1) <= xp) lv++;
    var st = JSON.parse(localStorage.getItem('zbz-streak') || 'null'), tried = JSON.parse(localStorage.getItem('zbz-tried') || '[]');
    var today = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    var bests = cards.filter(function (c) {{ try {{ return JSON.parse(localStorage.getItem('zbz-best-' + c.dataset.id) || '0') > 0; }} catch (e) {{ return false; }} }}).length;
    if (xp > 0) {{
      var ranks = ['Rookie', 'Player', 'Pro', 'Ace', 'Master', 'Legend'], set = function (id, v) {{ document.getElementById(id).textContent = v; }};
      set('meLv', lv); set('meRank', ranks[Math.min(ranks.length - 1, Math.floor((lv - 1) / 3))]);
      set('meNext', (base(lv + 1) - xp) + ' XP to level ' + (lv + 1));
      document.getElementById('meBar').style.width = Math.max(4, Math.round((xp - base(lv)) / (base(lv + 1) - base(lv)) * 100)) + '%';
      set('meStreak', st && (st.d === today || st.d === today - 1) ? st.n : 0);
      set('meTried', (Array.isArray(tried) ? tried.filter(function (id) {{ return cards.some(function (c) {{ return c.dataset.id === id; }}); }}).length : 0) + '/' + cards.length);
      set('meBests', bests);
      /* Badges: once earned they stay. */
      var triedN = Array.isArray(tried) ? tried.filter(function (id) {{ return cards.some(function (c) {{ return c.dataset.id === id; }}); }}).length : 0, sn = st && st.n ? st.n : 0;
      var list = [['🌱', 'First steps', 'Play a game', triedN >= 1], ['🧭', 'Explorer', 'Try 10 games', triedN >= 10], ['🌍', 'Globetrotter', 'Try 30 games', triedN >= 30],
        ['🏁', 'Seen it all', 'Try every game', triedN >= cards.length], ['🔥', 'On fire', 'Play 3 days in a row', sn >= 3], ['⚡', 'Unstoppable', 'Play 7 days in a row', sn >= 7],
        ['🏅', 'Record setter', 'Best score in 5 games', bests >= 5], ['🏆', 'Champion', 'Best score in 20 games', bests >= 20], ['⭐', 'Rising star', 'Reach level 5', lv >= 5], ['👑', 'Arcade royalty', 'Reach level 10', lv >= 10]];
      var had = JSON.parse(localStorage.getItem('zbz-badges') || '[]'); had = Array.isArray(had) ? had : [];
      list.forEach(function (b) {{ if (b[3] && had.indexOf(b[1]) < 0) had.push(b[1]); b[3] = had.indexOf(b[1]) >= 0; }});
      localStorage.setItem('zbz-badges', JSON.stringify(had));
      list.sort(function (a, b) {{ return (b[3] ? 1 : 0) - (a[3] ? 1 : 0); }});
      document.getElementById('badges').innerHTML = list.map(function (b) {{ return '<span class="badge-i' + (b[3] ? ' got' : '') + '"><i>' + b[0] + '</i>' + b[1] + '<small>' + b[2] + '</small></span>'; }}).join('');
      document.getElementById('me').hidden = false;
    }}
  }} catch (e) {{}}
  /* Jump back in: the games played most recently on this device. */
  try {{
    var recent = JSON.parse(localStorage.getItem('zbz-recent') || '[]'), shelf = document.getElementById('recent'), row = shelf.querySelector('.row');
    (Array.isArray(recent) ? recent : []).forEach(function (id) {{
      var c = cards.filter(function (x) {{ return x.dataset.id === id; }})[0]; if (c) row.appendChild(c.cloneNode(true));
    }});
    shelf.hidden = !row.children.length;
  }} catch (e) {{}}
}})();
</script>
{BEST_JS}
</body>
</html>
"""
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
      <p>Best scores and your last few scores, your level, daily streak and badges, the games you played and your favourites, your light or dark choice and the sound setting are saved in your own browser so they are there next time.
      Clearing the site's data, or uninstalling the app, removes them. They are never sent anywhere. The Share score button, on games outside the Kids corner, only opens your own device's share menu with a line of text; nothing is sent to us.</p></div>
    <div class="panel"><h2>Kids corner</h2>
      <p>The Kids corner and the Bangla, Arabic and English learning games are made to be safe to hand to a child: no chat, no
      ads, no purchases, no links out of the arcade, no sharing buttons and no data collection. Finger tracing in the Write mode is checked on the
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
    # the game offered next: the following one in the list that shares a category
    at = GAMES.index(g)
    ring = GAMES[at + 1:] + GAMES[:at]
    nxt = next((o for o in ring if (set(o['cats']) & set(g['cats'])) - {'new'}), ring[0])
    meta = json.dumps({'id': g['id'], 'name': g['name'], 'how': g['how'], 'icon': g['icon'], 'hue': g['hue'], 'touch': g.get('touch', ''), 'keys': g.get('keys', ''), 'typing': bool(g.get('typing')), 'kids': 'kids' in g['cats'],
                       'next': {'id': nxt['id'], 'name': nxt['name'], 'icon': nxt['icon']}}, ensure_ascii=False).replace('</', '<\\/')
    body = f'''<body style="--h:{g['hue']}">
<a class="sr" href="#stage">Skip to the game</a>
{bar('game')}
<main class="play-main">
  <div class="hud">
    <h1><i aria-hidden="true">{g['icon']}</i><span>{e(g['name'])}</span></h1>
    <div class="num"><small>Score</small><b id="score">0</b></div>
    <div class="num best"><small>Best</small><b id="best">0</b></div>
    <button class="hbtn" id="pause" type="button" aria-label="Pause" hidden></button>
    <button class="hbtn" id="mute" type="button" aria-label="Sound off"></button>
    <button class="hbtn" id="full" type="button" aria-label="Full screen"></button>
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
    text = house(rel, text)
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
        'name': 'ZBZGames™', 'short_name': 'ZBZGames', 'id': '/', 'start_url': '/play/', 'scope': '/',
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
