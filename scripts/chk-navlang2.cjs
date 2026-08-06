const c = require('fs').readFileSync('M:/new/website/en-account.html', 'utf8');
// Find the button, not the CSS class
const re = /<button class="nav-lang"/g;
let m;
while ((m = re.exec(c)) !== null) {
  console.log(c.substring(m.index, m.index + 90));
}
