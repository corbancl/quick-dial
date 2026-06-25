const fs = require('fs');
const c = fs.readFileSync('M:/new/website/index.html', 'utf8');
const start = c.indexOf('class="download-cards"');
const end = c.indexOf('<!-- FAQ -->');
console.log(c.substring(start, end));
