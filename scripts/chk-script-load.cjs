const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';
const pages = ['en-account.html', 'account.html', 'en-about.html', 'en.html', 'index.html'];

pages.forEach(p => {
  const file = path.join(dir, p);
  if (fs.existsSync(file)) {
    const c = fs.readFileSync(file, 'utf8');
    const hasLang = c.includes('lang.js');
    const hasI18n = c.includes('i18n.js');
    const hasToggle = c.includes('qdToggleLang');
    const bodyScript = c.match(/<script src="([^"]+)"><\/script>/g);
    console.log(`${p}: lang.js=${hasLang} i18n.js=${hasI18n} qdToggleLang=${hasToggle}`);
    if (bodyScript) console.log('  Scripts: ' + bodyScript.join(', '));
  }
});
