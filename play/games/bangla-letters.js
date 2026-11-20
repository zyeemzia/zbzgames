/* Bangla Barnamala · ZBZGames™ original, for kids. Learn, write and hear the Bangla letters and numbers. */
(() => {
  const NAMES = {"অ": "স্বরে অ", "আ": "স্বরে আ", "ই": "হ্রস্ব ই", "ঈ": "দীর্ঘ ঈ", "উ": "হ্রস্ব উ", "ঊ": "দীর্ঘ ঊ", "ঋ": "ঋ", "এ": "এ", "ঐ": "ঐ", "ও": "ও", "ঔ": "ঔ", "ক": "ক", "খ": "খ", "গ": "গ", "ঘ": "ঘ", "ঙ": "উঁয়ো", "চ": "চ", "ছ": "ছ", "জ": "বর্গীয় জ", "ঝ": "ঝ", "ঞ": "ইঁয়ো", "ট": "ট", "ঠ": "ঠ", "ড": "ড", "ঢ": "ঢ", "ণ": "মূর্ধন্য ণ", "ত": "ত", "থ": "থ", "দ": "দ", "ধ": "ধ", "ন": "দন্ত্য ন", "প": "প", "ফ": "ফ", "ব": "ব", "ভ": "ভ", "ম": "ম", "য": "অন্তঃস্থ য", "র": "র", "ল": "ল", "শ": "তালব্য শ", "ষ": "মূর্ধন্য ষ", "স": "দন্ত্য স", "হ": "হ", "ড়": "ড এ শূন্য ড়", "ঢ়": "ঢ এ শূন্য ঢ়", "য়": "অন্তঃস্থ অ", "ৎ": "খণ্ড ত", "ং": "অনুস্বার", "ঃ": "বিসর্গ", "ঁ": "চন্দ্রবিন্দু"};
  // Spoken as the letter's traditional name, a pause, then the word: clearer than a lone symbol.
  const L = (ch, word, emoji, roman) => ({ ch, word, emoji, roman, say: `${NAMES[ch] || ch}। ${word}।` });
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
  const numbers = DIG.map((ch, n) => ({ ch, word: NUM[n], count: n, roman: `${n} — ${ROM[n]}`, say: NUM[n], color: '#22c55e' }));
  ZBZLearn({
    lang: 'bn-BD', langName: 'Bangla', color: '#0ea5e9',
    font: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif", canvasFont: "'Noto Sans Bengali', sans-serif", baseline: .06,
    labels: { letters: 'অ আ ক Letters', numbers: '১ ২ ৩ Numbers' },
    letters: [...vowels, ...consonants], numbers
  });
})();
