const fs = require('fs');
const c = fs.readFileSync('M:/new/website/index.html', 'utf8');
const m = c.match(/id="features"[\s\S]*?id="pricing"/);
if (m) console.log(m[0].slice(0, 4000));
