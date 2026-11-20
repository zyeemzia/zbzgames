/* Bangla Barnamala · ZBZGames™ original, for kids. Learn, write and hear the Bangla letters and numbers. */
(() => {
  const L = (ch, word, emoji, roman, say) => ({ ch, word, emoji, roman, say: say || `${ch}, ${word}` });
  const vowels = [
    L('অ', 'অজগর', '🐍', 'o — ojogor'), L('আ', 'আম', '🥭', 'aa — aam'), L('ই', 'ইঁদুর', '🐭', 'i — indur'),
    L('ঈ', 'ঈগল', '🦅', 'ee — eegol'), L('উ', 'উট', '🐫', 'u — ut'), L('ঊ', 'ঊর্মি', '🌊', 'oo — urmi'),
    L('ঋ', 'ঋষি', '🧘', 'ri — rishi'), L('এ', 'একতারা', '🪕', 'e — ektara'), L('ঐ', 'ঐরাবত', '🐘', 'oi — oirabot'),
    L('ও', 'ওল', '🥔', 'o — ol'), L('ঔ', 'ঔষধ', '💊', 'ou — oushodh')
  ].map(x => ({ ...x, color: '#ec4899' }));
  const consonants = [
    L('ক', 'কলা', '🍌', 'ko — kola'), L('খ', 'খরগোশ', '🐇', 'kho — khorgosh'), L('গ', 'গরু', '🐄', 'go — goru'),
    L('ঘ', 'ঘড়ি', '⏰', 'gho — ghori'), L('ঙ', 'ব্যাঙ', '🐸', 'ungo — byang'), L('চ', 'চশমা', '👓', 'cho — choshma'),
    L('ছ', 'ছাতা', '☂️', 'chho — chhata'), L('জ', 'জাহাজ', '🚢', 'jo — jahaj'), L('ঝ', 'ঝুড়ি', '🧺', 'jho — jhuri'),
    L('ঞ', 'মিঞা', '🧔', 'io — mia'), L('ট', 'টমেটো', '🍅', 'to — tometo'), L('ঠ', 'ঠেলাগাড়ি', '🛒', 'tho — thelagari'),
    L('ড', 'ডাব', '🥥', 'do — dab'), L('ঢ', 'ঢোল', '🥁', 'dho — dhol'), L('ণ', 'হরিণ', '🦌', 'murdhonno no — horin'),
    L('ত', 'তরমুজ', '🍉', 'to — tormuj'), L('থ', 'থালা', '🍽️', 'tho — thala'), L('দ', 'দরজা', '🚪', 'do — dorja'),
    L('ধ', 'ধান', '🌾', 'dho — dhan'), L('ন', 'নৌকা', '⛵', 'no — nouka'), L('প', 'পাখি', '🐦', 'po — pakhi'),
    L('ফ', 'ফুল', '🌸', 'pho — phul'), L('ব', 'বই', '📖', 'bo — boi'), L('ভ', 'ভালুক', '🐻', 'bho — bhaluk'),
    L('ম', 'মাছ', '🐟', 'mo — machh'), L('য', 'যাদুকর', '🎩', 'jo — jadukor'), L('র', 'রংধনু', '🌈', 'ro — rongdhonu'),
    L('ল', 'লাটিম', '🪀', 'lo — latim'), L('শ', 'শাপলা', '🪷', 'sho — shapla'), L('ষ', 'ষাঁড়', '🐂', 'murdhonno sho — shar'),
    L('স', 'সূর্য', '☀️', 'so — surjo'), L('হ', 'হাতি', '🐘', 'ho — hati'), L('ড়', 'পাহাড়', '⛰️', 'ro — pahar'),
    L('ঢ়', 'আষাঢ়', '🌧️', 'rho — asharh'), L('য়', 'ময়ূর', '🦚', 'yo — moyur'), L('ৎ', 'হঠাৎ', '⚡', 'khondo to — hothat'),
    L('ং', 'রং', '🎨', 'onushshor — rong'), L('ঃ', 'দুঃখ', '😢', 'bishorgo — dukkho'), L('ঁ', 'চাঁদ', '🌙', 'chondrobindu — chand')
  ].map(x => ({ ...x, color: '#0ea5e9' }));
  const NUM = ['শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ'];
  const ROM = ['shunno', 'ek', 'dui', 'tin', 'char', 'panch', 'chhoy', 'saat', 'aat', 'noy', 'dosh'];
  const DIG = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'];
  const numbers = DIG.map((ch, n) => ({ ch, word: NUM[n], emoji: n ? '⭐'.repeat(Math.min(n, 10)) : '⭕', roman: `${n} — ${ROM[n]}`, say: NUM[n], color: '#22c55e' }));
  ZBZLearn({
    lang: 'bn-BD', langName: 'Bangla', color: '#0ea5e9',
    font: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif", canvasFont: "'Noto Sans Bengali', sans-serif", baseline: .06,
    labels: { letters: 'অ আ ক Letters', numbers: '১ ২ ৩ Numbers' },
    letters: [...vowels, ...consonants], numbers
  });
})();
