const fs = require('fs');
const c = fs.readFileSync('M:/new/website/en.html', 'utf8');

// Show context around "13 engines"
const idx = c.indexOf('13 engines');
console.log(c.substring(idx-50, idx+80));
console.log('---');
const idx2 = c.indexOf('13 Engines');
if (idx2 >= 0) console.log(c.substring(idx2-50, idx2+80));
