const fs = require('fs');
const c = fs.readFileSync('M:/new/website/en.html', 'utf8');
const idx = c.indexOf('id="download"');
if (idx >= 0) {
  const end = c.indexOf('id="faq"', idx);
  console.log(c.substring(idx, end));
}
