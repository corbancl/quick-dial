const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';
const files = fs.readdirSync(dir).filter(f => /^en-.*\.html$/i.test(f));

// Also check the Chinese version nav-lang title for reference
// en-guide.html might not have the lang toggle

files.forEach(f => {
  const p = path.join(dir, f);
  let text = fs.readFileSync(p, 'utf8');
  const original = text;
  
  // Fix 1: "切换到中" -> full text in lang toggle button
  text = text.replace(/切换到中/g, '切换到中文');
  
  // Fix 2: "切换到中> -> full text (possible missing 文 before >)
  // Already covered by above since 文 is the missing char
  
  if (text !== original) {
    fs.writeFileSync(p, text, 'utf8');
    console.log('Fixed: ' + f);
  } else {
    console.log('No change: ' + f);
  }
});

console.log('\nDone.');
