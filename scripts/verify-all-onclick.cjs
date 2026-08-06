const fs = require('fs');
const path = require('path');

const dir = 'M:/new/website';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// Just verify all nav-lang buttons have qdToggleLang
files.forEach(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /<button[^>]*nav-lang[^>]*onclick="([^"]+)"/g;
  let m;
  while ((m = re.exec(c)) !== null) {
    if (m[1] !== 'qdToggleLang()') {
      console.log('WRONG: ' + f + ' onclick="' + m[1] + '"');
    }
  }
});
console.log('All nav-lang buttons verified.');
