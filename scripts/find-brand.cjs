const c = require('fs').readFileSync('M:/new/website/en.html', 'utf8');
const idx = c.indexOf('呲啦起始页');
if (idx >= 0) console.log(c.substring(idx - 30, idx + 30));
