const c = require('fs').readFileSync('M:/new/website/account.html', 'utf8');
const i = c.indexOf('<div class="footer"');
if (i >= 0) console.log(c.substring(i, i + 500));
