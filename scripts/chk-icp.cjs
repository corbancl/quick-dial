const c = require('fs').readFileSync('M:/new/website/en-account.html', 'utf8');
// Find footer filing section
const i = c.indexOf('鲁公网安');
if (i >= 0) console.log(c.substring(i - 50, i + 60));
// Also find 鲁ICP
const j = c.indexOf('鲁ICP');
if (j >= 0) console.log(c.substring(j - 50, j + 40));
