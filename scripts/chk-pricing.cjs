const fs = require('fs');
let c = fs.readFileSync('M:/new/website/index.html', 'utf8');
const start = c.indexOf('id="pricing"');
const end = c.indexOf('id="download"', start);
console.log(c.substring(start, end).substring(0, 2500));
