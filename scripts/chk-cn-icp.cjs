const c = require('fs').readFileSync('M:/new/website/account.html', 'utf8');
const i = c.indexOf('鲁ICP');
if (i >= 0) console.log('ICP: ' + c.substring(i - 20, i + 40));
const j = c.indexOf('鲁公网安');
if (j >= 0) console.log('GONGAN: ' + c.substring(j - 20, j + 60));
