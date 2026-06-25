const fs = require('fs');
const path = require('path');

const websiteDir = 'M:/new/website';
const favicon = '<link rel="icon" type="image/png" href="favicon.png" />';

const files = fs.readdirSync(websiteDir).filter(f => /\.html$/i.test(f));

for (const f of files) {
  const p = path.join(websiteDir, f);
  let c = fs.readFileSync(p, 'utf8');
  let changed = false;
  
  // 1. Add favicon if missing
  if (!/<link[^>]*icon/i.test(c)) {
    c = c.replace(/(<meta charset="UTF-8"[^>]*>)/i, '$1\n    ' + favicon);
    changed = true;
    console.log(f + ': added favicon');
  }
  
  // 2. Fix footer/back links: index.html → / for bottom pages
  if (f !== 'index.html' && f !== 'en.html' && f !== 'account.html' && f !== 'en-account.html') {
    if (c.includes('href="index.html"')) {
      c = c.replace(/href="index\.html"/g, 'href="/"');
      changed = true;
      console.log(f + ': fixed back link index.html → /');
    }
  }
  
  if (changed) fs.writeFileSync(p, c, 'utf8');
}

console.log('\nAll website files updated.');
