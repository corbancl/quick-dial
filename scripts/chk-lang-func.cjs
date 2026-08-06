const fs = require('fs');
const path = require('path');

// Check lang.js and i18n.js for the toggle function
['lang.js', 'i18n.js', 'theme.js'].forEach(f => {
  const p = path.join('M:/new/website', f);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    if (content.includes('qdToggleLang') || content.includes('toggleLang') || content.includes('lang=')) {
      console.log(`=== ${f} (${content.length} bytes) ===`);
      console.log(content.substring(0, 2000));
      console.log('...');
    }
  }
});
