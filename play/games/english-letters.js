/* ABC Adventure · ZBZGames™ original, for kids. Learn, write and hear the English alphabet and numbers. */
(() => {
  const W = [['Apple', '🍎'], ['Ball', '⚽'], ['Cat', '🐱'], ['Dog', '🐶'], ['Elephant', '🐘'], ['Fish', '🐟'], ['Giraffe', '🦒'], ['House', '🏠'],
    ['Ice cream', '🍦'], ['Juice', '🧃'], ['Kite', '🪁'], ['Lion', '🦁'], ['Moon', '🌙'], ['Nest', '🪺'], ['Orange', '🍊'], ['Parrot', '🦜'],
    ['Queen', '👑'], ['Rainbow', '🌈'], ['Sun', '☀️'], ['Tiger', '🐯'], ['Umbrella', '☂️'], ['Violin', '🎻'], ['Whale', '🐳'], ['Xylophone', '🎼'],
    ['Yo-yo', '🪀'], ['Zebra', '🦓']];
  const letters = W.map(([word, emoji], i) => {
    const ch = String.fromCharCode(65 + i);
    return { ch: ch + ch.toLowerCase(), word, emoji, roman: `${ch} is for ${word}`, say: `${ch}. ${ch} is for ${word}.`, color: `hsl(${(i * 37) % 360},80%,52%)` };
  });
  const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const numbers = NUM.map((w, n) => ({ ch: String(n), word: w, emoji: n ? '⭐'.repeat(n) : '⭕', roman: `${n} — ${w}`, say: w, color: '#8b5cf6' }));
  ZBZLearn({
    lang: 'en-US', langName: 'English', color: '#8b5cf6', baseline: .02,
    font: "'Rajdhani', sans-serif", canvasFont: "'Rajdhani', sans-serif",
    labels: { letters: 'A B C Letters', numbers: '1 2 3 Numbers' },
    letters, numbers
  });
})();
