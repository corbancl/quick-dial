const fs = require('fs');
const c = fs.readFileSync('M:/new/website/en.html', 'utf8');
const start = c.indexOf('id="download"');
const end = c.indexOf('id="', start + 20);
console.log(c.substring(start, end > 0 ? end : start + 3000).substring(0, 3000));
