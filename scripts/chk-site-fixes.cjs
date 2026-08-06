const fs = require('fs');
const path = require('path');
const d = 'M:/new/website';
const files = fs.readdirSync(d).filter(f => /\.html$/i.test(f));
files.forEach(n => {
  const c = fs.readFileSync(path.join(d, n), 'utf8');
  const hasIcon = /<link[^>]*icon/i.test(c);
  const hasIndex = c.includes('href="index.html"');
  if (!hasIcon || hasIndex) console.log(n + ': icon=' + hasIcon + ' index=' + hasIndex);
});
