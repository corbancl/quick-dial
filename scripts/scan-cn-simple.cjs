const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';
const files = fs.readdirSync(dir).filter(f => /^en-.*\.html$/i.test(f));

files.forEach(f => {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /[\u4e00-\u9fff]+/g;
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[0].length >= 2) { // skip single char false positives
      matches.push(m[0]);
    }
  }
  
  if (matches.length > 0) {
    // De-duplicate
    const unique = [...new Set(matches)];
    console.log(`\n=== ${f}: ${matches.length} hits, ${unique.length} unique ===`);
    unique.forEach(u => console.log(`  ${u}`));
  } else {
    console.log(`\n${f}: CLEAN`);
  }
});
