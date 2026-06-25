const fs = require('fs');
const path = require('path');

['about.html', 'contact.html', 'copyright.html', 'privacy.html'].forEach(f => {
  const c = fs.readFileSync(path.join('M:/new/website', f), 'utf8');
  const idx = c.lastIndexOf('<div class="footer"');
  if (idx >= 0) {
    const snippet = c.substring(idx, Math.min(idx + 300, c.length));
    console.log(`\n=== ${f} footer ===`);
    console.log(snippet.substring(0, 250));
  } else {
    console.log(`\n${f}: NO footer div`);
  }
});
