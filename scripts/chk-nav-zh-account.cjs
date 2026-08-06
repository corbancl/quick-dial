const c = require('fs').readFileSync('M:/new/website/account.html', 'utf8');
// Find nav area
const navEnd = c.indexOf('</nav>');
if (navEnd >= 0) console.log(c.substring(0, navEnd + 6));
