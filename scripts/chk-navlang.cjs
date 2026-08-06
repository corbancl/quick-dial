const c = require('fs').readFileSync('M:/new/website/en-account.html', 'utf8');
const i = c.indexOf('nav-lang');
console.log(c.substring(i, i + 90));
