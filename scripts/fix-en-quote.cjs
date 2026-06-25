const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';
const files = fs.readdirSync(dir).filter(f => /^en-.*\.html$/i.test(f));

// Also check en.html (the main English landing page)
const allEn = [...files, 'en.html'];

allEn.forEach(f => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) return;
  let text = fs.readFileSync(p, 'utf8');
  const original = text;
  
  // Fix: "切换到中文>(content)" → "切换到中文">(content)"
  // This fixes the missing closing quote in title attribute
  text = text.replace(/title="切换到中文>/g, 'title="切换到中文">');
  
  if (text !== original) {
    fs.writeFileSync(p, text, 'utf8');
    console.log('Fixed: ' + f);
  } else {
    console.log('No change: ' + f);
  }
});

console.log('\nDone.');
