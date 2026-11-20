/* Alif Ba · ZBZGames™ original, for kids. Learn, write and hear the Arabic letters and numbers. */
(() => {
  const L = (ch, name, word, emoji, roman) => ({ ch, word, emoji, roman, say: `${name}. ${word}.`, color: '#10b981' });
  const letters = [
    L('ا', 'ألف', 'أسد', '🦁', 'alif — asad'), L('ب', 'باء', 'بطة', '🦆', 'baa — batta'), L('ت', 'تاء', 'تفاحة', '🍎', 'taa — tuffaha'),
    L('ث', 'ثاء', 'ثعلب', '🦊', 'thaa — tha\'lab'), L('ج', 'جيم', 'جمل', '🐫', 'jeem — jamal'), L('ح', 'حاء', 'حصان', '🐴', 'haa — hisan'),
    L('خ', 'خاء', 'خروف', '🐑', 'khaa — kharoof'), L('د', 'دال', 'دب', '🐻', 'daal — dubb'), L('ذ', 'ذال', 'ذرة', '🌽', 'dhaal — dhura'),
    L('ر', 'راء', 'رمان', '🍎', 'raa — rumman'), L('ز', 'زاي', 'زرافة', '🦒', 'zay — zarafa'), L('س', 'سين', 'سمكة', '🐟', 'seen — samaka'),
    L('ش', 'شين', 'شمس', '☀️', 'sheen — shams'), L('ص', 'صاد', 'صقر', '🦅', 'saad — saqr'), L('ض', 'ضاد', 'ضفدع', '🐸', 'daad — difda\''),
    L('ط', 'طاء', 'طائرة', '✈️', 'taa — ta\'ira'), L('ظ', 'ظاء', 'ظرف', '✉️', 'dhaa — dharf'), L('ع', 'عين', 'عنب', '🍇', '\'ayn — \'inab'),
    L('غ', 'غين', 'غيمة', '☁️', 'ghayn — ghayma'), L('ف', 'فاء', 'فيل', '🐘', 'faa — feel'), L('ق', 'قاف', 'قمر', '🌙', 'qaaf — qamar'),
    L('ك', 'كاف', 'كتاب', '📖', 'kaaf — kitab'), L('ل', 'لام', 'ليمون', '🍋', 'laam — laymoon'), L('م', 'ميم', 'موز', '🍌', 'meem — mawz'),
    L('ن', 'نون', 'نحلة', '🐝', 'noon — nahla'), L('ه', 'هاء', 'هدية', '🎁', 'haa — hadiyya'), L('و', 'واو', 'وردة', '🌹', 'waaw — warda'),
    L('ي', 'ياء', 'يد', '✋', 'yaa — yad')
  ];
  const NUM = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
  const ROM = ['sifr', 'wahid', 'ithnan', 'thalatha', 'arba\'a', 'khamsa', 'sitta', 'sab\'a', 'thamaniya', 'tis\'a', '\'ashara'];
  const DIG = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠'];
  const numbers = DIG.map((ch, n) => ({ ch, word: NUM[n], count: n, roman: `${n} — ${ROM[n]}`, say: NUM[n], color: '#f59e0b' }));
  ZBZLearn({
    lang: 'ar-SA', langName: 'Arabic', color: '#10b981', dir: 'rtl',
    font: "'Noto Naskh Arabic', 'Amiri', serif", canvasFont: "'Noto Naskh Arabic', serif", baseline: -.02,
    labels: { letters: 'ا ب ت Letters', numbers: '١ ٢ ٣ Numbers' },
    letters, numbers
  });
})();
